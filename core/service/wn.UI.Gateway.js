/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany
 
 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.
 
 
 $MOD$ wn.UI.Gateway.js 4.3.1-210203-21-1b8704b6-1a04bc7d
 
*/
const getGateway=({Wincor:e,LogProvider:t}={})=>{const a=t;let o="request",s="response",n="event",i={service:""},r=[],g=[],c=new Map,y=function(e){this.name=e,this.socket=null,this.ready=!1,this.requestIdx=0,this.established=()=>{},this.connectionFailed=()=>{},this.dataTobeSend=[]};return e.UI.Gateway=class{gatewayName="";GATEWAY_TYPE=null;REQUEST=Object.assign(Object.assign({},i),{type:o,methodName:"",callbackIdx:-1});RESPONSE=Object.assign(Object.assign({},i),{type:s,methodName:"",result:""});EVENT=Object.assign(Object.assign({},i),{type:n,eventName:""});constructor(){a.LOG_DETAIL&&a.log(a.LOG_DETAIL,`> Gateway::Gateway for ${this.gatewayName}`),a.LOG_DETAIL&&a.log(a.LOG_DETAIL,"< Gateway::Gateway")}getBridge(e=this.gatewayName){return c.get(e)}getSocket(e=this.gatewayName){let t=c.get(e);return t?t.socket:null}setBridge(e){let t=null;return"object"==typeof e&&e.url&&(c.has(this.gatewayName)?(t=c.get(this.gatewayName),t&&(1===t.socket.readyState&&t.socket.close&&t.socket.close(4e3,{socket:"setBridge: Has been closed due to a new WebSocket opening."}),t.socket=e)):(t=new y,t.name=this.gatewayName,t.socket=e,c.set(this.gatewayName,t))),t}destroyBridge(e){this.destroyConnection(e)}destroyConnection(e){throw"not supported"}establishConnection(){throw"not supported"}pretranslateIncomingMessage(e){return e}posttranslateOutgoingMessage(e){return e}sendRequest(e,t){if(this.isConnected()){let a=this.getBridge();a.requestIdx++,e.callbackIdx=a.requestIdx,e.type=o,t&&t(e.callbackIdx),this.send(e)}else a.error("Wincor.UI.Gateway(sendRequest): no connection!");return e}sendResponse(e,t){return this.isConnected()?(e.result=t,e.type=s,this.send(e)):a.error("Wincor.UI.Gateway(sendResponse): no connection!"),e}sendEvent(e){return e.type=n,this.send(e),e}send(e){let t=this.posttranslateOutgoingMessage(e),a=this.getBridge();a&&a.socket.send(t)}isConnected(){let e=this.getBridge();return e&&e.ready}setConnectionReady(e){let t=this.getBridge();t&&(t.ready=e)}setName(e){this.gatewayName=e}getName(){return this.gatewayName}registerConnectionReadyHandler(e){a.LOG_DETAIL&&a.log(a.LOG_DETAIL,"> Gateway::registerConnectionReadyHandler(...)"),r.push(e),a.LOG_DETAIL&&a.log(a.LOG_DETAIL,"< Gateway::registerConnectionReadyHandler")}registerConnectionLostHandler(e){a.LOG_DETAIL&&a.log(a.LOG_DETAIL,"> Gateway::registerConnectionLostHandler(...)"),g.push(e),a.LOG_DETAIL&&a.log(a.LOG_DETAIL,"< Gateway::registerConnectionLostHandler")}fireConnectionReady(){if(a.LOG_DETAIL&&a.log(a.LOG_DETAIL,`> Gateway::fireConnectionReady() for ${this.gatewayName}`),r&&this.gatewayName===this.GATEWAY_TYPE_WEBSOCKET)for(let e=0;e<r.length;e++)r[e].apply(this,[]);else a.LOG_DETAIL&&a.log(a.LOG_DETAIL,`. Gateway::fireConnectionReady not allowed for ${this.gatewayName}`);a.LOG_DETAIL&&a.log(a.LOG_DETAIL,"< Gateway::fireConnectionReady")}fireConnectionLost(){if(a.LOG_DETAIL&&a.log(a.LOG_DETAIL,`> Gateway::fireConnectionLost() for ${this.gatewayName}`),g&&this.gatewayName===this.GATEWAY_TYPE_WEBSOCKET)for(let e=0;e<g.length;e++)g[e].apply(this,[]);else a.LOG_DETAIL&&a.log(a.LOG_DETAIL,`. Gateway::fireConnectionLost not allowed for ${this.gatewayName}`);a.LOG_DETAIL&&a.log(a.LOG_DETAIL,"< Gateway::fireConnectionLost")}onMessage(t){try{if(this.gatewayName===this.GATEWAY_TYPE){let i=this.pretranslateIncomingMessage(t);if(e.UI.Service.Provider.hasService(i.service)){let t=e.UI.Service.Provider[i.service];if(null!==t)switch(i.type){case o:t.onRequest(i);break;case s:t.onResponse(i);break;case n:t.onEvent(i);break;default:a.error(`Wincor.UI.Gateway::onMessage for ${this.gatewayName} - unknown type '${i.type}'.`)}else a.error(`Wincor.UI.Gateway::onMessage for ${this.gatewayName} - delegate for service '${i.service}' is null.`)}else i.hasOwnProperty("providerMethod")?(console.log(`Wincor.UI.Gateway::onMessage - ServiceProvider message = ${JSON.stringify(i)}`),e.UI.Service.Provider[i.providerMethod](i)):console.log(`Wincor.UI.Gateway::onMessage for ${this.gatewayName} - No delegate found for service '${i.service}'.`)}}catch(e){setTimeout((()=>{try{a.error(`Exception in Gateway::onMessage for ${this.gatewayName}! \n ${e.message}`)}finally{throw e}}),1)}}onOpen(e){a.LOG_DETAIL&&a.log(a.LOG_DETAIL,`> Gateway::onOpen for ${this.gatewayName}: ('${JSON.stringify(e)}')`),this.setConnectionReady(!0),setTimeout(this.fireConnectionReady.bind(this),1),a.LOG_DETAIL&&a.log(a.LOG_DETAIL,"< Gateway::onOpen")}onClose(e){a.LOG_DETAIL&&a.log(a.LOG_DETAIL,`> Gateway::onClose for ${this.gatewayName}: ('${JSON.stringify(e)}')`),this.setConnectionReady(!1),setTimeout(this.fireConnectionLost.bind(this),1),a.LOG_DETAIL&&a.log(a.LOG_DETAIL,"< Gateway::onClose")}onError(e){a.error(`Wincor.UI.Gateway::onError for ${this.gatewayName} - bridge error: '${JSON.stringify(e)}'.`),this.setConnectionReady(!1),setTimeout(this.fireConnectionLost.bind(this),1)}}};export default getGateway;