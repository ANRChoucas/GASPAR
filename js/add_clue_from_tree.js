import {app,
	rank_1_clue,
	group_of_rank_1_clue,
	rank_2_clue,
	group_rank_1_to_rank_2,
	rank_3_clue,
	feature_clue_element} from "./clue_element.js";
import {objectMap} from "./choucas.js";
import {add_element_of_reference,
	create_buffer,
	add_rank_2_clue_to_map,
	union_feature,
	add_rank_3_clue_to_map,
	create_rank_3_clue_raster,
	add_draw_buffer_multi_polygon_to_map,
	map_element_worker} from "./map_element.js";
import {redraw_clue_window} from "./clue_window.js";
import {draw_source,
	launch_add_buffer} from "./add_clue_from_map.js";
import {add_add_clue_menu_settings} from './add_clue_from_clue_window.js';
import {itemTypeToColor,
	colorToRGB} from "./choucas_styling.js";

/*
 * variable used to store clic event on object tree
 */
var select_tree_evt = {'value': null};
var all_select_tree_evt = {'value': null};

/*
 * initialize_add_clue_from_tree
 *
 * initialize right clic event of object of interest tree
 */
function initialize_add_clue_from_tree(){

	$("#tree").on('contextmenu', function (evt) {
	    evt.preventDefault();

	    $('.clue_window_menu').css("display","none");
	    $('.map_filter_menu').css("display","none");
	    $('.add_clue_from_tree_menu').css("display","none");

	    if(evt.target.tagName == "SPAN"){
	    	select_tree_evt.value = evt;
	    	all_select_tree_evt.value = evt;
	    	if($("#tree").fancytree("getTree").getSelectedNodes().length > 0){
	    		if(evt.shiftKey == true){
	    			$('#popup_div_add-clue-menu').show();
	    			add_add_clue_menu_settings(select_tree_evt,"tree");
	    			return;
	    		}
	    		$('#add_clue_from_tree_menu_with_select').css("display","block");
			    $('#add_clue_from_tree_menu_with_select').css("bottom",evt.offsetY + 'px');
				$('#add_clue_from_tree_menu_with_select').css("left",evt.offsetX + 'px');
	    	} else {
	    		if(evt.shiftKey == true){
	    			$('#popup_div_add-clue-menu').show();
	    			add_add_clue_menu_settings(all_select_tree_evt,"tree");
	    			return;
	    		}
	    		$('#add_clue_from_tree_menu_no_select').css("display","block");
			    $('#add_clue_from_tree_menu_no_select').css("bottom",evt.offsetY + 'px');
				$('#add_clue_from_tree_menu_no_select').css("left",evt.offsetX + 'px');
	    	}
	    } else {
	    	all_select_tree_evt.value = evt;
	    	if(evt.shiftKey == true){
    			$('#popup_div_add-clue-menu').show();
    			add_add_clue_menu_settings(all_select_tree_evt,"tree");
    			return;
    		}
	    	$('#add_clue_from_tree_menu_only_select').css("display","block");
		    $('#add_clue_from_tree_menu_only_select').css("bottom",evt.offsetY + 'px');
			$('#add_clue_from_tree_menu_only_select').css("left",evt.offsetX + 'px');
	    }
	});

	$(".add_clue_from_tree_menu_add_item_as_clue_from_tree").on('click',function() {
		add_item_as_clue_from_tree(select_tree_evt);
	});

	$(".add_clue_from_tree_menu_add_checked_items_as_clue_from_tree").on('click',function() {
		add_cheked_items_as_clue_from_tree();
	});

	$(".add_clue_from_tree_menu_add_buffer_from_item").on('click',function() {
		add_item_as_buffer_from_tree(select_tree_evt);
	});

	$(".add_clue_from_tree_menu_add_buffer_from_checked_items").on('click',function() {
		add_buffer_from_cheked_items_from_tree(all_select_tree_evt);
	});

	$(".add_clue_from_tree_menu_add_isochrone_from_item").on('click',function() {

	});

	$(".add_clue_from_tree_menu_add_isochrone_from_checked_items").on('click',function() {

	});

	$(".add_clue_from_tree_menu_add_intervis_from_item").on('click',function() {

	});

	$(".add_clue_from_tree_menu_add_intervis_from_checked_items").on('click',function() {

	});


	$(".add_clue_from_tree_menu_element").on('click',function() {
		$('.add_clue_from_tree_menu').css("display","none");
	});

}

/*
 * add_item_as_clue_from_tree
 *
 * select objects on tree by right clic to create rank 1 element
 * event: clic event
 */
