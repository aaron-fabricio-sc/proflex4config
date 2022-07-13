/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ wn.UI.Service.ControlPanelServiceMock.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

/**
 * @module
 */
const getServiceClass = ({ Wincor, ext, BaseService, LogProvider }) => {

    /**
     *
     * @type {Wincor.UI.Diagnostics.LogProvider|*|Wincor.UI.Diagnostics.LogProvider|*}
     * @private
     */
    const _logger = LogProvider;

    let _controlPanel = null;

    return class ControlPanelServiceMock extends BaseService {
        /**
         * The logical name of this service as used in the service-provider
         * @const
         * @type {string}
         * @default "ControlPanelService"
         */
        NAME = "ControlPanelService";

        /**
         * @see {@link Wincor.UI.Service.ViewService#SERVICE_EVENTS}.
         * @enum {string}
         */
        SERVICE_EVENTS = {
            /**
             * Fired when a local timer has been newed.
             */
            NEW_TIMEOUT: "NEW_TIMEOUT",
        };

        /**
         * @see {@link Wincor.UI.Service.BaseServiceMock#constructor}.
         * @lifecycle service
         */
        constructor(...args) {
            super(...args);
            _logger.log(_logger.LOG_SRVC_INOUT, "> ControlPanelServiceMock::ControlPanelServiceMock");
            _logger.log(_logger.LOG_SRVC_INOUT, "< ControlPanelServiceMock::ControlPanelServiceMock");
        }
        
        /**
         * Sets the control panel.
         * @param {Object} panel the panel window
         */
        setControlPanel(panel) {
            _controlPanel = panel;
        }

        /**
         * Gets the control panel.
         * @return {Object} the control panel window object
         */
        getControlPanel() {
            return _controlPanel;
        }

        /**
         * Gets the control panel context.
         * @return {Object} the control panel context object
         */
        getContext() {
            return (_controlPanel && _controlPanel.getContext && _controlPanel.getContext()) || {};
        }

        /**
         * Updates the business properties of the control panel.
         * @param {Map} propMap the property map contains a map of property keys and values
         */
        updateBusinessProperties(propMap) {
            if (_controlPanel && _controlPanel.businessPropertiesUpdate) {
                _controlPanel.businessPropertiesUpdate(propMap);
            }
        }

        /**
         * Should be called when a new local timer has been started.
         * @param {Number} timeLen the time length
         */
        newTimerStarted(timeLen) {
            this.fireServiceEvent(this.SERVICE_EVENTS.NEW_TIMEOUT, timeLen);
        }

        /**
         * @see {@link Wincor.UI.Service.BaseServiceMock#onSetup}
         *
         * @param {Object} message      See {@link Wincor.UI.Service.BaseServiceMock#onSetup}
         * @returns {Promise}
         * @lifecycle service
         */
        onSetup(message) {
            _logger.log(_logger.LOG_SRVC_INOUT, `> ControlPanelServiceMock::onSetup('${JSON.stringify(message)}')`);
            return ext.Promises.promise(resolve => {
                resolve();
                _logger.log(_logger.LOG_SRVC_INOUT, "< ControlPanelServiceMock::onSetup");
            });
        }

        /**
         * @see {@link Wincor.UI.Service.BaseServiceMock#onServicesReady}
         * @async
         * @lifecycle service
         */
        async onServicesReady() {
            this.logger.log(this.logger.LOG_SRVC_INOUT, '> ControlPanelServiceMock::onServicesReady()');
            await super.onServicesReady();
            this.logger.log(this.logger.LOG_SRVC_INOUT, '< ControlPanelServiceMock::onServicesReady');
        }
    }
};

/**
 * The ControlPanelServiceMock handles services for the control panel.
 *
 * @function getServiceClass
 * @param {Wincor} Wincor
 * @param {Class} Class
 * @param {ext} ext
 * @param {BaseService} BaseService
 * @param {LogProvider} LogProvider
 * @returns {Wincor.UI.Service.Provider.ControlPanelService}
 * @class
 * @since 2.0/10
 */
export default getServiceClass;
