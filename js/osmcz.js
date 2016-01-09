var map;

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

    map.setView(new L.LatLng(49.5, 17), 7);

    var layersControl = L.control.layers(baseLayers, overlays).addTo(map);
    L.control.scale().addTo(map);
    L.control.locate({
        follow: true,
        locateOptions: {maxZoom: 15}
    }).addTo(map);


    // skrytí obsahu při kliku / posunutí mapy
    var container = $('#main>div');
    var closeOverlay = function (){
        map.scrollWheelZoom.enable();
        container.fadeOut('slow');

        $('nav .active').removeClass('active').on('click.fader', function(){
            map.scrollWheelZoom.disable();
            container.fadeIn('slow');
            $(this).addClass('active').off('click.fader');
        });
    };
    map.on('click movestart', closeOverlay);
    $('.close-overlay').click(closeOverlay);
    container.click(function(event){
        if(event.target.parentNode == this) //div.row děti v .containeru
            closeOverlay();
    });

    map.scrollWheelZoom.disable();


    new rozcestniky(map, layersControl);
}

initmap();

