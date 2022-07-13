/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ DepositNotesInsertion.js 4.3.1-200122-21-0cd8a9f7-1a04bc7d
 */

/**
 * @module flowactionplugins/DepositNotesInsertion
 */
define(["extensions", "./util/cashHelper"], function(ext, cashHelper) {
    "use strict";
    console.log("AMD:DepositNotesInsertion");

    const _dataService = Wincor.UI.Service.Provider.DataService;
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
                await cashHelper.updateDepositCommandStates();
            } catch(e) {
                throw `FlowAction plug-in DepositNotesInsertion::onPrepare has been failed ${e}`;
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
                if(_controlPanelService.getContext().depositInfosViewModel &&
                    _controlPanelService.getContext().depositInfosViewModel.currentTrayIOReason() === _controlPanelService.getContext().controlPanelData.TrayIOReasons[1]) {
                        // Note: This event is defined to only might fired while "DepositNotesInsertion"
                        // In real life the event "TOOMANYNOTES" is sent when the ESCROW is full and a 2. cashIn is done.
                        // Because the application would prevent from doing a 2. cashIn when ESCROW is full this event can't
                        // fired. Instead there is the  "Please remove everything from the input tray" or similar.
                        // Sitiation is handles by the DepositNotesRemovalInput or DepositNotesRemovalInputIO.

                       // _eventService.onEvent({
                       //     FWName: EVENT_INFO.NAME,
                       //     FWEventID: EVENT_INFO.ID_DEPOSIT,
                       //     FWEventParam: "TOOMANYNOTES"
                       // });
                }
            } catch(e) {
                throw `FlowAction plug-in DepositNotesInsertion::onActivateReady has been failed ${e}`;
            }
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
        onGuiResult: async function(context) {
            try {
                await _dataService.setValues(["PROP_PENULTIMATE_ACTION"], [context.action]);
            } catch(e) {
                throw `FlowAction plug-in DepositNotesInsertion::onGuiResult has been failed ${e}`;
            }
        }
    };
});
