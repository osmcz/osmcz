var map;
var xhr;
var plotlist;
var plotlayers=[];
var layer_guidepost;// = new L.GeoJSON();
var markers = L.markerClusterGroup();

function retrieve_geojson(data)
{
//  alert("ok" + data);

//   layer_guidepost.clearLayers();
  markers.clearLayers();
//  map.removeLayer(layer_guidepost);
  map.removeLayer(markers);

  layer_guidepost = L.geoJson(JSON.parse(data), {
    onEachFeature: function (feature, layer) {
      var x = feature.properties;
      var popup_html = x.name + " " + x.id + " <b>some html</b>";
      layer.bindPopup(popup_html);
    }
  });

  markers.addLayer(layer_guidepost);
  map.addLayer(markers);
};

function error_gj(data)
{
  console.log(data);
//  alert("error" + data);
};

function load_data()
{
  if (typeof xhr !== 'undefined') {
    xhr.abort();
  }

  if(map.getZoom() > 1) {

    var geoJsonUrl ='http://map.openstreetmap.cz/table/all';

    var defaultParameters = {
      outputFormat: 'application/json'
    };

    var customParams = {
      output: 'geojson',
      bbox: map.getBounds().toBBoxString(),
    };
    var parameters = L.Util.extend(defaultParameters, customParams);

//    alert(geoJsonUrl + L.Util.getParamString(parameters));

    xhr = $.ajax({
      url: geoJsonUrl + L.Util.getParamString(parameters),
      success: retrieve_geojson,
      error: error_gj
    });

  } else {
    map.removeLayer(layer_guidepost);
  }
}

function initmap() {
// set up the map
  map = new L.Map('map');

  var stamen = L.tileLayer('http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg', {
    attribution: 'Map data CC-BY-SA <a href="http://openstreetmap.org">OSM.org</a>, imagery <a href="http://maps.stamen.com">Stamen Design</a>',
    maxZoom: 18
  });

  var osm = L.tileLayer('http://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: 'OpenStreetMap.org'
  });

  var mapbox = L.tileLayer('http://{s}.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiemJ5Y3oiLCJhIjoiRUdkVEMzMCJ9.7eJ3YhCQtbVUET92En5aGA', {
    attribution: 'OpenStreetMap.org & Mapbox'
  });

  var ocm = L.tileLayer("http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: 'Data: <a href="http://opencyclemap.org">OpenCycleMap</a>'
  });

  var hikebike = L.tileLayer("http://toolserver.org/tiles/hikebike/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: 'Data: <a href="http://www.hikebikemap.de">Hike &amp; Bike Map</a>'
  });

  var mtb = L.tileLayer("http://tile.mtbmap.cz/mtbmap_tiles/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: 'OpenStreetMap.org a USGS'
  });

  var baseLayers = {
    "Mapbox streets": mapbox.addTo(map),
    "MTBMap.cz": mtb,
    "OpenStreetMap Mapnik": osm,
    "OpenCycleMap": ocm,
    "Hike&bike": hikebike,
    "Vodovky": stamen
  };


  // create the tile layer with correct attribution
  var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
  var osm2 = new L.TileLayer(osmUrl, {minZoom: 1, maxZoom: 19, attribution: osmAttrib});

  map.setView(new L.LatLng(49.5, 17), 7);
  map.addLayer(osm2);

  var overlays = {};

  L.control.layers(baseLayers, overlays).addTo(map);
  L.control.scale().addTo(map);

  map.on('moveend', load_data);
  map.on('drag', function (e) { 
    if (typeof xhr !== 'undefined') {
      xhr.abort();
    }
  });
  map.on('movestart', function (e) { 
    if (typeof xhr !== 'undefined') {
      xhr.abort();
    }
  });
}
