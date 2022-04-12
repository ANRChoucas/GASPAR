import {app} from "./clue_element.js";
import {svg_clue_container,
	svg_container,
//	clue_window_scale_x,
//	clue_window_scale_y,
	right_click_clue_element} from "./add_clue_from_clue_window.js";
import {remove_all_clue_map_elements_of_hover,
	put_clue_map_elements_to_hover,
	clear_clue_to_select_state,
	put_clue_map_element_to_select,
	getcolor_of_rank_2_feature,
	put_clue_map_elements_2_to_hover,
	put_clue_map_element_2_to_select,
	add_rank_3_clue_to_map,
	create_rank_3_clue_raster,
	show_hide_clue_objects,
	redraw_small_multiple_buttons,
	get_geometry_type_color} from "./map_element.js";
import {itemTypeToColor,
	colorToRGB} from "./choucas_styling.js";
import {begining_point_color,
	past_point_color,
	to_pass_point_color,
	destination_point_color,
	begining_point_url,
	to_pass_point_url,
	past_point_url,
	destination_point_url,
	rgbToHex,
	hexToRgb,
	LightenDarkenColor,
	getRandomColor} from "./color_function.js";
import {add_add_clue_menu_settings} from './add_clue_from_clue_window.js';

/*
 * var used to store graphic const for select and hover event
 *
 */
const hover_color_hexa = "#bae5e0";
const select_color_hexa = "#001b8a";



/*
 *	constantes graphiques pour les éléments de la fenêtre d'indices
 */
const number_of_horizontal_units = 900;
const number_of_vertical_units = 1000
const clue_element_width = 280;
const clue_element_height = 100;
const clue_element_inter_width = 10;
const clue_element_inter_height = 10;
const y_clue_element = 10;
const x_rank_1_element = 10;
const x_rank_2_element_1 = 300;
const x_rank_2_element_2 = 410;
const x_rank_3_element = 720;
const clue_rank_3_element_width = 50;
const clue_rank_3_element_height = 50;
const policy_size = "12px";


var vertical_translation = 0;
var horizontal_translation = 0;


/*
 * variable used to store clue element color changing function
 */
var color_change_function;

/*
 * variable used to know if a clue_element has already been clicked or not
 */
var clue_element_is_clicked;


/*
 * redraw_clue_window
 *
 * redraw clue window from lists of clue elements
 *
 */
