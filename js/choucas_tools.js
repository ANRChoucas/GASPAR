//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
// choucas_tools.js: General helper functionality that is not core to the
// choucas system
//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------

import {choucasLog} from './choucas_experiment.js';
import {selectedFilter} from './choucas_filtertable.js';

//-----------------------------------------------------------------------------
// Prompt functionality
//-----------------------------------------------------------------------------
var promptsEnabled = false;
var creatingInitialZone = false;
var bufferSelectedprompt = false;
var waitingForFilterActivation = false;
var currentPrompt = -1;


//We only give prompts for the last added filter
var promptsEnabledForFilter = "";
function setPromptsEnabledForFilter(filter) {
  promptsEnabledForFilter = filter;
  currentPrompt = -1;
}


function enablePrompts() {
  promptsEnabled = true;
}

function promptsToggle() {
  choucasLog("Prompts Toggle: " + document.getElementById("promptsEnabled").value);
  if(document.getElementById("promptsEnabled").value == "Yes") {
    $("#promptBar").removeClass("hidden");
    enablePrompts();
    setPrompt(0);
    promptsStarted = true;
    promptsEnabled = true;
  } else {
    promptsEnabled = false;
    $("#treeSearchBox").removeClass("highlight");
    $("#tree").removeClass("highlight");
    $("#promptBar").addClass("hidden");
  }
}

//-----------------------------------------------------------------------------
// Set Prompt
//
// When we are dealing with the first filter we are setting the initial search zone
// 0: Pick point of departure from the tree
// 1: Utilise the buffer to define the initial search zone
// 2: Activate the zone for the scenario
// 3: Zoom to the initial search zone
// 4: Load OSM Objects
// 4.5 Filter the item tree
// 5: Add Filter
//
// Then the next prompts loop round as each criteria is added
// 6: Select relevant objects in the tree
// 7: Set the buffer to define zone
// 8: Activate the zone for the scenario
// 9: Add Filter
// Then loop back round to 6
//-----------------------------------------------------------------------------
function setPrompt(promptNumber) {

 choucasLog("setPrompt() oldPrompt="+ currentPrompt +", newPrompt="+ promptNumber);

 if(promptsEnabledForFilter == selectedFilter && promptNumber > currentPrompt ) {

  $("#treeSearchBox").removeClass("highlight");
  $("#tree").removeClass("highlight");
  $("#addFilter").removeClass("highlight");
  $("#zoomToZone").removeClass("highlight");
  $("#loadMapObjects").removeClass("highlight");
  $("#filterTreeToZone").removeClass("highlight");
  //Should I loop through all filters here
  $("#bufferInput" + selectedFilter).removeClass("highlight");

  //If prompts are not enabled then no action required
  if(!promptsEnabled) { return; }

  currentPrompt = promptNumber;

  if (promptNumber == 0) {
    document.getElementById("promptBar").innerHTML = "Sélectionnez un point de départ dans l'arbre";
    $("#treeSearchBox").addClass("highlight");
    $("#tree").addClass("highlight");
    creatingInitialZone = true;
  }
  if (promptNumber == 1) {
    $("#promptBar").text("Utilisez le champ Buffer pour définir la zone initiale");
    $("#bufferInput" + selectedFilter).addClass("highlight");
    setTimeout(function() { bufferSelectedPrompt = true; }, 200);
  }
  if (promptNumber == 2) {
    if (bufferSelectedPrompt) {
      $("#promptBar").text("Activer la zone pour la scénario");
      $("#" + selectedFilter).find("td").eq(6).css("border", "2px solid red");
    }
    bufferSelectedPrompt = false;
  }
  if (promptNumber == 3) {
    $("#promptBar").text("Cliquez 'Zoom sur le zone actuelle'");
    $("#zoomToZone").addClass("highlight");
    $("#" + selectedFilter).find("td").eq(6).css("border", "");
  }
  if (promptNumber == 4) {
    if(creatingInitialZone) {
      $("#promptBar").text("Cliquez 'Charger des objets OSM'");
      $("#loadMapObjects").addClass("highlight");
    }
  }
  if (promptNumber == 4.5) {
    if(creatingInitialZone) {
      $("#promptBar").text("Cliquez 'Filtrer l'arbre pour zone actuelle'");
      $("#filterTreeToZone").addClass("highlight");
    }
  }
  if (promptNumber == 5) {
    $("#promptBar").text("Ajouter le filtre suivant");
    $("#addFilter").addClass("highlight");
    //If we were creating the initial zone and we click add filter we are no longer creating the initial zone
    if(creatingInitialZone == true) { creatingInitialZone = false }
    $("#" + selectedFilter).find("td").eq(6).css("border", "");
  }
  if (promptNumber == 6) {
    $("#promptBar").text("Sélectionnez les objets pertinents pour ce filtre");
    $("#treeSearchBox").addClass("highlight");
    $("#tree").addClass("highlight");
  }
  if (promptNumber == 7) {
    $("#promptBar").text("Utilisez le champ Buffer pour définir la zone");
    $("#bufferInput" + selectedFilter).addClass("highlight");
    setTimeout(function() { bufferSelectedPrompt = true; }, 200);
  }
  if (promptNumber == 8) {
    if (bufferSelectedPrompt) {
      $("#promptBar").text("Activer la zone pour la scénario");
      $("#bufferInput" + selectedFilter).removeClass("highlight");
      $("#" + selectedFilter).find("td").eq(6).css("border", "2px solid red");
      waitingForFilterActivation = true;
    }
    bufferSelectedPrompt = false;
  }
  if (promptNumber == 9 && waitingForFilterActivation) {
    waitingForFilterActivation = false;
    $("#promptBar").text("Ajouter le filtre suivant");
    $("#addFilter").addClass("highlight");
    $("#" + selectedFilter).find("td").eq(6).css("border", "");
  }
 }
}


