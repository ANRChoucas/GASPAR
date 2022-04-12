//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
// choucas_itemtree.js: The functionality for the item tree
//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
var hoverActive = false;
var disableFilterUpdate = false;
var formatOSMXML = new ol.format.OSMXML();
var parentNodeMap = {};
var overpassQueryUrl = null;

//-----------------------------------------------------------------------------
// Use the fancy tree library to create the item tree 
//-----------------------------------------------------------------------------
$(function(){
  // Attach the fancytree widget to an existing <div id="tree"> element
  // and pass the tree options as an argument to the fancytree() function:
  $("#tree").fancytree({
    checkbox: true,
    selectMode: 3,
    extensions: ["filter"],
    autoScroll: false,
    quicksearch: true,
    source: [],
    filter: {
      autoApply: true,   // Re-apply last filter if lazy data is loaded
      autoExpand: true,  // Expand all branches that contain matches while filtered
      counter: true,     // Show a badge with number of matching child nodes near parent icons
      fuzzy: false,      // Match single characters in order, e.g. "fb" will match "FooBar"
      hideExpandedCounter: true,  // Hide counter badge if parent is expanded
      hideExpanders: false,       // Hide expanders if all child nodes are hidden by filter
      highlight: true,   // Highlight matches by wrapping inside <mark> tags
      leavesOnly: false, // Match end nodes only
      nodata: true,      // Display a "no data" status node if result is empty
      mode: "hide"       // Grayout unmatched nodes (pass "hide" to remove unmatched node instead "dimm" to grey out non matches)
    },
    //Activate Event: whenever the keyboard arrows hover over a node
    activate: function(event, data) {
      treeNodeHoverEnd();
      treeNodeHoverStart(data.node);
    },
    //Select Event: whenever a node is selected or deselected
    select: function(event, data){
      if(!disableFilterUpdate) {
        if(selectedFilter == "Filter1") { setPrompt(1); } else { setPrompt(7); }

        if(data.node.selected) { choucasLog("Node Selected: filter=" + selectedFilter + ", nodeName=" + data.node.title + ", isFolder=" + data.node.isFolder() + ", nodeRef=" + data.node.data.itemRef) } 
        else { choucasLog("Node deselected: filter=" + selectedFilter + ", nodeName=" + data.node.title + ", isFolder=" + data.node.isFolder() + ", nodeRef=" + data.node.data.itemRef); }

        logFilter(selectedFilter);
        calculateFilterName();
        updateZoneForCurrentFilter();
      }    
    },
    //Click Event: when the user clicks on the name of a node (instead of the checkbox or expander)
    click: function(event, data){ 
      if (data.targetType === "title") {
        data.node.toggleSelected();
        data.node.toggleExpanded();
      }
    }
  //Mouseover Events: when the user hovers over a node
  }).on("mouseenter", ".fancytree-title", function(event){
    treeNodeHoverStart($.ui.fancytree.getNode(event))
  }).on("mouseleave", ".fancytree-title", function(event){
    treeNodeHoverEnd();
  });
});

//-----------------------------------------------------------------------------
// Calculate Filter Name
//-----------------------------------------------------------------------------
function calculateFilterName() {
  var selectedNodes = $("#tree").fancytree("getTree").getSelectedNodes();
  if(selectedNodes.length == 0) {
    $("#" + selectedFilter).find("td").eq(3).find("input").val("Select. objets ci-dessous");
  }
  if(selectedNodes.length == 1) {
    $("#" + selectedFilter).find("td").eq(3).find("input").val(selectedNodes[0].title);
  }
  if(selectedNodes.length > 1) {
    folderList = [];
    $("#tree").fancytree("getTree").getRootNode().visit(function(node) {
      if(node.extraClasses != "hide" && node.getChildren() != null && !node.getFirstChild().isFolder()) {
        if(node.isSelected()) {
          folderList.push("Tou. " + node.title);
        } else if(node.getSelectedNodes().length > 0) { 
          folderList.push(node.getSelectedNodes().length + " " + node.title)
        } 
      }
    });
    $("#" + selectedFilter).find("td").eq(3).find("input").val(folderList.join(","));
  }
}

//-----------------------------------------------------------------------------
// Show tree loading icon
//-----------------------------------------------------------------------------
function showTreeLoadingIcon(showLoadingIcon) {
  if(showLoadingIcon == true) {
    document.getElementById("treeLoadingIcon").classList.remove("hidden"); //Show the loading icon
  } else {
    document.getElementById("treeLoadingIcon").classList.add("hidden"); //Hide the loading icon
  }
}

