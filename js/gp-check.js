/*
 guidepost check from OsmHiCheck for osmcz
 Javascript code for openstreetmap.cz website
 Copyright (C) 2015-2017

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

 (c) 2016-2017 osmcz-app, https://github.com/osmcz/osmcz

 */

var osmcz = osmcz || {};
osmcz.gpcheck = function (map, baseLayers, overlays, controls, group) {
    // -- constructor --

    var layersControl = controls.layers;
    var xhr;
    var check_markers = L.markerClusterGroup({
        code: 'B',
        chunkedLoading: true,
        chunkProgress: update_progress_bar
    });
    var autoload_lock = false;
    var photoGuiForm;
    var gpref, gpname;
    var openPopup;

    var gp_check_icon = L.icon({
        iconUrl: osmcz.basePath + "img/gp_check_missing.png",
        iconSize: [48, 48],
        iconAnchor: [23, 45]
    });
    var gp_check_noref_icon = L.icon({
        iconUrl: osmcz.basePath + "img/gp_check_noref.png",
        iconSize: [48, 48],
        iconAnchor: [23, 45]
    });
    var gp_check_noimg_icon = L.icon({
        iconUrl: osmcz.basePath + "img/gp_check_noimg.png",
        iconSize: [48, 48],
        iconAnchor: [23, 45]
    });
    var gp_check_tourism_icon = L.icon({
        iconUrl: osmcz.basePath + "img/gp_check_tourism.png",
        iconSize: [48, 48],
        iconAnchor: [23, 45]
    });

    var layer_gpcheck = new L.GeoJSON(null, {
        onEachFeature: function (feature, layer) {

            // Choose right icon
            if (feature.properties.class == "noref") {
                layer.setIcon(gp_check_noref_icon);
            } else if (feature.properties.class == "noimg") {
                layer.setIcon(gp_check_noimg_icon);
            } else if(feature.properties.class == "tourism"){
                layer.setIcon(gp_check_tourism_icon);
            } else {
                layer.setIcon(gp_check_icon);
            }

            // Guidepost name
            var html_content = '<div class="gp-check-popup" id="' + feature.id + '"><h6>' + feature.properties.name + '</h6>';

            // Missing image button including upload form
            var osmid = feature.id;
            var lat = feature.geometry.coordinates[1];
            var lon = feature.geometry.coordinates[0];
            html_content += '<div id="gpc-upload-img">';
            html_content += '  <button id="gpc-upload-btn" type="button" class="btn btn-info fa-4x center-block" onclick="osmcz.gpcheck.openForm(' + osmid + ');return false;" title="Máte fotografii? Vložte ji prosím.">';
            html_content += '     <div class="glyphicon glyphicon-plus-sign no-foto vcenter"></div><span style="margin-left: 10px"><strong>Vložit fotografii</strong></span>';
            html_content += '  </button>';
            html_content += '</div>';

            // List of missing thinks
            html_content += '<div id="gpc-missing"><br/>';
            if (feature.properties.class == 'missing') {
                html_content += ('<span class="glyphicon glyphicon-remove text-danger"></span> chybí tag ref<br/>');
                html_content += ('<span class="glyphicon glyphicon-remove text-danger"></span> chybí foto<br/>');
            }
            if (feature.properties.class == 'noref') {
                html_content += ('<span class="glyphicon glyphicon-remove text-danger"></span> chybí tag ref<br/>');
                html_content += ('<span class="glyphicon glyphicon-remove text-danger"></span> nepoužité/vadné foto<br/>');
            }
            if (feature.properties.class == 'noimg') {
                html_content += ('<span class="glyphicon glyphicon-remove text-danger"></span> chybí foto<br/>');
            }
            if (feature.properties.class == 'tourism') {
		html_content += ('<span class="glyphicon glyphicon-remove text-danger"></span> jen tourism=info<br/>');
            }
            html_content += '</div>';

            // Data in OSM - element is filled during popup open event
            html_content += '<div id="gp-check" gp-check-id=' + feature.id + '>';
            html_content += '<br/><span class="glyphicon glyphicon-refresh text-info gly-spin"></span> Načítám podrobnosti z OSM.org</div>';

            // Links to node on osmap.cz and osm.org
            html_content += '<br/><div class="osmid"><a href="https://osmap.cz/node/' + feature.id + '">osmap.cz/node/' + feature.id + '</a>';
            html_content += ' | <a href="https://openstreetmap.org/node/' + feature.id + '">OSM.org</a><br/>';

            // Edit in iD button
            html_content += '<div id="gp-check-edit-btns">';
            html_content += '  <a href="https://www.openstreetmap.org/edit?editor=id&node=' + feature.id + '"><button type="button" class="btn btn-default btn-xs">';
            html_content += '     <div class="glyphicon glyphicon-pencil"></div> iD';
            html_content += '  </button></a> ';

            // Edit in JOSM/Merkaartor button
            html_content += '  <a href="#"><button type="button" class="btn btn-default btn-xs"';
            html_content += '   onclick="osmcz.gpcheck.callRemoteEditor(' + feature.geometry.coordinates + ')">';
            html_content += '  <div class="glyphicon glyphicon-pencil"></div> JOSM / Merkaartor';
            html_content += '  </button></a>';
            html_content += '  </div>';
            html_content += '</div>';

            layer.bindPopup(html_content, {
                offset: new L.Point(1, -32),
                minWidth: 150,
                closeOnClick: false,
                autoPan: false,
                keepInView: true,
                autoPanPadding: new L.Point(5, 5)
            });
        }
    });


    map.on('layeradd', function (event) {
        if (event.layer == check_markers) {
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

    map.on('moveend', function (event) {
        if (!autoload_lock) {
            load_data();
        }
    });

    map.on('popupopen', function (e) {
        // return if incorrect popup
        if (!(e.popup && e.popup._source && e.popup._source.feature)) {
            return;
        }

        var osmid = e.popup._source.feature.id;
        openPopup = e.popup;

        // exit when osmid is null
        if (!osmid) {
            return;
        }

        if (sidebar.isVisible()) {
            sidebar.hide();
        }

        $.ajax({
            url: 'https://www.openstreetmap.org' + OSM.apiUrl({type: "node", id: osmid}),
            dataType: 'xml',
            jsonp: false,
            global: false,
            success: function (data) {
//                 console.log("loaded xml", data);

                osmcz.permanentlyDisplayed = true;

                var geojson = osm_geojson.osm2geojson(data);
                var feature = geojson.features[0];
                var tags = feature.properties;
                feature.properties = {  //poloha.net style
                    tags: tags,
                    osm_id: osmid,
                    osm_type: "node"
                };

                //show result
                var gc = $('#gp-check');
                if (osmid == gc.attr('gp-check-id')) {
                    gc.html('<h6>Data v OSM</h6>' + osmcz.poiPopup.getHtml(feature, null, true));
                    if ('ref' in tags) {
                        osmcz.gpcheck.gpref = tags.ref;
                    }

                    if ('name' in tags) {
                        osmcz.gpcheck.gpname = tags.name;
                    }
                }
            }
        });
    });

    map.on('popupclose', function (e) {
        autoload_lock = false;
    });

    /* Add overlay to the map */
    layersControl.addOverlay(check_markers, "Chybné rozcestníky", group);

    /* Add overlay to the overlays list as well
     * This allows restoration of overlay state on load */
    overlays[group]["Chybné rozcestníky"] = check_markers;

    // -- methods --

    function isLayerChosen() {
        return map.hasLayer(check_markers);
    }

    function request_from_url(url, success_callback, error_callback) {
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
            var geo_json_url = 'https://osm.fit.vutbr.cz/OsmHiCheck/gp/';
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

    // TODO: separate this to some library
    osmcz.gpcheck.callRemoteEditor = function (lon, lat) {
        $.ajax
        ({
            url: 'http://127.0.0.1:8111/load_and_zoom', // @FIXME: cross-domain+HTTPS? https://josm.openstreetmap.de/ticket/10033
            data: {
                left: lon - 0.0005,
                top: lat + 0.0005,
                right: lon + 0.0005,
                bottom: lat - 0.0005
            },
            type: 'get'
        });
    }

    osmcz.gpcheck.openForm = function (osmid) {
        photoGuiForm = L.control.photoDbGui();
        photoGuiForm._map = map;
        photoGuiForm.positionMarkerVisible = false;

        photoGuiForm.openSidebar(osmcz.gpcheck.gpref, osmcz.gpcheck.gpname);
        openPopup.remove();
        openPopup = null;
        osmcz.gpcheck.gpref = '';
        osmcz.gpcheck.gpname = '';
    }

    function error_gj(data) {
        console.log(data);
    }

    function update_progress_bar(processed, total, elapsed, layers_array) {
        if (elapsed > 1000) {
            // if it takes more than a second to load, display the progress bar:
            // tbd see http://leaflet.github.io/Leaflet.markercluster/example/marker-clustering-realworld.50000.html
        }

        if (processed === total) {
            // all markers processed - hide the progress bar:
        }
    }
};
