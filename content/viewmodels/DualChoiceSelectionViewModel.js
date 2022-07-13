/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ DualChoiceSelectionViewModel.js 4.3.1-210127-21-34ae33df-1a04bc7d
 */

define(["jquery", "knockout"], function(jQuery,  ko) {
    "use strict";

    const _logger = Wincor.UI.Service.Provider.LogProvider;

    const PROP_DUAL_SELECTION_DATA = "PROP_SELECTION_GROUPS";

    /**
     * The DualChoiceSelectionViewModel provides functionality for the classic checkbox button control.
     * <p>
     * The retrieved list of checkboxes (PROP_SELECTION_GROUPS) will be merged with the data coming from the viewkey and text configuration.
     * These properties are:<br>
     * <ul>
     * <li>id: PROP_SELECTION_GROUPS</li>
     * <li>result: PROP_SELECTION_GROUPS</li>
     * <li>selected: PROP_SELECTION_GROUPS</li>
     * <li>state: PROP_SELECTION_GROUPS</li>
     * <li>type: PROP_SELECTION_GROUPS</li>
     * </ul>
     * </p>
     * <p>
     * <table style="width:100%;">
     *<tr>  <th>Attribute</th>        <th>“text”</th>    <th>“number”</th>    <th>“amount” </th>   <th>“radiobutton”</th>
     *<tr>  <th> id              </th><th>  x </th>      <th> x  </th>      <th>  x </th>        <th> --</th>
     *<tr>  <th> result          </th><th> -- </th>      <th> -- </th>      <th> -- </th>        <th> X </th>
     *<tr>  <th> state           </th><th>  x </th>      <th> x  </th>      <th>  x </th>        <th> X </th>
     *<tr>  <th> selected        </th><th> -- </th>      <th> -- </th>      <th> -- </th>        <th> X </th>
     * </table>
     * </p>
     *<p>
     *&nbsp;  Dependency graph for checkbox item data:                              <br>
     *&nbsp;  >--------                                                             <br>
     *&nbsp;   +-> result                                                           <br>
     *&nbsp;   +-> selected                                                         <br>
     *&nbsp;   +-> state                                                            <br>
     *</p>
     * <p>
     * The confirm state is depending on the viewkey configuration parameter 'minSelection' & 'maxSelection' and which means that
     * the confirm button state is enabled only if at least one option has been selected.
     * The default is allowing confirm in any cases.
     * </p>
     * DualChoiceSelectionViewModel deriving from {@link Wincor.UI.Content.BaseViewModel} class.
     * @class
     * @since 2.0/20
     */
    Wincor.UI.Content.DualChoiceSelectionViewModel = class DualChoiceSelectionViewModel extends Wincor.UI.Content.BaseViewModel {

        /**
         * The groups array
         * @type {Array<Object>}
         */
        groups = [];

        /**
         * Holds the items for the left column.
         * Each item in the array contains at least the following attributes:
         * <ul>
         *     <li>result:String</li>
         *     <li>selected:ko.observable</li>
         *     <li>state:ko.observable</li>
         *     <li>label:ko.observable</li>
         *     <li>exclusive:boolean</li>
         * </ul>
         * @type {function | ko.observableArray}
         * @bindable
         */
        itemsLeft = null;
    
        /**
         * Holds the items for the right column.
         * Each item in the array contains at least the following attributes:
         * <ul>
         *     <li>result:String</li>
         *     <li>selected:ko.observable</li>
         *     <li>state:ko.observable</li>
         *     <li>label:ko.observable</li>
         *     <li>exclusive:boolean</li>
         * </ul>
         * @type {function | ko.observableArray}
         * @bindable
         */
        itemsRight = null;

        /**
         * Initializes this view model.
         * @lifecycle viewmodel
         */
        constructor() {
            super();
            this.itemsLeft = ko.observableArray();
            this.itemsRight = ko.observableArray();
        }

        /**
         * Handler function to remove/clear members.
         * Overridden to clear data list items, flags and counter.
         * @lifecycle viewmodel
         */
        onDeactivated() {
            super.onDeactivated();
            this.groups.length = 0;
            this.itemsLeft.removeAll();
            this.itemsRight.removeAll();
        }
        
        /**
         * Overwrites the function {@link Wincor.UI.Content.BaseViewModel#observe}.
         * @param {String} observableAreaId the area id to observe via knockout
         * @param {Object=} visibleLimitsObject the visible limits object for the view. Usually necessary for softkey based view.<br>
         *                                      A typical visible limits object looks like: { visibleLimits: { max: 8 }}
         * @lifecycle viewmodel
         */
        observe(observableAreaId, visibleLimitsObject) {
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `> DualChoiceSelectionViewModel::observe(${observableAreaId})`);
            super.observe(observableAreaId, visibleLimitsObject);
            // delegate us to the onButtonPressed
            this.cmdRepos.whenAvailable([this.STANDARD_BUTTONS.CONFIRM]).then(() => this.cmdRepos.addDelegate({id: 'CONFIRM', delegate: this.onButtonPressed, context: this}));
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< DualChoiceSelectionViewModel::observe");
        }
    
        /**
         * Gets the selection groups array with the item arrays.
         * Usually 2 groups are available.
         * Each group in the array contains the following attributes:
         * <ul>
         *     <li>name:String</li>
         *     <li>type:String</li>
         *     <li>items:Array</li>
         *     <li>isExclusive:boolean</li>
         *     <li>state:ko.observable</li>
         *     <li>valid:ko.observable</li>
         *     <li>selectedItem:ko.observable</li>
         * </ul>
         * @return {Array<Object>} an array of groups
         */
        getGroups() {
            // for compatibility reasons we keep this function although groups is now an accessible member
            return this.groups;
        }
        
        /**
         * Deselects any item of the group with the given index.
         * @param {number} idx the group index
         */
        deselectGroup(idx) {
            this.groups[idx] && this.groups[idx].items.forEach(item => {
                item.selected(false);
            });
        }
    
        /**
         * Get the selected item of the group with the given index.
         * @param {number} idx the group index
         * @return {Object} the selected item or undefined if no selection has been done
         */
        getSelectedItem(idx) {
            return this.groups[idx] && this.groups[idx].items.find(item => {
                return item.selected();
            });
        }
    
        /**
         * Represents the group selection logic if an arbitrary item has been chosen.
         * The following attributes get updated:
         * <ul>
         *     <li>item.selected</li>
         *     <li>group.isExclusive</li>
         *     <li>group.state</li>
         *     <li>group.valid</li>
         * </ul>
         * @param {String} value the selected item value
         * @param {number} idx the current group index
         */
        groupSelection(value, idx) {
            // select current, deselect others
            value && this.groups[idx].items.forEach(item => {
                item.selected(item.result === value);
            });
            // check 4 exclusives and turn valid state
            this.groups[0].isExclusive = this.groups[1].isExclusive = false;
            this.groups[idx].items.find(item => {
                if(item.result === value) {
                    this.groups[idx].isExclusive = item.selected() && (item.exclusive === true || item.exclusive === "true");
                }
            });
            this.groups[0].valid(this.groups[0].isExclusive || this.groups[1].isExclusive || this.groups[0].selectedItem() !== "");
            this.groups[1].valid(this.groups[0].isExclusive || this.groups[1].isExclusive || this.groups[1].selectedItem() !== "");
            // if we r exclusive right now, we r valid
            if(this.groups[0].isExclusive) {
                this.groups[1].valid(true);
                this.groups[1].state(2);
                this.deselectGroup(1);
            } else {
                this.groups[1].state(0);
            }
            if(this.groups[1].isExclusive) {
                this.groups[0].valid(true);
                this.groups[0].state(2);
                this.deselectGroup(0);
            } else {
                this.groups[0].state(0);
            }
        }
    
        /**
         * Enhances the given item data object.
         * Some attributes values gets assigned with an observable.
         * @param {Object} item the item object to enhance with several attributes
         * @param {Array<Object>=} configItems the view configuration object to enhance with several attributes
         * @param {number} idx the current group index to enhance the item data for
         * @return {Object}
         */
        enhanceItemData(item, configItems, idx) {
            let initialState = parseInt(item.state !== void 0 ? item.state : this.CMDSTATE.ENABLED); // state is optional, if missing we set it enabled
            let obj = {
                result: item.result,
                selected: ko.observable(this.vmHelper.convertToBoolean(item.selected)),
                initialState: initialState,
                cmdState: ko.observable(initialState),
                exclusive: this.vmHelper.convertToBoolean(item.exclusive)
            };
            obj.state = this.createComputedObservable({
                read: () => {
                    return obj.cmdState() === 2 || this.groups[idx].state() === 2 ? 2 : 0;
                },
                write: newState => {
                    obj.cmdState(newState);
                }
            }, this);
            obj.resetState = state => {
                if(state === 0) {
                    obj.cmdState(obj.initialState);
                }
            };
            configItems && configItems.forEach(e => {
                if(obj.result === e.id) {
                    obj = Object.assign(obj, e);
                }
            });
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `. DualChoiceSelectionViewModel::enhanceItemData item=${JSON.stringify(obj)}`);
            return obj;
        }
    
        /**
         * Initializes the item list for a view to present.
         * @param {Array} groups is either the business data from the DataService or JSON data from design mode.
         * <p>
         * <table style="width:100%;">
         * <tr>  <th>Attribute</th>        <th>“text”</th>    <th>“number”</th>    <th>“amount” </th>   <th>“radiobutton”</th>
         * <tr>  <th> id              </th><th>  x </th>      <th> x  </th>      <th>  x </th>        <th> --</th>
         * <tr>  <th> result          </th><th> -- </th>      <th> -- </th>      <th> -- </th>        <th> X </th>
         * <tr>  <th> state           </th><th>  x </th>      <th> x  </th>      <th>  x </th>        <th> X </th>
         * <tr>  <th> selected        </th><th> -- </th>      <th> -- </th>      <th> -- </th>        <th> X </th>
         * </table>
         * </p>
         */
        initItemData(groups) {
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `> DualChoiceSelectionViewModel::initItemData groups=${JSON.stringify(groups)}`);
            if(groups && groups.length === 2) {
                let configLeft = this.viewConfig[`group_${groups[0].name}`] ? this.viewConfig[`group_${groups[0].name}`].items : null;
                let configRight = this.viewConfig[`group_${groups[1].name}`] ? this.viewConfig[`group_${groups[1].name}`].items : null;
                for(let i = 0; i < groups.length; i++) {
                    this.groups[i] = {type: groups[i].type, name: groups[i].name, items: [], selectedItem: ko.observable(""), state: ko.observable(0), valid: ko.observable(false), isExclusive: false};
                    this.subscribeToObservable(this.groups[i].selectedItem, val => this.groupSelection(val, i));
                    this.subscribeToObservable(this.groups[i].state, state => this.groups[i].items.forEach(item => item.resetState(state)));
                    for(let k = 0; k < groups[i].items.length; k++) {
                        let item = groups[i].items[k];
                        let obj = this.enhanceItemData(item, i === 0 ? configLeft : configRight, i);
                        this.groups[i].items.push(obj);
                    }
                }
                // check for pre selections
                let preSelectionLeft = this.getSelectedItem(0);
                let preSelectionRight = this.getSelectedItem(1);
                preSelectionLeft && this.groups[0].selectedItem(preSelectionLeft.result);
                preSelectionRight && this.groups[1].selectedItem(preSelectionRight.result);
                this.itemsLeft(this.groups[0].items);
                this.itemsRight(this.groups[1].items);
            }
            this.handleConfirmState();
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< DualChoiceSelectionViewModel::initItemData");
        }

        /**
         * This functions returned promise is pushed to args.dataKeys during onInitTextAndData to suspend lifecycle until selection data is available.
         * @async
         */
        async importBusinessData() {
            let dataResult = await this.serviceProvider.DataService.getValues(PROP_DUAL_SELECTION_DATA);
            let data = dataResult[PROP_DUAL_SELECTION_DATA];
            try {
                return typeof data !== "object" ? JSON.parse(dataResult[PROP_DUAL_SELECTION_DATA]) : data;
            } catch(e) {
                throw(`DualChoiceSelectionViewModel::importBusinessData Property=${PROP_DUAL_SELECTION_DATA} contains invalid data. Error=${e}`);
            }
        }

        /**
         * Initializes the text and data.
         * This method reads the property PROP_DUAL_SELECTION_DATA in order to retrieve the list of checkboxes to deal with.
         * The retrieved property data will be enhanced with data coming from the viewkey configuration.
         * @param {Object} args
         * @see {Wincor.UI.Content.BaseViewModel#onInitTextAndData}
         * @lifecycle viewmodel
         */
        onInitTextAndData(args) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> DualChoiceSelectionViewModel::onInitTextAndData()");
            if(!this.designMode) {
                args.dataKeys.push(this.importBusinessData()
                    .then(data => {
                        if(data) {
                            this.initItemData(data.groups);
                            this.handleConfirmState();
                        } else {
                            throw(`DualChoiceSelectionViewModel::onInitTextAndData Property=${PROP_DUAL_SELECTION_DATA} is not available!`);
                        }
                    }));
            } else { // design mode
                args.dataKeys.push(this.designTimeRunner.retrieveJSONData("DualChoiceSelectionData")
                    .then(data => {
                        this.initItemData(data.groups);
                        this.handleConfirmState();
                    }));
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< DualChoiceSelectionViewModel::onInitTextAndData");
            return super.onInitTextAndData(args);
        }
        
        /**
         * Handles the confirm view state in order to disable/enable it depending on the current selection.
         * @async
         */
        async handleConfirmState() {
            if(this.groups.length === 2) {
                await this.cmdRepos.whenAvailable([this.STANDARD_BUTTONS.CONFIRM]);
                this.cmdRepos.setActive([this.STANDARD_BUTTONS.CONFIRM], this.groups[0].valid() && this.groups[1].valid());
            }
        }

        /**
         * Handles check box specific user commands.
         * @param {String |function} id the id of a button command as a string or any item.selected observable
         * @returns {boolean}
         * @eventhandler
         */
        onButtonPressed(id) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `> DualChoiceSelectionViewModel::onButtonPressed(${id}`);
            setTimeout(this.handleConfirmState.bind(this), 1);
            if(id === this.STANDARD_BUTTONS.CONFIRM) {
                _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `. DualChoiceSelectionViewModel::onButtonPressed data to set=${JSON.stringify({"groups": this.groups}, (key, val) => {
                    if (typeof val === "function") {
                        return val();
                    }
                    return val;
                })}`);
                if(!this.designMode) {
                    const SKIP_ATTR = ["id", "exclusive", "type", "checked", "label", "state", "selectedItem", "valid", "isExclusive"];
                    this.serviceProvider.DataService.setValues(PROP_DUAL_SELECTION_DATA, JSON.stringify({"groups": this.groups}, (key, val) => {
                        if(SKIP_ATTR.indexOf(key) > -1) {
                            return void 0;
                        }
                        if(typeof val === "function") {
                            return val();
                        }
                        return val;
                    }), () => {
                        // detailed result must be a comma separated list with the selected checkbox results
                        let selectedList = [];
                        this.groups.length === 2 && this.groups.forEach(group => {
                            group.items.forEach(item => {
                                if(item.selected()) {
                                    selectedList.push(item.result);
                                }
                            });
                        });
                        super.onButtonPressed(selectedList.toString());
                    });
                } else {
                    super.onButtonPressed(id);
                }
            } else if(id === "BTN_SCROLL_DOWN" || id === "BTN_SCROLL_UP" || id === this.STANDARD_BUTTONS.CANCEL) {
                super.onButtonPressed(id);
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< DualChoiceSelectionViewModel::onButtonPressed");
            return true;
        }
    }
});
