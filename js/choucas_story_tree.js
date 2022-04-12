//code relatif à la première approche de représentation des informations dans la fenêtre d'indices

//svg container for story_tree
var svg_story_tree_container;
//table containing the hypothesis
var hypothesis_table = [];
var hypothesis_id_table = [];
//table containing the hypothesis on a node form
var hypothesis_node_table = [];

var hypothesis_higlighted = [];

var filter_in_construction = null;


//scales for tree drawing
var story_tree_scale_x;
var story_tree_scale_y;

//object to keep the graphical object right-clicked
var object_on_right_clic = null;

var launch_filter;

function create_story_tree_structure(){

	//create the svg for the tree
	if($("#svg_story_tree_container").length == 0){
		svg_story_tree_container = d3.select("#story_tree").append("svg")
		.attr("id", "svg_story_tree_container")
		.attr("width", "100%")
		.attr("height", "100%");
	} else {
		d3.selectAll(".story_tree_element").remove();
	}

	//create the bottom rectangle of the tree
	svg_story_tree_container.append("rect")
	.attr('id',"story_tree_bottom")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", $('#svg_story_tree_container').width())
	.attr("height", $('#svg_story_tree_container').height())
    .attr("fill", "white");
	//right clic on story_tree_bottom, possibility to create a new hypothesis


	//open new_hypothesis_menu from bottom clic
	$("#story_tree_bottom").contextmenu(function(e) {
//		object_on_right_clic = {type:'story_tree_hypothesis',id:e.target.id};
		window.event.returnValue = false;
		$('#story_tree_bottom_menu').css("display","block");
		$('#story_tree_bottom_menu').css("top",e.pageY + 'px');
		$('#story_tree_bottom_menu').css("left",e.pageX + 'px');
		object_on_right_clic = null;
	});

	$("#story_tree_bottom").click(function() {
		empty_hypothesis_highlighted()
	});

	//close new_hypothesis_menu from bottom clic
	$("#story_tree_bottom_menu_cancel").click(function(){
		$('#story_tree_bottom_menu').css("display","none");
	});

	//create new hypothesis
	$("#story_tree_bottom_menu_add_hypothesis").click(function(e){add_new_hypothesis(e)});

	//create new sub_hypothesis
	$('#story_tree_hypothesis_menu_add_hypothesis').click(function(e){
		add_new_sub_hypothesis(e);
		$('#story_tree_hypothesis_menu').css("display","none");
	});

	//suppress hypothesis
	$("#story_tree_hypothesis_menu_suppress_hypothesis").click(function(e){
		suppress_hypothesis(e);
		$('#story_tree_hypothesis_menu').css("display","none");
	});

	//modify hypothesis
	$("#story_tree_hypothesis_menu_modify_hypothesis").click(function(e){
		modify_hypothesis(e);
		$('#story_tree_hypothesis_menu').css("display","none");
	});

	//close story_tree_hypothesis_menu
	$("#story_tree_hypothesis_menu_cancel").click(function(){
		$('#story_tree_hypothesis_menu').css("display","none");
	});


	$("#story_tree_hypothesis_menu_show_only").click(function(){
		show_only_clicked_area();
		$('#story_tree_hypothesis_menu').css("display","none");
	});

	//close filter setting menu
	$('#close_filter_WindowPP').on('click',function(){
		$('#filter_WindowPP').fadeOut();
		if(filter_in_construction.condition == "new"){
			Suppress_Filter_Layer(filter_in_construction.id);
		} else if(filter_in_construction.condition == "modify"){
			for(var a=0; a < hypothesis_table.length; a++){
				if(hypothesis_table[a].id_hypothesis ==filter_in_construction.id){
					Modify_Filter_Layer({
				    	'filter_id':hypothesis_table[a].id_hypothesis,
				    	'object':hypothesis_table[a].object,
				    	'buffer_limit_1':hypothesis_table[a].buffer_limit_1,
				    	'buffer_limit_2':hypothesis_table[a].buffer_limit_2
				    	});
				    	Hide_Filter_Layer(filter_in_construction.id);
				    	break;
				}
			}
		}
	});

	//cursor of filter setting menu
	  $( function() {
		    $( "#slider_buffer" ).slider({
		      range: true,
		      min: 0,
		      max: 6,
		      step: 0.05,
		      values: [ 0, 2 ],
		      slide: function( event, ui ) {
		        $( "#amount_buffer_PP_1" ).val(ui.values[ 0 ]);
		        $( "#amount_buffer_PP_2" ).val(ui.values[ 1 ]);
		      }
		    });
		    $( "#amount_buffer_PP_1" ).val(0);
	        $( "#amount_buffer_PP_2" ).val(2);
		  } );

	  initialize_filtre_on_map();


	  $( function() {
		    $( "#slider_buffer_fromtree" ).slider({
		      range: true,
		      min: 0,
		      max: 6,
		      step: 0.05,
		      values: [ 0, 2 ],
		      slide: function( event, ui ) {
		        $( "#amount_buffer_PP_1_fromtree" ).val(ui.values[ 0 ]);
		        $( "#amount_buffer_PP_2_fromtree" ).val(ui.values[ 1 ]);
		      }
		    });
		    $( "#amount_buffer_PP_1_fromtree" ).val(0);
	        $( "#amount_buffer_PP_2_fromtree" ).val(2);
		  } );


	  $("#close_filter_WindowPP_fromtree").on('click',function(){
		  $('#filter_WindowPP_fromtree').fadeOut();
	  });

	  $('#close_filter_WindowPP_fromtree').on('click',function(){
			$('#filter_WindowPP_fromtree').fadeOut();
			if(filter_in_construction.condition == "new"){
				Suppress_Filter_Layer(filter_in_construction.id);
			} else if(filter_in_construction.condition == "modify"){
				for(var a=0; a < hypothesis_table.length; a++){
					if(hypothesis_table[a].id_hypothesis ==filter_in_construction.id){
						Modify_Filter_Layer({
					    	'filter_id':hypothesis_table[a].id_hypothesis,
					    	'object':hypothesis_table[a].object,
					    	'buffer_limit_1':hypothesis_table[a].buffer_limit_1,
					    	'buffer_limit_2':hypothesis_table[a].buffer_limit_2
					    	});
					    	Hide_Filter_Layer(filter_in_construction.id);
					    	break;
					}
				}
			}
			deselectAllNodes("#tree");
		});



}


