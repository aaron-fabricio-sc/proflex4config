/**
 @preserve
 Copyright (c) 2001-2021 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ wn.UI.Service.ViewService.js 4.3.1-210702-21-a51e474c-1a04bc7d

*/

/**
 * @module
 */
const getServiceClass = ({ Wincor, jQuery, ext, LogProvider, PTService }) => {
    /**
     * The logger.
     *
     * @type {Wincor.UI.Diagnostics.LogProvider}
     * @const
     */
    const _logger = LogProvider;

    /**
     * Marks the start of a property inside another string.
     * @type {String}
     * @const
     */
    const PROP_MARKER = "[&";

    /**
     * Marks the end of a property inside another string.
     * @type {String}
     * @const
     */
    const PROP_END_MARKER = "&]";

    /**
     * Marks the start of a replace-string inside another string.
     * @type {String}
     * @const
     */
    const VAR_REPLACE_MARKER = "(#";

    /**
     * Marks the end of a replace-string inside another string.
     * @type {String}
     * @const
     */
    const VAR_REPLACE_END_MARKER = "#)";

    let STYLE_ID = 0;

    /**
     * The states of the GUI impl.
     * @type {{DISPLAY_SYNC: number, WAIT_FOR_CANCELLATION: number, INIT: number, DISPLAY: number, PREPARE: number, ERROR: number, WAIT: number, WAIT_FOR_PREPARATION: number, UN_INIT: number, WAIT_FOR_ACTIVATION_SYNC: number, WAIT_FOR_ACTIVATION: number}}
     */
    const GUI_STATUS = {
        UN_INIT: 0,
        INIT: 1,
        WAIT: 2,
        DISPLAY: 3,
        PREPARE: 6,
        ERROR: 8,
        WAIT_FOR_PREPARATION: 9,
        WAIT_FOR_ACTIVATION: 10,
        DISPLAY_SYNC: 11,
        WAIT_FOR_ACTIVATION_SYNC: 12,
        WAIT_FOR_CANCELLATION: 13
    };

    return class ViewService extends PTService {
        /**
         * The logical name of this service as used in the service-provider.
         * @const
         * @type {string}
         * @default ViewService
         */
        NAME = "ViewService";

        /**
         * Holds the `viewKey` and the `viewID`, which are sent from the business logic.
         *
         * The `viewURL` is retrieved from the viewkey-configuration and the same as `viewConfig.url`.
         *
         * The `viewID` is a continuous number, which helps the business logic to match requests, return codes and events to the appropriate Display() requests.
         * Because the communication is asynchronouse (events can overtake each other, can arrive before a apprpriate response etc.) it is important to know, to which viewID an event belongs.
         *
         * Holds the viewKey-specific `viewConfig`, which is read from the configuration.
         *
         * @example
         * viewContext = {
         *   viewKey = "PrepaidChargingNumberReceiptQuestion",
         *   viewURL = "question.html",
         *   viewID = 562,
         *   viewConfig = {"commandconfig":{"CANCEL":"3","YES":"0"},"timeout":20000,"url":"question.html"}
         * }
         * @type {Object}
         */
        viewContext = null;

        /**
         * ID for the interactionTimeout supplied by the call to {@link Wincor.UI.Service.ViewService#display}.
         * @type {Number}
         * @default 0
         */
        interactionTimerId = 0;

        /**
         * Interaction-timeout supplied by the call to {@link Wincor.UI.Service.ViewService#display}.
         * @type {Number}
         * @default -1
         */
        interactionTimeoutValue = -1;

        /**
         * This flag is true if content is currently interactive, false otherwise.
         * @type {Boolean}
         * @default false
         */
        contentRunning = false;

        /**
         * This flag is true if a popup is currently active, false otherwise.
         * Actually the flag is set/reset when {@link Wincor.UI.Service.ViewService#firePopupNotification} is called.
         * @type {Boolean}
         * @default false
         */
        popupActive = false;

        /**
         * Flag gets set when you call {@link Wincor.UI.Service.ViewService#display}. It means the view will
         * automatically get activated when it is initialized successfully.
         * It is set to false, if you call {@link Wincor.UI.Service.ViewService#prepare}. In this case
         * {@link Wincor.UI.Service.ViewService#activate} has to be called after the event
         * {@link Wincor.UI.Service.ViewService#EVENT_PREPARED} has been received.
         * @type {Boolean}
         * @default true
         */
        autoActivate = true;

        /**
         * Defines the default page that is displayed if a call to {@link Wincor.UI.Service.ViewService#display} did not contain a viewKey.
         * @type {string}
         * @default ../../content_xy/views/outofservice.html
         */
        errorURL = "../../content_*/views/outofservice.html";

        /**
         * The first URL that gets loaded by {@link Wincor.UI.Service.ViewService#startSPA}.
         * @type {string}
         * @default "../../content_softkey/views/index.html"
         */
        startURL = "../../content_softkey/views/index.html";

        /**
         * The previous URL which was displayed.
         * @type {string}
         * @default ""
         */
        previousViewUrl = "";

        /**
         * Flag that tells if the next view will change the viewset. The new viewset has already been loaded!
         * @type {boolean}
         * @default false
         */
        isRestartOnNextDisplay = false;

        /**
         * This object contains all view-service events, for which other services or view-models can register itself.
         * @enum {string}
         */
        SERVICE_EVENTS = {
            /**
             * Sent if 'navigation' should be started. Used by shell.js to operate durandal router sends data as object.
             * @event Wincor.UI.Service.ViewService#SERVICE_EVENTS:NAVIGATE_SPA
             * @eventtype service
             */
            NAVIGATE_SPA: "NAVIGATE_SPA",

            /**
             * Sent if a view is about to get inactive.
             * This event can be used to clean up before the current view-context is destroyed.
             * @type {string}
             * @event Wincor.UI.Service.ViewService#SERVICE_EVENTS:VIEW_CLOSING
             * @eventtype service
             */
            VIEW_CLOSING: "VIEW_CLOSING",

            /**
             * Sent if a new view is about to be initialized.
             * @type {string}
             * @event Wincor.UI.Service.ViewService#SERVICE_EVENTS:VIEW_BEFORE_CHANGE
             * @eventtype service
             */
            VIEW_BEFORE_CHANGE: "VIEW_BEFORE_CHANGE",

            /**
             * Sent if a view (all included view-models) has retrieved all initial text and data values.
             * At this stage also the DOM has been scanned and prepared for commanding.
             * When receiving this event the view is neither active nor visible to the customer.
             * @type {string}
             * @event Wincor.UI.Service.ViewService#SERVICE_EVENTS:VIEW_PREPARED
             * @eventtype service
             */
            VIEW_PREPARED: "VIEW_PREPARED",

            /**
             * Sent if a view has to turn interactive and visible.
             * @type {string}
             * @event Wincor.UI.Service.ViewService#SERVICE_EVENTS:TURN_ACTIVE
             * @eventtype service
             */
            TURN_ACTIVE: "TURN_ACTIVE",

            /**
             * Triggered if a viewModel updates its content and has notified the baseViewModel.
             * Empty string or a new prefix for localization.
             * @type {string}
             * @event Wincor.UI.Service.ViewService#SERVICE_EVENTS:CONTENT_UPDATE
             * @eventtype service
             */
            CONTENT_UPDATE: "CONTENT_UPDATE",

            /**
             * Sent if a view is ready to receive customer input.
             * data: {Object} viewContext
             * @type {string}
             * @event Wincor.UI.Service.ViewService#SERVICE_EVENTS:VIEW_ACTIVATED
             * @eventtype service
             */
            VIEW_ACTIVATED: "VIEW_ACTIVATED",

            /**
             * Sent if a view-timeout occurred.
             * @type {string}
             * @event Wincor.UI.Service.ViewService#SERVICE_EVENTS:VIEW_USERINTERACTION_TIMEOUT
             * @eventtype service
             */
            VIEW_USERINTERACTION_TIMEOUT: "VIEW_USERINTERACTION_TIMEOUT",

            /**
             * Sent if the appropriated business logic property has changed.
             * @type {string}
             * @event Wincor.UI.Service.ViewService#SERVICE_EVENTS:STYLE_TYPE_CHANGED
             * @eventtype service
             */
            STYLE_TYPE_CHANGED: "STYLE_TYPE_CHANGED",

            /**
             * Sent if a popup has been activated
             * @type {string}
             * @event Wincor.UI.Service.ViewService#SERVICE_EVENTS:POPUP_ACTIVATED
             * @eventtype service
             * @example
             * eventData: {String} popupType
             */
            POPUP_ACTIVATED: "POPUP_ACTIVATED",

            /**
             * Sent if a popup has been deactivated
             * @type {string}
             * @event Wincor.UI.Service.ViewService#SERVICE_EVENTS:POPUP_DEACTIVATED
             * @eventtype service
             * @example
             * eventData: {String} popupType
             */
            POPUP_DEACTIVATED: "POPUP_DEACTIVATED",

            /**
             * Sent when the timeout is about to be refreshed, the timeout is sent as data
             * type {string}
             * @event Wincor.UI.Service.ViewService#SERVICE_EVENTS:REFRESH_TIMEOUT
             * @eventtype service
             */
            REFRESH_TIMEOUT: "REFRESH_TIMEOUT",

            /**
             * Sent if the viewset is about to change (the complete application-host page is reloaded)
             * @event Wincor.UI.Service.ViewService#SERVICE_EVENTS:SHUTDOWN
             * @eventtype service
             */
            SHUTDOWN: "SHUTDOWN",

            /**
             * The view service fires this event when the current view should get suspended
             * @event Wincor.UI.Service.ViewService#SERVICE_EVENTS:SUSPEND
             * @eventtype service
             */
            SUSPEND: "SUSPEND",

            /**
             * This event tells to resume a currently suspended view
             * @event Wincor.UI.Service.ViewService#SERVICE_EVENTS:RESUME
             * @eventtype service
             */
            RESUME: "RESUME",

            /**
             * Sent when the baseLocation changes due to active monitor
             * event data: object with new basLocation data
             * @event Wincor.UI.Service.ViewService#SERVICE_EVENTS:LOCATION_CHANGED
             * @eventtype service
             * @example
             * {
             *   source: {
             *      instanceName: "nnn",
             *      location: {
             *        top: y,
             *        left: x,
             *        width: w,
             *        height: h
             *      }
             *   },
             *   target: {
             *      instanceName: "mmm",
             *      location: {
             *        top: y,
             *        left: x,
             *        width: w,
             *        height: h
             *      }
             *   }
             * }
             */
            LOCATION_CHANGED: "LOCATION_CHANGED"
        };

        /**
         * Name of the event being sent to the business-logic if a view ends.
         * @const
         * @type {String}
         * @private
         */
        EVENT_NAME_UIRESULT = "UIResult";

        /**
         * This event is sent if a view ends.
         * The EVENT_UIRESULT object extends {@link Wincor.UI.Service.BaseService#EVENT} with the following elements:<br>
         * <code>EVENT_UIRESULT.UIResult: {string}</code><br>
         * <code>EVENT_UIRESULT.UIDetailedResult: {string}</code><br>
         * @eventtype native
         * @event  Wincor.UI.Service.ViewService#EVENT_UIRESULT
         * @type {object}
         */
        EVENT_UIRESULT = null;

        /**
         * This event is sent if a view is interactive and ready to receive input from the customer.
         * When a view gets active, the interactive-timeout is started, which will fire the event:
         * {@link Wincor.UI.Service.ViewService.SERVICE_EVENTS#VIEW_USERINTERACTION_TIMEOUT} to registered callbacks and
         * the appropriate timeout-event to the business-logic.
         * @type {Object}
         * @eventtype native
         * @event  Wincor.UI.Service.ViewService#EVENT_ACTIVATED
         */
        EVENT_ACTIVATED = null;

        /**
         * This event is sent if a view is activating / deactivating a popup.
         * @type {Object}
         * @eventtype native
         * @event  Wincor.UI.Service.ViewService#EVENT_POPUP
         */
        EVENT_POPUP = null;

        /**
         * This event is sent when the current view has gathered initial text and data, but before a data-binding has
         * been established. The view is not yet visible at that moment.
         * @type {Object}
         * @eventtype native
         * @event  Wincor.UI.Service.ViewService#EVENT_PREPARED
         */
        EVENT_PREPARED = null;

        /**
         * This event is sent to the business logic if a view gets updated (event number 4022 of PceGui.h)
         * @type {Object}
         * @eventtype native
         * @event  Wincor.UI.Service.ViewService#EVENT_CONTENT_UPDATED
         */
        EVENT_CONTENT_UPDATED = null;

        /**
         * Value to be used in {@link Wincor.UI.Service.ViewService#endView} for a successful view-lifecycle
         * @type {string}
         * @const
         */
        UIRESULT_OK = "0";

        /**
         * Value used in {@link Wincor.UI.Service.ViewService#endView} automatically if an interactionTimeout occurs.
         * @type {string}
         * @const
         */
        UIRESULT_TIMEOUT_USER = "2";

        /**
         * Value used in {@link Wincor.UI.Service.ViewService#endView} if the user canceled the view.
         * @type {string}
         * @const
         */
        UIRESULT_CANCEL_USER = "3";

        /**
         * Value used in {@link Wincor.UI.Service.ViewService#endView} if the ViewService receives a cancel-request
         * during an active view.
         * @type {string}
         * @const
         */
        UIRESULT_CANCEL_SW = "4";

        /**
         * Value used in {@link Wincor.UI.Service.ViewService#endView} if an error occurred during processing the view.
         * @type {string}
         * @const
         */
        UIRESULT_ERROR_VIEW = "5";

        /**
         * Value used in {@link Wincor.UI.Service.ViewService#endView} if the ViewService receives a cancel-request
         * but there is no active view.
         * @type {string}
         * @const
         */
        UIRESULT_CANCEL_SW_ERROR = "8";

        /**
         * Value used in {@link Wincor.UI.Service.ViewService#endView} if the ViewService receives a cancel- of display request
         * but there is no active view.
         * @example
         * UI_DETAILED_RESULT: {
         *      CANCEL: "CANCEL";
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
         * Defines the default 'interactionTimeout' if a view is called without a timeout given.
         * @type {Number}
         * @default -1
         */
        pageTimeout = -1;

        /**
         * Defines the value that represents 'ImmediateTimeout'.
         * @type {Number}
         * @default 0
         */
        immediateTimeout = 0;

        /**
         * Defines the value that represents 'EndlessTimeout'.
         * @type {Number}
         * @default -1
         */
        endlessTimeout = -1;

        /**
         * Defines the value that represents 'MessageTimeout'. Deleted as soon as the config is outside of ViewService.
         * @type {Number}
         * @default 5000
         */
        messageTimeout = 5000;

        /**
         * Defines the value that represents 'ConfirmationTimeout'. Deleted as soon as the config is outside of ViewService.
         * @type {Number}
         * @default 30000
         */
        confirmationTimeout = 30000;

        /**
         * Defines the value that represents 'InputTimeout'. Deleted as soon as the config is outside of ViewService.
         * @type {Number}
         * @default 120000
         */
        inputTimeout = 120000;

        /**
         * Defines the value that represents 'PinEntryTimeout'. Deleted as soon as the config is outside of ViewService.
         * @type {Number}
         * @default 30000
         */
        pinentryTimeout = 30000;

        /**
         * The viewkey configuration, i.e. a mapping from the viewkey name to its configuration object.
         *
         * @type {Object}
         * @default null
         */
        urlMapping = null;

        /**
         * Contains mappings read from the configuration to apply for UIResult of the current view.
         * The JSON string looks like follows:
         * @example
         * "resultMapping": {
         *     "2": "0",
         *     "3": "0"
         * }
         *
         * With this configuration a timeout or user-cancel of this view would be mapped both to UIResultOK -> "0"
         * with interactionResult set to "mappedFrom:ORIGINALRESULT:ORIGINALINTERACTIONRESULT"
         *
         * @type {Object}
         * @default null
         */
        resultMapping = null;

        /**
         * Defines a default view key object, onto which the configured viewkey values are merged.
         * @type {Object}
         * @default {}
         */
        DEFAULT_VIEWKEY_VALUES = {};

        /**
         * Contains alls the configured timeout values.
         * @example
         * {
         *   ImmediateTimeout = 0,
         *   EndlessTimeout = -1,
         *   MessageTimeout = 5000,
         *   ConfirmationTimeout = 30000
         * }
         * @type {Object}
         * @default {}
         */
        DEFAULT_TIMEOUT_VALUES = {};

        /**
         * Objects which contains all the template viewkeys and their configuration.
         * @example
         * {
         *   //...
         *   "Question": {"timeout":"(#InputTimeout#)","url":"question.html"},
         *   "QuestionOther": {"commandconfig":{"OTHER":"0"},"timeout":"(#InputTimeout#)","url":"question.html"}
         *   //..
         * }
         * @type {Object}
         * @default {}
         */
        TEMPLATE_VIEWKEYS = {};

        /**
         * Object which contains the configuration of the keyword mapping.
         * @type {Object}
         * @default {}
         */
        KEYWORD_MAPPING = {};

        /**
         * The name of the content frame.
         * @default '#applicationContent'
         * @type {String}
         */
        CONTENT_FRAME_NAME = "#applicationContent";

        /**
         * List for the soft key (Y) positions of the view.
         * The values will retrieved by the configuration during initialization and are in percentage
         * relative to the upper/left corner of the window.
         * Furthermore the list contains 4 position only, because we assume that left Y positions is equal to the right Y positions.
         * @type {Array.<number>}
         * @default []
         */
        softkeyPositionsY = [];

        /**
         * This flag is set during the time, a new viewset is loaded. Calls to 'display' or 'prepare' will be postponed while restarting.
         * @type {boolean}
         * @default false
         */
        restarting = false;

        /**
         * This flag represents the value of the same named key read from "general" configuration section and tells, if HTML fragments should be cached by require.js (text-plugin).
         * @type {boolean}
         * @default false
         */
        cacheHTML = false;

        /**
         * The current viewset
         * @type {string}
         * @default softkey
         */
        viewSetName = "softkey";

        /**
         * The default viewset name for ada transactions
         */
        adaViewSet = "softkey";

        /**
         * The default initial view set
         * @type {string}
         * @default softkey
         */
        initialViewSet = "softkey";

        /**
         * Initial location of the window will be read on first display call.
         * @example
         *  {
         *    top: 0,
         *    left: 0,
         *    width: 0,
         *    height: 0
         *  }
         * @type {null | Object}
         * @default null
         */
        initialLocation = null;

        /**
         * Base location of the window initially matches initialLocation but changes when swapped.
         * @example
         *{
         *   top: 0,
         *   left: 0,
         *   width: 0,
         *   height: 0
         *}
         * @type {null | Object}
         * @default null
         */
        baseLocation = null;

        /**
         * Tells if a new viewset is about to be loaded
         * @type {boolean}
         * @default false
         */
        loadingViewSet = false;

        /**
         * The current default style type (without an ending slash).
         * Is set by <i>StyleResourceResolver</i>, then
         * this property is up to date.
         * @default 'MercuryDark'
         * @type {string}
         */
        currentStyleType = "MercuryDark"; // this property does not include the ending slash '/', because its gonna ask by getProperty and a slash would disturb

        /**
         * The current default style type set by the key value of "CCTAFW_PROP_UI_STYLESHEET_KEY"(with an ending slash).
         * Is set when the property "CCTAFW_PROP_UI_STYLESHEET_KEY" changes.
         * This member becomes important if the view set has been switched in order to run the currently desired style rather than the initial style from config.
         * Usually the OP switches back the property to a default when going into idle loop - then the initial style is used again.
         * @default ""
         * @type {string}
         */
        currentStyleTypeByStylesheetKey = "";

        /**
         * The current default vendor (without an ending slash).
         * When someone changes the vendor, e.g. <i>StyleResourceResolver</i>, then
         * this property must be up to date.
         * @default 'default'
         * @type {string}
         */
        currentVendor = "default"; // this property does not include the ending slash '/', because its gonna ask by getProperty and a slash would disturb

        /**
         * The current default resolution (without an ending slash).
         * When someone changes the resolution, e.g. <i>StyleResourceResolver</i>, then
         * this property must be up to date.
         * @default 'default'
         * @type {string}
         */
        currentResolution = "default"; // this property does not include the ending slash '/', because its gonna ask by getProperty and a slash would disturb

        /**
         * Contains the name of the instance that has been swapped location with.
         * If location has been swapped back, or has never been swapped, the value will be empty.
         * @type {string}
         * @default ""
         */
        currentSwapTarget = "";

        /**
         * Contains the current suspendIds.
         * @type {Array<number>}
         * @default []
         */
        suspendList = [];

        /**
         * Tells whether we are suspended or not
         * @type {boolean}
         * @default false
         */
        isSuspended = false;

        /**
         * The suspendId counter.
         * @type {number}
         * @default 0
         */
        suspendId = 0;

        /**
         * Sets ViewService-specific FRM_RESOLVE_REQUEST parameters, so that the name of this service is sent in every request.
         * See {@link Wincor.UI.Service.PTService#constructor}.
         * Initializes objects for every event, which are sent to the application, like `EVENT_UIRESULT` etc.
         * Prepare `DEFAULT_VIEWKEY_VALUES`, which contains the required parameters for every viewkey configuration.
         * Initialize `requestMap`, which stores the delegates for the requests.
         * @lifecycle service
         * @see {@link Wincor.UI.Service.PTService#constructor}.
         */
        constructor(...args) {
            super(...args);
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> ViewService::VideoService");
            const frameName = window.localStorage.getItem("activeFrameName");
            this.CONTENT_FRAME_NAME = frameName ? `#${window.localStorage.getItem("activeFrameName")}` : "";
            this.contentRunning = false;

            //setup message / events
            this.EVENT_UIRESULT = Object.assign(Object.assign({}, this.EVENT), {
                service: this.NAME,
                eventName: this.EVENT_NAME_UIRESULT,
                viewID: -1,
                UIResult: null
            });

            this.EVENT_ACTIVATED = Object.assign(Object.assign({}, this.EVENT), {
                service: this.NAME,
                viewID: -1,
                eventName: "UIStateActivated"
            });

            this.EVENT_PREPARED = Object.assign(Object.assign({}, this.EVENT), {
                service: this.NAME,
                viewID: -1,
                eventName: "UIStatePrepared"
            });

            this.EVENT_POPUP = Object.assign(Object.assign({}, this.EVENT), {
                service: this.NAME,
                eventName: "4021", //pce::gui::EVENT_POPUP_NOTIFICATION
                eventData: "" //must contain defines from PceGui.h
            });

            this.EVENT_CONTENT_UPDATED = Object.assign(Object.assign({}, this.EVENT), {
                service: this.NAME,
                eventName: "4022", //pce::gui::EVENT_POPUP_NOTIFICATION
                eventData: "" //must contain defines from PceGui.h
            });

            this.DEFAULT_VIEWKEY_VALUES = {
                url: "",
                timeout: this.messageTimeout,
                popup: {
                    oncancel: true,
                    ontimeout: true,
                    beepontimeout: false,
                    beepontimeoutperiod: 0
                }
            };

            //fill up request delegate
            this.requestMap.set("display", this.display.bind(this));
            this.requestMap.set("cancel", this.cancel.bind(this));
            this.requestMap.set("prepare", this.prepare.bind(this));
            this.requestMap.set("activate", this.activate.bind(this));
            this.requestMap.set("readConfiguration", this.readConfiguration.bind(this));
            this.requestMap.set("resetUserInteractionTimeout", this.resetUserInteractionTimeout.bind(this));

            this.viewContext = {
                viewKey: null,
                viewURL: null,
                viewConfig: null,
                viewID: -1
            };
            this.FRM_RESOLVE_REQUEST.service = this.NAME;
            this.resultMapping = {};
            this.errorURL = "../../content_*/views/outofservice.html";
            this.startURL = "../../content_softkey/views/index.html";
            this.previousViewUrl = "";
            this.isRestartOnNextDisplay = false;
            // keeps style element references set from outside
            this.addedStyles = new Map();

            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< ViewService::VideoService");
        }

        /**
         * Gets the content document.
         * @param {string} frmName      The name of the content frame to load
         * @returns {Document}          The content document
         */
        getContentWindowDocument(frmName) {
            const frame = jQuery(frmName);
            return frame.length > 0 ? frame.contents()[0] : window.document; // due to unit test compatibility, because there is no iframe
        }

        /**
         * Loads the given URL into the content frame.
         *
         * @param {string} url      The URL for the content frame.
         * @param {string} frmName  The name of the content frame to load.
         */
        loadContentUrl(url, frmName) {
            Wincor.UI.Content = null; // clear old content before load new -url
            const frame = jQuery(frmName);
            frame[0].contentWindow.Wincor = Wincor;
            frame.attr("src", url);
            frame.css("display", "block");
        }

        /**
         * This method has to be called when a view ends due to an offline situation.
         * @param {string} resultDetail     The additional error data for the offline situation.
         */
        offlineHandling(resultDetail) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> ViewService::offlineHandling(" + resultDetail + ")");
            if(typeof resultDetail === "undefined" || resultDetail === null) {
                resultDetail = "ERROR_VIEW_SERVER_OFFLINE";
            } else {
                resultDetail = "ERROR_VIEW_SERVER_OFFLINE" + resultDetail;
            }
            this.endView(this.UIRESULT_ERROR_VIEW, resultDetail);
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< ViewService::offlineHandling");
        }

        /**
         * This method has to be called when a view ends (due to a timeout, user-interaction, ...).
         * The resultCode will be propagated to the business-logic which previously started the view.
         * This method triggers the {@link Wincor.UI.Service.ViewService#SERVICE_EVENTS.VIEW_CLOSING} event
         * and sends {@link Wincor.UI.Service.ViewService#EVENT_UIRESULT} to the business-logic.
         *
         * @param {string} resultCode       The resultCode to be evaluated by business-logic.
         * @param {string=} resultDetail    The detailed result (e.g. a user interaction like a button press) leading to this resultCode.
         * @fires Wincor.UI.Service.ViewService#SERVICE_EVENTS:REFRESH_TIMEOUT
         * @fires Wincor.UI.Service.ViewService#SERVICE_EVENTS:VIEW_CLOSING
         * @fires Wincor.UI.Service.ViewService#EVENT_UIRESULT
         */
        endView(resultCode, resultDetail) {
            const href = this.getContentWindowDocument(this.CONTENT_FRAME_NAME).location.href;
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> ViewService::endView(${resultCode}, ${resultDetail}) received for page: ${href}`);
            //After this _logger function we are interruptable. If then Cancel() is called and calls endView (because contentRunning is still true), then
            //it sends the message in the if-clause below. If the initial thread, which was interrupted here, starts to work again, contentRunning is false
            //and no message will be send. That's okay, because it is important that the Cancel() produces a GUIResult event with resultCode UIRESULT_CANCEL_SW,
            //and that will happen.
            this.clearTimeout();
            this.fireServiceEvent(this.SERVICE_EVENTS.REFRESH_TIMEOUT, -1);

            if(this.contentRunning) {
                this.contentRunning = false;
                // Do not set contentRunning later (even not after _logger.log) because when using the send-event methods of the gateway the main thread is interruptable.
                // Then, Cancel() might be called, which also uses contentRunning. That must then aleady be false.
                // See also comment in processDisplay() method

                _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `* | VIEW ------ endView ------ ${resultCode}/${resultDetail}`);

                if(resultDetail === void 0 || resultDetail === null) {
                    if(resultCode === this.UIRESULT_CANCEL_USER ||
                       resultCode === this.UIRESULT_ERROR_VIEW ||
                       resultCode === this.UIRESULT_CANCEL_SW ||
                       resultCode === this.UIRESULT_CANCEL_SW_ERROR ||
                       resultCode === this.UIRESULT_TIMEOUT_USER
                    ) {
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
                        _logger.LOG_SRVC_DATA &&
                            _logger.log(_logger.LOG_SRVC_DATA, `. ViewService::endView resultMapping (result detail given) configured! Mapping to '${resultCode}'/'${resultDetail}'`);
                    }
                }
                this.EVENT_UIRESULT.viewID = this.viewContext.viewID;
                this.fireServiceEvent(this.SERVICE_EVENTS.VIEW_CLOSING, {
                    viewId: this.viewContext.viewID,
                    viewKey: this.viewContext.viewKey,
                    resultCode: resultCode,
                    resultDetail: resultDetail
                });
                this.sendEvent(this.EVENT_UIRESULT);
            } else {
                _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "ViewService::endView no content running.");
            }
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< ViewService::endView");
        }

        /**
         * Triggers the {@link Wincor.UI.Service.ViewService#SERVICE_EVENTS.VIEW_BEFORE_CHANGE} event.
         *
         * This method is intended to be called by the content-base and should not be called directly by a concrete view-model.
         *
         * @param {Object} msg The message, which will be sent with the event.
         * @fires Wincor.UI.Service.ViewService#SERVICE_EVENTS:VIEW_BEFORE_CHANGE
         */
        fireBeforePageChange(msg) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> ViewService::fireBeforePageChange(" + JSON.stringify(msg) + ")");
            this.fireServiceEvent(this.SERVICE_EVENTS.VIEW_BEFORE_CHANGE, msg);
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< ViewService::fireBeforePageChange");
        }

        /**
         * Triggers the {@link Wincor.UI.Service.ViewService#SERVICE_EVENTS.VIEW_ACTIVATED} event.
         * Additionally the event {@link Wincor.UI.Service.ViewService#EVENT_ACTIVATED} is sent to the business-logic.
         *
         * This method is intended to be called by the content-base and should not be called directly by a concrete view-model.
         * @fires Wincor.UI.Service.ViewService#SERVICE_EVENTS:VIEW_ACTIVATED
         * @fires Wincor.UI.Service.ViewService#EVENT_ACTIVATED
         */
        fireActivated() {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> ViewService::fireActivated()");
            const handled = this.fireServiceEvent(this.SERVICE_EVENTS.VIEW_ACTIVATED, {
                href: this.getContentWindowDocument(this.CONTENT_FRAME_NAME).location.href,
                viewContext: jQuery.extend(true, {}, this.viewContext)
            });
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, ". | VIEW ViewService::fireActivated returns handled=" + handled);
            // TODO: how can we assure that "this.EVENT_ACTIVATED" has been received by all subscribers before
            // a UIResult Timeout is sent due to a minimal timing config for this view?

            if(!this.restarting && this.contentRunning) {
                //by requesting contentRunning here, we can not fully avoid that an ACTIVATED event is sent for an old view, but we
                //can make it less possible.
                this.EVENT_ACTIVATED.viewID = this.viewContext.viewID;
                this.sendEvent(this.EVENT_ACTIVATED);
            } else {
                // if 'restartin' is true, this is the activated event of index.html
                _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `. | VIEW ViewService::fireActivated skipping event (restarting =${this.restarting}, contentRunning=${this.contentRunning}.`);
            }

            if(!handled) {
                // ada f.e will handle the timeouts by itself
                this.refreshTimeout();
            }
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< ViewService::fireActivated");
        }

        /**
         * Automatically called when it comes to popups.
         * @param {boolean} active  Tells if popup currently is activated or destroyed
         * @param {String} type     The popup type (std values: "CANCEL_POPUP", "TIMEOUT_POPUP", "HELP_POPUP", "AMOUNT_ENTRY_POPUP", "WAIT_POPUP")
         * @fires Wincor.UI.Service.ViewService#SERVICE_EVENTS:POPUP_ACTIVATED
         * @fires Wincor.UI.Service.ViewService#SERVICE_EVENTS:POPUP_DEACTIVATED
         * @fires Wincor.UI.Service.ViewService#EVENT_POPUP
         */
        firePopupNotification(active, type) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> ViewService::firePopupNotification(${type} active: ${active})`);
            this.popupActive = active;
            this.fireServiceEvent(active ? this.SERVICE_EVENTS.POPUP_ACTIVATED : this.SERVICE_EVENTS.POPUP_DEACTIVATED, type ? type : void 0);
            this.EVENT_POPUP.eventData = active ? "ACTIVATED" : "DEACTIVATED";
            if(type) {
                this.EVENT_POPUP.eventData += `,${type}`;
            }
            this.sendEvent(this.EVENT_POPUP);
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< ViewService::firePopupNotification");
        }

        /**
         * Triggers the {@link Wincor.UI.Service.ViewService#SERVICE_EVENTS.CONTENT_UPDATE} and
         * {@link Wincor.UI.Service.ViewService#SERVICE_EVENTS.POPUP_DEACTIVATED} events.
         *
         * Additionally the event {@link Wincor.UI.Service.ViewService#EVENT_CONTENT_UPDATED} is sent to the business-logic.
         *
         * @param {String} data     Arbitrary data string for `eventData`.
         * @fires Wincor.UI.Service.ViewService#SERVICE_EVENTS:CONTENT_UPDATE
         * @fires Wincor.UI.Service.ViewService#EVENT_CONTENT_UPDATED
         */
        fireContentUpdated(data) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> ViewService::fireContentUpdated(${data})`);
            this.fireServiceEvent(this.SERVICE_EVENTS.CONTENT_UPDATE, data);
            this.EVENT_CONTENT_UPDATED.eventData = data ? data.toString() : "";
            this.sendEvent(this.EVENT_CONTENT_UPDATED);
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `< ViewService::fireContentUpdated`);
        }

        /**
         * Triggers the {@link Wincor.UI.Service.ViewService#SERVICE_EVENTS.VIEW_PREPARED} event.
         *
         * Additionally the event {@link Wincor.UI.Service.ViewService#EVENT_PREPARED} is sent to the business-logic.
         *
         * This method is intended to be called by the BaseViewModel if all initial data is captured
         * and the view is ready for data-binding and activation.
         * @fires Wincor.UI.Service.ViewService#SERVICE_EVENTS:VIEW_PREPARED
         * @fires Wincor.UI.Service.ViewService#EVENT_PREPARED
         */
        firePrepared() {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> ViewService::firePrepared()");

            this.fireServiceEvent(this.SERVICE_EVENTS.VIEW_PREPARED, jQuery.extend(true, {}, this.viewContext));
            if(!this.restarting) {
                this.EVENT_PREPARED.viewID = this.viewContext.viewID;
                this.sendEvent(this.EVENT_PREPARED);
            } else {
                // if 'restarting' is true, this is the prepared event of index.html
                _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, ". | VIEW ViewService::firePrepared skipping event to bl, due to restart");
            }

            // If 'restarting' is true, this means that index.html was reloaded (viewset was switched) -- in this case we have to send the activated event,
            // regardless of 'autoactivate' variable: AutoActivate is set by the new view that shall be displayed or prepared. If prepare() was called
            // then autoactivate is false, but this autoActive applies to the new view AND NOT (if restarting is true) to index.html
            if(this.autoActivate || this.restarting) {
                //this informs the subscribers that they  have to activate themselves
                window.setTimeout(() => this.fireServiceEvent(this.SERVICE_EVENTS.TURN_ACTIVE), 1);
            }
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< ViewService::firePrepared");
        }

        /**
         * Whenever a view was displayed using display() with a timeout, this event-handler is called when
         * the timer for this view expires.
         * The event handler will fire a service-event {@link Wincor.UI.Service.ViewService#SERVICE_EVENTS.VIEW_USERINTERACTION_TIMEOUT}.
         * If one of the registered functions returns true (which means it already handled this situation) nothing will be done.
         * Otherwise this handler calls {@link Wincor.UI.Service.ViewService#endView} which will send the
         * UIResult {@link Wincor.UI.Service.ViewService#UIRESULT_TIMEOUT_USER}.
         * @async
         * @eventhandler
         * @fires Wincor.UI.Service.ViewService#SERVICE_EVENTS:VIEW_USERINTERACTION_TIMEOUT
         */
        async onTimeout() {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> ViewService::onTimeout()");
            if(this.serviceProvider.getInstanceName() === "GUIAPP") {
                try {
                    await this.serviceProvider.AdaService.switchToApp();
                } catch(e) {
                    // pass
                }
            }

            this.interactionTimerId = null;
            if(!this.fireServiceEvent(this.SERVICE_EVENTS.VIEW_USERINTERACTION_TIMEOUT)) {
                this.endView(this.UIRESULT_TIMEOUT_USER);
            } else {
                _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, ". timeout was handled by one of the subscribers");
            }
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< ViewService::onTimeout");
        }

        /**
         * To avoid the expiration of the view timer during an user-interaction, this method is used to initialize the timeout to the value provided by the previous display-call.
         * It can also refresh this timer during an user-interaction.
         *
         * Before this happens, the event {@link Wincor.UI.Service.ViewService#SERVICE_EVENTS.VIEW_USERINTERACTION_TIMEOUT} is sent.
         * Subscribers of the event can handle the timeout situation by themselves (e.g. "Would you like more time?" popup).
         * The return value of the subscribed callbacks tell this function if the timeout situation was completely handled ('true')
         * or if this function shall proceed with the standard handling ('false').
         *
         * @param {Number=} newHigherTimeoutValue   The new timeout value, which must be higher then the configured one.
         * @param {boolean=} force                  Enforces also a refresh to a new, but lower timeout value.
         * @fires Wincor.UI.Service.ViewService#SERVICE_EVENTS:REFRESH_TIMEOUT
         */
        refreshTimeout(newHigherTimeoutValue, force) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> ViewService::refreshTimeout()");
            const orgInteractionTimeoutValue = this.interactionTimeoutValue; // for the case there is a foreign timeout handler (-isHandled=true)
            if(newHigherTimeoutValue && (force || newHigherTimeoutValue > this.interactionTimeoutValue)) {
                _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `. updating timeout from ${this.interactionTimeoutValue}ms to ${newHigherTimeoutValue}ms`);
                this.interactionTimeoutValue = newHigherTimeoutValue;
            }
            const isHandled = this.fireServiceEvent(this.SERVICE_EVENTS.REFRESH_TIMEOUT, this.interactionTimeoutValue);
            if(!isHandled) {
                this.clearTimeout();
                if(this.interactionTimeoutValue === this.immediateTimeout) {
                    this.interactionTimerId = window.setTimeout(this.onTimeout.bind(this), 1); //1ms so that this method can return
                } else if(this.interactionTimeoutValue > this.immediateTimeout && this.contentRunning) {
                    this.interactionTimerId = window.setTimeout(this.onTimeout.bind(this), this.interactionTimeoutValue);
                }
            } else {
                this.interactionTimeoutValue = orgInteractionTimeoutValue; // restore
                _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, ". ViewService::refreshTimeout not processed - event handled by subscriber: ");
            }
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `< ViewService::refreshTimeout - value: ${this.interactionTimeoutValue}`);
        }

        /**
         * Called from the business logic if pce::gui::ResetWatchdog() is called. Calls immediately {@link Wincor.UI.Service.ViewService#refreshTimeout}.
         *
         * {@link Wincor.UI.Service.ViewService#refreshTimeout} can not be used as callback for pce::gui::ResetWatchdog(), because every callback get an object
         * as parameter, but this fits not to the signature of {@link Wincor.UI.Service.ViewService#refreshTimeout}.
         */
        resetUserInteractionTimeout() {
            this.refreshTimeout();
        }

        /**
         * Returns {@link Wincor.UI.Service.ViewService#interactionTimeoutValue}.
         *
         * @return {Number}
         */
        getTimeoutValue() {
            return this.interactionTimeoutValue;
        }

        /**
         * Clears the timeout for the current view.
         */
        clearTimeout() {
            let done = false;
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> ViewService::clearTimeout()");
            if(this.interactionTimerId !== 0) {
                window.clearTimeout(this.interactionTimerId);
                done = true;
                this.interactionTimerId = 0;
            }
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `< ViewService::clearTimeout returns done=${done}`);
        }

        /**
         * Sets {@link Wincor.UI.Service.ViewService#viewContext}.
         *
         * @param {Object} message       The message object from the business logic, contains at least the view key.
         * @param {Object} viewKeyValue  The configuration of the viewkey.
         */
        setViewContext(message, viewKeyValue) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> ViewService::setViewContext()");
            this.viewContext.viewKey = message.viewKey !== "" ? message.viewKey : "*";
            this.viewContext.viewURL = message.viewURL;
            // this.viewContext.viewConfig = this.urlMapping[message.viewKey];
            // TODO: 2016-03-30-workaround: view models expecting attr "placeHolder" instead of "placeholder". Remove this workaround, if tooling metadata corrected to "placeHolder"
            if(viewKeyValue.config && viewKeyValue.config.placeholder) {
                viewKeyValue.config.placeHolder = viewKeyValue.config.placeholder;
            }
            this.viewContext.viewConfig = viewKeyValue;
            _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, `. viewContext: \n ${JSON.stringify(this.viewContext, null, " ")}`);
            if(!this.viewContext.viewConfig) {
                _logger.error(`Couldn't get configuration for viewKey=${message.viewKey} <-- seems to be invalid. This may lead into subsequent errors !`);
            }
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< ViewService::setViewContext");
        }

        /**
         * This method can be called by the business logic to activate a prepared view.
         * The view will become visible and interactive to the customer
         * if {@link Wincor.UI.Service.ViewService#prepare} was previously called.
         * @param {Object} message
         * @fires Wincor.UI.Service.ViewService#SERVICE_EVENTS:TURN_ACTIVE
         */
        activate(message) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> ViewService::activate()");
            this.fireServiceEvent(this.SERVICE_EVENTS.TURN_ACTIVE);
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< ViewService::activate");
        }

        /**
         * Forces SPA navigation using durandal to navigate within SPA.
         *
         * It also checks if a SPA restart is necessary due a view set switch. 
         * If so, it calls {@link Wincor.UI.Service.ViewService#reStartSPA}, otherwise it does a normal navigation.
         *
         * @param {string} url      The URL which mus be loaded into the content frame.
         * @fires Wincor.UI.Service.ViewService#SERVICE_EVENTS:NAVIGATE_SPA
         */
        navigate(url) {
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `> ViewService::navigate(${url})`);
    
            if (!url) {
                _logger.error(`ViewService::navigate, Navigation canceled due to mandatory 'url' argument is invalid -
                               please check registry section 'UIMapping' for viewkey=${this.viewContext.viewKey}`);
                return;
            }
            if(this.isRestartOnNextDisplay) {
                this.reStartSPA(url);
                _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `< ViewService::navigate restart of SPA necessary for destination=${url}`);
                return;
            }

            // determine next SPA URL
            // manipulate url to short version for durandal
            //TODO simplify this if the URL mapping uses short fragment names instead of the redundant URL path's
            const queryStringObj = Wincor.QueryString.get(url);
            const queryString = Wincor.QueryString.stringify(queryStringObj);
            let newUrl, routeName, destination;
            newUrl = Wincor.QueryString.getBaseUrl(url);
            routeName = newUrl.replace(".html", "").replace(".htm", ""); // only the name of the html file without extension
            destination = {
                url: newUrl,
                routeName: routeName,
                lastViewUrl: this.previousViewUrl,
                queryString: queryString,
                viewKey: this.viewContext.viewKey
            };
            this.previousViewUrl = newUrl;
            window.localStorage.setItem("currentViewId", routeName);
            this.fireServiceEvent(this.SERVICE_EVENTS.NAVIGATE_SPA, destination);
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `< ViewService::navigate destination=${JSON.stringify(destination)}`);
        }

        /**
         * Starts the SPA by loading the initially given URL into the `iframe` of the the application content.
         *
         * @param {string} url      The url to start with, usually <i>_index.html_</i>.
         */
        startSPA(url) {
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `> ViewService::startSPA url=${url}, viewSetName=${this.viewSetName}`);
            if(this.CONTENT_FRAME_NAME) {
                this.loadContentUrl(url, this.CONTENT_FRAME_NAME);
                jQuery(".spinner").css("display", "none");
                jQuery("#applicationMode").fadeIn({ duration: 600, easing: "easeInQuart" });
            } else {
                _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, ` ViewService::startSPA no content configured...`);
                this.registerForServiceEvent(
                    this.SERVICE_EVENTS.TURN_ACTIVE,
                    () => {
                        this.fireActivated();
                    },
                    this.DISPOSAL_TRIGGER_ONETIME
                );
                this.firePrepared();
            }
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< ViewService::startSPA");
        }

        /**
         * Restarts the SPA, usually during a view set switch.
         * The method invokes {@link Wincor.UI.Service.ViewService.startSPA} to load the new <i>index.html</i>.
         *
         * @param {string} url The URL for SPA navigation after SPA has been restarted
         * @fires Wincor.UI.Service.ViewService#SERVICE_EVENTS:SHUTDOWN
         * @fires Wincor.UI.Service.ViewService#SERVICE_EVENTS:VIEW_CLOSING
         * @fires Wincor.UI.Service.ViewService#SERVICE_EVENTS:VIEW_BEFORE_CHANGE
         */
        reStartSPA(url) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> ViewService::reStartSPA(${url})`);
            this.isRestartOnNextDisplay = false;
            localStorage.setItem("restartSPA", "true");
            jQuery("body").attr("data-restart-spa", "true");
            this.fireServiceEvent(this.SERVICE_EVENTS.SHUTDOWN);
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, ". | VIEW ViewService::reStartSPA restarting!");
            this.registerForServiceEvent(
                this.SERVICE_EVENTS.VIEW_ACTIVATED,
                () => {
                    // this is the activated event of index.html
                    // decouple from service event (do not fire service event from within handler directly!)
                    setTimeout(() => {
                        //SPA is restarted, now load the initial url:
                        _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `. | VIEW ViewService::reStartSPA navigating to ${url}`);
                        this.fireServiceEvent(this.SERVICE_EVENTS.VIEW_CLOSING, {
                            viewId: this.viewContext.viewID,
                            viewKey: this.viewContext.viewKey,
                            resultCode: this.UIRESULT_CANCEL_SW,
                            resultDetail: "restartSPA"
                        });
                        this.fireBeforePageChange({});
                        this.restarting = false;
                        this.navigate(url);
                        localStorage.setItem("restartSPA", "false");
                    }, 250);
                },
                this.DISPOSAL_TRIGGER_ONETIME
            );
            this.restarting = true;
            jQuery("#applicationMode").fadeOut({
                duration: 600,
                easing: "easeOutQuart",
                complete: () => this.startSPA(this.startURL) //load the new index.html of the new viewset
            });
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< ViewService::reStartSPA");
        }

        /**
         * Check if the content frame exists.
         *
         * @returns {boolean}   True if the content frame exists.
         */
        contentWindowExists() {
            return jQuery(this.CONTENT_FRAME_NAME).attr("src") !== "";
        }

        /**
         * Handles an error in case of a wrong viewkey configuration.
         */
        handleError() {
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, "> ViewService::handleError()");

            //Do not navigate to an error URL, this breaks the durandal lifecycle and later on every navigation will fail.
            //The flow will do an error navigation anyway and almost immediately call a new Display().
            this.endView(this.UIRESULT_ERROR_VIEW, "ERROR_VIEW_UNKNOWN_VIEWKEY");

            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< ViewService::handleError()");
        }

        /**
         * This function is called by {@link Wincor.UI.Service.ViewService#prepare} and
         * {@link Wincor.UI.Service.ViewService#display}.
         * It navigates to the given view of the message object.
         *
         * If the method is called by {@link Wincor.UI.Service.ViewService#display} the `activate` parameter is true.
         * This means, that the view is also switched visible and becomes interactive -- this shall be omitted if the view shall only be "prepared".
         *
         * @param {Object} message      See {@link Wincor.UI.Service.ViewService#display}.
         * @param {boolean} activate    True if the view shall be activated, too.
         */
        processDisplay(message, activate) {
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `> ViewService::processDisplay('${JSON.stringify(message)}')`);
            if(this.contentWindowExists()) {
                this.endView(this.UIRESULT_CANCEL_SW, this.UI_DETAILED_RESULT.DISPLAY); //send a GUIResult for the currently running view. endView() checks if content is running
            }
            // IMPORTANT: JavaScript is singlethreaded, but the main thread can be interrupted as soon as we use the send-methods
            //            of the Gateway!!
            //Set contentRunning at the beginning of processDisplay, before ANY method might use one of the send-methods or starts other
            //asynchronous requests. Do not set contentRunning later: it can happen
            //that the cancel() method is called, before processDisplay() or it's callback methods are finished.
            //Then cancel() sends an Result (with SW_CANCEL_ERROR), but afterwards the processDisplay method
            //would proceed and set contentRunning=true. But then Gui.dll is in state 'Wait', but ViewService.contentRunning is
            //true.
            // The next time a processDisplay() is called for a new view, an Result SW_CANCEL for the assumed(!) running
            // old view is immediately sent by the ViewService. But Gui.dll thinks this is for the new view and goes back to
            // state 'Wait'. And so on and so on....an endless loop with UIResult=SW_CANCEL for every view.
            this.contentRunning = true;
            this.EVENT_UIRESULT.UILastButtonPressedEPPKey = [];
            this.viewContext.viewID = message.viewID;

            const self = this;
            const urlMappingTmp = Object.assign({}, this.urlMapping);
            const msg = Object.assign(
                {
                    viewKey: null,
                    viewURL: null
                },
                message || {}
            );

            function processDisplayCallback(value, viewKeyValue) {
                _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `* ViewService::processDisplay::processDisplayCallback(${value})`);

                if(value === true) {
                    // var viewConf = self.urlMapping[msg.viewKey];
                    msg.viewURL = viewKeyValue.url;
                    self.interactionTimeoutValue = viewKeyValue.timeout;
                } else {
                    //viewURL is in the message, no change necessary
                    self.interactionTimeoutValue = self.pageTimeout;
                }

                self.fireBeforePageChange(msg);
                self.setViewContext(msg, viewKeyValue);
                window.localStorage.setItem("currentViewKey", viewKeyValue);
                const viewConfig = self.viewContext.viewConfig;
                if(viewConfig) {
                    self.resultMapping = viewConfig.resultMapping;
                    _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `* ViewService::processDisplay::processDisplayCallback resultMapping(${JSON.stringify(self.resultMapping)})`);
                } else {
                    _logger.error("View config is invalid - can't set cancel/timeout question config !");
                }
                // force a normal SPA navigation
                self.navigate(msg.viewURL);
                //window.setTimeout(self.fireBeforePageChange.bind(self, msg), 1); //TODO: pageBeforeChange und after -> onInteractive ...
            }

            try {
                this.autoActivate = activate;

                if(!msg.viewKey && !msg.viewURL) {
                    _logger.error("ViewService::processDisplay() has been called without a viewKey and without a viewURL!");
                    this.handleError();
                    return;
                }

                // viewkey convention check
                if(!msg.viewKey || msg.viewKey.includes("_")) {
                    _logger.error(`ViewService::processDisplay() has been called with a viewKey '${msg.viewKey}' which doesn't meet the conventions for viewkeys. Please check for illegal char '_' !`);
                    this.handleError();
                    return;
                }

                if(msg.viewKey in urlMappingTmp) {
                    const jsonString = JSON.stringify(urlMappingTmp[msg.viewKey]);
                    if(jsonString.indexOf(PROP_MARKER) !== -1 && jsonString.indexOf(PROP_END_MARKER) !== -1) {
                        this.getProperties(urlMappingTmp[msg.viewKey], function getPropertiesCallback(response) {
                            urlMappingTmp[msg.viewKey] = self.correctJSONObject(response, msg.viewKey);
                            if(typeof urlMappingTmp[msg.viewKey] === "string") {
                                _logger.error(`View config is invalid - viewKey value is no json object: ${msg.viewKey}`);
                                self.handleError();
                            } else {
                                processDisplayCallback.bind(self)(true, urlMappingTmp[msg.viewKey]);
                            }
                        });
                    } else if(typeof urlMappingTmp[msg.viewKey] === "string") {
                        _logger.error(`View config is invalid - viewKey value is no json object: ${msg.viewKey}`);
                        self.handleError();
                    } else {
                        processDisplayCallback.bind(self)(true, urlMappingTmp[msg.viewKey]);
                    }
                } else {
                    _logger.error(`Unknown viewKey '${msg.viewKey}'.`);
                    self.handleError();
                }
            } catch(e) {
                self.contentRunning = false;
                _logger.error(e.message);
            } finally {
                _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< ViewService::processDisplay");
            }
        }

        /**
         * This function is called by the business logic to prepare a new view.
         * The view will become visible and interactive to the customer as soon as
         * {@link Wincor.UI.Service.ViewService#activate} is called.
         *
         * @param {Object} message See {@link Wincor.UI.Service.ViewService#display}.
         */
        prepare(message) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> ViewService::prepare()");
            const self = this;
            let postponeMessageWritten = false;
            const isLoadingViewSet = function() {
                if(self.loadingViewSet === true) {
                    if(!postponeMessageWritten) {
                        _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "* ViewService::prepare - queuing request! A viewset is currently loading...");
                        postponeMessageWritten = true;
                    }
                    window.setTimeout(isLoadingViewSet, 20);
                } else {
                    self.processDisplay(message, false);
                }
            };
            isLoadingViewSet();
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< ViewService::prepare");
        }

        /**
         * This function is called by the business logic to display a specific view.
         * The result will be send as event, see {@link Wincor.UI.Service.ViewService#EVENT_UIRESULT}.
         *
         * @param {Object} message The message contains must contain the `viewKey` and can contain a `viewURL`.
         */
        display(message) {
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, "> ViewService::display()");
            const self = this;
            let postponeMessageWritten = false;
            // clear suspensions, reset flag
            this.suspendList = [];
            this.isSuspended = false;

            const isLoadingViewSet = function() {
                if(self.loadingViewSet === true) {
                    if(!postponeMessageWritten) {
                        _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "* ViewService::display - queuing request! A viewset is currently loading...");
                        postponeMessageWritten = true;
                    }
                    window.setTimeout(isLoadingViewSet, 20);
                } else {
                    self.processDisplay(message, true);
                }
            };

            isLoadingViewSet();
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< ViewService::display");
        }

        /**
         * This function is called by the business-logic to cancel a running view.
         *
         * @param {Object=} message      Not used.
         */
        cancel(message) {
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `> ViewService::cancel('${JSON.stringify(message)}')`);
            // clear suspensions, reset flag
            this.suspendList = [];
            this.isSuspended = false;
            let p = ext.Promises.Promise.resolve();
            // if a popup is active, we have to close it when it comes to a cancel from outside... Otherwise the popup would be visible until next view.
            if(this.popupActive) {
                p = Wincor.UI.Content.ViewModelHelper.hidePopupMessage();
            }
            p.then(() => {
                if(this.contentRunning) {
                    this.endView(this.UIRESULT_CANCEL_SW, this.UI_DETAILED_RESULT.CANCEL);
                } else {
                    this.EVENT_UIRESULT.UIResult = this.UIRESULT_CANCEL_SW_ERROR;
                    this.EVENT_UIRESULT.UIDetailedResult = "";
                    this.EVENT_UIRESULT.viewID = this.viewContext.viewID;
                    this.sendEvent(this.EVENT_UIRESULT);
                }
                _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< ViewService::cancel");
            });
        }

        /**
         * Updates the ViewService.
         * The method reloads the configuration, based on message.configuration. Currently only "VIEWKEYS" as value
         * for message.configuration is supported. Currently an empty string is treated in the same way, but this may change in the future.
         *
         * @param {Object} message      `message.configuration` tells the function, which parts of the configuration shall be reloaded.
         */
        readConfiguration(message) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> ViewService::readConfiguration('${message.configuration}')`);
            //Do not check for contentRunning:
            // re-reading the viewkeys must also be possible during an active view, but it will just be available for the next viewkey
            //The Gui.dll must take care, that readConfiguration() is not called during a viewkey switch.
            if(message.configuration === "VIEWKEYS" || message.configuration === "") {
                this.readViewKeys(this.viewSetName)
                    .then(() => {
                        _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `. ViewService::readConfiguration succeeded re-reading view keys, message=${JSON.stringify(message)}`);
                        this.sendResponse(message, this.REQUEST_RESPONSE_OK);
                    })
                    .catch(cause => {
                        _logger.error(`View config is invalid - re-reading the UIMapping failed ${cause}`);
                        this.sendResponse(message, this.REQUEST_RESPONSE_ERROR);
                    });
            } else {
                _logger.error(`ViewService::readConfiguration, unsupported parameters: ${JSON.stringify(message)}`);
                this.sendResponse(message, this.REQUEST_RESPONSE_ERROR);
            }
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< ViewService::readConfiguration");
        }

        /**
         * Resizes/repositions the browser window.
         * @param {Object} posObject        Contains attributes `top`, `left`, `width` and `height` of type number.
         * @param {function=} callback      The callback function, which is called as soon as there is a response. Gets a number a boolean as argument -- `true` is for success.
         */
        resizeWindow(posObject, callback) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> ViewService::resizeWindow(${JSON.stringify(posObject)}) baseLocation: ${JSON.stringify(this.baseLocation)}`);
            const REQUEST = Object.assign({}, this.FRM_RESOLVE_REQUEST);
            REQUEST.FWName = Wincor.UI.Service.Provider.ConfigService.configuration.instanceName;
            REQUEST.FWFuncID = 4026; // UI method contMove
            REQUEST.param1 = posObject.left !== void 0 ? posObject.left + (!posObject.absolute ? this.baseLocation.left : 0) : void 0;
            REQUEST.meta1 = posObject.left !== void 0 ? ["LONG", 0] : void 0;
            REQUEST.param2 = posObject.top !== void 0 ? posObject.top + (!posObject.absolute ? this.baseLocation.top : 0) : void 0;
            REQUEST.meta2 = posObject.top !== void 0 ? ["LONG", 0] : void 0;
            REQUEST.param3 = posObject.width !== void 0 ? posObject.width : void 0;
            REQUEST.meta3 = posObject.width !== void 0 ? ["LONG", 0] : void 0;
            REQUEST.param4 = posObject.height !== void 0 ? posObject.height : void 0;
            REQUEST.meta4 = posObject.height !== void 0 ? ["LONG", 0] : void 0;
            REQUEST.paramUL = 0;
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `. request to send: '${JSON.stringify(this.FRM_RESOLVE_REQUEST)}'.`);
            this.FrmResolve(REQUEST, function(message) {
                const success = message.RC === 0;
                _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `* ViewService::resizeWindow callback success: ${success}`);
                if(callback) {
                    callback(success);
                }
            });
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< ViewService::resizeWindow");
        }

        /**
         * Resets the size and location of the window to its `initialLocation`.
         * This function is used by the swapping functionality.
         * @returns {Object}
         */
        resetLocation() {
            this.logger.log(this.logger.LOG_INOUT, `> wn.UI.Service.ViewService::resetLocation()`);
            this.currentSwapTarget = "";
            this.baseLocation = Object.assign(this.initialLocation);
            const ret = this.resizeWindow(Object.assign({ absolute: true }, this.initialLocation));
            this.logger.log(this.logger.LOG_INOUT, `< wn.UI.Service.ViewService::resetLocation returns ${ret}`);
            return ret;
        }

        /**
         * Swaps the location and size of this UI-instance with the instance of the targetInstance string.
         *
         * @param {string} [targetInstance=""]           The UI-instance name to swap location with.
         * @returns {Promise} resolving to RC
         * @fires Wincor.UI.Service.ViewService#SERVICE_EVENTS:LOCATION_CHANGED
         */
        swapLocation(targetInstance = "") {
            const MIN_SIZE = 25;
            return ext.Promises.promise((resolve, reject) => {
                // check if target is at feasible size
                _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> ViewService::swapLocation(${targetInstance})`);
                if(targetInstance === Wincor.UI.Service.Provider.ConfigService.configuration.instanceName) {
                    reject("ViewService::swapLocation targetInstance mut be different to self...");
                    return;
                }
                ext.Promises.Promise.all([this.getLocation(targetInstance), this.getLocation()])
                    .then(positions => {
                        const pos = positions[0];
                        const ourPos = positions[1];
                        if(pos.width < MIN_SIZE || pos.height < MIN_SIZE) {
                            reject(`Target ${this.currentSwapTarget} size is width: ${pos.width}/height :${pos.height}! Minimum is ${MIN_SIZE}!`);
                            return;
                        }

                        // we do not swapping with another than the currently swapped instance,
                        if(this.currentSwapTarget && targetInstance && targetInstance !== this.currentSwapTarget) {
                            reject(`Instance is currently swapped with: ${this.currentSwapTarget}! Please swap back first.`);
                            return;
                        }

                        const REQUEST = Object.assign({}, this.FRM_RESOLVE_REQUEST);
                        REQUEST.FWName = Wincor.UI.Service.Provider.ConfigService.configuration.instanceName;
                        REQUEST.FWFuncID = 4035; //pce::gui::FUNC_CONTAINER_SWAP_LOCATION
                        REQUEST.param1 = targetInstance;
                        REQUEST.meta1 = [this.META_TYPE.CHAR_ANSI, -1];
                        REQUEST.param2 = "";
                        REQUEST.meta2 = ["NULL", 0];
                        REQUEST.param3 = "";
                        REQUEST.meta3 = ["NULL", 0];
                        REQUEST.param4 = "";
                        REQUEST.meta4 = ["NULL", 0];
                        REQUEST.param5 = "";
                        REQUEST.meta5 = ["NULL", 0];
                        REQUEST.paramUL = 0;
                        _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `. request to send: '${JSON.stringify(REQUEST)}'.`);
                        this.fireServiceEvent(this.SERVICE_EVENTS.LOCATION_CHANGED, {
                            source: {
                                instanceName: this.serviceProvider.getInstanceName(),
                                location: pos
                            },
                            target: {
                                instanceName: targetInstance,
                                location: ourPos
                            }
                        });
                        this.FrmResolve(REQUEST, message => {
                            this.currentSwapTarget = targetInstance;
                            const success = message.RC === 0;
                            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `* ViewService::swapLocation callback success: ${success}`);
                            success ? resolve() : reject();
                        });
                        _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< ViewService::swapLocation");
                    })
                    .catch(reason => {
                        _logger.error(`ViewService::swapLocation failed due to ${reason}`);
                    });
            });
        }

        /**
         * This function gets the location and size of this UI-instance.
         * @param {string=} [targetInstance=""]          The UI-instance name to get location for.
         * If not given, the position of this instance is retrieved
         * @returns {Promise}                       resolving to  `{top:x, left:y, width:w, height:h}`
         */
        getLocation(targetInstance = "") {
            return ext.Promises.promise((resolve, reject) => {
                _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> ViewService::getLocation()`);

                const REQUEST = Object.assign({}, this.FRM_RESOLVE_REQUEST);
                REQUEST.FWName = targetInstance || Wincor.UI.Service.Provider.ConfigService.configuration.instanceName;
                REQUEST.FWFuncID = 4034; //pce::gui::FUNC_CONTAINER_GET_LOCATION
                REQUEST.param1 = -1;
                REQUEST.meta1 = [this.META_TYPE.LONG, 0];
                REQUEST.param2 = -1;
                REQUEST.meta2 = [this.META_TYPE.LONG, 0];
                REQUEST.param3 = -1;
                REQUEST.meta3 = [this.META_TYPE.LONG, 0];
                REQUEST.param4 = -1;
                REQUEST.meta4 = [this.META_TYPE.LONG, 0];
                REQUEST.param5 = -1;
                REQUEST.meta5 = [this.META_TYPE.NULL, 0];
                REQUEST.paramUL = 0;
                _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `. request to send: '${JSON.stringify(this.FRM_RESOLVE_REQUEST)}'.`);
                this.FrmResolve(REQUEST, message => {
                    const success = message.RC === 0;
                    _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `* ViewService::getLocation callback returned: ${JSON.stringify(message, null, " ")}`);
                    success
                        ? resolve({
                            top: message.param2,
                            left: message.param1,
                            width: message.param3,
                            height: message.param4
                        })
                        : reject(`*Error! ViewService::getLocation callback returned: ${JSON.stringify(message, null, " ")}`);
                });
                _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< ViewService::getLocation");
            });
        }

        /**
         * Tells the current view to suspend and clears a running timer by calling {@link Wincor.UI.Service.ViewService#clearTimeout}.
         *
         * @returns {Number}   In case of success it returns a `suspendId`, otherwise `-1`.
         * @fires Wincor.UI.Service.ViewService#SERVICE_EVENTS:SUSPEND
         */
        suspend() {
            this.logger.LOG_SRVC_INOUT && this.logger.log(this.logger.LOG_SRVC_INOUT, `> ViewService::suspend() isSuspended=${this.isSuspended}`);
            let ret;
            if(this.contentRunning) {
                this.suspendId++;
                this.suspendList.push(this.suspendId);
                // Event is only sent on first call to suspend! When already suspended we just return suspendId
                if(!this.isSuspended) {
                    this.fireServiceEvent(this.SERVICE_EVENTS.SUSPEND);
                    this.isSuspended = true;
                    this.clearTimeout();
                }
                ret = this.suspendId;
            } else {
                ret = -1;
            }
            this.logger.LOG_SRVC_INOUT && this.logger.log(this.logger.LOG_SRVC_INOUT, `< ViewService::suspend returns suspendId ${this.suspendId}`);
            return ret;
        }

        /**
         * Resume the view, which was suspended with {@link Wincor.UI.Service.ViewService#suspend}.
         *
         * @returns {Boolean}   True, if the view could be resumed.
         * @fires Wincor.UI.Service.ViewService#SERVICE_EVENTS:RESUME
         */
        resume(suspendId) {
            this.logger.LOG_SRVC_INOUT && this.logger.log(this.logger.LOG_SRVC_INOUT, `> ViewService::resume(${suspendId}) of ${JSON.stringify(this.suspendList)}`);
            const index = this.suspendList.indexOf(suspendId);
            if(index > -1) {
                this.suspendList.splice(index, 1);
            }
            if(this.suspendList.length === 0) {
                this.isSuspended = false;
                this.fireServiceEvent(this.SERVICE_EVENTS.RESUME);
                this.refreshTimeout();
            }
            this.logger.LOG_SRVC_INOUT && this.logger.log(this.logger.LOG_SRVC_INOUT, `< ViewService::resume - remaining:${JSON.stringify(this.suspendList)}`);
            return !this.isSuspended;
        }

        /**
         * Adds a style or link element given as string to the content's header
         * @param {string} htmlString The text representation of the element. Either a complete <style>...</style> or <link> string.
         * @returns {number} An id to be used for removeStyle function
         */
        addStyle(htmlString) {
            STYLE_ID++;
            this.logger.LOG_SRVC_INOUT && this.logger.log(this.logger.LOG_SRVC_INOUT, `> ViewService::addStyle(${htmlString})`);
            try {
                const doc = this.getContentWindowDocument(this.CONTENT_FRAME_NAME);
                let el = doc.createElement("a");
                el.innerHTML = htmlString;
                const nodeNames = ["LINK", "STYLE"];
                if(nodeNames.includes(el.lastChild.nodeName)) {
                    el = el.lastChild;
                    this.addedStyles.set(STYLE_ID, el);
                    doc.head.appendChild(el);
                } else {
                    _logger.error(`ViewService::addStyle - unsupported node <${el.lastChild.nodeName}> !`);
                }
            } catch(e) {
                _logger.error(`ViewService::addStyle ${e.message}\n${e.stack}`);
            }
            this.logger.LOG_SRVC_INOUT && this.logger.log(this.logger.LOG_SRVC_INOUT, `< ViewService::addStyle returns id ${STYLE_ID}`);
            return STYLE_ID;
        }

        /**
         * Removes a style element previously added with ViewService#addStyle.
         * @param {number} [styleId=null]      The id returned by ViewService#addStyle.
         * @returns {boolean}           Success flag.
         */
        removeStyle(styleId = null) {
            let success = false;
            this.logger.LOG_SRVC_INOUT && this.logger.log(this.logger.LOG_SRVC_INOUT, `> ViewService::removeStyle(${styleId})`);
            const doc = this.getContentWindowDocument(this.CONTENT_FRAME_NAME);
            if(styleId !== null) {
                let el;
                if(this.addedStyles.has(styleId)) {
                    el = this.addedStyles.get(styleId);
                    doc.head.removeChild(el);
                    this.addedStyles.delete(styleId);
                    success = true;
                } else {
                    _logger.error(`ViewService::removeStyle could not find styleId <${styleId}>`);
                }
            } else {
                // remove all if no styleId is given
                this.addedStyles.forEach(el => {
                    doc.head.removeChild(el);
                });
            }
            this.logger.LOG_SRVC_INOUT && this.logger.log(this.logger.LOG_SRVC_INOUT, `< ViewService::removeStyle success=${success}`);
            return success;
        }

        /**
         * This function will execute Gui.ContainerBringToTop() via the ProTopas bus. Need not be supported by Tooling.
         * @param {function=} callback  Callback will be called in application mode only.
         */
        bringToFront(callback) {
            if(Wincor.UI.Content.applicationMode) {
                const req = Object.assign({}, Wincor.UI.Gateway.prototype.REQUEST);

                req.service = "ViewService";
                req.methodName = "FrmResolve"; // this.METHOD_FRM_RESOLVE
                req.FWName = Wincor.UI.Service.Provider.ConfigService.configuration.instanceName; //GUIAPP or GUIDM
                req.FWFuncID = 4027; //FUNC_CONTAINER_BRINGTOTOP
                req.param1 = "";
                req.meta1 = ["NULL", 0];
                req.param2 = "";
                req.meta2 = ["NULL", 0];
                req.param3 = "";
                req.meta3 = ["NULL", 0];
                req.param4 = "";
                req.meta4 = ["NULL", 0];
                req.param5 = "";
                req.meta5 = ["NULL", 0];
                req.paramUL = 0;
                req.RC = -1;

                _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, `* ViewService::bringToTop with ${JSON.stringify(req)}`);

                this.FrmResolve(req, callback);
            }
        }

        /**
         * This function can be called to do the correction of the result.
         *
         * @param {Object} result The json object for the specified viewKey.
         * @param {function} processDisplayCallback Callback method.
         */
        getProperties(result, processDisplayCallback) {
            const resStringified = JSON.stringify(result); // something like "{ "url": "../../content/views/pleasewait.html", "timeout": "[&CCTAFW_PROP_TIMEOUT;#C;100000&]", "commandconfig": { "DEPOSIT_CONFIRM": 0, "DEPOSIT_CANCEL": 0 } }"
            let valueString = resStringified,
                replaceCount = 0,
                returnValueString = "";
            let propertyCount = 0,
                propertiesToFormatCount = 0;
            const propArray = [],
                  keyArray = []; // keyArray contains only the keys for the call to the data service
            // propArray example:
            // propArray[0][0] = "CCTAFW_PROP_TIMEOUT" --> the key
            // propArray[0][1] = "#C"                  --> the formatOption
            // propArray[0][2] = "100000"              --> the default
            // propArray[0][3] = "1000"                --> formatted value
            // propArray[1][0] = "CCTAFW_PROP_AMOUNT"  --> the key
            // propArray[1][1] = "#C"                  --> the formatOption
            // propArray[1][2] = "1234"                --> the default
            // propArray[1][3] = "12.34"               --> formatted value

            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> ViewService::getProperties('${resStringified}')`);

            // get first index values
            let index = valueString.indexOf(PROP_MARKER);
            let endIndex = valueString.indexOf(PROP_END_MARKER);
            let property;
            // run through the string and count the properties
            // add the properties to the keyArray
            while(index !== -1 && endIndex !== -1) {
                // extract property
                property = valueString.substring(index + 2, endIndex); // property = "CCTAFW_PROP_TIMEOUT;#C;100000"

                // remove first part of the string up to the end of the property
                valueString = valueString.substr(endIndex + 2);

                // add property to property array
                propArray[propertyCount] = property.split(";");

                // add key from property to key array (for call to data service)
                keyArray[propertyCount] = propArray[propertyCount][0]; // this may cause double keys adding - we must filter out later for a proper DataService call
                // count properties which must be formatted
                if(propArray[propertyCount][1] !== "") {
                    propertiesToFormatCount++;
                }

                // raise property count
                propertyCount++;

                // check if another property is in the string
                index = valueString.indexOf(PROP_MARKER);
                endIndex = valueString.indexOf(PROP_END_MARKER);
            }

            // renew valueString with the result
            valueString = resStringified;

            // replace all properties with the values from propArray
            const replace = function() {
                _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, "* ViewService::getProperties::replace()");

                // get first index values
                index = valueString.indexOf(PROP_MARKER);
                endIndex = valueString.indexOf(PROP_END_MARKER);

                // run again through the string and replace the properties with the values
                while(index !== -1 && endIndex !== -1) {
                    // add part before the property to the new string
                    returnValueString += valueString.substring(0, index);

                    // replace property with the value
                    returnValueString += propArray[replaceCount][3];

                    // raise replaceCount
                    replaceCount++;

                    // remove first part of the string up to the end of the property
                    valueString = valueString.substr(endIndex + 2);

                    // get index values for the next property
                    index = valueString.indexOf(PROP_MARKER);
                    endIndex = valueString.indexOf(PROP_END_MARKER);
                }
                // add rest of the string after the last property
                returnValueString += valueString;

                // parse new string to a JSON object
                result = JSON.parse(returnValueString);

                _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `< ViewService::getProperties returns: ${JSON.stringify(result)}`);
                processDisplayCallback(result);
            };

            // function for formatting the properties
            const doFormat = function(i) {
                // check if property at position i in propArray must be formatted
                if(propArray[i][1] !== "") {
                    Wincor.UI.Service.Provider.FormatService.format(propArray[i][3], propArray[i][1], function(formattedValue) {
                        // set value in propArray
                        propArray[i][3] = formattedValue.result;
                        i++;
                        if(i < propertyCount) {
                            // recursive call of this method
                            doFormat(i);
                        } else {
                            replace();
                        }
                    });
                } else {
                    i++;
                    if(i < propertyCount) {
                        // recursive call of this method
                        doFormat(i);
                    } else {
                        replace();
                    }
                }
            };

            // call the getValues method to get the values for the properties
            // filter out double keys, e.g. "CardlessIdEntry" can cause
            const uniqueKeyArray = keyArray.filter((item, i, a) => a.indexOf(item) === i);
            Wincor.UI.Service.Provider.DataService.getValues(
                uniqueKeyArray,
                function getValuesCallback(response) {
                    _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, `* ConfigService::getProperties::getValuesCallback)${JSON.stringify(response)}')`);

                    // add value to property array
                    for(let i = 0; i < propertyCount; i++) {
                        if(response[keyArray[i]] === "") {
                            // no value for property - use default value
                            propArray[i][3] = propArray[i][2];
                        } else {
                            // add value from result array for the property array
                            propArray[i][3] = response[keyArray[i]];
                        }
                    }

                    // no values which must be formatted - direct jump to replace
                    if(propertiesToFormatCount === 0) {
                        replace();
                    } else {
                        // format values
                        doFormat(0);
                    }
                },
                null
            );
        }

        /**
         * Returns the configuration of the given template viewkey.
         *
         * @param {string} defaultString The default viewkey on which the viewkey is based, e.g. "(#IdInput#)".
         * @returns {string} The value for the key or `_ERROR_` in case of an error.
         */
        mapToViewKey(defaultString) {
            const index = defaultString.indexOf(VAR_REPLACE_MARKER);
            const endIndex = defaultString.indexOf(VAR_REPLACE_END_MARKER);

            if(index === 0 && endIndex !== -1) {
                const template = defaultString.substring(index + 2, endIndex);
                return this.getTemplateValue(template);
            }
            _logger.error(`ViewService::invalid viewkey value '${defaultString}'!`);
            return "_ERROR_";
        }

        /**
         * Returns the configuration of the given template viewkey, which is stored in {@link Wincor.UI.Service.ViewService#TEMPLATE_VIEWKEYS}.
         *
         * @param {string} template    The template viewkey, e.g. "IdInput".
         * @returns {string}           The value  or _ERROR_ in case of an error.
         */
        getTemplateValue(template) {
            for(const i of Object.keys(this.TEMPLATE_VIEWKEYS)) {
                if(typeof i === "string" && i === template) {
                    return this.TEMPLATE_VIEWKEYS[i];
                }
            }

            _logger.error(`ViewService, no configuration for template viewkey ${template} found!`);
            return "_ERROR_";
        }

        /**
         * Corrects the given result by calling {@link Wincor.UI.Service.ViewService#correctValue} for any string, which is found in the object at any nesting level.
         * The purpose is to replace placeholders and change the data types from e.g. string to boolean if we find something like "true".
         *
         * @param {string} result    The JSON-notated configuration object for the specified viewKey
         * @param {string} viewKey   The viewKey.
         * @param {int=}   recursionCount Optional parameter for tracing. Not to be used by callers!
         */
        correctJSONObject(result, viewKey, recursionCount = 0) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> ViewService::correctJSONObject(${recursionCount}): key ${viewKey}=${JSON.stringify(result)}`);
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
            _logger.log(_logger.LOG_ANALYSE, `< ViewService::correctJSONObject(${recursionCount}): changed key ${viewKey}=${JSON.stringify(result)}`);
            return result;
        }

        /**
         * This function can be called to correct a value.
         * This means that:
         * <ul>
         * <li> placeholders for timeouts or defined keywords get replaced (see {@link Wincor.UI.Service.ViewService#DEFAULT_TIMEOUT_VALUES} and {@link Wincor.UI.Service.ViewService#KEYWORD_MAPPING} ).</li>
         * <li> numeric entries will change to type "Int"</li>
         * <li> "true" / "false" will change to type "boolean".</li>
         * </ul>
         *
         * @param {string} inputString  The value which should be corrected.
         * @return {string}             The string after the replacement.
         */
        correctValue(inputString) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> ViewService::correctValue = ${inputString}`);
            let value = "";
            const orgInput = inputString;
            let keywordFound = false;
            // get first index values
            let index = inputString.indexOf(VAR_REPLACE_MARKER);
            let endIndex = inputString.indexOf(VAR_REPLACE_END_MARKER);
            let placeholder;
            // check if string contains placeholder
            // yes - string with placeholder
            if(index !== -1 && endIndex !== -1) {
                // run through the string and replace the placeholder
                while(index !== -1 && endIndex !== -1) {
                    keywordFound = false;
                    // copy part before placeholder
                    value += inputString.substring(0, index);
                    // extract placeholder
                    placeholder = inputString.substring(index + 2, endIndex);
                    // search placeholder in KEYWORD_MAPPING
                    const keyWordKeys = Object.keys(this.KEYWORD_MAPPING);
                    for(const p of keyWordKeys) {
                        if(typeof p === "string" && p === placeholder) {
                            placeholder = this.KEYWORD_MAPPING[p];
                            keywordFound = true;
                        }
                    }
                    // search placeholder in DEFAULT_TIMEOUT_VALUES
                    const defaultTimeoutValueKeys = Object.keys(this.DEFAULT_TIMEOUT_VALUES);
                    for(const i of defaultTimeoutValueKeys) {
                        if(typeof i === "string" && i === placeholder) {
                            const retVal = this.DEFAULT_TIMEOUT_VALUES[i];
                            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `< ViewService::correctValue returns = '${retVal}'`);
                            return retVal;
                        }
                    }
                    // add keyword to return string
                    if(keywordFound) {
                        value += placeholder;
                    } else {
                        _logger.error(`ViewService::correctValue: invalid value: ${orgInput}`);
                        return orgInput;
                    }

                    // remove first part of the input string up to the end of the placeholder
                    inputString = inputString.substr(endIndex + 2);

                    // check if another placeholder is in the string
                    index = inputString.indexOf(VAR_REPLACE_MARKER);
                    endIndex = inputString.indexOf(VAR_REPLACE_END_MARKER);
                }

                // add rest of the string after the last placeholder
                value += inputString;
            } else {
                value = inputString;
            }

            // check if defaultString could be parsed to an int
            // REMARK: If the string only contains numbers, but begins with zero we omit the parsing and let the string as it is,
            // otherwise we would lose the leading "0" -> (e.g. "017812345555" would be converted to 17812345555)
    
            const tmpString = value;

            if(jQuery.isNumeric(tmpString) && (tmpString.length === 1 || tmpString[0] !== "0")) {
                value = parseInt(tmpString);
            }

            // check if input value is a boolean
            if(tmpString === "true") {
                value = true;
            } else if(tmpString === "false") {
                value = false;
            }

            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `< ViewService::correctValue returns = ${value}`);
            return value;
        }

        /**
         * Reads the configuration of the timeouts from <i>\\Services\\Timeouts</i> and stores it in {@link Wincor.UI.Service.ViewService#DEFAULT_TIMEOUT_VALUES}.
         *
         * @returns {Promise}   Resolving to the same object as {@link Wincor.UI.Service.ViewService#DEFAULT_TIMEOUT_VALUES}.
         */
        readTimeouts() {
            const configService = this.serviceProvider.ConfigService;
            const rootSection = configService.configuration.instanceName;
            const timeoutSection = `${rootSection}\\Services\\Timeouts`;
            return configService.getConfiguration(timeoutSection, null).then(timeoutResults => {
                _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `* ViewService::readTimeouts(): default timeouts = ${JSON.stringify(timeoutResults)}`);
                this.DEFAULT_TIMEOUT_VALUES = Object.assign(this.DEFAULT_TIMEOUT_VALUES, timeoutResults);
                _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `* ViewService::readTimeouts(): this.DEFAULT_TIMEOUT_VALUES = ${JSON.stringify(this.DEFAULT_TIMEOUT_VALUES)}`);
                // set variables for timeouts
                this.pageTimeout = timeoutResults.PageTimeout;
                this.immediateTimeout = timeoutResults.ImmediateTimeout;
                this.endlessTimeout = timeoutResults.EndlessTimeout;
                this.messageTimeout = timeoutResults.MessageTimeout;
                this.confirmationTimeout = timeoutResults.ConfirmationTimeout;
                this.inputTimeout = timeoutResults.InputTimeout;
                this.pinentryTimeout = timeoutResults.PinentryTimeout;

                return timeoutResults;
            });
        }

        /**
         * Reads the general configuration from <i>\\Services\\UIMapping</i>.
         * It reads the parameters `onCancelQuestionDefault` and `onTimeoutQuestionDefault` and overwrites the corresponding defaults in {@link Wincor.UI.Service.ViewService#DEFAULT_VIEWKEY_VALUES}.
         *
         * @returns {Promise}   Resolving to a configuration object of the section.
         */
        readGeneralUIMapping() {
            const configService = this.serviceProvider.ConfigService;
            const rootSection = configService.configuration.instanceName;
            const uiMappingSection = `${rootSection}\\Services\\UIMapping`;
            return configService.getConfiguration(uiMappingSection, null).then(uiMappingResults => {
                _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `* ViewService::readGeneralUIMapping(): uiMappingResults = ${JSON.stringify(uiMappingResults)}`);

                if(uiMappingResults.onCancelQuestionDefault === true || uiMappingResults.onCancelQuestionDefault === false) {
                    this.DEFAULT_VIEWKEY_VALUES.popup.oncancel = uiMappingResults.onCancelQuestionDefault;
                }
                if(uiMappingResults.onTimeoutQuestionDefault === true || uiMappingResults.onTimeoutQuestionDefault === false) {
                    this.DEFAULT_VIEWKEY_VALUES.popup.ontimeout = uiMappingResults.onTimeoutQuestionDefault;
                }
                _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `* ViewService::readGeneralUIMapping(): DEFAULT_VIEWKEY_VALUES = ${JSON.stringify(this.DEFAULT_VIEWKEY_VALUES)}`);

                return uiMappingResults;
            });
        }

        /**
         * Reads the keyword configuration from <i>\\Services\\UIMapping\\KeywordMapping</i> and stores it in {@link Wincor.UI.Service.ViewService#KEYWORD_MAPPING}.
         *
         * @returns {Promise}   Resolving to a configuration object of the section.
         */
        readKeywordMapping() {
            const configService = this.serviceProvider.ConfigService;
            const rootSection = configService.configuration.instanceName;
            const keywordsSection = `${rootSection}\\Services\\UIMapping\\KeywordMapping`;

            return configService.getConfiguration(keywordsSection, null).then(keywordResults => {
                _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `* ViewService::readKeywordMapping(): keywords = ${JSON.stringify(keywordResults)}`);

                this.KEYWORD_MAPPING = keywordResults;

                return keywordResults;
            });
        }

        /**
         * Reads the keyword configuration from <i>\\ProInstall\\Wosassp</i> and stores it in {@link Wincor.UI.Service.ViewService#softkeyPositionsY}.
         *
         * @returns {Promise}   Resolving to a reference to {@link Wincor.UI.Service.ViewService#softkeyPositionsY}.
         */
        readSoftkeyPositions() {
            const configService = this.serviceProvider.ConfigService;

            return configService.getConfiguration("\\ProInstall\\Wosassp", "FuncKeysPos").then(rootResults => {
                // We expect something like: 0,34:0,49:0,63:0,78:100,34:100,49:100,63:100,78
                const value = rootResults.FuncKeysPos;
                if(value) {
                    const split = value.split(":");
                    // we only need the first 4 values, because we assume that the y positions are equal on both sides
                    for(let i = 0; i < 4; i++) {
                        const tmp = split[i];
                        this.softkeyPositionsY.push(parseInt(tmp.substr(tmp.lastIndexOf(",") + 1, tmp.length - 1))); // isolate the Y pos value
                    }
                    _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `* ViewService::onServicesReady(): softkeyPositionsY=${this.softkeyPositionsY}`);
                }
                return this.softkeyPositionsY;
            });
        }

        /**
         * Reads the viewkey template configuration from either <i>\\Services\\UIMapping\\${viewSetName}\\Defaults</i> (Tooling 1.x) or
         * from <i>\\Services\\UIMapping\\${viewSetName}\\Templates</i> (Tooling 2.0) and stores it in
         * {@link Wincor.UI.Service.ViewService#TEMPLATE_VIEWKEYS}.
         *
         * @returns {Promise}   Resolving to a configuration object of the section.
         */
        readViewKeyTemplates(viewSetName) {
            const configService = this.serviceProvider.ConfigService;
            const rootSection = configService.configuration.instanceName;
            const defaultKeySection = `${rootSection}\\Services\\UIMapping\\${viewSetName}\\Defaults`;
            const templateKeySectionTooling20 = `${rootSection}\\Services\\UIMapping\\${viewSetName}\\Templates`;

            return configService.getConfiguration(defaultKeySection, null).then(defaultResults => {
                if(Object.keys(defaultResults).length > 0 && defaultResults[""] === undefined) {
                    //if there's anything inside? In ApplicationMode we get {"":""} if there's nothing in the secion
                    _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `* ViewService::readViewKeyTemplates(${viewSetName}) from ${defaultKeySection}: ${JSON.stringify(defaultResults)}`);

                    this.TEMPLATE_VIEWKEYS = Object.assign(this.TEMPLATE_VIEWKEYS, defaultResults);

                    return defaultResults;
                }
                return configService.getConfiguration(templateKeySectionTooling20, null).then(defaultResults => {
                    _logger.LOG_ANALYSE &&
                        _logger.log(_logger.LOG_ANALYSE, `* ViewService::readViewKeyTemplates(${viewSetName}) from ${templateKeySectionTooling20}: ${JSON.stringify(defaultResults)}`);

                    this.TEMPLATE_VIEWKEYS = Object.assign(this.TEMPLATE_VIEWKEYS, defaultResults);

                    return defaultResults;
                });
            });
        }

        /**
         * Writes a journal message, which contains the 'userAgent'.
         *
         * Reads the configuration from the registry section <i>\\Services\\General</i>.
         * Registers an "ADA state change handler" function if an 'adaViewSet' is configured.
         *
         * Reads the properties `PROP_UI_VIEWSET_KEY` and `PROP_UI_STYLE_TYPE_KEY`.
         *
         * Prepares the swapping functionality of <i>GUIAPP</i> and <i>GUIDM</i>.
         *
         * Reads all the other configuration parameters, like timeouts, viewkey configuration.
         *
         * If all other services are ready, it calls {@link Wincor.UI.Service.ViewService#startSPA} to load the initial URL.
         *
         * @returns {Promise}
         * @lifecycle service
         * @fires Wincor.UI.Service.ViewService#SERVICE_EVENTS:STYLE_TYPE_CHANGED
         */
        onServicesReady() {
            const self = this;
            const configService = this.serviceProvider.ConfigService;
            const journalService = this.serviceProvider.JournalService;

            journalService.whenReady.then(() => journalService.write(journalService.MSG_NUMBERS.MSG_BROWSER_VERSION, null, window.navigator.userAgent));

            let hasAdaStarted = false; // flag (closured by -adaStateChangeHandler) to prevent from loadingViewSet only because CCTAFW_PROP_ADA_STATUS_VALUE has been stopped without started.
            return ext.Promises.promise((resolve, reject) => {
                _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> ViewService::onServicesReady()");
                // data/localize
                configService
                    .getConfiguration(`${configService.configuration.instanceName}\\Services\\General`, ["InitialViewSet", "AdaViewSet", "CacheHTML", "BeepOnTimeoutPopup", "BeepOnTimeoutPopupPeriod"])
                    .then(genResult => {
                        _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `* ViewService::onServicesReady(): genResult = ${JSON.stringify(genResult, null, " ")}`);
                        // if not configured we set it to "" also to be compatible

                        // WARNING: bool.toLowerCase() hangs up JS !!! no exception! no error log!
                        //self.DEFAULT_VIEWKEY_VALUES.popup.beepontimeout = genResult["BeepOnTimeoutPopup"].toLowerCase() === "true";
                        self.DEFAULT_VIEWKEY_VALUES.popup.beepontimeout = !!genResult["BeepOnTimeoutPopup"];
                        if(genResult["BeepOnTimeoutPopupPeriod"] !== "") {
                            self.DEFAULT_VIEWKEY_VALUES.popup.beepontimeoutperiod = genResult["BeepOnTimeoutPopupPeriod"];
                        }
                        _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `* ViewService::onServicesReady(): beepontimeoutperiod=${self.DEFAULT_VIEWKEY_VALUES.popup.beepontimeoutperiod}`);

                        self.viewSetName = genResult["InitialViewSet"];
                        self.initialViewSet = self.viewSetName;
                        self.adaViewSet = genResult["AdaViewSet"];
                        // normalize/check boolean config
                        self.cacheHTML = !!genResult["CacheHTML"];
                        _logger.LOG_ANALYSE &&
                            _logger.log(_logger.LOG_ANALYSE, `* ViewService::onServicesReady(): CacheHTML=${self.cacheHTML}, InitialViewSet=${self.viewSetName}, AdaViewSet=${self.adaViewSet}`);

                        // register for ada events to auto switch viewset only if configured
                        if(self.adaViewSet) {
                            const adaService = Wincor.UI.Service.Provider.AdaService;
                            // Please note that this state handler will often be triggered because the business app often changes the value CCTAFW_PROP_ADA_STATUS_VALUE property.
                            // That's why we control the updates with an own flag called -hasAdaStarted
                            const adaStateChangedHandler = eventData => {
                                _logger.LOG_ANALYSE &&
                                    _logger.log(
                                        _logger.LOG_ANALYSE,
                                        `* ViewService::onServicesReady::adaStateChangedHandler eventData=${eventData}, current ViewSet=${self.viewSetName}, ada ViewSet=${self.adaViewSet}`
                                    );
                                if(eventData === "FIRSTSTARTANDACTIVATE" || eventData === "FIRSTSTART") {
                                    hasAdaStarted = true; // ADA has been really started now
                                    // switch to ada view set on next view if not already active
                                    if(self.viewSetName.toLowerCase() !== self.adaViewSet.toLowerCase()) {
                                        _logger.LOG_ANALYSE &&
                                            _logger.log(_logger.LOG_ANALYSE, `* ViewService::onServicesReady::adaStateChangedHandler  - loading viewset for ada -> ${self.adaViewSet}`);
                                        self.loadViewSet(self.adaViewSet)
                                            .then(() =>
                                                // send acknowledge with first start
                                                adaService.externalAdaCommandAck(eventData)
                                            )
                                            .catch(cause => {
                                                hasAdaStarted = false;
                                                _logger.error(`* ViewService::onServicesReady::adaStateChangedHandler error loading new view set due to ADA first start event ${cause}`);
                                                adaService.externalAdaCommandAck(eventData); // send acknowledge with first start anyway
                                            });
                                    } else {
                                        _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, "* ViewService::onServicesReady::adaStateChangedHandler viewset for ada already active");
                                        adaService.externalAdaCommandAck(eventData); // send acknowledge with first start anyway
                                    }
                                } else if(hasAdaStarted && eventData === "LASTSTOP") {
                                    // ADA has been started before?
                                    hasAdaStarted = false;
                                    if(self.viewSetName.toLowerCase() !== self.initialViewSet.toLowerCase()) {
                                        _logger.LOG_ANALYSE &&
                                            _logger.log(
                                                _logger.LOG_ANALYSE,
                                                `* ViewService::onServicesReady::adaStateChangedHandler - ADA stop event, loading initial viewset -> ${self.initialViewSet}`
                                            );
                                        self.loadViewSet(self.initialViewSet)
                                            .then(() =>
                                                // send acknowledge with last stop
                                                adaService.externalAdaCommandAck(eventData)
                                            )
                                            .catch(cause => {
                                                _logger.error(`* ViewService::onServicesReady::adaStateChangedHandler error loading initial view set due to ADA last stop event ${cause}`);
                                                adaService.externalAdaCommandAck(eventData); // send acknowledge with last stop anyway
                                            });
                                    } else {
                                        _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, "* ViewService::onServicesReady::adaStateChangedHandler viewset for ending ada already active");
                                        adaService.externalAdaCommandAck(eventData); // send acknowledge with last stop anyway
                                    }
                                }
                            };
                            self.registerForServiceEvent(adaService.SERVICE_EVENTS.FIRST_START, adaStateChangedHandler, true);
                            self.registerForServiceEvent(adaService.SERVICE_EVENTS.LAST_STOP, adaStateChangedHandler, true);
                        } else {
                            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, "* ViewService::onServicesReady(): no valid AdaViewSet configured... disabling automatic switching");
                        }
                        return ext.Promises.promise(resolve => {
                            const PROP_UI_VIEWSET_KEY = "PROP_UI_VIEWSET_KEY";
                            // read property and read text key for view-set switching
                            const checkViewSetTextEntry = result => {
                                const viewSetKey = result[PROP_UI_VIEWSET_KEY];
                                _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `> ViewService::onServicesReady:checkViewSetTextEntry viewSetKey=${viewSetKey}`);
                                if(viewSetKey && viewSetKey !== '""') {
                                    // got a text key?
                                    self.serviceProvider.LocalizeService.getText([viewSetKey], result => {
                                        const viewSetName = result[viewSetKey];
                                        _logger.LOG_ANALYSE &&
                                            _logger.log(
                                                _logger.LOG_ANALYSE,
                                                `* ViewService::onServicesReady:checkViewSetTextEntry demanded view set name=${viewSetName}, current view set name=${self.viewSetName}`
                                            );
                                        if(viewSetName !== null && viewSetName !== self.viewSetName) {
                                            // only if the demanded viewset is not already the current
                                            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< ViewService::onServicesReady:checkViewSetTextEntry");
                                            return self.loadViewSet(viewSetName);
                                        }
                                    });
                                } else if(self.viewSetName !== self.initialViewSet) {
                                    _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `< ViewService::onServicesReady:checkViewSetTextEntry load initial view set=${self.initialViewSet}`);
                                    return self.loadViewSet(self.initialViewSet);
                                }
                                _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< ViewService::onServicesReady:checkViewSetTextEntry did nothing");
                                return ext.Promises.Promise.resolve();
                            };

                            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, "* ViewService::onServicesReady getting viewSetKey");
                            Wincor.UI.Service.Provider.DataService.getValues(
                                [PROP_UI_VIEWSET_KEY],
                                // callback
                                result => {
                                    _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, "* ViewService::onServicesReady getting viewSetKey callback");
                                    checkViewSetTextEntry(result).then(resolve);
                                },
                                // changed callback
                                result => {
                                    _logger.LOG_ANALYSE &&
                                        _logger.log(_logger.LOG_ANALYSE, `* ViewService::onServicesReady restarting=${self.restarting} viewSetKey changed to ${JSON.stringify(result)}`);
                                    if(!self.restarting) {
                                        checkViewSetTextEntry(result).then(resolve);
                                    } else {
                                        resolve();
                                    }
                                },
                                true
                            );
                        });
                    })
                    .then(() => {
                        return configService.getConfiguration(configService.configuration.instanceName, null).then(mainConfig => {
                            self.initialLocation = {
                                top: mainConfig["ContainerWindowPosY"],
                                left: mainConfig["ContainerWindowPosX"],
                                width: mainConfig["ContainerWindowSizeX"],
                                height: mainConfig["ContainerWindowSizeY"]
                            };

                            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `* ViewService::onServicesReady() initialLocation:\n${JSON.stringify(self.initialLocation, null, " ")}`);
                            self.baseLocation = Object.assign(self.initialLocation);

                            // GUIVIDEO location is controlled by GUIAPP's VideoService, do not let GUIVIDEO's ViewService instance react on LOCATION_CHANGED by it self!
                            if(self.serviceProvider.getInstanceName() !== "GUIVIDEO") {
                                const eventSvc = self.serviceProvider.EventService;
                                eventSvc.whenReady.then(() => {
                                    const TXN_EVENTS = eventSvc.getEventInfo("TRANSACTION_MODULE");
                                    eventSvc.registerForEvent(
                                        TXN_EVENTS.ID_SESSION_END,
                                        TXN_EVENTS.NAME,
                                        () => {
                                            _logger.LOG_ANALYSE &&
                                                _logger.log(
                                                    _logger.LOG_ANALYSE,
                                                    `* ViewService::onServicesReady() received ID_SESSION_END initialLocation:\n
                                                    ${JSON.stringify(self.initialLocation, null, " ")}\n
                                                    baseLocation:\n
                                                    ${JSON.stringify(self.baseLocation, null, " ")}`
                                                );
                                            // only reset if baselocation top/left differs from initialLocation
                                            if(self.baseLocation.top !== self.initialLocation.top || self.baseLocation.left !== self.initialLocation.left) {
                                                _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `* ViewService::onServicesReady() basLoc!=initialLoc (top/left) - resetLocation`);
                                                window.setTimeout(self.resetLocation.bind(self), 1);
                                            } else {
                                                _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `* ViewService::onServicesReady() basLoc==initialLoc (top/left) -  No resetLocation required`);
                                            }
                                        },
                                        void 0,
                                        "ASCII",
                                        true
                                    );
                                });
                            } else {
                                _logger.LOG_ANALYSE &&
                                    _logger.log(_logger.LOG_ANALYSE, `* ViewService::onServicesReady() GUIVIDEO instance is controlled by GUIAPP -  No automatic resetLocation required`);
                            }
                        });
                    })
                    .then(() => {
                        return self.readTimeouts();
                    })
                    .then(() => {
                        return self.readGeneralUIMapping();
                    })
                    .then(() => {
                        return self.readKeywordMapping();
                    })
                    .then(() => {
                        return self.readSoftkeyPositions();
                    })
                    .then(() => {
                        return self.readViewKeyTemplates(self.viewSetName);
                    })
                    .then(() => {
                        return self.readViewKeys(self.viewSetName);
                    })
                    .then(() => {
                        const ourInstance = self.serviceProvider.getInstanceName();
                        // swapping currently restricted between APP/DM
                        if(["GUIAPP", "GUIDM"].includes(ourInstance)) {
                            const otherInstance = ourInstance === "GUIAPP" ? "GUIDM" : "GUIAPP";
                            // register for GUI state change and resolve a promise when going into a state != "INIT"
                            const guiStatePromise = ext.Promises.promise((resolve, reject) => {
                                const eventService = self.serviceProvider.EventService;
                                eventService.whenReady.then(async () => {
                                    try {
                                        const otherInstanceInstalled = await self.serviceProvider.ViewService.hasRemoteInstance(otherInstance);
                                        _logger.LOG_ANALYSE &&
                                            _logger.log(
                                                _logger.LOG_ANALYSE,
                                                `* ViewService::onServicesReady(): ${otherInstance} install state: ${otherInstanceInstalled} (for making first cross-call from ${ourInstance} to ${otherInstance})`
                                            );
                                        if(otherInstanceInstalled) {
                                            const GUI_EVENT_INFO = eventService.getEventInfo(`${otherInstance}_MODULE`);
                                            _logger.LOG_INFO && _logger.log(_logger.LOG_INFO, `* ViewService::onServicesReady(): ${ourInstance} now register ${JSON.stringify(GUI_EVENT_INFO)}`);
                                            const regId = eventService.registerForEvent(
                                                GUI_EVENT_INFO.ID_STATUS_CHANGED,
                                                GUI_EVENT_INFO.NAME,
                                                statusChangedHexDataString => {
                                                    // first 8 bytes are type long status... slice data, split character pairs, reverse (because of gui.dll byte-order) and parseInt
                                                    const statusValue = parseInt(
                                                        statusChangedHexDataString
                                                            .slice(0, 8)
                                                            .match(/.{1,2}/g)
                                                            .reverse()
                                                            .join(""),
                                                        16
                                                    );
                                                    _logger.LOG_DETAIL &&
                                                        _logger.log(
                                                            _logger.LOG_DETAIL,
                                                            `* ViewService::onServicesReady(): ${otherInstance} status changed to: ${Object.keys(GUI_STATUS).find(
                                                                key => GUI_STATUS[key] === statusValue
                                                            )}`
                                                        );
                                                    if(statusValue !== GUI_STATUS.INIT && statusValue !== GUI_STATUS.UN_INIT && statusValue !== GUI_STATUS.ERROR) {
                                                        eventService.deregisterEvent(regId);
                                                        _logger.LOG_ANALYSE &&
                                                            _logger.log(
                                                                _logger.LOG_ANALYSE,
                                                                `* ViewService::onServicesReady(): ${otherInstance} status is in ${statusValue}, resolve promise for making first cross-call from ${ourInstance} to ${otherInstance}`
                                                            );
                                                        resolve();
                                                    }
                                                },
                                                null,
                                                "HEX",
                                                true
                                            );
                                        } else {
                                            resolve();
                                        }
                                    } catch(e) {
                                        _logger.LOG_INFO && _logger.log(_logger.LOG_INFO, `* ViewService::onServicesReady() error getting remote instance or GUI ID_STATUS_CHANGED handling: ${e}`);
                                        reject(`ViewService::onServicesReady() error getting remote instance or GUI ID_STATUS_CHANGED handling: ${e}`);
                                    }
                                });
                            });
                            // wait for the correct (WAIT) state of GUI impl and for own readiness
                            ext.Promises.Promise.all([self.whenReady, guiStatePromise]).then(() => {
                                // register for a swap location change
                                self.serviceProvider.ViewService.getRemoteInstance(otherInstance)
                                    .then(otherViewService => {
                                        // register both, ourself and remote... both could be initiator of swapLocation
                                        const assignNewBase = locationData => {
                                            _logger.LOG_ANALYSE &&
                                                _logger.log(_logger.LOG_ANALYSE, `* ViewService::onServicesReady(): received LOCATION_CHANGED:\n${JSON.stringify(locationData, null, " ")}`);
                                            // new positions arrived... check if we are sender or target
                                            self.baseLocation = Object.assign(locationData.source.instanceName === ourInstance ? locationData.source.location : locationData.target.location);
                                            _logger.LOG_ANALYSE &&
                                                _logger.log(_logger.LOG_ANALYSE, `* ViewService::onServicesReady(): new baseLocation:\n${JSON.stringify(self.baseLocation, null, " ")}`);
                                        };
                                        _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `* ViewService::onServicesReady(): now registering for LOCATION_CHANGED events`);
                                        self.registerForServiceEvent(self.SERVICE_EVENTS.LOCATION_CHANGED, assignNewBase, true);
                                        otherViewService.registerForServiceEvent(otherViewService.SERVICE_EVENTS.LOCATION_CHANGED, assignNewBase, true);
                                    })
                                    .catch(reason => {
                                        _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `* ViewService::onServicesReady(): getRemoteInstance(${otherInstance}) rejected with: ${reason}`);
                                        // recover here... not throwing
                                    });
                            });
                        } else {
                            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `* ViewService::onServicesReady(): getRemoteInstance for ${ourInstance} skipped`);
                        }
                    })
                    .then(() => {
                        _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `* ViewService::onServicesReady(): proceed`);
                        // viewkeys are read, open window and resolve onServicesReady call when window sends ACTIVATED... that's it
                        self.registerForServiceEvent(
                            self.SERVICE_EVENTS.VIEW_ACTIVATED,
                            () => {
                                super.onServicesReady().then(resolve);
                            },
                            self.DISPOSAL_TRIGGER_ONETIME
                        );
                        // This is the initial SPA start up. Further start ups might be possible during view set switch.
                        // When all other services we depend on are ready, we start SPA.
                        const svcNames = [];
                        const serviceDependenciesReady = self.serviceProvider.serviceNames
                            .filter(svcName => {
                                // Attention: Waiting for other services without resolving 'onServicesReady' promise may result in a deadlock if two services wait for each other.
                                // We exclude VideoService and our own name for this reason
                                const isServiceToWaitFor = ![self.NAME, "VideoService"].includes(svcName);
                                if(isServiceToWaitFor) {
                                    svcNames.push(svcName);
                                    _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `* ViewService::onServicesReady(): waiting for ${svcName}`);
                                }
                                return isServiceToWaitFor;
                            })
                            .map(svcName => {
                                const p = self.serviceProvider[svcName].whenReady;
                                if(p) {
                                    p.then(() => {
                                        _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `* ViewService::onServicesReady(): waiting for ${svcName} finished`);
                                    });
                                }
                                _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `* ViewService::onServicesReady(): pushing ${p} for ${svcName}`);
                                return p;
                            });
                        ext.Promises.Promise.all(serviceDependenciesReady)
                            .timeout(20000) // security timeout... If there is a deadlock somewhere it will nevertheless be safe to launch now
                            .catch(reason => {
                                // if it is timeout only, recover and pass
                                if(!(reason && reason.name === "TimeoutError")) {
                                    throw reason;
                                }
                                _logger.error(`WARNING: ViewService::onServicesReady():\nTimeout waiting for depending services! - Please check syncing of services: \n${svcNames.join("\n")}`);
                            })
                            .then(() => {
                                _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `* ViewService::onServicesReady(): all services ready - starting content`);
                                self.startSPA(self.startURL);
                            })
                            .then(() => {
                                // If GUIDM is running in fullscreen due to customer interaction, it will "suspend" us to avoid timeouts of underlying guiapp view
                                // To avoid being stuck in case GUIDM crashes during our suspension, we register for GUIDM STATUS_CHANGED to ERROR event.
                                // If we receive such an event and are suspended currently, we will automatically resume to stay interactive.
                                // no need to sync... if services are ready, we install the GUIDM event handler
                                const ourInstance = self.serviceProvider.getInstanceName();
                                // register for DM (currently) going down to be able to resume all suspensions in this case
                                if(ourInstance === "GUIAPP") {
                                    self.serviceProvider.EventService.whenReady.then(async () => {
                                        try {
                                            const dmInstalled = await self.serviceProvider.ViewService.hasRemoteInstance("GUIDM");
                                            _logger.LOG_ANALYSE &&
                                                _logger.log(_logger.LOG_ANALYSE, `* ViewService::onServicesReady(): GUIDM install state: ${dmInstalled} (for resuming ${ourInstance} if suspended)`);
                                            if(dmInstalled) {
                                                const GUIDM_EVENT = self.serviceProvider.EventService.getEventInfo("GUIDM_MODULE");
                                                self.serviceProvider.EventService.registerForEvent(
                                                    GUIDM_EVENT.ID_STATUS_CHANGED,
                                                    GUIDM_EVENT.NAME,
                                                    statusChangedHexDataString => {
                                                        // first 8 bytes are type long status... slice data, split character pairs, reverse (because of gui.dll byte-order) and parseInt
                                                        const statusValue = parseInt(
                                                            statusChangedHexDataString
                                                                .slice(0, 8)
                                                                .match(/.{1,2}/g)
                                                                .reverse()
                                                                .join(""),
                                                            16
                                                        );
                                                        _logger.LOG_DETAIL &&
                                                            _logger.log(
                                                                _logger.LOG_DETAIL,
                                                                `* ViewService::onServicesReady(): GUIDM status changed to:
                                                                ${Object.keys(GUI_STATUS).find(key => GUI_STATUS[key] === statusValue)} (resume ${ourInstance} on suspend)`
                                                            );
                                                        if(statusValue === GUI_STATUS.ERROR && self.isSuspended) {
                                                            self.suspendList = [];
                                                            self.resume(-1);
                                                        }
                                                    },
                                                    null,
                                                    "HEX",
                                                    true
                                                );
                                            }
                                        } catch(e) {
                                            _logger.LOG_INFO && _logger.log(_logger.LOG_INFO, `* ViewService::onServicesReady(): ${e}`);
                                        }
                                    });
                                }
                            });
                    })
                    .catch(exc => {
                        self.serviceProvider.propagateError(self.NAME, "CONFIGURATION", exc);
                        super.onServicesReady().then(reject("ViewService::onServicesReady failed because of a rejected promise in the chain"));
                    });

                // BEGIN retrieving style type stuff -->
                const PROP_UI_STYLE_TYPE_KEY = "PROP_UI_STYLE_TYPE_KEY";
                let reg = -1;

                // PROP_UI_STYLE_TYPE_KEY callback on initial/update
                function changeStyleType(result) {
                    _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> ViewService::onServicesReady::changeStyleType result=${JSON.stringify(result)}`);
                    const styleTextKey = result[PROP_UI_STYLE_TYPE_KEY];
                    if(styleTextKey !== null && styleTextKey !== void 0) {
                        // Remark: Even if the styleTextKey is empty force a getText call, in such a case the result will be empty but the
                        // StyleResourceResolver will handle this case.
                        Wincor.UI.Service.Provider.LocalizeService.getText(
                            [styleTextKey],
                            result => {
                                let value = result[styleTextKey];
                                // map value to the right default, if empty or undefined
                                value = value === "" || value === void 0 || value === null || value === "\\" || value === '""' ? "" : value;
                                _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `* ViewService::onServicesReady::changeStyleType type='${value}'`);
                                self.currentStyleTypeByStylesheetKey = value;
                                if(!self.isRestartOnNextDisplay) {
                                    self.fireServiceEvent(self.SERVICE_EVENTS.STYLE_TYPE_CHANGED, value);
                                } else {
                                    // viewset will change on next display - postpone event until new viewset is loaded
                                    _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, "* ViewService::onServicesReady::changeStyleType postponing fire STYLE_TYPE_CHANGED.");
                                    if(reg !== -1) {
                                        self.deregisterFromServiceEvent(reg);
                                    }
                                    reg = self.registerForServiceEvent(
                                        self.SERVICE_EVENTS.VIEW_ACTIVATED,
                                        eventData => {
                                            const href = typeof eventData === "string" ? eventData : eventData.href;
                                            if(href && href.endsWith("index.html")) {
                                                // check for welcome and then fire style event
                                                _logger.LOG_ANALYSE &&
                                                    _logger.log(_logger.LOG_ANALYSE, `* ViewService::onServicesReady::changeStyleType viewset ${self.viewSetName} loaded (welcome).`);
                                                // decouple
                                                setTimeout(() => {
                                                    self.fireServiceEvent(self.SERVICE_EVENTS.STYLE_TYPE_CHANGED, value);
                                                    self.deregisterFromServiceEvent(reg);
                                                    reg = -1;
                                                }, 1);
                                            }
                                        },
                                        true
                                    );
                                }
                            },
                            false
                        ); // no auto update on language changed
                    } else {
                        // PROP_UI_STYLE_TYPE_KEY not existent
                        _logger.error(`The property=${PROP_UI_STYLE_TYPE_KEY} doesn't exist which is unexpected!`);
                    }
                    _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< ViewService::onServicesReady::changeStyleType");
                }

                //TODO Could the next getValues and calling of changeStyleType be dangerous, because the above code works in parallel? Maybe the getValues should be part of the above sequence.
                Wincor.UI.Service.Provider.DataService.getValues([PROP_UI_STYLE_TYPE_KEY], changeStyleType, changeStyleType, true);
                //<-- END retrieving stylesheet folder stuff
                _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< ViewService::onServicesReady");
            });
        }

        /**
         * Reads the viewkey configuration from <i>\\Services\\UIMapping\\${viewSetName}</i>.
         *
         * During startup this function must not be called before timeouts, keywords and template viewkeys have been read, to be able to modify the mappings accordingly.
         * This function already extends the results with missing default parameters, which are stored {@link Wincor.UI.Service.ViewService#DEFAULT_VIEWKEY_VALUES}.
         * It also calls {@link Wincor.UI.Service.ViewService#mapToViewKey}, to replace values of the template-based viewkeys.
         * Afterwards {@link Wincor.UI.Service.ViewService#correctJSONObject} is called.
         * This means that all viewkey values in {@link Wincor.UI.Service.ViewService#urlMapping} will be valid JSON objects afterwards and the viewkeys are ready to use.
         * @param {string} viewSetName `Touch` or `Softkey`, used to determine the correct section.
         * @returns {Promise}
         */
        readViewKeys(viewSetName) {
            const self = this;
            const configService = this.serviceProvider.ConfigService;
            return ext.Promises.promise(function(resolve, reject) {
                const keySection = `${configService.configuration.instanceName}\\Services\\UIMapping\\${viewSetName}`;
                _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, `> ViewService::readViewKeys(${viewSetName})`);
                configService.getConfiguration(keySection, null).then(function(result) {
                    _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `* ViewService::readViewKeys view keys = ${JSON.stringify(result)}`);
                    // console.log("* ViewService::onServicesReady(): view keys = " + JSON.stringify(result));
                    // layer one (map string to default viewkey if necessary and correction of the object)
                    for(const viewKey of Object.keys(result)) {
                        _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `* ViewService::readViewKeys(${viewKey}): result=${JSON.stringify(result[viewKey])}`);
                        // check if viewkey must be mapped
                        if(typeof result[viewKey] === "string") {
                            // e.g. "(#DEFAULT_MESSAGE_MAPPING#)"
                            result[viewKey] = self.mapToViewKey(result[viewKey]);
                            if(result[viewKey] === "_ERROR_") {
                                reject("viewKey configuration not available for viewSetName=" + viewSetName);
                                break;
                            }
                            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `* ViewService::readViewKeys(${viewKey}): mapped result=${JSON.stringify(result[viewKey])}`);
                        } else if(typeof result[viewKey] === "object" && result[viewKey]["useTemplate"] !== void 0) {
                            //Tooling 2.0 mapping!
                            result[viewKey] = self.getTemplateValue(result[viewKey]["useTemplate"], viewKey);
                            if(result[viewKey] === "_ERROR_") {
                                reject("viewKey configuration not available for viewSetName=" + viewSetName);
                                break;
                            }
                        }

                        // check if viewkey is a JSON object
                        if(typeof result[viewKey] === "object") {
                            // correction of the values
                            // property correction will be done in processDisplay function
                            //For jQuery extend see http://api.jquery.com/jquery.extend/, last example on that page is what we use here:
                            result[viewKey] = jQuery.extend(true, {}, self.DEFAULT_VIEWKEY_VALUES, result[viewKey]); //extends viewKeyConfig with missing default parameters
                            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `* ViewService::readViewKeys(${viewKey}): after-copy result: ${JSON.stringify(result[viewKey])}`);

                            result[viewKey] = self.correctJSONObject(result[viewKey], viewKey);
                            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `* ViewService::readViewKeys(${viewKey}): after-correct result: ${JSON.stringify(result[viewKey])}`);
                            if (!result[viewKey].url) {
                                reject(`ViewService::readViewKeys: Registry section 'UIMapping': Mapping for viewKey=${viewKey} is invalid due to missing or invalid, mandatory 'url' attribute !`);
                                break;
                            }
                        }
                    }

                    // copy complete result to mapping variable
                    self.urlMapping = result;
                    if(self.urlMapping["Index"]) {
                        self.startURL = self.urlMapping["Index"].url;
                        self.setViewContext({}, self.urlMapping["Index"]);
                        _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `* | VIEW ViewService::readViewKeys setting startURL to ${self.startURL}`);
                    }
                    _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, `< ViewService::readViewKeys(${viewSetName})`);
                    resolve();
                });
            });
        }

        /**
         * This function exists for debugging reasons only.
         * It is a workaround, which helps to step into this file during a JavaScript debugging session.
         */
        debug() {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> ViewService::debug");
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< ViewService::debug");
        }

        /**
         * This method is called by the service-provider if an error occurred in any service.
         *
         * It will end the view by calling {@link Wincor.UI.Service.ViewService#endView}.
         *
         * @param {String} serviceName  The name of this service.
         * @param {String} errorType    As defined in {@link Wincor.UI.Service.BaseService#ERROR_TYPE}.
         */
        onError(serviceName, errorType) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> ViewService::onError(${serviceName}, ${errorType})`);
            this.endView(this.UIRESULT_ERROR_VIEW, "ERROR_VIEW_SCRIPT");
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< ViewService::onError");
        }

        /**
         * A convenience function, which will re-read the viewkey templates and afterwards all other viewkeys.
         * It only calls {@link Wincor.UI.Service.ViewService#readViewKeyTemplates} and {@link Wincor.UI.Service.ViewService#readViewKeys} internally.
         *
         * @param {string} viewSetName     `Touch` or `Softkey`, used to determine the correct section.
         * @return {Promise}                See the return value of {@link Wincor.UI.Service.ViewService#readViewKeys}.
         */
        readViewSetConfiguration(viewSetName) {
            const self = this;

            return self.readViewKeyTemplates(viewSetName).then(() => {
                _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, `* ViewService::loadViewSet ready reading defaults of ${viewSetName}`);
                return self.readViewKeys(viewSetName);
            });
        }

        /**
         * ReInitializes the view in case of viewSet changes.
         *
         * @param {String} viewSetName      The view-set to be loaded
         * @param {boolean} immediately     If set to true, the current view will directly return 'UIRESULT_CANCEL_SW' after the new view-set has been loaded.
         *                                  If omitted or false, the current view gets only deactivated, but the change will take place with the next call of {@link Wincor.UI.Service.ViewService#display}.
         * @return {Promise}
         */
        loadViewSet(viewSetName, immediately) {
            //TODO loadViewSet can be guarded against parallel calls with the AsyncJobQueue. Imagine a Property change and a Start-Ada event at the same time...
            const self = this;
            // const configService = this.serviceProvider.ConfigService;
            this.loadingViewSet = true;
            return ext.Promises.promise(function(resolve, reject) {
                _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `> | VIEW ViewService::loadViewSet viewSetName=${viewSetName}, immediately=${immediately}`);
                const oldViewSetName = self.viewSetName;
                self.previousViewUrl = "";
                viewSetName = viewSetName !== "" ? viewSetName : self.initialViewSet; // use initial view set if viewSetName is empty. Set self.viewSetName only in case of success

                self.readViewSetConfiguration(viewSetName)
                    .then(function() {
                        _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, `* ViewService::loadViewSet ready reading viewkeys of ${viewSetName}`);
                        if(immediately) {
                            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, ". | VIEW ViewService::loadViewSet immediately restarting...");
                            self.registerForServiceEvent(
                                self.SERVICE_EVENTS.VIEW_ACTIVATED,
                                function() {
                                    window.setTimeout(() => {
                                        self.restarting = false;
                                        _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, ". | VIEW ViewService::loadViewSet navigating");
                                        //TODO: why do we endView on load of index?
                                        self.endView(self.UIRESULT_CANCEL_SW);
                                        window.localStorage.setItem("restartSPA", "false");
                                        resolve();
                                    }, 250);
                                },
                                self.DISPOSAL_TRIGGER_ONETIME
                            );
                            self.restarting = true;
                            window.localStorage.setItem("restartSPA", "true");
                            _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, `. | VIEW ViewService::loadViewSet immediately starting ${self.startURL}`);
                            const applModeContainer = jQuery("#applicationMode");
                            if(applModeContainer.length) {
                                jQuery("#applicationMode").fadeOut({
                                    duration: 600,
                                    easing: "easeOutQuart",
                                    complete: () => {
                                        self.startSPA(self.startURL); //load the new index.html of the new viewset
                                        self.loadingViewSet = false;
                                        self.viewSetName = viewSetName;
                                    }
                                });
                            } else {
                                self.startSPA(self.startURL); //load the new index.html of the new viewset
                                self.loadingViewSet = false;
                                self.viewSetName = viewSetName;
                            }
                        } else {
                            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, ". | VIEW ViewService::loadViewSet postponing restart");
                            self.isRestartOnNextDisplay = true; // postpone restart until next display is done
                            self.loadingViewSet = false;
                            self.viewSetName = viewSetName;
                            resolve();
                        }
                    })
                    .catch(e => {
                        self.serviceProvider.propagateError(self.NAME, "loadViewSet", e);
                        if(oldViewSetName !== viewSetName) {
                            //will avoid endless recursion if the reload will also fail
                            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `* ViewService::loadViewSet failed to load '${viewSetName}', trying noww to reload '${oldViewSetName}'`);
                            self.loadViewSet(oldViewSetName, true)
                                .then(() => {
                                    _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `* ViewService::loadViewSet successfully re-loaded '${oldViewSetName}'`);
                                    self.loadingViewSet = false;
                                    reject("Had to re-load '${oldViewSetName}'");
                                })
                                .catch(() => {
                                    _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `* ViewService::loadViewSet failed to re-load '${oldViewSetName}'`);
                                    self.loadingViewSet = false;
                                    reject("Unable to re-load '${oldViewSetName}'");
                                });
                        } else {
                            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `* ViewService::loadViewSet rejected, no re-load, because oldViewSetname equals.`);
                            self.loadingViewSet = false;
                            reject(e);
                        }
                    });

                _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, "< | VIEW ViewService::loadViewSet");
            });
        }
    };
};

/**
 * The ViewService class provides methods for view handling and events of the view's lifecycle.
 *
 * @function getServiceClass
 * @param {Wincor} Wincor
 * @param {jQuery} jQuery
 * @param {ext} ext
 * @param {LogProvider} LogProvider
 * @param {PTService} PTService
 * @returns {Wincor.UI.Service.ViewService}
 * @class
 * @since 1.0/00
 */
export default getServiceClass;
