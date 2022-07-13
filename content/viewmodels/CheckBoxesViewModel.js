/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ CheckBoxesViewModel.js 4.3.1-210127-21-34ae33df-1a04bc7d
 */

define(["jquery", "knockout", "vm/ListViewModel"], function(jQuery,  ko) {
    "use strict";

    const _logger = Wincor.UI.Service.Provider.LogProvider;
    const _dataService = Wincor.UI.Service.Provider.DataService;
    const _validateService = Wincor.UI.Service.Provider.ValidateService;
    const _formatService = Wincor.UI.Service.Provider.FormatService;

    const PROP_CHECK_BOXES_DATA = "PROP_SELECTION_GROUPS";
    const VALIDATION_STATE = {
        VALID: "valid",
        INVALID: "invalid",
        EMPTY: "empty"
    };

    const ITEM_TYPE = {
        AMOUNT: "amount",
        NUMBER: "number",
        EMAIL: "email",
        TEXT: "text"
    };

    /**
     * The CheckBoxesViewModel provides functionality for the classic checkbox button control.
     * <p>
     * The retrieved list of checkboxes (PROP_CHECK_BOXES_DATA) will be merged with the data coming from the viewkey and text configuration.
     * These properties are:<br>
     * <ul>
     * <li>id: PROP_CHECK_BOXES_DATA</li>
     * <li>result: PROP_CHECK_BOXES_DATA</li>
     * <li>selected: PROP_CHECK_BOXES_DATA</li>
     * <li>state: PROP_CHECK_BOXES_DATA</li>
     * <li>editable</li>
     * <li>value: PROP_CHECK_BOXES_DATA</li>
     * <li>label: text</li>
     * <li>placeholder: text</li>
     * <li>helpText: text</li>
     * <li>errorTextAll</li>
     * <li>mandatory</li>
     * <li>minValue</li>
     * <li>maxValue</li>
     * <li>minLen</li>
     * <li>maxLen</li>
     * <li>multiplier</li>
     * <li>formatOption</li>
     * <li>allowLeadingZero</li>
     * <li>decimals</li>
     * <li>type</li>
     * </ul>
     * </p>
     * <p>
     * <table style="width:100%;">
     *<tr>  <th>Attribute</th>        <th>“text”</th>    <th>“number”</th>    <th>“amount” </th>   <th>“checkbox”</th>
     *<tr>  <th> id              </th><th>  x </th>      <th> x  </th>      <th>  x </th>        <th> --</th>
     *<tr>  <th> result          </th><th> -- </th>      <th> -- </th>      <th> -- </th>        <th> X </th>
     *<tr>  <th> editable        </th><th> -- </th>      <th> -- </th>      <th> -- </th>        <th> X </th>
     *<tr>  <th> type            </th><th>  x </th>      <th> x  </th>      <th>  x </th>        <th> x </th>
     *<tr>  <th> mandatory       </th><th>  x </th>      <th> x  </th>      <th>  x </th>        <th> --</th>
     *<tr>  <th> state           </th><th>  x </th>      <th> x  </th>      <th>  x </th>        <th> X </th>
     *<tr>  <th> value           </th><th>  x </th>      <th> x  </th>      <th>  x </th>        <th> --</th>
     *<tr>  <th> selected        </th><th> -- </th>      <th> -- </th>      <th> -- </th>        <th> X </th>
     *<tr>  <th> formattedValue  </th><th>  x </th>      <th> x  </th>      <th>  x </th>        <th> --</th>
     *<tr>  <th> formatOption    </th><th>  x </th>      <th> x  </th>      <th>  x </th>        <th> --</th>
     *<tr>  <th> showValue       </th><th>  x </th>      <th> x  </th>      <th>  x </th>        <th> --</th>
     *<tr>  <th> clearByCorrect  </th><th>  x </th>      <th> x  </th>      <th>  x </th>        <th> --</th>
     *<tr>  <th> maxLen          </th><th>  x </th>      <th> -- </th>      <th> -- </th>        <th> --</th>
     *<tr>  <th> minLen          </th><th>  x </th>      <th> -- </th>      <th> -- </th>        <th> --</th>
     *<tr>  <th> minValue        </th><th> -- </th>      <th> x  </th>      <th>  x </th>        <th> --</th>
     *<tr>  <th> maxValue        </th><th> -- </th>      <th> x  </th>      <th>  x </th>        <th> --</th>
     *<tr>  <th> multiplier      </th><th> -- </th>      <th> x  </th>      <th>  x </th>        <th> --</th>
     *<tr>  <th> allowLeadingZero</th><th> -- </th>      <th> x  </th>      <th> -- </th>        <th> --</th>
     *<tr>  <th> decimals        </th><th> -- </th>      <th> -- </th>      <th>  x </th>        <th> --</th>
     * </table>
     * </p>
     *<p>
     *&nbsp;  Dependency graph for checkbox item data:                              <br>
     *&nbsp;  >--------                                                             <br>
     *&nbsp;   +-> result                                                           <br>
     *&nbsp;   +-> selected                                                         <br>
     *&nbsp;   +-> state                                                            <br>
     *&nbsp;   +-> editable (undefined&nbsp;rue/false)                              <br>
     *&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;       +-> formatOption                                     <br>
     *&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;       +-> value                                            <br>
     *&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;       +-> type                                             <br>
     *&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;          +-> type=text                       <br>
     *&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;          +-> type=number                     <br>
     *&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;             +-> minLen            <br>
     *&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;             +-> maxLen            <br>
     *&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;             +-> multiplier        <br>
     *&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;             +-> allowLeadingZero  <br>
     *&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;          +-> type=amount                     <br>
     *&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;              +-> minValue          <br>
     *&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;              +-> maxValue          <br>
     *&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;              +-> multiplier        <br>
     *&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;              +-> decimals          <br>
     *&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;          +-> type=email                      <br>
     *</p>
     * <p>
     * The confirm state is depending on the viewkey configuration parameter 'allowConfirmWithoutSelection' which means that
     * the confirm button state is enabled only if at least one option has been selected.
     * The default is allowing confirm in any cases.
     * </p>
     * CheckBoxesViewModel deriving from {@link Wincor.UI.Content.ListViewModel} class.
     * @class
     * @since 1.1/01
     */
    Wincor.UI.Content.CheckBoxesViewModel = class CheckBoxesViewModel extends Wincor.UI.Content.ListViewModel {
    
        /**
         * Flag whether the confirm button state is enabled only if at least one option has been selected.
         * Default is allow confirm in all cases.
         * This flag is initial set by the appropriated view config attribute <i>allowConfirmWithoutSelection</i>.
         * @important In the case {@link Wincor.UI.Content.CheckBoxesViewModel#minSelection} || {@link Wincor.UI.Content.CheckBoxesViewModel#maxSelection} unequals -1
         * this member becomes irrelevant.
         * @type {boolean}
         * @default true
         */
        allowConfirmWithoutSelection = true;
    
        /**
         * The min selection of items to enable confirm state.
         * -1 means there is no min selection necessary.
         * @type {Number}
         * @default -1
         * @see {@link Wincor.UI.Content.CheckBoxesViewModel#allowConfirmWithoutSelection}
         */
        minSelection = -1;
    
        /**
         * The max selection of items to enable confirm state or to disable any other item instead.
         * -1 means there is no max selection limit.
         * @type {Number}
         * @default -1
         * @see {@link Wincor.UI.Content.CheckBoxesViewModel#allowConfirmWithoutSelection}
         */
        maxSelection = -1;

        /**
         * This observable stores the selected flag for the currently changed item (set in onButtonPressed):
         *  0 : not selected
         *  1 : selected
         *  2 : not set
         * @type {function | ko.observable}
         * @bindable
         */
        currentItemSelected = null;

        /**
         * The groups array
         * @type {Array<Object>}
         */
        groups = [];
        
        /**
         * Initializes this view model.
         * @lifecycle viewmodel
         */
        constructor() {
            super();
            this.confirmText = null;
            this.allowConfirmWithoutSelection = true;
            this.minSelection = this.maxSelection = -1;
            this.currentItemSelected = ko.observable(2);
        }

        /**
         * Handler function to remove/clear members.
         * Overridden to clear data list items, flags and counter.
         * @lifecycle viewmodel
         */
        onDeactivated() {
            super.onDeactivated();
            this.groups = [];
            this.allowConfirmWithoutSelection = true;
            this.minSelection = this.maxSelection = -1;
            this.currentItemSelected(2);
        }
        
        /**
         * Overwrites the function {@link Wincor.UI.Content.BaseViewModel#observe}.
         * @param {string} observableAreaId the area id to observe via knockout
         * @param {object=} visibleLimitsObject the visible limits object for the view. Usually necessary for softkey based view.<br>
         *                                      A typical visible limits object looks like: { visibleLimits: { max: 8 }}
         * @lifecycle viewmodel
         */
        observe(observableAreaId, visibleLimitsObject) {
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `> CheckBoxesViewModel::observe(${observableAreaId})`);
            super.observe(observableAreaId, visibleLimitsObject);
            // delegate us to the onButtonPressed
            this.cmdRepos.whenAvailable([this.STANDARD_BUTTONS.CONFIRM]).then(() => this.cmdRepos.addDelegate({id: 'CONFIRM', delegate: this.onButtonPressed, context: this}));
            // read view config
            if(this.viewConfig.config) {
                _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `. CheckBoxesViewModel::observe viewConf=${JSON.stringify(this.viewConfig)}`);
                // remember cmd other state
                if(this.viewConfig.config.allowConfirmWithoutSelection !== void 0) {
                    this.allowConfirmWithoutSelection = this.viewConfig.config.allowConfirmWithoutSelection;
                }
                if(this.viewConfig.config.minSelection !== void 0) {
                    this.minSelection = parseInt(this.viewConfig.config.minSelection);
                }
                if(this.viewConfig.config.maxSelection !== void 0) {
                    this.maxSelection = parseInt(this.viewConfig.config.maxSelection);
                }
                this.handleConfirmState();
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< CheckBoxesViewModel::observe");
        }
    
        /**
         * Gets the selection groups array with item arrays.
         * Usually only one group is available.
         * In a more complex scenario a view may contain more than one selection group.
         * @return {Array} an array of groups
         */
        getGroups() {
            // for compatibility reasons we keep this function although groups is now an accessible member
            return this.groups;
        }
        
        /**
         * Enhances the given item data object.
         * Attribute values may be primitive values / observables after assignment.
         * @param {Object} item the item object to enhance with several attributes
         * <ul>
         *     <li>{ko.observable.<boolean>} selected</li>
         *     <li>{ko.observable.<number>} state</li>
         *     <li>{ko.observable.<boolean>} editable</li>
         *     <li>{ko.observable.<String>} value</li>
         *     <li>{ko.observable.<String>} label</li>
         *     <li>{ko.observable.<String>} placeholder</li>
         *     <li>{ko.observable.<String>} helpText</li>
         *     <li>{ko.observable.<String>} errorTextAll</li>
         *     <li>{ko.observable.<boolean>} mandatory</li>
         *     <li>{number} minValue</li>
         *     <li>{number} maxValue</li>
         *     <li>{number} minLen</li>
         *     <li>{number} maxLen</li>
         *     <li>{number} multiplier</li>
         *     <li>{String} formatOption</li>
         *     <li>{boolean} allowLeadingZero</li>
         *     <li>{boolean} decimals</li>
         *     <li>{String} type</li>
         *     <li>{String} forbiddenPattern</li>
         * </ul>
         */
        enhanceItemData(item) {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `. CheckBoxesViewModel::enhanceItemData item=${JSON.stringify(item)}`);
            const element = "Input";
            item.selected = ko.observable(this.vmHelper.convertToBoolean(item.selected));
            item.state = ko.observable(parseInt(item.state !== void 0 ? item.state : this.CMDSTATE.ENABLED)); // state is optional, if missing we set it enabled
            item.editable = ko.observable(this.vmHelper.convertToBoolean(item.editable)); // the checkbox item has an underlying data-value that should be editable with VK
            item.value = item.value !== void 0 ? ko.observable("" + item.value) : ko.observable("");
            // getLabel can be used before resolving onInitTextAndData... all requests will be queued until initTextAndData
            item.label = this.getLabel(this.buildGuiKey(element, item.result, "Label"));
            item.placeholder = this.getLabel(this.buildGuiKey(element, item.result, "PlaceHolder"));
            item.helpText = this.getLabel(this.buildGuiKey(element, item.result, "HelpText"));
            item.errorTextAll = this.getLabel(this.buildGuiKey(element, item.result, "ErrorText"));
            item.mandatory = ko.observable(this.vmHelper.convertToBoolean(item.mandatory));
            item.minValue = item.minValue !== void 0 ? parseInt(item.minValue) : 0;
            item.maxValue = item.maxValue !== void 0 ? parseInt(item.maxValue) : 0;
            item.minLen = item.minLen !== void 0 ? parseInt(item.minLen) : 0;
            item.maxLen = item.maxLen !== void 0 ? parseInt(item.maxLen) : 0;
            item.multiplier = item.multiplier !== void 0 ? parseInt(item.multiplier) : 1;
            item.formatOption = item.formatOption !== void 0 ? item.formatOption : "";
            item.allowLeadingZero = item.allowLeadingZero !== void 0 ? this.vmHelper.convertToBoolean(item.allowLeadingZero) : true;
            item.decimals = item.decimal !== void 0 ? this.vmHelper.convertToBoolean(item.decimal) : true; // TODO: check again when returning value to bl
            item.type = item.type !== void 0 ? item.type : "";
            item.forbiddenPattern = item.forbiddenPattern !== void 0 ? item.forbiddenPattern : ""
        }
    
        /**
         * Enhances the given item data object with observables.
         * @param {Object} item the item object to enhance with several attributes as observables:
         * <ul>
         *     <li>checked</li>
         *     <li>editState</li>
         *     <li>validationState</li>
         *     <li>formattedValue</li>
         *     <li>formattedPlaceholder</li>
         * </ul>
         */
        enhanceItemDataWithComputedObservables(item) {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `. CheckBoxesViewModel::enhanceItemDataToObservable item=${JSON.stringify(item)}`);
            const DESIGN_MODE = this.designMode;
    
            item.checked = this.createComputedObservable({
                read: () => {
                    return item.selected();
                },
                write: newValue => {
                    item.selected(newValue);
                    let mod = this.viewHelper.getActiveModule();
                    if(mod && mod.onItemSelectionStateChanged) {
                        mod.onItemSelectionStateChanged(item);
                    }
                }
            }, item);
    
            item.editState = this.createComputedObservable({
                read: () => {
                    this.handleConfirmState();
                    return item.selected() && item.editable() ? 0 : 3;
                },
                write: newValue => {
                }
            }, item);
    
            ///////////////////////////// VALIDATIONS
            // add 'valid' member depending on type
            if(item.type === ITEM_TYPE.EMAIL) {
                item.validationState = this.createComputedObservable(() => {
                    return !DESIGN_MODE ? _validateService.isEmail(item.value()) ? VALIDATION_STATE.VALID : VALIDATION_STATE.INVALID : true;
                });
            } else if(item.type === ITEM_TYPE.TEXT) {
                item.validationState = this.createComputedObservable(() => {
                    let val = `${item.value()}`;
                    if (!DESIGN_MODE && !_validateService.isWithinMaxLength(val, item.maxLen)) {
                        item.value(val.substring(0, (val.length-1)));
                    }
                    return !DESIGN_MODE && _validateService.isWithinLength(item.value(), item.minLen, item.maxLen) &&
                    !_validateService.matchesForbiddenPattern(item.value(), item.forbiddenPattern) ? VALIDATION_STATE.VALID : VALIDATION_STATE.INVALID;
                });
            } else if(item.type === ITEM_TYPE.NUMBER) {
                item.validationState = this.createComputedObservable(() => {
                    let val = `${item.value()}`;
                    if(val[0] === "0" && !item.allowLeadingZero) {
                        item.value(val.substr(1));
                        return VALIDATION_STATE.INVALID;
                    }
                    if (!DESIGN_MODE && !_validateService.isWithinMaxLength(val, item.maxLen)) {
                        item.value(val.substring(0, (val.length-1)));
                        val = item.value();
                    }
                    return !DESIGN_MODE &&
                    _validateService.isNumbers(item.value()) &&
                    _validateService.isWithinLength(val, item.minLen, item.maxLen) &&
                    _validateService.isInRange(val, item.minValue || 0, item.maxValue || Infinity, item.multiplier) ? VALIDATION_STATE.VALID : VALIDATION_STATE.INVALID;
                });
            } else if(item.type === ITEM_TYPE.AMOUNT) {
                item.validationState = this.createComputedObservable(() => {
                    // because minValue / maxValue are given in smallest currency unit, we have to correct the check by exponent
                    let val = `${item.value()}`;
                    if(val[0] === "0") { // in any case
                        item.value(val.substr(1));
                        return VALIDATION_STATE.INVALID;
                    }
                    val = parseInt(item.value());
                    if(!item.decimals && val) {
                        val = val / (Math.pow(10, this.bankingContext.currencyData.exponent));
                    }
                    val = `${val}`;
                    return !DESIGN_MODE &&
                    _validateService.isNumbers(val) &&
                    _validateService.isInRange(val, item.minValue || 0, item.maxValue || Infinity, item.multiplier) ? VALIDATION_STATE.VALID : VALIDATION_STATE.INVALID;
                });
            } else {
                item.validationState = ko.observable(VALIDATION_STATE.EMPTY);
            }

            // in case of softkey: disable checkbox if it is editable (email, twitter, facebook, ...) because VK is not available
            if (this.vmContainer.viewHelper.viewType === "softkey" && item.editable() && item.validationState() === VALIDATION_STATE.INVALID) {
                item.state(this.CMDSTATE.DISABLED);
            }
    
            ///////////////////////////// FORMATTING
            if(item.formatOption && item.formatOption.toLowerCase() !== "none") {
                item.formattedValue = this.createComputedObservable(() => {
                    let val = item.value();
                    if(val === "" && item.type === ITEM_TYPE.AMOUNT) {
                        val = "0";
                    }
                    // do decimal stuff
                    if(!item.decimals) {
                        val = `${parseInt(val) / Math.pow(10, this.bankingContext.currencyData.exponent)}`;
                    }
                    let formatObject = {
                        raw: val
                    };
                    _formatService.format(formatObject, item.formatOption, null, true);
                    return `${formatObject.result}`;
                });
                item.formattedPlaceholder = this.createComputedObservable(() => {
                    let val = parseInt(item.placeholder);
                    if(isNaN(val)) {
                        return val;
                    }
                    let formatObject = {
                        raw: val
                    };
                    _formatService.format(formatObject, item.formatOption, null, true);
                    return `${formatObject.result}`;
                });
            } else {
                item.formattedValue = this.createComputedObservable(() => {
                    return item.value();
                });
                item.formattedPlaceholder = this.createComputedObservable(() => {
                    return item.placeholder();
                });
            }
        }
        
        /**
         * Initializes the item list for a view to present.
         * @param {Array} groups is either the business data from the DataService or JSON data from design mode.<p>
         * <table style="width:100%;">
         *<tr>  <th>Attribute</th>        <th>“text”</th>    <th>“number”</th>    <th>“amount” </th>   <th>“checkbox”</th>
         *<tr>  <th> id              </th><th>  x </th>      <th> x  </th>      <th>  x </th>        <th> --</th>
         *<tr>  <th> result          </th><th> -- </th>      <th> -- </th>      <th> -- </th>        <th> X </th>
         *<tr>  <th> editable        </th><th> -- </th>      <th> -- </th>      <th> -- </th>        <th> X </th>
         *<tr>  <th> type            </th><th>  x </th>      <th> x  </th>      <th>  x </th>        <th> x </th>
         *<tr>  <th> mandatory       </th><th>  x </th>      <th> x  </th>      <th>  x </th>        <th> --</th>
         *<tr>  <th> state           </th><th>  x </th>      <th> x  </th>      <th>  x </th>        <th> X </th>
         *<tr>  <th> value           </th><th>  x </th>      <th> x  </th>      <th>  x </th>        <th> --</th>
         *<tr>  <th> selected        </th><th> -- </th>      <th> -- </th>      <th> -- </th>        <th> X </th>
         *<tr>  <th> formattedValue  </th><th>  x </th>      <th> x  </th>      <th>  x </th>        <th> --</th>
         *<tr>  <th> formatOption    </th><th>  x </th>      <th> x  </th>      <th>  x </th>        <th> --</th>
         *<tr>  <th> showValue       </th><th>  x </th>      <th> x  </th>      <th>  x </th>        <th> --</th>
         *<tr>  <th> clearByCorrect  </th><th>  x </th>      <th> x  </th>      <th>  x </th>        <th> --</th>
         *<tr>  <th> maxLen          </th><th>  x </th>      <th> -- </th>      <th> -- </th>        <th> --</th>
         *<tr>  <th> minLen          </th><th>  x </th>      <th> -- </th>      <th> -- </th>        <th> --</th>
         *<tr>  <th> minValue        </th><th> -- </th>      <th> x  </th>      <th>  x </th>        <th> --</th>
         *<tr>  <th> maxValue        </th><th> -- </th>      <th> x  </th>      <th>  x </th>        <th> --</th>
         *<tr>  <th> multiplier      </th><th> -- </th>      <th> x  </th>      <th>  x </th>        <th> --</th>
         *<tr>  <th> allowLeadingZero</th><th> -- </th>      <th> x  </th>      <th> -- </th>        <th> --</th>
         *<tr>  <th> decimals        </th><th> -- </th>      <th> -- </th>      <th>  x </th>        <th> --</th>
         * </table>
         * </p>
         *<p>
         *&nbsp;  Dependency graph for checkbox item data:                              <br>
         *&nbsp;  >--------                                                             <br>
         *&nbsp;   +-> result                                                           <br>
         *&nbsp;   +-> selected                                                         <br>
         *&nbsp;   +-> state                                                            <br>
         *&nbsp;   +-> editable (undefined&nbsp;rue/false)                              <br>
         *&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;       +-> formatOption                                     <br>
         *&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;       +-> value                                            <br>
         *&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;       +-> type                                             <br>
         *&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;          +-> type=text                       <br>
         *&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;          +-> type=number                     <br>
         *&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;             +-> minLen            <br>
         *&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;             +-> maxLen            <br>
         *&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;             +-> multiplier        <br>
         *&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;             +-> allowLeadingZero  <br>
         *&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;          +-> type=amount                     <br>
         *&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;              +-> minValue          <br>
         *&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;              +-> maxValue          <br>
         *&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;              +-> multiplier        <br>
         *&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;              +-> decimals          <br>
         *&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;          +-> type=email                      <br>
         *</p>
         */
        initItemData(groups) {
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `> CheckBoxesViewModel::initItemData groups=${JSON.stringify(groups)}`);
            let config = this.viewConfig.items ? this.viewConfig.items.inputFields : null;
            if(config) {
                for(let i = 0; i < groups[0].items.length; i++) {
                    for(let k = 0; k < config.length; k++) {
                        // TODO: checkbox items do not have "id" in their spec but inputs have... for merging assume id of input config matches result of checkbox item
                        if(config[k].id === groups[0].items[i].result) {
                            groups[0].items[i] = jQuery.extend(true, {}, config[k], groups[0].items[i]);
                            _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, `CheckBoxesViewModel::initItemData data[${i}] found: ${groups[0].items[i].result} ${groups[0].items[i].value}`);
                        }
                    }
                }
            } else {
                _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, "CheckBoxesViewModel::initItemData viewKey specific config is not available");
            }
            for(let i = 0; i < groups.length; i++) {
                this.groups[i] = {type: groups[i].type, name: groups[i].name, items: []};
                for(let k = 0; k < groups[i].items.length; k++) {
                    let item = groups[i].items[k];
                    this.enhanceItemData(item);
                    this.enhanceItemDataWithComputedObservables(item);

                    this.groups[i].items.push(item);
                }
            }
            this.setElementTemplate({
                result: "ITEM_X",
                rawresult: "ITEM_X",
                selected: ko.observable(false),
                state: ko.observable(3),
                editable: ko.observable(false),
                checked: ko.observable(false),
                editState: ko.observable(3),
                value: ko.observable(""),
                minValue: 0,
                maxValue: 0,
                multiplier: 1,
                formatOption: "",
                type: "",
                validationState: ko.observable(VALIDATION_STATE.EMPTY)
            });
            this.setListLen(this.groups[0].items.length);
            this.setListSource(this.groups[0].items);
            this.filterEmptyPages(this.CMDSTATE.DISABLED); // pages with items state 2 or 3 will be filtered
            this.setupVisualLists();
            this.dataList.items(this.groups[0].items);
            this.initScrollbar();
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< CheckBoxesViewModel::initItemData");
        }

        /**
         * This functions returned promise is pushed to args.dataKeys during onInitTextAndData to suspend lifecycle until check boxes data is available.
         * @async
         */
        async importBusinessData() {
            let dataResult = await _dataService.getValues(PROP_CHECK_BOXES_DATA);
            let data = dataResult[PROP_CHECK_BOXES_DATA];
            try {
                data = typeof data !== "object" ? JSON.parse(dataResult[PROP_CHECK_BOXES_DATA]) : data;
            } catch(e) {
                throw(`CheckBoxesViewModel::importBusinessData Property=${PROP_CHECK_BOXES_DATA} contains invalid data. Error=${e}`);
            }
            if(data) {
                return data;
            } else {
                throw(`CheckBoxesViewModel::importBusinessData Property=${PROP_CHECK_BOXES_DATA} is not available!`);
            }
        }

        /**
         * Initializes the text and data.
         * This method reads the property PROP_CHECK_BOXES_DATA in order to retrieve the list of checkboxes to deal with.
         * The retrieved property data will be enhanced with data coming from the viewkey configuration.
         * @param {object} args
         * @see {Wincor.UI.Content.BaseViewModel#onInitTextAndData}
         * @lifecycle viewmodel
         */
        onInitTextAndData(args) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> CheckBoxesViewModel::onInitTextAndData()");
            this.confirmText = this.getLabel(this.buildGuiKey("ConfirmText"));
            if(!this.designMode) {
                args.dataKeys.push(this.importBusinessData()
                    .then(data => {
                        this.initItemData(data.groups);
                    }));
            } else { // design mode
                args.dataKeys.push(this.designTimeRunner.retrieveJSONData("CheckBoxesData").then(data => {
                    this.initItemData(data.groups);
                    this.allowConfirmWithoutSelection = data.allowConfirmWithoutSelection;
                    this.minSelection = data.minSelection;
                    this.maxSelection = data.maxSelection;
                    this.handleConfirmState();
                }));
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< CheckBoxesViewModel::onInitTextAndData");
            return super.onInitTextAndData(args);
        }

        /**
         * Handles the confirm view state in order to disable/enable it depending on the current selection.
         * The state ia also depending on the view config (view mapping) attribute <i>allowConfirmWithoutSelection</i> and
         * or of <i>minSelection</i> / <i>maxSelection</i> which are optional attributes.
         */
        async handleConfirmState() {
            if(this.groups.length) {
                await this.cmdRepos.whenAvailable([this.STANDARD_BUTTONS.CONFIRM]);
                let activateConfirm = this.allowConfirmWithoutSelection;
                if(!this.allowConfirmWithoutSelection || (this.minSelection !== -1 && this.maxSelection !== -1)) {
                    let selected = this.groups[0].items.filter(item => {
                        return item.selected();
                    });
                    if(selected.length) {
                        // all selected items have to be valid also!
                        if(this.minSelection === -1 && this.maxSelection === -1) {
                            activateConfirm = selected.reduce((previousValue, selectedItem) => {
                                return previousValue && (selectedItem.validationState() === "valid" || selectedItem.validationState() === "empty");
                            }, true);
                        } else { // min/max selection
                            activateConfirm = selected.length >= this.minSelection && selected.length <= this.maxSelection;
                        }
                    }
                }
                this.cmdRepos.setActive([this.STANDARD_BUTTONS.CONFIRM], activateConfirm);
            }
        }

        /**
         * Handles check box specific user commands.
         * @param {string |function} id the id of a button command as a string or any item.selected observable
         * @returns {boolean}
         * @eventhandler
         */
        onButtonPressed(id) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> CheckBoxesViewModel::onButtonPressed(" + (ko.isObservable(id) ? "a checkbox observable" : id) + ")");
            setTimeout(this.handleConfirmState.bind(this), 1);
            // handleConfirmState is also called automatically via computedObservable created in html fragment, doing so we avoid timing issues...
            // Note: If the view uses svg checkboxes it binds the command with args item.selected, so we must toggle the selected state manually.
            // If the view uses standard input element it should use the ko.checked binding and we can omit any special handling here.

            if (id.length >= 13 && id.substr(0,13) === "CHECKBOX_CMD_") {
                let selId = id.substr(13,id.length-13);
                let found = false;
                // provide the observable currentItemSelected so that the appropriate ADA_CLICKED text will be spoken
                for (let i=0; i<this.groups[0].items.length && !found; i++) {
                    if (this.groups[0].items[i].result === selId) {
                        _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `. CheckBoxesViewModel::onButtonPressed ${selId} result changed to ${this.groups[0].items[i].selected()}`);
                        this.currentItemSelected(this.groups[0].items[i].selected() ? 1 : 0);
                        found = true;
                    } else if (this.groups[0].items[i].id === selId) {
                        _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `. CheckBoxesViewModel::onButtonPressed ${selId} ID changed to ${this.groups[0].items[i].selected()}`);
                        this.currentItemSelected(this.groups[0].items[i].selected() ? 1 : 0);
                        found = true;
                    }
                }
            }

            if(ko.isObservable(id)) { // a checkbox selector as an observable?
                id(!id()); // manually toggle - check or un-check
            } else if(id === this.STANDARD_BUTTONS.CONFIRM) {
                _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `. CheckBoxesViewModel::onButtonPressed data to set=${JSON.stringify({"groups": this.groups}, (key, val) => {
                    if (typeof val === "function") {
                        return val();
                    }
                    return val;
                })}`);
                if(!this.designMode) {
                    let skipAttribs = ["type", "checked", "editable", "label", "placeholder", "helpText", "errorTextAll", "mandatory", "minValue", "maxValue", "minLen",
                        "maxLen", "multiplier", "formatOption", "allowLeadingZero", "decimals", "editState", "validationState", "formattedValue", "formattedPlaceholder", "state"];
                    _dataService.setValues(PROP_CHECK_BOXES_DATA, JSON.stringify({"groups": this.groups}, (key, val) => {
                        if (skipAttribs.indexOf(key) > -1) {
                            return void 0;
                        }
                        if(typeof val === "function") {
                            return val();
                        }
                        return val;
                    }), () => {
                        // detailed result must be a comma separated list with the selected checkbox results
                        let selectedList = [];
                        this.groups[0].items.forEach(item => {
                            if(item.selected()) {
                                selectedList.push(item.result);
                            }
                        });
                        super.onButtonPressed(selectedList.toString());
                    });
                } else {
                    super.onButtonPressed(id);
                }
                this.currentItemSelected(2);
            } else if(id === "BTN_SCROLL_DOWN" || id === "BTN_SCROLL_UP" || id === this.STANDARD_BUTTONS.CANCEL) {
                this.currentItemSelected(2);
                super.onButtonPressed(id);
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< CheckBoxesViewModel::onButtonPressed");
            return true;
        }
    }
});
