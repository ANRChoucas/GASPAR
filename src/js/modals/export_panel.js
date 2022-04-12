import '../../css/export.css';
import logoChoucas from '../../img/logo-choucas.png';

/**
* Define the action of each button of the preview window.
*
* @param el - HTML element for the preview window.
*
* #### Notes
* Confirm button : open the browser print menu and close the preview window,
* Cancel button : close the preview window.
*/
function bindButtonsCard(el) {
  el.querySelector('.btn-chcs-confirm').onclick = () => { // eslint-disable-line no-param-reassign
    window.print();
    el.remove();
  };

  el.querySelector('.btn-chcs-cancel').onclick = () => { // eslint-disable-line no-param-reassign
    el.remove();
  };
}

/**
* Display in the preview window the informations relatives to the alert.
* @param {Array} infos - Informations about the alert (victim, clues and notes).
*/
function displayInfoAlert(infos) {
  if (infos[0].clues !== null) {
    const ul_clues = document.getElementById('export-list_clues');
    const { clues } = infos[0];
    for (let i = 0; i < clues.length; i++) {
      if (clues[i].location_relation.type_relation === 'Proximité immédiate') {
        if (clues[i].location_relation.target.type === 'ESC') {
          ul_clues.innerHTML += `<li>Proche (${clues[i].location_relation.service_options.distance_to_object}m) ${clues[i].location_relation.target.category}</li>`;
        } else if (clues[i].location_relation.target.type === 'ESR') {
          ul_clues.innerHTML += `<li>Proche (${clues[i].location_relation.service_options.distance_to_object}m) de ${clues[i].location_relation.target.feature.properties.name}(${clues[i].location_relation.target.category})</li>`;
        }
      } else if (clues[i].location_relation.type_relation === 'Voir') {
        if (clues[i].location_relation.target.type === 'ESC') {
          ul_clues.innerHTML += `<li>Voit un objet ${clues[i].location_relation.target.category}</li>`;
        } else if (clues[i].location_relation.target.type === 'ESR') {
          ul_clues.innerHTML += `<li>Voit ${clues[i].location_relation.target.feature.properties.name}(${clues[i].location_relation.target.category})</li>`;
        }
      }
    }
  }

  const ul_notes = document.getElementById('export-list_note');
  if (infos[1].length !== 0) {
    for (let i = 0; i < infos[1].length; i++) {
      ul_notes.innerHTML += `<li>${infos[1][i].content}</li>`;
    }
  } else {
    ul_notes.innerHTML = '<li>Aucune note</li>';
  }
}

/**
* Display in the preview window the informations relatives to the victim.
*
* @param el - HTML element for the preview window.
* @param infosVictim - Informations about the victim (activity, clothing, health, ...).
*/
function displayInfoVictim(el, infosVictim) {
  if (infosVictim.activity.length > 0) {
    el.querySelector('#export-infoActivity').innerHTML = `<strong>Activité :</strong> ${infosVictim.activity}`; // eslint-disable-line no-param-reassign
  }
  if (infosVictim.equipment.worn_clothing !== '') {
    el.querySelector('#export-infoClothing').innerHTML = `Habits : ${infosVictim.equipment.worn_clothing}`; // eslint-disable-line no-param-reassign
  }
  if (infosVictim.equipment.other_distinctive_features !== '') {
    el.querySelector('#export-infoEquipment_distinctive').innerHTML = `Équipements distinctifs : ${infosVictim.equipment.other_distinctive_features}`; // eslint-disable-line no-param-reassign
  }
  if (infosVictim.health_status.infos_general_physical_condition !== '') {
    el.querySelector('#export-infoPhysical_condition').innerHTML = `Condition physique générale : ${infosVictim.health_status.infos_general_physical_condition}`; // eslint-disable-line no-param-reassign
  }
  if (infosVictim.health_status.infos_current_health !== '') {
    el.querySelector('#export-infoHealth_status').innerHTML = `État actuel : ${infosVictim.health_status.infos_current_health}`; // eslint-disable-line no-param-reassign
  }

  const p_caller = document.getElementById('export-caller');
  if (infosVictim.is_caller) {
    p_caller.innerHTML += 'Oui';
  } else {
    p_caller.innerHTML += 'Non';
  }

  const p_may_move = document.getElementById('export-may_move');
  if (infosVictim.may_move) {
    p_may_move.innerHTML += 'Oui';
  } else {
    p_may_move.innerHTML += 'Non';
  }
}

