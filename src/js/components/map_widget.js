import '../../css/map_terrain.css';
import { Map, View } from 'ol';
import { defaults as defaultControls, ScaleLine } from 'ol/control';
import { GeoJSON } from 'ol/format';
import { fromCircle } from 'ol/geom/Polygon';
import { Tile as Tile_layer, Vector as Vector_layer } from 'ol/layer';
import { toLonLat, transform } from 'ol/proj';
import { Vector, XYZ } from 'ol/source';
import Draw, { createBox } from 'ol/interaction/Draw';
import { Widget } from '@lumino/widgets';
import basemapReferences from '../basemaps';
import commands from '../commands';
import DB from '../DB';
import {
  click_delete_current_zone,
  click_use_current_bbox,
  click_use_drawing_toolbox,
  click_reduce_current_zone,
} from '../init_search_area';
import { makePtFeature } from '../helpers/main';
import { ref_neo4j_categories } from '../model';
import { getHoverStyle, isa_default_style } from '../layer_styles/default_ol_styles';
import ContextMenu from './context_menu';
import ItownsWidget from './itowns_widget';

const map_move_end = function map_move_end(ev) { // eslint-disable-line no-unused-vars
  const map_view = this.getMapView();
  // If the zoom level is very close to an integer value, we round it to this integer value...
  let userZoom = map_view.getZoom();
  const nearestInteger = Math.round(userZoom);
  if (Math.abs(nearestInteger - userZoom) < 0.08) {
    map_view.setZoom(nearestInteger);
    userZoom = nearestInteger;
  }
  // Store the current state of the view...
  State.map = {
    center: map_view.getCenter(),
    zoom: userZoom,
  };
};

const drawFromTypeFeature = {
  circle: {
    type: 'Circle',
    freehand: false,
  },
  rectangle: {
    type: 'Circle',
    freehand: false,
    geometryFunction: createBox(),
  },
  polygon: {
    type: 'Polygon',
    freehand: false,
  },
  'polygon-freehand': {
    type: 'Polygon',
    freehand: true,
  },
};

const map_context_menu = new ContextMenu();

