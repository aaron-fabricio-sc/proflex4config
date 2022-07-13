/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ DepositChequesResult.js 4.3.1-200512-21-e0b258da-1a04bc7d
 */

/**
 * @module flowactionplugins/DepositChequesResult
 */
define(["extensions", "./util/cashHelper"], function(ext, cashHelper) {
    "use strict";
    console.log("AMD:DepositChequesResult");
    
    const _dataService = Wincor.UI.Service.Provider.DataService;

    return {

        /**
         * Emulates a business logic flow action: Setup properties for the cheques summary after detailed cheques view
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
                if(context.action === "CONFIRM") {
                    let result = await _dataService.getValues(["CCCHCCDMTAFW_MEDIAONSTACKER"]);
                    let count = parseInt(result["CCCHCCDMTAFW_MEDIAONSTACKER"]);
                    let keys = [];
                    for(let i = 0; i < count; i++) {
                        keys.push(`CCCHCCDMTAFW_CHEQUE_ACCEPTED[${i}]`);
                        keys.push(`CCCHCCDMTAFW_AMOUNT[${i}]`);
                    }
                    result = await _dataService.getValues(keys);
                    let values = Object.values(result);
                    let sumAcceptedAmount = 0;
                    let sumAccepted = 0;
                    let sumDeclined = 0;
                    for(let i = 0; i < values.length; i += 2) {
                        if(values[i] === "true" || values[i] === "TRUE") { // accepted flag
                            sumAccepted++;
                            sumAcceptedAmount += parseInt(values[i + 1]); // amount
                        } else {
                            sumDeclined++
                        }
                    }
                    await _dataService.setValues(["CCTAFW_PROP_TRANSACTION_AMOUNT", "CCCHCCDMTAFW_SUM", "CCCHCCDMTAFW_MEDIAONSTACKER_ACCEPTED", "CCCHCCDMTAFW_MEDIAONSTACKER_DECLINED"],
                        [sumAcceptedAmount.toString(), sumAcceptedAmount.toString(), sumAccepted, sumDeclined], null);
                }
            } catch(e) {
                throw `FlowAction plug-in DepositChequesResult::onGuiResult has been failed ${e}`;
            }
        }
    };
});
