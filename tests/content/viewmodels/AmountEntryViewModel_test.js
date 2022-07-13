/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ AmountEntryViewModel_test.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

define(['lib/Squire'], function(Squire) {

    let injector;
    let ko;
    let Wincor;
    let jQuery;

    describe("AmountEntryViewModel", () => {

        beforeEach(done => {
            injector = new Squire();
            injector.require(["NamespaceMock"], bundle => {
                Wincor = window.Wincor = bundle.createWincor();
                ko = Wincor.ko = window.ko = bundle.ko;
                jQuery = window.jQuery = bundle.jQuery;

                const container = Object.assign(Wincor.UI.Content.ViewModelContainer, {
                    // now we construct the following: viewModelHelper.startTimer=() => {return {onTimeout: () => {}}}, this allowas the VM to call fx chains like:
                    // container.viewModelHelper.startTimer(1000).onTimeout(this.checkMessages.bind(this));
                    viewModelHelper: Wincor.createMockObject("startTimer.onTimeout", {}, true)
                });
                
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
                    .mock("vm-container", container)
                    .mock("ui-content", Wincor.UI.Content)
                    .mock("basevm", Wincor.UI.Content.BaseViewModel);
                done();
            });
        });

        afterEach(() => {
            injector.remove();
        });

        describe("general", () => {
            it("super is called for all necessary overridden functions", (done) => {
                injector.require(["GUIAPP/content/viewmodels/AmountEntryViewModel"], () => {
                    const vm = new Wincor.UI.Content.AmountEntryViewModel();

                    spyOn(Wincor.UI.Content.BaseViewModel.prototype, "observe").and.callThrough();
                    spyOn(Wincor.UI.Content.BaseViewModel.prototype, "onInitTextAndData").and.callThrough();
                    spyOn(Wincor.UI.Content.BaseViewModel.prototype, "onDeactivated").and.callThrough();

                    spyOn(vm, "isMultipleOf").and.returnValue(true);
                    spyOn(vm, "isWithinMinMax").and.returnValue(true);

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


        describe("do not deactivate number keys due to input length", () => {

            it("do not deactivate number keys because max length has not been reached", (done) => {

                injector.require(["GUIAPP/content/viewmodels/AmountEntryViewModel"], () => {
                    const vm = new Wincor.UI.Content.AmountEntryViewModel();

                    const _configHelperDefault = {
                        checkMax: true, //flag is true if configured min/max values are okay (for convenience reasons)
                        maxLen: 5, //calculated number of digits of maxAmount is given
                        cmdMixtureState: 3 // remember state of the "MIXTURE" command (usually billsplitting)
                    };

                    spyOn(vm, "isMultipleOf").and.returnValue(true);
                    spyOn(vm, "isWithinMinMax").and.returnValue(true);
                    vm.observe("flexMain");

                    vm.configHelper = Object.assign({}, _configHelperDefault);
                    vm.numberKeysSuspended(false);
                    spyOn(vm.cmdRepos, "setActive");
                    spyOn(vm, "isAmountValid").and.returnValue(true);
                    vm.amountField("1234");
                    expect(vm.cmdRepos.setActive).not.toHaveBeenCalled();
                    done();
                }, done.fail);
            });

            it("deactivate number keys because max length has been reached", (done) => {

                injector.require(["GUIAPP/content/viewmodels/AmountEntryViewModel"], () => {
                    const vm = new Wincor.UI.Content.AmountEntryViewModel();

                    const _configHelperDefault = {
                        checkMax: true, //flag is true if configured min/max values are okay (for convenience reasons)
                        maxLen: 5, //calculated number of digits of maxAmount is given
                        cmdMixtureState: 3 // remember state of the "MIXTURE" command (usually billsplitting)
                    };

                    spyOn(vm, "isMultipleOf").and.returnValue(true);
                    spyOn(vm, "isWithinMinMax").and.returnValue(true);
                    vm.observe("flexMain");

                    vm.configHelper = Object.assign({}, _configHelperDefault);
                    vm.numberKeysSuspended(false);
                    spyOn(vm.cmdRepos, "setActive");
                    spyOn(vm, "isAmountValid").and.returnValue(false);
                    vm.amountField("51234");
                    expect(vm.cmdRepos.setActive).toHaveBeenCalledWith(["0","1","2","3","4","5","6","7","8","9"], false);
                    done();
                }, done.fail);
            });

            it("re-activate number keys because input has been cleared", (done) => {

                injector.require(["GUIAPP/content/viewmodels/AmountEntryViewModel"], () => {
                    const vm = new Wincor.UI.Content.AmountEntryViewModel();

                    const _configHelperDefault = {
                        checkMax: true, //flag is true if configured min/max values are okay (for convenience reasons)
                        maxLen: 5, //calculated number of digits of maxAmount is given
                        cmdMixtureState: 3 // remember state of the "MIXTURE" command (usually billsplitting)
                    };

                    spyOn(vm, "isMultipleOf").and.returnValue(true);
                    spyOn(vm, "isWithinMinMax").and.returnValue(true);
                    vm.observe("flexMain");

                    vm.configHelper = Object.assign({}, _configHelperDefault);
                    vm.numberKeysSuspended(true);
                    spyOn(vm.cmdRepos, "setActive");
                    spyOn(vm, "isAmountValid").and.returnValue(true);
                    vm.amountField("1234");
                    expect(vm.cmdRepos.setActive).toHaveBeenCalledWith(["0","1","2","3","4","5","6","7","8","9"]);
                    done();

                }, done.fail);
            });

        });

    });
});

