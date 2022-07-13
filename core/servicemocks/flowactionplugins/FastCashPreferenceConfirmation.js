/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ FastCashPreferenceConfirmation.js 4.3.1-200512-21-e0b258da-1a04bc7d
 */

/**
 * @module flowactionplugins/FastCashPreferenceConfirmation
 */
define(["extensions"], function(ext) {
    "use strict";
    console.log("AMD:FastCashPreferenceConfirmation");

    const _dataService = Wincor.UI.Service.Provider.DataService;
    const _controlPanelService = Wincor.UI.Service.Provider.ControlPanelService;

    return {

        /**
         * Emulates a business logic flow action when running: Resets the internal function selection code.
         * @param {Object} context is:<br>
         * <ul>
         * <li>currentViewKey  // function: the current view key (corresponding this this plug-in name)</li>
         * <li>config          // object: Configuration of Config.js</li>
         * <li>container       // object: ViewModelContainer</li>
         * <li>serviceProvider // object: a service provider reference</li>
         * </ul>
         * @returns {Promise} gets resolved when the action is ready or rejected on any error.
         */
        onActivateReady: function(context) {
            return ext.Promises.promise(async (resolve, reject) => {
                try {
                    resolve();
                } catch(e) {
                    reject("FlowAction plug-in FastCashPreferenceConfirmation::onActivateReady has been failed " + e);
                }
            });
        },

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
                if(context.action !== "YES") {
                    if(_controlPanelService.getContext().cashInfosViewModel) {
                        let amount = 5000;
                        _controlPanelService.getContext().cashInfosViewModel.fastCashAmount(amount);
                        amount = amount * Math.pow(10, parseInt(_controlPanelService.getContext().cashInfosViewModel.exponent()));
                        await _dataService.setValues("CCTAFW_PROP_COUTFAST_AMOUNT[1]", amount, null);
                    }
                }
            } catch(e) {
                throw `FlowAction plug-in FastCashPreferenceConfirmation::onGuiResult has been failed ${e}`;
            }
        }
    };
});