/**
* Display the legend of the map in the preview window.
* @param {Array} clues - Array of the different clues represented on the map.
*/
function displayLegendMap(clues) {
  const legend_div = document.getElementById('export-clues_legend');

  if (State.ZLP !== null) {
    legend_div.innerHTML += `
    <div>
      <svg width="18" height="18">
        <rect width="18" height="18" style="fill:rgba(255, 69, 0, 0.15); stroke-width:4; stroke:rgb(255, 69, 0);"/>
      </svg>
      <span>Zone de localisation probable</span>
    </div>`;
  }

  for (let i = 0; i < clues.length; i++) {
    if (clues[i].location_relation.type_relation === 'Proximité immédiate') {
      if (clues[i].location_relation.target.type === 'ESC') {
        legend_div.innerHTML += `
        <div>
          <svg width="18" height="18">
            <rect width="18" height="18" style="fill:${clues[i].colors.fill}; stroke-width:4; stroke:${clues[i].colors.stroke};"/>
          </svg>
          <span>Zone autour des ${clues[i].location_relation.target.category}</span>
        </div>`;
      } else if (clues[i].location_relation.target.type === 'ESR') {
        legend_div.innerHTML += `
        <div>
          <svg width="18" height="18">
            <rect width="18" height="18" style="fill:${clues[i].colors.fill}; stroke-width:4; stroke:${clues[i].colors.stroke};"/>
          </svg>
          <span>Zone autour de ${clues[i].location_relation.target.feature.properties.name} (${clues[i].location_relation.target.category})</span>
        </div>`;
      }
    } else if (clues[i].location_relation.type_relation === 'Voir') {
      if (clues[i].location_relation.target.type === 'ESC') {
        legend_div.innerHTML += `
        <div>
          <svg width="18" height="18">
            <rect width="18" height="18" style="fill:${clues[i].colors.fill}; stroke-width:4; stroke:${clues[i].colors.stroke};"/>
          </svg>
          <span>Zone de visibilité des ${clues[i].location_relation.target.category}</span>
        </div>`;
      } else if (clues[i].location_relation.target.type === 'ESR') {
        legend_div.innerHTML += `
        <div>
          <svg width="18" height="18">
            <rect width="18" height="18" style="fill:${clues[i].colors.fill}; stroke-width:4; stroke:${clues[i].colors.stroke};"/>
          </svg>
          <span>Zone de visibilité de ${clues[i].location_relation.target.feature.properties.name} (${clues[i].location_relation.target.category})</span>
        </div>`;
      }
    }
  }

  const additional_layers = document.getElementsByClassName('additional-layer-legend');
  if (additional_layers.length !== 0) {
    for (let i = 0; i < additional_layers.length; i++) {
      const layers_legend = additional_layers[i].firstChild.children;
      for (let j = 1; j < layers_legend.length; j++) {
        legend_div.innerHTML += `
        <div>
          <svg width="18" height="${layers_legend[j].firstElementChild.style.height}">
            <rect width="18" height="18" style="fill:${layers_legend[j].firstElementChild.style.backgroundColor};"/>
          </svg>
          ${layers_legend[j].lastElementChild.outerHTML}
        </div>`;
      }
    }
  }
}

/**
* Resize the map according to the dimensions to the canvas.
*
* @param newCanvas - HTML element for the canvas.
* @param width - Value for the width of the map.
* @param height - Value for the height of the map.
* @return {Array} - An array containing the new width and height of the map.
*/
function redimMap(newCanvas, width, height) {
  const ratio = height / width;

  if (width < newCanvas.width && height < newCanvas.height) {
    while (width < newCanvas.width && height < newCanvas.height) {
      width += 1; // eslint-disable-line no-param-reassign
      height = Math.round(width * ratio); // eslint-disable-line no-param-reassign
    }
  } else {
    while (width > newCanvas.width || height > newCanvas.height) {
      width -= 1; // eslint-disable-line no-param-reassign
      height = Math.round(width * ratio); // eslint-disable-line no-param-reassign
    }
  }
  return [width, height];
}

