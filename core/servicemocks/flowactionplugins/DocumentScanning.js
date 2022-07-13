/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ DocumentScanning.js 4.3.1-200219-21-22bf6c4c-1a04bc7d
 */

/**
 * @module flowactionplugins/DocumentScanning
 */
define(["extensions"], function (ext) {
    "use strict";
    console.log("AMD:DocumentScanning");

    const _dataService = Wincor.UI.Service.Provider.DataService;
    const PROP_DOCUMENT_DATA = "PROP_DOCUMENT_DATA";
    const PROP_DOCUMENT_TYPE = "PROP_DOCUMENT_TYPE";
    const PROP_DOCUMENT_SIDE = "PROP_DOCUMENT_SIDE";

    const VALUE_DOC_TYPE_IDCARD = "IDCard";
    const VALUE_DOC_TYPE_DRIVING_LICENSE = "DrivingLicense";
    const VALUE_DOC_TYPE_PASSPORT = "Passport";
    const VALUE_DOC_TYPE_DOCUMENT = "Document";
    const VALUE_DOC_TYPE_SIGNATURE = "Signature";

    const VALUE_DOC_SIDE_FRONT = "Front";
    const VALUE_DOC_SIDE_BACK = "Back";

    const IMAGE_TYPES = {
        IDCard: {
            "": "style/default/images/dm/Mustermann_nPA.jpg",
            Front: "style/default/images/dm/Mustermann_nPA.jpg",
            Back: "style/default/images/dm/Muster_des_Personalausweises_RS.jpg"
        },
        Passport: {
            "": "style/default/images/dm/Mustermann_nPA.jpg",
            Front: "style/default/images/dm/Mustermann_nPA.jpg",
            Back: "style/default/images/dm/Muster_des_Personalausweises_RS.jpg"
        },
        DrivingLicense: {
            "": "style/default/images/dm/1280px-DE_Licence_2013_Front.jpg",
            Front: "style/default/images/dm/1280px-DE_Licence_2013_Front.jpg",
            Back: "style/default/images/dm/1280px-DE_Licence_2013_Back.jpg"
        },
        Document: {
            "": "style/default/images/document.svg",
            Front: "style/default/images/document.svg",
            Back: "style/default/images/document.svg"
        },
        Signature: {
            "": "style/default/images/signature_john_doe.png",
            Front: "style/default/images/signature_john_doe.png",
            Back: "style/default/images/signature_john_doe.png"
        }
    };

    const IMAGE_SIDES = {
        IDCard: {
            "": VALUE_DOC_SIDE_FRONT,
            Front: VALUE_DOC_SIDE_FRONT,
            Back: VALUE_DOC_SIDE_BACK
        },
        Passport: {
            "": VALUE_DOC_SIDE_FRONT,
            Front: VALUE_DOC_SIDE_FRONT,
            Back: VALUE_DOC_SIDE_BACK
        },
        DrivingLicense: {
            "": VALUE_DOC_SIDE_FRONT,
            Front: VALUE_DOC_SIDE_FRONT,
            Back: VALUE_DOC_SIDE_BACK
        },
        Document: {
            "": "",
            Front: "",
            Back: ""
        },
        Signature: {
            "": "",
            Front: "",
            Back: ""
        }
    };

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
                    reject("FlowAction plug-in DocumentScanning::onActivateReady has been failed " + e);
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
        onHardwareEvent: async function (context) {
            try {
                let result = await _dataService.getValues([PROP_DOCUMENT_DATA, PROP_DOCUMENT_TYPE, PROP_DOCUMENT_SIDE]);
                let data = result[PROP_DOCUMENT_DATA];
                let type = result[PROP_DOCUMENT_TYPE];
                let side = result[PROP_DOCUMENT_SIDE];
                data = data || {images: [{}]};
                data = typeof data !== "object" ? JSON.parse(data) : data;
                let item = data.images[0];
                side = side === void 0 ? "" : side;
                side = IMAGE_SIDES[type][side];
                item.imagePath = IMAGE_TYPES[type][side];
                await _dataService.setValues([PROP_DOCUMENT_DATA, PROP_DOCUMENT_SIDE], [JSON.stringify(data), side]);
                return {
                    dest: {
                        view: context.config.VIEWS.SCANNED_IMAGE_VIEWER.name,
                        viewkey: "DocumentScanResult"
                    }
                };
            } catch (e) {
                throw `FlowAction plug-in DocumentScanning::onHardwareEvent has been failed ${e}`;
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
        onGuiResult: function (context) {
            return ext.Promises.promise((resolve, reject) => resolve());
        }
    };
});
