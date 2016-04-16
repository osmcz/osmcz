// (c) 2016 osmcz-app, https://github.com/osmcz/osmcz

var osmcz = osmcz || {};
osmcz.activeLayer = function (map, baseLayers, overlays, controls) {
    // -- constructor --

    var timeout;
    var geojsonURL = 'http://tile.poloha.net/json/{z}/{x}/{y}';

    var geojsonTileLayer = new L.TileLayer.GeoJSON(geojsonURL, {
            maxZoom: 25,
            code: 'A'  //clipTiles, unique
        }, {
            style: {
                clickable: true
            },

            pointToLayer: function (feature, latlng) {
                return L.marker(latlng, {icon: osmcz.iconsService.get(feature.properties.tags)});
            },

            onEachFeature: function (feature, layer) {

                if (!(layer instanceof L.Point)) {
                    layer.on('click', function (event) {
                        if (event.target && event.target.feature) {
                            console.log('active-layer: click', event.target.feature);

                            clearTimeout(timeout);
                            osmcz.permanentlyDisplayed = true;
                            openPoiPanel(event.target.feature, event.target.options.icon.options.iconUrl);

                            // change url, it is then possible to load without active layer
                            osmcz.poiPopup.setUrl(event.target.feature.properties);
                        }
                    });

                    layer.on('mouseover', function (event) {
                        if (osmcz.permanentlyDisplayed)
                            return;

                        if (event.target && event.target.feature) {
                            clearTimeout(timeout);
                            timeout = setTimeout(function () {
                                openPoiPanel(event.target.feature, event.target.options.icon.options.iconUrl);
                            }, 100);
                        }
                    });
                    layer.on('mouseout', function (event) {
                        if (!osmcz.permanentlyDisplayed) {
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
            //$('#map-container').addClass('searchbar-on js_active-layer-on');
            //defaultPoiPanel();
        }
    });
    map.on('layerremove', function (event) {
        if (event.layer == geojsonTileLayer) {
            //$('#map-container').removeClass('searchbar-on js_active-layer-on');
        }
    });

    //reset panel
    function resetPanel() {
        console.log('active-layer: reset-panel');

        osmcz.poiPopup.close();
        defaultPoiPanel();
    }

    $('#map-searchbar').on('click', '.close', resetPanel);  // TODO delegate closing on poiPopup.close() and fire event
    map.on('click', resetPanel);


    function openPoiPanel(feature, icon) {
        $('#map-container').addClass('searchbar-on');
        $('#map-searchbar').html(osmcz.poiPopup.getHtml(feature, icon));
    }

    function defaultPoiPanel() {
        $('#map-container').removeClass('searchbar-on');
        //$('#map-searchbar').html("Najeďte myší na bod nebo klikněte.");
    }

};
