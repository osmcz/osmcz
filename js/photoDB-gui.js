// (c) 2017 osmcz-app, https://github.com/osmcz/osmcz

// var osmcz = osmcz || {};

L.Control.PhotoDBGui = L.Control.extend({

  options: {
    anchor: [ 250, 250 ],
    position: 'topright',
  },

  initialize: function (options) {
      L.setOptions(this, options);
  },

  onAdd: function (map) {
    this._createButton();
    this._map = map;
    this._precision = 5;
    this.positionMarkerVisible = false;


    return this._container;
  },

  destroy: function(){
    if(!this._map) {
        return this;
    }

    this.removeFrom(this._map);

    if (this.onRemove) {
        this.onRemove(this._map);
    }
    return this;
  },

  getElement: function(){
    return this._container;
  },

  _createButton: function(){
    var className = 'leaflet-control-photoDBbtn',
      container = this._container = L.DomUtil.create('div', className);

    var content = [];
    content.push('<a href="#" class="leaflet-control-photoDBbtn-text"></a>');
    container.innerHTML=content.join(" ");

    L.DomEvent.on(container, 'click', this._openSidebar, this);
  },

    _openSidebar: function(e) {

        e.stopPropagation();

        if (osmcz.sidebar.isVisible()) {
            return false;
        }

        osmcz.sidebar.setContent(this._sidebarInit());

        var cnt = document.getElementById("sidebar-content");

        // from http://stackoverflow.com/a/39065147
        // Image upload html template
        const formTemplate = ({ maxSize }) => `
        <h4>Nahrání fotografie</h4>
        <p class='mark text-center'>Vyberte fotografii, doplňte údaje a stiskněte tlačítko [Nahrát fotografii]

        <form id="photoDB-upload-form" name="photoDB-upload-form" method="post" enctype="multipart/form-data" target="upload_target">
            <input type="hidden" name="action" value="file" />
            <input type="hidden" name="MAX_FILE_SIZE" value="${maxSize}" />
            <input type="hidden" id="lat" name="lat" value="0" exif-value="" />
            <input type="hidden" id="lon" name="lon" value="0" exif-value="" />

            <fieldset id="photo">
                <h5>Fotografie</h5>
                <a href="#" class="darken" data-toggle="modal" data-target="#myModal">
                    <img id="photoDB-preview" height="200" src="" alt="Náhled fotografie..." class="thumbnail center-block">
                </a>
                <input name="uploadedfile" type="file" id="photoDB-file" size="20" class="hidden"/>
                <div id="imgSelBtnDiv">
                    <input type="button" id="imgSelBtn" value="Vyberte fotografii" class="btn btn-default btn-xs center-block" />
                </div>
                <div id="photoDB-img-message" class="alert alert-danger photoDB-message text-center"></div>
            </fieldset>

            <fieldset id="latlonFs">
                <h5>Pozice <span class="smaller">(lat,lon)</span></h5>
                <div class="input-group input-group-sm">
                    <div id="latlonSource" class="input-group-btn input-group-btn" data-toggle="buttons">
                        <label id="sourceManual" class="btn btn-secondary btn-default active">
                            <input type="radio" id="latlonSourceManual" name="latlonSource" value="manual" autocomplete="off"> Ručně
                        </label>
                        <label id="sourceExif" class="btn btn-secondary btn-default disabled">
                            <input type="radio" id="latlonSourceExif" name="latlonSource" value="exif" autocomplete="off" checked> Exif
                        </label>
                    </div>
                    <input type="text" id="latlon" name="latlonDisp" value="" placeholder="--.---, --.---" title="Lat, Lon" class="form-control" readonly />
                </div>
                <div id="photoDB-latlon-message" class="photoDB-message mark text-center"></span>
            </fieldset>

            <fieldset id="otherData">
                <h5>Doplňující údaje</h5>
                <div class="form">
                    <label for="author" class="label-margin">Autor:</label>
                    <input type="text" id="author" name="author" placeholder="Vaše jméno/přezdívka" class="form-control input-sm">
                    <label for="author" class="label-margin">Licence:</label>
                    <select id="license" class="form-control"></select>
                    <label for="phototype" class="label-margin">Objekt na fotografii:</label>
                    <select id="phototype" class="form-control">
                        <option value="gp">Rozcestník</option>
                        <option value="info">Informační tabule</option>
                        <option value="map">Mapa</option>
                        <option value="pano">Panorama</option>
                        <option value="other">Jiný</option>
                    </select>
                    <div id="guidepostOptions">
                        <label for="guidepostContent" class="label-margin">Typ rozcestníku:</label>
                        <div id="guidepostContent" class="btn-group btn-group-xs" data-toggle="buttons">
                            <label class="btn btn-default">
                                <input type="checkbox" name="gp_content[]" value="hiking" autocomplete="off">Pěší
                            </label>
                            <label class="btn  btn-default">
                                <input type="checkbox" name="gp_content[]" value="cycle" autocomplete="off">Cyklo
                            </label>
                            <label class="btn  btn-default">
                                <input type="checkbox" name="gp_content[]" value="ski" autocomplete="off">Lyžařský
                            </label>
                            <label class="btn  btn-default">
                                <input type="checkbox" name="gp_content[]" value="horse" autocomplete="off">Koňský
                            </label>
                            <label class="btn  btn-default">
                                <input type="checkbox" name="gp_content[]" value="wheelchair" autocomplete="off">Vozíčkářský
                            </label>
                        </div>
                        <br>
                        <label for="ref" class="label-margin">Ref:</label>
                        <input type="text" id="ref" name="ref" value="" placeholder="Například: XX114 nebo 0123/45" title="Číslo rozcestníku bez posledního písmene." class="form-control input-sm"/>
                    </div>
                    <label for="note" class="label-margin">Poznámka: </label>
                    <input type="text" id="note" name="note" value="" placeholder="Zde můžete vložit poznámku k fotografii" class="form-control input-sm"/>
                    <div id="photoDB-otherData-message" class="photoDB-message mark text-center" style="display: none;"></span>
                </div>
            </fieldset>
            <fieldset>
                <div class="photoDB-btn-grp">
                    <input type="reset" id="resetBtn" name="reset" value="Reset" onclick="return false;" class="btn btn-default btn-xs"/>
                    <button type="submit" id="submitBtn" name="submitBtn" onclick="return false;" class="btn btn-default btn-xs pull-right" disabled>
                    <span id="submitBtnIcon" class=""></span> Nahrát fotografii
                </div>
            </fieldset>
        </form>
        `;

        // Add template to sidebar
        $('#sidebar-content').html([
            { maxSize: '10000000' }
        ].map(formTemplate));

        // Get elements containers
        var previewContainer = document.getElementById("photoDB-preview");
        var uploadedFile = document.getElementById("photoDB-file");
        var imgSelBtn = document.getElementById("imgSelBtn");
        var sourceExif = document.getElementById("sourceExif");
        var author = document.getElementById("author");
        var phototype = document.getElementById("phototype");
        var resetBtn = document.getElementById("resetBtn");
        var submitBtn =document.getElementById("submitBtn");

        // Bind events to elements
        L.DomEvent.on(imgSelBtn, 'click', this._selectImageClicked, this);
        L.DomEvent.on(uploadedFile, 'change', this._previewFile, this);
        L.DomEvent.on(previewContainer, 'load', this._readExif, this);
        L.DomEvent.on(sourceExif, 'click', this._sourceExifClicked, this);
        L.DomEvent.on(author, 'change', this._authorChanged, this);
        L.DomEvent.on(phototype, 'change', this._phototypeChanged, this);
        L.DomEvent.on(resetBtn, 'click', this._resetForm, this);
        L.DomEvent.on(submitBtn, 'click', this._submitForm, this);

        var modal = document.getElementById("modal-container");

        const modalTemplate = ({}) => `
        <!-- Image modal dialog -->
        <div class="modal fade" id="myModal" role="dialog">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-body">
                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                        <img src="" alt="Načítám náhled" id="modalImg" class="thumbnail block-center" style="width: 100%;" >
                    </div>
                </div>
            </div>
        </div>
        `
        // Add template to modal element
        $('#modal-container').html([{}].map(modalTemplate));

        // Copy image source to modal dialog
        $('#myModal').on('show.bs.modal', function () {
            // Horizontaly center the modal dialog on screen
            $('#modalImg').on('load', function () {
                setTimeout(function () {
                    // TODO: tune for small screens
                    $('#myModal').css('margin-left', ($(window).width() - $('#myModal .modal-content').width())/2);
                }, 10);
            });

            $('#modalImg').attr('src', $('#photoDB-preview').attr('src'));
        });

        this._getLicenses();

        // Create position marker
        this.positionMarker = L.marker([0, 0], {clickable: false, draggable: true, title: 'Vybrané souřadnice'});

        // Bind events to marker
        this.positionMarker
        .on('dragstart', function(event){
            $('#photoDB-upload-form #sourceManual').click();
        }, this)
        .on('drag', function(event){
            var marker = event.target;
            var position = marker.getLatLng();

            this._updateLatLonLabel(position.lat, position.lng);
        }, this)
        .on('dragend', function(event){
            var marker = event.target;
            var position = marker.getLatLng();

            this._updateLatLonLabel(position.lat, position.lng);
        }, this);

        // Reset form to default state
        this._resetForm();

        sidebar.on('hidden', this._closeSidebar, this);
        osmcz.sidebar.show();
    },

    _closeSidebar: function(e) {
        this._hideMarker();
        sidebar.off('hidden', this._closeSidebar);
    },

    _sidebarInit: function() {
        var hc = "";

        hc += "<div class='sidebar-inner'>";
        hc += "<!--sidebar from PhotoDB--> ";
        hc += "  <div id='sidebar-content'>";
        hc += "  </div>";
        hc += "</div>";

        return hc;
    },

    // Form - select image clicked
    _selectImageClicked: function(e) {
        $('#photoDB-upload-form #photoDB-file').click();
    },

    // Form - Exif button clicked
    _sourceExifClicked: function(e) {
        if ($('#photoDB-upload-form #sourceExif').hasClass('disabled')) {
            return;
        }
        var lat = $('#photoDB-upload-form #lat').attr('exif-value');
        var lon = $('#photoDB-upload-form #lon').attr('exif-value');
        this._updateLatLonLabel(lat, lon);
        this._moveMarker(lat, lon, true);
    },

    _phototypeChanged: function(e) {
        if (e.target.value == "gp") {
            $('#photoDB-upload-form #guidepostOptions').show('1');
        } else {
            $('#photoDB-upload-form #guidepostOptions').hide('1');
        }
    },

    // Check author field, show alert when missing
    _authorChanged: function(e) {
        var author = $('#photoDB-upload-form #author');
        author.prop("title","");
        author.removeClass("inputError");
        this._authorError = false;

        if (!author.val()) {
          author.prop("title","Povinné pole!");
          author.addClass("inputError");
          this._authorError = true;
        } else {
            if (author.val() != Cookies.get("_photoDB_author")) {
                Cookies.set("_photoDB_author", author.val(), {expires: 90});
            }
        }

        this._updateSubmitBtnStatus();
    },

    _previewFile: function(e) {
        var preview = $('#photoDB-upload-form #photoDB-preview'); //selects the query named img
        var file    = $('#photoDB-upload-form #photoDB-file').prop("files")[0]; //sames as here
        var message = $('#photoDB-upload-form #photoDB-img-message');
        var reader  = new FileReader();
        var imageType = /image.*/;

        // Reset upload button icon
        var submitBtnIcon = $('#photoDB-upload-form #submitBtnIcon');
        submitBtnIcon.attr('class', '');

        message.hide();

        if (file.type.match(imageType)) {
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

                // Check file size
                if (file.size > $("#photoDB-upload-form input[name='MAX_FILE_SIZE']").val()) {
                    message.html('<span class="glyphicon glyphicon-alert text-danger"></span> Soubor je moc velký!');
                    message.show();
                }
            } else {
                preview.attr("src","");
                preview.attr("style", "display:none");
                message.html('<span class="glyphicon glyphicon-alert text-danger"></span> Povinné pole!');
                message.show();
            }
        } else {
                this._hideMarker();
                this._updateLatLonLabel(0, 0);
                $('#photoDB-upload-form #latlonFs').hide();
                $('#photoDB-upload-form #otherData').hide();
                preview.attr("src","");
                preview.attr("style", "display:none");
                message.html('<span class="glyphicon glyphicon-alert text-danger"></span> Nepodporovaný typ souboru!');
                message.show();
        }

        this._updateSubmitBtnStatus()

    },

    _updateSubmitBtnStatus: function() {
        var file =  $('#photoDB-upload-form #photoDB-file').prop("files")[0];
        var imgMsg = $('#photoDB-upload-form #photoDB-img-message');
        var submitBtn = $('#photoDB-upload-form #submitBtn');

        if (file && imgMsg.contents().length == 0 &&
            !this._authorError &&
            !this._latlonError
           ) {
            submitBtn.prop('disabled', false);
        } else {
            submitBtn.prop('disabled', true);
        }
    },

    // Read exif data of image
    _readExif: function(e){
        var preview = $('#photoDB-upload-form #photoDB-preview'); //selects the query named img
        var btnSourceExif = $('#photoDB-upload-form #sourceExif');
        var btnSourceManual = $('#photoDB-upload-form #sourceManual');
        var message = $('#photoDB-latlon-message');

        var pLat =  $('#photoDB-upload-form #lat');
        var pLon =  $('#photoDB-upload-form #lon');

        $('#photoDB-upload-form #sourceManual').button('toggle')

        message.html('');
        message.hide();

        $('#photoDB-upload-form #latlonFs').show();
        $('#photoDB-upload-form #otherData').show();


        this._hideMarker();
        this._updateLatLonLabel(0, 0);

        this._map.on('click', this._mapClicked, this);

        btnSourceExif.addClass("disabled")
        btnSourceManual.button('toggle');



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

        function noExif() {
            message.html("Pozici vyberete kliknutím do mapy.");
            message.show();

            pLat.val(0);
            pLon.val(0);
            pLat.attr('exif-value', '');
            pLon.attr('exif-value', '');
        }

        var exif = EXIF.readFromBinaryFile(base64ToArrayBuffer(e.currentTarget.currentSrc));

        if (!exif) {
            // No exif in image
            noExif();
            return;
        }

        var eLatRef = exif.GPSLatitudeRef;
        var eLat = exif.GPSLatitude;
        var eLonRef = exif.GPSLongitudeRef;
        var eLon = exif.GPSLongitude;

        if (eLatRef != null && eLat!= null && eLonRef != null && eLon!= null) {
            var lat=DMSToDD(eLat[0], eLat[1], eLat[2], eLatRef, this._precision); // how to get value of options.precision?
            var lon=DMSToDD(eLon[0], eLon[1], eLon[2], eLonRef, this._precision);
            this._updateLatLonLabel(lat, lon);
            this._showMarker(lat, lon, true);

            pLat.val(lat);
            pLon.val(lon);

            pLat.attr('exif-value', lat);
            pLon.attr('exif-value', lon);

            btnSourceExif.removeClass("disabled");
            btnSourceExif.button('toggle');
            message.html("Pozici upravíte posunutím ukazatele nebo kliknutím do mapy.");
            message.show();
        } else {
            // Exif present, but without GPSLatLon data
            noExif();
        }
    },


    _mapClicked: function(e){
        if (! this.positionMarkerVisible) {
            this._showMarker(e.latlng.lat, e.latlng.lng, false);
            this._updateLatLonLabel(e.latlng.lat, e.latlng.lng);

            var message = $('#photoDB-latlon-message');
            message.html("Pozici upravíte posunutím značky nebo kliknutím do mapy.");
            message.show();
        } else {
            if ( $('#photoDB-upload-form #sourceExif').hasClass('active')) {
                $('#photoDB-upload-form #sourceManual').click();
            }
            this._moveMarker(e.latlng.lat, e.latlng.lng, false);
            this._updateLatLonLabel(e.latlng.lat, e.latlng.lng);
        }
    },

    _showMarker: function (lat, lon, panMap) {

        if (!lat || !lon) {
            return;
        }

        this.positionMarkerVisible = true;

        if (panMap) {
            this._map.setZoom(18, {animate: false});
            this._map.panTo([lat, lon], {animate: false});
        }

        this.positionMarker.setLatLng([lat, lon]);
        this.positionMarker.bindPopup('Presuň mě na cílové místo');
        this.positionMarker.addTo(this._map);
    },

    _moveMarker: function (lat, lon, panMap) {

        if (!lat || !lon) {
            return;
        }

        if (panMap) {
            this._map.panTo([lat, lon], {animate: false});
        }
        this.positionMarker.setLatLng([lat, lon]);
    },

    _hideMarker: function () {
        this._map.off('click', this._mapClicked, this);
        this._map.removeLayer(this.positionMarker);
        this.positionMarkerVisible = false;
    },

    _updateLatLonLabel: function(lat, lon) {
        var elatlon = $('#photoDB-upload-form #latlon');

        this._latlonError = true;

        if (!lat || lat == 0 || !lon ||lon == 0 ) {
            elatlon.val('');
            elatlon.prop("title","Lat, Lon (Povinné pole!)");
            elatlon.addClass("inputError");
        } else {
            elatlon.val((lat*1).toFixed(this._precision) + ', ' + (lon*1).toFixed(this._precision));
            elatlon.prop("title","Lat, Lon");
            elatlon.removeClass("inputError");
            this._latlonError = false;
        }

        this._updateSubmitBtnStatus();
    },

    // Get licenses list from api
    _getLicenses: function() {
        var license = $('#photoDB-upload-form #license option:selected').text();
        if (license == "" ) {
            // Get list of licenses
            $.ajax({
                url: 'https://api.openstreetmap.cz/table/licenseinfo?output=json',
                success: function (data) {
                    if (data != "") {
                        // show result
                        // TODO: sort licences, add more info
                        var lcSel = $('#photoDB-upload-form #license');
                        var jsonObj = JSON.parse(data);
                        Object.keys(jsonObj.licenses).forEach(function(k) {
                            lcSel.append($('<option>', {
                                    value: k,
                                    text : jsonObj.licenses[k],
                                    title: jsonObj.licenses[k]
                                }));
                            });

                        if (Cookies.get("_photoDB_license") != null)
                            lcSel.val(Cookies.get("_photoDB_license")).change();
                    }
                },
                cache: true
            });
        }
    },

    _resetForm: function(e) {
        this._hideMarker();

        // Image
        var file = $('#photoDB-upload-form #photoDB-file');
        file.val(null);

        // Hide image thumbnail
        var preview = $('#photoDB-upload-form #photoDB-preview');
        preview.hide();
        preview.attr("src", "");

        // Reset LatLonLabel
        this._updateLatLonLabel(0,0);
        var message = $('#photoDB-upload-form #photoDB-img-message');
        message.html("");
        message.hide();

        // Author
        $('#photoDB-upload-form #author').val(null);

        // read author and license from cookies
        if (Cookies.get("_photoDB_author") != null)
          $("#photoDB-upload-form #author").val(Cookies.get("_photoDB_author"));

        this._authorChanged();

        // Restore license from cookies
        if (Cookies.get("_photoDB_license") != null)
          $("#photoDB-upload-form #license").val(Cookies.get("_photoDB_license")).change();

        // Switch back to type guidepost
        $("#photoDB-upload-form #phototype").val('gp').change();

        // Reset guidepostContent buttons
        $.each($("input[name='gp_content[]']:checked"), function(){
                $(this).click();
        });

        // Show guidepost options block
        $('#photoDB-upload-form #guidepostOptions').show();

        $('#photoDB-upload-form #latlonFs').hide();
        $('#photoDB-upload-form #otherData').hide();

        // Reset ref and note fields
        $('#photoDB-upload-form #ref').val('');
        $('#photoDB-upload-form #note').val('');

        // Reset upload button icon
        var submitBtnIcon = $('#photoDB-upload-form #submitBtnIcon');
        submitBtnIcon.attr('class', '');

        // Disable upload button
        this._updateSubmitBtnStatus();

    },

    _submitForm: function(e) {

        // Do not call original submit action
        e.stopPropagation();

        // Update coors from marker
        $('#photoDB-upload-form #lat').val(this.positionMarker.getLatLng().lat);
        $('#photoDB-upload-form #lon').val(this.positionMarker.getLatLng().lng);

        var phototype = $('#photoDB-upload-form #phototype option:selected').val();
        var license = $('#photoDB-upload-form #license option:selected').val();

        // Sent ref only for guideposts
        if (phototype != 'gp') {
            $('#photoDB-upload-form #ref').val('');
        }

        var formData = new FormData($('#photoDB-upload-form')[0]);
        formData.append('license', license);
        formData.append('gp_type', phototype);

        //Check selected license and update cookie if needed
        if (Cookies.get("_photoDB_license") == null ||
             (Cookies.get("_photoDB_license") != null &&
              license != Cookies.get("_photoDB_license")
             )) {
                Cookies.set("_photoDB_license", license, {expires: 90});
        }


        // Disable upload button
        $('#photoDB-upload-form #submitBtn').prop('disabled', true);

        // Change button icon to indicate uploading
        var submitBtnIcon = $('#photoDB-upload-form #submitBtnIcon');
        submitBtnIcon.attr('class', 'glyphicon glyphicon-refresh text-info gly-spin');


        $.ajax({
//            url: 'http://localhost/api/upload/guidepost.php',
            url: 'https://api.openstreetmap.cz/guidepost.php',
            type: 'POST',
            data: formData,
            async: false,
            success: function (data) {

                function translateErrorMessage(msg) {
                    if (msg.indexOf('file already exists') >=0 ){
                        return msg.replace('file already exists', 'Soubor již existuje').replace('please rename your copy','použijte prosím jiné jméno');
                    }

                    return msg;
                }

                if (data.indexOf('parent.stop_upload') >= 0) {
                    // Find row with "parent.stop_upload" function and extract it's parameters
                    var result = data.match(/parent.stop_upload(.*);/gm).toString().replace("parent.stop_upload", "").replace(/^\(/,"").replace(");","").split(/,(?![^']*'(?:(?:[^']*'){2})*[^']*$)/);

                    if (result) {
                        if (result[0] == 1) { //OK
                            // Change button icon
                            submitBtnIcon.attr('class', 'glyphicon glyphicon-ok text-success');
                            toastr.success('Fotografie byla uložena na server.', 'Děkujeme', {closeButton: true, positionClass: "toast-bottom-center"});
                        } else { // Error during upload
                            toastr.error('Fotografii se nepodařilo uložit na server.<br><em>Detail: </em>' + translateErrorMessage(result[1]),
                                        'Chyba!',
                                        {closeButton: true, positionClass: "toast-bottom-center", timeOut: 0});
                            // Re-enable submit button
                            $('#photoDB-upload-form #submitBtn').prop('disabled', false);

                            // Change button icon
                            submitBtnIcon.attr('class', 'glyphicon glyphicon-warning-sign text-danger');
                        }
                    } else { // Unknown state of upload
                            toastr.error('Fotografii se nepodařilo  uložit na server.<br><em>Detail: </em>' + translateErrorMessage(data),
                                        'Chyba!',
                                        {closeButton: true, positionClass: "toast-bottom-center", timeOut: 0});
                            // Re-enable submit button
                            $('#photoDB-upload-form #submitBtn').prop('disabled', false);

                            // Change button icon
                            submitBtnIcon.attr('class', 'glyphicon glyphicon-warning-sign text-danger');
                    }
                } else {
                    toastr.error('Fotografii se nepodařilo  uložit na server.<br><em>Detail: </em>' + data,
                                'Chyba serveru!',
                                {closeButton: true, positionClass: "toast-bottom-center", timeOut: 0});
                    // Re-enable submit button
                    $('#photoDB-upload-form #submitBtn').prop('disabled', false);

                    // Change button icon
                    submitBtnIcon.attr('class', 'glyphicon glyphicon-warning-sign text-danger');
                }
            },
            fail: function(data) {
                toastr.error('Fotografii se nepodařilo  uložit na server.<br><em>Detail: </em>' + data,
                                'Chyba!',
                                {closeButton: true, positionClass: "toast-bottom-center", timeOut: 0});
                // Re-enable submit button
                $('#photoDB-upload-form #submitBtn').prop('disabled', false);

                // Change button icon
                submitBtnIcon.attr('class', 'glyphicon glyphicon-warning-sign text-danger');
                return false;
            },
            cache: false,
            contentType: false,
            processData: false
        });

        return false;

    }



});

L.control.photoDbGui = function (options) {
  return new L.Control.PhotoDBGui(options);
};

