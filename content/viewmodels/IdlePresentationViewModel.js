/**
 @preserve
 Copyright (c) 2001-2021 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ IdlePresentationViewModel.js 4.3.1-210422-21-8faf2d6b-1a04bc7d
 */

define(["knockout", "ui-content", "vm/CardAnimationsViewModel"], function(ko, content) {
    "use strict";

    const IDLE_STD_BUTTONS = ['BUTTON_IDLE_LOOP_RIGHT', 'BUTTON_IDLE_LOOP_LEFT'];

    const _logger = Wincor.UI.Service.Provider.LogProvider;
    const _localizeService = Wincor.UI.Service.Provider.LocalizeService;
    const _dataService = Wincor.UI.Service.Provider.DataService;
    
    const PROP_RCC_RSP_QRCODE_TOKEN = "PROP_RCC_RSP_QRCODE_TOKEN";
    
    /**
     * IdlePresentationViewModel deriving from {@link Wincor.UI.Content.CardAnimationsViewModel} class. <BR>
     * This viewmodel handles the idlepresentation view.
     * @class
     */
    Wincor.UI.Content.IdlePresentationViewModel = class IdlePresentationViewModel extends Wincor.UI.Content.CardAnimationsViewModel {
    
        /**
         * The timer id for setting the default language.
         * @default -1
         */
        timerId = -1;

        /**
         * The current QR code token.
         * @type {Function}
         * @bindable
         */
        qrCodeToken = null;
    
        /**
         * The code-behind module.
         * @type {Object}
         */
        module = null;

        /**
         * Initializes this view model.
         * @param {*} codeBehindModule the idle loop code-behind module
         * @lifecycle viewmodel
         */
        constructor(codeBehindModule) {
            super();
            this.module = codeBehindModule;
            this.qrCodeToken = ko.observable("");
        }
        
        /**
         * Handler function to remove/clear members.
         * Overridden to clear data list items, flags and counter.
         * @lifecycle viewmodel
         */
        onDeactivated() {
            _logger.log(_logger.LOG_INOUT, "> IdlePresentationViewModel::onDeactivated()");
            super.onDeactivated();
            this.setQRCodeToken("");
            _logger.log(_logger.LOG_INOUT, "< IdlePresentationViewModel::onDeactivated");
        }
        
        /**
         * Cleaning up members which can't be cleared in onDeactivate.
         * @lifecycle viewmodel
         */
        clean() {
            _logger.log(_logger.LOG_INOUT, "> IdlePresentationViewModel::clean()");
            this.module = null;
            super.clean();
            _logger.log(_logger.LOG_INOUT, "< IdlePresentationViewModel::clean");
        }
        
        /**
         * Initializes the DOM-associated objects.
         * Overrides {@link Wincor.UI.Content.CardAnimationsViewModel#observe}
         * @param {String} observableAreaId The area id to observe via knockout
         * @lifecycle viewmodel
         */
        observe(observableAreaId) {
            _logger.log(_logger.LOG_ANALYSE, `> IdlePresentationViewModel::observe(${observableAreaId})`);
            super.observe(observableAreaId);
            if(this.designMode) {
                this.viewFlexCardEject(false);
                this.cmdRepos.whenAvailable(IDLE_STD_BUTTONS).then(() => this.cmdRepos.setActive(IDLE_STD_BUTTONS, true));
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< IdlePresentationViewModel::observe");
        }
    
        /**
         * Sets a new QR code token.
         * @param {String} value the QR code token value e.g.: <i>"JF2LLE7KJWS518KLI2JLSA5WE4EDS4H0TR63U54SE9DFR58P474GFRE6WFEW5
         * 4ERG0FREA5Y45UZKZU5UKZ5WE5R979WE7RBF464AFLAG16F25HKT7ERS"</i>
         */
        setQRCodeToken(value) {
            if(value) {
                try {
                    this.qrCodeToken(value);
                    this.module && this.module.updateQRCode(value);
                } catch(e) {
                    _logger.error(`IdlePresentationViewModel::setQRCodeToken error processing QR code token: ${e}`);
                }
            } else { // reset
                this.qrCodeToken("");
                this.module && this.module.updateQRCode("");
            }
            _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, `* IdlePresentationViewModel::setQRCodeToken --> qrCodeToken=${value}`);
        }
        
        /**
         * Initializes the text and data.
         * This method reads the property <i>PROP_RCC_RSP_QRCODE_TOKEN</i>.
         * @param {Object} args will contain the promise which getting resolved when everything is prepared
         * @see {Wincor.UI.Content.BaseViewModel#onInitTextAndData}
         * @lifecycle viewmodel
         */
        onInitTextAndData(args) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> IdlePresentationViewModel::onInitTextAndData()");
            if(!this.designMode) {
                args.dataKeys.push(new Promise(resolve => {
                    _dataService.getValues(PROP_RCC_RSP_QRCODE_TOKEN, result => {
                        this.setQRCodeToken(result[PROP_RCC_RSP_QRCODE_TOKEN]);
                        resolve();
                    }, newData => { // on update QR code token
                        this.setQRCodeToken(newData[PROP_RCC_RSP_QRCODE_TOKEN]);
                    });
                }));
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< IdlePresentationViewModel::onInitTextAndData");
            return super.onInitTextAndData(args);
        }
        
        /**
         * Overridden to get informed when an arbitrary view model send an event.
         * We want to get informed when the "LANGUAGE_CHANGE_REQUESTED" has been occurred by the user.
         * Usually when the popup for language selection has been used to do this.
         * @param {string} id the event id
         * @param {object=} data the event data, usually a JSON notated object, the VM which overrides this method
         * has to know which type of event data are expected dependent by the id of the event.
         * @eventhandler
         */
        onViewModelEvent(id, data) {
            _logger.log(_logger.LOG_ANALYSE, `> IdlePresentationViewModel::onViewModelEvent id=${id}`);
            if(id === "LANGUAGE_CHANGE_REQUESTED" && !this.designMode) {
                _localizeService.registerForServiceEvent(_localizeService.SERVICE_EVENTS.LANGUAGE_CHANGED,
                    () => {
                        this.vmHelper.clearTimer(this.timerId);
                        let timeoutVal = parseInt(this.viewConfig.config && this.viewConfig.config.backToDefaultLanguageTimeout ?
                            this.viewConfig.config.backToDefaultLanguageTimeout : 30000);
                        this.timerId = this.vmHelper.startTimer(timeoutVal).onTimeout(() => {
                            _logger.log(_logger.LOG_INFO, `. IdlePresentationViewModel::onViewModelEvent call to set back language to default=${_localizeService.getLanguageMapping().defaultLanguage}`);
                            _localizeService.setLanguage(_localizeService.getLanguageMapping().defaultLanguage);
                        });
                    },
                    _localizeService.DISPOSAL_TRIGGER_ONETIME);
            }
        }
    }
});