function redraw_clue_window(){

	d3.selectAll(".clue_window_element").remove();

	var rank_1_clue_in_window = [];
	var rank_2_clue_in_window = [];

	var begining_point_id_array = [];
	var past_point_id_array = [];
	var to_pass_point_id_array = [];
	var destination_point_id_array = [];
	var element_of_reference_id_array = [];

	for(var i=0; i< app.list_of_rank_1_clue.length; i++){
		switch(app.list_of_rank_1_clue[i].type_clue){
		case 'begining_point':
			begining_point_id_array.push(app.list_of_rank_1_clue[i].id_clue);
		    break;
		case 'past_point':
			past_point_id_array.push(app.list_of_rank_1_clue[i].id_clue);
		    break;
		case 'to_pass_point':
			to_pass_point_id_array.push(app.list_of_rank_1_clue[i].id_clue);
		    break;
		case 'destination_point':
			destination_point_id_array.push(app.list_of_rank_1_clue[i].id_clue);
		    break;
		default:
			element_of_reference_id_array.push(app.list_of_rank_1_clue[i].id_clue);
		}
	}

	past_point_id_array.sort();
	to_pass_point_id_array.sort();

	for(var i=0; i< app.list_of_rank_1_clue.length; i++){
		if(app.list_of_rank_1_clue[i].id_clue == begining_point_id_array[0]){
			add_rank_1_clue_to_window(app.list_of_rank_1_clue[i],rank_1_clue_in_window.length);
			rank_1_clue_in_window.push(app.list_of_rank_1_clue[i].id_clue);
			break;
		}
	}

	for(var j=0; j< past_point_id_array.length; j++){
		for(var i=0; i< app.list_of_rank_1_clue.length; i++){
			if(app.list_of_rank_1_clue[i].id_clue == past_point_id_array[j]){
				add_rank_1_clue_to_window(app.list_of_rank_1_clue[i],rank_1_clue_in_window.length);
				rank_1_clue_in_window.push(app.list_of_rank_1_clue[i].id_clue);
				break;
			}
		}
	}

	for(var j=0; j< to_pass_point_id_array.length; j++){
		for(var i=0; i< app.list_of_rank_1_clue.length; i++){
			if(app.list_of_rank_1_clue[i].id_clue == to_pass_point_id_array[j]){
				add_rank_1_clue_to_window(app.list_of_rank_1_clue[i],rank_1_clue_in_window.length);
				rank_1_clue_in_window.push(app.list_of_rank_1_clue[i].id_clue);
				break;
			}
		}
	}

	for(var i=0; i< app.list_of_rank_1_clue.length; i++){
		if(app.list_of_rank_1_clue[i].id_clue == destination_point_id_array[0]){
			add_rank_1_clue_to_window(app.list_of_rank_1_clue[i],rank_1_clue_in_window.length);
			rank_1_clue_in_window.push(app.list_of_rank_1_clue[i].id_clue);
			break;
		}
	}

	for(var i=0; i< app.list_group_of_rank_1_clue.length; i++){
		if(app.list_group_of_rank_1_clue[i].type_group != "trajectory_points"){
			for(var j=0; j< app.list_group_of_rank_1_clue[i].list_of_clue_id.length; j++){
				for(var o=0; o< app.list_of_rank_1_clue.length; o++){
					if(app.list_of_rank_1_clue[o].id_clue == app.list_group_of_rank_1_clue[i].list_of_clue_id[j]){
						add_rank_1_clue_to_window(app.list_of_rank_1_clue[o],rank_1_clue_in_window.length);
						rank_1_clue_in_window.push(app.list_of_rank_1_clue[o].id_clue);
						break;
					}
				}
			}
		}
	}


	for(var i=0; i< app.list_of_rank_1_clue.length; i++){
		var is_already_in_window = false;
		for(var j=0; j< rank_1_clue_in_window.length; j++){
			if(app.list_of_rank_1_clue[i].id_clue == rank_1_clue_in_window[j]){
				is_already_in_window = true;
				break;
			}
		}
		if(is_already_in_window == false){
			add_rank_1_clue_to_window(app.list_of_rank_1_clue[i],rank_1_clue_in_window.length);
			rank_1_clue_in_window.push(app.list_of_rank_1_clue[i].id_clue);
		}
	}

	for(var i=0; i< app.list_group_rank_1_to_rank_2.length; i++){
		if(app.list_group_rank_1_to_rank_2[i].id_group_rank_1 != null){
			var list_of_rank_1_id;
			for(var f=0; f<app.list_group_of_rank_1_clue.length; f++){
				if(app.list_group_of_rank_1_clue[f].id_group == app.list_group_rank_1_to_rank_2[i].id_group_rank_1){
					list_of_rank_1_id = app.list_group_of_rank_1_clue[f].list_of_clue_id;
					break;
				}
			}

			var rank_1_index_table = [];
			for(var j = 0; j < $(".rank_1_clue_container").length; j++){
				var rank_1_clue_id_calcul = parseInt($(".rank_1_clue_container")[j].id.split('_')[0]);
				for(var g = 0; g < list_of_rank_1_id.length; g++){
					if(list_of_rank_1_id[g] == rank_1_clue_id_calcul){
						rank_1_index_table.push(j);
						continue;
					}
				}
			}
			var rank_2_index = Math.min(...rank_1_index_table);

			var rank_2;
			for(var o=0; o< app.list_of_rank_2_clue.length;o++){
				if(app.list_group_rank_1_to_rank_2[i].id_rank_2 == app.list_of_rank_2_clue[o].id_clue){
					rank_2 = app.list_of_rank_2_clue[o];
					break;
				}
			}
			add_rank_2_clue_to_window(rank_2, rank_2_index,list_of_rank_1_id,app.list_group_rank_1_to_rank_2[i].type_transform);
			rank_2_clue_in_window.push(app.list_group_rank_1_to_rank_2[i].id_rank_2);
		}
	}

	var rank_2_index;
	var number_of_rank_2_without_rank_1 = 0;
	for(var i=0; i< app.list_of_rank_2_clue.length; i++){
		var is_already_in_window = false;
		for(var j=0; j< rank_2_clue_in_window.length; j++){
			if(app.list_of_rank_2_clue[i].id_clue == rank_2_clue_in_window[j]){
				is_already_in_window = true;
				break;
			}
		}
		if(is_already_in_window == false){

			if(number_of_rank_2_without_rank_1 == 0){
				if($(".rank_2_clue_container").length>0 && $(".rank_1_clue_container").length>0){
					if($(".rank_2_clue_container").length > $(".rank_1_clue_container").length){
						rank_2_index = $(".rank_2_clue_container").length;
					} else {
						rank_2_index = $(".rank_1_clue_container").length;
					}
				} else if($(".rank_2_clue_container").length>0){
					rank_2_index = $(".rank_2_clue_container").length;
				} else if($(".rank_1_clue_container").length>0){
					rank_2_index = $(".rank_1_clue_container").length;
				} else {
					rank_2_index =0;
				}
			} else {
				rank_2_index = rank_2_index + 1;
			}

			number_of_rank_2_without_rank_1 = number_of_rank_2_without_rank_1 +1;
//			add_rank_2_clue_to_window(app.list_of_rank_2_clue[i],rank_2_index,[],"dessin");
			add_rank_2_clue_to_window(app.list_of_rank_2_clue[i],rank_2_index,[],app.list_of_rank_2_clue[i].summary);

			rank_2_clue_in_window.push(app.list_of_rank_2_clue[i].id_clue);
		}
	}

	//gestion des éléments de rang 3
	for(var i=0; i<app.list_of_rank_3_clue.length; i++){

		var rank_3_clue_CB_class = app.list_of_rank_3_clue[i].id_clue + "_rank_3_clue_CB rank_3_clue_CB rank_3_clue_window_element clue_window_element";
		var rank_3_clue_container_id = app.list_of_rank_3_clue[i].id_clue + "_rank_3_clue_container";

		var type_zone_width = 100 + 10;
		var x_container = 10 + 280 + type_zone_width + 280 + 10 + i*60;
		var y_container = 10;

		var rank_3_clue_container= svg_clue_container.append("g")
		.attr('id',rank_3_clue_container_id)
		.attr('class',"rank_3_clue_container clue_window_element rank_3_clue_window_element");

		for(var j=0; j<app.list_of_rank_3_clue[i].list_id_clue_rank_2.length; j++){
			add_rank_3_clue_CB_element(rank_3_clue_CB_class,app.list_of_rank_3_clue[i].list_id_clue_rank_2[j].id_clue_rank_2,app.list_of_rank_3_clue[i],rank_3_clue_container,x_container);
		}
	}

	var slider_button_array = d3.selectAll('.clue_slider_button');
	for(var i = 0; i< slider_button_array[0].length; i++){
		d3.select(slider_button_array[0][i]).on("mousedown", function(){
			var div = d3.select(this);
	    	var id_button_element = this.id;
	    	var id_clue = parseInt(this.id.split('_')[0]);
	        var w = d3.select(window).on("mousemove", function(e){
	        	var x_button = d3.mouse(div.node())[0];
	        	change_trust(id_button_element,id_clue,x_button);
		    }).on("mouseup", function(){
		        w.on("mousemove", null).on("mouseup", null);
		        clue_element_is_clicked = true;
				setTimeout(function(){ clue_element_is_clicked = false; }, 500);
		    })
		});

	}

	var inout_button_array = d3.selectAll('.clue_inout_button');
	for(var i = 0; i< inout_button_array[0].length; i++){
		d3.select(inout_button_array[0][i]).on("click", function(){
			var id_clue = parseInt(this.id.split('_')[0]);
			var url_inout_image;
			for(var j = 0; j< app.list_of_rank_2_clue.length; j++){
				if(app.list_of_rank_2_clue[j].id_clue == id_clue){
					if(app.list_of_rank_2_clue[j].is_inside == true){
						app.list_of_rank_2_clue[j].is_inside = false;
						app.list_of_rank_2_clue[j].negative_of_zone = false;
						url_inout_image = 'image/icone_out.png';
					} else if(app.list_of_rank_2_clue[j].is_inside == false && app.list_of_rank_2_clue[j].negative_of_zone == false){
						app.list_of_rank_2_clue[j].is_inside = false;
						app.list_of_rank_2_clue[j].negative_of_zone = true;
						url_inout_image = 'image/incone_out_negative.png';
					} else if(app.list_of_rank_2_clue[j].is_inside == false && app.list_of_rank_2_clue[j].negative_of_zone == true){
						app.list_of_rank_2_clue[j].is_inside = true;
						app.list_of_rank_2_clue[j].negative_of_zone = false;
						url_inout_image = 'image/icone_in.png';
					}
					break;
				}
			}
			d3.select(this).attr('xlink:href', url_inout_image);
			for(var i = 0; i< app.list_of_rank_3_clue.length; i++){
				var reset = false;
				for(var j = 0; j< app.list_of_rank_3_clue[i].list_id_clue_rank_2.length; j++){
					if(app.list_of_rank_3_clue[i].list_id_clue_rank_2[j].id_clue_rank_2 == id_clue && app.list_of_rank_3_clue[i].list_id_clue_rank_2[j].selected == true){
						reset = true;
						break;
					}
				}
				if(reset == true){
					create_rank_3_clue_raster(app.list_of_rank_3_clue[i]);
				}
			}
		});
	}

	d3.selectAll('.wrap').call(wrap);

	$(".rank_3_clue_CB").on("click",function(e) {

		var id_rank_3_element = parseInt(this.id.split('_')[0]);
		var id_rank_2_element = parseInt(this.id.split('_')[1]);

		if($(this).attr('is_selected') == 'true'){
			for(var i=0; i< app.list_of_rank_3_clue.length; i++){
				if(app.list_of_rank_3_clue[i].id_clue == id_rank_3_element){
					for(var j=0; j< app.list_of_rank_3_clue[i].list_id_clue_rank_2.length; j++){
						if(app.list_of_rank_3_clue[i].list_id_clue_rank_2[j].id_clue_rank_2 == id_rank_2_element){
							app.list_of_rank_3_clue[i].list_id_clue_rank_2[j].selected = false;
							break;
						}
					}
					$("." + id_rank_3_element + "_" + id_rank_2_element + "_rank_3_clue_CB_check").css({ stroke: 'rgba(' + 255 + ',' + 255 + ',' + 255 + ',1)' });
//					$(this).css({ fill: 'rgba(' + 255 + ',' + 255 + ',' + 255 + ',1)' });
					$(this).attr('is_selected','false');
//					add_rank_3_clue_to_map(app.list_of_rank_3_clue[i]);
//					create_rank_3_clue_raster(app.list_of_rank_3_clue[i]);
					create_rank_3_clue_raster(app.list_of_rank_3_clue[i]);
					break;
				}
			}
		} else {
			for(var i=0; i< app.list_of_rank_3_clue.length; i++){
				if(app.list_of_rank_3_clue[i].id_clue == id_rank_3_element){
					for(var j=0; j< app.list_of_rank_3_clue[i].list_id_clue_rank_2.length; j++){
						if(app.list_of_rank_3_clue[i].list_id_clue_rank_2[j].id_clue_rank_2 == id_rank_2_element){
							app.list_of_rank_3_clue[i].list_id_clue_rank_2[j].selected = true;
							break;
						}
					}
					$("." + id_rank_3_element + "_" + id_rank_2_element + "_rank_3_clue_CB_check").css({ stroke: 'rgba(' + app.list_of_rank_3_clue[i].rank_3_color.r + ',' + app.list_of_rank_3_clue[i].rank_3_color.g + ',' + app.list_of_rank_3_clue[i].rank_3_color.b + ',1)' });
//					$(this).css({ fill: 'rgba(' + app.list_of_rank_3_clue[i].rank_3_color.r + ',' + app.list_of_rank_3_clue[i].rank_3_color.g + ',' + app.list_of_rank_3_clue[i].rank_3_color.b + ',1)' });
					$(this).attr('is_selected','true');
//					add_rank_3_clue_to_map(app.list_of_rank_3_clue[i]);
					create_rank_3_clue_raster(app.list_of_rank_3_clue[i]);
					break;
				}
			}
		}


	});



	/*
	 * ajout du scroll horizontal et vertical
	 *
	 */

	var max_height = 0;
	for(var i = 0; i < $('.rank_1_clue_limits').length; i++){
		var new_y = parseFloat($($('.rank_1_clue_limits')[i]).attr('y')) + parseFloat($($('.rank_1_clue_limits')[i]).attr('height')) + 10;
		if(new_y > max_height){
			max_height = new_y;
		}
	}
	for(var i = 0; i < $('.rank_2_clue_limits').length; i++){
		var new_y = parseFloat($($('.rank_2_clue_limits')[i]).attr('y')) + parseFloat($($('.rank_2_clue_limits')[i]).attr('height')) + 10;
		if(new_y > max_height){
			max_height = new_y;
		}
	}


	var max_width = 0;
	for(var i = 0; i < $('.rank_3_clue_CB').length; i++){
		var new_x = parseFloat($($('.rank_3_clue_CB')[i]).attr('x')) + parseFloat($($('.rank_3_clue_CB')[i]).attr('width')) + 10;
		if(new_x > max_width){
			max_width = new_x;
		}
	}

	if(max_height > (parseFloat($('#svg_container').height()) - 11)){
		var vertical_scroller_container = svg_container.append("g")
		.attr('id',"vertical_scroller_container")
		.attr('class',"vertical_scroller_element clue_window_element");

		var x_scroller = parseFloat($('#svg_container').width()) - 10;
		var y_scroller = 0;
		var width_scroller = 10;
		var heigth_scroller_bottom = parseFloat($('#svg_container').height()) - 11;

		var heigth_scroller = ((parseFloat($('#svg_container').height())-11)/max_height)*(parseFloat($('#svg_container').height())-11);

		vertical_scroller_container.append("rect")
			.attr('id',"vertical_scroller_bottom")
			.attr('class',"vertical_scroller_element clue_window_element")
		    .attr("x", x_scroller)
		    .attr("y", y_scroller)
			.attr("width", width_scroller)
			.attr("height", heigth_scroller_bottom)
		    .attr("fill", "#e9e9e9")
		  	.attr("stroke-width", 1)
			.attr("stroke", "white");

		vertical_scroller_container.append("rect")
		.attr('id',"vertical_scroller")
		.attr('class',"vertical_scroller_element clue_window_element")
	    .attr("x", x_scroller)
	    .attr("y", y_scroller)
		.attr("width", width_scroller)
		.attr("height", heigth_scroller)
	    .attr("fill", "#bebebe")
	  	.attr("stroke-width", 0);

	}

	if(max_width > (parseFloat($('#svg_container').width()) - 11)){

		var horizontal_scroller_container = svg_container.append("g")
		.attr('id',"horizontal_scroller_container")
		.attr('class',"horizontal_scroller_element clue_window_element");

		var x_scroller = 0;
		var y_scroller = parseFloat($('#svg_container').height()) - 10;
		var width_scroller_bottom = parseFloat($('#svg_container').width()) - 11;
		var heigth_scroller = 10;

		var width_scroller = ((parseFloat($('#svg_container').width()) - 11)/max_width)*(parseFloat($('#svg_container').width()) - 11);

		horizontal_scroller_container.append("rect")
		.attr('id',"horizontal_scroller_bottom")
		.attr('class',"horizontal_scroller_element clue_window_element")
	    .attr("x", x_scroller)
	    .attr("y", y_scroller)
		.attr("width", width_scroller_bottom)
		.attr("height", heigth_scroller)
	    .attr("fill", "#e9e9e9")
	  	.attr("stroke-width", 1)
		.attr("stroke", "white");

		horizontal_scroller_container.append("rect")
		.attr('id',"horizontal_scroller")
		.attr('class',"horizontal_scroller_element clue_window_element")
	    .attr("x", x_scroller)
	    .attr("y", y_scroller)
		.attr("width", width_scroller)
		.attr("height", heigth_scroller)
	    .attr("fill", "#bebebe")
	  	.attr("stroke-width", 0);
	}

	/*
	 * gestion des événements hover et clic sur la fenêtre d'indices
	 *
	 */

	/*
	 * événement clic
	 */

	$("#svg_clue_window_container").on("click",function(e) {
		if(e.target.id == "svg_clue_window_container"){
			//déselection des éléments
			remove_all_clue_of_select();
		}
	})

	clue_element_is_clicked = false;

	$(".clue_window_element").on("click",function(e) {
		if($(this).hasClass('clue_visible_button')){
			change_clue_visibility(this);
			clue_element_is_clicked = true;
			setTimeout(function(){ clue_element_is_clicked = false; }, 500);
		} else if($(this).hasClass('clue_slider_button')){
			clue_element_is_clicked = true;
			setTimeout(function(){ clue_element_is_clicked = false; }, 500);
		} else if($(this).hasClass('clue_inout_button')){
			clue_element_is_clicked = true;
			setTimeout(function(){ clue_element_is_clicked = false; }, 500);
		} else if($(this).hasClass('rank_1_clue_container') || $(this).hasClass('rank_2_clue_container')){
			if(clue_element_is_clicked == false){
				select_clue_on_clue_window(e, this);
				clue_element_is_clicked = true;
				setTimeout(function(){ clue_element_is_clicked = false; }, 500);
			}
		}
	});

	/*
	 * événement hover
	 */

	$(".clue_window_element").on("mouseenter",function(e) {
		//hover, mise en valeur de l'élément en hover
		if($(this).hasClass("rank_1_clue_container")){
			var id_clue = $(this).attr('id').split('_')[0];
			put_clue_to_hover(id_clue);
			return;
		} else if($(this).hasClass("rank_2_clue_container")){
			var id_clue = $(this).attr('id').split('_')[0];
			put_clue_2_to_hover(id_clue);
			return;
		}
	});

	$(".clue_window_element").on("mouseleave",function(e) {
		//fin de hover
		if($(this).hasClass("rank_1_clue_container") || $(this).hasClass("rank_2_clue_container")){
			remove_all_clue_of_hover();
		}
	});

	/*
	 * gestion du clic droit sur les éléments de la fenêtre
	 */

	$(".clue_window_element").contextmenu(function(e) {
		$('.clue_window_menu').css("display","none");
		$('.map_filter_menu').css("display","none");
		$('.add_clue_from_tree_menu').css("display","none");
		e.preventDefault();
		if(e.shiftKey == true){
			$('#popup_div_add-clue-menu').show();
			add_add_clue_menu_settings(this,"clue_window");
			return;
		}

		window.event.returnValue = false;
		right_clic_on_clue_window_element(e, this);

	});


	/*
	 * gestion du scroll horizontal et vertical
	 *
	 */


	d3.select('#vertical_scroller').attr('y',parseFloat($('#vertical_scroller_bottom').attr('y')) + vertical_translation);
	d3.select('#horizontal_scroller').attr('x',parseFloat($('#horizontal_scroller_bottom').attr('x')) + horizontal_translation);
	d3.select('#svg_clue_window_container').attr("transform", "translate(" + (-1*horizontal_translation) + "," + (-1*vertical_translation) + ")");

	if($('#vertical_scroller_container').length > 0){

		$('#vertical_scroller').on("mousedown", function(evt_down){

			var initial_y = evt_down.offsetY;

			var initial_scroller_y = parseFloat($('#vertical_scroller').attr('y'));

			$(document).on("mousemove", function(evt_move){
				var new_y = evt_move.offsetY;
				var y_diff = new_y - initial_y;

				var scroller_y = parseFloat($('#vertical_scroller').attr('y'));
				var y_min = parseFloat($('#vertical_scroller_bottom').attr('y'));
				var y_max = parseFloat($('#vertical_scroller_bottom').attr('height')) - parseFloat($('#vertical_scroller').attr('height'));

				if(y_diff < 0){
					if(y_min < initial_scroller_y + y_diff){
						d3.select('#vertical_scroller').attr('y',initial_scroller_y + y_diff);
						var y_to_translate = (parseFloat($('#vertical_scroller').attr('y')) / parseFloat($('#vertical_scroller_bottom').attr('height')))*max_height;
						d3.select('#svg_clue_window_container').attr("transform", "translate(" + 0 + "," + (-1*y_to_translate) + ")");
						vertical_translation = y_to_translate;
					} else if(new_y < y_min) {
						d3.select('#vertical_scroller').attr('y',y_min);
						d3.select('#svg_clue_window_container').attr("transform", "translate(" + 0 + "," + 0 + ")");
						vertical_translation = 0;
					} else {
						d3.select('#vertical_scroller').attr('y',y_min);
						d3.select('#svg_clue_window_container').attr("transform", "translate(" + 0 + "," + 0 + ")");
						vertical_translation = 0;
					}
				} else if(y_diff > 0){
					if(y_max > initial_scroller_y + y_diff){
						d3.select('#vertical_scroller').attr('y',initial_scroller_y + y_diff);
						var y_to_translate = (parseFloat($('#vertical_scroller').attr('y')) / parseFloat($('#vertical_scroller_bottom').attr('height')))*max_height;
						d3.select('#svg_clue_window_container').attr("transform", "translate(" + 0 + "," + (-1*y_to_translate) + ")");
						vertical_translation = y_to_translate;
					} else if(new_y > y_max) {
						d3.select('#vertical_scroller').attr('y',y_max);
						var y_to_translate = (y_max / parseFloat($('#vertical_scroller_bottom').attr('height')))*max_height;
						d3.select('#svg_clue_window_container').attr("transform", "translate(" + 0 + "," + (-1*y_to_translate) + ")");
						vertical_translation = y_to_translate;
					} else {
						d3.select('#vertical_scroller').attr('y',y_max);
						var y_to_translate = (y_max / parseFloat($('#vertical_scroller_bottom').attr('height')))*max_height;
						d3.select('#svg_clue_window_container').attr("transform", "translate(" + 0 + "," + (-1*y_to_translate) + ")");
						vertical_translation = y_to_translate;
					}
				} else {
					d3.select('#vertical_scroller').attr('y',initial_scroller_y + y_diff);
					var y_to_translate = (parseFloat($('#vertical_scroller').attr('y')) / parseFloat($('#vertical_scroller_bottom').attr('height')))*max_height;
					d3.select('#svg_clue_window_container').attr("transform", "translate(" + 0 + "," + (-1*y_to_translate) + ")");
					vertical_translation = y_to_translate;
				}

			})

			$(document).on("mouseup", function(){
				$(document).unbind("mousemove")
				$(document).unbind("mouseup")
			})

		});

		$('#vertical_scroller_bottom').on("click", function(evt_down){
			if(evt_down.offsetY < parseFloat($('#vertical_scroller').attr('y'))){
				d3.select('#vertical_scroller').attr('y',evt_down.offsetY);
				var y_to_translate = (parseFloat($('#vertical_scroller').attr('y')) / parseFloat($('#vertical_scroller_bottom').attr('height')))*max_height;
				d3.select('#svg_clue_window_container').attr("transform", "translate(" + 0 + "," + (-1*y_to_translate) + ")");
				vertical_translation = y_to_translate;
			} else if(evt_down.offsetY > (parseFloat($('#vertical_scroller').attr('y')) + parseFloat($('#vertical_scroller').attr('height')))) {
				d3.select('#vertical_scroller').attr('y',(evt_down.offsetY - parseFloat($('#vertical_scroller').attr('height'))));
				var y_to_translate = (parseFloat($('#vertical_scroller').attr('y')) / parseFloat($('#vertical_scroller_bottom').attr('height')))*max_height;
				d3.select('#svg_clue_window_container').attr("transform", "translate(" + 0 + "," + (-1*y_to_translate) + ")");
				vertical_translation = y_to_translate;
			}
		});

	}


	if($('#horizontal_scroller_container').length > 0){

		$('#horizontal_scroller').on("mousedown", function(evt_down){

			var initial_x = evt_down.clientX;

			var initial_scroller_x = parseFloat($('#horizontal_scroller').attr('x'));

			$(document).on("mousemove", function(evt_move){
				var new_x = evt_move.clientX;
				var x_diff = new_x - initial_x;

				var scroller_x = parseFloat($('#horizontal_scroller').attr('x'));
				var x_min = parseFloat($('#horizontal_scroller_bottom').attr('x'));
				var x_max = parseFloat($('#horizontal_scroller_bottom').attr('width')) - parseFloat($('#horizontal_scroller').attr('width'));

				if(x_diff < 0){
					if(x_min < initial_scroller_x + x_diff){
						d3.select('#horizontal_scroller').attr('x',initial_scroller_x + x_diff);
						var x_to_translate = (parseFloat($('#horizontal_scroller').attr('x')) / parseFloat($('#horizontal_scroller_bottom').attr('width')))*max_width
						d3.select('#svg_clue_window_container').attr("transform", "translate(" + (-1*x_to_translate) + "," + 0 + ")");
						horizontal_translation = x_to_translate;
					} else if(new_x < x_min) {
						d3.select('#horizontal_scroller').attr('x',x_min);
						d3.select('#svg_clue_window_container').attr("transform", "translate(" + 0 + "," + 0 + ")");
						horizontal_translation = 0;
					} else {
						d3.select('#horizontal_scroller').attr('x',x_min);
						d3.select('#svg_clue_window_container').attr("transform", "translate(" + 0 + "," + 0 + ")");
						horizontal_translation = 0;
					}
				} else if(x_diff > 0){
					if(x_max > initial_scroller_x + x_diff){
						d3.select('#horizontal_scroller').attr('x',initial_scroller_x + x_diff);
						var x_to_translate = (parseFloat($('#horizontal_scroller').attr('x')) / parseFloat($('#horizontal_scroller_bottom').attr('width')))*max_width;
						d3.select('#svg_clue_window_container').attr("transform", "translate(" + (-1*x_to_translate) + "," + 0 + ")");
						horizontal_translation = x_diff;
					} else if(new_x > x_max) {
						d3.select('#horizontal_scroller').attr('x',x_max);
						var x_to_translate = (x_max / parseFloat($('#horizontal_scroller_bottom').attr('width')))*max_width;
						d3.select('#svg_clue_window_container').attr("transform", "translate(" + (-1*x_to_translate) + "," + 0 + ")");
						horizontal_translation = x_to_translate;
					} else {
						d3.select('#horizontal_scroller').attr('x',x_max);
						var x_to_translate = (x_max / parseFloat($('#horizontal_scroller_bottom').attr('width')))*max_width;
						d3.select('#svg_clue_window_container').attr("transform", "translate(" + (-1*x_to_translate) + "," + 0 + ")");
						horizontal_translation = x_to_translate;
					}
				} else {
					d3.select('#horizontal_scroller').attr('x',initial_scroller_x + x_diff);
					var x_to_translate = (parseFloat($('#horizontal_scroller').attr('x')) / parseFloat($('#horizontal_scroller_bottom').attr('width')))*max_width;
					d3.select('#svg_clue_window_container').attr("transform", "translate(" + (-1*x_to_translate) + "," + 0 + ")");
					horizontal_translation = x_to_translate;
				}

			})

			$(document).on("mouseup", function(){
				$(document).unbind("mousemove")
				$(document).unbind("mouseup")
			})

		});


		$('#horizontal_scroller_bottom').on("click", function(evt_down){
			if(evt_down.offsetX < parseFloat($('#horizontal_scroller').attr('x'))){
				d3.select('#horizontal_scroller').attr('x',evt_down.clientX);
				var x_to_translate = (parseFloat($('#horizontal_scroller').attr('x')) / parseFloat($('#horizontal_scroller_bottom').attr('width')))*max_width;
				d3.select('#svg_clue_window_container').attr("transform", "translate(" + (-1*x_to_translate) + "," + 0 + ")");
				horizontal_translation = x_to_translate;
			} else if(evt_down.offsetX > (parseFloat($('#horizontal_scroller').attr('x')) + parseFloat($('#horizontal_scroller').attr('width')))) {
				d3.select('#horizontal_scroller').attr('x',(evt_down.clientX - parseFloat($('#horizontal_scroller').attr('width'))));
				var x_to_translate = (parseFloat($('#horizontal_scroller').attr('x')) / parseFloat($('#horizontal_scroller_bottom').attr('width')))*max_width;
				d3.select('#svg_clue_window_container').attr("transform", "translate(" + (-1*x_to_translate) + "," + 0 + ")");
				horizontal_translation = x_to_translate;
			}
		});

	}

	redraw_small_multiple_buttons();
}

