/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ Ada_test.js 4.3.1-210521-21-5b4bc154-1a04bc7d

*/
/*global define:false*/
define(['lib/Squire'], function(Squire) {

    let injector;
    let Wincor;

    describe("Ada testsuite", () => {

        beforeEach(done => {
            injector = new Squire();
            injector.require(["NamespaceMock"], bundle => {
                Wincor = window.Wincor = bundle.createWincor();
                injector
                    .mock("jquery", bundle.jQuery)
                    .mock("extensions", bundle.ext)
                    .mock("flexuimapping", {
                        buildGuiKey: Wincor.returnArgument()
                    })
                    .mock("ui-content", Wincor.UI.Content)
                    .mock("vm-container", Wincor.UI.Content.ViewModelContainer)
                    .mock("vm-util/UICommanding", Wincor.UI.Content.Commanding);

                // Make BaseVM instantiable, since ada needs it
                Wincor.UI.Content.BaseViewModel = class BaseViewModel extends Wincor.UI.Content.BaseViewModel {
                    constructor() {
                        super();
                    }
                    observe() {}
                    clean() {}
                    onInitTextAndData() {}
                    onDeactivated() {}
                };
                
                Wincor.UI.Service.Provider.AdaService.state = Wincor.UI.Service.Provider.AdaService.STATE_VALUES.SPEAK;
                Wincor.UI.Service.Provider.ViewService.getTimeoutValue = () => { return 1; };
                Wincor.UI.Service.Provider.AdaService.speak = jasmine.createSpy("speak");
                done();
            });
        });

        afterEach(() => {
            injector.remove();
        });

        describe("initialize", () => {

            it("reacts on CONTENT_UPDATE event", done => {
                let commanding = Wincor.UI.Content.Commanding;
                injector.require(['GUIAPP/content/viewmodels/base/Ada'], Ada => {
                    spyOn(commanding, "registerForAction");
                    spyOn(commanding, "registerForStateChange");

                    // prepare some fake commands
                    commanding.commands = {
                        COMMAND_01: {
                            adaType: "OTHER"
                        },
                        COMMAND_02: {
                            adaType: "standardKey"
                        },
                        COMMAND_03: {
                            adaType: "selectionKey"
                        },
                        COMMAND_04: {
                            adaType: "functionKey"
                        },
                        COMMAND_05: {
                            adaType: "checkbox"
                        },
                        COMMAND_06: {
                            adaType: "ANY_KEY"
                        },
                        COMMAND_07: {
                            adaType: "checkbox"
                        }
                    };

                    // prepare spy - it will be called when Ada.initialize() is called below
                    spyOn(Wincor.UI.Service.Provider.ViewService, "registerForServiceEvent")
                        .and
                        .callFake((name, cb) => {
                            if (name === "CONTENT_UPDATE") {
                                setTimeout(() => {
                                    cb();
                                    // check if registerForAction has been called with appropriate adaType=xxKey commands + checkboxes
                                    const rfaArgs = commanding.registerForAction.calls.first().args[0];
                                    expect(rfaArgs.id).toEqual(["COMMAND_02", "COMMAND_03", "COMMAND_04", "COMMAND_05", "COMMAND_07"]);
                                    expect(rfaArgs.context).toEqual(Ada);
                                    // check if registerForAction has been called with appropriate adaType=checkbox commands
                                    const rfscArgs = commanding.registerForStateChange.calls.first().args[0];
                                    expect(rfscArgs.id).toEqual(["COMMAND_05", "COMMAND_07"]);
                                    expect(rfscArgs.context).toEqual(Ada);
                                    done();
                                }, 1);
                            }
                        });
                    Ada.setViewKey("UnitTest");
                    Ada.initialize();
                });
            });

            it("returns a promise and resolves", done => {
                injector.require(['GUIAPP/content/viewmodels/base/Ada'], Ada => {
                    spyOn(Ada, "initInstanceVariables");
                    const ret = Ada.initialize();
                    expect(ret.then !== void 0).toBe(true);
                    expect(Ada.initInstanceVariables).not.toHaveBeenCalled();
                    Ada._adaEnabled = true;
                    ret.then(()=>{
                        expect(Ada.initInstanceVariables).toHaveBeenCalled();
                        expect(ret.isPending()).toBe(false);
                        done();
                    });
                });
            });
    
            it("initInstanceVariables called if ADA is enabled", done => {
                injector.require(['GUIAPP/content/viewmodels/base/Ada'], Ada => {
                    spyOn(Ada, "initInstanceVariables");
                    Ada.setViewKey("TestViewKey");
                    const ret = Ada.initialize();
                    expect(ret.then !== void 0).toBe(true);
                    ret.then(() => {
                        expect(Ada.initInstanceVariables).toHaveBeenCalled();
                        expect(ret.isPending()).toBe(false);
                        done();
                    });
                });
            });

            it("baseInitialize called if ADA is enabled", done => {
                injector.require(['GUIAPP/content/viewmodels/base/Ada'], Ada => {
                    spyOn(Ada, "initInstanceVariables");
                    spyOn(Ada, "baseInitialize").and.callThrough();
                    Ada.setViewKey("TestViewKey");
                    const ret = Ada.initialize();
                    expect(ret.then !== void 0).toBe(true);
                    ret.then(() => {
                        expect(Ada.baseInitialize).toHaveBeenCalled();
                        expect(Ada.initInstanceVariables).toHaveBeenCalled();
                        expect(ret.isPending()).toBe(false);
                        done();
                    });
                });
            });
            it("initInstanceVariables checks repeatKey macro", done => {
                injector.require(['GUIAPP/content/viewmodels/base/Ada'], Ada => {
                    Ada.initInstanceVariables();
                    expect(typeof Ada._adaTextMap.macroRepeatKey === "function").toBe(true);
                    done();
                });
            });
            
            it("clears members on VIEW_CLOSING", done => {
                injector.require(['GUIAPP/content/viewmodels/base/Ada'], Ada => {
                    Wincor.UI.Service.Provider.AdaService.autoRepeat = jasmine.createSpy("autoRepeat");
                    Wincor.UI.Service.Provider.EppService.releaseKeys = jasmine.createSpy("releaseKeys");
                    // prepare spy - it will be called when Ada.initialize() is called below
                    spyOn(Wincor.UI.Service.Provider.ViewService, "registerForServiceEvent")
                        .and
                        .callFake((name, cb) => {
                            if (name === "VIEW_CLOSING") {
                                setTimeout(() => {
                                    // prepare some fakes so that we can check afterwards
                                    Ada._adaTextMap.autoRepeatTimerActive = true;
                                    Ada._claimId456 = 1;
                                    const inputFieldSubscriptions =
                                    Ada._adaInputFieldSubscriptions = {
                                        1: {
                                            dispose: jasmine.createSpy("_adaInputFieldSubscriptions_1")
                                        },
                                        2: {
                                            dispose: jasmine.createSpy("_adaInputFieldSubscriptions_2")
                                        },
                                        3: {
                                            dispose: jasmine.createSpy("_adaInputFieldSubscriptions_3")
                                        },
                                        TEST: {
                                            dispose: jasmine.createSpy("_adaInputFieldSubscriptions_TEST")
                                        }
                                    };

                                    const viewStateSubscriptions =
                                    Ada._adaViewStateSubscriptions = {
                                        1: {
                                            dispose: jasmine.createSpy("_adaViewStateSubscriptions_1")
                                        },
                                        2: {
                                            dispose: jasmine.createSpy("_adaViewStateSubscriptions_2")
                                        },
                                        3: {
                                            dispose: jasmine.createSpy("_adaViewStateSubscriptions_3")
                                        },
                                        TEST: {
                                            dispose: jasmine.createSpy("_adaViewStateSubscriptions_TEST")
                                        }
                                    };

                                    cb();
                                    expect(Wincor.UI.Service.Provider.AdaService.autoRepeat).toHaveBeenCalledTimes(1);
                                    expect(Wincor.UI.Service.Provider.AdaService.autoRepeat).toHaveBeenCalledWith(0, null);
                                    expect(Ada._adaTextMap.autoRepeatTimerActive).toBe(false);
                                    expect(Wincor.UI.Service.Provider.EppService.releaseKeys).toHaveBeenCalledTimes(1);
                                    expect(Wincor.UI.Service.Provider.EppService.releaseKeys).toHaveBeenCalledWith(1);
                                    expect(Ada._claimId456).toBe(-1);
                                    // check if _adaInputFieldSubscriptions haev been disposed and member cleared
                                    [1, 2, 3, "TEST"]
                                        .forEach((key) => {
                                            expect(inputFieldSubscriptions[key].dispose).toHaveBeenCalledTimes(1);
                                        });
                                    expect(Ada._adaInputFieldSubscriptions).toEqual({});

                                    [1, 2, 3, "TEST"]
                                        .forEach((key) => {
                                            expect(viewStateSubscriptions[key].dispose).toHaveBeenCalledTimes(1);
                                        });
                                    expect(Ada._adaViewStateSubscriptions).toEqual({});
                                    done();
                                }, 1);
                            }
                        });
                    Ada.setViewKey("UnitTest");
                    Ada.initialize();
                });
            });

            it("calls prepareAda with current viewkey on ACTIVATED event", done => {
                injector.require(['GUIAPP/content/viewmodels/base/Ada'], Ada => {
                    const VIEWKEY = "UnitTest";
                    spyOn(Ada, "prepareAda");
                    // prepare spy - it will be called when Ada.initialize() is called below
                    spyOn(Wincor.UI.Service.Provider.ViewService, "registerForServiceEvent")
                        .and
                        .callFake((name, cb) => {
                            if (name === "VIEW_ACTIVATED") {
                                setTimeout(() => {
                                    cb();
                                    expect(Ada.prepareAda).toHaveBeenCalledWith(void 0, void 0, void 0, VIEWKEY);
                                    done();
                                }, 1);
                            }
                        });
                    Ada.setViewKey(VIEWKEY);
                    Ada.initialize();
                });
            });

            it("reacts on AdaService STATE_CHANGED event", done => {
                injector.require(['GUIAPP/content/viewmodels/base/Ada'], Ada => {
                    // prepare spy - it will be called when Ada.initialize() is called below
                    spyOn(Ada, "handleAdaStateChange");
                    spyOn(Wincor.UI.Service.Provider.AdaService, "registerForServiceEvent")
                        .and
                        .callFake((name, cb) => {
                            if (name === "STATE_CHANGED") {
                                setTimeout(() => {
                                    cb("TEST"); // fakes fireServiceEvent
                                    expect(Ada.handleAdaStateChange).toHaveBeenCalledTimes(1);
                                    expect(Ada.handleAdaStateChange).toHaveBeenCalledWith("TEST");

                                    done();
                                }, 1);
                            }
                        });
                    Ada.setViewKey("UnitTest");
                    Ada.initialize();
                });
            });

            it("reacts on AdaService ERROR_HAPPENED event", done => {
                injector.require(['GUIAPP/content/viewmodels/base/Ada'], Ada => {
                    // prepare spy - it will be called when Ada.initialize() is called below
                    spyOn(Ada, "handleAdaError");
                    spyOn(Wincor.UI.Service.Provider.AdaService, "registerForServiceEvent")
                        .and
                        .callFake((name, cb) => {
                            if (name === "ERROR_HAPPENED") {
                                setTimeout(() => {
                                    cb("TEST"); // fakes fireServiceEvent
                                    expect(Ada.handleAdaError).toHaveBeenCalledTimes(1);
                                    expect(Ada.handleAdaError).toHaveBeenCalledWith("TEST");

                                    done();
                                }, 1);
                            }
                        });
                    Ada.setViewKey("UnitTest");
                    Ada.initialize();
                });
            });

            it("claims 456 if mode != conventional", done => {
                injector.require(['GUIAPP/content/viewmodels/base/Ada'], Ada => {
                    // prepare spy - it will be called when Ada.initialize() is called below
                    spyOn(Ada, "handle456Input");
                    const VIEWKEY = "UnitTest";
                    // create a "claimKeys" spy function that returns a valid claimId as expected
                    Wincor.UI.Service.Provider.EppService.claimKeys = jasmine.createSpy("claimKeys")
                        .and.callFake((eppKeyArray, priority, cb, cbKeypress) => {
                            expect(eppKeyArray).toEqual(["4", "5", "6"]);
                            setTimeout(() => {
                                cbKeypress("TESTKEY");// cb resolves the promise, so feed handle456Input spy before
                                cb({
                                    claimId: 4711
                                })
                            }, 1);
                        });

                    spyOn(Wincor.UI.Service.Provider.LocalizeService, "getText")
                        .and
                        .callFake((keyArray) => {
                            expect(keyArray).toEqual([VIEWKEY]);
                            return Promise.resolve({ "UnitTest": "456" }); // fake 456 mode
                        });
                    Ada.setViewKey(VIEWKEY);
                    const ret = Ada.initialize();
                    expect(ret.then !== void 0).toBe(true);

                    ret.then(() => {
                        expect(Ada.handle456Input).toHaveBeenCalledTimes(1);
                        expect(Ada.handle456Input).toHaveBeenCalledWith("TESTKEY");
                        expect(Ada._claimId456).toBe(4711);
                        expect(Ada._adaModeConventional).toBe(false);
                        done();
                    })
                });
            });

            it("does NOT claim 456 if mode = conventional", done => {
                injector.require(['GUIAPP/content/viewmodels/base/Ada'], Ada => {
                    // prepare spy - it will be called when Ada.initialize() is called below
                    const VIEWKEY = "*";
                    // create a "claimKeys" spy function that returns a valid claimId as expected
                    Wincor.UI.Service.Provider.EppService.claimKeys = jasmine.createSpy("claimKeys");

                    spyOn(Wincor.UI.Service.Provider.LocalizeService, "getText")
                        .and
                        .callFake((keyArray) => {
                            expect(keyArray).toEqual([VIEWKEY]);
                            return Promise.resolve({ "*": "ConventionalOrAnyOtherNot456" }); // fake 456 mode
                        });
                    const ret = Ada.initialize();
                    expect(ret.then !== void 0).toBe(true);

                    ret.then(() => {
                        expect(Wincor.UI.Service.Provider.EppService.claimKeys).not.toHaveBeenCalled();
                        expect(Ada._claimId456).toBe(-1);
                        expect(Ada._adaModeConventional).toBe(true);
                        done();
                    })
                });
            });

            it("disables on immediateTimeout of current view", done => {
                injector.require(['GUIAPP/content/viewmodels/base/Ada'], Ada => {
                    spyOn(Ada, "initInstanceVariables");
                    Ada.setViewKey("UnitTest");
                    const vs = Wincor.UI.Service.Provider.ViewService;
                    vs.viewContext.viewConfig.timeout = vs.immediateTimeout;
                    const ret = Ada.initialize();
                    ret.then(()=>{
                        expect(Ada._adaEnabled).toBe(false);
                        done();
                    });
                });
            });

            it("disables on initial viewkey '*' of welcome", done => {
                injector.require(['GUIAPP/content/viewmodels/base/Ada'], Ada => {
                    spyOn(Ada, "initInstanceVariables");
                    Ada.setViewKey("*");
                    const ret = Ada.initialize();
                    ret.then(()=>{
                        expect(Ada._adaEnabled).toBe(false);
                        done();
                    });
                });
            });

        });
    
        describe("popup handling", () => {
            it("ensure popup timeout extension and popup timer gets refreshed", async() => {
                let [Ada] = await injector.require(['GUIAPP/content/viewmodels/base/Ada']);
                const POPUP_TYPE = "TIMEOUT_POPUP";
                Ada.vm = {
                    timeoutValue: 30000,
                    vmHelper: {
                        popupOptions: {
                            type: POPUP_TYPE
                        },
                        isTimeoutPopupActive: jasmine.createSpy("isTimeoutPopupActive").and.returnValue(true),
                        getTimerInfo: jasmine.createSpy("getTimerInfo").and.returnValue({
                            name: POPUP_TYPE,
                            id: 4711,
                            timeLen: 30000
                        }),
                        refreshTimer: jasmine.createSpy("refreshTimer").and.callFake((timeLen, name) => {
                            expect(timeLen).toBe(60000);
                            expect(name).toBe(POPUP_TYPE);
                        })
                    }
                };
                spyOn(Ada, "postponeViewTimeoutUntilSpeakingStopped");
                //Wincor.UI.Service.Provider.AdaService.speak = jasmine.createSpy("speak");
                Ada._timeoutExtensionDone = true; // prevent from running in the _viewSrv.refreshTimeout block
                Ada._adaTextMap.timeoutExtensionPopup = "200";
                await Ada.speakAda("*");
                expect(Ada.vm.timeoutValue).toBe(60000);
                expect(Ada.vm.vmHelper.refreshTimer).toHaveBeenCalledTimes(1);
            });
    
            it("postponeViewTimeoutUntilSpeakingStopped: ensure popup timeout timer gets refreshed", async() => {
                let [Ada] = await injector.require(['GUIAPP/content/viewmodels/base/Ada']);
                const POPUP_TYPE = "TIMEOUT_POPUP";
                Ada.vm = {
                    timeoutValue: 30000,
                    vmHelper: {
                        popupOptions: {
                            type: POPUP_TYPE
                        },
                        isTimeoutPopupActive: jasmine.createSpy("isTimeoutPopupActive").and.returnValue(true),
                        getTimerInfo: jasmine.createSpy("getTimerInfo").and.returnValue({
                            name: POPUP_TYPE,
                            id: 4711,
                            timeLen: 30000
                        }),
                        refreshTimer: jasmine.createSpy("refreshTimer").and.callFake((timeLen, name) => {
                            expect(timeLen).toBe(30000);
                            expect(name).toBe(POPUP_TYPE);
                        })
                    }
                };
                Wincor.UI.Service.Provider.ViewService.refreshTimeout = jasmine.createSpy("refreshTimeout");
                //Wincor.UI.Service.Provider.AdaService.speak = jasmine.createSpy("speak");
                Ada._timeoutExtensionDone = true; // prevent from running in the _viewSrv.refreshTimeout block
                Ada._adaTextMap.timeoutExtensionPopup = "200";
                Wincor.UI.Service.Provider.ViewService.clearTimeout = jasmine.createSpy("clearTimeout");
                let speakingStoppedCallback;
                spyOn(Wincor.UI.Service.Provider.AdaService, "registerForServiceEvent")
                    .and
                    .callFake((name, cb) => {
                        speakingStoppedCallback = cb;
                    });
                
                await Ada.postponeViewTimeoutUntilSpeakingStopped();
                speakingStoppedCallback && speakingStoppedCallback();
    
                expect(Ada.vm.vmHelper.isTimeoutPopupActive).toHaveBeenCalled();
                expect(Ada.vm.timeoutValue).toBe(30000);
                expect(Ada.vm.vmHelper.refreshTimer).toHaveBeenCalledTimes(1);
                expect(Wincor.UI.Service.Provider.ViewService.refreshTimeout).not.toHaveBeenCalled();
            });
    
            it("postponeViewTimeoutUntilSpeakingStopped: ensure view timer gets refreshed on open popup (no timerInfo)", async() => {
                let [Ada] = await injector.require(['GUIAPP/content/viewmodels/base/Ada']);
                Ada.vm = {
                    vmHelper: {
                        isTimeoutPopupActive: jasmine.createSpy("isTimeoutPopupActive").and.returnValue(false)
                    }
                };
                //Wincor.UI.Service.Provider.AdaService.speak = jasmine.createSpy("speak");
                Ada._timeoutExtensionDone = true; // prevent from running in the _viewSrv.refreshTimeout block
                Ada._adaTextMap.timeoutExtensionPopup = "200";
                Wincor.UI.Service.Provider.ViewService.clearTimeout = jasmine.createSpy("clearTimeout");
                Wincor.UI.Service.Provider.ViewService.refreshTimeout = jasmine.createSpy("refreshTimeout");
                let speakingStoppedCallback;
                spyOn(Wincor.UI.Service.Provider.AdaService, "registerForServiceEvent")
                    .and
                    .callFake((name, cb) => {
                        speakingStoppedCallback = cb;
                    });
        
                await Ada.postponeViewTimeoutUntilSpeakingStopped();
                speakingStoppedCallback && speakingStoppedCallback();
    
                expect(Ada.vm.vmHelper.isTimeoutPopupActive).toHaveBeenCalled();
                expect(Wincor.UI.Service.Provider.ViewService.refreshTimeout).toHaveBeenCalledTimes(1);
            });
    
        });
        
        describe("command delegation", () => {
            it("tapping a GUIAPP command resets ada-focus to GUIAPP", async() => {
                spyOn(Wincor.UI.Service.Provider, "getInstanceName").and.returnValue("GUIAPP");
                spyOn(Wincor.UI.Service.Provider.AdaService, "switchToApp").and.callThrough();
                let FAKE_CMD_DATA = {
                    id: "FAKE_CMD",
                    triggeredByEpp: false
                };
                Wincor.UI.Content.Commanding.commands.FAKE_CMD = FAKE_CMD_DATA;
                let [Ada] = await injector.require(['GUIAPP/content/viewmodels/base/Ada']);
                await Ada.onButtonPressedAdaHandling(FAKE_CMD_DATA);
                expect(Wincor.UI.Service.Provider.AdaService.switchToApp).toHaveBeenCalledTimes(1);
            });

            it("using eppkey a GUIAPP command does not reset ada-focus to GUIAPP", async() => {
                spyOn(Wincor.UI.Service.Provider, "getInstanceName").and.returnValue("GUIAPP");
                spyOn(Wincor.UI.Service.Provider.AdaService, "switchToApp").and.callThrough();
                let FAKE_CMD_DATA = {
                    id: "FAKE_CMD",
                    triggeredByEpp: true
                };
                Wincor.UI.Content.Commanding.commands.FAKE_CMD = FAKE_CMD_DATA;
                let [Ada] = await injector.require(['GUIAPP/content/viewmodels/base/Ada']);
                await Ada.onButtonPressedAdaHandling(FAKE_CMD_DATA);
                expect(Wincor.UI.Service.Provider.AdaService.switchToApp).not.toHaveBeenCalled();
            });
        });

        describe("456", () => {
            it("sorts commands by adakey", done => {
                injector.require(['GUIAPP/content/viewmodels/base/Ada'], Ada => {
                    // an instance of AdaElements class
                    expect(typeof Ada._adaFocusableElements).toBe("object");
                    for(let i=15;i>=0;i--) {
                        let cmd = Wincor.UI.Content.Commanding.get("TEST"+i);

                        cmd.id = "TEST"+i;
                        cmd.adakey = ""+i;
                        Ada._adaFocusableElements.add(i, {
                            command: cmd,
                            type: "DIV"
                        });
                    }
                    Ada._adaFocusableElements.init();
                    expect(Object.keys(Ada._adaFocusableElements.elements).length).toBe(16);
                    expect(Ada._adaFocusableElements.lowestTabIndex).toBe(0);
                    expect(Ada._adaFocusableElements.highestTabIndex).toBe(15);
                    expect(Ada._adaFocusableElements.currentTabIndex).toBe(0);
                    done();
                });
            });

            it("can navigate items", done => {
                injector.require(['GUIAPP/content/viewmodels/base/Ada'], Ada => {
                    // an instance of AdaElements class
                    for(let i=15;i>=0;i--) {
                        let cmd = Wincor.UI.Content.Commanding.get("TEST"+i);

                        cmd.id = "TEST"+i;
                        cmd.adakey = ""+i;
                        Ada._adaFocusableElements.add(i, {
                            command: cmd,
                            type: "DIV"
                        });
                    }
                    Ada._adaFocusableElements.init();
                    expect(Object.keys(Ada._adaFocusableElements.elements).length).toBe(16);
                    Ada._adaFocusableElements.next();
                    expect(Ada._adaFocusableElements.currentTabIndex).toBe(1);
                    Ada._adaFocusableElements.previous();
                    expect(Ada._adaFocusableElements.currentTabIndex).toBe(0);
                    // walk around from highest to lowest and vice versa
                    Ada._adaFocusableElements.previous();
                    expect(Ada._adaFocusableElements.currentTabIndex).toBe(15);
                    Ada._adaFocusableElements.next();
                    expect(Ada._adaFocusableElements.currentTabIndex).toBe(0);
                    done();
                });
            });

            it("skips inactive items during navigation", done => {
                injector.require(['GUIAPP/content/viewmodels/base/Ada'], Ada => {
                    // an instance of AdaElements class
                    for(let i=15;i>=0;i--) {
                        let cmd = Object.assign({
                            id: "TEST"+i,
                            adakey: i,
                        }, Wincor.UI.Content.Command);
                        Ada._adaFocusableElements.add(i, {
                            command: cmd,
                            type: "DIV"
                        });
                        cmd.isActive = {
                            // only even items (and 0) are active
                            value: function(ii) {return ii > 0 ? !(ii%2) : true}.bind(null, i)
                        }

                    }
                    Ada._adaFocusableElements.init();
                    let cmd = Ada._adaFocusableElements.elements["15"].command;
                    Ada._adaFocusableElements.elements["15"].command.isActive.value = () => { return false; };

                    expect(Object.keys(Ada._adaFocusableElements.elements).length).toBe(16);
                    expect(Ada._adaFocusableElements.currentTabIndex).toBe(0);
                    Ada._adaFocusableElements.next();
                    expect(Ada._adaFocusableElements.currentTabIndex).toBe(2);
                    Ada._adaFocusableElements.previous();
                    expect(Ada._adaFocusableElements.currentTabIndex).toBe(0);
                    // walk around from highest to lowest and vice versa
                    Ada._adaFocusableElements.previous();
                    expect(Ada._adaFocusableElements.currentTabIndex).toBe(14);
                    Ada._adaFocusableElements.next();
                    expect(Ada._adaFocusableElements.currentTabIndex).toBe(0);
                    done();
                });
            });
        });

        describe("mixAda", () => {

            it("check repeatKey macro resolving", async() => {
                let [Ada] = await injector.require(['GUIAPP/content/viewmodels/base/Ada']);
                const REPEAT_TEXT = "To repeat this text press";
                Ada._adaTextMap.macroRepeatKey(REPEAT_TEXT);
                Ada.mixAda();
                expect(Ada._adaTextMap.macroRepeatKeyResolved()).toBe(REPEAT_TEXT);
            });

            it("check repeatKey default", async() => {
                let [Ada] = await injector.require(['GUIAPP/content/viewmodels/base/Ada']);
                expect(Ada._repeatKey).toBe("HELP");
            });
            
            it ("can enhance standard texts (instruction/headline/message) with adaTexts of appropriate commands", async() => {
                const [ko, Ada] = await injector.require(['knockout', 'GUIAPP/content/viewmodels/base/Ada']);

                // prepare some fake commands
                const f = () => {
                    return true;
                };
                f.subscribe = ()=>{};

                Ada.isValidCommandForAda = () => true;
                const types = ["OTHER", Ada.ADA_TYPE.INSTRUCTION, Ada.ADA_TYPE.INSTRUCTION, Ada.ADA_TYPE.HEADLINE, Ada.ADA_TYPE.HEADLINE, Ada.ADA_TYPE.MESSAGE, Ada.ADA_TYPE.MESSAGE];
                const adaText = ["OTHER", "inst1", "inst2", "head1", "head2", "message1", "message2"];
                // prepare adaTextMap as if standard texts already would have been read
                let instructionInitial = "instructionInitial";
                let headlineInitial = "headlineInitial";
                let messageInitial = "messageInitial";
                Ada._adaTextMap.instruction(instructionInitial);
                Ada._adaTextMap.headline(headlineInitial);
                Ada._adaTextMap.message(messageInitial);
                [1,2,3,4,5,6].forEach((i) => {
                    // prepare some cmds
                    Wincor.UI.Content.Commanding.commands["COMMAND_0"+i] = {
                        id: "COMMAND_0"+i,
                        adaType: types[i],
                        adaKey: ""+i, // force sort by ada key in commanding.getByAdaType
                        adaText: ko.observable(adaText[i])
                    };
                });

                Wincor.UI.Content.Commanding.cmdIds = Object.keys(Wincor.UI.Content.Commanding.commands);
                Object.keys(Wincor.UI.Content.Commanding.commands).forEach((id) => {
                    Wincor.UI.Content.Commanding.commands[id].adaMacroResolved = ko.observable("");
                });
                
                let result = Ada.enhanceStdTextsWithCmds();
                // result is object with texts to append to originals
                expect(result).toEqual({
                    instruction: `${adaText[1]} ${adaText[2]}`,
                    headline: `${adaText[3]} ${adaText[4]}`,
                    message: `${adaText[5]} ${adaText[6]}`
                });

                // ada textmap members now must contain the concatenated texts
                expect(Ada._adaTextMap.instruction()).toBe(`${instructionInitial} ${adaText[1]} ${adaText[2]}`);
                expect(Ada._adaTextMap.headline()).toBe(`${headlineInitial} ${adaText[3]} ${adaText[4]}`);
                expect(Ada._adaTextMap.message()).toBe(`${messageInitial} ${adaText[5]} ${adaText[6]}`);
            });

            it("provides counts of active ada items", done => {
                injector.require(['knockout', 'GUIAPP/content/viewmodels/base/Ada'], (ko, Ada) => {
                    // prepare some fake commands
                    const f = () => {
                        return true;
                    };
                    f.subscribe = ()=>{};

                    Ada.isValidCommandForAda = () => true;
                    const types = ["OTHER", "standardKey", "selectionKey", "functionKey", "checkbox", "ANY_KEY", "checkbox"];
                    [1,2,3,4,5,6,7].forEach((i) => {
                        // prepare some cmds
                        Wincor.UI.Content.Commanding.commands["COMMAND_0"+i] = {
                            id: "COMMAND_0"+i,
                            adaType: types[i],
                            adaKey: ""+i,
                            isPressed: {
                                value: f
                            },
                            isActive: {
                                value: f
                            }
                        };
                    });

                    Wincor.UI.Content.Commanding.cmdIds = Object.keys(Wincor.UI.Content.Commanding.commands);
                    Object.keys(Wincor.UI.Content.Commanding.commands).forEach((id) => {
                        Wincor.UI.Content.Commanding.commands[id].adaMacroResolved = ko.observable("")
                    });
                    // prepare spy - it will be called when Ada.initialize() is called below
                    spyOn(Wincor.UI.Service.Provider.ViewService, "registerForServiceEvent");

                    Ada.setViewKey("UnitTest");
                    Ada.initialize();
                    const POPUP_TYPE = "TIMEOUT_POPUP";
                    Ada.vm.vmHelper = {
                        popupOptions: {
                            type: POPUP_TYPE
                        },
                        isTimeoutPopupActive: jasmine.createSpy("isTimeoutPopupActive").and.returnValue(true),
                        getTimerInfo: jasmine.createSpy("getTimerInfo").and.returnValue({
                            name: POPUP_TYPE,
                            id: 4711,
                            timeLen: 30000
                        }),
                        refreshTimer: jasmine.createSpy("refreshTimer").and.callFake((timeLen, name) => {
                            expect(timeLen).toBe(30000);
                            expect(name).toBe(POPUP_TYPE);
                        })
                    };
                    // the keys text defines what items to add
                    spyOn(Ada.vm, "initTextAndData").and.returnValue(
                        Promise.resolve({
                            textKeys: []
                        })
                    );
                    spyOn(Ada, "speakAda");
                    Ada.prepareAda();
                    Ada._adaTextMap.keysText = ko.observable("(#standardKeys#)(#functionKeys#)(#selectionKeys#)(#checkboxes#)");
                    Ada.mixAda();
                    expect(Ada.activeItems.selectionKeyCount()).toBe(1);
                    expect(Ada.activeItems.functionKeyCount()).toBe(1);
                    expect(Ada.activeItems.standardKeyCount()).toBe(1);
                    expect(Ada.activeItems.checkboxCount()).toBe(2);
                    expect(Ada.activeItems.activeKeyCount()).toBe(5);
                    done();
                });
            });

            it("uses existing adatext of a command if available", done => {
                injector.require(['knockout', 'GUIAPP/content/viewmodels/base/Ada'], (ko, Ada) => {
                    // prepare some fake commands
                    const f = () => {
                        return true;
                    };
                    f.subscribe = ()=>{};

                    Ada.isValidCommandForAda = ()=>true;
                    const types = ["OTHER", "standardKey", "selectionKey", "functionKey", "checkbox", "message", "checkbox"];
                    [1,2,3,4,5,6,7].forEach((i) => {
                        // prepare some cmds
                        Wincor.UI.Content.Commanding.commands["COMMAND_0"+i] = {
                            id: "COMMAND_0"+i,
                            adaType: types[i],
                            adaKey: ""+i,
                            adaText: "Some text " + i, // 5th item is message, so expect "Some text 5" below
                            isPressed: {
                                value: f
                            },
                            isActive: {
                                value: f
                            }
                        };
                    });

                    Wincor.UI.Content.Commanding.cmdIds = Object.keys(Wincor.UI.Content.Commanding.commands);
                    Object.keys(Wincor.UI.Content.Commanding.commands).forEach((id) => {
                        Wincor.UI.Content.Commanding.commands[id].adaMacroResolved = ko.observable("");
                    });
                    // prepare spy - it will be called when Ada.initialize() is called below
                    spyOn(Wincor.UI.Service.Provider.ViewService, "registerForServiceEvent");

                    
                    Ada.setViewKey("UnitTest");
                    Ada.initialize();
                    const POPUP_TYPE = "TIMEOUT_POPUP";
                    Ada.vm.vmHelper = {
                        popupOptions: {
                            type: POPUP_TYPE
                        },
                        isTimeoutPopupActive: jasmine.createSpy("isTimeoutPopupActive").and.returnValue(true),
                        getTimerInfo: jasmine.createSpy("getTimerInfo").and.returnValue({
                            name: POPUP_TYPE,
                            id: 4711,
                            timeLen: 30000
                        }),
                        refreshTimer: jasmine.createSpy("refreshTimer").and.callFake((timeLen, name) => {
                            expect(timeLen).toBe(30000);
                            expect(name).toBe(POPUP_TYPE);
                        })
                    };

                    // the keys text defines what items to add
                    spyOn(Ada.vm, "initTextAndData").and.returnValue(
                        Promise.resolve({
                            textKeys: []
                        })
                    );
                    spyOn(Ada, "speakAda");
                    Ada.prepareAda();
                    Ada._adaTextMap.keysText = ko.observable("(#standardKeys#)(#functionKeys#)(#selectionKeys#)(#checkboxes#)");
                    Ada._adaTextMap.message("");
                    Ada.mixAda();
                    expect(Ada._adaTextMap.messageResolved()).toBe("Some text 5");

                    // senseless config, but works an can be checked:
                    // GUI_[VIEWKEY]_....._Message_ADA uses "(#message#)" macro, which will be replace by itself after additional
                    // message has been evaluated from cmd with adaType MESSAGE
                    Ada._adaTextMap.message("(#message#)");
                    Ada.mixAda();
                    expect(Ada._adaTextMap.messageResolved()).toBe("Some text 5 Some text 5");
                    done();
                });
            });
        });
    });
});