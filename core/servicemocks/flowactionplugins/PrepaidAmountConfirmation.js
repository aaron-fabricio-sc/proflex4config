/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ PrepaidAmountConfirmation.js 4.3.1-200512-21-e0b258da-1a04bc7d
 */

/**
 * @module flowactionplugins/PrepaidAmountConfirmation
 */
define(["extensions"], function(ext) {
    "use strict";
    console.log("AMD:PrepaidAmountConfirmation");

    const _dataService = Wincor.UI.Service.Provider.DataService;

    
    let transAmount;
    
    /*
        CCTAFW_PROP_TRANSACTION_AMOUNT
        "CCTAFW_PROP_CUSTOMER_INPUT_VARIABLE[42]"
        "CCTAFW_PROP_CUSTOMER_INPUT_VARIABLE[43]"
    */
    
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
                let res = await _dataService.getValues([
                    "CCTAFW_PROP_TRANSACTION_AMOUNT", // this prop is (unfortunately) stored viewkey specific and thus...
                    "CCHPFW_PROP_DISPLAY_VARIABLE[0]" // ...we read this prop as well
                ]);
                // save values:
                transAmount = res["CCTAFW_PROP_TRANSACTION_AMOUNT"];
                // copy value
                await _dataService.setValues("CCTAFW_PROP_TRANSACTION_AMOUNT", res["CCHPFW_PROP_DISPLAY_VARIABLE[0]"], null);
            } catch(e) {
                throw `FlowAction plug-in PrepaidAmountConfirmation::onPrepare has been failed ${e}`;
            }
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
                if(context.action === "YES") {
                    // NOTE: Unfortunately CCTAFW_PROP_TRANSACTION_AMOUNT is set viewkey specific for PrepaidAmountConfirmation in BusinessData.json
                    await _dataService.setValues(["CCTAFW_PROP_TRANSACTION_AMOUNT", "CCHPFW_PROP_DISPLAY_VARIABLE[0]"], [transAmount, ""], null);
                }
            } catch(e) {
                throw `FlowAction plug-in PrepaidAmountConfirmation::onGuiResult has been failed ${e}`;
            }
        }
    };
});
