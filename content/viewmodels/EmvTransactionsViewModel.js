/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ EmvTransactionsViewModel.js 4.3.1-210127-21-34ae33df-1a04bc7d

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
    const PROP_DISPLAY_KEY_DEFAULT = "PROP_DISPLAY_TRANS_LOG";

    /**
     * Standard table
     * @type {number}
     * @CONST
     */
    const STD_STEP_LEN = 9;

    /**
     * Property key for the DISPLAY_VARIABLE value (ECASH).
     * @const
     * @type {string}
     */
    const PROP_DISPLAY_KEY_ECASH = "PROP_DISPLAY_TRANS_LOG_ECASH";

    /**
     * Standard table
     * @type {number}
     * @CONST
     */
    const ECASH_STEP_LEN = 5;

    /**
     *
     * @param transDate
     * @param transTime
     * @param transAmount
     * @param transRefAmount
     * @param transCountry
     * @param transCurrency
     * @param transType
     * @param transNumber
     * @param transPlace
     * @private
     */
    const Transaction = function(transDate, transTime, transAmount, transRefAmount, transCountry, transCurrency, transType, transNumber, transPlace ) {
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
        this.transRefAmount = transRefAmount;

        /**
         * The country.
         * @type {String}
         * @public
         */
        this.transCountry = transCountry;

        /**
         * The currency.
         * @type {String}
         * @public
         */
        this.transCurrency = transCurrency;
        
        /**
         * The type.
         * @type {String}
         * @public
         */
        this.transType = transType;
        
        /**
         * The number.
         * @type {String}
         * @public
         */
        this.transNumber = transNumber;
        
        /**
         * The place.
         * @type {String}
         * @public
         */
        this.transPlace = transPlace;
    };

    /**
     *
     * @param transDate
     * @param transTime
     * @param transCountry
     * @param transNumber
     * @param transPlace
     * @private
     */
    const TransactionECash = function(transDate, transTime, transCountry, transNumber, transPlace ) {
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
         * The country.
         * @type {String}
         * @public
         */
        this.transCountry = transCountry;

        /**
         * The number.
         * @type {String}
         * @public
         */
        this.transNumber = transNumber;

        /**
         * The place.
         * @type {String}
         * @public
         */
        this.transPlace = transPlace;
    };

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
    Wincor.UI.Content.EmvTransactionsViewModel = class EmvTransactionsViewModel extends Wincor.UI.Content.ListViewModel {

        /**
         * This observable stores the type of the translog table, which defines the layout of the translog view.
         * <p>
         * Possible values<br>
         * <ul>
         *     <li>TransLogStd</li>
         *     <li>TransLogECash</li>
         * </ul>
         * </p>
         * @type {function | ko.observable}
         * @default TransLogStd
         * @bindable
         */
        tableType = ko.observable("TransLogStd");

        /**
         * Constants for supported table types
         * @enum {Object}
         */
        TABLE_TYPE = {
            /**
             * TransLog Std
             * @type {String}
             */
            STD: "TransLogStd",
            /**
             * TransLog ECash
             * @type {String}
             */
            ECASH: "TransLogECash"
        };

        /**
         * View model data to store the table of the chip transactions data.
         */
        transLogValues = null;


        /**
         * Creates and returns a new Transaction instance object
         * @param args
         * @returns {Transaction}
         */
        createTransactionInstance(...args) {
            let tableType = this.tableType();

            if (tableType === this.TABLE_TYPE.ECASH) {
                return new TransactionECash(...args);
            } else {
                return new Transaction(...args);
            }
        }

        /**
         * Creates and returns a new ChipData instance object
         * @returns {ChipData}
         */
        createChipDataInstance() {
            return new ChipData();
        }

        /**
         * Initializes the item list for the emvtransactions view that is to be presented.
         * @param {object} transLogData the EMV transaction data
         * @private
         */
        initItemData(transLogData) {
            _logger.log(_logger.LOG_ANALYSE, `> EmvTransactionsViewModel::initItemData transLogData=${JSON.stringify(transLogData)}`);

            let tableType = this.tableType();

            let dataTransactions = transLogData.transactions;
            let dataTransactionsLength = dataTransactions.length;
            this.setListLen(dataTransactionsLength);
            let currVisEntries = this.initCurrentVisibleLimits();

            _logger.log(_logger.LOG_ANALYSE, `EmvTransactionsViewModel::initItemData dataTransactionsLength: ${dataTransactionsLength}, currVisEntries: ${currVisEntries}`);

            let sourceData = this.createChipDataInstance();
            let itemsRaw = [];
            let txn = "";

            if (tableType === this.TABLE_TYPE.STD) {

                for (let i = 0; i < dataTransactionsLength; i++) {
                    txn = this.createTransactionInstance(
                        dataTransactions[i].transDate,
                        dataTransactions[i].transTime,
                        dataTransactions[i].transAmount,
                        dataTransactions[i].transRefAmount,
                        dataTransactions[i].transCountry,
                        dataTransactions[i].transCurrency,
                        dataTransactions[i].transType,
                        dataTransactions[i].transNumber,
                        dataTransactions[i].transPlace
                    );
                    sourceData.transactions.push(txn);
                    if (i < currVisEntries) {
                        itemsRaw.push(txn);
                    }
                }
            } else if (tableType === this.TABLE_TYPE.ECASH) {

                for (let i = 0; i < dataTransactionsLength; i++) {
                    txn = this.createTransactionInstance(
                        dataTransactions[i].transDate,
                        dataTransactions[i].transTime,
                        dataTransactions[i].transCountry,
                        dataTransactions[i].transNumber,
                        dataTransactions[i].transPlace
                    );
                    sourceData.transactions.push(txn);
                    if (i < currVisEntries) {
                        itemsRaw.push(txn);
                    }
                }
            } else {
                // wrong table type
                _logger.error(`EmvTransactionsViewModel::initItemData wrong table type: ${tableType}`);
            }


            this.setListSource(sourceData.transactions);

            // Workaround-Start 190711
            // Has to be removed when Hotfix 2021 will be installed
            this.initCurrentVisibleLimits();
            // Workaround-End 190711

            this.dataList.items(itemsRaw);
            this.initScrollbar();

            _logger.log(_logger.LOG_INOUT, "< EmvTransactionsViewModel::initItemData");
        }

        /**
         * Initializes the DOM-associated objects and introduces the observable area id to the binding processor. <br>
         * {@link BaseViewModel#observe} is invoked in order to apply all bindings of the observable area to knockoutjs. <br>
         * Overrides {@link Wincor.UI.Content.ListViewModel#observe}
         * @param {string} observableAreaId     The area id to observe via knockout
         * @param {object=} visibleLimitsObject The visible limits object for the view. <br> Usually necessary for a softkey based view.<br>
         *                                      A typical visible limits object looks like: { visibleLimits: { max: 8 }}
         * @lifecycle viewmodel
         */
        observe(observableAreaId, visibleLimitsObject) {
            try {
                _logger.log(_logger.LOG_ANALYSE, "> EmvTransactionsViewModel::observe(" + observableAreaId + ")");

                super.observe(observableAreaId, visibleLimitsObject);

                if(this.designMode) { // design mode
                    this.cmdRepos.whenAvailable([this.STANDARD_BUTTONS.CONFIRM]).then(() => this.cmdRepos.setActive([this.STANDARD_BUTTONS.CONFIRM]));
                    this.cmdRepos.whenAvailable(["PRINT"]).then(() => this.cmdRepos.setActive(["PRINT"]));
                }

                _logger.log(_logger.LOG_INOUT, "< EmvTransactionsViewModel::observe");
            } catch(e) {
                _logger.error("Problem in EmvTransactionsViewModel occurred: " + e.message);
            }
        }

        /**
         * Asynchronous function that gets transaction data via business property, storing it into transLogValues
         * @param {String} tableType
         * @async
         */
        async importBusinessData(tableType) {
            _logger.log(_logger.LOG_INOUT, "> EmvTransactionsViewModel::importBusinessData()");

            const PROPERTY_TABLE = {
                [this.TABLE_TYPE.STD]: PROP_DISPLAY_KEY_DEFAULT,
                [this.TABLE_TYPE.ECASH]: PROP_DISPLAY_KEY_ECASH,
            };

            const STEP_LEN_TABLE = {
                [this.TABLE_TYPE.STD]: STD_STEP_LEN,
                [this.TABLE_TYPE.ECASH]: ECASH_STEP_LEN
            };

            let STEP_LEN = STEP_LEN_TABLE[tableType];
            let PROP_DISPLAY_VARIABLE = PROPERTY_TABLE[tableType] + "[A,0," + STEP_LEN + "]";

            let result = await _dataService.getValues([PROP_DISPLAY_VARIABLE]);
            let isError = false;
            let value = result[PROP_DISPLAY_VARIABLE];
            if (value !== undefined) {
                try {
                    this.transLogValues = {
                        transactions: []
                    };
                    let countTxn = (value.length / STEP_LEN);
                    for (let i = 0, j = 0; i < countTxn; i++) {
                        j = STEP_LEN * i;
                        if (tableType === this.TABLE_TYPE.STD) {
                            this.transLogValues.transactions.push(
                                {
                                    "transDate": value[j],
                                    "transTime": value[j + 1],
                                    "transAmount": value[j + 2],
                                    "transRefAmount": value[j + 3],
                                    "transCountry": value[j + 4],
                                    "transCurrency": value[j + 5],
                                    "transType": value[j + 6],
                                    "transNumber": value[j + 7],
                                    "transPlace": value[j + 8]
                                }
                            );
                        } else if (tableType === this.TABLE_TYPE.ECASH) {
                            this.transLogValues.transactions.push(
                                {
                                    "transDate": value[j],
                                    "transTime": value[j + 1],
                                    "transCountry": value[j + 2],
                                    "transNumber": value[j + 3],
                                    "transPlace": value[j + 4]
                                }
                            );
                        }
                    }
                } catch (exception) {
                    isError = true;
                    _logger.error(`EmvTransactionsViewModel::importBusinessData data service callback --> Data invalid. ${PROP_DISPLAY_VARIABLE}='${value}' -> Exception='${exception}'`);
                }
            } else {
                _logger.error(`EmvTransactionsViewModel::importBusinessData data service callback --> No values in ${PROP_DISPLAY_VARIABLE} available !`);
                isError = true;
            }
            _logger.log(_logger.LOG_INOUT, `< EmvTransactionsViewModel::importBusinessData returns: ${isError?"Error":"Success"}`);
            if (isError) {
                this.handleError();
                throw `EmvTransactionsViewModel::importBusinessData`;
            }

            return this.transLogValues;
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
            _logger.log(_logger.LOG_INOUT, "> EmvTransactionsViewModel::onInitTextAndData()");

            if (!this.designMode) { // app mode

                let config = this.viewConfig.config;
                if(config) {
                    if(config.TransLogTableType !== void 0) {
                        this.tableType(config.TransLogTableType);
                    }
                } else {
                    // set table type to default
                    this.tableType(this.TABLE_TYPE.STD);
                }
                _logger.log(_logger.LOG_DATA, `. EmvTransactionsViewModel::onInitTextAndData tableType (${this.tableType()})`);

                let tableType = this.tableType();

                // use this deferred object to
                args.dataKeys.push(this.importBusinessData(tableType)
                    .then(transLogTxnData => {
                        this.initItemData(transLogTxnData);
                    }));
            } else { // design mode
                args.dataKeys.push(this.designTimeRunner.retrieveJSONData("EmvTransactionsData")
                    .then(data => {
                        if (data.defaultTableType !== void 0) {
                            this.tableType(data.defaultTableType);
                        } else {
                            this.tableType(this.TABLE_TYPE.STD);
                        }

                        let tableType = this.tableType();
                        if (tableType === this.TABLE_TYPE.ECASH) {
                            this.transLogValues = data.TransLogECash;

                        } else {
                            this.transLogValues = data.TransLogStd;
                        }

                        this.initItemData(this.transLogValues);
                    }));
            }
            _logger.log(_logger.LOG_INOUT, "< EmvTransactionsViewModel::onInitTextAndData");
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
            this.transLogValues = null;
            this.tableType("");
        }

        /**
         * Overrides {@link Wincor.UI.Content.ListViewModel#onButtonPressed}
         * in order to handle certain commands for the transLog view.
         * <p>
         * Handles the following on button pressed actions:<br>
         * <ul>
         *     <li>BTN_SCROLL_DOWN</li>
         *     <li>BTN_SCROLL_UP</li>
         * </ul>
         * </p>
         * @param {string} id the id of the command that was triggered
         * @eventhandler
         */
        onButtonPressed(id) {
            _logger.log(_logger.LOG_INOUT, `> EmvTransactionsViewModel::onButtonPressed(${id})`);

            if(id === "BTN_SCROLL_DOWN" || id === "BTN_SCROLL_UP") { // scroll page down
                this.handleScrolling(id);
            } else {
                super.onButtonPressed(id); // call super onButtonPressed, if you like to
            }

            _logger.log(_logger.LOG_INOUT, "< EmvTransactionsViewModel::onButtonPressed");
        }
    }
});