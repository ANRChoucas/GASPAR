
//classe indice de rang 1
/*indices élémentaires, classés dans les logs
 * id_clue: id de l'indice
 * type_clue: type de l'indice (point de départ, destination, point de passage, élément de la liste d'objets, zone dessinée par l'utilisateur)
 *
 * 		begining_point
 * 		past_point
 * 		to_pass_point
 * 		destination_point
 *
 * 		object_from_list
 * 		drawn_area
 *
 * object_clue: liste d'objets correspondant aux différents indices [point de départ], [sommet 1, sommet 2, sommet 3]
 * sous la forme {id_object:, geom_geojson, style: ol style}
 * summary
 * details
*/
class rank_1_clue {
  constructor(id_clue, type_clue, object_clue, summary, details, visible) {
    this.id_clue = id_clue;
    this.type_clue = type_clue;
    this.object_clue = object_clue;
    this.summary = summary;
    this.details = details;
    this.visible = visible;
  }
}

//classe groupe d'indices de rang 1
/*groupes indices élémentaires
 * id_group: id du groupe
 * type_group: type du groupe (élément simple, indices chainés "ligne éléctrique près d'un pont", éléments de référence pour un buffer, un isochrone, un trajet, une intervisibilité)
 * group_parameters: paramètre du groupe (notamment pour des indices chainés)
 * list_of_clue_id: liste des différents id des indices de rang 1 groupés
*/
class group_of_rank_1_clue {
  constructor(id_group, type_group, group_parameters,list_of_clue_id) {
    this.id_group = id_group;
    this.type_group = type_group;
    this.group_parameters = group_parameters;
    this.list_of_clue_id = list_of_clue_id;
  }
}

//classe indice de rang 2
/* zones créées à partir d'indice élémentaires
 * id_clue: id de l'indice
 * object_clue: liste d'objets correspondant aux différentes zones
 * sous la forme {id_object:, geom_geojson, style: ol style}
 * summary
 * details
 * trust: indice de fiabilité de l'indice: 1, 2, 3
 * is_inside: boolean.  la victime est elle à l'interieur ou à l'exterieur
*/
class rank_2_clue {
  constructor(id_clue, object_clue, summary, details, visible, trust, is_inside, negative_of_zone) {
    this.id_clue = id_clue;
    this.object_clue = object_clue;
    this.summary = summary;
    this.details = details;
    this.visible = visible;
    this.trust = trust;
    this.is_inside = is_inside;
    this.negative_of_zone = negative_of_zone;
  }
}

//classe transformation groupe de rang 1, indice de rang 2
/* ensemble zone et éléments de référence pour la création de la zone
 * id_transform: id de l'ensemble
 * id_group_rank_1: id du groupe d'éléments de rang 1 correspondant
 * id_rank_2: id de l'indice de rang 2 correspondant
 * type_transform: type de zone créées (intervsibilité, trajet, buffer, isochrone, zone créé par l'utilisateur (est un objet de rang 2 et de rang 1)
 * transform_parameters: paramètres de la création de la zone
*/
class group_rank_1_to_rank_2 {
	  constructor(id_transform, id_group_rank_1, id_rank_2, type_transform,transform_parameters) {
	    this.id_transform = id_transform;
	    this.id_group_rank_1 = id_group_rank_1;
	    this.id_rank_2 = id_rank_2;
	    this.type_transform = type_transform;
	    this.transform_parameters = transform_parameters;
	  }
	}

//classe indice de rang 3
/* zones par l'intersection des zones de rang 2
 * id_clue: id de l'indice
 * object_clue: objet correspondant aux différentes zones
 * list_id_clue_rank_2: sous la forme {id_clue_rank_2: id_clue_rank_2, selected: false} / {id_clue_rank_2: id_clue_rank_2, selected: true}
 * rank_3_color: couleur de l'élément de rang 3 sous la forme {r: 255, g: 255, b: 255}
*/
class rank_3_clue {
  constructor(id_clue, id_object_clue, list_id_clue_rank_2, rank_3_color, rank_3_color_light, rank_3_color_dark) {
    this.id_clue = id_clue;
    this.id_object_clue = id_object_clue;
    this.list_id_clue_rank_2 = list_id_clue_rank_2;
    this.rank_3_color = rank_3_color;
    this.rank_3_color_light = rank_3_color_light;
    this.rank_3_color_dark = rank_3_color_dark;
  }
}

//classe feature clue element
/* feature de rang 1, 2, ou 3 sous format geojson
 * id_feature: id de la feature
 * geojson_geom: geometrie de la feature sous format geojson
*/
class feature_clue_element {
  constructor(id_feature, geojson_geom) {
    this.id_feature = id_feature;
    this.geojson_geom = geojson_geom;
  }
}

/*
 * map_collection: array containing the different maps shown in the spatial window
 * the number of maps is not related to the number of multiple_map_id in small_multiple_map_id_array
 * map_collection.length gives only the number of maps visible on the screen
 * the length of the array dictate if the spatial window is in a single map mode, or a map collection mode
 *
 * the "main map" is the map shown in a single map mode, or the map which can have its content change by a clic on a multiple_map_id element
 * by default, the "main map" is the first element of map_collection
 *
 * if map_collection.length = 1, we are in a single map mode
 * if map_collection.length = 2, we are in a 2 maps mode, main map is on the left
 * if map_collection.length = 3, we are in a 3 maps mode, main map is on the top, the 2nd map is on the bottom on the left, the 3rd  map is on the bottom on the right
 * if map_collection.length = 4, we are in a 4 maps mode, main map is on the top on the left, the 2nd map is on the top on the right, the 3rd  map is on the bottom on the left, the 4  map is on the bottom on the right
 *
 * by default, main map is Carte 1
 * all new clue elements (rank 1, 2, 3) are put on the main map
 */

const app = {
		"list_of_rank_1_clue" : [],
		"list_of_rank_2_clue" : [],
		"list_of_rank_3_clue" : [],
		"list_group_of_rank_1_clue" : [],
		"list_group_rank_1_to_rank_2" : [],
		"list_of_rank_1_clue_id" : [],
		"list_of_rank_2_clue_id" : [],
		"list_of_rank_3_clue_id" : [],
		"list_group_of_rank_1_clue_id" : [],
		"list_group_rank_1_to_rank_2_id" : [],
		"list_feature_clue_element" : [],
		"map_extent": null,
		"zoom_level": null,
		"small_multiple_map_id_array" : [],
		"map_collection": [],

};

//export{app, rank_1_clue, group_of_rank_1_clue, rank_2_clue, group_rank_1_to_rank_2, rank_3_clue, feature_clue_element};

export {app,
rank_1_clue,
group_of_rank_1_clue,
rank_2_clue,
group_rank_1_to_rank_2,
rank_3_clue,
feature_clue_element};




//export const list_of_rank_1_clue = [];
//export const list_of_rank_2_clue = [];
//export const list_of_rank_3_clue = [];
//export const list_group_of_rank_1_clue = [];
//export const list_group_rank_1_to_rank_2 = [];
//
//export const list_of_rank_1_clue_id = [];
//export const list_of_rank_2_clue_id = [];
//export const list_of_rank_3_clue_id = [];
//export const list_group_of_rank_1_clue_id = [];
//export const list_group_rank_1_to_rank_2_id = [];