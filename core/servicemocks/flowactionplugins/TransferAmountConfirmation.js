/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ TransferAmountConfirmation.js 4.3.1-200122-21-0cd8a9f7-1a04bc7d
 */
/**
 * @module flowactionplugins/TransferAmountConfirmation
 */
define(["extensions"], function(ext) {
    "use strict";
    console.log("AMD:TransferAmountConfirmation");

    const _dataService = Wincor.UI.Service.Provider.DataService;
    const PROP_TRANS_AMOUNT = "CCTAFW_PROP_TRANSACTION_AMOUNT";
    const PROP_UNFORMATTED_VALUE = "PROP_UNFORMATTED_VALUE";
    
    return {
    
        /**
         * Emulates a business logic step for preparation purpose.
         * @param {Object} context is:<br>
         * <ul>
         * <li>currentViewKey  // function: the current view key (corresponding this plug-in name)</li>
         * <li>viewConfig      // object: Configuration of the view (ViewMapping.json)</li>
         * <li>container       // object: ViewModelContainer</li>
         * <li>serviceProvider // object: a service provider reference</li>
         * </ul>
         * @returns {Promise} gets resolved when the action is ready or rejected on any error.
         */
        onPrepare: async function(context) {
            try {
                // usually TransferAmountInput sets the PROP_TRANS_AMOUNT after input has been confirmed, but unfortunately in BusinessData.json the property
                // PROP_TRANS_AMOUNT is stored viewkey specific so that this plugin reads the property value from TransferAmountConfirmation.
                // That's why we must do the work of TransferAmountInput again here setting PROP_TRANS_AMOUNT to the just given input value:
                let res = await _dataService.getValues(PROP_UNFORMATTED_VALUE);
                if(res[PROP_UNFORMATTED_VALUE] && res[PROP_UNFORMATTED_VALUE] !== "0") {
                    await _dataService.setValues(PROP_TRANS_AMOUNT, res[PROP_UNFORMATTED_VALUE]);
                }
            } catch(e) {
                throw `FlowAction plug-in TransferAmountConfirmation::onPrepare has been failed ${e}`;
            }
        },
    
        /**
         * Emulates a business logic flow action: .
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
                // do stuff here
                await Promise.resolve(); // delete this line then
            } catch(e) {
                throw `FlowAction plug-in TransferAmountConfirmation::onGuiResult has been failed ${e}`;
            }
        }
    };
});
