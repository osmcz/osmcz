// from https://github.com/osmlab/leaflet-osm-notes/tree/3fa2138133724e4cf5816e7fa7ece9da6fafc135

var osmcz = osmcz || {};
osmcz.osmNotesLayer = L.LayerGroup.extend({

    API: 'https://api.openstreetmap.org/api/0.6/notes.json?closed=3&bbox=',

    options: {code: 'N'},

    _loadedIds: {},

    onAdd: function (map) {
        this._map = map;
        this._loadSuccess = L.bind(loadSuccess, this);
        this._pointToLayer = L.bind(pointToLayer, this);
        this.notesLayer = L.geoJson({
            type: 'FeatureCollection',
            features: []
        }, {pointToLayer: this._pointToLayer}).addTo(this);

        map
            .on('viewreset', this._load, this)
            .on('moveend', this._load, this);

        this._load();

        function pointToLayer(p) {
            return L.marker([
                p.geometry.coordinates[1],
                p.geometry.coordinates[0]
            ], {
                icon: this._icon(p.properties)
            }).bindPopup('<h1>' + p.properties.title + '</h1>' +
                '<div>' + p.properties.description + '</div>');
        }

        function loadSuccess(resp) {
            for (var i = 0; i < resp.features.length; i++) {
                if (!this._loadedIds[resp.features[i].properties.id]) {
                    resp.features[i].properties =
                        this._template(resp.features[i].properties);
                    this._loadedIds[resp.features[i].properties.id] = true;
                    this.notesLayer.addData(resp.features[i]);
                }
            }
        }
    },

    onRemove: function (map) {
        L.LayerGroup.prototype.onRemove.call(this, map); //parent

        map
            .off('viewreset', this._load, this)
            .off('moveend', this._load, this);
    },

    _icon: function (fp) {
        fp = fp || {};

        var sizes = {
                small: [20, 50],
                medium: [30, 70],
                large: [35, 90]
            },
            size = fp['marker-size'] || 'medium',
            symbol = (fp['marker-symbol']) ? '-' + fp['marker-symbol'] : '',
            color = (fp['marker-color'] || '7e7e7e').replace('#', '');

        return L.icon({
            iconUrl: 'http://a.tiles.mapbox.com/v3/marker/' +
            'pin-' + size.charAt(0) + symbol + '+' + color +
            // detect and use retina markers, which are x2 resolution
            ((L.Browser.retina) ? '@2x' : '') + '.png',
            iconSize: sizes[size],
            iconAnchor: [sizes[size][0] / 2, sizes[size][1] / 2],
            popupAnchor: [0, -sizes[size][1] / 2]
        });
    },

    _template: function (p) {
        p['marker-color'] = {closed: '95c055', open: 'ca3029'}[p.status];
        p['marker-symbol'] = {closed: 'circle-stroked', open: 'cross'}[p.status];

        p.title = (p.status == 'closed' ? 'Vyřešená poznámka' : 'Poznámka') + ' <a href="http://www.openstreetmap.org/browse/note/' + p.id + '">#' + p.id + '</a>';
        p.description = '';

        for (var i = 0; i < p.comments.length; i++) {
            var user_link = p.comments[i].user ? ('<a target="_blank" href="' + p.comments[i].user_url + '">' + p.comments[i].user + '</a>') : 'Anonymous';
            p.description += '<div class="comment-meta">' + user_link + ' - ' + p.comments[i].date + '</div>';
            p.description += '<div class="comment-text">' + p.comments[i].html + '</div>';
        }

        return p;
    },

    _load: function (map) {
        function boundsString(map) {
            var sw = map.getBounds().getSouthWest(),
                ne = map.getBounds().getNorthEast();
            return [sw.lng, sw.lat, ne.lng, ne.lat];
        }

        $.ajax({
            url: this.API + boundsString(this._map),
            dataType: 'json',
            success: this._loadSuccess,
            error: function () {
            }
        });
    }
});
