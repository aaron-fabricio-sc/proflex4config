/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ BaseService_test.js 4.3.1-210127-21-34ae33df-1a04bc7d

*/

import { WincorNamespace } from "../../../../../GUI_UnitTesting/NamespaceMock.js";
import getExtensions from "../../../../lib/internal/wn.UI.extensions.js";
import getServiceClass from "../../../../core/service/lib/BaseService.js";

let Wincor;
let FakeServiceProvider;
let Svc;
const NAME = "TestService";
/*global jQuery:false*/
describe("BaseService", () => {
    
    
    // setup before any of the specs
    beforeEach(done => {
        Wincor = new WincorNamespace();
        FakeServiceProvider = {
            ViewService: Wincor.UI.Service.Provider.ViewService
        };
        const LogProvider = Wincor.UI.Diagnostics.LogProvider;
        Svc = getServiceClass({ Wincor, ext: getExtensions({Wincor, LogProvider}), jQuery, LogProvider, GatewayProvider: Wincor.UI.Gateway.GatewayProvider });
    
        done();
    });

    // tear down after any of the specs
    afterEach(() => {
    });

    describe("initialize", () => {

        it("members on creation", done => { // done is used for async behavior
            expect(typeof Svc).toBe("function");
            const svc = new Svc(NAME, {ServiceProvider: FakeServiceProvider});
            // just check if the base instantiates maps and service provider
            expect(svc.responseMap instanceof Map).toBe(true);
            expect(svc.requestMap instanceof Map).toBe(true);
            expect(svc.eventMap instanceof Map).toBe(true);
            expect(svc.serviceProvider).not.toBeNull();
            expect(svc.gateway instanceof Object).toBe(true);
            // tell jasmine we have finished async test
            done();
        });

        it("not registers readyHandler on instantiation anymore", done => {
            // create a spy function for the gatewaymock that can be checked after call
            spyOn(Wincor.UI.Gateway.GatewayProvider, "registerReadyHandler");
            const svc = new Svc(NAME, {ServiceProvider: FakeServiceProvider});
            // this way you can also check derivations
            expect(svc instanceof Svc).toBe(true);
            // instantiation of the service should have called our spy one time...
            expect(Wincor.UI.Gateway.GatewayProvider.registerReadyHandler).not.toHaveBeenCalled();
            // tell jasmine we finished the async test...
            done();
        });
    });


    describe("service events", () => {

        it("does not allow registering with invalid callback types", () => {
            const svc = new Svc(NAME, {ServiceProvider: FakeServiceProvider});
            svc.SERVICE_EVENTS = {TEST_EVENT_1: "TEST_EVENT"};
            svc.NAME = `TestBaseService`;
            svc.installServiceEvents();
            // svc already prepared in setup
            // now for any invalid item as callback in the array check if register ForServiceEvent will deny
            [{}, null, void 0, 2, "test"].forEach((cb) => {
                
                let regId = svc.registerForServiceEvent(svc.SERVICE_EVENTS.TEST_EVENT, cb);
                // we expect a failed registration (returning -1 as id)
                expect(regId).toBe(-1);
                // we also expect not to have registered any receivers
                expect(svc.hasReceivers(svc.SERVICE_EVENTS.TEST_EVENT)).toBe(false);
            });
        });

        it("does not allow non-unique service event names", () => {
            const svc = new Svc(NAME, {ServiceProvider: FakeServiceProvider});
            svc.SERVICE_EVENTS = {TEST_EVENT_2: "TEST_EVENT_2"};
            svc.NAME = `TestBaseService`;
            svc.installServiceEvents();
            
            // svc already prepared in setup
            

            // we instantiate a second service
            const svc2 = new Svc(NAME, {ServiceProvider: FakeServiceProvider});
            // which tries to install same SERVICE_EVENTS as first svc!
            svc2.SERVICE_EVENTS = {TEST_EVENT_2: "TEST_EVENT_2"};
            svc2.NAME = "TestBaseService2";
            // we expect installServiceEvents to throw an exception!
            // please note, that the matcher 'toThrow' in any combination needs a function reference that will get invoked.
            expect(svc2.installServiceEvents.bind(svc2)).toThrow();
        });

        it("does not allow firing foreign events", () => {
            const svc = new Svc(NAME, {ServiceProvider: FakeServiceProvider});
            svc.SERVICE_EVENTS = {TEST_EVENT_4: "TEST_EVENT"};
            svc.NAME = `TestBaseService`;
            svc.installServiceEvents();
            
            let svc2 = new Svc(NAME, {ServiceProvider: FakeServiceProvider});
            svc2.SERVICE_EVENTS = {FOREIGN_EVENT: "FOREIGN_EVENT"};
            svc2.NAME = "TestBaseService2";
            svc2.installServiceEvents();

            spyOn(svc, "deregisterServiceEvents");
            spyOn(Wincor.UI.Diagnostics.LogProvider, "error");

            const svc2ForeignEventHandler = jasmine.createSpy("svc2ForeignEventHandler");
            svc2.registerForServiceEvent(svc2.SERVICE_EVENTS.FOREIGN_EVENT, svc2ForeignEventHandler);
            expect(svc2.hasReceivers(svc2.SERVICE_EVENTS.FOREIGN_EVENT)).toBe(true);
            // now we try to fire an event of svc2 with svc1!
            svc.fireServiceEvent(svc2.SERVICE_EVENTS.FOREIGN_EVENT);
            // if this would work, deregister would be called with "DISPOSAL_TRIGGER_ONETIME"
            expect(svc2ForeignEventHandler).not.toHaveBeenCalled();
            expect(svc.deregisterServiceEvents).not.toHaveBeenCalled();
            expect(Wincor.UI.Diagnostics.LogProvider.error).toHaveBeenCalled();
        });

        it("sends events to registrars", () => {
            const svc = new Svc(NAME, {ServiceProvider: FakeServiceProvider});
            svc.SERVICE_EVENTS = {TEST_EVENT_5: "TEST_EVENT_5"};
            svc.NAME = `TestBaseService`;
            svc.installServiceEvents();
            
            
            // create a spy function
            const spy = jasmine.createSpy("cb");
            // register for our test event with that spy function
            const regId = svc.registerForServiceEvent(svc.SERVICE_EVENTS.TEST_EVENT_5, spy);
            // registration should have worked... first id of a newly generated service will be 1
            // the service should have stored our registration
            expect(svc.hasReceivers(svc.SERVICE_EVENTS.TEST_EVENT_5)).toBe(true);
            // now fire the event and check the spy :-)
            svc.fireServiceEvent("TEST_EVENT_5", "abc");
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith("abc");
        });

        it("fireServiceEvent returns 'handled' boolean argument", () => {
            const svc = new Svc(NAME, {ServiceProvider: FakeServiceProvider});
            svc.SERVICE_EVENTS = {TEST_EVENT_6: "TEST_EVENT_6"};
            svc.NAME = `TestBaseService`;
            svc.installServiceEvents();
            
            
            const callback1 = jasmine.createSpy("callback1").and.returnValue(false);
            const callback2 = jasmine.createSpy("callback2").and.returnValue(true);
            const regId = svc.registerForServiceEvent(svc.SERVICE_EVENTS.TEST_EVENT_6, callback1);
            const regId2 = svc.registerForServiceEvent(svc.SERVICE_EVENTS.TEST_EVENT_6, callback2);
            expect(svc.hasReceivers(svc.SERVICE_EVENTS.TEST_EVENT_6)).toBe(true);
            expect(svc.fireServiceEvent("TEST_EVENT_6", "abc")).toBe(true);
            expect(callback1).toHaveBeenCalledTimes(1);
            expect(callback1).toHaveBeenCalledWith("abc");
            expect(callback2).toHaveBeenCalledTimes(1);
            expect(callback2).toHaveBeenCalledWith("abc");
        });

        it("removes registrations using regId", () => {
            const svc = new Svc(NAME, {ServiceProvider: FakeServiceProvider});
            svc.SERVICE_EVENTS = {TEST_EVENT_7: "TEST_EVENT_7"};
            svc.NAME = `TestBaseService`;
            svc.installServiceEvents();
            
            
            const spy = jasmine.createSpy("cb");
            const regId = svc.registerForServiceEvent(svc.SERVICE_EVENTS.TEST_EVENT_7, spy);
            const ret = svc.deregisterFromServiceEvent(regId);
            expect(ret).toBe(true);
            svc.fireServiceEvent(svc.SERVICE_EVENTS.TEST_EVENT_7, "abc");
            expect(spy).not.toHaveBeenCalled();
        });

        it("removes registrations with DISPOSAL_TRIGGER_ONETIME", () => {
            const svc = new Svc(NAME, {ServiceProvider: FakeServiceProvider});
            svc.SERVICE_EVENTS = {TEST_EVENT_8: "TEST_EVENT_8"};
            svc.NAME = `TestBaseService`;
            svc.installServiceEvents();
            
            //svc.installServiceEvents();
            const spy = jasmine.createSpy("registration callback");
            spyOn(svc, "deregisterServiceEvents").and.callThrough();
            const regId = svc.registerForServiceEvent(svc.SERVICE_EVENTS.TEST_EVENT_8, spy, svc.DISPOSAL_TRIGGER_ONETIME);
            expect(svc.hasReceivers(svc.SERVICE_EVENTS.TEST_EVENT_8)).toBe(true);
            svc.fireServiceEvent(svc.SERVICE_EVENTS.TEST_EVENT_8, "abc");
            expect(svc.hasReceivers(svc.SERVICE_EVENTS.TEST_EVENT_8)).toBe(false);
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith("abc");

            svc.fireServiceEvent(svc.SERVICE_EVENTS.TEST_EVENT_8, "abc");
            expect(spy).toHaveBeenCalledTimes(1);
            expect(svc.deregisterServiceEvents).toHaveBeenCalledTimes(1);
            expect(svc.deregisterServiceEvents.calls.first().args).toEqual([svc.DISPOSAL_TRIGGER_ONETIME, svc.SERVICE_EVENTS.TEST_EVENT_8]);
        });

        it("onServicesReady removes registrations with DISPOSAL_TRIGGER_DEACTIVATE", () => {
            const svc = new Svc(NAME, {ServiceProvider: FakeServiceProvider});
            svc.SERVICE_EVENTS = {TEST_EVENT_9: "TEST_EVENT_9"};
            svc.NAME = `TestBaseService`;
            svc.installServiceEvents();
            
            //svc.installServiceEvents();
            const eventHandlerSpy = jasmine.createSpy("eventHandlerSpy");

            // prepare "viewService"
            // onServicesReady will register for VIEW_DEACTIVATED ...
            const viewService = new Svc(NAME, {ServiceProvider: FakeServiceProvider});
            viewService.NAME = "ViewService";
            viewService.SERVICE_EVENTS = Object.assign({}, Wincor.UI.Service.Provider.ViewService.SERVICE_EVENTS);
            viewService.installServiceEvents();
            // check if onServicesReady delivers instance of bluebird Promise
            expect(svc.onServicesReady().then !== void 0).toBe(true);

            spyOn(svc, "deregisterServiceEvents").and.callThrough();
            // register fiwth disposal "DEACTIVATION" which is VIEW_CLOSING of viewservice
            const regId = svc.registerForServiceEvent(svc.SERVICE_EVENTS.TEST_EVENT_9, eventHandlerSpy, svc.DISPOSAL_TRIGGER_DEACTIVATE);
            expect(regId).toBeGreaterThan(3); // onServicesReady installs at least 3 event handlers
            svc.fireServiceEvent(svc.SERVICE_EVENTS.TEST_EVENT_9, "abc");
            expect(eventHandlerSpy).toHaveBeenCalledTimes(1);
            expect(eventHandlerSpy).toHaveBeenCalledWith("abc");

            // simulate deactivate via VIEW_CLOSING
            viewService.fireServiceEvent(viewService.SERVICE_EVENTS.VIEW_CLOSING);
            svc.fireServiceEvent(svc.SERVICE_EVENTS.TEST_EVENT_9, "abc");
            expect(eventHandlerSpy).toHaveBeenCalledTimes(1);
            expect(svc.deregisterServiceEvents).toHaveBeenCalledTimes(2);
            expect(svc.deregisterServiceEvents.calls.first().args).toEqual([svc.DISPOSAL_TRIGGER_ONETIME, svc.SERVICE_EVENTS.TEST_EVENT_9]);
            expect(svc.deregisterServiceEvents.calls.mostRecent().args).toEqual([svc.DISPOSAL_TRIGGER_DEACTIVATE]);
        });

        it("translateResponse passes message for default function", () => {
            const svc = new Svc(NAME, {ServiceProvider: FakeServiceProvider});
            svc.SERVICE_EVENTS = {TEST_EVENT_11: "TEST_EVENT_11"};
            svc.NAME = `TestBaseService`;
            svc.installServiceEvents();
            const msg = {
                data: "1234567890"
            };

            expect(svc.translateResponse(msg)).toBe(msg);
        });

        it("onResponse calls and removes callbacks from responsemap, if available", () => {
            const svc = new Svc(NAME, {ServiceProvider: FakeServiceProvider});
            svc.SERVICE_EVENTS = {TEST_EVENT_12: "TEST_EVENT_12"};
            svc.NAME = `TestBaseService`;
            svc.installServiceEvents();
            
            const cb = jasmine.createSpy("cb");
            const MSG = {callbackIdx: 1};

            spyOn(svc, "translateResponse").and.callThrough();
            svc.responseMap.set(1, cb);
            svc.onResponse(MSG);
            expect(cb).toHaveBeenCalledWith(MSG);
            expect(svc.translateResponse).toHaveBeenCalledWith(MSG);
            expect(svc.responseMap.has(1)).toBe(false);

            // reset spies and test response without registered callback
            cb.calls.reset();
            svc.translateResponse.calls.reset();
            svc.onResponse({callbackIdx: 1});
            expect(cb).not.toHaveBeenCalled();
            expect(svc.translateResponse).not.toHaveBeenCalled();
            expect(svc.responseMap.has(1)).toBe(false);
        });

        it("onRequest dispatches requests of BL", () => {
            const svc = new Svc(NAME, {ServiceProvider: FakeServiceProvider});
            svc.SERVICE_EVENTS = {TEST_EVENT_13: "TEST_EVENT_13"};
            svc.NAME = `TestBaseService`;
            svc.installServiceEvents();
            
            const FUNCTION1 = "myFunction1";
            const FUNCTION2 = "myFunction2";
            const cb = jasmine.createSpy("cb");
            const MSG = {methodName: FUNCTION1};

            svc.requestMap.set(FUNCTION1, cb);
            svc.onRequest(MSG);
            expect(cb).toHaveBeenCalledWith(MSG);
            expect(svc.requestMap.has(FUNCTION1)).toBe(true);

            // reset spies and test unknown request
            cb.calls.reset();
            expect(svc.onRequest.bind(svc, {methodName: FUNCTION2})).not.toThrow();
            expect(cb).not.toHaveBeenCalled();
            expect(svc.requestMap.has(FUNCTION1)).toBe(true);
            expect(svc.requestMap.has(FUNCTION2)).toBe(false);
        });

        it("onEvent dispatches events of BL", () => {
            const svc = new Svc(NAME, {ServiceProvider: FakeServiceProvider});
            svc.SERVICE_EVENTS = {TEST_EVENT_14: "TEST_EVENT_14"};
            svc.NAME = `TestBaseService`;
            svc.installServiceEvents();
            
            const EVENT1 = "myFunction1";
            const EVENT2 = "myFunction2";
            const cb = jasmine.createSpy("cb");
            const MSG = {eventName: EVENT1};

            svc.eventMap.set(EVENT1, cb);
            svc.onEvent(MSG);
            expect(cb).toHaveBeenCalledWith(MSG);
            expect(svc.eventMap.has(EVENT1)).toBe(true);

            // reset spies and test unknown request
            cb.calls.reset();
            expect(svc.onEvent.bind(svc, {methodName: EVENT2})).not.toThrow();
            expect(cb).not.toHaveBeenCalled();
            expect(svc.eventMap.has(EVENT1)).toBe(true);
            expect(svc.eventMap.has(EVENT2)).toBe(false);
        });

        it("sendRequest puts request in responseMap", () => {
            const svc = new Svc(NAME, {ServiceProvider: FakeServiceProvider});
            svc.SERVICE_EVENTS = {TEST_EVENT_15: "TEST_EVENT"};
            svc.NAME = `TestBaseService`;
            svc.installServiceEvents();
            
            const INDEX = 4711;
            const CB = () => {};
            const MSG = {};

            svc.gateway.sendRequest = jasmine.createSpy()
                // this is what the gateway does
                .and.callFake((message, fx) => {
                    fx(INDEX);
                    return message;
                });

            expect(svc.sendRequest(MSG, CB)).toBe(MSG);

            expect(svc.responseMap.has(INDEX)).toBe(true);
            expect(svc.responseMap.get(INDEX)).toBe(CB);
        });

        it("sendResponse passes response to gateway", () => {
            const svc = new Svc(NAME, {ServiceProvider: FakeServiceProvider});
            svc.SERVICE_EVENTS = {TEST_EVENT_16: "TEST_EVENT_16"};
            svc.NAME = `TestBaseService`;
            svc.installServiceEvents();
            
            const MSG = {};
            const RESULT = 1234;

            svc.gateway.sendResponse = jasmine.createSpy()
                .and.callFake((msg) => {
                    return msg;
                });

            expect(svc.sendResponse(MSG, RESULT)).toBe(MSG);
            expect(svc.gateway.sendResponse).toHaveBeenCalledWith(MSG, RESULT);
        });

        it("sendEvent passes event to gateway", () => {
            const svc = new Svc(NAME, {ServiceProvider: FakeServiceProvider});
            svc.SERVICE_EVENTS = {TEST_EVENT_18: "TEST_EVENT_18"};
            svc.NAME = `TestBaseService`;
            svc.installServiceEvents();
            
            const MSG = {};

            svc.gateway.sendEvent = jasmine.createSpy()
                .and.callFake((msg) => {
                    return msg;
                });

            expect(svc.sendEvent(MSG)).toBe(MSG);
            expect(svc.gateway.sendEvent).toHaveBeenCalledWith(MSG);
        });

        it("installServiceEvents adds events to map for each service", () => {
            const svc = new Svc(NAME, {ServiceProvider: FakeServiceProvider});
            svc.SERVICE_EVENTS = {TEST_EVENT_22: "TEST_EVENT_22"};
            svc.NAME = `TestBaseService`;
            svc.installServiceEvents();
            
            // beforeEach has already installed SERVICE_EVENTS.TEST_EVENT, try to register for it
            expect(svc.registerForServiceEvent(svc.SERVICE_EVENTS.TEST_EVENT_22, () => {})).toBeGreaterThan(-1);
        });

        it("onSetup returns promise", () => {
            const svc = new Svc(NAME, {ServiceProvider: FakeServiceProvider});
            svc.SERVICE_EVENTS = {TEST_EVENT_23: "TEST_EVENT_23"};
            svc.NAME = `TestBaseService`;
            svc.installServiceEvents();
            
            expect(svc.onSetup().then !== void 0).toBe(true);
        });

        it("onError as default implementation", () => {
            const svc = new Svc(NAME, {ServiceProvider: FakeServiceProvider});
            svc.SERVICE_EVENTS = {TEST_EVENT_24: "TEST_EVENT_24"};
            svc.NAME = `TestBaseService`;
            svc.installServiceEvents();
            
            expect(typeof svc.onError === "function").toBe(true);
        });

        it("setGateway keeps gateway reference", () => {
            const svc = new Svc(NAME, {ServiceProvider: FakeServiceProvider});
            svc.SERVICE_EVENTS = {TEST_EVENT_25: "TEST_EVENT_25"};
            svc.NAME = `TestBaseService`;
            svc.installServiceEvents();
            
            const GW = {my: "gateway"};
            svc.setGateway(GW);
            expect(svc.gateway).toBe(GW);
        });
    });
});

