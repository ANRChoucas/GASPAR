import {app,
	rank_1_clue,
	group_of_rank_1_clue,
	rank_2_clue,
	rank_3_clue,
	group_rank_1_to_rank_2} from "./clue_element.js";
import {redraw_clue_window,
	color_change_function} from "./clue_window.js";
import {suppress_element_of_reference,
	create_buffer,
	add_rank_2_clue_to_map,
	suppress_rank_2_item,
	add_element_of_reference,
	add_rank_3_clue_to_map,
	suppress_rank_3_clue_to_map,
	suppress_rank_3_raster_from_map,
	add_draw_buffer_multi_polygon_to_map,
	union_feature,
	map_element_worker,
	add_element_of_reference_itinary,
	create_rank_3_clue_raster} from "./map_element.js";
import {clue_on_hover_source,
	clue_on_select_source,
	rank_1_clue_object_id_list,
	rank_3_clue_object_id_list,
	rank_1_clue_source,
	rank_2_clue_source,
	rank_3_clue_layer_source_array,
	draw_source,
	launch_add_buffer} from "./add_clue_from_map.js";
import {hexToRgb,
	getRandomColor,
	begining_point_color,
	past_point_color,
	to_pass_point_color,
	destination_point_color,
	rgbToHex,
	LightenDarkenColor} from "./color_function.js";
import {map_1,
		map_2,
		map_3,
		map_4,
		objectMap} from "./choucas.js";
import {add_objects_from_tree,launch_buffer_creation_from_feature_array} from "./add_clue_from_tree.js";
import {intervizEndModal,sunmaskEndModal} from "./grass_function.js";
/*
 * var used to store svg container to redraw clue window
 *
 */
var svg_clue_container;
var svg_container;

/*
 * var used to store svg scale function to redraw clue window
 *
 */
var clue_window_scale_x;
var clue_window_scale_y;

/*
 * variable used to store clic event
 */
var right_click_clue_element = {'value': null};

var settings_object = {'type':null, 'value':null, 'feature_list':[]};


function initialize_add_clue_menu(){

	$(".add-clue-menu_submenu-choice").on('click',function() {
		var menu_type = this.id.split('_')[1];
		$(".add-clue-menu_submenu").hide();
		$("#add-clue-menu_" + menu_type + "_submenu").show();
		for(var i=0; i<$(".add-clue-menu_submenu-choice").length; i++){
			if($($(".add-clue-menu_submenu-choice")[i]).hasClass("add-clue-menu_submenu-choice-selected")){
				$($(".add-clue-menu_submenu-choice")[i]).removeClass("add-clue-menu_submenu-choice-selected");
				$($(".add-clue-menu_submenu-choice")[i]).addClass("add-clue-menu_submenu-choice-unselected");
				break;
			}
		}

		$("#add-clue-menu_" + menu_type + "_submenu-choice").addClass("add-clue-menu_submenu-choice-selected");
		$("#add-clue-menu_" + menu_type + "_submenu-choice").removeClass("add-clue-menu_submenu-choice-unselected");

	});


	$("#Cancel_button_add-clue-menu").on('click',function() {
		$('#popup_div_add-clue-menu').hide();
	});

	$("#launch_button_add-clue-menu").on('click',function() {

		if($("#add-clue-menu_buffer_submenu-choice").hasClass('add-clue-menu_submenu-choice-selected')){
			var add_clue_service;
			for(var f=0; f<$(".radio_buffer").length; f++){
				if($($(".radio_buffer")[f]).prop("checked") == true){
					add_clue_service = $(".radio_buffer")[f].value;
					break;
				}
			}
			switch(add_clue_service){
				case "adapted-service":
					console.log(settings_object);
					break
				case "buffer":
					var buffer_stroke_color;
					var buffer_fill_color;

					if(settings_object.feature_list[0].getStyle() != null){
						switch (settings_object.feature_list[0].getGeometry().getType()) {
						  case 'Point':
							 var base_color = settings_object.feature_list[0].getStyle().clone().getImage().getStroke().getColor();
							  var pre_r = base_color.split(',')[0];
							 var b_r = pre_r.split('(')[1];
							var b_g = base_color.split(',')[1];
							var b_b = base_color.split(',')[2];
							buffer_stroke_color = "rgba(" + b_r + "," + b_g + "," + b_b + ",1)";
							buffer_fill_color = "rgba(" + b_r + "," + b_g + "," + b_b + ",0.05)";
						    break;
						  case 'LineString':
							 var base_color = settings_object.feature_list[0].getStyle().getStroke().getColor();
							var pre_r = base_color.split(',')[0];
							 var b_r = pre_r.split('(')[1];
							var b_g = base_color.split(',')[1];
							var b_b = base_color.split(',')[2];
							buffer_stroke_color = "rgba(" + b_r + "," + b_g + "," + b_b + ",1)";
							buffer_fill_color = "rgba(" + b_r + "," + b_g + "," + b_b + ",0.05)";
							    break;
						  case 'Polygon':
							 var base_color = settings_object.feature_list[0].getStyle().getStroke().getColor();
							var pre_r = base_color.split(',')[0];
							 var b_r = pre_r.split('(')[1];
							var b_g = base_color.split(',')[1];
							var b_b = base_color.split(',')[2];
							buffer_stroke_color = "rgba(" + b_r + "," + b_g + "," + b_b + ",1)";
							buffer_fill_color = "rgba(" + b_r + "," + b_g + "," + b_b + ",0.05)";
							    break;
						  case 'MultiPolygon':
							 var base_color = settings_object.feature_list[0].getStyle().getStroke().getColor();
							var pre_r = base_color.split(',')[0];
							 var b_r = pre_r.split('(')[1];
							var b_g = base_color.split(',')[1];
							var b_b = base_color.split(',')[2];
							buffer_stroke_color = "rgba(" + b_r + "," + b_g + "," + b_b + ",1)";
							buffer_fill_color = "rgba(" + b_r + "," + b_g + "," + b_b + ",0.05)";
							    break;
						  default:
							 var base_color = settings_object.feature_list[0].getStyle().getStroke().getColor();
							var pre_r = base_color.split(',')[0];
							 var b_r = pre_r.split('(')[1];
							var b_g = base_color.split(',')[1];
							var b_b = base_color.split(',')[2];
							buffer_stroke_color = "rgba(" + b_r + "," + b_g + "," + b_b + ",1)";
							buffer_fill_color = "rgba(" + b_r + "," + b_g + "," + b_b + ",0.05)";
						}
					} else {
						buffer_stroke_color = "rgba(" + 255 + "," + 0 + "," + 0 + ",1)";
						buffer_fill_color = "rgba(" + 255 + "," + 0 + "," + 0 + ",0.05)";
					}
					launch_buffer_creation_from_feature_array(settings_object.feature_list,$("#buffer_buffer-settings_distance-min").val()/1000,$("#buffer_buffer-settings_distance-max").val()/100,$("#buffer_buffer-settings_object").val(),buffer_stroke_color,buffer_fill_color)
					break
				case "draw":
					console.log(settings_object);
					break
				case "add-object":
					add_objects_from_tree(settings_object.feature_list,$("#buffer_buffer-settings_object").val());
					break
				default:
			}
		}

		if($("#add-clue-menu_interviz_submenu-choice").hasClass('add-clue-menu_submenu-choice-selected')){
			var h1 = document.getElementById('interviz_interviz-settings_heigth-victim');
			 var h2 = document.getElementById('interviz_interviz-settings_heigth-target');
			 var mdist = document.getElementById('interviz_interviz-settings_region-size');
			 var c;
			 switch(settings_object.type){
				case "rank_1_clue":
					if(settings_object.feature_list[0].getGeometry().getType() == 'Point'){
						var coord = ol.proj.transform(settings_object.feature_list[0].getGeometry().getCoordinates(), 'EPSG:3857', 'EPSG:4326');
						c = "" + coord + "";
					} else {
						var rank_2_extent = settings_object.feature_list[0].getGeometry().getExtent();
						var coord = [rank_2_extent[0] + (rank_2_extent[2]-rank_2_extent[0])/2,rank_2_extent[1] + (rank_2_extent[3]-rank_2_extent[1])/2];
						c = "" + coord + "";
					}
					break;
				case "object":
					if(settings_object.feature_list[0].getGeometry().getType() == 'Point'){
						var coord = ol.proj.transform(settings_object.feature_list[0].getGeometry().getCoordinates(), 'EPSG:3857', 'EPSG:4326');
						c = "" + coord + "";
					} else {
						var rank_2_extent = settings_object.feature_list[0].getGeometry().getExtent();
						var coord = [rank_2_extent[0] + (rank_2_extent[2]-rank_2_extent[0])/2,rank_2_extent[1] + (rank_2_extent[3]-rank_2_extent[1])/2];
						c = "" + coord + "";
					}
					break;
				case "object_list":
					if(settings_object.feature_list[0].getGeometry().getType() == 'Point'){
						var coord = ol.proj.transform(settings_object.feature_list[0].getGeometry().getCoordinates(), 'EPSG:3857', 'EPSG:4326');
						c = "" + coord + "";
					} else {
						var rank_2_extent = settings_object.feature_list[0].getGeometry().getExtent();
						var coord = [rank_2_extent[0] + (rank_2_extent[2]-rank_2_extent[0])/2,rank_2_extent[1] + (rank_2_extent[3]-rank_2_extent[1])/2];
						c = "" + coord + "";
					}
					break;
				case "coordinate":
					c = $("#interviz_interviz-settings_object").val();
					break;
				default:
			}
			 intervizEndModal(h1,h2,mdist,c);

		}

		if($("#add-clue-menu_sunmask_submenu-choice").hasClass('add-clue-menu_submenu-choice-selected')){
			var coords = ol.proj.toLonLat(map_1.getView().getCenter());
			var year = document.getElementById('sunmask_sunmask-settings_year');
			  var month = document.getElementById('sunmask_sunmask-settings_month');
			  var day = document.getElementById('sunmask_sunmask-settings_day');
			  var hour = document.getElementById('sunmask_sunmask-settings_hour');
			  var minute = document.getElementById('sunmask_sunmask-settings_minut');
			sunmaskEndModal(year,month,day,hour,minute,"" + coords[1] + "," + coords[0] + "");
		}


		$('#popup_div_add-clue-menu').hide();
	});

	$(".radio_buffer").on('click',function() {
		$(".radio_buffer").prop("checked", false);
		$(this).prop("checked", true);
	});



}

