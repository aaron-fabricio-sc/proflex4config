/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.

 $MOD$ LocalizeServiceInterface.js 4.3.1-210127-21-34ae33df-1a04bc7d
*/

import { default as getService } from "../../service/wn.UI.Service.LocalizeService.js";
import { Wincor, ext, PTService, LogProvider } from "./BaseDependencies.js";

const ServiceClass = getService({
    Wincor,
    ext,
    LogProvider,
    PTService
});

const ServiceInterface = {
    LocalizeProxy: {
        service: "../service/wn.UI.Service.LocalizeService.js",
        interface: {
            SERVICE_EVENTS: {
                type: "object",
                keys: ["LANGUAGE_CHANGED"],
                writable: false,
            },
            currentLanguage: {
                type: "string",
                writable: false,
            },
            getText: {
                type: "function",
                callbackArgumentIndex: 1,
            },
            setLanguage: {
                type: "function",
                callbackArgumentIndex: 1,
            },
            updateTexts: {
                type: "function",
            },
            getInstalledLanguages: {
                type: "function",
            },
            getLanguageMapping: {
                type: "function",
            },
            cleanTranslationTexts: {
                type: "function",
            },
        },
    },
};

export { ServiceInterface, ServiceClass };
