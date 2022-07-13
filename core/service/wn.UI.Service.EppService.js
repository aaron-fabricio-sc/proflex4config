/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ wn.UI.Service.EppService.js 4.3.1-210420-21-c476740e-1a04bc7d
 */

/**
 * @module
 */
const getServiceClass = ({ Wincor, jQuery, LogProvider, PTService }) => {

    const _logger = LogProvider;

    let _claimId = 0;

    //"F1": [{
    //    id: 23,
    //    callback: function(){}
    //}]

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

    return class EppService extends PTService {
        // PRIVATE MEMBER

        claimingData = {
            F1: { status: "RELEASED", claims: 0 },
            F2: { status: "RELEASED", claims: 0 },
            F3: { status: "RELEASED", claims: 0 },
            F4: { status: "RELEASED", claims: 0 },
            F5: { status: "RELEASED", claims: 0 },
            F6: { status: "RELEASED", claims: 0 },
            F7: { status: "RELEASED", claims: 0 },
            F8: { status: "RELEASED", claims: 0 },
            1: { status: "RELEASED", claims: 0 },
            2: { status: "RELEASED", claims: 0 },
            3: { status: "RELEASED", claims: 0 },
            4: { status: "RELEASED", claims: 0 },
            5: { status: "RELEASED", claims: 0 },
            6: { status: "RELEASED", claims: 0 },
            7: { status: "RELEASED", claims: 0 },
            8: { status: "RELEASED", claims: 0 },
            9: { status: "RELEASED", claims: 0 },
            0: { status: "RELEASED", claims: 0 },
            "*": { status: "RELEASED", claims: 0 },
            CANCEL: { status: "RELEASED", claims: 0 },
            CONFIRM: { status: "RELEASED", claims: 0 },
            CORRECT: { status: "RELEASED", claims: 0 },
            CLEAR: { status: "RELEASED", claims: 0 },
            BACKSPACE: { status: "RELEASED", claims: 0 },
            HELP: { status: "RELEASED", claims: 0 },
            EDIT: { status: "RELEASED", claims: 0 },
            R: { status: "RELEASED", claims: 0 },
            L: { status: "RELEASED", claims: 0 }
        };

        /**
         * Epp button F1
         * @const
         * @type {string}
         */
        BUTTONEPP_F1 = "F1";
        
        /**
         * Epp button F2
         * @const
         * @type {string}
         */
        BUTTONEPP_F2 = "F2";
        
        /**
         * Epp button F3
         * @type {string}
         * @const
         */
        BUTTONEPP_F3 = "F3";
        
        /**
         * Epp button F4
         * @type {string}
         * @const
         */
        BUTTONEPP_F4 = "F4";
        
        /**
         * Epp button F5
         * @type {string}
         * @const
         */
        BUTTONEPP_F5 = "F5";
        
        /**
         * Epp button F6
         * @type {string}
         * @const
         */
        BUTTONEPP_F6 = "F6";
        
        /**
         * Epp button F7
         * @type {string}
         * @const
         */
        BUTTONEPP_F7 = "F7";
        
        /**
         * Epp button F8
         * @type {string}
         * @const
         */
        BUTTONEPP_F8 = "F8";
        
        /**
         * Epp button F9
         * @type {string}
         * @const
         */
        BUTTONEPP_F9 = "F9";
        
        /**
         * Epp button 0
         * @type {string}
         * @const
         */
        BUTTONEPP_0 = "0";
        
        /**
         * Epp button 1
         * @type {string}
         * @const
         */
        BUTTONEPP_1 = "1";
        
        /**
         * Epp button 2
         * @type {string}
         * @const
         */
        BUTTONEPP_2 = "2";
        
        /**
         * Epp button 3
         * @type {string}
         * @const
         */
        BUTTONEPP_3 = "3";
        
        /**
         * Epp button 4
         * @type {string}
         * @const
         */
        BUTTONEPP_4 = "4";
        
        /**
         * Epp button 5
         * @type {string}
         * @const
         */
        BUTTONEPP_5 = "5";
        
        /**
         * Epp button 6
         * @type {string}
         * @const
         */
        BUTTONEPP_6 = "6";
        
        /**
         * Epp button 7
         * @type {string}
         * @const
         */
        BUTTONEPP_7 = "7";
        
        /**
         * Epp button 8
         * @type {string}
         * @const
         */
        BUTTONEPP_8 = "8";
        
        /**
         * Epp button 9
         * @type {string}
         * @const
         */
        BUTTONEPP_9 = "9";
        
        /**
         * Epp button CONFIRM
         * @type {string}
         * @const
         */
        BUTTONEPP_CONFIRM = "CONFIRM";
        
        /**
         * Epp button CANCEL
         * @type {string}
         * @const
         */
        BUTTONEPP_CANCEL = "CANCEL";
        
        /**
         * Epp button HELP
         * @type {string}
         * @const
         */
        BUTTONEPP_HELP = "HELP";
        
        /**
         * Epp button CLEAR
         * @type {string}
         * @const
         */
        BUTTONEPP_CLEAR = "CLEAR";
        
        /**
         * Epp button BACKSPACE
         * @type {string}
         * @const
         */
        BUTTONEPP_BACKSPACE = "BACKSPACE";
        
        /**
         * Epp button *
         * @type {string}
         * @const
         */
        BUTTONEPP_STAR = "*";
        
        /**
         * Epp button CORRECT
         * @type {string}
         * @const
         */
        BUTTONEPP_CORRECT = "CORRECT";
        
        /**
         * Epp button EDIT
         * @type {string}
         * @const
         */
        BUTTONEPP_EDIT = "EDIT";
        
        /**
         * Epp button R (right)
         * @type {string}
         * @const
         */
        BUTTONEPP_R = "R";
        
        /**
         * Epp button L (left)
         * @type {string}
         * @const
         */
        BUTTONEPP_L = "L";

        /**
         * Define from the Gui.dll for the callback function id for pressed eppkey
         * @type {number}
         * @const
         */
        GUI_COMM_CALLBACK_EPPKEY_PRESSED = 98;
        
        /**
         * Define from the Gui.dll for the callback function id for a status change of a claimed eppkey
         * @type {number}
         * @const
         */
        GUI_COMM_CALLBACK_EPPCLAIM_STATUS_CHANGE = 99;

        /**
         * @type {string}
         * @default "DENIED"
         * @const
         */
        CLAIMSTATUS_DENIED = "DENIED";
        
        /**
         * @type {string}
         * @default "ENABLED"
         * @const
         */
        CLAIMSTATUS_ENABLED = "ENABLED";
        
        /**
         * @type {string}
         * @default "DISABLED"
         * @const
         */
        CLAIMSTATUS_DISABLED = "DISABLED";
        
        /**
         * @type {string}
         * @default "DEDENIED_BUT_ENABLEDNIED"
         * @const
         */
        CLAIMSTATUS_DENIED_BUT_ENABLED = "DENIED_BUT_ENABLED";
        
        /**
         * @type {string}
         * @default "DENIED_BUT_DISABLED"
         * @const
         */
        CLAIMSTATUS_DENIED_BUT_DISABLED = "DENIED_BUT_DISABLED";

        /**
         * Priority.
         * @default 4
         * @type {number}
         */
        prio = 4;

        /**
         * Object containing the definitions of view-service events other services or view-models  may register for.
         * @type {*}
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
             * @event Wincor.UI.Service.EppService#SERVICE_EVENTS:CLAIM_STATUS_CHANGED
             * @eventtype service
             */
            CLAIM_STATUS_CHANGED: "CLAIM_STATUS_CHANGED"
        };

        /**
         * "EppService" - the logical name of this service as used in the service-provider
         * @const
         * @type {string}
         */
        NAME = "EppService";

        /**
         * See {@link Wincor.UI.Service.PTService#constructor}.
         * Initializes members
         * @lifecycle service
         */
        constructor(...args) {
            super(...args);
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> EppService::EppService");
            this.FRM_RESOLVE_REQUEST.service = this.NAME;
            this.FRM_RESOLVE_REQUEST.FWName = "CCEppFW";
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< EppService::EppService");
        }
        
        /**
         * EPPService needs to overwrite onResponse, to be able to handle the "special" delegates containing claimIds
         * @param {object} message
         */
        onResponse(message) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> EppService::onResponse('${JSON.stringify(message)}')`);

            if (message && this.responseMap.has(message.callbackIdx)) {
                let delegate = this.responseMap.get(message.callbackIdx);
                if (delegate) {
                    if (message.FWFuncID === 4002 && message.RC === 0) {
                        //no '==='
                        /*
                         message.param2 has the EPP keys,   e.g. ["4","5","F5","F4"]
                         message.param3 has the values, i.e. ["ENABLED","ENABLED","ENABLED","ENABLED","ENABLED"]

                         response will be an object:
                         response["4"] = "ENABLED"
                         response["F5"] = "DISABLED"
                         ...
                         */
                        let updateData = {};
                        let value;
                        let response = {};
                        response["claimId"] = delegate.claimId;
                        _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `EppService::onResponse claimId: [${delegate.claimId}] -> response: ${JSON.stringify(response, null, " ")}`);
                        if (message.param2) {
                            message.param2.forEach(function(key, index) {
                                value = _eppKeyPressed2CallbackMap.get(key);
                                response[key] = message.param3[index];
                                updateData[key] = {
                                    status: message.param3[index],
                                    claims: value ? value.length : 0
                                };
                            }, this);
                        } else {
                            _logger.error("EppService::onResponse argument 'message' is invalid: Property 'param2' expected !");
                        }
                        this.fireClaimStatusChanged(updateData);
                        _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `EppService::onResponse -> response: ${JSON.stringify(response, null, " ")}`);
                        try {
                            delegate()(response);
                        } catch (e) {
                            // Provider writes error-log
                            Wincor.UI.Service.Provider.propagateError(this.NAME, this.ERROR_TYPE.RESPONSE, e);
                        }
                    } else if (message.FWFuncID === 4002 || message.FWFuncID === 4003 || message.FWFuncID === 4004 || message.FWFuncID === 4005) {
                        try {
                            if (message.FWFuncID === 4002) {
                                delegate()(message.RC);
                            } else {
                                delegate(message.RC);
                            }
                        } catch (e) {
                            // Provider writes error-log
                            Wincor.UI.Service.Provider.propagateError(this.NAME, this.ERROR_TYPE.RESPONSE, e);
                        }
                    } else if (message.FWFuncID === 8) {
                        delegate(message);
                    } else {
                        _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `EppService::onResponse message with FWFuncID '${message.FWFuncID}' and RC = '${message.RC}' will not be evaluated.`);
                    }
                } else {
                    _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `EppService::onResponse No callback found for idx '${message.callbackIdx}'.`);
                }
                this.responseMap.delete(message.callbackIdx); //remove processed callback
            }
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< EppService::onResponse");
        }

        /**
         * Merges optional updateData and fires event for current claim status
         * @param updateData
         * @fires Wincor.UI.Service.EppService#SERVICE_EVENTS:CLAIM_STATUS_CHANGED
         */
        fireClaimStatusChanged(updateData) {
            if (!this.hasReceivers(this.SERVICE_EVENTS.CLAIM_STATUS_CHANGED)) {
                return;
            }

            updateData = updateData || {};
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> EppService::fireClaimStatusChanged('${JSON.stringify(updateData)}')`);

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
            let keys = Object.keys(this.claimingData);
            keys.forEach(key => {
                let data = updateData[key];
                if (data) {
                    // add unknown EPP keys to the map to be more flexible for enhanced/different EPP types
                    if (!(key in this.claimingData)) {
                        this.claimingData[key] = { status: "RELEASED", claims: 0 };
                    }
                    if ("status" in data) {
                        this.claimingData[key].status = data.status;
                    }
                    if ("claims" in data) {
                        this.claimingData[key].claims = data.claims;
                    }
                }
            });
            if (keys.length > 0) {
                // Clone the claimingData object
                this.fireServiceEvent(this.SERVICE_EVENTS.CLAIM_STATUS_CHANGED, jQuery.extend(true, {}, this.claimingData));
            }
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< EppService::fireClaimStatusChanged");
        }

        /**
         * Event will be triggered on incoming message for EppService
         * @param {Object} message
         */
        onEvent(message) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> EppService::onEvent('${JSON.stringify(message)}')`);
            if (message) {
                let delegates;
                let msgKey = message.key;
                if (message.methodName === "KeyPressed") {
                    _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `. KeyPressed(), key: '${msgKey}'.`);
                    //check for registered callbacks for this key
                    if (_eppKeyPressed2CallbackMap.has(msgKey)) {
                        delegates = _eppKeyPressed2CallbackMap.get(msgKey);
                        if (delegates) {
                            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, ". KeyPressed(): calling delegate!");
                            // The new claim handling expects all handlers to be informed
                            let activeFunctionCalled = false;
                            let beepAllowedFromCallbacks = true;
                            delegates.forEach(delegateObj => {
                                try {
                                    // delegates can return "true" if an action was done that requires us to beep
                                    let ret = delegateObj.callback(msgKey);
                                    if (ret === false) {
                                        // callbacks can explicitly silence beeping by returning "false"
                                        // no direct assignment to ret here, because of different meaning of false and undefined
                                        beepAllowedFromCallbacks = false;
                                    }
                                    activeFunctionCalled |= ret;
                                } catch (e) {
                                    _logger.error(`Epp event ${msgKey} caught exception ${e.message} for ${delegateObj.callback}`);
                                }
                            });
                            const beepService = this.serviceProvider.BeepService;
                            const adaService = this.serviceProvider.AdaService;
                            const eppInactiveKeyCode = beepService.beepInactiveKeyCode;
                            // Beep warning if ADA not ON, basically the BeepService checks whether beeping is allowed!
                            // Before we beep a warning we have to be aware of the fact whether this execution source was really an EPP key event and not any other,
                            // e.g. programmatically calls of command execute!
                            // We assume that a command which is claimed owns a valid claim id.
                            if (beepAllowedFromCallbacks && adaService.state !== adaService.STATE_VALUES.SPEAK) {
                                if (activeFunctionCalled) {
                                    beepService.beep(); // warning beep
                                } else {
                                    _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `. EppService::onEvent trigger warning beep for inactive EPP key '${message.key}' with beep code=${eppInactiveKeyCode}`);
                                    beepService.beep(eppInactiveKeyCode); // warning beep
                                }
                            } else {
                                _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `. EppService::onEvent ada active, skipping beep`);
                            }
                        } else {
                            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `. KeyPressed(): delegate for key: '${msgKey}' is null.`);
                        }
                    } else {
                        _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `. KeyPressed(): No callback found for key: '${msgKey}'.`);
                    }
                    //sending acknowledge! Gui.dll is waiting for this, because pressed EPP keys must be handled synchronously to avoid mixing up the sequence in input fields if
                    //the keys are pressed quickly.
                    let acknowledgeMsg = {};
                    acknowledgeMsg.service = this.NAME;
                    acknowledgeMsg.eventName = "KeyPressedHandled";
                    this.sendEvent(acknowledgeMsg);
                } else if (message.methodName === "ClaimStatusChange") {
                    _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `. ClaimStatusChange(), key: '${msgKey}', status: '${message.status}'`);

                    //check for registered callbacks for this key
                    if (_eppKeyStatusChanged2CallbackMap.has(msgKey)) {
                        delegates = _eppKeyStatusChanged2CallbackMap.get(msgKey);
                        let updateData = {};
                        updateData[msgKey] = {
                            status: message.status,
                            claims: _eppKeyPressed2CallbackMap.get(msgKey).length
                        };
                        this.fireClaimStatusChanged(updateData);
                        if (delegates) {
                            // The new claim handling expects all handlers to be informed
                            delegates.forEach(claimObject => {
                                try {
                                    _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `. ClaimStatusChange: calling delegate with claimId ${claimObject.id}`);
                                    claimObject.callback(msgKey, message.status);
                                } catch (e) {
                                    _logger.error(`Epp event ${msgKey} caught exception ${e.message} for ${claimObject.callback}`);
                                }
                            });
                        } else {
                            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `. ClaimStatusChange(): delegate for key: '${msgKey}' is null.`);
                        }
                    } else {
                        _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `. ClaimStatusChange(): No callback found for key: '${msgKey}'.`);
                    }
                }
            } else {
                _logger.error("Epp event message is undefined !");
            }
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< EppService::onEvent");
        }

        /**
         * Claim keys that should be able to use.
         * @param {Array} keys "F1","F2","F3","F4","F5","F6","F7","F8","F9", "0","1","2","3","4","5","6","7","8","9","R","L", "CONFIRM","CANCEL","HELP","CLEAR","BACKSPACE", "*"
         * @param {number} prio -1=configured prio
         * @param {function} callbackClaim The callback will receive a claiming result object containing the claimId to be used for releasing and the status of claiming for the single keys.
         * @param {function} callbackKeyPressedEvent Called for receiving the key pressed events
         * @param {function} callbackClaimStatusChange Called for receiving claim status change events
         */
        claimKeys(keys, prio, callbackClaim, callbackKeyPressedEvent, callbackClaimStatusChange) {
            _claimId++;
            if (_claimId === Number.MAX_VALUE) {
                _claimId = 1;
            }
            // add claim id as attribute to all available function objects
            let markedCallback;
            // callback might always be the same function of caller, so wrap and mark with id to be able to pass the id with result in onResponse for our claim request
            if (callbackClaim) {
                markedCallback = function(cb) {
                    return cb;
                }.bind(null, callbackClaim);
                markedCallback.claimId = _claimId;
            }
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> EppService::claimKeys(keys: ${keys} prio:${prio} id: ${_claimId}`);
            if (!prio || prio === -1) {
                prio = this.prio;
            }

            // save to key -> callback mapping!
            for (let i = 0; i < keys.length; i++) {
                if (!_eppKeyPressed2CallbackMap.has(keys[i])) {
                    _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `. claiming key: '${keys[i]}'. setting callback...`);
                    _eppKeyPressed2CallbackMap.set(keys[i], [{ id: _claimId, callback: callbackKeyPressedEvent }]);
                } else {
                    _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `. already claimed key: '${keys[i]}'. Adding callback...`);
                    _eppKeyPressed2CallbackMap.get(keys[i]).push({ id: _claimId, callback: callbackKeyPressedEvent });
                }

                if (callbackClaimStatusChange) {
                    if (!_eppKeyStatusChanged2CallbackMap.has(keys[i])) {
                        _eppKeyStatusChanged2CallbackMap.set(keys[i], [{ id: _claimId, callback: callbackClaimStatusChange }]);
                    } else {
                        _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `. already claimed key: '${keys[i]}'. Adding callback...`);
                        _eppKeyStatusChanged2CallbackMap.get(keys[i]).push({ id: _claimId, callback: callbackClaimStatusChange });
                    }
                }
            }

            // multiple claims seem not to be a problem, so just route it through... otherwise result object would not be available
            this.FRM_RESOLVE_REQUEST.FWFuncID = 4002; //pce::eppsync::FUNC_CLAIM_KEYS
            this.FRM_RESOLVE_REQUEST.param1 = this.serviceProvider.ConfigService.configuration.instanceName;
            this.FRM_RESOLVE_REQUEST.meta1 = ["CHAR_ANSI", -1];
            this.FRM_RESOLVE_REQUEST.param2 = keys;
            this.FRM_RESOLVE_REQUEST.meta2 = ["PARLIST_ANSI", -1];
            this.FRM_RESOLVE_REQUEST.param3 = [];
            this.FRM_RESOLVE_REQUEST.meta3 = ["PARLIST_ANSI", 2048];
            this.FRM_RESOLVE_REQUEST.param4 = this.GUI_COMM_CALLBACK_EPPKEY_PRESSED;
            this.FRM_RESOLVE_REQUEST.meta4 = ["SHORT", 0];
            this.FRM_RESOLVE_REQUEST.param5 = this.GUI_COMM_CALLBACK_EPPCLAIM_STATUS_CHANGE;
            this.FRM_RESOLVE_REQUEST.meta5 = ["SHORT", 0];
            this.FRM_RESOLVE_REQUEST.paramUL = prio;

            _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, `. request to send: '${JSON.stringify(this.FRM_RESOLVE_REQUEST)}'.`);
            this.FrmResolve(this.FRM_RESOLVE_REQUEST, markedCallback);
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< EppService::claimKeys");
        }

        /**
         * Release claimed keys after usage.
         * @param {number} claimId The id returned by the claim result member result.claimId
         * @param callback function pointer
         */
        releaseKeys(claimId, callback) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> EppService::releaseKeys(${claimId})`);
            if (claimId < 0) {
                _logger.error(`EPPService::releaseKeys invalid claimId ${claimId} given callback: \n ${callback}`);
            }
            let keysToRelease = [];
            let doRelease = false;
            // remove from key -> callback mapping!
            let updateData = {};
            // walk through map and find the entries with the claim id
            let claims;
            for (let [key, resultsArray] of _eppKeyPressed2CallbackMap.entries()) {
                resultsArray = resultsArray.filter(entry => entry.id !== claimId);
                claims = resultsArray.length;
                if (claims > 0) {
                    _eppKeyPressed2CallbackMap.set(key, resultsArray);
                } else {
                    _eppKeyPressed2CallbackMap.delete(key);
                }

                updateData[key] = {
                    claims: claims
                };
                _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, `. EppService::releaseKeys remaining callbacks for ${key}: ${claims}`);
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
                _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, `. releasing keys -> ${keysToRelease}`);
                this.FRM_RESOLVE_REQUEST.FWFuncID = 4003; //pce::eppsync::FUNC_RELEASE_KEY
                this.FRM_RESOLVE_REQUEST.param1 = this.serviceProvider.ConfigService.configuration.instanceName;
                this.FRM_RESOLVE_REQUEST.meta1 = ["CHAR_ANSI", -1];
                this.FRM_RESOLVE_REQUEST.param2 = keysToRelease;
                this.FRM_RESOLVE_REQUEST.meta2 = ["PARLIST_ANSI", -1];
                this.FRM_RESOLVE_REQUEST.param3 = [];
                this.FRM_RESOLVE_REQUEST.meta3 = ["NULL", 0];

                _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, `. request to send: '${JSON.stringify(this.FRM_RESOLVE_REQUEST)}'.`);
                this.FrmResolve(this.FRM_RESOLVE_REQUEST, callback);
            } else {
                window.setTimeout(callback, 1);
            }
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< EppService::releaseKeys");
        }

        /**
         * Get number of FDKs available on this machine
         * @returns {number}
         * @async
         */
        async getNumberOfFDKs() {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> EppService::getNumberOfFDKs()");
            this.FRM_RESOLVE_REQUEST.FWFuncID = 8; //eppfw.InfCmdFuncKeyDetail
            this.FRM_RESOLVE_REQUEST.param1 = 0;
            this.FRM_RESOLVE_REQUEST.meta1 = ["ULONG", 0];
            this.FRM_RESOLVE_REQUEST.param2 = 0;
            this.FRM_RESOLVE_REQUEST.meta2 = ["HEX", 16000];
            this.FRM_RESOLVE_REQUEST.param3 = [];
            this.FRM_RESOLVE_REQUEST.meta3 = ["NULL", 0];

            _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, `. request to send: '${JSON.stringify(this.FRM_RESOLVE_REQUEST)}'.`);
            return new Promise((resolve, reject) => {
                let numberFDKs = 0;
                this.FrmResolve(this.FRM_RESOLVE_REQUEST, message => {
                    if (message.RC === 0) {
                        /*
                            typedef struct _pin_funckey_detail
                            {
                                ULONG       ulFuncMask;     -> byte 0-7
                                USHORT      usNumberFDKs;   -> byte 8-12 <-   we want this USHORT
                                PIN_FDK     aPinFDK[LNG_PINFDK_M+1]; -> rest
                            } PIN_FUNCKEY_DETAIL, * LPPIN_FUNCKEY_DETAIL;
                        */
                        numberFDKs = parseInt(
                            message.param2
                                .slice(8, 12)
                                .match(/.{1,2}/g)
                                .reverse()
                                .join(""),
                            16
                        );
                        _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `< EppService::getNumberOfFDKs returns <${numberFDKs}>`);
                        resolve(numberFDKs);
                    } else {
                        _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `< EppService::getNumberOfFDKs returned error <${message.RC}>`);
                        reject();
                    }
                });
            });
        }

        /**
         * See {@link Wincor.UI.Service.BaseService#onServicesReady}
         * Reads the configuration for "ClaimKeysPrio" during initialization
         *
         * @async
         * @lifecycle service
         */
        async onServicesReady() {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> EppService::onServicesReady()");
            let viewService = this.serviceProvider.ViewService;
            viewService.registerForServiceEvent(
                viewService.SERVICE_EVENTS.SHUTDOWN,
                () => {
                    _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, "* EppService::onServicesReady() content shutdown in progress - release all EPP keys");
                    let tempEppKeyPressed2CallbackMap = new Map(_eppKeyPressed2CallbackMap);
                    for(let [key, resultsArray] of tempEppKeyPressed2CallbackMap) {
                        resultsArray.forEach(item => {
                            this.releaseKeys(item.id);
                        });
                    }
                    _eppKeyPressed2CallbackMap.clear();
                    _eppKeyStatusChanged2CallbackMap.clear();
                },
                true
            );

            let generalSection = `${Wincor.UI.Service.Provider.ConfigService.configuration.instanceName}\\Services\\General`;
            let key = "ClaimKeysPrio";
            let result = await Wincor.UI.Service.Provider.ConfigService.getConfiguration(generalSection, [key]);
            if(result) {
                if(result[key] === "") {
                    this.prio = 4;
                } else {
                    this.prio = result[key];
                }
            }
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `* EppService::onServicesReady(): prio=${this.prio}`);
            await super.onServicesReady();

            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< EppService::onServicesReady");
        }
    }
};

/**
 * The EppService has a summary of routines to deal with the hardware (soft keys, function keys). It uses the CEN/XFS keywords for the EPP treatment.
 *
 * @function getServiceClass
 * @param {Wincor} Wincor
 * @param {LogProvider} LogProvider
 * @param {PTService} PTService
 * @returns {Wincor.UI.Service.EppService}
 * @class
 * @since 1.0/00
 */
export default getServiceClass;
