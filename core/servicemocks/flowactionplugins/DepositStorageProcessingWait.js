   /**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ DepositStorageProcessingWait.js 4.3.1-200122-21-0cd8a9f7-1a04bc7d
 */

/**
 * @module flowactionplugins/DepositStorageProcessingWait
 */
define(["extensions", "./util/cashHelper"], function(ext, cashHelper) {
    "use strict";
    console.log("AMD:DepositStorageProcessingWait");

    const _dataService = Wincor.UI.Service.Provider.DataService;
    const _eventService = Wincor.UI.Service.Provider.EventService;
    const _controlPanelService = Wincor.UI.Service.Provider.ControlPanelService;

    const EVENT_INFO = _eventService.getEventInfo("TRANSACTION_MODULE");

    const DEPOSIT_FUNCTION_MAP = {
        CIN: "NOTES",
        COININ: "COINS",
        CINMIXED: "MIXED"
    };

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
                await cashHelper.updateDepositCommandStates("3", "3");
            } catch(e) {
                throw `FlowAction plug-in DepositStorageProcessingWait::onPrepare has been failed ${e}`;
            }
        },

        /**
         * Emulates a business logic flow action when running: Sets scanner type to 'CCDM2'.
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
                let result = await _dataService.getValues("CCTAFW_PROP_INTERNAL_FUNCTION_SELECTION_CODE");
                let code = DEPOSIT_FUNCTION_MAP[result["CCTAFW_PROP_INTERNAL_FUNCTION_SELECTION_CODE"]];
                await _dataService.setValues("VAR_MIXED_MONEY", [code ? code : DEPOSIT_FUNCTION_MAP["CIN"]]); // NOTES is default
                setTimeout(() => {
                    if(context.currentViewKey() === "DepositStorageProcessingWait") {
                        _eventService.onEvent({
                            FWName: EVENT_INFO.NAME,
                            FWEventID: EVENT_INFO.ID_DEPOSIT,
                            FWEventParam: "SHOWHOURGLASS" // "COINSSTACKERFULL"
                        });
                    }
                }, 500);
            } catch(e) {
                throw `FlowAction plug-in DepositStorageProcessingWait::onActivateReady has been failed ${e}`;
            }
        },

        /**
         * Emulates a business logic flow action: Updates the virtual safe.
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
                if(_controlPanelService.getContext().cassettesViewModel && _controlPanelService.getContext().hopperViewModel) {
                    let denominations = await cashHelper.getDepositDenominations();
                    denominations.forEach(denom => {
                        if(denom.type === 0) { // notes
                            _controlPanelService.getContext().cassettesViewModel.cassettes().find(cass => {
                                if(cass.cuInfo.type() === "recycle" && parseInt(cass.cuInfo.value()) === denom.value && denom.level === 4) {
                                    cass.cuInfo.count(parseInt(cass.cuInfo.count()) + parseInt(denom.count));
                                    return true;
                                } else if(cass.name.toLowerCase().indexOf("level2") !== -1 && denom.level === 2) {
                                    cass.cuInfo.count(parseInt(cass.cuInfo.count()) + parseInt(denom.count));
                                    return true;
                                } else if(cass.name.toLowerCase().indexOf("all") !== -1 && denom.level === 3) {
                                    cass.cuInfo.count(parseInt(cass.cuInfo.count()) + parseInt(denom.count));
                                    return true;
                                }
                                return false;
                            });
                        } else { // coins
                            _controlPanelService.getContext().hopperViewModel.hoppers().find(hopper => {
                                if(parseInt(hopper.cuInfo.value()) === denom.value) {
                                    hopper.cuInfo.count(parseInt(hopper.cuInfo.count()) + parseInt(denom.count));
                                    return true;
                                }
                                return false;
                            });
                        }
                    });
                }
            } catch(e) {
                throw `FlowAction plug-in DepositStorageProcessingWait::onGuiResult has been failed ${e}`;
            }
        }
    };
});
