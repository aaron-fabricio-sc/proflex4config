/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ DepositNotesRollback.js 4.3.1-200122-21-0cd8a9f7-1a04bc7d
 */
/**
 * @module flowactionplugins/DepositNotesRollback
 */
define(["extensions", "./util/cashHelper"], function(ext, cashHelper) {
    "use strict";
    console.log("AMD:DepositNotesRollback");

    const _dataService = Wincor.UI.Service.Provider.DataService;
    const _formatService = Wincor.UI.Service.Provider.FormatService;
    const _eventService = Wincor.UI.Service.Provider.EventService;
    const _controlPanelService = Wincor.UI.Service.Provider.ControlPanelService;
    const EVENT_INFO = _eventService.getEventInfo("TRANSACTION_MODULE");


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
            } catch(e) {
                throw `FlowAction plug-in DepositNotesRollback::onPrepare has been failed ${e}`;
            }
        },

        /**
         * Emulates a business logic flow action when running: Sends an event when deposit rollback 'ROLLBACKL2'/'ROLLBACKL3' on L2 or L3 or both.
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
                let [l2Amount, l3Amount] = await ext.Promises.Promise.all([cashHelper.getDepositL2Amount(), cashHelper.getDepositL3Amount()]);
                let l2Format, l3Format;
                if(l2Amount) {
                    l2Format = {raw: parseInt(l2Amount.value) * parseInt(l2Amount.count)};
                    _formatService.format(l2Format, "#M", null, true);
                }
                if(l3Amount) {
                    l3Format = {raw: parseInt(l3Amount.value) * parseInt(l3Amount.count)};
                    _formatService.format(l3Format, "#M", null, true);
                }
                let l3Credited = _controlPanelService.getContext().depositInfosViewModel !== void 0 && _controlPanelService.getContext().depositInfosViewModel.l3NotesCredited();
                let escrow = await cashHelper.getDepositJSONResult();
                if(l2Amount || l3Amount) {
                    escrow.denominations = escrow.denominations.filter(item => {  // remove L3 from denominations
                        return parseInt(item.level) !== 3 && parseInt(item.level) !== 2;
                    });
                }
                await _dataService.setValues(["CCCAINTAFW_PROP_ROLLBACK_L2_AMOUNTS", "CCCAINTAFW_PROP_ROLLBACK_L3_AMOUNTS", "PROP_PENULTIMATE_VIEWKEY", "CCCAINTAFW_PROP_JSON_ROLLBACKNOTES"],
                                             [l2Amount ? `${l2Format.result}` : "", l3Amount ? `${l3Format.result}` : "", "DepositNotesRollback", JSON.stringify(escrow)], null);
                let evtData = null;
                if(l2Amount && !l3Amount) {
                    evtData = l3Credited ? "ROLLBACKL2" : "ROLLBACKL2NOCREDIT";
                } else if(!l2Amount && l3Amount) {
                    evtData = l3Credited ? "ROLLBACKL3" : "ROLLBACKL3NOCREDIT";
                } else if(l2Amount && l3Amount) {
                    evtData = l3Credited ? "ROLLBACKL2L3" : "ROLLBACKL2L3NOCREDIT";
                }
                if(evtData) {
                    await ext.Promises.Promise.delay(2500);
                    if(context.currentViewKey() === "DepositNotesRollback") {
                        _eventService.onEvent({
                            FWName: EVENT_INFO.NAME,
                            FWEventID: EVENT_INFO.ID_DEPOSIT,
                            FWEventParam: evtData
                        });
                    }
                }
            } catch(e) {
                throw `FlowAction plug-in DepositNotesRollback::onActivateReady has been failed ${e}`;
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
