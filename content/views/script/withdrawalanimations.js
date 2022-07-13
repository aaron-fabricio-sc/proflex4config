/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ withdrawalanimations.js 4.3.1-201021-21-23fb68fb-1a04bc7d
 */

/**
 * The withdrawalanimations code-behind provides the life-cycle for the <i>withdrawalanimations</i> view.
 * @module withdrawalanimations
 * @since 1.0/00
 */
define(['code-behind/baseaggregate', 'vm/WithdrawalAnimationsViewModel'], function(base) {
    console.log("AMD:withdrawalanimations");

    const _logger = Wincor.UI.Service.Provider.LogProvider;

    return /** @alias module:withdrawalanimations */ base.extend({
        name: "withdrawalanimations",

        /**
         * Instantiates the {@link Wincor.UI.Content.WithdrawalAnimationsViewModel} viewmodel.
         * @see {@link module:baseaggregate.activate}.
         * @lifecycle view
         * @return {Promise} resolved when activation is ready.
         */
        activate: function() {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE withdrawalanimations:activate");
            base.container.add(new Wincor.UI.Content.WithdrawalAnimationsViewModel(), "flexMain");
            return base.activate();
        },

        /**
         * Overridden.
         * @see {@link module:baseaggregate.compositionComplete}.
         * @lifecycle view
         */
        compositionComplete: function(view, parent) {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE withdrawalanimations:compositionComplete");
            base.compositionComplete(view, parent);
            base.container.whenActivated().then(function() {
                // code your specific stuff here
            });
        }
    });
});
