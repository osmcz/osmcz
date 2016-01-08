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

// create the tile layer with correct attribution
var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
var osm = new L.TileLayer(osmUrl, {minZoom: 1, maxZoom: 19, attribution: osmAttrib});

map.setView(new L.LatLng(49.5, 17), 7);
map.addLayer(osm);

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
