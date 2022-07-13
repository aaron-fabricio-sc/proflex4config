/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ wn.UI.Service.LogServiceMock.js 4.3.1-210127-21-34ae33df-1a04bc7d
 */

/**
 * @module
 */
const getServiceClass = ({ BaseService, GatewayProvider}) => {

    return class LogServiceMock extends BaseService { //Hint: don't write a log in here!!!


        /**
         * "LogService" - the logical name of this service as used in the service-provider
         * @const
         * @type {String}
         */
        NAME = "LogService";

        /**
         * The type of this logger. Used by the service-provider.
         * @const
         * @type {String}
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
                20: true,
                21: true,
                22: true,
                23: true,
                24: true,
                25: true,
                26: true,
                27: true,
                28: true,
                29: true
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
        }

        /**
         * This method logs the given "data" with the traceBit as source identifier
         * The changed key will be updated in the DataRegistration structure, which contains all prior requested keys.
         * @param {int} traceBit
         * @param {string} data
         */
        log(traceBit, data) {
            // Simplify this to speed up things. Errors should be handled in native code
            if (traceBit === false) {
                return;
            }
            if(GatewayProvider.isConnected() || GatewayProvider.getGateway()) {
                // TODO: Check if we really want to auto convert
                data = "" + data; // implicit conversion
                this.LOG_MESSAGE.traceBit = traceBit;
                this.LOG_MESSAGE.logText = data;
                this.sendEvent(this.LOG_MESSAGE);
            } else {
                console.log(data);
            }
        }

        /**
         * This method triggers an event, to log an error with the given data.
         * @param {string} data
         */
        error(data) {
            if(GatewayProvider.isConnected() || GatewayProvider.getGateway()) {
                //TODO: Check if we really want to auto convert
                data = "" + data; // implicit conversion
                this.ERROR_MESSAGE.logText = data;
                this.sendEvent(this.ERROR_MESSAGE);
            } else {
                console.error(data);
            }
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
            if (callback) {
                callback();
            }
        }

        /**
         *
         * @param handler
         * @return {number}
         */
        registerTraceBitsChangedHandler(handler) {
            return -1;
        }

        removeTraceBitsChangedHandler(id) {
        }

        /**
         * Called from business logic to set tracebits, if they did change
         * @param {object} message
         */
        setTraceBits(message) {
        }

        /**
         *
         */
        onGatewayReady() {
            //TODO implemented, because it's also in normal LogService, but this function is never called (should be called in toolingEDM mode, because then we have a gateway)
            super.onGatewayReady();
        }
    }
};

/**
 * The LogServiceMock class provides methods for trace and error logging.
 *
 * @function getServiceClass
 * @param {Class} Class
 * @param {BaseService} BaseService
 * @param {GatewayProvider} GatewayProvider
 * @returns {Wincor.UI.Service.Provider.LogService}
 * @class
 * @since 1.2/00
 */
export default getServiceClass;
