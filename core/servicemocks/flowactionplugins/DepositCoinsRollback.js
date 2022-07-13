/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ DepositCoinsRollback.js 4.3.1-210505-21-c0d9f31f-1a04bc7d
 */
/**
 * @module flowactionplugins/DepositCoinsRollback
 */
define(["extensions", "./util/cashHelper"], function(ext, cashHelper) {
    "use strict";
    console.log("AMD:DepositCoinsRollback");

    const _dataService = Wincor.UI.Service.Provider.DataService;
    const _eventService = Wincor.UI.Service.Provider.EventService;
    const EVENT_INFO = _eventService.getEventInfo("TRANSACTION_MODULE");
    
    const TIMEOUT_SENDING_DEPOSIT_EVENT = 6000; // -1 don't send event
    
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
                await cashHelper.updateDepositCommandStates("3", "3");
            }
            catch(e) {
                throw "FlowAction plug-in DepositCoinsRollback::onPrepare has been failed " + e;
            }
        },

        /**
         * Emulates a business logic flow action when running: Sends an event when deposit rollback 'ROLLBACKL3'.
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
                let escrowCoins = await cashHelper.getDepositJSONResultCoins();
                await _dataService.setValues(["PROP_PENULTIMATE_VIEWKEY", "CCCAINTAFW_PROP_JSON_ROLLBACKCOINS"],
                                             ["DepositCoinsRollback", escrowCoins.denominations ? JSON.stringify(escrowCoins) : ""], null);
                if (localStorage.getItem("activateTimeoutsOn") === "true" && TIMEOUT_SENDING_DEPOSIT_EVENT !== -1) {
                    await ext.Promises.Promise.delay(TIMEOUT_SENDING_DEPOSIT_EVENT);
                    if (context.currentViewKey() === "DepositCoinsRollback") {
                        await _dataService.updateValues("VAR_DEPOSIT_CONFIRM_VIEWSTATE_S", "0"); // enable confirm button
                        _eventService.onEvent({
                            FWName: EVENT_INFO.NAME,
                            FWEventID: EVENT_INFO.ID_DEPOSIT,
                            FWEventParam: "COINSPRESENTED"
                        });
                    }
                }
            } catch(e) {
                throw `FlowAction plug-in DepositCoinsRollback::onActivateReady has been failed ${e}`;
            }
        },

        /**
         * Emulates a business logic flow action: .
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
            return ext.Promises.promise((resolve, reject) => resolve());
        }
    };
});
