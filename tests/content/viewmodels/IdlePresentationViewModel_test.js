/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ IdlePresentationViewModel_test.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

define(['lib/Squire'], function(Squire) {

    let injector;
    let ko;
    let Wincor;
    let jQuery;

    describe("IdlePresentationViewModel", () => {

        beforeEach(done => {
            injector = new Squire();
            injector.require(["NamespaceMock"], bundle => {
                Wincor = window.Wincor = bundle.createWincor();
                ko = Wincor.ko = window.ko = bundle.ko;
                jQuery = window.jQuery = bundle.jQuery;
                Wincor = Wincor.createMockObject("UI.Content.CardAnimationsViewModel", Wincor);

                Wincor.UI.Content.CardAnimationsViewModel = class CardAnimationsViewModel extends Wincor.UI.Content.BaseViewModel {
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
                    .mock("ui-content", {})
                    .mock("jquery", jQuery)
                    .mock("extensions", bundle.ext)
                    .mock("knockout", ko)
                    .mock("vm/CardAnimationsViewModel", Wincor.UI.Content.CardAnimationsViewModel);
                done();
            });
        });

        afterEach(() => {
            injector.remove();
        });

        describe("initialization", () => {
            it("super is called for all necessary overridden functions", (done) => {
                injector.require(["GUIAPP/content/viewmodels/IdlePresentationViewModel"], () => {

                    spyOn(Wincor.UI.Content.CardAnimationsViewModel.prototype, "observe").and.callThrough();
                    spyOn(Wincor.UI.Content.CardAnimationsViewModel.prototype, "onInitTextAndData").and.callThrough();
                    spyOn(Wincor.UI.Content.CardAnimationsViewModel.prototype, "onDeactivated").and.callThrough();
                    
                    const vm = new Wincor.UI.Content.IdlePresentationViewModel();
                    // prepare required stuff and check
                    vm.viewConfig = {};
                    vm.observe("flexMain");
                    expect(Wincor.UI.Content.CardAnimationsViewModel.prototype.observe).toHaveBeenCalledTimes(1);
                    vm.onInitTextAndData({dataKeys:[], textKeys:[]});
                    expect(Wincor.UI.Content.CardAnimationsViewModel.prototype.onInitTextAndData).toHaveBeenCalledTimes(1);
                    vm.viewHelper.removeWaitSpinner = jasmine.createSpy("removeWaitSpinner").and.returnValue(true);
                    vm.onDeactivated();
                    expect(Wincor.UI.Content.CardAnimationsViewModel.prototype.onDeactivated).toHaveBeenCalledTimes(1);
                    done();
                }, done.fail);
            });
        });
    });
});

