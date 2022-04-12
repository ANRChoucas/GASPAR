import '../../css/notes.css';
import { transform } from 'ol/proj';
import { Widget } from '@lumino/widgets';
import { v4 as uuidv4 } from 'uuid';
import { getTargetFromClue, processNercResult } from '../helpers/clue_transformation';
import commands from '../commands';
import ContextMenu from './context_menu';
import DB from '../DB';
import common_words from '../helpers/common_words';
import {
  debounce, displayNotification, setCaretEnd, toLowerCaseNoAccent,
} from '../helpers/main';
import { click_use_current_bbox } from '../init_search_area';
import { callServiceGeocoding, callServiceNerc, callServiceParseClue } from '../services_call';

const moveToResultsGeocoding = (place_name) => {
  callServiceGeocoding({
    place_name,
    osm_key: 'place',
  }).then((result) => {
    const best_result = result.features[0];
    if (best_result) {
      const map_view = State.map_widget.getMapView();
      map_view.setCenter(transform(best_result.geometry.coordinates, 'EPSG:4326', 'EPSG:3857'));
      map_view.setZoom(best_result.properties.osm_value === 'city' ? 12 : 13);
      displayNotification(
        `Meilleure réponse : <b>${best_result.properties.name} (${best_result.properties.state})</b>`,
        'success',
      );
    } else {
      throw new Error(`Pas de résultat pour '${place_name}'`);
    }
  }).catch((e) => {
    displayNotification(
      `Une erreur s'est produite lors de l'appel au service : ${e}`,
      'error',
      5000,
    );
  });
};

const context_menu = new ContextMenu();

