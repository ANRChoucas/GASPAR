//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
// choucas_filtertable.js: The functionality for the filter table
//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------

//Variables that hold the state of the table
var filterIndex = 0;
var selectedFilter = "";
var selectedItemsPerFilter = {};
var selectedItemsPerFilterConcise = {};
var objectMapLayersForEachFilter = {}; //key=filterID, value=map layer which contains all the objects for each filter
var zoneMapLayersForEachFilter = {};   //key=filterID, value=map layer which contains all the objects zones for each filter
var numberOfHypotheses = 0;
var filterObjectsEnabled = {};
var filterZonesEnabled = {};
var hypothesesEnabled = {}; //Whether each hypothesis is enabled or disabled
var showAllObjects = true;
var showAllZones = true;

//-----------------------------------------------------------------------------
// Initialise table
//-----------------------------------------------------------------------------
function initialiseTable() {
  choucasLog("initialiseTable()");

  //Initialise Variables
  filterIndex = 0;
  selectedFilter = "";
  selectedItemsPerFilter = {};
  selectedItemsPerFilterConcise = {};
  objectMapLayersForEachFilter = {};
  zoneMapLayersForEachFilter = {};
  numberOfHypotheses = 0;
  filterObjectsEnabled = {};
  filterZonesEnabled = {};
  hypothesesEnabled = {};
  showAllObjects = true;
  showAllZones = true;

  //Write table header rows
  document.getElementById("filterTable").innerHTML = ' \
    <table id="filterZonesTable">\
      <tr> \
        <th colspan="1"></th> \
        <th colspan="2">Afficher</th> \
        <th colspan="3">Filtres</th> \
        <th colspan="10">Scénarios</th> \
      </tr> \
      <tr> \
        <th></th> \
        <th style="padding: 0px;" onclick="toggleAllObjects()">Obj</th> \
        <th style="padding: 0px;" onclick="toggleAllZones()">Zon</th> \
        <th style="width: 125px;">Description</th> \
        <th style="width: 55px;">Buff <span style="font-size: 10px;">km</span></th> \
        <th style="width: 55px;">Dist <span style="font-size: 10px;">km</span></th> \
      </tr> \
    </table>';
}

//-----------------------------------------------------------------------------
// Add a new filter
//-----------------------------------------------------------------------------
function addFilter() {
  filterIndex = filterIndex + 1;
  filterID = "Filter" + filterIndex;
  choucasLog("Adding a new filter: " + filterID);

  setPromptsEnabledForFilter(filterID);

  //Initialise data structures for the new filter
  selectedItemsPerFilter[filterID] = [];
  selectedItemsPerFilterConcise[filterID] = [];
  filterObjectsEnabled[filterID] = true;
  filterZonesEnabled[filterID] = true;

  //Create map layers for the new filter
  objectMapLayersForEachFilter[filterID] = new ol.layer.Vector({
	  id: "object_of_interest_" + filterID,
    source: new ol.source.Vector({})
  });
  map.addLayer(objectMapLayersForEachFilter[filterID]);
  zoneMapLayersForEachFilter[filterID] = new ol.layer.Vector({
    source: new ol.source.Vector({})
  });
  //TODO
  map.addLayer(zoneMapLayersForEachFilter[filterID]);

  //Add the new filter row HTML
  var row = document.getElementById("filterZonesTable").insertRow(-1);
  row.id = filterID;
  row.className = "selected-filter-row";
  var cellControls = row.insertCell();
  cellControls.innerHTML = '<button type="button" onclick="deleteFilter(this)" style="font-size: 11px; padding: 0px;">x</button>'
    //Filter order controls are not added for the experiment as they are not really needed in the experiment scenario
    cellControls.innerHTML += '<button type="button" onclick="moveRowUp(this)" class="up" style="font-size: 11px; padding: 0px;">&uarr;</button>'
    cellControls.innerHTML += '<button type="button" onclick="moveRowDown(this)" class="down" style="font-size: 11px; padding: 0px;">&darr;</button>'
  row.insertCell().innerHTML = '<input id="' + filterID + 'DisplayObjects" type="checkbox" checked onclick="toggleFilterObjects(\'' + filterID + '\')">';
  row.insertCell().innerHTML = '<input id="' + filterID + 'DisplayZones" type="checkbox" checked onclick="toggleFilterZones(\'' + filterID + '\')">';
  row.insertCell().innerHTML = '<input onclick="selectFilter(\'' + filterID + '\')" style="width: 175px;" value="Select. objets ci-dessous"></input>'
  row.insertCell().innerHTML = '<input id="bufferInput' + filterID + '" type="number" step="0.1" min="0" value="" style="width: 52px;" onfocus="selectFilter(\''+ filterID +'\')" onchange="bufferChanged(\''+ filterID +'\')" onkeyup="bufferChanged(\''+ filterID +'\')"></input><br/>';
  row.insertCell().innerHTML = '<input id="distanceInput' + filterID + '" type="number" step="0.1" min="0" value="" style="width: 52px;" onclick="selectFilter(\''+ filterID +'\')" onchange="distanceChanged(\''+ filterID +'\')">';
  for(var i = 1; i <= numberOfHypotheses; i++) {
    row.insertCell().innerHTML = '<input id="zone' + i + '" type="checkbox" value="' + filterID + '" onclick="checkboxChanged(\''+ filterID +'\',\'scenario'+ i +'\')">';
  }

  $("#treeSearchBox").focus();
  selectFilter(filterID);

  //If this is Filter 1 then we are defining the initial zone, which requires a different prompt to be shown to adding a normal filter
  if(selectedFilter == "Filter1") { setPrompt(0); } else { setPrompt(6); }
}

