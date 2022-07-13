/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ MobileAnimationsViewModel_test.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

define(['lib/Squire'], function(Squire) {

    let injector;
    let ko;
    let Wincor;
    let jQuery;

    describe("MobileAnimationsViewModel", () => {

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
                    setAnimations() {}
                    onContentChangeEvent() {}
                    observe() {}
                    onInitTextAndData() {}
                    onDeactivated() {}
                    onButtonPressed() {}
                };

                injector
                    .mock("flexuimapping", {buildGuiKey: () => { //dummy
                    }})
                    .mock("ui-content", {
                        designMode: Wincor.UI.Content.designMode
                    })
                    .mock("jquery", jQuery)
                    .mock("extensions", bundle.ext)
                    .mock("knockout", ko)
                    .mock("vm-container", Wincor.UI.Content.ViewModelContainer)
                    .mock("vm/AnimationsViewModel", Wincor.UI.Content.AnimationsViewModel);
                done();
            });
        });

        afterEach(() => {
            injector.remove();
        });

        describe("initialization", () => {
            it("super is called for all necessary overridden functions", (done) => {
                injector.require(["GUIAPP/content/viewmodels/MobileAnimationsViewModel"], () => {

                    spyOn(Wincor.UI.Content.AnimationsViewModel.prototype, "observe").and.callThrough();
                    spyOn(Wincor.UI.Content.AnimationsViewModel.prototype, "onInitTextAndData").and.callThrough();
                    spyOn(Wincor.UI.Content.AnimationsViewModel.prototype, "onDeactivated").and.callThrough();
                    spyOn(Wincor.UI.Content.AnimationsViewModel.prototype, "onContentChangeEvent");
                    
                    const vm = new Wincor.UI.Content.MobileAnimationsViewModel();
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


        describe("setting of contentkeys", () => {

            it("initialize", (done) => {
                injector.require(["GUIAPP/content/viewmodels/MobileAnimationsViewModel"], () => {

                    const vm = new Wincor.UI.Content.MobileAnimationsViewModel();

                    expect(vm.viewFlexMobileNfc()).toBe(false);
                    expect(vm.viewFlexMobileNfcNotOperational()).toBe(false);
                    expect(vm.animationTextMobileNfc()).toEqual("");


                    done();
                }, done.fail);
            });

            it("setAnimations is called for existing contentkeys", (done) => {
                injector.require(["GUIAPP/content/viewmodels/MobileAnimationsViewModel"], () => {

                    const vm = new Wincor.UI.Content.MobileAnimationsViewModel();

                    vm.isAvailable = jasmine.createSpy("isAvailable")
                        .and.callFake((keyArray, key) => {
                            return  keyArray.includes(key);
                        });

                    vm.setAnimations(["MobileNfc","MobileNfcNotOperational"]);

                    expect(vm.viewFlexMobileNfc()).toBe(true);
                    expect(vm.viewFlexMobileNfcNotOperational()).toBe(true);

                    done();
                }, done.fail);
            });

            it("setAnimations is called for a not existing contentkey", (done) => {
                injector.require(["GUIAPP/content/viewmodels/MobileAnimationsViewModel"], () => {

                    const vm = new Wincor.UI.Content.MobileAnimationsViewModel();

                    vm.isAvailable = jasmine.createSpy("isAvailable")
                        .and.callFake((keyArray, key) => {
                            return  keyArray.includes(key);
                        });

                    vm.setAnimations(["TestKey"]);

                    expect(vm.viewFlexMobileNfc()).toBe(false);
                    expect(vm.viewFlexMobileNfcNotOperational()).toBe(false);

                    done();
                }, done.fail);
            });

            it("onDeactivated", (done) => {
                injector.require(["GUIAPP/content/viewmodels/MobileAnimationsViewModel"], () => {

                    const vm = new Wincor.UI.Content.MobileAnimationsViewModel();

                    vm.viewHelper.removeWaitSpinner = jasmine.createSpy("removeWaitSpinner").and.returnValue(true);
                    vm.onDeactivated();

                    expect(vm.viewFlexMobileNfc()).toBe(false);
                    expect(vm.viewFlexMobileNfcNotOperational()).toBe(false);
                    expect(vm.animationTextMobileNfc()).toEqual("");


                    done();
                }, done.fail);
            });
        });
    });
});