//-----------------------------------------------------------------------------
// Hover over item
//-----------------------------------------------------------------------------
function treeNodeHoverStart(hovernode) {
  choucasLog("Tree node hover start: filter=" + selectedFilter + ", nodeName=" + hovernode.title + ", isFolder=" + hovernode.isFolder() + ", nodeRef=" + hovernode.data.itemRef);
  var nodes = [hovernode];
  hovernode.visit(function(n) {
    nodes.push(n);
  });

  $.each(nodes, function (event, node) {
    if(!node.isFolder()) {
      var item = objectMap[node.data.itemRef].clone();
      if(node.extraClasses != "hide") {
        styleItem(item,"hover");
      } else {
        styleItem(item,"hiddenInTree");
      }
      hoverSource.addFeature(item);
    } 
  });
    
  map.addLayer(hoverLayer);
  hoverActive = true;
}

//-----------------------------------------------------------------------------
// Hover over node end
//-----------------------------------------------------------------------------
function treeNodeHoverEnd() {
  if(hoverActive) {
    hoverSource.clear();
    map.removeLayer(hoverLayer);
  }
}

//-----------------------------------------------------------------------------
// Get current screen bounding box string for overpass query
//-----------------------------------------------------------------------------
function getCurrentScreenBoundingBoxString() {
  var boundingBox = map.getView().calculateExtent(map.getSize());
  boundingBox = ol.proj.transformExtent(boundingBox, ol.proj.get("EPSG:3857"), ol.proj.get("EPSG:4326"));
  boundingBoxString = boundingBox[1]+","+boundingBox[0]+","+boundingBox[3]+","+boundingBox[2];
  return boundingBoxString;
}

//-----------------------------------------------------------------------------
// Load the intial overpass items which the user can use to set the initial
// search area. Currently all cities, towns, villages
//-----------------------------------------------------------------------------
function loadInitialItems() {
  choucasLog("loadInitialItems()");

  //Load the initial items from a file for experiment reliability
  $.ajax({
    url: "initial_overpass_items.xml",
    dataType: "xml",
    success: function(result) {
      //Save the setup of the current filter and then clear / re-setup the tree
      selectedItemsPerFilter[selectedFilter] = getSelectedItemRefs();
      clearTextFilter();
      setupTreeFolders("showInitialFolders");
      var features = new ol.format.OSMXML().readFeatures(result, {featureProjection: map.getView().getProjection()}); 
      processItems(features);
    }
  });
  
  /*
  //It is also possible to load the initial maps items from overpass as below
  var overpassQueryUrl = "https://overpass-api.de/api/interpreter?data= \
    [bbox:"+ getCurrentScreenBoundingBoxString() +"]; \
    ( \
      node['place'='village']; \
      node['place'='town']; \
      node['place'='city']; \
      node['natural'='peak']; \
    ); \
    (._;>;); \
    out;";
  runOverpassQuery(overpassQueryUrl, "showInitialFolders");
  */
}

//-----------------------------------------------------------------------------
// Query overpass for the full set of choucas items in the current map view
//-----------------------------------------------------------------------------
function loadMapItemsFromOverpass() {
  choucasLog("loadMapItemsFromOverpass()");

  //If we are too far zoomed out the overpass Query will return a very large amount of data
  //Therefore for a quick solution just only allow the user to query overpass when zoomed in at level 12+ 
  var view = map.getView();
  choucasLog("Zoom Level: " + view.getZoom());
  if(view.getZoom() < 12) {
    choucasLog("Zoomed too far out to query overpass API");
    alert("Fenêtre trop grande pour interroger Overpass API, s'il vous plaît zoomer sur la carte");
    return;
  }

  //Create and run overpass query
  var overpassQueryUrl = "https://overpass-api.de/api/interpreter?data="+
    "[bbox:"+ getCurrentScreenBoundingBoxString() +"];"+
    "("+
    "  way['route'~'piste'];"+          // Ski pistes
    "  way['piste:difficulty'];"+       // Ski pistes
    "  way['aerialway'];"+              // Ski lifts
    "  node['aerialway'];"+             // Pylons top and bottom stations of ski lifts
    "  way['natural'='water'];"+        // Bodies of water, lakes etc
    "  relation['natural'='water'];"+   // Bodies of water, lakes etc
    "  way['landuse'='reservoir'];"+    // Resevoir
    "  node['natural'='peak'];"+        // Peaks
    "  node['natural'='saddle'];"+      // Cols
    "  way['highway'='path'];"+         // Walking paths
    "  way['highway'='track'];"+        // Walking tracks
    "  node['tourism'];"+               // Wilderness huts signposts
    "  node['tourism'='picnic_site'];"+ // Picnic table
    "  way['waterway'];"+               // Streams Rivers etc
    "  way['natural'='cliff'];"+        // Cliff
    "  way['landuse'='forest'];"+       // Forest
    "  way['highway'='primary'];"+      // Roads
    "  way['highway'='tertiary'];"+     // Roads
    "  way['highway'='secondary'];"+    // Roads
    "  way['highway'='unclassified'];"+ // Roads
    "  way['highway'='residential'];"+  // Roads
    "  way['power'='line'];"+           // Power Lines
    "  node['place'='village'];"+       // Village
    "  node['place'='town'];"+          // Town
    "  node['place'='city'];"+          // City
    "  node['tower:type'='communication'];"+ //Maybe mobile phone masts
    ");"+
    "(._;>;);"+
    "out;";
  runOverpassQuery(overpassQueryUrl,'showAllFolders');
}

