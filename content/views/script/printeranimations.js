/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ printeranimations.js 4.3.1-201021-21-23fb68fb-1a04bc7d
 */

/**
 * The printeranimations code-behind provides the life-cycle for the <i>printeranimations</i> view.
 * @module printeranimations
 * @since 1.0/00
 */
define(['code-behind/baseaggregate', 'vm/PrinterAnimationsViewModel'], function(base) {
    console.log("AMD:printeranimations");

    const _logger = Wincor.UI.Service.Provider.LogProvider;

    return /** @alias module:printeranimations */ base.extend({
        name: "printeranimations",

        /**
         * Instantiates the {@link Wincor.UI.Content.PrinterAnimationsViewModel} viewmodel.
         * @see {@link module:baseaggregate.activate}.
         * @lifecycle view
         * @return {Promise} resolved when activation is ready.
         */
        activate: function() {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE printeranimations:activate");
            base.container.add(new Wincor.UI.Content.PrinterAnimationsViewModel(), ["flexMain"]);
            return base.activate();
        },

        /**
         * Overridden.
         * @see {@link module:baseaggregate.compositionComplete}.
         * @lifecycle view
         */
        compositionComplete: function(view, parent) {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE printeranimations:compositionComplete");
            base.compositionComplete(view, parent);
            base.container.whenActivated().then(function() {
                // code your specific stuff here
            });
        }
    });
});
