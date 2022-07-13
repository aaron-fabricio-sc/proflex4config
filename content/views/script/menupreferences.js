/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ menupreferences.js 4.3.1-201021-21-23fb68fb-1a04bc7d
 */

/**
 * The menupreferences code-behind provides the life-cycle for the <i>menupreferences</i> view.
 * @module menupreferences
 * @since 1.0/10
 */
define(['jquery', 'code-behind/baseaggregate', 'extensions', 'vm-util/UIMovements', 'vm/MenuPreferencesViewModel'], function(jQuery, base, ext, objectManager) {
    console.log("AMD:menupreferences");

    const _logger = Wincor.UI.Service.Provider.LogProvider;

    return /** @alias module:menupreferences */ base.extend({
        name: "menupreferences",

        /**
         * Handler function for gesture recognition of "Press" (holding) of an element
         * @param ev
         * @param gestureElement
         * @param manager
         * @returns {boolean}
         */
        onPress: function(ev, gestureElement, manager) {
            let jEl = jQuery(gestureElement.element).children().last();
            gestureElement.toggleElementSize('prominentItem', 'nonProminentItem', jEl);
            gestureElement.hammertime.stop(true);
            return true;
        },

        /**
         * Handler function for gesture recognition of a Tap (click) on a main element
         * @param ev
         * @param gestureElement
         * @param manager
         */
        onTap: function(ev, gestureElement, manager) {
            const rec = manager.getElementsByContainer('window')[0].hammertime.get('pan');
            const contState = rec.options.enable;
            rec.set({enable: !contState});
            const items = manager.getElementsByContainer('flexArticle');
            const markerClass = 'wobbling';
            const buttonZone = jQuery(gestureElement.element);
            buttonZone.attr("data-selected", true);
            /* get the button div here and set/reset currentPreferencesButton*/
            let jEl = jQuery(gestureElement.element).children().last();
            jEl.toggleClass('currentPreferencesButton');
            const isActive = jEl.hasClass('currentPreferencesButton');
            // when selected, this single element is allowed to be dragged around
            gestureElement.hammertime.get('pan').set({enable: isActive});
            /*all other than selected have to get currentPreferenceButton removed*/
            items.filter(function(i) { return i !== gestureElement; }).forEach(function(item) {
                item.hammertime.get('pan').set({enable: false});
                jEl = jQuery(item.element);
                jEl.children().last().removeClass('currentPreferencesButton');
                jEl.attr("data-selected", false);
            });

            const itemsNotSelected = items.filter(function(i) { return !jQuery(i.element).children().last().hasClass('currentPreferencesButton'); });
            const nothingSelected = items.length === itemsNotSelected.length;
            items.forEach(function(item) {
                //item.hammertime.get('pan').set({enable: !nothingSelected});
                let $el = jQuery(item.element).children().last();
                if (nothingSelected) {
                    /*add jiggle class*/
                    $el.addClass(markerClass);
                } else {
                    $el.removeClass(markerClass);
                }
            });
            manager.getElementsByContainer('window').forEach(function(item) {
                item.hammertime.get('pan').set({enable: nothingSelected});
            });
            const pressRecognizer = gestureElement.hammertime.get('press');
            if (pressRecognizer) {
                pressRecognizer.set({enable: !isActive});
            }
        },

        /**
         * Handler function for gesture recognition of a Tap (click) on the min/max sub-element of a main element
         * @param ev
         * @param gestureElement
         * @param manager
         */
        onTapToggleSize: function(ev, gestureElement, manager) {
            // $el is the element to toggle the class for
            const $el = jQuery(gestureElement.element).parent().first();
            // gEl is the outer gestureElement using the grid
            const gEl = manager.getElementById($el.parent()[0].id);
            gEl.toggleElementSize('prominentItem', 'nonProminentItem', $el);
            return true;
        },

        /**
         * Instantiates the {@link Wincor.UI.Content.MenuPreferencesViewModel} viewmodel.
         * @see {@link module:baseaggregate.activate}.
         * @lifecycle view
         * @return {Promise} resolved when activation is ready.
         */
        activate: function() {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE menupreferences:activate");
            base.container.add(new Wincor.UI.Content.MenuPreferencesViewModel(), ["flexMain"]);
            return base.activate();
        }
    });
});