/*
 * add_rank_1_clue_to_window
 *
 * add rank_1 element in clue window
 * rank_1_clue: rank_1 element
 * index: position of rank_1 element in clue window from top to bottom
 *
 */
function add_rank_1_clue_to_window(rank_1_clue,index){

	var clue_window_scale_x = d3.scale.linear()
	.domain([0, number_of_horizontal_units])
	.range([0, (parseFloat($('#svg_container').width())-11)]);
	var clue_window_scale_y = d3.scale.linear()
	.domain([0, number_of_vertical_units])
	.range([0, (parseFloat($('#svg_container').height())-11)]);

	var rank_1_clue_container_id = rank_1_clue.id_clue + "_rank_1_clue_container";
	var rank_1_clue_limits_id = rank_1_clue.id_clue + "_rank_1_clue_limits";
	var rank_1_clue_icon_id = rank_1_clue.id_clue + "_rank_1_clue_icon";

	var rank_1_clue_element_class = rank_1_clue.type_clue + "_rank_1_clue_element rank_1_clue_window_element";

	var x_container = x_rank_1_element;
	var y_container = y_clue_element + index*(clue_element_height + clue_element_inter_height);
	var x_center_symbol = parseInt(clue_element_width/5);
	var y_center_symbol = parseInt(clue_element_height/2);
	var size_symbol = parseInt(clue_element_width*(1.5/5));
	var x_center_text = parseInt(clue_element_width*(2/5));
	var y_center_text = parseInt(clue_element_height*(1/2));
	var width_text = parseInt(clue_element_width*(1/2));


	var rank_1_clue_container= svg_clue_container.append("g")
	.attr('id',rank_1_clue_container_id)
	.attr('class',rank_1_clue_element_class + " rank_1_clue_container clue_window_element");

	rank_1_clue_container.append("rect")
		.attr('id',rank_1_clue_limits_id)
		.attr('class',rank_1_clue_element_class + " rank_1_clue_limits clue_window_element")
	    .attr("x", clue_window_scale_x(x_container))
	    .attr("y", clue_window_scale_y(y_container))
		.attr("width", clue_window_scale_x(clue_element_width))
		.attr("height", clue_window_scale_y(clue_element_height))
	    .attr("fill", "white")
	  	.attr("stroke-width", 1)
	  	.attr("stroke",  "black");

	rank_1_clue_container.append('text')
		.attr('id',rank_1_clue.id_clue + "_major_text_rank_1_clue" + rank_1_clue.id_clue)
		.attr('class',rank_1_clue_element_class + " rank_1_clue_text clue_window_element wrap")
		.attr("x", clue_window_scale_x(x_center_text))
	    .attr("y", clue_window_scale_y(y_center_text))
	    .attr("width", clue_window_scale_x(width_text))
		.text(rank_1_clue.summary)
		.attr("font-family", "sans-serif")
		.style("font-size", policy_size)
		.attr("fill", "black")
	.attr("transform", "translate(" + clue_window_scale_x(x_container) + "," + clue_window_scale_y(y_container) + ")");

	add_clue_buttons(rank_1_clue, rank_1_clue_container, rank_1_clue.id_clue, rank_1_clue_element_class, x_container, y_container);

	switch (rank_1_clue.type_clue) {
	  case 'begining_point':
		  add_itinary_point_icon(rank_1_clue_container, x_container, y_container, rank_1_clue.id_clue, rank_1_clue_element_class + " begining_point_window_element clue_window_element", x_center_symbol, y_center_symbol,  size_symbol, begining_point_url);
		    break;
	  case 'past_point':
		  add_itinary_point_icon(rank_1_clue_container, x_container, y_container, rank_1_clue.id_clue, rank_1_clue_element_class + " begining_point_window_element clue_window_element", x_center_symbol, y_center_symbol,  size_symbol, past_point_url);
		  break;
	  case 'to_pass_point':
		  add_itinary_point_icon(rank_1_clue_container, x_container, y_container, rank_1_clue.id_clue, rank_1_clue_element_class + " begining_point_window_element clue_window_element", x_center_symbol, y_center_symbol,  size_symbol, to_pass_point_url);
		  break;
	  case 'destination_point':
		  add_itinary_point_icon(rank_1_clue_container, x_container, y_container, rank_1_clue.id_clue, rank_1_clue_element_class + " begining_point_window_element clue_window_element", x_center_symbol, y_center_symbol,  size_symbol, destination_point_url);
		  break;
	  case 'Grande ville':
		  add_punctual_symbol(rank_1_clue_container,x_container, y_container,rank_1_clue.id_clue, rank_1_clue_element_class + " Grande_ville_window_element clue_window_element", x_center_symbol, y_center_symbol, parseInt(size_symbol*(4/5)/4), "white", parseInt(size_symbol*(1/5)/2), itemTypeToColor.CITY);
		  break;
	  case 'Ville':
		  add_punctual_symbol(rank_1_clue_container,x_container, y_container,rank_1_clue.id_clue, rank_1_clue_element_class + " Ville_window_element clue_window_element", x_center_symbol, y_center_symbol, parseInt(size_symbol*(4/5)/4), "white", parseInt(size_symbol*(1/5)/2), itemTypeToColor.CITY);
		  break;
	  case 'Village':
		  add_punctual_symbol(rank_1_clue_container,x_container, y_container,rank_1_clue.id_clue, rank_1_clue_element_class + " Village_window_element clue_window_element", x_center_symbol, y_center_symbol, parseInt(size_symbol*(4/5)/4), "white", parseInt(size_symbol*(1/5)/2), itemTypeToColor.CITY);
		  break;
	  case 'Sommet':
		  add_punctual_symbol(rank_1_clue_container,x_container, y_container,rank_1_clue.id_clue, rank_1_clue_element_class + " Sommet_window_element clue_window_element", x_center_symbol, y_center_symbol, parseInt(size_symbol*(4/5)/4), "white", parseInt(size_symbol*(1/5)/2), itemTypeToColor.PEAK);
		  break;
	  case 'Col':
		  add_punctual_symbol(rank_1_clue_container,x_container, y_container,rank_1_clue.id_clue, rank_1_clue_element_class + " Col_window_element clue_window_element", x_center_symbol, y_center_symbol, parseInt(size_symbol*(4/5)/4), "white", parseInt(size_symbol*(1/5)/2), itemTypeToColor.COL);
		  break;
	  case 'Lac':
		  var rgb_color = colorToRGB(itemTypeToColor.LAKE);
		  add_polygon_symbol(rank_1_clue_container,x_container, y_container,rank_1_clue.id_clue, rank_1_clue_element_class + " Lac_window_element clue_window_element", x_center_symbol, y_center_symbol, parseInt(size_symbol*(4/5)/2), "white", parseInt(size_symbol*(1/5)/2), itemTypeToColor.LAKE);
		  break;
	  case 'Réservoir':
		  	var rgb_color = colorToRGB(itemTypeToColor.LAKE);
		  add_polygon_symbol(rank_1_clue_container,x_container, y_container,rank_1_clue.id_clue, rank_1_clue_element_class + " Réservoir_window_element clue_window_element", x_center_symbol, y_center_symbol, parseInt(size_symbol*(4/5)/2), "white", parseInt(size_symbol*(1/5)/2), itemTypeToColor.LAKE);
		  break;
	  case 'Autre':
		  var rgb_color = colorToRGB(itemTypeToColor.LAKE);
		  add_polygon_symbol(rank_1_clue_container,x_container, y_container,rank_1_clue.id_clue, rank_1_clue_element_class + " Autre_window_element clue_window_element", x_center_symbol, y_center_symbol, parseInt(size_symbol*(4/5)/2), "white", parseInt(size_symbol*(1/5)/2), itemTypeToColor.LAKE);
		  break;
	  case 'Rivière':
		  add_linear_symbol(rank_1_clue_container,x_container, y_container,rank_1_clue.id_clue, rank_1_clue_element_class + " Rivière_window_element clue_window_element", x_center_symbol, y_center_symbol, parseInt(size_symbol*(4/5)/2), parseInt(size_symbol*(1/5)/2), itemTypeToColor.LAKE);
		  break;
	  case 'Ruisseau':
		  add_linear_symbol(rank_1_clue_container,x_container, y_container,rank_1_clue.id_clue, rank_1_clue_element_class + " Ruisseau_window_element clue_window_element", x_center_symbol, y_center_symbol, parseInt(size_symbol*(4/5)/2), parseInt(size_symbol*(1/5)/2), itemTypeToColor.LAKE);
		  break;
	  case 'LHT 6 brins':
		  add_linear_symbol(rank_1_clue_container,x_container, y_container,rank_1_clue.id_clue, rank_1_clue_element_class + " LHT_6_brins_window_element clue_window_element", x_center_symbol, y_center_symbol, parseInt(size_symbol*(4/5)/2), parseInt(size_symbol*(1/5)/2), itemTypeToColor.POWER6);
		  break;
	  case 'LHT 3 brins':
		  add_linear_symbol(rank_1_clue_container,x_container, y_container,rank_1_clue.id_clue, rank_1_clue_element_class + " LHT_3_brins_window_element clue_window_element", x_center_symbol, y_center_symbol, parseInt(size_symbol*(4/5)/2), parseInt(size_symbol*(1/5)/2), itemTypeToColor.POWER3);
		  break;
	  case 'Equipement éléctrique':
		  add_linear_symbol(rank_1_clue_container,x_container, y_container,rank_1_clue.id_clue, rank_1_clue_element_class + " Equipement_éléctrique_window_element clue_window_element", x_center_symbol, y_center_symbol, parseInt(size_symbol*(4/5)/2), parseInt(size_symbol*(1/5)/2), itemTypeToColor.POWERO);
		  break;
	  case 'Tour téléphonie':
		  add_punctual_symbol(rank_1_clue_container,x_container, y_container,rank_1_clue.id_clue, rank_1_clue_element_class + " Tour_téléphonie_window_element clue_window_element", x_center_symbol, y_center_symbol, parseInt(size_symbol*(4/5)/4), "white", parseInt(size_symbol*(1/5)/2), itemTypeToColor.POWERO);
		  break;
	  case 'Remontée mécanique':
		  add_linear_symbol(rank_1_clue_container,x_container, y_container,rank_1_clue.id_clue, rank_1_clue_element_class + " Remontée_mécanique_window_element clue_window_element", x_center_symbol, y_center_symbol, parseInt(size_symbol*(4/5)/2), parseInt(size_symbol*(1/5)/2), itemTypeToColor.SKILIFT);
		  break;
	  case 'Piste verte':
		  add_linear_symbol(rank_1_clue_container,x_container, y_container,rank_1_clue.id_clue, rank_1_clue_element_class + " Piste_verte_window_element clue_window_element", x_center_symbol, y_center_symbol, parseInt(size_symbol*(4/5)/2), parseInt(size_symbol*(1/5)/2), itemTypeToColor.PISTEGREEN);
		  break;
	  case 'Piste bleue':
		  add_linear_symbol(rank_1_clue_container,x_container, y_container,rank_1_clue.id_clue, rank_1_clue_element_class + " Piste_bleue_window_element clue_window_element", x_center_symbol, y_center_symbol, parseInt(size_symbol*(4/5)/2), parseInt(size_symbol*(1/5)/2), itemTypeToColor.PISTEBLUE);
		  break;
	  case 'Piste rouge':
		  add_linear_symbol(rank_1_clue_container,x_container, y_container,rank_1_clue.id_clue, rank_1_clue_element_class + " Piste_rouge_window_element clue_window_element", x_center_symbol, y_center_symbol, parseInt(size_symbol*(4/5)/2), parseInt(size_symbol*(1/5)/2), itemTypeToColor.PISTERED);
		  break;
	  case 'Piste noire':
		  add_linear_symbol(rank_1_clue_container,x_container, y_container,rank_1_clue.id_clue, rank_1_clue_element_class + " Piste_noire_window_element clue_window_element", x_center_symbol, y_center_symbol, parseInt(size_symbol*(4/5)/2), parseInt(size_symbol*(1/5)/2), itemTypeToColor.PISTEBLACK);
		  break;
	  case 'Sentier de randonnée':
		  add_linear_symbol(rank_1_clue_container,x_container, y_container,rank_1_clue.id_clue, rank_1_clue_element_class + " Sentier_de_randonnée_window_element clue_window_element", x_center_symbol, y_center_symbol, parseInt(size_symbol*(4/5)/2), parseInt(size_symbol*(1/5)/2), itemTypeToColor.PATHWAY);
		  break;
	  case 'Route':
		  add_linear_symbol(rank_1_clue_container,x_container, y_container,rank_1_clue.id_clue, rank_1_clue_element_class + " Route_window_element clue_window_element", x_center_symbol, y_center_symbol, parseInt(size_symbol*(4/5)/2), parseInt(size_symbol*(1/5)/2), itemTypeToColor.ROAD);
		  break;
	  case 'Object_interest_begining_point':
		  add_punctual_symbol(rank_1_clue_container,x_container, y_container,rank_1_clue.id_clue, rank_1_clue_element_class + " Object_interest_window_element clue_window_element", x_center_symbol, y_center_symbol, parseInt(size_symbol*(4/5)/4), "white", parseInt(size_symbol*(1/5)/2), begining_point_color);
		  break;
	  case 'Object_interest_to_pass_point':
		  add_punctual_symbol(rank_1_clue_container,x_container, y_container,rank_1_clue.id_clue, rank_1_clue_element_class + " Object_interest_window_element clue_window_element", x_center_symbol, y_center_symbol, parseInt(size_symbol*(4/5)/4), "white", parseInt(size_symbol*(1/5)/2), to_pass_point_color);
		  break;
	  case 'Object_interest_past_point':
		  add_punctual_symbol(rank_1_clue_container,x_container, y_container,rank_1_clue.id_clue, rank_1_clue_element_class + " Object_interest_window_element clue_window_element", x_center_symbol, y_center_symbol, parseInt(size_symbol*(4/5)/4), "white", parseInt(size_symbol*(1/5)/2), past_point_color);
		  break;
	  case 'Object_interest_destination_point':
		  add_punctual_symbol(rank_1_clue_container,x_container, y_container,rank_1_clue.id_clue, rank_1_clue_element_class + " Object_interest_window_element clue_window_element", x_center_symbol, y_center_symbol, parseInt(size_symbol*(4/5)/4), "white", parseInt(size_symbol*(1/5)/2), destination_point_color);
		  break;
	  case 'Object_interest':
		  add_punctual_symbol(rank_1_clue_container,x_container, y_container,rank_1_clue.id_clue, rank_1_clue_element_class + " Object_interest_window_element clue_window_element", x_center_symbol, y_center_symbol, parseInt(size_symbol*(4/5)/4), "white", parseInt(size_symbol*(1/5)/2), "##0046ff");
		  break;
	  case 'Interviz':
		  add_punctual_symbol(rank_1_clue_container,x_container, y_container,rank_1_clue.id_clue, rank_1_clue_element_class + " Autre_window_element clue_window_element", x_center_symbol, y_center_symbol, parseInt(size_symbol*(4/5)/4), "white", parseInt(size_symbol*(1/5)/2), "#0046ff");
		  break;
	  default:
		  var color_type = get_geometry_type_color(1,rank_1_clue.id_clue);
		  switch(color_type.type){
		  case 'Point':
			  add_punctual_symbol(rank_1_clue_container,x_container, y_container,rank_1_clue.id_clue, rank_1_clue_element_class + " Autre_window_element clue_window_element", x_center_symbol, y_center_symbol, parseInt(size_symbol*(4/5)/4), "white", parseInt(size_symbol*(1/5)/2), color_type.color);
			  break;
		  case 'LineString':
			  add_linear_symbol(rank_1_clue_container,x_container, y_container,rank_1_clue.id_clue, rank_1_clue_element_class + " Sentier_de_randonnée_window_element clue_window_element", x_center_symbol, y_center_symbol, parseInt(size_symbol*(4/5)/2), parseInt(size_symbol*(1/5)/2), color_type.color);
			  break;
		  case 'Polygon':
			  add_polygon_symbol(rank_1_clue_container,x_container, y_container,rank_1_clue.id_clue, rank_1_clue_element_class + " Autre_window_element clue_window_element", x_center_symbol, y_center_symbol, parseInt(size_symbol*(4/5)/2), "white", parseInt(size_symbol*(1/5)/2), color_type.color);
			  break;
		  case 'MultiPolygon':
			  add_polygon_symbol(rank_1_clue_container,x_container, y_container,rank_1_clue.id_clue, rank_1_clue_element_class + " Autre_window_element clue_window_element", x_center_symbol, y_center_symbol, parseInt(size_symbol*(4/5)/2), "white", parseInt(size_symbol*(1/5)/2), color_type.color);
			  break;
			  default:
				  add_punctual_symbol(rank_1_clue_container,x_container, y_container,rank_1_clue.id_clue, rank_1_clue_element_class + " Autre_window_element clue_window_element", x_center_symbol, y_center_symbol, parseInt(size_symbol*(4/5)/4), "white", parseInt(size_symbol*(1/5)/2), "#0046ff");

		  }

	  break;
	}


}


