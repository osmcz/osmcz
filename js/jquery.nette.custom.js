/**
 * AJAX Nette Framework plugin for jQuery
 *
 * @copyright   Copyright (c) 2009 Jan Marek
 * @license     MIT
 * @link        http://addons.nette.org/cs/jquery-ajax
 * @version     0.2 (osmcz update)
 */

jQuery.extend({
    nette: {
        updateSnippet: function (id, html) {
            var snippet = $("#" + id).html(html);

            var fnc = snippet.attr("data-afterUpdate"); //npress update
            if (window[fnc])
                window[fnc]();
        },

        success: function (payload) {
            //if (!payload) alert('neni payload'); //TODO fakt se někdy děje? user-unfriendly!

            //alert
            if (payload.message) {
                alert(payload.message)
            }

            // redirect
            if (payload.redirect) {
                window.location.href = payload.redirect;
                return;
            }

            // snippets
            if (payload.snippets) {
                for (var i in payload.snippets) {
                    jQuery.nette.updateSnippet(i, payload.snippets[i]);
                }
            }
        }
    }
});


$("#main").on("click", "a.ajax", function (event) {
    if (!event.ctrlKey) {
        event.preventDefault();
        $.ajax({
            url: this.href,
            type: 'get',
            dataType: "json",
            success: jQuery.nette.success
        });
    }
});