function bufferChanged(filter) {
  choucasLog("bufferChanged() "+ filter +", " + document.getElementById("bufferInput" + filter).value);
  if(selectedFilter == "Filter1") { setPrompt(2); } else { setPrompt(8); }
  selectFilter(filter);
  logFilter(filter);
  updateZoneForCurrentFilter();
}

function distanceChanged(filter) {
  choucasLog("distanceChanged() "+ filter +", " + document.getElementById("distanceInput" + filter).value);
  selectFilter(filter);
  logFilter(filter);
  updateZoneForCurrentFilter();
}

function checkboxChanged(filter,scenario) {
  choucasLog("checkboxChanged() " + filter + ", " + scenario);
  recalcZones();
  if(selectedFilter == "Filter1") { setPrompt(3); } else { setPrompt(9); }
}

//-----------------------------------------------------------------------------
// Select a filter - once selected it can be edited
//-----------------------------------------------------------------------------
function selectFilter(filterToSelect) {
  choucasLog("selectFilter(" + filterToSelect + ")");

  //Save the setup of the previously selected filter
  if(selectedFilter != "") {
    selectedItemsPerFilter[selectedFilter] = getSelectedItemRefs("#tree");
    selectedItemsPerFilterConcise[selectedFilter] = getSelectedItemRefsConcise("#tree");
  }

  //Reset the tree
  disableFilterUpdate = true;
  clearTextFilter("#tree");
  deselectAllNodes("#tree");
  collapseAllNodes("#tree");
  selectItems(selectedItemsPerFilter[filterToSelect]);
  disableFilterUpdate = false;

  //Now set up the newly selected filter
  selectedFilter = filterToSelect;
  for (var i = 0, row; row = document.getElementById("filterZonesTable").rows[i]; i++) { row.className = ""; }
  $("#" + selectedFilter).addClass("selected-filter-row");
}

//-----------------------------------------------------------------------------
// Delete a filter
//-----------------------------------------------------------------------------
function deleteFilter(delButtonRef) {
  var filterToDelete = delButtonRef.parentNode.parentNode.id;
  var rowIndex = delButtonRef.parentNode.parentNode.rowIndex;
  choucasLog("Deleting " + filterToDelete + " from filter table row " + rowIndex);

  //If there is more that 1 filter then it is ok to delete this filter
  var rows = document.getElementById("filterZonesTable").rows;
  if (rows.length > 3) {
    if(rowIndex == 2) { selectFilter(rows[rowIndex + 1].id); }
    else { selectFilter(rows[rowIndex - 1].id); }
    document.getElementById("filterZonesTable").deleteRow(rowIndex);
    map.removeLayer(objectMapLayersForEachFilter[filterToDelete]);
    map.removeLayer(zoneMapLayersForEachFilter[filterToDelete]);
    delete objectMapLayersForEachFilter[filterToDelete];
    delete zoneMapLayersForEachFilter[filterToDelete];
    recalcZones();
  }
}

//-----------------------------------------------------------------------------
// Move filter row up
//-----------------------------------------------------------------------------
function moveRowUp(cell) {
  choucasLog("Moving Row Up");
  var row = $(cell).parents("tr:first");
  if(row.index() > 2) {
    row.insertBefore(row.prev());
  }
}

//-----------------------------------------------------------------------------
// Move filter row down
//-----------------------------------------------------------------------------
function moveRowDown(cell) {
  choucasLog("Moving Row Down");
  var row = $(cell).parents("tr:first");
  row.insertAfter(row.next());
}

//-----------------------------------------------------------------------------
// Toggle show objects for a filter
//-----------------------------------------------------------------------------
function toggleFilterObjects(filter) {
  choucasLog("toggleFilterObjects("+filter+")");
  filterObjectsEnabled[filter] =  !filterObjectsEnabled[filter];
  if(filterObjectsEnabled[filter]) {
    map.addLayer(objectMapLayersForEachFilter[filter])
  } else {
    map.removeLayer(objectMapLayersForEachFilter[filter])
  }
}

