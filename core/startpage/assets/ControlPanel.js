/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ ControlPanel.js 4.3.1-210505-21-c0d9f31f-1a04bc7d
 */

/*global jQuery:false requirejs:false Wincor:false */
/* eslint-disable no-unused-vars */
/* eslint-disable space-before-function-paren */

const DEBUG = false;

const ACTIVATE_BEEP_SERVICE_ON = "activateBeepServiceOn";
const ACTIVATE_CANCEL_BEHAVIOUR_ON = "activateCancelBehaviourOn";
const ACTIVATE_PIN_ETS_BEHAVIOUR_ON = "activatePinEtsBehaviourOn";
const ACTIVATE_SUB_MENUS_ON = "activateSubmenusOn";
const ACTIVATE_MOVE_ON_WAIT_ON = "activateMoveOnWaitOn";
const ACTIVATE_TRACE_ON = "activateTraceOn";

const LEVEL_INFO = "InfoBox";
const LEVEL_WARNING = "WarningBox";
const LEVEL_ERROR = "ErrorBox";

const _viewService = window.opener.Wincor.UI.Service.Provider.ViewService;
const _controlPanelService = window.opener.Wincor.UI.Service.Provider.ControlPanelService;
const _dataService = window.opener.Wincor.UI.Service.Provider.DataService;
const _localizeService = window.opener.Wincor.UI.Service.Provider.LocalizeService;
const _configService = window.opener.Wincor.UI.Service.Provider.ConfigService;
const _eventService = window.opener.Wincor.UI.Service.Provider.EventService;
const _formatService = window.opener.Wincor.UI.Service.Provider.FormatService;
const Promise = window.opener.Wincor.UI.Promise;

const EVENT_INFO = _eventService.getEventInfo("TRANSACTION_MODULE");

let _currentViewKey = "";
let _defaultViewKey = "";
let _currentViewId = "";
let _shutdownInProgress = false;
let _isContentPrepared = false;
let _isStartPhase = true;
let _context = {};

const PROP_MENU_PREF = "CCTAFW_PROP_MENU_PREFERENCE";
let _menuPreferencesData;

async function resetBusinessData() {
    await Promise.all([_dataService.onSetup(""), _localizeService.onSetup(""), _viewService.onSetup("")]);
    refreshView(_context, null, true);
}

function gotoIdleLoop() {
    if(_currentViewKey !== "IdleLoopPresentation") {
        _viewService.display({viewKey: "IdleLoopPresentation", viewURL: ""});
    }
}

function updateGotoDefault(btnContext) {
    if(btnContext && btnContext.textContent) {
        jQuery(btnContext).html(`Goto <span>${_defaultViewKey}</span>`).find("span").css({"font-size": "0.8em", "font-stretch": "condensed", "word-break": "break-word"});
    }
    window.localStorage.setItem("defaultViewKey", _defaultViewKey);
}

function gotoDefault(btnContext) {
    _defaultViewKey = window.localStorage.getItem("defaultViewKey") || _currentViewKey;
    updateGotoDefault(btnContext);
    _viewService.display({viewKey: _defaultViewKey, viewURL: ""});
}

function gotoDefaultContextMenu(btnContext) {
    if(btnContext && btnContext.textContent) {
        _defaultViewKey = "";
        window.localStorage.setItem("defaultViewKey", "");
        btnContext.textContent = "Set Default";
    }
}

// viewset switch
function viewSetSwitch(viewSet, immediately) {
    window.opener.loadViewSet(viewSet, immediately);
}

function installCloseMessage(context) {
    setTimeout(() => {
        const $msgContainerHeader = context.$parentDocument.find(".messageArea");
        if($msgContainerHeader.length) {
            $msgContainerHeader.removeAttr("onclick");
        }
        if(!$msgContainerHeader.parent().find("button").length) {
            $msgContainerHeader.after(`<button id='closeMessageId' style='animation: slideInRight 0.5s ease-in; align-self: flex-end; position: absolute;'
                                     onclick="Wincor.UI.Content?.ViewModelContainer?.sendViewModelEvent(Wincor.UI.Content.ViewModelContainer.EVENT_ON_BEFORE_CLEAN);
                                     jQuery(this).remove();">
                                     Close message
                                    </button>`);
        }
    }, 250);
}

function updateAdaState(state) {
    const $functions = jQuery("#functions");
    $functions.find("button").button();
    $functions.find("#funcStartAda").button(state);
}

/*-- Logging panel --*/
let _logMessage = null;
function updateLogPanel(text) {
    console.error(text);
    if(_logMessage) {
        _logMessage(`${_logMessage()}\r\n${text}`);
    }
}

function addLogMessage(message, viewModelWithLogFunction) {
    if(viewModelWithLogFunction && viewModelWithLogFunction.logMessages && viewModelWithLogFunction.logMessagesObservable) {
        let messages = viewModelWithLogFunction.logMessages;
        if(!messages.includes(message)) {
            messages.push(message);
            viewModelWithLogFunction.logMessagesObservable.valueHasMutated();
        }
    }
}

function removeLogMessage(message, viewModelWithLogFunction) {
    if(viewModelWithLogFunction && viewModelWithLogFunction.logMessages && viewModelWithLogFunction.logMessagesObservable) {
        let messages =  viewModelWithLogFunction.logMessages;
        if(messages.includes(message)) {
            messages.splice(messages.indexOf(message), 1);
            viewModelWithLogFunction.logMessagesObservable.valueHasMutated();
        }
    }
}

function updateLogMessage(message, viewModelWithLogFunction, state) {
    if(!state) {
        addLogMessage(message, viewModelWithLogFunction)
    } else {
        removeLogMessage(message, viewModelWithLogFunction)
    }
}

// if(!window.opener.Wincor.applicationMode) {
//     window.opener.Wincor.UI.Diagnostics.LogProvider.error = function(message) {
//         updateLogPanel(message);
//         window.opener.console.error(message);
//     };
// }

// refresh current view
let _refreshViewLock = false;
function refreshView(context, key, forceRefreshView, viewKeyToForce) {
    if(!_refreshViewLock && _isContentPrepared && !_isStartPhase && !context.container.designTimeRunner?.isNavigationInProgress()) {
        _refreshViewLock = true;
        setTimeout(async() => {
            if(!context.container.designTimeRunner?.isNavigationInProgress()) {
                // check weather the property is part of the current command config.
                // in that case its not necessary to reload the current view
                let viewContext = _viewService.viewContext;
                // check for property update registrations
                let dataRegists = _dataService.getDataRegistrations();
                let isPropertyUpdate = false;
                dataRegists.forEach(reg => {
                    if(reg.keys.includes(key)) {
                        isPropertyUpdate = true;
                    }
                });
                if(viewContext.viewConfig && !isPropertyUpdate &&
                    (viewContext.viewConfig.commandconfig === void 0 || !Object.values(viewContext.viewConfig.commandconfig).includes(key))) {
                    let target = {
                        name: viewContext.viewKey,
                        url: viewContext.viewConfig.url
                    };
                    if((forceRefreshView && !viewKeyToForce) || viewKeyToForce === _currentViewKey) {
                        if(context.container.designTimeRunner) {
                            context.container.designTimeRunner.navigateToRoute(target, target.url);
                        } else {
                            _viewService.display({viewKey: target.name, viewURL: target.url});
                        }
                    } else {
                        await _localizeService.updateTexts();
                    }
                }
            }
            _refreshViewLock = false;
        }, 250);
    }
}

// Context
function getContext() { // external called
    return _context;
}

/*-- properties --*/
// Property select box + property value handling
const PROPERTIES_SELECTION_BOX_CLASS = ".propertiesSelectBoxBasicSingle";
const PROPERTIES_SELECTION_BOX = "#propertiesSelectBox";
const PROPERTY_VALUE_TEXT_AREA = "#propertyValueTextArea";
const PROPERTY_ADD_VALUE_TEXT_AREA = "#addPropertyValueTextArea";
const PROPERTY_VALUE = "#propertyValue";
let _businessPropertiesUpdate;
function businessPropertiesUpdate(propMap) { // external called
    if(_businessPropertiesUpdate) {
        _businessPropertiesUpdate(propMap);
    }
}

function isKeyAvailable(key) {
    const keys = Object.keys(_dataService.businessData);
    key = key && key.toLowerCase();
    const res = keys.filter(item => {
        return item.toLowerCase() === key;
    });
    return res && res.length;
}

