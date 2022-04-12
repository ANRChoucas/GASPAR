import {app} from "./clue_element.js";
//import {map,
//	format,
//	objectMap,
//	turfItemMap} from "./choucas.js";
import {map_1,
	map_2,
	map_3,
	map_4,
	format,
	objectMap,
	turfItemMap,
	initialize_map,
	ZRI_extent} from "./choucas.js";
import {styleItem} from "./choucas_styling.js";
import {remove_all_clue_of_hover,
	put_clue_to_hover,
	hover_color_hexa,
	select_color_hexa} from "./clue_window.js";
import {clue_on_hover_source,
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
	modify_trajectory_point_from_map,
	object_of_interest_source,
	add_hide_layer} from "./add_clue_from_map.js";
import {getSelectedItemRefs} from "./choucas_itemtree.js";
import {Rainbow} from "./rainbow_vis.js";
import {hexToRgb} from "./color_function.js";

const raster_data_array= [];
//resolution, 50m?
const raster_resolution = 50;
/*
 * couche des objets d'intérêts apparaissant par le curseur
 */
const object_of_interest_hover_source = new ol.source.Vector({});
const object_of_interest_hover_layer = new ol.layer.Vector({
	id:  "element_hover_layer",
	title: "element_hover_layer",
	source: object_of_interest_hover_source
});
var list_feature_on_hover = [];

/*
 * webworker pour les calcul couteux de map_element.
 */
var map_element_worker = new Worker("./js/map_element_worker.js");


/*
 * initialize small multiple elements
 */

function initialize_small_multiples(){

	redraw_small_multiple_buttons();

	$('#map_window_add_button').on('click',function(){
		var map_id = app.small_multiple_map_id_array[app.small_multiple_map_id_array.length -1].id_map +1;
		app.small_multiple_map_id_array.push({
			"id_map":map_id,
			"name_map": "Carte " + map_id,
			"id_div":'map_window_map_button_' + map_id,
			"list_map_elements":[],
			"selected":false,
			"over_selected":false,
			"open":false
		});
		redraw_small_multiple_buttons();
	});


}

/*
 * ajout boutons small multiple
 */
function redraw_small_multiple_buttons(){
	var left_cursor = $( document ).width() - parseInt($('#map_container').css("width"));
	$('#map_window_map_button_container').empty();
	for(var i=0; i<app.small_multiple_map_id_array.length; i++){
		var html_selected;
		var html_open;
		if(app.small_multiple_map_id_array[i].selected == true){
			html_selected = "selected='selected'";
		} else if(app.small_multiple_map_id_array[i].over_selected == true) {
			html_selected = "over_selected='over_selected'";
		} else {
			html_selected = "";
		}
		if(app.small_multiple_map_id_array[i].open == true){
			html_open = "open";
		} else {
			html_open = "";
		}

		$('#map_window_map_button_container').append("" +
				"<div class='map_window_map_button " + html_open + "' id='" + 'map_window_map_button_' + app.small_multiple_map_id_array[i].id_map + "'>" +
				"<div class='map_window_map_button_header' id='" + 'map_window_map_button_header_' + app.small_multiple_map_id_array[i].id_map + "' " + html_selected + ">" + app.small_multiple_map_id_array[i].name_map + "</div>" +
				"<div class='map_window_map_button_content' id='" + 'map_window_map_button_content_' + app.small_multiple_map_id_array[i].id_map + "' " + html_selected + "></div>" +
						"</div>");

		$('#map_window_map_button_' + app.small_multiple_map_id_array[i].id_map).css("bottom",'0px');
		$('#map_window_map_button_' + app.small_multiple_map_id_array[i].id_map).css("left",left_cursor + 'px');
		left_cursor = left_cursor + 136;

		if(app.small_multiple_map_id_array[i].open == true){
			$('#map_window_map_button_content_' + app.small_multiple_map_id_array[i].id_map).css("height",'150px');

			var content_html = "";
			if(app.list_of_rank_1_clue.length > 0 || app.list_of_rank_2_clue.length  > 0){
				var html_checked = "";
				for(var h=0; h<app.small_multiple_map_id_array[i].list_map_elements.length; h++){
					if(app.small_multiple_map_id_array[i].list_map_elements[h].type_clue == 1 || app.small_multiple_map_id_array[i].list_map_elements[h].type_clue == 2){
						html_checked ="checked";
						break;
					}
				}
				content_html = content_html + "<div><input type='checkbox' class='map_window_map_button_content_checkbox map_window_map_button_content_checkbox_" + app.small_multiple_map_id_array[i].id_map + "' id='map_window_map_button_content_checkbox_" + app.small_multiple_map_id_array[i].id_map + "_" + 12 + "' name='elt_ref' " + html_checked + "> <label for='elt_ref'>Elts de Ref.</label></div>"
			}

			for(var j =0; j< app.list_of_rank_3_clue.length; j++){
				var html_checked = "";
				for(var h=0; h<app.small_multiple_map_id_array[i].list_map_elements.length; h++){
					if(app.small_multiple_map_id_array[i].list_map_elements[h].type_clue == 3 && app.small_multiple_map_id_array[i].list_map_elements[h].id_clue == app.list_of_rank_3_clue[j].id_clue){
						html_checked ="checked";
						break;
					}
				}
				content_html = content_html + "<div><input type='checkbox' class='map_window_map_button_content_checkbox map_window_map_button_content_checkbox_" + app.small_multiple_map_id_array[i].id_map + "' id='map_window_map_button_content_checkbox_" + app.small_multiple_map_id_array[i].id_map + "_" + 3 + "_" + app.list_of_rank_3_clue[j].id_clue + "' name='ZLP' " + html_checked + "> <label for='ZLP'>ZLP " + app.list_of_rank_3_clue[j].id_clue + "</label></div>"
			}
			content_html = content_html + "<div><input type='button' class='map_window_map_button_content_close_button' id='map_window_map_button_content_close_button_" + app.small_multiple_map_id_array[i].id_map + "' value='supprimer carte'></div>"

			$('#map_window_map_button_content_' + app.small_multiple_map_id_array[i].id_map).html(content_html);

			var element_suppress_id = app.small_multiple_map_id_array[i].id_map;
			$("#map_window_map_button_content_close_button_" + element_suppress_id).on("click", function(){
				suppress_map(element_suppress_id);
			});

			var element_id_main = app.small_multiple_map_id_array[i].id_map;

			$(".map_window_map_button_content_checkbox_" + element_id_main).on("click", function(){
				if($(this).is(':checked') == true){
					if(parseInt(this.id.split('_')[7]) == 12){
						for(var i=0; i < app.small_multiple_map_id_array.length; i++){
							if(app.small_multiple_map_id_array[i].id_map == element_id_main){
								app.small_multiple_map_id_array[i].list_map_elements.push({"type_clue": 1});
								app.small_multiple_map_id_array[i].list_map_elements.push({"type_clue": 2});
								break;
							}
						}
					} else if(parseInt(this.id.split('_')[7]) == 3) {
						for(var i=0; i < app.small_multiple_map_id_array.length; i++){
							if(app.small_multiple_map_id_array[i].id_map == element_id_main){
								app.small_multiple_map_id_array[i].list_map_elements.push({"type_clue": 3, "id_clue" : parseInt(this.id.split('_')[8])});
								break;
							}
						}
					}
				} else {
					if(parseInt(this.id.split('_')[7]) == 12){
						for(var i=0; i < app.small_multiple_map_id_array.length; i++){
							if(app.small_multiple_map_id_array[i].id_map == element_id_main){
								var remove_index_1;
								var remove_index_2;
								for(var g=0; g< app.small_multiple_map_id_array[i].list_map_elements.length; g++){
									if(app.small_multiple_map_id_array[i].list_map_elements[g].type_clue == 1 || app.small_multiple_map_id_array[i].list_map_elements[g].type_clue == 2){
										remove_index_1 = g;
										break;
									}
								}
								app.small_multiple_map_id_array[i].list_map_elements.splice(remove_index_1, 1);
								for(var g=0; g< app.small_multiple_map_id_array[i].list_map_elements.length; g++){
									if(app.small_multiple_map_id_array[i].list_map_elements[g].type_clue == 1 || app.small_multiple_map_id_array[i].list_map_elements[g].type_clue == 2){
										remove_index_2 = g;
										break;
									}
								}
								app.small_multiple_map_id_array[i].list_map_elements.splice(remove_index_2, 1);
								break;
							}
						}
					} else if(parseInt(this.id.split('_')[7]) == 3) {
						for(var i=0; i < app.small_multiple_map_id_array.length; i++){
							if(app.small_multiple_map_id_array[i].id_map == element_id_main){
								var remove_index;
								for(var g=0; g< app.small_multiple_map_id_array[i].list_map_elements.length; g++){
									if(app.small_multiple_map_id_array[i].list_map_elements[g].type_clue == 3 && app.small_multiple_map_id_array[i].list_map_elements[g].id_clue == parseInt(this.id.split('_')[8])){
										remove_index = g;
										break;
									}
								}
								app.small_multiple_map_id_array[i].list_map_elements.splice(remove_index, 1);
								break;
							}
						}
					}
				}
			});


		} else {
			$('#map_window_map_button_content_' + app.small_multiple_map_id_array[i].id_map).css("height",'0px');
		}

	}

	$('#map_window_add_button').css("bottom",'0px');
	$('#map_window_add_button').css("left",left_cursor + 'px');
	if(app.small_multiple_map_id_array.length > 3){
		$('#map_window_add_button').css("display", 'none');
	} else {
		$('#map_window_add_button').css("display", 'block');
	}

	$('.map_window_map_button').on('contextmenu', function (evt) {
		evt.preventDefault();
		if($(this).hasClass("open")){
			$(this).find( ".map_window_map_button_content" ).animate({
			    opacity: 1,
			    height: "0px"
			  }, 500)
			$(this).removeClass("open");

			var element_id = parseInt(this.id.split('_')[4]);
			for(var i=0; i < app.small_multiple_map_id_array.length; i++){
				if(app.small_multiple_map_id_array[i].id_map == element_id){
					app.small_multiple_map_id_array[i].open = false;
				}
			}
			$(this).find( ".map_window_map_button_content" ).empty();

		} else {
			$(this).find( ".map_window_map_button_content" ).animate({
			    opacity: 1,
			    height: "150px"
			  }, 500)

			$(this).addClass( "open" )
			var element_id = parseInt(this.id.split('_')[4]);
			var element;
			for(var i=0; i < app.small_multiple_map_id_array.length; i++){
				if(app.small_multiple_map_id_array[i].id_map == element_id){
					app.small_multiple_map_id_array[i].open = true;
					element = app.small_multiple_map_id_array[i];
					break;
				}
			}

			var content_html = "";
			if(app.list_of_rank_1_clue.length > 0 || app.list_of_rank_2_clue.length  > 0){
				var html_checked = "";
				for(var h=0; h<element.list_map_elements.length; h++){
					if(element.list_map_elements[h].type_clue == 1 || element.list_map_elements[h].type_clue == 2){
						html_checked ="checked";
						break;
					}
				}
				content_html = content_html + "<div><input type='checkbox' class='map_window_map_button_content_checkbox map_window_map_button_content_checkbox_" + element_id + "' id='map_window_map_button_content_checkbox_" + element_id + "_" + 12 + "' name='elt_ref' " + html_checked + "> <label for='elt_ref'>Elts de Ref.</label></div>"
			}

			for(var j =0; j< app.list_of_rank_3_clue.length; j++){
				var html_checked = "";
				for(var h=0; h<element.list_map_elements.length; h++){
					if(element.list_map_elements[h].type_clue == 3 && element.list_map_elements[h].id_clue == app.list_of_rank_3_clue[j].id_clue){
						html_checked ="checked";
						break;
					}
				}
				content_html = content_html + "<div><input type='checkbox' class='map_window_map_button_content_checkbox map_window_map_button_content_checkbox_" + element_id + "' id='map_window_map_button_content_checkbox_" + element_id + "_" + 3 + "_" + app.list_of_rank_3_clue[j].id_clue + "' name='ZLP' " + html_checked + "> <label for='ZLP'>ZLP " + app.list_of_rank_3_clue[j].id_clue + "</label></div>"
			}
			content_html = content_html + "<div><input type='button' class='map_window_map_button_content_close_button' id='map_window_map_button_content_close_button_" + element_id + "' value='supprimer carte'></div>"
			$(this).find( ".map_window_map_button_content" ).html(content_html);

			$("#map_window_map_button_content_close_button_" + element_id).on("click", function(){
				suppress_map(element_id);
			});

			$(".map_window_map_button_content_checkbox_" + element_id).on("click", function(){

				if($(this).is(':checked') == true){
					if(parseInt(this.id.split('_')[7]) == 12){
						for(var i=0; i < app.small_multiple_map_id_array.length; i++){
							if(app.small_multiple_map_id_array[i].id_map == element_id){
								app.small_multiple_map_id_array[i].list_map_elements.push({"type_clue": 1});
								app.small_multiple_map_id_array[i].list_map_elements.push({"type_clue": 2});
								break;
							}
						}
						add_hide_layer(element_id,"show",12,null);
					} else if(parseInt(this.id.split('_')[7]) == 3) {
						for(var i=0; i < app.small_multiple_map_id_array.length; i++){
							if(app.small_multiple_map_id_array[i].id_map == element_id){
								app.small_multiple_map_id_array[i].list_map_elements.push({"type_clue": 3, "id_clue" : parseInt(this.id.split('_')[8])});
								break;
							}
						}
						add_hide_layer(element_id,"show",3,parseInt(this.id.split('_')[8]));
					}
				} else {
					if(parseInt(this.id.split('_')[7]) == 12){
						for(var i=0; i < app.small_multiple_map_id_array.length; i++){
							if(app.small_multiple_map_id_array[i].id_map == element_id){
								var remove_index_1;
								var remove_index_2;
								for(var g=0; g< app.small_multiple_map_id_array[i].list_map_elements.length; g++){
									if(app.small_multiple_map_id_array[i].list_map_elements[g].type_clue == 1 || app.small_multiple_map_id_array[i].list_map_elements[g].type_clue == 2){
										remove_index_1 = g;
										break;
									}
								}
								app.small_multiple_map_id_array[i].list_map_elements.splice(remove_index_1, 1);
								for(var g=0; g< app.small_multiple_map_id_array[i].list_map_elements.length; g++){
									if(app.small_multiple_map_id_array[i].list_map_elements[g].type_clue == 1 || app.small_multiple_map_id_array[i].list_map_elements[g].type_clue == 2){
										remove_index_2 = g;
										break;
									}
								}
								app.small_multiple_map_id_array[i].list_map_elements.splice(remove_index_2, 1);
								break;
							}
						}
						add_hide_layer(element_id,"hide",12,null);
					} else if(parseInt(this.id.split('_')[7]) == 3) {
						for(var i=0; i < app.small_multiple_map_id_array.length; i++){
							if(app.small_multiple_map_id_array[i].id_map == element_id){
								var remove_index;
								for(var g=0; g< app.small_multiple_map_id_array[i].list_map_elements.length; g++){
									if(app.small_multiple_map_id_array[i].list_map_elements[g].type_clue == 3 && app.small_multiple_map_id_array[i].list_map_elements[g].id_clue == parseInt(this.id.split('_')[8])){
										remove_index = g;
										break;
									}
								}
								app.small_multiple_map_id_array[i].list_map_elements.splice(remove_index, 1);
								break;
							}
						}
						add_hide_layer(element_id,"hide",3,parseInt(this.id.split('_')[8]));
					}
				}
			});
		}
		if(app.small_multiple_map_id_array.length == 1){
			$('.map_window_map_button_content_close_button').css("display", 'none');
		} else if(app.small_multiple_map_id_array.length > 1){
			$('.map_window_map_button_content_close_button').css("display", 'block');
		}
	});

	//changement carte sélectionnée
	$('.map_window_map_button').on("click", function(evt){
		if($(evt.target).hasClass("map_window_map_button_content_checkbox") == false){
			if(evt.shiftKey) {
				if($(this).find(".map_window_map_button_header").attr("selected")== "selected"){
					//carte déjà mis dans la main map (map_1), ne rien faire
				} else {
					if($(this).find(".map_window_map_button_header").attr("over_selected")== "over_selected"){
						//carte déjà mis en tant que small multiple, retirer cette carte et ce small multiple de l'interface, repasser cette carte en non selected
						var element_id = parseInt(this.id.split('_')[4]);
						for(var i= 0; i< app.small_multiple_map_id_array.length; i++){
							if(app.small_multiple_map_id_array[i].id_map == element_id){
								app.small_multiple_map_id_array[i].over_selected = false;
								break;
							}
						}
						$("#map_window_map_button_header_" + element_id).removeAttr("over_selected");
						$("#map_window_map_button_content_" + element_id).removeAttr("over_selected");

						/*
						 * remove small multiple map
						 */
						var index_map_collection_to_remove;
						for(var h =0; h < app.map_collection.length; h++){
							if(app.map_collection[h].id_map == element_id){
								index_map_collection_to_remove = h;
							}
						}
						app.map_collection.splice(index_map_collection_to_remove,1);

						app.map_collection[0].map = 'map_1';
						if(app.map_collection.length == 2){
							app.map_collection[1].map = 'map_2';
						} else if(app.map_collection.length == 3){
							app.map_collection[1].map = 'map_2';
							app.map_collection[2].map = 'map_3';
						} else if(app.map_collection.length == 4){
							app.map_collection[1].map = 'map_2';
							app.map_collection[2].map = 'map_3';
							app.map_collection[3].map = 'map_4';
						}

						initialize_map(map_1.getView());

					} else {
						//carte non sélectionnée et non mise en small multiple, intégrer cette carte dans un small multiple et ajouter ce small multiple à l'interface, passer cette carte en over_selected
						var element_id = parseInt(this.id.split('_')[4]);
						for(var i= 0; i< app.small_multiple_map_id_array.length; i++){
							if(app.small_multiple_map_id_array[i].id_map == element_id){
								app.small_multiple_map_id_array[i].over_selected = true;
								break;
							}
						}
						$("#map_window_map_button_header_" + element_id).attr("over_selected","over_selected");
						$("#map_window_map_button_content_" + element_id).attr("over_selected","over_selected");

						/*
						 * add small multiple map
						 */
						var new_map_collection_index = app.map_collection.length + 1;
						app.map_collection.push({
							  "map":'map_' + new_map_collection_index,
								"id_map":element_id,
								"name_map": "Carte " + element_id
							});
						initialize_map(map_1.getView());
					}
				}

			} else {
				if($(this).find(".map_window_map_button_header").attr("selected")== "selected" || $(this).find(".map_window_map_button_header").attr("over_selected")== "over_selected"){
					//carte déjà mis dans la main map (map_1), ou en small multiple (overselected)
				} else {
					//carte non sélectionnée, intégrer cette carte dans la main map (map_1), passer cette carte en selected
					var element_id = parseInt(this.id.split('_')[4]);
					for(var i= 0; i< app.small_multiple_map_id_array.length; i++){
						if(app.small_multiple_map_id_array[i].id_map == element_id){
							app.small_multiple_map_id_array[i].selected = true;
							break;
						}
					}
					$("#map_window_map_button_header_" + element_id).attr("selected","selected");
					$("#map_window_map_button_content_" + element_id).attr("selected","selected");
					var main_map_id = app.map_collection[0].id_map;
					for(var i= 0; i< app.small_multiple_map_id_array.length; i++){
						if(app.small_multiple_map_id_array[i].id_map == main_map_id){
							app.small_multiple_map_id_array[i].selected = false;
							break;
						}
					}
					$("#map_window_map_button_header_" + main_map_id).removeAttr("selected");
					$("#map_window_map_button_content_" + main_map_id).removeAttr("selected");

					/*
					 * change main map
					 */
					app.map_collection[0].id_map = element_id;
					app.map_collection[0].name_map = "Carte " + element_id;
					initialize_map(map_1.getView());
//					if(app.map_collection.length == 1){
//						app.map_collection[0].id_map = element_id;
//						app.map_collection[0].name_map = "Carte " + element_id;
//						initialize_map(map_1.getView());
//					}
				}
			}
		}
	});
}


