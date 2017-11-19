// (c) 2016 osmcz-app, https://github.com/osmcz/osmcz


function DMSToDD(degrees, minutes, seconds, direction, precision) {
    var dd = degrees + minutes / 60 + seconds / (60 * 60);
    dd = dd.toFixed(precision);

    if (direction == "S" || direction == "W") {
        dd = dd * -1;
    }

    return dd;
}

function DDToDMS(dd, precision, coorType, directionOnFront) {

    var deg = Math.abs(Math.trunc(dd));
    var minsec = (Math.abs(dd) - deg) * 60;
    var min = Math.trunc(minsec);
    var sec = (minsec - min) * 60;

    var dir;

    if (Math.sign(dd) == 1) {
        if (coorType == "lon") {
            dir = "E";
        } else {
            dir = "N";
        }
    } else {
        if (coorType == "lon") {
            dir = "W";
        } else {
            dir = "S";
        }
    }

    var dms;

    if (directionOnFront) {
        dms = dir + deg + "° " + min + "′ " + sec.toFixed(precision) + '"';
    } else {
        dms = deg + "° " + min + "′ " + sec.toFixed(precision) + '" ' + dir;
    }

    return dms;
}

function DDToDM(dd, precision, coorType, directionOnFront) {

    var deg = Math.abs(Math.trunc(dd));
    var minsec = (Math.abs(dd) - deg) * 60;

    var dir;

    if (Math.sign(dd) == 1) {
        if (coorType == "lon") {
            dir = "E";
        } else {
            dir = "N";
        }
    } else {
        if (coorType == "lon") {
            dir = "W";
        } else {
            dir = "S";
        }
    }

    var dm;

    if (directionOnFront) {
        dm = dir + deg + "° " + minsec.toFixed(precision);
    } else {
        dm = deg + "° " + minsec + dir.toFixed(precision);
    }

    return dm;
}
