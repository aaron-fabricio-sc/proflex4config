/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ BillPaymentDataConfirmation.js 4.3.1-200512-21-e0b258da-1a04bc7d
 */

/**
 * @module flowactionplugins/BillPaymentDataConfirmation
 */
define(["extensions"], function(ext) {
    "use strict";
    console.log("AMD:BillPaymentDataConfirmation");

    const _dataService = Wincor.UI.Service.Provider.DataService;

    
    let receiverName,
        targetAcc,
        refNo,
        requestedAmount;
    
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
                    "CCTAFW_PROP_TRANSACTION_AMOUNT",
                    "CCTAFW_PROP_CUSTOMER_INPUT_VARIABLE[53]",
                    "CCTAFW_PROP_CUSTOMER_INPUT_VARIABLE[54]",
                    "CCTAFW_PROP_CUSTOMER_INPUT_VARIABLE[55]",
                    "CCHPFW_PROP_DISPLAY_VARIABLE[0]",
                    "CCHPFW_PROP_DISPLAY_VARIABLE[3]",
                    "CCHPFW_PROP_DISPLAY_VARIABLE[4]",
                    "CCHPFW_PROP_DISPLAY_VARIABLE[9]"
                    
                ]);
                // save values:
                receiverName = res["CCHPFW_PROP_DISPLAY_VARIABLE[0]"];
                refNo = res["CCHPFW_PROP_DISPLAY_VARIABLE[3]"];
                requestedAmount = res["CCHPFW_PROP_DISPLAY_VARIABLE[4]"];
                targetAcc = res["CCHPFW_PROP_DISPLAY_VARIABLE[9]"];
                // copy values:
                await _dataService.setValues([
                    "CCHPFW_PROP_DISPLAY_VARIABLE[0]",
                    "CCHPFW_PROP_DISPLAY_VARIABLE[3]",
                    "CCHPFW_PROP_DISPLAY_VARIABLE[4]",
                    "CCHPFW_PROP_DISPLAY_VARIABLE[9]"

                ], [
                    res["CCTAFW_PROP_CUSTOMER_INPUT_VARIABLE[53]"],
                    res["CCTAFW_PROP_CUSTOMER_INPUT_VARIABLE[55]"],
                    res["CCTAFW_PROP_TRANSACTION_AMOUNT"],
                    res["CCTAFW_PROP_CUSTOMER_INPUT_VARIABLE[54]"],
                ]);
            } catch(e) {
                throw `FlowAction plug-in BillPaymentDataConfirmation::onPrepare has been failed ${e}`;
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
                if(context.action !== "YES") {
                    // restore variables
                    await _dataService.setValues([
                        "CCHPFW_PROP_DISPLAY_VARIABLE[0]",
                        "CCHPFW_PROP_DISPLAY_VARIABLE[3]",
                        "CCHPFW_PROP_DISPLAY_VARIABLE[4]",
                        "CCHPFW_PROP_DISPLAY_VARIABLE[9]"
    
                    ], [
                        receiverName,
                        refNo,
                        requestedAmount,
                        targetAcc
                    ]);
    
                }
            } catch(e) {
                throw `FlowAction plug-in BillPaymentDataConfirmation::onGuiResult has been failed ${e}`;
            }
        }
    };
});
