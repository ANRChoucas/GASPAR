import {map_1,
	map_2,
	map_3,
	map_4} from "./choucas.js";
import {right_click_element,
	rank_1_clue_source} from "./add_clue_from_map.js";
import {app,
	rank_1_clue,
	group_of_rank_1_clue,
	rank_2_clue,
	group_rank_1_to_rank_2} from "./clue_element.js";
import {add_element_of_reference,
	add_rank_2_clue_to_map,
	union_feature,
	map_element_worker,
	add_rank_3_clue_to_map,
	create_rank_3_clue_raster,
	get_geometry_type_color} from "./map_element.js";
import {redraw_clue_window} from "./clue_window.js";

const is_num = (n) => typeof n === 'number'
  ? !isNaN(n)
  : !isNaN(n) && !isNaN(parseFloat(n));


//const modal_interviz = new RModal(document.getElementById('modal-interviz'));
//const modal_sunmask = new RModal(document.getElementById('modal-sunmask'));






function initalize_grass_function(){

	$('#cancel-modal-interviz_launcher').on('click',function() {
		$("#popup_div_interviz_launcher").css("display","none");
	});

	$('#close-modal-interviz_launcher').on('click',function() {
		 var h1 = document.getElementById('h1-input-interviz_launcher');
		 var h2 = document.getElementById('h2-input-interviz_launcher');
		 var mdist = document.getElementById('mdist-input-interviz_launcher');
		 var c = document.getElementById('coords-location-interviz_launcher').innerHTML;
		 intervizEndModal(h1,h2,mdist,c)
//		$("#popup_div_interviz_launcher").css("display","none");
	});

	$('#cancel-modal-sunmask_launcher').on('click',function() {
		$("#popup_div_sunmask_launcher").css("display","none");
	});

	$('#close-modal-sunmask_launcher').on('click',function() {
		var year = document.getElementById('year-input-sunmask_launcher');
		  var month = document.getElementById('month-input-sunmask_launcher');
		  var day = document.getElementById('day-input-sunmask_launcher');
		  var hour = document.getElementById('hour-input-sunmask_launcher');
		  var minute = document.getElementById('minute-input-sunmask_launcher');
		  var coords = document.getElementById('coords-location-sunmask_launcher').innerHTML;
		sunmaskEndModal(year,month,day,hour,minute,coords);
//		$("#popup_div_sunmask_launcher").css("display","none");
	});


}



function sunmaskEndModal(year,month,day,hour,minute,coords) {

  if (!is_num(year.value) || !is_num(month.value) || !is_num(day.value)
        || !is_num(hour.value) || !is_num(minute.value)) {
    document.querySelector('#modal-error-sunmask_launcher').style.display = null;
    return;
  }
//  updatePermalink();
//  modal_sunmask.close();
//  let coords = ol.proj.toLonLat(map.getView().getCenter());

  //TODO fetch grass and manipulate feature
  var request_string = "http://localhost:5000/sunmask?coordinates=" + coords + "&year=" + year.value + "&month=" + month.value + "&day=" + day.value + "&hour=" + hour.value + "&minute=" + minute.value +"";

  fetch(`` + request_string + ``, {
	    method: 'GET',mode: 'cors'
	  }).then(res => res.json()).then((res) => {

			map_element_worker.postMessage({'cmd': 'worker_union_areas', 'arg': {
						'list_objet_json': res.features,
						'id_clue': '',
						'id_object_clue': '',
						'r': '',
						'g': '',
						'b': ''
					}});
		map_element_worker.onmessage = function(e) {
			if(e.data != null){
				var response_feature = (new ol.format.GeoJSON()).readFeature(e.data.unite_area);
				response_feature.getGeometry().transform("EPSG:4326", "EPSG:3857");

				var id_rank_clue_2;
				if(app.list_of_rank_2_clue_id.length > 0){
					id_rank_clue_2 = (Math.max(...app.list_of_rank_2_clue_id)) + 1;
				} else {
					id_rank_clue_2 = 1;
				}
		  var rank_2_clue_feature_id = add_rank_2_clue_to_map(response_feature.getGeometry().clone(),'rgba(255, 189, 0,0.05)','rgba(255, 189, 0,1)',id_rank_clue_2);

			var clue = new rank_2_clue(id_rank_clue_2, [rank_2_clue_feature_id], "Sunmask", "Sunmask",true,2,true,false);
			app.list_of_rank_2_clue.push(clue);
			app.list_of_rank_2_clue_id.push(id_rank_clue_2);
			var id_group_rank_1_to_rank_2;
			if(app.list_group_rank_1_to_rank_2_id.length > 0){
				id_group_rank_1_to_rank_2 = (Math.max(...app.list_group_rank_1_to_rank_2_id)) + 1;
			} else {
				id_group_rank_1_to_rank_2 = 1;
			}
//			var rank_1_to_rank_2 = new group_rank_1_to_rank_2(id_group_rank_1_to_rank_2, null, id_rank_clue_2, "Sunmask","none");
//			app.list_group_rank_1_to_rank_2.push(rank_1_to_rank_2);
//			app.list_group_rank_1_to_rank_2_id.push(id_group_rank_1_to_rank_2);
//			filter_on_map_feature = null;
			if(app.list_of_rank_3_clue.length > 0){
				for(var j=0; j< app.list_of_rank_3_clue.length; j++){
					app.list_of_rank_3_clue[j].list_id_clue_rank_2.push({'id_clue_rank_2': id_rank_clue_2, 'selected': false});
//					add_rank_3_clue_to_map(app.list_of_rank_3_clue[j]);
					create_rank_3_clue_raster(app.list_of_rank_3_clue[j]);
				}
			}

			redraw_clue_window();

		  year.value = null;
		  month.value = null;
		  day.value = null;
		  hour.value = null;
		  minute.value = null;
			}
			};
	  });


  $("#popup_div_sunmask_launcher").css("display","none");

}



