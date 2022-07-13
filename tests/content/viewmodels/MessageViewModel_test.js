/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ MessageViewModel_test.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

define(['lib/Squire'], function(Squire) {

    let injector;
    let ko;
    let Wincor;
    let jQuery;

    describe("MessageViewModel", () => {

        beforeEach(done => {
            injector = new Squire();
            injector.require(["NamespaceMock"], bundle => {
                Wincor = window.Wincor = bundle.createWincor();
                ko = Wincor.ko = window.ko = bundle.ko;
                jQuery = window.jQuery = bundle.jQuery;

                Wincor.UI.Content.BaseViewModel = class BaseViewModel extends Wincor.UI.Content.BaseViewModel {
                    constructor() {
                        super();
                        // be careful: This overwrites any method under the same name both in BaseViewModel AND the viewmodel to test - so the total inheritance chain!
                        // we create a fake baseclass that basically is the BaseViewModel of NameSpaceMock, which is
                        // extended by jasmine.createSpyObj to replace some standard functions with spies.
                        return Object.assign(this, jasmine.createSpyObj("FakeBaseMethods", ["observe", "messageText", "onButtonPressed" ]));
                    }
                    onInitTextAndData() {}
                    onDeactivated() {}
                };
                
                injector
                    .mock("jquery", jQuery)
                    .mock("extensions", bundle.ext)
                    .mock("knockout", ko)
                    .mock("basevm", Wincor.UI.Content.BaseViewModel)
                    .mock("ui-content", Wincor.UI.Content)
                    .mock("vm-container", Wincor.UI.Content.ViewModelContainer);
                done();
            });
        });

        afterEach(() => {
            injector.remove();
        });

        describe("initialization", () => {
            it("super is called for all necessary overridden functions", (done) => {
                injector.require(["GUIAPP/content/viewmodels/MessageViewModel"], () => {

                    const vm = new Wincor.UI.Content.MessageViewModel();
                    // prepare required stuff and check
                    vm.viewConfig = {};

                    vm.observe("flexMain");
                    expect(vm.observe).toHaveBeenCalledTimes(1);

                    done();
                }, done.fail);
            });
    
            it("check onInitTextAndData", (done) => {
                injector.require(["GUIAPP/content/viewmodels/MessageViewModel"], () => {
                    const vm = new Wincor.UI.Content.MessageViewModel();
                    spyOn(Wincor.UI.Service.Provider.EventService, "registerForEvent");
                    let args = {
                        textKeys: [],
                        dataKeys: []
                    };
                    vm.onInitTextAndData(args);
                    expect(args.textKeys).toEqual(["GUI_TestViewKey_Message", "GUI_TestViewKey_Message_Level"]);
                    expect(Wincor.UI.Service.Provider.EventService.registerForEvent).toHaveBeenCalled();
                    done();
                }, done.fail);
            });
    
        });
    
        describe("text ready handling", () => {
            it("check onTextReady", (done) => {
                injector.require(["GUIAPP/content/viewmodels/MessageViewModel"], () => {
                    const vm = new Wincor.UI.Content.MessageViewModel();
                    spyOn(vm, "messageText").and.callThrough();
                    spyOn(vm, "messageLevel").and.callThrough();
                    vm.labels = {
                        set: (key, msg) => {return () => { return msg; }}
                    };
                    let RESULT = {
                        GUI_TestViewKey_Message: "Here is a message text 4u.",
                        GUI_TestViewKey_Message_Level: "WarningBox"
                    };
                    // must initialize _messageKey and _messageLevelKey which are private
                    let args = {
                        textKeys: [],
                        dataKeys: []
                    };
                    vm.onInitTextAndData(args);
                    expect(args.textKeys).toEqual(["GUI_TestViewKey_Message", "GUI_TestViewKey_Message_Level"]);
                    vm.onTextReady(RESULT);
                    expect(vm.messageText).toHaveBeenCalledTimes(2); // one for onTextReady and once again in messageBoxVisible computed
                    expect(vm.messageLevel).toHaveBeenCalledTimes(1);
                    expect(vm.messageBoxVisible()).toBe(true);
                    expect(vm.messageText()).toBe(RESULT.GUI_TestViewKey_Message);
                    expect(vm.messageLevel()).toBe(RESULT.GUI_TestViewKey_Message_Level);
    
                    done();
                }, done.fail);
            });
    
            it("check onTextReady empty text and level", (done) => {
                injector.require(["GUIAPP/content/viewmodels/MessageViewModel"], () => {
                    const vm = new Wincor.UI.Content.MessageViewModel();
                    spyOn(vm, "messageText").and.callThrough();
                    spyOn(vm, "messageLevel").and.callThrough();
                    vm.labels = {
                        set: (key, msg) => {
                            return () => {
                                return msg;
                            }
                        }
                    };
                    let RESULT = {
                        GUI_TestViewKey_Message: "",
                        GUI_TestViewKey_Message_Level: ""
                    };
                    // must initialize _messageKey and _messageLevelKey which are private
                    let args = {
                        textKeys: [],
                        dataKeys: []
                    };
                    vm.onInitTextAndData(args);
                    expect(args.textKeys).toEqual(["GUI_TestViewKey_Message", "GUI_TestViewKey_Message_Level"]);
                    vm.onTextReady(RESULT);
                    expect(vm.messageText).toHaveBeenCalledTimes(1); // one for onTextReady
                    expect(vm.messageLevel).toHaveBeenCalledTimes(1);
                    expect(vm.messageBoxVisible()).toBe(false);
                    expect(vm.messageText()).toBe(RESULT.GUI_TestViewKey_Message);
                    expect(vm.messageLevel()).toBe(RESULT.GUI_TestViewKey_Message_Level);
            
                    done();
                }, done.fail);
            });
    
            it("check onTextReady empty text and level = null", (done) => {
                injector.require(["GUIAPP/content/viewmodels/MessageViewModel"], () => {
                    const vm = new Wincor.UI.Content.MessageViewModel();
                    spyOn(vm, "messageText").and.callThrough();
                    spyOn(vm, "messageLevel").and.callThrough();
                    vm.labels = {
                        set: (key, msg) => {
                            return () => {
                                return msg;
                            }
                        }
                    };
                    let RESULT = {
                        GUI_TestViewKey_Message: null,
                        GUI_TestViewKey_Message_Level: null
                    };
                    // must initialize _messageKey and _messageLevelKey which are private
                    let args = {
                        textKeys: [],
                        dataKeys: []
                    };
                    vm.onInitTextAndData(args);
                    expect(args.textKeys).toEqual(["GUI_TestViewKey_Message", "GUI_TestViewKey_Message_Level"]);
                    vm.onTextReady(RESULT);
                    expect(vm.messageText).not.toHaveBeenCalled();
                    expect(vm.messageLevel).not.toHaveBeenCalled();
                    expect(vm.messageBoxVisible()).toBe(false);
                    expect(vm.messageText()).toBe("");
                    expect(vm.messageLevel()).toBe("InfoBox"); // default wasn't changed
                    done();
                }, done.fail);
            });
    
        });
    
        describe("escalation event handling", () => {
            it("check onEscalationEvent", (done) => {
                spyOn(Wincor.UI.Service.Provider.EventService, "getEventInfo")
                    .and
                    .returnValue({
                            ID_ESCALATION: 10007
                        }
                    );
                injector.require(["GUIAPP/content/viewmodels/MessageViewModel"], () => {
                    const vm = new Wincor.UI.Content.MessageViewModel();
                    spyOn(vm, "messageText").and.callThrough();
                    spyOn(vm, "messageLevel").and.callThrough();
                    vm.vmContainer = jasmine.createSpyObj("vmContainer", ["sendViewModelEvent"]);
                    vm.notifyViewUpdated = jasmine.createSpy("notifyViewUpdated");
                    vm.buildGuiEventKey = jasmine.createSpy("buildGuiEventKey").and.callFake((...suffixes) => {
                        suffixes = suffixes.filter((suffix) => {
                            return !!suffix;
                        });
                        return `GUI_TestViewKey_${suffixes.join("_")}`;
                    });
                    spyOn(vm.serviceProvider.LocalizeService, "getText")
                        .and
                        .callFake((keys, cb) => {
                            expect(keys).toEqual(['GUI_TestViewKey_10007_HALFTIMEOUT_Message', 'GUI_TestViewKey_10007_HALFTIMEOUT_Message_Level']);
                            let res = {};
                            res[keys[0]] = "This is a test message.";
                            res[keys[1]] = "ErrorLevel";
                            cb(res);
                        }
                    );
                    let EVT_DATA = "HALFTIMEOUT";
                    vm.onEscalationEvent(EVT_DATA);
                    expect(vm.vmContainer.sendViewModelEvent).toHaveBeenCalledWith("ESCALATION_MESSAGE_AVAILABLE");
                    expect(vm.messageText).toHaveBeenCalledTimes(3);
                    expect(vm.messageLevel).toHaveBeenCalledTimes(1);
                    expect(vm.notifyViewUpdated).toHaveBeenCalledTimes(1);
                    expect(vm.messageBoxVisible()).toBe(true);
                    expect(vm.messageText()).toBe("This is a test message.");
                    expect(vm.messageLevel()).toBe("ErrorLevel");
                    done();
                }, done.fail);
            });
            
            it("check onEscalationEvent sends viewmodel event ESCALATION_MESSAGE_AVAILABLE", (done) => {
                spyOn(Wincor.UI.Service.Provider.EventService, "getEventInfo")
                    .and
                    .returnValue({
                            ID_ESCALATION: 10007
                        }
                    );
                injector.require(["GUIAPP/content/viewmodels/MessageViewModel"], () => {
                    const vm = new Wincor.UI.Content.MessageViewModel();
                    spyOn(vm, "messageText").and.callThrough();
                    spyOn(vm, "messageLevel").and.callThrough();
                    vm.vmContainer = jasmine.createSpyObj("vmContainer", ["sendViewModelEvent"]);
                    vm.buildGuiEventKey = jasmine.createSpy("buildGuiEventKey");
                    spyOn(vm.serviceProvider.LocalizeService, "getText")
                        .and
                        .callFake((keys, cb) => {
                            cb({});
                        }
                    );
                    let EVT_DATA = "HALFTIMEOUT";
                    vm.onEscalationEvent(EVT_DATA);
                    expect(vm.vmContainer.sendViewModelEvent).toHaveBeenCalledWith("ESCALATION_MESSAGE_AVAILABLE");
                    done();
                }, done.fail);
            });
            
        });
    
    
    });
});

