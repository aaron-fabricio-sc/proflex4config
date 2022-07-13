/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ IdleLoopPresentation.js 4.3.1-200122-21-0cd8a9f7-1a04bc7d
 */

/**
 * @module flowactionplugins/IdleLoopPresentation
 */
define(["extensions"], function(ext) {
    "use strict";
    console.log("AMD:IdleLoopPresentation");

    const _eventService = Wincor.UI.Service.Provider.EventService;
    const _dataService = Wincor.UI.Service.Provider.DataService;
    const _localizeService = Wincor.UI.Service.Provider.LocalizeService;
    const _controlPanelService = Wincor.UI.Service.Provider.ControlPanelService;

    const PROP_FUNC_SEL_CODE = "PROP_INTERNAL_FUNCTION_SELECTION";
    const PROP_TRANSACTION_STATUS = "PROP_TRANSACTION_STATUS";
    const PROP_CARD_ACTIVE = "PROP_CARD_ACTIVE";
    const PROP_VALID_PIN_ENTERED = "PROP_VALID_PIN_ENTERED";
    const PROP_ADA_STATUS_VALUE = "PROP_ADA_STATUS_VALUE";
    const PROP_DEFAULT_LANGUAGE = "PROP_DEFAULT_LANGUAGE";
    const PROP_UI_VIEWSET_KEY = "PROP_UI_VIEWSET_KEY";
    const PROP_UI_STYLE_TYPE_KEY = "PROP_UI_STYLE_TYPE_KEY";

    const EVENT_INFO = _eventService.getEventInfo("TRANSACTION_MODULE");
    
    const HARDWARE_RUNNING_TIME = 500;

    return {
    
        /**
         * Emulates a business logic step for preparation purpose: Resets the internal function selection code.
         * @param {Object} context is:<br>
         * <ul>
         * <li>currentViewKey  // function: the current view key (corresponding this this plug-in name)</li>
         * <li>config          // object: Configuration of Config.js</li>
         * <li>container       // object: ViewModelContainer</li>
         * <li>serviceProvider // object: a service provider reference</li>
         * </ul>
         * @returns {Promise} gets resolved when the action is ready or rejected on any error.
         */
        onPrepare: async function(context) {
            try {
                // reset some host simulation conditions
                if(_controlPanelService.getContext().transactionViewModel) {
                    _controlPanelService.getContext().transactionViewModel.pinInvalid(false);
                    _controlPanelService.getContext().transactionViewModel.tryCounter(0);
                }
                if(_controlPanelService.getContext().cashInfosViewModel) {
                    _controlPanelService.getContext().cashInfosViewModel.setDefaultCurrency();
                }

                let defaultLang = await _dataService.getValues(PROP_DEFAULT_LANGUAGE, null, null);
                //Hint: reset to default language
                const langMap = _localizeService.getLanguageMapping();
                // convert action to e.g. "English" instead of "ENGLISH"
                let langName = defaultLang[PROP_DEFAULT_LANGUAGE] ? defaultLang[PROP_DEFAULT_LANGUAGE].toLowerCase() : "ENGLISH".toLowerCase();
                langName = langName.charAt(0).toUpperCase() + langName.slice(1);
                _localizeService.setLanguage(langMap.nameToIso[langName], null);
                // reset several properties
                await _dataService.setValues(
                    [PROP_FUNC_SEL_CODE, PROP_CARD_ACTIVE, PROP_VALID_PIN_ENTERED, PROP_ADA_STATUS_VALUE, PROP_TRANSACTION_STATUS,
                     "CCCAINTAFW_PROP_ROLLBACK_L2_AMOUNTS", "CCCAINTAFW_PROP_ROLLBACK_L3_AMOUNTS",
                     "PROP_STEP_RETURN_CODE", "PROP_PENULTIMATE_VIEWKEY", "PROP_PENULTIMATE_ACTION", "CCTAFW_PROP_REMAINING_NOTES_ON_STACKER",
                     "CCTAFW_PROP_WXTEXT_KEY_HOST_RESPONSE",
                     "CCTAFW_PROP_NOTE_DISPENSE_AMOUNT", "CCTAFW_PROP_COIN_DISPENSE_AMOUNT", "CCTAFW_PROP_HIGH_AMOUNT_MINOR", "CCTAFW_PROP_LOW_AMOUNT_MINOR",
                     "CCTAFW_PROP_TRANSACTION_AMOUNT", "CCCAINTAFW_PROP_JSON_ROLLBACKNOTES", "CCCAINTAFW_PROP_JSON_ROLLBACKCOINS"
                    ],
                    ["", "0", "0", "IDLE", "N", "-1", "", "", "", "", "400", "", "", "", "", "", "0", "", ""]);
            } catch(e) {
                throw `FlowAction plug-in IdleLoopPresentation::onActivateReady has been failed ${e}`;
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
        onHardwareEvent: async function(context) {
            try {
                if(context.action === "cardReader" || context.action === "contactlessReader" || context.action === "cardReaderLSF") {
                    await _dataService.setValues(PROP_CARD_ACTIVE, "1", null);
                    _eventService.onEvent({
                        FWName: EVENT_INFO.NAME,
                        FWEventID: EVENT_INFO.ID_CARD,
                        FWEventParam: "INSERT" //TODO: in case of DIP card reader type e.g. look at CCTAFW_PROP_IDCU_TYPE[0] -> send INSERT_DIP
                    });
                    setTimeout(async () => {
                        if(_controlPanelService.getContext().transactionViewModel && _controlPanelService.getContext().transactionViewModel.cardType() === "cardType02") {
                            await _dataService.updateValues([PROP_UI_VIEWSET_KEY, PROP_UI_STYLE_TYPE_KEY], ["", "GUI_MercuryLight_Stylesheet"]);
                        }
                        return context.action;
                    }, HARDWARE_RUNNING_TIME); // hardware running time for insert card or DIP
                } else {
                    return context.action;
                }
            } catch(e) {
                throw `FlowAction plug-in IdleLoopPresentation::onHardwareEvent has been failed ${e}`;
            }
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
                    reject(`FlowAction plug-in IdleLoopPresentation::onGuiResult has been failed ${e}`);
                }
            });
        }
    };
});