//------------------
//Ajout nouvelle hypothèse/filtre
//------------------
function add_new_hypothesis(event){

	//add_new main hypothesis
	var hypothesis_id;
	if(hypothesis_id_table.length == 0){
		var hypothesis_id = 1;
	} else {
		hypothesis_id = Math.max(...hypothesis_id_table) + 1;
	}

	filter_in_construction = {'id':hypothesis_id,'condition':"new"};

	open_menu_filter("new",hypothesis_id);
	$('#story_tree_bottom_menu').css("display","none");

	Add_Filter_Layer({
		'filter_id':hypothesis_id,
		'object':null,
		'buffer_limit_1':0,
		'buffer_limit_2':2
		})
	Show_Filter_Layer(hypothesis_id);

	launch_filter = function(event){

	hypothesis_id_table.push(hypothesis_id);


	var filter = add_filter_to_hypothesis();

	hypothesis_table.push({
		'id_hypothesis': '' + hypothesis_id + '',
		'object_filtre': filter.object_filtre,
		'filter_object': filter.object,
		'filter_buffer_limit_1': filter.buffer_limit_1,
		'filter_buffer_limit_2': filter.buffer_limit_2,
		'main_filter_table': [],
		'sub_hypothesis_table': [],
		'main_hypothesis': null,
		'id_hypothesis_node': '' + hypothesis_id + '',
		'map_filter':false
	});

	hypothesis_node_table.push('' + hypothesis_id + '')


	create_story_tree();

	$('.story_tree_hypothesis_element').off( "click");
	$('.story_tree_hypothesis_element').off("contextmenu");

	//set the hypothesis menu event
	$('.story_tree_hypothesis_element').contextmenu(function(e) {
		window.event.returnValue = false;
		$('#story_tree_hypothesis_menu').css("display","block");
		$('#story_tree_hypothesis_menu').css("top",e.pageY + 'px');
		$('#story_tree_hypothesis_menu').css("left",e.pageX + 'px');
		object_on_right_clic = {type:'story_tree_hypothesis',id:e.target.id};
	});

	$('.story_tree_hypothesis_element').click(function(e){
		push_hypothesis_highlighted(e)
	});



	$('#filter_WindowPP').fadeOut();

	filter_in_construction = null;

	Hide_Filter_Layer(hypothesis_id);

	}
}



//------------------
//Ajout nouvelle hypothèse/filtre à une hypothèse existante
//------------------
function add_new_sub_hypothesis(event){
	//add new sub_hypothesis to an hypothesis

	var hypothesis_id;
	if(hypothesis_id_table.length == 0){
		var hypothesis_id = 1;
	} else {
		hypothesis_id = Math.max(...hypothesis_id_table) + 1;
	}

	filter_in_construction = {'id':hypothesis_id,'condition':"new"};

	open_menu_filter("new",hypothesis_id);
	$('#story_tree_bottom_menu').css("display","none");

	Add_Filter_Layer({
		'filter_id':hypothesis_id,
		'object':null,
		'buffer_limit_1':0,
		'buffer_limit_2':2
		})

	Show_Filter_Layer(hypothesis_id);

	launch_filter = function(event){

	hypothesis_id_table.push(hypothesis_id);

	var main_id_hypothesis_node;

	for (var i = 0; i < hypothesis_table.length; i++) {
		  if(hypothesis_table[i].id_hypothesis == object_on_right_clic.id){
			  hypothesis_table[i].sub_hypothesis_table.push(hypothesis_id);
			  main_id_hypothesis_node = hypothesis_table[i].id_hypothesis_node;
			  break;
		  }
		}


	var filter = add_filter_to_hypothesis();

	hypothesis_table.push({
		'id_hypothesis': '' + hypothesis_id + '',
		'filter_object': filter.object,
		'object_filtre': filter.object_filtre,
		'filter_buffer_limit_1': filter.buffer_limit_1,
		'filter_buffer_limit_2': filter.buffer_limit_2,
		'main_filter_table': [],
		'sub_hypothesis_table': [],
		'main_hypothesis': object_on_right_clic.id,
		'id_hypothesis_node': main_id_hypothesis_node + '.' + hypothesis_id,
		'map_filter':false
	});

	hypothesis_node_table.push(main_id_hypothesis_node + '.' + hypothesis_id)



	create_story_tree();

	$('.story_tree_hypothesis_element').off( "click");
	$('.story_tree_hypothesis_element').off( "contextmenu");

	//set hypothesis_menu events
	$('.story_tree_hypothesis_element').contextmenu(function(e) {
		window.event.returnValue = false;
		$('#story_tree_hypothesis_menu').css("display","block");
		$('#story_tree_hypothesis_menu').css("top",e.pageY + 'px');
		$('#story_tree_hypothesis_menu').css("left",e.pageX + 'px');
		object_on_right_clic = {type:'story_tree_hypothesis',id:e.target.id};
	});

	$('.story_tree_hypothesis_element').click(function(e){
		push_hypothesis_highlighted(e)
	});


	$('#filter_WindowPP').fadeOut();

	filter_in_construction = null;

	Hide_Filter_Layer(hypothesis_id);
	}
}


