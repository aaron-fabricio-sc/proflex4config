/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ pleasewait.js 4.3.1-201021-21-23fb68fb-1a04bc7d
 */

/**
 * The pleasewait code-behind provides the life-cycle for the <i>pleasewait</i> view (touch only).
 * @module pleasewait
 * @since 1.0/00
 */
define(['code-behind/baseaggregate', 'vm/MessageViewModel'], function(base) {
    console.log("AMD:pleasewait");

    const _logger = Wincor.UI.Service.Provider.LogProvider;

    return /** @alias module:pleasewait */ base.extend({
        name: "pleasewait",

        /**
         * Instantiates the {@link Wincor.UI.Content.MessageViewModel} viewmodel.
         * @see {@link module:baseaggregate.activate}.
         * @lifecycle view
         * @return {Promise} resolved when activation is ready.
         */
        activate: function() {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE pleasewait:activate");
            base.container.add(new Wincor.UI.Content.MessageViewModel(), "flexMain");
            return base.activate();
        },

        /**
         * Overridden.
         * @see {@link module:baseaggregate.deactivate}.
         * @lifecycle view
         */
        compositionComplete: function(view, parent) {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE pleasewait:compositionComplete");
            base.compositionComplete(view, parent);
            base.container.whenActivated().then(function() {
                // code your specific stuff here
            });
        }
    });
});

