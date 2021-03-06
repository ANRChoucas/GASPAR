import { CommandRegistry } from '@lumino/commands';
import { Style, Stroke, Fill } from 'ol/style';
import swal from 'sweetalert';
import Toastify from 'toastify-js';
import { Image } from 'ol/layer';
import basemapReferences from './basemaps';
import createBoxClue from './modals/clue_panel';
import DB from './DB';
import {
  b64toBlob, getRgbArray, isValidJSON, makeInfoBox,
} from './helpers/main';
import LogWidget from './components/log_widget';
import makeTour from './tutorial_guided_tour';
import logoChoucas from '../img/logo-choucas.png';
import logoANR from '../img/label-ANR.png';
import logoGaspar from '../img/gasparlogo.png';
import createExportPanel from './modals/export_panel';
import { makeRasterFromImageDescription, processGeotiffToImageStatic } from './services_call';

function displayInfoVersion() {
  const el = document.createElement('div');
  el.innerHTML = `
<div style="text-align: center;padding: 5px;">
  <div><img style="width:80%;" src="${logoGaspar}" /></div>
  <p>${APPLICATION_NAME} version ${CHOUCAS_VERSION}</p>
  <p>Prototype developpé dans le cadre du projet <a target="_blank" rel="noopener noreferrer" href="http://choucas.ign.fr/">CHOUCAS</a>
  <div><img style="height: 150px;" src="${logoChoucas}" /><img style="height: 150px;" src="${logoANR}" /></div>
</div>`;
  swal({
    buttons: false,
    content: el,
    dangerMode: false,
    title: 'Informations de version',
  });
}

const commands = new CommandRegistry();

commands.addCommand('app:new', {
  label: 'Nouvelle recherche',
  mnemonic: 0,
  iconClass: 'fa fa-cut',
  execute: () => {
    window.location.reload();
  },
});

const blobToBase64 = (blob) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onloadend = resolve;
  reader.onerror = reject;
  reader.readAsDataURL(blob);
});

commands.addCommand('app:save', {
  label: 'Sauvegarder ...',
  mnemonic: 0,
  iconClass: 'fa fa-copy',
  execute: async () => {
    const cluesRuitor = await Promise.all(State.cluesRuitor.map(async (clue) => {
      const clueModified = {};
      Object.assign(clueModified, clue);
      clueModified.geotiffBlob = null;
      const txt = await blobToBase64(clue.geotiffBlob);
      clueModified._geotiffBlob = txt.target.result;
      return clueModified;
    }));

    const dump = JSON.stringify({
      // TODO: handle cluesRuitor and ZLPRuitor here ...
      cluesRuitor: cluesRuitor,
      clues: State.clues,
      currentBaseMap: State.currentBaseMap,
      initial_search_area: State.initial_search_area,
      map: State.map,
      victim: State.victim,
      notes: State.notes,
      type: 'choucalerte',
    });
    const object_url = URL.createObjectURL(
      new Blob([dump], { type: 'application/json' }),
    );
    const elem = document.createElement('a');
    elem.setAttribute('href', object_url);
    elem.setAttribute('download', `sauvegarde_${new Date().getTime()}.choucalerte`);
    elem.style.display = 'none';
    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
    URL.revokeObjectURL(object_url);
  },
});

/**
* Addition and definition of the export command in the registry.
*
* @param id - id of the command in registry.
* @param options - Options : label, icon, ..., executed code of the command.
*/
commands.addCommand('app:export', {
  label: 'Export PDF ...',
  mnemonic: 0,
  iconClass: 'fa fa-download',
  execute: () => {
    // TODO: handle cluesRuitor (instead of 'clues') and ZLPRuitor here and in createExportPanel...
    if (State.victim !== null && State.clues !== null && State.initial_search_area !== null) {
      const notes_for_clues = Array.from(document.querySelectorAll('.note-inner-content'))
        .map((el) => ({ id: el.id, content: el.innerHTML }))
        .filter((el) => el.content !== '' && el.content !== '...');

      createExportPanel({
        selector: 'body',
        infos: [State, notes_for_clues],
      });
    } else {
      swal({
        title: 'Attention',
        text: 'Aucune donnée à exporter',
        icon: 'warning',
        confirmButtonClass: 'btn-danger',
        confirmButtonText: 'OK',
        closeOnConfirm: false,
      });
    }
  },
});

