/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ ko.CustomUtils_test.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

define(['lib/Squire'], function(Squire) {

    let injector;
    let ko;
    let Wincor;
    let jQuery;
    describe("ko.CustomUtils", () => {
        const Hammer = {
            Manager: function() {
                this.fakeManager = true;
            },
            Tap: function() {
                this.fakeTap = true;
            },
            Press: function() {
                this.fakePress = true;
            }
        };
    
        const TEST_SVG = `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                                        viewBox="0 0 45 45" enable-background="new 0 0 45 45" xml:space="preserve">
                                        <style type="text/css">
                                            @import "../default/default/svg.css";
                                        </style>
                                        <script type="text/javascript">
                                                 <![CDATA[
                                                     if(window.parent && window.parent.Wincor && window.parent.Wincor.UI && window.parent.Wincor.UI.Content) {
                                                         let styleRes = window.parent.Wincor.UI.Content.StyleResourceResolver;
                                                         if(styleRes) {
                                                         let style = document.getElementsByTagName("style")[0];
                                                         style.innerHTML = style.innerHTML.replace("default/svg.css", styleRes.type() + "svg.css");
                                                            styleRes = null;
                                                         }
                                                     }
                                                 ]]>
                                            </script>
                                        <g opacity="0.3">
                                            <polygon class="fillColor07"  points="22.2,34.5 6.7,34.5 14.4,21 22.2,7.5 30.1,21 37.8,34.5 \t"/>
                                        </g>
                           </svg>`;
        
        beforeEach(done => {
            injector = new Squire();
            jasmine.clock().install();
    
            injector.require(["NamespaceMock"], bundle => {
                Wincor = window.Wincor = bundle.createWincor();
                ko = Wincor.ko = window.ko = bundle.ko;
                jQuery = window.jQuery = bundle.jQuery;
                
                ['ui-content', 'vm-util/UIMovements', 'lib/jquery.transit.min']
                    .forEach((dependency) => {
                        injector.mock(dependency, {});
                    });
                injector.mock('jquery', jQuery);
                injector.mock('ko', ko);
                injector.mock('extensions', bundle.ext);
                injector.mock('lib/hammer.min', Hammer);
                injector.mock('config/Config', {
                    GESTURE_CONFIG: {
                        Tap: {
                            threshold: 123456,
                            time: 4711
                        },
                        Press: {
                            threshold: 7890,
                            time: 112
                        }
                    },
                    ROOT_DEFAULT: "style/",
                    RVT_DEFAULT_NAME: "default/",
                    IMAGE_FOLDER_NAME: "images/"
                });
                done();
            });
        });
    
        afterEach(() => {
            injector.remove();
            jasmine.clock().uninstall();
            jQuery("body").find("svg").remove();
        });

        describe("enable binding", () => { // overwritten to be able to use for all dom elements
            it("can be used for any dom element, not only form elements", async() => {
                let [ko, custom] = await injector.require(["knockout", "GUIAPP/content/viewmodels/base/ko.CustomUtils"]);
                let enabled = ko.observable(false);
                const valueAccessor = ko.observable(enabled);
                const el = jQuery("<div></div>")[0];
                custom.enable.update(el, valueAccessor);
                expect(el.hasAttribute("disabled")).toBe(true);
                enabled(true);
                custom.enable.update(el, valueAccessor);
                expect(el.hasAttribute("disabled")).toBe(false);
            });
        });

        describe("disable binding", () => { // this is original knockout and just calls the overwritten enabled binding with inverted arg
            it("can be used for any dom element, not only form elements", async() => {
                let [ko, custom] = await injector.require(["knockout", "GUIAPP/content/viewmodels/base/ko.CustomUtils"]);
                let disabled = ko.observable(false);
                const valueAccessor = ko.observable(disabled);
                const el = jQuery("<div></div>")[0];
                custom.disable.update(el, valueAccessor);
                expect(el.hasAttribute("disabled")).toBe(false);
                disabled(true);
                custom.disable.update(el, valueAccessor);
                expect(el.hasAttribute("disabled")).toBe(true);
            });
        });

        describe("command binding", () => {
        
            it("does bind adakey regardless of current ada state for GUIAPP", done => {
                injector.require(["knockout", "GUIAPP/content/viewmodels/base/ko.CustomUtils"], ko => {
                    expect(typeof ko.bindingHandlers.command === "object").toBe(true);
                    expect(typeof ko.bindingHandlers.command.init).toBe("function");
            
                    // prepare inputs for init
                    const element = jQuery("<div>")[0];
                    // these are the options
                    const valueAccessor = ko.observable({
                        id: "TEST",
                        adakey: "2",
                        action: null,
                    });
                    const allBindingsAccessor = ko.observable({});
                    const viewModel = {
                        cmdRepos: Wincor.UI.Content.Commanding,
                        extractViewStateFromConfig: jasmine.createSpy("extractViewStateFromConfig"),
                        CMDSTATE: {
                            ENABLED: 0
                        },
                        ada: {
                            _adaEnabled: false
                        },
                        logger: Wincor.UI.Diagnostics.LogProvider,
                        serviceProvider: {
                            AdaService: Wincor.UI.Service.Provider.AdaService,
                            ViewService: Wincor.UI.Service.Provider.ViewService
                        }
                    };
                    const bindingContext = {
                        $root: viewModel
                    };
            
                    let cmd = Object.assign({_test: true}, Wincor.UI.Content.Command);
                    spyOn(viewModel.cmdRepos, "get").and.returnValue(cmd);
                    spyOn(viewModel.cmdRepos, "hasCommand").and.returnValue(false);
                    spyOn(viewModel.logger, "error");
                    // and call it...
                    ko.bindingHandlers.command.init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
            
                    expect(viewModel.logger.error).not.toHaveBeenCalled();
                    expect(cmd.adaKey).toBe(valueAccessor().adakey);
            
                    done();
                }, done.fail);
            });
    
            it("adds adakey regardless of current ada state for GUIDM", done => {
                spyOn(Wincor.UI.Service.Provider, "getInstanceName").and.returnValue("GUIDM");
                injector.require(["knockout", "GUIAPP/content/viewmodels/base/ko.CustomUtils"], ko => {
                    expect(typeof ko.bindingHandlers.command === "object").toBe(true);
                    expect(typeof ko.bindingHandlers.command.init).toBe("function");
                    expect(Wincor.UI.Service.Provider.AdaService.state).toBe("DONOTHING");
                    // prepare inputs for init
                    const element = jQuery("<div>")[0];
                    // these are the options
                    const valueAccessor = ko.observable({
                        id: "TEST",
                        adakey: "2",
                        action: null,
                    });
                    const allBindingsAccessor = ko.observable({});
                    const viewModel = {
                        cmdRepos: Wincor.UI.Content.Commanding,
                        extractViewStateFromConfig: jasmine.createSpy("extractViewStateFromConfig"),
                        CMDSTATE: {
                            ENABLED: 0
                        },
                        ada: {
                            _adaEnabled: false
                        },
                        logger: Wincor.UI.Diagnostics.LogProvider,
                        serviceProvider: {
                            AdaService: Wincor.UI.Service.Provider.AdaService,
                            ViewService: Wincor.UI.Service.Provider.ViewService
                        }
                    };
                    const bindingContext = {
                        $root: viewModel
                    };

                    let cmd = Object.assign({_test: true}, Wincor.UI.Content.Command);
                    spyOn(viewModel.cmdRepos, "get").and.returnValue(cmd);
                    spyOn(viewModel.cmdRepos, "hasCommand").and.returnValue(false);
                    spyOn(viewModel.logger, "error");
                    // and call it...
                    ko.bindingHandlers.command.init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);

                    expect(viewModel.logger.error).not.toHaveBeenCalled();
                    expect(cmd.adaKey).toBe(valueAccessor().adakey);

                    done();
                }, done.fail);
            });

            it("generates HTML-element id, if not given", done => {
                injector.require(["knockout", "GUIAPP/content/viewmodels/base/ko.CustomUtils"], ko => {
                    expect(typeof ko.bindingHandlers.command === "object").toBe(true);
                    expect(typeof ko.bindingHandlers.command.init).toBe("function");
            
                    // prepare inputs for init
                    const element = jQuery("<div>")[0];
                    // these are the options
                    const valueAccessor = ko.observable({
                        id: "CMDNAME",
                        action: null,
                    });
                    const allBindingsAccessor = ko.observable({});
                    const viewModel = {
                        viewKey: "VIEWKEY",
                        cmdRepos: Wincor.UI.Content.Commanding,
                        extractViewStateFromConfig: jasmine.createSpy("extractViewStateFromConfig"),
                        CMDSTATE: {
                            ENABLED: 0
                        },
                        ada: {
                            _adaEnabled: false
                        },
                        logger: Wincor.UI.Diagnostics.LogProvider,
                        serviceProvider: {
                            AdaService: Wincor.UI.Service.Provider.AdaService,
                            ViewService: Wincor.UI.Service.Provider.ViewService
                        }
                    };
                    const bindingContext = {
                        $root: viewModel
                    };
            
                    let cmd = Object.assign({_test: true}, Wincor.UI.Content.Command);
                    spyOn(viewModel.cmdRepos, "get").and.returnValue(cmd);
                    spyOn(viewModel.cmdRepos, "hasCommand").and.returnValue(false);
                    // and call it...
                    ko.bindingHandlers.command.init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
                    expect(element.id).toBe("CMDNAME_VIEWKEY_generated");
                    done();
                }, done.fail);
            });
    
            it("rejects commands without given commandId", done => {
                injector.require(["knockout", "GUIAPP/content/viewmodels/base/ko.CustomUtils"], ko => {
                    expect(typeof ko.bindingHandlers.command === "object").toBe(true);
                    expect(typeof ko.bindingHandlers.command.init).toBe("function");
            
                    // prepare inputs for init
                    const element = jQuery("<div>")[0];
                    // these are the options
                    const valueAccessor = ko.observable({});
                    const allBindingsAccessor = ko.observable({});
                    const viewModel = {
                        CMDSTATE: {
                            ENABLED: 0
                        },
                        ada: {
                            _adaEnabled: false
                        },
                        logger: Wincor.UI.Diagnostics.LogProvider,
                        serviceProvider: {
                            AdaService: Wincor.UI.Service.Provider.AdaService,
                            ViewService: Wincor.UI.Service.Provider.ViewService
                        }
                    };
                    const bindingContext = {
                        $root: viewModel
                    };
            
                    spyOn(viewModel.logger, "error");
                    // and call it...
                    ko.bindingHandlers.command.init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
                    expect(viewModel.logger.error).toHaveBeenCalled();
            
                    done();
                }, done.fail);
            });
    
            it("deletes references if the element removed from DOM", done => {
                injector.require(["knockout", "GUIAPP/content/viewmodels/base/ko.CustomUtils"], ko => {
                    const CMD_NAME_DISPOSAL = "DISPOSAL_TEST";
                    const disposer = jasmine.createSpy("disposer");
                    const installedDisposerSpy = spyOn(ko.utils.domNodeDisposal, "addDisposeCallback").and.callFake(disposer);
                    // prepare inputs for init
                    const element = jQuery("<div>")[0];
                    // Command will be reported as known, so set element to our created one
                    Wincor.UI.Content.Commanding.get(CMD_NAME_DISPOSAL).element = element;
                    // these are the options
                    const valueAccessor = ko.observable({
                        id: CMD_NAME_DISPOSAL
                    });
                    const allBindingsAccessor = ko.observable({});
                    const viewModel = new Wincor.UI.Content.BaseViewModel();
                    spyOn(viewModel.logger, "error");
                    const bindingContext = {
                        $root: viewModel
                    };
            
                    // and call it...
                    ko.bindingHandlers.command.init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
                    expect(viewModel.logger.error).not.toHaveBeenCalled();
            
                    // now remove from DOM and check spy
                    jQuery(element).remove();
                    expect(installedDisposerSpy).toHaveBeenCalled();
                    expect(disposer).toHaveBeenCalled();
                    done();
                }, done.fail);
            });
    
            it("does not allow multiple commands with same id", done => {
                injector.require(["knockout", "GUIAPP/content/viewmodels/base/ko.CustomUtils"], ko => {
                    const CMD_NAME_NOT_UNIQUE = "UNIQUE";
                    // prepare inputs for init
                    const element = jQuery("<div>")[0];
                    const element2 = jQuery("<div>")[0];
                    // Command will be reported as known, so set element to our created one
                    Wincor.UI.Content.Commanding.get(CMD_NAME_NOT_UNIQUE).element = element;
                    // these are the options
                    const valueAccessor = ko.observable({
                        id: CMD_NAME_NOT_UNIQUE,
                        state: 0
                    });
                    const allBindingsAccessor = ko.observable({});
                    const viewModel = new Wincor.UI.Content.BaseViewModel();
            
                    spyOn(viewModel.logger, "error").and.callFake(text => {
                        console.debug(text);
                    });
                    const bindingContext = {
                        $root: viewModel
                    };
            
                    // and call it...
                    ko.bindingHandlers.command.init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
                    expect(viewModel.logger.error).not.toHaveBeenCalled();
            
                    ko.bindingHandlers.command.init(element2, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
                    expect(viewModel.logger.error).toHaveBeenCalled();
            
                    done();
                }, done.fail);
            });
    
            it("converts given eppkey value to string", done => {
                injector.require(["knockout", "GUIAPP/content/viewmodels/base/ko.CustomUtils"], ko => {
                    const CMD_NAME_NOT_UNIQUE = "UNIQUE";
                    // prepare inputs for init
                    const element = jQuery("<div>")[0];
                    // Command will be reported as known, so set element to our created one
                    Wincor.UI.Content.Commanding.get(CMD_NAME_NOT_UNIQUE).element = element;
                    // these are the options
                    const valueAccessor = ko.observable({
                        id: CMD_NAME_NOT_UNIQUE,
                        state: 0,
                        eppkey: 5
                    });
                    const allBindingsAccessor = ko.observable({});
                    const viewModel = new Wincor.UI.Content.BaseViewModel();
            
                    spyOn(viewModel.logger, "error").and.callFake(text => {
                        console.debug(text);
                    });
                    const bindingContext = {
                        $root: viewModel
                    };
            
                    // and call it...
                    ko.bindingHandlers.command.init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
                    expect(viewModel.logger.error).not.toHaveBeenCalled();
                    expect(Wincor.UI.Content.Commanding.get(CMD_NAME_NOT_UNIQUE).eppKeys).toEqual(["5"]);
            
                    done();
                }, done.fail);
            });
    
            it("converts given eppkey value-array to string-array", done => {
                injector.require(["knockout", "GUIAPP/content/viewmodels/base/ko.CustomUtils"], ko => {
                    const CMD_NAME_NOT_UNIQUE = "UNIQUE";
                    // prepare inputs for init
                    const element = jQuery("<div>")[0];
                    // Command will be reported as known, so set element to our created one
                    Wincor.UI.Content.Commanding.get(CMD_NAME_NOT_UNIQUE).element = element;
                    // these are the options
                    const valueAccessor = ko.observable({
                        id: CMD_NAME_NOT_UNIQUE,
                        state: 0,
                        eppkey: [0, 5, 'F2']
                    });
                    const allBindingsAccessor = ko.observable({});
                    const viewModel = new Wincor.UI.Content.BaseViewModel();
            
                    spyOn(viewModel.logger, "error").and.callFake(text => {
                        console.debug(text);
                    });
                    const bindingContext = {
                        $root: viewModel
                    };
            
                    // and call it...
                    ko.bindingHandlers.command.init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
                    expect(viewModel.logger.error).not.toHaveBeenCalled();
                    expect(Wincor.UI.Content.Commanding.get(CMD_NAME_NOT_UNIQUE).eppKeys).toEqual(["0", "5", "F2"]);
            
                    done();
                }, done.fail);
            });
    
            it("installs default options and handlers", done => {
                injector.require(["knockout", "GUIAPP/content/viewmodels/base/ko.CustomUtils"], ko => {
                    expect(typeof ko.bindingHandlers.command === "object").toBe(true);
                    expect(typeof ko.bindingHandlers.command.init).toBe("function");
            
                    const CMD_ID = "TEST_COMMAND";
                    // prepare inputs for init
                    const element = jQuery("<div>")[0];
                    const valueAccessor = ko.observable({
                        id: CMD_ID
                    });
                    const allBindingsAccessor = ko.observable({});
                    const viewModel = new Wincor.UI.Content.BaseViewModel();
            
                    const bindingContext = {
                        $root: viewModel
                    };
            
                    Wincor.UI.Content.Command.delegates.hammer = jasmine.createSpyObj('hammer', ['off', 'on', 'remove', 'destroy']);
                    spyOn(Wincor.UI.Content.Commanding, "hasCommand").and.returnValue(false);
                    spyOn(Wincor.UI.Content.Commanding, "createCommand").and.callThrough();
                    spyOn(Wincor.UI.Content.Commanding, "ensure");
                    spyOn(Wincor.UI.Content.Command, "setInitialViewState");
                    spyOn(viewModel.cmdRepos, "addDelegate").and.returnValue(true);
                    // and call it...
                    ko.bindingHandlers.command.init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
                    const cmd = Wincor.UI.Content.Commanding.get(CMD_ID);
            
                    // expectations
                    expect(Wincor.UI.Content.Commanding.createCommand).toHaveBeenCalledWith(CMD_ID);
                    expect(Wincor.UI.Content.Commanding.ensure).toHaveBeenCalledWith(CMD_ID);
                    expect(typeof cmd).toBe("object");
                    expect(cmd.element).toBe(element);
                    expect(element.__commandId_PCEFlexUI).toBe(CMD_ID);
                    expect(cmd.viewModel).toBe(viewModel);
                    expect(Wincor.UI.Content.Command.setInitialViewState).toHaveBeenCalledWith(0);
            
                    // check if refreshTimeout is installed
                    const vs = Wincor.UI.Service.Provider.ViewService;
                    const delegateFunction = viewModel.cmdRepos.addDelegate.calls.first().args[0].delegate;
                    expect(typeof delegateFunction).toBe("function");
            
                    vs.refreshTimeout = jasmine.createSpy("refreshTimeout");
            
                    // now call delegate and see if it triggers "refreshTimeout"
                    expect(delegateFunction).not.toThrow(); // executes
                    expect(vs.refreshTimeout).toHaveBeenCalled();
                    done();
                }, done.fail);
            });
    
            it("supports eppkeyConfig for alphanumeric entries", done => {
                injector.require(["knockout", "GUIAPP/content/viewmodels/base/ko.CustomUtils"], ko => {

                    expect(typeof ko.bindingHandlers.command === "object").toBe(true);
                    expect(typeof ko.bindingHandlers.command.init).toBe("function");

                    const CMD_ID = "ALPHANUMTEST_COMMAND";
                    const CHAR_X = "X";
                    // prepare custom binding arguments for init
                    const element = jQuery("<div>")[0];

                    // replace default handler
                    const handler = jasmine.createSpy("alphanumericInputHandler")
                        .and.callFake((data) => {
                            expect(ko.isObservable(data.observable)).toBe(true);
                            data.observable(["X"]);
                            return true; // we handled it!
                        });

                    // this is the simulated command-binding configuration
                    const valueAccessor = ko.observable({
                        id: CMD_ID,
                        eppkey: "1",
                        eppkeyConfig: {
                            keys: ko.observable('["1", "A", "B", "C"]'),
                            handler: handler
                        }
                    });
                    const allBindingsAccessor = ko.observable({});

                    // basic mock is ok for our case
                    const viewModel = new Wincor.UI.Content.BaseViewModel();
                    viewModel.onButtonPressed = jasmine.createSpy("onButtonPressed");
                    const bindingContext = {
                        $root: viewModel
                    };

                    Wincor.UI.Content.Command.delegates.hammer = jasmine.createSpyObj('hammer', ['off', 'on', 'remove', 'destroy']);
                    spyOn(Wincor.UI.Content.Commanding, "hasCommand").and.returnValue(false);
                    const add = jasmine.createSpy("add");

                    // simulate class Hammer.Manager and Hammer.Tap constructors
                    spyOn(Hammer, "Manager").and.callFake(function() {
                        this.add = add;
                        this.off = () => {};
                        this.on = () => {};
                        this.remove = ()=>{};
                        this.destroy = ()=>{};
                    });
                    spyOn(Hammer, "Tap").and.callFake(function() {
                        this.__fake = true;
                    });
                    spyOn(Hammer, "Press").and.callFake(function() {
                        this.__fake = true;
                    });

                    // spy call to delegates._init to get access to action, context and args
                    Wincor.UI.Content.Command.delegates._init = jasmine.createSpy("capturedAction");

                    // and call it...
                    ko.bindingHandlers.command.init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);

                    // so now we have to trigger the _execute of the created command and check...
                    // we get it from our installed capturedAction spy
                    // expectations
                    expect(Wincor.UI.Content.Command.delegates._init).toHaveBeenCalled();
                    const args = Wincor.UI.Content.Command.delegates._init.calls.first().args;

                    // now we can trigger the action as commanding would do if an epp button had been pressed...
                    expect(() => {
                        args[0].apply(args[1], args[2]);
                    }).not.toThrow();

                    expect(viewModel.onButtonPressed).toHaveBeenCalledWith(CHAR_X);

                    done();
                }, done.fail);
            });

            it("does not fail on invalid eppkeyConfig for alphanumeric entries", done => {
                injector.require(["knockout", "GUIAPP/content/viewmodels/base/ko.CustomUtils"], ko => {

                    expect(typeof ko.bindingHandlers.command === "object").toBe(true);
                    expect(typeof ko.bindingHandlers.command.init).toBe("function");

                    const CMD_ID = "ALPHANUMTEST_COMMAND";
                    // prepare custom binding arguments for init
                    const element = jQuery("<div>")[0];

                    // replace default handler
                    const handler = jasmine.createSpy("alphanumericInputHandler")
                        .and.callFake((data) => {
                            expect(ko.isObservable(data.observable)).toBe(true);
                            data.observable("X");
                            return true; // we handled it!
                        });

                    // this is the simulated command-binding configuration
                    const valueAccessor = ko.observable({
                        id: CMD_ID,
                        eppkey: "1",
                        eppkeyConfig: {
                            keys: ko.observable(),
                            handler: handler
                        }
                    });
                    const allBindingsAccessor = ko.observable({});

                    // basic mock is ok for our case
                    const viewModel = new Wincor.UI.Content.BaseViewModel();
                    viewModel.onButtonPressed = jasmine.createSpy("onButtonPressed");
                    const bindingContext = {
                        $root: viewModel
                    };

                    Wincor.UI.Content.Command.delegates.hammer = jasmine.createSpyObj('hammer', ['off', 'on', 'remove', 'destroy']);
                    spyOn(Wincor.UI.Content.Commanding, "hasCommand").and.returnValue(false);
                    const add = jasmine.createSpy("add");

                    // simulate class Hammer.Manager and Hammer.Tap constructors
                    spyOn(Hammer, "Manager").and.callFake(function() {
                        this.add = add;
                        this.off = () => {};
                        this.on = () => {};
                        this.remove = ()=>{};
                        this.destroy = ()=>{};
                    });
                    spyOn(Hammer, "Tap").and.callFake(function() {
                        this.__fake = true;
                    });
                    spyOn(Hammer, "Press").and.callFake(function() {
                        this.__fake = true;
                    });

                    // spy call to delegates._init to get access to action, context and args
                    Wincor.UI.Content.Command.delegates._init = jasmine.createSpy("capturedAction");

                    // and call it...
                    ko.bindingHandlers.command.init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);

                    // so now we have to trigger the _execute of the created command and check...
                    // we get it from our installed capturedAction spy
                    // expectations
                    expect(Wincor.UI.Content.Command.delegates._init).toHaveBeenCalled();
                    const args = Wincor.UI.Content.Command.delegates._init.calls.first().args;

                    // now we can trigger the action as commanding would do if an epp button had been pressed...
                    expect(() => {
                        args[0].apply(args[1], args[2]);
                    }).not.toThrow();

                    expect(handler).not.toHaveBeenCalled();
                    expect(viewModel.onButtonPressed).toHaveBeenCalledWith(CMD_ID);

                    done();
                }, done.fail);
            });

            it("reparses eppkeyConfig.keys if the value changes", done => {
                injector.require(["knockout", "GUIAPP/content/viewmodels/base/ko.CustomUtils"], ko => {

                    expect(typeof ko.bindingHandlers.command === "object").toBe(true);
                    expect(typeof ko.bindingHandlers.command.init).toBe("function");

                    const CMD_ID = "1";
                    // prepare custom binding arguments for init
                    const element = jQuery("<div>")[0];

                    // replace default handler
                    const handler = jasmine.createSpy("alphanumericInputHandler")
                        .and.callFake((data) => {
                            expect(ko.isObservable(data.observable)).toBe(true);
                            data.observable(["X"]);
                            return true; // we handled it!
                        });

                    // this is the simulated command-binding configuration
                    const keys = ko.observable('{"1":"TEST"}');
                    const valueAccessor = ko.observable({
                        id: CMD_ID,
                        eppkey: "1",
                        eppkeyConfig: {
                            keys: keys,
                            handler: handler
                        }
                    });
                    const allBindingsAccessor = ko.observable({});

                    // basic mock is ok for our case
                    const viewModel = new Wincor.UI.Content.BaseViewModel();
                    viewModel.onButtonPressed = jasmine.createSpy("onButtonPressed");
                    const bindingContext = {
                        $root: viewModel
                    };

                    Wincor.UI.Content.Command.delegates.hammer = jasmine.createSpyObj('hammer', ['off', 'on', 'remove', 'destroy']);
                    spyOn(Wincor.UI.Content.Commanding, "hasCommand").and.returnValue(false);
                    const add = jasmine.createSpy("add");

                    // simulate class Hammer.Manager and Hammer.Tap constructors
                    spyOn(Hammer, "Manager").and.callFake(function() {
                        this.add = add;
                        this.off = () => {};
                        this.on = () => {};
                        this.remove = ()=>{};
                        this.destroy = ()=>{};
                    });
                    spyOn(Hammer, "Tap").and.callFake(function() {
                        this.__fake = true;
                    });
                    spyOn(Hammer, "Press").and.callFake(function() {
                        this.__fake = true;
                    });

                    // spy call to delegates._init to get access to action, context and args
                    Wincor.UI.Content.Command.delegates._init = jasmine.createSpy("capturedAction");
                    spyOn(JSON, "parse").and.callThrough();
                    // and call it...
                    ko.bindingHandlers.command.init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);

                    // so now we have to trigger the _execute of the created command and check...
                    // we get it from our installed capturedAction spy
                    // expectations
                    expect(Wincor.UI.Content.Command.delegates._init).toHaveBeenCalled();
                    const args = Wincor.UI.Content.Command.delegates._init.calls.first().args;

                    viewModel.onButtonPressed.calls.reset();
                    // now we can trigger the action as commanding would do if an epp button had been pressed...
                    expect(() => {
                        args[0].apply(args[1], args[2]);
                    }).not.toThrow();

                    expect(viewModel.onButtonPressed).toHaveBeenCalledWith("X");

                    expect(JSON.parse.calls.argsFor(0)[0]).toEqual('{"1":"TEST"}');

                    // now keys changes!
                    keys('{"1":"CONFIG_CHANGED"}');
                    expect(JSON.parse.calls.argsFor(1)[0]).toEqual('{"1":"CONFIG_CHANGED"}');

                    viewModel.onButtonPressed.calls.reset();
                    keys('');
                    expect(JSON.parse.calls.argsFor(2)[0]).toEqual('');

                    expect(() => {
                        args[0].apply(args[1], args[2]);
                    }).not.toThrow();

                    expect(viewModel.onButtonPressed).toHaveBeenCalledWith(CMD_ID);
                    done();
                }, done.fail);
            });
        });
    
        describe("gesture binding", () => {
    
            it("uses config.js for GESTURE_CONFIG.Tap configuration as default", done => {
                injector.require(["knockout", "GUIAPP/content/viewmodels/base/ko.CustomUtils"], ko => {
            
                    const element = jQuery("<div>")[0];
            
                    const CMD_ID = "1";
                    // this is the simulated command-binding configuration
                    const valueAccessor = ko.observable({
                        id: CMD_ID,
                    });
                    const allBindingsAccessor = ko.observable({});
            
                    // basic mock is ok for our case
                    const viewModel = new Wincor.UI.Content.BaseViewModel();
                    viewModel.onButtonPressed = jasmine.createSpy("onButtonPressed");
                    const bindingContext = {
                        $root: viewModel
                    };
            
                    Wincor.UI.Content.Command.delegates.hammer = jasmine.createSpyObj('hammer', ['off', 'on', 'remove', 'destroy']);
                    spyOn(Wincor.UI.Content.Commanding, "hasCommand").and.returnValue(false);
                    const add = jasmine.createSpy("add");
            
                    // simulate class Hammer.Manager and Hammer.Tap constructors
                    spyOn(Hammer, "Manager").and.callFake(function() {
                        this.add = add;
                        this.off = () => {
                        };
                        this.on = () => {
                        };
                        this.remove = () => {
                        };
                        this.destroy = () => {
                        };
                    });
                    spyOn(Hammer, "Tap").and.callFake(function(opts) {
                        this.__fake = true;
                        expect(opts.threshold).toBe(123456);
                        expect(opts.time).toBe(4711);
                        done();
                    });
                    spyOn(Hammer, "Press").and.callFake(function() {
                        this.__fake = true;
                    });
                    ko.bindingHandlers.command.init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
            
                }, done.fail);
            });
    
            it("lets command binding override config.js GESTURE_CONFIG.Tap configuration", done => {
                injector.require(["knockout", "GUIAPP/content/viewmodels/base/ko.CustomUtils"], ko => {
            
                    const element = jQuery("<div>")[0];
            
                    const CMD_ID = "1";
                    // this is the simulated command-binding configuration
                    const valueAccessor = ko.observable({
                        id: CMD_ID,
                        tap: { // simulate override
                            threshold: 1,
                            time: 666
                        }
                    });
                    const allBindingsAccessor = ko.observable({});
            
                    // basic mock is ok for our case
                    const viewModel = new Wincor.UI.Content.BaseViewModel();
                    viewModel.onButtonPressed = jasmine.createSpy("onButtonPressed");
                    const bindingContext = {
                        $root: viewModel
                    };
            
                    Wincor.UI.Content.Command.delegates.hammer = jasmine.createSpyObj('hammer', ['off', 'on', 'remove', 'destroy']);
                    spyOn(Wincor.UI.Content.Commanding, "hasCommand").and.returnValue(false);
                    const add = jasmine.createSpy("add");
            
                    // simulate class Hammer.Manager and Hammer.Tap constructors
                    spyOn(Hammer, "Manager").and.callFake(function() {
                        this.add = add;
                        this.off = () => {
                        };
                        this.on = () => {
                        };
                        this.remove = () => {
                        };
                        this.destroy = () => {
                        };
                    });
                    spyOn(Hammer, "Tap").and.callFake(function(opts) {
                        this.__fake = true;
                        expect(opts.threshold).toBe(1);
                        expect(opts.time).toBe(666);
                        done();
                    });
                    spyOn(Hammer, "Press").and.callFake(function() {
                        this.__fake = true;
                    });
                    ko.bindingHandlers.command.init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
            
                }, done.fail);
            });
    
            it("uses config.js for GESTURE_CONFIG.Tap configuration as default", done => {
                injector.require(["knockout", "GUIAPP/content/viewmodels/base/ko.CustomUtils"], ko => {
            
                    const element = jQuery("<div>")[0];
            
                    const CMD_ID = "1";
                    // this is the simulated command-binding configuration
                    const valueAccessor = ko.observable({
                        id: CMD_ID,
                    });
                    const allBindingsAccessor = ko.observable({});
            
                    // basic mock is ok for our case
                    const viewModel = new Wincor.UI.Content.BaseViewModel();
                    viewModel.onButtonPressed = jasmine.createSpy("onButtonPressed");
                    const bindingContext = {
                        $root: viewModel
                    };
            
                    Wincor.UI.Content.Command.delegates.hammer = jasmine.createSpyObj('hammer', ['off', 'on', 'remove', 'destroy']);
                    spyOn(Wincor.UI.Content.Commanding, "hasCommand").and.returnValue(false);
                    const add = jasmine.createSpy("add");
            
                    // simulate class Hammer.Manager and Hammer.Tap constructors
                    spyOn(Hammer, "Manager").and.callFake(function() {
                        this.add = add;
                        this.off = () => {
                        };
                        this.on = () => {
                        };
                        this.remove = () => {
                        };
                        this.destroy = () => {
                        };
                    });
                    spyOn(Hammer, "Tap").and.callFake(function(opts) {
                        this.__fake = true;
                        expect(opts.threshold).toBe(123456);
                        expect(opts.time).toBe(4711);
                        done();
                    });
                    spyOn(Hammer, "Press").and.callFake(function() {
                        this.__fake = true;
                    });
                    ko.bindingHandlers.command.init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
            
                }, done.fail);
            });
    
            it("can override config.js GESTURE_CONFIG.Tap configuration", done => {
                injector.require(["knockout", "GUIAPP/content/viewmodels/base/ko.CustomUtils"], ko => {
            
                    const element = jQuery("<div>")[0];
            
                    const CMD_ID = "1";
                    // this is the simulated command-binding configuration
                    const valueAccessor = ko.observable({
                        id: CMD_ID,
                        tap: { // simulate override
                            threshold: 1,
                            time: 666
                        }
                    });
                    const allBindingsAccessor = ko.observable({});
            
                    // basic mock is ok for our case
                    const viewModel = new Wincor.UI.Content.BaseViewModel();
                    viewModel.onButtonPressed = jasmine.createSpy("onButtonPressed");
                    const bindingContext = {
                        $root: viewModel
                    };
            
                    Wincor.UI.Content.Command.delegates.hammer = jasmine.createSpyObj('hammer', ['off', 'on', 'remove', 'destroy']);
                    spyOn(Wincor.UI.Content.Commanding, "hasCommand").and.returnValue(false);
                    const add = jasmine.createSpy("add");
            
                    // simulate class Hammer.Manager and Hammer.Tap constructors
                    spyOn(Hammer, "Manager").and.callFake(function() {
                        this.add = add;
                        this.off = () => {
                        };
                        this.on = () => {
                        };
                        this.remove = () => {
                        };
                        this.destroy = () => {
                        };
                    });
            
                    spyOn(Hammer, "Press").and.callFake(function() {
                        expect(true).toBe(true);
                        this.__fake = true;
                    });
            
                    spyOn(Hammer, "Tap").and.callFake(function(opts) {
                        this.__fake = true;
                        expect(opts.threshold).toBe(1);
                        expect(opts.time).toBe(666);
                        done();
                    });
                    ko.bindingHandlers.command.init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
            
                }, done.fail);
            });
    
            it("uses config.js for GESTURE_CONFIG.Press configuration as default", done => {
                injector.require(["knockout", "GUIAPP/content/viewmodels/base/ko.CustomUtils"], ko => {
            
                    const element = jQuery("<div>")[0];
            
                    const CMD_ID = "1";
                    // this is the simulated command-binding configuration
                    const valueAccessor = ko.observable({
                        id: CMD_ID,
                    });
                    const allBindingsAccessor = ko.observable({});
            
                    // basic mock is ok for our case
                    const viewModel = new Wincor.UI.Content.BaseViewModel();
                    viewModel.onButtonPressed = jasmine.createSpy("onButtonPressed");
                    const bindingContext = {
                        $root: viewModel
                    };
            
                    Wincor.UI.Content.Command.delegates.hammer = jasmine.createSpyObj('hammer', ['off', 'on', 'remove', 'destroy']);
                    spyOn(Wincor.UI.Content.Commanding, "hasCommand").and.returnValue(false);
                    const add = jasmine.createSpy("add");
            
                    // simulate class Hammer.Manager and Hammer.Press constructors
                    spyOn(Hammer, "Manager").and.callFake(function() {
                        this.add = add;
                        this.off = () => {
                        };
                        this.on = () => {
                        };
                        this.remove = () => {
                        };
                        this.destroy = () => {
                        };
                    });
                    spyOn(Hammer, "Press").and.callFake(function(opts) {
                        this.__fake = true;
                        expect(opts.threshold).toBe(7890);
                        expect(opts.time).toBe(112);
                        done();
                    });
                    spyOn(Hammer, "Tap").and.callFake(function() {
                        this.__fake = true;
                    });
            
                    ko.bindingHandlers.command.init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
            
                }, done.fail);
            });
    
            it("lets command binding override config.js GESTURE_CONFIG.Press configuration", done => {
                injector.require(["knockout", "GUIAPP/content/viewmodels/base/ko.CustomUtils"], ko => {
            
                    const element = jQuery("<div>")[0];
            
                    const CMD_ID = "1";
                    // this is the simulated command-binding configuration
                    const valueAccessor = ko.observable({
                        id: CMD_ID,
                        press: { // simulate override
                            threshold: 15,
                            time: 110
                        }
                    });
                    const allBindingsAccessor = ko.observable({});
            
                    // basic mock is ok for our case
                    const viewModel = new Wincor.UI.Content.BaseViewModel();
                    viewModel.onButtonPressed = jasmine.createSpy("onButtonPressed");
                    const bindingContext = {
                        $root: viewModel
                    };
            
                    Wincor.UI.Content.Command.delegates.hammer = jasmine.createSpyObj('hammer', ['off', 'on', 'remove', 'destroy']);
                    spyOn(Wincor.UI.Content.Commanding, "hasCommand").and.returnValue(false);
                    const add = jasmine.createSpy("add");
            
                    // simulate class Hammer.Manager and Hammer.Press constructors
                    spyOn(Hammer, "Manager").and.callFake(function() {
                        this.add = add;
                        this.off = () => {
                        };
                        this.on = () => {
                        };
                        this.remove = () => {
                        };
                        this.destroy = () => {
                        };
                    });
                    spyOn(Hammer, "Press").and.callFake(function(opts) {
                        this.__fake = true;
                        expect(opts.threshold).toBe(15);
                        expect(opts.time).toBe(110);
                        done();
                    });
                    spyOn(Hammer, "Tap").and.callFake(function() {
                        this.__fake = true;
                    });
                    ko.bindingHandlers.command.init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
            
                }, done.fail);
            });

        });


        describe("autoSizeInputFont binding", () => {
            let Wincor;
            beforeEach(done => {
                console.debug("beforeEach AutoSizeInputFont");

                injector.require(["NamespaceMock"], bundle => {
                    Wincor = window.Wincor = bundle.createWincor();
                    ['ui-content', 'extensions', 'vm-util/UIMovements', 'lib/jquery.transit.min', 'lib/jquery.inputfit']
                        .forEach((dependency) => {
                            injector.mock(dependency, {});
                        });
                    injector.mock('config/Config', {
                        GESTURE_CONFIG: {
                            Tap: {
                                threshold: 123456,
                                time: 4711
                            },
                            Press: {
                                threshold: 7890,
                                time: 112
                            }
                        }
                    });

                    done();
                });

            });

            it("autoSizeInputFont-init-fontsize-check", done => {
                injector.require(["knockout", "GUIAPP/content/viewmodels/base/ko.CustomUtils"], ko => {


                    // prepare inputs for init: element, valueAccessor, viewModel, bindingContext
                    const element = jQuery("<input id='xy' style='font-size: 40px'>")[0];

                    // these are the options
                    const valueAccessor = ko.observable({
                    });
                    const viewModel = new Wincor.UI.Content.BaseViewModel();
                    viewModel.viewHelper.isPopupMessageActive = jasmine.createSpy("viewHelper:isPopupMessageActive").and.returnValue(false);

                    spyOn(viewModel.logger, "error").and.callFake(text => {
                        console.debug(text);
                    });
                    const bindingContext = {
                        $root: viewModel
                    };

                    // and call it...
                    ko.bindingHandlers.autoSizeInputFont.init(element, valueAccessor, void 0, viewModel, bindingContext);
                    expect(element.__maxFontSize).toEqual(40);

                    done();
                }, done.fail);
            });

            it("autoSizeInputFont-init-fontsize-NaN", done => {
                injector.require(["knockout", "GUIAPP/content/viewmodels/base/ko.CustomUtils"], ko => {

                    // prepare inputs for init: element, valueAccessor, viewModel, bindingContext
                    const element = jQuery("<input id='xy'>")[0];

                    // these are the options
                    const valueAccessor = ko.observable({
                    });
                    const viewModel = new Wincor.UI.Content.BaseViewModel();
                    viewModel.viewHelper.isPopupMessageActive = jasmine.createSpy("viewHelper:isPopupMessageActive").and.returnValue(false);

                    spyOn(viewModel.logger, "error").and.callFake(text => {
                        console.debug(text);
                    });
                    const bindingContext = {
                        $root: viewModel
                    };

                    // and call it...
                    ko.bindingHandlers.autoSizeInputFont.init(element, valueAccessor, void 0, viewModel, bindingContext);
                    expect(element.__maxFontSize).toEqual(NaN);

                    done();
                }, done.fail);
            });

            it("autoSizeInputFont-init-with-popupMessageActive", done => {
                injector.require(["knockout", "GUIAPP/content/viewmodels/base/ko.CustomUtils"], ko => {

                    jQuery["fn"]["inputfit"] = jasmine.createSpy("$.inputfit");

                    // prepare inputs for init: element, valueAccessor, viewModel, bindingContext
                    const element = jQuery("<input id='xy' style='font-size: 40px'>")[0];

                    // these are the options
                    const valueAccessor = ko.observable({
                    });
                    const viewModel = new Wincor.UI.Content.BaseViewModel();
                    viewModel.viewHelper.isPopupMessageActive = jasmine.createSpy("viewHelper:isPopupMessageActive").and.returnValue(true);

                    let callback;
                    spyOn(Wincor.UI.Service.Provider.ViewService, "registerForServiceEvent").and.callFake((event, cb) => {
                        callback = cb;
                    });

                    spyOn(viewModel.logger, "error").and.callFake(text => {
                        console.debug(text);
                    });
                    const bindingContext = {
                        $root: viewModel
                    };

                    // and call it...
                    ko.bindingHandlers.autoSizeInputFont.init(element, valueAccessor, void 0, viewModel, bindingContext);
                    expect(callback).toBeDefined();
                    callback();
                    expect(jQuery["fn"]["inputfit"]).toHaveBeenCalledWith({maxSize: 40});
                    expect(element.__maxFontSize).toEqual(40);


                    done();
                }, done.fail);
            });

            it("autoSizeInputFont-init-withOUT-popupMessageActive", done => {
                injector.require(["knockout", "GUIAPP/content/viewmodels/base/ko.CustomUtils"], ko => {

                    jQuery["fn"]["inputfit"] = jasmine.createSpy("$.inputfit");

                    // prepare inputs for init: element, valueAccessor, viewModel, bindingContext
                    const element = jQuery("<input id='xy' style='font-size: 40px'>")[0];

                    // these are the options
                    const valueAccessor = ko.observable({
                    });
                    const viewModel = new Wincor.UI.Content.BaseViewModel();
                    viewModel.viewHelper.isPopupMessageActive = jasmine.createSpy("viewHelper:isPopupMessageActive").and.returnValue(false);

                    let callback;
                    spyOn(Wincor.UI.Service.Provider.ViewService, "registerForServiceEvent").and.callFake((event, cb) => {
                        callback = cb;
                    });

                    spyOn(viewModel.logger, "error").and.callFake(text => {
                        console.debug(text);
                    });
                    const bindingContext = {
                        $root: viewModel
                    };

                    // and call it...
                    ko.bindingHandlers.autoSizeInputFont.init(element, valueAccessor, void 0, viewModel, bindingContext);
                    expect(callback).not.toBeDefined();

                    done();
                }, done.fail);
            });

            it("autoSizeInputFont-update-whenActivated-true", done => {
                injector.require(["knockout", "GUIAPP/content/viewmodels/base/ko.CustomUtils"], ko => {

                    jQuery["fn"]["inputfit"] = jasmine.createSpy("$.inputfit");

                    // prepare inputs for init: element, valueAccessor
                    const element = jQuery("<input id='xy' style='font-size: 40px'>")[0];
                    element.__maxFontSize = 40;

                    // these are the options
                    const valueAccessor = ko.observable({
                    });

                    spyOn(Wincor.UI.Content.ViewModelContainer,"whenActivated").and.returnValue({
                        then: cb => {
                            expect(typeof cb).toBe("function");
                            cb();
                        }
                    });

                    // and call it...
                    ko.bindingHandlers.autoSizeInputFont.update(element, valueAccessor);
                    expect(jQuery["fn"]["inputfit"]).toHaveBeenCalledWith({maxSize: 40});
                    done();
                }, done.fail);
            });

            it("autoSizeInputFont-update-whenActivated-false", done => {
                injector.require(["knockout", "GUIAPP/content/viewmodels/base/ko.CustomUtils"], ko => {

                    jQuery["fn"]["inputfit"] = jasmine.createSpy("$.inputfit");

                    // prepare inputs for init: element, valueAccessor
                    const element = jQuery("<input id='xy' style='font-size: 40px'>")[0];
                    element.__maxFontSize = 40;

                    // these are the options
                    const valueAccessor = ko.observable({
                    });
                    let callback;
                    spyOn(Wincor.UI.Content.ViewModelContainer,"whenActivated").and.returnValue({
                        then: cb => {
                            expect(typeof cb).toBe("function");
                            callback = cb;
                        }
                    });

                    // and call it...
                    ko.bindingHandlers.autoSizeInputFont.update(element, valueAccessor);
                    expect(jQuery["fn"]["inputfit"]).not.toHaveBeenCalled();
                    callback();
                    expect(jQuery["fn"]["inputfit"]).toHaveBeenCalled();
                    done();
                }, done.fail);
            });

        });
    
        describe("svguse binding", () => {
            it("checks use tag", async() => {
                const [ko, util] = await injector.require(["knockout", "GUIAPP/content/viewmodels/base/ko.CustomUtils"]);
                const element = jQuery("<div>");
                element.html("<svg></svg>");
                let $svg = element.find("svg");
                const valueAccessor = ko.observable({
                    name: "test.svg"
                });
                const allBindingsAccessor = ko.observable({});
                const bindingContext = {
                    $root: {
                        logger: Wincor.UI.Content.logger
                    }
                };
                spyOn(jQuery, "ajax").and.callFake(opts => {
                    expect(opts.url).toBe("style/default/images/test.svg");
                    // jasmine.clock().tick(20);
                    opts.success(TEST_SVG);
                });
                
                await util.svguse.update($svg[0], valueAccessor, allBindingsAccessor, {}, bindingContext);

                expect(jQuery.ajax).toHaveBeenCalledTimes(1);
                // reset the AJAX spy
                // jQuery.ajax.and.callThrough();
                // check dev
                const $dev = jQuery("body").find("svg");
                expect($dev.length).toBe(1);
                expect($dev.attr("id")).toBe("svgDef_test");
                expect($dev.attr("area-hidden")).toBe("true");
                expect($dev.attr("style")).toBe("display: none; max-width: 0px; max-height: 0px;");
                const $symbol = $dev.find("symbol");
                expect($symbol.attr("id")).toBe("test_group");
                // check killed content
                expect($dev.find("style").val()).toBe("");
                expect($dev.find("script").length).toBe(0);
                // check use
                expect($svg.attr("viewBox")).toBe("0 0 45 45");
                expect($svg.find("use").attr("class")).toBe("test_group");
                expect($svg.find("use").attr("href")).toBe("#test_group");
                // clear DOM
                $dev.remove();
            });
    
            it("checks 2 use tags", async() => {
                const [ko, util] = await injector.require(["knockout", "GUIAPP/content/viewmodels/base/ko.CustomUtils"]);
                const element = jQuery("<div>");
                element.html("<svg></svg>");
                let $svg = element.find("svg");
                const element2 = jQuery("<div>");
                element2.html("<svg></svg>");
                let $svg2 = element2.find("svg");
                let $body = jQuery("body");
                const valueAccessor = ko.observable({
                    name: "test.svg"
                });
                const allBindingsAccessor = ko.observable({});
                const bindingContext = {
                    $root: {
                        logger: Wincor.UI.Content.logger
                    }
                };
                spyOn(jQuery, "ajax").and.callFake(opts => {
                    expect(opts.url).toBe("style/default/images/test.svg");
                    // jasmine.clock().tick(20);
                    opts.success(TEST_SVG);
                });
        
                await util.svguse.update($svg[0], valueAccessor, allBindingsAccessor, {}, bindingContext);
        
                expect(jQuery.ajax).toHaveBeenCalledTimes(1);
                // check dev
                const $dev = $body.find("svg");
                expect($dev.length).toBe(1);
                expect($dev.attr("id")).toBe("svgDef_test");
                expect($dev.attr("area-hidden")).toBe("true");
                expect($dev.attr("style")).toBe("display: none; max-width: 0px; max-height: 0px;");
                const $symbol = $dev.find("symbol");
                expect($symbol.attr("id")).toBe("test_group");
                // check killed content
                expect($dev.find("style").val()).toBe("");
                expect($dev.find("script").length).toBe(0);
                // check use
                expect($svg.attr("viewBox")).toBe("0 0 45 45");
                expect($svg.find("use").attr("class")).toBe("test_group");
                expect($svg.find("use").attr("href")).toBe("#test_group");
        
                // we call a 2. time and check whether a new AJAX call not have been done:
                await util.svguse.update($svg2[0], valueAccessor, allBindingsAccessor, {}, bindingContext);
                expect(jQuery.ajax).toHaveBeenCalledTimes(1);
                // check use
                expect($svg2.attr("viewBox")).toBe("0 0 45 45");
                expect($svg2.find("use").attr("class")).toBe("test_group");
                expect($svg2.find("use").attr("href")).toBe("#test_group");
                // reset the AJAX spy
                // jQuery.ajax.and.callThrough();
                // clear DOM
                $body.find("svg").remove();
            });
    
            it("checks same svg, 1 x svg use tag and 1 x svg inline tag", async() => {
                const [ko, util] = await injector.require(["knockout", "GUIAPP/content/viewmodels/base/ko.CustomUtils"]);
                const element = jQuery("<div>");
                element.html("<svg></svg>");
                let $svg = element.find("svg");
                const element2 = jQuery("<div>");
                element2.html("<svg></svg>");
                let $svg2 = element2.find("svg");
                let $body = jQuery("body");
                const valueAccessor = ko.observable({
                    name: "test.svg"
                });
                const valueAccessor2 = ko.observable({
                    name: "test.svg",
                    inline: true
                });
                const allBindingsAccessor = ko.observable({});
                const bindingContext = {
                    $root: {
                        logger: Wincor.UI.Content.logger
                    }
                };
                spyOn(jQuery, "ajax").and.callFake(opts => {
                    expect(opts.url).toBe("style/default/images/test.svg");
                    // jasmine.clock().tick(20);
                    opts.success(TEST_SVG);
                });
        
                await util.svguse.update($svg[0], valueAccessor, allBindingsAccessor, {}, bindingContext);
        
                expect(jQuery.ajax).toHaveBeenCalledTimes(1);
                // check dev
                const $dev = $body.find("svg");
                expect($dev.length).toBe(1);
                expect($dev.attr("id")).toBe("svgDef_test");
                expect($dev.attr("area-hidden")).toBe("true");
                expect($dev.attr("style")).toBe("display: none; max-width: 0px; max-height: 0px;");
                const $symbol = $dev.find("symbol");
                expect($symbol.attr("id")).toBe("test_group");
                // check killed content
                expect($dev.find("style").val()).toBe("");
                expect($dev.find("script").length).toBe(0);
                // check use
                expect($svg.attr("viewBox")).toBe("0 0 45 45");
                expect($svg.find("use").attr("class")).toBe("test_group");
                expect($svg.find("use").attr("href")).toBe("#test_group");
        
                // we call a 2. time and check whether a new AJAX call MUST have been done:
                await util.svguse.update($svg2[0], valueAccessor2, allBindingsAccessor, {}, bindingContext);
                expect(jQuery.ajax).toHaveBeenCalledTimes(2);
                // check use
                expect($svg2.attr("viewBox")).toBe("0 0 45 45");
                expect($svg2.attr("class")).toBe("test_clone");
                expect($svg2.attr("data-clone-name")).toBe("test_clone");
                // reset the AJAX spy
                // jQuery.ajax.and.callThrough();
                // clear DOM
                $body.find("svg").remove();
            });
    
            it("checks svg inline", async() => {
                const [ko, util] = await injector.require(["knockout", "GUIAPP/content/viewmodels/base/ko.CustomUtils"]);
                const element = jQuery("<div>");
                element.html("<svg></svg>");
                let $svg = element.find("svg");
                const valueAccessor = ko.observable({
                    name: "test.svg",
                    inline: true
                });
                const allBindingsAccessor = ko.observable({});
                const bindingContext = {
                    $root: {
                        logger: Wincor.UI.Content.logger
                    }
                };
                spyOn(jQuery, "ajax").and.callFake(opts => {
                    expect(opts.url).toBe("style/default/images/test.svg");
                    // jasmine.clock().tick(20);
                    opts.success(TEST_SVG);
                });
        
                await util.svguse.update($svg[0], valueAccessor, allBindingsAccessor, {}, bindingContext);
        
                expect(jQuery.ajax).toHaveBeenCalledTimes(1);
                // check dev
                const $dev = jQuery("body").find("svg");
                expect($dev.length).toBe(1);
                expect($dev.attr("id")).toBe("svgDefCon_test");
                expect($dev.attr("area-hidden")).toBe("true");
                expect($dev.attr("style")).toBe("display: none; max-width: 0px; max-height: 0px;");
                // check svg
                expect($svg.attr("viewBox")).toBe("0 0 45 45");
                expect($svg.attr("class")).toBe("test_clone");
                expect($svg.attr("data-clone-name")).toBe("test_clone");
                expect($svg.attr("area-hidden")).toBe(void 0);
                expect($svg.attr("style")).toBe(void 0);

                // reset the AJAX spy
                // jQuery.ajax.and.callThrough();
                // clear DOM
                $dev.remove();
            });
    
            it("checks svg inline with afterRender", async() => {
                const [ko, util] = await injector.require(["knockout", "GUIAPP/content/viewmodels/base/ko.CustomUtils"]);
                const element = jQuery("<div>");
                element.html("<svg></svg>");
                let $svg = element.find("svg");
                const valueAccessor = ko.observable({
                    name: "test.svg",
                    inline: true,
                    afterRender: jasmine.createSpy("testHandler").and.callFake((item, rootCtx) => {
                        expect(rootCtx.myObservable()).toBe("hello");
                    })
                });
                const allBindingsAccessor = ko.observable({});
                const viewModel = {};
                const bindingContext = {
                    $root: {
                        logger: new Wincor.UI.Content.BaseViewModel().logger,
                        vmContainer: { currentViewKey: "AnyViewKey"},
                        myObservable: ko.observable("hello")
                    },
                };
                spyOn(jQuery, "ajax").and.callFake(opts => {
                    expect(opts.url).toBe("style/default/images/test.svg");
                    // jasmine.clock().tick(20);
                    opts.success(TEST_SVG);
                });
        
                await util.svguse.update($svg[0], valueAccessor, allBindingsAccessor, viewModel, bindingContext);
        
                expect(jQuery.ajax).toHaveBeenCalledTimes(1);
                // check dev
                const $dev = jQuery("body").find("svg");
                expect($dev.length).toBe(1);
                expect($dev.attr("id")).toBe("svgDefCon_test");
                expect($dev.attr("area-hidden")).toBe("true");
                expect($dev.attr("style")).toBe("display: none; max-width: 0px; max-height: 0px;");
                // check svg
                expect(valueAccessor().afterRender).toHaveBeenCalledTimes(1);
                expect($svg.attr("viewBox")).toBe("0 0 45 45");
                expect($svg.attr("class")).toBe("test_clone");
                expect($svg.attr("data-clone-name")).toBe("test_clone");
                expect($svg.attr("area-hidden")).toBe(void 0);
                expect($svg.attr("style")).toBe(void 0);
                // reset the AJAX spy
                //jQuery.ajax.and.callThrough();
                // clear DOM
                $dev.remove();
            });
    
            it("checks svg failure: mandatory attribute", async() => {
                const [ko, util] = await injector.require(["knockout", "GUIAPP/content/viewmodels/base/ko.CustomUtils"]);
                const element = jQuery("<div>");
                element.html("<svg></svg>");
                let $svg = element.find("svg");
                const valueAccessor = ko.observable({
                    // name: "test.svg"
                });
                const allBindingsAccessor = ko.observable({});
                const viewModel = {};
                const bindingContext = {
                    $root: {
                        logger: new Wincor.UI.Content.BaseViewModel().logger,
                        vmContainer: {currentViewKey: "AnyViewKey"},
                        myObservable: ko.observable("hello")
                    }
                };
                spyOn(jQuery, "ajax").and.callFake(opts => {
                    expect(opts.url).toBe("style/default/images/test.svg");
                    // jasmine.clock().tick(20);
                    opts.success(TEST_SVG);
                });
                const errors = [];
                const warns = [];
                spyOn(bindingContext.$root.logger, "error").and.callFake(msg => {
                    errors.push(msg);
                });
                spyOn(bindingContext.$root.logger, "log").and.callFake(msg => {
                    warns.push(msg);
                });

                await util.svguse.update($svg[0], valueAccessor, allBindingsAccessor, viewModel, bindingContext);
                
                expect(bindingContext.$root.logger.error).toHaveBeenCalledTimes(1);
                expect(errors[0].includes("'name' mandatory attribute is not given!")).toBe(true);
                expect(jQuery.ajax).not.toHaveBeenCalled();
                expect($svg.attr("style")).toBe("display: none;");
                
                // reset the AJAX spy
                //jQuery.ajax.and.callThrough();
            });
    
            it("checks svg failure: afterRender function script error", async() => {
                const [ko, util] = await injector.require(["knockout", "GUIAPP/content/viewmodels/base/ko.CustomUtils"]);
                const element = jQuery("<div>");
                element.html("<svg></svg>");
                let $svg = element.find("svg");
                const valueAccessor = ko.observable({
                    name: "test.svg",
                    inline: true,
                    afterRender: jasmine.createSpy("testHandler").and.callFake((item, rootCtx) => {
                        rootCtx.thisCallIsCrap();
                    })
                });
                const allBindingsAccessor = ko.observable({});
                const viewModel = {};
                const bindingContext = {
                    $root: {
                        logger: new Wincor.UI.Content.BaseViewModel().logger,
                        vmContainer: {currentViewKey: "AnyViewKey"},
                        myObservable: ko.observable("hello")
                    },
                };
                spyOn(jQuery, "ajax").and.callFake(opts => {
                    expect(opts.url).toBe("style/default/images/test.svg");
                    // jasmine.clock().tick(20);
                    opts.success(TEST_SVG);
                });
                const errors = [];
                const warns = [];
                spyOn(bindingContext.$root.logger, "error").and.callFake(msg => {
                    errors.push(msg);
                });
                spyOn(bindingContext.$root.logger, "log").and.callFake(msg => {
                    warns.push(msg);
                });
        
                await util.svguse.update($svg[0], valueAccessor, allBindingsAccessor, viewModel, bindingContext);
        
                expect(bindingContext.$root.logger.error).toHaveBeenCalledTimes(1);
                expect(errors[0].includes("thisCallIsCrap is not a function")).toBe(true);
                expect(jQuery.ajax).toHaveBeenCalled();
                expect($svg.attr("style")).toBe("display: none;");
    
                // reset the AJAX spy
                //jQuery.ajax.and.callThrough();
                // reset logger spies
                bindingContext.$root.logger.log.and.callThrough();
                bindingContext.$root.logger.error.and.callThrough();
                // clear DOM
                const $dev = jQuery("body").find("svg");
                $dev.remove();
            });
    
            it("checks svg failure: SVG parsing error - no data", async() => {
                const [ko, util] = await injector.require(["knockout", "GUIAPP/content/viewmodels/base/ko.CustomUtils"]);
                const element = jQuery("<div>");
                element.html("<svg></svg>");
                let $svg = element.find("svg");
                const valueAccessor = ko.observable({
                    name: "test.svg",
                    inline: true,
                    afterRender: jasmine.createSpy("testHandler").and.callFake((item, rootCtx) => {
                        rootCtx.thisCallIsCrap();
                    })
                });
                const allBindingsAccessor = ko.observable({});
                const viewModel = {};
                const bindingContext = {
                    $root: {
                        logger: new Wincor.UI.Content.BaseViewModel().logger,
                        vmContainer: {currentViewKey: "AnyViewKey"},
                        myObservable: ko.observable("hello")
                    },
                };
                spyOn(jQuery, "ajax").and.callFake(opts => {
                    expect(opts.url).toBe("style/default/images/test.svg");
                    // jasmine.clock().tick(20);
                    opts.success();
                });
                const errors = [];
                const warns = [];
                spyOn(bindingContext.$root.logger, "error").and.callFake(msg => {
                    errors.push(msg);
                });
                spyOn(bindingContext.$root.logger, "log").and.callFake(msg => {
                    warns.push(msg);
                });
        
                await util.svguse.update($svg[0], valueAccessor, allBindingsAccessor, viewModel, bindingContext);
        
                expect(bindingContext.$root.logger.error).toHaveBeenCalledTimes(1);
                expect(errors[0].includes("svguse: No data for SVG reference for")).toBe(true);
                expect(jQuery.ajax).toHaveBeenCalled();
                expect($svg.attr("style")).toBe("display: none;");
        
                // reset the AJAX spy
                //jQuery.ajax.and.callThrough();
                // reset logger spies
                bindingContext.$root.logger.log.and.callThrough();
                bindingContext.$root.logger.error.and.callThrough();
            });
    
            it("checks svg failure: SVG parsing error - invalid content", async() => {
                const [ko, util] = await injector.require(["knockout", "GUIAPP/content/viewmodels/base/ko.CustomUtils"]);
                const element = jQuery("<div>");
                element.html("<svg></svg>");
                let $svg = element.find("svg");
                const valueAccessor = ko.observable({
                    name: "test.svg",
                    inline: true,
                    afterRender: jasmine.createSpy("testHandler").and.callFake((item, rootCtx) => {
                        rootCtx.thisCallIsCrap();
                    })
                });
                const allBindingsAccessor = ko.observable({});
                const viewModel = {};
                const bindingContext = {
                    $root: {
                        logger: new Wincor.UI.Content.BaseViewModel().logger,
                        vmContainer: {currentViewKey: "AnyViewKey"},
                        myObservable: ko.observable("hello")
                    },
                };
                spyOn(jQuery, "ajax").and.callFake(opts => {
                    expect(opts.url).toBe("style/default/images/test.svg");
                    // jasmine.clock().tick(20);
                    opts.success("<script ");
                });
                const errors = [];
                const warns = [];
                spyOn(bindingContext.$root.logger, "error").and.callFake(msg => {
                    errors.push(msg);
                });
                spyOn(bindingContext.$root.logger, "log").and.callFake(msg => {
                    warns.push(msg);
                });
        
                await util.svguse.update($svg[0], valueAccessor, allBindingsAccessor, viewModel, bindingContext);
        
                expect(bindingContext.$root.logger.error).toHaveBeenCalledTimes(1);
                expect(errors[0].includes("svguse: Could not detect script tag as expected for")).toBe(true);
                expect(jQuery.ajax).toHaveBeenCalled();
                expect($svg.attr("style")).toBe("display: none;");
        
                // reset the AJAX spy
                //jQuery.ajax.and.callThrough();
                // reset logger spies
                bindingContext.$root.logger.log.and.callThrough();
                bindingContext.$root.logger.error.and.callThrough();
            });
    
            it("checks svg failure: SVG parsing error - invalid content: begin SVG tag end", async() => {
                const [ko, util] = await injector.require(["knockout", "GUIAPP/content/viewmodels/base/ko.CustomUtils"]);
                const element = jQuery("<div>");
                element.html("<svg></svg>");
                let $svg = element.find("svg");
                const valueAccessor = ko.observable({
                    name: "test.svg",
                });
                const allBindingsAccessor = ko.observable({});
                const viewModel = {};
                const bindingContext = {
                    $root: {
                        logger: new Wincor.UI.Content.BaseViewModel().logger,
                        vmContainer: {currentViewKey: "AnyViewKey"},
                        myObservable: ko.observable("hello")
                    },
                };
                spyOn(jQuery, "ajax").and.callFake(opts => {
                    expect(opts.url).toBe("style/default/images/test.svg");
                    opts.success(`<svg viewBox="0 0 45 45" `);
                });
                const errors = [];
                const warns = [];
                spyOn(bindingContext.$root.logger, "error").and.callFake(msg => {
                    errors.push(msg);
                });
                spyOn(bindingContext.$root.logger, "log").and.callFake(msg => {
                    warns.push(msg);
                });
        
                await util.svguse.update($svg[0], valueAccessor, allBindingsAccessor, viewModel, bindingContext);
        
                expect(bindingContext.$root.logger.error).toHaveBeenCalledTimes(1);
                expect(errors[0].includes("svguse: Problem to parse SVG=test.svg regarding begin svg tag end. Expecting '<svg ... >'")).toBe(true);
                expect(jQuery.ajax).toHaveBeenCalled();
                expect($svg.attr("style")).toBe("display: none;");
        
                // reset the AJAX spy
                //jQuery.ajax.and.callThrough();
                // reset logger spies
                bindingContext.$root.logger.log.and.callThrough();
                bindingContext.$root.logger.error.and.callThrough();
            });
    
            it("checks svg failure: SVG parsing error - invalid content: begin SVG tag", async() => {
                const [ko, util] = await injector.require(["knockout", "GUIAPP/content/viewmodels/base/ko.CustomUtils"]);
                const element = jQuery("<div>");
                element.html("<svg></svg>");
                let $svg = element.find("svg");
                const valueAccessor = ko.observable({
                    name: "test.svg",
                });
                const allBindingsAccessor = ko.observable({});
                const viewModel = {};
                const bindingContext = {
                    $root: {
                        logger: new Wincor.UI.Content.BaseViewModel().logger,
                        vmContainer: {currentViewKey: "AnyViewKey"},
                        myObservable: ko.observable("hello")
                    },
                };
                spyOn(jQuery, "ajax").and.callFake(opts => {
                    expect(opts.url).toBe("style/default/images/test.svg");
                    opts.success(`<svg </svg>`);
                });
                const errors = [];
                const warns = [];
                spyOn(bindingContext.$root.logger, "error").and.callFake(msg => {
                    errors.push(msg);
                });
                spyOn(bindingContext.$root.logger, "log").and.callFake(msg => {
                    warns.push(msg);
                });
        
                await util.svguse.update($svg[0], valueAccessor, allBindingsAccessor, viewModel, bindingContext);
        
                expect(bindingContext.$root.logger.error).toHaveBeenCalledTimes(1);
                expect(errors[0].includes("svguse: Problem to parse SVG=test.svg regarding begin svg tag end. Expecting '<svg ... >'")).toBe(true);
                expect(jQuery.ajax).toHaveBeenCalled();
                expect($svg.attr("style")).toBe("display: none;");
        
                // reset the AJAX spy
                //jQuery.ajax.and.callThrough();
                // reset logger spies
                bindingContext.$root.logger.log.and.callThrough();
                bindingContext.$root.logger.error.and.callThrough();
            });
    
            it("checks svg parsing: optional width & height attributes", async() => {
                const [ko, util] = await injector.require(["knockout", "GUIAPP/content/viewmodels/base/ko.CustomUtils"]);
                const element = jQuery("<div>");
                element.html("<svg></svg>");
                let $svg = element.find("svg");
                const valueAccessor = ko.observable({
                    name: "test.svg",
                });
                const allBindingsAccessor = ko.observable({});
                const viewModel = {};
                const bindingContext = {
                    $root: {
                        logger: new Wincor.UI.Content.BaseViewModel().logger,
                        vmContainer: {currentViewKey: "AnyViewKey"},
                        myObservable: ko.observable("hello")
                    },
                };
                spyOn(jQuery, "ajax").and.callFake(opts => {
                    expect(opts.url).toBe("style/default/images/test.svg");
                    opts.success(`<svg width="24px" height="24px"> </svg>`);
                });
                const errors = [];
                const warns = [];
                spyOn(bindingContext.$root.logger, "error").and.callFake(msg => {
                    errors.push(msg);
                });
                spyOn(bindingContext.$root.logger, "log").and.callFake(msg => {
                    warns.push(msg);
                });
        
                await util.svguse.update($svg[0], valueAccessor, allBindingsAccessor, viewModel, bindingContext);

                const $dev = jQuery("body").find("svg");
                expect($dev.length).toBe(1);
                expect($dev.attr("id")).toBe("svgDef_test");
                expect($dev.attr("area-hidden")).toBe("true");
                expect($dev.attr("style")).toBe("display: none; max-width: 0px; max-height: 0px;");
                // check svg
                expect($svg.attr("width")).toBe("24px");
                expect($svg.attr("height")).toBe("24px");
                expect($svg.attr("style")).toBe(void 0);
                // reset the AJAX spy
                //jQuery.ajax.and.callThrough();
                // clear DOM
                $dev.remove();
            });
    
    
        });
    
    });
});
