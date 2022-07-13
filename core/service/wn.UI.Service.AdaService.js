/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ wn.UI.Service.AdaService.js 4.3.1-210203-21-1b8704b6-1a04bc7d

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

    
    return class AdaService extends PTService {
        /**
         * The logical name of this service as used in the service-provider
         * @const
         * @type {string}
         * @default "AdaService"
         */
        NAME = "AdaService";

        /**
         * Defines the response internal name mapping for the function {@link Wincor.UI.Service.AdaService#adaCommand}
         * for the business-logic dispatching a request to us.
         * @const
         * @private
         * @type {string}
         * @default "adaCommand"
         */
        METHOD_ADACOMMAND = "adaCommand";

        /**
         * The actual state of ADA service, changed by function {@link Wincor.UI.Service.AdaService#adaCommand}.
         * For possible values see: {@link Wincor.UI.Service.AdaService#STATE_VALUES}
         * @type {string}
         */
        state = "";

        /**
         * Object containing the value definitions for state of ADA service {@link Wincor.UI.Service.AdaService#state}.
         * @enum {string}
         */
        STATE_VALUES = {
            /**
             * Defines the inactive state for ADA service.
             * ViewModel should do nothing.
             * @type {string}
             */
            DONOTHING: "DONOTHING",
            /**
             * Defines the idle state for ADA service.
             * ViewModel should prepare ADA texts.
             * @type {string}
             */
            BEREADY: "BEREADY",
            /**
             * Defines the active state for ADA service.
             * ViewModel should prepare ADA texts and speak them.
             * @type {string}
             */
            SPEAK: "SPEAK"
        };

        /**
         * This flag is true when error happens in ADA framework and one view in the GUI have to be ended
         * with ADA error return code.
         * This flag should be set to false when the one view in the GUI is ended with ADA error return code.
         * @type {boolean}
         * @default false
         */
        errorHappened = false;

        /**
         * This flag is true when ADA service enters active state and no speak is done yet.
         * This flag should be set to false when the first speak is done or ADA service leaves active state.
         * @type {boolean}
         * @default false
         */
        firstSpeak = false;

        /**
         * This flag is true when ADA service is speaking.
         * @type {boolean}
         * @default false
         */
        isSpeaking = false;

        /**
         * This flag is true, if autoRepeat has been called with argument > 0
         * @type {boolean}
         * @default false
         */
        isAutoRepeatActive = false;

        /**
         * Events register IDs for control of isSpeaking flag.
         * @type {number}
         * @private
         */
        event1Id = 0;
        event2Id = 0;
        event4Id = 0;
        event5Id = 0;

        /**
         * Object containing the definitions of view-service events other services or view-models  may register for.
         * @enum {string}
         */
        SERVICE_EVENTS = {
            /**
             * Sent when state of ADA service {@link Wincor.UI.Service.AdaService#state} changes.
             * @see {@link Wincor.UI.Service.AdaService#STATE_VALUES}
             * @event Wincor.UI.Service.AdaService#SERVICE_EVENTS:STATE_CHANGED
             * @eventtype service
             */
            STATE_CHANGED: "STATE_CHANGED",
            /**
             * Sent when error handling flag {@link Wincor.UI.Service.AdaService#errorHappened} is set to true.
             * @type {String}
             * @event Wincor.UI.Service.AdaService#SERVICE_EVENTS:ERROR_HAPPENED
             * @eventtype service
             */
            ERROR_HAPPENED: "ERROR_HAPPENED",
            /**
             * Sent when ADA speaking flag {@link Wincor.UI.Service.AdaService#isSpeaking} is changing from true to false.
             * @type {String}
             * @event Wincor.UI.Service.AdaService#SERVICE_EVENTS:SPEAKING_STOPPED
             * @eventtype service
             */
            SPEAKING_STOPPED: "SPEAKING_STOPPED",
            /**
             * Sent once when the ADA transaction begins.
             * @type {String}
             * @event Wincor.UI.Service.AdaService#SERVICE_EVENTS:FIRST_START
             * @eventtype service
             */
            FIRST_START: "FIRST_START",
            /**
             * Sent once when the ADA transaction ends.
             * @type {String}
             * @event Wincor.UI.Service.AdaService#SERVICE_EVENTS:LAST_STOP
             * @eventtype service
             */
            LAST_STOP: "LAST_STOP",

            /**
             * Sent when ADA text is on repeat.
             * @type {String}
             * @event Wincor.UI.Service.AdaService#SERVICE_EVENTS:REPEAT
             * @eventtype service
             */
            REPEAT: "REPEAT"
        };

        /**
         * See {@link Wincor.UI.Service.PTService#constructor}.<br>
         * This method initialise METHOD_ADACOMMAND request delegate.
         * The member {@link Wincor.UI.Service.AdaService#state} is initialised to DONOTHING.
         *
         * @param {Array} args
         * @lifecycle service
         */
        constructor(...args) {
            super(...args);
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> AdaService::AdaService");

            this.state = this.STATE_VALUES.DONOTHING;
            this.viewIdWhenRepeatWasStarted = -1;
            this.FRM_RESOLVE_REQUEST.service = this.NAME;
            this.FRM_RESOLVE_REQUEST.FWName = "CCAdaFW";

            //fill up request delegate
            this.requestMap.set(this.METHOD_ADACOMMAND, this.adaCommand.bind(this));
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< AdaService::AdaService");
        }
        
        /**
         * Called automatically as soon as there is an answer to an asynchronous ProTopas request. See {@link Wincor.UI.Service.BaseService#translateResponse}.
         * This method retruns return code (RC) of supported function ID's, else (-1)
         *
         * @param {object} message    Response object, see {@link Wincor.UI.Service.BaseService#translateResponse}.
         * @returns {number} ret      Return code (RC) of supported function ID's, else (-1).
         */
        translateResponse(message) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> AdaService::translateResponse('${JSON.stringify(message)}')`);
            // if Speak("some text", ...) is OK then TTS is speaking!
            let ret,
                funcId = message.FWFuncID;

            if (funcId === 4) {
                if (message.RC === 0 && message.param1 && message.param1.length !== 0) {
                    if (!this.isSpeaking) {
                        this.isSpeaking = true;
                    }
                }
            }
            // always return message.RC
            ret = message.RC;
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `< AdaService::translateResponse returns ${ret}`);
            return ret;
        }

        /**
         * This delegate is called when the speaking is completed.
         * @private
         * @fires Wincor.UI.Service.AdaService#SERVICE_EVENTS:SPEAKING_STOPPED
         */
        onAdaEventSpeakCompleted() {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> AdaService::onAdaEventSpeakCompleted");
            // check if we still show the view where HELP has been pressed on
            let currId = this.serviceProvider.ViewService.viewContext.viewID;
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `. AdaService::onAdaEventSpeakCompleted forID/currID ${this.viewIdWhenRepeatWasStarted}/${currId}`);
            if (this.viewIdWhenRepeatWasStarted === currId) {
                this.viewIdWhenRepeatWasStarted = -1;
                // if a timeout popup is open it is using own timer handling and thus the view must not restart its own timer
                const vmHelper = Wincor.UI.Content.ViewModelHelper;
                if (!vmHelper.isTimeoutPopupActive()) {
                    // in this case the repeat event results from pressing 'HELP' button on EPP -> refresh interaction timeout of ViewService
                    this.serviceProvider.ViewService.refreshTimeout();
                } else {
                    const timerInfo = vmHelper.getTimerInfo();
                    _logger.LOG_SRVC_DATA &&
                        _logger.log(_logger.LOG_SRVC_DATA, `* AdaService::onAdaEventSpeakCompleted currently a timeout popup is open - refreshing timeout for popup with name=${timerInfo.name}: ${timerInfo.timeLen}`);
                    vmHelper.refreshTimer(timerInfo.timeLen, timerInfo.name);
                }
            }
            if (this.isSpeaking) {
                this.isSpeaking = false;
                this.fireServiceEvent(this.SERVICE_EVENTS.SPEAKING_STOPPED);
            }
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< AdaService::onAdaEventSpeakCompleted");
        }

        /**
         * This delegate is called when the speaking is cancelled.
         * @private
         * @fires Wincor.UI.Service.AdaService#SERVICE_EVENTS:SPEAKING_STOPPED
         */
        onAdaEventSpeakCancelled() {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> AdaService::onAdaEventSpeakCancelled");
            if (this.isSpeaking) {
                this.isSpeaking = false;
                this.fireServiceEvent(this.SERVICE_EVENTS.SPEAKING_STOPPED);
            }
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< AdaService::onAdaEventSpeakCancelled");
        }

        /**
         * This delegate is called when the ADA is stopped.
         * @private
         * @fires Wincor.UI.Service.AdaService#SERVICE_EVENTS:SPEAKING_STOPPED
         */
        onAdaEventStop() {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> AdaService::onAdaEventStop");
            if (this.isSpeaking) {
                this.isSpeaking = false;
                this.fireServiceEvent(this.SERVICE_EVENTS.SPEAKING_STOPPED);
            }
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< AdaService::onAdaEventStop");
        }

        /**
         * This delegate is called when the repeat is triggered.
         * @private
         */
        onAdaEventRepeat() {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> AdaService::onAdaEventRepeat");
            if (!this.isAutoRepeatActive && !this.isSpeaking) {
                // we will refresh it on next Completed event
                this.serviceProvider.ViewService.clearTimeout();
                this.viewIdWhenRepeatWasStarted = this.serviceProvider.ViewService.viewContext.viewID;
                // if a timeout popup is open it is using own timer handling
                const vmHelper = Wincor.UI.Content.ViewModelHelper;
                if (vmHelper.isTimeoutPopupActive()) {
                    const timerInfo = vmHelper.getTimerInfo();
                    _logger.LOG_SRVC_DATA &&
                        _logger.log(_logger.LOG_SRVC_DATA, `* AdaService::onAdaEventRepeat currently a timeout popup is open - refreshing timeout for popup with name=${timerInfo.name}: ${timerInfo.timeLen}`);
                    vmHelper.refreshTimer(timerInfo.timeLen, timerInfo.name);
                }
                this.fireServiceEvent(this.SERVICE_EVENTS.REPEAT);
            }

            if (this.isSpeaking === false) {
                this.isSpeaking = true;
            }
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< AdaService::onAdaEventRepeat");
        }

        /**
         * This function delete blanks from the input text.
         * @private
         *
         * @param {string} text       Input raw text.
         * @returns {string}          Output filtered text.
         */
        removeBlanks(text) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> AdaService::removeBlanks('${text}')`);
            let retText = "";

            if (text === " ") {
                // special for view start ... let this go as it is!
                retText = text;
            } else {
                // remove blanks at begin and end
                retText = text.trim();
                // remove 2 and more blanks in text
                retText = retText.replace(/ +/g, " ");
            }

            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `< AdaService::removeBlanks returns '${retText}'`);
            return retText;
        }

        /**
         * Text that should be spoken
         *
         * @param {string=} text        Text to speech
         * @param {number=} prio        Possibilities: 0 (CCADAFW_PRIO_NO_PURGE), 1 (CCADAFW_PRIO_LOW), 2 (CCADAFW_PRIO_HIGH)
         * @param {number=} privacy     Possibilities: 0 (CCADAFW_PRIVACY_NONCONFIDENTIAL), 1 (CCADAFW_PRIVACY_CONFIDENTIAL), 10 (CCADAFW_PRIVACY_USE_DEFAULT)
         * @param {function=} callback  Reference to a function receiving the return code as a parameter.
         */
        speak(text, prio, privacy, callback) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> AdaService::speak(txt:${text}, prio:${prio}, privacy:${privacy}, ...)`);
            // this check is done to prevent error log from ADA framework!
            if (this.state === this.STATE_VALUES.SPEAK) {
                let strText = "";
                let usPrio = 0; // CCADAFW_PRIO_NO_PURGE
                let usPrivacy = 10; // CCADAFW_PRIVACY_USE_DEFAULT

                if (text) {
                    strText = this.removeBlanks(text);
                }
                if (prio) {
                    usPrio = prio;
                }
                if (privacy) {
                    usPrivacy = privacy;
                }

                // this check is done to make instance switching audible!
                if (this.firstSpeak) {
                    // Prio 2 purges all texts
                    usPrio = 2;
                    this.firstSpeak = false;
                }

                this.FRM_RESOLVE_REQUEST.FWFuncID = 4; // CCADAFW_FUNC_SPEAK_W
                this.FRM_RESOLVE_REQUEST.param1 = strText;
                this.FRM_RESOLVE_REQUEST.meta1 = ["WCHAR", -1]; // -1 is for automatic length detection
                this.FRM_RESOLVE_REQUEST.param2 = usPrio;
                this.FRM_RESOLVE_REQUEST.meta2 = ["USHORT", 0];
                this.FRM_RESOLVE_REQUEST.param3 = usPrivacy;
                this.FRM_RESOLVE_REQUEST.meta3 = ["USHORT", 0];
                this.FRM_RESOLVE_REQUEST.paramUL = 0;

                _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `. request to send: '${JSON.stringify(this.FRM_RESOLVE_REQUEST)}'.`);
                this.FrmResolve(this.FRM_RESOLVE_REQUEST, callback);
            } else {
                // if user wants callback ...
                if (callback) {
                    // emulate ADA framework return code for this case!
                    callback(-100); // CCADAFW_RC_IGNORED ... CCADAFW_RC_ERROR will cause ADA error handling in Ada.js!
                }
            }
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< AdaService::speak");
        }

        /**
         * Volume will be increased
         *
         * @param {function=} callback      Reference to a function receiving the return code as a parameter.
         */
        increaseVolume(callback) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> AdaService::increaseVolume()");
            this.FRM_RESOLVE_REQUEST.FWFuncID = 52; // CCADAFW_FUNC_INC_VOL
            this.FRM_RESOLVE_REQUEST.param1 = "";
            this.FRM_RESOLVE_REQUEST.meta1 = ["NULL", 0];
            this.FRM_RESOLVE_REQUEST.param2 = "";
            this.FRM_RESOLVE_REQUEST.meta2 = ["NULL", 0];
            this.FRM_RESOLVE_REQUEST.param3 = "";
            this.FRM_RESOLVE_REQUEST.meta3 = ["NULL", 0];
            this.FRM_RESOLVE_REQUEST.paramUL = 0;

            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `. request to send: '${JSON.stringify(this.FRM_RESOLVE_REQUEST)}'.`);
            this.FrmResolve(this.FRM_RESOLVE_REQUEST, callback);
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< AdaService::increaseVolume");
        }

        /**
         * Volume will be decreased
         *
         * @param {function=} callback      Reference to a function receiving the return code as a parameter.
         */
        decreaseVolume(callback) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> AdaService::decreaseVolume()");
            this.FRM_RESOLVE_REQUEST.FWFuncID = 53; // CCADAFW_FUNC_DEC_VOL
            this.FRM_RESOLVE_REQUEST.param1 = "";
            this.FRM_RESOLVE_REQUEST.meta1 = ["NULL", 0];
            this.FRM_RESOLVE_REQUEST.param2 = "";
            this.FRM_RESOLVE_REQUEST.meta2 = ["NULL", 0];
            this.FRM_RESOLVE_REQUEST.param3 = "";
            this.FRM_RESOLVE_REQUEST.meta3 = ["NULL", 0];
            this.FRM_RESOLVE_REQUEST.paramUL = 0;

            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `. request to send: '${JSON.stringify(this.FRM_RESOLVE_REQUEST)}'.`);
            this.FrmResolve(this.FRM_RESOLVE_REQUEST, callback);
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< AdaService::decreaseVolume");
        }

        /**
         * Rate will be increased
         *
         * @param {function=} callback      Reference to a function receiving the return code as a parameter.
         */
        increaseRate(callback) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> AdaService::increaseRate()");
            this.FRM_RESOLVE_REQUEST.FWFuncID = 55; // CCADAFW_FUNC_INC_RATE
            this.FRM_RESOLVE_REQUEST.param1 = "";
            this.FRM_RESOLVE_REQUEST.meta1 = ["NULL", 0];
            this.FRM_RESOLVE_REQUEST.param2 = "";
            this.FRM_RESOLVE_REQUEST.meta2 = ["NULL", 0];
            this.FRM_RESOLVE_REQUEST.param3 = "";
            this.FRM_RESOLVE_REQUEST.meta3 = ["NULL", 0];
            this.FRM_RESOLVE_REQUEST.paramUL = 0;

            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `Wincor.UI.Service.AdaService.increaseRate() Request to send: '${JSON.stringify(this.FRM_RESOLVE_REQUEST)}'.`);
            this.FrmResolve(this.FRM_RESOLVE_REQUEST, callback);
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< AdaService::increaseRate");
        }

        /**
         * Rate will be decreased
         *
         * @param {function=} callback      Reference to a function receiving the return code as a parameter.
         */
        decreaseRate(callback) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> AdaService::decreaseRate()");
            this.FRM_RESOLVE_REQUEST.FWFuncID = 56; // CCADAFW_FUNC_DEC_RATE
            this.FRM_RESOLVE_REQUEST.param1 = "";
            this.FRM_RESOLVE_REQUEST.meta1 = ["NULL", 0];
            this.FRM_RESOLVE_REQUEST.param2 = "";
            this.FRM_RESOLVE_REQUEST.meta2 = ["NULL", 0];
            this.FRM_RESOLVE_REQUEST.param3 = "";
            this.FRM_RESOLVE_REQUEST.meta3 = ["NULL", 0];
            this.FRM_RESOLVE_REQUEST.paramUL = 0;

            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `. request to send: '${JSON.stringify(this.FRM_RESOLVE_REQUEST)}'.`);
            this.FrmResolve(this.FRM_RESOLVE_REQUEST, callback);
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< AdaService::decreaseRate");
        }

        /**
         * Ada focus is switched to UI application instance
         * @param {boolean} [stopSpeaking=true]
         * @returns {Promise<number>}
         */
        switchToApp(stopSpeaking = true) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> AdaService::switchToApp()`);
            // copy request data, since we use other AdaSync for this request
            const req = Object.assign({}, this.FRM_RESOLVE_REQUEST);
            req.FWFuncID = 97; // internal switchToApp of AdaSync
            req.FWName = "AdaSync";
            req.param1 = "";
            req.meta1 = ["NULL", 0];
            req.param2 = "";
            req.meta2 = ["NULL", 0];
            req.param3 = "";
            req.meta3 = ["NULL", 0];
            req.paramUL = 0;

            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `. request to send: '${JSON.stringify(req)}'.`);
            return ext.Promises.promise((resolve, reject) => {
                this.FrmResolve(req, rc => {
                    if (rc <= -1000) {
                        _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `. AdaService::switchToApp ada not installed or func not supported... ignore`);
                        rc = 0;
                    }
                    _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `< AdaService::switchToApp returns ${rc}`);
                    if (rc === 0) {
                        if (stopSpeaking) {
                            this.speak(" ", 2, 0, () => {
                                resolve(rc);
                            });
                        } else {
                            resolve(rc);
                        }
                    } else {
                        reject(`AdaService::switchToApp returned ${rc}`);
                    }
                });
            });
        }

        /**
         * Text that should be spoken when user press repeat EPP function key, overloads standard repeat behaviour!
         *
         * @param {string=} text            Text that should be spoken, turns this functionality ON. An empty string turns this functionality OFF!
         * @param {function=} callback      Reference to a function receiving the return code as a parameter.
         */
        setRepeatText(text, callback) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> AdaService::setRepeatText(${text})`);
            if (this.state === this.STATE_VALUES.SPEAK) {
                let strText = "";

                if (text) {
                    strText = this.removeBlanks(text);
                }

                this.FRM_RESOLVE_REQUEST.FWFuncID = 18; // CCADAFW_FUNC_REPEAT_FIXED_W
                this.FRM_RESOLVE_REQUEST.param1 = strText;
                this.FRM_RESOLVE_REQUEST.meta1 = ["WCHAR", -1]; // -1 is for automatic length detection
                this.FRM_RESOLVE_REQUEST.param2 = "";
                this.FRM_RESOLVE_REQUEST.meta2 = ["NULL", 0];
                this.FRM_RESOLVE_REQUEST.param3 = "";
                this.FRM_RESOLVE_REQUEST.meta3 = ["NULL", 0];
                this.FRM_RESOLVE_REQUEST.paramUL = 0;

                _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `. request to send: '${JSON.stringify(this.FRM_RESOLVE_REQUEST)}'.`);
                this.FrmResolve(this.FRM_RESOLVE_REQUEST, callback);
            } else {
                // if user wants callback ...
                if (callback) {
                    // emulate ADA framework return code for this case!
                    callback(-1); // CCADAFW_RC_ERROR
                }
            }
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< AdaService::setRepeatText");
        }

        /**
         * This method controls automatic repeat functionality. Call it with parameter > 0 and it will start,
         * parameter 0 will stop functionality. The functionality is to call Repeat functionality
         * after timer of parameterized time expires. The timer will run only, if there is no speaking.
         * If some speaks occur, timer will be restarted at speak end!
         * Functionality will auto end on call of Reset(), Stop() or WaitForStart() methodes of CCADAFW.
         *
         * @param {int=} repeatPause        The 0 or ommited argument stops the automatic repeat functionality. Positive number is pause in milliseconds between repeats.
         * @param {function=} callback      Reference to a function receiving the return code as a parameter.
         */
        autoRepeat(repeatPause, callback) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> AdaService::AutoRepeat(${repeatPause})`);

            let repeatPauseTime = 0;
            if (repeatPause && repeatPause > 0) {
                repeatPauseTime = repeatPause;
            }

            this.isAutoRepeatActive = repeatPauseTime !== 0;

            this.FRM_RESOLVE_REQUEST.FWFuncID = 67; // CCADAFW_FUNC_AUTO_REPEAT
            this.FRM_RESOLVE_REQUEST.param1 = repeatPauseTime;
            this.FRM_RESOLVE_REQUEST.meta1 = ["ULONG", 0];
            this.FRM_RESOLVE_REQUEST.param2 = "";
            this.FRM_RESOLVE_REQUEST.meta2 = ["NULL", 0];
            this.FRM_RESOLVE_REQUEST.param3 = "";
            this.FRM_RESOLVE_REQUEST.meta3 = ["NULL", 0];
            this.FRM_RESOLVE_REQUEST.paramUL = 0;

            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `. request to send: '${JSON.stringify(this.FRM_RESOLVE_REQUEST)}'.`);
            this.FrmResolve(this.FRM_RESOLVE_REQUEST, callback);

            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< AdaService::AutoRepeat");
        }

        /**
         * register ADA events for control of isSpeaking flag
         * @private
         */
        registerAdaEventsForSpeakingControl() {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> AdaService::registerAdaEventsForSpeakingControl()");
            const evtService = this.serviceProvider.EventService;
            this.event1Id = evtService.registerForEvent(
                1,
                "CCADAFW",
                this.onAdaEventSpeakCompleted.bind(this),
                () => _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, "* AdaService::registerAdaEventsForSpeakingControl register callback for event (1): SpeakCompleted"),
                "ASCII",
                true
            );
            this.event2Id = evtService.registerForEvent(
                2,
                "CCADAFW",
                this.onAdaEventSpeakCancelled.bind(this),
                () => _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, "* AdaService::registerAdaEventsForSpeakingControl register callback for event (2): SpeakCancelled"),
                "ASCII",
                true
            );
            this.event4Id = evtService.registerForEvent(
                4,
                "CCADAFW",
                this.onAdaEventStop.bind(this),
                () => _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, "* AdaService::registerAdaEventsForSpeakingControl register callback for event (4): Stop"),
                "ASCII",
                true
            );
            this.event5Id = evtService.registerForEvent(
                5,
                "CCADAFW",
                this.onAdaEventRepeat.bind(this),
                () => _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, "* AdaService::registerAdaEventsForSpeakingControl register callback for event (5): Repeat"),
                "ASCII",
                true
            );
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< AdaService::registerAdaEventsForSpeakingControl");
        }

        /**
         * deregister ADA events for control of isSpeaking flag
         * @private
         * @fires Wincor.UI.Service.AdaService#SERVICE_EVENTS:SPEAKING_STOPPED
         */
        deregisterAdaEventsForSpeakingControl() {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> AdaService::deregisterAdaEventsForSpeakingControl()");
            const evtService = this.serviceProvider.EventService;
            if (this.event1Id !== 0) {
                evtService.deregisterEvent(
                    this.event1Id,
                    () => _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, "* AdaService::deregisterAdaEventsForSpeakingControl deregister callback for event (1): SpeakCompleted")
                );
                this.event1Id = 0;
            }
            if (this.event2Id !== 0) {
                evtService.deregisterEvent(
                    this.event2Id,
                    () => _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, "* AdaService::deregisterAdaEventsForSpeakingControl deregister callback for event (2): SpeakCancelled")
                );
                this.event2Id = 0;
            }
            if (this.event4Id !== 0) {
                evtService.deregisterEvent(this.event4Id, () => _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, "* AdaService::deregisterAdaEventsForSpeakingControl deregister callback for event (4): Stop"));
                this.event4Id = 0;
            }
            if (this.event5Id !== 0) {
                evtService.deregisterEvent(
                    this.event5Id,
                    () => _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, "* AdaService::deregisterAdaEventsForSpeakingControl deregister callback for event (5): Repeat")
                );
                this.event5Id = 0;
            }

            if (this.isSpeaking) {
                this.isSpeaking = false;
                this.fireServiceEvent(this.SERVICE_EVENTS.SPEAKING_STOPPED);
            }

            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< AdaService::deregisterAdaEventsForSpeakingControl");
        }

        /**
         * This method is called by the ViewService to sync viewset switch
         *
         * @param {string} eventData    event data, possibilities: "FIRSTSTART", "FIRSTSTARTANDACTIVATE", "LASTSTOP"
         */
        externalAdaCommandAck(eventData) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> AdaService::externalAdaCommandAck('${eventData}')`);

            if (eventData || eventData.length === 0) {
                const msg = {};
                msg.service = this.NAME;
                msg.eventName = "4020"; //pce::gui::EVENT_ADA_COMMAND_ACK
                msg.eventData = eventData;
                try {
                    this.sendEvent(msg);
                } catch (e) {
                    _logger.error(e.message);
                }
            } else {
                _logger.error("AdaService::externalAdaCommandAck() has been called without a parameter!");
            }
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< AdaService::externalAdaCommandAck");
        }

        /**
         * This method is called by the business logic to control ADA.
         *
         * @param {object} message      JSON object containing the key 'command'.
         * @private
         * @fires Wincor.UI.Service.AdaService#SERVICE_EVENTS:STATE_CHANGED
         * @fires Wincor.UI.Service.AdaService#SERVICE_EVENTS:FIRST_START
         * @fires Wincor.UI.Service.AdaService#SERVICE_EVENTS:LAST_STOP
         * @fires Wincor.UI.Service.AdaService#SERVICE_EVENTS:ERROR_HAPPENED
         */
        adaCommand(message) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> AdaService::adaCommand('${JSON.stringify(message)}')`);

            if (message.command !== undefined && message.command !== null) {
                try {
                    let fireAck = true; // flag for syncing with GuiSyncADA

                    if (message.command === "IDLE") {
                        this.state = this.STATE_VALUES.BEREADY;
                        this.firstSpeak = false;
                        this.errorHappened = false;
                        this.deregisterAdaEventsForSpeakingControl();
                        this.fireServiceEvent(this.SERVICE_EVENTS.STATE_CHANGED, this.state);
                    } else if (message.command === "START") {
                        this.state = this.STATE_VALUES.SPEAK;
                        this.firstSpeak = true;
                        this.registerAdaEventsForSpeakingControl();
                        this.fireServiceEvent(this.SERVICE_EVENTS.STATE_CHANGED, this.state);
                    } else if (message.command === "FIRSTSTART") {
                        this.fireServiceEvent(this.SERVICE_EVENTS.FIRST_START, message.command);
                        fireAck = false;
                    } else if (message.command === "FIRSTSTARTANDACTIVATE") {
                        this.fireServiceEvent(this.SERVICE_EVENTS.FIRST_START, message.command);
                        fireAck = false;

                        // activate speaking
                        this.state = this.STATE_VALUES.SPEAK;
                        this.firstSpeak = true;
                        this.registerAdaEventsForSpeakingControl();
                        // don't send SERVICE_EVENTS.STATE_CHANGED to stay silent in IdleLoop view
                    } else if (message.command === "STOP") {
                        this.state = this.STATE_VALUES.DONOTHING;
                        this.firstSpeak = false;
                        this.deregisterAdaEventsForSpeakingControl();
                        this.fireServiceEvent(this.SERVICE_EVENTS.STATE_CHANGED, this.state);
                    } else if (message.command === "LASTSTOP") {
                        this.state = this.STATE_VALUES.DONOTHING;
                        this.firstSpeak = false;
                        this.deregisterAdaEventsForSpeakingControl();
                        this.fireServiceEvent(this.SERVICE_EVENTS.STATE_CHANGED, this.state);

                        this.fireServiceEvent(this.SERVICE_EVENTS.LAST_STOP, message.command);
                        fireAck = false;
                    } else if (message.command === "ERROR") {
                        // Do "STOP" first
                        this.state = this.STATE_VALUES.DONOTHING;
                        this.firstSpeak = false;
                        this.deregisterAdaEventsForSpeakingControl();
                        this.fireServiceEvent(this.SERVICE_EVENTS.STATE_CHANGED, this.state);
                        // Do "error handling"
                        // NOTE: BL should only send ERROR if ADA is mandatory, otherwise BL should use STOP!
                        this.errorHappened = true;
                        this.fireServiceEvent(this.SERVICE_EVENTS.ERROR_HAPPENED);
                    }

                    if (fireAck) {
                        const msg = {};
                        msg.service = this.NAME;
                        msg.eventName = "4020"; //pce::gui::EVENT_ADA_COMMAND_ACK
                        msg.eventData = message.command;
                        this.sendEvent(msg);
                    }
                } catch (e) {
                    _logger.error(e.message);
                }
            } else {
                _logger.error("AdaService::adaCommand() has been called without a command!");
            }
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< AdaService::adaCommand");
        }
    }
};

/**
 * The class AdaService has a collection of routines to support speech output for ADA compliant self-service applications.
 * The framework provides different priorities for the submitted texts. E. g. it determines whether a text is queued until all
 * previous texts are processed or if a running output is abandoned.
 *
 * @function getServiceClass
 * @param {Wincor} Wincor
 * @param {ext} ext
 * @param {LogProvider} LogProvider
 * @param {PTService} PTService
 * @returns {Wincor.UI.Service.AdaService}
 * @class
 */
export default getServiceClass;
