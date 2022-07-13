/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ wn.UI.Service.EppService_test.js 4.3.1-210420-21-c476740e-1a04bc7d

*/

import { WincorNamespace } from "../../../../GUI_UnitTesting/NamespaceMock.js";
import getServiceClass from "../../../../GUIAPP/core/service/wn.UI.Service.EppService.js";

let Wincor;
let Svc;

/*global jQuery:false*/
describe("EppService", () => {

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
        Svc = getServiceClass({ Wincor, jQuery, LogProvider, PTService });

        done();
    });

    // tear down after any of the specs
    afterEach(() => {
    });

    describe("initialization", () => {
        it("uses correct logical name", done => {
            const eppSvc = new Svc();
            expect(eppSvc.NAME).toBe("EppService");
            done();
        });
    });

    describe("on epp KeyPressed event", () => {
        it("beeps once on successfully executed callbacks regarding ada state", done => {
            const eppSvc = new Svc();
            const beepSvc = Wincor.UI.Service.Provider.BeepService;
            const adaSvc = Wincor.UI.Service.Provider.AdaService;
            spyOn(beepSvc, "beep");
            // our callbacks return "true" in means of successfully executed... S
            const claim1 = jasmine.createSpy("claim1").and.returnValue(true);
            const claim2 = jasmine.createSpy("claim2").and.returnValue(true);
            const claim3 = jasmine.createSpy("claim3").and.returnValue(true);
            // @first claim same key with our spy functions
            eppSvc.responseData = {
                FWFuncID: 4002,
                RC: 0,
                param2: ["CONFIRM"],
                param3: ["ENABLED"]
            };
            eppSvc.claimKeys(["CONFIRM"], -1, null, claim1);
            eppSvc.claimKeys(["CONFIRM"], -1, null, claim2);
            eppSvc.claimKeys(["CONFIRM"], -1, null, claim3);

            // simulate ada not active, this shall beep
            adaSvc.state = adaSvc.STATE_VALUES.DONOTHING;
            eppSvc.onEvent({
                methodName: "KeyPressed",
                key: "CONFIRM"
            });
            expect(beepSvc.beep).toHaveBeenCalledTimes(1);
            expect(beepSvc.beep).toHaveBeenCalledWith();
            beepSvc.beep.calls.reset();
            // simulate ada not active, this shall beep
            adaSvc.state = adaSvc.STATE_VALUES.SPEAK;
            eppSvc.onEvent({
                methodName: "KeyPressed",
                key: "CONFIRM"
            });
            expect(beepSvc.beep).not.toHaveBeenCalled();
            done();
        });

        it("skips beeping when a callback returns 'false'", done => {
            const eppSvc = new Svc();
            const beepSvc = Wincor.UI.Service.Provider.BeepService;
            const adaSvc = Wincor.UI.Service.Provider.AdaService;
            spyOn(beepSvc, "beep");
            // our callbacks return "true" in means of successfully executed... S
            const claim1 = jasmine.createSpy("claim1").and.returnValue(true);
            const claim2 = jasmine.createSpy("claim2").and.returnValue(false);
            const claim3 = jasmine.createSpy("claim3").and.returnValue(true);
            // @first claim same key with our spy functions
            eppSvc.responseData = {
                FWFuncID: 4002,
                RC: 0,
                param2: ["CONFIRM"],
                param3: ["ENABLED"]
            };
            eppSvc.claimKeys(["CONFIRM"], -1, null, claim1);
            eppSvc.claimKeys(["CONFIRM"], -1, null, claim2);
            eppSvc.claimKeys(["CONFIRM"], -1, null, claim3);

            // simulate ada not active, this shall beep
            adaSvc.state = adaSvc.STATE_VALUES.DONOTHING;
            eppSvc.onEvent({
                methodName: "KeyPressed",
                key: "CONFIRM"
            });
            expect(beepSvc.beep).not.toHaveBeenCalled();
            done();
        });

        it("does a warning beep, if no callback cares for the event", done => {
            const eppSvc = new Svc();
            const beepSvc = Wincor.UI.Service.Provider.BeepService;
            const adaSvc = Wincor.UI.Service.Provider.AdaService;
            spyOn(beepSvc, "beep");
            // our callbacks return "true" in means of successfully executed... S
            const claim1 = jasmine.createSpy("claim1");
            const claim2 = jasmine.createSpy("claim2");
            const claim3 = jasmine.createSpy("claim3");
            // @first claim same key with our spy functions
            eppSvc.responseData = {
                FWFuncID: 4002,
                RC: 0,
                param2: ["CONFIRM"],
                param3: ["ENABLED"]
            };
            eppSvc.claimKeys(["CONFIRM"], -1, null, claim1);
            eppSvc.claimKeys(["CONFIRM"], -1, null, claim2);
            eppSvc.claimKeys(["CONFIRM"], -1, null, claim3);

            // simulate ada not active, this shall beep
            adaSvc.state = adaSvc.STATE_VALUES.DONOTHING;
            eppSvc.onEvent({
                methodName: "KeyPressed",
                key: "CONFIRM"
            });
            expect(beepSvc.beep).toHaveBeenCalledTimes(1);
            expect(beepSvc.beep).toHaveBeenCalledWith(beepSvc.beepInactiveKeyCode);
            done();
        });
    });

    describe("service events", () => {
        it("CLAIMSTATE_CHANGED sends copied data", done => {
            const eppSvc = new Svc();
            spyOn(eppSvc, "fireServiceEvent");
            eppSvc.fireClaimStatusChanged();
            expect(eppSvc.fireServiceEvent).toHaveBeenCalledTimes(1);
            let eventData = eppSvc.fireServiceEvent.calls.first().args[1];
            expect(eppSvc.fireServiceEvent.calls.first().args[0]).toBe("CLAIM_STATUS_CHANGED");
            expect(eventData).toEqual(eppSvc.claimingData);
            // now we change refs
            eventData.CONFIRM.ADDED_BY_UNIT_TEST = "ASSIGNED_TO_ORIGINAL_DATA";
            expect(eppSvc.claimingData.CONFIRM.ADDED_BY_UNIT_TEST).toBeUndefined();
            done();
        });
    });
    
    describe("handle shutdown event", () => {
        it("release all keys for 1 claim", async done => {
            const eppSvc = new Svc();
            let shutdownHandler = () => {
            };
            spyOn(eppSvc.serviceProvider.ViewService, "registerForServiceEvent").and.callFake((type, handler, persistent) => {
                expect(typeof handler === "function").toBe(true);
                expect(type).toBe("SHUTDOWN");
                expect(persistent).toBe(true);
                shutdownHandler = handler;
            });
            await eppSvc.onServicesReady();
            spyOn(eppSvc, "FrmResolve").and.callFake((resolveReq, callback) => {
                // callback is only given on claimKeys which we call manually here, whereas releaseKeys
                // is called implicit during shutdown handler
                if (callback) {
                    expect(typeof callback === "function").toBe(true);
                    expect(callback.claimId).toBe(1);
                }
            });
            spyOn(eppSvc, "releaseKeys").and.callThrough();
            spyOn(eppSvc, "fireClaimStatusChanged");
            // claim a key
            const claim1 = jasmine.createSpy("claim1");
            const claim1Callback = jasmine.createSpy("claim1Callback");
            const claim1StatusChanged = jasmine.createSpy("claim1StatusChanged");
            eppSvc.claimKeys(["HELP"], -1, claim1Callback, claim1, claim1StatusChanged);
            shutdownHandler();
            expect(eppSvc.releaseKeys).toHaveBeenCalledTimes(1);
            expect(eppSvc.fireClaimStatusChanged).toHaveBeenCalledWith({
                HELP: {
                    claims: 0,
                    status: 'RELEASED'
                }
            });
            done();
        });
        
        it("release all keys for 2 claims of same key", async done => {
            const eppSvc = new Svc();
            let shutdownHandler = () => {
            };
            spyOn(eppSvc.serviceProvider.ViewService, "registerForServiceEvent").and.callFake((type, handler, persistent) => {
                expect(typeof handler === "function").toBe(true);
                expect(type).toBe("SHUTDOWN");
                expect(persistent).toBe(true);
                shutdownHandler = handler;
            });
            await eppSvc.onServicesReady();
            spyOn(eppSvc, "FrmResolve").and.callFake((resolveReq, callback) => {
                // callback is only given on claimKeys which we called manually, whereas releaseKeys
                // is called implicit during shutdown handler
                if (callback) {
                    expect(typeof callback === "function").toBe(true);
                    expect(callback.claimId).toBeGreaterThan(0);
                }
            });
            spyOn(eppSvc, "releaseKeys").and.callThrough();
            spyOn(eppSvc, "fireClaimStatusChanged");
            // claim a key 1
            const claim1 = jasmine.createSpy("claim1");
            const claim1Callback = jasmine.createSpy("claim1Callback");
            const claim1StatusChanged = jasmine.createSpy("claim1StatusChanged");
            eppSvc.claimKeys(["HELP"], -1, claim1Callback, claim1, claim1StatusChanged);
            // claim a key 2
            const claim2 = jasmine.createSpy("claim2");
            const claim2Callback = jasmine.createSpy("claim2Callback");
            const claim2StatusChanged = jasmine.createSpy("claim2StatusChanged");
            eppSvc.claimKeys(["HELP"], -1, claim2Callback, claim2, claim2StatusChanged);
            
            shutdownHandler();
            expect(eppSvc.releaseKeys).toHaveBeenCalledTimes(2);
            expect(eppSvc.fireClaimStatusChanged).toHaveBeenCalledWith({
                HELP: {
                    claims: 1
                }
            });
            expect(eppSvc.fireClaimStatusChanged).toHaveBeenCalledWith({
                HELP: {
                    claims: 0,
                    status: 'RELEASED'
                }
            });
            done();
        });
        
        it("release all keys for 2 claims of different keys", async done => {
            const eppSvc = new Svc();
            let shutdownHandler = () => {
            };
            spyOn(eppSvc.serviceProvider.ViewService, "registerForServiceEvent").and.callFake((type, handler, persistent) => {
                expect(typeof handler === "function").toBe(true);
                expect(type).toBe("SHUTDOWN");
                expect(persistent).toBe(true);
                shutdownHandler = handler;
            });
            await eppSvc.onServicesReady();
            spyOn(eppSvc, "FrmResolve").and.callFake((resolveReq, callback) => {
                // callback is only given on claimKeys which we called manually, whereas releaseKeys
                // is called implicit during shutdown handler
                if (callback) {
                    expect(typeof callback === "function").toBe(true);
                    expect(callback.claimId).toBeGreaterThan(0);
                }
            });
            spyOn(eppSvc, "releaseKeys").and.callThrough();
            spyOn(eppSvc, "fireClaimStatusChanged");
            // claim a key 1
            const claim1 = jasmine.createSpy("claim1");
            const claim1Callback = jasmine.createSpy("claim1Callback");
            const claim1StatusChanged = jasmine.createSpy("claim1StatusChanged");
            eppSvc.claimKeys(["HELP"], -1, claim1Callback, claim1, claim1StatusChanged);
            // claim a key 2
            const claim2 = jasmine.createSpy("claim2");
            const claim2Callback = jasmine.createSpy("claim2Callback");
            const claim2StatusChanged = jasmine.createSpy("claim2StatusChanged");
            eppSvc.claimKeys(["CONFIRM"], -1, claim2Callback, claim2, claim2StatusChanged);
            
            shutdownHandler();
            expect(eppSvc.releaseKeys).toHaveBeenCalledTimes(2);
            expect(eppSvc.fireClaimStatusChanged).toHaveBeenCalledWith({
                HELP: {
                    claims: 0,
                    status: 'RELEASED'
                },
                CONFIRM: {
                    claims: 1
                }
            });
            expect(eppSvc.fireClaimStatusChanged).toHaveBeenCalledWith({
                CONFIRM: {
                    claims: 0,
                    status: 'RELEASED'
                }
            });
            done();
        });
    });
});

