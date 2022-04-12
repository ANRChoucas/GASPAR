import '../../css/card.css';
import '../../css/clue.css';
import 'rangeslider-pure/dist/range-slider.min.css';
import chroma from 'chroma-js';
import rangeSlider from 'rangeslider-pure';
import { v4 as uuidv4 } from 'uuid';
import makeFakeSelectElement from '../components/fake_select';
import { callServiceSpatialisation } from '../services_call';
import { default_tree_colors, allRelationLocalisation } from '../model';
import {
  displayNotification, formatDateString, ONE_HOUR, substractTime,
} from '../helpers/main';
import { makeInputAutocomplete } from '../components/InputAutocomplete';
import { getRandomColor2, hex2rgb, rgb2hex } from '../helpers/colors';
import { makeSectionTarget, getTargetFromClue } from '../helpers/clue_transformation';
import loading_overlay from '../components/loading_overlay';
import DB from '../DB';

const default_options = {
  selector: 'body',
  infos: null,
  cb_success: null,
};

const default_simple_clue_informations = {
  confidence: '',
  visible: '',
  clue_natural_language: '',
  colors: {
    fill: '',
    stroke: '',
  },
  location_relation: {
    site: null,
    target: null,
    service_options: null,
    type_relation: null,
  },
  timestamp: '',
};

function windowDblclickListener(event) {
  const { clientX, clientY } = event;
  const elements = document.elementsFromPoint(clientX, clientY);
  Array.from(elements)
    .forEach((el) => {
      if (el.tagName === 'LI' && el.className === 'end-node') {
        const id = +el.getAttribute('ft_id');
        const category = el.getAttribute('cat');
        const targetObject = {
          type: 'ESR',
          category,
          feature: DB[`ref_${category}`].find((f) => f.id === id),
        };
        const sectionNewObject = document
          .querySelector('div[relation="http://www.semanticweb.org/mbunel/ontologies/Ornitho#EntreXetY"] > div');
        sectionNewObject.innerHTML = makeSectionTarget(targetObject);
        sectionNewObject.__data__ = targetObject.feature;
        document.querySelector('.card-container.overlay').style.display = null;
      }
    });
  window.document.removeEventListener('dblclick', windowDblclickListener);
}

function listenerSecondObjetSelection() {
  document.querySelector('.card-container.overlay').style.display = 'none';
  window.document.addEventListener('dblclick', windowDblclickListener);
};


