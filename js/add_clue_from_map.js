import {app,
	rank_1_clue,
	group_of_rank_1_clue,
	rank_2_clue,
	group_rank_1_to_rank_2} from "./clue_element.js";
//import {map} from "./choucas.js";
import {map_1,
	map_2,
	map_3,
	map_4,
	ZRI_extent,
	reset_ZRI_extent} from "./choucas.js";
import {add_element_of_reference,
	clear_clue_to_select_state,
	put_clue_map_element_to_select,
	create_trajectory_point,
	add_rank_2_clue_to_map,
	create_buffer,
	add_rank_3_clue_to_map,
	create_rank_3_clue_raster,
	add_draw_buffer_to_map,
	map_element_worker,
	intersect_all_features,
	reset_ZRI,
	create_grid,
	create_grid_2} from "./map_element.js";
import {redraw_clue_window,
	remove_all_clue_of_select,
	put_clue_to_select} from "./clue_window.js";
import {begining_point_color,
	past_point_color,
	to_pass_point_color,
	destination_point_color,
	begining_point_url,
	to_pass_point_url,
	past_point_url,
	destination_point_url,
	hexToRgb} from "./color_function.js";
import {getAdresse} from "./add_clue_from_adress.js";
import {loadMapItemsFromZRI} from './choucas_itemtree.js';
import {initalize_grass_function} from './grass_function.js';
import {add_add_clue_menu_settings} from './add_clue_from_clue_window.js';

var right_click_element;

var launch_add_buffer = {"fct":null};

var draw_interaction;
var draw_interaction_2;

const rank_1_clue_object_id_list = [];
const  rank_2_clue_object_id_list = [];
const rank_3_clue_object_id_list = [];

var global_coord;

var filter_on_map_feature;

const draw_source = new ol.source.Vector({});
const draw_layer = new ol.layer.Vector({
	id:  "id_draw_layer",
	title: "draw_layer",
	source: draw_source
});
const rank_1_clue_source = new ol.source.Vector({});
const rank_1_clue_layer = new ol.layer.Vector({
	id:  "id_rank_1_clue_layer",
	title: "rank_1_clue_layer",
	source: rank_1_clue_source
});
const rank_2_clue_source = new ol.source.Vector({});
const rank_2_clue_layer = new ol.layer.Vector({
	renderMode: 'image',
	id:  "id_rank_2_clue_layer",
	title: "rank_2_clue_layer",
	source: rank_2_clue_source
});

//const rank_3_clue_source = new ol.source.Vector({});
//const rank_3_clue_layer = new ol.layer.Vector({
//	id:  "id_rank_3_clue_layer",
//	title: "rank_3_clue_layer",
//	source: rank_3_clue_source
//});
const rank_3_clue_layer_source_array = [];

const object_of_interest_source = new ol.source.Vector({});
const object_of_interest_layer = new ol.layer.Vector({
	id:  "object_of_interest",
	title: "object_of_interest",
	source: object_of_interest_source
});
const clue_on_hover_source = new ol.source.Vector({});
const clue_on_hover_layer = new ol.layer.Vector({
	id:  "clue_on_hover",
	title: "clue_on_hover",
	source: clue_on_hover_source
});
const clue_on_select_source = new ol.source.Vector({});
const clue_on_select_layer = new ol.layer.Vector({
	id:  "clue_on_select",
	title: "clue_on_select",
	source: clue_on_select_source
});

const ZRI_source = new ol.source.Vector({});
const ZRI_layer = new ol.layer.Vector({
	id:  "ZRI",
	title: "ZRI",
	source: ZRI_source
});

/*
 * initialize_add_clue_on_map
 *
 * initialize map and right clic map functions
 */
function initialize_add_clue_on_map(){
	//TODO small multiple
	filter_on_map_feature = null;

	for(var p = 0; p < app.map_collection.length; p++){

		var add_ref = false;
		var small_multiple_map;
		for(var t=0; t<app.small_multiple_map_id_array.length; t++){
			if(app.small_multiple_map_id_array[t].id_map == app.map_collection[p].id_map){
				small_multiple_map = app.small_multiple_map_id_array[t];
				break;
			}
		}
		for(var t=0; t<small_multiple_map.list_map_elements.length; t++){
			if(small_multiple_map.list_map_elements[t].type_clue == 1 || small_multiple_map.list_map_elements[t].type_clue == 2){
				add_ref = true;
				break;
			}
		}

		switch (app.map_collection[p].map) {
		  case 'map_1':
			  if(add_ref == true){
				  map_1.addLayer(rank_1_clue_layer);
				  map_1.addLayer(rank_2_clue_layer);
			  }
			  for(var t=0; t<small_multiple_map.list_map_elements.length; t++){
					if(small_multiple_map.list_map_elements[t].type_clue == 3){
						for(var o = 0; o < rank_3_clue_layer_source_array.length; o++){
							if(rank_3_clue_layer_source_array[o].clue_id == small_multiple_map.list_map_elements[t].id_clue){
								map_1.addLayer(rank_3_clue_layer_source_array[o].layer);
								break;
							}
					  }
					}
				}

				map_1.addLayer(object_of_interest_layer);
				map_1.addLayer(clue_on_hover_layer);
				map_1.addLayer(clue_on_select_layer);
				map_1.addLayer(ZRI_layer);
				map_1.addLayer(draw_layer);
				map_1.getViewport().addEventListener('contextmenu', function (evt) {

					 evt.preventDefault();

				    var list_feature = [];
				    var list_layer = [];

				    $('.clue_window_menu').css("display","none");
				    $('.map_filter_menu').css("display","none");
				    $('.add_clue_from_tree_menu').css("display","none");

				    if(evt.shiftKey == true){
						right_click_element = evt;
						$('#popup_div_add-clue-menu').show();
						add_add_clue_menu_settings(right_click_element,"map_1");
						return;
					}

				    map_1.forEachFeatureAtPixel([evt.offsetX,evt.offsetY], function (feature, layer) {
				    	list_feature.push(feature);
				    	list_layer.push(layer);
				    });
				    var y_popup = parseInt(evt.offsetY);
				    var x_popup = parseInt(evt.offsetX);
				    if(list_feature.length > 0){
				    	if(list_feature[0].get('id_clue')){
				    		if(list_feature[0].get('id').substr(0, 16) == 'trajectory_point'){
					    		$('#map_filter_opening_menu_with_trajectory_point').css("display","block");
								$('#map_filter_opening_menu_with_trajectory_point').css("top",y_popup + 'px');
								$('#map_filter_opening_menu_with_trajectory_point').css("left",x_popup + 'px');
								right_click_element = evt;
				    		} else if(list_feature[0].get('id').substr(0, 20) == 'element_of_reference'){
				    			$('#map_filter_opening_menu_with_element_of_reference').css("display","block");
								$('#map_filter_opening_menu_with_element_of_reference').css("top",y_popup + 'px');
								$('#map_filter_opening_menu_with_element_of_reference').css("left",x_popup + 'px');
								right_click_element = evt;
				    		}
				    	} else if(list_layer[0].get('id').substr(0, 18) == 'object_of_interest') {
				    		$('#map_filter_opening_menu_with_object_of_interest').css("display","block");
							$('#map_filter_opening_menu_with_object_of_interest').css("top",y_popup + 'px');
							$('#map_filter_opening_menu_with_object_of_interest').css("left",x_popup + 'px');
							right_click_element = evt;
				    	} else if(list_layer[0].get('id').substr(0, 20) == 'id_rank_2_clue_layer') {
				    		$('#map_filter_opening_menu').css("display","block");
							$('#map_filter_opening_menu').css("top",y_popup + 'px');
							$('#map_filter_opening_menu').css("left",x_popup + 'px');
							right_click_element = evt;
				    	} else {
				    		$('#map_filter_opening_menu_with_feature').css("display","block");
							$('#map_filter_opening_menu_with_feature').css("top",y_popup + 'px');
							$('#map_filter_opening_menu_with_feature').css("left",x_popup + 'px');
							right_click_element = evt;
				    	}
				    } else {
					    $('#map_filter_opening_menu').css("display","block");
						$('#map_filter_opening_menu').css("top",y_popup + 'px');
						$('#map_filter_opening_menu').css("left",x_popup + 'px');
						right_click_element = evt;
				    }
				    $('#popup_div_container').css("display","none");
				});
				//TODO bug, les objets déplacé en drag and drop sont sélectionnés
				  map_1.getViewport().addEventListener('click', function (evt) {
					  $('.map_filter_menu').fadeOut();
					  if (dragging == 1){
					  	var list_feature_to_select = []
					  	map_1.forEachFeatureAtPixel([evt.offsetX,evt.offsetY], function (feature, layer) {
					    	if(layer){
					    		if(layer.get('id') ==  "id_rank_1_clue_layer"){
						    		if(feature.get('id').substr(0, 16) == 'trajectory_point' || feature.get('id').substr(0, 20) == 'element_of_reference'){
							    		list_feature_to_select.push(feature);
							    	}
						    	}
					    	}
					    });
					  	if(list_feature_to_select.length == 0){
					  		if(evt.shiftKey == false){
						  		remove_all_clue_of_select();
					  		}
					  	} else {
						  	for(var i= 0; i<list_feature_to_select.length; i++){
						  		var feature = list_feature_to_select[i];
						  		if(evt.shiftKey){
						  			var id_clue = feature.get('id_clue');
						  			if($("#"+ id_clue + "_rank_1_clue_container").hasClass("selected_clue")){
						  				$("#"+ id_clue + "_rank_1_clue_container").removeClass("selected_clue");
						  				$("#"+ id_clue + "_rank_1_clue_container").find( ".rank_1_clue_limits " ).css( "stroke-width",1);
						  				$("#"+ id_clue + "_rank_1_clue_container").find( ".rank_1_clue_limits " ).css( "stroke","black");
						  			} else {
						  				$("#"+ id_clue + "_rank_1_clue_container").addClass("selected_clue");
						  				$("#"+ id_clue + "_rank_1_clue_container").find( ".rank_1_clue_limits " ).css( "stroke-width",3);
						  				$("#"+ id_clue + "_rank_1_clue_container").find( ".rank_1_clue_limits " ).css( "stroke",select_color_hexa);
									}
						  			clear_clue_to_select_state();
									 for(var o = 0; o< $(".clue_window_element").length; o++){
										 var element = $(".clue_window_element")[o];
										 if($(element).hasClass("rank_1_clue_container") && $(element).hasClass("selected_clue")){
											 var id_clue = $(element).attr('id').split('_')[0];
											 put_clue_map_element_to_select(id_clue);
										 }
									 }
						  		} else {
						  			remove_all_clue_of_select();
						  			var id_clue = feature.get('id_clue');
						  			put_clue_to_select(id_clue);
						  		}
						  	}
					  	}
					  }
				  });
				  break;
		  case 'map_2':
			  if(add_ref == true){
				  map_2.addLayer(rank_1_clue_layer);
				  map_2.addLayer(rank_2_clue_layer);
			  }
			  for(var t=0; t<small_multiple_map.list_map_elements.length; t++){
					if(small_multiple_map.list_map_elements[t].type_clue == 3){
						for(var o = 0; o < rank_3_clue_layer_source_array.length; o++){
							if(rank_3_clue_layer_source_array[o].clue_id == small_multiple_map.list_map_elements[t].id_clue){
								map_2.addLayer(rank_3_clue_layer_source_array[o].layer);
								break;
							}
					  }
					}
				}
				map_2.addLayer(object_of_interest_layer);
				map_2.addLayer(clue_on_hover_layer);
				map_2.addLayer(clue_on_select_layer);
				map_2.addLayer(ZRI_layer);
				map_2.addLayer(draw_layer);
				map_2.getViewport().addEventListener('contextmenu', function (evt) {
				    evt.preventDefault();

				    var list_feature = [];
				    var list_layer = [];

				    $('.clue_window_menu').css("display","none");
				    $('.map_filter_menu').css("display","none");
				    $('.add_clue_from_tree_menu').css("display","none");

				    if(evt.shiftKey == true){
						right_click_element = evt;
						$('#popup_div_add-clue-menu').show();
						add_add_clue_menu_settings(right_click_element,"map_2");
						return;
					}

				    map_2.forEachFeatureAtPixel([evt.offsetX,evt.offsetY], function (feature, layer) {
				    	list_feature.push(feature);
				    	list_layer.push(layer);
				    });
				    var y_popup;
				    var x_popup;
				    switch (app.map_collection.length) {
				    	case 2:
				    		y_popup = parseInt(evt.offsetY);
				    		x_popup = parseInt(evt.offsetX) + parseInt($("#2_map_2")[0].offsetLeft);
				    		break;
				    	case 3:
				    		y_popup = parseInt(evt.offsetY) + parseInt($("#3_map_2")[0].offsetTop);
				    		x_popup = parseInt(evt.offsetX) + parseInt($("#3_map_2")[0].offsetLeft);
				    		break;
				    	case 4:
				    		y_popup = parseInt(evt.offsetY);
				    		x_popup = parseInt(evt.offsetX) + parseInt($("#4_map_2")[0].offsetLeft);
				    		break;
				    	default:
				    		break;
				    }
				    if(list_feature.length > 0){
				    	if(list_feature[0].get('id_clue')){
				    		if(list_feature[0].get('id').substr(0, 16) == 'trajectory_point'){
					    		$('#map_filter_opening_menu_with_trajectory_point').css("display","block");
								$('#map_filter_opening_menu_with_trajectory_point').css("top",y_popup + 'px');
								$('#map_filter_opening_menu_with_trajectory_point').css("left",x_popup + 'px');
								right_click_element = evt;
				    		} else if(list_feature[0].get('id').substr(0, 20) == 'element_of_reference'){
				    			$('#map_filter_opening_menu_with_element_of_reference').css("display","block");
								$('#map_filter_opening_menu_with_element_of_reference').css("top",y_popup + 'px');
								$('#map_filter_opening_menu_with_element_of_reference').css("left",x_popup + 'px');
								right_click_element = evt;
				    		}
				    	} else if(list_layer[0].get('id').substr(0, 18) == 'object_of_interest') {
				    		$('#map_filter_opening_menu_with_object_of_interest').css("display","block");
							$('#map_filter_opening_menu_with_object_of_interest').css("top",y_popup + 'px');
							$('#map_filter_opening_menu_with_object_of_interest').css("left",x_popup + 'px');
							right_click_element = evt;
				    	} else if(list_layer[0].get('id').substr(0, 20) == 'id_rank_2_clue_layer') {
				    		$('#map_filter_opening_menu').css("display","block");
							$('#map_filter_opening_menu').css("top",y_popup + 'px');
							$('#map_filter_opening_menu').css("left",x_popup + 'px');
							right_click_element = evt;
				    	} else {
				    		$('#map_filter_opening_menu_with_feature').css("display","block");
							$('#map_filter_opening_menu_with_feature').css("top",y_popup + 'px');
							$('#map_filter_opening_menu_with_feature').css("left",x_popup + 'px');
							right_click_element = evt;
				    	}
				    } else {
					    $('#map_filter_opening_menu').css("display","block");
						$('#map_filter_opening_menu').css("top",y_popup + 'px');
						$('#map_filter_opening_menu').css("left",x_popup + 'px');
						right_click_element = evt;
				    }
				    $('#popup_div_container').css("display","none");
				});
				//TODO bug, les objets déplacé en drag and drop sont sélectionnés
				  map_2.getViewport().addEventListener('click', function (evt) {
					  $('.map_filter_menu').fadeOut();
					  if (dragging == 1){
					  	var list_feature_to_select = []
					  	map_2.forEachFeatureAtPixel([evt.offsetX,evt.offsetY], function (feature, layer) {
					    	if(layer){
					    		if(layer.get('id') ==  "id_rank_1_clue_layer"){
						    		if(feature.get('id').substr(0, 16) == 'trajectory_point' || feature.get('id').substr(0, 20) == 'element_of_reference'){
							    		list_feature_to_select.push(feature);
							    	}
						    	}
					    	}
					    });
					  	if(list_feature_to_select.length == 0){
					  		if(evt.shiftKey == false){
						  		remove_all_clue_of_select();
					  		}
					  	} else {
						  	for(var i= 0; i<list_feature_to_select.length; i++){
						  		var feature = list_feature_to_select[i];
						  		if(evt.shiftKey){
						  			var id_clue = feature.get('id_clue');
						  			if($("#"+ id_clue + "_rank_1_clue_container").hasClass("selected_clue")){
						  				$("#"+ id_clue + "_rank_1_clue_container").removeClass("selected_clue");
						  				$("#"+ id_clue + "_rank_1_clue_container").find( ".rank_1_clue_limits " ).css( "stroke-width",1);
						  				$("#"+ id_clue + "_rank_1_clue_container").find( ".rank_1_clue_limits " ).css( "stroke","black");
						  			} else {
						  				$("#"+ id_clue + "_rank_1_clue_container").addClass("selected_clue");
						  				$("#"+ id_clue + "_rank_1_clue_container").find( ".rank_1_clue_limits " ).css( "stroke-width",3);
						  				$("#"+ id_clue + "_rank_1_clue_container").find( ".rank_1_clue_limits " ).css( "stroke",select_color_hexa);
									}
						  			clear_clue_to_select_state();
									 for(var o = 0; o< $(".clue_window_element").length; o++){
										 var element = $(".clue_window_element")[o];
										 if($(element).hasClass("rank_1_clue_container") && $(element).hasClass("selected_clue")){
											 var id_clue = $(element).attr('id').split('_')[0];
											 put_clue_map_element_to_select(id_clue);
										 }
									 }
						  		} else {
						  			remove_all_clue_of_select();
						  			var id_clue = feature.get('id_clue');
						  			put_clue_to_select(id_clue);
						  		}
						  	}
					  	}
					  }
				  });
				  break;
		  case 'map_3':
			  if(add_ref == true){
				  map_3.addLayer(rank_1_clue_layer);
				  map_3.addLayer(rank_2_clue_layer);
			  }
			  for(var t=0; t<small_multiple_map.list_map_elements.length; t++){
					if(small_multiple_map.list_map_elements[t].type_clue == 3){
						for(var o = 0; o < rank_3_clue_layer_source_array.length; o++){
							if(rank_3_clue_layer_source_array[o].clue_id == small_multiple_map.list_map_elements[t].id_clue){
								map_3.addLayer(rank_3_clue_layer_source_array[o].layer);
								break;
							}
					  }
					}
				}
				map_3.addLayer(object_of_interest_layer);
				map_3.addLayer(clue_on_hover_layer);
				map_3.addLayer(clue_on_select_layer);
				map_3.addLayer(ZRI_layer);
				map_3.addLayer(draw_layer);
				map_3.getViewport().addEventListener('contextmenu', function (evt) {
				    evt.preventDefault();

				    var list_feature = [];
				    var list_layer = [];

				    $('.clue_window_menu').css("display","none");
				    $('.map_filter_menu').css("display","none");
				    $('.add_clue_from_tree_menu').css("display","none");

				    if(evt.shiftKey == true){
						right_click_element = evt;
						$('#popup_div_add-clue-menu').show();
						add_add_clue_menu_settings(right_click_element,"map_3");
						return;
					}

				    map_3.forEachFeatureAtPixel([evt.offsetX,evt.offsetY], function (feature, layer) {
				    	list_feature.push(feature);
				    	list_layer.push(layer);
				    });
				    var y_popup;
				    var x_popup;
				    switch (app.map_collection.length) {
				    	case 3:
				    		x_popup = parseInt(evt.offsetX) + parseInt($("#3_map_3")[0].offsetLeft);
				    		y_popup = parseInt(evt.offsetY) + parseInt($("#3_map_3")[0].offsetTop);
				    		break;
				    	case 4:
				    		x_popup = parseInt(evt.offsetX);
				    		y_popup = parseInt(evt.offsetY) + parseInt($("#4_map_3")[0].offsetTop);
				    		break;
				    	default:
				    		break;
				    }
				    if(list_feature.length > 0){
				    	if(list_feature[0].get('id_clue')){
				    		if(list_feature[0].get('id').substr(0, 16) == 'trajectory_point'){
					    		$('#map_filter_opening_menu_with_trajectory_point').css("display","block");
								$('#map_filter_opening_menu_with_trajectory_point').css("top",y_popup + 'px');
								$('#map_filter_opening_menu_with_trajectory_point').css("left",x_popup + 'px');
								right_click_element = evt;
				    		} else if(list_feature[0].get('id').substr(0, 20) == 'element_of_reference'){
				    			$('#map_filter_opening_menu_with_element_of_reference').css("display","block");
								$('#map_filter_opening_menu_with_element_of_reference').css("top",y_popup + 'px');
								$('#map_filter_opening_menu_with_element_of_reference').css("left",x_popup + 'px');
								right_click_element = evt;
				    		}
				    	} else if(list_layer[0].get('id').substr(0, 18) == 'object_of_interest') {
				    		$('#map_filter_opening_menu_with_object_of_interest').css("display","block");
							$('#map_filter_opening_menu_with_object_of_interest').css("top",y_popup + 'px');
							$('#map_filter_opening_menu_with_object_of_interest').css("left",x_popup + 'px');
							right_click_element = evt;
				    	} else if(list_layer[0].get('id').substr(0, 20) == 'id_rank_2_clue_layer') {
				    		$('#map_filter_opening_menu').css("display","block");
							$('#map_filter_opening_menu').css("top",y_popup + 'px');
							$('#map_filter_opening_menu').css("left",x_popup + 'px');
							right_click_element = evt;
				    	} else {
				    		$('#map_filter_opening_menu_with_feature').css("display","block");
							$('#map_filter_opening_menu_with_feature').css("top",y_popup + 'px');
							$('#map_filter_opening_menu_with_feature').css("left",x_popup + 'px');
							right_click_element = evt;
				    	}
				    } else {
					    $('#map_filter_opening_menu').css("display","block");
						$('#map_filter_opening_menu').css("top",y_popup + 'px');
						$('#map_filter_opening_menu').css("left",x_popup + 'px');
						right_click_element = evt;
				    }
				    $('#popup_div_container').css("display","none");
				});
				//TODO bug, les objets déplacé en drag and drop sont sélectionnés
				  map_3.getViewport().addEventListener('click', function (evt) {
					  $('.map_filter_menu').fadeOut();
					  if (dragging == 1){
					  	var list_feature_to_select = []
					  	map_3.forEachFeatureAtPixel([evt.offsetX,evt.offsetY], function (feature, layer) {
					    	if(layer){
					    		if(layer.get('id') ==  "id_rank_1_clue_layer"){
						    		if(feature.get('id').substr(0, 16) == 'trajectory_point' || feature.get('id').substr(0, 20) == 'element_of_reference'){
							    		list_feature_to_select.push(feature);
							    	}
						    	}
					    	}
					    });
					  	if(list_feature_to_select.length == 0){
					  		if(evt.shiftKey == false){
						  		remove_all_clue_of_select();
					  		}
					  	} else {
						  	for(var i= 0; i<list_feature_to_select.length; i++){
						  		var feature = list_feature_to_select[i];
						  		if(evt.shiftKey){
						  			var id_clue = feature.get('id_clue');
						  			if($("#"+ id_clue + "_rank_1_clue_container").hasClass("selected_clue")){
						  				$("#"+ id_clue + "_rank_1_clue_container").removeClass("selected_clue");
						  				$("#"+ id_clue + "_rank_1_clue_container").find( ".rank_1_clue_limits " ).css( "stroke-width",1);
						  				$("#"+ id_clue + "_rank_1_clue_container").find( ".rank_1_clue_limits " ).css( "stroke","black");
						  			} else {
						  				$("#"+ id_clue + "_rank_1_clue_container").addClass("selected_clue");
						  				$("#"+ id_clue + "_rank_1_clue_container").find( ".rank_1_clue_limits " ).css( "stroke-width",3);
						  				$("#"+ id_clue + "_rank_1_clue_container").find( ".rank_1_clue_limits " ).css( "stroke",select_color_hexa);
									}
						  			clear_clue_to_select_state();
									 for(var o = 0; o< $(".clue_window_element").length; o++){
										 var element = $(".clue_window_element")[o];
										 if($(element).hasClass("rank_1_clue_container") && $(element).hasClass("selected_clue")){
											 var id_clue = $(element).attr('id').split('_')[0];
											 put_clue_map_element_to_select(id_clue);
										 }
									 }
						  		} else {
						  			remove_all_clue_of_select();
						  			var id_clue = feature.get('id_clue');
						  			put_clue_to_select(id_clue);
						  		}
						  	}
					  	}
					  }
				  });
				  break;
		  case 'map_4':
			  if(add_ref == true){
				  map_4.addLayer(rank_1_clue_layer);
				  map_4.addLayer(rank_2_clue_layer);
			  }
			  for(var t=0; t<small_multiple_map.list_map_elements.length; t++){
					if(small_multiple_map.list_map_elements[t].type_clue == 3){
						for(var o = 0; o < rank_3_clue_layer_source_array.length; o++){
							if(rank_3_clue_layer_source_array[o].clue_id == small_multiple_map.list_map_elements[t].id_clue){
								map_4.addLayer(rank_3_clue_layer_source_array[o].layer);
								break;
							}
					  }
					}
				}
				map_4.addLayer(object_of_interest_layer);
				map_4.addLayer(clue_on_hover_layer);
				map_4.addLayer(clue_on_select_layer);
				map_4.addLayer(ZRI_layer);
				map_4.addLayer(draw_layer);
				map_4.getViewport().addEventListener('contextmenu', function (evt) {
				    evt.preventDefault();

				    var list_feature = [];
				    var list_layer = [];

				    $('.clue_window_menu').css("display","none");
				    $('.map_filter_menu').css("display","none");
				    $('.add_clue_from_tree_menu').css("display","none");

				    if(evt.shiftKey == true){
						right_click_element = evt;
						$('#popup_div_add-clue-menu').show();
						add_add_clue_menu_settings(right_click_element,"map_4");
						return;
					}

				    map_4.forEachFeatureAtPixel([evt.offsetX,evt.offsetY], function (feature, layer) {
				    	list_feature.push(feature);
				    	list_layer.push(layer);
				    });

				    var y_popup = parseInt(evt.offsetY) + parseInt($("#4_map_4")[0].offsetTop);
				    var x_popup = parseInt(evt.offsetX) + parseInt($("#4_map_4")[0].offsetLeft);
				    if(list_feature.length > 0){
				    	if(list_feature[0].get('id_clue')){
				    		if(list_feature[0].get('id').substr(0, 16) == 'trajectory_point'){
					    		$('#map_filter_opening_menu_with_trajectory_point').css("display","block");
								$('#map_filter_opening_menu_with_trajectory_point').css("top",y_popup + 'px');
								$('#map_filter_opening_menu_with_trajectory_point').css("left",x_popup + 'px');
								right_click_element = evt;
				    		} else if(list_feature[0].get('id').substr(0, 20) == 'element_of_reference'){
				    			$('#map_filter_opening_menu_with_element_of_reference').css("display","block");
								$('#map_filter_opening_menu_with_element_of_reference').css("top",y_popup + 'px');
								$('#map_filter_opening_menu_with_element_of_reference').css("left",x_popup + 'px');
								right_click_element = evt;
				    		}
				    	} else if(list_layer[0].get('id').substr(0, 18) == 'object_of_interest') {
				    		$('#map_filter_opening_menu_with_object_of_interest').css("display","block");
							$('#map_filter_opening_menu_with_object_of_interest').css("top",y_popup + 'px');
							$('#map_filter_opening_menu_with_object_of_interest').css("left",x_popup + 'px');
							right_click_element = evt;
				    	} else if(list_layer[0].get('id').substr(0, 20) == 'id_rank_2_clue_layer') {
				    		$('#map_filter_opening_menu').css("display","block");
							$('#map_filter_opening_menu').css("top",y_popup + 'px');
							$('#map_filter_opening_menu').css("left",x_popup + 'px');
							right_click_element = evt;
				    	} else {
				    		$('#map_filter_opening_menu_with_feature').css("display","block");
							$('#map_filter_opening_menu_with_feature').css("top",y_popup + 'px');
							$('#map_filter_opening_menu_with_feature').css("left",x_popup + 'px');
							right_click_element = evt;
				    	}
				    } else {
					    $('#map_filter_opening_menu').css("display","block");
						$('#map_filter_opening_menu').css("top",y_popup + 'px');
						$('#map_filter_opening_menu').css("left",x_popup + 'px');
						right_click_element = evt;
				    }
				    $('#popup_div_container').css("display","none");
				});
				//TODO bug, les objets déplacé en drag and drop sont sélectionnés
				  map_4.getViewport().addEventListener('click', function (evt) {
					  $('.map_filter_menu').fadeOut();
					  if (dragging == 1){
					  	var list_feature_to_select = []
					  	map_4.forEachFeatureAtPixel([evt.offsetX,evt.offsetY], function (feature, layer) {
					    	if(layer){
					    		if(layer.get('id') ==  "id_rank_1_clue_layer"){
						    		if(feature.get('id').substr(0, 16) == 'trajectory_point' || feature.get('id').substr(0, 20) == 'element_of_reference'){
							    		list_feature_to_select.push(feature);
							    	}
						    	}
					    	}
					    });
					  	if(list_feature_to_select.length == 0){
					  		if(evt.shiftKey == false){
						  		remove_all_clue_of_select();
					  		}
					  	} else {
						  	for(var i= 0; i<list_feature_to_select.length; i++){
						  		var feature = list_feature_to_select[i];
						  		if(evt.shiftKey){
						  			var id_clue = feature.get('id_clue');
						  			if($("#"+ id_clue + "_rank_1_clue_container").hasClass("selected_clue")){
						  				$("#"+ id_clue + "_rank_1_clue_container").removeClass("selected_clue");
						  				$("#"+ id_clue + "_rank_1_clue_container").find( ".rank_1_clue_limits " ).css( "stroke-width",1);
						  				$("#"+ id_clue + "_rank_1_clue_container").find( ".rank_1_clue_limits " ).css( "stroke","black");
						  			} else {
						  				$("#"+ id_clue + "_rank_1_clue_container").addClass("selected_clue");
						  				$("#"+ id_clue + "_rank_1_clue_container").find( ".rank_1_clue_limits " ).css( "stroke-width",3);
						  				$("#"+ id_clue + "_rank_1_clue_container").find( ".rank_1_clue_limits " ).css( "stroke",select_color_hexa);
									}
						  			clear_clue_to_select_state();
									 for(var o = 0; o< $(".clue_window_element").length; o++){
										 var element = $(".clue_window_element")[o];
										 if($(element).hasClass("rank_1_clue_container") && $(element).hasClass("selected_clue")){
											 var id_clue = $(element).attr('id').split('_')[0];
											 put_clue_map_element_to_select(id_clue);
										 }
									 }
						  		} else {
						  			remove_all_clue_of_select();
						  			var id_clue = feature.get('id_clue');
						  			put_clue_to_select(id_clue);
						  		}
						  	}
					  	}
					  }
				  });
				  break;
		  default:
			  break;
		}

	}

	rank_1_clue_layer.setZIndex(100);
	rank_2_clue_layer.setZIndex(40);
	for(var o = 0; o < rank_3_clue_layer_source_array.length; o++){
		  rank_3_clue_layer_source_array[o].layer.setZIndex(45);
	  }
	clue_on_hover_layer.setZIndex(50);


	$(".map_filter_opening_menu_add_object").unbind( "click" );
	$(".map_filter_opening_menu_load_tree").unbind( "click" );
	$(".map_filter_opening_menu_create_buffer").unbind( "click" );
	$(".map_filter_opening_menu_create_isochrone").unbind( "click" );
	$(".map_filter_opening_menu_create_intervis").unbind( "click" );
	$(".map_filter_opening_menu_create_begining_point").unbind( "click" );
	$(".map_filter_opening_menu_create_to_pass_point").unbind( "click" );
	$(".map_filter_opening_menu_create_past_point").unbind( "click" );
	$(".map_filter_opening_menu_create_destination_point").unbind( "click" );
	$(".map_filter_opening_menu_create_circle_feature").unbind( "click" );
	$(".map_filter_opening_menu_create_polygon_feature").unbind( "click" );
	$(".map_filter_opening_menu_create_direction_feature").unbind( "click" );
	$(".map_filter_opening_menu_modify_address").unbind( "click" );
	$(".map_filter_opening_menu_modify_type").unbind( "click" );
	$(".map_filter_opening_menu_suppress_point").unbind( "click" );
	$(".map_filter_opening_menu_suppress_object").unbind( "click" );
	$(".map_filter_menu_element").unbind( "click" );
	$('#rank_2_buffer_parameters_button').unbind( "click" );
	$('#close_filter_map_WindowPP').unbind( "click" );

	$(".map_filter_opening_menu_add_object").on('click',function() {
			add_object_from_map(right_click_element);
		});

	$(".map_filter_opening_menu_load_tree").on('click',function() {
		load_tree(null);
	});

	$(".map_filter_opening_menu_create_buffer").on('click',function() {
			create_buffer_from_map(right_click_element);
		});

	$(".map_filter_opening_menu_create_isochrone").on('click',function() {
			create_isochrone_from_map(right_click_element);
		});

	$(".map_filter_opening_menu_create_intervis").on('click',function() {
			create_intervis_from_map_object(right_click_element);
		});

	$(".map_filter_opening_menu_create_intervis_without_object").on('click',function() {
		create_intervis_from_map(right_click_element);
	});

	$(".map_filter_opening_menu_create_sunmask").on('click',function() {
		create_sunmask_from_map(right_click_element);
	});

	$(".map_filter_opening_menu_create_begining_point").on('click',function() {
		create_itinary_point_from_map(right_click_element, "begining_point");
		});

	$(".map_filter_opening_menu_create_to_pass_point").on('click',function() {
		create_itinary_point_from_map(right_click_element, "to_pass_point");
		});

	$(".map_filter_opening_menu_create_past_point").on('click',function() {
		create_itinary_point_from_map(right_click_element, "past_point");
		});

	$(".map_filter_opening_menu_create_destination_point").on('click',function() {
		create_itinary_point_from_map(right_click_element, "destination_point");
		});

	$(".map_filter_opening_menu_create_circle_feature").on('click',function() {
			create_circle_feature_from_map(right_click_element);
		});

	$(".map_filter_opening_menu_create_polygon_feature").on('click',function() {
			create_polygon_feature_from_map(right_click_element);
		});

	$(".map_filter_opening_menu_create_direction_feature").on('click',function() {
			create_direction_feature_from_map(right_click_element);
		});

	$(".map_filter_opening_menu_modify_address").on('click',function() {
		modify_itinary_point_address_from_map(right_click_element);
	});

	$(".map_filter_opening_menu_modify_type").on('click',function() {
		modify_itinary_point_type_from_map(right_click_element);
	});

	$(".map_filter_opening_menu_suppress_point").on('click',function() {
		suppress_trajectory_point_from_map(right_click_element);
	});

	$(".map_filter_opening_menu_suppress_object").on('click',function() {
		suppress_object_of_interest_from_map(right_click_element);
	});

	$(".map_filter_menu_element").on('click',function() {
		$('.map_filter_menu').css("display","none");
	});

	$(".map_filter_opening_menu_create_ZRI").on('click',function() {
		create_ZRI(right_click_element);
	});

	$('#rank_2_buffer_parameters_button').on('click',function() {
		launch_add_buffer.fct();
	});

	$('.create_grid').on('click',function() {
		create_grid();
	});

	$('.create_grid_2').on('click',function() {
		create_grid_2();
	});

	initalize_grass_function();

  $('#close_filter_map_WindowPP').on('click', function(){
	  filter_on_map_feature = null;
	  $('#filter_map_WindowPP').fadeOut();
  });

  /*
   * sélection des indices de rang 1 dans la carte par click
   */
  var dragging = 0;
  $(document).mousedown(function() {
      dragging = 0;
      $(document).mousemove(function(){
         dragging = 1;
      });
  });


//  if(map_1 != null){console.log(map_1.getLayers());}
//  if(map_2 != null){console.log(map_2.getLayers());}
//  if(map_3 != null){console.log(map_3.getLayers());}
//  if(map_4 != null){console.log(map_4.getLayers());}

}


