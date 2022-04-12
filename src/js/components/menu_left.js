import '../../css/menu_left.css';
import { SplitPanel, Widget } from '@lumino/widgets';
import { GeoJSON } from 'ol/format';
import { Vector as Vector_layer } from 'ol/layer';
import { Vector } from 'ol/source';
import swal from 'sweetalert';
import { makeSectionTarget } from '../helpers/clue_transformation';
import ContextMenu from './context_menu';
import { getRgbArray } from '../helpers/main';
import {
  click_delete_current_zone,
  click_reduce_current_zone,
  click_use_current_bbox,
  click_use_drawing_toolbox,
} from '../init_search_area';
import { allRelationLocalisation } from '../model';
import { contours_style_func, getStyleClueLayer } from '../layer_styles/default_ol_styles';
import createCard from '../modals/victim_panel';
import eyeOpen from '../../img/eye_open.png';
import eyeClosed from '../../img/eye_closed.png';
import choucasLogoSmall from '../../img/logo-choucas-small.png';
import { propsymbol_default_style } from '../layer_styles/prop_symbols_ol_style';
import { hex2rgb, rgb2hex } from '../helpers/colors';
import { FeatureTree } from './feature_tree';

const geojson = new GeoJSON({ featureProjection: 'EPSG:3857' });


function bindClueRuitorItem(item) {
  // Interaction for when the user toggles the "visibility" (open/closed eye) button
  item.querySelector('.display-section > .switch-visibility-clue > img')
    .addEventListener('click', function onclickvisibilityclue() {
      const map_widget = mainPanel.getWidget('map1');
      // const itowns_widget = mainPanel.getWidget('itowns-terrain');
      const clue_id = item.getAttribute('clue-id');
      const this_clue = State.cluesRuitor.find((el) => el.clue_id === clue_id);

      const layer = map_widget.rasters[clue_id];
      if (this.classList.contains('clue-visible')) {
        this_clue.visible = false;
        this.classList.remove('clue-visible');
        this.src = eyeClosed;
        layer.setVisible(false);
      } else {
        this_clue.visible = true;
        this.classList.add('clue-visible');
        this.src = eyeOpen;
        layer.setVisible(true);
      }
      // if (itowns_widget) {
      //   itowns_widget.setVisibleLayer(clue_id, this_clue.visible);
      // }
    });

  // Interaction for when the user click on the color button
  item.querySelector('.display-section > p.color_square')
    .addEventListener('click', function onclickcolorclue() {
      const map_widget = mainPanel.getWidget('map1');
      // const itowns_widget = mainPanel.getWidget('itowns-terrain');
      const clue_id = item.getAttribute('clue-id');
      const this_clue = State.cluesRuitor.find((el) => el.clue_id === clue_id);
      const layer = map_widget.rasters[clue_id];

      const self = this;
      const this_color = self.style.backgroundColor;
      const input_col = document.createElement('input');
      input_col.setAttribute('type', 'color');
      input_col.setAttribute('value', rgb2hex(this_color));
      input_col.className = 'color_input';
      input_col.onchange = (change) => {
        const color = hex2rgb(change.target.value, 'string');
        // update the color button itself
        self.style.backgroundColor = color;
        // update the color inside raster onbeforeoperation
        const rasterSource = layer.getSource();
        rasterSource.on('beforeoperations', (event) => {
          // eslint-disable-next-line no-param-reassign
          event.data.color = getRgbArray(color);
        });
        rasterSource.refresh();
        // update the style of the contours layer if any
        const contours_layer_name = `${this_clue.clue_id}-contours`;
        if (map_widget.layers[contours_layer_name]) {
          map_widget.layers[contours_layer_name].setStyle(
            getStyleClueLayer('rgba(255,255,255,0)', color, 3),
          );
        }
        // update the clue object
        // TODO: we should change how we store it in the first place !!!
        // this_clue.color = ...
        this_clue.colors.stroke = color;
      };
      input_col.dispatchEvent(new MouseEvent('click'));

      // if (itowns_widget) {
      //   itowns_widget.setVisibleLayer(clue_id, this_clue.visible);
      // }
    });

  // Interaction for when the user toggles the color button
  item.querySelector('.display-section > div > i.fa-draw-polygon')
    .addEventListener('click', function onclickcontourclue() {
      const map_widget = mainPanel.getWidget('map1');
      const clue_id = item.getAttribute('clue-id');
      const this_clue = State.cluesRuitor.find((el) => el.clue_id === clue_id);
      const contours_layer_name = `${this_clue.clue_id}-contours`;
      if (this.classList.contains('visible')) {
        map_widget._map.removeLayer(map_widget.layers[contours_layer_name]);
        this.classList.remove('visible');
      } else {
        map_widget.layers[contours_layer_name] = new Vector_layer({
          style: getStyleClueLayer('rgba(255,255,255,0)', this_clue.colors.stroke, 3),
          source: new Vector({
            features: (new GeoJSON()).readFeatures(
              {
                type: 'FeatureCollection',
                features: this_clue.contours.features,
              },
              { featureProjection: 'EPSG:3857' },
            ),
          }),
        });
        map_widget.layers[contours_layer_name].setExtent(State.initial_search_area.bbox);
        map_widget._map.addLayer(map_widget.layers[contours_layer_name]);
        this.classList.add('visible');
      }
      // const itowns_widget = mainPanel.getWidget('itowns-terrain');
      // if (itowns_widget) {
      //   itowns_widget.setVisibleLayer(clue_id, this_clue.visible);
      // }
    });

  // Highlights the feature(s) used by the clue when the cursor
  // is over the "site" cell.
  item.querySelector('td.clue-site')
    .addEventListener('mouseenter', function cluesitemouseenter() {
      const clue_id = item.getAttribute('clue-id');
      const this_clue = State.cluesRuitor.find((el) => el.clue_id === clue_id);

      if (this_clue.location_relation.target.type === 'ESR' && !Array.isArray(this_clue.location_relation.target.feature)) {
        State.map_widget.addHoverFeatures([
          geojson.readFeature(
            this_clue.location_relation.target.feature,
            { featureProjection: 'EPSG:3857' },
          ),
        ]);
      } else { /* this_clue.location_relation.target.type === 'ESC' */
        State.map_widget.addHoverFeatures(
          geojson.readFeatures(
            {
              type: 'FeatureCollection',
              features: this_clue.location_relation.target.features,
            },
            { featureProjection: 'EPSG:3857' },
          ),
        );
      }
    });

  item.querySelector('.clue-site')
    .addEventListener('mouseleave', function cluesitemouseleave() {
      State.map_widget.removeHoverFeatures();
    });

  // Basic context menu on right-click
  item.addEventListener('contextmenu', (e) => { // eslint-disable-line no-param-reassign
    const context_menu = new ContextMenu();
    const id_clue = item.getAttribute('clue-id');
    context_menu.showMenu(
      e,
      document.body,
      [
        {
          name: 'Supprimer l\'indice',
          action: () => {
            State.cluesRuitor.splice(
              State.cluesRuitor.findIndex((el) => el.clue_id === id_clue),
              1,
            );
            State.cluesRuitor = [].concat(State.cluesRuitor);
          },
        },
      ],
    );
  });
}

