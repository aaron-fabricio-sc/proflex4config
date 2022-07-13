/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ wn.UI.Service.Provider.js 4.3.1-210127-21-34ae33df-1a04bc7d
*/
import{Wincor,jQuery,ext,LogProvider,GatewayProvider}from"../proxies/interfaces/BaseDependencies.js";import getBaseProxy from"../proxies/wn.UI.Service.BaseProxy.js";import{default as GetServiceProvider}from"./lib/ServiceProvider.js";export default GetServiceProvider({Wincor,jQuery,ext,LogProvider,BaseProxyClass:getBaseProxy({Wincor,ext,jQuery,LogProvider}),GatewayProvider});