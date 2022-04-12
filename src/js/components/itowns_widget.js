import * as THREE from 'three';
import * as itowns from 'itowns';
import { transform } from 'ol/proj';
import { Widget } from '@lumino/widgets';
import DB from '../DB';
import {
  defaultZlpStyle,
  defaultISAStyle,
  enrichContourLayerWithStyle,
} from '../layer_styles/default_itowns_styles';
import { debounce } from '../helpers/main';
import ContextMenu from './context_menu';

const A = 40487.57;
const B = 0.00007096758;
const C = 91610.74;
const D = -40465.7;
const math_min = Math.min;
const altitudeFromZoomLevel = (zl) => C * (((A - D) / (zl - D) - 1) ** (1 / B));

const makeItownsLayerSingleStyle = (parsedData, name, style) => new itowns.ColorLayer(
  name, {
    name,
    // transparent: true,
    style: style || defaultZlpStyle,
    source: new itowns.FileSource({
      parsedData,
    }),
  },
);

const makeItownsLayerWithConditionalStyle = (parsedData, name, style) => {
  style(parsedData);
  return new itowns.ColorLayer(
    name, {
      name,
      source: new itowns.FileSource({
        parsedData,
      }),
    },
  );
};

const makeItownsLayer = (parsedData, name, style) => {
  if ((!style) || (typeof style !== 'function')) {
    return makeItownsLayerSingleStyle(parsedData, name, style);
  } else {
    return makeItownsLayerWithConditionalStyle(parsedData, name, style);
  }
};

const globe_context_menu = new ContextMenu();

export default class ItownsWidget extends Widget {
  constructor(options) { // eslint-disable-line no-unused-vars
    super();
    this.id = options.id;
    this.addClass('container-map');
    this.timeoutHandle = null;
    this.title.label = 'Vue 3d';
    this.title.closable = true;
  }

  onAfterShow(msg) { // eslint-disable-line no-unused-vars
    console.log('onAfterShow');
    this._create_terrain();
  }

  onAfterAttach(msg) { // eslint-disable-line no-unused-vars
    if (this.isVisible) {
      console.log('onAfterAttach and visible');
      this._create_terrain();
    }
  }

  get terrainDiv() {
    return this.node.querySelector('#terrain');
  }

  onActivateRequest(msg) { // eslint-disable-line no-unused-vars
    if (this.isAttached && !(this.isHidden)) {
      this.terrainDiv.focus();
    }
  }

  onAfterHide() {
    console.log('onAfterHide');
    this.node.classList.remove('active');
    this.node.querySelectorAll('*')
      .forEach((el) => { el.remove(); });
    delete this.view;
    this.view = null;
    // Reset onResize to no-op :
    this.onResize = () => {};
  }

  _onResize(msg) {
    if (this.isVisible && this.view) {
      this.view.resize(msg.width, msg.height);
      console.log('Resized itowns view');
    }
  }

  // TODO : add an option in the UI to enable/disable this:
  _add_building_layer() {
    let meshes = [];
    const self = this;
    const scaler = function update() {
      let i;
      let mesh;
      if (meshes.length) {
        self.view.notifyChange(self.view.camera.camera3D, true);
      }
      for (i = 0; i < meshes.length; i++) {
        mesh = meshes[i];
        if (mesh) {
          mesh.scale.z = math_min(1.0, mesh.scale.z + 0.1);
          mesh.updateMatrixWorld(true);
        }
      }
      meshes = meshes.filter((m) => m.scale.z < 1);
    };
    this.view.addFrameRequester(itowns.MAIN_LOOP_EVENTS.BEFORE_RENDER, scaler);
    return this.view.addLayer(new itowns.GeometryLayer('WFS Building', new THREE.Group(), {
      update: itowns.FeatureProcessing.update,
      convert: itowns.Feature2Mesh.convert({
        batchId: (property, featureId) => featureId,
        altitude: (p) => p.z_min - p.hauteur,
        extrude: (p) => p.hauteur,
        color: new THREE.Color(0xb3aa93),
      }),
      onMeshCreated: function scaleZ(mesh) {
        mesh.scale.z = 0.01; // eslint-disable-line no-param-reassign
        meshes.push(mesh);
      },
      filter: (p) => !!p.hauteur,
      overrideAltitudeInToZero: true,
      source: new itowns.WFSSource({
        url: 'https://wxs.ign.fr/3ht7xcw6f7nciopo16etuqp2/geoportail/wfs?',
        version: '2.0.0',
        typeName: 'BDTOPO_BDD_WLD_WGS84G:bati_remarquable,BDTOPO_BDD_WLD_WGS84G:bati_indifferencie,BDTOPO_BDD_WLD_WGS84G:bati_industriel',
        projection: 'EPSG:4326',
        ipr: 'IGN',
        format: 'application/json',
        zoom: { min: 13, max: 16 },
      }),
    }));
  }

