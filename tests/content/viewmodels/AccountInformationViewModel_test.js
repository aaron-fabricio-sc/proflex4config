/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ AccountInformationViewModel_test.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

define(['lib/Squire'], function(Squire) {

    let injector;
    let ko;
    let Wincor;
    let jQuery;

    describe("AccountInformationViewModel", () => {

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
                    .mock("flexuimapping", {buildGuiKey: () => { //dummy
                    }})
                    .mock("ui-content", {
                        designMode: Wincor.UI.Content.designMode
                    })
                    .mock("jquery", jQuery)
                    .mock("extensions", bundle.ext)
                    .mock("knockout", ko)
                    .mock("vm-container", Wincor.UI.Content.ViewModelContainer)
                    .mock("vm/ListViewModel", Wincor.UI.Content.ListViewModel)
                    .mock("vm-util/UICommanding", Wincor.UI.Content.Commanding);
                done();
            });
        });

        afterEach(() => {
            injector.remove();
        });

        describe("initialization", () => {
            it("super is called for all necessary overridden functions", (done) => {
                injector.require(["GUIAPP/content/viewmodels/AccountInformationViewModel"], () => {
                    
                    spyOn(Wincor.UI.Content.ListViewModel.prototype, "observe").and.callThrough();
                    spyOn(Wincor.UI.Content.ListViewModel.prototype, "onInitTextAndData").and.callThrough();
                    spyOn(Wincor.UI.Content.ListViewModel.prototype, "onDeactivated").and.callThrough();
                    
                    const vm = new Wincor.UI.Content.AccountInformationViewModel();
                    // prepare required stuff and check
                    vm.viewConfig = {};
                    vm.observe("flexMain");
                    expect(Wincor.UI.Content.ListViewModel.prototype.observe).toHaveBeenCalledTimes(1);
                    vm.setListLen = jasmine.createSpy("setListLen");
                    vm.setListSource = jasmine.createSpy("setListSource");
                    vm.initScrollbar = jasmine.createSpy("initScrollbar");
                    vm.dataList = {items: jasmine.createSpy("dataList::items")};
                    vm.initCurrentVisibleLimits = jasmine.createSpy("initCurrentVisibleLimits");
                    
                    vm.onInitTextAndData({dataKeys:[], textKeys:[]});
                    expect(Wincor.UI.Content.ListViewModel.prototype.onInitTextAndData).toHaveBeenCalledTimes(1);
                    vm.onDeactivated();
                    expect(Wincor.UI.Content.ListViewModel.prototype.onDeactivated).toHaveBeenCalledTimes(1);
                    done();
                }, done.fail);
            });
        });

        describe("general functionality", () => {
            it("handles scrolling itself", (done) => {
                injector.require(["GUIAPP/content/viewmodels/AccountInformationViewModel"], () => {
                    
                    spyOn(Wincor.UI.Content.ListViewModel.prototype, "onButtonPressed").and.callThrough();
                    
                    const vm = new Wincor.UI.Content.AccountInformationViewModel();
                    vm.handleScrolling = jasmine.createSpy("handleScrolling");
                    // confirm calls super
                    vm.onButtonPressed("CONFIRM");
                    expect(vm.handleScrolling).not.toHaveBeenCalled();
                    expect(Wincor.UI.Content.ListViewModel.prototype.onButtonPressed).toHaveBeenCalledTimes(1);
                    
                    Wincor.UI.Content.ListViewModel.prototype.onButtonPressed.calls.reset();

                    vm.onButtonPressed("BTN_SCROLL_DOWN");
                    expect(vm.handleScrolling).toHaveBeenCalledTimes(1);
                    expect(Wincor.UI.Content.ListViewModel.prototype.onButtonPressed).not.toHaveBeenCalled();

                    vm.onButtonPressed("BTN_SCROLL_UP");
                    expect(vm.handleScrolling).toHaveBeenCalledTimes(2);
                    expect(Wincor.UI.Content.ListViewModel.prototype.onButtonPressed).not.toHaveBeenCalled();

                    done();
                }, done.fail);
            });
        });

        describe("table type data conversion", () => {
            beforeEach(() => {
                this.AIN_VALUES = {
                    account: {
                        number: "47110815",
                        holder: "Max Power",
                        balanceCurrency: "EUR",
                        balanceValue: "1234567",
                        balanceType: "H",
                        unknown: "yes"
                    },
                    transactions: [{
                        "expirationDate": "35/06/20",
                        "effectiveDate": "25/06/20",
                        "currency": "BTC",
                        "amount": "1500",
                        "balanceType": "S",
                        "description1": "Desc1",
                        "description2": "Desc2",
                        "description3": "Desc3",
                        "description4": "Desc4"
                    },{
                        "expirationDate": "34/06/20",
                        "effectiveDate": "24/06/20",
                        "currency": "ETH",
                        "amount": "10000",
                        "balanceType": "S",
                        "description1": "Desc1",
                        "description2": "Desc2",
                        "description3": "Desc3",
                        "description4": "Desc4"
                    }]
                };
            });

            it("can create Account instances", async () => {
                await injector.require(["GUIAPP/content/viewmodels/AccountInformationViewModel"]);
                const vm = new Wincor.UI.Content.AccountInformationViewModel();
                let account = vm.createAccountInstance();
                expect(account).toBeDefined();
                expect(account.constructor.name).toBe("Account");
            });

            it("can create AccountData instances", async () => {
                await injector.require(["GUIAPP/content/viewmodels/AccountInformationViewModel"]);
                const vm = new Wincor.UI.Content.AccountInformationViewModel();
                let account = vm.createAccountDataInstance();
                expect(account).toBeDefined();
                expect(account.constructor.name).toBe("AccountData");
            });

            it("can create Transaction instances", async () => {
                await injector.require(["GUIAPP/content/viewmodels/AccountInformationViewModel"]);
                const vm = new Wincor.UI.Content.AccountInformationViewModel();
                let account = vm.createTransactionInstance();
                expect(account).toBeDefined();
                expect(account.constructor.name).toBe("Transaction");
            });

            it("can create PceTransaction instances", async () => {
                await injector.require(["GUIAPP/content/viewmodels/AccountInformationViewModel"]);
                const vm = new Wincor.UI.Content.AccountInformationViewModel();
                let account = vm.createPceTransactionInstance();
                expect(account).toBeDefined();
                expect(account.constructor.name).toBe("TransactionPceBal");
            });

            it("uses appropriate conversions", async () => {
                await injector.require(["GUIAPP/content/viewmodels/AccountInformationViewModel"]);
                const vm = new Wincor.UI.Content.AccountInformationViewModel();
                const AIN_VALUES = {
                    account: {},
                    transactions: []
                };
                vm.setListLen = jasmine.createSpy("setListLen");
                vm.setListSource = jasmine.createSpy("setListSource");
                vm.initScrollbar = jasmine.createSpy("initScrollbar");
                vm.dataList = {items: jasmine.createSpy("dataList::items")};
                vm.initCurrentVisibleLimits = jasmine.createSpy("initCurrentVisibleLimits");

                spyOn(vm, "convertTransactions").and.callThrough();
                spyOn(vm, "convertTransactionsForStd");
                spyOn(vm, "convertTransactionsForIFX");
                spyOn(vm, "convertTransactionsForVTMMov");
                spyOn(vm, "convertTransactionsForVTMBal");

                // assume std type is STD
                vm.initItemData(AIN_VALUES);
                expect(vm.convertTransactionsForStd).toHaveBeenCalledTimes(1);

                // set ifx
                vm.tableType(vm.TABLE_TYPE.IFX);
                vm.initItemData(AIN_VALUES);
                expect(vm.convertTransactionsForStd).toHaveBeenCalledTimes(1);
                expect(vm.convertTransactionsForIFX).toHaveBeenCalledTimes(1);

                // set VTMMov
                vm.tableType(vm.TABLE_TYPE.VTM_MOV);
                vm.initItemData(AIN_VALUES);
                expect(vm.convertTransactionsForStd).toHaveBeenCalledTimes(1);
                expect(vm.convertTransactionsForIFX).toHaveBeenCalledTimes(1);
                expect(vm.convertTransactionsForVTMMov).toHaveBeenCalledTimes(1);

                // set VTMMov
                vm.tableType(vm.TABLE_TYPE.VTM_BAL);
                vm.initItemData(AIN_VALUES);
                expect(vm.convertTransactionsForStd).toHaveBeenCalledTimes(1);
                expect(vm.convertTransactionsForIFX).toHaveBeenCalledTimes(1);
                expect(vm.convertTransactionsForVTMMov).toHaveBeenCalledTimes(1);
                expect(vm.convertTransactionsForVTMBal).toHaveBeenCalledTimes(1);

                // check if all specific converters have been called via dispatcher function
                expect(vm.convertTransactions).toHaveBeenCalledTimes(4);
            });

            it("converts to table type Std and VTMMov", async () => {
                await injector.require(["GUIAPP/content/viewmodels/AccountInformationViewModel"]);
                // both types are prepared the same, so we check both with same expectations
                ["AINStd", "AINPcemov"].forEach((tableType) => {
                    const vm = new Wincor.UI.Content.AccountInformationViewModel();
                    // set current table type
                    vm.tableType(tableType);
                    const itemsRaw = [];
                    const accDataInstance = vm.createAccountDataInstance();
                    switch (tableType) {
                        case vm.TABLE_TYPE.STD:
                            vm.convertTransactionsForStd(this.AIN_VALUES, accDataInstance, itemsRaw, 8);
                            break;
                        case vm.TABLE_TYPE.VTM_MOV:
                            vm.convertTransactionsForVTMMov(this.AIN_VALUES, accDataInstance, itemsRaw, 8);
                            break;
                    }
                    Object.keys(this.AIN_VALUES.account)
                        .filter(id=>id!=="unknown")
                        .forEach(accAttribute => {
                            expect(accDataInstance.account[accAttribute]).toEqual(this.AIN_VALUES.account[accAttribute]);
                        });
                    // check if only known attributes are transferred
                    expect("unknown" in accDataInstance.account).toBe(false);

                    // check transactions attributes
                    expect(accDataInstance.transactions.length).toBe(2);
                    accDataInstance.transactions.forEach((txn, txnNo) => {
                        Object.keys(this.AIN_VALUES.transactions[txnNo])
                            .forEach(txnAttribute => {
                                expect(txn[txnAttribute]).toEqual(this.AIN_VALUES.transactions[txnNo][txnAttribute]);
                            });
                    });
                });
            });

            it("converts to table type IFX", async () => {
                await injector.require(["GUIAPP/content/viewmodels/AccountInformationViewModel"]);
                const vm = new Wincor.UI.Content.AccountInformationViewModel();
                vm.tableType(vm.TABLE_TYPE.IFX);
                const itemsRaw = [];
                const accDataInstance = vm.createAccountDataInstance();

                vm.convertTransactionsForIFX(this.AIN_VALUES, accDataInstance, itemsRaw, 8);
                expect(accDataInstance.transactions.length).toBe(2);
                Object.keys(this.AIN_VALUES.account)
                    .filter(id=>id!=="unknown")
                    .forEach(accAttribute => {
                        expect(accDataInstance.account[accAttribute]).toEqual(this.AIN_VALUES.account[accAttribute]);
                    });
                // check if only known attributes are transferred
                expect("unknown" in accDataInstance.account).toBe(false);

                // check transactions attributes
                expect(accDataInstance.transactions.length).toBe(2);
                accDataInstance.transactions.forEach((txn, txnNo) => {
                    Object.keys(this.AIN_VALUES.transactions[txnNo])
                        .filter(i => !["description2", "description3", "description4"].includes(i))
                        .forEach(txnAttribute => {
                            expect(txn[txnAttribute]).toEqual(this.AIN_VALUES.transactions[txnNo][txnAttribute]);
                        });
                    // IFX does not include description2-4
                    expect(txn.description1).toEqual(this.AIN_VALUES.transactions[txnNo].description1);
                    expect(txn.description2).not.toBeDefined();
                    expect(txn.description3).not.toBeDefined();
                    expect(txn.description4).not.toBeDefined();
                });
            });

            it("converts to table type VTM_BAL", async () => {
                // VTM has other source data structure, so override it
                this.AIN_VALUES = {
                    account: {
                        number: "47110815",
                        holder: "Max Power",
                        balanceCurrency: "EUR",
                        balanceValue: "1234567",
                        balanceType: "H",
                        unknown: "yes"
                    },
                    transactions: [{
                        accountType: "Debit",
                        accountNumber: "132453678",
                        accountBalanceCurrency: "EUR",
                        accountBalanceAmount: "1200",
                        accountBalanceSign: "+",
                        accountBalance: "1234",
                        availableAmountCurrency: "EUR",
                        availableAmountAmount: "1000",
                        availableAmount: "1111"
                    }, {
                        accountType: "Credit",
                        accountNumber: "132453672",
                        accountBalanceCurrency: "EUR",
                        accountBalanceAmount: "1201",
                        accountBalanceSign: "+",
                        accountBalance: "1231",
                        availableAmountCurrency: "EUR",
                        availableAmountAmount: "1001",
                        availableAmount: "1112"
                    }]
                };

                await injector.require(["GUIAPP/content/viewmodels/AccountInformationViewModel"]);
                const vm = new Wincor.UI.Content.AccountInformationViewModel();
                vm.tableType(vm.TABLE_TYPE.VTM_BAL);
                const itemsRaw = [];
                const accDataInstance = vm.createAccountDataInstance();

                vm.convertTransactionsForVTMBal(this.AIN_VALUES, accDataInstance, itemsRaw, 8);
                expect(accDataInstance.transactions.length).toBe(2);

                // check transactions attributes
                expect(accDataInstance.transactions.length).toBe(2);
                accDataInstance.transactions.forEach((txn, txnNo) => {

                    expect(Object.keys(txn).length).toBe(9);
                    // VTM_Bal does not include descriptions
                    Object.keys(this.AIN_VALUES.transactions[txnNo])
                        .forEach(txnAttribute => {
                            expect(txn[txnAttribute]).toEqual(this.AIN_VALUES.transactions[txnNo][txnAttribute]);
                        });
                    expect(txn.description1).not.toBeDefined();
                    expect(txn.description2).not.toBeDefined();
                    expect(txn.description3).not.toBeDefined();
                    expect(txn.description4).not.toBeDefined();
                });
            });
        });

        // I think DOM tests should not be done here... This would be more an e2e approach...
        // jasmine.getFixtures().fixturesPath = 'base/content/views/';
        //
        // describe("DOM tests", () => {
        //     beforeEach((done) => {
        //         injector = new Squire();
        // Wincor.UI.Content.ListViewModel = class ListViewModel extends Wincor.UI.Content.BaseViewModel {
        //     constructor() {
        //         super();
        //     }
        //     setListLen() {
        //     };
        //     setListSource() {};
        //     dataList = {
        //         items: ko.observableArray([])
        //     };
        //     initScrollbar() {
        //     };
        //     initCurrentVisibleLimits() {
        //     };
        //
        //     observe() {}
        //     onInitTextAndData() {}
        //     onDeactivated() {}
        //     onButtonPressed() {}
        //
        //     visibleLimits = {max: 0};
        //     viewHelper = {
        //         getActiveModule: () => {
        //             return {
        //                 onEditItemData: () => {
        //                 }
        //             };
        //         }
        //     }
        // }
        //         injector
        //             //.mock("content/viewmodels/base/ViewModelContainer", container)
        //             .mock("flexuimapping", {buildGuiKey: () => { //dummy
        //             }})
        //             .mock("ui-content", {
        //                 designMode: Wincor.UI.Content.designMode
        //             })
        //             .mock("vm-container", Wincor.UI.Content.ViewModelContainer)
        //             .mock("vm/ListViewModel", Wincor.UI.Content.ListViewModel)
        //             .mock("vm-util/UICommanding", Wincor.UI.Content.Commanding);
        //
        //         injector.require(["GUIAPP/content/viewmodels/AccountInformationViewModel"], (AccountInformationViewModel) => {
        //             this.vm = new Wincor.UI.Content.AccountInformationViewModel();
        //             loadFixtures('accountinformation.html');
        //             this.domElement = $('#flexMain')[0];
        //             done();
        //         }, done.fail);
        //     });
        //
        //     afterEach(() => {
        //         ko.cleanNode(this.domElement);
        //         injector.remove();
        //     });
        //
        //     //TODO: Create tests
        //     it("has created commands", () => {
        //         expect(this.domElement).toBeDefined();
        //         expect(this.domElement).toBeInDOM();
        //         spyOn(Wincor.UI.Content.Commanding, "createCommand").and.callThrough();
        //
        //         // before applying bindings, we need to prepare some test data
        //         this.vm.dataList = {};
        //         expect(ko.applyBindings.bind(null, this.vm, this.domElement)).not.toThrow();
        //         expect(Wincor.UI.Content.Commanding.createCommand).toHaveBeenCalled()
        //     });
        //
        //     it("has flexMain", () => {
        //         expect(this.domElement).toBeDefined();
        //         expect(this.domElement).toBeInDOM();
        //         spyOn(Wincor.UI.Content.Commanding, "createCommand").and.callThrough();
        //         expect(ko.applyBindings.bind(null, this.vm, this.domElement)).not.toThrow();
        //         expect(Wincor.UI.Content.Commanding.createCommand).toHaveBeenCalled()
        //     });
        //
        // });
    });

});

