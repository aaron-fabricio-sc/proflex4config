/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ DepositResult.js 4.3.1-200122-21-0cd8a9f7-1a04bc7d
 */

/**
 * @module flowactionplugins/DepositResult
 */
define(["extensions", "./util/cashHelper"], function(ext, cashHelper) {
    "use strict";
    console.log("AMD:DepositResult");

    const _dataService = Wincor.UI.Service.Provider.DataService;

    return {

        /**
         * Emulates a business logic step for preparation purpose.
         * @param {Object} context is:<br>
         * <ul>
         * <li>currentViewKey  // function: the current view key (corresponding this plug-in name)</li>
         * <li>viewConfig      // object: Configuration of the view (ViewMapping.json)</li>
         * <li>container       // object: ViewModelContainer</li>
         * <li>serviceProvider // object: a service provider reference</li>
         * </ul>
         * @returns {Promise} gets resolved when the action is ready or rejected on any error.
         */
        onPrepare: async function(context) {
            try {
                await cashHelper.updateDepositCommandStates("0", "0");
            } catch(e) {
                throw `FlowAction plug-in DepositResult::onPrepare has been failed ${e}`;
            }
        },

        /**
         * Emulates a business logic flow action when running: Sends an event when deposit retract 'ROLLBACKL3'.
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
                cashHelper.resetTrayIOReason();
            } catch(e) {
                throw `FlowAction plug-in DepositResult::onActivateReady has been failed ${e}`;
            }
        },

        /**
         * Emulates a business logic flow action: Sets the CCHPFW_PROP_APPROVAL_AMOUNT.
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
               if(context.action === "CONFIRM_DEPOSIT") {
                   let denom = await cashHelper.getDepositL4Amount();
                   await _dataService.setValues(["CCHPFW_PROP_APPROVAL_AMOUNT"], [(parseInt(denom.value) * parseInt(denom.count)).toString()]);
               }
           } catch(e) {
               throw `FlowAction plug-in DepositResult::onGuiResult has been failed ${e}`;
           }
        }
    };
});
