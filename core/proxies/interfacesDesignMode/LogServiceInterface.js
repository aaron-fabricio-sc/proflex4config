/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.

 $MOD$ LogServiceInterface.js 4.3.1-210127-21-34ae33df-1a04bc7d
*/

import { default as getService } from "../../servicemocks/wn.UI.Service.LogServiceMock.js";
import { BaseService, GatewayProvider} from "./BaseDependencies.js";


const ServiceClass = getService({
    BaseService,
    GatewayProvider
});

const ServiceInterface = {
    LogProxy: {
        interface: {
            log: {
                type: "function",
                traceable: false,
            },
            error: {
                type: "function",
                traceable: false,
            },
            isTraceBitSet: {
                type: "function",
                traceable: false,
            },
            registerTraceBitsChangedHandler: {
                type: "function",
                traceable: false,
            },
            readCurrentTraceBitStates: {
                type: "function",
                traceable: false,
                callbackArgumentIndex: 0,
            },
            TYPE: {
                type: "string",
                writable: false,
            },
        },
    },
};

export { ServiceInterface, ServiceClass };