/**
* Display the map in the preview window.
* @param el - HTML element for the preview window.
*/
function displayMap(el) {
  const originalCanvas2D = document.querySelector('canvas');
  const newCanvas = document.createElement('canvas');
  newCanvas.className = 'export-carte';
  const context = newCanvas.getContext('2d');
  newCanvas.width = 900;
  newCanvas.height = 600;
  const dimMap = redimMap(newCanvas, originalCanvas2D.width, originalCanvas2D.height);
  newCanvas.height = dimMap[1]; // eslint-disable-line prefer-destructuring
  context.drawImage(originalCanvas2D, 0, 0, dimMap[0], dimMap[1]);
  el.querySelector('#export-div_map').appendChild(newCanvas);

  const zoom = document.getElementsByClassName('ol-scale-line');
  el.querySelector('#export-div_map').appendChild(zoom[0].cloneNode(true));
  el.querySelector('.ol-scale-line').style.top = `${dimMap[1] + 60}px`; // eslint-disable-line no-param-reassign

  const scale = document.createElement('p');
  scale.className = 'export-map_scale';
  scale.innerHTML = `<strong>Échelle :</strong> <span>${zoom[0].firstChild.innerHTML}</span>`;
  scale.children[1].style.width = zoom[0].firstChild.style.width;
  el.querySelector('.export-info').appendChild(scale);
}

/**
* Create and display the HTML element for the preview window before print
* @param params - Informations about the alert (victim, clues and notes).
*/
export default function createExportPanel(params) {
  const el = document.createElement('div');
  el.className = 'export-container overlay';
  el.innerHTML = `
  <div class="card export-card">
    <div class="card-header">
      <div>Prévisualisation de l'export</div>
    </div>
    <h5>Export de la recherche - ${new Date().toLocaleDateString()}</h5>
    <div class="export-body">
      <div class="export-info">
        <img id="export-logoChoucas" src="${logoChoucas}"/>
        <div class="card-title"><h6>Informations victime</h6></div>
        <div class="card-text info">
          <p id="export-infoActivity"><strong>Activité :</strong> non renseignée</p>
          <p><strong>Équipement</strong></p>
          <ul>
            <li id="export-infoClothing">Habits : non renseignés</li>
            <li id="export-infoEquipment_distinctive">Équipements distinctifs : non renseignés</li>
          </ul>
          <p><strong>Santé</strong></p>
          <ul>
            <li id="export-infoPhysical_condition">Condition physique générale : non renseignée</li>
            <li id="export-infoHealth_status">État actuel : non renseigné</li>
          </ul>
          <p id="export-caller"><strong>La victime est l'appelant :</strong> </p>
          <p id="export-may_move"><strong>La victime peut se déplacer :</strong> </p>
        </div>
        <div class="card-title"><h6>Informations alerte</h6></div>
        <div class="card-text info">
          <p><strong>Indices :</strong></p>
          <ul id="export-list_clues"></ul>
          <p><strong>Notes :</strong></p>
          <ul id="export-list_note"></ul>
        </div>
      </div>
      <div class="export-map">
        <div id="export-div_map"></div>
        <div class="export-legend">
          <p><strong>Légende:</strong></p>
          <div id="export-clues_legend"></div>
        </div>
      </div>
    </div>
    <div class="card-footer" style="text-align: right;">
      <div class="btn-group" role="group">
        <button class="btn btn-outline-secondary btn-chcs-cancel">Annuler</button>
        <button class="btn btn-outline-primary btn-chcs-confirm">Exporter</button>
      </div>
    </div>
  </div>`;
  document.body.appendChild(el);

  bindButtonsCard(el, params);
  displayInfoVictim(el, params.infos[0].victim);
  displayInfoAlert(params.infos);
  displayMap(el);
  displayLegendMap(params.infos[0].clues);
}
