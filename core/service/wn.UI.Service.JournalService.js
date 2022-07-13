/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany
 
 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.
 
 

$MOD$ wn.UI.Service.JournalService.js 4.3.1-210203-21-1b8704b6-1a04bc7d
 */

/**
 * @module
 */
const getServiceClass = ({ Wincor, jQuery, LogProvider, PTService }) => {
    /**
     *
     * @type {Wincor.UI.Diagnostics.LogProvider|*|Wincor.UI.Diagnostics.LogProvider|*}
     * @private
     */
    const _logger = LogProvider;

    return class JournalService extends PTService {
        /**
         * "JournalService" - the logical name of this service as used in the service-provider
         * @const
         * @type {string}
         */
        NAME = "JournalService";

        /**
         * Stores the configuration for the JournalService, currently only the journalOffset number, which depends on the current instance.
         * @type {object}
         * @example
         * "config": {"journalOffset": 0}
         */
        config = {};

        /**
         * Message number defines.
         * These defines are currently used by the ProFlex4 UI product. There is an offset of 50 to other UI instances, in which 20 messages of 4 UI instances are reserved.
         * The offsets are added automatically regarding the appropriate instance.
         * ```
         * GUIAPP (520000-520019)
         * GUIDM  (520050-520069)
         * GUISOP (520100-520119)
         * GUIxx  (520150-520169)
         * ```
         * For project specific journal messages please use 520000 with an offset of 30-49
         * @enum {number}
         */
        MSG_NUMBERS = {
            MSG_VIEW_DISPLAY: 520000,
            MSG_AJAX_REQUEST: 520001,
            MSG_BROWSER_VERSION: 520002,
            MSG_VIEW_ACTIVATED: 520003,
            MSG_VIEW_INTERACTION: 520010,
            MSG_VIEW_RESULT: 520011
        };

        /**
         * See {@link Wincor.UI.Service.PTService#constructor}.
         *
         * Initializes the config object, and the JournalService-specific FRM_RESOLVE_REQUEST parameters, so that the CCJournal module is used.
         *
         * @lifecycle service
         */
        constructor(...args) {
            super(...args);

            /**
             * The offset for the journal numbers, depending on the instance.
             * @example {{GUIAPP: 0, GUIDM: 50, GUISOP: 100}}
             * @type {{GUIAPP: number, GUIDM: number, GUISOP: number}}
             */
            this.journalOffsets = {
                GUIAPP: 0,
                GUIDM: 50,
                GUISOP: 100
            };

            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> JournalService::JournalService");

            this.FRM_RESOLVE_REQUEST.service = this.NAME;
            this.FRM_RESOLVE_REQUEST.FWName = "CCJournal";

            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< JournalService::JournalService");
        }
        
        /**
         * Called automatically as soon as there is an answer to an asynchronous ProTopas request. See {@link Wincor.UI.Service.BaseService#translateResponse}.
         *
         * For every request it returns only the return code as number.
         *
         * @param {object} message    Response object, see {@link Wincor.UI.Service.BaseService#translateResponse}.
         * @returns {Number}          The ProTopas return code of the request, typically 0 in case of success.
         */
        translateResponse(message) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> JournalService::translateResponse('${JSON.stringify(message)}')`);
            let ret;
            if (message.FWFuncID === 1) {
                //CCJOURNAL_FW_FUNC_WRITE_MSG_BY_NUMBER
                ret = message.RC;
            } else if (message.FWFuncID === 9) {
                //CCJOURNAL_FW_FUNC_WRITE_MSG_BY_NUMBER_WITH_ARGS
                ret = message.RC;
            } else {
                _logger.error("Wincor.UI.Service.JournalService(onResponse): unknown function");
            }
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `< JournalService::translateResponse returns ${ret}`);
            return ret;
        }

        /**
         * Write a journal entry.
         * @param {number} messageID number, ID of journal message
         * @param {function} callback reference to a function receiving the return code as a parameter
         * @param {*=} [arguments] optional arguments for journal message
         * @example
         * // use of CCJOURNAL_FW_FUNC_WRITE_MSG_BY_NUMBER method of CCJournal framework
         * // uses ProFlex4/Op registry config:
         * //   [HKEY_LOCAL_MACHINE\SOFTWARE\Wincor Nixdorf\ProTopas\CurrentVersion\JOURNAL\TOPMSG]
         * //     "MSG1001"="=====================================================================================#NL#"
         * // output in *.jrn file:
         * //   =====================================================================================
         * write(1001);
         * @example
         * // use of CCJOURNAL_FW_FUNC_WRITE_MSG_BY_NUMBER_WITH_ARGS method of CCJournal framework
         * // uses ProFlex4/Op registry config:
         * //   [HKEY_LOCAL_MACHINE\SOFTWARE\Wincor Nixdorf\ProTopas\CurrentVersion\JOURNAL\TOPMSG]
         * //     "MSG1015"=" @005   @001 <Application> Application state is: #1# (#2#)  #3# #NL#"
         * // output in *.jrn file:
         * //    13:45:12   1015 <Application> Application state is: 111 (222)  333
         * write(1015, null, 111, 222, "333");
         */
        write(messageID, callback) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> JournalService::write(messageID:${messageID}+offset(${this.config.journalOffset}), ...)`);

            if (messageID) {
                messageID += this.config.journalOffset;
                // check for optional params
                _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, `. arguments.length: ${arguments.length}`);
                if (arguments.length < 3) {
                    this.FRM_RESOLVE_REQUEST.FWFuncID = 1; // CCJOURNAL_FW_FUNC_WRITE_MSG_BY_NUMBER
                    this.FRM_RESOLVE_REQUEST.param1 = messageID;
                    this.FRM_RESOLVE_REQUEST.meta1 = ["LONG", 0];
                    this.FRM_RESOLVE_REQUEST.param2 = "";
                    this.FRM_RESOLVE_REQUEST.meta2 = ["NULL", 0];
                    this.FRM_RESOLVE_REQUEST.param3 = "";
                    this.FRM_RESOLVE_REQUEST.meta3 = ["NULL", 0];
                    this.FRM_RESOLVE_REQUEST.paramUL = 0;

                    _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, `. request to send: '${JSON.stringify(this.FRM_RESOLVE_REQUEST)}'.`);
                    this.FrmResolve(this.FRM_RESOLVE_REQUEST, callback);
                } else {
                    // put all additional params in one string, separator '\0', terminator '\00'
                    let strMessage = "";
                    for (let i = 2; i < arguments.length; i++) {
                        strMessage += arguments[i];
                        strMessage += String.fromCharCode(0);
                    }
                    let sMessageLen = strMessage.length * 2; // sizeof(WCHAR) = 2!
                    _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, `. message strings length: ${sMessageLen}`);
                    strMessage += String.fromCharCode(0);

                    // this doesn't works ... TrcWritef() cut at first \u0000
                    // output >>>. message strings: '111<<<
                    //_logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, ". message strings: '" + strMessage + "'.");
                    // put the string in an object and the stringify() does the job!
                    // output example >>>. {"message strings":"111\u0000222\u0000333\u0000\u0000"}.<<<
                    _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, `. ${JSON.stringify({ "message strings": strMessage })}.`);

                    //send it
                    this.FRM_RESOLVE_REQUEST.FWFuncID = 9; // CCJOURNAL_FW_FUNC_WRITE_MSG_BY_NUMBER_WITH_ARGS
                    this.FRM_RESOLVE_REQUEST.param1 = messageID;
                    this.FRM_RESOLVE_REQUEST.meta1 = ["LONG", 0];
                    this.FRM_RESOLVE_REQUEST.param2 = sMessageLen;
                    this.FRM_RESOLVE_REQUEST.meta2 = ["SHORT", 0];
                    this.FRM_RESOLVE_REQUEST.param3 = strMessage;
                    this.FRM_RESOLVE_REQUEST.meta3 = ["WCHAR", -1];
                    this.FRM_RESOLVE_REQUEST.paramUL = 1;

                    _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, `. request to send: '${JSON.stringify(this.FRM_RESOLVE_REQUEST)}'.`);
                    this.FrmResolve(this.FRM_RESOLVE_REQUEST, callback);
                }
            } else {
                // if user wants callback ...
                if (callback) {
                    // emulate CCJournalFW return code for this case!
                    callback(1); // CCJOURNAL_FW_ERROR
                }
            }

            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< JournalService::write");
        }

        /**
         * See {@link Wincor.UI.Service.BaseService#onServicesReady}.
         *
         * Reads the configuration from the registry section "\\Services\\JournalService".
         * Registers to various service events (see {@link Wincor.UI.Service.ViewService#SERVICE_EVENTS} to be able to write journal message at the appropriate time.
         *
         * @async
         * @lifecycle service
         */
        async onServicesReady() {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> JournalService::onServicesReady()");

            const configService = Wincor.UI.Service.Provider.ConfigService;
            const instanceName = configService.configuration.instanceName;
            let config = await configService.getConfiguration(instanceName + "\\Services\\JournalService", null);
            _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, `* JournalService::configCallback(${JSON.stringify(config)})`);

            this.config.journalOffset = this.journalOffsets[instanceName];
            this.config = jQuery.extend(true, this.config, config); //...and extend our config with missing default config parameters

            _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, `* JournalService::configCallback, config=${JSON.stringify(this.config)}`);

            const viewService = this.serviceProvider.ViewService;

            //persistantly register on NAVIGATE_SPA to write logs
            viewService.registerForServiceEvent(
                viewService.SERVICE_EVENTS.NAVIGATE_SPA,
                data => {
                    _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, `* JournalService::callback(), SPA data=${JSON.stringify(data)}`);
                    let journalData = jQuery.extend(true, { viewId: viewService.viewContext.viewID }, data);
                    this.write(this.MSG_NUMBERS.MSG_VIEW_DISPLAY, null, JSON.stringify(journalData), journalData.viewId, journalData.viewKey);
                },
                true
            );

            //persistantly register on VIEW_ACTIVATED to write logs (here customers can refer to UI properties within the journal messages)
            viewService.registerForServiceEvent(
                viewService.SERVICE_EVENTS.VIEW_ACTIVATED,
                () => {
                    // welcome fragment activates without viewkey
                    if (viewService.viewContext.viewKey) {
                        let journalData = {
                            viewId: viewService.viewContext.viewID,
                            viewKey: viewService.viewContext.viewKey,
                            url: viewService.viewContext.viewURL
                        };
                        this.write(this.MSG_NUMBERS.MSG_VIEW_ACTIVATED, null, JSON.stringify(journalData), journalData.viewId, journalData.viewKey);
                    }
                },
                true
            );

            //persistently register on VIEW_CLOSING to write logs
            viewService.registerForServiceEvent(
                viewService.SERVICE_EVENTS.VIEW_CLOSING,
                d => {
                    let privateInput = viewService.viewContext.viewConfig.privateInput;
                    _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, `* JournalService::callback(), SPA data=${JSON.stringify(d)}`);
                    let data = Object.assign({}, d);
                    if (privateInput) {
                        data.resultDetail = "*";
                    }
                    this.write(this.MSG_NUMBERS.MSG_VIEW_RESULT, null, JSON.stringify(data), data.viewId, data.viewKey, data.resultCode, data.resultDetail);
                },
                true
            );

            //register for the first(!) VIEW_ACTIVATED (i.e. DISPOSAL_TRIGGER_ONETIME) just to register for the ajaxComplete event.
            //We can not directly register ajaxComplete here in onServicesReady, because that is too early and will not work, most likely because
            //jQuery is not a member of the contentDocoument at that point in time, because contentDocument is not yet loaded.
            let regId = viewService.registerForServiceEvent(
                viewService.SERVICE_EVENTS.VIEW_ACTIVATED,
                data => {
                    let activeFrameName = window.localStorage.getItem("activeFrameName");
                    if (activeFrameName) {
                        let iframeDocument = document.getElementById(activeFrameName).contentDocument;
                        let iframeWindow = document.getElementById(activeFrameName).contentWindow;
                        _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, `* JournalService::callback2(), activeFrameName=${activeFrameName}, SPA data=${JSON.stringify(data)}`);
                        // Note:
                        // The content window's jQuery object is not the same as the required one, the required belongs to the services document whereas the
                        // second one belongs to the window of the content frame and there we want to get informed on AJAX completions.
                        if (typeof iframeWindow.jQuery === "function") {
                            try {
                                iframeWindow.jQuery(iframeDocument).ajaxComplete((event, jqXHR, ajaxOptions) => {
                                    let journalMessage = {
                                        url: ajaxOptions.url,
                                        statusText: jqXHR.statusText
                                    };
                                    _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, `* JournalService::onAjaxComplete() ${JSON.stringify(journalMessage)}`);

                                    this.write(this.MSG_NUMBERS.MSG_AJAX_REQUEST, null, JSON.stringify(journalMessage), viewService.viewContext.viewID, viewService.viewContext.viewKey);
                                });
                                viewService.deregisterFromServiceEvent(regId);
                            } catch (e) {
                                this.logger.log(this.logger.LOG_SRVC_DATA, `* JournalService::onAjaxComplete couldn't register ${e.message}`);
                            }
                        }
                    }
                },
                true
            ); // register persistent, deregister manually

            await super.onServicesReady();

            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< JournalService::onServicesReady");
        }
    }
};

/**
 * The class JournalService has a collection of routines to support journaling.
 *
 * @function getServiceClass
 * @param {Wincor} Wincor
 * @param {LogProvider} LogProvider
 * @param {PTService} PTService
 * @returns {Wincor.UI.Service.JournalService}
 * @class
 */
export default getServiceClass;