const displayMapContextMenu = function displayMapContextMenu(event) {
  const map_widget = this;
  const _e = event.originalEvent ? event.originalEvent : event;
  _e.preventDefault();
  _e.stopPropagation();

  // We are not displaying the same elements in the context menu
  // depending on if there already is an Initial Search Area defined or not ...
  if (State.initial_search_area !== null) {
    let isa_mask;
    let ft;
    const zlp_raster = map_widget.rasters[
      Object.keys(map_widget.rasters).find((n) => n.indexOf('zlp_') === 0)];
    const lyrs = ref_neo4j_categories
      .filter((n) => n !== 'commune') // we dont want to hit "commune" features when right clicking on the map..
      .map((n) => map_widget.layers[`ref_${n}`]);
    // Various action are depending on the features behind the click,
    // we want to know:
    //   - if there is the Initial Search Area layer (if so we aren't
    //     interested in the features from the two next categories)
    //   - if there is features from the "references" layers (the items
    //     displayed on the tree) to allow to create a clue
    //   - if there is a clue layer or the ZLP layer to allow to display them
    //     in the 3d view.
    // Once we got informations about these 3 things we can exit early the
    // 'forEachFeatureAtPixel' iterations by returning true;
    map_widget._map.forEachFeatureAtPixel(
      event.pixel,
      (feature, layer) => { // eslint-disable-line consistent-return
        if (isa_mask && ft) {
          return true;
        }
        if (layer === map_widget.layers['isa_layer']) {
          isa_mask = true;
          return true;
        }
        if (ft === undefined && lyrs.indexOf(layer) > -1) {
          ft = feature;
          return true; // Not sure
        }
      },
      { hitTolerance: 7.5 },
    );
    // const isa_mask = map_widget._map.getFeaturesAtPixel(event.pixel, {
    //   layerFilter: lyr => (lyr === map_widget.layers['isa_layer']),
    //   hitTolerance: 5,
    // });
    if (!isa_mask) {
      const coords_clicked = toLonLat(
        map_widget._map.getCoordinateFromPixel(event.pixel),
      ).map((n) => Math.round(n * 10000) / 10000)
        .join(', ');
      // const lyrs = ref_categories
      //   .map(n => map_widget.layers[`ref_${n}`]);
      // const features = map_widget._map.getFeaturesAtPixel(event.pixel, {
      //   layerFilter: lyr => (lyrs.indexOf(lyr) > -1),
      //   hitTolerance: 10,
      // });
      // const ft = features ? features[0] : null;

      // If the user asked for a contextmenu on a feature
      // (most likely to use it to create a clue or to obtain more informations
      // on this specific feature) we want to highlight this feature
      // while the context menu is open.
      // This is done using the 'onshow' and the 'onclose' callbacks
      // of out context menu component.
      const onshow_addhoverfeatures = ft ? () => {
        map_widget.removeHoverFeatures();
        map_widget.addHoverFeatures([ft]);
      } : null;
      const onclose_cleanhoverfeatures = ft ? () => {
        map_widget.removeHoverFeatures();
      } : null;
      const categ = ft ? ft.getProperties()['CHOUCAS_CLASS'] : null;
      const options_menu = ft ? [
        {
          name: 'Créer un indice à partir de l\'objet',
          action: () => {
            commands.execute('ctx:new_clue', {
              infos: {
                location_relation: {
                  target: {
                    type: 'ESR',
                    category: categ,
                    feature: DB[`ref_${categ}`].find((f) => f.id === ft.id_),
                  },
                },
              },
            });
          },
        },
        {
          name: 'Créer un indice à partir des objets de cette catégorie',
          action: () => {
            commands.execute('ctx:new_clue', {
              infos: {
                location_relation: {
                  target: {
                    type: 'ESC',
                    category: categ,
                    features: DB[`ref_${categ}`],
                  },
                },
              },
            });
          },
        },
        {
          name: 'Informations détaillées sur l\'objet',
          action: () => {
            commands.execute(
              'ctx:info-feature',
              DB[`ref_${categ}`].find((f) => f.id === ft.id_),
            );
          },
        },
        { type: 'separator' },
        {
          name: `Créer un indice à partir du point (${coords_clicked})`,
          action: () => {
            commands.execute('ctx:new_clue', {
              infos: {
                location_relation: {
                  target: {
                    type: 'ESR',
                    feature: makePtFeature(coords_clicked),
                  },
                },
              },
            });
          },
        },
      ] : [{
        name: `Créer un indice à partir du point (${coords_clicked})`,
        action: () => {
          commands.execute('ctx:new_clue', {
            infos: {
              location_relation: {
                target: {
                  type: 'ESR',
                  feature: makePtFeature(coords_clicked),
                },
              },
            },
          });
        },
      }];
      if (zlp_raster !== undefined) {
        options_menu.push({ type: 'separator' });
        options_menu.push({
          // Todo : allow to display compatible / incompatible areas in 3d view too
          name: 'Afficher la zone de localisation probable dans la vue 3d',
          action: () => {
            const parent_widget = mainPanel.getWidget('map-terrain-container');
            // Do we want to split the screen horizontally or vertically ?
            const size_parent = parent_widget.node.getBoundingClientRect();
            const __w = size_parent.right - size_parent.left;
            const __h = size_parent.bottom - size_parent.top;
            const split_mode = __w >= __h
              ? 'split-right'
              : 'split-bottom';
            parent_widget.addWidget(
              new ItownsWidget({ id: 'itowns-terrain' }),
              { mode: split_mode, ref: map_widget },
            );
          },
        });
      }
      map_context_menu.showMenu(
        _e,
        document.body,
        options_menu,
        onshow_addhoverfeatures,
        onclose_cleanhoverfeatures,
      );
    } else {
      map_context_menu.showMenu(_e, document.body, [
        {
          name: 'Zone Initiale de Recherche : Oublier la zone actuelle',
          action: click_delete_current_zone,
        },
        {
          name: 'Zone Initiale de Recherche : Réduire la zone actuelle...',
          action: click_reduce_current_zone,
        },
      ]);
    }
  } else {
    map_context_menu.showMenu(_e, document.body, [
      {
        name: 'Zone Initiale de Recherche : Définir à partir de la vue actuelle',
        action: click_use_current_bbox,
      },
      {
        name: 'Zone Initiale de Recherche : Utiliser les outils de dessin...',
        action: click_use_drawing_toolbox,
      },
    ]);
  }
};

class MapWidget extends Widget {
  constructor(options) { // eslint-disable-line no-unused-vars
    super();
    this.id = options.id;
    this.addClass('container-map');
    this.timeoutHandle = null;
    this.title.label = 'Vue 2d';
    this.title.closable = false;
  }

  onAfterAttach(msg) { // eslint-disable-line no-unused-vars
    this._create_ol_map();
    this.update();
  }

