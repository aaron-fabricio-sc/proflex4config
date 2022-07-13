/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ DepositNotesRemovalIO.js 4.3.1-200122-21-0cd8a9f7-1a04bc7d
 */

/**
 * @module flowactionplugins/DepositNotesRemovalIO
 */
define(["extensions", "./util/pluginHelper", "./util/cashHelper"], function(ext, plugInHelper, cashHelper) {
    "use strict";
    console.log("AMD:DepositNotesRemovalIO");

    const _dataService = Wincor.UI.Service.Provider.DataService;

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
                throw `FlowAction plug-in DepositNotesRemovalIO::onPrepare has been failed ${e}`;
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
                return await plugInHelper.processTimeout(context);
            } catch(e) {
                throw `FlowAction plug-in DepositNotesRemovalIO::onActivateReady has been failed ${e}`;
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
            return ext.Promises.promise((resolve, reject) => {
                resolve();
            });
        }
    };
});
