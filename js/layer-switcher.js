/*
 * L.Control.Layers is a control to allow users to switch between different layers on the map.

 https://raw.githubusercontent.com/Leaflet/Leaflet/v0.7.7/src/control/Control.Layers.js
 */

osmcz.LayerSwitcher = L.Control.extend({
    options: {
        collapsed: true,
        position: 'topright',
        autoZIndex: true
    },

    initialize: function (baseLayers, baseOverlays, extraOverlays, options) {
        L.setOptions(this, options);

        this._layers = {};
        this._lastZIndex = 0;
        this._handlingClick = false;

        for (var i in baseLayers) {
            this._addLayer(baseLayers[i], i);
        }

        for (i in baseOverlays) {
            this._addLayer(baseOverlays[i], i, true, 'base');
        }

        for (i in extraOverlays) {
            this._addLayer(extraOverlays[i], i, true, 'extra');
        }
    },

    onAdd: function (map) {
        this._initLayout();
        this._update();

        map
            .on('layeradd', this._onLayerChange, this)
            .on('layerremove', this._onLayerChange, this);

        return this._container;
    },

    onRemove: function (map) {
        map
            .off('layeradd', this._onLayerChange, this)
            .off('layerremove', this._onLayerChange, this);
    },

    addBaseLayer: function (layer, name) {
        this._addLayer(layer, name);
        this._update();
        return this;
    },

    addOverlay: function (layer, name, group) {
        this._addLayer(layer, name, true, group);
        this._update();
        return this;
    },

    removeLayer: function (layer) {
        var id = L.stamp(layer);
        delete this._layers[id];
        this._update();
        return this;
    },

    _initLayout: function () {
        var className = 'leaflet-control-layers',
            container = this._container = L.DomUtil.create('div', className);

        //Makes this work on IE10 Touch devices by stopping it from firing a mouseout event when the touch is released
        container.setAttribute('aria-haspopup', true);

        if (!L.Browser.touch) {
            L.DomEvent
                .disableClickPropagation(container)
                .disableScrollPropagation(container);
        } else {
            L.DomEvent.on(container, 'click', L.DomEvent.stopPropagation);
        }

        var form = this._form = L.DomUtil.create('form', className + '-list');

        $('#map-layers button.close').click(function(){
            $('#map-layers').hide();
            $(container).show();
        });


        if (this.options.collapsed) {
            if (!L.Browser.android) {
                L.DomEvent
            .on(container, 'click', this._expand, this)  //osmcz
            //.on(container, 'mouseover', this._expand, this)
                    .on(container, 'mouseout', this._collapse, this);
            }
            var link = this._layersLink = L.DomUtil.create('a', className + '-toggle', container);
            link.href = '#';
            link.title = 'Layers';

            if (L.Browser.touch) {
                L.DomEvent
                    .on(link, 'click', L.DomEvent.stop)
                    .on(link, 'click', this._expand, this);
            }
            else {
                L.DomEvent.on(link, 'focus', this._expand, this);
            }
            //Work around for Firefox android issue https://github.com/Leaflet/Leaflet/issues/2033
            L.DomEvent.on(form, 'click', function () {
                setTimeout(L.bind(this._onInputClick, this), 0);
            }, this);

            this._map.on('click', this._collapse, this);
            // TODO keyboard accessibility
        } else {
            this._expand();
        }

        this._baseLayersList = L.DomUtil.create('div', className + '-base', form);
        this._separator = L.DomUtil.create('div', className + '-separator', form);
        this._tabs = L.DomUtil.create('ul', 'nav nav-pills', form);
        this._tabs.innerHTML  = '<li class="active"><a data-toggle="pill" href="#lsBase">Základní</a></li>';
        this._tabs.innerHTML += '<li><a data-toggle="pill" href="#lsExtra">Extra</a></li>';

        this._tab_content = L.DomUtil.create('div', 'tab-content', form);

        var lsBaseDiv = document.createElement('div');
        lsBaseDiv.id = 'lsBase';
        lsBaseDiv.className = 'tab-pane fade in active';
        this._tab_content.appendChild(lsBaseDiv);

        var lsExtraDiv = document.createElement('div');
        lsExtraDiv.id = 'lsExtra';
        lsExtraDiv.className = 'tab-pane fade';
        this._tab_content.appendChild(lsExtraDiv);

        this._overlaysListBase = lsBaseDiv;
        this._overlaysListExtra = lsExtraDiv;

    //container.appendChild(form);
    $('#map-layers-content').append(form);
    },

    _addLayer: function (layer, name, overlay, group) {
        var id = L.stamp(layer);

        this._layers[id] = {
            layer: layer,
            name: name,
            overlay: overlay,
            group: group
        };

        if (this.options.autoZIndex && layer.setZIndex) {
            this._lastZIndex++;
            layer.setZIndex(this._lastZIndex);
        }
    },

    _update: function () {
        if (!this._container) {
            return;
        }

        this._baseLayersList.innerHTML = '';
        this._overlaysListBase.innerHTML = '';
        this._overlaysListExtra.innerHTML = '';

        var baseLayersPresent = false,
            overlaysPresent = false,
            i, obj;

        for (i in this._layers) {
            obj = this._layers[i];
            this._addItem(obj);
            overlaysPresent = overlaysPresent || obj.overlay;
            baseLayersPresent = baseLayersPresent || !obj.overlay;
        }

        this._separator.style.display = overlaysPresent && baseLayersPresent ? '' : 'none';
    },

    _onLayerChange: function (e) {
        var obj = this._layers[L.stamp(e.layer)];

        if (!obj) { return; }

        if (!this._handlingClick) {
            this._update();
        }

        var type = obj.overlay ?
            (e.type === 'layeradd' ? 'overlayadd' : 'overlayremove') :
            (e.type === 'layeradd' ? 'baselayerchange' : null);

        if (type) {
            this._map.fire(type, obj);
        }
    },

    // IE7 bugs out if you create a radio dynamically, so you have to do it this hacky way (see http://bit.ly/PqYLBe)
    _createRadioElement: function (name, checked) {

        var radioHtml = '<input type="radio" class="leaflet-control-layers-selector" name="' + name + '"';
        if (checked) {
            radioHtml += ' checked="checked"';
        }
        radioHtml += '/>';

        var radioFragment = document.createElement('div');
        radioFragment.innerHTML = radioHtml;

        return radioFragment.firstChild;
    },

    _addItem: function (obj) {
        var label = document.createElement('label'),
            input,
            checked = this._map.hasLayer(obj.layer);

        if (obj.overlay) {
            input = document.createElement('input');
            input.type = 'checkbox';
            input.className = 'leaflet-control-layers-selector';
            input.defaultChecked = checked;
        } else {
            input = this._createRadioElement('leaflet-base-layers', checked);
        }

        input.layerId = L.stamp(obj.layer);

        L.DomEvent.on(input, 'click', this._onInputClick, this);

        var name = document.createElement('span');
        name.innerHTML = ' ' + obj.name;

        label.appendChild(input);
        label.appendChild(name);

//         var container = obj.overlay ? this._overlaysListBase : this._baseLayersList;
        var container;
        if (!obj.overlay ) {
            container = this._baseLayersList;
        } else {
            container = obj.group == 'base' ? this._overlaysListBase : this._overlaysListExtra;
        }
        container.appendChild(label);

        return label;
    },

    _onInputClick: function () {
        var i, input, obj,
            inputs = this._form.getElementsByTagName('input'),
            inputsLen = inputs.length;

        this._handlingClick = true;

        for (i = 0; i < inputsLen; i++) {
            input = inputs[i];
            obj = this._layers[input.layerId];

            if (input.checked && !this._map.hasLayer(obj.layer)) {
                this._map.addLayer(obj.layer);

            } else if (!input.checked && this._map.hasLayer(obj.layer)) {
                this._map.removeLayer(obj.layer);
            }
        }

        this._handlingClick = false;

        this._refocusOnMap();
    },

    _expand: function () {
    $('#map-layers').show();
    $(this._container).hide();

        //L.DomUtil.addClass(this._container, 'leaflet-control-layers-expanded');
    },

    _collapse: function () {
        //this._container.className = this._container.className.replace(' leaflet-control-layers-expanded', '');
    }
});

osmcz.layerSwitcher = function (baseLayers, overlays, options) {
    return new osmcz.LayerSwitcher(baseLayers, overlays, options);
};
