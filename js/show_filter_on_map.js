// créer et affiche les zones correspondant aux différents filtres sur la carte
// les zones doivent être visibles uniquement pendant la création du filtre, et masquées sinon.
// les zones créés servent ensuite à créer les cartes de chaleur lorsque qu'une hypothèse est sélectionnées'

//array containing filter areas vector source
//var Filter_Vector_Source_Array =[];

//array containing filter areas layer source
//var Filter_Vector_Layer_Array =[];

import {styleItem} from "./choucas_styling.js";
import {objectMap} from "./choucas.js";

//tableaux contenant les sources des différentes strates de l'hypothèse (zones interectant le filtre 1, le filtre 1 et 2... le filtre n-1 et n
var heat_map_table = [];

//var heat_map_source = new ol.source.Vector({});
//var heat_map_Layer = new ol.layer.Vector({
//	id:  "heat_map_layer",
//	title: "heat_map_layer",
//	source: heat_map_source
//});


var map_hover_event;

var highlighted_heat_map_feature = null;

//add a filter area
function Add_Filter_Layer(filter_objet){
	var filter_source = new ol.source.Vector({});
	var filter_layer = new ol.layer.Vector({
		id:  "id_filter_area_layer_" + filter_objet.filter_id,
		title: "filter_area_layer_" + filter_objet.filter_id,
		source: filter_source
	});

	var itemsInFilter = [];
	var totalDataPoints = 0;
	$.each(filter_objet.object, function (event, relevantItemRef) {
		itemsInFilter.push(turfItemMap[relevantItemRef]);
		var mapItem = objectMap[relevantItemRef];
		totalDataPoints += parseFloat(mapItem.getProperties().dataPoints);
		styleItem(mapItem,"highlight");
		filter_source.addFeature(mapItem)
	});

	var distance = null;
	try { distance = parseFloat(filter_objet.buffer_limit_1); }
	catch(err) { choucasLog("Invalid distance input"); }
	var fuzziness = null;
	try { fuzziness = parseFloat(filter_objet.buffer_limit_2); }
	catch(err) { choucasLog("Invalid buffer input"); }
	var calculateZones = true;
	if(isNaN(distance) && isNaN(fuzziness)) {
	  calculateZones = false; //If distance and fuzziness are null then dont calculate a zone
	} if (isNaN(distance) && !isNaN(fuzziness)) {
	  distance = 0; //If only distance is null then default it to 0
	} if (isNaN(fuzziness) && !isNaN(distance)) {
	  fuzziness = 0.05 //If only the buffer is null or 0 then default it to 0
	} if (fuzziness == 0) {
	  fuzziness = 0.05 //If only the buffer is null or 0 then default it to 0
	}


	//Caluclate the corresponding zone if required
	 if(calculateZones) {

	    if(totalDataPoints >= parseFloat(document.getElementById("zoneCalcWarning").value)) {
	      var confirmZoneCalcMessage= " \
	        Attention: Les objets sélectionnés pour ce filtre contiennent " + totalDataPoints +  " points de données. Donc le calcul de la zone peut être long.\n \
	        Si possible, commencez avec un autre indice, puis filtrez l'arbre des objets de la carte pour la plus petite zone actuelle.\n \
	        Pour éviter cet avertissement, modifiez le champ 'Avert. de zone calcul' sous la section 'Paramètres +/- \n \
	        Cliquez sur OK pour continuer le calcul de la zone, ou cliquez sur Annuler pour abandonner le calcul de la zone. \
	        ";

	      var confirmZoneCalc = confirm(confirmZoneCalcMessage)
	      if(!confirmZoneCalc) {
	        deselectAllNodes();
	        choucasLog("User aborted calculation of zone after data point number warning");
	        return;
	      }
	    }

	    choucasLog("User aborted calculation of zone after data point number warning with data points=" + totalDataPoints );

	    filterRecalcStartTime = Date.now();

	    //Calculate the zone for each item based on buffer / distance values
	    //This code buffers each item individually
	    var turfObjects = [];
	    $.each(itemsInFilter, function (event, item) {
	      var zone = null;
	      if(distance > 0) {
	        var tmp = turf.buffer(item, distance, {units: "kilometers"});
	        var distanceLine = turf.polygonToLine(tmp);
	        zone = turf.buffer(distanceLine, fuzziness, {units: "kilometers"});
	      } else {
	        //TODO: This is a dodgy hack as turf buffer was not calculating correct distances at 45 deg N
	        zone = turf.buffer(item, fuzziness * 0.0127, {units: "degrees"});
	      }
	      turfObjects.push(zone)
	    });

	    //Union all of the item zones to get a final overall zone for this filter
	    if(turfObjects.length > 0) {

	      //Use the individually buffered items
	      turfFinalResult = turf.union.apply(this, turfObjects);

	      //Combine all items and then buffer them as a group
	      //var fc = turf.featureCollection(itemsInFilter);
	      //var combined = turf.combine(fc);
	      //var turfFinalResult = turf.buffer(combined.features[0], fuzziness * 0.0127, {units: "degrees"});
	      //item.setProperties({"itemType": itemsInFilter.data.itemType });

	      var bufferedPoly = format.readFeature(turfFinalResult);
	      bufferedPoly.getGeometry().transform("EPSG:4326", "EPSG:3857");
	      filterZoneCache[selectedFilter] = bufferedPoly;

	      var buffer = document.getElementById("bufferInput" + selectedFilter).value;
	      if (0.0 != parseFloat(buffer)) {
	        //Add Zone To Map if buffer is not 0
	        //TODO: review this
	        styleItem(bufferedPoly,"highlightOutline", getHypNumberForFilter(selectedFilter));
	        filter_source.addFeature(bufferedPoly);
	      }
	    }
	    choucasLog("Zone recalculated for " + selectedFilter + " in: ", Date.now() - filterRecalcStartTime);
	  }

	map.addLayer(filter_layer);
}

