/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.

 $MOD$ ViewServiceInterfaceHeadless.js 4.3.1-210203-21-60d725a2-1a04bc7d
*/

// load and extend ViewService

import { default as getService } from "../../service/wn.UI.Service.ViewServiceHeadless.js";
import { Wincor, jQuery, LogProvider } from "./BaseDependencies.js";
import { ServiceInterface as ViewServiceInterface, ServiceClass as ViewService } from "./ViewServiceInterface.js";

const ServiceClass = getService({
    Wincor,
    LogProvider,
    ViewService
});

const ServiceInterface = jQuery.extend(true, {}, ViewServiceInterface, {
    ViewProxy: {
        interface: {
            ViewActionMap: {
                type: "object"
            },
            activatePF4: {
                type: "function"
            },
            deactivatePF4: {
                type: "function"
            },
            confirmDisplay: {
                type: "function"
            },
            shutdown: {
                type: "function"
            }
        }
    }
});

export { ServiceInterface, ServiceClass };
