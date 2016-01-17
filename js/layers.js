// (c) 2016 osmcz-app, https://github.com/osmcz/osmcz

var osmcz = osmcz || {};
osmcz.layers = function (map, baseLayers, overlays, controls) {
    // -- constructor --

    var devicePixelRatio = window.devicePixelRatio || 1,
        retinaSuffix = devicePixelRatio >= 2 ? '@2x' : '';
    var osmAttr = '&copy; <a href="http://openstreetmap.org/copyright">OSM</a>'; //abbrevation not recommended on other websites

    var mapbox = L.tileLayer('http://{s}.tiles.mapbox.com/v4/mapbox.streets-basic/{z}/{x}/{y}' + retinaSuffix + '.png?access_token=pk.eyJ1IjoiemJ5Y3oiLCJhIjoiRUdkVEMzMCJ9.7eJ3YhCQtbVUET92En5aGA', {
        attribution: osmAttr + ", <a href='https://www.mapbox.com/about/maps/'>Mapbox</a>",
        osmczDefaultLayer: true
    });

    var turisticka = L.tileLayer("http://tile.poloha.net/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: osmAttr + ', <a href="http://www.poloha.net">poloha.net</a>',
        code: 'k'
    });

    var osm = L.tileLayer('http://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: osmAttr,
        code: 'd'
    });

    var ocm = L.tileLayer("http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: osmAttr + ', <a href="http://opencyclemap.org">OpenCycleMap</a>',
        code: 'c'
    });

    var hikebike = L.tileLayer("http://toolserver.org/tiles/hikebike/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: osmAttr + ', <a href="http://www.hikebikemap.org">Hike &amp; Bike Map</a>',
        code: 'h'
    });

    var mtb = L.tileLayer("http://tile.mtbmap.cz/mtbmap_tiles/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: osmAttr + ', <a href="http://www.mtbmap.cz">mtbmap.cz</a>',
        code: 'm'
    });

    var vodovky = L.tileLayer('http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg', {
        attribution: '&copy; CC-BY-SA <a href="http://openstreetmap.org/copyright">OSM</a>, imagery <a href="http://maps.stamen.com">Stamen Design</a>',
        maxZoom: 18,
        code: 's'
    });

    var dopravni = L.tileLayer("https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}" + retinaSuffix + ".png", {
        maxZoom: 18,
        attribution: osmAttr + ', <a href="http://www.thunderforest.com/maps/transport/">Thunderforest</a>',
        code: 't'
    });

    var ortofoto = L.tileLayer.wms('http://geoportal.cuzk.cz/WMS_ORTOFOTO_PUB/service.svc/get', {
        layers: 'GR_ORTFOTORGB',
        format: 'image/jpeg',
        transparent: false,
        crs: L.CRS.EPSG4326,
        minZoom: 7,
        maxZoom: 22,
        attribution: '&copy; <a href="http://www.cuzk.cz">ČÚZK</a>',
        code: 'o'
    });
    map.on('layeradd', function (event) {
        if (event.layer == ortofoto || event.layer == vodovky) {  //TODO vypnutí overlay + přepnutí na druhou to buguje
            if (!map.hasLayer(ortofotoOverlay)) {
                setTimeout(function(){  // needs timeout or doesnt work
                    console.log('added overlay');
                    map.addLayer(ortofotoOverlay);
                }, 300);
            }
        }
    });


    // --- overlays


    var turistikaOverlay = L.tileLayer("http://tile.poloha.net/kct/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: osmAttr + ', <a href="http://www.poloha.net">poloha.net</a>',
        opacity: 0.6,
        code: 'K'
    });

    var ortofotoOverlay = L.tileLayer("https://{s}.tiles.mapbox.com/v4/zbycz.e9b65202/{z}/{x}/{y}" + retinaSuffix + ".png?access_token=pk.eyJ1IjoiemJ5Y3oiLCJhIjoiRUdkVEMzMCJ9.7eJ3YhCQtbVUET92En5aGA", {
        maxZoom: 22,
        attribution: osmAttr + ", <a href='https://www.mapbox.com/about/maps/'>Mapbox</a>",
        opacity: 1,
        code: 'O'
    });

    var vrstevniceOverlay = L.tileLayer("http://tile.poloha.net/hills/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: osmAttr + ', <a href="http://www.poloha.net">poloha.net</a>',
        opacity: 0.6,
        code: 'V'
    });

    var zimniOverlay = L.tileLayer("http://www.opensnowmap.org/opensnowmap-overlay/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: osmAttr + ', <a href="http://www.opensnowmap.org">opensnowmap.org</a>',
        code: 'Z'
    });

    var lonviaHikingOverlay = new L.TileLayer('http://tile.lonvia.de/hiking/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: osmAttr + ', <a href="http://hiking.lonvia.de">Lonvias Hiking</a>',
        opacity: 0.6,
        code: 'H'
    });

    var lonviaCyclingOverlay = new L.TileLayer('http://tile.lonvia.de/cycling/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: osmAttr + ', <a href="http://cycling.lonvia.de">Lonvias Cycling</a>',
        opacity: 0.6,
        code: 'C'
    });


    baseLayers["Mapbox streets"] = mapbox;
    baseLayers["Turistická mapa"] = turisticka;
    baseLayers["MTBMap.cz"] = mtb;
    baseLayers["OpenStreetMap Mapnik"] = osm;
    baseLayers["OpenCycleMap"] = ocm;
    baseLayers["Hikebikemap.org"] = hikebike;
    baseLayers["Vodovky"] = vodovky;
    baseLayers["Ortofoto ČÚZK"] = ortofoto;
    baseLayers["Dopravní"] = dopravni;

    overlays["Ortofoto popisky"] = ortofotoOverlay;
    overlays["Turistické trasy ČR"] = turistikaOverlay;
    overlays["Vrstevnice ČR"] = vrstevniceOverlay;
    overlays["Zimní sporty"] = zimniOverlay;
    overlays["Turistické trasy EU"] = lonviaHikingOverlay;
    overlays["Cyklistické trasy EU"] = lonviaCyclingOverlay;

};
