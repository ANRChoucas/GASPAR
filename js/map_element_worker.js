

importScripts("https://npmcdn.com/@turf/turf/turf.min.js");

function worker_show_hide_clue_objects(arg){



	var clue_element_id = arg.clue_element_id;
	var rank = arg.rank;
	var hide_show = arg.hide_show;

	var clue_element;
}


function worker_create_buffer(arg){

	var bufferedZone = turf.buffer(arg.object_geojson, arg.value_2, arg.unit);
	var bufferedZone_final;
	if(arg.value_1 > 0){
		var bufferedZone_extract = turf.buffer(arg.object_geojson, arg.value_1, arg.unit);
		bufferedZone_final = turf.difference(bufferedZone, bufferedZone_extract);
	} else {
		bufferedZone_final = bufferedZone;
	}

	postMessage(bufferedZone_final);
}

function worker_create_buffer_multi(arg){
	var bufferedZone;

	if(arg.list_objet_json.length == 1){
		bufferedZone = turf.buffer(arg.list_objet_json[0], arg.value_2, arg.unit);
	} else {
		var tmp_buffer_1 = null;
		var tmp_buffer_2 = null;
		var tmp_buffer_3 = null;
		for(var r=0; r<arg.list_objet_json.length; r++){
			if(tmp_buffer_1 == null){
				tmp_buffer_1 = turf.buffer(arg.list_objet_json[r], arg.value_2, arg.unit);
			} else {
				tmp_buffer_2 = turf.buffer(arg.list_objet_json[r], arg.value_2, arg.unit);
				tmp_buffer_3 = turf.union(tmp_buffer_1, tmp_buffer_2);
				tmp_buffer_1 = tmp_buffer_3;
			}
		}
		bufferedZone = tmp_buffer_3;
	}
	if(arg.value_1 > 0){
		if(arg.list_objet_json.length == 1){
			bufferedZone_extract = turf.buffer(arg.list_objet_json[0], arg.value_1, arg.unit);
		} else {
			var tmp_buffer_1 = null;
			var tmp_buffer_2 = null;
			var tmp_buffer_3 = null;
			for(var r=0; r<arg.list_objet_json.length; r++){
				if(tmp_buffer_1 == null){
					tmp_buffer_1 = turf.buffer(arg.list_objet_json[r], arg.value_1, arg.unit);
				} else {
					tmp_buffer_2 = turf.buffer(arg.list_objet_json[r], arg.value_1, arg.unit);
					tmp_buffer_3 = turf.union(tmp_buffer_1, tmp_buffer_2);
					tmp_buffer_1 = tmp_buffer_3;
				}
			}
			bufferedZone_extract = tmp_buffer_3;
		}
		bufferedZone_final = turf.difference(bufferedZone, bufferedZone_extract);
	} else {
		bufferedZone_final = bufferedZone;
	}



	postMessage(bufferedZone_final);
}

