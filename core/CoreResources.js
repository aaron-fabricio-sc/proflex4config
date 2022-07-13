/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ CoreResources.js 4.3.1-201211-21-586b0f0c-1a04bc7d
*/
import{ko}from"../lib/ko-global.js";import{default as koMapping}from"../lib/knockout.mapping.js";import{default as ServiceProvider}from"./service/wn.UI.Service.Provider.js";import{Wincor,jQuery,LogProvider,GatewayProvider}from"./proxies/interfaces/BaseDependencies.js";let _initiator=null,_isControlPanelOption=!1,_onIframeContentLoaded=null,_gatewayReadyAlreadyProcessed=!1,_logger=LogProvider;function loadViewSet(e,t){ServiceProvider.ViewService.loadViewSet(e,t)}function eppKeyEvent(e){ServiceProvider.EppService.onEvent({methodName:"KeyPressed",key:e})}function startAda(){localStorage.setItem("adaStarted",!0),ServiceProvider.DataService.setValues("PROP_ADA_STATUS_VALUE","ON",null),ServiceProvider.AdaService.adaCommand({command:"START"}),ServiceProvider.AdaService.adaCommand({command:"FIRSTSTART"})}function startExtendedDesignMode(e){const t={20:"LOG_ANALYSE",21:"LOG_EXCEPTION",22:"LOG_ERROR",23:"LOG_WARNING",24:"LOG_INFO",25:"LOG_INOUT",26:"LOG_DATA",27:"LOG_SRVC_INOUT",28:"LOG_SRVC_DATA",29:"LOG_DETAIL"},a=(e,...a)=>{(a=0===a.length?[20,21,22,23,24,25,26,27,28,29]:a).forEach((a=>{"string"==typeof a?Object.values(t).includes(a)&&(LogProvider[a]=!!e&&parseInt(Object.keys(t).find((e=>t[e]===a)))):a in t&&(LogProvider[t[a]]=!!e&&a)}))};window.traceOff=(...e)=>{a(!1,...e)},window.traceOn=(...e)=>{a(!0,...e)},"true"===localStorage.getItem("activateTraceOn")?window.traceOn():window.traceOff(),e&&localStorage.setItem("currentViewSet",e),_initiator&&_initiator()}function listenerRemoved(){}function getQueryStringValue(e){e=e.replace(/[\[]/,"\\[").replace(/[\]]/,"\\]");let t=new RegExp("[\\?&]"+e+"=([^&#]*)").exec(location.search);return null===t?"":decodeURIComponent(t[1].replace(/\+/g," "))}function showStandardMenuForExtendedDesignMode(e,t){e.slideDown({duration:660,easing:"easeOutQuart",complete:function(){const e=jQuery("#extendedDesignModeMenu");e.show({duration:300,easing:"easeOutQuart",start:function(){e.css("display","flex");let t=localStorage.getItem("controlPanelOn");"true"===t?(_isControlPanelOption=!0,jQuery("#controlPanelCheckBox").attr("checked",t)):(_isControlPanelOption=!1,jQuery("#controlPanelCheckBox").removeAttr("checked"));let a=localStorage.getItem("keepViewKeyOn");"true"===a?jQuery("#keepViewKeyCheckBox").attr("checked",a):jQuery("#keepViewKeyCheckBox").removeAttr("checked");let o=localStorage.getItem("keepStyleTypeOn");"true"===o?jQuery("#keepStyleTypeCheckBox").attr("checked",o):jQuery("#keepStyleTypeCheckBox").removeAttr("checked");let r=localStorage.getItem("activateTimeoutsOn");"true"===r?jQuery("#activateTimeoutsCheckBox").attr("checked",r):jQuery("#activateTimeoutsCheckBox").removeAttr("checked");let n=localStorage.getItem("activateAdaOn");"true"===n?jQuery("#activateAdaCheckBox").attr("checked",n):jQuery("#activateAdaCheckBox").removeAttr("checked")},complete:function(){t.html("...Please select...")}})}})}function init(){const e=jQuery(".state"),t=["show","true","1","yes"],a=["hide","false","0","no"];let o=null;console.log("init..."),e.html("initializing...");const r=-1!==t.indexOf(getQueryStringValue("extendedDesignMode").toLowerCase()),n=window.Wincor.toolingEDM=!r&&-1!==t.indexOf(getQueryStringValue("toolingEDM").toLowerCase()),i=window.Wincor.applicationMode=!r&&!n;if(Wincor.UI.longStackTraces=t.includes(getQueryStringValue("longStackTraces").toLowerCase()),Promise.setScheduler&&Promise.config({longStackTraces:!!Wincor.UI.longStackTraces}),i?(window.Wincor.applicationRoot=getQueryStringValue("applicationRoot"),localStorage.setItem("activeFrameName","applicationContent"),jQuery("#applicationMode").css("display","block")):n&&(localStorage.clear(),localStorage.setItem("activeFrameName","toolingEDMContent"),jQuery("#toolingEDM").css("display","block")),i||n)!function(){const e="WEBSOCKET";let t,a;console.log("setting gatewayType to WEBSOCKET"),jQuery(".gwType").html("gateway type: WEBSOCKET"),localStorage.setItem("gatewayType",e),t=getQueryStringValue("gatewayWebSocketPort"),t&&(console.log(`setting gatewayWebSocketPort to ${t}`),localStorage.setItem("gatewayWebSocketPort",t)),a=getQueryStringValue("gatewayHsID"),a&&localStorage.setItem("gatewayHsID",a);let o=GatewayProvider.createGateway();if(o){o.registerConnectionReadyHandler(c);try{o.establishConnection().catch((e=>{console.error(`Connection failed for WEBSOCKET! ${e}`)}))}catch(e){console.error("Connection failed for WEBSOCKET!")}}}();else if(r){localStorage.setItem("activeFrameName","extendedDesignModeContent"),_initiator=c;const a=jQuery("#extendedDesignMode"),o=getQueryStringValue("viewSet"),r=getQueryStringValue("viewKey");r&&(localStorage.setItem(`currentViewKey_${document.location.href}`,r),localStorage.setItem("keepViewKeyOn","true")),"MercuryLight/"===localStorage.getItem("currentStyleType")&&jQuery("body").attr("data-style-type","MercuryLight"),getQueryStringValue("language")?localStorage.setItem("defaultLanguage",getQueryStringValue("language")):localStorage.removeItem("defaultLanguage"),"touch"===o||"softkey"===o?(a.css("display","block"),_isControlPanelOption=-1!==t.indexOf(getQueryStringValue("debugPanel").toLowerCase()),startExtendedDesignMode(o)):showStandardMenuForExtendedDesignMode(a,e)}else console.error("ERROR: no mode or unsupported mode is set");async function c(){if(n&&_gatewayReadyAlreadyProcessed)return;if(i||n?e.html("loading services..."):jQuery(".spinner").css("display","block"),n){const e=getQueryStringValue("viewSet"),t=getQueryStringValue("viewKey"),a=getQueryStringValue("styleType"),o=getQueryStringValue("animations");t&&(localStorage.setItem(`currentViewKey_${document.location.href}`,t),localStorage.setItem("keepViewKeyOn","true")),a&&(localStorage.setItem("currentStyleType",`${a}/`),jQuery("body").attr("data-style-type",a),localStorage.setItem("keepStyleTypeOn","true")),"touch"!==e&&"softkey"!==e||localStorage.setItem("currentViewSet",e),"false"===o?localStorage.setItem("animations","false"):localStorage.setItem("animations","true"),getQueryStringValue("language")?localStorage.setItem("defaultLanguage",getQueryStringValue("language")):localStorage.removeItem("defaultLanguage")}console.log("gatewayReady"),ServiceProvider.setBaseUrl("../../");let c=getQueryStringValue("interface");c?console.log(`interface set to: ${c}`):c="wn.UI.Service.Interfaces",c=c.replace(".json",""),c.toLowerCase().endsWith(".js")&&(c=c.slice(0,-3)),console.log(`coreResources.gatewayReady interfaceFile from queryString=${getQueryStringValue("interface")}, resulting interfaceFile=${c}`);try{let{ServiceBundle:l,InterfaceGeneral:s}=await import(`./proxies/${c}.js`);const{init:d}=await ServiceProvider.loadServices(l,s);if(r||n){const t=getQueryStringValue("instanceName")||"GUIAPP";await ServiceProvider.setup({instanceName:t.toUpperCase()}),await d,e.html("ready.")}r&&(jQuery("#extendedDesignModeMenu").fadeOut(),jQuery("H1,H2").fadeOut());const u=ServiceProvider.ConfigService,g=ServiceProvider.ViewService,S=ServiceProvider.DataService,m=ServiceProvider.ControlPanelService,y=ServiceProvider.AdaService,E=ServiceProvider.EppService,v=localStorage.getItem("activeFrameName");if(g.registerForServiceEvent(g.SERVICE_EVENTS.SHUTDOWN,(()=>{const e=jQuery(`#${v}`);e.after('<div id="hideCursorLayerInternal" style="position: absolute; top: 0; bottom: 0; right: 0; left: 0; cursor: none; z-index: 100;"></div>');let t=jQuery("body");t.removeClass("default/"===g.currentStyleType?"backgroundMercuryLight":"backgroundMercury"),t.addClass("MercuryLight/"===g.currentStyleType?"backgroundMercuryLight":"backgroundMercury"),e.contents()[0].removeEventListener("DOMContentLoaded",listenerRemoved,!1)}),!0),_onIframeContentLoaded=async e=>{if(e){const o=jQuery(e).contents()[0];let r=jQuery(o.getElementsByTagName("body")[0]);r.length?r.keydown((e=>{let t=e.target.nodeName.toLowerCase();8===e.which&&"input"!==t&&"textarea"!==t&&(e.preventDefault(),e.stopPropagation(),_logger.LOG_DETAIL&&_logger.log(_logger.LOG_DETAIL,"coreResources.loadServices backspace prevented from history navigation back."))})):_logger.error(`DOM operation backspace prevent from default failed: Could not get body of active frame=${v}`),u.whenReady.then((async()=>{const e=u.configuration.instanceName;await g.whenReady,g.registerForServiceEvent(g.SERVICE_EVENTS.VIEW_BEFORE_CHANGE,(()=>{jQuery(".instance").html(e)}),g.DISPOSAL_TRIGGER_ONETIME),u.getConfiguration(e,null,(r=>{let n;u.configuration[e]=r,n=void 0!==r.HideCursor?!0===r.HideCursor||t.includes(r.HideCursor)||!(!1===r.HideCursor||a.includes(r.HideCursor)):!!i;const c=jQuery(o.getElementsByTagName("body")[0]);c.length?(c.css("cursor",n?"none":"auto"),_logger.LOG_DETAIL&&_logger.log(_logger.LOG_DETAIL,`coreResources.loadServices hideCursor=${n}, cursor set to ${c.css("cursor")}`)):_logger.error("DOM operation hiding cursor failed: Could not get body of active frame="+v)}))}));try{o.getElementsByTagName("html")[0].addEventListener("contextmenu",(e=>{e.preventDefault()}))}catch(e){_logger.error(`Could not prevent from default context menu activation: ${e}`)}}setTimeout((()=>{jQuery("#hideCursorLayerInternal").remove()}),250)},_isControlPanelOption||i&&-1!==t.indexOf(getQueryStringValue("debugPanel").toLowerCase())){const e=650,t=1e3;try{const a={F1:{status:!1,claims:!1,cmdState:!1},F2:{status:!1,claims:!1,cmdState:!1},F3:{status:!1,claims:!1,cmdState:!1},F4:{status:!1,claims:!1,cmdState:!1},F5:{status:!1,claims:!1,cmdState:!1},F6:{status:!1,claims:!1,cmdState:!1},F7:{status:!1,claims:!1,cmdState:!1},F8:{status:!1,claims:!1,cmdState:!1},1:{status:!1,claims:!1,cmdState:!1},2:{status:!1,claims:!1,cmdState:!1},3:{status:!1,claims:!1,cmdState:!1},4:{status:!1,claims:!1,cmdState:!1},5:{status:!1,claims:!1,cmdState:!1},6:{status:!1,claims:!1,cmdState:!1},7:{status:!1,claims:!1,cmdState:!1},8:{status:!1,claims:!1,cmdState:!1},9:{status:!1,claims:!1,cmdState:!1},0:{status:!1,claims:!1,cmdState:!1},"*":{status:!1,claims:!1,cmdState:!1},CANCEL:{status:!1,claims:!1,cmdState:!1},CONFIRM:{status:!1,claims:!1,cmdState:!1},CLEAR:{status:!1,claims:!1,cmdState:!1},BACKSPACE:{status:!1,claims:!1,cmdState:!1},HELP:{status:!1,claims:!1,cmdState:!1}},r=koMapping.fromJS(a),n=function(e){_logger.LOG_DETAIL&&_logger.log(_logger.LOG_DETAIL,"coreResources.updateViewModel"+JSON.stringify(e)),Object.keys(e).forEach((t=>{e[t]&&0===e[t].claims&&(e[t].claims=!1)})),koMapping.fromJS(e,r)},i={0:"ENABLED",1:"PRESSED",2:"DISABLED",3:"HIDDEN",4:"DYNAMIC",5:"NONE"};window.addEventListener("unload",(()=>{o&&(jQuery(o).off("load"),speechSynthesis.speaking&&speechSynthesis.cancel(),o.close(),o=null,localStorage.setItem("controlPanelActive","false"))}),!1),o=window.open("assets/ControlPanel.html","",`width=${e},height=${t},menubar=0,toolbar=0,statusbar=0,location=0,directories=no,location=no,resizable=1,scrollbars=0`),o?(o.Wincor=Wincor,jQuery(o).on("load",(()=>{m.setControlPanel(o),o.resizeTo(e,t),localStorage.setItem("controlPanelActive","true"),ko.applyBindings(r,o.document.getElementById("eppClaims"))}))):console.error("no control panel window available!");const c=localStorage.getItem("activateAdaOn"),l=new Audio;let s=-1;const d=function(e,t){if(Wincor.UI.Content){const o=Wincor.UI.Content.Commanding;let r={};Object.keys(a).forEach((function(e){let t=o.getByEppKey(e);t&&t[0]&&0!==t[0].viewState.value()?r[e]={cmdState:i[t[0].viewState.value()]}:r[e]={cmdState:!1}})),_logger.LOG_DETAIL&&_logger.log(_logger.LOG_DETAIL,"coreResources.serviceEventReceived"),n(e?jQuery.extend(!0,t,r):r)}},u=function(e){o&&"true"===c&&("BEREADY"===e?o.updateAdaState("enable"):o.updateAdaState("disable"))};E.registerForServiceEvent(E.SERVICE_EVENTS.CLAIM_STATUS_CHANGED,d.bind(null,!0),!0);let v={};g.registerForServiceEvent(g.SERVICE_EVENTS.VIEW_ACTIVATED,(function(){const e=Wincor.UI.Content.Commanding;e.registerForStateChange({context:v,listener:function(t){_logger.LOG_DETAIL&&_logger.log(_logger.LOG_DETAIL,`cmdStateChanged: ${JSON.stringify(t)}`);let o,r={};Object.keys(a).forEach((function(a){o=e.get(t.id),o.eppKeys&&-1!==o.eppKeys.indexOf(a)&&(0!==t.viewState?r[a]={cmdState:i[t.viewState]}:r[a]={cmdState:!1})})),n(r)}}),d(!1)}),!0),g.registerForServiceEvent(g.SERVICE_EVENTS.CONTENT_UPDATE,d.bind(null,!1),!0),g.registerForServiceEvent(g.SERVICE_EVENTS.POPUP_ACTIVATED,d.bind(null,!1),!0),g.registerForServiceEvent(g.SERVICE_EVENTS.POPUP_DEACTIVATED,d.bind(null,!1),!0),g.registerForServiceEvent(g.SERVICE_EVENTS.VIEW_CLOSING,d.bind(null,!1),!0),"true"===c&&(y.state=y.STATE_VALUES.BEREADY,g.registerForServiceEvent(g.SERVICE_EVENTS.NAVIGATE_SPA,(function(e){-1!==s&&(window.clearInterval(s),s=-1),"IdleLoopPresentation"===e.viewKey?(S.setValues("PROP_ADA_STATUS_VALUE","OFF",null),localStorage.setItem("adaStarted",!1),y.adaCommand({command:"STOP"}),y.adaCommand({command:"LASTSTOP"}),y.adaCommand({command:"IDLE"}),S.updateValues("PROP_UI_STYLE_TYPE_KEY","default/"),l.setAttribute("src","assets/Hello.wav"),s=window.setInterval((()=>l.play()),2e4)):(l.pause(),l.setAttribute("src",""),u(null),"OutOfServiceInfo"===e.viewKey?(l.setAttribute("src","assets/OutOfService.wav"),s=window.setInterval((()=>l.play()),2e4)):"true"===localStorage.getItem("adaStarted")&&"SPEAK"!==y.state&&y.adaCommand({command:"START"}))}),!0),y.registerForServiceEvent(y.SERVICE_EVENTS.FIRST_START,u,!0),y.registerForServiceEvent(y.SERVICE_EVENTS.LAST_STOP,u,!0),y.registerForServiceEvent(y.SERVICE_EVENTS.STATE_CHANGED,u,!0))}catch(e){console.error(`failed claim status stuff ${e.message}`)}}else localStorage.setItem("controlPanelActive","false");jQuery(".spinner").css("display","none")}catch(e){jQuery(".spinner").css("display","none"),console.error(`failed loading services! ${e}`)}_gatewayReadyAlreadyProcessed=!0}}window.startAda=startAda,window.startExtendedDesignMode=startExtendedDesignMode,window.loadViewSet=loadViewSet,window.eppKeyEvent=eppKeyEvent,window.contentLoaded=function(e){_onIframeContentLoaded&&_onIframeContentLoaded(e)},window.controlPanelHandler=function(e){localStorage.setItem("controlPanelOn",e),_isControlPanelOption=e},window.keepViewKeyHandler=function(e){localStorage.setItem("keepViewKeyOn",e)},window.keepStyleTypeHandler=function(e){localStorage.setItem("keepStyleTypeOn",e)},window.activateTimeoutsHandler=function(e){localStorage.setItem("activateTimeoutsOn",e)},window.activateAdaHandler=function(e){localStorage.setItem("activateAdaOn",e)},Wincor.UI.Content?.designMode||init();