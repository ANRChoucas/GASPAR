import * as itowns from 'itowns';

export const defaultZlpStyle = {
  fill: {
    color: 'rgb(250, 12, 12)',
    opacity: 0.3,
  },
  stroke: {
    color: 'rgb(250, 12, 12)',
    width: 2,
  },
};

export const defaultISAStyle = {
  fill: {
    color: 'rgb(255, 255, 255)',
    opacity: 0.0,
  },
  stroke: {
    color: 'rgb(255, 255, 255)',
    width: 3,
  },
};

export const getItownsStyleClueLayer = (fill, stroke) => ({
  fill: {
    color: fill,
    opacity: 0.6,
  },
  stroke: {
    color: stroke,
    width: 2,
  },
});

export const enrichContourLayerWithStyle = (collection) => {
  collection.features.forEach((feature) => {
    feature.geometry
      .forEach((geom) => {
        let strokeColor;
        let fillColor;
        // if (geom.properties.title === '0.00-0.12 ') {
        //   strokeColor = 'rgba(255, 255, 204, 0.0)';
        //   fillColor = 'rgba(255, 255, 204, 0.0)';
        // } else
        if (geom.properties.title === '0.01-0.20 ') {
          strokeColor = 'rgb(255, 237, 160)';
          fillColor = 'rgba(255, 237, 160, 0.8)';
        // } else if (geom.properties.title === '0.25-0.38 ') {
        //   strokeColor = 'rgb(254, 217, 118)';
        //   fillColor = 'rgb(254, 217, 118, 0.8)';
        } else if (geom.properties.title === '0.20-0.40 ') {
          strokeColor = 'rgb(254, 178, 76)';
          fillColor = 'rgba(254, 178, 76, 0.8)';
        } else if (geom.properties.title === '0.40-0.60 ') {
          strokeColor = 'rgb(253, 141, 60)';
          fillColor = 'rgba(253, 141, 60, 0.8)';
        } else if (geom.properties.title === '0.60-0.80 ') {
          strokeColor = 'rgb(252, 78, 42)';
          fillColor = 'rgba(252, 78, 42, 0.8)';
        // } else if (geom.properties.title === '0.75-0.88 ') {
        //   strokeColor = 'rgb(227, 26, 28)';
        //   fillColor = 'rgba(227, 26, 28, 0.8)';
        } else if (geom.properties.title === '0.80-1.00 ') {
          strokeColor = 'rgb(177, 0, 38)';
          fillColor = 'rgba(177, 0, 38, 0.8)';
        }
        // eslint-disable-next-line no-param-reassign
        geom.properties.style = new itowns.Style({
          fill: {
            color: fillColor,
            opacity: 0.6,
          },
          stroke: {
            color: strokeColor,
            width: 2,
          },
        });
      });
  });
  return collection;
};
