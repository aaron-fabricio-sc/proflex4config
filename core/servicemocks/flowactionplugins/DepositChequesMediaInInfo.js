/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ DepositChequesMediaInInfo.js 4.3.1-200218-21-3da0a379-1a04bc7d
 */

/**
 * @module flowactionplugins/DepositChequesMediaInInfo
 */
define(["extensions", "./util/cashHelper"], function(ext, cashHelper) {
    "use strict";
    console.log("AMD:DepositChequesMediaInInfo");

    const _dataService = Wincor.UI.Service.Provider.DataService;
    const _eventService = Wincor.UI.Service.Provider.EventService;
    const _controlPanelService = Wincor.UI.Service.Provider.ControlPanelService;
    
    const EVENT_INFO = _eventService.getEventInfo("TRANSACTION_MODULE");

    return {

        /**
         * Emulates a business logic flow action when running: Sets scanner type to 'CCDM2'.
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
                resolve();
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
            return ext.Promises.promise(async(resolve, reject) => {
                try {
                    // setTimeout(async() => {
                        if(context.currentViewKey() === "DepositChequesMediaInInfo") {
                            let isChequeScanAndReadParallel = _controlPanelService.getContext().depositInfosViewModel !== void 0 && _controlPanelService.getContext().depositInfosViewModel.chequesScanAndReadParallel();
                            await _dataService.setValues(["CCCHCCDMTAFW_CHEQUE_PARALLELIZATION"], [isChequeScanAndReadParallel ? "1" : "0"]);
                            
                            _eventService.onEvent({
                                FWName: EVENT_INFO.NAME,
                                FWEventID: EVENT_INFO.ID_DEPOSIT,
                                FWEventParam: "{\"content_key\":\"ScanCheques\",\"type\":\"cheque\",\"number\":\"\",\"amount\":\"\",\"sum\":\"\",\"image\":\"\"}"
                            });
                            let chkCount = await cashHelper.getChequesCount();
                            let endTime = 0;
                            for(let i = 0; i < chkCount; i++) {
                                endTime += 400 + ((i + 1) * 2);
                                setTimeout(async () => {
                                    if(context.currentViewKey() === "DepositChequesMediaInInfo") { // check whether we are in cheque scan still
                                        _eventService.onEvent({
                                            FWName: EVENT_INFO.NAME,
                                            FWEventID: EVENT_INFO.ID_DEPOSIT,
                                            FWEventParam: await cashHelper.createChequeEventData(i)
                                        });
                                    }
                                }, 500 + ((i + 1) * 180));
                            }
                            let code = await _dataService.getValues(["PROP_INTERNAL_FUNCTION_SELECTION"], null, null);
                            if(code === "MIXEDMEDIA") {
                                let notesAmounts = await cashHelper.getDepositNotesAmounts();
                                for(let i = 0; i < notesAmounts.length; i++) {
                                    endTime += 100 + ((i + 1) * 2);
                                    setTimeout(async () => {
                                        if(context.currentViewKey() === "DepositChequesMediaInInfo") { // check whether we are in cheque scan still
                                            _eventService.onEvent({
                                                FWName: EVENT_INFO.NAME,
                                                FWEventID: EVENT_INFO.ID_DEPOSIT,
                                                FWEventParam: await cashHelper.createNoteEventData(i, notesAmounts)
                                            });
                                        }
                                    }, 100 + ((i + 1) * 100));
                                }
                            }
                            setTimeout(() => {
                                resolve();
                            }, endTime + 2000);
                        }
                    // }, 1000);
                } catch(e) {
                    reject("FlowAction plug-in DepositChequesMediaInInfo::onHardwareEvent has been failed " + e);
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