/*
 * add_rank_2_clue_to_window
 *
 * add rank_2 element in clue window
 * rank_2_clue: rank_2 element
 * index: position of rank_1 element in clue window from top to bottom
 * rank_1_elements_id_list: list of id of corresponding rank_1_element
 * type_zone: type of rank_2 element creation
 *
 */
function add_rank_2_clue_to_window(rank_2_clue,index,rank_1_elements_id_list,type_zone){
	// création de l'indice de rang 2, et du lien entre les élements de rang 1 et 2

	var clue_window_scale_x = d3.scale.linear()
	.domain([0, number_of_horizontal_units])
	.range([0, (parseFloat($('#svg_container').width())-11)]);
	var clue_window_scale_y = d3.scale.linear()
	.domain([0, number_of_vertical_units])
	.range([0, (parseFloat($('#svg_container').height())-11)]);

	var rank_2_clue_container_id = rank_2_clue.id_clue + "_rank_2_clue_container";
	var rank_2_clue_limits_id = rank_2_clue.id_clue + "_rank_2_clue_limits";
	var rank_2_clue_icon_id = rank_2_clue.id_clue + "_rank_2_clue_icon";
	var rank_2_clue_type_icon_id = rank_2_clue.id_clue + "_rank_2_clue_type_icon";
	var rank_2_clue_element_class = type_zone + "_rank_2_clue_element rank_2_clue_window_element";

	var x_container_1 = x_rank_2_element_1;
	var x_container_2 = x_rank_2_element_2;
	var y_container = y_clue_element + index*(clue_element_height + clue_element_inter_height);
	var x_center_symbol = parseInt(clue_element_width/5);
	var y_center_symbol = parseInt(clue_element_height/2);
	var size_symbol = parseInt(clue_element_width*(1.5/5));
	var x_center_text = parseInt(clue_element_width*(2/5));
	var y_center_text = parseInt(clue_element_height*(1/2));
	var width_text = parseInt(clue_element_width*(2/5));


	var rank_2_clue_container= svg_clue_container.append("g")
	.attr('id',rank_2_clue_container_id)
	.attr('class',rank_2_clue_element_class + " rank_2_clue_container clue_window_element");

	rank_2_clue_container.append("rect")
		.attr('id',rank_2_clue_limits_id)
		.attr('class',rank_2_clue_element_class + " rank_2_clue_limits clue_window_element wrap")
	    .attr("x", clue_window_scale_x(x_container_2))
	    .attr("y", clue_window_scale_y(y_container))
		.attr("width", clue_window_scale_x(clue_element_width))
		.attr("height", clue_window_scale_y(clue_element_height))
	    .attr("fill", "white")
	  	.attr("stroke-width", 1)
	  	.attr("stroke",  "black");

	add_clue_buttons(rank_2_clue, rank_2_clue_container, rank_2_clue.id_clue, rank_2_clue_element_class, (x_rank_2_element_2), y_container);

	var zone_color;
	var type_icon_url;
	switch (type_zone) {
	  case 'dessin':
		  type_icon_url = "image/pencil.png";
		  zone_color = getcolor_of_rank_2_feature(rank_2_clue.object_clue[0].id_object);
		  break;
	  case 'Buffer':
		  type_icon_url = "image/distance.png";
		  zone_color = getcolor_of_rank_2_feature(rank_2_clue.object_clue[0].id_object);
		  break;
	  case 'Interviz':
		  type_icon_url = "image/visible.png";
		  zone_color = getcolor_of_rank_2_feature(rank_2_clue.object_clue[0].id_object);
		  break;
	  case 'Sunmask':
		  type_icon_url = "image/sun.png";
		  zone_color = getcolor_of_rank_2_feature(rank_2_clue.object_clue[0].id_object);
		  break;
	default:
		break;

	}

	add_polygon_symbol(rank_2_clue_container,x_rank_2_element_2, y_container,rank_2_clue.id_clue, rank_2_clue_element_class + " clue_window_element", x_center_symbol, y_center_symbol, parseInt(size_symbol*(4/5)/2), zone_color.fill_color, parseInt(size_symbol*(1/5)/2), zone_color.stroke_color);
//	add_element_details(rank_1_clue_container,x_container,y_container,rank_1_clue,rank_1_clue_element_class + " rank_1_clue_text clue_window_element");

	switch (type_zone) {
	  case 'dessin':
//		  add_element_details(rank_2_clue_container,x_container + type_zone_width,y_container,rank_2_clue,rank_2_clue_element_class + " rank_2_clue_text clue_window_element");
		  break;
	  case 'Buffer':
		  rank_2_clue_container.append('text')
			.attr('id',rank_2_clue.id_clue + "_minor_text_rank_2_clue")
			.attr('class',rank_2_clue_element_class + " rank_2_clue_text clue_window_element")
			.attr("x", clue_window_scale_x(x_center_text))
		    .attr("y", clue_window_scale_y(y_center_text))
//		    .attr("width", clue_window_scale_x(80))
			.text(rank_2_clue.details)
			.attr("font-family", "sans-serif")
			.attr("font-size", policy_size)
			.attr("fill", "black")
			.attr("transform", "translate(" + clue_window_scale_x(x_rank_2_element_2) + "," + clue_window_scale_y(y_container) + ")");
//		  add_element_details(rank_2_clue_container,x_container + type_zone_width,y_container,rank_2_clue,rank_2_clue_element_class + " rank_2_clue_text clue_window_element");
		  break;
	default:
		break;

	}

	rank_2_clue_container.append('image')
	.attr('id',rank_2_clue_type_icon_id)
	.attr('class',rank_2_clue_element_class + " rank_2_clue_type_icon clue_window_element")
    .attr('xlink:href', type_icon_url)
    .attr("x", clue_window_scale_x(x_container_1))
	    .attr("y", clue_window_scale_y(y_container))
    .attr("width", clue_window_scale_x(x_container_2 - x_container_1 - clue_element_inter_width))
    .attr("height", clue_window_scale_y(clue_element_height));


}


