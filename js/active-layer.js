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

        if (name && IsNumeric(pc[pc.length - 1])) {

            var icName = name.substring(0, name.length - pc[pc.length - 1].length);
            var icSize = parseInt(pc[pc.length - 1]);
            var size = [icSize, icSize];

            if (icSize <= 12) {
                var iconUrl = 'https://cdn.rawgit.com/mapbox/maki/v0.5.0/renders/' + icName + '12';
            } else if (icSize > 12 && icSize <= 18) {
                var iconUrl = 'https://cdn.rawgit.com/mapbox/maki/v0.5.0/renders/' + icName + '18';
            } else {
                var iconUrl = 'https://cdn.rawgit.com/mapbox/maki/v0.5.0/renders/' + icName + '24';
            }


        } else if (name && !IsNumeric(pc[pc.length - 1])) {
            var iconUrl = 'https://cdn.rawgit.com/mapbox/maki/v0.5.0/renders/' + name + '-18';
            var size = [18, 18];

        } else {
            var iconUrl = 'https://cdn.rawgit.com/mapbox/maki/v0.5.0/renders/circle-stroked-12';
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
    var hidePopupOnMouseOut = true;

    var geojsonURL = 'http://tile.poloha.net/json/{z}/{x}/{y}';
    var geojsonTileLayer = new L.TileLayer.GeoJSON(geojsonURL, {
            maxZoom: 25,
            code: 'A'
            //clipTiles: true,
            //unique: function (feature) {                return feature.osm_id;            }
        }, {
            style: style,

            pointToLayer: function (feature, latlng) {
                var icon = getIcon(feature.properties.tags);
                if (icon)
                    return L.marker(latlng, {icon: icon});
                else
                    return L.circleMarker(latlng, style);
            },

            onEachFeature: function (feature, layer) {

                if (feature.properties) {
                    var id = feature.properties.osm_id;
                    var popupContent = '<div class="popup" style="width: 20em">'
                        + '<a href="http://osm.org/node/' + id + '">osm node ' + id + '</a>';
                    for (var k in feature.properties.tags) {
                        popupContent += '<br><b>' + k + '</b> = ' + feature.properties.tags[k];
                    }
                    //popupContent += '<p><small>Zavřít možno kliknutím do mapy. Oteření popupu možno najetím či kliknutím.</small></p>';
                    popupContent += '</div>';

                    layer.bindPopup(popupContent);
                }

                if (!(layer instanceof L.Point)) {
                    layer.on('click', function (event) {
                        console.log(event);
                        if (event.target && event.target.feature) {
                            clearTimeout(timeout);
                            event.target.openPopup();
                            hidePopupOnMouseOut = false;
                        }
                    });

                    layer.on('mouseover', function (event) {
                        if (event.target && event.target.feature) {
                            clearTimeout(timeout);
                            timeout = setTimeout(function () {
                                //console.log(event.target.feature);
                                event.target.openPopup();
                            }, 300);
                        }
                        //layer.setStyle(hoverStyle);
                    });
                    layer.on('mouseout', function (event) {
                        if (hidePopupOnMouseOut) {
                            clearTimeout(timeout);
                            layer.closePopup();
                            //layer.setStyle(style);
                        }
                    });
                }
            }
        }
    );

    overlays["Aktivní vrstva"] = geojsonTileLayer;

    map.on('drag', function (e) {
        hidePopupOnMouseOut = true;
        map.closePopup();
    });

    map.on('closepopup', function () {
        hidePopupOnMouseOut = true;
    });

    function IsNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

};

