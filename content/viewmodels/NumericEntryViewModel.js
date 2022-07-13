/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ NumericEntryViewModel.js 4.3.1-210127-21-34ae33df-1a04bc7d
 */
define(["knockout", "vm-container", "extensions", "basevm"], function(ko, container, ext) {
    "use strict";

    const _logger = Wincor.UI.Service.Provider.LogProvider;
    const _dataService = Wincor.UI.Service.Provider.DataService;
    const _viewService = Wincor.UI.Service.Provider.ViewService;
    const _validateService = Wincor.UI.Service.Provider.ValidateService;

    /**
     * The formatted number property.
     * @type {string}
     * @const
     * @private
     */
    const PROP_FORMATTED_VALUE = "PROP_FORMATTED_VALUE";

    /**
     * The unformatted number property.
     * @type {string}
     * @const
     * @private
     */
    const PROP_UNFORMATTED_VALUE = "PROP_UNFORMATTED_VALUE";
    
    /**
     * The default object, which contains the default values for {@link Wincor.UI.Content.NumericEntryViewModel#config}.
     * @type {Object}
     * @const
     * @private
     */
    let _configDefault = {
        preValue: "",
        placeHolder: "",
        allowLeadingZero: true,
        clearByCorrect: true,   //Check whether complete clear through correct btn is on or off.
        formatOption: "NONE",
        minLen: 1,
        maxLen: 15
    };
    
    /**
     * True, if the input must be masked, because it is private. PCI relevant
     * @type {boolean}
     * @private
     */
    let _isPrivateInput = false;

    /**
     * This is a view model to handle numeric inputs into a single field.
     * It calls the validation routines of the validateService in order to check minLength/maxLength values.
     * This class is derived from {@link Wincor.UI.Content.BaseViewModel}
     * @class
     */
    Wincor.UI.Content.NumericEntryViewModel = class NumericEntryViewModel extends Wincor.UI.Content.BaseViewModel {
    
        /**
         * The observable for the unformatted contents of the number.
         * @type {function | ko.observable}
         * @bindable
         */
        numberField = null;
        /**
         * The observable for the formatted contents of the number
         * @type {function | ko.observable}
         * @bindable
         */
        numberFieldFormatted = null;
        /**
         * The format option used by the view. Must be an observable, because the format option can be different between two view keys.
         * @type {function | ko.observable}
         * @bindable
         */
        formatOption = null;
    
        /**
         * The observable, which is 'true' if the {@link Wincor.UI.Content.NumericEntryViewModel#formatOption} is '#X' and the input must be masked.
         * @type {function | ko.observable}
         * @bindable
         */
        showLastInputOnSecure = null;
        
        /**
         * The text of the hint, which can drop in dynamically.
         * @type {function | ko.observable}
         * @bindable
         */
        messageText = null;
        
        /**
         * The level (severity) of the hint, which can drop in dynamically.
         * @type {function | ko.observable}
         * @bindable
         */
        messageLevel = null;
        
        /**
         * Object, which contains the texts and levels for different kinds of hints. Currently there is only a hint for a wrong length.
         * @type {Object}
         * @example
         * this.messageHints = {
                length: {messageText: "", messageLevel: ""}
            };
         */
        messageHints = null;

        /**
         * This observable stores the flag whether the number keys have to be deactivated, <BR>
         * because the maximum input length has been reached.
         *  false: do not suspend the number keys <BR>
         *  true: suspend the number keys <BR>
         * @type {ko.observable}
         * @bindable
         */
        numberKeysSuspended = null;

        /**
         * See {@link Wincor.UI.Content.BaseViewModel#constructor}.
         * @lifecycle viewmodel
         */
        constructor() {
            super();
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> NumericEntryViewModel");
            this.messageHints = {
                length: {messageText: "", messageLevel: ""}
            };
            this.numberField = ko.observable("");
            this.numberFieldFormatted = ko.observable("");
            this.config = Object.assign({}, _configDefault);
            this.formatOption = ko.observable(this.config.formatOption);
            this.showLastInputOnSecure = ko.observable(false);
            this.timerId = null;
            this.messageText = ko.observable("");
            this.messageLevel = ko.observable("");
            this.numberKeysSuspended = ko.observable(false);
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< NumericEntryViewModel");
        }
        
        /**
         * See {@link Wincor.UI.Content.BaseViewModel#onDeactivated}.
         * @lifecycle viewmodel
         */
        onDeactivated() {
            super.onDeactivated();
            if (this.subscription) {
                this.subscription.dispose();
            }
            this.numberField("");
            this.numberFieldFormatted("");
            this.messageText("");
            this.messageLevel("");
            this.messageHints = {
                length: {messageText: "", messageLevel: ""}
            };
            this.config = Object.assign({}, _configDefault);
            this.formatOption(this.config.formatOption);
            this.showLastInputOnSecure(false);
            clearTimeout(this.timerId);
            this.timerId = null;
            _isPrivateInput = false;
            this.numberKeysSuspended(false);
        }
        
        /**
         * Sets the button states, depending on the validity of the given number.
         * Triggers the timer, after whose timeout potential message hints will be shown or cleared.
         * @param {String} numberStr    The new entered number as string
         */
        onInputChanged(numberStr) {
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, "> NumericEntryViewModel::onInputChanged()");
            this.cmdRepos.whenAvailable([this.STANDARD_BUTTONS.CONFIRM]).then(() => this.cmdRepos.setActive(this.STANDARD_BUTTONS.CONFIRM, this.isNumberValid(numberStr)));
            this.cmdRepos.whenAvailable([this.STANDARD_BUTTONS.CORRECT]).then(() => this.cmdRepos.setActive(this.STANDARD_BUTTONS.CORRECT, numberStr.length > 0));

            if ( numberStr.length >= this.config.maxLen ) {
                if ( !this.numberKeysSuspended() ) {
                    this.cmdRepos.setActive(["0","1","2","3","4","5","6","7","8","9"], false);
                    this.numberKeysSuspended(true);
                    _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, "NumericEntryViewModel::onInputChanged() number keys deactivated");
                }
            } else {
                if ( this.numberKeysSuspended() ) {
                    this.cmdRepos.setActive(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]);
                    this.numberKeysSuspended(false);
                    _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, "NumericEntryViewModel::onInputChanged() number keys activated");
                }
            }

            //set timer to check input
            clearTimeout(this.timerId);
            this.timerId = setTimeout(this.checkMessages.bind(this), 1500);
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, "< NumericEntryViewModel::onInputChanged()");
        }
    
        /**
         * Initializes the DOM-associated objects.
         * Overrides {@link Wincor.UI.Content.BaseViewModel#observe}
         * @param {String} observableAreaId The area id to observe via knockout
         * @lifecycle viewmodel
         */
        observe(observableAreaId) {
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `> NumericEntryViewModel::observe(${observableAreaId})`);
            super.observe(observableAreaId);
            this.cmdRepos.whenAvailable([this.STANDARD_BUTTONS.CONFIRM]).then(() => this.cmdRepos.addDelegate({id: this.STANDARD_BUTTONS.CONFIRM, delegate: this.onButtonPressed, context: this}));
            this.cmdRepos.whenAvailable([this.STANDARD_BUTTONS.CORRECT]).then(() => this.cmdRepos.addDelegate({id: this.STANDARD_BUTTONS.CORRECT, delegate: this.onButtonPressed, context: this}));
            this.subscription = this.subscribeToObservable(this.numberField, this.onInputChanged.bind(this));
            this.numberField.extend({notify: 'always'});
    
            /**
             * Stores the actual viewkey configuration.
             * @type {object}
             */
            this.config = Object.assign({}, _configDefault);
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `. NumericEntryViewModel::observe config after Default=${JSON.stringify(this.config)}`);
            _isPrivateInput = this.vmHelper.convertToBoolean(this.viewConfig.privateInput); // check whether the input is in private mode (PCI relevant)
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< NumericEntryViewModel::observe");
        }
    
        /**
         * See {@link Wincor.UI.Content.BaseViewModel#onInitTextAndData}.
         * @param {Object} args Contains the attributes 'textKeys' {array.<string|promise>} and 'dataKeys' {array.<string|promise>}, which should be filled up by the viewmodel.
         * @lifecycle viewmodel
         */
        onInitTextAndData(args) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> NumericEntryViewModel::onInitTextAndData()");

            // Read view config in order to get a pre value and other stuff
            if(this.viewConfig.config) {
                _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `. NumericEntryViewModel::onInitTextAndData viewConf=${JSON.stringify(this.viewConfig)}`);

                this.config = Object.assign(this.config, this.viewConfig.config);
                this.config.preValue = this.config.preValue.toString(); //preValue will be an int, when it comes from the ConfigService
                this.formatOption(this.config.formatOption);
                this.numberField(this.config.preValue);
                this.showLastInputOnSecure(this.config.showLastInputOnSecure);

                _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `. NumericEntryViewModel::onInitTextAndData config after copying=${JSON.stringify(this.config)}`);
            }
            if(!this.designMode) {
                this.messageHints.length.messageText = this.getLabel(this.buildGuiKey("InputHint", "Length", "Message"), ""); // retrieve an observable
                this.messageHints.length.messageLevel = this.getLabel(this.buildGuiKey("InputHint", "Length", "Message", "Level"), ""); // retrieve an observable
            } else { // design mode
                args.dataKeys.push(this.designTimeRunner.retrieveJSONData("NumericEntryData").then(data => {
                    this.config = Object.assign({}, data);
                    this.messageHints.length.messageText = data.messageLength;
                    this.messageHints.length.messageLevel = data.messageLevel;
                    this.numberField(data.preValue);
                    this.formatOption(data.formatOption);
                    this.showLastInputOnSecure(data.showLastInputOnSecure);
                    this.config.placeHolder = data.placeHolder;
                }));
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< NumericEntryViewModel::onInitTextAndData");

            return super.onInitTextAndData(args);
        }

        /**
         * Calculates if the given number is has at least minimum length, see {@link Wincor.UI.Content.NumericEntryViewModel#config}.
         *
         * @param {String} numberStr The number to be checked. Must be a string.
         * @return {Boolean}
         */
        isWithinMinLength(numberStr) {
            const minLen = this.config.minLen;
            let isWithin = !this.designMode && _validateService.isWithinMinLength(numberStr, minLen);

            if (this.designMode) {
                isWithin = true;
                if (minLen && minLen > 0){
                    isWithin = numberStr.length >= minLen;
                }
            }

            _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, `* NumericEntryViewModel::isWithinMinLength (number=${_isPrivateInput ? 'xxx' : numberStr}, minLen=${minLen}, isWithin=${isWithin})`);
            return isWithin;
        }

        /**
         * Calculates if the given number is not longer than the maximum length, see {@link Wincor.UI.Content.NumericEntryViewModel#config}.
         *
         * @param {String} numberStr The number to be checked. Must be a string.
         * @return {Boolean}
         */
        isWithinMaxLength(numberStr) {
            const maxLen = this.config.maxLen;
            let isWithin = !this.designMode && _validateService.isWithinMaxLength(numberStr, maxLen);

            if (this.designMode) {
                isWithin = true;
                if (maxLen && maxLen > 0){
                    isWithin = numberStr.length <= maxLen;
                }
            }

            _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, `* NumericEntryViewModel::isWithinMaxLength (number=${_isPrivateInput ? 'xxx' : numberStr}, maxLen=${maxLen}, isWithin=${isWithin})`);
            return isWithin;
        }

        /**
         * Calculates if the given number is valid at all, regarding the configured parameters.
         *
         * @param {String} numberStr The number to be checked. Must be a string.
         * @return {Boolean}
         */
        isNumberValid(numberStr) {
            if (this.designMode) {
                return true;
            }
            _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, `* NumericEntryViewModel::isNumberValid (number=${_isPrivateInput ? 'xxx' : numberStr}`);
            return !this.designMode && _validateService.isNumbers(numberStr) && this.isWithinMinLength(numberStr) && this.isWithinMaxLength(numberStr);
        }

        /**
         * Shows or clears a message hint by evaluating {@link Wincor.UI.Content.NumericEntryViewModel#numberField}.
         */
        checkMessages() {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> NumericEntryViewModel::checkMessages()");

            if(this.isNumberValid(this.numberField()) || this.numberField() === "") {
                this.showMessageHint(null); // clear possible hint
            } else { //Check for Warning/Error (no matter what, we can't leave the page)
                let hint = null;
                if (!this.isWithinMinLength(this.numberField()) || !this.isWithinMaxLength(this.numberField())) {
                    hint = this.messageHints.length;
                }
                //ADA: we do not call notifyViewUpdated() to read out the 'escalation' messages. This would interfere with reading out the
                //entry of the input field. However, the hint to respect the minLength-maxLength values is inside GUI_WithdrawalAlternativeAmountInput_Instruction_ADA!
                //This one is always read out if the ADA user presses Help
                this.showMessageHint(hint);
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< NumericEntryViewModel::checkMessages");
        }

        /**
         * Shows/triggers the given message hint.
         * @param {Object} hint The message hint to show
         */
        showMessageHint(hint) {
            if(hint) {
                _logger.LOG_INFO && _logger.log(_logger.LOG_INFO, `* NumericEntryViewModel::showMessageHint text=${ko.unwrap(hint.messageText)} =>level=${ko.unwrap(hint.messageLevel)}`);
                this.messageText(ko.unwrap(hint.messageText));
                this.messageLevel(ko.unwrap(hint.messageLevel)); // level must be set after message because the message triggers the visibility of the hint box first
            } else {
                this.messageText("");
                this.messageLevel("");
            }
        }
    
        /**
         * See {@link Wincor.UI.Content.BaseViewModel#onButtonPressed}.
         * @param {String} id The id of the pressed button.
         * @eventhandler
         */
        onButtonPressed(id) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `> NumericEntryViewModel::onButtonPressed(${_isPrivateInput ? 'x' : id})`);

            if(!id) {
                return true;
            }

            if(id.length === 1 && !isNaN(id)) {
                let updatedInputField = this.numberField() + String(id);

                if((updatedInputField === "0" && !this.config.allowLeadingZero) || !this.isWithinMaxLength(updatedInputField)) {
                    //user tries to input a zero as first digit, but this is not allowed
                    //OR
                    //the inputed string would be too long
                } else {
                    if (this.isWithinMaxLength(updatedInputField)) {
                        this.numberField(updatedInputField);
                    }
                }
            } else if(id === this.STANDARD_BUTTONS.CONFIRM) {
                if(this.isNumberValid(this.numberField())) {
                    if(!this.designMode) {
                        const unformattedValue = this.numberField();
                        const formattedValue = parseInt(this.numberField(), 10);
                        // on private input add trace filter
                        let traceFilterPromises = [];
                        if (_isPrivateInput) {
                            traceFilterPromises.push(this.serviceProvider.UtilityService.addTraceFilter(unformattedValue));
                            traceFilterPromises.push(this.serviceProvider.UtilityService.addTraceFilter(formattedValue));
                        }
                        ext.Promises.Promise
                            .all(traceFilterPromises)
                            .then(() => {
                                // REMARK: Currently we do not format the input value infer that we set the property values equal!
                                return _dataService.setValues(
                                    [PROP_UNFORMATTED_VALUE, PROP_FORMATTED_VALUE],
                                    [unformattedValue, formattedValue]);
                            })
                            .then(() => {
                                _viewService.endView(_viewService.UIRESULT_OK, id);
                            });
                    } else {
                        super.onButtonPressed(id);
                    }
                }
            } else if(id === this.STANDARD_BUTTONS.CORRECT) {
                if(this.numberField().length > 0) {
                    if (this.config.clearByCorrect) {
                        this.numberField(""); // do not set to preValue, because the user must be able to input sth. from scratch!
                    } else {
                        this.numberField(this.numberField().substr(0, this.numberField().length - 1));
                    }
                }
            } else if(id === "NUMBER_INPUT") {
                if(this.designMode) {
                    id = this.STANDARD_BUTTONS.CONFIRM;
                    super.onButtonPressed(id);
                }
            } else {
                super.onButtonPressed(id);
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< NumericEntryViewModel::onButtonPressed");
            return true;
        }
    }
});

