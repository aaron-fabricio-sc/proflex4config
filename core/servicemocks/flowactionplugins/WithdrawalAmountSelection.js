/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ WithdrawalAmountSelection.js 4.3.1-210202-21-d2845e27-1a04bc7d
 */

/**
 * @module flowactionplugins/WithdrawalAmountSelection
 */
define(["jquery", "extensions", "./util/cashHelper"], function(jQuery, ext, cashHelper) {
    "use strict";
    console.log("AMD:WithdrawalAmountSelection");

    const _dataService = Wincor.UI.Service.Provider.DataService;
    const PROP_DISPENSE_AMOUNT = "PROP_DISPENSE_AMOUNT";
    const PROP_NOTE_DISPENSE_AMOUNT = "PROP_NOTE_DISPENSE_AMOUNT";
    const PROP_COIN_DISPENSE_AMOUNT = "PROP_COIN_DISPENSE_AMOUNT";
    const PROP_FUNC_SEL_CODE = "PROP_INTERNAL_FUNCTION_SELECTION";


    return {
        /**
         * Emulates a business logic flow action: Sets the mixture display data property.
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
                // prohibit mixture selection command if we have only 1 cassette
                await _dataService.setValues("VAR_MIXTURE_SELECTION_VIEWSTATE_S", cashHelper.getAvailableDenoms(1).length < 2 ? "2" : "0");
                if(jQuery.isNumeric(context.action)) {
                    let result = await _dataService.getValues(PROP_FUNC_SEL_CODE, null, null);
                    if(result[PROP_FUNC_SEL_CODE] !== "COINOUT") {
                        await _dataService.setValues([PROP_DISPENSE_AMOUNT, PROP_NOTE_DISPENSE_AMOUNT, "PROP_PENULTIMATE_VIEWKEY"], [context.action, context.action, "WithdrawalAmountSelection"], null);
                    } else {
                        await _dataService.setValues([PROP_DISPENSE_AMOUNT, PROP_NOTE_DISPENSE_AMOUNT, PROP_COIN_DISPENSE_AMOUNT, "PROP_PENULTIMATE_VIEWKEY"], [context.action, "", context.action, "WithdrawalAmountSelection"], null);
                    }
                } else if(context.action === "CANCEL") {
                    await _dataService.setValues(["PROP_PENULTIMATE_ACTION", "PROP_INTERNAL_FUNCTION_SELECTION"], [context.action, ""], null);
                }
            } catch(e) {
                throw `FlowAction plug-in WithdrawalAmountSelection has been failed ${e}`;
            }
        }
    };
});
