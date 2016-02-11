// (c) 2016 osmcz-app, https://github.com/osmcz/osmcz

var osmcz = osmcz || {};
osmcz.activeLayer = function (map, baseLayers, overlays, controls) {
    // -- constructor --


    var style = {
        "clickable": true,
        "color": "#00D",
        "fillColor": "#00D",

        radius: 4,
        weight: 0,
        opacity: 1,
        fillOpacity: 0.2
    };
    var hoverStyle = {
        "fillOpacity": 0.5
    };


    //The later - the more priority https://www.mapbox.com/maki/
    var icons = {
        amenity: {
            restaurant: 'restaurant',
            fuel: 'fuel',
            toilets: 'toilets',
            telephone: 'telephone',
            fast_food: 'fast-food',
            bank: 'bank',
            atm: 'bank',
            waste_disposal: 'waste-basket',
            pub: 'beer',
            post_office: 'post',
            post_box: 'post',
            pharmacy: 'hospital',
            doctors: 'hospital',
            bar: 'bar',
            cafe: 'cafe',
            car_rental: 'car',
            school: 'school',
            college: 'college',
            bicycle_parking: 'bicycle',
            university: 'college',
            library: 'library',
            theatre: 'theatre',
            public_building: 'town-hall',
        },
        highway: {
            bus_stop: 'bus'
        },
        leisure: {
            playground: 'playground',
        },
        railway: {
            station: 'rail-24',
            halt: 'rail-24',
            tram_stop: 'rail-light'
        },
        shop: {
            '*': 'shop',
            chemist: 'pharmacy',
            grocery: 'grocery',
            supermarket: 'grocery',
            convenience: 'grocery'
        },
        station: {
            subway: 'rail-metro'
        },
        tourism: {
            guest_house: 'lodging',
            hostel: 'lodging',
            hotel: 'lodging'
        },
        historic: {
            monument: 'monument',
            memorial: 'monument'
        },
        man_made: {
            surveillance: 'camera'
        },
        place: {
            city: 'square-18',
            town: 'square-stroked-16',
            village: 'circle-8'
        },
        information: {
            guidepost: 'guidepost'
        }
    };

    // url of ajax proxy server for wikipedia and wikimedia
//     var xhd_proxy_url = 'http://localhost/xhr_proxy.php';
    var xhd_proxy_url = 'http://openstreetmap.cz/xhr_proxy.php';


    function getIcon(tags) {
        var name = false;
        for (var key in tags) {
            var val = tags[key];
            if (icons[key] && icons[key][val])
                name = icons[key][val];
            else if (icons[key] && icons[key]['*'])
                name = icons[key]['*'];
        }

        var pc = name ? name.split('-') : 0;
//         var iconBaseUrl = 'https://cdn.rawgit.com/mapbox/maki/v0.5.0/renders/';
        var iconBaseUrl = 'https://cdn.rawgit.com/osmcz/maki/osmcz_v1/renders/';
//         var iconBaseUrl = 'http://localhost/maki/renders/';

        if (name && IsNumeric(pc[pc.length - 1])) {

            var icName = name.substring(0, name.length - pc[pc.length - 1].length);
            var icSize = parseInt(pc[pc.length - 1]);
            var size = [icSize, icSize];

            if (icSize <= 12) {
                var iconUrl = iconBaseUrl + icName + '12';
            } else if (icSize > 12 && icSize <= 18) {
                var iconUrl = iconBaseUrl + icName + '18';
            } else {
                var iconUrl = iconBaseUrl + icName + '24';
            }


        } else if (name && !IsNumeric(pc[pc.length - 1])) {
            var iconUrl = iconBaseUrl + name + '-18';
            var size = [18, 18];

        } else {
            var iconUrl = iconBaseUrl + 'circle-stroked-12';
            var size = [10, 10];
        }


        return L.icon({
            iconUrl: iconUrl + '.png',
            iconRetinaUrl: iconUrl + '@2x.png',
            iconSize: size,
            popupAnchor: [0, -9]
        });
    }

    var timeout;
    var permanentlyDisplayed = false;
    var marker = L.circleMarker([0, 0]);

    var geojsonURL = 'http://tile.poloha.net/json/{z}/{x}/{y}';
    if (location.search.match(/active=sk/))  //temporary solution - soon merged in one endpoint
        geojsonURL = 'http://tile.poloha.net/jsonsk/{z}/{x}/{y}';

    var geojsonTileLayer = new L.TileLayer.GeoJSON(geojsonURL, {
            maxZoom: 25,
            code: 'A'
            //clipTiles: true,
            //unique: function (feature) {                return feature.osm_id;            }
        }, {
            style: style,

            pointToLayer: function (feature, latlng) {
                return L.marker(latlng, {icon: getIcon(feature.properties.tags)});
            },

            onEachFeature: function (feature, layer) {

                if (!(layer instanceof L.Point)) {
                    layer.on('click', function (event) {
//                         console.log('click', event);
                        if (event.target && event.target.feature) {
                            clearTimeout(timeout);
                            permanentlyDisplayed = true;
                            openPoiPanel(event.target.feature, event.target.options.icon.options.iconUrl);
                        }
                    });

                    layer.on('mouseover', function (event) {
                        if (permanentlyDisplayed)
                            return;

                        if (event.target && event.target.feature) {
                            clearTimeout(timeout);
                            timeout = setTimeout(function () {
                                openPoiPanel(event.target.feature, event.target.options.icon.options.iconUrl);
                            }, 100);
                        }
                    });
                    layer.on('mouseout', function (event) {
                        if (!permanentlyDisplayed) {
                            clearTimeout(timeout);
                            timeout = setTimeout(function () {
                                defaultPoiPanel();
                            }, 300);
                        }
                    });
                }
            }
        }
    );

    //add as overlay
    overlays["Aktivní vrstva"] = geojsonTileLayer;

    map.on('layeradd', function (event) {
        if (event.layer == geojsonTileLayer) {
            $('#map-container').addClass('searchbar-on');
            defaultPoiPanel();
        }
    });
    map.on('layerremove', function (event) {
        if (event.layer == geojsonTileLayer) {
            $('#map-container').removeClass('searchbar-on');
        }
    });

    //reset panel
    function resetPanel() {
        defaultPoiPanel();
        permanentlyDisplayed = false;
        map.removeLayer(marker);
    }

    $('#map-searchbar').on('click', '.close', resetPanel);
    map.on('click', resetPanel);


    function IsNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    function openPoiPanel(feature, icon) {
        $('#map-searchbar').html(template(feature, icon));
    }

    function defaultPoiPanel() {
        $('#map-searchbar').html("Najeďte myší na bod zájmu<br>nebo klikněte pro trvalé zobrazení.");

    }

    function template(feature, icon) {
        var id = feature.properties.osm_id;
        var osm_type = feature.properties.osm_type;
        var general = []; // store k,v objects in array to allow sort them
        var name = {};
        var contact = {};
        var payment = {};
        var building = {};
        var wikimedia = {};
        var wikipedia = {};
        var guidepost = false;
        var lon = feature.geometry.coordinates[0];
        var lat = feature.geometry.coordinates[1];

        // show circle marker
        if (permanentlyDisplayed) {
            marker.setLatLng([lat, lon]).addTo(map);
        }

        var tpl = [];
        tpl.push(permanentlyDisplayed ? '<a class="close">&times;</a>' : '');
        tpl.push('<h4>');
        tpl.push('<img src="' + icon + '">&nbsp;');
        tpl.push(feature.properties.tags.name || 'Bod zájmu');
        tpl.push('</h4>');

        $.each(feature.properties.tags, function (k, v) {
            if (k.match(/^name:/))
                name[k] = v;
            else if (k.match(/^payment:/))
                payment[k] = v;
            else if (k.match(/^contact:/) || k.match(/^phone/) || k.match(/^email/))
                contact[k] = v;
            else if (k.match(/^building/))
                building[k] = v;
            else if (k.match(/^addr:|^ref:ruian:/)) //skip TODO show in expert mode
                undefined;
            else
                general.push({k: k, v: v});

            // global flags
            if (k.match(/^wikipedia/))
                wikipedia = {k: k, v: v};
            else if (k.match(/^wikimedia_commons/) && v.match(/^File:/))
                wikimedia = {k: k, v: v};
        });

        // sort the array
        general.sort(function (a, b) {
            return a.k.localeCompare(b.k);
        });

        if (general.length) {
            for (var i in general) {
                var k = general[i].k;
                var v = general[i].v;
                tpl.push('<b>' + k + '</b> = ');
                // wikipedia=* or xxx:wikipedia=*
                if (k.match(/^wikipedia$/) || k.match(/:wikipedia$/))
                    tpl.push('<a href="https://www.wikipedia.org/wiki/' + v + '">' + v + '</a>');
                // wikipedia:<country>=* or xxx:wikipedia:<country>=*
                else if (k.match(/^wikipedia:/) || k.match(/:wikipedia:/)) {
                    tpl.push('<a href="https://www.wikipedia.org/wiki/' + k.split(":").pop() + ':' + v + '">' + v + '</a>');
                }
                else
                  // Just standard url
                    tpl.push(v.match(/^https?:\/\/.+/) ? ('<a href="' + v + '">' + v + '</a>') : v);
                tpl.push('<br>');
            }
        }


        var section = function (obj, label, hide) {
            if (Object.keys(obj).length) {
                hide && tpl.push('<p><b>' + label + '</b> <a href="#" onclick="$(this).parent().hide().next().show();return false">zobrazit</a></p>');
                hide && tpl.push('<div style="display:none">');

                tpl.push('<h5>' + label + '</h5>');
                $.each(obj, function (k, v) {
                    tpl.push('<b>' + k + '</b> = ');
                    tpl.push(v.match(/^https?:\/\/.+/) ? ('<a href="' + v + '">' + v + '</a>') : v);
                    tpl.push('<br>');
                });
                tpl.pop(); //remove last br

                hide && tpl.push('</div>');
            }
        };

        section(name, 'Další jména:', true);
        section(payment, 'Možnosti platby:');
        section(contact, 'Kontakty:');
        section(building, 'Budova:');

        tpl.push('<div class="osmid"><a href="http://osm.org/' + osm_type + '/' + id + '">osm ID: ' + osm_type + '/' + id + '</a></div>');
        tpl.push('<div id="wikimedia-commons" data-osm-id="' + id + '"></div>');
        tpl.push('<div id="guidepost" data-osm-id="' + id + '"></div>');
        tpl.push('<div id="mapillary-photo" data-osm-id="' + id + '"></div>');


        // ---------------------------------------- images ------------------------------------------
        // TODO refactor


        // -----------------  WP & WM -----------------

        // show picture from wikimedia, if there is `wikimedia_commons` tag
        if (wikimedia.k) {
            if (feature.wikimedia) {
                setTimeout(function () { //after dom is created
                    showWikimediaCommons();
                }, 0);
            }
            else {
                var v = feature.properties.tags.wikimedia_commons;
                var url = 'https://commons.wikimedia.org/w/api.php?action=query'
                    + '&prop=imageinfo&iiprop=url&iiurlwidth=240&format=json'
                    + '&titles=' + encodeURIComponent(v);
                $.ajax({
                    url: xhd_proxy_url,
                    data: {
                        url: url
                    },
                    dataType: 'json',
                    success: function (data) {
                        feature.wikimedia = data;
                        showWikimediaCommons();
                    }
                });
            }
        }

        // show picture from wikipedia, if there is `wikipedia` tag
        if (!wikimedia.k && wikipedia.k) {
            if (feature.wikipedia) {
                setTimeout(function () { //after dom is created
                    showWikimediaCommons();
                }, 0);
            }
            else {
                var v = wikipedia.v;
                var country = v.split(":")[0];
                if (country === v)
                    country = "en"
                var url = 'https://' + country + '.wikipedia.org/w/api.php?action=query'
                    + '&prop=pageimages&pithumbsize=240&format=json'
                    + '&titles=' + encodeURIComponent(v);
                $.ajax({
                    url: xhd_proxy_url,
                    data: {
                        url: url
                    },
                    dataType: 'json',
                    success: function (data) {
                        feature.wikipedia = data;
                        showWikimediaCommons();
                    }
                });
            }
        }


        var wcmTpl = '<h5><a href="https://commons.wikimedia.org/">'
            + '<img class="commons_logo" src="' + osmcz.basePath + 'img/commons_logo.png" height="24"></a>'
            + 'Foto z Wikipedie</h5>'
            + '<a href="_descriptionshorturl">'
            + '<img src="_thumburl" width="250">'
            + '</a>';

        function showWikimediaCommons() {
            var wcm = $('#wikimedia-commons');
            if (id == wcm.attr('data-osm-id') && (feature.wikimedia || feature.wikipedia)) {
                if (feature.wikimedia) {
                    var k = Object.keys(feature.wikimedia.query.pages)[0];
                    if (!feature.wikimedia.query.pages[k].imageinfo.length)
                        return;
                    var descriptionshorturl = feature.wikimedia.query.pages[k].imageinfo[0].descriptionshorturl;
                    var thumburl = feature.wikimedia.query.pages[k].imageinfo[0].thumburl;
                } else {
                    var k = Object.keys(feature.wikipedia.query.pages)[0];
                    if (!feature.wikipedia.query.pages[k].pageimage)
                        return;
                    var descriptionshorturl = 'https://commons.wikimedia.org/wiki/File:' + feature.wikipedia.query.pages[k].pageimage;
                    var thumburl = feature.wikipedia.query.pages[k].thumbnail.source;
                }
                wcm.html(wcmTpl.replace(/_thumburl/g, thumburl).replace(/_descriptionshorturl/g, descriptionshorturl));
            }
        }

        // -----------------  GUIDEPOST -----------------


        // show guidepost picture from openstreetmap.cz
        if (feature.properties.tags.information == 'guidepost') {
            if (feature.guidepost) {
                setTimeout(function () { //after dom is created
                    showGuidepost();
                }, 0);
            }
            else {
                var ref = feature.properties.tags.ref;
                $.ajax({
                    url: 'http://api.openstreetmap.cz/table/close?lat=' + lat + '&lon=' + lon + '&distance=50&limit=1',
                    //url: 'http://api.openstreetmap.cz/table/ref/' + ref,
                    data: {
                        outputFormat: 'application/json',
                        output : 'geojson'
                    },
                    dataType: 'json',
                    success: function (data) {
                        feature.guidepost = data;
                        showGuidepost();
                    }
                });
            }
        }

        var gpTpl = '<h5>Foto rozcestníku</h5>'
            + '<a href="_imgUrl">'
            + '<img src="_imgUrl" width="250">'
            + '</a><br>'
            + '<b>Fotografii poskytl:</b> _autor'
            + "<a href='http://api.openstreetmap.cz/table/id/_id' target='_blank'><span class='glyphicon glyphicon-pencil' title='upravit'></span></a>";

        function showGuidepost() {
            var gp = $('#guidepost');
            if (id == gp.attr('data-osm-id') && feature.guidepost) {
                // TODO: show all guideposts
                if (!feature.guidepost.features.length)
                    return;
                var autor = feature.guidepost.features[0].properties.attribution;
                var imgUrl = 'http://api.openstreetmap.cz/' + feature.guidepost.features[0].properties.url;
                var gpostId = feature.guidepost.features[0].properties.id;
                gp.html(gpTpl.replace(/_autor/g, autor).replace(/_imgUrl/g, imgUrl).replace(/_id/g, gpostId));
            }
        }

        // -----------------  MAPILLARY -----------------

        // show closest mapillary photo if no photo so far
        if (permanentlyDisplayed) {
            if (!feature.wikimedia && !feature.wikipedia && !feature.guidepost) {
                //TODO WP tag != existing WP photo --> chain mapillary after the WP request?

                if (feature.mapillary) {
                    setTimeout(function () { //after dom is created
                        showMapillary();
                    }, 0);
                }
                else {
                    //TODO - limit=10 & choose the best oriented photo
                    $.ajax({
                        url: 'http://api.mapillary.com/v1/im/close?lat=' + lat + '&lon=' + lon + '&distance=30&limit=1',
                        dataType: 'json',
                        jsonp: false,
                        global: false,
                        success: function (data) {
                            feature.mapillary = data;
                            showMapillary();
                        }
                    });
                }
            }
        }

        var mpTpl = '<h5>Nejbližší foto</h5>'
            + '<a href="http://www.mapillary.com/map/im/_key/photo">'
            + '<img src="http://images.mapillary.com/_key/thumb-320.jpg" width="250" height="187">'
            + '</a>';

        function showMapillary() {
            var mp = $('#mapillary-photo');
            if (id == mp.attr('data-osm-id') && feature.mapillary.length) {
                mp.html(mpTpl.replace(/_key/g, feature.mapillary[0].key));
            }
        }

        return tpl.join('');
    }

};
