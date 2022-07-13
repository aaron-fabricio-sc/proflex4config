/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ wn.UI.Service.LocalizeServiceMock.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

/**
 * @module
 */
const getServiceClass = ({ Wincor, BaseService, LogProvider }) => {

    /**
     *
     * @type {Wincor.UI.Diagnostics.LogProvider|*|Wincor.UI.Diagnostics.LogProvider|*}
     * @const
     * @private
     */
    const _logger = LogProvider;
    

    let _localizeText;
    let _businessData;

    // default configuration of 'Transaction\\GENERAL\\Language_Map' registry section. Is currently not configured by Tooling for the json files.
    // will be overwritten during mock setup by reading the file of FILE_NAME_LANGUAGE_MAPPINGS
    let _langConf = {
        "InstalledLanguages": "de-DE;en-US",
        "German": "01;de-DE",
        "English": "06;en-US"
    };

    const LANG_GENERAL = "General";
    
    const MAX_LEN_REQUESTED_KEYS = 262144; // 256KB
    const MAX_COUNT_REQUESTED_KEYS = 2048;
    
    
    function replaceViewKeyInString(value, replaceWith) {
        value = value.split("_");
        value[1] = replaceWith; // is the GUI key
        return value.join("_");
    }

    function resolveKey(value, missingDataKeys) {
        // var regExp = "\\[%WX_TEXT\\[(.+?)\\];(.*?)%\\]";
        value = this.propResolver(value, _businessData, missingDataKeys);
        value = this.wxtKeyResolver(value, _localizeText, _businessData, missingDataKeys);
        return value;
    }

    return class LocalizeServiceMock extends BaseService {

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
         * Array containing elements of {@link Wincor.UI.Service.LocalizeServiceMock#TranslateRegistration}.
         * @type {Array}
         */
        translationArray = []; // [TranslateRegistration1, TranslateRegistration2, ... ]

        /**
         * The current language as ISO code xx-XX, e.g.: en-US.
         * @type {String}
         */
        currentLanguage = "";

        /**
         * The language to ISO map.
         * @type {Object}
         */
        languageMap = {};

        languageSpecifications = {};

        /**
         * The service events for the LocalizeServiceMock
         * @enum {string}
         */
        SERVICE_EVENTS = {
            /**
             * Fired when the language has been changed.
             * @event  Wincor.UI.Service.LocalizeServiceMock#SERVICE_EVENTS:LANGUAGE_CHANGED
             * @eventtype service
             */
            LANGUAGE_CHANGED: "LANGUAGE_CHANGED"
        };
    
        /**
         * This event is sent if there are missing text keys.
         * @type {Object}
         * @eventtype native
         * @event  Wincor.UI.Service.LocalizeServiceMock#EVENT_MISSING_TEXT_KEYS
         */
        EVENT_MISSING_TEXT_KEYS = null;
    
        /**
         * This event is sent if there are missing data keys.
         * Data keys are often part of WX text keys and thus being resolved as well.
         * @type {Object}
         * @eventtype native
         * @event  Wincor.UI.Service.LocalizeServiceMock#EVENT_MISSING_DATA_KEYS
         */
        EVENT_MISSING_DATA_KEYS = null;
    
        /**
         * This event is sent the loaded text keys.
         * @type {Object}
         * @eventtype native
         * @event  Wincor.UI.Service.LocalizeServiceMock#EVENT_LOADED_TEXT_KEYS
         */
        EVENT_LOADED_TEXT_KEYS = null;
    
        /**
         * Initializes the member of this class.
         * @lifecycle service
         * @see {@link Wincor.UI.Service.BaseServiceMock#constructor}.
         */
        constructor(...args) {
            super(...args);
            _logger.log(_logger.LOG_SRVC_INOUT, "> LocalizeServiceMock::LocalizeServiceMock");

            this.currentLanguage = "en-US";
            this.currentLanguageName = "English";
            this.languageMap = {
                isoToName: {},
                nameToIso: {},
                defaultLanguage: this.currentLanguage // becomes the ISO code
            };
    
            this.EVENT_MISSING_TEXT_KEYS = Object.assign(Object.assign({}, this.EVENT), {
                service: this.NAME,
                viewID: -1,
                viewKey: null,
                eventName: "MissingTextKeys",
                keys: [],
            });
    
            this.EVENT_MISSING_DATA_KEYS = Object.assign(Object.assign({}, this.EVENT), {
                service: this.NAME,
                viewID: -1,
                viewKey: null,
                eventName: "MissingDataKeys",
                keys: [],
            });
    
            this.EVENT_LOADED_TEXT_KEYS = Object.assign(Object.assign({}, this.EVENT), {
                service: this.NAME,
                viewID: -1,
                viewKey: null,
                eventName: "LoadedTextKeys",
                keys: [],
            });
    
            _logger.log(_logger.LOG_SRVC_INOUT, "< LocalizeServiceMock::LocalizeServiceMock");
        }
        
        /**
         * This method is called by the {@link Wincor.UI.Service.Provider#propagateError} if an error occurred in any service. It logs the error to the console.
         *
         *
         * @param {String} serviceName  The name of this service.
         * @param {String} errorType    As defined in {@link Wincor.UI.Service.BaseService#ERROR_TYPE}.
         */
        onError(serviceName, errorType) {
            _logger.log(_logger.LOG_SRVC_INOUT, `> LocalizeServiceMock::onError(${serviceName}, ${errorType})`);
            _logger.log(_logger.LOG_SRVC_INOUT, "< LocalizeServiceMock::onError");
        }

        /**
         * Updates the text keys currently stored in the translation map.
         * @return {Promise<void>} gets resolved when the text callbacks have been called with the updated texts
         * @async
         */
        async updateTexts() {
            _logger.log(_logger.LOG_SRVC_INOUT, "> LocalizeServiceMock::updateTexts()");

            const itemPromises = [];
            // Install a ready callback all elements with -autoUpdate=true.
            // We do this in order to signal readiness when really all texts have been updated, so that the caller can fire LANGUAGE_CHANGED
            // event which is way too early otherwise.
            for(let i = this.translationArray.length - 1; i >= 0; i--) {
                let trans = this.translationArray[i];
                if(trans.autoUpdate) {
                    itemPromises.push(new Promise(resolve => {
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
                    this.processText(trans.keys, trans.callback);
                }
            }
            await Promise.all(itemPromises);
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< LocalizeService::updateTexts()");
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
         * Get the values of the requested translation keys stored in the localizeText object.
         * @param {Array<string> | string} keys the text keys
         * @param {function} callback Callback(result)
         * @param {boolean=} [autoUpdate=true] autoUpdate default is true, for texts that should not be updated automatically on languageChanged events, set this parameter to false
         * @param {function=} [disposeFn=null] disposeFn dispose function to be called when {@link Wincor.UI.Service.LocalizeServiceMock#cleanTranslationTexts} is invoked with an false argument
         */
        getText(keys, callback, autoUpdate = true, disposeFn = null) {
            _logger.log(_logger.LOG_SRVC_INOUT, `> LocalizeServiceMock::getText(${keys})`);

            //BEGIN: check input parameters
            keys = Array.isArray(keys) ? keys : [keys];
            let uniqueKeys = [];
            let errorMessage, len = keys.length;
            let overallLen = 0;
            for(let i = 0; i < len; ++i) { // must use forward loop, because of order of the keys (e.g. ProFlex4Op)
                let key = keys[i];
                if(key !== void 0 && key !== null) { //do NOT use '!keys[i]' because empty string is okay, 0 is okay
                    if(!uniqueKeys.includes(key)) {
                        uniqueKeys.push(key);
                        overallLen += key.length;
                    } else {
                        _logger.error(`Warning: LocalizeServiceMock::getText() double key detected: ${key}`);
                    }
                } else {
                    errorMessage = "LocalizeServiceMock::getText(): keys contains null or undefined.";
                    break;
                }
            }
    
            // check for potential argument error
            if(overallLen > MAX_LEN_REQUESTED_KEYS || uniqueKeys.length > MAX_COUNT_REQUESTED_KEYS) {
                errorMessage = `LocalizeServiceMock::getText() too many or too long text keys argument requested. Please check your keys array argument. Number of keys requested: ${uniqueKeys.length}, string len: ${overallLen}`;
            }
    
            keys = uniqueKeys;

            if(errorMessage) {
                _logger.error(errorMessage);
                callback({}); //call callback with empty object
                Wincor.UI.Service.Provider.propagateError("LocalizeServiceMock::getText", this.ERROR_TYPE.REQUEST);
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
            this.processText(keys, callback);
            _logger.log(_logger.LOG_SRVC_INOUT, "< LocalizeServiceMock::getText");
        }

        /**
         * Process the text values of the requested translation keys stored in the localizeText object.
         * @param {Array<string>} keyArray the text keys
         * @param {function} callback Callback(result)
         */
        processText(keyArray, callback) {
            _logger.log(_logger.LOG_SRVC_INOUT, `> LocalizeServiceMock::processText(${keyArray})`);
    
            function sendMessageMissingKeys(missingKeys) {
                if (missingKeys.length > 0) {
                    const ctx = Wincor.UI.Service.Provider.ViewService.viewContext;
                    this.EVENT_MISSING_TEXT_KEYS.viewID = ctx.viewID;
                    this.EVENT_MISSING_TEXT_KEYS.viewKey = ctx.viewKey;
                    if(ctx.viewKeyRedirect) {
                        this.EVENT_MISSING_TEXT_KEYS.viewKey = ctx.redirectFrom;
                        this.EVENT_MISSING_TEXT_KEYS.redirectedToViewKey = ctx.redirectTo;
                    } else {
                        delete this.EVENT_MISSING_TEXT_KEYS.redirectedToViewKey;
                    }
                    this.EVENT_MISSING_TEXT_KEYS.keys = missingKeys;
                    this.sendEvent(this.EVENT_MISSING_TEXT_KEYS);
                }
            }
    
            function sendMessageMissingDataKeys(missingKeys) {
                if(missingKeys.length > 0) {
                    const ctx = Wincor.UI.Service.Provider.ViewService.viewContext;
                    this.EVENT_MISSING_DATA_KEYS.viewID = ctx.viewID;
                    this.EVENT_MISSING_DATA_KEYS.viewKey = ctx.viewKey;
                    if(ctx.viewKeyRedirect) {
                        this.EVENT_MISSING_DATA_KEYS.viewKey = ctx.redirectFrom; // overwrite to satisfy tooling
                        this.EVENT_MISSING_DATA_KEYS.redirectedToViewKey = ctx.redirectTo;
                    } else {
                        delete this.EVENT_MISSING_DATA_KEYS.redirectedToViewKey;
                    }
                    this.EVENT_MISSING_DATA_KEYS.keys = missingKeys;
                    this.sendEvent(this.EVENT_MISSING_DATA_KEYS);
                }
            }
    
            function sendMessageLoadedKeys(loadedKeys) {
                if(loadedKeys.length > 0) {
                    const ctx = Wincor.UI.Service.Provider.ViewService.viewContext;
                    this.EVENT_LOADED_TEXT_KEYS.viewID = ctx.viewID;
                    this.EVENT_LOADED_TEXT_KEYS.viewKey = ctx.viewKey;
                    if(ctx.viewKeyRedirect) {
                        this.EVENT_LOADED_TEXT_KEYS.viewKey = ctx.redirectFrom;
                        this.EVENT_LOADED_TEXT_KEYS.redirectedToViewKey = ctx.redirectTo;
                    } else {
                        delete this.EVENT_LOADED_TEXT_KEYS.redirectedToViewKey;
                    }
                    this.EVENT_LOADED_TEXT_KEYS.keys = loadedKeys;
                    this.sendEvent(this.EVENT_LOADED_TEXT_KEYS);
                }
            }
    
            function generateSpecificResponse() {
                let response = {};
                let missingKeys = [];
                let missingDataKeys = [];
                let loadedKeys = [];
                for(let i = keyArray.length - 1; i >= 0; i--) {
                    let key = keyArray[i];
                    let value = this.getTextValue(key, _localizeText);
                    if(value === -1) {
                        value = this.getTextValue(replaceViewKeyInString(key, "*"), _localizeText);
                        if(value === -1) {
                            Wincor.toolingEDM && !missingKeys.includes(key) && missingKeys.push(key);
                            value = null; // key isn't available in text config nor as default text (*), null is what in such a case must be set within the response
                        }
                    }
                    if(value) {
                        value = this.getTextFromObj(value);
                        value = resolveKey.call(this, value, missingDataKeys);
                        // work around for € sign when coming from registry export
                        if(value.indexOf("â‚¬") !== -1) {
                            value = "€";
                        }
                        Wincor.toolingEDM && loadedKeys.push(key);
                    }
                    response[key] = value;
                }
                if(Wincor.toolingEDM) {
                    sendMessageMissingKeys.call(this, missingKeys);
                    sendMessageMissingDataKeys.call(this, missingDataKeys);
                    sendMessageLoadedKeys.call(this, loadedKeys);
                }
                _logger.log(_logger.LOG_DATA, `. LocalizeServiceMock::processText response=${JSON.stringify(response)}`);
                return response;
            }

            setTimeout(() => callback(generateSpecificResponse.call(this)), this.responseTimeSimulation);
            _logger.log(_logger.LOG_SRVC_INOUT, "< LocalizeServiceMock::processText");
        }

        /**
         * Set the new ISO language.
         * @param {string} langISO Language in ISO compatible "xx-YY" notation
         * @param {function=} callback Callback(result) will be called to inform about the reception of this function.
         * A successful language change will be propagated by SERVICE_EVENTS.LANGUAGE_CHANGED
         */
        setLanguage(langISO, callback) {
            _logger.log(_logger.LOG_SRVC_INOUT, `> LocalizeServiceMock::setLanguage(${langISO})`);
            const langName = this.languageMap.isoToName[langISO];
            _logger.log(_logger.LOG_SRVC_DATA, `* LocalizeServiceMock::setLanguage, mapped: ${langName}`);

            if (!langName) {
                _logger.error(`LocalizeServiceMock::setLanguage called with unknown ISO language culture name '${langISO}'`);
                return;
            }

            if (callback) {
                if (langISO === this.currentLanguage) {
                    callback("-1");
                } else {
                    callback("0");
                }
            }

            if (langISO !== this.currentLanguage) {
                this.onLanguageChanged(langISO);
            }

            _logger.log(_logger.LOG_SRVC_INOUT, "< LocalizeServiceMock::setLanguage");
        }

        /**
         * This delegate is called when the language has been changed.
         * The information will be received from the GatewayService.
         * @param {string} newLanguageISO the new language ISO code such as xx-XX, e.g. en-US
         */
        onLanguageChanged(newLanguageISO) {
            _logger.log(_logger.LOG_SRVC_INOUT, `> LocalizeServiceMock::onLanguageChanged(${newLanguageISO})`);

            this.currentLanguage = newLanguageISO;
            this.currentLanguageName = this.languageMap.isoToName[newLanguageISO];
            const viewService = this.serviceProvider.ViewService;
            if (viewService.viewContext && viewService.viewContext.viewConfig) { //during onServicesReady we already call setLanguage and get here. Then some members of the ViewService are null or undefined.
                let config = viewService.viewContext.viewConfig.config;
                // The updateTexts() call maybe unwanted, which is possible by configuring at a certain viewkey with {..., "config": {"autoUpdateOnLanguageChange": "false"}, ...}
                // E.g. 'TransactionEnd' -> "Thank you and have a nice day." is not desired that the currently shown text changes back to the default language when its e.g. currently
                // displayed in chinese while the view is presented.
                // Usually the OP does switch to the default language at this point of end of transaction.
                if (!config || config.autoUpdateOnLanguageChange === void 0 || this.convertToBoolean(config.autoUpdateOnLanguageChange)) {
                    this.updateTexts().then(() => {
                        this.fireServiceEvent(this.SERVICE_EVENTS.LANGUAGE_CHANGED, newLanguageISO); // fire when almost really ready with update of texts
                    });
                } else {
                    this.fireServiceEvent(this.SERVICE_EVENTS.LANGUAGE_CHANGED, newLanguageISO);
                }
            }
            _logger.log(_logger.LOG_SRVC_INOUT, "< LocalizeServiceMock::onLanguageChanged");
        }

        /**
         * INTERNAL USE ONLY! Only used by FormatService, can be dropped at any time!
         * @returns {Object}
         */
        getLanguageMapping() {
            return this.languageMap;
        }

        /**
         * Gets the language specifications.
         * @returns {Wincor.UI.Service.LocalizeServiceMock.languageSpecifications|{}}
         */
        getLanguageSpecifications() {
            return this.languageSpecifications;
        }

        /**
         * Get the used properties from the localize text.
         * The method does a static analyse of the text data to search for business properties.
         * @returns {Set} the used properties
         */
        getUsedProperties() {
            let extractedProps = [];
            let lang = this.languageMap.isoToName[this.currentLanguage];
            let keys = Object.keys(_localizeText), guiKey, text;
            for(let i = keys.length - 1; i >= 0; i--) {
                guiKey = keys[i];
                text = _localizeText[lang];
                if(text === void 0) {
                    text = _localizeText[guiKey][LANG_GENERAL];
                    extractedProps = extractedProps.concat(this.extractPropertiesFromText(text));
                }
            }
            return new Set(extractedProps);
        }
    
        /**
         * This will read (again) all data from the JSON files.
         * This was originally done in onSetup, but now moved into a separate function, to be called anytime.
         * @async
         */
        async updateJSONData() {
            _logger.log(_logger.LOG_SRVC_INOUT, "> LocalizeServiceMock::updateJSONData()");
            try {
                let [profile, profileExtension] = await this.getToolingProfile();
                _logger.log(_logger.LOG_DATA, `. LocalizeServiceMock::updateJSONData profile=${profile}`);
                const fileLocalizedText = `../servicemocks/mockdata/LocalizedText${profileExtension}.json`;
                const fileLocalizedTextCustom = "../servicemocks/mockdata/LocalizedTextCustom.json";
                const fileLanguageMappings = `../servicemocks/mockdata/LanguageMappings${profileExtension}.json`;
                const fileLanguageMappingsCustom = "../servicemocks/mockdata/LanguageMappingsCustom.json";
                let dataArray = await Promise.all([
                    this.retrieveJSONData(fileLocalizedText),
                    this.retrieveJSONData(fileLocalizedTextCustom),
                    this.retrieveJSONData(fileLanguageMappings),
                    this.retrieveJSONData(fileLanguageMappingsCustom)
                ]);
                delete dataArray[1]["//"]; // remove possible comment
                _localizeText = Object.assign(dataArray[0], dataArray[1]); // standard props with custom specific ones
                delete dataArray[3]["//"]; // remove possible comment
                _langConf = Object.assign(dataArray[2], dataArray[3]); // standard props with custom specific ones
                this.logger.log(this.logger.LOG_SRVC_INOUT, "< LocalizeServiceMock::updateJSONData");
            } catch(e) {
                throw `* importReference error or getToolingProfile failed ${e}`;
            }
        }

        /**
         * See {@link Wincor.UI.Service.BaseServiceMock#onSetup}.
         * In addition it will call _updateJSONData_ to read the JSON files.
         *
         * @param {object} message
         * @see {@link Wincor.UI.Service.BaseServiceMock#onSetup}
         * @lifecycle service
         * @async
         */
        async onSetup(message) {
            _logger.log(_logger.LOG_SRVC_INOUT, `> LocalizeServiceMock::onSetup('${JSON.stringify(message)}')`);
            try {
                await this.updateJSONData();
                _logger.log(_logger.LOG_SRVC_INOUT, "< LocalizeServiceMock::onSetup");
            } catch(e) {
                throw e;
            }
        }

        /**
         * See {@link Wincor.UI.Service.BaseServiceMock#onServicesReady}
         * @returns {Promise}
         * @lifecycle service
         */
        onServicesReady() {
            _logger.log(_logger.LOG_SRVC_INOUT, "> LocalizeServiceMock::onServicesReady()");
            this.serviceProvider.ViewService.registerForServiceEvent(this.serviceProvider.ViewService.SERVICE_EVENTS.VIEW_CLOSING, this.cleanTranslationTexts.bind(this, true), true);
            this.serviceProvider.ViewService.registerForServiceEvent(this.serviceProvider.ViewService.SERVICE_EVENTS.SHUTDOWN, this.cleanTranslationTexts.bind(this, true), true);
            return new Promise(resolve => {
                _businessData = this.serviceProvider.DataService.businessData;

                function convertRegistryMappingToInternalMapping(languageMappings) {
                    let internalMapping = {nameToIso: {}, isoToName: {}};
                    try {
                        let installedLangsIso = languageMappings["InstalledLanguages"].split(";");
                        let langSpecs = languageMappings["LanguageSpecifications"];
                        if(installedLangsIso.length <= langSpecs.length) {
                            for(let i = 0; i < installedLangsIso.length; i++) {
                                let isoCode = installedLangsIso[i]; // get e.g. "en-US"
                                for(let k = 0; k < langSpecs.length; k++) {
                                    let spec = langSpecs[k][isoCode];
                                    if(spec) {
                                        this.languageSpecifications[isoCode] = spec;
                                        let langName = Object.keys(spec["NameToIso"])[0];        // get e.g. "English" or "German"...
                                        isoCode = spec["NameToIso"][langName].split(";")[1]; // get e.g. "en-US" or "de-DE"
                                        if(isoCode) {
                                            internalMapping.nameToIso[langName] = isoCode;   // set e.g. "German": "de-DE"
                                            internalMapping.isoToName[isoCode] = langName;   // set e.g. "de-DE": "German"
                                        }
                                        break;
                                    }
                                }
                            }
                            internalMapping.defaultLanguage = installedLangsIso.length ? installedLangsIso[0] : "en-US";
                        } else {
                            internalMapping = null;
                            _logger.error("LanguageMappings.json invalid configuration: InstalledLanguages exceeds mapped languages - allowed is less or euqal !");
                        }
                    } catch (e) {
                        internalMapping = null;
                        _logger.error(e);
                    }
                    return internalMapping;
                }
    
                this.languageMap = convertRegistryMappingToInternalMapping.call(this, _langConf);

                // If there is a default language configured (e.g. by a QueryString), then CoreResources.js has stored it in the localStorage.
                // We expect it as ISO code
                let defLangFromStorage = localStorage.getItem("defaultLanguage");
                if (defLangFromStorage) {
                    this.languageMap.defaultLanguage = defLangFromStorage;
                    this.setLanguage(defLangFromStorage);
                }
                
                super.onServicesReady().then(resolve);
                _logger.log(_logger.LOG_SRVC_INOUT, "< LocalizeServiceMock::onServicesReady");
            });
        }

        /**
         * Returns all installed languages as an array of ISO Codes
         * @return {Array<String>} will be an Array of ISO codes, e.g. [en-US, de-DE]
         */
        getInstalledLanguages() {
            const result = Object.keys(this.languageMap.isoToName);
            _logger.log(_logger.LOG_SRVC_INOUT, `. LocalizeServiceMock::getInstalledLanguages ISO languageMap=${result}`);
            return result;
        }
    }
};

/**
 * The LocalizeServiceMock provides access to the localized text configuration.
 *
 * @function getServiceClass
 * @param {Wincor} Wincor
 * @param {Class} Class
 * @param {BaseService} BaseService
 * @param {LogProvider} LogProvider
 * @returns {Wincor.UI.Service.Provider.LocalizeService}
 * @class
 * @since 1.2/00
 */
export default getServiceClass;
