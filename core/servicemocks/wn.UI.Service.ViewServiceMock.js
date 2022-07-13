/**
 @preserve
 Copyright (c) 2001-2021 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ wn.UI.Service.ViewServiceMock.js 4.3.1-210702-21-a51e474c-1a04bc7d

*/

/**
 * @module
 */
const getServiceClass = ({ jQuery, Wincor, BaseService, ext, LogProvider }) => {

    /**
     *
     * @type {Wincor.UI.Diagnostics.LogProvider|*|Wincor.UI.Diagnostics.LogProvider|*}
     * @private
     */
    const _logger = LogProvider;
    
    let _registrationID = 0;

    return class ViewServiceMock extends BaseService {

        /**
         * "ViewServiceMock" - the logical name of this service as used in the service-provider.
         * @const
         * @type {string}
         */
        NAME = "ViewService";
    
        /**
         * See {@link Wincor.UI.Service.ViewService#viewContext}.
         */
        viewContext = null;
    
        /**
         * See {@link Wincor.UI.Service.ViewService#interactionTimerId}.
         */
        interactionTimerId = 0;
    
        /**
         * See {@link Wincor.UI.Service.ViewService#interactionTimeoutValue}.
         */
        interactionTimeoutValue = -1;
    
        /**
         * See {@link Wincor.UI.Service.ViewService#contentRunning}.
         */
        contentRunning = false;
    
        /**
         * See {@link Wincor.UI.Service.ViewService#autoActivate}.
         */
        autoActivate = true;
    
        /**
         * See {@link Wincor.UI.Service.ViewService#startURL}.
         */
        startURL = "../../content_softkey/views/index.html";
    
        /**
         * See {@link Wincor.UI.Service.ViewService#previousViewUrl}.
         */
        previousViewUrl = "";
    
        /**
         * See {@link Wincor.UI.Service.ViewService#isRestartOnNextDisplay}.
         */
        isRestartOnNextDisplay = false;

        /**
         * See {@link Wincor.UI.Service.ViewService#SERVICE_EVENTS}.
         * @enum {string}
         */
        SERVICE_EVENTS = {
            /**
             * @see Wincor.UI.Service.ViewServiceMock#SERVICE_EVENTS:NAVIGATE_SPA
             */
            NAVIGATE_SPA: "NAVIGATE_SPA",

            /**
             * @see Wincor.UI.Service.ViewService#SERVICE_EVENTS:VIEW_CLOSING
             */
            VIEW_CLOSING: "VIEW_CLOSING",

            /**
             * @see Wincor.UI.Service.ViewService#SERVICE_EVENTS:VIEW_BEFORE_CHANGE
             */
            VIEW_BEFORE_CHANGE: "VIEW_BEFORE_CHANGE",

            /**
             * @see Wincor.UI.Service.ViewService#SERVICE_EVENTS:VIEW_PREPARED
             */
            VIEW_PREPARED: "VIEW_PREPARED",

            /**
             * @see Wincor.UI.Service.ViewService#SERVICE_EVENTS:TURN_ACTIVE
             */
            TURN_ACTIVE: "TURN_ACTIVE",

            /**
             * @see Wincor.UI.Service.ViewService#SERVICE_EVENTS:CONTENT_UPDATE
             */
            CONTENT_UPDATE: "CONTENT_UPDATE",

            /**
             * @see Wincor.UI.Service.ViewService#SERVICE_EVENTS:VIEW_ACTIVATED
             */
            VIEW_ACTIVATED: "VIEW_ACTIVATED",

            /**
             * @see Wincor.UI.Service.ViewService#SERVICE_EVENTS:VIEW_USERINTERACTION_TIMEOUT
             */
            VIEW_USERINTERACTION_TIMEOUT: "VIEW_USERINTERACTION_TIMEOUT",

            /**
             * @see Wincor.UI.Service.ViewService#SERVICE_EVENTS:STYLE_TYPE_CHANGED
             */
            STYLE_TYPE_CHANGED: "STYLE_TYPE_CHANGED",

            /**
             * @see Wincor.UI.Service.ViewService#SERVICE_EVENTS:POPUP_ACTIVATED
             */
            POPUP_ACTIVATED: "POPUP_ACTIVATED",

            /**
             * @see Wincor.UI.Service.ViewService#SERVICE_EVENTS:POPUP_DEACTIVATED
             */
            POPUP_DEACTIVATED: "POPUP_DEACTIVATED",

            /**
             * @see Wincor.UI.Service.ViewService#SERVICE_EVENTS:REFRESH_TIMEOUT
             */
            REFRESH_TIMEOUT: "REFRESH_TIMEOUT",

            /**
             * @see Wincor.UI.Service.ViewService#SERVICE_EVENTS:SHUTDOWN
             */
            SHUTDOWN: "SHUTDOWN",

            /**
             * @see Wincor.UI.Service.ViewService#SERVICE_EVENTS:SUSPEND
             */
            SUSPEND: "SUSPEND",

            /**
             * @see Wincor.UI.Service.ViewService#SERVICE_EVENTS:RESUME
             */
            RESUME: "RESUME",

            /**
             * @see Wincor.UI.Service.ViewService#SERVICE_EVENTS:LOCATION_CHANGED
             */
            LOCATION_CHANGED: "LOCATION_CHANGED"
        };
    
        /**
         * See {@link Wincor.UI.Service.ViewService#EVENT_NAME_UIRESULT}.
         */
        EVENT_NAME_UIRESULT = "UIResult";
    
        /**
         * See {@link Wincor.UI.Service.ViewService#EVENT_UIRESULT}.
         */
        EVENT_UIRESULT = null;
    
        /**
         * See {@link Wincor.UI.Service.ViewService#EVENT_ACTIVATED}.
         */
        EVENT_ACTIVATED = null;
    
        /**
         * See {@link Wincor.UI.Service.ViewService#EVENT_POPUP}.
         */
        EVENT_POPUP = null;
    
    
        /**
         * See {@link Wincor.UI.Service.ViewService#EVENT_PREPARED}.
         */
        EVENT_PREPARED = null;
    
        /**
         * See {@link Wincor.UI.Service.ViewService#EVENT_CONTENT_UPDATED}.
         */
        EVENT_CONTENT_UPDATED = null;
    
        /**
         * See {@link Wincor.UI.Service.ViewService#UIRESULT_OK}.
         */
        UIRESULT_OK = "0";
    
        /**
         * See {@link Wincor.UI.Service.ViewService#UIRESULT_TIMEOUT_USER}.
         */
        UIRESULT_TIMEOUT_USER = "2";
    
        /**
         * See {@link Wincor.UI.Service.ViewService#UIRESULT_CANCEL_USER}.
         */
        UIRESULT_CANCEL_USER = "3";
    
        /**
         * See {@link Wincor.UI.Service.ViewService#UIRESULT_CANCEL_SW}.
         */
        UIRESULT_CANCEL_SW = "4";
    
        /**
         * See {@link Wincor.UI.Service.ViewService#UIRESULT_ERROR_VIEW}.
         */
        UIRESULT_ERROR_VIEW = "5";
    
        /**
         * See {@link Wincor.UI.Service.ViewService#UIRESULT_CANCEL_SW_ERROR}.
         */
        UIRESULT_CANCEL_SW_ERROR = "8";

        /**
         * Value used in {@link Wincor.UI.Service.ViewService#endView} if the ViewService receives a cancel- of display request
         * but there is no active view.
         * @example
         * UI_DETAILED_RESULT: {
         *      CANCEL: "CANCEL",
         *      DISPLAY: "DISPLAY"
         * }
         * @type {Object}
         * @const
         */
        UI_DETAILED_RESULT = {
            CANCEL: "CANCEL",
            DISPLAY: "DISPLAY"
        };

        /**
         * See {@link Wincor.UI.Service.ViewService#pageTimeout}.
         */
        pageTimeout = -1;
    
        /**
         * See {@link Wincor.UI.Service.ViewService#immediateTimeout}.
         */
        immediateTimeout = 0;
    
        /**
         * See {@link Wincor.UI.Service.ViewService#endlessTimeout}.
         */
        endlessTimeout = -1;
    
        /**
         * See {@link Wincor.UI.Service.ViewService#messageTimeout}.
         */
        messageTimeout = 5000;
    
        /**
         * See {@link Wincor.UI.Service.ViewService#confirmationTimeout}.
         */
        confirmationTimeout = 30000;
    
        /**
         * See {@link Wincor.UI.Service.ViewService#inputTimeout}.
         */
        inputTimeout = 120000;
    
        /**
         * See {@link Wincor.UI.Service.ViewService#pinentryTimeout}.
         */
        pinentryTimeout= 30000;
    
        /**
         * See {@link Wincor.UI.Service.ViewService#urlMapping}.
         */
        urlMapping = {
            "softkey": "../../content_softkey/views/index.html",
            "touch": "../../content_touch/views/index.html"
        };
    
        /**
         * See {@link Wincor.UI.Service.ViewService#resultMapping}.
         */
        resultMapping = null;
    
        /**
         * See {@link Wincor.UI.Service.ViewService#DEFAULT_VIEWKEY_VALUES}.
         */
        DEFAULT_VIEWKEY_VALUES = {};
    
        /**
         * See {@link Wincor.UI.Service.ViewService#DEFAULT_TIMEOUT_VALUES}.
         */
        DEFAULT_TIMEOUT_VALUES = {};
    
        /**
         * See {@link Wincor.UI.Service.ViewService#KEYWORD_MAPPING}.
         */
        KEYWORD_MAPPING = {};
    
        /**
         * This event is sent if there are missing data keys.
         * Data keys are often part of a viewkey configuration and thus being resolved as well.
         * @type {Object}
         * @eventtype native
         * @event  Wincor.UI.Service.ViewService#EVENT_MISSING_DATA_KEYS
         */
        EVENT_MISSING_DATA_KEYS = null;
    
        /**
         * See {@link Wincor.UI.Service.ViewService#CONTENT_FRAME_NAME}.
         */
        CONTENT_FRAME_NAME = "#extendedDesignModeContent";
    
        /**
         * See {@link Wincor.UI.Service.ViewService#restarting}.
         */
        restarting = false;
    
        /**
         * See {@link Wincor.UI.Service.ViewService#cacheHTML}.
         */
        cacheHTML = false;
    
        /**
         * See {@link Wincor.UI.Service.ViewService#viewSetName}.
         */
        viewSetName = "";
    
        /**
         * See {@link Wincor.UI.Service.ViewService#adaViewSet}.
         */
        adaViewSet = "softkey";
    
        /**
         * See {@link Wincor.UI.Service.ViewService#initialViewSet}.
         */
        initialViewSet = "softkey";
    
        /**
         * See {@link Wincor.UI.Service.ViewService#loadingViewSet}.
         */
        loadingViewSet = false;
        

        /**
         * See {@link Wincor.UI.Service.ViewService#currentStyleType}.
         */
        currentStyleType = "MercuryDark"; // this property does not include the ending slash '/', because its gonna ask by getProperty and a slash would disturb

        /**
         * See {@link Wincor.UI.Service.ViewService#currentStyleTypeByStylesheetKey}.
         */
        currentStyleTypeByStylesheetKey = "";

        /**
         * See {@link Wincor.UI.Service.ViewService#currentVendor}.
         */
        currentVendor = "default"; // this property does not include the ending slash '/', because its gonna ask by getProperty and a slash would disturb

        /**
         * See {@link Wincor.UI.Service.ViewService#currentResolution}.
         */
        currentResolution = "default"; // this property does not include the ending slash '/', because its gonna ask by getProperty and a slash would disturb
    
        /**
         * See {@link Wincor.UI.Service.ViewService#suspendList}.
         */
        suspendList = [];
    
        /**
         * See {@link Wincor.UI.Service.ViewService#isSuspended}.
         */
        isSuspended = false;
    
        /**
         * See {@link Wincor.UI.Service.ViewService#suspendId}.
         */
        suspendId = 0;

        viewMappings = {};

        /**
         * See {@link Wincor.UI.Service.BaseServiceMock#constructor}.
         * Prepare `DEFAULT_VIEWKEY_VALUES`, which contains the required parameters for every viewkey configuration.
         * Initializes other members of this class.
         * @lifecycle service
         */
        constructor(...args) {
            super(...args);

            _logger.log(_logger.LOG_SRVC_INOUT, "> ViewServiceMock::ViewServiceMock");

            this.CONTENT_FRAME_NAME = `#${localStorage.getItem("activeFrameName")}`;

            this.viewContext = {
                viewKey: null,
                viewKeyList: [],
                viewURL: null,
                viewConfig: {
                    popup: {}
                },
                viewID: -1
            };
    
            if(localStorage.getItem("activateTimeoutsOn") !== "true" && localStorage.getItem("activateCancelBehaviourOn") !== "true") {
                this.messageTimeout = this.inputTimeout = this.endlessTimeout = this.immediateTimeout = this.confirmationTimeout = this.pinentryTimeout = -1;
            }
            this.DEFAULT_VIEWKEY_VALUES = {
                "url": "",
                "timeout": this.messageTimeout,
                "popup": {
                    "oncancel": true,
                    "ontimeout": true,
                    "beepontimeout": false,
                    "beepontimeoutperiod": 0
                }
            };

            this.EVENT_UIRESULT = Object.assign(Object.assign({}, this.EVENT), {
                service: this.NAME,
                eventName: this.EVENT_NAME_UIRESULT,
                viewID: -1,
                UIResult: null
            });
    
            this.EVENT_ACTIVATED = Object.assign(Object.assign({}, this.EVENT), {
                service: this.NAME,
                viewID: -1,
                viewKey: null,
                eventName: "UIStateActivated"
            });
    
            this.EVENT_CONTENT_UPDATED = Object.assign(Object.assign({}, this.EVENT), {
                service: this.NAME,
                viewKey: null,
                eventName: "ContentUpdated"
            });
    
            this.EVENT_MISSING_DATA_KEYS = Object.assign(Object.assign({}, this.EVENT), {
                service: this.NAME,
                viewID: -1,
                viewKey: null,
                eventName: "MissingDataKeys",
                keys: []
            });
    
            this.EVENT_UIRESULT.UILastButtonPressedEPPKey = [];

            this.reReadErrorOccurred = false;
            this.resultMapping = {};
            this.startURL = "../../content_softkey/views/index.html";
            this.previousViewUrl = "";
            this.viewMappings = {};
    
            this.requestMap.set("display", this.display.bind(this));
            this.requestMap.set("updateCurrent", this.updateCurrent.bind(this));

            _logger.log(_logger.LOG_SRVC_INOUT, "< ViewServiceMock::ViewServiceMock");
        }
        
        /**
         * Get the used properties from the view mapping.
         * The method does a static analyse of the view mapping data to search for business properties.
         * @returns {Set} the used properties
         */
        getUsedProperties() {
            let extractedProps = [];
            let keys = Object.keys(this.viewMappings), viewKey, text;
            for(let i = keys.length - 1; i >= 0; i--) {
                viewKey = keys[i];
                text = JSON.stringify(this.viewMappings[viewKey]);
                extractedProps = extractedProps.concat(this.extractPropertiesFromText(text));
            }
            return new Set(extractedProps);
        }

        /**
         * See {@link Wincor.UI.Service.ViewService#getContentWindowDocument}.
         */
        getContentWindowDocument(frmName) {
            const $frame = jQuery(frmName);
            return $frame.length > 0 ? $frame.contents()[0] : window.document; // due to unit test compatibility, because there is no iframe
        }

        /**
         * See {@link Wincor.UI.Service.ViewService#loadContentUrl}.
         */
        loadContentUrl(url, frmName) {
            Wincor.UI.Content = null;
            const $frame = jQuery(frmName);
            $frame.attr("src", url);
            $frame.css("display", "block");
        }

        /**
         * See {@link Wincor.UI.Service.ViewService#navigate}.
         */
        navigate(url) {
            _logger.log(_logger.LOG_SRVC_INOUT, `> ViewServiceMock::navigate(${url})`);
            if(!url) {
                _logger.error(`ViewServiceMock::navigate, Navigation canceled due to mandatory 'url' argument is invalid -
                               please check UIMapping for viewkey=${this.viewContext.viewKey}`);
                return;
            }

            if(this.isRestartOnNextDisplay) {
                this.reStartSPA(url);
                _logger.log(_logger.LOG_ANALYSE, `< ViewServiceMock::navigate restart of SPA necessary for destination=${url}`);
                return;
            }

            // determine next SPA URL
            // manipulate url to short version for durandal
            const queryStringObj = Wincor.QueryString.get(url);
            const queryString = Wincor.QueryString.stringify(queryStringObj);
            const newUrl = Wincor.QueryString.getBaseUrl(url);
            const routeName = !newUrl.includes(".html") && !newUrl.includes(".htm") ?
                newUrl : newUrl.replace(".html", "").replace(".htm", ""); // only the name of the html file without extension
            const destination = {
                url: newUrl,
                routeName: routeName,
                lastViewUrl: this.previousViewUrl,
                queryString: queryString,
                viewKey: this.viewContext.viewKey
            };
            this.previousViewUrl = newUrl;
            localStorage.setItem(`currentViewId_${document.location.href}`, routeName);
            
            //only in toolingEDM mode we will read the json files again
            if(Wincor.toolingEDM) {
                Wincor.UI.Service.Provider.DataService.updateJSONData()
                .then(() => {
                    Wincor.UI.Service.Provider.LocalizeService.updateJSONData()
                    .then(() => {
                        this.fireServiceEvent(this.SERVICE_EVENTS.NAVIGATE_SPA, destination);
                        _logger.log(_logger.LOG_SRVC_INOUT, `< ViewServiceMock::navigate destination=${JSON.stringify(destination)}`);
                    });
                });
            } else {
                this.fireServiceEvent(this.SERVICE_EVENTS.NAVIGATE_SPA, destination);
                _logger.log(_logger.LOG_SRVC_INOUT, `< ViewServiceMock::navigate destination=${JSON.stringify(destination)}`);
            }
        }

        /**
         * Starts the SPA by loading the initially given URL into the `iframe` of the the application content.
         *
         * @param {string} url          The url to start with, usually _index.html_.
         * @param {boolean=} isRestart   True, if currently a restart is forced, false or undefined otherwise.
         */
        startSPA(url, isRestart) {
            _logger.log(_logger.LOG_ANALYSE, `> ViewServiceMock::startSPA url=${url}, viewSetName=${this.viewSetName}`);
            const readyForDisplay = ext.Promises.deferred();
            if(!isRestart && localStorage.getItem("keepViewKeyOn") === "true") {
                const viewKeyFromStorage = localStorage.getItem(`currentViewKey_${document.location.href}`);
                if(viewKeyFromStorage !== null && viewKeyFromStorage !== "") {
                    this.registerForServiceEvent(this.SERVICE_EVENTS.VIEW_ACTIVATED, async() => { //this is the activated event of index.html
                        await readyForDisplay;
                        setTimeout(() => this.display({viewKey: viewKeyFromStorage, viewURL: localStorage.getItem(`currentViewId_${document.location.href}`)}), 250);
                    }, this.DISPOSAL_TRIGGER_ONETIME);
                }
            }
            this.loadContentUrl(url, this.CONTENT_FRAME_NAME);
            if(!Wincor.toolingEDM) {
                jQuery("#extendedDesignMode").fadeIn({
                    duration: 600, easing: "easeInQuart", complete: () => {
                        jQuery(".spinner").css("display", "none");
                        readyForDisplay.resolve();
                    }
                });
            } else {
                jQuery(".spinner").css("display", "none");
                readyForDisplay.resolve();
            }
            _logger.log(_logger.LOG_SRVC_INOUT, "< ViewServiceMock::startSPA");
        }

        /**
         * See {@link Wincor.UI.Service.ViewService#reStartSPA}.
         */
        reStartSPA(url) {
            _logger.log(_logger.LOG_SRVC_INOUT, `> ViewServiceMock::reStartSPA(${url})`);
            this.isRestartOnNextDisplay = false;
            localStorage.setItem("restartSPA", "true");
            jQuery("body").attr("data-restart-spa", "true");
            this.fireServiceEvent(this.SERVICE_EVENTS.SHUTDOWN);
            _logger.log(_logger.LOG_ANALYSE, ". | VIEW ViewServiceMock::reStartSPA restarting!");
            this.registerForServiceEvent(this.SERVICE_EVENTS.VIEW_ACTIVATED, () => { //this is the activated event of index.html
                // decouple from service event (do not fire service event from within handler directly!)
                setTimeout(() => {
                    //SPA is restarted, now load the initial url:
                    _logger.log(_logger.LOG_ANALYSE, `. | VIEW ViewServiceMock::reStartSPA navigating to ${url}`);
                    this.fireServiceEvent(this.SERVICE_EVENTS.VIEW_CLOSING, this.getContentWindowDocument(this.CONTENT_FRAME_NAME).location.href);
                    this.fireBeforePageChange({});
                    this.restarting = false;
                    this.navigate(url);
                    localStorage.setItem("restartSPA", "false");
                    jQuery("body").attr("data-restart-spa", "false");
                }, 250);
            }, this.DISPOSAL_TRIGGER_ONETIME);
            //Wincor.UI.Content = null;
            this.restarting = true;
            jQuery("#extendedDesignMode").fadeOut({ duration: 600, easing: "easeOutQuart", complete: () => this.startSPA(this.startURL, true) }); //load the new index.html of the new viewset
            _logger.log(_logger.LOG_SRVC_INOUT, "< ViewServiceMock::reStartSPA");
        }

        /**
         * This function is called by the business logic to display a specific view.
         * The result will be send as event, see {@link Wincor.UI.Service.ViewService#EVENT_UIRESULT}.
         *
         * @param {Object} message The message contains must contain the `viewKey`.
         * @param {Boolean=} [autoActivate=true] True if the view shall be activated, too.
         */
        display(message, autoActivate = true) {
            _logger.log(_logger.LOG_SRVC_INOUT, `> ViewServiceMock::display() message=${JSON.stringify(message)}`);
            this.autoActivate = autoActivate;
            if(this.contentWindowExists()) {
                this.endView(this.UIRESULT_CANCEL_SW, this.UI_DETAILED_RESULT.DISPLAY);  //send a GUIResult for the currently running view. endView() checks if content is running
            }
            
            function triggerNavigation() {
                if(message.viewKey && !message.viewKey.includes("_")) {
                    if(this.viewMappings[message.viewKey]) {
                        // toolingEDM:
                        // Please note:
                        // Tooling also expects that the template keys such as "AmountSelection", "Message", etc. are treated as
                        // normal viekeys.
                        // As we know, such templates (aka defaults) aren't valid viekeys and thus there are no viekey specific text keys, viewkey specific business data
                        // and no flow available.
                        // This usually leads into subsequent, unpredictable runtime problems, such as undefines, promise rejections, etc.
                        // In order to prevent from this the idea is to redirect such a template key to its bound correspond viewkey, so e.g. "AmountSelection" template is
                        // usually bound to "FastCashPreferenceAmountSelection" and we redirect to this key, due to this key is a valid viewkey with valid configuration and
                        // a correct set of texts and data.
                        // In order to satisfy tooling with the redirection all event messages sent to it via web socket connection must contain the displayed key, even
                        // we internally work with the redirected one.
                        // Additionally we add a the "redirectedToViewKey" attribute to each of the events to inform tooling about this circumstance.
                        if(Wincor.toolingEDM && this.viewMappings[message.viewKey].isTemplate && !this.viewMappings[message.viewKey].fromTemplateKey) {
                            // Please note:
                            // We redirect the display key to the remembered known valid viewkey,
                            // because the display key argument is a template and usually there are neither viekey specific text nor business data available for it
                            // and then typically leads into different exceptions (undefined, promise rejections, etc.)
                            // until to an invalid EDM state from where a browser restart might be necessary.
                            message.viewKeyRedirect = true;
                            message.redirectFrom = message.viewKey;
                            message.viewKey = this.viewMappings[message.viewKey].targetViewKey;
                            message.redirectTo = message.viewKey;
                        }
                        this.contentRunning = true;
                        this.fireBeforePageChange(message);
                        message.viewID = message.viewID || message.viewURL;
                        this.setViewContext(message, this.viewMappings[message.viewKey]);
                        this.navigate(this.viewContext.viewConfig.url);
                        if(localStorage.getItem("keepViewKeyOn") === "true") {
                            localStorage.setItem(`currentViewKey_${document.location.href}`, message.viewKey);
                        }
                    } else {
                        _logger.error(`Couldn't get value for viewKey=${message.viewKey} which is unknown - please check/update ViewKey mapping !`);
                        return false;
                    }
                } else {
                    _logger.error(`Viewkey viewKey=${message.viewKey} does not meet the conventions, may contain illegal char such as '_', please check/update ViewKey mapping !`);
                    return false;
                }
                _logger.log(_logger.LOG_SRVC_INOUT, "< ViewServiceMock::display");
                return true;
            }
            
            if(Wincor.toolingEDM) {
                this.updateJSONData()
                    .then(() => {
                        return triggerNavigation.call(this);
                    });
            } else {
                return triggerNavigation.call(this);
            }
        }
    
        /**
         * This function is called by Tooling to read the JSON files again and update the currently displayed view.
         * If the content was updated succesfully, we send CONTENT_UPDATED.
         */
        updateCurrent() {
            //register for ACTIVATED_EVENT. If it is triggered send the CONTENT_UPDATED event, too.
            //CONTENT_UPDATED is what Tooling is interested in, not in the ACTIVATED_EVENT.
            //Some day we could change this code, so that we
            // * do not call display() (which internally reads in all JSON again)
            // * instead read in the JSON files again and re-bind every view element
            // * then we do not need to register on ACTIVATED_EVENT anymore
            // * but then we must find another point in time to when we send the CONTENT_UPDATED event.
            _registrationID = this.registerForServiceEvent(this.SERVICE_EVENTS.VIEW_ACTIVATED, () => {
                this.EVENT_CONTENT_UPDATED.viewKey = this.viewContext.viewKey;
                this.sendEvent(this.EVENT_CONTENT_UPDATED);
    
                this.deregisterFromServiceEvent(_registrationID);
            }, true);
            
            this.display({
                viewKey: this.viewContext.viewKey
            });
        }

        /**
         * See {@link Wincor.UI.Service.ViewService#prepare}.
         */
        prepare(message) {
            _logger.log(_logger.LOG_SRVC_INOUT, `> ViewServiceMock::display() message=${JSON.stringify(message)}`);
            this.display(message, false);
            _logger.log(_logger.LOG_SRVC_INOUT, "< ViewServiceMock::display");
            return true;
        }
    
        /**
         * See {@link Wincor.UI.Service.ViewService#activate}.
         */
        activate() {
            setTimeout(() => this.fireServiceEvent(this.SERVICE_EVENTS.TURN_ACTIVE), 1);
        }
    
        /**
         * See {@link Wincor.UI.Service.ViewService#setViewContext}.
         */
        setViewContext(message, viewKeyValue) {
            _logger.log(_logger.LOG_SRVC_INOUT, `> ViewServiceMock::setViewContext() viewKey=${message.viewKey} value=${JSON.stringify(viewKeyValue)}`);
            
            function sendMessageMissingDataKeys(missingKeys) {
                if(missingKeys.length > 0) {
                    this.EVENT_MISSING_DATA_KEYS.viewID = this.viewContext.viewID;
                    this.EVENT_MISSING_DATA_KEYS.viewKey = this.viewContext.viewKey;
                    if(this.viewContext.viewKeyRedirect) {
                        this.EVENT_MISSING_DATA_KEYS.viewKey = this.viewContext.redirectFrom; // overwrite to satisfy tooling
                        this.EVENT_MISSING_DATA_KEYS.redirectedToViewKey = this.viewContext.redirectTo;
                    } else {
                        delete this.EVENT_MISSING_DATA_KEYS.redirectedToViewKey;
                    }
                    this.EVENT_MISSING_DATA_KEYS.keys = missingKeys;
                    this.sendEvent(this.EVENT_MISSING_DATA_KEYS);
                }
            }
    
            this.viewContext.viewKey = message.viewKey !== "" ? message.viewKey : "*";
            // toolingEDM
            if(Wincor.toolingEDM) {
                if(message.viewKeyRedirect) {
                    this.viewContext.viewKeyRedirect = true;
                    this.viewContext.redirectFrom = message.redirectFrom;
                    this.viewContext.redirectTo = message.redirectTo;
                } else {
                    delete this.viewContext.viewKeyRedirect;
                    delete this.viewContext.redirectFrom;
                    delete this.viewContext.redirectTo;
                }
            }
            
            this.setViewKey(this.viewContext.viewKey); // set view key in BaseServiceMock
            this.setViewCtx(this.viewContext); // set view context in BaseServiceMock
            if(viewKeyValue) {
                // TODO: 2016-03-30-workaround: view models expecting attr "placeHolder" instead of "placeholder". Remove this workaround, if tooling metadata corrected to "placeHolder"
                if(viewKeyValue.config && viewKeyValue.config.placeholder) {
                    viewKeyValue.config.placeHolder = viewKeyValue.config.placeholder;
                }
                const missingDataKeys = [];
                this.viewContext.viewURL = this.propResolver(viewKeyValue.url, this.serviceProvider.DataService.businessData, missingDataKeys);
                this.viewContext.viewConfig = jQuery.extend(true, {}, this.DEFAULT_VIEWKEY_VALUES, viewKeyValue);
                if(!Wincor.toolingEDM) {
                    this.viewContext.viewID = !this.viewContext.viewURL.includes(".htm") ? this.viewContext.viewURL : this.viewContext.viewURL.substr(0, this.viewContext.viewURL.indexOf(".htm"));
                } else {
                    // tooling expecting to have the viewID as an ongoing number, with each display call a unique ID is expected
                    this.viewContext.viewID = message.viewID || -1;
                }
                if(this.viewContext.viewConfig) {
                    if(localStorage.getItem("activateTimeoutsOn") === "true") {
                        const time = jQuery.isNumeric(viewKeyValue.timeout) ? parseInt(viewKeyValue.timeout) : -1;
                        this.viewContext.viewConfig.timeout = time;
                        this.interactionTimeoutValue = time;
                    } else {
                        this.viewContext.viewConfig.timeout = -1;
                        this.interactionTimeoutValue = this.pageTimeout;
                    }
                    this.viewContext.viewConfig.popup.oncancel = this.viewContext.viewConfig.popup.oncancel && localStorage.getItem("activateCancelBehaviourOn") === "true";
                    this.viewContext.viewConfig = JSON.parse(this.propResolver(JSON.stringify(this.viewContext.viewConfig), this.serviceProvider.DataService.businessData, missingDataKeys));
                    this.viewContext.viewConfig = this.correctJSONObject(this.viewContext.viewConfig, message.viewKey);
                }
                if(Wincor.toolingEDM) {
                    sendMessageMissingDataKeys.call(this, missingDataKeys); // missing data keys from prop resolving of the view mapping for this viewkey
                }
                _logger.log(_logger.LOG_SRVC_DATA, `. viewKey=${this.viewContext.viewKey} viewURL=${this.viewContext.viewURL}, viewConfig: \n ${JSON.stringify(this.viewContext.viewConfig, null, " ")}`);
            }
            if(!this.viewContext.viewConfig) {
                _logger.error(`Couldn't get configuration for viewKey=${message.viewKey} <-- seems to be invalid. This may lead into subsequent errors !`);
            }
            _logger.log(_logger.LOG_SRVC_INOUT, "< ViewServiceMock::setViewContext");
        }

        /**
         * See {@link Wincor.UI.Service.ViewService#correctJSONObject}.
         */
        correctJSONObject(result, viewKey, recursionCount = 0){
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> ViewServiceMock::correctJSONObject(${recursionCount}): key ${viewKey}=${JSON.stringify(result)}`);
            const keys = Object.keys(result);
            for(let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const value = result[key];
                if(typeof value === "object" && !Array.isArray(value)) {
                    this.correctJSONObject(value, key, recursionCount + 1);
                } else if(typeof value === "string") {
                    result[key] = this.correctValue(value);
                }
            }
            _logger.log(_logger.LOG_ANALYSE, `< ViewServiceMock::correctJSONObject(${recursionCount}): changed key ${viewKey}=${JSON.stringify(result)}`);
            return result;
        }

        /**
         * See {@link Wincor.UI.Service.ViewService#correctValue}.
         */
        correctValue(inputString) {
            _logger.log(_logger.LOG_SRVC_INOUT, "> ViewServiceMock::correctValue=" + inputString);
            let value = inputString;

            // check if defaultString could be parsed to an int
            // REMARK: If the string only contains numbers, but begins with zero we omit the parsing and let the string as it is,
            // otherwise we would lose the leading "0" -> (e.g. "017812345555" would be converted to 17812345555)
    
            const tmpString = value;

            if (jQuery.isNumeric(tmpString) && (tmpString.length === 1 || tmpString[0] !== "0")) {
                value = parseInt(tmpString);
            }

            // check if input value is a boolean
            if(tmpString === "true") {
                value = true;
            } else if(tmpString === "false") {
                value = false;
            }

            _logger.log(_logger.LOG_SRVC_INOUT, "< ViewServiceMock::correctValue returns=" + value);
            return value;
        }

        /**
         * See {@link Wincor.UI.Service.ViewService#offlineHandling}.
         * */
        offlineHandling(resultDetail) {
            _logger.log(_logger.LOG_SRVC_INOUT, `> ViewServiceMock::offlineHandling(${resultDetail})`);
            _logger.log(_logger.LOG_SRVC_INOUT, "< ViewServiceMock::offlineHandling");
        }

        /**
         * See {@link Wincor.UI.Service.ViewService#endView}.
         * */
        endView(resultCode, resultDetail) {
            _logger.log(_logger.LOG_ANALYSE, `. ViewServiceMock::endView(${resultCode}, ${resultDetail})`);
            this.clearTimeout();
            this.fireServiceEvent(this.SERVICE_EVENTS.REFRESH_TIMEOUT, -1);

            if(this.contentRunning) {
                this.contentRunning = false;
                let value;
                if(resultDetail === void 0 || resultDetail === null) {
                    if(resultCode === this.UIRESULT_CANCEL_USER ||
                       resultCode === this.UIRESULT_ERROR_VIEW ||
                       resultCode === this.UIRESULT_CANCEL_SW ||
                       resultCode === this.UIRESULT_CANCEL_SW_ERROR ||
                       resultCode === this.UIRESULT_TIMEOUT_USER) {

                        this.EVENT_UIRESULT.UIResult = resultCode;
                        this.EVENT_UIRESULT.UIDetailedResult = "";
                        // resultMapping
                        if(this.resultMapping && this.resultMapping[resultCode] !== void 0) {
                            resultDetail = `mappedFrom:${resultCode}:`;
                            resultCode = this.resultMapping[resultCode];
                            this.EVENT_UIRESULT.UIResult = resultCode;
                            this.EVENT_UIRESULT.UIDetailedResult = resultDetail;
                            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `. ViewService::endView resultMapping (no result detail) configured! Mapping to '${resultCode}'/'${resultDetail}'`);
                        }
                    } else {
                        // Do not let this one pass! It's an error!
                        _logger.error("ViewService::endView no resultDetail (interactionResult) argument given! Returning UIRESULT_ERROR_VIEW!");
                        this.EVENT_UIRESULT.UIResult = this.UIRESULT_ERROR_VIEW;
                        this.EVENT_UIRESULT.UIDetailedResult = "MISSING_INTERACTION_RESULT"; // just to be traceable
                    }
                } else {
                    // resultMapping
                    this.EVENT_UIRESULT.UIResult = resultCode;
                    this.EVENT_UIRESULT.UIDetailedResult = resultDetail;
                    if(this.resultMapping && this.resultMapping[resultCode] !== void 0) {
                        resultDetail = `mappedFrom:${resultCode}:`;
                        resultCode = this.resultMapping[resultCode];
                        this.EVENT_UIRESULT.UIResult = resultCode;
                        this.EVENT_UIRESULT.UIDetailedResult = resultDetail;
                        _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, `. ViewService::endView resultMapping (result detail given) configured! Mapping to '${resultCode}'/'${resultDetail}'`);
                    }
                }
                if(resultCode === this.UIRESULT_CANCEL_USER) {
                    value = "C";
                } else if(resultCode === this.UIRESULT_TIMEOUT_USER) {
                    value = "T";
                }
                if(value) {
                    this.serviceProvider.DataService.setValues("PROP_TRANSACTION_STATUS", value);
                }
                // Do not set contentRunning later (even not after _logger.log) because when using the send-event methods of the gateway the main thread is interruptable.
                // Then, Cancel() might be called, which also uses contentRunning. That must then aleady be false.
                // See also comment in processDisplay() method
                _logger.log(_logger.LOG_ANALYSE, `* | VIEW ------ endView ------ ${resultCode}/${resultDetail}`);
                this.fireServiceEvent(this.SERVICE_EVENTS.VIEW_CLOSING, {
                    initiator: "endView", viewKey: this.viewContext.viewKey, resultCode: resultCode, resultDetail: resultDetail
                });
            }
        }

        /**
         * See {@link Wincor.UI.Service.ViewService#cancel}.
         */
        cancel(message) {
            _logger.log(_logger.LOG_ANALYSE, `. ViewServiceMock::cancel('${JSON.stringify(message)}')`);
            if(this.contentRunning) {
                this.endView(this.UIRESULT_CANCEL_SW, this.UI_DETAILED_RESULT.CANCEL);
            }
        }

        /**
         * See {@link Wincor.UI.Service.ViewService#fireBeforePageChange}.
         */
        fireBeforePageChange(msg) {
            _logger.log(_logger.LOG_ANALYSE, `. ViewServiceMock::fireBeforePageChange(${JSON.stringify(msg)})`);
            this.fireServiceEvent(this.SERVICE_EVENTS.VIEW_BEFORE_CHANGE, msg);
        }


        /**
         * See {@link Wincor.UI.Service.ViewService#fireActivated}.
         * However there is no need to send {@link Wincor.UI.Service.ViewService#EVENT_ACTIVATED}, because there is no business logic.
         *
         */
        fireActivated() {
            _logger.log(_logger.LOG_ANALYSE, ". ViewServiceMock::fireActivated()");
            const handled = this.fireServiceEvent(this.SERVICE_EVENTS.VIEW_ACTIVATED, {
                href: this.getContentWindowDocument(this.CONTENT_FRAME_NAME).location.href,
                viewContext: jQuery.extend(true, {}, this.viewContext)
            });
            
            this.EVENT_ACTIVATED.viewID = this.viewContext.viewID;
            this.EVENT_ACTIVATED.viewKey = this.viewContext.viewKey;
            // toolingEDM
            if(this.viewContext.viewKeyRedirect) {
                this.EVENT_ACTIVATED.viewKey = this.viewContext.redirectFrom; // overwrite to satisfy tooling
                this.EVENT_ACTIVATED.redirectedToViewKey = this.viewContext.redirectTo;
            } else {
                delete this.EVENT_ACTIVATED.redirectedToViewKey;
            }
            this.sendEvent(this.EVENT_ACTIVATED);
            
            if(!handled) {
                // ada f.e will handle the timeouts by itself
                this.refreshTimeout();
            }
        }

        /**
         * See {@link Wincor.UI.Service.ViewService#firePopupNotification}.
         * However there is no need to send {@link Wincor.UI.Service.ViewService#EVENT_POPUP}, because there is no business logic.
         */
        firePopupNotification(active, type) {
            _logger.log(_logger.LOG_ANALYSE, `. ViewServiceMock::firePopupNotification(${type} active: ${active})`);
            this.fireServiceEvent(active?this.SERVICE_EVENTS.POPUP_ACTIVATED:this.SERVICE_EVENTS.POPUP_DEACTIVATED, type?type:void 0);
        }

        /**
         * See {@link Wincor.UI.Service.ViewService#fireContentUpdated}.
         * However there is no need to send {@link Wincor.UI.Service.ViewService#CONTENT_UPDATE}.
         */
        fireContentUpdated(data) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> ViewServiceMock::fireContentUpdated(${data})`);
            this.fireServiceEvent(this.SERVICE_EVENTS.CONTENT_UPDATE, data);
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `< ViewServiceMock::fireContentUpdated`);
        }
    
        /**
         * See {@link Wincor.UI.Service.ViewService#firePrepared}.
         * However there is no need to send {@link Wincor.UI.Service.ViewService#EVENT_PREPARED}, because there is no business logic.
         */
        firePrepared() {
            _logger.log(_logger.LOG_SRVC_INOUT, "> ViewServiceMock::firePrepared()");
            this.fireServiceEvent(this.SERVICE_EVENTS.VIEW_PREPARED);
            //this informs the subscribers that they  have to activate themselves
            if (this.autoActivate) {
                setTimeout(()=>this.fireServiceEvent(this.SERVICE_EVENTS.TURN_ACTIVE), 1);
            }
            _logger.log(_logger.LOG_SRVC_INOUT, "< ViewServiceMock::firePrepared");
        }

        /**
         * See {@link Wincor.UI.Service.ViewService#onTimeout}.
         */
        onTimeout() {
            _logger.log(_logger.LOG_SRVC_INOUT, "> ViewServiceMock::onTimeout()");
            this.interactionTimerId = null;
            if(!this.fireServiceEvent(this.SERVICE_EVENTS.VIEW_USERINTERACTION_TIMEOUT)) {
                this.endView(this.UIRESULT_TIMEOUT_USER);
            }
            else {
                _logger.log(_logger.LOG_ANALYSE, ". timeout was handled by one of the subscribers");
            }
            _logger.log(_logger.LOG_SRVC_INOUT, "< ViewServiceMock::onTimeout");
        }

        /**
         * See {@link Wincor.UI.Service.ViewService#refreshTimeout}.
         */
        refreshTimeout(newHigherTimeoutValue, force) {
            if(localStorage.getItem("activateTimeoutsOn") !== "true") { // do nothing if timeout handling isn't desired.
                return;
            }
            _logger.log(_logger.LOG_SRVC_INOUT, "> ViewServiceMock::refreshTimeout()");
            const orgInteractionTimeoutValue = this.interactionTimeoutValue; // for the case there is a foreign timeout handler (-isHandled=true)
            if(newHigherTimeoutValue && (force || (newHigherTimeoutValue > this.interactionTimeoutValue))) {
                _logger.log(_logger.LOG_DETAIL, `. updating timeout from ${this.interactionTimeoutValue}ms to ${newHigherTimeoutValue}ms`);
                this.interactionTimeoutValue = newHigherTimeoutValue;
            }
            const isHandled = this.fireServiceEvent(this.SERVICE_EVENTS.REFRESH_TIMEOUT, this.interactionTimeoutValue);
            if(!isHandled) {
                this.clearTimeout();
                if(this.interactionTimeoutValue === this.immediateTimeout) {
                    this.interactionTimerId = setTimeout(this.onTimeout.bind(this), 1); //1ms so that this method can return
                } else if(this.interactionTimeoutValue > this.immediateTimeout && this.contentRunning) {
                    this.interactionTimerId = setTimeout(this.onTimeout.bind(this), this.interactionTimeoutValue);
                }
            } else {
                this.interactionTimeoutValue = orgInteractionTimeoutValue; // restore
                _logger.log(_logger.LOG_SRVC_INOUT, ". ViewServiceMock::refreshTimeout not processed - event handled by subscriber: ");
            }
            _logger.log(_logger.LOG_SRVC_INOUT, `< ViewServiceMock::refreshTimeout - value: ${this.interactionTimeoutValue}`);
        }

        /**
         * See {@link Wincor.UI.Service.ViewService#resetUserInteractionTimeout}.
         */
        resetUserInteractionTimeout() {
            this.refreshTimeout();
        }

        /**
         * See {@link Wincor.UI.Service.ViewService#getTimeoutValue}.
         */
        getTimeoutValue() {
            return this.interactionTimeoutValue;
        }

        /**
         * See {@link Wincor.UI.Service.ViewService#clearTimeout}.
         */
        clearTimeout() {
            if(localStorage.getItem("activateTimeoutsOn") !== "true") { // do nothing if timeout handling isn't desired.
                return;
            }
            let done = false;
            _logger.log(_logger.LOG_SRVC_INOUT, "> ViewServiceMock::clearTimeout()");
            if(this.interactionTimerId !== 0) {
                window.clearTimeout(this.interactionTimerId);
                done = true;
                this.interactionTimerId = 0;
            }
            _logger.log(_logger.LOG_SRVC_INOUT, `< ViewServiceMock::clearTimeout returns done=${done}`);
        }

        /**
         * See {@link Wincor.UI.Service.ViewService#contentWindowExists}.
         */
        contentWindowExists() {
            return jQuery(this.CONTENT_FRAME_NAME).attr("src") !== "";
        }
    
        /**
         * Resizes/repositions the browser window.
         * @param {Object} posObject        Contains attributes `top`, `left`, `width` and `height` of type number.
         * @param {function=} callback      The callback function, which is called as soon as there is a response. Gets a number a boolean as argument -- `true` is for success.
         */
        resizeWindow(posObject, callback) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> ViewServiceMock::resizeWindow(${JSON.stringify(posObject)})`);
            if(typeof callback === "function") {
                callback();
            }
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< ViewServiceMock::resizeWindow");
        }
        
        /**
         * See {@link Wincor.UI.Service.ViewService#onError}, but on the contrary to that implementation, the view will not end.
         */
        onError(serviceName, errorType) {
            _logger.log(_logger.LOG_SRVC_INOUT, `> ViewServiceMock::onError(${serviceName}, ${errorType})`);
            _logger.log(_logger.LOG_SRVC_INOUT, "< ViewServiceMock::onError");
        }

        /**
         * See {@link Wincor.UI.Service.ViewService#suspend}.
         */
        suspend() {
            this.suspendId++;
            this.suspendList.push(this.suspendId);
            this.logger.LOG_SRVC_INOUT && this.logger.log(this.logger.LOG_SRVC_DATA, `> ViewService::suspend() isSuspended=${this.isSuspended}`);
            // Event is only sent on first call to suspend! When already suspended we just return suspendId
            if (!this.isSuspended) {
                this.fireServiceEvent(this.SERVICE_EVENTS.SUSPEND);
                this.isSuspended = true;
                this.clearTimeout();
            }
            this.logger.LOG_SRVC_INOUT && this.logger.log(this.logger.LOG_SRVC_DATA, `< ViewService::suspend returns suspendId ${this.suspendId}`);
            return this.suspendId;
        }

        /**
         * See {@link Wincor.UI.Service.ViewService#resume}.
         */
        resume(suspendId) {
            this.logger.LOG_SRVC_INOUT && this.logger.log(this.logger.LOG_SRVC_DATA, `> ViewService::resume(${suspendId}) of ${JSON.stringify(this.suspendList)}`);
            const index = this.suspendList.indexOf(suspendId);
            if (index > -1) {
                this.suspendList.splice(index, 1);
            }
            if (this.suspendList.length === 0) {
                this.isSuspended = false;
                this.fireServiceEvent(this.SERVICE_EVENTS.RESUME);
                this.refreshTimeout();
            }
            this.logger.LOG_SRVC_INOUT && this.logger.log(this.logger.LOG_SRVC_DATA, `< ViewService::resume - remaining:${JSON.stringify(this.suspendList)}`);
            return !this.isSuspended;
        }


        /**
         * See {@link Wincor.UI.Service.ViewService#bringToFront}, but not implemented by the mock, because there is no need for window handling.
         */
        bringToFront(callback) {
            _logger.log(_logger.LOG_SRVC_INOUT, "> ViewServiceMock::bringToFront()");
            if(callback) {
                callback({RC: 0});
            }
            _logger.log(_logger.LOG_SRVC_INOUT, "< ViewServiceMock::bringToFront");
        }

        /**
         * See {@link Wincor.UI.Service.ViewService#readConfiguration}.
         *
         * The Mock's implementation will just call {@link Wincor.UI.Service.ViewService#onSetup}, because in that function we will read the configuration.
         */
        readConfiguration() {
            _logger.log(_logger.LOG_SRVC_INOUT, "> ViewServiceMock::update()");
            this.onSetup({viewSetName: this.viewSetName});
            _logger.log(_logger.LOG_SRVC_INOUT, "< ViewServiceMock::update");
        }


        /**
         * See {@link Wincor.UI.Service.ViewService#swapLocation}, but not implemented by the mock, because there is no need for window handling.
         */
        swapLocation(targetInstance="") {
            _logger.log(_logger.LOG_DETAIL, `* ViewServiceMock::swapLocation(${targetInstance}) not implemented in mock.`);
            return ext.Promises.Promise.resolve(0);
        }
        

        /**
         * See {@link Wincor.UI.Service.ViewService#loadViewSet}.
         */
        async loadViewSet(viewSetName, immediately) {
            this.loadingViewSet = true;
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `> | VIEW ViewServiceMock::loadViewSet viewSetName=${viewSetName}, immediately=${immediately}`);
            const oldViewSetName = this.viewSetName;
            this.previousViewUrl = "";
            this.viewSetName = viewSetName !== "" ? viewSetName : this.initialViewSet; // use initial view set if viewSetName is empty
            // read defaultConfig and uimapping of this viewset
            await this.onSetup({viewSetName: this.viewSetName});
            try {
                _logger.log(_logger.LOG_SRVC_DATA, "* ViewServiceMock::loadViewSet ready reading viewkeys of " + viewSetName);
                this.startURL = this.urlMapping[this.viewSetName];
                if(immediately) {
                    _logger.log(_logger.LOG_SRVC_DATA, ". | VIEW ViewServiceMock::loadViewSet immediately restarting...");
                    this.registerForServiceEvent(this.SERVICE_EVENTS.VIEW_ACTIVATED, () => {
                        setTimeout(() => {
                            this.restarting = false;
                            _logger.log(_logger.LOG_SRVC_DATA, ". | VIEW ViewServiceMock::loadViewSet navigating");
                            this.endView(this.UIRESULT_CANCEL_SW);
                        }, 250);
                    }, this.DISPOSAL_TRIGGER_ONETIME);
                    this.restarting = true;
                    _logger.log(_logger.LOG_SRVC_DATA, ". | VIEW ViewServiceMock::loadViewSet immediately loading into content.");
                    // restart the SPA with the current view URL.
                    // The real runtime would do a new display, so that at this place (in real ViewService) is a startSPA instead
                    this.reStartSPA(this.viewContext.viewURL);
                } else {
                    _logger.log(_logger.LOG_SRVC_DATA, ". | VIEW ViewServiceMock::loadViewSet postponing restart");
                    this.isRestartOnNextDisplay = true; // postpone restart
                }
                this.loadingViewSet = false;
            } catch(e) {
                this.serviceProvider.propagateError(this.NAME, "loadViewSet", e);
                this.loadViewSet(oldViewSetName, true);
                throw e;
            }
            _logger.log(_logger.LOG_SRVC_INOUT, "< ViewServiceMock::loadViewSet");
        }
    
        /**
         * This will read (again) all data from the JSON files.
         * This was originally done in onSetup, but now moved into a separate function, to be called anytime.
         *
         * @async
         */
        async updateJSONData() {
            this.logger.log(this.logger.LOG_SRVC_INOUT, "> ViewServiceMock::updateJSONData()");
            const [profile, profileExtension] = await this.getToolingProfile();
            if(profile === "") {
                const FILE_VIEW_MAPPINGS = `../servicemocks/mockdata/${this.viewSetName}/ViewMappings.json`;
                const FILE_VIEW_MAPPINGS_CUSTOM = `../servicemocks/mockdata/${this.viewSetName}/ViewMappingsCustom.json`;
                const FILE_VIEW_MAPPINGS_DEFAULTS = `../servicemocks/mockdata/${this.viewSetName}/ViewMappingsDefaults.json`;
                const FILE_VIEW_MAPPINGS_DEFAULTS_CUSTOM = `../servicemocks/mockdata/${this.viewSetName}/ViewMappingsDefaultsCustom.json`;
                const FILE_VIEW_MAPPINGS_CONSTS = `../servicemocks/mockdata/${this.viewSetName}/ViewMappingsConsts.json`;
                try {
                    const mappingArray = await Promise.all([
                        this.retrieveJSONData(FILE_VIEW_MAPPINGS),                  // 0
                        this.retrieveJSONData(FILE_VIEW_MAPPINGS_CUSTOM),           // 1
                        this.retrieveJSONData(FILE_VIEW_MAPPINGS_DEFAULTS),         // 2
                        this.retrieveJSONData(FILE_VIEW_MAPPINGS_DEFAULTS_CUSTOM),  // 3
                        this.retrieveJSONData(FILE_VIEW_MAPPINGS_CONSTS)]);         // 4
                    delete mappingArray[1]["//"]; // remove possible comment from MappingsCustom
                    delete mappingArray[3]["//"]; // remove possible comment from MappingsDefaultCustom
                    this.viewMappings = Object.assign({}, mappingArray[0], mappingArray[1]);  // mapping
                    const templateViewKeyList = Object.assign({}, mappingArray[2], mappingArray[3]);
                    // replace viewKey default variables with their concrete values:
                    this.replaceInMapping(this.viewMappings, templateViewKeyList); // replace with defaults (aka viewkey templates)
                    // Tooling EDM: Add the default (aka viewkey templates) to the viewkey mapping list as well
                    if(Wincor.toolingEDM) {
                        Object.assign(this.viewMappings, templateViewKeyList);
                    }
                    // replace viewKey default variables with their concrete values:
                    this.replaceInMapping(this.viewMappings, mappingArray[4]); // constants
                    // delete unnecessary stuff
                    delete this.viewMappings.Defaults;
                    delete this.viewMappings.Index;
                    this.viewContext.viewKeyList = []; // reset
                    const viewKeys = Object.keys(this.viewMappings);
                    for(let i = 0; i < viewKeys.length; i++) {
                        const key = viewKeys[i]; // view key
                        const value = this.viewMappings[key];
                        if(!value.url) {
                            throw `UIMapping: Mapping for viewKey=${key} is invalid due to missing or invalid, mandatory 'url' attribute !`;
                        }
                        this.viewContext.viewKeyList.push({name: key, url: value.url, viewConfig: value});
                    }
                    this.logger.log(this.logger.LOG_SRVC_INOUT, "< ViewServiceMock::onSetup");
                } catch(e) {
                    console.error(`* importReference error getting ${FILE_VIEW_MAPPINGS}, ${FILE_VIEW_MAPPINGS_CUSTOM}, ${FILE_VIEW_MAPPINGS_DEFAULTS}, ${FILE_VIEW_MAPPINGS_DEFAULTS_CUSTOM} or ${FILE_VIEW_MAPPINGS_CONSTS}`);
                    throw e;
                }
            } else { //Tooling 2.0
                const FILE_VIEW_MAPPINGS = `../servicemocks/mockdata/${this.viewSetName}/ViewMappings${profileExtension}.json`;
                const FILE_VIEW_MAPPINGS_TEMPLATES = `../servicemocks/mockdata/${this.viewSetName}/ViewMappingsTemplates${profileExtension}.json`;
                const FILE_VIEW_MAPPINGS_CONSTS = `../servicemocks/mockdata/${this.viewSetName}/ViewMappingsConsts${profileExtension}.json`;
                try {
                    const mappingArray = await Promise.all([
                        this.retrieveJSONData(FILE_VIEW_MAPPINGS),             // 0
                        this.retrieveJSONData(FILE_VIEW_MAPPINGS_TEMPLATES),   // 1
                        this.retrieveJSONData(FILE_VIEW_MAPPINGS_CONSTS)]);    // 2
                    this.viewMappings = Object.assign({}, mappingArray[0]);
                    const templateViewKeyList = Object.assign({}, mappingArray[1]);
                    // replace viewKey default variables with their concrete values:
                    this.replaceTemplateUsage(this.viewMappings, templateViewKeyList); // templates
                    // Tooling EDM: Add the default (aka viewkey templates) to the viewkey mapping list as well
                    if(Wincor.toolingEDM) {
                        Object.assign(this.viewMappings, templateViewKeyList);
                    }
                    // replace viewKey default variables with their concrete values:
                    this.replaceInMapping(this.viewMappings, mappingArray[2]); // constants
                    // delete unnecessary stuff
                    delete this.viewMappings.Index;
                    this.viewContext.viewKeyList = []; // reset
                    const viewKeys = Object.keys(this.viewMappings);
                    for(let i = 0; i < viewKeys.length; i++) {
                        const key = viewKeys[i]; // view key
                        const value = this.viewMappings[key];
                       if (!value.url) {
                            throw `UIMapping for tooling: Mapping for viewKey=${key} is invalid due to missing or invalid, mandatory 'url' attribute !`;
                        }
                        this.viewContext.viewKeyList.push({name: key, url: value.url, data: value});
                    }
                    this.logger.log(this.logger.LOG_SRVC_INOUT, "< ViewServiceMock::updateJSONData");
                } catch(e) {
                    console.error(`* importReference error getting ${FILE_VIEW_MAPPINGS}, ${FILE_VIEW_MAPPINGS_TEMPLATES} or ${FILE_VIEW_MAPPINGS_CONSTS}`);
                    throw e;
                }
            }
        }
        
        /**
         * See {@link Wincor.UI.Service.BaseServiceMock#onSetup}.
         * The ViewServiceMock implementation will read the data from the Tooling-generated JSON files.
         * @param {Object} message
         * @returns {Promise}
         * @see {@link Wincor.UI.Service.BaseServiceMock#onSetup}
         * @lifecycle service
         */
        onSetup(message) {
            _logger.log(_logger.LOG_SRVC_INOUT, `> ViewServiceMock::onSetup('${JSON.stringify(message)}')`);
            if(message && message.viewSetName) { // used on further setups by loadViewSet
                this.viewSetName = message.viewSetName;
            } else { // this is the initial viewset setup
                this.viewSetName = localStorage.getItem("currentViewSet") || "softkey";
                this.initialViewSet = this.viewSetName;
            }
            return ext.Promises.promise(async(resolve, reject) => {
                try {
                    await this.updateJSONData();
                    resolve();
                } catch(e) {
                    reject(e);
                }
                this.logger.log(this.logger.LOG_SRVC_INOUT, "< ViewServiceMock::onSetup");
            });
        }

        /**
         * Registers an "ADA state change handler" function if an 'adaViewSet' is configured.
         * Registers a "Style Type handler" function.
         * Reads the properties `PROP_UI_VIEWSET_KEY` and `PROP_UI_STYLE_TYPE_KEY`.
         * If all other services are ready, it calls {@link Wincor.UI.Service.ViewService#startSPA} to load the initial URL.
         * @returns {Promise}
         * @lifecycle service
         * @see {@link Wincor.UI.Service.BaseServiceMock#onServicesReady}
         */
        onServicesReady() {
            _logger.log(_logger.LOG_SRVC_INOUT, "> ViewServiceMock::onServicesReady()");
            const self = this;
            let hasAdaStarted = false; // flag (closured by -adaStateChangeHandler) to prevent from loadingViewSet only because CCTAFW_PROP_ADA_STATUS_VALUE has been stopped without started.
            return ext.Promises.promise((resolve, reject) => {
                const instanceName = Wincor.UI.Service.Provider.ConfigService.configuration.instanceName;
                Wincor.UI.Service.Provider.ConfigService.getConfiguration(`${instanceName}\\Services\\General`, ["InitialViewSet", "AdaViewSet", "CacheHTML", "BeepOnTimeoutPopup", "BeepOnTimeoutPopupPeriod"])
                .then(configData => {
                    // only if we don't have a current viewset either from button choose at startExtDesignmode or via query argument 'viewSet' we get config value as a fallback:
                    if(!localStorage.getItem("currentViewSet")) {
                        self.initialViewSet = configData["InitialViewSet"];
                    }
                    self.adaViewSet = configData["AdaViewSet"];
                    // normalize/check boolean config
                    self.cacheHTML = !!configData["CacheHTML"];
                });
                if(localStorage.getItem("activateTimeoutsOn") === "true") {
                    Wincor.UI.Service.Provider.ConfigService.getConfiguration(`${instanceName}\\Services\\Timeouts`, null)
                    .then(timeoutResults => {
                        _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `* ViewServiceMock::onServicesReady(): default timeouts = ${JSON.stringify(timeoutResults)}`);
                        self.DEFAULT_TIMEOUT_VALUES = Object.assign(self.DEFAULT_TIMEOUT_VALUES, timeoutResults);
                        _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `* ViewServiceMock::onServicesReady(): this.DEFAULT_TIMEOUT_VALUES = ${JSON.stringify(self.DEFAULT_TIMEOUT_VALUES)}`);
                        // set variables for timeouts
                        self.pageTimeout = timeoutResults.PageTimeout;
                        self.immediateTimeout = timeoutResults.ImmediateTimeout;
                        self.endlessTimeout = timeoutResults.EndlessTimeout;
                        self.messageTimeout = timeoutResults.MessageTimeout;
                        self.confirmationTimeout = timeoutResults.ConfirmationTimeout;
                        self.inputTimeout = timeoutResults.InputTimeout;
                        self.pinentryTimeout = timeoutResults.PinentryTimeout;
                    });
                }
                // register for ada events to auto switch viewset only if configured
                if(self.adaViewSet) {
                    const adaService = Wincor.UI.Service.Provider.AdaService;
                    // Please note that this state handler will often be triggered because the business app often changes the value CCTAFW_PROP_ADA_STATUS_VALUE property.
                    // That's why we control the updates with an own flag called -hasAdaStarted
                    const adaStateChangedHandler = function(eventData) {
                        self.logger.log(self.logger.LOG_ANALYSE, `* ViewServiceMock::onServicesReady::adaStateChangedHandler eventData=${eventData}, current ViewSet=${self.viewSetName}, ada ViewSet=${self.adaViewSet}`);
                        if(eventData === "FIRSTSTARTANDACTIVATE" || eventData === "FIRSTSTART") {
                            hasAdaStarted = true; // ADA has been really started now
                            const startViewKey = Wincor.UI.Service.Provider.ControlPanelService.getContext()?.controlPanelData?.Ada?.StartViewKey ?? "LanguageSelection";
                            // switch to ada view set on next view if not already active
                            if(self.viewSetName.toLowerCase() !== self.adaViewSet.toLowerCase()) {
                                self.logger.log(self.logger.LOG_ANALYSE, `* ViewServiceMock::onServicesReady::adaStateChangedHandler  - loading viewset for ada -> ${self.adaViewSet}`);
                                self.loadViewSet(self.adaViewSet).then(() => {
                                    adaService.externalAdaCommandAck(eventData); // send acknowledge with first start
                                    self.display({viewKey: startViewKey, viewURL: "selection"}); // start e.g. language selection for ADA
                                }).catch(cause => {
                                    hasAdaStarted = false;
                                    self.logger.error(`* ViewServiceMock::onServicesReady::adaStateChangedHandler error loading new view set due to ADA first start event ${cause}`);
                                    adaService.externalAdaCommandAck(eventData); // send acknowledge with first start anyway
                                });
                            } else {
                                self.logger.log(self.logger.LOG_ANALYSE, "* ViewServiceMock::onServicesReady::adaStateChangedHandler viewset for ada already active");
                                adaService.externalAdaCommandAck(eventData); // send acknowledge with first start anyway
                                self.display({viewKey: startViewKey, viewURL: "selection"}); // start e.g. language selection for ADA
                            }
                        } else if(hasAdaStarted && eventData === "LASTSTOP") { // ADA has been started before?
                            hasAdaStarted = false;
                            if(self.viewSetName.toLowerCase() !== self.initialViewSet.toLowerCase()) {
                                self.logger.log(self.logger.LOG_ANALYSE, `* ViewServiceMock::onServicesReady::adaStateChangedHandler - ADA stop event, loading initial viewset -> ${self.initialViewSet}`);
                                self.loadViewSet(self.initialViewSet, true).then(() => {
                                    adaService.externalAdaCommandAck(eventData); // send acknowledge with last stop
                                }).catch(cause => {
                                    self.logger.error(`* ViewServiceMock::onServicesReady::adaStateChangedHandler error loading initial view set due to ADA last stop event ${cause}`);
                                    adaService.externalAdaCommandAck(eventData); // send acknowledge with last stop anyway
                                });
                            } else {
                                self.logger.log(self.logger.LOG_ANALYSE, "* ViewServiceMock::onServicesReady::adaStateChangedHandler viewset for ending ada already active");
                                adaService.externalAdaCommandAck(eventData); // send acknowledge with last stop anyway
                            }
                        }
                    };
                    self.registerForServiceEvent(adaService.SERVICE_EVENTS.FIRST_START, adaStateChangedHandler, true);
                    self.registerForServiceEvent(adaService.SERVICE_EVENTS.LAST_STOP, adaStateChangedHandler, true);
                } else {
                    self.logger.log(self.logger.LOG_ANALYSE, "* ViewServiceMock::onServicesReady(): no valid AdaViewSet configured... disabling automatic switching");
                }

                // BEGIN retrieving style type stuff -->
                const PROP_UI_STYLE_TYPE_KEY = "PROP_UI_STYLE_TYPE_KEY";
                let reg = -1;
                // PROP_UI_STYLE_TYPE_KEY callback on initial/update
                function changeStyleType(result) {
                    _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> ViewServiceMock::onServicesReady::changeStyleType result=${JSON.stringify(result)}`);
                    const styleTextKey = result[PROP_UI_STYLE_TYPE_KEY];
                    if(styleTextKey !== null && styleTextKey !== void 0) {
                        // Remark: Even if the styleTextKey is empty force a getText call, in such a case the result will be empty but the
                        // StyleResourceResolver will handle this case.
                        Wincor.UI.Service.Provider.LocalizeService.getText([styleTextKey], result => {
                            let value = result[styleTextKey];
                            // map value to the right default, if empty or undefined
                            value = (value === "" || value === void 0 || value === null || value === "\\" || value === "\"\"") ? "" : value;
                            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `* ViewServiceMock::onServicesReady::changeStyleType type='${value}'`);
                            self.currentStyleTypeByStylesheetKey = value;
                            if(!self.isRestartOnNextDisplay) {
                                self.fireServiceEvent(self.SERVICE_EVENTS.STYLE_TYPE_CHANGED, value);
                            } else {
                                // viewset will change on next display - postpone event until new viewset is loaded
                                _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, "* ViewServiceMock::onServicesReady::changeStyleType postponing fire STYLE_TYPE_CHANGED.");
                                if(reg !== -1) {
                                    self.deregisterFromServiceEvent(reg);
                                }
                                reg = self.registerForServiceEvent(self.SERVICE_EVENTS.VIEW_ACTIVATED, eventData => {
                                        const href = typeof eventData === "string" ? eventData : eventData.href;
                                    if (href && href.endsWith("index.html")) { // check for welcome and then fire style event
                                        _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `* ViewServiceMock::onServicesReady::changeStyleType viewset ${self.viewSetName} loaded (welcome).`);
                                        // decouple
                                        setTimeout(() => {
                                            self.fireServiceEvent(self.SERVICE_EVENTS.STYLE_TYPE_CHANGED, value);
                                            self.deregisterFromServiceEvent(reg);
                                            reg = -1;
                                        }, 1);
                                    }
                                },
                                true);
                            }
                        }, false); // no auto update on language changed
                    } else { // PROP_UI_STYLE_TYPE_KEY not existent
                        _logger.error(`The property=${PROP_UI_STYLE_TYPE_KEY} doesn't exist which is unexpected!`);
                    }
                    _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< ViewServiceMock::onServicesReady::changeStyleType");
                }
                Wincor.UI.Service.Provider.DataService.getValues([PROP_UI_STYLE_TYPE_KEY], changeStyleType, changeStyleType, true);
                //<-- END retrieving stylesheet folder stuff

                // Read view set property
                const PROP_UI_VIEWSET_KEY = "PROP_UI_VIEWSET_KEY";
                // read property and read text key for view-set switching
                const checkViewSetTextEntry = function(result) {
                    const viewSetKey = result[PROP_UI_VIEWSET_KEY];
                    _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `> ViewServiceMock::onServicesReady:checkViewSetTextEntry viewSetKey = ${viewSetKey}`);
                    if(viewSetKey && viewSetKey !== "\"\"") { // got a text key?
                        self.serviceProvider.LocalizeService.getText([viewSetKey], result => {
                            const viewSetName = result[viewSetKey];
                            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `* ViewServiceMock::onServicesReady:checkViewSetTextEntry demanded view set name=${viewSetName}, current view set name=${self.viewSetName}`);
                            if(viewSetName !== null && viewSetName !== self.viewSetName) { // only if the demanded viewset is not already the current
                                _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< ViewServiceMock::onServicesReady:checkViewSetTextEntry");
                                return self.loadViewSet(viewSetName);
                            }
                        });
                    } else if(self.viewSetName !== self.initialViewSet) {
                        _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `< ViewServiceMock::onServicesReady:checkViewSetTextEntry load initial view set=${self.initialViewSet}`);
                        return self.loadViewSet(self.initialViewSet);
                    }
                    _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< ViewServiceMock::onServicesReady:checkViewSetTextEntry did nothing");
                    return ext.Promises.Promise.resolve();
                };

                _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, "* ViewServiceMock::onServicesReady getting viewSetKey");
                Wincor.UI.Service.Provider.DataService.getValues([PROP_UI_VIEWSET_KEY], null, result => { // changed callback
                    _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `* ViewServiceMock::onServicesReady restarting=${self.restarting} viewSetKey changed to ${JSON.stringify(result)}`);
                    if(!self.restarting) {
                        checkViewSetTextEntry(result).then(resolve);
                    } else {
                        resolve();
                    }
                }, true);

                // initial view set starting SPA...
                // when all other services are ready, we start SPA
                const svcNames = [];
                const serviceDependenciesReady = self.serviceProvider.serviceNames
                    .filter(svcName => {
                        const isServiceToWaitFor = svcName !== self.NAME;
                        if (isServiceToWaitFor) {
                            svcNames.push(svcName);
                        }
                        return isServiceToWaitFor;
                    })
                    .map((svcName) => {
                        return self.serviceProvider[svcName].whenReady;
                    });
                ext.Promises.Promise.all(serviceDependenciesReady)
                    .timeout(20000) // security timeout... If there is a deadlock somewhere it will nevertheless be safe to launch now
                    .catch(reason => {
                        // if it is timeout only, recover and pass
                        if(!(reason && reason.name === "TimeoutError")) {
                            throw(reason);
                        }
                        _logger.error(`WARNING: ViewService::onServicesReady():\nTimeout waiting for depending services! - Please check syncing of services:\n${svcNames.join("\n")}`);
                    })
                    .then(() => {
                        _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `* ViewService::onServicesReady(): all services ready - starting content`);
                        if(self.viewSetName === "touch") {
                            self.startSPA(self.urlMapping.touch);
                            super.onServicesReady().then(resolve);
                        } else if(self.viewSetName === "softkey") {
                            self.startSPA(self.urlMapping.softkey);
                            super.onServicesReady().then(resolve);
                        } else {
                            _logger.error("ViewServiceMock::onServicesReady initial view set name not set or unknown.");
                            super.onServicesReady().then(reject);
                        }
                    });
                _logger.log(_logger.LOG_SRVC_INOUT, "< ViewServiceMock::onServicesReady");
            });
        }
    }
};

/**
 * The ViewServiceMock class provides methods for view handling and events of the view's lifecycle.
 *
 * @function getServiceClass
 * @param {jQuery} jQuery
 * @param {Wincor} Wincor
 * @param {Class} Class
 * @param {BaseService} BaseService
 * @param {ext} ext
 * @param {LogProvider} LogProvider
 * @returns {Wincor.UI.Service.Provider.ViewService}
 * @class
 * @since 1.2/00
 */
export default getServiceClass;