function fetchClueInformations(card, target) {
  const date_now = new Date();
  const c = { ...default_simple_clue_informations };
  c.clue_id = `clue_${uuidv4()}`;
  c.timestamp = formatDateString(date_now);
  c.confidence = +card.querySelector('#confidence-step').value;
  c.visible = true;
  c.location_relation = {
    target,
    service_options: {},
    site: State.victim.victim_id,
    type_relation: 'Spatialisation',
  };

  // Fetch the information about the instant or the duration:
  const instant_duration_elem = card.querySelector('.card-clue-instantduration > .fake-select > .head > .content');
  const type_instant_duration = instant_duration_elem.getAttribute('value');

  // We are storing the kind of "instant or duration" and the real corresponding datetime,
  // This allows to compute the ZLP for all the clue which takes place "now"
  // (even if the date of creation when "now" is selected is slightly not the same)
  c.instant_or_duration = {
    type: type_instant_duration,
  };
  if (type_instant_duration === 'instant-now') {
    c.instant_or_duration.value = [
      formatDateString(date_now),
    ];
  } else if (type_instant_duration === 'instant-past') {
    const value_past = +instant_duration_elem.querySelector('input').value;
    c.instant_or_duration.value = [
      formatDateString(substractTime(date_now, value_past * ONE_HOUR)),
    ];
  } else if (type_instant_duration === 'duration-instant-to-now') {
    const value_past = +instant_duration_elem.querySelector('input').value;
    c.instant_or_duration.value = [
      formatDateString(substractTime(date_now, value_past * ONE_HOUR)),
      formatDateString(date_now),
    ];
  } else if (type_instant_duration === 'duration-instant-to-instant') {
    const values_past = Array.from(
      instant_duration_elem.querySelectorAll('input'),
    ).map((el) => +el.value);
    c.instant_or_duration.value = [
      formatDateString(substractTime(date_now, values_past[0] * ONE_HOUR)),
      formatDateString(substractTime(date_now, values_past[1] * ONE_HOUR)),
    ];
  } // TODO: handle the two next cases where the user
  // inputs a specific datetime
  // else if (type_instant_duration === 'instant-precise') {
  //
  // } else if (type_instant_duration === 'duration-precise') {
  //
  // }

  // if (c.location_relation.type_relation === 'Proximité immédiate') {
  //   c.location_relation.service_options = {
  //     distance_to_object: +card.querySelector('#dist-buffer-input').value,
  //     uncertainty: +card.querySelector('#uncertainty-buffer-input').value,
  //   };
  // } else if (c.location_relation.type_relation === 'Ombre / Soleil') {
  //   let value_ombre_soleil = Array.from(card
  //     .querySelectorAll('input[name="sunshadowchoice"]'))
  //     .filter((el) => el.checked)
  //     .map((el) => el.parentNode.querySelector('label').innerHTML)[0];
  //   value_ombre_soleil = value_ombre_soleil === 'au soleil' ? 'soleil' : 'ombre';
  //   c.location_relation.service_options = {
  //     type_zone: value_ombre_soleil,
  //   };
  //   // c.target = { type: value_ombre_soleil };
  // } else if (c.location_relation.type_relation === 'Spatialisation') {
  const relationUri = card.querySelector('#relation-localisation-selection .searchTwo').getAttribute('uri');
  const modifiers = [];
  if (allRelationLocalisation.find((e) => e.uri === relationUri).modifiers) {
    const value = +card.querySelector('.target-service-spatialisation-options > input').value;
    const modifier = {
      uri: allRelationLocalisation.find((e) => e.uri === relationUri).modifiers[0].uri,
      value,
    };
    modifiers.push(modifier);
  }

  c.location_relation.service_options = {
    relationLocalisation: {
      uri: relationUri,
      modifieurs: modifiers,
    },
  };

  if (relationUri === 'http://www.semanticweb.org/mbunel/ontologies/Ornitho#EntreXetY') {
    const secondTarget = document
      .querySelector('div[relation="http://www.semanticweb.org/mbunel/ontologies/Ornitho#EntreXetY"] > div')
      .__data__;
    c.location_relation.target.feature = [
      c.location_relation.target.feature,
      secondTarget,
    ];
    console.log(c.location_relation.target.feature);
  }
  // }
  // Color to use to display the result layer
  const selected_color = chroma(card.querySelector('.color_hex').value);
  c.colors = {
    fill: selected_color.alpha(0.15).css(),
    stroke: selected_color.alpha(1).css(),
  };
  return c;
}

function bindColorButtons(card) {
  const square_color = card.querySelector('.color_square');
  const input_hex_color = card.querySelector('.color_hex');
  input_hex_color.onchange = function hex_color_change() {
    const v = this.value;
    if (v && ( // eslint-disable-line no-mixed-operators
      v.startsWith('rgb') && v.endsWith(')')) || ( // eslint-disable-line no-mixed-operators
      v.startsWith('#') && v.length === 7)
    ) {
      square_color.style.backgroundColor = v;
    }
  };

  square_color.onclick = function square_color_click() {
    const self = this;
    const this_color = self.style.backgroundColor;
    const input_col = document.createElement('input');
    input_col.setAttribute('type', 'color');
    input_col.setAttribute('value', rgb2hex(this_color));
    input_col.className = 'color_input';
    input_col.onchange = (change) => {
      self.style.backgroundColor = hex2rgb(change.target.value, 'string');
      input_hex_color.value = change.target.value;
    };
    input_col.dispatchEvent(new MouseEvent('click'));
  };
}