const displayNoteContextMenu = function displayNoteContextMenu(_e) {
  _e.preventDefault();
  _e.stopPropagation();
  const note = this;
  const note_content = note.innerHTML;
  const widget = mainPanel.getWidget('noteWidget');
  if (note_content.startsWith('<del>')) {
    context_menu.showMenu(_e, document.body, [
      { name: 'Supprimer le fragment de texte', action: () => { this.remove(); widget.saveNotes(); } },
    ]);
  } else if (State.initial_search_area !== null) {
    context_menu.showMenu(_e, document.body, [
      {
        name: 'Créer un indice à partir du fragment de texte ...',
        action: async () => {
          // The idea is that we launch two requests : one to spacy (in gaspar python server),
          // one to the NERC service (from LMAP / Pau Univ.).
          // Spacy is faster but returns less good results.
          // The first one to succeed is used to pre-fill the clue box.
          // If none succeed, an error toast notification is displayed.
          let hasSuccess = false;
          let err = '';

          const a = callServiceNerc(note_content)
            .then((res) => {
              const infoClue = processNercResult(res);
              console.log(infoClue);
              const type_relation = 'Spatialisation';
              const service_options = {}; // TODO: for the distance modifier...
              let clue_target;

              if (infoClue.namesNPr.length !== 0) {
                const name = infoClue.namesNPr[0].toLowerCase();
                console.log(name);
                // The name of all our spatial features
                const values = Array.from(document.querySelectorAll('.end-node'))
                  .map((el) => [el.innerHTML.toLowerCase(), el.getAttribute('cat'), el.getAttribute('ft_id')])
                  .filter((v) => v[0].indexOf('unnamed') < 0); // Exclude the 'Unnamed' features
                const match = values.filter((d) => d[0] === name);
                // There might be multiple matches but we don't take this into account for
                // now as it's more a POC for parsing clues than a fully working implementation
                // ... we could warn the user though...
                if (match.length > 0) {
                  const [, category, ft_id] = match[0];
                  const ft = DB[`ref_${category}`].find((f) => f.id === +ft_id);
                  clue_target = {
                    category,
                    type: 'ESR',
                    feature: ft,
                  };
                  if (!hasSuccess) {
                    hasSuccess = true;
                    commands.execute('ctx:new_clue', {
                      infos: {
                        clue_natural_language: note_content,
                        location_relation: {
                          target: clue_target,
                          type_relation,
                          service_options,
                        },
                      },
                      cb_success: () => { this.innerHTML = `<del>${this.innerHTML}</del>`; widget.saveNotes(); },
                    });
                  }
                }
              }
              if (!hasSuccess) {
                err = 'Pas de correspondance trouvée pour l\'objet ou la catégorie d\'objets demandé.';
              }
            });

          const b = callServiceParseClue(note_content)
            .then(({ part_of_speech, named_entities }) => {
              // Get the type of spatal relation (Voit, est à coté de, etc.)
              const type_relation = 'Spatialisation'; // getTabFromClue(note_content);
              // Does the text contain some distance value in meter...
              const hasDistanceMeter = !!part_of_speech.find((d) => d[1] === 'NUM')
                && (
                  !!part_of_speech.find((d) => d[2] === 'm')
                  || !!part_of_speech.find((d) => toLowerCaseNoAccent(d[2]) === 'metre')
                );

              const service_options = {}; // TODO: for the distance modifier...

              // Lets build the target object to fill the clue box to be opened...
              let clue_target;
              let err;
              if (named_entities.length === 0) {
                // We have a category of objects
                clue_target = getTargetFromClue(note_content, type_relation);
                if (!clue_target) {
                  err = 'Pas de correspondance trouvée pour l\'objet ou la catégorie d\'objets demandé.';
                }
              } else {
                // We have a named entity so we are trying to match its name
                // against one of our reference features...
                const name = named_entities[0][0].toLowerCase();
                const values = Array.from(document.querySelectorAll('.end-node'))
                  .map((el) => [el.innerHTML.toLowerCase(), el.getAttribute('cat'), el.getAttribute('ft_id')])
                  .filter((v) => v[0].indexOf('unnamed') < 0); // Exclude the 'Unnamed' features
                const match = values.filter((d) => d[0] === name);
                // There might be multiple matches but we don't take this into account for
                // now as it's more a POC for parsing clues than a fully working implementation
                // ... we could warn the user though...
                if (match.length > 0) {
                  const [, category, ft_id] = match[0];
                  const ft = DB[`ref_${category}`].find((f) => f.id === +ft_id);
                  clue_target = {
                    category,
                    type: 'ESR',
                    feature: ft,
                  };
                } else {
                  err = `Pas de correspondance trouvée pour : "${named_entities[0][0]}". \
                    Essayez une recherche dans l'arbre des objets ou avec tous les objets du même type.`;
                }
              }
              if (clue_target && !hasSuccess) {
                hasSuccess = true;
                commands.execute('ctx:new_clue', {
                  infos: {
                    clue_natural_language: note_content,
                    location_relation: {
                      target: clue_target,
                      type_relation,
                      service_options,
                    },
                  },
                  cb_success: () => { this.innerHTML = `<del>${this.innerHTML}</del>`; widget.saveNotes(); },
                });
              }
            }).catch((e) => {
              displayNotification(
                `Une erreur s'est produite lors de l'appel au service : ${e}`,
                'error',
              );
              console.log(e);
            });

          await Promise.all([a, b]);
          if (!hasSuccess) {
            displayNotification(err, 'error');
          }
        },
      },
      { type: 'separator' },
      { name: 'Marquer comme déjà transformé en indice', action: () => { this.innerHTML = `<del>${this.innerHTML}</del>`; widget.saveNotes(); } },
      { name: 'Supprimer le fragment de texte', action: () => { this.remove(); widget.saveNotes(); } },
    ]);
  } else {
    const options = [
      { name: 'Utiliser le fragment de texte pour définir la Zone Initiale de Recherche', action: () => { click_use_current_bbox(); } },
      { type: 'separator' },
      { name: 'Supprimer le fragment de texte', action: () => null },
    ];
    const selected_text = window.getSelection().toString();
    if (selected_text.length > 0) {
      options.push({ type: 'separator' });
      options.push({
        name: `Rechercher le lieu ''${selected_text}''...`,
        action: () => { moveToResultsGeocoding(selected_text); },
      });
    }
    context_menu.showMenu(_e, document.body, options);
  }
};

class Note extends Widget {
  static createNode({ id }) {
    const note = document.createElement('div');
    note.id = id;
    note.className = 'note';
    note.style.fontSize = '24px';
    note.innerHTML = '<ul></ul>';
    return note;
  }

  constructor(options) {
    super({ node: Note.createNode(options) });
    this.title.label = 'Bloc note indices';
    this.title.closable = true;
    this.title.caption = 'Bloc note de saisie des indices en langage naturel';
    this.title.className = 'note-title-tab';
  }

  inputNode() {
    const elems = this.node.querySelectorAll('ul > li');
    return elems[elems.length - 1];
  }

  onActivateRequest(_msg) { // eslint-disable-line no-unused-vars
    // console.log(_msg);
    if (this.isAttached) {
      this.inputNode().focus();
    }
  }

  createNewNote(id, content = '') {
    const note_parent = this.node.querySelector('ul');
    const p = document.createElement('li');
    p.id = id;
    p.className = 'note-inner-content';
    p.setAttribute('contenteditable', 'true');
    p.innerHTML = content;
    note_parent.appendChild(p);
    return p;
  }

  saveNotes() {
    State.notes = Array.from(this.node.querySelectorAll('.note-inner-content'))
      .map((el) => ({ id: el.id, content: el.innerHTML }));
  }