function add_add_clue_menu_settings(element,option){
	settings_object.type = null;
	settings_object.value = null,
	settings_object.feature_list = [];
	//récupération de l'élément cliqué
	switch(option){
		case "tree":
			var master_node =$.ui.fancytree.getNode(element.value);
			var nodes = [master_node];
			master_node.visit(function(n) {
			    nodes.push(n);
			  });

			var item_ref_array = [];
			for(var i =0; i<nodes.length; i++){
				if(nodes[i].data.itemRef != undefined){
					item_ref_array.push(nodes[i].data.itemRef);
				}
			}

			//récupération des objets
			var Array_of_object_ref = Object.keys(objectMap).map(function(key) {
				  return [Number(key), objectMap[key]];
				});

			//test sur Array_of_object_ref[i][0] pour voir s'il est dans item_ref_array
			var feature_array = [];
			for(var i = 0; i<item_ref_array.length; i++){
				var item_ref = item_ref_array[i];
				for(var j = 0; j<Array_of_object_ref.length; j++){
					if(Array_of_object_ref[j][0]  == item_ref && Array_of_object_ref[j][1]  != undefined){
						feature_array.push(Array_of_object_ref[j][1].clone());
						break;
					}
				}
			}

			var clue_title = master_node.title;
			settings_object.type = 'object_list';
			settings_object.value = {'title':clue_title};
			settings_object.feature_list = feature_array;
			break;
		case "clue_window":
			if(element.nodeName == 'g' && element.id.split('_')[element.id.split('_').length -1] == 'container' && element.id.split('_')[element.id.split('_').length -2] == 'clue'){

				switch(parseInt(element.id.split('_')[2])){
					case 1:
						var object_list = [];
						for(var f = 0; f < app.list_of_rank_1_clue.length; f++){
		    				if(app.list_of_rank_1_clue[f].id_clue == parseInt(element.id.split('_')[0])){
		    					settings_object.type = 'rank_1_clue';
		    					settings_object.value = app.list_of_rank_1_clue[f];
		    					for(var g =0; g<app.list_of_rank_1_clue[f].object_clue.length; g++){
		    						object_list.push(app.list_of_rank_1_clue[f].object_clue[g].id_object);
		    					}
		    					break;
		    				}
		    			}
						for(var f = 0; f < rank_1_clue_source.getFeatures().length; f++){
		    				if(object_list.indexOf(rank_1_clue_source.getFeatures()[f].get('id'))> -1){
		    					settings_object.feature_list.push(rank_1_clue_source.getFeatures()[f]);
		    					break;
		    				}
						}
						break;
					case 2:
						var id_group_1 = null;
						for(var f = 0; f < app.list_group_rank_1_to_rank_2.length; f++){
		    				if(app.list_group_rank_1_to_rank_2[f].id_rank_2 == parseInt(element.id.split('_')[0])){
		    					id_group_1 = app.list_group_rank_1_to_rank_2[f].id_group_rank_1;
		    					break;
		    				}
						}

						if(id_group_1 == null){
							//dessin, chercher centroid de la feature
							var rank_2_clue;
							for(var f = 0; f < app.list_of_rank_2_clue.length; f++){
			    				if(app.list_of_rank_2_clue[f].id_clue == parseInt(element.id.split('_')[0])){
			    					rank_2_clue = app.list_of_rank_2_clue[f];
			    					break;
			    				}
							}
							for(var f=0; f<rank_2_clue_source.getFeatures().length; f++){
								if(rank_2_clue.object_clue[0].id_object == rank_2_clue_source.getFeatures()[f].get('id')){
									var rank_2_extent = rank_2_clue_source.getFeatures()[f].getGeometry().getExtent();
									settings_object.type = 'coordinate';
			    					settings_object.value = ol.proj.toLonLat([rank_2_extent[1] + (rank_2_extent[3]-rank_2_extent[1])/2,rank_2_extent[0] + (rank_2_extent[2]-rank_2_extent[0])/2]);
			    					settings_object.feature_list.push(new ol.Feature({geometry: new ol.geom.Point(settings_object.value)}));
			    					break;
								}
							}
						} else {
							//chercher l'indice 1 correspondant
							var group_1
							for(var f = 0; f < app.list_group_of_rank_1_clue.length; f++){
			    				if(app.list_group_of_rank_1_clue[f].id_group == id_group_1){
			    					group_1 = app.list_group_of_rank_1_clue[f];
			    					break;
			    				}
							}
							var object_list = [];
							for(var f = 0; f < app.list_of_rank_1_clue.length; f++){
			    				if(app.list_of_rank_1_clue[f].id_clue == group_1.list_of_clue_id[0]){
			    					settings_object.type = 'rank_1_clue';
			    					settings_object.value = app.list_of_rank_1_clue[f];
			    					for(var g =0; g<app.list_of_rank_1_clue[f].object_clue.length; g++){
			    						object_list.push(app.list_of_rank_1_clue[f].object_clue[g].id_object);
			    					}
			    					break;
			    				}
			    			}
							for(var f = 0; f < rank_1_clue_source.getFeatures().length; f++){
			    				if(object_list.indexOf(rank_1_clue_source.getFeatures()[f].get('id'))> -1){
			    					settings_object.feature_list.push(rank_1_clue_source.getFeatures()[f]);
			    					break;
			    				}
							}
						}
						break;
					case 3:

						break;
					default:
				}
			}
			break;
		case "text":
			break;
		default:
			var list_feature = [];
	    var list_layer = [];
	    var pixel_coordinate;
	    switch(option){
			case "map_1":
				map_1.forEachFeatureAtPixel([element.offsetX,element.offsetY], function (feature, layer) {
			    	list_feature.push(feature);
			    	list_layer.push(layer);
			    });
				pixel_coordinate = ol.proj.toLonLat(map_1.getCoordinateFromPixel([element.offsetX,element.offsetY]));
				break;
			case "map_2":
				map_2.forEachFeatureAtPixel([element.offsetX,element.offsetY], function (feature, layer) {
			    	list_feature.push(feature);
			    	list_layer.push(layer);
			    });
				pixel_coordinate = ol.proj.toLonLat(map_2.getCoordinateFromPixel([element.offsetX,element.offsetY]));
				break;
			case "map_3":
				map_3.forEachFeatureAtPixel([element.offsetX,element.offsetY], function (feature, layer) {
			    	list_feature.push(feature);
			    	list_layer.push(layer);
			    });
				pixel_coordinate = ol.proj.toLonLat(map_3.getCoordinateFromPixel([element.offsetX,element.offsetY]));
				break;
			case "map_4":
				map_4.forEachFeatureAtPixel([element.offsetX,element.offsetY], function (feature, layer) {
			    	list_feature.push(feature);
			    	list_layer.push(layer);
			    });
				pixel_coordinate = ol.proj.toLonLat(map_4.getCoordinateFromPixel([element.offsetX,element.offsetY]));
				break;
			default:
	    }


	    if(list_feature.length > 0){
	    	if(list_feature[0].get('id_clue')){
	    		if(list_feature[0].get('id').substr(0, 16) == 'trajectory_point'){
	    			for(var f = 0; f < app.list_of_rank_1_clue.length; f++){
	    				if(app.list_of_rank_1_clue[f].id_clue == parseInt(list_feature[0].get('id_clue'))){
	    					settings_object.type = 'rank_1_clue';
	    					settings_object.value = app.list_of_rank_1_clue[f];
	    					settings_object.feature_list.push(list_feature[0]);
	    					break;
	    				}
	    			}
	    		} else if(list_feature[0].get('id').substr(0, 20) == 'element_of_reference'){
	    			for(var f = 0; f < app.list_of_rank_1_clue.length; f++){
	    				if(app.list_of_rank_1_clue[f].id_clue == parseInt(list_feature[0].get('id_clue'))){
	    					settings_object.type = 'rank_1_clue';
	    					settings_object.value = app.list_of_rank_1_clue[f];
	    					settings_object.feature_list.push(list_feature[0]);
	    					break;
	    				}
	    			}
	    		}
	    	} else if(list_layer[0].get('id').substr(0, 18) == 'object_of_interest') {
	    		settings_object.type = 'object';
				settings_object.value = list_feature[0];
				settings_object.feature_list.push(list_feature[0]);
	    	} else if(list_layer[0].get('id').substr(0, 20) == 'id_rank_2_clue_layer') {
	    		settings_object.type = 'coordinate';
				settings_object.value = [pixel_coordinate[1],pixel_coordinate[0]];
				settings_object.feature_list.push(new ol.Feature({geometry: new ol.geom.Point(settings_object.value)}));
	    	} else {
	    		settings_object.type = 'object';
				settings_object.value = list_feature[0];
				settings_object.feature_list.push(list_feature[0]);
	    	}
	    } else {
	    	settings_object.type = 'coordinate';
			settings_object.value = [pixel_coordinate[1],pixel_coordinate[0]];
			settings_object.feature_list.push(new ol.Feature({geometry: new ol.geom.Point(settings_object.value)}));
	    }
	}

	//ajout de l'élément sélectionné dans le formulaire
	switch(settings_object.type){
		case "rank_1_clue":
			$("#buffer_buffer-settings_object").val(settings_object.value.summary);
			$("#interviz_interviz-settings_object").val(settings_object.value.summary);
			break;
		case "object":
			$("#buffer_buffer-settings_object").val(settings_object.value.values_.name);
			$("#interviz_interviz-settings_object").val(settings_object.value.values_.name);
			break;
		case "object_list":
			$("#buffer_buffer-settings_object").val(settings_object.value.title);
			$("#interviz_interviz-settings_object").val(settings_object.value.title);
			break;
		case "coordinate":
			$("#buffer_buffer-settings_object").val(settings_object.value);
			$("#interviz_interviz-settings_object").val(settings_object.value);
			break;
		default:
	}

	//ajout des autres settings (buffer, heure, hauteur)
	$("#buffer_buffer-settings_distance-min").val(0);
	$("#buffer_buffer-settings_distance-max").val(200);
	$("#buffer_buffer-settings_incertitude").val(0);

	$("#interviz_interviz-settings_heigth-victim").val(1.5);
	$("#interviz_interviz-settings_heigth-target").val(1);
	$("#interviz_interviz-settings_region-size").val(6);

	$(".radio_buffer").prop("checked", false);
	$("#buffer_ZLP-type_adapted-service").prop("checked", true);
	$("#buffer_clue-trust-range_trust").val(2);
	$("#buffer_clue-trust-range_time").val(6);

	var today = new Date();

	$("#sunmask_sunmask-settings_year").val( today.getFullYear());
	$("#sunmask_sunmask-settings_month").val(today.getMonth()+1);
	$("#sunmask_sunmask-settings_day").val(today.getDate());
	$("#sunmask_sunmask-settings_hour").val(today.getHours());
	$("#sunmask_sunmask-settings_minut").val(today.getMinutes());

}

