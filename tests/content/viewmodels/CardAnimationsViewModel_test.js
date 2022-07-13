/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ CardAnimationsViewModel_test.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

define(['lib/Squire'], function(Squire) {

    let injector;
    let ko;
    let Wincor;
    let jQuery;

    describe("CardAnimationsViewModel", () => {

        beforeEach(done => {
            injector = new Squire();
            injector.require(["NamespaceMock"], bundle => {
                Wincor = window.Wincor = bundle.createWincor();
                ko = Wincor.ko = window.ko = bundle.ko;
                jQuery = window.jQuery = bundle.jQuery;
                Wincor = Wincor.createMockObject("UI.Content.AnimationsViewModel", Wincor);

                this.config = {};
                
                Wincor.UI.Content.AnimationsViewModel = class AnimationsViewModel extends Wincor.UI.Content.BaseViewModel {
                    constructor() {
                        super();
                    }
                    eventRegistrations = [];
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
                    .mock("config/Config", this.config)
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
                injector.require(["GUIAPP/content/viewmodels/CardAnimationsViewModel"], () => {

                    spyOn(Wincor.UI.Content.AnimationsViewModel.prototype, "observe").and.callThrough();
                    spyOn(Wincor.UI.Content.AnimationsViewModel.prototype, "onInitTextAndData").and.callThrough();
                    spyOn(Wincor.UI.Content.AnimationsViewModel.prototype, "onDeactivated").and.callThrough();
                    spyOn(Wincor.UI.Content.AnimationsViewModel.prototype, "onContentChangeEvent");
                    
                    const vm = new Wincor.UI.Content.CardAnimationsViewModel();
                    // prepare required stuff and check
                    vm.viewConfig = {};
                    vm.observe("flexMain");
                    expect(Wincor.UI.Content.AnimationsViewModel.prototype.observe).toHaveBeenCalledTimes(1);
                    vm.onInitTextAndData({dataKeys:[], textKeys:[]});
                    expect(Wincor.UI.Content.AnimationsViewModel.prototype.onInitTextAndData).toHaveBeenCalledTimes(1);
                    vm.viewHelper.removeWaitSpinner = jasmine.createSpy("removeWaitSpinner").and.returnValue(true);
                    vm.onContentChangeEvent("INSERT_DIP", 123);
                    expect(Wincor.UI.Content.AnimationsViewModel.prototype.onContentChangeEvent).toHaveBeenCalledTimes(1);
                    vm.onDeactivated();
                    expect(Wincor.UI.Content.AnimationsViewModel.prototype.onDeactivated).toHaveBeenCalledTimes(1);
                    done();
                }, done.fail);
            });
        });

        describe("stop DM on DIP insert", () => {
            it("DM is stopped on DIP insert (default)", (done) => {
                injector.require(["GUIAPP/content/viewmodels/CardAnimationsViewModel"], () => {

                    const vm = new Wincor.UI.Content.CardAnimationsViewModel();
                    vm.onInitTextAndData({dataKeys:[], textKeys:[]});
                    expect(vm.stopDMOnDipEvent()).toBe(true);

                    done();
                }, done.fail);
            });

            it("DM is stopped on DIP insert (true)", (done) => {
                injector.require(["GUIAPP/content/viewmodels/CardAnimationsViewModel"], () => {

                    const vm = new Wincor.UI.Content.CardAnimationsViewModel();
                    vm.viewConfig.config = {"stopDMOnDipEvent" : true};
                    vm.onInitTextAndData({dataKeys:[], textKeys:[]});
                    expect(vm.stopDMOnDipEvent()).toBe(true);

                    done();
                }, done.fail);
            });

            it("DM is not stopped on DIP insert (false)", (done) => {
                injector.require(["GUIAPP/content/viewmodels/CardAnimationsViewModel"], () => {

                    const vm = new Wincor.UI.Content.CardAnimationsViewModel();
                    vm.viewConfig.config = {"stopDMOnDipEvent" : false};
                    vm.onInitTextAndData({dataKeys:[], textKeys:[]});
                    expect(vm.stopDMOnDipEvent()).toBe(false);

                    done();
                }, done.fail);
            });

            it("DM is not stopped on DIP insert (blabla)", (done) => {
                injector.require(["GUIAPP/content/viewmodels/CardAnimationsViewModel"], () => {

                    const vm = new Wincor.UI.Content.CardAnimationsViewModel();
                    vm.viewConfig.config = {"stopDMOnDipEvent" : "blabla"};
                    vm.onInitTextAndData({dataKeys:[], textKeys:[]});
                    expect(vm.stopDMOnDipEvent()).toBe(false);

                    done();
                }, done.fail);
            });

        });

        describe("call dmStop", () => {

            it("call dmStop on DIP insert provided that DM is active", (done) => {
                injector.require(["GUIAPP/content/viewmodels/CardAnimationsViewModel"], () => {

                    const vm = new Wincor.UI.Content.CardAnimationsViewModel();
                    spyOn(vm.cmdRepos, "setActive");

                    const utilSvc = Wincor.UI.Service.Provider.UtilityService;
                    spyOn(utilSvc,"dmStop").and.returnValue(0);
                    this.config.isDirectMarketingAvailable = true;
                    vm.stopDMOnDipEvent(true);

                    vm.onContentChangeEvent("INSERT_DIP", 123);
                    expect(vm.cmdRepos.setActive).toHaveBeenCalledTimes(1);
                    expect(utilSvc.dmStop).toHaveBeenCalledTimes(1);

                    done();
                }, done.fail);
            });

            it("do not call dmStop on DIP insert, because DM is not active", (done) => {
                injector.require(["GUIAPP/content/viewmodels/CardAnimationsViewModel"], () => {

                    const vm = new Wincor.UI.Content.CardAnimationsViewModel();
                    spyOn(vm.cmdRepos, "setActive");

                    const utilSvc = Wincor.UI.Service.Provider.UtilityService;
                    spyOn(utilSvc,"dmStop").and.returnValue(0);
                    this.config.isDirectMarketingAvailable = false;
                    vm.stopDMOnDipEvent(true);

                    vm.onContentChangeEvent("INSERT_DIP", 123);
                    expect(vm.cmdRepos.setActive).toHaveBeenCalledTimes(1);
                    expect(utilSvc.dmStop).toHaveBeenCalledTimes(0);

                    done();
                }, done.fail);
            });
        });

    });

});

