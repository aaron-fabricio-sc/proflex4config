/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ NumericEntryViewModel_test.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

define(['lib/Squire'], function(Squire) {

    let injector;
    let ko;
    let Wincor;
    let jQuery;

    describe("NumericEntryViewModel", () => {

        beforeEach(done => {
            injector = new Squire();
            injector.require(["NamespaceMock"], bundle => {
                Wincor = window.Wincor = bundle.createWincor();
                ko = Wincor.ko = window.ko = bundle.ko;
                jQuery = window.jQuery = bundle.jQuery;

                Wincor.UI.Content.BaseViewModel = class BaseViewModel extends Wincor.UI.Content.BaseViewModel {
                    constructor() {
                        super();
                    }
                    observe() {}
                    onInitTextAndData() {}
                    onDeactivated() {}
                    onButtonPressed() {}
                };
                
                injector
                    .mock("jquery", jQuery)
                    .mock("extensions", bundle.ext)
                    .mock("knockout", ko)
                    .mock("basevm", Wincor.UI.Content.BaseViewModel)
                    .mock("vm-container", Wincor.UI.Content.ViewModelContainer);
                done();
            });
        });

        afterEach(() => {
            injector.remove();
        });
    
        describe("initialization", () => {
            it("checks onInitTextAndData -> showLastInputOnSecure", async() => {
                await injector.require(["GUIAPP/content/viewmodels/NumericEntryViewModel"]);
                let neVM = new Wincor.UI.Content.NumericEntryViewModel();
                neVM.viewConfig.config = {
                    "preValue": "",
                    "placeHolder": "1234567890",
                    "formatOption": "NONE",
                    "allowLeadingZero": false,
                    "showLastInputOnSecure": true,
                    "clearByCorrect": true,
                    "minLen": 5,
                    "maxLen": 10,
                    "messageLength": "Something is wrong with the input length not between 5 and 15",
                    "messageLevel": "ErrorBox"
                };
                const ARGS = {
                    dataKeys: [],
                    textKeys: []
                };
                neVM.onInitTextAndData(ARGS);
                expect(neVM.showLastInputOnSecure()).toBe(true);
                neVM.viewConfig.config.showLastInputOnSecure = false;
                neVM.onInitTextAndData(ARGS);
                expect(neVM.showLastInputOnSecure()).toBe(false);
            });
        });
        
        describe("general", () => {
            it("super is called for all necessary overridden functions", (done) => {
                injector.require(["GUIAPP/content/viewmodels/NumericEntryViewModel"], () => {
                    
                    spyOn(Wincor.UI.Content.BaseViewModel.prototype, "observe").and.callThrough();
                    spyOn(Wincor.UI.Content.BaseViewModel.prototype, "onInitTextAndData").and.callThrough();
                    spyOn(Wincor.UI.Content.BaseViewModel.prototype, "onDeactivated").and.callThrough();
                    
                    const vm = new Wincor.UI.Content.NumericEntryViewModel();
                    vm.vmHelper.convertToBoolean = jasmine.createSpy("convertToBoolean").and.returnValue(true);
                    vm.observe("flexMain");
                    expect(Wincor.UI.Content.BaseViewModel.prototype.observe).toHaveBeenCalledTimes(1);
                    vm.onInitTextAndData({dataKeys:[], textKeys:[]});
                    expect(Wincor.UI.Content.BaseViewModel.prototype.onInitTextAndData).toHaveBeenCalledTimes(1);
                    vm.onDeactivated();
                    expect(Wincor.UI.Content.BaseViewModel.prototype.onDeactivated).toHaveBeenCalledTimes(1);
                    done();
                }, done.fail);
            });
        });

        describe("private input", () => {
            it("calls UtilityService::addFilter before passing private input to BL", (done) => {
                // vm references ViewService during module load and keeps it in module scope, so we have to hook it right here
                let vm;
                spyOn(Wincor.UI.Service.Provider.DataService, "setValues");
                // install handler for endView, to overcome async calls
                spyOn(Wincor.UI.Service.Provider.ViewService, "endView")
                    .and.callFake(() => {
                        expect(vm.serviceProvider.UtilityService.addTraceFilter).toHaveBeenCalledBefore(Wincor.UI.Service.Provider.DataService.setValues);
                        expect(vm.serviceProvider.UtilityService.addTraceFilter).toHaveBeenCalledTimes(2);
                        expect(vm.serviceProvider.UtilityService.addTraceFilter.calls.first().args[0]).toEqual(1234);
                        done();
                    });
                injector.require(["GUIAPP/content/viewmodels/NumericEntryViewModel"], () => {
                    vm = new Wincor.UI.Content.NumericEntryViewModel();
                    spyOn(vm, "isNumberValid").and.returnValue(true);
                    vm.vmHelper.convertToBoolean = jasmine.createSpy("convertToBoolean").and.returnValue(true);
                    vm.observe("flexMain");
                    vm.numberField(1234);
                    spyOn(vm.serviceProvider.UtilityService, "addTraceFilter").and.returnValue(Promise.resolve());
                    vm.onButtonPressed("CONFIRM");
                }, done.fail);
            });
        });

        describe("deactivate number keys due to input length", () => {

            it("do not deactivate number keys because max length has not been reached", (done) => {

                injector.require(["GUIAPP/content/viewmodels/NumericEntryViewModel"], () => {
                    const vm = new Wincor.UI.Content.NumericEntryViewModel();

                    vm.numberKeysSuspended(false);
                    spyOn(vm.cmdRepos, "setActive");
                    vm.observe("flexMain");
                    vm.numberField("1234");
                    expect(vm.cmdRepos.setActive).not.toHaveBeenCalled();
                    done();
                }, done.fail);
            });

            it("deactivate number keys because max length has been reached", (done) => {

                injector.require(["GUIAPP/content/viewmodels/NumericEntryViewModel"], () => {
                    const vm = new Wincor.UI.Content.NumericEntryViewModel();

                    vm.numberKeysSuspended(false);
                    spyOn(vm.cmdRepos, "setActive");
                    vm.observe("flexMain");
                    vm.numberField("123456789012345678");
                    expect(vm.cmdRepos.setActive).toHaveBeenCalledWith(["0","1","2","3","4","5","6","7","8","9"], false);
                    done();
                }, done.fail);
            });

            it("re-activate number keys because input has been cleared", (done) => {

                injector.require(["GUIAPP/content/viewmodels/NumericEntryViewModel"], () => {
                    const vm = new Wincor.UI.Content.NumericEntryViewModel();

                    vm.numberKeysSuspended(true);
                    spyOn(vm.cmdRepos, "setActive");
                    vm.observe("flexMain");
                    vm.numberField("");
                    expect(vm.cmdRepos.setActive).toHaveBeenCalledWith(["0","1","2","3","4","5","6","7","8","9"]);
                    done();
                }, done.fail);
            });

        });

    });
});

