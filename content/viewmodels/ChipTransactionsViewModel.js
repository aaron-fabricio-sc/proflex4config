/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ ChipTransactionsViewModel.js 4.3.1-210127-21-34ae33df-1a04bc7d

*/
define(["knockout", "vm/ListViewModel"], function(ko) {
    "use strict";

    const _logger = Wincor.UI.Service.Provider.LogProvider;
    const _dataService = Wincor.UI.Service.Provider.DataService;

    /**
     * Property key for the DISPLAY_VARIABLE value.
     * @const
     * @type {string}
     */
    const PROP_DISPLAY_KEY_DEFAULT = "PROP_DISPLAY_CHIP_CHARGE";

    /**
     * Standard table
     * @type {number}
     * @CONST
     */
    const STD_STEP_LEN = 6;

    /**
     * @class
     * @param transDate
     * @param transTime
     * @param transSign
     * @param transAmount
     * @param transNewBalance
     * @param transState
     * @private
     */
    class Transaction {
        constructor(transDate, transTime, transSign, transAmount, transNewBalance, transState) {
            /**
             * The transaction date.
             * @type {Date}
             * @public
             */
            this.transDate = transDate;
            
            /**
             * The transaction time.
             * @type {Time}
             * @public
             */
            this.transTime = transTime;
            
            /**
             * The sign of transaction amount.
             * @type {String}
             * @public
             */
            this.transSign = transSign;
            
            /**
             * The amount of the transaction.
             * @type {Number}
             * @public
             */
            this.transAmount = transAmount;
            
            /**
             * The new balance after the transaction.
             * @type {Number}
             * @public
             */
            this.transNewBalance = transNewBalance;
            
            /**
             * The transaction state.
             * @type {String}
             * @public
             */
            this.transState = transState;
        }
    }

    /**
     * View model data to store the value of the chip transactions property.
     */
    const ChipData = function() {
        this.transactions = [];
    };

    /**
     * Derived from {@link Wincor.UI.Content.ListViewModel} <BR>
     * This viewmodel handles handles the chiptransaction view. <BR>
     * It prepares the lists for the display of the charging / discharging transactions or the pay transactions <BR>
     * dependent on the property which is configured in the view config.
     * @class
     */
    Wincor.UI.Content.ChipTransactionsViewModel = class ChipTransactionsViewModel extends Wincor.UI.Content.ListViewModel {

        /**
         * View model data to store the table of the chip transactions data.
         */
        chipTransactionsValues = null;

        /**
         * This observable stores the name of the property that is to be displayed.
         * @type {function | ko.observable}
         * @example CCTAFW_PROP_CHIP_DISP_CHARGE_F or CCTAFW_PROP_CHIP_DISP_PAY_F
         * @bindable
         */
        propDispKey = ko.observable("");

        /**
         * Creates and returns a new Transaction instance object
         * @param args
         * @returns {Transaction}
         */
        createTransactionInstance(...args) {
            return new Transaction(...args);
        }

        /**
         * Creates and returns a new ChipData instance object
         * @returns {ChipData}
         */
        createChipDataInstance() {
            return new ChipData();
        }

        /**
         * Initializes the item list for the chiptransaction view that is to be presented.
         * @param {object} chipTransData the chip transaction data
         * @private
         */
        initItemData(chipTransData) {
            _logger.log(_logger.LOG_ANALYSE, `> ChipTransactionsViewModel::initItemData chipTransData=${JSON.stringify(chipTransData)}`);

            let dataTransactions = chipTransData.transactions;
            let dataTransactionsLength = dataTransactions.length;
            this.setListLen(dataTransactionsLength);
            let currVisEntries = this.initCurrentVisibleLimits();
            let sourceData = this.createChipDataInstance();
            let itemsRaw = [];
            let txn;

            for(let i = 0; i < dataTransactionsLength; i++) {
                txn = this.createTransactionInstance(
                    dataTransactions[i].transDate,
                    dataTransactions[i].transTime,
                    dataTransactions[i].transSign,
                    dataTransactions[i].transAmount,
                    dataTransactions[i].transNewBalance,
                    dataTransactions[i].transState
                );
                sourceData.transactions.push(txn);
                if(i < currVisEntries) {
                    itemsRaw.push(txn);
                }
            }

            this.setListSource(sourceData.transactions);
            this.dataList.items(itemsRaw);
            this.initScrollbar();

            _logger.log(_logger.LOG_INOUT, "< ChipTransactionsViewModel::initItemData");
        }

        /**
         * Initializes the DOM-associated objects and introduces the observable area id to the binding processor. <br>
         * {@link BaseViewModel#observe} is invoked in order to apply all bindings of the observable area to knockoutjs. <br>
         * Overrides {@link Wincor.UI.Content.ListViewModel#observe}
         * @param {String} observableAreaId The area id to observe via knockout
         * @param {Object=} visibleLimitsObject The visible limits object for the view. <br> Usually necessary for a softkey based view.<br>
         *                                      A typical visible limits object looks like: { visibleLimits: { max: 8 }}
         * @lifecycle viewmodel
         */
        observe(observableAreaId, visibleLimitsObject) {
            try {
                _logger.log(_logger.LOG_ANALYSE, `> ChipTransactionsViewModel::observe(${observableAreaId})`);

                super.observe(observableAreaId, visibleLimitsObject);

                if(this.designMode) { // design mode
                    this.cmdRepos.whenAvailable([this.STANDARD_BUTTONS.CONFIRM]).then(() => this.cmdRepos.setActive([this.STANDARD_BUTTONS.CONFIRM]));
                    this.cmdRepos.whenAvailable(["PRINT"]).then(() => this.cmdRepos.setActive(["PRINT"]));
                }

                _logger.log(_logger.LOG_INOUT, "< ChipTransactionsViewModel::observe");
            } catch (e) {
                _logger.error(`Problem in ChipTransactionsViewModel occurred: ${e.message}`);
            }
        }

        /**
         * Asynchronous function that gets transaction data via business property, storing it into chipTransactionsValues
         * @async
         */
        async importBusinessData() {
            _logger.log(_logger.LOG_INOUT, "> ChipTransactionsViewModel::importBusinessData()");
            let PROP_DISPLAY_VARIABLE = this.propDispKey() + "[A,0," + STD_STEP_LEN + "]";
            let result = await _dataService.getValues([PROP_DISPLAY_VARIABLE]);
            let isError = false;
            let value = result[PROP_DISPLAY_VARIABLE];
            if (value !== undefined) {
                try {
                    this.chipTransactionsValues = {
                        transactions: []
                    };
                    let countTxn = (value.length / STD_STEP_LEN);
                    for (let i = 0, j = 0; i < countTxn; i++) {
                        j = STD_STEP_LEN * i;
                        this.chipTransactionsValues.transactions.push(
                            {
                                "transDate": value[j],
                                "transTime": value[j + 1],
                                "transSign": value[j + 2],
                                "transAmount": value[j + 3],
                                "transNewBalance": value[j + 4],
                                "transState": value[j + 5]
                            }
                        );
                    }
                } catch (exception) {
                    isError = true;
                    _logger.error(`ChipTransactionsViewModel::importBusinessData data service callback --> Data invalid. ${PROP_DISPLAY_VARIABLE}='${value}' -> Exception='${exception}'`);
                }
            } else {
                _logger.error(`ChipTransactionsViewModel::importBusinessData data service callback --> No values in ${PROP_DISPLAY_VARIABLE} available !`);
                isError = true;
            }
            _logger.log(_logger.LOG_INOUT, `< ChipTransactionsViewModel::importBusinessData returns: ${isError?"Error":"Success"}`);
            if (isError) {
                this.handleError();
                throw `ChipTransactionsViewModel::importBusinessData`;
            }
            return this.chipTransactionsValues;
        }

        /**
         * Overrides {@link Wincor.UI.Content.ListViewModel#onInitTextAndData} <BR>
         * Reads the chip transactions property from the view config and <BR>
         * fills the chip transactions table with the information of the property. <BR>
         * Calls the function initItemData for the initialization of the item list for the chiptransaction view.
         * @param {Object} args Contains the attributes 'textKeys' <br> {array.<string|promise>} and <br> 'dataKeys' {array.<string|promise>}, <br> which should be filled up by the viewmodel.
         * @lifecycle viewmodel
         */
        onInitTextAndData(args) {
            _logger.log(_logger.LOG_INOUT, "> ChipTransactionsViewModel::onInitTextAndData()");

            if (!this.designMode) { // app mode
                let config = this.viewConfig.config;
                if(config) {
                    if(config.ChipTransProperty !== undefined) {
                        this.propDispKey(config.ChipTransProperty);
                    } else {
                        this.propDispKey(PROP_DISPLAY_KEY_DEFAULT);
                        _logger.log(_logger.LOG_DATA, ". ChipTransactionsViewModel::onInitTextAndData ChipTransProperty set to PROP_DISPLAY_KEY_DEFAULT");
                    }
                } else {
                    this.propDispKey(PROP_DISPLAY_KEY_DEFAULT);
                    _logger.log(_logger.LOG_DATA, ". ChipTransactionsViewModel::onInitTextAndData ChipTransProperty set to PROP_DISPLAY_KEY_DEFAULT");
                }
                _logger.log(_logger.LOG_DATA, `. ChipTransactionsViewModel::onInitTextAndData ChipTransProperty(${this.propDispKey()})`);

                // use this deferred object to
                args.dataKeys.push(this.importBusinessData()
                    .then(chipTxnData => {
                        this.initItemData(chipTxnData);
                    }));
            } else { // design mode
                args.dataKeys.push(this.designTimeRunner.retrieveJSONData("ChipTransactionsData")
                    .then(data => {
                        this.chipTransactionsValues = data.ChipTrans;
                        this.initItemData(this.chipTransactionsValues);
                    }));
            }
            _logger.log(_logger.LOG_INOUT, "< ChipTransactionsViewModel::onInitTextAndData");
            return super.onInitTextAndData(args);
        }

        /**
         * Overrides {@link Wincor.UI.Content.ListViewModel#onDeactivated}
         * Is called when this viewmodel gets deactivated during the life-cycle <br>
         * in order to clear data list items and observables.
         * @lifecycle viewmodel
         */
        onDeactivated() {
            super.onDeactivated();
            this.chipTransactionsValues = null;
            this.propDispKey("");

        }

        /**
         * Overrides {@link Wincor.UI.Content.ListViewModel#onButtonPressed}
         * in order to handle certain commands for the chiptransactions view.
         * <p>
         * Handles the following on button pressed actions:<br>
         * <ul>
         *     <li>BTN_SCROLL_DOWN</li>
         *     <li>BTN_SCROLL_UP</li>
         * </ul>
         * </p>
         * @param {String} id the id of the command that was triggered
         * @eventhandler
         */
        onButtonPressed(id) {
            _logger.log(_logger.LOG_INOUT, `> ChipTransactionsViewModel::onButtonPressed(${id})`);

            if(id === "BTN_SCROLL_DOWN" || id === "BTN_SCROLL_UP") { // scroll page down
                this.handleScrolling(id);
            } else {
                super.onButtonPressed(id); // call super onButtonPressed, if you like to
            }

            _logger.log(_logger.LOG_INOUT, "< ChipTransactionsViewModel::onButtonPressed");
        }
    }
});