/*
 * add or hide clue in map with map checkbox
 */
function add_hide_layer(map_id,condition,clue_type,clue_3_id){

	for(var t=0; t<app.map_collection.length; t++){
		if(app.map_collection[t].id_map == map_id){
			if(clue_type == 12){
				if(condition == "hide"){
					switch (app.map_collection[t].map) {
					  case 'map_1':
						  map_1.removeLayer(rank_1_clue_layer);
						  map_1.removeLayer(rank_2_clue_layer);
						  break;
					  case 'map_2':
						  map_2.removeLayer(rank_1_clue_layer);
						  map_2.removeLayer(rank_2_clue_layer);
						  break;
					  case 'map_3':
						  map_3.removeLayer(rank_1_clue_layer);
						  map_3.removeLayer(rank_2_clue_layer);
						  break;
					  case 'map_4':
						  map_4.removeLayer(rank_1_clue_layer);
						  map_4.removeLayer(rank_2_clue_layer);
						  break;
					  default:
						  break;
					}
				} else if(condition == "show"){
					switch (app.map_collection[t].map) {
					  case 'map_1':
						  map_1.addLayer(rank_1_clue_layer);
						  map_1.addLayer(rank_2_clue_layer);
						  break;
					  case 'map_2':
						  map_2.addLayer(rank_1_clue_layer);
						  map_2.addLayer(rank_2_clue_layer);
						  break;
					  case 'map_3':
						  map_3.addLayer(rank_1_clue_layer);
						  map_3.addLayer(rank_2_clue_layer);
						  break;
					  case 'map_4':
						  map_4.addLayer(rank_1_clue_layer);
						  map_4.addLayer(rank_2_clue_layer);
						  break;
					  default:
						  break;
					}
				}
			} else if(clue_type == 3){
				for(var f=0; f<rank_3_clue_layer_source_array.length; f++){
					if(rank_3_clue_layer_source_array[f].clue_id == clue_3_id){
						if(condition == "hide"){
							switch (app.map_collection[t].map) {
							  case 'map_1':
								  map_1.removeLayer(rank_3_clue_layer_source_array[f].layer);
								  break;
							  case 'map_2':
								  map_2.removeLayer(rank_3_clue_layer_source_array[f].layer);
								  break;
							  case 'map_3':
								  map_3.removeLayer(rank_3_clue_layer_source_array[f].layer);
								  break;
							  case 'map_4':
								  map_4.removeLayer(rank_3_clue_layer_source_array[f].layer);
								  break;
							  default:
								  break;
							}
						} else if(condition == "show"){
							switch (app.map_collection[t].map) {
							  case 'map_1':
								  map_1.addLayer(rank_3_clue_layer_source_array[f].layer);
								  break;
							  case 'map_2':
								  map_2.addLayer(rank_3_clue_layer_source_array[f].layer);
								  break;
							  case 'map_3':
								  map_3.addLayer(rank_3_clue_layer_source_array[f].layer);
								  break;
							  case 'map_4':
								  map_4.addLayer(rank_3_clue_layer_source_array[f].layer);
								  break;
							  default:
								  break;
							}
						}
						break;
					}
				}
			}
			break;
		}
	}

}



/*
 * create_itinary_point_from_map
 *
 * create itinary point from a right clic on map
 * right_click_element: clic event
 * type_of_itinary_point: type of itinary point, "begining_point", "to_pass_point", "past_point", "destination_point"
 */
function create_itinary_point_from_map(right_click_element, type_of_itinary_point){

	var clue_id;
	if(app.list_of_rank_1_clue_id.length == 0){
		clue_id = 1;
	} else {
		clue_id = (Math.max(...app.list_of_rank_1_clue_id) + 1);
	}
	var pixel_point;
	if(window.navigator.appCodeName == "Mozilla"){
		var id_current_map = right_click_element.target.parentElement.parentElement.id;
		if(id_current_map == '1_map_1' || id_current_map == '2_map_1' || id_current_map == '3_map_1' || id_current_map == '4_map_1'){
			pixel_point = map_1.getCoordinateFromPixel([right_click_element.layerX,right_click_element.layerY]);
		} else if(id_current_map == '2_map_2' || id_current_map == '3_map_2' || id_current_map == '4_map_2'){
			pixel_point = map_2.getCoordinateFromPixel([right_click_element.layerX,right_click_element.layerY]);
		} else if(id_current_map == '3_map_3' || id_current_map == '4_map_3'){
			pixel_point = map_3.getCoordinateFromPixel([right_click_element.layerX,right_click_element.layerY]);
		} else if(id_current_map == '4_map_4'){
			pixel_point = map_4.getCoordinateFromPixel([right_click_element.layerX,right_click_element.layerY]);
		}
	} else {
		for(var f= 0; f < right_click_element.path.length; f++){
			if(right_click_element.path[f].id == '1_map_1' || right_click_element.path[f].id == '2_map_1' || right_click_element.path[f].id == '3_map_1' || right_click_element.path[f].id == '4_map_1'){
				pixel_point = map_1.getCoordinateFromPixel([right_click_element.offsetX,right_click_element.offsetY]);
				break;
			} else if(right_click_element.path[f].id == '2_map_2' || right_click_element.path[f].id == '3_map_2' || right_click_element.path[f].id == '4_map_2'){
				pixel_point = map_2.getCoordinateFromPixel([right_click_element.offsetX,right_click_element.offsetY]);
				break;
			} else if(right_click_element.path[f].id == '3_map_3' || right_click_element.path[f].id == '4_map_3'){
				pixel_point = map_3.getCoordinateFromPixel([right_click_element.offsetX,right_click_element.offsetY]);
				break;
			} else if(right_click_element.path[f].id == '4_map_4'){
				pixel_point = map_4.getCoordinateFromPixel([right_click_element.offsetX,right_click_element.offsetY]);
				break;
			}
		}
	}

	var itinary_point_color;
	var url_image;
	switch(type_of_itinary_point){
		case "begining_point":
			itinary_point_color = begining_point_color;
			url_image = begining_point_url;
			break;
		case "to_pass_point":
			itinary_point_color = to_pass_point_color;
			url_image = to_pass_point_url;
			break;
		case "past_point":
			itinary_point_color = past_point_color;
			url_image = past_point_url;
			break;
		case "destination_point":
			itinary_point_color = destination_point_color;
			url_image = destination_point_url;
			break;
		default:
			itinary_point_color = "#000000";
			url_image = destination_point_url;
	}
	var point_id = create_trajectory_point(pixel_point,itinary_point_color,clue_id,url_image);
	var clue = new rank_1_clue(clue_id, type_of_itinary_point, [point_id],getAdresse(ol.proj.transform(pixel_point, 'EPSG:3857', 'EPSG:4326')),ol.proj.transform(pixel_point, 'EPSG:3857', 'EPSG:4326'),true);
	app.list_of_rank_1_clue.push(clue)
	app.list_of_rank_1_clue_id.push(clue_id);

	if(app.list_group_of_rank_1_clue.length == 0){
		var group = new group_of_rank_1_clue(1, "trajectory_points", "",[clue_id]);
		app.list_group_of_rank_1_clue.push(group);
		app.list_group_of_rank_1_clue_id.push(1);
	} else {
		var is_trajectory_group_created = false;
		for (var k=0; k<app.list_group_of_rank_1_clue.length; k++){
			if(app.list_group_of_rank_1_clue[k].type_group == "trajectory_points"){
				app.list_group_of_rank_1_clue[k].list_of_clue_id.push(clue_id);
				is_trajectory_group_created = true;
				break;
			}
		}
		if(is_trajectory_group_created == false){
			var group_id;
			if(app.list_group_of_rank_1_clue_id.length == 0){
				group_id = 1;
			} else {
				group_id = (Math.max(...app.list_group_of_rank_1_clue_id) + 1);
			}
			var group = new group_of_rank_1_clue(group_id, "trajectory_points", "",[clue_id]);
			app.list_group_of_rank_1_clue.push(group);
			app.list_group_of_rank_1_clue_id.push(group_id);

		}
	}
	switch(type_of_itinary_point){
		case "begining_point":
			$(".map_filter_opening_menu_create_begining_point").css("display","none");
			break;
		case "destination_point":
			$(".map_filter_opening_menu_create_destination_point").css("display","none");
			break;
		default:
	}
	redraw_clue_window();
}

/*
 * modify_trajectory_point_from_map
 *
 * modify rank 1 itinary element after drag and drop
 * id_clue: id of the rank 1 element
 * coordinate_clue: new coordinate of the feature
 * feature_clue: feature of the rank 1 element
 */
function modify_trajectory_point_from_map(id_clue, coordinate_clue, feature_id){
	for (var i=0; i<app.list_of_rank_1_clue.length; i++){
		if(app.list_of_rank_1_clue[i].id_clue == id_clue){
			app.list_of_rank_1_clue[i].object_clue[0].id_object = feature_id;
			app.list_of_rank_1_clue[i].details = ol.proj.transform(coordinate_clue, 'EPSG:3857', 'EPSG:4326');
			break;
		}
	}
	redraw_clue_window();
}

/*
 * suppress_trajectory_point_from_map
 *
 * suppress rank 1 itinary element from right clic on map
 * trajectory_point: clic event
 */
function suppress_trajectory_point_from_map(trajectory_point){
	//TODO small multiple
	var list_feature = [];
	if(window.navigator.appCodeName == "Mozilla"){
		var id_current_map = trajectory_point.target.parentElement.parentElement.id;
		if(id_current_map == '1_map_1' || id_current_map == '2_map_1' || id_current_map == '3_map_1' || id_current_map == '4_map_1'){
			map_1.forEachFeatureAtPixel([trajectory_point.layerX,trajectory_point.layerY], function (feature, layer) {
		    	if(feature.get('id_clue')){
		    		list_feature.push(feature);
		    	}
		    });
		} else if(id_current_map == '2_map_2' || id_current_map == '3_map_2' || id_current_map == '4_map_2'){
			map_2.forEachFeatureAtPixel([trajectory_point.layerX,trajectory_point.layerY], function (feature, layer) {
		    	if(feature.get('id_clue')){
		    		list_feature.push(feature);
		    	}
		    });
		} else if(id_current_map == '3_map_3' || id_current_map == '4_map_3'){
			map_3.forEachFeatureAtPixel([trajectory_point.layerX,trajectory_point.layerY], function (feature, layer) {
		    	if(feature.get('id_clue')){
		    		list_feature.push(feature);
		    	}
		    });
		} else if(id_current_map == '4_map_4'){
			map_4.forEachFeatureAtPixel([trajectory_point.layerX,trajectory_point.layerY], function (feature, layer) {
		    	if(feature.get('id_clue')){
		    		list_feature.push(feature);
		    	}
		    });
		}
	} else {
		for(var f= 0; f < trajectory_point.path.length; f++){
			if(trajectory_point.path[f].id == '1_map_1' || trajectory_point.path[f].id == '2_map_1' || trajectory_point.path[f].id == '3_map_1' || right_click_element.path[f].id == '4_map_1'){
				map_1.forEachFeatureAtPixel([trajectory_point.offsetX,trajectory_point.offsetY], function (feature, layer) {
			    	if(feature.get('id_clue')){
			    		list_feature.push(feature);
			    	}
			    });
				break;
			} else if(trajectory_point.path[f].id == '2_map_2' || trajectory_point.path[f].id == '3_map_2' || trajectory_point.path[f].id == '4_map_2'){
				map_2.forEachFeatureAtPixel([trajectory_point.offsetX,trajectory_point.offsetY], function (feature, layer) {
			    	if(feature.get('id_clue')){
			    		list_feature.push(feature);
			    	}
			    });
				break;
			} else if(trajectory_point.path[f].id == '3_map_3' || trajectory_point.path[f].id == '4_map_3'){
				map_3.forEachFeatureAtPixel([trajectory_point.offsetX,trajectory_point.offsetY], function (feature, layer) {
			    	if(feature.get('id_clue')){
			    		list_feature.push(feature);
			    	}
			    });
				break;
			} else if(trajectory_point.path[f].id == '4_map_4'){
				map_4.forEachFeatureAtPixel([trajectory_point.offsetX,trajectory_point.offsetY], function (feature, layer) {
			    	if(feature.get('id_clue')){
			    		list_feature.push(feature);
			    	}
			    });
				break;
			}
		}
	}


//	map.forEachFeatureAtPixel([trajectory_point.offsetX,trajectory_point.offsetY], function (feature, layer) {
//    	if(feature.get('id_clue')){
//    		list_feature.push(feature);
//    	}
//    });

	var object_id = list_feature[0].get('id');
	var clue_id = list_feature[0].get('id_clue');

	suppress_trajectory_point(object_id);

	var index=null;
	for(var i = 0; i< app.list_of_rank_1_clue.length; i++){
		if(app.list_of_rank_1_clue[i].id_clue == clue_id){
			index= i;
			break;
		}
	}

	if(app.list_of_rank_1_clue[index].type_clue == "begining_point"){
		$(".map_filter_opening_menu_create_begining_point").css("display","block");
	} else if(app.list_of_rank_1_clue[index].type_clue == "destination_point"){
		$(".map_filter_opening_menu_create_destination_point").css("display","block");
	}

	app.list_of_rank_1_clue.splice(index, 1);

	index = app.list_of_rank_1_clue_id.indexOf(clue_id);
	if (index > -1) {
		app.list_of_rank_1_clue_id.splice(index, 1);
	}


	var group_index = null;
	var group_id = null;
	for(var i = 0; i< app.list_group_of_rank_1_clue.length; i++){
		if (app.list_group_of_rank_1_clue[i].type_group== "trajectory_points"){

			index = app.list_group_of_rank_1_clue[i].list_of_clue_id.indexOf(clue_id);
			if (index > -1) {
				app.list_group_of_rank_1_clue[i].list_of_clue_id.splice(index, 1);
			}

			group_index= i;;
			group_id = app.list_group_of_rank_1_clue[i].id_group;

			break;
		}
	}

	if(app.list_group_of_rank_1_clue[group_index].list_of_clue_id.length == 0){
		index = list_group_of_rank_1_clue_id.indexOf(group_id);
		if (index > -1) {
			app.list_group_of_rank_1_clue_id.splice(index, 1);
		}

		app.list_group_of_rank_1_clue.splice(group_index, 1);v

	}
	redraw_clue_window();
}