/**
* Function used when a clue is modified to determine if we need to recompute
* the corresponding zone (as in some case we can directly change some paramaters
* like the color of the zone and so on..). The result depends on the type
* of spatial relation (Voit, Et à proximité immédiate, Ombre/Soleil, etc.)
* because (for example) changing the instant/duration property
* for "Ombre/Soleil" spatial relation needs to recompute the corresponding zone
* while changing it for "Proximité immédiate" doesn't.
*
* @param {Object} old_clue - The Object holding informations about the clue before modification
*                            (or empty informations if the user is creating a new clue).
* @param {Object} new_clue - The Object holding informations about the clue after the user
*                             validated it.
* @return {Object} - An Object with two fields (hasOldClue and needToComputeZone).
*
*/
function compareClues(old_clue, new_clue) {
  const hasOldClue = !!old_clue.corresponding_zone;
  // If there is no old clue data we can return early
  if (!(old_clue.corresponding_zone)) return { hasOldClue, needToComputeZone: true };

  // In any case, if the clue isn't the same in natural language or
  // if the spatial relation kind is not the same or
  // if the target of that relation isn't the same ..
  // ... we need to recompute the corresponding zone and we can return now :
  if (old_clue.clue_natural_language !== new_clue.clue_natural_language) {
    return { hasOldClue, needToComputeZone: true };
  }
  if (old_clue.location_relation.target !== new_clue.location_relation.target) {
    return { hasOldClue, needToComputeZone: true };
  }
  if (
    old_clue.location_relation.type_relation !== new_clue.location_relation.type_relation
  ) return { hasOldClue, needToComputeZone: true };

  // We are going to check the specific parameters for each
  // kind of spatial relation
  if (old_clue.location_relation.type_relation === 'Proximité immédiate') {
    // We need to recompute this kind of clue
    // if one of the distance or uncertainty parameter changed
    if (
      (
        old_clue.location_relation.service_options.distance_to_object
        !== new_clue.location_relation.service_options.distance_to_object
      ) || (
        old_clue.location_relation.service_options.uncertainty
        !== new_clue.location_relation.service_options.uncertainty
      )
    ) {
      return { hasOldClue, needToComputeZone: true };
    }
  } else if (old_clue.location_relation.type_relation === 'Ombre / soleil') {
    // We need to recompute this kind of clue
    // if the zone type changed (ombre / soleil)
    // and also if the instant / duration changed
    if (
      (old_clue.location_relation.service_options.type_zone
        !== new_clue.location_relation.service_options.type_zone)
      || (old_clue.instant_or_duration !== new_clue.instant_or_duration)
    ) {
      return { hasOldClue, needToComputeZone: true };
    }
  }
  // Once we verified that, we don't need to recompute the zone if
  // one of these parameters changed
  // (as they have no effect on the geometry of the computed zone)
  if (
    (old_clue.confidence !== new_clue.confidence)
    || (old_clue.colors !== new_clue.colors)
    || (old_clue.instant_or_duration !== new_clue.instant_or_duration)
  ) {
    return {
      hasOldClue,
      needToComputeZone: false,
      keepIdAndDate: (
        old_clue.instant_or_duration.type === 'instant-now'
          && new_clue.instant_or_duration.type === 'instant-now'),
    };
  }

  // Recompute the zone in all other cases
  return { hasOldClue, needToComputeZone: true };
}