commands.addCommand('app:load', {
  label: 'Ouvrir ...',
  mnemonic: 0,
  iconClass: 'fa fa-paste',
  execute: () => {
    const el = document.createElement('div');
    el.innerHTML = `Ouverture d'un fichier alerte ${APPLICATION_NAME} ....<br>`;
    swal({
      title: 'Ajout de données',
      buttons: {
        cancel: {
          text: 'Annulation',
          value: null,
          visible: true,
          closeModal: true,
        },
        confirm: {
          text: 'Parcourir ...',
          value: true,
          closeModal: true,
        },
      },
      content: el,
      dangerMode: true,
      icon: 'info',
    }).then((value) => {
      if (value !== null) {
        const input = document.createElement('input');
        input.setAttribute('accept', '.choucalerte');
        input.setAttribute('type', 'file');
        input.style.display = 'none';
        input.onchange = (event) => {
          if (event.target.files.length === 0) return;
          const file = event.target.files[0];
          const { name } = file;
          const rd = new FileReader();
          rd.onloadend = async () => {
            const [valid, tmp] = isValidJSON(rd.result);
            if (!valid || !tmp.type || tmp.type !== 'choucalerte') {
              return swal({
                title: '',
                text: 'Erreur lors de la lecture du fichier !',
                icon: 'error',
              });
            }
            State.initial_search_area = tmp.initial_search_area;
            State.map = tmp.map;
            State.victim = tmp.victim;
            State.currentBaseMap = tmp.currentBaseMap;
            // TODO: handle cluesRuitor and ZLPRuitor here ...
            State.cluesRuitor = await Promise.all(tmp.cluesRuitor.map(async (clue) => {
              // eslint-disable-next-line no-param-reassign
              clue.geotiffBlob = b64toBlob(
                clue._geotiffBlob.split('data:image/tiff;base64,')[1],
                'image/tiff',
              );
              // eslint-disable-next-line no-param-reassign
              clue._geotiffBlob = undefined;

              const {
                imageDescription,
              } = await processGeotiffToImageStatic(clue.geotiffBlob);

              const raster = makeRasterFromImageDescription(imageDescription);
              raster.on('beforeoperations', (ev) => {
                ev.data.color = getRgbArray(clue.colors.stroke); // eslint-disable-line no-param-reassign
                ev.data.reversed = false; // eslint-disable-line no-param-reassign
              });

              const layer = new Image({ source: raster });
              layer.setExtent(State.initial_search_area.bbox);

              State.map_widget.rasters[clue.clue_id] = layer;

              return clue;
            }));
            State.clues = tmp.clues;
            State.notes = tmp.notes;
            const map_view = State.map_widget.getMapView();
            map_view.setCenter(State.map.center);
            map_view.setZoom(State.map.zoom);
            return swal(`Fichier ${name} ajouté !`);
          };
          rd.readAsText(event.target.files[0]);
          input.remove();
        };
        document.body.appendChild(input);
        input.click();
      }
    });
  },
});

