import {
  Circle, Fill, RegularShape, Stroke, Style,
} from 'ol/style';

const cacheProportionnalCircleBlack = {};
const cacheProportionnalCircleRed = {};

export const propsymbol_default_style = (feature, resolution) => {
  const _value = feature.get('value');
  // We dont display anything for values inferior to 0.02
  if (_value < 0.02) return null;

  const reference_resolution = 3.1;
  // const reference_resolution = getResolutionZlp(State.ZLPRuitor.zlp_id);

  // TODO: use something that costs less based on the "resolution" argument
  if (State.map_widget.getMapView().getZoom() > 14.5) {
    // Compute the radius ..
    const radius = Math.sqrt(_value / 1) * 5.4; // Math.sqrt((value * 100) / Math.PI);
    const scale = reference_resolution / resolution;
    const scaledRadius = radius * scale;
    // Make a key for the cache..
    const roundedScaledRadius = Math.round(scaledRadius * 100) / 100;
    if (!(cacheProportionnalCircleBlack[roundedScaledRadius])) {
      cacheProportionnalCircleBlack[roundedScaledRadius] = new Style({
        image: new Circle({
          radius: roundedScaledRadius,
          fill: new Fill({
            color: 'rgb(0,0,0)',
          }),
        }),
      });
    }
    return cacheProportionnalCircleBlack[roundedScaledRadius];
  } else {
    // We fix the value so that the symbol is slightly larger than the pixel size
    // (this is voluntary as this portrayal is only used at low scale level)
    const value = 1.4;
    // Compute the radius ..
    const radius = Math.sqrt(value) * 5.4;

    const scale = reference_resolution / resolution;
    const scaledRadius = radius * scale;
    // Make a key for the cache..
    const roundedScaledRadius = Math.round(scaledRadius * 100) / 100;
    if (!(cacheProportionnalCircleRed[roundedScaledRadius])) {
      cacheProportionnalCircleRed[roundedScaledRadius] = new Style({
        image: new RegularShape({
          stroke: new Stroke({
            color: 'rgba(255, 0, 0, 1)',
            width: 1,
          }),
          fill: new Fill({
            color: 'rgba(255, 0, 0, 1)',
          }),
          points: 4,
          radius: roundedScaledRadius,
          angle: Math.PI / 4,
        }),
      });
    }
    return cacheProportionnalCircleRed[roundedScaledRadius];
  }
};
