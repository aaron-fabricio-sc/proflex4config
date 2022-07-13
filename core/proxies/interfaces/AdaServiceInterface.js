/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.

 $MOD$ AdaServiceInterface.js 4.3.1-210127-21-34ae33df-1a04bc7d
*/

import { default as getService } from "../../service/wn.UI.Service.AdaService.js";
import { Wincor, ext, PTService, LogProvider } from "./BaseDependencies.js";

const ServiceClass = getService({
    Wincor,
    ext,
    LogProvider,
    PTService,
});

const ServiceInterface = {
    AdaProxy: {
        entryPoints: ["adaCommand"],
        service: "../service/wn.UI.Service.AdaService.js",
        interface: {
            state: {
                type: "string",
            },
            STATE_VALUES: {
                type: "object",
                keys: ["DONOTHING", "BEREADY", "SPEAK"],
            },
            errorHappened: {
                type: "boolean",
            },
            isSpeaking: {
                type: "boolean",
                writable: false,
            },
            isAutoRepeatActive: {
                type: "boolean",
                writable: false,
            },
            SERVICE_EVENTS: {
                type: "object",
                keys: ["STATE_CHANGED", "ERROR_HAPPENED", "SPEAKING_STOPPED", "FIRST_START", "LAST_STOP"],
                writable: false,
            },
            speak: {
                type: "function",
                callbackArgumentIndex: 3,
            },
            increaseVolume: {
                type: "function",
                callbackArgumentIndex: 0,
            },
            decreaseVolume: {
                type: "function",
                callbackArgumentIndex: 0,
            },
            increaseRate: {
                type: "function",
                callbackArgumentIndex: 0,
            },
            decreaseRate: {
                type: "function",
                callbackArgumentIndex: 0,
            },
            setRepeatText: {
                type: "function",
                callbackArgumentIndex: 1,
            },
            autoRepeat: {
                type: "function",
                callbackArgumentIndex: 1,
            },
            externalAdaCommandAck: {
                type: "function",
            },
            switchToApp: {
                type: "function",
            },
        },
    },
};

export { ServiceInterface, ServiceClass };
