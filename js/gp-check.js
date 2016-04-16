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
osmcz.gp-check = function(map, baseLayers, overlays, controls) {
    // -- constructor --

    var layersControl = controls.layers;
    var xhr;
    var markers = L.markerClusterGroup({code: 'C'});
    var moving_marker;
    var autoload_lock = false;
    var moving_flag = false;

    var gp_check_icon = L.icon({
      iconUrl: osmcz.basePath + "img/gp_check.png",
      iconSize: [48, 48],
      iconAnchor: [23, 45]
    });

    var layer_gp_check = new L.GeoJSON(null, {
        onEachFeature: function (feature, layer) {
            layer.setIcon(gp_check_icon);
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

    map.on('drag', function (e) {
        if (!isLayerChosen())
            return;

        console.log(map.hasLayer(markers));

        if (typeof xhr !== 'undefined') {
            xhr.abort();
        }
    });

    /* Add overlay to the map */
    layersControl.addOverlay(markers, "Foto rozcestníků");

    /* Add overlay to the overlays list as well
     * This allows restoration of overlay state on load */
    overlays["Foto rozcestníků"] = markers;

    // -- methods --

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

            var geo_json_url = 'http://osm.fit.vutbr.cz/OsmHiCheck/gp/?get.json';
            request_from_url(geo_json_url, retrieve_geojson, error_gj)
        } else {
            layer_guidepost.clearLayers();
        }
    }

    function retrieve_geojson(data) {
        layer_gp_check.clearLayers();
        layer_gp_check.addData(JSON.parse(data));
        markers.addLayer(layer_gp_check);
        map.addLayer(markers);
    }


    function error_gj(data) {
        console.log(data);
    }
};

