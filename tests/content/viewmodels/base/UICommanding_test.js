/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ UICommanding_test.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

define(['lib/Squire'], function(Squire) {

    let injector;
    let ko;
    let Wincor;

    describe("UICommanding", () => {

        beforeEach(done => {
            injector = new Squire();
            injector.require(["NamespaceMock"], bundle => {
                this.Hammer_add = jasmine.createSpy("Hammer::Manager::add");
                this.Hammer_on = jasmine.createSpy("Hammer::Manager::on");
                this.Hammer_off = jasmine.createSpy("Hammer::Manager::off");
                this.Hammer_stop = jasmine.createSpy("Hammer::Manager::stop");
                this.Hammer_destroy = jasmine.createSpy("Hammer::Manager::destroy");
                this.Hammer_remove = jasmine.createSpy("Hammer::Manager::remove");
                this.Hammer_get = jasmine.createSpy("Hammer::Manager::get");
                this.Hammer_recognizers = [];
                const testContext = this;
                this.Hammer = {
                    options: {},
                    DIRECTION_NONE: 1,
                    DIRECTION_LEFT: 2,
                    DIRECTION_RIGHT: 4,
                    DIRECTION_UP: 8,
                    DIRECTION_DOWN: 16,

                    DIRECTION_HORIZONTAL: 2 | 4,
                    DIRECTION_VERTICAL: 8 | 16,
                    DIRECTION_ALL: 24 | 6,

                    Manager: function() {
                        this.add = testContext.Hammer_add;
                        this.on = testContext.Hammer_on;
                        this.off = testContext.Hammer_off;
                        this.destroy = testContext.Hammer_destroy;
                        this.remove = testContext.Hammer_remove;
                        this.get = testContext.Hammer_get;
                        this.recognizers = testContext.Hammer_recognizers;
                        this.stop = testContext.Hammer_stop;
                    },
                    Tap: function() {

                    },
                    Pan: function() {

                    }
                };

                Wincor = window.Wincor = bundle.createWincor();
                ko = Wincor.ko = window.ko = bundle.ko;
    
                injector
                    .mock("ui-content", Wincor.UI.Content)
                    .mock("vm-container", Wincor.UI.Content.ViewModelContainer)
                    .mock("vm-util/ViewModelHelper", {
                        "convertByExponent": () => {
                        }})
                    .mock("lib/hammer.min", {})
                    .mock("vm/ListViewModel", Wincor.UI.Content.BaseViewModel)
                    .mock("config/Config", {viewType: "softkey"})
                    .mock("knockout", Wincor.ko);
                done();
            });
            jasmine.clock().install();
        });

        afterEach(() => {
            injector.remove();
            jasmine.clock().uninstall();
        });
    
        describe("viewstate checks", () => {
            it("checks a command's viewState.update with observable", async () => {
                await injector.require(["GUIAPP/content/viewmodels/base/UICommanding"]);
                const com = Wincor.UI.Content.Commanding;
                const cmd = com.createCommand("TEST_CMD");
                cmd.viewState.value = ko.observable(2);
                cmd.viewState.update(0);
                expect(cmd.viewState.value()).toBe(0);
            });
    
            it("checks a command's viewState.update with computed", async () => {
                await injector.require(["GUIAPP/content/viewmodels/base/UICommanding"]);
                const com = Wincor.UI.Content.Commanding;
                const cmd = com.createCommand("TEST_CMD");

                let obs1 = ko.observable(3);
                spyOn(obs1, "valueHasMutated").and.callThrough();
                cmd.viewState.value = ko.computed(() => {
                    return obs1();
                });
                cmd.viewState.update(0);
                expect(cmd.viewState.value()).toBe(3);
                expect(obs1.valueHasMutated).toHaveBeenCalledTimes(1);
            });
    
            it("checks a command's viewState.update with nested computed", async () => {
                const [com] = await injector.require(["GUIAPP/content/viewmodels/base/UICommanding"]);
                let cmd = com.createCommand("TEST_CMD");

                let obs1 = ko.observable(3);
                spyOn(obs1, "valueHasMutated").and.callThrough();

                let comp1 = ko.computed(() => {
                    return obs1();
                });
                let comp2 = ko.computed(() => {
                    return comp1();
                });
                cmd.viewState.value = ko.computed(() => {
                    return comp2();
                });
                cmd.viewState.update(0);
                expect(cmd.viewState.value()).toBe(3);
                expect(obs1.valueHasMutated).toHaveBeenCalledTimes(1);
            });
    
            it("checks command for update viewstate call with a string argument", async() => {
                const [com] = await injector.require(["GUIAPP/content/viewmodels/base/UICommanding"]);
                let cmd = com.createCommand("TEST_CMD");
                cmd.viewState.update("3");
                expect(cmd.viewState.value()).toBe(3);
                cmd.viewState.update("0");
                expect(cmd.viewState.value()).toBe(0);
            });
    
            it("checks commanding for setViewState call with a string argument", async() => {
                const [com] = await injector.require(["GUIAPP/content/viewmodels/base/UICommanding"]);
                let cmd = com.createCommand("TEST_CMD");
                let success = com.setViewState("TEST_CMD", "3");
                expect(success).toBe(true);
                expect(cmd.viewState.value()).toBe(3);
                success = com.setViewState("TEST_CMD", "0");
                expect(success).toBe(true);
                expect(cmd.viewState.value()).toBe(0);
            });
    
            it("checks suspended command for setViewState call with a string argument", async() => {
                const [com] = await injector.require(["GUIAPP/content/viewmodels/base/UICommanding"]);
                let cmd = com.createCommand("TEST_CMD");
                cmd.suspended = true;
                let success = com.setViewState("TEST_CMD", "0");
                expect(success).toBe(false); // command is suspended
                expect(cmd.suspendMap.__viewStateToResume).toBe(0);
            });
        });
    
        describe("EppHandler", () => {
            it("queues claimKey calls for FKs only, if ada not active", async () => {
                const CLAIM_ID = 4711;
                const CLAIM_KEYS = ["F1"];
                const TEST_CMD = "TEST_CMD";
                spyOn(Wincor.UI.Service.Provider.EppService, "claimKeys")
                    .and.callFake(keys => {
                    let ret = {claimId: CLAIM_ID};
                    keys.forEach(key => {
                        ret[key] = "ENABLED"
                    });
                    return ret;
                });
                const [com] = await injector.require(["GUIAPP/content/viewmodels/base/UICommanding"]);
                com.setViewModelContainer(Wincor.UI.Content.ViewModelContainer);
                const cmd = com.createCommand(TEST_CMD);
                cmd.viewModel = {};
                cmd.eppKeys = CLAIM_KEYS;
                cmd.adaKey = 7;

                let oldPromise = com.whenEppProcessingDone();
                com.setActive(TEST_CMD);
                let newPromise = com.whenEppProcessingDone();
                await newPromise;
                expect(oldPromise).not.toBe(newPromise);
                expect(Wincor.UI.Service.Provider.EppService.claimKeys).toHaveBeenCalledWith(CLAIM_KEYS, -1, void 0, jasmine.any(Function), jasmine.any(Function));
            });
        });

        describe("AdaHandler", () => {
            beforeEach(() => {
                Wincor.UI.Content.Ada._adaModeConventional = true;
            });

            it("queues claimKey / releaseKeys calls for adaKeys, according to ada service events", async () => {
                const CLAIM_ID = 4711;
                const CLAIM_KEYS = ["F1"];
                const TEST_CMD = "TEST_CMD";

                spyOn(Wincor.UI.Service.Provider.EppService, "claimKeys")
                    .and.callFake(keys => {
                    let ret = {claimId: CLAIM_ID};
                    keys.forEach(key => {
                        ret[key] = "ENABLED"
                    });
                    return ret;
                });
                spyOn(Wincor.UI.Service.Provider.EppService, "releaseKeys");
                // grab callback of ada service event
                let sendState;
                let p = new Promise(resolve => {
                    spyOn(Wincor.UI.Service.Provider.AdaService, "registerForServiceEvent")
                        .and.callFake((...args) => {
                            if (args[0] === "STATE_CHANGED") {
                                expect(args[1]).toEqual(jasmine.any(Function));
                                sendState = args[1];
                                resolve();
                            }
                    });
                });

                const [com] = await injector.require(["GUIAPP/content/viewmodels/base/UICommanding"]);
                await p;
                com.setViewModelContainer(Wincor.UI.Content.ViewModelContainer);
                const cmd = com.createCommand(TEST_CMD);
                cmd.viewModel = {};
                cmd.eppKeys = CLAIM_KEYS;
                cmd.adaKey = 7;

                let oldPromise = com.whenEppProcessingDone();
                com.setActive(TEST_CMD);
                let newPromise = com.whenEppProcessingDone();
                await newPromise;
                expect(oldPromise).not.toBe(newPromise);
                expect(Wincor.UI.Service.Provider.EppService.claimKeys).toHaveBeenCalledTimes(1);
                expect(Wincor.UI.Service.Provider.EppService.claimKeys).toHaveBeenCalledWith(CLAIM_KEYS, -1, void 0, jasmine.any(Function), jasmine.any(Function));
                Wincor.UI.Service.Provider.EppService.claimKeys.calls.reset();
                // now change ada state and check epp service calls
                // 1. Ada not active before, therefore releaseKeys due to ada state change to STOP must not be called
                Wincor.UI.Service.Provider.AdaService.state = "STOP";
                await sendState("STOP");
                await com.whenEppProcessingDone();
                expect(Wincor.UI.Service.Provider.EppService.releaseKeys).not.toHaveBeenCalled();
                Wincor.UI.Service.Provider.EppService.claimKeys.calls.reset();
                Wincor.UI.Service.Provider.EppService.releaseKeys.calls.reset();
                // 2. Ada activates, therefore claimKeys due to ada state change to SPEAK must be called
                Wincor.UI.Service.Provider.AdaService.state = "SPEAK";
                await sendState("SPEAK");
                await com.whenEppProcessingDone();
                expect(Wincor.UI.Service.Provider.EppService.claimKeys).toHaveBeenCalledWith([""+cmd.adaKey], -1, void 0, jasmine.any(Function), jasmine.any(Function));
                expect(Wincor.UI.Service.Provider.EppService.releaseKeys).not.toHaveBeenCalled();
                Wincor.UI.Service.Provider.EppService.claimKeys.calls.reset();
                Wincor.UI.Service.Provider.EppService.releaseKeys.calls.reset();
                Wincor.UI.Service.Provider.AdaService.state = "STOP";
                await sendState("STOP");
                await com.whenEppProcessingDone();
                expect(Wincor.UI.Service.Provider.EppService.claimKeys).not.toHaveBeenCalled();
                expect(Wincor.UI.Service.Provider.EppService.releaseKeys).toHaveBeenCalledWith(CLAIM_ID, void 0);
                expect(cmd.claimIdAda).toBe(-1); // reset by handler
            });
        });

        describe("EppHandler", () => {
            it("queues claimKey calls for FKs only, if ada not active", async () => {
                const CLAIM_ID = 4711;
                const CLAIM_KEYS = ["F1"];
                const TEST_CMD = "TEST_CMD";
                spyOn(Wincor.UI.Service.Provider.EppService, "claimKeys")
                    .and.callFake(keys => {
                    let ret = {claimId: CLAIM_ID};
                    keys.forEach(key => {
                        ret[key] = "ENABLED"
                    });
                    return ret;
                });
                const [com] = await injector.require(["GUIAPP/content/viewmodels/base/UICommanding"]);
                com.setViewModelContainer(Wincor.UI.Content.ViewModelContainer);
                const cmd = com.createCommand(TEST_CMD);
                cmd.viewModel = {};
                cmd.eppKeys = CLAIM_KEYS;
                cmd.adaKey = 7;

                let oldPromise = com.whenEppProcessingDone();
                com.setActive(TEST_CMD);
                let newPromise = com.whenEppProcessingDone();
                await newPromise;
                expect(oldPromise).not.toBe(newPromise);
                expect(Wincor.UI.Service.Provider.EppService.claimKeys).toHaveBeenCalledWith(CLAIM_KEYS, -1, void 0, jasmine.any(Function), jasmine.any(Function));
            });
        });

        describe("AdaHandler", () => {
            beforeEach(() => {
                Wincor.UI.Content.Ada._adaModeConventional = true;
            });

            it("queues claimKey / releaseKeys calls for adaKeys, according to ada service events", async () => {
                const CLAIM_ID = 4711;
                const CLAIM_KEYS = ["F1"];
                const TEST_CMD = "TEST_CMD";

                spyOn(Wincor.UI.Service.Provider.EppService, "claimKeys")
                    .and.callFake(keys => {
                    let ret = {claimId: CLAIM_ID};
                    keys.forEach(key => {
                        ret[key] = "ENABLED"
                    });
                    return ret;
                });
                spyOn(Wincor.UI.Service.Provider.EppService, "releaseKeys");
                // grab callback of ada service event
                let sendState;
                let p = new Promise(resolve => {
                    spyOn(Wincor.UI.Service.Provider.AdaService, "registerForServiceEvent")
                        .and.callFake((...args) => {
                            if (args[0] === "STATE_CHANGED") {
                                expect(args[1]).toEqual(jasmine.any(Function));
                                sendState = args[1];
                                resolve();
                            }
                    });
                });

                const [com] = await injector.require(["GUIAPP/content/viewmodels/base/UICommanding"]);
                await p;
                com.setViewModelContainer(Wincor.UI.Content.ViewModelContainer);
                const cmd = com.createCommand(TEST_CMD);
                cmd.viewModel = {};
                cmd.eppKeys = CLAIM_KEYS;
                cmd.adaKey = 7;

                let oldPromise = com.whenEppProcessingDone();
                com.setActive(TEST_CMD);
                let newPromise = com.whenEppProcessingDone();
                await newPromise;
                expect(oldPromise).not.toBe(newPromise);
                expect(Wincor.UI.Service.Provider.EppService.claimKeys).toHaveBeenCalledTimes(1);
                expect(Wincor.UI.Service.Provider.EppService.claimKeys).toHaveBeenCalledWith(CLAIM_KEYS, -1, void 0, jasmine.any(Function), jasmine.any(Function));
                Wincor.UI.Service.Provider.EppService.claimKeys.calls.reset();
                // now change ada state and check epp service calls
                // 1. Ada not active before, therefore releaseKeys due to ada state change to STOP must not be called
                Wincor.UI.Service.Provider.AdaService.state = "STOP";
                await sendState("STOP");
                await com.whenEppProcessingDone();
                expect(Wincor.UI.Service.Provider.EppService.releaseKeys).not.toHaveBeenCalled();
                Wincor.UI.Service.Provider.EppService.claimKeys.calls.reset();
                Wincor.UI.Service.Provider.EppService.releaseKeys.calls.reset();
                // 2. Ada activates, therefore claimKeys due to ada state change to SPEAK must be called
                Wincor.UI.Service.Provider.AdaService.state = "SPEAK";
                await sendState("SPEAK");
                await com.whenEppProcessingDone();
                expect(Wincor.UI.Service.Provider.EppService.claimKeys).toHaveBeenCalledWith([""+cmd.adaKey], -1, void 0, jasmine.any(Function), jasmine.any(Function));
                expect(Wincor.UI.Service.Provider.EppService.releaseKeys).not.toHaveBeenCalled();
                Wincor.UI.Service.Provider.EppService.claimKeys.calls.reset();
                Wincor.UI.Service.Provider.EppService.releaseKeys.calls.reset();
                Wincor.UI.Service.Provider.AdaService.state = "STOP";
                await sendState("STOP");
                await com.whenEppProcessingDone();
                expect(Wincor.UI.Service.Provider.EppService.claimKeys).not.toHaveBeenCalled();
                expect(Wincor.UI.Service.Provider.EppService.releaseKeys).toHaveBeenCalledWith(CLAIM_ID, void 0);
                expect(cmd.claimIdAda).toBe(-1); // reset by handler
            });
        });

        // UICommand class
        describe("UICommand", () => {
            describe("disposal", () => {
                it("does not invalidate options of hammer", async () => {
                    const [com] = await injector.require(["GUIAPP/content/viewmodels/base/UICommanding"]);
                    let optionsNulled = false;
                    //const com = Wincor.UI.Content.Commanding;
                    const cmd = com.createCommand("TEST_CMD");
                    cmd.delegates.hammer = new this.Hammer.Manager();
                    Object.defineProperty(cmd.delegates.hammer, "options", {
                        set: (val) => {
                            if (!val) {
                                optionsNulled = true;
                            }
                        },
                        get: () => {
                            return {};
                        }
                    });

                    com.removeCommand("TEST_CMD");
                    expect(optionsNulled).toBe(false);
                });
            });
        });
    });

});

