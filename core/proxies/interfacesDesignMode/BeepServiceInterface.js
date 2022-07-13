/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.

 $MOD$ BeepServiceInterface.js 4.3.1-210127-21-34ae33df-1a04bc7d
*/

import { default as getService } from "../../servicemocks/wn.UI.Service.BeepServiceMock.js";
import { ext, BaseService } from "./BaseDependencies.js";

const ServiceClass = getService({
    BaseService,
    ext
});

const ServiceInterface = {
    BeepProxy: {
        service: "../service/wn.UI.Service.BeepService.js",
        interface: {
            beeping: {
                type: "boolean",
                writable: false
            },
            beepInactiveKeyCode: {
                type: "number",
                writable: false
            },
            beep: {
                type: "function",
                callbackArgumentIndex: 1
            }
        }
    }
};

export { ServiceInterface, ServiceClass };
