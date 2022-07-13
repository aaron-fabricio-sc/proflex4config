/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany
 
 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.
 
 $MOD$ wn.UI.Service.Interfaces.js 4.3.1-201130-21-086c3328-1a04bc7d
 */

const InterfaceGeneral = {
    "Comment": "This is the standard service interface definition file of ProFlex4 UI",
    "General": {
        "interface": {
            "Expand_GeneralConstants": {
                "attributes": ["NAME", "DISPOSAL_TRIGGER_DEACTIVATE", "DISPOSAL_TRIGGER_UNLOAD", "DISPOSAL_TRIGGER_ONETIME", "DISPOSAL_TRIGGER_SHUTDOWN"],
                "type": "string",
                "writable": false
            },
            "onResponse": {
                "type": "function",
                "traceable": false
            },
            "onRequest": {
                "type": "function",
                "traceable": false
            },
            "onEvent": {
                "type": "function",
                "traceable": false
            },
            "registerForServiceEvent": {
                "type": "function"
            },
            "fireServiceEvent": {
                "type": "function",
                "internal": false
            },
            "deregisterServiceEvents": {
                "type": "function"
            },
            "deregisterFromServiceEvent": {
                "type": "function"
            },
            "onSetup": {
                "type": "function"
            },
            "onServicesReady": {
                "type": "function"
            },
            "whenReady": {
                "type": "object",
                "writable": false
            }
        }
    }
};

const ServiceBundle = [];

import * as LogService from "./interfaces/LogServiceInterface.js";

ServiceBundle.push(LogService);

import * as AdaService from "./interfaces/AdaServiceInterface.js";

ServiceBundle.push(AdaService);

import * as BeepService from "./interfaces/BeepServiceInterface.js";

ServiceBundle.push(BeepService);

import * as ConfigService from "./interfaces/ConfigServiceInterface.js";

ServiceBundle.push(ConfigService);

import * as UtilityService from "./interfaces/UtilityServiceInterface.js";

ServiceBundle.push(UtilityService);

import * as ControlPanelService from "./interfacesDesignMode/ControlPanelServiceInterface.js";

ServiceBundle.push(ControlPanelService);

import * as DataService from "./interfaces/DataServiceInterface.js";

ServiceBundle.push(DataService);

import * as EppService from "./interfaces/EppServiceInterface.js";

ServiceBundle.push(EppService);

import * as EventService from "./interfaces/EventServiceInterface.js";

ServiceBundle.push(EventService);

import * as FormatService from "./interfaces/FormatServiceInterface.js";

ServiceBundle.push(FormatService);

import * as JournalService from "./interfaces/JournalServiceInterface.js";

ServiceBundle.push(JournalService);

import * as LocalizeService from "./interfaces/LocalizeServiceInterface.js";

ServiceBundle.push(LocalizeService);

import * as ValidateService from "./interfaces/ValidateServiceInterface.js";

ServiceBundle.push(ValidateService);

import * as VideoService from "./interfaces/VideoServiceInterface.js";

ServiceBundle.push(VideoService);

import * as ViewService from "./interfaces/ViewServiceInterface.js";

ServiceBundle.push(ViewService);

export {ServiceBundle, InterfaceGeneral};