/*
 * suppression carte
 */
function suppress_map(element_id){
	var index;
	var selected;
	var over_selected;
	for(var g=0; g<app.small_multiple_map_id_array.length; g++){
		if(app.small_multiple_map_id_array[g].id_map == element_id){
			index = g;
			selected = app.small_multiple_map_id_array[g].selected;
			over_selected = app.small_multiple_map_id_array[g].over_selected;
			break;
		}
	}
	app.small_multiple_map_id_array.splice(index,1);

	if(selected == true){
		//change main map with an unselected map
		//if there is no available unselected map, suppress first small map and put it on main map
		//redraw map
		//redraw_button
		var new_main_map = false;
		for(var a=0; a<app.small_multiple_map_id_array.length; a++){
			if(app.small_multiple_map_id_array[a].over_selected == false){
				app.small_multiple_map_id_array[a].selected = true;
				for(var b=0; b<app.map_collection.length; b++){
					if(app.map_collection[b].map == 'map_1'){
						app.map_collection[b].id_map = app.small_multiple_map_id_array[a].id_map;
						app.map_collection[b].name_map = 'Carte ' + app.small_multiple_map_id_array[a].id_map;
						break;
					}
				}
				new_main_map = true;
				break;
			}
		}

		if(new_main_map == false){
			app.small_multiple_map_id_array[0].over_selected = false;
			app.small_multiple_map_id_array[0].selected = true;
			var small_map_to_remove;
			for(var c=0; c<app.map_collection.length; c++){
				if(app.map_collection[c].id_map == app.small_multiple_map_id_array[0].id_map){
					small_map_to_remove = c;
					break;
				}
			}
			for(var b=0; b<app.map_collection.length; b++){
				if(app.map_collection[b].map == 'map_1'){
					app.map_collection[b].id_map = app.small_multiple_map_id_array[0].id_map;
					app.map_collection[b].name_map = 'Carte ' + app.small_multiple_map_id_array[0].id_map;
					break;
				}
			}
			app.map_collection.splice(small_map_to_remove,1);
			app.map_collection[0].map = 'map_1';
			if(app.map_collection.length == 2){
				console.log(2)
				app.map_collection[1].map = 'map_2';
			} else if(app.map_collection.length == 3){
				console.log(3)
				app.map_collection[1].map = 'map_2';
				app.map_collection[2].map = 'map_3';
			} else if(app.map_collection.length == 4){
				console.log(4)
				app.map_collection[1].map = 'map_2';
				app.map_collection[2].map = 'map_3';
				app.map_collection[3].map = 'map_4';
			}
		}
		initialize_map(map_1.getView());
		redraw_small_multiple_buttons();
	} else if(over_selected == true){
		//suppress corresponding small maps
		//redraw map
		//redraw_button
		var over_selected_index;
		for(var g=0; g<app.map_collection.length; g++){
			if(app.map_collection[g].id_map == element_id){
				over_selected_index = g;
				break;
			}
		}
		app.map_collection.splice(over_selected_index,1);
		app.map_collection[0].map = 'map_1';
		if(app.map_collection.length == 2){
			app.map_collection[1].map = 'map_2';
		} else if(app.map_collection.length == 3){
			app.map_collection[1].map = 'map_2';
			app.map_collection[2].map = 'map_3';
		} else if(app.map_collection.length == 4){
			app.map_collection[1].map = 'map_2';
			app.map_collection[2].map = 'map_3';
			app.map_collection[3].map = 'map_4';
		}
		initialize_map(map_1.getView());
		redraw_small_multiple_buttons();
	} else {
		//redraw button
		redraw_small_multiple_buttons();
	}

}



/*
 * create_trajectory_point
 *
 * add trajectory point feature on map
 * pixel_point: pixel coordinate of the feature
 * color: color of the feature
 * id_clue: id of the corresponding rank 1 element
 * return id of the feature and feature on geojson format
 */