/*
 * add_object_from_map
 *
 * add rank 1 object of interest element from right clic on map
 * right_click_element: clic event
 */
function add_object_from_map(right_click_element){
	//TODO small multiple
	var list_feature = [];

	if(window.navigator.appCodeName == "Mozilla"){
		var id_current_map = right_click_element.target.parentElement.parentElement.id;
		if(id_current_map == '1_map_1' || id_current_map == '2_map_1' || id_current_map == '3_map_1' || id_current_map == '4_map_1'){
			map_1.forEachFeatureAtPixel([right_click_element.layerX,right_click_element.layerY], function (feature, layer) {
				list_feature.push(feature);
		    });
		} else if(id_current_map == '2_map_2' || id_current_map == '3_map_2' || id_current_map == '4_map_2'){
			map_2.forEachFeatureAtPixel([right_click_element.layerX,right_click_element.layerY], function (feature, layer) {
				list_feature.push(feature);
		    });
		} else if(id_current_map == '3_map_3' || id_current_map == '4_map_3'){
			map_3.forEachFeatureAtPixel([right_click_element.layerX,right_click_element.layerY], function (feature, layer) {
				list_feature.push(feature);
		    });
		} else if(id_current_map == '4_map_4'){
			map_4.forEachFeatureAtPixel([right_click_element.layerX,right_click_element.layerY], function (feature, layer) {
				list_feature.push(feature);
		    });
		}
	} else {
		for(var f= 0; f < right_click_element.path.length; f++){
			if(right_click_element.path[f].id == '1_map_1' || right_click_element.path[f].id == '2_map_1' || right_click_element.path[f].id == '3_map_1' || right_click_element.path[f].id == '4_map_1'){
				map_1.forEachFeatureAtPixel([right_click_element.offsetX,right_click_element.offsetY], function (feature, layer) {
					list_feature.push(feature);
			    });
				break;
			} else if(right_click_element.path[f].id == '2_map_2' || right_click_element.path[f].id == '3_map_2' || right_click_element.path[f].id == '4_map_2'){
				map_2.forEachFeatureAtPixel([right_click_element.offsetX,right_click_element.offsetY], function (feature, layer) {
					list_feature.push(feature);
			    });
				break;
			} else if(right_click_element.path[f].id == '3_map_3' || right_click_element.path[f].id == '4_map_3'){
				map_3.forEachFeatureAtPixel([right_click_element.offsetX,right_click_element.offsetY], function (feature, layer) {
					list_feature.push(feature);
			    });
				break;
			} else if(right_click_element.path[f].id == '4_map_4'){
				map_4.forEachFeatureAtPixel([right_click_element.offsetX,right_click_element.offsetY], function (feature, layer) {
					list_feature.push(feature);
			    });
				break;
			}
		}
	}

	var clue_id;
	if(app.list_of_rank_1_clue_id.length == 0){
		clue_id = 1;
	} else {
		clue_id = (Math.max(...app.list_of_rank_1_clue_id) + 1);
	}

	var point_id = add_element_of_reference(clue_id,list_feature[0]);
	var clue;

	switch (list_feature[0].getProperties().itemType) {
	  case 'CITY':
		  clue = new rank_1_clue(clue_id, "Grande ville", [point_id],list_feature[0].getProperties().name,list_feature[0].getProperties(),true);
		  break;
	  case 'TOWN':
		  clue = new rank_1_clue(clue_id, "Ville", [point_id],list_feature[0].getProperties().name,list_feature[0].getProperties(),true);
		  break;
	  case 'VILLAGE':
		  clue = new rank_1_clue(clue_id, "Village", [point_id],list_feature[0].getProperties().name,list_feature[0].getProperties(),true);
		  break;
	  case 'PEAK':
		  clue = new rank_1_clue(clue_id, "Sommet", [point_id],list_feature[0].getProperties().name,list_feature[0].getProperties(),true);
		  break;
	  case 'COL':
		  clue = new rank_1_clue(clue_id, "Col", [point_id],list_feature[0].getProperties().name,list_feature[0].getProperties(),true);
		  break;
	  case 'LAKE':
		  clue = new rank_1_clue(clue_id, "Lac", [point_id],list_feature[0].getProperties().name,list_feature[0].getProperties(),true);
		  break;
	  case 'RESERVOIR':
		  clue = new rank_1_clue(clue_id, "Réservoir", [point_id],list_feature[0].getProperties().name,list_feature[0].getProperties(),true);
		  break;
	  case 'WATEROTHER':
		  clue = new rank_1_clue(clue_id, "Autre", [point_id],list_feature[0].getProperties().name,list_feature[0].getProperties(),true);
		  break;
	  case 'RIVER':
		  clue = new rank_1_clue(clue_id, "Rivière", [point_id],list_feature[0].getProperties().name,list_feature[0].getProperties(),true);
		  break;
	  case 'STREAM':
		  clue = new rank_1_clue(clue_id, "Ruisseau", [point_id],list_feature[0].getProperties().name,list_feature[0].getProperties(),true);
		  break;
	  case 'POWER6':
		  clue = new rank_1_clue(clue_id, "LHT 6 brins", [point_id],list_feature[0].getProperties().name,list_feature[0].getProperties(),true);
		  break;
	  case 'POWER3':
		  clue = new rank_1_clue(clue_id, "LHT 3 brins", [point_id],list_feature[0].getProperties().name,list_feature[0].getProperties(),true);
		  break;
	  case 'POWERO':
		  clue = new rank_1_clue(clue_id, "Equipement éléctrique", [point_id],list_feature[0].getProperties().name,list_feature[0].getProperties(),true);
		  break;
	  case 'MAST':
		  clue = new rank_1_clue(clue_id, "Tour téléphonie", [point_id],list_feature[0].getProperties().name,list_feature[0].getProperties(),true);
		  break;
	  case 'SKILIFT':
		  clue = new rank_1_clue(clue_id, "Remontée mécanique", [point_id],list_feature[0].getProperties().name,list_feature[0].getProperties(),true);
		  break;
	  case 'PISTEGREEN':
		  clue = new rank_1_clue(clue_id, "Piste verte", [point_id],list_feature[0].getProperties().name,list_feature[0].getProperties(),true);
		  break;
	  case 'PISTEBLUE':
		  clue = new rank_1_clue(clue_id, "Piste bleue", [point_id],list_feature[0].getProperties().name,list_feature[0].getProperties(),true);
		  break;
	  case 'PISTERED':
		  clue = new rank_1_clue(clue_id, "Piste rouge", [point_id],list_feature[0].getProperties().name,list_feature[0].getProperties(),true);
		  break;
	  case 'PISTEBLACK':
		  clue = new rank_1_clue(clue_id, "Piste noire", [point_id],list_feature[0].getProperties().name,list_feature[0].getProperties(),true);
		  break;
	  case 'PATHWAY':
		  clue = new rank_1_clue(clue_id, "Sentier de randonnée", [point_id],list_feature[0].getProperties().name,list_feature[0].getProperties(),true);
		  break;
	  case 'ROAD':
		  clue = new rank_1_clue(clue_id, "Route", [point_id],list_feature[0].getProperties().name,list_feature[0].getProperties(),true);
		  break;
	  default:
		  clue = new rank_1_clue(clue_id, "Objet d'intérêt", [point_id],list_feature[0].getProperties().name,list_feature[0].getProperties(),true);
	  break;
	}

	app.list_of_rank_1_clue.push(clue)
	app.list_of_rank_1_clue_id.push(clue_id);

	var group_id;
	if(app.list_group_of_rank_1_clue_id.length == 0){
		group_id = 1;
	} else {
		group_id = (Math.max(...app.list_group_of_rank_1_clue_id) + 1);
	}

	var group = new group_of_rank_1_clue(group_id, "Objet d'intérêt", "",[clue_id]);
	app.list_group_of_rank_1_clue.push(group);
	app.list_group_of_rank_1_clue_id.push(group_id);


	redraw_clue_window();
}

/*
 * suppress_object_of_interest_from_map
 *
 * suppress rank 1 object of interest element from right clic on map
 * object_of_interest: clic event
 */
function suppress_object_of_interest_from_map(object_of_interest){
	//TODO small multiple
	var list_feature = [];

	if(window.navigator.appCodeName == "Mozilla"){
		var id_current_map = object_of_interest.target.parentElement.parentElement.id;
		if(id_current_map == '1_map_1' || id_current_map == '2_map_1' || id_current_map == '3_map_1' || id_current_map == '4_map_1'){
			map_1.forEachFeatureAtPixel([object_of_interest.layerX,object_of_interest.layerY], function (feature, layer) {
		    	if(feature.get('id_clue')){
		    		list_feature.push(feature);
		    	}
		    });
		} else if(id_current_map == '2_map_2' || id_current_map == '3_map_2' || id_current_map == '4_map_2'){
			map_2.forEachFeatureAtPixel([object_of_interest.layerX,object_of_interest.layerY], function (feature, layer) {
		    	if(feature.get('id_clue')){
		    		list_feature.push(feature);
		    	}
		    });
		} else if(id_current_map == '3_map_3' || id_current_map == '4_map_3'){
			map_3.forEachFeatureAtPixel([object_of_interest.layerX,object_of_interest.layerY], function (feature, layer) {
		    	if(feature.get('id_clue')){
		    		list_feature.push(feature);
		    	}
		    });
		} else if(id_current_map == '4_map_4'){
			map_4.forEachFeatureAtPixel([object_of_interest.layerX,object_of_interest.layerY], function (feature, layer) {
		    	if(feature.get('id_clue')){
		    		list_feature.push(feature);
		    	}
		    });
		}
	} else {
		for(var f= 0; f < object_of_interest.path.length; f++){
			if(object_of_interest.path[f].id == '1_map_1' || object_of_interest.path[f].id == '2_map_1' || object_of_interest.path[f].id == '3_map_1' || object_of_interest.path[f].id == '4_map_1'){
				map_1.forEachFeatureAtPixel([object_of_interest.offsetX,object_of_interest.offsetY], function (feature, layer) {
			    	if(feature.get('id_clue')){
			    		list_feature.push(feature);
			    	}
			    });
				break;
			} else if(object_of_interest.path[f].id == '2_map_2' || object_of_interest.path[f].id == '3_map_2' || object_of_interest.path[f].id == '4_map_2'){
				map_2.forEachFeatureAtPixel([object_of_interest.offsetX,object_of_interest.offsetY], function (feature, layer) {
			    	if(feature.get('id_clue')){
			    		list_feature.push(feature);
			    	}
			    });
				break;
			} else if(object_of_interest.path[f].id == '3_map_3' || object_of_interest.path[f].id == '4_map_3'){
				map_3.forEachFeatureAtPixel([object_of_interest.offsetX,object_of_interest.offsetY], function (feature, layer) {
			    	if(feature.get('id_clue')){
			    		list_feature.push(feature);
			    	}
			    });
				break;
			} else if(object_of_interest.path[f].id == '4_map_4'){
				map_4.forEachFeatureAtPixel([object_of_interest.offsetX,object_of_interest.offsetY], function (feature, layer) {
			    	if(feature.get('id_clue')){
			    		list_feature.push(feature);
			    	}
			    });
				break;
			}
		}
	}

//	map.forEachFeatureAtPixel([object_of_interest.offsetX,object_of_interest.offsetY], function (feature, layer) {
//    	list_feature.push(feature);
//    });
	var object_id = list_feature[0].get('id');
	var clue_id = list_feature[0].get('id_clue');

	suppress_element_of_reference(object_id.id_object);

	var index=null;
	for(var i = 0; i< app.list_of_rank_1_clue.length; i++){
		if(app.list_of_rank_1_clue[i].id_clue == clue_id){
			index= i;
			break;
		}
	}


	app.list_of_rank_1_clue.splice(index, 1);

	index = app.list_of_rank_1_clue_id.indexOf(clue_id);
	if (index > -1) {
		app.list_of_rank_1_clue_id.splice(index, 1);
	}


	var group_index = null;
	var group_id = null;
	for(var i = 0; i< app.list_group_of_rank_1_clue.length; i++){
		if (app.list_group_of_rank_1_clue[i].type_group== "element_of_reference"){

			index = app.list_group_of_rank_1_clue[i].list_of_clue_id.indexOf(clue_id);
			if (index > -1) {
				app.list_group_of_rank_1_clue[i].list_of_clue_id.splice(index, 1);
			}

			group_index= i;;
			group_id = app.list_group_of_rank_1_clue[i].id_group;

			break;
		}
	}

	if(group_index != null){
		if(app.list_group_of_rank_1_clue[group_index].list_of_clue_id.length == 0){
			index = app.list_group_of_rank_1_clue_id.indexOf(group_id);
			if (index > -1) {
				app.list_group_of_rank_1_clue_id.splice(index, 1);
			}

			app.list_group_of_rank_1_clue.splice(group_index, 1);

		}
	}

	redraw_clue_window();
}



/*
 * create_circle_feature_from_map
 *
 * add rank 2 object by drawing a circle area on map
 * right_click_element: clic event
 */
