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
    var autoload_lock = false;

    // ExifMarker - show line between OSM and Exif coors
    var exifMarker = L.marker([0, 0], {clickable: false, title: 'Souřadnice z exifu fotky'});
    var osmExifPolyline = L.polyline([[0, 0], [0, 0]],  {color: 'purple', clickable: false, dashArray: '20,30', opacity: 0.8});


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

            // Choose right icon
            if(feature.properties.class == "noref"){
              layer.setIcon(gp_check_noref_icon);
            } else if(feature.properties.class == "noimg"){
              layer.setIcon(gp_check_noimg_icon);
            } else {
              layer.setIcon(gp_check_icon);
            }

            // Guidepost name
            var html_content = '<div class="gp-check-popup" id="'+ feature.id +'"><h6>' + feature.properties.name + '</h6>';

            // Missing image button including upload form
            var osmid = feature.id;
            var lat = feature.geometry.coordinates[1];
            var lon = feature.geometry.coordinates[0];
            html_content += '<div id="gpc-upload-img">';
            html_content += '  <button id="gpc-upload-btn" type="button" class="btn btn-info fa-4x center-block" onclick="osmcz.gpcheck.popupFormatToggle(' + osmid + ');return false;" title="Máte fotografii? Vložte ji prosím.">';
            html_content += '     <div class="glyphicon glyphicon-plus-sign no-foto vcenter"></div><span style="margin-left: 10px"><strong>Vložit fotografii</strong></span>';
            html_content += '  </button>';
            html_content += '  <form style="display:none" id="gpc-img-upload-form" data-osm-id="' + osmid + '" name="gpc-img-upload-form" method="post" enctype="multipart/form-data" target="upload_target">';
            html_content += '    <h5>Vložení fotografie rozcestníku</h5>';
            html_content += '    <input type="hidden" name="action" value="file" />';
            html_content += '    <input type="hidden" name="MAX_FILE_SIZE" value="10000000" />';
            html_content += '    <input type="hidden" id="lat" name="lat" value="' + lat + '" />';
            html_content += '    <input type="hidden" id="lon" name="lon" value="' + lon + '" />';
            html_content += '    <fieldset>';
            html_content += '        <img id="gpc-preview" height="200" onload="osmcz.gpcheck.readExif(this, ' + osmid + ')" src="" alt="Náhled fotografie..." style="display:none; margin-bottom:5px;"><br/>';
            html_content += '        <input name="uploadedfile" type="file" id="guidepostfile" onchange="osmcz.gpcheck.previewFile(' + osmid + ')" size="20" style="display: none"/>';
            html_content += '        <div id="imgSelBtnDiv" class="center-block">';
            html_content += '        <input type="button" id="imgSelBtn" value="Vyberte fotografii" onclick="osmcz.gpcheck.selectImageClicked('+osmid+');" class="btn btn-default btn-xs btn" />';
            html_content += '        <span id="gpc-img-message" style="padding-left: 10px"></span></div><br/>';
            html_content += '    </fieldset>';
            html_content += '    <fieldset>';
            html_content += '        <div id="coors-block" class="coors-block">';
            html_content += '          <span class="legend">Lat/Lon</span><span id="gpc-latlon-distance" class="pull-right"></span><br/>';
            html_content += '          <div class="row flex-v-center">';
            html_content += '            <div class="col-xs-3">';
            html_content += '              <label><input type="radio" name="coorsSource" id="rbSourceOsm" value="osm" checked="checked" onchange="osmcz.gpcheck.coordSourceChanged('+osmid+');">';
            html_content += '              Osm: </label>';
            html_content += '            </div>';
            html_content += '            <div class="col-xs-9">';
            html_content += '              <input type="text" id="latOsm" onchange="osmcz.gpcheck.latlonChanged('+osmid+');" name="latOsm" value="' + lat + '" osm-orig-value="' + lat + '" size="10" title="Lat" class="input-small"/> / ';
            html_content += '              <input type="text" id="lonOsm" onchange="osmcz.gpcheck.latlonChanged('+osmid+');" name="lonOsm" value="' + lon + '" osm-orig-value="' + lon + '" size="10" title="Lon" class="input-small"/>';
            html_content += '              <span id="gpc-latlon-message" style="padding-left: 5px"></span><br/>';
            html_content += '            </div>';
            html_content += '          </div>';
            html_content += '          <div class="row flex-v-center">';
            html_content += '            <div class="col-xs-3">';
            html_content += '              <label><input type="radio" name="coorsSource" id="rbSourceExif" value="photo" onchange="osmcz.gpcheck.coordSourceChanged('+osmid+');" disabled="yes">';
            html_content += '              Exif: </label>';
            html_content += '            </div>';
            html_content += '            <div class="col-xs-9">';
            html_content += '              <input type="text" id="latExif" name="latExif" value="--.---" size="10" title="Lat" class="input-small" disabled="yes"/> / ';
            html_content += '              <input type="text" id="lonExif"  name="lonExif" value="--.---" size="10" title="Lon" class="input-small" disabled="yes"/>';
            html_content += '            </div>';
            html_content += '          </div>';
            html_content += '        </div><br/>';
            html_content += '    </fieldset>';
            html_content += '    <fieldset>';
            html_content += '      <div class="coors-block">';
            html_content += '        <div class="row flex-v-center">';
            html_content += '          <div class="col-xs-3">';
            html_content += '            <label class="text-right">Autor: </label>';
            html_content += '          </div>';
            html_content += '          <div class="col-xs-9">';
            html_content += '            <input type="text" id="author" name="author" placeholder="Vaše jméno/přezdívka" size="20" onchange="osmcz.gpcheck.authorChanged(' + osmid + ')" class="input-small">';
            html_content += '          </div>';
            html_content += '        </div>';
            html_content += '        <div class="row flex-v-center">';
            html_content += '          <div class="col-xs-3">';
            html_content += '            <label>Ref: </label>';
            html_content += '          </div>';
            html_content += '          <div class="col-xs-9">';
            html_content += '            <input type="text" id="ref" name="ref" value="" size="20" class="input-small"/>';
            html_content += '          </div>';
            html_content += '        </div>';
            html_content += '        <div class="row flex-v-center">';
            html_content += '          <div class="col-xs-3">';
            html_content += '            <label>Poznámka: </label>';
            html_content += '          </div>';
            html_content += '          <div class="col-xs-9">';
            html_content += '            <input type="text" id="note" name="note" value="" size="20" placeholder="" class="input-small"/>';
            html_content += '          </div>';
            html_content += '        </div>';
            html_content += '      </div>';
            html_content += '    </fieldset><br/>';
            html_content += '    <fieldset>';
            html_content += '        <div class="row">';
            html_content += '          <div class="col-md-6 ">';
            html_content += '            <button id="backBtn" onclick="osmcz.gpcheck.popupFormatToggle(' + osmid + ');return false;" class="btn btn-default btn-xs">Zpět</button> ';
            html_content += '            <input type="reset" id="resetBtn" name="reset" value="Reset" onclick="osmcz.gpcheck.resetForm(' + osmid + ');return false;" class="btn btn-default btn-xs"/>';
