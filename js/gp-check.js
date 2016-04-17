/*
 guidepost check from OsmHiCheck for osmcz
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
osmcz.gpcheck = function(map, baseLayers, overlays, controls) {
    // -- constructor --

    var layersControl = controls.layers;
    var xhr;
    var check_markers = L.markerClusterGroup({code: 'B'});

    var gp_check_icon = L.icon({
      iconUrl: osmcz.basePath + "img/gp_check.png",
      iconSize: [48, 48],
      iconAnchor: [23, 45]
    });
    var gp_check_noref_icon = L.icon({
      iconUrl: osmcz.basePath + "img/gp_check_noref.png",
      iconSize: [48, 48],
      iconAnchor: [23, 45]
    });

    var layer_gpcheck = new L.GeoJSON(null, {
        onEachFeature: function (feature, layer) {
            if(feature.properties.class == "noref"){
              layer.setIcon(gp_check_noref_icon);
            } else {
              layer.setIcon(gp_check_icon);
            }
            layer.bindPopup(feature.properties.name + '<br/><br/><i>'+ feature.properties.class + '</i>', 
                            { closeOnClick: false, });
        }
    });


        map.on('layeradd', function(event) {
                  if(event.layer == check_markers) {
                                load_data()
                                        }
                                            });

    map.on('drag', function (e) {
        if (!isLayerChosen())
            return;

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


    /* Add overlay to the map */
    layersControl.addOverlay(check_markers, "Chybné rozcestníky");

    /* Add overlay to the overlays list as well
     * This allows restoration of overlay state on load */
    overlays["Chybné rozcestníky"] = check_markers;

    // -- methods --

    function isLayerChosen() {
        return map.hasLayer(check_markers);
    }

    function request_from_url(url, success_callback, error_callback)
    {
        var defaultParameters = {
            outputFormat: 'application/json'
        };

        var customParams = {
            json: 'yes',
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
            check_markers.clearLayers();
            var geo_json_url = 'http://osm.fit.vutbr.cz/OsmHiCheck/gp/';
            request_from_url(geo_json_url, retrieve_geojson, error_gj)
        } else {
            layer_gpcheck.clearLayers();
        }
    }

    function retrieve_geojson(data) {
        layer_gpcheck.clearLayers();
        layer_gpcheck.addData(data);
        check_markers.addLayer(layer_gpcheck);
        map.addLayer(check_markers);
    }


    function error_gj(data) {
        console.log(data);
    }
};

