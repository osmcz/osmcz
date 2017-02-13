// (c) 2016 osmcz-app, https://github.com/osmcz/osmcz

var osmcz = osmcz || {};
osmcz.layers = function (map, baseLayers, baseOverlays, extraOverlays, controls) {
    // -- constructor --

    var devicePixelRatio = window.devicePixelRatio || 1,
        retinaSuffix = devicePixelRatio >= 2 ? '@2x' : '';
    var osmAttr = '&copy; <a href="https://openstreetmap.org/copyright">OSM</a>'; //abbrevation not recommended on other websites


    var mapbox = L.tileLayer('https://{s}.tiles.mapbox.com/v4/mapbox.streets-basic/{z}/{x}/{y}' + retinaSuffix + '.png?access_token=pk.eyJ1IjoiemJ5Y3oiLCJhIjoiRUdkVEMzMCJ9.7eJ3YhCQtbVUET92En5aGA', {
        attribution: osmAttr + ", <a href='https://www.mapbox.com/about/maps/'>Mapbox</a>",
        code: 'x',
        osmczDefaultLayer: true
    });

    var turisticka = L.tileLayer("https://tile.poloha.net/{z}/{x}/{y}.png", {
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

    var ocm = L.tileLayer(osmcz.fakeHttps + "{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: osmAttr + ', <a href="http://opencyclemap.org">OpenCycleMap</a>', // @TODO: upravit, až bude HTTPS verze
        code: 'c'
    });

    var hikebike = L.tileLayer(osmcz.fakeHttps + "{s}.tiles.wmflabs.org/hikebike/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: osmAttr + ', <a href="http://www.hikebikemap.org">Hike &amp; Bike Map</a>', // @TODO: upravit, až bude HTTPS verze
        code: 'h'
    });

    var mtb = L.tileLayer(osmcz.fakeHttps + "tile.mtbmap.cz/mtbmap_tiles/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: osmAttr + ', <a href="http://www.mtbmap.cz">mtbmap.cz</a>', // @TODO: upravit, až bude HTTPS verze
        code: 'm'
    });

    var vodovky = L.tileLayer(osmcz.fakeHttps + '{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg', {
        attribution: '&copy; CC-BY-SA <a href="https://openstreetmap.org/copyright">OSM</a>, imagery <a href="http://maps.stamen.com">Stamen Design</a>',
        maxZoom: 18,
        code: 's'
    });

    var dopravni = L.tileLayer("https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}" + retinaSuffix + ".png", {
        maxZoom: 18,
        attribution: osmAttr + ', <a href="http://www.thunderforest.com/maps/transport/">Thunderforest</a>',
        code: 't'
    });

    var opnv = L.tileLayer("https://tileserver.memomaps.de/tilegen/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: osmAttr + ', <a href="http://www.öpnvkarte.de/">öpnvkarte</a>', // @TODO: upravit, až bude HTTPS verze
        code: 'ö'
    });

    var menepopisku = L.tileLayer(osmcz.fakeHttps + "{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}" + retinaSuffix + ".png", {
        maxZoom: 18,
        attribution: osmAttr + ', <a href="https://cartodb.com/attributions#basemaps">CartoDB</a>',
        code: 'b'
    });

    var ortofoto = L.tileLayer.wms('https://geoportal.cuzk.cz/WMS_ORTOFOTO_PUB/service.svc/get', {
        layers: 'GR_ORTFOTORGB',
        format: 'image/jpeg',
        transparent: false,
        crs: L.CRS.EPSG4326,
        minZoom: 7,
        maxZoom: 22,
        attribution: '&copy; <a href="http://www.cuzk.cz">ČÚZK</a>', // @TODO: upravit, až bude HTTPS verze
        code: 'o'
    });

    var metropolis = L.tileLayer("https://api.mapbox.com/styles/v1/severak/cinr478gg00aucam0o6lran4v/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2V2ZXJhayIsImEiOiJjaXQxenM2ZTEwMGIyMnRwZGMwZzF6Y2VsIn0.-uZbcCAI3ABqnbg6h1mrhQ", {
        maxZoom: 18,
        attribution: osmAttr + ', <a href=\'https://www.mapbox.com/about/maps/\'>Mapbox</a>, <a href=\'http://severak.svita.cz\'>Severák</a>',
        code: 'b'
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


    var turistikaOverlay = L.tileLayer("https://tile.poloha.net/kct/{z}/{x}/{y}.png", {
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

    var vrstevniceOverlayUrl = "https://tile.poloha.net/contours/{z}/{x}/{y}.png";
    var vrstevniceOverlayOrtoUrl = "https://tile.poloha.net/contours_ortofoto/{z}/{x}/{y}.png";
    var vrstevniceOverlay = L.tileLayer(vrstevniceOverlayUrl, {
        maxZoom: 20,
        attribution: osmAttr + ', <a href="http://www.poloha.net">poloha.net</a>', // @TODO: upravit, až bude HTTPS verze
        opacity: 0.6,
        code: 'V'
    });

//     var zimniOverlay = L.tileLayer(osmcz.fakeHttps + "www.opensnowmap.org/opensnowmap-overlay/{z}/{x}/{y}.png", {
//         maxZoom: 18,
//         attribution: osmAttr + ', <a href="http://www.opensnowmap.org">opensnowmap.org</a>', // @TODO: upravit, až bude HTTPS verze
//         code: 'Z'
//     });
    var zimniOverlay = L.tileLayer("https://www.opensnowmap.org/tiles-pistes/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: osmAttr + ', <a href="http://www.opensnowmap.org">opensnowmap.org</a>',
        code: 'Z'
    });

    var lonviaHikingOverlay = new L.tileLayer('https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: osmAttr + ', <a href="http://hiking.lonvia.de">Lonvias Hiking</a>',
        opacity: 0.6,
        code: 'H'
    });

    var lonviaCyclingOverlay = new L.tileLayer('https://tile.waymarkedtrails.org/cycling/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: osmAttr + ', <a href="http://cycling.lonvia.de">Lonvias Cycling</a>',
        opacity: 0.6,
        code: 'C'
    });

    var katastralniMapaOverlay = new L.tileLayer.wms('https://services.cuzk.cz/wms/wms.asp', {
//         layers: 'DEF_PARCELY,DEF_BUDOVY,RST_PK_I,RST_KMD_I,dalsi_p_mapy_i,obrazy_parcel_i,parcelni_cisla_i,hranice_parcel_barevne,omp_i',
        layers: 'parcelni_cisla_i,obrazy_parcel_i,RST_KMD_I,hranice_parcel_i,DEF_BUDOVY,RST_KN_I,dalsi_p_mapy_i,prehledka_kat_prac,prehledka_kat_uz,prehledka_kraju-linie',
        format: 'image/png',
        transparent: true,
        crs: L.CRS.EPSG3857,
        minZoom: 7,
        maxZoom: 22,
        attribution: '&copy; <a href="http://www.cuzk.cz">ČÚZK</a>', // @TODO: upravit, až bude HTTPS verze
        code: 'X'
    });

    var lpisOverlay = L.tileLayer.wms('http://eagri.cz/public/app/wms/plpis.fcgi', {
        layers: 'LPIS_FB4,LPIS_FB4_KOD',
        format: 'image/png',
        transparent: true,
        crs: L.CRS.EPSG4326,
        attribution: " <a href='http://www.eagri.cz.cz'>eagri.cz</a>",
        code: 'L'
    });

    // Poloha.net - RUIAN layers
    var parcelyUrl = 'https://tile.poloha.net/parcely/{z}/{x}/{y}.png',
        uliceUrl = 'https://tile.poloha.net/ulice/{z}/{x}/{y}.png',
        budovyUrl = 'https://tile.poloha.net/budovy/{z}/{x}/{y}.png',
        todobudovyUrl = 'https://tile.poloha.net/budovy-todo/{z}/{x}/{y}.png',
        landuseUrl = 'https://tile.poloha.net/landuse/{z}/{x}/{y}.png',
        adresyUrl = 'https://tile.poloha.net/adresy/{z}/{x}/{y}.png';

    var ruianAttr = '&copy; <a href="http://www.cuzk.cz">ČÚZK</a> (<a href="https://www.poloha.net">poloha.net</a>)';

    var ruianParcelyOverlay = new L.tileLayer(parcelyUrl, {minZoom: 12, maxZoom: 20, attribution: ruianAttr, code: '1'}),
        ruianUliceOverlay = new L.tileLayer(uliceUrl, {minZoom: 12, maxZoom: 20, attribution: ruianAttr, code: '2'}),
        ruianBudovyOverlay = new L.tileLayer(budovyUrl, {minZoom: 12, maxZoom: 20, attribution: ruianAttr, code: '3'}),
        ruianBudovyTodoOverlay = new L.tileLayer(todobudovyUrl, {minZoom: 12, maxZoom: 20, attribution: ruianAttr, code: '4'}),
        ruianLanduseOverlay = new L.tileLayer(landuseUrl, {minZoom: 12, maxZoom: 20, attribution: ruianAttr, code: '5'}),
        ruianAdresyOverlay = new L.tileLayer(adresyUrl, {minZoom: 12, maxZoom: 20, attribution: ruianAttr, code: '6'});

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
    baseLayers["Metropolis"] = metropolis;

    baseOverlays["Ortofoto popisky"] = ortofotoOverlay;
    baseOverlays["Turistické trasy ČR"] = turistikaOverlay;
    baseOverlays["Vrstevnice ČR"] = vrstevniceOverlay;
    baseOverlays["Zimní sporty"] = zimniOverlay;
    baseOverlays["Turistické trasy EU"] = lonviaHikingOverlay;
    baseOverlays["Cyklistické trasy EU"] = lonviaCyclingOverlay;

    extraOverlays["Katastrální mapa ČÚZK"] = katastralniMapaOverlay;
    extraOverlays["pLPIS"] = lpisOverlay;

    extraOverlays["RUIAN: adresy"] = ruianAdresyOverlay;
    extraOverlays["RUIAN: budovy"] = ruianBudovyOverlay;
    extraOverlays["RUIAN: budovy TODO"] = ruianBudovyTodoOverlay;
    extraOverlays["RUIAN: ulice"] = ruianUliceOverlay;
    extraOverlays["RUIAN: parcely"] = ruianParcelyOverlay;
    extraOverlays["RUIAN: landuse"] = ruianLanduseOverlay;


};