function create_trajectory_point(pixel_point,color,id_clue,image_url){
	//TODO small multiple
	//création de l'id de la feature openlayers
	var object_id;
	var object_id_number;

	if(rank_1_clue_object_id_list.length == 0){
		object_id_number = 1;
		var object_id = "trajectory_point_" + object_id_number;
	} else {
		object_id_number = Math.max(...rank_1_clue_object_id_list) + 1;
		object_id = "trajectory_point_" + object_id_number;
	}

	rank_1_clue_object_id_list.push(object_id_number);


	//création de la feature openlayers
	var trajectory_point_feature = new ol.Feature({
		id: object_id,
		geometry: new ol.geom.Point(pixel_point),
		id_clue:id_clue});

//	var trajectory_style = new ol.style.Style({
//        image: new ol.style.Circle({
//            radius: 10,
//            fill: new ol.style.Fill({color: color}),
//            stroke: new ol.style.Stroke({color: color, width: 1})
//          })
//        });

	var trajectory_style = new ol.style.Style({
	      image: new ol.style.Icon({
	          anchor: [0, 1],
	          size: [256, 256],
	          offset: [0, 0],
	          opacity: 1,
	          scale: 0.15,
	          src: image_url
	      })
      });

	trajectory_point_feature.setStyle(trajectory_style);

	rank_1_clue_source.addFeature(trajectory_point_feature);


	//ajout de l'intéraction par drag & drop
	var drag_and_drop = new ol.interaction.Translate({
		features: new ol.Collection([trajectory_point_feature])
	});

	for(var p = 0; p < app.map_collection.length; p++){
			switch (app.map_collection[p].map) {
			case 'map_1':
				map_1.addInteraction(drag_and_drop);
				   break;
			case 'map_2':
				map_2.addInteraction(drag_and_drop);
				   break;
			case 'map_3':
				map_3.addInteraction(drag_and_drop);
				   break;
			case 'map_4':
				map_4.addInteraction(drag_and_drop);
				   break;
			default:

			}
		}

	//modification de la feature par drag & drop
	trajectory_point_feature.on('change',function(){
		modify_trajectory_point_from_map(this.get('id_clue'), this.getGeometry().getCoordinates(),object_id);
    },trajectory_point_feature);

	var tmp = trajectory_point_feature.clone()
	tmp.getGeometry().transform("EPSG:3857", "EPSG:4326");
	var f_json = format.writeFeatureObject(tmp);

	//retour de l'id de la feature
	return {"id_object": object_id, "geojson": f_json, "style": trajectory_style.clone()};

}


/*
 * suppress_trajectory_point
 *
 * suppress trajectory point feature from map
 * id_object: id of the feature
 */
function suppress_trajectory_point(id_object){

	//récupération de la feature openlayers
	var feature;
	for(var i =0; i< rank_1_clue_source.getFeatures().length; i++){
		if(rank_1_clue_source.getFeatures()[i].get('id') == id_object){
			feature = rank_1_clue_source.getFeatures()[i];
			break;
		}
	}

	//suppression de la feature
	rank_1_clue_source.removeFeature(feature);

	//suppression de la liste d'id
	var object_id_number = parseInt(id_object.split('_')[2]);

	var index = rank_1_clue_object_id_list.indexOf(object_id_number);
	if (index > -1) {
		rank_1_clue_object_id_list.splice(index, 1);
	}

}

/*
 * add_element_of_reference
 *
 * add object of interest as feature of rank 1 element on on map
 * id_clue: id of the corresponding rank 1 element
 * item_feature: feature of the object of interest
 * return id of the feature and feature on geojson format
 */
function add_element_of_reference(id_clue,item_feature){

	//calcul de l'id de la feature openlayers
	var object_id;
	var object_id_number;
	if(rank_1_clue_object_id_list.length == 0){
		object_id_number = 1;
		var object_id = "element_of_reference_" + object_id_number;
	} else {
		object_id_number = Math.max(...rank_1_clue_object_id_list) + 1;
		object_id = "element_of_reference_" + object_id_number;
	}

	rank_1_clue_object_id_list.push(object_id_number);

	//création de la feature openlayers
	var object_of_interest_feature = new ol.Feature({
		id: object_id,
		geometry: item_feature.getGeometry().clone(),
		id_clue:id_clue});

	if(item_feature.getStyle() != null){
		styleItem(item_feature,"hover");
		object_of_interest_feature.setStyle(item_feature.getStyle().clone());
	} else {
		styleItem(item_feature,"hover");
		object_of_interest_feature.setStyle(item_feature.getStyle().clone());
	}

	rank_1_clue_source.addFeature(object_of_interest_feature);

	var tmp = object_of_interest_feature.clone()
	tmp.getGeometry().transform("EPSG:3857", "EPSG:4326");
	var f_json = format.writeFeatureObject(tmp);

	//retour de l'id de la feature
	return {"id_object": object_id, "geojson": f_json, "style": item_feature.getStyle().clone()};
}

function add_element_of_reference_itinary(id_clue,item_feature,color){

	//calcul de l'id de la feature openlayers
	var object_id;
	var object_id_number;
	if(rank_1_clue_object_id_list.length == 0){
		object_id_number = 1;
		var object_id = "element_of_reference_" + object_id_number;
	} else {
		object_id_number = Math.max(...rank_1_clue_object_id_list) + 1;
		object_id = "element_of_reference_" + object_id_number;
	}

	rank_1_clue_object_id_list.push(object_id_number);

	//création de la feature openlayers
	var object_of_interest_feature = new ol.Feature({
		id: object_id,
		geometry: item_feature.getGeometry().clone(),
		id_clue:id_clue});

	var stroke_color = "rgba(" + color.r + "," + color.g + "," + color.b + ",1)";
	var fill_color = "rgba(" + color.r + "," + color.g + "," + color.b + ",0)";

	if(item_feature.getStyle() != null){
		object_of_interest_feature.setStyle(new ol.style.Style({
	        image: new ol.style.Circle({
	            radius: 6,
	            fill: new ol.style.Fill({color: fill_color}),
	            stroke: new ol.style.Stroke({
	            	color: stroke_color,
	            	width: 6
	            	})
	          })
	        }));
	} else {
		object_of_interest_feature.setStyle(new ol.style.Style({
	        image: new ol.style.Circle({
	            radius: 15,
	            fill: new ol.style.Fill({color: fill_color}),
	            stroke: new ol.style.Stroke({
	            	color: stroke_color,
	            	width: 2
	            	})
	          })
	        }));
	}

	rank_1_clue_source.addFeature(object_of_interest_feature);


	var tmp = object_of_interest_feature.clone()
	tmp.getGeometry().transform("EPSG:3857", "EPSG:4326");
	var f_json = format.writeFeatureObject(tmp);

	//retour de l'id de la feature
	return {"id_object": object_id, "geojson": f_json, "style": item_feature.getStyle().clone()};
}


/*
 * suppress_element_of_reference
 *
 * suppress object of interest from map
 * id_object: id of the feature of rank 1 element
 */
function suppress_element_of_reference(id_object){

	//récupérer la feature
	var feature;
	for(var i =0; i < rank_1_clue_source.getFeatures().length; i++){
		if(rank_1_clue_source.getFeatures()[i].get('id') == id_object){
			feature = rank_1_clue_source.getFeatures()[i];
			break;
		}
	}
	rank_1_clue_source.removeFeature(feature);

	//supprimer l'id de la feature
	var object_id_number = parseInt(id_object.split('_')[3]);
	var index = rank_1_clue_object_id_list.indexOf(object_id_number);
	if (index > -1) {
		rank_1_clue_object_id_list.splice(index, 1);
	}

}


/*
 * suppress_rank_2_item
 *
 * suppress rank 2 element feature from map
 * id_object: id of the feature of rank 2 element
 */
function suppress_rank_2_item(id_object){

	//récupérer la feature
	var feature;
	var id_clue;
	for(var i =0; i < rank_2_clue_source.getFeatures().length; i++){
		if(rank_2_clue_source.getFeatures()[i].get('id') == id_object){
			feature = rank_2_clue_source.getFeatures()[i];
			id_clue = feature.get('id_clue');
			break;
		}
	}
	rank_2_clue_source.removeFeature(feature);

	//supprimer l'id de la feature
	var object_id_number = parseInt(id_object.split('_')[4]);
	var index = rank_2_clue_object_id_list.indexOf(object_id_number);
	if (index > -1) {
		rank_2_clue_object_id_list.splice(index, 1);
	}

	remove_raster_from_raster_array(id_clue);

}

function show_hide_clue_objects(clue_element, rank, hide_show){

	for(var j=0; j<clue_element.object_clue.length; j++){
		var id_object = clue_element.object_clue[j].id_object;
		var style = clue_element.object_clue[j].style;
		var feature;
		if(rank == 1){
			for(var i =0; i < rank_1_clue_source.getFeatures().length; i++){
				if(rank_1_clue_source.getFeatures()[i].get('id') == id_object){
					feature = rank_1_clue_source.getFeatures()[i];
					break;
				}
			}
		} else if(rank == 2){
			for(var i =0; i < rank_2_clue_source.getFeatures().length; i++){
				if(rank_2_clue_source.getFeatures()[i].get('id') == id_object){
					feature = rank_2_clue_source.getFeatures()[i];
					break;
				}
			}
		}

		if(hide_show == 'show'){
			feature.setStyle(style);
		} else if(hide_show == 'hide'){
			switch (feature.getGeometry().getType()) {
			  case 'Point':
				  feature.setStyle(new ol.style.Style({
			             image: new ol.style.Circle({
			                 radius: 5,
			                 fill: new ol.style.Fill({
			                   color: "rgba(0,0,0,0)"
			                 })
			               })
			             }));
			    break;
			  case 'LineString':
				  feature.setStyle(new ol.style.Style({
	                  stroke: new ol.style.Stroke({
	                      color: "rgba(0,0,0,0)",
	                      width: 3
	                    })
	                  }));
				    break;
			  case 'Polygon':
				  feature.setStyle(new ol.style.Style({
		               fill: new ol.style.Fill({
		                   color: "rgba(0,0,0,0)"
		                 })
		               }));
				    break;
			  case 'MultiPolygon':
				  feature.setStyle(new ol.style.Style({
		               fill: new ol.style.Fill({
		                   color: "rgba(0,0,0,0)"
		                 })
		               }));
				    break;
			  default:
				  feature.setStyle(new ol.style.Style({
		               fill: new ol.style.Fill({
		                   color: "rgba(0,0,0,0)"
		                 })
		               }));
			}

		}

	}

}


/*
 * clear_clue_to_hover_state
 *
 * suppress graphic hover state of all rank 1 elements on map
 */
function clear_clue_to_hover_state(){
	clue_on_hover_source.clear();
}

/*
 * add_clue_to_hover_state
 *
 * add graphic hover state on one rank 1 element feature on map
 * id_object: id of the rank 1 element feature
 */
function add_clue_to_hover_state(id_object){

	var feature;

	if(id_object.split('_')[0] == "trajectory" && id_object.split('_')[1] == "point"){
		for(var i =0; i < rank_1_clue_source.getFeatures().length; i++){
			if(rank_1_clue_source.getFeatures()[i].get('id') == id_object){
				feature = rank_1_clue_source.getFeatures()[i];
				break;
			}
		}
	} else if(id_object.split('_')[0] == "element" && id_object.split('_')[1] == "of" && id_object.split('_')[2] == "reference"){
		for(var i =0; i < rank_1_clue_source.getFeatures().length; i++){
			if(rank_1_clue_source.getFeatures()[i].get('id') == id_object){
				feature = rank_1_clue_source.getFeatures()[i];
				break;
			}
		}
	} else if(id_object.split('_')[0] == "rank" && id_object.split('_')[1] == "2"){
		for(var i =0; i < rank_2_clue_source.getFeatures().length; i++){
			if(rank_2_clue_source.getFeatures()[i].get('id') == id_object){
				feature = rank_2_clue_source.getFeatures()[i];
				break;
			}
		}
	} else if(id_object.split('_')[0] == "rank" && id_object.split('_')[1] == "3"){
		var id_clue_3 = parseInt(id_object.split('_')[3]);

		for(var p=0; p<rank_3_clue_layer_source_array.length; p++){
			if(rank_3_clue_layer_source_array[p].clue_id == id_clue_3){
				for(var i =0; i < rank_3_clue_layer_source_array[p].source.getFeatures().length; i++){
					if(rank_3_clue_layer_source_array[p].source.getFeatures()[i].get('id') == id_object){
						feature = rank_3_clue_layer_source_array[p].source.getFeatures()[i];
						break;
					}
				}
				break;
			}
		}

	}


	var hover_feature;


	if(feature.getGeometry().getType() == "Point"){
		hover_feature = new ol.Feature({
			geometry: feature.getGeometry().clone()
			});

		hover_feature.setStyle(new ol.style.Style({
	        image: new ol.style.Circle({
	            radius: 15,
	            fill: new ol.style.Fill({color: "rgba(0,0,0,0)"}),
	            stroke: new ol.style.Stroke({color: hover_color_hexa, width: 4})
	          })
	        }));
	}

	//TODO bug
	if(feature.getGeometry().getType() == "LineString" || feature.getGeometry().getType() == "Polygon" || feature.getGeometry().getType() == "MultiPolygon"){

		var inter_feature = new ol.Feature({
			geometry: feature.getGeometry().clone()
		});
		var format = new ol.format.GeoJSON();
		var turf_feature = format.writeFeatureObject(inter_feature);

		var turf_buffer = turf.buffer(turf_feature, 1);

		hover_feature = format.readFeature(turf_buffer);

		hover_feature.setStyle(new ol.style.Style({
			fill: null,
            stroke: new ol.style.Stroke({
                color: hover_color_hexa,
                width: 8
              })
            }));
	}

	clue_on_hover_source.addFeature(hover_feature);

}

