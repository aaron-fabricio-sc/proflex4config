/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ PopupAmountEntryViewModel.js 4.3.1-210127-21-34ae33df-1a04bc7d

*/
define(["jquery", "knockout", "code-behind/ViewHelper", "vm/AmountEntryViewModel"], function(jQuery, ko, viewHelper) {
    "use strict";
    console.log("AMD:PopupAmountEntryViewModel");

    const _logger = Wincor.UI.Service.Provider.LogProvider;

    const CMD_CONFIRM = "CONFIRM_AMOUNT_ENTRY_POPUP";
    const CMD_CORRECT = "CORRECT_AMOUNT_ENTRY_POPUP";

    /**
     * This class is used for amount entry within a view.
     * Deriving from {@link Wincor.UI.Content.AmountEntryViewModel} class.
     * @class
     */
    Wincor.UI.Content.PopupAmountEntryViewModel = class PopupAmountEntryViewModel extends Wincor.UI.Content.AmountEntryViewModel {

        /**
         * Boolean observable whether the (hint) message is visible or not.
         * @type {function | ko.computed}
         * @bindable
         */
        messageVisible = null;
    
        /**
         * See {@link Wincor.UI.Content.BaseViewModel#constructor}.
         * @lifecycle viewmodel
         */
        constructor() {
            super();
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> PopupAmountEntryViewModel");
            this.messageVisible = ko.computed(() => { return this.messageText() !== "" }, this);
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< PopupAmountEntryViewModel");
        }

        /**
         * See {@link Wincor.UI.Content.BaseViewModel#onDeactivated}.
         *
         * @lifecycle viewmodel
         */
        onDeactivated() {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> PopupAmountEntryViewModel::onDeactivated()");
            super.onDeactivated();
            this.options = null;
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< PopupAmountEntryViewModel::onDeactivated");
        }
        
        /**
         * Initializes the DOM-associated objects.
         * Overrides {@link Wincor.UI.Content.AmountEntryViewModel#observe}
         * @param {String} observableAreaId The area id to observe via knockout
         * @lifecycle viewmodel
         */
        observe(observableAreaId) {
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `> PopupAmountEntryViewModel::observe(${observableAreaId})`);
            viewHelper.removeWaitSpinner();
            super.observe(observableAreaId);
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< PopupAmountEntryViewModel::observe");
        }
    
        /**
         * Sets the button states, depending on the validity of the given amount.
         * Overridden from {@link Wincor.UI.Content.AmountEntryViewModel#onAmountChangedSetButtons}, because the popup lacks Mixture support.
         * @param {number} amount     The current amount
         */
        onAmountChangedSetButtons(amount) {
            _logger.LOG_INFO && _logger.log(_logger.LOG_INFO, `* PopupAmountEntryViewModel::onAmountChangedSetButtons(${amount})`);
            this.cmdRepos.whenAvailable([CMD_CONFIRM]).then(() => this.cmdRepos.setActive([CMD_CONFIRM], this.isAmountValid(amount)));
            this.cmdRepos.whenAvailable([CMD_CORRECT]).then(() => this.cmdRepos.setActive([CMD_CORRECT], amount > 0 || amount < 0));

            let amountLen = this.amount.toString().length;
            let smallestNewAmount = this.amount.toString() + "0";
            if ( this.configHelper.checkMax && ( amountLen === this.configHelper.maxLen-1 || amountLen >= this.configHelper.maxLen )  && !this.isAmountValid(Number(smallestNewAmount))) {
                // if ( this.configHelper.checkMax && amountLen >= this.configHelper.maxLen ) {
                if ( !this.numberKeysSuspended() ) {
                    this.cmdRepos.setActive(["0","1","2","3","4","5","6","7","8","9"], false);
                    this.numberKeysSuspended(true);
                    _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, "AmountEntryViewModel::onAmountChangedSetButtons() number keys deactivated");
                }
            } else {
                if ( this.numberKeysSuspended() ) {
                    this.cmdRepos.setActive(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]);
                    this.numberKeysSuspended(false);
                    _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, "AmountEntryViewModel::onAmountChangedSetButtons() number keys activated");
                }
            }
        }
    
        /**
         * Does the same as {@link Wincor.UI.Content.AmountEntryViewModel#onAmountChanged}.
         */
        onAmountChanged(amount) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `> PopupAmountEntryViewModel::onAmountChanged(${amount})`);
            this.onAmountChangedSetButtons(amount);
            this.onAmountChangedCheckInput();
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< PopupAmountEntryViewModel::onAmountChanged");
        }
    
        /**
         * See {@link Wincor.UI.Content.BaseViewModel#onInitTextAndData}.
         *
         * @param {Object} args Contains the attributes 'textKeys' {array.<string|promise>} and 'dataKeys' {array.<string|promise>}, which should be filled up by the viewmodel.
         * @lifecycle viewmodel
         */
        onInitTextAndData(args) {
            this.options = this.getPopupOptions();
            if (this.options.config) {
                this.config = Object.assign({}, this.options.config); //read the configuration from the popup options
            }
            let ret = super.onInitTextAndData(args, false);
            this.preValueIntoAmountField();
            this.setMaxHelperValues();
            return ret;
        }
    
        /**
         * See {@link Wincor.UI.Content.BaseViewModel#onButtonPressed}.
         *
         * @param {String} id The id of the pressed button.
         * @eventhandler
         */
        onButtonPressed(id) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `> PopupAmountEntryViewModel::onButtonPressed(${id})`);
            // set the last command id
            this.options.result = this.options.result || {};
            this.options.result.id = id;
            // only if we are started as a popup, we handle the cancel / confirm stuff here... otherwise (started as a view) let base handle it
            if(this.vmHelper.isPopupActive() && (id === this.STANDARD_BUTTONS.CONFIRM || id === this.STANDARD_BUTTONS.CANCEL)) {
                this.options.result = {};
                this.options.result.id = id;

                if (id === this.STANDARD_BUTTONS.CONFIRM) {
                    this.options.result.amount = this.amount;
                } else {
                    this.options.result.amount = null;
                }
                this.hidePopupMessage();
            } else {
                super.onButtonPressed(id);
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< PopupAmountEntryViewModel::onButtonPressed");
        }
    }
});

