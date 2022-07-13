/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ OutOfServiceViewModel_test.js 4.3.1-210701-21-172c70a5-1a04bc7d

*/

define(['lib/Squire'], function(Squire) {

    let injector;
    let ko;
    let Wincor;
    let jQuery;

    describe("OutOfServiceViewModel", () => {

        beforeEach(done => {
            injector = new Squire();
            injector.require(["NamespaceMock"], bundle => {
                Wincor = window.Wincor = bundle.createWincor();
                ko = Wincor.ko = window.ko = bundle.ko;
                jQuery = window.jQuery = bundle.jQuery;

                this.listData = {};

                this.atmData_1 = {
                    "PROP_ATM_LOCATION_STATE_INFOS": [
                        {
                            "atm": {
                                "name": "ATM 4all",
                                "primanota": "Primanota",
                                "timeZone": "TimeZone",
                                "remark": "Remark",
                                "addressData": {
                                    "street": "Heinz-Nixdorf-Ring",
                                    "streetNo": "1",
                                    "zipCode": "33106",
                                    "city": "Paderborn"
                                }
                            },
                            "distanceKm": "6.816344556643767885434",
                            "enabledTransactions": [
                                "WITHDRAWAL",
                                "DEPOSIT"
                            ],
                            "wkstState": "OPENCONSUMER"
                        },
                        {
                            "atm": {
                                "name": "ATM 4u",
                                "primanota": "Primanota",
                                "timeZone": "TimeZone",
                                "remark": "Remark",
                                "addressData": {
                                    "street": "Westernmauer",
                                    "streetNo": "10",
                                    "zipCode": "33098",
                                    "city": "Paderborn"
                                }
                            },
                            "distanceKm": 2.4,
                            "enabledTransactions": [
                                "WITHDRAWAL",
                                "DEPOSIT"
                            ],
                            "wkstState": "OPENCONSUMER"
                        },
                        {
                            "atm": {
                                "name": "ATM 24/7",
                                "primanota": "Primanota",
                                "timeZone": "TimeZone",
                                "remark": "Remark",
                                "addressData": {
                                    "street": "Ferdinandstrasse",
                                    "streetNo": "98a",
                                    "zipCode": "33098",
                                    "city": "Paderborn"
                                }
                            },
                            "distanceKm": 4.2,
                            "enabledTransactions": [
                                "WITHDRAWAL",
                                "DEPOSIT"
                            ],
                            "wkstState": "OPENCONSUMER"
                        },
                        {
                            "atm": {
                                "name": "ATM 2use",
                                "primanota": "Primanota",
                                "timeZone": "TimeZone",
                                "remark": "Remark",
                                "addressData": {
                                    "street": "Kassler Tor",
                                    "streetNo": "102",
                                    "zipCode": "33100",
                                    "city": "Paderborn"
                                }
                            },
                            "distanceKm": 5.7,
                            "enabledTransactions": [
                                "WITHDRAWAL",
                                "DEPOSIT"
                            ],
                            "wkstState": "CLOSEDCONSUMER"
                        },
                        {
                            "atm": {
                                "name": "ATM 4power",
                                "primanota": "Primanota",
                                "timeZone": "TimeZone",
                                "remark": "Remark",
                                "addressData": {
                                    "street": "Warburger Str.",
                                    "streetNo": "16b",
                                    "zipCode": "33100",
                                    "city": "Paderborn"
                                }
                            },
                            "distanceKm": 10.2,
                            "enabledTransactions": [
                                "WITHDRAWAL",
                                "DEPOSIT"
                            ],
                            "wkstState": "CLOSEDCONSUMER"
                        }
                    ]
                };

                this.atmData_2 = {
                    "PROP_ATM_LOCATION_STATE_INFOS": [
                        {
                            "atm": {
                                "name": "ATM 4all",
                                "primanota": "Primanota",
                                "timeZone": "TimeZone",
                                "remark": "Remark",
                                "addressData": {
                                    "street": "Heinz-Nixdorf-Ring",
                                    "streetNo": "1",
                                    "zipCode": "33106",
                                    "city": "Paderborn"
                                }
                            },
                            "distanceKm": "6.816344556643767885434",
                            "enabledTransactions": [
                                "WITHDRAWAL",
                                "DEPOSIT"
                            ],
                            "wkstState": "OPENCONSUMER"
                        },
                        {
                            "atm": {
                                "name": "ATM 4u",
                                "primanota": "Primanota",
                                "timeZone": "TimeZone",
                                "remark": "Remark",
                                "addressData": {
                                    "street": "Westernmauer",
                                    "streetNo": "10",
                                    "zipCode": "33098",
                                    "city": "Paderborn"
                                }
                            },
                            "distanceKm": "12.493838727126767474723872773",
                            "enabledTransactions": [
                                "WITHDRAWAL",
                                "DEPOSIT"
                            ],
                            "wkstState": "CLOSEDCONSUMER"
                        },
                        {
                            "atm": {
                                "name": "ATM 24/7",
                                "primanota": "Primanota",
                                "timeZone": "TimeZone",
                                "remark": "Remark",
                                "addressData": {
                                    "street": "Ferdinandstrasse",
                                    "streetNo": "98a",
                                    "zipCode": "33098",
                                    "city": "Paderborn"
                                }
                            },
                            "distanceKm": "4.2",
                            "enabledTransactions": [
                                "WITHDRAWAL",
                                "DEPOSIT"
                            ],
                            "wkstState": "OPENCONSUMER"
                        }
                    ]
                };
                
                // skip "atm" attribute
                this.atmData_3 = {
                    "PROP_ATM_LOCATION_STATE_INFOS": [
                        {
                            "name": "ATM 4all",
                            "primanota": "Primanota",
                            "timeZone": "TimeZone",
                            "remark": "Remark",
                            "addressData": {
                                "street": "Heinz-Nixdorf-Ring",
                                "streetNo": "1",
                                "zipCode": "33106",
                                "city": "Paderborn"
                            },
                            "distanceKm": "6.816344556643767885434",
                            "enabledTransactions": [
                                "WITHDRAWAL",
                                "DEPOSIT"
                            ],
                            "wkstState": "OPENCONSUMER"
                        },
                        {
                            "name": "ATM 4u",
                            "primanota": "Primanota",
                            "timeZone": "TimeZone",
                            "remark": "Remark",
                            "addressData": {
                                "street": "Westernmauer",
                                "streetNo": "10",
                                "zipCode": "33098",
                                "city": "Paderborn"
                            },
                            "distanceKm": "12.493838727126767474723872773",
                            "enabledTransactions": [
                                "WITHDRAWAL",
                                "DEPOSIT"
                            ],
                            "wkstState": "CLOSEDCONSUMER"
                        },
                        {
                            "name": "ATM 24/7",
                            "primanota": "Primanota",
                            "timeZone": "TimeZone",
                            "remark": "Remark",
                            "addressData": {
                                "street": "Ferdinandstrasse",
                                "streetNo": "98a",
                                "zipCode": "33098",
                                "city": "Paderborn"
                            },
                            "distanceKm": "4.226565768782965736",
                            "enabledTransactions": [
                                "WITHDRAWAL",
                                "DEPOSIT"
                            ],
                            "wkstState": "OPENCONSUMER"
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
                    
                    onInitTextAndData() {}
                    onDeactivated() {}
                }
                
                injector
                    .mock("vm/ListViewModel", Wincor.UI.Content.ListViewModel)
                    .mock("extensions", bundle.ext)
                    .mock("knockout", ko);

                done();
            });
            jasmine.clock().install();
        });

        afterEach(() => {
            injector.remove();
            jasmine.clock().uninstall();
        });


        it("checks createAtmData", done => {
            injector.require(["GUIAPP/content/viewmodels/OutOfServiceViewModel"], module => {

                const vm = new Wincor.UI.Content.OutOfServiceViewModel();
                /*
                 * name,
                 * primanota,
                 * timeZone,
                 * remark,
                 * distanceKm,
                 * wkstState,
                 * addressData,
                 */
                const data = vm.createAtmData("ATM4U", "primanota", "the timezone", "some remark", "8.6", "ONLINE", {});

                expect(data.name).toEqual("ATM4U");
                expect(data.primanota).toEqual("primanota");
                expect(data.timeZone).toEqual("the timezone");
                expect(data.remark).toEqual("some remark");
                expect(data.distanceKm).toEqual("8.6");
                expect(data.wkstState).toEqual("ONLINE");
                expect(data.addressData).toEqual({});

                done();
            }, done.fail);
        });

        it("checks createAddressData", done => {
            injector.require(["GUIAPP/content/viewmodels/OutOfServiceViewModel"], module => {

                const vm = new Wincor.UI.Content.OutOfServiceViewModel();
                /*
                 * street,
                 * streetNo,
                 * zipCode,
                 * city,
                 */
                const data = vm.createAddressData("Heinz-Nixdorf-Ring", "1", "33106", "Paderborn");

                expect(data.street).toEqual("Heinz-Nixdorf-Ring");
                expect(data.streetNo).toEqual("1");
                expect(data.zipCode).toEqual("33106");
                expect(data.city).toEqual("Paderborn");

                done();
            }, done.fail);
        });

        it("initItemData check the 3. of 5 ATMs", done => {
            injector.require(["GUIAPP/content/viewmodels/OutOfServiceViewModel"], module => {

                const vm = new Wincor.UI.Content.OutOfServiceViewModel();
                let listSource;
                vm.setListLen = len => {};
                vm.setListSource = src  => listSource = src;
                vm.dataList = {
                    items: ko.observableArray([])
                };
                vm.initScrollbar = () => {};
                vm.initCurrentVisibleLimits = () => {};
                vm.initItemData(this.atmData_1["PROP_ATM_LOCATION_STATE_INFOS"]);

                expect(vm.dataList.items().length).toBe(5);
                expect(vm.dataList.items()[2].name).toEqual("ATM 4all");
                expect(typeof vm.dataList.items()[2].addressData === "object").toBe(true);
                expect(vm.dataList.items()[2].distanceKm).toEqual("6.816344556643767885434");
                expect(vm.dataList.items()[2].wkstState).toEqual("OPENCONSUMER");
                expect(vm.dataList.items()[2].addressData.street).toEqual("Heinz-Nixdorf-Ring");

                done();
            }, done.fail);
        });

        it("initItemData check order of ATMs", done => {
            injector.require(["GUIAPP/content/viewmodels/OutOfServiceViewModel"], module => {

                const vm = new Wincor.UI.Content.OutOfServiceViewModel();
                let listSource;
                vm.setListLen = len => {};
                vm.setListSource = src => listSource = src;
                vm.dataList = {
                    items: ko.observableArray([])
                };
                vm.initScrollbar = () => {};
                vm.initCurrentVisibleLimits = () => {};
                vm.initItemData(this.atmData_2["PROP_ATM_LOCATION_STATE_INFOS"]);

                expect(vm.dataList.items().length).toBe(3);
                expect(vm.dataList.items()[0].name).toEqual("ATM 24/7");
                expect(typeof vm.dataList.items()[0].addressData).toBe("object");
                expect(vm.dataList.items()[0].distanceKm).toEqual("4.2");
                expect(vm.dataList.items()[0].wkstState).toEqual("OPENCONSUMER");
                expect(vm.dataList.items()[0].addressData.street).toEqual("Ferdinandstrasse");

                expect(vm.dataList.items()[1].name).toEqual("ATM 4all");
                expect(typeof vm.dataList.items()[1].addressData === "object").toBe(true);
                expect(vm.dataList.items()[1].distanceKm).toEqual("6.816344556643767885434");
                expect(vm.dataList.items()[1].wkstState).toEqual("OPENCONSUMER");
                expect(vm.dataList.items()[1].addressData.street).toEqual("Heinz-Nixdorf-Ring");

                expect(vm.dataList.items()[2].name).toEqual("ATM 4u");
                expect(typeof vm.dataList.items()[2].addressData === "object").toBe(true);
                expect(vm.dataList.items()[2].distanceKm).toEqual("12.493838727126767474723872773");
                expect(vm.dataList.items()[2].wkstState).toEqual("CLOSEDCONSUMER");
                expect(vm.dataList.items()[2].addressData.street).toEqual("Westernmauer");

                done();
            }, done.fail);
        });
    
        it("checks updateAdaText", async () => {
            await injector.require(["GUIAPP/content/viewmodels/OutOfServiceViewModel"]);
            Wincor.UI.Service.Provider.DataService.businessData = this.atmData_3;
            spyOn(Wincor.UI.Service.Provider.DataService, "setValues");
            spyOn(Wincor.UI.Service.Provider.LocalizeService, "getText").and.callThrough();
        
            const vm = new Wincor.UI.Content.OutOfServiceViewModel();
            vm.dataList = {
                items: ko.observableArray(this.atmData_3["PROP_ATM_LOCATION_STATE_INFOS"])
            };
            vm.labels = {
                set: jasmine.createSpy("set").and.returnValue((key, text) => {
                }),
                getLabel: (key, defaultValue, optionsMap) => {
                    return key + "--"
                },
                resolveVars: (labelItem, ctxMap) => {
                    return JSON.stringify(ctxMap);
                },
                labelItems: {get: jasmine.createSpy("get").and.returnValue("Hello 2")},
            };
            spyOn(vm.labels, "resolveVars").and.callThrough();
            await vm.updateAdaText();
            expect(vm.labels.resolveVars).toHaveBeenCalledTimes(3);
            expect(Wincor.UI.Service.Provider.LocalizeService.getText).toHaveBeenCalledTimes(1);
            expect(Wincor.UI.Service.Provider.DataService.setValues).toHaveBeenCalledWith("PROP_OUT_OF_SERVICE_ADA_TEXT",
                "{\"number\":3,\"name\":\"ATM 24/7\",\"street\":\"Ferdinandstrasse\",\"streetNo\":\"98a\",\"city\":\"Paderborn\",\"zipCode\":\"33098\"," +
                "\"distanceKm\":\"4.23\",\"status\":\"GUI_TestViewKey_Label_ATMInfosStatusOnline_ADA\"} GUI_TestViewKey_Label_ATMQRCodesInfo_ADA");
        });
    
        it("checks updateAdaText after VM container clean", async() => {
            await injector.require(["GUIAPP/content/viewmodels/OutOfServiceViewModel"]);
            Wincor.UI.Service.Provider.DataService.businessData = this.atmData_3;
            spyOn(Wincor.UI.Service.Provider.LogProvider, "error");
            spyOn(Wincor.UI.Service.Provider.DataService, "setValues");
            spyOn(Wincor.UI.Service.Provider.LocalizeService, "getText").and.callFake(keys => {
                expect(Array.isArray(keys)).toBe(true);
                return new Promise(resolve => {
                    jasmine.clock().tick(500);
                    vm.clean(); // clean up VM - before resolve so that stuff within updateAdaText after promise has been resolved must handle that
                    resolve({"A": "test"});
                })
            });
        
            const vm = new Wincor.UI.Content.OutOfServiceViewModel();
            vm.clean = () => {
                vm.labels = null;
                vm.dataList = null;
            };
            vm.dataList = {
                items: ko.observableArray(this.atmData_3["PROP_ATM_LOCATION_STATE_INFOS"])
            };
            vm.labels = {
            };
            
            await vm.updateAdaText();
            expect(Wincor.UI.Service.Provider.LocalizeService.getText).toHaveBeenCalledTimes(1);
            expect(Wincor.UI.Service.Provider.DataService.setValues).not.toHaveBeenCalled();
            expect(Wincor.UI.Service.Provider.LogProvider.error).not.toHaveBeenCalled();
        });
        
        it("checks onInitTextAndData", done => {
            injector.require(["GUIAPP/content/viewmodels/OutOfServiceViewModel"], module => {
                Wincor.UI.Service.Provider.DataService.businessData = this.atmData_1;

                const vm = new Wincor.UI.Content.OutOfServiceViewModel();
                const dataKeys = [];
                const textKeys = [];
                let listSource;
                vm.setListLen = len => {};
                vm.setListSource = src => listSource = src;
                vm.dataList = {
                    items: ko.observableArray([])
                };
                vm.initScrollbar = () => {};
                vm.initCurrentVisibleLimits = () => {};
                vm.updateAdaText = jasmine.createSpy("updateAdaText").and.returnValue(Promise.resolve()); // alternative is: spyOn("updateAdaText").and.returnValue(Promise.resolve());
                vm.onInitTextAndData({dataKeys: dataKeys, textKeys: textKeys});
                expect(dataKeys.length).toBe(1);
                expect(typeof dataKeys[0]).toBe("object");
                dataKeys[0]
                    .then(() => {
                        expect(vm.updateAdaText).toHaveBeenCalledTimes(1);
                        expect(vm.dataList.items().length).toBe(5);
                        done();
                    })
                    .catch(done.fail);
            }, done.fail);
        });
    
        it("checks onInitTextAndData update property data after 100ms", done => {
            Wincor.UI.Service.Provider.DataService.getValues = (keys, callback, updateCallback) => { // overwritten
                callback(this.atmData_2);
                setTimeout(() => {
                    updateCallback(this.atmData_1); // update data
                    updateCallbackTimer();
                }, 100);
                return Wincor.UI.Promise.resolve(this.atmData_2);
            };

            const updateCallbackTimer = jasmine.createSpy("updateCallback");

            injector.require(["GUIAPP/content/viewmodels/OutOfServiceViewModel"], module => {
                const vm = new Wincor.UI.Content.OutOfServiceViewModel();
                const dataKeys = [];
                const textKeys = [];
                let listSource;
                vm.setListLen = len => {};
                vm.setListSource = src => listSource = src;
                vm.dataList = {
                    items: ko.observableArray([])
                };
                vm.initScrollbar = () => {};
                vm.initCurrentVisibleLimits = () => {};
                vm.updateAdaText = jasmine.createSpy("updateAdaText").and.returnValue(Promise.resolve()); // alternative is: spyOn("updateAdaText").and.returnValue(Promise.resolve());
                vm.onInitTextAndData({dataKeys: dataKeys, textKeys: textKeys});
                expect(dataKeys.length).toBe(1);
                expect(typeof dataKeys[0]).toBe("object");
                dataKeys[0]
                    .then(() => {
                        expect(vm.updateAdaText).toHaveBeenCalledTimes(1);
                        expect(vm.dataList.items().length).toBe(3);
                        jasmine.clock().tick(110);
                        expect(updateCallbackTimer).toHaveBeenCalled();
                        // recheck data
                        expect(vm.dataList.items().length).toBe(5);
                        done();
                    })
                    .catch(done.fail);
            }, done.fail);
        });

        it("checks onInitTextAndData update property data with empty data after 100ms", done => {
            Wincor.UI.Service.Provider.DataService.getValues = (keys, callback, updateCallback) => { // overwritten
                callback(this.atmData_2);
                setTimeout(() => {
                    updateCallback(""); // update data
                    updateCallbackTimer();
                }, 100);
                return Wincor.UI.Promise.resolve(this.atmData_2);
            };

            const updateCallbackTimer = jasmine.createSpy("updateCallback");

            injector.require(["GUIAPP/content/viewmodels/OutOfServiceViewModel"], module => {
                const vm = new Wincor.UI.Content.OutOfServiceViewModel();
                const dataKeys = [];
                const textKeys = [];
                let listSource;
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
                vm.updateAdaText = jasmine.createSpy("updateAdaText").and.returnValue(Promise.resolve()); // alternative is: spyOn("updateAdaText").and.returnValue(Promise.resolve());
                vm.onInitTextAndData({dataKeys: dataKeys, textKeys: textKeys});
                expect(dataKeys.length).toBe(1);
                expect(typeof dataKeys[0]).toBe("object");
                dataKeys[0]
                    .then(() => {
                        expect(vm.updateAdaText).toHaveBeenCalledTimes(1);
                        expect(vm.dataList.items().length).toBe(3);
                        jasmine.clock().tick(110); // move clock forward and then check again
                        expect(updateCallbackTimer).toHaveBeenCalled();
                        // recheck data
                        expect(vm.dataList.items().length).toBe(3);
                        done();
                    })
                    .catch(done.fail);
            }, done.fail);
        });

    });

});

