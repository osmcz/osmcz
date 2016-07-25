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

    var layersControl = controls.layers;
    var xhr;
    var markers = L.markerClusterGroup({code: 'G'});
    var moving_marker;
    var autoload_lock = false;
    var moving_flag = false;
    var gp_id;
    var gp_lat;
    var gp_lon;

    var guidepost_icon = L.icon({
      iconUrl: osmcz.basePath + "img/guidepost.png",
      iconSize: [48, 48],
      iconAnchor: [23, 45]
    });

    var infopane_icon = L.icon({
      iconUrl: osmcz.basePath + "img/infopane.png",
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

            // fill hashtags
            function parse_hashtags(pt) {
              if ( pt != null ) {
                var tags = pt.split(';');
                if (tags.length > 0) {

                  var i, tags_content = "";
                  for (i = 0; i < tags.length; i++) {
                    tags_content += '<a href="https://api.openstreetmap.cz/table/hashtag/' + tags[i] + '"><span id="hashtag" class="label label-info">' + tags[i].replace(/:$/, "") + '</span></a> ';
                  }
                  return (tags_content);
                } else {
                  return ("");
                }
              } else {
                return ("");
              }
            }

            var b = feature.properties;
            var geometry = feature.geometry.coordinates;

            var ftype;

            if (b.tags && b.tags.indexOf("infotabule") > -1) {
              ftype = "infopane";
            } else {
              ftype = "guidepost";
            }

            if (!b.ref) {
                b.ref = "nevíme";
            }

            var html_content = "";
            html_content += "Fotografii poskytl: ";
            html_content += "<a href='https://api.openstreetmap.cz/table/name/" + b.attribution + "'>" + b.attribution + "</a>";
            html_content += "<br>";
            if (ftype == "guidepost" ) {
              html_content += "Číslo rozcestníku: ";
              html_content += "<a href='https://api.openstreetmap.cz/table/ref/"+ (b.ref == "nevíme" ? "none" : b.ref) + "'>" + b.ref + "</a>";
              html_content += "<br>";
            }
            html_content += "<a href='https://api.openstreetmap.cz/" + b.url + "'>";
            html_content += "<img src='https://api.openstreetmap.cz/" + b.url + "' width='180' alt='" + b.name + "'>";
            html_content += "</a>";

            html_content += "<div id='hashtags'>" + parse_hashtags(b.tags) + "</div>";

            html_content += "<div class='buttons-bar'>";
            html_content += "<a href='https://api.openstreetmap.cz/table/id/" + b.id + "'><button type='button' class='btn btn-default btn-xs'>";
            html_content += '   <div class="glyphicon glyphicon-pencil"></div> Upravit';
            html_content += '</button></a>';

            html_content += "<span class='space-2em'/>";

            html_content += "<a href='#'>";
            html_content += '<button type="button" class="btn btn-default btn-xs"';
            html_content += "onclick='javascript:guideposts.move_point(" + b.id + "," + geometry[1] + "," + geometry[0] + ")'>";
            html_content += '<div class="glyphicon glyphicon-move"></div> Přesunout';
            html_content += "</button>";
            html_content += "</a>";
            html_content += "</div>";

            if (ftype == "infopane") {
              layer.setIcon(infopane_icon);
            } else {
              layer.setIcon(guidepost_icon);
            }

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
            layer.on('click', function(e) {autoload_lock = true;});
            layer.setIcon(commons_icon);
            layer.bindPopup(feature.properties.desc, {
              closeOnClick: false,
              autoPan: false,
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

//         console.log(map.hasLayer(markers));

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
            if (!moving_marker) {
                var position = L.latLng(e.latlng.lat, e.latlng.lng);
                create_moving_marker(e.latlng.lat, e.latlng.lng);
                update_sidebar(get_distance(moving_marker, position), position.lat, position.lng);
            } else {
                //move marker to clicked position (to prevent losing it)
                var new_position = L.latLng(e.latlng.lat, e.latlng.lng);
                update_sidebar(get_distance(moving_marker, new_position), new_position.lat, new_position.lng);
                moving_marker.setLatLng(new_position)
            }
        }
    });

    /* Add overlay to the map */
    layersControl.addOverlay(markers, "Foto rozcestníků");

    /* Add overlay to the overlays list as well
     * This allows restoration of overlay state on load */
    overlays["Foto rozcestníků"] = markers;

    // -- methods --

    function get_distance(marker, new_pos)
    {
      var position = marker.getLatLng();
      var origposition = L.latLng(gp_lat, gp_lon);
      return position.distanceTo(origposition);
    }

    function create_moving_marker(lat, lon)
    {
        moving_marker = new L.marker(new L.LatLng(lat, lon), {
          draggable: true
        });

        moving_marker
        .on('drag', function(event){
            var marker = event.target;
            var position = marker.getLatLng();
            var origposition = L.latLng(gp_lat, gp_lon);
            var distance = position.distanceTo(origposition);

            update_sidebar(distance, position.lat, position.lng);
        })
        .on('dragend', function(event){
            var marker = event.target;
            var position = marker.getLatLng();
            var origposition = L.latLng(gp_lat, gp_lon);
            var distance = position.distanceTo(origposition);

            update_sidebar(distance, position.lat, position.lng);
        });

        moving_marker.bindPopup('Presuň mě na cílové místo');
        moving_marker.addTo(map);
        //moving_flag = false; //user will now interact with placed marker until he is done
    }

    function destroy_moving_marker()
    {
        map.removeLayer(moving_marker);
//        moving_marker.clearLayers();
        moving_marker = null;
    }

    osmcz.guideposts.prototype.cancel_moving = function()
    {
        moving_flag = false;
        if (moving_marker) {
            destroy_moving_marker();
        }
        hide_sidebar();
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

        $.ajax({
          type: 'POST',
          url: 'https://api.openstreetmap.cz/table/move',
          data: 'id=' + gp_id + '&lat=' + final_lat + '&lon=' + final_lon,
          timeout:3000
        })
        .done(function(data) {
            return true;
        })
        .fail(function() {
            return false;
        })
        .always(function(data) {
        });

        note.note_api(1,1,"nazdar");

        hide_sidebar();
    }

    function update_sidebar(distance, lat, lon)
    {
        var info = document.getElementById("guidepost_move_info");

        info.innerHTML = "<p>lat, lon:</p>";
        info.innerHTML += lat.toFixed(6) + "," + lon.toFixed(6) + "<br>";
        info.innerHTML += "Vzdálenost " + distance.toFixed(1) + "m";
    }

    function hide_sidebar()
    {
        var sidebar = document.getElementById("map-sidebar");
        sidebar.style.display = "none";
    }

    function show_sidebar()
    {
        sidebar_init();

        var sidebar = document.getElementById("map-sidebar");
        sidebar.style.display = "block";

        var content = document.getElementById("sidebar-content");
        content.innerHTML = "<h1>Přesun rozcestníku</h1>";
        content.innerHTML += "<p>Vyberte novou pozici a stiskněte tlačítko [Přesunout sem]</p>";
        content.innerHTML += "<h3>Současná pozice</h3>";
        content.innerHTML += "<p>lat, lon:</p>";
        content.innerHTML += "<p>" + gp_lat.toFixed(6) + "," + gp_lon.toFixed(6) + "</p>";
        content.innerHTML += "<h3>Přesunujete na</h3>";
        content.innerHTML += "<div id='guidepost_move_info'>";
        content.innerHTML += "Klikněte do mapy";
        content.innerHTML += "</div>";
        content.innerHTML += "<h3>poslat informaci</h3>";
        content.innerHTML += "<textarea rows='1' cols='15'>id:" + gp_id + "moje zprava</textarea>";
        content.innerHTML += "<hr>";
        content.innerHTML += "<button class='btn btn-default btn-xs' onclick='javascript:guideposts.finish_moving()'>Přesunout sem</button>";
        content.innerHTML += "<button class='btn btn-default btn-xs' onclick='javascript:guideposts.cancel_moving()'>Zrušit</button>";
    }

    osmcz.guideposts.prototype.move_point = function(gid, glat, glon)
    {
        if (!moving_flag) {
            moving_flag = true;
            gp_id = gid;
            gp_lat = glat;
            gp_lon = glon;
            show_sidebar();
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

            var geo_json_url = 'https://api.openstreetmap.cz/table/all';
            request_from_url(geo_json_url, retrieve_geojson, error_gj)

            geo_json_url = 'https://api.openstreetmap.cz/commons';
            request_from_url(geo_json_url, retrieve_commons, error_gj)

        } else {
            layer_guidepost.clearLayers();
        }
    }

    function retrieve_geojson(data) {
        layer_guidepost.clearLayers();
        if (data != "") {
            layer_guidepost.addData(JSON.parse(data));
            markers.addLayer(layer_guidepost);
            map.addLayer(markers);
        }
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

    function sidebar_init()
    {
        var sidebar = document.getElementById("map-sidebar");
        var hc = "";

        hc += "<div class='sidebar-inner'>";
        hc += "<!--sidebar from guideposts--> ";
        hc += "<button type='button' id='sidebar-close-button' class='close' onclick='$(this).parent().parent().hide(); guideposts.cancel_moving();'><span aria-hidden='true'>&times;</span></button>";
        hc += "  <script>";
        hc += "    $('sidebar-close-button').on('click', function(e) {";
        hc += "      $('document').trigger('sidebar-close')";
        hc += "    });";
        hc += "  </script>";
        hc += "  <div id='sidebar-content'>";
        hc += "    <h2>Ahoj</h2>";
        hc += "    <p>Zde se normalne nachazi uzitecne informace</p>";
        hc += "  </div>";
        hc += "</div>";

        sidebar.innerHTML = hc;
    }

};

