/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ wn.UI.Service.LocalizeService.js 4.3.1-210203-21-1b8704b6-1a04bc7d
 */

/**
 * @module
 */
const getServiceClass = ({ Wincor, ext, LogProvider, PTService }) => {

    /**
     *
     * @type {Wincor.UI.Diagnostics.LogProvider|*|Wincor.UI.Diagnostics.LogProvider|*}
     * @private
     */
    const _logger = LogProvider;

    const META_UTF8 = "PARLIST_UTF8";
    const META_ANSI = "PARLIST_ANSI";
    const META_CHAR_ANSI = "CHAR_ANSI";
    const BUFFER_LEN_UTF8 = 16000;
    const BUFFER_LEN_ANSI = 4000;
    const MAX_LEN_REQUESTED_KEYS = 262144; // 256KB
    const MAX_COUNT_REQUESTED_KEYS = 2048;
    
    
    return class LocalizeService extends PTService {

        /**
         * The logical name of this service as used in the {@link Wincor.UI.Service.Provider}.
         * @default LocalizeService
         * @const
         * @type {string}
         */
        NAME = "LocalizeService";

        /**
         * Structure containing the registered translation keys
         * @class
         */
        TranslateRegistration = function() {
            /**
             * The registered translation keys.
             * @type {Array<string>}
             */
            this.keys = [];         //the registered translationKeys

            /**
             * A callback function which is called when a LANGUAGE_CHANGED event is triggered, see {@link Wincor.UI.Service.LocalizeService#SERVICE_EVENTS}.
             * @type {function}
             */
            this.callback = null;   //this callback is called when the languageChanged event is triggered

            /**
             * Ordinary texts should be auto updated (true) on LANGUAGE_CHANGED
             * events triggered by the business logic, see {@link Wincor.UI.Service.LocalizeService#SERVICE_EVENTS}.
             * @type {boolean}
             */
            this.autoUpdate = true; // ordinary texts should be auto updated on LanguageChanged events from BL
        };

        /**
         * Array containing elements of {@link Wincor.UI.Service.LocalizeService#TranslateRegistration}.
         * @type {Array}
         */
        translationArray = []; // [TranslateRegistration1, TranslateRegistration2, ... ]

        /**
         * The service events for the LocalizeService
         * @enum {string}
         */
        SERVICE_EVENTS = {
            /**
             * Fired when the language has been changed.
             * @event  Wincor.UI.Service.LocalizeService#SERVICE_EVENTS:LANGUAGE_CHANGED
             * @eventtype service
             */
            LANGUAGE_CHANGED: "LANGUAGE_CHANGED"
        };

        /**
         * The current presented ISO language.
         * @default en-US
         * @type {string}
         */
        currentLanguage = "";

        /**
         * The language map.
         * @example
         * this.languages = {
         *    isoToName: {},
         *    nameToIso: {}
         * };
         * @type {*}
         */
        languages = {};

        /**
         * Initializes the member of this class.
         * @lifecycle service
         * @see {@link Wincor.UI.Service.PTService#constructor}.
         */
        constructor(...args) {
            super(...args);
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> LocalizeService::LocalizeService");
            this.FRM_RESOLVE_REQUEST.service = this.NAME;
            this.currentLanguage = "en-US"; // will become the ISO code
            this.languages = {
                isoToName: {},
                nameToIso: {},
                defaultLanguage: "" // will become the ISO code
            };
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< LocalizeService::LocalizeService");
        }
        
        /**
         * Called automatically as soon as there is an answer to an asynchronous ProTopas request. See {@link Wincor.UI.Service.BaseService#translateResponse}.
         * The response will be translated to the result expected by the requester.
         *
         * @param {object} message    Response object, see {@link Wincor.UI.Service.BaseService#translateResponse}.
         * @returns {*}               Depends on function
         */
        translateResponse(message) {
            let ret;
            try {
                _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> LocalizeService::translateResponse('${JSON.stringify(message)}')`);

                if (message.methodName === this.METHOD_FRM_RESOLVE) {
                    if (message.FWName === "CCDialog" && message.FWFuncID === 550 && message.RC === 0) { //getText
                        /*
                        message.param1 has the keys,   i.e. [key1,   key2, ...]
                        message.param2 has the values, i.e. [value1, value2, ...]
                        message.param3 has the RCs, i.e. [RC1, RC2, ...]

                        getKeysResponse will be an object:
                        getKeysResponse[key1] = value1
                        getKeysResponse[key2] = value2
                        ...
                        */
                        let response = {}, key;
                        for (let i in message.param1) {
                            if (message.param1.hasOwnProperty(i)) {
                                key = message.param1[i].toString();
                                response[key] = null;
                                //check if RC == OK then put value in map
                                if (message.param3[i].toString() === "0") {
                                    response[key] = message.param2[i];
                                }
                            }
                        }
                        ret = response;
                    } else if (message.FWName === "CCDialog" && message.FWFuncID === 6 && message.RC === 0) { //setLanguage
                        ret = message.RC;
                    } else {
                        _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `. LocalizeService::onResponse message from '${message.FWName}' with FWFuncID '${message.FWFuncID}' and RC = '${message.RC}' will not be evaluated.`);
                    }
                }
                _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `< LocalizeService::onResponse returns: ${JSON.stringify(ret)}`);
            } catch (e) {
                // Provider writes error-log
                Wincor.UI.Service.Provider.propagateError(this.NAME, this.ERROR_TYPE.RESPONSE, e);
            }
            return ret;
        }

        /**
         * This delegate is called when the language has been changed.
         * The information will be received from the GatewayService.
         * @param {string} languageHex
         */
        onLanguageChanged(languageHex) {
            //toUpperCase, because the event of CCDialog will send the language exactly as it retrieved it in it's setting functionality
            //This means, if someone calls BAS_SET_LANGUAGE("gerMan"), this will be routed (unchanged) to CCDialog, which will trigger the event with also with an unchanged 'gerMan'
            const langName = Wincor.ConvHexToStr(languageHex).toUpperCase();
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> LocalizeService::onLanguageChanged(${langName})`);

            let newLanguage = this.languages.nameToIso[langName];

            if (newLanguage) {
                this.currentLanguage = newLanguage;
                _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, `* LocalizeService::onLanguageChanged, mapped: ${this.currentLanguage}`);
                // The updateTexts() call maybe unwanted, which is possible by configuring at a certain viewkey with {..., "config": {"autoUpdateOnLanguageChange": "false"}, ...}
                // E.g. 'TransactionEnd' -> "Thank you and have a nice day." is not desired that the currently shown text changes back to the default language when its e.g. currently
                // displayed in chinese while the view is presented.
                // Usually the OP does switch to the default language at this point of end of transaction.
                let config = this.serviceProvider.ViewService.viewContext.viewConfig.config;
                if(!config || config.autoUpdateOnLanguageChange === void 0 || this.convertToBoolean(config.autoUpdateOnLanguageChange)) {
                    this.updateTexts().then(() => {
                        this.fireServiceEvent(this.SERVICE_EVENTS.LANGUAGE_CHANGED, this.currentLanguage);
                    });
                } else {
                    this.fireServiceEvent(this.SERVICE_EVENTS.LANGUAGE_CHANGED, this.currentLanguage);
                }
            } else {
                _logger.error(`LocalizeService::onLanguageChanged, Unknown language '${newLanguage}' received. SERVICE_EVENTS.LANGUAGE_CHANGED is not broadcasted, texts will not be updated.`);
            }

            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< LocalizeService::onLanguageChanged");
        }

        /**
         * Updates the text keys currently stored in the translation map.
         * Gets resolved when the text callbacks have been called with the updated texts
         * @async
         */
        async updateTexts() {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> LocalizeService::updateTexts()");
            const itemPromises = [];
            // Install a ready callback all elements with -autoUpdate=true.
            // We do this in order to signal readiness when really all texts have been updated, so that the caller can fire LANGUAGE_CHANGED
            // event which is way too early otherwise.
            for(let i = this.translationArray.length - 1; i >= 0; i--) {
                let trans = this.translationArray[i];
                if(trans.autoUpdate) {
                    itemPromises.push(ext.Promises.promise(resolve => {
                        const org = trans.callback;
                        trans.callback = value => {
                            org(value);
                            trans.callback = org;
                            resolve();
                        };
                    }));
                }
            }
            for(let i = this.translationArray.length - 1; i >= 0; i--) {
                let trans = this.translationArray[i];
                if(trans.autoUpdate) {
                    //do not call getText, because this is not a 'new' request from the outside where we would
                    //have to add sth. to the translationArray -- instead it's just an update!
                    this.sendProtopasTranslateMessage(trans.keys, trans.callback);
                }
            }
            await ext.Promises.Promise.all(itemPromises);
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< LocalizeService::updateTexts()");
        }

        /**
         * Get the values of the requested translation keys stored in the registry.
         * @param {Array<String> | String} keys the text key(s)
         * @param {function=} callback Callback(result)
         * @param {boolean=} [autoUpdate=true] autoUpdate default is true, for texts that should not be updated automatically on languageChanged events, set this parameter to false
         * @param {function=} [disposeFn=null] disposeFn dispose function to be called when {@link Wincor.UI.Service.LocalizeService#cleanTranslationTexts} is invoked with an false argument
         */
        getText(keys, callback, autoUpdate = true, disposeFn = null) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> LocalizeService::getText(${keys})`);
            //BEGIN: check input parameters
            keys = Array.isArray(keys) ? keys : [keys];
            let uniqueKeys = [];
            let errorMessage;
            const len = keys.length;
            let overallLen = 0;
            for(let i = 0; i < len; ++i) { // must use forward loop, because of order of the keys (e.g. ProFlex4Op)
                let key = keys[i];
                if(key !== void 0 && key !== null) { //do NOT use '!keys[i]' because empty string is okay, 0 is okay
                    if(!uniqueKeys.includes(key)) {
                        uniqueKeys.push(key);
                        overallLen += key.length;
                    } else {
                        _logger.error(`Warning: LocalizeService::getText() double key detected: ${key}`);
                    }
                } else {
                    errorMessage = "LocalizeService::getText() keys contains null or undefined.";
                    break;
                }
            }
            // check for potential argument error
            if(overallLen > MAX_LEN_REQUESTED_KEYS || uniqueKeys.length > MAX_COUNT_REQUESTED_KEYS) {
                errorMessage = `LocalizeService::getText() too many or too long text keys argument requested. Please check your keys array argument. Number of keys requested: ${uniqueKeys.length}, string len: ${overallLen}`;
            }
    
            keys = uniqueKeys;

            if(errorMessage) {
                _logger.error(errorMessage);
                callback && callback({}); //call callback with empty object
                Wincor.UI.Service.Provider.propagateError("LocalizeService::getText", this.ERROR_TYPE.REQUEST);
                return;
            }
            //END: check input parameters

            //build a new TranslateRegistration object and add it to our Array

            let transReg = new this.TranslateRegistration();
            if(disposeFn) {
                transReg.disposeFn = disposeFn;
            }
            transReg.keys = keys;
            transReg.callback = callback;
            transReg.autoUpdate = autoUpdate;

            this.translationArray.push(transReg);

            //now do the ProTopas stuff
            this.sendProtopasTranslateMessage(keys, callback);
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< LocalizeService::getText");
        }

        /**
         * Send the requested translation keys to the PTService and get the translations back.
         * @param {Array<string>} keyArray
         * @param {function} callback Callback(result)
         */
        sendProtopasTranslateMessage(keyArray, callback) {
            this.FRM_RESOLVE_REQUEST.FWName = "CCDialog";
            this.FRM_RESOLVE_REQUEST.FWFuncID = 550;
            this.FRM_RESOLVE_REQUEST.param1 = keyArray;
            this.FRM_RESOLVE_REQUEST.meta1 = [META_ANSI, -1];
            this.FRM_RESOLVE_REQUEST.param2 = [];
            this.FRM_RESOLVE_REQUEST.meta2 = [META_UTF8, BUFFER_LEN_UTF8];
            this.FRM_RESOLVE_REQUEST.param3 = [];
            this.FRM_RESOLVE_REQUEST.meta3 = [META_ANSI, BUFFER_LEN_ANSI];
            this.FRM_RESOLVE_REQUEST.ViewKey = this.serviceProvider.ViewService.viewContext.viewKey;

            this.FrmResolve(this.FRM_RESOLVE_REQUEST, callback);
        }

        /**
         * Get the currently set ISO language from the business logic
         * @param callback Callback(result)
         */
        getLanguage(callback) {

            function getLangCallback(response) {
                _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `* LocalizeService::getLanguage::getLangCallback(${response["VAR_LANGUAGE_S"]})`);
                const iso = this.languages.nameToIso[response["VAR_LANGUAGE_S"].toUpperCase()];
                _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `* LocalizeService::getLanguage::getLangCallback, mapped to ${iso}`);
                callback(iso);
            }
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> LocalizeService::getLanguage()");
            this.serviceProvider.DataService.getValues(["VAR_LANGUAGE_S"], getLangCallback.bind(this), null);

            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< LocalizeService::getLanguage");
        }

        /**
         * Set the language.
         * @param {string} lang Language in ISO compatible "xx-YY" notation
         * @param callback Callback(result), which tells that setting the language was executed in the business logic. It does not mean, that the language was really changed.
         */
        setLanguage(lang, callback) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> LocalizeService::setLanguage(${lang})`);
            // TODO in a future major version of UI we don't need the lang name anymore, because TAFW processes ISO codes directly,
            // but due to backward compatibility we have to set the lang name for the time being.
            const langName = this.languages.isoToName[lang];
            _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, "* LocalizeService::setLanguage, mapped: " + langName);
            if (!langName) {
                _logger.error(`LocalizeService::setLanguage called with unknown language '${lang}'`);
                return;
            }
            const dataService = this.serviceProvider.DataService;
            const key = "PROP_LANGUAGE_SET_MANUALLY";
            dataService.setValues(key, "0") // set the property to 0 first, then call the BAS lang change, afterwards set property to 1 again.
                .then(() => {
                    this.FRM_RESOLVE_REQUEST.FWName = "CCTransactionFW";
                    this.FRM_RESOLVE_REQUEST.FWFuncID = 8; //PROCESS_STEP
                    this.FRM_RESOLVE_REQUEST.param1 = " ".repeat(32); //32 spaces due to some old downward-compatibility issues with CCScriptFW
                    this.FRM_RESOLVE_REQUEST.meta1 = [META_CHAR_ANSI, -1];
                    this.FRM_RESOLVE_REQUEST.param2 = "BAS_CHANGE_LANGUAGE";
                    this.FRM_RESOLVE_REQUEST.meta2 = [META_CHAR_ANSI, -1];
                    this.FRM_RESOLVE_REQUEST.param3 = langName;
                    this.FRM_RESOLVE_REQUEST.meta3 = [META_CHAR_ANSI, -1];
                    this.FrmResolve(this.FRM_RESOLVE_REQUEST, rc => {
                        dataService.setValues(key, "1").then(() => {
                            callback(rc);
                            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< LocalizeService::setLanguage");
                        });
                    });
                });
        }

        /**
         * Returns all installed languages as an array of ISO Codes
         * @returns {Array<string>} an Array of ISO codes, e.g. [en-US, de-DE]
         */
        getInstalledLanguages() {
            return Object.keys(this.languages.isoToName);
        }

        /**
         * INTERNAL USE ONLY! Only used by FormatService, can be dropped at any time!
         * @returns {Object}
         */
        getLanguageMapping() {
            return this.languages;
        }
    
        /**
         * Clear values for all requested translation keys contained by the translationArray.
         * @param {boolean=} [cleanAll=true] cleanAll true, all registrations will be cleaned, false means only registrations which contains a dispose function will be cleaned
         */
        cleanTranslationTexts(cleanAll = true) {
            for(let i = this.translationArray.length - 1; i >= 0; i--) {
                let reg = this.translationArray[i];
                if(cleanAll || reg.disposeFn) {
                    reg.keys = null;
                    reg.callback = null;
                    if(reg.disposeFn) {
                        reg.disposeFn();
                        reg.disposeFn = null;
                    }
                    this.translationArray.splice(i, 1);
                }
            }
            if(cleanAll) {
                this.translationArray.length = 0;
            }
        }
    
        /**
         * Registers for a language change event from the business logic and reads the language specific parameters from the configuration of
         * <i>Transaction\GENERAL\Language_Map"</i>.
         * @returns {Promise}
         * @lifecycle service
         * @see {@link Wincor.UI.Service.BaseService#onServicesReady}
         */
        onServicesReady() {
            return ext.Promises.promise(async resolve => {
                _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> LocalizeService::onServicesReady()");

                //register for the LanguageChanged event
                function registerCallback(message) {
                    _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `* LocalizeService::onServicesReady::registerCallback(): RC: ${message.RC}`);
                }

                this.serviceProvider.EventService.registerForEvent(1, 'CCDialog', this.onLanguageChanged.bind(this), registerCallback.bind(this), "HEX", true);
                this.serviceProvider.ViewService.registerForServiceEvent(this.serviceProvider.ViewService.SERVICE_EVENTS.VIEW_CLOSING, this.cleanTranslationTexts.bind(this), true);
                this.serviceProvider.ViewService.registerForServiceEvent(this.serviceProvider.ViewService.SERVICE_EVENTS.SHUTDOWN, this.cleanTranslationTexts.bind(this), true);

                //Get all currently installed languages and build a ISOCode- to LanguageName-Mapping
                //Our interface will only work with ISO-Code, but the Step BAS_CHANGE_LANGUAGE and the CCDialog-Event only know 'names' like German or English.
                //The properties CCTAFW_PROP_INSTALLED_LANGUAGES (Iso Codes) and CCTAFW_PROP_INSTALLED_LANGUAGES_NAMES (names) will not work to retrieve the installed
                //languages, because at this point in time (onServicesReady) the TransactionFW has not yet initialized its properties, so we have to scan the registry
    
                function convertRegistryMappingToInternalMapping(registryMapping) {
                    let internalMapping = {nameToIso: {}, isoToName: {}};

                    try {
                        let installedISOs = 0;
                        for (let langName in registryMapping) {
                            if (registryMapping.hasOwnProperty(langName)) {
                                if (langName === "InstalledLanguages") {
                                    installedISOs = registryMapping[langName].split(";").length; //TODO determine the count of configured ISOs and compared with the count of languages afterwards. This should match!
                                } else {
                                    langName = langName.toUpperCase();
                                    let isoCode = registryMapping[langName].split(";")[1];
                                    internalMapping.nameToIso[langName] = isoCode; //e.g. "GERMAN" = "de-DE"
                                    internalMapping.isoToName[isoCode] = langName;
                                }
                            }
                        }
                    } catch (e) {
                        internalMapping = null;
                        _logger.error(e);
                    }
                    return internalMapping;
                }

                try {
                    //langConf={
                    //    "InstalledLanguages":"de-DE;en-US",
                    //    "GERMAN":"01;de-DE",
                    //    "ENGLISH":"06;en-US"
                    //}
                    let langConf = await Wincor.UI.Service.Provider.ConfigService.getConfiguration("Transaction\\GENERAL\\Language_Map", null);
                    _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `* LocalizeService::onServicesReady, langConf=${JSON.stringify(langConf)}`);
                    this.languages = convertRegistryMappingToInternalMapping(langConf);
                    let defaultLangConf = await Wincor.UI.Service.Provider.ConfigService.getConfiguration("Activex\\GraphicalService\\PCView", null);
                    //if there is no 'DefaultLanguage' entry (or e.g. Tooling will not send anything), we will get an empty object {}
                    let defLang = defaultLangConf.DefaultLanguage ? defaultLangConf.DefaultLanguage : this.languages.isoToName[this.getInstalledLanguages()[0]]; // e.g. 'ENGLISH'
                    this.languages.defaultLanguage = this.languages.nameToIso[defLang.toUpperCase()];
                } catch(e) {
                    this.languages = {};
                }
                _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `* LocalizeService::onServicesReady languages: ${JSON.stringify(this.languages)}`);

                this.getLanguage(language => {
                    this.currentLanguage = language;
                    _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `* LocalizeService::onServicesReady getLanguageCallback: ${language}`);
                    super.onServicesReady().then(resolve);
                });
                _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< LocalizeService::onServicesReady");
            });
        }
    }
};

/**
 * The LocalizeService class provides text translations for stored registry keys depending on the language.
 *
 * @function getServiceClass
 * @param {Wincor} Wincor
 * @param {ext} ext
 * @param {LogProvider} LogProvider
 * @param {PTService} PTService
 * @returns {Wincor.UI.Service.LocalizeService}
 * @class
 * @since 1.0/00
 */
export default getServiceClass;
