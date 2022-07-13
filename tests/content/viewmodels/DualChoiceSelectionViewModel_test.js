/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ DualChoiceSelectionViewModel_test.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

define(['lib/Squire'], function(Squire) {

    let injector;
    let ko;
    let Wincor;
    let jQuery;

    describe("DualChoiceSelectionViewModel", () => {

        beforeEach(done => {
            injector = new Squire();
            injector.require(["NamespaceMock"], bundle => {
                Wincor = window.Wincor = bundle.createWincor();
                ko = Wincor.ko = window.ko = bundle.ko;
                jQuery = window.jQuery = bundle.jQuery;

                this.listData = {};
                this.groupData_1 = {
                    "groups": [
                        {
                            "name": "SOMETHING_I_KNOW",
                            "items": [
                                {
                                    "result": "ACCOUNT_NUMBER",
                                    "selected": false,
                                    "state": 0
                                },
                                {
                                    "result": "SOCIAL_SECURITY_NUMBER",
                                    "selected": false,
                                    "state": 0
                    
                                },
                                {
                                    "result": "TRANSACTION_CODE",
                                    "selected": false,
                                    "exclusive": true,
                                    "state": 0
                                }
                            ]
                        },
                        {
                            "name": "SOMETHING_I_HAVE",
                            "items": [
                                {
                                    "result": "ID_CARD",
                                    "selected": false,
                                    "exclusive": true,
                                    "state": 0
                                },
                                {
                                    "result": "DRIVER_LICENSE",
                                    "selected": false,
                                    "state": 0
                                },
                                {
                                    "result": "PASSPORT",
                                    "selected": false,
                                    "state": 0
                                }
                            ]
                        }
                    ]
                };
    
                this.groupData_2 = {
                    "groups": [
                        {
                            "name": "SOMETHING_I_KNOW",
                            "items": [
                                {
                                    "result": "ACCOUNT_NUMBER",
                                    "selected": false,
                                    "state": 0
                                },
                                {
                                    "result": "SOCIAL_SECURITY_NUMBER",
                                    "selected": false,
                                    "state": 0
                        
                                },
                                {
                                    "result": "TRANSACTION_CODE",
                                    "selected": false,
                                    "exclusive": true,
                                    "state": 0
                                }
                            ]
                        },
                        {
                            "name": "SOMETHING_I_HAVE",
                            "items": [
                                {
                                    "result": "ID_CARD",
                                    "selected": true,
                                    "exclusive": true,
                                    "state": 0
                                },
                                {
                                    "result": "DRIVER_LICENSE",
                                    "selected": false,
                                    "state": 0
                                },
                                {
                                    "result": "PASSPORT",
                                    "selected": false,
                                    "state": 0
                                }
                            ]
                        }
                    ]
                };
    
                Wincor.UI.Content.BaseViewModel = class BaseViewModel extends Wincor.UI.Content.BaseViewModel {
                    constructor() {
                        super();
                    }
                    
                    onButtonPressed() {}
                };
                
                injector
                    .mock("jquery", jQuery)
                    .mock("knockout", ko);
                done();
            });
            jasmine.clock().install();
        });

        afterEach(() => {
            injector.remove();
            jasmine.clock().uninstall();
        });
    
        describe("general functions checks", () => {
            it("checks enhanceItemData", async done => {
                try {
                    await injector.require(["GUIAPP/content/viewmodels/DualChoiceSelectionViewModel"]);
                    const vm = new Wincor.UI.Content.DualChoiceSelectionViewModel();
                    let item = Object.assign({}, this.groupData_1.groups[0].items[0]);
                    // fake group stuff which usually initItemData does
                    vm.getGroups()[0] = this.groupData_1.groups[0];
                    vm.getGroups()[1] = this.groupData_1.groups[1];
                    vm.getGroups()[0].state = ko.observable(0);
                    vm.getGroups()[1].state = ko.observable(0);
                    item = vm.enhanceItemData(item, [{id: "ACCOUNT_NUMBER", exclusive: true}], 0);
                    expect(item.result).toEqual("ACCOUNT_NUMBER");
                    expect(item.selected()).toEqual(false);
                    expect(typeof item.state === "function").toBe(true);
                    expect(item.exclusive).toEqual(true);
                    done();
                } catch(e) {
                    done.fail(e);
                }
            });
    
            it("checks initItemData", async done => {
                try {
                    await injector.require(["GUIAPP/content/viewmodels/DualChoiceSelectionViewModel"]);
                    const vm = new Wincor.UI.Content.DualChoiceSelectionViewModel();
                    expect(typeof vm.itemsLeft === "function").toBe(true);
                    expect(typeof vm.itemsRight === "function").toBe(true);
            
                    vm.initItemData(this.groupData_1.groups);
            
                    expect(vm.itemsLeft().length).toEqual(3);
                    expect(vm.itemsLeft()[0].result).toEqual("ACCOUNT_NUMBER");
                    expect(typeof vm.itemsLeft()[0].selected === "function").toBe(true);
            
                    expect(vm.itemsRight().length).toEqual(3);
            
                    done();
                } catch(e) {
                    done.fail(e);
                }
            });
    
            it("checks getGroups", async done => {
                try {
                    await injector.require(["GUIAPP/content/viewmodels/DualChoiceSelectionViewModel"]);
                    const vm = new Wincor.UI.Content.DualChoiceSelectionViewModel();
                    vm.initItemData(this.groupData_1.groups);
                    let groups = vm.getGroups();
                    expect(groups.length).toEqual(2);
                    expect(typeof groups[0].valid === "function").toBe(true);
                    expect(typeof groups[0].state === "function").toBe(true);
                    expect(typeof groups[0].selectedItem === "function").toBe(true);
                    expect(groups[0].isExclusive).toEqual(false);
                    expect(groups[0].name).toEqual("SOMETHING_I_KNOW");
                    expect(groups[0].items.length).toEqual(3);
            
                    expect(groups[1].name).toEqual("SOMETHING_I_HAVE");
                    expect(typeof groups[1].valid === "function").toBe(true);
                    expect(typeof groups[1].state === "function").toBe(true);
                    expect(typeof groups[1].selectedItem === "function").toBe(true);
                    expect(groups[1].isExclusive).toEqual(false);
                    expect(groups[1].items.length).toEqual(3);
                    done();
                } catch(e) {
                    done.fail(e);
                }
            });
    
            it("checks deselectGroup", async done => {
                try {
                    await injector.require(["GUIAPP/content/viewmodels/DualChoiceSelectionViewModel"]);
                    const vm = new Wincor.UI.Content.DualChoiceSelectionViewModel();
                    vm.initItemData(this.groupData_1.groups);
                    vm.groupSelection("SOCIAL_SECURITY_NUMBER", 0);
                    expect(vm.itemsLeft()[1].selected()).toEqual(true);
                    vm.deselectGroup(0);
                    expect(vm.itemsLeft()[1].selected()).toEqual(false);
            
                    vm.groupSelection("PASSPORT", 1);
                    expect(vm.itemsRight()[2].selected()).toEqual(true);
                    vm.deselectGroup(1);
                    expect(vm.itemsRight()[2].selected()).toEqual(false);
                    done();
                } catch(e) {
                    done.fail(e);
                }
            });
    
            it("checks getSelectedItem", async done => {
                try {
                    await injector.require(["GUIAPP/content/viewmodels/DualChoiceSelectionViewModel"]);
                    const vm = new Wincor.UI.Content.DualChoiceSelectionViewModel();
                    vm.initItemData(this.groupData_2.groups);
                    let item = vm.getSelectedItem(0);
                    expect(item).toBe(void 0);
                    item = vm.getSelectedItem(1);
                    expect(item.selected()).toBe(true);
                    expect(item.result).toBe("ID_CARD");
                    done();
                } catch(e) {
                    done.fail(e);
                }
            });
    
            it("checks onButtonPressed", async done => {
                try {
                    await injector.require(["GUIAPP/content/viewmodels/DualChoiceSelectionViewModel"]);

                    // spy super call and check the UI result
                    spyOn(Wincor.UI.Content.BaseViewModel.prototype, "onButtonPressed").and.callThrough();
                    
                    const vm = new Wincor.UI.Content.DualChoiceSelectionViewModel();
                    vm.initItemData(this.groupData_1.groups);
                    vm.getGroups()[0].selectedItem("ACCOUNT_NUMBER");
                    Wincor.UI.Content.BaseViewModel.prototype.onButtonPressed = jasmine.createSpy("onButtonPressed");
                    vm.onButtonPressed("CONFIRM");
                    expect(Wincor.UI.Content.BaseViewModel.prototype.onButtonPressed).toHaveBeenCalledWith("ACCOUNT_NUMBER");
                    vm.getGroups()[1].selectedItem("PASSPORT");
                    vm.onButtonPressed("CONFIRM");
                    expect(Wincor.UI.Content.BaseViewModel.prototype.onButtonPressed).toHaveBeenCalledWith("ACCOUNT_NUMBER,PASSPORT");
                    vm.getGroups()[0].selectedItem("TRANSACTION_CODE"); // exclusive
                    vm.onButtonPressed("CONFIRM");
                    expect(Wincor.UI.Content.BaseViewModel.prototype.onButtonPressed).toHaveBeenCalledWith("TRANSACTION_CODE");
                    done();
                } catch(e) {
                    done.fail(e);
                }
            });
        });
        
        describe("logic functions checks", () => {
            it("checks groupSelection", async done => {
                try {
                    await injector.require(["GUIAPP/content/viewmodels/DualChoiceSelectionViewModel"]);
                    const vm = new Wincor.UI.Content.DualChoiceSelectionViewModel();
                    vm.initItemData(this.groupData_1.groups); // initialize groups first
                    const groups = vm.getGroups();
            
                    // selection left only
                    vm.groupSelection("SOCIAL_SECURITY_NUMBER", 0);
                    expect(groups[0].isExclusive).toEqual(false);
                    expect(groups[1].isExclusive).toEqual(false);
                    expect(groups[0].valid()).toEqual(false); // because selectedItem isn't set, if we set it groupSelection would be implicit called
                    expect(groups[1].valid()).toEqual(false); // because selectedItem isn't set, if we set it groupSelection would be implicit called
                    expect(groups[0].state()).toEqual(0);
                    expect(groups[1].state()).toEqual(0);
                    expect(vm.itemsLeft()[1].selected()).toEqual(true);
            
                    // selection right only
                    vm.groupSelection("PASSPORT", 1);
                    expect(groups[0].isExclusive).toEqual(false);
                    expect(groups[1].isExclusive).toEqual(false);
                    expect(groups[0].valid()).toEqual(false); // because selectedItem isn't set, if we set it groupSelection would be implicit called
                    expect(groups[1].valid()).toEqual(false); // because selectedItem isn't set, if we set it groupSelection would be implicit called
                    expect(groups[0].state()).toEqual(0);
                    expect(groups[1].state()).toEqual(0);
                    expect(vm.itemsRight()[2].selected()).toEqual(true);
            
                    // exclusive selection left
                    vm.groupSelection("TRANSACTION_CODE", 0);
                    expect(groups[0].isExclusive).toEqual(true);
                    expect(groups[1].isExclusive).toEqual(false);
                    expect(groups[0].valid()).toEqual(true);
                    expect(groups[1].valid()).toEqual(true);
                    expect(groups[0].state()).toEqual(0);
                    expect(groups[1].state()).toEqual(2);
                    expect(vm.itemsLeft()[2].selected()).toEqual(true);
            
                    // exclusive selection right
                    vm.groupSelection("ID_CARD", 1);
                    expect(groups[0].isExclusive).toEqual(false);
                    expect(groups[1].isExclusive).toEqual(true);
                    expect(groups[0].valid()).toEqual(true);
                    expect(groups[1].valid()).toEqual(true);
                    expect(groups[0].state()).toEqual(2);
                    expect(groups[1].state()).toEqual(0);
                    expect(vm.itemsRight()[0].selected()).toEqual(true);
            
                    done();
                } catch(e) {
                    done.fail(e);
                }
            });
    
            it("checks pre groupSelection left group", async done => {
                try {
                    await injector.require(["GUIAPP/content/viewmodels/DualChoiceSelectionViewModel"]);
                    const vm = new Wincor.UI.Content.DualChoiceSelectionViewModel();
                    this.groupData_2.groups[0].items[0].selected = true;
                    this.groupData_2.groups[1].items[0].selected = false;
                    vm.initItemData(this.groupData_2.groups); // initialize groups first
                    const groups = vm.getGroups();
            
                    // pre selection left
                    expect(groups[0].isExclusive).toEqual(false);
                    expect(groups[1].isExclusive).toEqual(false);
                    expect(groups[0].valid()).toEqual(true);
                    expect(groups[1].valid()).toEqual(false);
                    expect(groups[0].state()).toEqual(0);
                    expect(groups[1].state()).toEqual(0);
                    expect(vm.itemsLeft()[0].selected()).toEqual(true);
            
                    done();
                } catch(e) {
                    done.fail(e);
                }
            });
    
            it("checks pre (exclusive) groupSelection right group", async done => {
                try {
                    await injector.require(["GUIAPP/content/viewmodels/DualChoiceSelectionViewModel"]);
                    const vm = new Wincor.UI.Content.DualChoiceSelectionViewModel();
                    vm.initItemData(this.groupData_2.groups); // initialize groups first
                    const groups = vm.getGroups();
    
                    // exclusive pre selection right
                    expect(groups[0].isExclusive).toEqual(false);
                    expect(groups[1].isExclusive).toEqual(true);
                    expect(groups[0].valid()).toEqual(true);
                    expect(groups[1].valid()).toEqual(true);
                    expect(groups[0].state()).toEqual(2);
                    expect(groups[1].state()).toEqual(0);
                    expect(vm.itemsRight()[0].selected()).toEqual(true);
            
                    done();
                } catch(e) {
                    done.fail(e);
                }
            });
    
    
            it("checks handleConfirmState: none valid", async done => {
                try {
                    await injector.require(["GUIAPP/content/viewmodels/DualChoiceSelectionViewModel"]);
                    const vm = new Wincor.UI.Content.DualChoiceSelectionViewModel();
                    vm.initItemData(this.groupData_1.groups); // initialize groups first
                    spyOn(vm.cmdRepos, "setActive");
                    await vm.handleConfirmState();
                    expect(vm.cmdRepos.setActive).toHaveBeenCalledWith(["CONFIRM"], false);
                    done();
                } catch(e) {
                    done.fail(e);
                }
            });
    
            it("checks handleConfirmState: only left valid", async done => {
                try {
                    await injector.require(["GUIAPP/content/viewmodels/DualChoiceSelectionViewModel"]);
                    const vm = new Wincor.UI.Content.DualChoiceSelectionViewModel();
                    vm.initItemData(this.groupData_1.groups); // initialize groups first
                    let groups = vm.getGroups();
                    groups[0].selectedItem("ACCOUNT_NUMBER");
                    spyOn(vm.cmdRepos, "setActive");
                    await vm.handleConfirmState();
                    expect(vm.cmdRepos.setActive).toHaveBeenCalledWith(["CONFIRM"], false);
                    done();
                } catch(e) {
                    done.fail(e);
                }
            });
    
            it("checks handleConfirmState: only right valid", async done => {
                try {
                    await injector.require(["GUIAPP/content/viewmodels/DualChoiceSelectionViewModel"]);
                    const vm = new Wincor.UI.Content.DualChoiceSelectionViewModel();
                    vm.initItemData(this.groupData_1.groups); // initialize groups first
                    let groups = vm.getGroups();
                    groups[1].selectedItem("DRIVER_LICENSE");
                    spyOn(vm.cmdRepos, "setActive");
                    await vm.handleConfirmState();
                    expect(vm.cmdRepos.setActive).toHaveBeenCalledWith(["CONFIRM"], false);
                    done();
                } catch(e) {
                    done.fail(e);
                }
            });
    
            it("checks handleConfirmState: valid: left exclusive", async done => {
                try {
                    await injector.require(["GUIAPP/content/viewmodels/DualChoiceSelectionViewModel"]);
                    const vm = new Wincor.UI.Content.DualChoiceSelectionViewModel();
                    vm.initItemData(this.groupData_1.groups); // initialize groups first
                    let groups = vm.getGroups();
                    groups[0].selectedItem("TRANSACTION_CODE");
                    spyOn(vm.cmdRepos, "setActive");
                    await vm.handleConfirmState();
                    expect(vm.cmdRepos.setActive).toHaveBeenCalledWith(["CONFIRM"], true);
                    done();
                } catch(e) {
                    done.fail(e);
                }
            });
    
            it("checks handleConfirmState: valid: right exclusive", async done => {
                try {
                    await injector.require(["GUIAPP/content/viewmodels/DualChoiceSelectionViewModel"]);
                    const vm = new Wincor.UI.Content.DualChoiceSelectionViewModel();
                    vm.initItemData(this.groupData_1.groups); // initialize groups first
                    let groups = vm.getGroups();
                    groups[1].selectedItem("ID_CARD");
                    spyOn(vm.cmdRepos, "setActive");
                    await vm.handleConfirmState();
                    expect(vm.cmdRepos.setActive).toHaveBeenCalledWith(["CONFIRM"], true);
                    done();
                } catch(e) {
                    done.fail(e);
                }
            });
    
            it("checks handleConfirmState: valid: left/right", async done => {
                try {
                    await injector.require(["GUIAPP/content/viewmodels/DualChoiceSelectionViewModel"]);
                    const vm = new Wincor.UI.Content.DualChoiceSelectionViewModel();
                    vm.initItemData(this.groupData_1.groups); // initialize groups first
                    let groups = vm.getGroups();
                    groups[0].selectedItem("ACCOUNT_NUMBER");
                    groups[1].selectedItem("PASSPORT");
                    spyOn(vm.cmdRepos, "setActive");
                    await vm.handleConfirmState();
                    expect(vm.cmdRepos.setActive).toHaveBeenCalledWith(["CONFIRM"], true);
                    done();
                } catch(e) {
                    done.fail(e);
                }
            });
            
            it("checks item states after exclusive selection/deselection", async done => {
                try {
                    await injector.require(["GUIAPP/content/viewmodels/DualChoiceSelectionViewModel"]);
                    const vm = new Wincor.UI.Content.DualChoiceSelectionViewModel();
                    let data = Object.assign({}, this.groupData_1);
                    data.groups[1].items[2].state = 2; // PASSPORT
                    data.groups[0].items[1].state = 2; // SOCIAL_SECURITY_NUMBER
                    vm.initItemData(data.groups); // initialize groups first
                    // disable certain states first
                    expect(vm.itemsLeft()[1].state()).toBe(2);
                    expect(vm.itemsRight()[2].state()).toBe(2);
                    let groups = vm.getGroups();
                    groups[0].selectedItem("TRANSACTION_CODE"); // select exclusive
                    expect(groups[0].state()).toBe(0);
                    expect(groups[1].state()).toBe(2);
                    expect(vm.itemsRight()[0].state()).toBe(2);
                    expect(vm.itemsRight()[1].state()).toBe(2);
                    expect(vm.itemsRight()[2].state()).toBe(2);
                    groups[0].selectedItem("ACCOUNT_NUMBER"); // deselect exclusive
                    expect(groups[0].state()).toBe(0);
                    expect(groups[1].state()).toBe(0);
                    expect(vm.itemsRight()[0].state()).toBe(0);
                    expect(vm.itemsRight()[1].state()).toBe(0);
                    expect(vm.itemsRight()[2].state()).toBe(2);
                    groups[1].selectedItem("ID_CARD"); // select exclusive
                    expect(groups[0].state()).toBe(2);
                    expect(groups[1].state()).toBe(0);
                    expect(vm.itemsLeft()[0].state()).toBe(2);
                    expect(vm.itemsLeft()[1].state()).toBe(2);
                    expect(vm.itemsLeft()[2].state()).toBe(2);
                    groups[1].selectedItem("DRIVER_LICENSE"); // deselect exclusive
                    expect(vm.itemsLeft()[0].state()).toBe(0);
                    expect(vm.itemsLeft()[1].state()).toBe(2);
                    expect(vm.itemsLeft()[2].state()).toBe(0);
                    done();
                } catch(e) {
                    done.fail(e);
                }
            });
    
        });
    });

});

