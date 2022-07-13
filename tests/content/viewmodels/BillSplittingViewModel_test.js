/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ BillSplittingViewModel_test.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

define(['lib/Squire'], function(Squire) {

    let injector;
    let ko;
    let Wincor;
    let jQuery;

    describe("BillSplittingViewModel", () => {

        beforeEach(done => {
            injector = new Squire();
            injector.require(["NamespaceMock"], bundle => {
                Wincor = window.Wincor = bundle.createWincor();
                ko = Wincor.ko = window.ko = bundle.ko;
                jQuery = window.jQuery = bundle.jQuery;
    
                this.denomData_1 = {
                    "amount": "180000",
                    "currency": "EUR",
                    "symbol": "€",
                    "ada": "Euro",
                    "exponent": "-2",
                    "maxnotes": 60,
                    "maxcoins": 50,
                    "maxamount": 180000,
                    "denominations": [
                        {
                            "type": 0,
                            "count": 150,
                            "val": 500,
                            "softLimit": 0
                        },
                        {
                            "type": 0,
                            "count": 150,
                            "val": 1000,
                            "softLimit": 0
                        },
                        {
                            "type": 0,
                            "count": 20,
                            "val": 2000,
                            "softLimit": 0
                        },
                        {
                            "type": 0,
                            "count": 20,
                            "val": 5000,
                            "softLimit": 0
                        },
                        {
                            "type": 0,
                            "count": 20,
                            "val": 10000,
                            "softLimit": 0
                        },
                        {
                            "type": 0,
                            "count": 20,
                            "val": 20000,
                            "softLimit": 0
                        }
                    ]
                };
                
                Wincor.UI.Content.BaseViewModel = class BaseViewModel extends Wincor.UI.Content.BaseViewModel {
                    constructor() {
                        super();
                    }
                    observe() {}
                    onInitTextAndData() {}
                    onDeactivated() {}
                };
                
                injector
                    .mock("jquery", jQuery)
                    .mock("extensions", bundle.ext)
                    .mock("knockout", ko)
                    .mock("basevm", Wincor.UI.Content.BaseViewModel)
                    .mock("ui-content", Wincor.UI.Content)
                    .mock("vm-util/ViewModelHelper", {
                        convertByExponent: jasmine.createSpy("convertByExponent")
                    })
                    .mock("vm-util/Calculations", {
                        ALGO_MODE: {
                            FREE: "FREE"
                        },
                        ALGO_EVALUATORS: {
                            BIG_ITEMS: "BIG_ITEMS"
                        }
                    })
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
            it("calls super for all necessary overridden functions", async() => {
                await injector.require(["GUIAPP/content/viewmodels/BillSplittingViewModel"]);
                
                spyOn(Wincor.UI.Content.BaseViewModel.prototype, "observe").and.callThrough();
                spyOn(Wincor.UI.Content.BaseViewModel.prototype, "onInitTextAndData").and.callThrough();
                spyOn(Wincor.UI.Content.BaseViewModel.prototype, "onDeactivated").and.callThrough();
                
                const vm = new Wincor.UI.Content.BillSplittingViewModel();
                spyOn(vm, "initItemData"); // this sometimes not working
                let fakePromise_2 = {
                    then: () => {
                        return {catch: () => {}};
                    }
                };
                let fakePromise = Promise.resolve(fakePromise_2);
                spyOn(fakePromise, "then").and.returnValue(fakePromise_2); // prevent from calling the org then callback
                spyOn(vm, "importBusinessData").and.returnValue(fakePromise);
                vm.observe("flexMain");
                expect(Wincor.UI.Content.BaseViewModel.prototype.observe).toHaveBeenCalledTimes(1);
                vm.onInitTextAndData({dataKeys:[], textKeys:[]});
                expect(Wincor.UI.Content.BaseViewModel.prototype.onInitTextAndData).toHaveBeenCalledTimes(1);
                vm.onDeactivated();
                expect(Wincor.UI.Content.BaseViewModel.prototype.onDeactivated).toHaveBeenCalledTimes(1);
            });
        });

        describe("object creation", () => {
            it("can create transaction instance", async() => {
                await injector.require(["GUIAPP/content/viewmodels/BillSplittingViewModel"]);
                const vm = new Wincor.UI.Content.BillSplittingViewModel();
                let txn = vm.createDenominationItemInstance();
                expect(txn.constructor.name).toEqual("DenominationItem");
            });
        });
    
        describe("general checks", () => {
            it("checks buildResult", async() => {
                await injector.require(["GUIAPP/content/viewmodels/BillSplittingViewModel"]);
                const vm = new Wincor.UI.Content.BillSplittingViewModel();
                vm.denominationInfo = {
                    len: this.denomData_1.denominations.length,
                    srcData: this.denomData_1,
                    currentDist: [0, 3, 0, 1, 1, 0]
                };
                let result = vm.buildResult();
                expect(typeof result === "string").toBe(true);
                result = JSON.parse(result);
                expect(result.amount === "180000").toBe(true);
                expect(result.denominations.length === 6).toBe(true);
                expect(result.denominations[0].count === 0).toBe(true); // 500
                expect(result.denominations[1].count === 3).toBe(true); // 1000
                expect(result.denominations[2].count === 0).toBe(true); // 2000
                expect(result.denominations[3].count === 1).toBe(true); // 5000
                expect(result.denominations[4].count === 1).toBe(true); // 10000
                expect(result.denominations[5].count === 0).toBe(true); // 20000
                // check session storage
                let dispDist = JSON.parse(sessionStorage.getItem("dispenseDistribution"));
                sessionStorage.removeItem("dispenseDistribution");
                expect(dispDist.denominations.length === 3).toBe(true);
                expect(dispDist.denominations[0].count.length === 3).toBe(true);
                expect(dispDist.denominations[0].val === 1000).toBe(true);
                expect(dispDist.denominations[1].count.length === 1).toBe(true);
                expect(dispDist.denominations[1].val === 5000).toBe(true);
                expect(dispDist.denominations[2].count.length === 1).toBe(true);
                expect(dispDist.denominations[2].val === 10000).toBe(true);
            });
        });
    });
});