function create_circle_feature_from_map(right_click_element){
	//TODO small multiple

	var clicked_map;
	if(window.navigator.appCodeName == "Mozilla"){
		var id_current_map = right_click_element.target.parentElement.parentElement.id;
		if(id_current_map == '1_map_1' || id_current_map == '2_map_1' || id_current_map == '3_map_1' || id_current_map == '4_map_1'){
			clicked_map = 1;
		} else if(id_current_map == '2_map_2' || id_current_map == '3_map_2' || id_current_map == '4_map_2'){
			clicked_map = 2;
		} else if(id_current_map == '3_map_3' || id_current_map == '4_map_3'){
			clicked_map = 3;
		} else if(id_current_map == '4_map_4'){
			clicked_map = 4;
		}
	} else {
		for(var f= 0; f < right_click_element.path.length; f++){
			if(right_click_element.path[f].id == '1_map_1' || right_click_element.path[f].id == '2_map_1' || right_click_element.path[f].id == '3_map_1' || right_click_element.path[f].id == '4_map_1'){
				clicked_map = 1;
				break;
			} else if(right_click_element.path[f].id == '2_map_2' || right_click_element.path[f].id == '3_map_2' || right_click_element.path[f].id == '4_map_2'){
				clicked_map = 2;
				break;
			} else if(right_click_element.path[f].id == '3_map_3' || right_click_element.path[f].id == '4_map_3'){
				clicked_map = 3;
				break;
			} else if(right_click_element.path[f].id == '4_map_4'){
				clicked_map = 4;
				break;
			}
		}
	}

	switch (clicked_map) {
	  case 1:
		  map_1.removeEventListener(draw_interaction);
		  break;
	  case 2:
		  map_2.removeEventListener(draw_interaction);
		  break;
	  case 3:
		  map_3.removeEventListener(draw_interaction);
		  break;
	  case 4:
		  map_4.removeEventListener(draw_interaction);
		  break;
	  default:
		  break;
	}

	var phase = 1;

	var start_point;
	switch (clicked_map) {
	  case 1:
		  if(window.navigator.appCodeName == "Mozilla"){
			  start_point = map_1.getCoordinateFromPixel([right_click_element.layerX,right_click_element.layerY]);
		  } else {
			  start_point = map_1.getCoordinateFromPixel([right_click_element.offsetX,right_click_element.offsetY]);
		  }
		  break;
	  case 2:
		  if(window.navigator.appCodeName == "Mozilla"){
			  start_point = map_2.getCoordinateFromPixel([right_click_element.layerX,right_click_element.layerY]);
		  } else {
			  start_point = map_2.getCoordinateFromPixel([right_click_element.offsetX,right_click_element.offsetY]);
		  }
		  break;
	  case 3:
		  if(window.navigator.appCodeName == "Mozilla"){
			  start_point = map_3.getCoordinateFromPixel([right_click_element.layerX,right_click_element.layerY]);
		  } else {
			  start_point = map_3.getCoordinateFromPixel([right_click_element.offsetX,right_click_element.offsetY]);
		  }
		  break;
	  case 4:
		  if(window.navigator.appCodeName == "Mozilla"){
			  start_point = map_4.getCoordinateFromPixel([right_click_element.layerX,right_click_element.layerY]);
		  } else {
			  start_point = map_4.getCoordinateFromPixel([right_click_element.offsetX,right_click_element.offsetY]);
		  }
		  break;
	  default:
		  break;
	}
	var end_point;
	var draw_radius;
	var circle_feature;

	$("#popup_div_container_buffer_size").css("display","block");
	$('#popup_div_container_buffer_size').css("top",right_click_element.clientY + 'px');
	$('#popup_div_container_buffer_size').css("left",right_click_element.clientX + 'px');

	switch (clicked_map) {
	  case 1:
		  draw_interaction = map_1.on('pointermove', function(evt) {
			$('#popup_div_container_buffer_size').css("top",(evt.originalEvent.clientY +20) + 'px');
			$('#popup_div_container_buffer_size').css("left",(evt.originalEvent.clientX +20) + 'px');
			end_point = map_1.getCoordinateFromPixel(evt.pixel);
			draw_source.clear();
			draw_radius = Math.sqrt((start_point[0] - end_point[0])*(start_point[0] - end_point[0]) + (start_point[1] - end_point[1])*(start_point[1] - end_point[1]));
			circle_feature = new ol.Feature({
				id:'draw_buffer_feature',
				geometry: new ol.geom.Polygon.fromCircle(new ol.geom.Circle(start_point, parseInt(draw_radius)),30),
		           name: 'Circle'});
			var color_fill ='rgba(255, 0, 0,0.05)';
			var color_stroke ='rgba(255, 0, 0,1)';
			circle_feature.setStyle(new ol.style.Style({
			    fill: new ol.style.Fill({
			    	   color: color_fill
			    }),
			    stroke: new ol.style.Stroke({
			    	   color : color_stroke,
			    	   width : 4
			    	})
			  }));
			draw_source.addFeature(circle_feature);
			var line = new ol.geom.LineString([start_point, end_point]);
			var distance = Math.round(line.getLength() * 100) / 100;
			distance = Math.round(distance / 10);
			distance = distance /100;
			$("#popup_div_buffer_size_value").html(distance);
		});
		  break;
	  case 2:
		  draw_interaction = map_2.on('pointermove', function(evt) {
			$('#popup_div_container_buffer_size').css("top",(evt.originalEvent.clientY +20) + 'px');
			$('#popup_div_container_buffer_size').css("left",(evt.originalEvent.clientX +20) + 'px');
			end_point = map_2.getCoordinateFromPixel(evt.pixel);
			draw_source.clear();
			draw_radius = Math.sqrt((start_point[0] - end_point[0])*(start_point[0] - end_point[0]) + (start_point[1] - end_point[1])*(start_point[1] - end_point[1]));
			circle_feature = new ol.Feature({
				id:'draw_buffer_feature',
				geometry: new ol.geom.Polygon.fromCircle(new ol.geom.Circle(start_point, parseInt(draw_radius)),30),
		           name: 'Circle'});
			var color_fill ='rgba(255, 0, 0,0.05)';
			var color_stroke ='rgba(255, 0, 0,1)';
			circle_feature.setStyle(new ol.style.Style({
			    fill: new ol.style.Fill({
			    	   color: color_fill
			    }),
			    stroke: new ol.style.Stroke({
			    	   color : color_stroke,
			    	   width : 4
			    	})
			  }));
			draw_source.addFeature(circle_feature);
			var line = new ol.geom.LineString([start_point, end_point]);
			var distance = Math.round(line.getLength() * 100) / 100;
			distance = Math.round(distance / 10);
			distance = distance /100;
			$("#popup_div_buffer_size_value").html(distance);
		});
		  break;
	  case 3:
		  draw_interaction = map_3.on('pointermove', function(evt) {
			$('#popup_div_container_buffer_size').css("top",(evt.originalEvent.clientY +20) + 'px');
			$('#popup_div_container_buffer_size').css("left",(evt.originalEvent.clientX +20) + 'px');
			end_point = map_3.getCoordinateFromPixel(evt.pixel);
			draw_source.clear();
			draw_radius = Math.sqrt((start_point[0] - end_point[0])*(start_point[0] - end_point[0]) + (start_point[1] - end_point[1])*(start_point[1] - end_point[1]));
			circle_feature = new ol.Feature({
				id:'draw_buffer_feature',
				geometry: new ol.geom.Polygon.fromCircle(new ol.geom.Circle(start_point, parseInt(draw_radius)),30),
		           name: 'Circle'});
			var color_fill ='rgba(255, 0, 0,0.05)';
			var color_stroke ='rgba(255, 0, 0,1)';
			circle_feature.setStyle(new ol.style.Style({
			    fill: new ol.style.Fill({
			    	   color: color_fill
			    }),
			    stroke: new ol.style.Stroke({
			    	   color : color_stroke,
			    	   width : 4
			    	})
			  }));
			draw_source.addFeature(circle_feature);
			var line = new ol.geom.LineString([start_point, end_point]);
			var distance = Math.round(line.getLength() * 100) / 100;
			distance = Math.round(distance / 10);
			distance = distance /100;
			$("#popup_div_buffer_size_value").html(distance);
		});
		  break;
	  case 4:
		  draw_interaction = map_4.on('pointermove', function(evt) {
			$('#popup_div_container_buffer_size').css("top",(evt.originalEvent.clientY +20) + 'px');
			$('#popup_div_container_buffer_size').css("left",(evt.originalEvent.clientX +20) + 'px');
			end_point = map_4.getCoordinateFromPixel(evt.pixel);
			draw_source.clear();
			draw_radius = Math.sqrt((start_point[0] - end_point[0])*(start_point[0] - end_point[0]) + (start_point[1] - end_point[1])*(start_point[1] - end_point[1]));
			circle_feature = new ol.Feature({
				id:'draw_buffer_feature',
				geometry: new ol.geom.Polygon.fromCircle(new ol.geom.Circle(start_point, parseInt(draw_radius)),30),
		           name: 'Circle'});
			var color_fill ='rgba(255, 0, 0,0.05)';
			var color_stroke ='rgba(255, 0, 0,1)';
			circle_feature.setStyle(new ol.style.Style({
			    fill: new ol.style.Fill({
			    	   color: color_fill
			    }),
			    stroke: new ol.style.Stroke({
			    	   color : color_stroke,
			    	   width : 4
			    	})
			  }));
			draw_source.addFeature(circle_feature);
			var line = new ol.geom.LineString([start_point, end_point]);
			var distance = Math.round(line.getLength() * 100) / 100;
			distance = Math.round(distance / 10);
			distance = distance /100;
			$("#popup_div_buffer_size_value").html(distance);
		});
		  break;
	  default:
		  break;
	}

	switch (clicked_map) {
	  case 1:
		draw_interaction_2 = map_1.on('singleclick', function(evt) {
			$("#popup_div_container_buffer_size").css("display","none");
			draw_source.clear();
			map_1.removeEventListener(draw_interaction);
			phase = 2;
			map_1.removeEventListener(draw_interaction_2);
			map_1.removeEventListener('singleclick');
			map_1.removeEventListener('pointermove');
			filter_on_map_feature = circle_feature;
			var id_rank_clue_2;
			if(app.list_of_rank_2_clue_id.length > 0){
				id_rank_clue_2 = (Math.max(...app.list_of_rank_2_clue_id)) + 1;
			} else {
				id_rank_clue_2 = 1;
			}
			var rank_2_clue_feature_id = add_rank_2_clue_to_map(filter_on_map_feature.getGeometry().clone(),'rgba(255, 0, 0,0.05)','rgba(255, 0, 0,1)',id_rank_clue_2);

			var clue = new rank_2_clue(id_rank_clue_2, [rank_2_clue_feature_id], "dessin", "Zone dessinée manuellement",true,2,true,false);
			app.list_of_rank_2_clue.push(clue);
			app.list_of_rank_2_clue_id.push(id_rank_clue_2);
			var id_group_rank_1_to_rank_2;
			if(app.list_group_rank_1_to_rank_2_id.length > 0){
				id_group_rank_1_to_rank_2 = (Math.max(...app.list_group_rank_1_to_rank_2_id)) + 1;
			} else {
				id_group_rank_1_to_rank_2 = 1;
			}
			var rank_1_to_rank_2 = new group_rank_1_to_rank_2(id_group_rank_1_to_rank_2, null, id_rank_clue_2, "dessin","none");
			app.list_group_rank_1_to_rank_2.push(rank_1_to_rank_2);
			app.list_group_rank_1_to_rank_2_id.push(id_group_rank_1_to_rank_2);
			filter_on_map_feature = null;
			if(app.list_of_rank_3_clue.length > 0){
				for(var j=0; j< app.list_of_rank_3_clue.length; j++){
					app.list_of_rank_3_clue[j].list_id_clue_rank_2.push({'id_clue_rank_2': id_rank_clue_2, 'selected': false});
//					add_rank_3_clue_to_map(app.list_of_rank_3_clue[j]);
					create_rank_3_clue_raster(app.list_of_rank_3_clue[j]);
				}
			}
			redraw_clue_window();
		});
		  break;
	  case 2:
		  draw_interaction_2 = map_2.on('singleclick', function(evt) {
				$("#popup_div_container_buffer_size").css("display","none");
				draw_source.clear();
				map_2.removeEventListener(draw_interaction);
				phase = 2;
				map_2.removeEventListener(draw_interaction_2);
				map_2.removeEventListener('singleclick');
				map_2.removeEventListener('pointermove');
				filter_on_map_feature = circle_feature;
				var id_rank_clue_2;
				if(app.list_of_rank_2_clue_id.length > 0){
					id_rank_clue_2 = (Math.max(...app.list_of_rank_2_clue_id)) + 1;
				} else {
					id_rank_clue_2 = 1;
				}
				var rank_2_clue_feature_id = add_rank_2_clue_to_map(filter_on_map_feature.getGeometry().clone(),'rgba(255, 0, 0,0.05)','rgba(255, 0, 0,1)',id_rank_clue_2);

				var clue = new rank_2_clue(id_rank_clue_2, [rank_2_clue_feature_id], "dessin", "Zone dessinée manuellement",true,2,true,false);
				app.list_of_rank_2_clue.push(clue);
				app.list_of_rank_2_clue_id.push(id_rank_clue_2);
				var id_group_rank_1_to_rank_2;
				if(app.list_group_rank_1_to_rank_2_id.length > 0){
					id_group_rank_1_to_rank_2 = (Math.max(...app.list_group_rank_1_to_rank_2_id)) + 1;
				} else {
					id_group_rank_1_to_rank_2 = 1;
				}
				var rank_1_to_rank_2 = new group_rank_1_to_rank_2(id_group_rank_1_to_rank_2, null, id_rank_clue_2, "dessin","none");
				app.list_group_rank_1_to_rank_2.push(rank_1_to_rank_2);
				app.list_group_rank_1_to_rank_2_id.push(id_group_rank_1_to_rank_2);
				filter_on_map_feature = null;
				if(app.list_of_rank_3_clue.length > 0){
					for(var j=0; j< app.list_of_rank_3_clue.length; j++){
						app.list_of_rank_3_clue[j].list_id_clue_rank_2.push({'id_clue_rank_2': id_rank_clue_2, 'selected': false});
//						add_rank_3_clue_to_map(app.list_of_rank_3_clue[j]);
						create_rank_3_clue_raster(app.list_of_rank_3_clue[j]);
					}
				}
				redraw_clue_window();
			});
		  break;
	  case 3:
		  draw_interaction_2 = map_3.on('singleclick', function(evt) {
				$("#popup_div_container_buffer_size").css("display","none");
				draw_source.clear();
				map_3.removeEventListener(draw_interaction);
				phase = 2;
				map_3.removeEventListener(draw_interaction_2);
				map_3.removeEventListener('singleclick');
				map_3.removeEventListener('pointermove');
				filter_on_map_feature = circle_feature;
				var id_rank_clue_2;
				if(app.list_of_rank_2_clue_id.length > 0){
					id_rank_clue_2 = (Math.max(...app.list_of_rank_2_clue_id)) + 1;
				} else {
					id_rank_clue_2 = 1;
				}
				var rank_2_clue_feature_id = add_rank_2_clue_to_map(filter_on_map_feature.getGeometry().clone(),'rgba(255, 0, 0,0.05)','rgba(255, 0, 0,1)',id_rank_clue_2);

				var clue = new rank_2_clue(id_rank_clue_2, [rank_2_clue_feature_id], "dessin", "Zone dessinée manuellement",true,2,true,false);
				app.list_of_rank_2_clue.push(clue);
				app.list_of_rank_2_clue_id.push(id_rank_clue_2);
				var id_group_rank_1_to_rank_2;
				if(app.list_group_rank_1_to_rank_2_id.length > 0){
					id_group_rank_1_to_rank_2 = (Math.max(...app.list_group_rank_1_to_rank_2_id)) + 1;
				} else {
					id_group_rank_1_to_rank_2 = 1;
				}
				var rank_1_to_rank_2 = new group_rank_1_to_rank_2(id_group_rank_1_to_rank_2, null, id_rank_clue_2, "dessin","none");
				app.list_group_rank_1_to_rank_2.push(rank_1_to_rank_2);
				app.list_group_rank_1_to_rank_2_id.push(id_group_rank_1_to_rank_2);
				filter_on_map_feature = null;
				if(app.list_of_rank_3_clue.length > 0){
					for(var j=0; j< app.list_of_rank_3_clue.length; j++){
						app.list_of_rank_3_clue[j].list_id_clue_rank_2.push({'id_clue_rank_2': id_rank_clue_2, 'selected': false});
//						add_rank_3_clue_to_map(app.list_of_rank_3_clue[j]);
						create_rank_3_clue_raster(app.list_of_rank_3_clue[j]);
					}
				}
				redraw_clue_window();
			});
		  break;
	  case 4:
		 draw_interaction_2 = map_4.on('singleclick', function(evt) {
				$("#popup_div_container_buffer_size").css("display","none");
				draw_source.clear();
				map_4.removeEventListener(draw_interaction);
				phase = 2;
				map_4.removeEventListener(draw_interaction_2);
				map_4.removeEventListener('singleclick');
				map_4.removeEventListener('pointermove');
				filter_on_map_feature = circle_feature;
				var id_rank_clue_2;
				if(app.list_of_rank_2_clue_id.length > 0){
					id_rank_clue_2 = (Math.max(...app.list_of_rank_2_clue_id)) + 1;
				} else {
					id_rank_clue_2 = 1;
				}
				var rank_2_clue_feature_id = add_rank_2_clue_to_map(filter_on_map_feature.getGeometry().clone(),'rgba(255, 0, 0,0.05)','rgba(255, 0, 0,1)',id_rank_clue_2);

				var clue = new rank_2_clue(id_rank_clue_2, [rank_2_clue_feature_id], "dessin", "Zone dessinée manuellement",true,2,true,false);
				app.list_of_rank_2_clue.push(clue);
				app.list_of_rank_2_clue_id.push(id_rank_clue_2);
				var id_group_rank_1_to_rank_2;
				if(app.list_group_rank_1_to_rank_2_id.length > 0){
					id_group_rank_1_to_rank_2 = (Math.max(...app.list_group_rank_1_to_rank_2_id)) + 1;
				} else {
					id_group_rank_1_to_rank_2 = 1;
				}
				var rank_1_to_rank_2 = new group_rank_1_to_rank_2(id_group_rank_1_to_rank_2, null, id_rank_clue_2, "dessin","none");
				app.list_group_rank_1_to_rank_2.push(rank_1_to_rank_2);
				app.list_group_rank_1_to_rank_2_id.push(id_group_rank_1_to_rank_2);
				filter_on_map_feature = null;
				if(app.list_of_rank_3_clue.length > 0){
					for(var j=0; j< app.list_of_rank_3_clue.length; j++){
						app.list_of_rank_3_clue[j].list_id_clue_rank_2.push({'id_clue_rank_2': id_rank_clue_2, 'selected': false});
//						add_rank_3_clue_to_map(app.list_of_rank_3_clue[j]);
						create_rank_3_clue_raster(app.list_of_rank_3_clue[j]);
					}
				}
				redraw_clue_window();
			});
		  break;
	  default:
		  break;
	}
}

/*
 * create_polygon_feature_from_map
 *
 * add rank 2 object by drawing polygon area on map
 * right_click_element: clic event
 */
function create_polygon_feature_from_map(right_click_element){
	//TODO small multiple
	var clicked_map;
	if(window.navigator.appCodeName == "Mozilla"){
		var id_current_map = right_click_element.target.parentElement.parentElement.id;
		if(id_current_map == '1_map_1' || id_current_map == '2_map_1' || id_current_map == '3_map_1' || id_current_map == '4_map_1'){
			clicked_map = 1;
		} else if(id_current_map == '2_map_2' || id_current_map == '3_map_2' || id_current_map == '4_map_2'){
			clicked_map = 2;
		} else if(id_current_map == '3_map_3' || id_current_map == '4_map_3'){
			clicked_map = 3;
		} else if(id_current_map == '4_map_4'){
			clicked_map = 4;
		}
	} else {
		for(var f= 0; f < right_click_element.path.length; f++){
			if(right_click_element.path[f].id == '1_map_1' || right_click_element.path[f].id == '2_map_1' || right_click_element.path[f].id == '3_map_1' || right_click_element.path[f].id == '4_map_1'){
				clicked_map = 1;
				break;
			} else if(right_click_element.path[f].id == '2_map_2' || right_click_element.path[f].id == '3_map_2' || right_click_element.path[f].id == '4_map_2'){
				clicked_map = 2;
				break;
			} else if(right_click_element.path[f].id == '3_map_3' || right_click_element.path[f].id == '4_map_3'){
				clicked_map = 3;
				break;
			} else if(right_click_element.path[f].id == '4_map_4'){
				clicked_map = 4;
				break;
			}
		}
	}

	var phase = 1;

	draw_interaction = new ol.interaction.Draw({
        source: draw_source,
        type: "Polygon"
      });

	switch (clicked_map) {
	  case 1:
		  map_1.addInteraction(draw_interaction);
		  break;
	  case 2:
		  map_2.addInteraction(draw_interaction);
		  break;
	  case 3:
		  map_3.addInteraction(draw_interaction);
		  break;
	  case 4:
		  map_4.addInteraction(draw_interaction);
		  break;
	  default:
		  break;
	}

	var dblClickInteraction;
	switch (clicked_map) {
	  case 1:
		// find DoubleClickZoom interaction
			map_1.getInteractions().getArray().forEach(function(interaction) {
			  if (interaction instanceof ol.interaction.DoubleClickZoom) {
			    dblClickInteraction = interaction;
			  }
			});
			// remove from map
			map_1.removeInteraction(dblClickInteraction);
		  break;
	  case 2:
		// find DoubleClickZoom interaction
			map_2.getInteractions().getArray().forEach(function(interaction) {
			  if (interaction instanceof ol.interaction.DoubleClickZoom) {
			    dblClickInteraction = interaction;
			  }
			});
			// remove from map
			map_2.removeInteraction(dblClickInteraction);
		  break;
	  case 3:
		// find DoubleClickZoom interaction
			map_3.getInteractions().getArray().forEach(function(interaction) {
			  if (interaction instanceof ol.interaction.DoubleClickZoom) {
			    dblClickInteraction = interaction;
			  }
			});
			// remove from map
			map_3.removeInteraction(dblClickInteraction);
		  break;
	  case 4:
		// find DoubleClickZoom interaction
			map_4.getInteractions().getArray().forEach(function(interaction) {
			  if (interaction instanceof ol.interaction.DoubleClickZoom) {
			    dblClickInteraction = interaction;
			  }
			});
			// remove from map
			map_4.removeInteraction(dblClickInteraction);
		  break;
	  default:
		  break;
	}

	switch (clicked_map) {
	  case 1:
		  draw_interaction_2 = map_1.on('dblclick', function(evt) {
				if(draw_source.getFeatures().length >0){
					var id_rank_clue_2;
					if(app.list_of_rank_2_clue_id.length > 0){
						id_rank_clue_2 = (Math.max(...app.list_of_rank_2_clue_id)) + 1;
					} else {
						id_rank_clue_2 = 1;
					}
					var rank_2_clue_feature_id = add_rank_2_clue_to_map(draw_source.getFeatures()[0].getGeometry().clone(),'rgba(255, 0, 0,0.05)','rgba(255, 0, 0,1)',id_rank_clue_2);

					var clue = new rank_2_clue(id_rank_clue_2, [rank_2_clue_feature_id], "dessin", "Zone dessinée manuellement",true,2,true,false);
					app.list_of_rank_2_clue.push(clue);
					app.list_of_rank_2_clue_id.push(id_rank_clue_2);
					var id_group_rank_1_to_rank_2;
					if(app.list_group_rank_1_to_rank_2_id.length > 0){
						id_group_rank_1_to_rank_2 = (Math.max(...app.list_group_rank_1_to_rank_2_id)) + 1;
					} else {
						id_group_rank_1_to_rank_2 = 1;
					}
					var rank_1_to_rank_2 = new group_rank_1_to_rank_2(id_group_rank_1_to_rank_2, null, id_rank_clue_2, "dessin","none");
					app.list_group_rank_1_to_rank_2.push(rank_1_to_rank_2);
					app.list_group_rank_1_to_rank_2_id.push(id_group_rank_1_to_rank_2);
					filter_on_map_feature = null;
					if(app.list_of_rank_3_clue.length > 0){
						for(var j=0; j< app.list_of_rank_3_clue.length; j++){
							app.list_of_rank_3_clue[j].list_id_clue_rank_2.push({'id_clue_rank_2': id_rank_clue_2, 'selected': false});
//							add_rank_3_clue_to_map(app.list_of_rank_3_clue[j]);
							create_rank_3_clue_raster(app.list_of_rank_3_clue[j]);
						}
					}
					redraw_clue_window();
				}
				draw_source.clear();
				map_1.removeInteraction(draw_interaction);
				phase = 2;
				map_1.removeEventListener(draw_interaction_2);
				map_1.removeEventListener('singleclick');
				map_1.removeEventListener('pointermove');
				setTimeout(function(){ map_1.addInteraction(dblClickInteraction)},1000);
			});
		  break;
	  case 2:
		  draw_interaction_2 = map_2.on('dblclick', function(evt) {
				if(draw_source.getFeatures().length >0){
					var id_rank_clue_2;
					if(app.list_of_rank_2_clue_id.length > 0){
						id_rank_clue_2 = (Math.max(...app.list_of_rank_2_clue_id)) + 1;
					} else {
						id_rank_clue_2 = 1;
					}
					var rank_2_clue_feature_id = add_rank_2_clue_to_map(draw_source.getFeatures()[0].getGeometry().clone(),'rgba(255, 0, 0,0.05)','rgba(255, 0, 0,1)',id_rank_clue_2);

					var clue = new rank_2_clue(id_rank_clue_2, [rank_2_clue_feature_id], "dessin", "Zone dessinée manuellement",true,2,true,false);
					app.list_of_rank_2_clue.push(clue);
					app.list_of_rank_2_clue_id.push(id_rank_clue_2);
					var id_group_rank_1_to_rank_2;
					if(app.list_group_rank_1_to_rank_2_id.length > 0){
						id_group_rank_1_to_rank_2 = (Math.max(...app.list_group_rank_1_to_rank_2_id)) + 1;
					} else {
						id_group_rank_1_to_rank_2 = 1;
					}
					var rank_1_to_rank_2 = new group_rank_1_to_rank_2(id_group_rank_1_to_rank_2, null, id_rank_clue_2, "dessin","none");
					app.list_group_rank_1_to_rank_2.push(rank_1_to_rank_2);
					app.list_group_rank_1_to_rank_2_id.push(id_group_rank_1_to_rank_2);
					filter_on_map_feature = null;
					if(app.list_of_rank_3_clue.length > 0){
						for(var j=0; j< app.list_of_rank_3_clue.length; j++){
							app.list_of_rank_3_clue[j].list_id_clue_rank_2.push({'id_clue_rank_2': id_rank_clue_2, 'selected': false});
//							add_rank_3_clue_to_map(app.list_of_rank_3_clue[j]);
							create_rank_3_clue_raster(app.list_of_rank_3_clue[j]);
						}
					}
					redraw_clue_window();
				}
				draw_source.clear();
				map_2.removeInteraction(draw_interaction);
				phase = 2;
				map_2.removeEventListener(draw_interaction_2);
				map_2.removeEventListener('singleclick');
				map_2.removeEventListener('pointermove');
				setTimeout(function(){ map_2.addInteraction(dblClickInteraction)},1000);
			});
		  break;
	  case 3:
		  draw_interaction_2 = map_3.on('dblclick', function(evt) {
				if(draw_source.getFeatures().length >0){
					var id_rank_clue_2;
					if(app.list_of_rank_2_clue_id.length > 0){
						id_rank_clue_2 = (Math.max(...app.list_of_rank_2_clue_id)) + 1;
					} else {
						id_rank_clue_2 = 1;
					}
					var rank_2_clue_feature_id = add_rank_2_clue_to_map(draw_source.getFeatures()[0].getGeometry().clone(),'rgba(255, 0, 0,0.05)','rgba(255, 0, 0,1)',id_rank_clue_2);

					var clue = new rank_2_clue(id_rank_clue_2, [rank_2_clue_feature_id], "dessin", "Zone dessinée manuellement",true,2,true,false);
					app.list_of_rank_2_clue.push(clue);
					app.list_of_rank_2_clue_id.push(id_rank_clue_2);
					var id_group_rank_1_to_rank_2;
					if(app.list_group_rank_1_to_rank_2_id.length > 0){
						id_group_rank_1_to_rank_2 = (Math.max(...app.list_group_rank_1_to_rank_2_id)) + 1;
					} else {
						id_group_rank_1_to_rank_2 = 1;
					}
					var rank_1_to_rank_2 = new group_rank_1_to_rank_2(id_group_rank_1_to_rank_2, null, id_rank_clue_2, "dessin","none");
					app.list_group_rank_1_to_rank_2.push(rank_1_to_rank_2);
					app.list_group_rank_1_to_rank_2_id.push(id_group_rank_1_to_rank_2);
					filter_on_map_feature = null;
					if(app.list_of_rank_3_clue.length > 0){
						for(var j=0; j< app.list_of_rank_3_clue.length; j++){
							app.list_of_rank_3_clue[j].list_id_clue_rank_2.push({'id_clue_rank_2': id_rank_clue_2, 'selected': false});
//							add_rank_3_clue_to_map(app.list_of_rank_3_clue[j]);
							create_rank_3_clue_raster(app.list_of_rank_3_clue[j]);
						}
					}
					redraw_clue_window();
				}
				draw_source.clear();
				map_3.removeInteraction(draw_interaction);
				phase = 2;
				map_3.removeEventListener(draw_interaction_2);
				map_3.removeEventListener('singleclick');
				map_3.removeEventListener('pointermove');
				setTimeout(function(){ map_3.addInteraction(dblClickInteraction)},1000);
			});
		  break;
	  case 4:
		  draw_interaction_2 = map_4.on('dblclick', function(evt) {
				if(draw_source.getFeatures().length >0){
					var id_rank_clue_2;
					if(app.list_of_rank_2_clue_id.length > 0){
						id_rank_clue_2 = (Math.max(...app.list_of_rank_2_clue_id)) + 1;
					} else {
						id_rank_clue_2 = 1;
					}
					var rank_2_clue_feature_id = add_rank_2_clue_to_map(draw_source.getFeatures()[0].getGeometry().clone(),'rgba(255, 0, 0,0.05)','rgba(255, 0, 0,1)',id_rank_clue_2);

					var clue = new rank_2_clue(id_rank_clue_2, [rank_2_clue_feature_id], "dessin", "Zone dessinée manuellement",true,2,true,false);
					app.list_of_rank_2_clue.push(clue);
					app.list_of_rank_2_clue_id.push(id_rank_clue_2);
					var id_group_rank_1_to_rank_2;
					if(app.list_group_rank_1_to_rank_2_id.length > 0){
						id_group_rank_1_to_rank_2 = (Math.max(...app.list_group_rank_1_to_rank_2_id)) + 1;
					} else {
						id_group_rank_1_to_rank_2 = 1;
					}
					var rank_1_to_rank_2 = new group_rank_1_to_rank_2(id_group_rank_1_to_rank_2, null, id_rank_clue_2, "dessin","none");
					app.list_group_rank_1_to_rank_2.push(rank_1_to_rank_2);
					app.list_group_rank_1_to_rank_2_id.push(id_group_rank_1_to_rank_2);
					filter_on_map_feature = null;
					if(app.list_of_rank_3_clue.length > 0){
						for(var j=0; j< app.list_of_rank_3_clue.length; j++){
							app.list_of_rank_3_clue[j].list_id_clue_rank_2.push({'id_clue_rank_2': id_rank_clue_2, 'selected': false});
//							add_rank_3_clue_to_map(app.list_of_rank_3_clue[j]);
							create_rank_3_clue_raster(app.list_of_rank_3_clue[j]);
						}
					}
					redraw_clue_window();
				}
				draw_source.clear();
				map_4.removeInteraction(draw_interaction);
				phase = 2;
				map_4.removeEventListener(draw_interaction_2);
				map_4.removeEventListener('singleclick');
				map_4.removeEventListener('pointermove');
				setTimeout(function(){ map_4.addInteraction(dblClickInteraction)},1000);
			});
		  break;
	  default:
		  break;
	}

}

