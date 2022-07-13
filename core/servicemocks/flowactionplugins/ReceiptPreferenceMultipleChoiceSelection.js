/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ ReceiptPreferenceMultipleChoiceSelection.js 4.3.1-200122-21-0cd8a9f7-1a04bc7d
 */

/**
 * @module flowactionplugins/ReceiptPreferenceMultipleChoiceSelection
 */
define(["extensions"], function(ext) {
    "use strict";
    console.log("AMD:ReceiptPreferenceMultipleChoiceSelection");

    const _dataService = Wincor.UI.Service.Provider.DataService;

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
                    reject("FlowAction plug-in ReceiptPreferenceMultipleChoiceSelection::onActivateReady has been failed " + e);
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
        onHardwareEvent: function(context) {
            return ext.Promises.promise((resolve, reject) => {
                try {
                    resolve(context.action); // nothing to do here
                }
                catch(e) {
                    reject("FlowAction plug-in ReceiptPreferenceMultipleChoiceSelection::onHardwareEvent has been failed " + e);
                }
            });
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
                    let data = await _dataService.getValues("CCTAFW_PROP_GENERIC_LIST_SELECTION_JSON_GROUPS");
                    data = JSON.parse(data["CCTAFW_PROP_GENERIC_LIST_SELECTION_JSON_GROUPS"]);
                    data = data.groups[0].items;
                    let action = context.action.split(",");
                    let receiptPrefKeys = [];
                    let receiptPrefDetailKeys = [];
                    let receiptPrefValues = Array(7).fill("");
                    let receiptPrefDetailValues = Array(7).fill("");
                    for(let i = 0; i < 7; i++) {
                        receiptPrefKeys[i] = `CCTAFW_PROP_RECEIPT_PREFERENCE[${i + 1}]`;
                        receiptPrefDetailKeys[i] = `CCTAFW_PROP_RECEIPT_PREFERENCE_DETAILS[${i + 1}]`;
                    }
                    action.forEach((res, idx) => {
                        let item = data.find(item => {
                            return item.result === res;
                        });
                        if(item) {
                            receiptPrefValues[idx] = item.result;
                            receiptPrefDetailValues[idx] = item.value;
                        }
                    });
                    await _dataService.setValues(receiptPrefKeys.concat(receiptPrefDetailKeys), receiptPrefValues.concat(receiptPrefDetailValues));
                }
            } catch(e) {
                throw `FlowAction plug-in ReceiptPreferenceMultipleChoiceSelection::onGuiResult has been failed ${e}`;
            }
        }
    };
});