/*
 * initialize_clue_window
 *
 * initialize interactive functions of clue_window
 *
 */
function initialize_clue_window(){

	initialize_add_clue_menu();

	if($("#svg_clue_window_container").length == 0){
		svg_container = d3.select("#clue_window").append("svg")
		.attr("id", "svg_container")
		.attr("width", "100%")
		.attr("height", "100%");

		svg_clue_container = svg_container.append("g")
		.attr("id", "svg_clue_window_container");
	} else {
		d3.selectAll(".clue_window_element").remove();
	}

	$(".rank_1_clue_element_menu_suppress_clue").on('click',function() {
		suppress_rank_1_clue_from_clue_window(right_click_clue_element);
	});

	$(".rank_1_clue_itinary_points_element_menu_suppress_clue").on('click',function() {
		suppress_itinary_rank_1_clue_from_clue_window(right_click_clue_element);
	});

	$(".rank_2_clue_element_menu_suppress_clue").on('click',function() {
		suppress_rank_2_clue_from_clue_window(right_click_clue_element);
	});

	$(".rank_2_clue_element_menu_create_rank_3").on('click',function() {
		create_rank_3_element();
	});

	$('#rank_3_clue_element_menu_color_pickr').on('change',function() {
		 color_change_function();
		 $('.clue_window_menu').css("display","none");
		});

//	$('#rank_3_clue_element_menu_color_range').on('change',function() {
//		 color_change_function();
//		 $('.clue_window_menu').css("display","none");
//		});

    $( "#rank_3_clue_element_menu_color_range" ).slider({
        range: true,
        min: 0,
        max: 100,
        values: [ 0, 100 ],
        slide: function( event, ui ) {
        	color_change_function();
        }
      });

	$(".rank_3_clue_element_menu_suppress_clue").on('click',function() {
		suppress_rank_3_element(right_click_clue_element);
	});

	$(".clue_window_menu_element").on('click',function() {
		$('.clue_window_menu').css("display","none");
	});

	initialize_add_clue_from_clue_window();

}


/*
 * initialize_add_clue_from_clue_window
 *
 * initialize functions launching to add clue element from clue_window
 * functions launched from context menu (opened from right click on clue_window elements)
 *
 */
function initialize_add_clue_from_clue_window(){

	/*
	 * buffer creation from clue_window from itinary_points
	 */
	$(".rank_1_clue_itinary_points_element_menu_create_buffer").on('click',function() {

		var id_rank1 = parseInt(right_click_clue_element.value.target.id.split("_")[0]);
		var clue_rank_1;
		for(var t=0; t< app.list_of_rank_1_clue.length; t++){
			if(app.list_of_rank_1_clue[t].id_clue == id_rank1){
				clue_rank_1 = app.list_of_rank_1_clue[t];
				break;
			}
		}

		var feature_id_array = clue_rank_1.object_clue;
		var feature_array = [];
		for(var j =0; j< feature_id_array.length; j++){
			for(var i =0; i< rank_1_clue_source.getFeatures().length; i++){
				if(rank_1_clue_source.getFeatures()[i].get('id') == feature_id_array[j].id_object){
					feature_array.push(rank_1_clue_source.getFeatures()[i].clone());
					break;
				}
			}
		}

		create_buffer_clue_window_itinary(clue_rank_1,feature_array,right_click_clue_element);
	});

	/*
	 * buffer creation from clue_window from object of interest
	 */
	$(".rank_1_clue_element_menu_create_buffer").on('click',function() {

		var id_rank1 = parseInt(right_click_clue_element.value.target.id.split("_")[0]);
		var clue_rank_1;
		for(var t=0; t< app.list_of_rank_1_clue.length; t++){
			if(app.list_of_rank_1_clue[t].id_clue == id_rank1){
				clue_rank_1 = app.list_of_rank_1_clue[t];
				break;
			}
		}

		var feature_id_array = clue_rank_1.object_clue;
		var feature_array = [];
		for(var j =0; j< feature_id_array.length; j++){
			for(var i =0; i< rank_1_clue_source.getFeatures().length; i++){
				if(rank_1_clue_source.getFeatures()[i].get('id') == feature_id_array[j].id_object){
					feature_array.push(rank_1_clue_source.getFeatures()[i].clone());
					break;
				}
			}
		}

		create_buffer_clue_window(clue_rank_1,feature_array,right_click_clue_element);
	});

	/*
	 * modify rank_2 element from clue_windo
	 */
	$(".rank_2_clue_element_menu_modify_clue").on('click',function() {

		var id_rank2 = parseInt(right_click_clue_element.value.target.id.split("_")[0]);
		var clue_rank_2;
		for(var t=0; t< app.list_of_rank_2_clue.length; t++){
			if(app.list_of_rank_2_clue[t].id_clue == id_rank2){
				clue_rank_2 = app.list_of_rank_2_clue[t];
				break;
			}
		}

		var feature_2_id_array = clue_rank_2.object_clue;
		var feature_2_array = [];
		for(var j =0; j< feature_2_id_array.length; j++){
			for(var i =0; i< rank_2_clue_source.getFeatures().length; i++){
				if(rank_2_clue_source.getFeatures()[i].get('id') == feature_2_id_array[j].id_object){
					feature_2_array.push(rank_2_clue_source.getFeatures()[i].clone());
					break;
				}
			}
		}

		var group_1_to_2;
		for(var j =0; j< app.list_group_rank_1_to_rank_2.length; j++){
			if(app.list_group_rank_1_to_rank_2[j].id_rank_2 == id_rank2){
				group_1_to_2 = app.list_group_rank_1_to_rank_2[j];
				break;
			}
		}

		var group_1;
		for(var j =0; j< app.list_group_of_rank_1_clue.length; j++){
			if(app.list_group_of_rank_1_clue[j].id_group == group_1_to_2.id_group_rank_1){
				group_1 = app.list_group_of_rank_1_clue[j];
				break;
			}
		}

		var clue_1_array = [];
		for(var j =0; j< group_1.list_of_clue_id.length; j++){
			for(var i =0; i< app.list_of_rank_1_clue.length; i++){
				if(app.list_of_rank_1_clue[i].id_clue == group_1.list_of_clue_id[j]){
					clue_1_array.push(app.list_of_rank_1_clue[i]);
					break;
				}
			}
		}

		var feature_1_array = [];
		for(var j =0; j< clue_1_array.length; j++){
			for(var a =0; a< clue_1_array[j].object_clue.length; a++){
				for(var i =0; i< rank_1_clue_source.getFeatures().length; i++){
					if(rank_1_clue_source.getFeatures()[i].get('id') == clue_1_array[j].object_clue[a].id_object){
						feature_1_array.push(rank_1_clue_source.getFeatures()[i].clone());
						break;
					}
				}
			}
		}

		if(group_1_to_2.type_transform == "Buffer"){
			modify_buffer_from_window(right_click_clue_element,clue_rank_2,feature_2_id_array,feature_2_array,group_1_to_2,group_1,clue_1_array,feature_1_array);
		}

	});

}


