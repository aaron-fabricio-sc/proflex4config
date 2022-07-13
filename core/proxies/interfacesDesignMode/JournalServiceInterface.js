/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.

 $MOD$ JournalServiceInterface.js 4.3.1-210127-21-34ae33df-1a04bc7d
*/

import { default as getService } from "../../servicemocks/wn.UI.Service.JournalServiceMock.js";
import { ext, BaseService, LogProvider } from "./BaseDependencies.js";

const ServiceClass = getService({
    BaseService,
    ext,
    LogProvider
});

const ServiceInterface = {
    JournalProxy: {
        service: "../service/wn.UI.Service.JournalService.js",
        interface: {
            MSG_NUMBERS: {
                type: "object",
                keys: [
                    "MSG_AJAX_REQUEST",
                    "MSG_VIEW_DISPLAY",
                    "MSG_VIEW_INTERACTION",
                    "MSG_VIEW_RESULT",
                    "MSG_BROWSER_VERSION",
                ],
                writable: false,
            },
            write: {
                type: "function",
                callbackArgumentIndex: 1,
            },
        },
    },
};

export { ServiceInterface, ServiceClass };
