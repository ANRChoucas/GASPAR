import '../../css/feature_tree.css';
import { GeoJSON } from 'ol/format';
import { Widget } from '@lumino/widgets';
import fuzzysearch from 'fuzzysearch';
import commands from '../commands';
import ContextMenu from './context_menu';
import DB from '../DB';
import {
  debounce, findAllByKey, flattenObject, makeTree,
} from '../helpers/main';
import { ref_neo4j_categories, tree } from '../model';

const context_menu_tree = new ContextMenu();
const geojson = new GeoJSON({ featureProjection: 'EPSG:3857' });

function featureTreeContextMenu(_e, ft) {
  context_menu_tree.showMenu(_e, document.body, [
    {
      name: 'Créer un indice à partir de l\'objet de référence ...',
      action: () => {
        commands.execute('ctx:new_clue', {
          infos: {
            location_relation: {
              target: {
                type: 'ESR',
                feature: ft,
                category: ft.properties.CHOUCAS_CLASS,
              },
            },
          },
        });
      },
    },
    { type: 'separator' },
    {
      name: 'Afficher plus d\'informations sur l\'objet',
      action: () => {
        commands.execute('ctx:info-feature', ft);
      },
    },
    { type: 'separator' },
    {
      name: 'Zoomer sur l\'objet',
      action: () => {
        const ol_ft = new GeoJSON()
          .readFeature(ft, {
            featureProjection: 'EPSG:3857',
          });
        State.map_widget.getMapView()
          .fit(ol_ft.getGeometry(), {
            padding: [30, 30, 30, 30],
            minResolution: 8,
          });
      },
    },
  ]);
}

function ESCCategoryTreeContextMenu(_e, categ) {
  context_menu_tree.showMenu(_e, document.body, [
    {
      name: 'Créer un indice à partir des objets candidats ...',
      action: () => {
        console.log(categ);
        let features;
        // The logic here to select features when a category at arbitrary depth s selected in the
        // tree is pretty bad for now...
        if (ref_neo4j_categories.indexOf(categ) > -1) {
          features = DB[`ref_${categ}`];
        } else {
          features = [];
          const t = flattenObject(
            JSON.parse(
              JSON.stringify(
                findAllByKey(tree, categ)[0],
              )
                .replaceAll('{}', 'null'),
            ),
          );
          Object.keys(t)
            .forEach((_categ) => {
              if (DB[`ref_${_categ}`]) { // maybe its empty so we check that
                features = features.concat(DB[`ref_${_categ}`]);
              }
            });
        }
        console.log(features);
        commands.execute('ctx:new_clue', {
          infos: {
            location_relation: {
              target: {
                type: 'ESC',
                category: categ,
                features,
              },
            },
          },
        });
      },
    },
    // { type: 'separator' },
    // { name: 'Afficher plus d\'informations sur les objets', action: () => { } },
  ]);
}

const onFeatureTreeContextMenu = function onFeatureTreeContextMenu(e) {
  const feature_id = this.getAttribute('ft_id');
  const category = this.getAttribute('cat');
  featureTreeContextMenu(e, DB[`ref_${category}`].find((f) => f.id === +feature_id));
};

const onFeatureTreeMouseOver = function onFeatureTreeMouseOver(e) {
  e.stopPropagation();
  const feature_id = this.getAttribute('ft_id');
  const category = this.getAttribute('cat');
  State.map_widget.addHoverFeatures([
    geojson.readFeature(
      DB[`ref_${category}`].find((f) => f.id === +feature_id),
      { featureProjection: 'EPSG:3857' },
    ),
  ]);
};

const onFeatureTreeMouseOut = () => {
  State.map_widget.removeHoverFeatures();
};

const onCategoryTreeContextMenu = function onCategoryTreeContextMenu(e) {
  ESCCategoryTreeContextMenu(e, this.id);
};

