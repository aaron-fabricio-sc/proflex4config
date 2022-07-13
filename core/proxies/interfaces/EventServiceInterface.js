/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.

 $MOD$ EventServiceInterface.js 4.3.1-210127-21-34ae33df-1a04bc7d
*/

import { default as getService } from '../../service/wn.UI.Service.EventService.js';
import { Wincor, ext, PTService, LogProvider } from "./BaseDependencies.js";
import { default as EventInfoList } from '../../servicedata/EventInfoList.json';

const ServiceClass = getService({
    Wincor,
    ext,
    LogProvider,
    PTService,
    EventInfoList
});

const ServiceInterface = {
    EventProxy: {
        service: '../service/wn.UI.Service.EventService.js',
        interface: {
            registerForEvent: {
                type: 'function'
            },
            deregisterEvent: {
                type: 'function',
                callbackArgumentIndex: 1
            },
            getEventInfo: {
                type: 'function'
            }
        }
    }
};

export { ServiceInterface, ServiceClass };
