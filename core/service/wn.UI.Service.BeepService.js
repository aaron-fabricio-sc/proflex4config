/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ wn.UI.Service.BeepService.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

/**
 * @module
 */
const getServiceClass = ({Wincor, ext, LogProvider, PTService}) => {

    /**
     *
     * @type {Wincor.UI.Diagnostics.LogProvider|*|Wincor.UI.Diagnostics.LogProvider|*}
     * @private
     */
    const _logger = LogProvider;
    
    return class BeepService extends PTService {
    
        /**
         * The logical name of this service as used in the service-provider
         * @const
         * @type {string}
         * @default "BeepService"
         */
        NAME = "BeepService";
    
        /**
         * This flag turns the beeping ON/OFF.
         * It reflects the corresponding 'Beeping' registry parameter of Beep service and is initialised in {@link Wincor.UI.Service.BeepService#onServicesReady}.
         * @type {boolean}
         * @default true
         */
        beeping = true;
    
        /**
         * This is the code for the beep of inactive EPP keys.
         * It reflects the corresponding 'BEEP_INACTIVE_KEY_COMMAND' registry parameter of EppSync framework and is initialised in {@link Wincor.UI.Service.BeepService#onServicesReady}.
         * Possible values are:<br>
         *   <ul>
         *     <li>0  = OFF</li>
         *     <li>2  = SIU_KEYPRESS</li>
         *     <li>4  = SIU_EXCLAMATION</li>
         *     <li>8  = SIU_WARNING</li>
         *     <li>16 = SIU_ERROR</li>
         *     <li>32 = SIU_CRITICAL</li>
         *   </ul>
         * @type {number}
         * @default 8
         */
        beepInactiveKeyCode = 8;
    
        /**
         * See {@link Wincor.UI.Service.PTService#constructor}.
         *
         * @lifecycle service
         */
        constructor(...args) {
            super(...args);
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> BeepService::BeepService");
    
            this.FRM_RESOLVE_REQUEST.service = this.NAME;
            this.FRM_RESOLVE_REQUEST.FWName = "CCSelFW";
    
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< BeepService::BeepService");
        }
        
        /**
         * Do a beep.
         * If the beeping is activated {@link Wincor.UI.Service.BeepService#beeping},
         * the asynchronous call to the SEL framework function CCSELFW_FUNC_SET_INDICATOR is done and its return code(RC) is given to the callback function,
         * else the error return code (-1) is given to the callback function immediately.
         *
         * @param {number} [code=2]     beep type, possibilities:
         * <ul>
         *      <li>2  (CCSELFW_SIU_KEYPRESS)</li>
         *      <li>4  (CCSELFW_SIU_EXCLAMATION)</li>
         *      <li>8  (CCSELFW_SIU_WARNING)</li>
         *      <li>16 (CCSELFW_SIU_ERROR)</li>
         *      <li>32 (CCSELFW_SIU_CRITICAL)</li>
         * </ul>
         * @param {function} [callback=null]      Reference to a function receiving the return code as a parameter.
         */
        beep(code = 2, callback = null) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> BeepService::beep(code:${code}, ...)`);
    
            if(this.beeping) {
                this.FRM_RESOLVE_REQUEST.FWFuncID   = 57;              // CCSELFW_FUNC_SET_INDICATOR
                this.FRM_RESOLVE_REQUEST.param1     = 2;               // CCSELFW_SIU_AUDIO
                this.FRM_RESOLVE_REQUEST.meta1      = ["USHORT", 0];
                this.FRM_RESOLVE_REQUEST.param2     = code;
                this.FRM_RESOLVE_REQUEST.meta2      = ["USHORT", 0];
                this.FRM_RESOLVE_REQUEST.param3     = "";
                this.FRM_RESOLVE_REQUEST.meta3      = ["NULL", 0];
                this.FRM_RESOLVE_REQUEST.paramUL    = 0;
    
                _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, `. request to send: '${JSON.stringify(this.FRM_RESOLVE_REQUEST)}'.`);
                this.FrmResolve(this.FRM_RESOLVE_REQUEST, callback);
            } else if (callback) { // if user wants callback ...
                // emulate SEL framework return code for this case!
                callback(-1);   // CCSELFW_ERROR
            }
    
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< BeepService::beep");
        }
    
        /**
         * Called automatically as soon as there is an answer to an asynchronous ProTopas request. See {@link Wincor.UI.Service.BaseService#translateResponse}.
         * This function handles the response for CCSELFW_FUNC_SET_INDICATOR request.
         *
         * @param {Object} message    Response object, see {@link Wincor.UI.Service.BaseService#translateResponse}.
         * @returns {number}          Return code (RC) for CCSELFW_FUNC_SET_INDICATOR, -1 for rest
         */
        translateResponse(message) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> BeepService::translateResponse('${JSON.stringify(message)}')`);
            var ret;
            if (message.FWFuncID === 57) {          //CCSELFW_FUNC_SET_INDICATOR
                ret = message.RC;
            } else {
                _logger.error("Wincor.UI.Service.BeepService(onResponse): unknown function");
                ret = -1;
            }
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `< BeepService::translateResponse returns ${ret}`);
            return ret;
        }
    
        /**
         * See {@link Wincor.UI.Service.BaseService#onServicesReady}
         * This function initialise the members {@link Wincor.UI.Service.BeepService#beeping} and {@link Wincor.UI.Service.BeepService#beepInactiveKeyCode} with corresponding registry values.
         *
         * @returns {Promise}
         * @lifecycle service
         */
        onServicesReady() {
            return ext.Promises.promise(resolve => {
                _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> BeepService::onServicesReady()");
                const configService = this.serviceProvider.ConfigService;
                const generalSection = `${configService.configuration.instanceName}\\Services\\General`;
                const key = "Beeping";
                const keyBeep4InactiveKey = "BEEP_INACTIVE_KEY_COMMAND";
    
                configService.getConfiguration(generalSection, [key])
                    .then(result => {
                        if (result[key] === false) {
                            this.beeping = false;
                        }
                        _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `* BeepService::onServicesReady(): beeping=${this.beeping}`);
                        return configService.getConfiguration("ADA\\CCEPPRTCFW", [keyBeep4InactiveKey]);
                    })
                    .then(result => {
                        if (result[keyBeep4InactiveKey] !== void 0 && result[keyBeep4InactiveKey] !== null && result[keyBeep4InactiveKey] !== "") {
                            this.beepInactiveKeyCode = parseInt(result[keyBeep4InactiveKey]);
                        }
                        _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `* BeepService::onServicesReady(): beepInactiveKey=${this.beepInactiveKeyCode}`);
                        _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< BeepService::onServicesReady");
                        super.onServicesReady().then(resolve);
                    });
            });
        }
    }
};

/**
 * The class BeepService has a collection of routines to support beeping. Beeping is done by ProTopas SEL framework.
 *
 * @function getServiceClass
 * @param {Wincor} Wincor
 * @param {ext} ext
 * @param {LogProvider} LogProvider
 * @param {PTService} PTService
 * @returns {Wincor.UI.Service.BeepService}
 * @class
 */
export default getServiceClass;
