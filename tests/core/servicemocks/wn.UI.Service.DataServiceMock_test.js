/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ wn.UI.Service.DataServiceMock_test.js 4.3.1-210212-21-06af7f4f-1a04bc7d

*/

import { WincorNamespace } from "../../../../GUI_UnitTesting/NamespaceMock.js";
import getServiceClass from "../../../../GUIAPP/core/servicemocks/wn.UI.Service.DataServiceMock.js";

let Wincor;
let Svc;

describe("DataServiceMock", () => {
    beforeEach(done => {
        Wincor = new WincorNamespace();

        class BaseServiceMock extends Wincor.UI.Service.BaseServiceMock {
            constructor() {
                super();
                this.serviceProvider.ControlPanelService = {
                    updateBusinessProperties: () => { }
                };
            }
            async retrieveJSONData(name) {
                const BusinessPropertyKeyMap = {
                    PROP_A: "CCTAFW_PROP_A",
                    PROP_B: "CCTAFW_PROP_B",
                    PROP_C: "CCTAFW_PROP_C",
                    PROP_D: "CCTAFW_PROP_D"
                };
                const BusinessData = {
                    CCTAFW_PROP_A: { "*": "xyz" },
                    CCTAFW_PROP_B: { "*": "uvw" },
                    CCTAFW_PROP_C: { "*": "123" },
                    CCTAFW_PROP_D: { "*": ["A", "B", "C"] }
                };

                switch(name) {
                    case "../servicedata/BusinessPropertyKeyMap.json":
                        return BusinessPropertyKeyMap;
                    case "../servicemocks/mockdata/BusinessData.json":
                        return BusinessData;

                    default:
                        return {};
                }
            }
        }

        const LogProvider = Wincor.UI.Diagnostics.LogProvider;
        Svc = getServiceClass({
            Wincor,
            BaseService: BaseServiceMock,
            LogProvider: LogProvider
        });

        jasmine.clock().install();
        done();
    });

    afterEach(() => {
        jasmine.clock().uninstall();
    });

    describe("ui property resolution", () => {
        it("resolves service context", async () => {
            const dataSvc = new Svc();
            await dataSvc.onServicesReady();
            const TEST_VALUE = 1234;
            Wincor.UI.Service.Provider.ViewService.immediateTimeout = TEST_VALUE;
            const message = {
                propertyName: "ViewService.immediateTimeout"
            };
            const res = dataSvc.getPropertyString(message);
            expect(res).toEqual(TEST_VALUE);
        });

        it("can be served by handler", async () => {
            const dataSvc = new Svc();
            await dataSvc.onServicesReady();
            const TEST_PROPERTY = "ViewService.immediateTimeout";
            const TEST_VALUE = "test";
            const HOOK_VALUE = "hook";
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
            const res = dataSvc.getPropertyString(message);
            expect(res).toEqual(HOOK_VALUE);
        });

        it("can be denied by handler", async () => {
            const dataSvc = new Svc();
            await dataSvc.onServicesReady();
            const TEST_PROPERTY = "ViewService.immediateTimeout";
            const TEST_VALUE = 1234;
            const HOOK_VALUE = "hook";
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
            const res = dataSvc.getPropertyString(message);
            expect(res).toEqual(TEST_VALUE);
        });

        it("reset handler", async () => {
            const dataSvc = new Svc();
            await dataSvc.onServicesReady();
            const TEST_PROPERTY = "ViewService.immediateTimeout";
            const TEST_VALUE = 1234;
            const HOOK_VALUE = "hook";
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
            let res = dataSvc.getPropertyString(message);
            expect(res).toEqual(HOOK_VALUE);

            expect(dataSvc.setPropertyHandler(null)).toBe(true);
            res = dataSvc.getPropertyString(message);
            expect(res).toEqual(TEST_VALUE);
        });
    });

    describe("property key mapping", () => {
        it("checks getKeyMap", async done => {
            try {
                const dataSvc = new Svc();
                await dataSvc.updateJSONData();

                dataSvc.mapKeys(["PROP_A", "PROP_B"], 4711);
                let map = dataSvc.getKeyMap(4711);
                expect(map).toEqual({ CCTAFW_PROP_A: "PROP_A", CCTAFW_PROP_B: "PROP_B" });
                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("checks mapKey", async done => {
            try {
                const dataSvc = new Svc();
                await dataSvc.updateJSONData();

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

                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("checks mapKey with array request [A..", async done => {
            try {
                const dataSvc = new Svc();
                await dataSvc.updateJSONData();

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

                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("checks mapKey with index request [x]", async done => {
            try {
                const dataSvc = new Svc();
                await dataSvc.updateJSONData();

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
                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("checks mapKey with attribute request prop.attr or prop.attr[1]", async done => {
            try {
                const dataSvc = new Svc();
                await dataSvc.updateJSONData();

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
                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("checks mapKeys", async done => {
            try {
                const dataSvc = new Svc();
                await dataSvc.updateJSONData();

                let keys = dataSvc.mapKeys(["PROP_A", "PROP_B", "CCTAFW_PROP_C"]);
                expect(keys).toEqual(["CCTAFW_PROP_A", "CCTAFW_PROP_B", "CCTAFW_PROP_C"]);

                // "PROP_A" is the same as "CCTAFW_PROP_A" after mapping, so we expect that keys only includes "CCTAFW_PROP_A" 1 time
                keys = dataSvc.mapKeys(["PROP_A", "PROP_B", "CCTAFW_PROP_A"]);
                expect(keys).toEqual(["CCTAFW_PROP_A", "CCTAFW_PROP_B"]);

                keys = dataSvc.mapKeys(["PROP_A", "PROP_B", "PROP_A", "PROP_C"]); // "PROP_A" is double
                expect(keys).toEqual(["CCTAFW_PROP_A", "CCTAFW_PROP_B", "CCTAFW_PROP_C"]);

                keys = dataSvc.mapKeys(["PROP_A", "PROP_B", "CCTAFW_PROP_C"], 4711);
                expect(keys).toEqual(["CCTAFW_PROP_A", "CCTAFW_PROP_B", "CCTAFW_PROP_C"]);
                expect(dataSvc.getKeyMap(4711)).toEqual({ CCTAFW_PROP_A: "PROP_A", CCTAFW_PROP_B: "PROP_B" });

                // expect no adding to propRequestMap
                keys = dataSvc.mapKeys(["CCTAFW_PROP_A", "CCTAFW_PROP_B", "CCTAFW_PROP_C"], 4911);
                expect(keys).toEqual(["CCTAFW_PROP_A", "CCTAFW_PROP_B", "CCTAFW_PROP_C"]);
                expect(dataSvc.getKeyMap(4911)).toEqual({});

                // expect 1 more adding to propRequestMap
                keys = dataSvc.mapKeys(["PROP_B"], 4911);
                expect(keys).toEqual(["CCTAFW_PROP_B"]);
                expect(dataSvc.getKeyMap(4911)).toEqual({ CCTAFW_PROP_B: "PROP_B" });

                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("checks mapKeys with array request [A..", async done => {
            try {
                const dataSvc = new Svc();
                await dataSvc.updateJSONData();

                let keys = dataSvc.mapKeys(["PROP_A[A]", "PROP_B", "CCTAFW_PROP_C[A,5,9]"]);
                expect(keys).toEqual(["CCTAFW_PROP_A[A]", "CCTAFW_PROP_B", "CCTAFW_PROP_C[A,5,9]"]);

                // "PROP_A[A,5,9]" is the same as "CCTAFW_PROP_A[A,5,9]" after mapping, so we expect that keys only includes "CCTAFW_PROP_A[A,5,9]" 1 time
                keys = dataSvc.mapKeys(["PROP_A[A,5,9]", "PROP_B", "CCTAFW_PROP_A[A,5,9]"]);
                expect(keys).toEqual(["CCTAFW_PROP_A[A,5,9]", "CCTAFW_PROP_B"]);

                keys = dataSvc.mapKeys(["PROP_A[A]", "PROP_B", "PROP_A[A]", "PROP_C"]); // "PROP_A[A]" is double
                expect(keys).toEqual(["CCTAFW_PROP_A[A]", "CCTAFW_PROP_B", "CCTAFW_PROP_C"]);

                keys = dataSvc.mapKeys(["PROP_A[A]", "PROP_B[A,5,9]", "CCTAFW_PROP_C"], 4711);
                expect(keys).toEqual(["CCTAFW_PROP_A[A]", "CCTAFW_PROP_B[A,5,9]", "CCTAFW_PROP_C"]);
                expect(dataSvc.getKeyMap(4711)).toEqual({ "CCTAFW_PROP_A[A]": "PROP_A[A]", "CCTAFW_PROP_B[A,5,9]": "PROP_B[A,5,9]" });

                // expect no adding to propRequestMap
                keys = dataSvc.mapKeys(["CCTAFW_PROP_A[A]", "CCTAFW_PROP_B[A,5,9]", "CCTAFW_PROP_C[A]"], 4911);
                expect(keys).toEqual(["CCTAFW_PROP_A[A]", "CCTAFW_PROP_B[A,5,9]", "CCTAFW_PROP_C[A]"]);
                expect(dataSvc.getKeyMap(4911)).toEqual({});

                // expect 1 more adding to propRequestMap
                keys = dataSvc.mapKeys(["PROP_B[A,5,9]"], 4911);
                expect(keys).toEqual(["CCTAFW_PROP_B[A,5,9]"]);
                expect(dataSvc.getKeyMap(4911)).toEqual({ "CCTAFW_PROP_B[A,5,9]": "PROP_B[A,5,9]" });

                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("checks mapKeys with index request [x]", async done => {
            try {
                const dataSvc = new Svc();
                await dataSvc.updateJSONData();

                let keys = dataSvc.mapKeys(["PROP_A[0]", "PROP_B", "CCTAFW_PROP_C[0]"]);
                expect(keys).toEqual(["CCTAFW_PROP_A[0]", "CCTAFW_PROP_B", "CCTAFW_PROP_C[0]"]);

                // "PROP_A[1]" is the same as "CCTAFW_PROP_A[1]" after mapping, so we expect that keys only includes "CCTAFW_PROP_A[1]" 1 time
                keys = dataSvc.mapKeys(["PROP_A[1]", "PROP_B", "CCTAFW_PROP_A[1]"]);
                expect(keys).toEqual(["CCTAFW_PROP_A[1]", "CCTAFW_PROP_B"]);

                keys = dataSvc.mapKeys(["PROP_A[99]", "PROP_B", "PROP_A[99]", "PROP_C"]); // "PROP_A[99]" is double
                expect(keys).toEqual(["CCTAFW_PROP_A[99]", "CCTAFW_PROP_B", "CCTAFW_PROP_C"]);

                keys = dataSvc.mapKeys(["PROP_A[0]", "PROP_B[54]", "CCTAFW_PROP_C"], 4711);
                expect(keys).toEqual(["CCTAFW_PROP_A[0]", "CCTAFW_PROP_B[54]", "CCTAFW_PROP_C"]);
                expect(dataSvc.getKeyMap(4711)).toEqual({ "CCTAFW_PROP_A[0]": "PROP_A[0]", "CCTAFW_PROP_B[54]": "PROP_B[54]" });

                // expect no adding to propRequestMap
                keys = dataSvc.mapKeys(["CCTAFW_PROP_A[1]", "CCTAFW_PROP_B[2]", "CCTAFW_PROP_C[3]"], 4911);
                expect(keys).toEqual(["CCTAFW_PROP_A[1]", "CCTAFW_PROP_B[2]", "CCTAFW_PROP_C[3]"]);
                expect(dataSvc.getKeyMap(4911)).toEqual({});

                // expect 1 more adding to propRequestMap
                keys = dataSvc.mapKeys(["PROP_B[59]"], 4911);
                expect(keys).toEqual(["CCTAFW_PROP_B[59]"]);
                expect(dataSvc.getKeyMap(4911)).toEqual({ "CCTAFW_PROP_B[59]": "PROP_B[59]" });

                keys = dataSvc.mapKeys(["PROP_C[1]"], 5001);
                expect(keys).toEqual(["CCTAFW_PROP_C[1]"]);
                expect(dataSvc.getKeyMap(5001)).toEqual({ "CCTAFW_PROP_C[1]": "PROP_C[1]" });

                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("checks mapKeys with attribute request prop.attr or prop.attr[1]", async done => {
            try {
                const dataSvc = new Svc();
                await dataSvc.updateJSONData();

                let keys = dataSvc.mapKeys(["PROP_A.foo[0]", "PROP_B.name", "CCTAFW_PROP_C.bar[0]"]);
                expect(keys).toEqual(["CCTAFW_PROP_A.foo[0]", "CCTAFW_PROP_B.name", "CCTAFW_PROP_C.bar[0]"]);

                keys = dataSvc.mapKeys(["PROP_A.foo[0]", "PROP_B.foo.bar[54]", "CCTAFW_PROP_C"], 4711);
                expect(keys).toEqual(["CCTAFW_PROP_A.foo[0]", "CCTAFW_PROP_B.foo.bar[54]", "CCTAFW_PROP_C"]);
                expect(dataSvc.getKeyMap(4711)).toEqual({
                    "CCTAFW_PROP_A.foo[0]": "PROP_A.foo[0]",
                    "CCTAFW_PROP_B.foo.bar[54]": "PROP_B.foo.bar[54]"
                });

                // expect no adding to propRequestMap
                keys = dataSvc.mapKeys(["CCTAFW_PROP_A.foo[1]", "CCTAFW_PROP_B.foo.bar[2]", "CCTAFW_PROP_C.bar.foo[3]"], 4911);
                expect(keys).toEqual(["CCTAFW_PROP_A.foo[1]", "CCTAFW_PROP_B.foo.bar[2]", "CCTAFW_PROP_C.bar.foo[3]"]);
                expect(dataSvc.getKeyMap(4911)).toEqual({});

                // expect 1 more adding to propRequestMap
                keys = dataSvc.mapKeys(["PROP_B.foo.bar"], 4911);
                expect(keys).toEqual(["CCTAFW_PROP_B.foo.bar"]);
                expect(dataSvc.getKeyMap(4911)).toEqual({ "CCTAFW_PROP_B.foo.bar": "PROP_B.foo.bar" });

                keys = dataSvc.mapKeys(["PROP_C.bar[1]"], 5001);
                expect(keys).toEqual(["CCTAFW_PROP_C.bar[1]"]);
                expect(dataSvc.getKeyMap(5001)).toEqual({ "CCTAFW_PROP_C.bar[1]": "PROP_C.bar[1]" });

                keys = dataSvc.mapKeys(["PROP_C.foo.1.bar[1]"], 5002);
                expect(keys).toEqual(["CCTAFW_PROP_C.foo.1.bar[1]"]);
                expect(dataSvc.getKeyMap(5002)).toEqual({ "CCTAFW_PROP_C.foo.1.bar[1]": "PROP_C.foo.1.bar[1]" });

                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("checks mapResponseKeys 1", async done => {
            try {
                const dataSvc = new Svc();
                await dataSvc.updateJSONData();

                dataSvc.mapKeys(["PROP_A", "PROP_B"], 4711);
                dataSvc.mapKeys(["PROP_A", "PROP_B"], 4911);

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
                expect(dataSvc.getKeyMap(4711)).toEqual({});

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
                expect(dataSvc.getKeyMap(4911)).toEqual({});
                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("checks mapResponseKeys 2", async done => {
            try {
                const dataSvc = new Svc();
                await dataSvc.updateJSONData();

                dataSvc.mapKeys(["PROP_A", "PROP_B"], 4711);
                dataSvc.mapKeys(["PROP_A", "PROP_B"], 4911);

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
                expect(dataSvc.getKeyMap(4711)).toEqual({});

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
                expect(dataSvc.getKeyMap(4911)).toEqual({});

                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("checks mapResponseKeys 3 (index and array requests)", async done => {
            try {
                const dataSvc = new Svc();
                await dataSvc.updateJSONData();

                dataSvc.mapKeys(["PROP_A[0]", "PROP_B"], 4711);
                dataSvc.mapKeys(["PROP_A", "PROP_B"], 4911);
                dataSvc.mapKeys(["PROP_C[A,5,9]", "PROP_B[A,1,2]"], 5000);

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
                expect(dataSvc.getKeyMap(4711)).toEqual({});

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
                expect(dataSvc.getKeyMap(4911)).toEqual({});

                response = dataSvc.mapResponseKeys(
                    {
                        "CCTAFW_PROP_C[A,5,9]": "xyz",
                        "CCTAFW_PROP_B[A,1,2]": "uvw"
                    },
                    5000
                );
                expect(response).toEqual({
                    "PROP_C[A,5,9]": "xyz",
                    "PROP_B[A,1,2]": "uvw"
                });
                expect(dataSvc.getKeyMap(5000)).toEqual({});

                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("checks setValues regarding key mapping", async done => {
            try {
                Wincor.UI.Service.ViewService = {
                    viewContext: { viewKey: "" },
                    registerForServiceEvent: () => { },
                    SERVICE_EVENTS: {}
                };
                const dataSvc = new Svc();
                dataSvc.serviceProvider.ViewService = Wincor.UI.Service.ViewService;
                await dataSvc.onServicesReady();
                await dataSvc.updateJSONData();
                spyOn(dataSvc, "mapKey").and.callThrough();
                dataSvc.setValues(["PROP_A", "PROP_B", "CCTAFW_PROP_C"], ["abc", "uvw", "123"]);
                expect(dataSvc.mapKey).toHaveBeenCalledTimes(3);
                expect(dataSvc.businessData["CCTAFW_PROP_A"]["*"]).toEqual("abc");
                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("checks setValues with double keys/values (1) regarding key mapping", async done => {
            try {
                Wincor.UI.Service.ViewService = {
                    viewContext: { viewKey: "" },
                    registerForServiceEvent: () => { },
                    SERVICE_EVENTS: {}
                };
                const dataSvc = new Svc();
                dataSvc.serviceProvider.ViewService = Wincor.UI.Service.ViewService;
                await dataSvc.onServicesReady();
                await dataSvc.updateJSONData();
                spyOn(dataSvc, "mapKey").and.callThrough();

                dataSvc.setValues(["PROP_A", "PROP_B", "PROP_A", "CCTAFW_PROP_C"], ["abc", "uvw", "xyz", "123"]); // setValues now filters out double keys/values...
                expect(dataSvc.mapKey).toHaveBeenCalledTimes(4); // ...so we expect already unique arguments here
                expect(dataSvc.businessData["CCTAFW_PROP_A"]["*"]).toEqual("abc");
                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("checks setValues with double keys/values (2) regarding key mapping", async done => {
            try {
                Wincor.UI.Service.ViewService = {
                    viewContext: { viewKey: "" },
                    registerForServiceEvent: () => { },
                    SERVICE_EVENTS: {}
                };
                const dataSvc = new Svc();
                dataSvc.serviceProvider.ViewService = Wincor.UI.Service.ViewService;
                await dataSvc.onServicesReady();
                await dataSvc.updateJSONData();
                spyOn(dataSvc, "mapKey").and.callThrough();

                dataSvc.setValues(["PROP_A", "PROP_B", "CCTAFW_PROP_A", "CCTAFW_PROP_C"], ["abc", "uvw", "xyz", "123"]); // "PROP_A" is same as "CCTAFW_PROP_A" after mapping
                expect(dataSvc.mapKey).toHaveBeenCalledTimes(4);
                expect(dataSvc.businessData["CCTAFW_PROP_A"]["*"]).toEqual("abc");
                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("checks setValues with double keys/values (3) regarding key mapping", async done => {
            try {
                Wincor.UI.Service.ViewService = {
                    viewContext: { viewKey: "" },
                    registerForServiceEvent: () => { },
                    SERVICE_EVENTS: {}
                };
                const dataSvc = new Svc();
                dataSvc.serviceProvider.ViewService = Wincor.UI.Service.ViewService;
                await dataSvc.onServicesReady();
                await dataSvc.updateJSONData();
                spyOn(dataSvc, "mapKey").and.callThrough();

                dataSvc.setValues(["CCTAFW_PROP_A", "PROP_A", "CCTAFW_PROP_A", "CCTAFW_PROP_C"], ["abc", "uvw", "xyz", "123"]); // "PROP_A" is same as "CCTAFW_PROP_A" after mapping
                expect(dataSvc.mapKey).toHaveBeenCalledTimes(4);
                expect(dataSvc.businessData["CCTAFW_PROP_A"]["*"]).toEqual("abc");
                done();
            } catch(e) {
                done.fail(e);
            }
        });
    });

    describe("property key mapping", () => {
        it("checks setValues propKey vs. propKey[0] - where propKey value is a plain string", async done => {
            try {
                Wincor.UI.Service.ViewService = {
                    viewContext: { viewKey: "" },
                    registerForServiceEvent: () => { },
                    SERVICE_EVENTS: {}
                };
                const dataSvc = new Svc();
                dataSvc.serviceProvider.ViewService = Wincor.UI.Service.ViewService;
                dataSvc.extractKeyPartsFromProperty = jasmine.createSpy("extractKeyPartsFromProperty").and.returnValue({
                    key: "CCTAFW_PROP_C",
                    idx: 0,
                    attrChain: null
                });
                await dataSvc.onServicesReady();
                await dataSvc.updateJSONData();
                dataSvc.setValues(["PROP_C"], ["TEST"]);
                expect(dataSvc.businessData["CCTAFW_PROP_C"]["*"]).toEqual("TEST");
                dataSvc.setValues(["PROP_C[0]"], ["HELLO"]);
                expect(dataSvc.businessData["CCTAFW_PROP_C"]["*"]).toEqual("HELLO");
                expect(dataSvc.extractKeyPartsFromProperty).toHaveBeenCalledWith("CCTAFW_PROP_C[0]");
                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("checks setValues propKey vs. propKey[0] - where propKey value is an array", async done => {
            try {
                Wincor.UI.Service.ViewService = {
                    viewContext: { viewKey: "" },
                    registerForServiceEvent: () => { },
                    SERVICE_EVENTS: {}
                };
                const dataSvc = new Svc();
                dataSvc.serviceProvider.ViewService = Wincor.UI.Service.ViewService;
                dataSvc.extractKeyPartsFromProperty = jasmine.createSpy("extractKeyPartsFromProperty").and.returnValue({
                    key: "CCTAFW_PROP_D",
                    idx: 0,
                    attrChain: null
                });
                await dataSvc.onServicesReady();
                await dataSvc.updateJSONData();
                dataSvc.setValues(["PROP_D"], ["TEST"]);
                expect(dataSvc.businessData["CCTAFW_PROP_D"]["*"][0]).toEqual("TEST");
                dataSvc.setValues(["PROP_D[0]"], ["HELLO"]);
                expect(dataSvc.businessData["CCTAFW_PROP_D"]["*"][0]).toEqual("HELLO");
                expect(dataSvc.extractKeyPartsFromProperty).toHaveBeenCalledWith("CCTAFW_PROP_D[0]");
                done();
            } catch(e) {
                done.fail(e);
            }
        });

        it("checks setValues propKey vs. propKey[1] - where propKey value is an array", async done => {
            try {
                Wincor.UI.Service.ViewService = {
                    viewContext: { viewKey: "" },
                    registerForServiceEvent: () => { },
                    SERVICE_EVENTS: {}
                };
                const dataSvc = new Svc();
                dataSvc.serviceProvider.ViewService = Wincor.UI.Service.ViewService;
                dataSvc.extractKeyPartsFromProperty = jasmine.createSpy("extractKeyPartsFromProperty").and.returnValue({
                    key: "CCTAFW_PROP_D",
                    idx: 1,
                    attrChain: null
                });
                dataSvc.buildKeyFromParts = jasmine.createSpy("buildKeyFromParts").and.returnValue("CCTAFW_PROP_D[1]");
                await dataSvc.onServicesReady();
                await dataSvc.updateJSONData();
                dataSvc.setValues(["PROP_D"], ["TEST"]);
                expect(dataSvc.businessData["CCTAFW_PROP_D"]["*"][0]).toEqual("TEST");
                dataSvc.setValues(["PROP_D[1]"], ["HELLO"]);
                expect(dataSvc.businessData["CCTAFW_PROP_D"]["*"][1]).toEqual("HELLO");
                expect(dataSvc.extractKeyPartsFromProperty).toHaveBeenCalledWith("CCTAFW_PROP_D[1]");
                expect(dataSvc.buildKeyFromParts).toHaveBeenCalledWith({
                    key: "CCTAFW_PROP_D",
                    idx: 1,
                    attrChain: null
                });
                done();
            } catch(e) {
                done.fail(e);
            }
        });
    });
});
