/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ PinEntryViewModel.js 4.3.1-210127-21-34ae33df-1a04bc7d

*/
define(["jquery", "knockout", "extensions", "ui-content", "basevm"], function(jQuery, ko, ext, content) {
    "use strict";
    console.log("AMD:PinEntryViewModel");

    const _logger = Wincor.UI.Service.Provider.LogProvider;
    const _dataService = Wincor.UI.Service.Provider.DataService;
    const _viewService = Wincor.UI.Service.Provider.ViewService;
    const _eventService = Wincor.UI.Service.Provider.EventService;
    const _eppService = Wincor.UI.Service.Provider.EppService;
    const _adaService = Wincor.UI.Service.Provider.AdaService;

    const PROP_PIN_OPTIONS = "PROP_PIN_OPTIONS"; //a comma separated list: MIN,MAX,AUTOCONFIRM
    const PROP_PIN_DIGITS = "PROP_PIN_DIGITS"; // Is set always with the current PIN length, since the BL is reliant to
    const PROP_ETS_LAYOUT = "PROP_ETS_LAYOUT"; // Contains string "ets" or empty

    const EVENT_INFO = _eventService.getEventInfo("EPP_MODULE");

    /**
     * The PIN command ID.
     * @type {string}
     * @const
     */
    const CMD_PIN = "PIN";

    /**
     * The PIN digit ID.
     * Default is '*'
     * @type {string}
     * @const
     */
    const CMD_DIGIT = "*";

    /**
     * The clear key ID.
     * Default is 'CLEAR'
     * @type {string}
     * @const
     */
    const CMD_CLEAR = "CLEAR";

    /**
     * The code-behind module for PIN entry ETS.
     * @type {Object}
     */
    let _pinEntryEtsModule;


    /**
     * Deriving from {@link Wincor.UI.Content.BaseViewModel} class.
     * @class
     * @since 1.0/00
     */
    Wincor.UI.Content.PinEntryViewModel = class PinEntryViewModel extends Wincor.UI.Content.BaseViewModel {

        /**
         * The pin digits to enter.
         * @type {Array<boolean>}
         */
        pinDigits = [];

        /**
         * The expected PIN digits.
         * Each element is of type boolean.
         * @type {function}
         * @bindable
         */
        pinDigitExpected = null;

        /**
         * The minimum PIN length that must be entered.
         * @type {Number}
         * @Default 4
         */
        minPinLength = 4;

        /**
         * The maximum PIN length that may be be entered.
         * @type {Number}
         * @Default 4
         */
        maxPinLength = 4;

        /**
         * Automatic confirmation flag when minimum PIN is reached.
         * @type {Boolean}
         * @Default 4
         */
        isAutoConfirm = true;

        /**
         * If ADA is active and echo PIN is configured it echos the current PIN entry.
         * @Type {Object}
         */
        adaEchoPIN = null;

        /**
         * PIN id for EPP claiming.
         * @Type {Number}
         */
        pinClaimId = -1;

        /**
         * Observable for current (already entered) PIN length.
         * @type {ko.observable}
         * @bindable
         */
        currentPinLen = null;

        /**
         * Computed observable will be true if the pin option were processed and the EPP is ready to handle a pin entry.
         * @type {function}
         * @bindable
         */
        activatePinContainer = null;

        /**
         * Observable will be true if the pin option were processed.
         * @type {function}
         * @bindable
         */
        pinOptionsReady = null;

        /**
         * Observable will be true if EPP is ready to handle a pin entry.
         * @type {function}
         * @bindable
         */
        eppEnterReady = null;

        /**
         * Observable will be true if EPP-ETS (Encrypted touch security) is ready to handle a pin entry.
         * @type {function}
         * @bindable
         */
        eppEtsReady = null;

        /**
         * Flag whether PIN mode is ETS (Encrypted touch security).
         * Default is false.
         * @type {boolean}
         */
        isEtsMode = false;
    
        /**
         * The Prototype constructor function.
         * @param {*} pinEntryEtsModule the pin entry ETS code-behind module, which supports DOM operating functions
         * @lifecycle viewmodel
         */
        constructor(pinEntryEtsModule) {
            super();
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> PinEntryViewModel");
            this.pinDigits = [];
            _pinEntryEtsModule = pinEntryEtsModule;
            this.pinDigitExpected = ko.observableArray(this.pinDigits);
            this.minPinLength = 4;
            this.maxPinLength = 4;
            this.isAutoConfirm = true;
            this.currentPinLen = ko.observable(0);
            this.pinOptionsReady = ko.observable(content.designMode); // set true only if basic design mode
            // set false when application/EDM mode is active, true otherwise (basic design mode / tooling modes)
            this.eppEnterReady = ko.observable(content.designMode || content.toolingEDM);
            this.eppEtsReady = ko.observable(content.designMode); // set true only if basic design mode
            this.activatePinContainer = ko.pureComputed(() => {
                let state = this.pinOptionsReady() && this.eppEnterReady() && this.eppEtsReady() && this.pinDigitExpected().length > 0;
                this.cmdRepos.whenAvailable([this.STANDARD_BUTTONS.CANCEL]).then(() => {
                    this.cmdRepos.setActive(this.STANDARD_BUTTONS.CANCEL, state);
                });
                return state;
            });
            this.isEtsMode = false;
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< PinEntryViewModel");
        }
    
        /**
         * Handler function to remove/clear members.
         * Overridden to clear data list items, flags and counter.
         * @lifecycle viewmodel
         */
        onDeactivated() {
            super.onDeactivated();
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> PinEntryViewModel::onDeactivated()");
            if(this.isEtsMode && _pinEntryEtsModule) {
                _pinEntryEtsModule.resetEtsContainer();
            }
            this.minPinLength = 4;
            this.maxPinLength = 4;
            this.currentPinLen(0);
            this.pinOptionsReady(content.designMode); // set true only if basic design mode
            // set false when application/EDM mode is active, true otherwise (basic design mode / tooling modes)
            this.eppEnterReady(content.designMode || content.toolingEDM);
            this.eppEtsReady(content.designMode); // set false when application mode is active, true otherwise (design modes / tooling mode)
            this.isEtsMode = false;
            this.adaEchoPIN = null;
            // Note: Do not reassign -pinDigitExpected member, since this is done during observe or onInitTextAndData and
            // DOM bindings may existing if this view model must be reused for Pin reenter e.g.
            // reset possible entered pin's
            this.resetPinDigits(true);
            if(!this.designMode) {
                _eppService.releaseKeys(this.pinClaimId);
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< PinEntryViewModel::onDeactivated");
        }
    
        /**
         * Cleaning up members which can't be cleared in onDeactivate.
         * @lifecycle viewmodel
         */
        clean() {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> PinEntryViewModel::clean()");
            super.clean();
            _pinEntryEtsModule = null;
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< PinEntryViewModel::clean");
        }

        /**
         * This method initializes the DOM-associated objects and registers for some service-events.
         * Typically this method will be called within an 'onload' handler javascript-section of the HTML-page,
         * which directly calls a concrete view-model's 'init' that in turn has to call super.observe(observableArea).
         * @param {string} observableAreaId The DOM-area to be observed by this view-model.
         * @return {*}
         * @lifecycle viewmodel
         */
        observe(observableAreaId) {
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `> PinEntryViewModel::observe(${observableAreaId})`);
            super.observe(observableAreaId);
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< PinEntryViewModel::observe");
        }
        
        /**
         * Reset/initializes the expected pin digits.
         * Consider the observable array as well.
         * @param {boolean} [isDeactivation=false]
         */
        resetPinDigits(isDeactivation = false) {
            this.pinDigits = new Array(this.maxPinLength).fill(false);
            if(this.isEtsMode && _pinEntryEtsModule) {
                _pinEntryEtsModule.animateButtons(CMD_CLEAR);
            }
            this.pinDigitExpected(this.pinDigits);
            this.currentPinLen(0);
            if(!isDeactivation) {
                this.handleConfirmState();
            }
            if(content.designMode || content.designModeExtended || this.isEtsMode) { // design modes: auto-set correct false
                this.cmdRepos.whenAvailable([this.STANDARD_BUTTONS.CORRECT]).then(() => this.cmdRepos.setActive(this.STANDARD_BUTTONS.CORRECT, false));
            }
        }

        /**
         * Activates the next pin digit.
         */
        nextPinDigit() {
            if(this.isEtsMode && _pinEntryEtsModule) {
                _pinEntryEtsModule.animateButtons(CMD_DIGIT);
            }
            if(this.currentPinLen() < this.maxPinLength) {
                this.pinDigits[this.currentPinLen()] = true;
                this.currentPinLen(this.currentPinLen()+1);
                this.pinDigitExpected.valueHasMutated();
            }
            if(!this.designMode) {
                _dataService.setValues(PROP_PIN_DIGITS, this.currentPinLen(), () => {});
            }
            this.handleConfirmState();
            if((content.designMode || content.designModeExtended || this.isEtsMode) && this.currentPinLen() === 1) { // design modes: auto-set correct true
                this.cmdRepos.whenAvailable([this.STANDARD_BUTTONS.CORRECT]).then(() => {
                    // on ETS mode the correct button is disabled via view, all other (normal PIN) views its NONE, so this setting has no effect there
                    this.cmdRepos.setActive(this.STANDARD_BUTTONS.CORRECT, true);
                    // force enabled for basic design mode only - even the state is NONE in view.
                    if(content.designMode) {
                        this.cmdRepos.get(this.STANDARD_BUTTONS.CORRECT).viewState.update(3);
                        this.cmdRepos.get(this.STANDARD_BUTTONS.CORRECT).viewState.update(0);
                    }
                });
            }
            // check for auto end for extended design mode
            if(content.designModeExtended && this.isAutoConfirm && this.currentPinLen() >= this.minPinLength) {
                _viewService.endView(_viewService.UIRESULT_OK, this.STANDARD_BUTTONS.CONFIRM);
            }
            _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, `Next PIN digit received current len=${this.currentPinLen()}`);
        }


        /**
         * Handles the confirm command state whether it must be en- or disabled.
         * The activation depends on the auto confirm flag and the min/max PIN length corresponding to the current PIN length.
         * Override this method in order to handle the command activation in a different way.
         */
        handleConfirmState() {
            this.cmdRepos.whenAvailable([this.STANDARD_BUTTONS.CONFIRM]).then(() => {
                // in case of end of pin command the onDeactivate() maybe called first and the confirm command is not available at this point here anymore
                // so we make sure the confirm command is really existing when the promise is resolved.
                if(this.cmdRepos.hasCommand(this.STANDARD_BUTTONS.CONFIRM)) {
                    let isEnabled = this.currentPinLen() >= this.minPinLength;
                    _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, `. PinEntryViewModel::handleConfirmState confirm enabled=${isEnabled}`);
                    this.cmdRepos.setActive(this.STANDARD_BUTTONS.CONFIRM, isEnabled);
                }
            });
        }

        /**
         * This function is called by the ViewModelContainer after observe has been called. It will be called again, if
         * the following view reuses all viewModels, because of the same url-fragment!
         * Concrete viewModels can push/concatenate textKeys and dataKeys to the 'args' object to be retrieved during initialization of the view.
         * If the desired keys have to be gathered asynchronously before they can be pushed/concatenated to args, a promise can be used instead of the key -
         * Initial text- and data gathering will be deferred until all vms resolved their promised keys.
         * @param {object} args contains attributes textKeys {array.<string|promise>} / dataKeys {array.<string|promise>} which should be filled up by the viewModel.
         * @lifecycle viewmodel
         */
        onInitTextAndData(args) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> PinEntryViewModel::onInitTextAndData()");

            if(!this.designMode) {
                //wait for the event from the business logic that EPP hardware is ready to receive input, before we switch PIN gatter visible
                _eventService.registerForEvent(EVENT_INFO.ID_ENTER_DATA, EVENT_INFO.NAME, () => {
                    _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "PinEntryViewModel::onEppEventEnterData");
                    this.eppEnterReady(true);
                }, null, "ASCII");
            }

            // handle several commands...
            this.cmdRepos.whenAvailable([this.STANDARD_BUTTONS.CONFIRM]).then(() => {
                if(this.designMode) { // CONFIRM is not allowed to show in application mode
                    this.cmdRepos.setActive([this.STANDARD_BUTTONS.CONFIRM], false);
                }
                this.cmdRepos.addDelegate({id: this.STANDARD_BUTTONS.CONFIRM, delegate: this.onButtonPressed, context: this});
            });
            this.cmdRepos.whenAvailable([this.STANDARD_BUTTONS.CORRECT]).then(() => {
                this.cmdRepos.addDelegate({id: this.STANDARD_BUTTONS.CORRECT, delegate: this.onButtonPressed, context: this});
            });
            this.cmdRepos.whenAvailable([this.STANDARD_BUTTONS.CANCEL]).then(() => {
                this.cmdRepos.addDelegate({id: this.STANDARD_BUTTONS.CANCEL, delegate: this.onButtonPressed, context: this});
            });

            if(!this.designMode) {
                args.dataKeys.push(ext.Promises.promise((resolve, reject) => {
                    _dataService.getValues([PROP_PIN_OPTIONS, PROP_ETS_LAYOUT], result => {
                        let value = result[PROP_PIN_OPTIONS];
                        if (value && value !== "") {
                            value = value.split(",");
                            try {
                                this.minPinLength = parseInt(value[0]); // MIN
                                this.maxPinLength = parseInt(value[1]); // MAX
                                this.isAutoConfirm = !!(value[2] === "1"); // AUTO CONFIRM
                                this.pinOptionsReady(true);
                                // validate check
                                if(this.minPinLength > this.maxPinLength) {
                                    _logger.error("Invalid PIN options detected: min PIN length > max PIN length");
                                }
                            } catch(e) {
                                _logger.error(`Pin options parsing error ! ${e.message}`);
                                _viewService.endView(_viewService.UIRESULT_ERROR_VIEW);
                                reject();
                            }
                            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `. PinEntryViewModel::onInitTextAndData retrieved minPinLength=${this.minPinLength}, maxPinLength=${this.maxPinLength}, isAutoConfirm=${this.isAutoConfirm}, etsPinLayout=${result[PROP_ETS_LAYOUT]}`);
                            this.resetPinDigits();
                            this.installEppHandler();
                            resolve(); // send resolve here, because the PIN step should start its PinCommand ASAP.
                            this.isEtsMode = result[PROP_ETS_LAYOUT] && result[PROP_ETS_LAYOUT] !== "" && this.viewHelper.viewType === "touch"; // ETS mode not supported for softkey!
                            if(this.isEtsMode) {
                                _eventService.registerForEvent(EVENT_INFO.ID_ETS_LAYOUT_MOVED, EVENT_INFO.NAME, data => {
                                    _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `PinEntryViewModel::onEppEventEtsLayoutMove data='${data}'`);
                                    if(_pinEntryEtsModule) {
                                        let x = 0, y = 0;
                                        if(data && typeof data === "string" && data.length === 16) {
                                            try {
                                                // DATA     X    Y
                                                // 02000000 0a01 0000 -- with byte order = low byte/high byte
                                                let tail = data.substr(8), hexBytes = [];
                                                for(let i = 0; i < tail.length; i += 2) {
                                                    hexBytes.push(tail.substr(i, 2));
                                                }
                                                x = parseInt("0x" + hexBytes[1] + hexBytes[0], 16);
                                                // check negative values
                                                if((x & 0x8000) > 0) {
                                                    x -= 0x10000;
                                                }
                                                y = parseInt("0x" + hexBytes[3] + hexBytes[2], 16);
                                                if((y & 0x8000) > 0) {
                                                    y -= 0x10000;
                                                }
                                                _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `PinEntryViewModel::onEppEventEtsLayoutMove hexBytes=${hexBytes}, x=${x}, y=${y}`);
                                            } catch(e) {
                                                _logger.error(`PinEntryViewModel::onEppEventEtsLayoutMove missmatch event data, parsing error: ${e}`);
                                            }
                                        } else {
                                            _logger.error("PinEntryViewModel::onEppEventEtsLayoutMove wrong event data, expecting hex value of size 16 byte!");
                                        }
                                        _pinEntryEtsModule.moveEtsContainer(x, y); // eppEtsReady observable is set by the moveEtsContainer()
                                    } else {
                                        this.eppEtsReady(true);
                                        _logger.error("PinEntryViewModel::onEppEventEtsLayoutMove _pinEntryEtsModule is not set!");
                                    }

                                }, null, "HEX");
                            } else {
                                this.eppEtsReady(true);
                            }
                        }
                    }, null);
                }));
            } else { // design mode
                args.dataKeys.push(this.designTimeRunner.retrieveJSONData("PinEntryData")
                    .then(data => {
                        this.minPinLength = parseInt(data.minPinLength); // MIN
                        this.maxPinLength = parseInt(data.maxPinLength); // MAX
                        this.isAutoConfirm = data.isAutoConfirm; // AUTO CONFIRM
                        // create an observable for each pin to enter
                        this.resetPinDigits();
                        this.cmdRepos.whenAvailable(CMD_PIN).then(this.cmdRepos.setActive.bind(this.cmdRepos, CMD_PIN, true));
                    }));
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< PinEntryViewModel::onInitTextAndData");
            return super.onInitTextAndData(args);
        }

        /**
         * This method is used by "initTextAndData".
         */
        installEppHandler() {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> PinEntryViewModel::installEppHandler()");
            const pinEventCallback = evt => {
                if (!this.adaEchoPIN) {
                    try {
                        this.adaEchoPIN = JSON.parse(this.ada._adaTextMap.echoPIN());
                    } catch(e) {
                        this.adaEchoPIN = {};
                    }
                }
                _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, `> PinEntryViewModel::pinEventCallback(${evt.toString()})`);
                // this viewmodel handles epp-claims and therefore also timer refreshing of view-service
                _viewService.refreshTimeout();
                if(this.eppEnterReady()) { // prevent from executing PIN commands before ready event has been arrived
                    switch(evt.toString()) {
                        case CMD_DIGIT:
                            //we have to ask for length > 0, because in rare circumstances it could happen that
                            //onDeactivated was already called and pinDigits was reset. If an event dropped in immediately after this,
                            //and before it was deregistered by the BaseViewModel on the ProTopas bus, we got an exception here.
                            //See Issue 1328311.
                            if(this.pinDigits.length > 0) {
                                this.nextPinDigit();
                                if(!this.designMode) {
                                    // no checks, just speak... the service checks the correct state in speak()
                                    if(CMD_DIGIT in this.adaEchoPIN) {
                                        _adaService.speak(this.adaEchoPIN[CMD_DIGIT], 2, 10, null);
                                    } else {
                                        if(this.ada._adaTextMap.echoPIN()) {
                                            _adaService.speak(this.ada._adaTextMap.echoPIN(), 2, 10, null);
                                        }
                                    }
                                    // beep if ADA not ON!
                                    if(_adaService.state !== _adaService.STATE_VALUES.SPEAK) {
                                        // beep!
                                        this.serviceProvider.BeepService.beep(2, null);
                                    }
                                }
                            } else {
                                _logger.LOG_INFO && _logger.log(_logger.LOG_INFO, "* PinEntryViewModel::pinEventCallback, event ignored");
                            }
                            break;
        
                        case CMD_CLEAR:
                            this.resetPinDigits();
                            if(!this.designMode) {
                                // no checks, just speak... the service checks the correct state in speak()
                                if(CMD_CLEAR in this.adaEchoPIN) {
                                    _adaService.speak(this.adaEchoPIN[CMD_CLEAR], 1, 10, null);
                                }
                                // beep if ADA not ON!
                                if(_adaService.state !== _adaService.STATE_VALUES.SPEAK) {
                                    // beep!
                                    this.serviceProvider.BeepService.beep(2, null);
                                }
                            }
                            this.handleConfirmState();
                            break;
        
                        default:
                            //pass
                            break;
                    }
                }
                _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< PinEntryViewModel::pinEventCallback");
                return false; // avoid negative beeps for our explicit claimKeys
            };

            if(!this.designMode) {
                _eppService.claimKeys([CMD_DIGIT, CMD_CLEAR], -1, result => {
                    _logger.LOG_INFO && _logger.log(_logger.LOG_INFO, `PinEntryViewModel(claimCallback): ${JSON.stringify(result, null, " ")}`);
                    this.pinClaimId = result.claimId;
                }, pinEventCallback, null);
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< PinEntryViewModel::installEppHandler");
        }

        /**
         * Overridden to get informed when a page-timeout occurs.
         * @eventhandler
         * @return {boolean | undefined} <br>undefined: The base should handle the timeout situation (default implementation)
         * <br>false: The timeout is handled by yourself, but the view-service should send appropriate UIResult after leaving the function - {@link Wincor.UI.Service.ViewService#endView} will not be called!
         * <br>true: The timeout is handled by yourself completely, service should skip sending appropriate UIResult - {@link Wincor.UI.Service.ViewService#endView} will not be called!
         */
        onTimeout() {
            // overwrite base default - pinEntry does not support timeout-handling
            return false;
        }

        /**
         * Overridden to get informed when the user tries to cancel the transaction.
         * @eventhandler
         * @return {boolean | undefined} <br>undefined: The base should handle the cancel situation (default implementation)
         * <br>false: The cancel is handled by yourself, but the view-service should send appropriate UIResult after leaving the function - {@link Wincor.UI.Service.ViewService#endView} will not be called!
         * <br>true: The timeout is handled by yourself completely, service should skip sending appropriate UIResult - {@link Wincor.UI.Service.ViewService#endView} will not be called!
         */
        onCancel() {
            // overwrite base default - pinEntry does not support cancel-handling
            return false;
        }

        /**
         * Called when a command is executed either with click- or eppkey-binding.
         * Overrides {@link Wincor.UI.Content.BaseViewModel#onButtonPressed}
         * @param {String} id the command identifier of the command related to its DOM element,
         * where typically a click event has been occurred
         * @eventhandler
         */
        onButtonPressed(id) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `> PinEntryViewModel::onButtonPressed(${id})`);
            if(this.activatePinContainer()) { // prevent from executing any commands before readiness given
                if(content.designMode || content.designModeExtended) {
                    if(id === this.STANDARD_BUTTONS.CORRECT) {
                        this.resetPinDigits();
                    } else if(id === CMD_PIN || jQuery.isNumeric(id)) {
                        this.nextPinDigit();
                        if(this.currentPinLen() === this.maxPinLength && this.isAutoConfirm) {
                            super.onButtonPressed(CMD_PIN);
                        }
                    } else {
                        if(_pinEntryEtsModule) {
                            _pinEntryEtsModule.animateButtons(id);
                        }
                        super.onButtonPressed(id);
                    }
                } else {
                    if(!this.isEtsMode) {
                        super.onButtonPressed(id);
                    } else if(id === this.STANDARD_BUTTONS.CONFIRM || id === this.STANDARD_BUTTONS.CANCEL) { //ETS mode
                        if(_pinEntryEtsModule) {
                            _pinEntryEtsModule.animateButtons(id);
                        }
                        super.onButtonPressed(id);
                    }
                }
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< PinEntryViewModel::onButtonPressed");
            return true; // we delegated the "CORRECT" command to us, so return "true" - means "we handled the situation, no default action has to be called by the DialogBarVM!"
        }
    }
});