//------------------
//Modifie hypothèse/filtre existant
//------------------
function modify_hypothesis(event){

	var hypothesis_to_modify;
	for(var b=0; b < hypothesis_table.length; b++){
		if(hypothesis_table[b].id_hypothesis == object_on_right_clic.id){
			hypothesis_to_modify = hypothesis_table[b];
			break;
		}
	}

	if(hypothesis_to_modify.map_filter){
	} else {
		open_menu_filter("modify",object_on_right_clic.id);

		filter_in_construction = {'id':object_on_right_clic.id,'condition':"modify"};

		Show_Filter_Layer(object_on_right_clic.id);

		launch_filter = function(event){
			var filter = add_filter_to_hypothesis();

			for(var a=0; a < hypothesis_table.length; a++){
				if(hypothesis_table[a].id_hypothesis == object_on_right_clic.id){
					hypothesis_table[a].filter_object = filter.object;
					hypothesis_table[a].filter_buffer_limit_1 = filter.buffer_limit_1;
					hypothesis_table[a].filter_buffer_limit_2 = filter.buffer_limit_2;
					break;
				}
			}
			$('#filter_WindowPP').fadeOut();

			filter_in_construction = null;

			Hide_Filter_Layer(object_on_right_clic.id);
		}
	}
}


//------------------
//supprimer hypothèse/filtre existant
//------------------
function suppress_hypothesis(event){
	var main_id_hypothesis_node;

	for (var i = 0; i < hypothesis_table.length; i++) {
		  if(hypothesis_table[i].id_hypothesis == object_on_right_clic.id){
			  main_id_hypothesis_node = hypothesis_table[i].id_hypothesis_node;
			  break;
		  }
		}

	var hypo_to_remove = [];
	var hypo_id_to_remove = [];
	var hypo_node_to_remove = [];

	for (var i = 0; i < hypothesis_table.length; i++) {
		  if(hypothesis_table[i].id_hypothesis_node.indexOf(main_id_hypothesis_node) > -1){
			  hypo_to_remove.push(hypothesis_table[i]);
			  hypo_id_to_remove.push(parseInt(hypothesis_table[i].id_hypothesis));
		  }
		}

	for (var i = 0; i < hypothesis_node_table.length; i++) {
		  if(hypothesis_node_table[i].indexOf(main_id_hypothesis_node) > -1){
			  hypo_node_to_remove.push(hypothesis_node_table[i]);
		  }
		}

	for (var i = 0; i < hypo_to_remove.length; i++) {
		var index_of_remove = hypothesis_table.indexOf(hypo_to_remove[i]);
		hypothesis_table.splice(index_of_remove,1);
	}

	for (var i = 0; i < hypo_id_to_remove.length; i++) {
		var index_of_remove = hypothesis_id_table.indexOf(hypo_id_to_remove[i]);
		hypothesis_id_table.splice(index_of_remove,1);
	}

	for (var i = 0; i < hypo_node_to_remove.length; i++) {
		var index_of_remove = hypothesis_node_table.indexOf(hypo_node_to_remove[i]);
		hypothesis_node_table.splice(index_of_remove,1);
	}

	for (var i = 0; i < hypo_to_remove.length; i++) {
		Suppress_Filter_Layer(hypo_to_remove[i].id_hypothesis);
	}

	create_story_tree();

	$('.story_tree_hypothesis_element').off("click");
	$('.story_tree_hypothesis_element').off("contextmenu");

	//set hypothesis_menu events
	$('.story_tree_hypothesis_element').contextmenu(function(e) {
		window.event.returnValue = false;
		$('#story_tree_hypothesis_menu').css("display","block");
		$('#story_tree_hypothesis_menu').css("top",e.pageY + 'px');
		$('#story_tree_hypothesis_menu').css("left",e.pageX + 'px');
		object_on_right_clic = {type:'story_tree_hypothesis',id:e.target.id};
	});

	$('.story_tree_hypothesis_element').click(function(e){
		push_hypothesis_highlighted(e);
	});



}


//------------------
//selectionne une hypothese pour son affichage dans la carte
//------------------
function push_hypothesis_highlighted(object){

	empty_hypothesis_highlighted();

	var node_table = $('#' + object.target.id).attr('id_node').split('.');
	for(var a=0; a < hypothesis_table.length; a++){
		if(node_table.indexOf(hypothesis_table[a].id_hypothesis) > -1){
			hypothesis_higlighted.push(hypothesis_table[a])
		}
	}


	svg_story_tree_container.selectAll('.story_tree_hypothesis_element').each(function() {
		if(node_table.indexOf(this.id) > -1){
			d3.select(this).style("stroke-width", "2");
			d3.select(this).style("stroke", "blue");
		}
	});

	var link_node_table = [];
	for(var a=0; a < node_table.length; a++){
		link_node_table.push("link_" + node_table[a]);
	}

	svg_story_tree_container.selectAll('.link_story_tree_hypothesis').each(function() {
		if(link_node_table.indexOf(this.id) > -1){
			d3.select(this).style("stroke-width", "4");
			d3.select(this).style("stroke", "blue");
		}
	});

	Create_Heat_Map(hypothesis_higlighted,'all');
}