//             html_content += '        <span style="margin:2em"></span>';
            html_content += '          </div>';
            html_content += '          <div class="col-md-2 col-md-offset-2">';
            html_content += '            <input type="submit" id="submitBtn" name="submitBtn" value="Nahrát fotografii" onclick="osmcz.gpcheck.uploadFormData(' + osmid + ');return false;" class="btn btn-default btn-xs"/>';
            html_content += '          </div>';
            html_content += '        </div>';
            html_content += '        <div id="gpc-upl-result" class="gpc-upl-result"></div>';
            html_content += '    </fieldset>';
            html_content += '  </form>';
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
            html_content += '</div>';

            // Data in OSM - element is filled during popup open event
            html_content += '<div id="gp-check" gp-check-id=' + feature.id + '>';
            html_content += '<br/><span class="glyphicon glyphicon-refresh text-info gly-spin"></span> Načítám podrobnosti z OSM.org</div>';

            // Links to node on osmap.cz and osm.org
            html_content += '<br/><div class="osmid"><a href="http://osmap.cz/node/' + feature.id + '">osmap.cz/node/' + feature.id + '</a>'; // @TODO: upravit, až bude HTTPS verze
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
      if (!autoload_lock) {
        load_data();
      }
    });

    map.on('popupopen', function(e) {
      var osmid = e.popup._source.feature.id;

      // exit when osmid is null
      if (! osmid) {
        return;
      }

      $.ajax({
          url: 'https://www.openstreetmap.org' + OSM.apiUrl({type: "node", id: osmid}),
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
              if (osmid == gc.attr('gp-check-id')) {
                gc.html('<h6>Data v OSM</h6>' + osmcz.poiPopup.getHtml(feature, null, true));
                if ('ref' in tags){
                  var ref =  $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #ref');;
                  ref.val(tags.ref);
                  ref.attr('osm-orig-value', tags.ref);
                }
              }
          }
      });
    });

    map.on('popupclose', function(e) {
      autoload_lock = false;
      cleanExifMarker();
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
            var geo_json_url = 'http://osm.fit.vutbr.cz/OsmHiCheck/gp/'; // @TODO: upravit, až bude HTTPS verze
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
    osmcz.gpcheck.callRemoteEditor = function(lon, lat) {
      $.ajax
         ({
             url: 'http://127.0.0.1:8111/load_and_zoom', // @FIXME: cross-domain+HTTPS? https://josm.openstreetmap.de/ticket/10033
             data: {
                 left:   lon - 0.0005,
                 top:    lat + 0.0005,
                 right:  lon + 0.0005,
                 bottom: lat - 0.0005
             },
             type: 'get'
         });
    }

    // Cleanup Exif marker
    function cleanExifMarker() {
        map.removeLayer(exifMarker);
        map.removeLayer(osmExifPolyline);
    }

    // Select image clicked
    osmcz.gpcheck.selectImageClicked = function(osmid){
        $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #guidepostfile').click();
    }

    // Generate and display preview of image
    osmcz.gpcheck.previewFile = function(osmid){
        var preview = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #gpc-preview'); //selects the query named img
        var file    = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #guidepostfile').prop("files")[0]; //sames as here
        var message = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #gpc-img-message');
        var reader  = new FileReader();

        var latExif = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #latExif');
        var lonExif = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #lonExif');
        var rbSourceExif = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] input[id="rbSourceExif"]');

        var distanceLabel = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #gpc-latlon-distance');

        preview.attr("src", "");
        preview.attr("alt", "Generuji náhled. Počkejte prosím...");
        latExif.val('--.---');
        lonExif.val('--.---');
        distanceLabel.html('');

        $("input[name=coorsSource][value=osm]").prop('checked', true);
        rbSourceExif.attr("disabled", "disabled");
        rbSourceExif.prop("checked",false);


        reader.onloadend = function () {
            preview.attr("src", reader.result);
            preview.attr("alt", "Náhled fotografie...");
        }

        message.html('');

        if (file) {
            reader.readAsDataURL(file); //reads the data as a URL
            preview.attr("style", "display:block");
            preview.attr("class", "center-block");

            // Check file size
            if (file.size > $("#gpc-img-upload-form input[name='MAX_FILE_SIZE']").val()) {
                message.html('<span class="glyphicon glyphicon-alert text-danger"></span> Soubor je moc velký!');
            }
        } else {
            preview.attr("src","");
            preview.attr("style", "display:none");
            message.html('<span class="glyphicon glyphicon-alert text-danger" title="Povinné pole!"></span>');
        }

        osmcz.gpcheck.updateSubmitBtnStatus(osmid);
    }

    // Read exif data of image
    osmcz.gpcheck.readExif = function(t, osmid){
        var preview = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #gpc-preview'); //selects the query named img
        var latExif = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #latExif');
        var lonExif = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #lonExif');
        var rbSourceExif = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] input[id="rbSourceExif"]');
        var latOsm = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #latOsm');
        var lonOsm = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #lonOsm');
        var lat = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #lat');
        var lon = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #lon');

        cleanExifMarker();

        function base64ToArrayBuffer (base64) {
            base64 = base64.replace(/^data\:([^\;]+)\;base64,/gmi, '');
            var binaryString = window.atob(base64);
            var len = binaryString.length;
            var bytes = new Uint8Array(len);
            for (var i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes.buffer;
        }

        var exif = EXIF.readFromBinaryFile(base64ToArrayBuffer(t.currentSrc));
        var eLatRef = exif.GPSLatitudeRef;
        var eLat = exif.GPSLatitude;
        var eLonRef = exif.GPSLongitudeRef;
        var eLon = exif.GPSLongitude;

        if (eLatRef != null && eLat!= null && eLonRef != null && eLon!= null) {
            latExif.val(DMSToDD(eLat[0], eLat[1], eLat[2], eLatRef, 5)); // how to get value of options.precision?
            lonExif.val(DMSToDD(eLon[0], eLon[1], eLon[2], eLonRef, 5));
            rbSourceExif.removeAttr("disabled");
            rbSourceExif.prop("checked",true);
            lat.val(latExif.val());
            lon.val(lonExif.val());
            exifMarker.setLatLng([latExif.val(), lonExif.val()]).addTo(map);
            osmExifPolyline.setLatLngs([L.latLng(latOsm.attr("osm-orig-value"), lonOsm.attr("osm-orig-value")), L.latLng(latExif.val(), lonExif.val())]).addTo(map);
            updateDistanceLabel(osmid);
        }
    }

    function updateDistanceLabel(osmid) {

        var latExif = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #latExif');
        var lonExif = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #lonExif');
        var latOsm = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #latOsm');
        var lonOsm = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #lonOsm');
        var distanceLabel = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #gpc-latlon-distance');


        if (latExif.val() != "--.---" && !osmcz.coorsError ) {
            var distance = Math.abs(OSM.distance( {'lat': latOsm.val(), 'lng': lonOsm.val()},
                                                  {'lat': latExif.val(), 'lng': lonExif.val()})).toFixed(2);
            if (distance > 50.01) {
              distanceLabel.html('<span class="glyphicon glyphicon-alert text-warning"></span> '+
                                 '<strong class="text-warning" title="Rozdíl exif a osm souřadnic je větší než 50 metrů">(Rozdíl: ' +
                                  distance.replace(/(\d)(?=(\d{3})+\.)/g, '$1 ') + ' metrů)</strong>');
            } else {
              distanceLabel.html("(Rozdíl: " + distance.replace(/(\d)(?=(\d{3})+\.)/g, '$1 ') + " metrů)");
            }
        } else {
            distanceLabel.html("");
        }
    }
    // Check author field, show alert when missing
    osmcz.gpcheck.authorChanged = function(osmid) {
        var author = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #author');
        author.removeClass("inputError");
        author.prop("title","");
        osmcz.authorError = false;

        if (author.val() == '') {
          author.addClass("inputError");
          author.prop("title","Povinné pole!");
          osmcz.authorError = true;
        } else {
            if (author.val() != Cookies.get("_gp_check_author")) {
                Cookies.set("_gp_check_author", author.val(), {expires: 90});
            }
        }

        osmcz.gpcheck.updateSubmitBtnStatus(osmid);
    }

    osmcz.gpcheck.latlonChanged = function(osmid) {
        var latOsm = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #latOsm');
        var lonOsm = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #lonOsm');
        var lat = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #lat');
        var lon = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #lon');
        var coorsSource = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] input[name="coorsSource"]:checked').val();

        latOsm.removeClass("inputError");
        latOsm.prop("title","");

        lonOsm.removeClass("inputError");
        lonOsm.prop("title","");

        osmcz.coorsError = false;

        if (latOsm.val() == '') {
            latOsm.addClass("inputError");
            latOsm.prop("title","Povinné pole!");
            osmcz.coorsError = true;
        }

        if (lonOsm.val() == '') {
            lonOsm.addClass("inputError");
            lonOsm.prop("title","Povinné pole!");
            osmcz.coorsError = true;
        }

        if (latOsm.val() < -90 || latOsm.val() > 90) {
            latOsm.addClass("inputError");
            latOsm.prop("title","Hodnota mimo rozsah!");
            osmcz.coorsError = true;
        }

        if (lonOsm.val() < -180 || lonOsm.val() > 180) {
            lonOsm.addClass("inputError");
            lonOsm.prop("title","Hodnota mimo rozsah!");
            osmcz.coorsError = true;
        }

        if (!osmcz.coorsError && coorsSource == "osm") {
            lat.val(latOsm.val());
            lon.val(lonOsm.val());
        }

        updateDistanceLabel(osmid);

        osmcz.gpcheck.updateSubmitBtnStatus(osmid);
    }

    osmcz.gpcheck.coordSourceChanged = function(osmid) {
        var lat = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #lat');
        var lon = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #lon');
        var latOsm = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #latOsm');
        var lonOsm = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #lonOsm');
        var latExif = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #latExif');
        var lonExif = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #lonExif');
        var message = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #gpc-latlon-message');

        var coorsSource = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] input[name=coorsSource]:checked').val();

        if (coorsSource == "photo" ) {
          lat.val(latExif.val());
          lon.val(lonExif.val());
        } else {
          if (message.html() == '') {
              lat.val(latOsm.val());
              lon.val(lonOsm.val());
          }
        }
    }

    // Check status of message fields, disable submit button when there is any issue
    osmcz.gpcheck.updateSubmitBtnStatus = function(osmid) {
        var imgMsg = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #gpc-img-message');
        var submitBtn = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #submitBtn');

        if (imgMsg.contents().size() == 0 &&
            !osmcz.authorError &&
            !osmcz.coorsError
           )
        {
            submitBtn.prop('disabled', false);
        } else {
            submitBtn.prop('disabled', true);
        }
    }

    // Toggle between info page and image upload form
    osmcz.gpcheck.popupFormatToggle = function(osmid) {
        if ( $("#gpc-img-upload-form").css('display') == 'none' ){
            $("#gpc-upload-btn").hide();
            $("#gpc-missing").hide();
            $("#gp-check").hide();
            $("#gp-check-edit-btns").hide();
            if (Cookies.get("_gp_check_author") != null)
                $("#author").val(Cookies.get("_gp_check_author"));
            $("#imgSelBtn").focus();
            $("#gpc-img-upload-form").show(200);
            osmcz.gpcheck.previewFile(osmid);
            osmcz.gpcheck.authorChanged(osmid);
            autoload_lock = true;
        } else {
            autoload_lock = false;
            cleanExifMarker();
            $("#gpc-img-upload-form").hide();
            $("#gpc-upload-btn").show(50);
            $("#gp-check-edit-btns").show(50);
            $("#gpc-missing").show(50);
            $("#gp-check").show(100);
        }
    }

    // Reset form
    osmcz.gpcheck.resetForm = function(osmid) {
        var preview = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #gpc-preview');
        var imgMessage = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #gpc-img-message');

        var latExif = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #latExif');
        var lonExif = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #lonExif');
        var rbSourceExif = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] input[id="rbSourceExif"]');

        var latOsm = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #latOsm');
        var lonOsm = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #lonOsm');

        var distanceLabel = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #gpc-latlon-distance');

        var author = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #author');
        var ref = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #ref');
        var note = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #note');

        var resultMessage = $("#gpc-upl-result").html('<span class="glyphicon glyphicon-refresh text-info gly-spin"></span>');


        cleanExifMarker();

        preview.attr("src", '');
        preview.attr("alt", '');
        preview.hide();
        latExif.val('--.---');
        lonExif.val('--.---');
        $("input[name=coorsSource][value=osm]").prop('checked', true);
        rbSourceExif.attr("disabled", "disabled");
        rbSourceExif.prop("checked",false);

        distanceLabel.html('');
        imgMessage.html('<span class="glyphicon glyphicon-alert text-danger" title="Povinné pole!"></span>');

        latOsm.removeClass("inputError");
        latOsm.prop("title","");
        latOsm.val(latOsm.attr("osm-orig-value"));

        lonOsm.removeClass("inputError");
        lonOsm.prop("title","");
        lonOsm.val(lonOsm.attr("osm-orig-value"));

        osmcz.coorsError = false;

        author.removeClass("inputError");
        author.prop("title","");
        osmcz.authorError = false;
        author.val('');

        if (Cookies.get("_gp_check_author") != null)
          $("#author").val(Cookies.get("_gp_check_author"));

        ref.val(ref.attr("osm-orig-value"));
        note.val('');

        resultMessage.html('');

        osmcz.gpcheck.authorChanged(osmid);
        osmcz.gpcheck.latlonChanged(osmid);

    }

    // Upload form via ajax
    osmcz.gpcheck.uploadFormData = function(osmid) {
        var formData = new FormData($('#gpc-img-upload-form[data-osm-id="' + osmid + '"]')[0]);

        $("#gpc-upl-result").html('<span class="glyphicon glyphicon-refresh text-info gly-spin"></span>');

        $.ajax({
//              url: 'http://localhost/api/upload/guidepost.php',
            url: 'http://map.openstreetmap.cz/guidepost.php', // @TODO: upravit, až bude funkční HTTPS verze
            type: 'POST',
            data: formData,
            async: false,
            success: function (data) {
                var message = $("#gpc-upl-result");
                // Find row with "parent.stop_upload" function and extract it's parameters
                var result = data.match(/parent.stop_upload(.*);/gm).toString().replace("parent.stop_upload", "").replace(/^\(/,"").replace(");","").split(/,(?![^']*'(?:(?:[^']*'){2})*[^']*$)/);

                if (result[0] == 1) { //OK
                    message.html(' <span class="text-success"><span class="glyphicon glyphicon-ok text-success"></span> <strong>OK</strong></span>');
                } else { // Error during upload
                    message.html(' <span class="text-danger"><span class="glyphicon glyphicon-alert text-danger"></span> <u> Chyba:</u> ' + result[1] + '</span>');
                }
            },
            fail: function(data) {
                var message = $("#gpc-upl-result");
                message.html(' <span class="text-danger"><span class="glyphicon glyphicon-alert text-danger"></span> <u>Chyba:</u> ' + data +'</span>');
                return false;
            },
            cache: false,
            contentType: false,
            processData: false
        });

        return false;
    }

    function error_gj(data) {
        console.log(data);
    }
};

