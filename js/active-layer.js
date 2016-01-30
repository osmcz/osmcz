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
                            openPoiPanel(event.target.feature);
                        }
                    });

                    layer.on('mouseover', function (event) {
                        if (permanentlyDisplayed)
                            return;

                        if (event.target && event.target.feature) {
                            clearTimeout(timeout);
                            timeout = setTimeout(function () {
                                openPoiPanel(event.target.feature);
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

    $('#map-searchbar').on('click', '.close', function () {
        defaultPoiPanel();
        permanentlyDisplayed = false;
    });


    overlays["Aktivní vrstva"] = geojsonTileLayer;

    map.on('layeradd', function(event) {
        if(event.layer == geojsonTileLayer) {
            $('#map-container').addClass('searchbar-on');
            defaultPoiPanel();
        }
    });
    map.on('layerremove', function(event) {
        if(event.layer == geojsonTileLayer) {
            $('#map-container').removeClass('searchbar-on');
        }
    });


    function IsNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    function openPoiPanel(feature) {
        $('#map-searchbar').html(template(feature));
    }

    function defaultPoiPanel() {
        $('#map-searchbar').html("Najeďte myší na bod zájmu<br>nebo klikněte pro trvalé zobrazení.");

    }

    function template(feature) {
        var id = feature.properties.osm_id;
        var osm_type = feature.properties.osm_type;
        var addr = {};
        var tpl = '';
        tpl += permanentlyDisplayed ? '<a class="close">&times;</a>' : '';
        tpl += '<h4>' + (feature.properties.tags.name || 'Bod zájmu') + '</h4>';
        tpl += '<a href="http://osm.org/' + osm_type + '/' + id + '">osm ' + osm_type + ' ' + id + '</a>';

        $.each(feature.properties.tags, function (k, v) {
            if (k.match(/^addr:/))
                addr[k] = v;
            else
                tpl += '<br><b>' + k + '</b> = ' + v;
        });

        if (addr['addr:street']) {
            tpl += '<br><br>adresní bod:';
            $.each(addr, function (k, v) {
               tpl += '<br><b>' + k + '</b> = ' + v;
            });
        }
        return tpl;
    }

};
