/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ WithdrawalAlternativeAmountSelection.js 4.3.1-210202-21-d2845e27-1a04bc7d
 */

/**
 * @module flowactionplugins/WithdrawalAlternativeAmountSelection
 */
define(["jquery", "extensions", "./util/cashHelper"], function(jQuery, ext, cashHelper) {
    "use strict";
    console.log("AMD:WithdrawalAlternativeAmountSelection");

    const _dataService = Wincor.UI.Service.Provider.DataService;
    const _controlPanelService = Wincor.UI.Service.Provider.ControlPanelService;
    const PROP_FUNC_SEL_CODE = "PROP_INTERNAL_FUNCTION_SELECTION";
    const PROP_UNFORMATTED_VALUE = "PROP_UNFORMATTED_VALUE";
    const PROP_DISPENSE_AMOUNT = "PROP_DISPENSE_AMOUNT";

    const PROP_NOTE_DISPENSE_AMOUNT = "PROP_NOTE_DISPENSE_AMOUNT";
    const PROP_COIN_DISPENSE_AMOUNT = "PROP_COIN_DISPENSE_AMOUNT";
    const CCTAFW_PROP_HIGH_AMOUNT_MINOR = "CCTAFW_PROP_HIGH_AMOUNT_MINOR";
    const CCTAFW_PROP_LOW_AMOUNT_MINOR = "CCTAFW_PROP_LOW_AMOUNT_MINOR";


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
                if(context.action === "Lower_Amount" || context.action === "Higher_Amount") {
                    let result = await _dataService.getValues([CCTAFW_PROP_HIGH_AMOUNT_MINOR, CCTAFW_PROP_LOW_AMOUNT_MINOR], null, null);
                    let amount = context.action === "Lower_Amount" ? result[CCTAFW_PROP_LOW_AMOUNT_MINOR] : result[CCTAFW_PROP_HIGH_AMOUNT_MINOR];
                    _controlPanelService.getContext().cashInfosViewModel && _controlPanelService.getContext().cashInfosViewModel.amount(amount);
                    await _dataService.setValues([PROP_DISPENSE_AMOUNT, PROP_UNFORMATTED_VALUE, "PROP_PENULTIMATE_VIEWKEY"], [amount, amount, "WithdrawalAlternativeAmountSelection"], null);
                } else { // reset lower/higher
                    await _dataService.setValues([CCTAFW_PROP_LOW_AMOUNT_MINOR, CCTAFW_PROP_HIGH_AMOUNT_MINOR], ["", ""], null);
                    if(context.action === "CANCEL") {
                        await _dataService.setValues(["PROP_PENULTIMATE_ACTION", "PROP_INTERNAL_FUNCTION_SELECTION"], [context.action, ""], null);
                    }
                }
            } catch(e) {
                throw `FlowAction plug-in WithdrawalAlternativeAmountSelection has been failed ${e}`;
            }
        }
    };
});
