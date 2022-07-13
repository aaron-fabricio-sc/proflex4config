/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ HeaderViewModel_test.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

define(['lib/Squire'], function(Squire) {

    let injector;
    let ko;
    let Wincor;
    let jQuery;

    describe("HeaderViewModel", () => {

        beforeEach(done => {
            injector = new Squire();
            injector.require(["NamespaceMock"], bundle => {
                Wincor = window.Wincor = bundle.createWincor();
                jQuery = window.jQuery = bundle.jQuery;
                ko = Wincor.ko = window.ko = bundle.ko;

                
                Wincor.UI.Content.BaseViewModel = class BaseViewModel extends Wincor.UI.Content.BaseViewModel {
                    constructor() {
                        super();
                        // be careful: This overwrites any method under the same name both in BaseViewModel AND the viewmodel to test - so the total inheritance chain!
                        // we create a fake baseclass that basically is the BaseViewModel of NameSpaceMock, which is
                        // extended by jasmine.createSpyObj to replace some standard functions with spies.
                        return Object.assign(this, jasmine.createSpyObj("FakeBaseMethods", ["onInitTextAndData", "messageText", "onButtonPressed" ]));
                    }
                    onDeactivated() {}
                };
                
                
                injector
                    .mock("flexuimapping", {
                        buildGuiKey: () => { //dummy
                        }
                    })
                    .mock("ui-content", {
                        designMode: Wincor.UI.Content.designMode
                    })
                    .mock("vm-container", Wincor.UI.Content.ViewModelContainer)
                    .mock("jquery", jQuery)
                    .mock("extensions", bundle.ext)
                    .mock("knockout", ko)
                    .mock("vm-util/UICommanding", Wincor.UI.Content.Commanding)
                    .store("basevm", Wincor.UI.Content.BaseViewModel)
                    .mock("basevm", Wincor.UI.Content.BaseViewModel);
                this.codeBehind = {};
                done();
            });
        });

        afterEach(() => {
            injector.remove();
        });

        describe("initializing", () => {
            it("works without installing swapScreen capability", (done) => {
                injector.require(["GUIAPP/content/viewmodels/HeaderViewModel"], () => {

                    spyOn(Wincor.UI.Service.Provider.ViewService, "getRemoteInstance").and.callThrough();

                    const vm = new Wincor.UI.Content.HeaderViewModel();
                    expect(Wincor.UI.Service.Provider.ViewService.getRemoteInstance).toHaveBeenCalledTimes(1);

                    // prepare required stuff and check
                    expect(vm.swapScreenViewState()).toBe(3); // hidden, because NamespaceMock rejects has-/getRemoteInstance per default
                    done();
                }, done.fail);
            });

            it("subscribes to getLabel for 'GUI_[#VIEW_KEY#]_Hint_Message' and 'GUI_[#VIEW_KEY#]_Hint_Message_Level'", done => {
                let msgSubscriber = null;
                let levelSubscriber = null;
                const KEY = "GUI_[#VIEW_KEY#]_Hint_Message";
                const DEF = "{#flexMain.messageText;;#}";
                const TEST_MSG = "Test message";
                const TEST_MSG2 = "Test message 2";
                const TEST_LEVEL = "ErrorBox";
                
                Wincor.UI.Content.BaseViewModel = class BaseViewModel extends Wincor.UI.Content.BaseViewModel {
                    constructor() {
                        super();
                        this.getLabel = jasmine.createSpy("getLabel").and.callFake((key, defaultVal) => {
                            return {
                                subscribe: jasmine.createSpy("subscribe").and.callFake(cb => {
                                    if(key === KEY) {
                                        msgSubscriber = cb;
                                        expect(defaultVal).toBe(DEF);
                                    } else { // level
                                        levelSubscriber = cb;
                                        expect(defaultVal).toBe("{#flexMain.messageLevel;WarningBox;#}");
                                    }
                                })
                            };
                        });
                    }
                };
                
                injector.require(["GUIAPP/content/viewmodels/HeaderViewModel"], async() => {
                    let vm = new Wincor.UI.Content.HeaderViewModel();
                    spyOn(vm, "onViewModelEvent");
                    spyOn(vm, "messageText").and.callThrough();
                    spyOn(vm, "messageLevel").and.callThrough();
                    await msgSubscriber(TEST_MSG);
                    expect(vm.getLabel).toHaveBeenCalledWith(KEY, DEF); // test only the first call to getLabel for the message but..
                    expect(vm.getLabel).toHaveBeenCalledTimes(2); // ..we have 2 calls in sum, message + level
                    expect(vm.onViewModelEvent).toHaveBeenCalledWith("BEFORE_CLEAN");
                    expect(vm.messageText()).toBe(TEST_MSG);
                    expect(vm.messageLevel).not.toHaveBeenCalled();
                    await levelSubscriber(TEST_LEVEL);
                    expect(vm.messageLevel()).toBe(TEST_LEVEL);
                    // call once again and check messageLevel must be the same
                    await msgSubscriber(TEST_MSG2);
                    expect(vm.messageLevel()).toBe(TEST_LEVEL);
                    expect(vm.messageText()).toBe(TEST_MSG2);
                    done();
                }, done.fail);
            });
            
            it("registers for LANGUAGE_CHANGED event one time until shutdown", (done) => {
                injector.require(["GUIAPP/content/viewmodels/HeaderViewModel"], () => {
                    let langChangeCallback = null;
                    spyOn(Wincor.UI.Service.Provider.LocalizeService, "registerForServiceEvent").and.callFake((id, cb, trigger) => {
                        langChangeCallback = cb;
                    });
                    const vm = new Wincor.UI.Content.HeaderViewModel();
                    expect(Wincor.UI.Service.Provider.LocalizeService.registerForServiceEvent)
                        .toHaveBeenCalledWith('LANGUAGE_CHANGED', langChangeCallback, 'SHUTDOWN');
                    vm.observe(null, "id");
                    // observe did registerForServiceEvent for LANGUAGE_CHANGED in the past, so we expect that after observe we registered one time by the initialize constructor only
                    expect(Wincor.UI.Service.Provider.LocalizeService.registerForServiceEvent).toHaveBeenCalledTimes(1);
                    done();
                }, done.fail);
            });

            it("check observe to add delegate for LANGUAGE command", (done) => {
                injector.require(["GUIAPP/content/viewmodels/HeaderViewModel"], () => {
                    spyOn(Wincor.UI.Content.Commanding, "whenAvailable").and.callThrough();
                    const vm = new Wincor.UI.Content.HeaderViewModel();
                    expect(Wincor.UI.Content.Commanding.whenAvailable).not.toHaveBeenCalled(); // only observe add the delegate
                    vm.observe(null, "id");
                    expect(Wincor.UI.Content.Commanding.whenAvailable).toHaveBeenCalledWith(["LANGUAGE"]);
                    done();
                }, done.fail);
            });

            it("check observe to add delegate for LANGUAGE_POPUP command", (done) => {
                injector.require(["GUIAPP/content/viewmodels/HeaderViewModel"], () => {
                    spyOn(Wincor.UI.Content.Commanding, "whenAvailable").and.callThrough();
                    const vm = new Wincor.UI.Content.HeaderViewModel();
                    expect(Wincor.UI.Content.Commanding.whenAvailable).not.toHaveBeenCalled(); // only observe add the delegate
                    vm.observe(null, "id");
                    expect(Wincor.UI.Content.Commanding.whenAvailable).toHaveBeenCalledWith(["LANGUAGE_POPUP"]);
                    done();
                }, done.fail);
            });
        });
    
        describe("_messageDisappearPromise promise", () => {
            it("expects catch handler for moveHeaderMessageOut promise getLabel for 'GUI_[#VIEW_KEY#]_Hint_Message' and 'GUI_[#VIEW_KEY#]_Hint_Message_Level'", done => {
                let vm = null;
                let msgSubscriber = null;
                let levelSubscriber = null;
                const KEY = "GUI_[#VIEW_KEY#]_Hint_Message";
                const DEF = "{#flexMain.messageText;;#}";
                const TEST_MSG = "Test message";
                const TEST_LEVEL = "ErrorBox";
                const REJECTED_MSG = "moveHeaderMessageOut promise rejected";
                let messageDisappearPromise = Promise.reject(REJECTED_MSG);
                messageDisappearPromise.catch(() => {
                    // prevent from unhandled promise rejection error message
                });
                this.codeBehind.moveHeaderMessageOut = jasmine.createSpy("moveHeaderMessageOut").and.returnValue(messageDisappearPromise);
                
                Wincor.UI.Content.BaseViewModel = class BaseViewModel extends Wincor.UI.Content.BaseViewModel {
                    constructor() {
                        super();
                        this.getLabel = jasmine.createSpy("getLabel").and.callFake((key, defaultVal) => {
                            return {
                                subscribe: jasmine.createSpy("subscribe").and.callFake(cb => {
                                    if(key === KEY) {
                                        msgSubscriber = cb;
                                        expect(defaultVal).toBe(DEF);
                                    } else { // level
                                        levelSubscriber = cb;
                                        expect(defaultVal).toBe("{#flexMain.messageLevel;WarningBox;#}");
                                    }
                                })
                            };
                        });
                    }
                };
                
                injector.require(["GUIAPP/content/viewmodels/HeaderViewModel"], async() => {
                    vm = new Wincor.UI.Content.HeaderViewModel(this.codeBehind);
                    vm.onViewModelEvent = jasmine.createSpy("onViewModelEvent");
                    await msgSubscriber(""); // force clean and create a new promise rejection due to our spy
                    expect(this.codeBehind.moveHeaderMessageOut).toHaveBeenCalledTimes(1);
                    spyOn(Wincor.UI.Service.Provider.LogProvider, "log").and.callThrough();
                    Wincor.enableLogging(true);
                    await msgSubscriber(TEST_MSG);
                    expect(vm.onViewModelEvent).toHaveBeenCalledTimes(1);
                    expect(Wincor.UI.Service.Provider.LogProvider.log.calls.argsFor(1)[1].includes(REJECTED_MSG)).toBe(true);
                    await levelSubscriber(TEST_LEVEL);
                    expect(Wincor.UI.Service.Provider.LogProvider.log.calls.argsFor(3)[1].includes(REJECTED_MSG)).toBe(true);
                    Wincor.enableLogging(false);
                    done();
                }, done.fail);
            });
        });
        
        describe("ViewModel event", () => {
            const MESSAGE_LEVEL = {
                INFO: "InfoBox",
                WARNING: "WarningBox",
                ERROR: "ErrorBox"
            };

            describe("MESSAGE_LEVEL_AVAILABLE", () => {

                it("processes passed level", async() => {
                    await injector.require(["GUIAPP/content/viewmodels/HeaderViewModel"]);

                    const EVENT_DATA = {
                        messageLevel: MESSAGE_LEVEL.ERROR
                    };

                    const vm = new Wincor.UI.Content.HeaderViewModel();
                    vm.messageText("STAYSTHESAME");
                    await vm.onViewModelEvent("MESSAGE_LEVEL_AVAILABLE", EVENT_DATA);
                    expect(vm.messageLevel()).toBe(MESSAGE_LEVEL.ERROR);
                    expect(vm.messageText()).toBe("STAYSTHESAME");
                    EVENT_DATA.messageLevel = MESSAGE_LEVEL.INFO;
                    await vm.onViewModelEvent("MESSAGE_LEVEL_AVAILABLE", EVENT_DATA);
                    expect(vm.messageLevel()).toBe(MESSAGE_LEVEL.INFO);
                    expect(vm.messageText()).toBe("STAYSTHESAME");
                });

                it("skips processing when missing data or event", async() => {
                    await injector.require(["GUIAPP/content/viewmodels/HeaderViewModel"]);

                    const EVENT_DATA = {
                    };

                    const vm = new Wincor.UI.Content.HeaderViewModel();
                    vm.messageText("STAYSTHESAME");
                    await vm.onViewModelEvent("MESSAGE_LEVEL_AVAILABLE", EVENT_DATA);
                    expect(vm.messageLevel()).toBe(MESSAGE_LEVEL.INFO);
                    expect(vm.messageText()).toBe("STAYSTHESAME");

                    await vm.onViewModelEvent("MESSAGE_LEVEL_AVAILABLE", null);
                    expect(vm.messageLevel()).toBe(MESSAGE_LEVEL.INFO);
                    expect(vm.messageText()).toBe("STAYSTHESAME");
                });
            });

            describe("BEFORE_CLEAN", () => {

                it("resets header message and level", async() => {
                    this.codeBehind.moveHeaderMessageOut = jasmine.createSpy("moveHeaderMessageOut");
                    Wincor.createMockObject("whenAvailable.then", Wincor.UI.Content.Commanding, true, (spy, currentSpyName, args, index) => {
                        console.log();
                        if (index === 1 && typeof args[0] === "function") {
                            args[0]();
                        }
                    });

                    await injector.require(["GUIAPP/content/viewmodels/HeaderViewModel"]);

                    const vm = new Wincor.UI.Content.HeaderViewModel(this.codeBehind);
                    vm.messageText("SHOULDDISAPPEAR");
                    vm.messageLevel(MESSAGE_LEVEL.ERROR);
                    Wincor.UI.Content.Commanding.setActive("LANGUAGE", false);

                    await vm.onViewModelEvent("BEFORE_CLEAN");
                    expect(this.codeBehind.moveHeaderMessageOut).toHaveBeenCalledTimes(1);
                    expect(vm.messageLevel()).toBe(MESSAGE_LEVEL.INFO);
                    expect(vm.messageText()).toBe("");
                    expect(vm.cmdRepos.isActive("LANGUAGE")).toBe(true);
                });

                it("skips processing when missing data or event", async() => {
                    await injector.require(["GUIAPP/content/viewmodels/HeaderViewModel"]);

                    const EVENT_DATA = {
                    };

                    const vm = new Wincor.UI.Content.HeaderViewModel();
                    vm.messageText("STAYSTHESAME");
                    await vm.onViewModelEvent("MESSAGE_LEVEL_AVAILABLE", EVENT_DATA);
                    expect(vm.messageLevel()).toBe(MESSAGE_LEVEL.INFO);
                    expect(vm.messageText()).toBe("STAYSTHESAME");

                    await vm.onViewModelEvent("MESSAGE_LEVEL_AVAILABLE", null);
                    expect(vm.messageLevel()).toBe(MESSAGE_LEVEL.INFO);
                    expect(vm.messageText()).toBe("STAYSTHESAME");
                });
            });

            describe("MESSAGE_AVAILABLE", () => {

                it("without passed level defaults to level 'info'", async() => {
                    await injector.require(["GUIAPP/content/viewmodels/HeaderViewModel"]);

                    const MESSAGE_TEXT = "MESSAGE_TEXT!";
                    const EVENT_DATA = {
                        messageText: MESSAGE_TEXT
                    };

                    const vm = new Wincor.UI.Content.HeaderViewModel();
                    await vm.onViewModelEvent("MESSAGE_AVAILABLE", EVENT_DATA);
                    expect(vm.messageText()).toBe(MESSAGE_TEXT);
                    expect(vm.messageLevel()).toBe(MESSAGE_LEVEL.INFO);
                });

                it("processes passed level", async() => {
                    await injector.require(["GUIAPP/content/viewmodels/HeaderViewModel"]);
                    const MESSAGE_TEXT = "MESSAGE_TEXT!";
                    const EVENT_DATA = {
                        messageText: MESSAGE_TEXT,
                        messageLevel: MESSAGE_LEVEL.WARNING
                    };

                    const vm = new Wincor.UI.Content.HeaderViewModel();
                    await vm.onViewModelEvent("MESSAGE_AVAILABLE", EVENT_DATA);
                    expect(vm.messageText()).toBe(MESSAGE_TEXT);
                    expect(vm.messageLevel()).toBe(MESSAGE_LEVEL.WARNING);
                });

                it("with empty message resets level", async() => {
                    await injector.require(["GUIAPP/content/viewmodels/HeaderViewModel"]);

                    const MESSAGE_TEXT = "";
                    const EVENT_DATA = {
                        messageText: MESSAGE_TEXT
                    };

                    const vm = new Wincor.UI.Content.HeaderViewModel();
                    vm.messageLevel(MESSAGE_LEVEL.WARNING);
                    await vm.onViewModelEvent("MESSAGE_AVAILABLE", EVENT_DATA);
                    await Wincor.UI.Content.ViewModelContainer.whenActivated();
                    expect(vm.messageText()).toBe(MESSAGE_TEXT);
                    expect(vm.messageLevel()).toBe(MESSAGE_LEVEL.INFO);
                });

                it("with new message hides previous message before showing new", async() => {
                    const p = new Promise((resolve) => {
                        this.codeBehind.moveHeaderMessageOut = jasmine.createSpy("moveHeaderMessageOut")
                            .and.callFake(() => {
                                return Wincor.createMockObject("then.catch", {}, true, (spy, currentSpyName, args, index) => {
                                    args[0](); // resolve the first passed resolver of 'then' in org code
                                    resolve();
                                });
                            });
                    });
                    await injector.require(["GUIAPP/content/viewmodels/HeaderViewModel"]);

                    const MESSAGE_TEXT = "";
                    const EVENT_DATA = {
                        messageText: MESSAGE_TEXT
                    };

                    const vm = new Wincor.UI.Content.HeaderViewModel(this.codeBehind);
                    vm.messageText("PREVIOUS");
                    vm.messageLevel(MESSAGE_LEVEL.WARNING);
                    await vm.onViewModelEvent("MESSAGE_AVAILABLE", EVENT_DATA);
                    await p;
                    expect(vm.messageText()).toBe(MESSAGE_TEXT);
                    expect(vm.messageLevel()).toBe(MESSAGE_LEVEL.INFO);
                    expect(this.codeBehind.moveHeaderMessageOut).toHaveBeenCalledTimes(1);
                });
            });
            
            describe("ESCALATION_MESSAGE_AVAILABLE", () => {
                it("flag _escalationMessageAvailable should be true", async() => {
                    await injector.require(["GUIAPP/content/viewmodels/HeaderViewModel"]);

                    const MESSAGE_TEXT = "MESSAGE_TEXT!";
                    const EVENT_DATA = {
                        messageText: MESSAGE_TEXT
                    };
                    this.codeBehind.escalationMessageAvailable = jasmine.createSpy("escalationMessageAvailable");
                    const vm = new Wincor.UI.Content.HeaderViewModel(this.codeBehind);
                    await vm.onViewModelEvent("ESCALATION_MESSAGE_AVAILABLE");
                    await vm.onViewModelEvent("MESSAGE_AVAILABLE", EVENT_DATA); // this calls code-behind#escalationMessageAvailable()
                    expect(this.codeBehind.escalationMessageAvailable).toHaveBeenCalled();
                });
                
                it("flag _escalationMessageAvailable should be false", async() => {
                    await injector.require(["GUIAPP/content/viewmodels/HeaderViewModel"]);

                    const MESSAGE_TEXT = "MESSAGE_TEXT!";
                    const EVENT_DATA = {
                        messageText: MESSAGE_TEXT
                    };
                    this.codeBehind.escalationMessageAvailable = jasmine.createSpy("escalationMessageAvailable");
                    const vm = new Wincor.UI.Content.HeaderViewModel(this.codeBehind);
                    await vm.onViewModelEvent("ESCALATION_MESSAGE_AVAILABLE"); // flag gets true
                    vm.onDeactivated(); // should reset the flag _escalationMessageAvailable
                    await vm.onViewModelEvent("MESSAGE_AVAILABLE", EVENT_DATA); // this shouldn't call code-behind#escalationMessageAvailable()
                    expect(this.codeBehind.escalationMessageAvailable).not.toHaveBeenCalled();
                });
                
            });
            
            describe("code-behind module", () => {
                it("reference equals", async() => {
                    await injector.require(["GUIAPP/content/viewmodels/HeaderViewModel"]);
                    this.codeBehind.escalationMessageAvailable = jasmine.createSpy("escalationMessageAvailable");
                    const vm = new Wincor.UI.Content.HeaderViewModel(this.codeBehind);
                    vm.getModule();
                    expect(vm.getModule()).toBe(this.codeBehind);
                });
            });
            
            describe("split screen mode", () => {
                it("member has the correct default value", async() => {
                    await injector.require(["GUIAPP/content/viewmodels/HeaderViewModel"]);
                    const vm = new Wincor.UI.Content.HeaderViewModel(this.codeBehind);
                    expect(vm.splitScreenMode).toBe("disabled");
                });
            });
            
        });

    });

});