//------------------
//deselectionne les hypothese, pour leur affichage dans la carte
//------------------
function empty_hypothesis_highlighted(){
	hypothesis_higlighted = [];
	svg_story_tree_container.selectAll('.link_story_tree_hypothesis').each(function() {
		d3.select(this).style('stroke', 'black');
		d3.select(this).style("stroke-width", "2");
	});
	svg_story_tree_container.selectAll('.story_tree_hypothesis_element').each(function() {
		d3.select(this).style('stroke', 'none');
	});

	Remove_Heat_Map();
}

//------------------
//création de la structure de l'arbre des filtres
//------------------
function create_story_tree(){
	//recreate story_tree after adding a filter or an hypothesis

	var hypothesis_table_to_draw = [];
	//copy of the hypothesis table. the objects of this table will be removed when they are added in structure_to_draw
	var structure_to_draw = [];
	//structured version of the hypothesis table. The sub_hypothesis are contained in the main_hypothesis object
	var structure_index = [];
	//table of the different hyothesis_id by level of structure (main hypothesis, sub hypothesis level 1, sub hypothesis level 2, ...)

	//copy hypothesis_table elements into hypothesis_table_to_draw
	for(var a = 0; a < hypothesis_table.length; a++){
		hypothesis_table_to_draw.push(hypothesis_table[a]);
	}
//	console.log(hypothesis_table_to_draw);
	var index_to_remove = [];
	//index used to remove elements from hypothesis_table_to_draw

	structure_index.push([]);

	for(var a = 0; a < hypothesis_table_to_draw.length; a++){
		//set the first structure_index level

		if(hypothesis_table_to_draw[a].main_hypothesis == null){
			//set hypothesis_id to hypothesis table
			structure_index[0].push(hypothesis_table_to_draw[a].id_hypothesis);
			index_to_remove.push(hypothesis_table_to_draw[a].id_hypothesis);
		}
	}
	//remove elements which have been insert into structure_to_draw from hypothesis_table_to_draw
	for(var t = 0; t < index_to_remove.length; t++){
		for(var s = 0; s < hypothesis_table_to_draw.length; s++){
			if(hypothesis_table_to_draw[s].id_hypothesis == index_to_remove[t]){
				hypothesis_table_to_draw.splice(s, 1);
			}

		}
	}
	index_to_remove = [];
	//index of the level of hypothesis which have to been insert into structure_to_draw
	var index = 0;

	if(hypothesis_table_to_draw.length > 0){
	do {
		//if there is nothing more into hypothesis_table_to_draw, break
		structure_index.push([]);
		index = index +1;
		//loop on hypothesis_table_to_draw for each main hypothesis, which have their id into structure_index[index - 1]
		//select an element of structure_index[index - 1]
		for(var u=0; u< structure_index[index - 1].length; u++){
			//loop on hypothesis_table_to_draw
			var id_main = structure_index[index - 1][u];
			for(var o=0; o< hypothesis_table_to_draw.length; o++){
			//test if the main hypothesis of the element of hypothesis_table_to_draw has the same id that the element selected from structure_index[index - 1]
				if(hypothesis_table_to_draw[o].main_hypothesis == id_main){
					//put the element to remove
					index_to_remove.push(hypothesis_table_to_draw[o].id_hypothesis);
					//insert the element into the new level of hypothesis structure
					structure_index[index].push(hypothesis_table_to_draw[o].id_hypothesis);

				}
			}
		}
		for(var t = 0; t < index_to_remove.length; t++){
			for(var s = 0; s < hypothesis_table_to_draw.length; s++){
				if(hypothesis_table_to_draw[s].id_hypothesis == index_to_remove[t]){
					hypothesis_table_to_draw.splice(s, 1);
				}

			}
		}
		index_to_remove = [];
		} while (hypothesis_table_to_draw.length > 0);
	}

	draw_entities(structure_index)

}

