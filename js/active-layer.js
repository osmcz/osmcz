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


    var timeout;

    var geojsonURL = 'http://tile.poloha.net/json/{z}/{x}/{y}';
    var geojsonTileLayer = new L.TileLayer.GeoJSON(geojsonURL, {
            code: 'A'
            //clipTiles: true,
            //unique: function (feature) {                return feature.osm_id;            }
        }, {
            style: style,

            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, style);
            },

            onEachFeature: function (feature, layer) {

                if (feature.properties) {
                    var id = feature.properties.osm_id;
                    var popupContent = '<div class="popup" style="width: 20em">'
                        +'<a href="http://osm.org/node/'+id+'">osm node '+ id+'</a>';
                    for (var k in feature.properties.tags) {
                        popupContent += '<br><b>'+k + '</b> = ' + feature.properties.tags[k];
                    }
                    popupContent += '<p><small>Zavřít možno kliknutím do mapy.</small></p></div>';

                    layer.bindPopup(popupContent);
                }

                if (!(layer instanceof L.Point)) {
                    layer.on('mouseover', function (event) {
                        if (event.target && event.target.feature) {
                            clearTimeout(timeout);
                            timeout = setTimeout(function(){
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

