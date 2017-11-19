// (c) 2016 osmcz-app, https://github.com/osmcz/osmcz

var osmcz = osmcz || {};
osmcz.activeLayer = function (map) {
    // -- constructor --

    var timeout;
    var geojsonURL = 'https://tile.poloha.net/json/{z}/{x}/{y}';

    var geojsonTileLayer = new L.TileLayer.GeoJSON(geojsonURL, {
            maxZoom: 25,
            code: 'A',  // clipTiles, unique
            basic: true
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
                        if (event.target && event.target.feature &&
                            !osmcz.sidebar.isVisible()) {
                            console.log('active-layer: click', event.target.feature);

                            clearTimeout(timeout);
                            osmcz.permanentlyDisplayed = true;
                            osmcz.poiPopup.open(event.target.feature, event.target.options.icon.options.iconUrl);

                            // change url, it is then possible to load without active layer
                            osmcz.poiPopup.setUrl(event.target.feature.properties);
                        }
                    });

                    layer.on('mouseover', function (event) {
                        if (osmcz.permanentlyDisplayed || osmcz.sidebar.isVisible())
                            return;

                        if (event.target && event.target.feature) {
                            clearTimeout(timeout);
                            timeout = setTimeout(function () {
                                osmcz.poiPopup.open(event.target.feature, event.target.options.icon.options.iconUrl);
                            }, 100);
                        }
                    });
                    layer.on('mouseout', function (event) {
                        if (!osmcz.permanentlyDisplayed &&
                            !osmcz.sidebar.isVisible()) {
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

    // reset panel
    function resetPanel() {
        console.log('active-layer: reset-panel');

        if (!osmcz.poiPopupOpen) {
            return;
        }

        osmcz.poiPopup.close();
        defaultPoiPanel();
    }

    function defaultPoiPanel() {
        osmcz.poiSidebar.hide();
        osmcz.poiSidebar.setContent('');
    }

    map.on('click', resetPanel);

    osmcz.poiSidebar.on('hidden', resetPanel);

    return geojsonTileLayer;
};
