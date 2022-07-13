/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.

 $MOD$ EppServiceInterface.js 4.3.1-210127-21-34ae33df-1a04bc7d
*/

import { default as getService } from "../../service/wn.UI.Service.EppService.js";
import { Wincor, jQuery, PTService, LogProvider } from "./BaseDependencies.js";

const ServiceClass = getService({
    Wincor,
    jQuery,
    LogProvider,
    PTService
});

const ServiceInterface = {
    EppProxy: {
        service: "../service/wn.UI.Service.EppService.js",
        interface: {
            Expand_StringDefines: {
                attributes: [
                    "BUTTONEPP_F1",
                    "BUTTONEPP_F2",
                    "BUTTONEPP_F3",
                    "BUTTONEPP_F4",
                    "BUTTONEPP_F5",
                    "BUTTONEPP_F6",
                    "BUTTONEPP_F7",
                    "BUTTONEPP_F8",
                    "BUTTONEPP_F9",
                    "BUTTONEPP_0",
                    "BUTTONEPP_1",
                    "BUTTONEPP_2",
                    "BUTTONEPP_3",
                    "BUTTONEPP_4",
                    "BUTTONEPP_5",
                    "BUTTONEPP_6",
                    "BUTTONEPP_7",
                    "BUTTONEPP_8",
                    "BUTTONEPP_9",
                    "BUTTONEPP_CONFIRM",
                    "BUTTONEPP_CANCEL",
                    "BUTTONEPP_HELP",
                    "BUTTONEPP_CLEAR",
                    "BUTTONEPP_BACKSPACE",
                    "BUTTONEPP_STAR",
                    "BUTTONEPP_CORRECT",
                    "BUTTONEPP_EDIT",
                    "BUTTONEPP_R",
                    "BUTTONEPP_L",
                    "CLAIMSTATUS_DENIED",
                    "CLAIMSTATUS_ENABLED",
                    "CLAIMSTATUS_DISABLED",
                    "CLAIMSTATUS_DENIED_BUT_ENABLED",
                    "CLAIMSTATUS_DENIED_BUT_DISABLED"
                ],
                type: "string",
                writable: false
            },
            SERVICE_EVENTS: {
                type: "object",
                keys: ["CLAIM_STATUS_CHANGED"],
                writable: false
            },
            claimKeys: {
                type: "function",
                callbackArgumentIndex: 2
            },
            releaseKeys: {
                type: "function",
                callbackArgumentIndex: 1
            },
            getNumberOfFDKs: {
                type: "function"
            }
        }
    }
};

export { ServiceInterface, ServiceClass };
