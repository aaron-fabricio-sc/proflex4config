/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ BillPaymentPaymentCategorySelection.js 4.3.1-200512-21-e0b258da-1a04bc7d
 */

/**
 * @module flowactionplugins/BillPaymentPaymentCategorySelection
 */
define(["extensions"], function(ext) {
    "use strict";
    console.log("AMD:BillPaymentPaymentCategorySelection");

    const _dataService = Wincor.UI.Service.Provider.DataService;
    const _controlPanelService = Wincor.UI.Service.Provider.ControlPanelService;

    /*
    "CCHPFW_PROP_DISPLAY_VARIABLE[0]"
    "CCHPFW_PROP_DISPLAY_VARIABLE[1]"
    "CCHPFW_PROP_DISPLAY_VARIABLE[2]"
    "CCHPFW_PROP_DISPLAY_VARIABLE[3]"
    "CCHPFW_PROP_DISPLAY_VARIABLE[4]"
    "CCHPFW_PROP_DISPLAY_VARIABLE[5]"
    "CCHPFW_PROP_DISPLAY_VARIABLE[6]"
    "CCHPFW_PROP_DISPLAY_VARIABLE[7]"
    "CCHPFW_PROP_DISPLAY_VARIABLE[8]"
    "CCHPFW_PROP_DISPLAY_VARIABLE[9]"
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
                if(context.action !== "CANCEL") {
                    await _dataService.setValues("CCHPFW_PROP_DISPLAY_VARIABLE[53]", context.action, null);
                }
            } catch(e) {
                throw `FlowAction plug-in BillPaymentPaymentCategorySelection::onGuiResult has been failed ${e}`;
            }
        }
    };
});