/*
 * add_punctual_symbol_no_stroke
 *
 * add punctual symbol with no stroke to clue element in clue window
 * rank_clue_container: clue element (svg element)
 * x_container: x of clue element
 * y_container: y of clue element
 * id_symbol: id of punctual symbol
 * class_symbol: class of punctual symbol
 * x_center: x of punctual symbol
 * y_center: y of punctual symbol
 * radius: radius of punctual symbol
 * fill_color: color of punctual symbol
 *
 */
function add_punctual_symbol_no_stroke(rank_clue_container,x_clue_container, y_clue_container, id_symbol, class_symbol, x_center, y_center, radius, fill_color){
	var clue_window_scale_x = d3.scale.linear()
	.domain([0, number_of_horizontal_units])
	.range([0, (parseFloat($('#svg_container').width())-11)]);
	var clue_window_scale_y = d3.scale.linear()
	.domain([0, number_of_vertical_units])
	.range([0, (parseFloat($('#svg_container').height())-11)]);

	rank_clue_container.append("circle")
	.attr('id',id_symbol + "_icon")
	.attr('class',class_symbol)
    .attr("cx", clue_window_scale_x(x_center))
    .attr("cy", clue_window_scale_y(y_center))
	.attr("r", clue_window_scale_x(radius))
    .attr("fill", fill_color)
    .attr("transform", "translate(" + clue_window_scale_x(x_clue_container) + "," + clue_window_scale_y(y_clue_container) + ")");
}

/*
 * add_itinary_point_symbol
 *
 * add punctual symbol with no stroke to clue element in clue window
 * rank_clue_container: clue element (svg element)
 * x_container: x of clue element
 * y_container: y of clue element
 * id_symbol: id of punctual symbol
 * class_symbol: class of punctual symbol
 * x_center: x of punctual symbol
 * y_center: y of punctual symbol
 * radius: radius of punctual symbol
 * fill_color: color of punctual symbol
 *
 */
function add_itinary_point_icon(rank_clue_container,x_clue_container, y_clue_container, id_symbol, class_symbol, x_center, y_center, size, image_url){
	var clue_window_scale_x = d3.scale.linear()
	.domain([0, number_of_horizontal_units])
	.range([0, (parseFloat($('#svg_container').width())-11)]);
	var clue_window_scale_y = d3.scale.linear()
	.domain([0, number_of_vertical_units])
	.range([0, (parseFloat($('#svg_container').height())-11)]);

	rank_clue_container.append('image')
	.attr('id',id_symbol + "_icon")
	.attr('class',class_symbol)
	.attr('xlink:href', image_url)
    .attr("x", clue_window_scale_x(x_center - parseInt(size/2)))
    .attr("y", clue_window_scale_y(y_center - parseInt(size/3)))
	.attr("width", clue_window_scale_x(size))
    .attr("height", clue_window_scale_x(size))
    .attr("transform", "translate(" + clue_window_scale_x(x_clue_container) + "," + clue_window_scale_y(y_clue_container) + ")");
}

/*
 * add_punctual_symbol
 *
 * add punctual symbol with stroke to clue element in clue window
 * rank_clue_container: clue element (svg element)
 * x_container: x of clue element
 * y_container: y of clue element
 * id_symbol: id of punctual symbol
 * class_symbol: class of punctual symbol
 * x_center: x of punctual symbol
 * y_center: y of punctual symbol
 * radius: radius of punctual symbol
 * fill_color: color of punctual symbol
 * stroke: stroke width of punctual symbol
 * stroke_color: stroke color of punctual symbol
 *
 */
function add_punctual_symbol(rank_clue_container,x_clue_container, y_clue_container,id_symbol, class_symbol, x_center, y_center, radius, fill_color, stroke, stroke_color){
	var clue_window_scale_x = d3.scale.linear()
	.domain([0, number_of_horizontal_units])
	.range([0, (parseFloat($('#svg_container').width())-11)]);
	var clue_window_scale_y = d3.scale.linear()
	.domain([0, number_of_vertical_units])
	.range([0, (parseFloat($('#svg_container').height())-11)]);

	rank_clue_container.append("circle")
	.attr('id',id_symbol + "_icon")
	.attr('class',class_symbol)
    .attr("cx", clue_window_scale_x(x_center))
    .attr("cy", clue_window_scale_y(y_center))
	.attr("r", clue_window_scale_x(radius))
    .attr("fill", fill_color)
  	.attr("stroke-width", stroke)
  	.attr("stroke", stroke_color)
  	.attr("transform", "translate(" + clue_window_scale_x(x_clue_container) + "," + clue_window_scale_y(y_clue_container) + ")");
}

/*
 * add_linear_symbol
 *
 * add linear symbol to clue element in clue window
 * rank_clue_container: clue element (svg element)
 * x_container: x of clue element
 * y_container: y of clue element
 * id_symbol: id of linear symbol
 * class_symbol: class of linear symbol
 * x_center: x of the center of the linear symbol
 * y_center: y of the center of the linear symbol
 * size: size of the linear symbol
 * stroke: stroke width of linear symbol
 * stroke_color: stroke color of linear symbol
 *
 */
function add_linear_symbol(rank_clue_container,x_clue_container, y_clue_container,id_symbol, class_symbol, x_center, y_center, size, stroke, stroke_color){
	var clue_window_scale_x = d3.scale.linear()
	.domain([0, number_of_horizontal_units])
	.range([0, (parseFloat($('#svg_container').width())-11)]);
	var clue_window_scale_y = d3.scale.linear()
	.domain([0, number_of_vertical_units])
	.range([0, (parseFloat($('#svg_container').height())-11)]);

	rank_clue_container.append("line")
	.attr('id',id_symbol + "_icon")
	.attr('class',class_symbol)
    .attr("x1", clue_window_scale_x(x_center) - clue_window_scale_x(size))
    .attr("x2", clue_window_scale_x(x_center) + clue_window_scale_x(size))
	.attr("y1", clue_window_scale_y(y_center) + clue_window_scale_x(size))
	.attr("y2", clue_window_scale_y(y_center) - clue_window_scale_x(size))
  	.attr("stroke-width", stroke)
  	.attr("stroke",  stroke_color)
  	.attr("transform", "translate(" + clue_window_scale_x(x_clue_container) + "," + clue_window_scale_y(y_clue_container) + ")");
}

/*
 * add_polygon_symbol
 *
 * add polygon symbol to clue element in clue window
 * rank_clue_container: clue element (svg element)
 * x_container: x of clue element
 * y_container: y of clue element
 * id_symbol: id of polygon symbol
 * class_symbol: class of polygon symbol
 * x_center: x of the center of the polygon symbol
 * y_center: y of the center of the polygon symbol
 * size: size of the polygon symbol
 * fill_color: fill color of polygon symbol
 * stroke: stroke width of polygon symbol
 * stroke_color: stroke color of polygon symbol
 *
 */
function add_polygon_symbol(rank_clue_container,x_clue_container, y_clue_container, id_symbol, class_symbol, x_center, y_center, size, fill_color, stroke, stroke_color){
	var clue_window_scale_x = d3.scale.linear()
	.domain([0, number_of_horizontal_units])
	.range([0, (parseFloat($('#svg_container').width())-11)]);
	var clue_window_scale_y = d3.scale.linear()
	.domain([0, number_of_vertical_units])
	.range([0, (parseFloat($('#svg_container').height())-11)]);

	rank_clue_container.append("rect")
	.attr('id',id_symbol + "_icon")
	.attr('class',class_symbol)
    .attr("x", clue_window_scale_x(x_center) - clue_window_scale_x(size))
    .attr("y", clue_window_scale_y(y_center) - clue_window_scale_x(size))
	.attr("width", clue_window_scale_x(size*2))
	.attr("height", clue_window_scale_x(size*2))
    .attr("fill", fill_color)
  	.attr("stroke-width", stroke)
  	.attr("stroke",  stroke_color)
    .attr("transform", "translate(" + clue_window_scale_x(x_clue_container) + "," + clue_window_scale_y(y_clue_container) + ")");
}

