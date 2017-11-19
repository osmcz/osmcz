/*
 guideposts for osmcz
 Javascript code for openstreetmap.cz website
 Copyright (C) 2015,2016

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.

and

 (c) 2016 osmcz-app, https://github.com/osmcz/osmcz

*/


/*
  This is platform for various notifications, notes, and other ways os sending stuff.
*/

var osmcz = osmcz || {};

osmcz.note = function () {

    osmcz.note.prototype.note_api = function (lat, lon, text) {
        var jqxhr = $.ajax({
            url: "https://api.openstreetmap.cz/table/notify",
            type: "post",
            data: {
                lat: lat,
                lon: lon,
                text: text
            },
        })
            .done(function (data) {
            })
            .fail(function () {
                alert("error");
            })
            .always(function () {
            });
    };

    osmcz.note.prototype.note_osm = function (lat, lon, text) {
        //osm notes nothing here yet
    }

};
