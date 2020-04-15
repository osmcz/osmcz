// (c) 2017 osmcz-app, https://github.com/osmcz/osmcz

L.Control.PoiFilter = L.Control.extend({

    options: {
        anchor: [250, 250],
        position: 'topright',
    },

    initialize: function (options) {
        L.setOptions(this, options);
        this._precision = 5;
        this._menuOptions;

        this._menuOptions = {
            groups: [
            {title: 'Fody',
             callback: function() {console.log('Fody callback')},
             items: [{code: 'gp',
                      name: 'Rozcestníky'
                    },
                     {code: 'info',
                      name: 'Informační tabule'
                    },
                     {code: 'bz',
                      name: 'Body záchrany'
                    }
                    ]
            },
            {title: 'Kontroly OsmHiCheck',
             callback: function() {console.log('OsmHiCheck callback')},
             items: [{code: 'gp',
                      name: 'Rozcestníky'
                    },
                     {code: 'info',
                      name: 'Informační tabule'
                    },
                     {code: 'bz',
                      name: 'Body záchrany'
                    }
                    ]
            },
            ]
        };
    },

    onAdd: function (map) {
        this._createButton();
        this._map = map;

        return this._container;
    },

    destroy: function () {
        if (!this._map) {
            return this;
        }

        this.removeFrom(this._map);

        if (this.onRemove) {
            this.onRemove(this._map);
        }
        return this;
    },

    getElement: function () {
        return this._container;
    },

    openSidebar: function (ref, name) {

        if (osmcz.poiFilterSidebar.isVisible()) {
            return false;
        }

//         this._showForm(ref, name);

    },

    _createButton: function () {
        var className = 'leaflet-control-poiFilterbtn',
            container = this._container = L.DomUtil.create('div', className);

        var content = [];
        content.push('<a href="#" class="leaflet-control-poiFilterbtn-text"><i class="fas fa-filter"></i></a>');
        container.innerHTML = content.join(" ");

        L.DomEvent.on(container, 'click', this._openSidebar, this);
    },

    _openSidebar: function (e) {

        e.stopPropagation();

        if (osmcz.poiFilterSidebar.isVisible()) {
            return false;
        }

        this._showForm('', '');

    },

    _prepareLayout: function () {
        var className = 'leaflet-control-layers';

        if (!this._container) {
            this._container = L.DomUtil.create('div', className);

            //Makes this work on IE10 Touch devices by stopping it from firing a mouseout event when the touch is released
            this._container.setAttribute('aria-haspopup', true);

            if (!L.Browser.touch) {
                L.DomEvent
                    .disableClickPropagation(this._container)
                    .disableScrollPropagation(this._container);
            } else {
                L.DomEvent.on(this._container, 'click', L.DomEvent.stopPropagation);
            }
        }

        var container = this._container,
            panelContainer = this._panelContainer;


        // Init panel
        var inCnt = [];

        // Prepare layout
        this._separatorMain = L.DomUtil.create('div', className + '-separator', form);

        var clfix = document.createElement('div');
        clfix.className = "clearfix";

        for (grp of _menuOptions.groups) {
            console.log(grp);
            inCnt.push()
            for

        }
    }

    _showForm: function (ref, gpName) {
        osmcz.poiFilterSidebar.setContent(this._sidebarInit());

        sidebar.on('hidden', this._closeSidebar, this);
        osmcz.poiFilterSidebar.show();
    },

    _closeSidebar: function (e) {
        this._hideMarker();
        sidebar.off('hidden', this._closeSidebar);
    },

    _sidebarInit: function () {
        var hc = "";

        hc += "<div class='poi-filter-sidebar-inner'>";
        hc += "<!--sidebar from poi-filter--> ";
        hc += "  <div id='poi-filter-sidebar-content'>";
        hc += "<h4>Filtrování prvků</h4>"
        hc += "  </div>";
        hc += "</div>";

        return hc;
    }
});

L.control.poiFilter = function (options) {
    return new L.Control.PoiFilter(options);
};
