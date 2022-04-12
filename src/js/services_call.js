import * as GeoTIFF from 'geotiff';
import { transform } from 'ol/proj';
import { Image, Vector as Vector_layer } from 'ol/layer';
import { ImageStatic, Raster, Vector } from 'ol/source';
import { GeoJSON } from 'ol/format';
import reproject from 'reproject';
import proj4 from 'proj4';
import { plot as PlottyPlot, addColorScale } from 'plotty';
import DB from './DB';
import {
  tree_feature_default_style as default_style,
  tree_feature_default_style_pt as default_style_pt,
} from './layer_styles/default_ol_styles';
import loading_overlay from './components/loading_overlay';
import { crss, getRgbArray, VECTOR_CLUE } from './helpers/main';
import { transformISAToGeo } from './init_search_area';

export function callServiceGeocoding({
  place_name,
  osm_key,
  osm_value,
  geo_bias,
}) {
  const url = [
    'http://photon.komoot.io/api/?q=',
    place_name,
    '&lang=fr',
  ];
  if (osm_key && !osm_value) {
    url.push(`&osm_tag=${osm_key}`);
  } else if (osm_key && osm_value) {
    url.push(`&osm_tag=${osm_key}:${osm_value}`);
  } else if (osm_value && !osm_key) {
    url.push(`&osm_tag=:${osm_value}`);
  }
  if (geo_bias) {
    url.push(`&lon=${geo_bias.lon}&lat=${geo_bias.lat}`);
  }
  return fetch(url.join(''))
    .then((res) => res.json());
}

export function callServiceBuffer({
  clue_id,
  geoms,
  instant_duration, // eslint-disable-line no-unused-vars
  distance_to_object,
  uncertainty,
}) {
  loading_overlay.show('Création de la zone tampon...');
  const clipping_poly = transformISAToGeo(State.initial_search_area.geometry);
  const form = new FormData();
  form.append('geoms', JSON.stringify(geoms));
  form.append('distance', distance_to_object);
  form.append('uncertainty', uncertainty);
  return fetch('http://localhost:8008/buffer', {
    method: 'POST',
    body: form,
  }).then((_res) => _res.json())
    .then((_res) => {
      const form2 = new FormData();
      form2.append('geoms', JSON.stringify([_res, clipping_poly.geometry]));
      return fetch('http://localhost:8008/intersection', {
        method: 'POST',
        body: form2,
      }).then((_intersection_res) => _intersection_res.json())
        .then((_intersection_res) => {
          loading_overlay.hide();
          return [
            [{
              type: 'Feature',
              geometry: _intersection_res,
              properties: { clue_id },
            }],
            VECTOR_CLUE,
          ];
        });
    });
}

export const makeRasterFromImageDescription = (imageDescription) => {
  const imgSource = new ImageStatic(imageDescription);
  return new Raster({
    sources: [imgSource],
    operation: function (cells, data) { // eslint-disable-line object-shorthand, func-names
      const pixel = cells[0];
      if (pixel[0] === 0) {
        pixel[3] = 0;
      } else {
        pixel[3] = data.reversed
          ? data.color[3] * ((pixel[0] + pixel[1] + pixel[2]) / 3)
          : data.color[3] * (255 - (pixel[0] + pixel[1] + pixel[2]) / 3);
        pixel[0] = data.color[0];
        pixel[1] = data.color[1];
        pixel[2] = data.color[2];
      }
      return pixel;
    },
  });
};

async function makeContours(file, steps) {
  const form_data = new FormData();
  const clipping_poly = transformISAToGeo(State.initial_search_area.geometry);
  form_data.append('file', file);
  form_data.append('steps', steps);
  form_data.append('boundingBox', JSON.stringify(clipping_poly));
  const resp = await fetch('http://localhost:8008/contours', {
    method: 'POST',
    body: form_data,
  });
  const contours = await resp.json();
  return contours;
}

async function makePointLayer(file) {
  const form_data = new FormData();
  form_data.append('file', file);
  const resp = await fetch('http://localhost:8008/raster-to-points', {
    method: 'POST',
    body: form_data,
  });
  const points = await resp.json();
  return points;
}

/**
 *
 * @param {Blob} file
 * @param {string} contourSteps
 * @param {boolean} makePointLayer
 * @return {Promise<{image: *, imgSource: Static, contours: object|null, points: object|null}>}
 */
