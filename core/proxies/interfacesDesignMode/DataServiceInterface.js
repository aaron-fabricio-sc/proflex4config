/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.

 $MOD$ DataServiceInterface.js 4.3.1-210212-21-06af7f4f-1a04bc7d
*/

import { default as getService } from "../../servicemocks/wn.UI.Service.DataServiceMock.js";
import { Wincor, BaseService, LogProvider } from "./BaseDependencies.js";

const ServiceClass = getService({
    Wincor,
    BaseService,
    LogProvider
});

const ServiceInterface = {
    DataProxy: {
        interface: {
            SERVICE_EVENTS: {
                type: "object",
                keys: ["DATA_CHANGED"],
                writable: false
            },
            getPropertyKeyMap: {
                type: "function"
            },
            getDataRegistrations: {
                type: "function"
            },
            getValues: {
                type: "function",
                callbackArgumentIndex: 1
            },
            setValues: {
                type: "function",
                callbackArgumentIndex: 2
            },
            updateValues: {
                type: "function"
            },
            businessData: {
                type: "object",
                writable: false
            },
            getPropertyString: {
                comment: "This is only for  being able to test the function without application, normally designMode does not need it...",
                type: "function",
                external: true,
                internal: true
            },
            propResolver: {
                type: "function"
            },
            getPropValue: {
                type: "function"
            },
            updateJSONData: {
                type: "function"
            },
            setPropertyHandler: {
                type: "function"
            }
        }
    }
};

export { ServiceInterface, ServiceClass };