function add_item_as_clue_from_tree(event){
	//récupération des noeuds
	var master_node =$.ui.fancytree.getNode(event.value);
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
	add_objects_from_tree(feature_array,clue_title);

}

/*
 * add_cheked_items_as_clue_from_tree
 *
 * select objects on tree with tree's checkbox to create rank 1 element
 */
function add_cheked_items_as_clue_from_tree(){
	//récupération des noeuds
	var selected_nodes = $("#tree").fancytree("getTree").getSelectedNodes();

	var item_ref_array = [];
	for(var i =0; i<selected_nodes.length; i++){
		if(selected_nodes[i].data.itemRef != undefined){
			item_ref_array.push(selected_nodes[i].data.itemRef);
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

	//TODO changer titre
	var clue_title = 'objets cochés';

	add_objects_from_tree(feature_array,clue_title);
}

/*
 * add_objects_from_tree
 *
 * create rank 1 element from features selected in add_item_as_clue_from_tree and add_cheked_items_as_clue_from_tree functions
 * feature_array: array of feature selected in add_item_as_clue_from_tree and add_cheked_items_as_clue_from_tree functions
 * clue_title: title of rank 1 element
 */
function add_objects_from_tree(feature_array,clue_title){
	var clue_id;
	if(app.list_of_rank_1_clue_id.length == 0){
		var clue_id = 1;
	} else {
		clue_id = (Math.max(...app.list_of_rank_1_clue_id) + 1);
	}

	var point_id_array= [];
	var properties_array = [];
	for(var i=0; i<feature_array.length; i++){
		var point_id = add_element_of_reference(clue_id,feature_array[i]);
		point_id_array.push(point_id);
		properties_array.push(feature_array[i].getProperties());
	}

	var clue;
	if(feature_array.length == 1){
		switch (feature_array[0].getProperties().itemType) {
		  case 'CITY':
			  clue = new rank_1_clue(clue_id, "Grande ville", point_id_array,feature_array[0].getProperties().name,feature_array[0].getProperties(),true);
			  break;
		  case 'TOWN':
			  clue = new rank_1_clue(clue_id, "Ville", point_id_array,feature_array[0].getProperties().name,feature_array[0].getProperties(),true);
			  break;
		  case 'VILLAGE':
			  clue = new rank_1_clue(clue_id, "Village", point_id_array,feature_array[0].getProperties().name,feature_array[0].getProperties(),true);
			  break;
		  case 'PEAK':
			  clue = new rank_1_clue(clue_id, "Sommet", point_id_array,feature_array[0].getProperties().name,feature_array[0].getProperties(),true);
			  break;
		  case 'COL':
			  clue = new rank_1_clue(clue_id, "Col", point_id_array,feature_array[0].getProperties().name,feature_array[0].getProperties(),true);
			  break;
		  case 'LAKE':
			  clue = new rank_1_clue(clue_id, "Lac", point_id_array,feature_array[0].getProperties().name,feature_array[0].getProperties(),true);
			  break;
		  case 'RESERVOIR':
			  clue = new rank_1_clue(clue_id, "Réservoir", point_id_array,feature_array[0].getProperties().name,feature_array[0].getProperties(),true);
			  break;
		  case 'WATEROTHER':
			  clue = new rank_1_clue(clue_id, "Autre", point_id_array,feature_array[0].getProperties().name,feature_array[0].getProperties(),true);
			  break;
		  case 'RIVER':
			  clue = new rank_1_clue(clue_id, "Rivière", point_id_array,feature_array[0].getProperties().name,feature_array[0].getProperties(),true);
			  break;
		  case 'STREAM':
			  clue = new rank_1_clue(clue_id, "Ruisseau", point_id_array,feature_array[0].getProperties().name,feature_array[0].getProperties(),true);
			  break;
		  case 'POWER6':
			  clue = new rank_1_clue(clue_id, "LHT 6 brins", point_id_array,feature_array[0].getProperties().name,feature_array[0].getProperties(),true);
			  break;
		  case 'POWER3':
			  clue = new rank_1_clue(clue_id, "LHT 3 brins", point_id_array,feature_array[0].getProperties().name,feature_array[0].getProperties(),true);
			  break;
		  case 'POWERO':
			  clue = new rank_1_clue(clue_id, "Equipement éléctrique", point_id_array,feature_array[0].getProperties().name,feature_array[0].getProperties(),true);
			  break;
		  case 'MAST':
			  clue = new rank_1_clue(clue_id, "Tour téléphonie", point_id_array,feature_array[0].getProperties().name,feature_array[0].getProperties(),true);
			  break;
		  case 'SKILIFT':
			  clue = new rank_1_clue(clue_id, "Remontée mécanique", point_id_array,feature_array[0].getProperties().name,feature_array[0].getProperties(),true);
			  break;
		  case 'PISTEGREEN':
			  clue = new rank_1_clue(clue_id, "Piste verte", point_id_array,feature_array[0].getProperties().name,feature_array[0].getProperties(),true);
			  break;
		  case 'PISTEBLUE':
			  clue = new rank_1_clue(clue_id, "Piste bleue", point_id_array,feature_array[0].getProperties().name,feature_array[0].getProperties(),true);
			  break;
		  case 'PISTERED':
			  clue = new rank_1_clue(clue_id, "Piste rouge", point_id_array,feature_array[0].getProperties().name,feature_array[0].getProperties(),true);
			  break;
		  case 'PISTEBLACK':
			  clue = new rank_1_clue(clue_id, "Piste noire", point_id_array,feature_array[0].getProperties().name,feature_array[0].getProperties(),true);
			  break;
		  case 'PATHWAY':
			  clue = new rank_1_clue(clue_id, "Sentier de randonnée", point_id_array,feature_array[0].getProperties().name,feature_array[0].getProperties(),true);
			  break;
		  case 'ROAD':
			  clue = new rank_1_clue(clue_id, "Route", point_id_array,feature_array[0].getProperties().name,feature_array[0].getProperties(),true);
			  break;
		  default:
			  clue = new rank_1_clue(clue_id, "Objet d'intérêt", point_id_array,feature_array[0].getProperties().name,feature_array[0].getProperties(),true);
		  break;
		}
	} else {
		clue = new rank_1_clue(clue_id, "clue_from_tree", point_id_array, clue_title, properties_array,true);
	}

	app.list_of_rank_1_clue.push(clue)
	app.list_of_rank_1_clue_id.push(clue_id);

	redraw_clue_window();
}


/*
 * add_item_as_buffer_from_tree
 *
 * select objects on tree by right clic to add rank 2 object by create a buffer area from objects selected
 * event: clic event
 */
function add_item_as_buffer_from_tree(event){

	//récupération des noeuds
	var master_node =$.ui.fancytree.getNode(event.value);
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

	create_buffer_from_tree(feature_array,clue_title,event);

}


/*
 * add_buffer_from_cheked_items_from_tree
 *
 * select objects on tree with tree's checkbox to add rank 2 object by create a buffer area from objects selected
 */
function add_buffer_from_cheked_items_from_tree(event){
	//récupération des noeuds
	var selected_nodes = $("#tree").fancytree("getTree").getSelectedNodes();

	var item_ref_array = [];
	for(var i =0; i<selected_nodes.length; i++){
		if(selected_nodes[i].data.itemRef != undefined){
			item_ref_array.push(selected_nodes[i].data.itemRef);
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

	//TODO changer titre
	var clue_title = 'objets cochés';

	create_buffer_from_tree(feature_array,clue_title,event);
}



/*
 * create_buffer_from_tree
 *
 * add rank 2 element by creating buffer from features selected in add_item_as_buffer_from_tree and add_buffer_from_cheked_items_from_tree functions
 * feature at the origin of the buffer area are added as an rank 1 element object
 * feature_array: list of feature selected on object's tree
 * clue_title: title of rank 2 element
 * event: clic event
 */
function create_buffer_from_tree(feature_array,clue_title,event){	//récupération de la feature cliquée
	//affichage du slider pour saisir les paramètres du buffer
	//TODO prise en compte des 2 valeurs saisies pour le calcul du buffer
	$('#rank_2_buffer_parameters').css("display","block");
	$('#rank_2_buffer_parameters').css("top",event.value.clientY + 'px');
	$('#rank_2_buffer_parameters').css("left",event.value.clientX + 'px');

	$( "#rank_2_buffer_parameters_input_1" ).val(0);
    $( "#rank_2_buffer_parameters_input_2" ).val(2);

    var buffer_stroke_color;
	var buffer_fill_color;


	switch(feature_array[0].getProperties().itemType){
	case "COL":
		var buffer_stroke_color = "rgba(255,69,0,1)";
		var buffer_fill_color = "rgba(255,69,0,1)";
		break;
	case "LAKE":
		var buffer_stroke_color = "rgba(65,105,225,1)";
			var buffer_fill_color = "rgba(65,105,225,0.05)";
		break;
	case "PATHWAY":
		var buffer_stroke_color = "rgba(244,164,96,1)";
			var buffer_fill_color = "rgba(244,164,96,0.05)";
		break;
	case "PEAK":
		var buffer_stroke_color = "rgba(255,69,0,1)";
			var buffer_fill_color = "rgba(255,69,0,0.05)";
		break;
	case "PISTE":
		var buffer_stroke_color = "rgba(47,79,79,1)";
			var buffer_fill_color = "rgba(47,79,79,0.05)";
		break;
	case "PISTEGREEN":
		var buffer_stroke_color = "rgba(60,179,113,1)";
			var buffer_fill_color = "rgba(60,179,113,0.05)";
		break;
	case "PISTEBLUE":
		var buffer_stroke_color = "rgba(100,149,237,1)";
			var buffer_fill_color = "rgba(100,149,237,0.05)";
		break;
	case "PISTERED":
		var buffer_stroke_color = "rgba(205,92,92,1)";
			var buffer_fill_color = "rgba(205,92,92,0.05)";
		break;
	case "PISTEBLACK":
		var buffer_stroke_color = "rgba(47,79,79,1)";
			var buffer_fill_color = "rgba(47,79,79,0.05)";
		break;
	case "ROAD":
		var buffer_stroke_color = "rgba(105,105,105,1)";
			var buffer_fill_color = "rgba(105,105,105,0.05)";
		break;
	case "SKILIFT":
		var buffer_stroke_color = "rgba(128,128,128,1)";
			var buffer_fill_color = "rgba(128,128,128,0.05)";
		break;
	case "POWER6":
		var buffer_stroke_color = "rgba(47,79,79,1)";
			var buffer_fill_color = "rgba(47,79,79,0.05)";
		break;
	case "POWER3":
		var buffer_stroke_color = "rgba(47,79,79,1)";
			var buffer_fill_color = "rgba(47,79,79,0.05)";
		break;
	case "POWERO":
		var buffer_stroke_color = "rgba(47,79,79,1)";
			var buffer_fill_color = "rgba(47,79,79,0.05)";
		break;
	case "CITY":
		var buffer_stroke_color = "rgba(255,0,0,1)";
			var buffer_fill_color = "rgba(255,0,0,0.05)";
		break;
	case "TOWN":
		var buffer_stroke_color = "rgba(255,0,0,1)";
			var buffer_fill_color = "rgba(255,0,0,0.05)";
		break;
	case "VILLAGE":
		var buffer_stroke_color = "rgba(255,0,0,1)";
			var buffer_fill_color = "rgba(255,0,0,0.05)";
		break;
		default:
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
    	  launch_buffer_creation_from_feature_array(feature_array,parseFloat($( "#rank_2_buffer_parameters_input_1" ).val()),parseFloat($( "#rank_2_buffer_parameters_input_2" ).val()),clue_title,buffer_stroke_color,buffer_fill_color);
      };

}

function launch_buffer_creation_from_feature_array(feature_array,buffer_min,buffer_max,clue_title,buffer_stroke_color,buffer_fill_color){

//fonction d'ajout du buffer
	  draw_source.clear();
	  var clue_1;
		var clue_1_id;
		var group_1;
		var group_1_id;

		if(app.list_of_rank_1_clue_id.length == 0){
			var clue_1_id = 1;
		} else {
			clue_1_id = (Math.max(...app.list_of_rank_1_clue_id) + 1);
		}

		var point_id_array= [];
		var properties_array = [];
		for(var i=0; i<feature_array.length; i++){
			var point_id = add_element_of_reference(clue_1_id,feature_array[i]);
			point_id_array.push(point_id);
			properties_array.push(feature_array[i].getProperties());
		}

		if(feature_array.length == 1){
			switch (feature_array[0].getProperties().itemType) {
			  case 'CITY':
				  clue_1 = new rank_1_clue(clue_1_id, "Grande ville", point_id_array,feature_array[0].getProperties().name,feature_array[0].getProperties(),true);
				  break;
			  case 'TOWN':
				  clue_1 = new rank_1_clue(clue_1_id, "Ville", point_id_array,feature_array[0].getProperties().name,feature_array[0].getProperties(),true);
				  break;
			  case 'VILLAGE':
				  clue_1 = new rank_1_clue(clue_1_id, "Village", point_id_array,feature_array[0].getProperties().name,feature_array[0].getProperties(),true);
				  break;
			  case 'PEAK':
				  clue_1 = new rank_1_clue(clue_1_id, "Sommet", point_id_array,feature_array[0].getProperties().name,feature_array[0].getProperties(),true);
				  break;
			  case 'COL':
				  clue_1 = new rank_1_clue(clue_1_id, "Col", point_id_array,feature_array[0].getProperties().name,feature_array[0].getProperties(),true);
				  break;
			  case 'LAKE':
				  clue_1 = new rank_1_clue(clue_1_id, "Lac", point_id_array,feature_array[0].getProperties().name,feature_array[0].getProperties(),true);
				  break;
			  case 'RESERVOIR':
				  clue_1 = new rank_1_clue(clue_1_id, "Réservoir", point_id_array,feature_array[0].getProperties().name,feature_array[0].getProperties(),true);
				  break;
			  case 'WATEROTHER':
				  clue_1 = new rank_1_clue(clue_1_id, "Autre", point_id_array,feature_array[0].getProperties().name,feature_array[0].getProperties(),true);
				  break;
			  case 'RIVER':
				  clue_1 = new rank_1_clue(clue_1_id, "Rivière", point_id_array,feature_array[0].getProperties().name,feature_array[0].getProperties(),true);
				  break;
			  case 'STREAM':
				  clue_1 = new rank_1_clue(clue_1_id, "Ruisseau", point_id_array,feature_array[0].getProperties().name,feature_array[0].getProperties(),true);
				  break;
			  case 'POWER6':
				  clue_1 = new rank_1_clue(clue_1_id, "LHT 6 brins", point_id_array,feature_array[0].getProperties().name,feature_array[0].getProperties(),true);
				  break;
			  case 'POWER3':
				  clue_1 = new rank_1_clue(clue_1_id, "LHT 3 brins", point_id_array,feature_array[0].getProperties().name,feature_array[0].getProperties(),true);
				  break;
			  case 'POWERO':
				  clue_1 = new rank_1_clue(clue_1_id, "Equipement éléctrique", point_id_array,feature_array[0].getProperties().name,feature_array[0].getProperties(),true);
				  break;
			  case 'MAST':
				  clue_1 = new rank_1_clue(clue_1_id, "Tour téléphonie", point_id_array,feature_array[0].getProperties().name,feature_array[0].getProperties(),true);
				  break;
			  case 'SKILIFT':
				  clue_1 = new rank_1_clue(clue_1_id, "Remontée mécanique", point_id_array,feature_array[0].getProperties().name,feature_array[0].getProperties(),true);
				  break;
			  case 'PISTEGREEN':
				  clue_1 = new rank_1_clue(clue_1_id, "Piste verte", point_id_array,feature_array[0].getProperties().name,feature_array[0].getProperties(),true);
				  break;
			  case 'PISTEBLUE':
				  clue_1 = new rank_1_clue(clue_1_id, "Piste bleue", point_id_array,feature_array[0].getProperties().name,feature_array[0].getProperties(),true);
				  break;
			  case 'PISTERED':
				  clue_1 = new rank_1_clue(clue_1_id, "Piste rouge", point_id_array,feature_array[0].getProperties().name,feature_array[0].getProperties(),true);
				  break;
			  case 'PISTEBLACK':
				  clue_1 = new rank_1_clue(clue_1_id, "Piste noire", point_id_array,feature_array[0].getProperties().name,feature_array[0].getProperties(),true);
				  break;
			  case 'PATHWAY':
				  clue_1 = new rank_1_clue(clue_1_id, "Sentier de randonnée", point_id_array,feature_array[0].getProperties().name,feature_array[0].getProperties(),true);
				  break;
			  case 'ROAD':
				  clue_1 = new rank_1_clue(clue_1_id, "Route", point_id_array,feature_array[0].getProperties().name,feature_array[0].getProperties(),true);
				  break;
			  default:
				  clue_1 = new rank_1_clue(clue_1_id, "Objet d'intérêt", point_id_array,feature_array[0].getProperties().name,feature_array[0].getProperties(),true);
			  break;
			}
		} else {
			clue_1 = new rank_1_clue(clue_1_id, "clue_from_tree", point_id_array, clue_title, properties_array,true);
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
			'value_1': buffer_min,
			'value_2': buffer_max,
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

//				var rank_1_to_rank_2 = new group_rank_1_to_rank_2(id_group_rank_1_to_rank_2, [clue_1_id], id_rank_clue_2, "Buffer",$( "#rank_2_buffer_parameters_input_2" ).val() + " km");
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
}


export {initialize_add_clue_from_tree,add_objects_from_tree,launch_buffer_creation_from_feature_array};