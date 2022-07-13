/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ wn.UI.Service.EventServiceMock.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

/**
 * @module
 */
const getServiceClass = ({ BaseService, EventInfoList }) => {

    return class EventServiceMock extends BaseService {

        /**
         * "EventServiceMock" - the logical name of this service as used in the service-provider
         * @const
         * @type {string}
         */
        NAME = "EventService";

        /**
         * registerMap: key   = moduleName (string)
         *              value = [EventRegstration1, EventRegstration2, ...]  (Array of EventRegistration objects)
         */
        registerMap = new Map();
        regIdxCounter = 0;

        /**
         * See {@link Wincor.UI.Service.BaseServiceMock#constructor}.
         * @lifecycle service
         */
        constructor (...args) {
            super(...args);
            this.logger.log(this.logger.LOG_SRVC_INOUT, "> EventServiceMock::EventServiceMock");
            this.logger.log(this.logger.LOG_SRVC_INOUT, "< EventServiceMock::EventServiceMock");
        }
        
        /**
         * An object of EventRegistration is created every time, when s.o. registers for an event
         */
        EventRegistration() {
            this.eventId = null;    //the registered event
            this.regIdx = null;     //an unique index for every registration, needed for deregistration (compare to setTimeout/clearTimeout)
            this.callback = null;   //this callback is called when the event is triggered
            this.dataType = null;   //specifies the type of data which is send via the event
            this.persistent = false; //if registration is persistent, a content-page unload will not remove the registration
        }

        /**
         * Gets the event info from the event owner list.
         * The caller has to know the module name and the id definition name.
         * @param {String} name the name of the owner
         * @returns {Object} an object containing the name (NAME) of the owner and one or more event ids or an empty object in case of error
         */
        getEventInfo(name) {
            if(name in EventInfoList) {
                return EventInfoList[name];
            } else {
                this.logger.log(this.logger.LOG_ERROR, `Unknown event module name ${name} not in event owner list available.`);
                return {};
            }
        }

        /**
         * Returns an index, that must be used when you call deregisterEvent()
         * @param {Number} event The event ID, 'null' for ALL events of a moduleName
         * @param {String} moduleName The moduleName that sends the event (normally ProTopas framework)
         * @param {Function} callbackEvent Callback(keys, values) method that is called if the event is triggered
         * @param {Function} callbackRegister Callback(message) can be used to check wether registration was successful or not, check message.RC
         * @param {String} dataType Type of data which were send by the event: "HEX", "ASCII", "UTF-8"
         * @param {Boolean=} persistent (default: false) If registered with persistent=true, the registration will not be automatically removed on page deactivation
         */
        registerForEvent(event, moduleName, callbackEvent, callbackRegister, dataType, persistent) {
            this.logger.log(this.logger.LOG_SRVC_INOUT, `> EventServiceMock::registerForEvent(${event}, ${moduleName}, ..., ..., ${dataType}, ${persistent})`);
            this.regIdxCounter++;

            //build the new EventRegistration object and add it to the map
            let reg = new this.EventRegistration();
            reg.regIdx = this.regIdxCounter;
            reg.eventId = event;
            reg.callback = callbackEvent;
            reg.dataType = dataType;
            reg.persistent = persistent || false;

            let regArray = [];

            if(this.registerMap.has(moduleName)) {
                regArray = this.registerMap.get(moduleName);
            }

            regArray.push(reg);
            this.registerMap.set(moduleName, regArray);

            if(callbackRegister) {
                callbackRegister({RC: 0});
            }
            this.logger.log(this.logger.LOG_SRVC_INOUT, `< EventServiceMock::registerForEvent returns regId: ${this.regIdxCounter}`);
            return this.regIdxCounter;
        }

        /**
         * Used to de-register a specific event or all non persistent events
         * @param regIdx id previously returned by registerForEvent or -1 to de-register all non-persistent registrations
         * @param callbackDeregister
         */
        deregisterEvent(regIdx, callbackDeregister) {
            this.logger.log(this.logger.LOG_SRVC_INOUT, `> EventServiceMock::deregisterEvent(${regIdx})`);
            let foundModule = null;
            for(let [module, regEventArray] of this.registerMap) {
                for(let i = regEventArray.length - 1; i >= 0; i--) {
                    if(regIdx === -1) {
                        if(!regEventArray[i].persistent) {
                            regEventArray.splice(i, 1);
                            if(regEventArray.length === 0) {
                                this.registerMap.delete(module);
                            }
                        }
                    } else if(regEventArray[i].regIdx === regIdx) {
                        foundModule = module;
                        regEventArray.splice(i, 1);
                        if(regEventArray.length === 0) {
                            this.registerMap.delete(module);
                        }
                        break;
                    }
                }
                if(foundModule) {
                    break;
                }
            }
            if(callbackDeregister) {
                callbackDeregister({RC: 0});
            }
            this.logger.log(this.logger.LOG_SRVC_INOUT, "< EventServiceMock::deregisterEvent");
        }

        /**
         * This method will be triggered on message receive
         * @param {Object} message
         * @eventhandler
         */
        onEvent(message) {
            this.logger.log(this.logger.LOG_SRVC_INOUT, `> EventServiceMock::onEvent('${JSON.stringify(message)}')`);
            if(message && this.registerMap.has(message.FWName)) {
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
                                        this.logger.log(this.logger.LOG_ERROR, `. Error! Delegate is ${typeof delegate}`);
                                    }
                                }
                            }
                        }
                    }
                } catch(e) {
                    // Provider writes error-log
                    Wincor.UI.Service.Provider.propagateError(this.NAME, this.ERROR_TYPE.EVENT, e);
                }
            } else {
                this.logger.log(this.logger.LOG_ERROR, `. unknown event or framework message=${JSON.stringify(message)}`);
            }
            this.logger.log(this.logger.LOG_SRVC_INOUT, "< EventServiceMock::onEvent");
        }

        /**
         * This method is called by the service-provider if an error occurred in any service
         * @eventhandler
         * @param {String} serviceName
         * @param {String} errorType
         */
        onError(serviceName, errorType) {
            this.logger.log(this.logger.LOG_SRVC_INOUT, `> EventServiceMock::onError(${serviceName}, ${errorType})`);
            this.logger.log(this.logger.LOG_SRVC_INOUT, "< EventServiceMock::onError");
        }

        /**
         * See {@link Wincor.UI.Service.BaseServiceMock#onSetup}
         * @param {object} message      See {@link Wincor.UI.Service.BaseServiceMock#onSetup}
         * @returns {Promise}
         * @lifecycle service
         */
        onSetup(message) {
            this.logger.log(this.logger.LOG_SRVC_INOUT, `> EventServiceMock::onSetup('${JSON.stringify(message)}')`);
            this.logger.log(this.logger.LOG_SRVC_INOUT, `< EventServiceMock::onSetup`);
            return Promise.resolve();
        }

        /**
         * See {@link Wincor.UI.Service.BaseServiceMock#onServicesReady}
         * @returns {Promise}
         * @lifecycle service
         */
        onServicesReady() {
            this.logger.log(this.logger.LOG_SRVC_INOUT, "> EventServiceMock::onServicesReady()");
            return new Promise((resolve, reject) => {
                // every time a content-page is closing, we have to de-register the non persistent registrations
                const ds = this.serviceProvider.ViewService;
                ds.registerForServiceEvent(ds.SERVICE_EVENTS.VIEW_CLOSING, this.deregisterEvent.bind(this, -1, null), true);
                super.onServicesReady().then(resolve);
                this.logger.log(this.logger.LOG_SRVC_INOUT, "< EventServiceMock::onServicesReady");
            });
        }
    }
};

/**
 * The EventServiceMock manages the event handling in the same way as the real EventService class.
 *
 * @function getServiceClass
 * @param {Class} Class
 * @param {BaseService} BaseService
 * @param {EventInfoList} EventInfoList
 * @returns {Wincor.UI.Service.Provider.EventService}
 * @class
 * @since 1.2/00
 */
export default getServiceClass;
