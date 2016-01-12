/*
 rozcestniky pro osmcz
 Javascript code for openstreetmap.cz website
 Copyright (C) 2015

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
 */

function rozcestniky(map, layerControl, overlays) {
    // -- constructor --

    var xhr;
    var markers = L.markerClusterGroup({code: 'G'});
    var layer_guidepost = new L.GeoJSON(null, {
        onEachFeature: function (feature, layer) {
            var b = feature.properties;
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
            layer.bindPopup(html_content);
        }
    });


    map.on('layeradd', function(event) {
        if(event.layer == markers) {
            load_data()
        }
    });

    map.on('moveend', load_data);
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

    /* Add overlay to the map */
    layerControl.addOverlay(markers, "Rozcestníky");

    /* Add overlay to the overlays list as well
     * This allows restoration of overlay state on load */
    overlays["Rozcestníky"] = markers;


    // -- methods --

    function isLayerChosen() {
        return map.hasLayer(markers);
    }

    function load_data() {
        if (!isLayerChosen())
            return;

        if (typeof xhr !== 'undefined') {
            xhr.abort();
        }

        if (map.getZoom() > 1) {

            var geoJsonUrl = 'http://api.openstreetmap.cz/table/all';

            var defaultParameters = {
                outputFormat: 'application/json'
            };

            var customParams = {
                output: 'geojson',
                bbox: map.getBounds().toBBoxString(),
            };
            var parameters = L.Util.extend(defaultParameters, customParams);

            xhr = $.ajax({
                url: geoJsonUrl + L.Util.getParamString(parameters),
                success: retrieve_geojson,
                error: error_gj
            });

        } else {
            layer_guidepost.clearLayers();
        }
    }

    function retrieve_geojson(data) {
        markers.clearLayers();
//        map.removeLayer(markers);
        layer_guidepost.clearLayers();
        layer_guidepost.addData(JSON.parse(data));
        markers.addLayer(layer_guidepost);
        map.addLayer(markers);
    }

    function error_gj(data) {
        console.log(data);
    }
}

