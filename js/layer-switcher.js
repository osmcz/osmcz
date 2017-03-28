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

    initialize: function (baseLayers, overlays, panel, options) {
        L.setOptions(this, options);

        this._mode = 'basic'; // Layer switcher mode - basic or groups

        this._layers = {}; // List of layers
        this._groups = {}; // List of groups
        this._groupsHeaders = {}; // List of groups headers
        this._cntInGroup = {}; // Store number of layers per group
        this._cntActiveInGroup = {}; // Store number of active layers per group
        this._lastZIndex = 0;
        this._handlingClick = false;
        this._defaultLayer = null; // default layer - set from layer.options.osmczDefaultLayer

        this._lastLayerId = 0;
        this._layersIdMap = {}; // Mapping between internal layer ID and Leaflet object ID

        this._panelContainer = panel;


        // Restore mode from cookie - if exists
        if ( Cookies.get("_ls_mode") ) {
            this._mode = Cookies.get("_ls_mode");
        }

        // Create priority groups first to preserve given groups order
        if (options["priorityGroups"]){
            for (i in options["priorityGroups"]) {
                this.addGroup(options["priorityGroups"][i]);
            }
        }

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

        this._prepareLayout();
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
        this._prepareLayout();
        this._update();
        return this;
    },

    addOverlay: function (layer, name, group) {
        this._addLayer(layer, name, true, group);
        this._prepareLayout();
        this._update();
        return this;
    },

    removeLayer: function (layer) {
        var id = this._layersIdMap[L.stamp(layer)];
        var group = this._layers[id].group;
        if (this._map.hasLayer(layer)) {
            this._map.removeLayer(layer);
            if (this._cntActiveInGroup[group] > 0) {
                this._cntActiveInGroup[group]--;
            }
        }
        delete this._layers[id];
        this._prepareLayout();
        this._update();
        return this;
    },

    removeLayerByName: function (layerName) {
        for (var layerId in this._layers) {
            if (this._layers[layerId].name == layerName) {
                this.removeLayer(this._layers[layerId].layer);
            }
        }
        return this;
    },


    expandGroup: function (group) {
        // If no parameter set, use stored cookie
        if (group == null && Cookies.get("_ls_expanded_groups") != null) {
            var grpList = Cookies.get("_ls_expanded_groups").split("|");
            for (i in grpList) {
                if (this._groups[grpList[i]]) {
                    this.expandGroup(grpList[i]);
                }
            }
        } else {
            if (this._groups[group]) {
                if (this._groupsHeaders[group].getAttribute('aria-expanded') == null ||
                    this._groupsHeaders[group].getAttribute('aria-expanded') == 'false') {
                    this._updateGroupCookie(group);
                    $("#" + this._groups[group].id).collapse("show");
                }
            }
        }
    },

    collapseGroup: function (group) {
        if (this._groups[group]) {
            if (this._groupsHeaders[group].getAttribute('aria-expanded') == "true") {
                this._updateGroupCookie(group);
                $("#" + this._groups[group].id).collapse("hide");
            }
        }
    },

    expandAllGroups: function () {
        for (group in this._groups) {
            this.expandGroup(group);
        }
    },

    collapseAllGroups: function () {
        for (group in this._groups) {
            this.collapseGroup(group);
        }
    },

    addGroup: function (id) {

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
        this._cntActiveInGroup[id] = 0;
    },

    // Return current mode - basic or groups
    getMode: function() {
        return this._mode;
    },

    // Check layers and return whether layer already exists or not.
    layerExists: function(layerName) {
        for (var layerId in this._layers) {
            if (this._layers[layerId].name == layerName) {
                return true;
            }
        }
        return false;
    },

    // -------------------------------------------------
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
        grpBase.setAttribute("onclick", "controls.layers._updateGroupCookie('" + name + "');");

        content  = '<i class="glyphicon glyphicon-triangle-right  pull-left" ' + glHideRight + '></i>';
        content += '<i class="glyphicon glyphicon-triangle-bottom pull-left" ' + glHideBottom + '></i>';
        content += name;
        grpBase.innerHTML = content;

        return grpBase;
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
        inCnt.push('<div id="map-layers-inner" class="sidebar-inner">');
