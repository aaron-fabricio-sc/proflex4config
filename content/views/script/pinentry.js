/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ pinentry.js 4.3.1-201021-21-23fb68fb-1a04bc7d
 */

/**
 * The pinentry code-behind provides the life-cycle for the <i>pinentry</i> view.
 * @module pinentry
 * @since 1.0/00
 */
define(['code-behind/baseaggregate', 'vm/PinEntryViewModel'], function(base) {
    console.log("AMD:pinentry");

    const _logger = Wincor.UI.Service.Provider.LogProvider;

    return /** @alias module:pinentry */ base.extend({
        name: "pinentry",

        /**
         * Instantiates the {@link Wincor.UI.Content.PinEntryViewModel} viewmodel.
         * @see {@link module:baseaggregate.activate}.
         * @lifecycle view
         * @return {Promise} resolved when activation is ready.
         */
        activate: function() {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE pinentry:activate");
            base.container.add(new Wincor.UI.Content.PinEntryViewModel(), ["flexMain"]);
            return base.activate();
        },

        /**
         * Overridden to disable the <i>pinDigitsArea</i>.
         * @see {@link module:baseaggregate.deactivate}.
         * @lifecycle view
         */
        deactivate: function() {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE pinentry:deactivate");
            jQuery("#pinDigitsArea").addClass("disabledElement");
            base.deactivate();
        }
    });
});