function createClueItemMenuLeft(clue_data) {
  const elem = document.createElement('tr');
  elem.className = 'clue-item';
  elem.setAttribute('clue-id', clue_data.clue_id);
  const site = clue_data.instant_or_duration.type !== 'instant-now'
    ? '<i class="fas fa-user-clock"></i>' // TODO: add title to give information about the instant/duration
    : '<i title="Maintenant" class="fas fa-user-tag"></i>';

  const toggle_visibility = `
    <div class="switch-visibility-clue mx-auto" title="Affichage de l'indice sur la carte">
      <img src="${clue_data.visible ? eyeOpen : eyeClosed}" class="clue-visible" />
    </div>`;

  const relationSpatiale = allRelationLocalisation
    .find((d) => d.uri === clue_data.location_relation.service_options.relationLocalisation.uri);

  const optDistance = (
    clue_data.location_relation.service_options.relationLocalisation.modifieurs[0]
    && clue_data.location_relation.service_options.relationLocalisation.modifieurs[0].uri === 'http://www.semanticweb.org/mbunel/ontologies/Ornitho#EqDist')
    ? ` (${clue_data.location_relation.service_options.relationLocalisation.modifieurs[0].value}m)`
    : '';

  const optModifierNot = (
    clue_data.location_relation.service_options.relationLocalisation.modifieurs[0]
    && clue_data.location_relation.service_options.relationLocalisation.modifieurs[0].uri === 'http://www.semanticweb.org/mbunel/ontologies/Ornitho#Not')
    ? '<i>(NOT)</i> '
    : '';

  const target = makeSectionTarget(clue_data.location_relation.target)
    .replace('<p', '<br><span')
    .replace('</p', '</span')
    .replace('<br>', '<wbr>');

  const confidenceText = {
    0: 'Faible',
    0.5: 'Moyenne',
    1: 'Forte',
  };

  elem.innerHTML = `
      <td>${site}</td>
      <td>${optModifierNot}${relationSpatiale.label}${optDistance}</td>
      <td class="clue-site">${target}</td>
      <td>${confidenceText[clue_data.confidence]}</td>
      <td>
          <div class="d-flex">
            <div class="hypothesis-entry"><input type="checkbox" checked/></div>
            <div class="hypothesis-entry"><input type="checkbox" /></div>
            <div class="hypothesis-entry"><input type="checkbox" /></div>
          </div>
      </td>
      <td>
          <div class="d-flex display-section">
              <p title="Couleur actuelle d'affichage" class="color_square mx-auto" style="background-color: ${clue_data.colors.stroke};"></p>
              <div title="Affichage du contour sur la carte" class="mx-auto"><i class="fas fa-draw-polygon"></i></div>
              ${toggle_visibility}
          </div>
      </td>`;

  return elem;
}

