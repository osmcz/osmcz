// (c) 2016 osmcz-app, https://github.com/osmcz/osmcz


var osmcz = osmcz || {};
osmcz.poiPopup = function (map) {
    // -- constructor --

    osmcz._map = map;
};

// static fields
osmcz.permanentlyDisplayed = false;
osmcz._marker = L.circleMarker([0, 0]);
osmcz._map = false;


// static methods
osmcz.poiPopup.open = function (object) {

    $.ajax({
        url: 'http://www.openstreetmap.org' + OSM.apiUrl({type: object.type, id: object.id}),
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
                osm_id: object.id,
                osm_type: object.type
            };


            if (feature.geometry.type !== 'Point') { //take first coord of Polygon - TODO centroid or draw geometry
                feature.geometry = {
                    type: 'Point',
                    coordinates: feature.geometry.coordinates[0][0]
                };
            }

            console.log("geojson feature:", feature);

            // zoom to feature
            var lon = feature.geometry.coordinates[0];
            var lat = feature.geometry.coordinates[1];
            osmcz._map.setView([lat, lon]);

            //set icon and show
            var icon = osmcz.iconsService.get(feature.properties.tags);
            $('#map-container').addClass('searchbar-on');
            $('#map-searchbar').html(osmcz.poiPopup.getHtml(feature, icon.options.iconUrl));
        }
    });

};


osmcz.poiPopup.close = function () {
    console.log('poi-popup: close');

    osmcz._map.removeLayer(osmcz._marker);
    osmcz.permanentlyDisplayed = false;

    //if (!$('#map-container').hasClass('js_active-layer-on'))
    $('#map-container').removeClass('searchbar-on');

    var path = (location.host === 'openstreetmap.cz' || location.host === 'osm.localhost')
        ? '/'
        : location.pathname;

    history.replaceState('', '', path + location.hash);
};

osmcz.poiPopup.setUrl = function (p) {
    var path = (location.host === 'openstreetmap.cz' || location.host === 'osm.localhost')
        ? ('/' + p.osm_type + '/' + p.osm_id)
        : ('?' + p.osm_type + '=' + p.osm_id);

    history.replaceState('', '', path + location.hash);
}


