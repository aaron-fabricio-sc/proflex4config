/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ MessageViewModel.js 4.3.1-210127-21-34ae33df-1a04bc7d
 */
define(["knockout", "basevm"], function(ko) {
    "use strict";
    console.log("AMD:MessageViewModel");

    const _logger = Wincor.UI.Service.Provider.LogProvider;
    const _eventService = Wincor.UI.Service.Provider.EventService;
    const _movements = Wincor.UI.Content.ObjectManager;

    const EVENT_INFO = _eventService.getEventInfo("TRANSACTION_MODULE");

    const MESSAGE_KEY_SUFFIX = "Message";
    const MESSAGE_KEY_LEVEL_SUFFIX = "Level";

    const CMD_SCROLL_DOWN = "BTN_SCROLL_DOWN";
    const CMD_SCROLL_UP = "BTN_SCROLL_UP";

    /**
     * The key for the message text
     * @type {string}
     * @private
     */
    let _messageKey;

    /**
     * The key for the message text level
     * @type {string}
     * @private
     */
    let _messageLevelKey;

    /**
     * The MessageViewModel basically provides observables for a message text {@link Wincor.UI.Content.MessageViewModel#messageText} and the level of the text
     * {@link Wincor.UI.Content.MessageViewModel#messageLevel}.
     * <p>
     * The message usually is part of a message box within a view or to become a generic header message - a message box which can appear
     * dynamically while any view is present except the message view itself.
     * <br>
     * The possible level of the message box are:<br>
     * <ul>
     *     <li>InfoBox</li>
     *     <li>WarningBox</li>
     *     <li>ErrorBox</li>
     * </ul>
     * </p>
     * Deriving from {@link Wincor.UI.Content.BaseViewModel} class.
     * @class
     * @since 1.0/00
     */
    Wincor.UI.Content.MessageViewModel = class MessageViewModel extends Wincor.UI.Content.BaseViewModel {


        /**
         * Contains the message text.
         * HTML text is allowed.
         * @type {ko.observable}
         * @bindable
         */
        messageText = null;

        /**
         * Observable depicts the escalation level message has to be shown.
         * The value is a string and could be either <code>InfoBox</code>, <code>WarningBox</code> or <code>ErrorBox</code>.
         * The level default is <code>InfoBox</code> for the normal <i>message.html</i>.
         * <br>
         * For escalation handling within <i>header.html</i> the default is usually <code>WarningBox</code>.
         * @default 'InfoBox'
         * @type {ko.observable}
         * @bindable
         */
        messageLevel = null;

        /**
         * Computed observable depicts whether the escalation message has to be shown.
         * The value is boolean and will automatically be set when this.messageText contains text other than empty "" or a white space " ".
         * This allows to be independent from the kind of attribute to be switched within the view.
         * @type {ko.computed}
         * @bindable
         */
        messageBoxVisible = null;

        /**
         * True, if the message handling should be done by this view model, false means that a
         * derived class can turn off and handles the message box by its own.
         * @default true.
         * @type {boolean}
         */
        isDefaultMessageHandling = true;

        /**
         * True, if the escalation handling should be done by this view model, false means that a
         * derived class can turn off and handle escalation management for itself.
         * @default true.
         * @type {boolean}
         */
        isEscalationSupported = true;

        /**
         * Initializes the member of this class.
         * @lifecycle viewmodel
         */
        constructor() {
            super();
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> MessageViewModel");
            // these members need to be instance-variables
            // simplify usage... anytime messageText is filled, messageBoxVisible returns changes to 'true'
            this.isDefaultMessageHandling = true;
            this.isEscalationSupported = true;
            this.messageText = ko.observable("");
            this.messageLevel = ko.observable(this.MESSAGE_LEVEL.INFO);
            // If the customizer wants to suppress the message box with its default message (GUI_*_...)
            // he has to configure an empty string "" as text.
            this.messageBoxVisible = ko.computed(() => { return this.messageText() !== "" });
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< MessageViewModel");
        }
        
        /**
         * Adding delegates to the commands for scrolling up and down.
         * Overrides {@link Wincor.UI.Content.BaseViewModel#observe}
         * @param {string} observableAreaId the area id to observe via knockout
         * @lifecycle viewmodel
         */
        observe(observableAreaId) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `> MessageViewModel::observe(${observableAreaId})`);
            super.observe(observableAreaId);
            this.cmdRepos.whenAvailable([CMD_SCROLL_DOWN]).then(() => this.cmdRepos.addDelegate({id: CMD_SCROLL_DOWN, delegate: this.onButtonPressed, context: this}));
            this.cmdRepos.whenAvailable([CMD_SCROLL_UP]).then(() => this.cmdRepos.addDelegate({id: CMD_SCROLL_UP, delegate: this.onButtonPressed, context: this}));
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< MessageViewModel::observe");
        }

        /**
         * Builds the key for the message text.
         * Override this method for an enhanced message key.
         * @returns {*|string}
         */
        buildMessageKey() {
            return this.buildGuiKey(MESSAGE_KEY_SUFFIX);
        }

        /**
         * Builds the key for the message text level.
         * Override this method for an enhanced message level key.
         * @returns {*|string}
         */
        buildMessageLevelKey() {
            return this.buildGuiKey(MESSAGE_KEY_SUFFIX, MESSAGE_KEY_LEVEL_SUFFIX);
        }

        /**
         * Shows/triggers the given message hint.
         * @param {Object} hint the message hint to show or null if the message should disappear.
         * Must contain messageText and messageLevel attributes as ko.observables or plain string.
         */
        showMessageHint(hint) {
            if(hint && hint.messageText && hint.messageLevel) {
                _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `* MessageViewModel::showMessageHint text=${ko.unwrap(hint.messageText)} with level=${ko.unwrap(hint.messageLevel)}`);
                this.messageText(ko.unwrap(hint.messageText));
                this.messageLevel(ko.unwrap(hint.messageLevel)); // level must be set after message because the message triggers the visibility of the hint box first
            } else {
                this.messageText("");
                this.messageLevel("");
            }
        }

        /**
         * Initializes the text and data.
         * This method reads the text keys with the suffix 'Message' and the level with the suffix 'Message_Level'.
         * @example
         * "GUI_*_InputHint_All_Message"
         * "GUI_*_InputHint_All_Message_Level"
         * "GUI_DepositEnvelopeDispenseWait_Message"
         * "GUI_*_Event_10007_HALFTIMEOUT_Message"
         * "GUI_*_Event_10007_HALFTIMEOUT_Message_Level"
         * @param {Object} args
         * @see {Wincor.UI.Content.BaseViewModel#onInitTextAndData}
         * @lifecycle viewmodel
         */
        onInitTextAndData(args){
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> MessageViewModel::onInitTextAndData()");
            // build the message key
            _messageKey = this.buildMessageKey();
            _messageLevelKey = this.buildMessageLevelKey();
            if (!this.designMode) {
                if(this.isDefaultMessageHandling) {
                    args.textKeys.push(_messageKey);
                    args.textKeys.push(_messageLevelKey);
                }
                if (this.isEscalationSupported) {
                    _eventService.registerForEvent(EVENT_INFO.ID_ESCALATION, EVENT_INFO.NAME, this.onEscalationEvent.bind(this), null, "ASCII");
                }
            } else { // basic design mode
                args.dataKeys.push(this.designTimeRunner.retrieveJSONData("MessageData")
                    .then(data => {
                        this.messageText(data.message);
                    }));
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< MessageViewModel::onInitTextAndData");
            return super.onInitTextAndData(args);
        }

        /**
         * Is called when text retrieving for message and level is ready.
         * @param {Object} result the result object with the text keys/value pairs
         * @lifecycle viewmodel
         */
        onTextReady(result) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> MessageViewModel::onTextReady()");
            // set message level if configured. Default is 'InfoBox'.
            let msgLevel = result[_messageLevelKey];
            if(msgLevel !== void 0 && msgLevel !== null ) {
                this.messageLevel(msgLevel);
            }
            let msg = result[_messageKey];
            if(msg !== void 0 && msg !== null) {
                _logger.log(_logger.LOG_ANALYSE, `. MessageViewModel::onTextReady messageText=${msg}, messageLevel=${msgLevel}`);
                try {
                    msg = this.labels.set(_messageKey, msg)(); // resolve potential variables in text and get the text back from the resulting observable
                } catch(e) {
                    msg = result[_messageKey];
                    _logger.error(`Error resolving variables for ${msg} error: ${e}`);
                }
                this.messageText(msg);
            }

            // ATTENTION: do not deliver any keys here, because this class could act as a base class and the inherited class
            // may want force initTextAndData with parameters as well and in that case this call is ignored by default.
            // when acting as a base class, do not call initTextAndData, subclass has to do it!

            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< MessageViewModel::onTextReady");
        }

        /**
         * Callback function for the event <code>EVENT_INFO.ID_ESCALATION</code> (10007)
         * @param {String} eventData Either <i>STARTED</i> or <i>HALFTIMEOUT</i>
         * @eventhandler
         */
        onEscalationEvent(eventData) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `> MessageViewModel::onEscalationEvent(${eventData})`);
            // build GUI text keys for event data
            const escalationEventMessageKey = this.buildGuiEventKey(EVENT_INFO.ID_ESCALATION.toString(), eventData, MESSAGE_KEY_SUFFIX);
            const escalationEventMessageLevelKey = this.buildGuiEventKey(EVENT_INFO.ID_ESCALATION.toString(), eventData, MESSAGE_KEY_SUFFIX, MESSAGE_KEY_LEVEL_SUFFIX);
            this.serviceProvider.LocalizeService.getText([escalationEventMessageKey, escalationEventMessageLevelKey], result => {
                this.vmContainer.sendViewModelEvent("ESCALATION_MESSAGE_AVAILABLE"); // interesting for header
                _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, ". MessageViewModel::onEscalationEvent text callback");
                // message text
                let msg = result[escalationEventMessageKey];
                // check whether text is available and different from current, only in that case we trigger the new message and inform about view updated
                if(msg !== void 0 && msg !== null && msg !== this.messageText()) {
                    // we set the messageText even if it's "", because we have messageBoxVisible as observable which is false in case of ""
                    this.messageText(msg);
                    this.notifyViewUpdated(this.buildGuiEventKey(EVENT_INFO.ID_ESCALATION.toString(), eventData));
                }
                // message level
                let msgLevel = result[escalationEventMessageLevelKey];
                if(msgLevel !== void 0 && msgLevel !== null) { // check whether message level has been configured for this context...if so the level is set
                    this.messageLevel(msgLevel);
                }
            });
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< MessageViewModel::onEscalationEvent");
        }

        /**
         * Handler function to remove/clear members.
         * Overridden to clear data list items and flags.
         * @lifecycle viewmodel
         */
        onDeactivated() {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> MessageViewModel::onDeactivated()");
            super.onDeactivated();
            this.messageText("");
            this.messageLevel(this.MESSAGE_LEVEL.INFO);
            this.isDefaultMessageHandling = true;
            this.isEscalationSupported = true;
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< MessageViewModel::onDeactivated");
        }

        /**
         * Handles on button pressed actions:<br>
         * <ul>
         *     <li>BTN_SCROLL_DOWN</li>
         *     <li>BTN_SCROLL_UP</li>
         * </ul>
         * @param {String} id the id of the command that was triggered
         * @returns {boolean} true, this function has handled the button pressed.
         * @eventhandler viewmodel
         */
        onButtonPressed(id) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `> MessageViewModel::onButtonPressed(${id})`);
            if(id === CMD_SCROLL_DOWN) {
                _movements.mobs[0].moveUp();
                this.cmdRepos.setActive(CMD_SCROLL_UP, true);
                this.cmdRepos.setActive(CMD_SCROLL_DOWN, _movements.mobs[0].canMoveUp());
            } else if(id === CMD_SCROLL_UP) {
                _movements.mobs[0].moveDown();
                this.cmdRepos.setActive(CMD_SCROLL_UP, _movements.mobs[0].canMoveDown());
                this.cmdRepos.setActive(CMD_SCROLL_DOWN, true);
            } else {
                super.onButtonPressed(id);
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< MessageViewModel::onButtonPressed");
            return true; // we handle the delegated onButtonPressed events!
        }
    }
});

