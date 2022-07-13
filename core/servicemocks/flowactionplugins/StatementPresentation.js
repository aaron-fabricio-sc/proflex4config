/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ StatementPresentation.js 4.3.1-200512-21-e0b258da-1a04bc7d
 */

/**
 * @module flowactionplugins/StatementPresentation
 */
define(["extensions", "./util/pluginHelper", "./util/cashHelper"], function(ext, plugInHelper, cashHelper) {
    "use strict";
    console.log("AMD:StatementPresentation");

    
    return {

        /**
         * Emulates a business logic flow action when running: Sends an event when card return 'HALFTIMEOUT'.
         * @param {Object} context is:<br>
         * <ul>
         * <li>currentViewKey  // function: the current view key (corresponding this this plug-in name)</li>
         * <li>config          // object: Configuration of Config.js</li>
         * <li>container       // object: ViewModelContainer</li>
         * <li>serviceProvider // object: a service provider reference</li>
         * </ul>
         * @returns {Promise} gets resolved when the action is ready or rejected on any error.
         */
        onActivateReady: async function(context) {
            try {
                return await plugInHelper.processTimeout(context, 7000, 6000, 5000);
            } catch(e) {
                throw `FlowAction plug-in StatementPresentation::onActivateReady has been failed ${e}`;
            }
        },
    
        /**
         * Emulates a business logic flow action: Default.
         * @param {Object} context is:<br>
         * <ul>
         * <li>currentViewKey  // function: the current view key (corresponding this this plug-in name)</li>
         * <li>currentFlow     // object: the current flow</li>
         * <li>action          // string: the current action (customer selection)</li>
         * <li>config          // object: Configuration of Config.js</li>
         * <li>container       // object: ViewModelContainer</li>
         * <li>serviceProvider // object: a service provider reference</li>
         * </ul>
         * @returns {Promise} gets resolved (may argument a new view key destination) when the action is ready or rejected on any error.
         */
        onGuiResult: async function(context) {
            try {
                // Do any default stuff her if no particular plug-in is available...
                await Promise.resolve(); // delete this line
            } catch(e) {
                throw `FlowAction plug-in StatementPresentation::onGuiResult has been failed ${e}`;
            }
        }
    };
});
