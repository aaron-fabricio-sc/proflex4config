/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ AdaHideScreenQuestion.js 4.3.1-200122-21-0cd8a9f7-1a04bc7d
 */
/**
 * @module flowactionplugins/AdaHideScreenQuestion
 */
define(["extensions"], function(ext) {
    "use strict";
    console.log("AMD:AdaHideScreenQuestion");

    return {
        /**
         * Emulates a business logic flow action: Updates the BL property "PROP_UI_STYLE_TYPE_KEY" with the ADA specific style type key.
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
        onGuiResult: function(context) {
            return ext.Promises.promise((resolve, reject) => {
                try {
                    let dataService = context.serviceProvider.DataService;
                    if(context.action === "YES") {
                        dataService.updateValues("PROP_UI_STYLE_TYPE_KEY", "GUI_ADA_Stylesheet");
                    }
                    resolve();
                }
                catch(e) {
                    reject("FlowAction plug-in AdaHideScreenQuestion has been failed " + e);
                }
            });
        }
    };
});
