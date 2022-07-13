/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ ClearPreferencesMultipleChoiceSelection.js 4.3.1-200122-21-0cd8a9f7-1a04bc7d
 */

/**
 * @module flowactionplugins/ClearPreferencesMultipleChoiceSelection
 */
define(["extensions"], function(ext) {
    "use strict";
    console.log("AMD:ClearPreferencesMultipleChoiceSelection");

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
                    reject("FlowAction plug-in ClearPreferencesMultipleChoiceSelection::onActivateReady has been failed " + e);
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
                    reject("FlowAction plug-in ClearPreferencesMultipleChoiceSelection::onHardwareEvent has been failed " + e);
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
                    let receiptPrefValues = Array(data.length).fill("");
                    for(let i = 0; i < data.length; i++) {
                        receiptPrefKeys[i] = `CCTAFW_PROP_GENERIC_STRING_LIST[${i + 1}]`;
                    }
                    action.forEach((res, idx) => {
                        let item = data.find(item => {
                            return item.result === res;
                        });
                        if(item) {
                            receiptPrefValues[idx] = item.result;
                        }
                    });
                    await _dataService.setValues(receiptPrefKeys, receiptPrefValues);
                }
            } catch(e) {
                throw `FlowAction plug-in ClearPreferencesMultipleChoiceSelection::onGuiResult has been failed ${e}`;
            }
        }
    };
});
