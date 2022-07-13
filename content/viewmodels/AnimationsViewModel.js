/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ AnimationsViewModel.js 4.3.1-210127-21-34ae33df-1a04bc7d
 */

define(["knockout", "extensions", "vm/MessageViewModel"], function(ko, ext) {
    "use strict";

    const _logger = Wincor.UI.Service.Provider.LogProvider;

    const HEADLINE_KEY_SUFFIX = "Headline";
    const INSTRUCTION_KEY_SUFFIX = "Instruction";
    const MESSAGE_KEY_SUFFIX = "Message";
    const LEVEL_KEY_SUFFIX = "Level";
    const CONTENT_KEYS_KEY = "ContentKeys";

    const CMD_HEADLINE = "HEADLINE";
    const CMD_INSTRUCTION = "INSTRUCTION";

    /**
     * This is the base class used by concrete animation viewmodels such as e.g. {@link Wincor.UI.Content.WithdrawalAnimationsViewModel}.
     * It provides functionality to manage event registrations and animation content keys.
     * <br>
     * The class derives from {@link Wincor.UI.Content.MessageViewModel} class.
     * <br>
     * An inherited animation class is able to register arbitrary device events in order to let the animated content change and/or
     * to control animated content by overriding the {@link Wincor.UI.Content.AnimationsViewModel#setAnimations} method:
     * @example
     *      this.eventRegistrations.push({
     *           eventNumber: EVENT_INFO.ID_CARD,
     *           eventOwner: EVENT_INFO.NAME
     *       });
     * @example
     *   setAnimations: function(resultArray) {
     *       //Card Animations:
     *       this.viewFlexCardEject(this.isAvailable(resultArray, "TakeCard"));
     *       this.viewFlexCardInsert(this.isAvailable(resultArray, "InsertCard"));
     *       super.setAnimations(resultArray);
     *   }
     * @class
     * @abstract
     * @since 1.0/00
     */
    Wincor.UI.Content.AnimationsViewModel = class AnimationsViewModel extends Wincor.UI.Content.MessageViewModel {

        /**
         * Guiding animation text for the please wait animation.
         * @type {function | ko.observable}
         * @bindable
         */
        animationTextPleaseWait = null;

        /**
         * Flag signals whether the 'waitspinner' animation has been started by a content key text configuration or not.
         * @type {function | ko.observable}
         * @bindable
         */
        waitSpinnerStartedByContentKey = null;

        /**
         * List for all current animation text keys.
         * @type {Array<String>}
         */
        animationTextKeys = null;

        /**
         * An object which contains several header related text key content:<br>
         * @default
         * {
         *       HEADLINE: "",
         *       INSTRUCTION: "",
         *       MESSAGE: "",
         *       LEVEL: this.MESSAGE_LEVEL.INFO // default
         * }
         * @type {Object}
         */
        itemTextKeys = null;

        /**
         * Takes the event registrations of the derived class.
         * @important Set this member before {@link Wincor.UI.Content.AnimationsViewModel#observe} is called.
         * Best fitting place is the constructor() of the derived class.
         * The viewmodel will register for this every contained event of type {eventNumber: int, eventOwner: string}.
         * @example
         * this.eventRegistrations.push({
         *       eventNumber: EVENT_INFO.ID_DEPOSIT,
         *       eventOwner: EVENT_INFO.NAME
         * });
         * @type {Array}
         */
        eventRegistrations = null;

        /**
         * Contains the array of active content keys.
         * @type {Array<String>}
         */
        currentAnimations = null;

        /**
         * Initializes this view model while the class is created by the class.system.
         * @lifecycle viewmodel
         */
        constructor() {
            super();
            this.eventRegistrations = [];
            this.itemTextKeys = {
                HEADLINE: "",
                INSTRUCTION: "",
                MESSAGE: "",
                LEVEL: this.MESSAGE_LEVEL.INFO // default
            };
            this.animationTextPleaseWait = ko.observable(""); // how to push this text in wait-popup?
            this.animationTextKeys = [];
            this.currentAnimations = [];
            this.waitSpinnerStartedByContentKey = ko.observable(false);
            // giving animation views the opportunity to setup markup based on the style type, such as 'DNSeries' or 'MercuryLight'
            // using a computed allows bindings to react on a style type change
            this.styleType = ko.pureComputed(() => {
                return this.viewHelper.styleResolver?.type();
            });
        }

        /**
         * Handler function to remove/clear members.
         * Overridden to clear data list items, flags and counter.
         * @lifecycle viewmodel
         */
        onDeactivated() {
            super.onDeactivated();
            this.animationTextPleaseWait(""); // how to push this text in wait-popup?
            this.animationTextKeys = [];
            this.itemTextKeys = {
                HEADLINE: "",
                INSTRUCTION: "",
                MESSAGE: "",
                LEVEL: this.MESSAGE_LEVEL.INFO // default
            };
            this.eventRegistrations = [];
            this.currentAnimations = [];
            this.waitSpinnerStartedByContentKey(false);
        }
        
        /**
         * This method usually initializes data before text and/or business data are retrieved, such as e.g. viewkey configuration.
         * Overrides {@link Wincor.UI.Content.BaseViewModel#observe}
         * @param {String} observableAreaId the area to observe via knockout
         * @lifecycle viewmodel
         */
        observe(observableAreaId) {
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `> AnimationsViewModel::observe(${observableAreaId})`);
            // first switch off default message handling. This means that in DesignMode we use
            // the default message handling of the MessageViewModel. In 'real mode' we override
            // the default message handling, because we dynamically have to change the visibility.
            this.isDefaultMessageHandling = this.designMode;
            super.observe(observableAreaId);
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< AnimationsViewModel::observe");
        }

        /**
         * Checks whether the given content key is part of the given result array.
         * The method checks case insensitive if the case sensitive check doesn't match.
         * @param {Array<String>} result the array with the retrieved content keys
         * @param {String} contentKey the content key to search for
         */
        isAvailable(result, contentKey) {
            return result && (result.includes(contentKey) || result.map(key => { return key.toLowerCase() }).includes(contentKey.toLowerCase()));
        }

        /**
         * Sets the proper animation content depending on the given result array.
         * Per default this method considers the content for a header message and for 'WaitSpinner' and 'PleaseWait' content keys.
         * Override this method in order to control different animation specific content keys.
         * @param {Array<String>} resultArray the result content keys
         */
        setAnimations(resultArray) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `> AnimationsViewModel::setAnimations(${resultArray})`);

            if(resultArray.includes(this.MESSAGE_LEVEL.ERROR)) {
                this.contentStyle(this.MESSAGE_LEVEL.ERROR);
            } else if(resultArray.includes(this.MESSAGE_LEVEL.WARNING)) {
                this.contentStyle(this.MESSAGE_LEVEL.WARNING);
            } else if(resultArray.includes(this.MESSAGE_LEVEL.INFO)) {
                this.contentStyle(this.MESSAGE_LEVEL.INFO);
            } else {
                this.contentStyle("");
            }
            if(this.isAvailable(resultArray, "WaitSpinner") || this.isAvailable(resultArray, "PleaseWait")) {
                this.hidePopupMessage();
                // because the shell view initializing removes a wait spinner in general to prevent from running a wait spinner without a reason
                this.vmContainer.whenActivated().then(() => {
                    setTimeout(() => {
                        // show wait spinner without modal overlay due to issue 1535678, because deposit in certain situations presents
                        // the wait spinner, but the customer should be able to touch any enabled button during spinning.
                        this.waitSpinnerStartedByContentKey(true);
                        this.viewHelper.showWaitSpinner(false, true);
                    }, 10);
                });
            } else {
                if (this.waitSpinnerStartedByContentKey()) {
                    this.waitSpinnerStartedByContentKey(false);
                    this.viewHelper.removeWaitSpinner();
                }
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< AnimationsViewModel::setAnimations");
        }

        /**
         * Initializes animation guiding text content by retrieving text from {@link Wincor.UI.Service.LocalizeService}.
         * Animation guiding text content is optional.
         * For example a withdrawal animation may display a guiding text which tells the amount which is currently animating.
         * @param {object} args contains attributes textKeys {array.<string|promise>} / dataKeys {array.<string|promise>}
         * @lifecycle viewmodel
         */
        onInitTextAndData(args) {
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `> AnimationsViewModel::onInitTextAndData(${JSON.stringify(args)})`);
            // get initial stuff and call super when ready
            if(!this.designMode) {
                // register if a subclass really pushes an event into eventRegistrations. This base class has no 'base/general events' it's interested in.
                for (let i = 0; i < this.eventRegistrations.length; ++i) {
                    this.serviceProvider.EventService.registerForEvent(this.eventRegistrations[i].eventNumber, this.eventRegistrations[i].eventOwner, this.onContentChangeEvent.bind(this), null, "ASCII");
                }

                // use this deferred object to
                args.textKeys.push(ext.Promises.promise(resolve => {
                    this.messageText("");
                    const contentKeysKey = this.buildGuiKey(CONTENT_KEYS_KEY);
                    this.serviceProvider.LocalizeService.getText(contentKeysKey, result => {
                        let resultArray = [];
                        if(result[contentKeysKey]) {
                            resultArray = result[contentKeysKey].split(",");
                        }
                        this.currentAnimations = resultArray;
                        this.setAnimations(resultArray);
                        for(let i = 0; i < resultArray.length; i++) {
                            this.animationTextKeys.push(this.buildGuiKey("AnimationText", resultArray[i]));
                        }
                        // initial message has also to be retrieved manually, since command refers to this.messageText
                        this.itemTextKeys.MESSAGE = this.buildGuiKey(MESSAGE_KEY_SUFFIX);
                        this.itemTextKeys.LEVEL = this.buildGuiKey(MESSAGE_KEY_SUFFIX, LEVEL_KEY_SUFFIX);
                        this.animationTextKeys.push(this.itemTextKeys.MESSAGE);
                        this.animationTextKeys.push(this.itemTextKeys.LEVEL);
                        // async request is ready, deliver promised data
                        resolve(this.animationTextKeys);
                    });
                }));
            } else {
                this.messageLevel(this.MESSAGE_LEVEL.INFO);
            }
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, "< AnimationsViewModel::onInitTextAndData");
            return super.onInitTextAndData(args);
        }

        /**
         * Overridden because the {@link Wincor.UI.Content.AnimationsViewModel#setAnimations} must be called again after a
         * timeout or a cancel request has been confirmed to continue.
         * @lifecycle viewmodel
         */
        onContinue() {
            // the user has selected more time or not to cancel after timeoutQuestion-/cancelQuestion-Popup
            this.setAnimations(this.currentAnimations);
        }

        /**
         * Called if any of the events of this.eventRegistrations is raised. This function will build the text keys (according to the eventID and eventData) and
         * retrieve the the updated texts and ContentKeys.
         * @param {String} eventData the contents of the event (ASCII expected)
         * @param {Number} eventID the ID of the event
         * @param {String} eventOwner the owner of the event, currently not used by this function to build the text keys
         * @eventhandler
         */
        onContentChangeEvent(eventData, eventID, eventOwner) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `> AnimationsViewModel::onContentChangeEvent(${eventData}, ${eventID}, ${eventOwner})`);
            eventID = eventID || "";
            // any event refreshes timer and reset escalation
            this.serviceProvider.ViewService.refreshTimeout();
            // probably JSON notated data?
            if(typeof eventData === "string" && (eventData.charAt(0) === "{" || eventData.charAt(eventData.length - 1) === "}")) {
                try {
                    eventData = JSON.parse(eventData);
                    eventData = eventData.content_key ? eventData.content_key : "";
                } catch(e) {
                    eventData = "";
                    _logger.error(`AnimationsViewModel::onContentChangeEvent Parse error, invalid JSON notated data=${eventData} for event id ${eventID} and ${eventOwner}: ${e}`);
                }
            }
            if(eventData) { // the following buildGuiEvent keys expecting correct meaningful -eventData
                const self = this;
                let textKeys = [];
                this.itemTextKeys.HEADLINE = this.buildGuiEventKey(eventID, eventData, HEADLINE_KEY_SUFFIX);
                textKeys.push(this.itemTextKeys.HEADLINE);
                this.itemTextKeys.INSTRUCTION = this.buildGuiEventKey(eventID, eventData, INSTRUCTION_KEY_SUFFIX);
                textKeys.push(this.itemTextKeys.INSTRUCTION);
                this.itemTextKeys.MESSAGE = this.buildGuiEventKey(eventID, eventData, MESSAGE_KEY_SUFFIX);
                textKeys.push(this.itemTextKeys.MESSAGE);
                this.itemTextKeys.LEVEL = this.buildGuiEventKey(eventID, eventData, MESSAGE_KEY_SUFFIX, LEVEL_KEY_SUFFIX);
                textKeys.push(this.itemTextKeys.LEVEL);
                // getContentKeys first, then update the texts
                const textKeyContentKeys = this.buildGuiEventKey(eventID, eventData, CONTENT_KEYS_KEY);
                this.serviceProvider.LocalizeService.getText(textKeyContentKeys, function eventDrivenContentUpdate(resultContent) {
                    _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, `* AnimationsViewModel::eventDrivenContentUpdate(${JSON.stringify(resultContent)})`);
                    let contentKeysArray;
    
                    if(resultContent[textKeyContentKeys] === "") {
                        // A Text-Key is configured, but contains no ContentKeys: do not show any animation
                        contentKeysArray = [];
                    } else if(resultContent[textKeyContentKeys] === null) {
                        // A Text-Key is not configured: do not change the animations
                        contentKeysArray = null;
                    } else {
                        contentKeysArray = resultContent[textKeyContentKeys].split(",");
                    }
    
                    // now that we know the contentKeys, get the animation text for every contentKey
                    if(contentKeysArray) {
                        for(let i = 0; i < contentKeysArray.length; i++) {
                            textKeys.push(self.buildGuiEventKey(eventID, eventData, "AnimationText", contentKeysArray[i]));
                        }
                    }
    
                    self.serviceProvider.LocalizeService.getText(textKeys, function eventDrivenTextUpdate(result) {
                        _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, `* AnimationsViewModel::eventDrivenTextUpdate(${JSON.stringify(result)})`);
                        // all data gathered, now update content and text
                        if(contentKeysArray) {
                            self.currentAnimations = contentKeysArray;
                            self.setAnimations(contentKeysArray);
                        }
                        // walk through the textkeys and remove those which are null to avoid removing currently displayed text
                        // if a text should really be removed, an empty text ("") has to be configured
                        for(let textKey in result) {
                            if(result.hasOwnProperty(textKey)) {
                                if(result[textKey] === null) {
                                    delete result[textKey];
                                }
                            }
                        }
                        self.onTextReady(result);
                    });
                });
            }
            this.notifyViewUpdated(this.buildGuiEventKey(eventID, eventData)); // -eventData usually set, but empty data are also possible here
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< AnimationsViewModel::onContentChangeEvent");
        }

        /**
         * Is called when text retrieving for a header message text or a please wait guiding text is ready during viewmodel life-cycle.
         * @param {object} result the result object with the text keys/value pairs
         * @lifecycle viewmodel
         */
        onTextReady(result) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> AnimationsViewModel::onTextReady()");
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `. result:\n${JSON.stringify(result, null, " ")}`);
            // headline, instruction and message / level might have been changed
            if(result[this.itemTextKeys.HEADLINE] !== void 0 && result[this.itemTextKeys.HEADLINE] !== null) {
                this.cmdRepos.setCmdLabel(CMD_HEADLINE, result[this.itemTextKeys.HEADLINE]);
            }

            if(result[this.itemTextKeys.INSTRUCTION] !== void 0 && result[this.itemTextKeys.INSTRUCTION] !== null) {
                this.cmdRepos.setCmdLabel(CMD_INSTRUCTION, result[this.itemTextKeys.INSTRUCTION]);
            }

            if(result[this.itemTextKeys.MESSAGE] !== void 0 && result[this.itemTextKeys.MESSAGE] !== null) {
                // If the customizer wants to suppress the message box with its default message (GUI_*_...)
                // or a currently displayed messageBox (this function is also called from eventDrivenTextUpdate, see above) then
                // he has to configure an empty string "" as text.
                this.messageText(result[this.itemTextKeys.MESSAGE]);
            } else if(this.messageText()) { // reset a shown message, because an event driven text update may have new instruction text which can't seen when header message is present
                this.messageText("");
            }

            if(result[this.itemTextKeys.LEVEL] !== void 0 && result[this.itemTextKeys.LEVEL] !== null) {
                this.messageLevel(result[this.itemTextKeys.LEVEL]);
            } else {
                this.messageLevel(this.MESSAGE_LEVEL.INFO);
            }

            // ContentKeys general: PleaseWait
            for(let key in result) {
                if(result.hasOwnProperty(key) && result[key] !== void 0 && result[key] !== null) {
                    if(key.indexOf("AnimationText_PleaseWait") !== -1) {
                        this.animationTextPleaseWait(result[key]);
                        this.messageText(result[key]);
                    }
                }
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< AnimationsViewModel::onTextReady");
        }
    }
});