//-----------------------------------------------------------------------------
// Run the given overpass query and load the returned items into the item tree
//-----------------------------------------------------------------------------
function runOverpassQuery(overpassQueryUrl, folderSetting) {
  choucasLog("runOverpassQuery()");
  choucasLog("Overpass Query: " + overpassQueryUrl.replace(/\s/g, ""));
  var queryStartTime = Date.now();
  showTreeLoadingIcon(true);
  
  //Process the XML reponse (Note: we are using the XML api as it avoided the complication of mapping json to geojson, downside is that xml file size is probably bigger)
  $.ajax({
    url: overpassQueryUrl,
    timeout: 120000, //timeout in ms (2 minutes)
    dataType: "xml", 
    error: function(jqXHR, textStatus){ 
      choucasLog("Timeout while calling the overpass API");
      alert("Overpass API délai dépasse. Veuillez réessayer");
      showTreeLoadingIcon(false);
      setPrompt(4);
    },
    success: function(result) {

      if(folderSetting =="showAllFolders") {
        setPrompt(4.5);
      }

      choucasLog("Overpass query response received in:", Date.now() - queryStartTime);
      var processingItemsStartTime = Date.now();

      //Save the setup of the current filter and then clear / re-setup the tree
      selectedItemsPerFilter[selectedFilter] = getSelectedItemRefs();
      clearTextFilter();
      setupTreeFolders(folderSetting); 

      var features = new ol.format.OSMXML().readFeatures(result, {featureProjection: map.getView().getProjection()}); 

      //Manually Process Multi Polygons (OSMXML Relations) and add them into the features array
      //They appeared to get missed out of the standard OSMXML processing
      var osmXmlRelations = result.firstChild.getElementsByTagName("relation");
      $.each(osmXmlRelations, function(event, osmXmlRelation) {
        //Processing OSMXML Relation (Multipolygon)
        //Record the polygon IDs that make up this osmXmlRelation
        var idForMultiPolygon = null;    
        var multiPolygonWays = {};
        var members = osmXmlRelation.getElementsByTagName("member");
        $.each(members, function(event, member) {
          osmWayId = "" + member.attributes["ref"].value;
          if(idForMultiPolygon == null) { idForMultiPolygon = osmWayId}
          multiPolygonWays[osmWayId] = null;
        });
        //Merge them all into a single Openlayer Multipolygon    
        multiPolyGeometry = new ol.geom.MultiPolygon();
        features.forEach(function(item) { 
          if(item.getId() in multiPolygonWays) {
            multiPolyGeometry.appendPolygon(item.getGeometry());
          }
        });
        var multiPolygon = new ol.Feature(multiPolyGeometry);
        //Set the ID of the multipolygon to just be the ID for the first osm way

        //Setting ID of multi polygon
        multiPolygon.setId(idForMultiPolygon);

        //Configure properties of the multipolygon
        var properties = {}
        var tags = osmXmlRelation.getElementsByTagName("tag");
        $.each(tags, function(event, tag) {
          properties[tag.attributes["k"].value] = tag.attributes["v"].value;
        });
        multiPolygon.setProperties(properties);
        //Finally add the multipolygon into the features array
        features.push(multiPolygon);    
      });

    //Now process all of the items and load them into the tree
    processItems(features);
    choucasLog("Finished Processing items in: " + ((Date.now() - processingItemsStartTime) / 1000) + "s");
  }});

}

