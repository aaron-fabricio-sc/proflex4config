/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ wn.UI.Service.DataService_test.js 4.3.1-210212-21-06af7f4f-1a04bc7d

*/

import { WincorNamespace } from "../../../../GUI_UnitTesting/NamespaceMock.js";
import getExtensions from "../../../lib/internal/wn.UI.extensions.js";
import getServiceClass from "../../../../GUIAPP/core/service/wn.UI.Service.DataService.js";

let Wincor;
let Svc;

/*global jQuery:false*/
describe("DataService", () => {
    // setup before any of the specs
    beforeEach(done => {
        Wincor = new WincorNamespace();

        class PTService extends Wincor.UI.Service.PTService {
            hasReceivers = () => true;

            translateResponse() { }

            sendRequest() { }

            sendEvent() { }

            sendResponse() { }
        }

        const LogProvider = Wincor.UI.Diagnostics.LogProvider;
        Svc = getServiceClass({ Wincor, jQuery, ext: getExtensions({ Wincor, LogProvider }), LogProvider, PTService });

        done();
    });

    // tear down after any of the specs
    afterEach(() => { });

    describe("initialization", () => {
        it("uses correct logical name", async done => {
            try {
                const dataSvc = new Svc();
                expect(dataSvc.NAME).toBe("DataService");
                done();
            } catch(e) {
                done.fail(e);
            }
        });
    });

    describe("argument checks", () => {
        it("for getValues keys length", async done => {
            try {
                const dataSvc = new Svc();
                let errText = [""];
                spyOn(Wincor.UI.Diagnostics.LogProvider, "error").and.callFake(text => {
                    errText[0] = text;
                });
                spyOn(Wincor.UI.Service.Provider, "propagateError");

                dataSvc.ERROR_TYPE = { REQUEST: "REQUEST" };
                await dataSvc.getValues(["PROP_A".repeat(132000), "PROP_B", "CCTAFW_PROP_C"]);
                expect(Wincor.UI.Diagnostics.LogProvider.error).toHaveBeenCalled();
                expect(Wincor.UI.Service.Provider.propagateError).toHaveBeenCalled();
                expect(errText.length > 0).toBe(true);
                expect(errText[0].includes("DataService::getValues() too many or too long property keys argument requested.")).toBe(true);
                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("for getValues unique keys", async done => {
            try {
                const dataSvc = new Svc();
                let errText = [""];
                spyOn(Wincor.UI.Diagnostics.LogProvider, "error").and.callFake(text => {
                    errText[0] = text;
                });
                spyOn(Wincor.UI.Service.Provider, "propagateError");

                dataSvc.ERROR_TYPE = { REQUEST: "REQUEST" };
                await dataSvc.getValues(["PROP_A", "PROP_B", "PROP_B"]);
                expect(Wincor.UI.Diagnostics.LogProvider.error).toHaveBeenCalled();
                expect(Wincor.UI.Service.Provider.propagateError).not.toHaveBeenCalled();
                expect(errText.length > 0).toBe(true);
                expect(errText[0].includes("Warning: DataService::getValues() double key detected: PROP_B")).toBe(true);
                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("for setValues unique keys", async done => {
            try {
                const dataSvc = new Svc();
                let errText = [""];
                spyOn(Wincor.UI.Diagnostics.LogProvider, "error").and.callFake(text => {
                    errText[0] = text;
                });
                spyOn(Wincor.UI.Service.Provider, "propagateError");

                dataSvc.ERROR_TYPE = { REQUEST: "REQUEST" };
                await dataSvc.setValues(["PROP_A", "PROP_B", "PROP_B"], ["1", "2", "3"]);
                expect(Wincor.UI.Diagnostics.LogProvider.error).toHaveBeenCalled();
                expect(Wincor.UI.Service.Provider.propagateError).not.toHaveBeenCalled();
                expect(errText.length > 0).toBe(true);
                expect(errText[0].includes("Warning: DataService::setValues() double key detected: PROP_B")).toBe(true);
                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("for setValues null keys", async done => {
            try {
                const dataSvc = new Svc();
                let errText = [""];
                spyOn(Wincor.UI.Diagnostics.LogProvider, "error").and.callFake(text => {
                    errText[0] = text;
                });
                spyOn(Wincor.UI.Service.Provider, "propagateError");

                dataSvc.ERROR_TYPE = { REQUEST: "REQUEST" };
                await dataSvc.setValues(["PROP_A", null, "PROP_B"], ["1", "2", "3"]);
                expect(Wincor.UI.Diagnostics.LogProvider.error).toHaveBeenCalled();
                expect(Wincor.UI.Service.Provider.propagateError).toHaveBeenCalled();
                expect(errText.length > 0).toBe(true);
                expect(errText[0].includes("DataService::setValues() keys contains null or undefined.")).toBe(true);
                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("for setValues undefined keys", async done => {
            try {
                const dataSvc = new Svc();
                let errText = [""];
                spyOn(Wincor.UI.Diagnostics.LogProvider, "error").and.callFake(text => {
                    errText[0] = text;
                });
                spyOn(Wincor.UI.Service.Provider, "propagateError");

                dataSvc.ERROR_TYPE = { REQUEST: "REQUEST" };
                await dataSvc.setValues(["PROP_A", void 0, "PROP_B"], ["1", "2", "3"]);
                expect(Wincor.UI.Diagnostics.LogProvider.error).toHaveBeenCalled();
                expect(Wincor.UI.Service.Provider.propagateError).toHaveBeenCalled();
                expect(errText.length > 0).toBe(true);
                expect(errText[0].includes("DataService::setValues() keys contains null or undefined.")).toBe(true);
                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("for setValues null values", async done => {
            try {
                const dataSvc = new Svc();
                let errText = [""];
                spyOn(Wincor.UI.Diagnostics.LogProvider, "error").and.callFake(text => {
                    errText[0] = text;
                });
                spyOn(Wincor.UI.Service.Provider, "propagateError");

                dataSvc.ERROR_TYPE = { REQUEST: "REQUEST" };
                await dataSvc.setValues(["PROP_A", "PROP", "PROP_B"], ["1", null, "3"]);
                expect(Wincor.UI.Diagnostics.LogProvider.error).toHaveBeenCalled();
                expect(Wincor.UI.Service.Provider.propagateError).toHaveBeenCalled();
                expect(errText.length > 0).toBe(true);
                expect(errText[0].includes("DataService::setValues() values contains null or undefined.")).toBe(true);
                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("for setValues undefined values", async done => {
            try {
                const dataSvc = new Svc();
                let errText = [""];
                spyOn(Wincor.UI.Diagnostics.LogProvider, "error").and.callFake(text => {
                    errText[0] = text;
                });
                spyOn(Wincor.UI.Service.Provider, "propagateError");

                dataSvc.ERROR_TYPE = { REQUEST: "REQUEST" };
                await dataSvc.setValues(["PROP_A", "PROP", "PROP_B"], ["1", void 0, "3"]);
                expect(Wincor.UI.Diagnostics.LogProvider.error).toHaveBeenCalled();
                expect(Wincor.UI.Service.Provider.propagateError).toHaveBeenCalled();
                expect(errText.length > 0).toBe(true);
                expect(errText[0].includes("DataService::setValues() values contains null or undefined.")).toBe(true);
                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("for getValues keys count", async done => {
            try {
                const dataSvc = new Svc();
                let errText = [""];
                spyOn(Wincor.UI.Diagnostics.LogProvider, "error").and.callFake(text => {
                    errText[0] = text;
                });
                spyOn(Wincor.UI.Service.Provider, "propagateError");

                dataSvc.ERROR_TYPE = { REQUEST: "REQUEST" };
                let KEYS = Array(1100).fill("TEST_KEY");
                KEYS.forEach((item, i, arr) => {
                    return (arr[i] = item + i);
                });
                await dataSvc.getValues(KEYS);
                expect(Wincor.UI.Diagnostics.LogProvider.error).toHaveBeenCalled();
                expect(Wincor.UI.Service.Provider.propagateError).toHaveBeenCalled();
                expect(errText.length > 0).toBe(true);
                expect(errText[0].includes("DataService::getValues() too many or too long property keys argument requested.")).toBe(true);
                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("for setValues keys/values unequal size", async done => {
            try {
                const dataSvc = new Svc();
                let errText = [""];
                spyOn(Wincor.UI.Diagnostics.LogProvider, "error").and.callFake(text => {
                    errText[0] = text;
                });
                spyOn(Wincor.UI.Service.Provider, "propagateError");

                dataSvc.ERROR_TYPE = { REQUEST: "REQUEST" };
                let KEYS = ["KEY_1", "KEY_2"];
                let VALUES = ["Test"];
                await dataSvc.setValues(KEYS, VALUES);
                expect(Wincor.UI.Diagnostics.LogProvider.error).toHaveBeenCalled();
                expect(Wincor.UI.Service.Provider.propagateError).toHaveBeenCalled();
                expect(errText.length > 0).toBe(true);
                expect(errText[0].includes("DataService::setValues(): keys and values do not have the same size.")).toBe(true);
                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("for setValues values length", async done => {
            try {
                const dataSvc = new Svc();
                let errText = [""];
                spyOn(Wincor.UI.Diagnostics.LogProvider, "error").and.callFake(text => {
                    errText[0] = text;
                });
                spyOn(Wincor.UI.Service.Provider, "propagateError");

                dataSvc.ERROR_TYPE = { REQUEST: "REQUEST" };
                await dataSvc.setValues(["PROP_A", "PROP_B", "CCTAFW_PROP_C"], ["1", "2", "3".repeat(132000)]);
                expect(Wincor.UI.Diagnostics.LogProvider.error).toHaveBeenCalled();
                expect(Wincor.UI.Service.Provider.propagateError).toHaveBeenCalled();
                expect(errText.length > 0).toBe(true);
                expect(errText[0].includes("DataService::setValues() too long values argument requested. Please check your values array argument.")).toBe(true);
                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("for setValues keys length", async done => {
            try {
                const dataSvc = new Svc();
                let errText = [""];
                spyOn(Wincor.UI.Diagnostics.LogProvider, "error").and.callFake(text => {
                    errText[0] = text;
                });
                spyOn(Wincor.UI.Service.Provider, "propagateError");

                dataSvc.ERROR_TYPE = { REQUEST: "REQUEST" };
                await dataSvc.setValues(["P".repeat(132000), "PROP_B", "CCTAFW_PROP_C"], ["1", "2", "3"]);
                expect(Wincor.UI.Diagnostics.LogProvider.error).toHaveBeenCalled();
                expect(Wincor.UI.Service.Provider.propagateError).toHaveBeenCalled();
                expect(errText.length > 0).toBe(true);
                expect(errText[0].includes("DataService::setValues() too many or too long property keys argument requested.")).toBe(true);
                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("for setValues keys count", async done => {
            try {
                const dataSvc = new Svc();
                let errText = [""];
                spyOn(Wincor.UI.Diagnostics.LogProvider, "error").and.callFake(text => {
                    errText[0] = text;
                });
                spyOn(Wincor.UI.Service.Provider, "propagateError");

                dataSvc.ERROR_TYPE = { REQUEST: "REQUEST" };
                let KEYS = Array(1100).fill("TEST_KEY");
                KEYS.forEach((item, i, arr) => {
                    return (arr[i] = item + i);
                });
                let VALUES = Array(1100).fill("Value");
                KEYS.forEach((item, i, arr) => {
                    return (arr[i] = item + i);
                });
                await dataSvc.setValues(KEYS, VALUES);
                expect(Wincor.UI.Diagnostics.LogProvider.error).toHaveBeenCalled();
                expect(Wincor.UI.Service.Provider.propagateError).toHaveBeenCalled();
                expect(errText.length > 0).toBe(true);
                expect(errText[0].includes("DataService::setValues() too many or too long property keys argument requested.")).toBe(true);
                done();
            } catch(e) {
                done.fail(e);
            }
        });
    });

    describe("ui property resolution", () => {
        it("resolves service context", async () => {
            const dataSvc = new Svc();
            const TEST_VALUE = 1234;
            spyOn(dataSvc, "sendResponse");
            Wincor.UI.Service.Provider.ViewService.immediateTimeout = TEST_VALUE;
            const message = {
                propertyName: "ViewService.immediateTimeout"
            };
            dataSvc.getPropertyString(message);
            const EXPECTED_RESULT = Object.assign(message, { propertyValue: TEST_VALUE.toString() });
            expect(dataSvc.sendResponse).toHaveBeenCalledWith(EXPECTED_RESULT, "0");
        });

        it("can be served by handler", async () => {
            const dataSvc = new Svc();
            const TEST_PROPERTY = "ViewService.immediateTimeout";
            const TEST_VALUE = "test";
            const HOOK_VALUE = "hook";
            spyOn(dataSvc, "sendResponse");
            Wincor.UI.Service.Provider.ViewService.immediateTimeout = TEST_VALUE;
            const message = {
                propertyName: TEST_PROPERTY
            };

            //install handler
            const handler = jasmine.createSpy("handler").and.callFake(prop => {
                expect(prop.key).toEqual(TEST_PROPERTY);
                prop.value = HOOK_VALUE;
                return true;
            });
            expect(dataSvc.setPropertyHandler(handler)).toBe(true);
            dataSvc.getPropertyString(message);
            const EXPECTED_RESULT = Object.assign(message, { propertyValue: HOOK_VALUE });
            expect(dataSvc.sendResponse).toHaveBeenCalledWith(EXPECTED_RESULT, "0");
        });

        it("can be denied by handler", async () => {
            const dataSvc = new Svc();
            const TEST_PROPERTY = "ViewService.immediateTimeout";
            const TEST_VALUE = 1234;
            const HOOK_VALUE = "hook";
            spyOn(dataSvc, "sendResponse");
            Wincor.UI.Service.Provider.ViewService.immediateTimeout = TEST_VALUE;
            const message = {
                propertyName: TEST_PROPERTY
            };

            //install handler
            const handler = jasmine.createSpy("handler").and.callFake(prop => {
                expect(prop.key).toEqual(TEST_PROPERTY);
                prop.value = HOOK_VALUE;
            });
            expect(dataSvc.setPropertyHandler(handler)).toBe(true);
            dataSvc.getPropertyString(message);
            const EXPECTED_RESULT = Object.assign(message, { propertyValue: TEST_VALUE.toString() });
            expect(dataSvc.sendResponse).toHaveBeenCalledWith(EXPECTED_RESULT, "0");
        });

        it("reset handler", async () => {
            const dataSvc = new Svc();
            const TEST_PROPERTY = "ViewService.immediateTimeout";
            const TEST_VALUE = 1234;
            const HOOK_VALUE = "hook";
            spyOn(dataSvc, "sendResponse");
            Wincor.UI.Service.Provider.ViewService.immediateTimeout = TEST_VALUE;
            const message = {
                propertyName: TEST_PROPERTY
            };

            //install handler
            const handler = jasmine.createSpy("handler").and.callFake(prop => {
                expect(prop.key).toEqual(TEST_PROPERTY);
                prop.value = HOOK_VALUE;
                return true;
            });
            expect(dataSvc.setPropertyHandler(handler)).toBe(true);
            dataSvc.getPropertyString(message);
            let EXPECTED_RESULT = Object.assign(message, { propertyValue: HOOK_VALUE });
            expect(dataSvc.sendResponse).toHaveBeenCalledWith(EXPECTED_RESULT, "0");

            expect(dataSvc.setPropertyHandler(null)).toBe(true);
            dataSvc.getPropertyString(message);
            EXPECTED_RESULT = Object.assign(message, { propertyValue: TEST_VALUE.toString() });
            expect(dataSvc.sendResponse).toHaveBeenCalledWith(EXPECTED_RESULT, "0");
        });
    });

    describe("property key mapping", () => {
        it("checks getKeyMap", async done => {
            try {
                const dataSvc = new Svc();
                dataSvc.propRequestMap.set(4711, { CCTAFW_PROP_A: "PROP_A" });
                let map = dataSvc.getKeyMap(4711);
                expect(map).toEqual({ CCTAFW_PROP_A: "PROP_A" });
                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("checks mapKey", async done => {
            try {
                const dataSvc = new Svc();
                dataSvc.businessPropertyKeys = {
                    PROP_A: "CCTAFW_PROP_A",
                    PROP_B: "CCTAFW_PROP_B"
                };
                let key = dataSvc.mapKey("PROP_A");
                expect(key).toEqual("CCTAFW_PROP_A");

                key = dataSvc.mapKey("CCTAFW_PROP_A");
                expect(key).toEqual("CCTAFW_PROP_A");

                key = dataSvc.mapKey("PROP_B");
                expect(key).toEqual("CCTAFW_PROP_B");

                key = dataSvc.mapKey(null);
                expect(key).toBe(null);

                key = dataSvc.mapKey("");
                expect(key).toBe("");

                expect(dataSvc.propRequestMap.size).toBe(0);

                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("checks mapKey with array request [A..", async done => {
            try {
                const dataSvc = new Svc();
                dataSvc.businessPropertyKeys = {
                    PROP_A: "CCTAFW_PROP_A",
                    PROP_B: "CCTAFW_PROP_B",
                    PROP_C: "CCTAFW_PROP_C"
                };
                let key = dataSvc.mapKey("PROP_A[A,5,9]");
                expect(key).toEqual("CCTAFW_PROP_A[A,5,9]");

                key = dataSvc.mapKey("PROP_A[A]");
                expect(key).toEqual("CCTAFW_PROP_A[A]");

                key = dataSvc.mapKey("CCTAFW_PROP_A[A]");
                expect(key).toEqual("CCTAFW_PROP_A[A]");

                key = dataSvc.mapKey("CCTAFW_PROP_B[A,5,9]");
                expect(key).toEqual("CCTAFW_PROP_B[A,5,9]");

                key = dataSvc.mapKey("PROP_C[A,2,4]");
                expect(key).toEqual("CCTAFW_PROP_C[A,2,4]");

                expect(dataSvc.propRequestMap.size).toBe(0);

                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("checks mapKey with index request [x]", async done => {
            try {
                const dataSvc = new Svc();
                dataSvc.businessPropertyKeys = {
                    PROP_A: "CCTAFW_PROP_A",
                    PROP_B: "CCTAFW_PROP_B",
                    PROP_C: "CCTAFW_PROP_C"
                };
                let key = dataSvc.mapKey("PROP_A[1]");
                expect(key).toEqual("CCTAFW_PROP_A[1]");

                key = dataSvc.mapKey("PROP_A[0]");
                expect(key).toEqual("CCTAFW_PROP_A[0]");

                key = dataSvc.mapKey("CCTAFW_PROP_A[99]");
                expect(key).toEqual("CCTAFW_PROP_A[99]");

                key = dataSvc.mapKey("CCTAFW_PROP_B[100]");
                expect(key).toEqual("CCTAFW_PROP_B[100]");

                key = dataSvc.mapKey("PROP_C[99]");
                expect(key).toEqual("CCTAFW_PROP_C[99]");

                expect(dataSvc.propRequestMap.size).toBe(0);

                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("checks mapKey with attribute request prop.attr or prop.attr[1]", async done => {
            try {
                const dataSvc = new Svc();
                dataSvc.businessPropertyKeys = {
                    PROP_A: "CCTAFW_PROP_A",
                    PROP_B: "CCTAFW_PROP_B",
                    PROP_C: "CCTAFW_PROP_C"
                };
                let key = dataSvc.mapKey("PROP_A.foo");
                expect(key).toEqual("CCTAFW_PROP_A.foo");

                key = dataSvc.mapKey("PROP_A.foo[0]");
                expect(key).toEqual("CCTAFW_PROP_A.foo[0]");

                key = dataSvc.mapKey("CCTAFW_PROP_A.bar[99]");
                expect(key).toEqual("CCTAFW_PROP_A.bar[99]");

                key = dataSvc.mapKey("CCTAFW_PROP_B.bar");
                expect(key).toEqual("CCTAFW_PROP_B.bar");

                key = dataSvc.mapKey("PROP_C.foo[99]");
                expect(key).toEqual("CCTAFW_PROP_C.foo[99]");

                key = dataSvc.mapKey("PROP_C.foo.bar[99]");
                expect(key).toEqual("CCTAFW_PROP_C.foo.bar[99]");

                key = dataSvc.mapKey("PROP_C.foo.1.bar");
                expect(key).toEqual("CCTAFW_PROP_C.foo.1.bar");

                key = dataSvc.mapKey("PROP_C.foo.1.bar[1]");
                expect(key).toEqual("CCTAFW_PROP_C.foo.1.bar[1]");

                expect(dataSvc.propRequestMap.size).toBe(0);

                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("checks mapKeys", async done => {
            try {
                const dataSvc = new Svc();
                dataSvc.businessPropertyKeys = {
                    PROP_A: "CCTAFW_PROP_A",
                    PROP_B: "CCTAFW_PROP_B"
                };
                let keys = dataSvc.mapKeys(["PROP_A", "PROP_B", "CCTAFW_PROP_C"]);
                expect(keys).toEqual(["CCTAFW_PROP_A", "CCTAFW_PROP_B", "CCTAFW_PROP_C"]);
                expect(dataSvc.propRequestMap.size).toBe(0);

                // "PROP_A" is the same as "CCTAFW_PROP_A" after mapping, so we expect that keys only includes "CCTAFW_PROP_A" 1 time
                keys = dataSvc.mapKeys(["PROP_A", "PROP_B", "CCTAFW_PROP_A"]);
                expect(keys).toEqual(["CCTAFW_PROP_A", "CCTAFW_PROP_B"]);
                expect(dataSvc.propRequestMap.size).toBe(0);

                keys = dataSvc.mapKeys(["PROP_A", "PROP_B", "PROP_A", "PROP_C"]); // "PROP_A" is double
                expect(keys).toEqual(["CCTAFW_PROP_A", "CCTAFW_PROP_B", "PROP_C"]);
                expect(dataSvc.propRequestMap.size).toBe(0);

                keys = dataSvc.mapKeys(["PROP_A", "PROP_B", "CCTAFW_PROP_C"], 4711);
                expect(keys).toEqual(["CCTAFW_PROP_A", "CCTAFW_PROP_B", "CCTAFW_PROP_C"]);
                expect(dataSvc.propRequestMap.size).toBe(1);
                expect(dataSvc.propRequestMap.get(4711)).toEqual({ CCTAFW_PROP_A: "PROP_A", CCTAFW_PROP_B: "PROP_B" });

                // expect no adding to propRequestMap
                keys = dataSvc.mapKeys(["CCTAFW_PROP_A", "CCTAFW_PROP_B", "CCTAFW_PROP_C"], 4911);
                expect(keys).toEqual(["CCTAFW_PROP_A", "CCTAFW_PROP_B", "CCTAFW_PROP_C"]);
                expect(dataSvc.propRequestMap.size).toBe(1);
                expect(dataSvc.propRequestMap.get(4911)).toEqual(void 0);

                // expect 1 more adding to propRequestMap
                keys = dataSvc.mapKeys(["PROP_B"], 4911);
                expect(keys).toEqual(["CCTAFW_PROP_B"]);
                expect(dataSvc.propRequestMap.size).toBe(2);
                expect(dataSvc.propRequestMap.get(4911)).toEqual({ CCTAFW_PROP_B: "PROP_B" });

                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("checks mapKeys with array request [A..", async done => {
            try {
                const dataSvc = new Svc();
                dataSvc.businessPropertyKeys = {
                    PROP_A: "CCTAFW_PROP_A",
                    PROP_B: "CCTAFW_PROP_B",
                    PROP_C: "CCTAFW_PROP_C"
                };
                let keys = dataSvc.mapKeys(["PROP_A[A]", "PROP_B", "CCTAFW_PROP_C[A,5,9]"]);
                expect(keys).toEqual(["CCTAFW_PROP_A[A]", "CCTAFW_PROP_B", "CCTAFW_PROP_C[A,5,9]"]);
                expect(dataSvc.propRequestMap.size).toBe(0);

                // "PROP_A[A,5,9]" is the same as "CCTAFW_PROP_A[A,5,9]" after mapping, so we expect that keys only includes "CCTAFW_PROP_A[A,5,9]" 1 time
                keys = dataSvc.mapKeys(["PROP_A[A,5,9]", "PROP_B", "CCTAFW_PROP_A[A,5,9]"]);
                expect(keys).toEqual(["CCTAFW_PROP_A[A,5,9]", "CCTAFW_PROP_B"]);
                expect(dataSvc.propRequestMap.size).toBe(0);

                keys = dataSvc.mapKeys(["PROP_A[A]", "PROP_B", "PROP_A[A]", "PROP_C"]); // "PROP_A[A]" is double
                expect(keys).toEqual(["CCTAFW_PROP_A[A]", "CCTAFW_PROP_B", "CCTAFW_PROP_C"]);
                expect(dataSvc.propRequestMap.size).toBe(0);

                keys = dataSvc.mapKeys(["PROP_A[A]", "PROP_B[A,5,9]", "CCTAFW_PROP_C"], 4711);
                expect(keys).toEqual(["CCTAFW_PROP_A[A]", "CCTAFW_PROP_B[A,5,9]", "CCTAFW_PROP_C"]);
                expect(dataSvc.propRequestMap.size).toBe(1);
                expect(dataSvc.propRequestMap.get(4711)).toEqual({ "CCTAFW_PROP_A[A]": "PROP_A[A]", "CCTAFW_PROP_B[A,5,9]": "PROP_B[A,5,9]" });

                // expect no adding to propRequestMap
                keys = dataSvc.mapKeys(["CCTAFW_PROP_A[A]", "CCTAFW_PROP_B[A,5,9]", "CCTAFW_PROP_C[A]"], 4911);
                expect(keys).toEqual(["CCTAFW_PROP_A[A]", "CCTAFW_PROP_B[A,5,9]", "CCTAFW_PROP_C[A]"]);
                expect(dataSvc.propRequestMap.size).toBe(1);
                expect(dataSvc.propRequestMap.get(4911)).toEqual(void 0);

                // expect 1 more adding to propRequestMap
                keys = dataSvc.mapKeys(["PROP_B[A,5,9]"], 4911);
                expect(keys).toEqual(["CCTAFW_PROP_B[A,5,9]"]);
                expect(dataSvc.propRequestMap.size).toBe(2);
                expect(dataSvc.propRequestMap.get(4911)).toEqual({ "CCTAFW_PROP_B[A,5,9]": "PROP_B[A,5,9]" });

                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("checks mapKeys with index request [x]", async done => {
            try {
                const dataSvc = new Svc();
                dataSvc.businessPropertyKeys = {
                    PROP_A: "CCTAFW_PROP_A",
                    PROP_B: "CCTAFW_PROP_B",
                    PROP_C: "CCTAFW_PROP_C"
                };
                let keys = dataSvc.mapKeys(["PROP_A[0]", "PROP_B", "CCTAFW_PROP_C[0]"]);
                expect(keys).toEqual(["CCTAFW_PROP_A[0]", "CCTAFW_PROP_B", "CCTAFW_PROP_C[0]"]);
                expect(dataSvc.propRequestMap.size).toBe(0);

                // "PROP_A[1]" is the same as "CCTAFW_PROP_A[1]" after mapping, so we expect that keys only includes "CCTAFW_PROP_A[1]" 1 time
                keys = dataSvc.mapKeys(["PROP_A[1]", "PROP_B", "CCTAFW_PROP_A[1]"]);
                expect(keys).toEqual(["CCTAFW_PROP_A[1]", "CCTAFW_PROP_B"]);
                expect(dataSvc.propRequestMap.size).toBe(0);

                keys = dataSvc.mapKeys(["PROP_A[99]", "PROP_B", "PROP_A[99]", "PROP_C"]); // "PROP_A[99]" is double
                expect(keys).toEqual(["CCTAFW_PROP_A[99]", "CCTAFW_PROP_B", "CCTAFW_PROP_C"]);
                expect(dataSvc.propRequestMap.size).toBe(0);

                keys = dataSvc.mapKeys(["PROP_A[0]", "PROP_B[54]", "CCTAFW_PROP_C"], 4711);
                expect(keys).toEqual(["CCTAFW_PROP_A[0]", "CCTAFW_PROP_B[54]", "CCTAFW_PROP_C"]);
                expect(dataSvc.propRequestMap.size).toBe(1);
                expect(dataSvc.propRequestMap.get(4711)).toEqual({ "CCTAFW_PROP_A[0]": "PROP_A[0]", "CCTAFW_PROP_B[54]": "PROP_B[54]" });

                // expect no adding to propRequestMap
                keys = dataSvc.mapKeys(["CCTAFW_PROP_A[1]", "CCTAFW_PROP_B[2]", "CCTAFW_PROP_C[3]"], 4911);
                expect(keys).toEqual(["CCTAFW_PROP_A[1]", "CCTAFW_PROP_B[2]", "CCTAFW_PROP_C[3]"]);
                expect(dataSvc.propRequestMap.size).toBe(1);
                expect(dataSvc.propRequestMap.get(4911)).toEqual(void 0);

                // expect 1 more adding to propRequestMap
                keys = dataSvc.mapKeys(["PROP_B[59]"], 4911);
                expect(keys).toEqual(["CCTAFW_PROP_B[59]"]);
                expect(dataSvc.propRequestMap.size).toBe(2);
                expect(dataSvc.propRequestMap.get(4911)).toEqual({ "CCTAFW_PROP_B[59]": "PROP_B[59]" });

                keys = dataSvc.mapKeys(["PROP_C[1]"], 5001);
                expect(keys).toEqual(["CCTAFW_PROP_C[1]"]);
                expect(dataSvc.propRequestMap.size).toBe(3);
                expect(dataSvc.propRequestMap.get(5001)).toEqual({ "CCTAFW_PROP_C[1]": "PROP_C[1]" });

                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("checks mapKeys with attribute request prop.attr or prop.attr[1]", async done => {
            try {
                const dataSvc = new Svc();
                dataSvc.businessPropertyKeys = {
                    PROP_A: "CCTAFW_PROP_A",
                    PROP_B: "CCTAFW_PROP_B",
                    PROP_C: "CCTAFW_PROP_C"
                };
                let keys = dataSvc.mapKeys(["PROP_A.foo[0]", "PROP_B.name", "CCTAFW_PROP_C.bar[0]"]);
                expect(keys).toEqual(["CCTAFW_PROP_A.foo[0]", "CCTAFW_PROP_B.name", "CCTAFW_PROP_C.bar[0]"]);
                expect(dataSvc.propRequestMap.size).toBe(0);

                keys = dataSvc.mapKeys(["PROP_A.foo[0]", "PROP_B.foo.bar[54]", "CCTAFW_PROP_C"], 4711);
                expect(keys).toEqual(["CCTAFW_PROP_A.foo[0]", "CCTAFW_PROP_B.foo.bar[54]", "CCTAFW_PROP_C"]);
                expect(dataSvc.propRequestMap.size).toBe(1);
                expect(dataSvc.propRequestMap.get(4711)).toEqual({ "CCTAFW_PROP_A.foo[0]": "PROP_A.foo[0]", "CCTAFW_PROP_B.foo.bar[54]": "PROP_B.foo.bar[54]" });

                // expect no adding to propRequestMap
                keys = dataSvc.mapKeys(["CCTAFW_PROP_A.foo[1]", "CCTAFW_PROP_B.foo.bar[2]", "CCTAFW_PROP_C.bar.foo[3]"], 4911);
                expect(keys).toEqual(["CCTAFW_PROP_A.foo[1]", "CCTAFW_PROP_B.foo.bar[2]", "CCTAFW_PROP_C.bar.foo[3]"]);
                expect(dataSvc.propRequestMap.size).toBe(1);
                expect(dataSvc.propRequestMap.get(4911)).toEqual(void 0);

                // expect 1 more adding to propRequestMap
                keys = dataSvc.mapKeys(["PROP_B.foo.bar"], 4911);
                expect(keys).toEqual(["CCTAFW_PROP_B.foo.bar"]);
                expect(dataSvc.propRequestMap.size).toBe(2);
                expect(dataSvc.propRequestMap.get(4911)).toEqual({ "CCTAFW_PROP_B.foo.bar": "PROP_B.foo.bar" });

                keys = dataSvc.mapKeys(["PROP_C.bar[1]"], 5001);
                expect(keys).toEqual(["CCTAFW_PROP_C.bar[1]"]);
                expect(dataSvc.propRequestMap.size).toBe(3);
                expect(dataSvc.propRequestMap.get(5001)).toEqual({ "CCTAFW_PROP_C.bar[1]": "PROP_C.bar[1]" });

                keys = dataSvc.mapKeys(["PROP_C.foo.1.bar[1]"], 5002);
                expect(keys).toEqual(["CCTAFW_PROP_C.foo.1.bar[1]"]);
                expect(dataSvc.propRequestMap.size).toBe(4);
                expect(dataSvc.propRequestMap.get(5002)).toEqual({ "CCTAFW_PROP_C.foo.1.bar[1]": "PROP_C.foo.1.bar[1]" });

                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("checks mapResponseKeys 1", async done => {
            try {
                const dataSvc = new Svc();
                dataSvc.propRequestMap.set(4711, {
                    CCTAFW_PROP_A: "PROP_A",
                    CCTAFW_PROP_B: "PROP_B"
                });
                dataSvc.propRequestMap.set(4911, {
                    CCTAFW_PROP_A: "PROP_A",
                    CCTAFW_PROP_B: "PROP_B"
                });

                let response = dataSvc.mapResponseKeys(void 0, 4711);
                expect(response).toBe(void 0);

                response = dataSvc.mapResponseKeys(
                    {
                        CCTAFW_PROP_A: "xyz",
                        CCTAFW_PROP_B: "uvw"
                    },
                    4711
                );
                expect(response).toEqual({
                    PROP_A: "xyz",
                    PROP_B: "uvw"
                });
                expect(dataSvc.propRequestMap.size).toBe(1);

                // expect 4711 not existing anymore
                response = dataSvc.mapResponseKeys(
                    {
                        CCTAFW_PROP_A: "xyz",
                        CCTAFW_PROP_B: "uvw"
                    },
                    4711
                );
                expect(response).toEqual({
                    CCTAFW_PROP_A: "xyz",
                    CCTAFW_PROP_B: "uvw"
                });

                // expect 4911
                response = dataSvc.mapResponseKeys(
                    {
                        CCTAFW_PROP_A: "xyz",
                        CCTAFW_PROP_B: "uvw"
                    },
                    4911
                );
                expect(response).toEqual({
                    PROP_A: "xyz",
                    PROP_B: "uvw"
                });
                expect(dataSvc.propRequestMap.size).toBe(0);
                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("checks mapResponseKeys 2", async done => {
            try {
                const dataSvc = new Svc();
                dataSvc.propRequestMap.set(4711, {
                    CCTAFW_PROP_A: "PROP_A",
                    CCTAFW_PROP_B: "PROP_B"
                });
                dataSvc.propRequestMap.set(4911, {
                    CCTAFW_PROP_A: "PROP_A",
                    CCTAFW_PROP_B: "PROP_B"
                });

                let response = dataSvc.mapResponseKeys(
                    {
                        CCTAFW_PROP_A: "xyz",
                        PROP_B: "uvw" // expect this value isn't going to be mapped, even its part of the propRequestMap
                    },
                    4711
                );
                expect(response).toEqual({
                    PROP_A: "xyz",
                    PROP_B: "uvw"
                });
                expect(dataSvc.propRequestMap.size).toBe(1);

                response = dataSvc.mapResponseKeys(
                    {
                        PROP_A: "xyz", // expect this value isn't going to be mapped, even its part of the propRequestMap
                        PROP_B: "uvw" // expect this value isn't going to be mapped, even its part of the propRequestMap
                    },
                    4911
                );
                expect(response).toEqual({
                    PROP_A: "xyz",
                    PROP_B: "uvw"
                });
                expect(dataSvc.propRequestMap.size).toBe(0);

                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("checks mapResponseKeys 3 (index and array requests)", async done => {
            try {
                const dataSvc = new Svc();
                dataSvc.propRequestMap.set(4711, {
                    "CCTAFW_PROP_A[0]": "PROP_A[0]",
                    "CCTAFW_PROP_B[1]": "PROP_B[1]"
                });
                dataSvc.propRequestMap.set(4911, {
                    "CCTAFW_PROP_A[100]": "PROP_A[100]",
                    CCTAFW_PROP_B: "PROP_B"
                });

                dataSvc.propRequestMap.set(5000, {
                    "CCTAFW_PROP_A[A,5,9]": "PROP_A[A,5,9]",
                    "CCTAFW_PROP_B[A,1,2]": "PROP_B[A,1,2]"
                });

                let response = dataSvc.mapResponseKeys(
                    {
                        "CCTAFW_PROP_A[0]": "xyz",
                        PROP_B: "uvw" // expect this value isn't going to be mapped, even its part of the propRequestMap
                    },
                    4711
                );
                expect(response).toEqual({
                    "PROP_A[0]": "xyz",
                    PROP_B: "uvw"
                });
                expect(dataSvc.propRequestMap.size).toBe(2);

                response = dataSvc.mapResponseKeys(
                    {
                        PROP_A: "xyz", // expect this value isn't going to be mapped, even its part of the propRequestMap
                        PROP_B: "uvw" // expect this value isn't going to be mapped, even its part of the propRequestMap
                    },
                    4911
                );
                expect(response).toEqual({
                    PROP_A: "xyz",
                    PROP_B: "uvw"
                });
                expect(dataSvc.propRequestMap.size).toBe(1); // 4911 has been removed, though

                response = dataSvc.mapResponseKeys(
                    {
                        "CCTAFW_PROP_A[A,5,9]": "xyz",
                        "PROP_B[A,1,2]": "uvw" // expect this value isn't going to be mapped, even its part of the propRequestMap
                    },
                    5000
                );
                expect(response).toEqual({
                    "PROP_A[A,5,9]": "xyz",
                    "PROP_B[A,1,2]": "uvw"
                });
                expect(dataSvc.propRequestMap.size).toBe(0);

                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("checks getValues regarding key mapping", async done => {
            try {
                const dataSvc = new Svc();
                dataSvc.businessPropertyKeys = {
                    PROP_A: "CCTAFW_PROP_A",
                    PROP_B: "CCTAFW_PROP_B",
                    PROP_C: "CCTAFW_PROP_C"
                };
                let callback = jasmine.createSpy("getValuesCallback").and.callThrough();
                let updCallback = jasmine.createSpy("getValuesUpdateCallback").and.callThrough();
                spyOn(dataSvc, "mapKeys").and.callThrough();
                spyOn(dataSvc, "FrmResolve").and.callFake((req, cb) => {
                    req.callbackIdx = 4711;
                    expect(req.FWFuncID).toBe(30);
                    expect(req.param1).toEqual(["CCTAFW_PROP_A", "CCTAFW_PROP_B", "CCTAFW_PROP_C"]);
                    return req;
                });
                dataSvc.getValues(["PROP_A", "PROP_B", "CCTAFW_PROP_C"], callback, updCallback);
                expect(callback).not.toHaveBeenCalled();
                expect(updCallback).not.toHaveBeenCalled();
                expect(dataSvc.mapKeys).toHaveBeenCalledWith(["PROP_A", "PROP_B", "CCTAFW_PROP_C"], 4711);
                expect(dataSvc.getKeyMap(4711)).toEqual({
                    CCTAFW_PROP_A: "PROP_A",
                    CCTAFW_PROP_B: "PROP_B"
                });
                expect(dataSvc.dataArray[0].keys).toEqual(["CCTAFW_PROP_A", "CCTAFW_PROP_B", "CCTAFW_PROP_C"]);
                expect(dataSvc.dataArray[0].keyMap).toEqual({
                    CCTAFW_PROP_A: "PROP_A",
                    CCTAFW_PROP_B: "PROP_B"
                });
                expect(dataSvc.dataArray[0].onUpdate).toEqual(updCallback);

                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("checks setValues regarding key mapping", async done => {
            try {
                const dataSvc = new Svc();
                dataSvc.businessPropertyKeys = {
                    PROP_A: "CCTAFW_PROP_A",
                    PROP_B: "CCTAFW_PROP_B",
                    PROP_C: "CCTAFW_PROP_C"
                };
                let request = null;
                spyOn(dataSvc, "FrmResolve").and.callFake((req, cb) => {
                    req.callbackIdx = 4711;
                    request = req;
                    return req;
                });
                spyOn(dataSvc, "mapKey").and.callThrough();

                dataSvc.setValues(["PROP_A", "PROP_B", "CCTAFW_PROP_C"], ["xyz", "uvw", "123"]);
                expect(dataSvc.mapKey).toHaveBeenCalledTimes(3);
                expect(request.FWFuncID).toBe(31);
                expect(request.param1.length).toBe(3);
                expect(request.param2.length).toBe(3);
                expect(request.param1).toEqual(["CCTAFW_PROP_A", "CCTAFW_PROP_B", "CCTAFW_PROP_C"]);
                expect(request.param2).toEqual(["xyz", "uvw", "123"]);
                expect(dataSvc.propRequestMap.size).toBe(0); // expect no adding to request map
                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("checks setValues with double keys/values (1) regarding key mapping", async done => {
            try {
                const dataSvc = new Svc();
                dataSvc.businessPropertyKeys = {
                    PROP_A: "CCTAFW_PROP_A",
                    PROP_B: "CCTAFW_PROP_B",
                    PROP_C: "CCTAFW_PROP_C"
                };
                let request = null;
                spyOn(dataSvc, "FrmResolve").and.callFake((req, cb) => {
                    req.callbackIdx = 4711;
                    request = req;
                    return req;
                });
                spyOn(dataSvc, "mapKey").and.callThrough();

                dataSvc.setValues(["PROP_A", "PROP_B", "PROP_A", "CCTAFW_PROP_C"], ["xyz", "uvw", "xyz", "123"]); // setValues now filters out double keys/values...
                expect(dataSvc.mapKey).toHaveBeenCalledTimes(4); // ...so we expect already unique arguments here
                expect(request.FWFuncID).toBe(31);
                expect(request.param1.length).toBe(3);
                expect(request.param2.length).toBe(3);
                expect(request.param1).toEqual(["CCTAFW_PROP_A", "CCTAFW_PROP_B", "CCTAFW_PROP_C"]);
                expect(request.param2).toEqual(["xyz", "uvw", "123"]);
                expect(dataSvc.propRequestMap.size).toBe(0); // expect no adding to request map
                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("checks setValues with double keys/values (2) regarding key mapping", async done => {
            try {
                const dataSvc = new Svc();
                dataSvc.businessPropertyKeys = {
                    PROP_A: "CCTAFW_PROP_A",
                    PROP_B: "CCTAFW_PROP_B",
                    PROP_C: "CCTAFW_PROP_C"
                };
                let request = null;
                spyOn(dataSvc, "FrmResolve").and.callFake((req, cb) => {
                    req.callbackIdx = 4711;
                    request = req;
                    return req;
                });
                spyOn(dataSvc, "mapKey").and.callThrough();

                dataSvc.setValues(["PROP_A", "PROP_B", "CCTAFW_PROP_A", "CCTAFW_PROP_C"], ["xyz", "uvw", "xyz", "123"]); // "PROP_A" is same as "CCTAFW_PROP_A" after mapping
                expect(dataSvc.mapKey).toHaveBeenCalledTimes(4);
                expect(request.FWFuncID).toBe(31);
                expect(request.param1.length).toBe(3); // "CCTAFW_PROP_A" has been filtered out
                expect(request.param2.length).toBe(3);
                expect(request.param1).toEqual(["CCTAFW_PROP_A", "CCTAFW_PROP_B", "CCTAFW_PROP_C"]);
                expect(request.param2).toEqual(["xyz", "uvw", "123"]);
                expect(dataSvc.propRequestMap.size).toBe(0); // expect no adding to request map
                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("checks setValues with double keys/values (3) regarding key mapping", async done => {
            try {
                const dataSvc = new Svc();
                dataSvc.businessPropertyKeys = {
                    PROP_A: "CCTAFW_PROP_A",
                    PROP_B: "CCTAFW_PROP_B",
                    PROP_C: "CCTAFW_PROP_C"
                };
                let request = null;
                spyOn(dataSvc, "FrmResolve").and.callFake((req, cb) => {
                    req.callbackIdx = 4711;
                    request = req;
                    return req;
                });
                spyOn(dataSvc, "mapKey").and.callThrough();

                dataSvc.setValues(["CCTAFW_PROP_A", "PROP_A", "CCTAFW_PROP_A", "CCTAFW_PROP_C"], ["xyz", "uvw", "xyz", "123"]); // "PROP_A" is same as "CCTAFW_PROP_A" after mapping
                expect(dataSvc.mapKey).toHaveBeenCalledTimes(4);
                expect(request.FWFuncID).toBe(31);
                expect(request.param1.length).toBe(2); // "CCTAFW_PROP_A" has been filtered out
                expect(request.param2.length).toBe(2);
                expect(request.param1).toEqual(["CCTAFW_PROP_A", "CCTAFW_PROP_C"]);
                expect(request.param2).toEqual(["xyz", "123"]);
                expect(dataSvc.propRequestMap.size).toBe(0); // expect no adding to request map
                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("checks translateResponse regarding key mapping", async done => {
            try {
                const dataSvc = new Svc();
                dataSvc.propRequestMap.set(4711, {
                    CCTAFW_PROP_A: "PROP_A",
                    CCTAFW_PROP_B: "PROP_B"
                });
                const message = {
                    FWFuncID: 30,
                    RC: 0,
                    callbackIdx: 4711,
                    param1: ["CCTAFW_PROP_A", "CCTAFW_PROP_B", "CCTAFW_PROP_C"],
                    param2: ["xyz", "uvw", "123"]
                };
                spyOn(dataSvc, "mapResponseKeys").and.callThrough();
                let response = dataSvc.translateResponse(message);
                expect(dataSvc.mapResponseKeys).toHaveBeenCalledTimes(1);
                expect(response).toEqual({
                    PROP_A: "xyz",
                    PROP_B: "uvw",
                    CCTAFW_PROP_C: "123"
                });
                expect(dataSvc.getKeyMap(4711)).toEqual({}); // 4711 has been removed as expected

                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("checks valueChanged regarding key mapping", async done => {
            try {
                const dataSvc = new Svc();
                let dataReg = new dataSvc.DataRegistration();
                dataReg.keys = ["CCTAFW_PROP_A", "CCTAFW_PROP_B", "CCTAFW_PROP_C"];
                dataReg.keyMap = {
                    CCTAFW_PROP_A: "PROP_A",
                    CCTAFW_PROP_B: "PROP_B"
                };
                let response = null;
                dataReg.onUpdate = jasmine.createSpy("getValuesUpdateCallback").and.callFake(res => {
                    response = res;
                });
                dataReg.persistent = false;
                dataSvc.dataArray.push(dataReg);

                dataSvc.valueChanged("CCTAFW_PROP_A_WNSEP_123");
                expect(dataSvc.dataArray[0].onUpdate).toHaveBeenCalledWith(response);
                expect(response).toEqual({ PROP_A: "123" });

                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("checks cleanDataRegistrations regarding key mapping", async done => {
            try {
                const dataSvc = new Svc();
                dataSvc.propRequestMap.set(4711, {
                    CCTAFW_PROP_A: "PROP_A",
                    CCTAFW_PROP_B: "PROP_B"
                });
                dataSvc.cleanDataRegistrations();
                expect(dataSvc.propRequestMap.size).toBe(0);

                done();
            } catch(e) {
                done.fail(e);
            }
        });
    });
});
