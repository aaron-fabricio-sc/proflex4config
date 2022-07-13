/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ checkboxes_test.js 4.3.1-201130-21-086c3328-1a04bc7d

*/

define(['lib/Squire'], function(Squire) {

    let injector;
    let ko;
    let Wincor;
    let jQuery;


    describe("checkboxes code-behind", () => {

        beforeEach(done => {
            this.container = {
                adaModule: null,
                dispatch: () => {//empty
                },
                add: () => {//empty
                },
                doInit: () => {//empty
                },
                viewHelper: {
                    viewType: "softkey"
                }
            };

            this.commandMock = {
                commands: {},
                get: (id) => {
                    return commandMock.commands[id];
                },
                registerForAction: () => {//empty
                },
                registerForStateChange: () => {//empty
                }
            };

            this.baseAggregateMock = {
                extend: (a)=>{return a},
                activate: ()=>{//empty
                    return "BASE_CALLED";
                },
                container: this.container,
                config: {
                    viewType: "softkey"
                }
            };

            injector = new Squire();

            injector.require(["NamespaceMock"], bundle => {
                Wincor = window.Wincor = bundle.createWincor();
                ko = Wincor.ko = window.ko = bundle.ko;
                jQuery = window.jQuery = bundle.jQuery;

                const self = this;

                this.VK_VISIBLE = false;

                Wincor.UI.Content.VirtualKeyboardViewModel = class {
                    constructor() {
                        this._fake = true;
                    }

                    isVisible() {
                        return self.VK_VISIBLE;
                    }
                };

                injector
                    .mock("content/viewmodels/base/ViewModelContainer", this.container)
                    .mock("flexuimapping", {
                        buildGuiKey: () => {// stub
                        }
                    })
                    .mock("jquery", jQuery)
                    .mock("extensions", bundle.ext)
                    .mock("knockout", ko)
                    .mock("ui-content", {
                        designMode: Wincor.UI.Content.designMode
                    })
                    .mock("vm-container", this.container)
                    .mock("code-behind/baseaggregate", this.baseAggregateMock)
                    .mock("vm/CheckBoxesViewModel", {})
                    .mock("vm-util/VirtualKeyboardViewModel", Wincor.UI.Content.VirtualKeyboardViewModel)
                    .mock("vm-util/UICommanding", this.commandMock);

                this.ITEMS = [];
                // Code behind needs something to instantiate...
                Wincor.UI.Content.CheckBoxesViewModel = jasmine.createSpy()
                    .and.callFake(function() {
                        this.TEST="";
                        this.handleConfirmState = jasmine.createSpy("VK::handleConfirmState");
                        this.getItems = jasmine.createSpy("VK::getItems").and.callFake(() => {
                            return self.ITEMS;
                        });
                    });
                done();
            });
        });

        afterEach(() => {
            injector.remove();
        });

        // code behind differs between softkey and touch...
        ["softkey", "touch"].forEach((viewType) => {
            describe(` (${viewType}) `, () => {

                beforeEach(() => {
                    this.baseAggregateMock.config.viewType = viewType;
                    this.baseAggregateMock.container.viewHelper = {
                        viewType: viewType
                    };
                });

                afterEach(() => {
                    this.baseAggregateMock.config.viewType = "softkey";
                    this.baseAggregateMock.container.viewHelper = {
                        viewType: "softkey"
                    };
                });

                it(`activation returns the object when required`, done => {
                    injector.require(["GUIAPP/content/views/script/checkboxes"], boxes => {
                        expect(typeof boxes).toBe("object");
                        done();
                    }, done.fail);
                });

                it(`activation adds main viewmodel and vk and calls doInit on Container`, done => {
                    injector.require(["GUIAPP/content/views/script/checkboxes"], boxes => {
                        spyOn(this.container, "add");
                        spyOn(this.baseAggregateMock, "activate").and.callThrough();// to be able to check rc of base has been returned

                        expect(boxes.activate()).toBe("BASE_CALLED");
                        expect(Wincor.UI.Content.CheckBoxesViewModel).toHaveBeenCalledTimes(1);
                        expect(this.container.add).toHaveBeenCalled();
                        expect(this.baseAggregateMock.activate).toHaveBeenCalledTimes(1);
                        expect(this.container.add.calls.first().args[0] instanceof Object).toBe(true);
                        if (viewType === "softkey") {
                            expect(this.container.add.calls.first().args[1]).toEqual(["flexMain", {visibleLimits: {max: 8}}]);
                        } else {
                            expect(this.container.add.calls.first().args[1]).toEqual(["flexMain", void 0]);
                        }
                        done();
                    }, done.fail);
                });

                it(`composition complete updates view accordingly`, done => {
                    this.baseAggregateMock.content = {designMode: false};
                    this.baseAggregateMock.compositionComplete = jasmine.createSpy("baseAggregateMock.compositionComplete");
                    this.baseAggregateMock.jQuery = jasmine.createSpy("baseAggregateMock.jQuery").and.returnValue([]);
                    this.baseAggregateMock.container.viewHelper.moveSlideIndicator = jasmine.createSpy("baseAggregateMock.moveSlideIndicator").and.returnValue([]);
                    this.baseAggregateMock.container.whenActivated = jasmine.createSpy("baseAggregateMock.whenActivated")
                        .and.callFake(() => {
                            return {
                                then: (fx) => {
                                    fx();
                                }
                            }
                        });
                    injector.require(["GUIAPP/content/views/script/checkboxes"], boxes => {
                        spyOn(this.baseAggregateMock, "activate").and.callThrough();// to be able to check rc of base has been returned

                        const VIEW = {stuff: "THE_VIEW"};
                        const PARENT = {stuff: "THE_PARENT"};

                        boxes.compositionComplete(VIEW, PARENT);
                        expect(this.baseAggregateMock.compositionComplete).toHaveBeenCalled();
                        expect(this.baseAggregateMock.compositionComplete).toHaveBeenCalledWith(VIEW, PARENT);
                        if (viewType === "softkey") {
                            expect(this.baseAggregateMock.container.viewHelper.moveSlideIndicator).toHaveBeenCalled();
                        } else {
                            expect(this.baseAggregateMock.container.viewHelper.moveSlideIndicator).not.toHaveBeenCalled();
                        }
                        done();
                    }, done.fail);
                });

            });
    
            it(`composition complete registers for language change event`, done => {
                this.baseAggregateMock.content = {designMode: false};
                this.baseAggregateMock.compositionComplete = jasmine.createSpy("baseAggregateMock.compositionComplete");
                this.baseAggregateMock.jQuery = jasmine.createSpy("baseAggregateMock.jQuery").and.returnValue([]);
                this.baseAggregateMock.container.viewHelper.moveSlideIndicator = jasmine.createSpy("baseAggregateMock.moveSlideIndicator").and.returnValue([]);
                this.baseAggregateMock.container.whenActivated = jasmine.createSpy("baseAggregateMock.whenActivated")
                    .and.callFake(() => {
                        return {
                            then: (fx) => {
                                fx();
                            }
                        }
                    });
                injector.require(["GUIAPP/content/views/script/checkboxes"], boxes => {
                    jasmine.clock().install();
                    spyOn(this.baseAggregateMock, "activate").and.callThrough();// to be able to check rc of base has been returned
            
                    const VIEW = {stuff: "THE_VIEW"};
                    const PARENT = {stuff: "THE_PARENT"};
                    Wincor.UI.Content.ObjectManager = {
                        reCalculateObjects: jasmine.createSpy("reCalculateObjects")
                    };
                    spyOn(Wincor.UI.Service.Provider.LocalizeService, "registerForServiceEvent").and.callFake((evtId, cb, trigger)  => {
                        cb();
                    });
                    boxes.compositionComplete(VIEW, PARENT);
                    jasmine.clock().tick(101);
    
                    expect(Wincor.UI.Content.ObjectManager.reCalculateObjects).toHaveBeenCalledTimes(1);
                    expect(this.baseAggregateMock.compositionComplete).toHaveBeenCalled();
                    expect(this.baseAggregateMock.compositionComplete).toHaveBeenCalledWith(VIEW, PARENT);
                    jasmine.clock().uninstall();
                    done();
                }, done.fail);
            });
    
            it(`hides error message if all items valid`, done => {
                this.baseAggregateMock.compositionComplete = jasmine.createSpy("baseAggregateMock.compositionComplete");
                this.baseAggregateMock.jQuery = jasmine.createSpy("baseAggregateMock.jQuery").and.returnValue([]);
                this.baseAggregateMock.container.viewHelper.moveSlideIndicator = jasmine.createSpy("baseAggregateMock.moveSlideIndicator").and.returnValue([]);
                this.baseAggregateMock.container.whenActivated = jasmine.createSpy("baseAggregateMock.whenActivated")
                    .and.callFake(() => {
                        return {
                            then: (fx) => {
                                fx();
                            }
                        }
                    });
                injector.require(["GUIAPP/content/views/script/checkboxes"], boxes => {
                    spyOn(this.baseAggregateMock, "activate").and.callThrough();// to be able to check rc of base has been returned

                    const VIEW = {stuff: "THE_VIEW"};
                    const PARENT = {stuff: "THE_PARENT"};

                    const ITEM = {
                        validationState: () => "valid"
                    };

                    this.baseAggregateMock.container.sendViewModelEvent = jasmine.createSpy("baseAggregateMock.sendViewModelEvent")
                        .and.callFake((evt, data) => {
                            expect(data.messageText).toBe("");
                            done();
                        });
                    boxes.activate();
                    boxes.showErrorMessage(ITEM);
                }, done.fail);
            });

            it(`hides error message if current invalid item validates via VK`, done => {
                this.ITEMS = [{}];
                this.VK_VISIBLE = true;
                this.baseAggregateMock.compositionComplete = jasmine.createSpy("baseAggregateMock.compositionComplete");
                this.baseAggregateMock.jQuery = jasmine.createSpy("baseAggregateMock.jQuery").and.returnValue([]);
                this.baseAggregateMock.container.viewHelper.moveSlideIndicator = jasmine.createSpy("baseAggregateMock.moveSlideIndicator").and.returnValue([]);
                jasmine.clock().install();
                injector.require(["GUIAPP/content/views/script/checkboxes"], boxes => {
                    spyOn(this.baseAggregateMock, "activate").and.callThrough();// to be able to check rc of base has been returned

                    const ITEM = {
                        validationState: () => "valid"
                    };

                    this.baseAggregateMock.container.sendViewModelEvent = jasmine.createSpy("baseAggregateMock.sendViewModelEvent");
                    boxes.activate();
                    boxes.showErrorMessage(ITEM);
                    jasmine.clock().tick(200)
                    expect(this.baseAggregateMock.container.sendViewModelEvent).toHaveBeenCalledWith(void 0, {messageText: "", messageLevel: ""});
                    jasmine.clock().uninstall();
                    done();
                }, done.fail);
            });

            it(`does not hide error message if current invalid item is there but VK is hidden`, done => {
                this.ITEMS = [{}];
                this.VK_VISIBLE = false;
                this.baseAggregateMock.compositionComplete = jasmine.createSpy("baseAggregateMock.compositionComplete");
                this.baseAggregateMock.jQuery = jasmine.createSpy("baseAggregateMock.jQuery").and.returnValue([]);
                this.baseAggregateMock.container.viewHelper.moveSlideIndicator = jasmine.createSpy("baseAggregateMock.moveSlideIndicator").and.returnValue([]);
                jasmine.clock().install();
                injector.require(["GUIAPP/content/views/script/checkboxes"], boxes => {
                    spyOn(this.baseAggregateMock, "activate").and.callThrough();// to be able to check rc of base has been returned

                    const ITEM = {
                        validationState: () => "valid"
                    };

                    this.baseAggregateMock.container.sendViewModelEvent = jasmine.createSpy("baseAggregateMock.sendViewModelEvent");
                    boxes.activate();
                    boxes.showErrorMessage(ITEM);
                    jasmine.clock().tick(200);
                    expect(this.baseAggregateMock.container.sendViewModelEvent).not.toHaveBeenCalled();
                    jasmine.clock().uninstall();
                    done();
                }, done.fail);
            });
        });
    });
});

