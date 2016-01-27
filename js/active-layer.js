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
            pharmacy: 'pharmacy',
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
            station: 'rail',
            tram_stop: 'rail-light'
        },
        shop: {
            '*': 'shop',
            chemist: 'pharmacy',
            grocery: 'grocery',
            convenience: 'grocery'
        },
        station: {
            subway: 'rail-metro'
        },
        tourism: {
            hotel: 'lodging'
        },
        historic: {
            monument: 'monument',
            memorial: 'monument'
        },
        man_made: {
            surveillance: 'camera'
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

        var iconUrl = 'https://cdn.rawgit.com/mapbox/maki/v0.5.0/renders/' + name + '-18';
        if (!name)
            iconUrl = 'https://cdn.rawgit.com/mapbox/maki/v0.5.0/renders/circle-stroked-12';


        return L.icon({
            iconUrl: iconUrl + '.png',
            iconRetinaUrl: iconUrl + '@2x.png',
            iconSize: name ? [18, 18] : [10, 10],
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
                    layer.on('click', function(event){
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

    map.on('closepopup', function(){
        hidePopupOnMouseOut = true;
    });

};

