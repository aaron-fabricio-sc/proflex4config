/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ config_test.js 4.3.1-201130-21-086c3328-1a04bc7d

*/
/*global define:false*/
define(['lib/Squire'], function(Squire) {

    let injector;
    let ko;
    let Wincor;
    let jQuery;

    const DEFAULTS = {
        "viewsPath": "views/",
        "componentsPath": "views/components/",
        "modulesPath": "content/views/script/",
        "startModule": "shell",
        "initialRoute": "welcome",
        "offlineSpaRoute": "offlinespa",
        "isDirectMarketingAvailable": false,
        "TRANSITION_ON": true,
        "TRANSITION_NAME": "rollIn",
        "TRANSITION_DURATION": 0.5,
        "ANIMATION_IN": "zoomIn",
        "ANIMATION_OUT": "fadeOut",
        "COMMAND_AUTOMATION_DURATION": 150,
        "VIEW_ANIMATIONS_ON": true,
        "FOOTER_ANIMATIONS_ON": true,
        "BORDER_DRAWING_ON": true,
        "BUTTON_FADE_IN_TIME": 200,
        "CUSTOM_STYLE_RESOURCES_SOFTKEY": [
            "layouts-custom.css",
            "sizes-positions-custom.css",
            "animations-custom.css",
            "softkey-custom.css"
        ],
        "CUSTOM_STYLE_RESOURCES_TOUCH": [
            "layouts-custom.css",
            "sizes-positions-custom.css",
            "animations-custom.css"
        ],
        "CUSTOM_STYLE_RESOLUTIONS": [],
        "RVT_DEFAULT_NAME": "default/",
        "RES_1920X1080": "1920x1080/",
        "RES_1280X1024": "1280x1024/",
        "RES_1050X1680": "1050x1680/",
        "ROOT_DEFAULT": "style/",
        "STYLE_VENDOR": "default/",
        "STYLE_TYPE": "MercuryDark/",
        "SPLIT_SCREEN_MODE": "off",
        "ALLOW_SPLIT_SCREEN_MOVING": true,
        "ALLOW_STYLE_TYPE_ENHANCING": true,
        "IMAGE_FOLDER_NAME": "images/",
        "GESTURE_CONFIG": {
            "Tap": {
                "time": 500,
                "threshold": 10
            },
            "Press": {
                time: 600,
                threshold: 10
            }
        },
        "VIRTUAL_KEYBOARD_CONFIG": {
            "validateInput": false,
            "useAppOverlay": true,
            "styleAppContentClass": "",
            "moveContainer": {
                "distance": -1,
                "targetSelector": "#flexMain, #flexHeader"
            },
            "nextFieldOnEnter": false,
            "useStandardShowHide": true,
            "inputFieldFocusEffect": "pulsate",
            "originOut": {
                "transformOrigin": "50% 100%"
            },
            "transitionOut": {
                "perspective": "1000px",
                "rotateX": "75deg",
                "y": "100%"
            },
            "originIn": {
                "transformOrigin": "50% 100%"
            },
            "transitionIn": {
                "perspective": "1000px",
                "rotateX": "0deg",
                "y": "0%"
            },
            "transitionTime": 350,
            "moveTime": 350,
            "autoLayout": true,
            "autoDirection": false,
            "inputContainer": "#applicationHost",
            "inputTarget": void 0,
            "enterCallback": void 0, // enterCallback can decide whether to process default handling by returning true/false
            "keyPressCallback": void 0, // keyPressCallback can decide whether to process default handling by returning true/false
            "disabledInputIds": [
                "generalVKInput",
                "generalInputMenu"
            ],
            "defaultLanguage": "en-us",
            "validNodeNames": [
                "INPUT",
                "TEXTAREA"
            ],
            "shiftKeyId": "shiftKey",
            "capsLockKeyId": "",
            "keyboardType": "KEYBOARD",
            "keyboardElementId": "virtualKeyboardContainer",
            "onStateChangedHandler": null,
            "onFocusInHandler": null,
            "getSourceObservable": null,
            "getDataValidObservable": null,
            "getTargetObservable": null,
            "forbiddenCharCodes": [],
            "skipTypes": {
                "checkbox": true,
                "radio": true,
                "range": true,
                "date": true,
                "time": true,
                "color": true,
                "datetime-local": true,
                "datetime": true
            },
            "beep": false,
            "beepEpp": false,
            "inputType2Layout": {
                "number": "NUMPAD",
                "tel": "NUMPAD",
                "address": [
                    "KEYBOARD",
                    "KEYBOARD_ALPHA"
                ]
            },
            "eppKeyMap": {
                "CONFIRM": "ENTER",
                "CLEAR": "BACKSPACE",
                "BACKSPACE": "BACKSPACE"
            }
        },
        "SOFTKEY_LIMITATION_ON_ACTIVE_DM": false
    };


    describe("Config.js GUIAPP", () => {
        const CONFIG_JSON = "../../content/config/Config.json";
        const ROUTE_CONFIG_JSON = "../../content/config/RouteConfig.json";
        const ROUTE_CONFIG_CUSTOM_JSON = "../../content/config/RouteConfigCustom.json";

        beforeEach(done => {
            injector = new Squire();
            
            injector.require(["NamespaceMock"], bundle => {
                Wincor = window.Wincor = bundle.createWincor();
                ko = Wincor.ko = window.ko = bundle.ko;
                jQuery = window.jQuery = bundle.jQuery;

                this.JSON_FILES = {};
                this.JSON_FILES[ROUTE_CONFIG_JSON] = {
                    "viewsPath": "views/",
                    "componentsPath": "views/components/",
                    "modulesPath": "content/views/script/",
                    "startModule": "shell",
                    "initialRoute": "welcome",
                    "offlineSpaRoute": "offlinespa",
                    "//": "Add new view names to the list, configure route and/or set individual route/moduleId. Note: 'name' must be unique and corresponding to a physical view.",
                    "routes": [
                        {"name": "shell", "route": "", "moduleId": "", "nav": false},
                        {"name": "outofserviceadditionalinfos", "route": "", "moduleId": "", "nav": true}
                    ]
                };
                this.JSON_FILES[ROUTE_CONFIG_CUSTOM_JSON] = {
                    routes: [
                        {"name": "testroute", "route": "", "moduleId": "", "nav": true}
                    ]
                };
                this.JSON_FILES[CONFIG_JSON] = {
                };

                this.durandalPluginsRouter = {
                    on: jasmine.createSpy("router.on").and.returnValue(Promise.resolve()),
                    compositionComplete: jasmine.createSpy("routerCompositionComplete")
                };

                this.content = {};
                injector
                    .mock("jquery", jQuery)
                    .mock("extensions", bundle.ext)
                    .mock("knockout", ko)
                    .mock("plugins/router", this.durandalPluginsRouter)
                    .mock("ui-content",  this.content);

                spyOn(jQuery, "getJSON").and.callFake((path, cb) => {
                    expect(Object.keys(this.JSON_FILES)).toContain(path);
                    const ret = this.JSON_FILES[path];
                    cb(ret);
                    return {fail: () => {}};
                });

                done();
            });
        });

        afterEach(() => {
            injector.remove();
        });

        describe("loaded", () => {

            it("installs defaults", done => {
                injector.require(["GUIAPP/content/config/Config"], config => {
                    config.ready
                        .then(() => {
                            // check defaults
                            Object.keys(DEFAULTS)
                                .forEach(key => {
                                    if(key in DEFAULTS) {
                                        let val = config[key];
                                        let type = typeof val;
                                        if(type !== "object") {
                                            expect(val).toBe(DEFAULTS[key]);
                                        } else {
                                            expect(val).toEqual(DEFAULTS[key]);
                                        }
                                    }
                                });
                            done();
                        })
                        .catch(done.fail);
                }, done.fail);
            });

            it("merges routes from RouteConfig.json", done => {
                injector.require(["GUIAPP/content/config/Config"], config => {
                    config.ready
                        .then(() => {
                            let testroute = config.ROUTES.filter(r => r.name === "testroute")[0];
                            expect(testroute).toEqual({"name":"testroute","route":"views/testroute","moduleId":"content/views/script/testroute","nav":true});
                            done();
                        })
                        .catch(done.fail);
                }, done.fail);
            });

            it("removes double routes", done => {
                // add route with same name to config
                this.JSON_FILES[ROUTE_CONFIG_CUSTOM_JSON].routes.push({"name":"testroute","route":"views/testroute1","moduleId":"content/views/script/testroute1","nav":true});
                injector.require(["GUIAPP/content/config/Config"], config => {
                    config.ready
                        .then(() => {
                            let testroute = config.ROUTES.filter(r => r.name === "testroute");
                            expect(testroute.length).toBe(1);
                            done();
                        })
                        .catch(done.fail);
                }, done.fail);
            });

            it("allows overriding for config parameters", done => {
                const TEST_TIME = DEFAULTS.BUTTON_FADE_IN_TIME + 1;
                this.JSON_FILES[CONFIG_JSON].BUTTON_FADE_IN_TIME = TEST_TIME;
                injector.require(["GUIAPP/content/config/Config"], config => {
                    config.ready
                        .then(() => {
                            expect(config.BUTTON_FADE_IN_TIME).toBe(TEST_TIME);
                            done();
                        })
                        .catch(done.fail);
                }, done.fail);
            });
            
            it("must call ENHANCED_STYLE_TYPE_CONFIG", done => {
                injector.require(["GUIAPP/content/config/Config"], config => {
                    spyOn(config, "ENHANCED_STYLE_TYPE_CONFIG");
                    config.ready
                        .then(() => {
                            expect(config.ENHANCED_STYLE_TYPE_CONFIG).toHaveBeenCalled();
                            done();
                        })
                        .catch(done.fail);
                }, done.fail);
            });
            
        });
    });
});

