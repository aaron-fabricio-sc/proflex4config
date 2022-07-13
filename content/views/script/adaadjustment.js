/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ adaadjustment.js 4.3.1-201021-21-23fb68fb-1a04bc7d
 */

/**
 * The adaadjustment code-behind provides the life-cycle for the <i>adaadjustment</i> view.
 * @module adaadjustment
 * @since 1.0/00
 */
define(['code-behind/baseaggregate', 'vm/AdaAdjustmentViewModel'], function(base) {
    console.log("AMD:adaadjustment");

    const _logger = Wincor.UI.Service.Provider.LogProvider;

    return /** @alias module:adaadjustment */ base.extend({
        name: "adaadjustment",

        /**
         * Instantiates the {@link Wincor.UI.Content.AdaAdjustmentViewModel} viewmodel.
         * @see {@link module:baseaggregate.activate}.
         * @lifecycle view
         * @return {Promise} resolved when activation is ready.
         */
        activate: function() {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE adaadjustment:activate");
            base.container.add(new Wincor.UI.Content.AdaAdjustmentViewModel(), ["flexMain"]);
            return base.activate();
        }
    });
});
