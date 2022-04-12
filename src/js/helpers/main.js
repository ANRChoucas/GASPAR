import Toastify from 'toastify-js';
import proj4 from 'proj4';

export const crss = {
  'EPSG:2154': proj4.Proj('+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'),
  'EPSG:3857': proj4.Proj('+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs'),
};


export const RASTER_CLUE = Symbol('RASTER_CLUE');
export const VECTOR_CLUE = Symbol('VECTOR_CLUE');
/**
* Parse the window URL to reconstruct the state (zoom / center)
* of the map. Returns an object if it succeed or null otherwise.
*
*/
export function getModifFromUrl() {
  if (window.location.hash !== '') {
    // try to use center and zoom-level from the URL
    const hash = window.location.hash.replace('#map=', '');
    const parts = hash.split('/');
    if (parts.length === 4) {
      return {
        map: {
          zoom: parseInt(parts[0], 10),
          center: [
            parseFloat(parts[1]),
            parseFloat(parts[2]),
          ],
        },
      };
    }
  }
  return null;
}

/**
*
* @param {String} coords_str - Coordinates in one string, separated by
*                              a comma, like '12.21, 34.09'.
* @return {Object} The GeoJSON constructed from this coordinates.
*
*/
export const makePtFeature = (coords_str) => {
  const coordinates = coords_str.split(',').map((n) => +(n.trim()));
  return {
    type: 'Feature',
    properties: {
      origin: 'click',
    },
    geometry: {
      coordinates,
      type: 'Point',
    },
  };
};

/**
* Get the bounding box (xmin, ymin, xmax, ymax) of a LineString or the bounding box
* of the ring of a Polygon.
*
* @param {Number[]} ring - The ring on which computing the extent.
* @return {Number[]} The bbox as [xmin, ymin, xmax, ymax];
*
*/
export const getRingExtent = (ring) => {
  const n_coords = ring.length;
  let [xmin, ymin, xmax, ymax] = [Infinity, Infinity, -Infinity, -Infinity];
  let i;
  let x;
  let y;
  for (i = 0; i < n_coords; i++) {
    [x, y] = ring[i];
    if (x > xmax) xmax = x;
    else if (x < xmin) xmin = x;
    if (y > ymax) ymax = y;
    else if (y < ymin) ymin = y;
  }
  return [xmin, ymin, xmax, ymax];
};

/**
* Returns a GeoJSON Feature which geometry is intended to covers the whole
* world (in Web-Mercator), excepted the surface of the bbox given in argument.
*
* @param {number[]} bbox - The bbox of the initial search area.
* @return {object} - The corresponding GeoJSON feature
*
*/
export const makeCoveringFeatureFromBBox = ([xmin, ymin, xmax, ymax]) => ({
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [-20026376, -20048966],
        [20026376, -20048966],
        [20026376, 20048966],
        [-20026376, 20048966],
        [-20026376, -20048966],
      ],
      [[xmin, ymin], [xmax, ymin], [xmax, ymax], [xmin, ymax], [xmin, ymin]],
    ],
  },
});

/**
* Returns a GeoJSON Feature which geometry is intended to covers the whole
* world (in Web-Mercator), excepted the surface of the ring given in argument.
*
* @param {array} ring - The bbox of the initial search area.
* @return {object} - The corresponding GeoJSON feature
*
*/
export const makeCoveringFeatureFromPolygon = (ring) => ({
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [-20026376, -20048966],
        [20026376, -20048966],
        [20026376, 20048966],
        [-20026376, 20048966],
        [-20026376, -20048966],
      ],
      ring.reverse(),
    ],
  },
});

/**
* Returns wheter the argument is (or can be casted to) a finite number.
*
* @param {unknown} n
* @return {boolean}
*
*/
export const is_num = (n) => (typeof n === 'number'
  ? !Number.isNaN(n)
  : !Number.isNaN(n) && !Number.isNaN(parseFloat(n)));

/**
  * Move the caret at the end of the editable element given in argument.
  *
  * @param {HTMLElement} editable_elem - The targeted editable element.
  * @return {void}
  *
  */
export const setCaretEnd = (editable_elem) => {
  const range = document.createRange();
  const sel = window.getSelection();
  const line = editable_elem.childNodes[editable_elem.childNodes.length - 1];
  if (line) {
    range.setStart(line, line.textContent.length);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }
};

export const pipe = (...fns) => (x) => fns.reduce((y, f) => f(y), x);

