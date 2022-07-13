/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany
 
 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.
 
 $MOD$ ControlPanelServiceInterface.js 4.3.1-210127-21-34ae33df-1a04bc7d
 */

import {default as getService} from '../../servicemocks/wn.UI.Service.ControlPanelServiceMock.js';
import {Wincor, ext, BaseService, LogProvider } from "./BaseDependencies.js";

const ServiceClass = getService({
    Wincor,
    ext,
    BaseService,
    LogProvider
});


const ServiceInterface = {
    "ControlPanelProxy": {
        "service": "../servicemocks/wn.UI.Service.ControlPanelServiceMock.js",
        "interface": {
            "SERVICE_EVENTS": {
                "type": "object",
                "keys": [
                    "NEW_TIMEOUT"
                ],
                "writable": false
            },
            "setControlPanel": {
                "type": "function"
            },
            "getControlPanel": {
                "type": "function"
            },
            "getContext": {
                "type": "function"
            },
            "updateBusinessProperties": {
                "type": "function"
            },
            "newTimerStarted": {
                "type": "function"
            }
        }
    }
};

export {ServiceInterface, ServiceClass};