const onCategoryTreeMouseOver = function onCategoryTreeMouseOver() {
  State.map_widget.addHoverFeatures(
    geojson.readFeatures(
      {
        type: 'FeatureCollection',
        features: DB[`ref_${this.id}`]
      },
      { featureProjection: 'EPSG:3857' },
    ),
  );
};

const onCategoryTreeMouseOut = () => {
  State.map_widget.removeHoverFeatures();
};

export class FeatureTree extends Widget {
  static createNode({ id }) { // eslint-disable-line class-methods-use-this
    const node = document.createElement('div');
    node.id = id;
    node.className = 'bottom-box';
    node.innerHTML = `
    <div class="tree-loader-container" style="display:none;">
      <div class="tree-loader">
        <div class="tree-loader-anim"></div>
      </div>
    </div>
    <div id="treetreetree" class="disabled menuflex">
      <div class="tree-title">
        <i class="fas fa-database"></i>
        <label>Objets du territoire</label>
      </div>
      <div class="tree-search">
        <input aria-label="Recherche d'objets" placeholder="Rechercher des objets dans l'arbre ..."></input>
      </div>
      <div class="tree-container">
        ${makeTree(tree)}
      </div>
    </div>`;
    return node;
  }

  constructor(options = {}) {
    super({ node: FeatureTree.createNode(options) });
    this.title.label = 'Objets du territoire';
    this.title.closable = false;
  }

  toogleLoader(state) {
    if (state === true) {
      this.node.querySelector('.tree-loader-container').style.display = null;
    } else {
      this.node.querySelector('.tree-loader-container').style.display = 'none';
    }
  }