export const withConstructor = (constructor) => (o) => ({
  // create the delegate [[Prototype]]
  __proto__: {
    // add the constructor prop to the new [[Prototype]]
    constructor,
  },
  // mix all o's props into the new object
  ...o,
});

/**
* Format a Date Object to string according to https://tools.ietf.org/html/rfc3339
* (code from https://stackoverflow.com/questions/7244246/generate-an-rfc-3339-timestamp-similar-to-google-tasks-api)
*
* @param {Date} d - The Date to be formatted.
* @return {str}
*
*/
export const formatDateString = (d) => {
  const pad = (n) => (n < 10 ? `0${n}` : n);
  return `${d.getUTCFullYear()}-${
    pad(d.getUTCMonth() + 1)}-${
    pad(d.getUTCDate())}T${
    pad(d.getUTCHours())}:${
    pad(d.getUTCMinutes())}:${
    pad(d.getUTCSeconds())}Z`;
};

export const ONE_HOUR = 1000 * 60 * 60;

export const substractTime = (d, ms) => new Date(d.getTime() - ms);

export const toLowerCaseNoAccent = (str) => str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/**
* Try to parse a JSON string into. Returns an Array of two elements :
* like [true, data] if parsing succeeded or like [false, error] if it failed.
*
* @param {String} txt - The JSON string to be parsed.
* @return {Array} An Array of two element, this first one is a Boolean (whether
* parsing the string succeeded or not) and the second is the resulting object or
* the error thrown.
*/
export const isValidJSON = (txt) => {
  try {
    return [true, JSON.parse(txt)];
  } catch (e) {
    return [false, e];
  }
};

