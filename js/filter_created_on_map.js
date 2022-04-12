////var right_click_element;
//var draw_source;
//var draw_layer;
//var draw_interaction;
//var draw_interaction_2;
//
//var global_coord;
//
//var filter_on_map_feature = null;

function initialize_filtre_on_map(){
	
	
	map.getViewport().addEventListener('contextmenu', function (evt) {
	    evt.preventDefault();
  
	    if(highlighted_heat_map_feature != null){
	    	
	  		$('#map_filter_opening_menu_with_feature').css("display","block");
			$('#map_filter_opening_menu_with_feature').css("top",evt.offsetY + 'px');
			$('#map_filter_opening_menu_with_feature').css("left",evt.offsetX + 'px');
	    } else {
	    
		    $('#map_filter_opening_menu').css("display","block");
			$('#map_filter_opening_menu').css("top",evt.offsetY + 'px');
			$('#map_filter_opening_menu').css("left",evt.offsetX + 'px');
			right_click_element = evt;
			
	    }
	});
	
	$(".map_filter_opening_load_objects").on('click',function() {
		$('#map_filter_opening_menu').css("display","none");
		$('#map_filter_opening_menu_with_feature').css("display","none");
		load_tree(highlighted_heat_map_feature);
//		filterTreeToHighlighted_zone("#tree",highlighted_heat_map_feature)
//		filterTreeToHighlighted_zone("#tree_PP",highlighted_heat_map_feature)
	});
  
  $(".map_filter_opening_menu_cancel").on('click',function() {
		$('#map_filter_opening_menu').css("display","none");
		$('#map_filter_opening_menu_with_feature').css("display","none");
	});
  
  $(".map_filter_opening_menu_create_circle_feature").on('click',function() {
	  $('#map_filter_opening_menu').css("display","none");
	  $('#map_filter_opening_menu_with_feature').css("display","none");
		launch_map_filter_create_circle_feature(right_click_element);
	});
  
  $(".map_filter_opening_menu_create_direction_feature").on('click',function() {
	  $('#map_filter_opening_menu').css("display","none");
	  $('#map_filter_opening_menu_with_feature').css("display","none");
	  launch_map_filter_create_direction_feature(right_click_element);
	});
  
  $(".map_filter_opening_menu_show_object_as_location").on('click',function() {
	  $('#map_filter_opening_menu').css("display","none");
	  $('#map_filter_opening_menu_with_feature').css("display","none");
	  launch_map_filter_show_object_as_location(right_click_element);
	});
  
  draw_source = new ol.source.Vector({});
  draw_layer = new ol.layer.Vector({
		id:  "id_draw_layer",
		title: "draw_layer",
		source: draw_source
	});
  map.addLayer(draw_layer);
  
  $('#close_filter_map_WindowPP').on('click', function(){
	  filter_on_map_feature = null;
	  $('#filter_map_WindowPP').fadeOut();
  });
}

