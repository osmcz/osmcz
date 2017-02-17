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

    initialize: function (baseLayers, overlays, options) {
        L.setOptions(this, options);

        this._layers = {};
        this._groups = {};
        this._groupsHeaders = {};
        this._lastZIndex = 0;
        this._handlingClick = false;

        this._lastLayerId = 0;
        this._layersIdMap = {};

        for (grp in baseLayers) {
          for (layer in baseLayers[grp])
            this._addLayer(baseLayers[grp][layer], layer, false, grp);
        }

        for (grp in overlays) {
          for (layer in overlays[grp])
            this._addLayer(overlays[grp][layer], layer, true, grp);
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
        var id = this._layersIdMap[L.stamp(layer)];
        delete this._layers[id];
        this._update();
        return this;
    },

    expandGroup: function (group) {
        if (this._groups[group]) {
            this._groups[group].className = 'collapse in';
            this._groupsHeaders[group].setAttribute('aria-expanded', 'true');
        }
    },

    collapseGroup: function (group) {
        if (this._groups[group]) {
            this._groups[group].className = 'collapse';
            this._groupsHeaders[group].setAttribute('aria-expanded', 'false');
        }
    },

    // Create header button
    _addGroupHeader: function (name, target, expanded) {
        var content, glHideRight, glHideBottom;

        if (expanded) {
          glHideRight = 'style="display:none"';
        } else {
          glHideBottom = 'style="display:none"';
        }

        var grpBase = document.createElement('div');
        grpBase.className = 'btn btn-default btn-block btn-xs';
        grpBase.setAttribute("data-toggle", "collapse");
        grpBase.setAttribute("data-target", '#' + target);

        content  = '<i class="glyphicon glyphicon-triangle-right  pull-left" ' + glHideRight + '></i>';
        content += '<i class="glyphicon glyphicon-triangle-bottom pull-left" ' + glHideBottom + '></i>';
        content += name;
        grpBase.innerHTML = content;

        return grpBase;
    },

    _addGroup: function (id) {

        if (this._groups[id]) {
          // Group already exists, nothing to do
          return;
        }

        // Create a new group

        function hashCode (str){
          var hash = 0;
          if (str.length == 0) return hash;
          for (i = 0; i < str.length; i++) {
              char = str.charCodeAt(i);
              hash = ((hash<<5)-hash)+char;
              hash = hash & hash; // Convert to 32bit integer
          }
          return hash;
        }

        var className = 'leaflet-control-layers',
            container = this._container,
            form = this._form;

        var uid = 'grp' + hashCode(id);
        this._groupsHeaders[id] = this._addGroupHeader(id, uid, false);

        var element = document.createElement('div');
        element.id = uid;
        element.className = 'collapse';

        this._groups[id] = element;
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

        this._separator = L.DomUtil.create('div', className + '-separator', form);

        for (var id in this._groups) {
            this._form.appendChild(this._groupsHeaders[id]);
            this._form.appendChild(this._groups[id]);
        }

        //container.appendChild(form);
        $('#map-layers-content').append(form);

//         // Expand base overlays by default
//         this._overlaysListBase.className = 'collapse in';
    },

    _addLayer: function (layer, name, overlay, group) {

        // Map layers to preserve layer order
        this._lastLayerId++;
        this._layersIdMap[L.stamp(layer)] = this._lastLayerId;

        this._layers[this._lastLayerId] = {
            layer: layer,
            name: name,
            overlay: overlay,
            group: group
        };

        if (group) {
            this._addGroup(group);
        }

        if (this.options.autoZIndex && layer.setZIndex) {
            this._lastZIndex++;
            layer.setZIndex(this._lastZIndex);
        }
    },

    _update: function () {
        if (!this._container) {
            return;
        }

        for (var id in this._groups) {
            this._groups[id].innerHTML = '';
        }

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
        var obj = this._layers[this._layersIdMap[L.stamp(e.layer)]];

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

        input.layerId = this._layersIdMap[L.stamp(obj.layer)];

        L.DomEvent.on(input, 'click', this._onInputClick, this);

        var name = document.createElement('span');
        name.innerHTML = ' ' + obj.name;

        label.appendChild(input);
        label.appendChild(name);

        if (!obj.group ) {
            return;
        }

        var container = this._groups[obj.group];

        if (container) {
            container.appendChild(label);
        }

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