//-----------------------------------------------------------------------------
// IGN Isochrone Service Test
//-----------------------------------------------------------------------------

/* Code for using the IGN isochrone service - This is disabled for the experiment to keep things simple
function isochrone() {
  $.ajax({
    url: getIGNURL() + "isochrone/isochrone.json?location=6.030,45.052&method=Time&graphName=Pieton&exclusions=&time=10800&holes=false&smoothing=true",
    dataType: "jsonp",
    success: function(data) {
      var format = new ol.format.WKT();
      var feature = format.readFeature(data.wktGeometry, {
        dataProjection: "EPSG:4326",
        featureProjection: "EPSG:3857"
      });
      vectorSource.addFeature(feature);
      map.addLayer(vectorLayer);
    }
  });
}
*/


//-----------------------------------------------------------------------------
// USER INTERFACE KEYBOARD SHORTCUTS
// These keyboard shorcuts allows the following user workflow:
// 1. Type item search textbox, ENTER to move onto the item tree
// 2. Use arrow keys and spacebar to select items in the tree, ENTER to move onto filter settings
// 3. Use up down arrow keys to set the buffer distance, ENTER to finalise the filter
//-----------------------------------------------------------------------------

/* Keyboard shortcuts are disabled for the experimenet - Just to keep things simple and avoid confusion
document.onkeydown = checkKey;
function checkKey(e) {
  e = e || window.event;
  var tree = $("#tree").fancytree("getTree");

  //If the focus is on the searchbox and user presses tab(9) or down arrow(40) -> switch focus to the tree
  if ($("#treeSearchBox").is(":focus")) {
    if (e.keyCode == "9" || e.keyCode == "40") {
      tree.setFocus();
      e.stopPropagation();
      e.preventDefault();
    }
  }

  //If the focus is on the tree
  else if (tree.hasFocus()) {
    if(e.keyCode == "9" || e.keyCode == "13") { //User presses tab(9) or enter(13) -> switch focus to buffer
      $("#" + selectedFilter).find("td").eq(4).find("input").select();
      treeNodeHoverEnd();
      e.stopPropagation();
      e.preventDefault();
      return;
    }
    if(e.keyCode == "70") { //User presses F -> filter tree for current zone
      filterTreeToCurrentZone();
    }
    if(e.keyCode == "82") { //User presses R -> remove filter from tree
      clearTreeZoneFilter();
    }
  }

  //If user press enter add a new filter
  if( e.keyCode == "13" && $("#bufferInput" + selectedFilter).is(":focus") ){
    addFilter();
  }
}
*/


export {setPrompt};