function worker_union_areas(arg){
	var list_object_json = arg.list_objet_json;
	var id_clue = arg.id_clue;
	var id_object_clue = arg.id_object_clue;
	var r = arg.r;
	var g = arg.g;
	var b = arg.b;

	var unite_area;

	if(list_object_json.length == 1){
		switch(list_object_json[0].geometry.type){
			case "Polygon":
				unite_area = turf.rewind(list_object_json[0]);
				break;
			case "LineString":
				break;
			case "Point":
				break;
			case "GeometryCollection":
				for(var a=0; a<list_object_json[0].geometry.geometries.length; a++){
					if(list_object_json[0].geometry.geometrie[a].type == "Polygon"){
						unite_area = turf.rewind(turf.polygon([list_object_json[0].geometry.geometrie[a].coordinates]));
						break;
					}
				}
				break;
		}


	} else if(list_object_json.length > 1){
		var tmp_unite_feature_1 = null;
		var tmp_unite_feature_2 = null;
		var tmp_unite_feature_3 = null;
		for(var r=0; r<list_object_json.length; r++){
			if(tmp_unite_feature_1 == null){
				switch(list_object_json[r].geometry.type){
				case "Polygon":
					tmp_unite_feature_1 = turf.rewind(list_object_json[r]);
					break;
				case "LineString":
					break;
				case "Point":
					break;
				case "GeometryCollection":
					for(var a=0; a<list_object_json[r].geometry.geometries.length; a++){
						if(list_object_json[r].geometry.geometrie[a].type == "Polygon"){
							tmp_unite_feature_1 = turf.rewind(turf.polygon([list_object_json[r].geometry.geometrie[a].coordinates]));
							break;
						}
					}
					break;
				}

			} else {
				switch(list_object_json[r].geometry.type){
				case "Polygon":
					tmp_unite_feature_2 = turf.rewind(list_object_json[r]);
					break;
				case "LineString":
					break;
				case "Point":
					break;
				case "GeometryCollection":
					for(var a=0; a<list_object_json[r].geometry.geometries.length; a++){
						if(list_object_json[r].geometry.geometrie[a].type == "Polygon"){
							tmp_unite_feature_2 = turf.rewind(turf.polygon([list_object_json[r].geometry.geometrie[a].coordinates]));
							break;
						}
					}
					break;
				}
				tmp_unite_feature_3 = turf.union(tmp_unite_feature_1, tmp_unite_feature_2);
				tmp_unite_feature_1 = tmp_unite_feature_3;
			}
		}
		unite_area = tmp_unite_feature_3;
	} else {
		unite_area = null;
	}
	answer = {
			'unite_area':unite_area,
			'id_clue':id_clue,
			'id_object_clue': id_object_clue,
			'r': r,
			'g': g,
			'b': b
	}

	postMessage(answer);
}

//function worker_intersect_all(arg){
//	var list_object_json = turf.rewind(arg.list_objet_json);
////	var id_clue = arg.id_clue;
////	var id_object_clue = arg.id_object_clue;
////	var r = arg.r;
////	var g = arg.g;
////	var b = arg.b;
//
//	for (var m = 0; m < list_object_json.length; ++m) {
//        if(intersections.length == 0){
//          newIntersections.push(json_object_list[m]);
//        }
//        else {
//          for (var n = 0; n < intersections.length; ++n) {
//            var intersection = turf.intersect(list_object_json[m], intersections[n]);
//            if (intersection != null) {
//              var flatten = turf.flatten(intersection);
//              var features = flatten.features;
//              for (var x = 0; x < features.length; ++x) {
//                newIntersections.push(features[x]);
//              }
//            }
//          }
//        }
//      }
//	answer = {
//			'unite_area':unite_area,
//			'id_clue':id_clue,
//			'id_object_clue': id_object_clue,
//			'r': r,
//			'g': g,
//			'b': b
//	}
//
//	postMessage(answer);
//}


//function create_ZLC_raster(arg){
//
//	var bufferedZone = turf.buffer(arg.object_geojson, arg.value_2, arg.unit);
//	var bufferedZone_final;
//	if(arg.value_1 > 0){
//		var bufferedZone_extract = turf.buffer(arg.object_geojson, arg.value_1, arg.unit);
//		bufferedZone_final = turf.difference(bufferedZone, bufferedZone_extract);
//	} else {
//		bufferedZone_final = bufferedZone;
//	}
//
//	postMessage(raster);
//}

self.onmessage = function(e) {
	switch(e.data.cmd){
	case 'show_hide_clue_objects':
		worker_show_hide_clue_objects(e.data.arg);
	break;
	case 'create_buffer':
		worker_create_buffer(e.data.arg);
		break;
	case 'create_buffer_multi':
		worker_create_buffer_multi(e.data.arg);
		break;
	case 'worker_union_areas':
		worker_union_areas(e.data.arg);
		break;
//	case 'worker_intersect_all':
//		worker_intersect_all(e.data.arg);
//		break;
//	case 'create_ZLC_raster':
//		create_ZLC_raster(e.data.arg);
//		break;
	default:
}
};




