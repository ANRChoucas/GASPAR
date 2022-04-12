import {
  Circle, Fill, Stroke, Style,
} from 'ol/style';
import { default_tree_colors } from '../model';

export const isa_default_style = new Style({
  stroke: new Stroke({
    color: 'orange',
  }),
  fill: new Fill({
    color: 'rgba(234, 237, 255, 0.8)',
  }),
});

export const contours_default_style = new Style({
  stroke: new Stroke({
    color: 'rgb(252,12,12)',
    width: 2.8,
  }),
});

export const contours_style_func = (feature, resolution) => {
  const value = feature.get('title');
  let strokeColor;
  if (value === '0.00-0.12 ') {
    strokeColor = 'rgb(255, 255, 204)';
  } else if (value === '0.12-0.25 ') {
    strokeColor = 'rgb(255, 237, 160)';
  } else if (value === '0.25-0.38 ') {
    strokeColor = 'rgb(254, 217, 118)';
  } else if (value === '0.38-0.50 ') {
    strokeColor = 'rgb(254, 178, 76)';
  } else if (value === '0.50-0.62 ') {
    strokeColor = 'rgb(253, 141, 60)';
  } else if (value === '0.62-0.75 ') {
    strokeColor = 'rgb(252, 78, 42)';
  } else if (value === '0.75-0.88 ') {
    strokeColor = 'rgb(227, 26, 28)';
  } else if (value === '0.88-1.00 ') {
    strokeColor = 'rgb(177, 0, 38)';
  }

  return new Style({
    stroke: new Stroke({
      color: strokeColor,
      width: 1.8,
    }),
  });
};

export const tree_feature_default_style = new Style({
  stroke: new Stroke({
    color: 'rgba(12, 12, 200, 0.001)',
    width: 0.75,
  }),
  fill: new Fill({
    color: 'rgba(12, 12, 200, 0.001)',
  }),
});

export const tree_feature_default_style_pt = new Style({
  image: new Circle({
    radius: 5,
    stroke: new Stroke({
      color: 'rgba(12, 12, 200, 0.001)',
      width: 0,
    }),
    fill: new Fill({
      color: 'rgba(12, 12, 200, 0.001)',
    }),
  }),
});

export const zlp_default_style = new Style({
  stroke: new Stroke({
    color: 'red',
    width: 4,
  }),
  fill: new Fill({
    color: 'rgba(250, 12, 12, 0.4)',
  }),
});

const cache_hover_style = {
  circle: (cat) => new Style({
    image: new Circle({
      radius: 5,
      stroke: new Stroke({
        color: default_tree_colors.get(cat) || 'red',
        width: 4,
      }),
    }),
  }),
  default: (cat) => new Style({
    stroke: new Stroke({
      color: default_tree_colors.get(cat) || 'red',
      width: 4,
    }),
  }),
};

export const getHoverStyle = (ft) => {
  const cat = ft.getProperties()['CHOUCAS_CLASS'];
  return ['Point', 'MultiPoint'].indexOf(ft.getGeometry().getType()) > -1
    ? cache_hover_style.circle(cat)
    : cache_hover_style.default(cat);
};

export const getAdditionalLayerStyle = (ft, color) => (
  ['Point', 'MultiPoint'].indexOf(ft.getGeometry().getType()) === 0
    ? new Style({
      image: new Circle({
        radius: 5,
        stroke: new Stroke({
          color,
          width: 4,
        }),
      }),
    })
    : new Style({
      stroke: new Stroke({ color, width: 4 }),
    })
);

export const getStyleClueLayer = (fillColor, strokeColor, strokeWidth = 3) => new Style({
  stroke: new Stroke({
    color: strokeColor,
    width: strokeWidth,
  }),
  fill: new Fill({
    color: fillColor,
  }),
});
