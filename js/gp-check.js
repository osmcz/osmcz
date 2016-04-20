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

    var layer_gpcheck = new L.GeoJSON(null, {
        onEachFeature: function (feature, layer) {
            if(feature.properties.class == "noref"){
              layer.setIcon(gp_check_noref_icon);
            } else if(feature.properties.class == "noimg"){
              layer.setIcon(gp_check_noimg_icon);
            } else {
              layer.setIcon(gp_check_icon);
            }
            var html_content = '<div class="gp-check-popup"><h6>' + feature.properties.name + '</h6>';
            html_content += '<button type="button" class="btn btn-info fa-4x">';
            html_content += '   <div class="glyphicon glyphicon-plus-sign no-foto"></div>';
            html_content += '</button><br/><br/>';
            if (feature.properties.class == 'missing') {
                html_content += ('<span class="glyphicon glyphicon-remove red"></span> chybí tag ref<br/>');
                html_content += ('<span class="glyphicon glyphicon-remove red"></span> chybí foto<br/>');
            }
            if (feature.properties.class == 'noref') {
                html_content += ('<span class="glyphicon glyphicon-remove red"></span> chybí tag ref<br/>');
                html_content += ('<span class="glyphicon glyphicon-remove red"></span> nepoužité/vadné foto<br/>');
            }
            if (feature.properties.class == 'noimg') {
                html_content += ('<span class="glyphicon glyphicon-remove red"></span> chybí foto<br/>');
            }
            html_content += '<br/><h6>Data v OSM</h6>';
            html_content += '<div id="gp-check" gp-check-id=' + feature.id + '></div>';
            html_content += '<br/><div class="osmid"><a href="http://osmap.cz/node/' + feature.id + '">osmap.cz/node/' + feature.id + '</a></div>';
            html_content += '</div>';
            layer.bindPopup(html_content, {
                offset: new L.Point(1, -32),
                minWidth: 150,
                closeOnClick: false,
                autoPan: true,
                keepInView: true,
                autoPanPadding: new L.Point(5, 5)
                });
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

    map.on('moveend', function(event) {
       load_data();
    });

    map.on('popupopen', function(e) {
      var osmid = e.popup._source.feature.id;
      $.ajax({
          url: 'http://www.openstreetmap.org' + OSM.apiUrl({type: "node", id: osmid}),
          dataType: 'xml',
          jsonp: false,
          global: false,
          success: function (data) {
              console.log("loaded xml", data);

              osmcz.permanentlyDisplayed = true;

              var geojson = osm_geojson.osm2geojson(data)
              var feature = geojson.features[0];
              var tags = feature.properties;
              feature.properties = {  //poloha.net style
                  tags: tags,
                  osm_id: osmid,
                  osm_type: "node"
              };

              //show result
              var gc = $('#gp-check');
              if (osmid == gc.attr('gp-check-id'))
                gc.html(osmcz.poiPopup.getHtml(feature, null, true));
          }
      });
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

