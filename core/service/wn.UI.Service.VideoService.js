/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ wn.UI.Service.VideoService.js 4.3.1-210203-21-1b8704b6-1a04bc7d

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

    return class VideoService extends PTService {
        /**
         * The logical name of this service as used in the service-provider
         * @const
         * @type {string}
         * @default "VideoService"
         */
        NAME = "VideoService";

        /**
         * See {@link Wincor.UI.Service.PTService#constructor}.
         * Initialize some private members.
         *
         * @lifecycle service
         */
        constructor(...args) {
            super(...args);
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> VideoService::VideoService");

            this.FRM_RESOLVE_REQUEST.service = this.NAME;
            this.FRM_RESOLVE_REQUEST.FWName = "VIDEO";
            this.initialLocation = {
                top: 0,
                left: 0,
                width: 1024,
                height: 768,
            };
            this.baseLocation = Object.assign({}, this.initialLocation);
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< VideoService::VideoService");
        }
        
        /**
         * Called automatically as soon as there is an answer to an asynchronous ProTopas request. See {@link Wincor.UI.Service.BaseService#translateResponse}.
         * This method retruns return code (RC) of supported function ID's, else (-1)
         *
         * @param {object} message    Response object, see {@link Wincor.UI.Service.BaseService#translateResponse}.
         * @returns {number} ret      Return code (RC) of supported function ID's, else (-1).
         */
        translateResponse(message) {
            _logger.LOG_SRVC_INOUT &&
                _logger.log(_logger.LOG_SRVC_INOUT, `> VideoService::translateResponse('${JSON.stringify(message)}')`);
            let ret;

            if (message.FWFuncID === 4032) {
                //FUNC_VOLUME_INC
                ret = message.RC;
            } else if (message.FWFuncID === 4033) {
                //FUNC_VOLUME_DEC
                ret = message.RC;
            } else if (message.FWFuncID === 4035) {
                //FUNC_VOLUME_MUTE
                ret = message.RC;
            } else if (message.FWFuncID === 4036) {
                //FUNC_VOLUME_UNMUTE
                ret = message.RC;
            } else if (message.FWFuncID === 4022) {
                //FUNC_MOVE
                ret = message.RC;
            } else {
                _logger.error("Wincor.UI.Service.VideoService(onResponse): unknown function");
                ret = -1;
            }
            _logger.LOG_SRVC_INOUT &&
                _logger.log(_logger.LOG_SRVC_INOUT, `< VideoService::translateResponse returns ${ret}`);
            return ret;
        }

        /**
         * This method resize/reposition the video window.
         *
         * @param {object} posObject        containing attributes top, left, width and height with values of type number
         */
        resizeWindow(posObject) {
            return ext.Promises.promise((resolve, reject) => {
                _logger.LOG_SRVC_INOUT &&
                    _logger.log(_logger.LOG_SRVC_INOUT, `> VideoService::resizeWindow(${JSON.stringify(posObject)})`);
                const REQUEST = Object.assign({}, this.FRM_RESOLVE_REQUEST);
                REQUEST.FWFuncID = 4022; // Video method contMove
                REQUEST.param1 = posObject.left;
                REQUEST.meta1 = ["LONG", 0];
                REQUEST.param2 = posObject.top;
                REQUEST.meta2 = ["LONG", 0];
                REQUEST.param3 = posObject.width;
                REQUEST.meta3 = ["LONG", 0];
                REQUEST.param4 = posObject.height;
                REQUEST.meta4 = ["LONG", 0];
                REQUEST.paramUL = 0;
                _logger.LOG_ANALYSE &&
                    _logger.log(
                        _logger.LOG_ANALYSE,
                        `. request to send: '${JSON.stringify(this.FRM_RESOLVE_REQUEST)}'.`
                    );
                this.FrmResolve(REQUEST, (message) => {
                    const success = message.RC === 0;
                    _logger.LOG_DETAIL &&
                        _logger.log(_logger.LOG_DETAIL, `* VideoService::resizeWindow callback success: ${success}`);
                    _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< VideoService::resizeWindow");
                    if (success) {
                        this.baseLocation = Object.assign({}, posObject);
                    }
                    success ? resolve() : reject();
                });
            });
        }

        /**
         * This method increase Volume by %.
         *
         * @param {number=} step            Increase step in %, Range: [1-100], Default: 10 (10%)
         * @param {function=} callback      Reference to a function receiving the return code as a parameter.
         */
        increaseVolume(step, callback) {
            _logger.LOG_SRVC_INOUT &&
                _logger.log(_logger.LOG_SRVC_INOUT, `> VideoService::increaseVolume(step:${step}, ...)`);

            let usStep = 10; // VOLUME_INC_STEP_DEF
            if (step) {
                usStep = step;
            }

            this.FRM_RESOLVE_REQUEST.FWFuncID = 4032; // FUNC_VOLUME_INC
            this.FRM_RESOLVE_REQUEST.param1 = usStep;
            this.FRM_RESOLVE_REQUEST.meta1 = ["USHORT", 0];
            this.FRM_RESOLVE_REQUEST.param2 = "";
            this.FRM_RESOLVE_REQUEST.meta2 = ["NULL", 0];
            this.FRM_RESOLVE_REQUEST.param3 = "";
            this.FRM_RESOLVE_REQUEST.meta3 = ["NULL", 0];
            this.FRM_RESOLVE_REQUEST.param4 = "";
            this.FRM_RESOLVE_REQUEST.meta4 = ["NULL", 0];
            this.FRM_RESOLVE_REQUEST.param5 = "";
            this.FRM_RESOLVE_REQUEST.meta5 = ["NULL", 0];
            this.FRM_RESOLVE_REQUEST.paramUL = 0;

            _logger.LOG_SRVC_DATA &&
                _logger.log(_logger.LOG_SRVC_DATA, `. request to send: '${JSON.stringify(this.FRM_RESOLVE_REQUEST)}'.`);
            this.FrmResolve(this.FRM_RESOLVE_REQUEST, callback);

            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< VideoService::increaseVolume");
        }

        /**
         * This method decrease Volume by %.
         *
         * @param {number=} step            Decrease step in %, Range: [1-100], Default: 10 (10%)
         * @param {function=} callback      Reference to a function receiving the return code as a parameter.
         */
        decreaseVolume(step, callback) {
            _logger.LOG_SRVC_INOUT &&
                _logger.log(_logger.LOG_SRVC_INOUT, `> VideoService::decreaseVolume(step:${step}, ...)`);

            let usStep = 10; // VOLUME_DEC_STEP_DEF
            if (step) {
                usStep = step;
            }

            this.FRM_RESOLVE_REQUEST.FWFuncID = 4033; // FUNC_VOLUME_DEC
            this.FRM_RESOLVE_REQUEST.param1 = usStep;
            this.FRM_RESOLVE_REQUEST.meta1 = ["USHORT", 0];
            this.FRM_RESOLVE_REQUEST.param2 = "";
            this.FRM_RESOLVE_REQUEST.meta2 = ["NULL", 0];
            this.FRM_RESOLVE_REQUEST.param3 = "";
            this.FRM_RESOLVE_REQUEST.meta3 = ["NULL", 0];
            this.FRM_RESOLVE_REQUEST.param4 = "";
            this.FRM_RESOLVE_REQUEST.meta4 = ["NULL", 0];
            this.FRM_RESOLVE_REQUEST.param5 = "";
            this.FRM_RESOLVE_REQUEST.meta5 = ["NULL", 0];
            this.FRM_RESOLVE_REQUEST.paramUL = 0;

            _logger.LOG_SRVC_DATA &&
                _logger.log(_logger.LOG_SRVC_DATA, `. request to send: '${JSON.stringify(this.FRM_RESOLVE_REQUEST)}'.`);
            this.FrmResolve(this.FRM_RESOLVE_REQUEST, callback);

            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< VideoService::decreaseVolume");
        }

        /**
         * This method mute Volume.
         *
         * @param {function=} callback      Reference to a function receiving the return code as a parameter.
         */
        mute(callback) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> VideoService::mute(...)");

            this.FRM_RESOLVE_REQUEST.FWFuncID = 4035; // FUNC_VOLUME_MUTE
            this.FRM_RESOLVE_REQUEST.param1 = "";
            this.FRM_RESOLVE_REQUEST.meta1 = ["NULL", 0];
            this.FRM_RESOLVE_REQUEST.param2 = "";
            this.FRM_RESOLVE_REQUEST.meta2 = ["NULL", 0];
            this.FRM_RESOLVE_REQUEST.param3 = "";
            this.FRM_RESOLVE_REQUEST.meta3 = ["NULL", 0];
            this.FRM_RESOLVE_REQUEST.param4 = "";
            this.FRM_RESOLVE_REQUEST.meta4 = ["NULL", 0];
            this.FRM_RESOLVE_REQUEST.param5 = "";
            this.FRM_RESOLVE_REQUEST.meta5 = ["NULL", 0];
            this.FRM_RESOLVE_REQUEST.paramUL = 0;

            _logger.LOG_SRVC_DATA &&
                _logger.log(_logger.LOG_SRVC_DATA, `. request to send: '${JSON.stringify(this.FRM_RESOLVE_REQUEST)}'.`);
            this.FrmResolve(this.FRM_RESOLVE_REQUEST, callback);

            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< VideoService::mute");
        }

        /**
         * This method unmute Volume.
         *
         * @param {function=} callback      Reference to a function receiving the return code as a parameter.
         */
        unmute(callback) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> VideoService::unmute(...)");

            this.FRM_RESOLVE_REQUEST.FWFuncID = 4036; // FUNC_VOLUME_UNMUTE
            this.FRM_RESOLVE_REQUEST.param1 = "";
            this.FRM_RESOLVE_REQUEST.meta1 = ["NULL", 0];
            this.FRM_RESOLVE_REQUEST.param2 = "";
            this.FRM_RESOLVE_REQUEST.meta2 = ["NULL", 0];
            this.FRM_RESOLVE_REQUEST.param3 = "";
            this.FRM_RESOLVE_REQUEST.meta3 = ["NULL", 0];
            this.FRM_RESOLVE_REQUEST.param4 = "";
            this.FRM_RESOLVE_REQUEST.meta4 = ["NULL", 0];
            this.FRM_RESOLVE_REQUEST.param5 = "";
            this.FRM_RESOLVE_REQUEST.meta5 = ["NULL", 0];
            this.FRM_RESOLVE_REQUEST.paramUL = 0;

            _logger.LOG_SRVC_DATA &&
                _logger.log(_logger.LOG_SRVC_DATA, `. request to send: '${JSON.stringify(this.FRM_RESOLVE_REQUEST)}'.`);
            this.FrmResolve(this.FRM_RESOLVE_REQUEST, callback);

            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< VideoService::unmute");
        }

        /**
         * See {@link Wincor.UI.Service.BaseService#onServicesReady}
         *
         * @returns {Promise}
         * @lifecycle service
         */
        onServicesReady() {
            return ext.Promises.promise((resolve, reject) => {
                _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> VideoService::onServicesReady()");
                // we only want to register and reposition if we are loaded from GUIAPP
                const sp = this.serviceProvider;
                const configService = sp.ConfigService;
                const viewService = sp.ViewService;
                const eventSvc = sp.EventService;
                if (sp.getInstanceName() === "GUIAPP") {
                    ext.Promises.Promise.all([configService.whenReady, viewService.whenReady, eventSvc.whenReady])
                        .then(() => {
                            // read the VIDEO positioning
                            return configService.getConfiguration("CCOPEN\\VIDEO", null);
                        })
                        .then((config) => {
                            // check if config is available, if not just skip this registration and processing
                            _logger.LOG_SRVC_DATA &&
                                _logger.log(
                                    _logger.LOG_SRVC_DATA,
                                    `* onServicesReady CCOPEN\\VIDEO :\n'${JSON.stringify(config)}'.`
                                );
                            let keys = Object.keys(config);
                            if (keys.length === 0 || !keys.includes("WINDOW_SIZEX")) {
                                _logger.LOG_SRVC_DATA &&
                                    _logger.log(
                                        _logger.LOG_SRVC_DATA,
                                        `* onServicesReady CCOPEN\\VIDEO not available, skipping registrations`
                                    );
                                return;
                            }
                            this.initialLocation = {
                                top: config["WINDOW_POSY"] || 0,
                                left: config["WINDOW_POSX"] || 0,
                                width: config["WINDOW_SIZEX"] || 1024,
                                height: config["WINDOW_SIZEY"] || 768,
                            };
                            _logger.LOG_SRVC_DATA &&
                                _logger.log(
                                    _logger.LOG_SRVC_DATA,
                                    `* onServicesReady read initialLocation of VIDEO :\n'${JSON.stringify(
                                        this.initialLocation
                                    )}'.`
                                );
                            // we register for ViewService LOCATION_CHANGED and reposition ourself accordingly
                            const GUIAPP_WIDTH = viewService.initialLocation.width;
                            const GUIAPP_HEIGHT = viewService.initialLocation.height;
                            const X_FACTOR = this.initialLocation.width / GUIAPP_WIDTH;
                            const Y_FACTOR = this.initialLocation.height / GUIAPP_HEIGHT;

                            viewService.registerForServiceEvent(
                                viewService.SERVICE_EVENTS.LOCATION_CHANGED,
                                (locationData) => {
                                    let resize = false;
                                    let loc;
                                    if (locationData.source.instanceName === "GUIAPP") {
                                        resize = true;
                                        loc = locationData.source.location;
                                    } else if (locationData.target.instanceName === "GUIAPP") {
                                        resize = true;
                                        loc = locationData.target.location;
                                    }

                                    if (resize) {
                                        _logger.LOG_SRVC_DATA &&
                                            _logger.log(
                                                _logger.LOG_SRVC_DATA,
                                                `* onServicesReady received LOCATION_CHANGED: \n ${JSON.stringify(
                                                    locationData,
                                                    null,
                                                    " "
                                                )}`
                                            );
                                        if (
                                            loc.left !== viewService.initialLocation.left ||
                                            loc.top !== viewService.initialLocation.top
                                        ) {
                                            _logger.LOG_SRVC_DATA &&
                                                _logger.log(
                                                    _logger.LOG_SRVC_DATA,
                                                    `* onServicesReady received LOCATION_CHANGED with different top/left!`
                                                );
                                            this.resizeWindow({
                                                top: Math.round(loc.top + this.initialLocation.top * Y_FACTOR),
                                                left: Math.round(loc.left + this.initialLocation.left * X_FACTOR),
                                                width: Math.round(this.initialLocation.width * X_FACTOR),
                                                height: Math.round(this.initialLocation.height * Y_FACTOR),
                                            });
                                        } else {
                                            _logger.LOG_SRVC_DATA &&
                                                _logger.log(
                                                    _logger.LOG_SRVC_DATA,
                                                    `* onServicesReady received LOCATION_CHANGED with same top/left!`
                                                );
                                            this.resizeWindow({
                                                top: this.initialLocation.top,
                                                left: this.initialLocation.left,
                                                width: this.initialLocation.width,
                                                height: this.initialLocation.height,
                                            });
                                        }
                                    }
                                },
                                true
                            );
                            // reset on session end
                            const TXN_EVENTS = eventSvc.getEventInfo("TRANSACTION_MODULE");
                            eventSvc.registerForEvent(
                                TXN_EVENTS.ID_SESSION_END,
                                TXN_EVENTS.NAME,
                                () => {
                                    _logger.LOG_ANALYSE &&
                                        _logger.log(
                                            _logger.LOG_ANALYSE,
                                            `* VideoService::onServicesReady() received ID_SESSION_END initialLocation:
                                    \n${JSON.stringify(
                                        this.initialLocation,
                                        null,
                                        " "
                                    )}\nbaseLocation:\n${JSON.stringify(this.baseLocation, null, " ")}`
                                        );
                                    if (
                                        this.baseLocation.top !== this.initialLocation.top ||
                                        this.baseLocation.left !== this.initialLocation.left ||
                                        this.baseLocation.width !== this.initialLocation.width ||
                                        this.baseLocation.height !== this.initialLocation.height
                                    ) {
                                        window.setTimeout(() => {
                                            this.resizeWindow({
                                                top: this.initialLocation.top,
                                                left: this.initialLocation.left,
                                                width: this.initialLocation.width,
                                                height: this.initialLocation.height,
                                            });
                                        }, 1);
                                    }
                                },
                                void 0,
                                "ASCII",
                                true
                            );
                            return super.onServicesReady();
                        })
                        .then(resolve)
                        .catch((e) => {
                            sp.propagateError(this.NAME, "onServicesReady", e);
                        });
                } else {
                    super.onServicesReady().then(resolve);
                }
            });
        }
    }
};

/**
 * The class VideoService has a collection of routines to support volume handling of VIDEO framework.
 *
 * @function getServiceClass
 * @param {Wincor} Wincor
 * @param {ext} ext
 * @param {LogProvider} LogProvider
 * @param {PTService} PTService
 * @returns {Wincor.UI.Service.VideoService}
 * @class
 * @since 2.0/10
 */
export default getServiceClass;