/**
* Select the appropriate service given a spatial relation and prepare
* the appropriates parameters.
*
* @param {object} data_clue - The data corresponding to the clue for which we
*                             want to compute the zone.
* @return {object} - An object with two fields, 'func_service' and 'parameters',
*                    respectively the service to be called and its paramaters
*                    given the data clue provided.
*/
function prepareOptionsForSpatialRelationService(data_clue) {
  const p = { ...data_clue.location_relation.service_options };
  // let func_service;
  // if (data_clue.location_relation.type_relation === 'Proximité immédiate') {
  //   func_service = callServiceBuffer;
  //   if (data_clue.location_relation.target.type === 'ESR') {
  //     p.geoms = [data_clue.location_relation.target.feature.geometry];
  //   } else { // data_clue.location_relation.target.type === 'ESC'
  //     p.geoms = data_clue.location_relation.target.features.map((ft) => ft.geometry);
  //   }
  //   p.clue_id = data_clue.clue_id;
  // } else if (data_clue.location_relation.type_relation === 'Spatialisation') {
  const func_service = callServiceSpatialisation;
  if (data_clue.location_relation.target.type === 'ESR') {
    // We have a ESR but some relation need 2 ESR (such as Entre X et Y)
    // so we need to check if its the case or not
    // and act accordingly
    if (Array.isArray(data_clue.location_relation.target.feature)) {
      p.geoms = data_clue.location_relation.target.feature.map((d) => d.geometry);
    } else {
      p.geoms = [data_clue.location_relation.target.feature.geometry];
    }
  } else { // data_clue.location_relation.target.type === 'ESC'
    p.geoms = data_clue.location_relation.target.features.map((ft) => ft.geometry);
  }
  p.clue_id = data_clue.clue_id;
  p.confidence = data_clue.confidence;
  p.color = data_clue.colors.stroke;
  // }
  // else if (data_clue.location_relation.type_relation === 'Voir') {
  //   func_service = callServiceInterviz;
  //   if (data_clue.location_relation.target.type === 'ESR') {
  //     p.geoms = [data_clue.location_relation.target.feature.geometry];
  //   } else { // data_clue.location_relation.target.type === 'ESC'
  //     p.geoms = data_clue.location_relation.target.features.map((ft) => ft.geometry);
  //   }
  //   p.clue_id = data_clue.clue_id;
  // } else if (data_clue.location_relation.type_relation === 'Ombre / Soleil') {
  //   func_service = callServiceSunmask;
  //   p.instant_duration = data_clue.instant_or_duration;
  //   p.type = data_clue.location_relation.service_options.type_zone;
  //   p.clue_id = data_clue.clue_id;
  // }
  return {
    func_service,
    parameters: p,
  };
}

function bindButtonsCard(card, cb_success, target, existing_info) {
  card.querySelector('.btn-chcs-confirm').onclick = () => { // eslint-disable-line no-param-reassign
    const data_clue = fetchClueInformations(card, target);

    // Compare the clue data before opening the clue window and now:
    const { hasOldClue, needToComputeZone, keepIdAndDate } = compareClues(existing_info, data_clue);

    // Remove the existing clue if any
    if (hasOldClue) {
      const old_clue_id = existing_info.clue_id;
      State.clues.splice(
        State.clues.findIndex((el) => el.clue_id === old_clue_id),
        1,
      );
      State.clues = [].concat(State.clues);
    }

    if (needToComputeZone) {
      const {
        func_service, parameters,
      } = prepareOptionsForSpatialRelationService(data_clue);
      // Call the service allowing to transform the clue in compatible area(s)
      func_service(parameters)
        .then(({ geotiffBlob, layer, contours }) => {
          // the ol.Image to be added on the map:
          //data_clue.corresponding_zone = layer; // TODO : dont store it here
          // TODO : compute "layer" here and not in the parent function
          //  (and allow to easily recompute "layer" from the geotiff file
          //   to handle reloading from a dump of current alert state)
          State.map_widget.rasters[data_clue.clue_id] = layer;
          // the raw geotiff file, needed for later call to Ruitor Fusion:
          data_clue.geotiffBlob = geotiffBlob;
          // the FeatureCollection of contours (only 1 step)
          data_clue.contours = {
            displayed: false,
            features: contours.features,
          };
          // Update the state object with this new clue..
          State.cluesRuitor = [
            ...State.cluesRuitor,
            data_clue,
          ];
        })
        .catch((e) => {
          displayNotification(
            `Une erreur s'est produite pendant le calcul de la zone : ${e}. L'indice n'a pas été ajouté.`,
            'error',
          );
          loading_overlay.hide();
          console.log(e);
        });
    } else { // No need to recompute the zone...
      // Retrieve the corresponding and already computed zone
      // on the existing data clue
      data_clue.corresponding_zone = existing_info.corresponding_zone;
      // Don't change the ID or the date if the user only changed the color or the confidence
      // (so we need to override the new date,computed when the user modified these parameters,
      // by the one computed at clue / zone creation)
      if (keepIdAndDate) {
        data_clue.clue_id = existing_info.clue_id;
        data_clue.instant_or_duration = existing_info.instant_or_duration;
      }
      // Update the state object with this new clue:
      State.clues = [
        ...State.clues,
        data_clue,
      ];
      // TODO : we shouldn't recompute the ZLP after that if the ID didn't changed
      // (the ZLP already reference clues it's coming from, but we are throwing
      // the ZLP anyway for now...)
    }
    card.remove();
    if (cb_success) cb_success();
  };

  card.querySelector('.btn-chcs-cancel').onclick = () => { // eslint-disable-line no-param-reassign
    card.remove();
  };
}

