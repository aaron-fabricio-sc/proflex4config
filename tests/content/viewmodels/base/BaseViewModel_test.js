/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ BaseViewModel_test.js 4.3.1-210311-21-bbdeaee3-1a04bc7d

*/
/*global define:false*/
define(['lib/Squire'], function(Squire) {

    let injector;
    let ko;
    let Wincor;
    let jQuery;
    describe("BaseViewModel", () => {

        beforeEach(done => {
            injector = new Squire();
            injector.require(["NamespaceMock"], bundle => {
                Wincor = window.Wincor = bundle.createWincor();
                ko = Wincor.ko = window.ko = bundle.ko;
                jQuery = window.jQuery = bundle.jQuery;
                this.buildGuiKey = jasmine.createSpy("buildGuiKey")
                    .and.callFake((viewKey, key) => { // mock
                        return key;
                    });
    
    
                this.getGuiKeySuffixPart = jasmine.createSpy("getGuiKeySuffixPart")
                    .and.callFake(a => {
                        return a;
                    });

                injector
                    .mock("flexuimapping", {
                        buildGuiKey: this.buildGuiKey,
                        getGuiKeySuffixPart: this.getGuiKeySuffixPart
                    })
                    .mock("extensions", bundle.ext)
                    .mock("ui-content", Wincor.UI.Content)
                    .mock("vm-container", Wincor.UI.Content.ViewModelContainer)
                    .mock("ko-custom", {})
                    .mock("knockout", Wincor.ko)
                    .mock("code-behind/ViewHelper", {})
                    .mock("vm-util/ViewModelHelper", {
                        triggerEvent: jasmine.createSpy("viewModelHelper.triggerEvent", () => {
                        }),
                        popupOptions: {type: "CANCEL_POPUP"},
                        convertToInt: (val, defaultVal = 0) => {
                            return Number.isInteger(parseInt(val)) ? parseInt(val) : defaultVal;
                        }
                    })
                    .mock("vm-util/Ada", Wincor.UI.Content.Ada)
                    .mock("vm-util/LabelContainer", function () {
                        this.has = ()=>{ return false; };
                        this.set = ()=>{};
                        this.push = ()=>{};
                    })
                    .mock("vm-util/UICommanding", Wincor.UI.Content.Commanding);
                done();
            });
        });

        afterEach(() => {
            injector.remove();
        });
    
        describe("initialization", () => {
            it("sets the observable area", done => {
                injector.require(["GUIAPP/content/viewmodels/base/BaseViewModel"], () => {
                    const ID = "testId";
                    const baseVm = new Wincor.UI.Content.BaseViewModel();
                    baseVm.observe(ID);
                    expect(baseVm.observableAreaId).toEqual(ID);
                    done();
                }, done.fail);
            });
    
            it("onInitTextAndData processes arguments and waits for promises passed", done => {
                injector.require(["GUIAPP/content/viewmodels/base/BaseViewModel"], () => {
                    const baseVm = new Wincor.UI.Content.BaseViewModel();
                    const myDataDeferred = Wincor.UI.deferred();
                    const myTextDeferred = Wincor.UI.deferred();
                    const myDeferredTextKey = Wincor.UI.deferred();
                    const DATAKEY1 = "DATAKEY1";
                    const DATAKEY2 = "DATAKEY2";
                    const TEXTKEY1 = "GUI_viewkey_TEXTKEY1";
                    const TEXTKEY2 = "GUI_viewkey_TEXTKEY2";
                    const TEXTKEY3 = "GUI_viewkey_Deferred_TEXTKEY3";
            
                    const args = {
                        dataKeys: [myDataDeferred.promise, DATAKEY1, DATAKEY2],
                        textKeys: [TEXTKEY1, myTextDeferred.promise, TEXTKEY2, myDeferredTextKey.promise]
                    };
            
                    // now install spies for dataservice and localize...
                    spyOn(Wincor.UI.Service.Provider.LocalizeService, "getText")
                        .and.callThrough();
                    spyOn(Wincor.UI.Service.Provider.DataService, "getValues")
                        .and.callThrough();
            
                    const readyPromise = baseVm.onInitTextAndData(args);
            
                    expect(Wincor.UI.Service.Provider.LocalizeService.getText).not.toHaveBeenCalled();
                    expect(Wincor.UI.Service.Provider.DataService.getValues).not.toHaveBeenCalled();
            
                    readyPromise.then(() => {
                        expect(Wincor.UI.Service.Provider.LocalizeService.getText).not.toHaveBeenCalled();
                        expect(Wincor.UI.Service.Provider.DataService.getValues).not.toHaveBeenCalled();
                        expect(baseVm.dataKeys).toEqual(jasmine.arrayContaining([DATAKEY1, DATAKEY2]));
                        expect(baseVm.textKeys).toEqual(jasmine.arrayContaining([TEXTKEY1, TEXTKEY2, TEXTKEY3]));
                
                        done();
                    });
            
                    // above should be resolved if callbacks are called and deferreds are finished
                    myTextDeferred.resolve();
                    myDataDeferred.resolve();
                    myDeferredTextKey.resolve(TEXTKEY3);
                }, done.fail);
            });
    
            it("initTextAndData gets data- and textKeys", done => {
                injector.require(["GUIAPP/content/viewmodels/base/BaseViewModel"], () => {
                    const baseVm = new Wincor.UI.Content.BaseViewModel();
                    const DATAKEY1 = "DATAKEY1";
                    const DATAKEY2 = "DATAKEY2";
                    const RELOAD_DATAKEY1 = "RELOAD_DATAKEY1";
                    const VIEWSTATE_DATAKEY1 = "VIEWSTATE_DATAKEY1";
                    const TEXTKEY1 = "GUI_viewkey_TEXTKEY1";
                    const TEXTKEY2 = "GUI_viewkey_TEXTKEY2";
                    const TEXTKEY3 = "GUI_viewkey_TEXTKEY3";
            
                    baseVm.textKeys = [TEXTKEY1]; // simulates viewkeychange only with kept key
                    // now install spies for dataservice and localize...
                    spyOn(Wincor.UI.Service.Provider.LocalizeService, "getText")
                        .and.callThrough();
                    spyOn(Wincor.UI.Service.Provider.DataService, "getValues")
                        .and.callThrough();
                    spyOn(baseVm, "onTextReady");
                    spyOn(baseVm, "onDataValuesReady");
                    spyOn(baseVm, "onInitialized");
            
                    // for test if reloadkeys are processed
                    baseVm.viewConfig = {
                        reload: [RELOAD_DATAKEY1]
                    };
            
                    // for test if viewStateKeys are processed
                    baseVm.viewStateKeys.push(VIEWSTATE_DATAKEY1);
                    const retPromise = baseVm.initTextAndData([TEXTKEY2, TEXTKEY3], [DATAKEY1, DATAKEY2]);
                    expect(retPromise.then !== void 0).toBe(true);
                    retPromise.then(() => {
                        // buildGuiKey and getGuiKeySuffixPart are spies that have been prepared in "beforeEach"
                        expect(this.buildGuiKey).toHaveBeenCalledTimes(1); // we simulated one kept text-key, which will get transformed to new viewkey
                        expect(this.getGuiKeySuffixPart).toHaveBeenCalledTimes(4);// 2 times for any newly added text-key
                
                        expect(Wincor.UI.Service.Provider.LocalizeService.getText).toHaveBeenCalled();
                        expect(Wincor.UI.Service.Provider.DataService.getValues).toHaveBeenCalled();
                        const localizeArgs = Wincor.UI.Service.Provider.LocalizeService.getText.calls.first().args;
                        const dataArgs = Wincor.UI.Service.Provider.DataService.getValues.calls.first().args;
                        expect(Array.isArray(localizeArgs[0])).toBe(true);
                        expect(Array.isArray(dataArgs[0])).toBe(true);
                        expect(localizeArgs[0].length).toBe(3); // we pushed 2 textkeys and kept one
                        expect(localizeArgs[0]).toEqual(jasmine.arrayContaining([TEXTKEY1, TEXTKEY2, TEXTKEY3])); // check them
                        expect(dataArgs.length).toBe(3); // bvm also registers 3rd arg for updates
                        expect(dataArgs[0].length).toBe(4); // we pushed 2 datakeys + 1 reloadkey + 1 viewstatekey
                        expect(dataArgs[0]).toEqual(jasmine.arrayContaining([DATAKEY1, DATAKEY2, VIEWSTATE_DATAKEY1])); // check them
                        // ready handlers should have been called also
                        expect(baseVm.onTextReady).toHaveBeenCalledTimes(1);
                        expect(baseVm.onTextReady).toHaveBeenCalledWith({
                            GUI_viewkey_TEXTKEY1: 'GUI_viewkey_TEXTKEY1',
                            GUI_viewkey_TEXTKEY2: 'GUI_viewkey_TEXTKEY2',
                            GUI_viewkey_TEXTKEY3: 'GUI_viewkey_TEXTKEY3'
                        });
                        expect(baseVm.onDataValuesReady).toHaveBeenCalledTimes(1);
                        expect(baseVm.onDataValuesReady).toHaveBeenCalledWith({
                            DATAKEY1: 'DATAKEY1',
                            DATAKEY2: 'DATAKEY2',
                            RELOAD_DATAKEY1: 'RELOAD_DATAKEY1',
                            VIEWSTATE_DATAKEY1: 'VIEWSTATE_DATAKEY1'
                        });
                        expect(baseVm.onInitialized).toHaveBeenCalledTimes(1);
                        expect(baseVm.onInitialized).toHaveBeenCalledWith({
                            dataKeys: {
                                DATAKEY1: 'DATAKEY1',
                                DATAKEY2: 'DATAKEY2',
                                RELOAD_DATAKEY1: 'RELOAD_DATAKEY1',
                                VIEWSTATE_DATAKEY1: 'VIEWSTATE_DATAKEY1'
                            },
                            textKeys: {
                                GUI_viewkey_TEXTKEY1: 'GUI_viewkey_TEXTKEY1',
                                GUI_viewkey_TEXTKEY2: 'GUI_viewkey_TEXTKEY2',
                                GUI_viewkey_TEXTKEY3: 'GUI_viewkey_TEXTKEY3'
                            }
                        });
                        done();
                    });
                }, done.fail);
            });
    
        });

        it("implements standard handler functions", done => {
            injector.require(["GUIAPP/content/viewmodels/base/BaseViewModel"], () => {
                const baseVm = new Wincor.UI.Content.BaseViewModel();
                // just check existence of the functions that are nops by default
                expect(typeof baseVm.onInitialized).toBe("function");
                expect(typeof baseVm.onAdaPrepared).toBe("function");
                expect(typeof baseVm.onBeforeApplyBindings).toBe("function");
                expect(typeof baseVm.onAfterApplyBindings).toBe("function");
                expect(typeof baseVm.onTextReady).toBe("function");
                expect(typeof baseVm.onDataValuesReady).toBe("function");
                expect(typeof baseVm.onTimeout).toBe("function");
                expect(typeof baseVm.onCancel).toBe("function");
                expect(typeof baseVm.onContinue).toBe("function");
                expect(typeof baseVm.onViewModelEvent).toBe("function");
                done();
            }, done.fail);
        });

        it("onScannedLabel default functions just returns argument", done => {
            injector.require(["GUIAPP/content/viewmodels/base/BaseViewModel"], () => {
                const baseVm = new Wincor.UI.Content.BaseViewModel();
                const LABEL = "MY_LABEL";

                expect(baseVm.onScannedLabel(LABEL)).toBe(LABEL);
                done();
            }, done.fail);
        });

        it("isAdaEnabled returns corresponding flag of ada module", done => {
            injector.require(["GUIAPP/content/viewmodels/base/BaseViewModel"], () => {
                Wincor.UI.Content.Ada._adaEnabled = true;
                const baseVm = new Wincor.UI.Content.BaseViewModel();
                expect(baseVm.isAdaEnabled()).toBe(true);
                Wincor.UI.Content.Ada._adaEnabled = false;
                expect(baseVm.isAdaEnabled()).toBe(false);
                done();
            }, done.fail);
        });
    
        describe("view state handling", () => {
            it("checks getViewStateFromProperty", done => {
                injector.require(["GUIAPP/content/viewmodels/base/BaseViewModel"], () => {
                    const baseVm = new Wincor.UI.Content.BaseViewModel();
                    const TEST_STATE_PROP = "PropTestViewState";
                    let update = () => {
                    };
                    spyOn(Wincor.UI.Service.Provider.DataService, "getValues").and.callFake((key, cb, upd) => {
                        expect(key[0]).toBe(TEST_STATE_PROP);
                        cb({ "PropTestViewState": 2 });
                        update = upd;
                    });
                    let stateObsv = baseVm.getViewStateFromProperty(TEST_STATE_PROP, 3);
                    expect(typeof stateObsv === "function").toBeTruthy();
                    expect(stateObsv()).toBe(2);
                    expect(TEST_STATE_PROP in baseVm.viewStatePropertyMap).toBeTruthy();
                    expect(baseVm.viewStatePropertyMap[TEST_STATE_PROP]()).toBe(2);
                    expect(stateObsv()).toBe(2);
                    update({ "PropTestViewState": 3 });
                    expect(stateObsv()).toBe(3);
                    expect(baseVm.viewStatePropertyMap[TEST_STATE_PROP]()).toBe(3);
                    done();
                }, done.fail);
            });
        });
        
        describe("view state handling from command config", () => {
            it("can extractViewStateFromConfig", done => {
                injector.require(["GUIAPP/content/viewmodels/base/BaseViewModel"], () => {
                    const CMD_ID = "TEST_CMD";
                    const baseVm = new Wincor.UI.Content.BaseViewModel();
            
                    /** a command that has it's flag "ignoreState" set to true will not be processed **/
                    const COMMAND = jQuery.extend(true, Wincor.UI.Content.Command);
                    COMMAND.ignoreState = true;
                    // create accessor spy
                    const spy = jasmine.createSpy("commandconfig accessor");
                    Object.defineProperty(baseVm.viewConfig, "commandconfig", {
                        get: spy
                    });
                    baseVm.extractViewStateFromConfig(COMMAND, 0);
                    expect(spy).not.toHaveBeenCalled();
                    spy.calls.reset();
            
                    /** a command that is not in commandconfig will not get added to viewStateKeys **/
                    COMMAND.ignoreState = false;
                    COMMAND.id = CMD_ID;
                    baseVm.extractViewStateFromConfig(COMMAND, 0);
                    expect(spy).toHaveBeenCalled();
                    expect(baseVm.viewStateKeys.length).toBe(0);
                    spy.calls.reset();
            
                    /**a command that is in commandconfig but has numeric state will not get added to viewStateKeys **/
                    baseVm.viewConfig = {
                        commandconfig: {
                            TEST_CMD: 2
                        }
                    };
                    COMMAND.ignoreState = false;
                    COMMAND.id = CMD_ID;
                    expect(baseVm.extractViewStateFromConfig(COMMAND, 0)).toBe(baseVm.viewConfig.commandconfig[CMD_ID]);
                    expect(baseVm.viewStateKeys.length).toBe(0);
                    done();
                }, done.fail);
            });
    
            it("can call extractViewStateFromConfig with broken void context", done => {
                injector.require(["GUIAPP/content/viewmodels/base/BaseViewModel"], () => {
                    const CMD_ID = "TEST_CMD";
                    const baseVm = new Wincor.UI.Content.BaseViewModel();
            
                    /** a command that has it's flag "ignoreState" set to true will not be processed **/
                    const COMMAND = jQuery.extend(true, Wincor.UI.Content.Command);
                    COMMAND.ignoreState = false;
                    COMMAND.id = CMD_ID;
                    baseVm.viewConfig = void 0;
                    let ret = baseVm.extractViewStateFromConfig(COMMAND, -1);
                    expect(ret).toBe(-1);
                    expect(baseVm.viewStateKeys.length).toBe(0);
                    done();
                }, done.fail);
            });
    
            it("can call extractViewStateFromConfig with broken command config", done => {
                injector.require(["GUIAPP/content/viewmodels/base/BaseViewModel"], () => {
                    const CMD_ID = "TEST_CMD";
                    const baseVm = new Wincor.UI.Content.BaseViewModel();
            
                    /** a command that has it's flag "ignoreState" set to true will not be processed **/
                    const COMMAND = jQuery.extend(true, Wincor.UI.Content.Command);
                    COMMAND.ignoreState = false;
                    COMMAND.id = CMD_ID;
                    baseVm.viewConfig = {};
                    let ret = baseVm.extractViewStateFromConfig(COMMAND, -1);
                    expect(ret).toBe(-1);
                    expect(baseVm.viewStateKeys.length).toBe(0);
                    done();
                }, done.fail);
            });
    
            it("can extractViewStateFromConfig on invalid command config - invalid default state", done => {
                injector.require(["GUIAPP/content/viewmodels/base/BaseViewModel"], async () => {
                    const baseVm = new Wincor.UI.Content.BaseViewModel();
                    /** a command that has it's flag "ignoreState" set to true will not be processed **/
                    const CMD_ID = "TEST_CMD";
                    const COMMAND = jQuery.extend(true, Wincor.UI.Content.Command);
                    COMMAND.id = CMD_ID;
                    COMMAND.ignoreState = false;
                    baseVm.viewConfig = {
                        commandconfig: {
                            TEST_CMD: "VAR_TEST_CMD_VIEWSTATE_S;X"
                        }
                    };
                    let ret = baseVm.extractViewStateFromConfig(COMMAND, -1);
                    expect(ret).toBe(-1);
                    expect(baseVm.viewStateKeys[0]).toBe("VAR_TEST_CMD_VIEWSTATE_S");
                    done();
                }, done.fail);
            });
    
            it("can handle duplicated keys", done => {
                injector.require(["GUIAPP/content/viewmodels/base/BaseViewModel"], async () => {
                    const baseVm = new Wincor.UI.Content.BaseViewModel();
                    /** a command that has it's flag "ignoreState" set to true will not be processed **/
                    const CMD_ID = "TEST_CMD";
                    const COMMAND = jQuery.extend(true, Wincor.UI.Content.Command);
                    COMMAND.ignoreState = false;
                    /** a command that is in commandconfig and has Property as state will get added to viewStateKeys**/
                    baseVm.viewConfig = {
                        commandconfig: {
                            TEST_CMD: "VAR_TEST_CMD_VIEWSTATE_S;3",
                            TEST_CMD_DUPLICATED: "VAR_TEST_CMD_VIEWSTATE_S;0",
                            TEST_CMD_NO_DEFAULT: "VAR_TEST_CMD_NO_DEFAULT_VIEWSTATE_S"
                        }
                    };
                    COMMAND.id = CMD_ID;
                    // should return the default value if given
                    expect(baseVm.extractViewStateFromConfig(COMMAND, 0)).toBe(parseInt(baseVm.viewConfig.commandconfig[CMD_ID].split(";")[1]));
                    expect(COMMAND.viewState.key).toBe(baseVm.viewConfig.commandconfig[CMD_ID].split(";")[0]);
                    expect(baseVm.viewStateKeys.length).toBe(1);
                    expect(baseVm.viewStateKeys[0]).toBe(baseVm.viewConfig.commandconfig[CMD_ID].split(";")[0]);
    
                    COMMAND.id = "TEST_CMD_NO_DEFAULT";
                    // should return passed state if no default is given
                    const STATE = 1;
                    expect(baseVm.extractViewStateFromConfig(COMMAND, STATE)).toBe(STATE);
                    expect(COMMAND.viewState.key).toBe(baseVm.viewConfig.commandconfig["TEST_CMD_NO_DEFAULT"]);
                    expect(baseVm.viewStateKeys.length).toBe(2);
                    expect(baseVm.viewStateKeys[1]).toBe(baseVm.viewConfig.commandconfig["TEST_CMD_NO_DEFAULT"]);
    
                    /** Duplicate keys should not get pushed into viewStateKeys array*/
                    COMMAND.id = "TEST_CMD_DUPLICATED"; // has same viewStateKey configured as TEST_CMD
                    expect(baseVm.extractViewStateFromConfig(COMMAND, 1))
                        .toBe(parseInt(baseVm.viewConfig.commandconfig["TEST_CMD_DUPLICATED"].split(";")[1]));
                    expect(COMMAND.viewState.key).toBe(baseVm.viewConfig.commandconfig["TEST_CMD_DUPLICATED"].split(";")[0]);
                    // duplicate should not have been pushed, so length stays at 2
                    expect(baseVm.viewStateKeys.length).toBe(2);
                    expect(baseVm.viewStateKeys[0]).toBe(baseVm.viewConfig.commandconfig["TEST_CMD_DUPLICATED"].split(";")[0]);
                    done();
                }, done.fail);
            });
    
            it("can extractViewStateFromConfig if flag isMainPromiseResolved=true", done => {
                injector.require(["GUIAPP/content/viewmodels/base/BaseViewModel"], async () => {
                    const baseVm = new Wincor.UI.Content.BaseViewModel();
                    /** a command that has it's flag "ignoreState" set to true will not be processed **/
                    const CMD_ID = "TEST_CMD";
                    const COMMAND = jQuery.extend(true, Wincor.UI.Content.Command);
                    COMMAND.id = CMD_ID;
                    COMMAND.ignoreState = false;
                    baseVm.viewConfig = {
                        commandconfig: {
                            TEST_CMD: "VAR_TEST_CMD_VIEWSTATE_S;3"
                        }
                    };
                    // wait for isMainPromiseResolved to become true:
                    await baseVm.initTextAndData([], []);
                    let ret = baseVm.extractViewStateFromConfig(COMMAND, -1);
                    expect(ret).toBe(-1);
                    expect(baseVm.viewStateKeys[0]).toBeUndefined();
                    done();
                }, done.fail);
            });

            it("can extractViewStateFromConfig if flag isMainPromiseResolved=false", done => {
                injector.require(["GUIAPP/content/viewmodels/base/BaseViewModel"], () => {
                    const baseVm = new Wincor.UI.Content.BaseViewModel();
                    /** a command that has it's flag "ignoreState" set to true will not be processed **/
                    const COMMAND = jQuery.extend(true, Wincor.UI.Content.Command);
                    const CMD_ID = "TEST_CMD";
                    COMMAND.id = CMD_ID;
                    COMMAND.ignoreState = false;
                    baseVm.viewConfig = {
                        commandconfig: {
                            TEST_CMD: "VAR_TEST_CMD_VIEWSTATE_S;3"
                        }
                    };
                    // isMainPromiseResolved is false
                    let ret = baseVm.extractViewStateFromConfig(COMMAND, -1);
                    expect(ret).toBe(3);
                    expect(baseVm.viewStateKeys[0]).toBe("VAR_TEST_CMD_VIEWSTATE_S");
                    done();
                }, done.fail);
            });
    
            it("can ensure isMainPromiseResolved flag gets reset", done => {
                injector.require(["GUIAPP/content/viewmodels/base/BaseViewModel"], async () => {
                    const baseVm = new Wincor.UI.Content.BaseViewModel();
                    /** a command that has it's flag "ignoreState" set to true will not be processed **/
                    const COMMAND = jQuery.extend(true, Wincor.UI.Content.Command);
                    const CMD_ID = "TEST_CMD";
                    COMMAND.id = CMD_ID;
                    COMMAND.ignoreState = false;
                    baseVm.viewConfig = {
                        commandconfig: {
                            TEST_CMD: "VAR_TEST_CMD_VIEWSTATE_S;2"
                        }
                    };
                    // isMainPromiseResolved is false
                    // wait for isMainPromiseResolved to become true:
                    await baseVm.initTextAndData([], []);
                    let ret = baseVm.extractViewStateFromConfig(COMMAND, -1);
                    expect(ret).toBe(-1);
                    expect(baseVm.viewStateKeys[0]).toBeUndefined();
                    baseVm.onDeactivated(); // should reset isMainPromiseResolved flag
                    // now should behave different from first call and should return our default value
                    ret = baseVm.extractViewStateFromConfig(COMMAND, -1);
                    expect(ret).toBe(2);
                    expect(baseVm.viewStateKeys[0]).toBe("VAR_TEST_CMD_VIEWSTATE_S");
                    done();
                }, done.fail);
            });
        });

        describe("getLabel", () => {

            it("returns an observable and initiates localizeService if value is not already available", done => {
                spyOn(Wincor.UI.Service.Provider.LocalizeService, "getText");
                injector.require(["GUIAPP/content/viewmodels/base/BaseViewModel"], () => {
                    const baseVm = new Wincor.UI.Content.BaseViewModel();
                    baseVm.__initializedTextAndData = true;
                    spyOn(baseVm, "replaceViewKeyPattern").and.callFake(a=>a);
                    spyOn(baseVm, "onScannedLabel").and.callFake(a=>a);
                    baseVm.labels = {
                        VALUE_NOT_AVAILABLE: "[n/a]"
                    };
                    baseVm.labels.getLabel = jasmine.createSpy("labelsGetLabel")
                        .and.callFake(() => ko.observable("[n/a]"));
                    baseVm.getLabel("GUI_[#VIEW_KEY#]_TEST");
                    expect(Wincor.UI.Service.Provider.LocalizeService.getText).toHaveBeenCalled();

                    done();
                }, done.fail);
            });

            it("creates computed observable and resolves dependencies when called with a contextMap", done => {
                spyOn(Wincor.UI.Service.Provider.LocalizeService, "getText");
                injector.require(["GUIAPP/content/viewmodels/base/BaseViewModel"], () => {
                    const baseVm = new Wincor.UI.Content.BaseViewModel();
                    const VIEW_KEY = "GUI_[#VIEW_KEY#]_TEST";
                    const VIEW_KEY_STRIPPED = VIEW_KEY.toLowerCase();
                    spyOn(baseVm, "replaceViewKeyPattern").and.callFake(a=>a);
                    spyOn(baseVm, "onScannedLabel").and.callFake(a=>a);
                    let trigger = Wincor.ko.observable("");
                    baseVm.labels = {
                        VALUE_NOT_AVAILABLE: "[n/a]",
                        labelItems: {
                            get: jasmine.createSpy("labelItemsGet").and.returnValue(trigger)
                        }
                    };
                    baseVm.labels.getLabel = jasmine.createSpy("labelsGetLabel")
                        .and.callFake(() => ko.observable("[n/a]"));
                    baseVm.labels.resolveVars = jasmine.createSpy("labelsResolveVars").and.returnValue("");
                    const contextMap = {
                        trigger: trigger
                    };
                    let computed = Wincor.ko.computed(() => {
                        return baseVm.getLabel(VIEW_KEY, "", {}, contextMap)() + trigger();
                    });
                    computed.subscribe(val => {
                        expect(baseVm.labels.labelItems.get.calls.first().args[0]).toEqual(VIEW_KEY_STRIPPED);
                        expect(baseVm.labels.resolveVars.calls.first().args[0]()).toEqual("go!");
                        expect(baseVm.labels.resolveVars.calls.first().args[1]).toEqual(contextMap);
                        expect(val).toEqual("go!");
                        done();
                    });
                    computed();
                    trigger("go!");
                }, done.fail);
            });
        });
    
        describe("ada", () => {
            it("suspendAdaSubscriptions", done => {
                injector.require(["GUIAPP/content/viewmodels/base/BaseViewModel"], () => {
                    const baseVm = new Wincor.UI.Content.BaseViewModel();
                    baseVm.suspendAdaSubscriptions();
                    expect(baseVm.ada._suspendAdaInputFieldSubscriptions).toBe(true);
                    done();
                }, done.fail);
            });
    
            it("resumeAdaSubscriptions", done => {
                injector.require(["GUIAPP/content/viewmodels/base/BaseViewModel"], () => {
                    const baseVm = new Wincor.UI.Content.BaseViewModel();
                    baseVm.resumeAdaSubscriptions();
                    expect(baseVm.ada._suspendAdaInputFieldSubscriptions).toBe(false);
                    done();
                }, done.fail);
            });
    
            it("notifyViewUpdated", done => {
                injector.require(["GUIAPP/content/viewmodels/base/BaseViewModel"], () => {
                    const baseVm = new Wincor.UI.Content.BaseViewModel();
                    baseVm.vmHelper.notifyViewUpdated = jasmine.createSpy("notifyViewUpdated");
                    baseVm.notifyViewUpdated("GUI");
                    expect(baseVm.vmHelper.notifyViewUpdated).toHaveBeenCalledWith("GUI", void 0);
                    done();
                }, done.fail);
            });
        });
    
        describe("ko util computed & subscription", () => {
            it("createComputedObservable", done => {
                injector.require(["GUIAPP/content/viewmodels/base/BaseViewModel"], () => {
                    const baseVm = new Wincor.UI.Content.BaseViewModel();
                    const observable = ko.observable(0);
                    let state = baseVm.createComputedObservable(() => {
                        return observable();
                    });
                    expect(baseVm.subscriptions.length).toBe(1); // the computed
                    expect(state()).toBe(0);
                    observable(2);
                    expect(state()).toBe(2);
                    done();
                }, done.fail);
            });
    
            it("createComputedObservable with subscription", done => {
                injector.require(["GUIAPP/content/viewmodels/base/BaseViewModel"], () => {
                    const baseVm = new Wincor.UI.Content.BaseViewModel();
                    const observable = ko.observable(0);
                    let subscriptionRes = -1;
                    let state = baseVm.createComputedObservable(() => {
                        return observable();
                    }, null, newVal => {
                        subscriptionRes = newVal === 3 ? 4 : 5;
                    });
                    expect(baseVm.subscriptions.length).toBe(2); // the computed + the subscription to it
                    expect(state()).toBe(0);
                    observable(3);
                    expect(subscriptionRes).toBe(4);
                    observable(0);
                    expect(subscriptionRes).toBe(5);
                    done();
                }, done.fail);
            });
    
            it("dispose createComputedObservable with subscription", done => {
                injector.require(["GUIAPP/content/viewmodels/base/BaseViewModel"], () => {
                    const baseVm = new Wincor.UI.Content.BaseViewModel();
                    baseVm.serviceProvider.LocalizeService.cleanTranslationTexts = jasmine.createSpy("cleanTranslationTexts");
                    const observable = ko.observable(0);
                    let subscriptionRes = -1;
                    baseVm.createComputedObservable(() => {
                        return observable();
                    }, null, newVal => {
                        subscriptionRes = newVal === 3 ? 4 : 5;
                    });
                    expect(baseVm.subscriptions.length).toBe(2); // the computed + the subscription to it
                    let sub1 = baseVm.subscriptions[0];
                    let sub2 = baseVm.subscriptions[1];
                    spyOn(sub1, "dispose").and.callThrough();
                    spyOn(sub2, "dispose").and.callThrough();
                    baseVm.labels = {removeAll: () => {}};
                    baseVm.clean();
                    expect(sub1.dispose).toHaveBeenCalled();
                    expect(sub2.dispose).toHaveBeenCalled();
                    expect(baseVm.subscriptions.length).toBe(0);
                    done();
                }, done.fail);
            });
    
            it("subscribeToObservable", done => {
                injector.require(["GUIAPP/content/viewmodels/base/BaseViewModel"], () => {
                    const baseVm = new Wincor.UI.Content.BaseViewModel();
                    const observable = ko.observable(0);
                    let subscriptionRes = -1;
                    baseVm.subscribeToObservable(observable, newVal => {
                        subscriptionRes = newVal;
                    });
                    expect(baseVm.subscriptions.length).toBe(1); // the subscription
                    observable(3);
                    expect(subscriptionRes).toBe(3);
                    done();
                }, done.fail);
            });
    
            it("dispose subscribeToObservable", done => {
                injector.require(["GUIAPP/content/viewmodels/base/BaseViewModel"], () => {
                    const baseVm = new Wincor.UI.Content.BaseViewModel();
                    baseVm.serviceProvider.LocalizeService.cleanTranslationTexts = jasmine.createSpy("cleanTranslationTexts");
                    const observable = ko.observable(0);
                    let subscriptionRes = -1;
                    baseVm.subscribeToObservable(observable, newVal => {
                        subscriptionRes = newVal;
                    });
                    expect(baseVm.subscriptions.length).toBe(1); // the subscription
                    observable(3);
                    expect(subscriptionRes).toBe(3);
                    let sub1 = baseVm.subscriptions[0];
                    spyOn(sub1, "dispose").and.callThrough();
                    baseVm.labels = { removeAll: () => {} };
                    baseVm.clean();
                    expect(sub1.dispose).toHaveBeenCalled();
                    expect(baseVm.subscriptions.length).toBe(0);
                    done();
                }, done.fail);
            });
    
        });
    
        describe("onDataValuesChanged", () => {
            it("calls onDataValuesReady", done => {
                injector.require(["GUIAPP/content/viewmodels/base/BaseViewModel"], () => {
                    const baseVm = new Wincor.UI.Content.BaseViewModel();
                    const res = { test: "hello"};
                    spyOn(baseVm, "onDataValuesReady").and.callThrough();
                    baseVm.onDataValuesChanged(res);
                    expect(baseVm.onDataValuesReady).toHaveBeenCalledWith(res);
                    done();
                }, done.fail);
            });
        });
    
        describe("apply bindings", () => {
            it("view node for applyBindings", done => {
                injector.require(["GUIAPP/content/viewmodels/base/BaseViewModel"], async () => {
                    const baseVm = new Wincor.UI.Content.BaseViewModel();
                    const $elm = jQuery(`<main><div class="borderDrawing"></div><footer id="flexFooter"></footer></main>`);
                    baseVm.observableAreaId = "flexMain";
                    spyOn(baseVm, "onBeforeApplyBindings").and.callThrough();
                    spyOn(baseVm, "onAfterApplyBindings").and.callThrough();
                    spyOn(baseVm, "onAfterApplyBindingsSync").and.callThrough();
                    spyOn(ko, "applyBindings").and.callThrough();
                    expect(baseVm.__bindingsApplied).toBeUndefined();
                    await baseVm.applyBindings($elm[0]);
                    expect(baseVm.onBeforeApplyBindings).toHaveBeenCalledTimes(1);
                    expect(baseVm.onBeforeApplyBindings).toHaveBeenCalledBefore(baseVm.onAfterApplyBindings);
                    expect(ko.applyBindings).toHaveBeenCalledTimes(1);
                    expect(ko.applyBindings).toHaveBeenCalledBefore(baseVm.onAfterApplyBindings);
                    expect(baseVm.onAfterApplyBindings).toHaveBeenCalledTimes(1);
                    expect(baseVm.onAfterApplyBindingsSync).toHaveBeenCalledTimes(1);
                    expect(baseVm.__bindingsApplied).toBe(true);
                    done();
                }, done.fail);
            });
    
            it("no view node for applyBindings", done => {
                injector.require(["GUIAPP/content/viewmodels/base/BaseViewModel"], async () => {
                    const baseVm = new Wincor.UI.Content.BaseViewModel();
                    baseVm.observableAreaId = "flexMain";
                    spyOn(baseVm, "onBeforeApplyBindings").and.callThrough();
                    spyOn(baseVm, "onAfterApplyBindings").and.callThrough();
                    spyOn(baseVm, "onAfterApplyBindingsSync").and.callThrough();
                    spyOn(ko, "applyBindings").and.callThrough();
                    expect(baseVm.__bindingsApplied).toBeUndefined();
                    try {
                        await baseVm.applyBindings(void 0);
                    } catch(e) {
                        expect(e.indexOf("observableAreaId=flexMain") !== -1).toBeTruthy();
                    }
                    expect(baseVm.__bindingsApplied).toBeUndefined();
                    done();
                }, done.fail);
            });
    
            it("checks onAfterApplyBindingsSync for lifeCycle=static", done => {
                injector.require(["GUIAPP/content/viewmodels/base/BaseViewModel"], () => {
                    const baseVm = new Wincor.UI.Content.BaseViewModel();
                    let callback = jasmine.createSpy("callback");
                    baseVm.lifeCycleMode = Wincor.UI.Content.ViewModelContainer.LIFE_CYCLE_MODE.STATIC;
                    baseVm.onAfterApplyBindingsSync(callback);
                    expect(callback).toHaveBeenCalled();
                    expect(baseVm.staticActivationFunction === callback).toBeTruthy();
                    done();
                }, done.fail);
            });
        });
    
        describe("onButtonPressed", () => {
            it("onButtonPressed with CONFIRM", done => {
                injector.require(["GUIAPP/content/viewmodels/base/BaseViewModel"], () => {
                    const baseVm = new Wincor.UI.Content.BaseViewModel();
                    spyOn(Wincor.UI.Service.Provider.ViewService, "endView");
                    Wincor.UI.Service.Provider.ViewService.UIRESULT_OK = "0";
                    baseVm.onButtonPressed("CONFIRM");
                    expect(Wincor.UI.Service.Provider.ViewService.endView).toHaveBeenCalledWith(
                        Wincor.UI.Service.Provider.ViewService.UIRESULT_OK,
                        "CONFIRM"
                    );
                    done();
                }, done.fail);
            });
    
            it("onButtonPressed with CANCEL", done => {
                injector.require(["GUIAPP/content/viewmodels/base/BaseViewModel"], () => {
                    const baseVm = new Wincor.UI.Content.BaseViewModel();
                    const viewModelHelper = injector.mocks["vm-util/ViewModelHelper"];
                    viewModelHelper.cancelView = jasmine.createSpy("cancelView");
                    spyOn(Wincor.UI.Service.Provider.ViewService, "endView");
                    baseVm.onButtonPressed(baseVm.STANDARD_BUTTONS.CANCEL);
                    expect(viewModelHelper.cancelView).toHaveBeenCalled();
                    expect(Wincor.UI.Service.Provider.ViewService.endView).not.toHaveBeenCalled();
                    done();
                }, done.fail);
            });
    
        });
    
        describe("error handler", () => {
            it("calls handleError with an exception", done => {
                injector.require(["GUIAPP/content/viewmodels/base/BaseViewModel"], () => {
                    const baseVm = new Wincor.UI.Content.BaseViewModel();
                    const error = new Error("Test an error handler");
                    const message = "An arbitrary error";
                    spyOn(Wincor.UI.Service.Provider, "propagateError").and.callFake((msg, other, e) => {
                        expect(msg.includes(message)).toBeTruthy();
                        expect(other).toBe("OTHER");
                        expect(e).toBe(error);
                    });
                    baseVm.handleError(error, message);
                    expect(Wincor.UI.Service.Provider.propagateError).toHaveBeenCalled();
                    done();
                }, done.fail);
            });
        });
    
        describe("popup handler", () => {
            it("calls showPopupMessage", done => {
                injector.require(["GUIAPP/content/viewmodels/base/BaseViewModel"], () => {
                    const baseVm = new Wincor.UI.Content.BaseViewModel();
                    const viewModelHelper = injector.mocks["vm-util/ViewModelHelper"];
                    viewModelHelper.showPopupMessage = jasmine.createSpy("showPopupMessage");
                    const comp = "myComponent.html";
                    const opt = {type: "CANCEL_POPUP"};
                    const cb = () => {};
                    baseVm.showPopupMessage(comp, opt, cb);
                    expect(viewModelHelper.showPopupMessage).toHaveBeenCalledWith(comp, opt, cb);
                    done();
                }, done.fail);
            });
            
            it("calls hidePopupMessage", done => {
                injector.require(["GUIAPP/content/viewmodels/base/BaseViewModel"], () => {
                    const baseVm = new Wincor.UI.Content.BaseViewModel();
                    const viewModelHelper = injector.mocks["vm-util/ViewModelHelper"];
                    viewModelHelper.hidePopupMessage = jasmine.createSpy("hidePopupMessage");
                    baseVm.hidePopupMessage();
                    expect(viewModelHelper.hidePopupMessage).toHaveBeenCalled();
                    done();
                }, done.fail);
            });
    
            it("calls getPopupOptions", done => {
                injector.require(["GUIAPP/content/viewmodels/base/BaseViewModel"], () => {
                    const baseVm = new Wincor.UI.Content.BaseViewModel();
                    const viewModelHelper = injector.mocks["vm-util/ViewModelHelper"];
                    viewModelHelper.popupOptions = {type: "CANCEL_POPUP"};
                    expect(baseVm.getPopupOptions()).toBe(viewModelHelper.popupOptions);
                    done();
                }, done.fail);
            });
            
            it("calls showPopupHint", done => {
                injector.require(["GUIAPP/content/viewmodels/base/BaseViewModel"], () => {
                    const baseVm = new Wincor.UI.Content.BaseViewModel();
                    const viewModelHelper = injector.mocks["vm-util/ViewModelHelper"];
                    viewModelHelper.triggerEvent = jasmine.createSpy("triggerEvent");
                    const msg = "This is a popup hint.";
                    const id = "myId";
                    const cb = () => {
                    };
                    baseVm.showPopupHint(msg, baseVm.POPUP_DEFAULT_TYPE, id, cb);
                    expect(viewModelHelper.triggerEvent).toHaveBeenCalledWith(
                        "uipopuphint",
                        {msg: msg, type: baseVm.POPUP_DEFAULT_TYPE, id: id, callback: cb}
                    );
                    done();
                }, done.fail);
            });
    
            it("calls removePopupHint", done => {
                injector.require(["GUIAPP/content/viewmodels/base/BaseViewModel"], () => {
                    const baseVm = new Wincor.UI.Content.BaseViewModel();
                    const viewModelHelper = injector.mocks["vm-util/ViewModelHelper"];
                    viewModelHelper.triggerEvent = jasmine.createSpy("triggerEvent");
                    const cb = () => {
                    };
                    baseVm.removePopupHint(cb);
                    expect(viewModelHelper.triggerEvent).toHaveBeenCalledWith(
                        "uiremovepopup",
                        {callback: cb, immediate: false}
                    );
                    done();
                }, done.fail);
            });
        });
    
        describe("building keys", () => {
            it("build a Gui key", done => {
                injector.require(["GUIAPP/content/viewmodels/base/BaseViewModel"], () => {
                    const baseVm = new Wincor.UI.Content.BaseViewModel();
                    const uiMapping = injector.mocks["flexuimapping"];
                    uiMapping.buildGuiKey = jasmine.createSpy("buildGuiKey");
                    baseVm.viewKey = "MenuSelection";
                    baseVm.buildGuiKey("Button", "Label");
                    expect(uiMapping.buildGuiKey).toHaveBeenCalledWith(baseVm.viewKey, "Button", "Label");
                    done();
                }, done.fail);
            });
    
            it("build an event Gui key", done => {
                injector.require(["GUIAPP/content/viewmodels/base/BaseViewModel"], () => {
                    const baseVm = new Wincor.UI.Content.BaseViewModel();
                    const uiMapping = injector.mocks["flexuimapping"];
                    uiMapping.buildGuiKey = jasmine.createSpy("buildGuiKey");
                    baseVm.viewKey = "MenuSelection";
                    baseVm.buildGuiEventKey("10013", "Message");
                    expect(uiMapping.buildGuiKey).toHaveBeenCalledWith(baseVm.viewKey, "Event", "10013", "Message");
                    done();
                }, done.fail);
            });
    
            it("replaces a viewkey pattern", done => {
                injector.require(["GUIAPP/content/viewmodels/base/BaseViewModel"], () => {
                    const baseVm = new Wincor.UI.Content.BaseViewModel();
                    baseVm.viewKey = "MenuSelection";
                    let newKey = baseVm.replaceViewKeyPattern("GUI_[#VIEW_KEY#]_Button_Label");
                    expect(newKey).toBe("GUI_MenuSelection_Button_Label");
                    done();
                }, done.fail);
            });
    
            it("sets a viewkey", done => {
                injector.require(["GUIAPP/content/viewmodels/base/BaseViewModel"], () => {
                    const baseVm = new Wincor.UI.Content.BaseViewModel();
                    const key = "MenuSelection";
                    baseVm.setViewKey(key);
                    expect(baseVm.viewKey).toBe(key);
                    expect(baseVm.viewKeyObservable()).toBe(key);
                    done();
                }, done.fail);
            });
        });
    
        describe("live cycle: destruction methods", () => {
            it("checks onDeactivated", done => {
                injector.require(["GUIAPP/content/viewmodels/base/BaseViewModel"], () => {
                    const baseVm = new Wincor.UI.Content.BaseViewModel();
                    baseVm.bankingContext = {a: "a", b: "b", c: "c"};
                    baseVm.viewStatePropertyMap = ["Hello"];
                    baseVm.viewStateKeys = ["1", "2", "3"];
                    baseVm.dataKeys = ["1", "2", "3"];
                    baseVm.textKeys = ["1", "2", "3"];
                    baseVm.onDeactivated();

                    expect(baseVm.bankingContext).toEqual({
                        dateTime: null,
                        currencyData: null
                    });
                    expect(baseVm.viewStatePropertyMap.length).toBe(0);
                    expect(baseVm.viewStateKeys.length).toBe(0);
                    expect(baseVm.dataKeys.length).toBe(0);
                    expect(baseVm.textKeys).toEqual(["1", "2", "3"]);
                    expect(baseVm.labels).not.toBe(null);
                    done();
                }, done.fail);
            });
    
            it("checks onReactivated", done => {
                injector.require(["GUIAPP/content/viewmodels/base/BaseViewModel"], () => {
                    const baseVm = new Wincor.UI.Content.BaseViewModel();
                    const cmd = {initialViewState: 2};
                    Wincor.UI.Content.Commanding.getCommandsByViewModel = jasmine.createSpy("getCommandsByViewModel").and.returnValue([cmd]);
                    spyOn(baseVm, "extractViewStateFromConfig");
                    baseVm.onReactivated();
                    expect(Wincor.UI.Content.Commanding.getCommandsByViewModel).toHaveBeenCalled();
                    expect(baseVm.extractViewStateFromConfig).toHaveBeenCalledWith(cmd, 2);
                    done();
                }, done.fail);
            });
    
            it("cleans up", done => {
                injector.require(["GUIAPP/content/viewmodels/base/BaseViewModel"], () => {
                    const subs = {
                        dispose: jasmine.createSpy("dispose")
                    };
                    const baseVm = new Wincor.UI.Content.BaseViewModel();
                    const removeAll = baseVm.labels.removeAll = jasmine.createSpy("removeAll");
                    baseVm.serviceProvider.LocalizeService.cleanTranslationTexts = jasmine.createSpy("cleanTranslationTexts");
                    baseVm.subscriptions = [subs];
                    baseVm.viewStateKeys = ["1", "2", "3"];
                    baseVm.dataKeys = ["1", "2", "3"];
                    baseVm.textKeys = ["1", "2", "3"];
                    baseVm.clean();
                    expect(subs.dispose).toHaveBeenCalled();
                    expect(removeAll).toHaveBeenCalled();
                    expect(baseVm.serviceProvider.LocalizeService.cleanTranslationTexts).toHaveBeenCalledWith(false);
                    expect(baseVm.labels).toBe(null);
                    expect(baseVm.subscriptions.length).toBe(0);
                    expect(baseVm.viewStateKeys.length).toBe(0);
                    expect(baseVm.dataKeys.length).toBe(0);
                    expect(baseVm.textKeys.length).toBe(0);
                    done();
                }, done.fail);
            });
    
        });
    });
});
