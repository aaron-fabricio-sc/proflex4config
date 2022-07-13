/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ DepositChequesResultViewModel_test.js 4.3.1-210219-21-a53025e6-1a04bc7d

*/

define(['lib/Squire'], function(Squire) {

    let injector;
    let ko;
    let Wincor;
    let jQuery;

    describe("DepositChequesResultViewModel", () => {

        let _module = {};

        beforeEach(done => {
            injector = new Squire();
            injector.require(["NamespaceMock"], bundle => {
                Wincor = window.Wincor = bundle.createWincor();
                ko = Wincor.ko = window.ko = bundle.ko;
                jQuery = window.jQuery = bundle.jQuery;

                this.listData = {};

                this.chequesResultData_1 = {
                    "minAmount": 0,
                    "maxAmount": 250000,
                    "cheques": [
                        {
                            "amount": 10000,
                            "scoreOCR": true,
                            "scoreMICR": true,
                            "isAccepted": false,
                            "frontImagePath": "style/default/images/single_cheque_generic_long_side.svg",
                            "backImagePath": "style/default/images/01b.jpg"
                        }
                    ]
                };

                this.chequesResultData_2 = {
                    "minAmount": 0,
                    "maxAmount": 250000,
                    "cheques": [
                        {
                            "amount": 10000,
                            "scoreOCR": true,
                            "scoreMICR": true,
                            "isAccepted": false,
                            "frontImagePath": "style/default/images/single_cheque_generic_long_side.svg",
                            "backImagePath": "style/default/images/01b.jpg"
                        },
                        {
                            "amount": 1000,
                            "scoreOCR": true,
                            "scoreMICR": true,
                            "isAccepted": false,
                            "frontImagePath": "style/default/images/single_cheque_generic_long_side1.svg",
                            "backImagePath": "style/default/images/01b.jpg"
                        }
                    ]
                };

                this.chequesResultData_3 = {
                    "minAmount": 0,
                    "maxAmount": 250000,
                    "cheques": [
                        {
                            "amount": 10000,
                            "scoreOCR": true,
                            "scoreMICR": true,
                            "isAccepted": false,
                            "frontImagePath": "style/default/images/single_cheque_generic_long_side.svg",
                            "backImagePath": "style/default/images/01b.jpg"
                        },
                        {
                            "amount": 1000,
                            "scoreOCR": true,
                            "scoreMICR": true,
                            "isAccepted": false,
                            "frontImagePath": "style/default/images/single_cheque_generic_long_side1.svg",
                            "backImagePath": "style/default/images/01b.jpg"
                        },
                        {
                            "amount": 50000,
                            "scoreOCR": true,
                            "scoreMICR": true,
                            "isAccepted": false,
                            "frontImagePath": "style/default/images/single_cheque_generic_long_side2.svg",
                            "backImagePath": "style/default/images/01b.jpg"
                        }
                    ]
                };

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
                    visibleLimits = {max: 0};
                    onButtonPressed(id) {}
                }
                
                injector
                    .mock("flexuimapping", {
                        buildGuiKey: () => { //dummy
                        },
                        getGenericListData: () => {
                            return Promise.resolve(
                                this.listData
                            );

                        }
                    })
                    .mock("ui-content", {
                        designMode: Wincor.UI.Content.designMode
                    })
                    .mock("vm-container", Wincor.UI.Content.ViewModelContainer)
                    .mock("vm-util/UICommanding", Wincor.UI.Content.Commanding)
                    .mock("vm/ListViewModel", Wincor.UI.Content.ListViewModel)
                    .mock("jquery", jQuery)
                    .mock("extensions", bundle.ext)
                    .mock("knockout", ko)
                    .mock("config/Config", {viewType: "softkey"});
                done();
            });
        });

        afterEach(() => {
            injector.remove();
        });

        // ---- DepositChequesResult ----

        describe("initialization", () => {
            it("initializes members", done => {
                injector.require(["GUIAPP/content/viewmodels/DepositChequesResultViewModel"], () => {
                    const vm = new Wincor.UI.Content.DepositChequesResultViewModel(_module);

                    expect(typeof vm.maxChequeNo).toBe("function");
                    expect(vm.maxChequeNo()).toBe(0);
                    expect(typeof vm.totalAmount).toBe("function");
                    expect(vm.currentIdx).toBe(0);
                    expect(vm.currentPresentIdx).toBe(0);

                    done();
                }, done.fail);
            });
        });

        describe("object creation", () => {
            it("can create ChequeItem instance", async() => {
                await injector.require(["GUIAPP/content/viewmodels/DepositChequesResultViewModel"]);
                const vm = new Wincor.UI.Content.DepositChequesResultViewModel(_module);
                let txn = vm.createChequeItemInstance(1);
                expect(txn.constructor.name).toEqual("ChequeItem");
            });
        });

        describe("convenience function", () => {
            it("can updateTotals", async() => {
                await injector.require(["GUIAPP/content/viewmodels/DepositChequesResultViewModel"]);
                const vm = new Wincor.UI.Content.DepositChequesResultViewModel(_module);
                expect(vm.updateTotal.bind(vm)).not.toThrow();
            });
        });
        
        describe("cheque start index", () => {
            it("property is not set", async() => {
                await injector.require(["GUIAPP/content/viewmodels/DepositChequesResultViewModel"]);
                const vm = new Wincor.UI.Content.DepositChequesResultViewModel(_module);
                const RESULT = {
                    "PROP_MEDIA_ON_STACKER": "1"
                };
                spyOn(Wincor.UI.Service.Provider.DataService, "getValues").and.returnValue(Promise.resolve(RESULT));
                await vm.importBusinessData();
                expect(vm.transactionData.startIndex).toBe(0);
                expect(vm.transactionData.mediaCount).toBe(1);
            });

            it("property is set", async() => {
                await injector.require(["GUIAPP/content/viewmodels/DepositChequesResultViewModel"]);
                const vm = new Wincor.UI.Content.DepositChequesResultViewModel(_module);
                const RESULT = {
                    "PROP_MEDIA_ON_STACKER": "2",
                    "PROP_CHEQUE_START_INDEX": "1" // means we have a credit slip at index 0
                };
                spyOn(Wincor.UI.Service.Provider.DataService, "getValues").and.returnValue(Promise.resolve(RESULT));
                await vm.importBusinessData();
                expect(vm.transactionData.startIndex).toBe(1);
                expect(vm.transactionData.mediaCount).toBe(1); // means we have a credit slip at index 0 and 1 cheque at index 1, so the cheque count is only 1
            });

            it("property is empty string", async() => {
                await injector.require(["GUIAPP/content/viewmodels/DepositChequesResultViewModel"]);
                const vm = new Wincor.UI.Content.DepositChequesResultViewModel(_module);
                const RESULT = {
                    "PROP_MEDIA_ON_STACKER": "1",
                    "PROP_CHEQUE_START_INDEX": "" // means we have a credit slip at index 0
                };
                spyOn(Wincor.UI.Service.Provider.DataService, "getValues").and.returnValue(Promise.resolve(RESULT));
                await vm.importBusinessData();
                expect(vm.transactionData.startIndex).toBe(0);
                expect(vm.transactionData.mediaCount).toBe(1); // means we have a credit slip at index 0 and 1 cheque at index 1, so the cheque count is only 1
            });
            
            it("property is null", async() => {
                await injector.require(["GUIAPP/content/viewmodels/DepositChequesResultViewModel"]);
                const vm = new Wincor.UI.Content.DepositChequesResultViewModel(_module);
                const RESULT = {
                    "PROP_MEDIA_ON_STACKER": "1",
                    "PROP_CHEQUE_START_INDEX": null // means we have a credit slip at index 0
                };
                spyOn(Wincor.UI.Service.Provider.DataService, "getValues").and.returnValue(Promise.resolve(RESULT));
                await vm.importBusinessData();
                expect(vm.transactionData.startIndex).toBe(0);
                expect(vm.transactionData.mediaCount).toBe(1); // means we have a credit slip at index 0 and 1 cheque at index 1, so the cheque count is only 1
            });

            it("property is undefined", async() => {
                await injector.require(["GUIAPP/content/viewmodels/DepositChequesResultViewModel"]);
                const vm = new Wincor.UI.Content.DepositChequesResultViewModel(_module);
                const RESULT = {
                    "PROP_MEDIA_ON_STACKER": "1",
                    "PROP_CHEQUE_START_INDEX": void 0 // means we have a credit slip at index 0
                };
                spyOn(Wincor.UI.Service.Provider.DataService, "getValues").and.returnValue(Promise.resolve(RESULT));
                await vm.importBusinessData();
                expect(vm.transactionData.startIndex).toBe(0);
                expect(vm.transactionData.mediaCount).toBe(1); // means we have a credit slip at index 0 and 1 cheque at index 1, so the cheque count is only 1
            });
            
            it("property is set, but no cheques, which is unusual", async() => {
                await injector.require(["GUIAPP/content/viewmodels/DepositChequesResultViewModel"]);
                const vm = new Wincor.UI.Content.DepositChequesResultViewModel(_module);
                const RESULT = {
                    "PROP_MEDIA_ON_STACKER": "1",
                    "PROP_CHEQUE_START_INDEX": "1" // means we have a credit slip at index 0, only
                };
                spyOn(Wincor.UI.Service.Provider.DataService, "getValues").and.returnValue(Promise.resolve(RESULT));
                await vm.importBusinessData();
                expect(vm.transactionData.startIndex).toBe(1);
                expect(vm.transactionData.mediaCount).toBe(0); // means we have a credit slip at index 0 and 0 cheques
            });
            
            it("is > 0", async() => {
                await injector.require(["GUIAPP/content/viewmodels/DepositChequesResultViewModel"]);
                const vm = new Wincor.UI.Content.DepositChequesResultViewModel(_module);
                spyOn(vm, "updateCommandStates");
                vm.transactionData.startIndex = 1;
                vm.transactionData.mediaCount = 1;
                vm.buildProperties();
                const RESULT = {
                    "PROP_CHEQUE_AMOUNT[1]": "1000",
                    "PROP_CHEQUE_ACCEPTED[1]": "false",
                    "PROP_CHEQUE_SCORE_OCR[1]": "true"
                };
                vm.initItemData(RESULT);
                expect(vm.transactionData.chequeItems[0].amount()).toBe(1000);
                expect(vm.transactionData.chequeItems[0].isAccepted()).toBe(false);
                expect(vm.transactionData.chequeItems[0].scoreOCR).toBe(true);
                expect(vm.transactionData.chequeItems[0].docType()).toBe("Cheque");
            });
        });
        
        describe("initItemData", () => {
            it("empty argument", async() => {
                await injector.require(["GUIAPP/content/viewmodels/DepositChequesResultViewModel"]);
                const vm = new Wincor.UI.Content.DepositChequesResultViewModel(_module);
                spyOn(vm, "updateCommandStates");
                vm.transactionData.mediaCount = 1;
                const RESULT = {
                };
                spyOn(Wincor.UI.Service.Provider.LogProvider, "error");
                vm.initItemData(RESULT);
                expect(Wincor.UI.Service.Provider.LogProvider.error).toHaveBeenCalled();
            });

            it("undefined argument", async() => {
                await injector.require(["GUIAPP/content/viewmodels/DepositChequesResultViewModel"]);
                const vm = new Wincor.UI.Content.DepositChequesResultViewModel(_module);
                spyOn(vm, "updateCommandStates");
                vm.transactionData.mediaCount = 1;
                spyOn(Wincor.UI.Service.Provider.LogProvider, "error");
                vm.initItemData(void 0);
                expect(Wincor.UI.Service.Provider.LogProvider.error).toHaveBeenCalled();
            });
            
            it("expected item count mismatch", async() => {
                await injector.require(["GUIAPP/content/viewmodels/DepositChequesResultViewModel"]);
                const vm = new Wincor.UI.Content.DepositChequesResultViewModel(_module);
                spyOn(vm, "updateCommandStates");
                vm.transactionData.mediaCount = 1;
                vm.transactionData.chequeItems = [];
                const RESULT = {
                    "PROP_CHEQUE_AMOUNT[1]": "1000"
                };
                spyOn(Wincor.UI.Service.Provider.LogProvider, "error");
                vm.initItemData(RESULT);
                expect(Wincor.UI.Service.Provider.LogProvider.error).toHaveBeenCalled();
            });
        });
        
        describe("cheque document type", () => {
            it("check property is not set at a higher level", async() => {
                await injector.require(["GUIAPP/content/viewmodels/DepositChequesResultViewModel"]);
                const vm = new Wincor.UI.Content.DepositChequesResultViewModel(_module);
                spyOn(vm, "updateCommandStates");
                vm.transactionData.mediaCount = 1;
                vm.buildProperties();
                const RESULT = {
                    "PROP_CHEQUE_AMOUNT[0]": "1000",
                    "PROP_CHEQUE_ACCEPTED[0]": "false",
                    "PROP_CHEQUE_SCORE_OCR[0]": "true"
                };
                vm.initItemData(RESULT);
                expect(vm.transactionData.chequeItems[0].docType()).toBe("Cheque");
            });
            
            it("is CreditSlip and thus can't accept, decline or change amount", async() => {
                await injector.require(["GUIAPP/content/viewmodels/DepositChequesResultViewModel"]);
                const vm = new Wincor.UI.Content.DepositChequesResultViewModel(_module);
                spyOn(vm, "updateCommandStates");
                vm.transactionData.mediaCount = 2;
                vm.buildProperties();
                const RESULT = {
                    "PROP_CHEQUE_AMOUNT[0]": "1000",
                    "PROP_CHEQUE_ACCEPTED[0]": "false",
                    "PROP_CHEQUE_SCORE_OCR[0]": "true",
                    "PROP_CHEQUE_AMOUNT[1]": "1001",
                    "PROP_CHEQUE_ACCEPTED[1]": "false",
                    "PROP_CHEQUE_SCORE_OCR[1]": "true",
                    "PROP_CHEQUE_DOCUMENT_TYPE[0]": "CreditSlip",
                    "PROP_CHEQUE_DOCUMENT_TYPE[1]": "Cheque"
                };
                vm.initItemData(RESULT);
                expect(vm.transactionData.chequeItems[0].isAcceptEnabled()).toBe(2);
                expect(vm.transactionData.chequeItems[0].isDeclineEnabled()).toBe(2);
                expect(vm.transactionData.chequeItems[0].isChgAmountEnabled()).toBe(2);
                // a cheque type must be different:
                expect(vm.transactionData.chequeItems[1].isAcceptEnabled()).toBe(0);
                expect(vm.transactionData.chequeItems[1].isDeclineEnabled()).toBe(2);
                expect(vm.transactionData.chequeItems[1].isChgAmountEnabled()).toBe(0);
            });
        });
    
        describe("onButtonPressed", () => {
            it("index argument - invalid", async() => {
                await injector.require(["GUIAPP/content/viewmodels/DepositChequesResultViewModel"]);
                const vm = new Wincor.UI.Content.DepositChequesResultViewModel(_module);
                const CURRENT_IDX = 4711;
                vm.currentIdx = CURRENT_IDX;
                this.currentPresentIdx = CURRENT_IDX;
                vm.onButtonPressed("", null);
                expect(vm.currentIdx).toBe(CURRENT_IDX);
                expect(vm.currentPresentIdx).toBe(CURRENT_IDX);
                vm.onButtonPressed("", void 0);
                expect(vm.currentIdx).toBe(CURRENT_IDX);
                expect(vm.currentPresentIdx).toBe(CURRENT_IDX);
                vm.onButtonPressed("", "");
                expect(vm.currentIdx).toBe(CURRENT_IDX);
                expect(vm.currentPresentIdx).toBe(CURRENT_IDX);
                vm.onButtonPressed("", "WHAT_EVER");
                expect(vm.currentIdx).toBe(CURRENT_IDX);
                expect(vm.currentPresentIdx).toBe(CURRENT_IDX);
            });
            
            it("index argument - valid", async() => {
                await injector.require(["GUIAPP/content/viewmodels/DepositChequesResultViewModel"]);
                const vm = new Wincor.UI.Content.DepositChequesResultViewModel(_module);
                vm.currentIdx = 4711;
                vm.onButtonPressed("", "2");
                expect(vm.currentIdx).toBe(2);
                expect(vm.currentPresentIdx).toBe(2);
                vm.onButtonPressed("", 3);
                expect(vm.currentIdx).toBe(3);
                expect(vm.currentPresentIdx).toBe(3);
                vm.onButtonPressed("", "0");
                expect(vm.currentIdx).toBe(0);
                expect(vm.currentPresentIdx).toBe(0);
                vm.onButtonPressed("", 0);
                expect(vm.currentIdx).toBe(0);
                expect(vm.currentPresentIdx).toBe(0);
                vm.onButtonPressed("", -1);
                expect(vm.currentIdx).toBe(-1);
                expect(vm.currentPresentIdx).toBe(-1);
            });
        });
    });
});

