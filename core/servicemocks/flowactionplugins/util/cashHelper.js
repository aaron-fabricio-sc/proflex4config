/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ cashHelper.js 4.3.1-200122-21-0cd8a9f7-1a04bc7d
 */

/**
 * @module flowactionplugins/cashHelper
 */
define(["extensions", "vm-util/Calculations"], function(ext, calculations) {
    "use strict";
    console.log("AMD:cashHelper");

    const _eventService = Wincor.UI.Service.Provider.EventService;

    const _dataService = Wincor.UI.Service.Provider.DataService;

    const PROP_FUNC_SEL_CODE = "PROP_INTERNAL_FUNCTION_SELECTION";
    const PROP_MIXTURE_DATA = "PROP_MIXTURE_DATA";
    const PROP_UNFORMATTED_VALUE = "PROP_UNFORMATTED_VALUE";
    const PROP_DISPENSE_AMOUNT = "PROP_DISPENSE_AMOUNT";
    const PROP_NOTE_DISPENSE_AMOUNT = "PROP_NOTE_DISPENSE_AMOUNT";
    const PROP_COIN_DISPENSE_AMOUNT = "PROP_COIN_DISPENSE_AMOUNT";

    const _controlPanelService = Wincor.UI.Service.Provider.ControlPanelService;


    return {

        // -- Cash withdrawal --
        getInfoFromCashUnit: function(noteAmount, coinAmount) {
            let types = [];
            let values = [];
            let counts = [];
            if(_controlPanelService.getContext().cassettesViewModel && _controlPanelService.getContext().hopperViewModel) {
                if(coinAmount > 0) {
                    _controlPanelService.getContext().hopperViewModel.hoppers().forEach(item => {
                        if(item.cuInfo.state()) {
                            types.push(1);
                            values.push(item.cuInfo.value());
                            counts.push(item.cuInfo.count());
                        }
                    });
                }
                if(noteAmount > 0) {
                    _controlPanelService.getContext().cassettesViewModel.cassettes().forEach(item => {
                        if(item.cuInfo.type() === "recycle" && item.cuInfo.state()) {
                            types.push(0);
                            values.push(item.cuInfo.value());
                            counts.push(item.cuInfo.count());
                        }
                    });
                }
            }
            return {types: types, values: values, counts: counts};
        },

        getAvailableDenoms: function(noteAmount, coinAmount) {
            const denoms = [];
            if(_controlPanelService.getContext().cashInfosViewModel && _controlPanelService.getContext().cassettesViewModel && _controlPanelService.getContext().hopperViewModel) {
                _controlPanelService.getContext().cashInfosViewModel.collectDenomInfos({denominations: denoms}, noteAmount > 0, coinAmount > 0);
            }
            return denoms;
        },

        extractNoteCoinAmount(amount) {
            let result = []; // [noteAmt, coinAmt]
            let leastN = this.getLeastAvailableNoteDenom();
            const v = leastN ? leastN.cuInfo.value() : 1;
            result[0] = amount - (v > 1 ? amount % v : amount);
            result[1] = v > 1 ? amount % v : amount;
            return result;
        },

        ensureCashProperties: async function() {
            let result = await _dataService.getValues([PROP_FUNC_SEL_CODE, PROP_UNFORMATTED_VALUE, "PROP_PENULTIMATE_VIEWKEY"], null, null);
            let code = result[PROP_FUNC_SEL_CODE];
            let penultimateViewkey =  result["PROP_PENULTIMATE_VIEWKEY"];
            if(penultimateViewkey === "WithdrawalAlternativeAmountInput") {
                let amount = result[PROP_UNFORMATTED_VALUE];
                if(code === "COINOUT") { // pure coin out?
                    await _dataService.setValues([PROP_NOTE_DISPENSE_AMOUNT, PROP_COIN_DISPENSE_AMOUNT],
                                                 ["0", amount], null);
                } else if(code === "COUT") {
                    await _dataService.setValues([PROP_COIN_DISPENSE_AMOUNT, PROP_NOTE_DISPENSE_AMOUNT],
                                                 ["0", amount], null);
                }
            }
        },

        /**
         *
         * @param {Object} context the plugin context
         * @param {string=} fromViewKey
         * @param {string=} reason "onPrepare", "onGuiResult", "onActivateReady", "onHardwareEvent"
         * @return {*}
         */
        createCashMixture: async function(context, fromViewKey, reason) {
            const cashInfos = _controlPanelService.getContext().cashInfosViewModel;
            if(cashInfos) {
                try {
                    await this.ensureCashProperties();
                    let result = await _dataService.getValues(["PROP_PENULTIMATE_VIEWKEY", "PROP_PENULTIMATE_ACTION"], null, null);
                    let penultimateViewkey = result["PROP_PENULTIMATE_VIEWKEY"];
                    let penultimateAction = result["PROP_PENULTIMATE_ACTION"];
                    result = await _dataService.getValues([PROP_UNFORMATTED_VALUE, PROP_MIXTURE_DATA, PROP_FUNC_SEL_CODE, PROP_DISPENSE_AMOUNT, PROP_NOTE_DISPENSE_AMOUNT, PROP_COIN_DISPENSE_AMOUNT,
                        "CCTAFW_PROP_COUTFAST_AMOUNT[1]"], null, null);
                    let code = result[PROP_FUNC_SEL_CODE];
                    let currData = context.container.currentBankingContext.currencyData;
                    let displayData = JSON.parse(result[PROP_MIXTURE_DATA]);
                    let noteAmount = result[PROP_NOTE_DISPENSE_AMOUNT] ? parseInt(result[PROP_NOTE_DISPENSE_AMOUNT]) : 0;
                    let coinAmount = result[PROP_COIN_DISPENSE_AMOUNT] ? parseInt(result[PROP_COIN_DISPENSE_AMOUNT]) : 0;
                    let amount = result[PROP_DISPENSE_AMOUNT] ? parseInt(result[PROP_DISPENSE_AMOUNT]) : 0;
                    let nextLower = "";
                    let nextHigher = "";
                    if(penultimateViewkey === "WithdrawalAlternativeAmountInput") {
                        amount = result[PROP_UNFORMATTED_VALUE] ? parseInt(result[PROP_UNFORMATTED_VALUE]) : 0;
                        if(code === "COINOUT") { // pure coin out?
                            noteAmount = 0;
                            coinAmount = amount;
                        } else if(code === "COUTMIXED") {
                            noteAmount = this.extractNoteCoinAmount(amount)[0];
                            coinAmount = this.extractNoteCoinAmount(amount)[1];
                        } else {
                            coinAmount = 0;
                        }
                    } else if(code === "COUTFAST") {
                        // unfortunately fastcash amount is not in cents!
                        noteAmount = amount = parseInt(result["CCTAFW_PROP_COUTFAST_AMOUNT[1]"]) / Math.pow(10, parseInt(cashInfos.exponent()));
                        coinAmount = 0;
                    } else if(code === "COUT" || code === "MAIN" || code === "") { // fallback here in case the user hasn't chosen a menu item from "MenuSelection" before
                        noteAmount = amount;
                        coinAmount = 0;
                    } else if(code === "COINOUT") {
                        amount = coinAmount;
                        noteAmount = 0;
                    } else if(code === "COUTMIXED") {
                        noteAmount = this.extractNoteCoinAmount(amount)[0];
                        coinAmount = this.extractNoteCoinAmount(amount)[1];
                    } else if(penultimateViewkey === "WithdrawalMixtureSelection") {
                        amount = displayData.amount;
                    }
                    displayData.amount = amount;
                    displayData.ada = currData.text;

                    if(penultimateViewkey !== "WithdrawalMixtureSelection" && fromViewKey !== "WithdrawalMixtureSelection") {
                        // calculate
                        let cashUnitInfos = this.getInfoFromCashUnit(noteAmount, coinAmount);
                        let distribution = calculations.doAlgo({
                            maxItems: 0, // let algo calculate
                            amount: amount, // the amount (least unit, usually cent)
                            maxNotes: 60,
                            maxCoins: 50,
                            types: cashUnitInfos.types,
                            items: cashUnitInfos.values, // the item array
                            counts: cashUnitInfos.counts, // the cont array
                            maxTries: 25000, // max tries for the alog to find solutions
                            algoMode: calculations.ALGO_MODE.FIRST_HIT_ONLY
                        });
                        displayData.denominations.length = 0; // remove denoms
                        if(distribution.isSolutionFound) {
                            // build display data
                            coinAmount = noteAmount = 0;
                            let solution = distribution.distributions[0];
                            for(let i = 0; i < solution.length; i++) {
                                let count = solution[i];
                                let value = distribution.values[i + 1];
                                let isNoteType = distribution.itemTypes[i] === 0;
                                if(isNoteType && count > 0) {
                                    noteAmount += value * count;
                                }
                                if(!isNoteType && count > 0) {
                                    coinAmount += value * count;
                                }
                                if(count > 0) {
                                    displayData.denominations.push({count: count, val: value, type: isNoteType ? 0 : 1, softLimit: 20});
                                }
                            }
                        } else {
                            if(calculations.nextHigher() && calculations.nextHigher() !== 2147486148) {
                                nextHigher = calculations.nextHigher();
                            }
                            if(calculations.nextLower() && calculations.nextLower() !== 2147486148) {
                                nextLower = calculations.nextLower();
                            }
                        }
                    } else if(fromViewKey === "WithdrawalMixtureSelection" && reason === "onPrepare") {
                        displayData.denominations = this.getAvailableDenoms(noteAmount, coinAmount);
                    }
                    // set business properties
                    await _dataService.setValues([PROP_MIXTURE_DATA, PROP_DISPENSE_AMOUNT, PROP_NOTE_DISPENSE_AMOUNT, PROP_COIN_DISPENSE_AMOUNT,
                                                    "CCTAFW_PROP_HIGH_AMOUNT_MINOR", "CCTAFW_PROP_LOW_AMOUNT_MINOR"],
                                                    [JSON.stringify(displayData), amount, noteAmount ? noteAmount : "", coinAmount ? coinAmount : "",
                                                        nextHigher ? nextHigher.toString() : "", nextLower ? nextLower.toString() : ""], null);
                } catch(e) {
                    throw `createCashMixture function failed ${e}`;
                }
            }
        },

        getLeastAvailableNoteDenom: function() {
            if(_controlPanelService.getContext().cassettesViewModel && _controlPanelService.getContext().cassettesViewModel.cassettes) {
                return _controlPanelService.getContext().cassettesViewModel.cassettes().find(item => {
                    return item.cuInfo.state() && item.cuInfo.type() === "recycle";
                });
            } else {
                return null;
            }
        },
    
        getLeastAvailableCoinDenom: function() {
            if(_controlPanelService.getContext().hopperViewModel && _controlPanelService.getContext().hopperViewModel.hoppers) {
                return _controlPanelService.getContext().hopperViewModel.hoppers().find(item => {
                    return item.cuInfo.state() && item.cuInfo.type() === "cash";
                });
            } else {
                return null;
            }
        },
    
        isAlternativeAvailable: async function() {
            let result = await _dataService.getValues(["CCTAFW_PROP_HIGH_AMOUNT_MINOR", "CCTAFW_PROP_LOW_AMOUNT_MINOR"]);
            return result["CCTAFW_PROP_HIGH_AMOUNT_MINOR"] || result["CCTAFW_PROP_LOW_AMOUNT_MINOR"];
        },

        // -- Deposit --
        getDepositDenominations: async function() {
            let result = await _dataService.getValues("CCCAINTAFW_PROP_JSON_RESULT");
            return JSON.parse(result["CCCAINTAFW_PROP_JSON_RESULT"]).denominations;
        },

        getDepositDenominationsCount: async function() {
            let denoms = await this.getDepositDenominations();
            return denoms ? denoms.length : 0;
        },

        getDepositNotesCount: async function() {
            let denoms = await this.getDepositDenominations();
            let count = 0;
            denoms.forEach(note => {
                if(note.type === 0) {
                    count += note.count;
                }
            });
            return count;
        },

        getDepositNotesAmounts: async function() {
            let denoms = await this.getDepositDenominations();
            let amounts = [];
            denoms.forEach(note => {
                if(note.type === 0) {
                    for(let i = 0; i < note.count; i++) {
                        amounts.push(note.value);
                    }
                }
            });
            return amounts;
        },

        getDepositJSONResult: async function() {
            let result = await _dataService.getValues("CCCAINTAFW_PROP_JSON_RESULT");
            // unfortunately the CCCAINTAFW_PROP_JSON_ROLLBACKNOTES contains "val" rather than CCCAINTAFW_PROP_JSON_RESULT which is "value"
            // so we support both:
            let escrow = JSON.parse(result["CCCAINTAFW_PROP_JSON_RESULT"]);
            escrow.denominations.forEach(item => {
                item.val = item.value;
            });
            return escrow;
        },
    
        getDepositJSONResultCoins: async function() {
            let escrow = await this.getDepositJSONResult();
            escrow.denominations = escrow.denominations.filter(item => {
                return parseInt(item.type) === 1;
            });
            return escrow.denominations.length ? escrow : {};
        },
    
        getDepositL2Amount: async function() {
            let denominations = await this.getDepositDenominations();
            return denominations.find(denom => {
                return parseInt(denom.level) === 2;
            });
        },

        getDepositL3Amount: async function() {
            let denominations = await this.getDepositDenominations();
            return denominations.find(denom => {
                return parseInt(denom.level) === 3;
            });
        },

        getDepositL4Amount: async function() {
            let denominations = await this.getDepositDenominations();
            return denominations.find(denom => {
                return parseInt(denom.level) === 4;
            });
        },

        updateDepositCommandStates: async function(depositConfirmState = null, depositCancelState = null) {
            try {
                if(!depositConfirmState || !depositCancelState) {
                    let props = await _dataService.getValues(["CCCAINTAFW_PROP_DEVICE_CONTROL"]);
                    let control = props["CCCAINTAFW_PROP_DEVICE_CONTROL"];
                    let confirmState = control === "IMPLICIT" ? "3" : "0";
                    _dataService.updateValues(["VAR_DEPOSIT_CONFIRM_VIEWSTATE_S", "VAR_DEPOSIT_CANCEL_VIEWSTATE_S"],
                        [!depositConfirmState ? confirmState : depositConfirmState, !depositCancelState ? "0" : depositCancelState], null);
                } else { // force direct update desired
                    _dataService.updateValues(["VAR_DEPOSIT_CONFIRM_VIEWSTATE_S", "VAR_DEPOSIT_CANCEL_VIEWSTATE_S"], [depositConfirmState, depositCancelState], null);
                }
            } catch(e) {
                throw `cashHelper::updateDepositCommandStates has been failed ${e}`;
            }
        },

        getMaxItemsOnStacker: function() {
            if(_controlPanelService.getContext().depositInfosViewModel) {
                return parseInt(_controlPanelService.getContext().depositInfosViewModel.
                    MAX_ITEMS_ON_STACKER_MAP[_controlPanelService.getContext().depositInfosViewModel.currentNoteDeviceType()]);
            } else {
                return 0;
            }
        },

        resetTrayIOReason: function() {
            if(_controlPanelService.getContext().depositInfosViewModel) {
                _controlPanelService.getContext().depositInfosViewModel.currentTrayIOReason(_controlPanelService.getContext().controlPanelData.TrayIOReasons[0]);
            }
        },


        getChequesCount: async function() {
            let res = await _dataService.getValues(["CCCHCCDMTAFW_MEDIAONSTACKER"]);
            return parseInt(res["CCCHCCDMTAFW_MEDIAONSTACKER"]);
        },

        getChequeAmount: async function(idx) {
            let res = await _dataService.getValues(`CCCHCCDMTAFW_AMOUNT[${idx}]`);
            return parseInt(res[`CCCHCCDMTAFW_AMOUNT[${idx}]`]);
        },

        getNoteAmount: async function(idx) {
            let denoms = await this.getDepositDenominations();
            if(idx < denoms.length) {
                return parseInt(denoms[idx].value) * parseInt(denoms[idx].count);
            } else {
                return 0;
            }
        },

        getChequesSum: async function() {
            let count = await this.getChequesCount();
            let sum = 0;
            for(let i = 0; i < count; i++) {
                sum += await this.getChequeAmount(i);
            }
            return sum;
        },

        createChequeEventData: async function(idx) {
            let data = {
                content_key: "",
                type: "cheque", // cheque/note
                number: idx + 1,
                maxNumber: await this.getChequesCount(),
                amount: await this.getChequeAmount(idx),
                sum: await this.getChequesSum(),
                image: "C:/PROFLEX4/BASE/WORK/FRONT01.JPG" // not relevant
            };
            return JSON.stringify(data);
        },

        createNoteEventData: async function(idx, amounts) {
            let data = {
                content_key: "",
                type: "note", // cheque/note
                number: idx + 1,
                maxNumber: await this.getDepositNotesCount(),
                amount: amounts[idx],
                sum: amounts[idx],
                image: "" // not relevant
            };
            return JSON.stringify(data);
        }

    };
});
