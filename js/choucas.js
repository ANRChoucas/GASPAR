import {initialize_clue_window} from './add_clue_from_clue_window.js';
import {initialize_add_clue_on_map} from './add_clue_from_map.js';
import {initialize_add_clue_from_tree} from './add_clue_from_tree.js';
import {choucasLog} from './choucas_experiment.js';
import {objectMapLayersForEachFilter,
	zoneMapLayersForEachFilter} from './choucas_filtertable.js';
import {refreshMapItems} from './choucas_styling.js';
import {loadInitialItems,
	setupTextFilterSearchbox,
	load_tree} from './choucas_itemtree.js';
import {add_object_of_interest_on_hover_to_map,
	initialize_small_multiples,
	reset_ZRI} from './map_element.js';
import {app} from './clue_element.js';


//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
// choucas.js: The central map functionality of the choucas system
//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
// Global variables
//-----------------------------------------------------------------------------
var objectMap = {};   //key:itemRef, value:object - Map of OSM objects as OL features
var turfItemMap = {}; //key:itemRef, value:object - Map of OSM objects as GeoJSON objects for turf.js spatial calculcations
const format = new ol.format.GeoJSON(); //OL Formatter for converting between OL Features and geojson objects

//-----------------------------------------------------------------------------
// Map
//-----------------------------------------------------------------------------
//Initial base map is OSM, other maps are loaded on demand with loadBaseMap()
var currentBaseMap = "OSM";
const baseMaps = {
  "OSM": new ol.layer.Tile({
//    source: new ol.source.OSM()
	  source: new ol.source.XYZ({
	        url: 'https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png'
	      })
  })
};

const scaleLineControl = new ol.control.ScaleLine(); //Map scale bar
scaleLineControl.setUnits("metric");

var map_1 = null;
var map_2 = null;
var map_3 = null;
var map_4 = null;

var ZRI_extent;

//-----------------------------------------------------------------------------
// Intialisation
//-----------------------------------------------------------------------------
function initialise() {
  choucasLog("Initialising System");

  $("#1_map_container").css("left",$(".map-area")[0].offsetLeft + 'px');
	$("#1_map_container").css("top",$(".map-area")[0].offsetTop + 'px');
	$("#1_map_container").css("width",$(".map-area")[0].offsetWidth + 'px');
	$("#1_map_container").css("height",$(".map-area")[0].offsetHeight + 'px');
	$("#2_map_container").css("left",$(".map-area")[0].offsetLeft + 'px');
	$("#2_map_container").css("top",$(".map-area")[0].offsetTop + 'px');
	$("#2_map_container").css("width",$(".map-area")[0].offsetWidth + 'px');
	$("#2_map_container").css("height",$(".map-area")[0].offsetHeight + 'px');
	$("#3_map_container").css("left",$(".map-area")[0].offsetLeft + 'px');
	$("#3_map_container").css("top",$(".map-area")[0].offsetTop + 'px');
	$("#3_map_container").css("width",$(".map-area")[0].offsetWidth + 'px');
	$("#3_map_container").css("height",$(".map-area")[0].offsetHeight + 'px');
	$("#4_map_container").css("left",$(".map-area")[0].offsetLeft + 'px');
	$("#4_map_container").css("top",$(".map-area")[0].offsetTop + 'px');
	$("#4_map_container").css("width",$(".map-area")[0].offsetWidth + 'px');
	$("#4_map_container").css("height",$(".map-area")[0].offsetHeight + 'px');

	$(".1_map").css("width","100%");
	$(".1_map").css("height","100%");
	$(".2_map").css("width","50%");
	$(".2_map").css("height","100%");
	$(".3_map_sub_container").css("width","100%");
	$(".3_map_sub_container").css("height","50%");
	$(".3_map").css("width","50%");
	$(".3_map").css("height","100%");
	$(".4_map_sub_container").css("width","100%");
	$(".4_map_sub_container").css("height","50%");
	$(".4_map").css("width","50%");
	$(".4_map").css("height","100%");

  app.map_collection.push({
	  "map":'map_1',
		"id_map":1,
		"name_map": "Carte 1"
	});

  app.small_multiple_map_id_array.push({
		"id_map":1,
		"name_map": "Carte 1",
		"id_div":'map_window_map_button_1',
		"list_map_elements":[{"type_clue":1},{"type_clue":2}],
		"selected":true,
		"over_selected":false,
		"open":false
	});


	initialize_map(null);

  objectMap = {};
  turfItemMap = {};


  document.getElementById("baseMapSelection").value = "OSM";
  loadBaseMap();

//  $.each(objectMapLayersForEachFilter, function(key, value) {
//    map.removeLayer(value);
//  });
//
//  $.each(zoneMapLayersForEachFilter, function(key, value) {
//    map.removeLayer(value);
//  });

  document.getElementById("filterTable").innerHTML = "";
//  initialiseTable();
//  addScenario();
//  addScenario();
//  addScenario();
//  addFilter();
//  changeHypothesisNumber(); //Update the hypothesis colour change dropdown

  activeItemsSource.clear();
  hoverSource.clear();
  vectorSource.clear();

  refreshMapItems();

  loadInitialItems("#tree");
//  loadInitialItems("#tree_PP");
  setupTextFilterSearchbox();

  choucasLog("Initialisation completed successfully");
//  setTimeout(function(){ add_object_of_interest_on_hover_to_map(); }, 3000);

//story_tree;
//  create_story_tree_structure();

  initialize_clue_window();
  initialize_add_clue_from_tree();
  /*
   * initialiser le dispositif small multiple
   *
   */
  initialize_small_multiples();

  $('#loadMapObjects').on('click',function() {
	  load_tree(null);
	});

}