export async function processGeotiffToImageStatic(file) {
  const tiff = await GeoTIFF.fromBlob(file);
  const image = await tiff.getImage();
  const bands = await image.readRasters();
  const bbox = image.getBoundingBox();
  addColorScale('mycolorscale', ['#fffef9', '#000000'], [0, 1]);
  const the_canvas = document.createElement('canvas');
  const w = image.getWidth();
  const h = image.getHeight();

  const plot = new PlottyPlot({ // eslint-disable-line new-cap
    canvas: the_canvas,
    data: bands[0],
    width: w,
    height: h,
    domain: [0, 1.05],
    colorScale: 'mycolorscale',
  });
  plot.render();

  const imageDescription = {
    url: the_canvas.toDataURL('image/png'),
    imageExtent: bbox,
    imageSize: [w, h],
    projection: 'EPSG:2154',
  };
  return {
    imageDescription,
    image,
  };
}

/**
 * Call the Ruitor/Spatialisation service.
 * Returns a promise containing an object with the returned geotiff file and its description
 * (that allows to build the necessary image to be displayed by OpenLayers).
 *
 * @param clue_id
 * @param geoms
 * @param relationLocalisation
 * @param confidence
 * @param color
 * @param instant_duration
 * @return {Promise<{imageDescription: *, geotiffBlob: *, contours: any, layer: ImageLayer<ImageSourceType>}>}
 */
export function callServiceSpatialisation({
  clue_id, // eslint-disable-line no-unused-vars
  geoms,
  relationLocalisation,
  confidence,
  color,
  instant_duration, // eslint-disable-line no-unused-vars
}) {
  loading_overlay.show('Spatialisation de l\'indice...');

  // Prepare the 'zir' parameter
  let [xmin, ymin, xmax, ymax] = State.initial_search_area.bbox;

  [xmin, ymin] = transform([xmin, ymin], 'EPSG:3857', 'EPSG:2154');
  [xmax, ymax] = transform([xmax, ymax], 'EPSG:3857', 'EPSG:2154');

  // So that the reprojected raster still covers
  // the whole initial search area ...
  const dx = (xmax - xmin) / 10;
  const dy = (ymax - ymin) / 10;
  xmin -= dx;
  ymax += dy;
  // xmax += dx;
  // ymin -= dy;

  // Prepare the 'site' parameter
  let site;

  const features = geoms.map((geom) => ({
    type: 'Feature',
    geometry: reproject.reproject(geom, proj4.WGS84, 'EPSG:2154', crss),
  }));

  if (relationLocalisation.uri.includes('EntreXetY')) {
    site = [features];
  } else {
    site = {
      type: 'FeatureCollection',
      features,
    };
  }

  // Params for the request
  const params = {
    zir: [xmin, ymin, xmax, ymax],
    relationLocalisation,
    site,
  };

  return fetch(`http://localhost:8000/spatialisation?confiance=${confidence}`, {
    method: 'POST',
    mode: 'cors',
    body: JSON.stringify(params),
  }).then((_res) => _res.blob())
    .then(async (geotiffBlob) => {
      const {
        imageDescription,
      } = await processGeotiffToImageStatic(geotiffBlob);

      const steps = confidence === 1 ? '0.08, 1.0' : '0.58, 1.0';
      const contours = await makeContours(geotiffBlob, steps);
      const raster = makeRasterFromImageDescription(imageDescription);
      raster.on('beforeoperations', (event) => {
        event.data.color = getRgbArray(color); // eslint-disable-line no-param-reassign
        event.data.reversed = false; // eslint-disable-line no-param-reassign
      });

      const layer = new Image({ source: raster });
      layer.setExtent(State.initial_search_area.bbox);

      loading_overlay.hide();

      return {
        imageDescription,
        layer,
        geotiffBlob,
        contours,
      };
    });
}

/**
 * Call the Ruitor/Fusion service.
 * Returns a promise containing to many stuff... TODO: clean this.
 *
 * @param clues
 * @return {Promise<unknown>|Promise<{image: *, color: string, geotiffBlob: *, propsymbol: {displayed: boolean, values: any}, contours: {displayed: boolean, features: *}, layer: ImageLayer<ImageSourceType>, reversed: boolean}>}
 */
export function callServiceFusion(clues) {
  if (clues.length > 1) {
    loading_overlay.show('Fusion des indices...');
    const form = new FormData();
    clues.forEach((c) => {
      form.append('files', c.geotiffBlob);
    });
    return fetch('http://localhost:8000/fusion', {
      method: 'POST',
      mode: 'cors',
      body: form,
    }).then((resp) => resp.blob())
      .then(async (geotiffBlob) => {
        const {
          imageDescription, image,
        } = await processGeotiffToImageStatic(geotiffBlob);

        let contours;
        try {
          contours = await makeContours(geotiffBlob, '0.01, 0.2, 0.4, 0.6, 0.8, 1.0');
        } catch (e) {
          console.log(e);
          contours = { features: [] };
        }
        const points = await makePointLayer(geotiffBlob);

        const color_zlp = 'rgba(250, 12, 12, 1)';
        const reversed_zlp = false;

        const raster = makeRasterFromImageDescription(imageDescription);
        raster.on('beforeoperations', (event) => {
          event.data.color = getRgbArray(color_zlp); // eslint-disable-line no-param-reassign
          event.data.reversed = reversed_zlp; // eslint-disable-line no-param-reassign
        });

        const layer = new Image({ source: raster });
        layer.setExtent(State.initial_search_area.bbox);

        loading_overlay.hide();

        return {
          geotiffBlob,
          image,
          layer,
          color: color_zlp,
          reversed: reversed_zlp,
          contours: {
            displayed: false,
            features: contours.features,
          },
          propsymbol: {
            displayed: false,
            values: points,
          },
        };
      });
  }
  return Promise.resolve(null);
}

