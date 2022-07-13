/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ outofservice.js 4.3.1-201021-21-23fb68fb-1a04bc7d
 */

/**
 * The outofservice code-behind provides the life-cycle for the <i>outofservice</i> view.
 * @module outofservice
 * @since 1.0/00
 */
define(['code-behind/baseaggregate', 'basevm'], function(base) {
    console.log("AMD:outofservice");

    const _logger = Wincor.UI.Service.Provider.LogProvider;

    return /** @alias module:outofservice */ base.extend({
        name: "outofservice",

        /**
         * Instantiates the {@link Wincor.UI.Content.BaseViewModel} viewmodel.
         * @see {@link module:baseaggregate.activate}.
         * @lifecycle view
         * @return {Promise} resolved when activation is ready.
         */
        activate: function() {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE outofservice:activate");
            base.container.add(new Wincor.UI.Content.BaseViewModel(), "flexMain");
            return base.activate();
        },

        /**
         * Overridden to handle the offline case and to hide a possible <i>txnBackground</i> style.
         * @see {@link module:baseaggregate.compositionComplete}.
         * @lifecycle view
         */
        compositionComplete: function(view, parent) {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE outofservice:compositionComplete");
            base.compositionComplete(view, parent);
            base.container.whenActivated().then(function() {
                base.jQuery('#txnBackground').css("display", "none");
                base.jQuery('div[data-view-id]').attr("data-txn-background", "false");
                // code your specific stuff here
            });
        }
    });
});