  onResize(msg) { // eslint-disable-line no-unused-vars
    // console.log('MapWidget onResize, msg: ', msg);
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
    }
    this.timeoutHandle = setTimeout(() => {
      // Update the map size
      this._map.updateSize();
      // Update the position of the tooltip displaying information about the PLA value
      const map_bbox = this._map.getTargetElement().getBoundingClientRect();
      const elem = this.node.querySelector('#cursor-zlp-info-box');
      elem.style.bottom = `${window.innerHeight - map_bbox.bottom}px`;
      elem.style.right = `${window.innerWidth - map_bbox.right}px`;
      // Reset timeoutHandle to null.
      this.timeoutHandle = null;
    }, 150);
  }

  getMapView() {
    return this._map.getView();
  }

  changeBaseMap(name) {
    this.layers['background'].getSource().setUrl(basemapReferences[name]);
    this.layers['background'].changed();
  }

  pointermove_evt(event) {
    const olMap = this;
    const map_widget = this.getParentWidget();
    const features = olMap.getFeaturesAtPixel(event.pixel, {
      layerFilter: (lyr) => (map_widget._pointermove_layers_to_be_listened.indexOf(lyr) > -1),
      hitTolerance: 1,
    });
    if (features.length) {
      clearTimeout(map_widget._hover_timeout);
      map_widget.removeHoverFeatures();
      map_widget.addHoverFeatures([features[0]]);
      map_widget._hover_timeout = setTimeout(() => {
        map_widget.removeHoverFeatures();
      }, 500);
    }

    // Only if there is a ZLP and the user asked for displaying the value...
    if (State.ZLPRuitor && State.ZLPRuitor.valueUnderCursor) {
      // Compute webmercator coordinate from pixel coordinate
      const t = olMap.getCoordinateFromPixel(event.pixel);
      // Transform coordinate from webmercator to lambert-93
      const [x, y] = transform(t, 'EPSG:3857', 'EPSG:2154');
      // Compute the coordinates from the search window,
      // in image coordinates (original geotiff is in lambert-93)
      const image = State.ZLPRuitor.image;
      const bbox = image.getBoundingBox();
      const pixelWidth = image.getWidth();
      const pixelHeight = image.getHeight();
      const bboxWidth = bbox[2] - bbox[0];
      const bboxHeight = bbox[3] - bbox[1];
      const widthPct = (x - bbox[0]) / bboxWidth;
      const heightPct = (y - bbox[1]) / bboxHeight;
      const xPx = Math.floor(pixelWidth * widthPct);
      const yPx = Math.floor(pixelHeight * (1 - heightPct));
      const window = [xPx, yPx, xPx + 1, yPx + 1];

      image.readRasters({ window }).then((data) => {
        map_widget.displayZlpValue(data);
      });
    }
  }

  displayZlpValue(value) {
    // Get a reference to the element that host the content to be displayed
    const elem = this.node.querySelector('#cursor-zlp-info-box');
    // Display the rounded value
    elem.innerHTML = `Valeur sous le curseur: ${Math.round(value * 100) / 100}`;
  }

  _activate_pointermove_information() {
    const ref = [
      'ref_COL',
      'ref_PEAK',
      'ref_TOWN',
      'ref_CITY',
      'ref_VILLAGE',
    ];
    this._pointermove_layers_to_be_listened = Object.keys(this.layers)
      .filter((d) => ref.indexOf(d) > -1)
      .map((d) => this.layers[d]);
    this._map.on('pointermove', this.pointermove_evt);
  }

  _deactivate_pointermove_information() {
    this._pointermove_layers_to_be_listened = null;
    this.removeHoverFeatures();
    this._map.un('pointermove', this.pointermove_evt);
  }

  _create_ol_map() {
    // Basically the idea is to keep a reference of each current ol `Layer`s
    // in this object.
    // Two names are already in use (and won't be deleted) :
    // - background
    // - isa_layer
    // Otherwise layer name are prefixed according to the type of the layer:
    // - 'activity_xx' for activity layers
    // - 'clusters_activity_xx' for cluster of features from activity layers
    // - 'category_xx' for selectable OSM object of each category
    // - 'additional_xx' for additional layers added manually by the user
    // - 'clue_xx' for clue layers
    // - 'zlp_xx' for the ZLP layer
    this.layers = {};
    this.map_div = document.createElement('div');
    this.map_div.classList.add('map');
    this.map_div.classList.add('active');
    this.node.appendChild(this.map_div);

    // We are gonna store here the `ol.Image`
    // corresponding to the raster for ZLC (after Ruitor Spatialisation)
    // and the raster for ZLP (after Ruitor Fusion)
    this.rasters = {};

    this.layers['background'] = new Tile_layer({
      source: new XYZ({
        crossOrigin: 'Anonymous',
        url: basemapReferences[State.currentBaseMap],
      }),
    });

    this.layers['isa_layer'] = new Vector_layer({
      source: new Vector(),
      style: isa_default_style,
      zIndex: 1002,
    });

    // Layer for when user hovers over an item
    // (we don't register it in the layers object as we don't add it
    // to the map for now)
    this._hover_layer = new Vector_layer({
      source: new Vector(),
      style: getHoverStyle,
      zIndex: 1001,
    });

    // Layers for the draw interation, it's only added to the map during
    // the draw interaction
    this._draw_layer = new Vector_layer({
      source: new Vector({ wrapX: false }),
      zIndex: 1002,
    });

    this._map = new Map({
      controls: defaultControls({
        zoom: true,
        attributionOptions: {
          collapsible: false,
        },
      }).extend([
        new ScaleLine({ units: 'metric' }),
      ]),
      layers: [
        this.layers['background'],
        this.layers['isa_layer'],
        this._hover_layer,
      ],
      target: this.map_div,
      view: new View({
        center: State.map.center,
        zoom: State.map.zoom,
      }),
    });
    this._map.getParentWidget = () => this;
    this._map.on('moveend', map_move_end.bind(this));
    this._map.on('contextmenu', displayMapContextMenu.bind(this));

    const div_display_value_cursor = document.createElement('div');
    div_display_value_cursor.id = 'cursor-zlp-info-box';
    div_display_value_cursor.style.width = '150px';
    div_display_value_cursor.style.zIndex = 99999;
    div_display_value_cursor.style.backgroundColor = 'black';
    div_display_value_cursor.style.color = 'white';
    div_display_value_cursor.style.display = 'hidden';
    div_display_value_cursor.style.position = 'fixed';
    this.node.appendChild(div_display_value_cursor);
  }

  addGeojsonLayer(layer_id, features, style) {
    this.layers[layer_id] = new Vector_layer({
      style,
      source: new Vector({
        features: (new GeoJSON()).readFeatures(
          { type: 'FeatureCollection', features },
          { featureProjection: 'EPSG:3857' },
        ),
      }),
    });
    this._map.addLayer(this.layers[layer_id]);
  }


  addHoverFeatures(fts) {
    this._hover_layer.getSource().addFeatures(fts);
  }

  removeHoverFeatures() {
    this._hover_layer.getSource().clear();
  }

  activeDrawInteraction(type_feature, ondrawend, then_clear_source = false) {
    // Removes existing draw interation if any
    this.removeDrawInteraction();
    // Prepare the new draw interaction:
    this._map.addLayer(this._draw_layer);
    // this.draw = new Draw(
    //   Object.assign(
    //     { source: this._draw_layer.getSource() },
    //     drawFromTypeFeature[type_feature],
    //   ),
    // );
    this.draw = new Draw(
      { source: this._draw_layer.getSource(), ...drawFromTypeFeature[type_feature] },
    );
    // Did the caller give a callback function on the ondrawend argument ?
    // If so we will return the drawn feature in wgs84 and in web mercator
    // TODO : only return one of them
    if (ondrawend && typeof ondrawend === 'function') {
      this.draw.on('drawend', (e) => {
        const writer = new GeoJSON();
        const ft = e.feature.clone();
        if (type_feature === 'circle') {
          ft.setGeometry(fromCircle(ft.getGeometry()));
        }
        const geojsonfeature_webmercator = writer.writeFeature(ft, {
          rightHand: true,
        });
        const geom = ft.getGeometry().transform('EPSG:3857', 'EPSG:4326');
        ft.setGeometry(geom);
        const geojsonfeature = writer.writeFeature(ft, {
          rightHand: true,
        });
        ondrawend([geojsonfeature, geojsonfeature_webmercator]);
        if (then_clear_source) {
          this._draw_layer.getSource().clear();
        }
      });
    }
    this._map.addInteraction(this.draw);
  }

  removeDrawInteraction() {
    if (this.draw) {
      this._map.removeInteraction(this.draw);
      this._map.removeLayer(this._draw_layer);
      this._draw_layer.getSource().clear();
      this.draw = null;
      delete this.draw;
    }
  }
}


export default MapWidget;
