/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ DepositResultViewModel.js 4.3.1-210127-21-34ae33df-1a04bc7d

*/
define(["knockout", "extensions", "vm-container", "vm-util/ViewModelHelper", "vm/ListViewModel"], function(ko, ext, container, viewModelHelper) {
    "use strict";
    console.log("AMD:DepositResultViewModel");

    const _logger = Wincor.UI.Service.Provider.LogProvider;
    const _dataService = Wincor.UI.Service.Provider.DataService;

    const PROP_DEPOSIT_RESULT = "PROP_DEPOSIT_RESULT";

    /**
     * DenomItem
     * @param {Number} type
     * @param {Number} value
     * @param {String} currency
     * @param {Number} level
     * @param {Number} exponent
     * @constructor
     */
    let DenomItem = function(type, value, currency, level, exponent) {
        /**
         * The item type 0: note, 1: coin
         * @type {Number}
         * @public
         */
        this.type = type;

        /**
         * The item exponent e.g. -2.
         * @type {Number}
         * @public
         */
        this.exponent = exponent;

        /**
         * The item value in smallest unit.
         * @type {Number}
         * @public
         */
        this.value = value;

        /**
         * The item value for ADA which is calculated by each exponent.
         * 100cent -> 1EUR if exp=-2
         * @type {function}
         * @public
         */
        this.valueAda = viewModelHelper.convertByExponent(value, exponent);

        /**
         * The item currency as ISO code.
         * @type {String}
         * @public
         */
        this.currency = currency;

        /**
         * The item level L2, L3, L4.
         * @type {Number}
         * @public
         */
        this.level = level;
    };

    /**
     * DenomData
     * @constructor
     */
    let DenomData = function() {
        this.itemInfo = new DenomItem(0, 0, "", 4, -2);
        this.itemList = [];
        this.count = 0;

        /**
         * The row sum as an integer.
         * @type {Number}
         */
        this.sumAsInt = 0;
    };

    /**
     * This viewmodel is used to display data of deposited items.
     * <p>
     * The note/coin list is represented by the inherited {@link Wincor.UI.Content.ListViewModel#dataList} object.
     * Each item is represented by the Item class which contains all necessary bindable properties.
     * </p>
     * DepositResultViewModel deriving from {@link Wincor.UI.Content.ListViewModel} class.
     * @class
     * @since 1.0/00
     */
    Wincor.UI.Content.DepositResultViewModel = class DepositResultViewModel extends Wincor.UI.Content.ListViewModel {

        /**
         * The total data are represented by an array with objects.
         * Each object contains a pair of a total number and the currency as a ko.observable.
         * @default ko.observableArray([{ total: 0, currency: ko.observable("")}])
         * @type {ko.observableArray | function}
         * @bindable
         */
        totalData = null;

        /**
         * A flag which tells whether this is a mixed currency deposit or not.
         * @type {ko.observable}
         * @bindable
         */
        isMixedCurrency = ko.observable(false);

        /**
         * Takes the level 2 amount value.
         * @type {number}
         */
        l2BoxValue = 0;

        /**
         * The list of current denomination data items
         * @type {Array.<DenomData>}
         */
        sourceDataList = [];

        /**
         * Initializes this view model.
         * @lifecycle viewmodel
         */
        constructor() {
            super();
            this.totalData = ko.observableArray([
                { total: ko.observable(0), currency: ko.observable("")}
            ]);
            this.isMixedCurrency = ko.observable(false);
            this.l2BoxValue = 0;
            this.sourceDataList = [];
        }
        
        /**
         * Handler function to remove/clear members.
         * Overridden to clear data list items, flags and counter.
         * @lifecycle viewmodel
         */
        onDeactivated() {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> DepositResultViewModel::onDeactivated()");
            super.onDeactivated();
            if(this.totalData !== null) {
                this.sourceDataList.length = 0;
                this.totalData().forEach(t => {
                    t.total(0);
                    t.currency("");
                });
                this.isMixedCurrency(false);
                this.l2BoxValue = 0;
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< DepositResultViewModel::onDeactivated");
        }

        /**
         * Cleaning up members which can't be cleared in onDeactivate.
         * @lifecycle viewmodel
         */
        clean() {
            _logger.log(_logger.LOG_INOUT, "> DepositResultViewModel::clean()");
            this.totalData = this.isMixedCurrency = this.sourceDataList = null;
            super.clean();
            _logger.log(_logger.LOG_INOUT, "< DepositResultViewModel::clean");
        }
        
        /**
         * This method usually initializes data before text and/or business data are retrieved, such as e.g. viewkey configuration.
         * Overrides {@link Wincor.UI.Content.BaseViewModel#observe}
         * @param {string} observableAreaId the area id to observe via knockout
         * @param {object=} visibleLimitsObject the visible limits object for the view. Usually necessary for softkey based view.<br>
         *                                      A typical visible limits object looks like: { visibleLimits: { max: 8 }}
         * @lifecycle viewmodel
         */
        observe(observableAreaId, visibleLimitsObject) {
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `> DepositResultViewModel::observe(${observableAreaId})`);
            super.observe(observableAreaId, visibleLimitsObject);

            if(this.designMode) {
                // handle several commands...
                this.cmdRepos.whenAvailable(["CONFIRM_DEPOSIT"]).then(() => {
                    this.cmdRepos.setActive(["CONFIRM_DEPOSIT", "INSERTMOREMONEY", "PARTIAL_DEPOSIT"]);
                });
            }

            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< DepositResultViewModel::observe");
        }

        /**
         * Creates and returns a new DenomData instance object
         * @returns {DenomData}
         */
        createDenomDataInstance() {
            let denomData = new DenomData();
            denomData.itemInfo = this.createDenomItemInstance(0, 0, "", 4, -2);
            return denomData;
        }

        /**
         * Creates and returns a new DenomItem instance object
         * @param args
         * @returns {DenomItem}
         */
        createDenomItemInstance(...args) {
            return new DenomItem(...args);
        }

        /**
         * Converts / sorts denomination data
         * @param data {Array} the denomination array
         * @returns {*}
         */
        convertItemData(data) {
            // Sorting a) the data array in an ascending manner by the denomination value
            data = this.vmHelper.sortByKey(data, "value");
            // Sorting b) separate the data array and join it again if necessary
            let curr_1 = data.filter(item => {
                return data[0].currency !== item.currency;
            });
            if(curr_1.length) { // first check whether we have more than one currency
                let curr_2 = data.filter(item => {
                    return curr_1[0].currency !== item.currency;
                });
                data = curr_1.concat(curr_2);
            }
            // firstly convert potential strings into integers
            data.forEach(item => {
                item.value = parseInt(item.value);
                item.exponent = parseInt(item.exp);
                item.count = parseInt(item.count);
                item.level = parseInt(item.level);
                item.type = parseInt(item.type);
            });
            // secondly merge potential level 3 item(s) to the corresponding level 4 item(s)
            for(let i = 0; i < data.length; i++) {
                if (data[i].level === 3) {
                    // find a level 4 item of the same denomination & currency and merge the count then
                    let canL4 = data.find(item => {
                        return item.value === data[i].value && item.currency === data[i].currency && item.level === 4;
                    });
                    if(canL4) {
                        canL4.count += data[i].count; // merge count of level 3 to level 4
                        data.splice(i, 1); // remove the L3
                    }
                }
            }
            return data;
        }

        /**
         * Initializes the item list for a view to present.
         * @param data {Array} the denomination array
         * @param totalData {Array} the totals array
         */
        initItemData(data, totalData) {
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `> DepositResultViewModel::initItemData data=${JSON.stringify(data)}, totalData=${JSON.stringify(totalData)}`);
            data = this.convertItemData(data);
            const len = data.length; // set possible new len the length of the presented list can be different from original. Depends on level 3 items.
            this.setListLen(len); // set the current length of the list before the current visible entries gets evaluated
            let currVisEntries = this.initCurrentVisibleLimits();
            // build the item list
            let itemsRaw = [];
            for(let i = 0; i < len; i++) {
                let sourceData = this.createDenomDataInstance();
                sourceData.count = data[i].count;
                sourceData.itemInfo = this.createDenomItemInstance(data[i].type, data[i].value, data[i].currency, data[i].level, data[i].exponent);
                sourceData.sumAsInt = sourceData.count * data[i].value;
                // push n items into item list
                for(let k = 0; k < data[i].count; k++) {
                    sourceData.itemList.push(this.createDenomItemInstance(data[i].type, data[i].value, data[i].currency, data[i].level, data[i].exponent));
                }
                this.sourceDataList.push(sourceData);
                // copy maximum currVisEntries entries into the list
                if(i < currVisEntries) {
                    itemsRaw.push(sourceData);
                }
            }
            this.setListSource(this.sourceDataList);
            this.dataList.items(itemsRaw);
            if(totalData.length) {
                for(let i = 0; i < totalData.length; i++) {
                    if(!this.totalData()[i]) {
                        this.totalData()[i] = {total: ko.observable(0), currency: ko.observable("")};
                    }
                    this.totalData()[i].total(totalData[i].total);
                    this.totalData()[i].currency(totalData[i].currency);
                    // lookup for L2 whether we need to trigger header box
                    this.l2BoxValue += totalData[i].L2 !== "" ? parseInt(totalData[i].L2) : 0;
                }
                this.totalData.valueHasMutated();
                this.isMixedCurrency(totalData.length > 1);
            }
            this.initScrollbar();
            // finally let the result be visible
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< DepositResultViewModel::initItemData");
        }

        /**
         * This functions returned promise is pushed to args.dataKeys during onInitTextAndData to suspend lifecycle until deposit result data is available.
         * @async
         */
        async importBusinessData() {
            let result = await _dataService.getValues(PROP_DEPOSIT_RESULT);
            let value = result[PROP_DEPOSIT_RESULT];
            try {
                _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, `* DepositResultViewModel::onInitTextAndData --> cashinRes=${value}`);
                return typeof value !== "object" ? JSON.parse(value) : value; // data.denominations, data.totals
            } catch (exception) {
                throw(`DepositResultViewModel::onInitTextAndData data service callback --> Denom result invalid ! ${exception}`);
            }
        }

        /**
         * Initializes the text and data.
         * This method reads the text for the potential level2 message and the property for <code>PROP_DEPOSIT_RESULT</code>.
         * Then the item data will be initialized.
         * @param {object} args will contain the promise which getting resolved when everything is prepared
         * @see {Wincor.UI.Content.BaseViewModel#onInitTextAndData}
         * @lifecycle viewmodel
         */
        onInitTextAndData(args) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> DepositResultViewModel::onInitTextAndData()");
            if(!this.designMode) {
                args.textKeys.push(this.buildGuiKey("Message", "L2"));
                args.textKeys.push(this.buildGuiKey("Message", "L2", "ADA"));
                args.dataKeys.push(this.importBusinessData()
                    .then(data => {
                        this.initItemData(data.denominations, data.totals);
                    }))
            } else { // design mode
                args.dataKeys.push(this.designTimeRunner.retrieveJSONData("DepositResultData")
                    .then(data => {
                        this.initItemData(data.denominations, data.totals);
                        let result = {};
                        result[`${this.buildGuiKey("Message", "L2")}`] = data.messageL2;
                        result[`${this.buildGuiKey("Message", "L2", "ADA")}`] = data.messageL2;
                        this.onTextReady(result);
                    }));
            }

            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< DepositResultViewModel::onInitTextAndData");
            return super.onInitTextAndData(args);
        }
    
        /**
         * Is called when text retrieving is ready.
         * The method sends the viewmodel event <code>EVENT_ON_MESSAGE_AVAILABLE</code>, see {@link module:ViewModelContainer}.
         * @param {Object} result Contains the key:value pairs of data previously retrieved by this view-model subclass
         * @lifecycle viewmodel
         */
        onTextReady(result) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> DepositResultViewModel::onTextReady()");
            if(this.l2BoxValue > 0) {
                container.sendViewModelEvent(container.EVENT_ON_MESSAGE_AVAILABLE, {
                    messageText: result[this.buildGuiKey("Message", "L2")],
                    messageTextAda: result[this.buildGuiKey("Message", "L2", "ADA")],
                    messageLevel: this.MESSAGE_LEVEL.ERROR
                });
            } else {
                container.sendViewModelEvent(container.EVENT_ON_BEFORE_CLEAN);
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< DepositResultViewModel::onTextReady");
        }
    }
});

