/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.

 $MOD$ ValidateServiceInterface.js 4.3.1-210127-21-34ae33df-1a04bc7d
*/

import { default as getService } from "../../servicemocks/wn.UI.Service.ValidateServiceMock.js";
import { ext, BaseService, LogProvider } from "./BaseDependencies.js";

const ServiceClass = getService({
    BaseService,
    ext,
    LogProvider
});

const ServiceInterface = {
    ValidateProxy: {
        service: "../service/wn.UI.Service.ValidateService.js",
        interface: {
            Expand_StandardFunctions: {
                attributes: [
                    "isNumbers",
                    "isChars",
                    "isEmail",
                    "isDateFormat",
                    "isDateInRange",
                    "isInRange",
                    "isMin",
                    "isMax",
                    "isStepLen",
                    "isWithinMinLength",
                    "isWithinMaxLength",
                    "isWithinLength",
                    "checkLeadingZero",
                    "matchesForbiddenPattern",
                ],
                type: "function",
            },
        },
    },
};

export { ServiceInterface, ServiceClass };