/*
 * add_destination_details
 *
 * add details to itinary element in clue window
 * rank_clue_container: clue element (svg element)
 * x_container: x of clue element
 * y_container: y of clue element
 * rank_1_clue: rank 1 element
 * class_text: class of text in svg element
 *
 */
function add_destination_details(rank_clue_container, x_clue_container, y_clue_container, rank_1_clue, class_text){
	var clue_window_scale_x = d3.scale.linear()
	.domain([0, number_of_horizontal_units])
	.range([0, (parseFloat($('#svg_container').width())-11)]);
	var clue_window_scale_y = d3.scale.linear()
	.domain([0, number_of_vertical_units])
	.range([0, (parseFloat($('#svg_container').height())-11)]);

	rank_clue_container.append('text')
	.attr('id',rank_1_clue.id_clue + "_minor_text_rank_1_clue")
	.attr('class',class_text)
	.attr("x", clue_window_scale_x(20))
    .attr("y", clue_window_scale_y(80))
    .attr("width", clue_window_scale_x(80))
//	.text(rank_1_clue.details)
    .text(""+ (Math.round(rank_1_clue.details[0] * 1000) / 1000) + " ; " + (Math.round(rank_1_clue.details[1] * 1000) / 1000) + "")
	.attr("font-family", "sans-serif")
	.attr("font-size", "10px")
	.attr("fill", "black")
	.attr("transform", "translate(" + clue_window_scale_x(x_clue_container) + "," + clue_window_scale_y(y_clue_container) + ")");

}

/*
 * add_element_details
 *
 * add details to object of interest element in clue window
 * rank_clue_container: clue element (svg element)
 * x_container: x of clue element
 * y_container: y of clue element
 * rank_1_clue: rank 1 element
 * class_text: class of text in svg element
 *
 */
function add_element_details(rank_clue_container, x_clue_container, y_clue_container, rank_1_clue, class_text){
	var clue_window_scale_x = d3.scale.linear()
	.domain([0, number_of_horizontal_units])
	.range([0, (parseFloat($('#svg_container').width())-11)]);
	var clue_window_scale_y = d3.scale.linear()
	.domain([0, number_of_vertical_units])
	.range([0, (parseFloat($('#svg_container').height())-11)]);

	rank_clue_container.append('text')
	.attr('id',rank_1_clue.id_clue + "_minor_text_rank_1_clue")
	.attr('class',class_text)
	.attr("x", clue_window_scale_x(20))
    .attr("y", clue_window_scale_y(80))
    .attr("width", clue_window_scale_x(80))
	.text(rank_1_clue.details.name)
	.attr("font-family", "sans-serif")
	.attr("font-size", "10px")
	.attr("fill", "black")
	.attr("transform", "translate(" + clue_window_scale_x(x_clue_container) + "," + clue_window_scale_y(y_clue_container) + ")");

//	d3plus.textwrap()
//    .container(d3.select("#" + rank_1_clue.id_clue + "_minor_text_rank_1_clue"))
//    .draw();
}



/*
 * add_rank_3_clue_CB_element
 *
 * add checkbox svg element for one rank_2_element, part of rank_3_element_creation
 *
 * rank_3_clue_CB_class: class of checkbox svg element
 * rank_2_id: id of rank_2_element
 * rank_3_clue: corresponding rank_3_element
 * rank_3_clue_container: svg container for the corresponding rank_3_element
 * x_container: x of svg container for the corresponding rank_3_element
 *
 */
function add_rank_3_clue_CB_element(rank_3_clue_CB_class,rank_2_id,rank_3_clue,rank_3_clue_container,x_container){

	var clue_window_scale_x = d3.scale.linear()
	.domain([0, number_of_horizontal_units])
	.range([0, (parseFloat($('#svg_container').width())-11)]);
	var clue_window_scale_y = d3.scale.linear()
	.domain([0, number_of_vertical_units])
	.range([0, (parseFloat($('#svg_container').height())-11)]);

	var rank_3_clue_CB_id = rank_3_clue.id_clue + "_" + rank_2_id + "_rank_3_clue_CB";

	var rank_3_clue_CB_check_class = rank_3_clue.id_clue + "_" + rank_2_id + "_rank_3_clue_CB_check";

	var y_rank_3;
	var clue_1_and_2_array = svg_clue_container.selectAll("rect");


	for(var i=0; i< clue_1_and_2_array[0].length; i++){
		if($(clue_1_and_2_array[0][i]).attr('id') == rank_2_id + "_rank_2_clue_limits"){
			y_rank_3 = parseFloat($(clue_1_and_2_array[0][i]).attr('y'));
			break;
		}
	}

	var is_selected;
	for(var i=0; i< rank_3_clue.list_id_clue_rank_2.length; i++){
		if(rank_3_clue.list_id_clue_rank_2[i].id_clue_rank_2 == rank_2_id){
			is_selected = rank_3_clue.list_id_clue_rank_2[i].selected;
		}
	}

	var check_color_rank_3;
	var container_color_rank_3 = "rgba(" + rank_3_clue.rank_3_color.r + "," + rank_3_clue.rank_3_color.g + "," + rank_3_clue.rank_3_color.b + ",1)";;
	if(is_selected == true){
		check_color_rank_3 = "rgba(" + rank_3_clue.rank_3_color.r + "," + rank_3_clue.rank_3_color.g + "," + rank_3_clue.rank_3_color.b + ",1)";

		rank_3_clue_container.append("line")
		.attr('class',rank_3_clue_CB_check_class)
	    .attr("x1", clue_window_scale_x(x_container + 10 + 5))
	    .attr("y1", y_rank_3 + clue_window_scale_y(25 + 25))
		.attr("x2", clue_window_scale_x(x_container + 10 + 20))
		.attr("y2", y_rank_3 + clue_window_scale_y(25 + 45))
	  	.attr("stroke-width", 4)
	  	.attr("stroke",  check_color_rank_3);

		rank_3_clue_container.append("line")
		.attr('class',rank_3_clue_CB_check_class)
	    .attr("x1", clue_window_scale_x(x_container + 10 + 20))
	    .attr("y1", y_rank_3 + clue_window_scale_y(25 + 45))
		.attr("x2", clue_window_scale_x(x_container + 10 + 35))
		.attr("y2", y_rank_3 + clue_window_scale_y(25 + 5))
	  	.attr("stroke-width", 4)
	  	.attr("stroke",  check_color_rank_3);

		rank_3_clue_container.append("rect")
		.attr('id',rank_3_clue_CB_id)
		.attr('class',rank_3_clue_CB_class)
	    .attr("x", clue_window_scale_x(x_container + 10))
	    .attr("y", y_rank_3 + clue_window_scale_y(25))
		.attr("width", clue_window_scale_x(40))
		.attr("height", clue_window_scale_y(50))
	    .attr("fill", "rgba(255,255,255,0)")
	  	.attr("stroke-width", 2)
	  	.attr("stroke",  container_color_rank_3)
	  	.attr("is_selected",  true);

	} else {
		check_color_rank_3 = "rgba(255,255,255,1)";

		rank_3_clue_container.append("line")
		.attr('class',rank_3_clue_CB_check_class)
	    .attr("x1", clue_window_scale_x(x_container + 10 + 5))
	    .attr("y1", y_rank_3 + clue_window_scale_y(25 + 25))
		.attr("x2", clue_window_scale_x(x_container + 10 + 20))
		.attr("y2", y_rank_3 + clue_window_scale_y(25 + 45))
	  	.attr("stroke-width", 4)
	  	.attr("stroke",  check_color_rank_3);

		rank_3_clue_container.append("line")
		.attr('class',rank_3_clue_CB_check_class)
	    .attr("x1", clue_window_scale_x(x_container + 10 + 20))
	    .attr("y1", y_rank_3 + clue_window_scale_y(25 + 45))
		.attr("x2", clue_window_scale_x(x_container + 10 + 35))
		.attr("y2", y_rank_3 + clue_window_scale_y(25 + 5))
	  	.attr("stroke-width", 4)
	  	.attr("stroke",  check_color_rank_3);

		rank_3_clue_container.append("rect")
		.attr('id',rank_3_clue_CB_id)
		.attr('class',rank_3_clue_CB_class)
	    .attr("x", clue_window_scale_x(x_container + 10))
	    .attr("y", y_rank_3 + clue_window_scale_y(25))
		.attr("width", clue_window_scale_x(40))
		.attr("height", clue_window_scale_y(50))
	    .attr("fill", "rgba(255,255,255,0)")
	  	.attr("stroke-width", 2)
	  	.attr("stroke",  container_color_rank_3)
	  	.attr("is_selected",  false);
	}

//	var fill_color_rank_3;
//	if(is_selected == true){
//		fill_color_rank_3 = "rgba(" + rank_3_clue.rank_3_color.r + "," + rank_3_clue.rank_3_color.g + "," + rank_3_clue.rank_3_color.b + ",1)";
//		rank_3_clue_container.append("rect")
//		.attr('id',rank_3_clue_CB_id)
//		.attr('class',rank_3_clue_CB_class)
//	    .attr("x", clue_window_scale_x(x_container + 10))
//	    .attr("y", y_rank_3 + clue_window_scale_y(25))
//		.attr("width", clue_window_scale_x(40))
//		.attr("height", clue_window_scale_y(50))
//	    .attr("fill", fill_color_rank_3)
//	  	.attr("stroke-width", 2)
//	  	.attr("stroke",  "black")
//	  	.attr("is_selected",  true);
//
//	} else {
//		fill_color_rank_3 = "rgba(255,255,255,1)";
//		rank_3_clue_container.append("rect")
//		.attr('id',rank_3_clue_CB_id)
//		.attr('class',rank_3_clue_CB_class)
//	    .attr("x", clue_window_scale_x(x_container + 10))
//	    .attr("y", y_rank_3 + clue_window_scale_y(25))
//		.attr("width", clue_window_scale_x(40))
//		.attr("height", clue_window_scale_y(50))
//	    .attr("fill", fill_color_rank_3)
//	  	.attr("stroke-width", 2)
//	  	.attr("stroke",  "black")
//	  	.attr("is_selected",  false);
//	}

}

/*
 * add_clue_buttons
 *
 * add buttons (suppress, hide/show) for each svg element in clue window
 * clue_container: svg container of the corresponding rank_1 / rank_2 element
 *
 */
function add_clue_buttons(clue_element, clue_container, id_element, element_class, x_container, y_container){
	//TODO
	//clue_container buttons to hide, modify (?), suppress

	var clue_window_scale_x = d3.scale.linear()
	.domain([0, number_of_horizontal_units])
	.range([0, (parseFloat($('#svg_container').width())-11)]);
	var clue_window_scale_y = d3.scale.linear()
	.domain([0, number_of_vertical_units])
	.range([0, (parseFloat($('#svg_container').height())-11)]);

	var url_image;
	if(clue_element.visible == true){
		url_image = 'image/visible.png';
	} else if(clue_element.visible == false){
		url_image = 'image/invisible.png';
	}

	clue_container.append('image')
	.attr('id',id_element + "_clue_visible_button")
	.attr('class',element_class + " clue_visible_button clue_window_element")
    .attr('xlink:href', url_image)
    .attr("x", clue_window_scale_x(220))
	    .attr("y", clue_window_scale_y(10))
    .attr("width", clue_window_scale_x(60))
    .attr("height", clue_window_scale_y(20))
	.attr("transform", "translate(" + clue_window_scale_x(x_container) + "," + clue_window_scale_y(y_container) + ")");


	if(clue_element.trust != undefined){
//		https://bl.ocks.org/officeofjane/47d2b0bfeecfcb41d2212d06d095c763

		var slider = clue_container.append("g")
		.attr('id',id_element + "_clue_slider_container")
	    .attr("class", element_class + " sider_element clue_slider_container")
	    .attr("transform", "translate(" + clue_window_scale_x(x_container) + "," + clue_window_scale_y(y_container) + ")");

		var slider_line = slider.append("line")
		    .attr('id',id_element + "_clue_slider_line")
		    .attr("class", element_class + " sider_element clue_slider_line")
		    .attr("x1", clue_window_scale_x(120))
		    .attr("x2", clue_window_scale_x(240))
		    .attr("y1", clue_window_scale_y(80))
		    .attr("y2", clue_window_scale_y(80))
		    .style("stroke-width", 2)
		    .style("stroke",  "black");

		var slider_button_x;
		var slider_button_color;
		switch (clue_element.trust) {
		  case 1:
			  slider_button_x = 120;
			  slider_button_color = 'red';
		    break;
		  case 2:
			  slider_button_x = 180;
			  slider_button_color = 'orange';
		    break;
		  case 3:
			  slider_button_x = 240;
			  slider_button_color = 'green';
			break;
		  default:
			  slider_button_x = 180;
		  	slider_button_color = 'orange';
		}

		var id_button_element = id_element + "_clue_slider_button";

		var slider_button = slider.append("circle")
		    .attr('id',id_button_element)
		    .attr("class", element_class + " sider_element clue_slider_button")
		    .attr("cx", clue_window_scale_x(slider_button_x))
		    .attr("cy", clue_window_scale_y(80))
		    .attr("r", clue_window_scale_x(15))
		    .attr("fill", slider_button_color);


		var url_inout_image;
		if(clue_element.is_inside == true){
			url_inout_image = 'image/icone_in.png';
		} else if(clue_element.is_inside == false && clue_element.negative_of_zone == false){
			url_inout_image = 'image/incone_out.png';
		} else if(clue_element.is_inside == false && clue_element.negative_of_zone == true){
			url_inout_image = 'image/incone_out_negative.png';
		}

		clue_container.append('image')
		.attr('id',id_element + "_clue_inout_button")
		.attr('class',element_class + " clue_inout_button clue_window_element")
	    .attr('xlink:href', url_inout_image)
	    .attr("x", clue_window_scale_x(180))
		    .attr("y", clue_window_scale_y(10))
	    .attr("width", clue_window_scale_x(60))
	    .attr("height", clue_window_scale_y(20))
		.attr("transform", "translate(" + clue_window_scale_x(x_container) + "," + clue_window_scale_y(y_container) + ")");

	}


}

