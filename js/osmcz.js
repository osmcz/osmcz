var map;
initmap();

function initmap() {
    map = new L.Map('map');

    var stamen = L.tileLayer('http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg', {
        attribution: 'Map data CC-BY-SA <a href="http://openstreetmap.org">OSM.org</a>, imagery <a href="http://maps.stamen.com">Stamen Design</a>',
        maxZoom: 18
    });

    var osm = L.tileLayer('http://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    });

    var mapbox = L.tileLayer('http://{s}.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiemJ5Y3oiLCJhIjoiRUdkVEMzMCJ9.7eJ3YhCQtbVUET92En5aGA', {
        attribution: 'OpenStreetMap.org & Mapbox'
    });

    var ocm = L.tileLayer("http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: 'Data: <a href="http://opencyclemap.org">OpenCycleMap</a>'
    });

    var hikebike = L.tileLayer("http://toolserver.org/tiles/hikebike/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: 'Data: <a href="http://www.hikebikemap.de">Hike &amp; Bike Map</a>'
    });

    var mtb = L.tileLayer("http://tile.mtbmap.cz/mtbmap_tiles/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: 'OpenStreetMap.org a USGS'
    });

    var baseLayers = {
        "Mapbox streets": mapbox.addTo(map),
        "MTBMap.cz": mtb,
        "OpenStreetMap Mapnik": osm,
        "OpenCycleMap": ocm,
        "Hike&bike": hikebike,
        "Vodovky": stamen
    };
    var overlays = {};


    var layersControl = L.control.layers(baseLayers, overlays).addTo(map);
    L.control.scale().addTo(map);
    L.control.locate({
        follow: true,
        locateOptions: {maxZoom: 15},
        icon: 'glyphicon glyphicon-map-marker',
        strings: {
            title: "Zobrazit moji aktuální polohu"
        }
    }).addTo(map);
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


    // skrytí obsahu při kliku / posunutí mapy
    var container = $('#main>div');
    var closeOverlay = function () {
        map.scrollWheelZoom.enable();
        container.fadeOut('slow', function () {
            $('nav .active').removeClass('active');
        });

        $('nav .active').on('click.fader', function () {
            map.scrollWheelZoom.disable();
            container.fadeIn('slow');
            $(this).addClass('active').off('click.fader');
        });
    };
    map.on('click movestart', closeOverlay);
    $('.close-overlay').click(closeOverlay);
    container.click(function (event) {
        if (event.target.parentNode == this) //div.row děti v .containeru
            closeOverlay();
    });
    map.scrollWheelZoom.disable(); // defaultně je otevřený = zakážem scroll-zoom

    // skrytí overlay, pokud byl zobrazen méně než 24h nazpět
    var overlayShownLast = localStorage.getItem('overlayShownLast');
    if (overlayShownLast > Date.now() - 1000 * 3600 * 24) {
        closeOverlay();
    }
    else {
        localStorage.setItem('overlayShownLast', Date.now());
    }

    // nastavení polohy dle hashe nebo zapamatované
    !setViewFromHash(location.hash)
    && !setViewFromHash(localStorage.getItem('position'))
    && map.setView(new L.LatLng(49.8, 15.44), 8);

    // updatnutí při změně hashe
    var lastHash;
    $(window).bind('hashchange', function (e) {
        if (location.hash != lastHash) {
            setViewFromHash(location.hash);
            lastHash = location.hash;
        }
    });

    // pamatování poslední polohy
    map.on('moveend zoomend', function () {
        lastHash = OSM.formatHash(map)
        location.hash = lastHash;
        localStorage.setItem('position', lastHash);
    });


    new rozcestniky(map, layersControl);
}


function setViewFromHash(hash) {
    if (!hash) return;
    var loc = OSM.parseHash(hash);
    if (!loc.center) return;
    console.log('setviewfromhash', hash, loc);
    map.setView(loc.center, loc.zoom);
    return true;
}