/**
* Debounce a function execution.
*
* @param {Function} func - The function to be executed after the debounce time.
* @param {Number} wait - The amount of time to wait after the last
*                         execution and before executing `func`.
* @param {Object} context - Context in which to call `func`.
* @return {Function} The resulting debounced function.
*/
export function debounce(func, wait, context) {
  let result;
  let timeout = null;
  return function executedFunction(...args) {
    const ctx = context || this;
    const later = () => {
      timeout = null;
      result = func.apply(ctx, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    return result;
  };
}

/**
*
*
*
*
*
*/
export function filterObj(obj1, obj2) {
  const result = {};
  Object.keys(obj1)
    .forEach((key) => {
      if (obj2[key] !== obj1[key]) {
        result[key] = obj2[key];
      }
      if (Array.isArray(obj2[key]) && Array.isArray(obj1[key])) {
        result[key] = filterObj(obj1[key], obj2[key]);
      }
      if (typeof obj2[key] === 'object' && typeof obj1[key] === 'object') {
        result[key] = filterObj(obj1[key], obj2[key]);
      }
    });

  return result;
}

const type_to_color = new Map([
  ['error', 'linear-gradient(to right, #d22373, #d22323)'],
  ['success', 'linear-gradient(to right, #00b09b, #96c93d)'],
  ['info', '#5bc0de'],
]);

/**
* Display a non blocking notification using Toastify.
*
* @param {String} msg - The content of the message to display.
* @param {String} type_message - The type of the message, within {'error', 'info', 'success'}.
* @param {Number} duration - The duration before closing this notification.
* @return {void}
*
*/
export function displayNotification(msg, type_message = 'info', duration = 3000) {
  Toastify({
    text: msg,
    duration,
    close: true,
    gravity: 'top',
    position: 'center',
    backgroundColor: type_to_color.get(type_message.toLowerCase()),
  }).showToast();
}

/**
* Converts chainIterator (used by some `Lumino` widgets)
* to an Array.
*
* @param {lumino.chainIterator} chain_iter - The chainIterator to convert.
* @return {Array} A regular Array with the content
*                 collected while iterating on the input.
*/
export function chainIterToArray(chain_iter) {
  const result = [];
  let a;
  while (a = chain_iter.next()) { // eslint-disable-line no-cond-assign
    result.push(a);
  }
  return result;
}

export function getChildrenWidgets(parent_widget, id) {
  // SplitPanel and DockPanel doesn't provide the same interface to
  // access their widgets:
  const list_widgets = Array.isArray(parent_widget.widgets)
    ? parent_widget.widgets
    : chainIterToArray(parent_widget.widgets());
  let result_widget = list_widgets.find((w) => w.id === id);
  if (result_widget) return result_widget;
  list_widgets.forEach((_w) => {
    if (!_w.widgets) return;
    const r = getChildrenWidgets(_w, id);
    if (r) result_widget = r;
  });
  return result_widget;
}

/**
* Count the number of each item in arr, returns an object with keys being
* items of 'arr' and values being the number of time each one was encountered
* Example :
* ```
* let c = counter(['foo', 'bar', 'foo']);
* console.log(c); // {"foo": 2, "bar": 1}
* ```
* @param {Array} arr - The array on which counting the items.
* @return {Object}
*/
export function counter(arr) {
  const o = {};
  const n_elem = arr.length;
  for (let i = 0; i < n_elem; i++) {
    const item = arr[i];
    if (o[item]) {
      o[item] += 1;
    } else {
      o[item] = 1;
    }
  }
  return o;
}


export const getNodes = (d) => {
  const result = [];
  const _get_nodes = (_d) => {
    Object.keys(_d).forEach((k) => {
      if (Object.keys(_d[k]).length > 0) {
        _get_nodes(_d[k]);
      } else {
        result.push(k);
      }
    });
  };
  _get_nodes(d);
  return result;
};


export const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1);


export const makeTree = (treeObject) => {
  const result = ['<ul>'];
  const _make_elements = (d) => {
    Object.keys(d).forEach((k) => {
      if (Object.keys(d[k]).length > 0) {
        result.push(`<li class="pnode" id="${k}"> \
            <i class="fas fa-folder-plus"></i> \
            <span>${capitalize(k)}</span> \
          </li> \
          <ul id="sublist-${k}" class="hidden">`);
        _make_elements(d[k]);
        result.push('</ul>');
      } else {
        result.push(`<li class="cnode disabled" id="${k}"> \
            <i class="fas fa-folder-plus"></i> \
            <span>${capitalize(k)}</span> \
            <span class="badge badge-info"></span> \
          </li> \
          <ul id="sublist-${k}" class="hidden"></ul>`);
      }
    });
  };
  _make_elements(treeObject);
  result.push('</ul>');
  return result.join('');
};

export const makeInfoBox = (props, uid) => `
<h4> Informations on feature <i>#${uid}</i></h4>
<table class="table-info">
  <tbody>
    ${Object.keys(props)
    .map((k) => `<tr><td class="field-name">${k}</td><td><span class="field-value">${props[k]}</span></td></tr>`)
    .join('')}
  </tbody>
</table>
`;

export const getRgbArray = (color, alpha = true) => {
  let rgb = [];
  if (color.substr(0, 1) === '#') {
    let hex = color.substr(1).split('');
    if (hex.length === 3) {
      hex = [hex[0], hex[0], hex[1], hex[1], hex[2], hex[2]];
    }
    if (hex.length === 6) {
      let i = 0;
      let x = 0;
      // let hexStr;
      while (i < 3) {
        rgb[i] = parseInt(hex[x] + hex[x + 1], 16);
        i += 1;
        x = i * 2;
      }
    }
  } else if (color.search(/rgb/) !== -1) {
    rgb = color.match(/([0-9]+\.?[0-9]*)/g);
  }
  if (alpha && rgb.length === 3) {
    rgb.push(1);
  } else if (!alpha && rgb.length === 4) {
    rgb.pop();
  }
  return rgb.map((v) => parseFloat(v));
};

// To find to object(s) corresponding to a key at arbitrary depth
// in nested objects
export function findAllByKey(obj, keyToFind) {
  return Object.entries(obj)
    .reduce((acc, [key, value]) => ((key === keyToFind)
      ? acc.concat(value)
      : (typeof value === 'object')
        ? acc.concat(findAllByKey(value, keyToFind))
        : acc), []);
}

// To get all the terminals objects (at arbitrary depth) in a flat object..
export const flattenObject = (obj) => {
  const flattened = {};

  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      Object.assign(flattened, flattenObject(obj[key]));
    } else {
      flattened[key] = obj[key];
    }
  });

  return flattened;
};

/**
 * Round a number to nearest fraction of 8, with 3 decimal digits.
 * @param {Number} number - The value to be rounded.
 * @returns {String} - The rounded value.
 */
const roundToEighth = (number) => (Math.round(number * 8) / 8).toFixed(3);

/**
 * Convert a base 64 string to
 * Source: https://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
 */
export const b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
  if (b64Data.includes(contentType)) {
    // todo ....
  }
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
};
