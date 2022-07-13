/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.

 $MOD$ PF4UICore.js 4.3.1-201211-21-586b0f0c-1a04bc7d
*/

/**
 * @module
 * @since 4.3.0
 */

// eslint-disable-next-line no-unused-vars
import { default as jQuery } from "../lib/jquery-global.js";
// eslint-disable-next-line no-unused-vars
import { default as Class } from "../lib/class.system.js";

import { default as ServiceProvider } from "./service/wn.UI.Service.Provider.js";
import { Wincor, GatewayProvider, ext as extensions } from "./proxies/interfaces/BaseDependencies";
import { ServiceBundle, InterfaceGeneral } from "./proxies/wn.UI.Service.InterfacesHeadless.js";
const preLog = "services.js - ";

let initialized = false;

console.log(`${preLog} args: ${location.search}`);

const gatewayType = "WEBSOCKET";
console.log(`${preLog} setting gatewayType to ${gatewayType}`);
localStorage.setItem("gatewayType", gatewayType);

function getQueryStringValue(key) {
    //returns the parameter value from the query string of the URL
    key = key.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    let regex = new RegExp("[\\?&]" + key + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

let gatewayWebSocketPort;
gatewayWebSocketPort = getQueryStringValue("gatewayWebSocketPort");
// only if configured and number > 0
if (gatewayWebSocketPort) {
    console.log(`${preLog} setting gatewayWebSocketPort to ${gatewayWebSocketPort}`);
    localStorage.setItem("gatewayWebSocketPort", gatewayWebSocketPort);
}

let gatewayHsID;
gatewayHsID = getQueryStringValue("gatewayHsID");

// only if configured and number > 0
if (gatewayHsID) {
    localStorage.setItem("gatewayHsID", gatewayHsID);
}

/**
 *
 * @param {String} [assetUrl="assets/pf4-ui-core/GUIAPP/"] Base URL to use for servicedata config files
 * @async
 */
const initialize = async(assetUrl = "assets/pf4-ui-core/GUIAPP/") => {
    try {
        if (!initialized) {
            Wincor.applicationMode = true;
            Wincor.applicationRoot = getQueryStringValue("applicationRoot");
            initialized = true;
            let gateway = GatewayProvider.createGateway();
            return new Promise((resolve, reject) => {
                gateway.registerConnectionReadyHandler(async() => {
                    console.log(`${preLog} services.js Gateway connected`);
                    ServiceProvider.setBaseUrl(assetUrl);
                    console.log(`${preLog} Loading services: `);
                    try {
                        let { init: initializationPromise } = await ServiceProvider.loadServices(ServiceBundle, InterfaceGeneral);
                        console.log(`${preLog} Generating proxies / creating services ready for: ${ServiceProvider.serviceNames}`);
                        await initializationPromise;
                        console.log(`${preLog} Services initialized`);
                        resolve(ServiceProvider);
                    } catch (e) {
                        reject(`ServiceProvider loadServices or initialize services failed: ${e}`);
                    }
                });
                console.log(`${preLog} Connecting...`);
                gateway.establishConnection();
            });
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
    return ServiceProvider;
};

export { initialize, ServiceProvider, extensions };