setTimeout(initialise, 500); //500ms delay to let the tree to be constructed

function initialize_map(view_parameters){

	var view;
	if(view_parameters == null){
		view = new ol.View({
		    center: ol.proj.fromLonLat([5.72, 45.18]), //Center point Grenoble to start
		    zoom: 11
		  });
	} else {
		view = view_parameters;
	}

	if(map_1 != null){
		var layerArray, len, layer;
		layerArray = map_1.getLayers().getArray(),
		len = layerArray.length;
		while (len > 0){
		    layer = layerArray[len-1];
		    map_1.removeLayer(layer);
		    len = layerArray.length;
		}
		map_1 = null;
	}

	if(map_2 != null){
		var layerArray, len, layer;
		layerArray = map_2.getLayers().getArray(),
		len = layerArray.length;
		while (len > 0){
		    layer = layerArray[len-1];
		    map_2.removeLayer(layer);
		    len = layerArray.length;
		}
		map_2 = null;
	}

	if(map_3 != null){
		var layerArray, len, layer;
		layerArray = map_3.getLayers().getArray(),
		len = layerArray.length;
		while (len > 0){
		    layer = layerArray[len-1];
		    map_3.removeLayer(layer);
		    len = layerArray.length;
		}
		map_3 = null;
	}

	if(map_4 != null){
		var layerArray, len, layer;
		layerArray = map_4.getLayers().getArray(),
		len = layerArray.length;
		while (len > 0){
		    layer = layerArray[len-1];
		    map_4.removeLayer(layer);
		    len = layerArray.length;
		}
		map_4 = null;
	}

	$('.1_map').empty();
	$('.2_map').empty();
	$('.3_map_main').empty();
	$('.3_map').empty();
	$('.4_map').empty();

	var number_of_map = app.map_collection.length;

	switch (number_of_map) {
		case 1:
			$('#1_map_container').css("display","block");
			$('#2_map_container').css("display","none");
			$('#3_map_container').css("display","none");
			$('#4_map_container').css("display","none");
			break;
		case 2:
			$('#1_map_container').css("display","none");
			$('#2_map_container').css("display","block");
			$('#3_map_container').css("display","none");
			$('#4_map_container').css("display","none");

			$('.2_map').css("float","left");

			$('#2_map_1').css("border-right-style","solid");
			$('#2_map_1').css("border-width","2px");
			$('#2_map_1').css("border-color","white");

			$('#2_map_2').css("border-left-style","solid");
			$('#2_map_2').css("border-width","2px");
			$('#2_map_2').css("border-color","white");
			break;
		case 3:
			$('#1_map_container').css("display","none");
			$('#2_map_container').css("display","none");
			$('#3_map_container').css("display","block");
			$('#4_map_container').css("display","none");

			$('.3_map').css("float","left");

			$('#3_map_1').css("border-bottom-style","solid");
			$('#3_map_1').css("border-width","2px");
			$('#3_map_1').css("border-color","white");

			$('#3_map_1').css("height","100%");

			$('#3_map_2').css("border-top-style","solid");
			$('#3_map_2').css("border-right-style","solid");
			$('#3_map_2').css("border-width","2px");
			$('#3_map_2').css("border-color","white");

			$('#3_map_3').css("border-top-style","solid");
			$('#3_map_3').css("border-left-style","solid");
			$('#3_map_3').css("border-width","2px");
			$('#3_map_3').css("border-color","white");
			break;
		case 4:
			$('#1_map_container').css("display","none");
			$('#2_map_container').css("display","none");
			$('#3_map_container').css("display","none");
			$('#4_map_container').css("display","block");

			$('.4_map').css("float","left");

			$('#4_map_1').css("border-bottom-style","solid");
			$('#4_map_1').css("border-right-style","solid");
			$('#4_map_1').css("border-width","2px");
			$('#4_map_1').css("border-color","white");

			$('#4_map_2').css("border-bottom-style","solid");
			$('#4_map_2').css("border-left-style","solid");
			$('#4_map_2').css("border-width","2px");
			$('#4_map_2').css("border-color","white");

			$('#4_map_3').css("border-top-style","solid");
			$('#4_map_3').css("border-right-style","solid");
			$('#4_map_3').css("border-width","2px");
			$('#4_map_3').css("border-color","white");

			$('#4_map_4').css("border-top-style","solid");
			$('#4_map_4').css("border-left-style","solid");
			$('#4_map_4').css("border-width","2px");
			$('#4_map_4').css("border-color","white");
			break;
		default:
			break;
	}

	for(var p = 0; p < app.map_collection.length; p++){
		switch (app.map_collection[p].map) {
		  case 'map_1':
			  map_1 = new ol.Map({
				  target: number_of_map + "_map_1",
				  layers: [ baseMaps["OSM"] ],
				  view: view,
				  controls: ol.control.defaults({
				    zoom : false,
				    attributionOptions: {
				      collapsible: false
				    }
				  }).extend([ scaleLineControl ])
				});
			  map_1.setView(view);
			  $.each(objectMapLayersForEachFilter, function(key, value) {
				    map_1.removeLayer(value);
				  });

				  $.each(zoneMapLayersForEachFilter, function(key, value) {
					  map_1.removeLayer(value);
				  });
				  if(view_parameters == null){
					  reset_ZRI_extent(view.calculateExtent(map_1.getSize()));
				  }

				  map_1.on("moveend", function(){
					  reset_ZRI(ZRI_extent);
					});

				  break;
		  case 'map_2':
			  map_2 = new ol.Map({
				  target: number_of_map + "_map_2",
				  layers: [ baseMaps["OSM"] ],
				  view: view,
				  controls: ol.control.defaults({
				    zoom : false,
				    attributionOptions: {
				      collapsible: false
				    }
				  }).extend([ scaleLineControl ])
				});
			  $.each(objectMapLayersForEachFilter, function(key, value) {
				    map_2.removeLayer(value);
				  });

				  $.each(zoneMapLayersForEachFilter, function(key, value) {
					  map_2.removeLayer(value);
				  });

				  map_2.on("moveend", function(){
					  reset_ZRI(ZRI_extent);
					});

//			  map_2 = new ol.Map({
//				  target: number_of_map + "_map_2",
//				  layers: [ baseMaps["OSM"] ],
//				  view: view,
//				  controls: ol.control.defaults({
//				    zoom : false,
//				    attributionOptions: {
//				      collapsible: false
//				    }
//				  }).extend([ scaleLineControl ])
//				});
//			  map_2.bindTo('view', map_1);
//			  $.each(objectMapLayersForEachFilter, function(key, value) {
//				    map_2.removeLayer(value);
//				  });
//
//				  $.each(zoneMapLayersForEachFilter, function(key, value) {
//					  map_2.removeLayer(value);
//				  });


//			  map_2 = new ol.WebGLMap({
//				  target: number_of_map + "_map_2",
//				  layers: [ baseMaps["OSM"] ],
//				  view: view,
//				  controls: ol.control.defaults({
//				    zoom : false,
//				    attributionOptions: {
//				      collapsible: false
//				    }
//				  }).extend([ scaleLineControl ])
//				});
//			  $.each(objectMapLayersForEachFilter, function(key, value) {
//				    map_2.removeLayer(value);
//				  });
//
//				  $.each(zoneMapLayersForEachFilter, function(key, value) {
//					  map_2.removeLayer(value);
//				  });
			   break;
		case 'map_3':
			map_3 = new ol.Map({
				  target: number_of_map + "_map_3",
				  layers: [ baseMaps["OSM"] ],
				  view: view,
				  controls: ol.control.defaults({
				    zoom : false,
				    attributionOptions: {
				      collapsible: false
				    }
				  }).extend([ scaleLineControl ])
				});
//			map_3.bindTo('view', map_1);
			$.each(objectMapLayersForEachFilter, function(key, value) {
			    map_3.removeLayer(value);
			  });

			  $.each(zoneMapLayersForEachFilter, function(key, value) {
				  map_3.removeLayer(value);
			  });

			  map_3.on("moveend", function(){
				  reset_ZRI(ZRI_extent);
				});

			 break;
		case 'map_4':
			map_4 = new ol.Map({
				  target: number_of_map + "_map_4",
				  layers: [ baseMaps["OSM"] ],
				  view: view,
				  controls: ol.control.defaults({
				    zoom : false,
				    attributionOptions: {
				      collapsible: false
				    }
				  }).extend([ scaleLineControl ])
				});
//			map_4.bindTo('view', map_1);
			$.each(objectMapLayersForEachFilter, function(key, value) {
			    map_4.removeLayer(value);
			  });

			  $.each(zoneMapLayersForEachFilter, function(key, value) {
				  map_4.removeLayer(value);
			  });
			  map_4.on("moveend", function(){
				  reset_ZRI(ZRI_extent);
				});

			   break;
		default:
			break;
		}
	}
	//TODO centrer vue et synchroniser vue

	switch (app.map_collection.length) {
		case 1:
			break;
		case 2:
//			var c1, c2, z1, z2;
//			var updatingMap1 = false,updatingMap2 = false;
//			map_1.events.register("moveend", map_1, function() {
//			        if(!updatingMap2){
//			            c1 = this.getCenter();
//			            z1 = this.getZoom();
//			            updatingMap1 = true;
//			            map_2.panTo(c1);
//			            map_2.zoomTo(z1);
//			            updatingMap1 = false;
//			        }
//			});
//			map_2.events.register("moveend", map_2, function() {
//			        if(!updatingMap2){
//			            c2 = this.getCenter();
//			            z2 = this.getZoom();
//			            updatingMap2 = true;
//			            map_1.panTo(c2);
//			            map_1.zoomTo(z2);
//			            updatingMap2 = false;
//			        }
//			});
			break;
		case 3:
			break;
		case 4:
			break;
		default:
			break;
	}


	initialize_add_clue_on_map();

	ol.Feature.prototype.getLayer = function(map) {
	    var this_ = this, layer_, layersToLookFor = [];
	    /**
	     * Populates array layersToLookFor with only
	     * layers that have features
	     */
	    var check = function(layer){
	        var source = layer.getSource();
	        if(source instanceof ol.source.Vector){
	            var features = source.getFeatures();
	            if(features.length > 0){
	                layersToLookFor.push({
	                    layer: layer,
	                    features: features
	                });
	            }
	        }
	    };
	    //loop through map layers
//	    map.getLayers().forEach(function(layer){
//	        if (layer instanceof ol.layer.Group) {
//	            layer.getLayers().forEach(check);
//	        } else {
//	            check(layer);
//	        }
//	    });
	    for(var p = 0; p < app.map_collection.length; p++){
	  		switch (app.map_collection[p].map) {
	  		case 'map_1':
	  			map_1.getLayers().forEach(function(layer){
	  		        if (layer instanceof ol.layer.Group) {
	  		            layer.getLayers().forEach(check);
	  		        } else {
	  		            check(layer);
	  		        }
	  		    });
	  			   break;
	  		case 'map_2':
	  			map_2.getLayers().forEach(function(layer){
	  		        if (layer instanceof ol.layer.Group) {
	  		            layer.getLayers().forEach(check);
	  		        } else {
	  		            check(layer);
	  		        }
	  		    });
	  			   break;
	  		case 'map_3':
	  			map_3.getLayers().forEach(function(layer){
	  		        if (layer instanceof ol.layer.Group) {
	  		            layer.getLayers().forEach(check);
	  		        } else {
	  		            check(layer);
	  		        }
	  		    });
	  			   break;
	  		case 'map_4':
	  			map_4.getLayers().forEach(function(layer){
	  		        if (layer instanceof ol.layer.Group) {
	  		            layer.getLayers().forEach(check);
	  		        } else {
	  		            check(layer);
	  		        }
	  		    });
	  			   break;
	  		default:

	  		}
	  	}
	    layersToLookFor.forEach(function(obj){
	        var found = obj.features.some(function(feature){
	            return this_ === feature;
	        });
	        if(found){
	            //this is the layer we want
	            layer_ = obj.layer;
	        }
	    });
	    return layer_;
	};

	setTimeout(function(){ add_object_of_interest_on_hover_to_map(); }, 3000);

}