/*
 * create_buffer_clue_window_itinary
 *
 * buffer creation from clue_window from itinary_points
 *
 * clue_rank_1: rank_1_element at the origin of buffer
 * feature_array: array of feature at the origin of buffer
 * event: click event
 *
 */
function create_buffer_clue_window_itinary(clue_rank_1,feature_array,event){

	//affichage du slider pour saisir les paramètres du buffer
	//TODO prise en compte des 2 valeurs saisies pour le calcul du buffer
	$('#rank_2_buffer_parameters').css("display","block");
	$('#rank_2_buffer_parameters').css("top",event.value.clientY + 'px');
	$('#rank_2_buffer_parameters').css("left",event.value.clientX + 'px');


	var color;
	var buffer_stroke_color;
	var buffer_fill_color;

	switch(clue_rank_1.type_clue){
	case "begining_point":
		color = hexToRgb(begining_point_color);
		break;
	case "to_pass_point":
		color = hexToRgb(to_pass_point_color);
		break;
	case "past_point":
		color = hexToRgb(past_point_color);
		break;
	case "destination_point":
		color = hexToRgb(destination_point_color);
		break;
	default:
		color = hexToRgb("#000000");
	}


	switch (feature_array[0].getGeometry().getType()) {
	  case 'Point':
//		  var base_color = hexToRgb(feature_array[0].getStyle().getImage().getStroke().getColor());
		  buffer_stroke_color = "rgba(" + color.r + "," + color.g + "," + color.b + ",1)";
		  buffer_fill_color = "rgba(" + color.r + "," + color.g + "," + color.b + ",0.05)";
	    break;
	  case 'LineString':
//		  var base_color = hexToRgb(feature_array[0].getStyle().getStroke().getColor());
		  buffer_stroke_color = "rgba(" + color.r + "," + color.g + "," + color.b + ",1)";
		  buffer_fill_color = "rgba(" + color.r + "," + color.g + "," + color.b + ",0.05)";
		    break;
	  case 'Polygon':
//		  var base_color = hexToRgb(feature_array[0].getStyle().getStroke().getColor());
		  buffer_stroke_color = "rgba(" + color.r + "," + color.g + "," + color.b + ",1)";
		  buffer_fill_color = "rgba(" + color.r + "," + color.g + "," + color.b + ",0.05)";
		    break;
	  case 'MultiPolygon':
//		  var base_color = hexToRgb(feature_array[0].getStyle().getStroke().getColor());
		  buffer_stroke_color = "rgba(" + color.r + "," + color.g + "," + color.b + ",1)";
		  buffer_fill_color = "rgba(" + color.r + "," + color.g + "," + color.b + ",0.05)";
		    break;
	  default:
//		  var base_color = hexToRgb(feature_array[0].getStyle().getImage().getStroke().getColor());
		  buffer_stroke_color = "rgba(" + color.r + "," + color.g + "," + color.b + ",1)";
		  buffer_fill_color = "rgba(" + color.r + "," + color.g + "," + color.b + ",0.05)";
	}



	$( "#rank_2_buffer_parameters_input_1" ).val(0);
    $( "#rank_2_buffer_parameters_input_2" ).val(2);


    add_draw_buffer_multi_polygon_to_map(feature_array, parseFloat($( "#rank_2_buffer_parameters_input_1" ).val()), parseFloat($( "#rank_2_buffer_parameters_input_2" ).val()), {units: "kilometres"},'draw_buffer_feature',buffer_fill_color,buffer_stroke_color);

//	var feature_to_draw_buffer;
//	var draw_buffer;
//	if(feature_array.length == 1){
//		feature_to_draw_buffer = feature_array[0];
////		add_draw_buffer_to_map(feature_to_draw_buffer, parseFloat($( "#rank_2_buffer_parameters_input_1" ).val()), parseFloat($( "#rank_2_buffer_parameters_input_2" ).val()), {units: "kilometres"},'draw_buffer_feature',buffer_fill_color,buffer_stroke_color);
//		draw_buffer = create_buffer(feature_to_draw_buffer, parseFloat($( "#rank_2_buffer_parameters_input_1" ).val()), parseFloat($( "#rank_2_buffer_parameters_input_2" ).val()), {units: "kilometres"});
//	} else {
//		//Merge all features into a single Openlayer Multipolygon
//		var tmp_buffer_1 = null;
//		var tmp_buffer_2 = null;
//		var tmp_buffer_3 = null;
//		for(var r=0; r<feature_array.length; r++){
//			if(tmp_buffer_1 == null){
//				tmp_buffer_1 = create_buffer(feature_array[r], parseFloat($( "#rank_2_buffer_parameters_input_1" ).val()), parseFloat($( "#rank_2_buffer_parameters_input_2" ).val()), {units: "kilometres"});
//			} else {
//				tmp_buffer_2 = create_buffer(feature_array[r], parseFloat($( "#rank_2_buffer_parameters_input_1" ).val()), parseFloat($( "#rank_2_buffer_parameters_input_2" ).val()), {units: "kilometres"});
//				tmp_buffer_3 = union_feature(tmp_buffer_1,tmp_buffer_2);
//				tmp_buffer_1 = tmp_buffer_3.clone();
//			}
//        }
//		draw_buffer = tmp_buffer_3;
//	}
//
//	draw_source.clear();
//
//    var circle_feature = new ol.Feature({
//		id:"draw_buffer_feature",
//		geometry: draw_buffer.getGeometry()});
//
//    circle_feature.setStyle(new ol.style.Style({
//	    fill: new ol.style.Fill({
//	    	   color: buffer_fill_color
//	    }),
//	    stroke: new ol.style.Stroke({
//	    	   color : buffer_stroke_color,
//	    	   width : 4
//	    	})
//	  }));
//
//    draw_source.addFeature(circle_feature);

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

	        add_draw_buffer_multi_polygon_to_map(feature_array, parseFloat(ui.values[ 0 ]), parseFloat(ui.values[ 1 ]), {units: "kilometres"},'draw_buffer_feature',buffer_fill_color,buffer_stroke_color);

	      }
	    });


      $( "#rank_2_buffer_parameters_input_1" ).on("keydown",function(e){
    	  if(13==e.keyCode){
    		  $("#rank_2_buffer_parameters_sliders").slider('values', [$(this).val(),$( "#rank_2_buffer_parameters_input_2" ).val()]);

  	        add_draw_buffer_multi_polygon_to_map(feature_array, parseFloat($(this).val()), parseFloat($( "#rank_2_buffer_parameters_input_2" ).val()), {units: "kilometres"},'draw_buffer_feature',buffer_fill_color,buffer_stroke_color);

    	  }
      });

      $( "#rank_2_buffer_parameters_input_2" ).on("keydown",function(e){
    	  if(13==e.keyCode){
    		  $("#rank_2_buffer_parameters_sliders").slider('values', [$( "#rank_2_buffer_parameters_input_1" ).val(),$(this).val()]);

    	        add_draw_buffer_multi_polygon_to_map(feature_array, parseFloat($( "#rank_2_buffer_parameters_input_1" ).val()), parseFloat($(this).val()), {units: "kilometres"},'draw_buffer_feature',buffer_fill_color,buffer_stroke_color);

    	  }
      });

    //fonction d'ajout du buffer
      launch_add_buffer.fct = function() {

    	  draw_source.clear();

    	  var item_feature;
    	  item_feature = feature_array[0].clone();

    	  var clue_1;
	  		var clue_1_id;
	  		var group_1;
	  		var group_1_id;

	  		if(app.list_of_rank_1_clue_id.length == 0){
				clue_1_id = 1;
			} else {
				clue_1_id = (Math.max(...app.list_of_rank_1_clue_id) + 1);
			}
			var point_id;

			switch(clue_rank_1.type_clue){
			case "begining_point":
				point_id = add_element_of_reference_itinary(clue_1_id,item_feature.clone(),hexToRgb(begining_point_color));
				clue_1 = new rank_1_clue(clue_1_id, "Object_interest_begining_point", [point_id],clue_rank_1.summary,clue_rank_1.details,true);
				break;
			case "to_pass_point":
				point_id = add_element_of_reference_itinary(clue_1_id,item_feature.clone(),hexToRgb(to_pass_point_color));
				clue_1 = new rank_1_clue(clue_1_id, "Object_interest_to_pass_point", [point_id],clue_rank_1.summary,clue_rank_1.details,true);
				break;
			case "past_point":
				point_id = add_element_of_reference_itinary(clue_1_id,item_feature.clone(),hexToRgb(past_point_color));
				clue_1 = new rank_1_clue(clue_1_id, "Object_interest_past_point", [point_id],clue_rank_1.summary,clue_rank_1.details,true);
				break;
			case "destination_point":
				point_id = add_element_of_reference_itinary(clue_1_id,item_feature.clone(),hexToRgb(destination_point_color));
				clue_1 = new rank_1_clue(clue_1_id, "Object_interest_destination_point", [point_id],clue_rank_1.summary,clue_rank_1.details,true);
				break;
			default:
				point_id = add_element_of_reference_itinary(clue_1_id,item_feature.clone(),hexToRgb('#000000'));
				clue_1 = new rank_1_clue(clue_1_id, "Object_interest_begining_point", [point_id],clue_rank_1.summary,clue_rank_1.details,true);
			}



	  		app.list_of_rank_1_clue.push(clue_1)
			app.list_of_rank_1_clue_id.push(clue_1_id);

	  		if(app.list_group_of_rank_1_clue_id.length == 0){
				group_1_id = 1;
			} else {
				group_1_id = (Math.max(...app.list_group_of_rank_1_clue_id) + 1);
			}


			group_1 = new group_of_rank_1_clue(group_1_id, "Object_interest", "",[clue_1_id]);
			app.list_group_of_rank_1_clue.push(group_1);
			app.list_group_of_rank_1_clue_id.push(group_1_id);

//			var buffer;
//
//			buffer = create_buffer(item_feature, parseFloat($( "#rank_2_buffer_parameters_input_1" ).val()), parseFloat($( "#rank_2_buffer_parameters_input_2" ).val()), {units: "kilometres"});

			var GeoJSON_format = new ol.format.GeoJSON();
	  		var list_objet_json = [];
	  		var tmp = item_feature.clone();
  			tmp.getGeometry().transform("EPSG:3857", "EPSG:4326");
  			var object_geojson = GeoJSON_format.writeFeatureObject(tmp);
  			list_objet_json.push(object_geojson);

	  		map_element_worker.postMessage({'cmd': 'create_buffer_multi', 'arg': {
	  			'list_objet_json': list_objet_json,
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
//  						add_rank_3_clue_to_map(app.list_of_rank_3_clue[j]);
  						create_rank_3_clue_raster(app.list_of_rank_3_clue[j]);
  					}
  				}

  				redraw_clue_window();

	  		}

		$('#rank_2_buffer_parameters').css("display","none");
	};

}

