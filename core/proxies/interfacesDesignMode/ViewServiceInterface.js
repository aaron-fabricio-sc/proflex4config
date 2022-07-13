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

import { default as getService } from '../../servicemocks/wn.UI.Service.ViewServiceMock.js';
import { Wincor, jQuery, ext, BaseService, LogProvider } from "./BaseDependencies.js";

const ServiceClass = getService({
    jQuery,
    Wincor,
    BaseService,
    ext,
    LogProvider
});

const ServiceInterface = {
    ViewProxy: {
        interface: {
            viewContext: {
                type: 'object',
                keys: ['viewKey', 'viewURL', 'viewConfig', 'viewID']
            },
            SERVICE_EVENTS: {
                type: 'object',
                keys: [
                    'NAVIGATE_SPA',
                    'VIEW_CLOSING',
                    'VIEW_BEFORE_CHANGE',
                    'VIEW_PREPARED',
                    'TURN_ACTIVE',
                    'CONTENT_UPDATE',
                    'VIEW_ACTIVATED',
                    'VIEW_USERINTERACTION_TIMEOUT',
                    'STYLE_TYPE_CHANGED',
                    'POPUP_ACTIVATED',
                    'POPUP_DEACTIVATED',
                    'SHUTDOWN',
                    'SUSPEND',
                    'RESUME'
                ],
                writable: false
            },
            EVENT_UIRESULT: {
                type: 'object',
                keys: ['service', 'eventName', 'viewID', 'UIResult']
            },
            Expand_StringDefines: {
                attributes: [
                    'UIRESULT_OK',
                    'UIRESULT_TIMEOUT_USER',
                    'UIRESULT_CANCEL_USER',
                    'UIRESULT_CANCEL_SW',
                    'UIRESULT_ERROR_VIEW',
                    'UIRESULT_CANCEL_SW_ERROR'
                ],
                type: 'string',
                writable: false
            },
            Expand_Numbers: {
                attributes: [
                    'messageTimeout',
                    'immediateTimeout',
                    'endlessTimeout',
                    'confirmationTimeout',
                    'inputTimeout',
                    'pinentryTimeout'
                ],
                type: 'number',
                writable: false
            },
            Expand_Booleans: {
                attributes: ['cacheHTML'],
                type: 'boolean',
                writable: true
            },
            currentStyleType: {
                type: 'string'
            },
            currentStyleTypeByStylesheetKey: {
                type: 'string'
            },
            currentVendor: {
                type: 'string'
            },
            currentResolution: {
                type: 'string'
            },
            viewSetName: {
                type: 'string'
            },
            CONTENT_FRAME_NAME: {
                type: 'string'
            },
            isSuspended: {
                type: 'boolean',
                writable: false
            },
            Expand_StandardFunctions: {
                attributes: [
                    'display',
                    'prepare',
                    'activate',
                    'offlineHandling',
                    'endView',
                    'fireActivated',
                    'firePopupNotification',
                    'fireContentUpdated',
                    'firePrepared',
                    'refreshTimeout',
                    'getTimeoutValue',
                    'clearTimeout',
                    'setViewContext',
                    'loadViewSet',
                    'onError',
                    'cancel'
                ],
                type: 'function'
            },
            swapLocation: {
                type: 'function'
            },
            resizeWindow: {
                type: 'function',
                callbackArgumentIndex: 1,
                shadowValue: "if(window.top.resizeDM) { let o=arguments[0],cb=arguments[1];window.top.resizeDM(o.top, o.left, o.width, o.height);if (cb){cb()} } else if (typeof arguments[1] === 'function') { var cb = arguments[1]; window.setTimeout(cb, 1);}"
            },
            navigate: {
                type: 'function'
            },
            bringToFront: {
                type: 'function'
            },
            readConfiguration: {
                type: 'function'
            },
            getUsedProperties: {
                type: 'function'
            },
            suspend: {
                type: 'function'
            },
            resume: {
                type: 'function'
            },
            contentRunning: {
                type: 'boolean',
                writable: false,
                serviceEvent: true
            },
            updateJSONData: {
                type: 'function'
            },
            updateCurrent: {
                type: 'function'
            }
        }
    }
};

export { ServiceInterface, ServiceClass };
