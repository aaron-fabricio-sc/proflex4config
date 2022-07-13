/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ ViewModelContainer_test.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

define(['lib/Squire'], function(Squire) {

    let injector;
    let ko;
    let Wincor;
    let jQuery;


    describe("ViewModelContainer", () => {

        beforeEach(done => {
            injector = new Squire();
            injector.require(["NamespaceMock"], bundle => {
                Wincor = window.Wincor = bundle.createWincor();
                ko = Wincor.ko = window.ko = bundle.ko;
                jQuery = window.jQuery = bundle.jQuery;

                injector
                    .mock("jquery", jQuery)
                    .mock("knockout", ko)
                    .mock("extensions", bundle.ext)
                    .mock("ui-content", Wincor.UI.Content)
                    .mock("lib/hammer.min", this.Hammer)
                    .mock("flexuimapping", {
                        setViewModelContainer: Wincor.returnValue()
                    })
                    .mock("vm-util/UIMovements", {
                        triggerUpdate: jasmine.createSpy("triggerUpdate")
                    })
                    .mock("durandal/system", {})
                    .mock("code-behind/ViewHelper", {})
                    .mock("plugins/router", {
                        activeItem: jasmine.createSpy("activeItem").and.returnValue({
                            activeItem: {}
                        }),
                        trigger: jasmine.createSpy("trigger")
                    })
                    .mock("vm-util/UICommanding", Wincor.UI.Content.Commanding);
                done();
            });
        });

        afterEach(() => {
            injector.remove();
        });

        describe("lifecycle function", () => {
            it("binding can distinguish the current viewmodels ", done => {
                // How this test works:
                // We want to verify that the correct viewModel's __initializedTextAndData getter is called directly before it's onInitTextAndData function!
                // This test has been implemented due to an error, where the wrong vm instance's __initializedTextAndData has been checked to start another instance's initTextAndData
                // define some fake viewmodels for the container
                // first is the one with matching observableAreaId "test1", others are different ones
                const VM1 = {
                    viewModel: {
                        initializedTextAndData: false,
                        observableAreaId: "test1",
                        applyBindings: jasmine.createSpy("VM1::applyBindings").and.returnValue(Promise.resolve()),
                        initTextAndData: jasmine.createSpy("VM1::initTextAndData").and.returnValue(Promise.resolve())
                    }
                };
                Object.defineProperty(VM1.viewModel, "__initializedTextAndData", {
                    get: ()=>VM1.viewModel.initializedTextAndData,
                    set: val => {VM1.viewModel.initializedTextAndData=val;},
                    configurable: true
                });
                const propSpyVM1 = spyOnProperty(VM1.viewModel, "__initializedTextAndData").and.callThrough();

                const VM2 = {
                    viewModel: {
                        __initializedTextAndData: false,
                        observableAreaId: "test2",
                        applyBindings: jasmine.createSpy("VM2::applyBindings").and.returnValue(Promise.resolve()),
                        initTextAndData: jasmine.createSpy("VM2::initTextAndData").and.returnValue(Promise.resolve())
                    }
                };

                const VM3 = {
                    viewModel: {
                        __initializedTextAndData: false,
                        observableAreaId: "test3",
                        applyBindings: jasmine.createSpy("VM3::applyBindings").and.returnValue(Promise.resolve()),
                        initTextAndData: jasmine.createSpy("VM3::initTextAndData").and.returnValue(Promise.resolve())
                    }
                };

                // extensions are not mocked normally... we store it with squire and manipulate the "promise" function with a spy before calling "doBind"
                injector.store('extensions')
                    .require(['GUIAPP/content/viewmodels/base/ViewModelContainer', 'mocks'], (container, mocks) => {
                        // set viewModels
                        container.viewModels = [VM1, VM2, VM3];
                        container.startup = false;
                        spyOn(container, "canParticipateOnLifeCycle").and.returnValue(true);
                        const fakePromise = {
                            resolve: ()=>{},
                            reject: ()=>{}
                        };
                        spyOn(mocks.store.extensions.Promises, "promise").and
                            .callFake(executor => {
                                // prepare waitForCall to the resolver
                                let p = Wincor.waitForCall(fakePromise, "resolve");
                                executor(fakePromise.resolve, fakePromise.reject);
                                p.then(() => {
                                    expect(VM1.viewModel.applyBindings).toHaveBeenCalledTimes(1);
                                    expect(VM2.viewModel.applyBindings).not.toHaveBeenCalled();
                                    expect(VM3.viewModel.applyBindings).not.toHaveBeenCalled();
                                    expect(VM1.viewModel.initTextAndData).toHaveBeenCalledTimes(1);
                                    expect(VM2.viewModel.initTextAndData).toHaveBeenCalledTimes(1);
                                    expect(VM3.viewModel.initTextAndData).toHaveBeenCalledTimes(1);
                                    // a previous error within the doBind function has called a different viewModel's '__initializedTextAndData' getter...
                                    expect(propSpyVM1).toHaveBeenCalledBefore(VM1.viewModel.initTextAndData);
                                    done();
                                }).catch(done.fail);
                            });

                        // all is prepared, initiate test
                        container.doBind({
                            id: "test1"
                        });
                    });
            });
            
            it("compositionComplete", async() => {
                let [container] = await injector.require(["GUIAPP/content/viewmodels/base/ViewModelContainer"]);
                container.viewHelper.updateViewKey = jasmine.createSpy("updateViewKey");
                container.compositionComplete();
                expect(container.viewHelper.updateViewKey).not.toHaveBeenCalled();
            });
        });
        
        describe("refresh view", () => {
            it("and ensure initTextAndData main promises are resolved before container.initialize", async() => {
                let [container] = await injector.require(["GUIAPP/content/viewmodels/base/ViewModelContainer"]);
                container.viewModelHelper = Wincor.UI.Content.ViewModelHelper;
                container.viewHelper.updateViewKey = () => {};
                spyOn(container, "deactivate").and.returnValue(Promise.resolve());
                spyOn(container, "doInit").and.returnValue(Promise.resolve());
                spyOn(container, "resetViewStates");
                spyOn(container, "canParticipateOnLifeCycle").and.returnValue(true);
                let initialize = spyOn(container, "initialize").and.returnValue(Promise.resolve());
                let isMainPromiseResolved_1 = false;
                let isMainPromiseResolved_2 = false;
                const MAIN_PROMISE_1 = new Promise(resolve => {
                    // make it async in order that the flag -isMainPromiseResolved_1 isn't set immediately
                    setTimeout(() => {
                        isMainPromiseResolved_1 = true;
                        resolve();
                    }, 1);
                });
                const MAIN_PROMISE_2 = new Promise(resolve => {
                    // make it async in order that the flag -isMainPromiseResolved_1 isn't set immediately
                    setTimeout(() => {
                        isMainPromiseResolved_2 = true;
                        resolve();
                    }, 2);
                });

                const VM_OBJ_1 = {
                    viewModel: {
                        __bindingsApplied: true,
                        __initializedTextAndData: false,
                        initTextAndData: jasmine.createSpy("initTextAndData").and.callFake(async() => {
                            return MAIN_PROMISE_1;
                        })
                    }
                };
                const VM_OBJ_2 = {
                    viewModel: {
                        __bindingsApplied: true,
                        __initializedTextAndData: false,
                        initTextAndData: jasmine.createSpy("initTextAndData").and.callFake(async() => {
                            return MAIN_PROMISE_2;
                        })
                    }
                };
                container.viewModels = [VM_OBJ_1, VM_OBJ_2];
                await container.refresh();
                expect(isMainPromiseResolved_1).toBe(true);
                expect(isMainPromiseResolved_2).toBe(true);
                expect(container.deactivate).toHaveBeenCalledTimes(1);
                expect(container.resetViewStates).toHaveBeenCalledTimes(1);
                expect(container.doInit).toHaveBeenCalledWith("refresh");
                expect(VM_OBJ_1.viewModel.initTextAndData).toHaveBeenCalledTimes(1);
                expect(VM_OBJ_1.viewModel.initTextAndData).toHaveBeenCalledBefore(initialize);
                expect(VM_OBJ_2.viewModel.initTextAndData).toHaveBeenCalledTimes(1);
                expect(VM_OBJ_2.viewModel.initTextAndData).toHaveBeenCalledBefore(initialize);
                expect(initialize).toHaveBeenCalledTimes(1);
            });
            
            it("and ensure initTextAndData rejected main promises are caught", async() => {
                let [container] = await injector.require(["GUIAPP/content/viewmodels/base/ViewModelContainer"]);
                container.viewModelHelper = Wincor.UI.Content.ViewModelHelper;
                container.viewHelper.updateViewKey = () => {};
                spyOn(container, "deactivate").and.returnValue(Promise.resolve());
                spyOn(container, "doInit").and.returnValue(Promise.resolve());
                spyOn(container, "resetViewStates");
                spyOn(container, "canParticipateOnLifeCycle").and.returnValue(true);
                spyOn(Wincor.UI.Diagnostics.LogProvider, "error").and.callThrough();
                let initialize = spyOn(container, "initialize").and.returnValue(Promise.resolve());
                const MAIN_PROMISE_1 = new Promise((resolve, reject) => {
                    setTimeout(() => {
                        reject("rejected");
                    }, 1);
                });
                const VM_OBJ_1 = {
                    viewModel: {
                        __bindingsApplied: true,
                        __initializedTextAndData: false,
                        initTextAndData: jasmine.createSpy("initTextAndData").and.callFake(async() => {
                            return MAIN_PROMISE_1;
                        })
                    }
                };
                container.viewModels = [VM_OBJ_1];
                await container.refresh();
                MAIN_PROMISE_1.catch(cause => {
                    expect(cause).toBe("rejected");
                });
                expect(Wincor.UI.Diagnostics.LogProvider.error).toHaveBeenCalledWith("ViewModelContainer::refresh failed: rejected");
                expect(container.deactivate).toHaveBeenCalledTimes(1);
                expect(container.resetViewStates).toHaveBeenCalledTimes(1);
                expect(container.doInit).toHaveBeenCalledWith("refresh");
                expect(VM_OBJ_1.viewModel.initTextAndData).toHaveBeenCalledTimes(1);
                expect(initialize).not.toHaveBeenCalled();
            });
            
        });

        describe("receiving ViewService SERVICE_EVENT", () => {

            it("SUSPEND suspends all commands without releasing epp claims", done => {
                // spies for NamespaceMock and additional funcs of NamespaceMock have to be spied on before container requires them
                let SUSPEND_RESULT = {
                    "UNIT_TEST": true
                };
                spyOn(Wincor.UI.Service.Provider.ViewService, "registerForServiceEvent")
                    .and.callFake((serviceEventName, callback) => {
                        if (serviceEventName === "SUSPEND") {
                            callback(); // this is simulating the ViewService::SERVICE_EVENTS#SUSPEND event firing
                            expect(this.container.suspendedCommands).toBe(SUSPEND_RESULT);
                            expect(Wincor.UI.Content.Commanding.suspend).toHaveBeenCalledTimes(1);
                            // now check arguments... cmds, id, releaseKeys - where releaseKeys has to be false
                            expect(Wincor.UI.Content.Commanding.suspend).toHaveBeenCalledWith([], "vmc:deact", false);
                            expect(Wincor.UI.Content.ViewModelHelper.clearTimer).toHaveBeenCalledTimes(1);
                            done();
                        }
                    });

                Wincor.UI.Content.Commanding.suspend = jasmine.createSpy("Commanding::suspend")
                    .and.returnValue(SUSPEND_RESULT);

                // now require main test module and go
                injector.require(['GUIAPP/content/viewmodels/base/ViewModelContainer'], container => {
                    this.container = container; // make container available for upper tests
                    Wincor.UI.Content.ViewModelHelper.clearTimer = jasmine.createSpy("clearTimer");
                    container.viewModelHelper = Wincor.UI.Content.ViewModelHelper;
                    container.prepareView().catch(e => {
                        // ignore
                    });
                    // finishing test with 'done()' is done in upper spy
                });
            });

            it("VIEW_USERINTERACTION_TIMEOUT processes timeoutQuestion popup if configured", done => {
                Wincor.UI.Service.Provider.ViewService.viewContext = {
                    viewConfig: {
                        popup: {
                            ontimeout: true
                        }
                    }
                };
                spyOn(Wincor.UI.Service.Provider.ViewService, "registerForServiceEvent")
                    .and.callFake((serviceEventName, callback) => {
                        if (serviceEventName === "VIEW_USERINTERACTION_TIMEOUT") {
                            callback(); // this is simulating the ViewService::SERVICE_EVENTS#VIEW_USERINTERACTION_TIMEOUT event firing
                            expect(Wincor.UI.Content.ViewModelHelper.timeoutQuestion).toHaveBeenCalledTimes(1);
                            expect(this.container.dispatch).not.toHaveBeenCalled();
                            done();
                        }
                    });

                // now require main test module and go
                injector.require(['GUIAPP/content/viewmodels/base/ViewModelContainer'], container => {
                    this.container = container; // make container available for upper tests
                    Wincor.UI.Content.ViewModelHelper.timeoutQuestion = jasmine.createSpy("ViewModelContainer::timeoutQuestion");
                    container.viewModelHelper = Wincor.UI.Content.ViewModelHelper;
                    spyOn(container, "dispatch");
                    container.prepareView().catch(e => {
                        // ignore
                    });
                    // finishing test with 'done()' is done in upper spy
                });
            });

            it("VIEW_USERINTERACTION_TIMEOUT denies timeoutQuestion popup if configured", done => {
                Wincor.UI.Service.Provider.ViewService.viewContext = {
                    viewConfig: {
                        popup: {
                            ontimeout: false
                        }
                    }
                };
                spyOn(Wincor.UI.Service.Provider.ViewService, "registerForServiceEvent")
                    .and.callFake((serviceEventName, callback) => {
                        if (serviceEventName === "VIEW_USERINTERACTION_TIMEOUT") {
                            callback(); // this is simulating the ViewService::SERVICE_EVENTS#VIEW_USERINTERACTION_TIMEOUT event firing
                            expect(Wincor.UI.Content.ViewModelHelper.timeoutQuestion).not.toHaveBeenCalled();
                            expect(this.container.dispatch).toHaveBeenCalledTimes(1);
                            done();
                        }
                    });

                // now require main test module and go
                injector.require(['GUIAPP/content/viewmodels/base/ViewModelContainer'], container => {
                    this.container = container; // make container available for upper tests
                    Wincor.UI.Content.ViewModelHelper.timeoutQuestion = jasmine.createSpy("ViewModelContainer::timeoutQuestion");
                    container.viewModelHelper = Wincor.UI.Content.ViewModelHelper;
                    spyOn(container, "dispatch");
                    container.prepareView().catch(e => {
                        // ignore
                    });
                    // finishing test with 'done()' is done in upper spy
                });
            });

            it("TURN_ACTIVE activates the view", done => {
                Wincor.UI.Service.Provider.ViewService.viewContext = {
                    viewConfig: {
                        popup: {
                            ontimeout: false
                        }
                    }
                };
                spyOn(Wincor.UI.Service.Provider.ViewService, "fireActivated");
                spyOn(Wincor.UI.Service.Provider.ViewService, "registerForServiceEvent")
                    .and.callFake((serviceEventName, callback) => {
                        if (serviceEventName === "TURN_ACTIVE") {
                            expect(this.container.activationStartedDfd.promise.isFulfilled()).toBe(false);
                            callback(); // this is simulating the ViewService::SERVICE_EVENTS#VIEW_USERINTERACTION_TIMEOUT event firing
                            expect(this.container.activationStartedDfd.promise.isFulfilled()).toBe(true);
                            expect(this.container.resume).toHaveBeenCalledTimes(1);
                            expect(this.container.dispatch).toHaveBeenCalledTimes(1);
                            // targetFx below should have been called already
                            expect(Wincor.UI.Service.Provider.ViewService.fireActivated).toHaveBeenCalledTimes(1);
                            done();
                        }
                    });

                // now require main test module and go
                injector.require(['GUIAPP/content/viewmodels/base/ViewModelContainer'], container => {
                    this.container = container; // make container available for upper tests
                    Wincor.UI.Content.ViewModelHelper.timeoutQuestion = jasmine.createSpy("ViewModelContainer::timeoutQuestion");
                    container.viewModelHelper = Wincor.UI.Content.ViewModelHelper;
                    spyOn(container, "resume");
                    spyOn(container, "dispatch");
                    container.whenActivated = () => {
                        return {
                            then: targetFx => {
                                expect(typeof targetFx).toBe("function");
                                targetFx(); // this is the internal function of container that is called on "whenActivated"
                                return {
                                    catch: () => {}
                                };
                            }
                        };
                    };
                    container.prepareView().catch(e => {
                        // ignore
                    });
                    // finishing test with 'done()' is done in upper spy
                });
            });
        });
    });
});