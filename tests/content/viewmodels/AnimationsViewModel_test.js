/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ AnimationsViewModel_test.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

define(['lib/Squire'], function(Squire) {

    let injector;
    let ko;
    let Wincor;
    let jQuery;

    describe("AnimationsViewModel", () => {

        beforeEach(done => {
            injector = new Squire();
            injector.require(["NamespaceMock"], bundle => {
                Wincor = window.Wincor = bundle.createWincor();
                ko = Wincor.ko = window.ko = bundle.ko;
                jQuery = window.jQuery = bundle.jQuery;
                Wincor.UI.Content.MessageViewModel = class MessageViewModel extends Wincor.UI.Content.BaseViewModel {
                    constructor() {
                        super();
                        // be careful: This overwrites any method under the same name both in BaseViewModel AND the viewmodel to test - so the total inheritance chain!
                        // we create a fake baseclass that basically is the BaseViewModel of NameSpaceMock, which is
                        // extended by jasmine.createSpyObj to replace some standard functions with spies.
                        return Object.assign(this, jasmine.createSpyObj("FakeBaseMethods", ["observe", "onInitTextAndData", "onDeactivated", "messageText", "contentStyle" ]));
                    }
                };
                injector
                    .mock("jquery", jQuery)
                    .mock("extensions", bundle.ext)
                    .mock("knockout", ko)
                    .mock("vm/MessageViewModel", Wincor.UI.Content.MessageViewModel);
                done();
            });
        });

        afterEach(() => {
            injector.remove();
        });

        describe("initialization", () => {
            it("super is called for all necessary overridden functions", (done) => {
                injector.require(["GUIAPP/content/viewmodels/AnimationsViewModel"], () => {
                    const vm = new Wincor.UI.Content.AnimationsViewModel();
                    // prepare required stuff and check
                    vm.viewConfig = {};
                    vm.observe("flexMain");
                    expect(vm.observe).toHaveBeenCalledTimes(1);
                    vm.onInitTextAndData({dataKeys:[], textKeys:[]});
                    expect(vm.onInitTextAndData).toHaveBeenCalledTimes(1);
                    vm.onDeactivated();
                    expect(vm.onDeactivated).toHaveBeenCalledTimes(1);
                    done();
                }, done.fail);
            });
        });

        describe("style type", () => {
            it("initialize styleType", async() => {
                await injector.require(["GUIAPP/content/viewmodels/AnimationsViewModel"]);
                const vm = new Wincor.UI.Content.AnimationsViewModel();
                expect(typeof vm.styleType === "function").toBe(true);
            });
        });
        
        describe("event handling", () => {
            it("checks onContentChangeEvent", async done => {
                try {
                    await injector.require(["GUIAPP/content/viewmodels/AnimationsViewModel"]);
                    const vm = new Wincor.UI.Content.AnimationsViewModel();
                    vm.buildGuiEventKey = (...suffixes) => {
                        suffixes = suffixes.filter((suffix) => {
                            return !!suffix;
                        });
                        return `GUI_TestViewKey_Event_${suffixes.join("_")}`
                    };
                    vm.notifyViewUpdated = jasmine.createSpy(vm);
                    spyOn(vm, "setAnimations");
                    spyOn(vm, "onTextReady").and.callFake(result => {
                        expect(result["GUI_TestViewKey_Event_10013_NOTEINSERTION_Instruction"]).toBe("This is a new instruction text.");
                    });
                    let callNo = 0;
                    spyOn(Wincor.UI.Service.Provider.LocalizeService, "getText").and.callFake((keys, cb) => {
                        if(callNo === 0) {
                            expect(keys).toBe("GUI_TestViewKey_Event_10013_NOTEINSERTION_ContentKeys");
                            let result = {
                                GUI_TestViewKey_Event_10013_NOTEINSERTION_ContentKeys: "notesanim"
                            };
                            callNo++;
                            cb(result);
                        } else {
                            callNo++;
                        }
                        if(callNo === 2) {
                            expect(keys).toEqual([
                                'GUI_TestViewKey_Event_10013_NOTEINSERTION_Headline',
                                'GUI_TestViewKey_Event_10013_NOTEINSERTION_Instruction',
                                'GUI_TestViewKey_Event_10013_NOTEINSERTION_Message',
                                'GUI_TestViewKey_Event_10013_NOTEINSERTION_Message_Level',
                                'GUI_TestViewKey_Event_10013_NOTEINSERTION_AnimationText_notesanim'
                            ]);
                            let result = {
                                GUI_TestViewKey_Event_10013_NOTEINSERTION_Instruction: "This is a new instruction text."
                            };
                            cb(result);
                            expect(vm.currentAnimations).toEqual(["notesanim"]);
                            expect(vm.setAnimations).toHaveBeenCalledWith(["notesanim"]);
                            expect(vm.onTextReady).toHaveBeenCalledWith(result);
                            callNo++;
                        }
                    });
                    vm.onContentChangeEvent("NOTEINSERTION", "10013", "CCTransactionFW");
                    expect(vm.itemTextKeys.HEADLINE).toBe("GUI_TestViewKey_Event_10013_NOTEINSERTION_Headline");
                    expect(vm.itemTextKeys.INSTRUCTION).toBe("GUI_TestViewKey_Event_10013_NOTEINSERTION_Instruction");
                    expect(vm.itemTextKeys.MESSAGE).toBe("GUI_TestViewKey_Event_10013_NOTEINSERTION_Message");
                    expect(vm.itemTextKeys.LEVEL).toBe("GUI_TestViewKey_Event_10013_NOTEINSERTION_Message_Level");
                    expect(vm.itemTextKeys.HEADLINE).toBe("GUI_TestViewKey_Event_10013_NOTEINSERTION_Headline");
                    expect(vm.notifyViewUpdated).toHaveBeenCalledWith("GUI_TestViewKey_Event_10013_NOTEINSERTION");
                    done();
                } catch(e) {
                    done.fail(e);
                }
            });
    
            it("checks onContentChangeEvent with empty data", async done => {
                try {
                    await injector.require(["GUIAPP/content/viewmodels/AnimationsViewModel"]);
                    const vm = new Wincor.UI.Content.AnimationsViewModel();
                    vm.buildGuiEventKey = (...suffixes) => {
                        suffixes = suffixes.filter((suffix) => {
                            return !!suffix;
                        });
                        return `GUI_TestViewKey_Event_${suffixes.join("_")}`
                    };
                    vm.notifyViewUpdated = jasmine.createSpy(vm);
                    spyOn(Wincor.UI.Service.Provider.LocalizeService, "getText");
                    vm.onContentChangeEvent("", "10013", "CCTransactionFW");
                    expect(Wincor.UI.Service.Provider.LocalizeService.getText).not.toHaveBeenCalled();
                    expect(vm.notifyViewUpdated).toHaveBeenCalledWith("GUI_TestViewKey_Event_10013");
                    done();
                } catch(e) {
                    done.fail(e);
                }
            });
    
            it("checks onContentChangeEvent with JSON data - content_key set", async done => {
                try {
                    await injector.require(["GUIAPP/content/viewmodels/AnimationsViewModel"]);
                    const vm = new Wincor.UI.Content.AnimationsViewModel();
                    vm.buildGuiEventKey = (...suffixes) => {
                        suffixes = suffixes.filter((suffix) => {
                            return !!suffix;
                        });
                        return `GUI_TestViewKey_Event_${suffixes.join("_")}`
                    };
                    vm.notifyViewUpdated = jasmine.createSpy(vm);
                    spyOn(Wincor.UI.Service.Provider.LocalizeService, "getText").and.callFake((textKeyContentKeys, cb) => {
                        expect(textKeyContentKeys).toBe("GUI_TestViewKey_Event_10013_SCANCHEQUES_ContentKeys");
                    });
                    vm.onContentChangeEvent("{\"content_key\":\"SCANCHEQUES\", \"type\":\"note\", \"number\":\"13\", \"amount\":\"\"}", "10013", "CCTransactionFW");
                    expect(vm.itemTextKeys.HEADLINE).toBe("GUI_TestViewKey_Event_10013_SCANCHEQUES_Headline");
                    expect(vm.itemTextKeys.INSTRUCTION).toBe("GUI_TestViewKey_Event_10013_SCANCHEQUES_Instruction");
                    expect(vm.itemTextKeys.MESSAGE).toBe("GUI_TestViewKey_Event_10013_SCANCHEQUES_Message");
                    expect(vm.itemTextKeys.LEVEL).toBe("GUI_TestViewKey_Event_10013_SCANCHEQUES_Message_Level");
                    expect(Wincor.UI.Service.Provider.LocalizeService.getText).toHaveBeenCalledTimes(1);
                    expect(vm.notifyViewUpdated).toHaveBeenCalledWith("GUI_TestViewKey_Event_10013_SCANCHEQUES");
                    done();
                } catch(e) {
                    done.fail(e);
                }
            });
    
            it("checks onContentChangeEvent with JSON data - content_key not set", async done => {
                try {
                    await injector.require(["GUIAPP/content/viewmodels/AnimationsViewModel"]);
                    const vm = new Wincor.UI.Content.AnimationsViewModel();
                    vm.buildGuiEventKey = (...suffixes) => {
                        suffixes = suffixes.filter((suffix) => {
                            return !!suffix;
                        });
                        return `GUI_TestViewKey_Event_${suffixes.join("_")}`
                    };
                    vm.notifyViewUpdated = jasmine.createSpy(vm);
                    spyOn(Wincor.UI.Service.Provider.LocalizeService, "getText").and.callFake((textKeyContentKeys, cb) => {
                        expect(textKeyContentKeys).toBe("GUI_TestViewKey_Event_10013_SCANCHEQUES_ContentKeys");
                    });
                    // content_key not set
                    vm.onContentChangeEvent("{\"content_key\":\"\", \"type\":\"note\", \"number\":\"13\", \"amount\":\"\"}", "10013", "CCTransactionFW");
                    expect(Wincor.UI.Service.Provider.LocalizeService.getText).not.toHaveBeenCalled();
                    expect(vm.notifyViewUpdated).toHaveBeenCalledWith("GUI_TestViewKey_Event_10013");
                    done();
                } catch(e) {
                    done.fail(e);
                }
            });
    
            it("checks onContentChangeEvent with JSON data - content_key not available", async done => {
                try {
                    await injector.require(["GUIAPP/content/viewmodels/AnimationsViewModel"]);
                    const vm = new Wincor.UI.Content.AnimationsViewModel();
                    vm.buildGuiEventKey = (...suffixes) => {
                        suffixes = suffixes.filter((suffix) => {
                            return !!suffix;
                        });
                        return `GUI_TestViewKey_Event_${suffixes.join("_")}`
                    };
                    vm.notifyViewUpdated = jasmine.createSpy(vm);
                    spyOn(Wincor.UI.Service.Provider.LocalizeService, "getText").and.callFake((textKeyContentKeys, cb) => {
                        expect(textKeyContentKeys).toBe("GUI_TestViewKey_Event_10013_SCANCHEQUES_ContentKeys");
                    });
                    vm.onContentChangeEvent("{\"type\":\"note\", \"number\":\"13\", \"amount\":\"\"}", "10013", "CCTransactionFW");
                    expect(Wincor.UI.Service.Provider.LocalizeService.getText).not.toHaveBeenCalled();
                    expect(vm.notifyViewUpdated).toHaveBeenCalledWith("GUI_TestViewKey_Event_10013");
                    done();
                } catch(e) {
                    done.fail(e);
                }
            });
    
            it("checks onContentChangeEvent with invalid JSON data", async done => {
                try {
                    await injector.require(["GUIAPP/content/viewmodels/AnimationsViewModel"]);
                    const vm = new Wincor.UI.Content.AnimationsViewModel();
                    vm.buildGuiEventKey = (...suffixes) => {
                        suffixes = suffixes.filter((suffix) => {
                            return !!suffix;
                        });
                        return `GUI_TestViewKey_Event_${suffixes.join("_")}`;
                    };
                    vm.notifyViewUpdated = jasmine.createSpy(vm);
                    spyOn(Wincor.UI.Service.Provider.LocalizeService, "getText").and.callFake((textKeyContentKeys, cb) => {
                        expect(textKeyContentKeys).toBe("GUI_TestViewKey_Event_10013_SCANCHEQUES_ContentKeys");
                    });
                    vm.onContentChangeEvent("{\"content_key\":\"SCANCHEQUES\", ", "10013", "CCTransactionFW");
                    expect(Wincor.UI.Service.Provider.LocalizeService.getText).not.toHaveBeenCalled();
                    expect(vm.notifyViewUpdated).toHaveBeenCalledWith("GUI_TestViewKey_Event_10013");
                    done();
                } catch(e) {
                    done.fail(e);
                }
            });
        });
    });
});