//------------------
//Création de l'arbre des filtres
//------------------
function draw_entities(structure_index){

	d3.selectAll(".story_tree_hypothesis").remove();

	var number_of_horizontal_units = 100 + structure_index.length*100 + 100;
	var number_of_vertical_units;
	var number_of_vertical_units_main = 0;
	for(var d=0; d< structure_index.length; d++){
		if(number_of_vertical_units_main < structure_index[d].length){
			number_of_vertical_units_main = structure_index[d].length;
		}
	}
	number_of_vertical_units = 100 + number_of_vertical_units_main*100 + 100;


	story_tree_scale_x = null;
	story_tree_scale_y = null;


	//echelle
	story_tree_scale_x = d3.scale.linear()
	.domain([0, number_of_horizontal_units])
	.range([0, $('#svg_story_tree_container').width()]);
	story_tree_scale_y = d3.scale.linear()
	.domain([0, number_of_vertical_units])
	.range([0, $('#svg_story_tree_container').height()]);

	color_scale_x = d3.scale.linear()
	.domain([0, structure_index.length])
	.range([0, 155]);

	color_scale_y = d3.scale.linear()
	.domain([0, number_of_vertical_units_main])
	.range([0, 255]);

	hypothesis_node_table.sort();

	var hypothesis_level;
	var previous_level = 1;
	var y_index = 0;

	for(var f=0; f<hypothesis_node_table.length; f++){

		var hypothesis_path = hypothesis_node_table[f].split('.');

		hypothesis_level = hypothesis_path.length;

		if(hypothesis_level == previous_level){
			y_index = y_index+1;

			var color_R = color_scale_x(structure_index.length - hypothesis_level +1);
			var color_B;
			if(hypothesis_level == 1){
				color_B = color_scale_y(y_index-1);
			} else if(hypothesis_level == 2) {
				color_B = color_scale_y(y_index/(hypothesis_level/2)-1);
			} else if(hypothesis_level == 3){
				color_B = color_scale_y(y_index/(hypothesis_level/3)-1);
			} else {
				color_B = color_scale_y(y_index/(hypothesis_level/4)-1);
			}

			svg_story_tree_container.append("circle")
			.attr('id',hypothesis_path[hypothesis_path.length -1])
			.attr('id_node',hypothesis_node_table[f])
			.attr('class',"story_tree_hypothesis story_tree_hypothesis_element")
		    .attr("cx", story_tree_scale_x(100*hypothesis_level))
		    .attr("cy", story_tree_scale_y(y_index*100))
			.attr("r", story_tree_scale_y(30))
		    .attr("fill", "rgb("+ color_R + ", "+ color_B + ", 0)")


			previous_level = hypothesis_level;

		} else if(hypothesis_level > previous_level){

			var color_R = color_scale_x(structure_index.length- hypothesis_level +1);
			var color_B;
			if(hypothesis_level == 1){
				color_B = color_scale_y(y_index-1);
			} else if(hypothesis_level == 2) {
				color_B = color_scale_y(y_index/(hypothesis_level/2)-1);
			} else if(hypothesis_level == 3){
				color_B = color_scale_y(y_index/(hypothesis_level/3)-1);
			} else {
				color_B = color_scale_y(y_index/(hypothesis_level/4)-1);
			}

			svg_story_tree_container.append("circle")
			.attr('id',hypothesis_path[hypothesis_path.length -1])
			.attr('id_node',hypothesis_node_table[f])
			.attr('class',"story_tree_hypothesis story_tree_hypothesis_element")
		    .attr("cx", story_tree_scale_x(100*hypothesis_level))
		    .attr("cy", story_tree_scale_y(y_index*100))
			.attr("r", story_tree_scale_y(30))
		    .attr("fill", "rgb("+ color_R + ", "+ color_B + ", 0)");

			previous_level = hypothesis_level;
		} else if(hypothesis_level < previous_level){
			y_index = y_index+1;

			var color_R = color_scale_x(structure_index.length- hypothesis_level +1);
			var color_B;
			if(hypothesis_level == 1){
				color_B = color_scale_y(y_index-1);
			} else if(hypothesis_level == 2) {
				color_B = color_scale_y(y_index/(hypothesis_level/2)-1);
			} else if(hypothesis_level == 3){
				color_B = color_scale_y(y_index/(hypothesis_level/3)-1);
			} else {
				color_B = color_scale_y(y_index/(hypothesis_level/4)-1);
			}

			svg_story_tree_container.append("circle")
			.attr('id',hypothesis_path[hypothesis_path.length -1])
			.attr('id_node',hypothesis_node_table[f])
			.attr('class',"story_tree_hypothesis story_tree_hypothesis_element")
		    .attr("cx", story_tree_scale_x(100*hypothesis_level))
		    .attr("cy", story_tree_scale_y(y_index*100))
			.attr("r", story_tree_scale_y(30))
		    .attr("fill", "rgb("+ color_R + ", "+ color_B + ", 0)");

			previous_level = hypothesis_level;
		}



		if(hypothesis_level>1){


			var actual_x = parseFloat($('#' + hypothesis_node_table[f].split('.')[hypothesis_node_table[f].split('.').length -1]).attr('cx'));
			var actual_y = parseFloat($('#' + hypothesis_node_table[f].split('.')[hypothesis_node_table[f].split('.').length -1]).attr('cy'));
			var previous_x = parseFloat($('#' + hypothesis_node_table[f].split('.')[hypothesis_node_table[f].split('.').length -2]).attr('cx'));
			var previous_y = parseFloat($('#' + hypothesis_node_table[f].split('.')[hypothesis_node_table[f].split('.').length -2]).attr('cy'));

			var lineData = [ { "x": previous_x,   "y": previous_y},  { "x": actual_x,  "y": actual_y}];
			var lineFunction = d3.svg.line()
			                          .x(function(d) { return d.x; })
			                          .y(function(d) { return d.y; })
			                         .interpolate("linear");


			var link = svg_story_tree_container.append("path")
										.attr("id", "link_" + hypothesis_path[hypothesis_path.length -1])
									      .attr('class',"story_tree_hypothesis link_story_tree_hypothesis")
			                            .attr("d", lineFunction(lineData))
			                            .attr("stroke", "black")
			                            .attr("stroke-width", 2)
			                            .attr("fill", "none");


		}


	}

	svg_story_tree_container.selectAll(".story_tree_hypothesis_element")
	.on("mouseover", function(){
		 Show_Filter_Layer(this.id);
		 var hypothesis_to_show;
		 for (var i = 0; i < hypothesis_table.length; i++) {
			  if(hypothesis_table[i].id_hypothesis == this.id){
				  hypothesis_to_show = hypothesis_table[i];
				  break;
			  }
			}
		 $('#story_tree_explain_menu').css("top",this.pageY + 'px');
		$('#story_tree_explain_menu').css("left",this.pageX + 'px');
		 $('#story_tree_explain_menu').html(
				 "" + hypothesis_to_show.object_filtre +
				 "<br>" +
				 "" + hypothesis_to_show.filter_buffer_limit_1 + " km - " +
				 "" + hypothesis_to_show.filter_buffer_limit_2 + " km" +
				 ""
				 );
		 $('#story_tree_explain_menu').show();
	})
    .on("mouseout", function(d){
    	Hide_Filter_Layer(this.id);
    	$('#story_tree_explain_menu').hide();
	});

//	svg_story_tree_container.selectAll("story_tree_hypothesis").forEach(function(){
//		console.log(this);
////		this.on("mouseover", Show_Filter_Layer(this.id))
////	    .on("mouseout", Hide_Filter_Layer(this.id));
//	})

}


