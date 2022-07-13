/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ dualchoiceselection.js 4.3.1-201021-21-23fb68fb-1a04bc7d
 */

/**
 * The dualchoiceselection code-behind provides the life-cycle for the <i>dualchoiceselection</i> view.
 * @module dualchoiceselection
 * @since 2.0/20
 */
define(['jquery', 'knockout', 'code-behind/baseaggregate', 'vm/DualChoiceSelectionViewModel'], function($, ko, base) {
    console.log("AMD:dualchoiceselection");

    const _logger = Wincor.UI.Service.Provider.LogProvider;
    
    let _mainVM;

    return /** @alias module:dualchoiceselection */ base.extend({
        name: "dualchoiceselection",
    
        /**
         * Instantiates the {@link Wincor.UI.Content.DualChoiceSelectionViewModel}.
         * @see {@link module:baseaggregate.activate}.
         * @lifecycle view
         * @return {Promise} resolved when activation is ready.
         */
        activate: function() {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE dualchoiceselection:activate");
            _mainVM = new Wincor.UI.Content.DualChoiceSelectionViewModel();
            base.container.add(_mainVM, ["flexMain"]);
            return base.activate();
        },

        /**
         * Overridden to set all references to null.
         * @see {@link module:baseaggregate.deactivate}.
         * @lifecycle view
         */
        deactivate: function() {
            _mainVM = null;
        },

        /**
         * Overridden to zero the slide indicator on a softkey based layout.
         * @see {@link module:baseaggregate.compositionComplete}.
         * @lifecycle view
         */
        compositionComplete: async function(view, parent) {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE dualchoiceselection:compositionComplete");
            base.compositionComplete(view, parent);
            await base.container.whenActivated();
        }
    });
});

