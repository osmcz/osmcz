L.Control.Sidebar = L.Control.extend({

    includes: (L.Evented.prototype || L.Mixin.Events),

    options: {
        closeButton: true,
        position: 'left',
        autoPan: true,
    },

    initialize: function (placeholder, options) {
        L.setOptions(this, options);

        // Find content container
        var content = this._contentContainer = L.DomUtil.get(placeholder);

        // Remove the content container from its original parent
        content.parentNode.removeChild(content);

        var l = 'leaflet-';

        // Create sidebar container
        var container = this._container =
            L.DomUtil.create('div', l + 'sidebar ' + this.options.position);

        // Style and attach content container
        L.DomUtil.addClass(content, l + 'control');
        container.appendChild(content);

        // Create close button and attach it if configured
        if (this.options.closeButton) {
            var close = this._closeButton =
                L.DomUtil.create('a', 'close', container);
            close.innerHTML = '&times;';
        }
    },

    /**
     * Remove this sidebar from the map.
     *
     * @param {L.Map} map
     * @returns {Sidebar}
     */
    onRemove: function (map) {

        //if the control is visible, hide it before removing it.
        this.hide();

        if (this._closeButton && this._close) {
            var close = this._closeButton;

            L.DomEvent.off(close, 'click', this.hide, this);
        }

        L.DomEvent
            .off(this._container, 'transitionend',
                this._handleTransitionEvent, this)
            .off(this._container, 'webkitTransitionEnd',
                this._handleTransitionEvent, this);

        // Remove sidebar container from controls container
        var controlContainer = map._controlContainer;
        controlContainer.removeChild(this._container);

        //disassociate the map object
        this._map = null;
        this._closeButton = null;
        this._container = null;
        this._contentContainer = null;

        return this;
    },


    addTo: function (map) {
        var container = this._container;
        var content = this._contentContainer;

        this._map = map;

        // Attach event to close button
        if (this.options.closeButton) {
            var close = this._closeButton;

            L.DomEvent.on(close, 'click', this.hide, this);
        }

        L.DomEvent
            .on(container, 'transitionend',
                this._handleTransitionEvent, this)
            .on(container, 'webkitTransitionEnd',
                this._handleTransitionEvent, this);

        // Attach sidebar container to controls container
        var controlContainer = map._controlContainer;
        controlContainer.insertBefore(container, controlContainer.firstChild);


        // when adding to the map container, we should stop event propagation
        L.DomEvent.disableScrollPropagation(this._container);
        L.DomEvent.disableClickPropagation(this._container);

        return this;
    },

    removeFrom: function (map) {
        this.onRemove(map);
        return this;
    },

    isVisible: function () {
        return L.DomUtil.hasClass(this._container, 'visible');
    },

    show: function () {
        if (!this.isVisible()) {
            L.DomUtil.addClass(this._container, 'visible');
            if (this.options.autoPan) {
                this._map.panBy([-this.getOffset() / 2, 0], {
                    duration: 0.5
                });
            }
            this.fire('show');
        }
    },

    hide: function (e) {
        if (this.isVisible()) {
            L.DomUtil.removeClass(this._container, 'visible');
            if (this.options.autoPan) {
                this._map.panBy([this.getOffset() / 2, 0], {
                    duration: 0.5
                });
            }
            this.fire('hide');
        }
        if(e) {
            L.DomEvent.stopPropagation(e);
        }
    },

    toggle: function () {
        if (this.isVisible()) {
            this.hide();
        } else {
            this.show();
        }
    },

    getContainer: function () {
        return this._contentContainer;
    },

    getCloseButton: function () {
        return this._closeButton;
    },

    setContent: function (content) {
        var container = this.getContainer();

        if (typeof content === 'string') {
            container.innerHTML = content;
        } else {
            // clean current content
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }

            container.appendChild(content);
        }

        return this;
    },

    getOffset: function () {
        if (this.options.position === 'right') {
            return -this._container.offsetWidth;
        } else {
            return this._container.offsetWidth;
        }
    },

    _handleTransitionEvent: function (e) {
        if (e.propertyName == 'left' || e.propertyName == 'right')
            this.fire(this.isVisible() ? 'shown' : 'hidden');
    }
});

L.control.sidebar = function (placeholder, options) {
    return new L.Control.Sidebar(placeholder, options);
};