function Add_filter_created_on_map(id_filter,feature_filter){
	var filter_source = new ol.source.Vector({});
	var filter_layer = new ol.layer.Vector({
		id:  "id_filter_area_layer_" + id_filter,
		title: "filter_area_layer_" + id_filter,
		source: filter_source
	});
	filter_source.addFeature(feature_filter);
	map.addLayer(filter_layer);
	console.log(filter_layer)
}

//suppress a filter area
function Suppress_Filter_Layer(filter_id){
	var filter_layer;
    map.getLayers().forEach(function (lyr) {
    	if (lyr.get('id')) {
	        if ("id_filter_area_layer_" + filter_id == lyr.get('id')) {
	        	filter_layer = lyr;
	        }
    	}
    });

	var filter_source = filter_layer.getSource();
	filter_source.clear();
	map.removeLayer(filter_layer);
}


function Modify_Filter_Layer(filter_objet){
	var filter_layer;
    map.getLayers().forEach(function (lyr) {
    	if (lyr.get('id')) {
	        if ("id_filter_area_layer_" + filter_objet.filter_id == lyr.get('id')) {
	        	filter_layer = lyr;
	        }
    	}
    });

    //attention j'ai modifié le 09/08/2018
    var filter_source = filter_layer.getSource();
	filter_source.clear();


	var itemsInFilter = [];
	var totalDataPoints = 0;
	$.each(filter_objet.object, function (event, relevantItemRef) {
		itemsInFilter.push(turfItemMap[relevantItemRef]);
		var mapItem = objectMap[relevantItemRef];
		totalDataPoints += parseFloat(mapItem.getProperties().dataPoints);
		styleItem(mapItem,"highlight");
		filter_source.addFeature(mapItem)
	});

	var distance = null;
	try { distance = parseFloat(filter_objet.buffer_limit_1); }
	catch(err) { choucasLog("Invalid distance input"); }
	var fuzziness = null;
	try { fuzziness = parseFloat(filter_objet.buffer_limit_2); }
	catch(err) { choucasLog("Invalid buffer input"); }
	var calculateZones = true;
	if(isNaN(distance) && isNaN(fuzziness)) {
	  calculateZones = false; //If distance and fuzziness are null then dont calculate a zone
	} if (isNaN(distance) && !isNaN(fuzziness)) {
	  distance = 0; //If only distance is null then default it to 0
	} if (isNaN(fuzziness) && !isNaN(distance)) {
	  fuzziness = 0.05 //If only the buffer is null or 0 then default it to 0
	} if (fuzziness == 0) {
	  fuzziness = 0.05 //If only the buffer is null or 0 then default it to 0
	}

	//Caluclate the corresponding zone if required
	 if(calculateZones) {

	    if(totalDataPoints >= parseFloat(document.getElementById("zoneCalcWarning").value)) {
	      var confirmZoneCalcMessage= " \
	        Attention: Les objets sélectionnés pour ce filtre contiennent " + totalDataPoints +  " points de données. Donc le calcul de la zone peut être long.\n \
	        Si possible, commencez avec un autre indice, puis filtrez l'arbre des objets de la carte pour la plus petite zone actuelle.\n \
	        Pour éviter cet avertissement, modifiez le champ 'Avert. de zone calcul' sous la section 'Paramètres +/- \n \
	        Cliquez sur OK pour continuer le calcul de la zone, ou cliquez sur Annuler pour abandonner le calcul de la zone. \
	        ";

	      var confirmZoneCalc = confirm(confirmZoneCalcMessage)
	      if(!confirmZoneCalc) {
	        deselectAllNodes();
	        choucasLog("User aborted calculation of zone after data point number warning");
	        return;
	      }
	    }

	    choucasLog("User aborted calculation of zone after data point number warning with data points=" + totalDataPoints );

	    filterRecalcStartTime = Date.now();

	    //Calculate the zone for each item based on buffer / distance values
	    //This code buffers each item individually
	    var turfObjects = [];
	    $.each(itemsInFilter, function (event, item) {
	      var zone = null;
	      if(distance > 0) {
//	    	  console.log('modify with diff');
//	        var tmp = turf.buffer(item, distance, {units: "kilometers"});
//	        var distanceLine = turf.polygonToLine(tmp);
//	        zone = turf.buffer(distanceLine, fuzziness, {units: "kilometers"});
	    	  console.log('modify with diff');
		        var buffer_dist = turf.buffer(item, distance * 0.0127, {units: "degrees"});
		        var buffer_fuziness = turf.buffer(item, fuzziness * 0.0127, {units: "degrees"});
//		        var distanceLine = turf.polygonToLine(tmp);
		        zone = turf.difference(buffer_fuziness, buffer_dist);
	      } else {
	        //TODO: This is a dodgy hack as turf buffer was not calculating correct distances at 45 deg N
	        zone = turf.buffer(item, fuzziness * 0.0127, {units: "degrees"});
	      }
	      turfObjects.push(zone)
	    });

	    //Union all of the item zones to get a final overall zone for this filter
	    if(turfObjects.length > 0) {

	      //Use the individually buffered items
	      turfFinalResult = turf.union.apply(this, turfObjects);

	      //Combine all items and then buffer them as a group
	      //var fc = turf.featureCollection(itemsInFilter);
	      //var combined = turf.combine(fc);
	      //var turfFinalResult = turf.buffer(combined.features[0], fuzziness * 0.0127, {units: "degrees"});
	      //item.setProperties({"itemType": itemsInFilter.data.itemType });

	      var bufferedPoly = format.readFeature(turfFinalResult);
	      bufferedPoly.getGeometry().transform("EPSG:4326", "EPSG:3857");
	      filterZoneCache[selectedFilter] = bufferedPoly;

	      var buffer = document.getElementById("bufferInput" + selectedFilter).value;
	      if (0.0 != parseFloat(buffer)) {
	        //Add Zone To Map if buffer is not 0
	        //TODO: review this
	        styleItem(bufferedPoly,"highlightOutline", getHypNumberForFilter(selectedFilter));
	        filter_source.addFeature(bufferedPoly);
	      }
	    }
	    choucasLog("Zone recalculated for " + selectedFilter + " in: ", Date.now() - filterRecalcStartTime);
	  }

	 map.render();
}


