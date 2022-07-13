/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ wn.UI.Service.EventService.js 4.3.1-210203-21-1b8704b6-1a04bc7d
 */

/**
 * @module
 */
const getServiceClass = ({ Wincor, ext, LogProvider, PTService, EventInfoList }) => {
    /**
     * @type {Wincor.UI.Diagnostics.LogProvider|*|Wincor.UI.Diagnostics.LogProvider|*}
     * @private
     */
    const _logger = LogProvider;

    return class EventService extends PTService {

        /**
         * Map containing the current event registrations
         * An entry in this map consists of:
         * @example
         * key   = moduleName {string}
         * value = [EventRegstration1, EventRegstration2, ...]  (Array of EventRegistration objects) {@link Wincor.UI.Service.EventService#EventRegistration}
         * @type {Map}
         */
        registerMap = new Map();

        /**
         * The registration counter.
         * @private
         */
        regIdxCounter = 0;

        /**
         * "EventService" - the logical name of this service as used in the service-provider
         * @const
         * @type {String}
         */
        NAME = "EventService";
        
        /**
         * Extended message literal providing Protopas specific data
         */
        FRM_REGISTER_FOR_EVENTS = null;
        
        /**
         * Extended message literal providing Protopas specific data
         */
        FRM_DEREGISTER_FOR_EVENTS = null;
        
        /*
         * Extended message literal providing Protopas specific data
         */
        
        /**
         * Method name for Protopas bus call, to register for events
         * @const
         */
        METHOD_FRM_REGISTER_FOR_EVENTS = "RegisterForEvents";
        
        /**
         * Method name for Protopas bus call, to deregister for events
         * @const
         */
        METHOD_FRM_DEREGISTER_FOR_EVENTS = "DeregisterForEvents";

        /**
         * An object of EventRegistration is created every time, when s.o. registers for an event.
         * @class
         */
        EventRegistration = function() {
            /**
             * The ID of the event
             * @type {string}
             */
            this.eventId = null;    //the registered event

            /**
             * The registration index.
             * An unique index for every registration, needed for deregistration (compare to setTimeout/clearTimeout)
             * @type {number}
             */
            this.regIdx = null;     //an unique index for every registration, needed for deregistration (compare to setTimeout/clearTimeout)

            /**
             * A callback function that is called when the event is triggered.
             * @type {function}
             */
            this.callback = null;   //this callback is called when the event is triggered

            /**
             * Specifies the type of data which is send via the event.
             * @type {string}
             */
            this.dataType = null;   //specifies the type of data which is send via the event

            /**
             * If the registration is persistent (true), a content-page unload will not remove the registration, false otherwise.
             * @type {boolean}
             */
            this.persistent = false; //if registration is persistent, a content-page unload will not remove the registration
        };

        /**
         * See {@link Wincor.UI.Service.PTService#constructor}.
         * @lifecycle service
         */
        constructor(...args) {
            super(...args);
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> EventService::EventService");

            //setup message / events

            this.FRM_REGISTER_FOR_EVENTS = Object.assign(Object.assign({}, this.REQUEST), {
                service: this.NAME,
                methodName: this.METHOD_FRM_REGISTER_FOR_EVENTS,
                RC: -1,
                FWName: "",
                FWEventID: -1,
                DataType: "HEX"
            });

            this.FRM_DEREGISTER_FOR_EVENTS = Object.assign(Object.assign({}, this.REQUEST), {
                service: this.NAME,
                methodName: this.METHOD_FRM_DEREGISTER_FOR_EVENTS,
                RC: -1
            });
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< EventService::EventService");
        }
        
        /**
         * Gets the event info from the event owner list.
         * The caller has to know the module name and the id definition name.
         * <p>The event owners and IDs are configured in configuration file <a href="./EventInfoList.json">EventInfoList.json</a></p>
         * @param {String} name Name of the owner as defined in EventInfoList.json
         * @returns {Object} An object containing the name (NAME) of the owner and one or more event ids or an empty object in case of error
         */
        getEventInfo(name) {
            if(name in EventInfoList) {
                return EventInfoList[name];
            } else {
                _logger.log(_logger.LOG_ERROR, `Unknown event module name ${name} not in event owner list available.`);
                return {};
            }
        }

        /**
         * This method will be triggered on message receive
         * @param {Object} message
         * @eventhandler native
         */
        onEvent(message) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> EventService::onEvent('${JSON.stringify(message)}')`);

            if(message && message.methodName === this.EVENT_ON_FRM_EVENT && this.registerMap.has(message.FWName)) {
                try {
                    let delegate = null;
                    for(let [module, regEventArray] of this.registerMap) {
                        if(module === message.FWName) {
                            for(let i = regEventArray.length - 1; i >= 0; i--) {
                                if(regEventArray[i].eventId === null || regEventArray[i].eventId == message.FWEventID) { //Do not use '===' for FWEventID here !
                                    delegate = regEventArray[i].callback;
                                    if(typeof delegate === "function") {
                                        delegate(message.FWEventParam, message.FWEventID, message.FWName);
                                    } else {
                                        _logger.log(_logger.LOG_ERROR, `. Error! Delegate is ${typeof delegate}`);
                                    }
                                }
                            }
                        }
                    }
                    message.ack = "OK";
                } catch(e) {
                    // Provider writes error-log
                    Wincor.UI.Service.Provider.propagateError(this.NAME, this.ERROR_TYPE.EVENT, e);
                    message.ack = "ERROR";
                }
            } else {
                _logger.log(_logger.LOG_ERROR, `. unknown event or framework message=${JSON.stringify(message)}`);
                message.ack = "UNKNOWN";
            }

            this.sendEvent(message); //send acknowledge. message.ack will contain the details (OK / ERROR / UNKNOWN)
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< EventService::onEvent");
        }

        /**
         * Used to de-register a specific or all non persistent business logic events
         * @param {number} regIdx id previously returned by registerForEvent or -1 to de-register all non-persistent registrations
         * @param {function=} callbackDeregister
         */
        deregisterEvent(regIdx, callbackDeregister) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> EventService::deregisterEvent(${regIdx})`);
            let foundModule = null, message;
            for(let [module, regEventArray] of this.registerMap) {
                for(let i = regEventArray.length - 1; i >= 0; i--) {
                    if(regIdx === -1) {
                        if(!regEventArray[i].persistent) {
                            regEventArray.splice(i, 1);
                            if(regEventArray.length === 0) {
                                this.registerMap.delete(module);
                                message = Object.assign(Object.assign({}, this.FRM_DEREGISTER_FOR_EVENTS), { FWName: module });
                                this.sendRequest(message, callbackDeregister);
                            }
                        }
                    } else if(regEventArray[i].regIdx === regIdx) {
                        foundModule = module;
                        regEventArray.splice(i, 1);
                        if(regEventArray.length === 0) {
                            this.registerMap.delete(module);
                            message = Object.assign(Object.assign({}, this.FRM_DEREGISTER_FOR_EVENTS), { FWName: foundModule });
                            this.sendRequest(message, callbackDeregister);
                        }
                        break;
                    }
                }
                if(foundModule) {
                    break;
                }
            }
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< EventService::deregisterEvent");
        }

        /**
         * Use this function to register for business logic events.
         * The function returns an ID, that must be used when you call deregisterEvent()
         * @param {Number} event The event ID, 'null' for ALL events of a moduleName
         * @param {String} moduleName The moduleName that sends the event (normally ProTopas framework)
         * @param {Function} callbackEvent Callback function receiving (FWEventParam, FWEventID, FWName) method that is called if the event is triggered
         * @param {Function} callbackRegister Callback function receiving message object. Can be used to check whether registration was successful or not, check message.RC
         * @param {String} dataType Type of event data which is expected: "HEX", "ASCII", "UTF-8"
         * @param {Boolean=} persistent (default: false) If registered with persistent=true, the registration will not be automatically removed on page deactivation.
         * @return {Number} registrationID Used for manual de-registration.
         */
        registerForEvent(event, moduleName, callbackEvent, callbackRegister, dataType, persistent) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> EventService::registerForEvent(${event}, ${moduleName}, ..., ..., ${dataType}, ${persistent})`);

            this.regIdxCounter++;

            //build the new EventRegistration object and add it to the map
            let reg = new this.EventRegistration();
            reg.regIdx = this.regIdxCounter;
            reg.eventId = event;
            reg.callback = callbackEvent;
            reg.dataType = dataType;
            reg.persistent = persistent || false;

            let regArray = [];

            if (this.registerMap.has(moduleName)) {
                regArray = this.registerMap.get(moduleName);
            }

            regArray.push(reg);
            this.registerMap.set(moduleName, regArray);


            //build the ProTopas message and send it
            const message = Object.assign({}, this.FRM_REGISTER_FOR_EVENTS);
            message.FWName = moduleName;
            message.FWEventID = event;  //actually we do not need this for event registration, because in
                                        //ProTopas we always register for ALL events of a framework. However, we
                                        //we send this data, so that the callbackRegister method may use this field.
            message.DataType = dataType;

            this.sendRequest(message, callbackRegister);

            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `< EventService::registerForEvent returns regId: ${this.regIdxCounter}`);
            return this.regIdxCounter;
        }

        /**
         * See {@link Wincor.UI.Service.BaseService#onSetup}
         * <p>Used to read the configured event mappings from <a href="./EventInfoList.json">EventInfoList.json</a></p>
         *
         * @param {object} message
         * @returns {Promise}
         * @eventhandler native
         * @lifecycle service
         */
        onSetup(message) {
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, `> EventService::onSetup('${JSON.stringify(message)}')`);
            _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< EventService::onSetup");
            return Promise.resolve();
        }

        /**
         * See {@link Wincor.UI.Service.BaseService#onServicesReady}
         * Registers for {@link Wincor.UI.Service.ViewService#SERVICE_EVENTS:VIEW_CLOSING} to deregister non-persistent event registrations when a view deactivates.
         *
         * @returns {Promise}
         * @lifecycle service
         */
        onServicesReady() {
            return ext.Promises.promise((resolve, reject) => {
                _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "> EventService::onServicesReady()");
                // every time a content-page is closing, we have to de-register the non persistent registrations
                const ds = this.serviceProvider.ViewService;
                ds.registerForServiceEvent(ds.SERVICE_EVENTS.VIEW_CLOSING, this.deregisterEvent.bind(this, -1, null), true);
                super.onServicesReady().then(resolve);
                _logger.LOG_SRVC_INOUT && _logger.log(_logger.LOG_SRVC_INOUT, "< EventService::onServicesReady");
            });
        }
    }
};

/**
 * The EventService class receives all events and provide them to the registered services.
 * <p>
 * Why is the Event Service implemented the way it is?
 * Gui.DLL: Events are always delivered to EventService. This is now a convention and in JavaScript
 * every one must use the EventService. You can NOT use the PTService to register for events.
 * Let's look why this would be a bad idea:
 * Every service inheriting from PTService could register for events. If this would be possible we
 * would have to have an event list in Gui.DLL, because if an event would occur in Gui.DLL it must
 * be clear to which service(s) this event muse be forwarded. If it would always be sent to
 * PTService then the PTService would have to forward the event to the right service -- but then the
 * PTService would need an own instance. Then a service would maybe inherit from PTService and at the
 * same time maybe use an instance of PTService --> strange design.
 * So we better use the PTService only as a service for ProTopas Requests and use the EventService for
 * (Protopas) events.
 * </p>
 *
 * @function getServiceClass
 * @param {Wincor} Wincor
 * @param {ext} ext
 * @param {LogProvider} LogProvider
 * @param {PTService} PTService
 * @param {EventInfoList} EventInfoList
 * @returns {Wincor.UI.Service.EventService}
 * @class
 * @since 1.0/00
 */
export default getServiceClass;