function change_trust(id_svg_element,id_clue_element,x_button){

	var clue_window_scale_x = d3.scale.linear()
	.domain([0, number_of_horizontal_units])
	.range([0, (parseFloat($('#svg_container').width())-11)]);

	var slider_button_x;
	var slider_button_color;
	var trust_level;

	if(x_button < clue_window_scale_x(150)){
		slider_button_x = 120;
		  slider_button_color = 'red';
		  trust_level = 1;
	} else if(x_button > clue_window_scale_x(150) && x_button < clue_window_scale_x(210)){
		slider_button_x = 180;
		  slider_button_color = 'orange';
		  trust_level = 2;
	} else if(x_button > clue_window_scale_x(210)){
		slider_button_x = 240;
		  slider_button_color = 'green';
		  trust_level = 3;
	} else {
		slider_button_x = 180;
	  	slider_button_color = 'orange';
	  	trust_level = 2;
	}

	var slider_button_array = d3.selectAll('.clue_slider_button');
	for(var i = 0; i< slider_button_array[0].length; i++){
		if(slider_button_array[0][i].id == id_svg_element){
			d3.select(slider_button_array[0][i]).attr("cx", clue_window_scale_x(slider_button_x))
		    .attr("fill", slider_button_color);
			break;
		}
	}

	for(var i = 0; i< app.list_of_rank_2_clue.length; i++){
		if(app.list_of_rank_2_clue[i].id_clue == id_clue_element){
			app.list_of_rank_2_clue[i].trust = trust_level;
			break;
		}
	}

	for(var i = 0; i< app.list_of_rank_3_clue.length; i++){
		var reset = false;
		for(var j = 0; j< app.list_of_rank_3_clue[i].list_id_clue_rank_2.length; j++){
			if(app.list_of_rank_3_clue[i].list_id_clue_rank_2[j].id_clue_rank_2 == id_clue_element && app.list_of_rank_3_clue[i].list_id_clue_rank_2[j].selected == true){
				reset = true;
				break;
			}
		}
		if(reset == true){
			create_rank_3_clue_raster(app.list_of_rank_3_clue[i]);
		}
	}

}

/*
 * change_clue_visibility
 *
 * put clue to visible or hide state
 *
 * element: svg element
 *
 */
function change_clue_visibility(element){
	var id_clue = parseInt($(element).attr('id').split('_')[0]);
	var x_element = $(element).attr('x'),
	y_element = $(element).attr('y'),
	width_element = $(element).attr('width'),
	height_element = $(element).attr('height'),
	id_element = $(element).attr('id'),
	class_element = $(element).attr('class');

	var container,
	container_x,
	container_y;

	if($(element).hasClass('rank_1_clue_window_element')){
		container = $('#' + id_clue + '_rank_1_clue_container');
		container_x = $(container.children()[0]).attr('x');
		container_y = $(container.children()[0]).attr('y');
		for(var i=0; i<app.list_of_rank_1_clue.length; i++){
			if(app.list_of_rank_1_clue[i].id_clue == id_clue){
				if(app.list_of_rank_1_clue[i].visible == true){
					app.list_of_rank_1_clue[i].visible = false;
					d3.selectAll(container).append('image')
					.attr('id',id_element)
					.attr('class',class_element)
				    .attr('xlink:href', 'image/invisible.png')
				    .attr("x", x_element)
					    .attr("y", y_element)
				    .attr("width", width_element)
				    .attr("height", height_element)
				    .attr("transform", "translate(" + container_x + "," + container_y + ")");
					show_hide_clue_objects(app.list_of_rank_1_clue[i], 1, 'hide');
				} else {
					app.list_of_rank_1_clue[i].visible = true;
					d3.selectAll(container).append('image')
					.attr('id',id_element)
					.attr('class',class_element)
				    .attr('xlink:href', 'image/visible.png')
				    .attr("x", x_element)
					    .attr("y", y_element)
				    .attr("width", width_element)
				    .attr("height", height_element)
				    .attr("transform", "translate(" + container_x + "," + container_y + ")");
					show_hide_clue_objects(app.list_of_rank_1_clue[i], 1, 'show');
				}
				break;
			}
		}
	} else if($(element).hasClass('rank_2_clue_window_element')){
		container = $('#' + id_clue + '_rank_2_clue_container');
		container_x = $(container.children()[0]).attr('x');
		container_y = $(container.children()[0]).attr('y');
		for(var i=0; i<app.list_of_rank_2_clue.length; i++){
			if(app.list_of_rank_2_clue[i].id_clue == id_clue){
				if(app.list_of_rank_2_clue[i].visible == true){
					app.list_of_rank_2_clue[i].visible = false;
					d3.selectAll(container).append('image')
					.attr('id',id_element)
					.attr('class',class_element)
				    .attr('xlink:href', 'image/invisible.png')
				    .attr("x", x_element)
					    .attr("y", y_element)
				    .attr("width", width_element)
				    .attr("height", height_element)
				    .attr("transform", "translate(" + container_x + "," + container_y + ")");
					show_hide_clue_objects(app.list_of_rank_2_clue[i], 2, 'hide');
				} else {
					app.list_of_rank_2_clue[i].visible = true;
					d3.selectAll(container).append('image')
					.attr('id',id_element)
					.attr('class',class_element)
				    .attr('xlink:href', 'image/visible.png')
				    .attr("x", x_element)
					    .attr("y", y_element)
				    .attr("width", width_element)
				    .attr("height", height_element)
				    .attr("transform", "translate(" + container_x + "," + container_y + ")");
					show_hide_clue_objects(app.list_of_rank_2_clue[i], 2, 'show');
				}
				break;
			}
		}
	}

	$(".clue_window_element").off( "click")

	$(".clue_window_element").on("click",function(e) {
		if($(this).hasClass('clue_visible_button')){
			change_clue_visibility(this);
			clue_element_is_clicked = true;
			setTimeout(function(){ clue_element_is_clicked = false; }, 500);
		} else if($(this).hasClass('rank_1_clue_container') || $(this).hasClass('rank_2_clue_container')){
			if(clue_element_is_clicked == false){
				select_clue_on_clue_window(e, this);
				clue_element_is_clicked = true;
				setTimeout(function(){ clue_element_is_clicked = false; }, 500);
			}
		}
	});

	$(".rank_3_clue_CB").on("click",function(e) {

		var id_rank_3_element = parseInt(this.id.split('_')[0]);
		var id_rank_2_element = parseInt(this.id.split('_')[1]);

		if($(this).attr('is_selected') == 'true'){
			for(var i=0; i< app.list_of_rank_3_clue.length; i++){
				if(app.list_of_rank_3_clue[i].id_clue == id_rank_3_element){
					for(var j=0; j< app.list_of_rank_3_clue[i].list_id_clue_rank_2.length; j++){
						if(app.list_of_rank_3_clue[i].list_id_clue_rank_2[j].id_clue_rank_2 == id_rank_2_element){
							app.list_of_rank_3_clue[i].list_id_clue_rank_2[j].selected = false;
							break;
						}
					}
					$(this).css({ fill: 'rgba(' + 255 + ',' + 255 + ',' + 255 + ',1)' });
					$(this).attr('is_selected','false');
//					add_rank_3_clue_to_map(app.list_of_rank_3_clue[i]);
					create_rank_3_clue_raster(app.list_of_rank_3_clue[i]);
					break;
				}
			}
		} else {
			for(var i=0; i< app.list_of_rank_3_clue.length; i++){
				if(app.list_of_rank_3_clue[i].id_clue == id_rank_3_element){
					for(var j=0; j< app.list_of_rank_3_clue[i].list_id_clue_rank_2.length; j++){
						if(app.list_of_rank_3_clue[i].list_id_clue_rank_2[j].id_clue_rank_2 == id_rank_2_element){
							app.list_of_rank_3_clue[i].list_id_clue_rank_2[j].selected = true;
							break;
						}
					}
					$(this).css({ fill: 'rgba(' + app.list_of_rank_3_clue[i].rank_3_color.r + ',' + app.list_of_rank_3_clue[i].rank_3_color.g + ',' + app.list_of_rank_3_clue[i].rank_3_color.b + ',1)' });
					$(this).attr('is_selected','true');
//					add_rank_3_clue_to_map(app.list_of_rank_3_clue[i]);
					create_rank_3_clue_raster(app.list_of_rank_3_clue[i]);
					break;
				}
			}
		}


	});

	$(element).remove();

}

/*
 * select_clue_on_clue_window
 *
 * event function to put clue to select state on clue window
 *
 * clic_event: clic event
 * svg_element: svg element
 *
 */
function select_clue_on_clue_window(clic_event, svg_element){
	if(clic_event.shiftKey) {
		//clic + shift, sélection de plusieurs élément
		if($(svg_element).hasClass("rank_1_clue_container")){
			if($(svg_element).hasClass("selected_clue")){
				$(svg_element).removeClass("selected_clue");
				$(svg_element).find( ".rank_1_clue_limits " ).css( "stroke-width",1);
				$(svg_element).find( ".rank_1_clue_limits " ).css( "stroke","black");
			} else {
				$(svg_element).addClass("selected_clue");
				$(svg_element).find( ".rank_1_clue_limits " ).css( "stroke-width",3);
				$(svg_element).find( ".rank_1_clue_limits " ).css( "stroke",select_color_hexa);
			}
			clear_clue_to_select_state();
			 for(var o = 0; o< $(".clue_window_element").length; o++){
				 var element = $(".clue_window_element")[o];
				 if($(element).hasClass("rank_1_clue_container") && $(element).hasClass("selected_clue")){
					 var id_clue = $(element).attr('id').split('_')[0];
					 put_clue_map_element_to_select(id_clue);
				 }
			 }
			return;
		} else if($(svg_element).hasClass("rank_2_clue_container")){
			if($(svg_element).hasClass("selected_clue")){
				$(svg_element).removeClass("selected_clue");
				$(svg_element).find( ".rank_2_clue_limits " ).css( "stroke-width",1);
				$(svg_element).find( ".rank_2_clue_limits " ).css( "stroke","black");
			} else {
				$(svg_element).addClass("selected_clue");
				$(svg_element).find( ".rank_2_clue_limits " ).css( "stroke-width",3);
				$(svg_element).find( ".rank_2_clue_limits " ).css( "stroke",select_color_hexa);
			}
			clear_clue_to_select_state();
			 for(var o = 0; o< $(".clue_window_element").length; o++){
				 var element = $(".clue_window_element")[o];
				 if($(element).hasClass("rank_2_clue_container") && $(element).hasClass("selected_clue")){
					 var id_clue = $(element).attr('id').split('_')[0];
					 put_clue_map_element_2_to_select(id_clue);
				 }
			 }
			return;
		}
	} else {
		//clic simple, déselection des éléments, et sélection de l'élément cliqué
		//déselection des éléments
		remove_all_clue_of_select();
		//sélection de l'élément cliqué
		if($(svg_element).hasClass("rank_1_clue_container")){
			var id_clue = $(svg_element).attr('id').split('_')[0];
			put_clue_to_select(id_clue);
			return;
		} else if($(svg_element).hasClass("rank_2_clue_container")){
			var id_clue = $(svg_element).attr('id').split('_')[0];
			put_clue_2_to_select(id_clue);
			return;
		}

	}

}

