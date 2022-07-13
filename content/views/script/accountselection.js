/**
 @preserve
 Copyright (c) 2001-2021 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ accountselection.js 4.3.1-210511-21-5ea44998-1a04bc7d
 */

/**
 * The accountselection code-behind provides the life-cycle for the <i>accountselection</i> view.
 * @module accountselection
 * @since 1.0/00
 */
define(['code-behind/baseaggregate', 'vm/ListViewModel'], function(base) {
    console.log("AMD:accountselection");

    const _logger = Wincor.UI.Service.Provider.LogProvider;

    return /** @alias module:accountselection */ base.extend({
        name: "accountselection",

        /**
         * Instantiates the {@link Wincor.UI.Content.ListViewModel} viewmodel.
         * @see {@link module:baseaggregate.activate}.
         * @lifecycle view
         * @return {Promise} resolved when activation is ready.
         */
        activate: function() {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE accountselection:activate");
            base.container.add(new Wincor.UI.Content.ListViewModel(), ["flexMain", base.config.viewType === "softkey" ? {visibleLimits: {max: 4, leftOnly: true}} : void 0]);
            return base.activate();
        },

        /**
         * Overridden to zero the slide indicator on a softkey based layout.
         * @see {@link module:baseaggregate.compositionComplete}.
         * @lifecycle view
         */
        compositionComplete: function(view, parent) {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE accountselection:compositionComplete");
            base.compositionComplete(view, parent);
            base.container.whenActivated().then(() => {
                // code your specific stuff here
                if(base.container.viewHelper.viewType === "softkey") {
                    // initialize slide indicator for a the slide indicator group (optional)
                    base.container.viewHelper.moveSlideIndicator(0);
                }
            });
        },
    
        /**
         * Overridden to call {@link module:ObjectManager.reCalculateObjects}.
         * @see {@link module:baseaggregate.compositionUpdated}.
         * @lifecycle view
         */
        compositionUpdated: function() {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE accountselection:compositionUpdated");
            if (base.config.viewType === "touch") {
                Wincor.UI.Content.ObjectManager.reCalculateObjects(); // update the touch grid and scrollbars
            }
            base.compositionUpdated();
        }
    });
});
