/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ wn.UI.Service.BaseProxy_test.js 4.3.1-201130-21-086c3328-1a04bc7d

*/

import { WincorNamespace } from "../../../../GUI_UnitTesting/NamespaceMock.js";
import getExtensions from "../../../lib/internal/wn.UI.extensions.js";
import getBaseProxy from "../../../core/proxies/wn.UI.Service.BaseProxy.js";

let fakeServiceInstance;
let INTERFACE;

let Wincor;
let BaseProxy;

/*global Class:false, jQuery:false*/
describe("wn.UI.Service.BaseProxy", () => {
    
    // setup before any of the specs
    beforeEach(done => {
        Wincor = new WincorNamespace();
        Wincor.applicationMode = true;

        fakeServiceInstance = {
            eventMap: new Map([]),
            f1: () => {
                return "f1called";
            },
            fAsync1: (argument, callback) => {
                setTimeout(() => {
                    callback(argument);
                }, 1);
            },
            crossCallAcknowledge: (caller, service, acknowledgeId, remoteIface) => Promise.resolve(remoteIface),
            NAME: "FakeService",
            GENERAL1: "GENERAL1",
            GENERAL2: "GENERAL2",
            GENERAL3: "GENERAL3",
            readOnlyNumericProp: 42,
            stringProp1: "Hello",
            readOnlyStringProp1: "ReadOnly"
        };
        const LogProvider = Wincor.UI.Diagnostics.LogProvider;
        BaseProxy = getBaseProxy({Wincor, Class, ext: getExtensions({Wincor, LogProvider}), jQuery, LogProvider});
        
        INTERFACE = {
            "Expand_GeneralConstants": {
                "attributes": ["NAME", "GENERAL1", "GENERAL2", "GENERAL3"],
                "type": "string",
                "writable": false
            },
            "f1": {
                "type": "function"
            },
            "f2": {
                type: "function",
                shadowValue: "return 1234;"
            },
            "fAsync1": {
                type: "function",
                callbackArgumentIndex: 1
            },
            "readOnlyNumericProp": {
                type: "number",
                writable: false
            },
            "stringProp1": {
                type: "string"
            },
            "readOnlyStringProp1": {
                type: "string",
                writable: false
            }
        };

        done();
    });

    // tear down after any of the specs
    afterEach(() => {
    });

    describe("ensureInterface", () => {

        it("creates a proxy accordingly", done => { // done is used for async behavior
            expect(typeof BaseProxy).toBe("function");
            const proxy = new BaseProxy();
            proxy.NAME = "FakeProxy";
            spyOn(fakeServiceInstance, "f1").and.callThrough();
            spyOn(fakeServiceInstance, "fAsync1").and.callThrough();

            const ret = proxy.ensureInterface(INTERFACE, fakeServiceInstance);
            expect(ret).toBe(true);

            expect(typeof proxy.f1).toBe("function");
            expect(typeof proxy.f2).toBe("function");
            expect(proxy.f2()).toBe(1234);
            proxy.f1();
            expect(fakeServiceInstance.f1).toHaveBeenCalledTimes(1);


            // try to change readonly attribute
            expect(proxy.readOnlyNumericProp).toBe(42);
            proxy.readOnlyNumericProp = 0;
            expect(proxy.readOnlyNumericProp).toBe(42);
            expect(fakeServiceInstance.readOnlyNumericProp).toBe(42);

            // try to change std attribute
            expect(proxy.stringProp1).toBe("Hello");
            proxy.stringProp1 = "World";
            expect(proxy.stringProp1).toBe("World");
            expect(fakeServiceInstance.stringProp1).toBe("World");

            // try to change std attribute to other type
            proxy.stringProp1 = 1;
            expect(proxy.stringProp1).toBe("World");
            expect(fakeServiceInstance.stringProp1).toBe("World");



            expect(proxy.readOnlyNumericProp).toBe(42);

            // check promisification and callback still working
            const asyncTests = [];

            asyncTests.push(proxy.fAsync1(4711)
                .then((val) => {
                    expect(val).toBe(4711);
                })
                .finally(() => {
                    expect(fakeServiceInstance.fAsync1).toHaveBeenCalled();
                })
            );

            asyncTests.push(new Wincor.UI.promise((resolve, reject) => {
                proxy.fAsync1(1234, (result) => {
                    expect(result).toBe(1234);
                    resolve();
                });
            }));


            Wincor.UI.Promise.all(asyncTests)
                .finally(done);
        });

        it("fails on wrong types", done => { // done is used for async behavior
            expect(typeof BaseProxy).toBe("function");
            const proxy = new BaseProxy();
            proxy.NAME = "FakeProxy";
            // add some attribute to interface, which is not available in fakeService
            INTERFACE.someRequiredAttrib = {
                type: "string"
            };
            const ret = proxy.ensureInterface(INTERFACE, fakeServiceInstance);
            expect(ret).toBe(false);

            done();
        });

        it("fails on missing items in objects", done => { // done is used for async behavior
            expect(typeof BaseProxy).toBe("function");
            const proxy = new BaseProxy();
            proxy.NAME = "FakeProxy";
            // add some attribute to interface, which is not available in fakeService
            INTERFACE.objectMissingAttrib = {
                type: "object",
                keys: ["DONOTHING", "BEREADY", "SPEAK"]
            };
            fakeServiceInstance.objectMissingAttrib = {
                "DONOTHING": true,
                "NOTREADY": true, // instead of required "BEREADY"
                "SPEAK": true
            };
            const ret = proxy.ensureInterface(INTERFACE, fakeServiceInstance);
            expect(ret).toBe(false);

            done();
        });

        it("prevents reassigning of proxy functions", done => { // done is used for async behavior
            expect(typeof BaseProxy).toBe("function");
            const proxy = new BaseProxy();
            proxy.NAME = "FakeProxy";
            const ret = proxy.ensureInterface(INTERFACE, fakeServiceInstance);
            expect(ret).toBe(true);
            const f = proxy.f1;
            proxy.f1 = () => {};
            expect(f === proxy.f1).toBe(true);

            done();
        });

        it("prepares the correct callbackArgumentIndex, even on mismatched length argument lists", done => { // done is used for async behavior
            expect(typeof BaseProxy).toBe("function");
            const proxy = new BaseProxy();
            proxy.NAME = "FakeProxy";
            const CALLBACK_FUNC = jasmine.createSpy("CALLBACK_FUNC");

            INTERFACE.fAsync3 = {
                type: "function",
                callbackArgumentIndex: 3
            };

            fakeServiceInstance.fAsync3 = jasmine.createSpy("fAsync3").and.callFake((a, b, c, callback) => {
                setTimeout(callback, 1);
            });
            //spyOn(fakeServiceInstance, "fAsync3");// spy does reassigning of original function, so this definitely has to be done before "ensureInterface"

            const ret = proxy.ensureInterface(INTERFACE, fakeServiceInstance);
            expect(ret).toBe(true);

            const async3Ret = proxy.fAsync3(1,2);
            expect(async3Ret.then !== void 0).toBe(true);

            async3Ret.then(() => {
                expect(CALLBACK_FUNC).not.toHaveBeenCalled();
                expect(typeof fakeServiceInstance.fAsync3.calls.first().args[0]).toBe("number");
                expect(typeof fakeServiceInstance.fAsync3.calls.first().args[1]).toBe("number");
                expect(typeof fakeServiceInstance.fAsync3.calls.first().args[2]).toBe("undefined");
                expect(typeof fakeServiceInstance.fAsync3.calls.first().args[3]).toBe("function");
                done();
            }).catch(done.fail);
        });

        it("can create crossCall stubs of foreign proxy functions", done => { // done is used for async behavior
            expect(typeof BaseProxy).toBe("function");
            const proxy = new BaseProxy();
            proxy.NAME = "FakeProxy";
            // this is what "getRemoteInterface" returns

            INTERFACE.f1.crossCall = true;
            fakeServiceInstance.crossCall = jasmine.createSpy("crossCall")
                .and.callFake((instanceName, functionName, args, serviceName) => {
                    // cross call will call other instances svc requestMap.getRemoteInterface
                    if(functionName === "getRemoteInterface") {
                        let ret = {};
                        Object.keys(INTERFACE)
                            .forEach(key => {
                                if(INTERFACE[key].crossCall) {
                                    ret[key] = INTERFACE[key];
                                }
                            });
                        return Wincor.UI.Promise.resolve(ret);
                    } else {
                        return Wincor.UI.Promise.resolve();
                    }
                });

            const ret = proxy.ensureInterface(INTERFACE, fakeServiceInstance);
            expect(ret).toBe(true);
            // we mock configservice calls to getRemoteInstanceNames

            spyOn(Wincor.UI.Service.Provider.ConfigService, "getConfiguration")
                .and.callFake(() => {
                    return Wincor.UI.Promise.resolve({"Browser": "DUMMY_BROWSER"});
                });

            Wincor.UI.Promise.all([proxy.hasRemoteInstance("GUIAPP"), proxy.hasRemoteInstance("GUIDM")])
                .then(results => {
                    expect(results[0]).toBe(true);
                    expect(results[1]).toBe(true);
                })
                .then(() => {
                    // now check cross call itself
                    const guiA = proxy.getRemoteInstance("GUIAPP");
                    const guiB = proxy.getRemoteInstance("GUIDM");
                    return Wincor.UI.Promise.all([guiA, guiB]);
                })
                .then((stubs) => {
                    const stubA = stubs[0];
                    const stubB = stubs[1];
                    expect(typeof stubA).toBe("object");
                    expect(typeof stubB).toBe("object");
                    expect(Object.keys(stubA)).toEqual(['f1', 'registerForServiceEvent', 'deregisterFromServiceEvent']);
                    expect(Object.keys(stubB)).toEqual(['f1', 'registerForServiceEvent', 'deregisterFromServiceEvent']);

                    stubA.f1(4711, "test");
                    expect(fakeServiceInstance.crossCall).toHaveBeenCalledTimes(3);
                    // check call arguments
                    expect(fakeServiceInstance.crossCall.calls.first().args[0]).toBe("GUIAPP");
                    expect(fakeServiceInstance.crossCall.calls.first().args[1]).toBe("getRemoteInterface");
                    expect(fakeServiceInstance.crossCall.calls.first().args[2]).toEqual([]);
                    expect(fakeServiceInstance.crossCall.calls.first().args[3]).toBe(fakeServiceInstance.NAME);

                    expect(fakeServiceInstance.crossCall.calls.argsFor(1)[0]).toBe("GUIDM");
                    expect(fakeServiceInstance.crossCall.calls.argsFor(1)[1]).toBe("getRemoteInterface");
                    expect(fakeServiceInstance.crossCall.calls.argsFor(1)[2]).toEqual([]);
                    expect(fakeServiceInstance.crossCall.calls.argsFor(1)[3]).toBe(fakeServiceInstance.NAME);

                    expect(fakeServiceInstance.crossCall.calls.argsFor(2)[0]).toBe("GUIAPP");
                    expect(fakeServiceInstance.crossCall.calls.argsFor(2)[1]).toBe("f1");
                    expect(fakeServiceInstance.crossCall.calls.argsFor(2)[2]).toEqual([4711, 'test']);
                    expect(fakeServiceInstance.crossCall.calls.argsFor(2)[3]).toBe(fakeServiceInstance.NAME);
                    done();
                })
                .catch(done.fail);
        });

        it("can distinguish between incoming crossCalls and standard external calls", done => { // done is used for async behavior
            expect(typeof BaseProxy).toBe("function");
            const proxy = new BaseProxy();
            proxy.NAME = "FakeProxy";
            INTERFACE.f1.crossCall = true;
            INTERFACE.f1.external = true;
            fakeServiceInstance.crossCallAcknowledge = jasmine.createSpy("crossCallAcknowledge")
                .and.callFake((targetInstance, targetService, ackId, result, extraData={}) => {
                    return Wincor.UI.Promise.resolve();
                });
            fakeServiceInstance.requestMap = new Map();

            const ret = proxy.ensureInterface(INTERFACE, fakeServiceInstance);
            expect(ret).toBe(true);
            expect(fakeServiceInstance.requestMap.has("f1")).toBe(true);

            // only getRemoteInterface will closure original function for crossCall capability
            fakeServiceInstance.requestMap.get("getRemoteInterface")({
                caller: "UNITTEST",
                acknowledgeId: "ackUnitTest1"
            });
            expect(fakeServiceInstance.crossCallAcknowledge).toHaveBeenCalledTimes(1);


            // non cross call from outside
            fakeServiceInstance.requestMap.get("f1")({});
            expect(fakeServiceInstance.crossCallAcknowledge).toHaveBeenCalledTimes(1); // this simulates a call from native part of UI
            const ccData = {
                caller: "UNITTEST",
                service: "testService",
                acknowledgeId: "ackTest",
                result: "testResult"
            };
            fakeServiceInstance.requestMap.get("f1")(ccData);
            expect(fakeServiceInstance.crossCallAcknowledge.calls.argsFor(1)).toEqual([ccData.caller, ccData.service, ccData.acknowledgeId, "f1called"]);

            done();
        });

        it("adds local and remote SERVICE_EVENTS for 'serviceEvent' attributes", done => { // done is used for async behavior
            expect(typeof BaseProxy).toBe("function");
            const proxy = new BaseProxy();
            proxy.NAME = "FakeProxy";
            INTERFACE.SERVICE_EVENTS = {
                type: "object"
            };
            fakeServiceInstance.SERVICE_EVENTS = {"INITIAL_EVENT": "INITIAL_EVENT"};
            // declare an attribute as SERVICE_EVENT
            INTERFACE.stringProp1.serviceEvent = true;
            INTERFACE.stringProp1.crossCall = true;
            let remoteInterface={};
            fakeServiceInstance.crossCallAcknowledge = jasmine.createSpy("crossCallAcknowledge")
                .and.callFake((targetInstance, targetService, ackId, result, extraData={}) => {
                    remoteInterface = result;
                    return Wincor.UI.Promise.resolve();
                });
            fakeServiceInstance.requestMap = new Map();

            const ret = proxy.ensureInterface(INTERFACE, fakeServiceInstance);
            expect(ret).toBe(true);
            // check if local SERVICE_EVENT has been generated
            expect(proxy.SERVICE_EVENTS.STRINGPROP1_CHANGED).toBeDefined();

            // only getRemoteInterface will closure original function for crossCall capability
            fakeServiceInstance.requestMap.get("getRemoteInterface")({
                caller: "UNITTEST",
                acknowledgeId: "ackUnitTest1"
            });
            expect(fakeServiceInstance.crossCallAcknowledge).toHaveBeenCalledTimes(1);
            expect(remoteInterface.SERVICE_EVENTS.value.STRINGPROP1_CHANGED).toBe("STRINGPROP1_CHANGED");
            expect(remoteInterface.SERVICE_EVENTS.value.INITIAL_EVENT).toBe("INITIAL_EVENT");
            done();
        });

        it("generates local and remote SERVICE_EVENTS object for 'serviceEvent' attributes", done => { // done is used for async behavior
            expect(typeof BaseProxy).toBe("function");
            const proxy = new BaseProxy();
            proxy.NAME = "FakeProxy";
            // declare an attribute as SERVICE_EVENT
            INTERFACE.stringProp1.serviceEvent = true;
            INTERFACE.stringProp1.crossCall = true;
            let remoteInterface={};
            fakeServiceInstance.crossCallAcknowledge = jasmine.createSpy("crossCallAcknowledge")
                .and.callFake((targetInstance, targetService, ackId, result, extraData={}) => {
                    remoteInterface = result;
                    return Wincor.UI.Promise.resolve();
                });
            fakeServiceInstance.requestMap = new Map();

            const ret = proxy.ensureInterface(INTERFACE, fakeServiceInstance);
            expect(ret).toBe(true);
            // check if local SERVICE_EVENT has been generated
            expect(proxy.SERVICE_EVENTS.STRINGPROP1_CHANGED).toBeDefined();

            // only getRemoteInterface will closure original function for crossCall capability
            fakeServiceInstance.requestMap.get("getRemoteInterface")({
                caller: "UNITTEST",
                acknowledgeId: "ackUnitTest1"
            });
            expect(fakeServiceInstance.crossCallAcknowledge).toHaveBeenCalledTimes(1);
            expect(Wincor.hasMember(remoteInterface, "SERVICE_EVENTS.value.STRINGPROP1_CHANGED")).toBe(true);
            expect(remoteInterface.SERVICE_EVENTS.value.STRINGPROP1_CHANGED).toBe("STRINGPROP1_CHANGED");
            done();
        });

        it("sends service events on change of attributes also for non-crossCall attributes", done => { // done is used for async behavior
            const NEW_VALUE = "ATTR_CHANGED";
            expect(typeof BaseProxy).toBe("function");
            const proxy = new BaseProxy();
            proxy.NAME = "FakeProxy";
            // declare an attribute as SERVICE_EVENT
            INTERFACE.stringProp1.serviceEvent = true;
            let remoteInterface={};
            fakeServiceInstance.fireServiceEvent = jasmine.createSpy("fireServiceEvent")
                .and.callFake(() => {
                    // generated setter is async, so we wait for the call here
                    expect(fakeServiceInstance.fireServiceEvent).toHaveBeenCalledTimes(1);
                    expect(fakeServiceInstance.fireServiceEvent).toHaveBeenCalledWith("STRINGPROP1_CHANGED", NEW_VALUE);
                    done();
                });
            fakeServiceInstance.crossCallAcknowledge = jasmine.createSpy("crossCallAcknowledge")
                .and.callFake((targetInstance, targetService, ackId, result, extraData={}) => {
                    remoteInterface = result;
                    return Wincor.UI.Promise.resolve();
                });
            fakeServiceInstance.requestMap = new Map();

            const ret = proxy.ensureInterface(INTERFACE, fakeServiceInstance);
            expect(ret).toBe(true);
            fakeServiceInstance.stringProp1 = NEW_VALUE;
        });

        it("generates only local SERVICE_EVENTS object for 'serviceEvent' attributes that are non crossCall", done => { // done is used for async behavior
            expect(typeof BaseProxy).toBe("function");
            const proxy = new BaseProxy();
            proxy.NAME = "FakeProxy";
            // declare an attribute as SERVICE_EVENT
            INTERFACE.stringProp1.serviceEvent = true;
            let remoteInterface={};
            fakeServiceInstance.crossCallAcknowledge = jasmine.createSpy("crossCallAcknowledge")
                .and.callFake((targetInstance, targetService, ackId, result, extraData={}) => {
                    remoteInterface = result;
                    return Wincor.UI.Promise.resolve();
                });
            fakeServiceInstance.requestMap = new Map();

            const ret = proxy.ensureInterface(INTERFACE, fakeServiceInstance);
            expect(ret).toBe(true);
            // check if local SERVICE_EVENT has been generated
            expect(proxy.SERVICE_EVENTS.STRINGPROP1_CHANGED).toBeDefined();

            // only getRemoteInterface will closure original function for crossCall capability
            fakeServiceInstance.requestMap.get("getRemoteInterface")({
                caller: "UNITTEST",
                acknowledgeId: "ackUnitTest1"
            });
            expect(fakeServiceInstance.crossCallAcknowledge).toHaveBeenCalledTimes(1);
            expect(Wincor.hasMember(remoteInterface, "SERVICE_EVENTS.value.STRINGPROP1_CHANGED")).toBe(false);
            expect(remoteInterface.SERVICE_EVENTS.value.STRINGPROP1_CHANGED).toBeUndefined();
            done();
        });
    });

    describe("getRemoteInstance", () => {

        it("works on correct serviceInstance if delayed", done => { // done is used for async behavior
            const INTERFACE2 = {
                "Expand_GeneralConstants": {
                    "attributes": ["NAME", "GENERAL1", "GENERAL2", "GENERAL3"],
                    "type": "string",
                    "writable": false
                },
                "f1": {
                    "type": "function"
                },
                "someNumberProp": {
                    type: "number",
                    writable: false
                }
            };

            const proxy = new BaseProxy();
            const callingProxy = new BaseProxy();
            const fakeServiceInstance2 = jQuery.extend({}, fakeServiceInstance);
            fakeServiceInstance2.NAME = "FakeServiceInstance2";
            fakeServiceInstance2.someNumberProp = 2;
            fakeServiceInstance2.requestMap = new Map();
            fakeServiceInstance.requestMap = new Map();
            INTERFACE.f2.crossCall = true;
            fakeServiceInstance.test = 1234;
            INTERFACE.test = {
                type: "number",
                crossCall: true
            };

            spyOn(fakeServiceInstance, "crossCallAcknowledge").and.callFake(
                (...args) => {
                    return Promise.resolve({test: {
                        type: "number",
                        crossCall: true
                    }});
                }
            );

            const ret = proxy.ensureInterface(INTERFACE, fakeServiceInstance);
            expect(ret).toBe(true);

            spyOn(proxy, "hasRemoteInstance").and.returnValue(Promise.resolve(true));
            fakeServiceInstance.crossCall = () => {
                return new Promise((resolve) => {
                    callingProxy.ensureInterface(INTERFACE2, fakeServiceInstance2);
                    window.setTimeout(() => {
                        resolve({test: {
                            type: "number",
                            crossCall: true
                        }});

                    }, 100);
                });
            };
            proxy.getRemoteInstance("GUITEST2")
                .then(() => {
                    done();
                });
        });
    });
});