//------------------
//Ouverture du menu de paramétrage des filtres
//------------------
function open_menu_filter(condition, clicked_hypothesis_id){


	$('#filter_WindowPP').fadeIn();
	//draggable
	$('#filter_WindowPP').draggable();

	var selectedItemArray;

	$( "#amount_buffer_PP_1" ).on("keydown",function search(e) {
	    if(e.keyCode == 13) {
	    	$( "#slider_buffer" ).slider({values: [ parseFloat($(this).val()), parseFloat($( "#amount_buffer_PP_2" ).val()) ]})
	    	Modify_Filter_Layer({
					    	'filter_id':clicked_hypothesis_id,
					    	'object':selectedItemArray,
					    	'object_filtre': 'test',
					    	'buffer_limit_1':parseFloat($( "#amount_buffer_PP_1" ).val()),
					    	'buffer_limit_2':parseFloat($( "#amount_buffer_PP_2" ).val())
					    	})
	    }
	});

	$( "#amount_buffer_PP_2" ).on("keydown",function search(e) {
	    if(e.keyCode == 13) {
	    	$( "#slider_buffer" ).slider({values: [ parseFloat($( "#amount_buffer_PP_1" ).val()),parseFloat($(this).val()) ]})
	    	Modify_Filter_Layer({
					    	'filter_id':clicked_hypothesis_id,
					    	'object':selectedItemArray,
					    	'object_filtre': 'test',
					    	'buffer_limit_1':parseFloat($( "#amount_buffer_PP_1" ).val()),
					    	'buffer_limit_2':parseFloat($( "#amount_buffer_PP_2" ).val())
					    	})
	    }
	});

	$( "#tree_PP span" ).on("click",function search(e) {

		var selectedItemRefs = new Set();
	  	  var selectedNodes = $("#tree_PP").fancytree("getTree").getSelectedNodes();
	  	  $.each(selectedNodes, function (event, node) {
	  	    if(node.isSelected() && !node.isFolder() && node.extraClasses != "hide") {
	  	      selectedItemRefs.add(node.data.itemRef);
	  	    }
	  	  });
	  	selectedItemArray = Array.from(selectedItemRefs);

		Modify_Filter_Layer({
	    	'filter_id':clicked_hypothesis_id,
	    	'object':selectedItemArray,
	    	'object_filtre': 'test',
	    	'buffer_limit_1':parseFloat($( "#amount_buffer_PP_1" ).val()),
	    	'buffer_limit_2':parseFloat($( "#amount_buffer_PP_2" ).val())
	    	})
	});

	if(condition == "new"){
		deselectAllNodes("#tree_PP");
		$( "#slider_buffer" ).slider({
			values: [ 0, 2 ],
		    slide: function( event, ui ) {

		    	var selectedItemRefs = new Set();
			  	  var selectedNodes = $("#tree_PP").fancytree("getTree").getSelectedNodes();
			  	  $.each(selectedNodes, function (event, node) {
			  	    if(node.isSelected() && !node.isFolder() && node.extraClasses != "hide") {
			  	      selectedItemRefs.add(node.data.itemRef);
			  	    }
			  	  });
			  	selectedItemArray = Array.from(selectedItemRefs);

			    	Modify_Filter_Layer({
				    	'filter_id':clicked_hypothesis_id,
				    	'object':selectedItemArray,
				    	'object_filtre': 'test',
				    	'buffer_limit_1':ui.values[ 0 ],
				    	'buffer_limit_2':ui.values[ 1 ]
				    	});
				    $( "#amount_buffer_PP_1" ).val(ui.values[ 0 ]);
					$( "#amount_buffer_PP_2" ).val(ui.values[ 1 ]);
		        }
		});
		$( "#amount_buffer_PP_1" ).val(0);
		$( "#amount_buffer_PP_2" ).val(2);
	} else if(condition == "modify"){

		for(var a=0; a < hypothesis_table.length; a++){
			if(hypothesis_table[a].id_hypothesis ==clicked_hypothesis_id){
				$( "#slider_buffer" ).slider({
					values: [ parseFloat(hypothesis_table[a].filter_buffer_limit_1), parseFloat(hypothesis_table[a].filter_buffer_limit_2) ],
				slide: function( event, ui ) {

			    	var selectedItemRefs = new Set();
				  	  var selectedNodes = $("#tree_PP").fancytree("getTree").getSelectedNodes();
				  	  $.each(selectedNodes, function (event, node) {
				  	    if(node.isSelected() && !node.isFolder() && node.extraClasses != "hide") {
				  	      selectedItemRefs.add(node.data.itemRef);
				  	    }
				  	  });
				  	selectedItemArray = Array.from(selectedItemRefs);

				    	Modify_Filter_Layer({
					    	'filter_id':clicked_hypothesis_id,
					    	'object':selectedItemArray,
					    	'object_filtre': 'test',
					    	'buffer_limit_1':ui.values[ 0 ],
					    	'buffer_limit_2':ui.values[ 1 ]
					    	})
					    	$( "#amount_buffer_PP_1" ).val(ui.values[ 0 ]);
						$( "#amount_buffer_PP_2" ).val(ui.values[ 1 ]);
			        }
				});
				$( "#amount_buffer_PP_1" ).val(parseFloat(hypothesis_table[a].filter_buffer_limit_1));
				$( "#amount_buffer_PP_2" ).val(parseFloat(hypothesis_table[a].filter_buffer_limit_2));
				selectItems(hypothesis_table[a].filter_object,"#tree_PP");
				break;
			}
		}


	}



}





