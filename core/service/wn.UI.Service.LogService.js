/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ wn.UI.Service.LogService.js 4.3.1-210204-21-e1b78e33-1a04bc7d
 */

/**
 * @module
 */
const getServiceClass = ({ BaseService }) => {
    return class LogService extends BaseService {
        //Hint: don't write a log in here!!!

        /**
         * "LogService" - the logical name of this service as used in the service-provider
         * @const
         * @type {string}
         */
        NAME = "LogService";

        /**
         * The type of this logger. Used by the service-provider.
         * @const
         * @type {string}
         */
        TYPE = "TRACELOG";

        /**
         * The trace level "trace"
         * @const
         * @type {String}
         */
        METHOD_LOG = "trace";

        /**
         * The trace level "error"
         * @const
         * @type {String}
         */
        METHOD_ERROR = "error";

        /**
         * The message that has to be logged
         * @type {Object}
         */
        LOG_MESSAGE = null;

        /**
         * Set of trace bits
         * @type {Object}
         */
        TRACEBIT_SET = null;

        /**
         * "traceBitStates" - the array containg the states for the trace bits
         * @type {object}
         */
        traceBitStates = {};

        traceBitsChangedHandler = [];

        /**
         * See {@link Wincor.UI.Service.PTService#constructor}.
         * @lifecycle service
         */
        constructor(...args) {
            super(...args);
            this.traceBitStates = {
                20: false,
                21: false,
                22: false,
                23: false,
                24: false,
                25: false,
                26: false,
                27: false,
                28: false,
                29: false
            };

            this.LOG_MESSAGE = Object.assign(Object.assign({}, this.EVENT), {
                service: this.NAME,
                eventName: this.METHOD_LOG,
                traceBit: null,
                logText: "" // text to log or write error
            });

            this.ERROR_MESSAGE = Object.assign(Object.assign({}, this.EVENT), {
                service: this.NAME,
                eventName: this.METHOD_ERROR,
                logText: "" // text to log or write error
            });

            this.TRACEBIT_SET = Object.assign(Object.assign({}, this.REQUEST), {
                service: this.NAME,
                methodName: "trcCheckBit",
                result: false
            });

            this.eventMap.set("setTraceBits", this.setTraceBits.bind(this));
        }

        /**
         * This method logs the given "data" with the traceBit as source identifier
         * The changed key will be updated in the DataRegistration structure, which contains all prior requested keys.
         * @param {int} traceBit
         * @param {string} data
         */
        log(traceBit, data) {
            // Simplify this to speed up things. Errors should be handled in native code
            if (!traceBit) {
                return;
            }
            // TODO: Check if we really want to auto convert
            data = "" + data; // implicit conversion
            // cause of UTF-8 the max net trace is the half of 64K in order to avoid that
            // nothing is traced of this log entry, which is always the case when the limit of 32K is exceeded
            if (data.length > 30500) {
                data = data.substring(0, 30500);
                data = `${data}...truncated`;
            }
            this.LOG_MESSAGE.traceBit = traceBit;
            this.LOG_MESSAGE.logText = data;
            this.sendEvent(this.LOG_MESSAGE);
        }

        /**
         * This method triggers an event, to log an error with the given data.
         * @param {string} data
         */
        error(data) {
            // TODO: Check if we really want to auto convert
            data = "" + data; // implicit conversion
            this.ERROR_MESSAGE.logText = data;
            this.sendEvent(this.ERROR_MESSAGE);
        }

        /**
         * Check if a trace bit is set.
         * @param {int} traceBit
         * @return {boolean}
         */
        isTraceBitSet(traceBit) {
            return this.traceBitStates[traceBit];
        }

        /**
         * Reads the tracebit states from business logic
         * @param callback Callback function is called when all responses did arrive
         */
        readCurrentTraceBitStates(callback) {
            let count = 10;
            for (let i = 20; i < 30; i++) {
                let message = Object.assign(Object.assign({}, this.TRACEBIT_SET), {
                    traceBit: i
                });
                this.traceBitStates[i] = false;
                this.sendRequest(message, response => {
                    this.traceBitStates[response.traceBit] = response.result;
                    count--;
                    if (count === 0) {
                        this.traceBitsChangedHandler.forEach(h => h(this.traceBitStates));
                        if (callback) {
                            callback();
                        }
                    }
                });
            }
        }

        /**
         *
         * @param handler
         * @return {number}
         */
        registerTraceBitsChangedHandler(handler) {
            if (this.traceBitsChangedHandler.indexOf(handler) === -1) {
                this.traceBitsChangedHandler.push(handler);
                return this.traceBitsChangedHandler.length - 1;
            }
            return -1;
        }

        removeTraceBitsChangedHandler(id) {
            this.traceBitsChangedHandler.splice(id, 1);
        }

        /**
         * Called from business logic to set tracebits, if they did change
         * @param {object} message
         */
        setTraceBits(message) {
            this.log(20, "LogService.setTraceBits: " + JSON.stringify(message)); //we can not use LOG_ANALYSE here
            Object.keys(message.traceBits).forEach(
                function(bit) {
                    if (parseInt(bit) in this.traceBitStates) {
                        this.traceBitStates[parseInt(bit)] = message.traceBits[bit];
                    }
                }.bind(this)
            );
            this.traceBitsChangedHandler.forEach(h => h(this.traceBitStates));
        }

        /**
         *
         */
        onGatewayReady() {
            super.onGatewayReady();
            this.readCurrentTraceBitStates();
        }
    };
};

/**
 * The LogService class provides methods for trace and error logging.
 *
 * @function getServiceClass
 * @param {BaseService} BaseService
 * @class
 * @since 1.0/00
 */
export default getServiceClass;
