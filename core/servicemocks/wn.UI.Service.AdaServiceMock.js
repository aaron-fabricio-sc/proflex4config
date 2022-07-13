/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ wn.UI.Service.AdaServiceMock.js 4.3.1-210420-21-c476740e-1a04bc7d

*/

/**
 * @module
 */
/*global jQuery:false*/
const getServiceClass = ({ BaseService, ext, LogProvider }) => {
    /**
     *
     * @type {Wincor.UI.Diagnostics.LogProvider|*|Wincor.UI.Diagnostics.LogProvider|*}
     * @private
     */
    const _logger = LogProvider;
    let _localizeService;
    let _currentSpeechLangIso;
    let _currentVoice = null;
    let _volume = 1.0;
    let _pitch = 1;
    let _rate = 1.0;
    let _voices = null;
    let _isVoiceChecking = false;
    
    const REPEAT_KEY = "HELP";
    
    function checkVoiceSupport(isoLang) {
        function getVoice(voices) {
            let supportedVoice = null;
            for(let voice of voices) {
                if(voice.lang === isoLang) {
                    // check for further lang
                    let others = voices.filter(v => {
                        return v.lang === isoLang;
                    });
                    if(others.length > 1) {
                        // to activate a supported Google voice use -others[1]. Note: (Chrome 71+) Google voices unfortunately interrupts speech in between text!
                        supportedVoice = others[0];
                    } else {
                        supportedVoice = voice;
                    }
                    break;
                } else {
                    _logger.log(_logger.LOG_DETAIL, `AdaServiceMock::checkVoiceSupport ${isoLang} NOT supported.`);
                }
            }
            return supportedVoice;
        }
        return ext.Promises.promise((resolve, reject) => {
            if(!_isVoiceChecking) {
                _isVoiceChecking = true;
                jQuery("#extendedDesignModeContent").ready(() => {
                    if(!_voices) {
                        if(!speechSynthesis.onvoiceschanged) {
                            speechSynthesis.onvoiceschanged = () => {
                                _voices = speechSynthesis.getVoices();
                                if(_voices.length) {
                                    _currentVoice = getVoice(_voices);
                                    _logger.log(_logger.LOG_DETAIL, `AdaServiceMock::checkVoiceSupport ${isoLang} use current=${_currentVoice ? JSON.stringify(_currentVoice) : "NO"}`);
                                    _isVoiceChecking = false;
                                    resolve(_currentVoice);
                                } else {
                                    reject();
                                }
                            };
                        }
                        _voices = speechSynthesis.getVoices(); // dummy call
                        if(_voices.length) {
                            _currentVoice = getVoice(_voices);
                            _logger.log(_logger.LOG_DETAIL, `AdaServiceMock::checkVoiceSupport ${isoLang} use current=${_currentVoice ? JSON.stringify(_currentVoice) : "NO"}`);
                            _isVoiceChecking = false;
                            resolve(_currentVoice);
                        }
                    } else {
                        if(isoLang !== _currentSpeechLangIso) {
                            _currentVoice = getVoice(_voices);
                        }
                        resolve(_currentVoice);
                    }
                });
            }
        });
    }

    return class AdaServiceMock extends BaseService {

        /**
         * The logical name of this service as used in the service-provider
         * @const
         * @type {string}
         * @default "AdaService"
         */
        NAME = "AdaService";

        /**
         * Object containing the value definitions for state of ADA service {@link Wincor.UI.Service.AdaService#state}.
         * @enum {string}
         */
        STATE_VALUES = {
            /**
             * Defines the inactive state for ADA service.
             * ViewModel should do nothing.
             * @const
             * @type String
             */
            DONOTHING: "DONOTHING",
            /**
             * Defines the idle state for ADA service.
             * ViewModel should prepare ADA texts.
             * @const
             * @type String
             */
            BEREADY: "BEREADY",
            /**
             * Defines the active state for ADA service.
             * ViewModel should prepare ADA texts and speak them.
             * @const
             * @type String
             */
            SPEAK: "SPEAK",
    
            /**
             * Sent when ADA text is on repeat.
             * @type {String}
             * @event Wincor.UI.Service.AdaService#SERVICE_EVENTS:REPEAT
             * @eventtype service
             */
            REPEAT: "REPEAT"
        };

        /**
         * Object containing the definitions of view-service events other services or view-models  may register for.
         * @enum {string}
         */
        SERVICE_EVENTS = {
            /**
             * Sent when state of ADA service {@link Wincor.UI.Service.AdaServiceMock#state} changes.
             * @see {@link Wincor.UI.Service.AdaServiceMock#STATE_VALUES}
             * @event Wincor.UI.Service.AdaServiceMock#SERVICE_EVENTS:STATE_CHANGED
             * @eventtype service
             */
            STATE_CHANGED: "STATE_CHANGED",
            /**
             * Sent when error handling flag {@link Wincor.UI.Service.AdaServiceMock#errorHappened} is set to true.
             * @type {String}
             * @event Wincor.UI.Service.AdaServiceMock#SERVICE_EVENTS:ERROR_HAPPENED
             * @eventtype service
             */
            ERROR_HAPPENED: "ERROR_HAPPENED",
            /**
             * Sent when ADA speaking flag {@link Wincor.UI.Service.AdaServiceMock#isSpeaking} is changing from true to false.
             * @type {String}
             * @event Wincor.UI.Service.AdaServiceMock#SERVICE_EVENTS:SPEAKING_STOPPED
             * @eventtype service
             */
            SPEAKING_STOPPED: "SPEAKING_STOPPED",
            /**
             * Sent once when the ADA transaction begins.
             * @type {String}
             * @event Wincor.UI.Service.AdaServiceMock#SERVICE_EVENTS:FIRST_START
             * @eventtype service
             */
            FIRST_START: "FIRST_START",
            /**
             * Sent once when the ADA transaction ends.
             * @type {String}
             * @event Wincor.UI.Service.AdaServiceMock#SERVICE_EVENTS:LAST_STOP
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
         * The actual state of ADA service, changed by function {@link Wincor.UI.Service.AdaServiceMock#adaCommand}.
         * For possible values see: {@link Wincor.UI.Service.AdaServiceMock#STATE_VALUES}
         *
         * @type {string}
         */
        state = "";

        /**
         * This flag is true when error happens in ADA framework and one view in the GUI have to be ended
         * with ADA error return code.
         * This flag should be set to false when the one view in the GUI is ended with ADA error return code.
         *
         * @type {boolean}
         * @default false
         */
        errorHappened = false;

        /**
         * This flag is true when ADA service enters active state and no speak is done yet.
         * This flag should be set to false when the first speak is done or ADA service leaves active state.
         *
         * @type {boolean}
         * @default false
         */
        firstSpeak = false;

        /**
         * This flag is true when ADA service is speaking.
         *
         * @type {boolean}
         * @default false
         */
        isSpeaking = false;

        /**
         * This flag is true, if autoRepeat has been called with argument > 0
         *
         * @type {boolean}
         * @default false
         */
        isAutoRepeatActive = false;

        /**
         * @lifecycle service
         * @see {@link Wincor.UI.Service.BaseServiceMock#constructor}.
         */
        constructor(...args) {
            super(...args, "Hello", "you");
            this.eppHelpClaimId = -1;
            this.repeatText = "";
            this.lastSpokenText = "";
            this.viewIdWhenRepeatWasStarted = -1;
            this.logger.log(this.logger.LOG_SRVC_INOUT, "> AdaServiceMock::AdaServiceMock");
            this.state = this.STATE_VALUES.DONOTHING;
            this.logger.log(this.logger.LOG_SRVC_INOUT, "< AdaServiceMock::AdaServiceMock");
        }
        
        /**
         * Register ADA events for control of isSpeaking flag
         * @private
         */
        registerAdaEventsForSpeakingControl() {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> AdaServiceMock::registerAdaEventsForSpeakingControl()");
            // these events currently never fires in this mock!
            let evtService = this.serviceProvider.EventService;
            this.event1Id = evtService.registerForEvent(1, "CCADAFW", this.onAdaEventSpeakCompleted.bind(this),
                () => _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, "* AdaServiceMock::registerAdaEventsForSpeakingControl register callback for event (1): SpeakCompleted"),
                "ASCII", true);
            this.event2Id = evtService.registerForEvent(2, "CCADAFW", this.onAdaEventSpeakCancelled.bind(this),
                () => _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, "* AdaServiceMock::registerAdaEventsForSpeakingControl register callback for event (2): SpeakCancelled"),
                "ASCII", true);
            this.event4Id = evtService.registerForEvent(4, "CCADAFW", this.onAdaEventStop.bind(this),
                () => _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, "* AdaServiceMock::registerAdaEventsForSpeakingControl register callback for event (4): Stop"),
                "ASCII", true);
            this.event5Id = evtService.registerForEvent(5, "CCADAFW", this.onAdaEventRepeat.bind(this),
                () => _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, "* AdaServiceMock::registerAdaEventsForSpeakingControl register callback for event (5): Repeat"),
                "ASCII", true);
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< AdaServiceMock::registerAdaEventsForSpeakingControl");
        }

        /**
         * Deregister ADA events for control of isSpeaking flag
         * @fires Wincor.UI.Service.AdaServiceMock#SERVICE_EVENTS:SPEAKING_STOPPED
         * @private
         */
        deregisterAdaEventsForSpeakingControl() {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> AdaServiceMock::deregisterAdaEventsForSpeakingControl()");
            let evtService = this.serviceProvider.EventService;
            if(this.event1Id !== 0) {
                evtService.deregisterEvent(this.event1Id, () =>
                    _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, "* AdaServiceMock::deregisterAdaEventsForSpeakingControl deregister callback for event (1): SpeakCompleted")
                );
                this.event1Id = 0;
            }
            if(this.event2Id !== 0) {
                evtService.deregisterEvent(this.event2Id, () =>
                    _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, "* AdaServiceMock::deregisterAdaEventsForSpeakingControl deregister callback for event (2): SpeakCancelled")
                );
                this.event2Id = 0;
            }
            if(this.event4Id !== 0) {
                evtService.deregisterEvent(this.event4Id, () =>
                    _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, "* AdaServiceMock::deregisterAdaEventsForSpeakingControl deregister callback for event (4): Stop")
                );
                this.event4Id = 0;
            }
            if(this.event5Id !== 0) {
                evtService.deregisterEvent(this.event5Id, () =>
                    _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, "* AdaServiceMock::deregisterAdaEventsForSpeakingControl deregister callback for event (5): Repeat")
                );
                this.event5Id = 0;
            }

            if(this.isSpeaking) {
                this.isSpeaking = false;
                this.fireServiceEvent(this.SERVICE_EVENTS.SPEAKING_STOPPED);
            }

            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< AdaServiceMock::deregisterAdaEventsForSpeakingControl");
        }

        /**
         * This delegate is called when the speaking is completed.
         * @eventhandler
         * @fires Wincor.UI.Service.AdaServiceMock#SERVICE_EVENTS:SPEAKING_STOPPED
         * @private
         */
        onAdaEventSpeakCompleted() {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> AdaServiceMock::onAdaEventSpeakCompleted");
            let currId = this.serviceProvider.ViewService.viewContext.viewID;
            _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, `. AdaServiceMock::onAdaEventSpeakCompleted forID/currID ${this.viewIdWhenRepeatWasStarted}/${currId}`);
            if(this.viewIdWhenRepeatWasStarted === currId) {
                this.viewIdWhenRepeatWasStarted = -1;
                // if a timeout popup is open it is using own timer handling and thus the view must not restart its own timer
                const vmHelper = Wincor.UI.Content.ViewModelHelper;
                if(!vmHelper.isTimeoutPopupActive()) {
                    // in this case the repeat event results from pressing 'HELP' button on EPP -> refresh interaction timeout of ViewService
                    this.serviceProvider.ViewService.refreshTimeout();
                } else {
                    const timerInfo = vmHelper.getTimerInfo();
                    _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, `* AdaServiceMock::onAdaEventSpeakCompleted currently a timeout popup is open - refreshing timeout for popup with name=${timerInfo.name}: ${timerInfo.timeLen}`);
                    vmHelper.refreshTimer(timerInfo.timeLen, timerInfo.name);
                }
            }
            if(this.isSpeaking) {
                this.isSpeaking = false;
                this.fireServiceEvent(this.SERVICE_EVENTS.SPEAKING_STOPPED);
            }
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< AdaServiceMock::onAdaEventSpeakCompleted");
        }

        /**
         * This delegate is called when the speaking is cancelled.
         * @eventhandler
         * @fires Wincor.UI.Service.AdaServiceMock#SERVICE_EVENTS:SPEAKING_STOPPED
         * @private
         */
        onAdaEventSpeakCancelled() {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> AdaServiceMock::onAdaEventSpeakCancelled");
            if(this.isSpeaking) {
                this.isSpeaking = false;
                this.fireServiceEvent(this.SERVICE_EVENTS.SPEAKING_STOPPED);
            }
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< AdaServiceMock::onAdaEventSpeakCancelled");
        }

        /**
         * This delegate is called when the ADA is stopped.
         * @eventhandler
         * @fires Wincor.UI.Service.AdaServiceMock#SERVICE_EVENTS:SPEAKING_STOPPED
         * @private
         */
        onAdaEventStop() {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> AdaServiceMock::onAdaEventStop");
            if(this.isSpeaking) {
                this.isSpeaking = false;
                this.fireServiceEvent(this.SERVICE_EVENTS.SPEAKING_STOPPED);
            }
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< AdaServiceMock::onAdaEventStop");
        }

        /**
         * This delegate is called when the repeat is triggered.
         * @eventhandler
         * @private
         */
        onAdaEventRepeat() {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> AdaServiceMock::onAdaEventRepeat");
            if(!this.isAutoRepeatActive && !this.isSpeaking) {
                // we will refresh it on next Completed event
                this.serviceProvider.ViewService.clearTimeout();
                this.viewIdWhenRepeatWasStarted = this.serviceProvider.ViewService.viewContext.viewID;
                // if a timeout popup is open it is using own timer handling
                const vmHelper = Wincor.UI.Content.ViewModelHelper;
                if(vmHelper.isTimeoutPopupActive()) {
                    const timerInfo = vmHelper.getTimerInfo();
                    _logger.LOG_SRVC_DATA && _logger.log(_logger.LOG_SRVC_DATA, `* AdaServiceMock::onAdaEventRepeat currently a timeout popup is open - refreshing timeout for popup with name=${timerInfo.name}: ${timerInfo.timeLen}`);
                    vmHelper.refreshTimer(timerInfo.timeLen, timerInfo.name);
                }
                this.fireServiceEvent(this.SERVICE_EVENTS.REPEAT);
            }
            
            if(this.isSpeaking === false) {
                this.isSpeaking = true;
            }
    
            if(this.repeatText) {
                this.speak(this.repeatText, 1, 10);
            } else if(this.lastSpokenText) {
                this.speak(this.lastSpokenText, 1, 10);
            }
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< AdaServiceMock::onAdaEventRepeat");
        }
    
        /**
         * This method is called by the {@link Wincor.UI.Service.Provider#propagateError} if an error occurred in any service. It logs the error to the console.
         * @param {String} serviceName  The name of this service.
         * @param {String} errorType    As defined in {@link Wincor.UI.Service.BaseService#ERROR_TYPE}.
         */
        onError(serviceName, errorType) {
            this.logger.log(this.logger.LOG_SRVC_INOUT, `> AdaServiceMock::onError(${serviceName}, ${errorType})`);
            this.logger.log(this.logger.LOG_SRVC_INOUT, "< AdaServiceMock::onError");
        }

        /**
         * Text that should be spoken
         * @param {string=} text        Text to speech
         * @param {number=} prio        Possibilities: 0 (CCADAFW_PRIO_NO_PURGE), 1 (CCADAFW_PRIO_LOW), 2 (CCADAFW_PRIO_HIGH)
         * @param {number=} privacy     Possibilities: 0 (CCADAFW_PRIVACY_NONCONFIDENTIAL), 1 (CCADAFW_PRIVACY_CONFIDENTIAL), 10 (CCADAFW_PRIVACY_USE_DEFAULT)
         * @param {function=} callback  Reference to a function receiving the return code as a parameter.
         * @async
         */
        async speak(text, prio, privacy, callback) {
            if(localStorage.getItem("activateAdaOn") && this.state === this.STATE_VALUES.SPEAK) {
                this.logger.log(this.logger.LOG_SRVC_INOUT, `> AdaServiceMock::speak(txt:${text}, prio:${prio}, privacy:${privacy}, ...)`);
                this.callbackCaller(callback);
                if(!_currentVoice || _currentVoice.lang !== _localizeService.currentLanguage) {
                    _currentVoice = await checkVoiceSupport(_localizeService.currentLanguage);
                }
                if(_currentVoice && text) {
                    _currentSpeechLangIso = _localizeService.currentLanguage;
                    if(speechSynthesis.speaking && prio === 2) {
                        speechSynthesis.cancel();
                        this.isSpeaking = false;
                        this.onAdaEventSpeakCancelled();
                    }
                    // First approach: Just eliminate the lang commands / NO_REPEAT in text, until we able to parse and switch language for a given text.
                    text = text.replace(/<lang langid='\d+'>/g, "");
                    text = text.replace(/<\/lang>/g, "");
                    text = text.replace(/WX_ADA_NOREPEAT/g, "");
                    text = text.trim();
                    //
                    if(text) {
                        setTimeout(() => {
                            this.lastSpokenText = text;
                            this.logger.log(this.logger.LOG_SRVC_DATA, `. AdaServiceMock::speak(speech:${text}`);
                            let speech = new SpeechSynthesisUtterance(text);
                            speech.voice = _currentVoice;
                            speech.volume = _volume;
                            speech.rate = _rate;
                            speech.pitch = _pitch;
                            speech.onend = () => {
                                this.onAdaEventSpeakCompleted();
                                this.isSpeaking = false;
                            };
                            speech.onboundary = () => {
                            };
                            speech.onmark = () => {
                                this.onAdaEventSpeakCompleted();
                                this.isSpeaking = false;
                            };
                            speech.onerror = () => {
                                this.onAdaEventSpeakCompleted();
                                this.isSpeaking = false;
                            };
                            speech.onpause = () => {
                                this.onAdaEventSpeakCompleted();
                                this.isSpeaking = false;
                            };
                            this.isSpeaking = true;
                            speechSynthesis.speak(speech);
                        }, 500); // decouple, because creating new SpeechSynthesisUtterance in a short time period (< 100ms) causes the engine to stop speaking
                    }
                } else {
                    this.logger.log(this.logger.LOG_DETAIL, `. AdaServiceMock::speak NO VOICE SUPPORT FOR ${_localizeService.currentLanguage}`);
                    callback(-1);
                }
                this.logger.log(this.logger.LOG_SRVC_INOUT, "< AdaServiceMock::speak");
            } else {
                callback(-1);
            }
        }

        /**
         * Volume will be increased
         * @param {function=} callback  Reference to a function receiving the return code as a parameter.
         */
        increaseVolume(callback) {
            this.logger.log(this.logger.LOG_SRVC_INOUT, "> AdaServiceMock::increaseVolume()");
            if(_volume < 1.0) {
                _volume += 0.1;
            }
            this.callbackCaller(callback);
            this.logger.log(this.logger.LOG_SRVC_INOUT, "< AdaServiceMock::increaseVolume");
        }

        /**
         * Volume will be decreased
         * @param {function=} callback  Reference to a function receiving the return code as a parameter.
         */
        decreaseVolume(callback) {
            this.logger.log(this.logger.LOG_SRVC_INOUT, "> AdaServiceMock::decreaseVolume()");
            if(_volume > 0.0) {
                _volume -= 0.1;
            }
            this.callbackCaller(callback);
            this.logger.log(this.logger.LOG_SRVC_INOUT, "< AdaServiceMock::decreaseVolume");
        }

        /**
         * Rate will be increased
         * @param {function=} callback  Reference to a function receiving the return code as a parameter.
         */
        increaseRate(callback) {
            this.logger.log(this.logger.LOG_SRVC_INOUT, "> AdaServiceMock::increaseRate()");
            if(_rate < 10.0) {
                _rate += 0.1;
            }
            this.callbackCaller(callback);
            this.logger.log(this.logger.LOG_SRVC_INOUT, "< AdaServiceMock::increaseRate");
        }

        /**
         * Rate will be decreased
         * @param {function=} callback  Reference to a function receiving the return code as a parameter.
         */
        decreaseRate(callback) {
            this.logger.log(this.logger.LOG_SRVC_INOUT, "> AdaServiceMock::decreaseRate()");
            if(_rate > 0.0) {
                _rate -= 0.1;
            }
            this.callbackCaller(callback);
            this.logger.log(this.logger.LOG_SRVC_INOUT, "< AdaServiceMock::decreaseRate");
        }

        /**
         * Ada focus is switched to UI application instance dummy function
         * @param {boolean} [stopSpeaking=true]
         * @returns {Promise<number>}
         */
        switchToApp(stopSpeaking=true) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> AdaServiceMock::switchToApp()`);
            return ext.Promises.promise(resolve => {
                let rc = 0;
                _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `< AdaServiceMock::switchToApp returns ${rc}`);
                if (stopSpeaking) {
                    this.speak(" ", 2, 0, () => {
                        resolve(rc);
                    })
                } else {
                    resolve(rc);
                }
            });
        }

        /**
         * Text that should be spoken when user press repeat EPP function key, overloads standard repeat behaviour!
         * @param {string} text         Text that should be spoken, turns this functionality ON. An empty string turns this functionality OFF!
         * @param {function=} callback  Reference to a function receiving the return code as a parameter.
         */
        setRepeatText(text, callback) {
            this.logger.log(this.logger.LOG_SRVC_INOUT, `> AdaServiceMock::setRepeatText(${text})`);
            this.repeatText = text;
            this.callbackCaller(callback);
            this.logger.log(this.logger.LOG_SRVC_INOUT, "< AdaServiceMock::setRepeatText");
        }

        /**
         * This method does nothing.
         * @param {int=} repeatPause    The 0 or ommited argument stops the automatic repeat functionality. Positive number is pause in milliseconds between repeats.
         * @param {function=} callback  Reference to a function receiving the return code as a parameter.
         */
        autoRepeat(repeatPause, callback) {
            this.logger.log(this.logger.LOG_SRVC_INOUT, `> AdaServiceMock::AutoRepeat(${repeatPause})`);
            this.callbackCaller(callback);
            this.logger.log(this.logger.LOG_SRVC_INOUT, "< AdaServiceMock::AutoRepeat");
        }

        /**
         * This method is called by the business logic to control ADA.
         * @param {object} message      JSON object containing the key 'command'.
         * @private
         * @fires Wincor.UI.Service.AdaServiceMock#SERVICE_EVENTS:STATE_CHANGED
         * @fires Wincor.UI.Service.AdaServiceMock#SERVICE_EVENTS:FIRST_START
         * @fires Wincor.UI.Service.AdaServiceMock#SERVICE_EVENTS:LAST_STOP
         * @fires Wincor.UI.Service.AdaServiceMock#SERVICE_EVENTS:ERROR_HAPPENED
         */
        adaCommand(message) {
            this.logger.log(this.logger.LOG_SRVC_INOUT, `> AdaServiceMock::adaCommand('${JSON.stringify(message)}')`);
            if(message.command !== void 0 && message.command !== null) {
                try {
                    switch(message.command) {
                        case "IDLE":
                            this.state = this.STATE_VALUES.BEREADY;
                            this.firstSpeak = false;
                            this.errorHappened = false;
                            this.deregisterAdaEventsForSpeakingControl();
                            this.fireServiceEvent(this.SERVICE_EVENTS.STATE_CHANGED, this.state);
                            localStorage.setItem("adaActive", "false");
                            break;
                        case "START":
                            this.state = this.STATE_VALUES.SPEAK;
                            this.firstSpeak = true;
                            this.registerAdaEventsForSpeakingControl();
                            this.fireServiceEvent(this.SERVICE_EVENTS.STATE_CHANGED, this.state);
                            localStorage.setItem("adaActive", "true");
                            this.eppHelpClaimId === -1 && Wincor.UI.Service.Provider.EppService.claimKeys([REPEAT_KEY], -1,
                                res => {
                                    this.eppHelpClaimId = res.claimId;
                                }, this.onAdaEventRepeat.bind(this));
                            break;
                        case "FIRSTSTART":
                            this.fireServiceEvent(this.SERVICE_EVENTS.FIRST_START, message.command);
                            localStorage.setItem("adaActive", "true");
                            break;
                        case "FIRSTSTARTANDACTIVATE":
                            this.fireServiceEvent(this.SERVICE_EVENTS.FIRST_START, message.command);
                            // activate speaking
                            this.state = this.STATE_VALUES.SPEAK;
                            this.firstSpeak = true;
                            this.registerAdaEventsForSpeakingControl();
                            // don't send SERVICE_EVENTS.STATE_CHANGED to stay silent in IdleLoop view
                            break;
                        case "STOP":
                            this.state = this.STATE_VALUES.DONOTHING;
                            this.firstSpeak = false;
                            this.deregisterAdaEventsForSpeakingControl();
                            this.fireServiceEvent(this.SERVICE_EVENTS.STATE_CHANGED, this.state);
                            localStorage.setItem("adaActive", "false");
                            if (this.eppHelpClaimId > -1) {
                                Wincor.UI.Service.Provider.EppService.releaseKeys(this.eppHelpClaimId);
                                this.eppHelpClaimId = -1;
                            }
                            break;
                        case "LASTSTOP":
                            this.state = this.STATE_VALUES.DONOTHING;
                            this.firstSpeak = false;
                            this.deregisterAdaEventsForSpeakingControl();
                            this.fireServiceEvent(this.SERVICE_EVENTS.STATE_CHANGED, this.state);
                            this.fireServiceEvent(this.SERVICE_EVENTS.LAST_STOP, message.command);
                            localStorage.setItem("adaActive", "false");
                            break;
                        case "ERROR":
                            // Do "STOP" first
                            this.state = this.STATE_VALUES.DONOTHING;
                            this.firstSpeak = false;
                            this.deregisterAdaEventsForSpeakingControl();
                            this.fireServiceEvent(this.SERVICE_EVENTS.STATE_CHANGED, this.state);
                            // Do "error handling"
                            // NOTE: BL should only send ERROR if ADA is mandatory, otherwise BL should use STOP!
                            this.errorHappened = true;
                            this.fireServiceEvent(this.SERVICE_EVENTS.ERROR_HAPPENED);
                            localStorage.setItem("adaActive", "false");
                            break;
                        default:
                            break;
                    }
                } catch(e) {
                    this.logger.error(e.message);
                }
            } else {
                this.logger.error("AdaServiceMock::adaCommand() has been called without a command!");
            }
            this.logger.log(this.logger.LOG_SRVC_INOUT, "< AdaServiceMock::adaCommand");
        }

        /**
         * This method is called by the ViewService to sync viewset switch.
         * @param eventData event data, possibilities: "FIRSTSTART", "FIRSTSTARTANDACTIVATE", "LASTSTOP"
         */
        externalAdaCommandAck(eventData) {
            this.logger.log(this.logger.LOG_SRVC_INOUT, `> AdaServiceMock::externalAdaCommandAck('${eventData}')`);

            if(eventData || eventData.length === 0) {
                this.logger.log(this.logger.LOG_DETAIL, " AdaServiceMock::externalAdaCommandAck OK");
            } else {
                this.logger.error("AdaServiceMock::externalAdaCommandAck() has been called without a parameter!");
            }
            this.logger.log(this.logger.LOG_SRVC_INOUT, "< AdaServiceMock::externalAdaCommandAck");
        }

        /**
         * @param {object} message
         * @returns {Promise}
         * @lifecycle service
         * @see {@link Wincor.UI.Service.BaseServiceMock#onSetup}
         */
        onSetup(message) {
            this.logger.log(this.logger.LOG_SRVC_INOUT, `> AdaServiceMock::onSetup('${JSON.stringify(message)}')`);
            return ext.Promises.promise(function(resolve, reject) {
                resolve();
                this.logger.log(this.logger.LOG_SRVC_INOUT, "< AdaServiceMock::onSetup");
            }.bind(this));
        }

        /**
         * @returns {Promise}
         * @lifecycle service
         * @see {@link Wincor.UI.Service.BaseServiceMock#onServicesReady}.
         */
        onServicesReady() {
            this.logger.log(this.logger.LOG_SRVC_INOUT, "> AdaServiceMock::onServicesReady()");
            _localizeService = this.serviceProvider.LocalizeService;
            window.localStorage.setItem("adaActive", "false");
            return ext.Promises.promise((resolve) => {
                // If a viewset switch is done all EPP registrations will be removed - usually, but in the case an ADA speak has been just
                // started, the HELP key was claimed for repeat ADA, which is also removed then.
                // We register us to a shutdown and wait for the first SPA in order to reclaim ourself at a save
                // state after the viewset switch has been done.
                let viewService = this.serviceProvider.ViewService;
                viewService.registerForServiceEvent(viewService.SERVICE_EVENTS.SHUTDOWN, () => {
                    let regId = viewService.registerForServiceEvent(viewService.SERVICE_EVENTS.NAVIGATE_SPA, () => {
                        if (this.state === this.STATE_VALUES.SPEAK && this.eppHelpClaimId !== -1) {
                            this.logger.log(this.logger.LOG_ANALYSE, `. AdaServiceMock::onServicesReady() SPA event received,
                                reclaim to the EPP 'HELP' key for ADA repeat functionality.`);
                            // reclaim
                            this.serviceProvider.EppService.claimKeys([REPEAT_KEY], -1,
                                res => {
                                    this.eppHelpClaimId = res.claimId;
                                }, this.onAdaEventRepeat.bind(this));
                        }
                        viewService.deregisterFromServiceEvent(regId);
                    }, true);
                }, true);
                super.onServicesReady().then(resolve);
                this.logger.log(this.logger.LOG_SRVC_INOUT, "< AdaServiceMock::onServicesReady");
            });
        }
    }
};

/**
 * The AdaServiceMock handles text to speech by using the browsers speech engine.
 *
 * @function getServiceClass
 * @param {Class} Class
 * @param {BaseService} BaseService
 * @param {ext} ext
 * @param {LogProvider} LogProvider
 * @returns {Wincor.UI.Service.Provider.AdaService}
 * @class
 * @since 1.2/00
 */
export default getServiceClass;
