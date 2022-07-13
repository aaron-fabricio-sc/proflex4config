/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ wn.UI.Service.DataService.js 4.3.1-210212-21-06af7f4f-1a04bc7d
 */

/**
 * @module
 */
const getServiceClass = ({ Wincor, ext, LogProvider, PTService, UIPropertyKeyMap, BusinessPropertyKeyMap, BusinessPropertyCustomKeyMap }) => {
    /**
     *
     * @type {Wincor.UI.Diagnostics.LogProvider|*|Wincor.UI.Diagnostics.LogProvider|*}
     * @const
     * @private
     */
    const _logger = LogProvider;

    const META_UTF8 = "PARLIST_UTF8";
    const META_ANSI = "PARLIST_ANSI";
    const BUFFER_LEN_UTF8 = 16000;
    const BUFFER_LEN_ANSI = 8000;
    const MAX_LEN_REQUESTED_KEYS = 131072; // 128KB
    const MAX_LEN_REQUESTED_VALUES = 131072; // 128KB
    const MAX_COUNT_REQUESTED_KEYS = 1024;

    const VALUE_ARRAY_SEPARATOR = "_||_";
    const VALUE_CHANGED_SEPARATOR = "_WNSEP_";
    const KEY_ARRAY_INDICATOR = "[A]";
    const PROP_ARRAY_MARKER = "[A";
    const PROP_INDEX_BEGIN_MARKER = "[";
    const PROP_ATTRIBUTE_BEGIN_MARKER = ".";
    return class DataService extends PTService {
        /**
         * The logical name of this service as used in the {@link Wincor.UI.Service.Provider}.
         * @default DataService
         * @const
         * @type {string}
         */
        NAME = "DataService";

        /**
         * @type {Array<function(string):boolean>}
         */
        propertyHandler = null;

        /**
         * Structure containing the registered data keys
         * @class
         */
        DataRegistration = function() {
            /**
             * The registered data keys of the business properties.
             * @type {Array<string>}
             */
            this.keys = []; //the registered dataKeys

            /**
             * The key map may contain mapped business keys to original requested keys.
             * E.g.: {"CCTAFW_PROP_CURRENCY": "PROP_CURRENCY_ISO"}
             * @type {Object}
             */
            this.keyMap = {};

            /**
             * A callback function which is called when the dataChanged event is triggered
             * @type {function}
             */
            this.onUpdate = null; //this callback is called when the dataChanged event is triggered

            /**
             * If registration is persistent (true), a content-page unload will not remove the registration, false otherwise.
             * @type {boolean}
             */
            this.persistent = false; //if registration is persistent, a content-page unload will not remove the registration
        };

        /**
         * Array containing elements of {@link Wincor.UI.Service.DataService#DataRegistration}.
         * @type {Array}
         */
        dataArray = []; // [DataRegistration1, DataRegistration2, ... ]

        /**
         * Contains the business property keymap.
         * @type {Object}
         */
        businessPropertyKeys = null;

        /**
         * Contains the UI specific property keys.
         * @type {Object}
         */
        UIPropertyKeys = null;

        /**
         * The property request map.
         * The map contain request id's with objects containing mapped properties.
         * @example
         * 4911:
         * {
         *      "CCTAFW_PROP_CURRENCY": "PROP_CURRENCY_ISO",
         *      "CCTAFW_PROP_CURRENCY_EXPONENT": "PROP_CURRENCY_EXP"
         * }
         * @type {Map}
         */
        propRequestMap = null;

        /**
         * Initializes the member of this class.
         * @lifecycle service
         * @see {@link Wincor.UI.Service.PTService}.
         */
        constructor(...args) {
            super(...args);
            this.businessPropertyKeys = {};
            this.UIPropertyKeys = {};
            this.propRequestMap = new Map();
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> DataService::DataService");
            this.FRM_RESOLVE_REQUEST.service = this.NAME;
            this.FRM_RESOLVE_REQUEST.FWName = "CCDatDic";
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< DataService::DataService");
        }

        /**
         * Called automatically as soon as there is an answer to an asynchronous ProTopas request. See {@link Wincor.UI.Service.BaseService#translateResponse}.
         * The response will be translated to the result expected by the requester.
         *
         * @param {Object} message    Response object, see {@link Wincor.UI.Service.BaseService#translateResponse}.
         * @returns {Object}               Depends on function
         */
        translateResponse(message) {
            let ret = {};
            try {
                _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> DataService::translateResponse('${JSON.stringify(message)}')`);

                //GETKEYS response
                if(message.FWFuncID === 30) {
                    if(message.RC === 0) {
                        /*
                         message.param1 has the keys,   i.e. [key1,   key2, ...]
                         message.param2 has the values, i.e. [value1, value2, ...]
                         message.param3 has the RCs, i.e. [RC1, RC2, ...]

                         If 'key1' looks like 'PropName[A]' (i.e. with [A] at the end)
                         then 'value1' will be a comma-separted list of values.
                         This will be transferred into an array.

                         getKeysResponse will be an object:
                         getKeysResponse["key1"] = value1
                         getKeysResponse["key2"] = value2
                         getKeysResponse["key[A]"] = [value30, value32, value33, ...]
                         ...
                         */
                        let response = {};
                        for(let i in message.param1) {
                            if(message.param1.hasOwnProperty(i)) {
                                let key = message.param1[i].toString();
                                //TODO: check RC? use null for invalid keys! same as LocalizeService.
                                //if (message.param3[i].toString() === "0")
                                //then response[key] = message.param2[i];
                                //else response[key] = null;
                                if(
                                    key.indexOf(KEY_ARRAY_INDICATOR) === key.length - 3 || //if it ends with [A]
                                    (key.indexOf("[A,") !== -1 && key.indexOf("]") === key.length - 1)
                                ) {
                                    //if it looks like [A,x]
                                    response[key] = message.param2[i].split(VALUE_ARRAY_SEPARATOR);
                                } else {
                                    response[key] = message.param2[i];
                                }
                            }
                        }
                        ret = this.mapResponseKeys(response, message.callbackIdx); // replace business keys by the original requested mapped keys, if necessary
                    }
                } else if(message.FWFuncID === 31) {
                    ret = message.RC; // always return rc
                } else {
                    _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `. DataService::onResponse message with FWFuncID '${message.FWFuncID}' and RC = '${message.RC}' will not be evaluated.`);
                }

                _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `< DataService::translateResponse returns: ${JSON.stringify(ret)}`);
            } catch(e) {
                // Provider writes error-log
                Wincor.UI.Service.Provider.propagateError(this.NAME, this.ERROR_TYPE.RESPONSE, e);
            }
            return ret;
        }

        /**
         * Gets a business property key map.
         * @returns {Object} the property key map
         */
        getPropertyKeyMap() {
            return this.businessPropertyKeys;
        }

        /**
         * Gets a map with the given request id.
         * @param {Number} reqId the request id from the original{@link Wincor.UI.Service.DataService#getValues} request
         * @return {Object} the key map, if one found, or a plain object in case if not
         */
        getKeyMap(reqId) {
            let mapVal = {};
            if(this.propRequestMap.has(reqId)) {
                mapVal = this.propRequestMap.get(reqId);
            }
            return mapVal;
        }

        /**
         * Maps business keys which have to replaced by the original keys from request.
         * If the given request id is exists the properties are mapped back into the given response.
         * The map with request id is removed after mapping back.
         * @param {Object} response the response which might containing business keys which we have to replace with the original keys from request
         * @param {Number} reqId the request id from the original{@link Wincor.UI.Service.DataService#getValues} request
         * @return {Object} the given response which might have mapped back property keys
         */
        mapResponseKeys(response, reqId) {
            if(response && reqId && this.propRequestMap.has(reqId)) {
                const mapVal = this.propRequestMap.get(reqId);
                const respKeys = Object.keys(response);
                const len = respKeys.length;
                for(let i = 0; i < len; i++) {
                    let key = respKeys[i]; // business key
                    if(key in mapVal) {
                        response[mapVal[key]] = response[key]; // add a new one with the original request key
                        delete response[key]; // delete the one with the business key
                    }
                }
                this.propRequestMap.delete(reqId); // finally delete mapping for that request id
            }
            return response;
        }

        /**
         * Maps the requested key to the corresponding business key if necessary.
         * @param {String} key the requested property key which might is a key which we have to map to a business key name using
         * the 'BusinessPropertyKeyMap.json'
         * @return {String} the mapped key or the given key in case of it could not mapped
         */
        mapKey(key) {
            if(key && typeof key === "string") {
                let attrMarker = key.indexOf(PROP_ATTRIBUTE_BEGIN_MARKER);
                let arrayMarkerIdx = key.indexOf(PROP_INDEX_BEGIN_MARKER);
                if(arrayMarkerIdx === -1 && attrMarker === -1) {
                    return this.businessPropertyKeys[key] || key;
                } else {
                    let plainKey = attrMarker !== -1 ? key.substr(0, attrMarker) : key.substr(0, arrayMarkerIdx);
                    let marker = attrMarker !== -1 ? key.substr(attrMarker) : key.substr(arrayMarkerIdx);
                    if(plainKey in this.businessPropertyKeys) {
                        return `${this.businessPropertyKeys[plainKey]}${marker}`;
                    }
                }
            }
            return key;
        }

        /**
         * Maps the requested keys to the corresponding business keys if necessary.
         * If a request id is given and there are keys to map it stores the mapping
         * until {@link Wincor.UI.Service.DataService#mapResponseKeys} has been invoked with the same request id.
         * @param {Array<String>} keys the requested property keys which might contain keys which we have to map to business key names using
         * the 'BusinessPropertyKeyMap.json'
         * @param {Number=} reqId the request id from the original{@link Wincor.UI.Service.DataService#getValues} request
         * @return {Array} the keys array might contain mapped keys
         */
        mapKeys(keys, reqId) {
            let mappedKeys = [];
            let val = {};
            let mapVal;
            const len = keys.length;
            for(let i = 0; i < len; i++) {
                let key = keys[i];
                if(typeof key !== "string" || !isNaN(key)) {
                    _logger.error(
                        `DataService::mapKeys the key='${key}' within the given keys=[${keys}] array is not a string, please check your DataService::getValues call(s) for viewKey=${this.serviceProvider.ViewService.viewContext.viewKey}`
                    );
                    continue;
                }
                let attrMarker = key.indexOf(PROP_ATTRIBUTE_BEGIN_MARKER);
                let arrayMarkerIdx = key.indexOf(PROP_INDEX_BEGIN_MARKER);
                let plainKey = null;
                let marker = null;
                if(arrayMarkerIdx !== -1 || attrMarker !== -1) {
                    plainKey = attrMarker !== -1 ? key.substr(0, attrMarker) : key.substr(0, arrayMarkerIdx);
                    marker = attrMarker !== -1 ? key.substr(attrMarker) : key.substr(arrayMarkerIdx);
                }
                key = plainKey || key;
                let keyFromMap = this.businessPropertyKeys[key];
                let propKey = keyFromMap || key;
                propKey = plainKey ? `${propKey}${marker}` : propKey;
                // force unique keys
                if(!mappedKeys.includes(propKey)) {
                    mappedKeys.push(propKey);
                }
                if(reqId && keyFromMap) {
                    if(!mapVal) {
                        if(this.propRequestMap.has(reqId)) {
                            mapVal = this.propRequestMap.get(reqId);
                        } else {
                            mapVal = this.propRequestMap.set(reqId, val).get(reqId);
                        }
                    }
                    mapVal[propKey] = plainKey ? `${key}${marker}` : key;
                }
            }
            return mappedKeys;
        }

        /**
         * Get the values of the requested parameters from the business logic.
         * @param {Array<string> | string} keys e.g. single string or ["VAR_MY_HTML_NAME_S", "CUSTOMER_SURNAME", ...]
         * @param {function(Object)} callback
         * @param {function(Object)} onUpdateCallback callback is called when a key was updated.
         * @param {boolean=} [persistent=false] persistent true, if the -onUpdateCallback callback function should stay persistent, even a
         *        {@link Wincor.UI.Service.DataService#cleanDataRegistrations} is invoked, false otherwise.
         */
        getValues(keys, callback, onUpdateCallback, persistent = false) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> DataService::getValues(${keys})`);

            //BEGIN: check input parameters
            keys = Array.isArray(keys) ? keys : [keys];
            let uniqueKeys = [];
            let errorMessage;
            const len = keys.length;
            let overallLen = 0;
            // must use forward loop, because of order of the keys (e.g. ProFlex4Op)
            for(let i = 0; i < len; ++i) {
                let key = keys[i];
                //do NOT use '!keys[i]' because empty string is okay, 0 is okay
                if(key !== void 0 && key !== null) {
                    if(!uniqueKeys.includes(key)) {
                        uniqueKeys.push(key);
                        overallLen += key.length;
                    } else {
                        _logger.error(`Warning: DataService::getValues() double key detected: ${key}`);
                    }
                } else {
                    errorMessage = "DataService::getValues() keys contains null or undefined.";
                    break;
                }
            }
            // check for potential argument error
            if(overallLen > MAX_LEN_REQUESTED_KEYS || uniqueKeys.length > MAX_COUNT_REQUESTED_KEYS) {
                errorMessage = `DataService::getValues() too many or too long property keys argument requested. Please check your keys array argument. Number of keys requested: ${uniqueKeys.length}, string len: ${overallLen}`;
            }
            keys = this.mapKeys(uniqueKeys);

            if(errorMessage) {
                _logger.error(errorMessage);
                callback && callback({}); //call callback with empty object
                Wincor.UI.Service.Provider.propagateError("DataService::getValues", this.ERROR_TYPE.REQUEST);
                return;
            }
            //END: check input parameters

            this.FRM_RESOLVE_REQUEST.FWFuncID = 30; //DATADICTIONARYEXT_FUNC_GET_KEY_VALUES
            this.FRM_RESOLVE_REQUEST.param1 = keys;
            this.FRM_RESOLVE_REQUEST.meta1 = [META_ANSI, -1];
            this.FRM_RESOLVE_REQUEST.param2 = [];
            this.FRM_RESOLVE_REQUEST.meta2 = [META_UTF8, BUFFER_LEN_UTF8];
            this.FRM_RESOLVE_REQUEST.param3 = [];
            this.FRM_RESOLVE_REQUEST.meta3 = [META_ANSI, BUFFER_LEN_ANSI];
            this.FRM_RESOLVE_REQUEST.paramUL = 0;

            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `Wincor.UI.Service.DataService.getValues() Request to send: '${JSON.stringify(this.FRM_RESOLVE_REQUEST)}'.`);
            let message = this.FrmResolve(this.FRM_RESOLVE_REQUEST, callback);
            this.mapKeys(uniqueKeys, message.callbackIdx);
            //build a new TranslateRegistration object and add it to our Array if (and only if!) an onUpdateCallback is given
            if(onUpdateCallback) {
                let dataReg = new this.DataRegistration();
                dataReg.keys = keys;
                dataReg.keyMap = this.getKeyMap(message.callbackIdx);
                dataReg.onUpdate = onUpdateCallback;
                dataReg.persistent = persistent ? persistent : false; // note, persistent arg is optional
                this.dataArray.push(dataReg);
            }
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< DataService::getValues");
        }

        /**
         * Set the values of the requested parameters to be stored within the business logic.
         * @param {Array<string> | string} keys e.g. a single string or ["VAR_MY_HTML_NAME_S", "CUSTOMER_SURNAME", ...]
         * @param {Array<string> | string} values e.g. a single string or ["cardinsert.html", "Doe", ...]
         * @param {function(Number)} callback
         */
        setValues(keys, values, callback) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> DataService::setValues(${keys}, ${values})`);

            //BEGIN: check input parameters
            keys = Array.isArray(keys) ? keys : [keys];
            values = Array.isArray(values) ? values : [values];
            let uniqueKeys = [];
            let correspondingValues = [];
            let errorMessage;
            if(keys.length !== values.length) {
                errorMessage = "DataService::setValues(): keys and values do not have the same size.";
            } else {
                let overallKeysLen = 0;
                let overallValuesLen = 0;
                for(let i = 0; i < keys.length; ++i) {
                    let key = keys[i];
                    let value = values[i];
                    if(key !== void 0 && key !== null) {
                        // do NOT use '!keys[i]' because empty string is okay, 0 is okay
                        let mappedKey = this.mapKey(key);
                        if(!uniqueKeys.includes(mappedKey)) {
                            uniqueKeys.push(mappedKey); // do the mapping of the key
                            overallKeysLen += key.length;
                            if(value !== void 0 && value !== null) {
                                // do NOT use '!keys[i]' because empty string is okay, 0 is okay
                                value = value.toString();
                                correspondingValues.push(value);
                                overallValuesLen += value.length;
                            } else {
                                errorMessage = "DataService::setValues() values contains null or undefined.";
                                break;
                            }
                        } else {
                            if(mappedKey !== key) {
                                _logger.error(`Warning: DataService::setValues() double key detected: ${key} is the same as ${mappedKey}!`);
                            } else {
                                _logger.error(`Warning: DataService::setValues() double key detected: ${key}`);
                            }
                        }
                    } else {
                        errorMessage = "DataService::setValues() keys contains null or undefined.";
                        break;
                    }
                }
                // check for potential argument error
                if(overallKeysLen > MAX_LEN_REQUESTED_KEYS || uniqueKeys.length > MAX_COUNT_REQUESTED_KEYS) {
                    errorMessage = `DataService::setValues() too many or too long property keys argument requested. Please check your keys array argument. Number of keys argument requested: ${uniqueKeys.length}, string len: ${overallKeysLen}`;
                } else if(overallValuesLen > MAX_LEN_REQUESTED_VALUES) {
                    errorMessage = `DataService::setValues() too long values argument requested. Please check your values array argument. Number of values argument requested: ${correspondingValues.length}, string len: ${overallValuesLen}`;
                }
            }

            if(errorMessage) {
                _logger.error(errorMessage);
                if(callback) {
                    callback(-1); //call callback with a RC != 0
                }
                Wincor.UI.Service.Provider.propagateError("DataService::setValues", this.ERROR_TYPE.REQUEST);
                return;
            }
            //END: check input parameters

            this.FRM_RESOLVE_REQUEST.FWFuncID = 31; //DATADICTIONARYEXT_FUNC_SET_KEY_VALUES
            this.FRM_RESOLVE_REQUEST.param1 = uniqueKeys;
            this.FRM_RESOLVE_REQUEST.meta1 = [META_ANSI, -1];
            this.FRM_RESOLVE_REQUEST.param2 = correspondingValues;
            this.FRM_RESOLVE_REQUEST.meta2 = [META_UTF8, -1];
            this.FRM_RESOLVE_REQUEST.param3 = [];
            this.FRM_RESOLVE_REQUEST.meta3 = [META_ANSI, BUFFER_LEN_ANSI];
            this.FRM_RESOLVE_REQUEST.paramUL = 0;

            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `Wincor.UI.Service.DataService.setValues() Request to send: '${JSON.stringify(this.FRM_RESOLVE_REQUEST)}'.`);
            this.FrmResolve(this.FRM_RESOLVE_REQUEST, callback);
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< DataService::setValues");
        }

        /**
         * Clean the {@link Wincor.UI.Service.DataService#dataArray} containing all
         * {@link Wincor.UI.Service.DataService#DataRegistration} structures which has been set by the
         * {@link Wincor.UI.Service.DataService#getValues} method.
         */
        cleanDataRegistrations() {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> DataService::cleanDataRegistrations()");
            let newDataArray = [];
            // keep the persistent items in -newDataArray
            for(let i = this.dataArray.length - 1; i >= 0; i--) {
                if(this.dataArray[i].persistent) {
                    // keep the persistent item
                    newDataArray.push(this.dataArray[i]);
                }
            }
            this.dataArray = newDataArray; // empty array or the persistent items kept
            this.propRequestMap.clear(); // clean the property request map
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< DataService::cleanDataRegistrations");
        }

        /**
         * Builds a result object and calls the registered update callbacks.
         * @param {String} value the separated value string
         * @private
         */
        valueChanged(value) {
            let splitResult = value.split(VALUE_CHANGED_SEPARATOR);
            let changedKey = splitResult[0];
            let newValue = splitResult[1];
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `. DataService::onValueChanged changedKey='${changedKey}', newValue='${newValue}'`);
            for(let i = 0; i < this.dataArray.length; i++) {
                let dataReg = this.dataArray[i];
                let keys = dataReg.keys;
                for(let j = 0; j < keys.length; j++) {
                    if(keys[j] === changedKey) {
                        let result = {}; //build the object
                        if(changedKey in dataReg.keyMap) {
                            // must replace the business key by the original requested key?
                            result[dataReg.keyMap[changedKey]] = newValue;
                        } else {
                            result[changedKey] = newValue;
                        }
                        dataReg.onUpdate(result); //call the callback with the object
                    }
                }
            }
        }

        /**
         * This method will be triggered when a value of a key has been changed.
         * The changed key will be updated in the DataRegistration structure, which contains all prior requested keys.
         * @param {Array} value e.g. ["VAR_MY_HTML_NAME_S", "CUSTOMER_SURNAME", ...]
         */
        onValueChanged(value) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> DataService::onValueChanged(${value})`);
            this.valueChanged(Wincor.ConvHexToStr(value)); // values[0] has the message content
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< DataService::onValueChanged");
        }

        /**
         * This method will be triggered when an Unicode (WCHAR*) value of a key has been changed.
         * The changed key will be updated in the DataRegistration structure, which contains all prior requested keys.
         * @param {String} value Key + separator + new Value (WCHAR*) e.g. "VIDEO_PEERID_NAME_WNSEP_"
         */
        onValueChangedUnicode(value) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> DataService::onValueChangedUnicode(${value})`);
            this.valueChanged(value); // values[0] has the message content
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< DataService::onValueChangedUnicode");
        }

        /**
         * Reads the <i>UIPropertyKeyMap.json</i>, the <i>BusinessPropertyKeyMap.json</i> and <i>BusinessPropertyCustomKeyMap.json</i> and stores the content in
         *
         * @param {Object} message See {@link Wincor.UI.Service.BaseService#onSetup}
         * @returns {Promise}
         * @lifecycle service
         * @see {@link Wincor.UI.Service.BaseService#onSetup}
         */
        onSetup(message) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> DataService::onSetup('${JSON.stringify(message)}')`);
            const self = this;
            return Promise.resolve([BusinessPropertyKeyMap, BusinessPropertyCustomKeyMap, UIPropertyKeyMap])
                .then(dataArray => {
                    delete dataArray[1]["//"]; // remove possible comment
                    self.businessPropertyKeys = Object.assign(dataArray[0], dataArray[1]); // standard keys with custom specific ones
                    self.UIPropertyKeys = dataArray[2];
                    _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< DataService::onSetup");
                })
                .catch(e => {
                    _logger.error(`* importReference error getting BusinessPropertyKeyMap or BusinessPropertyCustomKeyMap ${e}`);
                });
        }

        /**
         * Registers for DataDictionary events for property changes.
         * @returns {Promise}
         * @lifecycle service
         * @see {@link Wincor.UI.Service.BaseService#onServicesReady}
         */
        onServicesReady() {
            return ext.Promises.promise(resolve => {
                _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> DataService::onServicesReady()");
                function registerCallback(message) {
                    _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `* DataService::onServicesReady (registerCallback): RC: ${message.RC}`);
                }

                this.serviceProvider.EventService.registerForEvent(666, "CCDatDic", this.onValueChangedUnicode.bind(this), registerCallback.bind(this), "UTF-8", true);
                this.serviceProvider.EventService.registerForEvent(667, "CCDatDic", this.onValueChangedUnicode.bind(this), registerCallback.bind(this), "UTF-16", true);
                const viewService = this.serviceProvider.ViewService;
                viewService.registerForServiceEvent(viewService.SERVICE_EVENTS.VIEW_CLOSING, this.cleanDataRegistrations.bind(this), true);
                viewService.registerForServiceEvent(
                    viewService.SERVICE_EVENTS.SHUTDOWN,
                    () => {
                        this.cleanDataRegistrations();
                        this.propertyHandler = null;
                    },
                    true
                );
                _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< DataService::onServicesReady");

                super.onServicesReady().then(resolve);
            });
        }

        /**
         * Callback for DataService~setPropertyHandler.
         * @callback propertyHandlerCallback
         * @async
         * @param {object} propertyInfo The propertyInfo object
         * @param {string} propertyInfo.key The name of the property to resolve
         * @param {string} propertyInfo.value THe name of the property to resolve
         * @returns {Promise<undefined|boolean>}
         */

        /**
         * Adds a handler function to string property handlers
         * @param {propertyHandlerCallback|null} handlerFx The handler function or null to reset
         * @returns {boolean} success
         */
        setPropertyHandler(handlerFx) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> DataService::setPropertyHandler(...)`);
            let ret = false;
            if(!this.propertyHandler && typeof handlerFx === "function") {
                const handler = handlerFx;
                ret = true;
                this.propertyHandler = (...args) => {
                    try {
                        return handler(...args);
                    } catch(e) {
                        _logger.error(`Error DataService: propertyHandler: ${handler ? handler.toString() : "<invalid_handler>"} caught ${JSON.stringify(e)}`);
                    }
                };
            } else {
                if(handlerFx == null) {
                    this.propertyHandler = null;
                    _logger.error(`DataService::setPropertyHandler resetting handlerFx`);
                    ret = true;
                } else if(this.propertyHandler) {
                    _logger.error(`DataService::setPropertyHandler handler already set!`);
                } else {
                    _logger.error(`DataService::setPropertyHandler argment is not a function!`);
                }
            }
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `< DataService::setPropertyHandler returns id <${ret}>`);
            return ret;
        }

        /**
         * This function can be called from outside the UI to retrieve arbitrary viewModel data as a property!
         * The functionality relies on a naming convention regarding the attribute name and context to access.
         * Naming convention is defined as follows:
         * GUIINSTANCENAME_ATTRIBUTENAME_CONTEXTNAME, where "GUIINSTANCENAME_" will be cut by gui.dll and not arrive here!
         * This automatic value resolution via naming convention heavily relies on a correct case-sensitive spelling, therefore mappings can be
         * used within the file "core/servicedata/businessPropertyKeyMap.json"
         * For CONTEXTNAME the "observableAreaId" of a corresponding viewModel can be given so that a valid name could be:
         * "GUIAPP_flexHeader.date". Service attributes can also be accessed if exposed via proxy using the servicename as context like:
         * "ViewService.viewContext.viewConfig"
         * The result will be send back to the native part as response containing the stringified value of the attribute or null if it does not exist.
         * @param {Object} message message containing request-data
         * @param {String} message.propertyName contains the propertyName - has to follow the above naming convention
         * @param {String} message.propertyValue will be set to the value of the property, unchanged if not found...
         * @return {String} value for internal requests
         */
        getPropertyString(message) {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `> DataService::getPropertyString(${JSON.stringify(message)})`);
            let name = message.propertyName;
            let value = null;
            let ret;
            // try to get it from mapping, otherwise try to disassemble directly
            name = this.UIPropertyKeys[name] || name;
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `. after mapping: ${name}`);
            const prop = { key: name, value: undefined };
            let handled = false;
            if(this.propertyHandler) {
                handled = this.propertyHandler(prop);
            }

            if(handled) {
                // any invalid falsish value is reset to ""
                if(!prop.value) {
                    _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `. DataService::getPropertyString propertyHandler returned invalid value <${prop.value}> resetting to ''`);
                    prop.value = "";
                }
                _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `. DataService::getPropertyString propertyHandler returned <${prop.value}>`);
                value = prop.value;
            } else {
                // now we have: flexHeader.date -> first index is context, next attributes might be more than one for nested objects... walk structure hierarchy
                let parts = name.split(".");
                let contextName = parts.splice(0, 1)[0]; // pop first entry as context
                let context = Wincor.UI.Service.Provider[contextName];

                if(!context) {
                    // it wasn't a service, look for specials
                    if(contextName.indexOf("Wincor") === 0) {
                        context = Wincor;
                    } else if(contextName.indexOf("window") === 0) {
                        context = window.frames[0];
                    }
                }

                // If there is a viewset switch active, we won't have "Content" available!
                if(!context && Wincor.UI.Content && Wincor.UI.Content.ViewModelContainer) {
                    // at last try if there is an observable area / vm with this name...
                    context = Wincor.UI.Content.ViewModelContainer.getById(contextName);
                }

                if(context) {
                    value = parts.reduce(function(c, a) {
                        if(c && a in c) {
                            try {
                                if(typeof c[a] === "function" && "__ko_proto__" in c[a]) {
                                    return c[a]();
                                } else {
                                    return c[a];
                                }
                            } catch(e) {
                                _logger.error(`DataService::getPropertyString exception during attribute evaluation: '${e.message}'`);
                            }
                        }
                        return void 0;
                    }, context);
                }
            }

            if(value !== void 0 && value !== null) {
                message.propertyValue = value.toString();
                ret = this.REQUEST_RESPONSE_OK;
                this.sendResponse(message, ret);
            } else {
                let err = name;
                if(message.propertyName !== name) {
                    err = message.propertyName + "' aka '" + name;
                }
                _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `DataService::getPropertyString attribute could not be found for: '${err}'`);
                ret = "-1";
                this.sendResponse(message, ret);
            }

            if(typeof value === "object") {
                try {
                    value = JSON.stringify(value);
                } catch(e) {
                    value = value.toString();
                }
            }

            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `< DataService::getPropertyString returns ${ret} data: ${JSON.stringify(message)}`);
            return value;
        }
    };
};

/**
 * The DataService class provides methods to retrieve data-values from the business logic (properties).
 *
 * @function getServiceClass
 * @param {Wincor} Wincor
 * @param {ext} ext
 * @param {LogProvider} LogProvider
 * @param {PTService} PTService
 * @param UIPropertyKeyMap
 * @param BusinessPropertyKeyMap
 * @param BusinessPropertyCustomKeyMap
 * @returns {Wincor.UI.Service.DataService}
 * @class
 * @since 1.0/00
 */
export default getServiceClass;