/*
 * clear_clue_to_select_state
 *
 * suppress graphic select state of all rank 1 elements on map
 */
function clear_clue_to_select_state(){
	clue_on_select_source.clear();
}

/*
 * add_clue_to_select_state
 *
 * add graphic select state on one rank 1 element feature on map
 * id_object: id of the rank 1 element feature
 */
function add_clue_to_select_state(id_object){


var feature;

	if(id_object.split('_')[0] == "trajectory" && id_object.split('_')[1] == "point"){
		for(var i =0; i < rank_1_clue_source.getFeatures().length; i++){
			if(rank_1_clue_source.getFeatures()[i].get('id') == id_object){
				feature = rank_1_clue_source.getFeatures()[i];
				break;
			}
		}
	} else if(id_object.split('_')[0] == "element" && id_object.split('_')[1] == "of" && id_object.split('_')[2] == "reference"){
		for(var i =0; i < rank_1_clue_source.getFeatures().length; i++){
			if(rank_1_clue_source.getFeatures()[i].get('id') == id_object){
				feature = rank_1_clue_source.getFeatures()[i];
				break;
			}
		}
	} else if(id_object.split('_')[0] == "rank" && id_object.split('_')[1] == "2"){
		for(var i =0; i < rank_2_clue_source.getFeatures().length; i++){
			if(rank_2_clue_source.getFeatures()[i].get('id') == id_object){
				feature = rank_2_clue_source.getFeatures()[i];
				break;
			}
		}
	} else if(id_object.split('_')[0] == "rank" && id_object.split('_')[1] == "3"){
		var id_clue_3 = parseInt(id_object.split('_')[3]);
		for(var p=0; p<rank_3_clue_layer_source_array.length; p++){
			if(rank_3_clue_layer_source_array[p].clue_id == id_clue_3){
				for(var i =0; i < rank_3_clue_layer_source_array[p].source.getFeatures().length; i++){
					if(rank_3_clue_layer_source_array[p].source.getFeatures()[i].get('id') == id_object){
						feature = rank_3_clue_layer_source_array[p].source.getFeatures()[i];
						break;
					}
				}
				break;
			}
		}

	}


	var select_feature;


	if(feature.getGeometry().getType() == "Point"){
		select_feature = new ol.Feature({
			geometry: feature.getGeometry().clone()
			});

		select_feature.setStyle(new ol.style.Style({
	        image: new ol.style.Circle({
	            radius: 15,
	            fill: new ol.style.Fill({color: "rgba(0,0,0,0)"}),
	            stroke: new ol.style.Stroke({color: select_color_hexa, width: 4})
	          })
	        }));
	}

	//TODO bug
	if(feature.getGeometry().getType() == "LineString" || feature.getGeometry().getType() == "Polygon" || feature.getGeometry().getType() == "MultiPolygon"){

		var inter_feature = new ol.Feature({
			geometry: feature.getGeometry().clone()
		});
		var format = new ol.format.GeoJSON();
		var turf_feature = format.writeFeatureObject(inter_feature);

		var turf_buffer = turf.buffer(turf_feature, 1);

		select_feature = format.readFeature(turf_buffer);

		select_feature.setStyle(new ol.style.Style({
			fill: null,
            stroke: new ol.style.Stroke({
                color: select_color_hexa,
                width: 8
              })
            }));
	}


	clue_on_select_source.addFeature(select_feature);

}


/*
 * add_object_of_interest_on_hover_to_map
 *
 * add objects of interest (from objects tree) in a layer with a display:none, and add hover function to make these features appear
 */
function add_object_of_interest_on_hover_to_map(){
	//TODO small multiple
	//suppression des anciens objets
	if(object_of_interest_hover_source != null){
		object_of_interest_hover_source.clear();
		for(var p = 0; p < app.map_collection.length; p++){
			switch (app.map_collection[p].map) {
			  case 'map_1':
				  map_1.removeLayer(object_of_interest_hover_layer);
				  break;
			  case 'map_2':
				  map_2.removeLayer(object_of_interest_hover_layer);
				  break;
			  case 'map_3':
				  map_3.removeLayer(object_of_interest_hover_layer);
				  break;
			  case 'map_4':
				  map_4.removeLayer(object_of_interest_hover_layer);
				  break;
			  default:
				  break;
			}
		}
	}

	//récupération des objets
	var Array_of_object_ref = Object.keys(objectMap).map(function(key) {
		  return [Number(key), objectMap[key]];
		});

	//ajout des objets à la couche, tout en les masquant
	for(var i = 0; i<Array_of_object_ref.length; i++){
		if(Array_of_object_ref[i][1]  != undefined){
			var feature_item = Array_of_object_ref[i][1].clone();
			styleItem(feature_item, "hidden")
			object_of_interest_hover_source.addFeature(feature_item);
		}

	}

	for(var p = 0; p < app.map_collection.length; p++){
		switch (app.map_collection[p].map) {
		  case 'map_1':
			  map_1.addLayer(object_of_interest_hover_layer);
			  break;
		  case 'map_2':
			  map_2.addLayer(object_of_interest_hover_layer);
			  break;
		  case 'map_3':
			  map_3.addLayer(object_of_interest_hover_layer);
			  break;
		  case 'map_4':
			  map_4.addLayer(object_of_interest_hover_layer);
			  break;
		  default:
			  break;
		}
	}
	object_of_interest_hover_layer.setZIndex(70);

	//ajout de l'intéraction hover
	var select_hover = new ol.interaction.Select({
		condition: ol.events.condition.pointerMove,
		layers: [rank_1_clue_layer,rank_2_clue_layer,object_of_interest_hover_layer]
      });

	select_hover.setHitTolerance(10);

	//affichage des objets lors d'un hover
	for(var p = 0; p < app.map_collection.length; p++){
		switch (app.map_collection[p].map) {
		  case 'map_1':
			  map_1.addInteraction(select_hover);
			  break;
		  case 'map_2':
			  map_2.addInteraction(select_hover);
			  break;
		  case 'map_3':
			  map_3.addInteraction(select_hover);
			  break;
		  case 'map_4':
			  map_4.addInteraction(select_hover);
			  break;
		  default:
			  break;
		}
	}

	select_hover.on('select', function(e) {

		for(var o=0; o < list_feature_on_hover.length; o++){
			styleItem(list_feature_on_hover[o], "hidden");
		}
		list_feature_on_hover = [];
		remove_all_clue_of_hover();
		$('#popup_div_container').css("display","none");
		for(var o=0; o < e.selected.length; o++){

			if(e.selected[o].getLayer(map_1) != undefined || e.selected[o].getLayer(map_2) != undefined || e.selected[o].getLayer(map_3) != undefined || e.selected[o].getLayer(map_4) != undefined){
				if(e.selected[o].get('id') == 'draw_buffer_feature' || e.selected[o].getLayer(map_1).get('id') == 'ZRI'){
					return;
				}

				if(e.selected[o].getLayer(map_1).get('id') == 'element_hover_layer' || e.selected[o].getLayer(map_2).get('id') == 'element_hover_layer' || e.selected[o].getLayer(map_3).get('id') == 'element_hover_layer' || e.selected[o].getLayer(map_4).get('id') == 'element_hover_layer'){
					var is_in_rank_1_clue = false;
					for(var h=0; h< app.list_of_rank_1_clue.length; h++){
						if(app.list_of_rank_1_clue[h].details.itemRef == e.selected[o].getProperties().itemRef){
							is_in_rank_1_clue = true;
							break;
						}
					}
					if(is_in_rank_1_clue == false){
						styleItem(e.selected[o], "hover");
						list_feature_on_hover.push(e.selected[o]);
					}
					var item_type;
					switch (e.selected[o].getProperties().itemType) {
					  case 'CITY':
						  item_type= "Grande ville";
						  break;
					  case 'TOWN':
						  item_type= "Ville";
						  break;
					  case 'VILLAGE':
						  item_type= "Village";
						  break;
					  case 'PEAK':
						  item_type= "Sommet";
						  break;
					  case 'COL':
						  item_type= "Col";
						  break;
					  case 'LAKE':
						  item_type= "Lac";
						  break;
					  case 'RESERVOIR':
						  item_type= "Réservoir";
						  break;
					  case 'WATEROTHER':
						  item_type= "Autre";
						  break;
					  case 'RIVER':
						  item_type= "Rivière";
						  break;
					  case 'STREAM':
						  item_type= "Ruisseau";
						  break;
					  case 'POWER6':
						  item_type= "LHT 6 brins";
						  break;
					  case 'POWER3':
						  item_type= "LHT 3 brins";
						  break;
					  case 'POWERO':
						  item_type= "Equipement éléctrique";
						  break;
					  case 'MAST':
						  item_type= "Tour téléphonie";
						  break;
					  case 'SKILIFT':
						  item_type= "Remontée mécanique";
						  break;
					  case 'PISTEGREEN':
						  item_type= "Piste verte";
						  break;
					  case 'PISTEBLUE':
						  item_type= "Piste bleue";
						  break;
					  case 'PISTERED':
						  item_type= "Piste rouge";
						  break;
					  case 'PISTEBLACK':
						  item_type= "Piste noire";
						  break;
					  case 'PATHWAY':
						  item_type= "Sentier de randonnée";
						  break;
					  case 'ROAD':
						  item_type= "Route";
						  break;
					  default:
						  item_type= "Objet d'intérêt";
					  break;
					}

					$('#popup_div_container').css("display","block");
					$('#popup_div_container').css("top",(parseInt(e.mapBrowserEvent.pointerEvent.clientY) + 10) + 'px');
					$('#popup_div_container').css("left",(parseInt(e.mapBrowserEvent.pointerEvent.clientX) + 10) + 'px');
					$('#popup_div_type_object').html(item_type);
					$('#popup_div_name_object').html(e.selected[o].getProperties().name);

				} else if(e.selected[o].getLayer(map_1).get('id') == 'id_rank_1_clue_layer' || e.selected[o].getLayer(map_2).get('id') == 'id_rank_1_clue_layer' || e.selected[o].getLayer(map_3).get('id') == 'id_rank_1_clue_layer' || e.selected[o].getLayer(map_4).get('id') == 'id_rank_1_clue_layer'){
					put_clue_to_hover(e.selected[o].get('id_clue'));
					var rank_1_element;
					for(var h=0; h<app.list_of_rank_1_clue.length;h++){
						if(app.list_of_rank_1_clue[h].id_clue == e.selected[o].get('id_clue')){
							rank_1_element = app.list_of_rank_1_clue[h];
							break;
						}
					}
					$('#popup_div_container').css("display","block");
					$('#popup_div_container').css("top",(parseInt(e.mapBrowserEvent.pointerEvent.clientY) + 10) + 'px');
					$('#popup_div_container').css("left",(parseInt(e.mapBrowserEvent.pointerEvent.clientX) + 10) + 'px');
					$('#popup_div_type_object').html("Element de rang 1");
					$('#popup_div_name_object').html(rank_1_element.type_clue + ": " + rank_1_element.summary);
				} else if(e.selected[o].getLayer(map_1).get('id') == 'id_rank_2_clue_layer' || e.selected[o].getLayer(map_2).get('id') == 'id_rank_2_clue_layer' || e.selected[o].getLayer(map_3).get('id') == 'id_rank_2_clue_layer' || e.selected[o].getLayer(map_4).get('id') == 'id_rank_2_clue_layer'){
					//TODO gere bug hover sur les objets d'intérêt
	//				put_clue_2_to_hover(e.selected[o].get('id_clue'));
				}
			}
		}
//		if(e.selected.length == 0){
//			for(var o=0; o < list_feature_on_hover.length; o++){
//				styleItem(list_feature_on_hover[o], "hidden");
//			}
//			list_feature_on_hover = [];
//			remove_all_clue_of_hover();
//		}


    });


}


/**
 * This is a workaround.
 * Returns the associated layer.
 * @param {ol.Map} map.
 * @return {ol.layer.Vector} Layer.
 */
