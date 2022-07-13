/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ WithdrawalMixtureSelection.js 4.3.1-210202-21-d2845e27-1a04bc7d
 */

/**
 * @module flowactionplugins/WithdrawalMixtureSelection
 */
define(["extensions", "./util/cashHelper"], function(ext, cashHelper) {
    "use strict";
    console.log("AMD:WithdrawalMixtureSelection");

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
                await cashHelper.createCashMixture(context, "WithdrawalMixtureSelection", "onPrepare");
            } catch(e) {
                throw `FlowAction plug-in WithdrawalMixtureSelection has been failed ${e}`;
            }
        },

        /**
         * Emulates a business logic flow action: nothing.
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
                if(context.action === "CONFIRM") {
                    await _dataService.setValues(["PROP_PENULTIMATE_VIEWKEY"], ["WithdrawalMixtureSelection"]);
                } else if(context.action === "CANCEL") {
                    await _dataService.setValues(["PROP_PENULTIMATE_ACTION", "PROP_INTERNAL_FUNCTION_SELECTION"], [context.action, ""], null);
                }
            } catch(e) {
                throw `FlowAction plug-in WithdrawalMixtureSelection::onGuiResult has been failed ${e}`;
            }
        }

    };
});