/*
 * create_buffer_clue_window
 *
 * buffer creation from clue_window from object of interest
 *
 * clue_rank_1: rank_1_element at the origin of buffer
 * feature_array: array of feature at the origin of buffer
 * event: click event
 *
 */
function create_buffer_clue_window(clue_rank_1,feature_array,event){

	//affichage du slider pour saisir les paramètres du buffer
	//TODO prise en compte des 2 valeurs saisies pour le calcul du buffer
	$('#rank_2_buffer_parameters').css("display","block");
	$('#rank_2_buffer_parameters').css("top",event.value.clientY + 'px');
	$('#rank_2_buffer_parameters').css("left",event.value.clientX + 'px');

	$( "#rank_2_buffer_parameters_input_1" ).val(0);
    $( "#rank_2_buffer_parameters_input_2" ).val(2);


    var buffer_stroke_color;
	var buffer_fill_color;


	switch (feature_array[0].getGeometry().getType()) {
	  case 'Point':
//		  var base_color = hexToRgb(item_feature.getStyle().getImage().getStroke().getColor());
//		  buffer_stroke_color = "rgba(" + base_color.r + "," + base_color.g + "," + base_color.b + ",1)";
//		  buffer_fill_color = "rgba(" + base_color.r + "," + base_color.g + "," + base_color.b + ",0.05)";
		 var base_color = feature_array[0].getStyle().clone().getImage().getStroke().getColor();
		  var pre_r = base_color.split(',')[0];
		 var b_r = pre_r.split('(')[1];
		var b_g = base_color.split(',')[1];
		var b_b = base_color.split(',')[2];
		buffer_stroke_color = "rgba(" + b_r + "," + b_g + "," + b_b + ",1)";
		buffer_fill_color = "rgba(" + b_r + "," + b_g + "," + b_b + ",0.05)";
	    break;
	  case 'LineString':
//		  var base_color = hexToRgb(item_feature.getStyle().getStroke().getColor());
//		  buffer_stroke_color = "rgba(" + base_color.r + "," + base_color.g + "," + base_color.b + ",1)";
//		  buffer_fill_color = "rgba(" + base_color.r + "," + base_color.g + "," + base_color.b + ",0.05)";
		 var base_color = feature_array[0].getStyle().getStroke().getColor();
		var pre_r = base_color.split(',')[0];
		 var b_r = pre_r.split('(')[1];
		var b_g = base_color.split(',')[1];
		var b_b = base_color.split(',')[2];
		buffer_stroke_color = "rgba(" + b_r + "," + b_g + "," + b_b + ",1)";
		buffer_fill_color = "rgba(" + b_r + "," + b_g + "," + b_b + ",0.05)";
		    break;
	  case 'Polygon':
//		  var base_color = hexToRgb(item_feature.getStyle().getStroke().getColor());
//		  buffer_stroke_color = "rgba(" + base_color.r + "," + base_color.g + "," + base_color.b + ",1)";
//		  buffer_fill_color = "rgba(" + base_color.r + "," + base_color.g + "," + base_color.b + ",0.05)";
		 var base_color = feature_array[0].getStyle().getStroke().getColor();
		var pre_r = base_color.split(',')[0];
		 var b_r = pre_r.split('(')[1];
		var b_g = base_color.split(',')[1];
		var b_b = base_color.split(',')[2];
		buffer_stroke_color = "rgba(" + b_r + "," + b_g + "," + b_b + ",1)";
		buffer_fill_color = "rgba(" + b_r + "," + b_g + "," + b_b + ",0.05)";
		    break;
	  case 'MultiPolygon':
//		  var base_color = hexToRgb(item_feature.getStyle().getStroke().getColor());
//		  buffer_stroke_color = "rgba(" + base_color.r + "," + base_color.g + "," + base_color.b + ",1)";
//		  buffer_fill_color = "rgba(" + base_color.r + "," + base_color.g + "," + base_color.b + ",0.05)";
		 var base_color = feature_array[0].getStyle().getStroke().getColor();
		var pre_r = base_color.split(',')[0];
		 var b_r = pre_r.split('(')[1];
		var b_g = base_color.split(',')[1];
		var b_b = base_color.split(',')[2];
		buffer_stroke_color = "rgba(" + b_r + "," + b_g + "," + b_b + ",1)";
		buffer_fill_color = "rgba(" + b_r + "," + b_g + "," + b_b + ",0.05)";
		    break;
	  default:
//		  var base_color = hexToRgb(item_feature.getStyle().getImage().getStroke().getColor());
//		  buffer_stroke_color = "rgba(" + base_color.r + "," + base_color.g + "," + base_color.b + ",1)";
//		  buffer_fill_color = "rgba(" + base_color.r + "," + base_color.g + "," + base_color.b + ",0.05)";
		 var base_color = feature_array[0].getStyle().getStroke().getColor();
		var pre_r = base_color.split(',')[0];
		 var b_r = pre_r.split('(')[1];
		var b_g = base_color.split(',')[1];
		var b_b = base_color.split(',')[2];
		buffer_stroke_color = "rgba(" + b_r + "," + b_g + "," + b_b + ",1)";
		buffer_fill_color = "rgba(" + b_r + "," + b_g + "," + b_b + ",0.05)";
	}

    add_draw_buffer_multi_polygon_to_map(feature_array, parseFloat($( "#rank_2_buffer_parameters_input_1" ).val()), parseFloat($( "#rank_2_buffer_parameters_input_2" ).val()), {units: "kilometres"},'draw_buffer_feature',buffer_fill_color,buffer_stroke_color);


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

	        add_draw_buffer_multi_polygon_to_map(feature_array, parseFloat(ui.values[ 0 ]), parseFloat(ui.values[ 1 ]), {units: "kilometres"},'draw_buffer_feature',buffer_fill_color,buffer_stroke_color);


	      }
	    });


      $( "#rank_2_buffer_parameters_input_1" ).on("keydown",function(e){
    	  if(13==e.keyCode){
    		  $("#rank_2_buffer_parameters_sliders").slider('values', [$(this).val(),$( "#rank_2_buffer_parameters_input_2" ).val()]);

    		  add_draw_buffer_multi_polygon_to_map(feature_array, parseFloat($(this).val()), parseFloat($( "#rank_2_buffer_parameters_input_2" ).val()), {units: "kilometres"},'draw_buffer_feature',buffer_fill_color,buffer_stroke_color);

    	  }
      });

      $( "#rank_2_buffer_parameters_input_2" ).on("keydown",function(e){
    	  if(13==e.keyCode){
    		  $("#rank_2_buffer_parameters_sliders").slider('values', [$( "#rank_2_buffer_parameters_input_1" ).val(),$(this).val()]);

    		  add_draw_buffer_multi_polygon_to_map(feature_array, parseFloat($( "#rank_2_buffer_parameters_input_1" ).val()), parseFloat($(this).val()), {units: "kilometres"},'draw_buffer_feature',buffer_fill_color,buffer_stroke_color);

    	  }
      });

    //fonction d'ajout du buffer
      launch_add_buffer.fct = function() {

    	  draw_source.clear();

    	  var clue_1;
	  		var clue_1_id;
	  		var group_1;
	  		var group_1_id;

	  		for(var i =0; i< app.list_group_of_rank_1_clue.length; i++){
	  			if(app.list_group_of_rank_1_clue[i].list_of_clue_id.indexOf(clue_rank_1.id_clue) > -1){
	  				group_1 = app.list_group_of_rank_1_clue[i];
	  				group_1_id = app.list_group_of_rank_1_clue[i].id_group;
	  				break;
	  			}
	  		}

	  		var GeoJSON_format = new ol.format.GeoJSON();
	  		var list_objet_json = [];
	  		for(var r=0; r<feature_array.length; r++){
	  			var tmp = feature_array[r].clone();
	  			tmp.getGeometry().transform("EPSG:3857", "EPSG:4326");
	  			var object_geojson = GeoJSON_format.writeFeatureObject(tmp);
	  			list_objet_json.push(object_geojson);
	  		}

	  		map_element_worker.postMessage({'cmd': 'create_buffer_multi', 'arg': {
	  			'list_objet_json': list_objet_json,
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

	  				var id_feature_rank_2 = add_rank_2_clue_to_map(bufferedFeature.getGeometry(),buffer_fill_color,buffer_stroke_color,id_rank_clue_2);

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
//  						add_rank_3_clue_to_map(app.list_of_rank_3_clue[j]);
	  						create_rank_3_clue_raster(app.list_of_rank_3_clue[j]);
	  					}
	  				}


	  				redraw_clue_window();

	  			}

		$('#rank_2_buffer_parameters').css("display","none");
	};

}