/*
 * right_clic_on_clue_window_element
 *
 * launch right clic functions of clue_window_element
 * clic_event: clic event
 * svg_element: svg element
 *
 */
function right_clic_on_clue_window_element(event_clic, svg_element){
	if($(svg_element).hasClass("rank_1_clue_window_element")){
		right_click_clue_element.value = event_clic;
		var id_clue = $(svg_element).attr('id').split('_')[0];
		var index=null;
		for(var i = 0; i< app.list_of_rank_1_clue.length; i++){
			if(app.list_of_rank_1_clue[i].id_clue == id_clue){
				index= i;
				break;
			}
		}
		var rank_1_clue = app.list_of_rank_1_clue[index];
		switch (rank_1_clue.type_clue) {
		  case 'begining_point':
		$('#rank_1_clue_itinary_points_element_menu').css("display","block");
		$('#rank_1_clue_itinary_points_element_menu').css("top",event_clic.pageY + 'px');
		$('#rank_1_clue_itinary_points_element_menu').css("left",event_clic.pageX + 'px');
		break;
		  case 'past_point':
			  $('#rank_1_clue_itinary_points_element_menu').css("display","block");
				$('#rank_1_clue_itinary_points_element_menu').css("top",event_clic.pageY + 'px');
				$('#rank_1_clue_itinary_points_element_menu').css("left",event_clic.pageX + 'px');
				break;
		  case 'to_pass_point':
			  $('#rank_1_clue_itinary_points_element_menu').css("display","block");
				$('#rank_1_clue_itinary_points_element_menu').css("top",event_clic.pageY + 'px');
				$('#rank_1_clue_itinary_points_element_menu').css("left",event_clic.pageX + 'px');
				break;
		  case 'destination_point':
			  $('#rank_1_clue_itinary_points_element_menu').css("display","block");
				$('#rank_1_clue_itinary_points_element_menu').css("top",event_clic.pageY + 'px');
				$('#rank_1_clue_itinary_points_element_menu').css("left",event_clic.pageX + 'px');
				break;
		  default:
			  $('#rank_1_clue_element_menu').css("display","block");
			$('#rank_1_clue_element_menu').css("top",event_clic.pageY + 'px');
			$('#rank_1_clue_element_menu').css("left",event_clic.pageX + 'px');
		  break;
		}
	} else if($(svg_element).hasClass("rank_2_clue_window_element")){
		right_click_clue_element.value = event_clic;
		$('#rank_2_clue_element_menu').css("display","block");
		$('#rank_2_clue_element_menu').css("top",event_clic.pageY + 'px');
		$('#rank_2_clue_element_menu').css("left",event_clic.pageX + 'px');
	} else if($(svg_element).hasClass("rank_3_clue_window_element")){
		right_click_clue_element.value = event_clic;

		$('#rank_3_clue_element_menu').css("display","block");
		$('#rank_3_clue_element_menu').css("top",event_clic.pageY + 'px');
		$('#rank_3_clue_element_menu').css("left",event_clic.pageX + 'px');

		var rank_3_element_id = parseInt(right_click_clue_element.value.target.id.split('_')[0]);
		for(var j=0; j< app.list_of_rank_3_clue.length; j++){
			if(app.list_of_rank_3_clue[j].id_clue == rank_3_element_id){
				$('#rank_3_clue_element_menu_color_pickr').attr('value',rgbToHex(app.list_of_rank_3_clue[j].rank_3_color.r, app.list_of_rank_3_clue[j].rank_3_color.g, app.list_of_rank_3_clue[j].rank_3_color.b));
				color_change_function = function(){
					var color_hexa = $('#rank_3_clue_element_menu_color_pickr')[0].value;
					var color_1 = LightenDarkenColor(color_hexa, 150);
					var color_2 = LightenDarkenColor(color_hexa, -150);

					while (color_1.length < 7 || color_2.length < 7) {
						color_hexa = getRandomColor();
						color_1 = LightenDarkenColor(color_hexa, 150);
						color_2 = LightenDarkenColor(color_hexa, -150);
						}
					var rgb_color = hexToRgb(color_hexa);
					app.list_of_rank_3_clue[j].rank_3_color.r = rgb_color.r;
					app.list_of_rank_3_clue[j].rank_3_color.g = rgb_color.g;
					app.list_of_rank_3_clue[j].rank_3_color.b = rgb_color.b;
					app.list_of_rank_3_clue[j].rank_3_color_light = color_1;
					app.list_of_rank_3_clue[j].rank_3_color_dark = color_2;

					$('#rank_3_clue_element_menu_color_pickr')[0].value = color_hexa;

//					add_rank_3_clue_to_map(app.list_of_rank_3_clue[j]);
					create_rank_3_clue_raster(app.list_of_rank_3_clue[j]);
					redraw_clue_window();
				}
				break;
			}
		}
	}
}


/*
 * put_clue_to_hover
 *
 * launch functions which put rank 1 element in hover graphic state in the map and in the clue window
 * id_clue: id of rank 1 element
 *
 */
function put_clue_to_hover(id_clue){
	//TODO bug lorsque l'objet est sélectionné
	put_clue_window_elements_to_hover(id_clue);
//	 put_clue_map_elements_to_hover(id_clue);
}

/*
 * put_clue_2_to_hover
 *
 * launch functions which put rank 2 element in hover graphic state in the map and in the clue window
 * id_clue: id of rank 2 element
 *
 */
function put_clue_2_to_hover(id_clue){
	put_clue_window_elements_2_to_hover(id_clue);
//	put_clue_map_elements_2_to_hover(id_clue);
}

/*
 * put_clue_window_elements_to_hover
 *
 * put rank 1 element to hover graphic state in clue window
 * id_clue: id of rank 1 element
 *
 */
function put_clue_window_elements_to_hover(id_clue){
	$("#"+ id_clue + "_rank_1_clue_container").addClass("hover_clue");
	$("#"+ id_clue + "_rank_1_clue_limits").css( "stroke-width",3);
	$("#"+ id_clue + "_rank_1_clue_limits").css( "stroke",hover_color_hexa);
}

/*
 * put_clue_window_elements_2_to_hover
 *
 * put rank 2 element to hover graphic state in clue window
 * id_clue: id of rank 2 element
 *
 */
function put_clue_window_elements_2_to_hover(id_clue){
	$("#"+ id_clue + "_rank_2_clue_container").addClass("hover_clue");
	$("#"+ id_clue + "_rank_2_clue_limits").css( "stroke-width",3);
	$("#"+ id_clue + "_rank_2_clue_limits").css( "stroke",hover_color_hexa);
}

/*
 * remove_all_clue_of_hover
 *
 * launch functions which put all of rank 1 and rank 2 elements in non-hover graphic state in the map and in the clue window
 *
 */
function remove_all_clue_of_hover(){
	remove_all_clue_window_elements_of_hover();
	remove_all_clue_map_elements_of_hover();
}

/*
 * remove_all_clue_window_elements_of_hover
 *
 * put all of rank 1 and rank 2 elements in non-hover graphic state in the clue window
 *
 */
function remove_all_clue_window_elements_of_hover(){
	for(var i = 0; i< $(".clue_window_element").length; i++){
		var element = $(".clue_window_element")[i];
		if($(element).hasClass("rank_1_clue_container") && $(element).hasClass("hover_clue")){
			$(element).removeClass("hover_clue");
			if($(element).hasClass("selected_clue")){
				//retour à la couleur de la sélection
				$(element).find( ".rank_1_clue_limits " ).css( "stroke-width",3);
				$(element).find( ".rank_1_clue_limits " ).css( "stroke",select_color_hexa);
				return;
			} else {
				//retour à la couleur normale
				$(element).find( ".rank_1_clue_limits " ).css( "stroke-width",1);
				$(element).find( ".rank_1_clue_limits " ).css( "stroke","black");
				return;
			}
		} else if($(element).hasClass("rank_2_clue_container") && $(element).hasClass("hover_clue")){
			$(element).removeClass("hover_clue");
			if($(element).hasClass("selected_clue")){
				//retour à la couleur de la sélection
				$(element).find( ".rank_2_clue_limits " ).css( "stroke-width",3);
				$(element).find( ".rank_2_clue_limits " ).css( "stroke",select_color_hexa);
				return;
			} else {
				//retour à la couleur normale
				$(element).find( ".rank_2_clue_limits " ).css( "stroke-width",1);
				$(element).find( ".rank_2_clue_limits " ).css( "stroke","black");
				return;
			}
		}
	}
}

/*
 * put_clue_to_select
 *
 * launch functions which put rank 1 element to select graphic state in map and in clue window
 * id_clue: id of rank 1 element
 *
 */
function put_clue_to_select(id_clue){
	put_clue_window_element_to_select(id_clue);
	put_clue_map_element_to_select(id_clue);
}

/*
 * put_clue_2_to_select
 *
 * launch functions which put rank 2 element to select graphic state in map and in clue window
 * id_clue: id of rank 2 element
 *
 */
function put_clue_2_to_select(id_clue){
	put_clue_window_element_2_to_select(id_clue);
	put_clue_map_element_2_to_select(id_clue);
}

/*
 * put_clue_window_element_to_select
 *
 * put rank 1 element to select graphic state in clue window
 * id_clue: id of rank 1 element
 *
 */
function put_clue_window_element_to_select(id_clue){
	$("#"+ id_clue + "_rank_1_clue_container").addClass("selected_clue");
	$("#"+ id_clue + "_rank_1_clue_limits").css( "stroke-width",3);
	$("#"+ id_clue + "_rank_1_clue_limits").css( "stroke",select_color_hexa);
}

/*
 * put_clue_window_element_2_to_select
 *
 * put rank 2 element to select graphic state in clue window
 * id_clue: id of rank 2 element
 *
 */
function put_clue_window_element_2_to_select(id_clue){
	$("#"+ id_clue + "_rank_2_clue_container").addClass("selected_clue");
	$("#"+ id_clue + "_rank_2_clue_limits").css( "stroke-width",3);
	$("#"+ id_clue + "_rank_2_clue_limits").css( "stroke",select_color_hexa);
}


/*
 * remove_all_clue_of_select
 *
 * launch functions which put all rank 1 and rank 2 elements to non select graphic state in clue window and in the map
 *
 */
function remove_all_clue_of_select(){
	remove_all_clue_window_elements_of_select();
	clear_clue_to_select_state();
}

/*
 * remove_all_clue_window_elements_of_select
 *
 * put all rank 1 and rank 2 elements to non select graphic state in clue window
 *
 */
function remove_all_clue_window_elements_of_select(){
	for(var i = 0; i< $(".clue_window_element").length; i++){
		var element = $(".clue_window_element")[i];
		if($(element).hasClass("rank_1_clue_container") && $(element).hasClass("selected_clue")){
			$(element).removeClass("selected_clue");
			$(element).find( ".rank_1_clue_limits " ).css( "stroke-width",1);
			$(element).find( ".rank_1_clue_limits " ).css( "stroke","black");
		} else if($(element).hasClass("rank_2_clue_container") && $(element).hasClass("selected_clue")){
			$(element).removeClass("selected_clue");
			$(element).find( ".rank_2_clue_limits " ).css( "stroke-width",1);
			$(element).find( ".rank_2_clue_limits " ).css( "stroke","black");
		}
	}
}

function wrap(text) {
    text.each(function() {
        var text = d3.select(this);
        var words = text.text().split(/\s+/).reverse();
        var lineHeight = 20;
        var width = parseFloat(text.attr('width'));
        var y = parseFloat(text.attr('y'));
        var x = text.attr('x');
        var anchor = text.attr('text-anchor');

        var tspan = text.text(null).append('tspan').attr('x', x).attr('y', y).attr('text-anchor', anchor);
        var lineNumber = 0;
        var line = [];
        var word = words.pop();

        while (word) {
            line.push(word);
            tspan.text(line.join(' '));
            if (tspan.node().getComputedTextLength() > width) {
                lineNumber += 1;
                line.pop();
                tspan.text(line.join(' '));
                line = [word];
                if(words.pop()){
//                	var word_length = word.length;
//                	var new_text = "" + word.substr(0,word_length-2) + "...";
                	var new_text = "" + word + "...";
                	tspan = text.append('tspan').attr('x', x).attr('y', y + lineNumber * lineHeight).attr('anchor', anchor).text(new_text);
                } else{
                	tspan = text.append('tspan').attr('x', x).attr('y', y + lineNumber * lineHeight).attr('anchor', anchor).text(word);
                }
            }
            word = words.pop();
            if(lineNumber == 2){
            	break;
            }
        }
    });
}

export {redraw_clue_window,
	remove_all_clue_of_hover,
	put_clue_to_hover,
	hover_color_hexa,
	select_color_hexa,
	remove_all_clue_of_select,
	put_clue_to_select,
	color_change_function};
