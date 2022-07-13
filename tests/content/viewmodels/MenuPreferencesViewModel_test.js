/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ MenuPreferencesViewModel_test.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

define(['lib/Squire'], function(Squire) {

    let injector;
    let ko;
    let Wincor;
    let jQuery;

    describe("MenuPreferencesViewModel", () => {

        beforeEach(done => {
            injector = new Squire();
            injector.require(["NamespaceMock"], bundle => {
                Wincor = window.Wincor = bundle.createWincor();
                jQuery = window.jQuery = bundle.jQuery;
                ko = Wincor.ko = window.ko = bundle.ko;
                
                Wincor.UI.Content.ListViewModel = class ListViewModel extends Wincor.UI.Content.BaseViewModel {
                    constructor() {
                        super();
                    }
                    setListLen() {
                    };
                    setListSource() {};
                    dataList = {
                        items: ko.observableArray([])
                    };
                    initScrollbar() {
                    };
                    initCurrentVisibleLimits() {
                    };
                    
                    observe() {}
                    onInitTextAndData() {}
                    onDeactivated() {}
                    onButtonPressed() {}
                }
                
                injector
                    .mock("jquery", jQuery)
                    .mock("extensions", bundle.ext)
                    .mock("knockout", ko)
                    .store("vm-util/UIMovements")
                    .mock("vm-util/UIMovements", {
                        getElementOrder: jasmine.createSpy("ObjectManager::getElementOrder")
                    })
                    .mock("vm/ListViewModel", Wincor.UI.Content.ListViewModel );
                done();
            });
        });

        afterEach(() => {
            injector.remove();
        });

        describe("initialization", () => {
            it("super is called for all necessary overridden functions", async () => {
                await injector.require(["GUIAPP/content/viewmodels/MenuPreferencesViewModel"]);

                spyOn(Wincor.UI.Content.ListViewModel.prototype, "observe").and.callThrough();
                spyOn(Wincor.UI.Content.ListViewModel.prototype, "onInitTextAndData").and.callThrough();
                spyOn(Wincor.UI.Content.ListViewModel.prototype, "onDeactivated").and.callThrough();
                
                const vm = new Wincor.UI.Content.MenuPreferencesViewModel();
                vm.observe("flexMain");
                expect(Wincor.UI.Content.ListViewModel.prototype.observe).toHaveBeenCalledTimes(1);
                vm.onInitTextAndData({dataKeys:[], textKeys:[]});
                expect(Wincor.UI.Content.ListViewModel.prototype.onInitTextAndData).toHaveBeenCalledTimes(1);
                vm.viewHelper.removeWaitSpinner = jasmine.createSpy("removeWaitSpinner").and.returnValue(true);
                vm.onDeactivated();
                expect(Wincor.UI.Content.ListViewModel.prototype.onDeactivated).toHaveBeenCalledTimes(1);
            });
        });

        describe("user interaction", () => {
            it("requests the correct container items from ObjectManager on 'CONFIRM'", async () => {
                let [x, mocks] = await injector.require(["GUIAPP/content/viewmodels/MenuPreferencesViewModel", "mocks"]);
                const vm = new Wincor.UI.Content.MenuPreferencesViewModel();
                // prepare required stuff and check
                vm.onButtonPressed("CONFIRM");
                expect(mocks.store["vm-util/UIMovements"].getElementOrder).toHaveBeenCalledTimes(1);
                expect(mocks.store["vm-util/UIMovements"].getElementOrder).toHaveBeenCalledWith("flexArticle");
            });
        });
    });
});

