// (c) 2016 osmcz-app, https://github.com/osmcz/osmcz

var osmcz = osmcz || {};
osmcz.layers = function (map, baseLayers, overlays, controls) {
    // -- constructor --

    var devicePixelRatio = window.devicePixelRatio || 1,
        retinaSuffix = devicePixelRatio >= 2 ? '@2x' : '';
    var osmAttr = '&copy; <a href="https://openstreetmap.org/copyright">OSM</a>'; //abbrevation not recommended on other websites

    var thunderforestAPIkey = '00291b657a5d4c91bbacb0ff096e2c25';
    var mapboxAPIkey = "pk.eyJ1IjoiemJ5Y3oiLCJhIjoiY2owa3hrYjF3MDAwejMzbGM4aDNybnhtdyJ9.8CIw6X6Jvmk2GwCE8Zx8SA";


    var mapbox = L.tileLayer('https://{s}.tiles.mapbox.com/v4/mapbox.streets-basic/{z}/{x}/{y}' + retinaSuffix + '.png?access_token=' + mapboxAPIkey, {
        maxZoom: 24,
        attribution: osmAttr + ", <a href='https://www.mapbox.com/about/maps/'>Mapbox</a>",
        code: 'x',
        osmczDefaultLayer: true,
        basic: true
    });

    var turisticka = L.tileLayer("https://tile.poloha.net/{z}/{x}/{y}.png", {
        maxZoom: 20,
        attribution: osmAttr + ', <a href="http://www.poloha.net">poloha.net</a>',
        code: 'k'
    });

    var opentopomap = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
        maxZoom: 17,
        attribution: osmAttr + ', <a href="https://opentopomap.org/">OpenTopoMap</a>',
        code: 'u'
    });

    var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: osmAttr,
        code: 'd',
        basic: true
    });

    var wikimediamap = L.tileLayer("https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}" + retinaSuffix + ".png", {
        maxZoom: 18,
        attribution: osmAttr + ', <a href="https://www.mediawiki.org/wiki/Maps">Wikimedia</a>',
        code: 'w'
    });

    var ocm = L.tileLayer("https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}" + retinaSuffix + ".png?apikey=" + thunderforestAPIkey, {
        maxZoom: 22,
        attribution: osmAttr + ', <a href="https://opencyclemap.org">OpenCycleMap</a>',
        code: 'c',
        basic: true
    });

    var thunderoutdoor = L.tileLayer("https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}" + retinaSuffix + ".png?apikey=" + thunderforestAPIkey, {
        maxZoom: 22,
        attribution: osmAttr + ', <a href="https://www.thunderforest.com/maps/outdoors/">Thunderforest</a>',
        code: 'f'
    });


    var hikebike = L.tileLayer(osmcz.fakeHttps + "{s}.tiles.wmflabs.org/hikebike/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: osmAttr + ', <a href="http://www.hikebikemap.org">Hike &amp; Bike Map</a>',
        code: 'h'
    });

    var mtb = L.tileLayer(osmcz.fakeHttps + "tile.mtbmap.cz/mtbmap_tiles/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: osmAttr + ', <a href="http://www.mtbmap.cz">mtbmap.cz</a>',
        code: 'm',
        basic: true
    });

    var vodovky = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg', {
        attribution: '&copy; CC-BY-SA <a href="https://openstreetmap.org/copyright">OSM</a>, imagery <a href="http://maps.stamen.com">Stamen Design</a>',
        maxZoom: 18,
        code: 's'
    });

    var toner = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', {
        attribution: '&copy; CC-BY-SA <a href="https://openstreetmap.org/copyright">OSM</a>, imagery <a href="http://maps.stamen.com">Stamen Design</a>',
        maxZoom: 18,
        code: 'n'
    });

    var dopravni = L.tileLayer("https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}" + retinaSuffix + ".png?apikey=" + thunderforestAPIkey, {
        maxZoom: 22,
        attribution: osmAttr + ', <a href="https://www.thunderforest.com/maps/transport/">Thunderforest</a>',
        code: 't',
        basic: true
    });

    var opnv = L.tileLayer("https://tileserver.memomaps.de/tilegen/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: osmAttr + ', <a href="https://www.öpnvkarte.de/">öpnvkarte</a>',
        code: 'ö'
    });

    var menepopisku = L.tileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}" + retinaSuffix + ".png", {
        maxZoom: 24, //umi az 30 a mozna i vic
        attribution: osmAttr + ', <a href="https://carto.com/attributions">CARTO</a>',
        code: 'b'
    });

    var ortofoto = L.tileLayer.wms('https://geoportal.cuzk.cz/WMS_ORTOFOTO_PUB/service.svc/get', {
        layers: 'GR_ORTFOTORGB',
        format: 'image/jpeg',
        transparent: false,
        crs: L.CRS.EPSG4326,
        minZoom: 7,
        maxZoom: 22,
        attribution: '&copy; <a href="http://www.cuzk.cz">ČÚZK</a>',
        code: 'o',
        basic: true
    });

    var metropolis = L.tileLayer("https://api.mapbox.com/styles/v1/severak/cinr478gg00aucam0o6lran4v/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2V2ZXJhayIsImEiOiJjaXQxenM2ZTEwMGIyMnRwZGMwZzF6Y2VsIn0.-uZbcCAI3ABqnbg6h1mrhQ", {
        maxZoom: 24,
        attribution: osmAttr + ', <a href=\'https://www.mapbox.com/about/maps/\'>Mapbox</a>, <a href=\'http://severak.svita.cz\'>Severák</a>',
        code: 'r'
    });

    var spinal = L.tileLayer("https://{s}.tile.thunderforest.com/spinal-map/{z}/{x}/{y}" + retinaSuffix + ".png?apikey=" + thunderforestAPIkey, {
        maxZoom: 22,
        attribution: osmAttr + ', <a href="https://www.thunderforest.com/maps/spinal-map/">Thunderforest</a>',
        code: 'a'
    });

    var pioneer = L.tileLayer("https://{s}.tile.thunderforest.com/pioneer/{z}/{x}/{y}" + retinaSuffix + ".png?apikey=" + thunderforestAPIkey, {
        maxZoom: 22,
        attribution: osmAttr + ', <a href="https://www.thunderforest.com/maps/pioneer/">Thunderforest</a>',
        code: 'p'
    });

    // automatically add/remove orotofotoOverlay
    map.on('baselayerchange', function (event) {
        if (event.layer == ortofoto || event.layer == vodovky) {
            setTimeout(function () {  // needs timeout or doesn't work
                if (!map.hasLayer(ortofotoOverlay)) {
                    map.addLayer(ortofotoOverlay);
                }

                if (event.layer == ortofoto) {
                    vrstevniceOverlay.setUrl(vrstevniceOverlayOrtoUrl);
                    katastralniMapaOverlay.setParams({layers: katastralniMapaOverlayLayersOrto}, true);
                } else {
                    vrstevniceOverlay.setUrl(vrstevniceOverlayUrl);
                    katastralniMapaOverlay.setParams({layers: katastralniMapaOverlayLayers}, true);
                }
                vrstevniceOverlay.redraw();
                katastralniMapaOverlay.redraw();
            }, 300);
        } else {
            setTimeout(function () {  // needs timeout or doesn't work
                if (map.hasLayer(ortofotoOverlay)) {
                    map.removeLayer(ortofotoOverlay);
                }
                vrstevniceOverlay.setUrl(vrstevniceOverlayUrl);
                vrstevniceOverlay.redraw();

                katastralniMapaOverlay.setParams({layers: katastralniMapaOverlayLayers}, true);
                katastralniMapaOverlay.redraw();
            }, 300);
        }
    });


    // --- overlays

    var turistikaOverlay = L.tileLayer("https://tile.poloha.net/kct/{z}/{x}/{y}.png", {
        maxZoom: 20,
        attribution: osmAttr + ', <a href="http://www.poloha.net">poloha.net</a>',
        opacity: 0.6,
        code: 'K',
        basic: true
    });

    var ortofotoOverlay = L.tileLayer("https://{s}.tiles.mapbox.com/v4/zbycz.e9b65202/{z}/{x}/{y}" + retinaSuffix + ".png?access_token=" + mapboxAPIkey, {
        maxZoom: 24,
        attribution: osmAttr + ", <a href='https://www.mapbox.com/about/maps/'>Mapbox</a>",
        opacity: 1,
        code: 'O'
    });

    var vrstevniceOverlayUrl = "https://tile.poloha.net/contours/{z}/{x}/{y}.png";
    var vrstevniceOverlayOrtoUrl = "https://tile.poloha.net/contours_ortofoto/{z}/{x}/{y}.png";
    var vrstevniceOverlay = L.tileLayer(vrstevniceOverlayUrl, {
        maxZoom: 20,
        attribution: osmAttr + ', <a href="http://www.poloha.net">poloha.net</a>',
        opacity: 0.6,
        code: 'V'
    });

    var zimniOverlay = L.tileLayer("https://www.opensnowmap.org/tiles-pistes/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: osmAttr + ', <a href="http://www.opensnowmap.org">opensnowmap.org</a>',
        code: 'Z',
        basic: true
    });

    var lonviaHikingOverlay = L.tileLayer('https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: osmAttr + ', <a href="http://hiking.lonvia.de">Lonvias Hiking</a>',
        opacity: 0.6,
        code: 'H'
    });

    var lonviaCyclingOverlay = L.tileLayer('https://tile.waymarkedtrails.org/cycling/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: osmAttr + ', <a href="http://cycling.lonvia.de">Lonvias Cycling</a>',
        opacity: 0.6,
        code: 'C',
        basic: true
    });

    var katastralniMapaOverlayLayers = 'parcelni_cisla,obrazy_parcel,RST_KMD,hranice_parcel,DEF_BUDOVY,RST_KN,dalsi_p_mapy,prehledka_kat_prac,prehledka_kat_uz,prehledka_kraju-linie',
        katastralniMapaOverlayLayersOrto = 'parcelni_cisla_i,obrazy_parcel_i,RST_KMD_I,hranice_parcel_i,DEF_BUDOVY,RST_KN_I,dalsi_p_mapy_i,prehledka_kat_prac,prehledka_kat_uz,prehledka_kraju-linie';
    var katastralniMapaOverlay = L.tileLayer.wms('https://services.cuzk.cz/wms/wms.asp', {
        layers: katastralniMapaOverlayLayers,
        format: 'image/png',
        transparent: true,
        crs: L.CRS.EPSG3857,
        minZoom: 7,
        maxZoom: 22,
        attribution: '&copy; <a href="http://www.cuzk.cz">ČÚZK</a>',
        code: 'X'
    });

    var lpisOverlay = L.tileLayer.wms(osmcz.fakeHttps + 'eagri.cz/public/app/wms/plpis.fcgi', {
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

    var ruianParcelyOverlay = L.tileLayer(parcelyUrl, {
            minZoom: 12,
            maxZoom: 20,
            attribution: ruianAttr,
            code: '1'
        }),
        ruianUliceOverlay = L.tileLayer(uliceUrl, {
            minZoom: 12,
            maxZoom: 20,
            attribution: ruianAttr,
            code: '2'
        }),
        ruianBudovyOverlay = L.tileLayer(budovyUrl, {
            minZoom: 12,
            maxZoom: 20,
            attribution: ruianAttr,
            code: '3'
        }),
        ruianBudovyTodoOverlay = L.tileLayer(todobudovyUrl, {
            minZoom: 12,
            maxZoom: 20,
            attribution: ruianAttr,
            code: '4'
        }),
        ruianLanduseOverlay = L.tileLayer(landuseUrl, {
            minZoom: 12,
            maxZoom: 20,
            attribution: ruianAttr,
            code: '5'
        }),
        ruianAdresyOverlay = L.tileLayer(adresyUrl, {
            minZoom: 12,
            maxZoom: 20,
            attribution: ruianAttr,
            code: '6'
        });

    var powerOverlay = L.tileLayer('https://tiles-{s}.openinframap.org/power/{z}/{x}/{y}.png', {
        attribution: osmAttr + ', <a href="https://OpenInfraMap.org/about.html">OpenInfraMap.org</a>',
        code: 'W'
    });
    var commsOverlay = L.tileLayer('https://tiles-{s}.openinframap.org/telecoms/{z}/{x}/{y}.png', {
        attribution: osmAttr + ', <a href="https://OpenInfraMap.org/about.html">OpenInfraMap.org</a>',
        code: 'M'
    });


    // Base group
    baseLayers["Základní"] = {};
    baseLayers["Základní"]["Mapbox streets"] = mapbox;
    baseLayers["Základní"]["OpenStreetMap Mapnik"] = osm;
    baseLayers["Základní"]["OpenTopoMap"] = opentopomap;
    baseLayers["Základní"]["Metropolis"] = metropolis;
    baseLayers["Základní"]["Méně popisků"] = menepopisku;
    baseLayers["Základní"]["Wikimedia Map"] = wikimediamap;

    // Ortofoto group
    baseLayers["Letecké"] = {};
    baseLayers["Letecké"]["Ortofoto ČÚZK"] = ortofoto;

    overlays["Letecké"] = {};
    overlays["Letecké"]["Ortofoto popisky"] = ortofotoOverlay;

    // Information group
    baseLayers["Informace"] = {};
    overlays["Informace"] = {};
    overlays["Informace"]["Aktivní vrstva"] = new osmcz.activeLayer(map);
    overlays["Informace"]["OSM poznámky"] = new osmcz.osmNotesLayer();


    // Hiking group
    baseLayers["Turistické"] = {};
    baseLayers["Turistické"]["Turistická mapa (ČR)"] = turisticka;
    baseLayers["Turistické"]["Cyklo+turistická (EU)"] = mtb;
    baseLayers["Turistické"]["Hikebikemap.org"] = hikebike;

    overlays["Turistické"] = {};
    overlays["Turistické"]["Turistické trasy ČR"] = turistikaOverlay;
    overlays["Turistické"]["Turistické trasy EU"] = lonviaHikingOverlay;
    overlays["Turistické"]["Vrstevnice ČR"] = vrstevniceOverlay;

    // Sport group
    baseLayers["Sport"] = {};
    baseLayers["Sport"]["OpenCycleMap"] = ocm;

    overlays["Sport"] = {};
    overlays["Sport"]["Cyklistické trasy EU"] = lonviaCyclingOverlay;
    overlays["Sport"]["Zimní sporty"] = zimniOverlay;

    // Transport group
    baseLayers["Dopravní"] = {};
    baseLayers["Dopravní"]["Dopravní"] = dopravni;
    baseLayers["Dopravní"]["Dopravní öpnv"] = opnv;

    // Efects group
    baseLayers["Efektní"] = {};
    baseLayers["Efektní"]["Vodovky"] = vodovky;
    baseLayers["Efektní"]["Toner"] = toner;
    baseLayers["Efektní"]["Spinal"] = spinal;
    baseLayers["Efektní"]["Pioneer"] = pioneer;

    // Special group
    overlays["Speciální"] = {};
    overlays["Speciální"]["Katastrální mapa ČÚZK"] = katastralniMapaOverlay;
    overlays["Speciální"]["Vedení vysokého napětí"] = powerOverlay;
    overlays["Speciální"]["Telekomunikační vysílače"] = commsOverlay;
    overlays["Speciální"]["Pole a louky (pLPIS)"] = lpisOverlay;

    // RUIAN group
    overlays["RÚIAN"] = {};
    overlays["RÚIAN"]["Adresy"] = ruianAdresyOverlay;
    overlays["RÚIAN"]["Budovy"] = ruianBudovyOverlay;
    overlays["RÚIAN"]["Budovy TODO"] = ruianBudovyTodoOverlay;
    overlays["RÚIAN"]["Ulice"] = ruianUliceOverlay;
    overlays["RÚIAN"]["Parcely"] = ruianParcelyOverlay;
    overlays["RÚIAN"]["Landuse"] = ruianLanduseOverlay;

};
