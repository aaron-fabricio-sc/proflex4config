/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ wn.UI.Service.ViewService_test.js 4.3.1-210702-21-a51e474c-1a04bc7d

*/

import { WincorNamespace } from "../../../../GUI_UnitTesting/NamespaceMock.js";
import getExtensions from "../../../lib/internal/wn.UI.extensions.js";
import getServiceClass from "../../../../GUIAPP/core/service/wn.UI.Service.ViewService.js";

let Wincor;
let Svc;
/*global jQuery:false*/
describe("wn.UI.Service.ViewService", () => {
    // setup before any of the specs
    beforeEach(done => {
        Wincor = new WincorNamespace();

        class PTService extends Wincor.UI.Service.PTService {
            hasReceivers = () => true;
        
            translateResponse() {
            }
        
            sendRequest() {
            }
        
            sendEvent() {
            }
        }
    
        const LogProvider = Wincor.UI.Diagnostics.LogProvider;
        Svc = getServiceClass({ Wincor, jQuery, ext: getExtensions({Wincor, LogProvider}), LogProvider, PTService });
        done();
    });

    // tear down after any of the specs
    afterEach(() => {
    });

    /*********************************************************************************************************/
    describe("initialization", () => {
        it("implements basic service attributes", async() => {
            const viewSvc = new Svc();
            expect(viewSvc.NAME).toBe("ViewService");
            expect(viewSvc.SERVICE_EVENTS).toEqual({
                NAVIGATE_SPA: "NAVIGATE_SPA",
                VIEW_CLOSING: "VIEW_CLOSING",
                VIEW_BEFORE_CHANGE: "VIEW_BEFORE_CHANGE",
                VIEW_PREPARED: "VIEW_PREPARED",
                TURN_ACTIVE: "TURN_ACTIVE",
                CONTENT_UPDATE: "CONTENT_UPDATE",
                VIEW_ACTIVATED: "VIEW_ACTIVATED",
                VIEW_USERINTERACTION_TIMEOUT: "VIEW_USERINTERACTION_TIMEOUT",
                STYLE_TYPE_CHANGED: "STYLE_TYPE_CHANGED",
                POPUP_ACTIVATED: "POPUP_ACTIVATED",
                POPUP_DEACTIVATED: "POPUP_DEACTIVATED",
                REFRESH_TIMEOUT: "REFRESH_TIMEOUT",
                SHUTDOWN: "SHUTDOWN",
                SUSPEND: "SUSPEND",
                RESUME: "RESUME",
                LOCATION_CHANGED: "LOCATION_CHANGED"
            });
        });

        it("calls base-class constructor function", () => {
            // done is used for async behavior
            // require service. All dependencies are mocked by "beforeEach" above
            const svc = new Svc();
            expect(svc.NAME).toBe("ViewService");
        });

        it("waits for depending services before resolving onServicesReady", async done => {
            const SVC_DEPENDENCIES = ["EppService", "ConfigService", "ViewService", "VideoService", "LogProvider", "MyService"];

            const svc = new Svc();
            svc.startSPA = jasmine.createSpy("startSPA").and.callFake(() => {
                // should only be called when we resolve our MyService.whenReady
                done();
            });
            // mock some functions and prepare serviceNames
            svc.readTimeouts = svc.readViewKeys = jasmine.createSpy("readStuff").and.returnValue(Promise.resolve());
            svc.serviceProvider.serviceNames = SVC_DEPENDENCIES;
            svc.serviceProvider["MyService"] = {};
            svc.serviceProvider["MyService"].whenReady = new Promise((resolve, reject) => {
                Promise.all(
                    SVC_DEPENDENCIES.filter(svcName => {
                        return ![svc.NAME, "MyService"].includes(svcName);
                    })
                    .map(svcName => {
                        return svc.serviceProvider[svcName].whenReady;
                    }))
                    .then(() => {
                        expect(svc.startSPA).not.toHaveBeenCalled();
                        return new Promise(res => {
                            // unfortunately jasmine.clock does not work with promises in any case... so we really have to delay a bit
                            setTimeout(res, 10);
                        });
                    })
                    // all relevant dependencies are resolved now since at least 100ms... startSPA will be done when we resolve
                    .then(() => {
                        expect(svc.startSPA).not.toHaveBeenCalled();
                        // only after we resolve our delayed stuff content should be started
                        resolve();
                    });
            });
            // trigger
            svc.onServicesReady();
        });

        describe("JSON handling", () => {
            it("corrects JSON based view stuff", async() => {
                const svc = new Svc();

                const TEST_DATA = {
                    url: "test.html",
                    commandconfig: { cancel: "PROP_VIEW_STATE_S", confirm: "2" },
                    popup: {
                        isCancel: "true",
                        isOpen: "false",
                        nestedObj: { val: "3" }
                    }
                };

                svc.correctValue = jasmine.createSpy("correctValue").and.callFake(value => {
                    if (!isNaN(value)) {
                        return parseInt(value);
                    } else if (value === "true") {
                        return true;
                    } else if (value === "false") {
                        return false;
                    }
                    return value;
                });
                spyOn(svc, "correctJSONObject").and.callThrough();
                const result = svc.correctJSONObject(TEST_DATA, "TestViewKey");

                expect(svc.correctJSONObject).toHaveBeenCalledTimes(4);
                expect(result.url).toBe("test.html");
                expect(result.commandconfig.cancel).toBe("PROP_VIEW_STATE_S");
                expect(result.commandconfig.confirm).toBe(2);
                expect(result.popup.isCancel).toBe(true);
                expect(result.popup.isOpen).toBe(false);
                expect(result.popup.nestedObj.val).toBe(3);
            });
        });

        /*********************************************************************************************************/
        describe("error-handling", () => {
            it("resumes execution of GUIAPP when GUIDM gets in error state while GUIAPP is suspended", async() => {
                const svc = new Svc();
                svc.startSPA = jasmine.createSpy("startSPA");

                // mock some functions and prepare serviceNames
                svc.readTimeouts = svc.readViewKeys = jasmine.createSpy("readStuff").and.returnValue(Promise.resolve());
                svc.serviceProvider.serviceNames = [];
                svc.serviceProvider["MyService"] = {};
                svc.serviceProvider["MyService"].whenReady = Promise.resolve();
                svc.whenReady = Promise.resolve();
                spyOn(svc, "loadViewSet");
                Wincor.UI.Service.Provider.ConfigService.getConfiguration = () => {
                    return Promise.resolve({});
                };
                svc.serviceProvider["EventService"].whenReady = Promise.resolve();
                spyOn(svc.serviceProvider, "getInstanceName").and.callFake(() => {
                    // ensure that we get to the correct part of onServicesReady by asking the current getInstanceName count
                    if (svc.serviceProvider.getInstanceName.calls.count() === 3) {
                        return "GUIAPP";
                    }
                    return "GUITEST";
                });
                const otherServiceFake = {
                    registerForServiceEvent: () => {},
                    SERVICE_EVENTS: {}
                };
                spyOn(svc.serviceProvider.ViewService, "getRemoteInstance").and.returnValue(Promise.resolve(otherServiceFake));
                spyOn(svc.serviceProvider.ViewService, "hasRemoteInstance").and.returnValue(Promise.resolve(true));
                let privateCallbackOfViewServiceForGUIDMEvents;
                let regForEventStatusChangedCallbackReady;
                const call = new Promise(resolve => {
                    regForEventStatusChangedCallbackReady = resolve;
                });
                spyOn(svc.serviceProvider.EventService, "registerForEvent").and.callFake((event, moduleName, callbackEvent, callbackRegister, dataType, persistent) => {
                    if (event === 4004 && moduleName === "GUIDM") {
                        expect(persistent).toBe(true);
                        expect(dataType).toBe("HEX");
                        // pretty much work to do just to get the private anonymous callback function...
                        privateCallbackOfViewServiceForGUIDMEvents = callbackEvent;
                        // resolve call Promise
                        regForEventStatusChangedCallbackReady();
                    }
                });
                spyOn(svc.serviceProvider.EventService, "getEventInfo").and.returnValue({
                    NAME: "GUIDM",
                    ID_STATUS_CHANGED: 4004
                });
                spyOn(svc, "resume").and.callThrough(); // callThrough to check flag and list afterwards
                
                // trigger 'onServicesReady' to start the test
                svc.onServicesReady();
                await call;
                // ok the callback is known now, pass hex data as gui.dll would do...
                const HEX_DATA_STATUS_ERROR = "08000000ff";
                const HEX_DATA_STATUS_OTHER = "02000000ff";
                svc.isSuspended = true;
                svc.suspendList = [1, 2, 3];
                // calling should trigger "resume" function, if currently suspended
                expect(typeof privateCallbackOfViewServiceForGUIDMEvents).toBe("function");
                privateCallbackOfViewServiceForGUIDMEvents && privateCallbackOfViewServiceForGUIDMEvents(HEX_DATA_STATUS_ERROR);
                expect(svc.resume).toHaveBeenCalledTimes(1);
                expect(svc.isSuspended).toBe(false);
                expect(svc.suspendList.length).toBe(0);
                // check if other events do not trigger the functionality
                svc.isSuspended = true;
                svc.suspendList = [1, 2, 3];
                privateCallbackOfViewServiceForGUIDMEvents && privateCallbackOfViewServiceForGUIDMEvents(HEX_DATA_STATUS_OTHER);
                expect(svc.resume).toHaveBeenCalledTimes(1);
                expect(svc.isSuspended).toBe(true);
                expect(svc.suspendList.length).toBe(3);
            });
        });

        describe("onServicesReady promise chain", () => {
            it("ensures that cross-call is done in correct state of GUIDM", async() => {
                const svc = new Svc();
                svc.startSPA = jasmine.createSpy("startSPA");

                // mock some functions and prepare serviceNames
                svc.readTimeouts = svc.readViewKeys = jasmine.createSpy("readStuff").and.returnValue(Promise.resolve());
                svc.serviceProvider.serviceNames = [];
                svc.serviceProvider["MyService"] = {};
                svc.serviceProvider["MyService"].whenReady = Promise.resolve();
                // svc.serviceProvider["ViewService"].whenReady = Promise.resolve();
                svc.whenReady = Promise.resolve();
                spyOn(svc, "loadViewSet");
                Wincor.UI.Service.Provider.ConfigService.getConfiguration = () => {
                    return Promise.resolve({});
                };
                svc.serviceProvider["EventService"].whenReady = Promise.resolve();
                let instanceName = "";
                spyOn(svc.serviceProvider, "getInstanceName").and.callFake(() => {
                    // ensure that we get to the correct part of onServicesReady by asking the current getInstanceName count
                    if (svc.serviceProvider.getInstanceName.calls.count() === 2) {
                        instanceName = "GUIAPP";
                    } else {
                        instanceName = "GUITEST";
                    }
                    return instanceName;
                });
                const otherServiceFake = {
                    registerForServiceEvent: () => {},
                    SERVICE_EVENTS: {}
                };
                spyOn(svc.serviceProvider.ViewService, "getRemoteInstance").and.returnValue(Promise.resolve(otherServiceFake));
                spyOn(svc.serviceProvider.ViewService, "hasRemoteInstance").and.returnValue(Promise.resolve(true));
                svc.serviceProvider.EventService.deregisterEvent = jasmine.createSpy("deregisterEvent");
                spyOn(svc.serviceProvider.EventService, "getEventInfo").and.returnValue({
                    NAME: "GUIDM",
                    ID_STATUS_CHANGED: 4004
                });
                let privateCallbackOfViewServiceForGUIDMEvents;
                let regForEventStatusChangedCallbackReady;
                const call = new Promise(resolve => {
                    regForEventStatusChangedCallbackReady = resolve;
                });
                spyOn(svc.serviceProvider.EventService, "registerForEvent").and.callFake((event, moduleName, callbackEvent, callbackRegister, dataType, persistent) => {
                    if (instanceName === "GUIAPP" && event === 4004 && moduleName === "GUIDM") {
                        expect(persistent).toBe(true);
                        expect(dataType).toBe("HEX");
                        // pretty much work to do just to get the private anonymous callback function...
                        privateCallbackOfViewServiceForGUIDMEvents = callbackEvent;
                        // resolve call Promise
                        regForEventStatusChangedCallbackReady();
                    }
                });
                svc.registerForServiceEvent = jasmine.createSpy("registerForServiceEvent").and.callFake((evt, handler) => {
                    if(evt === svc.SERVICE_EVENTS.VIEW_ACTIVATED) {
                        handler();
                    }
                });
                
                // trigger 'onServicesReady' to start the test
                svc.onServicesReady();
                await call;

                // ok the callback is known now, pass hex data as gui.dll would do...
                const HEX_DATA_STATUS_WAIT = "02000000ff";
                const HEX_DATA_STATUS_INIT = "01000000ff";
                const HEX_DATA_STATUS_UN_INIT = "00000000ff";
                const HEX_DATA_STATUS_ERROR = "08000000ff";
                // calling should trigger "resolve" function
                expect(typeof privateCallbackOfViewServiceForGUIDMEvents).toBe("function");
                // these states must prevent from resolving the promise guiStatePromise
                privateCallbackOfViewServiceForGUIDMEvents && privateCallbackOfViewServiceForGUIDMEvents(HEX_DATA_STATUS_UN_INIT);
                privateCallbackOfViewServiceForGUIDMEvents && privateCallbackOfViewServiceForGUIDMEvents(HEX_DATA_STATUS_INIT);
                privateCallbackOfViewServiceForGUIDMEvents && privateCallbackOfViewServiceForGUIDMEvents(HEX_DATA_STATUS_ERROR);
                expect(svc.serviceProvider.ViewService.getRemoteInstance).not.toHaveBeenCalled();
                // check if other events let resolve
                privateCallbackOfViewServiceForGUIDMEvents && privateCallbackOfViewServiceForGUIDMEvents(HEX_DATA_STATUS_WAIT);
                expect(svc.serviceProvider.EventService.deregisterEvent).toHaveBeenCalledTimes(1);
            });

            it("ensures that cross-call is done in correct state of GUIAPP", async() => {
                const svc = new Svc();
                svc.startSPA = jasmine.createSpy("startSPA");

                // mock some functions and prepare serviceNames
                svc.readTimeouts = svc.readViewKeys = jasmine.createSpy("readStuff").and.returnValue(Promise.resolve());
                svc.serviceProvider.serviceNames = [];
                svc.serviceProvider["MyService"] = {};
                svc.serviceProvider["MyService"].whenReady = Promise.resolve();
                // svc.serviceProvider["ViewService"].whenReady = Promise.resolve();
                svc.whenReady = Promise.resolve();
                spyOn(svc, "loadViewSet");
                Wincor.UI.Service.Provider.ConfigService.getConfiguration = () => {
                    return Promise.resolve({});
                };
                svc.serviceProvider["EventService"].whenReady = Promise.resolve();
                let instanceName = "";
                spyOn(svc.serviceProvider, "getInstanceName").and.callFake(() => {
                    // ensure that we get to the correct part of onServicesReady by asking the current getInstanceName count
                    if (svc.serviceProvider.getInstanceName.calls.count() === 2) {
                        instanceName = "GUIDM";
                    } else {
                        instanceName = "GUITEST";
                    }
                    return instanceName;
                });
                const otherServiceFake = {
                    registerForServiceEvent: () => {},
                    SERVICE_EVENTS: {}
                };
                spyOn(svc.serviceProvider.ViewService, "getRemoteInstance").and.returnValue(Promise.resolve(otherServiceFake));
                spyOn(svc.serviceProvider.ViewService, "hasRemoteInstance").and.returnValue(Promise.resolve(true));
                let privateCallbackOfViewServiceForGUIDMEvents;
                let regForEventStatusChangedCallbackReady;
                const call = new Promise(resolve => {
                    regForEventStatusChangedCallbackReady = resolve;
                });
                spyOn(svc.serviceProvider.EventService, "registerForEvent").and.callFake((event, moduleName, callbackEvent, callbackRegister, dataType, persistent) => {
                    if (instanceName === "GUIDM" && event === 4021 && moduleName === "GUIAPP") {
                        expect(persistent).toBe(true);
                        expect(dataType).toBe("HEX");
                        // pretty much work to do just to get the private anonymous callback function...
                        privateCallbackOfViewServiceForGUIDMEvents = callbackEvent;
                        // resolve call Promise
                        regForEventStatusChangedCallbackReady();
                    }
                });
                // spy to check whether the other view service has registered to the LOCATION_CHANGED event
                svc.registerForServiceEvent = jasmine.createSpy("registerForServiceEvent").and.callFake((evt, handler) => {
                    if(evt === svc.SERVICE_EVENTS.VIEW_ACTIVATED) {
                        handler();
                    } else {
                        expect(evt).toBe(svc.SERVICE_EVENTS.LOCATION_CHANGED);
                        // this check is the getRemoteInstance after the promise.all([whenReady, guiStatePromise])
                        expect(svc.serviceProvider.ViewService.getRemoteInstance).toHaveBeenCalledTimes(1);
                    }
                });
                
                spyOn(svc.serviceProvider.EventService, "getEventInfo").and.returnValue({
                    NAME: "GUIAPP",
                    ID_STATUS_CHANGED: 4021
                });

                svc.serviceProvider.EventService.deregisterEvent = jasmine.createSpy("deregisterEvent");
                
                // trigger 'onServicesReady' to start the test
                svc.onServicesReady();
                await call;

                // ok the callback is known now, pass hex data as gui.dll would do...
                const HEX_DATA_STATUS_WAIT = "02000000ff";
                const HEX_DATA_STATUS_INIT = "01000000ff";
                const HEX_DATA_STATUS_UN_INIT = "00000000ff";
                const HEX_DATA_STATUS_ERROR = "08000000ff";
                // calling should trigger "resolve" function
                expect(typeof privateCallbackOfViewServiceForGUIDMEvents).toBe("function");
                // these states must prevent from resolving the promise guiStatePromise
                privateCallbackOfViewServiceForGUIDMEvents && privateCallbackOfViewServiceForGUIDMEvents(HEX_DATA_STATUS_UN_INIT);
                privateCallbackOfViewServiceForGUIDMEvents && privateCallbackOfViewServiceForGUIDMEvents(HEX_DATA_STATUS_INIT);
                privateCallbackOfViewServiceForGUIDMEvents && privateCallbackOfViewServiceForGUIDMEvents(HEX_DATA_STATUS_ERROR);
                expect(svc.serviceProvider.ViewService.getRemoteInstance).not.toHaveBeenCalled();
                // check if other events let resolve
                privateCallbackOfViewServiceForGUIDMEvents && privateCallbackOfViewServiceForGUIDMEvents(HEX_DATA_STATUS_WAIT);
                expect(svc.serviceProvider.EventService.deregisterEvent).toHaveBeenCalledTimes(1);
            });
        });

        /*********************************************************************************************************/
        describe("when processing configuration", () => {
            it("can read the timeouts", done => {
                const myConfiguredTimeouts = {
                    PageTimeout: -1,
                    ImmediateTimeout: 0,
                    EndlessTimeout: -1,
                    MessageTimeout: 5000,
                    ConfirmationTimeout: 30000,
                    InputTimeout: 120000,
                    PinentryTimeout: 30000,
                    AdaTutorialInfoTimeout: 180000,
                    SuspendApplicationInfoTimeout: 300000,
                    AssistanceInfoTimeout: 300000
                };

                Wincor.UI.Service.Provider.ConfigService.getConfiguration = section => {
                    if (section.endsWith("\\Services\\Timeouts")) {
                        //* ConfigProxy::getConfiguration returns {"PageTimeout":-1,"ImmediateTimeout":0,"EndlessTimeout":-1,"MessageTimeout":5000,"ConfirmationTimeout":30000,"InputTimeout":120000,"PinentryTimeout":30000,"AdaTutorialInfoTimeout":180000,"SuspendApplicationInfoTimeout":300000,"AssistanceInfoTimeout":300000}
                        return Promise.resolve(myConfiguredTimeouts);
                    }
                    return Promise.reject();
                };

                const svc = new Svc();
                svc.DEFAULT_TIMEOUT_VALUES = {};

                svc.readTimeouts().then(() => {
                    //are the values copied to DEFAULT_TIMEOUT_VALUES?
                    expect(svc.DEFAULT_TIMEOUT_VALUES).toEqual(jasmine.objectContaining(myConfiguredTimeouts));

                    //are specific values copied to
                    expect(svc.pageTimeout).toEqual(myConfiguredTimeouts["PageTimeout"]);
                    expect(svc.immediateTimeout).toEqual(myConfiguredTimeouts["ImmediateTimeout"]);
                    expect(svc.endlessTimeout).toEqual(myConfiguredTimeouts["EndlessTimeout"]);
                    expect(svc.messageTimeout).toEqual(myConfiguredTimeouts["MessageTimeout"]);
                    expect(svc.confirmationTimeout).toEqual(myConfiguredTimeouts["ConfirmationTimeout"]);
                    expect(svc.inputTimeout).toEqual(myConfiguredTimeouts["InputTimeout"]);
                    expect(svc.pinentryTimeout).toEqual(myConfiguredTimeouts["PinentryTimeout"]);
                    done();
                });
            });

            it("can read the general UImapping -- at the moment onCancelQuestionDefault, which will be copied to popup.oncancel", done => {
                const myConfiguration = {
                    onCancelQuestionDefault: false,
                    onTimeoutQuestionDefault: false
                };

                Wincor.UI.Service.Provider.ConfigService.getConfiguration = section => {
                    if (section.endsWith("\\Services\\UIMapping")) {
                        //* ConfigProxy::getConfiguration returns {"onCancelQuestionDefault":true}
                        return Promise.resolve(myConfiguration);
                    }
                    return Promise.reject();
                };

                const svc = new Svc();
                svc.readGeneralUIMapping().then(() => {
                    expect(svc.DEFAULT_VIEWKEY_VALUES.popup.oncancel).toEqual(myConfiguration["onCancelQuestionDefault"]);
                    expect(svc.DEFAULT_VIEWKEY_VALUES.popup.ontimeout).toEqual(myConfiguration["onTimeoutQuestionDefault"]);
                    done();
                });
            });

            it("can read the keywordMapping", done => {
                const myConfiguration = {
                    COMMON_DM_CUSTOMER_REQUEST_DATA: "&routingcode=[&CCTAFW_PROP_CARDHOLDER_BANKCODE;;&]&accountnum=[&CCTAFW_PROP_CARDHOLDER_ACCOUNT;;&]&cardseqnum=[&CCTAFW_PROP_CARDHOLDER_CARDSEQNO;;1&]",
                    COMMON_DM_REQUEST_DATA:
                        "&terminalid=[&CCSOPSRV_PROP_TERMINALID;;&]&resolution=[&GUIAPP_WINDOW_SIZE_X;;1024&]x[&GUIAPP_WINDOW_SIZE_Y;;768&]&channelid=1&vendor=[&GUIAPP_ACTIVE_VIEWSET;;default&]_[&GUIAPP_ACTIVE_STYLE;;default&]_[&GUIAPP_ACTIVE_VENDOR;;WN&]&media=1&lang=[&CCTAFW_PROP_LANGUAGE_ISO;#PIC=XX~~~;en&]",
                    DM_LOCAL: "dmurl=../viewmodels/designtimedata/dm/SBJson/DMSBJSONData.json",
                    DM_SERVER: "dmurl=http://127.0.0.1:8080/dm/SBJson",
                    COMMON_HYBRID_REQUEST_DATA: "&style=mercury&viewset=[&GUIDM_ACTIVE_VIEW_SET;;touch&]&resolution=[&GUIAPP_WINDOW_SIZE_X;;1024&]x[&GUIAPP_WINDOW_SIZE_Y;;768&]",
                    HYBRID_LOCAL: "dataurl=../viewmodels/designtimedata/miniflow/billpaymentstart.json",
                    HYBRID_SERVER: "dataurl=http://127.0.0.1:8080/miniflow",
                    BASE_URL: "../../content_softkey/views",
                    BASE_URL_TOUCH: "../../content_touch/views"
                };

                Wincor.UI.Service.Provider.ConfigService.getConfiguration = section => {
                    if (section.endsWith("\\Services\\UIMapping\\KeywordMapping")) {
                        //* ConfigProxy::getConfiguration returns {"COMMON_DM_CUSTOMER_REQUEST_DATA":"&routingcode=[&CCTAFW_PROP_CARDHOLDER_BANKCODE;;&]&accountnum=[&CCTAFW_PROP_CARDHOLDER_ACCOUNT;;&]&cardseqnum=[&CCTAFW_PROP_CARDHOLDER_CARDSEQNO;;1&]","COMMON_DM_REQUEST_DATA":"&terminalid=[&CCSOPSRV_PROP_TERMINALID;;&]&resolution=[&GUIAPP_WINDOW_SIZE_X;;1024&]x[&GUIAPP_WINDOW_SIZE_Y;;768&]&channelid=1&vendor=[&GUIAPP_ACTIVE_VIEWSET;;default&]_[&GUIAPP_ACTIVE_STYLE;;default&]_[&GUIAPP_ACTIVE_VENDOR;;WN&]&media=1&lang=[&CCTAFW_PROP_LANGUAGE_ISO;#PIC=XX~~~;en&]","DM_LOCAL":"dmurl=../viewmodels/designtimedata/dm/SBJson/DMSBJSONData.json","DM_SERVER":"dmurl=http://127.0.0.1:8080/dm/SBJson","COMMON_HYBRID_REQUEST_DATA":"&style=mercury&viewset=[&GUIDM_ACTIVE_VIEW_SET;;touch&]&resolution=[&GUIAPP_WINDOW_SIZE_X;;1024&]x[&GUIAPP_WINDOW_SIZE_Y;;768&]","HYBRID_LOCAL":"dataurl=../viewmodels/designtimedata/miniflow/billpaymentstart.json","HYBRID_SERVER":"dataurl=http://127.0.0.1:8080/miniflow","BASE_URL":"../../content_softkey/views","BASE_URL_TOUCH":"../../content_touch/views"}
                        return Promise.resolve(myConfiguration);
                    }
                    return Promise.reject();
                };

                const svc = new Svc();
                svc.readKeywordMapping().then(() => {
                    expect(svc.KEYWORD_MAPPING).toEqual(myConfiguration);
                    done();
                }, done.fail);
            });

            it("can read the softkeyPositionsY", done => {
                const myConfiguration = {
                    FuncKeysPos: "0,34:0,49:0,63:0,78:100,34:100,49:100,63:100,78"
                };

                Wincor.UI.Service.Provider.ConfigService.getConfiguration = section => {
                    if (section.endsWith("\\ProInstall\\Wosassp")) {
                        return Promise.resolve(myConfiguration);
                    }
                    return Promise.reject();
                };

                const svc = new Svc();

                svc.readSoftkeyPositions().then(() => {
                    expect(svc.softkeyPositionsY).toEqual(jasmine.arrayContaining([34, 49, 63, 78]));
                    done();
                }, done.fail);
            });

            it("will fail if readViewKeys finds a missing template viewkey", done => {
                const myNormal = {
                    AccountNumberInput: "(#IdInput#)"
                };

                Wincor.UI.Service.Provider.ConfigService.getConfiguration = section => {
                    if (section.endsWith("myViewSet")) {
                        //* ConfigProxy::getConfiguration returns {"AmountInputDecimal":{"config":{"decimal":"true","minAmount":"[&CCTAFW_PROP_MIN_AMOUNT_ACT;;0&]","maxAmount":"[&CCTAFW_PROP_MAX_AMOUNT_ACT;;0&]","formatOption":"#M"},"timeout":"(#InputTimeout#)","url":"amountentry.html"},"AmountInputNoDecimal":{"config":{"decimal":"false","minAmount":"[&CCTAFW_PROP_MIN_AMOUNT_ACT;;0&]","maxAmount":"[&CCTAFW_PROP_MAX_AMOUNT_ACT;;0&]","formatOption":"#M"},"timeout":"(#InputTimeout#)","url":"amountentry.html"},"AmountSelection":{"timeout":"(#InputTimeout#)","url":"amountselection.html","priorities":{"order":["OTHER"],"staticpos":["OTHER=8","BACK=4"],"prominent":["OTHER=prominentItem"]}},"IdInput":{"config":{"allowLeadingZero":"false","minLen":"1","maxLen":"13"},"timeout":"(#InputTimeout#)","url":"numericentry.html","privateInput":"true"},"Message":{"commandconfig":{"CANCEL":"3"},"popup":{"ontimeout":"false"},"url":"message.html","resultMapping":{"2":"0"}},"MessageAsync":{"commandconfig":{"CONFIRM":"3","CANCEL":"3"},"timeout":"(#EndlessTimeout#)","popup":{"ontimeout":"false"},"url":"message.html"},"NumericInput":{"config":{"placeholder":"0","minLen":"1","maxLen":"18"},"timeout":"(#InputTimeout#)","url":"numericentry.html"},"PhoneNumberInput":{"config":{"placeholder":"004915123456","allowLeadingZero":"true","minLen":"8","maxLen":"18"},"timeout":"(#InputTimeout#)","url":"numericentry.html"},"PinInput":{"commandconfig":{"CANCEL":"VAR_CARDEJECT_VIEWSTATE_S;0"},"timeout":"(#PinentryTimeout#)","popup":{"ontimeout":"false"},"url":"pinentry[&CCTAFW_PROP_ETS_LAYOUT;;&].html"},"PrinterAnimations":{"commandconfig":{"CANCEL":"3"},"timeout":"(#EndlessTimeout#)","url":"printeranimations.html"},"Question":{"timeout":"(#InputTimeout#)","url":"question.html"},"QuestionOther":{"commandconfig":{"OTHER":"0"},"timeout":"(#InputTimeout#)","url":"question.html"},"Selection":{"timeout":"(#InputTimeout#)","url":"selection.html","priorities":{"staticpos":["OTHER=8"],"prominent":["OTHER=prominentItem"]}},"Wait":{"timeout":"(#EndlessTimeout#)","popup":{"ontimeout":"false"},"url":"pleasewait.html"},"WaitSpin":{"timeout":"(#EndlessTimeout#)","popup":{"ontimeout":"false","waitspinner":"true"},"url":"pleasewait.html"},"WithdrawalAmountInput":{"commandconfig":{"MIXTURE":"[&VAR_MIXTURE_SELECTION_VIEWSTATE_S;;3&]"},"config":{"decimal":"[&CCTAFW_PROP_WITHDRAWAL_AMOUNT_INPUT_DECIMALS;;true&]","minAmount":"[&CCTAFW_PROP_MIN_AMOUNT_ACT;;0&]","maxAmount":"[&CCTAFW_PROP_MAX_AMOUNT_ACT;;0&]","formatOption":"#M"},"timeout":"(#InputTimeout#)","url":"amountentry.html"}}
                        return Promise.resolve(myNormal);
                    }
                    return Promise.reject();
                };

                const svc = new Svc();

                svc.readViewKeys("myViewSet").then(done.fail, message => {
                    expect(message).toEqual("viewKey configuration not available for viewSetName=myViewSet"); //maybe a check for typeOf(String) of message would be enough
                    console.debug(message);
                    done(); //expect it to fail
                });
            });

            it("will succeed if readViewKeys finds a the template viewkey", done => {
                const myTemplateViewkeys = {
                    IdInput: {
                        config: { allowLeadingZero: "false", minLen: "1", maxLen: "13" },
                        timeout: "(#InputTimeout#)",
                        url: "numericentry.html",
                        privateInput: "true"
                    }
                };
    
                const myNormal = {
                    AccountNumberInput: "(#IdInput#)"
                };

                Wincor.UI.Service.Provider.ConfigService.getConfiguration = section => {
                    if (section.endsWith("myViewSet")) {
                        //* ConfigProxy::getConfiguration returns {"AmountInputDecimal":{"config":{"decimal":"true","minAmount":"[&CCTAFW_PROP_MIN_AMOUNT_ACT;;0&]","maxAmount":"[&CCTAFW_PROP_MAX_AMOUNT_ACT;;0&]","formatOption":"#M"},"timeout":"(#InputTimeout#)","url":"amountentry.html"},"AmountInputNoDecimal":{"config":{"decimal":"false","minAmount":"[&CCTAFW_PROP_MIN_AMOUNT_ACT;;0&]","maxAmount":"[&CCTAFW_PROP_MAX_AMOUNT_ACT;;0&]","formatOption":"#M"},"timeout":"(#InputTimeout#)","url":"amountentry.html"},"AmountSelection":{"timeout":"(#InputTimeout#)","url":"amountselection.html","priorities":{"order":["OTHER"],"staticpos":["OTHER=8","BACK=4"],"prominent":["OTHER=prominentItem"]}},"IdInput":{"config":{"allowLeadingZero":"false","minLen":"1","maxLen":"13"},"timeout":"(#InputTimeout#)","url":"numericentry.html","privateInput":"true"},"Message":{"commandconfig":{"CANCEL":"3"},"popup":{"ontimeout":"false"},"url":"message.html","resultMapping":{"2":"0"}},"MessageAsync":{"commandconfig":{"CONFIRM":"3","CANCEL":"3"},"timeout":"(#EndlessTimeout#)","popup":{"ontimeout":"false"},"url":"message.html"},"NumericInput":{"config":{"placeholder":"0","minLen":"1","maxLen":"18"},"timeout":"(#InputTimeout#)","url":"numericentry.html"},"PhoneNumberInput":{"config":{"placeholder":"004915123456","allowLeadingZero":"true","minLen":"8","maxLen":"18"},"timeout":"(#InputTimeout#)","url":"numericentry.html"},"PinInput":{"commandconfig":{"CANCEL":"VAR_CARDEJECT_VIEWSTATE_S;0"},"timeout":"(#PinentryTimeout#)","popup":{"ontimeout":"false"},"url":"pinentry[&CCTAFW_PROP_ETS_LAYOUT;;&].html"},"PrinterAnimations":{"commandconfig":{"CANCEL":"3"},"timeout":"(#EndlessTimeout#)","url":"printeranimations.html"},"Question":{"timeout":"(#InputTimeout#)","url":"question.html"},"QuestionOther":{"commandconfig":{"OTHER":"0"},"timeout":"(#InputTimeout#)","url":"question.html"},"Selection":{"timeout":"(#InputTimeout#)","url":"selection.html","priorities":{"staticpos":["OTHER=8"],"prominent":["OTHER=prominentItem"]}},"Wait":{"timeout":"(#EndlessTimeout#)","popup":{"ontimeout":"false"},"url":"pleasewait.html"},"WaitSpin":{"timeout":"(#EndlessTimeout#)","popup":{"ontimeout":"false","waitspinner":"true"},"url":"pleasewait.html"},"WithdrawalAmountInput":{"commandconfig":{"MIXTURE":"[&VAR_MIXTURE_SELECTION_VIEWSTATE_S;;3&]"},"config":{"decimal":"[&CCTAFW_PROP_WITHDRAWAL_AMOUNT_INPUT_DECIMALS;;true&]","minAmount":"[&CCTAFW_PROP_MIN_AMOUNT_ACT;;0&]","maxAmount":"[&CCTAFW_PROP_MAX_AMOUNT_ACT;;0&]","formatOption":"#M"},"timeout":"(#InputTimeout#)","url":"amountentry.html"}}
                        return Promise.resolve(myNormal);
                    } else if (section.endsWith("myViewSet\\Defaults")) {
                        return Promise.resolve(myTemplateViewkeys);
                    }
                    return Promise.reject();
                };

                const svc = new Svc();

                svc.readViewKeyTemplates("myViewSet")
                    .then(() => {
                        svc.readViewKeys("myViewSet").then(() => {
                            expect(svc.TEMPLATE_VIEWKEYS["IdInput"]).toBeDefined();
                            expect(svc.urlMapping["AccountNumberInput"]).toBeDefined();
                            expect(svc.urlMapping["AccountNumberInput"]["url"]).toEqual("numericentry.html");
                            expect(svc.urlMapping["NotThere"]).not.toBeDefined();
                            done();
                        }, done.fail);
                    })
                    .catch(done.fail);
            });
    
            it("readViewKeys fail if UIMapping mandatory attr 'url' is missing", done => {
                const myTemplateViewkeys = {
                    IdInput: {
                        config: {
                            allowLeadingZero: "false",
                            minLen: "1",
                            maxLen: "13"
                        },
                        timeout: "(#InputTimeout#)",
                        privateInput: "true"
                        // missing url attr !!!
                    }
                };
        
                const myNormal = {
                    AccountNumberInput: "(#IdInput#)"
                };
        
                Wincor.UI.Service.Provider.ConfigService.getConfiguration = section => {
                    if (section.endsWith("myViewSet")) {
                        return Promise.resolve(myNormal);
                    } else if (section.endsWith("myViewSet\\Defaults")) {
                        return Promise.resolve(myTemplateViewkeys);
                    }
                    return Promise.reject();
                };
        
                const svc = new Svc();
    
                svc.readViewKeyTemplates("myViewSet")
                    .then(() => {
                        svc.readViewKeys("myViewSet")
                            .then(() => {
                                done.fail();
                            })
                            .catch(e => {
                                expect(e.includes('missing or invalid, mandatory \'url\' attribute')).toBe(true);
                                done(); // false positive
                            });
                    })
                    .catch(done.fail);
            });
    
            it("readViewKeys fail if UIMapping mandatory attr 'url' is invalid", done => {
                const myTemplateViewkeys = {
                    IdInput: {
                        config: {
                            allowLeadingZero: "false",
                            minLen: "1",
                            maxLen: "13"
                        },
                        timeout: "(#InputTimeout#)",
                        url: "", // invalid due to no value !!!
                        privateInput: "true"
                    }
                };
        
                const myNormal = {
                    AccountNumberInput: "(#IdInput#)"
                };
        
                Wincor.UI.Service.Provider.ConfigService.getConfiguration = section => {
                    if (section.endsWith("myViewSet")) {
                        return Promise.resolve(myNormal);
                    } else if (section.endsWith("myViewSet\\Defaults")) {
                        return Promise.resolve(myTemplateViewkeys);
                    }
                    return Promise.reject();
                };
        
                const svc = new Svc();
        
                svc.readViewKeyTemplates("myViewSet")
                    .then(() => {
                        svc.readViewKeys("myViewSet")
                            .then(() => {
                                done.fail();
                            })
                            .catch(e => {
                                expect(e.includes('missing or invalid, mandatory \'url\' attribute')).toBe(true);
                                done(); // false positive
                            });
                    })
                    .catch(done.fail);
            });
    
            it("will succeed if readViewKeys finds a the template viewkey like Tooling 2.0 generates it", done => {
                const myTemplateViewkeys = {
                    IdInput: {
                        config: { allowLeadingZero: "false", minLen: "1", maxLen: "13" },
                        timeout: "(#InputTimeout#)",
                        url: "numericentry.html",
                        privateInput: "true"
                    }
                };
    
                const myNormal = {
                    AccountNumberInput: {
                        useTemplate: "IdInput"
                    }
                };

                Wincor.UI.Service.Provider.ConfigService.getConfiguration = section => {
                    if (section.endsWith("myViewSet")) {
                        //* ConfigProxy::getConfiguration returns {"AmountInputDecimal":{"config":{"decimal":"true","minAmount":"[&CCTAFW_PROP_MIN_AMOUNT_ACT;;0&]","maxAmount":"[&CCTAFW_PROP_MAX_AMOUNT_ACT;;0&]","formatOption":"#M"},"timeout":"(#InputTimeout#)","url":"amountentry.html"},"AmountInputNoDecimal":{"config":{"decimal":"false","minAmount":"[&CCTAFW_PROP_MIN_AMOUNT_ACT;;0&]","maxAmount":"[&CCTAFW_PROP_MAX_AMOUNT_ACT;;0&]","formatOption":"#M"},"timeout":"(#InputTimeout#)","url":"amountentry.html"},"AmountSelection":{"timeout":"(#InputTimeout#)","url":"amountselection.html","priorities":{"order":["OTHER"],"staticpos":["OTHER=8","BACK=4"],"prominent":["OTHER=prominentItem"]}},"IdInput":{"config":{"allowLeadingZero":"false","minLen":"1","maxLen":"13"},"timeout":"(#InputTimeout#)","url":"numericentry.html","privateInput":"true"},"Message":{"commandconfig":{"CANCEL":"3"},"popup":{"ontimeout":"false"},"url":"message.html","resultMapping":{"2":"0"}},"MessageAsync":{"commandconfig":{"CONFIRM":"3","CANCEL":"3"},"timeout":"(#EndlessTimeout#)","popup":{"ontimeout":"false"},"url":"message.html"},"NumericInput":{"config":{"placeholder":"0","minLen":"1","maxLen":"18"},"timeout":"(#InputTimeout#)","url":"numericentry.html"},"PhoneNumberInput":{"config":{"placeholder":"004915123456","allowLeadingZero":"true","minLen":"8","maxLen":"18"},"timeout":"(#InputTimeout#)","url":"numericentry.html"},"PinInput":{"commandconfig":{"CANCEL":"VAR_CARDEJECT_VIEWSTATE_S;0"},"timeout":"(#PinentryTimeout#)","popup":{"ontimeout":"false"},"url":"pinentry[&CCTAFW_PROP_ETS_LAYOUT;;&].html"},"PrinterAnimations":{"commandconfig":{"CANCEL":"3"},"timeout":"(#EndlessTimeout#)","url":"printeranimations.html"},"Question":{"timeout":"(#InputTimeout#)","url":"question.html"},"QuestionOther":{"commandconfig":{"OTHER":"0"},"timeout":"(#InputTimeout#)","url":"question.html"},"Selection":{"timeout":"(#InputTimeout#)","url":"selection.html","priorities":{"staticpos":["OTHER=8"],"prominent":["OTHER=prominentItem"]}},"Wait":{"timeout":"(#EndlessTimeout#)","popup":{"ontimeout":"false"},"url":"pleasewait.html"},"WaitSpin":{"timeout":"(#EndlessTimeout#)","popup":{"ontimeout":"false","waitspinner":"true"},"url":"pleasewait.html"},"WithdrawalAmountInput":{"commandconfig":{"MIXTURE":"[&VAR_MIXTURE_SELECTION_VIEWSTATE_S;;3&]"},"config":{"decimal":"[&CCTAFW_PROP_WITHDRAWAL_AMOUNT_INPUT_DECIMALS;;true&]","minAmount":"[&CCTAFW_PROP_MIN_AMOUNT_ACT;;0&]","maxAmount":"[&CCTAFW_PROP_MAX_AMOUNT_ACT;;0&]","formatOption":"#M"},"timeout":"(#InputTimeout#)","url":"amountentry.html"}}
                        return Promise.resolve(myNormal);
                    } else if (section.endsWith("myViewSet\\Defaults")) {
                        return Promise.resolve({});
                    } else if (section.endsWith("myViewSet\\Templates")) {
                        return Promise.resolve(myTemplateViewkeys);
                    }
                    return Promise.reject();
                };

                const svc = new Svc();

                svc.readViewKeyTemplates("myViewSet").then(() => {
                    svc.readViewKeys("myViewSet").then(() => {
                        expect(svc.TEMPLATE_VIEWKEYS["IdInput"]).toBeDefined();
                        expect(svc.urlMapping["AccountNumberInput"]).toBeDefined();
                        expect(svc.urlMapping["AccountNumberInput"]["url"]).toEqual("numericentry.html");
                        expect(svc.urlMapping["NotThere"]).not.toBeDefined();
                        //TODO we can also configure some timeout and checks the substitution, too
                        done();
                    }, done.fail);
                });
            });

            it("can read the template viewkeys (formerly know as default viewkeys)", done => {
                const myConfiguration = {
                    AmountInputDecimal: {
                        config: {
                            decimal: "true",
                            minAmount: "[&CCTAFW_PROP_MIN_AMOUNT_ACT;;0&]",
                            maxAmount: "[&CCTAFW_PROP_MAX_AMOUNT_ACT;;0&]",
                            formatOption: "#M"
                        },
                        timeout: "(#InputTimeout#)",
                        url: "amountentry.html"
                    },
                    AmountInputNoDecimal: {
                        config: {
                            decimal: "false",
                            minAmount: "[&CCTAFW_PROP_MIN_AMOUNT_ACT;;0&]",
                            maxAmount: "[&CCTAFW_PROP_MAX_AMOUNT_ACT;;0&]",
                            formatOption: "#M"
                        },
                        timeout: "(#InputTimeout#)",
                        url: "amountentry.html"
                    },
                    AmountSelection: {
                        timeout: "(#InputTimeout#)",
                        url: "amountselection.html",
                        priorities: {
                            order: ["OTHER"],
                            staticpos: ["OTHER=8", "BACK=4"],
                            prominent: ["OTHER=prominentItem"]
                        }
                    },
                    IdInput: {
                        config: { allowLeadingZero: "false", minLen: "1", maxLen: "13" },
                        timeout: "(#InputTimeout#)",
                        url: "numericentry.html",
                        privateInput: "true"
                    },
                    Message: {
                        commandconfig: { CANCEL: "3" },
                        popup: { ontimeout: "false" },
                        url: "message.html",
                        resultMapping: { 2: "0" }
                    },
                    MessageAsync: {
                        commandconfig: { CONFIRM: "3", CANCEL: "3" },
                        timeout: "(#EndlessTimeout#)",
                        popup: { ontimeout: "false" },
                        url: "message.html"
                    },
                    NumericInput: {
                        config: { placeholder: "0", minLen: "1", maxLen: "18" },
                        timeout: "(#InputTimeout#)",
                        url: "numericentry.html"
                    },
                    PhoneNumberInput: {
                        config: {
                            placeholder: "004915123456",
                            allowLeadingZero: "true",
                            minLen: "8",
                            maxLen: "18"
                        },
                        timeout: "(#InputTimeout#)",
                        url: "numericentry.html"
                    },
                    PinInput: {
                        commandconfig: { CANCEL: "VAR_CARDEJECT_VIEWSTATE_S;0" },
                        timeout: "(#PinentryTimeout#)",
                        popup: { ontimeout: "false" },
                        url: "pinentry[&CCTAFW_PROP_ETS_LAYOUT;;&].html"
                    },
                    PrinterAnimations: {
                        commandconfig: { CANCEL: "3" },
                        timeout: "(#EndlessTimeout#)",
                        url: "printeranimations.html"
                    },
                    Question: { timeout: "(#InputTimeout#)", url: "question.html" },
                    QuestionOther: {
                        commandconfig: { OTHER: "0" },
                        timeout: "(#InputTimeout#)",
                        url: "question.html"
                    },
                    Selection: {
                        timeout: "(#InputTimeout#)",
                        url: "selection.html",
                        priorities: {
                            staticpos: ["OTHER=8"],
                            prominent: ["OTHER=prominentItem"]
                        }
                    },
                    Wait: {
                        timeout: "(#EndlessTimeout#)",
                        popup: { ontimeout: "false" },
                        url: "pleasewait.html"
                    },
                    WaitSpin: {
                        timeout: "(#EndlessTimeout#)",
                        popup: { ontimeout: "false", waitspinner: "true" },
                        url: "pleasewait.html"
                    },
                    WithdrawalAmountInput: {
                        commandconfig: {
                            MIXTURE: "[&VAR_MIXTURE_SELECTION_VIEWSTATE_S;;3&]"
                        },
                        config: {
                            decimal: "[&CCTAFW_PROP_WITHDRAWAL_AMOUNT_INPUT_DECIMALS;;true&]",
                            minAmount: "[&CCTAFW_PROP_MIN_AMOUNT_ACT;;0&]",
                            maxAmount: "[&CCTAFW_PROP_MAX_AMOUNT_ACT;;0&]",
                            formatOption: "#M"
                        },
                        timeout: "(#InputTimeout#)",
                        url: "amountentry.html"
                    }
                };

                Wincor.UI.Service.Provider.ConfigService.getConfiguration = section => {
                    if (section.endsWith("\\Defaults")) {
                        //* ConfigProxy::getConfiguration returns {"AmountInputDecimal":{"config":{"decimal":"true","minAmount":"[&CCTAFW_PROP_MIN_AMOUNT_ACT;;0&]","maxAmount":"[&CCTAFW_PROP_MAX_AMOUNT_ACT;;0&]","formatOption":"#M"},"timeout":"(#InputTimeout#)","url":"amountentry.html"},"AmountInputNoDecimal":{"config":{"decimal":"false","minAmount":"[&CCTAFW_PROP_MIN_AMOUNT_ACT;;0&]","maxAmount":"[&CCTAFW_PROP_MAX_AMOUNT_ACT;;0&]","formatOption":"#M"},"timeout":"(#InputTimeout#)","url":"amountentry.html"},"AmountSelection":{"timeout":"(#InputTimeout#)","url":"amountselection.html","priorities":{"order":["OTHER"],"staticpos":["OTHER=8","BACK=4"],"prominent":["OTHER=prominentItem"]}},"IdInput":{"config":{"allowLeadingZero":"false","minLen":"1","maxLen":"13"},"timeout":"(#InputTimeout#)","url":"numericentry.html","privateInput":"true"},"Message":{"commandconfig":{"CANCEL":"3"},"popup":{"ontimeout":"false"},"url":"message.html","resultMapping":{"2":"0"}},"MessageAsync":{"commandconfig":{"CONFIRM":"3","CANCEL":"3"},"timeout":"(#EndlessTimeout#)","popup":{"ontimeout":"false"},"url":"message.html"},"NumericInput":{"config":{"placeholder":"0","minLen":"1","maxLen":"18"},"timeout":"(#InputTimeout#)","url":"numericentry.html"},"PhoneNumberInput":{"config":{"placeholder":"004915123456","allowLeadingZero":"true","minLen":"8","maxLen":"18"},"timeout":"(#InputTimeout#)","url":"numericentry.html"},"PinInput":{"commandconfig":{"CANCEL":"VAR_CARDEJECT_VIEWSTATE_S;0"},"timeout":"(#PinentryTimeout#)","popup":{"ontimeout":"false"},"url":"pinentry[&CCTAFW_PROP_ETS_LAYOUT;;&].html"},"PrinterAnimations":{"commandconfig":{"CANCEL":"3"},"timeout":"(#EndlessTimeout#)","url":"printeranimations.html"},"Question":{"timeout":"(#InputTimeout#)","url":"question.html"},"QuestionOther":{"commandconfig":{"OTHER":"0"},"timeout":"(#InputTimeout#)","url":"question.html"},"Selection":{"timeout":"(#InputTimeout#)","url":"selection.html","priorities":{"staticpos":["OTHER=8"],"prominent":["OTHER=prominentItem"]}},"Wait":{"timeout":"(#EndlessTimeout#)","popup":{"ontimeout":"false"},"url":"pleasewait.html"},"WaitSpin":{"timeout":"(#EndlessTimeout#)","popup":{"ontimeout":"false","waitspinner":"true"},"url":"pleasewait.html"},"WithdrawalAmountInput":{"commandconfig":{"MIXTURE":"[&VAR_MIXTURE_SELECTION_VIEWSTATE_S;;3&]"},"config":{"decimal":"[&CCTAFW_PROP_WITHDRAWAL_AMOUNT_INPUT_DECIMALS;;true&]","minAmount":"[&CCTAFW_PROP_MIN_AMOUNT_ACT;;0&]","maxAmount":"[&CCTAFW_PROP_MAX_AMOUNT_ACT;;0&]","formatOption":"#M"},"timeout":"(#InputTimeout#)","url":"amountentry.html"}}
                        return Promise.resolve(myConfiguration);
                    }
                    return Promise.reject();
                };

                const svc = new Svc();

                svc.readViewKeyTemplates("SoftKeyOrTouch").then(() => {
                    expect(svc.TEMPLATE_VIEWKEYS).toEqual(jasmine.objectContaining(myConfiguration));
                    done();
                }, done.fail);
            });

            it("corrects basic values", done => {
                const svc = new Svc();
                let result = svc.correctValue("Hallo");
                expect(result).toBe("Hallo");

                result = svc.correctValue("true");
                expect(result).toBe(true);
                result = svc.correctValue("false");
                expect(result).toBe(false);

                result = svc.correctValue("0");
                expect(result).toBe(0);
                result = svc.correctValue("1");
                expect(result).toBe(1);

                result = svc.correctValue("123");
                expect(result).toBe(123);

                result = svc.correctValue("0123");
                expect(result).toBe("0123");
                result = svc.correctValue("00");
                expect(result).toBe("00");

                result = svc.correctValue("(#NOT_THERE#)");
                expect(result).toBe("(#NOT_THERE#)");

                result = svc.correctValue("truefalse");
                expect(result).toBe("truefalse");

                done();
            });

            it("corrects timeout values", done => {
                const svc = new Svc();
                svc.DEFAULT_TIMEOUT_VALUES = {
                    TIME_A: 123456, //in real-life the values are int, just as here...
                    TIME_B: "NotAnInt",
                    TIME_C: "true",
                    TIME_D: "789" //...and not like here (just look for the trace, which contains "[...] default timeouts =[...]" )
                };
                let result = svc.correctValue("(#TIME_A#)");
                expect(result).toBe(123456);

                result = svc.correctValue("(#TIME_B#)");
                expect(result).toBe("NotAnInt");

                result = svc.correctValue("(#TIME_C#)");
                expect(result).toBe("true");

                result = svc.correctValue("(#TIME_D#)");
                expect(result).toBe("789");

                done();
            });

            it("corrects the keyword mapping", done => {
                const svc = new Svc();
                svc.KEYWORD_MAPPING = {
                    NUMBEr: "123456",
                    B: "NotAnInt",
                    C: "true",
                    SOMETIMESTRING: "123456",
                    SOMETIMESTRING_B: "0123456",
                    SOMETIMESTRING_C: "0",
                    SOMETIMESTRING_D: "1",
                    SOMETIMESTRING_E: "2"
                };
                let result = svc.correctValue("(#NUMBEr#)");
                expect(result).toBe(123456);

                result = svc.correctValue("(#B#)");
                expect(result).toBe("NotAnInt");

                result = svc.correctValue("(#C#)");
                expect(result).toBe(true);

                result = svc.correctValue("(#SOMETIMESTRING#)");
                expect(result).toBe(123456);

                result = svc.correctValue("(#SOMETIMESTRING_B#)");
                expect(result).toBe("0123456");

                result = svc.correctValue("(#SOMETIMESTRING_C#)");
                expect(result).toBe(0);

                result = svc.correctValue("(#SOMETIMESTRING_C#)(#SOMETIMESTRING_D#)");
                expect(result).toBe("01");

                result = svc.correctValue("(#SOMETIMESTRING_D#)(#SOMETIMESTRING_E#)");
                expect(result).toBe(12);

                result = svc.correctValue("(#SOMETIMESTRING_C#) ");
                expect(result).toBe("0 ");

                result = svc.correctValue("(#SOMETIMESTRING_D#) ");
                expect(result).toBe(1);

                result = svc.correctValue("(#SOMETIMESTRING_D#) 0");
                expect(result).toBe("1 0");

                done();
            });
            /*

                     Windows Registry Editor Version 5.00

                     [HKEY_LOCAL_MACHINE\SOFTWARE\Wincor Nixdorf\ProTopas\CurrentVersion\CCOPEN\GUI\GUIDM\Services\UIMapping]
                     "onCancelQuestionDefault"="false"

                     [HKEY_LOCAL_MACHINE\SOFTWARE\Wincor Nixdorf\ProTopas\CurrentVersion\CCOPEN\GUI\GUIDM\Services\UIMapping\KeywordMapping]
                     "BASE_URL"="../../content_softkey/views"
                     "BASE_URL_TOUCH"="../../content_touch/views"
                     "COMMON_DM_CUSTOMER_REQUEST_DATA"="&routingcode=[&CCTAFW_PROP_CARDHOLDER_BANKCODE;;&]&accountnum=[&CCTAFW_PROP_CARDHOLDER_ACCOUNT;;&]&cardseqnum=[&CCTAFW_PROP_CARDHOLDER_CARDSEQNO;;1&]"
                     "COMMON_DM_REQUEST_DATA"="&terminalid=[&CCSOPSRV_PROP_TERMINALID;;&]&resolution=[&GUIAPP_WINDOW_SIZE_X;;1024&]x[&GUIAPP_WINDOW_SIZE_Y;;768&]&channelid=1&vendor=[&GUIAPP_ACTIVE_VIEWSET;;default&]_[&GUIAPP_ACTIVE_STYLE;;default&]_[&GUIAPP_ACTIVE_VENDOR;;WN&]&media=1&lang=[&CCTAFW_PROP_LANGUAGE_ISO;#PIC=XX~~~;en&]"
                     "DM_LOCAL"="dmurl=../viewmodels/designtimedata/dm/SBJson/DMSBJSONData.json"
                     "DM_SERVER"="dmurl=http://127.0.0.1:8080/dm/SBJson"
                     "COMMON_HYBRID_REQUEST_DATA"="&style=mercury&viewset=[&GUIDM_ACTIVE_VIEW_SET;;touch&]&resolution=[&GUIAPP_WINDOW_SIZE_X;;1024&]x[&GUIAPP_WINDOW_SIZE_Y;;768&]"
                     "HYBRID_LOCAL"="dataurl=../viewmodels/designtimedata/miniflow/billpaymentstart.json"
                     "HYBRID_SERVER"="dataurl=http://127.0.0.1:8080/miniflow"

                     [HKEY_LOCAL_MACHINE\SOFTWARE\Wincor Nixdorf\ProTopas\CurrentVersion\CCOPEN\GUI\GUIDM\Services\UIMapping\softkey]
                     "Index"="{ \"url\": \"(#BASE_URL#)/index.html\" }"
                     "DMHeaderOnTop"="{\"timeout\":\"(#EndlessTimeout#)\",\"url\":\"dmheaderontop.html?flowposition=outofservice(#COMMON_DM_REQUEST_DATA#)\"}"
                     "DMMultiPage"="{\"timeout\":\"(#EndlessTimeout#)\",\"url\":\"dmmultipage.html?flowposition=idleloop(#COMMON_DM_REQUEST_DATA#)\"}"
                     "DMPhoneNumberInput"="{\"timeout\":\"(#EndlessTimeout#)\",\"url\":\"dmsbjson.html?(#DM_LOCAL#)&flowposition=authorization(#COMMON_DM_REQUEST_DATA#)(#COMMON_DM_CUSTOMER_REQUEST_DATA#)\"}"

                     [HKEY_LOCAL_MACHINE\SOFTWARE\Wincor Nixdorf\ProTopas\CurrentVersion\CCOPEN\GUI\GUIDM\Services\UIMapping\touch]
                     "Index"="{ \"url\": \"(#BASE_URL_TOUCH#)/index.html\" }"
                     "DMHeaderOnTop"="{\"timeout\":\"(#EndlessTimeout#)\",\"url\":\"dmheaderontop.html?flowposition=outofservice(#COMMON_DM_REQUEST_DATA#)\"}"
                     "DMMultiPage"="{\"timeout\":\"(#EndlessTimeout#)\",\"url\":\"dmmultipage.html?flowposition=idleloop(#COMMON_DM_REQUEST_DATA#)\"}"
                     "DMPhoneNumberInput"="{\"timeout\":\"(#EndlessTimeout#)\",\"url\":\"dmsbjson.html?(#DM_LOCAL#)&flowposition=authorization(#COMMON_DM_REQUEST_DATA#)(#COMMON_DM_CUSTOMER_REQUEST_DATA#)\"}"
                     */

            it("corrects our standard keyword mapping", done => {
                const svc = new Svc();
                svc.KEYWORD_MAPPING = {
                    COMMON_DM_CUSTOMER_REQUEST_DATA: "&routingcode=[&CCTAFW_PROP_CARDHOLDER_BANKCODE;;&]&accountnum=[&CCTAFW_PROP_CARDHOLDER_ACCOUNT;;&]&cardseqnum=[&CCTAFW_PROP_CARDHOLDER_CARDSEQNO;;1&]",
                    COMMON_DM_REQUEST_DATA:
                        "&terminalid=[&CCSOPSRV_PROP_TERMINALID;;&]&resolution=[&GUIAPP_WINDOW_SIZE_X;;1024&]x[&GUIAPP_WINDOW_SIZE_Y;;768&]&channelid=1&vendor=[&GUIAPP_ACTIVE_VIEWSET;;default&]_[&GUIAPP_ACTIVE_STYLE;;default&]_[&GUIAPP_ACTIVE_VENDOR;;WN&]&media=1&lang=[&CCTAFW_PROP_LANGUAGE_ISO;#PIC=XX~~~;en&]",
                    DM_LOCAL: "dmurl=../viewmodels/designtimedata/dm/SBJson/DMSBJSONData.json",
                    DM_SERVER: "dmurl=http://127.0.0.1:8080/dm/SBJson",
                    COMMON_HYBRID_REQUEST_DATA: "&style=mercury&viewset=[&GUIDM_ACTIVE_VIEW_SET;;touch&]&resolution=[&GUIAPP_WINDOW_SIZE_X;;1024&]x[&GUIAPP_WINDOW_SIZE_Y;;768&]",
                    HYBRID_LOCAL: "dataurl=../viewmodels/designtimedata/miniflow/billpaymentstart.json",
                    HYBRID_SERVER: "dataurl=http://127.0.0.1:8080/miniflow",
                    BASE_URL: "../../content_softkey/views",
                    BASE_URL_TOUCH: "../../content_touch/views"
                };
    
                const DMPhoneNumberInput_url = "dmsbjson.html?(#DM_LOCAL#)&flowposition=authorization(#COMMON_DM_REQUEST_DATA#)(#COMMON_DM_CUSTOMER_REQUEST_DATA#)";
                let result = svc.correctValue(DMPhoneNumberInput_url);
                expect(result).toBe(
                    "dmsbjson.html?dmurl=../viewmodels/designtimedata/dm/SBJson/DMSBJSONData.json&flowposition=authorization&terminalid=[&CCSOPSRV_PROP_TERMINALID;;&]&resolution=[&GUIAPP_WINDOW_SIZE_X;;1024&]x[&GUIAPP_WINDOW_SIZE_Y;;768&]&channelid=1&vendor=[&GUIAPP_ACTIVE_VIEWSET;;default&]_[&GUIAPP_ACTIVE_STYLE;;default&]_[&GUIAPP_ACTIVE_VENDOR;;WN&]&media=1&lang=[&CCTAFW_PROP_LANGUAGE_ISO;#PIC=XX~~~;en&]&routingcode=[&CCTAFW_PROP_CARDHOLDER_BANKCODE;;&]&accountnum=[&CCTAFW_PROP_CARDHOLDER_ACCOUNT;;&]&cardseqnum=[&CCTAFW_PROP_CARDHOLDER_CARDSEQNO;;1&]"
                );
    
                const Index_url = "(#BASE_URL#)/index.html";
                result = svc.correctValue(Index_url);
                expect(result).toBe("../../content_softkey/views/index.html");
                done();
            });

            it("corrects no nested keywords-in-keywords (this was never used)", done => {
                const svc = new Svc();
                svc.KEYWORD_MAPPING = {
                    KEYWORD: "Value of (#OTHER_KEYWORD#)",
                    OTHER_KEYWORD: "Value of other"
                };
    
                const result = svc.correctValue("I use (#KEYWORD#)");
                expect(result).toBe("I use Value of (#OTHER_KEYWORD#)");

                done();
            });

            it("does not correct nested timeouts-in-keywords (this was never used)", done => {
                const svc = new Svc();

                svc.KEYWORD_MAPPING = {
                    KEYWORD: "Value of (#TIME_A#)",
                    OTHER_KEYWORD: "Value of other"
                };

                svc.DEFAULT_TIMEOUT_VALUES = {
                    TIME_A: 123456 //in real-life the values are int
                };
    
                const result = svc.correctValue("I use (#KEYWORD#) and (#OTHER_KEYWORD#)");
                expect(result).toBe("I use Value of (#TIME_A#) and Value of other");

                done();
            });

            it("corrects not correctly chain of keyword and timeout (was never used)", done => {
                const svc = new Svc();
                svc.KEYWORD_MAPPING = {
                    KEYWORD: "Value of (#TIME_A#)",
                    OTHER_KEYWORD: "Value of other"
                };

                svc.DEFAULT_TIMEOUT_VALUES = {
                    TIME_A: 123456 //in real-life the values are int
                };
    
                const result = svc.correctValue("I use (#OTHER_KEYWORD#) and a timeout (#TIME_A#) and (#OTHER_KEYWORD#)");
                expect(result).toBe(123456); //that's true today, correctValue returns immediately as soon as it encounters a configured timeout and it returns _only_ the timeout's value

                done();
            });
        });

        /*********************************************************************************************************/
        describe("communication with business logic", () => {
            it("translates response to RC", done => {
                // done is used for async behavior
                // require service. All dependencies are mocked by "beforeEach" above
                const svc = new Svc();
                const MSG = {
                    fake: "property",
                    RC: 1234
                };
                // ViewService does not implement translateResponse, but uses base
                spyOn(svc, "translateResponse");
                svc.translateResponse(MSG);
                expect(svc.translateResponse).toBe(svc.translateResponse);
                expect(svc.translateResponse).toHaveBeenCalledTimes(1);
                done();
            });
        });
    
        /*********************************************************************************************************/
        describe("public functions", () => {
            it("can getLocation from self and other instances", done => {
                const GUI_INSTANCE = "GUITEST";
                const GUI_OTHER_INSTANCE = "GUIOTHER";
                const FUNC_CONTAINER_GET_LOCATION = 4034;
                const svc = new Svc();
                Wincor.UI.Service.Provider.ConfigService.configuration.instanceName = GUI_INSTANCE;
                spyOn(svc, "FrmResolve").and.callThrough();
                const p1 = svc.getLocation();
                const p2 = svc.getLocation(GUI_OTHER_INSTANCE);
                Wincor.UI.Promise.all([p1, p2]).then((res1, res2) => {
                    expect(svc.FrmResolve).toHaveBeenCalledTimes(2);
                    expect(svc.FrmResolve.calls.first().args[0]).toEqual(
                        jasmine.objectContaining({
                            FWName: GUI_INSTANCE,
                            FWFuncID: FUNC_CONTAINER_GET_LOCATION,
                            param1: -1,
                            meta1: ["LONG", 0],
                            param2: -1,
                            meta2: ["LONG", 0],
                            param3: -1,
                            meta3: ["LONG", 0],
                            param4: -1,
                            meta4: ["LONG", 0],
                            param5: -1,
                            meta5: ["NULL", 0],
                            paramUL: 0
                        })
                    );
                    done();
                }, done.fail);
            });
    
            it("can swap instance locations", done => {
                const GUI_INSTANCE = "GUITEST";
                const GUI_TARGET_INSTANCE = "GUITARGET";
                const FUNC_CONTAINER_SWAP_LOCATION = 4035;
                Wincor.UI.Service.Provider.ConfigService.configuration.instanceName = GUI_INSTANCE;
                const viewSvc = new Svc();
                spyOn(viewSvc, "getLocation").and.callFake(() => {
                    return Wincor.UI.Promise.resolve({
                        top: 0,
                        left: 0,
                        width: 1024,
                        height: 768
                    });
                });
                spyOn(viewSvc, "FrmResolve").and.callThrough();
        
                expect(typeof viewSvc.swapLocation).toBe("function");
                const ret = viewSvc.swapLocation(GUI_TARGET_INSTANCE);
                expect(ret.then !== void 0).toBe(true);
                ret
                    .then(() => {
                        expect(viewSvc.FrmResolve).toHaveBeenCalledTimes(1);
                        expect(viewSvc.FrmResolve.calls.first().args[0]).toEqual(
                            jasmine.objectContaining({
                                FWName: GUI_INSTANCE,
                                FWFuncID: FUNC_CONTAINER_SWAP_LOCATION,
                                param1: GUI_TARGET_INSTANCE,
                                meta1: ["CHAR_ANSI", -1],
                                param2: "",
                                meta2: ["NULL", 0],
                                param3: "",
                                meta3: ["NULL", 0],
                                param4: "",
                                meta4: ["NULL", 0],
                                param5: "",
                                meta5: ["NULL", 0],
                                paramUL: 0
                            })
                        );
                        done();
                    })
                    .catch(done.fail);
            });
    
            it("can bringToFront the instance", done => {
                // done is used for async behavior
                // require service. All dependencies are mocked by "beforeEach" above
                const GUI_INSTANCE = "GUITEST";
                const FUNC_CONTAINER_BRING_TO_FRONT = 4027;
                Wincor.UI.Content.applicationMode = true;
                Wincor.UI.Service.Provider.ConfigService.configuration.instanceName = GUI_INSTANCE;
                const svc = new Svc();
        
                spyOn(svc, "FrmResolve");
        
                svc.bringToFront(() => {
                });
                expect(svc.FrmResolve).toHaveBeenCalledTimes(1);
                expect(svc.FrmResolve.calls.first().args[0]).toEqual(
                    jasmine.objectContaining({
                        FWName: GUI_INSTANCE,
                        FWFuncID: FUNC_CONTAINER_BRING_TO_FRONT,
                        meta1: ["NULL", 0],
                        param2: "",
                        meta2: ["NULL", 0],
                        param3: "",
                        meta3: ["NULL", 0],
                        param4: "",
                        meta4: ["NULL", 0],
                        param5: "",
                        meta5: ["NULL", 0],
                        paramUL: 0
                    })
                );
                done();
            });
    
            it("can suspend and resume", done => {
                // require service. All dependencies are mocked by "beforeEach" above
                const GUI_INSTANCE = "GUITEST";
                Wincor.UI.Content.applicationMode = true;
                Wincor.UI.Service.Provider.ConfigService.configuration.instanceName = GUI_INSTANCE;
                const svc = new Svc();
        
                svc.fireServiceEvent = jasmine.createSpy("fireServiceEvent");
                svc.clearTimeout = jasmine.createSpy("clearTimeout");
                svc.refreshTimeout = jasmine.createSpy("refreshTimeout");
                let s1 = svc.suspend();
                expect(s1).toBe(-1);
                expect(svc.fireServiceEvent).not.toHaveBeenCalled();
        
                // now we simulate content is running
                svc.contentRunning = true;
                s1 = svc.suspend();
                expect(s1).toBe(1);
                expect(svc.fireServiceEvent).toHaveBeenCalledWith("SUSPEND");
                expect(svc.refreshTimeout).not.toHaveBeenCalled();
                expect(svc.clearTimeout).toHaveBeenCalled();
                expect(svc.isSuspended).toBe(true);
                expect(svc.suspendId).toBe(s1);
                expect(svc.suspendList).toEqual([s1]);
                svc.fireServiceEvent.calls.reset();
                svc.clearTimeout.calls.reset();
                const s2 = svc.suspend();
                expect(svc.fireServiceEvent).not.toHaveBeenCalled();
                expect(svc.refreshTimeout).not.toHaveBeenCalled();
                expect(svc.clearTimeout).not.toHaveBeenCalled();
                expect(svc.isSuspended).toBe(true);
                expect(svc.suspendId).toBe(s2);
                expect(svc.suspendList).toEqual([s1, s2]);
        
                // now resume
                svc.resume(s1);
                expect(svc.fireServiceEvent).not.toHaveBeenCalled();
                expect(svc.clearTimeout).not.toHaveBeenCalled();
                expect(svc.refreshTimeout).not.toHaveBeenCalled();
                expect(svc.isSuspended).toBe(true);
                expect(svc.suspendId).toBe(s2);
                expect(svc.suspendList).toEqual([s2]);
        
                svc.resume(s2);
                expect(svc.fireServiceEvent).toHaveBeenCalledWith("RESUME");
                expect(svc.refreshTimeout).toHaveBeenCalledTimes(1);
                expect(svc.isSuspended).toBe(false);
                expect(svc.suspendId).toBe(s2);
                expect(svc.suspendList).toEqual([]);
        
                done();
            });
    
            it("can have an empty template test", done => {
                //const svc = new Svc();
                //..
                console.debug("template");
                done();
            });
    
            it("resets the loadingViewSet flag after a successful loadViewSet", done => {
                Wincor.UI.Service.Provider.ConfigService.getConfiguration = () => {
                    return Promise.resolve({});
                };
    
                const svc = new Svc();
    
                svc.readViewKeys = viewsetname => {
                    console.debug(`*** viewsetname = '${viewsetname}'`);
                    return Promise.resolve({});
                };

                spyOn(svc, "loadViewSet").and.callThrough();
        
                //Now let's check if the property "svc.loadingViewSet" was setted two times. Object.defineProperty does the trick:
                let backing = false; //backing value for the setter function, which "replaces" loadingViewSet
                const func = jasmine.createSpy("MySetter").and.callFake(val => {
                    backing = val;
                });
                Object.defineProperty(svc, "loadingViewSet", {
                    set: func,
                    get: () => backing
                });
        
                expect(svc.loadingViewSet).toBe(false);
        
                svc.loadViewSet("SomeViewset")
                   .then(() => {
                       expect(func).toHaveBeenCalledTimes(2);
                       expect(func.calls.argsFor(0)).toEqual([true]);
                       expect(func.calls.argsFor(1)).toEqual([false]);
                       expect(svc.loadViewSet).toHaveBeenCalledTimes(1);
                       expect(svc.loadingViewSet).toBe(false);
                       done();
                   })
                   .catch(done.fail);
            });
    
            it("resets the loadingViewSet flag after a failed loadViewSet", done => {
                console.debug(`+-+-+- resets the loadingViewSet flag after a failed loadViewSet`);
        
                Wincor.UI.Service.Provider.ConfigService.getConfiguration = () => {
                    return Promise.reject("Rejected due to testing");
                };
    
                const svc = new Svc();

                svc.readViewKeys = viewsetname => {
                    console.debug(`*** viewsetname = '${viewsetname}'`);
                    return Promise.resolve({});
                };

                svc.viewSetName = "OldName";
        
                spyOn(svc, "loadViewSet").and.callThrough();
        
                expect(svc.loadingViewSet).toBe(false);
        
                svc.loadViewSet("NewName")
                   .then(done.fail)
                   .catch(() => {
                       expect(svc.loadViewSet).toHaveBeenCalledTimes(2);
                       expect(svc.loadingViewSet).toBe(false);
                       done();
                   });
            });
    
            it("loads the initial viewset if viewset is empty", done => {
                console.debug(`+-+-+- resets the loadingViewSet flag after a failed loadViewSet`);
        
                Wincor.UI.Service.Provider.ConfigService.getConfiguration = () => {
                    return Promise.resolve({});
                };
    
                const svc = new Svc();
    
                svc.readViewKeys = viewsetname => {
                    console.debug(`*** viewsetname = '${viewsetname}'`);
                    return Promise.resolve({});
                };
        
        
                svc.viewSetName = "OldName"; //does not matter here
                svc.initialViewSet = "softkey";
        
                spyOn(svc, "loadViewSet").and.callThrough();
        
                svc.loadViewSet("")
                   .then(() => {
                       expect(svc.loadingViewSet).toBe(false);
                       expect(svc.loadViewSet).toHaveBeenCalledTimes(1);
                       expect(svc.viewSetName).toEqual(svc.initialViewSet); //that's it
                       done();
                   })
                   .catch(done.fail);
            });
    
            it("reloads the current viewset if viewset is empty and initialViewSet, too (and empty viewset cannot be loaded)", done => {
                Wincor.UI.Service.Provider.ConfigService.getConfiguration = viewset => {
                    if (viewset.indexOf("OldName") !== -1) {
                        return Promise.resolve({});
                    } else {
                        return Promise.reject();
                    }
                };
        
                //see https://stackoverflow.com/questions/5337481/spying-on-jquery-selectors-in-jasmine
                //let's spy on jQuery.fn, which is the function table of jQuery. This means jQuery("blah").fadeOut in the ViewService will return
                //the function from the function table and that's exactly what we are going to fake.
                spyOn(window.jQuery.fn, "fadeOut").and.callFake(obj => {
                    expect(typeof obj.complete).toBe("function");
                    //obj.complete();
                    expect(obj.complete).not.toThrow(); //calls obj.complete() as well
                });
    
                const svc = new Svc();
                spyOn(svc, "readViewKeys").and.returnValue(Promise.resolve({}));
                spyOn(svc.serviceProvider, "propagateError");
                jasmine.clock().install();
                spyOn(svc, "registerForServiceEvent").and.callFake((evt, cb) => {
                    expect(evt === svc.SERVICE_EVENTS.VIEW_ACTIVATED).toBe(true);
                    cb();
                    jasmine.clock().tick(255);
                });
                
                svc.viewSetName = "OldName";
                const oldName = svc.viewSetName;
                svc.initialViewSet = "";
        
                spyOn(svc, "loadViewSet").and.callThrough();
                spyOn(svc, "startSPA"); // let's fake it, because startSPA uses jQuery functions, which will not work and the test will fail.
        
                svc.loadViewSet("")
                   .then(done.fail)
                   .catch(() => {
                       expect(svc.loadingViewSet).toBe(false);
                       expect(svc.loadViewSet).toHaveBeenCalledTimes(2);
                       expect(svc.viewSetName).toEqual(oldName); //that's it
                       done(); // false positive
                       jasmine.clock().uninstall();
                   });
            });
    
            /*
               [HKEY_LOCAL_MACHINE\SOFTWARE\Wincor Nixdorf\ProTopas\CurrentVersion\CCOPEN\GUI\GUIAPP\Services\UIMapping\softkey]
               "AccountDetailedSelection"="{\"commandconfig\":{\"CONFIRM\":\"3\"},\"timeout\":\"(#InputTimeout#)\",\"url\":\"question.html\"}"
               "AccountNoAccountAvailableInfo"="(#Message#)"
               "AccountNumberInput"="(#IdInput#)"
               "AccountOnlyOneAccountAvailableInfo"="(#Message#)"
  
               [HKEY_LOCAL_MACHINE\SOFTWARE\Wincor Nixdorf\ProTopas\CurrentVersion\CCOPEN\GUI\GUIAPP\Services\UIMapping\softkey\Defaults]
               "AmountInputDecimal"="{\"config\":{\"decimal\":\"true\",\"minAmount\":\"[&CCTAFW_PROP_MIN_AMOUNT_ACT;;0&]\",\"maxAmount\":\"[&CCTAFW_PROP_MAX_AMOUNT_ACT;;0&]\",\"formatOption\":\"#M\"},\"timeout\":\"(#InputTimeout#)\",\"url\":\"amountentry.html\"}"
               "AmountInputNoDecimal"="{\"config\":{\"decimal\":\"false\",\"minAmount\":\"[&CCTAFW_PROP_MIN_AMOUNT_ACT;;0&]\",\"maxAmount\":\"[&CCTAFW_PROP_MAX_AMOUNT_ACT;;0&]\",\"formatOption\":\"#M\"},\"timeout\":\"(#InputTimeout#)\",\"url\":\"amountentry.html\"}"
               "AmountSelection"="{\"timeout\":\"(#InputTimeout#)\",\"url\":\"amountselection.html\",\"priorities\":{\"order\":[\"OTHER\"],\"staticpos\":[\"OTHER=8\",\"BACK=4\"],\"prominent\":[\"OTHER=prominentItem\"]}}"
               "IdInput"="{\"config\":{\"allowLeadingZero\":\"false\",\"minLen\":\"1\",\"maxLen\":\"13\"},\"timeout\":\"(#InputTimeout#)\",\"url\":\"numericentry.html\",\"privateInput\":\"true\"}"
               "Message"="{\"commandconfig\":{\"CANCEL\":\"3\"},\"popup\":{\"ontimeout\":\"false\"},\"url\":\"message.html\",\"resultMapping\":{\"2\":\"0\"}}"
            */
            it("reads and and stores the viewkeys of a simple viewset", done => {
                const myDefault = {
                    AmountInputDecimal: {
                        config: {
                            decimal: "true",
                            minAmount: "[&CCTAFW_PROP_MIN_AMOUNT_ACT;;0&]",
                            maxAmount: "[&CCTAFW_PROP_MAX_AMOUNT_ACT;;0&]",
                            formatOption: "#M"
                        },
                        timeout: "(#InputTimeout#)",
                        url: "amountentry.html"
                    },
                    AmountInputNoDecimal: {
                        config: {
                            decimal: "false",
                            minAmount: "[&CCTAFW_PROP_MIN_AMOUNT_ACT;;0&]",
                            maxAmount: "[&CCTAFW_PROP_MAX_AMOUNT_ACT;;0&]",
                            formatOption: "#M"
                        },
                        timeout: "(#InputTimeout#)",
                        url: "amountentry.html"
                    },
                    AmountSelection: {
                        timeout: "(#InputTimeout#)",
                        url: "amountselection.html",
                        priorities: {
                            order: ["OTHER"],
                            staticpos: ["OTHER=8", "BACK=4"],
                            prominent: ["OTHER=prominentItem"]
                        }
                    },
                    IdInput: {
                        config: {
                            allowLeadingZero: "false",
                            minLen: "1",
                            maxLen: "13"
                        },
                        timeout: "(#InputTimeout#)",
                        url: "numericentry.html",
                        privateInput: "true"
                    },
                    Message: {
                        commandconfig: { CANCEL: "3" },
                        popup: { ontimeout: "false" },
                        url: "message.html",
                        resultMapping: { "2": "0" }
                    }
                };
                const myNormal = {
                    AccountDetailedSelection: {
                        commandconfig: { CONFIRM: "3" },
                        timeout: "(#InputTimeout#)",
                        url: "question.html"
                    },
                    AccountNoAccountAvailableInfo: "(#Message#)",
                    AccountNumberInput: "(#IdInput#)",
                    AccountOnlyOneAccountAvailableInfo: "(#Message#)"
                };
        
                Wincor.UI.Service.Provider.ConfigService.getConfiguration = viewset => {
                    if (viewset.endsWith("\\Services\\Style\\softkey")) {
                        return Promise.resolve({});
                    } else if (viewset.endsWith("\\Services\\UIMapping\\softkey\\Defaults")) {
                        return Promise.resolve(myDefault);
                    } else if (viewset.endsWith("\\Services\\UIMapping\\softkey")) {
                        return Promise.resolve(myNormal);
                    } else {
                        return Promise.reject();
                    }
                };
        
                const svc = new Svc();
        
                // spyOn(window.jQuery.fn, "fadeOut").and.callFake( (obj) => {
                //     expect(typeof (obj.complete) ).toBe("function");
                //     //obj.complete();
                //     expect(obj.complete).not.toThrow(); //calls obj.complete() as well
                // });
        
                svc.DEFAULT_TIMEOUT_VALUES = {
                    InputTimeout: 30000
                };
        
                //svc.DEFAULT_TIMEOUT_VALUES = Object.assign(svc.DEFAULT_TIMEOUT_VALUES, myDefault); //today this is stupid: the default viewkey values are stored in DEFAULT_TIMEOUT_VALUES
        
                //svc.readViewKeys("softkey")
                svc.loadViewSet("softkey").then(() => {
                    expect(svc.DEFAULT_TIMEOUT_VALUES["InputTimeout"]).toEqual(svc.DEFAULT_TIMEOUT_VALUES["InputTimeout"]);
            
                    expect(svc.urlMapping).toEqual(jasmine.any(Object));
            
                    expect(svc.urlMapping["AccountNoAccountAvailableInfo"]).toEqual(
                        jasmine.objectContaining({
                            commandconfig: { CANCEL: 3 },
                            //"popup":{"ontimeout":false}, //does not work here, because "popup" is enriched with other default values like oncancel etc. and here a deep-nested comparison is not made
                            url: "message.html",
                            resultMapping: { "2": 0 }
                        })
                    ); //hell, remember not just to copy the values, but take care of the data type, "false" -> false, "3" to 3 etc.
            
                    //does it contain the specific ontimeout value?
                    expect(svc.urlMapping["AccountNoAccountAvailableInfo"]["popup"]).toEqual(
                        jasmine.objectContaining({
                            ontimeout: false
                        })
                    );
            
                    ////does it contain the default popup values?
                    expect(svc.urlMapping["AccountNoAccountAvailableInfo"]["popup"]).toEqual(
                        jasmine.objectContaining({
                            oncancel: true,
                            beepontimeout: false,
                            beepontimeoutperiod: 0
                        })
                    );
            
                    //was #InputTimeout# replaced correctly?
                    expect(svc.urlMapping["AccountDetailedSelection"]["timeout"]).toEqual(svc.DEFAULT_TIMEOUT_VALUES["InputTimeout"]);
            
                    //are both viewkeys, which are based on message, equal?
                    expect(svc.urlMapping["AccountNoAccountAvailableInfo"]).toEqual(jasmine.objectContaining(svc.urlMapping["AccountOnlyOneAccountAvailableInfo"]));
                    expect(svc.urlMapping["AccountOnlyOneAccountAvailableInfo"]).toEqual(jasmine.objectContaining(svc.urlMapping["AccountNoAccountAvailableInfo"]));
            
                    //Now let's check if AccountNumberInput contains the stuff from IdInput
                    expect(svc.urlMapping["AccountNumberInput"]).toEqual(
                        jasmine.objectContaining({
                            config: {
                                allowLeadingZero: false,
                                minLen: 1,
                                maxLen: 13
                            }
                        })
                    );
                    expect(svc.urlMapping["AccountNumberInput"]["timeout"]).toEqual(svc.DEFAULT_TIMEOUT_VALUES["InputTimeout"]);
                    expect(svc.urlMapping["AccountNumberInput"]["privateInput"]).toBe(true);
                    expect(svc.urlMapping["AccountNumberInput"]["url"]).toEqual("numericentry.html");
            
                    done();
                });
            });
        });
    
        describe("timer functions", () => {
            it("checks refreshTimeout", async() => {
                Wincor.UI.Service.Provider.ConfigService.getConfiguration = () => {
                    return Promise.reject("Rejected due to testing");
                };
            
                const svc = new Svc();
                spyOn(svc, "fireServiceEvent");
                spyOn(svc, "clearTimeout").and.callThrough();
                spyOn(window, "setTimeout");
            
                svc.interactionTimeoutValue = 120000;
                svc.contentRunning = true;
                svc.refreshTimeout(1000, false);
                expect(svc.fireServiceEvent).toHaveBeenCalledWith("REFRESH_TIMEOUT", 120000);
                expect(window.setTimeout.calls.mostRecent().args[1]).toBe(120000);
                expect(svc.interactionTimerId !== 0).toBe(true);
                expect(svc.interactionTimeoutValue).toBe(120000);
            
                svc.interactionTimeoutValue = 120000;
                svc.contentRunning = true;
                svc.refreshTimeout(1000, true);
                expect(svc.fireServiceEvent).toHaveBeenCalledWith("REFRESH_TIMEOUT", 1000);
                expect(window.setTimeout.calls.mostRecent().args[1]).toBe(1000);
                expect(svc.interactionTimerId !== 0).toBe(true);
                expect(svc.interactionTimeoutValue).toBe(1000);
            
                svc.interactionTimeoutValue = 120000;
                svc.contentRunning = true;
                svc.refreshTimeout(120001, false);
                expect(svc.fireServiceEvent).toHaveBeenCalledWith("REFRESH_TIMEOUT", 120001);
                expect(window.setTimeout.calls.mostRecent().args[1]).toBe(120001);
                expect(svc.interactionTimerId !== 0).toBe(true);
                expect(svc.interactionTimeoutValue).toBe(120001);
            
                svc.interactionTimeoutValue = 120000;
                svc.contentRunning = true;
                svc.refreshTimeout(void 0, false);
                expect(svc.fireServiceEvent).toHaveBeenCalledWith("REFRESH_TIMEOUT", 120000);
                expect(window.setTimeout.calls.mostRecent().args[1]).toBe(120000);
                expect(svc.interactionTimerId !== 0).toBe(true);
                expect(svc.interactionTimeoutValue).toBe(120000);
            
                svc.interactionTimeoutValue = -1;
                svc.contentRunning = true;
                svc.refreshTimeout(void 0, false);
                expect(svc.fireServiceEvent).toHaveBeenCalledWith("REFRESH_TIMEOUT", 120000);
                expect(window.setTimeout.calls.mostRecent().args[1]).toBe(120000);
                expect(svc.interactionTimerId === 0).toBe(true);
                expect(svc.interactionTimeoutValue).toBe(-1);
            
                expect(svc.clearTimeout).toHaveBeenCalledTimes(5);
            });
        
            it("checks refreshTimeout - isHandled=true (foreign timer handling)", async() => {
                Wincor.UI.Service.Provider.ConfigService.getConfiguration = () => {
                    return Promise.reject("Rejected due to testing");
                };
            
                const svc = new Svc();
                spyOn(svc, "fireServiceEvent").and.returnValue(true);
                spyOn(svc, "clearTimeout");
                spyOn(window, "setTimeout");
            
                svc.interactionTimeoutValue = 120000;
                svc.contentRunning = true;
                svc.refreshTimeout(1000, false);
                expect(svc.fireServiceEvent).toHaveBeenCalledWith("REFRESH_TIMEOUT", 120000);
                expect(svc.interactionTimerId === 0).toBe(true);
                expect(svc.clearTimeout).not.toHaveBeenCalled();
                expect(window.setTimeout).not.toHaveBeenCalled();
                expect(svc.interactionTimeoutValue).toBe(120000);
            });
        });
    
        describe("display", () => {
            it("checks processDisplay - viewkey convention check positive", async() => {
                Wincor.UI.Service.Provider.ConfigService.getConfiguration = () => {
                    return Promise.reject("Rejected due to testing");
                };
            
                const svc = new Svc();
                svc.viewContext = {
                    viewConfig: {
                        popup: {
                            oncancel: false,
                            ontimeout: false
                        }
                    }
                };
                svc.urlMapping = {
                    IdleLoopPresentation: {
                        commandconfig: {
                            BUTTON_IDLE_LOOP_LEFT: "VAR_MAIN_VIEWSTATE_S",
                            BUTTON_IDLE_LOOP_RIGHT: "VAR_MAIN_VIEWSTATE_S",
                            CARDLESS: "VAR_CARDLESS_VIEWSTATE_S",
                            REQUEST_SUPPORT: "VAR_REQUEST_SUPPORT_VIEWSTATE_S"
                        },
                        config: {
                            backToDefaultLanguageTimeout: "120000"
                        },
                        popup: { onCancel: false },
                        timeout: "(#EndlessTimeout#)",
                        url: "idlepresentation"
                    }
                };
                spyOn(svc, "handleError");
                spyOn(svc, "fireBeforePageChange");
                spyOn(svc, "navigate");
                const MSG = {
                    viewKey: "IdleLoopPresentation",
                    viewURL: "idlepresentation"
                };
                svc.processDisplay(MSG, false);
                expect(svc.fireBeforePageChange).toHaveBeenCalledTimes(1);
                expect(svc.navigate).toHaveBeenCalledTimes(1);
            });
        });
    
        it("checks processDisplay - viewkey convention check negative", async() => {
            Wincor.UI.Service.Provider.ConfigService.getConfiguration = () => {
                return Promise.reject("Rejected due to testing");
            };
        
            const svc = new Svc();
            svc.viewContext = {
                viewConfig: {
                    popup: {
                        oncancel: false,
                        ontimeout: false
                    }
                }
            };
            svc.urlMapping = {
                Idle_Loop_Presentation: {
                    commandconfig: {
                        BUTTON_IDLE_LOOP_LEFT: "VAR_MAIN_VIEWSTATE_S",
                        BUTTON_IDLE_LOOP_RIGHT: "VAR_MAIN_VIEWSTATE_S",
                        CARDLESS: "VAR_CARDLESS_VIEWSTATE_S",
                        REQUEST_SUPPORT: "VAR_REQUEST_SUPPORT_VIEWSTATE_S"
                    },
                    config: {
                        backToDefaultLanguageTimeout: "120000"
                    },
                    popup: { onCancel: false },
                    timeout: "(#EndlessTimeout#)",
                    url: "idlepresentation"
                }
            };
            spyOn(svc, "handleError");
            spyOn(svc, "fireBeforePageChange");
            spyOn(svc, "navigate");
            const MSG = {
                viewKey: "IdleLoopPresentation",
                viewURL: "idlepresentation"
            };
            svc.processDisplay(MSG, false);
            expect(svc.handleError).toHaveBeenCalledTimes(1);
            expect(svc.fireBeforePageChange).not.toHaveBeenCalledTimes(1);
            expect(svc.navigate).not.toHaveBeenCalledTimes(1);
        });
    
        it("navigate fails if 'url' argument is invalid", async() => {
            const svc = new Svc();
            spyOn(svc, "fireServiceEvent");
            svc.navigate(null);
            svc.navigate(void 0);
            svc.navigate("");
            expect(svc.fireServiceEvent).not.toHaveBeenCalled();
        });
    });
});
