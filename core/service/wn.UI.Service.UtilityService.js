/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ wn.UI.Service.UtilityService.js 4.3.1-210203-21-1b8704b6-1a04bc7d

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

    return class UtilityService extends PTService {
        /**
         * "UtilityService" - the logical name of this service as used in the service-provider
         * @const
         * @type {string}
         */
        NAME = "UtilityService";

        /**
         * @type {Number}
         * @enum
         */
        IMG_FORMAT = {
            /** -1 */
            UNKNOWN: -1,
            /** 0 */
            BMP: 0,
            /** 1 */
            ICO: 1,
            /** 2 */
            JPEG: 2,
            /** 2 */
            JPG: 2,
            /** 3 */
            JNG: 3,
            /** 4 */
            KOALA: 4,
            /** 5 */
            LBM: 5,
            /** 5 */
            IFF: 5,
            /** 6 */
            MNG: 6,
            /** 7 */
            PBM: 7,
            /** 8 */
            PBMRAW: 8,
            /** 9 */
            PCD: 9,
            /** 10 */
            PCX: 10,
            /** 11 */
            PGM: 11,
            /** 12 */
            PGMRAW: 12,
            /** 13 */
            PNG: 13,
            /** 14 */
            PPM: 14,
            /** 15 */
            PPMRAW: 15,
            /** 16 */
            RAS: 16,
            /** 17 */
            TARGA: 17,
            /** 18 */
            TIFF: 18,
            /** 19 */
            WBMP: 19,
            /** 20 */
            PSD: 20,
            /** 21 */
            CUT: 21,
            /** 22 */
            XBM: 22,
            /** 23 */
            XPM: 23,
            /** 24 */
            DDS: 24,
            /** 25 */
            GIF: 25,
            /** 26 */
            HDR: 26
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

        /**
         * The standard working directories for transactions and sessions.
         * @default
         * <br><code>{<br>
         *   TRANSACTION: "/TEMP_TRANSACTION/",<br>
         *   SESSION: "/TEMP_SESSION/"<br>
         * }</code>
         * @enum {String}
         */
        WORKING_DIRS = {
            /** The transaction folder */
            TRANSACTION: "/TEMP_TRANSACTION/",
            /** The session folder */
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
            SESSION_END: "SESSION_END"
        };

        /**
         * See {@link Wincor.UI.Service.PTService#constructor}.
         * Initializes members to their default values
         * @lifecycle service
         */
        constructor(...args) {
            super(...args);
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> UtilityService::UtilityService");
            this.savedFiles = [];
            this.imageStore = `${Wincor.applicationRoot}/WORK/TEMP_TRANSACTION/`;
            this.imageStoreRoot = `${Wincor.applicationRoot}/WORK`; // c:/proflex4/base + /WORK
            this.targetFileType = "bmp";
            this.FRM_RESOLVE_IMG_CONV_REQUEST = Object.assign(this.FRM_RESOLVE_REQUEST);
            this.FRM_RESOLVE_IMG_CONV_REQUEST.FWName = "CCImgCnv";

            this.FRM_ASYNC_RESOLVE_REQUEST.service = this.NAME;
            this.FRM_ASYNC_RESOLVE_REQUEST.FWName = "CCTransactionFW";
            this.PATHS = {};
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< UtilityService::UtilityService");
        }
        
        /**
         * Called automatically as soon as there is an answer to an asynchronous ProTopas request. See {@link Wincor.UI.Service.BaseService#translateResponse}.
         * Translates message object to
         *
         * @param {object} message    Response object, see {@link Wincor.UI.Service.BaseService#translateResponse}.
         * @returns {Number} RC The original return code of the asynchronous function call
         */
        translateResponse(message) {
            let ret;
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> UtilityService::translateResponse('${JSON.stringify(message)}')`);
            if (message.FWName === "CCErrMgrFW") {
                ret = message;
            } else {
                ret = message.RC;
            }
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< UtilityService::translateResponse returns " + ret);
            return ret;
        }

        /**
         * Loads an image into memory of CCImgCnv.dll to prepare manipulation.
         * @param {string} srcFileName
         * @param {string} srcFormat
         * @param {number} flags
         * @returns {Promise}
         */
        imgConvLoadImage(srcFileName, srcFormat, flags) {
            const self = this;
            return ext.Promises.promise(function(resolve, reject) {
                _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> UtilityService::imgConvLoadImage");

                self.FRM_RESOLVE_IMG_CONV_REQUEST.FWName = "CCImgCnv";
                self.FRM_RESOLVE_IMG_CONV_REQUEST.FWFuncID = 3; // CCIMGCNV_FUNC_LOADIMAGE
                self.FRM_RESOLVE_IMG_CONV_REQUEST.param1 = srcFormat;
                self.FRM_RESOLVE_IMG_CONV_REQUEST.meta1 = ["SHORT", 0];
                self.FRM_RESOLVE_IMG_CONV_REQUEST.param2 = srcFileName;
                self.FRM_RESOLVE_IMG_CONV_REQUEST.meta2 = ["CHAR_ANSI", -1];
                self.FRM_RESOLVE_IMG_CONV_REQUEST.param3 = flags;
                self.FRM_RESOLVE_IMG_CONV_REQUEST.meta3 = ["USHORT", 0];
                self.FRM_RESOLVE_IMG_CONV_REQUEST.paramUL = 0;

                _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, `. request to send: '${JSON.stringify(self.FRM_RESOLVE_IMG_CONV_REQUEST)}'.`);
                self.FrmResolve(self.FRM_RESOLVE_IMG_CONV_REQUEST, function(result) {
                    _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< UtilityService::imgConvLoadImage returned " + result);
                    if (result === 0) {
                        resolve();
                    } else {
                        reject("result of UtilityService::imgConvLoadImage was: " + result);
                    }
                });
            });
        }

        /**
         * Unloads an image from memory of CCImgCnv.dll
         * @returns {Promise}
         */
        imgConvUnloadImage() {
            const self = this;
            return ext.Promises.promise(function(resolve, reject) {
                _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> UtilityService::imgConvUnloadImage");

                self.FRM_RESOLVE_IMG_CONV_REQUEST.FWName = "CCImgCnv";
                self.FRM_RESOLVE_IMG_CONV_REQUEST.FWFuncID = 4; // CCIMGCNV_FUNC_UNLOADIMAGE
                self.FRM_RESOLVE_IMG_CONV_REQUEST.param1 = "";
                self.FRM_RESOLVE_IMG_CONV_REQUEST.meta1 = ["NULL", 0];
                self.FRM_RESOLVE_IMG_CONV_REQUEST.param2 = "";
                self.FRM_RESOLVE_IMG_CONV_REQUEST.meta2 = ["NULL", 0];
                self.FRM_RESOLVE_IMG_CONV_REQUEST.param3 = "";
                self.FRM_RESOLVE_IMG_CONV_REQUEST.meta3 = ["NULL", 0];
                self.FRM_RESOLVE_IMG_CONV_REQUEST.paramUL = 0;

                _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, `. request to send: '${JSON.stringify(self.FRM_RESOLVE_IMG_CONV_REQUEST)}'.`);
                self.FrmResolve(self.FRM_RESOLVE_IMG_CONV_REQUEST, function(result) {
                    _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< UtilityService::imgConvUnloadImage returned " + result);
                    if (result === 0) {
                        resolve();
                    } else {
                        reject("result of UtilityService::imgConvUnloadImage was: " + result);
                    }
                });
            });
        }

        /**
         * Saves image to file from memory of CCImgCnv.dll
         * @param {string} targetFileName
         * @param {string} targetFormat
         * @param {number} flags
         * @returns {*}
         */
        imgConvSaveImage(targetFileName, targetFormat, flags) {
            const self = this;
            return ext.Promises.promise(function(resolve, reject) {
                _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> UtilityService::imgConvSaveImage");

                self.FRM_RESOLVE_IMG_CONV_REQUEST.FWFuncID = 5; // CCIMGCNV_FUNC_SAVEIMAGE
                self.FRM_RESOLVE_IMG_CONV_REQUEST.param1 = targetFormat;
                self.FRM_RESOLVE_IMG_CONV_REQUEST.meta1 = ["SHORT", 0];
                self.FRM_RESOLVE_IMG_CONV_REQUEST.param2 = targetFileName;
                self.FRM_RESOLVE_IMG_CONV_REQUEST.meta2 = ["CHAR_ANSI", -1];
                self.FRM_RESOLVE_IMG_CONV_REQUEST.param3 = flags;
                self.FRM_RESOLVE_IMG_CONV_REQUEST.meta3 = ["USHORT", 0];
                self.FRM_RESOLVE_IMG_CONV_REQUEST.paramUL = 0;

                _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, `. request to send: '${JSON.stringify(self.FRM_RESOLVE_IMG_CONV_REQUEST)}'.`);
                self.FrmResolve(self.FRM_RESOLVE_IMG_CONV_REQUEST, function(result) {
                    _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `< UtilityService::imgConvSaveImage returned ${result}`);
                    if (result === 0) {
                        resolve();
                    } else {
                        reject("Result of UtilityService::imgConvSaveImage was: " + result);
                    }
                });
            });
        }

        /**
         * Convenience function used to convert an existing image on file system to a specific format.
         * @param {string} srcFileName
         * @param {string} srcFileFormat
         * @param {string} targetFileName
         * @param {string} targetFileFormat
         */
        convertFileType(srcFileName, srcFileFormat, targetFileName, targetFileFormat) {
            const self = this;
            return ext.Promises.promise(function(resolve, reject) {
                _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> UtilityService::convertFileType(${srcFileName}, ${srcFileFormat}, ${targetFileName}, ${targetFileFormat})`);
                const srcFormat = self.IMG_FORMAT[srcFileFormat.toUpperCase()];
                const targetFormat = self.IMG_FORMAT[targetFileFormat.toUpperCase()];
                const flags = 0;
                if (!srcFormat) {
                    reject("UtilityService::convertFileType srcFileFormat invalid: " + srcFileFormat);
                } else if (targetFormat === void 0) {
                    reject("UtilityService::convertFileType targetFileFormat invalid: " + targetFileFormat);
                } else {
                    // go
                    self.imgConvLoadImage(srcFileName, srcFormat, flags)
                        .then(function() {
                            return self.imgConvSaveImage(targetFileName, targetFormat, flags);
                        })
                        .then(self.imgConvUnloadImage.bind(self))
                        .then(function() {
                            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< UtilityService::convertFileType");
                        })
                        .then(resolve, reject);
                }
            });
        }

        /**
         * Removes the transparent window color of the browser window.
         * @returns {Promise}
         */
        removeTransparentWindowColor() {
            const self = this;
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> UtilityService::removeTransparentWindowColor()");
            return ext.Promises.promise(function(resolve, reject) {
                self.FRM_RESOLVE_REQUEST.FWName = Wincor.UI.Service.Provider.ConfigService.configuration.instanceName;
                self.FRM_RESOLVE_REQUEST.FWFuncID = 4029; // UI method removeTransparency
                self.FRM_RESOLVE_REQUEST.param1 = "";
                self.FRM_RESOLVE_REQUEST.meta1 = ["NULL", 0];
                self.FRM_RESOLVE_REQUEST.param2 = "";
                self.FRM_RESOLVE_REQUEST.meta2 = ["NULL", 0];
                self.FRM_RESOLVE_REQUEST.param3 = "";
                self.FRM_RESOLVE_REQUEST.meta3 = ["NULL", 0];
                self.FRM_RESOLVE_REQUEST.param4 = "";
                self.FRM_RESOLVE_REQUEST.meta4 = ["NULL", 0];
                self.FRM_RESOLVE_REQUEST.paramUL = 0;
                _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, `. request to send: '${JSON.stringify(self.FRM_RESOLVE_REQUEST)}'.`);
                self.FrmResolve(self.FRM_RESOLVE_REQUEST, function(rc) {
                    const success = rc === 0;
                    _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, `. UtilityService::removeTransparentWindowColor result: ${rc}`);
                    _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< UtilityService::removeTransparentWindowColor gets " + (success ? "resolved" : "rejected"));
                    success ? resolve() : reject("UtilityService::removeTransparentWindowColor returned error");
                });
            });
        }

        /**
         * Uses the given color identifier (either in string format (#ffffff) or object {r:0,g:0,b:0} to set the color used for transparency of the browser window)
         * Please mind that this function might not work on any browser used! Please refer to the Operation and User manual for more information.
         * @param {string|object} hashHexColorOrRGB given as "#FFEE33" or object {r:0,g:0,b:0}
         * @param {int} hashHexColorOrRGB.r red value 0-255
         * @param {int} hashHexColorOrRGB.g green value 0-255
         * @param {int} hashHexColorOrRGB.b blue value 0-255
         * @returns {Promise}
         */
        setTransparentWindowColor(hashHexColorOrRGB) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> UtilityService::setTransparentWindowColor(${JSON.stringify(hashHexColorOrRGB)})`);
            function getColorRef(hex) {
                let result;
                let colorRef;
                if (typeof hex === "string") {
                    result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                    result = result
                        ? {
                            r: parseInt(result[1], 16),
                            g: parseInt(result[2], 16),
                            b: parseInt(result[3], 16)
                        }
                        : null;
                } else {
                    result = hex;
                }
                if (result && typeof result.r === "number" && typeof result.g === "number" && typeof result.b === "number") {
                    colorRef = result.r | (result.g << 8) | (result.b << 16);
                }
                return colorRef;
            }

            const self = this;
            const color = getColorRef(hashHexColorOrRGB);
            if (color !== void 0) {
                return ext.Promises.promise(function(resolve, reject) {
                    self.FRM_RESOLVE_REQUEST.FWName = Wincor.UI.Service.Provider.ConfigService.configuration.instanceName;
                    self.FRM_RESOLVE_REQUEST.FWFuncID = 4028; // UI method setTransparency
                    self.FRM_RESOLVE_REQUEST.param1 = color;
                    self.FRM_RESOLVE_REQUEST.meta1 = ["ULONG", 0];
                    self.FRM_RESOLVE_REQUEST.param2 = "";
                    self.FRM_RESOLVE_REQUEST.meta2 = ["NULL", 0];
                    self.FRM_RESOLVE_REQUEST.param3 = "";
                    self.FRM_RESOLVE_REQUEST.meta3 = ["NULL", 0];
                    self.FRM_RESOLVE_REQUEST.param4 = "";
                    self.FRM_RESOLVE_REQUEST.meta4 = ["NULL", 0];
                    self.FRM_RESOLVE_REQUEST.paramUL = 0;
                    _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, `. request to send: '${JSON.stringify(self.FRM_RESOLVE_REQUEST)}'.`);
                    self.FrmResolve(self.FRM_RESOLVE_REQUEST, function(rc) {
                        const success = rc === 0;
                        _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, `. UtilityService::setTransparentWindowColor result: ${JSON.stringify(rc)}`);
                        _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< UtilityService::setTransparentWindowColor gets " + (success ? "resolved" : "rejected"));
                        success ? resolve() : reject("UtilityService::setTransparentWindowColor returned error");
                    });
                });
            }
            return ext.Promises.Promise.reject(`UtilityService::setTransparentWindowColor could not calculate COLORREF - maybe invalid input -> ${JSON.stringify(hashHexColorOrRGB)}`);
        }

        /**
         * Saves image data to the filesystem using native UI component.
         * File format is checked by the native component and call is rejected for invalid / corrupt data.
         * @param {string} fileName Name without extension. If the name starts with a slash, it will be appended to imageStoreRoot (%PROTOPAS_ROOT%/WORK/...) folder and the imageStore config is not used!
         *                 Using this variant, the caller can decide whether to store the image in TEMP_TRANSACTION or TEMP_SESSION (plus subfolders if desired)
         *                 Otherwise the configurable imageStore location is used (defaults to %PROTOPAS_ROOT%/WORK/TEMP_TRANSACTION if not configured in registry).
         *                 Please note: ImageStore locations are only valid within %PROTOPAS_ROOT%/WORK/TEMP_TRANSACTION or %PROTOPAS_ROOT%/WORK/TEMP_SESSION! Subfolders have to be created before usage!
         * @param {string} imageData base64 coded
         * @param {string} srcFileType
         * @param {string=} id
         * @param {string=} targetFileType
         * @param {boolean=} base64Encoded
         * @returns {Promise}
         */
        saveImageToFile(fileName, imageData, srcFileType, id, targetFileType, base64Encoded) {
            const self = this;
            if (base64Encoded === void 0) {
                base64Encoded = true; //default
            }
            targetFileType = targetFileType || this.targetFileType;
            return ext.Promises.promise(function(resolve, reject) {
                _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> UtilityService::saveImageToFile(${fileName},... ,${srcFileType}, ${targetFileType}, ${base64Encoded})`);
                if (fileName.indexOf("..") > -1) {
                    const err = `UtilityService::saveImageToFile: '${fileName}' - Traversing backwards is not allowed for image store!`;
                    _logger.error(err);
                    reject(err);
                    return;
                }

                let srcFileName;
                let targetFileName;

                if (fileName[0] === "/" || fileName[0] === "\\") {
                    srcFileName = self.imageStoreRoot + fileName + "." + srcFileType;
                    targetFileName = self.imageStoreRoot + fileName + "." + targetFileType;
                } else {
                    srcFileName = self.imageStore + fileName + "." + srcFileType;
                    targetFileName = self.imageStore + fileName + "." + targetFileType;
                }

                self.sendRequest(
                    Object.assign({}, Wincor.UI.Gateway.prototype.REQUEST, {
                        service: self.NAME,
                        methodName: "SaveFile",
                        path: srcFileName,
                        content: imageData,
                        isBase64: base64Encoded
                    }),
                    function(result) {
                        if (result !== 0) {
                            reject("UtilityService::saveImageToFile: gui::SaveFile returned error");
                        } else {
                            if (self.savedFiles.indexOf(srcFileName) === -1) {
                                self.savedFiles.push(srcFileName);
                            }
                            if (targetFileType && srcFileType.toLowerCase() === targetFileType.toLowerCase()) {
                                self.PATHS[id] = srcFileName;
                                _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `< UtilityService::saveImageToFile returned: ${result}`);
                                resolve();
                            } else {
                                self.convertFileType(srcFileName, srcFileType, targetFileName, targetFileType)
                                    .then(() => {
                                        if (self.savedFiles.indexOf(targetFileName) === -1) {
                                            self.savedFiles.push(targetFileName);
                                        }
                                        self.PATHS[id] = targetFileName;
                                        _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `< UtilityService::saveImageToFile returned: ${result}`);
                                    })
                                    .then(resolve, reject);
                            }
                        }
                    }
                );
            });
        }

        /**
         * This method runs an action of the transaction components
         * @param {string} action Name of the activity to start
         * @param {Array} args Arguments for this activity as array
         * @returns {Promise} Resolving to rc of the flow
         */
        runAction(action, args = []) {
            var self = this;

            return ext.Promises.promise(function(resolve, reject) {
                function actionCallback(result) {
                    _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, `. | FLOW < ${action}, ${args} returned ${result}`);
                    // decouple removing of this responseMap-entry
                    _logger.log(_logger.LOG_SRVC_INOUT, `< FlowService::runAction returns ${result})`);
                    setTimeout(() => {
                        if (result >= 0) {
                            resolve(result);
                        } else {
                            reject();
                        }
                    }, 1);
                }

                _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> FlowService::runAction(${action}, ${args})`);
                _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, `. | FLOW > ${action}, ${args}`);

                if (typeof action !== "string" || args === void 0) {
                    _logger.error(". | FLOW  ERROR INVALID ARGUMENTS!");
                    reject();
                }

                if (!Array.isArray(args)) {
                    args = [args];
                    _logger.error(`. | FLOW  arguments not given as array - assuming ${args}`);
                }

                self.FRM_ASYNC_RESOLVE_REQUEST.FWFuncID = 8;
                self.FRM_ASYNC_RESOLVE_REQUEST.param1 = `PROFLEX4_UI_UTILITY_SERVICE${" ".repeat(64 - "PROFLEX4_UI_UTILITY_SERVICE".length)}`; //64 bytes                                         ";//64 bytes
                self.FRM_ASYNC_RESOLVE_REQUEST.meta1 = ["CHAR_ANSI", -1];
                self.FRM_ASYNC_RESOLVE_REQUEST.param2 = action;
                self.FRM_ASYNC_RESOLVE_REQUEST.meta2 = ["CHAR_ANSI", -1];
                self.FRM_ASYNC_RESOLVE_REQUEST.param3 = args.join();
                self.FRM_ASYNC_RESOLVE_REQUEST.meta3 = ["CHAR_ANSI", -1];
                self.FRM_ASYNC_RESOLVE_REQUEST.paramUL = 0;
                self.FrmResolve(self.FRM_ASYNC_RESOLVE_REQUEST, actionCallback);
                _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< FlowService::runAction");
            });
        }

        /**
         * Returns an array of [DEVICE_STATE, INSTALL_STATE] values for a given device
         * @param {string} deviceName
         * @async
         */
        async getDeviceState(deviceName) {
            _logger.log(_logger.LOG_SRVC_DATA, `> UtilityService::getDeviceState(${deviceName})`);
            let res = await ext.Promises.promise((resolve, reject) => {
                this.FRM_RESOLVE_REQUEST.FWName = "CCErrMgrFW";
                this.FRM_RESOLVE_REQUEST.FWFuncID = 7; // GetDeviceState
                this.FRM_RESOLVE_REQUEST.param1 = deviceName;
                this.FRM_RESOLVE_REQUEST.meta1 = ["CHAR_ANSI", -1];
                this.FRM_RESOLVE_REQUEST.param2 = -1;
                this.FRM_RESOLVE_REQUEST.meta2 = ["SHORT", 0];
                this.FRM_RESOLVE_REQUEST.param3 = -1;
                this.FRM_RESOLVE_REQUEST.meta3 = ["SHORT", 0];
                this.FRM_RESOLVE_REQUEST.param4 = "";
                this.FRM_RESOLVE_REQUEST.meta4 = ["NULL", 0];
                this.FRM_RESOLVE_REQUEST.paramUL = 0;
                _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, `. request to send: '${JSON.stringify(this.FRM_RESOLVE_REQUEST)}'.`);
                this.FrmResolve(this.FRM_RESOLVE_REQUEST, function(result) {
                    result.RC === 0 ? resolve([result.param2, result.param3]) : reject();
                });
            });
            _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, `< UtilityService::getDeviceState returns: ${res}`);
            return res;
        }
        
        /**
         * This method runs a subFlow of the business logic and returns the result by means of resolving the returned promise
         * @param {string} flowName Arguments for this activity as an array
         * @returns {Promise} Resolving to rc of the flow
         * @async
         */
        async callFlow(flowName) {
            const CALL_SCRIPT = "CALL_SCRIPT";
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> UtilityService::callFlow(${CALL_SCRIPT}, ${flowName})`);
            _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, `. | FLOW > ${CALL_SCRIPT}, ${flowName}`);
            const rc = await this.runAction(CALL_SCRIPT, [flowName]);
            _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, `< UtilityService::callFlow (${CALL_SCRIPT}, ${flowName} returns ${rc}`);
            return rc;
        }

        /**
         * This function is used to delete the images saved to the configured folders when a customer session ends
         * @returns {*|Promise.<T>}
         */
        clearImageStore() {
            const self = this;
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> UtilityService::clearImageStore()");
            if (this.savedFiles.length === 0) {
                _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< UtilityService::clearImageStore store was empty");
                return ext.Promises.Promise.resolve();
            }
            _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, ". processing: " + this.savedFiles);
            return ext.Promises.serializeProcessing(this.savedFiles, function(fileName) {
                return ext.Promises.promise(function(resolve, reject) {
                    self.sendRequest(
                        Object.assign({}, Wincor.UI.Gateway.prototype.REQUEST, {
                            service: self.NAME,
                            methodName: "DeleteFile",
                            path: fileName
                        }),
                        function(result) {
                            // clear paths anyways
                            if (!result) {
                                const reason = "Could not delete one or more of files: " + self.savedFiles;
                                _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `. UtilityService::clearImageStore error: ${reason}`);
                                reject(reason);
                            } else {
                                resolve(result);
                            }
                            self.savedFiles = [];
                            self.PATHS = {};
                        }
                    );
                });
            }).finally(() => {
                _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< UtilityService::clearImageStore");
            });
        }

        /**
         * Adds a filter for tracing private information
         * @param {string|number} filter
         * @return {Promise<number>} error on negative values
         */
        addTraceFilter(filter) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> UtilityService::addTraceFilter()");
            const dataType = typeof filter;
            if (dataType !== "string") {
                // convert to string but write error-log for all others than number data-type
                filter = filter.toString();
                if (dataType !== "number") {
                    this.logger.error(`UtilityService::addTraceFilter() got unsupported argument type [${dataType}]`);
                }
            }
            return ext.Promises.promise(resolve => {
                this.sendRequest(
                    Object.assign({}, Wincor.UI.Gateway.prototype.REQUEST, {
                        service: this.NAME,
                        methodName: "SetFilter",
                        filter: filter
                    }),
                    function(result) {
                        if (result < 0) {
                            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `. UtilityService::addTraceFilter error adding filter`);
                        }
                        // an error may occur if the filter-string is too short, but this should not break the chain
                        resolve(result);
                    }
                );
                _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< UtilityService::addTraceFilter");
            });
        }

        /**
         * Tries to stop the DM campaign
         * @returns {Promise}
         */
        dmStop() {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> UtilityService::dmStop`);

            this.FRM_ASYNC_RESOLVE_REQUEST.FWName = "DMSYNC";
            this.FRM_ASYNC_RESOLVE_REQUEST.FWFuncID = 4005;
            this.FRM_ASYNC_RESOLVE_REQUEST.param1 = "";
            this.FRM_ASYNC_RESOLVE_REQUEST.meta1 = ["NULL", 0];
            this.FRM_ASYNC_RESOLVE_REQUEST.param2 = "";
            this.FRM_ASYNC_RESOLVE_REQUEST.meta2 = ["NULL", 0];
            this.FRM_ASYNC_RESOLVE_REQUEST.param3 = "";
            this.FRM_ASYNC_RESOLVE_REQUEST.meta3 = ["NULL", 0];
            this.FRM_ASYNC_RESOLVE_REQUEST.paramUL = 0;
            return ext.Promises.promise((resolve, reject) => {
                this.FrmResolve(this.FRM_ASYNC_RESOLVE_REQUEST, result => {
                    // check result
                    if (result === 0) {
                        // RC_OK - function has worked successfully
                        _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, `UtilityService::dmStop ... FrmResolve returned ${result}: RC_OK: DM session successfully stopped`);
                        resolve(result);
                    } else if (result === -10) {
                        // RC_IGNORED - no DM session running that can be stopped
                        _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, `UtilityService::dmStop ... FrmResolve returned ${result}: RC_IGNORED: no DM session running that can be stopped`);
                        resolve(result);
                    } else if (result === -1) {
                        // RC_ERROR - internal stop method will be called.
                        // The effects of the stop function should be the same like the positive case without errors
                        _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, `UtilityService::dmStop ... FrmResolve returned ${result}: RC_ERROR: internal stop method will be called`);
                        resolve(result);
                    } else {
                        _logger.LOG_ERROR && _logger.log(_logger.LOG_ERROR, `UtilityService::dmStop ... FrmResolve returned ${result}: unexpected error`);
                        reject(result);
                    }
                });
                this.FRM_ASYNC_RESOLVE_REQUEST.FWName = "CCTransactionFW";
                _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `< UtilityService::dmStop`);
            });
        }

        /**
         * See {@link Wincor.UI.Service.BaseService#onServicesReady}
         * Reads the configuration for Services//UtilityService
         *
         * @async
         * @lifecycle service
         */
        async onServicesReady() {
            const configSvc = Wincor.UI.Service.Provider.ConfigService;
            const eventSvc = Wincor.UI.Service.Provider.EventService;

            eventSvc.whenReady.then(() => {
                const TXN_EVENTS = eventSvc.getEventInfo("TRANSACTION_MODULE");
                eventSvc.registerForEvent(
                    TXN_EVENTS.ID_SESSION_END,
                    TXN_EVENTS.NAME,
                    () => {
                        setTimeout(() => {
                            this.clearImageStore();
                            this.fireServiceEvent(this.SERVICE_EVENTS.SESSION_END, {});
                        }, 1);
                    },
                    void 0,
                    "ASCII",
                    true
                );
            });
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> UtilityService::onServicesReady()");

            const generalSection = `${configSvc.configuration.instanceName}\\Services\\UtilityService`;
            const IMAGE_STORE = "ImageStore";
            const IMAGE_DEFAULT_TARGET_FILE_TYPE = "ImageDefaultTargetFileType";
            const keys = [IMAGE_STORE, IMAGE_DEFAULT_TARGET_FILE_TYPE];

            let result = await configSvc.getConfiguration(generalSection, keys);
            if (result[IMAGE_STORE]) {
                this.imageStore = result[IMAGE_STORE];
                if (this.imageStore[this.imageStore.length - 1] !== "/") {
                    this.imageStore += "/";
                }
            }
            _logger.log(_logger.LOG_ANALYSE, `* UtilityService::onServicesReady(): imageStore=${this.imageStore}`);

            if (result[IMAGE_DEFAULT_TARGET_FILE_TYPE]) {
                this.targetFileType = result[IMAGE_DEFAULT_TARGET_FILE_TYPE];
                if (!(this.targetFileType in this.IMG_FORMAT)) {
                    _logger.error(
                        "* UtilityService::onServicesReady invalid config: ImageDefaultTargetFileType=" +
                        this.targetFileType +
                            " - resetting to 'bmp'\nPlease refer to the documentation of CCImgConv.dll for valid types"
                    );
                    this.targetFileType = "bmp";
                }
            }
            _logger.log(_logger.LOG_ANALYSE, `* UtilityService::onServicesReady(): imageStore=${this.imageStore}`);
             await super.onServicesReady();
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< UtilityService::onServicesReady");
        }
    }
};

/**
 * The class UtilityService has a collection of direct marketing utility functions.
 *
 * @function getServiceClass
 * @param {Wincor} Wincor
 * @param {ext} ext
 * @param {LogProvider} LogProvider
 * @param {PTService} PTService
 * @returns {Wincor.UI.Service.UtilityService}
 * @class
 * @since 1.0/10
 */
export default getServiceClass;
