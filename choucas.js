//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
// choucas.js: The central map functionality of the choucas system
//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
// Global variables
//-----------------------------------------------------------------------------
var objectMap = {};   //key:itemRef, value:object - Map of OSM objects as OL features                                 
var turfItemMap = {}; //key:itemRef, value:object - Map of OSM objects as GeoJSON objects for turf.js spatial calculcations
var format = new ol.format.GeoJSON(); //OL Formatter for converting between OL Features and geojson objects

//-----------------------------------------------------------------------------
// Map
//-----------------------------------------------------------------------------
//Initial base map is OSM, other maps are loaded on demand with loadBaseMap()
var currentBaseMap = "OSM";
var baseMaps = {
  "OSM": new ol.layer.Tile({
    source: new ol.source.OSM()
  })
}

var scaleLineControl = new ol.control.ScaleLine(); //Map scale bar
scaleLineControl.setUnits("metric");

var map = new ol.Map({
  target: "map",
  layers: [ baseMaps["OSM"] ],
  view: new ol.View({
    center: ol.proj.fromLonLat([5.72, 45.18]), //Center point Grenoble to start
    zoom: 11
  }),
  controls: ol.control.defaults({
    zoom : false,
    attributionOptions: {
      collapsible: false
    }
  }).extend([ scaleLineControl ])
});

//-----------------------------------------------------------------------------
// Intialisation
//-----------------------------------------------------------------------------
function initialise() {
  choucasLog("Initialising System");
  
  objectMap = {};
  turfItemMap = {};

  map.setView(new ol.View({
    center: ol.proj.fromLonLat([5.72, 45.18]), //Center point Grenoble to start
    zoom: 11
  }));
  document.getElementById("baseMapSelection").value = "OSM";
  loadBaseMap();

  $.each(objectMapLayersForEachFilter, function(key, value) { 
    map.removeLayer(value); 
  });

  $.each(zoneMapLayersForEachFilter, function(key, value) { 
    map.removeLayer(value); 
  });

  document.getElementById("filterTable").innerHTML = "";
  initialiseTable();
  addScenario();
  addScenario();
  addScenario();
  addFilter(); 
  changeHypothesisNumber(); //Update the hypothesis colour change dropdown

  activeItemsSource.clear();
  hoverSource.clear();
  vectorSource.clear();

  refreshMapItems();

  loadInitialItems();
  setupTextFilterSearchbox();
  
  choucasLog("Initialisation completed successfully");
}

setTimeout(initialise, 500); //500ms delay to let the tree to be constructed


//-----------------------------------------------------------------------------
// Additional OSM Base Maps
// https://wiki.openstreetmap.org/wiki/Tile_servers
//-----------------------------------------------------------------------------
var baseMapReferences = {
  "Thunderforest Cycle": "https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=",
  "Thunderforest Landscape": "https://tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey=",
  "Thunderforest Outdoors": "https://tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=",
  "OTM": "http://a.tile.opentopomap.org/{z}/{x}/{y}.png",
  "HUM": "http://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
  "HIB": "http://toolserver.org/tiles/hikebike/{z}/{x}/{y}.png"
}

function loadBaseMap() {
  var baseMapSelection = document.getElementById("baseMapSelection").value;
  choucasLog("Loading base map " + baseMapSelection);

  map.removeLayer(baseMaps[currentBaseMap]);
  if ( !(baseMapSelection in baseMaps) ) {
    if(baseMapSelection == "IGN" || baseMapSelection == "IGN Satellite") {
      baseMaps[baseMapSelection] = getIGNBaseMap(baseMapSelection);
    } else if (baseMapSelection == "Thunderforest Cycle" || baseMapSelection == "Thunderforest Landscape" || baseMapSelection == "Thunderforest Outdoors") {
      baseMaps[baseMapSelection] = new ol.layer.Tile({
        source: new ol.source.XYZ({ url: baseMapReferences[baseMapSelection] + document.getElementById("thunderforestAPIKey").value })
      });
    } else {
      baseMaps[baseMapSelection] = new ol.layer.Tile({
        source: new ol.source.XYZ({ url: baseMapReferences[baseMapSelection] })
      });
    }
  }
  map.addLayer(baseMaps[baseMapSelection]);
  baseMaps[baseMapSelection].setZIndex(-1);
  currentBaseMap = baseMapSelection;
}


//-----------------------------------------------------------------------------
// IGN Base Maps
//-----------------------------------------------------------------------------
var resolutions = [ 156543.03392804103, 78271.5169640205, 39135.75848201024,
  19567.879241005125, 9783.939620502562, 4891.969810251281, 2445.9849051256406,
  1222.9924525628203, 611.4962262814101, 305.74811314070485, 152.87405657035254,
  76.43702828517625, 38.218514142588134, 19.109257071294063, 9.554628535647034,
  4.777314267823517, 2.3886571339117584, 1.1943285669558792, 0.5971642834779396,
  0.29858214173896974, 0.14929107086948493, 0.07464553543474241 ];

function getIGNBaseMap(mapType) {
  //GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN25TOPO.L93
  //GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN-EXPRESS.STANDARD
  //GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN-EXPRESS.CLASSIQUE
  var ignLayer = "GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN-EXPRESS.CLASSIQUE";
  if (mapType == "IGN Satellite") {
    ignLayer = "ORTHOIMAGERY.ORTHOPHOTOS";
  }

  return new ol.layer.Tile({
    source: new ol.source.WMTS({
      attributions: ["IGN-F/Géoportail"],
      url: getIGNURL() + "geoportail/wmts",
      layer: ignLayer,
      matrixSet: "PM",
      format: "image/jpeg",
      tileGrid: new ol.tilegrid.WMTS({
        origin: [-20037508,20037508],
        resolutions: resolutions,
        matrixIds:["0","1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19"],
      }),
      style: "normal"
    })
  });
}

function getIGNURL() {
  var ignAPIKey = document.getElementById("ignAPIKey").value;
  var ignLogin = document.getElementById("ignAPILogin").value;
  
  if (ignLogin == "" || ignLogin == "username:password") {
    return "http://wxs.ign.fr/" + ignAPIKey + "/"
  } 
  else {
    return "https://" + ignLogin + "@wxs.ign.fr/" + ignAPIKey + "/"
  }
}


//-----------------------------------------------------------------------------
// OL Map layers for displaying objects
//-----------------------------------------------------------------------------
//Layer for all the data items that should be currently displayed
var activeItemsSource = new ol.source.Vector({});
var activeItemsLayer = new ol.layer.Vector({
  source: activeItemsSource
});

//Layer for when user hovers over an item
var hoverSource = new ol.source.Vector({});
var hoverLayer = new ol.layer.Vector({
  source: hoverSource
});

//Layer to display the zones
var vectorSource = new ol.source.Vector({});
var vectorLayer = new ol.layer.Vector({
  source: vectorSource
});


//-----------------------------------------------------------------------------
// Fit map to current zone
//-----------------------------------------------------------------------------
function fitMapToCurrentZone () {
  choucasLog("fitMapToCurrentZone()");
  currentZones = getZonesForAllScenarios();
  if(currentZones.length > 0) {
    var fc = turf.featureCollection(currentZones);
    var combined = turf.combine(fc);
    //Pad by 1km
    var buffered = turf.buffer(combined, 1, {units: "kilometres"});
    var polygon = format.readFeature(buffered.features[0]).getGeometry();
    polygon.transform("EPSG:4326", "EPSG:3857");
    map.getView().fit(polygon, {padding: [0, 0, 0, 0], constrainResolution: false});
    setPrompt(4);
  }
}

