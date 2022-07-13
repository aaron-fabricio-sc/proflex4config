/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ wn.UI.Service.AdaService_test.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

import { WincorNamespace } from "../../../../GUI_UnitTesting/NamespaceMock.js";
import getExtensions from "../../../lib/internal/wn.UI.extensions.js";
import getServiceClass from "../../../../GUIAPP/core/service/wn.UI.Service.AdaService.js";

let Wincor;
let Svc;

/*global jQuery:false*/
describe("AdaService", () => {

    // setup before any of the specs
    beforeEach(done => {
        Wincor = new WincorNamespace();

        class PTService extends Wincor.UI.Service.PTService {
            FrmResolve = jasmine.createSpy("").and.callFake((req, cb) => {
                cb(this.FRM_RESOLVE_RC);
            });
            
            hasReceivers = () => true;
            
            translateResponse() {}
            sendRequest() {}
            sendEvent() {}
        }
        
        const LogProvider = Wincor.UI.Diagnostics.LogProvider;
        Svc = getServiceClass({ Wincor, ext: getExtensions({Wincor, LogProvider}), LogProvider, PTService });

        done();
    });

    // tear down after any of the specs
    afterEach(() => {
    });

    describe("initialization", () => {
        it("uses correct logical name", async() => {
            const adaService = new Svc();
            expect(adaService.NAME).toBe("AdaService");
        });
    });

    describe("ada focus", () => {
        it("can be switched to GUIAPP", async() => {
            const adaService = new Svc();
            let res = await adaService.switchToApp();
            expect(res).toBe(0);
            expect(adaService.FrmResolve).toHaveBeenCalledWith({
                service: "AdaService",
                FWName: "AdaSync",
                FWFuncID: 97,
                param1: '',
                meta1: [ 'NULL', 0 ],
                param2: '',
                meta2: [ 'NULL', 0 ],
                param3: '',
                meta3: [ 'NULL', 0 ],
                paramUL: 0
            }, jasmine.any(Function));
        });

        it("can be switched to GUIAPP stopping current speak (default)", async() => {
            const adaService = new Svc();
            spyOn(adaService, "speak").and.callFake((txt, prio, privacy, callback) => {
                expect(txt).toEqual(" ");
                expect(prio).toBe(2);
                expect(privacy).toBe(0);
                expect(callback).toEqual(jasmine.any(Function));
                callback();
            });
            let res = await adaService.switchToApp();
            expect(res).toBe(0);
            expect(adaService.FrmResolve).toHaveBeenCalledWith({
                service: "AdaService",
                FWName: "AdaSync",
                FWFuncID: 97,
                param1: '',
                meta1: [ 'NULL', 0 ],
                param2: '',
                meta2: [ 'NULL', 0 ],
                param3: '',
                meta3: [ 'NULL', 0 ],
                paramUL: 0
            }, jasmine.any(Function));
            expect(adaService.speak).toHaveBeenCalledTimes(1);
        });

        it("can be switched to GUIAPP not stopping current speak", async() => {
            const adaService = new Svc();
            spyOn(adaService, "speak").and.callFake((txt, prio, privacy, callback) => {
                expect(txt).toEqual(" ");
                expect(prio).toBe(2);
                expect(privacy).toBe(0);
                expect(callback).toEqual(jasmine.any(Function));
                callback();
            });
            let res = await adaService.switchToApp(false);
            expect(res).toBe(0);
            expect(adaService.FrmResolve).toHaveBeenCalledWith({
                service: "AdaService",
                FWName: "AdaSync",
                FWFuncID: 97,
                param1: '',
                meta1: [ 'NULL', 0 ],
                param2: '',
                meta2: [ 'NULL', 0 ],
                param3: '',
                meta3: [ 'NULL', 0 ],
                paramUL: 0
            }, jasmine.any(Function));
            expect(adaService.speak).not.toHaveBeenCalled();
        });

        it("ignores rc <= -1000", async() => {
            const adaService = new Svc();
            adaService.FRM_RESOLVE_RC = -1000;
            let res = await adaService.switchToApp();
            expect(res).toBe(0);
            expect(adaService.FrmResolve).toHaveBeenCalledWith({
                service: "AdaService",
                FWName: "AdaSync",
                FWFuncID: 97,
                param1: '',
                meta1: [ 'NULL', 0 ],
                param2: '',
                meta2: [ 'NULL', 0 ],
                param3: '',
                meta3: [ 'NULL', 0 ],
                paramUL: 0
            }, jasmine.any(Function));
        });
    });

    describe("SPEAKING_STOPPED while open popup", () => {
        it("refreshing popup timeout", async() => {
            const adaService = Wincor.createMockObject("serviceProvider.ViewService.viewContext.viewID='4711'", new Svc());
            Wincor.UI.Service.Provider.ViewService.viewContext.viewID = 4711;
            adaService.viewIdWhenRepeatWasStarted = 4711;
            const POPUP_TYPE = "TIMEOUT_POPUP";
            Wincor.UI.Content.ViewModelHelper = {
                isTimeoutPopupActive: jasmine.createSpy("isTimeoutPopupActive").and.returnValue(true),
                getTimerInfo: jasmine.createSpy("getTimerInfo").and.returnValue({
                    name: POPUP_TYPE,
                    id: 4711,
                    timeLen: 30000
                }),
                refreshTimer: jasmine.createSpy("refreshTimer").and.callFake((timeLen, name) => {
                    expect(timeLen).toBe(30000);
                    expect(name).toBe(POPUP_TYPE);
                })
            };
            Wincor.UI.Service.Provider.ViewService.refreshTimeout = jasmine.createSpy("refreshTimeout");
            adaService.onAdaEventSpeakCompleted();
            expect(Wincor.UI.Service.Provider.ViewService.refreshTimeout).not.toHaveBeenCalled();
            expect(Wincor.UI.Content.ViewModelHelper.refreshTimer).toHaveBeenCalledWith(30000, POPUP_TYPE);
            expect(Wincor.UI.Content.ViewModelHelper.isTimeoutPopupActive).toHaveBeenCalled();
        });

        it("refreshing view timeout", async() => {
            const adaService = Wincor.createMockObject("serviceProvider.ViewService.viewContext.viewID='4711'", new Svc());
            Wincor.UI.Service.Provider.ViewService.viewContext.viewID = 4711;
            adaService.viewIdWhenRepeatWasStarted = 4711;
            Wincor.UI.Content.ViewModelHelper = {
                isTimeoutPopupActive: jasmine.createSpy("isTimeoutPopupActive").and.returnValue(false)
            };
            Wincor.UI.Service.Provider.ViewService.refreshTimeout = jasmine.createSpy("refreshTimeout");
            adaService.onAdaEventSpeakCompleted();
            expect(Wincor.UI.Service.Provider.ViewService.refreshTimeout).toHaveBeenCalledTimes(1);
            expect(Wincor.UI.Content.ViewModelHelper.isTimeoutPopupActive).toHaveBeenCalled();
        });
    });

    describe("repeat", () => {
        it("event while open popup", async() => {
            const adaService = new Svc();
            adaService.serviceProvider = Wincor.createMockObject("ViewService.viewContext.viewID=test");
            adaService.isSpeaking = false;
            adaService.isAutoRepeatActive = false;
            adaService.serviceProvider.ViewService.clearTimeout = jasmine.createSpy("clearTimeout");
            const POPUP_TYPE = "TIMEOUT_POPUP";
            Wincor.UI.Content.ViewModelHelper = {
                isTimeoutPopupActive: jasmine.createSpy("isTimeoutPopupActive").and.returnValue(true),
                getTimerInfo: jasmine.createSpy("getTimerInfo").and.returnValue({
                    name: POPUP_TYPE,
                    id: 4711,
                    timeLen: 30000
                }),
                refreshTimer: jasmine.createSpy("refreshTimer").and.callFake((timeLen, name) => {
                    expect(timeLen).toBe(30000);
                    expect(name).toBe(POPUP_TYPE);
                })
            };

            adaService.onAdaEventRepeat();
            expect(adaService.viewIdWhenRepeatWasStarted).toBe("test");
            expect(adaService.isSpeaking).toBe(true);
            expect(adaService.serviceProvider.ViewService.clearTimeout).toHaveBeenCalled();
            expect(Wincor.UI.Content.ViewModelHelper.isTimeoutPopupActive).toHaveBeenCalled();
            expect(Wincor.UI.Content.ViewModelHelper.refreshTimer).toHaveBeenCalledWith(30000, POPUP_TYPE);
        });

        it("event while no open popup", async() => {
            const adaService = new Svc();
            adaService.serviceProvider = Wincor.createMockObject("ViewService.viewContext.viewID=test");
            adaService.isSpeaking = false;
            adaService.isAutoRepeatActive = false;
            adaService.serviceProvider.ViewService.clearTimeout = jasmine.createSpy("clearTimeout");
            Wincor.UI.Content.ViewModelHelper = {
                isTimeoutPopupActive: jasmine.createSpy("isTimeoutPopupActive").and.returnValue(false),
                refreshTimer: jasmine.createSpy("refreshTimer")
            };
    
            adaService.onAdaEventRepeat();
            expect(adaService.viewIdWhenRepeatWasStarted).toBe("test");
            expect(adaService.isSpeaking).toBe(true);
            expect(adaService.serviceProvider.ViewService.clearTimeout).toHaveBeenCalled();
            expect(Wincor.UI.Content.ViewModelHelper.isTimeoutPopupActive).toHaveBeenCalled();
            expect(Wincor.UI.Content.ViewModelHelper.refreshTimer).not.toHaveBeenCalled();
        });
    });

    describe("service events", () => {
        it("forwards SPEAKING_STOPPED if currently speaking on complete", async() => {
            const adaService = Wincor.createMockObject("serviceProvider.ViewService.viewContext.viewID='test'", new Svc());
            adaService.isSpeaking = true;
            spyOn(adaService, "fireServiceEvent");
            adaService.onAdaEventSpeakCompleted();
            expect(adaService.fireServiceEvent).toHaveBeenCalledWith(adaService.SERVICE_EVENTS.SPEAKING_STOPPED);
        });

        it("skips forwarding SPEAKING_STOPPED if currently speaking on complete", async() => {
            const adaService = Wincor.createMockObject("serviceProvider.ViewService.viewContext.viewID='test'", new Svc());
            adaService.isSpeaking = false;
            spyOn(adaService, "fireServiceEvent");
            adaService.onAdaEventSpeakCompleted();
            expect(adaService.fireServiceEvent).not.toHaveBeenCalled();
        });

        it("forwards SPEAKING_STOPPED if currently speaking on cancel", async() => {
            const adaService = Wincor.createMockObject("serviceProvider.ViewService.viewContext.viewID='test'", new Svc());
            adaService.isSpeaking = true;
            spyOn(adaService, "fireServiceEvent");
            adaService.onAdaEventSpeakCancelled();
            expect(adaService.fireServiceEvent).toHaveBeenCalledWith(adaService.SERVICE_EVENTS.SPEAKING_STOPPED);
        });

        it("skips forwarding SPEAKING_STOPPED if currently speaking on cancel", async() => {
            const adaService = Wincor.createMockObject("serviceProvider.ViewService.viewContext.viewID='test'", new Svc());
            adaService.isSpeaking = false;
            spyOn(adaService, "fireServiceEvent");
            adaService.onAdaEventSpeakCancelled();
            expect(adaService.fireServiceEvent).not.toHaveBeenCalled();
        });

        it("forwards SPEAKING_STOPPED if currently speaking on stop", async() => {
            const adaService = Wincor.createMockObject("serviceProvider.ViewService.viewContext.viewID='test'", new Svc());
            adaService.isSpeaking = true;
            spyOn(adaService, "fireServiceEvent");
            adaService.onAdaEventStop();
            expect(adaService.fireServiceEvent).toHaveBeenCalledWith(adaService.SERVICE_EVENTS.SPEAKING_STOPPED);
        });

        it("skips forwarding SPEAKING_STOPPED if currently speaking on stop", async() => {
            const adaService = Wincor.createMockObject("serviceProvider.ViewService.viewContext.viewID='test'", new Svc());
            adaService.isSpeaking = false;
            spyOn(adaService, "fireServiceEvent");
            adaService.onAdaEventStop();
            expect(adaService.fireServiceEvent).not.toHaveBeenCalled();
        });

        it("forwards SPEAKING_STOPPED if currently speaking on deregister", async() => {
            const adaService = Wincor.createMockObject("serviceProvider.ViewService.viewContext.viewID='test'", new Svc());
            adaService.isSpeaking = true;
            spyOn(adaService, "fireServiceEvent");
            adaService.deregisterAdaEventsForSpeakingControl();
            expect(adaService.fireServiceEvent).toHaveBeenCalledWith(adaService.SERVICE_EVENTS.SPEAKING_STOPPED);
        });

        it("skips forwarding SPEAKING_STOPPED if currently speaking on deregister", async() => {
            const adaService = Wincor.createMockObject("serviceProvider.ViewService.viewContext.viewID='test'", new Svc());
            adaService.isSpeaking = false;
            spyOn(adaService, "fireServiceEvent");
            adaService.deregisterAdaEventsForSpeakingControl();
            expect(adaService.fireServiceEvent).not.toHaveBeenCalled();
        });
    });

    describe("command", () => {
        const COMMAND_MAP = {
            IDLE: [{
                event: "STATE_CHANGED",
                data: "BEREADY"
            }],
            START: [{
                event: "STATE_CHANGED",
                data: "SPEAK"
            }],
            FIRSTSTART: [{
                event: "FIRST_START",
                data: "FIRSTSTART"
            }],
            FIRSTSTARTANDACTIVATE: [{
                event: "FIRST_START",
                data: "FIRSTSTARTANDACTIVATE"
            }],
            STOP: [{
                event: "STATE_CHANGED",
                data: "DONOTHING"
            }],
            LASTSTOP: [{
                event: "STATE_CHANGED",
                data: "DONOTHING"
            }],
            ERROR: [{
                event: "STATE_CHANGED",
                data: "DONOTHING"
            }, {
                event: "ERROR_HAPPENED",
                data: void 0
            }]
        };
        Object.keys(COMMAND_MAP).forEach(cmd => {
            it(`${cmd} fires appropriate event`, async() => {
                const adaService = Wincor.createMockObject("serviceProvider.ViewService.viewContext.viewID='test'", new Svc());
                adaService.isSpeaking = false;

                const ADA_CMD = {
                    command: cmd
                };
                spyOn(adaService, `registerAdaEventsForSpeakingControl`);
                adaService.fireServiceEvent = jasmine.createSpy(`fireServiceEvent_${COMMAND_MAP[cmd][0].event}-${COMMAND_MAP[cmd][0].data}`);
                adaService.adaCommand(ADA_CMD);
                COMMAND_MAP[cmd].forEach((dataSet, idx) => {
                    let expectedArgs = dataSet.data !== void 0 ? [dataSet.event, dataSet.data] : [dataSet.event];
                    expect(adaService.fireServiceEvent.calls.argsFor(idx)).toEqual(expectedArgs);
                });
            });
        });
        
        it(`checks error happpend flag true on ERROR command`, async() => {
            const adaService = Wincor.createMockObject("serviceProvider.ViewService.viewContext.viewID='test'", new Svc());
            adaService.adaCommand({command: "ERROR"});
            expect(adaService.errorHappened).toBe(true);
        });
        
        it(`checks error happpend flag set back on IDLE command`, async() => {
            const adaService = Wincor.createMockObject("serviceProvider.ViewService.viewContext.viewID='test'", new Svc());
            adaService.errorHappened = true;
            adaService.adaCommand({command: "IDLE"});
            expect(adaService.errorHappened).toBe(false);
        });
        
    });
});

