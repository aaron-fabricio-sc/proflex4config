/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ wn.UI.DurandalExtensions_test.js 4.3.1-201130-21-086c3328-1a04bc7d

*/

define(['lib/Squire'], function(Squire) {

    let injector;
    let ko;
    let Wincor;
    let jQuery;


    describe("wn.UI.DurandalExtensions", () => {

        // setup before any of the specs
        beforeEach(done => {
            injector = new Squire();
            injector.require(["NamespaceMock"], bundle => {
                Wincor = window.Wincor = bundle.createWincor();
                ko = Wincor.ko = window.ko = bundle.ko;
                jQuery = window.jQuery = bundle.jQuery;
                this.durandalSystem = {};
                this.durandalViewLocator = {};
                this.durandalViewEngine = {};
                this.durandalPluginsRouter = {
                    compositionComplete: jasmine.createSpy("routerCompositionComplete")
                };
                this.durandalPluginsHTTP = {};
                this.durandalBinder = {};

                injector
                    .mock("jquery", jQuery)
                    .mock("extensions", bundle.ext)
                    .mock("knockout", ko)
                    .mock("log-provider", console)
                    .mock("service/wn.UI.Service.Provider", Wincor.UI.Service.Provider)
                    .mock("durandal/system", this.durandalSystem)
                    .mock("durandal/viewLocator", this.durandalViewLocator)
                    .mock("durandal/viewEngine", this.durandalViewEngine)
                    .mock("plugins/router", this.durandalPluginsRouter)
                    .mock("plugins/http", this.durandalPluginsHTTP)
                    .mock("durandal/binder", this.durandalBinder)
                    .mock("ui-content", Wincor.UI.Content);
                done();
            });
        });

        // tear down after any of the specs
        afterEach(() => {
            injector.remove();
        });

        // general test for creation via 'initialize'
        it("adds / overrides specific durandal functions", done => { // done is used for async behavior
            injector.require(["lib/internal/wn.UI.DurandalExtensions"], ext => {
                expect(typeof ext.initialize).toBe("function");
                ext.initialize();
                expect(typeof this.durandalPluginsHTTP.get).toBe("function");
                expect(typeof this.durandalSystem.defer).toBe("function");
                expect(typeof this.durandalSystem.getCurrentViewId).toBe("function");
                expect(typeof this.durandalSystem.updateCurrentFooter).toBe("function");
                expect(typeof this.durandalSystem.updateViewId).toBe("function");
                expect(typeof this.durandalSystem.setViewId).toBe("function");
                expect(typeof this.durandalSystem.setShell).toBe("function");
                expect(typeof this.durandalSystem.setHeader).toBe("function");
                expect(typeof this.durandalSystem.setFooter).toBe("function");
                expect(typeof this.durandalSystem.error).toBe("function");
                expect(typeof this.durandalSystem.log).toBe("function");
                expect(typeof this.durandalSystem.isErrorState).toBe("boolean");
                expect(this.durandalSystem.isErrorState).toBe(false);
                expect(typeof this.durandalBinder.throwOnErrors).toBe("boolean");
                expect(this.durandalBinder.throwOnErrors).toBe(true);
                expect(typeof this.durandalViewEngine.tryGetViewFromCache).toBe("function");
                expect(typeof this.durandalViewEngine.putViewInCache).toBe("function");
                expect(typeof this.durandalViewEngine.convertViewIdToRequirePath).toBe("function");
                expect(typeof this.durandalViewEngine.processMarkup).toBe("function");
                expect(typeof this.durandalSystem.error).toBe("function");
                expect(typeof this.durandalSystem.error).toBe("function");
                done();
            }, done.fail);// errorcallback of require call
        });

        describe("viewEngine override tests", () => {

        });


        describe("system.error override tests", () => {
            it("generates stacktrace when called with non 'Error' type", done => { // done is used for async behavior
                injector.require(["lib/internal/wn.UI.DurandalExtensions"], ext => {
                    const STRING_ERROR = "STRING_ERROR";

                    Wincor.UI.Service.Provider.propagateError = jasmine.createSpy("propagateError").and.callFake((e, msg) => {
                        expect(e).toBe(STRING_ERROR);
                        expect(typeof msg).toBe("string");
                    });
                    expect(typeof Wincor.UI.Service.Provider.LogProvider.error).toBe("function");
                    spyOn(Wincor.UI.Service.Provider.LogProvider, "error");

                    expect(typeof ext.initialize).toBe("function");
                    ext.initialize();
                    spyOn(this.durandalSystem, "error").and.callThrough();
                    expect(typeof this.durandalSystem.error).toBe("function");
                    this.durandalSystem.error(STRING_ERROR);
                    expect(this.durandalSystem.error).toHaveBeenCalledTimes(1);
                    expect(this.durandalPluginsRouter.compositionComplete).toHaveBeenCalledTimes(1);
                    expect(Wincor.UI.Service.Provider.LogProvider.error.calls.first().args[0]).toContain("GeneratedStack");
                    done();
                }, done.fail);// errorcallback of require call
            });

            it("logs stack and message of given error and avoids compositionComplete when offlineSPA is active", done => { // done is used for async behavior
                injector.require(["lib/internal/wn.UI.DurandalExtensions"], ext => {
                    const ERROR = {
                        message: "ERRORMESSAGE",
                        stack: [1,2,3,4]
                    };

                    Wincor.UI.Service.Provider.propagateError = jasmine.createSpy("propagateError").and.callFake((e, msg) => {
                        expect(e).toBe(ERROR);
                        expect(typeof msg).toBe("string");
                    });
                    expect(typeof Wincor.UI.Service.Provider.LogProvider.error).toBe("function");
                    spyOn(Wincor.UI.Service.Provider.LogProvider, "error");

                    expect(typeof ext.initialize).toBe("function");
                    ext.initialize();
                    spyOn(this.durandalSystem, "error").and.callThrough();
                    expect(typeof this.durandalSystem.error).toBe("function");
                    this.durandalSystem.error(ERROR, /*isOffline=*/true);
                    expect(this.durandalSystem.error).toHaveBeenCalledTimes(1);
                    expect(this.durandalPluginsRouter.compositionComplete).not.toHaveBeenCalled();
                    expect(Wincor.UI.Service.Provider.LogProvider.error.calls.first().args[0]).toContain("GeneratedStack");
                    done();
                }, done.fail);// errorcallback of require call
            });
        });

    });
});