//         inCnt.push('  <button type="button" class="close"><span aria-hidden="true">&times;</span></button>');
        inCnt.push('  <div class="clearfix">');
        inCnt.push('    <div id="ls-info" class="btn-group inline navbar-default">');
        inCnt.push('      <a class="btn btn-header" data-toggle="collapse" data-target="#lsinfo" title="O vrstvách">Vrstvy <span class="glyphicon glyphicon-question-sign small"></a>');
        inCnt.push('    </div>');
        inCnt.push('  </div>');
        inCnt.push('  <div id="lsinfo" class="ls-info-body collapse">');
        inCnt.push('    <p class="text-center"><strong>Mapové vrstvy vám ukáží pravou sílu <em>OpenStreetMap</em>.</strong></p>');
        inCnt.push('    <p class="text-justify">Stejná mapová databáze může být vykreslena v různých stylech a pro mnoho různých využití. Od mapy města, přes turistiku až po lyžování.</p>');
        inCnt.push('    <p>Další vrstvy si zpřístupníte kliknutím na tlačítko <span class="btn btn-default btn-xs glyphicon glyphicon-calendar disabled"></span> níže.');
        inCnt.push('      <a href="#" class="btn btn-default btn-xs pull-right" data-toggle="collapse" data-target="#lsinfo" onclick=\'Cookies.set("_ls_info_hide", "yes", {expires: 90})\'>Skrýt</a>');
        inCnt.push('    </p>');
        inCnt.push('  </div>');
        inCnt.push('  <div id="map-layers-content">');
        inCnt.push('  </div>');
        inCnt.push('</div>');

        this._panelContainer.setContent(inCnt.join(''));


        var form = this._form = L.DomUtil.create('form', className + '-list');

        L.DomEvent.on(panelContainer, 'hide', this._collapse2, this);

        if (this.options.collapsed) {
            if (!L.Browser.android) {
                L.DomEvent
                    .on(container, 'click', this._expand, this)  //osmcz
                    .on(container, 'mouseout', this._collapse, this);
            }

            if (!this._layersLink) {
                this._layersLink = L.DomUtil.create('a', className + '-toggle', container);
                this._layersLink.href = '#';
                this._layersLink.title = 'Layers';

                if (L.Browser.touch) {
                    L.DomEvent
                        .on(this._layersLink, 'click', L.DomEvent.stop)
                        .on(this._layersLink, 'click', this._expand, this);
                }
                else {
                    L.DomEvent.on(this._layersLink, 'focus', this._expand, this);
                }
            }
            var link = this._layersLink;

            //Work around for Firefox android issue https://github.com/Leaflet/Leaflet/issues/2033
            L.DomEvent.on(form, 'click', function () {
                setTimeout(L.bind(this._onInputClick, this), 0);
            }, this);

            this._map.on('click', this._collapse, this);
            // TODO keyboard accessibility
        } else {
            this._expand();
        }

        // Prepare layout
        this._separatorMain = L.DomUtil.create('div', className + '-separator', form);

        var clfix = document.createElement('div');
        clfix.className = "clearfix";

        // Main toolbar
        var toolbar = document.createElement('div');
        toolbar.className = "btn-toolbar inline";
        toolbar.setAttribute ('role', 'toolbar');

        // Collapse group
        var collapseGroup = document.createElement('div');
        collapseGroup.className = "btn-group btn-group-xs";
        collapseGroup.setAttribute('role', 'group');
        collapseGroup.setAttribute('id', 'collapseGroup');

        // Expand all button
        this._btnExpandAll = document.createElement('button');
        this._btnExpandAll.className = 'btn btn-secondary btn-default btn-xs';
        this._btnExpandAll.setAttribute ('type', 'button');
        this._btnExpandAll.setAttribute ('title', 'Rozbalit vše');
        this._btnExpandAll.setAttribute ('id', 'btnExpandAll');
        this._btnExpandAll.setAttribute("onclick", "controls.layers.expandAllGroups();");
        this._btnExpandAll.innerHTML = '<i class="glyphicon glyphicon-eject flip"></i>';

        // Collapse all button
        this._btnCollapseAll = document.createElement('button');
        this._btnCollapseAll.className = 'btn btn-secondary  btn-default btn-xs';
        this._btnCollapseAll.setAttribute ('type', 'button');
        this._btnCollapseAll.setAttribute ('title', 'Sbalit vše');
        this._btnCollapseAll.setAttribute ('id', 'btnCollapseAll');
        this._btnCollapseAll.setAttribute("onclick", "controls.layers.collapseAllGroups();");
        this._btnCollapseAll.innerHTML = '<i class="glyphicon glyphicon-eject" ></i>';

        // Fill collapse group
        collapseGroup.appendChild(this._btnExpandAll);
        collapseGroup.appendChild(this._btnCollapseAll);

        // Settings button - dissabled for now - no content to show
        this._btnSetting = document.createElement('button');
        this._btnSetting.className = 'btn btn-secondary  btn-default btn-xs pull-right hidden';
        this._btnSetting.setAttribute ('type', 'button');
        this._btnSetting.setAttribute ('title', 'Nastavení');
        this._btnSetting.setAttribute ('data-toggle', 'collapse');
        this._btnSetting.setAttribute ('data-target', '#lssetup');
        this._btnSetting.innerHTML = '<i class="glyphicon glyphicon-cog" ></i>';

        // Mode switcher
        var modeSwitchGroup = document.createElement('div');
        modeSwitchGroup.className = "btn-group btn-group-xs";
        modeSwitchGroup.setAttribute('role', 'group');
        modeSwitchGroup.setAttribute('id', 'modeSwitchGroup');
        modeSwitchGroup.setAttribute('data-toggle', 'buttons');

        // Basic button
        var labelBasic = document.createElement('label');
        labelBasic.className = 'btn btn-default' + (this._mode == 'basic' ? ' active' : '');
        labelBasic.setAttribute('onclick','controls.layers._switchLayerMode("basic")');
        labelBasic.setAttribute('title','Základní vrstvy');

        var inputBasic = document.createElement('input');
        inputBasic.className = 'btn-block';
        inputBasic.setAttribute('type','radio');
        inputBasic.setAttribute('name','layerMode');
        inputBasic.setAttribute('id','layerModeBasic');
        inputBasic.setAttribute('autocomplete','off');

        var nameBasic = document.createElement('span');
        nameBasic.className = 'glyphicon glyphicon-list';

        labelBasic.appendChild(inputBasic);
        labelBasic.appendChild(nameBasic);

        // Group button
        var labelGroup = document.createElement('label');
        labelGroup.className = 'btn btn-default' + (this._mode == 'groups' ? ' active' : '');
        labelGroup.setAttribute('onclick','controls.layers._switchLayerMode("groups")');
        labelGroup.setAttribute('title','Více vrstev ve skupinách');

        var inputGroup = document.createElement('input');
        inputGroup.className = 'btn-block ';
        inputGroup.setAttribute('type','radio');
        inputGroup.setAttribute('name','layerMode');
        inputGroup.setAttribute('id','layerModeGroup');
        inputGroup.setAttribute('autocomplete','off');

        var nameGroup = document.createElement('span');
        nameGroup.className = 'glyphicon glyphicon-calendar';

        labelGroup.appendChild(inputGroup);
        labelGroup.appendChild(nameGroup);

        modeSwitchGroup.appendChild(labelBasic);
        modeSwitchGroup.appendChild(labelGroup);

        toolbar.appendChild(modeSwitchGroup);
        toolbar.appendChild(collapseGroup);
        toolbar.appendChild(this._btnSetting);
        this._form.appendChild(toolbar);

        var lssetup = document.createElement('div');
        lssetup.className = "lssetup collapse";
        lssetup.setAttribute('id', 'lssetup');
        lssetup.innerHTML = '<h3>Nastavení</h3><div>Tady bude nějaké nastavení.</div>';
        this._form.appendChild(lssetup);

        this._separatorBtGroup = L.DomUtil.create('div', className + '-separator', form);

        // Create layout for basic mode
        var basicModeContainer = document.createElement('div');
        basicModeContainer.className = "clearfix";
        basicModeContainer.setAttribute ('id', 'basicModeContainer');

        this._baseLayersList = L.DomUtil.create('div', className + '-base', basicModeContainer);
        this._baseSeparator = L.DomUtil.create('div', className + '-separator', basicModeContainer);
        this._overlaysList = L.DomUtil.create('div', className + '-overlays', basicModeContainer);

        this._form.appendChild(basicModeContainer);

        // Create layout for extended (group) mode
        var groupsModeContainer = document.createElement('div');
        groupsModeContainer.className = "clearfix";
        groupsModeContainer.setAttribute ('id', 'groupsModeContainer');

        for (var id in this._groups) {
            groupsModeContainer.appendChild(this._groupsHeaders[id]);
            groupsModeContainer.appendChild(this._groups[id]);
        }

        this._form.appendChild(groupsModeContainer);

        //container.appendChild(form);
        $('#map-layers-content').append(form);

        // Hide group container by mode
        if (this._mode == 'basic') {
            $('#groupsModeContainer').hide();
            $('#layerModeBasic').attr('checked', true);
        } else {
            $('#basicModeContainer').hide();
            $('#layerModeGroup').attr('checked', true);
        }


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
            this.addGroup(group);
        }

        if (!overlay && layer.options.osmczDefaultLayer)
            this._defaultLayer = layer;

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
        this._overlaysList.innerHTML = '';

        for (var group in this._groups) {
            this._groups[group].innerHTML = '';
            this._cntActiveInGroup[group] = 0;
            for (var layer in this._layers) {
                if (this._layers[layer].group == group) {
                    this._cntActiveInGroup[group]++;
                }
            }
            this._cntInGroup[group] = this._cntActiveInGroup[group];
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

        if (this._mode == 'groups') {
            this._baseSeparator.style.display = '';
            this._updateGroupHeaders();
            $('#basicModeContainer').hide();
            $('#groupsModeContainer').show();
            $('#btnExpandAll').show();
            $('#btnCollapseAll').show();
            $('#lsinfo').collapse("hide");
        } else {
            this._baseSeparator.style.display = overlaysPresent && baseLayersPresent ? '' : 'none';
            $('#groupsModeContainer').hide();
            $('#basicModeContainer').show();
            $('#btnExpandAll').hide();
            $('#btnCollapseAll').hide();
            var infoCookie = Cookies.get("_ls_info_hide");
            if (infoCookie && infoCookie != "yes") {
                $('#lsinfo').collapse("show");
            }
        }
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

        if (!obj.group ) {
            // requested group does not exists
            return;
        }

        var label = document.createElement('label'),
            input,
            checked = this._map.hasLayer(obj.layer);

        if (!checked) {
            if (this._cntActiveInGroup[obj.group] > 0) {
                this._cntActiveInGroup[obj.group]--;
            }
        }

        var name = document.createElement('span');
        var innerContent = [];
        if (obj.layer.options.removeBtn) {
            innerContent.push('<span class="ellipsis removable" title="' + obj.name  + '">&nbsp;' + obj.name + '</span>');
            innerContent.push('<a href="#" class="btn pull-right" title="Odebrat vrstvu"');
            innerContent.push('onclick="controls.layers.removeLayerByName(\'' + obj.name + '\');"');
            innerContent.push('>');
            innerContent.push('<span class="glyphicon glyphicon-trash text-danger" alt="X"></span></a>');
            innerContent.push('<div class="clearfix"></div>');
        } else {
            innerContent.push('<span class="ellipsis" title="' + obj.name  + '">&nbsp;' + obj.name + '</span>');
        }

        name.innerHTML = innerContent.join('');

        if (obj.overlay) {
            input = document.createElement('input');
            input.type = 'checkbox';
            input.className = 'leaflet-control-layers-selector';
            input.defaultChecked = checked;
            name.className = 'lsOverlay';
        } else {
            input = this._createRadioElement('leaflet-base-layers', checked);
        }

        input.setAttribute('id','lftid-' + L.stamp(obj.layer));
        input.layerId = this._layersIdMap[L.stamp(obj.layer)];

        L.DomEvent.on(input, 'click', this._onInputClick, this);


        label.appendChild(input);
        label.appendChild(name);

        if ( this._mode == 'basic' ) {
            if (obj.layer.options.basic) {
                var container = obj.overlay ? this._overlaysList : this._baseLayersList;

                if (container) {
                    container.appendChild(label);
                }
            }
        } else {
            var container = this._groups[obj.group];

            if (container) {
                container.appendChild(label);
            }
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

            if (!obj) {
                continue;
            }

            if (input.checked && !this._map.hasLayer(obj.layer)) {
                this._map.addLayer(obj.layer);
                this._cntActiveInGroup[obj.group]++;

            } else if (!input.checked && this._map.hasLayer(obj.layer)) {
                this._map.removeLayer(obj.layer);
                if (this._cntActiveInGroup[obj.group] > 0) {
                    this._cntActiveInGroup[obj.group]--;
                }

            }
        }

        this._handlingClick = false;

        this._updateGroupHeaders();

        this._refocusOnMap();
    },

    _expand: function () {
    this._panelContainer.show();
    $(this._container).hide();

        //L.DomUtil.addClass(this._container, 'leaflet-control-layers-expanded');
    },

    _collapse: function () {
        //this._container.className = this._container.className.replace(' leaflet-control-layers-expanded', '');
    },

    _collapse2: function () {
        $(this._container).show();
    },

    // Update Group headers to indicate, which group contains enabled layers
    // Also hide empty groups
    _updateGroupHeaders: function () {
        for (group in this._cntActiveInGroup) {
            if (this._cntActiveInGroup[group] == 0) {
                this._groupsHeaders[group].setAttribute('group-active', 'false');
            } else {
                this._groupsHeaders[group].setAttribute('group-active', 'true');
            }

            if (this._cntInGroup[group] == 0) {
                L.DomUtil.addClass(this._groupsHeaders[group], 'hidden');
            } else {
                L.DomUtil.removeClass(this._groupsHeaders[group], 'hidden');
            }
        }
    },

    // Update cookie containig list of expanded groups so they can be restored next time
    _updateGroupCookie: function (group) {

            if (this._groups[group]) {
                if (this._groupsHeaders[group].getAttribute('aria-expanded') == null ||
                    this._groupsHeaders[group].getAttribute('aria-expanded') == "false") {
                    var expandCookie = Cookies.get("_ls_expanded_groups") == null ? group : Cookies.get("_ls_expanded_groups") + '|' + group;
                    Cookies.set("_ls_expanded_groups", expandCookie, {expires: 90});
                } else {
                    if (Cookies.get("_ls_expanded_groups") == null) {
                        return;
                    } else {
                        var cc = Cookies.get("_ls_expanded_groups").split("|");
                        var expandCookie = [];
                        for (i in cc) {
                            if (cc[i] != group) {
                                expandCookie.push(cc[i]);
                            }
                        }
                        Cookies.set("_ls_expanded_groups", expandCookie.join("|"), {expires: 90});
                    }
                }
            }
    },

    _switchLayerMode: function (mode) {
        if (mode && (mode == 'basic' || mode == 'groups')) {
            this._mode = mode;
            Cookies.set("_ls_mode", mode, {expires: 90});

            // Switch back to default layer when current base layer is not in basic layout
            if (this._mode == 'basic') {
                for (layerId in this._map._layers) {
                    var obj = this._layers[this._layersIdMap[layerId]];
                    if (obj && !obj.overlay && !obj.layer.options.basic && this._defaultLayer) {
                        var lftid = L.stamp(this._defaultLayer);
                        $('#lftid-' + lftid).click();
                        break;
                    }
                }
            }

            this._update();
        }
    }

});

osmcz.layerSwitcher = function (baseLayers, overlays, panel, options) {
    return new osmcz.LayerSwitcher(baseLayers, overlays, panel, options);
};
