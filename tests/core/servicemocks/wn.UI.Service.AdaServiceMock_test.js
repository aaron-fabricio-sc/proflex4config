/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ wn.UI.Service.AdaServiceMock_test.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

import { WincorNamespace } from "../../../../GUI_UnitTesting/NamespaceMock.js";
import getExtensions from "../../../lib/internal/wn.UI.extensions.js";
import getServiceClass from "../../../../GUIAPP/core/servicemocks/wn.UI.Service.AdaServiceMock.js";

let Wincor;
let Svc;

describe("AdaServiceMock", () => {

    beforeEach(done => {
        Wincor = new WincorNamespace();

        class BaseServiceMock extends Wincor.UI.Service.BaseServiceMock {
        }
        
        const LogProvider = Wincor.UI.Diagnostics.LogProvider;
        Svc = getServiceClass({ BaseService: BaseServiceMock, ext: getExtensions({Wincor, LogProvider}), LogProvider });

        jasmine.clock().install();
        done();
    });

    afterEach(() => {
        jasmine.clock().uninstall();
    });

    describe("initialization", () => {
        it("uses correct logical name", () => {
            const adaService = new Svc();
            expect(adaService.NAME).toBe("AdaService");
        });
    });

    describe("ada focus", () => {
        it("can be switched to GUIAPP", async() => {
            const adaService = new Svc();
            let res = await adaService.switchToApp();
            expect(res).toBe(0);
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
            expect(adaService.speak).not.toHaveBeenCalled();
        });
    });

    describe("service events", () => {

        it("forwards SPEAKING_STOPPED if currently speaking on complete", () => {
            const adaService = Wincor.createMockObject("serviceProvider.ViewService.viewContext.viewID='test'", new Svc());
            adaService.isSpeaking = true;
            spyOn(adaService, "fireServiceEvent");
            adaService.onAdaEventSpeakCompleted();
            expect(adaService.fireServiceEvent).toHaveBeenCalledWith(adaService.SERVICE_EVENTS.SPEAKING_STOPPED);
        });

        it("skips forwarding SPEAKING_STOPPED if currently speaking on complete", () => {
            const adaService = Wincor.createMockObject("serviceProvider.ViewService.viewContext.viewID='test'", new Svc());
            adaService.isSpeaking = false;
            spyOn(adaService, "fireServiceEvent");
            adaService.onAdaEventSpeakCompleted();
            expect(adaService.fireServiceEvent).not.toHaveBeenCalled();
        });

        it("forwards SPEAKING_STOPPED if currently speaking on cancel", () => {
            const adaService = Wincor.createMockObject("serviceProvider.ViewService.viewContext.viewID='test'", new Svc());
            adaService.isSpeaking = true;
            spyOn(adaService, "fireServiceEvent");
            adaService.onAdaEventSpeakCancelled();
            expect(adaService.fireServiceEvent).toHaveBeenCalledWith(adaService.SERVICE_EVENTS.SPEAKING_STOPPED);
        });

        it("skips forwarding SPEAKING_STOPPED if currently speaking on cancel", () => {
            const adaService = Wincor.createMockObject("serviceProvider.ViewService.viewContext.viewID='test'", new Svc());
            adaService.isSpeaking = false;
            spyOn(adaService, "fireServiceEvent");
            adaService.onAdaEventSpeakCancelled();
            expect(adaService.fireServiceEvent).not.toHaveBeenCalled();
        });

        it("forwards SPEAKING_STOPPED if currently speaking on stop", () => {
            const adaService = Wincor.createMockObject("serviceProvider.ViewService.viewContext.viewID='test'", new Svc());
            adaService.isSpeaking = true;
            spyOn(adaService, "fireServiceEvent");
            adaService.onAdaEventStop();
            expect(adaService.fireServiceEvent).toHaveBeenCalledWith(adaService.SERVICE_EVENTS.SPEAKING_STOPPED);
        });

        it("skips forwarding SPEAKING_STOPPED if currently speaking on stop", () => {
            const adaService = Wincor.createMockObject("serviceProvider.ViewService.viewContext.viewID='test'", new Svc());
            adaService.isSpeaking = false;
            spyOn(adaService, "fireServiceEvent");
            adaService.onAdaEventStop();
            expect(adaService.fireServiceEvent).not.toHaveBeenCalled();
        });

        it("forwards SPEAKING_STOPPED if currently speaking on deregister", () => {
            const adaService = Wincor.createMockObject("serviceProvider.ViewService.viewContext.viewID='test'", new Svc());
            adaService.isSpeaking = true;
            spyOn(adaService, "fireServiceEvent");
            adaService.deregisterAdaEventsForSpeakingControl();
            expect(adaService.fireServiceEvent).toHaveBeenCalledWith(adaService.SERVICE_EVENTS.SPEAKING_STOPPED);
        });

        it("skips forwarding SPEAKING_STOPPED if currently speaking on deregister", () => {
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
            it(`${cmd} fires appropriate event`, () => {
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
    });
});

