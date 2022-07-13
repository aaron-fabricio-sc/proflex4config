/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ DepositNotesProcessingWait.js 4.3.1-200122-21-0cd8a9f7-1a04bc7d
 */

/**
 * @module flowactionplugins/DepositNotesProcessingWait
 */
define(["extensions", "./util/cashHelper"], function(ext, cashHelper) {
    "use strict";
    console.log("AMD:DepositNotesProcessingWait");

    const _dataService = Wincor.UI.Service.Provider.DataService;
    const _eventService = Wincor.UI.Service.Provider.EventService;
    const _controlPanelService = Wincor.UI.Service.Provider.ControlPanelService;


    const EVENT_INFO = _eventService.getEventInfo("TRANSACTION_MODULE");


    return {

        /**
         * Emulates a business logic flow action when running: Sends an event when deposit retract 'ROLLBACKL3'.
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
                    resolve();
                } catch(e) {
                    reject("FlowAction plug-in DepositNotesProcessingWait::onActivateReady has been failed " + e);
                }
            });
        },

        /**
         * Emulates a business logic flow action: Sets the CCHPFW_PROP_APPROVAL_AMOUNT.
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
               // update remaining notes on stacker
               let tooManyItems = false;
               let denoms = await ext.Promises.Promise.all([cashHelper.getDepositL2Amount(), cashHelper.getDepositL3Amount(), cashHelper.getDepositL4Amount()]);
               let count = 0;
               denoms.forEach(denom => {
                   if(denom) {
                       count += parseInt(denom.count);
                   }
               });
               let max = cashHelper.getMaxItemsOnStacker();
               let remaining = max - count >= 0 ? max - count : 0;
               if(max - count < 0) {
                   tooManyItems = true;
                   if(_controlPanelService.getContext().depositInfosViewModel && _controlPanelService.getContext().depositInfosViewModel.currentTrayIOReason) {
                       _controlPanelService.getContext().depositInfosViewModel.currentTrayIOReason(_controlPanelService.getContext().controlPanelData.TrayIOReasons[1]);
                   }
               }
               await _dataService.setValues("CCTAFW_PROP_REMAINING_NOTES_ON_STACKER", remaining.toString());
               
               // if(tooManyItems && context.currentViewKey() === "DepositNotesProcessingWait") {
                   // Note: This event is defined to only might fired while "DepositNotesInsertion"
                   // In real life the event "TOOMANYNOTES" is sent when the ESCROW is full and a 2. cashIn is done.
                   // Because the application would prevent from doing a 2. cashIn when ESCROW is full this event can't
                   // fired. Instead there is the  "Please remove everything from the input tray" or similar.
                   // Situation is handles by the DepositNotesRemovalInput or DepositNotesRemovalInputIO.
                   // _eventService.onEvent({
                   //     FWName: EVENT_INFO.NAME,
                   //     FWEventID: EVENT_INFO.ID_DEPOSIT,
                   //     FWEventParam: "TOOMANYNOTES"
                   // });
                   // setTimeout(() => {
                   //     resolve();
                   // }, 3000);
               // }
           } catch(e) {
               throw `FlowAction plug-in DepositNotesProcessingWait::onGuiResult has been failed ${e}`;
           }
        }
    };
});
