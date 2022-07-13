/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ VirtualKeyboardViewModel_test.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

define(['lib/Squire'], function(Squire) {

    let injector;
    let ko;
    let Wincor;
    let jQuery;

    describe("VirtualKeyboard", () => {

        beforeEach(done => {
            injector = new Squire();
            injector.require(["NamespaceMock"], bundle => {
                Wincor = window.Wincor = bundle.createWincor();
                ko = Wincor.ko = window.ko = bundle.ko;
                jQuery = window.jQuery = bundle.jQuery;
                this.LAYOUTS = {
                    loadLayout: jasmine.createSpy("loadLayout")
                };
                
                Wincor.UI.Content.BaseViewModel = class BaseViewModel extends Wincor.UI.Content.BaseViewModel {
                    constructor() {
                        super();
                    }
                    observe() {}
                    clean() {}
                    onInitTextAndData() {}
                    onDeactivated() {}
                };
                
                injector
                    .mock("jquery", jQuery)
                    .mock("knockout", ko)
                    .mock("extensions", bundle.ext)
                    .mock("ui-content", Wincor.UI.Content)
                    .store("config/Config")
                    .mock("config/Config", { // copy of real one
                        viewType: "touch",
                        VIRTUAL_KEYBOARD_CONFIG: {
                            useAppOverlay: true,
                            styleAppContentClass: "", // a style class name for hiding the flexMain content
                            moveContainer: {
                                distance: -1,
                                targetSelector: "#flexMain, #flexHeader"
                            },
                            nextFieldOnEnter: false,
                            useStandardShowHide: true,
                            inputFieldFocusEffect: "pulsate",
                            originOut: {transformOrigin: '50% 100%'},
                            transitionOut: {perspective: '1000px', rotateX: '75deg', y: '100%'},
                            originIn: {transformOrigin: '50% 100%'},
                            transitionIn: {perspective: '1000px', rotateX: '0deg', y: '0%'},
                            transitionTime: 350,
                            moveTime: 350,
                            autoLayout: true,
                            autoDirection: false, // rtl has strange behaviour regarding selectionStart and selectionEnd... like:
                            inputContainer: "#applicationHost",
                            inputTarget: void 0,
                            enterCallback: void 0, // enterCallback can decide whether to process default handling by returning true/false
                            keyPressCallback: void 0, // keyPressCallback can decide whether to process default handling by returning true/false
                            disabledInputIds: ["generalVKInput", "generalInputMenu"],
                            defaultLanguage: "en-us",
                            validNodeNames: ["INPUT", "TEXTAREA"],
                            shiftKeyId: "shiftKey",
                            capsLockKeyId: "",
                            keyboardType: "KEYBOARD",
                            keyboardElementId: "virtualKeyboardContainer",
                            onStateChangedHandler: null, //function that will receive the focusIn event for any input. The function can return true to avoid the default onFocusIn function of VirtualKeyboardViewModel to run.
                            onFocusInHandler: null, //function that will receive the focusIn event for any input. The function can return true to avoid the default onFocusIn function of VirtualKeyboardViewModel to run.
                            getSourceObservable: null, // function that will be called for input manipulation. It has to return the source observable.
                            getDataValidObservable: null, // function that will be called for input manipulation. It has to return the source observable.
                            getTargetObservable: null, // function that will be called for input manipulation. It has to return the target observable.
                            forbiddenCharCodes: [], // leftcursor, right cursor and del
                            skipTypes: {
                                "checkbox": true,
                                "radio": true,
                                "range": true,
                                "date": true,
                                "time": true,
                                "color": true,
                                "datetime-local": true,
                                "datetime": true
                            },
                            beep: false, // read from registry
                            beepEpp: false, // read from registry
                            inputType2Layout: { // maps type atrribs of input elements to VK LAYOUT/KEY_MAPPING
                                "number": "NUMPAD",
                                "tel": "NUMPAD",
                                "address": ["KEYBOARD", "KEYBOARD_ALPHA"]
                            },
                            eppKeyMap: { // maps eppkey event id to logical VK button id
                                "CONFIRM": "ENTER",
                                "CLEAR": "BACKSPACE",
                                "BACKSPACE": "BACKSPACE"
                            }
                        }
                    })
                    .mock("vm-container", Wincor.UI.Content.ViewModelContainer)
                    .mock("vm-util/UICommanding", Wincor.UI.Content.Commanding)
                    .mock("basevm", Wincor.UI.Content.BaseViewModel)
                    .mock("code-behind/VirtualKeyboardKeyCodes", this.LAYOUTS);
                ["lib/hammer.min", "jquery-ui"]
                    .forEach((dep) => { injector.mock(dep, {}); });
                done();
            });
        });

        afterEach(() => {
            injector.remove();
        });

        describe("initialization", () => {

            it("sets correct default options on 'observe'", done => {
                injector.require(['GUIAPP/content/viewmodels/base/VirtualKeyboardViewModel'], () => {
                    // options are set to default values after observe has been called
                    const vk = new Wincor.UI.Content.VirtualKeyboardViewModel();
                    vk.observe();
                    const defOpts = vk.options;
                    expect(defOpts.useAppOverlay).toBe(true);
                    expect(defOpts.useStandardShowHide).toBe(true);
                    expect(defOpts.inputFieldFocusEffect).toBe("pulsate");
                    expect(defOpts.originOut).toEqual({transformOrigin: '50% 100%'});
                    expect(defOpts.transitionOut).toEqual({perspective: '1000px', rotateX: '75deg', y: '100%'});
                    expect(defOpts.originIn).toEqual({transformOrigin: '50% 100%'});
                    expect(defOpts.transitionIn).toEqual({perspective: '1000px', rotateX: '0deg', y: '0%'});
                    expect(defOpts.transitionTime).toBe(350);
                    expect(defOpts.moveTime).toBe(350);
                    expect(defOpts.autoLayout).toBe(true);
                    expect(defOpts.autoDirection).toBe(false);
                    expect(defOpts.inputContainer).toBe("#applicationHost");
                    expect(defOpts.inputTarget).toBe(void 0);
                    expect(defOpts.enterCallback).toBe(undefined);
                    expect(defOpts.disabledInputIds.length).toBe(2);
                    expect(defOpts.disabledInputIds).toEqual(jasmine.arrayContaining(["generalVKInput", "generalInputMenu"]));
                    expect(defOpts.defaultLanguage).toBe("en-us");
                    expect(defOpts.validNodeNames.length).toBe(2);
                    expect(defOpts.validNodeNames).toEqual(jasmine.arrayContaining(["INPUT", "TEXTAREA"]));
                    expect(defOpts.shiftKeyId).toBe("shiftKey");
                    expect(defOpts.capsLockKeyId).toBe("");
                    expect(defOpts.keyboardType).toBe("KEYBOARD");
                    expect(defOpts.keyboardElementId).toBe("virtualKeyboardContainer");
                    expect(defOpts.onStateChangedHandler).toBe(null);
                    expect(defOpts.onFocusInHandler).toBe(null);
                    expect(defOpts.getSourceObservable).toBe(null);
                    expect(defOpts.getDataValidObservable).toBe(null);
                    expect(defOpts.getTargetObservable).toBe(null);
                    expect(Array.isArray(defOpts.forbiddenCharCodes)).toBe(true);
                    expect(defOpts.forbiddenCharCodes.length).toBe(0);
                    expect(defOpts.skipTypes).toEqual({
                        "checkbox": true,
                        "radio": true,
                        "range": true,
                        "date": true,
                        "time": true,
                        "color": true,
                        "datetime-local": true,
                        "datetime": true
                    });
                    expect(defOpts.beep).toBe(false);
                    expect(Object.keys(defOpts.inputType2Layout).length).toBe(3);
                    expect(Object.keys(defOpts.inputType2Layout)).toEqual(jasmine.arrayContaining(["number", "tel", "address"]));
                    expect(defOpts.inputType2Layout.number).toBe("NUMPAD");
                    expect(defOpts.inputType2Layout.tel).toBe("NUMPAD");
                    expect(defOpts.inputType2Layout.address).toEqual(jasmine.arrayContaining(["KEYBOARD", "KEYBOARD_ALPHA"]));

                    expect(vk.activeLayout()).toBe("KEYBOARD");
                    done();
                });
            });

            it("does setup correctly on 'observe'", done => {
                injector.require(['GUIAPP/content/viewmodels/base/VirtualKeyboardViewModel'], () => {
                    // options are set to default values after observe has been called
                    
                    spyOn(Wincor.UI.Content.BaseViewModel.prototype, "observe").and.callThrough();
                    
                    const vk = new Wincor.UI.Content.VirtualKeyboardViewModel();
                    const g = jasmine.createSpy("getSrcObservable");
                    const t = jasmine.createSpy("getTgtObservable");
                    const v = jasmine.createSpy("getDataValidObservable");
                    const additionalOpts = {
                        ignorableOption: 4711, // unknown but never mind
                        autoLayout: false,     // override default
                        getSourceObservable: g,
                        getTargetObservable: t,
                        getDataValidObservable: v
                    };
                    vk.observe(additionalOpts);
                    // check options merging
                    expect(vk.activeLayout()).toBe("KEYBOARD");
                    expect(vk.options.ignorableOption).toBe(4711);
                    expect(vk.options.autoLayout).toBe(false);

                    // check if observable getters are called with current inputTarget as argument
                    // fake inputTarget first
                    const ip = 112;
                    vk.inputTarget = ip;
                    vk.getSourceObservable();
                    vk.getTargetObservable();
                    vk.getDataValidObservable();
                    expect(g).toHaveBeenCalledTimes(1);
                    expect(g).toHaveBeenCalledWith(ip);
                    expect(t).toHaveBeenCalledTimes(1);
                    expect(t).toHaveBeenCalledWith(ip);
                    expect(v).toHaveBeenCalledTimes(1);
                    expect(v).toHaveBeenCalledWith(ip);

                    expect(Wincor.UI.Content.BaseViewModel.prototype.observe).toHaveBeenCalledWith("virtualKeyboardContainer");
                    done();
                });
            });

            it("installs required handlers in 'onInitTextAndData'", done => {
                injector.require(['GUIAPP/content/viewmodels/base/VirtualKeyboardViewModel'], () => {
                    // options are set to default values after observe has been called
                    const vk = new Wincor.UI.Content.VirtualKeyboardViewModel();
                    const dataKeys = [];
                    const textKeys = [];
                    const initKeysSpy = jasmine.createSpy("initKeys");

                    // prepare some stuff
                    //this.LAYOUTS["en-us"] = null;
                    vk.initKeys = initKeysSpy;
                    vk.onInteractive = jasmine.createSpy("onInteractive");
                    vk.onContentUpdated = jasmine.createSpy("onContentUpdated");
                    Wincor.UI.Service.Provider.ViewService.registerForServiceEvent = jasmine.createSpy("ViewService.registerForServiceEvent");
                    Wincor.UI.Service.Provider.LocalizeService.registerForServiceEvent = jasmine.createSpy("LocalizeService.registerForServiceEvent");
                    vk.options = {
                        defaultLanguage: "en-US"
                    };
                    vk.LAYOUTS = this.LAYOUTS;
                    
                    spyOn(window, "require").and.callFake((dep, cb) => {
                        cb("VKComponent");
                    });
                    vk.onInitTextAndData({textKeys: textKeys, dataKeys: dataKeys});
                    expect(dataKeys.length).toBe(2);
                    expect(initKeysSpy).toHaveBeenCalledTimes(1);
                    expect(Wincor.UI.Service.Provider.ViewService.registerForServiceEvent).toHaveBeenCalledTimes(1);
                    expect(Wincor.UI.Service.Provider.ViewService.registerForServiceEvent.calls.first().args[0]).toBe("CONTENT_UPDATE");
                    expect(typeof Wincor.UI.Service.Provider.ViewService.registerForServiceEvent.calls.first().args[1]).toBe("function");
                    expect(vk.onContentUpdated).toHaveBeenCalledTimes(0);
                    expect(Wincor.UI.Service.Provider.ViewService.registerForServiceEvent.calls.first().args[1].bind(null, 1234)).not.toThrow();
                    expect(vk.onContentUpdated).toHaveBeenCalledTimes(1);
                    expect(vk.onContentUpdated).toHaveBeenCalledWith(1234);
                    expect(Wincor.UI.Service.Provider.LocalizeService.registerForServiceEvent).toHaveBeenCalledTimes(1);
                    vk.vmContainer.whenActivated()
                        .then(() => {
                            expect(vk.onInteractive).toHaveBeenCalledTimes(1);
                            expect(vk.KEYBOARD_TYPE).toBe("VKComponent");
                            done();
                        });
                });
            });
            
            it("loads language specific layout on 'initKeys'", done => {
                injector.require(['GUIAPP/content/viewmodels/base/VirtualKeyboardViewModel'], () => {
                    // options are set to default values after observe has been called
                    const vk = new Wincor.UI.Content.VirtualKeyboardViewModel();
                    const KEYBOARD_TYPE = "KEYBOARD";
                    // prepare some stuff
                    vk.options = {
                        keyboardType: KEYBOARD_TYPE,
                        defaultLanguage: "en-US"
                    };
                    const resolved = Promise.resolve();
                    this.LAYOUTS.loadLayout = this.LAYOUTS.loadLayout.and.callFake(() => {
                        this.LAYOUTS["en-us"] = {
                            KEYBOARD: {}
                        };
                        return resolved;
                    });
                    vk.LAYOUTS = this.LAYOUTS;
                    vk.initKeys()
                        .then(() => {
                            expect(this.LAYOUTS.loadLayout).toHaveBeenCalledWith("en-us");
                            expect(vk.initialized).toBe(true);
                            expect(vk.activeLayout()).toBe(KEYBOARD_TYPE);
                            done();
                        });
                });
            });
        });

        describe("configuration", () => {

            it("allows overriding and configuring get(Source/Target/DataValid)Observable functions", done => {
                injector.require(['GUIAPP/content/viewmodels/base/VirtualKeyboardViewModel'], () => {
                    // options are set to default values after observe has been called

                    const vk = new Wincor.UI.Content.VirtualKeyboardViewModel();
                    vk.keys = {
                        LEFT: {
                            enabled: jasmine.createSpy("keyLeftEnabled")
                        },
                        RIGHT: {
                            enabled: jasmine.createSpy("keyRightEnabled")
                        }
                    };

                    vk.onButtonPressed = jasmine.createSpy("onButtonPressed");
                    vk.insertInInputTarget = jasmine.createSpy("insertInInputTarget");
                    const EVENT = {
                        key: ["*"],// must have length 1 to pass to "insertInInputTarget"
                        preventDefault: jasmine.createSpy("preventDefault"),
                        stopPropagation: jasmine.createSpy("stopPropagation")
                    };
                    [8,13,39,37,38,40]
                        .forEach((keyCode) => {
                            EVENT.keyCode = keyCode;
                            vk.dispatchKeyDownToInputTarget.call(vk, EVENT);
                            expect(EVENT.preventDefault).toHaveBeenCalledTimes(1);
                            expect(EVENT.stopPropagation).toHaveBeenCalledTimes(1);
                            expect(vk.onButtonPressed).toHaveBeenCalledTimes(1);
                            EVENT.preventDefault.calls.reset();
                            EVENT.stopPropagation.calls.reset();
                            vk.onButtonPressed.calls.reset();
                        });
                    expect(vk.insertInInputTarget).not.toHaveBeenCalled();

                    [1,2,3,4,5,6,7,9,10,11,12,14]
                        .forEach((keyCode) => {
                            EVENT.keyCode = keyCode;
                            vk.dispatchKeyDownToInputTarget(EVENT);
                            expect(EVENT.preventDefault).toHaveBeenCalledTimes(1);
                            expect(EVENT.stopPropagation).toHaveBeenCalledTimes(1);
                            expect(vk.insertInInputTarget).toHaveBeenCalledTimes(1);
                            EVENT.preventDefault.calls.reset();
                            EVENT.stopPropagation.calls.reset();
                            vk.insertInInputTarget.calls.reset();
                        });
                    expect(vk.onButtonPressed).toHaveBeenCalledTimes(0);

                    done();
                });
            });
        });

        describe("user interaction", () => {
            it("passes hardware-keyboard events to appropriate functions", done => {
                injector.require(['GUIAPP/content/viewmodels/base/VirtualKeyboardViewModel'], () => {
                    // options are set to default values after observe has been called

                    const vk = new Wincor.UI.Content.VirtualKeyboardViewModel();
                    vk.keys = {
                        LEFT: {
                            enabled: jasmine.createSpy("keyLeftEnabled")
                        },
                        RIGHT: {
                            enabled: jasmine.createSpy("keyRightEnabled")
                        }
                    };

                    vk.onButtonPressed = jasmine.createSpy("onButtonPressed");
                    vk.insertInInputTarget = jasmine.createSpy("insertInInputTarget");
                    const EVENT = {
                        key: ["*"],// must have length 1 to pass to "insertInInputTarget"
                        preventDefault: jasmine.createSpy("preventDefault"),
                        stopPropagation: jasmine.createSpy("stopPropagation")
                    };
                    [8,13,39,37,38,40]
                        .forEach((keyCode) => {
                            EVENT.keyCode = keyCode;
                            vk.dispatchKeyDownToInputTarget(EVENT);
                            expect(EVENT.preventDefault).toHaveBeenCalledTimes(1);
                            expect(EVENT.stopPropagation).toHaveBeenCalledTimes(1);
                            expect(vk.onButtonPressed).toHaveBeenCalledTimes(1);
                            EVENT.preventDefault.calls.reset();
                            EVENT.stopPropagation.calls.reset();
                            vk.onButtonPressed.calls.reset();
                        });
                    expect(vk.insertInInputTarget).not.toHaveBeenCalled();

                    [1,2,3,4,5,6,7,9,10,11,12,14]
                        .forEach((keyCode) => {
                            EVENT.keyCode = keyCode;
                            vk.dispatchKeyDownToInputTarget(EVENT);
                            expect(EVENT.preventDefault).toHaveBeenCalledTimes(1);
                            expect(EVENT.stopPropagation).toHaveBeenCalledTimes(1);
                            expect(vk.insertInInputTarget).toHaveBeenCalledTimes(1);
                            EVENT.preventDefault.calls.reset();
                            EVENT.stopPropagation.calls.reset();
                            vk.insertInInputTarget.calls.reset();
                        });
                    expect(vk.onButtonPressed).toHaveBeenCalledTimes(0);

                    done();
                });
            });

            it("stops searching for a valid next/previous input field if none is available", async() => {
                await injector.require(['GUIAPP/content/viewmodels/base/VirtualKeyboardViewModel']);
                const vk = new Wincor.UI.Content.VirtualKeyboardViewModel();
                // mock some stuff
                vk.validInputFields = [{}, {}, {}];
                vk.validInputFields.filter = jasmine.createSpy("$.filter").and.returnValue({
                    length: vk.validInputFields.length
                });
                vk.validInputFields.index = jasmine.createSpy("$.index");
                Wincor.createMockObject("options.moveContainer.distance", vk);
                vk.options.moveContainer.distance = -1;
                spyOn(vk, "isValidInputField").and.returnValue(false);
                spyOn(vk, "reset");
                spyOn(vk, "intersect");
                spyOn(vk, "onFocusIn");
                jQuery["fn"]["effect"] = jasmine.createSpy("$.effect");
                vk.goToNextInputField();
                expect(vk.isValidInputField).toHaveBeenCalledTimes(3);
            });

            it("stops searching for a valid next/previous when looped", async() => {
                await injector.require(['GUIAPP/content/viewmodels/base/VirtualKeyboardViewModel']);
                let CURRENT_INDEX = 0;
                const vk = new Wincor.UI.Content.VirtualKeyboardViewModel();
                // mock some stuff
                vk.validInputFields = [];
                vk.validInputFields.filter = jasmine.createSpy("$.filter")
                    .and.callFake(
                        () => {
                            return {
                                length: vk.validInputFields.length
                            };
                        });
                vk.validInputFields.index = jasmine.createSpy("$.index")
                    .and.callFake(() => CURRENT_INDEX);
                Wincor.createMockObject("options.moveContainer.distance", vk);
                vk.options.moveContainer.distance = -1;
                spyOn(vk, "isValidInputField").and.callFake(val => val);
                spyOn(vk, "reset");
                spyOn(vk, "intersect");
                spyOn(vk, "onFocusIn");
                jQuery["fn"]["effect"] = jasmine.createSpy("$.effect");

                [false, true, false].forEach(val => {
                    vk.validInputFields.push(val);
                });
                vk.goToNextInputField();
                expect(vk.isValidInputField).toHaveBeenCalledTimes(1);
                vk.isValidInputField.calls.reset();


                CURRENT_INDEX = 1; // force restarting at index 0
                [true, true, false].forEach(val => {
                    vk.validInputFields.push(val);
                });
                vk.goToNextInputField();
                expect(vk.isValidInputField).toHaveBeenCalledTimes(2);
            });

            describe("with mirrored input target", () => {
                it("does not reset target selector transitions when hiding", async() => {
                    await injector.require(['GUIAPP/content/viewmodels/base/VirtualKeyboardViewModel']);
                    // options are set to default values after observe has been called
                    const TEST_VALUE = "mytestvalue";
                    const vk = new Wincor.UI.Content.VirtualKeyboardViewModel();
                    vk.options = {
                        moveContainer: {
                            distance: -1
                        }
                    };
                    jQuery["fn"]["transition"] = jasmine.createSpy("$.transition");
                    jQuery["fn"]["css"] = jasmine.createSpy("$.css").and.returnValue(jQuery("<div>"));
                    vk.jqVKModalOverlay = jQuery("<div>");
                    vk.jqVKElement = jQuery("<div>");
                    
                    vk._hideInternal();
                    expect(jQuery["fn"]["transition"]).not.toHaveBeenCalled();
                    expect(jQuery["fn"]["css"]).toHaveBeenCalled();
                });

                it("can handle backspace within word without selection on plain input", done => {
                    injector.require(['GUIAPP/content/viewmodels/base/VirtualKeyboardViewModel'], () => {
                        // options are set to default values after observe has been called
                        const TEST_VALUE = "mytestvalue";
                        const vk = new Wincor.UI.Content.VirtualKeyboardViewModel();
                        vk.keys = {
                            LEFT: {
                                enabled: jasmine.createSpy("keyLeftEnabled")
                            },
                            RIGHT: {
                                enabled: jasmine.createSpy("keyRightEnabled")
                            }
                        };
                        vk._mirror = true;

                        vk.inputTarget = {
                            value: TEST_VALUE
                        };
                        vk.jMirroredTarget = [{
                            value: TEST_VALUE,
                            selectionStart: 6, // we set cursor here -> "mytest|value"
                            selectionEnd: 6
                        }];
                        vk.observe();
                        vk.handleBackspace(6);
                        expect(vk.jMirroredTarget[0].value).toBe("mytesvalue");
                        expect(vk.inputTarget.value).toBe("mytesvalue");
                        done();
                    });
                });

                it("can handle backspace within word with selection on plain input", done => {
                    injector.require(['GUIAPP/content/viewmodels/base/VirtualKeyboardViewModel'], () => {
                        // options are set to default values after observe has been called
                        const TEST_VALUE = "mytestvalue";
                        const vk = new Wincor.UI.Content.VirtualKeyboardViewModel();
                        vk.keys = {
                            LEFT: {
                                enabled: jasmine.createSpy("keyLeftEnabled")
                            },
                            RIGHT: {
                                enabled: jasmine.createSpy("keyRightEnabled")
                            }
                        };
                        vk._mirror = true;

                        vk.inputTarget = {
                            value: TEST_VALUE
                        };
                        vk.jMirroredTarget = [{
                            value: TEST_VALUE,
                            selectionStart: 2, // we select "test" and delete it
                            selectionEnd: 6
                        }];
                        vk.observe();
                        vk.handleBackspace(6);
                        expect(vk.jMirroredTarget[0].value).toBe("myvalue");
                        expect(vk.inputTarget.value).toBe("myvalue");
                        done();
                    });
                });

                it("can handle backspace on start of line on plain input", done => {
                    injector.require(['GUIAPP/content/viewmodels/base/VirtualKeyboardViewModel'], () => {
                        // options are set to default values after observe has been called
                        const TEST_VALUE = "mytestvalue";
                        const vk = new Wincor.UI.Content.VirtualKeyboardViewModel();
                        vk._mirror = true;
                        vk.inputTarget = {
                            value: TEST_VALUE
                        };
                        vk.jMirroredTarget = [{
                            value: TEST_VALUE,
                            selectionStart: 0, // set to start of line
                            selectionEnd: 0
                        }];
                        vk.keys = {
                            LEFT: {
                                enabled: jasmine.createSpy("keyLeftEnabled")
                            },
                            RIGHT: {
                                enabled: jasmine.createSpy("keyRightEnabled")
                            }
                        };

                        vk.observe();
                        vk.handleBackspace(0);
                        expect(vk.jMirroredTarget[0].value).toBe(TEST_VALUE);
                        expect(vk.inputTarget.value).toBe(TEST_VALUE);
                        done();
                    });
                });

                it("can handle backspace within word without selection without formatting on observables", done => {
                    injector.require(['GUIAPP/content/viewmodels/base/VirtualKeyboardViewModel'], () => {
                        // options are set to default values after observe has been called
                        const TEST_VALUE = "mytestvalue";
                        const vk = new Wincor.UI.Content.VirtualKeyboardViewModel();
                        vk.keys = {
                            LEFT: {
                                enabled: jasmine.createSpy("keyLeftEnabled")
                            },
                            RIGHT: {
                                enabled: jasmine.createSpy("keyRightEnabled")
                            }
                        };
                        vk._mirror = true;
                        spyOn(vk, "setLeftRightKeys");
                        vk.inputTarget = {
                            value: TEST_VALUE
                        };
                        vk.jMirroredTarget = [{
                            value: TEST_VALUE,
                            selectionStart: 6, // we set cursor here -> "mytest|value"
                            selectionEnd: 6
                        }];
                        const src = jasmine.createSpy("sourceObservable").and.callFake((...args) => {
                            if (args.length === 0) {
                                return TEST_VALUE;
                            }
                        });

                        const tgt = jasmine.createSpy("targetObservable").and.callFake((...args) => {
                            if (args.length === 0) {
                                return TEST_VALUE;
                            }
                        });
                        const opts = {
                            getSourceObservable: () => {
                                return src;
                            },
                            getTargetObservable: () => {
                                return tgt;
                            }
                        };
                        vk.observe(opts);
                        vk.handleBackspace(6);
                        expect(src).toHaveBeenCalledTimes(2);
                        expect(src.calls.argsFor(0)).toEqual([]);
                        expect(src.calls.argsFor(1)).toEqual(["mytesvalue"]);
                        done();
                    });
                });

                it("can handle backspace within word with selection on observables", done => {
                    injector.require(['GUIAPP/content/viewmodels/base/VirtualKeyboardViewModel'], () => {
                        // options are set to default values after observe has been called
                        const TEST_VALUE = "mytestvalue";
                        const vk = new Wincor.UI.Content.VirtualKeyboardViewModel();
                        vk.keys = {
                            LEFT: {
                                enabled: jasmine.createSpy("keyLeftEnabled")
                            },
                            RIGHT: {
                                enabled: jasmine.createSpy("keyRightEnabled")
                            }
                        };
                        vk._mirror = true;

                        spyOn(vk, "setLeftRightKeys");
                        vk.inputTarget = {
                            value: TEST_VALUE
                        };
                        vk.jMirroredTarget = [{
                            value: TEST_VALUE,
                            selectionStart: 2, // we select "test" and delete it
                            selectionEnd: 6
                        }];
                        const src = jasmine.createSpy("sourceObservable").and.callFake((...args) => {
                            if (args.length === 0) {
                                return TEST_VALUE;
                            }
                        });

                        const tgt = jasmine.createSpy("targetObservable").and.callFake((...args) => {
                            if (args.length === 0) {
                                return TEST_VALUE;
                            }
                        });
                        const opts = {
                            getSourceObservable: () => {
                                return src;
                            },
                            getTargetObservable: () => {
                                return tgt;
                            }
                        };
                        vk.observe(opts);
                        vk.handleBackspace(6);
                        expect(src).toHaveBeenCalledTimes(2);
                        expect(src.calls.argsFor(0)).toEqual([]);
                        expect(src.calls.argsFor(1)).toEqual(["myvalue"]);
                        done();
                    });
                });

                it("can handle backspace on start of line on observables", done => {
                    injector.require(['GUIAPP/content/viewmodels/base/VirtualKeyboardViewModel'], () => {
                        // options are set to default values after observe has been called
                        const TEST_VALUE = "mytestvalue";
                        const vk = new Wincor.UI.Content.VirtualKeyboardViewModel();
                        vk.keys = {
                            LEFT: {
                                enabled: jasmine.createSpy("keyLeftEnabled")
                            },
                            RIGHT: {
                                enabled: jasmine.createSpy("keyRightEnabled")
                            }
                        };
                        vk._mirror = true;
                        spyOn(vk, "setLeftRightKeys");
                        vk.inputTarget = {
                            value: TEST_VALUE
                        };
                        vk.jMirroredTarget = [{
                            value: TEST_VALUE,
                            selectionStart: 2, // we select "test" and delete it
                            selectionEnd: 6
                        }];
                        const src = jasmine.createSpy("sourceObservable").and.callFake((...args) => {
                            if (args.length === 0) {
                                return TEST_VALUE;
                            }
                        });

                        const tgt = jasmine.createSpy("targetObservable").and.callFake((...args) => {
                            if (args.length === 0) {
                                return TEST_VALUE;
                            }
                        });
                        const opts = {
                            getSourceObservable: () => {
                                return src;
                            },
                            getTargetObservable: () => {
                                return tgt;
                            }
                        };
                        vk.observe(opts);
                        vk.handleBackspace(0);
                        expect(src).toHaveBeenCalledTimes(2);
                        expect(src.calls.argsFor(0)).toEqual([]);
                        expect(src.calls.argsFor(1)).toEqual(["myvalue"]);
                        done();
                    });
                });
            });

            describe("without mirrored input target", () => {
                it("resets target selector transitions immediately when hiding if animations are off", async() => {
                    await injector.require(['GUIAPP/content/viewmodels/base/VirtualKeyboardViewModel']);
                    // options are set to default values after observe has been called
                    const vk = new Wincor.UI.Content.VirtualKeyboardViewModel();
                    vk.options = {
                        moveContainer: {
                            distance: 50
                        }
                    };
                    jQuery["fn"]["transition"] = jasmine.createSpy("$.transition");
                    jQuery["fn"]["css"] = jasmine.createSpy("$.css").and.returnValue(jQuery("<div>"));
                    vk.jqVKModalOverlay = jQuery("<div>");
                    vk.jqVKElement = jQuery("<div>");
                    vk._hideInternal();
                    expect(jQuery["fn"]["transition"]).not.toHaveBeenCalled();
                    expect(jQuery["fn"]["css"]).toHaveBeenCalled();
                });

                it("resets target selector with transition when hiding if animations are off", async() => {
                    let [_, mocks] = await injector.require(['GUIAPP/content/viewmodels/base/VirtualKeyboardViewModel', 'mocks']);
                    // options are set to default values after observe has been called
                    mocks.store["config/Config"].VIEW_ANIMATIONS_ON = true;
                    const vk = new Wincor.UI.Content.VirtualKeyboardViewModel();
                    vk.options = {
                        moveContainer: {
                            distance: 50
                        }
                    };
                    jQuery["fn"]["transition"] = jasmine.createSpy("$.transition");
                    jQuery["fn"]["css"] = jasmine.createSpy("$.css").and.returnValue(jQuery("<div>"));
                    vk.jqVKModalOverlay = jQuery("<div>");
                    vk.jqVKElement = jQuery("<div>");
                    
                    vk._hideInternal();
                    expect(jQuery["fn"]["css"]).toHaveBeenCalled();
                    expect(jQuery["fn"]["transition"]).toHaveBeenCalled();
                });

                it("resets target selector immediately when hiding if animations are on but argument is true", async() => {
                    let [_, mocks] = await injector.require(['GUIAPP/content/viewmodels/base/VirtualKeyboardViewModel', 'mocks']);
                    // options are set to default values after observe has been called
                    mocks.store["config/Config"].VIEW_ANIMATIONS_ON = true;
                    const vk = new Wincor.UI.Content.VirtualKeyboardViewModel();
                    vk.options = {
                        moveContainer: {
                            distance: 50
                        }
                    };
                    
                    jQuery["fn"]["transition"] = jasmine.createSpy("$.transition");
                    jQuery["fn"]["css"] = jasmine.createSpy("$.css").and.returnValue(jQuery("<div>"));
                    vk.jqVKModalOverlay = jQuery("<div>");
                    vk.jqVKElement = jQuery("<div>");
                    
                    vk._hideInternal(true);
                    expect(jQuery["fn"]["transition"]).not.toHaveBeenCalled();
                    expect(jQuery["fn"]["css"]).toHaveBeenCalled();
                });
            });

            describe("cleanup", () => {
                it(`does not remove GestureElements explicitly`, async() => {
                    Wincor.UI.Content.ObjectManager = {
                        remove: jasmine.createSpy("ObjectManager.remove")
                    };
                    await injector.require(['GUIAPP/content/viewmodels/base/VirtualKeyboardViewModel']);
                    const vk = new Wincor.UI.Content.VirtualKeyboardViewModel();
                    vk.jqVKModalOverlay = {
                        remove: jasmine.createSpy("vkModalOverlay.remove")
                    };
                    vk.clean();
                    expect(Wincor.UI.Content.ObjectManager.remove).not.toHaveBeenCalled();
                });

                it(`removes modal overlay on 'clean'`, async() => {
                    Wincor.UI.Content.ObjectManager = {
                        remove: jasmine.createSpy("ObjectManager.remove")
                    };
                    await injector.require(['GUIAPP/content/viewmodels/base/VirtualKeyboardViewModel']);
                    const vk = new Wincor.UI.Content.VirtualKeyboardViewModel();
                    vk.jqVKModalOverlay = {
                        remove: jasmine.createSpy("vkModalOverlay.remove")
                    };
                    vk.clean();
                    expect(vk.jqVKModalOverlay.remove).toHaveBeenCalled();
                });
            });

            describe("general", () => {
                it("uses default inputTarget if show has been triggered without", done => {
                    injector.require(['GUIAPP/content/viewmodels/base/VirtualKeyboardViewModel'], () => {
                        // options are set to default values after observe has been called
                        const DEFAULT_TARGET = "DEF";
                        const vk = new Wincor.UI.Content.VirtualKeyboardViewModel();
                        vk.jqVKElement = {};
                        spyOn(vk, "update")
                            .and.callFake(() => {
                                expect(vk.inputTarget).toBe(DEFAULT_TARGET);
                                done();
                            });
                        spyOn(vk, "isValidInputField");
                        spyOn(vk, "activateMirror");
                        vk.inputTarget = DEFAULT_TARGET;
                        vk.show();
                    });
                });

                it("creates commands for epp handling", done => {
                    spyOn(Wincor.UI.Content.Commanding, "createCommand").and.callThrough();
                    spyOn(Wincor.UI.Content.Commanding, "setActive");
                    injector.require(['GUIAPP/content/viewmodels/base/VirtualKeyboardViewModel'], () => {
                        // options are set to default values after observe has been called
                        const vk = new Wincor.UI.Content.VirtualKeyboardViewModel();
                        expect(Wincor.UI.Content.Commanding.createCommand).toHaveBeenCalledTimes(12);
                        // mock some more things up
                        vk.jqVKElement = {css: ()=>{return {css: ()=>{}}}};
                        vk.jqVKModalOverlay = {css: ()=>{}};
                        vk.update = () => {};
                        vk.copyCurrentValue = () => {};
                        vk.moveContainer = () => {};
                        vk.options = {moveContainer:{distance:0}};

                        vk._showInternal()
                            .then(() => {
                                expect(Wincor.UI.Content.Commanding.setActive).toHaveBeenCalledWith([ 'VK_ENTER', 'VK_BACKSPACE', 'VK_1', 'VK_2', 'VK_3', 'VK_4', 'VK_5', 'VK_6', 'VK_7', 'VK_8', 'VK_9', 'VK_0' ]);
                                done();
                            })
                            .catch(done.fail);
                    });
                });

                const MAPPING = {
                    CONFIRM: ["FUNCTION", "q", "test"],
                    CLEAR: ["FUNCTION", "q", "test", "BACKSPACE"],
                    BACKSPACE: ["FUNCTION", "q", "test", "CLEAR"],
                    0: ["FUNCTION", "q", "test"]
                };

                Object.keys(MAPPING).forEach(EPP_KEY => {
                    MAPPING[EPP_KEY].forEach(VK_KEY => {
                        it(`uses eppKeyMap for configurable epp handling ${EPP_KEY}->${VK_KEY}`, async() => {
                            spyOn(Wincor.UI.Content.Commanding, "createCommand").and.callThrough();
                            spyOn(Wincor.UI.Content.Commanding, "setActive");
                            await injector.require(['GUIAPP/content/viewmodels/base/VirtualKeyboardViewModel']);
                            // options are set to default values after observe has been called
                            const vk = new Wincor.UI.Content.VirtualKeyboardViewModel();
                            vk.keys = {
                                [VK_KEY]: {
                                    keyCode: 0,
                                    character: ()=> VK_KEY
                                }
                            };
                            vk.options.eppKeyMap = {
                                [EPP_KEY]: VK_KEY // [EPP_KEY] dynamic object initializer using variable
                            };
                            spyOn(vk, "onButtonPressed");
                            vk.onEppButtonPressed(EPP_KEY, {})
                            expect(vk.onButtonPressed).toHaveBeenCalledWith(VK_KEY, vk, {type: "EPP_EVENT", key: VK_KEY});
                        });
                    });
                });

                it(`does not dispatch EPP key press if eppKeyMap does not contain an entry for it`, async() => {
                    spyOn(Wincor.UI.Content.Commanding, "createCommand").and.callThrough();
                    spyOn(Wincor.UI.Content.Commanding, "setActive");
                    await injector.require(['GUIAPP/content/viewmodels/base/VirtualKeyboardViewModel']);
                    const EPP_KEY = "*";
                    const VK_KEY = "ENTER";
                    // options are set to default values after observe has been called
                    const vk = new Wincor.UI.Content.VirtualKeyboardViewModel();
                    vk.keys = {
                    };
                    vk.options.eppKeyMap = {
                        [EPP_KEY]: VK_KEY // [EPP_KEY] dynamic object initializer using variable
                    };
                    spyOn(vk, "onButtonPressed");
                    vk.onEppButtonPressed(EPP_KEY, {})
                    expect(vk.onButtonPressed).not.toHaveBeenCalled();
                });

                it("removes mirror if configured", async() => {
                    spyOn(Wincor.UI.Content.Commanding, "createCommand").and.callThrough();
                    spyOn(Wincor.UI.Content.Commanding, "setActive");
                    await injector.require(['GUIAPP/content/viewmodels/base/VirtualKeyboardViewModel']);
                    // options are set to default values after observe has been called
                    const vk = new Wincor.UI.Content.VirtualKeyboardViewModel();
                    vk.findInitialInputTarget = ()=>{};
                    vk.vmContainer.doBind = ()=>{return{then: ()=>{}}};
                    vk.keys = {
                        LEFT: {
                            enabled: jasmine.createSpy("keyLeftEnabled")
                        },
                        RIGHT: {
                            enabled: jasmine.createSpy("keyRightEnabled")
                        },
                        UP: {
                            enabled: jasmine.createSpy("keyUpEnabled")
                        },
                        DOWN: {
                            enabled: jasmine.createSpy("keyDownEnabled")
                        }
                    };
                    spyOn(vk, "deActivateMirror");
                    vk.observe({moveContainer:{distance:20}});
                    vk.onInteractive();
                    // mock some more things up
                    vk.jqVKElement = {css: ()=>{return {css: ()=>{}}}};
                    vk.jqVKModalOverlay = {css: ()=>{}};
                    vk.jMirroredTarget = {
                        css: jasmine.createSpy("jMirroredTarget.css()"),
                        off: jasmine.createSpy("jMirroredTarget.off()"),
                        val: jasmine.createSpy("jMirroredTarget.val()"),
                        focus: jasmine.createSpy("jMirroredTarget.focus()")
                    };

                    await vk._showInternal();
                    expect(vk.deActivateMirror).toHaveBeenCalled();
                });
            });
        });
    });
});