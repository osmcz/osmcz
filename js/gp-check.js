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
//             html_content += '  <button id="gpc-upload-btn" type="button" class="btn btn-info fa-4x" onclick="$(this).hide(); $(\'#gpc-missing\').hide();$(\'#gp-check\').hide();$(\'#gpc-img-upload-form\').show(200);return false">';
            html_content += '  <button id="gpc-upload-btn" type="button" class="btn btn-info fa-4x center-block" onclick="osmcz.gpcheck.popupFormatToggle(' + osmid + ');return false;" title="Máte fotografii? Vložte ji prosím.">';
            html_content += '     <div class="glyphicon glyphicon-plus-sign no-foto vcenter"></div><span style="margin-left: 10px"><strong>Vložit fotografii</strong></span>';
            html_content += '  </button>';
            html_content += '  <form style="display:none" id="gpc-img-upload-form" data-osm-id="' + osmid + '" name="gpc-img-upload-form" method="post" enctype="multipart/form-data" target="upload_target">';
            html_content += '    <h5>Vložení fotografie rozcestníku</h5>';
            html_content += '    <input type="hidden" name="action" value="file" />';
            html_content += '    <input type="hidden" name="MAX_FILE_SIZE" value="10000000" />';
            html_content += '    <fieldset>';
            html_content += '        <img src="" id="gpc-preview" height="200" alt="Náhled fotografie..."/ style="display:none; margin-bottom:5px;"><br/>';
            html_content += '        <input name="uploadedfile" type="file" id="guidepostfile" onchange="osmcz.gpcheck.previewFile(' + osmid + ')" size="20" style="display: none"/>';
            html_content += '        <input type="button" id="imgSelBtn" value="Vyberte fotografii" onclick="osmcz.gpcheck.selectImageClicked('+osmid+');" class="btn btn-default btn-xs" />';
            html_content += '        <span id="gpc-img-message" style="padding-left: 10px"></span><br/>';
            html_content += '    </fieldset>';
            html_content += '    <fieldset>';
            html_content += '        <label>autor: </label><input type="text" id="author" name="author" placeholder="Vaše jméno/přezdívka" size="20" onchange="osmcz.gpcheck.authorChanged(' + osmid + ')" class="input-small">';
            html_content += '        <span id="gpc-author-message" style="padding-left: 5px"></span><br/>';
            html_content += '        <label>lat/lon: </label>';
            html_content += '        <input type="text" id="lat" onchange="osmcz.gpcheck.latlonChanged('+osmid+');" name="lat" value="' + lat + '" size="10" title="Lat" class="input-small"/> / ';
            html_content += '        <input type="text" id="lon" onchange="osmcz.gpcheck.latlonChanged('+osmid+');" name="lon" value="' + lon + '" size="10" title="Lon" class="input-small"/>';
            html_content += '        <span id="gpc-latlon-message" style="padding-left: 5px"></span><br/>';
            html_content += '        <label>ref: </label><input type="text" id="ref" name="ref" value="" size="20" class="input-small"/><br/>';
            html_content += '        <label>Poznámka: </label><input type="text" id="note" name="note" value="" size="20" placeholder="" class="input-small"/>';
            html_content += '    </fieldset><br/>';
            html_content += '    <fieldset>';
            html_content += '        <button id="backBtn" onclick="osmcz.gpcheck.popupFormatToggle(' + osmid + ');return false;" class="btn btn-default btn-xs">Zpět</button> ';
            html_content += '        <span style="margin:2em"></span>';
            html_content += '        <input type="reset" id="resetBtn" name="reset" value="Reset" class="btn btn-default btn-xs"/>';
            html_content += '        <input type="submit" id="submitBtn" name="submitBtn" value="Nahrát fotografii" onclick="osmcz.gpcheck.uploadFormData(' + osmid + ');return false;" class="btn btn-default btn-xs"/>';
            html_content += '        <span id="gpc-upl-result" style="padding-left: 10px"></span>';
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
            html_content += '<div id="gp-check" gp-check-id=' + feature.id + '></div>';

            // Links to node on osmap.cz and osm.org
            html_content += '<br/><div class="osmid"><a href="http://osmap.cz/node/' + feature.id + '">osmap.cz/node/' + feature.id + '</a>';
            html_content += ' | <a href="http://openstreetmap.org/node/' + feature.id + '">OSM.org</a><br/>';

            // Edit in iD button
            html_content += '<a href="http://www.openstreetmap.org/edit?editor=id&node=' + feature.id + '"><button type="button" class="btn btn-default btn-xs">';
            html_content += '   <div class="glyphicon glyphicon-pencil"></div> iD';
            html_content += '</button></a> ';

            // Edit in JOSM/Merkaartor button
            html_content += '<a href="#"><button type="button" class="btn btn-default btn-xs"';
            html_content += ' onclick="osmcz.gpcheck.callRemoteEditor(' + feature.geometry.coordinates + ')">';
            html_content += '<div class="glyphicon glyphicon-pencil"></div> JOSM / Merkaartor';
            html_content += '</button></a>';
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
              if (osmid == gc.attr('gp-check-id')) {
                gc.html('<h6>Data v OSM</h6>' + osmcz.poiPopup.getHtml(feature, null, true));
                if ('ref' in tags){
                  var ref =  $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #ref');;
                  ref.val(tags.ref);
                }
              }
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

    // TODO: separate this to some library
    osmcz.gpcheck.callRemoteEditor = function(lon, lat) {
      $.ajax
         ({
             url: 'http://127.0.0.1:8111/load_and_zoom',
             data: {
                 left:   lon - 0.0005,
                 top:    lat + 0.0005,
                 right:  lon + 0.0005,
                 bottom: lat - 0.0005
             },
             type: 'get'
         });
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

        preview.attr("src", "");
        preview.attr("alt", "Generuji náhled. Počkejte prosím...");

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

    // Check author field, show alert when missing
    osmcz.gpcheck.authorChanged = function(osmid) {
        var author = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #author');
        var message = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #gpc-author-message');
        message.html('');

        if (author.val() == '') {
            message.html('<span class="glyphicon glyphicon-alert text-danger" title="Povinné pole!"></span>');
        } else {
            if (author.val() != Cookies.get("_gp_check_author")) {
                Cookies.set("_gp_check_author", author.val(), {expires: 90});
            }

        }

        osmcz.gpcheck.updateSubmitBtnStatus(osmid);
    }

    osmcz.gpcheck.latlonChanged = function(osmid) {
        var lat = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #lat');
        var lon = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #lon');
        var message = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #gpc-latlon-message');
        message.html('');

        if (lat.val() == '' || lon.val() == '') {
            message.html('<span class="glyphicon glyphicon-alert text-danger" title="Povinné pole!"></span>');
        }

        if (lat.val() < -90 || lat.val() > 90) {
            message.html('<span class="glyphicon glyphicon-alert text-danger" title="Lat: Hodnota mimo rozsah!"></span>');
        }

        if (lon.val() < -180 || lon.val() > 180) {
            message.html('<span class="glyphicon glyphicon-alert text-danger" title="Lon: Hodnota mimo rozsah!"></span>');
        }

        osmcz.gpcheck.updateSubmitBtnStatus(osmid);
    }

    // Check status of message fields, disable submit button when there is any issue
    osmcz.gpcheck.updateSubmitBtnStatus = function(osmid) {
        var imgMsg = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #gpc-img-message');
        var authorMsg = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #gpc-author-message');
        var latlonMsg = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #gpc-latlon-message');
        var submitBtn = $('#gpc-img-upload-form[data-osm-id="' + osmid + '"] #submitBtn');

        if (imgMsg.contents().size() == 0 &&
            authorMsg.contents().size() == 0 &&
            latlonMsg.contents().size() == 0
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
            if (Cookies.get("_gp_check_author") != null)
                $("#author").val(Cookies.get("_gp_check_author"));
            $("#imgSelBtn").focus();
            $("#gpc-img-upload-form").show(200);
            osmcz.gpcheck.previewFile(osmid);
            osmcz.gpcheck.authorChanged(osmid);
        } else {
            $("#gpc-img-upload-form").hide();
            $("#gpc-upload-btn").show(50);
            $("#gpc-missing").show(50);
            $("#gp-check").show(100);
        }
    }

    // Check form values and upload form via ajax
    osmcz.gpcheck.uploadFormData = function(osmid) {
        var formData = new FormData($('#gpc-img-upload-form[data-osm-id="' + osmid + '"]')[0]);

        $.ajax({
//             url: 'http://localhost/api/upload/guidepost.php',
            url: 'http://map.openstreetmap.cz/guidepost.php',
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
                    message.html(' <span class="text-danger"><span class="glyphicon glyphicon-alert text-danger"></span><br/><br/><u>Chyba:</u> ' + result[1])+'</span>';
                }
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

