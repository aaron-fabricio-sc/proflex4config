/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ AssistanceDepositChequesApprovalInfo.js 4.3.1-200122-21-0cd8a9f7-1a04bc7d
 */
/**
 * @module flowactionplugins/AssistanceDepositChequesApprovalInfo
 */
define(["extensions"], function(ext) {
    "use strict";
    console.log("AMD:AssistanceDepositChequesApprovalInfo");

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
                    _dataService.updateValues("CCHPFW_PROP_POLLING_STATUS", "TRANSACTION_PENDING");
                    setTimeout(() => {
                        if(context.currentViewKey() === "AssistanceDepositChequesApprovalInfo") { // check whether we are in current view or already navigated to next one
                            _dataService.updateValues("CCHPFW_PROP_POLLING_STATUS", "TRANSACTION_CLAIMED");
                            setTimeout(() => {
                                //if(context.currentViewKey() === "AssistanceDepositChequesApprovalInfo") { // check whether we are in current view or already navigated to next one
                                    //_dataService.updateValues("CCHPFW_PROP_POLLING_STATUS", "TRANSACTION_PENDING_AGAIN");
                                    //setTimeout(() => {
                                        //if(context.currentViewKey() === "AssistanceDepositChequesApprovalInfo") { // check whether we are in current view or already navigated to next one
                                            //_dataService.updateValues("CCHPFW_PROP_POLLING_STATUS", "TRANSACTION_CLAIMED");
                                            //setTimeout(() => {
                                                if(context.currentViewKey() === "AssistanceDepositChequesApprovalInfo") { // check whether we are in current view or already navigated to next one
                                                    _dataService.updateValues("CCHPFW_PROP_POLLING_STATUS", "TRANSACTION_PROCESSED");
                                                    setTimeout(() => resolve(), 5000);
                                                }
                                            //}, 5000);
                                        //}
                                    //}, 5000);
                                //}
                            }, 5000);
                        }
                    }, 2000);
                }
                catch(e) {
                    reject("FlowAction plug-in AssistanceDepositChequesApprovalInfo::onActivateReady has been failed " + e);
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
                    resolve(context.action);    // nothing to do here
                }
                catch(e) {
                    reject("FlowAction plug-in AssistanceDepositChequesApprovalInfo::onHardwareEvent has been failed " + e);
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
        onGuiResult: function(context) {
            return ext.Promises.promise((resolve, reject) => {
                try {
                    resolve(); // nothing to do here
                }
                catch(e) {
                    reject("FlowAction plug-in AssistanceDepositChequesApprovalInfo::onGuiResult has been failed " + e);
                }
            });
        }
    };
});
