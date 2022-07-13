/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ PrepaidProviderSelection.js 4.3.1-200512-21-e0b258da-1a04bc7d
 */

/**
 * @module flowactionplugins/PrepaidProviderSelection
 */
define(["extensions"], function(ext) {
    "use strict";
    console.log("AMD:PrepaidProviderSelection");

    const _dataService = Wincor.UI.Service.Provider.DataService;
    
    /*
        CCTAFW_PROP_TRANSACTION_AMOUNT
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
                if(context.action !== "CANCEL") {
                    let result = await _dataService.getValues("CCTAFW_PROP_LISE_INDEX");
                    let idx = parseInt(result["CCTAFW_PROP_LISE_INDEX"]);
                    result = context.container.getById("flexMain").dataList.items()[idx].result;
                    await _dataService.setValues("CCTAFW_PROP_CUSTOMER_INPUT_VARIABLE[42]", result, null);
                }
            } catch(e) {
                throw `FlowAction plug-in PrepaidProviderSelection::onGuiResult has been failed ${e}`;
            }
        }
    };
});
