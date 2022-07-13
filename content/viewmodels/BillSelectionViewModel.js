/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ BillSelectionViewModel.js 4.3.1-210127-21-34ae33df-1a04bc7d
 */
define(["jquery", "knockout", "extensions", "vm-util/ViewModelHelper", "ui-content", "vm-util/Calculations", "basevm"], function(jQuery, ko, ext, viewModelHelper, content, calculations) {
    "use strict";
    console.log("AMD:BillSelectionViewModel");

    const _logger = Wincor.UI.Service.Provider.LogProvider;
    const _dataService = Wincor.UI.Service.Provider.DataService;
    const _viewService = Wincor.UI.Service.Provider.ViewService;

    const TOUCH = content.viewType === "touch";

    /**
     * Business logic property for the mixture data to display.
     * @const
     * @private
     * @type {string}
     */
    const PROP_MIXTURE_DATA = "PROP_MIXTURE_DATA";
    const PROP_MAX_AMOUNT_ACT = "PROP_MAX_AMOUNT_ACT";

    const CMD_INC = "INC";
    const CMD_DEC = "DEC";
    const CMD_UP = "BTN_SCROLL_UP";
    const CMD_DOWN = "BTN_SCROLL_DOWN";
    const CMD_AUTOFILL = "AUTOFILL";

    const MODE_AMOUNT_DEFAULT = 0;
    const MODE_AMOUNT_ZERO = 1;

    const KEY_SESSION_STORAGE_DENOM = "dispenseDistribution";


    let STACK_LIMIT = 10;
    let DEFAULT_ALGO_EVALUATOR_AUTOCOMPLETE;

    //-------------------------------------

    /**
     * Gets the total amount in smallest unit.
     * Is being calculated during customer interaction.
     * @type {Number}
     */
    // let _totalAmount = 0;

    /**
     * Gets the remaining amount in smallest unit
     * Is being calculated during customer interaction.
     * @type {Number}
     */
    // let _remainAmount = 0;


    let _timerId = -1;

    /**
     * The Item class.
     * @class Wincor.UI.Content.BillSelectionViewModel~DenominationItem
     * @param {Number} value The item value
     * @param {Number} count The count
     * @param {String} symbol The currency symbol for this item
     * @param {String} iso The ISO string value for this currency
     * @param {Number} type The item type
     * @param {Number} exponent
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
            this.notes = ko.observableArray([1]);
            this.symbol = symbol;
            this.currency = iso;
            this.exponent = exponent;
            this.valueAda = viewModelHelper.convertByExponent(value, exponent);
            this.isValid = ko.observable(true);
            this.incState = ko.observable(0);
            this.decState = ko.pureComputed({
                read: () => {
                    let decState = self.setDecState();
                    let count = self.count();
                    if(count > 0 && decState === 1) {
                        return 1;
                    } else if(decState === 5) { // dec state is NONE ?
                        self.setDecState(2); // set back to disabled
                        return 2; // disable even the count may > 0
                    } else {
                        return count > 0 ? 0 : 2;
                    }
                },
                write: state => {
                    if(state === 2) {
                        self.setDecState(5); // set to NONE to force disable state for read, even the count may > 0
                    } else if(state === 0) {
                        self.setDecState(0); // set back to enabled and let read decide the final state
                    }
                }
            });
            // is used as a trigger to disable command even its count is > 0 and for code-behind module onDecPress()
            // decrement states: 0: enabled, 1: pressed, 2: disabled, 5: none
            this.setDecState = ko.observable(2);
        }
    }

    /**
     * The BillSelectionViewModel is meant for a free selection of denominations for notes.
     * <p>
     * Each possible note (depending on cassette counter and amount) can be in- or decreased in order to pass the given amount.
     * In the case the given amount is zero the viewmodel reads the 'PROP_MAX_AMOUNT_ACT' business property and the customer is
     * free to select denominations until this limit or even below it.
     * <br>
     * Each denomination is represented by the DenominationItem class which also contains properties the view can be bound to in order to display
     * note stacks.
     * </p>
     * <p>
     * The heart of this functionality is the runDenomValidator function which calculates the allowed distributions depending on what the customer has selected.
     * The result is always set in the {@link Wincor.UI.Content.BillSelectionViewModel#distribution} member which is usually bound to a view.
     *
     * </p>
     * Deriving from {@link Wincor.UI.Content.BaseViewModel} class.
     * @class
     * @since 2.0/10
     */
    Wincor.UI.Content.BillSelectionViewModel = class BillSelectionViewModel extends Wincor.UI.Content.BaseViewModel {

        /**
         *
         */
        DEFAULT_SETTINGS = {
            maxItems: 0, // soft limit for items to use is the limit to each item count
            maxNotes: 0, // the physical dispense limit over all note denominations
            maxCoins: 0, // the physical dispense limit over all coin denominations
            types: null, // the types array of the items: Either note or coin or both
            amount: null, // the amount (least unit, usually cent)
            items: null, // the item array
            counts: null, // the count array
            maxTries: 5000, // max tries for the algo to find solutions
            isAbortAfterFirstHit: true, // abort algo after first solution is found
            algoMode: calculations.ALGO_MODE.FREE, // mode types: SPLIT_DISTRIBUTIONS, RAW_DISTRIBUTIONS, FREE
            algoEvaluator: calculations.ALGO_EVALUATORS.BIG_ITEMS // the algo evaluator type:
                                                                  // BIG_ITEMS, BALANCED_ITEMS, BALANCED_CASSETTES, MANY_CASSETTES, MANY_CASSETTES_66, SIXTY_SIX_PERCENT, DEFAULT
        };

        /**
         * Current denomination / distribution values
         */
        denominationInfo = null;

        module = null;

        /**
         * The overall amount as the least value unit (e.g. cent).
         * @type {function | ko.observable}
         * @bindable
         */
        totalAmount = null;

        /**
         * The remaining amount while the customer selects bills.
         * @type {function | ko.observable}
         * @bindable
         */
        remainingAmount = null;

        /**
         * The chosen amount which customer usually entered during amount entry or chosen from the amount selection list.
         * Please note: In case of "amount zero" (no chosen or entered amount, the customer selects bills until max amount) this amount is zero.
         * @type {function | ko.observable}
         * @bindable
         */
        chosenAmount = null;

        /**
         * The distribution over all denominations available.
         * Each element in the array represents an object with Item data of a certain distribution.
         * An Item looks as follows:<br>
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
         * @type {function | ko.observable}
         * @bindable
         */
        distribution = null;

        /**
         * The current denomination number.
         * @type {function | ko.observable}
         * @bindable
         */
        currentDenom = null;

        /**
         * The items array.
         * Each item represents a different denomination.
         * @see {@link Item}
         * @type {Array<DenominationItem>}
         */
        items = null;

        /**
         * The current mode is either MODE_AMOUNT_DEFAULT (0) or MODE_AMOUNT_ZERO (1).
         * @default MODE_AMOUNT_DEFAULT (0)
         * @type {Number}
         */
        mode = MODE_AMOUNT_DEFAULT;

        /**
         * Checks whether at least one coin type is available in denominations.
         * @type {boolean}
         * @bindable
         */
        isCoinsAvailable = false;

        /**
         * Initializes this view model.
         * @param {*} codeBehindModule the bill selection code-behind module, which should contain at least the <code>confirmSelection</code> function.
         * @param {number} stackLimit the visible limit for each denomination
         * @param {number=} [defaultAlgoAutoComplete=ALGO_EVALUATORS.BALANCED_ITEMS] the default algo for the auto complete function. See {@link module:DenomValidator}
         * @lifecycle viewmodel
         */
        constructor(codeBehindModule, stackLimit, defaultAlgoAutoComplete = calculations.ALGO_EVALUATORS.BALANCED_ITEMS) {
            super();
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> BillSelectionViewModel");
            this.module = codeBehindModule;
            STACK_LIMIT = stackLimit;
            DEFAULT_ALGO_EVALUATOR_AUTOCOMPLETE = defaultAlgoAutoComplete;
            this.totalAmount = ko.observable(0);
            this.totalAmount.extend({notify: "always"}); // because on refresh view we want a refresh of this observable bind as well, even the initial value is zero
            this.remainingAmount = ko.observable(0);
            this.chosenAmount = ko.observable(0);
            this.currentDenom = ko.observable(0);
            this.distribution = ko.observableArray();
            this.items = [];
            this.denominationInfo =  {
                denominations: [],
                srcData: null,
                itemValues: [],
                itemTypes: [],
                maxNotes: 0,
                maxCoins: 0,
                maxItems: 0,
                maxAmount: -1,
                totalAmount: -1,
                remainAmount: -1,
                counts: [],
                len: 0,
                exponent: -2,
                incDecCmdCount: 0,
                incDecAutoMode: false
            };
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< BillSelectionViewModel");
        }

        /**
         * Handler function to remove/clear all members.
         * Overridden to clear data list items, flags and counter.
         * @lifecycle viewmodel
         */
        onDeactivated() {
             _logger.LOG_INFO && _logger.log(_logger.LOG_INFO, ". BillSelectionViewModel::onDeactivated()");
            super.onDeactivated();
            this.denominationInfo.maxAmount = -1;
            this.denominationInfo.denominations.length = 0;
            this.denominationInfo.srcData = null;
            this.reset();
            this.totalAmount(0);
            this.remainingAmount(0);
            this.chosenAmount(0);
            this.distribution([]);
            this.isCoinsAvailable = false;
            this.currentDenom(0);
        }

        /**
         * Cleaning up members which can't be cleared in onDeactivate.
         * @lifecycle viewmodel
         */
        clean() {
            _logger.log(_logger.LOG_INOUT, "> BillSelectionViewModel::clean()");
            this.module = null;
            super.clean();
            _logger.log(_logger.LOG_INOUT, "< BillSelectionViewModel::clean");
        }
        
        /**
         * This method usually initializes data before text and/or business data are retrieved, such as e.g. viewkey configuration.
         * Overrides {@link Wincor.UI.Content.BaseViewModel#observe}
         * @param {String} observableAreaId the area to observe via knockout
         * @lifecycle viewmodel
         */
        observe(observableAreaId) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `> BillSelectionViewModel::observe(observableAreaId=${observableAreaId})`);
            super.observe(observableAreaId);
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< BillSelectionViewModel::observe");
        }

        /**
         * Creates and returns a new BillSelection Item instance object
         * @param {Object} args
         * @return {Wincor.UI.Content.BillSelectionViewModel~DenominationItem}
         */
        createDenominationItemInstance(...args) {
            return new DenominationItem(...args);
        }

        /**
         * Initializes the starting parameter.
         * @param {Object} denomDataInit
         */
        initItemData(denomDataInit) {
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `. BillSelectionViewModel::initItemData data=${JSON.stringify(denomDataInit)}`);
            this.denominationInfo.remainAmount = parseInt(denomDataInit.amount);
            if(this.denominationInfo.remainAmount === 0) {
                this.mode = MODE_AMOUNT_ZERO;
                this.denominationInfo.remainAmount = this.denominationInfo.maxAmount;
            }
            this.denominationInfo.totalAmount = 0;
            this.denominationInfo.exponent = parseInt(denomDataInit.exponent);
            // XFS item limit is always set > 0, so it must be taken always.
            // A certain item limit is always the sum over all items of a type to dispense.
            this.denominationInfo.maxNotes = parseInt(denomDataInit.maxnotes);
            this.denominationInfo.maxCoins = parseInt(denomDataInit.maxcoins);
            this.denominationInfo.denominations = this.vmHelper.sortByKey(denomDataInit.denominations, "val", true);
            let len = denomDataInit.denominations.length;
            for(let i = 0; i < len; i++) {
                let denom = this.denominationInfo.denominations[i];
                let sftLim = parseInt(denom.softLimit);
                let count = parseInt(denom.count); // only if the current denom has a proper count, we consider
                let val = parseInt(denom.val);
                if(count > 0 && (this.mode === MODE_AMOUNT_DEFAULT && val <= this.denominationInfo.remainAmount || this.mode === MODE_AMOUNT_ZERO && val <= this.denominationInfo.maxAmount)) {
                    this.denominationInfo.itemValues[this.denominationInfo.len] = val;
                    this.denominationInfo.itemTypes[this.denominationInfo.len] = parseInt(denom.type);
                    this.denominationInfo.counts[this.denominationInfo.len] = sftLim === 0 || sftLim > count ? count : sftLim; // softlimit is only taken if its < count but greater than zero
                    let item = this.createDenominationItemInstance(this.denominationInfo.itemValues[this.denominationInfo.len], 0, denomDataInit.symbol,
                        denomDataInit.currency, this.denominationInfo.itemTypes[this.denominationInfo.len], this.denominationInfo.exponent);
                    this.items[this.denominationInfo.len] = item;
                    this.denominationInfo.maxItems += this.denominationInfo.counts[this.denominationInfo.len];
                    // coins available?
                    if(!this.isCoinsAvailable && item.type === 1) {
                        this.isCoinsAvailable = true;
                    }
                    this.denominationInfo.len++;
                }
            }

            this.DEFAULT_SETTINGS.maxItems = this.denominationInfo.maxItems;
            this.DEFAULT_SETTINGS.maxNotes = this.denominationInfo.maxNotes;
            this.DEFAULT_SETTINGS.maxCoins = this.denominationInfo.maxCoins;
            this.DEFAULT_SETTINGS.types = this.denominationInfo.itemTypes;

            this.remainingAmount(this.mode === MODE_AMOUNT_DEFAULT ? this.denominationInfo.remainAmount : this.denominationInfo.maxAmount);
            this.totalAmount(this.denominationInfo.totalAmount);
            this.chosenAmount(denomDataInit.amount);
            this.billTypes = this.denominationInfo.itemValues;
            this.distribution(this.items);
        }

        /**
         * This function runs the denomination validation if any of the items has been moved.
         * It calls the denomination algorithm and processes the result.
         * Furthermore we support a denomination prediction by simulate next possible user interactions.
         * @param {number} variant 1 or 2 (1=preselect denomination calculation (by prediction), 2=direct denomination calculation), 3=auto complete, 4=amount zero
         */
        runDenomValidator(variant) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `> BillSelectionViewModel::runDenomValidator variant=${variant}`);
            let algoCtx, solutions, simResult = [], counts = [];
            let i, k; // indexes
            let isSolutionFound = true;
            const settings = this.DEFAULT_SETTINGS;

            settings.maxNotes = this.denominationInfo.maxNotes;
            settings.maxCoins = this.denominationInfo.maxCoins;
            settings.maxItems = this.denominationInfo.maxNotes; // ???

            //------------------------------------------------------------------------------------------------------
            // NOTE:
            //------------------------------------------------------------------------------------------------------

            switch(variant) {
                case 1:
                    settings.isAbortAfterFirstHit = true;
                    // preselection by prediction...
                    // Simulation: Try to decrease 1 item for each possible denomination and look if that denomination
                    // would have been possible.
                    //--------------------------------------------------------------------------------------------------
                    let remainingSim = this.denominationInfo.totalAmount, currValue, valueCounts = [];
                    // outer loop: 1 time for each denomination
                    for(k = 0; k < this.denominationInfo.len; k++) {
                        currValue = this.denominationInfo.itemValues[k];
                        // inner loop: 1 time for each denomination of -currValue
                        for(i = 0; i < this.denominationInfo.len; i++) {
                            // srcLen = rawItemSrcLens[i]; //rawItems[i - 1].srcList().length;
                            // set up the counts array and a simulated remaining amount
                            if(currValue === this.denominationInfo.itemValues[i]) {
                                // simulate remaining amount and simulate decreasing one more item or zero
                                // If the counts[i] is 0 this means there has been taken 1 more item.
                                // If the count is -1 means that this denom must be disabled at next, because the _counts[i] is 0.
                                counts[i] = valueCounts[currValue] = this.denominationInfo.counts[i] - 1 >= 0 ? this.denominationInfo.counts[i] - 1 : -1;
                                if(counts[i] >= 0) {
                                    this.DEFAULT_SETTINGS.maxItems--;
                                }
                                remainingSim = this.denominationInfo.remainAmount - currValue;
                            } else {
                                counts[i] = this.denominationInfo.counts[i];
                            }
                        }
                        if(remainingSim > 0) {
                            // trigger denomination
                            settings.amount = remainingSim;
                            settings.counts = counts;
                            settings.items = this.denominationInfo.itemValues;
                            settings.algoEvaluator = calculations.ALGO_EVALUATORS.BIG_ITEMS;
                            algoCtx = calculations.doAlgo(settings);
                            //solutions = algoCtx.solutions;
                            // set up a simulation result array as a map: "value:[0|1]"
                            if(!algoCtx.isSolutionFound && currValue !== this.denominationInfo.remainAmount) { // second operand is superflous
                                simResult[currValue] = 0; // this denomination is not possible at next
                                this.DEFAULT_SETTINGS.maxItems++;
                            } else {
                                simResult[currValue] = valueCounts[currValue] >= 0 ? 1 : 0; // check whether this denomination is possible already
                            }
                        } else {
                            simResult[currValue] = remainingSim === 0 && valueCounts[currValue] >= 0 ? 1 : 0;
                        }
                    }
                    // use the simulation result to check which denomination is impossible at next
                    for(i = 0; i < this.denominationInfo.len; i++) {
                        currValue = this.items[i].value;
                        // as we know, the simulation result array may have smaller length as -rawItems
                        if(simResult[currValue] !== void 0 && simResult[currValue] === 0) {
                            this.items[i].incState(2);
                        } else if(this.items[i].incState() !== 1) {
                            this.items[i].incState(0);
                        }
                    }
                    break;

                case 2: // solution is calculated and the counts are processed
                case 3: // auto complete
                    settings.isAbortAfterFirstHit = false;
                    settings.amount = this.denominationInfo.remainAmount;
                    settings.counts = this.denominationInfo.counts;
                    settings.items = this.denominationInfo.itemValues;
                    settings.maxTries = 10000;
                    settings.algoEvaluator = DEFAULT_ALGO_EVALUATOR_AUTOCOMPLETE;
                    algoCtx = calculations.doAlgo(settings);
                    solutions = algoCtx.distributions[0];
                    if(algoCtx.isSolutionFound) {
                        let solCount;
                        for(i = 0; i < this.denominationInfo.len; i++) {
                            solCount = solutions[i];
                            this.items[i].incState(2);
                            this.inc(i, solCount);
                        }
                    } else {
                        isSolutionFound = false;
                    }
                    break;

                case 4: // amount zero case, denomination possible until max amount reached
                    for(i = 0; i < this.denominationInfo.len; i++) {
                        // item limit check
                        this.items[i].incState(this.denominationInfo.itemValues[i] > this.denominationInfo.remainAmount || this.denominationInfo.maxNotes === 0 ? 2 : 0);
                    }
                    settings.isAbortAfterFirstHit = true;
                    settings.amount = this.denominationInfo.remainAmount;
                    settings.counts = this.denominationInfo.counts;
                    settings.items = this.denominationInfo.itemValues;
                    settings.maxTries = 5000;
                    settings.algoEvaluator = calculations.ALGO_EVALUATORS.BIG_ITEMS;
                    algoCtx = calculations.doAlgo(settings);
                    isSolutionFound = algoCtx.isSolutionFound;
                    break;

                default:
                    _logger.error("BillSelectionViewModel::runDenomValidator variant unknown!");
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `< BillSelectionViewModel::runDenomValidator isSolutionFound=${isSolutionFound}`);
            return isSolutionFound;
        }

        /**
         * Increments the count.
         * @param {number} index the index of the denomination
         * @param {number} count the count for the denomination which is going to be added to the current count
         */
        inc(index, count) {
            if(index !== void 0 && this.denominationInfo.remainAmount && (this.denominationInfo.counts[index] - count) >= 0) {
                let item = this.items[index];
                let c = item.count();
                let notes = item.notes();
                item.count(count + c); // update count observable
                this.denominationInfo.maxNotes -= count; // remaining max notes
                this.denominationInfo.counts[index] -= count; // update initial counts
                if(c || count > 1) {
                    for(let i = c === 0 && count > 1 ? count - 1 : count; i > 0; i--) {
                        notes.push(1);
                    }
                    item.notes.valueHasMutated();
                }
                this.denominationInfo.totalAmount += count * item.value;
                this.denominationInfo.remainAmount -= count * item.value;
            }
        }

        /**
         * Decrements the count.
         * @param {number} index the index of the denomination
         * @param {number} count the count for the denomination which is going to be subtracted from the current count
         */
        dec(index, count) {
            if(index !== void 0 && this.denominationInfo.totalAmount > 0) {
                let item = this.items[index];
                let c = item.count();
                let notes = item.notes();
                if((c - count) >= 0) {
                    item.count(c - count); // update count observable
                    this.denominationInfo.maxNotes += count; // remaining max notes
                    this.denominationInfo.counts[index] += count; // update initial counts
                    if(c > 1) {
                        // the physical notes counter shouldn't decrease to zero, otherwise that denomination disappears
                        for(let i = count; i > 0 && notes.length > 1; i--) { // ensure notes gets not less than 1
                            notes.pop();
                            // The ko.foreach does not invoke "beforeRemove" to render anything which is not part of the DOM, so we trigger
                            // the removeNote manually when the corresponding ko.observableArray 'item.notes' is popped by 1.
                            if(c > STACK_LIMIT) {
                                this.module.removeNote(null, index);
                                c--;
                            }
                        }
                        item.notes.valueHasMutated();
                    }
                    this.denominationInfo.totalAmount -= count * item.value;
                    this.denominationInfo.remainAmount += count * item.value;
                }
            }
        }

        /**
         * Builds a result of the current situation.
         * The method also writes the final distribution into the session storage for
         * further processing.
         * @return {string} {amount: string, currency: string, symbol: string, ada: string, exponent: string, denominations: Array}}
         */
        buildResult() {
            let srcData = this.denominationInfo.srcData;
            // Note: the -items.length may be smaller than the -srcData.denominations length, because of denominations
            // which are impossible (invalid due to current amount)
            srcData.denominations.forEach(denom => {
                let item = this.items.find(item => item.value === parseInt(denom.val));
                denom.count = item ? item.count() : 0;
            });
            srcData.amount = this.denominationInfo.totalAmount; // if we have amount zero case, the total amount must be set, else the total amount must be the original amount
            let result = JSON.stringify(srcData, (key, val) => {
                return Number.isInteger(val) && !["count", "maxnotes", "maxcoins"].includes(key) ? val.toString() : val; // due to compatibility with the business receiver we ensure every number is a string
            });

            // exclude zero counts
            let denoms = srcData.denominations.concat([]);
            srcData.denominations = denoms.filter(elem => {return elem.count > 0});
            let lim = 5;
            // build array for each count
            srcData.denominations.forEach(denom => {
                let c = denom.count;
                denom.count = [];
                for(let j = 0; j < c && j < lim; j++) {
                    denom.count.push(j);
                }
            });
            sessionStorage.setItem(KEY_SESSION_STORAGE_DENOM, JSON.stringify(srcData));
            _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, `. BillSelectionViewModel::buildResult values=${result}`);
            return result;
        }

        /**
         *
         * @param {Number} index
         * @param {String} cmd
         */
        softKeyPressedTimer(index, cmd) {
            const MAX = 2;
            this.denominationInfo.incDecCmdCount++;
            if(_timerId !== -1) {
                clearTimeout(_timerId);
            }
            if(this.denominationInfo.incDecAutoMode) {
                this.denominationInfo.incDecAutoMode = false;
                if(cmd === CMD_INC) {
                    this.module.onIncPress(index, { type: null });
                } else {
                    this.module.onDecPress(index, { type: null });
                }
            }
            _timerId = setTimeout(() => {
                _timerId = -1;
                this.denominationInfo.incDecCmdCount = 0;
            }, 250);
            if(this.denominationInfo.incDecCmdCount === MAX) {
                this.denominationInfo.incDecAutoMode = true;
                if(cmd === CMD_INC) {
                    this.module.onIncPress(index, { type: "press" });
                } else {
                    this.module.onDecPress(index, { type: "press" });
                }
            }
        }

        /**
         * Asynchronous function that gets transaction data via business property
         * @async
         */
        async importBusinessData() {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> BillSelectionViewModel::importBusinessData()");
            const result = await _dataService.getValues([PROP_MIXTURE_DATA, PROP_MAX_AMOUNT_ACT]);
            const data = result[PROP_MIXTURE_DATA];
            this.denominationInfo.srcData = typeof data !== "object" ? JSON.parse(data) : data;
            this.denominationInfo.maxAmount = parseInt(result[PROP_MAX_AMOUNT_ACT]);
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< BillSelectionViewModel::importBusinessData");
            return this.denominationInfo.srcData;
        }

        /**
         * Initializes the text and data.
         * This method reads the properties PROP_MIXTURE_DATA and PROP_MAX_AMOUNT_ACT calls the initItemData() and runs the denom validator to be prepared for
         * the first distribution representation.
         * @param {Object} args will contain the promise which getting resolved when everything is prepared
         * @see {Wincor.UI.Content.BaseViewModel#onInitTextAndData}
         * @lifecycle viewmodel
         */
        onInitTextAndData(args) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> BillSelectionViewModel::onInitTextAndData()");
            sessionStorage.removeItem(KEY_SESSION_STORAGE_DENOM);
            if(!this.designMode) {
                args.dataKeys.push(this.importBusinessData()
                    .then(data => {
                        this.initItemData(data);
                        if(this.denominationInfo.len) {
                            if(this.mode === MODE_AMOUNT_DEFAULT) {
                                this.runDenomValidator(1);
                            }
                            this.cmdRepos.whenAvailable([this.STANDARD_BUTTONS.CONFIRM]).then(() => this.cmdRepos.addDelegate({
                                id: this.STANDARD_BUTTONS.CONFIRM,
                                delegate: this.onButtonPressed,
                                context: this
                            }));
                            // correct command is optional
                            this.cmdRepos.whenAvailable([this.STANDARD_BUTTONS.CORRECT]).then(() => {
                                this.cmdRepos.addDelegate({
                                    id: this.STANDARD_BUTTONS.CORRECT,
                                    delegate: this.onButtonPressed,
                                    context: this
                                });
                                this.cmdRepos.setActive(this.STANDARD_BUTTONS.CORRECT, false);
                            });
                            this.updateAssets();
                        } else {
                            _logger.error("BillSelectionViewModel::onInitTextAndData data service callback --> No mixture items available after initItemData().");
                            throw("No mixture items available after initItemData()");
                        }
                    }));
            } else { // design mode
                args.dataKeys.push(this.designTimeRunner.retrieveJSONData("BillSelectionData")
                    .then(data => {
                        this.denominationInfo.srcData = data;
                        this.denominationInfo.maxAmount = data.maxamount; // for the amount === zero case we need the max amount
                        this.initItemData(data);
                        if(this.mode === MODE_AMOUNT_DEFAULT) {
                            this.runDenomValidator(1);
                        }
                        this.updateAssets();
                    }));
            }

            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< BillSelectionViewModel::onInitTextAndData");
            return super.onInitTextAndData(args);
        }

        /**
         * Updates several command states depending on the current distribution situation.
         * @param {boolean=} isAutofillAllowed false, 'AUTOFILL' command is not allowed, true otherwise.
         */
        updateAssets(isAutofillAllowed) {
            if(this.mode === MODE_AMOUNT_DEFAULT) {
                this.remainingAmount(this.denominationInfo.remainAmount);
            }
            this.totalAmount(this.denominationInfo.totalAmount);

            this.cmdRepos.whenAvailable(this.STANDARD_BUTTONS.CONFIRM).then(() => {
                if(this.cmdRepos.hasCommand(this.STANDARD_BUTTONS.CONFIRM)) {
                    if(this.mode === MODE_AMOUNT_DEFAULT) {
                        this.cmdRepos.setActive(this.STANDARD_BUTTONS.CONFIRM, this.denominationInfo.remainAmount === 0);
                    } else {
                        this.cmdRepos.setActive(this.STANDARD_BUTTONS.CONFIRM, this.denominationInfo.totalAmount > 0);
                    }
                }
            });

            if(this.cmdRepos.hasCommand(this.STANDARD_BUTTONS.CORRECT)) {
                this.cmdRepos.setActive(this.STANDARD_BUTTONS.CORRECT, this.denominationInfo.totalAmount > 0);
            }
            if(this.cmdRepos.hasCommand(CMD_AUTOFILL)) {
                let isAllowed = false;
                for(let i = this.denominationInfo.len - 1; i >= 0; i--) {
                    if(this.denominationInfo.itemValues[i] <= this.denominationInfo.remainAmount && this.items[i].incState() === 0) {
                        isAllowed = true;
                        break;
                    }
                }
                this.cmdRepos.setActive(CMD_AUTOFILL, this.denominationInfo.remainAmount > 0 && isAllowed && isAutofillAllowed);
            }

            this.cmdRepos.whenAvailable(CMD_DEC).then(() => {
                this.cmdRepos.setActive(CMD_DEC, this.items[this.currentDenom()].decState() === 0);
            });

            this.cmdRepos.whenAvailable(CMD_INC).then(() => {
                this.cmdRepos.setActive(CMD_INC, this.items[this.currentDenom()].incState() === 0);
            });
        }

        /**
         * Resets all members which must be reset when customer chose 'RESET' command.
         */
        reset() {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, ". BillSelectionViewModel::reset()");
            this.denominationInfo.len = 0;
            this.denominationInfo.counts.length = 0;
            this.items.length = 0;
            this.denominationInfo.itemValues.length = 0;
            this.denominationInfo.itemTypes.length = 0;
            this.denominationInfo.maxNotes = 0;
            this.denominationInfo.maxCoins = 0;
            this.denominationInfo.incDecCmdCount = 0;
            this.denominationInfo.incDecAutoMode = false;
            _timerId = -1;
            this.mode = MODE_AMOUNT_DEFAULT;
        }

        /**
         * Handles on button pressed actions:<br>
         * <ul>
         *     <li>INC</li>
         *     <li>DEC</li>
         *     <li>BTN_SCROLL_UP</li>
         *     <li>BTN_SCROLL_DOWN</li>
         *     <li>AUTOFILL</li>
         *     <li>CORRECT</li>
         *     <li>CONFIRM</li>
         * </ul>
         * @param {String} id the id of the command that was triggered
         * @param {Object=} evt gesture event data
         * @param {Object=} isModule given when the invocation source is the code-behind module instead of a customer action
         * @returns {boolean} true, this function has handled the button pressed.
         * @eventhandler
         */
        onButtonPressed(id, evt, isModule) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `> BillSelectionViewModel::onButtonPressed(${id})`);
            let cmd = id;
            let index = this.currentDenom();
            if((id.length > CMD_DEC.length || id.length > CMD_INC.length) && (id.indexOf(CMD_DEC) !== -1 || id.indexOf(CMD_INC) !== -1)) {
                // extract command and index
                cmd = id.substr(0, id.indexOf("_"));
                index = parseInt(id.substr(cmd.length + 1));
            }
            let incState = this.items[index].incState();
            if(cmd === CMD_INC && incState === 0 || incState === 1) { // INCREMENT
                if(!TOUCH && !isModule) {
                    this.softKeyPressedTimer(index, cmd);
                }
                this.inc(index, 1);
                let isAutofillAllowed = true;
                if(this.mode === MODE_AMOUNT_DEFAULT) {
                    this.runDenomValidator(1);
                } else {
                    isAutofillAllowed = this.runDenomValidator(4);
                }
                this.updateAssets(isAutofillAllowed);
                this.notifyViewUpdated();
            } else if(cmd === CMD_DEC) { // DECREMENT
                if(!TOUCH && !isModule) {
                    this.softKeyPressedTimer(index, cmd);
                }
                this.dec(index, 1);
                let isAutofillAllowed = true;
                if(this.mode === MODE_AMOUNT_DEFAULT) {
                    this.runDenomValidator(1);
                } else {
                    isAutofillAllowed = this.runDenomValidator(4);
                }
                this.updateAssets(isAutofillAllowed);
                this.notifyViewUpdated();
            } else if(cmd === CMD_AUTOFILL) { // AUTO-FILL
                this.runDenomValidator(3);
                this.updateAssets();
                this.notifyViewUpdated();
            } else if(cmd === this.STANDARD_BUTTONS.CORRECT) { // CORRECT
                this.reset();
                this.initItemData(this.denominationInfo.srcData);
                if(this.mode === MODE_AMOUNT_DEFAULT) {
                    this.runDenomValidator(1);
                }
                this.updateAssets();
                this.notifyViewUpdated();
            } else if(cmd === this.STANDARD_BUTTONS.CONFIRM) { // CONFIRM
                this.vmContainer.suspend();
                let data = this.buildResult();
                this.module.confirmSelection().then(() => {
                    _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, ". BillSelectionViewModel::onButtonPressed ready for endView");
                    if(!this.designMode) {
                        _dataService.setValues(PROP_MIXTURE_DATA, data, () => _viewService.endView(_viewService.UIRESULT_OK, id));
                    } else { // design mode
                        super.onButtonPressed(id);
                    }
                }).catch(() => _viewService.endView(_viewService.UIRESULT_OK, id));
            } else if(cmd === CMD_UP) { // UP
                let current = this.currentDenom();
                if(current === 0) {
                    current = this.denominationInfo.len - 1;
                } else {
                    current--;
                }
                this.currentDenom(current);
                this.updateAssets();
            } else if(cmd === CMD_DOWN) { // DOWN
                let current = this.currentDenom();
                if(current < (this.denominationInfo.len - 1)) {
                    current++;
                } else {
                    current = 0;
                }
                this.currentDenom(current);
                this.updateAssets();
            } else if(jQuery.isNumeric(id)) {
                // TODO decide whether input really necessary
            }

            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< BillSelectionViewModel::onButtonPressed");
            return true;
        }
    }
});