//-----------------------------------------------------------------------------
// Toggle show objects for all filters
//-----------------------------------------------------------------------------
function toggleAllObjects() {
  choucasLog("toggleAllObjects()");
  showAllObjects = !showAllObjects;
  $.each(filterObjectsEnabled, function(key, value) {
    if(filterObjectsEnabled[key] != showAllObjects)  {
      $("#"+ key +"DisplayObjects").prop("checked", showAllObjects);
      toggleFilterObjects(key);
    }
  });
}

//-----------------------------------------------------------------------------
// Toggle show zones for a filter
//-----------------------------------------------------------------------------
function toggleFilterZones(filter) {
  choucasLog("toggleFilterZones("+filter+")");
  filterZonesEnabled[filter] =  !filterZonesEnabled[filter];
  if(filterZonesEnabled[filter]) {
    map.addLayer(zoneMapLayersForEachFilter[filter])
  } else {
    map.removeLayer(zoneMapLayersForEachFilter[filter])
  }
}

//-----------------------------------------------------------------------------
// Toggle show zones for all filters
//-----------------------------------------------------------------------------
function toggleAllZones() {
  choucasLog("toggleAllZones()");
  showAllZones = !showAllZones;
  $.each(filterZonesEnabled, function(key, value) {
    if(filterZonesEnabled[key] != showAllZones)  {
      $("#"+ key +"DisplayZones").prop("checked", showAllZones);
      toggleFilterZones(key);
    }
  });
}

//-----------------------------------------------------------------------------
// Add a new Scenario
//-----------------------------------------------------------------------------
function addScenario() {
  numberOfHypotheses += 1;
  choucasLog("Add Scenario: " + numberOfHypotheses);

  var rowIndex = 0;
  var rows = document.getElementById("filterZonesTable").rows

  var headerCell = rows[1].insertCell();
  headerCell.id = "hypothesis" + numberOfHypotheses;
  headerCell.innerHTML = '<div onclick="toggleHypothesis(' + numberOfHypotheses + ')">' + numberOfHypotheses + "</div>";
  headerCell.style.backgroundColor = "rgba(" + colorToRGB(hypothesisToColor[numberOfHypotheses]) + ", 0.4)";
  headerCell.style.width = "25px";
  headerCell.style.fontWeight = "bold";

  for(var i = 2; i <= rows.length - 1; i++) {
    var row = rows[i]
    row.insertCell().innerHTML = '<input id="zone' + numberOfHypotheses + '" type="checkbox" value="' + row.id + '" onclick="recalcZones();">';
  }

  hypothesesEnabled[numberOfHypotheses] = true;

  $("#hypothesisNumber").append($("<option>", {value:numberOfHypotheses, text:numberOfHypotheses}));
  setTimeout( function() { map.updateSize();}, 200);
}

//-----------------------------------------------------------------------------
// Enable / disable a hypothesis on the map
//-----------------------------------------------------------------------------
function toggleHypothesis(hypothesisNumber) {
  choucasLog("toggleHypothesis("+ hypothesisNumber +")");
  var hypHeader = document.getElementById("hypothesis" + hypothesisNumber);
  if(hypHeader.style.backgroundColor == "grey") {
    hypothesesEnabled[hypothesisNumber] = true;
    hypHeader.style.backgroundColor = "rgba(" + colorToRGB(hypothesisToColor[hypothesisNumber]) + ", 0.4)";
  }
  else {
    hypothesesEnabled[hypothesisNumber] = false;
    hypHeader.style.backgroundColor = "grey";
  }
  refreshMapItems();
  recalcZones();
}

//-----------------------------------------------------------------------------
// Change hypothesis color control - select hypothesis number
//-----------------------------------------------------------------------------
function changeHypothesisNumber () {
  var hypNumber = parseFloat(document.getElementById("hypothesisNumber").value);
  choucasLog("Change Hypothesis Colour Control - Hypothesis Number " + hypNumber);
  $("#hypothesisColor option[value=" + hypothesisToColor[hypNumber] + "]").prop("selected",true);
}

//-----------------------------------------------------------------------------
// Change hypothesis color control - set hypothesis color
//-----------------------------------------------------------------------------
function changeHypothesisColor () {
  var hypNumber = parseFloat(document.getElementById("hypothesisNumber").value);
  var color = document.getElementById("hypothesisColor").value;
  choucasLog("Change Hypothesis Colour Control - Hypothesis " + hypNumber + ", color: " + color);
  hypothesisToColor[hypNumber] = color;
  var hypHeader = document.getElementById("hypothesis" + hypNumber);
  hypHeader.style.backgroundColor = "rgba(" + colorToRGB(hypothesisToColor[hypNumber]) + ", 0.4)";
  refreshMapItems();
  updateZoneForCurrentFilter();
}

export {objectMapLayersForEachFilter,
	zoneMapLayersForEachFilter,
	selectedItemsPerFilter,
	selectedFilter};
