/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ wn.UI.Service.FormatService_test.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

import { WincorNamespace } from "../../../../GUI_UnitTesting/NamespaceMock.js";
import getExtensions from "../../../lib/internal/wn.UI.extensions.js";
import getServiceClass from "../../../../GUIAPP/core/service/wn.UI.Service.FormatService.js";

let Wincor;
let Svc;

/*global jQuery:false*/
describe("FormatService", () => {

    const FORMAT_CONFIG = {
        "en-US": {
            CurrDecimalSep: ".",
            CurrGroupSep: ",",
            CurrPositiveOrder: 0
        }
    };
    
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
    
        Wincor.UI.Service.Provider.LocalizeService.getLanguageMapping = () => {
            return {
                isoToName: {},
                nameToIso: {},
                defaultLanguage: "" // will become the ISO code
            };
        };
    
        const LogProvider = Wincor.UI.Diagnostics.LogProvider;
        Svc = getServiceClass({ Wincor, jQuery, ext: getExtensions({Wincor, LogProvider}), LogProvider, PTService });
        
        done();
    });

    // tear down after any of the specs
    afterEach(() => {
    });

    describe("initialization", () => {
        it("uses correct logical name", async() => {
            const formatSvc = new Svc();
            expect(formatSvc.NAME).toBe("FormatService");
        });

    });

    describe("formatHelper statements", () => {
        it("checks formatHelper: '#C'", async() => {
            const formatSvc = new Svc();
            formatSvc.config = FORMAT_CONFIG;
            await formatSvc.onServicesReady();
            formatSvc.bankingContext = Wincor.createMockObject("currencyData.symbol");
            formatSvc.bankingContext.currencyData.symbol = "$";
            formatSvc.bankingContext.currencyData.exponent = -2;
            const pattern = "#C";
            let out = formatSvc.formatHelper("0", pattern);
            expect(out).toBe("0.00");
            out = formatSvc.formatHelper("1", pattern);
            expect(out).toBe("0.01");
            out = formatSvc.formatHelper("10", pattern);
            expect(out).toBe("0.10");
            out = formatSvc.formatHelper("100", pattern);
            expect(out).toBe("1.00");
            out = formatSvc.formatHelper("10000", pattern);
            expect(out).toBe("100.00");
            out = formatSvc.formatHelper("1000000", pattern);
            expect(out).toBe("10,000.00");
            out = formatSvc.formatHelper("100000000", pattern);
            expect(out).toBe("1,000,000.00");
        });

        it("checks formatHelper: '#M'", async() => {
            const formatSvc = new Svc();
            formatSvc.config = FORMAT_CONFIG;
            await formatSvc.onServicesReady();
            formatSvc.bankingContext = Wincor.createMockObject("currencyData.symbol");
            formatSvc.bankingContext.currencyData.symbol = "$";
            formatSvc.bankingContext.currencyData.exponent = -2;
            const pattern = "#M";
            let out = formatSvc.formatHelper("0", pattern);
            expect(out).toBe("$ 0.00");
            out = formatSvc.formatHelper("1", pattern);
            expect(out).toBe("$ 0.01");
            out = formatSvc.formatHelper("10", pattern);
            expect(out).toBe("$ 0.10");
            out = formatSvc.formatHelper("100", pattern);
            expect(out).toBe("$ 1.00");
            out = formatSvc.formatHelper("10000", pattern);
            expect(out).toBe("$ 100.00");
            out = formatSvc.formatHelper("1000000", pattern);
            expect(out).toBe("$ 10,000.00");
            out = formatSvc.formatHelper("100000000", pattern);
            expect(out).toBe("$ 1,000,000.00");
        });

        it("checks formatHelper: '#ATRM0'", async() => {
            const formatSvc = new Svc();
            formatSvc.config = FORMAT_CONFIG;
            await formatSvc.onServicesReady();
            formatSvc.bankingContext = Wincor.createMockObject("currencyData.symbol");
            formatSvc.bankingContext.currencyData.symbol = "$";
            formatSvc.bankingContext.currencyData.exponent = -2;
            const pattern = "#ATRM0";
            let out = formatSvc.formatHelper("0", pattern);
            expect(out).toBe("$ 0");
            out = formatSvc.formatHelper("1", pattern);
            expect(out).toBe("$ 0.01");
            out = formatSvc.formatHelper("10", pattern);
            expect(out).toBe("$ 0.10");
            out = formatSvc.formatHelper("100", pattern);
            expect(out).toBe("$ 1");
            out = formatSvc.formatHelper("1000", pattern);
            expect(out).toBe("$ 10");
            out = formatSvc.formatHelper("10000", pattern);
            expect(out).toBe("$ 100");
            out = formatSvc.formatHelper("1000000", pattern);
            expect(out).toBe("$ 10,000");
            out = formatSvc.formatHelper("100000000", pattern);
            expect(out).toBe("$ 1,000,000");
        });

        it("checks formatHelper: '#aTRM0'", async() => {
            const formatSvc = new Svc();
            formatSvc.config = FORMAT_CONFIG;
            await formatSvc.onServicesReady();
            formatSvc.bankingContext = Wincor.createMockObject("currencyData.symbol");
            formatSvc.bankingContext.currencyData.symbol = "$";
            formatSvc.bankingContext.currencyData.exponent = -2;
            const pattern = "#aTRM0";
            let out = formatSvc.formatHelper("0", pattern);
            expect(out).toBe("0");
            out = formatSvc.formatHelper("1", pattern);
            expect(out).toBe("0.01");
            out = formatSvc.formatHelper("10", pattern);
            expect(out).toBe("0.10");
            out = formatSvc.formatHelper("100", pattern);
            expect(out).toBe("1");
            out = formatSvc.formatHelper("1000", pattern);
            expect(out).toBe("10");
            out = formatSvc.formatHelper("10000", pattern);
            expect(out).toBe("100");
            out = formatSvc.formatHelper("1000000", pattern);
            expect(out).toBe("10,000");
            out = formatSvc.formatHelper("100000000", pattern);
            expect(out).toBe("1,000,000");
        });

        it("checks formatHelper: '#x+-4:4'", async() => {
            const formatSvc = new Svc();
            formatSvc.config = FORMAT_CONFIG;
            await formatSvc.onServicesReady();
            formatSvc.bankingContext = Wincor.createMockObject("currencyData.symbol");
            formatSvc.bankingContext.currencyData.symbol = "$";
            formatSvc.bankingContext.currencyData.exponent = -2;
            let  pattern = "#x+-4:4";
            let out = formatSvc.formatHelper("1234567890", pattern);
            expect(out).toBe("xxxxxx7890");
            out = formatSvc.formatHelper("1", pattern);
            expect(out).toBe("1");
            out = formatSvc.formatHelper("10", pattern);
            expect(out).toBe("10");
            out = formatSvc.formatHelper("100", pattern);
            expect(out).toBe("100");
            out = formatSvc.formatHelper("1000", pattern);
            expect(out).toBe("1000");
            out = formatSvc.formatHelper("10000", pattern);
            expect(out).toBe("x0000");
            out = formatSvc.formatHelper("1000000", pattern);
            expect(out).toBe("xxx0000");
            pattern = "#x+-2:4";
            out = formatSvc.formatHelper("1000000", pattern);
            expect(out).toBe("xxx0000");
        });

        it("checks formatHelper: '#*+-4:4'", async() => {
            const formatSvc = new Svc();
            formatSvc.config = FORMAT_CONFIG;
            await formatSvc.onServicesReady();
            formatSvc.bankingContext = Wincor.createMockObject("currencyData.symbol");
            formatSvc.bankingContext.currencyData.symbol = "$";
            formatSvc.bankingContext.currencyData.exponent = -2;
            let pattern = "#*+-4:4";
            let out = formatSvc.formatHelper("1234567890", pattern);
            expect(out).toBe("******7890");
            out = formatSvc.formatHelper("1", pattern);
            expect(out).toBe("1");
            out = formatSvc.formatHelper("10", pattern);
            expect(out).toBe("10");
            out = formatSvc.formatHelper("100", pattern);
            expect(out).toBe("100");
            out = formatSvc.formatHelper("1000", pattern);
            expect(out).toBe("1000");
            out = formatSvc.formatHelper("10000", pattern);
            expect(out).toBe("*0000");
            out = formatSvc.formatHelper("1000000", pattern);
            expect(out).toBe("***0000");
        });

        it("checks formatHelper: '#X*', '#Xx', '#XX'", async() => {
            const formatSvc = new Svc();
            formatSvc.config = FORMAT_CONFIG;
            await formatSvc.onServicesReady();
            formatSvc.bankingContext = Wincor.createMockObject("currencyData.symbol");
            formatSvc.bankingContext.currencyData.symbol = "$";
            formatSvc.bankingContext.currencyData.exponent = -2;
            let pattern = "#X*";
            let out = formatSvc.formatHelper("1234567890", pattern);
            expect(out).toBe("**********");
            out = formatSvc.formatHelper("1", pattern);
            expect(out).toBe("*");
            out = formatSvc.formatHelper("10", pattern);
            expect(out).toBe("**");
            out = formatSvc.formatHelper("100", pattern);
            expect(out).toBe("***");
            pattern = "#Xx";
            out = formatSvc.formatHelper("1234567890", pattern);
            expect(out).toBe("xxxxxxxxxx");
            pattern = "#XX";
            out = formatSvc.formatHelper("1234567890", pattern);
            expect(out).toBe("XXXXXXXXXX");
        });

    });

    describe("format statements", () => {
        it("checks synchronous format: '#aTRM0'", async() => {
            const formatSvc = new Svc();
            formatSvc.config = FORMAT_CONFIG;
            await formatSvc.onServicesReady();
            formatSvc.bankingContext = Wincor.createMockObject("currencyData.symbol");
            formatSvc.bankingContext.currencyData.symbol = "$";
            formatSvc.bankingContext.currencyData.exponent = -2;
            let pattern = "#aTRM0";
            let value = {raw: "1"};
            formatSvc.format(value, pattern, null, true);
            expect(value.result).toBe("0.01");
            value.raw = "1000";
            formatSvc.format(value, pattern, null, true);
            expect(value.result).toBe("10");
        });

        it("checks asynchronous format: '#aTRM0'", async() => {
            const formatSvc = new Svc();
            formatSvc.config = FORMAT_CONFIG;
            await formatSvc.onServicesReady();
            formatSvc.bankingContext = Wincor.createMockObject("currencyData.symbol");
            formatSvc.bankingContext.currencyData.symbol = "$";
            formatSvc.bankingContext.currencyData.exponent = -2;
            let pattern = "#aTRM0";
            let value = {raw: "1"};
            formatSvc.format(value, pattern, value => {
                expect(value.result).toBe("0.01");
            }, false);
            
            value.raw = "1000";
            formatSvc.format(value, pattern, value => {
                expect(value.result).toBe("10");
            }, false);
        });

    });
    
    describe("format conditionals", () => {
        it("checks asynchronous format: value is a number which isn't in pattern string", async() => {
            const formatSvc = new Svc();
            formatSvc.config = FORMAT_CONFIG;
            await formatSvc.onServicesReady();
            formatSvc.bankingContext = Wincor.createMockObject("currencyData.symbol");
            const pattern = "#conditional{\"1\":\"activated\", \"0\":\"deactivated\"}";
            const value = {raw: 2};
            formatSvc.format(value, pattern, value => {
                expect(value.result).toBe(2);
            }, false);
        });
        
        it("checks synchronous format: $val replacement in pattern string", async() => {
            const formatSvc = new Svc();
            formatSvc.config = FORMAT_CONFIG;
            await formatSvc.onServicesReady();
            formatSvc.bankingContext = Wincor.createMockObject("currencyData.symbol");
            const pattern = "#conditional{\"1\":\"activated $val\", \"0\":\"$val deactivated\", \"2\":\"$val\"}";
            const value = {raw: 1};
            formatSvc.format(value, pattern, null, true);
            expect(value.result).toBe("activated 1");
            value.raw = 0;
            formatSvc.format(value, pattern, null, true);
            expect(value.result).toBe("0 deactivated");
            value.raw = 2;
            formatSvc.format(value, pattern, null, true);
            expect(value.result).toBe("2");
        });
        
        it("checks synchronous format: value is a number which is in pattern string", async() => {
            const formatSvc = new Svc();
            formatSvc.config = FORMAT_CONFIG;
            await formatSvc.onServicesReady();
            formatSvc.bankingContext = Wincor.createMockObject("currencyData.symbol");
            const pattern = "#conditional{\"1\":\"activated\", \"0\":\"deactivated\"}";
            const value = {raw: 1};
            formatSvc.format(value, pattern, null, true);
            expect(value.result).toBe("activated");
            value.raw = 0;
            formatSvc.format(value, pattern, null, true);
            expect(value.result).toBe("deactivated");
        });
        
        it("checks synchronous format: value is a string or number which is found/not found in pattern string", async() => {
            const formatSvc = new Svc();
            formatSvc.config = FORMAT_CONFIG;
            await formatSvc.onServicesReady();
            formatSvc.bankingContext = Wincor.createMockObject("currencyData.symbol");
            const pattern = "#conditional{\"1\":\"activated\", \"0\":\"deactivated\"}";
            const value = {raw: "1"};
            formatSvc.format(value, pattern, null, true);
            expect(value.result).toBe("activated");
            // check a value (number) is not in conditional
            value.raw = 2;
            formatSvc.format(value, pattern, null, true);
            expect(typeof value.result === "number").toBe(true);
            expect(value.result).toBe(2);
            // check a value (string) is not in conditional
            value.raw = "2";
            formatSvc.format(value, pattern, null, true);
            expect(typeof value.result === "string").toBe(true);
            expect(value.result).toBe("2");
            
        });
        
        it("can't be JSON parsed - fall into catch block", async() => {
            const formatSvc = new Svc();
            formatSvc.config = FORMAT_CONFIG;
            await formatSvc.onServicesReady();
            formatSvc.bankingContext = Wincor.createMockObject("currencyData.symbol");
            const pattern = "#conditional{1:\"activated\", 0:\"deactivated\"}";
            const value = {raw: "1"};
            formatSvc.format(value, pattern, null, true);
            expect(value.result).toBe("1");
            value.raw = 0;
            formatSvc.format(value, pattern, null, true);
            expect(value.result).toBe(0);
        });
    });
});

