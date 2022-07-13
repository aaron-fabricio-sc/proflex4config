/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ WithdrawalAlternativeAmountInput.js 4.3.1-210202-21-d2845e27-1a04bc7d
 */

/**
 * @module flowactionplugins/WithdrawalAlternativeAmountInput
 */
define(["extensions", "./util/cashHelper"], function(ext, cashHelper) {
    "use strict";
    console.log("AMD:WithdrawalAlternativeAmountInput");

    const _dataService = Wincor.UI.Service.Provider.DataService;
    const _controlPanelService = Wincor.UI.Service.Provider.ControlPanelService;
    const PROP_FUNC_SEL_CODE = "PROP_INTERNAL_FUNCTION_SELECTION";
    const PROP_UNFORMATTED_VALUE = "PROP_UNFORMATTED_VALUE";
    const PROP_NOTE_DISPENSE_AMOUNT = "PROP_NOTE_DISPENSE_AMOUNT";
    const PROP_COIN_DISPENSE_AMOUNT = "PROP_COIN_DISPENSE_AMOUNT";

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
                // prohibit mixture selection command if we have only 1 cassette
                // Note: This function is called after the display view, so the viewContext is already resolved and "VAR_MIXTURE_SELECTION_VIEWSTATE_S" is set to late
                // here. The same code is also done in WithdrawalAmountSelection in order to be earlier.
                await _dataService.setValues("VAR_MIXTURE_SELECTION_VIEWSTATE_S", cashHelper.getAvailableDenoms(1).length < 2 ? "2" : "0");
            } catch(e) {
                throw `FlowAction plug-in WithdrawalAlternativeAmountInput::onPrepare has been failed ${e}`;
            }
        },
    
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
                if(context.action === "CONFIRM" || context.action === "MIXTURE") {
                    if(_controlPanelService.getContext().cashInfosViewModel) {
                        let result = await _dataService.getValues([PROP_UNFORMATTED_VALUE], null, null);
                        _controlPanelService.getContext().cashInfosViewModel.amount(result[PROP_UNFORMATTED_VALUE]);
                    }
                    await _dataService.setValues(["PROP_PENULTIMATE_VIEWKEY", "PROP_PENULTIMATE_ACTION"], ["WithdrawalAlternativeAmountInput", context.action === "MIXTURE" ? "MIXTURE" : ""], null);
                    // check&set for alternative
                    await cashHelper.createCashMixture(context);
                } else if(context.action === "CANCEL") {
                    await _dataService.setValues(["PROP_PENULTIMATE_ACTION", "PROP_INTERNAL_FUNCTION_SELECTION"], [context.action, ""], null);
                }
            } catch(e) {
                throw `FlowAction plug-in WithdrawalAlternativeAmountInput has been failed ${e}`;
            }
        }
    };
});
