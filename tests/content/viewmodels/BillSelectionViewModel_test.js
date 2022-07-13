/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ BillSelectionViewModel_test.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

define(['lib/Squire'], function(Squire) {

    let injector;
    let ko;
    let Wincor;
    let jQuery;

    describe("BillSelectionViewModel", () => {

        beforeEach(done => {
            injector = new Squire();
            injector.require(["NamespaceMock"], bundle => {
                Wincor = window.Wincor = bundle.createWincor();
                ko = Wincor.ko = window.ko = bundle.ko;
                jQuery = window.jQuery = bundle.jQuery;
                
                this.denomData_1 = {
                    "amount": "50000",
                    "currency": "EUR",
                    "symbol": "€",
                    "ada": "Euro",
                    "exponent": "-2",
                    "maxnotes": 60,
                    "maxcoins": 50,
                    "maxamount": 50000,
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
            it("calls super for all necessary overridden functions", async() => {
                await injector.require(["GUIAPP/content/viewmodels/BillSelectionViewModel"]);
                
                spyOn(Wincor.UI.Content.BaseViewModel.prototype, "observe").and.callThrough();
                spyOn(Wincor.UI.Content.BaseViewModel.prototype, "onInitTextAndData").and.callThrough();
                spyOn(Wincor.UI.Content.BaseViewModel.prototype, "onDeactivated").and.callThrough();
                
                const vm = new Wincor.UI.Content.BillSelectionViewModel();
                spyOn(vm, "initItemData"); // this sometimes not working
                let fakePromise = Promise.resolve();
                spyOn(fakePromise, "then"); // prevent from calling the org then callback
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
                await injector.require(["GUIAPP/content/viewmodels/BillSelectionViewModel"]);
                const vm = new Wincor.UI.Content.BillSelectionViewModel();
                let txn = vm.createDenominationItemInstance();
                expect(txn.constructor.name).toEqual("DenominationItem");
            });
        });

        describe("creates a denom item", () => {
            it("and check dec state", async() => {
                await injector.require(["GUIAPP/content/viewmodels/BillSelectionViewModel"]);
                const vm = new Wincor.UI.Content.BillSelectionViewModel();
                let item = vm.createDenominationItemInstance(500, 0, "€", "EUR", 0, -2);
                expect(item.decState()).toBe(2);
            });

            it("and check inc state", async() => {
                await injector.require(["GUIAPP/content/viewmodels/BillSelectionViewModel"]);
                const vm = new Wincor.UI.Content.BillSelectionViewModel();
                let item = vm.createDenominationItemInstance(500, 0, "€", "EUR", 0, -2);
                expect(item.incState()).toBe(0);
            });
            
            it("and check dec state on update count", async() => {
                await injector.require(["GUIAPP/content/viewmodels/BillSelectionViewModel"]);
                const vm = new Wincor.UI.Content.BillSelectionViewModel();
                let item = vm.createDenominationItemInstance(500, 0, "€", "EUR", 0, -2);
                item.count(1);
                expect(item.decState()).toBe(0);
                item.count(0);
                expect(item.decState()).toBe(2);
            });

            it("and set dec state on count > 0", async() => {
                await injector.require(["GUIAPP/content/viewmodels/BillSelectionViewModel"]);
                const vm = new Wincor.UI.Content.BillSelectionViewModel();
                let item = vm.createDenominationItemInstance(500, 0, "€", "EUR", 0, -2);
                item.count(1);
                item.setDecState(0);
                expect(item.decState()).toBe(0);
                item.setDecState(1);
                expect(item.decState()).toBe(1);
                item.setDecState(2);
                expect(item.decState()).toBe(0);
                item.setDecState(5);
                expect(item.decState()).toBe(2);
                expect(item.setDecState()).toBe(2);
            });

            it("and write dec state disabled on count > 0", async() => {
                await injector.require(["GUIAPP/content/viewmodels/BillSelectionViewModel"]);
                const vm = new Wincor.UI.Content.BillSelectionViewModel();
                let item = vm.createDenominationItemInstance(500, 0, "€", "EUR", 0, -2);
                item.count(1);
                expect(item.setDecState()).toBe(2); // default
                expect(item.decState()).toBe(0);
                item.decState(2); // set to disabled
                expect(item.decState()).toBe(2); // first read
                expect(item.decState()).toBe(0); // second read delivers enabled because the dec state has been set back from 5 to 2 and count is > 0
                expect(item.setDecState()).toBe(2);
            });

            it("and write dec state enabled on count > 0", async() => {
                await injector.require(["GUIAPP/content/viewmodels/BillSelectionViewModel"]);
                const vm = new Wincor.UI.Content.BillSelectionViewModel();
                let item = vm.createDenominationItemInstance(500, 0, "€", "EUR", 0, -2);
                item.count(1);
                expect(item.setDecState()).toBe(2); // default
                expect(item.decState()).toBe(0);
                item.decState(0); // set to enabled
                expect(item.decState()).toBe(0); // first read
                expect(item.decState()).toBe(0); // second read - same result
                expect(item.setDecState()).toBe(0);
            });

            it("and toggle write dec state enabled/disabled/enabled on count > 0", async() => {
                await injector.require(["GUIAPP/content/viewmodels/BillSelectionViewModel"]);
                const vm = new Wincor.UI.Content.BillSelectionViewModel();
                let item = vm.createDenominationItemInstance(500, 0, "€", "EUR", 0, -2);
                item.count(1);
                expect(item.setDecState()).toBe(2); // default
                expect(item.decState()).toBe(0);
                // enabled
                item.decState(0); // set to enabled
                expect(item.decState()).toBe(0); // first read
                expect(item.decState()).toBe(0); // second read - same result
                expect(item.setDecState()).toBe(0);
                // disabled
                item.decState(2); // set to disabled
                expect(item.decState()).toBe(2); // first read
                expect(item.decState()).toBe(0); // second read delivers enabled because the dec state has been set back from 5 to 2 and count is > 0
                expect(item.setDecState()).toBe(2);
                // enabled
                item.decState(0); // set to enabled
                expect(item.decState()).toBe(0); // first read
                expect(item.decState()).toBe(0); // second read - same result
                expect(item.setDecState()).toBe(0);
            });

            it("and toggle write dec state enabled/disabled/enabled on count = 0", async() => {
                await injector.require(["GUIAPP/content/viewmodels/BillSelectionViewModel"]);
                const vm = new Wincor.UI.Content.BillSelectionViewModel();
                let item = vm.createDenominationItemInstance(500, 0, "€", "EUR", 0, -2);
                item.count(0);
                expect(item.setDecState()).toBe(2); // default
                expect(item.decState()).toBe(2);
                // enabled
                item.decState(0); // set to enabled
                expect(item.setDecState()).toBe(0); // write sets to 0
                expect(item.decState()).toBe(2); // first read
                expect(item.decState()).toBe(2); // second read - same result
                expect(item.setDecState()).toBe(0);
                // disabled
                item.decState(2); // set to disabled
                expect(item.setDecState()).toBe(5); // write sets to NONE
                expect(item.decState()).toBe(2); // first read
                expect(item.decState()).toBe(2); // second read delivers disabled because the dec state has been set back from 5 to 2 and count is = 0
                expect(item.setDecState()).toBe(2);
                // enabled
                item.decState(0); // set to enabled
                expect(item.setDecState()).toBe(0); // write sets to 0
                expect(item.decState()).toBe(2); // first read
                expect(item.decState()).toBe(2); // second read - same result
                expect(item.setDecState()).toBe(0);
            });
            
            it("and write dec state disabled on count = 0", async() => {
                await injector.require(["GUIAPP/content/viewmodels/BillSelectionViewModel"]);
                const vm = new Wincor.UI.Content.BillSelectionViewModel();
                let item = vm.createDenominationItemInstance(500, 0, "€", "EUR", 0, -2);
                item.count(0);
                expect(item.setDecState()).toBe(2); // default
                expect(item.decState()).toBe(2);
                item.decState(2); // set to disabled
                expect(item.decState()).toBe(2); // first read
                expect(item.decState()).toBe(2); // second read delivers disabled because the dec state has been set back from 5 to 2, but count is < 1
                expect(item.setDecState()).toBe(2);
            });
            
            it("and set dec state on count = 0", async() => {
                await injector.require(["GUIAPP/content/viewmodels/BillSelectionViewModel"]);
                const vm = new Wincor.UI.Content.BillSelectionViewModel();
                let item = vm.createDenominationItemInstance(500, 0, "€", "EUR", 0, -2);
                item.count(0);
                expect(item.setDecState()).toBe(2); // default
                item.setDecState(0);
                expect(item.decState()).toBe(2);
                item.setDecState(1);
                expect(item.decState()).toBe(2);
                item.setDecState(2);
                expect(item.decState()).toBe(2);
                item.setDecState(5);
                expect(item.decState()).toBe(2);
                expect(item.setDecState()).toBe(2);
            });
            
        });
        
        describe("general checks", () => {
            it("checks buildResult", async() => {
                await injector.require(["GUIAPP/content/viewmodels/BillSelectionViewModel"]);
                const vm = new Wincor.UI.Content.BillSelectionViewModel();
                vm.denominationInfo = {
                    srcData: this.denomData_1,
                    totalAmount: 180000
                };
                vm.items = [
                    {
                        count: ko.observable(3),
                        value: 1000
                    },
                    {
                        count: ko.observable(1),
                        value: 5000
                    },
                    {
                        count: ko.observable(1),
                        value: 10000
                    },
                ];
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