//ol.Feature.prototype.getLayer = function(map) {
//    var this_ = this, layer_, layersToLookFor = [];
//    /**
//     * Populates array layersToLookFor with only
//     * layers that have features
//     */
//    var check = function(layer){
//        var source = layer.getSource();
//        if(source instanceof ol.source.Vector){
//            var features = source.getFeatures();
//            if(features.length > 0){
//                layersToLookFor.push({
//                    layer: layer,
//                    features: features
//                });
//            }
//        }
//    };
//    //loop through map layers
////    map.getLayers().forEach(function(layer){
////        if (layer instanceof ol.layer.Group) {
////            layer.getLayers().forEach(check);
////        } else {
////            check(layer);
////        }
////    });
//    for(var p = 0; p < app.map_collection.length; p++){
//  	  var map_index = p+1;
//  		switch (map_index) {
//  		case 1:
//  			map_1.getLayers().forEach(function(layer){
//  		        if (layer instanceof ol.layer.Group) {
//  		            layer.getLayers().forEach(check);
//  		        } else {
//  		            check(layer);
//  		        }
//  		    });
//  			   break;
//  		case 2:
//  			map_2.getLayers().forEach(function(layer){
//  		        if (layer instanceof ol.layer.Group) {
//  		            layer.getLayers().forEach(check);
//  		        } else {
//  		            check(layer);
//  		        }
//  		    });
//  			   break;
//  		case 3:
//  			map_3.getLayers().forEach(function(layer){
//  		        if (layer instanceof ol.layer.Group) {
//  		            layer.getLayers().forEach(check);
//  		        } else {
//  		            check(layer);
//  		        }
//  		    });
//  			   break;
//  		case 4:
//  			map_4.getLayers().forEach(function(layer){
//  		        if (layer instanceof ol.layer.Group) {
//  		            layer.getLayers().forEach(check);
//  		        } else {
//  		            check(layer);
//  		        }
//  		    });
//  			   break;
//  		default:
//
//  		}
//  	}
//    layersToLookFor.forEach(function(obj){
//        var found = obj.features.some(function(feature){
//            return this_ === feature;
//        });
//        if(found){
//            //this is the layer we want
//            layer_ = obj.layer;
//        }
//    });
//    return layer_;
//};


/*
 * add_object_of_interest_to_map
 *
 * add objects of interest selected on object tree into the map
 */
function add_object_of_interest_to_map() {

	//Clear the map layer
	object_of_interest_source.clear();

	  //Fetch all the relevant items for the items currently selected in the tree
	  var itemsInFilter = [];
	  var totalDataPoints = 0;
	  $.each(getSelectedItemRefs("#tree"), function (event, relevantItemRef) {
	    itemsInFilter.push(turfItemMap[relevantItemRef]);
	    var mapItem = objectMap[relevantItemRef].clone();
	    totalDataPoints += parseFloat(mapItem.getProperties().dataPoints);
	    styleItem(mapItem,"highlight");
	    object_of_interest_source.addFeature(mapItem)
	  });

}


/*
 * add_rank_2_clue_to_map
 *
 * add rank 2 element features into map
 * geometry: geometry calculated for the rank 2 element
 * color_fill: fill color of the rank 2 element feature
 * color_stroke: stroke color of the rank 2 element feature
 */
function add_rank_2_clue_to_map(geometry,color_fill,color_stroke, rank_2_clue_id) {

	var id_rank_clue_feature_2;

	if(rank_2_clue_object_id_list.length > 0){
		id_rank_clue_feature_2 = (Math.max(...rank_2_clue_object_id_list)) + 1;
	} else {
		id_rank_clue_feature_2 = 1;
	}

	rank_2_clue_object_id_list.push(id_rank_clue_feature_2);

	var rank_2_clue_feature = new ol.Feature({
		id:"rank_2_clue_feature_" + id_rank_clue_feature_2,
		geometry: geometry,
		id_clue: rank_2_clue_id});

	var rank_2_style = new ol.style.Style({
	    fill: new ol.style.Fill({
	    	   color: color_fill
	    }),
	    stroke: new ol.style.Stroke({
	    	   color : color_stroke,
	    	   width : 4
	    	})
	  });

	rank_2_clue_feature.setStyle(rank_2_style);


	rank_2_clue_source.addFeature(rank_2_clue_feature);

	var tmp = rank_2_clue_feature.clone()
	tmp.getGeometry().transform("EPSG:3857", "EPSG:4326");
	var f_json = format.writeFeatureObject(tmp);

	add_raster_to_raster_array(rank_2_clue_id,rank_2_clue_feature.getGeometry().getExtent(),raster_resolution);

	//retour de l'id de la feature
	return {"id_object": "rank_2_clue_feature_" + id_rank_clue_feature_2, "geojson": f_json, "style": rank_2_style.clone()};


}

/*
 * add_rank_3_clue_to_map
 *
 * add rank 3 element feature into map
 * rank_3_element: rank 3 element
 */
function add_rank_3_clue_to_map(rank_3_element) {
//	var feature_to_suppress = null;
//	for(var i =0; i < rank_3_clue_source.getFeatures().length; i++){
//		if(rank_3_clue_source.getFeatures()[i].get('id') == rank_3_element.id_object_clue){
//			feature_to_suppress = rank_3_clue_source.getFeatures()[i];
//			break;
//		}
//	}
//	if(feature_to_suppress != null){
//		rank_3_clue_source.removeFeature(feature_to_suppress);
//	}
	for(var i =0; i < rank_3_clue_layer_source_array.length; i++){
		if(rank_3_clue_layer_source_array[i].clue_id == rank_3_element.id_clue){
			rank_3_clue_layer_source_array[i].source.clear();
			break;
		}
	}
	var rank_2_feature_to_intersect_array = [];
	for(var k=0; k<rank_3_element.list_id_clue_rank_2.length; k++){
		if(rank_3_element.list_id_clue_rank_2[k].selected == true){
			var rank_2_id = rank_3_element.list_id_clue_rank_2[k].id_clue_rank_2;
			for(var i=0; i<app.list_of_rank_2_clue.length; i++){
				if(app.list_of_rank_2_clue[i].id_clue == rank_2_id){
					for(var f = 0; f<app.list_of_rank_2_clue[i].object_clue.length; f++){
						for(var j =0; j < rank_2_clue_source.getFeatures().length; j++){
							if(rank_2_clue_source.getFeatures()[j].get('id') == app.list_of_rank_2_clue[i].object_clue[f].id_object){
								rank_2_feature_to_intersect_array.push(rank_2_clue_source.getFeatures()[j].clone());
								break;
							}
						}
					}
					break;
				}
			}
		}
	}
	if(rank_2_feature_to_intersect_array.length >0){
		//TODO, bug intersect_all_features: 3 zones, 2 zones disjointe, et une zone à cheval sur les 2 autres. L'intersection des 3 (qui ne devrait pas exister) donne la géométrie de la 3eme zone
		var intersected_features_array = intersect_all_features(rank_2_feature_to_intersect_array);

		var GeoJSON_format = new ol.format.GeoJSON();
		var list_objet_json = [];
		for(var r=0; r<intersected_features_array.length; r++){
			var tmp = intersected_features_array[r].clone();
			tmp.getGeometry().transform("EPSG:3857", "EPSG:4326");
			var object_geojson = GeoJSON_format.writeFeatureObject(tmp);
			list_objet_json.push(object_geojson);
		}

		map_element_worker.postMessage({'cmd': 'worker_union_areas', 'arg': {
			'list_objet_json': list_objet_json,
			'id_clue': rank_3_element.id_clue,
			'id_object_clue': rank_3_element.id_object_clue,
			'r': rank_3_element.rank_3_color.r,
			'g': rank_3_element.rank_3_color.g,
			'b': rank_3_element.rank_3_color.b
		}});
		map_element_worker.onmessage = function(e) {
			if(e.data != null){
				var intersection_feature = GeoJSON_format.readFeature(e.data.unite_area);
				intersection_feature.getGeometry().transform("EPSG:4326", "EPSG:3857");

				var color_fill = 'rgba(' + e.data.r + ',' + e.data.g +',' + e.data.b + ',0.05)';
				var color_stroke = 'rgba(' + e.data.r + ',' + e.data.g + ',' + e.data.b + ',1)';

					var rank_3_clue_feature = new ol.Feature({
						id: e.data.id_object_clue,
						geometry: intersection_feature.getGeometry()});

					rank_3_clue_feature.setStyle(new ol.style.Style({
					    fill: new ol.style.Fill({
					    	   color: color_fill
					    }),
					    stroke: new ol.style.Stroke({
					    	   color : color_stroke,
					    	   width : 4
					    	})
					  }));


					for(var q =0; q < rank_3_clue_layer_source_array.length; q++){
						if(rank_3_clue_layer_source_array[q].clue_id == e.data.id_clue){
							rank_3_clue_layer_source_array[q].source.addFeature(rank_3_clue_feature);
							break;
						}
					}


			}

			}

	}


}


/*
 * suppress_rank_3_clue_to_map
 *
 * suppress rank 3 element feature from map
 * rank_3_element: rank 3 element
 */
function suppress_rank_3_clue_to_map(rank_3_element) {

//	var feature_to_suppress = null;
//	for(var i =0; i < rank_3_clue_source.getFeatures().length; i++){
//		if(rank_3_clue_source.getFeatures()[i].get('id') == rank_3_element.id_object_clue){
//			feature_to_suppress = rank_3_clue_source.getFeatures()[i];
//			break;
//		}
//	}
//	if(feature_to_suppress != null){
//		rank_3_clue_source.removeFeature(feature_to_suppress);
//	}
	for(var i =0; i < rank_3_clue_layer_source_array.length; i++){
		if(rank_3_clue_layer_source_array[i].clue_id == rank_3_element.id_clue){
			rank_3_clue_layer_source_array[i].source.clear();
			break;
		}
	}
	var layer_to_suppress = null;
	var index_to_supress = null;
	for(var i =0; i < rank_3_clue_layer_source_array.length; i++){
		if(rank_3_clue_layer_source_array[i].clue_id == rank_3_element.id_clue){
			layer_to_suppress = rank_3_clue_layer_source_array[i].layer;
			index_to_supress = i
			break;
		}
	}
	if(layer_to_suppress != null){
		if(map_1 != null){
			map_1.removeLayer(layer_to_suppress);
		}
		if(map_2 != null){
			map_2.removeLayer(layer_to_suppress);
		}
		if(map_3 != null){
			map_3.removeLayer(layer_to_suppress);
		}
		if(map_4 != null){
			map_4.removeLayer(layer_to_suppress);
		}
	}

	rank_3_clue_layer_source_array.splice(index_to_supress, 1);

}

/*
 * getcolor_of_rank_2_feature
 *
 * get color of the rank 2 element feature on map
 * id_feature: id of rank 2 element feature
 */
function getcolor_of_rank_2_feature(id_feature) {
	var stroke_color;
	var fill_color;

	var feature_find = false;
	for(var i = 0; i< app.list_of_rank_2_clue.length; i++){
		for(var j = 0; j< app.list_of_rank_2_clue[i].object_clue.length; j++){
			if(app.list_of_rank_2_clue[i].object_clue[j].id_object == id_feature){
				stroke_color = app.list_of_rank_2_clue[i].object_clue[j].style.getStroke().color_;
				fill_color = app.list_of_rank_2_clue[i].object_clue[j].style.getFill().color_;
				break;
			}
		}
		if(feature_find == true){
			break;
		}
	}


//	for(var i = 0; i< rank_2_clue_source.getFeatures().length; i++){
//		if(rank_2_clue_source.getFeatures()[i].get('id') == id_feature){
//			stroke_color = rank_2_clue_source.getFeatures()[i].getStyle().getStroke().color_;
//			fill_color = rank_2_clue_source.getFeatures()[i].getStyle().getFill().color_;
//			break;
//		}
//	}
	return {"stroke_color":stroke_color,"fill_color":fill_color};
}


/*
 * create_buffer
 *
 * calculate buffer feature
 * object: feature (OL) at the origin of the buffer
 * "i'm between 'value_1' and 'value_2' meters of an object"
 * value_1: first value of buffer
 * value_2: second value of buffer
 * unit: unit used to calculate the buffer (in km)
 * return the buffer feature (OL)
 */
function create_buffer(object, value_1, value_2, unit){
	var GeoJSON_format = new ol.format.GeoJSON();
	var tmp = object.clone();
	tmp.getGeometry().transform("EPSG:3857", "EPSG:4326");
//	var object_geojson = format.writeFeatureObject(tmp);
	var object_geojson = GeoJSON_format.writeFeatureObject(tmp);
	var bufferedZone = turf.buffer(object_geojson, value_2, unit);

//	map_element_worker.postMessage({'cmd': 'create_buffer', 'arg': {
//		'object_geojson': object_geojson,
//		'value_1': value_1,
//		'value_2': value_2,
//		'unit': unit
//	}});
//
//	map_element_worker.onmessage = function(e) {
//		  var bufferedFeature = GeoJSON_format.readFeature(e.data);
//			bufferedFeature.getGeometry().transform("EPSG:4326", "EPSG:3857");
//			return bufferedFeature;
//		}

	var bufferedFeature = format.readFeature(bufferedZone);
	var bufferedFeature = GeoJSON_format.readFeature(bufferedZone);
	bufferedFeature.getGeometry().transform("EPSG:4326", "EPSG:3857");
	return bufferedFeature;
}

