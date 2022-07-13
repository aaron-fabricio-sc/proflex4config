/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ OrderCurrenciesCurrencySelection.js 4.3.1-200122-21-0cd8a9f7-1a04bc7d
 */

/**
 * @module flowactionplugins/OrderCurrenciesCurrencySelection
 */
define(["extensions"], function(ext) {
    "use strict";
    console.log("AMD:OrderCurrenciesCurrencySelection");

    const _dataService = Wincor.UI.Service.Provider.DataService;
    const _controlPanelService = Wincor.UI.Service.Provider.ControlPanelService;

    return {

        /**
         * Emulates a business logic flow action when running:
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
            return ext.Promises.promise((resolve, reject) => {
                try {
                    resolve(); // nothing to do here
                }
                catch(e) {
                    reject("FlowAction plug-in OrderCurrenciesCurrencySelection::onActivateReady has been failed " + e);
                }
            });
        },

        /**
         * Emulates a hardware event action when running:
         * @param {Object} context is:<br>
         * <ul>
         * <li>currentViewKey  // function: the current view key (corresponding this this plug-in name)</li>
         * <li>config          // object: Configuration of Config.js</li>
         * <li>action          // the current action (hardware trigger action)</li>
         * <li>container       // object: ViewModelContainer</li>
         * <li>serviceProvider // object: a service provider reference</li>
         * </ul>
         * @returns {Promise} gets resolved when the action is ready or rejected on any error.
         */
        onHardwareEvent: async function(context) {
            try {
                return context.action; // nothing to do here
            } catch(e) {
                throw `FlowAction plug-in OrderCurrenciesCurrencySelection::onHardwareEvent has been failed ${e}`;
            }
        },

        /**
         * Emulates a business logic flow action: Set some receipt properties.
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
                if(context.action !== "CANCEL") {
                    if(_controlPanelService.getContext().cashInfosViewModel) {
                        if(context.action === "USD") {
                            _controlPanelService.getContext().cashInfosViewModel.currency("USD");
                            _controlPanelService.getContext().cashInfosViewModel.symbol("$");
                            _controlPanelService.getContext().cashInfosViewModel.submit(false);
                        } else if(context.action === "GBP") {
                            _controlPanelService.getContext().cashInfosViewModel.currency("GBP");
                            _controlPanelService.getContext().cashInfosViewModel.symbol("£");
                            _controlPanelService.getContext().cashInfosViewModel.submit(false);
                        }
                    }
                    
                    await _dataService.setValues("CCTAFW_PROP_CUSTOMER_INPUT_VARIABLE[48]", context.action);
                }
            } catch(e) {
                throw `FlowAction plug-in OrderCurrenciesCurrencySelection::onGuiResult has been failed ${e}`;
            }
        }
    };
});