//show a filter area
function Show_Filter_Layer(filter_id){

	var filter_layer;
    map.getLayers().forEach(function (lyr) {
    	if (lyr.get('id')) {
	        if ("id_filter_area_layer_" + filter_id == lyr.get('id')) {
	        	filter_layer = lyr;
	        }
    	}
    });
    filter_layer.setVisible(true);
//    filter_source = filter_layer.getSource();
}

//hide a filter area
function Hide_Filter_Layer(filter_id){
	var filter_layer;
    map.getLayers().forEach(function (lyr) {
    	if (lyr.get('id')) {
	        if ("id_filter_area_layer_" + filter_id == lyr.get('id')) {
	        	filter_layer = lyr;
	        }
    	}
    });
    filter_layer.setVisible(false);
}

function Remove_Heat_Map(){
	for(var a=0; a< heat_map_table.length; a++){

		var heat_map_layer;
        map.getLayers().forEach(function (lyr) {
        	if(lyr.get('id')){
        		if ("heat_map_layer_" + a == lyr.get('id')) {
        			heat_map_layer = lyr;
                }
        	}
        });
        if (heat_map_layer){
	        heat_map_layer.getSource().clear();
			map.removeLayer(heat_map_layer);
        }
	}

	heat_map_table = [];

	map.removeEventListener('pointermove');
}

