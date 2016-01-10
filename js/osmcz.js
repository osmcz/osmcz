var OSMCZ_APP_VERSION = '0.1';

var map, baseLayers, overlays;
var marker = L.marker([0, 0]);
initmap();

function initmap() {
    map = new L.Map('map');
    map.attributionControl.setPrefix("<a href='https://github.com/osmcz/osmcz' title='Projekt na Githubu'><img src='http://github.com/favicon.ico' width='10' style='margin-right:1ex'>osmcz-app</a> " + OSMCZ_APP_VERSION)

    var mapbox = L.tileLayer('http://{s}.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiemJ5Y3oiLCJhIjoiRUdkVEMzMCJ9.7eJ3YhCQtbVUET92En5aGA', {
        attribution: 'OpenStreetMap.org & Mapbox'
    });

    var osm = L.tileLayer('http://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
        code: 'd'
    });

    var ocm = L.tileLayer("http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: 'Data: <a href="http://opencyclemap.org">OpenCycleMap</a>',
        code: 'c'
    });

    var hikebike = L.tileLayer("http://toolserver.org/tiles/hikebike/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: 'Data: <a href="http://www.hikebikemap.de">Hike &amp; Bike Map</a>',
        code: 'h'
    });

    var mtb = L.tileLayer("http://tile.mtbmap.cz/mtbmap_tiles/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: 'OpenStreetMap.org a USGS',
        code: 'm'
    });

    var vodovky = L.tileLayer('http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg', {
        attribution: 'Map data CC-BY-SA <a href="http://openstreetmap.org">OSM.org</a>, imagery <a href="http://maps.stamen.com">Stamen Design</a>',
        maxZoom: 18,
        code: 's'
    });

    baseLayers = {
        "Mapbox streets": mapbox.addTo(map),
        "MTBMap.cz": mtb,
        "OpenStreetMap Mapnik": osm,
        "OpenCycleMap": ocm,
        "Hike&bike": hikebike,
        "Vodovky": vodovky
    };
    overlays = {};

    // -------------------- map controls --------------------

    var layersControl = L.control.layers(baseLayers, overlays).addTo(map);
    L.control.scale().addTo(map);

    // leaflet-locate
    L.control.locate({
        follow: true,
        locateOptions: {maxZoom: 15},
        icon: 'glyphicon glyphicon-map-marker',
        strings: {
            title: "Zobrazit moji aktuální polohu"
        }
    }).addTo(map);

    // leaflet-search
    map.addControl(new L.Control.Search({
        url: 'http://nominatim.openstreetmap.org/search?format=json&q={s}',
        jsonpParam: 'json_callback',
        propertyName: 'display_name',
        propertyLoc: ['lat', 'lon'],
        circleLocation: false,
        markerLocation: true,
        autoType: false,
        autoCollapse: true,
        minLength: 2,
        zoom: 10
    }));

    // leaflet-filelayer - upload GPX, KML a GeoJSON
    var style = {color: 'red', opacity: .6, fillOpacity: .5, weight: 4, clickable: false};
    L.Control.FileLayerLoad.LABEL = '<span class="glyphicon glyphicon-folder-open"></span>';
    L.Control.fileLayerLoad({
        fitBounds: true,
        layerOptions: {
            style: style,
            pointToLayer: function (data, latlng) {
                return L.circleMarker(latlng, {style: style});
            }
        }
    }).addTo(map);


    // -------------------- map state --------------------

    // nastavení polohy dle hashe nebo zapamatované v cookie nebo home
    OSM.home = {lat: 49.8, lon: 15.44, zoom: 8};
    var params = OSM.mapParams();
    updateLayersFromCode(params.layers);
    if (params.bounds) {
        map.fitBounds(params.bounds);
    } else {
        map.setView([params.lat, params.lon], params.zoom);
    }
    if (params.marker) {
        marker.setLatLng([params.mlat, params.mlon]).addTo(map);
    }
    if (params.object)
        alert('Zatím nepodporováno //TODO!');

    // updatnutí při změně hashe
    var lastHash;
    $(window).bind('hashchange', function (e) {
        if (location.hash != lastHash) {
            var hash = OSM.parseHash(location.hash);
            if (hash.center)
                map.setView([hash.lat, hash.lon], hash.zoom);
            updateLayersFromCode(hash.layers);
            lastHash = location.hash;
        }
    });

    // pamatování poslední polohy v cookie a hashi
    map.on('moveend zoomend layeradd layerremove', function () {
        lastHash = OSM.formatHash(map)
        location.hash = lastHash;
        Cookies.set("_osm_location", OSM.locationCookie(map), {expires: 31});
    });


    // pokud přepnutá baselayer je mimo zoom, rozumně odzoomovat //TODO ověřit že funguje
    map.on("baselayerchange", function (e) {
        if (map.getZoom() > e.layer.options.maxZoom) {
            map.setView(map.getCenter(), e.layer.options.maxZoom, {reset: true});
        }
    });

    // -------------------- overlay --------------------

    var showOverlayOnClick = function () {
        $('nav .active').on('click.fader', function (event) {
            event.preventDefault();
            map.scrollWheelZoom.disable();
            container.fadeIn('slow');
            $(this).addClass('active').off('click.fader');
        });
    };

    var closeOverlay = function () {
        map.scrollWheelZoom.enable();
        container.fadeOut('slow', function () {
            setTimeout(function () {
                $('nav .active').removeClass('active');
            }, 700);
        });

        showOverlayOnClick();
    };

    // skrytí obsahu při kliku / posunutí mapy
    var container = $('#main .container');

    map.scrollWheelZoom.disable(); // defaultně je otevřený = zakážem scroll-zoom
    map.on('click movestart', closeOverlay); //vždy

    if (container.hasClass('splash')) { //pouze splash-screen (je defaultně skrytý přes css)
        $('.close-overlay').click(closeOverlay);
        container.click(function (event) {
            if (event.target.parentNode == this) //div.row děti v .containeru
                setTimeout(closeOverlay, 200);
        });

        // skrytí overlay
        if (Cookies.get('overlayShown')) {
            map.scrollWheelZoom.enable();
            showOverlayOnClick();
            $('nav .active').removeClass('active');
        }
        else {
            container.show();
            Cookies.set('overlayShown', 'yes', {expires: 7}); // za 7 dní zobrazíme znovu
        }
    }

    // -------------------- moduly --------------------

    new rozcestniky(map, layersControl);

}

// set layers from coded string
function updateLayersFromCode(codedString) {
    var setLayer = function (key, layer) {
        for (var pos in codedString) {
            if (layer.options && layer.options.code == codedString[pos])
                map.addLayer(layer);
        }
    };
    $.each(baseLayers, setLayer);
    $.each(overlays, setLayer);
}
