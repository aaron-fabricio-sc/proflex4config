/*
 $MOD$ header_test.js 4.3.1-201130-21-086c3328-1a04bc7d
 */

define(['lib/Squire'], function(Squire) {

    let injector;
    let ko;
    let Wincor;
    let jQuery;
    let ext;


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


    describe("header code-behind", () => {

        beforeEach(done => {
            injector = new Squire();

            injector.require(["NamespaceMock"], bundle => {
                Wincor = window.Wincor = bundle.createWincor();
                ext = bundle.ext;
                ko = Wincor.ko = window.ko = bundle.ko;
                jQuery = window.jQuery = bundle.jQuery;
                
                const baseAggregateMock = {
                    extend: (a)=>{return a;},
                    activate: ()=>{//empty
                    },
                    container: container,
                    config: {
                        viewType: "touch"
                    },
                    content: {
                        viewType: "touch"
                    },
                    viewHelper: { styleResolver: Wincor.UI.Content.StyleResourceResolver }
                };

                // Code behind needs something to instantiate...
                Wincor.UI.Content.HeaderViewModel = function() {
                    return {TEST: "yes"};
                };
                
                injector
                    .mock("content/viewmodels/base/ViewModelContainer", container)
                    .mock("flexuimapping", {
                        buildGuiKey: () => {// stub
                        }
                    })
                    .mock("ui-content", {
                        designMode: Wincor.UI.Content.designMode
                    })
                    .mock("jquery", jQuery)
                    .mock("extensions", bundle.ext)
                    .mock("knockout", ko)
                    .mock("vm-container", container)
                    .mock("code-behind/baseaggregate", baseAggregateMock)
                    .mock("vm/HeaderViewModel", {})
                    .mock("vm-util/UICommanding", commandMock);

                
                Wincor.UI.Content.ObjectManager = {
                    reCalculateObjects: jasmine.createSpy("reCalculateObjects"),
                    getElementById: () => { return null}
                };
                done();
            });
        });

        afterEach(() => {
            injector.remove();
        });

        describe("moveHeaderMessageOut", () => {
            it("checks rejection handler", async() => {
                let result = await injector.require(["GUIAPP/content/views/script/header", "mocks"]);
                let header = result[0];
                let mocks = result[1];
                mocks.mocks["code-behind/baseaggregate"].config.VIEW_ANIMATIONS_ON = true;
                expect(typeof ext.Promises.deferred === "function").toBe(true);
                let promise = header.moveHeaderMessageOut();
                expect(typeof promise._rejectionHandler0 === "function").toBe(true);
            });

            it("checks promise resolved", async() => {
                let result = await injector.require(["GUIAPP/content/views/script/header", "mocks"]);
                let header = result[0];
                let mocks = result[1];
                mocks.mocks["code-behind/baseaggregate"].config.VIEW_ANIMATIONS_ON = true;
                expect(typeof ext.Promises.deferred === "function").toBe(true);
                let animationEndCallBack = () => {
                };
                const TEST1 = {
                    length: 1,
                    on: jasmine.createSpy("TEST1.on").and.callFake((evtName, cb) => {
                        expect(evtName).toBe("animationend");
                        animationEndCallBack = cb;
                    }),
                    off: jasmine.createSpy("TEST1.on"),
                    css: () => {
                        return "";
                    }
                };
                const TEST2 = {
                    length: 1,
                    find: jasmine.createSpy("TEST2.find").and.returnValue(TEST1),
                    attr: () => {
                    },
                    css: () => {
                        return "";
                    }
                };
                spyOn(jQuery.fn, 'init').and.returnValue(TEST2); // spy on generic selector like $("#flexMessageContainerHeader")
                spyOn(jQuery.fn, 'find').and.returnValue(TEST2);
                jasmine.clock().install();
                const okSpy = jasmine.createSpy("okSpy").and.callFake(() => {
                    expect(okSpy).toHaveBeenCalledTimes(1);
                });
                const opTimeoutSpy = jasmine.createSpy("opTimeoutSpy").and.callFake(e => {
                    expect(e.message.includes("operation timed out")).toBe(true);
                    expect(opTimeoutSpy).not.toHaveBeenCalled();
                });
                let promise = header.moveHeaderMessageOut();
                promise
                    .then(okSpy)
                    .catch(opTimeoutSpy);
                jasmine.clock().tick(400);
                animationEndCallBack();
                expect(TEST2.find).toHaveBeenCalledTimes(1);
                expect(TEST1.on).toHaveBeenCalledTimes(1);
                expect(TEST1.off).toHaveBeenCalledTimes(1);
                jasmine.clock().uninstall();
            });

            it("checks promise operation timeout", async() => {
                let result = await injector.require(["GUIAPP/content/views/script/header", "mocks"]);
                let header = result[0];
                let mocks = result[1];
                mocks.mocks["code-behind/baseaggregate"].config.VIEW_ANIMATIONS_ON = true;
                expect(typeof ext.Promises.deferred === "function").toBe(true);
                const TEST1 = {
                    length: 1,
                    on: jasmine.createSpy("TEST1.on").and.callFake((evtName, cb) => {
                        expect(evtName).toBe("animationend");
                    }),
                    off: jasmine.createSpy("TEST1.off"),
                    css: () => {
                        return "";
                    }
                };
                const TEST2 = {
                    length: 1,
                    find: jasmine.createSpy("TEST2.find").and.returnValue(TEST1),
                    attr: () => {
                    },
                    css: () => {
                        return "";
                    }
                };
                spyOn(jQuery.fn, 'init').and.returnValue(TEST2); // spy on generic selector like $("#flexMessageContainerHeader")
                spyOn(jQuery.fn, 'find').and.returnValue(TEST2);
                jasmine.clock().install();
                const okSpy = jasmine.createSpy("okSpy").and.callFake(() => {
                    expect(okSpy).toHaveBeenCalledTimes(1);
                });
                const opTimeoutSpy = jasmine.createSpy("opTimeoutSpy").and.callFake(e => {
                    expect(e.message.includes("operation timed out")).toBe(true);
                    expect(opTimeoutSpy).toHaveBeenCalled();
                });
                let promise = header.moveHeaderMessageOut();
                promise
                    .then(okSpy)
                    .catch(opTimeoutSpy);
                jasmine.clock().tick(1000);
                expect(TEST2.find).toHaveBeenCalledTimes(1);
                expect(TEST1.on).toHaveBeenCalledTimes(1);
                jasmine.clock().uninstall();
            });
        });
        
        describe("escalation message", () => {
            it("available", async() => {
                let result = await injector.require(["GUIAPP/content/views/script/header", "mocks"]);
                let header = result[0];
                spyOn(jQuery.fn, "attr");
                header.escalationMessageAvailable();
                expect(jQuery.fn.attr).toHaveBeenCalledWith("data-message-escalation", "true");
            });
        });
        
        describe("split screen stuff", () => {
            it("toggles split mode", async() => {
                let result = await injector.require(["GUIAPP/content/views/script/header", "mocks"]);
                let header = result[0];
                let mocks = result[1];
                const CONFIG = mocks.mocks["code-behind/baseaggregate"].config;
                CONFIG.ALLOW_SPLIT_SCREEN_MOVING = true;
                CONFIG.SPLIT_SCREEN_MODE = "off";
                CONFIG.isDirectMarketingAvailable = false;
                spyOn(header, "handleSplitMode");
                spyOn(header, "moveSplitScreenPosition");
                await header.toggleSplitMode();
                expect(header.handleSplitMode).toHaveBeenCalledWith(true);
                await header.toggleSplitMode();
                expect(header.moveSplitScreenPosition).toHaveBeenCalledWith();
                await header.toggleSplitMode();
                expect(header.handleSplitMode).toHaveBeenCalledWith(false);
            });

            it("toggle split mode not allowed", async() => {
                let result = await injector.require(["GUIAPP/content/views/script/header", "mocks"]);
                let header = result[0];
                let mocks = result[1];
                const CONFIG = mocks.mocks["code-behind/baseaggregate"].config;
                CONFIG.ALLOW_SPLIT_SCREEN_MOVING = true;
                CONFIG.SPLIT_SCREEN_MODE = "disabled";
                CONFIG.isDirectMarketingAvailable = false;
                spyOn(header, "handleSplitMode");
                await header.toggleSplitMode();
                expect(header.handleSplitMode).not.toHaveBeenCalled();
            });
            
            it("handles split mode arg true", async() => {
                let result = await injector.require(["GUIAPP/content/views/script/header", "mocks"]);
                let header = result[0];
                let mocks = result[1];
                const BASE_AGG  = mocks.mocks["code-behind/baseaggregate"];
                const CONFIG = BASE_AGG.config;
                CONFIG.RVT_DEFAULT_NAME = "default/";
                CONFIG.ALLOW_SPLIT_SCREEN_MOVING = true;
                CONFIG.SPLIT_SCREEN_MODE = "off";
                CONFIG.isDirectMarketingAvailable = false;
                BASE_AGG.viewHelper.styleResolver.setResolution = jasmine.createSpy("setResolution").and.returnValue(Promise.resolve());
                BASE_AGG.viewHelper.styleResolver.type = jasmine.createSpy("type").and.returnValue("DNSeries/");
                BASE_AGG.container.LIFE_CYCLE_MODE = jasmine.createSpyObj("LIFE_CYCLE_MODE", ["STATIC"]);
                let headerVM = {};
                spyOn(BASE_AGG.container, "add").and.callFake(vm => {
                    headerVM = vm;
                });
                header.activate(); // must set private _headerVM
                spyOn(jQuery.fn, "show");
                await header.handleSplitMode(true);
                expect(Wincor.UI.Content.StyleResourceResolver.setResolution).toHaveBeenCalledWith(CONFIG.RVT_DEFAULT_NAME);
                expect(Wincor.UI.Content.StyleResourceResolver.type).toHaveBeenCalled();
                expect(jQuery.fn.show).toHaveBeenCalled();
                expect(headerVM.splitScreenMode).toBe("off");
            });

            it("handles split mode arg false", async() => {
                let result = await injector.require(["GUIAPP/content/views/script/header", "mocks"]);
                let header = result[0];
                let mocks = result[1];
                const BASE_AGG  = mocks.mocks["code-behind/baseaggregate"];
                const CONFIG = BASE_AGG.config;
                CONFIG.RES_1024X1280 = "1024x1280/";
                CONFIG.ALLOW_SPLIT_SCREEN_MOVING = true;
                CONFIG.SPLIT_SCREEN_MODE = "off";
                CONFIG.isDirectMarketingAvailable = false;
                BASE_AGG.viewHelper.styleResolver.setResolution = jasmine.createSpy("setResolution").and.returnValue(Promise.resolve());
                BASE_AGG.container.LIFE_CYCLE_MODE = jasmine.createSpyObj("LIFE_CYCLE_MODE", ["STATIC"]);
                let headerVM = {};
                spyOn(BASE_AGG.container, "add").and.callFake(vm => {
                    headerVM = vm;
                })
                header.activate(); // must set private _headerVM
                spyOn(jQuery.fn, "hide");
                spyOn(header, "toggleAdvertisingSpace");
                await header.handleSplitMode(false);
                expect(Wincor.UI.Content.StyleResourceResolver.setResolution).toHaveBeenCalledWith(CONFIG.RES_1024X1280);
                expect(header.toggleAdvertisingSpace).not.toHaveBeenCalled();
                expect(jQuery.fn.hide).toHaveBeenCalled();
                expect(headerVM.splitScreenMode).toBe("off");
            });

            it("handles split mode not allowed", async() => {
                let result = await injector.require(["GUIAPP/content/views/script/header", "mocks"]);
                let header = result[0];
                let mocks = result[1];
                const BASE_AGG  = mocks.mocks["code-behind/baseaggregate"];
                const CONFIG = BASE_AGG.config;
                CONFIG.RES_1024X1280 = "1024x1280/";
                CONFIG.ALLOW_SPLIT_SCREEN_MOVING = true;
                CONFIG.SPLIT_SCREEN_MODE = "disabled";
                CONFIG.isDirectMarketingAvailable = false;
                BASE_AGG.viewHelper.styleResolver.setResolution = jasmine.createSpy("setResolution").and.returnValue(Promise.resolve());
                spyOn(header, "toggleAdvertisingSpace");
                await header.handleSplitMode(true);
                expect(Wincor.UI.Content.StyleResourceResolver.setResolution).not.toHaveBeenCalled();
                expect(header.toggleAdvertisingSpace).not.toHaveBeenCalled();
            });
            
            it("move the split screen position", async() => {
                let result = await injector.require(["GUIAPP/content/views/script/header", "mocks"]);
                let header = result[0];
                let mocks = result[1];
                const BASE_AGG  = mocks.mocks["code-behind/baseaggregate"];
                const CONFIG = BASE_AGG.config;
                CONFIG.RES_1024X1280 = "1024x1280/";
                CONFIG.ALLOW_SPLIT_SCREEN_MOVING = true;
                CONFIG.SPLIT_SCREEN_MODE = "off";
                CONFIG.isDirectMarketingAvailable = false;
                BASE_AGG.container.LIFE_CYCLE_MODE = jasmine.createSpyObj("LIFE_CYCLE_MODE", ["STATIC"]);
                let headerVM = {};
                spyOn(BASE_AGG.container, "add").and.callFake(vm => {
                    headerVM = vm;
                });
                header.activate(); // must set private _headerVM
                jasmine.clock().install();
                header.moveSplitScreenPosition(false);
                jasmine.clock().tick(751);
                expect(Wincor.UI.Content.ObjectManager.reCalculateObjects).toHaveBeenCalled();
                expect(headerVM.splitScreenMode).toBe("down");
                jasmine.clock().uninstall();
            });

            it("move the split screen position not allowed", async() => {
                let result = await injector.require(["GUIAPP/content/views/script/header", "mocks"]);
                let header = result[0];
                let mocks = result[1];
                const BASE_AGG  = mocks.mocks["code-behind/baseaggregate"];
                const CONFIG = BASE_AGG.config;
                CONFIG.RES_1024X1280 = "1024x1280/";
                CONFIG.ALLOW_SPLIT_SCREEN_MOVING = true;
                CONFIG.SPLIT_SCREEN_MODE = "disabled";
                CONFIG.isDirectMarketingAvailable = false;
                jasmine.clock().install();
                header.moveSplitScreenPosition(false);
                jasmine.clock().tick(751);
                expect(Wincor.UI.Content.ObjectManager.reCalculateObjects).not.toHaveBeenCalled();
                jasmine.clock().uninstall();
            });
            
            it("handles style type specific no update", async() => {
                let result = await injector.require(["GUIAPP/content/views/script/header", "mocks"]);
                let header = result[0];
                let mocks = result[1];
                const BASE_AGG  = mocks.mocks["code-behind/baseaggregate"];
                BASE_AGG.viewHelper.styleResolver.type = jasmine.createSpy("type").and.returnValue("DNSeries/");
                
                const CONFIG = BASE_AGG.config;
                CONFIG.ALLOW_SPLIT_SCREEN_MOVING = true;
                CONFIG.SPLIT_SCREEN_MODE = "down";
                CONFIG.isDirectMarketingAvailable = false;
                spyOn(jQuery.fn, "show");
                spyOn(header, "handleSplitMode");
                await header.handleStyleTypeSpecific(false);
                expect(header.handleSplitMode).toHaveBeenCalledWith(true);
                expect(BASE_AGG.viewHelper.styleResolver.type).toHaveBeenCalled();
                expect(jQuery.fn.show).toHaveBeenCalledTimes(1);
            });

            it("handles style type specific update", async() => {
                let result = await injector.require(["GUIAPP/content/views/script/header", "mocks"]);
                let header = result[0];
                let mocks = result[1];
                const BASE_AGG  = mocks.mocks["code-behind/baseaggregate"];
                BASE_AGG.viewHelper.styleResolver.type = jasmine.createSpy("type").and.returnValue("DNSeries/");
                
                const CONFIG = BASE_AGG.config;
                CONFIG.ALLOW_SPLIT_SCREEN_MOVING = true;
                CONFIG.SPLIT_SCREEN_MODE = "down";
                CONFIG.isDirectMarketingAvailable = false;
                BASE_AGG.container.LIFE_CYCLE_MODE = jasmine.createSpyObj("LIFE_CYCLE_MODE", ["STATIC"]);
                let headerVM = {};
                spyOn(BASE_AGG.container, "add").and.callFake(vm => {
                    headerVM = vm;
                });
                header.activate(); // must set private _headerVM
                spyOn(jQuery.fn, "show");
                spyOn(header, "handleSplitMode");
                await header.handleStyleTypeSpecific(true);
                expect(header.handleSplitMode).not.toHaveBeenCalled();
                expect(BASE_AGG.viewHelper.styleResolver.type).toHaveBeenCalled();
                expect(jQuery.fn.show).toHaveBeenCalledTimes(1);
                expect(headerVM.splitScreenMode).toBe("off");
            });

            it("handles style type specific not allowed", async() => {
                let result = await injector.require(["GUIAPP/content/views/script/header", "mocks"]);
                let header = result[0];
                let mocks = result[1];
                const BASE_AGG  = mocks.mocks["code-behind/baseaggregate"];
                
                const CONFIG = BASE_AGG.config;
                CONFIG.ALLOW_SPLIT_SCREEN_MOVING = true;
                CONFIG.SPLIT_SCREEN_MODE = "disabled";
                CONFIG.isDirectMarketingAvailable = false;
                spyOn(jQuery.fn, "show");
                spyOn(header, "handleSplitMode");
                await header.handleStyleTypeSpecific(true);
                expect(header.handleSplitMode).not.toHaveBeenCalled();
                expect(jQuery.fn.show).not.toHaveBeenCalled();
            });

            it("toggle advertising space not allowed", async() => {
                let result = await injector.require(["GUIAPP/content/views/script/header", "mocks"]);
                let header = result[0];
                let mocks = result[1];
                const BASE_AGG  = mocks.mocks["code-behind/baseaggregate"];
                
                const CONFIG = BASE_AGG.config;
                CONFIG.SPLIT_SCREEN_MODE = "down";
                CONFIG.isDirectMarketingAvailable = false;
                CONFIG.showAdvertisingSpace = false;
                spyOn(jQuery.fn, "find");
                header.toggleAdvertisingSpace(1);
                expect(jQuery.fn.find).not.toHaveBeenCalled();
            });
            
        });
    });
});

