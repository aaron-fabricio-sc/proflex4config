/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ AccountSelection.js 4.3.1-200512-21-e0b258da-1a04bc7d
 */
/**
 * @module flowactionplugins/AccountSelection
 */
define(["extensions"], function(ext) {
    "use strict";
    console.log("AMD:AccountSelection");

    const _dataService = Wincor.UI.Service.Provider.DataService;
    const PROP_FAC_OPTION = "CCTAFW_PROP_FAC_OPTION[1]";
    const PROP_CUSTOMER_INPUT_FROM_ACCOUNT = "CCTAFW_PROP_CUSTOMER_INPUT_VARIABLE[31]";
    const PROP_CUSTOMER_INPUT_TO_ACCOUNT = "CCTAFW_PROP_CUSTOMER_INPUT_VARIABLE[34]";
    const PROP_FUNC_SEL_CODE = "PROP_INTERNAL_FUNCTION_SELECTION";
    
    return {
    
        /**
         * Emulates a business logic flow action while the navigation target is running.
         * @param {Object} context is:<br>
         * <ul>
         * <li>currentViewKey  // function: the current view key (corresponding this this plug-in name)</li>
         * <li>config          // object: Configuration of Config.js</li>
         * <li>container       // object: ViewModelContainer</li>
         * <li>serviceProvider // object: a service provider reference</li>
         * </ul>
         * @returns {Promise} gets resolved when the action is ready or rejected on any error.
         */
        onActivateReady: async function(context) {
            try {
                let result = await _dataService.getValues([PROP_FUNC_SEL_CODE, PROP_FAC_OPTION, PROP_CUSTOMER_INPUT_FROM_ACCOUNT]);
                if(result[PROP_FUNC_SEL_CODE] === "TRA" && result[PROP_FAC_OPTION] === "2") {
                    // try to disable the source account, while the current list is meant to choose a destination account
                    let vm = context.container.getById("flexMain");
                    if(vm && vm.cmdRepos) {
                        let srcAcc = result[PROP_CUSTOMER_INPUT_FROM_ACCOUNT];
                        if(srcAcc in vm.cmdRepos.commands) {
                            vm.cmdRepos.setActive(srcAcc, false);
                        }
                    }
                }
            } catch(e) {
                throw `FlowAction plug-in Default::onActivateReady has been failed ${e}`;
            }
        },
    
        /**
         * Emulates a business logic flow action: Switch the UI language to the desired one.
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
                    let result = await _dataService.getValues([PROP_FUNC_SEL_CODE, PROP_FAC_OPTION]);
                    if(result[PROP_FUNC_SEL_CODE] === "TRA") {
                        let fromAccountOption = result[PROP_FAC_OPTION];
                        let valueToSet = "2";
                        let customerInputVariableToSet = PROP_CUSTOMER_INPUT_FROM_ACCOUNT;
                        if(fromAccountOption === "2") {
                            //after toAccount next is "unknown" to get out of the loop
                            valueToSet = "";
                            customerInputVariableToSet = PROP_CUSTOMER_INPUT_TO_ACCOUNT
                        }
                        await _dataService.setValues([PROP_FAC_OPTION, customerInputVariableToSet], [valueToSet, context.action]);
                    } else {
                        await _dataService.setValues(["CCTAFW_PROP_CUSTOMER_INPUT_VARIABLE[31]"], [context.action]);
                    }
                }
            } catch(e) {
                throw `FlowAction plug-in AccountSelection::onGuiResult has been failed ${e}`;
            }
        }
    };
});
