/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ FormEntryViewModel.js 4.3.1-210127-21-34ae33df-1a04bc7d
 */
define(["knockout", "extensions", "flexuimapping", "vm/ListViewModel"], function(ko, ext, uiMapping) {
    "use strict";

    const _logger = Wincor.UI.Service.Provider.LogProvider;
    const _dataService = Wincor.UI.Service.Provider.DataService;
    const _validateService = Wincor.UI.Service.Provider.ValidateService;

    /**
     * Property key for access to the JSON list of input fields
     * @const
     * @type {string}
     */
    const PROP_FORM_ENTRY_DATA = "PROP_SELECTION_GROUPS";

    /**
     * Derived from {@link Wincor.UI.Content.ListViewModel} <BR>
     * This viewmodel handles several input fields which are generically generated dependent on the property CCTAFW_PROP_GENERIC_LIST_SELECTION_JSON_GROUPS.
     * @class
     */
    Wincor.UI.Content.FormEntryViewModel = class FormEntryViewModel extends Wincor.UI.Content.ListViewModel {

        groups = null;
        numberOfFields = 0;

        numDigits = ["0","1","2","3","4","5","6","7","8","9"];
        numDigitsId = "NUMDIGITS";

        selectButtonsId = "SELECTBUTTONS";

        prevButton = ["BTN_SCROLL_UP"];
        prevButtonId = "PREVBUTTON";
        nextButton = ["BTN_SCROLL_DOWN"];
        nextButtonId = "NEXTBUTTON";

        ITEM_TYPE = {
            TEXT: "text",
            ALPHANUMERIC: "alphanumeric",
            NUMBER: "number",
            NUMERIC: "numeric",
            AMOUNT:  "amount"
        }

        VALIDATION_STATE = {
            VALID: "valid",
            INVALID: "invalid",
            EMPTY: "empty"
        };

        /**
         * This id is used for the timeout of the check routines.
         * @type {Number}
         * @private
         */
        _timerId = -1;

        /**
         * This is the timeout value in milliseconds to display the error messages due to input errors.
         * @type {Number}
         * @private
         */
        messageDelayTimeout = null;

        /**
         * This is the timeout value in milliseconds to remove the error messages / confirm message
         * @type {Number}
         * @private
         */
        messageRemoveTimeout = null;

        /**
         * This observable stores the text of the key GUI_[VK]_ConfirmText. <BR>
         * This text is the final confirm text that will be displayed in select mode, if all input fields have successfully been entered: <BR>
         * e.g. "You have pressed Confirm" + "Please check your inputs and press Confirm"
         * @type {function | ko.observable}
         * @bindable
         */
        confirmText = null;

        /**
         * This observable stores a flag for the speaking of the final confirm text: <BR>
         *  true: "You have pressed Confirm" + "Please check your inputs and press Confirm" (GUI_xxx_ConfirmText_ADA) <BR>
         *  false:  "You have pressed Confirm" + "Please select an input field and make your input." (GUI_xxx_Instruction_ADA) <BR>
         * @type {function | ko.observable}
         * @bindable
         */
        speakConfirmText = null;

        /**
         * This observable stores the flag whether the error text is to be spoken. <BR>
         *  false: do not speak the error text <br>
         *  true: speak the error text <BR>
         * @type {function | ko.observable}
         * @bindable
         */
        speakErrorText = null;

        /**
         * This observable stores the flag whether the Confirm button is to be activated or not. <BR>
         * It will only be activated in the select mode, if all input fields have successfully been entered. <BR>
         *  false: do not activate the Confirm button <BR>
         *  true: activate the Confirm button<BR>
         * @type {function | ko.observable}
         * @bindable
         */
        activateConfirm = null;

        /**
         * This observable stores the flag whether the edit mode is active or not. <BR>
         *  false: the edit mode is not active (select mode is active) <BR>
         *  true: the edit mode is active <BR>
         * @type {function | ko.observable}
         * @bindable
         */
        editMode = null;

        /**
         * This observable stores the type of the active item, e.g. "number", "numeric", "text", "alphanumeric", "amount"
         * @type {function | ko.observable}
         * @bindable
         */
        activeItemType = null;

        /**
         * This observable stores the active item
         * @type {function | ko.observable}
         * @bindable
         */
        activeItemId = null;

        /**
         * Overrides {@link Wincor.UI.Content.ListViewModel#constructor}
         * Initializes the members to become observables.
         * @lifecycle viewmodel
         */
        constructor() {
            super();
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `> FormEntryViewModel`);

            this._timerId = -1;
            this.messageDelayTimeout = 1000;
            this.messageRemoveTimeout = 100;

            this.activeItem = null;
            this.initialInstruction = "";
            this.groups = [];
            this.confirmText = ko.observable("");
            this.speakErrorText = ko.observable(false);
            this.speakConfirmText = ko.observable(false);

            this.activeItemId = ko.observable("");

            this.initFinished = false;
            this.activateConfirm = ko.observable(false);
            this.correctActivated = false;
            this.editMode = ko.observable(false);

            this.selectButtons = [];
            this.selectButtonsAct = [];
            this.inputIds = [];
            this.activeItemType = ko.observable("");
            this.numberOfFields = 0;
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `< FormEntryViewModel`);
        }

        /**
         * Overrides {@link Wincor.UI.Content.ListViewModel#onDeactivated}
         * Is called when this viewmodel gets deactivated during the life-cycle.
         * @lifecycle viewmodel
         */
        onDeactivated() {
            super.onDeactivated();
            this.groups = [];
            this.selectButtons = [];
            this.selectButtonsAct = [];
            this.inputIds = [];
            this.speakErrorText(false);
            this.speakConfirmText(false);
            this.numberOfFields = 0;
            this.activeItemId("");
            this.editMode(false);
        }
        
        /**
         * Activates / deactivates the Correct button dependent on the parameter enable
         * @param {boolean} enable if true Correct is to be activated otherwise not.
         */
        handleCorrectState(enable) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `> FormEntryViewModel::handleCorrectState( ${enable} )`);
            this.cmdRepos.whenAvailable([this.STANDARD_BUTTONS.CORRECT])
                .then(() => {
                    this.cmdRepos.setActive([this.STANDARD_BUTTONS.CORRECT], enable);
                    this.correctActivated = enable;
                });
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `< FormEntryViewModel::handleCorrectState`);
        }

        /**
         * Checks whether all input fields have correctly been entered. <BR>
         * Activates / deactivates the final Confirm button dependent on the validation states of the input fields <br>
         * in case of selection mode or in case of only 1 input field.
         */
        onInputChangedSetButtons() {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `> FormEntryViewModel::onInputChangedSetButtons()`);

            let internalActivateConfirm = true;

            if ( this.editMode() === false || this.numberOfFields === 1) {

                for (let i = 0; i < this.groups.length; i++) {
                    for (let k = 0; k < this.groups[i].items.length; k++) {
                        if (this.groups[i].items[k].successfullyChecked() === false)
                            internalActivateConfirm = false;
                    }
                }

                _logger.LOG_INFO && _logger.log(_logger.LOG_INFO, `* FormEntryViewModel::onInputChangedSetButtons() - internalActivateConfirm = ${internalActivateConfirm}`);

                this.cmdRepos.whenAvailable([this.STANDARD_BUTTONS.CONFIRM])
                    .then(() => {
                        this.cmdRepos.setActive([this.STANDARD_BUTTONS.CONFIRM], internalActivateConfirm);
                    });

                // set speakConfirmText flag
                // false --> "You have pressed Confirm" + "Please select an input field and make your input." (GUI_xxx_Instruction_ADA)
                // true  --> "You have pressed Confirm" + "Please check your inputs and press Confirm" (GUI_xxx_ConfirmText_ADA)
                // ""    --> "You have pressed Confirm" + "" (final Confirm button to leave the view)
                if (internalActivateConfirm) {
                    this.speakConfirmText(true);
                    this._timerId = this.vmContainer.viewModelHelper.startTimer(500).onTimeout(() => {

                        this.vmContainer.sendViewModelEvent(this.vmContainer.EVENT_ON_MESSAGE_AVAILABLE, {
                            messageText: this.confirmText(),
                            messageLevel: "InfoBox"
                        });
                    });

                    if (this.activateConfirm() === false) {
                        this.activateConfirm(true);
                    }
                } else { // internalActivateConfirm === false
                    this.speakConfirmText(false);
                    this.activateConfirm(false);
                }
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT,  `< FormEntryViewModel::onInputChangedSetButtons() internalActivateConfirm = ${internalActivateConfirm}` );
        }

        /**
         * Performs the actions that have to be done when there is a change from edit mode to select mode and vice versa. <BR> <BR>
         * After a change to the edit mode:
         * <p>
         *     <li>activates Confirm button </li>
         *     <li>activates / deactivates Correct button </li>
         *     <li>suspends selectButtonsAct </li>
         *     <li>resumes numDigits (provided VK is not active) </li>
         * </p>
         * <BR>
         * After a change to the select mode:
         * <p>
         *     <li>deactivates Confirm button </li>
         *     <li>deactivates Correct button </li>
         *     <li>resumes selectButtonsAct </li>
         *     <li>suspends numDigits  </li>
         * </p>
         *
         * @param {Object} actItem active item
         * @param {boolean} resumeNumDigits flag whether the numDigits are to be resumed (default = true)
         */
        onEditModeChanged(actItem = null, resumeNumDigits = true) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT,  `> FormEntryViewModel::onEditModeChanged()`);

            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `. FormEntryViewModel::onEditModeChanged(), editMode: ${this.editMode()}, resumeNumDigits: ${resumeNumDigits}` );

            if (this.editMode()) { // edit mode

                if ( this.numberOfFields > 1 || (this.numberOfFields === 1 && actItem && actItem.successfullyChecked() === true)) {

                    this.cmdRepos.whenAvailable([this.STANDARD_BUTTONS.CONFIRM])
                        .then(() => {
                            this.cmdRepos.setActive([this.STANDARD_BUTTONS.CONFIRM], true);
                        });
                }

                if (actItem && actItem.value() !== "") {
                    this.handleCorrectState(true);
                } else if (actItem && actItem.value() === "") {
                    this.handleCorrectState(false);
                }

                this.selectButtonsAct = [];
                if ( actItem ) {
                    // do not suspend act item.id (but do suspend "BTN_" + item.id )
                    for ( let i=0; i < this.selectButtons.length; i++ ) {
                        if (!( this.selectButtons[i] === actItem.id )  ) {
                            this.selectButtonsAct.push(this.selectButtons[i]);
                        }
                    }
                } else {
                    this.selectButtonsAct = this.selectButtons;
                }

                _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `. FormEntryViewModel::onEditModeChanged selectButtons   : ${this.selectButtons}` );
                _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `. FormEntryViewModel::onEditModeChanged selectButtonsAct: ${this.selectButtonsAct}` );

                if ( this.selectButtonsAct.length > 0 ) {
                    // only if there are several input fields (more than 1)
                    this.cmdRepos.suspend(this.selectButtonsAct, this.selectButtonsId);
                }

                _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `. FormEntryViewModel::onEditModeChanged isActive(this.prevButton[0]): ${this.cmdRepos.isActive(this.prevButton[0])}  isActive(this.nextButton[0]): ${this.cmdRepos.isActive(this.nextButton[0])}`  );

                if ( this.cmdRepos.isActive(this.prevButton[0]) ) {
                    this.cmdRepos.suspend( this.prevButton, this.prevButtonId );
                }

                if ( this.cmdRepos.isActive(this.nextButton[0]) ) {
                     this.cmdRepos.suspend( this.nextButton, this.nextButtonId );
                }

                // do not resume numDigits if VK is active
                if ( resumeNumDigits ) {
                    this.cmdRepos.resume( this.numDigits, this.numDigitsId );
                }

                if (this.activateConfirm()) {
                    // delete Confirm message
                    this._timerId = this.vmContainer.viewModelHelper.startTimer(this.messageRemoveTimeout).onTimeout(() => {
                        this.vmContainer.sendViewModelEvent(this.vmContainer.EVENT_ON_MESSAGE_AVAILABLE, {
                            messageText: "",
                            messageLevel: ""
                        });
                    });
                    this.activateConfirm(false);
                    this.speakConfirmText(false);
                }


            } else { // selection mode
                // selection mode --> numberOfFields > 1
                this.cmdRepos.whenAvailable([this.STANDARD_BUTTONS.CONFIRM])
                    .then(() => {
                        this.cmdRepos.setActive([this.STANDARD_BUTTONS.CONFIRM], false);
                    });

                this.handleCorrectState(false);

                this.cmdRepos.suspend(this.numDigits, this.numDigitsId);

                if (this.selectButtonsAct.length > 0) {
                    // only if there are several input fields (more than 1)
                    this.cmdRepos.resume(this.selectButtonsAct, this.selectButtonsId);
                }
                this.cmdRepos.resume(this.prevButton, this.prevButtonId);
                this.cmdRepos.resume(this.nextButton, this.nextButtonId);

                // delete error message (in selection mode)
                if (!this.activateConfirm()) {
                    this._timerId = this.vmContainer.viewModelHelper.startTimer(this.messageRemoveTimeout).onTimeout(() => {
                        this.vmContainer.sendViewModelEvent(this.vmContainer.EVENT_ON_MESSAGE_AVAILABLE, {
                            messageText: "",
                            messageLevel: ""
                        });
                    });
                }

                this.cmdRepos.setCmdLabel("INSTRUCTION", this.initialInstruction);
            }
        }

        /**
         * Initializes the DOM-associated objects and introduces the observable area id to the binding processor. <br>
         * {@link BaseViewModel#observe} is invoked in order to apply all bindings of the observable area to knockoutjs. <br>
         * Overrides {@link Wincor.UI.Content.ListViewModel#observe}
         * @param {String} observableAreaId     The area id to observe via knockout
         * @param {Object=} visibleLimitsObject The visible limits object for the view. <br> Usually necessary for a softkey based view.<br>
         *                                      A typical visible limits object looks like: { visibleLimits: { max: 8 }}
         * @lifecycle viewmodel
         */
        observe(observableAreaId, visibleLimitsObject) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT,  `> FormEntryViewModel::observe(${observableAreaId})`);

            // delegate us to the onButtonPressed
            const self = this;
            self.cmdRepos.whenAvailable([self.STANDARD_BUTTONS.CONFIRM]).then(()=>self.cmdRepos.addDelegate({id: 'CONFIRM', delegate: self.onButtonPressed, context: self}));
            self.cmdRepos.whenAvailable([self.STANDARD_BUTTONS.CORRECT]).then(()=>self.cmdRepos.addDelegate({id: 'CORRECT', delegate: self.onButtonPressed, context: self}));

            super.observe(observableAreaId, visibleLimitsObject);

            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< FormEntryViewModel::observe");
        }

        /**
         * Enhances the given item data object.
         * Attribute values may be primitive values / observables afterwards.
         * This function must be called before "enhanceItemDataWithComputedObservables" for proper attribute creation
         * @param {Object} item the item object to enhance with:
         * <ul>
         *     <li>{String} formatOption</li>
         *     <li>{boolean} clearByCorrect</li>
         *     <li>{boolean} mandatory</li>
         *     <li>{number} minValue</li>
         *     <li>{number} maxValue</li>
         *     <li>{number} minLen</li>
         *     <li>{number} maxLen</li>
         *     <li>{number} multiplier</li>
         *     <li>{boolean} allowLeadingZero</li>
         *     <li>{boolean} decimal</li>
         *     <li>{ko.observable.<string>} state</li>
         *     <li>{ko.observable.<string>} btnState</li>
         *     <li>{ko.observable.<boolean>} successfullyChecked</li>
         *     <li>{ko.observable.<number>} visualState</li>
         *     <li>{ko.observable.<string>} rawValue</li>
         *     <li>{ko.observable.<string>} formattedValue</li>
         *     <li>{ko.observable.<string>} placeHolder</li>
         *     <li>{ko.observable.<string>} formattedPlaceHolder</li>
         *     <li>{ko.observable.<string>} helpText</li>
         *     <li>{ko.observable.<string>} errorText</li>
         *     <li>{ko.observable.<string>} helpTextGeneric</li>
         *     <li>{ko.observable.<string>} errorTextGeneric</li>
         * </ul>
         */
        enhanceItemData(item) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `> FormEntryViewModel::enhanceItemData(${JSON.stringify(item, null, " ")})`);
            let viewKey = this.viewKey;

            if (item.type === void 0 || item.type === null) {
                item.type = this.ITEM_TYPE.TEXT;
            }

            if(item.formatOption === void 0) {
                item.formatOption = "None";
            }

            item.clearByCorrect = ((item.clearByCorrect !== void 0) ? this.vmHelper.convertToBoolean(item.clearByCorrect) : true);
            item.mandatory = ((item.mandatory !== void 0) ? this.vmHelper.convertToBoolean(item.mandatory) : true);

            // check item.type
            if (!Object.values(this.ITEM_TYPE).includes(item.type)) {
                if (item.unknownId) {
                    item.type = this.ITEM_TYPE.TEXT;
                }
            }

            switch(item.type) {
                case this.ITEM_TYPE.TEXT:
                case this.ITEM_TYPE.ALPHANUMERIC:
                    item.minLen = (((item.minLen !== void 0) && (item.minLen !== null)) ? parseInt(item.minLen) : 0);
                    item.maxLen = (((item.maxLen !== void 0) && (item.minLen !== null)) ? parseInt(item.maxLen) : Infinity);
                    break;

                case this.ITEM_TYPE.NUMBER:
                case this.ITEM_TYPE.NUMERIC:
                    item.minValue = (((item.minValue !== void 0) && (item.minValue !== null)) ? parseInt(item.minValue) : 0);
                    item.maxValue = (((item.maxValue !== void 0) && (item.maxValue !== null)) ? parseInt(item.maxValue) : Infinity);
                    item.multiplier = (((item.multiplier !== void 0) && (item.multiplier !== null)) ? parseInt(item.multiplier) : 1);
                    item.allowLeadingZero = (((item.allowLeadingZero !== void 0) && (item.allowLeadingZero !== null)) ? this.vmHelper.convertToBoolean(item.allowLeadingZero) : true);
                    item.minLen = (((item.minLen !== void 0) && (item.minLen !== null)) ? parseInt(item.minLen) : 0);
                    item.maxLen = (((item.maxLen !== void 0) && (item.maxLen !== null)) ? parseInt(item.maxLen) : Infinity);
                    break;

                case this.ITEM_TYPE.AMOUNT:
                    item.minValue = (((item.minValue !== void 0) && (item.minValue !== null)) ? parseInt(item.minValue) : 0);
                    item.maxValue = (((item.maxValue !== void 0) && (item.maxValue !== null)) ? parseInt(item.maxValue) : Infinity);
                    item.multiplier = (((item.multiplier !== void 0) && (item.multiplier !== null)) ? parseInt(item.multiplier) : 1);
                    item.decimal = (((item.decimal !== void 0) && (item.decimal !== null)) ? this.vmHelper.convertToBoolean(item.decimal) : true);
                    break;

                default:
                    _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `FormEntryViewModel::enhanceItemData() wrong type: ${item.type}`);
                    break;
            }
            item.state = ko.observable(parseInt(item.state !== undefined ? item.state : this.CMDSTATE.ENABLED)); // state is optional, if missing it will be set to enabled
            item.btnState = ko.observable(item.state()); // state is optional, if missing it will be set to enabled

            item.successfullyChecked = ko.observable(false);
            item.validationState = ko.observable(this.VALIDATION_STATE.EMPTY);

            item.visualState = ko.observable(0);

            if(item.state() === 2) {
                item.successfullyChecked(true);
                item.visualState(2);
            } else {
                this.vmContainer.whenActivated().then(() => {
                    item.value(item.rawValue());
                });
            }

            if(item.value === undefined) {
                item.value = "";
            }
            item.rawValue = ko.observable(item.value);

            item.formattedValue = ko.observable("");


            this.subscribeToObservable(item.validationState, function(i, newValue) {
                const module = this.viewHelper.getActiveModule();
                // might be not available because of racing popup
                if (module.onValidationStateChanged) {
                    module.onValidationStateChanged(i);
                }
            }.bind(this, item));

            // getLabel can be used before resolving onInitTextAndData... all requests will be queued until initTextAndData
            item.formattedPlaceHolder = ko.observable("");

            item.helpText = this.getLabel(uiMapping.buildGuiKey(viewKey, "Input", item.id, "HelpText"));
            item.helpTextGeneric = this.getLabel(uiMapping.buildGuiKey(viewKey, "Input", "Generic", "HelpText"));

            item.errorText = this.getLabel(uiMapping.buildGuiKey(viewKey, "Input", item.id, "ErrorText"));
            item.errorTextGeneric = this.getLabel(uiMapping.buildGuiKey(viewKey, "Input", "Generic", "ErrorText"));

            item.placeHolder = this.getLabel(uiMapping.buildGuiKey(viewKey, "Input", item.id, "PlaceHolder"));

            this.selectButtons.push("BTN_" + item.id);
            this.selectButtons.push(item.id);
            this.inputIds.push(item.id);
        }

        /**
         * Enhances the given item data with computed observable
         * @param {Object} item the item object to be enhanced with:
         * <ul>
         *     <li>{ko.computed.<string>} value</li>
         * </ul>
         */
        enhanceItemDataWithComputedObservables(item) {

            // item.computedLabel contains
            // - GUI_[#VIEW_KEY#]_Input_[item.id]_Label if defined or
            // - item.id (as default)
            item.label = this.getLabel(`GUI_[#VIEW_KEY#]_Input_${item.id}_Label`, '');
            item.computedLabel = ko.pureComputed(() => {
                let lab = item.label();
                if (lab === "") {
                    return item.id;
                } else {
                    return lab;
                }
            });

            // item.computedAdaText contains
            // - GUI_[#VIEW_KEY#]_Button_BTN_[item.id]_ADA if defined or
            // - item.id (as default)
            item.adaText = this.getLabel(`GUI_[#VIEW_KEY#]_Button_BTN_${item.id}_ADA`, '');
            item.computedAdaText = ko.pureComputed(() => {
                let txt = item.adaText();
                if (txt === "") {
                    return item.id;
                } else {
                    return txt;
                }
            });

            // item.computedAdaTextPost contains
            // - GUI_[#VIEW_KEY#]_Button_BTN_[item.id]_ADA_Clicked if defined or
            // - GUI_[#VIEW_KEY#]_Button_BTN_Generic_ADA_Clicked if defined or
            // - item.id (as default)
            // "You have selected xxx"
            item.adaTextPost = this.getLabel(`GUI_[#VIEW_KEY#]_Button_BTN_${item.id}_ADA_Clicked`, '');
            item.adaTextPostGeneric = this.getLabel('GUI_[#VIEW_KEY#]_Button_BTN_Generic_ADA_Clicked', '');
            item.computedAdaTextPost = ko.pureComputed(() => {
                let txtPost = item.adaTextPost();
                let txtPostGeneric = item.adaTextPostGeneric();
                if (txtPost === "") {
                    if (txtPostGeneric === "") {
                        return item.id;
                    } else {
                        return txtPostGeneric;
                    }
                } else {
                    return txtPost;
                }
            });

            // item.computedLabelAda contains
            // - GUI_[#VIEW_KEY#]_Input_[item.id]_Label_ADA if defined or
            // - GUI_[#VIEW_KEY#]_Input_Generic_Label_ADA if defined or
            // - item.id (as default)
            // "For xxx you have entered yyy"
            item.adaLabel = this.getLabel('GUI_[#VIEW_KEY#]_Input_' + item.id + '_Label_ADA', '');
            item.adaLabelGeneric = this.getLabel('GUI_[#VIEW_KEY#]_Input_Generic_Label_ADA', '');
            item.computedAdaLabel = ko.pureComputed(() => {
                let txtAdaLabel = item.adaLabel();
                let txtAdaLabelGeneric = item.adaLabelGeneric();
                if (txtAdaLabel === "") {
                    if (txtAdaLabelGeneric === "") {
                        return item.id;
                    } else {
                        return txtAdaLabelGeneric;
                    }
                } else {
                    return txtAdaLabel;
                }
            });


            item.value = ko.computed({
                read: () => {
                    return item.rawValue();
                },
                write: newValue => {
                    clearTimeout(this._timerId); // clear possible old timer
                    let valid = true;
                    let allowWriting = true;
                    switch(item.type) {

                        case this.ITEM_TYPE.NUMBER:
                        case this.ITEM_TYPE.NUMERIC:

                            if(!this.designMode) {
                                valid =
                                    (_validateService.isNumbers(newValue) &&
                                        _validateService.isInRange(newValue, item.minValue, item.maxValue, item.multiplier) &&
                                        _validateService.isWithinLength(newValue, item.minLen, item.maxLen)) ||
                                    (newValue === "" && !item.mandatory);

                                allowWriting =
                                    (newValue === "") ||
                                    (_validateService.checkLeadingZero(newValue, item.allowLeadingZero) &&
                                        _validateService.isMax(newValue, item.maxValue) &&
                                        _validateService.isWithinMaxLength(newValue, item.maxLen));
                            }
                            break;

                        case this.ITEM_TYPE.TEXT:
                        case this.ITEM_TYPE.ALPHANUMERIC:

                            if(!this.designMode) {
                                valid =
                                    (_validateService.isWithinLength(newValue, item.minLen, item.maxLen) &&
                                        !_validateService.matchesForbiddenPattern(newValue, item.forbiddenPattern)) || // reg. exp for blanks: "^\\s+$"
                                    (newValue === "" && !item.mandatory);

                                allowWriting = _validateService.isWithinMaxLength(newValue, item.maxLen);
                            }
                            break;


                        case this.ITEM_TYPE.AMOUNT:

                            if(!this.designMode) {
                                valid =
                                    (_validateService.isInRange(newValue, item.minValue, item.maxValue, item.multiplier)) ||
                                    (newValue === "" && !item.mandatory);

                                allowWriting =
                                    (newValue === "") ||
                                    (_validateService.isMax(newValue, item.maxValue));
                            }
                            break;

                        default:
                            /* ERROR */
                            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `FormEntryViewModel::onInputChanged() unknown type of input field: ${item.type}`);
                            break;
                    }

                    // if the input is not valid and the maximum length has been reached --> do nothing
                    if(!valid && !allowWriting) {
                        return;
                    }

                    // if the maximum length has not been reached --> set rawValue to the newValue
                    //                                            --> set successfullyChecked according to the valid variable
                    if(allowWriting) {
                        item.rawValue(newValue);
                        item.successfullyChecked(valid);
                    }

                    // set validationState ("valid" for a green border, "invalid" for a red border or "empty" for no border)
                    item.validationState(this.VALIDATION_STATE.EMPTY);
                    if(valid) {
                        item.validationState(this.VALIDATION_STATE.VALID);
                    }
                    else {
                        if(item.rawValue() === "") {
                            item.validationState(this.VALIDATION_STATE.EMPTY);
                        }
                        else {
                            item.validationState(this.VALIDATION_STATE.INVALID);
                        }
                    }

                    // an empty input field will get an "empty" validationState instead of an "invalid" validationState
                    if(item.rawValue() === "") {
                        item.validationState(this.VALIDATION_STATE.EMPTY);
                    }

                    if(this.initFinished) {
                        this.onInputChangedSetButtons();
                    }

                }
            });
        }

        /**
         * Prepares buttons and the initial mode of operation
         * @param {Array.<Object>} groups
         */
        prepareEditMode(groups) {
            if(this.vmContainer.viewHelper.viewType === "softkey") {
                // deactivate numDigits and Correct button
                this.handleCorrectState(false);
                this.cmdRepos.whenAvailable(this.numDigits)
                    .then(() => {
                        this.cmdRepos.suspend(this.numDigits, this.numDigitsId);
                    });
            }

            this.vmContainer.whenActivated()
                .then(() => {
                    this.initFinished = true;

                    // check whether the Confirm button has to be enabled initially
                    this.onInputChangedSetButtons();

                    if(this.numberOfFields === 1) {
                        // only 1 input field --> go directly to edit mode

                        this.activeItem = groups[0].items[0];
                        this.activeItem.visualState(1);
                        this.activeItemType(groups[0].items[0].type);
                        this.activeItemId(groups[0].items[0].id);


                        if(this.vmContainer.viewHelper.viewType === "softkey") {

                            if(this.activeItem.successfullyChecked()) {
                                this.speakErrorText(false);
                            } else {
                                this.speakErrorText(true);
                            }
                        }

                        this.editMode(true);
                        this.onEditModeChanged(this.activeItem);

                        _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `FormEntryViewModel::initItemData id=${this.activeItem.id}`);
                        _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `FormEntryViewModel::initItemData helpText=${this.activeItem.helpText()}`);
                        _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `FormEntryViewModel::initItemData helpTextGeneric=${this.activeItem.helpTextGeneric()}`);
                        _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `FormEntryViewModel::initItemData errorTextGeneric=${this.activeItem.errorTextGeneric()}`);
                        _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `FormEntryViewModel::initItemData placeholder=${this.activeItem.placeHolder()}`);
                        this.viewHelper.getActiveModule().onEditItemData(this.activeItem);

                        if(this.vmContainer.viewHelper.viewType === "touch") {
                            this.viewHelper.getActiveModule().showVK();
                        }

                        this.initialInstruction = this.activeItem.helpText() === '' ? this.activeItem.helpTextGeneric() : this.activeItem.helpText();

                    } else {
                        // only set initialInstruction if there are several (more than 1) input fields
                        this.initialInstruction = this.cmdRepos.getCmdLabel("INSTRUCTION");
                    }
                });

            // deactivate Confirm buttons
            if(this.initFinished === false) {
                this.cmdRepos.whenAvailable([this.STANDARD_BUTTONS.CONFIRM])
                    .then(() => {
                        this.cmdRepos.setActive([this.STANDARD_BUTTONS.CONFIRM], false);
                    });
            }

            // get Confirm text, if there are several (more than 1) input fields
            if(this.numberOfFields > 1) {
                this.confirmText = this.getLabel(uiMapping.buildGuiKey(this.viewKey, "ConfirmText"), `Please check your inputs and press Confirm.`);
            }

            if(this.vmContainer.viewHelper.viewType === "softkey" && this.activeItem === null) {
                // Error !!!
                _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `FormEntryViewModel::initItemData() An activeItem has not been set!!!`);
            }
        }

        /**
         * Function called by onInitTextAndData to initialize the items within the groups array. <BR> <BR>
         * All the properties of the items have to be set/initialized appropriately:
         * <p>
         *  <li>item.id  </li>
         *  <li>item.state  </li>
         *  <li>item.btnState  </li>
         *  <li>item.value  </li>
         *  <li>item.type  </li>
         *  <li>item.formattedValue  </li>
         *  <li>item.formatOption  </li>
         *  <li>item.clearByCorrect  </li>
         *  <li>item.mandatory  </li>
         *  <li>item.minValue </li>
         *  <li>item.maxValue </li>
         *  <li>item.multiplier </li>
         *  <li>item.allowLeadingZero </li>
         *  <li>item.decimal </li>
         *  <li>item.validationState </li>
         *  <li>item.visualState </li>
         *  <li>item.successfullyChecked </li>
         *  <li>item.placeholder </li>
         *  <li>item.formattedPlaceholder </li>
         *  <li>item.forbiddenPattern </li>
         *  <li>item.helpText </li>
         *  <li>item.errorText </li>
         *  <li>item.unknownId </li>
         *  <li>item.helpTextGeneric </li>
         *  <li>item.errorTextGeneric </li>
         * </p>
         * @param {Array<Object>} groups array of items for the input fields
         */
        initItemData(groups) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `> FormEntryViewModel::initItemData groups=${JSON.stringify(groups)}`);

            let numberOfTotalItems = 0;

            for(let i = 0; i < groups.length; i++) {
                this.numberOfFields = groups[i].items.length;
                for(let k = 0; k < this.numberOfFields; k++) {
                    numberOfTotalItems++;
                    let item = groups[i].items[k];
                    this.enhanceItemData(item);
                    this.enhanceItemDataWithComputedObservables(item);
                    _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `FormEntryViewModel::initItemData groups=${JSON.stringify(groups)}`);
                }
            }

            if (numberOfTotalItems > 0) {
                this.prepareEditMode(groups);
            }

            this.setElementTemplate({
                id: "ITEM_X",
                state: ko.observable(3),
                btnState: ko.observable(3),
                value: ko.observable(""),
                type: "",
                formattedValue: ko.observable(""),
                formatOption: "None",
                clearByCorrect: true,
                mandatory: 0,
                minValue: 0,
                maxValue: 0,
                multiplier: 1,
                allowLeadingZero: true,
                decimal: false,
                validationState: ko.observable(this.VALIDATION_STATE.EMPTY),
                visualState: ko.observable(2),
                successfullyChecked: ko.observable(false),
                placeHolder: "",
                formattedPlaceHolder: ko.observable(""),
                helpText: "",
                errorText: "",
                helpTextGeneric: "",
                errorTextGeneric: "",
                forbiddenPattern: "",
                unknownId: false
            });

            this.groups = groups;
            this.setListLen(groups[0].items.length);
            this.setListSource(groups[0].items);
            this.initCurrentVisibleLimits();
            this.setupVisualLists();
            this.dataList.items(groups[0].items);
            this.initScrollbar();

            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `< FormEntryViewModel::initItemData groups=${JSON.stringify(groups)}`);
        }

        /**
         * This functions returned promise is pushed to args.dataKeys during onInitTextAndData to suspend lifecycle until form-entry data data is available.
         * Reads the property PROP_FORM_ENTRY_DATA and the viewConfig items and builds up an array of input fields: groups<br>
         * Calls the internal function initItemData <br>
         * @async
         */
        async importBusinessData() {
            let dataResult = await _dataService.getValues(PROP_FORM_ENTRY_DATA);
            let data = dataResult[PROP_FORM_ENTRY_DATA];
            data = typeof data !== "object" ? JSON.parse(dataResult[PROP_FORM_ENTRY_DATA]) : data;
            if (data) {
                let config = this.viewConfig.items ? this.viewConfig.items.inputFields : null;
                if (config) {
                    let totalMatches = 0;
                    for (let i = 0; i < data.groups[0].items.length; i++) {
                        _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, `FormEntryViewModel::importBusinessData searching for items[${i}].id <${data.groups[0].items[i].id}> or items[${i}].result <${data.groups[0].items[i].result}> in config data ...`);
                        let configMatches = 0;
                        let configItem = [];
                        for (let k = 0; k < config.length && configMatches === 0; k++) {
                            _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, `FormEntryViewModel::importBusinessData config[${k}]: <${config[k].id}>`);
                            if ( (config[k].id === data.groups[0].items[i].id) || (config[k].id === data.groups[0].items[i].result) ) {
                                if (config[k].id === data.groups[0].items[i].id) {
                                    _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, `FormEntryViewModel::importBusinessData - id match: items[${i}].id matches with config[${k}].id: <${config[k].id}> is known in viewmapping`);
                                } else { // (config[k].id === data.groups[0].items[i].result)
                                    _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, `FormEntryViewModel::importBusinessData - result match: items[${i}].result matches with config[${k}].id: <${config[k].id}> is known in viewmapping`);
                                }
                                // config must not overwrite groups-items, it may only complement them !!!
                                _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `FormEntryViewModel::importBusinessData (before merge) data.groups[0].items[i]=${JSON.stringify(data.groups[0].items[i])}`);
                                _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `FormEntryViewModel::importBusinessData (before merge) config[k]=${JSON.stringify(config[k])}`);
                                configItem = config[k];
                                configItem = Object.assign({}, data.groups[0].items[i], configItem);
                                data.groups[0].items[i] = Object.assign({}, configItem, data.groups[0].items[i]);
                                data.groups[0].items[i].unknownId = false;
                                _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `FormEntryViewModel::importBusinessData (after merge) data.groups[0].items[i]=${JSON.stringify(data.groups[0].items[i])}`);
                                configItem = [];
                                configMatches++;
                                totalMatches++;
                            }
                        }
                        if (configMatches === 0) {
                            if (!data.groups[0].items[i].id && !data.groups[0].items[i].result) {
                                // neither id nor result is set --> invalid configuration for this item --> ignore
                            } else {
                                // create input field nevertheless
                                if (data.groups[0].items[i].id) {
                                    // ID is set
                                } else if (data.groups[0].items[i].result) {
                                    // result has to be copied to ID
                                    data.groups[0].items[i].id = data.groups[0].items[i].result;
                                }
                                data.groups[0].items[i].unknownId = true;
                                _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, `FormEntryViewModel::importBusinessData - no match for <${data.groups[0].items[i].id}>: <${data.groups[0].items[i].id}> is unknown in viewmapping`);
                            }
                        }
                    }
                    _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, `FormEntryViewModel::importBusinessData number of totalMatches: ${totalMatches}`);
                }
                else {
                    _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, `FormEntryViewModel::importBusinessData config is not available`);
                }

                return data;
            } else {
                throw(`FormEntryViewModel::importBusinessData Property=${PROP_FORM_ENTRY_DATA} is not available!`);
            }
        }

        /**
         * Overrides {@link Wincor.UI.Content.ListViewModel#onInitTextAndData} <br>
         * @param {Object} args Contains the attributes 'textKeys' <br> {array.<string|promise>} and <br> 'dataKeys' {array.<string|promise>}, <br> which should be filled up by the viewmodel.
         * @lifecycle viewmodel
         */
        onInitTextAndData(args) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `> FormEntryViewModel::onInitTextAndData()`);

            if(!this.designMode) {
                args.dataKeys.push(this.importBusinessData()
                    .then(data => {
                        this.initItemData(data.groups);
                    }));
            } else { // design mode
                args.dataKeys.push(this.designTimeRunner.retrieveJSONData("FormEntryData")
                    .then(data => {
                        this.initItemData(data.groups);
                    }));
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `< FormEntryViewModel::onInitTextAndData`);
            return super.onInitTextAndData(args);
        }

        /**
         * This hook is called whenever a cancel-popup has been cancelled or a "More Time" popup has been confirmed.
         * In this case we re-evaluate the validation state of the active item
         */
        onContinue() {
            const module = this.viewHelper.getActiveModule();
            //
            module.resetLastMessageItemId();
            module.onValidationStateChanged(this.activeItem);
        }

        /**
         * Overrides {@link Wincor.UI.Content.ListViewModel#onButtonPressed}
         * in order to handle certain buttons for the formentry view.
         * <p>
         * Handles the following on button pressed actions:<br>
         * <ul>
         *     <li>0,1,2,...,9</li>
         *     <li>CONFIRM</li>
         *     <li>CORRECT</li>
         *     <li>CANCEL</li>
         *     <li>BTN_SCROLL_DOWN</li>
         *     <li>BTN_SCROLL_UP</li>
         * </ul>
         * </p>
         * @param {String} id the id of the command that was triggered
         * @eventhandler
         */
        onButtonPressed(id) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `> FormEntryViewModel::onButtonPressed(${id})`);

            clearTimeout(this._timerId); // clear possible old timer

            if (!id) {
                return true;
            }

            if(id.length === 1) {
                // EPP key pressed:
                // --> update item value
                _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `FormEntryViewModel::onButtonPressed() activeItem: ${this.activeItem.id}`);
                this.activeItem.value(this.activeItem.value() + String(id));

                if (this.correctActivated === false) {
                    this.handleCorrectState(true);
                }
            } else if (id === this.STANDARD_BUTTONS.CONFIRM) {
                // CONFIRM has been pressed
                if (this.editMode() === false || (this.numberOfFields === 1 && this.activeItem.validationState() === this.VALIDATION_STATE.VALID)) {
                    // CONFIRM has been pressed in selection mode:
                    // set speakConfirmText flag for the final Confirm button to leave the view
                    // ""    --> "You have pressed Confirm" + "" (no special confirm text needed any more)
                    this.speakConfirmText("");

                    _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `. FormEntryViewModel::onButtonPressed data to set=${JSON.stringify({"groups": this.groups}, (key, val) => {
                        if (typeof val === "function") {
                            return val();
                        }
                        return val;
                    })}`);

                    if (!this.designMode) {
                        this.serviceProvider.DataService.setValues(PROP_FORM_ENTRY_DATA, JSON.stringify({"groups": this.groups}, (key, val) => {
                            if (typeof val === "function") {
                                return val();
                            }
                            return val;
                        }), () => {
                            super.onButtonPressed(id);
                        });
                    } else {
                        let item, len = this.groups[0].items.length;
                        for (let i = 0; i < len; i++) {
                            item = this.groups[0].items[i];
                            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `. FormEntryViewModel::onButtonPressed ${i}. value =${JSON.stringify(item.value)}`);
                        }
                        super.onButtonPressed(id);
                    }
                } else if (this.numberOfFields > 1) {
                    // CONFIRM has been pressed in edit mode with multiple input fields:
                    // switch to selection mode
                    let actItem = null;
                    if (this.activeItem) {
                        this.activeItem.visualState(0); // set activeItem from pressed to enabled
                        actItem = this.activeItem;
                        this.activeItem = null;
                        this.activeItemId("");
                    }
                    this.editMode(false);
                    this.onEditModeChanged(actItem);
                    this.onInputChangedSetButtons();
                } else if (this.activeItem.successfullyChecked() === false) {
                    // CONFIRM has been pressed in edit mode and numberOfFields === 1
                    // --> invalid input field --> stay in edit mode and show error text
                    this._timerId = this.vmContainer.viewModelHelper.startTimer(this.messageDelayTimeout).onTimeout(() => {
                        this.vmContainer.sendViewModelEvent(this.vmContainer.EVENT_ON_MESSAGE_AVAILABLE, {
                            messageText: (this.activeItem.errorText() === '') ? this.activeItem.errorTextGeneric() : this.activeItem.errorText(),
                            messageLevel: "WarningBox"
                        });
                        this.activateConfirm(true);
                    });
                } else {
                    // CONFIRM has been pressed in edit mode and numberOfFields === 1
                    // --> leave view because the one and only input is correct ...
                    this.speakConfirmText("");
                    _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `. FormEntryViewModel::onButtonPressed data to set=${JSON.stringify({"groups": this.groups}, (key, val) => {
                        if (typeof val === "function") {
                            return val();
                        }
                        return val;
                    })}`);
                    let item, len = this.groups[0].items.length;
                    for (let i = 0; i < len; i++) {
                        item = this.groups[0].items[i];
                        _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `. FormEntryViewModel::onButtonPressed ${i}. value =${JSON.stringify(item.value)}`);
                    }
                    super.onButtonPressed(id);
                }
            } else if (id === this.STANDARD_BUTTONS.CORRECT) {
                // CORRECT has been pressed
                _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `. FormEntryViewModel::onButtonPressed activeItem.clearByCorrect: ${this.activeItem.clearByCorrect}`);
                if (this.activeItem.clearByCorrect) {
                    this.activeItem.value("");
                } else {
                    let actValue = this.activeItem.value();
                    let actLen = actValue.length;
                    let correctValue = actValue.substr(0, actLen - 1);
                    this.activeItem.value(correctValue);
                    _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `. FormEntryViewModel::onButtonPressed actValue: ${actValue} actLen: ${actLen} correctValue: ${correctValue}`);
                }
                if (this.activeItem.value() === "") {
                    this.handleCorrectState(false);
                }
                _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `. FormEntryViewModel::onButtonPressed value after correct: ${this.activeItem.value()}`);
            } else if (id === "BTN_SCROLL_DOWN" || id === "BTN_SCROLL_UP" || id === this.STANDARD_BUTTONS.CANCEL) {
                // SCROLL_DOWN or SCROLL_UP or CANCEL has been pressed
                // --> call super.onButtonPressed to handle it
                super.onButtonPressed(id);
            } else if (this.editMode() === false) {
                // button pressed in selection mode:
                // --> check whether BTN_ has been pressed

                let idLen = id.length;
                let resumeNumDigits = false;
                if (idLen > 1 && id.substr(0, 4) === "BTN_") {
                    id = id.substr(4, idLen - 4);
                    // only resume numDigits if softkey button has been pressed i.e. VK is not active
                    resumeNumDigits = true;
                }
                
                let item = null;
                if ( this.numberOfFields > 0 ) {
                    item = this.groups[0].items.filter((item) => {
                        return item.id === id;
                    })[0];
                }

                if (item) {
                    if (!(this.activeItem === null)) {
                        if (this.activeItem.visualState() === 1) {
                            this.activeItem.visualState(0);
                        }
                    }
                    this.activeItem = item;
                    this.activeItem.visualState(1);
                    this.activeItemType(item.type);

                    this.activeItemId(item.id);

                    if (this.activeItem.successfullyChecked()) {
                        this.speakErrorText(false);
                    } else {
                        this.speakErrorText(true);
                    }

                    if (this.vmContainer.viewHelper.viewType === "softkey") {
                        // activate Confirm
                        this.editMode(true);
                        let actItem = this.activeItem;
                        // edit mode === false --> activate edit mode
                        // only resume NumDigits if softkey button has been pressed i.e. VK is not active
                        this.onEditModeChanged(actItem, resumeNumDigits);

                        if (this.activateConfirm()) {
                            // delete Confirm message
                            this._timerId = this.vmContainer.viewModelHelper.startTimer(this.messageRemoveTimeout).onTimeout(() => {
                                this.vmContainer.sendViewModelEvent(this.vmContainer.EVENT_ON_MESSAGE_AVAILABLE, {
                                    messageText: "",
                                    messageLevel: ""
                                });
                            });
                            this.activateConfirm(false);
                            this.speakConfirmText(false);
                        }
                    }
                    this.viewHelper.getActiveModule().onEditItemData(this.activeItem);
                } else {
                    // another button has been pressed in selection mode:
                    // --> call super.onButtonPressed to handle it
                    super.onButtonPressed(id);
                }
            } else {
                // check whether an input field itsself has been touched (Softkey layout on touchscreen)
                let inputFieldTouched = false;
                for (let i = 0; i < this.inputIds.length && inputFieldTouched === false; i++) {
                    if (this.inputIds[i] === id) {
                        inputFieldTouched = true;
                    }
                }
                if (inputFieldTouched) {
                    _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `. FormEntryViewModel::onButtonPressed input field has been touched: ${id}`);
                } else {
                    // another button has been pressed in edit mode:
                    // --> call super.onButtonPressed to handle it
                    _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `. FormEntryViewModel::onButtonPressed another button has been touched: ${id}`);
                    super.onButtonPressed(id);
                }
            }

            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `< FormEntryViewModel::onButtonPressed`);
            return true;
        }
    }
});


