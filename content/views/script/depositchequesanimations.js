/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ depositchequesanimations.js 4.3.1-201021-21-23fb68fb-1a04bc7d
 */


/**
 * The depositchequesanimations code-behind provides the life-cycle for the <i>depositchequesanimations</i> view.
 * @module depositchequesanimations
 * @since 1.0/10
 */
define(['code-behind/baseaggregate', 'vm/DepositChequesAnimationsViewModel'], function(base) {
    console.log("AMD:depositchequesanimations");

    const _logger = Wincor.UI.Service.Provider.LogProvider;

    return /** @alias module:depositchequesanimations */ base.extend({
        name: "depositchequesanimations",

        /**
         * Instantiates the {@link Wincor.UI.Content.DepositChequesAnimationsViewModel} viewmodel.
         * @see {@link module:baseaggregate.activate}.
         * @lifecycle view
         * @return {Promise} resolved when activation is ready.
         */
        activate: function() {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE depositchequesanimations:activate");
            base.container.add(new Wincor.UI.Content.DepositChequesAnimationsViewModel(), ["flexMain"]);
            return base.activate();
        },

        /**
         * Overridden.
         * @see {@link module:baseaggregate.compositionComplete}.
         * @lifecycle view
         */
        compositionComplete: function(view, parent) {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE depositchequesanimations:compositionComplete");
            base.compositionComplete(view, parent);
            base.container.whenActivated().then(() => {
                // code your specific stuff here
            });
        }
    });
});
