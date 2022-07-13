/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ EmvTransactionsViewModel_test.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

define(['lib/Squire'], function(Squire) {

    let injector;
    let ko;
    let Wincor;
    let jQuery;

    describe("EmvTransactionsViewModel", () => {

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
                        buildGuiKey: c => c
                    })
                    .mock("vm-container", Wincor.UI.Content.ViewModelContainer);
                done();
            });
        });

        afterEach(() => {
            injector.remove();
        });

        describe("initialization", () => {
            it("calls for all necessary overridden functions", async () => {
                await injector.require(["GUIAPP/content/viewmodels/EmvTransactionsViewModel"]);
                
                spyOn(Wincor.UI.Content.ListViewModel.prototype, "observe").and.callThrough();
                spyOn(Wincor.UI.Content.ListViewModel.prototype, "onInitTextAndData").and.callThrough();
                spyOn(Wincor.UI.Content.ListViewModel.prototype, "onDeactivated").and.callThrough();
                
                const vm = new Wincor.UI.Content.EmvTransactionsViewModel();
                vm.observe("flexMain");
                expect(Wincor.UI.Content.ListViewModel.prototype.observe).toHaveBeenCalledTimes(1);
                spyOn(vm, "initItemData"); // this sometimes not working
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
            it("can create transaction instance (STD)", async () => {
                await injector.require(["GUIAPP/content/viewmodels/EmvTransactionsViewModel"]);
                const vm = new Wincor.UI.Content.EmvTransactionsViewModel();
                vm.tableType(vm.TABLE_TYPE.STD);
                let txn = vm.createTransactionInstance();
                expect(txn.constructor.name).toEqual("Transaction");
            });

            it("can create transaction instance (ECASH)", async () => {
                await injector.require(["GUIAPP/content/viewmodels/EmvTransactionsViewModel"]);
                const vm = new Wincor.UI.Content.EmvTransactionsViewModel();
                vm.tableType(vm.TABLE_TYPE.ECASH);
                let txn = vm.createTransactionInstance();
                expect(txn.constructor.name).toEqual("TransactionECash");
            });

            it("can create ChipData instance", async () => {
                await injector.require(["GUIAPP/content/viewmodels/EmvTransactionsViewModel"]);
                const vm = new Wincor.UI.Content.EmvTransactionsViewModel();
                let txn = vm.createChipDataInstance();
                expect(txn.constructor.name).toEqual("ChipData");
            });
        });

        describe("data conversion", () => {
            it("allows access to transactions variable (STD table type)", async () => {
                const EXPECTED = [{
                    "transDate": "val1",
                    "transTime": "val21",
                    "transAmount": "val3",
                    "transRefAmount": "val4",
                    "transCountry": "val5",
                    "transCurrency": "val6",
                    "transType": "val7",
                    "transNumber": "val8",
                    "transPlace": "val9"
                }];

                spyOn(Wincor.UI.Service.Provider.DataService, "getValues").and.callFake(keys => {
                    return {
                        [keys[0]]: Object.values(EXPECTED[0])
                    };
                });
                await injector.require(["GUIAPP/content/viewmodels/EmvTransactionsViewModel"]);

                const vm = new Wincor.UI.Content.EmvTransactionsViewModel();

                try {
                    await vm.importBusinessData(vm.TABLE_TYPE.STD);
                } catch(e) {
                    //pass... we just wanted txns to have been initialized
                }
                expect(vm.transLogValues.transactions).toEqual(EXPECTED);
            });

            it("allows access to transactions variable (ECASH table type)", async () => {
                const EXPECTED = [{
                    "transDate": "val1",
                    "transTime": "val2",
                    "transCountry": "val3",
                    "transNumber": "val4",
                    "transPlace": "val5"
                }];

                spyOn(Wincor.UI.Service.Provider.DataService, "getValues").and.callFake(keys => {
                    return {
                        [keys[0]]: Object.values(EXPECTED[0])
                    };
                });
                await injector.require(["GUIAPP/content/viewmodels/EmvTransactionsViewModel"]);

                const vm = new Wincor.UI.Content.EmvTransactionsViewModel();
                try {
                    await vm.importBusinessData(vm.TABLE_TYPE.ECASH);
                } catch(e) {
                    //pass... we just wanted txns to have been initialized
                }
                expect(vm.transLogValues.transactions).toEqual(EXPECTED);
            });


            it("imports business logic EMV transaction data into internal structure (STD table type)", async () => {
                const EXPECTED = [{
                    "transDate": "val1",
                    "transTime": "val21",
                    "transAmount": "val3",
                    "transRefAmount": "val4",
                    "transCountry": "val5",
                    "transCurrency": "val6",
                    "transType": "val7",
                    "transNumber": "val8",
                    "transPlace": "val9"
                }];

                spyOn(Wincor.UI.Service.Provider.DataService, "getValues").and.callFake(keys => {
                    return {
                        [keys[0]]: Object.values(EXPECTED[0])
                    };
                });
                await injector.require(["GUIAPP/content/viewmodels/EmvTransactionsViewModel"]);
                const vm = new Wincor.UI.Content.EmvTransactionsViewModel();
                spyOn(vm, "initItemData");

                let data = await vm.importBusinessData(vm.TABLE_TYPE.STD);
                expect(vm.initItemData).toHaveBeenCalledTimes(0);
                expect([data.transactions[0]]).toEqual(EXPECTED)
            });


            it("imports business logic EMV transaction data into internal structure (ECASH table type)", async () => {
                const EXPECTED = [{
                    "transDate": "val1",
                    "transTime": "val2",
                    "transCountry": "val3",
                    "transNumber": "val4",
                    "transPlace": "val5"
                }];

                spyOn(Wincor.UI.Service.Provider.DataService, "getValues").and.callFake(keys => {
                    return {
                        [keys[0]]: Object.values(EXPECTED[0])
                    };
                });
                await injector.require(["GUIAPP/content/viewmodels/EmvTransactionsViewModel"]);
                const vm = new Wincor.UI.Content.EmvTransactionsViewModel();
                spyOn(vm, "initItemData");

                let data = await vm.importBusinessData(vm.TABLE_TYPE.ECASH);
                expect(vm.initItemData).toHaveBeenCalledTimes(0);
                expect([data.transactions[0]]).toEqual(EXPECTED)
            });
        });
    });
});

