// (c) 2016 osmcz-app, https://github.com/osmcz/osmcz

var osmcz = osmcz || {};
osmcz.iconsService = {};


//maki icons base url  //https://cdn.rawgit.com/mapbox/maki/v0.5.0/renders/
osmcz.iconsService.baseUrl = 'https://cdn.rawgit.com/osmcz/maki/osmcz_v1/renders/';


//icon getter for specific tag set
osmcz.iconsService.get = function (tags) {
    var name = false;

    // match tags to icons.table
    for (var k in tags) {
        var v = tags[k];
        var row = osmcz.iconsService.table[k]; //indexed by tag key

        if (row && row[v])  //column by tag value
            name = row[v];

        else if (row && row['*'])
            name = row['*'];
    }


    var iconPath = 'circle-stroked-12';
    var size = [10, 10];

    //TODO refactor (and use regexps)

    var pc = name ? name.split('-') : 0;
    if (name && IsNumeric(pc[pc.length - 1])) {

        var icName = name.substring(0, name.length - pc[pc.length - 1].length);
        var icSize = parseInt(pc[pc.length - 1]);
        size = [icSize, icSize];

        if (icSize <= 12) {
            iconPath = icName + '12';
        } else if (icSize > 12 && icSize <= 18) {
            iconPath = icName + '18';
        } else {
            iconPath = icName + '24';
        }

    } else if (name && !IsNumeric(pc[pc.length - 1])) {
        iconPath = name + '-18';
        size = [18, 18];

    }

    // ----- helper function
    function IsNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    return L.icon({
        iconUrl: osmcz.iconsService.baseUrl + iconPath + '.png',
        iconRetinaUrl: osmcz.iconsService.baseUrl + iconPath + '@2x.png',
        iconSize: size,
        popupAnchor: [0, -9]
    });

};

//The later - the more priority https://www.mapbox.com/maki/
osmcz.iconsService.table = {
    amenity: {
        restaurant: 'restaurant',
        fuel: 'fuel',
        toilets: 'toilets',
        telephone: 'telephone',
        fast_food: 'fast-food',
        bank: 'bank',
        atm: 'bank',
        waste_disposal: 'waste-basket',
        pub: 'beer',
        post_office: 'post',
        post_box: 'post',
        pharmacy: 'hospital',
        doctors: 'hospital',
        bar: 'bar',
        cafe: 'cafe',
        car_rental: 'car',
        school: 'school',
        college: 'college',
        bicycle_parking: 'bicycle',
        university: 'college',
        library: 'library',
        theatre: 'theatre',
        public_building: 'town-hall',
        townhall: 'town-hall',
        police: 'police',
        cinema: 'cinema',
        parking: 'parking',
        prison: 'prison',
    },
    highway: {
        bus_stop: 'bus'
    },
    railway: {
        station: 'rail-24',
        halt: 'rail-24',
        tram_stop: 'rail-light'
    },
    shop: {
        '*': 'shop',
        chemist: 'pharmacy',
        grocery: 'grocery',
        supermarket: 'grocery',
        convenience: 'grocery'
    },
    station: {
        subway: 'rail-metro'
    },
    tourism: {
        guest_house: 'lodging',
        hostel: 'lodging',
        hotel: 'lodging',
        museum: 'museum',
        attraction: 'star-stroked',
        zoo: 'zoo'
    },
    historic: {
        monument: 'monument',
        memorial: 'monument',
        wayside_cross: 'religious-christian'
    },
    religion: {
      christian: 'religious-christian',
      jewish: 'religious-jewish',
      muslim: 'religious-muslim',
    },
    man_made: {
        surveillance: 'camera'
    },
    place: {
        city: 'square-18',
        town: 'square-stroked-16',
        village: 'circle-8'
    },
    information: {
        guidepost: 'guidepost',
//         board: 'board'
    },
    sport: {
        '*': 'pitch',
        swimming: 'swimming',
        football: 'soccer',
        soccer: 'soccer',
        tennis: 'tennis',
        basketball: 'basketball',
        golf: 'golf',
    },
    leisure: {
        playground: 'playground',
        miniature_golf: 'golf',
        swimming_pool: 'swimming',
    },
    landuse: {
        cemetery: 'cemetery'
    },
    natural: {
        peak: 'triangle'
    }
};



