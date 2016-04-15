// (c) 2016 osmcz-app, https://github.com/osmcz/osmcz


var osmcz = osmcz || {};
osmcz.openingHoursService = {};
osmcz.openingHoursService.getHtml = function (v) {
    var opening_hours = require('opening_hours');

    if (!v)
        return [];

    var oh = new opening_hours(v);

    // Truncate time values from given date. Set it to 00:00.0000
    function truncTime(v) {
        return new Date(v.getFullYear(), v.getMonth(), v.getDate(), 0, 0, 0, 0)
    }

    // Format given time as time string as HH:MI
    function formatTimeD(d) {
        return ("00" + d.getHours()).slice(-2) + ":" + ("00" + d.getMinutes()).slice(-2);
    }

    // Format given hour and minutes values as time string as HH:MI
    function formatTimeHM(h, m) {
        return ("00" + h).slice(-2) + ":" + ("00" + m).slice(-2);
    }

    // Shift to requested day forward or backward
    function shiftDay(d, i) {
        return (new Date((d).valueOf() + 1000 * 60 * 60 * 24 * i));
    }

    // Format date as YYYYMMDD
    function getFormatedDate(d) {
        return (d.getFullYear() + ("00" + (d.getMonth() + 1)).slice(-2) + ("00" + d.getDate()).slice(-2)).toString();
    }

    // Return day name. Normal (Mo,Tu...) or special day name like Today
    function getDayName(d) {
        var idxToday = "#" + getFormatedDate(new Date());
        var idxTomorrow = "#" + getFormatedDate(shiftDay((new Date()), 1));

        var days = ["Neděle", "Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota", "Neděle"];
        var specialDays = [];
        specialDays[idxToday] = "Dnes";
        specialDays[idxTomorrow] = "Zítra";

        idx = "#" + getFormatedDate(d);
        if (idx in specialDays)
            return specialDays[idx];

        var day = d.getDay();
        return days[day];
    }

    // Go through opening hours array and prepare oh times for each day
    function splitByDays(oh_array) {
        var ret = [];
        var lastDay = "";

        for (i = 0; i < oh_array.length; i++) {
            var from = oh_array[i][0];
            var to = oh_array[i][1];

            var formatedDayFrom = getFormatedDate(from);
            var formatedDayTo = getFormatedDate(to);
            var diffDays = Math.ceil((to - from) / 1000 / 60 / 60 / 24) // difference by days

            var idx = "#" + formatedDayFrom;

            if (!(idx in ret)) {
                ret[idx] = [];
            }

            if (formatedDayFrom == formatedDayTo) { // the same day
                ret[idx].push(formatTimeD(from) + '-' + formatTimeD(to).replace(/00:00/g, '24:00'));
            } else if (diffDays == 1) // over midnight
                ret[idx].push(formatTimeD(from) + '-' + formatTimeD(to).replace(/00:00/g, '24:00'));
            else { // over more days - 24/7
                var tFrom = new Date(from);
                var tTo = new Date(to);
                var idx = "#" + getFormatedDate(tFrom);

                ret[idx].push(formatTimeD(tFrom) + '-' + formatTimeHM(24, 0));

                while (formatedDayFrom != formatedDayTo) {
                    tFrom = shiftDay(tFrom, 1);
                    formatedDayFrom = getFormatedDate(tFrom);
                    idx = "#" + formatedDayFrom;
                    ret[idx] = [];
                    if (formatedDayFrom != formatedDayTo)
                        ret[idx].push(formatTimeHM(0, 0) + '-' + formatTimeHM(24, 0));
                    else
                        ret[idx].push(formatTimeHM(0, 0) + '-' + formatTimeD(to).replace(/00:00/g, '24:00'));
                }
            }
        }
        return ret;
    }

    // Return formated opening hours table
    function formatWeek(aOH, dFrom, nDays, bVisible) {
        var ret = [];

        var idxDay = new Date(dFrom);
        var formatedDayFrom = getFormatedDate(idxDay);
        var formatedDayTo = getFormatedDate(shiftDay(dFrom, nDays + 1));

        var idx = "#" + formatedDayFrom;

        var clVisible = "";
        if (!bVisible)
            clVisible = 'class="oh-extended" style="display:none"';

        while (formatedDayFrom != formatedDayTo) {
            ret.push('<tr ' + clVisible + '>');

            if (idx in aOH) {
                ret.push('<td><b>' + getDayName(idxDay) + '</b>: </td><td class="oh-times">' + aOH[idx].join(', ') + '</td></tr>');
            } else
                ret.push("<td><b>" + getDayName(idxDay) + '</b>: </td><td class="oh-times">' + "zavřeno" + "</td></tr>");

            idxDay = shiftDay(idxDay, 1);
            formatedDayFrom = getFormatedDate(idxDay);
            idx = "#" + formatedDayFrom;
        }
        return ret;
    }

    // === Start ===
    var now = new Date();
    var today = truncTime(now);
    var tomorrow = shiftDay(today, 1);
    var intervalStart = shiftDay(today, -1); // we will start on yesterday
    var intervalEnd = shiftDay(today, 10); // plus 10 days should be enough to show week correctly

    // get opening hours grouped by days
    var intervals = splitByDays(oh.getOpenIntervals(intervalStart, intervalEnd));

    // check current state: open, close, last hour
    var currentState = oh.getStateString();
    var nextChangeDate = oh.getNextChange();

    if (nextChangeDate)
        var diffChangeMin = Math.ceil((nextChangeDate - now) / 1000 / 60); // difference to next change of state in minutes
    else
        var diffChangeMin = -1;

    var ohStateFormated = "";
    var ohClass = "";

    switch (currentState) {
        case "open":
            if (diffChangeMin > 0 && diffChangeMin <= 60) {
                ohClass = "ohlasthour";
                ohStateFormated = "poslední hodina";
            } else {
                ohClass = "ohopen";
                ohStateFormated = "otevřeno";
            }
            break;
        case "close":
            ohClass = "ohclosed";
            ohStateFormated = "zavřeno";
            break;
        case "unknown":
            ohClass = "";
            ohStateFormated = "neznámo";
            break;
    }

    // Add toggler class handler
    // see: http://stackoverflow.com/questions/19797064/show-hide-table-rows-using-javascript-classes
    // TODO: fix it!
    $(".toggler").click(function (e) {
        e.preventDefault();
        console.log("toggler");
        $('.oh' + $(this).attr('data-oh')).show();
    });

    // prepare opening hours table
    var ret = [];
    ret.push('<h5 title="' + v + '">Otevírací hodiny');
    ret.push(' <span class="' + ohClass + '">');
    ret.push('(' + ohStateFormated + ')</span>');
    ret.push(' <a href="#" onclick="if ($(\'.oh-extended\').is(\':visible\')) {$(\'.oh-toggle\').html(\'&#9660;\');} else {$(\'.oh-toggle\').html(\'&#9650;\');} $(\'.oh-extended\').toggle(200); return false"><span class="oh-toggle">&#9660;</span></a></h5>');
    ret.push('<table>');
    ret = ret.concat(formatWeek(intervals, today, 1, true));
    ret = ret.concat(formatWeek(intervals, shiftDay(today, 2), 5, false));
    ret.push('</table>');
    return ret;
};

