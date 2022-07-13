/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ ChipTransactionsViewModel_test.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

define(['lib/Squire'], function(Squire) {

    let injector;
    let ko;
    let Wincor;
    let jQuery;

    describe("ChipTransactionsViewModel", () => {

        beforeEach(done => {
            injector = new Squire();
            injector.require(["NamespaceMock"], bundle => {
                Wincor = window.Wincor = bundle.createWincor();
                ko = Wincor.ko = window.ko = bundle.ko;
                jQuery = window.jQuery = bundle.jQuery;
                
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
                    
                    visibleLimits = {max: 0};
                    viewHelper = {
                        getActiveModule: () => {
                            return {
                                onEditItemData: () => {
                                }
                            };
                        }
                    }
                }
                
                injector
                    .mock("jquery", jQuery)
                    .mock("extensions", bundle.ext)
                    .mock("knockout", ko)
                    .mock("vm/ListViewModel", Wincor.UI.Content.ListViewModel)
                    .mock("flexuimapping", {
                        buildGuiKey: c=>c
                    })
                    .mock("vm-container", Wincor.UI.Content.ViewModelContainer);
                done();
            });
        });

        afterEach(() => {
            injector.remove();
        });

        describe("initialization", () => {
            it("calls super for all necessary overridden functions", async () => {
                await injector.require(["GUIAPP/content/viewmodels/ChipTransactionsViewModel"]);

                spyOn(Wincor.UI.Content.ListViewModel.prototype, "observe").and.callThrough();
                spyOn(Wincor.UI.Content.ListViewModel.prototype, "onInitTextAndData").and.callThrough();
                spyOn(Wincor.UI.Content.ListViewModel.prototype, "onDeactivated").and.callThrough();
                
                const vm = new Wincor.UI.Content.ChipTransactionsViewModel();
                vm.observe("flexMain");
                expect(Wincor.UI.Content.ListViewModel.prototype.observe).toHaveBeenCalledTimes(1);
                spyOn(vm, "initItemData");
                let fakePromise = Promise.resolve();
                spyOn(fakePromise, "then"); // prevent from calling the org then callback
                spyOn(vm, "importBusinessData").and.returnValue(fakePromise);
                
                vm.onInitTextAndData({dataKeys:[], textKeys:[]});
                expect(Wincor.UI.Content.ListViewModel.prototype.onInitTextAndData).toHaveBeenCalledTimes(1);
                vm.onDeactivated();
                expect(Wincor.UI.Content.ListViewModel.prototype.onDeactivated).toHaveBeenCalledTimes(1);
            });
        });

        describe("object creation", () => {
            it("can create transaction instance", async () => {
                await injector.require(["GUIAPP/content/viewmodels/ChipTransactionsViewModel"]);
                const vm = new Wincor.UI.Content.ChipTransactionsViewModel();
                let txn = vm.createTransactionInstance();
                expect(txn.constructor.name).toEqual("Transaction");
            });

            it("can create ChipData instance", async () => {
                await injector.require(["GUIAPP/content/viewmodels/ChipTransactionsViewModel"]);
                const vm = new Wincor.UI.Content.ChipTransactionsViewModel();
                let txn = vm.createChipDataInstance();
                expect(txn.constructor.name).toEqual("ChipData");
            });
        });

        describe("data conversion", () => {
            it("allows access to transactions variable", async () => {
                const EXPECTED = [{
                    "transDate": "val1",
                    "transTime": "val2",
                    "transSign": "val3",
                    "transAmount": "val4",
                    "transNewBalance": "val5",
                    "transState": "val6"
                }];

                spyOn(Wincor.UI.Service.Provider.DataService, "getValues").and.callFake(keys => {
                    return {
                        [keys[0]]: Object.values(EXPECTED[0])
                    }
                });
                await injector.require(["GUIAPP/content/viewmodels/ChipTransactionsViewModel"]);

                const vm = new Wincor.UI.Content.ChipTransactionsViewModel();
                try {
                    await vm.importBusinessData();
                } catch(e) {
                    //pass... we just wanted txns to have been initialized
                }
                expect(vm.chipTransactionsValues.transactions).toEqual(EXPECTED);
            });

            it("imports business logic chip-transaction data into internal structure", async () => {
                const EXPECTED = [{
                    "transDate": "val1",
                    "transTime": "val2",
                    "transSign": "val3",
                    "transAmount": "val4",
                    "transNewBalance": "val5",
                    "transState": "val6"
                }];

                spyOn(Wincor.UI.Service.Provider.DataService, "getValues").and.callFake(keys => {
                    return {
                        [keys[0]]: Object.values(EXPECTED[0])
                    };
                });
                await injector.require(["GUIAPP/content/viewmodels/ChipTransactionsViewModel"]);
                const vm = new Wincor.UI.Content.ChipTransactionsViewModel();
                spyOn(vm, "initItemData");

                let data = await vm.importBusinessData();
                expect(vm.initItemData).toHaveBeenCalledTimes(0);
                expect([data.transactions[0]]).toEqual(EXPECTED)
            });
        });
    });
});

