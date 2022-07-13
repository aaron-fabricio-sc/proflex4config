/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ PrepaidMinuteConfirmation.js 4.3.1-200512-21-e0b258da-1a04bc7d
 */

/**
 * @module flowactionplugins/PrepaidMinuteConfirmation
 */
define(["extensions"], function(ext) {
    "use strict";
    console.log("AMD:PrepaidMinuteConfirmation");

    /*
        CCTAFW_PROP_CUSTOMER_INPUT_VARIABLE[64]
        "CCTAFW_PROP_CUSTOMER_INPUT_VARIABLE[42]"
        "CCTAFW_PROP_CUSTOMER_INPUT_VARIABLE[43]"
    */
    
    return {
    
        /**
         * Emulates a business logic flow action:
         * @param {Object} context is:<br>
         * <ul>
         * <li>currentViewKey  // the current view key (corresponding this this plug-in name)</li>
         * <li>currentFlow     // the current flow</li>
         * <li>action          // the current action (customer selection)</li>
         * <li>config          // Configuration of Config.js</li>
         * <li>container       // ViewModelContainer</li>
         * <li>serviceProvider // a service provider reference</li>
         * </ul>
         * @returns {Promise} gets resolved (may argument a new view key destination) when the action is ready or rejected on any error.
         */
        onGuiResult: async function(context) {
            try {
                if(context.action === "YES") {
                }
            } catch(e) {
                throw `FlowAction plug-in PrepaidMinuteConfirmation::onGuiResult has been failed ${e}`;
            }
        }
    };
});