//-----------------------------------------------------------------------------
// Setup the tree folders for either the initial items or all overpass item types
//-----------------------------------------------------------------------------
function setupTreeFolders(folderSetting) {

  $("#tree").fancytree("getTree").clear();
  var rootNode = $("#tree").fancytree("getRootNode");

  if(folderSetting == 'showInitialFolders') {
    var rootNode = $("#tree").fancytree("getRootNode");
    parentNodeMap["PEAK"] = rootNode.addChildren([{title: "Sommets", folder: true}]);
    parentNodeMap["URBAN"] = rootNode.addChildren([{title: "Villes", folder: true}]);
    parentNodeMap["CITY"] = parentNodeMap["URBAN"].addChildren([{title: "Grand Villes", folder: true}]);
    parentNodeMap["TOWN"] = parentNodeMap["URBAN"].addChildren([{title: "Villes", folder: true}]);
    parentNodeMap["VILLAGE"] = parentNodeMap["URBAN"].addChildren([{title: "Villages", folder: true}]);
  }
  if(folderSetting == 'showAllFolders') {
    parentNodeMap["COL"] = rootNode.addChildren([{title: "Cols", folder: true}]);
    parentNodeMap["WATER"] = rootNode.addChildren([{title: "Plan d'Eau", folder: true}]);
    parentNodeMap["LAKE"] = parentNodeMap["WATER"].addChildren([{title: "Lacs", folder: true}]);
    parentNodeMap["RESERVOIR"] = parentNodeMap["WATER"].addChildren([{title: "Réservoirs", folder: true}]);
    parentNodeMap["WATEROTHER"] = parentNodeMap["WATER"].addChildren([{title: "Petit", folder: true}]);
    parentNodeMap["RIVER"] = rootNode.addChildren([{title: "Rivières", folder: true}]);
    parentNodeMap["STREAM"] = rootNode.addChildren([{title: "Ruisseaus", folder: true}]);

  
    parentNodeMap["POWER"] = rootNode.addChildren([{title: "Lignes Electrique", folder: true}]);
    parentNodeMap["POWER6"] = parentNodeMap["POWER"].addChildren([{title: "6 Câbles", folder: true}]);
    parentNodeMap["POWER3"] = parentNodeMap["POWER"].addChildren([{title: "3 Câbles", folder: true}]);
    parentNodeMap["POWERO"] = parentNodeMap["POWER"].addChildren([{title: "Autre", folder: true}]);

    parentNodeMap["PISTE"] = rootNode.addChildren([{title: "Pistes", folder: true}]);
    parentNodeMap["PISTEGREEN"] = parentNodeMap["PISTE"].addChildren([{title: "Pistes Vert", folder: true}]);
    parentNodeMap["PISTEBLUE"] = parentNodeMap["PISTE"].addChildren([{title: "Pistes Blue", folder: true}]);
    parentNodeMap["PISTERED"] = parentNodeMap["PISTE"].addChildren([{title: "Pistes Rouge", folder: true}]);
    parentNodeMap["PISTEBLACK"] = parentNodeMap["PISTE"].addChildren([{title: "Pistes Noire", folder: true}]);

    parentNodeMap["PATHWAY"] = rootNode.addChildren([{title: "Randonnées", folder: true}]);
    parentNodeMap["SKILIFT"] = rootNode.addChildren([{title: "Remontées mécaniques", folder: true}]);
    parentNodeMap["ROAD"] = rootNode.addChildren([{title: "Routes", folder: true}]);
    parentNodeMap["PEAK"] = rootNode.addChildren([{title: "Sommets", folder: true}]);

    parentNodeMap["URBAN"] = rootNode.addChildren([{title: "Villes", folder: true}]);
    parentNodeMap["CITY"] = parentNodeMap["URBAN"].addChildren([{title: "Grand Villes", folder: true}]);
    parentNodeMap["TOWN"] = parentNodeMap["URBAN"].addChildren([{title: "Villes", folder: true}]);
    parentNodeMap["VILLAGE"] = parentNodeMap["URBAN"].addChildren([{title: "Villages", folder: true}]);

    parentNodeMap["MAST"] = rootNode.addChildren([{title: "Tours des téléphonie", folder: true}]);
  }

  $("#tree").fancytree("getRootNode").sortChildren(null, true);
}