  /**
   * Updates the item tree, after setting the value of the initial search area.
   * @param {Array} results
   * @return {void}
   *
   */
  updateEntries(results) {
    // Remove all the existing end nodes in any case
    this.node
      .querySelectorAll('.end-node')
      .forEach((el) => {
        el.remove();
      });

    // Deactivate the tree and return early if there is no items...
    if (!results) {
      this.node
        .querySelectorAll('li > i') // eslint-disable-next-line no-param-reassign
        .forEach((el) => {
          el.className = 'fas fa-folder-plus';
        });
      this.node
        .querySelector('ul')
        .querySelectorAll('ul')
        .forEach((el) => {
          el.classList.add('hidden');
        });

      this.node.querySelectorAll('cnode')
        .forEach((el) => {
          el.classList.add('disabled');
        });
      const input_elem = this.node.querySelector('.tree-search > input');
      input_elem.value = '';
      input_elem.onkeyup = null;
      return;
    }

    // ..otherwise, for each category, add the corresponding item in the tree
    // and binds the various action (mouseover, contextmenu, etc.)
    results.forEach(([category, features]) => {
      if (ref_neo4j_categories.indexOf(category) < 0) {
        console.log(`Skipped ${features.length} features in category ${category}...`);
        return; // We only add features to the terminal node of our tree ...
      }

      // const container = this.node.querySelector(`ul#sublist-${category}`);
      const container = document.getElementById(`sublist-${category}`); // TODO : XXX
      const li_elem_title_category = container.previousElementSibling;
      // Enable this node as it contains features...
      li_elem_title_category.classList.remove('disabled');
      // Add the number of features for this category in a small badge at the end of the line
      li_elem_title_category.querySelector('.badge').innerHTML = features.length || '';

      li_elem_title_category.onmouseover = onCategoryTreeMouseOver;
      li_elem_title_category.onmouseout = onCategoryTreeMouseOut;
      features.forEach((ft) => {
        const li = document.createElement('li');
        li.setAttribute('cat', category);
        li.setAttribute('ft_id', ft.id);
        li.className = 'end-node';
        li.innerHTML = ft.properties.name || `Unamed (id: ${ft.id})`;
        li.oncontextmenu = onFeatureTreeContextMenu;
        li.onmouseover = onFeatureTreeMouseOver;
        li.onmouseout = onFeatureTreeMouseOut;
        container.appendChild(li);
      });
    });
    const parent = this.node.querySelector('.tree-container > ul');
    // Fetch all the entries right now to use them in the keyup event:
    const entries = Array.from(parent.querySelectorAll('.end-node'));
    // Hide all the end nodes and fetch their values
    const title_section = this.node.querySelector('.tree-title');
    const values = entries
      .map((el, i) => [el.innerHTML.toLowerCase(), el.getAttribute('cat'), i])
      .filter((v) => v[0].indexOf('unamed') < 0); // Exclude the 'Unamed' features
    const nb_values = values.length;

    // What happens when the user is typing some text in the input element
    // of the feature tree :
    const fuzzylistmatch = function fuzzylistmatch() {
      const input_string = this.value.toLowerCase();

      // First of all, hide all the section
      parent.querySelectorAll('ul:not(.hidden)')
        .forEach((el) => {
          el.classList.add('hidden');
          // eslint-disable-next-line no-param-reassign
          el.previousElementSibling
            .querySelector('i.fas').className = 'fas fa-folder-plus';
        });

      // If the input string is empty we want to restore the tree in it's
      // initial state
      if (input_string.trim() === '') {
        // Restore the visibility of all the end nodes
        entries.forEach((el) => {
          el.classList.remove('hidden');
        });
        // Set the state of the title as "not filtered"
        title_section.innerHTML = `
          <i class="fas fa-database"></i> \
          <label>Objets du territoire</label>`;
      } else { // There is an input string, we want to display the filtered tree
        // Hide all the end nodes and fetch their values
        entries.forEach((el) => {
          el.classList.add('hidden');
        });
        // Try to match the input string with our values
        const matched = [];
        const display_category = new Set();
        for (let _ix = 0; _ix < nb_values; _ix++) {
          const [name, category, id] = values[_ix];
          if (fuzzysearch(input_string, name)) {
            matched.push(id);
            display_category.add(category);
          }
        }
        // Unhide the matched values...
        matched.forEach((ix) => {
          entries[ix].classList.remove('hidden');
        });
        // .. and their (grand) parent nodes :
        display_category.forEach((category) => {
          // const ul = parent.querySelector(`#sublist-${category}`);
          const ul = document.getElementById(`sublist-${category}`); // TODO : XXX
          ul.classList.remove('hidden');
          const title = ul.previousElementSibling;
          title.querySelector('i.fas').className = 'fas fa-folder-minus';
          const _p = title.parentElement;
          // const _p = parent.querySelector(`#sublist-${title.getAttribute('pcat')}`);
          _p.classList.remove('hidden');
          _p.previousElementSibling.querySelector('i.fas').className = 'fas fa-folder-minus';
        });
        // Set the state of the title as being "filtered"
        title_section.innerHTML = `
          <span class="fa-stack fa-1x"> \
            <i class="fas fa-database fa-stack-1x"></i> \
            <i class="fas fa-filter fa-stack-1x"></i> \
          </span>
          <label>Objets du territoire</label>`;
      }
    };

    // Listen no-more than every 150ms
    this.node.querySelector('.tree-search > input').onkeyup = debounce(fuzzylistmatch, 150);
  }

  onAfterAttach(msg) {
    super.onAfterAttach(msg);
    const parent = this.node.querySelector('#treetreetree');
    parent.querySelectorAll('.cnode, .pnode')
      .forEach((elem) => {
        elem.oncontextmenu = onCategoryTreeContextMenu; // eslint-disable-line no-param-reassign
      });

    // Hide / display when user click on category names:
    parent.querySelectorAll('.cnode, .pnode')
      .forEach((el) => {
        el.onclick = () => { // eslint-disable-line no-param-reassign
          const icon = el.querySelector('i.fas');
          icon.classList.toggle('fa-folder-minus');
          icon.classList.toggle('fa-folder-plus');
          el.nextElementSibling.classList.toggle('hidden');
          if (el.matches('.cnode')) {
            const badge = el.querySelector('.badge');
            badge.classList.toggle('hidden');
          }
        };
      });
  }

}
