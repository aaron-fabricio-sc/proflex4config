/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ wn.UI.Service.BeepServiceMock.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

/**
 * @module
 */
const getServiceClass = ({ BaseService, ext }) => {

    const _audio = new Audio();

    return class BeepServiceMock extends BaseService {
        /**
         * The logical name of this service as used in the service-provider
         * @const
         * @type {string}
         * @default "BeepService"
         */
        NAME = 'BeepService';

        /**
         * This flag turns the beeping ON/OFF.
         * @type {boolean}
         * @default true
         */
        beeping = true;

        /**
         * This is the code for the beep of inactive EPP keys.
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
         * @see {@link Wincor.UI.Service.BaseServiceMock#constructor}.
         * @lifecycle service
         */
        constructor(...args) {
            super(...args);
            this.logger.log(this.logger.LOG_SRVC_INOUT, '> BeepServiceMock::BeepServiceMock');
            this.logger.log(this.logger.LOG_SRVC_INOUT, '< BeepServiceMock::BeepServiceMock');
        }
    
        /**
         * This method is called by the {@link Wincor.UI.Service.Provider#propagateError} if an error occurred in any service. It logs the error to the console.
         *
         *
         * @param {String} serviceName  The name of this service.
         * @param {String} errorType    As defined in {@link Wincor.UI.Service.BaseService#ERROR_TYPE}.
         */
        onError(serviceName, errorType) {
            this.logger.log(this.logger.LOG_SRVC_INOUT, `> BeepServiceMock::onError(${serviceName}, ${errorType})`);
            this.logger.log(this.logger.LOG_SRVC_INOUT, '< BeepServiceMock::onError');
        }

        /**
         * Do a beep.<br>
         * This method is playing two sounds. For code 2 beep.wav, and for code 8 beep-warning.wav.
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
            !arguments[2] && this.logger.log(this.logger.LOG_SRVC_INOUT, `> BeepServiceMock::beep(code:${code})`);
            if (localStorage.getItem('activateBeepServiceOn') === 'true') {
                switch (code) {
                    case 2:
                        if (_audio.paused) {
                            _audio.setAttribute('src', 'assets/beep.wav');
                        } else {
                            setTimeout(() => {
                                this.beep(code, null, true);
                            }, 50);
                            !arguments[2] && this.logger.log(this.logger.LOG_SRVC_INOUT, '< BeepServiceMock::beep');
                            return;
                        }
                        break;
                    case 8:
                        if (_audio.paused) {
                            _audio.setAttribute('src', 'assets/beep-warning.wav');
                        } else {
                            setTimeout(() => {
                                this.beep(code, null, true);
                            }, 50);
                            !arguments[2] && this.logger.log(this.logger.LOG_SRVC_INOUT, '< BeepServiceMock::beep');
                            return;
                        }
                        break;
                }
                try {
                    _audio.play();
                } catch (e) {
                    // nothing here for work, error maybe thrown id the play will be interrupted
                }
                this.callbackCaller(callback);
            }
            !arguments[2] && this.logger.log(this.logger.LOG_SRVC_INOUT, '< BeepServiceMock::beep');
        }

        /**
         * See {@link Wincor.UI.Service.BaseServiceMock#onSetup}
         *
         * @param {Object} message      See {@link Wincor.UI.Service.BaseServiceMock#onSetup}
         * @returns {Promise}
         * @lifecycle service
         */
        onSetup(message) {
            this.logger.log(this.logger.LOG_SRVC_INOUT, `> BeepServiceMock::onSetup('${JSON.stringify(message)}')`);
            return ext.Promises.promise((resolve) => {
                resolve();
                this.logger.log(this.logger.LOG_SRVC_INOUT, '< BeepServiceMock::onSetup');
            });
        }
        
        /**
         * @see {@link Wincor.UI.Service.BaseServiceMock#onServicesReady}
         * @async
         * @lifecycle service
         */
        async onServicesReady() {
            this.logger.log(this.logger.LOG_SRVC_INOUT, '> BeepServiceMock::onServicesReady()');
            await super.onServicesReady();
            this.logger.log(this.logger.LOG_SRVC_INOUT, '< BeepServiceMock::onServicesReady');
        }
    }
};

/**
 * The BeepServiceMock handles simulates a SEL framework regarding the beep handling.
 *
 * @function getServiceClass
 * @param {Class} Class
 * @param {BaseService} BaseService
 * @param {ext} ext
 * @returns {Wincor.UI.Service.Provider.BeepService}
 * @class
 * @since 1.2/00
 */
export default getServiceClass;
