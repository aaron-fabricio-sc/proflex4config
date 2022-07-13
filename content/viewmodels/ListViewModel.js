/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ ListViewModel.js 4.3.1-210127-21-34ae33df-1a04bc7d

*/

define(["jquery", "knockout", "flexuimapping", "config/Config", "basevm"], function(jQuery, ko, uiMapping, config) {
    "use strict";
    console.log("AMD:ListViewModel");

    const _logger = Wincor.UI.Service.Provider.LogProvider;
    const _dataService = Wincor.UI.Service.Provider.DataService;

    /**
     * Property key for LISE index.
     * @type {string}
     * @const
     */
    const PROP_LISE_INDEX = "PROP_LISE_INDEX";

    const CMD_SCROLL_DOWN = "BTN_SCROLL_DOWN";
    const CMD_SCROLL_UP = "BTN_SCROLL_UP";
    const CMD_FIRST_ITEM = "BTN_FIRST_ITEM";
    const CMD_LAST_ITEM = "BTN_LAST_ITEM";
    const CMD_BACK = "BACK";

    //const SK_ORIENTATION_TOP_DOWN = "TOP_DOWN";
    const SK_ORIENTATION_BOTTOM_UP = "BOTTOM_UP";

    const SOFTKEY = config.viewType === "softkey";

    const __observable = ko.observable(""); // dummy observable to get the same reference for each use

    /**
     * A template for an data element.
     * @type {{captions: Array.<ko.observable<string>>, adaText: string, adaPost: string, state: number, result: string, icon: ko.observable<string>, rawresult: string, rawdata: Array.<ko.observable<string>>, order: number, staticpos: number, prominent: string}}
     * @const
     * @private
     */
    const _elementTemplate = {
        captions: [__observable, __observable, __observable, __observable, __observable, __observable, __observable],
        adaText: "",
        adaPost: "",
        state: 3,
        result: "",
        icon: ko.observable(""),
        rawresult: "",
        rawdata: [__observable, __observable, __observable, __observable, __observable, __observable, __observable],
        order: 999,
        staticpos: -1,
        prominent: ""
    };

    /**
     * The list viewmodel provides functionality for the majority kind of ProFlex4UI list types.
     * Usually it is used by any list presenting viewmodel.
     * <p>
     * A speciality is the handling of softkey layout specific lists.
     * Therefore several special attributes and functionality is available.
     * <br>
     * ListViewModel can be either run in a generic ({@link Wincor.UI.Content.ListViewModel#setGenericListGathering}) or individual mode.
     * The generic list mode means that LISE (list elements) is the data source, whereas the individual mode means that a derived viewmodel
     * provides its own data list source but must set the it using the {@link Wincor.UI.Content.ListViewModel#setListSource} and
     * {@link Wincor.UI.Content.ListViewModel#dataList}
     * </p>
     * HeaderViewModel deriving from {@link Wincor.UI.Content.BaseViewModel} class.
     * @class
     * @requires {@link https://jquery.com/}
     * @requires {@link http://knockoutjs.com/}
     * @requires {@link ProFlex4Op}
     * @requires {@link Config}
     * @requires {@link wn.UI.extensions}
     * @requires {@link Wincor.UI.Content.BaseViewModel}
     * @since 1.0/00
     */
    Wincor.UI.Content.ListViewModel = class ListViewModel extends Wincor.UI.Content.BaseViewModel {

        /**
         * Contains the max and orientation member.
         * @property {Object} visibleLimits
         * @property {number} visibleLimits.max
         * A mandatory value - should be set by the code-behind module.
         * Configures the maximum possible limits which are visible at a time.
         * Usually the maximum limits can be visible if no move buttons are available.
         * A value of zero means there is no limitation of the maximum amount of limits.
         * This is typically the case if the content is scrollable.
         * @property {string} visibleLimits.orientation
         * (optional) The softkey orientation (related to softkey layout only).
         * Becomes relevant only when the visual limits max attribute is < 8, which means when set to max=6 dealing with 6 Softkeys
         * only.<br>
         * Values either "BOTTOM_UP" (default) or "TOP_DOWN".<br>
         * "BOTTOM_UP": Upper softkeys are unused<br>
         * "TOP_DOWN": Lower softkeys are unused<br>
         * @example
         * {visibleLimits: {max: 8}}
         */
        visibleLimits = {
            max: 0,
            orientation: null
        };

        /**
         * The current length of the list (left, right or the main list)
         * @type {number}
         */
        currentLen = 0;

        /**
         * Length of the source list.
         * @type {number}
         */
        srcLen = 0;

        /**
         * Length of the items which are free to distribute left and right. This len may be higher than srcLen.
         * @type {number}
         */
        freeLen = 0;

        /**
         * Length equals _freeLen or srcLen. the _freeLen may be higher than srcLen
         * @type {number}
         */
        maxLen = 0;

        /**
         * Length of the items which claims a static position within the list
         * @type {number}
         */
        staticsLen = 0;

        /**
         * Current list cursor.
         * @type {number}
         */
        listCursor = 0;

        /**
         * The priorities config data.
         * @type {*}
         */
        priorities = {};

        /**
         * The main object a view can bind to.
         * It contains the main list, a list for the left side and for the right side.
         * Please note: Left & right side lists are only available if the view is a softkey base view.
         * @enum {Object}
         */
        dataList = {
            /**
             * The current item list.
             * The list count depends on {@link Wincor.UI.Content.ListViewModel#visibleLimits}.max
             * Usually this list is used in touch related views, where then containing all available items.
             * @type {function|ko.observableArray}
             * @bindable
             */
            items: null,

            /**
             * The current item list for the left side.
             * This list is filled up in softkey mode only.
             * The list count depends on {@link Wincor.UI.Content.ListViewModel#visibleLimits}.max
             * @type {function|ko.observableArray}
             * @bindable
             */
            itemsLeft: null,

            /**
             * The current item list for the right side.
             * This list is filled up in softkey mode only.
             * The list count depends on {@link Wincor.UI.Content.ListViewModel#visibleLimits}.max
             * @type {function|ko.observableArray}
             * @bindable
             */
            itemsRight: null
        };

        /**
         * A source data list.
         * @type {Array<object>}
         */
        sourceDataList = [];

        /**
         * A free data list.
         * @type {Array<Object>}
         */
        freeDataList = [];

        /**
         * A statics data list.
         * @type {Array<object>}
         */
        staticsDataList = [];

        /**
         * The current page counter.
         * Starts at zero.
         * @type {function(number)}
         * @bindable
         */
        pageCounter = null;

        /**
         * The current list page number presented starting at zero.
         * @type {number}
         */
        currentPage = 0;

        /**
         * The number of pages for the list.
         * Useful on softkey layout only.
         * @type {ko.observableArray}
         * @see {@link Wincor.UI.Content.ListViewModel#slides}
         * @bindable
         */
        pages = null;

        /**
         * The number of slides.
         * Useful on softkey layout only.
         * @type {ko.observableArray}
         * @see {@link Wincor.UI.Content.ListViewModel#pages}
         * @bindable
         */
        slides = null;

        /**
         * All pages each represented by a boolean, current page is true others false.
         * @type {Array}
         */
        pagesArray = [];

        /**
         * Delivers whether the list(s) is/are scrollable or not.
         * The scrollable depends on visibleLimits.max.
         * @type {function|ko.observable}
         * @bindable
         */
        isScrollable = null;

        /**
         * The notify counter.
         * @type {number}
         */
        notifyCount = 0;

        /**
         * Flag whether navigation has been done.
         * @type {boolean}
         */
        isNavigationDone = false;

        /**
         * Flag whether this list management handles its own list.
         * @type {boolean}
         */
        isGenericListMode = true;

        /**
         * The current template to use.
         * @type {Object}
         */
        currentTemplate = _elementTemplate;

        /**
         * Stores the id of the current selected sub function.
         * The value is undefined, if the selected function isn't a sub function.
         * @type {String}
         */
        currentBreadCrumb = void 0;
    
        /**
         * Stores the text of the current selected sub function.
         * @type {ko.observable}
         */
        currentBreadCrumbTextObservable = null;
    
        /**
         * Takes the current bread crumb list.
         * @type {Array<String>}
         */
        breadCrumbs = null;
    
        /**
         * Takes the current bread crumb list as an observable.
         * Usually contains the HTML content for all current bread crumbs.
         * @type {ko.observable}
         */
        breadCrumbsObservable = null;

        /**
         * Code-behind module for a selection view.
         * @type {*}
         */
        listSelectionModule = null;

        /**
         *
         * Initializes this view model.
         * @param {Object=} codeBehindModule the list selection code-behind module, which should contain at least the <code>openSubMenu</code> function.
         * @lifecycle viewmodel
         */
        constructor(codeBehindModule = void 0) {
            super();
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> ListViewModel");

            /**
             * Static positions map.
             * The key is the current length which depends on the given max and source length.
             * Each element represents a tuple SK:listPos.
             * @name STATIC_POS_MAP
             * @memberOf Wincor.UI.Content.ListViewModel#
             */
            this.STATIC_POS_MAP = {
                3: [{1: 0}, {2: 1}, {3: 1}, {4: 1}, {5: 2}, {6: 2}, {7: 2}, {8: 2}],
                4: [{1: 0}, {2: 1}, {3: 1}, {4: 1}, {5: 0}, {6: 1}, {7: 2}, {8: 3}],
                5: [{1: 0}, {2: 1}, {3: 2}, {4: 2}, {5: 3}, {6: 4}, {7: 4}, {8: 4}],
                6: [{1: 0}, {2: 1}, {3: 2}, {4: 2}, {5: 3}, {6: 4}, {7: 5}, {8: 5}],
                7: [{1: 0}, {2: 1}, {3: 2}, {4: 2}, {5: 3}, {6: 4}, {7: 5}, {8: 5}]
            };

            this.listSelectionModule = codeBehindModule;
            this.initHelper();
            this.dataList = {
                items: ko.observableArray(),
                itemsLeft: ko.observableArray(),
                itemsRight: ko.observableArray()
            };
            this.visibleLimits = { max: 0, leftOnly: false };
            this.pageCounter = ko.observable(this.currentPage);
            this.pages = ko.observableArray(this.pagesArray);
            this.slides = ko.observableArray(this.pagesArray);
            this.isScrollable = ko.observable(false);
            this.breadCrumbs = [];
            this.breadCrumbsObservable = ko.observable("");
            this.currentBreadCrumbTextObservable = ko.observable("");
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< ListViewModel");
        }
        
        /**
         * Handler function to remove/clear members.
         * Overridden to clear data list items, flags and counter.
         * Attention: Do not assign new ko.observables to any member, clear the existing ones instead only !
         * @lifecycle viewmodel
         */
        onDeactivated() {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> ListViewModel::onDeactivated()");
            super.onDeactivated();
            this.initHelper();
            this.dataList.items([]);
            this.dataList.itemsLeft([]);
            this.dataList.itemsRight([]);
            this.pageCounter(0);
            this.pages(this.pagesArray);
            this.slides(this.pagesArray);
            this.isScrollable(false);
            this.currentBreadCrumbTextObservable("");
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< ListViewModel::onDeactivated");
        }

        /**
         * Overridden.
         * Handler method for inherited viewmodels.
         * This method is invoked when a view model instance is used the next time after the initialization, observe and onInitTextAndData.<br>
         * Will be called before observe is called again.
         * Usually when the view key changes, but the current view will be still active, in this case (all) the appropriated
         * view model instance(s) will not be removed, but deactivated for the life cycle mode DEFAULT & STATIC.<br>
         * Will always be called when the life-cycle mode is DEFAULT, STATIC or VIEW_RELATED.<br>
         * Do not forget to call <code>super.onReactivated()</code>.
         * @lifecycle viewmodel
         */
        onReactivated() {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> ListViewModel::onReactivated()");
            // usually that call is not necessary due to onDeactivated() call does this, but in VIEW_RELATED life-cycle mode that method is skipped, but
            // this here is called so we better reset first.
            this.initHelper();
            super.onReactivated();
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< ListViewModel::onReactivated");
        }

        /**
         * Cleaning up members which can't be cleared in onDeactivate.
         * @lifecycle viewmodel
         */
        clean() {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> ListViewModel::clean()");
            this.listSelectionModule = null;
            super.clean();
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< ListViewModel::clean");
        }

        /**
         * Should be called if the base view model must be notified if the view has been changed by
         * a navigation.
         * The function ensures to notify only once if the last item has been rendered.
         * @bindable
         */
        notify() {
            this.notifyCount++;
            // Unfortunately knockout sends a notification for each rendered item in the list, which is not very convenient and
            // makes handling a bit more complicated.
            // on softkey views each list is filled up by item gaps, so we always reach notifyCount === currentLen.
            // On single list views (depositresult, accinfo, ...) are no item gap handling and the last page may show less than
            // currentLen, so we must consider this case too. Please note that for this lists the -dataList.items must be used by the
            // view instead of -dataList.itemsLeft or -dataList.itemsRight.
            if(this.isNavigationDone && (this.notifyCount === (this.currentLen - this.staticsLen) ||
                ((this.currentPage + 1) === this.pagesArray.length && this.notifyCount === this.dataList.items().length))) {
                this.notifyCount = 0; // reset
                // decouple notification from knockout call to assure observables have been updated
                window.setTimeout(this.notifyViewUpdated.bind(this, null, null, true), 1);
            }
        }

        /**
         * Sets the length of the list to handle.
         * Setting the length is necessary to calculate the current len for the visual limits.
         * @param {number} len the length of the list
         */
        setListLen(len) {
            this.srcLen = len;
            this.maxLen = len;
            this.isGenericListMode = false;
        }

        /**
         * Sets the source data list to handle.
         * The source data list should contain all items which shall be scrolled over.
         * The method sets the length of the source list too.
         * Please note that a {@link Wincor.UI.Content.ListViewModel#setListLen} invocation before will
         * be overwritten.
         * @param {Array<*>} sourceList the source list to deal with
         */
        setListSource(sourceList) {
            if(sourceList && Array.isArray(sourceList)) {
                this.sourceDataList = sourceList;
                this.freeDataList = sourceList;
                this.srcLen = sourceList.length;
                this.maxLen = this.srcLen;
                this.freeLen = this.srcLen;
                this.isGenericListMode = false;
            } else {
                _logger.error(`ListViewModel::setListSource source list is undefined ort even not an array! viewKey=${this.viewKey}`);
            }
        }

        /**
         * Creates a new template object expanded by the currentTemplate.
         * @param {string} id the result/id which will be set into the new template.
         * The result must be always unique.
         * @param {Object} currentTemplate the current template to use
         * @returns {Object} result the new template
         */
        createFromElementTemplate(id, currentTemplate) {
            const template = Object.assign({}, currentTemplate);
            template.result = id;
            template.rawresult = id;
            template.id = id;
            return template;
        }

        /**
         * Sets whether the ListViewModel should gather the list data via the {@link module:ProFlex4Op} module or not.
         * A derived class should set false before {@link Wincor.UI.Content.BaseViewModel#onInitTextAndData},
         * unless generic list gathering is desired.<br><br>
         * Usually inherited classes derived from {@link Wincor.UI.Content.ListViewModel} gather their own list
         * data and sets those list arrays by calling {@link Wincor.UI.Content.ListViewModel#setListSource} in order
         * to let {@link Wincor.UI.Content.ListViewModel} handle the scrolling of the
         * set list items via {@link Wincor.UI.Content.ListViewModel#handleScrolling}.
         * @param {boolean} isGenericListGathering if set true ListViewModel will try gather list data via the {@link module:ProFlex4Op} module, false
         * the derived class will handle this by its own.<br>
         * The default is true.<br>
         * The flag will become false by the following reasons:<br>
         * <ul>
         * <li>If a derived class has its own {@link Wincor.UI.Content.BaseViewModel#onInitTextAndData} event handler method</li>
         * and sets promise arguments into the parameter args.dataKeys array.
         * <li>If a derived class invokes {@link Wincor.UI.Content.ListViewModel#setListSource} with any data array.</li>
         * <li>If a derived class invokes {@link Wincor.UI.Content.ListViewModel#setListLen} with any data array.</li>
         * </ul>
         */
        setGenericListGathering(isGenericListGathering) {
            this.isGenericListMode = isGenericListGathering;
        }

        /**
         * This method usually initializes data before text and/or business data are retrieved, such as e.g. viewkey configuration.
         * Overrides {@link Wincor.UI.Content.BaseViewModel#observe}
         * @param {string} observableAreaId the area id to observe via knockout
         * @param {object=} visibleLimitsObject the visible limits object for the view. Usually necessary for softkey based view.<br>
         *                                      A typical visible limits object looks like: { visibleLimits: { max: 8 }, orientation: "TOP_DOWN"}
         * @lifecycle viewmodel
         */
        observe(observableAreaId, visibleLimitsObject) {
            try {
                _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `> ListViewModel::observe(${observableAreaId}, ${visibleLimitsObject ? JSON.stringify(visibleLimitsObject) : ""})`);
                super.observe(observableAreaId);
                if(visibleLimitsObject && visibleLimitsObject.visibleLimits) {
                    this.visibleLimits = jQuery.extend(true, this.visibleLimits, visibleLimitsObject.visibleLimits);
                    this.visibleLimits.orientation = visibleLimitsObject.visibleLimits.orientation || SK_ORIENTATION_BOTTOM_UP;
                }
                if(SOFTKEY && this.viewConfig.config && this.viewConfig.config.softkeys) {
                    // Please note:
                    // The 'max' config will be overwritten in the case the SOFTKEY_LIMITATION_ON_ACTIVE_DM is true and DM is active, see initCurrentVisibleLimits().
                    _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `. ListViewModel::observe viewConf=${JSON.stringify(this.viewConfig)}`);
                    // overwrite the visibleLimitsObject values, because the view config has a higher priority
                    if(this.viewConfig.config.softkeys.orientation) {
                        this.visibleLimits.orientation = this.viewConfig.config.softkeys.orientation;
                    }
                    if(this.viewConfig.config.softkeys.max) {
                        this.visibleLimits.max = parseInt(this.viewConfig.config.softkeys.max);
                    }
                    if(this.viewConfig.config.softkeys.leftOnly) {
                        this.visibleLimits.leftOnly = this.vmHelper.convertToBoolean(this.viewConfig.config.softkeys.leftOnly);
                    }
                }
                // BACK button
                this.cmdRepos.whenAvailable([CMD_BACK]).then(() => {
                    this.cmdRepos.addDelegate({id: CMD_BACK, delegate: this.onButtonPressed, context: this});
                });
                _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< ListViewModel::observe");
            } catch(e) {
                _logger.error(`ListViewModel::observe No valid visible limits object argument given for viewKey=${this.viewKey}: ${e}`);
            }
        }

        /**
         * Initializes the non observables.
         */
        initHelper() {
            this.srcLen = 0;
            this.currentLen = 0;
            this.listCursor = 0;
            this.staticsLen = 0;
            this.freeLen = 0;
            this.maxLen = 0;
            this.currentPage = 0;
            this.notifyCount = 0;
            this.isNavigationDone = false;
            this.isGenericListMode = true;
            this.priorities = {};
            this.sourceDataList = [];
            this.freeDataList = [];
            this.staticsDataList = [];
            this.pagesArray = [];
            this.currentTemplate = _elementTemplate; // restore template
            this.currentBreadCrumb = void 0;
            // do not reset this.breadCrumbs history because it must be hold over several onDeactivated calls.
            // code-behind module controls it
        }

        /**
         * Initializes the current visible limits and the pages.
         * The max & min limits have to be set by the view.
         * However, the current property must calculated either.
         * @return {number} the number of current visible limits or the length of the whole list, if the current is zero.
         */
        initCurrentVisibleLimits() {
            // determine lengths
            this.freeLen = this.freeDataList.length; // second determization of the free len
            this.staticsLen = this.staticsDataList.length;
            if(this.freeLen + this.staticsLen > this.srcLen) { // -freeList maybe higher than -srcList if gaps are mixed in
                this.maxLen = this.freeLen + this.staticsLen;
            } else if(this.staticsLen === 0 && this.freeLen > 0 && this.freeLen < this.srcLen) {
                this.maxLen = this.freeLen;
            } else {
                this.maxLen = this.srcLen;
            }
            let lim = this.visibleLimits;
            if(SOFTKEY) {
                if(!lim.leftOnly) {
                    if(lim.max === 8 || lim.max === 6 || lim.max === 4) {
                        // DM
                        if(config.isDirectMarketingAvailable && config.SOFTKEY_LIMITATION_ON_ACTIVE_DM && lim.max === 8) {
                            _logger.LOG_INFO && _logger.log(_logger.LOG_INFO, `. ListViewModel::initCurrentVisibleLimits visibleLimits=${JSON.stringify(this.visibleLimits)} overwritten due to DM available.`);
                            lim.max = 6;
                        }
                        // min is optional, if it is set, only 0 is accepted and currentLen will be max
                        if(this.maxLen <= lim.max || lim.min === 0) {
                            this.currentLen = !this.currentBreadCrumb ? lim.max : lim.max - 2; // in a sub menu we always need the opportunity to step back
                        } else if(lim.min === void 0 || lim.min > 0) { // backward compatibility if someone configured min > 0
                            this.currentLen = lim.max - 2;
                        }
                    } else { // fallback
                        if(lim.max < 4) {
                            _logger.error(`ListViewModel: Mismatch softkey configuration in a code-behind module for viewKey=${this.viewKey} is visibleLimits.max=${lim.max}. Supported values are: 8, 6 and 4. It seems 'leftOnly: true' is missing.`);
                        } else {
                            _logger.error(`ListViewModel: Mismatch softkey configuration in a code-behind module for viewKey=${this.viewKey} is visibleLimits.max=${lim.max}. Supported values are: 8, 6 and 4`);                        }
                        lim.max = 8;
                        this.currentLen = 6;
                    }
                } else if(lim.max === 4 || lim.max === 3 || lim.max === 2 || lim.max === 1) { // left only
                    // DM
                    if (config.isDirectMarketingAvailable && config.SOFTKEY_LIMITATION_ON_ACTIVE_DM && lim.max === 4) {
                        _logger.LOG_INFO && _logger.log(_logger.LOG_INFO, `. ListViewModel::initCurrentVisibleLimits visibleLimits=${JSON.stringify(this.visibleLimits)} overwritten due to DM available.`);
                        lim.max = 3;
                    }
                    //
                    if(this.maxLen <= lim.max) {
                        this.currentLen = !this.currentBreadCrumb ? lim.max : lim.max - 1; // in a sub menu we always need the opportunity to step back
                        this.currentLen = !this.currentBreadCrumb && this.currentLen > this.maxLen ? this.maxLen : this.currentLen; // -currentLen can never be greater than -maxLen, unless submenu is active
                    } else {
                        // UseCase: DepositChequesResult softkey: 1 cheque can be shown, lim.max is 1, if so current len is lim.max
                        // UseCase: Selection softkey: Lowest value for lim.max is usually 2 which means 1 item can be shown + the previous/next softkeys
                        this.currentLen = lim.max > 1 ? lim.max - 1 : lim.max;
                    }
                } else { // fallback
                    _logger.error(`ListViewModel: Mismatch softkey configuration in a code-behind module for viewKey=${this.viewKey} is visibleLimits.max=${lim.max}, leftOnly=true. Supported values are: 4, 3 and 2`);
                    lim.max = 4;
                    this.currentLen = 3;
                }
            }
            // final check for -currentLen which can never be 0
            this.currentLen = this.currentLen > 0 ? this.currentLen : this.maxLen;
            // check misconfiguration
            if(SOFTKEY && this.staticsLen >= this.currentLen && this.srcLen > this.currentLen) {
                _logger.error(`ListViewModel: Mismatch softkey configuration (to much static positions) - there are no free softkey positions available to scroll rest of the list. Check your 'staticpos' attribute of the 'priorities' for viewKey=${this.viewKey}`);
            } else if(SOFTKEY) {
                // initialize pages
                // each static position decreases the overall free positions by 1
                try {
                    let pagesLen = this.freeLen > 0 ? Math.ceil(this.freeLen / (this.currentLen - this.staticsLen)) :
                        Math.ceil(this.srcLen / (this.currentLen - this.staticsLen));
                    this.pagesArray = new Array(!isNaN(pagesLen) ? pagesLen : 0).fill(false);
                    if (this.pagesArray.length) {
                        this.pagesArray[0] = true; // set first page is active
                    }
                    this.pages(this.pagesArray);
                    this.slides(this.pagesArray);
                } catch(e) {
                    _logger.error(`ListViewModel: Mismatch counter setup can't calculate page number: ${e}`);
                }
            }
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `. ListViewModel::initCurrentVisibleLimits currentLen=${this.currentLen}, visibleLimits=${JSON.stringify(this.visibleLimits)}`);
            return this.currentLen;
        }

        /**
         * Initializes the scroll bar.
         * The command states of a scroll bar with command UP/DOWN depends on the length of the list.
         */
        initScrollbar() {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> ListViewModel::initScrollbar()");
            this.viewHelper.initScrollbarButtons(false, this.maxLen > this.currentLen && this.currentLen > 0, this.currentBreadCrumb !== void 0, this); // consider a possible active sub menu
            if(this.maxLen <= this.visibleLimits.max) {
                this.isScrollable(false);
                this.cmdRepos.whenAvailable([CMD_FIRST_ITEM, CMD_LAST_ITEM]).then(() => this.cmdRepos.setVisible([CMD_FIRST_ITEM, CMD_LAST_ITEM], false));
            } else { // switch on scrollable
                this.isScrollable(true);
                this.cmdRepos.whenAvailable([CMD_FIRST_ITEM, CMD_LAST_ITEM]).then(() => {
                    this.cmdRepos.setActive([CMD_FIRST_ITEM], false);
                    this.cmdRepos.setActive([CMD_LAST_ITEM], true);
                });
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< ListViewModel::initScrollbar");
        }
    
        /**
         * Check for empty pages and remove them on softkey based views only.
         * Call this method after your list has been initialized and in case your not using generic
         * list mode ({@link Wincor.UI.Content.ListViewModel#isGenericListMode})
         * after the {@link Wincor.UI.Content.ListViewModel#setListSource} has been called.
         * E.g. maxGaps=6 means that every 6 loop runs a page is ready checked.
         * If a whole page contains gaps only or the item states are hidden (or depended on -stateToCheck argument) that page is removed from list and
         * the index -i is set back to the end of the page before, so that the loop sets it to the beginning of the next page by doing i++.
         * In other words: If the gap counter is 6 and a whole page is finished looping then there is obviously a whole gap page that's going
         * to be removed from list.
         * @param {Number} [stateToCheck=3] stateToCheck values of 2 (disabled) or 3 (hidden), if 'stateToCheck' is 2,
         * then items with state=3 will also be filtered as long as they part of a whole page.
         */
        filterEmptyPages(stateToCheck = 3) {
            if(SOFTKEY) {
                this.initCurrentVisibleLimits();
                let gaps = 0;
                let maxGaps = this.currentLen;
                let page = 0;
                let enabledItem = false;
                for(let i = 0; i < this.freeDataList.length; i++) {
                    if((i % maxGaps) === 0) {
                        page++;
                        enabledItem = false;
                    }
                    let state = ko.unwrap(this.freeDataList[i].state);
                    if(this.freeDataList[i].result.indexOf("ordergap_") !== -1 || state === stateToCheck || state === 3) { // ensure hidden will always counted
                        gaps++;
                        if(!enabledItem && (gaps === maxGaps || (i + 1) === this.freeDataList.length)) { // empty page?
                            _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, `. ListViewModel::initItemData too many item gaps detected max=${maxGaps}, remove them.`);
                            // -maxGaps is a whole page, gaps may be smaller, if the page containing less than -this.currentLen
                            let erase = gaps < maxGaps ? gaps : maxGaps;
                            // We want to erase only the items which exceeds the overall remaining page
                            if(this.freeDataList.length > this.visibleLimits.max && ((this.freeDataList.length - erase) < this.visibleLimits.max)) {
                                erase = this.freeDataList.length - this.visibleLimits.max;
                            }
                            this.freeDataList.splice(i - (erase - 1), erase); // this has influence to the loop index, so we have to handle it
                            this.initCurrentVisibleLimits(); // recalculate length's
                            if((i + 1) < this.freeDataList.length || this.freeDataList.length > this.visibleLimits.max) {
                                i -= maxGaps; // set index back to the end of the page before, the next loop step will increment it so it'll become the beginning of the next page
                                page--;
                                gaps = 0;
                                maxGaps = this.currentLen; // possibly a new value e.g. 8 or 6
                            } else {
                                break; // we reach end of list
                            }
                        } else if((i % maxGaps) === 0 && enabledItem) { // a page completed?
                            gaps = 0; // reset gaps
                        }
                    } else { // page contains an enabled item
                        gaps = 0; // reset gaps
                        i += ((maxGaps * page) - i - 1); // prepare (loop will increment to next page) jump to the next page, because current page contains a visible function item
                        enabledItem = true;
                    }
                }
            }
        }
        
        /**
         * Initializes the item list for a view to present.
         * @param {Object} data an object literal
         */
        initItemData(data) {
            _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, `> ListViewModel::initItemData data=${JSON.stringify(data, (key, val) => { return typeof val === "function" ? val() : val; })}`);
            this.isGenericListMode = true; // we retrieved our own list
            this.priorities = data.priorities;
            const priorities = data.priorities;
            const isDesignMode = this.designMode;
            const isPriorities = priorities !== void 0 && priorities !== null;
            let srcLen;
            let elements = data.elements;
            let viewStateKeys = [];
            let viewStateMap = new Map();
            // fill the source list with data
            this.srcLen = srcLen = elements.length;
            this.sourceDataList = [];
            this.freeDataList = [];
            this.staticsDataList = [];
            try {
                for(let i = 0; i < srcLen; i++) {
                    let item = elements[i];
                    if(isDesignMode) {
                        // convert string to ko.observable, this is necessary only in basic design mode, since ProFlex4Op module creates observables for
                        // the attributes automatically.
                        for(let j = 0; j < item.captions.length; j++) {
                            if(!ko.isObservable(item.captions[j])) {
                                item.captions[j] = ko.observable(item.captions[j]);
                            }
                        }
                        for(let k = 0; k < item.rawdata.length; k++) {
                            if(!ko.isObservable(item.rawdata[k])) {
                                item.rawdata[k] = ko.observable(item.rawdata[k]);
                            }
                        }
                        if(!ko.isObservable(item.icon)) {
                            item.icon = ko.observable(item.icon);
                        }
                    }
                    // In the case the VAR_VIEWSTATE_S property could not be replaced (by the ProFLex4Op module) we set the cmd state "enabled", rather than prevent a NaN.
                    item.state = jQuery.isNumeric(item.state) ? parseInt(item.state) : 0;
                    // when submenus is enabled we have to check whether a view state key is available and get the current value from
                    if(item.viewStateKey && uiMapping.isSubmenus(this.priorities)) {
                        item.state = !ko.isObservable(item.state) ? ko.observable(item.state) : item.state;
                        viewStateKeys.push(item.viewStateKey);
                        viewStateMap.set(item.viewStateKey, item.state);
                    }
                    item.order = srcLen + i; // set the "order" here otherwise the sort algo doesn't respect equal elements. Sort is done only if priorities.order !== void 0
                    this.sourceDataList.push(item);
                    // the following is only related to design mode to support
                    if(isDesignMode) {
                        let resultList = [];
                        for(let can = 0; can < this.sourceDataList.length; can++) {
                            resultList.push(this.sourceDataList[can].result);
                        }
                        if(SOFTKEY) {
                            item.staticpos = uiMapping.getItemStaticPosFromPriorities(resultList, item.result, priorities);
                        }
                        item.prominent = uiMapping.getItemProminentFromPriorities(resultList, item.result, priorities);
                    }
                    if(SOFTKEY) {
                        if(item.staticpos === -1 || item.staticpos === void 0) {
                            this.freeDataList.push(item);
                        } else {
                            this.staticsDataList.push(item);
                            // check whether a static item is also in "order" included which makes no sense, because a static item is independent from any order than.
                            // We remove it from "order" list because on item gaps = true we would get unexpected result
                            if(isPriorities && priorities.order && priorities.order.includes(item.result)) {
                                priorities.order.splice(priorities.order.indexOf(item.result), 1);
                            }
                        }
                    } else {
                        this.freeDataList.push(item);
                    }
                }
                // first determization of the free len
                this.freeLen = this.freeDataList.length;

                // handle the found explicit view state keys from view config and retrieve their current view states
                if(viewStateKeys.length) {
                    _dataService.getValues(viewStateKeys).then(result => {
                        for (let [key, state] of viewStateMap) {
                            let val = jQuery.isNumeric(result[key]) ? parseInt(result[key]) : 0;
                            state(val);
                        }
                    });
                }

                // priorities order handling...
                if(isPriorities && priorities.order !== void 0) {
                    let order = priorities.order,
                        hasOrder = false,
                        res;
                    for(let i = 0; i < this.freeLen; i++) {
                        res = this.freeDataList[i].result;
                        if(order.includes(res)) {
                            this.freeDataList[i].order = order.indexOf(res);
                            hasOrder = true;
                        } else {
                            this.freeDataList[i].order = this.freeLen + order.length + i + 1; // must get a value higher than free len or order len
                        }
                    }
                    if(hasOrder) { // sort?
                        this.freeDataList = this.vmHelper.sortByKey(this.freeDataList, "order", true); // sort by order
                        if(SOFTKEY && priorities.itemgaps === true) { // static positions are only softkey relevant
                            // check for non available items and insert gaps instead
                            this.initCurrentVisibleLimits();
                            for(let i = 0; i < order.length && i < this.freeDataList.length; i++) {
                                if(this.freeDataList[i].result !== order[i]) {
                                    this.freeDataList.splice(i, 0, this.createFromElementTemplate(`ordergap_${i.toString()}`, this.currentTemplate)); // length of freeList grows!
                                }
                            }
                            // check for empty pages and remove them...
                            this.filterEmptyPages();
                        }
                    }
                }
                // initialize current length's/pages
                this.initCurrentVisibleLimits();
                // visual initialization
                this.buildVisualLists();
                this.initScrollbar();
            } catch(e) {
                _logger.error(`Problem during source lists initializing for viewKey=${this.viewKey}: ${e}`);
            }

            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< ListViewModel::initItemData");
        }

        /**
         * This function's returned promise is pushed to args.dataKeys during onInitTextAndData to suspend lifecycle until business data is available.
         * @returns {Promise<Object>}
         */
        async importBusinessData() {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> ListViewModel::importBusinessData()");
            let data = await uiMapping.getGenericListData(this.viewKey, this.currentBreadCrumb);
            if(data && data.elements && data.elements.length) {
                _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< ListViewModel::importBusinessData");
                return data;
            }
            _logger.error(`getGenericListData --> No list items available for viewKey=${this.viewKey}`);
            this.handleError();
            throw("ListViewModel::onInitTextAndData --> No list items available !");
        }

        /**
         * Initializes the text and data.
         * This method builds several text keys for headline, instruction and help popup.
         * @param {Object} args will contain the promise which getting resolved when everything is prepared
         * @see {Wincor.UI.Content.BaseViewModel#onInitTextAndData}
         * @lifecycle viewmodel
         */
        onInitTextAndData(args) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> ListViewModel::onInitTextAndData()");
            // do the following only if args is not used by a inherited class
            // ATTENTION: This works if any inherited class uses the args and pushes something into the dataKeys array,
            // or setGenericListGathering has been invoked with true before. If not we will go into this code.
            if (args.dataKeys.length === 0 && this.isGenericListMode) {
                args.dataKeys.push(this.importBusinessData()
                    .then(data => {
                        this.initItemData(data);
                    }));
            } else {
                this.isGenericListMode = false;
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< ListViewModel::onInitTextAndData");
            return super.onInitTextAndData(args);
        }

        /**
         * Handles the scrolling part when command UP/DOWN is occurred.
         * @param {string} id must either 'BTN_SCROLL_DOWN' or 'BTN_SCROLL_UP' or 'CMD_FIRST_ITEM' or 'CMD_LAST_ITEM'
         */
        handleScrolling(id) {
            if(id === CMD_SCROLL_DOWN) { // scroll page down
                if((this.listCursor + this.currentLen - this.staticsLen) <= this.maxLen) { // check whether scrolling is allowed
                    this.notifyCount = 0;
                    this.isNavigationDone = true;
                    this.pagesArray[this.currentPage] = false;
                    this.currentPage++;
                    this.pagesArray[this.currentPage] = true;
                    this.listCursor += this.currentLen - this.staticsLen;
                    if(this.cmdRepos.hasCommand(CMD_SCROLL_UP) && this.cmdRepos.hasCommand(CMD_SCROLL_DOWN)) {
                        this.cmdRepos.setActive(CMD_SCROLL_UP, true);
                        this.cmdRepos.setActive(CMD_SCROLL_DOWN, this.currentPage < this.pagesArray.length - 1);
                    }
                    if(this.cmdRepos.hasCommand(CMD_FIRST_ITEM) && this.cmdRepos.hasCommand(CMD_LAST_ITEM)) {
                        this.cmdRepos.setActive(CMD_LAST_ITEM, this.currentPage < this.pagesArray.length - 1);
                        this.cmdRepos.setActive(CMD_FIRST_ITEM, true);
                    }
                    this.pageCounter(this.currentPage);
                    this.pages.valueHasMutated();
                    this.slides.valueHasMutated();
                    this.viewHelper.moveSlideIndicator(this.currentPage);
                    this.buildVisualLists();
                }
            } else if(id === CMD_SCROLL_UP) { // scroll page up
                if((this.listCursor - this.currentLen + this.staticsLen) >= 0) { // check whether scrolling is allowed
                    this.isNavigationDone = true;
                    this.notifyCount = 0;
                    this.pagesArray[this.currentPage] = false;
                    this.currentPage--;
                    this.pagesArray[this.currentPage] = true;
                    this.listCursor -= this.currentLen - this.staticsLen;
                    if(this.cmdRepos.hasCommand(CMD_SCROLL_UP) && this.cmdRepos.hasCommand(CMD_SCROLL_DOWN)) {
                        this.cmdRepos.setActive(CMD_SCROLL_DOWN, true);
                        this.cmdRepos.setActive(CMD_SCROLL_UP, this.listCursor >= 1 || this.currentBreadCrumb !== void 0);
                    }
                    if(this.cmdRepos.hasCommand(CMD_FIRST_ITEM) && this.cmdRepos.hasCommand(CMD_LAST_ITEM)) {
                        this.cmdRepos.setActive(CMD_LAST_ITEM, true);
                        this.cmdRepos.setActive(CMD_FIRST_ITEM, this.listCursor >= 1);
                    }
                    this.pageCounter(this.currentPage);
                    this.pages.valueHasMutated();
                    this.slides.valueHasMutated();
                    this.viewHelper.moveSlideIndicator(this.currentPage);
                    this.buildVisualLists();
                } else if(this.currentBreadCrumb && this.listSelectionModule) {
                    this.listSelectionModule.previousSubMenu();
                }
            } else if(id === CMD_FIRST_ITEM) { // first item
                this.isNavigationDone = true;
                this.notifyCount = 0;
                this.pagesArray[this.currentPage] = false;
                this.currentPage = 0;
                this.pagesArray[this.currentPage] = true;
                this.listCursor = 0;
                this.cmdRepos.setActive([CMD_FIRST_ITEM, CMD_SCROLL_UP], false);
                this.cmdRepos.setActive([CMD_LAST_ITEM, CMD_SCROLL_DOWN], this.srcLen > 0);
                this.pageCounter(this.currentPage);
                this.pages.valueHasMutated();
                this.slides.valueHasMutated();
                this.viewHelper.moveSlideIndicator(this.currentPage);
                this.buildVisualLists();
            } else if(id === CMD_LAST_ITEM) { // last item
                this.isNavigationDone = true;
                this.notifyCount = 0;
                this.pagesArray[this.currentPage] = false;
                this.currentPage = this.pagesArray.length - 1;
                this.pagesArray[this.currentPage] = true;
                this.listCursor = this.maxLen - this.currentLen;
                this.cmdRepos.setActive([CMD_FIRST_ITEM, CMD_SCROLL_UP], this.srcLen > 0);
                this.cmdRepos.setActive([CMD_LAST_ITEM, CMD_SCROLL_DOWN], false);
                this.pageCounter(this.currentPage);
                this.pages.valueHasMutated();
                this.slides.valueHasMutated();
                this.viewHelper.moveSlideIndicator(this.currentPage);
                this.buildVisualLists();
            } else {
                _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `ListViewModel::handleScrolling unknown command id=${id}`);
            }
        }

        /**
         *
         * @param {Array} items the complete list to render
         * @returns {number} the position or -1 if no position is found (usually the given items max size is reached)
         */
        findNextStaticPosition(items) {
            let pos = 0, isPosAvail = false;
            for(let i = items.length - 1; i >= 0; i--) {
                if(items[i] === void 0) {
                    isPosAvail = true;
                    pos = i;
                    break;
                }
            }
            return isPosAvail ? pos : -1;
        }

        /**
         *
         * @param {Array} items the complete list to render
         * @param {Object} item the item to find the next position
         * @param {number} currentLen the current item len
         * @param {number} maxLen the max len
         * @returns {number} the position or -1 if no position is found (usually the given items max size is reached)
         */
        findNextPosition(items, item, currentLen, maxLen) {
            let pos = 0, isPosAvail = false;
            for(let i = 0; i < maxLen && i < currentLen; i++) {
                if(items[i] === void 0) {
                    isPosAvail = true;
                    if(item.staticpos === -1 || item.staticpos === void 0) { // usually staticPos is only available for generic lists
                        pos = i;
                        break;
                    }
                }
            }
            return isPosAvail ? pos : -1;
        }

        /**
         * Build up the visual lists for dataList.items, dataList.itemsLeft and dataList.itemsRight.
         */
        buildVisualLists() {
            let items = [];
            let itemsLeft = [];
            let itemsRight = [];
            try {
                if(SOFTKEY) { // static positions are only softkey relevant
                    // first take the static position 1-4 or 5-8
                    for(let i = 0; i < this.staticsLen; i++) {
                        let item = this.staticsDataList[i];
                        let pos = item.staticpos;
                        if(pos !== -1 && pos > 0 && pos < 9) { // 1-8 positions
                            if(this.currentLen < 8) {
                                pos = this.STATIC_POS_MAP[this.currentLen][pos - 1][pos];
                            } else { // list fits into 8 softkey positions without the need of previous/next
                                pos--; // 0 - 7 or 0 - 5 or 0 - 3
                            }
                            if(items[pos] === void 0) {
                                items[pos] = item;
                            } else {
                                pos = this.findNextStaticPosition(items);
                                items[pos] = item;
                            }
                        }
                    }
                    // copy next chunk into the list
                    for(let i = this.listCursor; i < this.freeLen; i++) {
                        let pos = this.findNextPosition(items, this.freeDataList[i], this.currentLen, this.maxLen);
                        if(pos !== -1) {
                            items[pos] = this.freeDataList[i];
                        }
                    }
                    // gap list handling is only relevant for generic lists
                    if(this.isGenericListMode) {
                        const leftOnly = this.visibleLimits.leftOnly;
                        // Consider softkey orientation: If 'BOTTOM_UP' (default) is set we push gaps first to drag the
                        // visible buttons down.
                        if(this.visibleLimits.max < 8 && this.visibleLimits.orientation === SK_ORIENTATION_BOTTOM_UP) {
                            const len = !leftOnly ? (8 - this.visibleLimits.max) / 2 : 4 - this.visibleLimits.max;
                            for(let i = 0; i < len; i++) {
                                itemsLeft.push(this.createFromElementTemplate(`gap_unusedLeft${i}`, this.currentTemplate));
                                itemsRight.push(this.createFromElementTemplate(`gap_unusedRight${i}`, this.currentTemplate));
                            }
                        }
                        // Note: We have to handle, even if -srcLen is less than -currentLen,
                        //       because of possible static items which are configured to a higher SK pos (e.g. F8)
                        for(let i = 0; i < this.currentLen; i++) {
                            if(items[i] === void 0) {
                                items[i] = this.createFromElementTemplate(`gap_${i}`, this.currentTemplate);
                            }
                            if(!leftOnly) {
                                // lists left/right
                                if(i < (this.currentLen / 2)) {
                                    itemsLeft.push(items[i]);
                                } else {
                                    itemsRight.push(items[i]);
                                }
                            } else { // left only
                                itemsRight.push(this.createFromElementTemplate(`gap_right${i}`, this.currentTemplate)); // drag a possible next button down
                                if(i < this.currentLen) {
                                    itemsLeft.push(items[i]);
                                }
                            }
                        }
                    }
                } else { // touch
                    const max = this.visibleLimits.max;
                    if(max === 0) { // usually touch related views containing all items to handle at the same time via list scrolling
                        // all free items for the list to bind
                        items = this.freeDataList;
                    } else { // push visible max items into the list, since such views desires to handle at least one item only at the same time up to visible max items
                        for(let j = 0, i = this.listCursor; j < max && i < this.freeLen; i++, j++) {
                            items.push(this.freeDataList[i]);
                        }
                    }
                }
                _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `. ListViewModel::buildVisualLists currentLen=${this.currentLen}, listCursor=${this.listCursor},
                                                                    itemsLen=${items.length}, itemsLeftLen=${itemsLeft.length}, itemsRightLen=${itemsRight.length}, 
                                                                    staticsLen=${this.staticsLen}, freeListLen=${this.freeLen}, srcLen=${this.srcLen}, 
                                                                    maxLen=${this.maxLen}`);
                // trigger observable lists to render
                const dataList = this.dataList;
                dataList.items(items);
                dataList.itemsLeft(itemsLeft);
                dataList.itemsRight(itemsRight);
            } catch(e) {
                _logger.error(`ListViewModel::buildVisualLists: Problem during visual lists building for viewKey=${this.viewKey}: ${e}`);
            }
        }
    
        /**
         * Setup the visual lists for dataList.items, dataList.itemsLeft and dataList.itemsRight.
         * The method sets the internal genericListMode flag true in order to handle the individual data
         * like in pure generic list mode as it would do if own template is used.
         * In this case the {@link Wincor.UI.Content.ListViewModel.setElementTemplate} must be called.
         */
        setupVisualLists() {
            this.isGenericListMode = true;
            this.buildVisualLists();
        }
        
        /**
         * Sets the element template for internal gap handling.
         * Usually the ListViewModel uses a generic template for several selection views.
         * If the {@link Wincor.UI.Content.ListViewModel.setupVisualLists} is used with
         * non generic view model data the internal template should be set in order to be able to generate item gaps for
         * softkey approach and to get the view bindings satisfied.
         * @param {Object} template the template to set must be a valid JSON notated object which corresponds to the normal
         * data items used in the view binding(s).
         */
        setElementTemplate(template) {
            this.currentTemplate = template;
        }

        /**
         * Filter and return items
         * @param {object=} selectors key-value pairs (value can be null to filter all with specific key). The value can be an array to match one of the entries.
         * @returns {Array} resulting array might be empty
         */
        getItems(selectors) {
            try {
                // concat items of all groups and filter
                return this.sourceDataList.filter(item => {
                    // no filters
                    if (!selectors) {
                        return item;
                    }
                    // filter
                    let match = true;
                    Object.keys(selectors).forEach(key => {
                        if (!(key in item)) {
                            return false;
                        }
                        let val = ko.unwrap(item[key]);
                        let targetValues = selectors[key];
                        if (targetValues === null || targetValues === void 0) {
                            targetValues = [];
                        } else if(!Array.isArray(targetValues)) {
                            targetValues = [targetValues];
                        }
                        match &= ((targetValues.length === 0) || targetValues.indexOf(val) !== -1);
                    });
                    return match;
                })
            } catch(e) {
                _logger.error(`ListViewModel::getItems viewKey=${this.viewKey}: ${e}`);
                return [];
            }
        }

        /**
         * Overridden to handle certain commands for list handling.
         * <p>
         * Handles on button pressed actions:<br>
         * <ul>
         *     <li>BTN_SCROLL_DOWN</li>
         *     <li>BTN_SCROLL_UP</li>
         *     <li>BTN_FIRST_ITEM</li>
         *     <li>BTN_LAST_ITEM</li>
         *     <li>arbitrary submenu functions</li>
         * </ul>
         * </p>
         * @param {String} id the command id such as 'BTN_SCROLL_DOWN', etc.
         * @eventhandler
         */
        onButtonPressed(id) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `> ListViewModel::onButtonPressed(${id}) viewKey=${this.viewKey}`);
            const isSubMenusEnabled = uiMapping.isSubmenus(this.priorities);
            if(isSubMenusEnabled && !this.listSelectionModule) {
                _logger.error(`For submenu support please deliver your code-behind module when creating the instance of this view model. E.g 'let listVM = new ListViewModel(this);' for viewKey=${this.viewKey}`);
            }
            if(id === CMD_SCROLL_DOWN || id === CMD_SCROLL_UP || id === CMD_FIRST_ITEM || id === CMD_LAST_ITEM) {
                this.handleScrolling(id);
            } else if(id === CMD_BACK && this.listSelectionModule) {
                this.listSelectionModule.previousSubMenu();
            } else {
                let isSubFunction = isSubMenusEnabled && this.vmHelper.isPropertyAvailable(this.priorities.submenus, id);
                if(!isSubFunction) {
                    this.currentBreadCrumb = void 0;
                    let idx = uiMapping.getLiseIndex(id, this.sourceDataList);
                    if(idx !== -1 && !this.designMode) {
                        _dataService.setValues(PROP_LISE_INDEX, idx, () => super.onButtonPressed(id));
                    } else { // a special button within the view
                        super.onButtonPressed(id);
                    }
                } else if(this.listSelectionModule) { // a sub function button
                    this.listSelectionModule.openSubMenu(id);
                }
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< ListViewModel::onButtonPressed");
            return true; // we handle the delegated onButtonPressed events!
        }
    }
});

