/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ DocumentScanResult.js 4.3.1-200219-21-22bf6c4c-1a04bc7d
 */

/**
 * @module flowactionplugins/DocumentScanResult
 */
define(["extensions"], function (ext) {
    "use strict";
    console.log("AMD:DocumentScanResult");

    const _dataService = Wincor.UI.Service.Provider.DataService;
    const PROP_DOCUMENT_DATA = "PROP_DOCUMENT_DATA";
    const PROP_DOCUMENT_TYPE = "PROP_DOCUMENT_TYPE";
    const PROP_DOCUMENT_SIDE = "PROP_DOCUMENT_SIDE";

    const VALUE_DOC_TYPE_IDCARD = "IDCard";
    const VALUE_DOC_TYPE_DRIVING_LICENSE = "DrivingLicense";
    const VALUE_DOC_TYPE_PASSPORT = "Passport";
    const VALUE_DOC_TYPE_DOCUMENT = "Document";

    const VALUE_DOC_SIDE_FRONT = "Front";
    const VALUE_DOC_SIDE_BACK = "Back";


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
        onActivateReady: function (context) {
            return ext.Promises.promise((resolve, reject) => {
                try {
                    resolve();
                }
                catch (e) {
                    reject("FlowAction plug-in DocumentScanResult::onActivateReady has been failed " + e);
                }
            });
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
        onHardwareEvent: function (context) {
            return ext.Promises.promise((resolve, reject) => {
                try {
                    resolve();
                }
                catch (e) {
                    reject("FlowAction plug-in DocumentScanResult::onHardwareEvent has been failed " + e);
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
        onGuiResult: async function (context) {
            try {
                if(context.action === "ACCEPT") {
                    let result = await _dataService.getValues([PROP_DOCUMENT_DATA, PROP_DOCUMENT_TYPE, PROP_DOCUMENT_SIDE]);
                    let data = result[PROP_DOCUMENT_DATA];
                    let type = result[PROP_DOCUMENT_TYPE];
                    let side = result[PROP_DOCUMENT_SIDE];

                    data = data || {images: [{}]};
                    data = typeof data !== "object" ? JSON.parse(data) : data;
                    if (side === VALUE_DOC_SIDE_FRONT) {
                        side = VALUE_DOC_SIDE_BACK;
                    } else {
                        side = VALUE_DOC_SIDE_FRONT;
                    }
                    await _dataService.setValues([PROP_DOCUMENT_DATA, PROP_DOCUMENT_SIDE], [JSON.stringify(data), side]);
                }
            } catch (e) {
                throw `FlowAction plug-in DocumentScanResult::onHardwareEvent has been failed ${e}`;
            }
        }
    };
});
