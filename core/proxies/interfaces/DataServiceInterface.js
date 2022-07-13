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

import { default as getService } from "../../service/wn.UI.Service.DataService.js";
import { Wincor, ext, PTService, LogProvider } from "./BaseDependencies.js";
import { default as BusinessPropertyKeyMap } from "../../servicedata/BusinessPropertyKeyMap.json";
import { default as BusinessPropertyCustomKeyMap } from "../../servicedata/BusinessPropertyCustomKeyMap.json";
import { default as UIPropertyKeyMap } from "../../servicedata/UIPropertyKeyMap.json";

const ServiceClass = getService({
    Wincor,
    ext,
    LogProvider,
    PTService,
    UIPropertyKeyMap,
    BusinessPropertyKeyMap,
    BusinessPropertyCustomKeyMap
});

const ServiceInterface = {
    DataProxy: {
        interface: {
            getValues: {
                type: "function",
                callbackArgumentIndex: 1
            },
            setValues: {
                type: "function",
                callbackArgumentIndex: 2
            },
            getPropertyKeyMap: {
                type: "function"
            },
            getPropertyString: {
                type: "function",
                external: true,
                internal: false
            },
            setPropertyHandler: {
                type: "function"
            }
        }
    }
};

export { ServiceInterface, ServiceClass };
