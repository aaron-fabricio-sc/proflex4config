/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ wn.UI.Service.EppServiceMock.js 4.3.1-210420-21-c476740e-1a04bc7d

*/

/**
 * @module
 */
const getServiceClass = ({ BaseService, ext, LogProvider }) => {
    const _logger = LogProvider;

    let _claimId = 0;

    /**
     * Map containing registered callbacks key-pressed events of claimed keys
     * @type {Map}
     * @private
     */
    const _eppKeyPressed2CallbackMap = new Map();

    /**
     * Map containing registered callbacks for status changes of claimed keys
     * @type {Map}
     * @private
     */
    const _eppKeyStatusChanged2CallbackMap = new Map();

    function strMapToObj(strMap) {
        let obj = {};
        for(let [k,v] of strMap) {
            // We don’t escape the key '__proto__'
            // which can cause problems on older engines
            obj[k] = v;
        }
        return obj;
    }

    return class EppServiceMock extends BaseService {

        /**
         * "EppServiceMock" - the logical name of this service as used in the service-provider
         * @const
         * @type {string}
         */
        NAME = "EppService";

        /**
         * Epp button F1
         * @const
         */
        BUTTONEPP_F1 = "F1";
        /**
         * Epp button F2
         * @const
         */
        BUTTONEPP_F2 = "F2";
        /**
         * Epp button F3
         * @const
         */
        BUTTONEPP_F3 = "F3";
        /**
         * Epp button F4
         * @const
         */
        BUTTONEPP_F4 = "F4";
        /**
         * Epp button F5
         * @const
         */
        BUTTONEPP_F5 = "F5";
        /**
         * Epp button F6
         * @const
         */
        BUTTONEPP_F6 = "F6";
        /**
         * Epp button F7
         * @const
         */
        BUTTONEPP_F7 = "F7";
        /**
         * Epp button F8
         * @const
         */
        BUTTONEPP_F8 = "F8";
        /**
         * Epp button F9
         * @const
         */
        BUTTONEPP_F9 = "F9";
        /**
         * Epp button 0
         * @const
         */
        BUTTONEPP_0 = "0";
        /**
         * Epp button 1
         * @const
         */
        BUTTONEPP_1 = "1";
        /**
         * Epp button 2
         * @const
         */
        BUTTONEPP_2 = "2";
        /**
         * Epp button 3
         * @const
         */
        BUTTONEPP_3 = "3";
        /**
         * Epp button 4
         * @const
         */
        BUTTONEPP_4 = "4";
        /**
         * Epp button 5
         * @const
         */
        BUTTONEPP_5 = "5";
        /**
         * Epp button 6
         * @const
         */
        BUTTONEPP_6 = "6";
        /**
         * Epp button 7
         * @const
         */
        BUTTONEPP_7 = "7";
        /**
         * Epp button 8
         * @const
         */
        BUTTONEPP_8 = "8";
        /**
         * Epp button 9
         * @const
         */
        BUTTONEPP_9 = "9";
        /**
         * Epp button CONFIRM
         * @const
         */
        BUTTONEPP_CONFIRM = "CONFIRM";
        /**
         * Epp button CANCEL
         * @const
         */
        BUTTONEPP_CANCEL = "CANCEL";
        /**
         * Epp button HELP
         * @const
         */
        BUTTONEPP_HELP = "HELP";
        /**
         * Epp button CLEAR
         * @const
         */
        BUTTONEPP_CLEAR = "CLEAR";
        /**
         * Epp button BACKSPACE
         * @const
         */
        BUTTONEPP_BACKSPACE = "BACKSPACE";
        /**
         * Epp button *
         * @const
         */
        BUTTONEPP_STAR = "*";
        /**
         * Epp button CORRECT
         * @const
         */
        BUTTONEPP_CORRECT = "CORRECT";
        /**
         * Epp button EDIT
         * @const
         */
        BUTTONEPP_EDIT = "EDIT";
        /**
         * Epp button R (right)
         * @const
         */
        BUTTONEPP_R = "R";
        /**
         * Epp button L (left)
         * @const
         */
        BUTTONEPP_L = "L";

        /**
         * Define from the Gui.dll for the callback function id for pressed eppkey
         * @const
         */
        GUI_COMM_CALLBACK_EPPKEY_PRESSED = 98;
        /**
         * Define from the Gui.dll for the callback function id for a status change of a claimed eppkey
         * @const
         */
        GUI_COMM_CALLBACK_EPPCLAIM_STATUS_CHANGE = 99;

        CLAIMSTATUS_DENIED = "DENIED";
        CLAIMSTATUS_ENABLED = "ENABLED";
        CLAIMSTATUS_DISABLED = "DISABLED";
        CLAIMSTATUS_DENIED_BUT_ENABLED = "DENIED_BUT_ENABLED";
        CLAIMSTATUS_DENIED_BUT_DISABLED = "DENIED_BUT_DISABLED";

        claimingData = new Map([
            ["F1", {"status": "RELEASED", "claims": 0}],
            ["F2", {"status": "RELEASED", "claims": 0}],
            ["F3", {"status": "RELEASED", "claims": 0}],
            ["F4", {"status": "RELEASED", "claims": 0}],
            ["F5", {"status": "RELEASED", "claims": 0}],
            ["F6", {"status": "RELEASED", "claims": 0}],
            ["F7", {"status": "RELEASED", "claims": 0}],
            ["F8", {"status": "RELEASED", "claims": 0}],
            ["1", {"status": "RELEASED", "claims": 0}],
            ["2", {"status": "RELEASED", "claims": 0}],
            ["3", {"status": "RELEASED", "claims": 0}],
            ["4", {"status": "RELEASED", "claims": 0}],
            ["5", {"status": "RELEASED", "claims": 0}],
            ["6", {"status": "RELEASED", "claims": 0}],
            ["7", {"status": "RELEASED", "claims": 0}],
            ["8", {"status": "RELEASED", "claims": 0}],
            ["9", {"status": "RELEASED", "claims": 0}],
            ["0", {"status": "RELEASED", "claims": 0}],
            ["*", {"status": "RELEASED", "claims": 0}],
            ["CANCEL", {"status": "RELEASED", "claims": 0}],
            ["CONFIRM", {"status": "RELEASED", "claims": 0}],
            ["CORRECT", {"status": "RELEASED", "claims": 0}],
            ["CLEAR", {"status": "RELEASED", "claims": 0}],
            ["BACKSPACE", {"status": "RELEASED", "claims": 0}],
            ["HELP", {"status": "RELEASED", "claims": 0}],
            ["EDIT", {"status": "RELEASED", "claims": 0}],
            ["R", {"status": "RELEASED", "claims": 0}],
            ["L", {"status": "RELEASED", "claims": 0}]
        ]);

        /**
         * Object containing the definitions of view-service events other services or view-models  may register for.
         */
        SERVICE_EVENTS = {
            /**
             * Sent if the claim status of any key changed.
             * @example
             * {
             *  "F1":{
             *          status: "ENABLED",  // tells if the current claiming is ENABLED/DISABLED due to higher prioritized claims of other UI instance
             *          claims: 3           // number of claims due to e.g. popUp
             *      }
             * }
             * @event Wincor.UI.Service.EppServiceMock#SERVICE_EVENTS:CLAIM_STATUS_CHANGED
             * @eventtype service
             */
            CLAIM_STATUS_CHANGED: "CLAIM_STATUS_CHANGED"
        };

        /**
         * See {@link Wincor.UI.Service.BaseServiceMock#constructor}.
         * @lifecycle service
         */
        constructor(...args) {
            super(...args);
            _logger.log(_logger.LOG_SRVC_INOUT, "> EppServiceMock::EppServiceMock");
            _logger.log(_logger.LOG_SRVC_INOUT, "< EppServiceMock::EppServiceMock");
        }

        /**
         * This method is called by the service-provider if an error occurred in any service
         * @eventhandler
         * @param {String} serviceName
         * @param {String} errorType
         */
        onError(serviceName, errorType) {
            _logger.log(_logger.LOG_SRVC_INOUT, `> EppServiceMock::onError(${serviceName}, ${errorType})`);
            _logger.log(_logger.LOG_SRVC_INOUT, "< EppServiceMock::onError");
        }

        fireClaimStatusChanged(updateData) {
            updateData = updateData || {};
            _logger.log(_logger.LOG_SRVC_INOUT, `> EppServiceMock::fireClaimStatusChanged('${JSON.stringify(updateData)}')`);

            /*
             * Sample data:
             * {
             *  "F1":{
             *          status: "ENABLED",  // tells if the current claiming is ENABLED/DISABLED due to higher prioritized claims of other UI instance
             *          claims: 3           // number of claims due to e.g. popUp
             *      }
             * }
             *
             * */
            if(Object.keys(updateData).length > 0) {
                for(let [key, value] of this.claimingData) {
                    let data = updateData[key];
                    if(data) {
                        if("status" in data) {
                            value.status = data.status;
                        }
                        if("claims" in data) {
                            value.claims = data.claims;
                        }
                    }

                }
            }
            if(this.claimingData.size > 0) {
                // JSON parse/stringify is really fast
                this.fireServiceEvent(this.SERVICE_EVENTS.CLAIM_STATUS_CHANGED, jQuery.extend(true, {}, strMapToObj(this.claimingData)));
            }
            _logger.log(_logger.LOG_SRVC_INOUT, "< EppServiceMock::fireClaimStatusChanged");
        }

        /**
         * Claim keys that should be able to use.
         * @param {Array} keys "F1","F2","F3","F4","F5","F6","F7","F8","F9", "0","1","2","3","4","5","6","7","8","9","R","L", "CONFIRM","CANCEL","HELP","CLEAR","BACKSPACE", "*"
         * @param {int} prio -1=configured prio
         * @param {function=} callbackClaim function pointer
         * @param {function=} callbackKeyPressedEvent
         * @param {function=} callbackClaimStatusChange
         */
        claimKeys(keys, prio, callbackClaim, callbackKeyPressedEvent, callbackClaimStatusChange) {
            _logger.log(_logger.LOG_SRVC_INOUT, "> EppServiceMock::claimKeys(keys: " + keys + ", prio:" + prio);
            let updateData = {}, claims, i, key;
            _claimId++;
            // save to key -> callback mapping!
            for(i = 0; i < keys.length; i++) {
                key = keys[i];
                if(!_eppKeyPressed2CallbackMap.has(key)) {
                    _eppKeyPressed2CallbackMap.set(key, [{id: _claimId, callback: callbackKeyPressedEvent}]);
                }
                else {
                    _logger.log(_logger.LOG_DETAIL, ". already claimed key: '" + key + "'. Adding callback...");
                    _eppKeyPressed2CallbackMap.get(key).push({id: _claimId, callback: callbackKeyPressedEvent});
                }
                if(callbackClaimStatusChange) {
                    if(!_eppKeyStatusChanged2CallbackMap.has(key)) {
                        _eppKeyStatusChanged2CallbackMap.set(key, [{id: _claimId, callback: callbackClaimStatusChange}]);
                    }
                    else {
                        _logger.log(_logger.LOG_DETAIL, ". already claimed key: '" + key + "'. Adding callback...");
                        _eppKeyStatusChanged2CallbackMap.get(key).push({id: _claimId, callback: callbackClaimStatusChange});
                    }
                }
            }

            let callbackRet = {claimId: _claimId};

            for(i = 0; i < keys.length; i++) {
                callbackRet[keys[i]] = "ENABLED";
                // add unknown EPP keys to the map to be more flexible for enhanced/different EPP types
                if(!this.claimingData.has(keys[i])) {
                    this.claimingData.set(keys[i], {"status": "RELEASED", "claims": 0});
                }
                claims = this.claimingData.get(keys[i]).claims + 1;
                updateData[keys[i]] = {
                    status: "ENABLED",
                    claims: claims
                };
            }

            if(callbackClaim) {
                window.setTimeout(callbackClaim.bind(null, callbackRet), 1);
            }
            this.fireClaimStatusChanged(updateData);
            _logger.log(_logger.LOG_SRVC_INOUT, "< EppServiceMock::claimKeys");
        }

        /**
         * Release claimed keys after usage.
         * @param {number} claimId The id returned by the claim result member result.claimId
         * @param {function=} callback function pointer
         */
        releaseKeys(claimId, callback) {
            this.logger.log(this.logger.LOG_SRVC_INOUT, "> EppService::releaseKeys(" + claimId + ")");
            if (claimId < 0) {
                this.logger.error("EPPService::releaseKeys invalid claimId " + claimId + " given callback: \n" + callback);
            }
            //var keys = keysArray.slice();
            let keysToRelease = [];
            let doRelease = false;
            // remove from key -> callback mapping!
            let updateData = {};

            // walk through map and find the entries with the claim id
            let claims;
            for (let [key, resultsArray] of _eppKeyPressed2CallbackMap) {
                resultsArray = resultsArray.filter(entry => entry.id !== claimId);
                claims = resultsArray.length;
                if (claims > 0) {
                    _eppKeyPressed2CallbackMap.set(key, resultsArray);
                } else {
                    _eppKeyPressed2CallbackMap.delete(key)
                }

                updateData[key] = {
                    claims: claims
                };
                this.logger.log(this.logger.LOG_SRVC_DATA, ". EppService::releaseKeys remaining callbacks for "+key+": "+claims);
                if (claims === 0) {
                    keysToRelease.push(key);
                    doRelease = true;
                    updateData[key].status = "RELEASED";
                }

                if (_eppKeyStatusChanged2CallbackMap.has(key)) {
                    resultsArray = _eppKeyStatusChanged2CallbackMap.get(key).filter(entry => entry.id !== claimId);
                    if (resultsArray.length > 0) {
                        _eppKeyStatusChanged2CallbackMap.set(key, resultsArray);
                    } else {
                        _eppKeyStatusChanged2CallbackMap.delete(key);
                    }
                }
            }

            this.fireClaimStatusChanged(updateData);

            if (doRelease) {
                this.logger.log(this.logger.LOG_SRVC_DATA, ". releasing keys -> " + keysToRelease);
            }
            if (callback) {
                window.setTimeout(callback, 1);
            }
            this.logger.log(this.logger.LOG_SRVC_INOUT, "< EppService::releaseKeys");
        }

        /**
         * Get number of FDKs available on this machine
         * @returns {number}
         * @async
         */
        async getNumberOfFDKs() {
            return 8;
        }
        
        /**
         * Called by the gateway whenever an event is received from the business-logic.
         * Override in subclass.
         * @param {object} message
         * @eventhandler
         */
        onEvent(message) {
            _logger.log(_logger.LOG_SRVC_INOUT, `> EppServiceMock::onEvent('${JSON.stringify(message)}')`);
            if(message.methodName === "KeyPressed") {
                //check for registered callbacks for this key
                if(_eppKeyPressed2CallbackMap.has(message.key)) {
                    let delegates = _eppKeyPressed2CallbackMap.get(message.key);
                    if(delegates) {
                        // The new claim handling expects all handlers to be informed
                        let activeFunctionCalled = false;
                        let beepAllowedFromCallbacks = true;
                        delegates.forEach(delegateObj => {
                            try {
                                // delegates can return "true" if an action was done that requires us to beep
                                let ret = delegateObj.callback(message.key);
                                if (ret === false) {
                                    // callbacks can explicitly silence beeping by returning "false"
                                    // no direct assignment to ret here, because of different meaning of false and undefined
                                    beepAllowedFromCallbacks = false;
                                }
                                activeFunctionCalled |= ret;
                            } catch(e) {
                                _logger.error(`Epp event ${message.key} caught exception ${e.message} for ${delegateObj.callback}`);
                            }
                        });
                        const beepService = this.serviceProvider.BeepService;
                        const adaService = this.serviceProvider.AdaService;
                        const eppInactiveKeyCode = beepService.beepInactiveKeyCode;
                        // Beep warning if ADA not ON, basically the BeepService checks whether beeping is allowed!
                        // Before we beep a warning we have to be aware of the fact whether this execution source was really an EPP key event and not any other,
                        // e.g. programmatically calls of command execute!
                        // We assume that a command which is claimed owns a valid claim id.
                        if(beepAllowedFromCallbacks && adaService.state !== adaService.STATE_VALUES.SPEAK) {
                            if(activeFunctionCalled) {
                                beepService.beep(); // warning beep
                            } else {
                                _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `. EppServiceMock::onEvent trigger warning beep for inactive EPP key '${message.key}' with beep code=${eppInactiveKeyCode}`);
                                beepService.beep(eppInactiveKeyCode); // warning beep
                            }
                        } else {
                            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `. EppServiceMock::onEvent ada active, skipping beep`);
                        }
                    } else {
                        _logger.log(_logger.LOG_DETAIL, `. KeyPressed(): delegate for key: '${message.key}' is null.`);
                    }
                } else {
                    _logger.log(_logger.LOG_DETAIL, `. KeyPressed(): No callback found for key: '${message.key}'.`);
                }
                _logger.log(_logger.LOG_SRVC_INOUT, "< EppServiceMock::onEvent");
            }
        }

        /**
         * See {@link Wincor.UI.Service.BaseServiceMock#onSetup}
         *
         * @param {object} message      See {@link Wincor.UI.Service.BaseServiceMock#onSetup}
         * @returns {Promise}
         * @lifecycle service
         */
        onSetup(message) {
            _logger.log(_logger.LOG_SRVC_INOUT, `> EppServiceMock::onSetup('${JSON.stringify(message)}')`);
            return ext.Promises.promise(resolve => {
                resolve();
                _logger.log(_logger.LOG_SRVC_INOUT, "< EppServiceMock::onSetup");
            });
        }

        /**
         * See {@link Wincor.UI.Service.BaseServiceMock#onServicesReady}
         * @returns {Promise}
         * @lifecycle service
         */
        onServicesReady() {
            _logger.log(_logger.LOG_SRVC_INOUT, "> EppServiceMock::onServicesReady()");
            return ext.Promises.promise(resolve => {
                let viewService = this.serviceProvider.ViewService;
                viewService.registerForServiceEvent(viewService.SERVICE_EVENTS.SHUTDOWN, () => {
                    _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, "* EppServiceMock::onServicesReady() content shutdown in progress - release all EPP keys");
                    let tempEppKeyPressed2CallbackMap = new Map(_eppKeyPressed2CallbackMap);
                    for(let [key, resultsArray] of tempEppKeyPressed2CallbackMap) {
                        resultsArray.forEach(item => {
                            this.releaseKeys(item.id);
                        });
                    }
                    _eppKeyPressed2CallbackMap.clear();
                    _eppKeyStatusChanged2CallbackMap.clear();
                }, true);
                super.onServicesReady().then(resolve);
                _logger.log(_logger.LOG_SRVC_INOUT, "< EppServiceMock::onServicesReady");
            });
        }
    }
};

/**
 * The EppServiceMock simulates the EPP device regarding claiming/releasing EPP keys.
 *
 * @function getServiceClass
 * @param {Class} Class
 * @param {BaseService} BaseService
 * @param {ext} ext
 * @param {LogProvider} LogProvider
 * @returns {Wincor.UI.Service.Provider.EppService}
 * @class
 * @since 1.2/00
 */
export default getServiceClass;
