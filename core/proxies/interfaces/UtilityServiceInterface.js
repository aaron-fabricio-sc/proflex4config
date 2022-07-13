/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.

 $MOD$ UtilityServiceInterface.js 4.3.1-210127-21-34ae33df-1a04bc7d
*/

import { default as getService } from '../../service/wn.UI.Service.UtilityService.js';
import { Wincor, ext, PTService, LogProvider } from "./BaseDependencies.js";

const ServiceClass = getService({
    Wincor,
    ext,
    LogProvider,
    PTService
});

const ServiceInterface = {
    UtilityProxy: {
        service: '../service/wn.UI.Service.UtilityService.js',
        interface: {
            SERVICE_EVENTS: {
                type: 'object',
                keys: ['SESSION_END'],
                writable: false
            },
            PATHS: {
                type: 'object',
                writable: false
            },
            WORKING_DIRS: {
                type: 'object',
                writable: false
            },
            setTransparentWindowColor: {
                type: 'function'
            },
            removeTransparentWindowColor: {
                type: 'function'
            },
            saveImageToFile: {
                type: 'function'
            },
            callFlow: {
                type: 'function'
            },
            runAction: {
                type: 'function'
            },
            addTraceFilter: {
                type: 'function'
            },
            dmStop: {
                type: 'function'
            },
            getDeviceState: {
                type: 'function'
            },
            DEVICE_STATE: {
                type: 'object',
                writable: false
            },
            INSTALL_STATE: {
                type: 'object',
                writable: false
            }
        }
    }
};

export { ServiceInterface, ServiceClass };