function Create_Heat_Map(filter_list,condition){


	for(var a=0; a< heat_map_table.length; a++){

		var heat_map_layer;
        map.getLayers().forEach(function (lyr) {
        	if(lyr.get('id')){
        		if ("heat_map_layer_" + a == lyr.get('id')) {
        			heat_map_layer = lyr;
                }
        	}
        });
        heat_map_layer.getSource().clear();
		map.removeLayer(heat_map_layer);
	}

	heat_map_table = [];

//	map.removeLayer(heat_map_Layer);
//	heat_map_source.clear();

	var intersections = [];
    var filtersInTurfFormat = [];

    //source correspondant aux zone intersectées par les différents filtres
    var intersect_source;


    for (k = 0; k < filter_list.length; ++k) {

    	var filter_objet = filter_list[k];

    	var filter_layer;
        map.getLayers().forEach(function (lyr) {
        	if(lyr.get('id')){
        		if ("id_filter_area_layer_" + filter_objet.id_hypothesis == lyr.get('id')) {
                	filter_layer = lyr;
                }
        	}
        });

        var filter_source = filter_layer.getSource();

        var color_filtre;

        svg_story_tree_container.selectAll('.story_tree_hypothesis_element').each(function() {
        	if(this.id == filter_objet.id_hypothesis){
        		color_filtre = d3.select(this).style('fill');
        	}
    	});
        var color_filtre_array = color_filtre.split(',');
        var color_filtre_red = color_filtre_array[0].split('(')[1];
        var color_filtre_green = color_filtre_array[1];
        var color_filtre_blue = color_filtre_array[2].split(')')[0];
        var color_filtre_alpha = 0.1*k + 0.05;
        var color_filtre_fill = 'rgba(' + color_filtre_red + ',' + color_filtre_green + ',' + color_filtre_blue + ',' + color_filtre_alpha + ')';



        if(k==0){
        	//heat_map_source est égal à la source du premier filtre
        	intersect_source = new ol.source.Vector({});
        	intersect_source.addFeatures(filter_source.getFeatures());
        	var new_item_table_id = "heat_map_layer_" + k ;
        	var new_item_table_source = new ol.source.Vector({});

        	filter_source.getFeatures().forEach(
        			function(e){
        				if(e.getGeometry().getType() == 'MultiPolygon' || e.getGeometry().getType() == 'Polygon'){
        					new_item_table_source.addFeature(e);
        				}
        			}
        		);


        	new_item_table_source.getFeatures().forEach(function(element) {
	        		element.setStyle(new ol.style.Style({
	    				fill: new ol.style.Fill({ color: color_filtre_fill }),
	                	stroke: new ol.style.Stroke({  width:2 , color: color_filtre })
	                })
                )
        	});



        	heat_map_table.push({'id': new_item_table_id, 'source': new_item_table_source, 'id_hypothesis':filter_objet.id_hypothesis});
        } else {
        	//heat_map_source est égal à l'intersection entre la source du filtre k et les intersections des filtres précédent

        	var neo_intersect_source = new ol.source.Vector({});

        	//calcul de neo_heat_map_source

        	var GeoJSON_format = new ol.format.GeoJSON();



        	var features_group_1 = [];
        	var features_group_2 = [];

        	intersect_source.getFeatures().forEach(function(element){
        		if (element.getGeometry().getType() == "MultiPolygon") {
        			element.getGeometry().getPolygons().forEach( function(poly) {
        				features_group_1.push(new ol.Feature({ geometry: poly }));
        	          });
        		} else {
        			features_group_1.push(new ol.Feature({ geometry: element.getGeometry() }));
        		}
        	});


        	filter_source.getFeatures().forEach(function(element){
        		if (element.getGeometry().getType() == "MultiPolygon") {
        			element.getGeometry().getPolygons().forEach( function(poly) {
        				features_group_2.push(new ol.Feature({ geometry: poly }));
        	          });
        		} else if(element.getGeometry().getType() == "Polygon") {
        			features_group_2.push(new ol.Feature({ geometry: element.getGeometry() }));
        		}
        	});

        	var conflictlist = [];

        	for (var i = 0; i < features_group_1.length; i++) {
        		var feature_from_1 = GeoJSON_format.writeFeatureObject(features_group_1[i]);
        		for (var j = 0; j <features_group_2.length; j++) {
        			var feature_from_2 = GeoJSON_format.writeFeatureObject(features_group_2[j]);
        			var conflict = turf.intersect(feature_from_1, feature_from_2);
    	            if (conflict != null) {
    	            	conflictlist.push(conflict);
    	            }
        		}
        	}

        	for(var o=0; o<conflictlist.length; o++){
        		neo_intersect_source.addFeature(GeoJSON_format.readFeature(conflictlist[o]));
        	}


        	intersect_source.clear();
        	intersect_source.addFeatures(neo_intersect_source.getFeatures());

        	var new_item_table_id = "heat_map_layer_" + k ;
        	var new_item_table_source = new ol.source.Vector({});
        	new_item_table_source.addFeatures(neo_intersect_source.getFeatures());

        	new_item_table_source.getFeatures().forEach(function(element) {
        		element.setStyle(new ol.style.Style({
        			fill: new ol.style.Fill({ color: color_filtre_fill }),
                	stroke: new ol.style.Stroke({ color: color_filtre })
                })
                )
        	});

        	heat_map_table.push({'id': new_item_table_id, 'source': new_item_table_source, 'id_hypothesis':filter_objet.id_hypothesis});
        }

    }

    for(var a = 0; a < heat_map_table.length; a++){
    	if(condition =='all'){
	    	map.addLayer( new ol.layer.Vector({
	    		id:  heat_map_table[a].id,
	    		title: heat_map_table[a].id,
	    		source: heat_map_table[a].source
	    	}));
    	} else if(condition =='only'){
    		if(a == heat_map_table.length-1){
    			map.addLayer( new ol.layer.Vector({
    	    		id:  heat_map_table[a].id,
    	    		title: heat_map_table[a].id,
    	    		source: heat_map_table[a].source
    	    	}));
    		}
    	}
    }

    //feature_box.getSource().getExtent();
    var map_Extent;
    if(condition =='all'){

    	 var filter_layer;
		    map.getLayers().forEach(function (lyr) {
		    	if (lyr.get('id')) {
			        if ("heat_map_layer_" + 0  == lyr.get('id')) {
			        	filter_layer = lyr;
			        }
		    	}
		    });

    	map_Extent = heat_map_table[0].source.getExtent();
    	map.getView().fit(map_Extent, map.getSize());
    	load_tree(filter_layer);

    } else if(condition =='only'){

    	var filter_layer;
	    map.getLayers().forEach(function (lyr) {
	    	if (lyr.get('id')) {
		        if ("heat_map_layer_" + (heat_map_table.length-1)  == lyr.get('id')) {
		        	filter_layer = lyr;
		        }
	    	}
	    });

    	map_Extent = heat_map_table[heat_map_table.length-1].source.getExtent();
    	map.getView().fit(map_Extent, map.getSize());
    	load_tree(filter_layer);

    }


//    map.removeEventListener('pointermove');
    map.removeEventListener(map_hover_event);
//    map.unByKey(map_hover_event);

    map_hover_event = map.on('pointermove', function(evt) {
    	  if (evt.dragging) {
    	    return;
    	  }
    	  var pixel = map.getEventPixel(evt.originalEvent);

    	  var list_hypothesis = [];

    	  map.forEachFeatureAtPixel(pixel, function(feature, layer) {
		    		  for(var r=0; r< heat_map_table.length; r++){
		    			  if(heat_map_table[r].id == layer.get('id')){
		    				  list_hypothesis.push(heat_map_table[r].id_hypothesis)
		    				  break;
		    			  }
		    		  }
    		    });


    	  var id_of_heat_map_to_highlight = null;
    	  if(list_hypothesis.length > 0){
    		  var longest_node_id = '';
    		  var id_layer_to_hightlight;
    		  for(var r=0; r< list_hypothesis.length; r++){
    			  for(var u=0; u< filter_list.length; u++){
    				  if(filter_list[u].id_hypothesis == list_hypothesis[r]){
    					  var neo_longest_node_id = longest_node_id
    					  if(longest_node_id.length < filter_list[u].id_hypothesis_node.length){
    						  neo_longest_node_id = filter_list[u].id_hypothesis_node;
    						  id_layer_to_hightlight = filter_list[u].id_hypothesis;
    					  }
    					  longest_node_id = neo_longest_node_id;
    					  break;
    				  }

    			  }
    		  }



    		  for(var u=0; u< filter_list.length; u++){
    			  var id_node = filter_list[u].id_hypothesis;
    			  svg_story_tree_container.selectAll('.story_tree_hypothesis_element').each(function() {
  					if(id_node == this.id){
  						d3.select(this).style("stroke-width", "2");
						d3.select(this).style("stroke", "blue");
  					}
  				});
    		  }


    			  svg_story_tree_container.selectAll('.story_tree_hypothesis_element').each(function() {
  					if(id_layer_to_hightlight == this.id){
  						d3.select(this).style("stroke-width", "7");
  						d3.select(this).style("stroke", "#3b5998");
  					}
  				});




    		//set stroke-size to high size for the layer which has the longest node id

    		  for(var k=0; k < filter_list.length; k++){
    			  if(filter_list[k].id_hypothesis == id_layer_to_hightlight){
    				  id_of_heat_map_to_highlight = k;
    				  break;
    			  }
    		  }

    		  for(var r=0; r< filter_list.length; r++){
    			  var filter_layer;
    			  map.getLayers().forEach(function (lyr) {
          		    	if (lyr.get('id')) {
          			        if ("heat_map_layer_" + r  == lyr.get('id')) {
          			        	filter_layer = lyr;
          			        }
          		    	}
    			  });
    			  if (filter_layer){
    			  filter_layer.getSource().getFeatures().forEach(function(element) {
          		    	var fill_color_feature = element.getStyle().getFill().getColor();
          		    	var stroke_color_feature = element.getStyle().getStroke().getColor();
                  		element.setStyle(new ol.style.Style({
                  			fill: new ol.style.Fill({ color: fill_color_feature }),
                  			stroke: new ol.style.Stroke({ width:2 , color: stroke_color_feature })
                          })
                          )
                  	});
    			  }
    		  }





    	  } else {
    		  for(var r=0; r< filter_list.length; r++){
    			  svg_story_tree_container.selectAll('.story_tree_hypothesis_element').each(function() {
  					if(filter_list[r].id_hypothesis == this.id){
  						d3.select(this).style("stroke-width", "2");
  						d3.select(this).style("stroke", "blue");
  					}
  				});

    			  var filter_layer;
    			  map.getLayers().forEach(function (lyr) {
	      		    	if (lyr.get('id')) {
	      			        if ("heat_map_layer_" + r  == lyr.get('id')) {
	      			        	filter_layer = lyr;
	      			        }
	      		    	}
    			  });
    			  if (filter_layer){
	    			  filter_layer.getSource().getFeatures().forEach(function(element) {
		      		    	var fill_color_feature = element.getStyle().getFill().getColor();
		      		    	var stroke_color_feature = element.getStyle().getStroke().getColor();
		              		element.setStyle(new ol.style.Style({
		              			fill: new ol.style.Fill({ color: fill_color_feature }),
		              			stroke: new ol.style.Stroke({ width:2 , color: stroke_color_feature })
		                      })
		                      )
		              	});
    			  }

    		  }
    	  }

    	  if(id_of_heat_map_to_highlight != null){

    		  var filter_layer;
  		    map.getLayers().forEach(function (lyr) {
  		    	if (lyr.get('id')) {
  			        if ("heat_map_layer_" + id_of_heat_map_to_highlight  == lyr.get('id')) {
  			        	filter_layer = lyr;
  			        }
  		    	}
  		    });

  		    filter_layer.getSource().getFeatures().forEach(function(element) {
  		    	var fill_color_feature = element.getStyle().getFill().getColor();
  		    	var stroke_color_feature = element.getStyle().getStroke().getColor();
          		element.setStyle(new ol.style.Style({
          			fill: new ol.style.Fill({ color: fill_color_feature }),
          			stroke: new ol.style.Stroke({ width:8 , color: stroke_color_feature })
                  })
                  )
          	});
  		    highlighted_heat_map_feature = filter_layer;
    	  } else {
    		  highlighted_heat_map_feature = null;
    	  }


    	});



}

