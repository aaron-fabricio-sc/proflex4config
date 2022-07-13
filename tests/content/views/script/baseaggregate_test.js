/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ baseaggregate_test.js 4.3.1-210108-21-173923a2-1a04bc7d

*/

define(['lib/Squire'], function(Squire) {

    let injector;
    let ko;
    let Wincor;
    let jQuery;


    const container = {
        adaModule: null,
        dispatch: () => {//empty
        },
        add: () => {//empty
        },
        doInit: () => {//empty
        }
    };

    const commandMock = {
        commands: {},
        get: (id) => {
            return commandMock.commands[id];
        },
        registerForAction: () => {//empty
        },
        registerForStateChange: () => {//empty
        }
    };

    describe("baseaggregate", () => {

        beforeEach(done => {
            injector = new Squire();
            this.CONFIG = {};
            this.PROMISE = {Promises: {}};
            injector.require(["NamespaceMock"], bundle => {
                Wincor = window.Wincor = bundle.createWincor();
                ko = Wincor.ko = window.ko = bundle.ko;
                jQuery = window.jQuery = bundle.jQuery;
                [
                    'durandal/system',
                    'durandal/composition',
                    'plugins/router',
                    'ui-content',
                    'knockout'
                ].forEach(module => {
                    injector
                        .store(module)
                        .mock(module, {});
                });
                injector
                    .mock("jquery", jQuery)
                    .mock("extensions", bundle.ext)
                    .mock("knockout", ko)
                    .store('vm-util/UICommanding')
                    .mock('vm-util/UICommanding', Wincor.UI.Content.Commanding);
                injector
                    .store("vm-container")
                    .mock("vm-container", Wincor.UI.Content.ViewModelContainer);
                injector
                    .mock("config/Config", this.CONFIG);
                // injector
                //     .mock("extensions", this.PROMISE);
                Wincor.UI.Service.Provider.ConfigService.configuration.GUIAPP = {
                    TimeoutActivate: 20000
                };
                done();
            });
        });

        afterEach(() => {
            injector.remove();
        });

        describe("activate", () => {
            it("initiates vmContainer.doInit", done => {
                injector.require(["GUIAPP/content/views/script/baseaggregate", "mocks"], (ba, mocks) => {
                    const RESULT = "RESULT";
                    mocks.store["vm-container"].doInit = jasmine.createSpy().and.callFake(name => {
                        return RESULT;
                    });
                    let res = ba.activate();
                    expect(mocks.store["vm-container"].doInit).toHaveBeenCalledWith("baseaggregate");
                    expect(res).toBe(RESULT);
                    done();
                }, done.fail);
            });
        });

        describe("canDeactivate", () => {
            it("resets footer observables if appropriate", done => {
                const VM = {
                    activeCancel: jasmine.createSpy("activeCancel"),
                    activeExtra: jasmine.createSpy("activeExtra")
                };
                Object.assign(this.CONFIG,{
                    VIEW_ANIMATIONS_ON: true,
                    BORDER_DRAWING_ON: true,
                    FOOTER_ANIMATIONS_ON: true
                });
                this.PROMISE.Promises.promise = jasmine.createSpy("promise").and.callFake(resolver => {
                    resolver(() => {
                    });
                });
                injector.require(["GUIAPP/content/views/script/baseaggregate", "mocks"], (ba, mocks) => {
                    ba.__dialog__ = {};
                    const container = mocks.store["vm-container"];
                    jQuery["fn"]["transition"] = jasmine.createSpy("transition")
                        .and.callFake((data, time, cb) => {
                            cb();
                            // this is the actual test for wrong this context we had in an issue
                            // if ba.__DIALOG__ is set, resetFooterObservables should not be called after cb()!
                            // we can check by
                            expect(mocks.store["vm-container"].getById).not.toHaveBeenCalled();
                            done();
                        });
                    container.getById = jasmine.createSpy("getById").and.callFake(name => {
                        return VM;
                    });
                    container.getRestorationState = jasmine.createSpy("getRestorationState").and.callFake(name => {
                        return "NONE";
                    });
                    container.viewModelHelper  = {
                        isPopupActive: () => {return false}
                    };

                    ba.canDeactivate();
                }, done.fail);
            });
        });

        describe("attached", () => {
            it("life-cycle order number 8", done => {
                injector.require(["GUIAPP/content/views/script/baseaggregate", "mocks"], (ba, mocks) => {
                    const VIEW_KEY = "MyViewKey";
                    const container = mocks.store["vm-container"];
                    container.currentViewKey = VIEW_KEY;
                    container.viewHelper = {
                        updateViewKey: jasmine.createSpy("updateViewKey")
                    };
                    ba.attached();
                    expect(container.viewHelper.updateViewKey).toHaveBeenCalledWith(VIEW_KEY);
                    done();
                }, done.fail);
            });
        });
        
        describe("bindingComplete & compositionComplete", () => {
            it("calls borderDrawing.prepare while bindingComplete", done => {
                Object.assign(this.CONFIG, {
                    VIEW_ANIMATIONS_ON: true,
                    BORDER_DRAWING_ON: true,
                    FOOTER_ANIMATIONS_ON: true
                });
                this.PROMISE.Promises.promise = jasmine.createSpy("promise").and.callFake(resolver => {
                    resolver(() => {
                    });
                });
                injector.require(["GUIAPP/content/views/script/baseaggregate", "mocks"], (ba, mocks) => {
                    ba.__dialog__ = {};
                    const container = mocks.store["vm-container"];
                    container.viewHelper = {
                        borderDrawing: { prepare: jasmine.createSpy("prepare") }
                    };
                    ba.bindingComplete();
                    expect(container.viewHelper.borderDrawing.prepare).toHaveBeenCalled();
                    done();
                    
                }, done.fail);
            });
    
            it("calls borderDrawing.draw while compositionComplete", done => {
                Object.assign(this.CONFIG, {
                    VIEW_ANIMATIONS_ON: true,
                    BORDER_DRAWING_ON: true,
                    FOOTER_ANIMATIONS_ON: true
                });
                this.PROMISE.Promises.promise = jasmine.createSpy("promise").and.callFake(resolver => {
                    resolver(() => {
                    });
                });
                injector.require(["GUIAPP/content/views/script/baseaggregate", "mocks"], (ba, mocks) => {
                    ba.__dialog__ = {};
                    const container = mocks.store["vm-container"];
                    container.viewHelper = {
                        borderDrawing: {draw: jasmine.createSpy("draw")}
                    };
                    container.compositionComplete = jasmine.createSpy("compositionComplete");
                    ba.compositionComplete();
                    expect(container.compositionComplete).toHaveBeenCalled();
                    expect(container.viewHelper.borderDrawing.draw).toHaveBeenCalled();
                    done();
            
                }, done.fail);
            });
    
        });
    
        describe("compositionUpdated", () => {
            it("calls borderDrawing.prepare/draw while compositionUpdated", done => {
                Object.assign(this.CONFIG, {
                    VIEW_ANIMATIONS_ON: true,
                    BORDER_DRAWING_ON: true,
                    FOOTER_ANIMATIONS_ON: true
                });
                this.PROMISE.Promises.promise = jasmine.createSpy("promise").and.callFake(resolver => {
                    resolver(() => {
                    });
                });
                injector.require(["GUIAPP/content/views/script/baseaggregate", "mocks"], (ba, mocks) => {
                    ba.__dialog__ = {};
                    const container = mocks.store["vm-container"];
                    container.viewHelper = {
                        borderDrawing: {
                            prepare: jasmine.createSpy("prepare"),
                            draw: jasmine.createSpy("draw")
                        }
                    };
                    ba.compositionUpdated();
                    expect(container.viewHelper.borderDrawing.prepare).toHaveBeenCalled();
                    expect(container.viewHelper.borderDrawing.draw).toHaveBeenCalled();
                    done();
                
                }, done.fail);
            });
    
        });
    });
});

