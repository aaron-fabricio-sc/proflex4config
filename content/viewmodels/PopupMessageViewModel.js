/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ PopupMessageViewModel.js 4.3.1-210127-21-34ae33df-1a04bc7d

*/
define(["jquery", "knockout", "code-behind/ViewHelper", "basevm"], function(jQuery, ko, viewHelper) {
    "use strict";
    console.log("AMD:PopupMessageViewModel");

    const _logger = Wincor.UI.Service.Provider.LogProvider;
    const _viewService = Wincor.UI.Service.Provider.ViewService;
    const _adaService = Wincor.UI.Service.Provider.AdaService;

    /**
     * Will be set in initialize
     * @type {String}
     * @private
     */
    let CMD_CONFIRM;

    /**
     * Will be set in initialize
     * @type {String}
     * @private
     */
    let CMD_CANCEL;

    /**
     * The key for the question text
     * @type {string}
     * @private
     */
    let QUESTION_KEY;

    /**
     * The key for the message text
     * @type {string}
     * @private
     */
    let MESSAGE_KEY;

    /**
     * The key for the message text level
     * @type {string}
     * @private
     */
    let MESSAGE_LEVEL_KEY;

    let VIDEO_KEY;

    let IMAGE_KEY;

    /**
     * This class is used for popup-messages within a view.
     * Deriving from {@link Wincor.UI.Content.BaseViewModel} class.
     * @class
     */
    Wincor.UI.Content.PopupMessageViewModel = class PopupMessageViewModel extends Wincor.UI.Content.BaseViewModel {

        timerId = -1;
        timeoutValue = -1;
        intervalId = -1;
        intervalValue = -1;
        options = null;
        message = null;
        message1 = null;
        message1Ada = "";
        video = null;
        image = null;

        /**
         * Observable depicts the escalation level message has to be shown.
         * The value is a string and could be either <code>InfoBox</code>, <code>WarningBox</code> or <code>ErrorBox</code>.
         * The level default is <code>InfoBox</code> for the normal message.html.
         * For escalation handling within header.html the default is usually <code>WarningBox</code>.
         * @default 'InfoBox'
         * @type {function}
         * @bindable
         */
        messageLevel = null;
        
        /**
         * Constructor.
         * @param {string} cmdConfirmId the id for the 'CONFIRM' command
         * @param {string} cmdCancelId the id for the 'CANCEL' command
         */
        constructor(cmdConfirmId, cmdCancelId) {
            super();
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `> PopupMessageViewModel(${cmdConfirmId},${cmdCancelId})`);
            CMD_CONFIRM = cmdConfirmId;
            CMD_CANCEL = cmdCancelId;
            this.message = ko.observable("");
            this.message1 = ko.observable("");
            this.messageLevel = ko.observable(this.MESSAGE_LEVEL.INFO);
            this.video = ko.observable("");
            this.image = ko.observable("");
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< PopupMessageViewModel");
        }

        /**
         * Handler function to remove/clear members.
         * Overridden to clear messages.
         * Attention: Do not assign new ko.observables to any member, clear the existing ones instead only !
         */
        onDeactivated() {
            super.onDeactivated();
            this.message("");
            this.message1("");
            this.messageLevel(this.MESSAGE_LEVEL.INFO);
            this.video("");
            this.image("");
            this.timeoutValue = -1;
            this.intervalValue = -1;
        }
        
        observe(observableAreaId) {
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `> PopupMessageViewModel::observe(${observableAreaId})`);
            viewHelper.removeWaitSpinner();
            super.observe(observableAreaId);
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< PopupMessageViewModel::observe");
        }
		
        stopInterval() {
            if (this.intervalId !== -1) {
                window.clearInterval(this.intervalId);
                this.intervalId = -1;
                _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "! PopupMessageViewModel::stopInterval ... interval cleared.");
            }			
        }

        onInitTextAndData(args) {
            this.options = this.options || this.getPopupOptions();
            // key buildings...
            QUESTION_KEY = this.buildGuiKey(this.options.type, "Message");
            MESSAGE_KEY = this.buildGuiKey(this.options.type, "Message1");
            MESSAGE_LEVEL_KEY = this.buildGuiKey("Message", "Level");
            VIDEO_KEY = this.buildGuiKey(this.options.type, "Video");
            IMAGE_KEY = this.buildGuiKey(this.options.type, "Image");

            this.message1KeyAda = this.buildGuiKey(this.options.type, "Message1", "ADA");

            if (this.options.type === "TIMEOUT_POPUP") {
                // preset observable
                this.message("Would you like a bit more time?<br>Press Confirm to continue or Cancel to quit.");
                this.message1("The transaction timed out.");
                // check if beep period is needed
                let viewConfig = _viewService.viewContext.viewConfig;
                _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `* PopupMessageViewModel::onInitTextAndData ADA state = ${_adaService.state}`);
                if (_adaService.state !== _adaService.STATE_VALUES.SPEAK && viewConfig) {
                    this.intervalValue = viewConfig.popup.beepontimeoutperiod;
                    _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, `* PopupMessageViewModel::onInitTextAndData intervalValue = '${this.intervalValue}'`);
                }

            } else if (this.options.type === "CANCEL_POPUP") {
                this.message("Do you want to cancel the transaction?<br>Press Confirm to quit.");
                this.message1("The transaction will be cancelled by your request.");
            } else if (this.options.type === "HELP_POPUP") {
                if(this.options.message) {
                    this.message(this.options.message);
                } else {
                    this.message("Help question???");
                }

                this.message1("Please press End help to return.");
            }
            args.textKeys = args.textKeys.concat([QUESTION_KEY, MESSAGE_KEY, VIDEO_KEY, IMAGE_KEY, this.message1KeyAda]);
            return super.onInitTextAndData(args);
        }

        /**
         * Replaces a [#POPUP_TYPE#] occurrence in a label with the concrete popup-type
         * @param key
         * @returns {string}
         */
        onScannedLabel(key) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `> PopupMessageViewModel::onScannedLabel(${key})`);
            let ret = key.replace("[#POPUP_TYPE#]", this.options.type).replace("__", "_");
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `< PopupMessageViewModel::onScannedLabel returns ${ret}`);
            return ret;
        }

        /**
         * Called when texts have been delivered.
         * @param {Object} result is filled with key-value pairs of the requested labels
         */
        onTextReady (result) {
            if (result[QUESTION_KEY] !== "") { // main message
                this.message(result[QUESTION_KEY]);
            }
            let msgLevel = result[MESSAGE_LEVEL_KEY];
            if(msgLevel !== void 0 && msgLevel !== null) {
                this.messageLevel(msgLevel);
            }
            if (result[MESSAGE_KEY] !== "") { // second message
                this.message1(result[MESSAGE_KEY]);
            }
            else {
                this.message1(""); // remove default text in order there is no popup desired probably
            }
            if(result[VIDEO_KEY]) {
                this.video(result[VIDEO_KEY]);
            }
            if(result[IMAGE_KEY]) {
                this.image(result[IMAGE_KEY]);
            }
            if (result[this.message1KeyAda] !== "") {
                this.message1Ada = result[this.message1KeyAda];
            }
        }

        /**
         * Starts beeping with interval of "this.intervalValue"
         * @see stopInterval
         */
        startIntervalBeeping() {
            //interval check
            if(this.intervalValue > 0) {
                this.intervalId = window.setInterval(() => {
                    _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "* PopupMessageViewModel::startIntervalBeeping interval ... beeping: 8 (CCSELFW_SIU_WARNING)!");
                    this.serviceProvider.BeepService.beep(8, null);
                }, this.intervalValue);
            } else {
                _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "* PopupMessageViewModel::startIntervalBeeping intervalValue is < 1, interval not started.");
            }
        }

        /**
         * If observable "this.message1" contains text, this function hides buttons and displays the timeout message.
         * Otherwise or after timeout of timeout-message, the function "this.endTimeoutMessage" is called
         * @param {String} [reason=""] Reason for second message is used for UIDetailedResult in viewService::endView function
         */
        showSecondMessage(reason = "") {
            _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, "> PopupMessageViewModel::showTimeoutMessage()");
            // check whether we have a further message text (message1), if so we start a new (short) timer
            // in order to present a new message, usually "You do not input for a while, timeout."
            if(this.message1()) {
                // since the second message can't be canceled or confirmed we must hide possible buttons...
                if(this.cmdRepos.hasCommand(CMD_CONFIRM)) {
                    this.cmdRepos.setVisible(CMD_CONFIRM, false);
                }
                if(this.cmdRepos.hasCommand(CMD_CANCEL)) {
                    this.cmdRepos.setVisible(CMD_CANCEL, false);
                }

                if(!this.designMode) {
                    this.message(this.message1()); // set the second message
                    if(this.isAdaEnabled()) {
                        setTimeout(() => { // ensure that the ADA key echo is spoken before the new message is spoken
                            _adaService.speak(this.message1Ada, 1, 10, null);
                        }, 1);
                    }
                    this.timeoutValue = parseInt(_viewService.messageTimeout);
                    if(this.designModeExtended && this.timeoutValue === -1 ) {
                        this.timeoutValue = 5000; // set fallback timer value to avoid that popup is never closed when there are no button to press anymore
                    }
                    this.vmHelper.startTimer(this.timeoutValue, this.options.type).onTimeout(() => {
                        this.endTimeoutMessage(reason);
                    });
                } else {
                    this.endTimeoutMessage(reason);
                }
            } else { // no second message (message1)
                this.endTimeoutMessage(reason);
            }
            _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, "< PopupMessageViewModel::showTimeoutMessage");
        }

        /**
         * Stops beep interval
         */
        endTimeoutMessage(reason) {
            this.stopInterval();
            if(!this.designMode) {
                _viewService.endView(this.options.type === "CANCEL_POPUP" ? _viewService.UIRESULT_CANCEL_USER : _viewService.UIRESULT_TIMEOUT_USER, reason);
            }
        }

        /**
         * After bindings have been applied and we are started as popup, a timer
         */
        onAfterApplyBindings () {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> PopupMessageViewModel::onAfterApplyBindings()");
            if(this.vmHelper.isPopupActive()) {
                // we are ready, start timer
                if(!this.options.timeoutValue) { // no explicit timeout value available?
                    this.timeoutValue = !this.designMode ? parseInt(_viewService.confirmationTimeout) : 30000;
                } else {
                    this.timeoutValue = parseInt(this.options.timeoutValue);
                }
                if(!this.designMode) {
                    // We have to clear the running refresh timer (ViewService) because we wanna start an own timer at next.
                    // This becomes important in the case the running refresh timeout (ViewService) is less or equal
                    // to the "ConfirmationTimeout" used for this popup.
                    _viewService.clearTimeout();
                }
                if(this.timeoutValue !== -1) {
                    this.timerId = this.vmHelper.startTimer(this.timeoutValue, this.options.type).onTimeout(() => {
                        this.showSecondMessage();
                    });
                }
                else {
                    _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "* PopupMessageViewModel::onAfterApplyBindings timeoutValue is -1, timer not started.");
                }
                this.startIntervalBeeping();
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< PopupMessageViewModel::onAfterApplyBindings");
        }

        /**
         * Override base
         */
        onButtonPressed(id) {
            if (this.timerId !== -1) {
                window.clearTimeout(this.timerId);
                this.timerId = -1;
            }
            this.stopInterval();
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `> PopupMessageViewModel::onButtonPressed(${id})`);
            if(!this.designMode) {
                _viewService.clearTimeout();
            }

            // set the last command id
            this.options.result = this.options.result || {};
            this.options.result.id = id;

            // only if we are started as a popup, we handle the cancel / confirm stuff here... otherwise (started as a view) let base handle it
            if (!this.vmHelper.isPopupActive()) {
                super.onButtonPressed(id);
                return;
            }

            if(!this.designMode && (id === "CONFIRM" && this.options.type === "CANCEL_POPUP" || id === "CANCEL" && this.options.type !== "CANCEL_POPUP")) {
                viewHelper.stopTimeoutProgressBar(); // stop a possible running timeout progress bar
                // cancel or timeout
                let interactionResult = this.options.type === "CANCEL_POPUP" ? "CANCEL" : "";
                this.cmdRepos.setVisible([CMD_CONFIRM, CMD_CANCEL], false);
                this.showSecondMessage(interactionResult);
            } else { // go ahead!
                if(!this.designMode) {
                    _viewService.refreshTimeout();
                }
                viewHelper.stopTimeoutProgressBar(); // stop a possible running timeout progress bar
                this.hidePopupMessage();
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< PopupMessageViewModel::onButtonPressed");
        }
    }
});