function jsonBeauty(json) {
    if(typeof json !== 'string') {
        json = JSON.stringify(json, void 0, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, match => {
        let cls = 'number';
        if(/^"/.test(match)) {
            if(/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if(/true|false/.test(match)) {
            cls = 'boolean';
        } else if(/null/.test(match)) {
            cls = 'null';
        }
        return `<span class="${cls}">${match}</span>`;
    });
}

function formatTextSeparator(text) {
    let temp = text.split(",");
    let ret = "";
    temp.forEach((item, idx) => {
        if(idx < (temp.length - 1)) {
            ret += `${item}\n`;
        } else {
            ret += `${item}`;
        }
    });
    return ret;
}

function isJSON(text) {
    let isJSON = true;
    try {
       JSON.parse(text);
    } catch(e) {
        isJSON = false;
    }
    return isJSON;
}

// Starts editing the text area.
// The start is forced only if the value length exceeds a limit.
function editProperty(inputId, textAreaId, splitMode = false, offsetTop = 0) {
    let $value = jQuery(`#${inputId}`);
    let val = $value.val();
    let $key = jQuery("#select2-propertiesSelectBox-container");
    let key = $key.attr("title");
    let isLISE = key && typeof key === "string" && key.indexOf("[A") !== -1;
    if(splitMode || val.length > 50 || isLISE) {
        let $text = jQuery(`#${textAreaId}`);
        $text.show();
        $text.offset($value.offset());
        $text.css({
            "width": $value.width(),
            "max-width": $value.width(),
            "top": $text.offset().top + offsetTop
        });
        if(!splitMode) {
            $text.focus();
            if(isJSON($value.val())) {
                try {
                    $text[0].innerHTML = jsonBeauty(JSON.stringify(JSON.parse($value.val()), void 0, 4));
                } catch(e) {
                    updateLogPanel(e);
                }
            } else if(isLISE) {
                $text[0].innerHTML = formatTextSeparator($value.val());
            } else {
                $text[0].innerHTML = $value.val();
            }
        }
    }
}

function editViewKey() {
    let $value = jQuery("#viewKeyValue");
    let $text = jQuery("#viewKeyValueTextArea");
    $text.show();
    $text.offset($value.offset());
    $text.css({
        "width": $value.width(),
        "max-width": $value.width()
    });
    $text.focus();
    if(isJSON($value.val())) {
        try {
            $text[0].innerHTML = jsonBeauty(JSON.stringify(JSON.parse($value.val()), void 0, 4));
        } catch(e) {
            updateLogPanel(e);
        }
    }
}

requirejs.config({
    //By default load any module IDs from GUI
    skipDataMain: true,
    baseUrl: "../",
    priority: 'ControlPanel',
    paths: {
        'jquery': "../../lib/jquery-min",
        'jquery-ui': "../../lib/jquery-ui-min",
        'knockout': "../../lib/knockout",
        'ko-mapping': "../../lib/knockout.mapping",
        'extensions': "../../lib/internal/wn.UI.extensionsWrapper",
        'countdown360': "../../lib/jquery.countdown360",
        'transit': "../../lib/jquery.transit",
        'select2': "../../lib/select2",
        'wn-ui': "../../content/viewmodels/base/wn.UI.Content",
        'cash-helper': "../../core/servicemocks/flowactionplugins/util/cashHelper",
        'throttle': "../../lib/jquery.throttle-debounce",
        'log-provider': "../core/service/wn.UI.Diagnostics.LogProvider",
        'vm-util': "../../content/viewmodels/base"
    },
    shim: {
        'jquery': {
            exports: 'jQuery'
        },
        'jquery-ui': ['jquery'],
        'knockout': {
            //These script dependencies should be loaded before loading
            //knockout.js
            deps: ['jquery']
        }
    }
});

define(["jquery", "jquery-ui", "knockout", "ko-mapping", "cash-helper", "countdown360", "transit", "select2", "throttle", "wn-ui"], (jQuery, jQueryUI, ko, koMapping, cashHelper) => {
    _logMessage = ko.observable("");

    /*-- Checkboxes main panel --*/
    function initMainPanel(context) {
        const moreOptionsViewModel = {
            enableBeepMode: ko.observable(false),
            enableCancelBehaviour: ko.observable(false),
            enablePINEtsMode: ko.observable(false),
            enableSubMenus: ko.observable(false),
            enableMoveOnWait: ko.observable(false),
            enableTrace: ko.observable(false)
        };

        const PIN_ENTRY_VIEW_KEYS = ["PinEntry", "PinChangePinEntry", "PinChangePinConfirmation"];
        
        // -- UI --
        const $moreOptions = jQuery("#moreOptions");
        ko.applyBindings(moreOptionsViewModel, $moreOptions[0]);
        $moreOptions.find("button").button();
        $moreOptions.find("input[type=checkbox]").checkboxradio();

        // -- context --
        context.moreOptionsViewModel = moreOptionsViewModel;

        // beep checkbox
        moreOptionsViewModel.enableBeepMode.subscribe(newVal => {
            localStorage.setItem(ACTIVATE_BEEP_SERVICE_ON, newVal);
        });
        moreOptionsViewModel.enableBeepMode(localStorage.getItem(ACTIVATE_BEEP_SERVICE_ON) === "true");

        // cancel behaviour checkbox
        moreOptionsViewModel.enableCancelBehaviour.subscribe(newVal => {
            localStorage.setItem(ACTIVATE_CANCEL_BEHAVIOUR_ON, newVal);
            if(!window.opener.Wincor.applicationMode) {
                _viewService.viewContext.viewConfig.popup.oncancel = newVal;
                // update vk list
               _viewService.viewContext.viewKeyList.forEach(item => {
                    if(item.viewConfig) {
                        item.viewConfig.popup = item.viewConfig.popup || {};
                        item.viewConfig.popup.oncancel = newVal;
                    }
                });
            }
        });
        moreOptionsViewModel.enableCancelBehaviour.extend({notify: "always"}); // we want to initially force the subscription!
        moreOptionsViewModel.enableCancelBehaviour(localStorage.getItem(ACTIVATE_CANCEL_BEHAVIOUR_ON) === "true");

        // PIN ETS behaviour checkbox
        moreOptionsViewModel.enablePINEtsMode.subscribe(async newVal => {
            localStorage.setItem(ACTIVATE_PIN_ETS_BEHAVIOUR_ON, newVal);
            if(!window.opener.Wincor.applicationMode) {
                await _dataService.setValues("CCTAFW_PROP_ETS_LAYOUT", newVal ? "ets" : "", null);
            }
            if(PIN_ENTRY_VIEW_KEYS.includes(_currentViewKey)) {
                refreshView(_context, null, true, _currentViewKey);
            }
        });
        moreOptionsViewModel.enablePINEtsMode(localStorage.getItem(ACTIVATE_PIN_ETS_BEHAVIOUR_ON) === "true");

        // enable sub menus checkbox
        moreOptionsViewModel.enableSubMenus.subscribe(async newVal => {
            localStorage.setItem(ACTIVATE_SUB_MENUS_ON, newVal);
            // remember menu preferences data if not set
            if(!_menuPreferencesData) {
                let result = await _dataService.getValues(PROP_MENU_PREF, null, null);
                _menuPreferencesData = result[PROP_MENU_PREF];
                if(newVal) {
                    await _dataService.setValues(PROP_MENU_PREF, "{}", null);
                }
            } else if(newVal) {
                await _dataService.setValues(PROP_MENU_PREF, "{}", null);
            } else { // restore menu preferences data
                await _dataService.setValues(PROP_MENU_PREF, _menuPreferencesData, null);
                _menuPreferencesData = null;
            }
            refreshView(_context, null, true, "MenuSelection");
        });
        moreOptionsViewModel.enableSubMenus(localStorage.getItem(ACTIVATE_SUB_MENUS_ON) === "true");

        // enables move on wait
        moreOptionsViewModel.enableMoveOnWait.subscribe(newVal => {
            localStorage.setItem(ACTIVATE_MOVE_ON_WAIT_ON, newVal);
        });
        moreOptionsViewModel.enableMoveOnWait(localStorage.getItem(ACTIVATE_MOVE_ON_WAIT_ON) === "true");
    
        // enables trace
        moreOptionsViewModel.enableTrace.subscribe(newVal => {
            localStorage.setItem(ACTIVATE_TRACE_ON, newVal);
            if(window.opener.traceOn) {
                if(newVal) {
                    window.opener.traceOn();
                } else {
                    window.opener.traceOff();
                }
            }
        });
        moreOptionsViewModel.enableTrace(localStorage.getItem(ACTIVATE_TRACE_ON) === "true");
    
        // refresh
        $moreOptions.find("input[type=checkbox]").checkboxradio("refresh");

        // timer handling
        const $timerChk = jQuery("#timerCheckBox");
        if(localStorage.getItem("activateTimeoutsOn") === "true" || window.opener.Wincor.applicationMode) {
            const $timer = jQuery("#countdown");
            $timerChk.change(() => {
                if($timerChk.is(':checked')) {
                    $timer.css({opacity: 0, visibility: "visible"});
                    $timer.transition({opacity: 1}, 500);
                } else {
                    $timer.transition({opacity: 0}, 500, () => $timer.css({opacity: 0, visibility: "hidden"}));
                }
            });
            if($timer.length) {
                $timer.countdown360({
                    radius: 35.5,
                    seconds: 5,
                    strokeWidth: 10,
                    fillStyle: '#4aaaaa',
                    strokeStyle: '#333333',
                    fontSize: 25,
                    fontColor: '#FFFFFF',
                    label: ["second", "seconds"],
                    autostart: false,
                    onComplete: () => {
                    }
                });
                _controlPanelService.registerForServiceEvent(_controlPanelService.SERVICE_EVENTS.NEW_TIMEOUT, time => {
                    $timer.countdown360().stop();
                    time = time > 0 ? time : 0;
                    $timer.data('plugin_countdown360').settings.seconds = time / 1000;
                    $timer.countdown360().start();
                }, true);
                _viewService.registerForServiceEvent(_viewService.SERVICE_EVENTS.REFRESH_TIMEOUT, time => {
                    $timer.countdown360().stop();
                    time = time > 0 ? time : 0;
                    $timer.data('plugin_countdown360').settings.seconds = time / 1000;
                    $timer.countdown360().start();
                }, true);
                _viewService.refreshTimeout();
            }
        } else {
            $timerChk.attr("disabled", "disabled");
        }
    }

    // ------ Properties ------
    let _businessProperties = ko.observableArray([]);

    _businessPropertiesUpdate = function(propMap) {
        function updatePropWatch(propViewModel) {
            let bindCtx = ko.contextFor(jQuery("#propertiesPanel")[0]);
            propViewModel = propViewModel || bindCtx ? bindCtx.$data : null;
            if(propViewModel && _businessProperties) {
                const $watches = jQuery("#propWatches input");
                for(let [index, data] of _businessProperties().entries()) {
                    propViewModel.watchProperties().find((item, idx) => {
                        if(item.name === data.name && item.value() !== data.value) {
                            item.value(data.value);
                            // a visible effect
                            jQuery($watches[idx]).css({
                                animation: "shake 0.15s"
                            });
                            // update property input value as well
                            if(propViewModel.propertyData().name === item.name) {
                                propViewModel.propertyData().value = data.value;
                                propViewModel.propertyData.valueHasMutated();
                            }
                            return true;
                        }
                        return false;
                    });
                }
                setTimeout(() => { // reset anim
                    $watches.each((idx, watch) => jQuery(watch).css("animation", "none"));
                }, 200);
            }
        }

        setTimeout(() => {
            let businessPropertyMap = new Map([...propMap.entries()].sort()); // decouple from delivered map
            let props = typeof _businessProperties === "function" ? _businessProperties() : [];
            for(let [key, value] of businessPropertyMap.entries()) {
                if(!props.find(item => {
                    if(item.name === key) {
                        item.value = value;
                        return true;
                    }
                    return false;
                })) {
                    props.push({
                        name: key,
                        value: value
                    });
                }
            }
            if(typeof _businessProperties === "function") {
                _businessProperties(props);
                _businessProperties.valueHasMutated();
                let $propsList = jQuery(PROPERTIES_SELECTION_BOX_CLASS);
                $propsList.select2();
                updatePropWatch();
            }
        }, 1);
    };

    function initProperties(context) {
        let isInit = true;
        const propViewModel = {
            businessProperties: _businessProperties,
            propertyData: ko.observable({}), // gets a property object
            watchProperties: ko.observableArray([]),
            addPropertyNameList: ko.observableArray([]),
            addPropertyNameFromList: ko.observable(),
            addPropertyName: ko.observable(),
            get watchProperty() {
                // -isInit because there is one call while apply bindings
                if(!isInit && this.propertyData() && this.propertyData().name && this.watchProperties().every(data => data.name !== this.propertyData().name)) {
                    this.watchProperties.push({name: this.propertyData().name, value: ko.observable(this.propertyData().value)});
                }
                return "";
            },
            get clearWatchProperty() {
                return this.watchProperties([]);
            },
            get addProperty() {
                if(!isInit) {
                    const $addProp = jQuery("#addProperty");
                    const $propName = $addProp.find("#addPropertyName");
                    const $propVal = $addProp.find("#addPropertyValueTextArea");
                    const $propertyNameList = $addProp.find("#addPropertyNameList");
                    $addProp.show();
                    $addProp.find("#addPropertyName").focus();
                    $propertyNameList.on('select2:select', function(e) {
                        propViewModel.addPropertyName(propViewModel.addPropertyNameFromList());
                    });
                    $propVal.on("focusin", () => {
                        $propertyNameList.slideUp();
                    });
                    $propName.on("keyup", evt => {
                        const keys = Object.keys(_dataService.businessData);
                        const key = $propName.val();
                        const val = key && key.toLowerCase();
                        if(val) {
                            const list = keys.filter(key => {
                                let lowerKey = key.toLowerCase();
                                return lowerKey.startsWith(val) || lowerKey.indexOf(val) !== -1;
                            });
                            if(list.length < 250) {
                                propViewModel.addPropertyNameList(list);
                                // reset
                                $propertyNameList.select2({
                                    minimumResultsForSearch: Infinity // no search box
                                });
                                if(list.length > 1) {
                                    $propertyNameList.select2("open");
                                } else {
                                    $propertyNameList.select2("close");
                                }
                                $propertyNameList.slideDown();
                            }
                        } else {
                            propViewModel.addPropertyNameList([]);
                            $propertyNameList.select2("close");
                            $propName.focus();
                        }
                    });
                }
                return "";
            },
            get addPropertyToList() {
                if(!isInit) {
                    const $addProp = jQuery("#addProperty");
                    const $propName = $addProp.find("#addPropertyName");
                    const key = $propName.val();
                    const $propVal = $addProp.find("#addPropertyValueTextArea");
                    $addProp.find("#addPropertyNameList").hide();
                    $addProp.find(".addBtn").attr("disabled", "disabled");
                    $addProp.find(".closeBtn").attr("disabled", "disabled");
                    _dataService.getValues(key).then(result => {
                        if(result[key]) {
                            $propName.css({ // OK color
                                "box-shadow": "0px 0px 4px 4px rgba(0, 255, 0, 1)"
                            });
                            _dataService.updateValues(key, $propVal.text(), () => {
                                setTimeout(() => {
                                    propViewModel.cancelAddProp;
                                }, 150);
                                refreshView(context, key, true);
                            });
                        } else {
                            $propName.val(`${key}: Unknown business key!`);
                            $propName.css({ // error color
                                "box-shadow": "0px 0px 4px 4px rgba(255, 0, 0, 1)"
                            });
                            setTimeout(() => {
                                propViewModel.cancelAddProp;
                            }, 2000);
                        }
                    });
                }
                return "";
            },
            get cancelAddProp() {
                if(!isInit) {
                    propViewModel.addPropertyNameList([]);
                    propViewModel.addPropertyName("");
                    const $addProp = jQuery("#addProperty");
                    const $propName = $addProp.find("#addPropertyName");
                    const $propVal = $addProp.find("#addPropertyValueTextArea");
                    const $propertyNameList = $addProp.find("#addPropertyNameList");
                    $addProp.find(".addBtn").removeAttr("disabled");
                    $addProp.find(".closeBtn").removeAttr("disabled");
                    $propName.val("");
                    $propVal.text("");
                    $propName.css({ // remove effect
                        "box-shadow": ""
                    });
                    $propName.off("keyup");
                    $propVal.off("focusin");
                    $addProp.find("#addPropertyNameList").hide();
                    $addProp.hide();
                }
                return "";
            },
            afterRendered: () => {
                let $options = jQuery("#propertiesSelectBox option");
                $options.each((index, option) => {
                    let $option = jQuery(option);
                    if(!$option.attr("value")) {
                        $option.attr("value", "EMPTY");
                    }
                });
            }
        };
        propViewModel.addPropertyNameFromList.subscribe(async newVal => {
            if(isKeyAvailable(newVal)) {
                const $addProp = jQuery("#addProperty");
                const $propVal = $addProp.find("#addPropertyValueTextArea");
                let result = await _dataService.getValues(newVal);
                if(result[newVal]) {
                    $propVal.text(result[newVal]);
                    $propVal.show();
                }
                if(propViewModel.addPropertyNameList().length === 1) {
                    propViewModel.addPropertyName(propViewModel.addPropertyNameFromList());
                }
            }
        });
        propViewModel.propValue = ko.computed(() => {
            return propViewModel.propertyData() ? propViewModel.propertyData().value : "";
        });

        const updater = e => {
            if(e.which === 13) { // 'ENTER' key
                let $key = jQuery("#select2-propertiesSelectBox-container");
                let key = $key.attr("title");
                let isTextBox = e.target.tagName === "PRE";
                let $target = isTextBox ? $textArea : $value;
                let parsedValue;
                let value = isTextBox ? $target.text() : $target.val();
                try {
                    if(value.startsWith("{") || value.startsWith("[")) {
                        parsedValue = JSON.parse(value);
                        value = JSON.stringify(parsedValue); // trim spaces
                    } else if(key && typeof key === "string" && key.indexOf("[A") !== -1) { // LISE?
                        value = value.replace(/\r?\n|\r/g, "_||_");
                    }
                    // a visible enter effect
                    $target.css({
                        "box-shadow": "0px 0px 4px 4px rgba(0, 255, 0, 1)"
                    });
                    // update property value: observable & business property
                    propViewModel.propertyData().value = value;
                    propViewModel.propertyData.valueHasMutated();
                    _dataService.updateValues(key, value, () => {
                        setTimeout(() => {
                            $target.css({ // remove effect
                                "box-shadow": ""
                            });
                            if(isTextBox) {
                                $target.hide();
                            }
                        }, 150);
                        refreshView(context, key, true);
                    });
                } catch(e) {
                    $target.css({ // error color
                        "box-shadow": "0px 0px 4px 4px rgba(255, 0, 0, 1)"
                    });
                }
                if(isTextBox) {
                    // do not let enter create a new line
                    e.preventDefault();
                }
            }
        };

        // -- UI --
        const $propertiesPanel = jQuery("#propertiesPanel");
        $propertiesPanel.find("button").button();
        ko.applyBindings(propViewModel, $propertiesPanel[0]);
        let $value = jQuery(PROPERTY_VALUE);
        $value.keypress(updater);
        let $textArea = jQuery(PROPERTY_VALUE_TEXT_AREA);
        $textArea.keypress(updater);
        jQuery(PROPERTIES_SELECTION_BOX_CLASS).select2();
        jQuery("#addPropertyNameList").select2({
            minimumResultsForSearch: Infinity // no search box
        });
        isInit = false;
    }

    // ------ Style types ------
    function initStyleTypes(context) {

        function switchTheme(typeDate) {
            // switch theme
            let $head = jQuery("head");
            let $links = $head.find("link");
            for(let i = 0; i < $links.length; i++) {
                let href = jQuery($links[i]).attr("href");
                if(href.indexOf("jquery-ui.structure.css") !== -1 || href.indexOf("jquery-ui.theme.css") !== -1 || href.indexOf("jquery-ui.css") !== -1) {
                    if(typeDate.lightTheme) {
                        href = href.indexOf("theme-light/") === -1 ? `theme-light/${href}` : `${href}`;
                    } else {
                        href = href.replace("theme-light/", "");
                    }
                    jQuery($links[i]).attr("href", href);
                }
            }
        }

        function getStyleType() {
            let type = localStorage.getItem("currentStyleType");
            if(type) {
                type = type.endsWith("/") ? type.substring(0, type.lastIndexOf("/")) : type;
            }
            return type || "";
        }

        const styleTypesViewModel = {
            styleTypes: ko.observableArray([]),
            checkedValue: ko.observable(),
            afterRendered: (option, item) => {
                ko.applyBindingsToNode(option, {disable: item.enabled === false}, item);
            },
            update: () => { // enables or disables items depending on current viewset
                // styleTypes section contains either some radio buttons or an option list
                let $styleTypeOptions = jQuery("#styleTypeOptions");
                let $options = [];
                if($styleTypeOptions.length) {
                    $options = $styleTypeOptions.find("option");
                    styleTypesViewModel.styleTypes.valueHasMutated();
                }
                context.controlPanelData.StyleTypes.forEach((item, i) => {
                    item.enabled = !item.viewSetSupport ||
                        (context.config.viewType === "softkey" && item.viewSetSupport === "softkey" || context.config.viewType === "touch" && !item.viewSetSupport);
                    if($moreOptionsPanelStyleTypes.length) { // radio buttons or...
                        let $type = $styleTypes.find(`#styleType_${item.folderName}`);
                        if($type.length) {
                            $type.checkboxradio(!item.enabled ? "disable" : "enable");
                            $moreOptionsPanelStyleTypes.checkboxradio("refresh");
                        }
                    } else if($options.length) { // ...options
                        styleTypesViewModel.afterRendered($options[i], item);
                    }
                });
            }
        };

        let type = getStyleType();
        let currentType;
        context.controlPanelData.StyleTypes.forEach(item => {
            if(context.config.viewType !== "softkey" && item.viewSetSupport === "softkey") {
                item.enabled = false;
            }
            styleTypesViewModel.styleTypes.push(item);
            if(item.folderName === type) {
                currentType = item; // note: we shouldn't set the styleTypesViewModel.checkedValue here cause of jQuery UI bad chars
                switchTheme(item);
            }
        });

        // UI
        const $styleTypes = jQuery("#styleTypes");
        ko.applyBindings(styleTypesViewModel, $styleTypes[0]);
        const $moreOptionsPanelStyleTypes = $styleTypes.find("input[type=radio]");

        styleTypesViewModel.checkedValue.subscribe(async newTypeData => {
            await context.content.StyleResourceResolver?.setType(newTypeData.folderName);
            jQuery("body").attr("data-style-type", getStyleType());
            switchTheme(newTypeData);
            $moreOptionsPanelStyleTypes.checkboxradio("refresh");
        });

        $moreOptionsPanelStyleTypes.checkboxradio();
        // prevent from jQuery UI bad chars
        if(currentType) {
            styleTypesViewModel.checkedValue(currentType); // set default
        }
    
        // disable not available types
        styleTypesViewModel.update();
        // Context
        context.styleTypesViewModel = styleTypesViewModel;
    }

    //------ LOG ------
    function initLogPanel(context) {
        const logPanelViewModel = {
            logMessage: _logMessage
        };
        ko.applyBindings(logPanelViewModel, jQuery("#logPanelMain")[0]);
    }

    // ------ Vendors ------
    function initVendors(context) {
        const vendorsViewModel = {
            vendors: ko.observableArray([]),
            checkedValue: ko.observable(),
            update: () => {
                $moreOptionsPanelVendors.checkboxradio(context.config.viewType !== "softkey" ? "disable" : "enable");
            }
        };
    
        let currentVendor;
        let vendor = context.config.STYLE_VENDOR;
        vendor = vendor && vendor.endsWith("/") ? vendor.substring(0, vendor.lastIndexOf("/")) : vendor;
        for(let i = 0; i < context.controlPanelData.Vendors.length; i++) {
            let item = context.controlPanelData.Vendors[i];
            vendorsViewModel.vendors.push(item);
            if(item.folderName === vendor) {
                currentVendor = vendor;
            }
        }
        const $vendors = jQuery("#vendors");
        ko.applyBindings(vendorsViewModel, $vendors[0]);
        const $moreOptionsPanelVendors = $vendors.find("input[type=radio]");
        vendorsViewModel.checkedValue.subscribe(async newValue => {
            await context.content.StyleResourceResolver?.setVendor(newValue);
            $moreOptionsPanelVendors.attr("checked", true).checkboxradio("refresh", true);
        });
        $moreOptionsPanelVendors.checkboxradio();
        // prevent from jQuery UI bad chars
        if(currentVendor) {
            vendorsViewModel.checkedValue(currentVendor); // set default
        }
        vendorsViewModel.update();
        jQuery("document").tooltip();
        
        // Context
        context.vendorsViewModel = vendorsViewModel;
    }

    // ------ Messages / popups ------
    async function initMessageAndPopup(context) {
        let data;
        try {
            data = await _configService.retrieveJSONData("../../content/config/designtimedata/basic/MessageData");
        } catch(e) {
            data = {message: "Fallback message."};
        }
        const $messageFuncs = jQuery("#escalationMessageFunctions");
        $messageFuncs.find("#messageDefault").click(() => {
            context.container?.sendViewModelEvent(context.container.EVENT_ON_MESSAGE_AVAILABLE, {messageText: data.message, messageLevel: LEVEL_INFO});
            installCloseMessage(context);
        });
        $messageFuncs.find("#messageWarning").click(() => {
            context.container?.sendViewModelEvent(context.container.EVENT_ON_MESSAGE_AVAILABLE, {messageText: data.message, messageLevel: LEVEL_WARNING});
            installCloseMessage(context);
        });
        $messageFuncs.find("#messageError").click(() => {
            context.container?.sendViewModelEvent(context.container.EVENT_ON_MESSAGE_AVAILABLE, {messageText: data.message, messageLevel: LEVEL_ERROR});
            installCloseMessage(context);
        });
        $messageFuncs.find("#closeMessage").click(() => {
            context.$parentDocument.find("#flexMessageContainerHeader").find("button").remove();
            context.container?.sendViewModelEvent(context.container.EVENT_ON_BEFORE_CLEAN);
        });
        $messageFuncs.find("button").button();


        // ------ Popups ------
        const $popupFuncs = jQuery("#popupFunctions");
        $popupFuncs.find("#showMessagePopup").click(() => {
            $popupFuncs.find("#showMessagePopup").button("disable");
            $popupFuncs.find("#showAmountPopup").button("disable");
            context.container?.getById("flexMain").showPopupMessage("messagepopup.component.html", {
                type: "POPUP",
                onCompositionComplete: () => {
                    context.container?.getById("popupMainContent").message(data.message);
                },
                onContinue: () => {
                    $popupFuncs.find("#showMessagePopup").button("enable");
                    $popupFuncs.find("#showAmountPopup").button("enable");
                }
            });
        });
        $popupFuncs.find("#showAmountPopup").click(() => {
            $popupFuncs.find("#showMessagePopup").button("disable");
            $popupFuncs.find("#showAmountPopup").button("disable");
            context.container?.getById("flexMain").showPopupMessage("amountentrypopup.component.html", {
                type: "AMOUNT_ENTRY_POPUP",
                config: {
                    "preValue": "",
                    "placeHolder": "45000",
                    "decimal": false,
                    "minAmount": 2000,
                    "maxAmount": 970000,
                    "multiplier": 100,
                    "formatOption": "#M",
                    "clearByCorrect": true,
                    "fromConfig": true
                },
                onContinue: () => {
                    $popupFuncs.find("#showMessagePopup").button("enable");
                    $popupFuncs.find("#showAmountPopup").button("enable");
                }
            });
        });
        $popupFuncs.find("#hidePopup").click(() => {
            context.container?.getById("flexMain").hidePopupMessage();
            $popupFuncs.find("#showMessagePopup").button("enable");
            $popupFuncs.find("#showAmountPopup").button("enable");
        });
        $popupFuncs.find("button").button();
    }

    // ------ Wait spinner ------
    function initWaitSpinner(context) {
        // if the wait spinner has been triggered manually we update the onclick event in order to simply add a close button
        const $waitSpinnerFuncs = jQuery("#waitSpinnerFunctions");
        $waitSpinnerFuncs.find("#showWaitSpinner").click(() => {
            const container = context.container;
            container.viewHelper.showWaitSpinner().then(() => {
                let $waitSpinner = context.$parentDocument.find("#waitSpinnerModalOverlay"); // element "waitSpinnerModalOverlay" is part of the body, not the view fragment
                if($waitSpinner.length) {
                    $waitSpinner.removeAttr("onclick");
                }
                if(!$waitSpinner.find("button").length) {
                    $waitSpinner.append(`<button id='closeSpinnerId' style='animation: lightSpeedIn 1s ease-in; margin: 2% 0 0 46%;' 
                         onclick="Wincor.UI.Content?.ViewModelContainer?.viewHelper.removeWaitSpinner(); jQuery(this).remove();">
                         Close spinner
                         </button>`
                    );
                }
            });
        });
        $waitSpinnerFuncs.find("#hideWaitSpinner").click(() => {
            context.container?.viewHelper.showWaitSpinner().then(() => {
                let $waitSpinner = context.$parentDocument.find("#waitSpinnerModalOverlay"); // element "waitSpinnerModalOverlay" is part of the body, not the view fragment
                // remove the close spinner button first to prevent from seeing it in a view with wait spinner
                $waitSpinner.find("button").remove();
                context.container?.viewHelper.removeWaitSpinner();
            });
        });
        $waitSpinnerFuncs.find("button").button();

        // Layer outline selection
        const moreOptionsViewModel = {
            layerOutlineSelection: ko.observable(false),
        };
        const $moreOptions = jQuery("#waitSpinnerAndLayerOutline");
        ko.applyBindings(moreOptionsViewModel, $moreOptions[0]);
        $moreOptions.find("input[type=checkbox]").checkboxradio();
        moreOptionsViewModel.layerOutlineSelection.subscribe(val => {
            context.$parentDocument.find("div#applicationHost *").css("outline", val ? "1px solid red" : "none");
        });
    }
    
    // ------ Animations ------
    function initAnimations(context) {
        // if the wait spinner has been triggered manually we update the onclick event in order to simply add a close button
        const $animFuncs = jQuery("#animationFunctions");
        $animFuncs.find("#stopAnimations").click(() => {
            $animFuncs.find("#stopAnimations").button("disable");
            $animFuncs.find("#startAnimations").button("enable");
            const container = context.container;
            container.viewHelper.stopAnimations();
            context.config.TRANSITION_ON = false;
            context.config.VIEW_ANIMATIONS_ON = false;
            context.config.BORDER_DRAWING_ON = false;
            context.config.FOOTER_ANIMATIONS_ON = false;
        });
        $animFuncs.find("#startAnimations").click(() => {
            $animFuncs.find("#stopAnimations").button("enable");
            $animFuncs.find("#startAnimations").button("disable");
            const container = context.container;
            context.config.TRANSITION_ON = true;
            context.config.VIEW_ANIMATIONS_ON = true;
            context.config.BORDER_DRAWING_ON = true;
            context.config.FOOTER_ANIMATIONS_ON = true;
            container.viewHelper.startAnimations();
        });
        $animFuncs.find("button").button();
    }
    
    // ------ Viewkey list ------
    function initViewKeyList(context, refresh = false) {
        let vkList = _viewService.viewContext.viewKeyList;
        let vkDataArray = [];
        let firstChr = null;
        let oldChr = null;
        context?.container?.viewModelHelper.sortByKey(vkList, "name");
        for(let i = 0; i < vkList.length; i++) {
            firstChr = vkList[i].name.charAt(0);
            if(oldChr !== null && firstChr !== oldChr) {
                vkDataArray.push({name: ""});
            }
            if(context.config.viewType === "touch" && vkList[i].name.indexOf("Ada") === -1) { // filter ADA stuff for touch
                vkDataArray.push(vkList[i]);
            } else if(context.config.viewType === "softkey") {
                vkDataArray.push(vkList[i]);
            }
            oldChr = firstChr;
        }

        if(!refresh) {
            const viewKeysViewModel = {
                vkList: ko.observableArray(vkDataArray),
                viewKeyValue: ko.observable({}), // gets a viewkey object
                afterRendered: () => {
                    let $options = jQuery("#viewKeysSelectBox option");
                    $options.each((index, option) => {
                        let $option = jQuery(option);
                        if(!$option.attr("value")) {
                            $option.attr("value", "EMPTY");
                        }
                    });
                },
                isStopViewKeyChecking: false,
                viewKeyCheckingStarted: ko.observable(false),
                checkViewKeys: async () => {
                    viewKeysViewModel.isStopViewKeyChecking = false;
                    viewKeysViewModel.viewKeyCheckingStarted(true);
                    console.time("checkAllViewKeys");
                    try {
                        await Wincor.UI.serializeProcessing(_viewService.viewContext.viewKeyList, async(entry, index) => {
                            if(viewKeysViewModel.isStopViewKeyChecking) {
                                throw "Stop execution";
                            } else {
                                await context.container?.whenActivated();
                                console.warn(`displaying viewkey ${index}: ${entry.name}`);
                                _viewService.display({viewKey: entry.name, viewURL: ""});
                                await context.container?.whenPrepared();
                                await context.container?.whenActivated().delay(200);
                            }
                        });
                    } catch(e) {
                        // pass
                    }
                    console.warn("Ready");
                    console.timeEnd("checkAllViewKeys");
                },
                stopCheckViewKeys: () => {
                    viewKeysViewModel.isStopViewKeyChecking = true;
                    setTimeout(() => {
                        viewKeysViewModel.viewKeyCheckingStarted(false);
                    }, 250);
                },
            };
            viewKeysViewModel.viewConfig = ko.computed(() => {
                return viewKeysViewModel.viewKeyValue() ? JSON.stringify(viewKeysViewModel.viewKeyValue().viewConfig) : "";
            });
            viewKeysViewModel.viewKeyValue.subscribe(mappedViewKeyData => {
                if(mappedViewKeyData && mappedViewKeyData.name) {
                    jQuery("#select2-viewKeysSelectBox-container").text(mappedViewKeyData.name);
                    // navigation should only be done if the user selects a viewkey from the viekeys tab of the control panel
                    if(!mappedViewKeyData.preventNavigation) {
                        if(context.container.designTimeRunner) {
                            context.container.designTimeRunner.navigateToRoute(mappedViewKeyData, mappedViewKeyData.url);
                        } else {
                            _viewService.display({viewKey: mappedViewKeyData.name, viewURL: mappedViewKeyData.url});
                        }
                    } else {
                        delete mappedViewKeyData.preventNavigation;
                    }
                }
            });
            let updater = e => {
                if(e.which === 13) { // 'ENTER' key
                    let isTextBox = e.target.tagName === "PRE";
                    let $target = isTextBox ? $textArea : $value;
                    try {
                        // update vk list
                        let viewConfig = JSON.parse($target.text());
                        for(let [index, data] of vkDataArray.entries()) {
                            if(_currentViewKey === data.name) {
                                data.url = viewConfig.url;
                                data.viewConfig = Object.assign(data.viewConfig, viewConfig);
                                break;
                            }
                        }
                        viewKeysViewModel.vkList(vkDataArray);
                        viewKeysViewModel.vkList.valueHasMutated();
                        viewKeysViewModel.viewKeyValue(Object.assign(_viewService.viewContext.viewConfig, viewConfig));
                        $target.css({
                            "box-shadow": "0px 0px 4px 4px rgba(0, 255, 0, 1)"
                        });
                    } catch(e) {
                        $target.css({
                            "box-shadow": "0px 0px 4px 4px rgba(255, 0, 0, 1)"
                        });
                    }
                    setTimeout(() => {
                        $target.css({
                            "box-shadow": ""
                        });
                        if(isTextBox) {
                            $target.hide();
                        }
                    }, 150);
                    if(isTextBox) {
                        // do not let enter create a new line
                        e.preventDefault();
                    }
                }
            };
    
            // -- UI --
            const $viewkeysPanel = jQuery("#viewKeysPanel");
            ko.applyBindings(viewKeysViewModel, $viewkeysPanel[0]);
            $viewkeysPanel.find("button").button();
            let $value = jQuery("#viewKeyValue");
            $value.keypress(updater);
            let $textArea = jQuery("#viewKeyValueTextArea");
            $textArea.keypress(updater);
            jQuery(".viewKeysSelectBoxBasicSingle").select2();
    
            // Context
            context.viewKeysViewModel = viewKeysViewModel;
        } else { // refresh
            let vm = ko.contextFor(jQuery("#viewKeysView")[0]).$data;
            vm.vkList(vkDataArray);
        }
    }

    // ------ Cash Infos / Cassettes and Hoppers ------
    async function initCassettesAndHoppers(context) {
        // cash infos
        const SOFT_LIMIT_NOTES = 0; // 0: use real counts always
        const SOFT_LIMIT_COINS = 0; // 0: use real counts always
        
        const CASH_PROPS = {
            "CURRENCY": "CCTAFW_PROP_CURRENCY",
            "CURRENCY_EXPONENT": "CCTAFW_PROP_CURRENCY_EXPONENT",
            "CURRENCY_SYMBOL": "CCTAFW_PROP_CURRENCY_SYMBOL",
            "COUTFAST_AMOUNT": "CCTAFW_PROP_COUTFAST_AMOUNT[1]",
            "COUTFAST_CURRENCY": "CCTAFW_PROP_COUTFAST_CURRENCY[1]",
            "NOTE_DISPENSE_AMOUNT": "CCTAFW_PROP_NOTE_DISPENSE_AMOUNT",
            "COIN_DISPENSE_AMOUNT": "CCTAFW_PROP_COIN_DISPENSE_AMOUNT",
            "DISPENSE_AMOUNT": "CCTAFW_PROP_DISPENSE_AMOUNT",
            "MIXTURE_DATA": "CCTAFW_PROP_MIXTURE_DISPLAY_DATA"
        };
        const CASH_PRESENT_VIEWKEYS = [
            "WithdrawalNotesAndReceiptPresentation",
            "WithdrawalCoinsAndReceiptPresentation",
            "WithdrawalNotesAndCoinsAndReceiptPresentation",
            "WithdrawalCoinsPartialCoinAndReceiptPresentation",
            "WithdrawalNotesAndPartialCoinsAndReceiptPresentation"
        ];

        const LOG_MESSAGES = {
            0: "Cashdispenser retract cassette limit exceeded!",
            1: "Level2 cassette limit exceeded!",
            2: "All box cassette limit exceeded!",
            3: "Retract cassette offline - mandatory for Cashdispenser & Recycler!",
            4: "At least one recycle cassette is offline!",
            5: "At least one hopper is offline!"
        };

        const cashInfosViewModel = {
            amount: ko.observable(),
            noteAmount: ko.observable(),
            coinAmount: ko.observable(),
            currency: ko.observable(),
            symbol: ko.observable(),
            exponent: ko.observable(),
            fastCashAmount: ko.observable(),
            fastCashCurrency: ko.observable(),
            maxNotes: ko.observable(),
            maxCoins: ko.observable(),
            mixtureData: "",
            setDefaultCurrency: async () => {
                cashInfosViewModel.currency(defaultCurrencyIso);
                cashInfosViewModel.symbol(defaultCurrencySymbol);
                await cashInfosViewModel.submit(false);
            },
            submit: async (forceRefreshView = true) => {
                await cashInfosViewModel.collectCashInfos(true);
                _eventService.onEvent({
                    FWName: EVENT_INFO.NAME,
                    FWEventID: EVENT_INFO.ID_CURRENCY_CHANGE,
                    FWEventParam: cashInfosViewModel.currency()
                });
                forceRefreshView && refreshView(context, void 0, true);
            },
            collectDenomInfos: (mixtureObj, useCassettes = true, useHopper = true) => {
                if(mixtureObj && mixtureObj.denominations) {
                    if(useCassettes) {
                        cassettes().forEach(item => {
                            let isFound = false;
                            mixtureObj.denominations.forEach(denom => {
                                if(item.cuInfo.value() === denom.val) {
                                    isFound = true;
                                    if(item.cuInfo.type() === "recycle" && item.cuInfo.state()) {
                                        denom.count = item.cuInfo.count();
                                        denom.softLimit = SOFT_LIMIT_NOTES; // overwrite softlimit
                                    } else { // deactivate denom
                                        denom.count = 0;
                                    }
                                }
                            });
                            if(!isFound && item.cuInfo.type() === "recycle" && item.cuInfo.state()) {
                                mixtureObj.denominations.push({type: 0, val: item.cuInfo.value(), count: item.cuInfo.count(), softLimit: SOFT_LIMIT_NOTES});
                            }
                        });
                    }
                    if(useHopper) {
                        if(parseInt(cashInfosViewModel.coinAmount()) > 0) {
                            hoppers().forEach(item => {
                                let isFound = false;
                                mixtureObj.denominations.forEach(denom => {
                                    if(item.cuInfo.value() === denom.val) {
                                        isFound = true;
                                        if(item.cuInfo.state()) {
                                            denom.count = item.cuInfo.count();
                                            denom.softLimit = SOFT_LIMIT_COINS; // overwrite softlimit
                                        } else { // deactivate denom
                                            denom.count = 0;
                                        }
                                    }
                                });
                                if(!isFound && item.cuInfo.state()) {
                                    mixtureObj.denominations.push({type: 1, val: item.cuInfo.value(), count: item.cuInfo.count(), softLimit: SOFT_LIMIT_COINS});
                                }
                            });
                        }
                    }
                }
            },
            collectCashInfos: async (submit) => {
                if(!submit) {
                    // retrieve amount value from property instead of the input box
                    let result = await _dataService.getValues([CASH_PROPS["DISPENSE_AMOUNT"], CASH_PROPS["COIN_DISPENSE_AMOUNT"]], null, null);
                    cashInfosViewModel.amount(result[CASH_PROPS["DISPENSE_AMOUNT"]]);
                    cashInfosViewModel.coinAmount(result[CASH_PROPS["COIN_DISPENSE_AMOUNT"]]);
                }
                // configure withdrawal mixture object
                const mixtureObj = JSON.parse(cashInfosViewModel.mixtureData);
                mixtureObj.amount = cashInfosViewModel.amount();
                mixtureObj.currency = cashInfosViewModel.currency();
                mixtureObj.symbol = cashInfosViewModel.symbol();
                mixtureObj.exponent = cashInfosViewModel.exponent();
                mixtureObj.maxnotes = cashInfosViewModel.maxNotes();
                mixtureObj.maxcoins = cashInfosViewModel.maxCoins();
                cashInfosViewModel.collectDenomInfos(mixtureObj);
                cashInfosViewModel.mixtureData = JSON.stringify(mixtureObj);
                await _dataService.setValues(Object.values(CASH_PROPS), [
                    cashInfosViewModel.currency(),
                    cashInfosViewModel.exponent(),
                    cashInfosViewModel.symbol(),
                    // need to set as real number
                    context.container.viewModelHelper?.convertByExponent(parseInt(cashInfosViewModel.fastCashAmount()), parseInt(cashInfosViewModel.exponent())).toString() ?? -2,
                    cashInfosViewModel.symbol(), // fastcashcurrency index 1 needs symbol
                    cashInfosViewModel.noteAmount(),
                    parseInt(cashInfosViewModel.coinAmount()) === 0 ? "" : cashInfosViewModel.coinAmount(), // we wanna' empty string instead of '0'
                    cashInfosViewModel.amount(),
                    cashInfosViewModel.mixtureData
                ], null);
            }
        };
        cashInfosViewModel.amount.subscribe(newAmount => {
            const e = parseInt(cashInfosViewModel.exponent());
            const a = parseInt(newAmount);
            let leastN = cashHelper.getLeastAvailableNoteDenom();
            const v = leastN ? leastN.cuInfo.value() : 1;
            cashInfosViewModel.noteAmount(a - (v > 1 ? a % v : a));
            cashInfosViewModel.coinAmount(v > 1 ? a % v : a);
            _dataService.setValues([CASH_PROPS["DISPENSE_AMOUNT"], CASH_PROPS["COIN_DISPENSE_AMOUNT"]],
                                   [a, parseInt(cashInfosViewModel.coinAmount()) === 0 ? "" : cashInfosViewModel.coinAmount()], null);
        });
        cashInfosViewModel.currency.subscribe(newCurrency => {
            if(context.depositInsertionItemsViewModel) {
                context.depositInsertionItemsViewModel.insertionItems().forEach(item => {
                    item.currency(newCurrency);
                });
            }
            if(context.depositInsertionChequesViewModel) {
                context.depositInsertionChequesViewModel.insertionCheques().forEach(item => {
                    item.currency(newCurrency);
                });
            }
        });

        ko.applyBindings(cashInfosViewModel, jQuery("#cashInfoSet")[0]);

        // Initialize: fill up with current values
        let result = await _dataService.getValues(Object.values(CASH_PROPS), null, null);
        cashInfosViewModel.noteAmount(result[CASH_PROPS["NOTE_DISPENSE_AMOUNT"]]);
        cashInfosViewModel.coinAmount(result[CASH_PROPS["COIN_DISPENSE_AMOUNT"]]);
        cashInfosViewModel.amount(result[CASH_PROPS["DISPENSE_AMOUNT"]]);
        cashInfosViewModel.currency(result[CASH_PROPS["CURRENCY"]]);
        cashInfosViewModel.symbol(result[CASH_PROPS["CURRENCY_SYMBOL"]]);
        cashInfosViewModel.exponent(result[CASH_PROPS["CURRENCY_EXPONENT"]]);
        // set defaults for restoring currency
        const defaultCurrencyIso = result[CASH_PROPS["CURRENCY"]];
        const defaultCurrencySymbol = result[CASH_PROPS["CURRENCY_SYMBOL"]];
        // need to convert as cent unit
        context.container.viewModelHelper && cashInfosViewModel.fastCashAmount(context.container.viewModelHelper.convertByExponent(parseInt(result[CASH_PROPS["COUTFAST_AMOUNT"]]),
            Math.abs(parseInt(cashInfosViewModel.exponent()))));
        cashInfosViewModel.fastCashCurrency(result[CASH_PROPS["COUTFAST_CURRENCY"]]);
        cashInfosViewModel.mixtureData = result[CASH_PROPS["MIXTURE_DATA"]];
        let mixtureObj = JSON.parse(cashInfosViewModel.mixtureData);
        cashInfosViewModel.maxNotes(mixtureObj.maxnotes);
        cashInfosViewModel.maxCoins(mixtureObj.maxcoins);
        // normalize
        await _dataService.setValues([CASH_PROPS["NOTE_DISPENSE_AMOUNT"], CASH_PROPS["COIN_DISPENSE_AMOUNT"], "CCTAFW_PROP_HIGH_AMOUNT_MINOR", "CCTAFW_PROP_LOW_AMOUNT_MINOR"], ["", "", "", ""], null); // because we run into unexpected flow
    
        const controlPanelDataModel = koMapping.fromJS(context.controlPanelData);

        // -- cassettes --
        const SPECIAL_CU_TYPES = ["recycle", "retract", "deposit", "level2", "level3", "all"];
        let cassettesViewModel = controlPanelDataModel.Cassettes;
        let cassettes = ko.observableArray();
        let keys = Object.keys(cassettesViewModel);
        let values = Object.values(cassettesViewModel);
        for(let i = 0; i < keys.length; i++) {
            cassettes.push({name: keys[i], cuInfo: values[i]});
        }
        cassettesViewModel.cassettes = cassettes;
        cassettesViewModel.submit = () => {
            let changes = cassettes();
            cashInfosViewModel.submit();
        };
        cassettesViewModel.cassettesState = true;
        cassettesViewModel.toggleState = () => {
            cassettesViewModel.cassettesState = !cassettesViewModel.cassettesState;
            cassettes().forEach(item => {
                item.cuInfo.state(cassettesViewModel.cassettesState);
            });
            context.devicesViewModel.cashUnitState(cassettesViewModel.cassettesState);
            context.devicesViewModel.depositUnitState(cassettesViewModel.cassettesState);
            // update selection lists of deposit insertion setup
            if(context.depositInsertionItemsViewModel) {
                context.depositInsertionItemsViewModel.updateLists();
            }
        };
        function checkLimit(count, limit) {
            if(limit === void 0) {
                return true;
            }
            if(typeof count === "function" && typeof limit === "function") {
                return parseInt(count()) < parseInt(limit());
            }
            return true;
        }
        cassettes().forEach(item => {
            item.cuInfo.state = ko.observable(true);
            item.cuInfo.toggleState = () => {
                item.cuInfo.state((SPECIAL_CU_TYPES.includes(item.cuInfo.type()) && !item.cuInfo.state()) || (item.cuInfo.count() > 0 && !item.cuInfo.state()));
                // state logic for cash & deposit unit
                let l2State = false;
                let allState = false;
                let retractState = false;
                let anyRecycleOnline = false;
                let limitExceeded = false;
                cassettes().forEach(item => {
                    if(item.cuInfo.type() === "recycle" && item.cuInfo.state() === true) {
                        anyRecycleOnline = true;
                    } else if(item.cuInfo.type() === "retract") {
                        limitExceeded = parseInt(item.cuInfo.count()) >= parseInt(item.cuInfo.limit());
                        item.cuInfo.state(!limitExceeded ? item.cuInfo.state() : false);
                        retractState = item.cuInfo.state() && !limitExceeded;
                    } else if(item.name.toLowerCase().indexOf("level2") !== -1) {
                        limitExceeded = parseInt(item.cuInfo.count()) >= parseInt(item.cuInfo.limit());
                        item.cuInfo.state(!limitExceeded ? item.cuInfo.state() : false);
                        l2State = item.cuInfo.state() && !limitExceeded;
                    } else if(item.name.toLowerCase().indexOf("all") !== -1) {
                        limitExceeded = parseInt(item.cuInfo.count()) >= parseInt(item.cuInfo.limit());
                        item.cuInfo.state(!limitExceeded ? item.cuInfo.state() : false);
                        allState = item.cuInfo.state() && !limitExceeded;
                    }
                });
                if(context.devicesViewModel) {
                    context.devicesViewModel.cashUnitState(retractState && anyRecycleOnline);
                    context.devicesViewModel.depositUnitState(retractState && anyRecycleOnline && l2State && allState);
                }
                // update selection lists of deposit insertion setup
                if(context.depositInsertionItemsViewModel) {
                    context.depositInsertionItemsViewModel.updateLists();
                }
            };
            item.cuInfo.online = ko.pureComputed(() => {
                let limitOK = checkLimit(item.cuInfo.count, item.cuInfo.limit);
                let stateA = SPECIAL_CU_TYPES.includes(item.cuInfo.type()) && item.cuInfo.state();
                let stateB = item.cuInfo.count() > 0 && item.cuInfo.state() && limitOK;
                if(item.cuInfo.type() === "retract") {
                    stateA = stateA && limitOK;
                    if(context.devicesViewModel) {
                        context.devicesViewModel.cashUnitState(stateA);
                        context.devicesViewModel.depositUnitState(stateA);
                        updateLogMessage(LOG_MESSAGES[0], context.devicesViewModel, limitOK);
                        updateLogMessage(LOG_MESSAGES[3], context.devicesViewModel, stateA);
                    }
                } else if(item.name.toLowerCase().indexOf("level2") !== -1) {
                    stateA = stateA && limitOK;
                    if(context.devicesViewModel) {
                        context.devicesViewModel.depositUnitState(stateA);
                        updateLogMessage(LOG_MESSAGES[1], context.devicesViewModel, limitOK);
                    }
                } else if(item.name.toLowerCase().indexOf("all") !== -1) {
                    stateA = stateA && limitOK;
                    if(context.devicesViewModel) {
                        context.devicesViewModel.depositUnitState(stateA);
                        updateLogMessage(LOG_MESSAGES[2], context.devicesViewModel, limitOK);
                    }
                } else if(item.cuInfo.type() === "recycle") {
                    let stateC = cassettes().every(cass => {
                        return cass.cuInfo.state();
                    });
                    updateLogMessage(LOG_MESSAGES[4], context.devicesViewModel, stateA && stateC);
                }
                return stateA || stateB;
            });

            // special units limit check


        });
        ko.applyBindings(cassettesViewModel, jQuery("#cassettes")[0]);

        // -- hoppers --
        let hopperViewModel = controlPanelDataModel.Hoppers;
        let hoppers = ko.observableArray();
        keys = Object.keys(hopperViewModel);
        values = Object.values(hopperViewModel);
        for(let i = 0; i < keys.length; i++) {
            hoppers.push({name: keys[i], cuInfo: values[i]});
        }
        hopperViewModel.hoppers = hoppers;
        hopperViewModel.submit = () => {
            let changes = cassettes();
            cashInfosViewModel.submit();
        };
        hopperViewModel.hopperState = true;
        hopperViewModel.toggleState = () => {
            hopperViewModel.hopperState = !hopperViewModel.hopperState;
            hoppers().forEach(item => {
                item.cuInfo.state(hopperViewModel.hopperState);
            });
            context.devicesViewModel.hopperUnitState(hopperViewModel.hopperState);
            // update selection lists of deposit insertion setup
            if(context.depositInsertionItemsViewModel) {
                context.depositInsertionItemsViewModel.updateLists();
            }
        };
        hoppers().forEach(item => {
            item.cuInfo.state = ko.observable(true);
            item.cuInfo.toggleState = () => {
                item.cuInfo.state(item.cuInfo.count() > 0 && !item.cuInfo.state());

                let anyHopperOnline = false;
                hoppers().forEach(item => {
                    if(item.cuInfo.state() === true) {
                        anyHopperOnline = true;
                    }
                });
                context.devicesViewModel.hopperUnitState(anyHopperOnline);
                // update selection lists of deposit insertion setup
                if(context.depositInsertionItemsViewModel) {
                    context.depositInsertionItemsViewModel.updateLists();
                }
            };

            item.cuInfo.online = ko.pureComputed(() => {
                let stateA = item.cuInfo.count() > 0 && item.cuInfo.state();
                let stateB = hoppers().every(hopper => {
                    return hopper.cuInfo.state();
                });
                updateLogMessage(LOG_MESSAGES[5], context.devicesViewModel, stateA && stateB);
                return stateA;
            });
            item.cuInfo.count.subscribe(newCount => {
                if(parseInt(newCount) < 0) {
                   item.cuInfo.count(0);
                } else if(parseInt(newCount) === 0) {
                   let anyHopperOnline = false;
                   hoppers().forEach(item => {
                       if(item.cuInfo.online() === true) {
                           anyHopperOnline = true;
                       }
                   });
                   context.devicesViewModel.hopperUnitState(anyHopperOnline);
                }
            });
        });
        ko.applyBindings(hopperViewModel, jQuery("#hoppers")[0]);

        // -- UI --
        const $cassettesAndHoppers = jQuery("#cashAndDepositContainer");
        $cassettesAndHoppers.accordion({
            heightStyle: "content"
        });
        $cassettesAndHoppers.find("button").button();
        $cassettesAndHoppers.find("input[type=checkbox]").checkboxradio();

        // -- context --
        context.cashInfosViewModel = cashInfosViewModel;
        context.cassettesViewModel = cassettesViewModel;
        context.hopperViewModel = hopperViewModel;

        // -- cassettes/hoppers update --
        _dataService.registerForServiceEvent(_dataService.SERVICE_EVENTS.DATA_CHANGED, data => {
            // NOTE: DON'T force a setValues here, because of cycling invocations otherwise!
            if(data.keys.includes("CCTAFW_PROP_CURRENCY")) {
                let idx = data.keys.indexOf("CCTAFW_PROP_CURRENCY");
                cassettes().forEach(item => {
                    item.cuInfo.currency(data.values[idx]);
                });
                hoppers().forEach(item => {
                    item.cuInfo.currency(data.values[idx]);
                });
            }
        }, true);
        _viewService.registerForServiceEvent(_viewService.SERVICE_EVENTS.VIEW_ACTIVATED, async () => {
            const viewKey = _viewService.viewContext.viewKey;
            if(CASH_PRESENT_VIEWKEYS.includes(viewKey)) {
                let result = await _dataService.getValues("CCTAFW_PROP_MIXTURE_DISPLAY_DATA", null, null);
                let mixture = JSON.parse(result["CCTAFW_PROP_MIXTURE_DISPLAY_DATA"]).denominations;
                cassettes().forEach(item => {
                    let count = parseInt(item.cuInfo.count());
                    let value = parseInt(item.cuInfo.value());
                    mixture.forEach(denom => {
                        if(parseInt(denom.val) === value) {
                            item.cuInfo.count(count - parseInt(denom.count));
                            if(item.cuInfo.count() <= 0) {
                                item.cuInfo.count(0);
                                item.cuInfo.state(SPECIAL_CU_TYPES.includes(item.cuInfo.type()));
                            }
                        }
                    });
                });
                hoppers().forEach(item => {
                    let count = parseInt(item.cuInfo.count());
                    let value = parseInt(item.cuInfo.value());
                    mixture.forEach(denom => {
                        if(parseInt(denom.val) === value) {
                            item.cuInfo.count(count - parseInt(denom.count));
                            if(item.cuInfo.count() <= 0) {
                                item.cuInfo.count(0);
                                item.cuInfo.state(SPECIAL_CU_TYPES.includes(item.cuInfo.type()));
                            }
                        }
                    });
                });
            }
        }, true);
    }

    // ------ Deposit infos ------
    async function initDepositInfos(context) {

        const SHUTTER_CONTROL_MAP = {
            "CCDM": "IMPLICIT",
            "CCDM2": "IMPLICIT",
            "RM2": "EXPLICIT",
            "RM3": "EXPLICIT",
            "RM4": "EXPLICIT",
            "CRS": "EXPLICIT",
            "DIEBCRM": "EXPLICIT",
            "DIEBNAM": "IMPLICIT",
            "DIEEBNA": "IMPLICIT",
            "DLRRECYCLER": "IMPLICIT",
            "GRG": "EXPLICIT",
            "KEBCRMNTR": "EXPLICIT",
            "NCR": "EXPLICIT",
            "NCRBNA1": "IMPLICIT",
            "NCRBNA2": "IMPLICIT",
            "NCRSDM": "IMPLICIT",
            "NCRBRM": "EXPLICIT",
            "SNA": "IMPLICIT",
            "nhyMV": "EXPLICIT",
            "UNKNOWN": "EXPLICIT"
        };

        const COIN_TYPE_MAP = {
            "CINCM4": "COINONLY",
            "CM3": "COINONLY",
            "CINCRA": "COINONLY",
            "CIN": "COINONLY"
        };

        const MAX_ITEMS_ON_STACKER_MAP = {
            "CCDM": "50",
            "CCDM2": "75",
            "RM2": "200",
            "RM3": "200",
            "RM4": "350",
            "CRS": "400",
            "DIEBCRM": "200",
            "DIEBNAM": "200",
            "DIEEBNA": "200",
            "DLRRECYCLER": "200",
            "GRG": "200",
            "KEBCRMNTR": "200",
            "NCR": "200",
            "NCRBNA1": "200",
            "NCRBNA2": "200",
            "NCRSDM": "200",
            "NCRBRM": "200",
            "SNA": "200",
            "nhyMV": "200",
            "UNKNOWN": ""
        };
    
        const PARALLEL_SCANNER_MAP = {
            "CCDM": true,
            "CCDM2": true,
            "SEAC": false
        };
    
        // -- deposit infos --
        const depositInfosViewModel = {
            depositNotesDeviceTypes: context.controlPanelData.DepositDeviceTypes,
            coinDeviceTypes: context.controlPanelData.CoinDeviceTypes,
            scannerTypes: context.controlPanelData.ScannerTypes,
            trayIOReasons: Object.values(context.controlPanelData.TrayIOReasons),
            currentNoteDeviceType: ko.observable(),
            currentCoinDeviceType: ko.observable(),
            currentScannerType: ko.observable(),
            currentTrayIOReason: ko.observable(),
            l3NotesCredited: ko.observable(false),
            chequesScanAndReadParallel: ko.observable(false),
            chequesScanAndReadParallelState: ko.observable(true),
            allowMixedMedia: ko.observable(false),
            MAX_ITEMS_ON_STACKER_MAP: MAX_ITEMS_ON_STACKER_MAP,
            PARALLEL_SCANNER_MAP: PARALLEL_SCANNER_MAP
        };

        depositInfosViewModel.allowMixedMedia.subscribe(newVal => {
            let maxHeightItems = newVal ? "130px" : "";
            let maxHeightCheques = newVal ? "140px" : "";
            $depositInfo.find("#depositInsertionContainer").css("max-height", maxHeightItems);
            $depositInfo.find("#depositChequesInsertionContainer").css("max-height", maxHeightCheques);
            if(newVal) {
                $depositInfo.find("#depositInsertion").show();
                $depositInfo.find("#depositChequesInsertion").show();
            } else {
                depositInsertionItemsViewModel.clear();
                depositInsertionChequesViewModel.clear();
                // $depositInfo.find("#depositInsertion").toggle("blind");
                // $depositInfo.find("#depositChequesInsertion").toggle("blind");
            }
            refreshView(context, null, true, "MenuSelection"); // MIXEDMEDIA viewstate is updated
        });

        // -- deposit insertion items --
        const depositInsertionItemsViewModel = {
            insertionItems: ko.observableArray()
        };

        function initNotesList() {
            let values = context.cassettesViewModel.cassettes()
                .map(item => {
                    return item.cuInfo.type() === "recycle" && item.cuInfo.state() ? item.cuInfo.value() : void 0;
                })
                .filter(item => {
                    return item !== void 0;
                });
            if(values.length === 0) {
                values[0] = "No units available!";
            }
            return values;
        }
        function initCoinsList() {
            let values = context.hopperViewModel.hoppers()
                .map(item => {
                    return item.cuInfo.type() === "cash" && item.cuInfo.state() ? item.cuInfo.value() : void 0;
                })
                .filter(item => {
                    return item !== void 0;
                });
            if(values.length === 0) {
                values[0] = "No units available!";
            }
            return values;
        }
    
        depositInsertionItemsViewModel.addItem = () => {
            if(context.devicesViewModel.depositUnitOnline()) {
                let denom = {
                    value: ko.observable(0),
                    count: ko.observable(1),
                    currency: ko.observable(context.cashInfosViewModel.currency()),
                    values: ko.observableArray(initNotesList()),
                    types: ["note", "coin"],
                    levels: [1, 2, 3, 4],
                    type: ko.observable(0),
                    level: ko.observable(4),
                    decCount: item => {
                        if(parseInt(item.count()) > 0) {
                            item.count(parseInt(item.count()) - 1);
                        }
                    },
                    incCount: item => {
                        item.count(parseInt(item.count()) + 1);
                    },
                    removeItem: item => {
                        depositInsertionItemsViewModel.insertionItems.remove(item);
                        // reshow cheques
                        if(!depositInfosViewModel.allowMixedMedia() && depositInsertionItemsViewModel.insertionItems().length === 0) {
                            $depositInfo.find("#depositChequesInsertion").toggle("blind");
                        }
                    }
                };
                // update values due to type change
                denom.type.subscribe(newType => {
                    if(newType === "coin") {
                        denom.values(initCoinsList());
                    } else { // 'note'
                        denom.values(initNotesList());
                    }
                });
                depositInsertionItemsViewModel.insertionItems.push(denom);
                $depositInfo.find("#depositInsertion").find("button").button();
                // hide deposit cheques
                if(!depositInfosViewModel.allowMixedMedia() && depositInsertionItemsViewModel.insertionItems().length === 1) {
                    $depositInfo.find("#depositChequesInsertion").toggle("blind");
                }
            }
        };
    
        depositInsertionItemsViewModel.updateLists = () => {
            depositInsertionItemsViewModel.insertionItems().forEach(denom => {
                if(denom.type() === "note") {
                    denom.values(initNotesList());
                } else if(denom.type() === "coin") {
                    denom.values(initCoinsList());
                }
                if(denom.values().length === 0) {
                    denom.values(["No units available!"]);
                }
            });
            // remove items whom values aren't online anymore
            for(let i = 0; i < depositInsertionItemsViewModel.insertionItems().length; i++) {
                let denom = depositInsertionItemsViewModel.insertionItems()[i];
                if(denom.values()[0] === "No units available!") {
                    denom.removeItem(denom);
                }
            }
        };

        depositInsertionItemsViewModel.clear = () => {
            depositInsertionItemsViewModel.insertionItems.removeAll();
        };

        // build structure for  CCCAINTAFW_PROP_JSON_RESULT
        depositInsertionItemsViewModel.submit = async () => {
            const DEP_RES = {
                // marker flag that user sets this property rather than any flow action (MenuSelection) might to write it over again in the case
                // the user set this data before he comes into MenuSelection
                setByUser: true,
                totals: [{
                    total: 0,
                    L2: 0,
                    L3: 0,
                    L4: 0,
                    exp: context.cashInfosViewModel.exponent(),
                    currency: context.cashInfosViewModel.currency()
                }],
                denominations: []
            };
            depositInsertionItemsViewModel.insertionItems().forEach(item => {
                // some checks
                let isOk = jQuery.isNumeric(item.value()) && parseInt(item.value()) > 0;
                if(isOk) {
                    isOk = jQuery.isNumeric(item.count()) && parseInt(item.count()) > 0;
                }
                if(isOk) {
                    let denom = DEP_RES.denominations.find(denom => {
                        return denom.value === item.value();
                    });
                    if(!denom) { // add or
                        DEP_RES.denominations.push({
                            value: item.value(),
                            count: item.count(),
                            currency: item.currency(),
                            exp: context.cashInfosViewModel.exponent(),
                            type: item.type() === "note" ? 0 : 1,
                            level: item.level()
                        });
                    } else { // update
                        denom.count += parseInt(item.count());
                    }
                    if(item.level() === 3 || item.level() === 4) {
                        DEP_RES.totals[0].total += parseInt(item.value()) * parseInt(item.count());
                        if(item.level() === 3) {
                            DEP_RES.totals[0].L3 += parseInt(item.value()) * parseInt(item.count());
                        } else if(item.level() === 4) {
                            DEP_RES.totals[0].L4 += parseInt(item.value()) * parseInt(item.count());
                        }
                    } else if(item.level() === 2) {
                        DEP_RES.totals[0].L2 += parseInt(item.value()) * parseInt(item.count());
                    }
                }
            });
            if(!DEP_RES.denominations.length) {
                DEP_RES.setByUser = false;
            }
            // we have to format the value for the 'CCCAINTAFW_PROP_DISP_L2_AMOUNTS' manually as the real business logic does as well
            DEP_RES.totals[0].L2 = DEP_RES.totals[0].L2 === 0 ? "" : DEP_RES.totals[0].L2;
            let l2Val = await _formatService.format(DEP_RES.totals[0].L2, "#C", null);
            // l2Val.result maybe empty string in the case no L2 amount available, but won't be used then by the deposit result view model
            await _dataService.setValues(
                ["CCCAINTAFW_PROP_JSON_RESULT", "CCCAINTAFW_PROP_DISP_L2_AMOUNTS", "CCCAINTAFW_PROP_TRANSACTION_DATA_SUM_MINOR"],
                [JSON.stringify(DEP_RES), l2Val.result, DEP_RES.totals[0].L4 + DEP_RES.totals[0].L3], null);
                refreshView(context, null, true, "DepositResult");
        };

        // -- deposit insertion cheques --
        const QUALITY_GOOD = "Good";
        const QUALITY_BAD = "Bad";
        const SCORE_MAP = {};
        SCORE_MAP[QUALITY_GOOD] = "TRUE";
        SCORE_MAP[QUALITY_BAD] = "FALSE";
        const MARK_MAP = {
            Accepted: "TRUE",
            Declined: "FALSE",
            Open: "FALSE"
        };
        const depositInsertionChequesViewModel = {
            insertionCheques: ko.observableArray()
        };

        depositInsertionChequesViewModel.addCheque = () => {
            if(context.devicesViewModel.depositChequesUnitOnline()) {
                let cheque = {
                    amount: ko.observable(1000 + depositInsertionChequesViewModel.insertionCheques().length * 10), // a dynamic value for handy panel user;-)
                    currency: ko.observable(context.cashInfosViewModel.currency()),
                    markAs: ["Declined", "Accepted"],
                    markedWith: ko.observable("Accepted"),
                    scoreMicrCodes: [QUALITY_GOOD, QUALITY_BAD],
                    scoreOcrCodes: [QUALITY_GOOD, QUALITY_BAD],
                    scoreMicr: ko.observable(QUALITY_GOOD),
                    scoreOcr: ko.observable(QUALITY_GOOD),
                    removeCheque: cheque => {
                        depositInsertionChequesViewModel.insertionCheques.remove(cheque);
                        // reshow deposit items
                        if(!depositInfosViewModel.allowMixedMedia() && depositInsertionChequesViewModel.insertionCheques().length === 0) {
                            $depositInfo.find("#depositInsertion").toggle("blind");
                        }
                    }
                };
                cheque.scoreMicr.subscribe(newScore => {
                    if(newScore === QUALITY_BAD && cheque.scoreOcr() === QUALITY_BAD) {
                        cheque.markedWith("Declined");
                    }
                });
                cheque.scoreOcr.subscribe(newScore => {
                    if(newScore === QUALITY_BAD && cheque.scoreMicr() === QUALITY_BAD) {
                        cheque.markedWith("Declined");
                    }
                });
                depositInsertionChequesViewModel.insertionCheques.push(cheque);
                $depositInfo.find("#depositChequesInsertion").find("button").button();
                // hide deposit items
                if(!depositInfosViewModel.allowMixedMedia() && depositInsertionChequesViewModel.insertionCheques().length === 1) {
                    $depositInfo.find("#depositInsertion").toggle("blind");
                }
            }
        };

        depositInsertionChequesViewModel.clear = () => {
            depositInsertionChequesViewModel.insertionCheques.removeAll();
        };

        depositInsertionChequesViewModel.submit = async () => {
            let keys = ["CCCHCCDMTAFW_MEDIAONSTACKER"];
            let values = [depositInsertionChequesViewModel.insertionCheques().length];
            let sum = 0;
            let acceptedCount = 0;
            let declinedCount = 0;
            depositInsertionChequesViewModel.insertionCheques().forEach((cheque, idx) => {
                keys.push(`CCCHCCDMTAFW_FRONTIMAGE_FILE[${idx}]`);
                keys.push(`CCCHCCDMTAFW_BACKIMAGE_FILE[${idx}]`);
                keys.push(`CCCHCCDMTAFW_AMOUNT[${idx}]`);
                keys.push(`CCCHCCDMTAFW_CHEQUE_ACCEPTED[${idx}]`);
                keys.push(`CCCHCCDMTAFW_SCORE_MICR[${idx}]`);
                keys.push(`CCCHCCDMTAFW_SCORE_OCR[${idx}]`);

                values.push(`style/default/images/single_cheque_generic_long_side.svg`);
                values.push(`style/default/images/single_cheque_generic_long_side_back.svg`);
                values.push(`${cheque.amount()}`);
                values.push(`${MARK_MAP[cheque.markedWith()]}`);
                values.push(`${SCORE_MAP[cheque.scoreMicr()]}`);
                values.push(`${SCORE_MAP[cheque.scoreOcr()]}`);
                sum += cheque.amount();
                if(cheque.markedWith() === "Accepted") {
                    acceptedCount++;
                } else {
                    declinedCount++;
                }
            });
            // cheques sum
            keys.push("CCCHCCDMTAFW_SUM");
            values.push(sum);
            // cheques sum as transaction amount
            keys.push("CCTAFW_PROP_TRANSACTION_AMOUNT");
            values.push(sum);
            // accepted / declined cheques
            keys.push("CCCHCCDMTAFW_MEDIAONSTACKER_ACCEPTED");
            values.push(acceptedCount);
            keys.push("CCCHCCDMTAFW_MEDIAONSTACKER_DECLINED");
            values.push(declinedCount);

            await _dataService.setValues(keys, values, null);
            refreshView(context, null, true, "DepositChequesResult");
        };

        // normalize / enhance
        await _dataService.setValues(["CCCAINTAFW_PROP_ROLLBACK_L2_AMOUNTS", "CCCAINTAFW_PROP_ROLLBACK_L3_AMOUNTS"], ["", ""], null);


        // -- context --
        context.depositInfosViewModel = depositInfosViewModel;
        context.depositInsertionItemsViewModel = depositInsertionItemsViewModel;
        context.depositInsertionChequesViewModel = depositInsertionChequesViewModel;

        // Notes: viewkey DepositNotesRemovalIOMetal triggern
        // Notes bei foreign object DepositNotesRemovalIO

        // CCCAINTAFW_PROP_WXTEXT_KEY_INSERT_MORE_MONEY: 0, 1 or 2
        // CCCAINTAFW_PROP_ROLLBACK_L2_AMOUNTS: "2000 EUR"
        // CCCAINTAFW_PROP_ROLLBACK_L3_AMOUNTS: "1000 EUR"
        // CCCAINTAFW_PROP_UMPTEEN_BUNDLES
        // CCCAINTAFW_PROP_UMPTEEN_COINS
        // CCCHCCDMTAFW_AMOUNT
        //VAR_MIXED_MONEY: NOTES, COINS, MIXED
        //CCCAINTAFW_PROP_COININ_DEVICE_TYPE

        // Deposit Events 10013:

        /*
           "RETRACTMONEY"
           "SHOWHOURGLASSNOTEXT"
           "SHOWHOURGLASS"
        * */

        /* Notes + mixed(cheques) deposit Events 10013:
            "NONOTES"
            "ERRORNOTES"
            "NOTESPRESENTED"
            "NOTESINSERTED"
            "TRAYNOTEMPTY"
            "TRAYISEMPTY"
            "TOOMANYNOTES"
            "ROLLBACKL2"
            "ROLLBACKL3"
            "ROLLBACKL2L3"
            "ROLLBACKL2NOCREDIT"
            "ROLLBACKL3NOCREDIT"
            "ROLLBACKL2L3NOCREDIT"
        * */

        // Coin Events 10013:
        /* "COINSDEVICEFULL"
           "COINSSTACKERFULL"
           "COINSFINISHED"
           "COINSIDLETIMEOUT"
           "COINSINSERTED"
           "COINSOUTPUTFOMA"
           "COINSREFUSED"
           "COINSSHUTTEROPEN"
           "COINSSUBCASHIN"
           "COINSDEPOSITEDINSTEADROLLBACK"
           "COINSINSERTED_"
           "COINSPRESENTED"
        */

        /*
        Cheques Events 10013

        "MEDIATAKEN"
        "CHEQUES_PRESENTED"
        "CHEQUES_TAKEN"
        * */

        // -- UI --
        const $depositInfo = jQuery("#depositInfo");
        ko.applyBindings(depositInsertionItemsViewModel, $depositInfo.find("#depositInsertion")[0]);
        ko.applyBindings(depositInsertionChequesViewModel, $depositInfo.find("#depositChequesInsertion")[0]);

        let result = await _dataService.getValues(["CCCAINTAFW_PROP_CASHIN_DEVICE_TYPE", "CCCAINTAFW_PROP_COININ_DEVICE_TYPE", "CCCHCCDMTAFW_SCANNER_TYPE", "CCCAINTAFW_PROP_PRESENT_INPUT_REASON"], null, null);
        depositInfosViewModel.currentNoteDeviceType(result["CCCAINTAFW_PROP_CASHIN_DEVICE_TYPE"]);
        depositInfosViewModel.currentCoinDeviceType(result["CCCAINTAFW_PROP_COININ_DEVICE_TYPE"]);
        depositInfosViewModel.currentScannerType(result["CCCHCCDMTAFW_SCANNER_TYPE"]);
        depositInfosViewModel.currentTrayIOReason(result["CCCAINTAFW_PROP_PRESENT_INPUT_REASON"]);
        ko.applyBindings(depositInfosViewModel, $depositInfo.find("#depositInfoSet")[0]);

        // set max notes on stacker based on current device type
        await _dataService.setValues(["CCTAFW_PROP_REMAINING_NOTES_ON_STACKER"], [MAX_ITEMS_ON_STACKER_MAP[depositInfosViewModel.currentNoteDeviceType()]], null);

        // $depositInfo.find("#depositNotesDeviceTypes").selectmenu(); // <- activating this makes UI more theme like, but prevents from regular ko handling
        depositInfosViewModel.currentNoteDeviceType.subscribe(value => {
            // force update for max items of icon
            if(_currentViewId === "depositanimations" &&  context.container?.getById("flexMain").maxItems) {
                context.container?.getById("flexMain").maxItems(MAX_ITEMS_ON_STACKER_MAP[value]);
                context.container?.viewHelper.forceElementsRedraw("object")
            }
            _dataService.setValues(
                ["CCCAINTAFW_PROP_CASHIN_DEVICE_TYPE", "CCCAINTAFW_PROP_DEVICE_CONTROL", "CCTAFW_PROP_REMAINING_NOTES_ON_STACKER"],
                [value, SHUTTER_CONTROL_MAP[value], MAX_ITEMS_ON_STACKER_MAP[value]], null)
                .then(() => {
                    return cashHelper.updateDepositCommandStates(null, "0");
                })
                .then(() => {
                    refreshView(context);
                });
        });
        // Scanner device  type
        depositInfosViewModel.currentScannerType.subscribe(async value => {
            depositInfosViewModel.chequesScanAndReadParallelState(PARALLEL_SCANNER_MAP[value]);
            if(depositInfosViewModel.chequesScanAndReadParallel() && !PARALLEL_SCANNER_MAP[value]) {
                depositInfosViewModel.chequesScanAndReadParallel(false);
            }
            $depositInfo.find("input[type=checkbox]").checkboxradio("refresh");
            await _dataService.setValues(["CCCHCCDMTAFW_SCANNER_TYPE", "CCCHCCDMTAFW_CHEQUE_PARALLELIZATION"], [value, PARALLEL_SCANNER_MAP[value] ? "1": "0"], null);
            refreshView(context);
        });
        // IO device tray
        depositInfosViewModel.currentTrayIOReason.subscribe(value => {
            depositInfosViewModel.trayIOReasons.forEach(async (item, idx) => {
                if(item === value) {
                    await _dataService.setValues(["CCCAINTAFW_PROP_PRESENT_INPUT_REASON", "CCCHCCDMTAFW_METAL_DETECTED_STR"], [idx.toString(), idx === 3 ? "Metal_" : "null"], null);
                    refreshView(context);
                }
            });
        });
        // Coin device type
        depositInfosViewModel.currentCoinDeviceType.subscribe(async value => {
            await _dataService.setValues(["CCCAINTAFW_PROP_COININ_DEVICE_TYPE"], [value], null);
            refreshView(context);
        });
    }

    // ------ Devices ------
    function initDevices(context) {
        const CASH_NOTES_VIEWSTATE_PROPS = {
            "COUT": "VAR_COUT_VIEWSTATE_S",
            "COUTMIXED": "VAR_COUTMIXED_VIEWSTATE_S",
            "COUTFAST": "VAR_COUTFAST_VIEWSTATE_S",
            "COUT_PRESTAGED": "VAR_COUT_PRESTAGED_VIEWSTATE_S",
            "VOUCHER": "VAR_VOUCHER_VIEWSTATE_S"
        };
        const CASH_COINS_VIEWSTATE_PROPS = {
            "COINOUT": "VAR_COINOUT_VIEWSTATE_S",
            "COUTMIXED": "VAR_COUTMIXED_VIEWSTATE_S"
        };
        const DEPOSIT_VIEWSTATE_PROPS = {
            "CIN": "VAR_CIN_VIEWSTATE_S",
            "COIN": "VAR_COININ_VIEWSTATE_S",
            "CINMIXED": "VAR_CINMIXED_VIEWSTATE_S",
            "MIXEDMEDIA": "VAR_MIXEDMEDIA_VIEWSTATE_S"
        };
        const DEPOSIT_CHEQUES_VIEWSTATE_PROPS = {
            "CHCCDM": "VAR_CHCCDM_VIEWSTATE_S",
            "CHEQUE_DETAILS": "VAR_CHEQUE_DETAILS_VIEWSTATE_S",
            "CHQCASH": "VAR_CHQCASH_VIEWSTATE_S",
            "ORDCHQ": "VAR_ORDCHQ_VIEWSTATE_S",
            "MIXEDMEDIA": "VAR_MIXEDMEDIA_VIEWSTATE_S"
        };
        const PRINTER_VIEWSTATE_PROPS = {
            "PRINTER": "VAR_PRINTER_VIEWSTATE_S",
            "STP": "VAR_STP_VIEWSTATE_S",
            "STPM": "VAR_STPM_VIEWSTATE_S",
            "AIN": "VAR_AIN_VIEWSTATE_S"
        };

        const LOG_MESSAGES = {
            0: "Cardreader retract bin limit exceeded: Please edit 'Retract-No' field to a value below limit",
            1: "Contactless reader offline",
            2: "Cashdispenser offline",
            3: "Hoppers offline",
            4: "Recycler offline",
            5: "Cheque scanner offline",
            6: "Printer offline - no paper",
            7: "Magstripe reader offline",
        };

        const devicesViewModel = {
            cardReaderMagstripeAndContactless: ko.pureComputed(() => {
                let msInst = devicesViewModel.cardReaderInstalled();
                let clInst = devicesViewModel.contactlessReaderInstalled();
                let cardReader = "";
                let inst = "1";
                let inst100 = "1";
                
                if(!msInst && clInst) {
                    cardReader = "3";
                    inst = "0";
                } else if(msInst && !clInst) {
                    cardReader = "0";
                    inst100 = "0";
                } else if(!msInst && !clInst) {
                    if(_currentViewKey === "IdleLoopPresentation") {
                        cardReader = "0";
                        inst = "0";
                        inst100 = "0";
                    } else if(_currentViewKey === "CardInsertion") {
                        cardReader = "03";
                    }
                }
                _dataService.setValues(["CCTAFW_PROP_CARD_READER", "CCTAFW_PROP_IDCU_INSTALLED", "CCTAFW_PROP_IDCU_INSTALLED[100]"], [cardReader, inst, inst100], null);
            }),
            
            cardReaderUnitState: ko.observable(true),
            cardReaderMandatory: ko.observable(false),
            cardReaderInstalled: ko.observable(false),
            cardReaderRetractNo: ko.observable(0),
            
            contactlessReaderUnitState: ko.observable(true),
            contactlessReaderMandatory: ko.observable(false),
            contactlessReaderInstalled: ko.observable(false),
            
            cashUnitState: ko.observable(true),
            cashUnitMandatory: ko.observable(false),
            cashUnitInstalled: ko.observable(true),
            
            hopperUnitState: ko.observable(true),
            hopperUnitMandatory: ko.observable(false),
            hopperUnitInstalled: ko.observable(true),
            
            depositUnitState: ko.observable(true),
            depositUnitMandatory: ko.observable(false),
            depositUnitInstalled: ko.observable(false),
            depositChequesUnitState: ko.observable(true),
            
            chequesUnitState: ko.observable(true),
            chequesUnitMandatory: ko.observable(false),
            chequesUnitInstalled: ko.observable(true),
            
            printerUnitState: ko.observable(true),
            printerUnitMandatory: ko.observable(false),
            printerUnitInstalled: ko.observable(true),
    
            logMessages: [], // to avoid cycling computed updates
            logMessagesObservable: ko.observableArray()
        };

        function unitStateChanged(state, isMandatory) {
            if(isMandatory && !state && _currentViewKey !== "OutOfServiceInfo") {
                _viewService.display({viewKey: "OutOfServiceInfo", viewURL: ""});
            } else if(state && _currentViewKey === "OutOfServiceInfo") {
                _viewService.display({viewKey: "IdleLoopPresentation", viewURL: ""});
            } else {
                refreshView(context, null, true);
            }
        }

        // card reader
        devicesViewModel.toggleStateCardReaderUnit = () => {
            let state = !devicesViewModel.cardReaderUnitState();
            if(parseInt(devicesViewModel.cardReaderRetractNo()) >= context.controlPanelData.CardReaderInfo.retractLimit) {
                state = false;
            }
            devicesViewModel.cardReaderUnitState(state);
        };
        devicesViewModel.cardReaderUnitOnline = ko.computed(async () => {
            let state = devicesViewModel.cardReaderUnitState() && devicesViewModel.cardReaderInstalled();
            if(parseInt(devicesViewModel.cardReaderRetractNo()) >= context.controlPanelData.CardReaderInfo.retractLimit) {
                state = false;
                addLogMessage(LOG_MESSAGES[0], devicesViewModel);
            } else {
                removeLogMessage(LOG_MESSAGES[0], devicesViewModel);
            }
            await _dataService.setValues(["CCTAFW_PROP_IDCU_TYPE"], [state ? "0" : "-1"]);
            if(_currentViewKey === "CardInsertion") {
                await _dataService.setValues(["CCTAFW_PROP_CARD_READER"], [state ? "" : "03"]);
            }
    
            unitStateChanged(state, devicesViewModel.cardReaderMandatory());
            updateLogMessage(LOG_MESSAGES[7], devicesViewModel, state);
            return state;
        });
        devicesViewModel.cardReaderRetractNo.subscribe(async val => {
            await _dataService.setValues(["CCCAINTAFW_PROP_NUMBER_OF_RETRACTS"], [val]);
        });
        devicesViewModel.cardReaderInstalled.subscribe(val => {
            devicesViewModel.cardReaderMagstripeAndContactless();
        });
    
    
        // contactless reader
        devicesViewModel.toggleStateContactlessReaderUnit = () => {
            let state = !devicesViewModel.contactlessReaderUnitState();
            devicesViewModel.contactlessReaderUnitState(state);
        };
        devicesViewModel.contactlessReaderUnitOnline = ko.computed(async () => {
            let state = devicesViewModel.contactlessReaderUnitState() && devicesViewModel.contactlessReaderInstalled();
            await _dataService.setValues(["CCTAFW_PROP_IDCU_TYPE[100]"], [state ? "3" : "-1"]);
            if(_currentViewKey === "CardInsertion") {
                await _dataService.setValues(["CCTAFW_PROP_CARD_READER"], [state ? "" : "03"]);
            }
    
            unitStateChanged(state, devicesViewModel.contactlessReaderMandatory());
            updateLogMessage(LOG_MESSAGES[1], devicesViewModel, state);
            return state;
        });
        devicesViewModel.contactlessReaderInstalled.subscribe(val => {
            devicesViewModel.cardReaderMagstripeAndContactless();
        });
    
        // cash unit
        devicesViewModel.toggleStateCashUnit = () => {
            let state = !devicesViewModel.cashUnitState();
            devicesViewModel.cashUnitState(state);
            context.cassettesViewModel.cassettesState = state;
            context.cassettesViewModel.cassettes().forEach(item => {
                // we ensure that toggling from here will clear limit counter so that we force online rather than being offline
                if(item.cuInfo.type() === "retract") {
                    item.cuInfo.count(0);
                }
                if(item.cuInfo.type() !== "deposit") {
                    item.cuInfo.state(state);
                }
            });
        };
        devicesViewModel.cashUnitOnline = ko.pureComputed(() => {
            let state = devicesViewModel.cashUnitState();
            _dataService.setValues(Object.values(CASH_NOTES_VIEWSTATE_PROPS), [
                state ? "0" : "2",
                state ? "0" : "2",
                state ? "0" : "2",
                state ? "0" : "2",
                state ? "0" : "2"
            ], null);
            unitStateChanged(state, devicesViewModel.cashUnitMandatory());
            updateLogMessage(LOG_MESSAGES[2], devicesViewModel, state);
            return state;
        });

        // hopper unit
        devicesViewModel.toggleStateHopperUnit = () => {
            let state = !devicesViewModel.hopperUnitState();
            devicesViewModel.hopperUnitState(state);
            context.hopperViewModel.hopperState = state;
            context.hopperViewModel.hoppers().forEach(item => {
                item.cuInfo.state(state);
            });
        };
        devicesViewModel.hopperUnitOnline = ko.pureComputed(async () => {
            let state = devicesViewModel.hopperUnitState();
            await _dataService.setValues(Object.values(CASH_COINS_VIEWSTATE_PROPS), [
                state ? "0" : "2",
                state ? "0" : "2"
            ], null);
            unitStateChanged(state, devicesViewModel.hopperUnitMandatory());
            updateLogMessage(LOG_MESSAGES[3], devicesViewModel, state);
            return state;
        });

        // deposit unit
        devicesViewModel.toggleStateDepositUnit = () => {
            let state = !devicesViewModel.depositUnitState();
            devicesViewModel.depositUnitState(state);
            context.cassettesViewModel.cassettes().forEach(item => {
                // we ensure that toggling from here will clear limit counter so that we force online rather than being offline
                if(item.name.toLowerCase().indexOf("level2") !== -1 || item.name.toLowerCase().indexOf("all") !== -1 || item.cuInfo.type() === "retract") {
                    item.cuInfo.count(0);
                }
                if(item.cuInfo.type() === "deposit") {
                    item.cuInfo.state(state);
                }
            });
        };
        devicesViewModel.depositUnitOnline = ko.pureComputed(async () => {
            let state = devicesViewModel.depositUnitState();
            await _dataService.setValues(Object.values(DEPOSIT_VIEWSTATE_PROPS), [
                state ? "0" : "2",
                state ? "0" : "2",
                state ? "0" : "2",
                state ? (context.depositInfosViewModel.allowMixedMedia() ? "0" : "2") : "2" // MIXEDMEDIA
            ], null);
            unitStateChanged(state, devicesViewModel.depositUnitMandatory());
            updateLogMessage(LOG_MESSAGES[4], devicesViewModel, state);
            return state;
        });

        // cheques unit (state from deposit unit used)
        devicesViewModel.toggleStateDepositChequesUnit = () => {
            let state = !devicesViewModel.depositChequesUnitState();
            devicesViewModel.depositChequesUnitState(state);
        };
        devicesViewModel.depositChequesUnitOnline = ko.pureComputed(async () => {
            let state = devicesViewModel.depositChequesUnitState();
            await _dataService.setValues(Object.values(DEPOSIT_CHEQUES_VIEWSTATE_PROPS), [
                state ? "0" : "2",
                state ? "0" : "2",
                state ? "0" : "2",
                state ? "0" : "2",
                state ? (context.depositInfosViewModel.allowMixedMedia() ? "0" : "2") : "2" // MIXEDMEDIA
            ], null);
            unitStateChanged(state, devicesViewModel.chequesUnitMandatory());
            updateLogMessage(LOG_MESSAGES[5], devicesViewModel, state);
            return state;
        });

        // printer unit
        devicesViewModel.toggleStatePrinterUnit = () => {
            let state = !devicesViewModel.printerUnitState();
            devicesViewModel.printerUnitState(state);
        };
        devicesViewModel.printerUnitOnline = ko.pureComputed(async () => {
            let state = devicesViewModel.printerUnitState();
            await _dataService.setValues(Object.values(PRINTER_VIEWSTATE_PROPS), [
                state ? "0" : "3",
                state ? "0" : "2",
                state ? "0" : "2",
                state ? "0" : "2"
            ], null);
            unitStateChanged(state, devicesViewModel.printerUnitMandatory());
            updateLogMessage(LOG_MESSAGES[6], devicesViewModel, state);
            return state;
        });

        // Log messages
        devicesViewModel.logMessagesObservable(devicesViewModel.logMessages); // activate log text update
        devicesViewModel.logText = ko.pureComputed(() => {
            let messages = devicesViewModel.logMessagesObservable().concat([]);//.join("\n");
            messages.forEach((item, idx) => {
                messages[idx] = `<li>${item}</li>`;
            });
            return messages.join("");
        });

        // UI
        const $devicesContent = jQuery("#devicesPanel");
        ko.applyBindings(devicesViewModel, $devicesContent[0]);
        $devicesContent.find("button").button();
        $devicesContent.find("input[type=checkbox]").checkboxradio();
        // because of jQuery UI bad chars
        devicesViewModel.cardReaderInstalled(true);
        devicesViewModel.contactlessReaderInstalled(true);
        $devicesContent.find("input[type=checkbox]").checkboxradio("refresh");
    
        // context
        context.devicesViewModel = devicesViewModel;

    }
    
    // ------ Events ------
    async function initEvents(context) {
        let eventInfoList;
        try {
            eventInfoList = await _configService.retrieveJSONData("../servicedata/EventInfoList");
        } catch(e) {
            eventInfoList = {};
        }
        // -- event infos viewmodel--
        const eventInfosViewModel = {
            eventSource: Object.keys(eventInfoList),
            currentEventSource: ko.observable(),
    
            eventTypes: ko.observableArray(),
            currentEventType: ko.observable(),
            
            eventData: ko.observableArray(),
            eventDataSelected: ko.observable(""),
            afterRendered: () => {
                let $options = jQuery("#eventDataSelectBox option");
                $options.each((index, option) => {
                    let $option = jQuery(option);
                    if (!$option.attr("value")) {
                        $option.attr("value", "EMPTY");
                    }
                });
            },
            eventToSendSource: ko.observable(),
            eventToSendType: ko.observable(),
            eventToSendData: ko.observable(),
            sendEvent: async () => {
                const doSend = async delay => {
                    return new Promise(resolve => {
                        setTimeout(() => {
                            _eventService.onEvent({
                                FWName: eventInfosViewModel.eventToSendSource(),
                                FWEventID: eventInfosViewModel.eventToSendType(),
                                FWEventParam: eventInfosViewModel.eventToSendData() || eventInfosViewModel.eventDataSelected() || ""
                            });
                            resolve();
                        }, delay);
    
                    });
                };
                let times = parseInt(eventInfosViewModel.sendEventTimes() ?? "1");
                times = Number.isInteger(times) ? times : 1;
                let delay = parseInt(eventInfosViewModel.sendEventDelay() ?? "1");
                delay = Number.isInteger(delay) ? delay : 1;
                eventInfosViewModel.sendEventTimes(times);
                eventInfosViewModel.sendEventDelay(delay);
                for(let i = 0; i < times; i++) {
                    await doSend(delay);
                }
                // a visible enter effect
                $eventInfo.find("#sendEvent").css({
                    "box-shadow": "0px 0px 4px 4px rgba(0, 255, 0, 1)"
                });
                setTimeout(() => {
                    $eventInfo.find("#sendEvent").css({ // remove effect
                        "box-shadow": ""
                    });
                }, 150);
            },
            sendEventTimes: ko.observable(1),
            sendEventDelay: ko.observable(1)
        };
        eventInfosViewModel.currentEventSource.subscribe(value => {
            eventInfosViewModel.eventTypes(Object.keys(eventInfoList[value]).filter(key => {
                return key !== "NAME";
            }));
            let evtType = Object.keys(context.controlPanelData.EventData[value])[0];
            eventInfosViewModel.eventData(context.controlPanelData.EventData[value][evtType]);
            eventInfosViewModel.eventToSendSource(eventInfoList[value].NAME);
        });
    
        eventInfosViewModel.currentEventType.subscribe(value => {
            eventInfosViewModel.eventData(context.controlPanelData.EventData[eventInfosViewModel.currentEventSource()][value]);
            eventInfosViewModel.eventToSendType(eventInfoList[eventInfosViewModel.currentEventSource()][value]);
        });
    
        const updater = e => {
            if (e.which === 13) { // 'ENTER' key
                let value = $eventToSendData.val()?.trim();
                // a visible enter effect
                $eventToSendData.css({
                    "box-shadow": "0px 0px 4px 4px rgba(0, 255, 0, 1)"
                });
                if(!eventInfosViewModel.eventData().includes(value)) {
                    eventInfosViewModel.eventData.push(value);
                }
                $eventDataSelectBox.select2();
                setTimeout(() => {
                    $eventToSendData.css({ // remove effect
                        "box-shadow": ""
                    });
                }, 150);
            }
        };
    
        // -- context --
        context.eventInfosViewModel = eventInfosViewModel;
        // -- UI --
        const $eventInfo = jQuery("#eventsPanel");
        const $eventDataSelectBox = $eventInfo.find("#eventDataSelectBox");
        const $eventToSendData = $eventInfo.find("#eventToSendData");
        ko.applyBindings(eventInfosViewModel, $eventInfo.find("#eventEmitter")[0]);
        $eventToSendData.keypress(updater);
    }
    
    // ------ Transaction ------
    async function initTransaction(context) {
        /*
            property "CCTAFW_PROP_TRANSACTION_TECHNOLOGY" {
                owner "feature_base.CCTransactionFW"
                type char
                description {
                    brief "This property indicates the technology used to collect data from the customer‘s card of the current transaction."
                    full "This property indicates the technology used to collect data from the customer‘s card of the current transaction.\n
                    It may have the following values:\n
                    0 = (normal) magnetic stripe based transaction\n
                    1 = EMV chip card based transaction\n
                    2 = magnetic stripe based EMV fallback transaction\n
                    3 = undefined\n\n
                    Its initial value is 3. The value is set to 0, if a magnetic stripe transaction is started, or to 1 if a chip application is started
                    (by use of step EMV_START_APPLICATION). If a chip error occurs and magnetic stripe EMV fallback is enabled by the registry
                    parameter EMV_ENABLE_FALLBACK, the value is set to 2.\n
                    It may happen that the value changes from 3 to 2 without having the value 1."
                }
                default '3'
                values ['0','1','2','3']
                dump
            }
            CCTAFW_PROP_CARDHOLDER_BANKCODE
            CCTAFW_PROP_CARDHOLDER_ACCOUNT
            CCTAFW_PROP_CARDHOLDER_CARDSEQNO
            CCTAFW_PROP_WXTEXT_KEY_HOST_RESPONSE
            CCTAFW_PROP_PIN_TRY_COUNT
            CCTAFW_PROP_PIN_MAX_TRIES
        */
        const CARD_TYPES_MAP = {
            cardType01: "0",
            cardType02: "0",
            cardTypeEMV: "1",
        };
        const INITIAL_CARD_TYPE = "cardType01";

        const transactionViewModel = {
            cardType: ko.observable(),

            pinInvalid: ko.observable(false),
            tryCounter: ko.observable(0),
            maxTries: ko.observable(3),
            autoConfirm: ko.observable(),
            pinMinLen: ko.observable(4),
            pinMaxLen: ko.observable(4),
            pinMinLengths: ko.observableArray([1, 2, 3, 4]),
            pinMaxLengths: ko.observableArray([4, 6, 8, 10, 12, 16]),

            insufficientFunds: ko.observable(false),
            prepaidMinuteSelection: ko.observable(false),
            hostOffline: ko.observable(false),
        };
    
        const PIN_ENTRY_VIEW_KEYS = ["PinEntry", "PinChangePinEntry", "PinChangePinConfirmation"];
    
        // UI
        const $transactionContent = jQuery("#transactionPanel");
        ko.applyBindings(transactionViewModel, $transactionContent[0]);
        $transactionContent.find("button").button();
        $transactionContent.find("input[type=radio]").checkboxradio();
        $transactionContent.find("input[type=checkbox]").checkboxradio();
        // prevent from jQuery UI bad chars
        transactionViewModel.autoConfirm(true);
        $transactionContent.find("input[type=checkbox]").checkboxradio("refresh");

        // context
        context.transactionViewModel = transactionViewModel;

        // Card
        transactionViewModel.cardType.subscribe(val => {
            $transactionContent.find("input[name=cardTypes]").checkboxradio("refresh");
            _dataService.setValues("CCTAFW_PROP_TRANSACTION_TECHNOLOGY", [CARD_TYPES_MAP[val]], null);
            _dataService.setValues("CCTAFW_PROP_CARDHOLDER_BANKCODE", [context.controlPanelData.Transaction.CardTypes[val].CCTAFW_PROP_CARDHOLDER_BANKCODE], null);
            _dataService.setValues("CCTAFW_PROP_CARDHOLDER_ACCOUNT", [context.controlPanelData.Transaction.CardTypes[val].CCTAFW_PROP_CARDHOLDER_ACCOUNT], null);
            _dataService.setValues("CCTAFW_PROP_CARDHOLDER_CARDSEQNO", [context.controlPanelData.Transaction.CardTypes[val].CCTAFW_PROP_CARDHOLDER_CARDSEQNO], null);
        });
        transactionViewModel.cardType(INITIAL_CARD_TYPE);

        // PIN
        transactionViewModel.pinInvalid.subscribe(val => {
            if(!val) {
                transactionViewModel.tryCounter(0);
            }
        });
        transactionViewModel.tryCounter.subscribe(async val => {
            // ISO8583 host protocol  specific codes:
            // Message_106: The given PIN is not yet activated! Please try again later.
            // Message_111: The PIN was entered incorrectly. The transaction is therefore cancelled.
            // Message_1740: You have entered a wrong PIN.
            // Message_1880: PIN incorrect too many times
            // Message_53000: You have entered a wrong PIN. Please re-enter your PIN. This is your last attempt
            // Message_55000: You have entered a wrong PIN. Please re-enter your PIN
            // Message_6080: Please enter your PIN.
            // Message_6145: The new PIN entered has NOT been processed. Please try again, by entering a different PIN number
            // Message_6155: PIN change required.
            // Message_75000: Your PIN was entered incorrectly too many times.
            
            
            let isISO8583 = false; // TODO needed the info which protocol is active in order to use host resp codes or local PIN validation.
            let hostMsgCode = "";
            let stepRetCode = "0";
            let max = parseInt(transactionViewModel.maxTries());
            // ATTENTION: Tooling generates the below text codes (LocalizedText.json) only if ISO8583 profile has been chosen.
            val = parseInt(val);
            if(val > max) {
                transactionViewModel.tryCounter(max);
            } else if(isISO8583 && transactionViewModel.pinInvalid() && val > 0) {
                if(val < max && (val + 1) < max) {
                    hostMsgCode = "55000";
                } else if(val + 1 === max) {
                    hostMsgCode = "53000";
                } else if(val === max) {
                    hostMsgCode = "75000";
                }
            } else if(transactionViewModel.pinInvalid() && val > 0) {
                if(val < max) {
                    stepRetCode = "1"; // PIN invalid
                } else if(val >= max) {
                    stepRetCode = "2"; // PIN try counter reached
                }
            }
            $transactionContent.find("input[type=checkbox]").checkboxradio("refresh");
            await _dataService.setValues(["CCTAFW_PROP_PIN_TRY_COUNT", "CCTAFW_PROP_WXTEXT_KEY_HOST_RESPONSE", "PROP_STEP_RETURN_CODE"], [val.toString(), hostMsgCode, stepRetCode], null);
        });
        transactionViewModel.maxTries.subscribe(async val => {
            await _dataService.setValues("CCTAFW_PROP_PIN_MAX_TRIES", [val], null);
        });
        transactionViewModel.autoConfirm.subscribe(async val => {
            await _dataService.setValues("CCTAFW_PROP_PIN_OPTIONS", [[transactionViewModel.pinMinLen(), transactionViewModel.pinMaxLen(), val ? 1 : 0].join(",")], null);
            if(PIN_ENTRY_VIEW_KEYS.includes(_currentViewKey)) {
                refreshView(context, null, true, _currentViewKey);
            }
        });
        transactionViewModel.pinMinLen.subscribe(async val => {
            await _dataService.setValues("CCTAFW_PROP_PIN_OPTIONS", [[val, transactionViewModel.pinMaxLen(), transactionViewModel.autoConfirm() ? 1 : 0].join(",")], null);
            if(PIN_ENTRY_VIEW_KEYS.includes(_currentViewKey)) {
                refreshView(context, null, true, _currentViewKey);
            }
        });
        transactionViewModel.pinMaxLen.subscribe(async val => {
            transactionViewModel.pinMinLengths(Array.apply(null, {length: val + 1}).map(Number.call, Number).slice(1));
            await _dataService.setValues("CCTAFW_PROP_PIN_OPTIONS", [[transactionViewModel.pinMinLen(), val, transactionViewModel.autoConfirm() ? 1 : 0].join(",")], null);
            if(PIN_ENTRY_VIEW_KEYS.includes(_currentViewKey)) {
                refreshView(context, null, true, _currentViewKey);
                // unfortunately the PinEntryViewModel's -maxPinLength member isn't an observable so that an update of it doesn't force a binding refresh.
                // that's why we must manipulate the DOM manually.
                setTimeout(() => { // refresh forces done after ca. 150ms
                    let $pinArea = context.$parentDocument.find("[data-pin-range]");
                    if($pinArea.length) {
                        $pinArea.attr("data-pin-range", val <= 12 ? "low" : "high");
                    }
                }, 160);
            }
        });

        // Funds
        transactionViewModel.insufficientFunds.subscribe(async val => {
            // ISO8583 host protocol  specific codes:
            // Message_3610: The authorization is declined for insufficient funds.
            // Message_51000: The authorization is declined for insufficient funds.
    
            // ATTENTION: Tooling generates the below text codes (LocalizedText.json) only if ISO8583 profile has been chosen.
            let hostMsgCode = "";
            if(val) {
                hostMsgCode = "3610"; // or either 51000 - but when?
            }
            await _dataService.setValues(["CCTAFW_PROP_WXTEXT_KEY_HOST_RESPONSE"], [hostMsgCode], null);
        });
    
        // Enhance the business properties with a virtual EDM config property in order to evaluate it within flow
        _dataService.businessData["EDM_PROP_CONFIG_MINUTE_SELECTION"] = {
            "*": "0"
        };
        
        // Prepaid-Topup minute selection
        transactionViewModel.prepaidMinuteSelection.subscribe(async val => {
            // we set an internal config property, which can be used for flow decision
            await _dataService.setValues(["EDM_PROP_CONFIG_MINUTE_SELECTION"], [Boolean(val) ? "1" : "0"], null);
        });
    
        // Host
        transactionViewModel.hostOffline.subscribe(async val => {
            // Message_ERR108001: We apologize. The host is offline. The transaction will be canceled.
            // Message_ERR108002: We apologize. There was no host response for your request. The transaction will be canceled.
            // Message_ERR108003: We apologize. Your request has been declined by the host. The transaction will be canceled.
            let hostErrCode = "";
            if(val) {
                hostErrCode = "ERR108001";
            }
            await _dataService.setValues(["CCTAFW_PROP_ERROR_INDEX"], [hostErrCode], null);
        });
    }

    // ------ Default ViewKey -------
    function initDefaultViewKey() {
        let key = window.localStorage.getItem('defaultViewKey');
        if(key) {
            _defaultViewKey = key;
            updateGotoDefault(jQuery("#funcGotoDefault")[0]);
        }
    }

    // ------ Context ------
    function initContext(context = {}) {
        let $parentDocument = "";
        if("CONTENT_FRAME_NAME" in _viewService) {
            $parentDocument = jQuery(window.opener?.jQuery(_viewService.CONTENT_FRAME_NAME)[0].contentDocument.children);
        } else {
            $parentDocument = jQuery(window.opener?.jQuery(`#${localStorage.getItem("activeFrameName")}`)[0].contentDocument.children);
        }
        context.$parentDocument = $parentDocument;
        context.content = window.opener.Wincor.UI.Content || {};
        context.config = context.content.Config || {
            viewType: "touch",
            STYLE_TYPE: "default/"
        };
        context.container = context.content.ViewModelContainer || {};
        _context = context;
        return context;
    }
    
    async function initDriver(context, initFn) {
        try {
            await initFn(context);
        } catch(e) {
            updateLogPanel(`${initFn.name}() function failed because of ${e}`);
        }
    }

    // ------ Main init ------
    async function init() {
        const context = initContext();
        const $tabs = jQuery("#tabs");
        $tabs.tabs();
        $tabs.toggle('blind');
        jQuery("#viewSetFunctions").find("button").button();
        jQuery("#functions").find("button").button();
        jQuery("#eppPanel").find("button").button();
        jQuery("body").attr("data-style-type", _viewService.currentStyleType);
   
        
        // Enhance the business properties with a virtual step return code in order to evaluate it within flow
        _dataService.businessData["PROP_STEP_RETURN_CODE"] = {
            "*": "0"
        };
        _dataService.businessData["PROP_PENULTIMATE_VIEWKEY"] = {
            "*": ""
        };
        _dataService.businessData["PROP_PENULTIMATE_ACTION"] = {
            "*": ""
        };

        _viewService.registerForServiceEvent(_viewService.SERVICE_EVENTS.SHUTDOWN, () => {
            _shutdownInProgress = true;
        }, true);

        _viewService.registerForServiceEvent(_viewService.SERVICE_EVENTS.VIEW_ACTIVATED, () => {
            if(_shutdownInProgress) {
                _shutdownInProgress = false;
                initContext(context);
                initViewKeyList(context, true);
                _context.styleTypesViewModel.update();
                _context.vendorsViewModel.update();
            }
        }, true);
    
        let initReady;
        // View key info
        _viewService.registerForServiceEvent(_viewService.SERVICE_EVENTS.NAVIGATE_SPA, async destination => {
            _currentViewKey = destination.viewKey;
            _currentViewId = destination.routeName;
            jQuery("#viewKey").hide().html(_currentViewKey).fadeIn(700);
            jQuery("#viewId").hide().html(destination.routeName).fadeIn(700);
            
            // update vkList selector if necessary
            await initReady;
            if(_context.viewKeysViewModel && (!_context.viewKeysViewModel.viewKeyValue() || _context.viewKeysViewModel.viewKeyValue().name !== _currentViewKey)) {
                let viewKeyObj = _context.viewKeysViewModel.vkList().find(vk => {
                    return vk.name === _currentViewKey;
                });
                if(viewKeyObj) {
                    viewKeyObj.preventNavigation = true; // prevent navigation here, because we just did it
                    _context.viewKeysViewModel.viewKeyValue(viewKeyObj);
                }
            }
        }, true);
        
        // UI result info
        _viewService.registerForServiceEvent(_viewService.SERVICE_EVENTS.VIEW_CLOSING, uiResult => {
            jQuery("#uiResult").hide().html(`code&#8594;[ ${uiResult.resultCode} ]&nbsp;&nbsp;&nbsp;detail&#8594;[ ${uiResult.resultDetail} ]`).fadeIn(700);
        }, true);
    
        try {
            initReady = new Promise(async resolve => {
                let configData = await Promise.all([_configService.retrieveJSONData("assets/ControlPanel"),
                                                    _configService.retrieveJSONData("assets/ControlPanelCustom")]);
    
                context.controlPanelData = Object.assign(configData[0], configData[1]);
                await initDriver(context, initDefaultViewKey);
                await initDriver(context, initStyleTypes);
                await initDriver(context, initVendors);
                await initDriver(context, initWaitSpinner);
                await initDriver(context, initAnimations);
                await initDriver(context, initMainPanel);
                if(window.opener.Wincor.UI.Service.Provider.getInstanceName() === "GUIAPP") {
                    await initDriver(context, initMessageAndPopup);
                }
                await initDriver(context, initLogPanel);
                if(!window.opener.Wincor.applicationMode) {
                    await initDriver(context, initViewKeyList);
                    await initDriver(context, initProperties);
                    await initDriver(context, initCassettesAndHoppers);
                    await initDriver(context, initDepositInfos);
                    await initDriver(context, initDevices);
                    await initDriver(context, initEvents);
                    await initDriver(context, initTransaction);
                }
                resolve();
            });
        } catch(e) {
            updateLogPanel(e);
        }
    }

    jQuery(window).ready(() => {
        updateAdaState("disable"); // disable ADA button at first
        _viewService.registerForServiceEvent(_viewService.SERVICE_EVENTS.VIEW_PREPARED, async () => {
            if(!_isContentPrepared) {
                if(DEBUG) {
                    const $goOn = jQuery("#goOnId");
                    $goOn.show();
                    $goOn.click(async () => {
                        try {
                            $goOn.hide();
                            await init(ko);
                            // we don't want that a view refresh (by unit state changes) is done to early - which causes promise rejections at
                            // an adverse time where the ViewModelContainer is in a wrong state
                            setTimeout(() => {
                                _isStartPhase = false;
                            }, 2000);
                        } catch(e) {
                            updateLogPanel(e);
                        }
                    });
                } else {
                    try {
                        await init(ko);
                        // we don't want that a view refresh (by unit state changes) is done to early - which causes promise rejections at
                        // an adverse time where the ViewModelContainer is in a wrong state
                        setTimeout(() => {
                            _isStartPhase = false;
                        }, 2000);
                    } catch(e) {
                        updateLogPanel(e);
                    }
                }
                _isContentPrepared = true;
            }
        });
    }, false);
});