function processItems(features) {
  //Process each item
  features.forEach(function(item) {

    var props = item.getProperties();
    
    if(props.natural == "saddle") { processItem(item, "COL"); }
    else if(props.landuse == "reservoir") { processItem(item, "RESERVOIR"); } 
    else if(props.waterway == "river" || props.waterway == "riverbank") { processItem(item, "RIVER"); }
    else if(props.waterway == "stream" ) { processItem(item, "STREAM"); }  
    else if(props.natural == "water" && props.water == "lake") { processItem(item, "LAKE"); }
    else if(props.natural == "water") { processItem(item, "WATEROTHER"); }
    else if(props.natural == "peak") { processItem(item, "PEAK"); } 
    else if(props.natural == "peak") { processItem(item, "PEAK"); } 
    else if(props.natural == "peak") { processItem(item, "PEAK"); } 
    else if(props["piste:type"] == "downhill" && props["piste:difficulty"] == "novice") { processItem(item, "PISTEGREEN"); }         
    else if(props["piste:type"] == "downhill" && props["piste:difficulty"] == "easy") { processItem(item, "PISTEBLUE"); }         
    else if(props["piste:type"] == "downhill" && props["piste:difficulty"] == "intermediate") {  processItem(item, "PISTERED"); }         
    else if(props["piste:type"] == "downhill" && props["piste:difficulty"] == "advanced") {  processItem(item, "PISTEBLACK"); }         
    else if(props.aerialway != null && props.aerialway != "pylon" && props.aerialway != "station") { processItem(item, "SKILIFT"); }
    else if(props.highway == "tertiary" || props.highway == "secondary" || props.highway == "primary" || props.highway == "unclassified" || props.highway == "residential") { processItem(item, "ROAD"); }
    else if(props.highway == "path" || props.highway == "track") { processItem(item, "PATHWAY"); }
    else if(props.place == "village") { processItem(item, "VILLAGE"); }
    else if(props.place == "town") { processItem(item, "TOWN"); }
    else if(props.place == "city") { processItem(item, "CITY"); }
    else if(props["tower:type"] == "communication") { processItem(item, "MAST"); }
    else if(props.power == "line" && props.cables == "6") { processItem(item, "POWER6"); }
    else if(props.power == "line" && props.cables == "3") { processItem(item, "POWER3"); }
    else if(props.power == "line") { processItem(item, "POWERO"); }
        
  });

  $("#tree").fancytree("getRootNode").sortChildren(null, true);

  showTreeLoadingIcon(false);

  if (selectedFilter == "Filter2") {
    $("#tree").removeClass("highlight");
    $("#promptBar").addClass("hidden");
    //creatingInitialZone = false;
  }

  disableFilterUpdate = true;
    selectItems(selectedItemsPerFilter[selectedFilter]);
  disableFilterUpdate = false;
}

//Helper function to process an individual item
function processItem(item, prefix) {
  var props = item.getProperties();
  if(props.name == null) {
    item.setProperties({"name": "Unamed " + prefix.toLowerCase() });
    props = item.getProperties();
  }
  //item.setProperties({"itemRef": prefix + "-" + objectIndex + "-" + props.name });
  item.setProperties({"itemRef": item.getId() });
  item.setProperties({"itemType": prefix });
  var props = item.getProperties();
  objectMap[props.itemRef] = item;
  var tmp = item.clone();
  tmp.getGeometry().transform("EPSG:3857", "EPSG:4326");
  var turfItem = format.writeFeatureObject(tmp);
  item.setProperties({"dataPoints": turf.explode(turfItem).features.length });
  //Simplify the turf representation of pathways to make buffer calculations quicker
  if(prefix == "PATHWAY") {  
    var options = {tolerance: 0.0002, highQuality: false};
    turfItem = turf.simplify(turfItem, options);
  }
  turfItemMap[props.itemRef] = turfItem;
  parentNodeMap[prefix].addChildren([{ title: props.name, itemRef: props.itemRef }]);
}

