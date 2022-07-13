/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ pluginHelper.js 4.3.1-200512-21-e0b258da-1a04bc7d
 */

/**
 * @module flowactionplugins/cashHelper
 */
define(["extensions"], function(ext) {
    "use strict";
    console.log("AMD:cashHelper");

    const _eventService = Wincor.UI.Service.Provider.EventService;
    const EVENT_INFO = _eventService.getEventInfo("TRANSACTION_MODULE");
    
    const _dataService = Wincor.UI.Service.Provider.DataService;
    const _eppService = Wincor.UI.Service.Provider.EppService;
    const _controlPanelService = Wincor.UI.Service.Provider.ControlPanelService;
    
    const PROP_RETRACT_NO = "PROP_RETRACT_NO";
    
    const CASH_PRESENTING_VIEWKEYS = [
        "DepositNotesRemovalInput",
        "DepositNotesRemovalInputIO",
        "DepositNotesRemovalOutput",
        "DepositChequesPresentMediaInfo",
        "DepositEnvelopePresentation",
        "WithdrawalNotesAndReceiptPresentation",
        "WithdrawalNotesAndCoinsAndReceiptPresentation",
        "WithdrawalNotesAndPartialCoinsAndReceiptPresentation",
        "WithdrawalMultiBundleNotesAndCoinsPresentation",
        "WithdrawalMultiBundleNotesPresentation"
    ];
    
    const OTHER_MEDIA_VIEWKEYS = [
        "CardPresentation",
        "CardInsertion",
        "StatementPresentation"
    ];
    
    
    function pad(n, width, z) {
        z = z || '0';
        n += '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }
    
    return {
        /**
         * Emulates a business logic flow action when running: Updates the retract bin.
         * @param {Object} context is:<br>
         * <ul>
         * <li>currentViewKey  // function: the current view key (corresponding this this plug-in name)</li>
         * <li>config          // object: Configuration of Config.js</li>
         * <li>container       // object: ViewModelContainer</li>
         * <li>serviceProvider // object: a service provider reference</li>
         * </ul>
         * @param {Number} timeouts for STARTED, HALFTIMEOUT and retained
         * @returns {Promise} gets resolved when the action is ready or rejected on any error.
         */
        processTimeout: async function(context, ...timeouts) {
            try {
                if(localStorage.getItem("activateTimeoutsOn") === "true") {
                    await ext.Promises.Promise.delay(timeouts?.[0] ?? 8000);
                    if(CASH_PRESENTING_VIEWKEYS.includes(context.currentViewKey()) || OTHER_MEDIA_VIEWKEYS.includes(context.currentViewKey())) { // check whether we are in present still
                        _eventService.onEvent({
                            FWName: EVENT_INFO.NAME,
                            FWEventID: EVENT_INFO.ID_ESCALATION,
                            FWEventParam: "STARTED"
                        });
                    } else {
                        return;
                    }
                    await ext.Promises.Promise.delay(timeouts?.[1] ?? 4000);
                    if(CASH_PRESENTING_VIEWKEYS.includes(context.currentViewKey()) || OTHER_MEDIA_VIEWKEYS.includes(context.currentViewKey())) { // check whether we are in card present still
                        _eventService.onEvent({
                            FWName: EVENT_INFO.NAME,
                            FWEventID: EVENT_INFO.ID_ESCALATION,
                            FWEventParam: "HALFTIMEOUT"
                        });
                    } else {
                        return;
                    }
                    await ext.Promises.Promise.delay(timeouts?.[2] ?? 4000);
                    if(CASH_PRESENTING_VIEWKEYS.includes(context.currentViewKey()) || OTHER_MEDIA_VIEWKEYS.includes(context.currentViewKey())) { // check whether we are in card present still
                        let result = await _dataService.getValues(PROP_RETRACT_NO);
                        let noOfRetracts = parseInt(result[PROP_RETRACT_NO]);
                        if(CASH_PRESENTING_VIEWKEYS.includes(context.currentViewKey())) {
                            // control panel update
                            if(_controlPanelService.getContext().cassettesViewModel) {
                                _controlPanelService.getContext().cassettesViewModel.cassettes().find(item => {
                                    if(item.cuInfo.type() === "retract") {
                                        item.cuInfo.count(parseInt(item.cuInfo.count()) + 1); // its possible that someone has updated the count manually so...
                                        // ...that we shouldn't overwrite it with -noOfRetracts
                                        // item.cuInfo.count(noOfRetracts);
                                        return true;
                                    }
                                    return false;
                                });
                            }
                            return (context.action = "itemsRetracted");
                        } else if(OTHER_MEDIA_VIEWKEYS.includes(context.currentViewKey())) {
                            if(context.currentViewKey() === "CardPresentation") {
                                await _dataService.setValues(PROP_RETRACT_NO, [++noOfRetracts]);
                                // control panel update
                                if(_controlPanelService.getContext().devicesViewModel) {
                                    let val = parseInt(_controlPanelService.getContext().devicesViewModel.cardReaderRetractNo());
                                    // its possible that someone has updated the count manually so
                                    // that we shouldn't overwrite it with -noOfRetracts
                                    _controlPanelService.getContext().devicesViewModel.cardReaderRetractNo(val + 1);
                                }
                                return (context.action = "cardRetained");
                            } else if(context.currentViewKey() === "CardInsertion") {
                                return (context.action = "cardNotInserted");
                            } else if(context.currentViewKey() === "StatementPresentation") {
                                return (context.action = "mediaRetained");
                            }
                        }
                    }
                }
            } catch(e) {
                throw `FlowAction plug-in cashHelper::processTimeout has been failed ${e}`;
            }
        },
    
        runPin: async context => {
            const PROP_ETS_LAYOUT = "PROP_ETS_LAYOUT";
            const PROP_PIN_OPTIONS = "PROP_PIN_OPTIONS"; //a comma separated list: MIN,MAX,AUTOCONFIRM
            const EVENT_INFO = _eventService.getEventInfo("EPP_MODULE");
    
            // simulation time for ready event (ENTER_DATA)
            const EPP_READY_SIM_TIME = 500;
    
            // simulation time for ETS ETS_LAYOUT_MOVED
            const ETS_READY_SIM_TIME = 1000;

            let result = await _dataService.getValues([PROP_ETS_LAYOUT, PROP_PIN_OPTIONS]);
            let isEtsMode = result[PROP_ETS_LAYOUT] && result[PROP_ETS_LAYOUT] !== "";
            if(isEtsMode) {
                const $etsContainer = jQuery("#flexEtsContainerArea");
                if($etsContainer.length) {
                    const pos = $etsContainer.position();
                    let randomX = Math.round(Math.random() * (window.innerWidth - pos.left - $etsContainer.width()) + 1);
                    let randomY = Math.round(Math.random() * (window.innerHeight - pos.top - $etsContainer.height() / 2) + 1);
                    let wordX = randomX.toString(16), wordY = randomY.toString(16); // convert to hex values
                    // create an offset value and convert to negative hex values
                    if(randomX > pos.left) {
                        wordX = (-randomX >>> 0).toString(16);
                        if(wordX.length > 4) {
                            wordX = wordX.substr(wordX.length - 4, 4);
                        }
                    }
                    if(randomY < pos.top) {
                        wordY = (-randomY >>> 0).toString(16);
                        if(wordY.length > 4) {
                            wordY = wordY.substr(wordY.length - 4, 4);
                        }
                    }
                    // pad with leading zeros
                    wordX = pad(wordX, 4);
                    wordY = pad(wordY, 4);
                    // change lowbyte/highbyte order
                    wordX = wordX.substr(2, 2) + wordX.substr(0, 2);
                    wordY = wordY.substr(2, 2) + wordY.substr(0, 2);
                    setTimeout(() => {
                        _eventService.onEvent({
                            FWName: EVENT_INFO.NAME,
                            FWEventID: EVENT_INFO.ID_ETS_LAYOUT_MOVED,
                            FWEventParam: "02000000" + wordX + wordY
                        });
                        _eventService.onEvent({
                            FWName: EVENT_INFO.NAME,
                            FWEventID: EVENT_INFO.ID_ENTER_DATA
                        });
                    }, ETS_READY_SIM_TIME); // hardware sim time
                }
            } else {
                if(localStorage.getItem("controlPanelActive") !== "true") { // PIN entry simulation...
                    let value = result[PROP_PIN_OPTIONS];
                    if(value && value !== "") {
                        value = value.split(",");
                        try {
                            setTimeout(() => {
                                _eventService.onEvent({
                                    FWName: EVENT_INFO.NAME,
                                    FWEventID: EVENT_INFO.ID_ENTER_DATA
                                });
                                let minPinLength = parseInt(value[0]); // MIN
                                //let maxPinLength = parseInt(value[1]); // MAX
                                //let isAutoConfirm = !!(value[2] === "1"); // AUTO CONFIRM
                                for(let i = 0; i < minPinLength; i++) {
                                    setTimeout(() => _eppService.onEvent({methodName: "KeyPressed", key: "*"}), 400 * (i + 1));
                                }
                            }, EPP_READY_SIM_TIME); // hardware sim time
                        } catch(e) {
                            throw `Pin options parsing error ! ${e.message}`; // OK to be caught by upper catch
                        }
                    }
                } else {
                    setTimeout(() => {
                        _eventService.onEvent({
                            FWName: EVENT_INFO.NAME,
                            FWEventID: EVENT_INFO.ID_ENTER_DATA
                        });
                    }, EPP_READY_SIM_TIME); // hardware sim time
                }
            }
        }
    };
});
