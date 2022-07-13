/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ wn.UI.Service.ConfigServiceMock.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

/**
 * @module
 */
const getServiceClass = ({ BaseService, ext }) => {

    let _configData = {};

    return class ConfigServiceMock extends BaseService {
        /**
         * "ConfigServiceMock" - the logical name of this service as used in the service-provider
         * @const
         * @type {string}
         */
        NAME = 'ConfigService';

        /**
         * Holds the configuration for the ConfigService, currently only the instance name.
         * @property {Object} configuration
         * @property {String} configuration.instanceName the name of the instance e.g. <i>'GUIAPP', 'GUIDM' or 'GUIVIDEO'</i>
         */
        configuration = { instanceName: '' };

        /**
         * @see {@link Wincor.UI.Service.BaseServiceMock#constructor}.
         * @lifecycle service
         */
        constructor(...args) {
            super(...args);
            this.logger.log(this.logger.LOG_SRVC_INOUT, '> ConfigServiceMock::ConfigServiceMock');
            this.logger.log(this.logger.LOG_SRVC_INOUT, '< ConfigServiceMock::ConfigServiceMock');
        }
        
        /**
         * This method is called by the {@link Wincor.UI.Service.Provider#propagateError} if an error occurred in any service. It logs the error to the console.
         *
         *
         * @param {String} serviceName  The name of this service.
         * @param {String} errorType    As defined in {@link Wincor.UI.Service.BaseService#ERROR_TYPE}.
         */
        onError(serviceName, errorType) {
            this.logger.log(this.logger.LOG_SRVC_INOUT, `> ConfigServiceMock::onError(${serviceName}, ${errorType})`);
            this.logger.log(this.logger.LOG_SRVC_INOUT, '< ConfigServiceMock::onError');
        }

        /**
         * Gets a configuration from the central config source, e.g. Windows registry.
         *
         * For examples see also {@link Wincor.UI.Service.ConfigService#getConfiguration}.
         *
         * @param {string} section                  Name e.g. "GUIAPP\\Services\\Timeouts"
         * @param {Array<string> | string} keyArray E.g. ["DEFAULT_PAGE_TIMEOUT", "DEFAULT_INPUT_TIMEOUT", ...] or null for requesting the whole section
         * @param {function=} callback              Callback function, which receives the result. See {@link Wincor.UI.Service.ConfigService#translateResponse} for the result structure.
         */
        getConfiguration(section, keyArray, callback) {
            this.logger.log(this.logger.LOG_SRVC_INOUT, `> ConfigServiceMock::getConfiguration(${section})`);
            if (callback) {
                setTimeout(() => {
                    const result = {};
                    const path = section.split('\\');
                    let ref;

                    if (section === '') {
                        ref = _configData;
                    }

                    ref =
                        ref ||
                        path.reduce((last, act) => {
                            return last ? last[act] : null;
                        }, _configData);

                    if (ref) {
                        keyArray = keyArray || Object.keys(ref);
                        keyArray.forEach((key) => {
                            result[key] = typeof ref[key] !== 'undefined' ? ref[key] : null;
                        });
                    }
                    callback(result);
                }, this.responseTimeSimulation);
            }
            this.logger.log(this.logger.LOG_SRVC_INOUT, '< ConfigServiceMock::getConfiguration');
        }

        /**
         * Reads 'UIConfig.json' and 'UIConfigCustom.json', to have the initial "Registry" parameters for the following getConfiguration() calls.
         * @param {object} message      Not used by this service.
         * @async
         * @lifecycle service
         * @see {@link Wincor.UI.Service.BaseServiceMock#onSetup}
         */
        async onSetup(message) {
            this.logger.log(this.logger.LOG_SRVC_INOUT, `> ConfigServiceMock::onSetup('${JSON.stringify(message)}')`);
            const fileUIConfig = '../servicemocks/mockdata/UIConfig.json';
            const fileUIConfigCustom = '../servicemocks/mockdata/UIConfigCustom.json';
            try {
                if (message && message.instanceName) {
                    this.configuration.instanceName = message.instanceName;
                }
                let dataArray = await ext.Promises.Promise.all([
                    this.retrieveJSONData(fileUIConfig),
                    this.retrieveJSONData(fileUIConfigCustom)
                ]);
                delete dataArray[1]['//']; // remove possible comment
                // we need deep merge here, therefore using jquery instead of Object.assign
                _configData = jQuery.extend(true, {}, dataArray[0], dataArray[1]); // standard props with custom specific ones
                this.logger.log(this.logger.LOG_SRVC_INOUT, '< ConfigServiceMock::onSetup');
            } catch (e) {
                console.error(`* importReference error getting ${fileUIConfig} or ${fileUIConfigCustom}`);
                throw `* importReference error getting ${fileUIConfig} or ${fileUIConfigCustom} error: ${e}`;
            }
        }

        /**
         * @see {@link Wincor.UI.Service.BaseServiceMock#onServicesReady}
         * @async
         * @lifecycle service
         */
        async onServicesReady() {
            this.logger.log(this.logger.LOG_SRVC_INOUT, '> ConfigServiceMock::onServicesReady()');
            await super.onServicesReady();
            this.logger.log(this.logger.LOG_SRVC_INOUT, '< ConfigServiceMock::onServicesReady');
        }
    }
};

/**
 * The ConfigServiceMock provides access to the JSON based configuration.
 *
 * @function getServiceClass
 * @param {Class} Class
 * @param {BaseService} BaseService
 * @param {ext} ext
 * @returns {Wincor.UI.Service.Provider.ConfigService}
 * @class
 * @since 1.2/00
 */
export default getServiceClass;