export default function createBoxClue(options) {
  // const params = Object.assign({}, default_options, options);
  const params = { ...default_options, ...options };
  const root = document.createElement('div');
  const clue_nl = params.infos && params.infos.clue_natural_language
    ? `"... ${params.infos.clue_natural_language}"` : '';
  // const spatial_relation_types = ['Voir', 'Proximité immédiate', 'Ombre / Soleil', 'Spatialisation'];
  const tab = params.infos && params.infos.location_relation.type_relation
    ? params.infos.location_relation.type_relation
    : 'Spatialisation'; // getTabFromClue(clue_nl);
  params.infos.location_relation.target = params.infos && params.infos.location_relation.target
    ? params.infos.location_relation.target
    : getTargetFromClue(clue_nl, tab);
  root.className = 'card-container overlay';
  // Check if there is an existing color (if re-opening an existing clue)
  // if not, check if there is a predefined color for this category of objects,
  // if not, generate a random color:
  //          with hue in range [25,335] (avoids red color already used for ZLP)
  //          with saturation in range [90-100]
  //          and with fixed lightness of 25.
  // (the user is able to change the color later)
  const color = params.infos.colors
    ? chroma(params.infos.colors.fill).alpha(1).hex()
    : (
      default_tree_colors.get(params.infos.location_relation.target.category)
      || getRandomColor2([25, 335], [90, 100], [25, 25])
    );

  root.innerHTML = `
  <div class="card card-clue center">
    <div class="card-header">
      <div class="card-clue-title">Création d'indice</div>
    </div>
    <div class="card-body">
      <div class="card-text">
        <div
          class="card-clue-specifc-params"
          id="params-service-spatialisation">
          <div class="card-text center card-clue-section">
              <p style="margin-top: 20px;"><i><b>La victime est ...</i></b></p>
              <div id="relation-localisation-selection"></div>
          </div>
        </div>
        <div
          class="card-clue-specifc-params target-service-spatialisation-options"
          relation="http://www.semanticweb.org/mbunel/ontologies/Ornitho#DistanceQuantitativePlanimetrique"
          style="display: none;">
          <span>à</span>
          <input type="number" step="10" value="100"/>
          <span>mètres de</span>
        </div>
        <div
          class="card-clue-specifc-params target-service-spatialisation-options"
          relation="http://www.semanticweb.org/mbunel/ontologies/Ornitho#DansPlanimetrique"
          style="display: none;">
          <input id="specific-params-dans-planimetrique" type="checkbox"/>
          <label for="specific-params-dans-planimetrique">NOT (Pas dans ...)</label>
        </div>
        <div
          class="card-clue-specifc-params"
          id="target-service-spatialisation">
          <div class="card-text-target">
            ${makeSectionTarget(options.infos.location_relation.target)}
          </div>
        </div>
        <div
          class="card-clue-specifc-params target-service-spatialisation-options"
          relation="http://www.semanticweb.org/mbunel/ontologies/Ornitho#EntreXetY"
          style="display: none;">
          <span style="margin-left: 6px;"> et </span>
          <div class="card-text-target">
            ${makeSectionTarget()}
          </div>
        </div>
      </div>
      
      <hr>
      
      <div style="display: flex;">
        <div style="width: 50%;">
          <div class="card-title center"><span class="card-section-title">Confiance</span></div>
          <div class="card-texcard-clue-confidence" style="padding-top: 16px;">
            <div style="margin: auto; width: 60px;">
              <input type="range" id="confidence-step" />
            </div>
            <div style="margin: auto; width: 120px;">
              <span style="float:left;">Faible</span><span style="float:right;">Forte</span>
            </div>
          </div>
        </div>
        <div style="width: 60%;">
          <div class="card-title center" style="margin-bottom: 0;">
            <span class="card-section-title">Instant ou durée</span>
          </div>
          <div class="card-text card-clue-instantduration center" style="margin-top: 0;">
          </div>
        </div>
      </div>
      <hr style="display:${clue_nl !== '' ? 'block' : 'none'};">
      <div style="display:${clue_nl !== '' ? 'block' : 'none'};">
        <span class="center">Rappel de l'indice en langue naturelle :</span>
        <div class="card-clue-nl">
          <p>${clue_nl}</p>
        </div>
      </div>

      <hr>
      <div>
        <span class="center">Couleur d'affichage de l'indice :</span>
        <p class="color_square" style="background-color: ${color}"></p>
        <input class="color_hex" type='text' value="${color}"/>
      </div>

    </div>
    <div class="card-footer" style="text-align: right;">
      <div class="btn-group" role="group">
        <button class="btn btn-outline-secondary btn-chcs-cancel">Annulation</button>
        <button class="btn btn-outline-primary btn-chcs-confirm disabled">Confirmation</button>
      </div>
    </div>
  </div>`;
  document.querySelector(params.selector).appendChild(root);

  // Create the confidence slider
  const slider = document.querySelector('#confidence-step');
  rangeSlider.create(slider, {
    vertical: false,
    min: 0,
    max: 1,
    step: 0.5,
    value: 1,
    borderRadius: 10,
  });

  // Make the autocomplete component and
  // bind the callback for when a new choice is made by the user
  const inputAutoCompleteContainer = makeInputAutocomplete(
    '#relation-localisation-selection',
    allRelationLocalisation,
    function autocompletenewchoice() {
      // We toggle the displaying of a section of the clue panel depending
      // on the spatial relation selected
      root.querySelectorAll('.target-service-spatialisation-options')
        .forEach((el) => {
          // eslint-disable-next-line no-param-reassign
          el.style.display = 'none';
        });
      const thisUri = this.getAttribute('uri');
      const elems = root.querySelectorAll(`.target-service-spatialisation-options[relation="${thisUri}"]`);
      elems.forEach((el) => {
        // eslint-disable-next-line no-param-reassign
        el.style.display = '';
      });
      if (thisUri === 'null') {
        root.querySelector('.btn-chcs-confirm')
          .classList.add('disabled');
      } else {
        root.querySelector('.btn-chcs-confirm')
          .classList.remove('disabled');
      }
    },
  );
  // Make the fake select element for
  // displaying instant / duration choice
  makeFakeSelectElement('.card-clue-instantduration', [
    { value: 'instant-now', label: 'Maintenant' },
    {
      value: 'instant-past',
      label: 'Il y a <input disabled type="number" min="1" max="8" step="1" value="1"></input> heure(s)',
    },
    {
      value: 'instant-precise',
      label: 'Saisie précise d\'un instant ...',
    },
    {
      value: 'duration-instant-to-now',
      label: 'Entre <input disabled type="number" min="1" max="8" step="1" value="1"></input> heure(s) et maintenant',
    },
    {
      value: 'duration-instant-to-instant',
      label: 'Entre <input disabled type="number" min="1" max="8" step="1" value="1"></input> et <input disabled type="number" min="1" max="8" step="1" value="8"></input> heure(s)',
    },
    {
      value: 'duration-precise',
      label: 'Saisie précise d\'une durée ...',
    },
  ]);
  bindButtonsCard(root, params.cb_success, params.infos.location_relation.target, params.infos);
  bindColorButtons(root);
  // Put focus on the first element
  root.querySelector('#relation-localisation-selection input.searchTwo').focus();
  root.querySelector('#selection-second-object').addEventListener('click', listenerSecondObjetSelection);
  return root;
}
