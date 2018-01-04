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

            // history api
            if (payload.uri) {
                history.pushState({nette: true}, document.title, "/" + payload.uri);
                window.scrollTo(0,0);
                if (this.url && this.url.match(/#(.+)$/)) {
                    var id = /#(.+)$/.exec(this.url)[0];
                    $('html, body').animate({scrollTop: $(id).offset().top}, 200);
                }
            }
        },

        callUrl: function (obj) {
            var src = 'data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH+GkNyZWF0ZWQgd2l0aCBhamF4bG9hZC5pbmZvACH5BAAKAAAAIf8LTkVUU0NBUEUyLjADAQAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQACgABACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkEAAoAAgAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkEAAoAAwAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkEAAoABAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQACgAFACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQACgAGACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAAKAAcALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==';
            var img = document.createElement('img');
            img.src = src;
            img.style.position = 'absolute';
            img.style.paddingTop = '3px';
            obj.parentNode.insertBefore(img, obj);

            $.ajax({
                url: obj.href || obj.value,
                type: 'get',
                dataType: "json",
                success: jQuery.nette.success.bind({url: obj.href || obj.value})
            });
        }
    }
});

// TODO popstate ??
// window.onpopstate = function(a) { window.location.reload(); };

$("#main").on("click", "a.ajax", function (event) {
    if (!event.ctrlKey) {
        event.preventDefault();
        jQuery.nette.callUrl(this);
    }
});