/*
 * create_direction_feature_from_map
 *
 * add rank 2 object by drawing a conic feature around a directional axis area on map
 * right_click_element: clic event
 */
function create_direction_feature_from_map(element){
	//TODO small multiple
	var clicked_map;
	if(window.navigator.appCodeName == "Mozilla"){
		var id_current_map = right_click_element.target.parentElement.parentElement.id;
		if(id_current_map == '1_map_1' || id_current_map == '2_map_1' || id_current_map == '3_map_1' || id_current_map == '4_map_1'){
			clicked_map = 1;
		} else if(id_current_map == '2_map_2' || id_current_map == '3_map_2' || id_current_map == '4_map_2'){
			clicked_map = 2;
		} else if(id_current_map == '3_map_3' || id_current_map == '4_map_3'){
			clicked_map = 3;
		} else if(id_current_map == '4_map_4'){
			clicked_map = 4;
		}
	} else {
		for(var f= 0; f < right_click_element.path.length; f++){
			if(right_click_element.path[f].id == '1_map_1' || right_click_element.path[f].id == '2_map_1' || right_click_element.path[f].id == '3_map_1' || right_click_element.path[f].id == '4_map_1'){
				clicked_map = 1;
				break;
			} else if(right_click_element.path[f].id == '2_map_2' || right_click_element.path[f].id == '3_map_2' || right_click_element.path[f].id == '4_map_2'){
				clicked_map = 2;
				break;
			} else if(right_click_element.path[f].id == '3_map_3' || right_click_element.path[f].id == '4_map_3'){
				clicked_map = 3;
				break;
			} else if(right_click_element.path[f].id == '4_map_4'){
				clicked_map = 4;
				break;
			}
		}
	}

	var phase = 1;
	var start_point;
	switch (clicked_map) {
	  case 1:
		  if(window.navigator.appCodeName == "Mozilla"){
			  start_point = map_1.getCoordinateFromPixel([element.layerX,element.layerY]);
		  } else {
			  start_point = map_1.getCoordinateFromPixel([element.layerX,element.layerY]);
		  }
		  break;
	  case 2:
		  if(window.navigator.appCodeName == "Mozilla"){
			  start_point = map_2.getCoordinateFromPixel([element.layerX,element.layerY]);
		  } else {
			  start_point = map_2.getCoordinateFromPixel([element.layerX,element.layerY]);
		  }
		  break;
	  case 3:
		  if(window.navigator.appCodeName == "Mozilla"){
			  start_point = map_3.getCoordinateFromPixel([element.layerX,element.layerY]);
		  } else {
			  start_point = map_3.getCoordinateFromPixel([element.layerX,element.layerY]);
		  }
		  break;
	  case 4:
		  if(window.navigator.appCodeName == "Mozilla"){
			  start_point = map_4.getCoordinateFromPixel([element.layerX,element.layerY]);
		  } else {
			  start_point = map_4.getCoordinateFromPixel([element.layerX,element.layerY]);
		  }
		  break;
	  default:
		  break;
	}
	var end_point;
	var draw_radius;
	var intermed_polygon;
	var intermed_polygon_2;
	var intermed_point;
	var intermed_point_2;
	//angle du premier segment avec l'axe horizontal
	var angle_to_horizontal_1;
	//angle du second segment avec l'axe horizontal
	var angle_to_horizontal_2;
	//angle du troisième segment avec l'axe horizontal
	var angle_to_horizontal_3;

	var coord_polygon;
    var GeoJSON_format = new ol.format.GeoJSON();

    switch (clicked_map) {
	  case 1:
		  draw_interaction = map_1.on('pointermove', function(evt) {
				if (phase == 1){
					end_point = map_1.getCoordinateFromPixel(evt.pixel);
					draw_source.clear();
					draw_source.addFeature(new ol.Feature({
			            geometry: new ol.geom.LineString([start_point,end_point]),
			            name: 'Line'
			        }));
					if(end_point[0] > start_point[0]){
						if(end_point[1] > start_point[1]){
							angle_to_horizontal_1 = Math.atan((end_point[1] - start_point[1])/(end_point[0] - start_point[0]));
						} else {
							angle_to_horizontal_1 = Math.PI*2 + Math.atan((end_point[1] - start_point[1])/(end_point[0] - start_point[0]));
						}
					} else {
						angle_to_horizontal_1 = Math.PI + Math.atan((end_point[1] - start_point[1])/(end_point[0] - start_point[0]));
					}
					var buffer_size_y = evt.pixel[1] + 10;
					var buffer_size_x = evt.pixel[0] + parseInt($('#clue_window').width()) + 10;
					$("#popup_div_container_buffer_size").css("display","block");
					$('#popup_div_container_buffer_size').css("top",buffer_size_y + 'px');
					$('#popup_div_container_buffer_size').css("left",buffer_size_x + 'px');
					var line = new ol.geom.LineString([start_point, end_point]);
					var distance = Math.round(line.getLength() * 100) / 100;
					distance = Math.round(distance / 10);
					distance = distance /100;
					$("#popup_div_buffer_size_value").html(distance);
				} else if (phase == 2){
					intermed_point = map_1.getCoordinateFromPixel(evt.pixel);
					draw_source.clear();
					if(intermed_point[0] > start_point[0]){
						if(intermed_point[1] > start_point[1]){
							angle_to_horizontal_2 = Math.atan((intermed_point[1] - start_point[1])/(intermed_point[0] - start_point[0]));
						} else {
							angle_to_horizontal_2 = Math.PI*2 + Math.atan((intermed_point[1] - start_point[1])/(intermed_point[0] - start_point[0]));
						}
					} else {
						angle_to_horizontal_2 = Math.PI + Math.atan((intermed_point[1] - start_point[1])/(intermed_point[0] - start_point[0]));
					}
					angle_to_horizontal_3 = 2*angle_to_horizontal_1 - angle_to_horizontal_2;
					var dist = Math.sqrt( (start_point[0] - end_point[0]) * (start_point[0] - end_point[0]) + (start_point[1] - end_point[1]) * (start_point[1] - end_point[1]) );
					var x_1 = start_point[0] + parseInt((dist*1.1) * Math.cos(angle_to_horizontal_2));
					var y_1 = start_point[1] + parseInt((dist*1.1) * Math.sin(angle_to_horizontal_2));
					var x_2 = start_point[0] + parseInt((dist*1.1) * Math.cos(angle_to_horizontal_3));
					var y_2 = start_point[1] + parseInt((dist*1.1) * Math.sin(angle_to_horizontal_3));
					if((Math.abs(angle_to_horizontal_2 - angle_to_horizontal_1)<(Math.PI/2)) || (Math.abs(angle_to_horizontal_3 - angle_to_horizontal_1)<(Math.PI/2))){
						var x_3,y_3,x_4,y_4;
						x_3 = x_1 + parseInt((dist*1.1) * Math.cos(angle_to_horizontal_1));
						y_3 = y_1 + parseInt((dist*1.1) * Math.sin(angle_to_horizontal_1));
						x_4 = x_2 + parseInt((dist*1.1) * Math.cos(angle_to_horizontal_1));
						y_4 = y_2 + parseInt((dist*1.1) * Math.sin(angle_to_horizontal_1));
						coord_polygon = [
							start_point,
							[x_1,y_1],
							[x_3,y_3],
							[x_4,y_4],
							[x_2,y_2],
							start_point
						];
						intermed_polygon_2 = new ol.Feature({
				            geometry: new ol.geom.Polygon([coord_polygon]),
				            name: 'Line'
				        })
						global_coord = [x_1,y_1,x_3,y_3]
					} else {
						var x_5,y_5,x_6,y_6,x_7,y_7,x_8,y_8;
						x_5 = start_point[0] + parseInt((dist*1.2) * Math.cos(angle_to_horizontal_1 + Math.PI/2)) - parseInt((dist*1.2) * Math.cos(angle_to_horizontal_1));
						y_5 = start_point[1] + parseInt((dist*1.2) * Math.sin(angle_to_horizontal_1 + Math.PI/2)) - parseInt((dist*1.2) * Math.sin(angle_to_horizontal_1));
						x_6 = start_point[0] + parseInt((dist*1.2) * Math.cos(angle_to_horizontal_1 + 3*(Math.PI/2))) - parseInt((dist*1.2) * Math.cos(angle_to_horizontal_1));
						y_6 = start_point[1] + parseInt((dist*1.2) * Math.sin(angle_to_horizontal_1 + 3*(Math.PI/2))) - parseInt((dist*1.2) * Math.sin(angle_to_horizontal_1));
						x_7 = start_point[0] + parseInt((dist*1.2) * Math.cos(angle_to_horizontal_1 + Math.PI/2)) + parseInt((dist*1.2) * Math.cos(angle_to_horizontal_1));
						y_7 = start_point[1] + parseInt((dist*1.2) * Math.sin(angle_to_horizontal_1 + Math.PI/2)) + parseInt((dist*1.2) * Math.sin(angle_to_horizontal_1));
						x_8 = start_point[0] + parseInt((dist*1.2) * Math.cos(angle_to_horizontal_1 + 3*(Math.PI/2))) + parseInt((dist*1.2) * Math.cos(angle_to_horizontal_1));
						y_8 = start_point[1] + parseInt((dist*1.2) * Math.sin(angle_to_horizontal_1 + 3*(Math.PI/2))) + parseInt((dist*1.2) * Math.sin(angle_to_horizontal_1));
						var dist_1_5 = Math.sqrt( (x_1 - x_5) * (x_1 - x_5) + (y_1 - y_5) * (y_1 - y_5) );
						var dist_1_6 = Math.sqrt( (x_1 - x_6) * (x_1 - x_6) + (y_1 - y_6) * (y_1 - y_6) );
						if(dist_1_5 < dist_1_6){
							coord_polygon = [
								start_point,
								[x_1,y_1],
								[x_5,y_5],
								[x_7,y_7],
								[x_8,y_8],
								[x_6,y_6],
								[x_2,y_2],
								start_point
							];
							intermed_polygon_2 = new ol.Feature({
					            geometry: new ol.geom.Polygon([coord_polygon]),
					            name: 'Line'
					        })
						} else {
							coord_polygon = [
								start_point,
								[x_1,y_1],
								[x_6,y_6],
								[x_8,y_8],
								[x_7,y_7],
								[x_5,y_5],
								[x_2,y_2],
								start_point
							];
							intermed_polygon_2 = new ol.Feature({
					            geometry: new ol.geom.Polygon([coord_polygon]),
					            name: 'Line'
					        })
						}
					}
					var intermed_polygon_GeoJSON = GeoJSON_format.writeFeatureObject(intermed_polygon.clone());
					var intermed_polygon_2_GeoJSON = turf.polygon([coord_polygon]);
					var intermed_polygon_2_GeoJSON_rewind = turf.rewind(intermed_polygon_2_GeoJSON);
					var intersection = turf.intersect(intermed_polygon_GeoJSON,intermed_polygon_2_GeoJSON_rewind);
					var intermed_feature = GeoJSON_format.readFeature(intersection);
					draw_source.addFeature(intermed_feature);
				}
			});
		  break;
	  case 2:
		  draw_interaction = map_2.on('pointermove', function(evt) {
				if (phase == 1){
					end_point = map_2.getCoordinateFromPixel(evt.pixel);
					draw_source.clear();
					draw_source.addFeature(new ol.Feature({
			            geometry: new ol.geom.LineString([start_point,end_point]),
			            name: 'Line'
			        }));
					if(end_point[0] > start_point[0]){
						if(end_point[1] > start_point[1]){
							angle_to_horizontal_1 = Math.atan((end_point[1] - start_point[1])/(end_point[0] - start_point[0]));
						} else {
							angle_to_horizontal_1 = Math.PI*2 + Math.atan((end_point[1] - start_point[1])/(end_point[0] - start_point[0]));
						}
					} else {
						angle_to_horizontal_1 = Math.PI + Math.atan((end_point[1] - start_point[1])/(end_point[0] - start_point[0]));
					}
					var buffer_size_y = evt.pixel[1] + 10;
					var buffer_size_x = evt.pixel[0] + parseInt($('#clue_window').width()) + 10;
					$("#popup_div_container_buffer_size").css("display","block");
					$('#popup_div_container_buffer_size').css("top",buffer_size_y + 'px');
					$('#popup_div_container_buffer_size').css("left",buffer_size_x + 'px');
					var line = new ol.geom.LineString([start_point, end_point]);
					var distance = Math.round(line.getLength() * 100) / 100;
					distance = Math.round(distance / 10);
					distance = distance /100;
					$("#popup_div_buffer_size_value").html(distance);
				} else if (phase == 2){
					intermed_point = map_2.getCoordinateFromPixel(evt.pixel);
					draw_source.clear();
					if(intermed_point[0] > start_point[0]){
						if(intermed_point[1] > start_point[1]){
							angle_to_horizontal_2 = Math.atan((intermed_point[1] - start_point[1])/(intermed_point[0] - start_point[0]));
						} else {
							angle_to_horizontal_2 = Math.PI*2 + Math.atan((intermed_point[1] - start_point[1])/(intermed_point[0] - start_point[0]));
						}
					} else {
						angle_to_horizontal_2 = Math.PI + Math.atan((intermed_point[1] - start_point[1])/(intermed_point[0] - start_point[0]));
					}
					angle_to_horizontal_3 = 2*angle_to_horizontal_1 - angle_to_horizontal_2;
					var dist = Math.sqrt( (start_point[0] - end_point[0]) * (start_point[0] - end_point[0]) + (start_point[1] - end_point[1]) * (start_point[1] - end_point[1]) );
					var x_1 = start_point[0] + parseInt((dist*1.1) * Math.cos(angle_to_horizontal_2));
					var y_1 = start_point[1] + parseInt((dist*1.1) * Math.sin(angle_to_horizontal_2));
					var x_2 = start_point[0] + parseInt((dist*1.1) * Math.cos(angle_to_horizontal_3));
					var y_2 = start_point[1] + parseInt((dist*1.1) * Math.sin(angle_to_horizontal_3));
					if((Math.abs(angle_to_horizontal_2 - angle_to_horizontal_1)<(Math.PI/2)) || (Math.abs(angle_to_horizontal_3 - angle_to_horizontal_1)<(Math.PI/2))){
						var x_3,y_3,x_4,y_4;
						x_3 = x_1 + parseInt((dist*1.1) * Math.cos(angle_to_horizontal_1));
						y_3 = y_1 + parseInt((dist*1.1) * Math.sin(angle_to_horizontal_1));
						x_4 = x_2 + parseInt((dist*1.1) * Math.cos(angle_to_horizontal_1));
						y_4 = y_2 + parseInt((dist*1.1) * Math.sin(angle_to_horizontal_1));
						coord_polygon = [
							start_point,
							[x_1,y_1],
							[x_3,y_3],
							[x_4,y_4],
							[x_2,y_2],
							start_point
						];
						intermed_polygon_2 = new ol.Feature({
				            geometry: new ol.geom.Polygon([coord_polygon]),
				            name: 'Line'
				        })
						global_coord = [x_1,y_1,x_3,y_3]
					} else {
						var x_5,y_5,x_6,y_6,x_7,y_7,x_8,y_8;
						x_5 = start_point[0] + parseInt((dist*1.2) * Math.cos(angle_to_horizontal_1 + Math.PI/2)) - parseInt((dist*1.2) * Math.cos(angle_to_horizontal_1));
						y_5 = start_point[1] + parseInt((dist*1.2) * Math.sin(angle_to_horizontal_1 + Math.PI/2)) - parseInt((dist*1.2) * Math.sin(angle_to_horizontal_1));
						x_6 = start_point[0] + parseInt((dist*1.2) * Math.cos(angle_to_horizontal_1 + 3*(Math.PI/2))) - parseInt((dist*1.2) * Math.cos(angle_to_horizontal_1));
						y_6 = start_point[1] + parseInt((dist*1.2) * Math.sin(angle_to_horizontal_1 + 3*(Math.PI/2))) - parseInt((dist*1.2) * Math.sin(angle_to_horizontal_1));
						x_7 = start_point[0] + parseInt((dist*1.2) * Math.cos(angle_to_horizontal_1 + Math.PI/2)) + parseInt((dist*1.2) * Math.cos(angle_to_horizontal_1));
						y_7 = start_point[1] + parseInt((dist*1.2) * Math.sin(angle_to_horizontal_1 + Math.PI/2)) + parseInt((dist*1.2) * Math.sin(angle_to_horizontal_1));
						x_8 = start_point[0] + parseInt((dist*1.2) * Math.cos(angle_to_horizontal_1 + 3*(Math.PI/2))) + parseInt((dist*1.2) * Math.cos(angle_to_horizontal_1));
						y_8 = start_point[1] + parseInt((dist*1.2) * Math.sin(angle_to_horizontal_1 + 3*(Math.PI/2))) + parseInt((dist*1.2) * Math.sin(angle_to_horizontal_1));
						var dist_1_5 = Math.sqrt( (x_1 - x_5) * (x_1 - x_5) + (y_1 - y_5) * (y_1 - y_5) );
						var dist_1_6 = Math.sqrt( (x_1 - x_6) * (x_1 - x_6) + (y_1 - y_6) * (y_1 - y_6) );
						if(dist_1_5 < dist_1_6){
							coord_polygon = [
								start_point,
								[x_1,y_1],
								[x_5,y_5],
								[x_7,y_7],
								[x_8,y_8],
								[x_6,y_6],
								[x_2,y_2],
								start_point
							];
							intermed_polygon_2 = new ol.Feature({
					            geometry: new ol.geom.Polygon([coord_polygon]),
					            name: 'Line'
					        })
						} else {
							coord_polygon = [
								start_point,
								[x_1,y_1],
								[x_6,y_6],
								[x_8,y_8],
								[x_7,y_7],
								[x_5,y_5],
								[x_2,y_2],
								start_point
							];
							intermed_polygon_2 = new ol.Feature({
					            geometry: new ol.geom.Polygon([coord_polygon]),
					            name: 'Line'
					        })
						}
					}
					var intermed_polygon_GeoJSON = GeoJSON_format.writeFeatureObject(intermed_polygon.clone());
					var intermed_polygon_2_GeoJSON = turf.polygon([coord_polygon]);
					var intermed_polygon_2_GeoJSON_rewind = turf.rewind(intermed_polygon_2_GeoJSON);
					var intersection = turf.intersect(intermed_polygon_GeoJSON,intermed_polygon_2_GeoJSON_rewind);
					var intermed_feature = GeoJSON_format.readFeature(intersection);
					draw_source.addFeature(intermed_feature);
				}
			});
		  break;
	  case 3:
		  draw_interaction = map_3.on('pointermove', function(evt) {
				if (phase == 1){
					end_point = map_3.getCoordinateFromPixel(evt.pixel);
					draw_source.clear();
					draw_source.addFeature(new ol.Feature({
			            geometry: new ol.geom.LineString([start_point,end_point]),
			            name: 'Line'
			        }));
					if(end_point[0] > start_point[0]){
						if(end_point[1] > start_point[1]){
							angle_to_horizontal_1 = Math.atan((end_point[1] - start_point[1])/(end_point[0] - start_point[0]));
						} else {
							angle_to_horizontal_1 = Math.PI*2 + Math.atan((end_point[1] - start_point[1])/(end_point[0] - start_point[0]));
						}
					} else {
						angle_to_horizontal_1 = Math.PI + Math.atan((end_point[1] - start_point[1])/(end_point[0] - start_point[0]));
					}
					var buffer_size_y = evt.pixel[1] + 10;
					var buffer_size_x = evt.pixel[0] + parseInt($('#clue_window').width()) + 10;
					$("#popup_div_container_buffer_size").css("display","block");
					$('#popup_div_container_buffer_size').css("top",buffer_size_y + 'px');
					$('#popup_div_container_buffer_size').css("left",buffer_size_x + 'px');
					var line = new ol.geom.LineString([start_point, end_point]);
					var distance = Math.round(line.getLength() * 100) / 100;
					distance = Math.round(distance / 10);
					distance = distance /100;
					$("#popup_div_buffer_size_value").html(distance);
				} else if (phase == 2){
					intermed_point = map_3.getCoordinateFromPixel(evt.pixel);
					draw_source.clear();
					if(intermed_point[0] > start_point[0]){
						if(intermed_point[1] > start_point[1]){
							angle_to_horizontal_2 = Math.atan((intermed_point[1] - start_point[1])/(intermed_point[0] - start_point[0]));
						} else {
							angle_to_horizontal_2 = Math.PI*2 + Math.atan((intermed_point[1] - start_point[1])/(intermed_point[0] - start_point[0]));
						}
					} else {
						angle_to_horizontal_2 = Math.PI + Math.atan((intermed_point[1] - start_point[1])/(intermed_point[0] - start_point[0]));
					}
					angle_to_horizontal_3 = 2*angle_to_horizontal_1 - angle_to_horizontal_2;
					var dist = Math.sqrt( (start_point[0] - end_point[0]) * (start_point[0] - end_point[0]) + (start_point[1] - end_point[1]) * (start_point[1] - end_point[1]) );
					var x_1 = start_point[0] + parseInt((dist*1.1) * Math.cos(angle_to_horizontal_2));
					var y_1 = start_point[1] + parseInt((dist*1.1) * Math.sin(angle_to_horizontal_2));
					var x_2 = start_point[0] + parseInt((dist*1.1) * Math.cos(angle_to_horizontal_3));
					var y_2 = start_point[1] + parseInt((dist*1.1) * Math.sin(angle_to_horizontal_3));
					if((Math.abs(angle_to_horizontal_2 - angle_to_horizontal_1)<(Math.PI/2)) || (Math.abs(angle_to_horizontal_3 - angle_to_horizontal_1)<(Math.PI/2))){
						var x_3,y_3,x_4,y_4;
						x_3 = x_1 + parseInt((dist*1.1) * Math.cos(angle_to_horizontal_1));
						y_3 = y_1 + parseInt((dist*1.1) * Math.sin(angle_to_horizontal_1));
						x_4 = x_2 + parseInt((dist*1.1) * Math.cos(angle_to_horizontal_1));
						y_4 = y_2 + parseInt((dist*1.1) * Math.sin(angle_to_horizontal_1));
						coord_polygon = [
							start_point,
							[x_1,y_1],
							[x_3,y_3],
							[x_4,y_4],
							[x_2,y_2],
							start_point
						];
						intermed_polygon_2 = new ol.Feature({
				            geometry: new ol.geom.Polygon([coord_polygon]),
				            name: 'Line'
				        })
						global_coord = [x_1,y_1,x_3,y_3]
					} else {
						var x_5,y_5,x_6,y_6,x_7,y_7,x_8,y_8;
						x_5 = start_point[0] + parseInt((dist*1.2) * Math.cos(angle_to_horizontal_1 + Math.PI/2)) - parseInt((dist*1.2) * Math.cos(angle_to_horizontal_1));
						y_5 = start_point[1] + parseInt((dist*1.2) * Math.sin(angle_to_horizontal_1 + Math.PI/2)) - parseInt((dist*1.2) * Math.sin(angle_to_horizontal_1));
						x_6 = start_point[0] + parseInt((dist*1.2) * Math.cos(angle_to_horizontal_1 + 3*(Math.PI/2))) - parseInt((dist*1.2) * Math.cos(angle_to_horizontal_1));
						y_6 = start_point[1] + parseInt((dist*1.2) * Math.sin(angle_to_horizontal_1 + 3*(Math.PI/2))) - parseInt((dist*1.2) * Math.sin(angle_to_horizontal_1));
						x_7 = start_point[0] + parseInt((dist*1.2) * Math.cos(angle_to_horizontal_1 + Math.PI/2)) + parseInt((dist*1.2) * Math.cos(angle_to_horizontal_1));
						y_7 = start_point[1] + parseInt((dist*1.2) * Math.sin(angle_to_horizontal_1 + Math.PI/2)) + parseInt((dist*1.2) * Math.sin(angle_to_horizontal_1));
						x_8 = start_point[0] + parseInt((dist*1.2) * Math.cos(angle_to_horizontal_1 + 3*(Math.PI/2))) + parseInt((dist*1.2) * Math.cos(angle_to_horizontal_1));
						y_8 = start_point[1] + parseInt((dist*1.2) * Math.sin(angle_to_horizontal_1 + 3*(Math.PI/2))) + parseInt((dist*1.2) * Math.sin(angle_to_horizontal_1));
						var dist_1_5 = Math.sqrt( (x_1 - x_5) * (x_1 - x_5) + (y_1 - y_5) * (y_1 - y_5) );
						var dist_1_6 = Math.sqrt( (x_1 - x_6) * (x_1 - x_6) + (y_1 - y_6) * (y_1 - y_6) );
						if(dist_1_5 < dist_1_6){
							coord_polygon = [
								start_point,
								[x_1,y_1],
								[x_5,y_5],
								[x_7,y_7],
								[x_8,y_8],
								[x_6,y_6],
								[x_2,y_2],
								start_point
							];
							intermed_polygon_2 = new ol.Feature({
					            geometry: new ol.geom.Polygon([coord_polygon]),
					            name: 'Line'
					        })
						} else {
							coord_polygon = [
								start_point,
								[x_1,y_1],
								[x_6,y_6],
								[x_8,y_8],
								[x_7,y_7],
								[x_5,y_5],
								[x_2,y_2],
								start_point
							];
							intermed_polygon_2 = new ol.Feature({
					            geometry: new ol.geom.Polygon([coord_polygon]),
					            name: 'Line'
					        })
						}
					}
					var intermed_polygon_GeoJSON = GeoJSON_format.writeFeatureObject(intermed_polygon.clone());
					var intermed_polygon_2_GeoJSON = turf.polygon([coord_polygon]);
					var intermed_polygon_2_GeoJSON_rewind = turf.rewind(intermed_polygon_2_GeoJSON);
					var intersection = turf.intersect(intermed_polygon_GeoJSON,intermed_polygon_2_GeoJSON_rewind);
					var intermed_feature = GeoJSON_format.readFeature(intersection);
					draw_source.addFeature(intermed_feature);
				}
			});
		  break;
	  case 4:
		  draw_interaction = map_4.on('pointermove', function(evt) {
				if (phase == 1){
					end_point = map_4.getCoordinateFromPixel(evt.pixel);
					draw_source.clear();
					draw_source.addFeature(new ol.Feature({
			            geometry: new ol.geom.LineString([start_point,end_point]),
			            name: 'Line'
			        }));
					if(end_point[0] > start_point[0]){
						if(end_point[1] > start_point[1]){
							angle_to_horizontal_1 = Math.atan((end_point[1] - start_point[1])/(end_point[0] - start_point[0]));
						} else {
							angle_to_horizontal_1 = Math.PI*2 + Math.atan((end_point[1] - start_point[1])/(end_point[0] - start_point[0]));
						}
					} else {
						angle_to_horizontal_1 = Math.PI + Math.atan((end_point[1] - start_point[1])/(end_point[0] - start_point[0]));
					}
					var buffer_size_y = evt.pixel[1] + 10;
					var buffer_size_x = evt.pixel[0] + parseInt($('#clue_window').width()) + 10;
					$("#popup_div_container_buffer_size").css("display","block");
					$('#popup_div_container_buffer_size').css("top",buffer_size_y + 'px');
					$('#popup_div_container_buffer_size').css("left",buffer_size_x + 'px');
					var line = new ol.geom.LineString([start_point, end_point]);
					var distance = Math.round(line.getLength() * 100) / 100;
					distance = Math.round(distance / 10);
					distance = distance /100;
					$("#popup_div_buffer_size_value").html(distance);
				} else if (phase == 2){
					intermed_point = map_4.getCoordinateFromPixel(evt.pixel);
					draw_source.clear();
					if(intermed_point[0] > start_point[0]){
						if(intermed_point[1] > start_point[1]){
							angle_to_horizontal_2 = Math.atan((intermed_point[1] - start_point[1])/(intermed_point[0] - start_point[0]));
						} else {
							angle_to_horizontal_2 = Math.PI*2 + Math.atan((intermed_point[1] - start_point[1])/(intermed_point[0] - start_point[0]));
						}
					} else {
						angle_to_horizontal_2 = Math.PI + Math.atan((intermed_point[1] - start_point[1])/(intermed_point[0] - start_point[0]));
					}
					angle_to_horizontal_3 = 2*angle_to_horizontal_1 - angle_to_horizontal_2;
					var dist = Math.sqrt( (start_point[0] - end_point[0]) * (start_point[0] - end_point[0]) + (start_point[1] - end_point[1]) * (start_point[1] - end_point[1]) );
					var x_1 = start_point[0] + parseInt((dist*1.1) * Math.cos(angle_to_horizontal_2));
					var y_1 = start_point[1] + parseInt((dist*1.1) * Math.sin(angle_to_horizontal_2));
					var x_2 = start_point[0] + parseInt((dist*1.1) * Math.cos(angle_to_horizontal_3));
					var y_2 = start_point[1] + parseInt((dist*1.1) * Math.sin(angle_to_horizontal_3));
					if((Math.abs(angle_to_horizontal_2 - angle_to_horizontal_1)<(Math.PI/2)) || (Math.abs(angle_to_horizontal_3 - angle_to_horizontal_1)<(Math.PI/2))){
						var x_3,y_3,x_4,y_4;
						x_3 = x_1 + parseInt((dist*1.1) * Math.cos(angle_to_horizontal_1));
						y_3 = y_1 + parseInt((dist*1.1) * Math.sin(angle_to_horizontal_1));
						x_4 = x_2 + parseInt((dist*1.1) * Math.cos(angle_to_horizontal_1));
						y_4 = y_2 + parseInt((dist*1.1) * Math.sin(angle_to_horizontal_1));
						coord_polygon = [
							start_point,
							[x_1,y_1],
							[x_3,y_3],
							[x_4,y_4],
							[x_2,y_2],
							start_point
						];
						intermed_polygon_2 = new ol.Feature({
				            geometry: new ol.geom.Polygon([coord_polygon]),
				            name: 'Line'
				        })
						global_coord = [x_1,y_1,x_3,y_3]
					} else {
						var x_5,y_5,x_6,y_6,x_7,y_7,x_8,y_8;
						x_5 = start_point[0] + parseInt((dist*1.2) * Math.cos(angle_to_horizontal_1 + Math.PI/2)) - parseInt((dist*1.2) * Math.cos(angle_to_horizontal_1));
						y_5 = start_point[1] + parseInt((dist*1.2) * Math.sin(angle_to_horizontal_1 + Math.PI/2)) - parseInt((dist*1.2) * Math.sin(angle_to_horizontal_1));
						x_6 = start_point[0] + parseInt((dist*1.2) * Math.cos(angle_to_horizontal_1 + 3*(Math.PI/2))) - parseInt((dist*1.2) * Math.cos(angle_to_horizontal_1));
						y_6 = start_point[1] + parseInt((dist*1.2) * Math.sin(angle_to_horizontal_1 + 3*(Math.PI/2))) - parseInt((dist*1.2) * Math.sin(angle_to_horizontal_1));
						x_7 = start_point[0] + parseInt((dist*1.2) * Math.cos(angle_to_horizontal_1 + Math.PI/2)) + parseInt((dist*1.2) * Math.cos(angle_to_horizontal_1));
						y_7 = start_point[1] + parseInt((dist*1.2) * Math.sin(angle_to_horizontal_1 + Math.PI/2)) + parseInt((dist*1.2) * Math.sin(angle_to_horizontal_1));
						x_8 = start_point[0] + parseInt((dist*1.2) * Math.cos(angle_to_horizontal_1 + 3*(Math.PI/2))) + parseInt((dist*1.2) * Math.cos(angle_to_horizontal_1));
						y_8 = start_point[1] + parseInt((dist*1.2) * Math.sin(angle_to_horizontal_1 + 3*(Math.PI/2))) + parseInt((dist*1.2) * Math.sin(angle_to_horizontal_1));
						var dist_1_5 = Math.sqrt( (x_1 - x_5) * (x_1 - x_5) + (y_1 - y_5) * (y_1 - y_5) );
						var dist_1_6 = Math.sqrt( (x_1 - x_6) * (x_1 - x_6) + (y_1 - y_6) * (y_1 - y_6) );
						if(dist_1_5 < dist_1_6){
							coord_polygon = [
								start_point,
								[x_1,y_1],
								[x_5,y_5],
								[x_7,y_7],
								[x_8,y_8],
								[x_6,y_6],
								[x_2,y_2],
								start_point
							];
							intermed_polygon_2 = new ol.Feature({
					            geometry: new ol.geom.Polygon([coord_polygon]),
					            name: 'Line'
					        })
						} else {
							coord_polygon = [
								start_point,
								[x_1,y_1],
								[x_6,y_6],
								[x_8,y_8],
								[x_7,y_7],
								[x_5,y_5],
								[x_2,y_2],
								start_point
							];
							intermed_polygon_2 = new ol.Feature({
					            geometry: new ol.geom.Polygon([coord_polygon]),
					            name: 'Line'
					        })
						}
					}
					var intermed_polygon_GeoJSON = GeoJSON_format.writeFeatureObject(intermed_polygon.clone());
					var intermed_polygon_2_GeoJSON = turf.polygon([coord_polygon]);
					var intermed_polygon_2_GeoJSON_rewind = turf.rewind(intermed_polygon_2_GeoJSON);
					var intersection = turf.intersect(intermed_polygon_GeoJSON,intermed_polygon_2_GeoJSON_rewind);
					var intermed_feature = GeoJSON_format.readFeature(intersection);
					draw_source.addFeature(intermed_feature);
				}
			});
		  break;
	  default:
		  break;
	}

    switch (clicked_map) {
	  case 1:
		  draw_interaction_2 = map_1.on('singleclick', function(evt) {
				if (phase == 1){
					draw_source.clear();
					map_1.removeEventListener(draw_interaction);
					phase = 2;
					draw_radius = Math.sqrt((start_point[0]-end_point[0])*(start_point[0]-end_point[0])+(start_point[1]-end_point[1])*(start_point[1]-end_point[1]));
					intermed_polygon = new ol.Feature({
							geometry: new ol.geom.Polygon.fromCircle(new ol.geom.Circle(start_point, parseInt(draw_radius)),30),
				            name: 'Circle'});
					$("#popup_div_container_buffer_size").css("display","none");
				} else if (phase == 2){
					//create arc_circle, intersection of circle_feature and  intermed_polygon
					//draw_source.clear();
					map_1.removeEventListener(draw_interaction);
					phase = 3;
					var copyfeature = new ol.Feature({
						geometry: new ol.geom.Polygon.fromExtent(global_coord),
			            name: 'Circle'});
					var intermed_polygon_GeoJSON = GeoJSON_format.writeFeatureObject(intermed_polygon.clone());
					var intermed_polygon_2_GeoJSON = turf.polygon([coord_polygon]);
					var intermed_polygon_2_GeoJSON_rewind = turf.rewind(intermed_polygon_2_GeoJSON);
					var intersection = turf.intersect(intermed_polygon_GeoJSON,intermed_polygon_2_GeoJSON_rewind);
					if (intersection != null) {
						filter_on_map_feature = GeoJSON_format.readFeature(intersection);
						map_1.removeEventListener(draw_interaction);
						map_1.removeEventListener(draw_interaction_2);
						map_1.removeEventListener('singleclick');
						map_1.removeEventListener('pointermove');
						var id_rank_clue_2;
						if(app.list_of_rank_2_clue_id.length > 0){
							id_rank_clue_2 = (Math.max(...app.list_of_rank_2_clue_id)) + 1;
						} else {
							id_rank_clue_2 = 1;
						}
						var rank_2_clue_feature_id = add_rank_2_clue_to_map(filter_on_map_feature.getGeometry().clone(),'rgba(255, 0, 0,0.05)','rgba(255, 0, 0,1)',id_rank_clue_2);

						var clue = new rank_2_clue(id_rank_clue_2, [rank_2_clue_feature_id], "dessin", "Zone dessinée manuellement",true,2,true,false);
						app.list_of_rank_2_clue.push(clue);
						app.list_of_rank_2_clue_id.push(id_rank_clue_2);
						var id_group_rank_1_to_rank_2;
						if(app.list_group_rank_1_to_rank_2_id.length > 0){
							id_group_rank_1_to_rank_2 = (Math.max(...app.list_group_rank_1_to_rank_2_id)) + 1;
						} else {
							id_group_rank_1_to_rank_2 = 1;
						}
						var rank_1_to_rank_2 = new group_rank_1_to_rank_2(id_group_rank_1_to_rank_2, null, id_rank_clue_2, "dessin","none");
						app.list_group_rank_1_to_rank_2.push(rank_1_to_rank_2);
						app.list_group_rank_1_to_rank_2_id.push(id_group_rank_1_to_rank_2);
						filter_on_map_feature = null;
						if(app.list_of_rank_3_clue.length > 0){
							for(var j=0; j< app.list_of_rank_3_clue.length; j++){
								app.list_of_rank_3_clue[j].list_id_clue_rank_2.push({'id_clue_rank_2': id_rank_clue_2, 'selected': false});
//								add_rank_3_clue_to_map(app.list_of_rank_3_clue[j]);
								create_rank_3_clue_raster(app.list_of_rank_3_clue[j]);
							}
						}
						redraw_clue_window();
		            }
					draw_source.clear();
				}
			});
		  break;
	  case 2:
		  draw_interaction_2 = map_2.on('singleclick', function(evt) {
				if (phase == 1){
					draw_source.clear();
					map_2.removeEventListener(draw_interaction);
					phase = 2;
					draw_radius = Math.sqrt((start_point[0]-end_point[0])*(start_point[0]-end_point[0])+(start_point[1]-end_point[1])*(start_point[1]-end_point[1]));
					intermed_polygon = new ol.Feature({
							geometry: new ol.geom.Polygon.fromCircle(new ol.geom.Circle(start_point, parseInt(draw_radius)),30),
				            name: 'Circle'});
					$("#popup_div_container_buffer_size").css("display","none");
				} else if (phase == 2){
					//create arc_circle, intersection of circle_feature and  intermed_polygon
					//draw_source.clear();
					map_2.removeEventListener(draw_interaction);
					phase = 3;
					var copyfeature = new ol.Feature({
						geometry: new ol.geom.Polygon.fromExtent(global_coord),
			            name: 'Circle'});
					var intermed_polygon_GeoJSON = GeoJSON_format.writeFeatureObject(intermed_polygon.clone());
					var intermed_polygon_2_GeoJSON = turf.polygon([coord_polygon]);
					var intermed_polygon_2_GeoJSON_rewind = turf.rewind(intermed_polygon_2_GeoJSON);
					var intersection = turf.intersect(intermed_polygon_GeoJSON,intermed_polygon_2_GeoJSON_rewind);
					if (intersection != null) {
						filter_on_map_feature = GeoJSON_format.readFeature(intersection);
						map_2.removeEventListener(draw_interaction);
						map_2.removeEventListener(draw_interaction_2);
						map_2.removeEventListener('singleclick');
						map_2.removeEventListener('pointermove');
						var id_rank_clue_2;
						if(app.list_of_rank_2_clue_id.length > 0){
							id_rank_clue_2 = (Math.max(...app.list_of_rank_2_clue_id)) + 1;
						} else {
							id_rank_clue_2 = 1;
						}
						var rank_2_clue_feature_id = add_rank_2_clue_to_map(filter_on_map_feature.getGeometry().clone(),'rgba(255, 0, 0,0.05)','rgba(255, 0, 0,1)',id_rank_clue_2);

						var clue = new rank_2_clue(id_rank_clue_2, [rank_2_clue_feature_id], "dessin", "Zone dessinée manuellement",true,2,true,false);
						app.list_of_rank_2_clue.push(clue);
						app.list_of_rank_2_clue_id.push(id_rank_clue_2);
						var id_group_rank_1_to_rank_2;
						if(app.list_group_rank_1_to_rank_2_id.length > 0){
							id_group_rank_1_to_rank_2 = (Math.max(...app.list_group_rank_1_to_rank_2_id)) + 1;
						} else {
							id_group_rank_1_to_rank_2 = 1;
						}
						var rank_1_to_rank_2 = new group_rank_1_to_rank_2(id_group_rank_1_to_rank_2, null, id_rank_clue_2, "dessin","none");
						app.list_group_rank_1_to_rank_2.push(rank_1_to_rank_2);
						app.list_group_rank_1_to_rank_2_id.push(id_group_rank_1_to_rank_2);
						filter_on_map_feature = null;
						if(app.list_of_rank_3_clue.length > 0){
							for(var j=0; j< app.list_of_rank_3_clue.length; j++){
								app.list_of_rank_3_clue[j].list_id_clue_rank_2.push({'id_clue_rank_2': id_rank_clue_2, 'selected': false});
//								add_rank_3_clue_to_map(app.list_of_rank_3_clue[j]);
								create_rank_3_clue_raster(app.list_of_rank_3_clue[j]);
							}
						}
						redraw_clue_window();
		            }
					draw_source.clear();
				}
			});
		  break;
	  case 3:
		  draw_interaction_2 = map_3.on('singleclick', function(evt) {
				if (phase == 1){
					draw_source.clear();
					map_3.removeEventListener(draw_interaction);
					phase = 2;
					draw_radius = Math.sqrt((start_point[0]-end_point[0])*(start_point[0]-end_point[0])+(start_point[1]-end_point[1])*(start_point[1]-end_point[1]));
					intermed_polygon = new ol.Feature({
							geometry: new ol.geom.Polygon.fromCircle(new ol.geom.Circle(start_point, parseInt(draw_radius)),30),
				            name: 'Circle'});
					$("#popup_div_container_buffer_size").css("display","none");
				} else if (phase == 2){
					//create arc_circle, intersection of circle_feature and  intermed_polygon
					//draw_source.clear();
					map_3.removeEventListener(draw_interaction);
					phase = 3;
					var copyfeature = new ol.Feature({
						geometry: new ol.geom.Polygon.fromExtent(global_coord),
			            name: 'Circle'});
					var intermed_polygon_GeoJSON = GeoJSON_format.writeFeatureObject(intermed_polygon.clone());
					var intermed_polygon_2_GeoJSON = turf.polygon([coord_polygon]);
					var intermed_polygon_2_GeoJSON_rewind = turf.rewind(intermed_polygon_2_GeoJSON);
					var intersection = turf.intersect(intermed_polygon_GeoJSON,intermed_polygon_2_GeoJSON_rewind);
					if (intersection != null) {
						filter_on_map_feature = GeoJSON_format.readFeature(intersection);
						map_3.removeEventListener(draw_interaction);
						map_3.removeEventListener(draw_interaction_2);
						map_3.removeEventListener('singleclick');
						map_3.removeEventListener('pointermove');
						var id_rank_clue_2;
						if(app.list_of_rank_2_clue_id.length > 0){
							id_rank_clue_2 = (Math.max(...app.list_of_rank_2_clue_id)) + 1;
						} else {
							id_rank_clue_2 = 1;
						}
						var rank_2_clue_feature_id = add_rank_2_clue_to_map(filter_on_map_feature.getGeometry().clone(),'rgba(255, 0, 0,0.05)','rgba(255, 0, 0,1)',id_rank_clue_2);

						var clue = new rank_2_clue(id_rank_clue_2, [rank_2_clue_feature_id], "dessin", "Zone dessinée manuellement",true,2,true,false);
						app.list_of_rank_2_clue.push(clue);
						app.list_of_rank_2_clue_id.push(id_rank_clue_2);
						var id_group_rank_1_to_rank_2;
						if(app.list_group_rank_1_to_rank_2_id.length > 0){
							id_group_rank_1_to_rank_2 = (Math.max(...app.list_group_rank_1_to_rank_2_id)) + 1;
						} else {
							id_group_rank_1_to_rank_2 = 1;
						}
						var rank_1_to_rank_2 = new group_rank_1_to_rank_2(id_group_rank_1_to_rank_2, null, id_rank_clue_2, "dessin","none");
						app.list_group_rank_1_to_rank_2.push(rank_1_to_rank_2);
						app.list_group_rank_1_to_rank_2_id.push(id_group_rank_1_to_rank_2);
						filter_on_map_feature = null;
						if(app.list_of_rank_3_clue.length > 0){
							for(var j=0; j< app.list_of_rank_3_clue.length; j++){
								app.list_of_rank_3_clue[j].list_id_clue_rank_2.push({'id_clue_rank_2': id_rank_clue_2, 'selected': false});
//								add_rank_3_clue_to_map(app.list_of_rank_3_clue[j]);
								create_rank_3_clue_raster(app.list_of_rank_3_clue[j]);
							}
						}
						redraw_clue_window();
		            }
					draw_source.clear();
				}
			});
		  break;
	  case 4:
		  draw_interaction_2 = map_4.on('singleclick', function(evt) {
				if (phase == 1){
					draw_source.clear();
					map_4.removeEventListener(draw_interaction);
					phase = 2;
					draw_radius = Math.sqrt((start_point[0]-end_point[0])*(start_point[0]-end_point[0])+(start_point[1]-end_point[1])*(start_point[1]-end_point[1]));
					intermed_polygon = new ol.Feature({
							geometry: new ol.geom.Polygon.fromCircle(new ol.geom.Circle(start_point, parseInt(draw_radius)),30),
				            name: 'Circle'});
					$("#popup_div_container_buffer_size").css("display","none");
				} else if (phase == 2){
					//create arc_circle, intersection of circle_feature and  intermed_polygon
					//draw_source.clear();
					map_4.removeEventListener(draw_interaction);
					phase = 3;
					var copyfeature = new ol.Feature({
						geometry: new ol.geom.Polygon.fromExtent(global_coord),
			            name: 'Circle'});
					var intermed_polygon_GeoJSON = GeoJSON_format.writeFeatureObject(intermed_polygon.clone());
					var intermed_polygon_2_GeoJSON = turf.polygon([coord_polygon]);
					var intermed_polygon_2_GeoJSON_rewind = turf.rewind(intermed_polygon_2_GeoJSON);
					var intersection = turf.intersect(intermed_polygon_GeoJSON,intermed_polygon_2_GeoJSON_rewind);
					if (intersection != null) {
						filter_on_map_feature = GeoJSON_format.readFeature(intersection);
						map_4.removeEventListener(draw_interaction);
						map_4.removeEventListener(draw_interaction_2);
						map_4.removeEventListener('singleclick');
						map_4.removeEventListener('pointermove');
						var id_rank_clue_2;
						if(app.list_of_rank_2_clue_id.length > 0){
							id_rank_clue_2 = (Math.max(...app.list_of_rank_2_clue_id)) + 1;
						} else {
							id_rank_clue_2 = 1;
						}
						var rank_2_clue_feature_id = add_rank_2_clue_to_map(filter_on_map_feature.getGeometry().clone(),'rgba(255, 0, 0,0.05)','rgba(255, 0, 0,1)',id_rank_clue_2);

						var clue = new rank_2_clue(id_rank_clue_2, [rank_2_clue_feature_id], "dessin", "Zone dessinée manuellement",true,2,true,false);
						app.list_of_rank_2_clue.push(clue);
						app.list_of_rank_2_clue_id.push(id_rank_clue_2);
						var id_group_rank_1_to_rank_2;
						if(app.list_group_rank_1_to_rank_2_id.length > 0){
							id_group_rank_1_to_rank_2 = (Math.max(...app.list_group_rank_1_to_rank_2_id)) + 1;
						} else {
							id_group_rank_1_to_rank_2 = 1;
						}
						var rank_1_to_rank_2 = new group_rank_1_to_rank_2(id_group_rank_1_to_rank_2, null, id_rank_clue_2, "dessin","none");
						app.list_group_rank_1_to_rank_2.push(rank_1_to_rank_2);
						app.list_group_rank_1_to_rank_2_id.push(id_group_rank_1_to_rank_2);
						filter_on_map_feature = null;
						if(app.list_of_rank_3_clue.length > 0){
							for(var j=0; j< app.list_of_rank_3_clue.length; j++){
								app.list_of_rank_3_clue[j].list_id_clue_rank_2.push({'id_clue_rank_2': id_rank_clue_2, 'selected': false});
//								add_rank_3_clue_to_map(app.list_of_rank_3_clue[j]);
								create_rank_3_clue_raster(app.list_of_rank_3_clue[j]);
							}
						}
						redraw_clue_window();
		            }
					draw_source.clear();
				}
			});
		  break;
	  default:
		  break;
	}

}

