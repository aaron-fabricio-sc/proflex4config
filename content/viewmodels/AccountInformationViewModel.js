/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ AccountInformationViewModel.js 4.3.1-210127-21-34ae33df-1a04bc7d
 */
define(["jquery", "knockout", "vm/ListViewModel"], function(jQuery, ko) {
    "use strict";

    const _logger = Wincor.UI.Service.Provider.LogProvider;
    const _dataService = Wincor.UI.Service.Provider.DataService;

    /**
     * Property key for DISPLAY_VARIABLE value.
     * @const
     * @type {string}
     */
    const PROP_DISPLAY_KEY = "PROP_DISPLAY_VARIBALE";

    /**
     * Standard table
     * @type {number}
     * @CONST
     */
    const STD_STEP_LEN = 9;
    const PROP_DISPLAY_VARIABLE_STD = PROP_DISPLAY_KEY + "[A,5," + STD_STEP_LEN + "]";

    /**
     * IFX table
     * @type {number}
     * @CONST
     */
    const IFX_STEP_LEN = 6;
    const PROP_DISPLAY_VARIABLE_IFX = PROP_DISPLAY_KEY + "[A,0," + IFX_STEP_LEN + "]";

    /**
     * PCEMOV table
     * @type {number}
     * @CONST
     */
    const PCEMOV_STEP_LEN = 9;
    const PROP_DISPLAY_VARIABLE_PCEMOV = PROP_DISPLAY_KEY + "[A,5," + PCEMOV_STEP_LEN + "]";

    /**
     * PCEBAL table
     * @type {number}
     * @CONST
     */
    const PCE_BAL_STEP_LEN = 7;
    const PROP_DISPLAY_VARIABLE_PCEBAL = PROP_DISPLAY_KEY + "[A,0," + PCE_BAL_STEP_LEN + "]";

    const Account = function(number, holder, balanceCurrency, balanceValue, balanceType, type) {
        /**
         * The account number.
         * @type {int}
         * @public
         */
        this.number = number;

        /**
         * The account holder.
         * @type {String}
         * @public
         */
        this.holder = holder;

        /**
         * The currency of the account.
         * @type {String}
         * @public
         */
        this.balanceCurrency = balanceCurrency;

        /**
         * The balance of the account.
         * @type {Number}
         * @public
         */
        this.balanceValue = balanceValue;

        /**
         * The balance type.
         * @type {String}
         * @public
         */
        this.balanceType = balanceType;

        /**
         * The account type.
         * @type {string}
         * @public
         */
        this.type = type;
    };

    /**
     *
     * @param expirationDate
     * @param effectiveDate
     * @param currency
     * @param amount
     * @param balanceType
     * @param description1
     * @param description2
     * @param description3
     * @param description4
     * @private
     */
    const Transaction = function(expirationDate, effectiveDate, currency, amount, balanceType, description1, description2, description3, description4) {
        /**
         * The expiration date.
         * @type {Date}
         * @public
         */
        this.expirationDate = expirationDate;

        /**
         * The effective date.
         * @type {Date}
         * @public
         */
        this.effectiveDate = effectiveDate;

        /**
         * The transaction currency.
         * @type {int}
         * @public
         */
        this.currency = currency;

        /**
         * The amount of the transaction.
         * @type {Number}
         * @public
         */
        this.amount = amount;

        /**
         * The balance type.
         * @type {String}
         * @public
         */
        this.balanceType = balanceType;

        /**
         * The description1.
         * @type {String}
         * @public
         */
        this.description1 = description1;

        /**
         * The description2.
         * @type {String}
         * @public
         */
        this.description2 = description2;

        /**
         * The description3.
         * @type {String}
         * @public
         */
        this.description3 = description3;

        /**
         * The description4.
         * @type {String}
         * @public
         */
        this.description4 = description4;
    };

    const TransactionPceBal = function(accountType, accountNumber, accountBalanceCurrency, accountBalanceAmount, accountBalanceSign, accountBalance, availableAmountCurrency, availableAmountAmount, availableAmount) {
        /**
         * The account type.
         * @type {Date}
         * @public
         */
        this.accountType = accountType;

        /**
         * The account number.
         * @type {Date}
         * @public
         */
        this.accountNumber = accountNumber;

        /**
         * The account balance Currency.
         * @type {string}
         * @public
         */
        this.accountBalanceCurrency = accountBalanceCurrency;

        /**
         * The account balance Amount.
         * @type {string}
         * @public
         */
        this.accountBalanceAmount = accountBalanceAmount;

        /**
         * The account balance Sign.
         * @type {string}
         * @public
         */
        this.accountBalanceSign = accountBalanceSign;

        /**
         * The account balance.
         * @type {string}
         * @public
         */
        this.accountBalance = accountBalance;

        /**
         * The available amount Currency.
         * @type {string}
         * @public
         */
        this.availableAmountCurrency = availableAmountCurrency;


        /**
         * The available amount Amount.
         * @type {string}
         * @public
         */
        this.availableAmountAmount = availableAmountAmount;

        /**
         * The available amount.
         * @type {string}
         * @public
         */
        this.availableAmount = availableAmount;
    };

    /**
     * View model data
     */
    const AccountData = function() {
        this.transactions = [];
    };

    /**
     * Derived from {@link Wincor.UI.Content.ListViewModel} <BR>
     * This viewmodel handles the account information view.
     * @class
     */
    Wincor.UI.Content.AccountInformationViewModel = class AccountInformationViewModel extends Wincor.UI.Content.ListViewModel {

        /**
         * Current account information values
         * @protected
         */
        accountInformationValues = null;

        /**
         * Current account information values
         * @protected
         */
        accountInformationAINPcebalValue = null;
        
        /**
         * This observable stores the type of the accountinformation table, which defines the layout of the accountinformation view.
         * <p>
         * Possible values<br>
         * <ul>
         *     <li>AINStd</li>
         *     <li>AINPcemov</li>
         *     <li>AINIfx</li>
         *     <li>AINPcebal</li>
         * </ul>
         * </p>
         * @type {function | ko.observable}
         * @default AINStd
         * @bindable
         */
        tableType = ko.observable("AINStd");

        /**
         * Constants for supported table types
         * @enum {Object}
         */
        TABLE_TYPE = {
            /**
             * Vynamic Transaction Middleware Balance
             * @type {String}
             */
            VTM_BAL: "AINPcebal",
            /**
             * Vynamic Transaction Middleware Movements
             * @type {String}
             */
            VTM_MOV: "AINPcemov",
            /**
             * ProFlex4 Std
             * @type {String}
             */
            STD: "AINStd",
            /**
             * ProFlex4 IFX Std
             * @type {String}
             */
            IFX: "AINIfx"
        };

        /**
         * Initializes the DOM-associated objects and introduces the observable area id to the binding processor. <br>
         * {@link BaseViewModel#observe} is invoked in order to apply all bindings of the observable area to knockoutjs. <br>
         * Overrides {@link Wincor.UI.Content.ListViewModel#observe}
         * @param {String} observableAreaId     The area id to observe via knockout
         * @param {Object=} visibleLimitsObject The visible limits object for the view. <br> Usually necessary for a softkey based view.<br>
         *                                      A typical visible limits object looks like: { visibleLimits: { max: 8 }}
         * @lifecycle viewmodel
         */
        observe(observableAreaId, visibleLimitsObject) {
            try {
                _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `> AccountInformationViewModel::observe(${observableAreaId})`);

                _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, ". AccountInformationViewModel::observe viewConf=" + JSON.stringify(this.viewConfig));
                let config = this.viewConfig.config;
                if(config) {
                    if(config.AINType !== void 0) {
                        this.tableType(config.AINType);
                    }
                    _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, ". AccountInformationViewModel::observe tableType(" + this.tableType() + ")");
                }

                super.observe(observableAreaId, visibleLimitsObject);

                if(this.designMode) { // design mode
                    this.cmdRepos.whenAvailable([this.STANDARD_BUTTONS.CONFIRM]).then(() => this.cmdRepos.setActive([this.STANDARD_BUTTONS.CONFIRM]));
                    this.cmdRepos.whenAvailable(["PRINT"]).then(() => this.cmdRepos.setActive(["PRINT"]));
                }

                _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< AccountInformationViewModel::observe");
            } catch(e) {
                _logger.error(`Problem in AccountInformationViewModel occurred: ${e.message}`);
            }
        }

        /**
         * Dispatcher for adaText assembling functions.
         * Can easily be extended by overlays
         * @param tableType
         */
        assembleAdaText(tableType) {
            const CONVERTER_TABLE = {
                [this.TABLE_TYPE.STD]: this.assembleAdaTextStd,
                [this.TABLE_TYPE.VTM_MOV]: this.assembleAdaTextVTMMov,
                [this.TABLE_TYPE.VTM_BAL]: this.assembleAdaTextVTMBal,
                [this.TABLE_TYPE.IFX]: this.assembleAdaTextIFX
            };
            let fx = CONVERTER_TABLE[tableType];
            if (typeof fx === "function") {
                return fx.call(this);
            }
            return "";
        }

        /**
         * Assembles the raw ada text for table type std
         * @returns {string}
         */
        assembleAdaTextStd() {
            let adaTextRaw = "";
            let obj = {
                "expirationDate": ko.observable(""),
                "effectiveDate": ko.observable(""),
                "currency": ko.observable(""),
                "amount": ko.observable(""),
                "balanceType": ko.observable(""),
                "description1": ko.observable(""),
                "description2": ko.observable(""),
                "description3": ko.observable(""),
                "description4": ko.observable("")
            };

            let myObservable = this.getLabel("GUI_[#VIEW_KEY#]_DataContent_Dataset_template_ADA", "def", {}, obj);

            for(let i = 0; i < this.dataList.items().length; i++) {
                obj.expirationDate(this.dataList.items()[i].expirationDate);
                obj.effectiveDate(this.dataList.items()[i].effectiveDate);
                obj.currency(this.dataList.items()[i].currency);
                obj.amount(this.dataList.items()[i].amount);
                obj.balanceType(this.dataList.items()[i].balanceType);
                obj.description1(this.dataList.items()[i].description1);
                obj.description2(this.dataList.items()[i].description2);
                obj.description3(this.dataList.items()[i].description3);
                obj.description4(this.dataList.items()[i].description4);

                adaTextRaw += ko.utils.unwrapObservable(myObservable);
            }

            return adaTextRaw;
        }

        /**
         * Assembles the raw ada text for table type VTM_MOV
         * @returns {string}
         */
        assembleAdaTextVTMMov() {
            return this.assembleAdaTextStd();
        }

        /**
         * Assembles the raw ada text for table type VTM_BAL
         * @returns {string}
         */
        assembleAdaTextVTMBal() {
            let adaTextRaw = "";
            let obj = {
                "accountType": ko.observable(""),
                "accountNumber": ko.observable(""),
                "accountBalanceCurrency": ko.observable(""),
                "accountBalanceAmount": ko.observable(""),
                "accountBalanceSign": ko.observable(""),
                "accountBalance": ko.observable(""),
                "availableAmountCurrency": ko.observable(""),
                "availableAmountAmount": ko.observable(""),
                "availableAmount": ko.observable("")
            };

            let myObservable = this.getLabel("GUI_[#VIEW_KEY#]_DataContent_Dataset_template_ADA", "def", {}, obj);

            for(let i = 0; i < this.dataList.items().length; i++) {
                obj.accountType(this.dataList.items()[i].accountType);
                obj.accountNumber(this.dataList.items()[i].accountNumber);
                obj.accountBalanceCurrency(this.dataList.items()[i].accountBalanceCurrency);
                obj.accountBalanceAmount(this.dataList.items()[i].accountBalanceAmount);
                obj.accountBalanceSign(this.dataList.items()[i].accountBalanceSign);
                obj.accountBalance(this.dataList.items()[i].accountBalance);
                obj.availableAmountCurrency(this.dataList.items()[i].availableAmountCurrency);
                obj.availableAmountAmount(this.dataList.items()[i].availableAmountAmount);
                obj.availableAmount(this.dataList.items()[i].availableAmount);

                adaTextRaw += ko.utils.unwrapObservable(myObservable);
            }

            return adaTextRaw;
        }

        /**
         * Assembles the raw ada text for table type IFX.
         * @see {@link TABLE_TYPES}
         * @returns {string}
         */
        assembleAdaTextIFX() {
            let adaTextRaw = "";
            let obj = {
                "expirationDate": ko.observable(""),
                "effectiveDate": ko.observable(""),
                "currency": ko.observable(""),
                "amount": ko.observable(""),
                "balanceType": ko.observable(""),
                "description1": ko.observable("")
            };

            let myObservable = this.getLabel("GUI_[#VIEW_KEY#]_DataContent_Dataset_template_ADA", "def", {}, obj);

            for(let i = 0; i < this.dataList.items().length; i++) {
                obj.expirationDate(this.dataList.items()[i].expirationDate);
                obj.effectiveDate(this.dataList.items()[i].effectiveDate);
                obj.currency(this.dataList.items()[i].currency);
                obj.amount(this.dataList.items()[i].amount);
                obj.balanceType(this.dataList.items()[i].balanceType);
                obj.description1(this.dataList.items()[i].description1);

                adaTextRaw += ko.utils.unwrapObservable(myObservable);
            }

            return adaTextRaw;
        }

        /**
         * Overrides {@link Wincor.UI.Content.BaseViewModel#onAdaPrepared}. <br>
         * Prepares the ADA text keys dependent on the table type. <br>
         * Does not call the super method in order to handle everything by itself.
         * @lifecycle viewmodel
         */
        onAdaPrepared() {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> AccountInformationViewModel::onAdaPrepared");

            if(!this.designMode) {
                if(!this.vmHelper.isPopupActive()) {
                    let tableType = this.tableType();
                    let adaTextRaw = this.assembleAdaText(tableType);
                    // add datasets to full text
                    let objFull = {
                        "datasets": ko.observable("")
                    };
                    let myObservableFull = this.getLabel("GUI_[#VIEW_KEY#]_DataContent_template_ADA", "def", {}, objFull);
                    objFull.datasets(adaTextRaw);
                    let adaTextFull = ko.utils.unwrapObservable(myObservableFull);
                    _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "-> new adaTextMap.message = " + adaTextFull);

                    // let BVM speak ADA.message in right moment!
                    this.ada._adaTextMap.message(adaTextFull);
                }
            }

            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< AccountInformationViewModel::onAdaPrepared");
        }

        /**
         * Creates and returns a new instance of the Account class
         * @param args
         * @returns {Account}
         */
        createAccountInstance(...args) {
            return new Account(...args);
        }

        /**
         * Creates and returns a new instance of the AccountData class
         * @returns {AccountData}
         */
        createAccountDataInstance() {
            const accData = new AccountData();
            accData.account = this.createAccountInstance(0, "", "", 0, "");
            return accData;
        }

        /**
         * Creates an instance of Transaction object, passing arguments to constructor and returns the created instance
         * @param args argument list as expected by the class that is returned. Standard Transaction class receives:<br>
         * <ul>
         *   <li>expirationDate</li>
         *   <li>effectiveDate</li>
         *   <li>currency</li>
         *   <li>amount</li>
         *   <li>balanceType</li>
         *   <li>description1</li>
         *   <li>description2</li>
         *   <li>description3</li>
         *   <li>description4</li>
         * </ul>
         * @returns {Transaction}
         */
        createTransactionInstance(...args) {
            return new Transaction(...args);
        }

        /**
         * Creates an instance of TransactionPceBal object, passing arguments to constructor and returns the created instance
         * @param args argument list as expected by the class that is returned. Standard Transaction class receives:<br>
         * <ul>
         *   <li>accountType</li>
         *   <li>accountNumber</li>
         *   <li>accountBalanceCurrency</li>
         *   <li>accountBalanceAmount</li>
         *   <li>accountBalanceSign</li>
         *   <li>accountBalance</li>
         *   <li>availableAmountCurrency</li>
         *   <li>availableAmountAmount</li>
         *   <li>availableAmount</li>
         * </ul>
         * @returns {TransactionPceBal}
         */
        createPceTransactionInstance(...args) {
            return new TransactionPceBal(...args);
        }

        /**
         * Dispatcher for converter functions.
         * Can easily be extended by overlays
         * @param {String} tableType The configured type.
         * @param {...*} args Arguments to be passed to the concrete converter function
         */
        convertTransactions(tableType, ...args) {
            const CONVERTER_TABLE = {
                [this.TABLE_TYPE.STD]: this.convertTransactionsForStd,
                [this.TABLE_TYPE.VTM_MOV]: this.convertTransactionsForVTMMov,
                [this.TABLE_TYPE.VTM_BAL]: this.convertTransactionsForVTMBal,
                [this.TABLE_TYPE.IFX]: this.convertTransactionsForIFX
            };
            let fx = CONVERTER_TABLE[tableType];
            if (typeof fx === "function") {
                fx.call(this, ...args);
            }
        }

        /**
         * Converts data from VTM Mov to internal format
         * This function uses "convertTransactionsForAinStd", but is implemented so it could be overridden
         * @param {Object} accountInfoData The original transaction data array
         * @param {Object} sourceData The source data object
         * @param {Array} itemsRaw
         * @param {number} currVisEntries
         */
        convertTransactionsForVTMMov(accountInfoData, sourceData, itemsRaw, currVisEntries) {
            this.convertTransactionsForStd(accountInfoData, sourceData, itemsRaw, currVisEntries)
        }

        /**
         * Converts data from VTM Mov to internal format
         * This function uses "convertTransactionsForAinStd", but is implemented so it could be overridden
         * @param {Object} accountInfoData The original transaction data array
         * @param {Object} sourceData The source data object
         * @param {Array} itemsRaw
         * @param {number} currVisEntries
         */
        convertTransactionsForVTMBal(accountInfoData, sourceData, itemsRaw, currVisEntries) {
            let dataTransactions = accountInfoData.transactions;
            let dataTransactionsLength = dataTransactions.length;
            let txn;
            for(let i = 0; i < dataTransactionsLength; i++) {
                txn = this.createPceTransactionInstance(
                    dataTransactions[i].accountType,
                    dataTransactions[i].accountNumber,
                    dataTransactions[i].accountBalanceCurrency,
                    dataTransactions[i].accountBalanceAmount,
                    dataTransactions[i].accountBalanceSign,
                    dataTransactions[i].accountBalance,
                    dataTransactions[i].availableAmountCurrency,
                    dataTransactions[i].availableAmountAmount,
                    dataTransactions[i].availableAmount
                );
                sourceData.transactions.push(txn);
                if(i < currVisEntries) {
                    itemsRaw.push(txn);
                }
            }
        }

        /**
         * Converts data from Ain std to internal format
         * @param {Object} accountInfoData The original transaction data array
         * @param {Object} sourceData The source data object
         * @param {Array} itemsRaw
         * @param {number} currVisEntries
         */
        convertTransactionsForStd(accountInfoData, sourceData, itemsRaw, currVisEntries) {
            let dataAccount = accountInfoData.account;
            sourceData.account = this.createAccountInstance(dataAccount.number, dataAccount.holder, dataAccount.balanceCurrency, dataAccount.balanceValue, dataAccount.balanceType, "");
            let dataTransactions = accountInfoData.transactions;
            let dataTransactionsLength = dataTransactions.length;
            let txn;
            for(let i = 0; i < dataTransactionsLength; i++) {
                txn = this.createTransactionInstance(
                    dataTransactions[i].expirationDate,
                    dataTransactions[i].effectiveDate,
                    dataTransactions[i].currency,
                    dataTransactions[i].amount,
                    dataTransactions[i].balanceType,
                    dataTransactions[i].description1,
                    dataTransactions[i].description2,
                    dataTransactions[i].description3,
                    dataTransactions[i].description4
                );
                sourceData.transactions.push(txn);
                if(i < currVisEntries) {
                    itemsRaw.push(txn);
                }
            }
        }

        /**
         * Converts data from Ain IFX to internal format
         * @param {Object} accountInfoData The original transaction data array
         * @param {Object} sourceData The source data object
         * @param {Array} itemsRaw
         * @param {number} currVisEntries
         */
        convertTransactionsForIFX(accountInfoData, sourceData, itemsRaw, currVisEntries) {
            let dataAccount = accountInfoData.account;
            sourceData.account = this.createAccountInstance(dataAccount.number, dataAccount.holder, dataAccount.balanceCurrency, dataAccount.balanceValue, dataAccount.balanceType, "");
            let dataTransactions = accountInfoData.transactions;
            let dataTransactionsLength = dataTransactions.length;
            let txn;
            for(let i = 0; i < dataTransactionsLength; i++) {
                txn = this.createTransactionInstance(
                    dataTransactions[i].expirationDate,
                    dataTransactions[i].effectiveDate,
                    dataTransactions[i].currency,
                    dataTransactions[i].amount,
                    dataTransactions[i].balanceType,
                    dataTransactions[i].description1
                );
                sourceData.transactions.push(txn);
                if(i < currVisEntries) {
                    itemsRaw.push(txn);
                }
            }
        }

        /**
         * Initializes the item list for the account information view dependent on the tableType.
         * @param {Object} accountInfoData the account data
         * @protected
         */
        initItemData(accountInfoData) {
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, "> AccountInformationViewModel::initItemData accountInfoData=" + JSON.stringify(accountInfoData));

            let dataTransactionsLength = accountInfoData.transactions.length;
            this.setListLen(dataTransactionsLength);
            let currVisEntries = this.initCurrentVisibleLimits();
            let sourceData = this.createAccountDataInstance();
            let itemsRaw = [];

            this.convertTransactions(this.tableType(), accountInfoData, sourceData, itemsRaw, currVisEntries);
            this.setListSource(sourceData.transactions);
            this.dataList.items(itemsRaw);
            this.initScrollbar();

            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< AccountInformationViewModel::initItemData");
        }

        /**
         * This functions returned promise is pushed to args.dataKeys during onInitTextAndData to suspend lifecycle until account info data is available.
         * @param {String} tableType
         * @async
         */
        async importBusinessData(tableType) {

            const PROPERTY_TABLE = {
                [this.TABLE_TYPE.STD]: PROP_DISPLAY_VARIABLE_STD,
                [this.TABLE_TYPE.VTM_MOV]: PROP_DISPLAY_VARIABLE_PCEMOV,
                [this.TABLE_TYPE.VTM_BAL]: PROP_DISPLAY_VARIABLE_PCEBAL,
                [this.TABLE_TYPE.IFX]: PROP_DISPLAY_VARIABLE_IFX
            };

            const STEP_LEN_TABLE = {
                [this.TABLE_TYPE.STD]: STD_STEP_LEN,
                [this.TABLE_TYPE.VTM_MOV]: PCEMOV_STEP_LEN,
                [this.TABLE_TYPE.VTM_BAL]: PCE_BAL_STEP_LEN,
                [this.TABLE_TYPE.IFX]: IFX_STEP_LEN
            };

            let PROP_DISPLAY_VARIABLE = PROPERTY_TABLE[tableType];
            let STEP_LEN = STEP_LEN_TABLE[tableType];
            if(PROP_DISPLAY_VARIABLE) {
                let result = await _dataService.getValues([PROP_DISPLAY_VARIABLE]);
                let isError = false;
                let value = result[PROP_DISPLAY_VARIABLE];
                if(value !== void 0) {
                    try {
                        this.accountInformationValues = {
                            account: {},
                            transactions: []
                        };
                        this.accountInformationAINPcebalValue = {
                            transactions: []
                        };
                        let countTxn = (value.length / STEP_LEN);
                        for(let i = 0; i < countTxn; i++) {
                            let j = STEP_LEN * i;
                            if([this.TABLE_TYPE.STD, this.TABLE_TYPE.VTM_MOV].includes(tableType)) {
                                this.accountInformationValues.transactions.push({
                                    "expirationDate": value[j],
                                    "effectiveDate": value[j + 1],
                                    "currency": value[j + 2],
                                    "amount": value[j + 3],
                                    "balanceType": value[j + 4],
                                    "description1": value[j + 5],
                                    "description2": value[j + 6],
                                    "description3": value[j + 7],
                                    "description4": value[j + 8]
                                });
                            } else if(tableType === this.TABLE_TYPE.IFX) {
                                if(value[j] !== "S" && value[j] !== "-" && value[j] !== "H" && value[j] !== "+") {
                                    // check whether the amount is positive or negative
                                    let pos = value[j + 1].indexOf("-");
                                    if(pos >= 0) {
                                        // set balance type to "-"
                                        value[j] = "-";
                                        // remove "-" from amount
                                        value[j + 1] = value[j + 1].substring(pos + 1);
                                    }
                                    else {
                                        // set balance type to "+"
                                        value[j] = "+";
                                    }
                                }
                                this.accountInformationValues.transactions.push({
                                    "balanceType": value[j],
                                    "amount": value[j + 1],
                                    "currency": value[j + 2],
                                    "effectiveDate": value[j + 3],
                                    "expirationDate": value[j + 4],
                                    "description1": value[j + 5]
                                });
                            } else if(tableType === this.TABLE_TYPE.VTM_BAL) {
                                // create object
                                let objData = {
                                    "accountType": value[j],
                                    "accountNumber": value[j + 1],
                                    "accountBalanceCurrency": value[j + 2],
                                    "accountBalanceAmount": value[j + 3],
                                    "accountBalanceSign": value[j + 4],
                                    //"accountBalance": value[j+2] + " " + value[j+3] + " " + value[j+4],
                                    "accountBalance": "",
                                    "availableAmountCurrency": value[j + 5],
                                    "availableAmountAmount": value[j + 6],
                                    //"availableAmount": value[j+5] + " " + value[j+6]
                                    "availableAmount": ""
                                };

                                // manipulate accountBalance value from object
                                let objMappingAccountBalance = {
                                    "accountBalanceCurrency": ko.observable(objData.accountBalanceCurrency),
                                    "accountBalanceAmount": ko.observable(objData.accountBalanceAmount),
                                    "accountBalanceSign": ko.observable(objData.accountBalanceSign)
                                };
                                objData.accountBalance = this.getLabel("GUI_[#VIEW_KEY#]_AccountBalance_template", "def", {}, objMappingAccountBalance);

                                // manipulate availableAmount value from object
                                let objMappingAvailableAmount = {
                                    "availableAmountCurrency": ko.observable(objData.availableAmountCurrency),
                                    "availableAmountAmount": ko.observable(objData.availableAmountAmount)
                                };
                                objData.availableAmount = this.getLabel("GUI_[#VIEW_KEY#]_AvailableAmount_template", "def", {}, objMappingAvailableAmount);

                                // push object
                                this.accountInformationAINPcebalValue.transactions.push(objData);
                            }
                        }
                    } catch(exception) {
                        isError = true;
                        _logger.error(`AccountInformationViewModel::onInitTextAndData data service callback --> Data invalid. ${PROP_DISPLAY_VARIABLE}='${value}' -> Exception='${exception}'`);
                    }
                } else {
                    _logger.error(`AccountInformationViewModel::onInitTextAndData data service callback --> No values in ${PROP_DISPLAY_VARIABLE} available !`);
                    isError = true;
                }
                if(isError) {
                    this.handleError();
                    throw new Error();
                }
            }
            return tableType === this.TABLE_TYPE.VTM_BAL ? this.accountInformationAINPcebalValue : this.accountInformationValues;
        }

        /**
         * Overrides {@link Wincor.UI.Content.ListViewModel#onInitTextAndData}
         * <p>
         * Handles the following table types:<br>
         * <ul>
         *     <li>AINStd</li>
         *     <li>AINPcemov</li>
         *     <li>AINIfx</li>
         *     <li>AINPcebal</li>
         * </ul>
         * </p>
         * @param {Object} args Contains the attributes 'textKeys' <br> {array.<string|promise>} and <br> 'dataKeys' {array.<string|promise>}, <br> which should be filled up by the viewmodel.
         * @lifecycle viewmodel
         */
        onInitTextAndData(args) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> AccountInformationViewModel::onInitTextAndData()");

            if(!this.designMode) { // app mode
                args.dataKeys.push(this.importBusinessData(this.tableType())
                    .then(data => {
                        this.initItemData(data);
                    }));
                args.textKeys.push([
                    "DataContent_Dataset_template_ADA",
                    "DataContent_template_ADA",
                    "AccountBalance_template",
                    "AvailableAmount_template"
                ].map(key => this.buildGuiKey.apply(this, key.split("_"))));
            } else { // design mode
                args.dataKeys.push(
                    this.designTimeRunner.retrieveJSONData("AccountInformationData")
                    .then(data => {
                        this.tableType(data.defaultTableType);
                        if(this.tableType() === "AINStd") {
                            this.accountInformationValues = data.AINStd;
                            this.initItemData(this.accountInformationValues);
                        } else if(this.tableType() === "AINIfx") {
                            this.accountInformationValues = data.AINIfx;
                            this.initItemData(this.accountInformationValues);
                        } else if(this.tableType() === "AINPcemov") {
                            this.accountInformationValues = data.AINPcemov;
                            this.initItemData(this.accountInformationValues);
                        } else {
                            this.accountInformationAINPcebalValue = data.AINPcebal;
                            this.initItemData(this.accountInformationAINPcebalValue);
                        }
                    })
                );
            }

            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< AccountInformationViewModel::onInitTextAndData");
            return super.onInitTextAndData(args);
        }

        /**
         * Overrides {@link Wincor.UI.Content.ListViewModel#onDeactivated} <br>
         * Is called when this viewmodel gets deactivated during the life-cycle. <br>
         * in order to clear data list items and observables.
         * @lifecycle viewmodel
         */
        onDeactivated() {
            super.onDeactivated();
            this.accountInformationValues = null;
            this.accountInformationAINPcebalValue = null;
            this.tableType("AINStd");
        }

        /**
         * Overrides {@link Wincor.UI.Content.ListViewModel#onButtonPressed}
         * in order to handle certain commands for the accountinformation view.
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
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `> AccountInformationViewModel::onButtonPressed(${id})`);

            if(id === "BTN_SCROLL_DOWN" || id === "BTN_SCROLL_UP") { // scroll page down
                this.handleScrolling(id);
            } else {
                super.onButtonPressed(id); // call super onButtonPressed, if you like to
            }

            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< AccountInformationViewModel::onButtonPressed");
        }
    }
});
