/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ WithdrawalAnimationsViewModel.js 4.3.1-210408-21-739a2320-1a04bc7d
 */

define(["jquery", "knockout", "extensions", "vm/AnimationsViewModel"], function(jQuery, ko, ext) {
    "use strict";

    const _logger = Wincor.UI.Service.Provider.LogProvider;
    const _eventService = Wincor.UI.Service.Provider.EventService;
    
    const EVENT_INFO = _eventService.getEventInfo("TRANSACTION_MODULE");
    
    /**
     * The key for the Session Storage, at which Bill Splitting may already have stored data.
     * @const
     * @private
     * @type {string}
     */
    const KEY_SESSION_STORAGE_DENOM = "dispenseDistribution";

    /**
     * Business logic property for the mixture data to display.
     * @const
     * @private
     * @type {string}
     */
    const PROP_MIXTURE_DATA = "PROP_MIXTURE_DATA";


    /**
     * Deriving from {@link Wincor.UI.Content.AnimationsViewModel} class.
     * @class
     */
    Wincor.UI.Content.WithdrawalAnimationsViewModel = class WithdrawalAnimationsViewModel extends Wincor.UI.Content.AnimationsViewModel {
    
        /**
         * The observable array for the denominations of the notes.
         * @type {function | ko.observable}
         * @bindable
         */
        notes = null;
    
        /**
         * The observable array for the denominations of the coins.
         * @type {function | ko.observable}
         * @bindable
         */
        coins = null;
        
        /**
         * The observable array for items (for example vouchers).
         * @type {function | ko.observable}
         * @bindable
         */
        items = null;
        
        /**
         * The currency, retrieved from the {@link Wincor.UI.Content.BaseViewModel#bankingContext} object, see
         * @type {string}
         */
        currency = "";
        
        /**
         * The currency symbol, retrieved from the {@link Wincor.UI.Content.BaseViewModel#bankingContext} object, see
         * @type {string}
         */
        symbol = "";
    
        /**
         * This observable stores the displayed text for the coins.
         * @type {function | ko.observable}
         * @bindable
         */
        animationTextCoins = null;
        
        /**
         * This observable stores the displayed text for the notes.
         * @type {function | ko.observable}
         * @bindable
         */
        animationTextNotes = null;
        
        /**
         * This observable stores the displayed text for the receipt.
         * @type {function | ko.observable}
         * @bindable
         */
        animationTextReceipt = null;
    
        /**
         * This observable is true, if the flex-box Note-Withdrawal shall be displayed.
         * @type {function | ko.observable}
         * @bindable
         */
        viewFlexNotesEject = null;
        
        /**
         * This observable is true, if the flex-box for Coin-Withdrawal shall be displayed.
         * @type {function | ko.observable}
         * @bindable
         */
        viewFlexCoinsEject = null;
        
        /**
         * This observable is true, when the flex-box for the Receipt shall be displayed.
         * @type {function | ko.observable}
         * @bindable
         */
        viewFlexReceipt = null;
    
        /**
         * This observable stores the displayed text for the Items.
         * @type {function | ko.observable}
         * @bindable
         */
        animationTextItems = null;
        
        /**
         * This observable is true, when the flex-box for the Items shall be displayed.
         * @type {function | ko.observable}
         * @bindable
         */
        viewFlexItemsEject = null;
        
        /**
         * This observable is true, when the flex-box for the Electronic Receipt shall be displayed.
         * @type {function | ko.observable}
         * @bindable
         */
        viewFlexElectronicReceipt = null;
        
        /**
         * This observable stores the displayed text for the Electronic Receipt.
         * @type {function | ko.observable}
         * @bindable
         */
        animationTextElectronicReceipt = null;

        /**
         * See {@link Wincor.UI.Content.BaseViewModel#constructor}.
         * @lifecycle viewmodel
         */
        constructor() {
            super();
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> WithdrawalAnimationsViewModel::WithdrawalAnimationsViewModel");
            this.eventRegistrations.push({
                eventNumber: EVENT_INFO.ID_CASH,
                eventOwner: EVENT_INFO.NAME
            });
    
            this.notes = ko.observableArray();
            this.coins = ko.observableArray();
            this.items = ko.observableArray();
            this.currency = "";
            this.symbol = "";
            this.viewFlexNotesEject = ko.observable(false);
            this.viewFlexCoinsEject = ko.observable(false);
            this.viewFlexReceipt = ko.observable(false);
            this.viewFlexItemsEject = ko.observable(false);
            this.viewFlexElectronicReceipt = ko.observable(false);
            this.animationTextCoins = ko.observable("");
            this.animationTextNotes = ko.observable("");
            this.animationTextReceipt = ko.observable("");
            this.animationTextItems = ko.observable("");
            this.animationTextElectronicReceipt = ko.observable("");
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< WithdrawalAnimationsViewModel::WithdrawalAnimationsViewModel");
        }
        
        /**
         * See {@link Wincor.UI.Content.BaseViewModel#onDeactivated}.
         * @lifecycle viewmodel
         */
        onDeactivated() {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> WithdrawalAnimationsViewModel::onDeactivated()");
            super.onDeactivated();
    
            this.eventRegistrations.push({
                eventNumber: EVENT_INFO.ID_CASH,
                eventOwner: EVENT_INFO.NAME
            });
    
            this.notes([]);
            this.coins([]);
            this.items([]);
            this.currency = "";
            this.symbol = "";
            this.viewFlexNotesEject(false);
            this.viewFlexCoinsEject(false);
            this.viewFlexReceipt(false);
            this.viewFlexItemsEject(false);
            this.viewFlexElectronicReceipt(false);
            this.animationTextNotes("");
            this.animationTextCoins("");
            this.animationTextReceipt("");
            this.animationTextItems("");
            this.animationTextElectronicReceipt("");
            window.sessionStorage.removeItem(KEY_SESSION_STORAGE_DENOM);
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< WithdrawalAnimationsViewModel::onDeactivated()");
        }
        
        /**
         * Initializes the DOM-associated objects.
         * Overrides {@link Wincor.UI.Content.AnimationsViewModel#observe}
         * @param {String} observableAreaId The area id to observe via knockout
         * @lifecycle viewmodel
         */
        observe(observableAreaId) {
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `> WithdrawalAnimationsViewModel::observe(${observableAreaId})`);
            super.observe(observableAreaId);
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< WithdrawalAnimationsViewModel::observe");
        }

        /**
         * Sets the proper animation content depending on the given result array.
         * @param {Array<String>} resultArray The result content keys
         */
        setAnimations(resultArray) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `> WithdrawalAnimationsViewModel::setAnimations(${resultArray})`);

            this.viewFlexNotesEject(this.isAvailable(resultArray, "TakeNotesInputTray") ||
                                    this.isAvailable(resultArray, "TakeNotesOutputTray") ||
                                    this.isAvailable(resultArray, "TakeNotes"));

            this.viewFlexItemsEject(this.isAvailable(resultArray, "TakeItems"));
            this.viewFlexCoinsEject(this.isAvailable(resultArray, "TakeCoins")); // Top / Bottom / Both
            this.viewFlexReceipt(this.isAvailable(resultArray, "TakeReceipt"));
            this.viewFlexElectronicReceipt(this.isAvailable(resultArray, "SendReceipt"));

            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< WithdrawalAnimationsViewModel::setAnimations");
            super.setAnimations(resultArray);
        }

        /**
         * Enhances denomData with denominations of coins, until business data is providing coins as well as notes:
         * @param {Object} denomData Object with the denominations
         * @return {Object} The enhanced object 'denomData' which was also given as argument.
         */
        enhanceDenominationsWithCoins(denomData) {
            if (!denomData) {
                //because of former parsing errors, denomData could be null here (happened in application mode)
                denomData = {};
            }
            if (!denomData.denominations) {
                denomData.denominations = [];
            }
            denomData.denominations.push({"type": 1, "count": [0, 1], "val": 1, "softLimit": 20});
            denomData.denominations.push({"type": 1, "count": [0, 1, 2], "val": 2, "softLimit": 20});
            denomData.denominations.push({"type": 1, "count": [0, 1], "val": 5, "softLimit": 20});
            denomData.denominations.push({"type": 1, "count": [0, 1, 2], "val": 10, "softLimit": 20});
            denomData.denominations.push({"type": 1, "count": [0, 1], "val": 20, "softLimit": 20});
            denomData.denominations.push({"type": 1, "count": [0, 1, 2], "val": 50, "softLimit": 20});
            denomData.denominations.push({"type": 1, "count": [0, 1], "val": 100, "softLimit": 20});
            denomData.denominations.push({"type": 1, "count": [0, 1, 2], "val": 200, "softLimit": 20});
            return denomData;
        }

        /**
         * Enhances denomData with denominations ofnotes, usable if application does not deliver this data.
         * @param {Object} denomData Object with the denominations
         * @return {Object} The enhanced object 'denomData' which was also given as argument.
         */
        enhanceDenominationsWithNotes(denomData) {
            if (!denomData) {
                //because of former parsing errors, denomData could be null here (happened in application mode)
                denomData = {};
            }
            if (!denomData.denominations) {
                denomData.denominations = [];
            }
            denomData.denominations.push({"type": 0, "count": [0], "val": 500, "softLimit": 20});
            denomData.denominations.push({"type": 0, "count": [0], "val": 1000, "softLimit": 20});
            denomData.denominations.push({"type": 0, "count": [0], "val": 2000, "softLimit": 20});
            denomData.denominations.push({"type": 0, "count": [0], "val": 5000, "softLimit": 20});
            denomData.denominations.push({"type": 0, "count": [0], "val": 10000, "softLimit": 20});
            return denomData;
        }

        /**
         * Sets up the observables for the denominations
         * @param {Object} denomData Object with the denominations
         */
        setupObservables(denomData) {
            this.notes(denomData.denominations.filter(elem => {return (elem.type === 0 || elem.type === "0") && elem.count.length }));
            this.coins(denomData.denominations.filter(elem => {return (elem.type === 1 || elem.type === "1") && elem.count.length}));
        }
    
        /**
         * See {@link Wincor.UI.Content.BaseViewModel#onInitTextAndData}.
         * Reads the data needed for the animations from PROP_MIXTURE_DATA first.
         * If no data is available or a parsing error occurs a fallback is used instead.
         * The fallback itself checks whether a possible bill splitting view has generated data before, stored in the Session Storage.
         *
         * @param {Object} args Contains the attributes 'textKeys' {array.<string|promise>} and 'dataKeys' {array.<string|promise>}, which should be filled up by the viewmodel.
         * @lifecycle viewmodel
         */
        onInitTextAndData(args) {
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `> WithdrawalAnimationsViewModel::onInitTextAndData(${JSON.stringify(args)})`);
            const self = this;
            let denomData;

            this.currency = this.bankingContext.currencyData.iso;
            this.symbol = this.bankingContext.currencyData.symbol;
            this.items([
                {count:[0]},
                {count:[0]},
                {count:[0]},
                {count:[0]},
                {count:[0]}
            ]);

            if(!this.designMode) {
                args.dataKeys.push(ext.Promises.promise(resolve => {
                    // Note: The PROP_MIXTURE_DATA prop reading and processing has high priority. Only if no data is available or a parsing error occurs a fallback
                    // is used instead. The fallback itself checks whether a possible bill splitting view has generated data before, stored in the Session Storage.
                    this.serviceProvider.DataService.getValues(PROP_MIXTURE_DATA).then(result => {
                        function createFallbackObjects() {
                            try {
                                // ask for bill splitting has set data already
                                denomData = JSON.parse(window.sessionStorage.getItem(KEY_SESSION_STORAGE_DENOM));
                                if(!denomData) { // if not set fallback
                                    denomData = self.enhanceDenominationsWithNotes(denomData);
                                    denomData = self.enhanceDenominationsWithCoins(denomData);
                                }
                                _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `. WithdrawalAnimationsViewModel::createFallbackObjects, denomData=${JSON.stringify(denomData)}`);
                                self.setupObservables(denomData);
                            } catch(e) {
                                _logger.error(`Withdrawal animations create fallback objects failed with ${e}`);
                            }
                            resolve(); // resolve in any case
                        }
                        let data = result[PROP_MIXTURE_DATA];
                        if(data) {
                            try {
                                denomData = typeof data !== "object" ? JSON.parse(data) : data;
                                if(denomData.denominations.length > 0) {
                                    let c, items = denomData.denominations, lim = 5;
                                    // build array for each count
                                    for(let i = 0; i < items.length; i++) {
                                        c = items[i].count;
                                        items[i].count = [];
                                        for(let j = 0; j < c && j < lim; j++) {
                                            items[i].count.push(j);
                                        }
                                    }
                                    this.setupObservables(denomData);
                                    resolve();
                                } else {
                                    _logger.error(`Error mixture data prop=${PROP_MIXTURE_DATA} contains no denominations. View model will work with fallback objects and proceed.`);
                                    createFallbackObjects();
                                }
                            } catch(e) {
                                _logger.error(`Parsing error mixture data prop=${PROP_MIXTURE_DATA}. View model will work with fallback objects and proceed. error:${e}`);
                                createFallbackObjects(); //A Change Request said, that parsing error shall not end this animation with an error, fallback used instead.
                            }
                        } else {
                            // create fallback objects
                            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, ". WithdrawalAnimationsViewModel::onInitTextAndData, create fallback objects for denominations");
                            createFallbackObjects();
                        }
                    });
                }));
            } else {
                args.dataKeys.push(this.designTimeRunner.retrieveJSONData("WithdrawalItemsData")
                    .then(data => {
                        denomData = JSON.parse(window.sessionStorage.getItem(KEY_SESSION_STORAGE_DENOM));
                        if(!denomData) {
                            denomData = data;
                        }
                        this.animationTextNotes(`${data.symbol} ${this.vmHelper.convertByExponent(parseInt(data.amount), data.exponent)}`);
                        this.animationTextCoins(`${data.symbol} ${this.vmHelper.convertByExponent(parseInt(data.amountCoins), data.exponent)}`);
                        this.currency = data.currency;
                        this.symbol = data.symbol;
                        this.setupObservables(denomData);
                        this.viewFlexNotesEject(data.ejectNotes);
                        this.viewFlexCoinsEject(data.ejectCoins);
                        this.viewFlexReceipt(data.ejectReceipt);
                        this.animationTextReceipt("Receipt");
                        this.viewFlexItemsEject(data.ejectVoucher);
                        this.animationTextItems("Voucher");
                        this.viewFlexElectronicReceipt(data.ejectElectronicReceipt);
                        this.animationTextElectronicReceipt("Electronic Receipt");
                        if(this.coins().length === 0) {
                            this.viewFlexCoinsEject(false);
                        }
                        if(this.notes().length === 0) {
                            this.viewFlexNotesEject(false);
                        }
                }));
            }
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, "< WithdrawalAnimationsViewModel::onInitTextAndData");
            return super.onInitTextAndData(args);
        }
    
        /**
         * See {@link Wincor.UI.Content.BaseViewModel#onInitTextAndData}.
         * Depending on the value of each 'AnimationText_xyz' textkey, the animation observables are set.
         *
         * @param {Object} result Contains the key:value pairs of text previously retrieved by this view-model subclass.
         * @lifecycle viewmodel
         */
        onTextReady(result) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> WithdrawalAnimationsViewModel::onTextReady(...)");
            // ContentKeys for notes: TakeNotesInputTray, TakeNotesOutputTray, TakeNotes, InsertNotes
            // ContentKeys for coins: TakeCoinsTop, TakeCoinsBottom, TakeCoinsBoth, InsertCoins
            // ContentKeys general: PleaseWait
            for(let key in result) {
                if(result.hasOwnProperty(key)) {
                    if(key.includes("AnimationText_TakeNotes") || key.includes("AnimationText_InsertNotes")) {
                        // map all Notes derivations to corresponding text observable
                        this.animationTextNotes(result[key]);
                    } else if(key.includes("AnimationText_TakeCoins") || key.includes("AnimationText_InsertCoins")) {
                        // map all Coins derivations to corresponding text observable
                        this.animationTextCoins(result[key]);
                    } else if(key.includes("AnimationText_TakeReceipt")) {
                        // map all Coins derivations to corresponding text observable
                        this.animationTextReceipt(result[key]);
                    } else if(key.includes("AnimationText_TakeItems")) {
                        this.animationTextItems(result[key]);
                    } else if(key.includes("AnimationText_SendReceipt")) {
                        // map all Coins derivations to corresponding text observable
                        this.animationTextElectronicReceipt(result[key]);
                    }
                }
            }
            super.onTextReady(result);
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< WithdrawalAnimationsViewModel::onTextReady");
        }
    }
});
