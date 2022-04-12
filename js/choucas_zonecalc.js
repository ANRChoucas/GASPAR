//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
// choucas_zonecalc.js: The functionality for the zone calculations
//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------

import {styleItem} from "./choucas_styling.js";

//A cache of the zone for each filter to avoid recalcing each zone from scratch
var filterZoneCache = {}; //key=FilterID, value=CriteriaString (e.g. "Filter1": <(Multi)Polygon Object>)
var currentZonesPerScenario = {}; //key:scenario, value:list of polygons defining the most likely zone for this scenario

function getZonesForAllScenarios() {
  var zones = [];
  $.each(currentZonesPerScenario, function(key, value) {
    zones = zones.concat(value);
  });
  return zones;
}


//-----------------------------------------------------------------------------
// ZONE CALCULATION: Update the zone for the current filter
// The user has changed the selected items or changed the buffer or distance
//-----------------------------------------------------------------------------
function updateZoneForCurrentFilter() {
	//TODO small multiple
  choucasLog("updateZoneForCurrentFilter()");

  //Clear the map layer for the activeFilter
  var activeFilterObjectLayer = objectMapLayersForEachFilter[selectedFilter];
  var activeFilterZoneLayer = zoneMapLayersForEachFilter[selectedFilter];
  activeFilterObjectLayer.getSource().clear();
  activeFilterZoneLayer.getSource().clear();
  if( filterObjectsEnabled[selectedFilter] ) { map.removeLayer(activeFilterObjectLayer) }
  if( filterZonesEnabled[selectedFilter] ) { map.removeLayer(activeFilterZoneLayer) }

  //Clear the filter zone cache for the current filter
  filterZoneCache[selectedFilter] = null;

  //Fetch all the relevant items for the items currently selected in the tree
  var itemsInFilter = [];
  var totalDataPoints = 0;
  $.each(getSelectedItemRefs("#tree"), function (event, relevantItemRef) {
    itemsInFilter.push(turfItemMap[relevantItemRef]);
    mapItem = objectMap[relevantItemRef];
    totalDataPoints += parseFloat(mapItem.getProperties().dataPoints);
    styleItem(mapItem,"highlight");
    activeFilterObjectLayer.getSource().addFeature(mapItem)
  });

  var distance = null;
  try { distance = parseFloat(document.getElementById("distanceInput" + selectedFilter).value); }
  catch(err) { choucasLog("Invalid distance input"); }
  var fuzziness = null;
  try { fuzziness = parseFloat(document.getElementById("bufferInput" + selectedFilter).value); }
  catch(err) { choucasLog("Invalid buffer input"); }
  var calculateZones = true;
  if(isNaN(distance) && isNaN(fuzziness)) {
    calculateZones = false; //If distance and fuzziness are null then dont calculate a zone
  } if (isNaN(distance) && !isNaN(fuzziness)) {
    distance = 0; //If only distance is null then default it to 0
  } if (isNaN(fuzziness) && !isNaN(distance)) {
    fuzziness = 0.05 //If only the buffer is null or 0 then default it to 0
  } if (fuzziness == 0) {
    fuzziness = 0.05 //If only the buffer is null or 0 then default it to 0
  }

  //Caluclate the corresponding zone if required
  if(calculateZones) {

    if(totalDataPoints >= parseFloat(document.getElementById("zoneCalcWarning").value)) {
      var confirmZoneCalcMessage= " \
        Attention: Les objets sélectionnés pour ce filtre contiennent " + totalDataPoints +  " points de données. Donc le calcul de la zone peut être long.\n \
        Si possible, commencez avec un autre indice, puis filtrez l'arbre des objets de la carte pour la plus petite zone actuelle.\n \
        Pour éviter cet avertissement, modifiez le champ 'Avert. de zone calcul' sous la section 'Paramètres +/- \n \
        Cliquez sur OK pour continuer le calcul de la zone, ou cliquez sur Annuler pour abandonner le calcul de la zone. \
        ";

      var confirmZoneCalc = confirm(confirmZoneCalcMessage)
      if(!confirmZoneCalc) {
        deselectAllNodes();
        choucasLog("User aborted calculation of zone after data point number warning");
        return;
      }
    }

    choucasLog("User aborted calculation of zone after data point number warning with data points=" + totalDataPoints );

    filterRecalcStartTime = Date.now();

    //Calculate the zone for each item based on buffer / distance values
    //This code buffers each item individually
    var turfObjects = [];
    $.each(itemsInFilter, function (event, item) {
      var zone = null;
      if(distance > 0) {
        var tmp = turf.buffer(item, distance, {units: "kilometers"});
        var distanceLine = turf.polygonToLine(tmp);
        zone = turf.buffer(distanceLine, fuzziness, {units: "kilometers"});
      } else {
        //TODO: This is a dodgy hack as turf buffer was not calculating correct distances at 45 deg N
        zone = turf.buffer(item, fuzziness * 0.0127, {units: "degrees"});
      }
      turfObjects.push(zone)
    });

    //Union all of the item zones to get a final overall zone for this filter
    if(turfObjects.length > 0) {

      //Use the individually buffered items
      turfFinalResult = turf.union.apply(this, turfObjects);

      //Combine all items and then buffer them as a group
      //var fc = turf.featureCollection(itemsInFilter);
      //var combined = turf.combine(fc);
      //var turfFinalResult = turf.buffer(combined.features[0], fuzziness * 0.0127, {units: "degrees"});
      //item.setProperties({"itemType": itemsInFilter.data.itemType });

      var bufferedPoly = format.readFeature(turfFinalResult);
      bufferedPoly.getGeometry().transform("EPSG:4326", "EPSG:3857");
      filterZoneCache[selectedFilter] = bufferedPoly;

      var buffer = document.getElementById("bufferInput" + selectedFilter).value;
      if (0.0 != parseFloat(buffer)) {
        //Add Zone To Map if buffer is not 0
        //TODO: review this
        styleItem(bufferedPoly,"highlightOutline", getHypNumberForFilter(selectedFilter));
        activeFilterZoneLayer.getSource().addFeature(bufferedPoly);
      }
    }
    choucasLog("Zone recalculated for " + selectedFilter + " in: ", Date.now() - filterRecalcStartTime);
  }

  if( filterObjectsEnabled[selectedFilter] ) { map.addLayer(activeFilterObjectLayer) }
  if( filterZonesEnabled[selectedFilter] ) { map.addLayer(activeFilterZoneLayer) }

  //Finally recalc the most likely zone based on this new updated filter
  recalcZones();
}

