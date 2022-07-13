/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ BillSplittingViewModel.js 4.3.1-210127-21-34ae33df-1a04bc7d
 */
define(["knockout", "extensions", "vm-util/ViewModelHelper", "ui-content", "basevm"], function(ko, ext, viewModelHelper) {
    "use strict";
    console.log("AMD:BillSplittingViewModel");

    const _logger = Wincor.UI.Service.Provider.LogProvider;
    const _dataService = Wincor.UI.Service.Provider.DataService;
    const _viewService = Wincor.UI.Service.Provider.ViewService;

    /**
     * Business logic property for the mixture data to display.
     * @const
     * @private
     * @type {string}
     */
    const PROP_MIXTURE_DATA = "PROP_MIXTURE_DATA";
    const CMD_BIGGER = "BIGGER";
    const CMD_SMALLER = "SMALLER";
    const KEY_SESSION_STORAGE_DENOM = "dispenseDistribution";


    /**
     * Class for worker usage to calculate distribution
     * @class Wincor.UI.Content.BillSplittingViewModel~CalculationThread
     */
    class CalculationThread {

        /**
         * Constructor
         * @param {String} workerUrl Path to the worker script
         */
        constructor(workerUrl) {
            this._workerUrl = workerUrl;
            this._worker = null;
            this._initialized = false;
            this._currentResolver = null;
            this._currentRejector = null;
        }

        /**
         * Loads worker, installs listeners and resolves when worker posted "READY_FOR_ACTION"
         * Expecting two events:
         * 1. Ready for action (one time only)
         * 2. Solution if input data were posted
         * @returns {Promise<undefined>}
         */
        initialize() {
            return ext.Promises.promise(resolve => {
                if(!this._initialized) {
                    this._worker = new Worker(this._workerUrl);
                    const _initializer = ({data: data}) => {
                        if(data === "READY_FOR_ACTION") {
                            this._initialized = true;
                            resolve();
                        } else {
                            if (typeof this._currentResolver === "function") {
                                this._currentResolver(data);
                            }
                        }
                    };
                    this._worker.addEventListener("message", _initializer);
                    this._worker.addEventListener("error", e => {
                        if (typeof this._currentRejector === "function") {
                            this._currentRejector(e);
                        }
                    })
                } else {
                    resolve();
                }
            }).timeout(5000);
        }

        /**
         * Calculates a distribution asynchronously and resolves the returned promise with distribution data
         * @param maxItems
         * @param {Object} distInfo
         * @param {Number} distInfo.amount
         * @param {Array<Number>} distInfo.itemValues
         * @param {Number} distInfo.counts
         * @param {Array<String>} distInfo.itemTypes
         * @param {Number} distInfo.maxNotes
         * @param {Number} distInfo.maxCoins
         * @returns {Promise}
         */
        getDistribution(maxItems, {amount, itemValues, counts, itemTypes, maxNotes, maxCoins}) {
            if (!this._initialized) {
                return ext.Promises.Promise.reject();
            }
            return ext.Promises.promise((resolve, reject) => {
                this._currentResolver = (result) => {
                    resolve(result);
                };
                this._currentRejector = (result) => {
                    reject(result);
                };
                this._worker.postMessage({
                    maxItems: maxItems, // soft limit for items to use is the limit to each item count
                    maxNotes: maxNotes, // the physical dispense limit over all note denominations
                    maxCoins: maxCoins, // the physical dispense limit over all coin denominations
                    types: itemTypes, // the types of the items: Either note or coin or both
                    amount: amount, // the amount (least unit, usually cent)
                    items: itemValues, // the item array
                    counts: counts, // the count array
                    maxTries: 25000, // max tries for the algo to find solutions
                    isAbortAfterFirstHit: false, // abort algo after first solution is found
                    splitMode: true, // whether using split mode or pure algo results
                    minResultsForSplitMode: 15 // minimum results by algo before split mode is used (relevant only if splitMode is true)
                });
            });
        }
    }

    /**
     * The Item class.
     * @class Wincor.UI.Content.BillSplittingViewModel~DenominationItem
     * @param {Number} value
     * @param {Number} count
     * @param {String} symbol
     * @param {String} iso
     * @param {Number} type
     * @type {function}
     */
    class DenominationItem {
        constructor(value, count, symbol, iso, type, exponent) {
            const self = this;
            this.type = type;
            this.value = value;
            this.count = ko.observable(count);
            this.result = ko.pureComputed(() => { // because of the result dynamic of each item we use a computed here
                return self.value * self.count();
            });
            this.notes = ko.observableArray([]);
            this.symbol = symbol;
            this.currency = iso;
            this.exponent = exponent;
            this.valueAda = viewModelHelper.convertByExponent(value, exponent);
        }
    }

    /**
     * The BillSplittingViewModel is meant to split a given start denomination distribution into smaller or bigger bills (or coins).
     * The customer is not able to freely select any possible distribution for the chosen amount.
     * For this use case please see {@link Wincor.UI.Content.BillSelectionViewModel} instead.
     * <br>
     * BillSplittingViewModel does not handle scrolling, assuming the view is able to present all valid distributions at any time on a softkey representing layout.
     * <p>
     * Starting from the best balanced distribution the customer may accept or change the start distribution in order to get more smaller or bigger bills.
     * Each distribution of the observable array member {@link Wincor.UI.Content.BillSplittingViewModel#distribution} is pre-calculated so that each increment or decrement
     * command only increases or decreases the pointer to a certain distribution by +1 or -1.
     * </p>
     * Deriving from {@link Wincor.UI.Content.BaseViewModel} class.
     * @class
     * @since 1.0/10
     */
    Wincor.UI.Content.BillSplittingViewModel = class BillSplittingViewModel extends Wincor.UI.Content.BaseViewModel {

        /**
         * Reference to the code-behind module
         */
        module = null;

        /*
        Current denomination info
         */
        /**
         * Holds the current denomination / distribution info
         * @type {{denominations: Array, srcData: (*|null), itemValues: Array, itemTypes: Array, items: Array, maxNotes: number, maxCoins: number, currentDist: Array, distributions: Array, counts: Array, distIdx: number, len: number, exponent: number, amount: number}}
         */
        denominationInfo = null;

        /**
         * The overall amount as the least value unit (e.g. cent).
         * @type {ko.observable}
         * @bindable
         */
        amount = ko.observable(0);

        /**
         * The overall amount as a formatted string.
         * @type {string}
         * @bindable
         */
        amountFormatted = "";

        /**
         * The chosen amount which customer usually entered during amount entry or chosen from the amount selection list.
         * Please note: In case of "amount zero" (no chosen or entered amount, the customer selects bills until max amount) this amount is zero.
         * @type {ko.observable}
         * @bindable
         */
        chosenAmount = null;

        /**
         * The distribution over all denominations available.
         * Each element in the array represents an object with item data of a certain distribution.
         * An item looks as follows:<br>
         *     <ul>
         *         <li>type: number 0-1</li>
         *         <li>value: number </li>
         *         <li>count: ko.observable(number)</li>
         *         <li>result: ko.computed(number) </li>
         *         <li>notes: ko.observableArray([number]) </li>
         *         <li>symbol: string </li>
         *         <li>currency: string </li>
         *         <li>exponent: number </li>
         *     </ul>
         * @type {ko.observableArray}
         * @bindable
         */
        distribution = ko.observableArray();

        /**
         * Checks whether at least one coin type is available in denominations.
         * @type {boolean}
         * @bindable
         */
        isCoinsAvailable = false;

        /**
         * Initializes this view model.
         * @param {*} codeBehindModule the billsplitting code-behind module, which should contain at least the <code>confirmSelection</code> function.
         * @lifecycle viewmodel
         */
        constructor(codeBehindModule) {
            super();
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> BillSplittingViewModel");

            this.denominationInfo = {
                denominations: [],
                srcData: null,
                itemValues: [],
                itemTypes: [],
                items: [],
                maxNotes: 0,
                maxCoins: 0,
                currentDist: [],
                distributions: [],
                counts: [],
                distIdx: 0,
                len: 0,
                exponent: -2,
                amount: 0,
            };

            this.module = codeBehindModule;
            this.chosenAmount = ko.observable(0);
            this.chosenAmount.extend({notify: "always"}); // because on refresh view we want a refresh of this observable bind as well, even the initial value is zero
            this.distributor = this.createCalculationThreadInstance("../viewmodels/base/Calculations.js");
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< BillSplittingViewModel");
        }

        /**
         * Handler function to remove/clear members.
         * Overridden to clear data list items, flags and counter.
         * @lifecycle viewmodel
         */
        onDeactivated() {
             _logger.LOG_INFO && _logger.log(_logger.LOG_INFO, ". BillSplittingViewModel::onDeactivated");
            super.onDeactivated();
            this.denominationInfo.len = 0;
            this.denominationInfo.currentDist = [];
            this.denominationInfo.distributions = [];
            this.denominationInfo.denominations.length = 0;
            this.denominationInfo.counts.length = 0;
            this.denominationInfo.items.length = 0;
            this.denominationInfo.itemValues.length = 0;
            this.denominationInfo.itemTypes.length = 0;
            this.denominationInfo.distIdx = 0;
            this.denominationInfo.maxNotes = 0;
            this.denominationInfo.maxCoins = 0;
            this.denominationInfo.srcData = null;
            this.amount(0);
            this.amountFormatted = "";
            this.chosenAmount(0);
            this.distribution([]);
            this.isCoinsAvailable = false;
        }

        /**
         * Cleaning up members which can't be cleared in onDeactivate.
         * @lifecycle viewmodel
         */
        clean() {
            _logger.log(_logger.LOG_INOUT, "> BillSplittingViewModel::clean()");
            this.module = null;
            this.distributor = null;
            super.clean();
            _logger.log(_logger.LOG_INOUT, "< BillSplittingViewModel::clean");
        }
        
        /**
         * This method usually initializes data before text and/or business data are retrieved, such as e.g. viewkey configuration.
         * Overrides {@link Wincor.UI.Content.BaseViewModel#observe}
         * @param {String} observableAreaId the area to observe via knockout
         * @lifecycle viewmodel
         */
        observe(observableAreaId) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `> BillSplittingViewModel::observe(observableAreaId=${observableAreaId})`);
            super.observe(observableAreaId);
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< BillSplittingViewModel::observe");
            return this;
        }

        /**
         * Creates and returns the current instance of the calculation thread
         * @param args
         * @returns {Wincor.UI.Content.BillSplittingViewModel~CalculationThread}
         */
        createCalculationThreadInstance(...args) {
            return this.distributor || new CalculationThread(...args);
        }

        /**
         * Creates and returns the current instance of the calculation thread
         * @param args
         * @returns {Wincor.UI.Content.BillSplittingViewModel~DenominationItem}
         */
        createDenominationItemInstance(...args) {
            return new DenominationItem(...args);
        }

        /**
         * Initializes the starting parameter.
         * @param {object} denomDataInit
         * @private
         */
        initItemData(denomDataInit) {
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `. BillSplittingViewModel::initItemData data=${JSON.stringify(denomDataInit)}`);
            this.denominationInfo.amount = parseInt(denomDataInit.amount);
            this.denominationInfo.exponent = parseInt(denomDataInit.exponent);
            // XFS item limit is always set > 0, so it must be taken always.
            // A certain item limit is always the sum over all items of a type to dispense.
            this.denominationInfo.maxNotes = parseInt(denomDataInit.maxnotes);
            this.denominationInfo.maxCoins = parseInt(denomDataInit.maxcoins);
            this.denominationInfo.denominations = this.vmHelper.sortByKey(denomDataInit.denominations, "val", true);
            this.denominationInfo.currentDist = [];
            let item, sftLim, count, len = denomDataInit.denominations.length;
            for(let i = 0; i < len; i++) {
                count = parseInt(this.denominationInfo.denominations[i].count);
                if(count) { // only if the current denom has a proper count, we consider
                    this.denominationInfo.len++;
                    sftLim = parseInt(this.denominationInfo.denominations[i].softLimit);
                    this.denominationInfo.itemValues[i] = parseInt(this.denominationInfo.denominations[i].val);
                    this.denominationInfo.itemTypes[i] = parseInt(this.denominationInfo.denominations[i].type);
                    this.denominationInfo.currentDist[i] = 0;
                    this.denominationInfo.counts[i] = sftLim === 0 || sftLim > count ? count : sftLim; // softlimit is only taken if its < count but greater than zero
                    item = this.createDenominationItemInstance(this.denominationInfo.itemValues[i], 0, denomDataInit.symbol, denomDataInit.currency, this.denominationInfo.itemTypes[i], this.denominationInfo.exponent);
                    this.denominationInfo.items.push(item);
                    // coins available?
                    if(!this.isCoinsAvailable && item.type === 1) {
                        this.isCoinsAvailable = true;
                    }
                }
            }
            this.amount(this.denominationInfo.amount);
            this.amountFormatted = viewModelHelper.convertByExponent(this.denominationInfo.amount, this.denominationInfo.exponent);
            this.chosenAmount(denomDataInit.amount);
            this.billTypes = this.denominationInfo.itemValues;
            this.distribution(this.denominationInfo.items);
        }

        /**
         * Creates the distribution from the given starting parameters.
         * The starting parameters gets initialized by the <code>initItemData</code> function.
         * @async
         */
        async createDistribution() {
            let error;
            let maxItems = 0;
            for(let k = this.denominationInfo.counts.length - 1; k >= 0; k--) {
                maxItems += this.denominationInfo.counts[k];
            }
            await this.distributor.initialize();
            let distributionData = await this.distributor.getDistribution(maxItems, this.denominationInfo);
            if(distributionData) {
                try {
                    this.denominationInfo.distributions = distributionData.distribution.distributions.length > 0 ? distributionData.distribution.distributions : this.denominationInfo.distributions;
                    this.denominationInfo.currentDist = this.denominationInfo.distributions[0];
                    if(_logger.LOG_DATA) { // trace bit set?
                        let i = this.denominationInfo.distributions.length - 1;
                        let debugArray = [];
                        while(this.denominationInfo.distributions[i] !== void 0) {
                            debugArray.push(this.denominationInfo.distributions[i]);
                            debugArray.push(i !== 0 ? "|" : "||"); // || when going into negative index
                            i--;
                        }
                        _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, `. BillSplittingViewModel::addEventListener(message) distributions=${debugArray.join("")}`);
                    }

                    this.updateItemCounts();
                    this.cmdRepos.whenAvailable([CMD_BIGGER, CMD_SMALLER]).then(() => {
                        this.cmdRepos.setActive(CMD_BIGGER, this.denominationInfo.distributions[this.denominationInfo.distIdx + 1] !== void 0);
                        this.cmdRepos.setActive(CMD_SMALLER, this.denominationInfo.distributions[this.denominationInfo.distIdx - 1] !== void 0);
                    });
                } catch(e) {
                    error = `. BillSplittingViewModel::createDistribution exception '${e}'`;
                    _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, error);
                }
            } else {
                error = ". BillSplittingViewModel::createDistribution received no distribution - rejecting promise.";
                _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, error);
            }
            if (error) {
                throw(error);
            }
        }

        /**
         * Asynchronous function that gets transaction data via business property
         * @async
         */
        async importBusinessData() {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> BillSplittingViewModel::importBusinessData()");
            let result = await _dataService.getValues(PROP_MIXTURE_DATA);
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< BillSplittingViewModel::importBusinessData");
            let data = result[PROP_MIXTURE_DATA];
            if (!data) {
                let error = `BillSplittingViewModel::onInitTextAndData data service callback --> No mixture items in ${PROP_MIXTURE_DATA}  available !`;
                _logger.error(error);
                throw error;
            }
            return data;
        }

        /**
         * Initializes the text and data.
         * This method reads the properties PROP_MIXTURE_DATA, calls the initItemData() and runs the denom validator to be prepared for
         * the first distribution representation.
         * @param {Object} args
         * @see {Wincor.UI.Content.BaseViewModel#onInitTextAndData}
         * @lifecycle viewmodel
         */
        onInitTextAndData(args) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> BillSplittingViewModel::onInitTextAndData()");
            window.sessionStorage.removeItem(KEY_SESSION_STORAGE_DENOM);
            if(!this.designMode) {
                args.dataKeys.push(this.importBusinessData()
                    .then(data => {
                        this.denominationInfo.srcData = typeof data !== "object" ? JSON.parse(data) : data;
                        this.initItemData(this.denominationInfo.srcData);
                        return this.createDistribution();
                    })
                    .then(() =>  {
                        this.cmdRepos.whenAvailable([this.STANDARD_BUTTONS.CONFIRM])
                            .then(() => this.cmdRepos.addDelegate({id: this.STANDARD_BUTTONS.CONFIRM, delegate: this.onButtonPressed, context: this}));
                        // correct command is optional
                        this.cmdRepos.whenAvailable([this.STANDARD_BUTTONS.CORRECT])
                            .then(() => {
                                this.cmdRepos.addDelegate({id: this.STANDARD_BUTTONS.CORRECT, delegate: this.onButtonPressed, context: this});
                                this.cmdRepos.setActive(this.STANDARD_BUTTONS.CORRECT, false);
                            });
                    })
                    .catch(e => {
                        _logger.error(`BillSplittingViewModel::onInitTextAndData distribution callback --> ${e}`);
                        _viewService.endView(_viewService.UIRESULT_ERROR_VIEW);
                        throw(e);
                    }));
            } else { // design mode
                args.dataKeys.push(this.designTimeRunner.retrieveJSONData("BillSplittingData")
                    .then(data => {
                        this.denominationInfo.srcData = data;
                        this.initItemData(data);
                        this.createDistribution().then(() => {
                            this.cmdRepos.whenAvailable([this.STANDARD_BUTTONS.CONFIRM]).then(() => this.cmdRepos.addDelegate({id: this.STANDARD_BUTTONS.CONFIRM, delegate: this.onButtonPressed, context: this}));
                            // correct command is optional
                            this.cmdRepos.whenAvailable([this.STANDARD_BUTTONS.CORRECT]).then(() => {
                                this.cmdRepos.addDelegate({id: this.STANDARD_BUTTONS.CORRECT, delegate: this.onButtonPressed, context: this});
                                this.cmdRepos.setActive(this.STANDARD_BUTTONS.CORRECT, false);
                            });
                        }).catch(e => {
                            _logger.error(`BillSplittingViewModel::onInitTextAndData distribution callback --> ${e}`);
                        });
                    }));
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< BillSplittingViewModel::onInitTextAndData");
            return super.onInitTextAndData(args);
        }

        /**
         * Updates the item counts.
         * The function ensures to always first pop elements before to push them
         * in order to keep possible animations be more realistic.
         * @param {boolean=} isInc true if its an increment, false otherwise
         * @private
         */
        updateItemCounts(isInc) {
            let c, cd, j, item, idx = isInc ? 0 : this.denominationInfo.len - 1;
            while(isInc && idx < this.denominationInfo.len || !isInc && idx >= 0) {
                item = this.denominationInfo.items[idx];
                c = item.count();
                cd = this.denominationInfo.currentDist[idx];
                if(c > cd) {
                    for(j = c - cd - 1; j >= 0; j--) {
                        //console.log("pop");
                        item.notes.pop();
                    }
                } else if(c < cd) {
                    for(j = cd - c - 1; j >= 0; j--) {
                        //console.log("push");
                        item.notes.push(j + idx);
                    }
                }
                if(cd !== c) {
                    item.count(cd);
                }
                isInc ? idx++ : idx--;
            }
        }

        /**
         * Increments to the next current distribution if available.
         * @returns {*}
         * @private
         */
        nextDistribution() {
            if(this.denominationInfo.distributions[this.denominationInfo.distIdx + 1]) {
                this.denominationInfo.currentDist = this.denominationInfo.distributions[++this.denominationInfo.distIdx];
                this.updateItemCounts(true);
                return this.denominationInfo.currentDist;
            }
            return -1;
        }

        /**
         * Decrements to the previous current distribution if available.
         * @returns {*}
         * @private
         */
        previousDistribution() {
            if(this.denominationInfo.distributions[this.denominationInfo.distIdx - 1]) {
                this.denominationInfo.currentDist = this.denominationInfo.distributions[--this.denominationInfo.distIdx];
                this.updateItemCounts(false);
                return this.denominationInfo.currentDist;
            }
            return -1;
        }

        /**
         * Builds a result of the current situation.
         * The method also writes the final distribution into the session storage for
         * further processing.
         * @return {string} {amount: string, currency: string, symbol: string, ada: string, exponent: string, denominations: Array}}
         * @private
         */
        buildResult() {
            let result, i, denoms = this.denominationInfo.srcData.denominations.concat([]);
            for(i = 0; i < this.denominationInfo.len; i++) {
                denoms[i].count = this.denominationInfo.currentDist[i];
            }
            result = JSON.stringify(this.denominationInfo.srcData, (key, val) => {
                return Number.isInteger(val) && !["count", "maxnotes", "maxcoins"].includes(key) ? val.toString() : val; // due to compatibility with the business receiver we ensure every number is a string
            });
            // exclude zero counts
            this.denominationInfo.srcData.denominations = denoms.filter(elem => {return elem.count > 0});
            let items = this.denominationInfo.srcData.denominations, lim = 5;
            // build array for each count
            for(i = 0; i < items.length; i++) {
                let c = items[i].count;
                items[i].count = [];
                for(let j = 0; j < c && j < lim; j++) {
                    items[i].count.push(j);
                }
            }
            window.sessionStorage.setItem(KEY_SESSION_STORAGE_DENOM, JSON.stringify(this.denominationInfo.srcData));
            _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, `. BillSplittingViewModel::buildResult values=${result}`);
            return result;
        }

        /**
         * Handles on button pressed actions:<br>
         * <ul>
         *     <li>BIGGER</li>
         *     <li>SMALLER</li>
         *     <li>CORRECT</li>
         *     <li>CONFIRM</li>
         * </ul>
         * @param {String} id the id of the command that was triggered
         * @returns {boolean} true, this function has handled the button pressed.
         * @eventhandler viewmodel
         */
        onButtonPressed(id) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `> BillSplittingViewModel::onButtonPressed(${id})`);
            let dist;
            if(id === CMD_BIGGER) {
                dist = this.nextDistribution();
                if(dist !== -1) {
                    this.cmdRepos.setActive(CMD_SMALLER, true);
                }
                this.cmdRepos.setActive(CMD_BIGGER, this.denominationInfo.distributions[this.denominationInfo.distIdx + 1] !== void 0);
                if(this.cmdRepos.hasCommand(this.STANDARD_BUTTONS.CORRECT)) {
                    this.cmdRepos.setActive(this.STANDARD_BUTTONS.CORRECT, true);
                }
                this.notifyViewUpdated();
            } else if(id === CMD_SMALLER) {
                dist = this.previousDistribution();
                if(dist !== -1) {
                    this.cmdRepos.setActive(CMD_BIGGER, true);
                }
                this.cmdRepos.setActive(CMD_SMALLER, this.denominationInfo.distributions[this.denominationInfo.distIdx - 1] !== void 0);
                if(this.cmdRepos.hasCommand(this.STANDARD_BUTTONS.CORRECT)) {
                    this.cmdRepos.setActive(this.STANDARD_BUTTONS.CORRECT, true);
                }
                this.notifyViewUpdated();
            } else if(id === this.STANDARD_BUTTONS.CORRECT) {
                this.denominationInfo.distIdx = 0;
                this.denominationInfo.currentDist = this.denominationInfo.distributions[0];
                if(this.cmdRepos.hasCommand(this.STANDARD_BUTTONS.CORRECT)) {
                    this.cmdRepos.setActive(this.STANDARD_BUTTONS.CORRECT, false);
                }
                this.updateItemCounts();
                this.cmdRepos.setActive(CMD_BIGGER, this.denominationInfo.distributions[this.denominationInfo.distIdx + 1] !== void 0);
                this.cmdRepos.setActive(CMD_SMALLER, this.denominationInfo.distributions[this.denominationInfo.distIdx - 1] !== void 0);
                this.notifyViewUpdated();
            } else { // CONFIRM
                this.cmdRepos.setActive([CMD_BIGGER, CMD_SMALLER, this.STANDARD_BUTTONS.CONFIRM], false);
                if(this.cmdRepos.hasCommand(this.STANDARD_BUTTONS.CORRECT)) {
                    this.cmdRepos.setActive(this.STANDARD_BUTTONS.CORRECT, false);
                }
                let data = this.buildResult();
                this.module.confirmSelection().then(() => {
                    _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, ". BillSplittingViewModel::onButtonPressed ready for endView");
                    if(!this.designMode) {
                        _dataService.setValues(PROP_MIXTURE_DATA, data, () => _viewService.endView(_viewService.UIRESULT_OK, id));
                    } else { // design mode
                        super.onButtonPressed(id);
                    }
                }).catch(() => _viewService.endView(_viewService.UIRESULT_OK, id));
            }

            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< BillSplittingViewModel::onButtonPressed");
            return true;
        }
    }
});


