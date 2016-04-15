/*
 guideposts for osmcz
 Javascript code for openstreetmap.cz website
 Copyright (C) 2015,2016

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.

and

 (c) 2016 osmcz-app, https://github.com/osmcz/osmcz

 */

var osmcz = osmcz || {};
osmcz.guideposts = function(map, baseLayers, overlays, controls) {
    // -- constructor --

    var layersControl = controls.layers;
    var xhr;
    var markers = L.markerClusterGroup({code: 'G'});
    var moving_marker;
    var autoload_lock = false;
    var moving_flag = false;

    var guidepost_icon = L.icon({
      iconUrl: osmcz.basePath + "img/guidepost.png",
      iconSize: [48, 48],
      iconAnchor: [23, 45]
    });

    var commons_icon = L.icon({
      iconUrl: osmcz.basePath + "img/commons_logo.png",
      iconSize: [35, 48],
      iconAnchor: [17, 0]
    });

    var layer_guidepost = new L.GeoJSON(null, {
        onEachFeature: function (feature, layer) {

            layer.on('click', function(e) {autoload_lock = true;});

            var b = feature.properties;

            if (!b.ref) {
                b.ref = "nevíme";
            }

            var html_content = "";
            html_content += "Fotografii poskytl: ";
            html_content += "<a href='http://api.openstreetmap.cz/table/name/" + b.attribution + "'>" + b.attribution + "</a>";
            html_content += " ";
            html_content += "<a href='http://api.openstreetmap.cz/table/id/" + b.id + "'><span class='glyphicon glyphicon-pencil' title='upravit'></span></a>";
            html_content += "<br>";
            html_content += "Číslo rozcestníku: ";
            html_content += "<a href='http://api.openstreetmap.cz/table/ref/"+ b.ref + "'>" + b.ref + "</a>";
            html_content += "<br>";
            html_content += "<a href='http://map.openstreetmap.cz/" + b.url + "'>";
            html_content += "<img src='http://map.openstreetmap.cz/" + b.url + "' width='180' alt='" + b.name + "'>";
            html_content += "</a>";

            layer.setIcon(guidepost_icon);
            layer.bindPopup(html_content, {
              offset: new L.Point(1, -32),
              minWidth: 500,
              closeOnClick: false,
              autoPan: false,
            });
        }
    });

    var layer_commons = new L.GeoJSON(null, {
        onEachFeature: function (feature, layer) {
            layer.setIcon(commons_icon);
            layer.bindPopup(feature.properties.desc, {
              closeOnClick: false,
            });
        }
    });

    map.on('popupclose', function(e) {
      autoload_lock = false;
    });

    map.on('layeradd', function(event) {
        if(event.layer == markers && !autoload_lock) {
//        load_data();
        }
    });

    map.on('moveend', function(event) {
        if(!autoload_lock) {
            load_data();
      }
    });

    map.on('drag', function (e) {
        if (!isLayerChosen())
            return;

        console.log(map.hasLayer(markers));

        if (typeof xhr !== 'undefined') {
            xhr.abort();
        }
    });

    map.on('movestart', function (e) {
        if (!isLayerChosen())
            return;

        if (typeof xhr !== 'undefined') {
            xhr.abort();
        }
    });

    map.on('click', function(e) {
        if (moving_flag) {
            create_moving_marker(e.latlng.lat, e.latlng.lng);
        }
    });

    /* Add overlay to the map */
    layersControl.addOverlay(markers, "Foto rozcestníků");

    /* Add overlay to the overlays list as well
     * This allows restoration of overlay state on load */
    overlays["Foto rozcestníků"] = markers;

    // -- methods --

    function create_moving_marker(lat, lon)
    {
        moving_marker = L.marker(new L.LatLng(lat, lon), {
          draggable: true
        });
        moving_marker.bindPopup('Presun me na cilove misto');
        moving_marker.addTo(map);
        moving_flag = false; //user will now interact with placed marker until hi hit done
    }

    function destroy_moving_marker()
    {
        map.removeLayer(moving_marker);
        delete moving_marker;
    }

    osmcz.guideposts.prototype.finish_moving = function()
    {
      moving_flag = false;
      if (moving_marker) {
        final_lat = moving_marker.getLatLng().lat;
        final_lon = moving_marker.getLatLng().lng;
        destroy_moving_marker();
      } else {
        alert ("Vyberte novou pozici");
      }
      //make ajax call
    }

    osmcz.guideposts.prototype.move_point = function()
    {
        if (!moving_flag) {
            moving_flag = true;
        }
    }

    function isLayerChosen() {
        return map.hasLayer(markers);
    }

    function request_from_url(url, success_callback, error_callback)
    {
        var defaultParameters = {
            outputFormat: 'application/json'
        };

        var customParams = {
            output: 'geojson',
            bbox: map.getBounds().toBBoxString(),
        };
        var parameters = L.Util.extend(defaultParameters, customParams);

        xhr = $.ajax({
            url: url + L.Util.getParamString(parameters),
            success: success_callback,
            error: error_callback
        });

    }

    function load_data() {

        if (!isLayerChosen())
            return;

        if (typeof xhr !== 'undefined') {
            xhr.abort();
        }

        if (map.getZoom() > 1) {

            markers.clearLayers();

            var geo_json_url = 'http://api.openstreetmap.cz/table/all';
            request_from_url(geo_json_url, retrieve_geojson, error_gj)

            geo_json_url = 'http://api.openstreetmap.cz/commons';
            request_from_url(geo_json_url, retrieve_commons, error_gj)

        } else {
            layer_guidepost.clearLayers();
        }
    }

    function retrieve_geojson(data) {
        layer_guidepost.clearLayers();
        layer_guidepost.addData(JSON.parse(data));
        markers.addLayer(layer_guidepost);
        map.addLayer(markers);
    }

    function retrieve_commons(data) {
        layer_commons.clearLayers();
        layer_commons.addData(JSON.parse(data));
        markers.addLayer(layer_commons);
        map.addLayer(markers);
    }

    function error_gj(data) {
        console.log(data);
    }
};

