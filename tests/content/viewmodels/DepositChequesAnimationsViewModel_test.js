/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ DepositChequesAnimationsViewModel_test.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

define(['lib/Squire'], function(Squire) {

    let injector;
    let ko;
    let Wincor;
    let jQuery;

    describe("DepositChequesAnimationsViewModel", () => {

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
            it("initializes members and check currency/symbol", done => {
                injector.require(["GUIAPP/content/viewmodels/DepositChequesAnimationsViewModel"], () => {
                    const vm = new Wincor.UI.Content.DepositChequesAnimationsViewModel();
                    expect(vm.currency).toBe("");
                    expect(vm.symbol).toBe("");
                    done();
                }, done.fail);
            });
    
            it("checks onInitTextAndData currency/symbol", done => {
                injector.require(["GUIAPP/content/viewmodels/DepositChequesAnimationsViewModel"], () => {
                    
                    spyOn(Wincor.UI.Content.AnimationsViewModel.prototype, "onInitTextAndData").and.callThrough();
                    
                    const vm = new Wincor.UI.Content.DepositChequesAnimationsViewModel();
                    const dataKeys = [];
                    const textKeys = [];
                    vm.bankingContext = Wincor.createMockObject("currencyData.iso");
                    vm.bankingContext.currencyData.iso = "USD";
                    vm.bankingContext.currencyData.symbol = "$";
                    vm.onInitTextAndData({dataKeys: dataKeys, textKeys: textKeys});
                    expect(vm.currency).toBe("USD");
                    expect(vm.symbol).toBe("$");
                    expect(Wincor.UI.Content.AnimationsViewModel.prototype.onInitTextAndData).toHaveBeenCalledWith({dataKeys: dataKeys, textKeys: textKeys});
                    dataKeys[0].then(() => {
                        expect(vm.maxItems()).toBe("PROP_REMAINING_MEDIA_ON_STACKER");
                        done();
                    });
                }, done.fail);
            });
        });
    
        describe("destruction", () => {
            it("checks onDeactivated after onInitTextAndData for currency/symbol", done => {
                injector.require(["GUIAPP/content/viewmodels/DepositChequesAnimationsViewModel"], () => {
                    const vm = new Wincor.UI.Content.DepositChequesAnimationsViewModel();
                    const dataKeys = [];
                    const textKeys = [];
                    vm.bankingContext = Wincor.createMockObject("currencyData.iso");
                    vm.bankingContext.currencyData.iso = "USD";
                    vm.bankingContext.currencyData.symbol = "$";
                    vm.onInitTextAndData({dataKeys: dataKeys, textKeys: textKeys});
                    vm.onDeactivated();
                    expect(vm.currency).toBe("");
                    expect(vm.symbol).toBe("");
                    done();
                }, done.fail);
            });
        });
    });
});