//-----------------------------------------------------------------------------
// Additional OSM Base Maps
// https://wiki.openstreetmap.org/wiki/Tile_servers
//-----------------------------------------------------------------------------
var baseMapReferences = {
  "Thunderforest Cycle": "https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=",
  "Thunderforest Landscape": "https://tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey=",
  "Thunderforest Outdoors": "https://tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=",
  "OTM": "http://a.tile.opentopomap.org/{z}/{x}/{y}.png",
  "HUM": "http://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
  "HIB": "http://toolserver.org/tiles/hikebike/{z}/{x}/{y}.png"
}

function loadBaseMap() {
  var baseMapSelection = document.getElementById("baseMapSelection").value;
  choucasLog("Loading base map " + baseMapSelection);

  for(var p = 0; p < app.map_collection.length; p++){
		switch (app.map_collection[p].map) {
		case 'map_1':
			map_1.removeLayer(baseMaps[currentBaseMap]);
			   break;
		case 'map_2':
			map_2.removeLayer(baseMaps[currentBaseMap]);
			   break;
		case 'map_3':
			map_3.removeLayer(baseMaps[currentBaseMap]);
			   break;
		case 'map_4':
			map_4.removeLayer(baseMaps[currentBaseMap]);
			   break;
		default:

		}
	}

  if ( !(baseMapSelection in baseMaps) ) {
    if(baseMapSelection == "IGN" || baseMapSelection == "IGN Satellite") {
      baseMaps[baseMapSelection] = getIGNBaseMap(baseMapSelection);
    } else if (baseMapSelection == "Thunderforest Cycle" || baseMapSelection == "Thunderforest Landscape" || baseMapSelection == "Thunderforest Outdoors") {
      baseMaps[baseMapSelection] = new ol.layer.Tile({
        source: new ol.source.XYZ({ url: baseMapReferences[baseMapSelection] + document.getElementById("thunderforestAPIKey").value })
      });
    } else {
      baseMaps[baseMapSelection] = new ol.layer.Tile({
        source: new ol.source.XYZ({ url: baseMapReferences[baseMapSelection] })
      });
    }
  }

  for(var p = 0; p < app.map_collection.length; p++){
		switch (app.map_collection[p].map) {
		case 'map_1':
			map_1.addLayer(baseMaps[baseMapSelection]);
			   break;
		case 'map_2':
			map_2.addLayer(baseMaps[baseMapSelection]);
			   break;
		case 'map_3':
			map_3.addLayer(baseMaps[baseMapSelection]);
			   break;
		case 'map_4':
			map_4.addLayer(baseMaps[baseMapSelection]);
			   break;
		default:

		}
	}

  baseMaps[baseMapSelection].setZIndex(-1);
  currentBaseMap = baseMapSelection;
}


