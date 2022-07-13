/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ wn.UI.Service.BaseServiceMock_test.js 4.3.1-210505-21-c0d9f31f-1a04bc7d

*/

import { WincorNamespace } from "../../../../GUI_UnitTesting/NamespaceMock.js";
import getExtensions from "../../../lib/internal/wn.UI.extensions.js";
import getServiceClass from "../../../../GUIAPP/core/servicemocks/wn.UI.Service.BaseServiceMock.js";

let Wincor;
let FakeServiceProvider;
let Svc;
const NAME = "TestService";

/*global jQuery:false*/
describe("BaseServiceMock", () => {

    beforeEach(done => {
        Wincor = new WincorNamespace();
        const LogProvider = Wincor.UI.Diagnostics.LogProvider;
        FakeServiceProvider = {
            LogProvider: LogProvider,
            ConfigService: Wincor.UI.Service.Provider.ConfigService,
            ViewService: Wincor.UI.Service.Provider.ViewService
        };
        
        Svc = getServiceClass({Wincor, ext: getExtensions({Wincor, LogProvider}), jQuery, LogProvider, GatewayProvider: Wincor.UI.Gateway.GatewayProvider, Gateway: Wincor.UI.Gateway});
        jasmine.clock().install();
        done();
    });

    afterEach(() => {
        jasmine.clock().uninstall();
    });

    describe("property resolving", () => {
    
        it("propResolver check recursion limit", async() => {
            const mock = new Svc(NAME, {ServiceProvider: FakeServiceProvider});
            const GUI_KEY = "[%WX_TEXT[GUI_ADA_PRIVACY_START];WX_ADA_SPEAK_PRIVATE%] [&CCHPFW_PROP_DISPLAY_VARIABLE[0];#Filter;&]";
            spyOn(mock, "getPropValue").and.returnValue(GUI_KEY);
            spyOn(mock, "extractKeyPartsFromProperty").and.returnValue(GUI_KEY);
            let template = mock.propResolver(GUI_KEY, {});
            expect(mock.getPropValue).toHaveBeenCalledTimes(50);
            expect(mock.extractKeyPartsFromProperty).toHaveBeenCalledTimes(50);
            expect(template).toBe("");
        });
    
    });

    describe("wx text keys", () => {
        it("wxtKeyResolver return unresolved", async() => {
            const mock = new Svc(NAME, {ServiceProvider: FakeServiceProvider});
            //const GUI_KEY = "[%WX_TEXT[GUI_ADA_PRIVACY_START];WX_ADA_SPEAK_PRIVATE%]Account number: [&CCHPFW_PROP_DISPLAY_VARIABLE[0];#Filter;&], Name: [&CCHPFW_PROP_DISPLAY_VARIABLE[1];;&], Account balance: [&CCHPFW_PROP_DISPLAY_VARIABLE[2];;&], [&CCHPFW_PROP_DISPLAY_VARIABLE[3];;&], [&CCHPFW_PROP_DISPLAY_VARIABLE[4];;&]. {#datasets#}[%WX_TEXT[GUI_ADA_PRIVACY_STOP];WX_ADA_SPEAK_ALL%]";
            const GUI_KEY = "TEST";

            spyOn(mock, "getTextValue").and.returnValue("");
            spyOn(mock, "propResolver").and.callFake(val => {
                return val;
            });
            let template = mock.wxtKeyResolver(GUI_KEY, {}, {});
            expect(mock.getTextValue).not.toHaveBeenCalled();
            expect(mock.propResolver).not.toHaveBeenCalled();
            expect(template).toBe("TEST");
        });

        it("wxtKeyResolver return resolved text", async() => {
            const mock = new Svc(NAME, {ServiceProvider: FakeServiceProvider});
            const GUI_KEY = "[%WX_TEXT[GUI_ADA_PRIVACY_START];WX_ADA_SPEAK_PRIVATE%]";
            spyOn(mock, "getTextValue").and.returnValue("This text");
            spyOn(mock, "propResolver").and.callFake(val => {
                return val;
            });
            let template = mock.wxtKeyResolver(GUI_KEY, {}, {});
            expect(mock.getTextValue).toHaveBeenCalledTimes(1);
            expect(mock.propResolver).toHaveBeenCalledTimes(1);
            expect(template).toBe("This text");
        });

        it("wxtKeyResolver check recursion limit", async() => {
            const mock = new Svc(NAME, {ServiceProvider: FakeServiceProvider});
            const GUI_KEY = "[%WX_TEXT[GUI_ADA_PRIVACY_START];WX_ADA_SPEAK_PRIVATE%]";
            spyOn(mock, "getTextValue").and.returnValue(GUI_KEY);
            spyOn(mock, "propResolver").and.returnValue(GUI_KEY);
            let template = mock.wxtKeyResolver(GUI_KEY, {}, {});
            expect(mock.getTextValue).toHaveBeenCalledTimes(150);
            expect(mock.propResolver).toHaveBeenCalledTimes(150);
            expect(template).toBe("");
        });

    });
    
    describe("helper functions tests", () => {
        it("checks isIndexedPropertyKey", async() => {
            const mock = new Svc(NAME, {ServiceProvider: FakeServiceProvider});
            let b = mock.isIndexedPropertyKey("CCTAFW_PROP_TARGET_ACCOUNT_DATA");
            expect(b).toBe(false);
            b = mock.isIndexedPropertyKey("CCTAFW_PROP_TARGET_ACCOUNT_DATA[1]");
            expect(b).toBe(true);
            b = mock.isIndexedPropertyKey("CCTAFW_PROP_TARGET_ACCOUNT_DATA[A,1]");
            expect(b).toBe(false);
            b = mock.isIndexedPropertyKey("CCTAFW_PROP_TARGET_ACCOUNT_DATA.id.[1]");
            expect(b).toBe(true);
            b = mock.isIndexedPropertyKey("CCTAFW_PROP_TARGET_ACCOUNT_DATA.data.id[1]");
            expect(b).toBe(true);
            b = mock.isIndexedPropertyKey(null);
            expect(b).toBe(false);
        });

        it("checks extractKeyPartsFromProperty", async() => {
            const mock = new Svc(NAME, {ServiceProvider: FakeServiceProvider});
            let parts = mock.extractKeyPartsFromProperty("CCTAFW_PROP_TARGET_ACCOUNT_DATA");
            expect(parts).toEqual(jasmine.objectContaining({
                key: "CCTAFW_PROP_TARGET_ACCOUNT_DATA",
                idx: -1,
                attrChain: null
            }));
            parts = mock.extractKeyPartsFromProperty("CCTAFW_PROP_TARGET_ACCOUNT_DATA[1]");
            expect(parts).toEqual(jasmine.objectContaining({
                key: "CCTAFW_PROP_TARGET_ACCOUNT_DATA",
                idx: 1,
                attrChain: null
            }));
            parts = mock.extractKeyPartsFromProperty("CCTAFW_PROP_TARGET_ACCOUNT_DATA.id[1]");
            expect(parts).toEqual(jasmine.objectContaining({
                key: "CCTAFW_PROP_TARGET_ACCOUNT_DATA",
                idx: 1,
                attrChain: ["id"]
            }));
            parts = mock.extractKeyPartsFromProperty("CCTAFW_PROP_TARGET_ACCOUNT_DATA.id");
            expect(parts).toEqual(jasmine.objectContaining({
                key: "CCTAFW_PROP_TARGET_ACCOUNT_DATA",
                idx: -1,
                attrChain: ["id"]
            }));
            parts = mock.extractKeyPartsFromProperty("CCTAFW_PROP_TARGET_ACCOUNT_DATA.data.id");
            expect(parts).toEqual(jasmine.objectContaining({
                key: "CCTAFW_PROP_TARGET_ACCOUNT_DATA",
                idx: -1,
                attrChain: ["data", "id"]
            }));
            parts = mock.extractKeyPartsFromProperty("CCTAFW_PROP_MIXTURE_DISPLAY_DATA.denominations.2.val");
            expect(parts).toEqual(jasmine.objectContaining({
                key: "CCTAFW_PROP_MIXTURE_DISPLAY_DATA",
                idx: -1,
                attrChain: ["denominations", "2", "val"]
            }));
            parts = mock.extractKeyPartsFromProperty("CCTAFW_PROP_MIXTURE_DISPLAY_DATA.denominations.0.count");
            expect(parts).toEqual(jasmine.objectContaining({
                key: "CCTAFW_PROP_MIXTURE_DISPLAY_DATA",
                idx: -1,
                attrChain: ["denominations", "0", "count"]
            }));
            parts = mock.extractKeyPartsFromProperty("CCTAFW_PROP_TARGET_ACCOUNT_DATA.account.amount[1]");
            expect(parts).toEqual(jasmine.objectContaining({
                key: "CCTAFW_PROP_TARGET_ACCOUNT_DATA",
                idx: 1,
                attrChain: ["account", "amount"]
            }));
            parts = mock.extractKeyPartsFromProperty("CCTAFW_PROP_TARGET_ACCOUNT_DATA.account.data.amount[2]");
            expect(parts).toEqual(jasmine.objectContaining({
                key: "CCTAFW_PROP_TARGET_ACCOUNT_DATA",
                idx: 2,
                attrChain: ["account", "data", "amount"]
            }));
            parts = mock.extractKeyPartsFromProperty(null);
            expect(parts).toEqual(jasmine.objectContaining({
                key: "",
                idx: -1,
                attrChain: null
            }));
        });

        it("checks buildKeyFromParts", async() => {
            const mock = new Svc(NAME, {ServiceProvider: FakeServiceProvider});
            let key = mock.buildKeyFromParts({key: "CCTAFW_PROP_TARGET_ACCOUNT_DATA", idx: -1, attrChain: null});
            expect(key).toBe("CCTAFW_PROP_TARGET_ACCOUNT_DATA");
            key = mock.buildKeyFromParts({key: "CCTAFW_PROP_TARGET_ACCOUNT_DATA", idx: 1, attrChain: null});
            expect(key).toBe("CCTAFW_PROP_TARGET_ACCOUNT_DATA[1]");
            key = mock.buildKeyFromParts({key: "CCTAFW_PROP_TARGET_ACCOUNT_DATA", idx: 0, attrChain: null});
            expect(key).toBe("CCTAFW_PROP_TARGET_ACCOUNT_DATA[0]");
            key = mock.buildKeyFromParts({key: "CCTAFW_PROP_TARGET_ACCOUNT_DATA", idx: 1, attrChain: ["id"]});
            expect(key).toBe("CCTAFW_PROP_TARGET_ACCOUNT_DATA.id[1]");
            key = mock.buildKeyFromParts({key: "CCTAFW_PROP_TARGET_ACCOUNT_DATA", idx: 1, attrChain: ["data", "id"]});
            expect(key).toBe("CCTAFW_PROP_TARGET_ACCOUNT_DATA.data.id[1]");
            key = mock.buildKeyFromParts({key: "CCTAFW_PROP_TARGET_ACCOUNT_DATA", idx: 2, attrChain: ["data", "3", "id"]});
            expect(key).toBe("CCTAFW_PROP_TARGET_ACCOUNT_DATA.data.3.id[2]");
            key = mock.buildKeyFromParts({key: "CCTAFW_PROP_TARGET_ACCOUNT_DATA", idx: -1, attrChain: ["data", "id"]});
            expect(key).toBe("CCTAFW_PROP_TARGET_ACCOUNT_DATA.data.id");
            key = mock.buildKeyFromParts({key: "CCTAFW_PROP_TARGET_ACCOUNT_DATA", idx: -1, attrChain: ["id"]});
            expect(key).toBe("CCTAFW_PROP_TARGET_ACCOUNT_DATA.id");
            key = mock.buildKeyFromParts(null);
            expect(key).toBe("");
        });

        it("checks getValueFromJSON", async() => {
            const mock = new Svc(NAME, {ServiceProvider: FakeServiceProvider});
            const jsonVal = JSON.stringify({data: {id: "ACC_1"}});
            const mixture = "{\"amount\":\"10000\",\"currency\":\"EUR\",\"symbol\":\"€\",\"ada\":\"Euro\",\"exponent\":\"-2\",\"maxnotes\":60,\"maxcoins\":50," +
                "\"denominations\":[{\"type\":0,\"count\":10,\"val\":500,\"softLimit\":20},{\"type\":0,\"count\":20,\"val\":1000,\"softLimit\":20}," +
                "{\"type\":0,\"count\":5,\"val\":2000,\"softLimit\":20}]}";
            let val = mock.getValueFromJSON(jsonVal, ["data", "id"]);
            expect(val).toEqual("ACC_1");
            val = mock.getValueFromJSON(jsonVal, ["data"]);
            expect(val).toEqual(JSON.stringify({id: "ACC_1"}));
            val = mock.getValueFromJSON(mixture, ["denominations", "1", "val"]);
            expect(val).toEqual(1000);
            val = mock.getValueFromJSON(mixture, ["denominations", "0", "count"]);
            expect(val).toEqual(10);
            val = mock.getValueFromJSON(mixture, ["denominations", "0"]);
            expect(val).toEqual("{\"type\":0,\"count\":10,\"val\":500,\"softLimit\":20}");
            val = mock.getValueFromJSON(mixture, ["ada"]);
            expect(val).toEqual("Euro");
            // attr chain don't match:
            val = mock.getValueFromJSON(jsonVal, ["id"]);
            expect(val).toEqual(jsonVal);
            // parsing error:
            val = mock.getValueFromJSON("{", ["id"]);
            expect(val).toEqual("{");
            // wrong args
            val = mock.getValueFromJSON(jsonVal, []);
            expect(val).toEqual(jsonVal);
            // wrong args
            val = mock.getValueFromJSON(jsonVal, null);
            expect(val).toEqual(jsonVal);
        });

        it("checks setValueFromJSON", async() => {
            const mock = new Svc(NAME, {ServiceProvider: FakeServiceProvider});
            const jsonVal = JSON.stringify({data: {id: "ACC_1", val: "200"}, amount: "5000"});
            const mixture = "{\"amount\":\"10000\",\"currency\":\"EUR\",\"symbol\":\"€\",\"ada\":\"Euro\",\"exponent\":\"-2\",\"maxnotes\":60,\"maxcoins\":50," +
                "\"denominations\":[{\"type\":0,\"count\":10,\"val\":500,\"softLimit\":20},{\"type\":0,\"count\":20,\"val\":1000,\"softLimit\":20}," +
                "{\"type\":0,\"count\":5,\"val\":2000,\"softLimit\":20}]}";
            let res = mock.setValueFromJSON(jsonVal, ["amount"], "1000");
            expect(res).toEqual(JSON.stringify({data: {id: "ACC_1", val: "200"}, amount: "1000"}));
            res = mock.setValueFromJSON(jsonVal, ["data", "id"], "ACC_2");
            expect(res).toEqual(JSON.stringify({data: {id: "ACC_2", val: "200"}, amount: "5000"}));
            res = mock.setValueFromJSON(mixture, ["denominations", "1", "count"], 200);
            expect(res).toEqual("{\"amount\":\"10000\",\"currency\":\"EUR\",\"symbol\":\"€\",\"ada\":\"Euro\",\"exponent\":\"-2\",\"maxnotes\":60,\"maxcoins\":50," +
                "\"denominations\":[{\"type\":0,\"count\":10,\"val\":500,\"softLimit\":20},{\"type\":0,\"count\":200,\"val\":1000,\"softLimit\":20}," +
                "{\"type\":0,\"count\":5,\"val\":2000,\"softLimit\":20}]}");
            // replace whole array element:
            res = mock.setValueFromJSON(mixture, ["denominations", "0"], "{\"type\":0,\"count\":100,\"val\":5000,\"softLimit\":20}");
            expect(res).toEqual("{\"amount\":\"10000\",\"currency\":\"EUR\",\"symbol\":\"€\",\"ada\":\"Euro\",\"exponent\":\"-2\",\"maxnotes\":60,\"maxcoins\":50," +
                "\"denominations\":[{\"type\":0,\"count\":100,\"val\":5000,\"softLimit\":20},{\"type\":0,\"count\":20,\"val\":1000,\"softLimit\":20}," +
                "{\"type\":0,\"count\":5,\"val\":2000,\"softLimit\":20}]}");
            // attr chain don't match:
            res = mock.setValueFromJSON(jsonVal, ["id"], "ACC_2");
            expect(res).toEqual(jsonVal);
            // parsing error:
            res = mock.setValueFromJSON("{", ["id"], "ACC_2");
            expect(res).toEqual("{");
            // wrong args
            res = mock.setValueFromJSON(jsonVal, [], "ACC_2");
            expect(res).toEqual(jsonVal);
            // wrong args
            res = mock.setValueFromJSON(jsonVal, null, null);
            expect(res).toEqual(jsonVal);
        });

    });

    describe("higher level functions tests", () => {
        it("checks getPropValue", async() => {
            const mock = new Svc(NAME, {ServiceProvider: FakeServiceProvider});
            const businessData = {
                "CCTAFW_PROP_TARGET_ACCOUNT_DATA": {
                    "*": ["{\"id\":\"account_1\",\"splitAmount\":\"100000\"},{\"id\":\"account_2\",\"splitAmount\":\"50000\"}", "{\"id\":\"account_11\",\"splitAmount\":\"100001\"}", "{\"id\":\"account_22\",\"splitAmount\":\"50001\"}", null, null, null, null, null, null, null, null, null]
                },
                "CCTAFW_PROP_COUTFAST_CURRENCY": {
                    "*": ["EUR", "€", "Euro"]
                },
                "CCTAFW_PROP_CURRENCY": {
                    "*": "EUR"
                },
                "CCTAFW_PROP_DOCUMENT_DATA_JSON": {
                    "*": "",
                    "DocumentScanResult": "{ \"images\": [ { \"imagePath\": \"style/default/images/dm/1280px-DE_Licence_2013_Back.jpg\", \"aspect\": \"Back\" }, { \"imagePath\": \"style/default/images/dm/1280px-DE_Licence_2013_Front.jpg\", \"aspect\": \"Front\" } ] }",
                    "SignatureScanResult": "{ \"images\": [ { \"imagePath\": \"style/default/images/dm/signature_john_doe.png\", \"aspect\": \"Front\" }] }",
                    "ViewPaidCheques": "{ \"images\": [ { \"imagePath\": \"style/default/images/01f.jpg\", \"aspect\": \"Front\" },{ \"imagePath\": \"style/default/images/01b.jpg\", \"aspect\": \"Back\" } ] }"
                },
                "GUIAPP_ACTIVE_VIEWSET": {
                    "*": "touch"
                }
            };
            FakeServiceProvider.ControlPanelService = {
                updateBusinessProperties: jasmine.createSpy("updateBusinessProperties")
            };
            FakeServiceProvider.DataService = {
                getPropertyString: jasmine.createSpy("getPropertyString")
            };
            mock.onServicesReady();
            let value = mock.getPropValue({key: "CCTAFW_PROP_CURRENCY", idx: -1, attrChain: null}, businessData);
            expect(value).toBe("EUR");
            value = mock.getPropValue({key: "CCTAFW_PROP_CURRENCY", idx: 0, attrChain: null}, businessData);
            expect(value).toBe("EUR");
            value = mock.getPropValue({key: "CCTAFW_PROP_CURRENCY", idx: 999, attrChain: null}, businessData);
            expect(value).toBe("EUR");
            value = mock.getPropValue({key: "CCTAFW_PROP_COUTFAST_CURRENCY", idx: -1, attrChain: null}, businessData);
            expect(value).toBe("EUR");
            value = mock.getPropValue({key: "CCTAFW_PROP_COUTFAST_CURRENCY", idx: 1, attrChain: null}, businessData);
            expect(value).toBe("€");
            value = mock.getPropValue({key: "CCTAFW_PROP_COUTFAST_CURRENCY", idx: 2, attrChain: null}, businessData);
            expect(value).toBe("Euro");
            value = mock.getPropValue({key: "CCTAFW_PROP_COUTFAST_CURRENCY", idx: 999, attrChain: null}, businessData);
            expect(value).toBe(-1);
            value = mock.getPropValue({key: "CCTAFW_PROP_TARGET_ACCOUNT_DATA", idx: 1, attrChain: ["id"]}, businessData);
            expect(value).toBe("account_11");
            value = mock.getPropValue({key: "CCTAFW_PROP_TARGET_ACCOUNT_DATA", idx: 5, attrChain: null}, businessData);
            expect(value).toBe(-1);
            value = mock.getPropValue({key: "CCTAFW_PROP_TARGET_ACCOUNT_DATA", idx: 999, attrChain: ["id"]}, businessData);
            expect(value).toBe(-1);
            FakeServiceProvider.ViewService.viewContext.viewKey = "DocumentScanResult";
            value = mock.getPropValue({key: "CCTAFW_PROP_DOCUMENT_DATA_JSON", idx: 0, attrChain: ["images", "0", "imagePath"]}, businessData);
            expect(value).toBe("style/default/images/dm/1280px-DE_Licence_2013_Back.jpg");
            value = mock.getPropValue({key: "CCTAFW_PROP_DOCUMENT_DATA_JSON", idx: 0, attrChain: ["images", "1", "imagePath"]}, businessData);
            expect(value).toBe("style/default/images/dm/1280px-DE_Licence_2013_Front.jpg");
            FakeServiceProvider.ViewService.viewContext.viewKey = "SignatureScanResult";
            value = mock.getPropValue({key: "CCTAFW_PROP_DOCUMENT_DATA_JSON", idx: 0, attrChain: ["images", "0", "aspect"]}, businessData);
            expect(value).toBe("Front");
            // Wrong index:
            value = mock.getPropValue({key: "CCTAFW_PROP_DOCUMENT_DATA_JSON", idx: 0, attrChain: ["images", "1", "aspect"]}, businessData);
            expect(value).toBe("{ \"images\": [ { \"imagePath\": \"style/default/images/dm/signature_john_doe.png\", \"aspect\": \"Front\" }] }");
            FakeServiceProvider.ViewService.viewContext.viewKey = "ViewPaidCheques";
            value = mock.getPropValue({key: "CCTAFW_PROP_DOCUMENT_DATA_JSON", idx: 0, attrChain: ["images", "1", "aspect"]}, businessData);
            expect(value).toBe("Back");
            // Property string:
            FakeServiceProvider.ConfigService.configuration.instanceName = "GUIAPP";
            value = mock.getPropValue({key: "GUIAPP_ACTIVE_VIEWSET", idx: -1, attrChain: null}, businessData);
            expect(value).toBe(-1);
            expect(FakeServiceProvider.DataService.getPropertyString).toHaveBeenCalledWith({propertyName: "GUIAPP_ACTIVE_VIEWSET", propertyValue: ""});
        });
    });
});

