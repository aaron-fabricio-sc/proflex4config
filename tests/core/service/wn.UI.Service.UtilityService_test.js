/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ wn.UI.Service.UtilityService_test.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

import { WincorNamespace } from "../../../../GUI_UnitTesting/NamespaceMock.js";
import getExtensions from "../../../lib/internal/wn.UI.extensions.js";
import getServiceClass from "../../../../GUIAPP/core/service/wn.UI.Service.UtilityService.js";

let Wincor;
let Svc;

/*global jQuery:false*/
describe("wn.UI.Service.UtilityService", () => {

    // setup before any of the specs
    beforeEach(done => {
        Wincor = new WincorNamespace();

        class PTService extends Wincor.UI.Service.PTService {
            FrmResolve = Wincor.returnPromiseResolvingArg(
                0, // dont care, we give fixed arg[3]
                1, // delay in ms
                1, // callback argument is on index 1 for FrmResolve
                0  // Fixed result / resolved argument is 0
            );
    
            FRM_RESOLVE_REQUEST = {MOCKS: "FRM_RESOLVE_REQUEST"};
            FRM_ASYNC_RESOLVE_REQUEST = {MOCKS: "FRM_ASYNC_RESOLVE_REQUEST"};
            
            hasReceivers = () => true;
        
            translateResponse() {
            }
        
            sendRequest() {
            }
        
            sendEvent() {
            }
        }
    
        const LogProvider = Wincor.UI.Diagnostics.LogProvider;
        Svc = getServiceClass({ Wincor, ext: getExtensions({Wincor, LogProvider}), LogProvider, PTService });
        
        done();
    });

    // tear down after any of the specs
    afterEach(() => {
    });

    it("has default WORKING_DIRS", done => {
        const utilSvc = new Svc();
        expect(typeof utilSvc.WORKING_DIRS).toBe("object");
        expect(Object.keys(utilSvc.WORKING_DIRS).length).toBe(2);
        expect(utilSvc.WORKING_DIRS.TRANSACTION).toBe("/TEMP_TRANSACTION/");
        expect(utilSvc.WORKING_DIRS.SESSION).toBe("/TEMP_SESSION/");
        done();
    });

    describe("general", () => {
        it("calls base-class constructor function", done => { // done is used for async behavior
            // require service. All dependencies are mocked by "beforeEach" above
            const utilSvc = new Svc();
            expect(utilSvc.NAME).toBe("UtilityService");
            expect(Object.keys(utilSvc.IMG_FORMAT).length).toBe(30);
            expect(utilSvc.IMG_FORMAT).toEqual(jasmine.objectContaining({
                "UNKNOWN": -1,
                "BMP": 0,
                "ICO": 1,
                "JPEG": 2,
                "JPG": 2,
                "JNG": 3,
                "KOALA": 4,
                "LBM": 5,
                "IFF": 5,
                "MNG": 6,
                "PBM": 7,
                "PBMRAW": 8,
                "PCD": 9,
                "PCX": 10,
                "PGM": 11,
                "PGMRAW": 12,
                "PNG": 13,
                "PPM": 14,
                "PPMRAW": 15,
                "RAS": 16,
                "TARGA": 17,
                "TIFF": 18,
                "WBMP": 19,
                "PSD": 20,
                "CUT": 21,
                "XBM": 22,
                "XPM": 23,
                "DDS": 24,
                "GIF": 25,
                "HDR": 26
            }));
            done();
        });

        it("translates response to RC", done => { // done is used for async behavior
            // require service. All dependencies are mocked by "beforeEach" above
            const utilSvc = new Svc();
            const MSG = {
                fake: "property",
                RC: 1234
            };
            expect(utilSvc.translateResponse(MSG)).toBe(1234);
            done();
        });
    });

    describe("image stuff", () => {
        it("can use imageConverter to load an image", done => { // done is used for async behavior
            // require service. All dependencies are mocked by "beforeEach" above
            const utilSvc = new Svc();
            const fileName = "testfile";
            const fileFormat = "JPG";
            const flags = 0;

            spyOn(utilSvc, "FrmResolve").and.callThrough();
            const ret = utilSvc.imgConvLoadImage(fileName, fileFormat, flags);
            expect(ret.then !== void 0).toBe(true);
            ret
                .then(() => {
                    expect(utilSvc.FrmResolve).toHaveBeenCalledTimes(1);
                    expect(utilSvc.FrmResolve.calls.first().args[0])
                        .toEqual(jasmine.objectContaining({
                            FWName: "CCImgCnv",
                            FWFuncID: 3,
                            param1: fileFormat,
                            meta1: ["SHORT", 0],
                            param2: fileName,
                            meta2: ["CHAR_ANSI", -1],
                            param3: flags,
                            meta3: ["USHORT", 0],
                            paramUL: 0
                        }));
                    done();
                })
                .catch((e) => {
                    done.fail(e);
                });
        });

        it("can use imageConverter to unload an image", done => { // done is used for async behavior
            // require service. All dependencies are mocked by "beforeEach" above
            const utilSvc = new Svc();

            spyOn(utilSvc, "FrmResolve").and.callThrough();

            const ret = utilSvc.imgConvUnloadImage();
            expect(ret.then !== void 0).toBe(true);
            ret
                .then(() => {
                    expect(utilSvc.FrmResolve).toHaveBeenCalledTimes(1);
                    expect(utilSvc.FrmResolve.calls.first().args[0])
                        .toEqual(jasmine.objectContaining({
                            FWName: "CCImgCnv",
                            FWFuncID: 4,
                            param1: "",
                            meta1: ["NULL", 0],
                            param2: "",
                            meta2: ["NULL", 0],
                            param3: "",
                            meta3: ["NULL", 0],
                            paramUL: 0
                        }));
                    done();
                })
                .catch((e) => {
                    done.fail(e);
                });
        });

        it("can use imageConverter to save an image", done => { // done is used for async behavior
            // require service. All dependencies are mocked by "beforeEach" above
            const utilSvc = new Svc();
            const fileName = "testfile";
            const fileFormat = "JPG";
            const flags = 0;

            spyOn(utilSvc, "FrmResolve").and.callThrough();

            const ret = utilSvc.imgConvSaveImage(fileName, fileFormat, flags);
            expect(ret.then !== void 0).toBe(true);
            ret
                .then(() => {
                    expect(utilSvc.FrmResolve).toHaveBeenCalledTimes(1);
                    expect(utilSvc.FrmResolve.calls.first().args[0])
                        .toEqual(jasmine.objectContaining({
                            FWName: "CCImgCnv",
                            FWFuncID: 5,
                            param1: fileFormat,
                            meta1: ["SHORT", 0],
                            param2: fileName,
                            meta2: ["CHAR_ANSI", -1],
                            param3: flags,
                            meta3: ["USHORT", 0],
                            paramUL: 0
                        }));
                    done();
                })
                .catch((e) => {
                    done.fail(e);
                });
        });

        it("can convert image file types", done => { // done is used for async behavior
            // require service. All dependencies are mocked by "beforeEach" above
            const utilSvc = new Svc();
            const fileName = "testfile";
            const fileFormat = "JPG";
            const tgtFileName = "testfile";
            const tgtFileFormat = "BMP";

            utilSvc.imgConvLoadImage = Wincor.returnPromiseResolvingArg(0,1,-1);
            spyOn(utilSvc, "imgConvLoadImage").and.callThrough();

            utilSvc.imgConvSaveImage = Wincor.returnPromiseResolvingArg(0,1,-1);
            spyOn(utilSvc, "imgConvSaveImage").and.callThrough();

            utilSvc.imgConvUnloadImage = Wincor.returnPromiseResolvingArg(0,1,-1);
            spyOn(utilSvc, "imgConvUnloadImage").and.callThrough();

            const ret = utilSvc.convertFileType(fileName, fileFormat, tgtFileName, tgtFileFormat);
            expect(ret.then !== void 0).toBe(true);
            ret
                .then(() => {
                    expect(utilSvc.imgConvLoadImage).toHaveBeenCalledTimes(1);
                    expect(utilSvc.imgConvLoadImage).toHaveBeenCalledWith(fileName, 2/*"JPG*/, 0);
                    expect(utilSvc.imgConvSaveImage).toHaveBeenCalledTimes(1);
                    expect(utilSvc.imgConvSaveImage).toHaveBeenCalledWith(tgtFileName, 0/*"BMP*/, 0);
                    expect(utilSvc.imgConvUnloadImage).toHaveBeenCalledTimes(1);
                    done();
                })
                .catch((e) => {
                    done.fail(e);
                });
        });

        it("rejects to convert unknown src file types", done => { // done is used for async behavior
            // require service. All dependencies are mocked by "beforeEach" above
            const utilSvc = new Svc();
            const fileName = "testfile";
            const fileFormat = "TEST";
            const tgtFileName = "testfile";
            const tgtFileFormat = "BMP";


            const ret = utilSvc.convertFileType(fileName, fileFormat, tgtFileName, tgtFileFormat);
            expect(ret.then !== void 0).toBe(true);
            ret
                .then(() => {
                    done.fail("Unexpected resolve!");
                }, (reason) => {
                    expect(reason).toBeTruthy();
                    expect(ret.isRejected()).toBe(true);
                    done();
                })
                .catch((e) => {
                    done.fail(e);
                });
        });

        it("rejects to convert unknown target file types", done => { // done is used for async behavior
            // require service. All dependencies are mocked by "beforeEach" above
            const utilSvc = new Svc();
            const fileName = "testfile";
            const fileFormat = "JPG";
            const tgtFileName = "testfile";
            const tgtFileFormat = "TEST";


            const ret = utilSvc.convertFileType(fileName, fileFormat, tgtFileName, tgtFileFormat);
            expect(ret.then !== void 0).toBe(true);
            ret
                .then(() => {
                    done.fail("Unexpected resolve!");
                }, (reason) => {
                    expect(reason).toBeTruthy();
                    expect(ret.isRejected()).toBe(true);
                    done();
                })
                .catch((e) => {
                    done.fail(e);
                });
        });

        it("can saveImageToFile with auto conversion", done => { // done is used for async behavior
            // require service. All dependencies are mocked by "beforeEach" above
            Wincor.applicationRoot = "c:/mytest/base";
            const utilSvc = new Svc();
            const fileName = "testfile";
            const fileFormat = "JPG";
            const tgtFileFormat = "BMP";
            const DATA = "thisIsBase64CodedImageDataNormally";
            const ASSEMBLED_FILENAME = "c:/mytest/base/WORK/TEMP_TRANSACTION/testfile.JPG";
            Wincor.UI.Gateway.prototype.REQUEST = {
                REQUEST: true
            };
    
            utilSvc.sendRequest = jasmine.createSpy("sendRequest");
            utilSvc.sendRequest = utilSvc.sendRequest.and.callFake((obj, cb) => {
                setTimeout(() => {cb(0)}, 1);
            });
            utilSvc.convertFileType = Wincor.returnPromiseResolvingArg();

            const ret = utilSvc.saveImageToFile(fileName, DATA, fileFormat, "MYID", tgtFileFormat);
            ret
                .then(() => {
                    expect(utilSvc.sendRequest).toHaveBeenCalledTimes(1);
                    expect(utilSvc.sendRequest.calls.first().args[0]).toEqual(jasmine.objectContaining({
                        service: "UtilityService",
                        methodName: "SaveFile",
                        path: ASSEMBLED_FILENAME,
                        content: DATA,
                        isBase64: true,
                        REQUEST: true
                    }));
                    expect(typeof utilSvc.sendRequest.calls.first().args[1]).toBe("function");
                    expect(utilSvc.savedFiles.includes(ASSEMBLED_FILENAME)).toBe(true);
                    expect(utilSvc.savedFiles.length).toBe(2);// original and converted, therefore 2!
                    done();
                })
                .catch(done.fail);
        });

        it("can saveImageToFile with path relative to root", done => { // done is used for async behavior
            // require service. All dependencies are mocked by "beforeEach" above
            Wincor.applicationRoot = "c:/mytest/base";
            const utilSvc = new Svc();
            const fileName = "/BLA/testfile";
            const fileFormat = "JPG";
            const tgtFileFormat = "BMP";
            const DATA = "thisIsBase64CodedImageDataNormally";
            Wincor.UI.Gateway.prototype.REQUEST = {
                REQUEST: true
            };
            utilSvc.sendRequest = jasmine.createSpy("sendRequest");
            utilSvc.sendRequest = utilSvc.sendRequest.and.callFake((obj, cb) => {
                setTimeout(() => {cb(0)}, 1);
            });
            utilSvc.convertFileType = Wincor.returnPromiseResolvingArg();

            const ret = utilSvc.saveImageToFile(fileName, DATA, fileFormat, "MYID", tgtFileFormat);
            ret
                .then(() => {
                    expect(utilSvc.sendRequest).toHaveBeenCalledTimes(1);
                    expect(utilSvc.sendRequest.calls.first().args[0]).toEqual(jasmine.objectContaining({
                        service: "UtilityService",
                        methodName: "SaveFile",
                        path: "c:/mytest/base/WORK/BLA/testfile.JPG",
                        content: DATA,
                        isBase64: true,
                        REQUEST: true
                    }));
                    expect(typeof utilSvc.sendRequest.calls.first().args[1]).toBe("function");
                    done();
                })
                .catch(done.fail);
        });

        it("can clearImageStore", done => { // done is used for async behavior
            // require service. All dependencies are mocked by "beforeEach" above
            const utilSvc = new Svc();
            const FILE1 = "/relativePath/to/file1";
            const FILE2 = "file2";

            Wincor.UI.Gateway.prototype.REQUEST = {
                REQUEST: true
            };
            utilSvc.sendRequest = jasmine.createSpy("sendRequest");
            utilSvc.sendRequest = utilSvc.sendRequest.and.callFake((obj, cb) => {
                setTimeout(() => {cb(true)}, 1);
            });

            // prepare imageStore
            utilSvc.savedFiles.push(FILE1);
            utilSvc.savedFiles.push(FILE2);

            const ret = utilSvc.clearImageStore();
            ret
                .then(() => {
                    expect(utilSvc.sendRequest).toHaveBeenCalledTimes(2); // once for any file
                    expect(utilSvc.sendRequest.calls.argsFor(0)[0]).toEqual(jasmine.objectContaining({
                        service: "UtilityService",
                        methodName: "DeleteFile",
                        path: FILE1
                    }));
                    expect(typeof utilSvc.sendRequest.calls.argsFor(0)[1]).toBe("function");
                    expect(utilSvc.sendRequest.calls.argsFor(1)[0]).toEqual(jasmine.objectContaining({
                        service: "UtilityService",
                        methodName: "DeleteFile",
                        path: FILE2
                    }));
                    expect(typeof utilSvc.sendRequest.calls.argsFor(1)[1]).toBe("function");
                    done();
                })
                .catch(done.fail);
        });

        it("registers for  clearImageStore", done => { // done is used for async behavior

            // require service. All dependencies are mocked by "beforeEach" above
            Wincor.applicationRoot = "c:/mytest/base";
            const utilSvc = new Svc();
            const REGISTRY_IMAGESTORE = "pathToImageStore/";
            Wincor.UI.Service.Provider.ConfigService.configuration.instanceName = "GUITEST";

            // check some defaults
            expect(utilSvc.savedFiles).toEqual([]);
            expect(utilSvc.imageStore).toBe("c:/mytest/base/WORK/TEMP_TRANSACTION/");
            expect(utilSvc.imageStoreRoot).toBe("c:/mytest/base/WORK");
            expect(utilSvc.targetFileType).toBe("bmp");
            expect(utilSvc.FRM_ASYNC_RESOLVE_REQUEST.service).toBe("UtilityService");
            expect(utilSvc.FRM_ASYNC_RESOLVE_REQUEST.FWName).toBe("CCTransactionFW");
            expect(utilSvc.PATHS).toEqual({});

            // spy for call to clearImageStore
            spyOn(utilSvc, "clearImageStore");
            Wincor.UI.Service.Provider.EventService.whenReady = Wincor.returnPromiseResolvingArg()(); // function returns function, so call twice for ready resolved promise...
            Wincor.UI.Service.Provider.ConfigService.getConfiguration = Wincor.returnPromiseResolvingArg(0, 1, -1, {ImageStore: REGISTRY_IMAGESTORE});
            spyOn(Wincor.UI.Service.Provider.ConfigService, "getConfiguration").and.callThrough();

            // spy for call to registerForServiceEvent
            Wincor.UI.Service.Provider.EventService.registerForEvent = jasmine.createSpy("registerForEvent")
                .and.callFake((id, name, cb) => {
                    // the callback function sets a timeout by 1ms, so we have to install a mock clock
                    jasmine.clock().install();
                    // fake this event by calling cb directly, this should trigger "clearImageStore
                    cb();
                });


            const ret = utilSvc.onServicesReady();
            
            ret.then(() => {
                jasmine.clock().tick(2);
                expect(utilSvc.clearImageStore).toHaveBeenCalledTimes(1);
                expect(Wincor.UI.Service.Provider.ConfigService.getConfiguration).toHaveBeenCalledTimes(1);
                expect(Wincor.UI.Service.Provider.ConfigService.getConfiguration).toHaveBeenCalledWith("GUITEST\\Services\\UtilityService", ["ImageStore", "ImageDefaultTargetFileType"]);
                jasmine.clock().uninstall();
                done();
            }).catch(done.fail);
        });

        it("checks imageStoreRoot", done => { // done is used for async behavior
            Wincor.applicationRoot = "c:/mytest/base";

            const utilSvc = new Svc();

            expect(utilSvc.imageStoreRoot).toBe("c:/mytest/base/WORK");
            done();
        });
    });

    describe("window transparency", () => {
        it("can set transparent window color by string", done => { // done is used for async behavior
            // require service. All dependencies are mocked by "beforeEach" above
            const utilSvc = new Svc();
            Wincor.UI.Service.Provider.ConfigService.configuration.instanceName = "GUITEST";

            spyOn(utilSvc, "FrmResolve").and.callThrough();

            const ret = utilSvc.setTransparentWindowColor("#FFFFFF");
            expect(ret.then !== void 0).toBe(true);
            ret
                .then(() => {
                    expect(utilSvc.FrmResolve).toHaveBeenCalledTimes(1);
                    expect(utilSvc.FrmResolve.calls.first().args[0])
                        .toEqual(jasmine.objectContaining({
                            FWName: "GUITEST",
                            FWFuncID: 4028,
                            param1: 16777215, //#FFFFFF
                            meta1: ["ULONG", 0],
                            param2: "",
                            meta2: ["NULL", 0],
                            param3: "",
                            meta3: ["NULL", 0],
                            param4: "",
                            meta4: ["NULL", 0],
                            paramUL: 0
                        }));
                    done();
                })
                .catch((e) => {
                    done.fail(e);
                });
        });

        it("can set transparent window color by rgb object", done => { // done is used for async behavior
            const utilSvc = new Svc();
            Wincor.UI.Service.Provider.ConfigService.configuration.instanceName = "GUITEST";

            spyOn(utilSvc, "FrmResolve").and.callThrough();

            const ret = utilSvc.setTransparentWindowColor({r: 255, g: 255, b: 255});
            expect(ret.then !== void 0).toBe(true);
            ret
                .then(() => {
                    expect(utilSvc.FrmResolve).toHaveBeenCalledTimes(1);
                    expect(utilSvc.FrmResolve.calls.first().args[0])
                        .toEqual(jasmine.objectContaining({
                            FWName: "GUITEST",
                            FWFuncID: 4028,
                            param1: 16777215, //{r: 255, g: 255, b: 255}
                            meta1: ["ULONG", 0],
                            param2: "",
                            meta2: ["NULL", 0],
                            param3: "",
                            meta3: ["NULL", 0],
                            param4: "",
                            meta4: ["NULL", 0],
                            paramUL: 0
                        }));
                    done();
                })
                .catch((e) => {
                    done.fail(e);
                });
        });

        it("rejects to set transparent window color by invalid string argument", done => { // done is used for async behavior
            // require service. All dependencies are mocked by "beforeEach" above
            const utilSvc = new Svc();
            Wincor.UI.Service.Provider.ConfigService.configuration.instanceName = "GUITEST";

            spyOn(utilSvc, "FrmResolve").and.callThrough();

            const ret = utilSvc.setTransparentWindowColor("TEST");
            expect(ret.then !== void 0).toBe(true);
            ret
                .then(done.fail, (reason) => {
                    expect(ret.isRejected()).toBe(true);
                    done();
                })
                .catch((e) => {
                    done.fail(e);
                });
        });

        it("rejects to set transparent window color by invalid object argument", done => { // done is used for async behavior
            const utilSvc = new Svc();
            Wincor.UI.Service.Provider.ConfigService.configuration.instanceName = {r:255};

            spyOn(utilSvc, "FrmResolve").and.callThrough();

            const ret = utilSvc.setTransparentWindowColor("TEST");
            expect(ret.then !== void 0).toBe(true);
            ret
                .then(done.fail, (reason) => {
                    expect(ret.isRejected()).toBe(true);
                    done();
                })
                .catch((e) => {
                    done.fail(e);
                });
        });
    });

    describe("subflows", () => {
        it("can callFlow to run sub-flows", done => { // done is used for async behavior
            const utilSvc = new Svc();
            const FLOWNAME = "TESTFLOW";

            spyOn(utilSvc, "FrmResolve").and.callThrough();

            const ret = utilSvc.callFlow(FLOWNAME);
            ret
                .then(() => {
                    expect(utilSvc.FrmResolve).toHaveBeenCalledTimes(1);
                    expect(utilSvc.FrmResolve.calls.first().args[0])
                        .toEqual(jasmine.objectContaining({
                            MOCKS: 'FRM_ASYNC_RESOLVE_REQUEST',
                            FWName: "CCTransactionFW",
                            FWFuncID: 8,
                            param1: "PROFLEX4_UI_UTILITY_SERVICE                                     ",
                            meta1: ["CHAR_ANSI", -1],
                            param2: "CALL_SCRIPT",
                            meta2: ["CHAR_ANSI", -1],
                            param3: FLOWNAME,
                            meta3: ["CHAR_ANSI", -1],
                            paramUL: 0
                        }));
                    done();
                })
                .catch(done.fail);
        });
    });

    describe("trace filtering", () => {
        it("can set trace filter", done => { // done is used for async behavior
            spyOn(Wincor.UI.Diagnostics.LogProvider, "error");
            const utilSvc = new Svc();
            const FILTER1 = "myfilter";
            const FILTER2 = "somethingelse";
            
            utilSvc.sendRequest = jasmine.createSpy("sendRequest");
            utilSvc.sendRequest =  utilSvc.sendRequest.and.callFake((obj, cb) => {
                setTimeout(() => {cb(0)}, 1);
            });
            utilSvc.addTraceFilter(FILTER1)
                .then(() => {
                    expect(utilSvc.sendRequest).toHaveBeenCalledTimes(1);
                    expect(utilSvc.sendRequest.calls.first().args[0]).toEqual(jasmine.objectContaining({
                        methodName: "SetFilter",
                        service: utilSvc.NAME,
                        filter: FILTER1
                    }));
                    expect(typeof utilSvc.sendRequest.calls.first().args[1]).toBe("function");
                    return utilSvc.addTraceFilter(FILTER2);
                })
                .then(() => {
                    expect(utilSvc.sendRequest).toHaveBeenCalledTimes(2);
                    expect(Wincor.UI.Diagnostics.LogProvider.error).not.toHaveBeenCalled();
                    done();
                });
        });

        it("processes numeric values", done => { // done is used for async behavior
            spyOn(Wincor.UI.Diagnostics.LogProvider, "error");
            const utilSvc = new Svc();
            const FILTER1 = 23456;
    
            utilSvc.sendRequest = jasmine.createSpy("sendRequest");
            utilSvc.sendRequest =  utilSvc.sendRequest.and.callFake((obj, cb) => {
                setTimeout(() => {cb(0)}, 1);
            });
            utilSvc.addTraceFilter(FILTER1)
                .then(() => {
                    expect(utilSvc.sendRequest.calls.first().args[0]).toEqual(jasmine.objectContaining({
                        methodName: "SetFilter",
                        service: utilSvc.NAME,
                        filter: FILTER1.toString()
                    }));
                    expect(Wincor.UI.Diagnostics.LogProvider.error).not.toHaveBeenCalled();
                    done();
                });
        });

        it("resolves for unsupported values but writes errorlog", done => { // done is used for async behavior
            spyOn(Wincor.UI.Diagnostics.LogProvider, "error");
            const utilSvc = new Svc();
            const FILTER1 = {some: "stuff"};
            const RESULT = 1234;
    
            utilSvc.sendRequest = jasmine.createSpy("sendRequest");
            utilSvc.sendRequest =  utilSvc.sendRequest.and.callFake((obj, cb) => {
                setTimeout(() => {cb(RESULT)}, 1);
            });
            utilSvc.addTraceFilter(FILTER1)
                .then(res => {
                    expect(utilSvc.sendRequest.calls.first().args[0]).toEqual(jasmine.objectContaining({
                        methodName: "SetFilter",
                        service: utilSvc.NAME,
                        filter: FILTER1.toString()
                    }));
                    expect(Wincor.UI.Diagnostics.LogProvider.error).toHaveBeenCalled();
                    expect(res).toBe(RESULT);
                    done();
                })
                .catch(done.fail);
        });
    });


    describe("stop DM session", () => {

        it("call dmStop", done => { // done is used for async behavior
            const utilSvc = new Svc();

            spyOn(utilSvc, "FrmResolve").and.callThrough();

            utilSvc.dmStop()
                .then((result) => {
                    expect(utilSvc.FrmResolve).toHaveBeenCalledTimes(1);
                    expect(utilSvc.FrmResolve.calls.first().args[0])
                        .toEqual(jasmine.objectContaining({
                            FWName: "CCTransactionFW",
                            FWFuncID: 4005,
                            param1: "",
                            meta1: ["NULL", 0],
                            param2: "",
                            meta2: ["NULL", 0],
                            param3: "",
                            meta3: ["NULL", 0],
                            paramUL: 0
                        }));
                    done();
                })
                .catch((e) => {
                    done.fail(e);
                });
        });

        it("call dmStop, RC_OK", done => { // done is used for async behavior
            const utilSvc = new Svc();
            const rc = 0;  // SUCCESS
            spyOn(utilSvc, "FrmResolve").and.callFake((obj, cb) => {
                setTimeout(() => {cb(rc)}, 1);
            });

            utilSvc.dmStop()
                .then((result) => {
                    expect(utilSvc.FrmResolve).toHaveBeenCalledTimes(1);
                    expect(result).toBe(rc);
                    done();
                })
                .catch((e) => {
                    done.fail(e);
                });
        });

        it("call dmStop, RC_IGNORED", done => { // done is used for async behavior
            const utilSvc = new Svc();
            const rc = -10; // RC_IGNORED
            spyOn(utilSvc, "FrmResolve").and.callFake((obj, cb) => {
                setTimeout(() => {cb(rc)}, 1);
            });

            utilSvc.dmStop()
                .then((result) => {
                    expect(utilSvc.FrmResolve).toHaveBeenCalledTimes(1);
                    expect(result).toBe(rc);
                    done();
                })
                .catch((e) => {
                    done.fail(e);
                });
        });

        it("call dmStop, unexpected RC", done => { // done is used for async behavior
            const utilSvc = new Svc();
            const rc = -22; // RC unexpected
            spyOn(utilSvc, "FrmResolve").and.callFake((obj, cb) => {
                setTimeout(() => {cb(rc)}, 1);
            });

            utilSvc.dmStop()
                .then((result) => {
                    expect(utilSvc.FrmResolve).toHaveBeenCalledTimes(1);
                    expect(result).toBe(rc);
                    done();
                })
                .catch((result) => {
                    expect(utilSvc.FrmResolve).toHaveBeenCalledTimes(1);
                    expect(result).toBe(rc);
                    done();
                });
        });


    });
});