function add_draw_buffer_to_map(object, value_1, value_2, unit, draw_buffer_id, buffer_fill_color, buffer_stroke_color){
	var GeoJSON_format = new ol.format.GeoJSON();
	var tmp = object.clone();
	tmp.getGeometry().transform("EPSG:3857", "EPSG:4326");
	var object_geojson = GeoJSON_format.writeFeatureObject(tmp);

	map_element_worker.postMessage({'cmd': 'create_buffer', 'arg': {
		'object_geojson': object_geojson,
		'value_1': value_1,
		'value_2': value_2,
		'unit': unit
	}});

	map_element_worker.onmessage = function(e) {
	  var bufferedFeature = GeoJSON_format.readFeature(e.data);
		bufferedFeature.getGeometry().transform("EPSG:4326", "EPSG:3857");

		draw_source.clear();

		var circle_feature = new ol.Feature({
	  		id:draw_buffer_id,
	  		geometry: bufferedFeature.getGeometry()});

		 circle_feature.setStyle(new ol.style.Style({
	    	  fill: new ol.style.Fill({
		    	   color: buffer_fill_color
		    }),
		    stroke: new ol.style.Stroke({
		    	   color : buffer_stroke_color,
		    	   width : 4
		    	})
	  	  }));

	      draw_source.addFeature(circle_feature);

	}
}

function add_draw_buffer_multi_polygon_to_map(list_object, value_1, value_2, unit, draw_buffer_id, buffer_fill_color, buffer_stroke_color){
	var GeoJSON_format = new ol.format.GeoJSON();
	var list_objet_json = [];
	for(var r=0; r<list_object.length; r++){
		var tmp = list_object[r].clone();
		tmp.getGeometry().transform("EPSG:3857", "EPSG:4326");
		var object_geojson = GeoJSON_format.writeFeatureObject(tmp);
		list_objet_json.push(object_geojson);
	}

	map_element_worker.postMessage({'cmd': 'create_buffer_multi', 'arg': {
		'list_objet_json': list_objet_json,
		'value_1': value_1,
		'value_2': value_2,
		'unit': unit
	}});

	map_element_worker.onmessage = function(e) {
		  var bufferedFeature = GeoJSON_format.readFeature(e.data);
			bufferedFeature.getGeometry().transform("EPSG:4326", "EPSG:3857");

			draw_source.clear();

			var circle_feature = new ol.Feature({
		  		id:draw_buffer_id,
		  		geometry: bufferedFeature.getGeometry()});

			 circle_feature.setStyle(new ol.style.Style({
		    	  fill: new ol.style.Fill({
			    	   color: buffer_fill_color
			    }),
			    stroke: new ol.style.Stroke({
			    	   color : buffer_stroke_color,
			    	   width : 4
			    	})
		  	  }));

		      draw_source.addFeature(circle_feature);

		}

}



/*
 * union_feature
 *
 * calculate union of 2 features (OL)
 * f1: first feature (OL)
 * f2: second feature (OL)
 * return the union feature (OL)
 */
function union_feature(f1,f2){
	var GeoJSON_format = new ol.format.GeoJSON();
	var tmp1 = f1.clone()
	tmp1.getGeometry().transform("EPSG:3857", "EPSG:4326");
	var tmp2 = f2.clone()
	tmp2.getGeometry().transform("EPSG:3857", "EPSG:4326");
	var f1_json = GeoJSON_format.writeFeatureObject(tmp1);
	var f2_json = GeoJSON_format.writeFeatureObject(tmp2);
	var union = turf.union(f1_json, f2_json);
	var union_feature = GeoJSON_format.readFeature(union);
	union_feature.getGeometry().transform("EPSG:4326", "EPSG:3857");
	return union_feature;
}


/*
 * intersect_feature
 *
 * calculate intersection of 2 features (OL)
 * f1: first feature (OL)
 * f2: second feature (OL)
 * return the intersected feature (OL)
 */
function intersect_feature(f1,f2){
	var GeoJSON_format = new ol.format.GeoJSON();
	var tmp1 = f1.clone()
	tmp1.getGeometry().transform("EPSG:3857", "EPSG:4326");
	var tmp2 = f2.clone()
	tmp2.getGeometry().transform("EPSG:3857", "EPSG:4326");
	f1_json = GeoJSON_format.writeFeatureObject(tmp1);
	f2_json = GeoJSON_format.writeFeatureObject(tmp2);
	var union = turf.intersect(f1_json, f2_json);
	var union_feature = GeoJSON_format.readFeature(union);
	union_feature.getGeometry().transform("EPSG:4326", "EPSG:3857");
	return union_feature;
}

/*
 * intersect_all_features
 *
 * calculate intersection of an array of feature (OL)
 * list_features: array of features (OL)
 * return feature array (OL) corresponding to the interseected areas
 */
function intersect_all_features(list_features){
	var intersections = [];
    var filtersInTurfFormat = [];

    for (var k = 0; k < list_features.length; ++k) {
      if(list_features[k] != null) {
        var obj = list_features[k].clone();
        var polygons = [];
        if (obj.getGeometry().getType() == "MultiPolygon") {
          var polyList = obj.getGeometry().getPolygons();
          polyList.forEach( function(poly) {
            polygons.push(new ol.Feature({ geometry: poly }));
          });
        }
        else {
          polygons.push(new ol.Feature({ geometry: obj.getGeometry() }));
        }

        var newIntersections = [];
        for (var m = 0; m < polygons.length; ++m) {
          if(intersections.length == 0){
            newIntersections.push(format.writeFeatureObject(polygons[m]));
          }
          else {
            for (var n = 0; n < intersections.length; ++n) {
              var poly2 = format.writeFeatureObject(polygons[m]);
              var intersection = turf.intersect(poly2, intersections[n]);
              if (intersection != null) {
                var flatten = turf.flatten(intersection);
                var features = flatten.features;
                for (var x = 0; x < features.length; ++x) {
                  newIntersections.push(features[x]);
                }
              }
            }
          }
        }
        intersections = newIntersections;
      }
    }

    var feature_intersected_array = [];
    for (var o = 0; o < intersections.length; ++o) {
    	var feature_intersected = format.readFeature(intersections[o]);
    	feature_intersected_array.push(feature_intersected);
    }

    return feature_intersected_array;


}

/*
 * remove_all_clue_map_elements_of_hover
 *
 * put all of rank 1 and rank 2 elements in non-hover graphic state in the map
 *
 */
function remove_all_clue_map_elements_of_hover(){
	clue_on_hover_source.clear();
}

/*
 * put_clue_map_elements_to_hover
 *
 * launch function to put rank 1 element features to hover graphic state in map
 * id_clue: id of rank 1 element
 *
 */
function put_clue_map_elements_to_hover(id_clue){
	clear_clue_to_hover_state();
	var index=null;
	for(var i = 0; i< app.list_of_rank_1_clue.length; i++){
		if(app.list_of_rank_1_clue[i].id_clue == id_clue){
			index= i;
			break;
		}
	}
	for(var i =0; i< app.list_of_rank_1_clue[index].object_clue.length; i++){
		add_clue_to_hover_state(app.list_of_rank_1_clue[index].object_clue[i].id_object);
	}
}

/*
 * put_clue_map_elements_2_to_hover
 *
 * launch function to put rank 2 element features to hover graphic state in map
 * id_clue: id of rank 2 element
 *
 */
function put_clue_map_elements_2_to_hover(id_clue){
	clear_clue_to_hover_state();
	var index=null;
	for(var i = 0; i< app.list_of_rank_2_clue.length; i++){
		if(app.list_of_rank_2_clue[i].id_clue == id_clue){
			index= i;
			break;
		}
	}
	for(var i =0; i< app.list_of_rank_2_clue[index].object_clue.length; i++){
		add_clue_to_hover_state(app.list_of_rank_2_clue[index].object_clue[i].id_object);
	}
}

/*
 * put_clue_map_element_to_select
 *
 * launch function which put rank 1 element features to select graphic state in map
 * id_clue: id of rank 1 element
 *
 */
function put_clue_map_element_to_select(id_clue){
	var index=null;
	for(var h = 0; h< app.list_of_rank_1_clue.length; h++){
			if(app.list_of_rank_1_clue[h].id_clue == id_clue){
				index= h;
				break;
			}
		}
	for(var j =0; j< app.list_of_rank_1_clue[index].object_clue.length; j++){
		add_clue_to_select_state(app.list_of_rank_1_clue[index].object_clue[j].id_object);
	}
}

/*
 * put_clue_map_element_2_to_select
 *
 * launch function which put rank 2 element features to select graphic state in map
 * id_clue: id of rank 2 element
 *
 */
function put_clue_map_element_2_to_select(id_clue){
	var index=null;
	for(var h = 0; h< app.list_of_rank_2_clue.length; h++){
			if(app.list_of_rank_2_clue[h].id_clue == id_clue){
				index= h;
				break;
			}
		}
	for(var j =0; j< app.list_of_rank_2_clue[index].object_clue.length; j++){
		add_clue_to_select_state(app.list_of_rank_2_clue[index].object_clue[j].id_object);
	}
}

function reset_ZRI(ZRI_extent){
	ZRI_source.clear();
	var map_extent = map_1.getView().calculateExtent(map_1.getSize());

	if(ZRI_extent[0] > map_extent[0] && ZRI_extent[0] < map_extent[2] || ZRI_extent[2] > map_extent[0] && ZRI_extent[2] < map_extent[2] || ZRI_extent[1] > map_extent[1] && ZRI_extent[1] < map_extent[3] || ZRI_extent[3] > map_extent[1] && ZRI_extent[3] < map_extent[3]){
		var map_coord = [[map_extent[0] - 500,map_extent[1] - 500],[map_extent[2] + 500,map_extent[1] - 500],[map_extent[2] + 500,map_extent[3] + 500],[map_extent[0] - 500,map_extent[3] + 500],[map_extent[0] - 500,map_extent[1] - 500]];
		var map_polygon = turf.polygon([map_coord]);

		var polygon_coord = [[ZRI_extent[0] - 10,ZRI_extent[1] - 10],[ZRI_extent[2] + 10,ZRI_extent[1] - 10],[ZRI_extent[2] + 10,ZRI_extent[3] + 10],[ZRI_extent[0] - 10,ZRI_extent[3] + 10],[ZRI_extent[0] - 10,ZRI_extent[1] - 10]];
		var polygon = turf.polygon([polygon_coord]);

		var difference_feature = turf.difference(map_polygon, polygon);

		var format = new ol.format.GeoJSON();
		var feature = format.readFeature(difference_feature);
		feature.setStyle(new ol.style.Style({
		    fill: new ol.style.Fill({
		    	   color: 'rgba(255,255,255,0.9)'
		    }),
		    stroke: new ol.style.Stroke({
		    	   color : '#000000',
		    	   width : 1
		    	})
		  }));
		ZRI_source.addFeature(feature);

	}
	var raster_ZRI = create_grid_from_ZRI(ZRI_extent,raster_resolution);
	if(raster_data_array.length >0){
		raster_data_array[0] = raster_ZRI;
	} else {
		raster_data_array.push(raster_ZRI);
	}

}

function return_zri_intersect(feature){
	var new_feature = intersect_feature(feature,ZRI_source.getFeatures()[0]);
	return new_feature;
}

function get_geometry_type_color(rank_clue,clue_id){
	var response = {
		'type':null,
		'color':null
	};
	var color;	switch(rank_clue){
		case 1:
			for(var i=0; i<rank_1_clue_source.getFeatures().length; i++){
				if(parseInt(rank_1_clue_source.getFeatures()[i].get('id_clue')) == clue_id){
					response.type = rank_1_clue_source.getFeatures()[i].getGeometry().getType();
					switch(rank_1_clue_source.getFeatures()[i].getGeometry().getType()){
						case 'Point':
							response.color = rank_1_clue_source.getFeatures()[i].getStyle().getImage().getStroke().getColor();
							break;
						case 'LineString':
							response.color = rank_1_clue_source.getFeatures()[i].getStyle().getStroke().getColor();
							break;
						case 'Polygon':
							response.color = rank_1_clue_source.getFeatures()[i].getStyle().getStroke().getColor();
							break;
						case 'MultiPolygon':
							response.color = rank_1_clue_source.getFeatures()[i].getStyle().getStroke().getColor();
							break;
					}
					break;
				}
			}
			break;
		case 2:
			break;
		case 3:
			break;
	}
	return response;
}

