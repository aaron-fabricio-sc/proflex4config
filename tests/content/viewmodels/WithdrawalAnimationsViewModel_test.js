/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ WithdrawalAnimationsViewModel_test.js 4.3.1-210408-21-739a2320-1a04bc7d

*/

define(['lib/Squire'], function(Squire) {

    let injector;
    let ko;
    let Wincor;
    let jQuery;

    describe("WithdrawalAnimationsViewModel", () => {

        beforeEach(done => {
            injector = new Squire();
            injector.require(["NamespaceMock"], bundle => {
                Wincor = window.Wincor = bundle.createWincor();
                ko = Wincor.ko = window.ko = bundle.ko;
                jQuery = window.jQuery = bundle.jQuery;
                Wincor = Wincor.createMockObject("UI.Content.AnimationsViewModel", Wincor);
                
                Wincor.UI.Content.AnimationsViewModel = class AnimationsViewModel extends Wincor.UI.Content.BaseViewModel {
                    constructor() {
                        super();
                    }
                    eventRegistrations = [];
                    onContentChangeEvent() {}
                    setAnimations() {}
                    observe() {}
                    onInitTextAndData() {}
                    onDeactivated() {}
                    onButtonPressed() {}
                };
                
                injector
                    .mock("jquery", jQuery)
                    .mock("extensions", bundle.ext)
                    .mock("knockout", ko)
                    .mock("vm/AnimationsViewModel", Wincor.UI.Content.AnimationsViewModel);
                done();
            });
        });

        afterEach(() => {
            injector.remove();
        });

        describe("initialization", () => {
            it("super is called for all necessary overridden functions", (done) => {
                injector.require(["GUIAPP/content/viewmodels/WithdrawalAnimationsViewModel"], () => {

                    spyOn(Wincor.UI.Content.AnimationsViewModel.prototype, "observe").and.callThrough();
                    spyOn(Wincor.UI.Content.AnimationsViewModel.prototype, "onInitTextAndData").and.callThrough();
                    spyOn(Wincor.UI.Content.AnimationsViewModel.prototype, "onDeactivated").and.callThrough();
                    
                    const vm = new Wincor.UI.Content.WithdrawalAnimationsViewModel();
                    // prepare required stuff and check
                    vm.viewConfig = {};
                    vm.observe("flexMain");
                    expect(Wincor.UI.Content.AnimationsViewModel.prototype.observe).toHaveBeenCalledTimes(1);
                    vm.onInitTextAndData({dataKeys:[], textKeys:[]});
                    expect(Wincor.UI.Content.AnimationsViewModel.prototype.onInitTextAndData).toHaveBeenCalledTimes(1);

                    vm.viewHelper.removeWaitSpinner = jasmine.createSpy("removeWaitSpinner").and.returnValue(true);
                    vm.onDeactivated();
                    expect(Wincor.UI.Content.AnimationsViewModel.prototype.onDeactivated).toHaveBeenCalledTimes(1);
                    done();
                }, done.fail);
            });
        });
    
        describe("event registrations", () => {
            it("for cash to be added", (done) => {
                const EVENT_INFO = {
                    NAME: "TestFW",
                    ID_CASH: 4711
                };
                spyOn(Wincor.UI.Service.Provider.EventService, "getEventInfo").and.returnValue(EVENT_INFO);
                injector.require(["GUIAPP/content/viewmodels/WithdrawalAnimationsViewModel"], () => {
                    const vm = new Wincor.UI.Content.WithdrawalAnimationsViewModel();
                    expect(vm.eventRegistrations.length).toBe(1);
                    expect(vm.eventRegistrations[0].eventNumber).toBe(EVENT_INFO.ID_CASH);
                    expect(vm.eventRegistrations[0].eventOwner).toBe(EVENT_INFO.NAME);
    
                    done();
                }, done.fail);
            });
        });
    
        describe("setting of contentkeys", () => {

            it("initialize", (done) => {
                injector.require(["GUIAPP/content/viewmodels/WithdrawalAnimationsViewModel"], () => {

                    const vm = new Wincor.UI.Content.WithdrawalAnimationsViewModel();
    
                    expect(vm.viewFlexNotesEject()).toBe(false);
                    expect(vm.viewFlexItemsEject()).toBe(false);
                    expect(vm.viewFlexCoinsEject()).toBe(false);
                    expect(vm.viewFlexReceipt()).toBe(false);
                    expect(vm.viewFlexElectronicReceipt()).toBe(false);
    
                    expect(vm.animationTextReceipt()).toEqual("");
                    expect(vm.animationTextElectronicReceipt()).toEqual("");
    
                    done();
                }, done.fail);
            });

            it("setAnimations is called for existing contentkeys", (done) => {
                injector.require(["GUIAPP/content/viewmodels/WithdrawalAnimationsViewModel"], () => {

                    const vm = new Wincor.UI.Content.WithdrawalAnimationsViewModel();

                    vm.isAvailable = jasmine.createSpy("isAvailable")
                        .and.callFake((keyArray, key) => {
                            return  keyArray.includes(key);
                        });

                    vm.setAnimations(["TakeNotesInputTray", "TakeNotesOutputTray", "TakeNotes", "TakeItems", "TakeCoins", "TakeReceipt", "SendReceipt"]);

                    expect(vm.viewFlexNotesEject()).toBe(true);
                    expect(vm.viewFlexItemsEject()).toBe(true);
                    expect(vm.viewFlexCoinsEject()).toBe(true);
                    expect(vm.viewFlexReceipt()).toBe(true);
                    expect(vm.viewFlexElectronicReceipt()).toBe(true);

                    done();
                }, done.fail);
            });

            it("setAnimations is called for a not existing contentkey", (done) => {
                injector.require(["GUIAPP/content/viewmodels/WithdrawalAnimationsViewModel"], () => {

                    const vm = new Wincor.UI.Content.WithdrawalAnimationsViewModel();

                    vm.isAvailable = jasmine.createSpy("isAvailable")
                        .and.callFake((keyArray, key) => {
                            return  keyArray.includes(key);
                        });

                    vm.setAnimations(["TestKey"]);

                    expect(vm.viewFlexNotesEject()).toBe(false);
                    expect(vm.viewFlexItemsEject()).toBe(false);
                    expect(vm.viewFlexCoinsEject()).toBe(false);
                    expect(vm.viewFlexReceipt()).toBe(false);
                    expect(vm.viewFlexElectronicReceipt()).toBe(false);

                    done();
                }, done.fail);
            });

            it("onDeactivated", (done) => {
                injector.require(["GUIAPP/content/viewmodels/WithdrawalAnimationsViewModel"], () => {

                    const vm = new Wincor.UI.Content.WithdrawalAnimationsViewModel();

                    vm.viewHelper.removeWaitSpinner = jasmine.createSpy("removeWaitSpinner").and.returnValue(true);
                    vm.onDeactivated();
    
                    expect(vm.viewFlexNotesEject()).toBe(false);
                    expect(vm.viewFlexItemsEject()).toBe(false);
                    expect(vm.viewFlexCoinsEject()).toBe(false);
                    expect(vm.viewFlexReceipt()).toBe(false);
                    expect(vm.viewFlexElectronicReceipt()).toBe(false);
                    expect(vm.animationTextReceipt()).toEqual("");
                    expect(vm.animationTextElectronicReceipt()).toEqual("");
                    
                    done();
                }, done.fail);
            });
        });
    });
});

