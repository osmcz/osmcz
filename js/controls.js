// (c) 2016 osmcz-app, https://github.com/osmcz/osmcz

var osmcz = osmcz || {};
osmcz.controls = function (map, baseLayers, overlays, controls) {
    // -- constructor --

    controls.layers = osmcz.layerSwitcher(baseLayers, overlays).addTo(map);

    controls.zoom = L.control.zoom({
        zoomInTitle: 'Přiblížit',
        zoomOutTitle: 'Oddálit'
    }).addTo(map)

//     // leaflet-search
//     controls.search = new L.Control.Search({
//         url: 'http://nominatim.openstreetmap.org/search?format=json&q={s}',
//         jsonpParam: 'json_callback',
//         propertyName: 'display_name',
//         propertyLoc: ['lat', 'lon'],
//         circleLocation: false,
//         markerLocation: true,
//         autoType: false,
//         autoCollapse: true,
//         minLength: 2,
//         zoom: 10,
//         textPlaceholder: 'Hledat…'
//     });
//     controls.search.addTo(map);

    var options = {
        bounds: true,
        position: 'topleft',
        latlng: true,
        expanded: false,
        markers: false,
        placeholder: 'Hledat...',
        title: 'Hledat...',
        place: true
    }

    var highlightMarker;

    controls.search = new L.control.geocoder('search-QmT7HAv', options).addTo(map);

    controls.search.on('select', function (e) {
        console.log('You’ve selected', e.feature.properties.id);
        if (highlightMarker) {
            map.removeLayer(highlightMarker);
            highlightMarker = null;
        }
        var osm = e.feature.properties.id.split(':');
        if (osm[0] == "node" || osm[0] == "way") {
            osmcz.poiPopup.open({type: osm[0], id: osm[1]});
        } else {
            var coordinates = e.feature.geometry.coordinates;
            highlightMarker = new L.marker([coordinates[1], coordinates[0]]).addTo(map);
        }
        this.collapse();
    });

    controls.search.on('highlight', function (e) {
        console.log('You’ve highlighted', e.feature.properties.id);
        if (highlightMarker)
            map.removeLayer(highlightMarker);
        var coordinates = e.feature.geometry.coordinates;
        highlightMarker = new L.marker([coordinates[1], coordinates[0]]).addTo(map);
    });

    controls.search.on('reset', function (e) {
        if (highlightMarker) {
            map.removeLayer(highlightMarker);
            highlightMarker = null;
        }
    });

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
