/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ wn.UI.Service.ConfigService.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

/**
 * @module
 */
const getServiceClass = ({ Wincor, ext, LogProvider, PTService }) => {
    /**
     *
     * @type {Wincor.UI.Diagnostics.LogProvider|*|Wincor.UI.Diagnostics.LogProvider|*}
     * @const
     * @private
     */
    const _logger = LogProvider;

    return class ConfigService extends PTService {
        /**
         * "ConfigService" - the logical name of this service as used in the service-provider
         * @const
         * @type {string}
         */
        NAME = "ConfigService";

        /**
         * Holds the configuration for the ConfigService, currently only the instance name.
         * @property {Object} configuration
         * @property {String} configuration.instanceName the name of the instance e.g. <i>'GUIAPP', 'GUIDM' or 'GUIVIDEO'</i>
         */
        configuration = { instanceName: "" };

        /**
         * @see {@link Wincor.UI.Service.PTService#constructor}.
         *
         * @lifecycle service
         */
        constructor(...args) {
            super(...args);
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> ConfigService::ConfigService");
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< ConfigService::ConfigService");
        }
        
        /**
         * @see {@link Wincor.UI.Service.BaseService#onSetup}
         *
         * Initially, the ConfigService needs the instance name (GUIAPP, GUIDM, ...), because this is needed for further requests.
         *
         * @param {object} message      A configuration object, which constains the instanceName.
         * @lifecycle service
         */
        onSetup(message) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> ConfigService::onSetup('${JSON.stringify(message)}')`);
            this.configuration.instanceName = message.instanceName;
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< ConfigService::onSetup");
            return ext.Promises.Promise.resolve(); // synchronous fulfillment
        }

        /**
         * Gets a configuration from the central config source, e.g. Windows registry.
         *
         * TODO add some examples here, because the DataFW restrictions are a bit hard to explain. This examples should also show the result structure.
         *
         * @param {string} section                  Name e.g. "GUIAPP\\Services\\Timeouts"
         * @param {Array<string> | string} keys     E.g. ["DEFAULT_PAGE_TIMEOUT", "DEFAULT_INPUT_TIMEOUT", ...] or null for requesting the whole section
         * @param {function=} callback              Callback function, which receives the result. See {@link Wincor.UI.Service.ConfigService#translateResponse} for the result structure.
         */
        getConfiguration(section, keys, callback) {

            keys = Array.isArray(keys) ? keys : [keys];

            let path;
            if (section.startsWith(this.configuration.instanceName)) { //it starts with GUIAPP or GUIDM
                if (keys[0] === null) {
                    path = `CCOPEN\\GUI\\${section}`;
                } else {
                    path = `.\\CCOPEN\\GUI\\${section}`;
                }
            } else { // it starts with some other section
                if (keys[0] === null) { // a whole section is requested ?
                    path = section; // we assume it's something located under ProTopas/CurrentVersion directly here - whole section reading works only under "\ProTopas\"
                } else if(!section.startsWith("\\")) {
                    path = `.\\${section}`;
                } else { // We have a single parameter key name here.
                    // Because the DataFW has the limitation that requesting a section outside of "\ProTopas" only works for single parameter not for the whole section
                    path = section;
                }
            }

            this.FRM_RESOLVE_REQUEST.service = this.NAME;
            this.FRM_RESOLVE_REQUEST.FWName = "CCDataFW";

            this.FRM_RESOLVE_REQUEST.FWFuncID = 7;  //CCDATAFW_FUNC_GET_STRING
            this.FRM_RESOLVE_REQUEST.param1 = path;
            if (keys[0] !== null) {
                this.FRM_RESOLVE_REQUEST.param2 = keys;
            } else {
                this.FRM_RESOLVE_REQUEST.param2 = [];
            }
            this.FRM_RESOLVE_REQUEST.param3 = [];

            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `ConfigService::getConfiguration() Request to send: '${JSON.stringify(this.FRM_RESOLVE_REQUEST)}'.`);
            this.FrmResolve(this.FRM_RESOLVE_REQUEST, callback);
        }

        /**
         * Called automatically as soon as there is an answer to an asynchronous ProTopas request. See {@link Wincor.UI.Service.BaseService#translateResponse}.
         * The returend object depends wether a single key or a complete section was requested.
         *
         * @param {object} message    Response object, see {@link Wincor.UI.Service.BaseService#translateResponse}.
         * @returns {object}        A JSON object:
         *                          Each object parameter will be one of the requested keys/section.
         *                          Each value will be either a string (if exactly one parameter was requested) or a JSON object (if a complete section was requested).
         */
        translateResponse(message) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> ConfigService::translateResponse('${JSON.stringify(message)}')`);
            const response = {};
            if (message.FWFuncID === 7 && message.RC === 0) {
                //
                //  message.param2 has the keys,   i.e. [key1,   key2,   ...]
                //  message.param3 has the values, i.e. [value1, value2, ...]

                //  response will be an object:
                //  response["key1"] = value1
                //  response["key2"] = value2
                //  ...

                for (let i in message.param2) {
                    if (message.param2.hasOwnProperty(i)) {
                        let myKey = message.param2[i].toString();

                        try {
                            // try to copy a JSON object
                            response[myKey] = JSON.parse(message.param3[i]);
                        }
                        catch (e) {
                            // copy the string value
                            response[myKey] = message.param3[i];
                        }
                    }
                }
            } else {
                _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `Wincor.UI.Service.ConfigService(onResponse): message with FWFuncID '${message.FWFuncID}' and RC = '${message.RC}' will not be evaluated.`);
            }
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `< ConfigService::translateResponse returns ${JSON.stringify(response)}`);
            return response;
        }
    }
};

/**
 * The class ConfigService supports reading configuration parameters from the Registry (via the DataFW).
 *
 * @function getServiceClass
 * @param {Wincor} Wincor
 * @param {ext} ext
 * @param {LogProvider} LogProvider
 * @param {PTService} PTService
 * @returns {Wincor.UI.Service.ConfigService}
 * @class
 * @since 1.0/10
 */
export default getServiceClass;