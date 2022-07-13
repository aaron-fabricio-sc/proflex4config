/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ emvtransactions.js 4.3.1-201021-21-23fb68fb-1a04bc7d
 */
/**
 * The emvtransactions code-behind provides the life-cycle for the <i>emvtransactions</i> view.
 * @module emvtransactions
 * @since 2.0/00
 */
define(['code-behind/baseaggregate', 'lib/jquery.throttle-debounce', 'vm/EmvTransactionsViewModel'], function(base) {
    console.log("AMD:emvtransactions");

    const _logger = Wincor.UI.Service.Provider.LogProvider;

    return /** @alias module:emvtransactions */ base.extend({
        name: "emvtransactions",

        /**
         * Instantiates the {@link Wincor.UI.Content.EmvTransactionsViewModel} viewmodel.
         * @see {@link module:baseaggregate.activate}.
         * @lifecycle view
         * @return {Promise} resolved when activation is ready.
         */
        activate: function() {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE emvtransactions:activate");
            base.container.add(new Wincor.UI.Content.EmvTransactionsViewModel(), ["flexMain", base.config.viewType === "softkey" ? {visibleLimits: {max: 6, min:0}} : void 0]);
            return base.activate();
        },

        /**
         * Overridden to call the reCalculateObjects of the ObjectManager.
         * @see {@link module:baseaggregate.compositionComplete}.
         * @lifecycle view
         */
        compositionUpdated: function(redraw) {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE emvtransactions:compositionUpdated");
            base.compositionUpdated(redraw);

            if(base.config.viewType === "touch") {
                Wincor.UI.Content.ObjectManager.reCalculateObjects(); // update the touch grid and scrollbars
            }
        }
    });
});
