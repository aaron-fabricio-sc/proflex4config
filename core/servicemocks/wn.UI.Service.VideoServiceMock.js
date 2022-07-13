/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ wn.UI.Service.VideoServiceMock.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

/**
 * @module
 */
const getServiceClass = ({ BaseService, ext, LogProvider }) => {

    /**
     *
     * @type {Wincor.UI.Diagnostics.LogProvider|*|Wincor.UI.Diagnostics.LogProvider|*}
     * @const
     * @private
     */
    const _logger = LogProvider;

    return class VideoServiceMock extends BaseService {

        /**
         * The logical name of this service as used in the service-provider
         * @const
         * @type {string}
         * @default "VideoService"
         */
        NAME = "VideoService";
    
        /**
         * See {@link Wincor.UI.Service.BaseServiceMock#constructor}.
         * @lifecycle service
         */
        constructor(...args) {
            super(...args);
            _logger.log(_logger.LOG_SRVC_INOUT, "> VideoServiceMock::VideoServiceMock");
            _logger.log(_logger.LOG_SRVC_INOUT, "< VideoServiceMock::VideoServiceMock");
        }
        
        /**
         * This method is called by the {@link Wincor.UI.Service.Provider#propagateError} if an error occurred in any service. It logs the error to the console.
         *
         *
         * @param {String} serviceName  The name of this service.
         * @param {String} errorType    As defined in {@link Wincor.UI.Service.BaseService#ERROR_TYPE}.
         */
        onError(serviceName, errorType) {
            _logger.log(_logger.LOG_SRVC_INOUT, `> VideoServiceMock::onError(${serviceName}, ${errorType})`);
            _logger.log(_logger.LOG_SRVC_INOUT, "< VideoServiceMock::onError");
        }

        /**
         * This method does nothing in moment.
         *
         * @param {number} step             in %, Range: [1-100], Default: 10 (10%)
         * @param {function=} callback      Reference to a function receiving the return code as a parameter.
         */
        increaseVolume(step, callback) {
            _logger.log(_logger.LOG_SRVC_INOUT, `> VideoService::increaseVolume(step:${step}, ...)`);
            _logger.log(_logger.LOG_SRVC_INOUT, "< VideoService::increaseVolume");
        }

        /**
         * This method does nothing in moment.
         *
         * @param {number} step             in %, Range: [1-100], Default: 10 (10%)
         * @param {function=} callback      Reference to a function receiving the return code as a parameter.
         */
        decreaseVolume(step, callback) {
            _logger.log(_logger.LOG_SRVC_INOUT, `> VideoService::decreaseVolume(step:${step}, ...)`);
            _logger.log(_logger.LOG_SRVC_INOUT, "< VideoService::decreaseVolume");
        }

        /**
         * This method does nothing in moment.
         *
         * @param {function=} callback      Reference to a function receiving the return code as a parameter.
         */
        mute(callback) {
            _logger.log(_logger.LOG_SRVC_INOUT, "> VideoService::mute(...)");
            _logger.log(_logger.LOG_SRVC_INOUT, "< VideoService::mute");
        }

        /**
         * This method does nothing in moment.
         *
         * @param {function=} callback      Reference to a function receiving the return code as a parameter.
         */
        unmute(callback) {
            _logger.log(_logger.LOG_SRVC_INOUT, "> VideoService::unmute(...)");
            _logger.log(_logger.LOG_SRVC_INOUT, "< VideoService::unmute");
        }

        /**
         * See {@link Wincor.UI.Service.BaseServiceMock#onSetup}
         *
         * @param {object} message      See {@link Wincor.UI.Service.BaseServiceMock#onSetup}
         * @returns {Promise}
         * @lifecycle service
         */
        onSetup(message) {
            _logger.log(_logger.LOG_SRVC_INOUT, `> VideoServiceMock::onSetup('${JSON.stringify(message)}')`);
            return ext.Promises.promise(function(resolve, reject) {
                resolve();
                _logger.log(_logger.LOG_SRVC_INOUT, "< VideoServiceMock::onSetup");
            }.bind(this));
        }

        /**
         * See {@link Wincor.UI.Service.BaseServiceMock#onServicesReady}
         * @async
         * @lifecycle service
         */
        async onServicesReady() {
            _logger.log(_logger.LOG_SRVC_INOUT, "> VideoServiceMock::onServicesReady()");
            await super.onServicesReady();
            _logger.log(_logger.LOG_SRVC_INOUT, "< VideoServiceMock::onServicesReady");
        }
    }
};

/**
 * The VideoServiceMock simulates the video service.
 *
 * @function getServiceClass
 * @param {Class} Class
 * @param {BaseService} BaseService
 * @param {ext} ext
 * @param {LogProvider} LogProvider
 * @returns {Wincor.UI.Service.Provider.VideoService}
 * @class
 * @since 2.0/12
 */
export default getServiceClass;
