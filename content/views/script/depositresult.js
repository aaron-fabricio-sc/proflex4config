/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ depositresult.js 4.3.1-201021-21-23fb68fb-1a04bc7d
 */

/**
 * The depositresult code-behind provides the life-cycle for the <i>depositresult</i> view.
 * @module depositresult
 * @since 1.0/00
 */
define(['code-behind/baseaggregate', 'lib/jquery.throttle-debounce', 'vm/DepositResultViewModel'], function(base) {
    console.log("AMD:depositresult");

    const _logger = Wincor.UI.Service.Provider.LogProvider;

    return /** @alias module:depositresult */ base.extend({
        name: "depositresult",

        /**
         * Instantiates the {@link Wincor.UI.Content.DepositResultViewModel} viewmodel.
         * @see {@link module:baseaggregate.activate}.
         * @lifecycle view
         * @return {Promise} resolved when activation is ready.
         */
        activate: function() {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE depositresult:activate");
            base.container.add(new Wincor.UI.Content.DepositResultViewModel(), ["flexMain", base.config.viewType === "softkey" ? {visibleLimits: {min: 0, max: 4}} : void 0]);
            return base.activate();
        }
    });
});
