/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany
 
 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.
 
 
 $MOD$ wn.UI.Gateway.WebSocket.js 4.3.1-210127-21-34ae33df-1a04bc7d
 
*/
const getWebSocket=({Wincor:e,ext:t,Gateway:s}={})=>{const o="ws://127.0.0.1:",n="WEBSOCKET";return e.UI.Gateway.Websocket=class extends s{socketPort=8091;socketURL=o;socketURI=null;onMessageReceiver=null;establishConnectionPromise=null;hsID=0;constructor(e="WEBSOCKET",s){super(),this.GATEWAY_TYPE_WEBSOCKET=n,this.establishConnectionPromise=t.Promises.Promise.resolve(),this.setName(e),this.socketPort=8091,this.socketURL=o,this.socketURI=null,this.onMessageReceiver=s}establishConnection(){return this.establishConnectionPromise.isPending()||(this.establishConnectionPromise=new t.Promises.Promise(((e,t)=>{try{let s=this.socketURI||this.socketURL+this.socketPort,o=new WebSocket(s),n=this.setBridge(o);n.established=e,n.connectionFailed=t,o.onopen=this.onOpen.bind(this),o.onclose=this.onClose.bind(this),o.onerror=this.onError.bind(this),this.onMessageReceiver&&"function"==typeof this.onMessageReceiver?o.onmessage=this.onMessageReceiver:o.onmessage=this.onMessage.bind(this)}catch(e){t(e)}}))),this.establishConnectionPromise}destroyConnection(t){let s=this.getSocket();s&&s.close?(s.onclose=()=>{this.onClose(`destroyConnection ${this.gatewayName} invoked`),e.UI.Gateway.GatewayProvider.setGateway(null),t&&t()},this.isSocketOk()?s.close():e.UI.Gateway.GatewayProvider.setGateway(null)):e.UI.Gateway.GatewayProvider.setGateway(null)}async onOpen(e){console.log("WebSocket has been opened"),super.onOpen(e);let t=this.getBridge();if(t){if(t.established(),0!==this.hsID){let e={};e.hsID=this.hsID;let s=this.posttranslateOutgoingMessage(e);t.socket.send(s),this.hsID=0}t.dataTobeSend.length&&(t.dataTobeSend.forEach((e=>{let s=this.posttranslateOutgoingMessage(e);t.socket.send(s)})),t.dataTobeSend.length=0)}}onClose(e){console.log("WebSocket has been closed"),super.onClose(e)}onError(e){let t=this.getBridge();t&&t.connectionFailed(),super.onError(e)}isSocketOk(){let e=this.getBridge();return e&&e.socket.readyState===e.socket.OPEN}async checkConnection(){let e=this.isSocketOk();if(!e)try{await this.establishConnection(),e=this.isSocketOk()}catch(e){console.error(e)}return e}pretranslateIncomingMessage(e){return JSON.parse(e.data)}posttranslateOutgoingMessage(e){return JSON.stringify(e)}send(e){if(this.isSocketOk())super.send(e);else{let t=this.getBridge();t&&t.dataTobeSend.push(e),setTimeout((()=>{this.checkConnection().then((()=>{console.log("WebSocket::send Connection reestablished after connection lost")})).catch((e=>{console.error(e)}))}),5e3)}}}};export default getWebSocket;