commands.addCommand('param:basemap', {
  label: 'Fond de carte',
  mnemonic: 0,
  iconClass: 'fa fa-paste',
  execute: () => {
    const trad_basemap_names = {
      OTM: 'OSM OpenTopoMap',
      OSMFR: 'OSM France',
      OSM: 'OpenStreetMap\'s standard tile layer',
      HUM: 'OSM Humanitarian map style',
      WMFLABSHB: 'Wikimedia fundation Hike & Bike map',
    };
    const el = document.createElement('div');
    el.innerHTML = `
<select onchange="swal.setActionValue(this.value);" class="form-control">
${Object.keys(basemapReferences)
    .map((k) => `<option value="${k}" ${(k === State.currentBaseMap) ? 'selected' : ''}>${trad_basemap_names[k]}</option>`)
    .join('')}
</select>`;
    swal({
      title: 'Changement de fond de carte',
      buttons: true,
      content: el,
    })
      .then((value) => {
        if (value !== null && value !== true) {
          State.currentBaseMap = value;
          swal('Changement du fond de carte effectué !', {
            icon: 'success',
          });
        }
      });
    swal.setActionValue(State.currentBaseMap);
  },
});
commands.addCommand('param:dataimport', {
  label: 'Ajouter d\'autres sources de données',
  mnemonic: 28,
  iconClass: 'fa fa-paste',
  execute: () => {
    const el = document.createElement('div');
    el.innerHTML = `Seuls les fichiers au format GeoJSON (ie. contenant un objet
GeoJSON de type 'FeatureCollection') sont acceptés.<br><br>Ces données seront
ajoutées à la carte mais ne peuvent pas servir d'objet de référence pour
la création d'indice.<br>`;
    swal({
      title: 'Ajout de données',
      buttons: {
        cancel: {
          text: 'Annulation',
          value: null,
          visible: true,
          closeModal: true,
        },
        confirm: {
          text: 'Parcourir ...',
          value: true,
          closeModal: true,
        },
      },
      content: el,
      dangerMode: true,
      icon: 'info',
    }).then((value) => {
      if (value !== null) {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', '.geojson');
        input.style.display = 'none';
        input.onchange = (event) => {
          if (event.target.files.length === 0) {
            swal({
              title: '',
              text: 'Erreur lors de la lecture du fichier - Aucun fichier sélectionné !',
              icon: 'error',
            });
            return;
          }
          const file = event.target.files[0];
          const { name } = file;
          const rd = new FileReader();
          rd.onloadend = () => {
            const [valid, tmp] = isValidJSON(rd.result);
            if (!valid || !tmp.type || tmp.type !== 'FeatureCollection') {
              return swal({
                title: '',
                text: 'Erreur lors de la lecture du fichier !',
                icon: 'error',
              });
            }
            const name_layer = `additional_${name.toLowerCase().replace('.geojson', '')}`;
            State.map_widget.addGeojsonLayer(
              name_layer,
              tmp.features,
              new Style({
                fill: new Fill({
                  color: '#123456',
                }),
                stroke: new Stroke({
                  color: '#abcdef',
                }),
              }),
            );
            DB[name_layer] = tmp.features;
            return swal({
              title: '',
              text: `Fichier ${name} ajouté !`,
              icon: 'success',
            });
          };
          rd.readAsText(event.target.files[0]);
          input.remove();
        };
        document.body.appendChild(input);
        input.click();
      }
    });
  },
});
commands.addCommand('param:ui', {
  label: 'Personnalisation de l\'interface',
  mnemonic: 0,
  iconClass: 'fa fa-paste',
  execute: () => {
    swal('', 'Fonctionnalité non-implémentée (Personnalisation de l\'interface) !', 'info');
  },
});
commands.addCommand('param:extra', {
  label: 'Options avancées...',
  mnemonic: 0,
  iconClass: 'fa fa-paste',
  execute: () => {
    swal('', 'Fonctionnalité non-implémentée (Options avancées...) !', 'info');
  },
});
commands.addCommand('app:close', {
  label: 'Fermer',
  mnemonic: 2,
  iconClass: 'fas fa-power-off',
  execute: () => {
    console.log('Close');
  },
});