// ------- POI panel template  -------
osmcz.poiPopup.getHtml = function (feature, icon) {

    //TODO refactor

    var id = feature.properties.osm_id;
    var osm_type = feature.properties.osm_type;
    var general = []; // store k,v objects in array to allow sort them
    var name = {};
    var contact = {};
    var openingHours = '';
    var payment = {};
    var building = {};
    var wikidata = {};
    var wikimedia = {};
    var wikipedia = {};
    var guidepost = false;
    var lon = feature.geometry.coordinates[0];
    var lat = feature.geometry.coordinates[1];

    // show circle marker
    if (osmcz.permanentlyDisplayed) {
        osmcz._marker.setLatLng([lat, lon]).addTo(osmcz._map);
    }

    var tpl = [];
    tpl.push(osmcz.permanentlyDisplayed ? '<a class="close">&times;</a>' : '');
    tpl.push('<h4>');
    tpl.push('<img src="' + icon + '">&nbsp;');
    tpl.push(feature.properties.tags.name || 'Bod zájmu');
    tpl.push('</h4>');

    $.each(feature.properties.tags, function (k, v) {
        k = k + "";
        v = v + "";

        if (k.match(/^name:/))
            name[k] = v;
        else if (k.match(/^payment:/))
            payment[k] = v;
        else if (k.match(/^contact:/) || k.match(/^phone/) || k.match(/^email/))
            contact[k] = v;
        else if (k.match(/^building/))
            building[k] = v;
        else if (k.match(/^opening_hours$/))
            openingHours = v;
        else if (k.match(/^addr:|^ref:ruian:/)) //skip TODO show in expert mode
            undefined;
        else
            general.push({k: k, v: v});

        // global flags
        if (k.match(/^wikipedia/)) {
            // Prefer wikipedia over wikipedia:cs over first one
            if (k.match(/^wikipedia$/))
                wikipedia = {k: k, v: v};
            else if (k.match(/^wikipedia:cs$/) &&
                (!wikipedia.k || (wikipedia.k && !wikipedia.k == "wikipedia")))
                wikipedia = {k: k, v: k.split(":").pop() + ":" + v};
            else if (!wikipedia.k && k.match(/^wikipedia:/))
                wikipedia = {k: k, v: k.split(":").pop() + ":" + v};
        }
        else if (k.match(/^wikimedia_commons/) && v.match(/^File:/))
            wikimedia = {k: k, v: v};
        else if (k.match(/^wikidata/))
            wikidata = {k: k, v: v};
        else if (k.match(/^image$/) && v.match(/^File:/))
            wikimedia = {k: 'wikimedia_commons', v: v};
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
                tpl.push('<a href="https://www.wikipedia.org/wiki/' + v + wikiLang + '">' + v + '</a>');
            // wikipedia:<country>=* or xxx:wikipedia:<country>=*
            else if (k.match(/^wikipedia:/) || k.match(/:wikipedia:/))
                tpl.push('<a href="https://www.wikipedia.org/wiki/' + k.split(":").pop() + ':' + v + wikiLang + '">' + v + '</a>');
            // wikidata=*
            else if (k.match(/^wikidata$/))
                tpl.push('<a href="https://www.wikidata.org/wiki/' + v + wikiLang + '">' + v + '</a>');
            // wikimedia commons=*
            else if (k.match(/^wikimedia_commons$/))
                tpl.push('<a href="https://commons.wikimedia.org/wiki/' + v + wikiLang + '">' + v + '</a>');
            else if (k.match(/^image$/) && v.match(/^File:/))
            // handle image as wikimedia_commons
                tpl.push('<a href="https://commons.wikimedia.org/wiki/' + v + wikiLang + '">' + v + '</a>');
            // Katalog národního památkového ústavu
            else if (k.match(/^ref:npu$/))
                tpl.push('<a href="http://pamatkovykatalog.cz/?mode=parametric&isProtected=1&presenter=ElementsResults&indexId=' + encodeURIComponent(v) + '">' + v + '</a>');
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
            hide && tpl.push('<h5>' + label + ' <a href="#" onclick="$(this).parent().parent().hide().prev().show();return false">skrýt</a></h5>');

            hide || tpl.push('<h5>' + label + '</h5>');
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
    tpl = tpl.concat(osmcz.openingHoursService.getHtml(openingHours));
    section(payment, 'Možnosti platby:');
    section(contact, 'Kontakty:');
    section(building, 'Budova:');

    //tpl.push('<div class="osmid"><a href="http://osm.org/' + osm_type + '/' + id + '">osm ID: ' + osm_type + '/' + id + '</a></div>');
    tpl.push('<div class="osmid"><a href="http://osmap.cz/' + osm_type + '/' + id + '">osmap.cz/' + osm_type + '/' + id + '</a></div>');
    tpl.push('<div id="wikimedia-commons" data-osm-id="' + id + '"></div>');
    tpl.push('<div id="guidepost" data-osm-id="' + id + '"></div>');
    tpl.push('<div id="mapillary-photo" data-osm-id="' + id + '"></div>');


    // ---------------------------------------- images ------------------------------------------
    // TODO refactor

    // -----------------  WP & WM -----------------

    if (feature.wikimedia || feature.wikipedia) {
        setTimeout(function () { //after dom is created
            showWikimediaCommons();
        }, 0);
    }

    // url of ajax proxy server for wikipedia and wikimedia
    var xhd_proxy_url = 'http://openstreetmap.cz/xhr_proxy.php';

    // Get preferred user language and use it on wikipedia
    var userLang = (window.navigator.userLanguage || window.navigator.language).split("-")[0];
    var wikiLang = (userLang ? "?uselang=" + userLang : "" );


    // Show picture from wikimedia commons if there is `wikidata` or `wikimedia_commons` or `wikipedia` tag
    // Priorities:
    //      1) wikidata
    //      2) wikimedia_commons
    //      3) wikipedia
    //
    // There is also fallback - if wikidata reply does not contains image and wikimedia_commons or wikipedia
    // tags exists, they will be checked as well.

    if (wikimedia.k || wikipedia.k || wikidata.k) {
        var url;
        if (wikidata.k)
            url = getWikiApiUrl(wikidata);
        else if (wikimedia.k)
            url = getWikiApiUrl(wikimedia);
        else
            url = getWikiApiUrl(wikipedia);

        $.ajax({
            url: xhd_proxy_url,
            data: {
                url: url
            },
            dataType: 'json',
            success: function (data) {
                var replyType = getWikiType(data);
                if (replyType == 'wikimedia') {
                    feature.wikimedia = data;
                    showWikimediaCommons();
                }
                else if (replyType == 'wikipedia') {
                    feature.wikipedia = data;
                    showWikimediaCommons();
                }
                else if (replyType == 'wikidata') {
                    var reply = processWikidataReply(data);
                    if (!reply.k) {
                        // Wikidata entry does not contains image
                        // try other tags
                        if (wikimedia.k)
                            reply = wikimedia;
                        else if (wikipedia.k)
                            reply = wikipedia;
                    }

                    // get image thumbnail url or try wikimedia/wikipedia if there is no image on wikidata
                    if (reply.k) {
                        var url = getWikiApiUrl(reply);
                        $.ajax({
                            url: xhd_proxy_url,
                            data: {
                                url: url
                            },
                            dataType: 'json',
                            success: function (data) {
                                if (getWikiType(data) == 'wikimedia') {
                                    feature.wikimedia = data;
                                    showWikimediaCommons();
                                } else if (getWikiType(data) == 'wikipedia') {
                                    feature.wikipedia = data;
                                    showWikimediaCommons();
                                }
                            }
                        });
                    }
                }
            }
        });
    }

    // Show image from wikimedia commons
    function showWikimediaCommons() {

        // Template
        var wcmTpl = '<h5><a href="https://commons.wikimedia.org/">'
            + '<img class="commons_logo" src="' + osmcz.basePath + 'img/commons_logo.png" height="24"></a>'
            + 'Foto z Wikipedie</h5>'
            + '<a href="_descriptionshorturl">'
            + '<img src="_thumburl" width="250">'
            + '</a>';

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
                    output: 'geojson'
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
    if (osmcz.permanentlyDisplayed) {
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


    // ------- Wikidata, wikimedia commons and wikipedia functions -------
    //
    // Prepare correct api request
    function getWikiApiUrl(we) {
        if (we.k == "wikimedia_commons") { // wikimedia commons tag
            return 'https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url&iiurlwidth=240&format=json'
                + '&titles=' + encodeURIComponent(we.v);
        } else if (we.k == "wikidata") { // wikidata tag
            return 'https://www.wikidata.org/w/api.php?action=wbgetclaims&property=P18&format=json'
                + '&entity=' + encodeURIComponent(we.v);
        } else { // wikipedia tag
            var country = we.v.split(":")[0];
            if (country === we.v)
                country = "en";
            return 'https://' + country + '.wikipedia.org/w/api.php?action=query&prop=pageimages&pithumbsize=240&format=json'
                + '&titles=' + encodeURIComponent(we.v);
        }
    }

    // Analyze reply and identify wikidata / wikimedia / wikipedia content
    function getWikiType(d) {
        if (d.query) {
            if (Object.keys(d.query.pages)[0]) {
                var k = Object.keys(d.query.pages)[0];
                if (d.query.pages[k].imageinfo)
                    return 'wikimedia';
                if (d.query.pages[k].pageimage)
                    return 'wikipedia';
            }
        }
        if (d.claims)
            return 'wikidata';
    }

    // In wikidata entry is image name. but we need thumbnail,
    // so we will convert wikidata reply to wikimedia_commons tag
    function processWikidataReply(d) {
        var w = {};
        if (d.claims.P18) {
            w.k = 'wikimedia_commons';
            w.v = 'File:' + d.claims.P18[0].mainsnak.datavalue.value;
        }
        return w;
    }

};
