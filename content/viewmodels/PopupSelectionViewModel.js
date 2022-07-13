/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ PopupSelectionViewModel.js 4.3.1-210127-21-34ae33df-1a04bc7d

*/
define(["knockout", "extensions", "vm/ListViewModel"], function(ko) {
    "use strict";
    console.log("AMD:PopupSelectionViewModel");

    const _logger = Wincor.UI.Service.Provider.LogProvider;
    const _viewService = Wincor.UI.Service.Provider.ViewService;
    
    const CMD_SCROLL_DOWN = "BTN_SCROLL_DOWN_POPUP";
    const CMD_SCROLL_UP = "BTN_SCROLL_UP_POPUP";
    
    /**
     * This class is used for selections within popups.
     * Support is also given for a softkey based popup due to scrolling commands through a list of items.
     * <br>
     * Deriving from {@link Wincor.UI.Content.ListViewModel} class.
     * @class
     * @since 1.2/00
     */
    Wincor.UI.Content.PopupSelectionViewModel = class PopupSelectionViewModel extends Wincor.UI.Content.ListViewModel {
    
        /**
         * The code-behind module for this popup.
         * Will be set by the {@link Wincor.UI.Content.PopupSelectionViewModel#constructor} constructor.
         * @type {Object}
         */
        module = null;
        
        /**
         * Contains the popup options
         * @type {Object}
         */
        options = {};
    
        /**
         * Contains the caption of the current selected item.
         * @type {function | ko.observable}
         * @default ''
         * @bindable
         */
        currentItemCaption = null;
    
        /**
         * Contains the index of the current selected item.
         * @type {function | ko.observable}
         * @default 0
         * @bindable
         */
        currentItemIndex = null;

        /**
         * This method usually initializes data before text and/or business data are retrieved, such as e.g. viewkey configuration.
         * Overrides {@link Wincor.UI.Content.BaseViewModel#observe}
         * @param {String} observableAreaId the area to observe via knockout
         * @param {Object=} visibleLimitsObject the visible limits object for the view. Usually necessary for softkey based view.<br>
         *                                      A typical visible limits object looks like: { visibleLimits: { max: 8 }}
         * @lifecycle viewmodel
         */
        observe(observableAreaId, visibleLimitsObject) {
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `> PopupSelectionViewModel::observe(${observableAreaId})`);
            super.observe(observableAreaId, visibleLimitsObject);
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< PopupSelectionViewModel::observe");
        }
    
        /**
         * Initializes this view model.
         * @param {Object} module the selectionpopup.component code-behind module, which should contain at least the <code>up/down</code> function.s
         * @lifecycle viewmodel
         */
        constructor(module) {
            super(module);
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> PopupSelectionViewModel::PopupSelectionViewModel()");
            this.module = module;
            this.currentItemIndex = ko.observable(0);
            this.currentItemCaption = ko.observable();
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< PopupSelectionViewModel::PopupSelectionViewModel");
        }
    
        /**
         * Initializes a scroll ability.
         * Usually the softkey variant supports up/down commands in order to navigate to the list.
         * The command states of a scroll ability with commands <i>BTN_SCROLL_DOWN_POPUP/BTN_SCROLL_UP_POPUP</i> depends on the length of the list.
         */
        initScrollbar() {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> PopupSelectionViewModel::initScrollbar()");
            super.initScrollbar();
            if(this.srcLen > 1) {
                this.cmdRepos.whenAvailable(CMD_SCROLL_UP).then(() => {
                    this.cmdRepos.setActive(CMD_SCROLL_UP, true);
                });
                this.cmdRepos.whenAvailable(CMD_SCROLL_DOWN).then(() => {
                    this.cmdRepos.setActive(CMD_SCROLL_DOWN, true);
                });
            }
            let idx = Math.floor(this.srcLen / 2);
            this.currentItemIndex(idx > 4 ? 4 : idx);
            let list = this.options.sourceList || this.dataList.items();
            this.currentItemCaption(list[this.currentItemIndex()].captions[0]());
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< PopupSelectionViewModel::initScrollbar");
        }
        
        /**
         * Initializes the text and data for this view model.
         * This method overrides the base method in order to handle the popup options which must be given by the view model
         * which is the initiator of this selection popup.
         * These popup options must contain at least the attribute <code>sourceList</code> which must contain the list items
         * according to the following standard JSON notated data:<br><br>
         * @example
         * {
         *   captions: [ko.observable(""), ...],
         *   state: 0,
         *   result: "uniqueID",
         *   icon: "myIcon.svg",
         *   prominent: ""
         * }
         * @param {Object} args the argument object with promises
         * @see {Wincor.UI.Content.BaseViewModel#onInitTextAndData}
         * @lifecycle viewmodel
         */
        onInitTextAndData(args) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> PopupSelectionViewModel::onInitTextAndData()");
            this.options = this.getPopupOptions();
            if(this.options.sourceList) {
                let list = [].concat(this.options.sourceList); // make a copy because we may reorder the list
                if(Array.isArray(list)) {
                    this.setListSource(list);
                    this.setListLen(list.length);
                    this.initCurrentVisibleLimits();
                    this.setupVisualLists();
                    this.dataList.items(list);
                    this.setGenericListGathering(false);
                    this.initScrollbar(); // don't argue super.onInitTextAndData here, cause this super.onInitTextAndData is related to onInitTextAndData, not initScrollbar
                } else {
                    _logger.error("PopupSelectionViewModel::onInitTextAndData source list is undefined or not an array!");
                }
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< PopupSelectionViewModel::onInitTextAndData");
            return super.onInitTextAndData(args);
        }
    
        /**
         * Replaces a [#POPUP_TYPE#] occurrence in a label with the concrete popup-type
         * @param key
         * @returns {string}
         * @lifecycle viewmodel
         */
        onScannedLabel(key) {
            let ret = key.replace("[#POPUP_TYPE#]", this.options.type).replace("__", "_");
            _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, `. PopupSelectionViewModel::onScannedLabel ${ret}`);
            return ret;
        }

        /**
         * Handler function to remove/clear members.
         * Overridden to clear messages.
         * Attention: Do not assign new ko.observables to any member, clear the existing ones instead only !
         * @lifecycle viewmodel
         */
        onDeactivated() {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> PopupSelectionViewModel::onDeactivated()");
            super.onDeactivated();
            this.currentItemIndex(0);
            this.currentItemCaption("");
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< PopupSelectionViewModel::onDeactivated");
        }

        /**
         * Overridden to control the popup.
         * <p>
         * Handles on button pressed actions (usually meant for softkey base popup):<br>
         * <ul>
         *     <li>BTN_SCROLL_DOWN_POPUP</li>
         *     <li>BTN_SCROLL_UP_POPUP</li>
         *     <li>CONFIRM</li>
         * </ul>
         * </p>
         * @param {String} id the id of the command that was triggered
         * @returns {boolean} true, this function has handled the button pressed.
         * @eventhandler
         */
        async onButtonPressed(id) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `> PopupSelectionViewModel::onButtonPressed(${id})`);
            if(!this.designMode) {
                _viewService.refreshTimeout();
            }
            if(id === CMD_SCROLL_DOWN) {
                let list = this.dataList.items();
                if(Array.isArray(list)) {
                    await this.module.down(this.currentItemIndex());
                    list.push(list[0]);
                    list.splice(0, 1);
                    this.dataList.items.valueHasMutated();
                    this.currentItemCaption(list[this.currentItemIndex()].captions[0]());
                    this.notifyViewUpdated();
                }
            } else if(id === CMD_SCROLL_UP) {
                let list = this.dataList.items();
                if(Array.isArray(list)) {
                    await this.module.up(this.currentItemIndex());
                    list.unshift(list[this.srcLen - 1]);
                    list.splice(list.length - 1, 1);
                    this.dataList.items.valueHasMutated();
                    this.currentItemCaption(list[this.currentItemIndex()].captions[0]());
                    this.notifyViewUpdated();
                }
            } else {
                if(this.options.result) {
                    this.options.result.id = id === this.STANDARD_BUTTONS.CONFIRM ? this.dataList.items()[this.currentItemIndex()].result : id;
                }
                if(!this.vmHelper.isPopupActive()) { // act as a display component (not opened via showPopupMessage(), but shell)?
                    super.onButtonPressed(id !== this.STANDARD_BUTTONS.CONFIRM && id !== this.STANDARD_BUTTONS.CANCEL ? id : this.dataList.items()[this.currentItemIndex()].result);
                    return;
                } else {
                    this.hidePopupMessage().then(() => {
                        if(this.options.onContinue) {
                            try {
                                this.options.onContinue(id);
                            } catch(e) {
                                _logger.error(`* PopupSelectionViewModel::onButtonPressed - error calling 'onContinue' - popupOptions: ${JSON.stringify(this.options, null, " ")}${e}`);
                            }
                        }
                    });
                }
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< PopupSelectionViewModel::onButtonPressed");
            return true;
        }
    }
});

