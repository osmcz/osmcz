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
            atm: 'bank'
        },
        highway: {
            bus_stop: 'bus'
        },
        railway: {
            station: 'rail'
        },
        station: {
            subway: 'rail-metro',
        },
        shop: 'shop'
    };

    function getIcon(tags){
        var name = false;
        for(var key in tags) {
            var val = tags[key];
            if (typeof icons[key] == 'string')
                name = icons[key];
            else if (icons[key] && icons[key][val])
                name = icons[key][val];
        }
        if (!name)
            return;

        var iconUrl = 'https://cdn.rawgit.com/mapbox/maki/v0.5.0/renders/' + name;
        return L.icon({
            iconUrl: iconUrl + '-18.png',
            iconRetinaUrl: iconUrl + '-18@2x.png',
            iconSize: [18, 18]
        });
    }

    var timeout;

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
                    popupContent += '<p><small>Zavřít možno kliknutím do mapy. Oteření popupu možno najetím či kliknutím.</small></p></div>';

                    layer.bindPopup(popupContent);
                }

                if (!(layer instanceof L.Point)) {
                    layer.on('mouseover', function (event) {
                        if (event.target && event.target.feature) {
                            clearTimeout(timeout);
                            timeout = setTimeout(function () {
                                console.log(event.target.feature);
                                event.target.openPopup();
                            }, 300);
                        }
                        layer.setStyle(hoverStyle);
                    });
                    layer.on('mouseout', function (event) {
                        clearTimeout(timeout);
                        layer.setStyle(style);
                    });
                }
            }
        }
    );

    overlays["Aktivní vrstva"] = geojsonTileLayer;
};

