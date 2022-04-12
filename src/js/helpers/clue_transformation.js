import DB from '../DB';
import { capitalize } from './main';

/**
 * Process the result of NERC service in order to extract
 * whats is useful for pre-filling the clue panel.
 *
 * @param text
 * @return {{clue_nl: string, modifiers: string[], named_entities: {}[]}}
 */
export function processNercResult(text) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(text, 'text/xml');
  const body = xmlDoc.querySelector('body');

  // Rebuild the final clue in nl
  const words = Array.from(body.getElementsByTagName('w'))
    .map((el) => el.innerHTML);
  const clue_nl = words.join(' ');

  // Todo: extract the named entit(y/ies)
  const placeNames = Array.from(body.getElementsByTagName('placeName') || []);
  const named_entities = placeNames.map((pn) => {
    const name = Array.from(pn.querySelectorAll('w'))
      .map((el) => el.innerHTML).join(' ');
    return name;
  });

  const names = Array.from(body.getElementsByTagName('name') || []);
  const namesNPr = names.map((pn) => {
    const name = Array.from(pn.querySelectorAll('w[type="NPr"]'))
      .map((el) => el.innerHTML).join(' ');
    return name;
  });

  // Todo: extract the modifiers (such as a distance to an entity)
  //  and do something with them..
  const modifiers = [];
  const geoFeatures = Array.from(body.getElementsByTagName('geogFeat') || []);
  geoFeatures.forEach((geof) => {
    if (geof.parentElement.tagName === 'placeName') return;
    const modifieur = Array.from(geof.querySelectorAll('w'))
      .map((el) => el.innerHTML).join(' ');
    modifiers.push(modifieur);
  });

  // Todo: try to extract the spatial relation

  return {
    clue_nl,
    modifiers,
    namesNPr,
    named_entities,
    spatial_relation: '',
  };
}

/**
* Get the target feature from the clue in natural language.
*
* @param {string} clue_nl - The clue in natural language.
* @return {object} - The target as expected by the clue component.
*
*/
/* eslint-disable no-else-return, dot-notation */
export const getTargetFromClue = (clue_nl, relation) => {
  const clue = clue_nl.toLowerCase();

  if (clue.indexOf('sentier') > -1 || clue.indexOf('chemin') > -1) {
    return {
      type: 'ESC',
      features: DB['ref_chemin'],
      category: 'Chemin',
    };
  } else if (clue.indexOf('route') > -1) {
    return {
      type: 'ESC',
      features: DB['ref_route'],
      category: 'Route',
    };
  } else if (clue.indexOf('piste') > -1) {
    return {
      type: 'ESC',
      features: DB['ref_piste de ski'],
      category: 'Piste de ski',
    };
  } else if (
    clue.indexOf(' lac') > -1 || clue.indexOf('plan d\'eau') > -1
      || clue.indexOf(' étang') > -1 || (
      clue.indexOf(' eau') > -1 && clue.indexOf('plan ') > -1)
  ) {
    return {
      type: 'ESC',
      features: DB['ref_lac'],
      category: 'Lac',
    };
  } else if (clue.indexOf(' réservoir') > -1 || clue.indexOf('reservoir') > -1) {
    return {
      type: 'ESC',
      features: DB['ref_réservoir'],
      category: 'Réservoir',
    };
  } else if (clue.indexOf(' eau') > -1 || clue.indexOf('rivière') > -1 || clue.indexOf('ruisseau') > -1) {
    return {
      type: 'ESC',
      features: DB['ref_rivière'],
      category: 'Rivière',
    };
  } else if (clue.indexOf('ruisseau') > -1) {
    return {
      type: 'ESC',
      features: DB['ref_ruisseau'],
      category: 'Ruisseau',
    };
  } else if (clue.indexOf('electri') > -1 || clue.indexOf('électri') > -1 || clue.indexOf('ligne ') > -1) {
    return {
      type: 'ESC',
      features: DB['ref_ligne électrique'],
      category: 'Ligne électrique',
    };
  } else if (clue.indexOf('sommet') > -1 || clue.indexOf('pic ') > -1) {
    return {
      type: 'ESC',
      features: DB['ref_sommet'],
      category: 'Sommet',
    };
  } else if (clue.indexOf(' col') > -1) {
    return {
      type: 'ESC',
      features: DB['ref_col'],
      category: 'Col',
    };
  }
  return null;
};
/* eslint-enable no-else-return, dot-notation */

const formatInnerESRTargetSection = (ft) => {
  if (ft.properties.CHOUCAS_CLASS) {
    const display_name = (ft.properties.name
      && ft.properties.name.toLowerCase() !== ft.properties.CHOUCAS_CLASS.toLowerCase())
      ? ft.properties.name
      : `Un.e <i>${ft.properties.CHOUCAS_CLASS}</i> (sans nom)`;
    return `<i class="fas fa-map-marker-alt"></i><span type="ESR" style="margin-left: 5px;">${display_name}</span>`;
  } else { // eslint-disable-line no-else-return
    // Format the coordinates
    const coords = ft.geometry.type === 'Point'
      ? ft.geometry.coordinates
        .map((c) => Math.round(c * 1000) / 1000)
        .join(',')
      : `${ft.geometry.coordinates.slice(0, 2)
        .map((c) => Math.round(c * 1000) / 1000)
        .join(',')} ...`;

    return `<i class="fas fa-map-marker-alt"></i><span type="ESR" style="margin-left: 5px;">${ft.geometry.type} (${coords})</span>`;
  }
};

/**
* Make the "target section", to be used by the clue creation component
* and by the clue list component.
*
* @param {object} target_info - Informations regarding the target of a clue.
* @return {string} - The corresponding HTML code.
*
*/
/* eslint-disable no-else-return, consistent-return */
export function makeSectionTarget(target_info) {
  console.log('target_info', target_info);
  if (!target_info) {
    return `<p style="margin: auto;" id="selection-second-object"> 
<i class="fas fa-map-marker-alt"></i>
<span style="margin-left: 5px; color:grey; cursor:pointer;"><i>Sélectionner un autre objet...</i></span>
</p>`;
  } else if (target_info.type === 'ESC') {
    return `<p style="margin: auto;">
<i class="fas fa-folder-plus"></i>
<span type="ESC" style="margin-left: 5px;">${capitalize(target_info.category)} (tou.te.s)</span>
</p>`;
  } else if (target_info.type === 'ESR' && target_info.feature) {
    if (Array.isArray(target_info.feature)) {
      // This is an ESR with 2 site (Entre X et Y)
      return `<p style="margin: auto;">
    ${formatInnerESRTargetSection(target_info.feature[0])}
    <br>
    ${formatInnerESRTargetSection(target_info.feature[1])}
    </p>`;
    } else {
      // This is a regular ESR
      return `<p style="margin: auto;">${formatInnerESRTargetSection(target_info.feature)}</p>`;
    }
  }
}
/* eslint-enable no-else-return, consistent-return */