function launch_map_filter_create_circle_feature(element){
	
	map.removeEventListener(draw_interaction);
	
	var phase = 1;
	
	var start_point = map.getCoordinateFromPixel([element.offsetX,element.offsetY]);
	var end_point;
	var draw_radius;
	var circle_feature;
	
	draw_interaction = map.on('pointermove', function(evt) {
		end_point = map.getCoordinateFromPixel(evt.pixel);
		draw_source.clear();
			
		draw_radius = Math.sqrt((start_point[0] - end_point[0])*(start_point[0] - end_point[0]) + (start_point[1] - end_point[1])*(start_point[1] - end_point[1]));
			
		circle_feature = new ol.Feature({
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
			
	});
	
	draw_interaction_2 = map.on('singleclick', function(evt) {
		draw_source.clear();
		map.removeEventListener(draw_interaction);
		phase = 2;
			
		map.removeEventListener(draw_interaction_2);
		map.removeEventListener('singleclick');
		map.removeEventListener('pointermove');
		
		filter_on_map_feature = circle_feature;
		
		add_filter_map_to_tree();
	});
}

function launch_map_filter_create_direction_feature(element){
	
	
	map.removeEventListener(draw_interaction);
	
	var phase = 1;

	var start_point = map.getCoordinateFromPixel([element.offsetX,element.offsetY]);
	var end_point;
	var draw_radius;
	var circle_feature;
	var intermed_point;
	var intermed_point_2;
	
	//angle du premier segment avec l'axe horizontal
	var angle_to_horizontal_1;
	//angle du second segment avec l'axe horizontal
	var angle_to_horizontal_2;
	//angle du troisième segment avec l'axe horizontal
	var angle_to_horizontal_3;
	
	var intermed_polygon;
	
	
	draw_interaction = map.on('pointermove', function(evt) {
		if (phase == 1){
			end_point = map.getCoordinateFromPixel(evt.pixel);
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
			
		} else if (phase == 2){
			intermed_point = map.getCoordinateFromPixel(evt.pixel);
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
			
			
//			var intermed_feature_1 = new ol.Feature({
//	            geometry: new ol.geom.LineString([start_point,[x_1,y_1]]),
//	            name: 'Line'
//	        })
//			
//			var intermed_feature_2 = new ol.Feature({
//	            geometry: new ol.geom.LineString([start_point,[x_2,y_2]]),
//	            name: 'Line'
//	        })
//			
//			draw_source.addFeature(intermed_feature_1);
//			draw_source.addFeature(intermed_feature_2);
			
			
			if((Math.abs(angle_to_horizontal_2 - angle_to_horizontal_1)<(Math.PI/2)) || (Math.abs(angle_to_horizontal_3 - angle_to_horizontal_1)<(Math.PI/2))){
				
				var x_3,y_3,x_4,y_4;
				x_3 = x_1 + parseInt((dist*1.1) * Math.cos(angle_to_horizontal_1));
				y_3 = y_1 + parseInt((dist*1.1) * Math.sin(angle_to_horizontal_1)); 
				x_4 = x_2 + parseInt((dist*1.1) * Math.cos(angle_to_horizontal_1));
				y_4 = y_2 + parseInt((dist*1.1) * Math.sin(angle_to_horizontal_1));
				
//				var intermed_feature_3 = new ol.Feature({
//		            geometry: new ol.geom.LineString([[x_1,y_1],[x_3,y_3]]),
//		            name: 'Line'
//		        })
//				
//				var intermed_feature_4 = new ol.Feature({
//		            geometry: new ol.geom.LineString([[x_2,y_2],[x_4,y_4]]),
//		            name: 'Line'
//		        })
//				
//				var intermed_feature_5 = new ol.Feature({
//		            geometry: new ol.geom.LineString([[x_3,y_3],[x_4,y_4]]),
//		            name: 'Line'
//		        })
//				
//				draw_source.addFeature(intermed_feature_3);
//				draw_source.addFeature(intermed_feature_4);
//				draw_source.addFeature(intermed_feature_5);
				
				var coord = [
					start_point,
					[x_1,y_1],
					[x_3,y_3],
					[x_4,y_4],
					[x_2,y_2]
				];
				
				intermed_polygon = new ol.Feature({
		            geometry: new ol.geom.Polygon([coord]),
		            name: 'Line'
		        })
				
//				global_coord = [
//					start_point,
//					[x_1,y_1],
//					[x_3,y_3],
//					[x_4,y_4],
//					[x_2,y_2]
//				];
				
				global_coord = [
					x_1,y_1,x_3,y_3]	
//				draw_source.addFeature(intermed_polygon);
				
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
//					var intermed_feature_3 = new ol.Feature({
//			            geometry: new ol.geom.LineString([[x_1,y_1],[x_5,y_5]]),
//			            name: 'Line'
//			        })
//					
//					var intermed_feature_4 = new ol.Feature({
//			            geometry: new ol.geom.LineString([[x_2,y_2],[x_6,y_6]]),
//			            name: 'Line'
//			        })
//					
//					var intermed_feature_5 = new ol.Feature({
//			            geometry: new ol.geom.LineString([[x_5,y_5],[x_7,y_7]]),
//			            name: 'Line'
//			        })
//					
//					var intermed_feature_6 = new ol.Feature({
//			            geometry: new ol.geom.LineString([[x_6,y_6],[x_8,y_8]]),
//			            name: 'Line'
//			        })
//					
//					var intermed_feature_7 = new ol.Feature({
//			            geometry: new ol.geom.LineString([[x_7,y_7],[x_8,y_8]]),
//			            name: 'Line'
//			        })
//					
//					draw_source.addFeature(intermed_feature_3);
//					draw_source.addFeature(intermed_feature_4);
//					draw_source.addFeature(intermed_feature_5);
//					draw_source.addFeature(intermed_feature_6);
//					draw_source.addFeature(intermed_feature_7);
					
					var coord = [
						start_point,
						[x_1,y_1],
						[x_5,y_5],
						[x_7,y_7],
						[x_8,y_8],
						[x_6,y_6],
						[x_2,y_2]
					];
					
					intermed_polygon = new ol.Feature({
			            geometry: new ol.geom.Polygon([coord]),
			            name: 'Line'
			        })
					
//					draw_source.addFeature(intermed_polygon);
					
					
				} else {
//					var intermed_feature_3 = new ol.Feature({
//			            geometry: new ol.geom.LineString([[x_1,y_1],[x_6,y_6]]),
//			            name: 'Line'
//			        })
//					
//					var intermed_feature_4 = new ol.Feature({
//			            geometry: new ol.geom.LineString([[x_2,y_2],[x_5,y_5]]),
//			            name: 'Line'
//			        })
//					
//					var intermed_feature_5 = new ol.Feature({
//			            geometry: new ol.geom.LineString([[x_5,y_5],[x_7,y_7]]),
//			            name: 'Line'
//			        })
//					
//					var intermed_feature_6 = new ol.Feature({
//			            geometry: new ol.geom.LineString([[x_6,y_6],[x_8,y_8]]),
//			            name: 'Line'
//			        })
//					
//					var intermed_feature_7 = new ol.Feature({
//			            geometry: new ol.geom.LineString([[x_7,y_7],[x_8,y_8]]),
//			            name: 'Line'
//			        })
//					
//					draw_source.addFeature(intermed_feature_3);
//					draw_source.addFeature(intermed_feature_4);
//					draw_source.addFeature(intermed_feature_5);
//					draw_source.addFeature(intermed_feature_6);
//					draw_source.addFeature(intermed_feature_7);
					
					var coord = [
						start_point,
						[x_1,y_1],
						[x_6,y_6],
						[x_8,y_8],
						[x_7,y_7],
						[x_5,y_5],
						[x_2,y_2]
					];
					
					
					
					intermed_polygon = new ol.Feature({
			            geometry: new ol.geom.Polygon([coord]),
			            name: 'Line'
			        })
					
//					draw_source.addFeature(intermed_polygon);
				}
				
				
			}
				
			draw_source.addFeature(circle_feature);
			draw_source.addFeature(intermed_polygon);
				
		}
	});
	
	draw_interaction_2 = map.on('singleclick', function(evt) {
		if (phase == 1){
			draw_source.clear();
			map.removeEventListener(draw_interaction);
			phase = 2;

			draw_radius = Math.sqrt((start_point[0]-end_point[0])*(start_point[0]-end_point[0])+(start_point[1]-end_point[1])*(start_point[1]-end_point[1]));
			circle_feature = new ol.Feature({
					geometry: new ol.geom.Polygon.fromCircle(new ol.geom.Circle(start_point, parseInt(draw_radius)),30),
		            name: 'Circle'});
//			draw_source.addFeature(circle_feature);
			
		} else if (phase == 2){
			//create arc_circle, intersection of circle_feature and  intermed_polygon
			draw_source.clear();
			map.removeEventListener(draw_interaction);
			phase = 3;
			var GeoJSON_format = new ol.format.GeoJSON();
//			var copyfeature = new ol.Feature({
//				geometry: new ol.geom.Polygon.fromCircle(new ol.geom.Circle(end_point, parseInt(draw_radius)),30),
//	            name: 'Circle'});
			
			var copyfeature = new ol.Feature({
				geometry: new ol.geom.Polygon.fromExtent(global_coord),
	            name: 'Circle'});
			
			//global_coord
//			var geo_json_feature = {
//				'type' :"feature",
//				'geometry' : {'type':"Polygon", 'coordinates':[global_coord]},
//				'properties' : {'name':'exemple'},
//			}
//			console.log(geo_json_feature)
			var circle_feature_GeoJSON = GeoJSON_format.writeFeatureObject(circle_feature);
			var intermed_polygon_GeoJSON = GeoJSON_format.writeFeatureObject(intermed_polygon);
			var copyfeature_GeoJSON = GeoJSON_format.writeFeatureObject(copyfeature);
			
			console.log(circle_feature_GeoJSON);
			console.log(intermed_polygon_GeoJSON);
			console.log(copyfeature_GeoJSON);
			
//			var intersection = turf.intersect(intermed_polygon_GeoJSON,circle_feature_GeoJSON);
			var intersection = turf.intersect(copyfeature_GeoJSON,circle_feature_GeoJSON);

			if (intersection != null) {
				draw_source.clear();
				filter_on_map_feature = GeoJSON_format.readFeature(intersection);
//				draw_source.addFeature(GeoJSON_format.readFeature(intersection));
            }

			map.removeEventListener(draw_interaction);
			map.removeEventListener(draw_interaction_2);
			map.removeEventListener('singleclick');
			map.removeEventListener('pointermove');
			
			add_filter_map_to_tree()
			
		}
		
	})
	
	
	
//	draw_interaction = new Draw({
//        source: draw_source,
//        type: 'LineString'
//      });
//
//	console.log('map_filter_opening_menu_create_circle_feature');
//	
//	map.addInteraction(draw);
//	
//	  console.log('map_filter_opening_menu_create_direction_feature');
}

function launch_map_filter_show_object_as_location(element){

	  console.log('map_filter_opening_menu_show_object_as_location');
}


function add_filter_map_to_tree(){
	
	var hypothesis_list = d3.selectAll(".story_tree_hypothesis_element")[0];
	
	var html_to_input = "" +
	"<form action=''>";
	
	for(var d=0; d < hypothesis_list.length; d++){
		
		html_to_input = html_to_input + "<input class='radio_filter_map' type='radio' name='filter_map' node_id='" +
		        "" + d3.select(hypothesis_list[d]).attr('id_node') + ""+
				"' value='" +
				"" + hypothesis_list[d].id + "" +
				"'>" + 
				"" + d3.select(hypothesis_list[d]).attr('id_node') + 
				"<br>";
	}
	
	html_to_input = html_to_input + "<input class='radio_filter_map' type='radio' name='filter_map' node_id='null' value='" +
	"new_hypothesis" +
	"' checked>" + 
	"Nouvelle hypothese" + 
	"<br>";
	
	html_to_input = html_to_input + "</form>";
		
	$('#filter_map_WindowPP_content').html(html_to_input);
	
	$('.radio_filter_map').on('click', function(e){
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
	
	$('#filter_map_WindowPP').fadeIn();
}

function launch_filter_map(){
	
	for(var z=0; z < $(".radio_filter_map").length; z++){
		
		if($(".radio_filter_map")[z].checked){
			
			var hypothesis_id;
			if(hypothesis_id_table.length == 0){
				var hypothesis_id = 1;
			} else {
				hypothesis_id = Math.max(...hypothesis_id_table) + 1;
			}
			
			hypothesis_id_table.push(hypothesis_id);
			
			if($(".radio_filter_map")[z].value == 'new_hypothesis'){
				hypothesis_table.push({
					'id_hypothesis': '' + hypothesis_id + '',
					'object_filtre': null,
					'filter_object': null,  
					'filter_buffer_limit_1': 0,  
					'filter_buffer_limit_2': 0, 
					'main_filter_table': [],  
					'sub_hypothesis_table': [],
					'main_hypothesis': null,
					'id_hypothesis_node': '' + hypothesis_id + '',
					'map_filter':true
				});
				
				hypothesis_node_table.push('' + hypothesis_id + '')
			} else {
				hypothesis_table.push({
					'id_hypothesis': '' + hypothesis_id + '',
					'filter_object': null,  
					'object_filtre': null,
					'filter_buffer_limit_1': 0,  
					'filter_buffer_limit_2': 0, 
					'main_filter_table': [],  
					'sub_hypothesis_table': [],
					'main_hypothesis': $(".radio_filter_map")[z].value,
					'id_hypothesis_node': $($(".radio_filter_map")[z]).attr("node_id") + '.' + hypothesis_id,
					'map_filter':true
				});
				
				hypothesis_node_table.push($($(".radio_filter_map")[z]).attr("node_id") + '.' + hypothesis_id)
			}
		
			
			
//			var color_fill ='rgba(' + 255 + ',' + 0 + ',' + 0 + ',' + 0.2 + ')';
//			var color_stroke ='rgba(' + 255 + ',' + 0 + ',' + 0 + ',' + 1 + ')';
			
			var color_fill ='rgba(255, 0, 0,0.05)';
			var color_stroke ='rgba(255, 0, 0,1)';
			
			filter_on_map_feature.setStyle(new ol.style.Style({
			    fill: new ol.style.Fill({
			    	   color: color_fill
			    }),
			    stroke: new ol.style.Stroke({
			    	   color : color_stroke,
			    	   width : 4    
			    	})
			  }));
			
			Add_filter_created_on_map(hypothesis_id,filter_on_map_feature);
			Hide_Filter_Layer(hypothesis_id);
//			Show_Filter_Layer(hypothesis_id);
		}		
	}
	
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
		push_hypothesis_highlighted(e);
	});
	

	
	$('#filter_map_WindowPP').fadeOut();
}