  onAfterAttach() {
    const self = this;
    const updateState = debounce(() => {
      if (this && this.isAttached) {
        this.saveNotes();
      }
    }, 1500);
    let results = [];
    let results_index = 0;

    const keyupnote = function keyupnote(ev) {
      if (document.getElementById('autocomplete')) {
        document.getElementById('autocomplete').remove();
      }
      if (ev.key.length === 1 || ev.key === 'Backspace' || ev.code === 'Backspace') {
        if (this.firstChild) {
          const words = this.firstChild.textContent.split(' ');
          const search = words[words.length - 1].toLowerCase();
          if (search.length >= 3) {
            if (results.length <= 0) {
              results_index = 0;
              Object.keys(DB).forEach((category) => {
                if (category.startsWith('ref_') || category.startsWith('activity_')) {
                  DB[category].forEach((value) => {
                    if (value.properties.name !== null) {
                      let true_value = value.properties.name.toLowerCase();
                      if (true_value.startsWith(search)) {
                        results.push(true_value);
                      }
                      const exploded_value = true_value.split(/ |'/);
                      if (common_words.includes(exploded_value[0])) {
                        exploded_value.splice(0, 1);
                      }
                      true_value = exploded_value.join(' ');
                      if (true_value.startsWith(search)) {
                        results.push(true_value);
                      }
                    }
                  });
                }
              });
              results = results.filter((a, b) => results.indexOf(a) === b);
            } else {
              results_index = results.findIndex((value) => value.toLowerCase()
                .startsWith(search));
            }
            if (results_index >= 0 && results.length > 0) {
              const selection = window.getSelection();
              const range = document.createRange();
              const regEx = new RegExp(words[words.length - 1], 'ig');
              const span_node = document.createElement('span');
              span_node.className = 'autocomplete';
              span_node.id = 'autocomplete';
              span_node.innerHTML = results[results_index].replace(regEx, '');
              this.innerHTML += span_node.outerHTML;
              range.setStart(this.firstChild, this.firstChild.textContent.length);
              range.setEnd(this.firstChild, this.firstChild.textContent.length);
              selection.removeAllRanges();
              selection.addRange(range);
            }
          } else {
            results = [];
          }
        }
      }
    };

    const keydownnote = function keydownnote(ev) {
      if (ev.key === 'Enter' || ev.code === 'Enter') {
        ev.preventDefault();
        ev.stopPropagation();
        const p = self.createNewNote(`note_${uuidv4()}`);
        p.focus();
        p.onkeydown = keydownnote;
        p.onkeyup = keyupnote;
        p.oncontextmenu = displayNoteContextMenu;
        // setCaretEnd(p);
      } else if (
        this.innerHTML.length <= 1
        && self.node.querySelectorAll('.note-inner-content').length !== 1
        && (ev.key === 'Backspace' || ev.code === 'Backspace')
      ) {
        const previous = this.previousElementSibling;
        this.remove();
        previous.focus();
        setCaretEnd(previous);
      }
      if (ev.key === 'Tab') {
        ev.preventDefault();
        if (document.getElementById('autocomplete')) {
          const autocomplete_el = document.getElementById('autocomplete');
          const value = autocomplete_el.innerText;
          autocomplete_el.remove();
          this.innerHTML += value;
          const selection = window.getSelection();
          const range = document.createRange();
          range.setStart(this.firstChild, this.firstChild.textContent.length);
          range.setEnd(this.firstChild, this.firstChild.textContent.length);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
      updateState();
    };

    this.updateNotes = (notes) => {
      const existing_ids = Array.from(
        this.node.querySelectorAll('.note-inner-content'),
      ).map((d) => d.id);
      const wanted_ids = notes.map((d) => d.id);

      existing_ids.forEach((id) => {
        if (wanted_ids.indexOf(id) < 0) {
          this.node.querySelector(`#${id}`).remove();
        }
      });

      // Use the default empty note with the three dots if the bloc is completely empty
      (notes.length > 0 ? notes : [{ id: `note_${uuidv4()}`, content: '...' }])
        .forEach(({ id, content }, ix) => {
          let p_note;
          if (existing_ids.indexOf(id) > -1) {
            p_note = this.node.querySelector(`#${id}`);
          } else {
            p_note = this.createNewNote(id, content);
            p_note.onkeydown = keydownnote;
            p_note.onkeyup = keyupnote;
            p_note.oncontextmenu = displayNoteContextMenu;
          }
          if (ix === notes.length - 1) {
            p_note.focus();
          }
        });
    };
    this.updateNotes(State.notes);
  }

  onCloseRequest(msg) { // eslint-disable-line no-unused-vars
    State.notes = Array.from(this.node.querySelectorAll('.note-inner-content'))
      .map((el) => ({ id: el.id, content: el.innerHTML }));
    if (this.parent) {
      this.parent = null;
    } else if (this.isAttached) {
      Widget.detach(this);
    }
  }
}

export default Note;
