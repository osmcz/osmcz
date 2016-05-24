function note(lat, lon, text) {

    this.lat = lat;
    this.lon = lon;
    this.note = note;

    this.send = function() {
        var jqxhr = $.ajax({
                url: "http://map.openstreetmap.cz/upload.php", // @TODO: upravit, až bude HTTPS verze
                type: "post", //send it through get method
                data: {
                    lat: this.lat,
                    lon: this.lon,
                    text: "nazdar"
                },
            })
            .done(function(data) {
                alert("success " + data);
            })
            .fail(function() {
                alert("error");
            })
            .always(function() {});
    }

}