/*
 * create_buffer_from_map
 *
 * add rank 2 object by create a buffer area from map
 * if the buffer is created from an object which is not registered as an element of rank 1, this object is added as an rank 1 element object
 * right_click_element: clic event
 */
function create_buffer_from_map(right_click_element){
	//TODO small multiple

	var y_popup;
	var x_popup;

	//récupération de la feature cliquée
	var list_feature = [];
	if(window.navigator.appCodeName == "Mozilla"){
		var id_current_map = right_click_element.target.parentElement.parentElement.id;
		if(id_current_map == '1_map_1' || id_current_map == '2_map_1' || id_current_map == '3_map_1' || id_current_map == '4_map_1'){
			map_1.forEachFeatureAtPixel([right_click_element.layerX,right_click_element.layerY], function (feature, layer) {
				if(feature.get('id') == undefined){
					//feature en overlay
					list_feature.push(feature);
				} else if(feature.get('id').split('_')[0] == "element" && feature.get('id').split('_')[1] == "of" && feature.get('id').split('_')[2] == "reference"){
					//feature déjà enregistré comme rank_1
					list_feature.push(feature);
				}
		    });
			y_popup = parseInt(right_click_element.layerY);
		    x_popup = parseInt(right_click_element.layerX);
		} else if(id_current_map == '2_map_2' || id_current_map == '3_map_2' || id_current_map == '4_map_2'){
			map_2.forEachFeatureAtPixel([right_click_element.layerX,right_click_element.layerY], function (feature, layer) {
				if(feature.get('id') == undefined){
					//feature en overlay
					list_feature.push(feature);
				} else if(feature.get('id').split('_')[0] == "element" && feature.get('id').split('_')[1] == "of" && feature.get('id').split('_')[2] == "reference"){
					//feature déjà enregistré comme rank_1
					list_feature.push(feature);
				}
		    });
			switch (app.map_collection.length) {
		    	case 2:
		    		y_popup = parseInt(right_click_element.layerY);
		    		x_popup = parseInt(right_click_element.layerX) + parseInt($("#2_map_2")[0].offsetLeft);
		    		break;
		    	case 3:
		    		y_popup = parseInt(right_click_element.layerY) + parseInt($("#3_map_2")[0].offsetTop);
		    		x_popup = parseInt(right_click_element.layerX) + parseInt($("#3_map_2")[0].offsetLeft);
		    		break;
		    	case 4:
		    		y_popup = parseInt(right_click_element.layerY);
		    		x_popup = parseInt(right_click_element.layerX) + parseInt($("#4_map_2")[0].offsetLeft);
		    		break;
		    	default:
		    		break;
		    }
		} else if(id_current_map == '3_map_3' || id_current_map == '4_map_3'){
			map_3.forEachFeatureAtPixel([right_click_element.layerX,right_click_element.layerY], function (feature, layer) {
				if(feature.get('id') == undefined){
					//feature en overlay
					list_feature.push(feature);
				} else if(feature.get('id').split('_')[0] == "element" && feature.get('id').split('_')[1] == "of" && feature.get('id').split('_')[2] == "reference"){
					//feature déjà enregistré comme rank_1
					list_feature.push(feature);
				}
		    });
			switch (app.map_collection.length) {
		    	case 3:
		    		x_popup = parseInt(right_click_element.layerX) + parseInt($("#3_map_3")[0].offsetLeft);
		    		y_popup = parseInt(right_click_element.layerY) + parseInt($("#3_map_3")[0].offsetTop);
		    		break;
		    	case 4:
		    		x_popup = parseInt(right_click_element.layerX);
		    		y_popup = parseInt(right_click_element.layerY) + parseInt($("#4_map_3")[0].offsetTop);
		    		break;
		    	default:
		    		break;
		    }
		} else if(id_current_map == '4_map_4'){
			map_4.forEachFeatureAtPixel([right_click_element.layerX,right_click_element.layerY], function (feature, layer) {
				if(feature.get('id') == undefined){
					//feature en overlay
					list_feature.push(feature);
				} else if(feature.get('id').split('_')[0] == "element" && feature.get('id').split('_')[1] == "of" && feature.get('id').split('_')[2] == "reference"){
					//feature déjà enregistré comme rank_1
					list_feature.push(feature);
				}
		    });
			y_popup = parseInt(right_click_element.layerY);
		    x_popup = parseInt(right_click_element.layerX);

//			y_popup = parseInt(right_click_element.layerY) + parseInt($("#4_map_4")[0].offsetLeft);
//		    x_popup = parseInt(right_click_element.layerX) + parseInt($("#4_map_3")[0].offsetTop);
		}
	} else {
		for(var f= 0; f < right_click_element.path.length; f++){
			if(right_click_element.path[f].id == '1_map_1' || right_click_element.path[f].id == '2_map_1' || right_click_element.path[f].id == '3_map_1' || right_click_element.path[f].id == '4_map_1'){
				map_1.forEachFeatureAtPixel([right_click_element.offsetX,right_click_element.offsetY], function (feature, layer) {
					if(feature.get('id') == undefined){
						//feature en overlay
						list_feature.push(feature);
					} else if(feature.get('id').split('_')[0] == "element" && feature.get('id').split('_')[1] == "of" && feature.get('id').split('_')[2] == "reference"){
						//feature déjà enregistré comme rank_1
						list_feature.push(feature);
					}
			    });
				y_popup = parseInt(right_click_element.offsetY);
			    x_popup = parseInt(right_click_element.offsetX);
				break;
			} else if(right_click_element.path[f].id == '2_map_2' || right_click_element.path[f].id == '3_map_2' || right_click_element.path[f].id == '4_map_2'){
				map_2.forEachFeatureAtPixel([right_click_element.offsetX,right_click_element.offsetY], function (feature, layer) {
					if(feature.get('id') == undefined){
						//feature en overlay
						list_feature.push(feature);
					} else if(feature.get('id').split('_')[0] == "element" && feature.get('id').split('_')[1] == "of" && feature.get('id').split('_')[2] == "reference"){
						//feature déjà enregistré comme rank_1
						list_feature.push(feature);
					}
			    });
				switch (app.map_collection.length) {
			    	case 2:
			    		y_popup = parseInt(right_click_element.offsetY);
			    		x_popup = parseInt(right_click_element.offsetX) + parseInt($("#2_map_2")[0].offsetLeft);
			    		break;
			    	case 3:
			    		y_popup = parseInt(right_click_element.offsetY) + parseInt($("#3_map_2")[0].offsetTop);
			    		x_popup = parseInt(right_click_element.offsetX) + parseInt($("#3_map_2")[0].offsetLeft);
			    		break;
			    	case 4:
			    		y_popup = parseInt(right_click_element.offsetY);
			    		x_popup = parseInt(right_click_element.offsetX) + parseInt($("#4_map_2")[0].offsetLeft);
			    		break;
			    	default:
			    		break;
			    }
				break;
			} else if(right_click_element.path[f].id == '3_map_3' || right_click_element.path[f].id == '4_map_3'){
				map_3.forEachFeatureAtPixel([right_click_element.offsetX,right_click_element.offsetY], function (feature, layer) {
					if(feature.get('id') == undefined){
						//feature en overlay
						list_feature.push(feature);
					} else if(feature.get('id').split('_')[0] == "element" && feature.get('id').split('_')[1] == "of" && feature.get('id').split('_')[2] == "reference"){
						//feature déjà enregistré comme rank_1
						list_feature.push(feature);
					}
			    });
				switch (app.map_collection.length) {
			    	case 3:
			    		x_popup = parseInt(right_click_element.offsetX) + parseInt($("#3_map_3")[0].offsetLeft);
			    		y_popup = parseInt(right_click_element.offsetY) + parseInt($("#3_map_3")[0].offsetTop);
			    		break;
			    	case 4:
			    		x_popup = parseInt(right_click_element.offsetX);
			    		y_popup = parseInt(right_click_element.offsetY) + parseInt($("#4_map_3")[0].offsetTop);
			    		break;
			    	default:
			    		break;
			    }
				break;
			} else if(right_click_element.path[f].id == '4_map_4'){
				map_4.forEachFeatureAtPixel([right_click_element.offsetX,right_click_element.offsetY], function (feature, layer) {
					if(feature.get('id') == undefined){
						//feature en overlay
						list_feature.push(feature);
					} else if(feature.get('id').split('_')[0] == "element" && feature.get('id').split('_')[1] == "of" && feature.get('id').split('_')[2] == "reference"){
						//feature déjà enregistré comme rank_1
						list_feature.push(feature);
					}
			    });
				y_popup = parseInt(right_click_element.offsetY) + parseInt($("#4_map_4")[0].offsetLeft);
			    x_popup = parseInt(right_click_element.offsetX) + parseInt($("#4_map_3")[0].offsetTop);
				break;
			}
		}
	}





	var item_feature = list_feature[0];

	//affichage du slider pour saisir les paramètres du buffer
	//TODO prise en compte des 2 valeurs saisies pour le calcul du buffer
	$('#rank_2_buffer_parameters').css("display","block");
	$('#rank_2_buffer_parameters').css("top",y_popup + 'px');
	$('#rank_2_buffer_parameters').css("left",x_popup + 'px');

	 $( "#rank_2_buffer_parameters_input_1" ).val(0);
     $( "#rank_2_buffer_parameters_input_2" ).val(2);

     var buffer_stroke_color;
 	var buffer_fill_color;


 	switch (item_feature.getGeometry().getType()) {
 	  case 'Point':
// 		  var base_color = hexToRgb(item_feature.getStyle().getImage().getStroke().getColor());
// 		  buffer_stroke_color = "rgba(" + base_color.r + "," + base_color.g + "," + base_color.b + ",1)";
// 		  buffer_fill_color = "rgba(" + base_color.r + "," + base_color.g + "," + base_color.b + ",0.05)";
 		 var base_color = item_feature.getStyle().clone().getImage().getStroke().getColor();
 		  var pre_r = base_color.split(',')[0];
 		 var b_r = pre_r.split('(')[1];
 		var b_g = base_color.split(',')[1];
 		var b_b = base_color.split(',')[2];
 		buffer_stroke_color = "rgba(" + b_r + "," + b_g + "," + b_b + ",1)";
 		buffer_fill_color = "rgba(" + b_r + "," + b_g + "," + b_b + ",0.05)";
 	    break;
 	  case 'LineString':
// 		  var base_color = hexToRgb(item_feature.getStyle().getStroke().getColor());
// 		  buffer_stroke_color = "rgba(" + base_color.r + "," + base_color.g + "," + base_color.b + ",1)";
// 		  buffer_fill_color = "rgba(" + base_color.r + "," + base_color.g + "," + base_color.b + ",0.05)";
 		 var base_color = item_feature.getStyle().getStroke().getColor();
 		var pre_r = base_color.split(',')[0];
		 var b_r = pre_r.split('(')[1];
		var b_g = base_color.split(',')[1];
		var b_b = base_color.split(',')[2];
		buffer_stroke_color = "rgba(" + b_r + "," + b_g + "," + b_b + ",1)";
		buffer_fill_color = "rgba(" + b_r + "," + b_g + "," + b_b + ",0.05)";
 		    break;
 	  case 'Polygon':
// 		  var base_color = hexToRgb(item_feature.getStyle().getStroke().getColor());
// 		  buffer_stroke_color = "rgba(" + base_color.r + "," + base_color.g + "," + base_color.b + ",1)";
// 		  buffer_fill_color = "rgba(" + base_color.r + "," + base_color.g + "," + base_color.b + ",0.05)";
 		 var base_color = item_feature.getStyle().getStroke().getColor();
  		var pre_r = base_color.split(',')[0];
 		 var b_r = pre_r.split('(')[1];
 		var b_g = base_color.split(',')[1];
 		var b_b = base_color.split(',')[2];
 		buffer_stroke_color = "rgba(" + b_r + "," + b_g + "," + b_b + ",1)";
 		buffer_fill_color = "rgba(" + b_r + "," + b_g + "," + b_b + ",0.05)";
 		    break;
 	  case 'MultiPolygon':
// 		  var base_color = hexToRgb(item_feature.getStyle().getStroke().getColor());
// 		  buffer_stroke_color = "rgba(" + base_color.r + "," + base_color.g + "," + base_color.b + ",1)";
// 		  buffer_fill_color = "rgba(" + base_color.r + "," + base_color.g + "," + base_color.b + ",0.05)";
 		 var base_color = item_feature.getStyle().getStroke().getColor();
  		var pre_r = base_color.split(',')[0];
 		 var b_r = pre_r.split('(')[1];
 		var b_g = base_color.split(',')[1];
 		var b_b = base_color.split(',')[2];
 		buffer_stroke_color = "rgba(" + b_r + "," + b_g + "," + b_b + ",1)";
 		buffer_fill_color = "rgba(" + b_r + "," + b_g + "," + b_b + ",0.05)";
 		    break;
 	  default:
// 		  var base_color = hexToRgb(item_feature.getStyle().getImage().getStroke().getColor());
// 		  buffer_stroke_color = "rgba(" + base_color.r + "," + base_color.g + "," + base_color.b + ",1)";
// 		  buffer_fill_color = "rgba(" + base_color.r + "," + base_color.g + "," + base_color.b + ",0.05)";
 		 var base_color = item_feature.getStyle().getStroke().getColor();
		var pre_r = base_color.split(',')[0];
		 var b_r = pre_r.split('(')[1];
		var b_g = base_color.split(',')[1];
		var b_b = base_color.split(',')[2];
		buffer_stroke_color = "rgba(" + b_r + "," + b_g + "," + b_b + ",1)";
		buffer_fill_color = "rgba(" + b_r + "," + b_g + "," + b_b + ",0.05)";
 	}

 	add_draw_buffer_to_map(item_feature, parseFloat($( "#rank_2_buffer_parameters_input_1" ).val()), parseFloat($( "#rank_2_buffer_parameters_input_2" ).val()), {units: "kilometres"},'draw_buffer_feature',buffer_fill_color,buffer_stroke_color);

	//construction du slider
	$( "#rank_2_buffer_parameters_sliders" ).slider({
	      range: true,
	      min: 0,
	      max: 10,
	      step: 0.05,
	      values: [ 0, 2 ],
	      slide: function( event, ui ) {
	        $( "#rank_2_buffer_parameters_input_1" ).val(ui.values[ 0 ]);
	        $( "#rank_2_buffer_parameters_input_2" ).val(ui.values[ 1 ]);

	        add_draw_buffer_to_map(item_feature, parseFloat(ui.values[ 0 ]), parseFloat(ui.values[ 1 ]), {units: "kilometres"},'draw_buffer_feature',buffer_fill_color,buffer_stroke_color);

	      }
	    });


      $( "#rank_2_buffer_parameters_input_1" ).on("keydown",function(e){
    	  if(13==e.keyCode){
    		  $("#rank_2_buffer_parameters_sliders").slider('values', [$(this).val(),$( "#rank_2_buffer_parameters_input_2" ).val()]);

    		  add_draw_buffer_to_map(item_feature, parseFloat($(this).val()), parseFloat($( "#rank_2_buffer_parameters_input_2" ).val()), {units: "kilometres"},'draw_buffer_feature',buffer_fill_color,buffer_stroke_color);

    	  }
      });

      $( "#rank_2_buffer_parameters_input_2" ).on("keydown",function(e){
    	  if(13==e.keyCode){
    		  $("#rank_2_buffer_parameters_sliders").slider('values', [$( "#rank_2_buffer_parameters_input_1" ).val(),$(this).val()]);

    		  add_draw_buffer_to_map(item_feature, parseFloat($( "#rank_2_buffer_parameters_input_1" ).val()), parseFloat($(this).val()), {units: "kilometres"},'draw_buffer_feature',buffer_fill_color,buffer_stroke_color);

    	  }
      });


      //fonction d'ajout du buffer
      launch_add_buffer.fct = function() {

    	  draw_source.clear();

		var clue_1;
		var clue_1_id;
		var group_1;
		var group_1_id;

		if(item_feature.get('id') == undefined){
			//la feature n'est pas enregistré en tant qu'élément de rang 1
			//add rank_1_element
			if(app.list_of_rank_1_clue_id.length == 0){
				clue_1_id = 1;
			} else {
				clue_1_id = (Math.max(...app.list_of_rank_1_clue_id) + 1);
			}
			var point_id = add_element_of_reference(clue_1_id,item_feature.clone());


			switch (item_feature.getProperties().itemType) {
			  case 'CITY':
				  clue_1 = new rank_1_clue(clue_1_id, "Grande ville", [point_id],item_feature.getProperties().name,item_feature.getProperties(),true);
				  break;
			  case 'TOWN':
				  clue_1 = new rank_1_clue(clue_1_id, "Ville", [point_id],item_feature.getProperties().name,item_feature.getProperties(),true);
				  break;
			  case 'VILLAGE':
				  clue_1 = new rank_1_clue(clue_1_id, "Village", [point_id],item_feature.getProperties().name,item_feature.getProperties(),true);
				  break;
			  case 'PEAK':
				  clue_1 = new rank_1_clue(clue_1_id, "Sommet", [point_id],item_feature.getProperties().name,item_feature.getProperties(),true);
				  break;
			  case 'COL':
				  clue_1 = new rank_1_clue(clue_1_id, "Col", [point_id],item_feature.getProperties().name,item_feature.getProperties(),true);
				  break;
			  case 'LAKE':
				  clue_1 = new rank_1_clue(clue_1_id, "Lac", [point_id],item_feature.getProperties().name,item_feature.getProperties(),true);
				  break;
			  case 'RESERVOIR':
				  clue_1 = new rank_1_clue(clue_1_id, "Réservoir", [point_id],item_feature.getProperties().name,item_feature.getProperties(),true);
				  break;
			  case 'WATEROTHER':
				  clue_1 = new rank_1_clue(clue_1_id, "Autre", [point_id],item_feature.getProperties().name,item_feature.getProperties(),true);
				  break;
			  case 'RIVER':
				  clue_1 = new rank_1_clue(clue_1_id, "Rivière", [point_id],item_feature.getProperties().name,item_feature.getProperties(),true);
				  break;
			  case 'STREAM':
				  clue_1 = new rank_1_clue(clue_1_id, "Ruisseau", [point_id],item_feature.getProperties().name,item_feature.getProperties(),true);
				  break;
			  case 'POWER6':
				  clue_1 = new rank_1_clue(clue_1_id, "LHT 6 brins", [point_id],item_feature.getProperties().name,item_feature.getProperties(),true);
				  break;
			  case 'POWER3':
				  clue_1 = new rank_1_clue(clue_1_id, "LHT 3 brins", [point_id],item_feature.getProperties().name,item_feature.getProperties(),true);
				  break;
			  case 'POWERO':
				  clue_1 = new rank_1_clue(clue_1_id, "Equipement éléctrique", [point_id],item_feature.getProperties().name,item_feature.getProperties(),true);
				  break;
			  case 'MAST':
				  clue_1 = new rank_1_clue(clue_1_id, "Tour téléphonie", [point_id],item_feature.getProperties().name,item_feature.getProperties(),true);
				  break;
			  case 'SKILIFT':
				  clue_1 = new rank_1_clue(clue_1_id, "Remontée mécanique", [point_id],item_feature.getProperties().name,item_feature.getProperties(),true);
				  break;
			  case 'PISTEGREEN':
				  clue_1 = new rank_1_clue(clue_1_id, "Piste verte", [point_id],item_feature.getProperties().name,item_feature.getProperties(),true);
				  break;
			  case 'PISTEBLUE':
				  clue_1 = new rank_1_clue(clue_1_id, "Piste bleue", [point_id],item_feature.getProperties().name,item_feature.getProperties(),true);
				  break;
			  case 'PISTERED':
				  clue_1 = new rank_1_clue(clue_1_id, "Piste rouge", [point_id],item_feature.getProperties().name,item_feature.getProperties(),true);
				  break;
			  case 'PISTEBLACK':
				  clue_1 = new rank_1_clue(clue_1_id, "Piste noire", [point_id],item_feature.getProperties().name,item_feature.getProperties(),true);
				  break;
			  case 'PATHWAY':
				  clue_1 = new rank_1_clue(clue_1_id, "Sentier de randonnée", [point_id],item_feature.getProperties().name,item_feature.getProperties(),true);
				  break;
			  case 'ROAD':
				  clue_1 = new rank_1_clue(clue_1_id, "Route", [point_id],item_feature.getProperties().name,item_feature.getProperties(),true);
				  break;
			  default:
				  clue_1 = new rank_1_clue(clue_1_id, "Objet d'intérêt", [point_id],item_feature.getProperties().name,item_feature.getProperties(),true);
			  break;
			}

			app.list_of_rank_1_clue.push(clue_1)
			app.list_of_rank_1_clue_id.push(clue_1_id);


			if(app.list_group_of_rank_1_clue_id.length == 0){
				group_1_id = 1;
			} else {
				group_1_id = (Math.max(...app.list_group_of_rank_1_clue_id) + 1);
			}

			group_1 = new group_of_rank_1_clue(group_1_id, "Objet d'intérêt", "",[clue_1_id]);
			app.list_group_of_rank_1_clue.push(group_1);
			app.list_group_of_rank_1_clue_id.push(group_1_id);
		} else {
			//la feature est déjà rajoutée en tant qu'élément de rang 1
			clue_1_id = item_feature.get('id_clue');
			for(var o=0; o<app.list_group_of_rank_1_clue.length;o++){
				if(app.list_group_of_rank_1_clue[o].list_of_clue_id.indexOf(clue_1_id) > -1){
					group_1_id = app.list_group_of_rank_1_clue[o].id_group;
					break;
				}
			}
		}

		var GeoJSON_format = new ol.format.GeoJSON();
		var tmp = item_feature.clone();
		tmp.getGeometry().transform("EPSG:3857", "EPSG:4326");
		var object_geojson = GeoJSON_format.writeFeatureObject(tmp);

		map_element_worker.postMessage({'cmd': 'create_buffer', 'arg': {
			'object_geojson': object_geojson,
			'value_1': parseFloat($( "#rank_2_buffer_parameters_input_1" ).val()),
  			'value_2': parseFloat($( "#rank_2_buffer_parameters_input_2" ).val()),
  			'unit': {units: "kilometres"}
		}});

		map_element_worker.onmessage = function(e) {
			  var bufferedFeature = GeoJSON_format.readFeature(e.data);
				bufferedFeature.getGeometry().transform("EPSG:4326", "EPSG:3857");

				var id_rank_clue_2;

				if(app.list_of_rank_2_clue_id.length > 0){
					id_rank_clue_2 = (Math.max(...app.list_of_rank_2_clue_id)) + 1;
				} else {
					id_rank_clue_2 = 1;
				}

				var id_feature_rank_2 = add_rank_2_clue_to_map(bufferedFeature.getGeometry(),buffer_fill_color,buffer_stroke_color,id_rank_clue_2)


				//ajout de l'indice de rang 2
				var clue_2 = new rank_2_clue(id_rank_clue_2, [id_feature_rank_2], "Buffer", $( "#rank_2_buffer_parameters_input_2" ).val() + " km",true,2,true,false);
				app.list_of_rank_2_clue.push(clue_2);
				app.list_of_rank_2_clue_id.push(id_rank_clue_2);

				var id_group_rank_1_to_rank_2;
				if(app.list_group_rank_1_to_rank_2_id.length > 0){
					id_group_rank_1_to_rank_2 = (Math.max(...app.list_group_rank_1_to_rank_2_id)) + 1;
				} else {
					id_group_rank_1_to_rank_2 = 1;
				}

				var rank_1_to_rank_2 = new group_rank_1_to_rank_2(id_group_rank_1_to_rank_2, group_1_id, id_rank_clue_2, "Buffer",$( "#rank_2_buffer_parameters_input_2" ).val() + " km");

				app.list_group_rank_1_to_rank_2.push(rank_1_to_rank_2);
				app.list_group_rank_1_to_rank_2_id.push(id_group_rank_1_to_rank_2);

				if(app.list_of_rank_3_clue.length > 0){
					for(var j=0; j< app.list_of_rank_3_clue.length; j++){
						app.list_of_rank_3_clue[j].list_id_clue_rank_2.push({'id_clue_rank_2': id_rank_clue_2, 'selected': false});
//						add_rank_3_clue_to_map(app.list_of_rank_3_clue[j]);
						create_rank_3_clue_raster(app.list_of_rank_3_clue[j]);
					}
				}

				redraw_clue_window();
		}

		$('#rank_2_buffer_parameters').css("display","none");
	};

}