/*
 * modify_buffer_from_window
 *
 * buffer modification from clue_window
 *
 * event: click event
 * clue_rank_2: rank_2 element
 * feature_2_id_array: array of id of features which form the buffer
 * feature_2_array: array of features which form the buffer
 * group_1_to_2: group_rank_1_to_rank_2 element
 * group_1: group_of_rank_1_clue element at the origin of the buffer creation
 * clue_1_array: array of rank_1_clue element at the origin of the buffer creation
 * feature_1_array: array of feature at the origin of the buffer creation
 *
 */
function modify_buffer_from_window(event,clue_rank_2,feature_2_id_array,feature_2_array,group_1_to_2,group_1,clue_1_array,feature_1_array){

	$('#rank_2_buffer_parameters').css("display","block");
	$('#rank_2_buffer_parameters').css("top",event.value.clientY + 'px');
	$('#rank_2_buffer_parameters').css("left",event.value.clientX + 'px');


	var feature_2_id = feature_2_id_array[0].id_object;

	var buffer_old = feature_2_array[0].getGeometry().clone();

	var feature_tp_suppress;
	for(var i =0; i < rank_2_clue_source.getFeatures().length; i++){
		if(rank_2_clue_source.getFeatures()[i].get('id') == feature_2_id){
			feature_tp_suppress = rank_2_clue_source.getFeatures()[i];
			break;
		}
	}

	var buffer_fill_color = feature_2_array[0].getStyle().getFill().getColor();
	var buffer_stroke_color = feature_2_array[0].getStyle().getStroke().getColor();

	rank_2_clue_source.removeFeature(feature_tp_suppress);

	add_draw_buffer_multi_polygon_to_map(feature_1_array, parseFloat($( "#rank_2_buffer_parameters_input_1" ).val()), parseFloat($( "#rank_2_buffer_parameters_input_2" ).val()), {units: "kilometres"},'draw_buffer_feature',buffer_fill_color,buffer_stroke_color);

  //construction du slider
	$( "#rank_2_buffer_parameters_sliders" ).slider({
	      range: true,
	      min: 0,
	      max: 10,
	      step: 0.05,
	      values: [ parseFloat($( "#rank_2_buffer_parameters_input_1" ).val()), parseFloat($( "#rank_2_buffer_parameters_input_2" ).val()) ],
	      slide: function( event, ui ) {

	    	  $( "#rank_2_buffer_parameters_input_1" ).val(ui.values[ 0 ]);
		        $( "#rank_2_buffer_parameters_input_2" ).val(ui.values[ 1 ]);

		        add_draw_buffer_multi_polygon_to_map(feature_1_array, parseFloat(ui.values[ 0 ]), parseFloat(ui.values[ 1 ]), {units: "kilometres"},'draw_buffer_feature',buffer_fill_color,buffer_stroke_color);

	      }
	    });


      $( "#rank_2_buffer_parameters_input_1" ).on("keydown",function(e){
    	  if(13==e.keyCode){
    		  $("#rank_2_buffer_parameters_sliders").slider('values', [$(this).val(),$( "#rank_2_buffer_parameters_input_2" ).val()]);

    		  add_draw_buffer_multi_polygon_to_map(feature_1_array, parseFloat($(this).val()), parseFloat($( "#rank_2_buffer_parameters_input_2" ).val()), {units: "kilometres"},'draw_buffer_feature',buffer_fill_color,buffer_stroke_color);

    	  }
      });

      $( "#rank_2_buffer_parameters_input_2" ).on("keydown",function(e){
    	  if(13==e.keyCode){
    		  $("#rank_2_buffer_parameters_sliders").slider('values', [$( "#rank_2_buffer_parameters_input_1" ).val(),$(this).val()]);

    		  add_draw_buffer_multi_polygon_to_map(feature_1_array, parseFloat($( "#rank_2_buffer_parameters_input_1" ).val()), parseFloat($(this).val()), {units: "kilometres"},'draw_buffer_feature',buffer_fill_color,buffer_stroke_color);

    	  }
      });


 launch_add_buffer.fct = function() {

    	  draw_source.clear();

    	  var GeoJSON_format = new ol.format.GeoJSON();
	  		var list_objet_json = [];
	  		for(var r=0; r<feature_1_array.length; r++){
	  			var tmp = feature_1_array[r].clone();
	  			tmp.getGeometry().transform("EPSG:3857", "EPSG:4326");
	  			var object_geojson = GeoJSON_format.writeFeatureObject(tmp);
	  			list_objet_json.push(object_geojson);
	  		}

	  		map_element_worker.postMessage({'cmd': 'create_buffer_multi', 'arg': {
	  			'list_objet_json': list_objet_json,
	  			'value_1': parseFloat($( "#rank_2_buffer_parameters_input_1" ).val()),
	  			'value_2': parseFloat($( "#rank_2_buffer_parameters_input_2" ).val()),
	  			'unit': {units: "kilometres"}
	  		}});

	  		map_element_worker.onmessage = function(e) {
	  			var bufferedFeature = GeoJSON_format.readFeature(e.data);
	  			bufferedFeature.getGeometry().transform("EPSG:4326", "EPSG:3857");

	  			var new_rank_2_clue_feature = new ol.Feature({
					id:feature_2_id,
					geometry: bufferedFeature.getGeometry()});


				new_rank_2_clue_feature.setStyle(new ol.style.Style({
				    fill: new ol.style.Fill({
				    	   color: buffer_fill_color
				    }),
				    stroke: new ol.style.Stroke({
				    	   color : buffer_stroke_color,
				    	   width : 4
				    	})
				  }));


				rank_2_clue_source.addFeature(new_rank_2_clue_feature);

				for(var i=0; i<app.list_group_rank_1_to_rank_2.length; i++){
					if(app.list_group_rank_1_to_rank_2[i].id_transform == group_1_to_2.id_transform){
						app.list_group_rank_1_to_rank_2[i].transform_parameters = $( "#rank_2_buffer_parameters_input_2" ).val() + " km";
						break;
					}
				}

				for(var i=0; i<app.list_of_rank_2_clue.length; i++){
					if(app.list_of_rank_2_clue[i].id_clue == clue_rank_2.id_clue){
						app.list_of_rank_2_clue[i].details = $( "#rank_2_buffer_parameters_input_2" ).val() + " km";
						break;
					}
				}

				if(app.list_of_rank_3_clue.length > 0){
					for(var j=0; j< app.list_of_rank_3_clue.length; j++){
//						add_rank_3_clue_to_map(app.list_of_rank_3_clue[j]);
  						create_rank_3_clue_raster(app.list_of_rank_3_clue[j]);
					}
				}

			redraw_clue_window();

	  		}


		$('#rank_2_buffer_parameters').css("display","none");
	};
}