  addGeojsonLayer(layer, layer_id, style_info, visible, crs_in = 'EPSG:4326') {
    return itowns.GeoJsonParser.parse(JSON.stringify(layer), {
      buildExtent: true,
      crsIn: crs_in,
      crsOut: this.view.tileLayer.extent.crs,
      mergeFeatures: true,
      withNormal: false,
      withAltitude: false,
    }).then((parsedData) => {
      const data_layer = makeItownsLayer(parsedData, layer_id, style_info);
      data_layer.visible = visible;
      return this.view.addLayer(data_layer);
    });
  }

  removeLayer(layer_name) {
    if (!this.view) return;
    const lyr = this.view.getLayers().find((l) => l.name === layer_name);
    if (!lyr) return;
    this.view.removeLayer(lyr.id);
    this.view.notifyChange(this.view.camera);
  }

  addContoursLayer(contours) {// TODO : error handling
    const features = contours && contours.features
      ? contours.features
      : State.ZLPRuitor.contours.features;
    // Then add the contours layer for the Probable Location Area
    const contourLayer = {
      type: 'FeatureCollection',
      features,
    };
    this.addGeojsonLayer(contourLayer, 'contours', enrichContourLayerWithStyle, true);
  }

  removeContoursLayer() {
    this.removeLayer('contours');
  }

  addInitialSearchAreaLayer() { // TODO (in order to offer the same level of abstraction than with contours layer..)

  }

  setVisibleLayer(layer_name, visible) {
    if (!this.view) return;
    const lyr = this.view.getLayers().find((l) => l.name === layer_name);
    if (!lyr) return;
    lyr.visible = visible;
    // this.view.notifyChange(lyr);
  }

  _create_terrain() {
    setTimeout(() => {
      // Compute value for positionning the view
      const [longitude, latitude] = transform(State.map.center, 'EPSG:3857', 'EPSG:4326');
      const altitude = altitudeFromZoomLevel(State.map.zoom);

      const terrainDiv = document.createElement('div');
      terrainDiv.id = 'terrain';
      terrainDiv.className = 'map active';
      this.node.appendChild(terrainDiv);
      const view = new itowns.GlobeView(terrainDiv, {
        coord: new itowns.Coordinates('EPSG:4326', longitude, latitude),
        range: altitude,
        tilt: 45,
      });
      this.view = view;
      console.log(view);
      view.addLayer(new itowns.ColorLayer('ORTHO', {
        source: new itowns.WMTSSource({
          protocol: 'wmts',
          url: 'http://wxs.ign.fr/3ht7xcw6f7nciopo16etuqp2/geoportail/wmts',
          name: 'ORTHOIMAGERY.ORTHOPHOTOS',
          tileMatrixSet: 'PM',
          format: 'image/jpeg',
          projection: 'EPSG:3857',
          zoom: { min: 0, max: 17 },
        }),
      }));

      view.addLayer(new itowns.ElevationLayer('MNT_WORLD', {
        source: new itowns.WMTSSource({
          protocol: 'wmts',
          url: 'http://wxs.ign.fr/3ht7xcw6f7nciopo16etuqp2/geoportail/wmts',
          name: 'ELEVATION.ELEVATIONGRIDCOVERAGE',
          tileMatrixSet: 'WGS84G',
          format: 'image/x-bil;bits=32',
          projection: 'EPSG:4326',
          zoom: { min: 0, max: 11 },
        }),
      }));

      view.addLayer(new itowns.ElevationLayer('MNT_HIGHRES', {
        source: new itowns.WMTSSource({
          protocol: 'wmts',
          url: 'http://wxs.ign.fr/3ht7xcw6f7nciopo16etuqp2/geoportail/wmts',
          name: 'ELEVATION.ELEVATIONGRIDCOVERAGE.HIGHRES',
          tileMatrixSet: 'WGS84G',
          format: 'image/x-bil;bits=32',
          projection: 'EPSG:4326',
          zoom: { min: 11, max: 14 },
        }),
      })).then(async () => {
        // await this._add_building_layer();
        // First, add a layer to show the Initial Search Area ...
        this.addGeojsonLayer({
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: State.initial_search_area.geometry,
            },
          ],
        }, 'isa_layer', defaultISAStyle, true, 'EPSG:3857');

        this.addContoursLayer();
      });
      document.querySelector('div#terrain.map')
        .addEventListener('contextmenu', (e) => {
          e.preventDefault();
          e.stopPropagation();
          // TODO : Other options should be :
          //   - resynchronize view extent with 2d view
          //   - ...
          globe_context_menu.showMenu(e, document.body, [
            { name: 'Quitter la vue 3D', action: () => { this.close(); } },
          ]);
        });
      // Avoid the first resize by binding
      // the onResize event slightly later.. :
      setTimeout(() => {
        this.onResize = debounce(this._onResize, 150);
      }, 1000);
    }, 0);
  }
}
