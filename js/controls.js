// (c) 2016 osmcz-app, https://github.com/osmcz/osmcz

var osmcz = osmcz || {};
osmcz.controls = function (map, baseLayers, overlays, controls) {
    // -- constructor --

    controls.layers = osmcz.layerSwitcher(baseLayers, overlays, {priorityGroups: ["Základní", 'Letecké', 'Informace']}).addTo(map);

    controls.zoom = L.control.zoom({
        zoomInTitle: 'Přiblížit',
        zoomOutTitle: 'Oddálit'
    }).addTo(map)

    // leaflet-search
    controls.search = new L.Control.Search({
        url: 'https://nominatim.openstreetmap.org/search?format=json&q={s}',
        jsonpParam: 'json_callback',
        propertyName: 'display_name',
        propertyLoc: ['lat', 'lon'],
        circleLocation: false,
        markerLocation: true,
        autoType: false,
        autoCollapse: true,
        minLength: 2,
        zoom: 14,
        textPlaceholder: 'Hledat…'
    });
    controls.search.addTo(map);

    // leaflet-locate
    controls.locate = L.control.locate({
        follow: true,
        locateOptions: {maxZoom: 15},
        icon: 'glyphicon glyphicon-map-marker',
        strings: {
            title: "Zobrazit moji aktuální polohu"
        }
    }).addTo(map);

    // leaflet-filelayer - upload GPX, KML a GeoJSON
    var style = {color: 'red', opacity: .6, fillOpacity: .5, weight: 4, clickable: false};
    L.Control.FileLayerLoad.LABEL = '<span class="glyphicon glyphicon-folder-open"></span>';
    L.Control.FileLayerLoad.TITLE = 'Načíst lokální data (GPX, KML, GeoJSON)';

    controls.fileLayerLoad = L.Control.fileLayerLoad({
        fitBounds: true,
        layerOptions: {
            style: style,
            pointToLayer: function (data, latlng) {
                return L.circleMarker(latlng, {style: style});
            }
        }
    }).addTo(map);


    // Leaflet Coordinates Control
    controls.coordinates = new L.Control.Coordinates(); // you can send options to the constructor if you want to, otherwise default values are used
    controls.coordinates.addTo(map);
    map.on('click', function (e) {
        controls.coordinates.setCoordinates(e);
    });

    // scale
    controls.scale = L.control.scale({
        imperial: false
    }).addTo(map);

};
