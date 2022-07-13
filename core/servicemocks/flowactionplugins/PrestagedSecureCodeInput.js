/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ PrestagedSecureCodeInput.js 4.3.1-200122-21-0cd8a9f7-1a04bc7d
 */

/**
 * @module flowactionplugins/PrestagedSecureCodeInput
 */
define(["extensions"], function(ext) {
    "use strict";
    console.log("AMD:PrestagedSecureCodeInput");

    const _dataService = Wincor.UI.Service.Provider.DataService;
    const PROP_FUNC_SEL_CODE = "PROP_INTERNAL_FUNCTION_SELECTION";

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
                    reject("FlowAction plug-in PrestagedSecureCodeInput::onActivateReady has been failed " + e);
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
                    reject("FlowAction plug-in PrestagedSecureCodeInput::onHardwareEvent has been failed " + e);
                }
            });
        },

        /**
         * Emulates a business logic flow action: Set the internal function selection to the selected action.
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
                    await _dataService.setValues([PROP_FUNC_SEL_CODE, "CCTAFW_PROP_NOTE_DISPENSE_AMOUNT", "CCTAFW_PROP_DISPENSE_AMOUNT"], ["COUT_PRESTAGED", "8000", "8000"]); // set an amount for the prestaged txn
                }
            } catch(e) {
                throw `FlowAction plug-in PrestagedSecureCodeInput::onGuiResult has been failed ${e}`;
            }
        }
    };
});