//------------------
//Ouverture du menu de paramétrage des filtres
//------------------
function create_filter_from_main_tree(condition, clicked_hypothesis_id){

	//add_new main hypothesis
	var hypothesis_id;
	if(hypothesis_id_table.length == 0){
		var hypothesis_id = 1;
	} else {
		hypothesis_id = Math.max(...hypothesis_id_table) + 1;
	}

	filter_in_construction = {'id':hypothesis_id,'condition':"new"};

	Add_Filter_Layer({
		'filter_id':hypothesis_id,
		'object':null,
		'buffer_limit_1':0,
		'buffer_limit_2':2
		})

	Show_Filter_Layer(hypothesis_id);

	$('#filter_WindowPP_fromtree').fadeIn();
	//draggable
	$('#filter_WindowPP_fromtree').draggable();

	var selectedItemArray;

	$( "#amount_buffer_PP_1_fromtree" ).on("keydown",function search(e) {
	    if(e.keyCode == 13) {
	    	$( "#slider_buffer_fromtree" ).slider({values: [ parseFloat($(this).val()), parseFloat($( "#amount_buffer_PP_2_fromtree" ).val()) ]})
	    	Modify_Filter_Layer({
					    	'filter_id':hypothesis_id,
					    	'object':selectedItemArray,
					    	'object_filtre': 'test',
					    	'buffer_limit_1':parseFloat($( "#amount_buffer_PP_1_fromtree" ).val()),
					    	'buffer_limit_2':parseFloat($( "#amount_buffer_PP_2_fromtree" ).val())
					    	})
	    }
	});

	$( "#amount_buffer_PP_2_fromtree" ).on("keydown",function search(e) {
	    if(e.keyCode == 13) {
	    	$( "#slider_buffer_fromtree" ).slider({values: [ parseFloat($( "#amount_buffer_PP_1_fromtree" ).val()),parseFloat($(this).val()) ]})
	    	Modify_Filter_Layer({
					    	'filter_id':hypothesis_id,
					    	'object':selectedItemArray,
					    	'object_filtre': 'test',
					    	'buffer_limit_1':parseFloat($( "#amount_buffer_PP_1_fromtree" ).val()),
					    	'buffer_limit_2':parseFloat($( "#amount_buffer_PP_2_fromtree" ).val())
					    	})
	    }
	});

		$( "#slider_buffer_fromtree" ).slider({
			values: [ 0, 2 ],
		    slide: function( event, ui ) {

		    	var selectedItemRefs = new Set();
			  	  var selectedNodes = $("#tree").fancytree("getTree").getSelectedNodes();
			  	  $.each(selectedNodes, function (event, node) {
			  	    if(node.isSelected() && !node.isFolder() && node.extraClasses != "hide") {
			  	      selectedItemRefs.add(node.data.itemRef);
			  	    }
			  	  });
			  	selectedItemArray = Array.from(selectedItemRefs);

			    	Modify_Filter_Layer({
				    	'filter_id':hypothesis_id,
				    	'object':selectedItemArray,
				    	'object_filtre': 'test',
				    	'buffer_limit_1':ui.values[ 0 ],
				    	'buffer_limit_2':ui.values[ 1 ]
				    	});
				    $( "#amount_buffer_PP_1_fromtree" ).val(ui.values[ 0 ]);
					$( "#amount_buffer_PP_2_fromtree" ).val(ui.values[ 1 ]);
		        }
		});
		$( "#amount_buffer_PP_1_fromtree" ).val(0);
		$( "#amount_buffer_PP_2_fromtree" ).val(2);

		add_filter_from_main_tree_to_tree();

		launch_filter = function(){

			var main_hypothesis;
			var id_hypothesis_node;
			for(var z=0; z < $(".radio_filter_from_tree").length; z++){
				if($(".radio_filter_from_tree")[z].checked){
					if($(".radio_filter_from_tree")[z].value == 'new_hypothesis'){
						main_hypothesis = null;
						id_hypothesis_node = '' + hypothesis_id + '';
					} else {
						main_hypothesis = $(".radio_filter_from_tree")[z].value;
						id_hypothesis_node = $($(".radio_filter_from_tree")[z]).attr("node_id") + '.' + hypothesis_id;
					}
					break;
				}
			}

			hypothesis_id_table.push(hypothesis_id);
			var selectedNodes = $("#tree").fancytree("getTree").getSelectedNodes();
			var object_filtre;
			  if(selectedNodes.length == 1) {
				  object_filtre = selectedNodes[0].title;
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
			    object_filtre = folderList.join(",");
			  }

			hypothesis_table.push({
				'id_hypothesis': '' + hypothesis_id + '',
				'object_filtre': object_filtre,
				'filter_object': selectedItemArray,
				'filter_buffer_limit_1': parseFloat($( "#amount_buffer_PP_1_fromtree" ).val()),
				'filter_buffer_limit_2': parseFloat($( "#amount_buffer_PP_2_fromtree" ).val()),
				'main_filter_table': [],
				'sub_hypothesis_table': [],
				'main_hypothesis': main_hypothesis,
				'id_hypothesis_node': id_hypothesis_node,
				'map_filter':false
			});

			hypothesis_node_table.push(id_hypothesis_node)

			create_story_tree();

			$('.story_tree_hypothesis_element').off( "click");
			$('.story_tree_hypothesis_element').off("contextmenu");

			//set the hypothesis menu event
			$('.story_tree_hypothesis_element').contextmenu(function(e) {
				window.event.returnValue = false;
				$('#story_tree_hypothesis_menu').css("display","block");
				$('#story_tree_hypothesis_menu').css("top",e.pageY + 'px');
				$('#story_tree_hypothesis_menu').css("left",e.pageX + 'px');
				object_on_right_clic = {type:'story_tree_hypothesis',id:e.target.id};
			});

			$('.story_tree_hypothesis_element').click(function(e){
				push_hypothesis_highlighted(e)
			});



			$('#filter_WindowPP_fromtree').fadeOut();

			filter_in_construction = null;

			Hide_Filter_Layer(hypothesis_id);
			deselectAllNodes("#tree");

			$("#tree").fancytree("getTree").visit(function(node){
		        node.setExpanded(false);
		      });





			}



}