function create_grid(){
	var map_extent = map_1.getView().calculateExtent(map_1.getSize());
	var map_size = map_1.getSize();
	var pixel_size = 20;
	var grid_size= [parseInt(map_size[0]/pixel_size),parseInt(map_size[1]/pixel_size)];

	var number_of_ZLC = $(".clue_slider_button").length;
	//minimum and maximum value of alpha for a ZLP
	var alpha_min = 30;
	var alpha_max = 255;
	//number of step between alpha_min and alpha_max: correspond to the number of alpha value that the ZLP can take, regarding the number of ZLC * their number of trust value
	var alpha_step = (alpha_max-alpha_min)/(number_of_ZLC*3);

	//a remplacer par la liste contenant les ZLC à ajouter
	var list_of_rank_source_2 = [1,2,3,4,5,6];

	var r_raster = 255,
	g_raster = 0,
	b_raster = 0;

	var canvas = document.createElement('canvas'),
    context = canvas.getContext('2d'),
    imgData = context.createImageData(grid_size[0], grid_size[1]),
    img_buffer = new Uint8ClampedArray(grid_size[0] * grid_size[1] * 4);

	canvas.width = grid_size[0];
	canvas.height = grid_size[1];


	for(var y_pixel = 0; y_pixel < grid_size[1]; y_pixel++){
		for(var x_pixel = 0; x_pixel < grid_size[0]; x_pixel++){

			var counter = (y_pixel*grid_size[0] + x_pixel)*4;
			var trust_counter = 0;
			map_1.forEachFeatureAtPixel([x_pixel*pixel_size,y_pixel*pixel_size], function (feature, layer) {
				if(layer.get('id') == 'id_rank_2_clue_layer'){
					var clue_id = parseInt(feature.get('id_clue'));
					if(list_of_rank_source_2.indexOf(clue_id) > -1){
						for(var c=0; c< app.list_of_rank_2_clue.length; c++){
							if(clue_id == app.list_of_rank_2_clue[c].id_clue){
								//ajout d'une valeur au pixel dans la grille
								trust_counter = trust_counter + app.list_of_rank_2_clue[c].trust;
							}
						}
					}
				}
			});
			var alpha_value;
			if(trust_counter > 0){
				alpha_value = alpha_min + alpha_step*trust_counter;
			}else{
				alpha_value = 0;
			}

			img_buffer[counter] = r_raster;
			img_buffer[counter + 1] = g_raster;
			img_buffer[counter + 2] = b_raster;
			img_buffer[counter + 3] = alpha_value;


		}
	}
	imgData.data.set(img_buffer);
	// put data to context at (0, 0)
	context.putImageData(imgData, 0, 0);

	// output image
	var img = new Image();
	img.src = canvas.toDataURL('image_raster/png');

    var projection = new ol.proj.Projection({
      code: 'xkcd-image',
      units: 'pixels',
      extent: map_extent
    });

    var test_layer = new ol.layer.Image({
        source: new ol.source.ImageStatic({
          attributions: '© <a href="http://xkcd.com/license.html">xkcd</a>',
          url: img.src,
          projection: projection,
          imageExtent: map_extent
        })
      })

    map_1.addLayer(test_layer);

}

function add_raster_to_raster_array(id_clue,extent,raster_resolution){
	var raster = create_grid_from_feature(id_clue,extent,raster_resolution);
	raster_data_array.push(raster);
}

function remove_raster_from_raster_array(id_clue){
	for( var i = 0; i < raster_data_array.length; i++){
		   if ( raster_data_array[i].id_clue == id_clue) {
			   raster_data_array.splice(i, 1);
			   break;
		   }
		}
}


function create_grid_2(){

	var map_extent = map_1.getView().calculateExtent(map_1.getSize());

	var raster_ZLP_source_array = [];

	var list_of_rank_source_2 = [1,2,3,4,5,6];
	var color_ZLP = ["#ffcc66","#990033"];

	for(var raster_item =0; raster_item<raster_data_array.length; raster_item++){
		if(list_of_rank_source_2.indexOf(raster_data_array[raster_item].id_clue) > -1){
			for(var c=0; c< app.list_of_rank_2_clue.length; c++){
				if(raster_data_array[raster_item].id_clue == app.list_of_rank_2_clue[c].id_clue){
					//conversion du raster à la couleur correspondant à l'indice de confiance (rouge: low, bleu: medium, vert:high)
					switch (app.list_of_rank_2_clue[c].trust) {
						case 1:
							raster_ZLP_source_array.push(raster_data_array[raster_item].image_low);
							break;
						case 2:
							raster_ZLP_source_array.push(raster_data_array[raster_item].image_medium);
							break;
						case 3:
							raster_ZLP_source_array.push(raster_data_array[raster_item].image_high);
							break;
						default:
							raster_ZLP_source_array.push(raster_data_array[raster_item].image_medium);
					}
					break;
				}
			}
		}
	}

	var numberOfItems = raster_ZLP_source_array.length * 3;
	var rainbow = new Rainbow();
	rainbow.setNumberRange(1, numberOfItems);
	rainbow.setSpectrum(color_ZLP[0], color_ZLP[1]);
	var color_string = "";
	var color_array = [];
	for (var i = 1; i <= numberOfItems; i++) {
	    var hexColour = rainbow.colourAt(i);
	    color_string = color_string + '#' + hexColour + ',';
	    color_array.push('#' + hexColour);
	}

	var get_color_rgb = function(index){
		var color_string_test = color_string;
		var color = color_string_test.split(',')[index];
		return color;
	};

	var raster_ZLP = new ol.source.Raster({
		sources:raster_ZLP_source_array,
		operation: function(pixels, data) {
			var prob_counter =0;
			for(var p=0; p<pixels.length;p++){
				var pixel = pixels[p];
				if(pixel[3] > 0){
					//il y a une ZLC
					if(pixel[0] > 0){
						//ZLC low
						prob_counter = prob_counter + 1;
					}
					if(pixel[1] > 0){
						//ZLC high
						prob_counter = prob_counter + 3;
					}
					if(pixel[2] > 0){
						//ZLC medium
						prob_counter = prob_counter + 2;
					}
				}
			}

			if(prob_counter >0){
//				var r = hexToRgb(get_color_rgb(prob_counter-1)).r;
//				var g = hexToRgb(get_color_rgb(prob_counter-1)).g;
//				var b = hexToRgb(get_color_rgb(prob_counter-1)).b;
				var color_string_test = ["#FF0000","#000000","#008fff","#00ff71","#ff7100","#fff100"];
				var r = hexToRgb(color_string_test[prob_counter-1]).r;
				var g = hexToRgb(color_string_test[prob_counter-1]).g;
				var b = hexToRgb(color_string_test[prob_counter-1]).b;
					return [r,g,b,125];
			}else{
				return [0,0,0,0];
			}

		},
		lib: {
			get_color_rgb:get_color_rgb,
			hexToRgb: hexToRgb
//			color_array: color_array
	        }
	});


	map_1.addLayer(new ol.layer.Image({source:raster_ZLP }));

}

function suppress_rank_3_raster_from_map(rank_3_element){
	var index_raster;
	for(var f=0; f<rank_3_clue_layer_source_array.length; f++){
		if(rank_3_clue_layer_source_array[f].clue_id == rank_3_element.id_clue){
			index_raster = f;
			break;
		}
	}

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
					if(small_multiple_map.list_map_elements[t].type_clue == 3 && small_multiple_map.list_map_elements[t].id_clue == rank_3_element.id_clue){
						map_1.removeLayer(rank_3_clue_layer_source_array[index_raster].layer);
						break;
					}
				}
			  break;
		  case 'map_2':
			  for(var t=0; t<small_multiple_map.list_map_elements.length; t++){
					if(small_multiple_map.list_map_elements[t].type_clue == 3 && small_multiple_map.list_map_elements[t].id_clue == rank_3_element.id_clue){
						map_2.removeLayer(rank_3_clue_layer_source_array[index_raster].layer);
						break;
					}
				}
			  break;
		  case 'map_3':
			  for(var t=0; t<small_multiple_map.list_map_elements.length; t++){
					if(small_multiple_map.list_map_elements[t].type_clue == 3 && small_multiple_map.list_map_elements[t].id_clue == rank_3_element.id_clue){
						map_3.removeLayer(rank_3_clue_layer_source_array[index_raster].layer);
						break;
					}
				}
			  break;
		  case 'map_4':
			  for(var t=0; t<small_multiple_map.list_map_elements.length; t++){
					if(small_multiple_map.list_map_elements[t].type_clue == 3 && small_multiple_map.list_map_elements[t].id_clue == rank_3_element.id_clue){
						map_4.removeLayer(rank_3_clue_layer_source_array[index_raster].layer);
						break;
					}
				}
			  break;
			 default:
				 break;
		}
	}


	rank_3_clue_layer_source_array[index_raster].layer = null;
	rank_3_clue_layer_source_array[index_raster].source = null;
}

