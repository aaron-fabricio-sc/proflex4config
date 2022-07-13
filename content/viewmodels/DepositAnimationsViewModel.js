/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ DepositAnimationsViewModel.js 4.3.1-210127-21-34ae33df-1a04bc7d
 */
define(["knockout", "extensions", "vm/AnimationsViewModel"], function(ko, ext) {
    "use strict";

    const _logger = Wincor.UI.Service.Provider.LogProvider;
    const _dataService = Wincor.UI.Service.Provider.DataService;
    const _eventService = Wincor.UI.Service.Provider.EventService;

    const EVENT_INFO = _eventService.getEventInfo("TRANSACTION_MODULE");

    const PROP_DEPOSIT_CURRENCY = "PROP_DEPOSIT_CURRENCY";

    /**
     * Property key for access to the maximum number of notes
     * @const
     * @type {string}
     */
    const PROP_MAX_ITEMS_ON_STACKER = "PROP_MAX_ITEMS_ON_STACKER";

    /**
     * Business logic property for the note data to display.
     * @const
     * @private
     * @type {string}
     */
    const PROP_ROLLBACK_NOTES_DATA = "PROP_ROLLBACK_NOTES_DATA";

    /**
     * Business logic property for the coin data to display.
     * @const
     * @private
     * @type {string}
     */
    const PROP_ROLLBACK_COINS_DATA = "PROP_ROLLBACK_COINS_DATA";

    const KEY_SESSION_STORAGE_DENOM = "dispenseDistribution";

    /**
     * This class is used to automatically display viewkey-dependent / event-triggered animated content for deposit transactions.
     * Deriving from {@link Wincor.UI.Content.AnimationsViewModel} class.
     * @class
     * @since 1.0/00
     */
    Wincor.UI.Content.DepositAnimationsViewModel = class DepositAnimationsViewModel extends Wincor.UI.Content.AnimationsViewModel {

        /**
         * The level 2/3/4 note item list.
         * @type {function | ko.observableArray}
         * @bindable
         */
        notes = null;

        /**
         * The level 4 coin item list.
         * @type {function | ko.observableArray}
         * @bindable
         */
        coins = null;

        /**
         * The currency ISO code, e.g. 'USD'
         * @type {string}
         * @bindable
         */
        currency = "";

        /**
         * The currency symbol e.g. '$'
         * @type {string}
         * @bindable
         */
        symbol = "";

        /**
         * The maximum allowed items on the stacker (e.g. ESCROW)
         * @type {function | ko.observable}
         * @bindable
         */
        maxItems = null;

        /**
         * Animation content flag for notes insertion.
         * @type {function | ko.observable}
         * @bindable
         */
        viewFlexNotesInsert = null;

        /**
         * Animation content flag for coins insertion.
         * @type {function | ko.observable}
         * @bindable
         */
        viewFlexCoinsInsert = null;

        /**
         * Animation content flag for take metal out.
         * @type {function | ko.observable}
         * @bindable
         */
        viewFlexTakeMetal = null;

        /**
         * Animation content flag for turning notes during insertion.
         * @type {function | ko.observable}
         * @bindable
         */
        viewFlexTurnNotes = null;

        /**
         * Animation content flag for turning notes with short side first during insertion.
         * @type {function | ko.observable}
         * @bindable
         */
        viewFlexTurnNotesShortSideFirst = null;

        /**
         * Animation content flag for notes ejection.
         * @type {function | ko.observable}
         * @bindable
         */
        viewFlexNotesEject = null;

        /**
         * Animation content flag for coins ejection.
         * @type {function | ko.observable}
         * @bindable
         */
        viewFlexCoinsEject = null;

        /**
         * Animation content flag for short side first notes insertion.
         * @type {function | ko.observable}
         * @bindable
         */
        viewFlexNotesInsertShortSideFirst = null;

        /**
         * Animation content flag for short side first notes ejection.
         * @type {function | ko.observable}
         * @bindable
         */
        viewFlexNotesEjectShortSideFirst = null;

        /**
         * Animation content flag for taking metal on notes with short side first during insertion.
         * @type {function | ko.observable}
         * @bindable
         */
        viewFlexNotesTakeMetalShortSideFirst = null;

        /**
         * Animation content flag for guiding deposit hints such as e.g. no paper clips.
         * @type {function | ko.observable}
         * @bindable
         */
        viewFlexDepositHints = null;

        /**
         * Animation content flag for guiding text content taking metal stuff out during insertion.
         * @type {function | ko.observable}
         * @bindable
         */
        animationTextTakeMetal = null;

        /**
         * Animation content flag for guiding text content to turn notes during insertion.
         * @type {function | ko.observable}
         * @bindable
         */
        animationTextTurnNotes = null;

        /**
         * Animation content flag for guiding text content on coins during insertion.
         * @type {function | ko.observable}
         * @bindable
         */
        animationTextCoins = null;

        /**
         * Animation content flag for guiding text content on notes during insertion.
         * @type {function | ko.observable}
         * @bindable
         */
        animationTextNotes = null;

        /**
         * Initializes the members to become an observable.
         * Registers for the deposit event <code>TRANSACTION_MODULE</code>
         * @lifecycle viewmodel
         */
        constructor() {
            super();

            this.eventRegistrations.push( {
                eventNumber: EVENT_INFO.ID_DEPOSIT,
                eventOwner: EVENT_INFO.NAME
            });

            this.notes = ko.observableArray();
            this.coins = ko.observableArray();

            this.currency = "";
            this.symbol = "";

            this.maxItems = ko.observable("");

            this.viewFlexNotesEject = ko.observable(false);
            this.viewFlexCoinsEject = ko.observable(false);
            this.viewFlexNotesInsert = ko.observable(false);
            this.viewFlexCoinsInsert = ko.observable(false);
            this.viewFlexTakeMetal = ko.observable(false);
            this.viewFlexTurnNotes = ko.observable(false);
            this.viewFlexTurnNotesShortSideFirst = ko.observable(false);

            this.viewFlexNotesInsertShortSideFirst = ko.observable(false);
            this.viewFlexNotesEjectShortSideFirst = ko.observable(false);
            this.viewFlexTakeMetalShortSideFirst = ko.observable(false);

            this.viewFlexDepositHints = ko.observable(false);
            this.animationTextTakeMetal = ko.observable("");
            this.animationTextTurnNotes = ko.observable("");
            this.animationTextCoins = ko.observable("");
            this.animationTextNotes = ko.observable("");
        }

        /**
         * Is called when this viewmodel gets deactivated during life-cycle.
         * @lifecycle viewmodel
         */
        onDeactivated() {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> DepositAnimationsViewModel::onDeactivated()");
            super.onDeactivated();

            this.eventRegistrations.push( {
                eventNumber: EVENT_INFO.ID_DEPOSIT,
                eventOwner: EVENT_INFO.NAME
            });

            this.notes([]);
            this.coins([]);

            this.currency = "";
            this.symbol = "";

            this.maxItems("");

            this.viewFlexNotesInsert(false);
            this.viewFlexCoinsInsert(false);
            this.viewFlexTakeMetal(false);
            this.viewFlexTurnNotes(false);
            this.viewFlexTurnNotesShortSideFirst(false);
            this.viewFlexNotesEject(false);
            this.viewFlexCoinsEject(false);

            this.viewFlexNotesInsertShortSideFirst(false);
            this.viewFlexNotesEjectShortSideFirst(false);
            this.viewFlexTakeMetalShortSideFirst(false);

            this.viewFlexDepositHints (false);
            this.animationTextTakeMetal("");
            this.animationTextTurnNotes("");
            this.animationTextNotes("");
            this.animationTextCoins("");
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< DepositAnimationsViewModel::onDeactivated()");
        }
        
        /**
         * This method initializes the DOM-associated objects.
         * Overrides {@link Wincor.UI.Content.BaseViewModel#observe}
         * @param {String} observableAreaId the area to observe via knockout
         * @lifecycle viewmodel
         */
        observe(observableAreaId) {
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `> DepositAnimationsViewModel::observe(${observableAreaId})`);
            // first switch off default message handling. This means that in DesignMode we use
            // the default message handling of the MessageViewModel. In 'real mode' we override
            // the default message handling, because we dynamically have to change the visibility.
            // no need for initTextAndData() ... done by AnimationsViewModel
            this.isDefaultMessageHandling = this.designMode;
            super.observe(observableAreaId);
            // handle footer commands...
            if(this.designMode) {
                this.cmdRepos.whenAvailable(["DEPOSIT_CONFIRM", "DEPOSIT_CANCEL"]).then(() => this.cmdRepos.setActive(["DEPOSIT_CONFIRM", "DEPOSIT_CANCEL"], true));
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< DepositAnimationsViewModel::observe");
        }

        /**
         * Sets the proper animation content flags depending on the given result array.
         * Is called from base class.
         * @param {Array<String>} resultArray the result content keys
         * @override
         */
        setAnimations(resultArray) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `> DepositAnimationsViewModel::setAnimations(${resultArray})`);
            // insert notes
            this.viewFlexNotesInsert(this.isAvailable(resultArray, "InsertNotes"));
            // insert coins
            this.viewFlexCoinsInsert(this.isAvailable(resultArray, "InsertCoins"));
            // take metal
            this.viewFlexTakeMetal(this.isAvailable(resultArray, "TakeMetal"));
            // turn notes
            this.viewFlexTurnNotes(this.isAvailable(resultArray, "TurnNotes"));
            // turn notes short side first
            this.viewFlexTurnNotesShortSideFirst(this.isAvailable(resultArray, "TurnNotesShortSideFirst"));
            // take notes
            this.viewFlexNotesEject(this.isAvailable(resultArray, "TakeNotesInputTray") ||
                                    this.isAvailable(resultArray, "TakeNotesOutputTray") ||
                                    this.isAvailable(resultArray, "TakeNotes"));
            // take coins
            this.viewFlexCoinsEject(this.isAvailable(resultArray, "TakeCoins"));
            // insert notes SSF
            this.viewFlexNotesInsertShortSideFirst(this.isAvailable(resultArray, "InsertNotesShortSideFirst"));
            // eject notes SSF
            this.viewFlexNotesEjectShortSideFirst(this.isAvailable(resultArray, "TakeNotesShortSideFirst"));
            // take metal SSF
            this.viewFlexTakeMetalShortSideFirst(this.isAvailable(resultArray, "TakeMetalShortSideFirst"));
            // deposit hints depositHints
            this.viewFlexDepositHints(this.isAvailable(resultArray, "DepositHints"));

            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< DepositAnimationsViewModel::setAnimations");
            super.setAnimations(resultArray);
        }

        /**
         * Enhance denominations with coins, until business data is providing coins as well as notes.
         * @param {Object} denomData Object with the denominations. Default is {}
         */
        enhanceDenominationsWithCoins(denomData = {}) {
            denomData = denomData || {};
            denomData.denominations = denomData.denominations || [];
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
         * Enhance denominations with notes, usable if application does not deliver this data.
         * @param {Object} denomData Object with the denominations. Default is {}
         */
        enhanceDenominationsWithNotes(denomData = {}) {
            denomData = denomData || {};
            denomData.denominations = denomData.denominations || [];
            denomData.denominations.push({"type": 0, "count": [0], "val": 500, "softLimit": 20});
            denomData.denominations.push({"type": 0, "count": [0], "val": 1000, "softLimit": 20});
            denomData.denominations.push({"type": 0, "count": [0], "val": 2000, "softLimit": 20});
            denomData.denominations.push({"type": 0, "count": [0], "val": 5000, "softLimit": 20});
            denomData.denominations.push({"type": 0, "count": [0], "val": 10000, "softLimit": 20});
            denomData.denominations.reverse(); // reverse notes so that the lowest value is on top
            return denomData;
        }

        /**
         * Sets up the observables for the denominations
         * @param {Object} denomData Object with the denominations
         */
        setupObservables(denomData) {
            this.notes(denomData.denominations.filter(elem => { return elem.type === 0 || elem.type === "0" }));
            this.coins(denomData.denominations.filter(elem => { return elem.type === 1 || elem.type === "1" }));
        }

        /**
         * Initializes text content by retrieving text from localize service and data by gathering business data property values via data service.
         * The method reads the properties for <code>PROP_DEPOSIT_CURRENCY, PROP_MAX_ITEMS_ON_STACKER, PROP_ROLLBACK_NOTES_DATA and PROP_ROLLBACK_COINS_DATA</code>.
         * @param {Object} args contains attributes textKeys {array.<string|promise>} / dataKeys {array.<string|promise>}
         * @lifecycle viewmodel
         */
        onInitTextAndData(args) {
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `> DepositAnimationsViewModel::onInitTextAndData(${JSON.stringify(args)})`);
            this.currency = this.bankingContext.currencyData.iso;
            this.symbol = this.bankingContext.currencyData.symbol;
            const self = this;
            let denomData = JSON.parse(window.sessionStorage.getItem(KEY_SESSION_STORAGE_DENOM));

            if(!this.designMode) {
                if(!denomData) {
                    args.dataKeys.push(ext.Promises.promise(resolve => {
                        _dataService.getValues([PROP_DEPOSIT_CURRENCY, PROP_MAX_ITEMS_ON_STACKER, PROP_ROLLBACK_NOTES_DATA, PROP_ROLLBACK_COINS_DATA]).then(result => {
                            function createFallbackObjects() {
                                try {
                                    denomData = self.enhanceDenominationsWithNotes(denomData);
                                    denomData = self.enhanceDenominationsWithCoins(denomData);
                                    _logger.log(_logger.LOG_DETAIL, `. DepositAnimationsViewModel::createFallbackObjects, denomdata=${JSON.stringify(denomData)}`);
                                    self.setupObservables(denomData);
                                } catch(e) {
                                    _logger.error("create fallback objects failed with " + e);
                                }
                                resolve(); // resolve in any case
                            }

                            // set deposit currency and max items on stacker

                            // Ignore PROP_DEPOSIT_CURRENCY and use the banking context currency instead.
                            // Which currency source to be used must be clarified in a future release.
                            // if(result[PROP_DEPOSIT_CURRENCY] || result[PROP_DEPOSIT_CURRENCY] === "") {
                            //     self.currency = result[PROP_DEPOSIT_CURRENCY];
                            // }
                            if(result[PROP_MAX_ITEMS_ON_STACKER]) {
                                self.maxItems(result[PROP_MAX_ITEMS_ON_STACKER]);
                            }

                            // We have 2 properties to handle notes/coins in deposit rollback so we must merge them denominations
                            let noteData = result[PROP_ROLLBACK_NOTES_DATA];
                            let coinData = result[PROP_ROLLBACK_COINS_DATA];
                            if(noteData || coinData) {
                                try {
                                    let i;
                                    if(noteData) {
                                        denomData = typeof noteData !== "object" ? JSON.parse(noteData) : noteData;
                                    }
                                    if(coinData) {
                                        coinData = typeof coinData !== "object" ? JSON.parse(coinData) : coinData;
                                        if(denomData) { // merge with notes?
                                            denomData.denominations.reverse(); // reverse notes so that the lowest value is on top
                                            denomData.denominations = denomData.denominations.concat(coinData.denominations);
                                        } else {
                                            denomData = coinData;
                                        }
                                    }
                                    // build array for each count
                                    let items = denomData.denominations, c, lim = 5;
                                    for(i = 0; i < items.length; i++) {
                                        c = items[i].count;
                                        items[i].count = [];
                                        for(let j = 0; j < c && j < lim; j++) {
                                            items[i].count.push(j);
                                        }
                                    }
                                    self.setupObservables(denomData);
                                    resolve();
                                } catch(e) {
                                    _logger.error(`Parsing error note or coin data props=${PROP_ROLLBACK_NOTES_DATA} or ${PROP_ROLLBACK_COINS_DATA}. View model will work with fallback objects and proceed. error:${e}`);
                                    createFallbackObjects(); //A Change Request said, that parsing error shall not end this animation with an error, fallback used instead.
                                }
                            } else {
                                // create fallback objects
                                _logger.log(_logger.LOG_DETAIL, ". WithdrawalAnimationsViewModel::onInitTextAndData, create fallback objects for denominations");
                                createFallbackObjects();
                            }
                        });
                    }));
                } else {
                    self.setupObservables(denomData);
                }
            } else {
                this.maxItems("50");
                if(!denomData) {
                    args.dataKeys.push(this.designTimeRunner.retrieveJSONData("DepositItemsData")
                        .then(data => {
                            this.viewFlexDepositHints(data.depositHints);
                            this.viewFlexNotesInsert(data.insertNotes);
                            this.viewFlexNotesEject(data.ejectNotes);
                            this.viewFlexCoinsInsert(data.insertCoins);
                            this.viewFlexCoinsEject(data.ejectCoins);
                            this.viewFlexTakeMetal(data.takeMetal);
                            this.viewFlexTurnNotes(data.turnNotesLongSideFirst);
                            this.viewFlexTurnNotesShortSideFirst(data.turnNotesShortSideFirst);

                            this.viewFlexNotesInsertShortSideFirst(data.insertNotesShortSideFirst);
                            this.viewFlexNotesEjectShortSideFirst(data.ejectNotesShortSideFirst);
                            this.viewFlexTakeMetalShortSideFirst(data.takeMetalShortSideFirst);

                            denomData = data.denomData;
                            this.animationTextNotes(this.vmHelper.convertByExponent(parseInt(denomData.amount), denomData.exponent));
                            this.animationTextCoins(this.vmHelper.convertByExponent(parseInt(denomData.amountCoins), denomData.exponent));
                            this.currency = denomData.currency;
                            this.symbol = denomData.symbol;
                            this.notes(denomData.denominations.filter(elem => { return elem.type === 0 || elem.type === "0" }));
                            this.coins(denomData.denominations.filter(elem => { return elem.type === 1 || elem.type === "1" }));
                    }));
                }
            }
            // remove session context
            window.sessionStorage.removeItem(KEY_SESSION_STORAGE_DENOM);
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, "< DepositAnimationsViewModel::onInitTextAndData");
            return super.onInitTextAndData(args);
        }

        /**
         * Is called when text retrieving is ready during viewmodel life-cycle.
         * @param {Object} result the result object with the text keys/value pairs
         * @lifecycle viewmodel
         */
        onTextReady(result) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> DepositAnimationsViewModel::onTextReady(...)");
            // ContentKeys for notes: TakeNotesInputTray, TakeNotesOutputTray, TakeNotes, InsertNotes
            // ContentKeys for coins: TakeCoinsTop, TakeCoinsBottom, TakeCoinsBoth, InsertCoins
            for(let key in result) {
                if(result.hasOwnProperty(key)) {
                    if(key.indexOf("AnimationText_TakeNotes") !== -1 ||
                        key.indexOf("AnimationText_InsertNotes") !== -1) {
                        // map all Notes derivations to corresponding text observable
                        this.animationTextNotes(result[key]);
                    } else if(key.indexOf("AnimationText_TakeCoins") !== -1 ||
                        key.indexOf("AnimationText_InsertCoins") !== -1) {
                        // map all Coins derivations to corresponding text observable
                        this.animationTextCoins(result[key]);
                    } else if(key.indexOf("AnimationText_TakeMetal") !== -1) {
                        this.animationTextTakeMetal(result[key]);
                    } else if(key.indexOf("AnimationText_TurnNotes") !== -1) {
                        this.animationTextTurnNotes(result[key]);
                    }
                }
            }
            super.onTextReady(result);
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< DepositAnimationsViewModel::onTextReady");
        }
    }
});
