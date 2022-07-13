/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ DepositChequesPleaseWait.js 4.3.1-200122-21-0cd8a9f7-1a04bc7d
 */

/**
 * @module flowactionplugins/DepositChequesPleaseWait
 */
define(["extensions", "./util/cashHelper"], function(ext, cashHelper) {
    "use strict";
    console.log("AMD:DepositChequesPleaseWait");

    const _eventService = Wincor.UI.Service.Provider.EventService;
    const EVENT_INFO = _eventService.getEventInfo("TRANSACTION_MODULE");


    return {

        /**
         * Emulates a business logic flow action when running: Sends an event when card return 'HALFTIMEOUT'.
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
            return ext.Promises.promise(async (resolve, reject) => {
                try {
                    let chkCount = await cashHelper.getChequesCount();
                    for(let i = 0; i < chkCount; i++) {
                        setTimeout(async () => {
                            if(context.currentViewKey() === "DepositChequesPleaseWait") { // check whether we are in cheque scan still
                                _eventService.onEvent({
                                    FWName: EVENT_INFO.NAME,
                                    FWEventID: EVENT_INFO.ID_DEPOSIT,
                                    FWEventParam: await cashHelper.createChequeEventData(i)
                                });
                            }
                        }, 800 + ((i + 1) * 800));
                    }
                    resolve();
                } catch(e) {
                    reject("FlowAction plug-in DepositChequesPleaseWait::onActivateReady has been failed " + e);
                }
            });
        },

        /**
         * Emulates a business logic flow action: Sends an event for EPP ETS layout, if corresponding property 'PROP_ETS_LAYOUT' is set.
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
