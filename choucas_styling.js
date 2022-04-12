//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
// choucas_styling.js: The functionality for the map styling
//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
// STYLING: Function to style openlayer objects, keep the styling logic in one place
//-----------------------------------------------------------------------------
function styleItem(item, type, hypothesisIndex, filterIndex) {
   
  //Calculate the color of the item
  var itemColor = defaultColor;
  var props = item.getProperties();
  if (props.itemType in itemTypeToColor) {
    itemColor = itemTypeToColor[props.itemType];
  }

  var zoneOutlineMode = document.getElementById("zoneOutlineMode").value;
  var mostLikelyZoneMode = document.getElementById("mostLikelyZoneMode").value;

  if (type == "active" || type == "highlight" || type == "hover" || type == "hiddenInTree" || type == "hidden") {
    if (item.getGeometry().getType() == "Point") {  
      item.setStyle(stylesMap[type + "Point" + itemColor]);
    } else {
      item.setStyle(stylesMap[type + "Item" + itemColor]);
    }
  }
  if (type == "highlightOutline") {
    if(zoneOutlineMode == "Item Colour" || hypothesisIndex == null) {
      item.setStyle(stylesMap[type + itemColor]);
    }
    else if(zoneOutlineMode == "Hypothesis Colour") {
      item.setStyle(stylesMap[type + hypothesisToColor[hypothesisIndex]])
    }
  } 
  if (type == "hypothesisZone") {
    if(mostLikelyZoneMode == "Outline") {
      item.setStyle(stylesMap[type + hypothesisToColor[hypothesisIndex]])
    }
    else {
      item.setStyle(stylesMap[type + "NoOutline" + hypothesisToColor[hypothesisIndex]])
    }
  }
}

//-----------------------------------------------------------------------------
// STYLING: Openlayers style objects
//
// Openlayer style objects created for each style and color combination and are
// then stored in the stylesMap. (e.g. activeRed, hoverRed, hypothesisZoneRed)
//
// This means all the openlayer styles are ready to use when the user hovers
// over a red piste or creates a zone around a red piste that uses each style.
//-----------------------------------------------------------------------------

// Intialise a style map with all the different style type and color combinations
var stylesMap = {};

//CSS Colors to create openlayers styles for. Any CSS Colors can be added to this list
var colorList = ["OrangeRed","RoyalBlue","Red","Magenta","Purple","Green","Black","Gray","IndianRed","GoldenRod","SandyBrown","MediumSeaGreen","CornflowerBlue","DarkSlateGray","DimGray"];

//Add the list of possible colors to the user interface
colorList.sort();
for (var i = 0; i < colorList.length; i++) {
  colorName = colorList[i];
  $("#hypothesisColor").append($("<option>", {value:colorName, text:colorName}));
}

//Initial Color setup for each item type / hypothesis numbers etc
var defaultColor = "RoyalBlue"
var hypothesisToColor = {
  1: "Red",
  2: "Purple",
  3: "Magenta"
}
var itemTypeToColor = {
  "COL": "OrangeRed",
  "LAKE": "RoyalBlue",
  "PATHWAY": "SandyBrown",
  "PEAK": "OrangeRed",
  "PISTE" : "DarkSlateGray",  
  "PISTEGREEN": "MediumSeaGreen",
  "PISTEBLUE": "CornflowerBlue",
  "PISTERED": "IndianRed",
  "PISTEBLACK": "DarkSlateGray",
  "ROAD": "DimGray",
  "SKILIFT": "Gray",
  "POWER6": "DarkSlateGray",
  "POWER3": "DarkSlateGray",
  "POWERO": "DarkSlateGray",
  "CITY": "Red",
  "TOWN": "Red",
  "VILLAGE": "Red",
};

var lineThicknessOffset = 1;

//-----------------------------------------------------------------------------
// STYLING: Load all the style objects into the styleMap
//-----------------------------------------------------------------------------
loadStyles();

