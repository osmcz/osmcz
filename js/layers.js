// (c) 2016 osmcz-app, https://github.com/osmcz/osmcz

var osmcz = osmcz || {};
osmcz.layers = function (map, baseLayers, overlays, controls) {
    // -- constructor --

    var devicePixelRatio = window.devicePixelRatio || 1,
        retinaSuffix = devicePixelRatio >= 2 ? '@2x' : '';
    var osmAttr = '&copy; <a href="https://openstreetmap.org/copyright">OSM</a>'; //abbrevation not recommended on other websites

    var mapbox = L.tileLayer('https://{s}.tiles.mapbox.com/v4/mapbox.streets-basic/{z}/{x}/{y}' + retinaSuffix + '.png?access_token=pk.eyJ1IjoiemJ5Y3oiLCJhIjoiRUdkVEMzMCJ9.7eJ3YhCQtbVUET92En5aGA', {
        attribution: osmAttr + ", <a href='https://www.mapbox.com/about/maps/'>Mapbox</a>",
        osmczDefaultLayer: true
    });

    var turisticka = L.tileLayer("http://tile.poloha.net/{z}/{x}/{y}.png", {
        maxZoom: 20,
        attribution: osmAttr + ', <a href="http://www.poloha.net">poloha.net</a>', // @TODO: upravit, až bude funkční HTTPS verze
        code: 'k'
    });

    var opentopomap = L.tileLayer("https://{s}.tile.opentopomap.org//{z}/{x}/{y}.png", {
        maxZoom: 15,
        attribution: osmAttr + ', <a href="http://opentopomap.org/">OpenTopoMap</a>', // @TODO: upravit, až bude HTTPS verze
        code: 'u'
    });

    var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: osmAttr,
        code: 'd'
    });

    var ocm = L.tileLayer("http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: osmAttr + ', <a href="http://opencyclemap.org">OpenCycleMap</a>', // @TODO: upravit, až bude HTTPS verze
        code: 'c'
    });

    var hikebike = L.tileLayer("http://toolserver.org/tiles/hikebike/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: osmAttr + ', <a href="http://www.hikebikemap.org">Hike &amp; Bike Map</a>', // @TODO: upravit, až bude HTTPS verze
        code: 'h'
    });

    var mtb = L.tileLayer("http://tile.mtbmap.cz/mtbmap_tiles/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: osmAttr + ', <a href="http://www.mtbmap.cz">mtbmap.cz</a>', // @TODO: upravit, až bude HTTPS verze
        code: 'm'
    });

    var vodovky = L.tileLayer('https://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg', {
        attribution: '&copy; CC-BY-SA <a href="https://openstreetmap.org/copyright">OSM</a>, imagery <a href="http://maps.stamen.com">Stamen Design</a>',
        maxZoom: 18,
        code: 's'
    });

    var dopravni = L.tileLayer("https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}" + retinaSuffix + ".png", {
        maxZoom: 18,
        attribution: osmAttr + ', <a href="http://www.thunderforest.com/maps/transport/">Thunderforest</a>', // @TODO: upravit, až bude HTTPS verze
        code: 't'
    });

    var opnv = L.tileLayer("http://tileserver.memomaps.de/tilegen/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: osmAttr + ', <a href="http://www.öpnvkarte.de/">öpnvkarte</a>', // @TODO: upravit, až bude HTTPS verze
        code: 'ö'
    });

    var menepopisku = L.tileLayer("http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}" + retinaSuffix + ".png", {
        maxZoom: 18,
        attribution: osmAttr + ', <a href="https://cartodb.com/attributions#basemaps">CartoDB</a>',
        code: 'b'
    });

    var ortofoto = L.tileLayer.wms('http://geoportal.cuzk.cz/WMS_ORTOFOTO_PUB/service.svc/get', {
        layers: 'GR_ORTFOTORGB',
        format: 'image/jpeg',
        transparent: false,
        crs: L.CRS.EPSG4326,
        minZoom: 7,
        maxZoom: 22,
        attribution: '&copy; <a href="http://www.cuzk.cz">ČÚZK</a>', // @TODO: upravit, až bude HTTPS verze
        code: 'o'
    });
    map.on('baselayerchange', function (event) {
        if (event.layer == ortofoto || event.layer == vodovky) {
            setTimeout(function(){  // needs timeout or doesnt work
                if (!map.hasLayer(ortofotoOverlay)) {
                    console.log('added overlay');
                    map.addLayer(ortofotoOverlay);
                }
                if (event.layer == ortofoto) {
                    vrstevniceOverlay.setUrl(vrstevniceOverlayOrtoUrl);
                } else {
                    vrstevniceOverlay.setUrl(vrstevniceOverlayUrl);
                }
                vrstevniceOverlay.redraw();
            }, 300);
        } else {
              setTimeout(function(){  // needs timeout or doesnt work
                    console.log('removed overlay');
                    if (map.hasLayer(ortofotoOverlay)) {
                      map.removeLayer(ortofotoOverlay);
                    }
                    vrstevniceOverlay.setUrl(vrstevniceOverlayUrl);
                    vrstevniceOverlay.redraw();
                }, 300);
            }
    });


    // --- overlays


    var turistikaOverlay = L.tileLayer("http://tile.poloha.net/kct/{z}/{x}/{y}.png", {
        maxZoom: 20,
        attribution: osmAttr + ', <a href="http://www.poloha.net">poloha.net</a>', // @TODO: upravit, až bude HTTPS verze
        opacity: 0.6,
        code: 'K'
    });

    var ortofotoOverlay = L.tileLayer("https://{s}.tiles.mapbox.com/v4/zbycz.e9b65202/{z}/{x}/{y}" + retinaSuffix + ".png?access_token=pk.eyJ1IjoiemJ5Y3oiLCJhIjoiRUdkVEMzMCJ9.7eJ3YhCQtbVUET92En5aGA", {
        maxZoom: 22,
        attribution: osmAttr + ", <a href='https://www.mapbox.com/about/maps/'>Mapbox</a>",
        opacity: 1,
        code: 'O'
    });

    var vrstevniceOverlayUrl = "http://tile.poloha.net/contours/{z}/{x}/{y}.png";
    var vrstevniceOverlayOrtoUrl = "http://tile.poloha.net/contours_ortofoto/{z}/{x}/{y}.png";
    var vrstevniceOverlay = L.tileLayer(vrstevniceOverlayUrl, {
        maxZoom: 20,
        attribution: osmAttr + ', <a href="http://www.poloha.net">poloha.net</a>', // @TODO: upravit, až bude HTTPS verze
        opacity: 0.6,
        code: 'V'
    });

    var zimniOverlay = L.tileLayer("http://www.opensnowmap.org/opensnowmap-overlay/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: osmAttr + ', <a href="http://www.opensnowmap.org">opensnowmap.org</a>', // @TODO: upravit, až bude HTTPS verze
        code: 'Z'
    });

    var lonviaHikingOverlay = new L.TileLayer('http://tile.lonvia.de/hiking/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: osmAttr + ', <a href="http://hiking.lonvia.de">Lonvias Hiking</a>', // @TODO: upravit, až bude HTTPS verze
        opacity: 0.6,
        code: 'H'
    });

    var lonviaCyclingOverlay = new L.TileLayer('http://tile.lonvia.de/cycling/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: osmAttr + ', <a href="http://cycling.lonvia.de">Lonvias Cycling</a>', // @TODO: upravit, až bude HTTPS verze
        opacity: 0.6,
        code: 'C'
    });


    baseLayers["Mapbox streets"] = mapbox;
    baseLayers["Turistická mapa"] = turisticka;
    baseLayers["OpenTopoMap"] = opentopomap;
    baseLayers["MTBMap.cz"] = mtb;
    baseLayers["OpenStreetMap Mapnik"] = osm;
    baseLayers["OpenCycleMap"] = ocm;
    baseLayers["Hikebikemap.org"] = hikebike;
    baseLayers["Vodovky"] = vodovky;
    baseLayers["Dopravní"] = dopravni;
    baseLayers["Dopravní öpnv"] = opnv;
    baseLayers["Méně popisků"] = menepopisku;
    baseLayers["Ortofoto ČÚZK"] = ortofoto;

    overlays["Ortofoto popisky"] = ortofotoOverlay;
    overlays["Turistické trasy ČR"] = turistikaOverlay;
    overlays["Vrstevnice ČR"] = vrstevniceOverlay;
    overlays["Zimní sporty"] = zimniOverlay;
    overlays["Turistické trasy EU"] = lonviaHikingOverlay;
    overlays["Cyklistické trasy EU"] = lonviaCyclingOverlay;


};
