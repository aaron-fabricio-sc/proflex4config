/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany
 
 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.
 
 
 $MOD$ wn.UI.GatewayProvider.js 4.3.1-210127-21-34ae33df-1a04bc7d
 
*/
let PROVIDER;const getGatewayProvider=({Wincor:e,LogProvider:t,Websocket:a}={})=>{const r=t;let o=null,y=!1,G=[],_=[];const O="WEBSOCKET";return PROVIDER=PROVIDER||new class{GATEWAY_TYPE_WEBSOCKET=O;constructor(){this.GATEWAY_TYPE_WEBSOCKET=O}getGateway(){return o}setGateway(e){null!==o&&null===e&&o.setConnectionReady(!1),o=e}createGateway(e){r.LOG_SRVC_INOUT&&r.log(r.LOG_SRVC_INOUT,`> GatewayProvider::createGateway() options: ${e?e.toString():"undefined"}`);let t=localStorage.getItem("gatewayType"),y=localStorage.getItem("gatewayWebSocketPort"),G=localStorage.getItem("gatewayHsID");t||(t=O);const _=Object.assign({type:t},e||{});return o||(r.LOG_SRVC_DATA&&r.log(r.LOG_SRVC_DATA,`. gateway-type=${_.type}`),_.type===O?(o=new a,o.GATEWAY_TYPE=t,y&&(r.LOG_SRVC_DATA&&r.log(r.LOG_SRVC_DATA,`Setting webSocketPort to ${y}`),o.socketPort=y),G&&(o.hsID=G)):r.error(`Wincor.UI.Gateway.GatewayProvider(createGateway): unknown _gateway type '${_.type}'.`)),o?(o.registerConnectionReadyHandler(this.onReady.bind(this)),o.registerConnectionLostHandler(this.onClose.bind(this))):(r.error(`The gateway of type=${_.type} could not been created!`),o=null),r.LOG_SRVC_INOUT&&r.log(r.LOG_SRVC_INOUT,"< GatewayProvider::createGateway"),o}destroyGateway(e){r.LOG_SRVC_INOUT&&r.log(r.LOG_SRVC_INOUT,"> GatewayProvider::destroyGateway()"),o?o.destroyBridge(e):(o=null,e&&e()),r.LOG_SRVC_INOUT&&r.log(r.LOG_SRVC_INOUT,"< GatewayProvider::destroyGateway")}isConnected(){return y}fireReady(){for(r.LOG_SRVC_INOUT&&r.log(r.LOG_SRVC_INOUT,"> GatewayProvider::fireReady()");_[0];)_.shift().apply(e.UI.Gateway.GatewayProvider,[]);r.LOG_SRVC_INOUT&&r.log(r.LOG_SRVC_INOUT,"< GatewayProvider::fireReady")}fireClose(){for(r.LOG_SRVC_INOUT&&r.log(r.LOG_SRVC_INOUT,"> GatewayProvider::fireClose()");G[0];)G.shift().apply(e.UI.Gateway.GatewayProvider,[]);r.LOG_SRVC_INOUT&&r.log(r.LOG_SRVC_INOUT,"< GatewayProvider::fireClose")}registerReadyHandler(e){r.LOG_SRVC_INOUT&&r.log(r.LOG_SRVC_INOUT,"> GatewayProvider::registerReadyHandler()"),_.push(e),r.LOG_SRVC_INOUT&&r.log(r.LOG_SRVC_INOUT,"< GatewayProvider::registerReadyHandler")}registerClosedHandler(e){r.LOG_SRVC_INOUT&&r.log(r.LOG_SRVC_INOUT,"> GatewayProvider::registerClosedHandler()"),G.push(e),r.LOG_SRVC_INOUT&&r.log(r.LOG_SRVC_INOUT,"< GatewayProvider::registerClosedHandler")}onReady(){y=!0,this.fireReady()}onClose(){y=!1,this.fireClose()}},e.UI.Gateway.GatewayProvider=e.UI.Gateway.GatewayProvider||PROVIDER,PROVIDER};export default getGatewayProvider;