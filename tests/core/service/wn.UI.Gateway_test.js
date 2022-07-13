/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ wn.UI.Gateway_test.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

import { WincorNamespace } from "../../../../GUI_UnitTesting/NamespaceMock.js";
import getGateway from "../../../../GUIAPP/core/service/wn.UI.Gateway.js";

let Wincor;
let Gateway;

describe("wn.UI.Gateway", () => {
    // setup before any of the specs
    beforeEach(done => {
        Wincor = new WincorNamespace();
        Gateway = getGateway({Wincor, LogProvider: Wincor.UI.Diagnostics.LogProvider});
        done();
    });

    // tear down after any of the specs
    afterEach(() => {
    });

    describe("init", () => {
        it("setName", async() => { // done is used for async behavior
            const gw = new Gateway();
            gw.setName("WEBSOCKET");
            expect(gw.gatewayName).toBe("WEBSOCKET");
        });

        it("getName", async() => { // done is used for async behavior
            const gw = new Gateway();
            gw.gatewayName = "WEBSOCKET";
            expect(gw.getName()).toBe("WEBSOCKET");
        });

    });
    
    describe("bridge", () => {
        
        it("getBridge", async() => { // done is used for async behavior
            const gw = new Gateway();
            const SOCKET = {url: "ws://127.0.0.1:8091/"};
            gw.gatewayName = "WEBSOCKET";
            gw.setBridge(SOCKET);
            let bridge = gw.getBridge();
            expect(bridge.socket).toEqual(SOCKET);
        });

        it("setBridge undefined argument", async() => { // done is used for async behavior
            const gw = new Gateway();
            let bridge = gw.setBridge(void 0);
            expect(bridge).toBe(null);
        });

        it("setBridge", async() => { // done is used for async behavior
            const gw = new Gateway();
            const SOCKET = {url: "ws://127.0.0.1:8091/"};
            gw.gatewayName = "WEBSOCKET";
            let bridge = gw.setBridge(SOCKET);
            expect(bridge.socket).toEqual(SOCKET);
            expect(bridge.name).toBe("WEBSOCKET");
        });

        it("setBridge called twice for same bridge", async() => { // done is used for async behavior
            const gw = new Gateway();
            const SOCKET1 = {url: "ws://127.0.0.1:8091/"};
            const SOCKET2 = {url: "ws://127.0.0.1:8092/"};
            gw.gatewayName = "WEBSOCKET";
            let bridge = gw.setBridge(SOCKET1);
            expect(bridge.socket).toEqual(SOCKET1);
            expect(bridge.name).toBe("WEBSOCKET");
            // second time
            bridge = gw.setBridge(SOCKET2);
            expect(bridge.name).toBe("WEBSOCKET");
            expect(bridge.socket).toEqual(SOCKET2);
        });

        it("setBridge multiple bridges", async() => { // done is used for async behavior
            const gw = new Gateway();
            const SOCKET1 = {url: "ws://127.0.0.1:8091/"};
            const SOCKET2 = {url: "ws://127.0.0.1:8092/"};
            gw.gatewayName = "WEBSOCKET";
            let bridge = gw.setBridge(SOCKET1);
            expect(bridge.socket).toEqual(SOCKET1);
            expect(bridge.name).toBe("WEBSOCKET");
            // second time
            gw.gatewayName = "WEBSOCKET_2";
            bridge = gw.setBridge(SOCKET2);
            expect(bridge.name).toBe("WEBSOCKET_2");
            expect(bridge.socket).toEqual(SOCKET2);
            // check the first bridge is already there
            bridge = gw.getBridge("WEBSOCKET");
            expect(bridge.name).toBe("WEBSOCKET");
            expect(bridge.socket).toEqual(SOCKET1);
        });

    });
});