//-----------------------------------------------------------------------------
// ZONE CALCULATION: Recalculate the most likely zone
//-----------------------------------------------------------------------------
function recalcZones(){
	//TODO small multiple

  choucasLog("recalcZones()");

  map.removeLayer(vectorLayer);
  vectorSource.clear();
  currentZonesPerScenario = {};
  recalcScenariosStartTime = Date.now();

  //For each hypothesis calculate the most likely zone
  for (var hypothesisNumber = 1; hypothesisNumber <= numberOfHypotheses; ++hypothesisNumber) {
    currentZonesPerScenario[hypothesisNumber] = [];

    var filterEnabled = true;
    var hypHeader = document.getElementById("hypothesis" + hypothesisNumber);
    if (hypHeader.style.backgroundColor == "grey") { filterEnabled = false; }

    //Get all the ticked filters under this hypothesis
    var filterZoneTable = document.getElementById("filterZonesTable");
    var filterZoneCheckboxes = filterZoneTable.querySelectorAll("input[id^='zone" + hypothesisNumber + "']:checked");

    // If checkboxes are ticked then calculate the corresponding most likely zone
    if(filterZoneCheckboxes.length > 0)  {
      var intersections = [];
      var filtersInTurfFormat = [];

      for (k = 0; k < filterZoneCheckboxes.length; ++k) {
        if(filterZoneCache[filterZoneCheckboxes[k].value] != null) {
          var obj = filterZoneCache[filterZoneCheckboxes[k].value].clone();
          var polygons = [];
          if (obj.getGeometry().getType() == "MultiPolygon") {
            var polyList = obj.getGeometry().getPolygons();
            polyList.forEach( function(poly) {
              polygons.push(new ol.Feature({ geometry: poly }));
            });
          }
          else {
            polygons.push(new ol.Feature({ geometry: obj.getGeometry() }));
          }

          var newIntersections = [];
          for (m = 0; m < polygons.length; ++m) {
            if(intersections.length == 0){
              newIntersections.push(format.writeFeatureObject(polygons[m]));
            }
            else {
              for (n = 0; n < intersections.length; ++n) {
                var poly2 = format.writeFeatureObject(polygons[m]);
                var intersection = turf.intersect(poly2, intersections[n]);
                if (intersection != null) {
                  var flatten = turf.flatten(intersection);
                  var features = flatten.features;
                  for (var x = 0; x < features.length; ++x) {
                    newIntersections.push(features[x]);
                  }
                }
              }
            }
          }
          intersections = newIntersections;
        }
      }

      for (o = 0; o < intersections.length; ++o) {
        var area1 = format.readFeature(intersections[o]);
        styleItem(area1,"hypothesisZone",hypothesisNumber);
        var tmpItem = area1.clone();
        tmpItem.getGeometry().transform("EPSG:3857", "EPSG:4326");
        currentZonesPerScenario[hypothesisNumber].push(format.writeFeatureObject(tmpItem));
        if(filterEnabled) { vectorSource.addFeature(area1); }
      }
    }
  }
  map.addLayer(vectorLayer);
  refreshMapItems();

  choucasLog("Scenarios recalculated in:", Date.now() - recalcScenariosStartTime);

  $.each(currentZonesPerScenario, function(key, value) {
    if(value.length > 0) {
      var fc = turf.featureCollection(value)
      choucasLog("Current Zone Size (km2): Scenario " + key ,turf.area(fc) / 1000000);
    }
  });



}