commands.addCommand('tools:new_note', {
  label: 'Bloc note d\'indices',
  mnemonic: 0,
  iconClass: 'fas fa-align-left',
  execute: () => {
    const existing_note_widget = mainPanel.getWidget('noteWidget');
    if (!existing_note_widget) {
      mainPanel.getWidget('menuRight').addNoteWidget();
    }
  },
});
commands.addCommand('tools:legend_acitivity_layers', {
  label: 'Légende des couches additionnelles ...',
  mnemonic: 0,
  iconClass: 'fas fa-cloud',
  execute: () => {
    const existing_note_widget = mainPanel.getWidget('legendActivityLayer');
    if (!existing_note_widget) {
      mainPanel.getWidget('menuRight').addLegendActivityLayer();
    }
  },
});
commands.addCommand('tools:display_log', {
  label: 'Afficher les logs d\'utilisation',
  mnemonic: 0,
  iconClass: 'fas fa-align-justify',
  execute: () => {
    const log_widget = new LogWidget({ id: 'log1' });
    const dock_panel = mainPanel.getWidget('menuRight');
    dock_panel.addWidget(log_widget, {
      mode: 'split-bottom',
      ref: dock_panel.widgets[dock_panel.widgets.length - 1], // last dockpanel widget
    });
  },
});
commands.addCommand('help:tour', {
  label: 'Tour guidé de l\'application ...',
  mnemonic: 0,
  caption: 'CTRL+H',
  iconClass: 'fas fa-question-circle',
  execute: () => {
    const tour = makeTour();
    console.log(tour.start());
  },
});
commands.addCommand('help:man', {
  label: 'Manuel utilisateur',
  mnemonic: 0,
  iconClass: 'fas fa-question-circle',
  execute: () => {
    console.log('Man');
  },
});
commands.addCommand('help:version', {
  label: 'Informations de version',
  mnemonic: 0,
  iconClass: 'fa fa-info',
  execute: () => {
    displayInfoVersion();
  },
});
commands.addCommand('help:service', {
  label: 'État des services',
  mnemonic: 0,
  iconClass: 'fa fa-info',
  execute: () => {
    console.log('Version');
  },
});

commands.addCommand('ctx:new_ISA_bbox', {
  label: 'Zone Initiale de Recherche : Définir à partir de la vue actuelle',
  execute: () => {

  },
});
commands.addCommand('ctx:new_clue', {
  label: 'Créer un indice à partir de l\'objet',
  mnemonic: 9,
  execute: (options) => {
    createBoxClue(options);
  },
});
commands.addCommand('ctx:info-feature', {
  label: 'Information détaillée sur l\'objet',
  mnemonic: 0,
  execute: (ft) => {
    const uid = +ft.id;
    fetch(`http://localhost:8008/neo4j-info/${uid}`)
      .then((res) => res.json())
      .then((result) => {
        const node = document.createElement('div');
        node.innerHTML = makeInfoBox(result, uid);
        Toastify({
          node,
          duration: -1,
          close: true,
          gravity: 'top',
          position: 'center',
          backgroundColor: '#5bc0de',
        }).showToast();
      });
  },
});

// Register some keybindings :
commands.addKeyBinding({
  command: 'app:save',
  keys: ['Ctrl S'],
  selector: 'body',
});
commands.addKeyBinding({
  command: 'app:new',
  keys: ['Ctrl N'],
  selector: 'body',
});
commands.addKeyBinding({
  command: 'app:load',
  keys: ['Ctrl O'],
  selector: 'body',
});
commands.addKeyBinding({
  command: 'app:export',
  keys: ['Ctrl E'],
  selector: 'body',
});
commands.addKeyBinding({
  command: 'help:man',
  keys: ['Ctrl H'],
  selector: 'body',
});
// commands.addCommand('ctx:view3d', {
//   label: 'Voir dans la vue 3d',
//   mnemonic: 0,
//   iconClass: 'fa fa-paste',
//   execute: () => {
//     console.log('view3d');
//   },
// });
export default commands;
