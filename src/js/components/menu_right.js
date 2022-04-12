import '../../css/menu_right.css';
import { DockPanel, Widget } from '@lumino/widgets';
import { chainIterToArray } from '../helpers/main';
import Note from './note_widget';

const makeLegendActivityLayerWidget = () => {
  const legend_activity_layer = new Widget();
  legend_activity_layer.id = 'legendActivityLayer';
  legend_activity_layer.title.label = 'Couches supplémentaires';
  legend_activity_layer.title.closable = true;
  legend_activity_layer.node.innerHTML = `
<div id="legend-activity">
  <div id="legend_drawing_zone"></div>
</div>`;
  return legend_activity_layer;
};

export default function createRightMenu() {
  const menu_right = new DockPanel();
  menu_right.id = 'menuRight';

  menu_right.addNoteWidget = () => {
    menu_right.addWidget(new Note({ id: 'noteWidget' }), {
      mode: 'split-top',
    });
  };
  menu_right.addLegendActivityLayer = () => {
    menu_right.addWidget(makeLegendActivityLayerWidget(), {
      ref: menu_right.widgets().next(),
      mode: 'split-bottom',
    });
  };
  menu_right.onAfterAttach = function menurightonafterattach() {
    this.addNoteWidget();
    // this.addLegendActivityLayer();
    this.onChildAdded = (msg) => { // eslint-disable-line no-unused-vars
      // Unfold this DockPanel if it's the first widget being added to it:
      if (chainIterToArray(this.widgets()).length === 0) {
        const rel_sizes = mainPanel.relativeSizes();
        mainPanel.setRelativeSizes([
          rel_sizes[0], 1 - rel_sizes[0] - 1 / 5.26, 1 / 5.26,
        ]);
      }
    };
    this.onChildRemoved = (msg) => { // eslint-disable-line no-unused-vars
      if (chainIterToArray(this.widgets()).length === 0) {
        // Collapse this DockPanel if it doesn't contain anything anymore
        const rel_sizes = mainPanel.relativeSizes();
        mainPanel.setRelativeSizes([
          rel_sizes[0], 1 - rel_sizes[0], 0,
        ]);
      }
    };
  };
  return menu_right;
}
