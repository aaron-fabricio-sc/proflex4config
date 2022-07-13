/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ miniflow.js 4.3.1-201021-21-23fb68fb-1a04bc7d
 */

/**
 * @module miniflow
 */
define(['code-behind/baseaggregate', 'knockout', 'jquery', 'durandal/system', 'vm/MiniFlowViewModel', 'vm-util/VirtualKeyboardViewModel'], function(base, ko, jQuery, system) {
    console.log("AMD:miniflow");

    //var router = require('plugins/router');
    var _logger = Wincor.UI.Service.Provider.LogProvider;

    return /** @alias module:miniflow */ base.extend({
    
        /**
         * See {@link module:baseaggregate.activate}.
         *
         * Instantiates the {@link Wincor.UI.Content.VirtualKeyboardViewModel}, too.
         *
         * @lifecycle viewmodel
         */
        activate: function() {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE miniflow:activate");
            base.container.add(new Wincor.UI.Content.MiniFlowViewModel(), "flexMain");
            base.container.add(new Wincor.UI.Content.VirtualKeyboardViewModel(), {});
            return base.activate();
        }
    });
});