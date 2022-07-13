/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ DepositResultViewModel_test.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

define(['lib/Squire'], function(Squire) {

    let injector;
    let ko;
    let Wincor;
    let jQuery;

    describe("DepositResultViewModel", () => {

        beforeEach(done => {
            injector = new Squire();
            injector.require(["NamespaceMock"], bundle => {
                Wincor = window.Wincor = bundle.createWincor();
                ko = Wincor.ko = window.ko = bundle.ko;
                jQuery = window.jQuery = bundle.jQuery;

                this.listData = {};

                this.depositData_0 = {
                    "PROP_DEPOSIT_RESULT": {
                        "totals": [
                        ],

                        "denominations": [
                        ]
                    },
                };

                this.depositData_1 = {
                    "PROP_DEPOSIT_RESULT": {
                        "totals": [
                            {"total": 206640, "L2": 5000, "L3": 0, "L4": 201640, "exp": -2, "currency": "EUR"}
                        ],

                        "denominations": [
                            {"value": 10000, "count": 17, "currency": "EUR", "exp": -2, "type": 0, "level": 4},
                            {"value": 20000, "count": 17, "currency": "EUR", "exp": -2, "type": 0, "level": 4},
                            {"value": 50000, "count": 1, "currency": "EUR", "exp": -2, "type": 0, "level": 4},
                            {
                                "value": 50000,
                                "count": 1,
                                "currency": "EUR",
                                "exp": -2,
                                "type": 0,
                                "level": 3
                            },
                            {"value": 5000, "count": 2, "currency": "EUR", "exp": -2, "type": 0, "level": 4},
                            {
                                "value": 5000,
                                "count": 3,
                                "currency": "EUR",
                                "exp": -2,
                                "type": 0,
                                "level": 3
                            },
                            {"value": 500, "count": 7, "currency": "EUR", "exp": -2, "type": 0, "level": 4},
                            {"value": 1000, "count": 7, "currency": "EUR", "exp": -2, "type": 0, "level": 4},
                            {"value": 2000, "count": 7, "currency": "EUR", "exp": -2, "type": 0, "level": 4},
                            {"value": 5000, "count": 1, "currency": "EUR", "exp": -2, "type": 0, "level": 2},
                            {"value": 1, "count": 40, "currency": "EUR", "exp": -2, "type": 1, "level": 4},
                            {"value": 100, "count": 8, "currency": "EUR", "exp": -2, "type": 1, "level": 4}
                        ]
                    },
                };

                this.depositData_2 = {
                    "PROP_DEPOSIT_RESULT": {
                        "totals": [
                            {"total": 206640, "L2": 5000, "L3": 0, "L4": 201640, "exp": -2, "currency": "EUR"},
                            {"total": 16000, "L2": 10000, "L3": 0, "L4": 16000, "exp": -2, "currency": "USD"}
                        ],

                        "denominations": [
                            {"value": 1000, "count": 3, "currency": "USD", "exp": -2, "type": 0, "level": 3},
                            {"value": 10000, "count": 1, "currency": "EUR", "exp": -2, "type": 0, "level": 4},
                            {
                                "value": 10000,
                                "count": 1,
                                "currency": "USD",
                                "exp": -2,
                                "type": 0,
                                "level": 3
                            },
                            {"value": 5000, "count": 2, "currency": "EUR", "exp": -2, "type": 0, "level": 4},
                            {
                                "value": 5000,
                                "count": 3,
                                "currency": "EUR",
                                "exp": -2,
                                "type": 0,
                                "level": 3
                            },
                            {"value": 500, "count": 7, "currency": "USD", "exp": -2, "type": 0, "level": 4},
                            {"value": 1000, "count": 7, "currency": "USD", "exp": -2, "type": 0, "level": 4},
                            {"value": 1000, "count": 5, "currency": "EUR", "exp": -2, "type": 0, "level": 4},
                            {"value": 5000, "count": 1, "currency": "EUR", "exp": -2, "type": 0, "level": 2}
                        ]
                    },
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
                }
                
                injector
                    .mock("jquery", jQuery)
                    .mock("extensions", bundle.ext)
                    .mock("knockout", ko)
                    .mock("ui-content", {
                        designMode: Wincor.UI.Content.designMode
                    })
                    .mock("vm-container", Wincor.UI.Content.ViewModelContainer)
                    .mock("vm-util/UICommanding", Wincor.UI.Content.Commanding)
                    .mock("vm-util/ViewModelHelper", {
                        "convertByExponent": () => {
                        }})
                    .mock("vm/ListViewModel", Wincor.UI.Content.ListViewModel)
                    .mock("config/Config", {viewType: "softkey"});

                done();
            });
        });

        afterEach(() => {
            injector.remove();
        });


        describe("item conversion", () => { // ---- DepositResult ----
            it("onInitTextAndData check listSource when source len=0", done => {
                injector.require(["GUIAPP/content/viewmodels/DepositResultViewModel"], module => {
                    Wincor.UI.Service.Provider.DataService.businessData = this.depositData_0;

                    const vm = new Wincor.UI.Content.DepositResultViewModel();
                    const dataKeys = [];
                    const textKeys = [];
                    let listSource;
                    // mock ListViewModel methods
                    vm.setListLen = len => {
                    };
                    vm.setListSource = src => listSource = src;
                    vm.dataList = {
                        items: ko.observableArray([])
                    };
                    vm.initScrollbar = () => {
                    };
                    vm.initCurrentVisibleLimits = () => {
                    };
                    vm.onInitTextAndData({dataKeys: dataKeys, textKeys: textKeys});
                    expect(textKeys.length).toBe(2);
                    expect(typeof textKeys[0]).toBe("string");
                    expect(textKeys[0]).toBe("GUI_TestViewKey_Message_L2");
                    expect(dataKeys.length).toBe(1);
                    expect(typeof dataKeys[0]).toBe("object");
                    dataKeys[0]
                        .then(() => {
                            expect(vm.isMixedCurrency()).toBe(false);
                            // -listSource is the final result after initItemData
                            expect(listSource.length).toBe(0);
                            done();
                        })
                        .catch(done.fail);
                }, done.fail);
            });

            it("onInitTextAndData check listSource", done => {
                injector.require(["GUIAPP/content/viewmodels/DepositResultViewModel"], module => {
                    Wincor.UI.Service.Provider.DataService.businessData = this.depositData_1;

                    const vm = new Wincor.UI.Content.DepositResultViewModel();
                    const dataKeys = [];
                    const textKeys = [];
                    let listSource;
                    // mock ListViewModel methods
                    vm.setListLen = len => {
                    };
                    vm.setListSource = src => listSource = src;
                    vm.dataList = {
                        items: ko.observableArray([])
                    };
                    vm.initScrollbar = () => {
                    };
                    vm.initCurrentVisibleLimits = () => {
                    };
                    vm.onInitTextAndData({dataKeys: dataKeys, textKeys: textKeys});
                    expect(textKeys.length).toBe(2);
                    expect(typeof textKeys[0]).toBe("string");
                    expect(textKeys[0]).toBe("GUI_TestViewKey_Message_L2");
                    expect(dataKeys.length).toBe(1);
                    expect(typeof dataKeys[0]).toBe("object");
                    dataKeys[0]
                        .then(() => {
                            expect(vm.isMixedCurrency()).toBe(false);

                            // -listSource is the final result after initItemData
                            expect(listSource.length).toBe(10);

                            expect(listSource[0].itemInfo.value).toBe(1); // 1 CENT
                            expect(listSource[0].count).toBe(40);
                            expect(listSource[0].itemInfo.level).toBe(4);
                            expect(listSource[0].sumAsInt).toBe(40);

                            expect(listSource[1].itemInfo.value).toBe(100); // 1 EUR
                            expect(listSource[1].count).toBe(8);
                            expect(listSource[1].itemInfo.level).toBe(4);
                            expect(listSource[1].sumAsInt).toBe(800);

                            expect(listSource[2].itemInfo.value).toBe(500); // 5 EUR
                            expect(listSource[2].count).toBe(7);
                            expect(listSource[2].itemInfo.level).toBe(4);
                            expect(listSource[2].sumAsInt).toBe(3500);

                            expect(listSource[3].itemInfo.value).toBe(1000); // 10 EUR
                            expect(listSource[3].count).toBe(7);
                            expect(listSource[3].itemInfo.level).toBe(4);
                            expect(listSource[3].sumAsInt).toBe(7000);

                            expect(listSource[4].itemInfo.value).toBe(2000); // 20 EUR
                            expect(listSource[4].count).toBe(7);
                            expect(listSource[4].itemInfo.level).toBe(4);
                            expect(listSource[4].sumAsInt).toBe(14000);

                            expect(listSource[5].itemInfo.value).toBe(5000); // 50 EUR (L3+L4)
                            expect(listSource[5].count).toBe(5);
                            expect(listSource[5].itemInfo.level).toBe(4);
                            expect(listSource[5].sumAsInt).toBe(25000);

                            expect(listSource[6].itemInfo.value).toBe(5000); // 50 EUR (L2)
                            expect(listSource[6].count).toBe(1);
                            expect(listSource[6].itemInfo.level).toBe(2);
                            expect(listSource[6].sumAsInt).toBe(5000);

                            expect(listSource[7].itemInfo.value).toBe(10000); // 100 EUR
                            expect(listSource[7].count).toBe(17);
                            expect(listSource[7].itemInfo.level).toBe(4);
                            expect(listSource[7].sumAsInt).toBe(170000);

                            expect(listSource[8].itemInfo.value).toBe(20000); // 200 EUR
                            expect(listSource[8].count).toBe(17);
                            expect(listSource[8].itemInfo.level).toBe(4);
                            expect(listSource[8].sumAsInt).toBe(340000);

                            expect(listSource[9].itemInfo.value).toBe(50000); // 500 EUR (L3+L4)
                            expect(listSource[9].count).toBe(2);
                            expect(listSource[9].itemInfo.level).toBe(4);
                            expect(listSource[9].sumAsInt).toBe(100000);

                            done();
                        })
                        .catch(done.fail);
                }, done.fail);
            });

            it("after onInitTextAndData check totals", done => {
                injector.require(["GUIAPP/content/viewmodels/DepositResultViewModel"], module => {
                    Wincor.UI.Service.Provider.DataService.businessData = this.depositData_1;

                    const vm = new Wincor.UI.Content.DepositResultViewModel();
                    const dataKeys = [];
                    const textKeys = [];
                    let listSource;
                    // mock ListViewModel methods
                    vm.setListLen = len => {
                    };
                    vm.setListSource = src => listSource = src;
                    vm.dataList = {
                        items: ko.observableArray([])
                    };
                    vm.initScrollbar = () => {
                    };
                    vm.initCurrentVisibleLimits = () => {
                    };
                    vm.onInitTextAndData({dataKeys: dataKeys, textKeys: textKeys});
                    expect(textKeys.length).toBe(2);
                    expect(typeof textKeys[0]).toBe("string");
                    expect(textKeys[0]).toBe("GUI_TestViewKey_Message_L2");
                    expect(dataKeys.length).toBe(1);
                    expect(typeof dataKeys[0]).toBe("object");
                    dataKeys[0]
                        .then(() => {
                            expect(vm.totalData().length).toBe(1);
                            expect(vm.totalData()[0].currency()).toBe("EUR");
                            expect(vm.totalData()[0].total()).toBe(206640);
                            done();
                        })
                        .catch(done.fail);
                }, done.fail);
            });

            it("check l2BoxValue member", done => {
                injector.require(["GUIAPP/content/viewmodels/DepositResultViewModel"], module => {
                    Wincor.UI.Service.Provider.DataService.businessData = this.depositData_1;

                    const vm = new Wincor.UI.Content.DepositResultViewModel();
                    const dataKeys = [];
                    const textKeys = [];
                    let listSource;
                    // mock ListViewModel methods
                    vm.setListLen = len => {
                    };
                    vm.setListSource = src => listSource = src;
                    vm.dataList = {
                        items: ko.observableArray([])
                    };
                    vm.initScrollbar = () => {
                    };
                    vm.initCurrentVisibleLimits = () => {
                    };
                    vm.onInitTextAndData({dataKeys: dataKeys, textKeys: textKeys});
                    dataKeys[0]
                        .then(() => {
                            expect(vm.l2BoxValue).toBe(5000);
                            done();
                        })
                        .catch(done.fail);
                }, done.fail);
            });

            it("onInitTextAndData: check listSource - multi currency", done => {
                injector.require(["GUIAPP/content/viewmodels/DepositResultViewModel"], module => {
                    Wincor.UI.Service.Provider.DataService.businessData = this.depositData_2;

                    const vm = new Wincor.UI.Content.DepositResultViewModel();
                    const dataKeys = [];
                    const textKeys = [];
                    let listSource;
                    // mock ListViewModel methods
                    vm.setListLen = len => {
                    };
                    vm.setListSource = src => listSource = src;
                    vm.dataList = {
                        items: ko.observableArray([])
                    };
                    vm.initScrollbar = () => {
                    };
                    vm.initCurrentVisibleLimits = () => {
                    };
                    vm.onInitTextAndData({dataKeys: dataKeys, textKeys: textKeys});
                    expect(textKeys.length).toBe(2);
                    expect(typeof textKeys[0]).toBe("string");
                    expect(textKeys[0]).toBe("GUI_TestViewKey_Message_L2");
                    expect(dataKeys.length).toBe(1);
                    expect(typeof dataKeys[0]).toBe("object");
                    dataKeys[0]
                        .then(() => {
                            expect(vm.isMixedCurrency()).toBe(true);

                            // -listSource is the final result after initItemData:
                            expect(listSource.length).toBe(7);

                            expect(listSource[0].itemInfo.value).toBe(1000); // 10 EUR
                            expect(listSource[0].itemInfo.currency).toBe("EUR");
                            expect(listSource[0].count).toBe(5);
                            expect(listSource[0].itemInfo.level).toBe(4);
                            expect(listSource[0].sumAsInt).toBe(5000);

                            expect(listSource[1].itemInfo.value).toBe(5000); // 50 EUR (L3+L4)
                            expect(listSource[1].itemInfo.currency).toBe("EUR");
                            expect(listSource[1].count).toBe(5);
                            expect(listSource[1].itemInfo.level).toBe(4);
                            expect(listSource[1].sumAsInt).toBe(25000);

                            expect(listSource[2].itemInfo.value).toBe(5000); // 50 EUR (L2)
                            expect(listSource[3].itemInfo.currency).toBe("EUR");
                            expect(listSource[2].count).toBe(1);
                            expect(listSource[2].itemInfo.level).toBe(2);
                            expect(listSource[2].sumAsInt).toBe(5000);

                            expect(listSource[3].itemInfo.value).toBe(10000); // 100 EUR
                            expect(listSource[3].itemInfo.currency).toBe("EUR");
                            expect(listSource[3].count).toBe(1);
                            expect(listSource[3].itemInfo.level).toBe(4);
                            expect(listSource[3].sumAsInt).toBe(10000);

                            expect(listSource[4].itemInfo.value).toBe(500); // 5 USD
                            expect(listSource[4].itemInfo.currency).toBe("USD");
                            expect(listSource[4].count).toBe(7);
                            expect(listSource[4].itemInfo.level).toBe(4);
                            expect(listSource[4].sumAsInt).toBe(3500);

                            expect(listSource[5].itemInfo.value).toBe(1000); // 10 USD (L3+L4)
                            expect(listSource[5].itemInfo.currency).toBe("USD");
                            expect(listSource[5].count).toBe(10);
                            expect(listSource[5].itemInfo.level).toBe(4);
                            expect(listSource[5].sumAsInt).toBe(10000);

                            expect(listSource[6].itemInfo.value).toBe(10000); // 100 USD (L3)
                            expect(listSource[6].itemInfo.currency).toBe("USD");
                            expect(listSource[6].count).toBe(1);
                            expect(listSource[6].itemInfo.level).toBe(3);
                            expect(listSource[6].sumAsInt).toBe(10000);

                            done();
                        })
                        .catch(done.fail);
                }, done.fail);
            });

            it("after onInitTextAndData check totals - multi currency", done => {
                injector.require(["GUIAPP/content/viewmodels/DepositResultViewModel"], module => {
                    Wincor.UI.Service.Provider.DataService.businessData = this.depositData_2;

                    const vm = new Wincor.UI.Content.DepositResultViewModel();
                    const dataKeys = [];
                    const textKeys = [];
                    let listSource;
                    // mock ListViewModel methods
                    vm.setListLen = len => {
                    };
                    vm.setListSource = src => listSource = src;
                    vm.dataList = {
                        items: ko.observableArray([])
                    };
                    vm.initScrollbar = () => {
                    };
                    vm.initCurrentVisibleLimits = () => {
                    };
                    vm.onInitTextAndData({dataKeys: dataKeys, textKeys: textKeys});
                    expect(textKeys.length).toBe(2);
                    expect(typeof textKeys[0]).toBe("string");
                    expect(textKeys[0]).toBe("GUI_TestViewKey_Message_L2");
                    expect(dataKeys.length).toBe(1);
                    expect(typeof dataKeys[0]).toBe("object");
                    dataKeys[0]
                        .then(() => {
                            expect(vm.totalData().length).toBe(2);
                            expect(vm.totalData()[0].currency()).toBe("EUR");
                            expect(vm.totalData()[0].total()).toBe(206640);
                            expect(vm.totalData()[1].currency()).toBe("USD");
                            expect(vm.totalData()[1].total()).toBe(16000);
                            done();
                        })
                        .catch(done.fail);
                }, done.fail);
            });
        });

        describe("object creation", () => {
            it("can create DenomItem instance", async () => {
                await injector.require(["GUIAPP/content/viewmodels/DepositResultViewModel"]);
                const vm = new Wincor.UI.Content.DepositResultViewModel();
                expect(vm.createDenomItemInstance().constructor.name).toEqual("DenomItem");
            });

            it("can create DenomData instance", async () => {
                await injector.require(["GUIAPP/content/viewmodels/DepositResultViewModel"]);
                const vm = new Wincor.UI.Content.DepositResultViewModel();
                expect(vm.createDenomDataInstance().constructor.name).toEqual("DenomData");
            });
        });
    });
});

