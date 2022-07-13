/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ WithdrawalCoinsDispensing.js 4.3.1-200122-21-0cd8a9f7-1a04bc7d
 */

/**
 * @module flowactionplugins/WithdrawalCoinsDispensing
 */
define(["extensions", "./util/cashHelper"], function(ext, cashHelper) {
    "use strict";
    console.log("AMD:WithdrawalCoinsDispensing");

    const _controlPanelService = Wincor.UI.Service.Provider.ControlPanelService;

    return {

        /**
         * Emulates a business logic flow action when running: Sends an event for rollback on dispense HALFTIMEOUT.
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
                if(_controlPanelService.getContext().moreOptionsViewModel && _controlPanelService.getContext().moreOptionsViewModel.enableMoveOnWait()) {
                    await ext.Promises.Promise.delay(2000);
                    if(context.currentViewKey() === "WithdrawalCoinsDispensing") {
                        return "*";
                    }
                }
            } catch(e) {
                throw `FlowAction plug-in WithdrawalCoinsDispensing::onActivateReady has been failed ${e}`;
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
        onGuiResult: function(context) {
            return ext.Promises.promise((resolve, reject) => resolve());
        }
    };
});
