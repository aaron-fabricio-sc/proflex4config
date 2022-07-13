/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ CheckBoxesViewModel_test.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

define(['lib/Squire'], function(Squire) {

    let injector;
    let ko;
    let Wincor;
    let jQuery;

    describe("CheckBoxesViewModel", () => {

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
                    visibleLimits = {max: 0};
                    
                    onButtonPressed() {}
                }
                
                injector
                    .mock("vm/ListViewModel", Wincor.UI.Content.ListViewModel)
                    .mock("jquery", jQuery)
                    .mock("knockout", ko);
                
                this.listData = {};

                this.groupData_1 = {
                    "allowConfirmWithoutSelection": false,
                    "minSelection": 2,
                    "maxSelection": 2,
                    "groups": [
                        {
                            "name": "RECEIPT_PREFERENCES",
                            "items": [
                                {
                                    "result": "PAPER",
                                    "selected": false,
                                    "state": 0
                                },
                                {
                                    "result": "SAVINGS",
                                    "selected": false,
                                    "state": 0
                                },
                                {
                                    "result": "DISPLAY",
                                    "selected": false,
                                    "state": 2
                                }
                            ]
                        }
                    ]
                };

                this.groupData_2 = {
                    "allowConfirmWithoutSelection": false,
                    "minSelection": 2,
                    "maxSelection": 2,
                    "groups": [
                        {
                            "name": "RECEIPT_PREFERENCES",
                            "items": [
                                {
                                    "result": "PAPER",
                                    "selected": false,
                                    "state": 0
                                },
                                {
                                    "result": "SAVINGS",
                                    "selected": false,
                                    "state": 0
                                },
                                {
                                    "result": "DISPLAY",
                                    "selected": true,
                                    "state": 0
                                }
                            ]
                        }
                    ]
                };

                this.atmData_2 = {
                
                };

                done();
            });
            jasmine.clock().install();
        });

        afterEach(() => {
            injector.remove();
            jasmine.clock().uninstall();
        });


        it("checks initItemData", done => {
            injector.require(["GUIAPP/content/viewmodels/CheckBoxesViewModel"], module => {

                const vm = new Wincor.UI.Content.CheckBoxesViewModel();
                vm.setElementTemplate = () => {};
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
                vm.setupVisualLists = () => {
                };
                let items;
                vm.dataList = {items: data => { items = data; }};
                vm.filterEmptyPages = jasmine.createSpy("filterEmptyPages");
                vm.initItemData(this.groupData_1.groups);
    
                expect(vm.filterEmptyPages).toHaveBeenCalledTimes(1);
                expect(items[0].result).toEqual("PAPER");
                expect(typeof items[0].state === "function").toBeTruthy();
                expect(typeof items[0].checked === "function").toBeTruthy();
                expect(typeof items[0].editState === "function").toBeTruthy();
                expect(typeof items[0].validationState === "function").toBeTruthy();
                expect(typeof items[0].label === "function").toBeTruthy();
                expect(items[0].state()).toBe(0);
    
                expect(items[1].result).toEqual("SAVINGS");
                expect(typeof items[1].checked === "function").toBeTruthy();
                
                expect(items[2].result).toEqual("DISPLAY");
                expect(typeof items[2].checked === "function").toBeTruthy();
                expect(items[2].state()).toBe(2);
    
                done();
            }, done.fail);
        });
    
        it("checks handleConfirmState: allowConfirmWithoutSelection=true", done => {
            injector.require(["GUIAPP/content/viewmodels/CheckBoxesViewModel"], async module => {
            
                const vm = new Wincor.UI.Content.CheckBoxesViewModel();
                vm.setElementTemplate = () => {
                };
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
                vm.setupVisualLists = () => {
                };
                let items = [];
                vm.dataList = {
                    items: data => {
                        items = data;
                    }
                };
                vm.filterEmptyPages = jasmine.createSpy("filterEmptyPages");
    
                vm.initItemData(this.groupData_1.groups); // initialize groups first
    
                expect(vm.filterEmptyPages).toHaveBeenCalledTimes(1);
    
                spyOn(vm.cmdRepos, "setActive");
    
                vm.allowConfirmWithoutSelection = true;
                vm.minSelection = -1;
                vm.maxSelection = -1;
                await vm.handleConfirmState();
                expect(vm.cmdRepos.setActive).toHaveBeenCalledWith(["CONFIRM"], true);
                done();
            }, done.fail);
        });
    
        it("checks handleConfirmState: allowConfirmWithoutSelection=false", done => {
            injector.require(["GUIAPP/content/viewmodels/CheckBoxesViewModel"], async module => {
            
                const vm = new Wincor.UI.Content.CheckBoxesViewModel();
                vm.setElementTemplate = () => {
                };
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
                vm.setupVisualLists = () => {
                };
                let items = [];
                vm.dataList = {
                    items: data => {
                        items = data;
                    }
                };
                vm.filterEmptyPages = jasmine.createSpy("filterEmptyPages");
    
                vm.initItemData(this.groupData_1.groups); // initialize groups first
    
                expect(vm.filterEmptyPages).toHaveBeenCalledTimes(1);
                spyOn(vm.cmdRepos, "setActive");
                vm.allowConfirmWithoutSelection = false;
                vm.minSelection = -1;
                vm.maxSelection = -1;
                items[0].selected(false);
                items[1].selected(false);
                await vm.handleConfirmState();
                expect(vm.cmdRepos.setActive).toHaveBeenCalledWith(["CONFIRM"], false);
            
                done();
            }, done.fail);
        });
    
        it("checks handleConfirmState: minSelection & maxSelection", done => {
            injector.require(["GUIAPP/content/viewmodels/CheckBoxesViewModel"], async module => {
            
                const vm = new Wincor.UI.Content.CheckBoxesViewModel();
                vm.setElementTemplate = () => {
                };
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
                vm.setupVisualLists = () => {
                };
                let items = [];
                vm.dataList = {
                    items: data => {
                        items = data;
                    }
                };
                vm.filterEmptyPages = jasmine.createSpy("filterEmptyPages");
                vm.allowConfirmWithoutSelection = false;
                vm.initItemData(this.groupData_1.groups); // initialize groups first
                expect(vm.filterEmptyPages).toHaveBeenCalledTimes(1);
    
                spyOn(vm.cmdRepos, "setActive");
    
                vm.minSelection = 2;
                vm.maxSelection = 2;
                await vm.handleConfirmState();
                expect(vm.cmdRepos.setActive).toHaveBeenCalledWith(["CONFIRM"], false);
    
                vm.cmdRepos.setActive.calls.reset();
                vm.minSelection = 2;
                vm.maxSelection = 2;
                items[0].selected(true);
                items[1].selected(true);
                await vm.handleConfirmState();
                expect(vm.cmdRepos.setActive).toHaveBeenCalledWith(["CONFIRM"], true);
    
                vm.cmdRepos.setActive.calls.reset();
                vm.minSelection = 1;
                vm.maxSelection = 2;
                items[0].selected(true);
                items[1].selected(false);
                await vm.handleConfirmState();
                expect(vm.cmdRepos.setActive).toHaveBeenCalledWith(["CONFIRM"], true);
    
                vm.cmdRepos.setActive.calls.reset();
                vm.minSelection = 1;
                vm.maxSelection = 2;
                items[0].selected(false);
                items[1].selected(false);
                await vm.handleConfirmState();
                expect(vm.cmdRepos.setActive).toHaveBeenCalledWith(["CONFIRM"], false);
    
                // testing wrong settings
                vm.cmdRepos.setActive.calls.reset();
                vm.minSelection = 2;
                vm.maxSelection = 1;
                items[0].selected(false);
                items[1].selected(false);
                await vm.handleConfirmState();
                expect(vm.cmdRepos.setActive).toHaveBeenCalledWith(["CONFIRM"], false);
    
                vm.cmdRepos.setActive.calls.reset();
                vm.minSelection = 2;
                vm.maxSelection = 1;
                items[0].selected(true);
                items[1].selected(true);
                await vm.handleConfirmState();
                expect(vm.cmdRepos.setActive).toHaveBeenCalledWith(["CONFIRM"], false);
    
                done();
            }, done.fail);
        });

        it("calls super in onButtonPressed(CHECKBOX_CMD_PAPER) selected === false", done => {
            injector.require(["GUIAPP/content/viewmodels/CheckBoxesViewModel"], () => {

                const vm = new Wincor.UI.Content.CheckBoxesViewModel();

                vm.setElementTemplate = () => {};
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
                vm.setupVisualLists = () => {
                };
                let items;
                vm.dataList = {items: data => { items = data; }};
                vm.filterEmptyPages = jasmine.createSpy("filterEmptyPages");
                vm.initItemData(this.groupData_2.groups);

                vm.groups = this.groupData_2.groups;
                vm.currentItemSelected(2);
                vm.onButtonPressed("CHECKBOX_CMD_PAPER");

                // observable has to be 0 for selected === false (PAPER is not selected)
                expect(vm.currentItemSelected()).toBe(0);

                done();
            }, done.fail);
        });

        it("calls super in onButtonPressed(CHECKBOX_CMD_DISPLAY) selected === true", done => {
            injector.require(["GUIAPP/content/viewmodels/CheckBoxesViewModel"], () => {

                const vm = new Wincor.UI.Content.CheckBoxesViewModel();

                vm.setElementTemplate = () => {};
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
                vm.setupVisualLists = () => {
                };
                let items;
                vm.dataList = {items: data => { items = data; }};
                vm.filterEmptyPages = jasmine.createSpy("filterEmptyPages");
                vm.initItemData(this.groupData_2.groups);

                vm.groups = this.groupData_2.groups;
                vm.currentItemSelected(2);
                vm.onButtonPressed("CHECKBOX_CMD_DISPLAY");

                // observable has to be 1 for selected === true (DISPLAY is selected)
                expect(vm.currentItemSelected()).toBe(1);

                done();
            }, done.fail);
        });

    });

});

