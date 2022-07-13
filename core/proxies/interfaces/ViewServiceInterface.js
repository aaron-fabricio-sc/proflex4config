/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.

 $MOD$ ViewServiceInterface.js 4.3.1-210127-21-34ae33df-1a04bc7d
*/

import { default as getService } from "../../service/wn.UI.Service.ViewService.js";
import { Wincor, jQuery, ext, PTService, LogProvider } from "./BaseDependencies.js";

const ServiceClass = getService({
    Wincor,
    jQuery,
    ext,
    LogProvider,
    PTService
});

const ServiceInterface = {
    ViewProxy: {
        interface: {
            viewContext: {
                type: "object",
                keys: ["viewKey", "viewURL", "viewConfig", "viewID"],
            },
            EVENT_UIRESULT: {
                type: "object",
                keys: ["service", "eventName", "viewID", "UIResult"],
            },
            SERVICE_EVENTS: {
                type: "object",
                keys: [
                    "NAVIGATE_SPA",
                    "VIEW_CLOSING",
                    "VIEW_BEFORE_CHANGE",
                    "VIEW_PREPARED",
                    "TURN_ACTIVE",
                    "CONTENT_UPDATE",
                    "VIEW_ACTIVATED",
                    "VIEW_USERINTERACTION_TIMEOUT",
                    "STYLE_TYPE_CHANGED",
                    "POPUP_ACTIVATED",
                    "POPUP_DEACTIVATED",
                    "REFRESH_TIMEOUT",
                    "SHUTDOWN",
                    "SUSPEND",
                    "RESUME",
                    "LOCATION_CHANGED",
                ],
                writable: false,
            },
            Expand_StringDefines: {
                attributes: [
                    "UIRESULT_OK",
                    "UIRESULT_TIMEOUT_USER",
                    "UIRESULT_CANCEL_USER",
                    "UIRESULT_CANCEL_SW",
                    "UIRESULT_ERROR_VIEW",
                    "UIRESULT_CANCEL_SW_ERROR",
                ],
                type: "string",
                writable: false,
            },
            Expand_Booleans: {
                attributes: [
                    "cacheHTML",
                    "contentRunning",
                ],
                type: "boolean",
                writable: false,
            },
            currentStyleType: {
                type: "string",
            },
            currentStyleTypeByStylesheetKey: {
                type: "string",
            },
            currentVendor: {
                type: "string",
            },
            currentResolution: {
                type: "string",
            },
            viewSetName: {
                type: "string",
            },
            Expand_StandardFunctions: {
                attributes: [
                    "offlineHandling",
                    "endView",
                    "fireActivated",
                    "firePopupNotification",
                    "fireContentUpdated",
                    "firePrepared",
                    "refreshTimeout",
                    "getTimeoutValue",
                    "clearTimeout",
                    "setViewContext",
                    "onError",
                    "loadViewSet",
                ],
                type: "function",
            },
            Expand_Numbers: {
                attributes: [
                    "messageTimeout",
                    "immediateTimeout",
                    "endlessTimeout",
                    "confirmationTimeout",
                    "inputTimeout",
                    "pinentryTimeout",
                ],
                type: "number",
                writable: false,
            },
            resizeWindow: {
                type: "function",
                callbackArgumentIndex: 1,
            },
            swapLocation: {
                type: "function",
            },
            getLocation: {
                type: "function",
            },
            initialLocation: {
                type: "object",
                writable: false,
                crossCall: true,
            },
            bringToFront: {
                type: "function",
                callbackArgumentIndex: 1,
            },
            navigate: {
                type: "function",
            },
            display: {
                type: "function",
                external: true,
                internal: false,
            },
            cancel: {
                type: "function",
                external: true,
                internal: false,
            },
            prepare: {
                type: "function",
                external: true,
                internal: false,
            },
            activate: {
                type: "function",
                external: true,
                internal: false,
            },
            resetUserInteractionTimeout: {
                type: "function",
                external: true,
                internal: false,
            },
            suspend: {
                type: "function",
                crossCall: true,
            },
            resume: {
                type: "function",
                crossCall: true,
            },
            addStyle: {
                type: "function",
                crossCall: true,
            },
            removeStyle: {
                type: "function",
                crossCall: true,
            },
            readConfiguration: {
                type: "function",
                external: true,
                internal: false,
            },
            contentRunning: {
                type: "boolean",
                writable: false,
                crossCall: true,
                serviceEvent: true,
            },
        },
    },
};

export { ServiceInterface, ServiceClass };
