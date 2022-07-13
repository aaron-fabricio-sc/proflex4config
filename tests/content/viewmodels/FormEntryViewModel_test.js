/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ FormEntryViewModel_test.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

define(['lib/Squire'], function(Squire) {

    let injector;
    let ko;
    let Wincor;
    let jQuery;

    describe("FormEntryViewModel", () => {

        beforeEach(done => {
            injector = new Squire();
            injector.require(["NamespaceMock"], bundle => {
                Wincor = window.Wincor = bundle.createWincor();
                jQuery = window.jQuery = bundle.jQuery;
                ko = Wincor.ko = window.ko = bundle.ko;

                let fakeThenPromise = Promise.resolve();
                spyOn(fakeThenPromise, "then"); // to prevent from calling onInputChangedSetButtons
                spyOn(Wincor.UI.Content.ViewModelContainer, "whenActivated").and.returnValue(fakeThenPromise);
                
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
                
                spyOn(Wincor.UI.Content.ListViewModel.prototype, "onButtonPressed").and.callThrough();
                
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
            it("calls super for all necessary overridden functions", done => {
                injector.require(["GUIAPP/content/viewmodels/FormEntryViewModel"], () => {
                    
                    spyOn(Wincor.UI.Content.ListViewModel.prototype, "observe").and.callThrough();
                    spyOn(Wincor.UI.Content.ListViewModel.prototype, "onInitTextAndData").and.callThrough();
                    spyOn(Wincor.UI.Content.ListViewModel.prototype, "onDeactivated").and.callThrough();
                    
                    const vm = new Wincor.UI.Content.FormEntryViewModel();
                    vm.vmHelper.convertToBoolean = jasmine.createSpy("convertToBoolean").and.returnValue(true);
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
                    done();
                }, done.fail);
            });
        });

        describe("item preparation", () => {

            it("adds primitive attributes and observables to items", done => {
                injector.require(["GUIAPP/content/viewmodels/FormEntryViewModel"], () => {
                    const vm = new Wincor.UI.Content.FormEntryViewModel();
                    let ITEM = {};
                    const MEMBERS = [
                        "formatOption",
                        "clearByCorrect",
                        "mandatory",
                        "state",
                        "btnState",
                        "successfullyChecked",
                        "validationState",
                        "visualState",
                        "label",
                        "computedLabel",
                        "adaText",
                        "computedAdaText",
                        "adaTextPost",
                        "adaTextPostGeneric",
                        "computedAdaTextPost",
                        "errorText",
                        "errorTextGeneric",
                        "helpText",
                        "helpTextGeneric",
                        "placeHolder",
                        "formattedPlaceHolder",
                        "value",
                        "rawValue",
                        "formattedValue" ];

                    // pass empty object and check what has been added...
                    vm.enhanceItemData(ITEM);
                    vm.enhanceItemDataWithComputedObservables(ITEM);

                    expect(Object.keys(ITEM)).toEqual(jasmine.arrayContaining(MEMBERS));
                    expect(ITEM.formatOption).toEqual("None");
                    expect(ITEM.clearByCorrect).toBe(true);
                    expect(ITEM.mandatory).toBe(true);

                    expect(ITEM.state()).toBe(0);
                    expect(ITEM.successfullyChecked()).toBe(false);
                    expect(ITEM.validationState()).toEqual("empty");

                    expect(ITEM.label()).toBe("");

                    expect(ITEM.value()).toBe("");
                    expect(ITEM.rawValue()).toBe("");
                    expect(ITEM.formattedValue()).toBe("");

                    expect(ITEM.errorText()).toBe("");
                    expect(ITEM.helpText()).toBe("");
                    expect(ITEM.errorTextGeneric()).toBe("");
                    expect(ITEM.helpTextGeneric()).toBe("");


                    MEMBERS.forEach(member => {
                        expect(member in ITEM).toBe(true, `existence of attribute ${member}`);
                    });

                    ITEM.rawValue(1234);
                    expect(ITEM.value()).toBe(1234);
                    expect(ITEM.formattedValue()).toBe("");
                    done();
                }, done.fail);
            });

            it("calls enhanceItemData before enhanceItemDataWithComputedObservables", done => {
                injector.require(["GUIAPP/content/viewmodels/FormEntryViewModel"], () => {
                    const vm = new Wincor.UI.Content.FormEntryViewModel();
                    // fake base vm does not implement all ListViewModel fxs
                    vm.setElementTemplate = jasmine.createSpy("setElementTemplate");
                    vm.setListLen = jasmine.createSpy("setListLen");
                    vm.setListSource = jasmine.createSpy("setListSource");
                    vm.initCurrentVisibleLimits = jasmine.createSpy("initCurrentVisibleLimits");
                    vm.setupVisualLists = jasmine.createSpy("setupVisualLists");
                    vm.dataList = {items: jasmine.createSpy("dataList.items")};
                    vm.initScrollbar = jasmine.createSpy("initScrollbar");
                    const GROUPS = [{
                        items: [{}]
                    }];

                    spyOn(vm, "enhanceItemData");
                    spyOn(vm, "enhanceItemDataWithComputedObservables");
                    vm.initItemData(GROUPS);
                    expect(vm.enhanceItemData).toHaveBeenCalledBefore(vm.enhanceItemDataWithComputedObservables);

                    // pass empty object and check what has been added...
                    done();
                }, done.fail);
            });

            it("provides empty business data", done => {
                injector.require(["GUIAPP/content/viewmodels/FormEntryViewModel"], () => {
                    const vm = new Wincor.UI.Content.FormEntryViewModel();
                    // fake base vm does not implement all ListViewModel fxs
                    vm.setElementTemplate = jasmine.createSpy("setElementTemplate");
                    vm.setListLen = jasmine.createSpy("setListLen");
                    vm.setListSource = jasmine.createSpy("setListSource");
                    vm.initCurrentVisibleLimits = jasmine.createSpy("initCurrentVisibleLimits");
                    vm.setupVisualLists = jasmine.createSpy("setupVisualLists");
                    vm.dataList = {items: jasmine.createSpy("dataList.items")};
                    vm.initScrollbar = jasmine.createSpy("initScrollbar");
                    const GROUPS = [{
                        items: []
                    }];

                    spyOn(vm, "enhanceItemData");
                    spyOn(vm, "enhanceItemDataWithComputedObservables");
                    spyOn(vm, "prepareEditMode");

                    //spyOn(vm, "importBusinessData").and.callThrough();
                    // spyOn(vm, "importBusinessData").and.callFake(() => {
                    //     return Promise.resolve({});
                    // });
                    vm.initItemData(GROUPS);
                    // pass empty object and check what has been added...
                    expect(vm.enhanceItemData).not.toHaveBeenCalled();
                    expect(vm.enhanceItemDataWithComputedObservables).not.toHaveBeenCalled();
                    expect(vm.prepareEditMode).not.toHaveBeenCalled();

                    expect(vm.numberOfFields).toBe(0);

                    done();
                }, done.fail);
            });

            it("provides business data", done => {
                injector.require(["GUIAPP/content/viewmodels/FormEntryViewModel"], () => {
                    const vm = new Wincor.UI.Content.FormEntryViewModel();
                    // fake base vm does not implement all ListViewModel fxs
                    vm.setElementTemplate = jasmine.createSpy("setElementTemplate");
                    vm.setListLen = jasmine.createSpy("setListLen");
                    vm.setListSource = jasmine.createSpy("setListSource");
                    vm.initCurrentVisibleLimits = jasmine.createSpy("initCurrentVisibleLimits");
                    vm.setupVisualLists = jasmine.createSpy("setupVisualLists");
                    vm.dataList = {items: jasmine.createSpy("dataList.items")};
                    vm.initScrollbar = jasmine.createSpy("initScrollbar");
                    const GROUPS = [{
                        name: "FormEntryData",
                        items: [
                            {
                                "id": "PAYEE_ID",
                                "state": 0,
                                "value": ""
                            },
                            {
                                "id": "PAYEE_NAME",
                                "state": 0,
                                "value": "John Doe"
                            },
                            {
                                "id": "Bill_reference_number",
                                "state": 0,
                                "value": ""
                            },
                            {
                                "id": "Amount",
                                "state": 0,
                                "value": ""
                            }
                        ]
                    }];

                    spyOn(vm, "enhanceItemData");
                    spyOn(vm, "enhanceItemDataWithComputedObservables");
                    spyOn(vm, "prepareEditMode");
                    vm.initItemData(GROUPS);

                    // pass object and check what has been added...
                    expect(vm.enhanceItemData.calls.count()).toEqual(4);
                    expect(vm.enhanceItemData).toHaveBeenCalledWith({
                        "id": "PAYEE_ID",
                        "state": 0,
                        "value": ""
                    });
                    expect(vm.enhanceItemData).toHaveBeenCalledWith({
                        "id": "PAYEE_NAME",
                        "state": 0,
                        "value": "John Doe"
                    });
                    expect(vm.enhanceItemData).toHaveBeenCalledWith({
                        "id": "Bill_reference_number",
                        "state": 0,
                        "value": ""
                    });
                    expect(vm.enhanceItemData).toHaveBeenCalledWith({
                        "id": "Amount",
                        "state": 0,
                        "value": ""
                    });

                    expect(vm.enhanceItemDataWithComputedObservables.calls.count()).toEqual(4);
                    expect(vm.enhanceItemDataWithComputedObservables).toHaveBeenCalledWith({
                        "id": "PAYEE_ID",
                        "state": 0,
                        "value": ""
                    });
                    expect(vm.enhanceItemDataWithComputedObservables).toHaveBeenCalledWith({
                        "id": "PAYEE_NAME",
                        "state": 0,
                        "value": "John Doe"
                    });
                    expect(vm.enhanceItemDataWithComputedObservables).toHaveBeenCalledWith({
                        "id": "Bill_reference_number",
                        "state": 0,
                        "value": ""
                    });
                    expect(vm.enhanceItemDataWithComputedObservables).toHaveBeenCalledWith({
                        "id": "Amount",
                        "state": 0,
                        "value": ""
                    });

                    expect(vm.prepareEditMode).toHaveBeenCalled();

                    expect(vm.numberOfFields).toBe(4);
                    expect(vm.editMode()).toBe(false);

                    done();
                }, done.fail);
            });

            it("provides business data with only one field", done => {
                injector.require(["GUIAPP/content/viewmodels/FormEntryViewModel"], () => {
                    const vm = new Wincor.UI.Content.FormEntryViewModel();
                    // fake base vm does not implement all ListViewModel fxs
                    vm.setElementTemplate = jasmine.createSpy("setElementTemplate");
                    vm.setListLen = jasmine.createSpy("setListLen");
                    vm.setListSource = jasmine.createSpy("setListSource");
                    vm.initCurrentVisibleLimits = jasmine.createSpy("initCurrentVisibleLimits");
                    vm.setupVisualLists = jasmine.createSpy("setupVisualLists");
                    vm.dataList = {items: jasmine.createSpy("dataList.items")};
                    vm.initScrollbar = jasmine.createSpy("initScrollbar");
                    const GROUPS = [{
                        name: "FormEntryData",
                        items: [
                            {
                                "id": "PAYEE_ID",
                                "state": 0,
                                "value": ""
                            }
                        ]
                    }];

                    spyOn(vm, "enhanceItemData");
                    spyOn(vm, "enhanceItemDataWithComputedObservables");
                    spyOn(vm, "prepareEditMode");
                    vm.initItemData(GROUPS);

                    // pass object and check what has been added...
                    expect(vm.enhanceItemData.calls.count()).toEqual(1);
                    expect(vm.enhanceItemData).toHaveBeenCalledWith({
                        "id": "PAYEE_ID",
                        "state": 0,
                        "value": ""
                    });

                    expect(vm.enhanceItemDataWithComputedObservables.calls.count()).toEqual(1);
                    expect(vm.prepareEditMode).toHaveBeenCalledWith([{
                        name: "FormEntryData",
                        items: [
                            {
                                "id": "PAYEE_ID",
                                "state": 0,
                                "value": ""
                            }
                        ]
                    }]);

                    expect(GROUPS[0].items[0].id).toBe("PAYEE_ID");
                    expect(GROUPS[0].items[0].state).toBe(0);
                    expect(GROUPS[0].items[0].value).toBe("");

                    expect(vm.numberOfFields).toBe(1);
                    expect(vm.initialInstruction).toBe("");
                    expect(vm.editMode()).toBe(false);

                    done();
                }, done.fail);
            });

            it("tests enhanceItemData with a text item", done => {
                injector.require(["GUIAPP/content/viewmodels/FormEntryViewModel"], () => {
                    const vm = new Wincor.UI.Content.FormEntryViewModel();
                    const ITEM = {
                        "id": "PAYEE_ID",
                        "state": 0,
                        "value": ""
                    };


                    // spyOn(vm, "getLabel");
                    vm.enhanceItemData(ITEM);

                    expect(ITEM.id).toBe("PAYEE_ID");
                    expect(ITEM.state()).toBe(0);
                    expect(ITEM.value).toBe("");

                    expect(ITEM.type).toBe("text");

                    expect(ITEM.formatOption).toEqual("None");
                    expect(ITEM.clearByCorrect).toEqual(true);
                    expect(ITEM.mandatory).toEqual(true);

                    expect(ITEM.minLen).toBe(0);
                    expect(ITEM.maxLen).toBe(Infinity);

                    expect(ITEM.minValue).toBe(undefined);
                    expect(ITEM.maxValue).toBe(undefined);
                    expect(ITEM.allowLeadingZero).toBe(undefined);
                    expect(ITEM.multiplier).toBe(undefined);
                    expect(ITEM.decimal).toBe(undefined);

                    expect(ITEM.btnState()).toBe(0);

                    expect(ITEM.successfullyChecked()).toBe(false);
                    expect(ITEM.validationState()).toEqual("empty");
                    expect(ITEM.visualState()).toBe(0);
                    expect(ITEM.rawValue()).toBe("");
                    expect(ITEM.formattedValue()).toBe("");

                    vm.enhanceItemDataWithComputedObservables(ITEM);
                    expect(ITEM.value()).toBe("");
                    expect(ITEM.label()).toBe("");
                    expect(ITEM.computedLabel()).toBe("PAYEE_ID");
                    expect(ITEM.adaText()).toBe("");
                    expect(ITEM.computedAdaText()).toBe("PAYEE_ID");
                    expect(ITEM.adaTextPost()).toBe("");
                    expect(ITEM.computedAdaTextPost()).toBe("PAYEE_ID");
                    expect(ITEM.adaTextPostGeneric()).toBe("");

                    // expect(vm.getLabel.calls.count()).toEqual(5);
                    // expect(vm.getLabel).toHaveBeenCalledWith(vm.viewKey);

                    done();
                }, done.fail);
            });

            it("tests enhanceItemData with a numeric item", done => {
                injector.require(["GUIAPP/content/viewmodels/FormEntryViewModel"], () => {
                    const vm = new Wincor.UI.Content.FormEntryViewModel();

                    const ITEM = {
                        "id": "Bill_reference_number",
                        "state": 0,
                        "value": "",
                        "type": "number"

                    };

                    // spyOn(vm, "getLabel");
                    vm.enhanceItemData(ITEM);

                    expect(ITEM.id).toBe("Bill_reference_number");
                    expect(ITEM.state()).toBe(0);
                    expect(ITEM.value).toBe("");
                    expect(ITEM.type).toBe("number");

                    expect(ITEM.formatOption).toEqual("None");
                    expect(ITEM.clearByCorrect).toEqual(true);
                    expect(ITEM.mandatory).toEqual(true);

                    expect(ITEM.minLen).toBe(0);
                    expect(ITEM.maxLen).toBe(Infinity);
                    expect(ITEM.minValue).toBe(0);
                    expect(ITEM.maxValue).toBe(Infinity);
                    expect(ITEM.allowLeadingZero).toBe(true);
                    expect(ITEM.multiplier).toBe(1);

                    expect(ITEM.decimal).toBe(undefined);

                    expect(ITEM.btnState()).toBe(0);

                    expect(ITEM.successfullyChecked()).toBe(false);
                    expect(ITEM.validationState()).toEqual("empty");
                    expect(ITEM.visualState()).toBe(0);
                    expect(ITEM.rawValue()).toBe("");
                    expect(ITEM.formattedValue()).toBe("");
                    expect(ITEM.errorText()).toBe("");
                    expect(ITEM.helpText()).toBe("");
                    expect(ITEM.errorTextGeneric()).toBe("");
                    expect(ITEM.helpTextGeneric()).toBe("");

                    vm.enhanceItemDataWithComputedObservables(ITEM);
                    expect(ITEM.value()).toBe("");
                    expect(ITEM.label()).toBe("");
                    expect(ITEM.computedLabel()).toBe("Bill_reference_number");
                    expect(ITEM.adaText()).toBe("");
                    expect(ITEM.computedAdaText()).toBe("Bill_reference_number");
                    expect(ITEM.adaTextPost()).toBe("");
                    expect(ITEM.computedAdaTextPost()).toBe("Bill_reference_number");
                    expect(ITEM.adaTextPostGeneric()).toBe("");

                    // expect(vm.getLabel.calls.count()).toEqual(5);
                    // expect(vm.getLabel).toHaveBeenCalledWith(vm.viewKey);

                    done();
                }, done.fail);
            });

            it("tests enhanceItemData with an amount item", done => {
                injector.require(["GUIAPP/content/viewmodels/FormEntryViewModel"], () => {
                    const vm = new Wincor.UI.Content.FormEntryViewModel();
                    const ITEM = {
                        "id": "Amount",
                        "state": 0,
                        "value": "",
                        "type": "amount"
                    };

                    vm.enhanceItemData(ITEM);
                    expect(ITEM.id).toBe("Amount");
                    expect(ITEM.state()).toBe(0);
                    expect(ITEM.value).toBe("");
                    expect(ITEM.type).toBe("amount");

                    expect(ITEM.formatOption).toEqual("None");
                    expect(ITEM.clearByCorrect).toEqual(true);
                    expect(ITEM.mandatory).toEqual(true);

                    expect(ITEM.minValue).toBe(0);
                    expect(ITEM.maxValue).toBe(Infinity);
                    expect(ITEM.decimal).toBe(true);
                    expect(ITEM.multiplier).toBe(1);

                    expect(ITEM.minLen).toBe(undefined);
                    expect(ITEM.maxLen).toBe(undefined);
                    expect(ITEM.allowLeadingZero).toBe(undefined);

                    expect(ITEM.btnState()).toBe(0);

                    expect(ITEM.successfullyChecked()).toBe(false);
                    expect(ITEM.validationState()).toEqual("empty");
                    expect(ITEM.visualState()).toBe(0);
                    expect(ITEM.rawValue()).toBe("");
                    expect(ITEM.formattedValue()).toBe("");

                    expect(ITEM.errorText()).toBe("");
                    expect(ITEM.helpText()).toBe("");
                    expect(ITEM.errorTextGeneric()).toBe("");
                    expect(ITEM.helpTextGeneric()).toBe("");

                    vm.enhanceItemDataWithComputedObservables(ITEM);
                    expect(ITEM.value()).toBe("");
                    expect(ITEM.label()).toBe("");
                    expect(ITEM.computedLabel()).toBe("Amount");
                    expect(ITEM.adaText()).toBe("");
                    expect(ITEM.computedAdaText()).toBe("Amount");
                    expect(ITEM.adaTextPost()).toBe("");
                    expect(ITEM.computedAdaTextPost()).toBe("Amount");
                    expect(ITEM.adaTextPostGeneric()).toBe("");

                    done();
                }, done.fail);
            });


        });

        describe("call super in onButtonPressed", () => {
            it("calls super in onButtonPressed in selection mode (softkey)", done => {
                injector.require(["GUIAPP/content/viewmodels/FormEntryViewModel"], () => {
                    const vm = new Wincor.UI.Content.FormEntryViewModel();

                    vm.groups = [{"name": "FormEntryData", "items": [ { "id": "Payee_ID", "state": 0, "value": "" },
                        { "id": "Payee_name", "state": 0, "value": "John Doe" },
                        { "id": "Bill_reference_number", "state": 0, "value": "" },
                        { "id": "Amount", "state": 0, "value": "" }]}];
                    vm.numberOfFields = 4;

                    vm.editMode(false);
                    vm.vmContainer.viewHelper.viewType = "softkey";
                    // another button pressed (no known button pressed)
                    vm.onButtonPressed("NEW_BUTTON");

                    expect(Wincor.UI.Content.ListViewModel.prototype.onButtonPressed).toHaveBeenCalledTimes(1);

                    done();
                }, done.fail);
            });

            it("calls super in onButtonPressed in selection mode (touch)", done => {
                injector.require(["GUIAPP/content/viewmodels/FormEntryViewModel"], () => {
                    const vm = new Wincor.UI.Content.FormEntryViewModel();

                    vm.groups = [{"name": "FormEntryData", "items": [ { "id": "Payee_ID", "state": 0, "value": "" },
                        { "id": "Payee_name", "state": 0, "value": "John Doe" },
                        { "id": "Bill_reference_number", "state": 0, "value": "" },
                        { "id": "Amount", "state": 0, "value": "" }]}];
                    vm.numberOfFields = 4;

                    vm.editMode(false);
                    vm.vmContainer.viewHelper.viewType = "touch";
                    // another button pressed (no known button pressed)
                    vm.onButtonPressed("NEW_BUTTON");

                    expect(Wincor.UI.Content.ListViewModel.prototype.onButtonPressed).toHaveBeenCalledTimes(1);

                    done();
                }, done.fail);
            });

            it("do not call super in onButtonPressed in selection mode (softkey)", done => {
                injector.require(["GUIAPP/content/viewmodels/FormEntryViewModel"], () => {
                    const vm = new Wincor.UI.Content.FormEntryViewModel();

                    vm.groups = [{"name": "FormEntryData", "items": [ { "id": "Payee_ID", "state": 0, "value": "" },
                        { "id": "Payee_name", "state": 0, "value": "John Doe", "successfullyChecked": jasmine.createSpy("successfullyChecked"), "visualState": jasmine.createSpy("visualState")  },
                        { "id": "Bill_reference_number", "state": 0, "value": "" },
                        { "id": "Amount", "state": 0, "value": "" }]}];
                    vm.numberOfFields = 4;


                    vm.editMode(false);
                    vm.vmContainer.viewHelper.viewType = "softkey";
                    spyOn(vm, "onEditModeChanged");
                    // softkey next to input field pressed:
                    vm.onButtonPressed("BTN_Payee_name");

                    expect(Wincor.UI.Content.ListViewModel.prototype.onButtonPressed).not.toHaveBeenCalled();

                    done();
                }, done.fail);
            });

            it("do not call super in onButtonPressed in selection mode (touch)", done => {
                injector.require(["GUIAPP/content/viewmodels/FormEntryViewModel"], () => {
                    const vm = new Wincor.UI.Content.FormEntryViewModel();

                    vm.groups = [{"name": "FormEntryData", "items": [ { "id": "Payee_ID", "state": 0, "value": "" },
                        { "id": "Payee_name", "state": 0, "value": "John Doe", "successfullyChecked": jasmine.createSpy("successfullyChecked"), "visualState": jasmine.createSpy("visualState")  },
                        { "id": "Bill_reference_number", "state": 0, "value": "" },
                        { "id": "Amount", "state": 0, "value": "" }]}];
                    vm.numberOfFields = 4;


                    vm.editMode(false);
                    vm.vmContainer.viewHelper.viewType = "touch";
                    // input field pressed:
                    vm.onButtonPressed("Payee_name");

                    expect(Wincor.UI.Content.ListViewModel.prototype.onButtonPressed).not.toHaveBeenCalled();

                    done();
                }, done.fail);
            });


            it("calls super in onButtonPressed in edit mode (touch)", done => {
                injector.require(["GUIAPP/content/viewmodels/FormEntryViewModel"], () => {
                    const vm = new Wincor.UI.Content.FormEntryViewModel();

                    vm.editMode(true);
                    vm.vmContainer.viewHelper.viewType = "touch";
                    vm.inputIds = ["Payee_name", "Payee_ID", "Bill_reference_number", "Amount"];

                    // another button pressed (no known button pressed)
                    vm.onButtonPressed("NEW_BUTTON");
                    expect(Wincor.UI.Content.ListViewModel.prototype.onButtonPressed).toHaveBeenCalledTimes(1);

                    done();
                }, done.fail);
            });

            it("calls super in onButtonPressed in edit mode (softkey)", done => {
                injector.require(["GUIAPP/content/viewmodels/FormEntryViewModel"], () => {
                    const vm = new Wincor.UI.Content.FormEntryViewModel();

                    vm.editMode(true);
                    vm.vmContainer.viewHelper.viewType = "softkey";
                    vm.inputIds = ["Payee_name", "Payee_ID", "Bill_reference_number", "Amount"];

                    // another button pressed (no known button pressed)
                    vm.onButtonPressed("NEW_BUTTON");
                    expect(Wincor.UI.Content.ListViewModel.prototype.onButtonPressed).toHaveBeenCalledTimes(1);

                    done();
                }, done.fail);
            });

            it("do not call super in onButtonPressed because an input field has been touched (softkey layout on touchscreen) in edit mode", done => {
                injector.require(["GUIAPP/content/viewmodels/FormEntryViewModel"], () => {
                    const vm = new Wincor.UI.Content.FormEntryViewModel();

                    vm.editMode(true);
                    vm.vmContainer.viewHelper.viewType = "softkey";
                    vm.inputIds = ["Payee_name", "Payee_ID", "Bill_reference_number", "Amount"];

                    // input field pressed
                    vm.onButtonPressed("Bill_reference_number");
                    expect(Wincor.UI.Content.ListViewModel.prototype.onButtonPressed).not.toHaveBeenCalled();

                    done();
                }, done.fail);
            });
        });


    });
});

