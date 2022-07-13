/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ wn.UI.Service.ViewServiceHeadless.js 4.3.1-210203-21-60d725a2-1a04bc7d

*/

/**
 * @module
 */
const getServiceClass = ({ Wincor, LogProvider, ViewService }) => {
    /**
     * The logger.
     *
     * @type {Wincor.UI.Diagnostics.LogProvider}
     * @const
     */
    const _logger = LogProvider;

    return class ViewServiceHeadless extends ViewService {
        /**
         * The logical name of this service as used in the service-provider.
         * @const
         * @type {string}
         * @default ViewService
         */
        NAME = "ViewService";

        /**
         * Internal flag PF4 mode active or not
         */
        PF4Active = false;

        /**
         * Initialize members
         * @lifecycle service
         * @see {@link Wincor.UI.Service.ViewService#constructor}.
         */
        constructor(...args) {
            super(...args);
            this.contentRunning = false;
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> ViewServiceHeadless::ViewServiceHeadless");
            // read
            this.ViewActionMap = {};
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< ViewServiceHeadless::ViewServiceHeadless");
        }

        /**
         * Override to intercept calls
         * @override
         * @param  {...any} args Any original arguments are passed through to base.
         */
        processDisplay(...args) {
            super.processDisplay(...args);
            this.contentRunning = true;
        }

        /**
         * This function override directly calls super.display() in case of PF4Mode is active.
         * Otherwise it shortcuts / hooks into display calls to views / viewKeys and either directly resolves with "OK"
         * or uses endless timeout to let content do call to endView with appropriate results.
         * Default handling is defined in ViewServiceHeadless#ViewActionMap.
         * @override
         * @param  {...any} args Any original arguments are passed through to base if PF4Active is set.
         * @async
         */
        async display(...args) {
            if (this.PF4Active) return super.display(...args);
            let message = args[0];
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> ViewServiceHeadless::display(...)\n${JSON.stringify(message, null, " ")}`);
            this.EVENT_UIRESULT.UILastButtonPressedEPPKey = [];
            this.viewContext.viewID = message.viewID;
            this.viewContext.viewURL = this.urlMapping[message.viewKey].url;
            this.viewContext.viewKey = message.viewKey;
            this.contentRunning = true;
            await this.confirmDisplay();
            const viewUrl = this.viewContext.viewURL;
            const vk = message.viewKey;
            let actionConfig = this.ViewActionMap.VIEW_KEYS[vk] || this.ViewActionMap.VIEWS[viewUrl];

            if (actionConfig) {
                if (actionConfig.timeout >= 0) {
                    let res = actionConfig.result || 0;
                    let extRes = actionConfig.extendedResult || "";
                    _logger.log(_logger.LOG_SRVC_DATA, `. ViewServiceHeadless::display - setting result <${res}/${extRes}> in ${actionConfig.timeout} seconds`);
                    setTimeout(this.endView.bind(this, res, extRes), actionConfig.timeout);
                } else {
                    _logger.log(_logger.LOG_SRVC_DATA, `. ViewServiceHeadless::display - endless timeout... waiting for cancellation`);
                }
            }
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< ViewServiceHeadless::display");
        }

        /**
         * Any original arguments are passed through to base.
         * @param {string} res
         * @param {string=} extRes
         */
        endView(res, extRes) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> ViewServiceHeadless::endView(${res}, ${extRes})`);
            super.endView(res, extRes);
            this.contentRunning = false;
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< ViewServiceHeadless::endView");
        }

        /**
         * Fires Wincor.UI.Service.ViewService#SERVICE_EVENT.SHUTDOWN
         */
        shutdown() {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> ViewServiceHeadless::shutdown()");
            this.fireServiceEvent(this.SERVICE_EVENTS.SHUTDOWN);
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< ViewServiceHeadless::shutdown");
        }

        /**
         * Confirms a call to 'display' by:
         * Sending Wincor.UI.Service.ViewService#SERVICE_EVENT.VIEW_PREPARED
         * Waiting for Wincor.UI.Service.ViewService#SERVICE_EVENT.TURN_ACTIVE
         * Sending Wincor.UI.Service.ViewService#SERVICE_EVENT.VIEW_ACTIVATED
         * This is necessary to fulfill the state machine requirements of our lifecycle
         * @async
         */
        async confirmDisplay() {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> ViewServiceHeadless::confirmDisplay() PF4Active=${this.PF4Active}`);
            return new Promise(resolve => {
                this.registerForServiceEvent(
                    this.SERVICE_EVENTS.TURN_ACTIVE,
                    () => {
                        this.fireActivated();
                        _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< ViewServiceHeadless::confirmDisplay");
                        resolve();
                    },
                    this.DISPOSAL_TRIGGER_ONETIME
                );
                this.firePrepared();
            });
        }

        /**
         * Switches mode to PF4.
         * All functionality for flowrunner is switched off and PF4 can be loaded by a call to Wincor.UI.Service.ViewService#loadViewSet
         * @param {String} [frameName=pf4content] HTML Id of the frame to be used for PF4 content
         */
        activatePF4(frameName = "pf4content") {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> ViewServiceHeadless::activatePF4(${frameName})`);
            this.PF4Active = true;
            this.CONTENT_FRAME_NAME = `#${frameName}`;
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `< ViewServiceHeadless::activatePF4 '${this.CONTENT_FRAME_NAME}'`);
        }

        /**
         * Switches off PF4 mode.
         * All functionality for flowrunner is switched on again.
         */
        deactivatePF4() {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> ViewServiceHeadless::deactivatePF4()`);
            this.PF4Active = false;
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `< ViewServiceHeadless::deactivatePF4`);
        }
    };
};

/**
 * The ViewServiceHeadless class is an overlay to the original ViewService.
 * It allows to run ProFlex4UI Core as part of another content implementation that wants to drive the application flow.
 *
 * @function getServiceClass
 * @param {Wincor} Wincor
 * @param {LogProvider} LogProvider
 * @param {PTService} PTService
 * @returns {Wincor.UI.Service.ViewService}
 * @class
 * @since 4.3.0
 */
export default getServiceClass;
