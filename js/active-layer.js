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
    var marker = L.circleMarker([0,0]);

    var geojsonURL = 'http://tile.poloha.net/json/{z}/{x}/{y}';
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
                        console.log('click', event);
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
    function resetPanel(){
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
            else if (!k.match(/^addr:/) &&
                     !k.match(/^ref:ruian:/)
                    )
                general.push({k:k, v:v});
        });

        // sort the array
        general.sort(function(a, b){
          var nameA=a.k, nameB=b.k
          if (nameA < nameB) //sort string ascending
            return -1
          if (nameA > nameB)
            return 1
          return 0 //default return value (no sorting)
          });

        if (general.length) {
            for (var i in general)
            {
                var k = general[i].k;
                var v = general[i].v;
                if (k.match(/^wikipedia/)) {
                    tpl.push('<b>' + k + '</b> = <a href="https://www.wikipedia.org/wiki/' + v + '">'+ v + '</a>');
                }
                else {
                    tpl.push('<b>' + k + '</b> = ');
                    tpl.push(v.match(/^https?:\/\/.+/) ? ('<a href="' + v + '">' + v + '</a>') : v);
                }
                tpl.push('<br>');
            };
        };


        var section = function (obj, label) {
            if (Object.keys(obj).length) {
                tpl.push('<h5>' + label + '</h5>');
                $.each(obj, function (k, v) {
                    tpl.push('<b>' + k + '</b> = ');
                    tpl.push(v.match(/^https?:\/\/.+/) ? ('<a href="' + v + '">' + v + '</a>') : v);
                    tpl.push('<br>');
                });
                tpl.pop(); //remove last br
            }
        };

        section(name, 'Další jména:');
        section(payment, 'Možnosti platby:');
        section(contact, 'Kontakty:');
        section(building, 'Budova:');

        tpl.push('<div class="osmid"><a href="http://osm.org/' + osm_type + '/' + id + '">osm ID: ' + osm_type + '/' + id + '</a></div>');
        tpl.push('<div id="mapillary-photo" data-osm-id="' + id + '"></div>');

        if (permanentlyDisplayed) {
            var lon = feature.geometry.coordinates[0];
            var lat = feature.geometry.coordinates[1];

            marker.setLatLng([lat, lon]).addTo(map);

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

        var mpTpl = '<h5>Nejbližší foto</h5>'
            + '<a href="http://www.mapillary.com/map/im/_key/photo">'
            + '<img src="http://images.mapillary.com/_key/thumb-320.jpg" width="250" height="187">'
            + '</a>';
        function showMapillary() {
            var mp = $('#mapillary-photo');
            if (id = mp.attr('data-osm-id') && feature.mapillary.length) {
                mp.html(mpTpl.replace(/_key/g, feature.mapillary[0].key));
            }
        };

        return tpl.join('');
    }

};
