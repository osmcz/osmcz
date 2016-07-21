function note(lat, lon, text) {

    this.lat = lat;
    this.lon = lon;
    this.note = note;

    this.send = function() {
        var jqxhr = $.ajax({
                url: "https://api.openstreetmap.cz/table/notify",
                type: "post",
                data: {
                    lat: this.lat,
                    lon: this.lon,
                    text: this.text
                },
            })
            .done(function(data) {
            })
            .fail(function() {
                alert("error");
            })
            .always(function() {});
    }

}
