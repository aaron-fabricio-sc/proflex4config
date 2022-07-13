/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ MenuSelection.js 4.3.1-200122-21-0cd8a9f7-1a04bc7d
 */

/**
 * @module flowactionplugins/MenuSelection
 */
define(["extensions", "./util/cashHelper"], function(ext, cashHelper) {
    "use strict";
    console.log("AMD:MenuSelection");

    const _dataService = Wincor.UI.Service.Provider.DataService;
    const _controlPanelService = Wincor.UI.Service.Provider.ControlPanelService;
    const PROP_FUNC_SEL_CODE = "PROP_INTERNAL_FUNCTION_SELECTION";
    const PROP_FAC_OPTION = "CCTAFW_PROP_FAC_OPTION[1]";
    
    const PROP_MIN_AMOUNT = "PROP_MIN_AMOUNT_ACT";
    const PROP_MAX_AMOUNT = "PROP_MAX_AMOUNT_ACT";
    
    const PROP_PARTIAL_DEPOSIT_VIEWSTATE = "VAR_PARTIAL_DEPOSIT_VIEWSTATE_S";
    const PROP_INSERTMOREMONEY_VIEWSTATE = "VAR_INSERTMOREMONEY_VIEWSTATE_S";
    const PROP_WXTEXT_KEY_INSERT_MORE_MONEY = "CCCAINTAFW_PROP_WXTEXT_KEY_INSERT_MORE_MONEY";
    const PROP_CASHIN_FUNCTION = "CCCAINTAFW_PROP_CASHIN_FUNCTION";
    const PROP_MIXED_MONEY = "VAR_MIXED_MONEY";
    const PROP_CASHIN_JSON_RESULT = "CCCAINTAFW_PROP_JSON_RESULT";
    const PROP_MIXTURE_SELECTION_VIEWSTATE = "VAR_MIXTURE_SELECTION_VIEWSTATE_S";
    const PROP_DISP_L2_AMOUNTS = "CCCAINTAFW_PROP_DISP_L2_AMOUNTS";
    const PROP_ROLLBACK_L3_AMOUNTS = "CCCAINTAFW_PROP_ROLLBACK_L3_AMOUNTS";
    const PROP_WITHDRAWAL_AMOUNT_INPUT_DECIMALS = "CCTAFW_PROP_WITHDRAWAL_AMOUNT_INPUT_DECIMALS";

    return {

        /**
         * Emulates a business logic flow action when running:
         * @param {Object} context is:<br>
         * <ul>
         * <li>currentViewKey  // function: the current view key (corresponding this this plug-in name)</li>
         * <li>config          // object: Configuration of Config.js</li>
         * <li>container       // object: ViewModelContainer</li>
         * <li>serviceProvider // object: a service provider reference</li>
         * </ul>
         * @returns {Promise} gets resolved when the action is ready or rejected on any error.
         */
        onActivateReady: async function(context) {
            try {
                await _dataService.setValues([PROP_FUNC_SEL_CODE, PROP_FAC_OPTION], ["MAIN", "1"]);
            } catch(e) {
                throw `FlowAction plug-in MenuSelection::onActivateReady has been failed ${e}`;
            }
        },

        /**
         * Emulates a hardware event action when running:
         * @param {Object} context is:<br>
         * <ul>
         * <li>currentViewKey  // function: the current view key (corresponding this this plug-in name)</li>
         * <li>config          // object: Configuration of Config.js</li>
         * <li>action          // the current action (hardware trigger action)</li>
         * <li>container       // object: ViewModelContainer</li>
         * <li>serviceProvider // object: a service provider reference</li>
         * </ul>
         * @returns {Promise} gets resolved when the action is ready or rejected on any error.
         */
        onHardwareEvent: async function(context) {
            try {
                return context.action; // nothing to do here
            } catch(e) {
                throw `FlowAction plug-in MenuSelection::onHardwareEvent has been failed ${e}`;
            }
        },

        /**
         * Emulates a business logic flow action: Set the internal function selection to the selected action.
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
                let mixture_selection_viewstate = "3";

                /*
                    "true" / "false"
                 */
                let withdrawal_input_decimals = "false";

                /*
                    "0" //UP
                    "3" //HIDDEN
                */
                let partial_deposit_viewstate = "0";
                
                /*
                    "CIN"
                    "COININ"
                    "CINMIXED"
                */
                let cashin_function = "CIN";

                /*
                    "0" //UP
                    "3" //HIDDEN
                */
                let insert_more_viewstate = "0";
                
                /*
                    "0" //TA_BUTTON_WXTEXT_MORE_NOTES
                    "1"   //TA_BUTTON_WXTEXT_MORE_COINS
                    "2" //TA_BUTTON_WXTEXT_MORE_NOTES_COINS
                */
                let insert_more_caption_suffix = "0";

                /*
                    "COINS"		//TA_COINS
                    "MIXED"		//TA_MIXED_MONEY
                    "NOTES"		//TA_NOTES
                */
                let mixed_money = "NOTES";

                // Level 2 notes amount is a formatted value!
                let l2_notes_amount = "50.00"; // Note: this property is a formatted value, but without any currency data

                // Level 3 notes amount is a formatted value!
                let l3_notes_rollback_amount = "";

                // get min/max amounts
                let minMaxRes = await _dataService.getValues([PROP_MIN_AMOUNT, PROP_MAX_AMOUNT]);
                let minAmountAct = minMaxRes[PROP_MIN_AMOUNT];
                let maxAmountAct = minMaxRes[PROP_MAX_AMOUNT];

                let cashin_json_result = JSON.stringify({
                    "totals": [
                        { "total": 569500, "L2": 5000, "L3": 0, "L4": 569500, "exp": -2, "currency": "EUR" }
                    ],
                    "denominations": [
                        { "value": 10000, "count": 17, "currency": "EUR", "exp": -2, "type": 0, "level": 4 },
                        { "value": 20000, "count": 17, "currency": "EUR", "exp": -2, "type": 0, "level": 4 },
                        { "value": 5000,  "count": 7,  "currency": "EUR", "exp": -2, "type": 0, "level": 4 },
                        { "value": 2000,  "count": 7,  "currency": "EUR", "exp": -2, "type": 0, "level": 4 },
                        { "value": 1000,  "count": 7,  "currency": "EUR", "exp": -2, "type": 0, "level": 4 },
                        { "value": 500,   "count": 7,  "currency": "EUR", "exp": -2, "type": 0, "level": 4 },

                        { "value": 5000,  "count": 1,  "currency": "EUR", "exp": -2, "type": 0, "level": 2 }
                    ]
                });
    
                let leastNoteDenom = cashHelper.getLeastAvailableNoteDenom();
                let leastCoinDenom = cashHelper.getLeastAvailableCoinDenom();
    
                switch (context.action) {
                    case "CIN":
                        partial_deposit_viewstate = "0";
                        cashin_function = "CIN";
                        insert_more_viewstate = "0";
                        insert_more_caption_suffix = "0";
                        mixed_money = "NOTES";
                        cashin_json_result = JSON.stringify({
                            "totals": [
                                { "total": 569500, "L2": 5000, "L3": 0, "L4": 569500, "exp": -2, "currency": "EUR" }
                            ],
                            "denominations": [
                                { "value": 10000, "count": 17, "currency": "EUR", "exp": -2, "type": 0, "level": 4 },
                                { "value": 20000, "count": 17, "currency": "EUR", "exp": -2, "type": 0, "level": 4 },
                                { "value": 50000, "count": 17, "currency": "EUR", "exp": -2, "type": 0, "level": 4 },
                                { "value": 5000,  "count": 7,  "currency": "EUR", "exp": -2, "type": 0, "level": 4 },
                                { "value": 2000,  "count": 7,  "currency": "EUR", "exp": -2, "type": 0, "level": 4 },
                                { "value": 1000,  "count": 7,  "currency": "EUR", "exp": -2, "type": 0, "level": 4 },
                                { "value": 500,   "count": 7,  "currency": "EUR", "exp": -2, "type": 0, "level": 4 },

                                { "value": 5000,  "count": 1,  "currency": "EUR", "exp": -2, "type": 0, "level": 2 }
                            ]
                        });
                    break;
                    case "COININ":
                        partial_deposit_viewstate = "0";
                        cashin_function = "COININ";
                        insert_more_viewstate = "0";
                        insert_more_caption_suffix = "1";
                        mixed_money = "COINS";
                        l2_notes_amount = "";
                        l3_notes_rollback_amount = "";
                        cashin_json_result = JSON.stringify({
                            "totals": [
                                { "total": 1990, "L2": 0, "L3": 0, "L4": 1990, "exp": -2, "currency": "EUR" }
                            ],
                            "denominations": [
                                { "value": 1,     "count": 40, "currency": "EUR", "exp": -2, "type": 1, "level": 4 },
                                { "value": 100,   "count": 8,  "currency": "EUR", "exp": -2, "type": 1, "level": 4 },
                                { "value": 200,   "count": 3,  "currency": "EUR", "exp": -2, "type": 1, "level": 4 },
                                { "value": 50,   "count": 10,  "currency": "EUR", "exp": -2, "type": 1, "level": 4 },
                                { "value": 10,   "count": 5,  "currency": "EUR", "exp": -2, "type": 1, "level": 4 }
                            ]
                        });
                    break;
                    case "CINMIXED":
                        partial_deposit_viewstate = "0";
                        cashin_function = "CINMIXED";
                        insert_more_viewstate = "0";
                        insert_more_caption_suffix = "2";
                        mixed_money = "MIXED";
                        l2_notes_amount = "";
                        l3_notes_rollback_amount = "";
                        cashin_json_result = JSON.stringify({
                            "totals": [
                                { "total": 569500, "L2": 0, "L3": 0, "L4": 569500, "exp": -2, "currency": "EUR" }
                            ],
                            "denominations": [
                                { "value": 10000, "count": 17, "currency": "EUR", "exp": -2, "type": 0, "level": 4 },
                                { "value": 20000, "count": 17, "currency": "EUR", "exp": -2, "type": 0, "level": 4 },
                                { "value": 5000,  "count": 7,  "currency": "EUR", "exp": -2, "type": 0, "level": 4 },
                                { "value": 500,   "count": 7,  "currency": "EUR", "exp": -2, "type": 0, "level": 4 },
                                { "value": 1000,  "count": 7,  "currency": "EUR", "exp": -2, "type": 0, "level": 4 },
                                { "value": 2000,  "count": 7,  "currency": "EUR", "exp": -2, "type": 0, "level": 4 },
                                { "value": 5000,  "count": 1,  "currency": "EUR", "exp": -2, "type": 0, "level": 2 },
                                { "value": 1,     "count": 40, "currency": "EUR", "exp": -2, "type": 1, "level": 4 },
                                { "value": 100,   "count": 8,  "currency": "EUR", "exp": -2, "type": 1, "level": 4 }
                            ]
                        });
                    break;
                    case "MIXEDMEDIA":
                        partial_deposit_viewstate = "3";
                        cashin_function = "CIN";
                        insert_more_viewstate = "3";
                        insert_more_caption_suffix = "0";
                        mixed_money = "NOTES";
                        cashin_json_result = JSON.stringify({
                            "totals": [
                                { "total": 569500, "L2": 5000, "L3": 0, "L4": 569500, "exp": -2, "currency": "EUR" }
                            ],
                            "denominations": [
                                { "value": 10000, "count": 17, "currency": "EUR", "exp": -2, "type": 0, "level": 4 },
                                { "value": 20000, "count": 17, "currency": "EUR", "exp": -2, "type": 0, "level": 4 },
                                { "value": 5000,  "count": 7,  "currency": "EUR", "exp": -2, "type": 0, "level": 4 },
                                { "value": 2000,  "count": 7,  "currency": "EUR", "exp": -2, "type": 0, "level": 4 },
                                { "value": 1000,  "count": 7,  "currency": "EUR", "exp": -2, "type": 0, "level": 4 },
                                { "value": 500,   "count": 7,  "currency": "EUR", "exp": -2, "type": 0, "level": 4 },
                                { "value": 5000,  "count": 1,  "currency": "EUR", "exp": -2, "type": 0, "level": 2 }
                            ]
                        });
                    break;
                    case "COUT":
                        mixture_selection_viewstate = "0";
                        withdrawal_input_decimals = "false";
                        minAmountAct = leastNoteDenom ? leastNoteDenom.cuInfo.value() : "500";
                        break;
                    case "COINOUT":
                        withdrawal_input_decimals = "true";
                        minAmountAct = leastCoinDenom ? leastCoinDenom.cuInfo.value() : "1";
                        maxAmountAct = 10000;
                        break;
                    case "COUTFAST":
                        minAmountAct = leastNoteDenom ? leastNoteDenom.cuInfo.value() : "500";
                        if(_controlPanelService.getContext().cashInfosViewModel) {
                            await _controlPanelService.getContext().cashInfosViewModel.collectCashInfos(); // ensure we have plausible property values
                        }
                        break;
                    case "COUTMIXED":
                        withdrawal_input_decimals = "true";
                        minAmountAct = leastCoinDenom ? leastCoinDenom.cuInfo.value() : "1";
                        if(_controlPanelService.getContext().cashInfosViewModel) {
                            await _controlPanelService.getContext().cashInfosViewModel.collectCashInfos(); // ensure we have plausible property values
                        }
                    break;
                }

                let depositResult = await _dataService.getValues(PROP_CASHIN_JSON_RESULT);
                let data = depositResult[PROP_CASHIN_JSON_RESULT];
                data = typeof data !== "object" ? JSON.parse(data) : data;
                if(!data.setByUser) {
                    await _dataService.setValues([
                            PROP_FUNC_SEL_CODE,
                            PROP_PARTIAL_DEPOSIT_VIEWSTATE,
                            PROP_CASHIN_FUNCTION,
                            PROP_INSERTMOREMONEY_VIEWSTATE,
                            PROP_WXTEXT_KEY_INSERT_MORE_MONEY,
                            PROP_MIXED_MONEY,
                            PROP_CASHIN_JSON_RESULT,
                            PROP_MIXTURE_SELECTION_VIEWSTATE,
                            PROP_DISP_L2_AMOUNTS,
                            PROP_ROLLBACK_L3_AMOUNTS,
                            PROP_WITHDRAWAL_AMOUNT_INPUT_DECIMALS,
                            PROP_MIN_AMOUNT,
                            PROP_MAX_AMOUNT
                        ],
                        [
                            context.action,
                            partial_deposit_viewstate,
                            cashin_function,
                            insert_more_viewstate,
                            insert_more_caption_suffix,
                            mixed_money,
                            cashin_json_result,
                            mixture_selection_viewstate,
                            l2_notes_amount,
                            l3_notes_rollback_amount,
                            withdrawal_input_decimals,
                            `${minAmountAct}`,
                            `${maxAmountAct}`,
                        ],
                        null);
                } else {
                    await _dataService.setValues([
                            PROP_FUNC_SEL_CODE,
                            PROP_PARTIAL_DEPOSIT_VIEWSTATE,
                            PROP_CASHIN_FUNCTION,
                            PROP_INSERTMOREMONEY_VIEWSTATE,
                            PROP_WXTEXT_KEY_INSERT_MORE_MONEY,
                            PROP_MIXED_MONEY,
                            PROP_WITHDRAWAL_AMOUNT_INPUT_DECIMALS,
                            PROP_MIN_AMOUNT,
                            PROP_MAX_AMOUNT
                        ],
                        [
                            context.action,
                            partial_deposit_viewstate,
                            cashin_function,
                            insert_more_viewstate,
                            insert_more_caption_suffix,
                            mixed_money,
                            withdrawal_input_decimals,
                            `${minAmountAct}`,
                            `${maxAmountAct}`,
                        ],
                        null);
                }
            } catch(e) {
                throw `FlowAction plug-in MenuSelection::onGuiResult has been failed ${e}`;
            }
        }
    };
});
