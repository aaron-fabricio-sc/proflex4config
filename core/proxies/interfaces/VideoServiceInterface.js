/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.

 $MOD$ VideoServiceInterface.js 4.3.1-210127-21-34ae33df-1a04bc7d
*/

import { default as getService } from "../../service/wn.UI.Service.VideoService.js";
import { Wincor, ext, PTService, LogProvider } from "./BaseDependencies.js";

const ServiceClass = getService({
    Wincor,
    ext,
    LogProvider,
    PTService
});

const ServiceInterface = {
    VideoProxy: {
        service: "../service/wn.UI.Service.VideoService.js",
        interface: {
            increaseVolume: {
                type: "function",
                callbackArgumentIndex: 1,
            },
            decreaseVolume: {
                type: "function",
                callbackArgumentIndex: 1,
            },
            mute: {
                type: "function",
                callbackArgumentIndex: 0,
            },
            unmute: {
                type: "function",
                callbackArgumentIndex: 0,
            },
        },
    },
};

export { ServiceInterface, ServiceClass };
