/*
 * couleur des points d'itinéraire
 */
const begining_point_color ='#8dff33';
const past_point_color ='#33acff';
const to_pass_point_color ='#ff3239';
const destination_point_color ='#bfbdbd';
const begining_point_url = "./image/green_flag.png";
const to_pass_point_url = "./image/red_flag.png";
const past_point_url = "./image/blue_flag.png";
const destination_point_url = "./image/black_flag.png";

function getRandomColor() {
	  var letters = '0123456789ABCDEF';
	  var color = '#';
	  for (var i = 0; i < 6; i++) {
	    color += letters[Math.floor(Math.random() * 16)];
	  }
	  return color;
	}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}



function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function LightenDarkenColor(col, amt) {

    var usePound = false;

    if (col[0] == "#") {
        col = col.slice(1);
        usePound = true;
    }

    var num = parseInt(col,16);

    var r = (num >> 16) + amt;

    if (r > 255) r = 255;
    else if  (r < 0) r = 0;

    var b = ((num >> 8) & 0x00FF) + amt;

    if (b > 255) b = 255;
    else if  (b < 0) b = 0;

    var g = (num & 0x0000FF) + amt;

    if (g > 255) g = 255;
    else if (g < 0) g = 0;

    return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);

}

export {begining_point_color,
	past_point_color,
	to_pass_point_color,
	destination_point_color,
	begining_point_url,
	to_pass_point_url,
	past_point_url,
	destination_point_url,
	hexToRgb,
	getRandomColor,
	rgbToHex,
	LightenDarkenColor};