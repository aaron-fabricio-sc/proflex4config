/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ mobiletransaction.js 4.3.1-201021-21-23fb68fb-1a04bc7d
 */

/**
 * The mobiletransaction code-behind provides the life-cycle for the <i>mobiletransaction</i> view.
 * @module mobiletransaction
 * @since 2.0/00
 */
define(['code-behind/baseaggregate', 'vm/MessageViewModel'], function(base) {
    console.log("AMD:mobiletransaction");

    const _logger = Wincor.UI.Service.Provider.LogProvider;

    return /** @alias module:mobiletransaction */ base.extend({
        name: "mobiletransaction",

        /**
         * Instantiates the {@link Wincor.UI.Content.MessageViewModel} viewmodel.
         * @see {@link module:baseaggregate.activate}.
         * @lifecycle view
         * @return {Promise} resolved when activation is ready.
         */
        activate: function() {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE mobiletransaction:activate");
            base.container.add(new Wincor.UI.Content.MessageViewModel(), ["flexMain"]);
            return base.activate();
        }
    });
});
