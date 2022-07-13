/*global jQuery */
/*!
* Lettering.JS 0.7.0
*
* Copyright 2010, Dave Rupert http://daverupert.com
* Released under the WTFPL license
* http://sam.zoy.org/wtfpl/
*
* Thanks to Paul Irish - http://paulirish.com - for the feedback.
*
* Date: Mon Sep 20 17:14:00 2010 -0600
*
* Modified by PF4 UI Team:
* - Reformat code
* - Resolve several warnings
* - Use template strings and arrow functions
* - Skip <br> to ignore this as a word
*/
(function($){
	function injector(t, splitter, klass, after) {
		var text = t.text(), a = text.split(splitter), inject = '';
		if (a.length) {
			$(a).each((i, item) => {
				if(item.indexOf("<br>") === -1) {
                    inject += `<span class="${klass}${i + 1}" aria-hidden="true">${item}</span>${after}`;
                } else {
					let toks, line = "<br>";
                    if(item.indexOf("<br><br>") === -1) {
                        toks = item.split(line);
                    } else {
                        toks = item.split("<br><br>");
                        line = "<br><br>";
                    }
					if (toks.length >= 1 && toks[0] !== "") {
						inject += `<span class="${klass}${i + 1}" aria-hidden="true">${toks[0]}</span>${after}`;
					}
					inject += line;
					if (toks.length === 2 && toks[1] !== "") {
						inject += `<span class="${klass}${i + 1}" aria-hidden="true">${toks[1]}</span>${after}`;
					}
				}
			});
			t.attr('aria-label',text)
			.empty()
			.append(inject);

		}
	}


	var methods = {
		init : function() {

			return this.each(() => {
				injector($(this), '', 'char', '');
			});

		},

		words : function() {

			return this.each(() => {
				injector($(this), ' ', 'word', ' ');
			});

		},

		lines : function() {

			return this.each(() => {
				var r = "eefec303079ad17405c889e092e105b0";
				// Because it's hard to split a <br/> tag consistently across browsers,
				// (*ahem* IE *ahem*), we replace all <br/> instances with an md5 hash
				// (of the word "split").  If you're trying to use this plugin on that
				// md5 hash string, it will fail because you're being ridiculous.
				injector($(this).children("br").replaceWith(r).end(), r, 'line', '');
			});

		}
	};

	$.fn.lettering = function( method ) {
		// Method calling logic
		if ( method && methods[method] ) {
			return methods[ method ].apply( this, [].slice.call( arguments, 1 ));
		} else if ( method === 'letters' || ! method ) {
			return methods.init.apply( this, [].slice.call( arguments, 0 ) ); // always pass an array
		}
		$.error( 'Method ' +  method + ' does not exist on jQuery.lettering' );
		return this;
	};

})(jQuery);