function create_ZRI(right_click_element){
	var clicked_map;
	if(window.navigator.appCodeName == "Mozilla"){
		var id_current_map = right_click_element.target.parentElement.parentElement.id;
		if(id_current_map == '1_map_1' || id_current_map == '2_map_1' || id_current_map == '3_map_1' || id_current_map == '4_map_1'){
			clicked_map = 1;
		} else if(id_current_map == '2_map_2' || id_current_map == '3_map_2' || id_current_map == '4_map_2'){
			clicked_map = 2;
		} else if(id_current_map == '3_map_3' || id_current_map == '4_map_3'){
			clicked_map = 3;
		} else if(id_current_map == '4_map_4'){
			clicked_map = 4;
		}
	} else {
		for(var f= 0; f < right_click_element.path.length; f++){
			if(right_click_element.path[f].id == '1_map_1' || right_click_element.path[f].id == '2_map_1' || right_click_element.path[f].id == '3_map_1' || right_click_element.path[f].id == '4_map_1'){
				clicked_map = 1;
				break;
			} else if(right_click_element.path[f].id == '2_map_2' || right_click_element.path[f].id == '3_map_2' || right_click_element.path[f].id == '4_map_2'){
				clicked_map = 2;
				break;
			} else if(right_click_element.path[f].id == '3_map_3' || right_click_element.path[f].id == '4_map_3'){
				clicked_map = 3;
				break;
			} else if(right_click_element.path[f].id == '4_map_4'){
				clicked_map = 4;
				break;
			}
		}
	}

	switch (clicked_map) {
	  case 1:
		  map_1.removeEventListener(draw_interaction);
		  break;
	  case 2:
		  map_2.removeEventListener(draw_interaction);
		  break;
	  case 3:
		  map_3.removeEventListener(draw_interaction);
		  break;
	  case 4:
		  map_4.removeEventListener(draw_interaction);
		  break;
	  default:
		  break;
	}

	var phase = 1;

	var start_point;
	var end_point;
	var draw_radius;
	var box_feature;


	switch (clicked_map) {
	  case 1:
		draw_interaction_2 = map_1.on('singleclick', function(evt_clic) {
			start_point = evt_clic.coordinate;
			if(phase == 1){
				draw_interaction = map_1.on('pointermove', function(evt) {
					end_point = evt.coordinate;
					draw_source.clear();
					var coord_polygon = [start_point,[start_point[0],end_point[1]],end_point,[end_point[0],start_point[1]]];
					box_feature= new ol.Feature({
						geometry: new ol.geom.Polygon([coord_polygon]),
			            name: 'Line'
			        })
					draw_source.addFeature(box_feature);
					phase = 2;
				});
			} else if(phase == 2){
				draw_source.clear();
				map_1.removeEventListener(draw_interaction);
				phase = 2;
				map_1.removeEventListener(draw_interaction_2);
				map_1.removeEventListener('singleclick');
				map_1.removeEventListener('pointermove');
				reset_ZRI_extent(box_feature.getGeometry().getExtent());
				reset_ZRI(ZRI_extent);
				loadMapItemsFromZRI("#tree",ZRI_extent)
			}
		});
		  break;
	  case 2:
		  draw_interaction_2 = map_1.on('singleclick', function(evt_clic) {
				start_point = evt_clic.coordinate;
				if(phase == 1){
					draw_interaction = map_1.on('pointermove', function(evt) {
						end_point = evt.coordinate;
						draw_source.clear();
						var coord_polygon = [start_point,[start_point[0],end_point[1]],end_point,[end_point[0],start_point[1]]];
						box_feature= new ol.Feature({
							geometry: new ol.geom.Polygon([coord_polygon]),
				            name: 'Line'
				        })
						draw_source.addFeature(box_feature);
						phase = 2;
					});
				} else if(phase == 2){
					draw_source.clear();
					map_1.removeEventListener(draw_interaction);
					phase = 2;
					map_1.removeEventListener(draw_interaction_2);
					map_1.removeEventListener('singleclick');
					map_1.removeEventListener('pointermove');
					reset_ZRI_extent(box_feature.getGeometry().getExtent());
					reset_ZRI(ZRI_extent);
					loadMapItemsFromZRI("#tree",ZRI_extent)
				}
			});
		  break;
	  case 3:
		  draw_interaction_2 = map_1.on('singleclick', function(evt_clic) {
				start_point = evt_clic.coordinate;
				if(phase == 1){
					draw_interaction = map_1.on('pointermove', function(evt) {
						end_point = evt.coordinate;
						draw_source.clear();
						var coord_polygon = [start_point,[start_point[0],end_point[1]],end_point,[end_point[0],start_point[1]]];
						box_feature= new ol.Feature({
							geometry: new ol.geom.Polygon([coord_polygon]),
				            name: 'Line'
				        })
						draw_source.addFeature(box_feature);
						phase = 2;
					});
				} else if(phase == 2){
					draw_source.clear();
					map_1.removeEventListener(draw_interaction);
					phase = 2;
					map_1.removeEventListener(draw_interaction_2);
					map_1.removeEventListener('singleclick');
					map_1.removeEventListener('pointermove');
					reset_ZRI_extent(box_feature.getGeometry().getExtent());
					reset_ZRI(ZRI_extent);
					loadMapItemsFromZRI("#tree",ZRI_extent)
				}
			});
		  break;
	  case 4:
		  draw_interaction_2 = map_1.on('singleclick', function(evt_clic) {
				start_point = evt_clic.coordinate;
				if(phase == 1){
					draw_interaction = map_1.on('pointermove', function(evt) {
						end_point = evt.coordinate;
						draw_source.clear();
						var coord_polygon = [start_point,[start_point[0],end_point[1]],end_point,[end_point[0],start_point[1]]];
						box_feature= new ol.Feature({
							geometry: new ol.geom.Polygon([coord_polygon]),
				            name: 'Line'
				        })
						draw_source.addFeature(box_feature);
						phase = 2;
					});
				} else if(phase == 2){
					draw_source.clear();
					map_1.removeEventListener(draw_interaction);
					phase = 2;
					map_1.removeEventListener(draw_interaction_2);
					map_1.removeEventListener('singleclick');
					map_1.removeEventListener('pointermove');
					reset_ZRI_extent(box_feature.getGeometry().getExtent());
					reset_ZRI(ZRI_extent);
					loadMapItemsFromZRI("#tree",ZRI_extent)
				}
			});
		  break;
	  default:
		  break;
	}












}

