/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ wn.UI.Service.UtilityServiceMock.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

/**
 * @module
 */
const getServiceClass = ({BaseService, ext, LogProvider }) => {

    /**
     *
     * @type {Wincor.UI.Diagnostics.LogProvider|*|Wincor.UI.Diagnostics.LogProvider|*}
     * @private
     */
    const _logger = LogProvider;

    return class UtilityServiceMock extends BaseService {

        /**
         * "UtilityService" - the logical name of this service as used in the service-provider
         * @const
         * @type {string}
         */
        NAME = "UtilityService";

        IMG_FORMAT = {
            "UNKNOWN": -1,
            "BMP": 0,
            "ICO": 1,
            "JPEG": 2,
            "JPG": 2,
            "JNG": 3,
            "KOALA": 4,
            "LBM": 5,
            "IFF": 5,
            "MNG": 6,
            "PBM": 7,
            "PBMRAW": 8,
            "PCD": 9,
            "PCX": 10,
            "PGM": 11,
            "PGMRAW": 12,
            "PNG": 13,
            "PPM": 14,
            "PPMRAW": 15,
            "RAS": 16,
            "TARGA": 17,
            "TIFF": 18,
            "WBMP": 19,
            "PSD": 20,
            "CUT": 21,
            "XBM": 22,
            "XPM": 23,
            "DDS": 24,
            "GIF": 25,
            "HDR": 26
        };

        DEVICE_STATE = {
            UNDEFINED: 0,
            OPERATIONAL: 1,
            NOT_OPERATIONAL: 2,
            NOT_INSTALLED: 3,
            DEACTIVATED: 6,
            NOT_OPERATIONAL_DEACTIVATED: 7
        };

        INSTALL_STATE = {
            NOT_INSTALLED: 0,
            OPTIONAL: 1,
            MANDATORY: 2
        };
        
        WORKING_DIRS = {
            TRANSACTION: "/TEMP_TRANSACTION/",
            SESSION: "/TEMP_SESSION/"
        };

        /**
         * This object contains all utility-service events, for which other services or view-models can register itself.
         * @enum {string}
         */
        SERVICE_EVENTS = {
            /**
             * Sent if the business logic informs about a customer session has ended.
             * @event Wincor.UI.Service.UtilityService#SERVICE_EVENTS:SESSION_END
             * @eventtype service
             */
            SESSION_END: "SESSION_END",
        };

        /**
         * See {@link Wincor.UI.Service.BaseServiceMock#constructor}.
         * Initializes members
         * @lifecycle service
         */
        constructor(...args) {
            super(...args); // Invoke superclass's initialize
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> UtilityServiceMock::UtilityServiceMock");
            this.savedFiles = [];
            this.imageStore = "./WORK/TEMP_TRANSACTION/";
            this.imageStoreRoot = "./WORK";
            this.targetFileType = "bmp";
            this.PATHS = {};
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< UtilityServiceMock::UtilityServiceMock");
        }
        
        /**
         * Loads image to memory of CCImgCnv.dll to prepare manipulation
         * @param {string} srcFileName
         * @param {string} srcFormat
         * @param {number} flags
         * @returns {Promise}
         */
        loadImage(srcFileName, srcFormat, flags) {
            let result = 0;
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> UtilityServiceMock::loadImage");
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `< UtilityServiceMock::loadImage returned ${result}`);
            return ext.Promises.Promise.resolve();
        }

        /**
         * Unloads image from memory of CCImgCnv.dll
         * @returns {Promise}
         */
        unloadImage() {
            let result = 0;
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> UtilityServiceMock::unloadImage");
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `< UtilityServiceMock::unloadImage returned ${result}`);
            return ext.Promises.Promise.resolve();
        }

        /**
         * Save image to file from memory of CCImgCnv.dll
         * @param {string} targetFileName
         * @param {string} targetFormat
         * @param {number} flags
         * @returns {*}
         */
        saveImage(targetFileName, targetFormat, flags) {
            let result = 0;
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> UtilityServiceMock::saveImage");
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `< UtilityServiceMock::saveImage returned ${result}`);
            return ext.Promises.Promise.resolve();
        }

        /**
         * Convenience function used to convert an existing image on file system to a specific format
         * @param {string} srcFileName
         * @param {string} srcFileFormat
         * @param {string} targetFileName
         * @param {string} targetFileFormat
         */
        convertFileType(srcFileName, srcFileFormat, targetFileName, targetFileFormat) {
            let self = this;
            return ext.Promises.promise(function(resolve, reject) {
                _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> UtilityServiceMock::convertFileType(${srcFileName}, ${srcFileFormat}, ${targetFileName}, ${targetFileFormat})`);
                let srcFormat = self.IMG_FORMAT[srcFileFormat.toUpperCase()];
                let targetFormat = self.IMG_FORMAT[targetFileFormat.toUpperCase()];
                let flags = 0;
                if (!srcFormat) {
                    reject("srcFileFormat invalid: " + srcFileFormat);
                } else if (!targetFormat) {
                    reject("targetFileFormat invalid: " + targetFileFormat);
                } else {
                    // go
                    self.loadImage(srcFileName, srcFormat, flags)
                        .then(function() {
                            return self.saveImage(targetFileName, targetFormat, flags);
                        })
                        .then(self.unloadImage.bind(self))
                        .then(function() {
                            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< UtilityServiceMock::convertFileType");
                        })
                        .then(resolve);
                }
            });
        }

        /**
         * This function does not work in extended design mode
         * @returns {Promise}
         */
        removeTransparentWindowColor() {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> UtilityServiceMock::removeTransparentWindowColor()");
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< UtilityServiceMock::removeTransparentWindowColor");
            return ext.Promises.Promise.resolve();
        }

        /**
         * This function does not work in extended design mode
         * @returns {Promise}
         */
        setTransparentWindowColor() {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> UtilityServiceMock::removeTransparentWindowColor()");
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< UtilityServiceMock::removeTransparentWindowColor");
            return ext.Promises.Promise.resolve();
        }

        /**
         * Saves image data to the filesystem using native UI component.
         * @param {string} fileName Name without extension
         * @param {string} imageData base64 coded
         * @param {string} srcFileType
         * @param {string=} id
         * @param {string=} targetFileType
         * @param {boolean=} base64Encoded
         * @returns {Promise}
         */
        saveImageToFile(fileName, imageData, srcFileType, id, targetFileType, base64Encoded) {
            let result = 0;
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> UtilityServiceMock::saveImageToFile(${fileName},... ,${srcFileType},${id}, ${targetFileType}, ${base64Encoded})`);
            let srcFileName;
            let targetFileName;

            if (fileName[0] === "/" || fileName[0] === "\\") {
                srcFileName = this.imageStoreRoot + fileName + "." + srcFileType;
                targetFileName = this.imageStoreRoot + fileName + "." + targetFileType;
            } else {
                srcFileName = this.imageStore + fileName + "." + srcFileType;
                targetFileName = this.imageStore + fileName + "." + targetFileType;
            }

            this.PATHS[id] = targetFileType ? targetFileName : srcFileName;

            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `< UtilityServiceMock::saveImageToFile src:<${srcFileName}> target:<${targetFileName}> returned: ${result}`);
            return ext.Promises.Promise.resolve();
        }

        /**
         * This method runs a subFlow of the business logic and returns the result by means of resolving the returned promise
         * @param {string} flowName Arguments for this activity as array
         * @returns {Promise} Resolving to rc of the flow
         */
        callFlow (flowName) {
            let result = 0;
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> UtilityServiceMock::callFlow(${flowName})`);

            return ext.Promises.Promise.resolve(result).delay(5000)
                .then(()=>{_logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, `< UtilityServiceMock::callFlow (${flowName} returned ${result}`);});
        }

        /**
         * This function is used to delete the images after a customer session
         * @returns {*|Promise.<T>}
         */
        clearImageStore() {
            let result = 0;
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> UtilityServiceMock::clearImageStore()");
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `< UtilityServiceMock::clearImageStore returned: ${result}`);
            return ext.Promises.Promise.resolve();
        }

        /**
         * Adds a filter for tracing private information (mock does nothing...)
         * @param {string|number} filter
         * @return {Promise<number>} error on negative values
         */
        addTraceFilter(filter) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> UtilityServiceMock::addTraceFilter()");
            const dataType = typeof filter;
            if (dataType !== "string") {
                // convert to string but write error-log for all others than number data-type
                if (dataType !== "number") {
                    this.logger.error(`UtilityServiceMock::addTraceFilter() got unsupported argument type [${dataType}]`);
                }
            }
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< UtilityServiceMock::addTraceFilter");
            return ext.Promises.Promise.resolve(0);
        }

        /**
         * Tries to stop the DM campaign
         * @returns {Promise}
         */
        dmStop() {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> UtilityServiceMock::dmStop`);
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `< UtilityServiceMock::dmStop`);
            return ext.Promises.Promise.resolve(0);
        }

        /**
         * Returns an array of [DEVICE_STATE, INSTALL_STATE] values for a given device
         * @param {string} deviceName
         */
        async getDeviceState(deviceName) {
            _logger.log(_logger.LOG_SRVC_DATA, `> UtilityServiceMock::getDeviceState(${deviceName})`);
            _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, `< UtilityServiceMock::getDeviceState returns [1, 1]`);
            return [1, 1];
        }
    }
};

/**
 * The UtilityService simulates several general methods as the real UtilityService does.
 *
 * @function getServiceClass
 * @param {Class} Class
 * @param {BaseService} BaseService
 * @param {ext} ext
 * @param {LogProvider} LogProvider
 * @returns {Wincor.UI.Service.Provider.UtilityService}
 * @class
 * @since 1.2/00
 */
export default getServiceClass;
