/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ PTService_test.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

import { WincorNamespace } from "../../../../../GUI_UnitTesting/NamespaceMock.js";
import getExtensions from "../../../../lib/internal/wn.UI.extensions.js";
import getServiceClass from "../../../../core/service/lib/PTService.js";

let Wincor;
let Svc;
const NAME = "PTService";
const FakeServiceProvider = {};

/*global jQuery:false*/
describe("PTService", () => {

    // setup before any of the specs
    beforeEach(done => {
        Wincor = new WincorNamespace();
        
        class BaseService {
            constructor(name, {ServiceProvider}) {
            
            }
            
            logger = console;
            REQUEST = {MY:"REQUESTOBJECT"};
            
            EXTENDED_REQUEST_OBJECT = Object.assign(Object.assign({}, this.REQUEST), {
                service: NAME,
                methodName: "FrmResolve",
                FWName: "",
                FWFuncID: 0,
                param1: "",
                meta1: [],
                param2: "",
                meta2: [],
                param3: "",
                meta3: [],
                param4: "",
                meta4: ["NULL", 0],
                param5: "",
                meta5: ["NULL", 0],
                paramUL: 0,
                RC: -1
            });
            
            EXTENDED_ASYNC_REQUEST_OBJECT = Object.assign(Object.assign({}, this.REQUEST), {
                service: NAME,
                methodName: "FrmAsyncResolve",
                FWName: "",
                FWFuncID: 0,
                param1: "",
                meta1: [],
                param2: "",
                meta2: [],
                param3: "",
                meta3: [],
                param4: "",
                meta4: ["NULL", 0],
                param5: "",
                meta5: ["NULL", 0],
                paramUL: 0,
                RC: -1
            });
            
            eventMap = {
                set: jasmine.createSpy("eventMap.set").and.callFake((id, cb) => {
                    setTimeout(cb.bind(null, {RC: 0}), 1);
                    //cb.bind(null, {RC: 0})
                }),
                get: jasmine.createSpy("eventMap.get"),
                delete: jasmine.createSpy("eventMap.delete")
            };
            
            sendRequest = jasmine.createSpy("sendRequest").and.callFake((id, cb) => {
                setTimeout(cb.bind(null, {RC: 0}), 1);
                //cb.bind(null, {RC: 0})
            });
            
            serviceProvider = {
                getInstanceName: jasmine.createSpy("getInstanceName").and.callFake(() => {
                    return this.instanceName || "GUISRCINST"; // <- to be set before test if something special is needed
                })
            };
        }
        
        const LogProvider = Wincor.UI.Diagnostics.LogProvider;
        
        Svc = getServiceClass({ Wincor, ext: getExtensions({Wincor, LogProvider}), LogProvider, BaseService });
        done();
    });

    // tear down after any of the specs
    afterEach(() => {
    });
    

    it("initializes members on creation", done => { // done is used for async behavior
        const ptService = new Svc(NAME, FakeServiceProvider);
        // check if PTService does call super on it's baseclass
        expect(ptService.FRM_RESOLVE_REQUEST).toEqual(ptService.EXTENDED_REQUEST_OBJECT);
        expect(ptService.FRM_ASYNC_RESOLVE_REQUEST).toEqual(ptService.EXTENDED_ASYNC_REQUEST_OBJECT);
        done();
    });

    it("FrmResolve triggers appropriate request", done => { // done is used for async behavior
        const ptService = new Svc(NAME, FakeServiceProvider);
        expect(typeof ptService.FrmResolve).toBe("function");
        const cb = () => {};
        const req = {
            FWName: "TestFW",
            FWFuncID: 13
        };
        ptService.FrmResolve(req, cb);
        expect(ptService.sendRequest).toHaveBeenCalledWith(Object.assign({}, ptService.EXTENDED_REQUEST_OBJECT, req), cb);
        expect(ptService.sendRequest.calls.first().args[0].FWName).toBe("TestFW");
        expect(ptService.sendRequest.calls.first().args[0].FWFuncID).toBe(13);
        done();
    });

    it("supports crossCalls to other UI instances", done => { // done is used for async behavior
        const ptService = new Svc(NAME, FakeServiceProvider);
        expect(typeof ptService.FrmResolve).toBe("function");
        Wincor.UI.Gateway.prototype.REQUEST = {};
        const cb = () => {};
        const req = {
            FWName: "GUITEST",
            FWFuncID: 60
        };
        ptService.EXTENDED_REQUEST_OBJECT.param1 = '{"service":"PTService","type":"request","methodName":"testFunction","args":["one",2,{"three":3}],"caller":"GUISRCINST","acknowledgeId":"GUISRCINST->GUITEST.PTService::testFunction_crossCall_1","extraData":{},"result":""}';
        ptService.EXTENDED_REQUEST_OBJECT.meta1 = [ 'CHAR_UTF8', -1 ];
        ptService.EXTENDED_REQUEST_OBJECT.meta2 = [ 'NULL', 0 ];
        ptService.EXTENDED_REQUEST_OBJECT.meta3 = [ 'NULL', 0 ];
        ptService.EXTENDED_REQUEST_OBJECT.meta4 = [ 'NULL', 0 ];
        ptService.EXTENDED_REQUEST_OBJECT.meta5 = [ 'NULL', 0 ];
        const promise = ptService.crossCall("GUITEST", "testFunction", ["one", 2, {three: 3}]);
        // eventMap entry should have been set
        promise
            .then(() => {
                // function is private to crossCall
                expect(ptService.sendRequest).toHaveBeenCalledWith(Object.assign({}, ptService.EXTENDED_REQUEST_OBJECT, req), jasmine.any(Function));
                // check if function has been deleted from map after resolving
                expect(ptService.eventMap.delete).toHaveBeenCalledWith(JSON.parse(ptService.sendRequest.calls.first().args[0].param1).acknowledgeId);
                expect(ptService.sendRequest.calls.first().args[0].FWName).toBe("GUITEST");
                expect(ptService.sendRequest.calls.first().args[0].FWFuncID).toBe(60);
                done();
            })
            .catch(done.fail);
    });

    it("supports sending crossCallAcknowledge", done => { // done is used for async behavior
        const ptService = new Svc(NAME, FakeServiceProvider);
        expect(typeof ptService.FrmResolve).toBe("function");
        Wincor.UI.Gateway.prototype.REQUEST = {};
        const req = {
            FWName: "GUITEST",
            FWFuncID: 60
        };
        ptService.EXTENDED_REQUEST_OBJECT.param1 = '{"service":"testService","type":"event","eventName":"testCCAAcknowledgeId","result":"testResult","extraData":{"extraData":1234}}';
        ptService.EXTENDED_REQUEST_OBJECT.meta1 = [ 'CHAR_UTF8', -1 ];
        ptService.EXTENDED_REQUEST_OBJECT.meta2 = [ 'NULL', 0 ];
        ptService.EXTENDED_REQUEST_OBJECT.meta3 = [ 'NULL', 0 ];
        ptService.EXTENDED_REQUEST_OBJECT.meta4 = [ 'NULL', 0 ];
        ptService.EXTENDED_REQUEST_OBJECT.meta5 = [ 'NULL', 0 ];
        ptService.crossCallAcknowledge("GUITEST", "testService", "testCCAAcknowledgeId", "testResult", {extraData: 1234})
            .then(() => {
                expect(ptService.sendRequest).toHaveBeenCalledWith(Object.assign({}, ptService.EXTENDED_REQUEST_OBJECT, req), jasmine.any(Function));
                expect(ptService.sendRequest.calls.first().args[0].FWName).toBe("GUITEST");
                expect(ptService.sendRequest.calls.first().args[0].FWFuncID).toBe(60);
                done();
            })
            .catch(e => {
                done.fail(e.stack);
            });
    });

    xit("supports crossCallEvents to other UI instances", done => { // done is used for async behavior
        const ptService = new Svc(NAME, FakeServiceProvider);
        expect(typeof ptService.FrmResolve).toBe("function");
        Wincor.UI.Gateway.prototype.REQUEST = {};
        const cb = () => {};
        const req = {
            FWName: "GUITEST",
            FWFuncID: 60
        };
        ptService.EXTENDED_REQUEST_OBJECT.param1 = '{"service":"testService","type":"event","eventName":"testEventId","caller":"GUISRCINST","acknowledgeId":"GUISRCINST->GUITEST.PTService:testEventId_crossCallEvent_1","eventData":{"eventData":["one",2,{"three":3}]}}';
        ptService.EXTENDED_REQUEST_OBJECT.meta1 = [ 'CHAR_UTF8', -1 ];
        ptService.EXTENDED_REQUEST_OBJECT.meta2 = [ 'NULL', 0 ];
        ptService.EXTENDED_REQUEST_OBJECT.meta3 = [ 'NULL', 0 ];
        ptService.EXTENDED_REQUEST_OBJECT.meta4 = [ 'NULL', 0 ];
        ptService.EXTENDED_REQUEST_OBJECT.meta5 = [ 'NULL', 0 ];
        const promise = ptService.crossCallEvent("GUITEST", "testService", "testEventId", {eventData: ["one", 2, {three: 3}]});
        // eventMap entry should have been set
        promise
            .then(() => {
                // function is private to crossCall
                expect(ptService.sendRequest).toHaveBeenCalledWith(Object.assign({}, ptService.EXTENDED_REQUEST_OBJECT, req), jasmine.any(Function));
                // check if function has been deleted from map after resolving
                expect(ptService.eventMap.delete).toHaveBeenCalledWith(JSON.parse(ptService.EXTENDED_REQUEST_OBJECT.param1).acknowledgeId);
                expect(ptService.sendRequest.calls.first().args[0].FWName).toBe("GUITEST");
                expect(ptService.sendRequest.calls.first().args[0].FWFuncID).toBe(60);
                done();
            })
            .catch(done.fail);
    });
});

