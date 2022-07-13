/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ wn.UI.Gateway.WebSocket_test.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/


import { WincorNamespace } from "../../../../GUI_UnitTesting/NamespaceMock.js";
import getExtensions from "../../../lib/internal/wn.UI.extensions.js";
import getWebSocket from "../../../../GUIAPP/core/service/wn.UI.Gateway.WebSocket.js";

let Wincor;
let WebSocket;

describe("wn.UI.Gateway.WebSocket", () => {

    // setup before any of the specs
    beforeEach(done => {
        Wincor = new WincorNamespace();
        
        class Gateway {
            setName() {}
            onMessage() {}
            onClose() {}
            send() {}
        }
        
        WebSocket = getWebSocket({Wincor, ext: getExtensions({Wincor, LogProvider: Wincor.UI.Diagnostics.LogProvider}), Gateway});
        done();
    });

    // tear down after any of the specs
    afterEach(() => {
    });

    describe("connection", () => {

        it("establishConnection - ok handling", async() => { // done is used for async behavior
            const ws = new WebSocket();
            const BRIDGE = {};
            const RESOLVE_MSG = "resolved due to succeeded connection";
            let FAKE_SOCKET = {};
            spyOn(window, "WebSocket").and.returnValue(FAKE_SOCKET);
            ws.setBridge = jasmine.createSpy("setBridge").and.returnValue(BRIDGE);
            spyOn(ws, "onOpen").and.callFake(event => {
                expect(typeof event === "object").toBe(true);
                expect(event.msg).toBe(RESOLVE_MSG);
            });
            
            ws.establishConnection()
                .then(() => {
                    expect(ws.onOpen).toHaveBeenCalled();
                });
            FAKE_SOCKET.onopen({msg: RESOLVE_MSG});
            expect(ws.setBridge).toHaveBeenCalled();
        });
        
        it("establishConnection - error handling", async() => { // done is used for async behavior
            const ws = new WebSocket();
            const BRIDGE = {};
            const REJECT_MSG = "rejected due to we don's have a WSS yet";
            let promise;
            let FAKE_SOCKET = {};
            spyOn(window, "WebSocket").and.returnValue(FAKE_SOCKET);
            ws.setBridge = jasmine.createSpy("setBridge").and.returnValue(BRIDGE);
            spyOn(ws, "onClose").and.callFake(event => {
                expect(typeof event === "object").toBe(true);
            });
            spyOn(ws, "onError").and.callFake(event => {
                expect(typeof event === "object").toBe(true);
                expect(typeof BRIDGE.established === "function").toBe(true);
                expect(typeof BRIDGE.connectionFailed === "function") .toBe(true);
                expect(promise.isPending()).toBe(true);
                BRIDGE.connectionFailed(REJECT_MSG); // reject the promise
            });
            
            promise = ws.establishConnection()
                .catch(e => {
                    expect(e).toBe(REJECT_MSG);
                    expect(ws.onError).toHaveBeenCalled();
                });
            FAKE_SOCKET.onerror({});
            FAKE_SOCKET.onclose({});
            expect(ws.setBridge).toHaveBeenCalled();
        });
        
        it("checkConnection for reestablishment", async() => { // done is used for async behavior
            const ws = new WebSocket();
            let isSocketOkCalls = 0;
            spyOn(ws, "isSocketOk").and.callFake(() => {
                isSocketOkCalls++;
                return isSocketOkCalls === 2;
            });
            spyOn(ws, "establishConnection").and.returnValue(Promise.resolve(true));
            let isOk = await ws.checkConnection();
            expect(isOk).toBe(true);
            expect(ws.establishConnection).toHaveBeenCalled();
            expect(ws.isSocketOk).toHaveBeenCalledTimes(2);
        });

        it("checkConnection is ok", async() => { // done is used for async behavior
            const ws = new WebSocket();
            spyOn(ws, "isSocketOk").and.returnValue(true);
            spyOn(ws, "establishConnection");
            let isOk = await ws.checkConnection();
            expect(isOk).toBe(true);
            expect(ws.establishConnection).not.toHaveBeenCalled();
            expect(ws.isSocketOk).toHaveBeenCalledTimes(1);
        });

        it("send on no connection", async() => { // done is used for async behavior
            const ws = new WebSocket();
            const BRIDGE = {
                dataTobeSend: []
            };
            const MSG = {msg: "here is a message"};
            spyOn(ws, "isSocketOk").and.returnValue(false);
            ws.getBridge = jasmine.createSpy("getBridge").and.returnValue(BRIDGE);
            spyOn(ws, "checkConnection").and.returnValue(Promise.resolve());
            jasmine.clock().install();
            ws.send(MSG);
            expect(BRIDGE.dataTobeSend[0]).toEqual(MSG); // message buffer has been filled
            jasmine.clock().tick(5001);
            expect(ws.checkConnection).toHaveBeenCalled(); // connection should be tried to reestablished
            expect(ws.isSocketOk).toHaveBeenCalledTimes(1);
            jasmine.clock().uninstall();
        });

    });
});

