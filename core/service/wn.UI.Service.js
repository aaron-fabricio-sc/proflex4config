/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.

$MOD$ wn.UI.Service.js 4.3.1-210127-21-34ae33df-1a04bc7d
*/
import{default as Wincor}from"./wn.UI";import{default as LogProvider}from"./wn.UI.Diagnostics.LogProvider";import getExtensions from"../../lib/internal/wn.UI.extensions.js";import getBaseService from"./lib/BaseService.js";import getGateway from"../service/wn.UI.Gateway.js";import getWebSocket from"../service/wn.UI.Gateway.WebSocket.js";import getGatewayProvider from"../service/wn.UI.GatewayProvider.js";const jQuery=window.jQuery,ext=getExtensions({Wincor,LogProvider}),Gateway=getGateway({Wincor,LogProvider}),Websocket=getWebSocket({Wincor,ext,Gateway}),GatewayProvider=getGatewayProvider({Wincor,LogProvider,Websocket}),BaseService=getBaseService({Wincor,ext,jQuery,LogProvider,GatewayProvider});export default BaseService;