/**
 * Call the Spacy on server side to parse a clue in natural language.
 * Returns a promise containing the parsed JSON response.
 *
 * @param clue_nl
 * @return {Promise<string>}
 */
export function callServiceParseClue(clue_nl) {
  const form_data = new FormData();
  form_data.append('clue_nl', clue_nl);
  return fetch('http://localhost:8008/parse-clue', {
    method: 'POST',
    body: form_data,
  }).then((res) => res.json());
}

/**
 * Call the *Named Entity Recognition and Classification* service from Pau's partners,
 * used to parse a clue in natural language.
 * Returns a promise containing the XML response in plain text.
 *
 * @param clue_nl
 * @return {Promise<string>}
 */
export function callServiceNerc(clue_nl) {
  return fetch('http://erig.univ-pau.fr/PERDIDO/api/nerc/txt_xml/', {
    method: 'POST',
    body: JSON.stringify({
      request: {
        api_key: 'choucas',
        lang: 'French',
        content: clue_nl,
      },
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((res) => res.text());
}

export function callServiceFournitureObjet(geom_zir) {
  // Prepare the body of the post request
  const body = new FormData();
  body.append('geometry', JSON.stringify(geom_zir));

  return fetch('http://localhost:8008/neo4j-all-features', { method: 'POST', body })
    .then((res) => res.json())
    .then((collections) => {
      const results = [];
      collections.forEach((collection) => {
        const category = collection['CHOUCAS_CLASS'];
        const type_geom0 = collection.features[0].geometry.type;
        // The idea is to put polygons layer with a lower zIndex than linestring
        // layers. And linestring layers with a lower zIndex than points layers
        // to facilitate the selection of features of type Point
        // on the map. Unfortunately it doesn't work so well ...
        // (maybe the hitTolerance when clicking on the map should be changed..)
        let zIndex = type_geom0.indexOf('Point') > -1
          ? 50
          : type_geom0.indexOf('LineString') > -1
            ? 25 : 10;
        collection.features.forEach((ft) => {
          if (!ft.properties.id) {
            ft.properties.id = ft.id; // eslint-disable-line no-param-reassign
          }
        });
        DB[`ref_${category}`] = collection.features;
        State.map_widget.layers[`ref_${category}`] = new Vector_layer({
          renderBuffer: 200,
          zIndex,
          // zIndex: ref_neo4j_categories.indexOf(category),
          source: new Vector({
            features: (new GeoJSON()).readFeatures(
              collection, { featureProjection: 'EPSG:3857' },
            ),
          }),
          style: (ft) => {
            const geom_type = ft.getGeometry().getType();
            if (['Point', 'MultiPoint'].indexOf(geom_type) > -1) {
              return default_style_pt;
            }
            return default_style;
          },
        });
        State.map_widget._map.addLayer(State.map_widget.layers[`ref_${category}`]);
        results.push([category, collection.features]);
      });

      return results;
    });
}

// export function callServiceSunmask({
//   clue_id,
//   instant_duration,
//   type,
// }) {
//   const msg = type === 'ombre'
//     ? 'Création de la zone d\'ombre projetée à l\'heure saisie...'
//     : 'Création de la zone exposée au soleil à l\'heure saisie...';
//   loading_overlay.show(msg);
//   // Use the bbox of the ISA for the computation region
//   let [xmin, ymin, xmax, ymax] = State.initial_search_area.bbox;
//   [xmin, ymin] = transform([xmin, ymin], 'EPSG:3857', 'EPSG:4326');
//   [xmax, ymax] = transform([xmax, ymax], 'EPSG:3857', 'EPSG:4326');
//   // const clipping_poly = turf_bboxPolygon([xmin, ymin, xmax, ymax]);
//   xmin -= 0.1;
//   ymin -= 0.1;
//   xmax += 0.1;
//   ymax += 0.1;
//
//   // Use the actual ISA to clip the result
//   const ring = State.initial_search_area.geometry.coordinates[0]
//     .map((c) => transform(c, 'EPSG:3857', 'EPSG:4326'));
//   const clipping_poly = {
//     type: 'Feature',
//     geometry: {
//       type: 'Polygon',
//       coordinates: [ring],
//     },
//     properties: {},
//   };
//
//   const reqs = instant_duration.value.map((i) => {
//     const d = new Date(i);
//     return fetch(`/sun
// ?year=${d.getYear() + 1900}
// &month=${d.getMonth() + 1}
// &day=${d.getDate()}
// &hour=${d.getHours()}
// &minute=${d.getMinutes()}
// &region=${xmin},${xmax},${ymin},${ymax}\
// ${type === 'ombre' ? '' : '&sun=true'}`)
//       .then((_r) => _r.json());
//   });
//
//   return Promise.all(reqs)
//     .then((_results) => {
//       const _geoms = [];
//       _results.forEach((r) => {
//         r.features.forEach((ft) => {
//           if (
//             ft.geometry !== undefined
//             && ft.geometry.coordinates !== undefined
//           ) {
//             _geoms.push(ft.geometry);
//           }
//         });
//       });
//
//       const form = new FormData();
//       form.append('distance', 0);
//       form.append('uncertainty', 2.5);
//       form.append('geoms', JSON.stringify(_geoms));
//
//       return fetch('/buffer', {
//         method: 'POST',
//         body: form,
//       }).then((_res) => _res.json())
//         .then((_res) => {
//           const form2 = new FormData();
//           form2.append('geoms', JSON.stringify([_res, clipping_poly.geometry]));
//           return fetch('/intersection', {
//             method: 'POST',
//             body: form2,
//           }).then((_intersection_res) => _intersection_res.json())
//             .then((_intersection_res) => {
//               loading_overlay.hide();
//               return [{
//                 type: 'Feature',
//                 geometry: _intersection_res,
//                 properties: { clue_id },
//               }];
//             });
//         });
//     });
// }
//
// export function callServiceInterviz({
//   clue_id,
//   geoms,
//   instant_duration, // eslint-disable-line no-unused-vars
// }) {
//   loading_overlay.show('Création de la zone de visibilité...');
//   // Use the bbox of the ISA for the computation region
//   let [xmin, ymin, xmax, ymax] = State.initial_search_area.bbox;
//   [xmin, ymin] = transform([xmin, ymin], 'EPSG:3857', 'EPSG:4326');
//   [xmax, ymax] = transform([xmax, ymax], 'EPSG:3857', 'EPSG:4326');
//   // const clipping_poly = turf_bboxPolygon([xmin, ymin, xmax, ymax]);
//   xmin -= 0.1;
//   ymin -= 0.1;
//   xmax += 0.1;
//   ymax += 0.1;
//
//   // Use the actual ISA to clip the result
//   const ring = State.initial_search_area.geometry.coordinates[0]
//     .map((c) => transform(c, 'EPSG:3857', 'EPSG:4326'));
//   const clipping_poly = {
//     type: 'Feature',
//     geometry: {
//       type: 'Polygon',
//       coordinates: [ring],
//     },
//     properties: {},
//   };
//
//   let request;
//   if (geoms.length > 1) {
//     const query_coords = geoms.map((g) => {
//       const c = turf_centroid(g).geometry.coordinates;
//       return `(${c[1]},${c[0]})`;
//     }).join(',');
//     request = `/viewshed?coordinates=${query_coords}&height1=1.0&height2=1.0&region=${xmin},${xmax},${ymin},${ymax}`;
//   } else {
//     const c = turf_centroid(geoms[0]).geometry.coordinates;
//     request = `/viewshed?coordinates=${c[1]},${c[0]}&height1=1.0&height2=1.0&region=${xmin},${xmax},${ymin},${ymax}`;
//   }
//   return fetch(request)
//     .then((r) => r.json())
//     .then((_result) => {
//       const _geoms = [];
//       _result.features.forEach((ft) => {
//         if (
//           ft.geometry !== undefined
//           && ft.geometry.coordinates !== undefined
//         ) {
//           _geoms.push(ft.geometry);
//         }
//       });
//
//       const form = new FormData();
//       form.append('distance', 0);
//       form.append('uncertainty', 2.5);
//       form.append('geoms', JSON.stringify(_geoms));
//
//       return fetch('/buffer', {
//         method: 'POST',
//         body: form,
//       }).then((_res) => _res.json())
//         .then((_res) => {
//           const form2 = new FormData();
//           form2.append('geoms', JSON.stringify([_res, clipping_poly.geometry]));
//           return fetch('/intersection', {
//             method: 'POST',
//             body: form2,
//           }).then((_intersection_res) => _intersection_res.json())
//             .then((_intersection_res) => {
//               loading_overlay.hide();
//               return [{
//                 type: 'Feature',
//                 geometry: _intersection_res,
//                 properties: { clue_id },
//               }];
//             });
//         });
//     });
// }
//
