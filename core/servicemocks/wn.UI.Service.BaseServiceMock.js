/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ wn.UI.Service.BaseServiceMock.js 4.3.1-210614-21-db8848bb-1a04bc7d

*/
const WX_TEXT_MARKER="[%WX_TEXT[",IF_TEXT_MARKER="[%IF_TEXT[",WX_TEXT_BEGIN_MARKER="[%",WX_TEXT_END_MARKER="%]",WX_TEXT_CONDITIONAL_PROPERTY="P,",PROP_MARKER="[&",PROP_END_MARKER="&]",PROP_INDEX_BEGIN_MARKER="[",PROP_INDEX_END_MARKER="]",PROP_ATTRIBUTE_BEGIN_MARKER=".",PROP_ARRAY_MARKER="[A",ISOLATOR=";",VAR_REPLACE_MARKER="(#",VAR_REPLACE_END_MARKER="#)",VAR_REPLACE_SPLITTER="#",LANG_GENERAL="General",EXPRESSION_PREF="EX:",EXPRESSION_VALUE_PREF="[",EXPRESSION_NOT_VALUE_PREF="![",REPLACE_SOURCE_STRING_LIMIT=524288;let _configService,_controlPanelService,_logger,_formatService=null,_viewKey="",_viewCtx={},_textKeys=null;const _serviceEventObjMap={},_eventDelegatesMap=new Map;let _serviceReadyEventRegisteringDone=!1;function replaceAt(e,t,r,i){return e&&e.length<524288&&r>t&&t<=e.length&&r<=e.length?`${e.substring(0,t)}${i}${e.substring(r)}`:e}const getServiceClass=({Wincor:e,ext:t,jQuery:r,LogProvider:i,GatewayProvider:s,Gateway:o})=>class n{NAME="";DISPOSAL_TRIGGER_DEACTIVATE="DEACTIVATE";DISPOSAL_TRIGGER_UNLOAD="UNLOAD";DISPOSAL_TRIGGER_ONETIME="ONETIME";DISPOSAL_TRIGGER_SHUTDOWN="SHUTDOWN";SERVICE_EVENTS=null;EVENT=null;logger=null;whenReady=null;_registrationId=0;ready=!1;responseTimeSimulation=1;requestMap=null;currentLanguageName="English";ERROR_TYPE={REQUEST:"REQUEST",RESPONSE:"RESPONSE",EVENT:"EVENT",OTHER:"OTHER"};EventRegistration=function(){this.registrationId=-1,this.callback=null,this.persistent=!1,this.trigger=null};constructor(t,{ServiceProvider:r}){this.NAME=t,this.serviceProvider=r,this.logger=i,_logger=i;let s="";_logger.LOG_SRVC_INOUT&&arguments&&arguments.length>2&&(s=`, ${Object.values(arguments).slice(2)}`),_logger.log(_logger.LOG_SRVC_INOUT,`> BaseServiceMock::BaseServiceMock[${this.NAME}](${t}, ServiceProvider: ${r}${s})`),this.requestMap=new Map,e.toolingEDM?this.EVENT=Object.assign({},o.prototype.EVENT):this.EVENT={},this.whenReady=null,this._registrationId=0,_logger.log(_logger.LOG_SRVC_INOUT,`< BaseServiceMock::BaseServiceMock[${this.NAME}]`)}setViewCtx(e){_viewCtx=e}getViewCtx(){return _viewCtx}setViewKey(e){_viewKey=e}getViewKey(){return _viewKey}convertToBoolean(e){return!!e&&(!0===e||(isNaN(e)?"true"===e.toLowerCase():parseInt(e)>0))}retrieveJSONData(e){return _textKeys=null,t.Promises.promise(((t,i)=>r.getJSON(-1===e.lastIndexOf(".json")?e+".json":e,t).fail((e=>i(e)))))}installServiceEvents(){this.SERVICE_EVENTS&&"object"==typeof this.SERVICE_EVENTS&&(Object.keys(this.SERVICE_EVENTS).forEach((e=>{if(e in _serviceEventObjMap)throw`${this.NAME} tried to install SERVICE_EVENT ${e}, but this is already installed by ${_serviceEventObjMap[e]}`;_serviceEventObjMap[e]=this.NAME})),_logger.LOG_SRVC_DATA&&_logger.log(_logger.LOG_SRVC_DATA,`. Service::installServiceEvents[${this.NAME}]${JSON.stringify(this.SERVICE_EVENTS)} succeeded.`))}registerForServiceEvent(t,r,i){_logger.log(_logger.LOG_SRVC_INOUT,`> BaseServiceMock::registerForServiceEvent[${this.NAME}](${t}, ..., persistent: ${i})`);try{if(t in _serviceEventObjMap&&r){let e=new this.EventRegistration;return this._registrationId++,e.registrationId=this._registrationId,"string"==typeof i?i!==this.DISPOSAL_TRIGGER_DEACTIVATE&&i!==this.DISPOSAL_TRIGGER_UNLOAD&&i!==this.DISPOSAL_TRIGGER_ONETIME&&i!==this.DISPOSAL_TRIGGER_SHUTDOWN||(e.trigger=i,i=!1):("boolean"==typeof i||(i=!1),e.trigger=this.DISPOSAL_TRIGGER_DEACTIVATE),e.callback=r,e.persistent=i,_eventDelegatesMap.has(t)?_eventDelegatesMap.get(t).push(e):_eventDelegatesMap.set(t,[e]),_logger.log(_logger.LOG_SRVC_INOUT,`< BaseServiceMock::registerForServiceEvent[${this.NAME}] returns regId: ${this._registrationId}`),this._registrationId}_logger.log(_logger.LOG_ANALYSE,`. BaseServiceMock::registerForServiceEvent[${this.NAME}] WARNING: Could not register for serviceEventName=${t}`)}catch(t){e.UI.Service.Provider.propagateError(this.NAME,this.ERROR_TYPE.OTHER,t)}return-1}deregisterServiceEvents(e,t){_logger.log(_logger.LOG_SRVC_INOUT,`> BaseServiceMock::deregisterServiceEvents[${this.NAME}](trigger: ${e}, eventName: ${t})`);let r,i,s,o=0;for(let[n,l]of _eventDelegatesMap){for(r=l.length-1;r>=0;r--)i="string"!=typeof t||t===n,s=l[r],!s.persistent&&s.trigger===e&&i&&(_logger.log(_logger.LOG_DETAIL,`. removing ${n} regId< ${s.registrationId} > of ${this.NAME}`),s.callback=null,l.splice(r,1),0===l.length&&_eventDelegatesMap.delete(n));l&&(o+=l.length)}_logger.log(_logger.LOG_SRVC_INOUT,`< BaseServiceMock::deregisterServiceEvents[${this.NAME}] delegatesLeft: ${o}`)}deregisterFromServiceEvent(e){let t,r;_logger.log(_logger.LOG_SRVC_INOUT,"> BaseServiceMock::deregisterFromServiceEvents()");let i=void 0===e;for(let[s,o]of _eventDelegatesMap){for(t=o.length-1;t>=0;t--)if(r=o[t],(i||r.registrationId===e)&&(r.callback=null,o.splice(t,1),!i))return _logger.log(_logger.LOG_SRVC_INOUT,"< BaseServiceMock::deregisterFromServiceEvents returns: true"),!0;0===o.length&&_eventDelegatesMap.delete(s)}return _logger.log(_logger.LOG_SRVC_INOUT,"< BaseServiceMock::deregisterFromServiceEvents returns: "),!0}fireServiceEvent(e,t){_logger.log(_logger.LOG_SRVC_INOUT,`> BaseServiceMock::fireServiceEvent[${this.NAME}](serviceEventName: ${e}, data: ${t})`);let r=!1;if(_serviceEventObjMap[e]===this.NAME){if(_eventDelegatesMap.has(e)){let i=_eventDelegatesMap.get(e);for(let e=i.length-1;e>=0;e--)"function"==typeof i[e].callback&&(r|=i[e].callback(t));this.deregisterServiceEvents(this.DISPOSAL_TRIGGER_ONETIME,e)}}else _logger.error(`BaseServiceMock::fireServiceEvent Error! Not allowed! ${this.NAME} tried to send foreign SERVICE_EVENT ${e}!`);return _logger.log(_logger.LOG_SRVC_INOUT,`< BaseServiceMock::fireServiceEvent[${this.NAME}]`),r}onSetup(e){return t.Promises.Promise.resolve()}onServicesReady(){_logger.log(_logger.LOG_SRVC_INOUT,"> BaseServiceMock::onServicesReady()"),this.ready=!0;const e=this.serviceProvider.ViewService;return e&&!_serviceReadyEventRegisteringDone&&(this.registerForServiceEvent(e.SERVICE_EVENTS.VIEW_CLOSING,(()=>{this.deregisterServiceEvents(this.DISPOSAL_TRIGGER_DEACTIVATE)}),!0),this.registerForServiceEvent(e.SERVICE_EVENTS.VIEW_BEFORE_CHANGE,(()=>{this.deregisterServiceEvents(this.DISPOSAL_TRIGGER_UNLOAD),this.deregisterServiceEvents(this.DISPOSAL_TRIGGER_ONETIME)}),!0),this.registerForServiceEvent(e.SERVICE_EVENTS.SHUTDOWN,(()=>{this.deregisterServiceEvents(this.DISPOSAL_TRIGGER_DEACTIVATE),this.deregisterServiceEvents(this.DISPOSAL_TRIGGER_UNLOAD),this.deregisterServiceEvents(this.DISPOSAL_TRIGGER_ONETIME),this.deregisterServiceEvents(this.DISPOSAL_TRIGGER_SHUTDOWN)}),!0),_serviceReadyEventRegisteringDone=!0),_formatService=this.serviceProvider.FormatService,_configService=this.serviceProvider.ConfigService,_controlPanelService=this.serviceProvider.ControlPanelService,_logger.log(_logger.LOG_SRVC_INOUT,"< BaseServiceMock::onServicesReady"),t.Promises.Promise.resolve()}generateSpecificResponse(e){return{}}callbackCaller(e){e&&window.setTimeout((()=>e(this.generateSpecificResponse.bind(this)())),this.responseTimeSimulation)}async getToolingProfile(){_logger.LOG_ANALYSE&&_logger.log(_logger.LOG_ANALYSE,"> | VIEW ViewServiceMock::getToolingProfile");let e=["",""];try{let t=await this.retrieveJSONData("../servicemocks/mockdata/profiles");_logger.LOG_ANALYSE&&_logger.log(_logger.LOG_ANALYSE,`* ViewServiceMock::getToolingProfile = ${JSON.stringify(t)}`);let r=t.selectedProfile;void 0!==r&&(e=["profile","_"+r])}catch(e){}return e}replaceInMapping(t,r){let i;Object.keys(t).forEach((s=>{let o=t[s];o&&"string"==typeof o&&o.includes("(#")?(i=o.split("#")[1],r[i]&&(t[s]=Object.assign({},r[i]),e.toolingEDM&&(r[i].isTemplate=!0,t[s].fromTemplateKey=i,void 0===r[i].targetViewKey&&(r[i].targetViewKey=s)))):"object"==typeof o&&Object.keys(o).forEach((e=>{let t=o[e];if("string"==typeof t){let i=t.split("#");for(let t=0;t<i.length;t++){let s=i[t];if(r[s]){let t=o[e];const i="(#"+s+"#)";let n=t.indexOf(i),l=n+i.length;o[e]=replaceAt(t,n,l,r[s])}}}}))}))}replaceTemplateUsage(t,r){let i=!0;return Object.keys(t).forEach((s=>{let o=t[s].useTemplate;if(void 0!==o){let n=r[o];void 0!==n?(t[s]=Object.assign({},n),e.toolingEDM&&(n.isTemplate=!0,t[s].fromTemplateKey=o,void 0===n.targetViewKey&&(n.targetViewKey=s))):(_logger.error(`BaseServiceMock::replaceTemplateUsage Could not replace viewKey=${t.viewKey} with template=${o} for viewKey=${_viewKey}!`),i=!1)}})),i}getPropValue(t,r){let i=null,s=e.UI.Service.Provider.ViewService.viewContext.viewKey,o=t.key;if(!o.startsWith(_configService.configuration.instanceName)&&o in r){if(s=s in r[o]?s:"*",s in r[o])if(-1===t.idx){let e=Array.isArray(r[o][s])?r[o][s][0]:r[o][s];i=t.attrChain?this.getValueFromJSON(e,t.attrChain):e}else i=t.attrChain?Array.isArray(r[o][s])?this.getValueFromJSON(r[o][s][t.idx],t.attrChain):this.getValueFromJSON(r[o][s],t.attrChain):Array.isArray(r[o][s])?r[o][s][t.idx]:r[o][s];null==i?i=-1:Array.isArray(i)&&i.length&&(i=i[0])}else i=this.serviceProvider.DataService.getPropertyString({propertyName:o,propertyValue:""})||-1;if(-1!==i){let e=this.buildKeyFromParts(t);e.includes("[0]")&&!e.includes(".")&&(e=e.substr(0,e.indexOf("[0]"))),_controlPanelService.updateBusinessProperties(new Map([[e,i]]))}return i}getTextValue(e,t){e=e.toLowerCase();const r=_textKeys||(_textKeys=Object.keys(t)),i=r.length;for(let s=0;s<i;s++)if(e===`${r[s]}`.toLowerCase())return this.getTextFromObj(t[r[s]]);return-1}getTextFromObj(e){if("object"==typeof e){let t=e[this.currentLanguageName];(e=t||e.General)||(e="")}if("object"==typeof e)try{e=JSON.stringify(e)}catch(t){_logger.error(`BaseServiceMock::getTextFromObj: Value isn't a JSON notated object which was expected at least.${t} for viewKey=${_viewKey}`),e="N/A"}return e.toString()}isIndexedPropertyKey(e){return null!=e&&e.includes("[")&&e.includes("]")&&!e.includes("[A")}extractPropertiesFromText(e){let t=[];if(e){let r,i,s;do{r=e.indexOf("[&"),i=e.indexOf("&]")+"&]".length,-1!==r&&-1!==i&&(s=e.substring(r,i),s=s.substring("[&".length,s.indexOf(";")),t.includes(s)||t.push(s),e=e.substring(i,e.length))}while(e&&-1!==r&&-1!==i)}return t}extractKeyPartsFromProperty(e){let t={key:e||"",idx:-1,attrChain:null};if(e&&this.isIndexedPropertyKey(e)&&(t.key=e.substring(0,e.indexOf("[")),t.idx=parseInt(e.substring(e.indexOf("[")+1,e.indexOf("]"))),t.idx=isNaN(t.idx)?-1:t.idx),e&&t.key.includes(".")){let e=t.key.split(".");t.key=e[0],e.shift(),t.attrChain=e}return t}buildKeyFromParts(e){let t="";return e&&(t=`${e.key}${e.attrChain?"."+e.attrChain.join("."):""}${-1!==e.idx?`[${e.idx}]`:""}`),t}getValueFromJSON(e,t){let r=e;if(Array.isArray(t))try{r=t.reduce(((e,t)=>{if(e&&t in e)return e[t]}),JSON.parse(e))}catch(t){_logger.error(`BaseServiceMock::getValueFromJSON: Error data access via property with attribute notation expects a JSON value=${e} Error: ${t} for viewKey=${_viewKey}`)}return r?"object"==typeof r?JSON.stringify(r):r:e}setValueFromJSON(e,t,r){if(Array.isArray(t))try{e=JSON.parse(e);let i=t.length,s=0;t.reduce(((e,t)=>{if(e&&t in e){if(s!==i-1)return s++,e[t];if("string"==typeof r&&(r.startsWith("{")||r.startsWith("[")))try{r=JSON.parse(r)}catch(e){}e[t]=r}}),e),e=JSON.stringify(e)}catch(t){_logger.error(`BaseServiceMock::setValueFromJSON: Error data access via property with attribute notation expects a JSON value=${e} Error: ${t} for viewKey=${_viewKey}`)}return e}propResolver(t,r,i,s){let o=s||0;if(50===o)return _logger.error(`BaseServiceMock::propResolver: Invalid token=${t} too many property keys - limit is 50 or even wrong template for viewKey=${_viewKey}!`),"";if("string"==typeof t){let s=t.indexOf("[&"),n=t.indexOf("&]",s)+"&]".length;if(-1===s||-1===n)return t;if(n<s)return _logger.error(`BaseServiceMock::propResolver: prop='${t.substring(s,n)}' for token='${t}' seems to be not a valid token for viewKey=${_viewKey}!`),"";let l=t.substring(s,n),g=l.substring("[&".length,l.indexOf(";")),a=this.extractKeyPartsFromProperty(g),_=l.substring(l.indexOf(";")+";".length,l.lastIndexOf(";")),E=l.substring(l.lastIndexOf(";")+";".length,l.indexOf("&]")),c=this.getPropValue(a,r);if(e.toolingEDM&&i&&-1===c&&!i.includes(g)&&i.push(g),c=-1!==c?c:E,_.length>0&&_formatService){let e={raw:c};_formatService.format(e,_,null,!0),c=e.result}(t=replaceAt(t,s,n,c)).includes("[&")&&(o++,t=this.propResolver(t,r,i,o))}else _logger.error(`BaseServiceMock::propResolver: Invalid token=${t} which must be a string for viewKey=${_viewKey}!`),t="";return t}propResolverFromConditional(e,t,r){const i="EX:";let s=!1;if("string"==typeof e&&0===e.indexOf("P,")){let o=e.substring(e.indexOf("P,")+"P,".length,e.includes(i)?e.indexOf(",EX:"):e.length-1);s=function(e,t){let r=e===t;switch(t){case"SET":case"!EMPTY":r=null!=e&&""!==e;break;case"EMPTY":r=""===e;break;case"!SET":r=null===e;break;default:t.includes("![")?r=e!==(t=(t=t.substring("![".length)).substring(0,t.length-1)):0===t.indexOf("[")&&(r=e===(t=(t=t.substring("[".length)).substring(0,t.length-1)))}return r}(this.propResolver(`[&${o};;&]`,t,r),e.includes(i)?e.substring(e.indexOf(i)+i.length):"")}return s}static#isWXTextValid(e){let t=!0;if("string"==typeof e){let r=e.split("[%WX_TEXT[").length-1;r=r+e.split("[%IF_TEXT[").length-1,t=r===e.split("%]").length-1}return t}static#findWXTextEndTag(e,t=0){function r(t,r){let i=e.indexOf("[%WX_TEXT[",r),s=e.indexOf("[%IF_TEXT[",r),o=e.indexOf("%]",r),n=[-1,""];return-1!==i&&i<o&&(i<s&&-1!==s||i>s&&-1===s)?(n[0]=i,n[1]="[%WX_TEXT[",n):-1!==s&&-1!==i&&s<i?(n[0]=s,n[1]="[%IF_TEXT[",n):(-1!==o&&(n[0]=o+"%]".length,n[1]="%]"),n)}let i=[-1],s=0,o=t;do{if(i=r(0,o),-1!==i[0])switch(i[1]){case"[%WX_TEXT[":s++,o=i[0]+"[%WX_TEXT[".length;break;case"[%IF_TEXT[":s++,o=i[0]+"[%IF_TEXT[".length;break;case"%]":s--,o=i[0]}}while(-1!==i[0]&&s>0);return i[0]}wxtKeyResolver(e,t,r,i,s){let o=i||0;if(150===o)return _logger.error(`BaseServiceMock::wxtKeyResolver: Invalid template=${e} too many WX_TEXT keys - limit is 150 or even wrong WX_TEXT template for viewKey=${_viewKey}!`),"";if(!n.#isWXTextValid(e))return _logger.error(`BaseServiceMock::wxtKeyResolver: Invalid template=${e} wrong WX_TEXT or IF_TEXT configuration found: Open tags [%WX_TEXT[/\n                           [%IF_TEXT[ not matching closing tags %], please check text config for viewKey=${_viewKey}!`),"";if("string"==typeof e){let i=e.indexOf("[%WX_TEXT["),l=e.indexOf("[%IF_TEXT["),g="[%WX_TEXT[";-1!==l&&(l<i||-1===i)&&(g="[%IF_TEXT[",i=l);let a=n.#findWXTextEndTag(e,i);if(-1===i||-1===a)return e;if(a<i)return _logger.error(`BaseServiceMock::wxtKeyResolver: wxTxt='${e.substring(i,a)}' for template='${e}'\n                               seems to be not a valid wx text template for viewKey=${_viewKey}!`),"";let _,E=e.substring(i,a),c=E.substring(g.length,E.indexOf(";")-";".length),v=E.substring(E.indexOf(";")+";".length,E.indexOf("%]"));v.includes("[%")&&(v=`${v}%]`),0===E.indexOf("[%IF_TEXT[")&&0===c.indexOf("P,")?(_=this.propResolverFromConditional(c,r,s),_=!0===_?"":v):_=this.getTextValue(c,t),_=-1!==_?_:v,e=replaceAt(e,i,a,_),((e=this.propResolver(e,r,s)).includes("[%WX_TEXT[")||e.includes("[%IF_TEXT["))&&(o++,e=this.wxtKeyResolver(e,t,r,o,s))}else _logger.error(`BaseServiceMock::wxtKeyResolver: Invalid template=${e} which must be a string for viewKey=${_viewKey}!`),e="";return e}onResponse(t){try{_logger.log(_logger.LOG_SRVC_INOUT,`> BaseServiceMock::onResponse('${JSON.stringify(t)}')`),_logger.log(_logger.LOG_SRVC_INOUT,"< BaseServiceMock::onResponse")}catch(t){e.UI.Service.Provider.propagateError(this.NAME,this.ERROR_TYPE.EVENT,t)}}onRequest(t){try{if(_logger.LOG_SRVC_INOUT&&_logger.log(_logger.LOG_SRVC_INOUT,`> BaseServiceMock::onRequest('${JSON.stringify(t)}')`),this.requestMap.has(t.methodName)){let e=this.requestMap.get(t.methodName);e?e(t):_logger.LOG_SRVC_DATA&&_logger.log(_logger.LOG_SRVC_DATA,`. delegate for method '${t.methodName}' is null.`)}else _logger.LOG_SRVC_DATA&&_logger.log(_logger.LOG_SRVC_DATA,`. No callback found for method '${t.methodName}'.`);_logger.LOG_SRVC_INOUT&&_logger.log(_logger.LOG_SRVC_INOUT,"< BaseServiceMock::onRequest")}catch(t){e.UI.Service.Provider.propagateError(this.NAME,this.ERROR_TYPE.EVENT,t)}}onEvent(t){try{_logger.log(_logger.LOG_SRVC_INOUT,`> BaseServiceMock::onEvent('${JSON.stringify(t)}')`),_logger.log(_logger.LOG_SRVC_INOUT,"< BaseServiceMock::onEvent")}catch(t){e.UI.Service.Provider.propagateError(this.NAME,this.ERROR_TYPE.EVENT,t)}}sendEvent(t){if(e.toolingEDM){const e=s.getGateway();return t=e&&e.sendEvent(t)}return{}}};export default getServiceClass;