/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ wn.UI.Diagnostics.ConsoleLogger.js 4.3.1-210127-21-34ae33df-1a04bc7d

*/

import {default as Wincor} from './wn.UI.js';
import {default as diagnostics} from './wn.UI.Diagnostics.js';

/**
 * The ConsoleLogger class logs to the console. During application mode, this logger is interchanged with the LogService after an initialization phase.

 * @module
 *
 */
Wincor.UI.Diagnostics.ConsoleLogger = class ConsoleLogger { //Hint: don't write a log in here!!!

    /**
     * The type of this logger. Used by the service-provider.
     * @const
     * @type {String}
     */
    TYPE = "CONSOLE";

    originalLogFunction = null;
    originalErrorFunction = null;
    originalClearFunction = null;

    /**
     * true, if this logger is attached.
     * @type {boolean}
     */
    isAttached = false;

    /** For the log levels see {@link Wincor.UI.Diagnostics.LogProvider} */
    LOG_ANALYSE = 20;
    /** For the log levels see {@link Wincor.UI.Diagnostics.LogProvider} */
    LOG_EXCEPTION = 21;
    /** For the log levels see {@link Wincor.UI.Diagnostics.LogProvider} */
    LOG_ERROR = 22;
    /** For the log levels see {@link Wincor.UI.Diagnostics.LogProvider} */
    LOG_WARNING = 23;
    /** For the log levels see {@link Wincor.UI.Diagnostics.LogProvider} */
    LOG_INFO = 24;
    /** For the log levels see {@link Wincor.UI.Diagnostics.LogProvider} */
    LOG_INOUT = 25;
    /** For the log levels see {@link Wincor.UI.Diagnostics.LogProvider} */
    LOG_DATA = 26;
    /** For the log levels see {@link Wincor.UI.Diagnostics.LogProvider} */
    LOG_SRVC_INOUT = 27;
    /** For the log levels see {@link Wincor.UI.Diagnostics.LogProvider} */
    LOG_SRVC_DATA = 28;
    /** For the log levels see {@link Wincor.UI.Diagnostics.LogProvider} */
    LOG_DETAIL = 29;

    /**
     *
     */
    constructor() {
        this.messageStack = [];
        this.isAttached = false;
        this.attachLogger();
    }
    
    /**
     * Logs a message to the console.
     * @param {number} traceBit The traceBit used to log this message
     * @param {String} message The logged message.
     */
    log(traceBit, message) {
        if (traceBit) {
            window.console.log(message);
        }
    }

    /**
     * Logs an error message to the console.
     * @param {string} message The logged error message.
     */
    error(message) {
        window.console.error(message);
    }

    isTraceBitSet (traceBit) {
        return this[traceBit];
    }

    /**
     * "Detaches" this logger: the native logging functions will be restored.
     *
     * Without detaching any other logging service, which will log to the console, would use the overriding functions of this logger,
     * which will lead to a deadlock (because of recursive log() calls).
     */
    detachLogger() {
        if (this.isAttached === true) {
            window.console.log = this.originalLogFunction;
            window.console.error = this.originalErrorFunction;
            window.console.clear = this.originalClearFunction;
            this.isAttached = false;
        }
    }

    /**
     * "Attaches" this logger: the native logging functions will be rescued and overridden by the functions of this service.
     */
    attachLogger() {
        
        if (this.isAttached === false) {
            this.originalLogFunction = window.console.log;
            this.originalErrorFunction = window.console.error;
            this.originalClearFunction = window.console.clear;
            
            window.console.log = (msg) => {
                let logProvider = Wincor.UI.Diagnostics.LogProvider;
                if ((!logProvider) || (!logProvider.logger) || (logProvider.logger.TYPE === this.TYPE)) {
                    // its just us... keep logging and remember logs
                    if (Wincor.UI.Content && !Wincor.UI.Content.designModeExtended && !Wincor.UI.Content.designMode) {
                        // only need messageStack if logservice is likely to be loaded
                        this.messageStack.push([false, msg]); // false tells it's a trace entry
                    }
                    this.originalLogFunction.call(window.console, msg);
                } else {
                    logProvider.log(logProvider.LOG_DETAIL, "console.log: " + msg);
                }
            };

            window.console.error = (msg) => {
                let logProvider = Wincor.UI.Diagnostics.LogProvider;
                if ((!logProvider) || (!logProvider.logger) || (logProvider.logger.TYPE === this.TYPE)) {
                    // its just us... keep logging and remember logs
                    this.messageStack.push([true, msg]); // true tells it's an error entry
                    this.originalErrorFunction.call(window.console, msg);
                } else {
                    logProvider.error("console.error: " + msg);
                }
            };

            window.console.clear = () => {
                this.messageStack = [];
                // check because e.g. firefox does not support console.clear!
                if (this.originalClearFunction) {
                    this.originalClearFunction.call(window.console);
                }
            };

            this.isAttached = true;
        }
    }
}

//SINGLETON
diagnostics.ConsoleLogger = new Wincor.UI.Diagnostics.ConsoleLogger();
/**
 * @class Wincor.UI.Diagnostics.ConsoleLogger
 */
export default diagnostics.ConsoleLogger;
