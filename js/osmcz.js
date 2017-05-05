var OSMCZ_APP_VERSION = '0.18';

var osmcz = osmcz || {};
osmcz.production = ['openstreetmap.cz', 'osmap.cz', 'osm.localhost', 'devosm.zby.cz'].indexOf(location.hostname) !== -1;
osmcz.basePath = osmcz.production ? '/theme/' : '';
osmcz.fakeHttps = osmcz.production ? '/proxy.php/' : 'http://';
osmcz.user = false; //defined later in @layout.latte

var map, baseLayers = {}, overlays = {}, controls = {};
var marker = L.marker([0, 0]); // for linking: osmap.cz/?mlat=50.79&mlon=15.16&zoom=17
var guideposts, gpcheck;
var sidebar, poiSidebar, mapLayers;

initmap();

function initmap() {
    map = new L.Map('map', {zoomControl: false, condensedAttributionControl: false});

    L.control.condensedAttribution({
                emblem: '<div class="emblem-wrap glyphicon glyphicon-info-sign"></div>',
                prefix: "<a href='https://github.com/osmcz/osmcz' title='Projekt na Githubu'><img src='https://github.com/favicon.ico' width='10' style='margin-right:1ex'>osmcz-app</a> " + OSMCZ_APP_VERSION
              }).addTo(map);

    // -------------------- Sidebars --------------------
    osmcz.sidebar = sidebar = L.control.sidebar('sidebar', { position: 'left', autoPan: false }).addTo(map);

    osmcz.poiSidebar = poiSidebar = L.control.sidebar('poi-sidebar', { position: 'left', autoPan: false }).addTo(map);

    osmcz.layersSidebar = layersSidebar = L.control.sidebar('map-layers', { position: 'right', closeButton: true, autoPan: false }).addTo(map);


    // -------------------- map layers --------------------
    new osmcz.layers(map, baseLayers, overlays, controls);

    // -------------------- map controls --------------------
    new osmcz.controls(map, baseLayers, overlays, layersSidebar, controls);

    // Restore previous state or expand base group by default
    if (Cookies.get("_ls_expanded_groups")) {
        controls.layers.expandGroup();
    } else {
        controls.layers.expandGroup("Základní");
    }

    // -------------------- modules --------------------
    note = new osmcz.note();
    guideposts = new osmcz.guideposts(map, baseLayers, overlays, controls, "Turistické");
    gpcheck = new osmcz.gpcheck(map, baseLayers, overlays, controls, "Speciální");
    new osmcz.poiPopup(map);

    // -------------------- map state --------------------

    // set location from hash OR remembered cookie OR default home
    OSM.home = {lat: 49.8, lon: 15.44, zoom: 8};
    var params = OSM.mapParams();

    // When no layer parameter set,
    // use stored layers from location Hash cookie (if available)
    if (!params.layers && Cookies.get('_osm_location')) {
        params.layers = (Cookies.get('_osm_location')).split('|')[3];
    }

    // If no base layer in layers parameter,
    // use the stored base layer from location Hash cookie (if available)
    if (params.layers && !params.layers.match(/[a-z]/) && Cookies.get('_osm_location')) {
        params.layers += (Cookies.get('_osm_location')).split('|')[3].match(/[a-z]/);
    }

    updateLayersFromCode(params.layers);  //default layer without code
    if (params.bounds) {
        map.fitBounds(params.bounds);
    } else {
        map.setView([params.lat, params.lon], params.zoom);
    }
    if (params.marker) {
        marker.setLatLng([params.mlat, params.mlon]).addTo(map);
    }
    if (params.object)
        osmcz.poiPopup.load(params.object);

    // load osm object by URL osmap.cz/node/123
    var loadObject = /^\/(node|way|relation)\/(\d+)$/.exec(location.pathname);
    if (loadObject)
        osmcz.poiPopup.load({type: loadObject[1], id: loadObject[2]});

    // update on hash change
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

    // remember last location in hash AND cookie
    map.on('moveend zoomend layeradd layerremove', function () {
        lastHash = OSM.formatHash(map);
        location.hash = lastHash;
        Cookies.set("_osm_location", OSM.locationCookie(map), {expires: 31});
    });


    // when baselayer out of max zoom - zoom it correctly
    map.on("baselayerchange", function (e) {
        if (map.getZoom() > e.layer.options.maxZoom) {
            map.setView(map.getCenter(), e.layer.options.maxZoom, {reset: true});
        }
    });

    // -------------------- home-splash-screen or text-content splash --------------------
    var container = $('#main .container');

    var addHandlersToRestorePage = function () {
        var activeMenu = $('nav .active').removeClass('active');
        var restorePage = function (event) {
            event.preventDefault();
            map.scrollWheelZoom.disable();
            container.slideDown();
            $('#page-restore-button').fadeOut('slow');
            activeMenu.addClass('active').off('click.fader');
        };

        activeMenu.on('click.fader', restorePage);
        $('#page-restore-button').on('click', restorePage).fadeIn('slow');
    };

    var closeSplash = function () {
        map.scrollWheelZoom.enable();
        container.slideUp();
        addHandlersToRestorePage();
        if (location.pathname == '/splash') history.pushState({}, "", "/");
    };

    // hide splash on map-click or map-move or layers-shown
    map.on('click movestart', closeSplash);
    osmcz.layersSidebar.on('show', function(){ container.toggleClass("layersSidebar-shown", true); closeSplash(); });
    osmcz.layersSidebar.on('hide', function(){ container.toggleClass("layersSidebar-shown", false); });

    map.scrollWheelZoom.disable(); // text-content splash is opened by default = disable scroll-zoom

    if (container.hasClass('splash')) { //home-splash-screen is loaded with display:none
        $('.close-overlay').click(closeSplash);
        container.click(function (event) {
            if (event.target.parentNode == this) //<div.row> children in <.container>
                setTimeout(closeSplash, 200);
        });

        // skrytí overlay
        if (!Cookies.get('overlayShown') || location.pathname == '/splash') {
            container.show();
            Cookies.set('overlayShown', 'yes', {expires: 7}); // expires in 7 days
        }
        else {
            map.scrollWheelZoom.enable();
            addHandlersToRestorePage();
            $('nav .active').removeClass('active');
            $('#page-restore-button').show();
        }
    }

}

// set layers from coded string
function updateLayersFromCode(codedString) {
    var setLayer = function (key, layer) {
        if (layer == null) {
            return;
        }
        for (var pos in codedString) {
            if (layer.options && layer.options.code == codedString[pos])
                map.addLayer(layer);
        }

        // blank code or having only UPPERCASE = overlays --> display default layer
        if ((!codedString || !codedString.match(/[a-z]/)) && layer.options && layer.options.osmczDefaultLayer)
            map.addLayer(layer);
    };

    var group, layer;

    for (group in baseLayers){
        for(layer in baseLayers[group]) {
            setLayer(layer, baseLayers[group][layer]);
        }
    }

    for (group in overlays){
        for(layer in overlays[group]) {
            setLayer(layer, overlays[group][layer]);
        }
    }
}
