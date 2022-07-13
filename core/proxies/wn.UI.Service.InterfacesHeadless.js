/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.

 $MOD$ wn.UI.Service.InterfacesHeadless.js 4.3.1-210127-21-34ae33df-1a04bc7d
*/

// eslint-disable-next-line no-unused-vars
import { ServiceBundle as SB, InterfaceGeneral } from "./wn.UI.Service.Interfaces.js";
import * as ViewService from "./interfaces/ViewServiceInterfaceHeadless.js";

// replace standard ViewService with headless
const ServiceBundle = SB.map(bundleItem => {
    let serviceName = Object.keys(bundleItem.ServiceInterface)[0].replace("Proxy", "Service");
    return serviceName === "ViewService" ? ViewService : bundleItem;
});

export { ServiceBundle, InterfaceGeneral };