export default function createLeftMenu() {
  const clues_box_panel = new Widget();
  clues_box_panel.addClass('top-box');
  clues_box_panel.node.innerHTML = `
  <!-- <div style="text-align:center;font-style:italic;margin:3px;display: flex;">
    <img height="40px" style="opacity: 0.3;" src="${choucasLogoSmall}" alt='logoChoucas'/>
    <h5 style="margin:auto;">${APPLICATION_NAME}</h5>
    <img height="40px" style="opacity: 0.3;" src="${choucasLogoSmall}" alt='logoChoucas'/>
  </div> -->
  <div class="menuflex noselect">
    <!-- <hr> -->
    <div id="victim_infos">
      <div>
        <i class="fas fa-address-card"></i>
        <label>Informations sur la victime</label>
      </div>
    </div>
    <hr>
    <div id="isa_infos">
      <div class="menu-toggle pretty p-toggle p-plain">
        <input aria-label="Définition de la zone initiale..." id="init_zone_chk" type="checkbox" />
        <div class="state p-off">
          <i class="icon fas fa-times-circle"></i>
          <label>Zone initiale non sélectionnée</label>
        </div>
        <div class="state p-on">
          <i class="icon fas fa-check-circle"></i>
          <label>Zone initiale sélectionnée</label>
          <span class="surface-display"></span>
        </div>
      </div>
      <p id="use_current_bbox" class="mod-zone-init isa_unset">Utiliser l'emprise actuelle de la carte</p>
      <p id="use_drawing_toolbox" class="mod-zone-init isa_unset">Utiliser les outils de dessin ...</p>
      <!-- <p id="use_isa_massifdebelledonne" class="hidden mod-zone-init isa_unset">Chaîne de Belledonne</p>
      <p id="use_isa_chartreuse" class="hidden mod-zone-init isa_unset">Massif de la Chartreuse</p>
      <p id="use_isa_ecrins" class="hidden mod-zone-init isa_unset">Massif des Écrins (Zone Isère)</p>
      <p id="use_isa_cerces" class="hidden mod-zone-init isa_unset">Massif des Cerces (Zone Isère)</p>
      <p id="use_isa_depisere" class="hidden mod-zone-init isa_unset">Département de l'isère</p> -->
      <p id="delete_current_zone" class="hidden mod-zone-init isa_set">Oublier la zone actuelle</p>
      <p id="reduce_current_zone" class="hidden mod-zone-init isa_set">Réduire la zone actuelle ...</p>
    </div>
    <hr>
    <div id="clues_header" class="disabled">
      <div>
        <i class="fas fa-user-nurse"></i>
        <label>Gestion des indices</label>
      </div>
    </div>
    <div id="clues_zones">
      <table class="clue-table">
        <tbody>
          <tr>
            <th> </th>
            <th>Relation de localisation</th>
            <th>Site</th>
            <th>Confiance</th>
            <th>
                <div class="hypothesis-title">Hypothèse</div>
                <div class="d-flex">
                    <div class="hypothesis-entry">1</div>
                    <div class="hypothesis-entry">2</div>
                    <div class="hypothesis-entry">3</div> 
                </div>
            </th>
            <th>Affichage</th>
          </tr>
        </tbody>
      </table>
    </div>
    <div id="zlp_zone">
      <ul class="inner_list disabled">
        <li>
        Pas de Zone de Localisation Probable
        </li>
      </ul>
    </div>
  </div>`;

  const tree_obj = new FeatureTree({ id: 'features-tree' });

  const menu_left = new SplitPanel({ spacing: 0, orientation: 'vertical' });
  menu_left.addWidget(clues_box_panel);
  menu_left.addWidget(tree_obj);
  menu_left.setRelativeSizes([5, 5]);
  menu_left.id = 'menuLeft';
  menu_left.updateISA = (isa_properties) => {
    const parent = clues_box_panel.node.querySelector('#isa_infos');
    if (!isa_properties) {
      parent.title = '';
      parent.querySelector('#init_zone_chk').checked = false;
      parent.querySelectorAll('.isa_unset')
        .forEach((el) => { el.classList.remove('hidden'); });
      parent.querySelectorAll('.isa_set')
        .forEach((el) => { el.classList.add('hidden'); });
      parent.querySelector('.surface-display').innerHTML = '';
      clues_box_panel.node.querySelector('#clues_header').classList.add('disabled');
      tree_obj.node.querySelector('#treetreetree').classList.add('disabled');
    } else {
      const {
        xmin, ymin, xmax, ymax, area,
      } = isa_properties;
      parent.title = `(xmin=${xmin}, ymin=${ymin}, xmax=${xmax}, ymax=${ymax})`;
      parent.querySelector('#init_zone_chk').checked = true;
      parent.querySelectorAll('.isa_unset')
        .forEach((el) => { el.classList.add('hidden'); });
      parent.querySelectorAll('.isa_set')
        .forEach((el) => { el.classList.remove('hidden'); });
      parent.querySelector('.surface-display').innerHTML = `(${Math.round(area / 10000) / 100} km²)`;
      clues_box_panel.node.querySelector('#clues_header').classList.remove('disabled');
      tree_obj.node.querySelector('#treetreetree').classList.remove('disabled');
    }
  };

  // Keep track of the existing clues to only render the needed one
  menu_left._renderedCluesRuitor = new Set();
  menu_left.updateCluesRuitor = (clues) => {
    const all = new Set();
    const r = {
      added: [],
      removed: [],
      hidden: new Set(),
    };
    clues.forEach((clue) => {
      const { confidence, clue_id, visible } = clue;
      all.add(clue_id);
      if (!menu_left._renderedCluesRuitor.has(clue_id)) {
        const elem = createClueItemMenuLeft(clue);
        clues_box_panel.node.querySelector('#clues_zones > table.clue-table > tbody').append(elem);
        bindClueRuitorItem(elem);
        menu_left._renderedCluesRuitor.add(clue_id);
        r.added.push(clue_id);
      }
      if (confidence < 1 || visible < 1) r.hidden.add(clue_id);
    });
    menu_left._renderedCluesRuitor.forEach((clue_id) => {
      if (!all.has(clue_id)) {
        clues_box_panel.node.querySelector(`tr[clue-id="${clue_id}"]`).remove();
        r.removed.push(clue_id);
      }
    });
    menu_left._renderedCluesRuitor = all;
    return r;
  };

  menu_left.updateZlpSection = function menuLeftUpdateZlpSection(zlp_value) {
    if (zlp_value) {
      const zlp_zone_elem = document.querySelector('#zlp_zone');
      zlp_zone_elem.innerHTML = `
        <ul class="inner_list">
          <li>
            <div class="zlp-content">Zone de localisation probable</div>
           
            <div class="switch-visibility-zlp d-flex display-section" title="Affichage de la zone sur la carte">
              <p title="Couleur actuelle d'affichage" class="color_square m-auto" style="background-color: rgb(255, 0, 0);"></p>
              <div title="Affichage des point proportionnels sur la carte" class="m-auto"><i class="fas fa-circle zlp-points"></i></div>
              <img src="${eyeOpen}" class="m-auto zlp-raster visible" />
           </div>
          </li>
        </ul>`;
      zlp_zone_elem.querySelector('.display-section > div > i.zlp-points')
        .addEventListener('click', function onclickpointzlpvisibility() {
          const map_widget = mainPanel.getWidget('map1');
          const zlp = State.ZLPRuitor;
          const layer_name = `${zlp.zlp_id}-points`;
          if (this.classList.contains('visible')) {
            map_widget._map.removeLayer(map_widget.layers[layer_name]);
            this.classList.remove('visible');
            zlp.propsymbol.displayed = false;
          } else {
            map_widget.layers[layer_name] = new Vector_layer({
              style: propsymbol_default_style,
              source: new Vector({
                features: (new GeoJSON()).readFeatures(
                  {
                    type: 'FeatureCollection',
                    features: zlp.propsymbol.values.features,
                  },
                  { featureProjection: 'EPSG:3857' },
                ),
              }),
            });
            map_widget.layers[layer_name].setExtent(State.initial_search_area.bbox);
            map_widget._map.addLayer(map_widget.layers[layer_name]);
            this.classList.add('visible');
            zlp.propsymbol.displayed = true;
          }
        });

      zlp_zone_elem.querySelector('.display-section > img.zlp-raster')
        .addEventListener('click', function onclickvisibilityzlp() {
          const map_widget = mainPanel.getWidget('map1');
          const zlp_layer = map_widget.rasters[State.ZLPRuitor.zlp_id];
          if (this.classList.contains('visible')) {
            this.classList.remove('visible');
            this.src = eyeClosed;
            zlp_layer.setVisible(false);
          } else {
            this.classList.add('visible');
            this.src = eyeOpen;
            zlp_layer.setVisible(true);
          }
        });

      zlp_zone_elem.querySelector('.display-section > p.color_square')
        .addEventListener('click', function onclickcolorzlp() {
          const map_widget = mainPanel.getWidget('map1');
          const zlp_layer = map_widget.rasters[State.ZLPRuitor.zlp_id];

          const self = this;
          const this_color = self.style.backgroundColor;
          const input_col = document.createElement('input');
          input_col.setAttribute('type', 'color');
          input_col.setAttribute('value', rgb2hex(this_color));
          input_col.className = 'color_input';
          input_col.onchange = (change) => {
            const color = hex2rgb(change.target.value, 'string');
            // update the color button itself
            self.style.backgroundColor = color;
            // update the color inside raster onbeforeoperation
            const rasterSource = zlp_layer.getSource();
            rasterSource.on('beforeoperations', (event) => {
              // eslint-disable-next-line no-param-reassign
              event.data.color = getRgbArray(color);
            });
            rasterSource.refresh();
          };
          input_col.dispatchEvent(new MouseEvent('click'));
        });

      zlp_zone_elem.querySelector('ul > li').addEventListener('contextmenu', (e) => { // eslint-disable-line no-param-reassign
        const context_menu = new ContextMenu();
        context_menu.showMenu(
          e, document.body, [
            {
              name: 'Propriétés d\'affichage de la zone ...',
              action: () => {
                // Todo: This is bad, all this logic shouldn't be here in the code
                //    but in commands.js (as the other stuff triggered by context menus)
                //    for example. Or if needed we might store in a new module
                //    all the behaviors related to the ZLP.
                const zlp = State.ZLPRuitor;
                const el = document.createElement('div');
                const params = {
                  color: zlp.color,
                  contoursDisplayed: zlp.contours.displayed,
                  reversed: zlp.reversed,
                  // propsymbolDisplayed: zlp.propsymbol.displayed,
                  displayValueUnderCursor: zlp.valueUnderCursor,
                };
                el.innerHTML = `
                  <div>
                  <table style="text-align: left;">
                    <tr><td><label for="chk-contour">Afficher des contours</label></td><td><input style="float: right;" id="chk-contour" type="checkbox" ${params.contoursDisplayed ? 'checked ' : ''}></input></td></tr>
                    <!-- <tr><td><label for="zlp-color">Couleur</label></td><td><input style="width: 220px" id="zlp-color" type="text" value="${params.color}"></input></td></tr> -->
                    <tr><td><label for="cursor-value">Afficher la valeur sous le curseur</label></td><td><input style="float: right;" id="cursor-value" type="checkbox" ${params.displayValueUnderCursor ? 'checked ' : ''}></input></td></tr>
                    <tr><td><label for="inv-display">Affichage inversé</label></td><td><input style="float: right;" id="inv-display" type="checkbox" ${params.reversed ? 'checked ' : ''}></input></td></tr>
                    <!-- <tr><td><label for="propsymbol-display">Affichage symboles proportionnels</label></td><td><input style="float: right;" id="propsymbol-display" type="checkbox" ${params.propsymbolDisplayed ? 'checked ' : ''}></input></td></tr> -->
                  </table>
                  </div>`;
                el.querySelector('#chk-contour').onchange = function onchange_zlp_swal_constourdisplay() {
                  params.contoursDisplayed = this.checked;
                };
                // el.querySelector('#zlp-color').onchange = function onchange_zlp_swal_color() {
                //   params.color = this.value;
                // };
                el.querySelector('#inv-display').onchange = function onchange_zlp_swal_reverseddisplay() {
                  params.reversed = this.checked;
                };
                // el.querySelector('#propsymbol-display').onchange = function onchange_zlp_swal_displaypropsymbol() {
                //   params.propsymbolDisplayed = this.checked;
                // };
                el.querySelector('#cursor-value').onchange = function onchange_zlp_swal_cursorvalue() {
                  params.displayValueUnderCursor = this.checked;
                };
                swal({
                  title: 'Paramètres d\'affichage de la Zone de Localisation Probable',
                  buttons: {
                    confirm: {
                      text: 'Ok',
                      value: true,
                      closeModal: true,
                    },
                  },
                  content: el,
                  dangerMode: true,
                  // icon: 'info',
                }).then(() => {
                  // if (params.color !== zlp.color || params.reversed !== zlp.reversed) {
                  //   zlp.color = params.color;
                  //   zlp.reversed = params.reversed;
                  //   const rasterSource = zlp.layer.getSource();
                  //   rasterSource.on('beforeoperations', (event) => {
                  //     // eslint-disable-next-line no-param-reassign
                  //     event.data.color = getRgbArray(params.color);
                  //     // eslint-disable-next-line no-param-reassign
                  //     event.data.reversed = params.reversed;
                  //   });
                  //   rasterSource.refresh();
                  // }

                  if (zlp.contours.displayed !== params.contoursDisplayed) {
                    zlp.contours.displayed = params.contoursDisplayed;
                    if (params.contoursDisplayed === true) {
                      zlp.contours.layer = new Vector_layer({
                        style: contours_style_func,
                        source: new Vector({
                          features: (new GeoJSON()).readFeatures(
                            {
                              type: 'FeatureCollection',
                              features: zlp.contours.features,
                            },
                            { featureProjection: 'EPSG:3857' },
                          ),
                        }),
                      });
                      zlp.contours.layer.setExtent(State.initial_search_area.bbox);
                      State.map_widget._map.addLayer(zlp.contours.layer);
                    } else {
                      State.map_widget._map.removeLayer(zlp.contours.layer);
                      zlp.contours.layer = null;
                    }
                  }
                  // if (zlp.propsymbol.displayed !== params.propsymbolDisplayed) {
                  //   zlp.propsymbol.displayed = params.propsymbolDisplayed;
                  //   if (params.propsymbolDisplayed === true) {
                  //     zlp.propsymbol.layer = new Vector_layer({
                  //       style: propsymbol_default_style,
                  //       source: new Vector({
                  //         features: (new GeoJSON()).readFeatures(
                  //           {
                  //             type: 'FeatureCollection',
                  //             features: zlp.propsymbol.values.features,
                  //           },
                  //           { featureProjection: 'EPSG:3857' },
                  //         ),
                  //       }),
                  //     });
                  //     zlp.propsymbol.layer.setExtent(State.initial_search_area.bbox);
                  //     State.map_widget._map.addLayer(zlp.propsymbol.layer);
                  //   } else {
                  //     State.map_widget._map.removeLayer(zlp.propsymbol.layer);
                  //     zlp.propsymbol.layer = null;
                  //   }
                  // }
                  if (zlp.valueUnderCursor !== params.displayValueUnderCursor) {
                    zlp.valueUnderCursor = params.displayValueUnderCursor;
                  }
                });
              },
            },
          ],
        );
      });
    } else {
      document.querySelector('#zlp_zone').innerHTML = `
        <ul class="inner_list disabled">
          <li>
          <div class="zlp-content">Pas de Zone de Localisation Probable</div>
          </li>
        </ul>`;
    }
  };

  menu_left.onAfterAttach = function menuleftafterattach() {
    // Binds some interactions on the left menu
    this.node.querySelector('#use_current_bbox').onclick = click_use_current_bbox;
    this.node.querySelector('#delete_current_zone').onclick = click_delete_current_zone;
    this.node.querySelector('#reduce_current_zone').onclick = click_reduce_current_zone;
    this.node.querySelector('#victim_infos').onclick = () => {
      createCard({
        selector: 'body',
        infos: State.victim,
      });
    };
    this.node.querySelector('#use_drawing_toolbox').onclick = click_use_drawing_toolbox;
    // TODO (?): reallow to select features from different categories with checkbox
    //           and reallow to create clue when clicking on the clue header
    // menuLeft.node.querySelector('#clues_header').onclick = () => {
    //   commands.execute('ctx:new_clue');
    // };
  };
  return menu_left;
}