//-----------------------------------------------------------------------------
// ITEM TREE: Filter the tree to show only items in the current zone
//-----------------------------------------------------------------------------
function filterTreeToCurrentZone() {
  
  if(creatingInitialZone) {
    setPrompt(5);
  }

  showTreeLoadingIcon(true);

  setTimeout(function () { 

  var buff = parseFloat(document.getElementById("treeFilterToZoneBuffer").value);
  
  choucasLog("Filtering item tree to current zone with buffer " + buff + ", screen bounding box: " + getCurrentScreenBoundingBoxString() + " " + selectedFilter);

  var fc = turf.featureCollection(getZonesForAllScenarios());
  var combined = turf.combine(fc).features[0];
  var bufferedCurrentZone = turf.buffer(combined, buff, {units: "kilometres"});
  var zones = turf.flatten(bufferedCurrentZone).features;

  //Show Everything in the tree
  clearTreeZoneFilter();
 
  //Then hide all items that do not intersect with the current zone;
  if(zones.length > 0) {
    $("#tree").fancytree("getTree").visit(function(node){
      if(!node.isFolder()) {
        var itemIsRelevant = false;
        for (o = 0; o < zones.length; ++o) {
          var itemType = objectMap[node.data.itemRef].getGeometry().getType(); 
          if(itemType != "MultiPolygon" && zones[o].geometry.type != "MultiPolygon") {
            if( turf.booleanContains(zones[o], turfItemMap[node.data.itemRef]) ) {
              itemIsRelevant = true;
            } 
          }
          if(! turf.booleanDisjoint(turfItemMap[node.data.itemRef], zones[o]) ) {
            itemIsRelevant = true;
          }
        }
        if(!itemIsRelevant) {
          node.addClass("hide");
        }
      }
    });
  }
  showTreeLoadingIcon(false);
  }, 100);
}

function clearTreeZoneFilter() {
  choucasLog("clearTreeZoneFilter()");
  $("#tree").fancytree("getTree").visit(function(node){
    node.removeClass("hide");
  });
}

function setupTextFilterSearchbox () {
  //Link the searchbox to the fancy tree
  $("input[name=search]").keyup(function(e){
    searchTerm = $("input[name=search]").val().trim()
    choucasLog("Tree search box updated: " + selectedFilter + ", " + searchTerm);
    $("#tree").fancytree("getTree").filterBranches(searchTerm);      
  });
}

function clearTextFilter() {
  $("input[name=search]").val("");
  $("#tree").fancytree("getTree").clearFilter();
}

function collapseAllNodes() {
  $("#tree").fancytree("getRootNode").visit(function(node){
    node.setExpanded(false);
  });
}

function deselectAllNodes() {
  $("#tree").fancytree("getTree").visit(function(node){
    node.setSelected(false);
  });
}

//-----------------------------------------------------------------------------
// Return the item refs of all selected nodes 
//-----------------------------------------------------------------------------
function getSelectedItemRefs () {
  var selectedItemRefs = new Set();
  var selectedNodes = $("#tree").fancytree("getTree").getSelectedNodes();
  $.each(selectedNodes, function (event, node) {
    if(node.isSelected() && !node.isFolder() && node.extraClasses != "hide") {
      selectedItemRefs.add(node.data.itemRef);
    }
  });
  return Array.from(selectedItemRefs);
}

//-----------------------------------------------------------------------------
// Return the item refs of selected nodes however exclude the child nodes of a 
// fully selected folder
//-----------------------------------------------------------------------------
function getSelectedItemRefsConcise () {
  var selectedItemRefs = new Set();
  var selectedNodes = $("#tree").fancytree("getTree").getSelectedNodes();
  $.each(selectedNodes, function (event, node) {
    if(node.isFolder() && node.extraClasses != "hide" ) {
      selectedItemRefs.add(node.title);
    }
    if(!node.isFolder() && !node.parent.isSelected() && node.extraClasses != "hide") {
      selectedItemRefs.add(node.data.itemRef + "-" + node.title);
    }
  });
  return Array.from(selectedItemRefs);
}

//TODO: possible problem when an itemRef is included under two different folders, should be OSM ID + parent folder
//TODO: should setup a map of itemRef -> node
function selectItems(itemRefList) {
  $.each(itemRefList, function(event, itemRef) {
    $("#tree").fancytree("getRootNode").visit(function(node){
      if(node.data.itemRef == itemRef) {
        node.setSelected(true);
      }
    });
  });
}


//-----------------------------------------------------------------------------
// ITEM TREE: Load map items from file
// Note: this is triggered after 200ms so the tree can initialise first
//-----------------------------------------------------------------------------
/* The backup of loading items from a file is not neccessary as overpass API seems to be working well
function loadMapItemsFromFile() {
  $("#tree").fancytree("getTree").clear();
  setupTreeFolders();

  $.ajaxSetup({beforeSend: function(xhr){
    if (xhr.overrideMimeType)
    {
      xhr.overrideMimeType("application/json");
    }
  }});

  $.getJSON( "chamrousse_data.geojson",{}, function( obj ) {
    var features = format.readFeatures(obj);
    features.forEach(function(item) {
      item.getGeometry().transform("EPSG:4326", "EPSG:3857");
    });
    processItems(features);
  });
}
*/

