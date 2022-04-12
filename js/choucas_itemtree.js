//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
// choucas_itemtree.js: The functionality for the item tree
//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------

import {choucasLog} from './choucas_experiment.js';
import {selectedItemsPerFilter,selectedFilter} from './choucas_filtertable.js';
//import {map,
//	objectMap,
//	format,
//	turfItemMap,
//	hoverSource,
//	vectorSource,
//	hoverLayer} from './choucas.js';
import {map_1,
	map_2,
	map_3,
	map_4,
	objectMap,
	format,
	turfItemMap,
	hoverSource,
	vectorSource,
	hoverLayer} from './choucas.js';
import {add_object_of_interest_on_hover_to_map} from './map_element.js';
import {styleItem} from "./choucas_styling.js";
import {setPrompt} from "./choucas_tools.js";
import {add_object_of_interest_to_map} from "./map_element.js";
import {app} from "./clue_element.js";


var hoverActive = false;
var disableFilterUpdate = false;
var formatOSMXML = new ol.format.OSMXML();
var parentNodeMap = {};
var overpassQueryUrl = null;

var problem_counter = 0;

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
    	  //TODO changement par rapport à matthew; stockage des éléments dans une même layer, avec un id
//        if(selectedFilter == "Filter1") { setPrompt(1); } else { setPrompt(7); }
//
//        if(data.node.selected) { choucasLog("Node Selected: filter=" + selectedFilter + ", nodeName=" + data.node.title + ", isFolder=" + data.node.isFolder() + ", nodeRef=" + data.node.data.itemRef) }
//        else { choucasLog("Node deselected: filter=" + selectedFilter + ", nodeName=" + data.node.title + ", isFolder=" + data.node.isFolder() + ", nodeRef=" + data.node.data.itemRef); }
//
//        logFilter(selectedFilter);
//        calculateFilterName("#tree");
//        updateZoneForCurrentFilter();


    	  add_object_of_interest_to_map();


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
function calculateFilterName(tree_object) {
  var selectedNodes = $(tree_object).fancytree("getTree").getSelectedNodes();
  if(selectedNodes.length == 0) {
    $("#" + selectedFilter).find("td").eq(3).find("input").val("Select. objets ci-dessous");
  }
  if(selectedNodes.length == 1) {
    $("#" + selectedFilter).find("td").eq(3).find("input").val(selectedNodes[0].title);
  }
  if(selectedNodes.length > 1) {
    folderList = [];
    $(tree_object).fancytree("getTree").getRootNode().visit(function(node) {
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
  //TODO small multiple
  for(var p = 0; p < app.map_collection.length; p++){
		switch (app.map_collection[p].map) {
		  case 'map_1':
			  map_1.addLayer(hoverLayer);
			  break;
		  case 'map_2':
			  map_2.addLayer(hoverLayer);
			  break;
		  case 'map_3':
			  map_3.addLayer(hoverLayer);
			  break;
		  case 'map_4':
			  map_4.addLayer(hoverLayer);
			  break;
		  default:
			  break;
		}
	}

  hoverActive = true;
}

//-----------------------------------------------------------------------------
// Hover over node end
//-----------------------------------------------------------------------------
function treeNodeHoverEnd() {
  if(hoverActive) {
    hoverSource.clear();
  //TODO small multiple
    for(var p = 0; p < app.map_collection.length; p++){
  		switch (app.map_collection[p].map) {
  		case 'map_1':
  			map_1.removeLayer(hoverLayer);
  			   break;
  		case 'map_2':
  			map_2.removeLayer(hoverLayer);
  			   break;
  		case 'map_3':
  			map_3.removeLayer(hoverLayer);
  			   break;
  		case 'map_4':
  			map_4.removeLayer(hoverLayer);
  			   break;
  		default:

  		}
  	}
  }
}

//-----------------------------------------------------------------------------
// Get current screen bounding box string for overpass query
//-----------------------------------------------------------------------------
function getCurrentScreenBoundingBoxString(feature_box) {
	//TODO small multiple
  var boundingBox;
  if(feature_box != null){
	  boundingBox = feature_box.getSource().getExtent();
  } else {
	  boundingBox = map_1.getView().calculateExtent(map_1.getSize());
  }

  boundingBox = ol.proj.transformExtent(boundingBox, ol.proj.get("EPSG:3857"), ol.proj.get("EPSG:4326"));
  var boundingBoxString = boundingBox[1]+","+boundingBox[0]+","+boundingBox[3]+","+boundingBox[2];
  return boundingBoxString;
}

//-----------------------------------------------------------------------------
// Load the intial overpass items which the user can use to set the initial
// search area. Currently all cities, towns, villages
//-----------------------------------------------------------------------------
function loadInitialItems(object) {
//  choucasLog("loadInitialItems()");
//
//  //Load the initial items from a file for experiment reliability
//  $.ajax({
//    url: "xml/initial_overpass_items.xml",
//    dataType: "xml",
//    success: function(result) {
//      //Save the setup of the current filter and then clear / re-setup the tree
//      selectedItemsPerFilter[selectedFilter] = getSelectedItemRefs("#tree");
//      clearTextFilter(object);
//      setupTreeFolders("showInitialFolders",object);
//      var features = new ol.format.OSMXML().readFeatures(result, {featureProjection: map.getView().getProjection()});
//      processItems(features,"#tree");
//      }
//  });
	//TODO small multiple
	 choucasLog("loadInitialItems()");

	  //Load the initial items from a file for experiment reliability
	  $.ajax({
	    url: "xml/initial_overpass_items.xml",
	    dataType: "xml",
	    success: function(result) {
	      //Save the setup of the current filter and then clear / re-setup the tree
	      selectedItemsPerFilter[selectedFilter] = getSelectedItemRefs(object);
	      clearTextFilter(object);
	      setupTreeFolders("showInitialFolders",object);
	      var features;
	    //TODO small multiple
	      for(var p = 0; p < app.map_collection.length; p++){
	    		switch (app.map_collection[p].map) {
	    		  case 'map_1':
	    			  features = new ol.format.OSMXML().readFeatures(result, {featureProjection: map_1.getView().getProjection()});
	    			  break;
	    		  case 'map_2':
	    			  features = new ol.format.OSMXML().readFeatures(result, {featureProjection: map_2.getView().getProjection()});
	    			  break;
	    		  case 'map_3':
	    			  features = new ol.format.OSMXML().readFeatures(result, {featureProjection: map_3.getView().getProjection()});
	    			  break;
	    		  case 'map_4':
	    			  features = new ol.format.OSMXML().readFeatures(result, {featureProjection: map_4.getView().getProjection()});
	    			  break;
	    		  default:
	    			  break;
	    		}
	    	}

	      processItems(features,object);
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

function load_tree(feature_box){
	loadMapItemsFromOverpass('#tree',feature_box);
}

//-----------------------------------------------------------------------------
// Query overpass for the full set of choucas items in the current map view
//-----------------------------------------------------------------------------
function loadMapItemsFromOverpass(object,feature_box) {
  choucasLog("loadMapItemsFromOverpass()");
//TODO small multiple
  //If we are too far zoomed out the overpass Query will return a very large amount of data
  //Therefore for a quick solution just only allow the user to query overpass when zoomed in at level 12+
  var view = map_1.getView();
  choucasLog("Zoom Level: " + view.getZoom());
  if(view.getZoom() < 12 && feature_box == null) {
    choucasLog("Zoomed too far out to query overpass API");
    alert("Fenêtre trop grande pour interroger Overpass API, s'il vous plaît zoomer sur la carte");
    return;
  }
  //Create and run overpass query
  var overpassQueryUrl = "https://overpass-api.de/api/interpreter?data="+
    "[bbox:"+ getCurrentScreenBoundingBoxString(feature_box) +"];"+
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
  runOverpassQuery(overpassQueryUrl,'showAllFolders',object);


}

function loadMapItemsFromZRI(object,ZRI) {

	var load_polygon_coord = [[ZRI[0] - 10,ZRI[1] - 10],[ZRI[2] + 10,ZRI[1] - 10],[ZRI[2] + 10,ZRI[3] + 10],[ZRI[0] - 10,ZRI[3] + 10],[ZRI[0] - 10,ZRI[1] - 10]];
	var load_polygon = turf.polygon([load_polygon_coord]);
	var format = new ol.format.GeoJSON();
	var feature = format.readFeature(load_polygon);
	var area = feature.getGeometry().getArea();

	  if(area > 6186723575.23877) {
	    choucasLog("ZRI too big to query overpass API");
	    alert("Fenêtre trop grande pour interroger Overpass API, s'il vous plaît recadrer la ZRI");
	    return;
	  }

	  var boundingBox = ol.proj.transformExtent(ZRI, ol.proj.get("EPSG:3857"), ol.proj.get("EPSG:4326"));
	  var boundingBoxString = boundingBox[1]+","+boundingBox[0]+","+boundingBox[3]+","+boundingBox[2];

	  //Create and run overpass query
	  var overpassQueryUrl = "https://overpass-api.de/api/interpreter?data="+
	    "[bbox:"+ boundingBoxString +"];"+
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
	  runOverpassQuery(overpassQueryUrl,'showAllFolders',object);


	}

//-----------------------------------------------------------------------------
// Run the given overpass query and load the returned items into the item tree
//-----------------------------------------------------------------------------
function runOverpassQuery(overpassQueryUrl, folderSetting,object) {
	//TODO small multiple
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
      selectedItemsPerFilter[selectedFilter] = getSelectedItemRefs("#tree");
      clearTextFilter(object);
      setupTreeFolders(folderSetting,object);

      var features = new ol.format.OSMXML().readFeatures(result, {featureProjection: map_1.getView().getProjection()});

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
          var osmWayId = "" + member.attributes["ref"].value;
          if(idForMultiPolygon == null) { idForMultiPolygon = osmWayId}
          multiPolygonWays[osmWayId] = null;
        });
        //Merge them all into a single Openlayer Multipolygon
        var coordinates_array = [];

        features.forEach(function(item) {
            if(item.getId() in multiPolygonWays) {
            	coordinates_array.push(item.getGeometry().getCoordinates());
            }
          });
       var multiPolyGeometry = new ol.geom.MultiPolygon(coordinates_array);

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
    processItems(features,object);
    choucasLog("Finished Processing items in: " + ((Date.now() - processingItemsStartTime) / 1000) + "s");
    add_object_of_interest_on_hover_to_map();

    var tree = $(object).fancytree("getTree"),
    firstNodes = tree.getRootNode().getChildren();

  	firstNodes.forEach(function(node) {
  		if(node.hasChildren()){
  			var secondNodes = node.getChildren();
  			secondNodes.forEach(function(second_node) {
  		  		if(second_node.hasChildren()){
	  		  		var thirdNodes = node.getChildren();
	  		  		thirdNodes.forEach(function(third_node) {
	  		  			if(third_node.hasChildren()){
	  		  				var fourthNodes = third_node.getChildren();
	  		  				fourthNodes.forEach(function(fourth_node) {
	  		  					if(fourth_node.hasChildren()){
		  		  					var fifthNodes = fourth_node.getChildren();
		  		  					fifthNodes.forEach(function(fifth_node) {
		  		  						if(fifth_node.hasChildren()){
		  		  						}else{
		  		  							if(fifth_node.data.itemRef){
		  		  							} else {
		  		  								fifth_node.remove();
		  		  							}
		  		  						}
		  		  					});
	  		  					} else {
	  		  						if(fourth_node.data.itemRef){
		  							} else {
		  								fourth_node.remove();
		  							}
	  		  					}
	  		  				});
	  		  			} else {
	  		  				if(third_node.data.itemRef){
							} else {
								third_node.remove();
							}
	  		  			}
	  		  		});
	  	  		} else {
		  	  		if(second_node.data.itemRef){
					} else {
						second_node.remove();
					}
	  	  		}
  			});
  		} else {
  			if(node.data.itemRef){
			} else {
				node.remove();
			}
  		}


  	});

  }});

}

//-----------------------------------------------------------------------------
// Setup the tree folders for either the initial items or all overpass item types
//-----------------------------------------------------------------------------
function setupTreeFolders(folderSetting,object) {

  $(object).fancytree("getTree").clear();
  var rootNode = $(object).fancytree("getRootNode");

  if(folderSetting == 'showInitialFolders') {
    var rootNode = $(object).fancytree("getRootNode");

    parentNodeMap["URBAN"] = rootNode.addChildren([{title: "Villes et villages", folder: true}]);
    parentNodeMap["CITY"] = parentNodeMap["URBAN"].addChildren([{title: "Grandes Villes", folder: true}]);
    parentNodeMap["TOWN"] = parentNodeMap["URBAN"].addChildren([{title: "Villes", folder: true}]);
    parentNodeMap["VILLAGE"] = parentNodeMap["URBAN"].addChildren([{title: "Villages", folder: true}]);

    parentNodeMap["RELIEF"] = rootNode.addChildren([{title: "Relief", folder: true}]);
	  parentNodeMap["PEAK"] = parentNodeMap["RELIEF"].addChildren([{title: "Sommets", folder: true}]);
	  parentNodeMap["COL"] = parentNodeMap["RELIEF"].addChildren([{title: "Cols", folder: true}]);

  }
  if(folderSetting == 'showAllFolders') {

	  parentNodeMap["URBAN"] = rootNode.addChildren([{title: "Villes et villages", folder: true}]);
	    parentNodeMap["CITY"] = parentNodeMap["URBAN"].addChildren([{title: "Grandes Villes", folder: true}]);
	    parentNodeMap["TOWN"] = parentNodeMap["URBAN"].addChildren([{title: "Villes", folder: true}]);
	    parentNodeMap["VILLAGE"] = parentNodeMap["URBAN"].addChildren([{title: "Villages", folder: true}]);

	  parentNodeMap["RELIEF"] = rootNode.addChildren([{title: "Relief", folder: true}]);
	  parentNodeMap["PEAK"] = parentNodeMap["RELIEF"].addChildren([{title: "Sommets", folder: true}]);
	  parentNodeMap["COL"] = parentNodeMap["RELIEF"].addChildren([{title: "Cols", folder: true}]);

	  parentNodeMap["HYDRO"] = rootNode.addChildren([{title: "Hydrologie", folder: true}]);
	  parentNodeMap["LAKE"] = parentNodeMap["HYDRO"].addChildren([{title: "Lacs", folder: true}]);
	  parentNodeMap["RESERVOIR"] = parentNodeMap["HYDRO"].addChildren([{title: "Réservoirs", folder: true}]);
	  parentNodeMap["WATEROTHER"] = parentNodeMap["HYDRO"].addChildren([{title: "Autre cours d'eau", folder: true}]);
	  parentNodeMap["RIVER"] = parentNodeMap["HYDRO"].addChildren([{title: "Rivières", folder: true}]);
	  parentNodeMap["STREAM"] = parentNodeMap["HYDRO"].addChildren([{title: "Ruisseaus", folder: true}]);




	  parentNodeMap["HUMAN"] = rootNode.addChildren([{title: "Installations humaines", folder: true}]);

	  parentNodeMap["POWER"] = parentNodeMap["HUMAN"].addChildren([{title: "Lignes Electriques", folder: true}]);
	    parentNodeMap["POWER6"] = parentNodeMap["POWER"].addChildren([{title: "6 Câbles", folder: true}]);
	    parentNodeMap["POWER3"] = parentNodeMap["POWER"].addChildren([{title: "3 Câbles", folder: true}]);
	    parentNodeMap["POWERO"] = parentNodeMap["POWER"].addChildren([{title: "Autre", folder: true}]);

	    parentNodeMap["MAST"] = parentNodeMap["HUMAN"].addChildren([{title: "Tours des téléphonie", folder: true}]);

	    parentNodeMap["SKILIFT"] = parentNodeMap["HUMAN"].addChildren([{title: "Remontées mécaniques", folder: true}]);


	    parentNodeMap["ALL_ROAD"] = rootNode.addChildren([{title: "Routes et sentiers", folder: true}]);

	    parentNodeMap["PISTE"] = parentNodeMap["ALL_ROAD"].addChildren([{title: "Pistes de ski", folder: true}]);
	    parentNodeMap["PISTEGREEN"] = parentNodeMap["PISTE"].addChildren([{title: "Pistes Vert", folder: true}]);
	    parentNodeMap["PISTEBLUE"] = parentNodeMap["PISTE"].addChildren([{title: "Pistes Blue", folder: true}]);
	    parentNodeMap["PISTERED"] = parentNodeMap["PISTE"].addChildren([{title: "Pistes Rouge", folder: true}]);
	    parentNodeMap["PISTEBLACK"] = parentNodeMap["PISTE"].addChildren([{title: "Pistes Noire", folder: true}]);



	    parentNodeMap["PATHWAY"] = parentNodeMap["ALL_ROAD"].addChildren([{title: "Randonnées", folder: true}]);

	    parentNodeMap["ROAD"] = parentNodeMap["ALL_ROAD"].addChildren([{title: "Routes", folder: true}]);


//    parentNodeMap["COL"] = rootNode.addChildren([{title: "Cols", folder: true}]);
//    parentNodeMap["WATER"] = rootNode.addChildren([{title: "Plan d'Eau", folder: true}]);
//    parentNodeMap["LAKE"] = parentNodeMap["WATER"].addChildren([{title: "Lacs", folder: true}]);
//    parentNodeMap["RESERVOIR"] = parentNodeMap["WATER"].addChildren([{title: "Réservoirs", folder: true}]);
//    parentNodeMap["WATEROTHER"] = parentNodeMap["WATER"].addChildren([{title: "Petit", folder: true}]);
//    parentNodeMap["RIVER"] = rootNode.addChildren([{title: "Rivières", folder: true}]);
//    parentNodeMap["STREAM"] = rootNode.addChildren([{title: "Ruisseaus", folder: true}]);
//
//
//    parentNodeMap["POWER"] = rootNode.addChildren([{title: "Lignes Electrique", folder: true}]);
//    parentNodeMap["POWER6"] = parentNodeMap["POWER"].addChildren([{title: "6 Câbles", folder: true}]);
//    parentNodeMap["POWER3"] = parentNodeMap["POWER"].addChildren([{title: "3 Câbles", folder: true}]);
//    parentNodeMap["POWERO"] = parentNodeMap["POWER"].addChildren([{title: "Autre", folder: true}]);
//
//    parentNodeMap["PISTE"] = rootNode.addChildren([{title: "Pistes", folder: true}]);
//    parentNodeMap["PISTEGREEN"] = parentNodeMap["PISTE"].addChildren([{title: "Pistes Vert", folder: true}]);
//    parentNodeMap["PISTEBLUE"] = parentNodeMap["PISTE"].addChildren([{title: "Pistes Blue", folder: true}]);
//    parentNodeMap["PISTERED"] = parentNodeMap["PISTE"].addChildren([{title: "Pistes Rouge", folder: true}]);
//    parentNodeMap["PISTEBLACK"] = parentNodeMap["PISTE"].addChildren([{title: "Pistes Noire", folder: true}]);
//
//    parentNodeMap["PATHWAY"] = rootNode.addChildren([{title: "Randonnées", folder: true}]);
//    parentNodeMap["SKILIFT"] = rootNode.addChildren([{title: "Remontées mécaniques", folder: true}]);
//    parentNodeMap["ROAD"] = rootNode.addChildren([{title: "Routes", folder: true}]);
//    parentNodeMap["PEAK"] = rootNode.addChildren([{title: "Sommets", folder: true}]);
//
//    parentNodeMap["URBAN"] = rootNode.addChildren([{title: "Villes", folder: true}]);
//    parentNodeMap["CITY"] = parentNodeMap["URBAN"].addChildren([{title: "Grand Villes", folder: true}]);
//    parentNodeMap["TOWN"] = parentNodeMap["URBAN"].addChildren([{title: "Villes", folder: true}]);
//    parentNodeMap["VILLAGE"] = parentNodeMap["URBAN"].addChildren([{title: "Villages", folder: true}]);
//
//    parentNodeMap["MAST"] = rootNode.addChildren([{title: "Tours des téléphonie", folder: true}]);
  }

  $(object).fancytree("getRootNode").sortChildren(null, true);
}

function processItems(features,object) {
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
  var percentage =  (problem_counter/features.length)*100;
  console.log("item avec géométrie inadéquate " + problem_counter + " " + percentage + " %");

  $(object).fancytree("getRootNode").sortChildren(null, true);

  showTreeLoadingIcon(false);

  if (selectedFilter == "Filter2") {
    $(object).removeClass("highlight");
    $("#promptBar").addClass("hidden");
    //creatingInitialZone = false;
  }

  disableFilterUpdate = true;
    selectItems(selectedItemsPerFilter[selectedFilter],object);
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
//  console.log(turfItem);
  var turfItem_ok = true;
  for(var p = 0; p < turfItem.geometry.coordinates.length; p++){
	  if(turfItem.geometry.coordinates[p].length > 1){
		  turfItem_ok = false;
		  problem_counter = problem_counter +1;
		  break;
	  }
  }
  if(turfItem_ok == true){
	  item.setProperties({"dataPoints": turf.explode(turfItem).features.length });
  }
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
function filterTreeToCurrentZone(object) {

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
  clearTreeZoneFilter(object);

  //Then hide all items that do not intersect with the current zone;
  if(zones.length > 0) {
    $(object).fancytree("getTree").visit(function(node){
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

function filterTreeToCurrentZone_all(){
	//TODO small multiple
	if(heat_map_table.length > 0){

		var filter_layer;
		    map.getLayers().forEach(function (lyr) {
		    	if (lyr.get('id')) {
			        if (heat_map_table[0].id  == lyr.get('id')) {
			        	filter_layer = lyr;
			        }
		    	}
		    });

		filterTreeToHighlighted_zone("#tree",filter_layer)
	}


}

function filterTreeToHighlighted_zone(object,feature_box) {

	  if(creatingInitialZone) {
	    setPrompt(5);
	  }

	  showTreeLoadingIcon(true);

	  setTimeout(function () {

	  var buff = parseFloat(document.getElementById("treeFilterToZoneBuffer").value);

	  choucasLog("Filtering item tree to current zone with buffer " + buff + ", screen bounding box: " + getCurrentScreenBoundingBoxString() + " " + selectedFilter);


	  var GeoJSON_format_high = new ol.format.GeoJSON();
//	  console.log(feature_box.getSource().getFeatures());
//	  console.log(GeoJSON_format_high.writeFeaturesObject(feature_box.getSource().getFeatures()));
	  var fc = GeoJSON_format_high.writeFeaturesObject(feature_box.getSource().getFeatures());
//	  var fc = turf.featureCollection(GeoJSON_format_high.writeFeaturesObject(feature_box.getSource().getFeatures()));
//	  var fc = turf.featureCollection(getZonesForAllScenarios());
	  var combined = turf.combine(fc).features[0];
	  var bufferedCurrentZone = turf.buffer(combined, buff, {units: "kilometres"});
	  var zones = turf.flatten(bufferedCurrentZone).features;

	  //Show Everything in the tree
	  clearTreeZoneFilter(object);

	  //Then hide all items that do not intersect with the current zone;
	  if(zones.length > 0) {
	    $(object).fancytree("getTree").visit(function(node){
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

function clearTreeZoneFilter(object) {
  choucasLog("clearTreeZoneFilter(" + object + ")");
  $(object).fancytree("getTree").visit(function(node){
    node.removeClass("hide");
  });
}

function setupTextFilterSearchbox (object) {
  //Link the searchbox to the fancy tree
//  $("input[name=search]").keyup(function(e){
//    searchTerm = $("input[name=search]").val().trim()
//    choucasLog("Tree search box updated: " + selectedFilter + ", " + searchTerm);
////    $(object).fancytree("getTree").filterBranches(searchTerm);
//    if($(this).parent().parent().children('.wrapper').length > 0){
//    	$("#tree").fancytree("getTree").filterBranches(searchTerm);
//    }
//  });

  $(".treeSearchBox_keyboard").keyup(function(e){
	  if($(this).parent().parent().children('.wrapper').length > 0){
	    var searchTerm = $(this).val().trim()
	    choucasLog("Tree search box updated: " + selectedFilter + ", " + searchTerm);
//	    $(object).fancytree("getTree").filterBranches(searchTerm);
	    	$("#tree").fancytree("getTree").filterBranches(searchTerm);
	    }else{
	    	var searchTerm = $(this).val().trim()
		    choucasLog("Tree search box updated: " + selectedFilter + ", " + searchTerm);
//		    $(object).fancytree("getTree").filterBranches(searchTerm);
	    }
	  });

}

function clearTextFilter(object) {
  $("input[name=search]").val("");
  $(object).fancytree("getTree").clearFilter();
}

function collapseAllNodes(object) {
	$(object).fancytree("getRootNode").visit(function(node){
    node.setExpanded(false);
  });
}

function deselectAllNodes(object) {
	$(object).fancytree("getTree").visit(function(node){
    node.setSelected(false);
  });
}

//-----------------------------------------------------------------------------
// Return the item refs of all selected nodes
//-----------------------------------------------------------------------------
function getSelectedItemRefs (object) {


  var selectedItemRefs = new Set();
  var selectedNodes = $(object).fancytree("getTree").getSelectedNodes();
  $.each(selectedNodes, function (event, node) {
    if(node.isSelected() && !node.isFolder() && node.extraClasses != "hide") {
      selectedItemRefs.add(node.data.itemRef);
    }
  });

  return Array.from(selectedItemRefs);
}


function getSelectedItemRefs_All_Tree () {

//	object = "#tree_PP";
//	var selectedItemRefs_count = 0;
//
//  var selectedItemRefs = new Set();
//  var selectedNodes = $(object).fancytree("getTree").getSelectedNodes();
//  $.each(selectedNodes, function (event, node) {
//    if(node.isSelected() && !node.isFolder() && node.extraClasses != "hide") {
//      selectedItemRefs.add(node.data.itemRef);
//      selectedItemRefs_count = selectedItemRefs_count +1;
//    }
//  });

  if(selectedItemRefs_count ==0){
	  object = "#tree";
	  var selectedNodes = $(object).fancytree("getTree").getSelectedNodes();
	  $.each(selectedNodes, function (event, node) {
	    if(node.isSelected() && !node.isFolder() && node.extraClasses != "hide") {
	      selectedItemRefs.add(node.data.itemRef);
	      selectedItemRefs_count = selectedItemRefs_count +1;
	    }
	  });
  }

  return Array.from(selectedItemRefs);
}

//-----------------------------------------------------------------------------
// Return the item refs of selected nodes however exclude the child nodes of a
// fully selected folder
//-----------------------------------------------------------------------------
function getSelectedItemRefsConcise(object) {


	var selectedItemRefs = new Set();

  var selectedNodes = $(object).fancytree("getTree").getSelectedNodes();
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


function getSelectedItemRefsConcise_All_Trees() {

//	object = "#tree_PP";
//	var selectedItemRefs_count = 0;
//
//	var selectedItemRefs = new Set();
//
//  var selectedNodes = $(object).fancytree("getTree").getSelectedNodes();
//  $.each(selectedNodes, function (event, node) {
//    if(node.isFolder() && node.extraClasses != "hide" ) {
//      selectedItemRefs.add(node.title);
//      selectedItemRefs_count = selectedItemRefs_count +1;
//    }
//    if(!node.isFolder() && !node.parent.isSelected() && node.extraClasses != "hide") {
//      selectedItemRefs.add(node.data.itemRef + "-" + node.title);
//      selectedItemRefs_count = selectedItemRefs_count +1;
//    }
//
//  });

  if(selectedItemRefs_count ==0){
	  object = "#tree";

	  var selectedNodes = $(object).fancytree("getTree").getSelectedNodes();
	  $.each(selectedNodes, function (event, node) {
	    if(node.isFolder() && node.extraClasses != "hide" ) {
	      selectedItemRefs.add(node.title);
	    }
	    if(!node.isFolder() && !node.parent.isSelected() && node.extraClasses != "hide") {
	      selectedItemRefs.add(node.data.itemRef + "-" + node.title);
	    }
	    selectedItemRefs_count = selectedItemRefs_count +1;
	  });
  }

  return Array.from(selectedItemRefs);
}

//TODO: possible problem when an itemRef is included under two different folders, should be OSM ID + parent folder
//TODO: should setup a map of itemRef -> node
function selectItems(itemRefList,object) {
  $.each(itemRefList, function(event, itemRef) {
    $(object).fancytree("getRootNode").visit(function(node){
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

export {loadInitialItems,
	setupTextFilterSearchbox,
	load_tree,
	getSelectedItemRefs,
	loadMapItemsFromZRI};
