/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ shell_test.js 4.3.1-201130-21-086c3328-1a04bc7d

*/

define(['lib/Squire'], function(Squire) {

    let injector;
    let ko;
    let Wincor;
    let jQuery;

    describe("shell.js", () => {

        beforeEach(done => {
            injector = new Squire();

            injector.require(["NamespaceMock"], bundle => {

                this.durandalSystem = {};
                this.durandalApp = {};
                this.durandalViewLocator = {
                    useConvention: jasmine.createSpy("viewLocator.useConvention")
                };
                this.durandalComposition = {};
                this.durandalViewEngine = {};
                this.durandalActivator = {};
                this.durandalPluginsRouter = {
                    on: jasmine.createSpy("router.on").and.returnValue({then: () => {}}),
                    compositionComplete: jasmine.createSpy("routerCompositionComplete"),
                    navigate: jasmine.createSpy("routerNavigate"),
                    trigger: jasmine.createSpy("routerTrigger")
                };
                this.durandalPluginsHTTP = {};
                this.durandalPluginsDialog = {
                    getContext: () => { return {}},
                    close: () => {},
                    show: () => {return Promise.resolve();}
                };
                this.durandalBinder = {};

                this.routes = {};
                this.config = {
                    initialRoute: '',
                    modulesPath: "MOD_PATH/",
                    viewsPath: "VIEWS_PATH/",
                    findRouteByName: jasmine.createSpy("config.findRouteByName").and.callFake((route) => {
                        return this.routes[route];
                    }),
                    addRoute: jasmine.createSpy("config.addRoute").and.callFake((route) => {
                        this.routes[route] = route;
                    })
                };
                this.movements = {};
                this.viewModelHelper = {};

                Wincor = window.Wincor = bundle.createWincor();
                ko = Wincor.ko = window.ko = bundle.ko;
                jQuery = window.jQuery = bundle.jQuery;
                injector
                    .mock("jquery", jQuery)
                    .mock("extensions", bundle.ext)
                    .mock("knockout", ko)
                    .mock("durandal/system", this.durandalSystem)
                    .mock("durandal/viewEngine", this.durandalViewEngine)
                    .mock("durandal/activator", this.durandalActivator)
                    .mock("plugins/router", this.durandalPluginsRouter)
                    .mock("durandal/app", this.durandalApp)
                    .mock("durandal/composition", this.durandalComposition)
                    .mock("vm-container", Wincor.UI.Content.ViewModelContainer)
                    .mock("config/Config", this.config)
                    .mock("vm-util/UIMovements", this.movements)
                    .mock("vm-util/StyleResourceResolver", Wincor.UI.Content.StyleResourceResolver)
                    .mock("vm-util/ViewModelHelper", this.viewModelHelper)
                    .mock("plugins/dialog", this.durandalPluginsDialog)
                    .mock("vm-util/UICommanding", Wincor.UI.Content.Commanding)
                    .mock("durandal/viewLocator", this.durandalViewLocator);

                done();
            });
        });

        afterEach(() => {
            injector.remove();
        });

        describe("loaded", () => {
            it("initializes styleResourceResolver", done => {
                spyOn(Wincor.UI.Content.StyleResourceResolver, "process").and.returnValue(Promise.resolve());
                injector.require(["GUIAPP/content/views/script/shell"], shell => {
                    expect(Wincor.UI.Content.StyleResourceResolver.process).toHaveBeenCalledTimes(1);
                    done();
                }, done.fail);
            });

            it("returns an appropriate durandal module object", done => {
                spyOn(Wincor.UI.Content.StyleResourceResolver, "process").and.returnValue(Promise.resolve());
                injector.require(["GUIAPP/content/views/script/shell"], shell => {
                    expect(typeof shell).toBe("object");
                    expect(shell.router).toBe(this.durandalPluginsRouter);
                    expect(typeof shell.activate).toBe("function");
                    expect(typeof shell.getView).toBe("function");
                    expect(typeof shell.binding).toBe("function");
                    done();
                }, done.fail);
            });

            //TODO: test returned module functions

            it("registers for router events", done => {
                injector.require(["GUIAPP/content/views/script/shell"], shell => {
                    expect(this.durandalPluginsRouter.on).toHaveBeenCalledTimes(2);
                    expect(this.durandalPluginsRouter.on.calls.argsFor(0)[0]).toBe("router:navigation:composition-complete");
                    expect(this.durandalPluginsRouter.on.calls.argsFor(1)[0]).toBe("router:navigation:cancelled");
                    done();
                }, done.fail);
            });

            it("registers for SERVICE_EVENTS NAVIGATE_SPA and SHUTDOWN", done => {
                // this is a bit complex to test...
                spyOn(Wincor.UI.Service.Provider.ViewService, "registerForServiceEvent");
                injector.require(["GUIAPP/content/views/script/shell"], shell => {
                    expect(Wincor.UI.Service.Provider.ViewService.registerForServiceEvent).toHaveBeenCalledTimes(2);
                    expect(Wincor.UI.Service.Provider.ViewService.registerForServiceEvent.calls.argsFor(0)[0]).toBe("NAVIGATE_SPA");
                    expect(Wincor.UI.Service.Provider.ViewService.registerForServiceEvent.calls.argsFor(1)[0]).toBe("SHUTDOWN");
                    done();
                }, done.fail);
            });
        });

        describe("receiving NAVIGATE_SPA service event", () => {

            beforeEach(done => {
                // this.PREPARATION will resolve to the onNavigateSpa internal function of shell.js
                this.PREPARATION = new Promise((resolve, reject) => {

                    // used to hook "process" to be able to call awaitSPA(), which is passed
                    Wincor.waitForCall(Wincor.UI.Content.StyleResourceResolver, "process", void 0, {
                        then: fx => fx()
                    });
                    Wincor.waitForCall(Wincor.UI.Service.Provider.ViewService, "registerForServiceEvent", (...args)=>args[0]==="NAVIGATE_SPA")
                        .then(resolve);
                });
                done();
            });

            it("automatically adds unknown routes to the config", done => {
                injector.require(["GUIAPP/content/views/script/shell"], shell => {
                    this.PREPARATION
                        .then(args => {
                            let onNavigateSpa = args[1];
                            const DESTINATION = {
                                viewKey: "UnitTestViewKey",
                                url: "unittest_shell_test.html",
                                lastViewUrl: "lastUnitTestViewUrl",
                                queryString: "test=1234",
                                routeName: "unittest_shell_test.html"
                            };
                            expect(typeof onNavigateSpa).toBe("function");
                            onNavigateSpa(DESTINATION);
                            expect(this.config.findRouteByName).toHaveBeenCalledTimes(2);
                            expect(this.config.addRoute).toHaveBeenCalledTimes(1);
                            done();
                        })
                        .catch(done.fail);
                }, done.fail);
            });

            it("restores path conventions if popup is still active", done => {
                spyOn(Wincor.UI.Content.ViewModelContainer.viewHelper, "isPopupMessageActive").and.returnValue(true);
                injector.require(["GUIAPP/content/views/script/shell"], shell => {
                    this.PREPARATION
                        .then(args => {
                            let onNavigateSpa = args[1];
                            const DESTINATION = {
                                viewKey: "UnitTestViewKey",
                                url: "unittest_shell_test.html",
                                lastViewUrl: "lastUnitTestViewUrl",
                                queryString: "test=1234",
                                routeName: "unittest_shell_test.html"
                            };
                            expect(typeof onNavigateSpa).toBe("function");
                            onNavigateSpa(DESTINATION);
                            expect(this.durandalViewLocator.useConvention).toHaveBeenCalledWith("MOD_PATH/", "VIEWS_PATH/");
                            done();
                        })
                        .catch(done.fail);
                }, done.fail);
            });

            it("can display waitSpinner instead of a real view", done => {

                const registeredForTurnActive = Wincor.waitForCall(Wincor.UI.Service.Provider.ViewService, "registerForServiceEvent", (...args)=>args[0]==="TURN_ACTIVE");

                // prepare changes of service related stuff on Namespacemock before requiring test-file!
                Wincor.UI.Service.Provider.ViewService.viewContext.viewConfig.popup = {
                    waitspinner: true
                };
                spyOn(Wincor.UI.Content.ViewModelContainer, "suspend");
                spyOn(Wincor.UI.Content.ViewModelContainer.viewHelper, "showWaitSpinner").and.callThrough();
                injector.require(["GUIAPP/content/views/script/shell"], shell => {
                    this.PREPARATION
                        .then(args => {
                            let onNavigateSpa = args[1];
                            const DESTINATION = {
                                viewKey: "UnitTestViewKey",
                                url: "unittest_shell_test.html",
                                lastViewUrl: "lastUnitTestViewUrl",
                                queryString: "test=1234",
                                routeName: "unittest_shell_test.html"
                            };
                            onNavigateSpa(DESTINATION);
                            registeredForTurnActive
                                .then(args => {
                                    expect(this.durandalViewLocator.useConvention).not.toHaveBeenCalled();
                                    expect(Wincor.UI.Content.ViewModelContainer.suspend).toHaveBeenCalledTimes(1);
                                    expect(Wincor.UI.Content.ViewModelContainer.viewHelper.showWaitSpinner).toHaveBeenCalledTimes(1);
                                    done();
                                })
                                .catch(done.fail);
                        })
                        .catch(done.fail);
                }, done.fail);
            });

            it("checks vm life-cycle when new view is required", async done => {
                try {
                    let cleanNodes = spyOn(Wincor.UI.Content.ViewModelContainer, "cleanNodes");
                    let clean = spyOn(Wincor.UI.Content.ViewModelContainer, "clean");
                    let deactivate = spyOn(Wincor.UI.Content.ViewModelContainer, "deactivate").and.callThrough();
                    let remove = spyOn(Wincor.UI.Content.ViewModelContainer, "remove");
                    await injector.require(["GUIAPP/content/views/script/shell"]);
                    let args = await this.PREPARATION;
                    let onNavigateSpa = args[1];
                    const DESTINATION = {
                        viewKey: "UnitTestViewKey",
                        url: "unittest_shell_test.html",
                        lastViewUrl: "lastUnitTestViewUrl",
                        queryString: "test=1234",
                        routeName: "unittest_shell_test.html"
                    };
                    let end = Wincor.waitForCall(Wincor.UI.Content.ViewModelContainer.viewHelper, "removeWaitSpinner");
                    onNavigateSpa(DESTINATION);
                    await end;
                    expect(cleanNodes).toHaveBeenCalledBefore(deactivate);
                    expect(deactivate).toHaveBeenCalledBefore(clean);
                    expect(clean).toHaveBeenCalledBefore(remove);

                    expect(cleanNodes).toHaveBeenCalledWith(false);
                    expect(deactivate).toHaveBeenCalledWith(false, true);
                    done();
                } catch(e) {
                    done.fail(e);
                }
            });

            it("checks vm life-cycle when view equals", async () => {
                Wincor.UI.Content.ViewModelContainer.refresh = jasmine.createSpy("refresh").and.returnValue(Promise.resolve());
                Wincor.UI.Content.Commanding.removeListeners = jasmine.createSpy("removeListeners");
                await injector.require(["GUIAPP/content/views/script/shell"]);
                let args = await this.PREPARATION;
                let onNavigateSpa = args[1];
                const DESTINATION = {
                    viewKey: "UnitTestViewKey",
                    url: "unittest_shell_test.html",
                    lastViewUrl: "lastUnitTestViewUrl",
                    queryString: "test=1234",
                    routeName: "unittest_shell_test.html"
                };
                let end = Wincor.waitForCall(Wincor.UI.Content.ViewModelContainer.viewHelper, "removeWaitSpinner");
                onNavigateSpa(DESTINATION);
                await end;
                onNavigateSpa(DESTINATION);
                await end;
                expect(Wincor.UI.Content.ViewModelContainer.refresh).toHaveBeenCalledTimes(1);
                expect(Wincor.UI.Content.Commanding.removeListeners).toHaveBeenCalledTimes(1);
            });

            it("checks vm life-cycle display component", async () => {
                Wincor.UI.Content.ViewModelContainer.preserve = jasmine.createSpy("preserve");
                Wincor.UI.Content.ViewModelContainer.restore = jasmine.createSpy("restore");
                Wincor.UI.Content.ViewModelContainer.deactivateViewModels = jasmine.createSpy("deactivateViewModels");
                Wincor.UI.Content.Commanding.suspend = jasmine.createSpy("suspend");
                Wincor.UI.Content.Commanding.resume = jasmine.createSpy("resume");
                let deactivate = spyOn(Wincor.UI.Content.ViewModelContainer, "deactivate").and.callThrough();
                let cleanNodes = spyOn(Wincor.UI.Content.ViewModelContainer, "cleanNodes");
                let clean = spyOn(Wincor.UI.Content.ViewModelContainer, "clean");

                spyOn(window, "require").and.callFake((module, cb) => {
                    cb({});
                });
                const registeredForViewClosing = Wincor.waitForCall(Wincor.UI.Service.Provider.ViewService, "registerForServiceEvent", (...args) => {
                    return args[0] === "VIEW_CLOSING"
                });
                await injector.require(["GUIAPP/content/views/script/shell"]);
                let args = await this.PREPARATION;
                let onNavigateSpa = args[1];
                const DESTINATION = {
                    viewKey: "UnitTestViewKey",
                    url: "unittest_shell_test.component.html",
                    lastViewUrl: "lastUnitTestViewUrl",
                    queryString: "test=1234",
                    routeName: "unittest_shell_test.component.html"
                };
                onNavigateSpa(DESTINATION);
                args = await registeredForViewClosing;
                args[1]();
                expect(Wincor.UI.Service.Provider.ViewService.viewContext.viewConfig.popup.oncancel).toBe(false);
                expect(Wincor.UI.Service.Provider.ViewService.viewContext.viewConfig.popup.ontimeout).toBe(false);
                expect(Wincor.UI.Content.ViewModelContainer.preserve).toHaveBeenCalledTimes(1);
                expect(Wincor.UI.Content.ViewModelContainer.preserve).toHaveBeenCalledBefore(Wincor.UI.Content.ViewModelContainer.restore);
                expect(deactivate).toHaveBeenCalledWith(false, true);
                expect(cleanNodes).toHaveBeenCalledBefore(Wincor.UI.Content.ViewModelContainer.deactivateViewModels);
                expect(Wincor.UI.Content.ViewModelContainer.deactivateViewModels).toHaveBeenCalledBefore(clean);
                expect(clean).toHaveBeenCalledBefore(Wincor.UI.Content.ViewModelContainer.restore);
                expect(clean).toHaveBeenCalledWith(false, false);
            });

            it("uses initialRoute config to evaluate type of navigation on startup", async () => {
                Wincor.UI.Content.ViewModelContainer.refresh = jasmine.createSpy("refresh").and.returnValue(Promise.resolve());
                Wincor.UI.Content.Commanding.removeListeners = jasmine.createSpy("removeListeners");

                this.config.initialRoute = 'welcome'
                await injector.require(["GUIAPP/content/views/script/shell"]);
                let [evt, onNavigateSpa] = await this.PREPARATION;
                const DESTINATION = {
                    viewKey: "welcomeTest",
                    url: "welcome.html",
                    lastViewUrl: "lastUnitTestViewUrl",
                    queryString: "test=1234",
                    routeName: "welcome"
                };
                let end = Wincor.waitForCall(Wincor.UI.Content.ViewModelContainer.viewHelper, "removeWaitSpinner");
                onNavigateSpa(DESTINATION);
                await end;

                expect(Wincor.UI.Content.ViewModelContainer.refresh).toHaveBeenCalledTimes(1);
                expect(Wincor.UI.Content.Commanding.removeListeners).toHaveBeenCalledTimes(1);
            });
        });
    });
});

