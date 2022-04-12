import 'toastify-js/src/toastify.css';
import 'ol/ol.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'pretty-checkbox/dist/pretty-checkbox.css';
import 'intro.js/minified/introjs.min.css';
import '../css/style.css';
import { DockPanel, Widget, SplitPanel } from '@lumino/widgets';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { State, stateHandler } from './state';
import DB from './DB';
import { tree, ref_neo4j_categories } from './model';
import { getChildrenWidgets, getNodes } from './helpers/main';
import MapWidget from './components/map_widget';
import createRightMenu from './components/menu_right';
import createLeftMenu from './components/menu_left';
import createMenuBar from './components/menubar';
import prepareValidators from './validation';
import commands from './commands';

proj4.defs(
  'EPSG:2154',
  '+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
);
register(proj4);

/**
* This is the entry point of the application, called when the document is loaded.
* It's responsible for instantiating the various widgets present when opening the page,
* namely:
*     - the top 'menubar',
*     - the left menu container widget,
*     - the right menu container
*         - the note widget
*     - the container for the map widget and the terrain widget
*         - the map widget
* It's also responsible for compiling our various JSON schemas, used later
* for validating purposes.
*
*/
async function onload() {
  // Saves the State object as a global variable.
  // Modifing values of this `State` object (when selecting the initial search area or
  // when creating a new clue for example) triggers the appropriate modifications
  // in the UI.
  window.State = State;

  // Store the model of tree structure that is gonna be
  // used to create the tree selectable objects..
  // TODO: we should handle the case where an error occurs here (network, etc.)
  const _tree = await (await fetch('http://localhost:8008/neo4j-gaspar-tree')).json();
  Object.assign(tree, _tree);
  ref_neo4j_categories.push(...getNodes(tree));

  // Prepare the various UI components:
  const menuBar = createMenuBar();
  const menuLeft = createLeftMenu();
  const menuRight = createRightMenu();
  const map_terrain_container = new DockPanel();
  map_terrain_container.id = 'map-terrain-container';
  State.map_widget = new MapWidget({ id: 'map1' }); // TODO: Dont attach the map_widget here !
  map_terrain_container.addWidget(State.map_widget);
  const main = new SplitPanel({ spacing: 0 });
  main.id = 'main';
  main.addWidget(menuLeft);
  main.addWidget(map_terrain_container);
  main.addWidget(menuRight);
  main.setRelativeSizes([2, 7, 2]);
  // Get a child or a subchild widget by its id:
  main.getWidget = (id) => getChildrenWidgets(main, id);
  // TODO : allow to get a widget by its type

  // On window resize, resize the main widget (will propagate the information
  // to its child widgets).
  window.onresize = () => {
    main.update();
  };
  Widget.attach(menuBar, document.body);
  Widget.attach(main, document.body);

  // Todo : ....
  window.mainPanel = main;
  window.menuBar = menuBar;
  // Manualy triggers the first resize on the map once all
  // our components are mounted:
  setTimeout(() => { State.map_widget._map.updateSize(); }, 125);

  window.addEventListener('popstate', stateHandler.popstate);
  // Setup the keydown & keyup listeners for this document
  document.addEventListener('keydown', (event) => {
    commands.processKeydownEvent(event);
    // Allows some new cursor interactions on the map
    // while the 'shift' key is pressed
    // State.map_widget._map.removeInteraction(State.map_widget.selectInteraction);
    // State.map_widget._map.removeEventListener('pointermove');
  });
  window.addEventListener('keyup', (ev) => {
    if (ev.key === 'Escape' || ev.code === 'Escape') {
      // Discards everything (popups / contextmenu / etc.)
      // when the 'escape' key is pressed
      document.querySelectorAll('.card-container')
        .forEach((el) => { el.remove(); });
    }
  });

  // Save the json schema validators as a global variable too:
  prepareValidators()
    .then((validators) => {
      window.validators = validators;
    });
  // Next line is not necessary (only for debug purpose)
  // and can be removed when needed
  window.__DB_GASPAR = DB;
}

window.onload = onload;