function add_filter_from_main_tree_to_tree(){

	var hypothesis_list = d3.selectAll(".story_tree_hypothesis_element")[0];

	var html_to_input = "" +
	"<form action=''>";

	for(var d=0; d < hypothesis_list.length; d++){

		html_to_input = html_to_input + "<input class='radio_filter_from_tree' type='radio' name='filter_map' node_id='" +
		        "" + d3.select(hypothesis_list[d]).attr('id_node') + ""+
				"' value='" +
				"" + hypothesis_list[d].id + "" +
				"'>" +
				"" + d3.select(hypothesis_list[d]).attr('id_node') +
				"<br>";
	}

	html_to_input = html_to_input + "<input class='radio_filter_from_tree' type='radio' name='filter_map' node_id='null' value='" +
	"new_hypothesis" +
	"' checked>" +
	"Nouvelle hypothese" +
	"<br>";

	html_to_input = html_to_input + "</form>";

	$('#filter_WindowPP_fromtree_content').html(html_to_input);

	$('.radio_filter_from_tree').on('click', function(e){
		if(this.value != 'new_hypothesis'){
			for(var z=0; z < d3.selectAll(".story_tree_hypothesis_element")[0].length; z++){

				if(d3.selectAll(".story_tree_hypothesis_element")[0][z].id == this.value){
					d3.select(d3.selectAll(".story_tree_hypothesis_element")[0][z]).style("stroke-width", "7");
					d3.select(d3.selectAll(".story_tree_hypothesis_element")[0][z]).style("stroke", "#3b5998");
				} else {
					d3.select(d3.selectAll(".story_tree_hypothesis_element")[0][z]).style("stroke-width", "0");
					d3.select(d3.selectAll(".story_tree_hypothesis_element")[0][z]).style("stroke", "blue");
				}

			}
		} else {
			for(var z=0; z < d3.selectAll(".story_tree_hypothesis_element")[0].length; z++){
				d3.select(d3.selectAll(".story_tree_hypothesis_element")[0][z]).style("stroke-width", "0");
				d3.select(d3.selectAll(".story_tree_hypothesis_element")[0][z]).style("stroke", "blue");

			}
		}
	});

}



//------------------
//Ajout du filtre à l'hypothèse. Identifie les paramétres sélectionnés et les ajoute aux hypothèses
//------------------
function add_filter_to_hypothesis(){
	var selectedItemRefs = new Set();
	  var selectedNodes = $("#tree_PP").fancytree("getTree").getSelectedNodes();
	  $.each(selectedNodes, function (event, node) {
	    if(node.isSelected() && !node.isFolder() && node.extraClasses != "hide") {
	      selectedItemRefs.add(node.data.itemRef);
	    }
	  });
	var selectedItemArray = Array.from(selectedItemRefs);

	var buffer_limit_1 = parseFloat($( "#amount_buffer_PP_1" ).val());
	var buffer_limit_2 = parseFloat($( "#amount_buffer_PP_2" ).val());

	var object_filtre;
		  if(selectedNodes.length == 1) {
			  object_filtre = selectedNodes[0].title;
		  }
		  if(selectedNodes.length > 1) {
		    folderList = [];
		    $("#tree_PP").fancytree("getTree").getRootNode().visit(function(node) {
		      if(node.extraClasses != "hide" && node.getChildren() != null && !node.getFirstChild().isFolder()) {
		        if(node.isSelected()) {
		          folderList.push("Tou. " + node.title);
		        } else if(node.getSelectedNodes().length > 0) {
		          folderList.push(node.getSelectedNodes().length + " " + node.title)
		        }
		      }
		    });
		    object_filtre = folderList.join(",");
		  }

	return {'object': selectedItemArray, 'object_filtre': object_filtre, 'buffer_limit_1': buffer_limit_1, 'buffer_limit_2':buffer_limit_2}

}


function show_only_clicked_area(){

	empty_hypothesis_highlighted();

	var node_table = $('#' + object_on_right_clic.id).attr('id_node').split('.');
	for(var a=0; a < hypothesis_table.length; a++){
		if(node_table.indexOf(hypothesis_table[a].id_hypothesis) > -1){
			hypothesis_higlighted.push(hypothesis_table[a])
		}
	}


	svg_story_tree_container.selectAll('.story_tree_hypothesis_element').each(function() {
		if(node_table.indexOf(this.id) > -1){
			d3.select(this).style("stroke-width", "2");
			d3.select(this).style("stroke", "blue");
		}
	});

	var link_node_table = [];
	for(var a=0; a < node_table.length; a++){
		link_node_table.push("link_" + node_table[a]);
	}

	svg_story_tree_container.selectAll('.link_story_tree_hypothesis').each(function() {
		if(link_node_table.indexOf(this.id) > -1){
			d3.select(this).style("stroke-width", "4");
			d3.select(this).style("stroke", "blue");
		}
	});

	Create_Heat_Map(hypothesis_higlighted,'only');
}











