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

    // Get preferred user language and use it on wikipedia
    var userLang = (window.navigator.userLanguage || window.navigator.language).split("-")[0];
    var wikiLang = (userLang ? "?uselang=" + userLang : "" );

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

    // ------- Wikidata, wikimedia commons and wikipedia functions -------
    //
    // Prepare correct api request
    function getWikiApiUrl (we) {
      if (we.k == "wikimedia_commons") { // wikimedia commons tag
        return 'https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url&iiurlwidth=240&format=json'
                + '&titles=' + encodeURIComponent(we.v);
      } else if (we.k == "wikidata") { // wikidata tag
        return 'https://www.wikidata.org/w/api.php?action=wbgetclaims&property=P18&format=json'
                + '&entity=' + encodeURIComponent(we.v);
      } else { // wikipedia tag
        var country = we.v.split(":")[0];
        if (country === we.v)
          country = "en"
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

    // ------- Opening hours functions -------
    // TODO: separate to extra file
    function openingHoursTemplate (v) {
      var opening_hours = require('opening_hours');

      if (!v)
          return [];

      var oh = new opening_hours(v);

      // Truncate time values from given date. Set it to 00:00.0000
      function truncTime(v) {
          return new Date(v.getFullYear(), v.getMonth(), v.getDate(), 0, 0, 0, 0)
      }

      // Format given time as time string as HH:MI
      function formatTimeD(d) {
          return ("00" + d.getHours()).slice(-2) + ":" + ("00" + d.getMinutes()).slice(-2);
      }

      // Format given hour and minutes values as time string as HH:MI
      function formatTimeHM(h, m) {
          return ("00" + h).slice(-2) + ":" + ("00" + m).slice(-2);
      }

      // Shift to requested day forward or backward
      function shiftDay(d, i) {
          return (new Date((d).valueOf() + 1000*60*60*24 * i));
      }

      // Format date as YYYYMMDD
      function getFormatedDate(d) {
          return  (d.getFullYear() + ("00" + (d.getMonth()+1)).slice(-2) + ("00" + d.getDate()).slice(-2)).toString();
      }

      // Return day name. Normal (Mo,Tu...) or special day name like Today
      function getDayName(d) {
          var idxToday = "#" + getFormatedDate(new Date());
          var idxTomorrow = "#" + getFormatedDate(shiftDay((new Date()), 1));

          var days = ["Neděle","Pondělí","Úterý","Středa","Čtvrtek","Pátek","Sobota","Neděle"];
          var specialDays = [];
          specialDays[idxToday] = "Dnes";
          specialDays[idxTomorrow] = "Zítra";

          idx = "#" + getFormatedDate(d);
          if (idx in specialDays)
              return specialDays[idx];

          var day = d.getDay();
          return days[day];
      }

      // Go through opening hours array and prepare oh times for each day
      function splitByDays(oh_array) {
        var ret = [];
        var lastDay = "";

        for (i = 0; i < oh_array.length; i++) {
          var from = oh_array[i][0];
          var to = oh_array[i][1];

          var formatedDayFrom = getFormatedDate(from);
          var formatedDayTo = getFormatedDate(to);
          var diffDays = Math.ceil((to - from) / 1000 / 60 / 60 / 24) // difference by days

          var idx = "#" + formatedDayFrom;

          if ( !(idx in ret) ) {
            ret[idx] = [];
          }

          if (formatedDayFrom == formatedDayTo) { // the same day
              ret[idx].push(formatTimeD(from)  + '-' + formatTimeD(to).replace(/00:00/g, '24:00'));
          } else if (diffDays == 1) // over midnight
              ret[idx].push(formatTimeD(from)  + '-' + formatTimeD(to).replace(/00:00/g, '24:00'));
            else { // over more days - 24/7
              var tFrom = new Date(from);
              var tTo = new Date(to);
              var idx = "#" + getFormatedDate(tFrom);

              ret[idx].push(formatTimeD(tFrom)  + '-' + formatTimeHM(24, 0));

              while (formatedDayFrom != formatedDayTo) {
                  tFrom = shiftDay(tFrom, 1);
                  formatedDayFrom = getFormatedDate(tFrom);
                  idx = "#" + formatedDayFrom;
                  ret[idx] = [];
                  if (formatedDayFrom != formatedDayTo)
                      ret[idx].push(formatTimeHM(0, 0)  + '-' + formatTimeHM(24, 0));
                  else
                      ret[idx].push(formatTimeHM(0, 0)  + '-' + formatTimeD(to).replace(/00:00/g, '24:00'));
              }
          }
        }
        return ret;
      }

      // Return formated opening hours table
      function formatWeek(aOH, dFrom, nDays, bVisible) {
          var ret = [];

          var idxDay = new Date(dFrom);
          var formatedDayFrom = getFormatedDate(idxDay);
          var formatedDayTo = getFormatedDate(shiftDay(dFrom, nDays+1));

          var idx = "#" + formatedDayFrom;

          var clVisible = "";
          if (!bVisible)
              clVisible='class="oh-extended" style="display:none"';

          while (formatedDayFrom != formatedDayTo) {
              ret.push('<tr ' + clVisible + '>');

              if (idx in aOH) {
                  ret.push('<td><b>' + getDayName(idxDay) + '</b>: </td><td class="oh-times">' + aOH[idx].join(', ') + '</td></tr>');
              } else
                  ret.push("<td><b>" + getDayName(idxDay) + '</b>: </td><td class="oh-times">' + "zavřeno" + "</td></tr>");

              idxDay = shiftDay(idxDay, 1);
              formatedDayFrom = getFormatedDate(idxDay);
              idx = "#" + formatedDayFrom;
          }
          return ret;
      }

      // === Start ===
      var now = new Date();
      var today = truncTime(now);
      var tomorrow = shiftDay(today, 1);
      var intervalStart = shiftDay(today, -1); // we will start on yesterday
      var intervalEnd = shiftDay(today, 10); // plus 10 days should be enough to show week correctly

      // get opening hours grouped by days
      var intervals = splitByDays(oh.getOpenIntervals(intervalStart, intervalEnd));

      // check current state: open, close, last hour
      var currentState = oh.getStateString();
      var nextChangeDate = oh.getNextChange();

      if (nextChangeDate)
        var diffChangeMin = Math.ceil((nextChangeDate - now) / 1000 / 60); // difference to next change of state in minutes
      else
        var diffChangeMin = -1;

      var ohStateFormated = "";
      var ohClass = "";

      switch(currentState) {
        case "open":
            if (diffChangeMin > 0 && diffChangeMin <= 60) {
              ohClass = "ohlasthour";
              ohStateFormated = "poslední hodina";
            } else {
              ohClass = "ohopen";
              ohStateFormated = "otevřeno";
            }
            break;
        case "close":
            ohClass = "ohclosed";
            ohStateFormated = "zavřeno";
            break;
        case "unknown":
            ohClass = "";
            ohStateFormated = "neznámo";
            break;
      }

      // Add toggler class handler
      // see: http://stackoverflow.com/questions/19797064/show-hide-table-rows-using-javascript-classes
      // TODO: fix it!
        $(".toggler").click(function(e){
            e.preventDefault();
            console.log("toggler");
            $('.oh'+$(this).attr('data-oh')).show();
        });

      // prepare opening hours table
      var ret = [];
      ret.push('<h5>Otevírací hodiny');
      ret.push(' <span class="' + ohClass + '">');
      ret.push('(' + ohStateFormated + ')</span>');
      ret.push(' <a href="#" onclick="if ($(\'.oh-extended\').is(\':visible\')) {$(\'.oh-toggle\').html(\'&#9660;\');} else {$(\'.oh-toggle\').html(\'&#9650;\');} $(\'.oh-extended\').toggle(200);"><span class="oh-toggle">&#9660;</span></a></h5>');
      ret.push('<table>');
      ret = ret.concat(formatWeek(intervals, today, 1, true));
      ret = ret.concat(formatWeek(intervals, shiftDay(today,2), 5, false));
      ret.push('</table>');
//       ret.push('<div class="osmid"><b>osm data:</b> ' + v + '</div>');
      return ret;
    }

    // ------- POI panel template  -------
    function template(feature, icon) {
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
            else if (k.match(/^image$/)  && v.match(/^File:/))
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
        tpl = tpl.concat(openingHoursTemplate(openingHours));
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

        if (feature.wikimedia || feature.wikipedia) {
            setTimeout(function () { //after dom is created
                showWikimediaCommons();
            }, 0);
        }

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