function create_rank_3_clue_raster(rank_3_element){

	var index_raster;
	for(var f=0; f<rank_3_clue_layer_source_array.length; f++){
		if(rank_3_clue_layer_source_array[f].clue_id == rank_3_element.id_clue){
			index_raster = f;
			break;
		}
	}

	var active_map = [];

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
					if(small_multiple_map.list_map_elements[t].type_clue == 3 && small_multiple_map.list_map_elements[t].id_clue == rank_3_element.id_clue){
						map_1.removeLayer(rank_3_clue_layer_source_array[index_raster].layer);
						active_map.push('map_1');
						break;
					}
				}
			  break;
		  case 'map_2':
			  for(var t=0; t<small_multiple_map.list_map_elements.length; t++){
					if(small_multiple_map.list_map_elements[t].type_clue == 3 && small_multiple_map.list_map_elements[t].id_clue == rank_3_element.id_clue){
						map_2.removeLayer(rank_3_clue_layer_source_array[index_raster].layer);
						active_map.push('map_2');
						break;
					}
				}
			  break;
		  case 'map_3':
			  for(var t=0; t<small_multiple_map.list_map_elements.length; t++){
					if(small_multiple_map.list_map_elements[t].type_clue == 3 && small_multiple_map.list_map_elements[t].id_clue == rank_3_element.id_clue){
						map_3.removeLayer(rank_3_clue_layer_source_array[index_raster].layer);
						active_map.push('map_3');
						break;
					}
				}
			  break;
		  case 'map_4':
			  for(var t=0; t<small_multiple_map.list_map_elements.length; t++){
					if(small_multiple_map.list_map_elements[t].type_clue == 3 && small_multiple_map.list_map_elements[t].id_clue == rank_3_element.id_clue){
						map_4.removeLayer(rank_3_clue_layer_source_array[index_raster].layer);
						active_map.push('map_4');
						break;
					}
				}
			  break;
			 default:
				 break;
		}
	}


	rank_3_clue_layer_source_array[index_raster].layer = null;
	rank_3_clue_layer_source_array[index_raster].source = null;

	var raster_ZLP_source_array = [];
	var list_of_rank_source_2 = [];

	for(var j=0; j<rank_3_element.list_id_clue_rank_2.length; j++){
		if(rank_3_element.list_id_clue_rank_2[j].selected == true){
			list_of_rank_source_2.push(rank_3_element.list_id_clue_rank_2[j].id_clue_rank_2);
		}
	}

	//TODO color

	var color_ZLP = [rank_3_element.rank_3_color_light,rank_3_element.rank_3_color_dark];
	var alpha_value = [80,200];


	if(list_of_rank_source_2.length >0){
		var layer_type_array = [];
		raster_ZLP_source_array.push(raster_data_array[0].image);

		for(var raster_item =1; raster_item<raster_data_array.length; raster_item++){
			if(list_of_rank_source_2.indexOf(raster_data_array[raster_item].id_clue) > -1){
				for(var c=0; c< app.list_of_rank_2_clue.length; c++){
					if(raster_data_array[raster_item].id_clue == app.list_of_rank_2_clue[c].id_clue){
						//conversion du raster à la couleur correspondant à l'indice de confiance (rouge: low, bleu: medium, vert:high)
						raster_ZLP_source_array.push(raster_data_array[raster_item].image);
						if(app.list_of_rank_2_clue[c].is_inside == true){
							layer_type_array.push({'trust':app.list_of_rank_2_clue[c].trust, 'type':'inside'});
						} else if(app.list_of_rank_2_clue[c].is_inside == false && app.list_of_rank_2_clue[c].negative_of_zone == false){
							layer_type_array.push({'trust':app.list_of_rank_2_clue[c].trust, 'type':'outside'});
						} else if(app.list_of_rank_2_clue[c].is_inside == false && app.list_of_rank_2_clue[c].negative_of_zone == true){
							layer_type_array.push({'trust':app.list_of_rank_2_clue[c].trust, 'type':'negative'});
						}

						break;
					}
				}
			}
		}


		var numberOfItems = (raster_ZLP_source_array.length-1) * 3;
		var rainbow = new Rainbow();
		rainbow.setNumberRange(0, 100);
		rainbow.setSpectrum(color_ZLP[0], color_ZLP[1]);
		var color_string = "";
		var color_array = [];

		var alpha_array = [];

		var value_range_min = parseInt($( "#rank_3_clue_element_menu_color_range" ).slider( "values", 0 ));
		var value_range_max = parseInt($( "#rank_3_clue_element_menu_color_range" ).slider( "values", 1 ));

		for (var i = 1; i <= numberOfItems; i++) {
			var hexColour;
			var index = (i/numberOfItems)*100;
			if(index <= value_range_min){
				alpha_array.push(alpha_value[0]);
				color_array.push(color_ZLP[0]);
				color_string = color_string + color_ZLP[0] + ',';
			} else if(index >= value_range_max){
				alpha_array.push(alpha_value[1]);
				color_array.push(color_ZLP[1]);
				color_string = color_string + color_ZLP[1] + ',';
			} else {
				var neo_index = (index - value_range_min) * (100/(value_range_max -value_range_min));
				hexColour = rainbow.colourAt(neo_index);
				alpha_array.push(alpha_value[0] + (neo_index/100)*(alpha_value[1]-alpha_value[0]));
			    color_string = color_string + '#' + hexColour + ',';
			    color_array.push('#' + hexColour);
			}

		}


//		var value_range = $('#rank_3_clue_element_menu_color_range').val();
//		if(value_range < 50){
//			//paliers de couleur et d'alpha non régulier. plus de contraste entre les pixels présentant des valeurs peu élevées. moins de contraste entre les pixels présentant des valeurs élevées
//			var color_range = (50 - (50-value_range))*2;
//			for (var i = 1; i <= numberOfItems; i++) {
//				var hexColour;
//				if((i/numberOfItems)*100 > color_range){
//					hexColour = rainbow.colourAt(100);
//					alpha_array.push(alpha_value[1]);
//				} else {
//					var index = (i/numberOfItems)*100 * (100/color_range);
//					if(index ==0){
//						index = 1;
//					}
//					hexColour = rainbow.colourAt(index);
//					alpha_array.push(alpha_value[0] + (index/100)*(alpha_value[1]-alpha_value[0]));
//				}
//			    color_string = color_string + '#' + hexColour + ',';
//			    color_array.push('#' + hexColour);
//			}
//		} else if(value_range == 50){
//			//paliers de couleur et d'alpha régulier, une couleur définie pour chacune des valeurs possible pour un pixel (nombre de ZLC*3indices de confiances)
//			for (var i = 1; i <= numberOfItems; i++) {
//				var hexColour;
//				var index = (i/numberOfItems)*100;
//				if(index ==0){
//					index = 1;
//				}
//				hexColour = rainbow.colourAt(index);
//				alpha_array.push(alpha_value[0] + (index/100)*(alpha_value[1]-alpha_value[0]));
//			    color_string = color_string + '#' + hexColour + ',';
//			    color_array.push('#' + hexColour);
//			}
//		} else {
//			//paliers de couleur et d'alpha non régulier. moins de contraste entre les pixels présentant des valeurs peu élevées. plus de contraste entre les pixels présentant des valeurs élevées
//			var color_range = (value_range -50)*2;
//			for (var i = 1; i <= numberOfItems; i++) {
//				var hexColour;
//				if((i/numberOfItems)*100 < color_range){
//					hexColour = rainbow.colourAt(1);
//					alpha_array.push(alpha_value[0]);
//				} else {
//					var index = (i/numberOfItems)*100 * (100/(100-color_range)) - (100*color_range)/(100-color_range);
//					if(index ==0){
//						index = 1;
//					}
//					hexColour = rainbow.colourAt(index);
//					alpha_array.push(alpha_value[0] + (index/100)*(alpha_value[1]-alpha_value[0]));
//				}
//			    color_string = color_string + '#' + hexColour + ',';
//			    color_array.push('#' + hexColour);
//			}
//		}


//		for (var i = 1; i <= numberOfItems; i++) {
//			var hexColour;
//			if((i/numberOfItems)*100 < value_range){
//				hexColour = rainbow.colourAt(1);
//				alpha_array.push(alpha_value[0]);
//			} else {
//				var index = (i/numberOfItems)*100 * (100/(100-value_range)) - (100*value_range)/(100-value_range);
//				if(index ==0){
//					index = 1;
//				}
//				hexColour = rainbow.colourAt(index);
//				alpha_array.push(alpha_value[0] + (index/100)*(alpha_value[1]-alpha_value[0]));
//			}
//		    color_string = color_string + '#' + hexColour + ',';
//		    color_array.push('#' + hexColour);
//		}


		var raster_ZLP = new ol.source.Raster({
			sources:raster_ZLP_source_array,
			operation: function(pixels, data) {
				if(pixels[0][3] > 0){
					var prob_counter =0;
					for(var p=1; p<pixels.length;p++){
						var pixel = pixels[p];

						layer_type = data.layer_type_array[p-1];
						if(layer_type.type == 'inside'){
							if(pixel[3] > 0){
								//il y a une ZLC
								prob_counter = prob_counter + layer_type.trust;
							}
						} else if(layer_type.type == 'outside'){
							if(pixel[3] > 0){
								//il y a une ZLC
								prob_counter = prob_counter - layer_type.trust;
							}
						} else if(layer_type.type == 'negative'){
							if(pixel[3] > 0){
								//il y a une ZLC
							} else {
								prob_counter = prob_counter + layer_type.trust;
							}
						}
					}
					var color_array = data.color;
					var alpha_array = data.alpha_array;
					if(prob_counter >0){
						var r = hexToRgb(color_array[prob_counter-1]).r;
						var g = hexToRgb(color_array[prob_counter-1]).g;
						var b = hexToRgb(color_array[prob_counter-1]).b;
						var alpha = alpha_array[prob_counter-1];
							return [r,g,b,alpha];
					}else{
						return [0,0,0,0];
					}
				} else {
					return [0,0,0,0];
				}
			},
			lib: {
				hexToRgb: hexToRgb
		        }
		});

		raster_ZLP.on('beforeoperations', function(event) {
	        event.data.color = color_array;
	        event.data.layer_type_array = layer_type_array;
	        event.data.alpha_array = alpha_array;
	      });

		rank_3_clue_layer_source_array[index_raster].source = raster_ZLP;
		rank_3_clue_layer_source_array[index_raster].layer = new ol.layer.Image({
			id:  "id_rank_3_" + rank_3_element.id_clue + "_clue_layer",
			title: "rank_3_" + rank_3_element.id_clue + "_clue_layer",
			source: rank_3_clue_layer_source_array[f].source});

		rank_3_clue_layer_source_array[index_raster].layer.setZIndex(150);

		for(var a=0; a<active_map.length; a++){
			switch(active_map[a]){
			case 'map_1':
				map_1.addLayer(rank_3_clue_layer_source_array[index_raster].layer);
				break;
			case 'map_2':
				map_2.addLayer(rank_3_clue_layer_source_array[index_raster].layer);
				break;
			case 'map_3':
				map_3.addLayer(rank_3_clue_layer_source_array[index_raster].layer);
				break;
			case 'map_4':
				map_4.addLayer(rank_3_clue_layer_source_array[index_raster].layer);
				break;
				default:
			}
		}
	}




}

function create_grid_from_feature(id_clue,extent,resolution){
	var grid_size= [parseInt((extent[2] - extent[0])/resolution),parseInt((extent[3] - extent[1])/resolution)];
	var img_buffer = new Uint8ClampedArray(grid_size[0] * grid_size[1] * 4);
	for(var y = 0; y < grid_size[1]; y++){
		for(var x = 0; x < grid_size[0]; x++){
//			var counter = img_buffer.length - (y*grid_size[0] + x + 1)*4;
			var counter = (y*grid_size[0] + x)*4;
			var is_inside = false;
			var features = rank_2_clue_source.getFeaturesAtCoordinate([extent[0] + x*resolution,extent[3] - y*resolution]);
			if(features.length >0){
				for(var f=0; f<features.length; f++){
					if(id_clue == parseInt(features[f].get('id_clue'))){
						is_inside=true;
						break;
					}
				}
			}
			if(is_inside == true){
				img_buffer[counter] = 255;
				img_buffer[counter + 1] = 0;
				img_buffer[counter + 2] = 0;
				img_buffer[counter + 3] = 255;
			} else {
				img_buffer[counter] = 255;
				img_buffer[counter + 1] = 0;
				img_buffer[counter + 2] = 0;
				img_buffer[counter + 3] = 0;
			}
		}
	}

	var raster_data = {'id_clue':id_clue,'extent':extent,'img_buffer':img_buffer, 'width':grid_size[0], 'height':grid_size[1]};

	var canvas = document.createElement('canvas'),
    context = canvas.getContext('2d'),
    imgData = context.createImageData(raster_data.width, raster_data.height),
    img_buffer = raster_data.img_buffer;
	canvas.width = raster_data.width;
	canvas.height = raster_data.height;
	imgData.data.set(img_buffer);
	context.putImageData(imgData, 0, 0);
	var img = new Image();
	img.src = canvas.toDataURL('image_raster/png');
	var projection = new ol.proj.Projection({
      code: 'EPSG:3857',
      extent: raster_data.extent
    });
	var image = new ol.source.ImageStatic({
			attributions:raster_data.id_clue,
        url: img.src,
        projection: projection,
        imageExtent: raster_data.extent
      });

	return {'id_clue':raster_data.id_clue, 'image': image};
}

function create_grid_from_ZRI(extent,resolution){
	var grid_size= [parseInt((extent[2] - extent[0])/resolution),parseInt((extent[3] - extent[1])/resolution)];
	var img_buffer = new Uint8ClampedArray(grid_size[0] * grid_size[1] * 4);
	for(var y = 0; y < grid_size[1]; y++){
		for(var x = 0; x < grid_size[0]; x++){
//			var counter = img_buffer.length - (y*grid_size[0] + x + 1)*4;
			var counter = (y*grid_size[0] + x)*4;
			img_buffer[counter] = 255;
			img_buffer[counter + 1] = 0;
			img_buffer[counter + 2] = 0;
			img_buffer[counter + 3] = 255;
		}
	}

	var raster_data = {'extent':extent,'img_buffer':img_buffer, 'width':grid_size[0], 'height':grid_size[1]};

	var canvas = document.createElement('canvas'),
    context = canvas.getContext('2d'),
    imgData = context.createImageData(raster_data.width, raster_data.height),
    img_buffer = raster_data.img_buffer;
	canvas.width = raster_data.width;
	canvas.height = raster_data.height;
	imgData.data.set(img_buffer);
	context.putImageData(imgData, 0, 0);
	var img = new Image();
	img.src = canvas.toDataURL('image_raster/png');
	var projection = new ol.proj.Projection({
      code: 'EPSG:3857',
      extent: raster_data.extent
    });
	var image = new ol.source.ImageStatic({
			attributions:'ZRI',
        url: img.src,
        projection: projection,
        imageExtent: raster_data.extent
      });

	return {'id_clue':'ZRI', 'image': image};
}

export {add_object_of_interest_on_hover_to_map,
	remove_all_clue_map_elements_of_hover,
	add_element_of_reference,
	put_clue_map_elements_to_hover,
	clear_clue_to_select_state,
	put_clue_map_element_to_select,
	create_trajectory_point,
	suppress_element_of_reference,
	create_buffer,
	add_rank_2_clue_to_map,
	getcolor_of_rank_2_feature,
	put_clue_map_elements_2_to_hover,
	suppress_rank_2_item,
	union_feature,
	add_object_of_interest_to_map,
	put_clue_map_element_2_to_select,
	add_rank_3_clue_to_map,
	suppress_rank_3_clue_to_map,
	show_hide_clue_objects,
	add_draw_buffer_to_map,
	add_draw_buffer_multi_polygon_to_map,
	map_element_worker,
	add_element_of_reference_itinary,
	intersect_all_features,
	initialize_small_multiples,
	redraw_small_multiple_buttons,
	reset_ZRI,
	get_geometry_type_color,
	create_grid,
	create_grid_2,
	create_rank_3_clue_raster,
	suppress_rank_3_raster_from_map};