//-----------------------------------------------------------------------------
// IGN Base Maps
//-----------------------------------------------------------------------------
var resolutions = [ 156543.03392804103, 78271.5169640205, 39135.75848201024,
  19567.879241005125, 9783.939620502562, 4891.969810251281, 2445.9849051256406,
  1222.9924525628203, 611.4962262814101, 305.74811314070485, 152.87405657035254,
  76.43702828517625, 38.218514142588134, 19.109257071294063, 9.554628535647034,
  4.777314267823517, 2.3886571339117584, 1.1943285669558792, 0.5971642834779396,
  0.29858214173896974, 0.14929107086948493, 0.07464553543474241 ];

function getIGNBaseMap(mapType) {
  //GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN25TOPO.L93
  //GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN-EXPRESS.STANDARD
  //GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN-EXPRESS.CLASSIQUE
  var ignLayer = "GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN-EXPRESS.CLASSIQUE";
  if (mapType == "IGN Satellite") {
    ignLayer = "ORTHOIMAGERY.ORTHOPHOTOS";
  }

  return new ol.layer.Tile({
    source: new ol.source.WMTS({
      attributions: ["IGN-F/Géoportail"],
      url: getIGNURL() + "geoportail/wmts",
      layer: ignLayer,
      matrixSet: "PM",
      format: "image/jpeg",
      tileGrid: new ol.tilegrid.WMTS({
        origin: [-20037508,20037508],
        resolutions: resolutions,
        matrixIds:["0","1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19"],
      }),
      style: "normal"
    })
  });
}

