/*
 * OKZoom by OKFocus v1.1
 * http://okfoc.us // @okfocus
 * Copyright 2012 OKFocus
 * Licensed under the MIT License
 *
 * Modified by PF4/UI Team (2019):
 * + do not affect the css cursor anymore
 * Modified by PF4/UI Team (2017):
 * + add a destroy function in order to remove whole magnify specific DOM enhancements
 * + add options.offsetTop for a more natural magnify experience
 * + use on/off instead of bind
 * + use string templates, const, let instead of var
 * + remove unnecessary operations, like IE exceptions
**/

(function($) {
    const OK_IMGAE_DATA = 'data-okimage';

    $.fn.okzoom = function(options) {
        options = $.extend({}, $.fn.okzoom.defaults, options);

        return this.each(function() {
            let base = {};
            let el = this;
            let $body = $('body');
            base.options = options;
            base.$el = $(el);
            base.el = el;

            base.listener = document.createElement('div');
            base.$listener = $(base.listener).addClass('ok-listener').css({
                position: 'absolute',
                zIndex: 2
            });
            $body.append(base.$listener);
            let loupe = document.createElement("div");
            $(loupe).addClass('ok-loupe');
            loupe.style.position = "absolute";
            loupe.style.backgroundRepeat = "no-repeat";
            loupe.style.pointerEvents = "none";
            loupe.style.display = "none";
            loupe.style.zIndex = 3;
            $body.append(loupe);
            base.loupe = loupe;

            base.$el.data("okzoom", base);

            base.options = options;
            base.$el.on('mouseover', (function(b) {
                return function(e) {
                    $.fn.okzoom.build(b, e);
                };
            }(base)));

            base.$listener.on('mousemove', (function(b) {
                return function(e) {
                    $.fn.okzoom.mousemove(b, e);
                };
            }(base)));

            base.$listener.on('mouseout', (function(b) {
                return function(e) {
                    $.fn.okzoom.mouseout(b, e);
                };
            }(base)));

            base.options.height = base.options.height || base.options.width;

            base.image_from_data = base.$el.data("okimage");
            base.has_data_image = typeof base.image_from_data !== "undefined";

            if(base.has_data_image) {
                base.img = new Image();
                base.img.src = base.image_from_data;
            }
        });
    };

    $.fn.okzoom.defaults = {
        "width": 150,
        "height": null,
        "scaleWidth": null,
        "offsetTop": 0,
        "round": true,
        "background": "#fff",
        "backgroundRepeat": "no-repeat",
        "shadow": "0 0 5px #000",
        "border": 0
    };

    $.fn.okzoom.build = function(base, e) {
        if(!base.has_data_image) {
            base.img = base.el;
        } else if(base.image_from_data !== base.$el.attr(OK_IMGAE_DATA)) {
            // data() returns cached values, whereas attr() returns from the dom.
            base.image_from_data = base.$el.attr(OK_IMGAE_DATA);

            $(base.img).remove();
            base.img = new Image();
            base.img.src = base.image_from_data;
        }

        base.offset = base.$el.offset();
        base.width = base.$el.width();
        base.height = base.$el.height();
        base.$listener.css({
            display: 'block',
            width: base.$el.outerWidth(),
            height: base.$el.outerHeight(),
            top: base.$el.offset().top,
            left: base.$el.offset().left
        });

        if(base.options.scaleWidth) {
            base.naturalWidth = base.options.scaleWidth;
            base.naturalHeight = Math.round(base.img.naturalHeight * base.options.scaleWidth / base.img.naturalWidth);
        } else {
            base.naturalWidth = base.img.naturalWidth;
            base.naturalHeight = base.img.naturalHeight;
        }

        base.widthRatio = base.naturalWidth / base.width;
        base.heightRatio = base.naturalHeight / base.height;

        base.loupe.style.width = `${base.options.width}px`;
        base.loupe.style.height = `${base.options.height}px`;
        base.loupe.style.border = base.options.border;
        base.loupe.style.background = `${base.options.background} url(${base.img.src})`;
        base.loupe.style.backgroundRepeat = base.options.backgroundRepeat;
        base.loupe.style.backgroundSize = base.options.scaleWidth ? `${base.naturalWidth}px ${base.naturalHeight}px` : 'auto';
        base.loupe.style.borderRadius = base.options.round ? '50%' : 'none';
        base.loupe.style.boxShadow = base.options.shadow;
        base.initialized = true;
        $.fn.okzoom.mousemove(base, e);
    };

    $.fn.okzoom.destroy = function(base) {
        let $body = $('body');
        $body.find("[data-okimage]").each((i, e) => {
            $(e).off('mouseover');
        });
        $body.find('.ok-listener').each((i, e) => {
            $(e).off('mouseout mousemove');
        });
        $body.find('.ok-listener').remove();
        $body.find('.ok-loupe').remove();
    };

    $.fn.okzoom.mousemove = function(base, e) {
        if(!base.initialized) return;
        let shimLeft = base.options.width / 2 + base.options.offsetLeft;
        let shimTop = base.options.height / 2 + base.options.offsetTop;
        let pageX = e.pageX !== void 0 ? e.pageX : (e.clientX + document.documentElement.scrollLeft);
        let pageY = e.pageY !== void 0 ? e.pageY : (e.clientY + document.documentElement.scrollTop);
        let scaleLeft = -1 * Math.floor((pageX - base.offset.left) * base.widthRatio - shimLeft);
        let scaleTop = -1 * Math.floor((pageY - base.offset.top) * base.heightRatio - shimTop);

        base.loupe.style.display = "block";
        base.loupe.style.left = `${pageX - shimLeft}px`;
        base.loupe.style.top = `${pageY - shimTop}px`;
        base.loupe.style.backgroundPosition = `${scaleLeft}px ${scaleTop}px`;
    };

    $.fn.okzoom.mouseout = function(base, e) {
        base.loupe.style.display = "none";
        base.loupe.style.background = "none";
        base.listener.style.display = "none";
    };

})(jQuery);
