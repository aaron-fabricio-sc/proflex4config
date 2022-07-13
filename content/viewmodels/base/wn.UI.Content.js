/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.

$MOD$ wn.UI.Content.js 4.3.1-201130-21-086c3328-1a04bc7d

*/
define([],(function(){"use strict";let e;if(console.log("applicationMode="+window.parent&&window.parent.Wincor&&window.parent.Wincor.applicationMode),window.parent.Wincor&&window.parent.Wincor.applicationMode)window.parent&&window.parent.Wincor&&window.parent.Wincor.applicationMode?(e=e||window.parent.Wincor,e.UI=e.UI||window.parent.Wincor.UI,e.UI.Content=e.UI.Content||{},e.UI.Content.designMode=!1,e.UI.Content.designModeExtended=!1,e.UI.Content.applicationMode=!0,e.UI.Diagnostics=window.parent.Wincor.UI.Diagnostics,e.UI.Diagnostics.LogProvider.log=window.parent.Wincor.UI.Diagnostics.LogProvider.log):console.error("Fatal error: Can't determine design mode nor application mode running !");else if(e=e||window.parent.Wincor||{},e.UI=e.UI||window.parent.Wincor&&window.parent.Wincor.UI||{},e.UI.Content=e.UI.Content||{},e.UI.Content.designMode=!(window.parent.Wincor&&window.parent.Wincor.UI),e.UI.Content.designModeExtended=!(!window.parent.Wincor||!window.parent.Wincor.UI),e.UI.Content.toolingEDM=!!e.toolingEDM,e.UI.Content.applicationMode=!1,e.UI.Diagnostics=e.UI.Diagnostics||{},e.UI.Service=e.UI.Service||{},e.UI.Service.Provider=e.UI.Service.Provider||{},e.UI.Content.designModeExtended)e.UI.Diagnostics=window.parent.Wincor.UI.Diagnostics,e.UI.Diagnostics.LogProvider=window.parent.Wincor.UI.Diagnostics.LogProvider;else{e.UI.Diagnostics.LogProvider=window.console,e.UI.Service.Provider.propagateError=function(){},e.UI.Service.Provider.LogProvider=window.console,e.UI.Service.Provider.EventService={getEventInfo:e=>({NAME:e})},e.UI.Service.Provider.DataService={},e.UI.Service.Provider.ConfigService={configuration:{instanceName:""}},e.UI.Service.Provider.ViewService=e.UI.Service.Provider.EppService=e.UI.Service.Provider.FormatService=e.UI.Service.Provider.JournalService=e.UI.Service.Provider.LocalizeService=e.UI.Service.Provider.AdaService=e.UI.Service.Provider.BeepService=e.UI.Service.Provider.ValidateService=e.UI.Service.Provider.UtilityService={};let i=e.UI.Diagnostics.LogProvider;i.LOG_ANALYSE="LOG_ANALYSE",i.LOG_INOUT="LOG_INOUT",i.LOG_DATA="LOG_DATA",i.LOG_DETAIL="LOG_DETAIL",i.LOG_INFO="LOG_INFO",i.LOG_WARNING="LOG_WARNING",i.LOG_ERROR="LOG_ERROR",i.LOG_EXCEPTION="LOG_EXCEPTION"}return e.UI.Content.viewType="",window.Wincor=window.Wincor||e,window.Wincor.UI.Content}));