function loadStyles() {

  stylesMap = {}; //Clear old style map
  lineThicknessOffset = parseFloat(document.getElementById("lineWidthOffset").value);

  for (var i = 0; i < colorList.length; i++) {
    color = colorList[i];

    createStyle({ name:"hiddenItem",        color:color, fillOpa:0,    lineWidth:1, lineOpa:0,   lineDash:null  });
    createPointStyle({ name:"hiddenPoint",  color:color, lineWidth:1, lineOpa:0  });

    createStyle({ name:"hypothesisZone",    color:color, fillOpa:0.3,  lineWidth:0.5, lineOpa:0.8, lineDash:null  });
    createStyle({ name:"hoverItem",         color:color, fillOpa:null, lineWidth:4, lineOpa:0.8, lineDash:null  });
    createStyle({ name:"highlightItem",     color:color, fillOpa:0.03, lineWidth:3, lineOpa:1.0, lineDash:null  });
    createStyle({ name:"highlightOutline",  color:color, fillOpa:0.03, lineWidth:2, lineOpa:0.6, lineDash:[2,4] });
    createStyle({ name:"activeItem",        color:color, fillOpa:null, lineWidth:1, lineOpa:1.0, lineDash:null  });
    createStyle({ name:"hiddenInTreeItem",  color:color, fillOpa:null, lineWidth:0, lineOpa:0.0, lineDash:null  });
    createStyle({ name:"hypothesisZoneNoOutline", color:color, fillOpa:0.3,  lineWidth:0, lineOpa:0.0, lineDash:null});

    createPointStyle({ name:"hoverPoint",        color:color, lineWidth:4, lineOpa:1.0  });
    createPointStyle({ name:"highlightPoint",    color:color, lineWidth:3, lineOpa:1.0 });
    createPointStyle({ name:"activePoint",       color:color, lineWidth:1, lineOpa:1.0  });
    createPointStyle({ name:"hiddenInTreePoint", color:color, lineWidth:1, lineOpa:0.2  });
  }
}

//Create style helper function
function createStyle({name, color, fillOpa, lineWidth, lineOpa, lineDash}) {
  rgb = colorToRGB(color);

  var fillStyle = null;
  if( fillOpa != null || fillOpa > 0 ) {
    fillStyle = new ol.style.Fill({
      color: "rgba(" + rgb + ", " + fillOpa + ")"
    })
  }

  var strokeStyle = null;
  if( lineWidth > 0 ) {
    if ( lineDash != null ) { lineDash[1] += lineThicknessOffset; }
    strokeStyle = new ol.style.Stroke({
      color: "rgba(" + rgb + ", " + lineOpa + ")",
      //lineDash: lineDash,
      width: lineWidth + lineThicknessOffset
    })
  } 

  stylesMap[name + color] =  new ol.style.Style({
    stroke: strokeStyle,
    fill: fillStyle
  });
}

//Create point style helper function
function createPointStyle({name, color, lineWidth, lineOpa}) {
  rgb = colorToRGB(color);
  stylesMap[name + color] = new ol.style.Style({
    image: new ol.style.Circle({
      stroke: new ol.style.Stroke({
        color: "rgba(" + rgb + ", " + lineOpa + ")",
        width: lineWidth + lineThicknessOffset
      }),
      radius: 7,
    })
  });
}

//CSS color to RGB helper function
function colorToRGB(englishColor) {
  var div = $("<div></div>").appendTo("body").css("background-color", englishColor);
  var computedStyle = window.getComputedStyle(div[0]);
  var computedColor = computedStyle.backgroundColor;
  div.remove();
  computedColor = computedColor.replace("rgb(","");
  computedColor = computedColor.replace(")","");
  return computedColor; //returns "rgb(R, G, B)" on IE9/Chrome20/Firefox13.
}

//-----------------------------------------------------------------------------
// STYLING: Refresh map items
//-----------------------------------------------------------------------------
function refreshMapItems() {

  loadStyles();

  $.each(objectMapLayersForEachFilter, function(filterID, mapLayer) {
    var hypNumber = getHypNumberForFilter(filterID);
    $.each(mapLayer.getSource().getFeatures(), function(event, mapItem) {
      if(hypNumber == 0 || hypothesesEnabled[hypNumber]) {
        styleItem(mapItem,"highlight");
      } else {
        styleItem(mapItem,"hidden");
      }
    }); 
  });

  $.each(zoneMapLayersForEachFilter, function(filterID, mapLayer) {
    var hypNumber = getHypNumberForFilter(filterID);   
    $.each(mapLayer.getSource().getFeatures(), function(event, mapItem) {
      if(hypNumber == 0) { //This filter is not attached to any hypothesis
        styleItem(mapItem,"highlightOutline");
      } else if(hypothesesEnabled[hypNumber]) {
        styleItem(mapItem,"highlightOutline",hypNumber);
      } else {
        styleItem(mapItem,"hidden");
      }
    });
  });
}

//Find the hyp number that should be used for coloring if that style option is selected
//If in multiple hypotheses just use the most recent one for color
function getHypNumberForFilter(filterID) {
  var checkboxesForFilter = $("input[type=checkbox][value='"+ filterID +"']:checked");
  if(checkboxesForFilter.length == 1) { 
    return parseFloat(checkboxesForFilter[0].id.replace("zone",""));
  } else {
    return 0;
  }
}
