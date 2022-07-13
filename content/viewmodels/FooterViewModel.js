/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ FooterViewModel.js 4.3.1-210127-21-34ae33df-1a04bc7d
 */

define(["knockout", "basevm"], function(ko) {
    "use strict";
    console.log("AMD:FooterViewModel");

    const _logger = Wincor.UI.Service.Provider.LogProvider;
    
    /**
     * <p>This viewmodel is used to observe the footer-part of the dom.
     * The corresponding footer.html page is only used initially to load into the startup view.
     * When routing to other views takes place, the <code>&#x3C;footer&#x3E;</code> element of the relevant view will be parsed and will replace the contents of
     * this viewmodel`s members &#x3C;activeExtra&#x3E; and &#x3C;activeCancel&#x3E; with the corresponding HTML elements <code>&#x3C;flexExtra&#x3E;</code> and <code>&#x3C;flexCancel&#x3E;</code>.
     * This approach allows to use the footer view model as a STATIC view model {@link module:ViewModelContainer.LIFE_CYCLE_MODE} within {@link module:ViewModelContainer} by dynamically changing the observable's HTML content.</p>
     * FooterViewModel deriving from {@link Wincor.UI.Content.BaseViewModel} class.
     * @class
     * @since 2.0/00
     */
    Wincor.UI.Content.FooterViewModel = class FooterViewModel extends Wincor.UI.Content.BaseViewModel {


        /**
         * Contains the markup of the currently active view's &#x3C;flexExtra&#x3E; child of the &#x3C;footer&#x3E; element.
         * @type {ko.observable}
         * @bindable
         */
        activeExtra = null;

        /**
         * Contains the markup of the currently active view's &#x3C;flexCancel&#x3E; child of the &#x3C;footer&#x3E; element.
         * @type {ko.observable}
         * @bindable
         */
        activeCancel = null;

        /**
         * This is the prototype.js constructor of {@link Wincor.UI.Content.FooterViewModel}
         * <p>When overriding this constructor, assure to call <code>super()</code> in your subclass before doing anything else.</p>
         */
        constructor() {
            super();
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> FooterViewModel");
            // Attention: This view model is static, so that this function is only called one time.
            this.activeExtra = ko.observable("");
            this.activeCancel = ko.observable("");
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< FooterViewModel");
        }

        /**
         * Handler function to remove/clear members.
         * Just calling the base here.
         * <p>Overrides {@link Wincor.UI.Content.BaseViewModel#onDeactivated}</p>
         * @lifecycle viewmodel
         */
        onDeactivated() {
            super.onDeactivated();
            // _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> FooterViewModel::onDeactivated()");
            // Do not remove labels here, because we may want to get language text updates on language change
            // _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< FooterViewModel::onDeactivated");
        }
        
        /**
         * Just calling base.
         * <p>Overrides {@link Wincor.UI.Content.BaseViewModel#observe}</p>
         * @see {@link Wincor.UI.Content.BaseViewModel#observe}
         * @param {String} observableAreaId the area id to observe via knockout
         * @lifecycle viewmodel
         */
        observe(observableAreaId) {
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `> FooterViewModel::observe(${observableAreaId})`);
            super.observe(observableAreaId);
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< FooterViewModel::observe");
        }

        /**
         * In general we retrieve standard-button texts if ada is active - needed by ada text for function-key speaking!
         * even if e.g button CONFIRM has another function like "print" or "deposit", ada needs to speak the ada-key
         * which always is a language-dependent version of "CANCEL", "CONFIRM" or "CORRECT"
         * association of ada-key as one of the standard-keys and corresponding text is automatically done in custom-'command'-binding.
         * <p>Overrides {@link Wincor.UI.Content.BaseViewModel#onInitTextAndData}</p>
         * @param {Object} args
         * @lifecycle viewmodel
         * @return {Promise}
         */
        onInitTextAndData(args) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> FooterViewModel::onInitTextAndData()");
            // in general we retrieve standard-button texts if ada is active - needed by ada text for function-key speaking!
            // even if e.g button CONFIRM has another function like "print" or "deposit", ada needs to speak the ada-key
            // which always is a language-dependent version of "CANCEL", "CONFIRM" or "CORRECT"
            // association of ada-key as one of the standard-keys and corresponding text is automatically done in custom-'command'-binding
            if (this.ada._adaEnabled) {
                var adaKeys = [
                    this.buildGuiKey("Button", "Cancel"),
                    this.buildGuiKey("Button", "Confirm"),
                    this.buildGuiKey("Button", "Correct"),
                    this.buildGuiKey("Button", "Cancel", "ADA"),
                    this.buildGuiKey("Button", "Cancel", "ADA", "Clicked"),
                    this.buildGuiKey("Button", "Confirm", "ADA"),
                    this.buildGuiKey("Button", "Confirm", "ADA", "Clicked"),
                    this.buildGuiKey("Button", "Correct", "ADA"),
                    this.buildGuiKey("Button", "Correct", "ADA", "Clicked")
                ];
                args.textKeys = args.textKeys.concat(adaKeys);
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< FooterViewModel::onInitTextAndData");
            return super.onInitTextAndData(args);
        }

        /**
         * Just passing command id to the base.
         * <p>Overrides {@link Wincor.UI.Content.BaseViewModel#onButtonPressed}</p>
         * @param {String} id
         */
        onButtonPressed(id) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `> FooterViewModel::onButtonPressed(${id})`);
            // This viewmodel handles the standard-buttons CANCEL CONFIRM and CORRECT, so it calls super.onButtonPressed()!
            // Other viewmodels that want to handle this standard buttons should add a delegate and return 'true' to
            // avoid this onButtonPressed to be called!
            super.onButtonPressed(id);
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< FooterViewModel::onButtonPressed");
        }
    }
});

