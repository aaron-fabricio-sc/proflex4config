/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ TransactionEndWait.js 4.3.1-200131-21-ad48ee76-1a04bc7d
 */

/**
 * @module flowactionplugins/TransactionEndWait
 */
define(["extensions"], function(ext) {
    "use strict";
    console.log("AMD:TransactionEndWait");

    const _eventService = Wincor.UI.Service.Provider.EventService;
    const _dataService = Wincor.UI.Service.Provider.DataService;
    const _localizeService = Wincor.UI.Service.Provider.LocalizeService;
    const _controlPanelService = Wincor.UI.Service.Provider.ControlPanelService;

    const PROP_UI_VIEWSET_KEY = "PROP_UI_VIEWSET_KEY";
    const PROP_UI_STYLE_TYPE_KEY = "PROP_UI_STYLE_TYPE_KEY";

    const EVENT_INFO = _eventService.getEventInfo("TRANSACTION_MODULE");

    return {

        /**
         * Emulates a business logic flow action when running: Resets the internal function selection code.
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
                // reset several properties
                // get the configured STYLE_TYPE and decide how to PROP_UI_STYLE_TYPE_KEY back to the configured one which is either
                // GUI_Mercury_Stylesheet or GUI_MercuryLight_Stylesheet:
                const type = context.config.STYLE_TYPE;
                if(type.includes("default" || type.includes("MercuryDark"))) {
                    await _dataService.updateValues([PROP_UI_VIEWSET_KEY, PROP_UI_STYLE_TYPE_KEY], ["", "GUI_Mercury_Stylesheet"]);
                } else if(type.includes("MercuryLight")){
                    await _dataService.updateValues([PROP_UI_VIEWSET_KEY, PROP_UI_STYLE_TYPE_KEY], ["", "GUI_MercuryLight_Stylesheet"]);
                }
                if(_controlPanelService.getContext().moreOptionsViewModel && _controlPanelService.getContext().moreOptionsViewModel.enableMoveOnWait()) {
                    await ext.Promises.Promise.delay(1500);
                    if(context.currentViewKey() === "TransactionEndWait") {
                        return "*";
                    }
                }
            } catch(e) {
                throw `FlowAction plug-in TransactionEndWait::onActivateReady has been failed ${e}`;
            }
        },

        /**
         * Emulates a hardware event action when running: Sends an event when card insert or DIP insert on contact less reader.
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
                    resolve(context.action);
                } catch(e) {
                    reject(`FlowAction plug-in TransactionEndWait::onHardwareEvent has been failed ${e}`);
                }
            });
        },

        /**
         * Emulates a business logic flow action:
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
                    resolve();
                } catch(e) {
                    reject(`FlowAction plug-in TransactionEndWait::onGuiResult has been failed ${e}`);
                }
            });
        }
    };
});
