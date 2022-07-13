/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ wn.UI.Service.DataServiceMock.js 4.3.1-210701-21-172c70a5-1a04bc7d

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

    const LISE_DATA_SEPARATOR = "_||_";
    const PROP_ARRAY_MARKER = "[A";
    const PROP_INDEX_BEGIN_MARKER = "[";
    const PROP_INDEX_END_MARKER = "]";
    const PROP_ATTRIBUTE_BEGIN_MARKER = ".";

    const MAX_LEN_REQUESTED_KEYS = 131072; // 128KB
    const MAX_LEN_REQUESTED_VALUES = 131072; // 128KB
    const MAX_COUNT_REQUESTED_KEYS = 1024;

    let _businessData = {};
    let _businessPropKeyMap = {};
    let _viewService;
    let _configService;
    let _controlPanelService;

    /**
     * Array containing elements of {@link Wincor.UI.Service.DataServiceMock#DataRegistration}.
     * @type {Array}
     */
    let _dataRegistrators = []; // [DataRegistration1, DataRegistration2, ... ]

    let _requestId = 0;

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
    const _propRequestMap = new Map();

    let _usedBusinessProperties = new Map();

    function extractStartIndexFromArrayKey(key) {
        let startIdx = 0;
        if(key && key.includes(PROP_ARRAY_MARKER)) {
            let accessData = key.substring(key.indexOf(PROP_INDEX_BEGIN_MARKER) + 1, key.indexOf(PROP_INDEX_END_MARKER));
            accessData = accessData.split(",");
            startIdx = parseInt(accessData[1]);
        }
        return startIdx;
    }

    return class DataServiceMock extends BaseService {
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
         * Contains the business property keymap.
         * @type {Object}
         */
        businessData = _businessData;

        /**
         * Contains the UI specific property keys.
         * @type {Object}
         */
        UIPropertyKeys = {};

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
         * The service events for the DataServiceMock.
         * @enum {string}
         */
        SERVICE_EVENTS = {
            /**
             * Fired when any setValues() has been done.
             * @event  Wincor.UI.Service.DataServiceMock#SERVICE_EVENTS:DATA_CHANGED
             * @eventtype service
             */
            DATA_CHANGED: "DATA_CHANGED"
        };

        /**
         * This event is sent if there are missing data keys.
         * @type {Object}
         * @eventtype native
         * @event  Wincor.UI.Service.DataServiceMock#EVENT_MISSING_DATA_KEYS
         */
        EVENT_MISSING_DATA_KEYS = null;

        /**
         * Initializes the member of this class.
         * @lifecycle service
         * @see {@link Wincor.UI.Service.BaseServiceMock#constructor}.
         */
        constructor(...args) {
            super(...args);
            _logger.log(_logger.LOG_SRVC_INOUT, "> DataServiceMock::DataServiceMock");
            this.EVENT_MISSING_DATA_KEYS = Object.assign(Object.assign({}, this.EVENT), {
                service: this.NAME,
                viewID: -1,
                viewKey: null,
                eventName: "MissingDataKeys",
                keys: []
            });

            _logger.log(_logger.LOG_SRVC_INOUT, "< DataServiceMock::DataServiceMock");
        }

        /**
         * Clean the {@link Wincor.UI.Service.DataService#dataArray} containing all
         * {@link Wincor.UI.Service.DataService#DataRegistration} structures which has been set by the
         * {@link Wincor.UI.Service.DataService#getValues} method.
         */
        cleanDataRegistrations() {
            _logger.log(_logger.LOG_SRVC_INOUT, "> DataServiceMock::cleanDataRegistrations()");
            let newDataArray = [];
            // keep the persistent items in -newDataArray
            for(let i = _dataRegistrators.length - 1; i >= 0; i--) {
                if(_dataRegistrators[i].persistent) {
                    // keep the persistent item
                    newDataArray.push(_dataRegistrators[i]);
                }
            }
            _dataRegistrators = newDataArray; // empty array or the persistent items kept
            _propRequestMap.clear(); // clean the property request map
            _requestId = 0; // reset request id
            _logger.log(_logger.LOG_SRVC_INOUT, "< DataServiceMock::cleanDataRegistrations");
        }

        /**
         * Gets the current data registrations.
         * Data registrations are properties which for an update callback has been given via {@link Wincor.UI.Service.DataService#getValues}
         * @return {Array<DataRegistration>} the current data registrations
         */
        getDataRegistrations() {
            return _dataRegistrators;
        }

        /**
         * Gets a business property key map.
         * @returns {Object} the property key map
         */
        getPropertyKeyMap() {
            return _businessPropKeyMap;
        }

        /**
         * Gets a map with the given request id.
         * @param {Number} reqId the request id from the original{@link Wincor.UI.Service.DataService#getValues} request
         * @return {Object} the key map, if one found, or a plain object in case if not
         */
        getKeyMap(reqId) {
            let mapVal = {};
            if(_propRequestMap.has(reqId)) {
                mapVal = _propRequestMap.get(reqId);
            }
            return mapVal;
        }

        /**
         * Maps business keys which have to replaced by the original keys from request.
         * If the given request id is exists the properties are mapped back into the given response.
         * The map with request id is removed after mapping back.
         * @param {Object} response the response which might containing business keys which we have to replace with the original keys from request
         * @param {Number} reqId the request id from the original{@link Wincor.UI.Service.DataServiceMock#getValues} request
         * @return {Object} the given response which might have mapped back property keys
         */
        mapResponseKeys(response, reqId) {
            if(response && reqId && _propRequestMap.has(reqId)) {
                const mapVal = _propRequestMap.get(reqId);
                const respKeys = Object.keys(response);
                const len = respKeys.length;
                for(let i = 0; i < len; i++) {
                    let key = respKeys[i]; // business key
                    if(key in mapVal) {
                        response[mapVal[key]] = response[key]; // add a new one with the original request key
                        delete response[key]; // delete the one with the business key
                    }
                }
                _propRequestMap.delete(reqId); // finally delete mapping for that request id
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
                    return _businessPropKeyMap[key] || key;
                } else {
                    let plainKey = attrMarker !== -1 ? key.substr(0, attrMarker) : key.substr(0, arrayMarkerIdx);
                    let marker = attrMarker !== -1 ? key.substr(attrMarker) : key.substr(arrayMarkerIdx);
                    if(plainKey in _businessPropKeyMap) {
                        return `${_businessPropKeyMap[plainKey]}${marker}`;
                    }
                }
            }
            return key;
        }

        /**
         * Maps the requested keys to the corresponding business keys if necessary.
         * If a request id is given and there are keys to map it stores the mapping
         * until {@link Wincor.UI.Service.DataServiceMock#mapResponseKeys} has been invoked with the same request id.
         * @param {Array<String>} keys the requested property keys which might contain keys which we have to map to business key names using
         * the 'BusinessPropertyKeyMap.json'
         * @param {Number=} reqId the request id from the original{@link Wincor.UI.Service.DataServiceMock#getValues} request
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
                        `DataServiceMock::mapKeys the key='${key}' within the given keys=[${keys}] array is not a string, please check your DataServiceMock::getValues call(s) for viewKey=${this.serviceProvider.ViewService.viewContext.viewKey}`
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
                let keyFromMap = _businessPropKeyMap[key];
                let propKey = keyFromMap || key;
                propKey = plainKey ? `${propKey}${marker}` : propKey;
                // force unique keys
                if(!mappedKeys.includes(propKey)) {
                    mappedKeys.push(propKey);
                }
                if(reqId && keyFromMap) {
                    if(!mapVal) {
                        if(_propRequestMap.has(reqId)) {
                            mapVal = _propRequestMap.get(reqId);
                        } else {
                            mapVal = _propRequestMap.set(reqId, val).get(reqId);
                        }
                    }
                    mapVal[propKey] = plainKey ? `${key}${marker}` : key;
                }
            }
            return mappedKeys;
        }

        /**
         * Get the values of the requested parameters stored in the registry.
         * @param {Array<string> | string} keys e.g. ["VAR_MY_HTML_NAME_S", "CUSTOMER_SURNAME", ...]
         * @param {function (Object)=} callback
         * @param {function (Object)} onUpdateCallback callback is called when a key was updated.
         * @param {boolean=} persistent true, if the -onUpdateCallback callback function should stay persistent, even a
         *        {@link Wincor.UI.Service.DataService#cleanDataRegistrations} is invoked, false otherwise.
         */
        getValues(keys, callback, onUpdateCallback, persistent) {
            _logger.log(_logger.LOG_SRVC_INOUT, `> DataServiceMock::getValues(${keys})`);
            keys = Array.isArray(keys) ? keys : [keys];
            keys = this.mapKeys(keys, ++_requestId);
            const reqId = _requestId;

            function sendMessageMissingKeys(missingKeys) {
                if(missingKeys.length > 0) {
                    const ctx = _viewService.viewContext;
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

            function generateSpecificResponse(reqId) {
                let response = {};
                let uniqueKeys = [];
                let missingKeys = [];
                let overallLen = 0;
                for(let i = 0; i < keys.length; ++i) {
                    // must use forward loop, because of order of the keys (e.g. ProFlex4Op)
                    let key = keys[i];
                    if(key === void 0 || key === null) {
                        _logger.error(`Error: DataServiceMock::getValues invalid key detected: ${key}`);
                        continue;
                    }
                    // Note:
                    // CCTAFW_PROP_CURRENCY[0] is always the same as CCTAFW_PROP_CURRENCY, even that property isn't an index based one!
                    // ControlPanel: We will store the property as CCTAFW_PROP_CURRENCY, even the request was CCTAFW_PROP_CURRENCY[0]!
                    if(!uniqueKeys.includes(key)) {
                        uniqueKeys.push(key);
                        overallLen += key.length;
                        // check for something like "CCCHCCDMTAFW_CHEQUE_ACCEPTED[idx] or CCCHCCDMTAFW_CHEQUE_ACCEPTED.id[idx]"
                        // except for something like "CCTAFW_PROP_EMV_APPLICATION_SELECTION_LISE_DATA[A,0,2]" which is for LISE concept
                        let parts = this.extractKeyPartsFromProperty(key);
                        let index = parts.idx === -1 ? 0 : parts.idx;
                        let attrChain = parts.attrChain;
                        let value = _businessData[parts.key];
                        let viewKey = _viewService.viewContext.viewKey;
                        // NOTE: Empty string is a valid value, if("") delivers false always
                        if(value || value === "") {
                            // first lookup with concrete view key, if it not exist then lookup with '*'
                            if(!value[viewKey] && value !== "") {
                                viewKey = "*";
                                value = value[viewKey];
                                if(Array.isArray(value)) {
                                    // value is an array ?
                                    value = value[index];
                                }
                                if(attrChain) {
                                    // value is expected as JSON
                                    value = this.getValueFromJSON(value, attrChain);
                                }
                                if(!value && value !== "") {
                                    value = null;
                                    _logger.error(
                                        `Warning: No business value for key=${key} and viewKey=${viewKey} available. Please check 'BusinessData.json' file`
                                    );
                                }
                            } else if(typeof value === "object") {
                                // if a specific view key has been succeeded, its value is expected as object then...
                                let data = value[viewKey];
                                if(data) {
                                    value = data;
                                    if(Array.isArray(value)) {
                                        // value is an array ?
                                        value = value[index];
                                    }
                                    if(attrChain) {
                                        // value is expected as JSON
                                        value = this.getValueFromJSON(value, attrChain);
                                    }
                                } else {
                                    value = null;
                                    _logger.error(
                                        `No LISE business value for key=${key} and viewKey=${viewKey} available. Please check 'BusinessData.json' file`
                                    );
                                }
                            } else {
                                value = null;
                                _logger.error(
                                    `No LISE business value for key=${key} and viewKey=${viewKey} available. Value is not an object as it was expected. Please check 'BusinessData.json' file`
                                );
                            }
                        } else {
                            value = null;
                            Wincor.toolingEDM && missingKeys.push(key);
                            _logger.error(
                                `Warning: No business value for key=${key} and viewKey=${viewKey} available. Please check 'BusinessData.json' file`
                            );
                        }
                        // LISE handling necessary ?
                        // e.g.: If we got a key like "CCTAFW_PROP_PREPAID_LISE_LIST[A,7,11]"
                        if(value && typeof value === "string" && value.includes(LISE_DATA_SEPARATOR)) {
                            // we expect a string here due to indexOf
                            // - Code when must consider the startIndex -
                            // We have to extract the start index and deliver data from that point of array:
                            // let dataArray = value.split(LISE_DATA_SEPARATOR), startIdx = 0;
                            // if(key.indexOf(PROP_ARRAY_MARKER) !== -1) {
                            //     startIdx = extractStartIndexFromArrayKey(key);
                            // }

                            // - Legacy code when not consider the startIndex -
                            // We have to ignore the start index and deliver always the whole data length.
                            // This is because the retrieved data (which are the original generated tooling data) are handled as net data, where the startIndex has already been
                            // considered by a lower-level data generator (e.g. DataDictionaryExt) and hence must not be considered once again.
                            response[key] = value.split(LISE_DATA_SEPARATOR);
                        } else {
                            response[key] = value; // a normal key/value
                            if(key.includes(PROP_ARRAY_MARKER)) {
                                // LISE access prop with only one item?
                                response[key] = [value];
                            }
                        }
                    } else {
                        _logger.error(`Warning: DataServiceMock::getValues double key detected: ${key}`);
                    }
                }
                if(Wincor.toolingEDM) {
                    sendMessageMissingKeys.call(this, missingKeys);
                }
                // handle business properties map
                let resKeys = Object.keys(response);
                for(let i = 0; i < resKeys.length; i++) {
                    let key = resKeys[i];
                    if(!missingKeys.includes(key)) {
                        let storeKey = key;
                        // CCTAFW_PROP_CURRENCY[0] is always the same as CCTAFW_PROP_CURRENCY so we store CCTAFW_PROP_CURRENCY only
                        // We pass something like "CCTAFW_PROP_TARGET_ACCOUNT_DATA.id[0]"
                        if(key.includes("[0]") && !key.includes(PROP_ATTRIBUTE_BEGIN_MARKER)) {
                            storeKey = key.substr(0, key.indexOf("[0]"));
                        }
                        _usedBusinessProperties.set(storeKey, response[key]);
                    }
                }
                _controlPanelService.updateBusinessProperties(_usedBusinessProperties);

                //build a new DataRegistration object and add it to our Array if (and only if!) an onUpdateCallback is given
                if(onUpdateCallback) {
                    let dataReg = new this.DataRegistration();
                    dataReg.keys = uniqueKeys;
                    dataReg.keyMap = this.getKeyMap(reqId);
                    dataReg.onUpdate = onUpdateCallback;
                    dataReg.persistent = persistent ? persistent : false; // note, persistent arg is optional
                    _dataRegistrators.push(dataReg);
                }

                // check for potential argument error
                if(overallLen > MAX_LEN_REQUESTED_KEYS || uniqueKeys.length > MAX_COUNT_REQUESTED_KEYS) {
                    _logger.error(
                        `DataServiceMock::getValues() too many or too long property keys argument requested. Please check your keys array argument. Number of keys requested: ${uniqueKeys.length}, string len: ${overallLen}`
                    );
                }

                if(reqId) {
                    response = this.mapResponseKeys(response, reqId); // replace business keys by the original requested mapped keys, if necessary
                }
                return response;
            }

            if(callback) {
                setTimeout(() => callback(generateSpecificResponse.call(this, reqId)), this.responseTimeSimulation);
            }
            _logger.log(_logger.LOG_SRVC_INOUT, "< DataServiceMock::getValues");
        }

        /**
         * Set the values of the requested parameters to be stored within the business logic.
         * @param {Array<string> | string} keys e.g. a single string or ["VAR_MY_HTML_NAME_S", "CUSTOMER_SURNAME", ...]
         * @param {Array<string> | string} values e.g. a single string or ["cardinsert.html", "Doe", ...]
         * @param {function=} callback is called when the values are set
         */
        setValues(keys, values, callback) {
            _logger.log(_logger.LOG_SRVC_INOUT, `> DataServiceMock::setValues(${keys}, ${values})`);

            keys = Array.isArray(keys) ? keys : [keys];
            values = Array.isArray(values) ? values : [values];

            let uniqueKeys = [];
            let correspondingValues = [];
            let errorMessage;
            if(keys.length !== values.length) {
                errorMessage = "DataServiceMock::setValues(): keys and values do not have the same size.";
            } else {
                let overallKeysLen = 0;
                let overallValuesLen = 0;
                for(let i = 0; i < keys.length; ++i) {
                    let key = keys[i];
                    let value = values[i];
                    if(key !== void 0 && key !== null) {
                        //do NOT use '!keys[i]' because empty string is okay, 0 is okay
                        let mappedKey = this.mapKey(key);
                        if(!uniqueKeys.includes(mappedKey)) {
                            uniqueKeys.push(mappedKey); // do the mapping of the key
                            overallKeysLen += key.length;
                            if(value !== void 0 && value !== null) {
                                // do NOT use '!keys[i]' because empty string is okay, 0 is okay
                                if(typeof value === "object") {
                                    _logger.error(
                                        `Warning: DataServiceMock::setValues value for key: ${mappedKey} is an object, please check EDM code!`
                                    );
                                }
                                value = value.toString();
                                correspondingValues.push(value);
                                overallValuesLen += value.length;
                            } else {
                                errorMessage = "DataServiceMock::setValues() values contains null or undefined.";
                                break;
                            }
                        } else {
                            if(mappedKey !== key) {
                                _logger.error(
                                    `Warning: DataServiceMock::setValues double key detected: ${key} is the same as ${mappedKey}!`
                                );
                            } else {
                                _logger.error(`Warning: DataServiceMock::setValues double key detected: ${key}`);
                            }
                        }
                    } else {
                        errorMessage = "DataServiceMock::setValues() argument keys contains null or undefined.";
                        break;
                    }
                }
                // check for potential argument error
                if(overallKeysLen > MAX_LEN_REQUESTED_KEYS || uniqueKeys.length > MAX_COUNT_REQUESTED_KEYS) {
                    errorMessage = `DataServiceMock::setValues() too many or too long property keys argument requested. Please check your keys array argument. Number of keys argument requested: ${uniqueKeys.length}, string len: ${overallKeysLen}`;
                } else if(overallValuesLen > MAX_LEN_REQUESTED_VALUES) {
                    errorMessage = `DataServiceMock::setValues() too long values argument requested. Please check your values array argument. Number of values argument requested: ${correspondingValues.length}, string len: ${overallValuesLen}`;
                }
            }

            if(errorMessage) {
                _logger.error(errorMessage);
                Wincor.UI.Service.Provider.propagateError("DataService::setValues", this.ERROR_TYPE.REQUEST);
            } else {
                // update data:
                keys = uniqueKeys;
                values = correspondingValues;
                // Note:
                // Business data are context dependent. They are stored like this:
                // CCTAFW_PROP_GENERIC_LIST_SELECTION_JSON_GROUPS: { "*": "", "ReceiptPreferenceMultipleChoiceSelection": {...}}.
                // Whereas a simple view state property like VAR_VOUCHER_VIEWSTATE_S: { "*": "0" } is usually context independent.
                // Because the extended design mode has only a simple business logic simulation the data are
                // stored either view key dependent or independent.
                // To be in the right context several properties are stored view key specific.
                // For example the property "CCTAFW_PROP_GENERIC_LIST_SELECTION_JSON_GROUPS" is a generic property, but the values are context
                // dependent which is a specific view key like "ReceiptPreferenceMultipleChoiceSelection".
                // If the setting would be generic, a getValues call for another context would get the data from a setting before, which would be
                // wrong in such a case.
                // Note:
                // CCTAFW_PROP_CURRENCY[0] is always the same as CCTAFW_PROP_CURRENCY, even that property isn't an index based one!
                // ControlPanel: We will store the property as CCTAFW_PROP_CURRENCY, even the request was CCTAFW_PROP_CURRENCY[0]!
                for(let i = 0; i < keys.length; ++i) {
                    let viewKey = _viewService.viewContext.viewKey;
                    let key = keys[i];
                    if(key in _businessData) {
                        // value exist with the current view key? (in such a case the value has been red with the same view key before)
                        // or store unspecific to allow access view key independent "*"
                        let candidate = _businessData[key][_businessData[key][viewKey] ? viewKey : "*"];
                        // check whether the property is an array, in that case we have to set the zero index
                        if(candidate !== void 0 && !Array.isArray(candidate)) {
                            _businessData[key][_businessData[key][viewKey] ? viewKey : "*"] = values[i];
                        } else {
                            candidate[0] = values[i];
                        }
                        _usedBusinessProperties.set(key, values[i]);
                    } else {
                        // key maybe contain an index with ...[1] which is often the case for indexed based properties or even a JSON attribute access notation
                        // check for something like "CCCHCCDMTAFW_CHEQUE_ACCEPTED[idx] or CCCHCCDMTAFW_CHEQUE_ACCEPTED.id[idx]"
                        // don't accept something like "CCTAFW_PROP_EMV_APPLICATION_SELECTION_LISE_DATA[A,0,2]" which is for LISE concept
                        let parts = this.extractKeyPartsFromProperty(key);
                        if(parts.index !== -1 || parts.attrChain) {
                            key = parts.key;
                            if(key in _businessData) {
                                // value exist with the current view key? (in such a case the value has been red with the same view key before)
                                // or store unspecific to allow access view key independent "*"
                                viewKey = _businessData[key][viewKey] ? viewKey : "*";
                                if(_businessData[key][viewKey]) {
                                    let attrChain = parts.attrChain;
                                    // ControlPanel->properties tab: In order to not store every kind (CCTAFW_PROP_CURRENCY[0], CCTAFW_PROP_CURRENCY[999], see exception below,
                                    // CCTAFW_PROP_CURRENCY.id[0]) of property access we use the plain key name (CCTAFW_PROP_CURRENCY) always, because
                                    // otherwise we can't easily update the list of properties (referencing the same raw value)
                                    // when updated a value using the plain (CCTAFW_PROP_CURRENCY) or any other access (CCTAFW_PROP_CURRENCY[999], etc.) method.
                                    // Otherwise its possible using the original name by uncommenting this line and setting the -name instead of the -key:
                                    // let name = this.buildKeyFromParts(parts);
                                    if(Array.isArray(_businessData[key][viewKey])) {
                                        let index = parts.idx;
                                        if(attrChain) {
                                            // value is expected as JSON
                                            let candidate = _businessData[key][viewKey][index];
                                            _businessData[key][viewKey][index] = this.setValueFromJSON(candidate, attrChain, values[i]);
                                            if(_businessData[key][viewKey][index] !== candidate) {
                                                // do we have successfully updated?
                                                _usedBusinessProperties.set(key, values[i]);
                                            }
                                        } else {
                                            _businessData[key][viewKey][index] = values[i];
                                            // Store also indexed based also, except the [0] key
                                            _usedBusinessProperties.set(parts.idx === 0 ? key : this.buildKeyFromParts(parts), values[i]);
                                        }
                                    } else {
                                        if(attrChain) {
                                            // value is expected as JSON
                                            let candidate = _businessData[key][viewKey];
                                            _businessData[key][viewKey] = this.setValueFromJSON(candidate, attrChain, values[i]);
                                            if(_businessData[key][viewKey] !== candidate) {
                                                // do we have successfully updated?
                                                _usedBusinessProperties.set(key, values[i]);
                                            }
                                        } else {
                                            _businessData[key][viewKey] = values[i];
                                            _usedBusinessProperties.set(key, values[i]);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                this.fireServiceEvent(this.SERVICE_EVENTS.DATA_CHANGED, { keys: keys, values: values });
                _controlPanelService.updateBusinessProperties(_usedBusinessProperties);
            }
            this.callbackCaller(callback);
            _logger.log(_logger.LOG_SRVC_INOUT, "< DataServiceMock::setValues");
        }

        /**
         * Updates the given key array with the corresponding values array.
         * @param {Array<string> | String} keys either an array or a plain string with the property name(s)
         * @param {Array<string>  | String} values either an array or a plain string with the value(s)
         * @param {function=} callback
         */
        updateValues(keys, values, callback) {
            _logger.log(_logger.LOG_SRVC_INOUT, `> DataServiceMock::updateValues(${keys}, ${values})`);
            keys = Array.isArray(keys) ? keys : [keys];
            keys = this.mapKeys(keys);
            // we set the properties before we call the updates
            this.setValues(keys, values, callback);
            if(!Array.isArray(values)) {
                values = [values];
            }
            for(let k = 0; k < keys.length; k++) {
                let key = keys[k];
                for(let i = 0; i < _dataRegistrators.length; i++) {
                    let dataReg = _dataRegistrators[i];
                    let keys = dataReg.keys;
                    for(let j = 0; j < keys.length; j++) {
                        if(keys[j] === key) {
                            _logger.log(
                                _logger.LOG_ANALYSE,
                                `. DataServiceMock::updateValues found property=${key} has been updated with value=${values[k]}`
                            );
                            let result = {}; //build the object
                            if(keys[j] in dataReg.keyMap) {
                                // must replace the business key by the original requested key?
                                result[dataReg.keyMap[keys[j]]] = values[k];
                            } else {
                                result[keys[j]] = values[k];
                            }
                            dataReg.onUpdate(result); //call the callback with the object
                        }
                    }
                }
            }
            _logger.log(_logger.LOG_SRVC_INOUT, "< DataServiceMock::updateValues");
        }

        /**
         * This method is called by the service-provider if an error occurred in any service
         * @eventhandler
         * @param {String} serviceName
         * @param {String} errorType
         */
        onError(serviceName, errorType) {
            _logger.log(_logger.LOG_SRVC_INOUT, `> DataServiceMock::onError(${serviceName}, ${errorType})`);
            _logger.log(_logger.LOG_SRVC_INOUT, "< DataServiceMock::onError");
        }

        /**
         * This will read (again) all data from the JSON files.
         * This was originally done in onSetup, but now moved into a separate function, to be called anytime.
         *
         * @async
         */
        async updateJSONData() {
            _logger.log(_logger.LOG_SRVC_INOUT, "> DataServiceMock::updateJSONData()");
            let [profile, profileExtension] = await this.getToolingProfile();
            _logger.log(_logger.LOG_DATA, `. DataServiceMock::updateJSONData profile=${profile}`);
            const fileUIKeyMap = "../servicedata/UIPropertyKeyMap.json";
            const fileBusinessData = `../servicemocks/mockdata/BusinessData${profileExtension}.json`;
            const fileBusinessDataCustom = "../servicemocks/mockdata/BusinessDataCustom.json";
            const fileBusinessKeys = "../servicedata/BusinessPropertyKeyMap.json";
            const fileBusinessCustomKeys = "../servicedata/BusinessPropertyCustomKeyMap.json";
            try {
                let dataArray = await Promise.all([
                    this.retrieveJSONData(fileBusinessData),
                    this.retrieveJSONData(fileBusinessDataCustom),
                    this.retrieveJSONData(fileBusinessKeys),
                    this.retrieveJSONData(fileBusinessCustomKeys),
                    this.retrieveJSONData(fileUIKeyMap)
                ]);
                delete dataArray[1]["//"]; // remove possible comment
                _businessData = Object.assign(dataArray[0], dataArray[1]); // standard props with custom specific ones
                delete dataArray[3]["//"]; // remove possible comment
                _businessPropKeyMap = Object.assign(dataArray[2], dataArray[3]); // standard keys with custom specific ones
                this.UIPropertyKeys = dataArray[4];
                this.businessData = _businessData;
                _logger.log(_logger.LOG_SRVC_INOUT, "< DataServiceMock::updateJSONData");
            } catch(e) {
                _logger.error(
                    `* importReference error getting ${fileUIKeyMap}, ${fileBusinessData}, ${fileBusinessKeys}, ${fileBusinessDataCustom} or ${fileBusinessCustomKeys}`
                );
                throw e;
            }
        }

        /**
         * See {@link Wincor.UI.Service.BaseServiceMock#onSetup}
         * In addition it will call _updateJSONData_ to read the JSON files.
         *
         * @param {object} message      See {@link Wincor.UI.Service.BaseServiceMock#onSetup}
         * @returns {Promise}
         * @lifecycle service
         */
        onSetup(message) {
            _logger.log(_logger.LOG_SRVC_INOUT, `> DataServiceMock::onSetup('${JSON.stringify(message)}')`);
            return new Promise((resolve, reject) => {
                this.updateJSONData()
                    .then(() => {
                        _logger.log(_logger.LOG_SRVC_INOUT, "< DataServiceMock::onSetup");
                        resolve();
                    })
                    .catch(e => {
                        reject(e);
                    });
            });
        }

        /**
         * @see {@link Wincor.UI.Service.BaseServiceMock#onServicesReady}
         * @async
         * @lifecycle service
         */
        async onServicesReady() {
            _logger.log(_logger.LOG_SRVC_INOUT, "> DataServiceMock::onServicesReady()");
            _controlPanelService = this.serviceProvider.ControlPanelService;
            _configService = this.serviceProvider.ConfigService;
            _viewService = this.serviceProvider.ViewService;
            _viewService.registerForServiceEvent(
                _viewService.SERVICE_EVENTS.VIEW_CLOSING,
                () => {
                    this.cleanDataRegistrations();
                    this.propertyHandler = null;
                },
                true
            );
            _viewService.registerForServiceEvent(_viewService.SERVICE_EVENTS.SHUTDOWN, this.cleanDataRegistrations.bind(this), true);
            await super.onServicesReady();
            _logger.log(_logger.LOG_SRVC_INOUT, "< DataServiceMock::onServicesReady");
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
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> DataServiceMock::setPropertyHandler(...)`);
            let ret = false;
            if(!this.propertyHandler && typeof handlerFx === "function") {
                const handler = handlerFx;
                ret = true;
                this.propertyHandler = (...args) => {
                    try {
                        return handler(...args);
                    } catch(e) {
                        _logger.error(
                            `Error DataServiceMock: propertyHandler: ${handler ? handler.toString() : "<invalid_handler>"
                            } caught ${JSON.stringify(e)}`
                        );
                    }
                };
            } else {
                if(handlerFx == null) {
                    this.propertyHandler = null;
                    _logger.error(`DataServiceMock::setPropertyHandler resetting handlerFx`);
                    ret = true;
                } else if(this.propertyHandler) {
                    _logger.error(`DataServiceMock::setPropertyHandler handler already set!`);
                } else {
                    _logger.error(`DataServiceMock::setPropertyHandler argment is not a function!`);
                }
            }
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `< DataServiceMock::setPropertyHandler returns id <${ret}>`);
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
         * @param {object} message message containing request-data
         * @param {string} message.propertyName contains the propertyName - has to follow the above naming convention
         * @param {string} message.propertyValue will be set to the value of the property, unchanged if not found...
         * @return {string | null} value for internal requests
         */
        getPropertyString(message) {
            const _logger = this.logger;
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `> DataServiceMock::getPropertyString(${JSON.stringify(message)})`);
            let name = message.propertyName || "";
            let value = null;
            let ret;
            // filter probably instance name from prop key
            if(name.startsWith(_configService.configuration.instanceName)) {
                name = name.substr(_configService.configuration.instanceName.length + 1);
            }
            // try to get it from mapping, otherwise try to disassemble directly
            name = this.UIPropertyKeys[name] || name;
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `. after mapping: ${name}`);
            if(!name) {
                _logger.error(
                    "DataServiceMock::getPropertyString argument 'message' is invalid: Expect an object with at least attribute 'propertyName' !"
                );
                return "";
            }
            const prop = { key: name, value: undefined };
            let handled = false;
            if(this.propertyHandler) {
                handled = this.propertyHandler(prop);
            }

            if(handled) {
                // any invalid falsish value is reset to ""
                if(!prop.value) {
                    _logger.LOG_DETAIL &&
                        _logger.log(
                            _logger.LOG_DETAIL,
                            `. DataService::getPropertyString propertyHandler returned invalid value <${prop.value}> resetting to ''`
                        );
                    prop.value = "";
                }
                _logger.LOG_DETAIL &&
                    _logger.log(_logger.LOG_DETAIL, `. DataService::getPropertyString propertyHandler returned <${prop.value}>`);
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
                                _logger.error(`DataServiceMock::getPropertyString exception during attribute evaluation: '${e.message}'`);
                            }
                        }
                        return void 0;
                    }, context);
                }
            }

            if(value !== void 0 && value !== null) {
                message.propertyValue = value.toString();
                ret = this.REQUEST_RESPONSE_OK;
            } else {
                let err = name;
                if(message.propertyName !== name) {
                    err = `${message.propertyName}' aka '${name}`;
                }
                _logger.LOG_DETAIL &&
                    _logger.log(_logger.LOG_DETAIL, `DataServiceMock::getPropertyString attribute could not be found for: '${err}'`);
                ret = "-1";
            }

            if(value !== null && typeof value === "object") {
                try {
                    value = JSON.stringify(value);
                } catch(e) {
                    value = value.toString();
                }
            }

            _logger.LOG_DETAIL &&
                _logger.log(_logger.LOG_DETAIL, `< DataServiceMock::getPropertyString returns ${ret} data: ${JSON.stringify(message)}`);
            return value;
        }
    };
};

/**
 * The DataServiceMock provides access to the JSON based business data file.
 *
 * @function getServiceClass
 * @param {Wincor} Wincor
 * @param {Class} Class
 * @param {BaseService} BaseService
 * @param {ext} ext
 * @param {LogProvider} LogProvider
 * @returns {Wincor.UI.Service.Provider.DataService}
 * @class
 * @since 1.2/00
 */
export default getServiceClass;