function getIGNURL() {
  var ignAPIKey = document.getElementById("ignAPIKey").value;
  var ignLogin = document.getElementById("ignAPILogin").value;

  if (ignLogin == "" || ignLogin == "username:password") {
    return "http://wxs.ign.fr/" + ignAPIKey + "/"
  }
  else {
    return "https://" + ignLogin + "@wxs.ign.fr/" + ignAPIKey + "/"
  }
}


//-----------------------------------------------------------------------------
// OL Map layers for displaying objects
//-----------------------------------------------------------------------------
//Layer for all the data items that should be currently displayed
var activeItemsSource = new ol.source.Vector({});
var activeItemsLayer = new ol.layer.Vector({
  source: activeItemsSource
});

//Layer for when user hovers over an item
var hoverSource = new ol.source.Vector({});
var hoverLayer = new ol.layer.Vector({
  source: hoverSource
});

//Layer to display the zones
var vectorSource = new ol.source.Vector({});
var vectorLayer = new ol.layer.Vector({
  source: vectorSource
});


//-----------------------------------------------------------------------------
// Fit map to current zone
//-----------------------------------------------------------------------------
function fitMapToCurrentZone () {
  choucasLog("fitMapToCurrentZone()");
  currentZones = getZonesForAllScenarios();
  if(currentZones.length > 0) {
    var fc = turf.featureCollection(currentZones);
    var combined = turf.combine(fc);
    //Pad by 1km
    var buffered = turf.buffer(combined, 1, {units: "kilometres"});
    var polygon = format.readFeature(buffered.features[0]).getGeometry();
    polygon.transform("EPSG:4326", "EPSG:3857");

    for(var p = 0; p < app.map_collection.length; p++){
		switch (app.map_collection[p].map) {
		case 'map_1':
			map_1.getView().fit(polygon, {padding: [0, 0, 0, 0], constrainResolution: false});
			   break;
		case 'map_2':
			map_2.getView().fit(polygon, {padding: [0, 0, 0, 0], constrainResolution: false});
			   break;
		case 'map_3':
			map_3.getView().fit(polygon, {padding: [0, 0, 0, 0], constrainResolution: false});
			   break;
		case 'map_4':
			map_4.getView().fit(polygon, {padding: [0, 0, 0, 0], constrainResolution: false});
			   break;
		default:

		}
	}
    setPrompt(4);
  }
}

function reset_ZRI_extent(extent){
	ZRI_extent = extent;
	reset_ZRI(ZRI_extent);
}


export {map_1,
	map_2,
	map_3,
	map_4,
	ZRI_extent,
	objectMap,
	format,
	turfItemMap,
	hoverSource,
	vectorSource,
	hoverLayer,
	initialize_map,
	reset_ZRI_extent};
