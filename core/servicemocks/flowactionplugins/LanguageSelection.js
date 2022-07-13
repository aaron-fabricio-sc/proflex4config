/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ LanguageSelection.js 4.3.1-200122-21-0cd8a9f7-1a04bc7d
 */

/**
 * @module flowactionplugins/LanguageSelection
 */
define(["extensions"], function() {
    "use strict";
    console.log("AMD:LanguageSelection");
    
    const _dataService = Wincor.UI.Service.Provider.DataService;
    const _localizeService = Wincor.UI.Service.Provider.LocalizeService;
    
    return {
        /**
         * Emulates a business logic flow action: Switch the UI language to the desired one.
         * @param {Object} context is:<br>
         * <ul>
         * <li>currentViewKey  // the current view key (corresponding this this plug-in name)</li>
         * <li>currentFlow     // the current flow</li>
         * <li>action          // the current action (customer selection)</li>
         * <li>config          // Configuration of Config.js</li>
         * <li>container       // ViewModelContainer</li>
         * <li>serviceProvider // a service provider reference</li>
         * </ul>
         * @returns {Promise} gets resolved (may argument a new view key destination) when the action is ready or rejected on any error.
         */
        onGuiResult: async function(context) {
            try {
                if(context.action !== "CANCEL") {
                    const langMap = _localizeService.getLanguageMapping();
                    let langName = "";
                    if(context.action !== "CONFIRM") {
                        langName = context.action.toLowerCase();
                        langName = langName.charAt(0).toUpperCase() + langName.slice(1);
                        // convert action to e.g. "English" instead of "ENGLISH"
                        _localizeService.setLanguage(langMap.nameToIso[langName], null);
                    } else {
                        let result = await _dataService.getValues(["CCTAFW_PROP_LISE_INDEX"]);
                        if(result["CCTAFW_PROP_LISE_INDEX"] !== null && result["CCTAFW_PROP_LISE_INDEX"] !== void 0) {
                            let langs = _localizeService.getInstalledLanguages();
                            _localizeService.setLanguage(langs[parseInt(result["CCTAFW_PROP_LISE_INDEX"])], null);
                        }
                    }
                }
            } catch(e) {
                throw `FlowAction plug-in LanguageSelection has been failed ${e}`;
            }
        }
    };
});
