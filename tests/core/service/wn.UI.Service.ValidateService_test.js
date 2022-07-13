/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ wn.UI.Service.ValidateService_test.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

import { WincorNamespace } from "../../../../GUI_UnitTesting/NamespaceMock.js";
import getServiceClass from "../../../../GUIAPP/core/service/wn.UI.Service.ValidateService.js";

let Wincor;
let Svc;

/*global jQuery:false*/
describe("wn.UI.Service.ValidateService", () => {
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
        Svc = getServiceClass({ Wincor, LogProvider, PTService });
        done();
    });

    // tear down after any of the specs
    afterEach(() => {
    });

    describe("initialization", () => {

        it("implements basic service attributes", done => {
            const valSvc = new Svc();
            expect(valSvc.NAME).toBe("ValidateService");
            done();
        });
    });


    describe("privateInputIsFalse", () => {
        it("checks whether the logging is done", done => {

            let logSpy = spyOn(Wincor.UI.Diagnostics.LogProvider,"log");
            Wincor.UI.Diagnostics.LogProvider.LOG_DETAIL = true;

            const valSvc = new Svc();
            valSvc.serviceProvider.ViewService.viewContext = {
                viewConfig: {
                    privateInput: false
                }
            };
            valSvc.onServicesReady();

            // 1 log
            valSvc.isWithinMinLength("abcde", 5);
            // 1 log
            valSvc.isWithinMaxLength("abcde", 5);
            // 3 logs
            valSvc.isWithinLength("abcde", 1, 5);
            // 2 logs
            valSvc.matchesForbiddenPattern("abcde", "^\\s+$");

            expect(logSpy).toHaveBeenCalledTimes(7);
            done();
        });
    });

    describe("privateInputIsTrue", () => {
        it("checks whether the input value is not logged", done => {

            let logSpy = spyOn(Wincor.UI.Diagnostics.LogProvider,"log");
            Wincor.UI.Diagnostics.LogProvider.LOG_DETAIL = true;

            const valSvc = new Svc();
            valSvc.serviceProvider.ViewService.viewContext = {
                viewConfig: {
                    privateInput: true
                }
            };
            valSvc.onServicesReady();

            valSvc.isWithinMinLength("abcde", 5);

            valSvc.isWithinMaxLength("abcde", 5);

            valSvc.isWithinLength("abcde", 1, 5);

            valSvc.matchesForbiddenPattern("abcde", "^\\s+$");

            expect(logSpy).toHaveBeenCalledTimes(0);
            done();
        });
    });

    describe("isWithinMinLength", () => {
        it("checks whether a value are longer or equal to a specific length", done => {

            const valSvc = new Svc();
            valSvc.serviceProvider.ViewService.viewContext = {
                viewConfig: {
                    privateInput: true
                }

            };
            valSvc.onServicesReady();

            const TESTS = [
                {
                    testValue: "",
                    testMin: 0,
                    expectedResult: true
                },
                {
                    testValue: "",
                    testMin: 10,
                    expectedResult: false
                },
                {
                    testValue: void 0,
                    testMin: 0,
                    expectedResult: false
                },
                {
                    testValue: void 0,
                    testMin: 10,
                    expectedResult: false
                },
                {
                    testValue: null,
                    testMin: 0,
                    expectedResult: false
                },
                {
                    testValue: null,
                    testMin: 10,
                    expectedResult: false
                },
                {
                    testValue: "abcde",
                    testMin: 2,
                    expectedResult: true
                },
                {
                    testValue: "abcde",
                    testMin: 5,
                    expectedResult: true
                },
                {
                    testValue: "abcde",
                    testMin: 10,
                    expectedResult: false
                },
                {
                    testValue: "    ",
                    testMin: 5,
                    expectedResult: false
                },
                {
                    testValue: "  ",
                    testMin: 1,
                    expectedResult: true
                },
                {
                    testValue: "abc",
                    testMin: 0,
                    expectedResult: true
                },
                {
                    testValue: "abc",
                    testMin: null,
                    expectedResult: true
                },
                {
                    testValue: "abc",
                    testMin: void 0,
                    expectedResult: true
                },
                {
                    testValue: "",
                    testMin: void 0,
                    expectedResult: true
                }

            ];

            let idx = 0;
            TESTS.forEach(({testValue, testMin, expectedResult}) => {
                let res = valSvc.isWithinMinLength(testValue, testMin);
                expect(res).toBe(expectedResult, "at testdata index " + idx + ": value (" + testValue + ") maxLen (" + testMin + ")");
                idx++;
            });

            done();
        });
    });

    describe("isWithinMaxLength", () => {
        it("checks whether a value is smaller or equal to a specific length", done => {
            const valSvc = new Svc();
            valSvc.serviceProvider.ViewService.viewContext = {
                viewConfig: {
                    privateInput: true
                }

            };
            valSvc.onServicesReady();

            const TESTS = [
                {
                    testValue: "",
                    testMax: 0,
                    expectedResult: true
                },
                {
                    testValue: "",
                    testMax: 10,
                    expectedResult: true
                },
                {
                    testValue: void 0,
                    testMax: 0,
                    expectedResult: false
                },
                {
                    testValue: void 0,
                    testMax: 10,
                    expectedResult: false
                },
                {
                    testValue: null,
                    testMax: 0,
                    expectedResult: false
                },
                {
                    testValue: null,
                    testMax: 10,
                    expectedResult: false
                },
                {
                    testValue: "abcde",
                    testMax: 2,
                    expectedResult: false
                },
                {
                    testValue: "abcde",
                    testMax: 5,
                    expectedResult: true
                },
                {
                    testValue: "abcde",
                    testMax: 10,
                    expectedResult: true
                },
                {
                    testValue: "    ",
                    testMax: 5,
                    expectedResult: true
                },
                {
                    testValue: "  ",
                    testMax: 1,
                    expectedResult: false
                },
                {
                    testValue: "abc",
                    testMax: 0,
                    expectedResult: false
                },
                {
                    testValue: "abc",
                    testMax: null,
                    expectedResult: false
                },
                {
                    testValue: "abc",
                    testMax: void 0,
                    expectedResult: true
                },
                {
                    testValue: "",
                    testMax: void 0,
                    expectedResult: true
                }

            ];

            let idx = 0;
            TESTS.forEach(({testValue, testMax, expectedResult}) => {
                let res = valSvc.isWithinMaxLength(testValue, testMax);
                expect(res).toBe(expectedResult, "at testdata index " + idx + ": value (" + testValue + ") maxLen (" + testMax + ")");
                idx++;
            });
            done();
        });
    });

    describe("isWithinLength", () => {
        it("checks whether a value is within a specific length", done => {
            const valSvc = new Svc();
            valSvc.serviceProvider.ViewService.viewContext = {
                viewConfig: {
                    privateInput: true
                }

            };
            valSvc.onServicesReady();

            const TESTS = [
                {
                    testValue: "",
                    testMin: 0,
                    testMax: 0,
                    expectedResult: true
                },
                {
                    testValue: "",
                    testMin: 0,
                    testMax: 10,
                    expectedResult: true
                },
                {
                    testValue: "",
                    testMin: 10,
                    testMax: 10,
                    expectedResult: false
                },
                {
                    testValue: void 0,
                    testMin: 0,
                    testMax: 0,
                    expectedResult: false
                },
                {
                    testValue: void 0,
                    testMin: 0,
                    testMax: 10,
                    expectedResult: false
                },
                {
                    testValue: void 0,
                    testMin: 10,
                    testMax: 10,
                    expectedResult: false
                },
                {
                    testValue: null,
                    testMin: 0,
                    testMax: 0,
                    expectedResult: false
                },
                {
                    testValue: null,
                    testMin: 0,
                    testMax: 10,
                    expectedResult: false
                },
                {
                    testValue: null,
                    testMin: 10,
                    testMax: 10,
                    expectedResult: false
                },
                {
                    testValue: "abcde",
                    testMin: 0,
                    testMax: 2,
                    expectedResult: false
                },
                {
                    testValue: "abcde",
                    testMin: 0,
                    testMax: 5,
                    expectedResult: true
                },
                {
                    testValue: "abcde",
                    testMin: 0,
                    testMax: 10,
                    expectedResult: true
                },
                {
                    testValue: "abcde",
                    testMin: 10,
                    testMax: 10,
                    expectedResult: false
                },
                {
                    testValue: "abcde",
                    testMax: 2,
                    expectedResult: false
                },
                {
                    testValue: "abcde",
                    testMin: 0,
                    expectedResult: true
                },
                {
                    testValue: "    ",
                    testMin: 0,
                    testMax: 5,
                    expectedResult: true
                },
                {
                    testValue: "  ",
                    testMin: 0,
                    testMax: 1,
                    expectedResult: false
                },
                {
                    testValue: "",
                    testMin: 0,
                    testMax: 5,
                    expectedResult: true
                },
                {
                    testValue: "1",
                    testMin: void 0,
                    testMax: 5,
                    expectedResult: true
                },
                {
                    testValue: "1",
                    testMin: 0,
                    testMax: void 0,
                    expectedResult: true
                },
                {
                    testValue: "abc",
                    testMin: 0,
                    testMax: 0,
                    expectedResult: false
                },
                {
                    testValue: "",
                    testMin: 0,
                    testMax: 0,
                    expectedResult: true
                },
                {
                    testValue: void 0,
                    testMin: 0,
                    testMax: 0,
                    expectedResult: false
                },
                {
                    testValue: void 0,
                    testMin: 0,
                    testMax: 10,
                    expectedResult: false
                },
                {
                    testValue: "abc",
                    testMin: 0,
                    testMax: null,
                    expectedResult: false
                },
                {
                    testValue: "abc",
                    testMin: null,
                    testMax: 10,
                    expectedResult: true
                },
                {
                    testValue: "abc",
                    expectedResult: true
                },
                {
                    testValue: "",
                    expectedResult: true
                },
                {
                    testValue: void 0,
                    expectedResult: false
                },
                {
                    testValue: null,
                    expectedResult: false
                }
            ];

            let idx = 0;
            TESTS.forEach(({testValue, testMin, testMax, expectedResult}) => {
                let res = valSvc.isWithinLength(testValue, testMin, testMax);
                expect(res).toBe(expectedResult, "at testdata index " + idx + ": value (" + testValue + ") minLen (" + testMin+ ") maxLen (" + testMax + ")");
                idx++;
            });
            done();
        });
    });

    describe("matchesForbiddenPattern", () => {
        it("checks whether a value matches a specific patterns", done => {
            const valSvc = new Svc();

            valSvc.serviceProvider.ViewService.viewContext = {
                viewConfig: {
                    privateInput: true
                }

            };
            valSvc.onServicesReady();

            const TESTS = [
                {
                    testValue: " ",
                    testPattern: "^\\s+$",
                    expectedResult: true
                },
                {
                    testValue: "    ",
                    testPattern: "^\\s+$",
                    expectedResult: true
                },
                {
                    testValue: " a  ",
                    testPattern: "^\\s+$",
                    expectedResult: false
                },
                {
                    testValue: " Meier",
                    testPattern: "^\\s+$",
                    expectedResult: false
                },
                {
                    testValue: " Meier",
                    testPattern: "Meier",
                    expectedResult: true
                },
                {
                    testValue: "Meier",
                    testPattern: void 0,
                    expectedResult: false
                },
                {
                    testValue: "",
                    testPattern: void 0,
                    expectedResult: false
                },
                {
                    testValue: void 0,
                    testPattern: void 0,
                    expectedResult: false
                },
                {
                    testValue: "xyz",
                    testPattern: "gr[",
                    expectedResult: false
                }
            ];

            let idx = 0;
            TESTS.forEach(({testValue, testPattern, expectedResult}) => {
                let res = valSvc.matchesForbiddenPattern(testValue, testPattern);
                expect(res).toBe(expectedResult, "at testdata index " + idx + ": value (" + testValue + ") pattern (" + testPattern+ ")");
                idx++;
            });
            done();
        });
    });
});

