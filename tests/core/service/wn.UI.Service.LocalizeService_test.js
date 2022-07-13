/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ wn.UI.Service.LocalizeService_test.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

import { WincorNamespace } from "../../../../GUI_UnitTesting/NamespaceMock.js";
import getExtensions from "../../../lib/internal/wn.UI.extensions.js";
import getServiceClass from "../../../../GUIAPP/core/service/wn.UI.Service.LocalizeService.js";

let Wincor;
let Svc;

/*global jQuery:false*/
describe("LocalizeService", () => {

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

    describe("initialization", () => {
        it("uses correct logical name", async done => {
            try {
                const localizeSvc = new Svc();
                expect(localizeSvc.NAME).toBe("LocalizeService");
                done();
            } catch(e) {
                done.fail(e);
            }
        });

    });

    describe("argument checks", () => {
        it("for getText keys length", async done => {
            try {
                const localizeSvc = new Svc();
                let errText = [""];
                spyOn(Wincor.UI.Diagnostics.LogProvider, "error").and.callFake(text => {
                    errText[0] = text;
                });
                spyOn(Wincor.UI.Service.Provider, "propagateError");

                localizeSvc.ERROR_TYPE = {REQUEST: "REQUEST"};
                await localizeSvc.getText(["G".repeat(262145), "GUI_TEST_1", "GUI_TEST_2"]);
                expect(Wincor.UI.Diagnostics.LogProvider.error).toHaveBeenCalled();
                expect(Wincor.UI.Service.Provider.propagateError).toHaveBeenCalled();
                expect(errText.length > 0).toBe(true);
                expect(errText[0].includes("LocalizeService::getText() too many or too long text keys argument requested. Please check your keys array argument.")).toBe(true);
                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("for getText keys count", async done => {
            try {
                const localizeSvc = new Svc();
                let errText = [""];
                spyOn(Wincor.UI.Diagnostics.LogProvider, "error").and.callFake(text => {
                    errText[0] = text;
                });
                spyOn(Wincor.UI.Service.Provider, "propagateError");
        
                localizeSvc.ERROR_TYPE = {REQUEST: "REQUEST"};
                let KEYS = Array(2049).fill("TEST_KEY");
                KEYS.forEach((item, i, arr) => {
                    return arr[i] = item + i;
                });
                await localizeSvc.getText(KEYS);
                expect(Wincor.UI.Diagnostics.LogProvider.error).toHaveBeenCalled();
                expect(Wincor.UI.Service.Provider.propagateError).toHaveBeenCalled();
                expect(errText.length > 0).toBe(true);
                expect(errText[0].includes("LocalizeService::getText() too many or too long text keys argument requested. Please check your keys array argument.")).toBe(true);
                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("for getText unique keys", async done => {
            try {
                const localizeSvc = new Svc();
                let errText = [""];
                spyOn(Wincor.UI.Diagnostics.LogProvider, "error").and.callFake(text => {
                    errText[0] = text;
                });
                spyOn(Wincor.UI.Service.Provider, "propagateError");
        
                localizeSvc.ERROR_TYPE = {REQUEST: "REQUEST"};
                let KEYS = ["KEY_1", "KEY_1"];
                await localizeSvc.getText(KEYS);
                expect(Wincor.UI.Diagnostics.LogProvider.error).toHaveBeenCalled();
                expect(Wincor.UI.Service.Provider.propagateError).not.toHaveBeenCalled();
                expect(errText.length > 0).toBe(true);
                expect(errText[0].includes("Warning: LocalizeService::getText() double key detected: KEY_1")).toBe(true);
                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("for getText null keys", async done => {
            try {
                const localizeSvc = new Svc();
                let errText = [""];
                spyOn(Wincor.UI.Diagnostics.LogProvider, "error").and.callFake(text => {
                    errText[0] = text;
                });
                spyOn(Wincor.UI.Service.Provider, "propagateError");
        
                localizeSvc.ERROR_TYPE = {REQUEST: "REQUEST"};
                let KEYS = ["KEY_1", null];
                await localizeSvc.getText(KEYS);
                expect(Wincor.UI.Diagnostics.LogProvider.error).toHaveBeenCalled();
                expect(Wincor.UI.Service.Provider.propagateError).toHaveBeenCalled();
                expect(errText.length > 0).toBe(true);
                expect(errText[0].includes("LocalizeService::getText() keys contains null or undefined.")).toBe(true);
                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("for getText undefined keys", async done => {
            try {
                const localizeSvc = new Svc();
                let errText = [""];
                spyOn(Wincor.UI.Diagnostics.LogProvider, "error").and.callFake(text => {
                    errText[0] = text;
                });
                spyOn(Wincor.UI.Service.Provider, "propagateError");
        
                localizeSvc.ERROR_TYPE = {REQUEST: "REQUEST"};
                let KEYS = ["KEY_1", void 0];
                await localizeSvc.getText(KEYS);
                expect(Wincor.UI.Diagnostics.LogProvider.error).toHaveBeenCalled();
                expect(Wincor.UI.Service.Provider.propagateError).toHaveBeenCalled();
                expect(errText.length > 0).toBe(true);
                expect(errText[0].includes("LocalizeService::getText() keys contains null or undefined.")).toBe(true);
                done();
            } catch(e) {
                done.fail(e);
            }
        });
    });
});