function intervizEndModal(h1,h2,mdist,c) {

//  let c = document.getElementById('coords-location-interviz_launcher');
//  let _c = c.innerHTML.split(',').map(a => +a);
  if (!is_num(h1.value) || !is_num(h2.value) || !is_num(mdist.value)) {
    document.querySelector('#modal-error-interviz_launcher').style.display = null;
    return;
  }
//TODO fetch grass and manipulate feature
  var request_string = "http://localhost:5000/viewshed?coordinates=" + c + "&height1=" + h1.value + "&height2=" + h2.value +"&max_distance=" + (mdist.value*1000) +"";

  console.log(request_string);
//  fetch(`` + request_string + ``, {
//	    method: 'GET',mode: 'cors'
//	  }).then(function(res) {
//		  console.log(res);
//	  });

  fetch(`` + request_string + ``, {
//	  fetch(`http://localhost:5000/viewshed?coordinates=45.362277645,5.68130493&height1=1.2&height2=1.3`, {
	    method: 'GET',mode: 'cors'
	  }).then(res => res.json()).then((res) => {


	  map_element_worker.postMessage({'cmd': 'worker_union_areas', 'arg': {
			'list_objet_json': res.features,
			'id_clue': '',
			'id_object_clue': '',
			'r': '',
			'g': '',
			'b': ''
		}});
		map_element_worker.onmessage = function(e) {
			if(e.data != null){
				var response_feature = (new ol.format.GeoJSON()).readFeature(e.data.unite_area);
				response_feature.getGeometry().transform("EPSG:4326", "EPSG:3857");

				var feature_point = new ol.Feature({
				      geometry: new ol.geom.Point(ol.proj.transform([parseFloat(c.split(',')[0]), parseFloat(c.split(',')[1])], 'EPSG:4326', 'EPSG:3857')),
				  })

				  var clue_1;
					var clue_1_id;
					var group_1;
					var group_1_id;
					var point_id;

					var interviz_color;

					if(document.getElementById('id-interviz_launcher').innerHTML == undefined || document.getElementById('id-interviz_launcher').innerHTML.split('_').length < 2){
						if(app.list_of_rank_1_clue_id.length == 0){
							clue_1_id = 1;
						} else {
							clue_1_id = (Math.max(...app.list_of_rank_1_clue_id) + 1);
						}

						if(document.getElementById('ref-interviz_launcher').innerHTML != undefined && document.getElementById('ref-interviz_launcher').innerHTML != "" && document.getElementById('ref-interviz_launcher').innerHTML.replace(/\s/g, '').length){

							//à partir d'un objet
							feature_point.setStyle(new ol.style.Style({
							      image: new ol.style.Circle({
							          radius: 6,
//							          fill: new ol.style.Fill({color: document.getElementById('stroke-interviz_launcher').innerHTML}),
							          stroke: new ol.style.Stroke({
							          	color: document.getElementById('stroke-interviz_launcher').innerHTML,
							          	width: 6
							          	})
							        })
							      }));

							interviz_color = document.getElementById('stroke-interviz_launcher').innerHTML;

							  point_id = add_element_of_reference(clue_1_id,feature_point);

							switch (document.getElementById('type-interviz_launcher').innerHTML) {
							  case 'CITY':
								  clue_1 = new rank_1_clue(clue_1_id, "Grande ville", [point_id],document.getElementById('object-interviz_launcher').innerHTML,{'ref':document.getElementById('ref-interviz_launcher')},true);
								  break;
							  case 'TOWN':
								  clue_1 = new rank_1_clue(clue_1_id, "Ville", [point_id],document.getElementById('object-interviz_launcher').innerHTML,{'ref':document.getElementById('ref-interviz_launcher')},true);
								  break;
							  case 'VILLAGE':
								  clue_1 = new rank_1_clue(clue_1_id, "Village", [point_id],document.getElementById('object-interviz_launcher').innerHTML,{'ref':document.getElementById('ref-interviz_launcher')},true);
								  break;
							  case 'PEAK':
								  clue_1 = new rank_1_clue(clue_1_id, "Sommet", [point_id],document.getElementById('object-interviz_launcher').innerHTML,{'ref':document.getElementById('ref-interviz_launcher')},true);
								  break;
							  case 'COL':
								  clue_1 = new rank_1_clue(clue_1_id, "Col", [point_id],document.getElementById('object-interviz_launcher').innerHTML,{'ref':document.getElementById('ref-interviz_launcher')},true);
								  break;
							  case 'LAKE':
								  clue_1 = new rank_1_clue(clue_1_id, "Lac", [point_id],document.getElementById('object-interviz_launcher').innerHTML,{'ref':document.getElementById('ref-interviz_launcher')},true);
								  break;
							  case 'RESERVOIR':
								  clue_1 = new rank_1_clue(clue_1_id, "Réservoir", [point_id],document.getElementById('object-interviz_launcher').innerHTML,{'ref':document.getElementById('ref-interviz_launcher')},true);
								  break;
							  case 'WATEROTHER':
								  clue_1 = new rank_1_clue(clue_1_id, "Autre", [point_id],document.getElementById('object-interviz_launcher').innerHTML,{'ref':document.getElementById('ref-interviz_launcher')},true);
								  break;
							  case 'RIVER':
								  clue_1 = new rank_1_clue(clue_1_id, "Rivière", [point_id],document.getElementById('object-interviz_launcher').innerHTML,{'ref':document.getElementById('ref-interviz_launcher')},true);
								  break;
							  case 'STREAM':
								  clue_1 = new rank_1_clue(clue_1_id, "Ruisseau", [point_id],document.getElementById('object-interviz_launcher').innerHTML,{'ref':document.getElementById('ref-interviz_launcher')},true);
								  break;
							  case 'POWER6':
								  clue_1 = new rank_1_clue(clue_1_id, "LHT 6 brins", [point_id],document.getElementById('object-interviz_launcher').innerHTML,{'ref':document.getElementById('ref-interviz_launcher')},true);
								  break;
							  case 'POWER3':
								  clue_1 = new rank_1_clue(clue_1_id, "LHT 3 brins", [point_id],document.getElementById('object-interviz_launcher').innerHTML,{'ref':document.getElementById('ref-interviz_launcher')},true);
								  break;
							  case 'POWERO':
								  clue_1 = new rank_1_clue(clue_1_id, "Equipement éléctrique", [point_id],document.getElementById('object-interviz_launcher').innerHTML,{'ref':document.getElementById('ref-interviz_launcher')},true);
								  break;
							  case 'MAST':
								  clue_1 = new rank_1_clue(clue_1_id, "Tour téléphonie", [point_id],document.getElementById('object-interviz_launcher').innerHTML,{'ref':document.getElementById('ref-interviz_launcher')},true);
								  break;
							  case 'SKILIFT':
								  clue_1 = new rank_1_clue(clue_1_id, "Remontée mécanique", [point_id],document.getElementById('object-interviz_launcher').innerHTML,{'ref':document.getElementById('ref-interviz_launcher')},true);
								  break;
							  case 'PISTEGREEN':
								  clue_1 = new rank_1_clue(clue_1_id, "Piste verte", [point_id],document.getElementById('object-interviz_launcher').innerHTML,{'ref':document.getElementById('ref-interviz_launcher')},true);
								  break;
							  case 'PISTEBLUE':
								  clue_1 = new rank_1_clue(clue_1_id, "Piste bleue", [point_id],document.getElementById('object-interviz_launcher').innerHTML,{'ref':document.getElementById('ref-interviz_launcher')},true);
								  break;
							  case 'PISTERED':
								  clue_1 = new rank_1_clue(clue_1_id, "Piste rouge", [point_id],document.getElementById('object-interviz_launcher').innerHTML,{'ref':document.getElementById('ref-interviz_launcher')},true);
								  break;
							  case 'PISTEBLACK':
								  clue_1 = new rank_1_clue(clue_1_id, "Piste noire", [point_id],document.getElementById('object-interviz_launcher').innerHTML,{'ref':document.getElementById('ref-interviz_launcher')},true);
								  break;
							  case 'PATHWAY':
								  clue_1 = new rank_1_clue(clue_1_id, "Sentier de randonnée", [point_id],document.getElementById('object-interviz_launcher').innerHTML,{'ref':document.getElementById('ref-interviz_launcher')},true);
								  break;
							  case 'ROAD':
								  clue_1 = new rank_1_clue(clue_1_id, "Route", [point_id],document.getElementById('object-interviz_launcher').innerHTML,{'ref':document.getElementById('ref-interviz_launcher')},true);
								  break;
							  default:
								  clue_1 = new rank_1_clue(clue_1_id, "Interviz", [point_id],document.getElementById('object-interviz_launcher').innerHTML,{'ref':document.getElementById('ref-interviz_launcher')},true);
							  break;
							}

						  } else {
							//à partir de coordonnées

							  feature_point.setStyle(new ol.style.Style({
							      image: new ol.style.Circle({
							          radius: 6,
//							          fill: new ol.style.Fill({color: "rgba(" + 0 + "," + 0 + "," + 255 + ",0)"}),
							          stroke: new ol.style.Stroke({
							          	color: "rgba(" + 0 + "," + 0 + "," + 255 + ",1)",
							          	width: 6
							          	})
							        })
							      }));

							  interviz_color = "rgba(" + 0 + "," + 0 + "," + 255 + ",1)"

							  point_id = add_element_of_reference(clue_1_id,feature_point);

							  clue_1 = new rank_1_clue(clue_1_id, "Interviz", [point_id],document.getElementById('coords-location-interviz_launcher').innerHTML,{},true);
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
						  	clue_1_id = document.getElementById('id-interviz_launcher').innerHTML.split('_')[document.getElementById('id-interviz_launcher').innerHTML.split('_').length -1];
							for(var o=0; o<app.list_group_of_rank_1_clue.length;o++){
								if(app.list_group_of_rank_1_clue[o].list_of_clue_id.indexOf(parseInt(clue_1_id)) > -1){
									group_1_id = app.list_group_of_rank_1_clue[o].id_group;
									break;
								}
							}

							var color_type = get_geometry_type_color(1,clue_1_id);
							interviz_color = color_type.color;
						}

					var interviz_r = interviz_color.split(',')[0].substring(5);
					var interviz_g = interviz_color.split(',')[1];
					var interviz_b = interviz_color.split(',')[2];


					var interviz_color_stroke = "rgba(" + interviz_r + "," + interviz_g + "," + interviz_b + ",1)";
					var interviz_color_fill ="rgba(" + interviz_r + "," + interviz_g + "," + interviz_b + ",0.05)";

					var id_rank_clue_2;

					if(app.list_of_rank_2_clue_id.length > 0){
						id_rank_clue_2 = (Math.max(...app.list_of_rank_2_clue_id)) + 1;
					} else {
						id_rank_clue_2 = 1;
					}
					var id_feature_rank_2 = add_rank_2_clue_to_map(response_feature.getGeometry(),interviz_color_fill,interviz_color_stroke,id_rank_clue_2)


					//ajout de l'indice de rang 2
					var clue_2 = new rank_2_clue(id_rank_clue_2, [id_feature_rank_2], "Interviz", "",true,2,true,false);
					app.list_of_rank_2_clue.push(clue_2);
					app.list_of_rank_2_clue_id.push(id_rank_clue_2);

					var id_group_rank_1_to_rank_2;
					if(app.list_group_rank_1_to_rank_2_id.length > 0){
						id_group_rank_1_to_rank_2 = (Math.max(...app.list_group_rank_1_to_rank_2_id)) + 1;
					} else {
						id_group_rank_1_to_rank_2 = 1;
					}

					var rank_1_to_rank_2 = new group_rank_1_to_rank_2(id_group_rank_1_to_rank_2, group_1_id, id_rank_clue_2, "Interviz","");

					app.list_group_rank_1_to_rank_2.push(rank_1_to_rank_2);
					app.list_group_rank_1_to_rank_2_id.push(id_group_rank_1_to_rank_2);

					if(app.list_of_rank_3_clue.length > 0){
						for(var j=0; j< app.list_of_rank_3_clue.length; j++){
							app.list_of_rank_3_clue[j].list_id_clue_rank_2.push({'id_clue_rank_2': id_rank_clue_2, 'selected': false});
//							add_rank_3_clue_to_map(app.list_of_rank_3_clue[j]);
							create_rank_3_clue_raster(app.list_of_rank_3_clue[j]);
						}
					}

					redraw_clue_window();




					  h1.value = null;
					  h2.value = null;
					  mdist.value = null;
					  $("#object-interviz_launcher").html("");
						$("#ref-interviz_launcher").html("");
						$("#coords-location-interviz_launcher").html("");

			}
		};





	  });






  $("#popup_div_interviz_launcher").css("display","none");
}



export{initalize_grass_function,intervizEndModal,sunmaskEndModal}