/*
 * suppress_rank_1_clue_from_clue_window
 *
 * suppress rank 1 element from a right clic in clue window
 *
 * right_click_clue_element.value: right clic event
 *
 */
function suppress_rank_1_clue_from_clue_window(right_click_clue_element){

	var clue_id = right_click_clue_element.value.target.id.split('_')[0];
	var index=null;
	for(var i = 0; i< app.list_of_rank_1_clue.length; i++){
		if(app.list_of_rank_1_clue[i].id_clue == clue_id){
			index= i;
			break;
		}
	}

	for(var i =0; i< app.list_of_rank_1_clue[index].object_clue.length; i++){
		suppress_element_of_reference(app.list_of_rank_1_clue[index].object_clue[i].id_object);
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
 * suppress_itinary_rank_1_clue_from_clue_window
 *
 * suppress rank 1 itinary element from a right clic in clue window
 *
 * right_click_clue_element.value: right clic event
 *
 */
function suppress_itinary_rank_1_clue_from_clue_window(right_click_clue_element){

	var clue_id = right_click_clue_element.value.target.id.split('_')[0]

	var index=null;
	for(var i = 0; i< app.list_of_rank_1_clue.length; i++){
		if(app.list_of_rank_1_clue[i].id_clue == clue_id){
			index= i;
			break;
		}
	}

	for(var i =0; i< app.list_of_rank_1_clue[index].object_clue.length; i++){
		suppress_element_of_reference(app.list_of_rank_1_clue[index].object_clue[i].id_object);
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
 * suppress_rank_2_clue_from_clue_window
 *
 * suppress rank 2 element from a right clic in clue window
 *
 * right_click_clue_element.value: right clic event
 *
 */
function suppress_rank_2_clue_from_clue_window(right_click_clue_element){

	var clue_id = right_click_clue_element.value.target.id.split('_')[0];

	var index=null;
	for(var i = 0; i< app.list_of_rank_2_clue.length; i++){
		if(app.list_of_rank_2_clue[i].id_clue == clue_id){
			index= i;
			break;
		}
	}

	for(var i =0; i< app.list_of_rank_2_clue[index].object_clue.length; i++){
		suppress_rank_2_item(app.list_of_rank_2_clue[index].object_clue[i].id_object);
	}

	app.list_of_rank_2_clue.splice(index, 1);

	index = app.list_of_rank_2_clue_id.indexOf(clue_id);
	if (index > -1) {
		app.list_of_rank_2_clue_id.splice(index, 1);
	}


//	var group_index = null;
//	var group_id = null;
//	for(var i = 0; i< app.list_group_of_rank_2_clue.length; i++){
//
//			index = app.list_group_of_rank_2_clue[i].list_of_clue_id.indexOf(clue_id);
//			if (index > -1) {
//				app.list_group_of_rank_2_clue[i].list_of_clue_id.splice(index, 1);
//			}
//
//			group_index= i;;
//			group_id = app.list_group_of_rank_2_clue[i].id_group;
//
//			break;
//
//	}
//
//	if(group_index != null){
//		if(app.list_group_of_rank_2_clue[group_index].list_of_clue_id.length == 0){
//			index = app.list_group_of_rank_2_clue_id.indexOf(group_id);
//			if (index > -1) {
//				app.list_group_of_rank_2_clue_id.splice(index, 1);
//			}
//
//			app.list_group_of_rank_2_clue.splice(group_index, 1);
//
//		}
//	}

	var group_rank_1_to_rank_2_index = null
	var group_rank_1_to_rank_2_id_index = null

	//TODO bug suppression de group_rank_1_to_rank_2
	for(var i = 0; i< app.list_group_rank_1_to_rank_2.length; i++){
		if (app.list_group_rank_1_to_rank_2[i].id_rank_2 == clue_id) {
			group_rank_1_to_rank_2_index = i;
			group_rank_1_to_rank_2_id_index = app.list_group_rank_1_to_rank_2_id.indexOf(app.list_group_rank_1_to_rank_2[i].id_transform);
			break;
		}
	}

	app.list_group_rank_1_to_rank_2.splice(i, 1);
	app.list_group_rank_1_to_rank_2_id.splice(group_rank_1_to_rank_2_id_index, 1);



	if(app.list_of_rank_3_clue.length > 0){
		for(var j=0; j< app.list_of_rank_3_clue.length; j++){
			var rank_2_index;
			for(var a=0; a< app.list_of_rank_3_clue[j].list_id_clue_rank_2.length; a++){
				if(app.list_of_rank_3_clue[j].list_id_clue_rank_2[a].id_clue_rank_2 == clue_id){
					rank_2_index = a;
					break;
				}
			}
			app.list_of_rank_3_clue[j].list_id_clue_rank_2.splice(rank_2_index, 1);
//			add_rank_3_clue_to_map(app.list_of_rank_3_clue[j]);
				create_rank_3_clue_raster(app.list_of_rank_3_clue[j]);
		}
	}
	redraw_clue_window();
}

/*
 * create_rank_3_element
 *
 * create rank_3_element from rank_2_element selected or not
 *
 */
function create_rank_3_element(){

	var list_of_rank_2_element_id_selected = [];
	for(var i = 0; i< $(".clue_window_element").length; i++){
		var element = $(".clue_window_element")[i];
		if($(element).hasClass("rank_2_clue_container") && $(element).hasClass("selected_clue")){
			list_of_rank_2_element_id_selected.push(parseInt(element.id.split('_')[0]));
		}
	}

	var rank_3_element_color = getRandomColor();

	var color_1 = LightenDarkenColor(rank_3_element_color, 150);
	var color_2 = LightenDarkenColor(rank_3_element_color, -150);


	while (color_1.length < 7 || color_2.length < 7) {
		rank_3_element_color = getRandomColor();
		color_1 = LightenDarkenColor(rank_3_element_color, 150);
		color_2 = LightenDarkenColor(rank_3_element_color, -150);
		}

	//create id de l'élement rank 3
	var clue_3_id;
	if(app.list_of_rank_3_clue_id.length == 0){
		clue_3_id = 1;
	} else {
		clue_3_id = (Math.max(...app.list_of_rank_3_clue_id) + 1);
	}


	var list_of_rank_2_elements_in_rank_3 = [];
	for(var i = 0; i< app.list_of_rank_2_clue.length; i++){
		if(list_of_rank_2_element_id_selected.indexOf(app.list_of_rank_2_clue[i].id_clue) > -1){
			list_of_rank_2_elements_in_rank_3.push({'id_clue_rank_2': app.list_of_rank_2_clue[i].id_clue, 'selected': true});
		} else {
			list_of_rank_2_elements_in_rank_3.push({'id_clue_rank_2': app.list_of_rank_2_clue[i].id_clue, 'selected': false});
		}
	}

	//add new rank 3 element
	var rank_3_element = new rank_3_clue(clue_3_id, 0, list_of_rank_2_elements_in_rank_3, hexToRgb(rank_3_element_color),color_1,color_2);

	//put element on main map parameters
	var main_map_id = app.map_collection[0].id_map;
	for(var i= 0; i< app.small_multiple_map_id_array.length; i++){
		if(app.small_multiple_map_id_array[i].id_map == main_map_id){
			app.small_multiple_map_id_array[i].list_map_elements.push({"type_clue":3, "id_clue":clue_3_id})
			break;
		}
	}

	rank_3_clue_layer_source_array.push({
		'clue_id': clue_3_id,
		'source': null,
		'layer': null
		});


	//create rank 3 raster
	create_rank_3_clue_raster(rank_3_element);

	app.list_of_rank_3_clue.push(rank_3_element);
	app.list_of_rank_3_clue_id.push(clue_3_id);

	redraw_clue_window();


}



function create_rank_3_element_old(){

	var list_of_rank_2_element_id_selected = [];
	for(var i = 0; i< $(".clue_window_element").length; i++){
		var element = $(".clue_window_element")[i];
		if($(element).hasClass("rank_2_clue_container") && $(element).hasClass("selected_clue")){
			list_of_rank_2_element_id_selected.push(parseInt(element.id.split('_')[0]));
		}
	}

	var rank_3_element_color = hexToRgb(getRandomColor());

	//create id de l'élement rank 3
	var clue_3_id;
	if(app.list_of_rank_3_clue_id.length == 0){
		clue_3_id = 1;
	} else {
		clue_3_id = (Math.max(...app.list_of_rank_3_clue_id) + 1);
	}

	//create id de la feature de l'élement rank 3
	var feature_id;
	var feature_id_number;
	if(rank_1_clue_object_id_list.length == 0){
		feature_id_number = 1;
		var feature_id = "rank_3_element_" + clue_3_id +"_" + feature_id_number;
	} else {
		feature_id_number = Math.max(...rank_1_clue_object_id_list) + 1;
		feature_id = "rank_3_element_" + clue_3_id +"_" + feature_id_number;
	}

	var list_of_rank_2_elements_in_rank_3 = [];
	for(var i = 0; i< app.list_of_rank_2_clue.length; i++){
		if(list_of_rank_2_element_id_selected.indexOf(app.list_of_rank_2_clue[i].id_clue) > -1){
			list_of_rank_2_elements_in_rank_3.push({'id_clue_rank_2': app.list_of_rank_2_clue[i].id_clue, 'selected': true});
		} else {
			list_of_rank_2_elements_in_rank_3.push({'id_clue_rank_2': app.list_of_rank_2_clue[i].id_clue, 'selected': false});
		}
	}

	//add new rank 3 element
	var rank_3_element = new rank_3_clue(clue_3_id, feature_id, list_of_rank_2_elements_in_rank_3, rank_3_element_color);

	//put element on main map parameters
	var main_map_id = app.map_collection[0].id_map;
	for(var i= 0; i< app.small_multiple_map_id_array.length; i++){
		if(app.small_multiple_map_id_array[i].id_map == main_map_id){
			app.small_multiple_map_id_array[i].list_map_elements.push({"type_clue":3, "id_clue":clue_3_id})
			break;
		}
	}

	rank_3_clue_layer_source_array.push({
		'clue_id': clue_3_id,
		'source': null,
		'layer': null
		});

	rank_3_clue_layer_source_array[rank_3_clue_layer_source_array.length -1].source = new ol.source.Vector({});
	rank_3_clue_layer_source_array[rank_3_clue_layer_source_array.length -1].layer = new ol.layer.Vector({
		id:  "id_rank_3_" + clue_3_id + "_clue_layer",
		title: "rank_3_" + clue_3_id + "_clue_layer",
		source: rank_3_clue_layer_source_array[rank_3_clue_layer_source_array.length -1].source});

	rank_3_clue_layer_source_array[rank_3_clue_layer_source_array.length -1].layer.setZIndex(150);
	//create rank 3 feature
	add_rank_3_clue_to_map(rank_3_element);

	rank_3_clue_object_id_list.push(feature_id);

	app.list_of_rank_3_clue.push(rank_3_element);
	app.list_of_rank_3_clue_id.push(clue_3_id);

	redraw_clue_window();

	for(var p = 0; p < app.map_collection.length; p++){
		var small_multiple_map;
		for(var t=0; t<app.small_multiple_map_id_array.length; t++){
			if(app.small_multiple_map_id_array[t].id_map == app.map_collection[p].id_map){
				small_multiple_map = app.small_multiple_map_id_array[t];
				break;
			}
		}
		switch (app.map_collection[p].map) {
		  case 'map_1':
			  for(var t=0; t<small_multiple_map.list_map_elements.length; t++){
					if(small_multiple_map.list_map_elements[t].type_clue == 3 && small_multiple_map.list_map_elements[t].id_clue == rank_3_clue_layer_source_array[rank_3_clue_layer_source_array.length -1].clue_id){
						map_1.addLayer(rank_3_clue_layer_source_array[rank_3_clue_layer_source_array.length -1].layer);
						break;
					}
				}
			  break;
		  case 'map_2':
			  for(var t=0; t<small_multiple_map.list_map_elements.length; t++){
					if(small_multiple_map.list_map_elements[t].type_clue == 3 && small_multiple_map.list_map_elements[t].id_clue == rank_3_clue_layer_source_array[rank_3_clue_layer_source_array.length -1].clue_id){
						map_2.addLayer(rank_3_clue_layer_source_array[rank_3_clue_layer_source_array.length -1].layer);
						break;
					}
				}
			  break;
		  case 'map_3':
			  for(var t=0; t<small_multiple_map.list_map_elements.length; t++){
					if(small_multiple_map.list_map_elements[t].type_clue == 3 && small_multiple_map.list_map_elements[t].id_clue == rank_3_clue_layer_source_array[rank_3_clue_layer_source_array.length -1].clue_id){
						map_3.addLayer(rank_3_clue_layer_source_array[rank_3_clue_layer_source_array.length -1].layer);
						break;
					}
				}
			  break;
		  case 'map_4':
			  for(var t=0; t<small_multiple_map.list_map_elements.length; t++){
					if(small_multiple_map.list_map_elements[t].type_clue == 3 && small_multiple_map.list_map_elements[t].id_clue == rank_3_clue_layer_source_array[rank_3_clue_layer_source_array.length -1].clue_id){
						map_4.addLayer(rank_3_clue_layer_source_array[rank_3_clue_layer_source_array.length -1].layer);
						break;
					}
				}
			  break;
			 default:
				 break;
		}
	}

}


/*
 * suppress_rank_3_element
 *
 * suppress rank_3_element from right clic in clue window
 *
 * right_click_clue_element.value: clic event
 *
 */
function suppress_rank_3_element_old(right_click_clue_element){
	var rank_3_element_id = parseInt(right_click_clue_element.value.target.id.split('_')[0]);
	var rank_3_index;
	var id_rank_3_index = app.list_of_rank_3_clue_id.indexOf(rank_3_element_id);
	for(var j=0; j< app.list_of_rank_3_clue.length; j++){
		if(app.list_of_rank_3_clue[j].id_clue == rank_3_element_id){
			rank_3_index = j;
			break;
		}
	}
	suppress_rank_3_clue_to_map(app.list_of_rank_3_clue[rank_3_index]);
	app.list_of_rank_3_clue.splice(rank_3_index, 1);
	app.list_of_rank_3_clue_id.splice(id_rank_3_index, 1);
	redraw_clue_window();
}

function suppress_rank_3_element(right_click_clue_element){
	var rank_3_element_id = parseInt(right_click_clue_element.value.target.id.split('_')[0]);
	var rank_3_index;
	var id_rank_3_index = app.list_of_rank_3_clue_id.indexOf(rank_3_element_id);
	for(var j=0; j< app.list_of_rank_3_clue.length; j++){
		if(app.list_of_rank_3_clue[j].id_clue == rank_3_element_id){
			rank_3_index = j;
			break;
		}
	}
	suppress_rank_3_raster_from_map(app.list_of_rank_3_clue[rank_3_index]);
	app.list_of_rank_3_clue.splice(rank_3_index, 1);
	app.list_of_rank_3_clue_id.splice(id_rank_3_index, 1);
	redraw_clue_window();
}

export {initialize_clue_window,
	svg_clue_container,
	svg_container,
//	clue_window_scale_x,
//	clue_window_scale_y,
	right_click_clue_element,
	add_add_clue_menu_settings}
