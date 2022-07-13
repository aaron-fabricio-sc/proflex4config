/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ DepositChequesResultViewModel.js 4.3.1-210219-21-a53025e6-1a04bc7d
 */
define(["jquery", "knockout", "extensions", "ui-content", "vm/ListViewModel"], function(jQuery, ko, ext, content) {
    "use strict";
    console.log("AMD:DepositChequesResultViewModel");


    const _logger = Wincor.UI.Service.Provider.LogProvider;
    const _dataService = Wincor.UI.Service.Provider.DataService;
    const _formatService = Wincor.UI.Service.Provider.FormatService;

    const SOFTKEY = content.viewType === "softkey";
    
    const DOC_TYPE_CHEQUE = "Cheque";
    const DOC_TYPE_CREDIT_SLIP = "CreditSlip";

    const PROP_MEDIA_ON_STACKER = "PROP_MEDIA_ON_STACKER";
    const PROP_FRONT_IMAGE_PATH = "PROP_FRONT_IMAGE_PATH[idx]";
    const PROP_BACK_IMAGE_PATH = "PROP_BACK_IMAGE_PATH[idx]";

    const PROP_CHEQUE_AMOUNT = "PROP_CHEQUE_AMOUNT[idx]";
    const PROP_CHEQUE_CURRENT_CHEQUE_NO = "PROP_CHEQUE_CURRENT_CHEQUE_NO";
    const PROP_CHEQUE_ACCEPTED = "PROP_CHEQUE_ACCEPTED[idx]";
    const PROP_CHEQUE_SCORE_OCR = "PROP_CHEQUE_SCORE_OCR[idx]"; // Property is a BOOL in business logic
    const PROP_CHEQUE_SCORE_MICR = "PROP_CHEQUE_SCORE_MICR[idx]"; // Property is a BOOL in business logic
    const PROP_CHEQUE_HAS_SHOWN = "PROP_CHEQUE_HAS_SHOWN[idx]";
    const PROP_CHEQUE_DOCUMENT_TYPE = "PROP_CHEQUE_DOCUMENT_TYPE[idx]" // either "Cheque" or "CreditSlip"
    const PROP_CHEQUE_START_INDEX = "PROP_CHEQUE_START_INDEX"; // a number where the cheque starting index begins, usually we begin at zero

    const PROP_MIN_AMOUNT_ACT = "PROP_MIN_AMOUNT_ACT";
    const PROP_MAX_AMOUNT_ACT = "PROP_MAX_AMOUNT_ACT";

    /**
     * The unformatted number property.
     * @type {string}
     * @const
     * @private
     */
    const PROP_UNFORMATTED_VALUE = "PROP_UNFORMATTED_VALUE";

    const CMD_CHANGE_AMOUNT = "CHANGE_AMOUNT";
    const CMD_ACCEPT = "ACCEPT";
    const CMD_DECLINE = "DECLINE";
    const CMD_INSTRUCTION = "INSTRUCTION";
    const CMD_SCROLL_DOWN = "BTN_SCROLL_DOWN";
    const CMD_SCROLL_UP = "BTN_SCROLL_UP";
    const CMD_FIRST_ITEM = "BTN_FIRST_ITEM";
    const CMD_LAST_ITEM = "BTN_LAST_ITEM";
    const CMD_ZOOM = "ZOOM_IN_OUT";
    const CMD_FLIP_IMAGE = "FLIP_IMAGE";


    let GUI_TEXT_KEY_TOTAL_AMOUNT_ADA = "";


    const designMode = Wincor.UI.Content.designMode;
    
    /**
     * Class for one cheque.
     * @param {number} idx Index for new cheque object.
     * @class
     */
    class ChequeItem {
        constructor(idx) {
            const self = this;
            
            /**
             * Index of the cheque - starting at zero.
             * @type {number}
             */
            this.index = idx;
    
            /**
             * Property index of the cheque - PROP_CURRENT_CHEQUE_NO[n].
             * @type {string}
             */
            this.propIndex = "";
    
            /**
             * Full path of the current image file of this cheque.
             * @type {function}
             */
            this.imagePath = ko.observable("");
    
            /**
             * Full path of the front image file of this cheque.
             * @type {string}
             */
            this.frontImagePath = "";
            this.propFrontImagePath = "";
        
            /**
             * Full path of the back image file of this cheque.
             * @type {string}
             */
            this.backImagePath = "";
            this.propBackImagePath = "";
    
            this.amount = ko.observable();  // do not set initial amount here - is done in initItemData
            this.propAmount = "";
    
            this.isBackImageEnabled = ko.observable(3);
    
            this.isGestureDoubleTapVisible = ko.observable(false);
            this.isGestureSwipeVerticalTurnVisible = ko.observable(false);
    
            /**
             * True, if cheque has been shown, false if not.
             */
            this.hasShown = ko.observable(false);
            this.hasShown.subscribe(newValue => {
                if(!designMode && newValue === true) {
                    _dataService.setValues(PROP_CHEQUE_HAS_SHOWN.replace("idx", self.index.toString()), 1, null);
                }
            });
    
            // Accepted state
            this.isAccepted = ko.observable(); // do not set initial state here - is done in initItemData
            this.propAccepted = "";
    
            // Declined state
            this.isDeclinedByUser = ko.observable(false);
            this.isDeclined = ko.pureComputed(() => {
                // triggers...
                self.hasShown();
                self.isAccepted();
                return self.isDeclinedByUser() || !(self.amount() > 0 || self.scoreOCR || self.scoreMICR) || (!self.scoreOCR && !self.scoreMICR);
            });
    
            // Doc type "Cheque" or "CreditSlip"
            this.docType = ko.observable("");
            this.propDocType = "";
            
            // OCR and MICR scores:
            this.scoreOCR = false;
            this.propOCR = "";
    
            this.scoreMICR = false;
            this.propMICR = "";
    
            this.isAcceptEnabled = ko.pureComputed(() => {
                return self.docType() === DOC_TYPE_CHEQUE && !self.isAccepted() && self.amount() && (self.scoreOCR || self.scoreMICR) ? 0 : 2;
            });
        
            this.isDeclineEnabled = ko.pureComputed(() => {
                return self.docType() === DOC_TYPE_CHEQUE && self.isAccepted() ? 0 : 2;
            });
    
            this.isChgAmountEnabled = ko.pureComputed(() => {
                self.isAccepted(); // trigger
                return self.docType() === DOC_TYPE_CHEQUE && (self.scoreOCR || self.scoreMICR) ? 0 : 2;
            });
    
            /**
             * Stringifies this cheque item data.
             * @returns {*}
             */
            this.toString = function() {
                return JSON.stringify({
                    index: this.index,
                    frontImagePath: this.frontImagePath,
                    backImagePath: this.backImagePath,
                    amount: this.amount(),
                    hasShown: this.hasShown(),
                    isAccepted: this.isAccepted(),
                    isDeclined: this.isDeclined(),
                    isDeclinedByUser: this.isDeclinedByUser(),
                    scoreOCR: this.scoreOCR,
                    scoreMICR: this.scoreMICR,
                    isAcceptEnabled: this.isAcceptEnabled(),
                    isDeclineEnabled: this.isDeclineEnabled(),
                    isChgAmountEnabled: this.isChgAmountEnabled(),
                    docType: this.docType()
                });
            };
        }
    }

    /**
     * DepositChequesAnimationsViewModel provides functionality for cheque deposit transactions.
     * <p>
     * The cheque list is represented by the inherited {@link Wincor.UI.Content.ListViewModel#dataList} object.
     * A view can show all cheques (usually touch layout) or only one cheque at a time beginning at index 0 (usually softkey layout).
     * Each cheque item is represented by the ChequeItem class which contains all necessary bindable properties to make each cheque item
     * controllable individually.
     * </p>
     * DepositChequesResultViewModel deriving from {@link Wincor.UI.Content.ListViewModel} class.
     * @class
     * @since 1.0/10
     */
    Wincor.UI.Content.DepositChequesResultViewModel = class DepositChequesResultViewModel extends Wincor.UI.Content.ListViewModel {

        /**
         * Object that encapsulates current deposit result information
         * @enum
         */
        transactionData = {
            /**
             * The cheque items array
             * @type {Array<ChequeItem>}
             */
            chequeItems: [],
            /**
             * The number of inserted media
             * @type {number}
             */
            mediaCount: 0,
            /**
             * The index where to start with the cheques properties
             * @type {number}
             */
            startIndex: 0,
            /**
             * Minimum amount
             * @type {number}
             */
            minAmount: 0,
            /**
             * Maximum amount
             * @type {number}
             */
            maxAmount: 0,
            /**
             * Total amount
             * @type {number}
             */
            totalAmount: 0,
            /**
             * @type {String}
             */
            instructionText: "",
            /**
             * @type {String}
             */
            totalAmountText: "",
            /**
             * Flag telling whether items should get auto-accepted
             * @type {boolean}
             */
            isAutoAccept: false,
            /**
             * Tells whether to check if at least one cheque has been accepted
             * @type {boolean}
             */
            isCheckForAcceptOneCheque: true,
        };

        module = null;

        /**
         * The max cheques which are currently on stacker.
         * @type {function | ko.observable}
         * @bindable
         */
        maxChequeNo = null;

        /**
         * The total cheque amount as a formatted string value.
         * @type {function | ko.observable}
         * @bindable
         */
        totalAmount = null;

        /**
         * The current cheque index from which a button (accept, change amount, etc.) has been pressed.
         * @type {number}
         */
        currentIdx = 0;

        /**
         * The index of the cheque which is currently visible in focus - this is important for the TOUCH based view
         * where the cheques can be swiped.
         * @type {number}
         */
        currentPresentIdx = 0;

        /**
         * Takes the current cheque item depended on the {@link Wincor.UI.Content.DepositChequesResultViewModel#currentIdx}
         * @type {ChequeItem}
         */
        currentItem = null;

        /**
         * Shows whether the current cheque is in zoom state or not.
         * Possible values are "out" or an empty string.
         * @type {function | ko.observable}
         * @bindable
         */
        documentZoomState = null;

        /**
         * Initializes this view model.
         * @param {Object} module the depositchequesresult code-behind module
         * @lifecycle viewmodel
         */
        constructor(module) {
            super();
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> DepositChequesResultViewModel");
            this.module = module;
            if(!this.module) {
                _logger.error("This view model needs the corresponding code-behind module. Please deliver with '... new DepositChequesResultViewModel(this);'");
            }
            this.maxChequeNo = ko.observable(this.transactionData.mediaCount);
            this.totalAmount = ko.observable("");
            this.currentIdx = 0;
            this.currentPresentIdx = 0;
            this.currentItem = {};
            this.documentZoomState = ko.observable("out");
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< DepositChequesResultViewModel");
        }
        
        /**
         * Handler function to remove/clear members.
         * Overridden to clear data list items, flags and counter.
         * @lifecycle viewmodel
         */
        onDeactivated() {
            super.onDeactivated();
            this.transactionData.chequeItems = [];
            this.transactionData.mediaCount = 0;
            this.transactionData.startIndex = 0;
            this.transactionData.minAmount = 0;
            this.transactionData.maxAmount = 0;
            this.transactionData.totalAmount = 0;
            this.transactionData.instructionText = "";
            this.transactionData.totalAmountText = "";
            this.currentIdx = 0;
            this.currentPresentIdx = 0;
            this.currentItem = null;
            this.maxChequeNo(this.transactionData.mediaCount);
            this.totalAmount("");
            this.documentZoomState("out");
        }

        /**
         * Cleaning up members which can't be cleared in onDeactivate.
         * @lifecycle viewmodel
         */
        clean() {
            _logger.log(_logger.LOG_INOUT, "> DepositChequesResultViewModel::clean()");
            this.module = null;
            super.clean();
            _logger.log(_logger.LOG_INOUT, "< DepositChequesResultViewModel::clean");
        }

        /**
         * This method usually initializes data before text and/or business data are retrieved, such as e.g. viewkey configuration.
         * Overrides {@link Wincor.UI.Content.BaseViewModel#observe}
         * @param {String} observableAreaId the area id to observe via knockout
         * @param {Object=} visibleLimitsObject the visible limits object for the view. Usually necessary for softkey based view.<br>
         *                                      A typical visible limits object looks like: { visibleLimits: { max: 8 }}
         * @return {Object}
         * @lifecycle viewmodel
         */
        observe(observableAreaId, visibleLimitsObject) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `> DepositChequesResultViewModel::observe(observableAreaId=${observableAreaId})`);
            super.observe(observableAreaId, visibleLimitsObject);
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< DepositChequesResultViewModel::observe");
            return this;
        }

        /**
         * Updates the total amount observable and infer that the instruction and ADA texts contains the variable <code>{#totalAmount#}</code>.
         * @param {boolean} [speakAda=false] speakAda do speak ADA true, else false
         */
        updateTotal(speakAda = false) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `> DepositChequesResultViewModel::updateTotal speakAda=${speakAda}`);
            if(!this.designMode) {
                // format the total amount
                _formatService.format(this.transactionData.totalAmount.toString(), "#M", formattedValue => {
                    this.totalAmount(formattedValue.result); // update observable
                    if(speakAda) {
                        this.serviceProvider.AdaService.speak(this.getLabel(GUI_TEXT_KEY_TOTAL_AMOUNT_ADA, "")(), 2, 10, () => this.notifyViewUpdated()); // speak cheque details again to inform what happened
                    }
                    _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, `. DepositChequesResultViewModel::updateTotal instructionText=${this.transactionData.instructionText}`);
                });
            } else { // design mode
                this.totalAmount((this.transactionData.totalAmount / 100).toFixed(2)); // format manually
                let newText = `${this.transactionData.instructionText}`;
                this.cmdRepos.setCmdLabel(CMD_INSTRUCTION, newText.replace("{#flexMain.totalAmount#}", this.totalAmount()));
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< DepositChequesResultViewModel::updateTotal");
        }

        /**
         * Creates and returns a new ChequeItem instance
         * @param {number} index the index of the cheque to create
         */
        createChequeItemInstance(index) {
            return new ChequeItem(index);
        }
        
        /**
         * Builds the corresponding properties for the business data.
         * @returns {Array}
         */
        buildProperties() {
            let props = [];
            for(let i = this.transactionData.startIndex; i < this.transactionData.mediaCount + this.transactionData.startIndex; i++) {
                let idxAsStr = i.toString();
                let item = this.createChequeItemInstance(i - this.transactionData.startIndex);
                item.propIndex = PROP_CHEQUE_CURRENT_CHEQUE_NO.replace("idx", idxAsStr);
                item.propFrontImagePath = PROP_FRONT_IMAGE_PATH.replace("idx", idxAsStr);
                item.propBackImagePath = PROP_BACK_IMAGE_PATH.replace("idx", idxAsStr);
                item.propAmount = PROP_CHEQUE_AMOUNT.replace("idx", idxAsStr);
                item.propAccepted = PROP_CHEQUE_ACCEPTED.replace("idx", idxAsStr);
                item.propOCR = PROP_CHEQUE_SCORE_OCR.replace("idx", idxAsStr); // boolean
                item.propMICR = PROP_CHEQUE_SCORE_MICR.replace("idx", idxAsStr); // boolean
                item.propDocType = PROP_CHEQUE_DOCUMENT_TYPE.replace("idx", idxAsStr); // string
                props.push(item.propFrontImagePath);
                props.push(item.propBackImagePath);
                props.push(item.propAmount);
                props.push(item.propOCR);
                props.push(item.propMICR);
                props.push(item.propAccepted);
                props.push(item.propDocType);
                this.transactionData.chequeItems.push(item);
            }
            return props;
        }

        /**
         * Detects whether the confirm command is allowed at this time.
         * @returns {boolean}
         */
        isConfirmAllowed() {
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `> DepositChequesResultViewModel::isConfirmAllowed`);
            let ret = true;
            if(this.transactionData.isCheckForAcceptOneCheque) {
                let allShown = true, isOnceAccepted = false;
                for(let i = this.transactionData.mediaCount - 1; i >= 0; i--) {
                    if(!this.transactionData.chequeItems[i].hasShown()) {
                        allShown = false;
                        break;
                    }
                    if(this.transactionData.chequeItems[i].isAccepted()) {
                        isOnceAccepted = true;
                    }
                }
                ret = allShown && isOnceAccepted;
            }
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `< DepositChequesResultViewModel::isConfirmAllowed returns ${ret}`);
            return ret;
        }

        /**
         * Initializes the item list for a view to present.
         * @param {object | Array} result is either the business data from the DataService or JSON data from design mode.
         */
        initItemData(result) {
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `> DepositChequesResultViewModel::initItemData result=${JSON.stringify(result)}`);

            // Please note!
            // First use-case:
            // All cheques are neutral (user can accept or decline), unless a cheque is declined, because is MICR or OCR code invalid.
            // Second use-case:
            // All cheques are accepted, unless MICR or OCR code is invalid. All other cheques must be declined - no cheque is neutral per default.
            // In such a case the business logic set the accepted flag(s) of each cheque per default, whereas all other cheques, which aren't accepted,
            // must be set declined, unless only the amount is zero (could not recognized by the OCR).
            // Furthermore the confirm button must be enabled, so the user doesn't have the need to watch all cheques listed as
            // it's usually required per convention. This brings a faster transaction flow.

            let isDesignTime = this.designMode;
            if(Object.keys(result ?? {}).length && this.transactionData.chequeItems.length === this.transactionData.mediaCount) {
                for(let i = 0; i < this.transactionData.mediaCount; i++) {
                    let item = !isDesignTime ? this.transactionData.chequeItems[i] : this.createChequeItemInstance(i);
                    let timeStamp = Date.now();
                    // Front image
                    item.frontImagePath = !isDesignTime ? result[item.propFrontImagePath] : result[i].frontImagePath;
                    if(item.frontImagePath) {
                        item.frontImagePath = item.frontImagePath.replace(/\\/g, "/"); // replace each backslash with one forward slash
                        item.frontImagePath = content.applicationMode ? `file:///${item.frontImagePath}?__cachebuster=${timeStamp + i}` : item.frontImagePath; //add file:/// in application mode, because there we work with an absolute path
                        item.imagePath(item.frontImagePath);
                    }
                    // Back image
                    item.backImagePath = !isDesignTime ? result[item.propBackImagePath] : result[i].backImagePath;
                    if(item.backImagePath) {
                        item.backImagePath = item.backImagePath.replace(/\\/g, "/"); // replace each backslash with one forward slash
                        item.backImagePath = content.applicationMode ? `file:///${item.backImagePath}?__cachebuster=${timeStamp + i}` : item.backImagePath; //add file:/// in application mode, because there we work with an absolute path
                        item.isBackImageEnabled(0);
                    }
                    // Doc type
                    let docTypeVal = !isDesignTime ? result[item.propDocType] : result[i].propDocType;
                    item.docType(docTypeVal || DOC_TYPE_CHEQUE);
                    //
                    item.scoreOCR = !isDesignTime ? this.vmHelper.convertToBoolean(result[item.propOCR]) : this.vmHelper.convertToBoolean(result[i].scoreOCR); // property is a boolean
                    item.scoreMICR = !isDesignTime ? this.vmHelper.convertToBoolean(result[item.propMICR]) : this.vmHelper.convertToBoolean(result[i].scoreMICR); // property is a boolean
                    item.amount(!isDesignTime ? this.vmHelper.convertToInt(result[item.propAmount]) : this.vmHelper.convertToInt(result[i].amount));
                    // accepted flag may be set true by business logic
                    item.isAccepted(!isDesignTime ? this.vmHelper.convertToBoolean(result[item.propAccepted]) : this.vmHelper.convertToBoolean(result[i].isAccepted)); // let also recalculate computed observables this cheque item
        
                    if(item.isAccepted()) {
                        this.transactionData.totalAmount += item.amount(); // update total amount for an accepted cheque
                        this.transactionData.isAutoAccept = true; // at least one cheque has been business logic accepted, this triggers the second approach
                    }
        
                    if(isDesignTime) {
                        this.transactionData.chequeItems.push(item);
                    }
                    _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, `. DepositChequesResultViewModel::initItemData chequeItem=${item.toString()}`);
                }
            } else {
                _logger.error(`DepositChequesResultViewModel::initItemData result data is empty or item count unequals mediaCount=${this.transactionData.mediaCount}`);
            }
            if(this.transactionData.isAutoAccept) {
                _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, `. DepositChequesResultViewModel::initItemData isAutoAccept=${this.transactionData.isAutoAccept}`);
                // in auto accept use case each cheque which isn't accepted per default is declined, unless the amount(0) could not OCR recognized
                // We only set isDeclinedByUser(true) if not accepted and amount > 0
                // neutral is, if not accepted, OCR or MICR flag(s) true
                for(let i = 0; i < this.transactionData.mediaCount; i++) {
                    let item = this.transactionData.chequeItems[i];
                    if(!item.isAccepted() && item.amount() > 0) { //
                        item.isDeclinedByUser(true); // force isDeclined computed to return true
                    }
                }
            }

            if(this.transactionData.isAutoAccept || !this.transactionData.isCheckForAcceptOneCheque) {
                this.setAllChequesShown({x: this.transactionData.mediaCount}, true); // permit to enable confirm
            }

            this.setListLen(this.transactionData.mediaCount);
            this.setListSource(this.transactionData.chequeItems);
            this.initCurrentVisibleLimits();
            if(this.transactionData.chequeItems.length > 0 && this.visibleLimits.max !== 0) {
                this.dataList.items([this.transactionData.chequeItems[0]]);
                this.updateCommandStates();
            } else {
                this.dataList.items(this.transactionData.chequeItems);
                this.updateCommandStates();
            }
            this.maxChequeNo(this.transactionData.mediaCount);
            this.initScrollbar();
            this.currentItem = this.transactionData.chequeItems[this.currentIdx];
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< DepositChequesResultViewModel::initItemData");
        }

        /**
         * This function's returned promise is pushed to args.dataKeys during onInitTextAndData to suspend lifecycle until cheque result data is available.
         * @async
         */
        async importBusinessData() {
            if(this.viewConfig.config) {
                _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `. DepositChequesResultViewModel::importBusinessData viewConf=${JSON.stringify(this.viewConfig)}`);
                if(this.viewConfig.config.checkForAcceptOneCheque !== void 0) {
                    this.transactionData.isCheckForAcceptOneCheque = this.vmHelper.convertToBoolean(this.viewConfig.config.checkForAcceptOneCheque);
                }
            }
            // build text keys
            GUI_TEXT_KEY_TOTAL_AMOUNT_ADA = this.buildGuiKey("TotalAmount", "ADA");
            let dataResult = await this.serviceProvider.DataService.getValues([PROP_MEDIA_ON_STACKER, PROP_CHEQUE_START_INDEX, PROP_MIN_AMOUNT_ACT, PROP_MAX_AMOUNT_ACT]);
            // buildProperties can only be done if mediaCount is available, therefor we have to gather it first
            this.transactionData.mediaCount = this.vmHelper.convertToInt(dataResult[PROP_MEDIA_ON_STACKER]);
            this.transactionData.startIndex = this.vmHelper.convertToInt(dataResult[PROP_CHEQUE_START_INDEX]);
            this.transactionData.minAmount = this.vmHelper.convertToInt(dataResult[PROP_MIN_AMOUNT_ACT]);
            this.transactionData.maxAmount = this.vmHelper.convertToInt(dataResult[PROP_MAX_AMOUNT_ACT]);
            _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, `. DepositChequesResultViewModel::importBusinessData mediaOnStacker=${this.transactionData.mediaCount}, startIndex=${this.transactionData.startIndex}`);
            if(this.transactionData.startIndex > 0) {
                this.transactionData.mediaCount -= this.transactionData.startIndex;
                _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, `. DepositChequesResultViewModel::importBusinessData calculated mediaCount=${this.transactionData.mediaCount} for startIndex=${this.transactionData.startIndex}`);
            }
            return await this.serviceProvider.DataService.getValues(this.buildProperties());
        }

        /**
         * Initializes the text and data.
         * This method reads the properties for <code>PROP_MEDIA_ON_STACKER, PROP_CHEQUE_START_INDEX, PROP_MIN_AMOUNT_ACT and PROP_MAX_AMOUNT_ACT</code> and
         * calls the initItemData().
         * @param {object} args will contain the promise which getting resolved when everything is prepared
         * @see {Wincor.UI.Content.BaseViewModel#onInitTextAndData}
         * @lifecycle viewmodel
         */
        onInitTextAndData(args) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> DepositChequesResultViewModel::onInitTextAndData()");
            this.setGenericListGathering(false); // ListViewModel will not gather the list data
            if(!this.designMode) {
                // use this deferred object to retrieve cheque data
                args.dataKeys.push(this.importBusinessData()
                    .then(data => {
                        try {
                            this.initItemData(data);
                        } catch(e) {
                            _logger.error(`DepositChequesResultViewModel::onInitTextAndData initItemData failed because: ${e}`);
                        }
                    }));
            } else { // design mode
                args.dataKeys.push(this.designTimeRunner.retrieveJSONData("ChequeResultData")
                    .then(data => {
                        if(data) {
                            this.transactionData.minAmount = data.minAmount;
                            this.transactionData.maxAmount = data.maxAmount;
                            this.transactionData.mediaCount = data.cheques.length;
                            try {
                                this.initItemData(data.cheques);
                            } catch(e) {
                                _logger.error(`DepositChequesResultViewModel::onInitTextAndData initItemData failed because: ${e}`);
                            }
                            this.cmdRepos.whenAvailable([CMD_INSTRUCTION]).then(() => {
                                let sub = this.cmdRepos.get(CMD_INSTRUCTION).label.subscribe(newVal => {
                                    this.transactionData.instructionText = newVal;
                                    sub.dispose(); // dispose here, otherwise this subscription would be called again on updateTotal.
                                    this.updateTotal();
                                });
                            });
                        }
                    }));
            }

            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< DepositChequesResultViewModel::onInitTextAndData");
            return super.onInitTextAndData(args);
        }

        /**
         * Is called when text retrieving is ready.
         * The method updates the total amount in the instruction.
         * @param {object=} result the result object with the text keys/value pairs
         * @lifecycle viewmodel
         */
        onTextReady(result) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> DepositChequesResultViewModel::onTextReady(...)");
            this.updateTotal();
            super.onTextReady(result);
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< DepositChequesResultViewModel::onTextReady");
        }

        /**
         * Overridden to get informed when an arbitrary view model send an event.
         * We want to get informed when the command "MAGNIFY_GLASS" has been pressed.
         * @param {string} id the event id
         * @param {object=} data the event data, usually a JSON notated object, the VM which overrides this method
         * has to know which type of event data are expected dependent by the id of the event.
         * @eventhandler
         */
        onViewModelEvent(id, data) {
            if(id === "MAGNIFY_GLASS_PRESSED" && this.module) {
                let isGlassOn = this.module.isMagnifyGlassOn();
                for(let i = 0; i < this.transactionData.mediaCount; i++) {
                    this.transactionData.chequeItems[i].isBackImageEnabled(isGlassOn && this.transactionData.chequeItems[i].backImagePath ? 0 : 3);
                }
                this.module.onMagnifyGlass(this.currentPresentIdx);
            }
        }

        /**
         * Set the cheque shown flag true for all existing cheques.
         * This method is usually called during a notification of the gesture view binding.
         * In all other cases, the method should be called manually.
         * @param {object} event JSON notated event from gesture binding.
         * @param {boolean=} initialize true if we are in initial phase, false or undefined otherwise
         */
        setAllChequesShown(event, initialize) {
            if(event) {
                // ensure leaving members -currentPresentIdx / -currentIdx at start index 0
                if(!initialize) {
                    this.currentPresentIdx = event.x - 1;
                    this.currentIdx = this.currentPresentIdx;
                }
                this.currentItem = this.transactionData.chequeItems[this.currentPresentIdx];
                if(event.x === this.transactionData.mediaCount) {
                    _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `* DepositChequesResultViewModel::setAllChequesShown data=${JSON.stringify(event)}`);
                    // only necessary to set shown flags if confirm isn't active in other case all cheques should be shown already and cheques flags were set.
                    if(!this.cmdRepos.isActive(this.STANDARD_BUTTONS.CONFIRM)) {
                        for(let i = this.transactionData.mediaCount - 1; i >= 0; i--) {
                            this.transactionData.chequeItems[i]?.hasShown(true);
                        }
                        this.updateCommandStates();
                    }
                }
            }
        }

        /**
         * Updates the button states depending on current situation.
         * The method must consider the view type in order to determine the proper command names.
         * The plain name of the current command usually 'ACCEPT', 'DECLINE' or 'CHANGE_AMOUNT' is only supported in softkey based view.
         * In touch based view the corresponding command name is dependent from the current index.
         * <b>Button IDs, their meaning and when they are enabled</b> <BR/>
         * <ul>
         *   <li>Change Amount          score_ocr || score_micr </li>
         *   <li>Accept Cheque          !accepted && amount > 0 && (score_ocr || score_micr)</li>
         *   <li>Decline Cheque         accepted </li>
         *   <li>Confirm                all_cheques_shown && totalsum > 0 </li>
         * <ul>
         * @important
         * Please note that in case the current item isn't of type "Cheque" but "CreditSlip" instead   CMD_CHANGE_AMOUNT, CMD_ACCEPT and CMD_DECLINE must all disabled
         */
        updateCommandStates() {
            if(SOFTKEY) {
                let item = this.transactionData.chequeItems[this.currentIdx];
                if(item) {
                    this.cmdRepos.whenAvailable([this.STANDARD_BUTTONS.CONFIRM, CMD_CHANGE_AMOUNT, CMD_ACCEPT, CMD_DECLINE]).then(() => {
                        const isChqDocType = item.docType() === DOC_TYPE_CHEQUE;
                        this.cmdRepos.setActive(CMD_CHANGE_AMOUNT, item.isChgAmountEnabled() === 0 && isChqDocType);
                        this.cmdRepos.setActive(CMD_ACCEPT, item.isAcceptEnabled() === 0  && isChqDocType);
                        this.cmdRepos.setActive(CMD_DECLINE, item.isAccepted()  && isChqDocType);
                        this.cmdRepos.setActive(this.STANDARD_BUTTONS.CONFIRM, this.isConfirmAllowed());
                    });
                    this.cmdRepos.whenAvailable([CMD_FLIP_IMAGE]).then(() => {
                        this.cmdRepos.setActive(CMD_FLIP_IMAGE, item.isBackImageEnabled() === 0);
                    });
                    this.cmdRepos.whenAvailable([CMD_ZOOM]).then(() => {
                        this.cmdRepos.setActive(CMD_ZOOM, item.isBackImageEnabled() === 0 || item.frontImagePath);
                    });
                } else {
                    _logger.error(`Wrong cheque index, no item available for index=${this.currentIdx}`);
                }
            } else {
                this.cmdRepos.whenAvailable([this.STANDARD_BUTTONS.CONFIRM]).then(() => this.cmdRepos.setActive(this.STANDARD_BUTTONS.CONFIRM, this.isConfirmAllowed()));
            }
        }

        /**
         * Handles the scrolling part when command UP/DOWN is occurred.
         * @param {string} id must either 'BTN_SCROLL_DOWN' or 'BTN_SCROLL_UP'
         */
        handleScrolling(id) {
            super.handleScrolling(id);
            // usually the following commands occur on softkey layout only
            switch(id) {
                case CMD_SCROLL_DOWN:
                case CMD_LAST_ITEM:
                    this.module.onNextCheque();
                    break;
                case CMD_SCROLL_UP:
                case CMD_FIRST_ITEM:
                    this.module.onPreviousCheque();
                    break;
                default:
            }
            this.currentIdx = this.vmHelper.convertToInt(this.dataList.items()[0].index);
            this.currentPresentIdx = this.currentIdx;
            this.currentItem = this.transactionData.chequeItems[this.currentIdx];
            this.updateCommandStates();
        }

        /**
         * Overridden to handle certain commands for cheque verifying.
         * <p>
         * Handles on button pressed actions:<br>
         * <ul>
         *     <li>ACCEPT</li>
         *     <li>DECLINE</li>
         *     <li>BTN_SCROLL_UP</li>
         *     <li>BTN_SCROLL_DOWN</li>
         *     <li>BTN_FIRST_ITEM</li>
         *     <li>BTN_LAST_ITEM</li>
         *     <li>ZOOM_IN_OUT</li>
         *     <li>FLIP_IMAGE</li>
         *     <li>CHANGE_AMOUNT</li>
         * </ul>
         * </p>
         * @param {String} id the command id such as 'CHANGE_AMOUNT', etc.
         * @param {Number | String} index the index of the current cheque in particular for touch based views
         * @eventhandler
         */
        onButtonPressed(id, index) {
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `> DepositChequesResultViewModel::onButtonPressed id=${id}, index=${index}`);
            // usually the -index is only valid when it's the touched based view, for softkey variant the -currentIdx is set by handleScrolling()
            if(index !== void 0 && index !== null && index !== "" && !isNaN(index)) {
                this.currentIdx = this.vmHelper.convertToInt(index);
            }
            this.currentItem = this.transactionData.chequeItems[this.currentIdx];
            this.currentPresentIdx = this.currentIdx;
            switch(id) {
                case CMD_ACCEPT:
                    this.currentItem.isDeclinedByUser(false);
                    this.currentItem.isAccepted(true);
                    this.transactionData.totalAmount += this.currentItem.amount();
                    this.updateTotal(/*speakAda=*/true);
                    if(!this.designMode) {
                        _dataService.setValues(this.currentItem.propAccepted, 1);
                    }
                    this.updateCommandStates();
                    break;

                case CMD_DECLINE:
                    this.currentItem.isDeclinedByUser(true);
                    // decrease only if accepted before already
                    if(this.currentItem.isAccepted()) {
                        this.transactionData.totalAmount -= this.currentItem.amount();
                    }
                    this.currentItem.isAccepted(false);
                    this.updateTotal(/*speakAda=*/true);
                    if(!this.designMode) {
                        _dataService.setValues(this.currentItem.propAccepted, 0);
                    }
                    this.updateCommandStates();
                    break;

                case CMD_CHANGE_AMOUNT:
                    let options = {
                        type: "AMOUNT_ENTRY_POPUP",
                        config: {
                            "preValue": "",
                            "placeHolder": this.currentItem.amount(),
                            "decimal": true,
                            "minAmount": this.transactionData.minAmount,
                            "maxAmount": this.transactionData.maxAmount,
                            "multiplier": 1,
                            "formatOption": "#M",
                            "clearByCorrect": true,
                            "fromChequeVM": this.designMode
                        },
                        result: {},
                        onCompositionComplete: () => {
                            this.module.chequeChangeAmount(this.currentIdx);
                        },
                        onContinue: () => {
                            //do not use 'if (this.result.amount) {...}' because 0 might be valid. Nevertheless it's the task of the Popup to prohibit any unwanted amount.
                            if (options.result.id !== this.STANDARD_BUTTONS.CANCEL && options.result.amount !== null && options.result.amount !== void 0) {
                                // auto accept the cheque since the user changed the amount and so he usually desires to accept it AND
                                // we reduce one more click which was necessary in the past
                                if(this.currentItem.isAccepted()) { // only if the cheque is already accepted we have to subtract the old amount
                                    this.transactionData.totalAmount -= this.currentItem.amount();
                                }
                                this.currentItem.amount(options.result.amount); // update current cheque amount
                                this.transactionData.totalAmount += this.currentItem.amount();
                                this.currentItem.isDeclinedByUser(false);
                                this.currentItem.isAccepted(true);
                                this.updateTotal(/*speakAda=*/true);
                                if(!this.designMode) {
                                    _dataService.setValues([PROP_UNFORMATTED_VALUE, this.currentItem.propAccepted], [this.currentItem.amount(), 1]);
                                }
                                this.updateCommandStates();
                            }
                            _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, `* DepositChequesResultViewModel.onContinue() currentItem=${this.currentItem.toString()}`);
                        }};

                    _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, `* DepositChequesResultViewModel::onButtonPressed(before Popup), currentItem=${this.currentItem.toString()}`);

                    this.showPopupMessage("amountentrypopup.component.html",
                        options, success => {
                        if(success) {
                            _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, `* DepositChequesResultViewModel  - successfully loaded popup, result=${this.currentItem.toString()}`);
                        }
                        else {
                            _logger.error("* DepositChequesResultViewModel - error loading popup");
                        }
                    });
                    break;

                case CMD_ZOOM:
                    if(this.module) {
                        this.module.zoomToggle({ type: "tap" });
                    }
                    break;

                case CMD_FLIP_IMAGE:
                    if(this.currentItem.isBackImageEnabled() === 0) {
                        let path = this.currentItem.imagePath() === this.currentItem.frontImagePath ? this.currentItem.backImagePath : this.currentItem.frontImagePath;
                        if(this.module) {
                            if(SOFTKEY) {
                                this.module.onTurnCheque({type: "panend"}, this.currentPresentIdx);
                            } else {
                                this.module.onFlipImage(this.currentPresentIdx);
                            }
                        }
                        this.currentItem.imagePath(path);
                    }
                    break;

                default:
                    super.onButtonPressed(id);
                    break;
            }

            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< DepositChequesResultViewModel::onButtonPressed");
        }
    }
});