/*
 * create_isochrone_from_map
 *
 * add rank 2 object by create a isochrone area from map
 * if the isochrone is created from an object which is not registered as an element of rank 1, this object is added as an rank 1 element object
 * right_click_element: clic event
 */
function create_isochrone_from_map(right_click_element){
//	TODO
	//TODO small multiple
}

/*
 * create_intervis_from_map
 *
 * add rank 2 object by create a intervisibility area from map
 * if the intervisibility is created from an object which is not registered as an element of rank 1, this object is added as an rank 1 element object
 * right_click_element: clic event
 */
function create_intervis_from_map(right_click_element){

	var clicked_map;
	if(window.navigator.appCodeName == "Mozilla"){
		var id_current_map = right_click_element.target.parentElement.parentElement.id;
		if(id_current_map == '1_map_1' || id_current_map == '2_map_1' || id_current_map == '3_map_1' || id_current_map == '4_map_1'){
			clicked_map = 1;
		} else if(id_current_map == '2_map_2' || id_current_map == '3_map_2' || id_current_map == '4_map_2'){
			clicked_map = 2;
		} else if(id_current_map == '3_map_3' || id_current_map == '4_map_3'){
			clicked_map = 3;
		} else if(id_current_map == '4_map_4'){
			clicked_map = 4;
		}
	} else {
		for(var f= 0; f < right_click_element.path.length; f++){
			if(right_click_element.path[f].id == '1_map_1' || right_click_element.path[f].id == '2_map_1' || right_click_element.path[f].id == '3_map_1' || right_click_element.path[f].id == '4_map_1'){
				clicked_map = 1;
				break;
			} else if(right_click_element.path[f].id == '2_map_2' || right_click_element.path[f].id == '3_map_2' || right_click_element.path[f].id == '4_map_2'){
				clicked_map = 2;
				break;
			} else if(right_click_element.path[f].id == '3_map_3' || right_click_element.path[f].id == '4_map_3'){
				clicked_map = 3;
				break;
			} else if(right_click_element.path[f].id == '4_map_4'){
				clicked_map = 4;
				break;
			}
		}
	}

	var start_point;
	switch (clicked_map) {
	  case 1:
		  if(window.navigator.appCodeName == "Mozilla"){
			  start_point = ol.proj.transform(map_1.getCoordinateFromPixel([right_click_element.layerX,right_click_element.layerY]), 'EPSG:3857', 'EPSG:4326');
		  } else {
			  start_point = ol.proj.transform(map_1.getCoordinateFromPixel([right_click_element.offsetX,right_click_element.offsetY]), 'EPSG:3857', 'EPSG:4326');
		  }
		  break;
	  case 2:
		  if(window.navigator.appCodeName == "Mozilla"){
			  start_point = ol.proj.transform(map_2.getCoordinateFromPixel([right_click_element.layerX,right_click_element.layerY]), 'EPSG:3857', 'EPSG:4326');
		  } else {
			  start_point = ol.proj.transform(map_2.getCoordinateFromPixel([right_click_element.offsetX,right_click_element.offsetY]), 'EPSG:3857', 'EPSG:4326');
		  }
		  break;
	  case 3:
		  if(window.navigator.appCodeName == "Mozilla"){
			  start_point = ol.proj.transform(map_3.getCoordinateFromPixel([right_click_element.layerX,right_click_element.layerY]), 'EPSG:3857', 'EPSG:4326');
		  } else {
			  start_point = ol.proj.transform(map_3.getCoordinateFromPixel([right_click_element.offsetX,right_click_element.offsetY]), 'EPSG:3857', 'EPSG:4326');
		  }
		  break;
	  case 4:
		  if(window.navigator.appCodeName == "Mozilla"){
			  start_point = ol.proj.transform(map_4.getCoordinateFromPixel([right_click_element.layerX,right_click_element.layerY]), 'EPSG:3857', 'EPSG:4326');
		  } else {
			  start_point = ol.proj.transform(map_4.getCoordinateFromPixel([right_click_element.offsetX,right_click_element.offsetY]), 'EPSG:3857', 'EPSG:4326');
		  }
		  break;
	  default:
		  break;
	}

	$("#h1-input-interviz_launcher").val(1.5);
	$("#h2-input-interviz_launcher").val(1);
	$("#mdist-input-interviz_launcher").val(6);

	$("#object-interviz_launcher").html("");
	$("#ref-interviz_launcher").html("");
	$("#type-interviz_launcher").html("");
	$("#id-interviz_launcher").html("");
	$("#stroke-interviz_launcher").html("");
	$("#coords-location-interviz_launcher").html("" + start_point[1] + "," + start_point[0] + "");
	$("#popup_div_interviz_launcher").css("display","block");
	$('#popup_div_interviz_launcher').css("top",right_click_element.clientY + 'px');
	$('#popup_div_interviz_launcher').css("left",right_click_element.clientX + 'px');


}

function create_intervis_from_map_object(right_click_element){


	var clicked_map;
	if(window.navigator.appCodeName == "Mozilla"){
		var id_current_map = right_click_element.target.parentElement.parentElement.id;
		if(id_current_map == '1_map_1' || id_current_map == '2_map_1' || id_current_map == '3_map_1' || id_current_map == '4_map_1'){
			clicked_map = 1;
		} else if(id_current_map == '2_map_2' || id_current_map == '3_map_2' || id_current_map == '4_map_2'){
			clicked_map = 2;
		} else if(id_current_map == '3_map_3' || id_current_map == '4_map_3'){
			clicked_map = 3;
		} else if(id_current_map == '4_map_4'){
			clicked_map = 4;
		}
	} else {
		for(var f= 0; f < right_click_element.path.length; f++){
			if(right_click_element.path[f].id == '1_map_1' || right_click_element.path[f].id == '2_map_1' || right_click_element.path[f].id == '3_map_1' || right_click_element.path[f].id == '4_map_1'){
				clicked_map = 1;
				break;
			} else if(right_click_element.path[f].id == '2_map_2' || right_click_element.path[f].id == '3_map_2' || right_click_element.path[f].id == '4_map_2'){
				clicked_map = 2;
				break;
			} else if(right_click_element.path[f].id == '3_map_3' || right_click_element.path[f].id == '4_map_3'){
				clicked_map = 3;
				break;
			} else if(right_click_element.path[f].id == '4_map_4'){
				clicked_map = 4;
				break;
			}
		}
	}

	var feature_clicked;
	var feature_rank_1_clicked = null;
	var start_point;
	switch (clicked_map) {
	case 1:
		if(window.navigator.appCodeName == "Mozilla"){
			  map_1.forEachFeatureAtPixel([right_click_element.layerX,right_click_element.layerY], function (feature, layer) {
				  if(layer.get('id') == 'id_rank_1_clue_layer'){
					  feature_rank_1_clicked = feature;
					}
				  if(layer.get('id') == 'element_hover_layer'){
			    		feature_clicked = feature;
			    	}
			    });
			  start_point = ol.proj.transform(map_1.getCoordinateFromPixel([right_click_element.layerX,right_click_element.layerY]), 'EPSG:3857', 'EPSG:4326');
		  } else {
			  map_1.forEachFeatureAtPixel([right_click_element.offsetX,right_click_element.offsetY], function (feature, layer) {
				  if(layer.get('id') == 'id_rank_1_clue_layer'){
					  feature_rank_1_clicked = feature;
					}
				  if(layer.get('id') == 'element_hover_layer'){
			    		feature_clicked = feature;
			    	}
			    });
			  start_point = ol.proj.transform(map_1.getCoordinateFromPixel([right_click_element.offsetX,right_click_element.offsetY]), 'EPSG:3857', 'EPSG:4326');
		  }
		  break;
	  case 2:
		  if(window.navigator.appCodeName == "Mozilla"){
			  map_2.forEachFeatureAtPixel([right_click_element.layerX,right_click_element.layerY], function (feature, layer) {
				  if(layer.get('id') == 'id_rank_1_clue_layer'){
					  feature_rank_1_clicked = feature;
					}
				  if(layer.get('id') == 'element_hover_layer'){
			    		feature_clicked = feature;
			    	}
			    });
			  start_point = ol.proj.transform(map_2.getCoordinateFromPixel([right_click_element.layerX,right_click_element.layerY]), 'EPSG:3857', 'EPSG:4326');
		  } else {
			  map_2.forEachFeatureAtPixel([right_click_element.offsetX,right_click_element.offsetY], function (feature, layer) {
				  if(layer.get('id') == 'id_rank_1_clue_layer'){
					  feature_rank_1_clicked = feature;
					}
				  if(layer.get('id') == 'element_hover_layer'){
			    		feature_clicked = feature;
			    	}
			    });
			  start_point = ol.proj.transform(map_2.getCoordinateFromPixel([right_click_element.offsetX,right_click_element.offsetY]), 'EPSG:3857', 'EPSG:4326');
		  }
		  break;
	  case 3:
		  if(window.navigator.appCodeName == "Mozilla"){
			  map_3.forEachFeatureAtPixel([right_click_element.layerX,right_click_element.layerY], function (feature, layer) {
				  if(layer.get('id') == 'id_rank_1_clue_layer'){
					  feature_rank_1_clicked = feature;
					}
				  if(layer.get('id') == 'element_hover_layer'){
			    		feature_clicked = feature;
			    	}
			    });
			  start_point = ol.proj.transform(map_3.getCoordinateFromPixel([right_click_element.layerX,right_click_element.layerY]), 'EPSG:3857', 'EPSG:4326');
		  } else {
			  map_3.forEachFeatureAtPixel([right_click_element.offsetX,right_click_element.offsetY], function (feature, layer) {
				  if(layer.get('id') == 'id_rank_1_clue_layer'){
					  feature_rank_1_clicked = feature;
					}
				  if(layer.get('id') == 'element_hover_layer'){
			    		feature_clicked = feature;
			    	}
			    });
			  start_point = ol.proj.transform(map_3.getCoordinateFromPixel([right_click_element.offsetX,right_click_element.offsetY]), 'EPSG:3857', 'EPSG:4326');
		  }
		  break;
	  case 4:
		  if(window.navigator.appCodeName == "Mozilla"){
			  map_4.forEachFeatureAtPixel([right_click_element.layerX,right_click_element.layerY], function (feature, layer) {
				  if(layer.get('id') == 'id_rank_1_clue_layer'){
					  feature_rank_1_clicked = feature;
					}
				  if(layer.get('id') == 'element_hover_layer'){
			    		feature_clicked = feature;
			    	}
			    });
			  start_point = ol.proj.transform(map_4.getCoordinateFromPixel([right_click_element.layerX,right_click_element.layerY]), 'EPSG:3857', 'EPSG:4326');
		  } else {
			  map_4.forEachFeatureAtPixel([right_click_element.offsetX,right_click_element.offsetY], function (feature, layer) {
				  if(layer.get('id') == 'id_rank_1_clue_layer'){
					  feature_rank_1_clicked = feature;
					}
				  if(layer.get('id') == 'element_hover_layer'){
			    		feature_clicked = feature;
			    	}
			    });
			  start_point = ol.proj.transform(map_4.getCoordinateFromPixel([right_click_element.offsetX,right_click_element.offsetY]), 'EPSG:3857', 'EPSG:4326');
		  }
		  break;
	  default:
		  break;
	}

	var feature_coord;
	if(feature_clicked.getGeometry().getType() == 'Point'){
		feature_coord = ol.proj.transform(feature_clicked.getGeometry().getCoordinates(), 'EPSG:3857', 'EPSG:4326');
	} else {
		//TODO intervis objet surfacique ou linéaire
		feature_coord = start_point;
	}

	if(feature_rank_1_clicked != null){
		if(feature_rank_1_clicked.getGeometry().getType() == 'Point'){
			$("#stroke-interviz_launcher").html(feature_rank_1_clicked.getStyle().getImage().getStroke().getColor());
		} else {
			$("#stroke-interviz_launcher").html(feature_rank_1_clicked.getStyle().getStroke().getColor());
		}
		$("#object-interviz_launcher").html(feature_rank_1_clicked.getProperties().name);
		$("#ref-interviz_launcher").html(feature_rank_1_clicked.getProperties().itemRef);
		$("#type-interviz_launcher").html(feature_rank_1_clicked.getProperties().itemType);
		$("#id-interviz_launcher").html(feature_rank_1_clicked.get('id'));
	} else {
		if(feature_clicked.getGeometry().getType() == 'Point'){
			$("#stroke-interviz_launcher").html(feature_clicked.getStyle().getImage().getStroke().getColor());
		} else {
			$("#stroke-interviz_launcher").html(feature_clicked.getStyle().getStroke().getColor());
		}
		$("#object-interviz_launcher").html(feature_clicked.getProperties().name);
		$("#ref-interviz_launcher").html(feature_clicked.getProperties().itemRef);
		$("#type-interviz_launcher").html(feature_clicked.getProperties().itemType);
		$("#id-interviz_launcher").html(feature_clicked.get('id'));
	}

	$("#h1-input-interviz_launcher").val(1.5);
	$("#h2-input-interviz_launcher").val(1);
	$("#mdist-input-interviz_launcher").val(6);

	$("#coords-location-interviz_launcher").html("" + feature_coord[1] + "," + feature_coord[0] + "");
	$("#popup_div_interviz_launcher").css("display","block");
	$('#popup_div_interviz_launcher').css("top",right_click_element.clientY + 'px');
	$('#popup_div_interviz_launcher').css("left",right_click_element.clientX + 'px');

}



function create_sunmask_from_map(right_click_element){

	var clicked_map;
	if(window.navigator.appCodeName == "Mozilla"){
		var id_current_map = right_click_element.target.parentElement.parentElement.id;
		if(id_current_map == '1_map_1' || id_current_map == '2_map_1' || id_current_map == '3_map_1' || id_current_map == '4_map_1'){
			clicked_map = 1;
		} else if(id_current_map == '2_map_2' || id_current_map == '3_map_2' || id_current_map == '4_map_2'){
			clicked_map = 2;
		} else if(id_current_map == '3_map_3' || id_current_map == '4_map_3'){
			clicked_map = 3;
		} else if(id_current_map == '4_map_4'){
			clicked_map = 4;
		}
	} else {
		for(var f= 0; f < right_click_element.path.length; f++){
			if(right_click_element.path[f].id == '1_map_1' || right_click_element.path[f].id == '2_map_1' || right_click_element.path[f].id == '3_map_1' || right_click_element.path[f].id == '4_map_1'){
				clicked_map = 1;
				break;
			} else if(right_click_element.path[f].id == '2_map_2' || right_click_element.path[f].id == '3_map_2' || right_click_element.path[f].id == '4_map_2'){
				clicked_map = 2;
				break;
			} else if(right_click_element.path[f].id == '3_map_3' || right_click_element.path[f].id == '4_map_3'){
				clicked_map = 3;
				break;
			} else if(right_click_element.path[f].id == '4_map_4'){
				clicked_map = 4;
				break;
			}
		}
	}

	var coord;
	switch (clicked_map) {
	case 1:
		coord = ol.proj.toLonLat(map_1.getView().getCenter());
		  break;
	  case 2:
		  coord = ol.proj.toLonLat(map_2.getView().getCenter());
		  break;
	  case 3:
		  coord = ol.proj.toLonLat(map_3.getView().getCenter());
		  break;
	  case 4:
		  coord = ol.proj.toLonLat(map_4.getView().getCenter());
		  break;
	  default:
		  break;
	}

	var today = new Date();

	$("#year-input-sunmask_launcher").val( today.getFullYear());
	$("#month-input-sunmask_launcher").val(today.getMonth()+1);
	$("#day-input-sunmask_launcher").val(today.getDate());
	$("#hour-input-sunmask_launcher").val(today.getHours());
	$("#minute-input-sunmask_launcher").val(today.getMinutes());


	$("#coords-location-sunmask_launcher").html("" + coord[1] + "," + coord[0] + "");
	$("#popup_div_sunmask_launcher").css("display","block");
	$('#popup_div_sunmask_launcher').css("top",right_click_element.clientY + 'px');
	$('#popup_div_sunmask_launcher').css("left",right_click_element.clientX + 'px');


}


export {initialize_add_clue_on_map,
	clue_on_hover_source,
	clue_on_select_source,
	rank_1_clue_object_id_list,
	rank_2_clue_object_id_list,
	rank_3_clue_object_id_list,
	rank_1_clue_source,
	rank_2_clue_source,
	rank_1_clue_layer,
	rank_2_clue_layer,
	ZRI_source,
//	rank_3_clue_source,
	rank_3_clue_layer_source_array,
	draw_source,
	launch_add_buffer,
	modify_trajectory_point_from_map,
	object_of_interest_source,
	add_hide_layer,
	right_click_element};


