/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ ListViewModel_test.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

define(["lib/Squire"], function (Squire) {
  let injector;
  let ko;
  let Wincor;
  let jQuery;

  describe("ListViewModel", () => {
    let _module = {};

    beforeEach((done) => {
      injector = new Squire();
      injector.require(["NamespaceMock"], (bundle) => {
        Wincor = window.Wincor = bundle.createWincor();
        ko = Wincor.ko = window.ko = bundle.ko;
        jQuery = window.jQuery = bundle.jQuery;

        this.listData = {};

        this.genericSelectionListData_Empty = {
          elements: [],
        };

        this.genericSelectionListData = {
          elements: [
            {
              captions: ["CAPTION 0000123"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "RESULT_0",
              icon: "Icon_Placeholder_45x45.svg",
              rawresult: "ITEM_0",
              rawdata: ["Selection 0"],
            },
            {
              captions: ["CAPTION 1"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "RESULT_1",
              icon: "Icon_Placeholder_45x45.svg",
              rawresult: "ITEM_1",
              rawdata: ["Selection 1"],
            },
            {
              captions: ["CAPTION 2"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "RESULT_2",
              icon: "Icon_Placeholder_45x45.svg",
              rawresult: "ITEM_2",
              rawdata: ["Selection 2"],
            },
            {
              captions: ["CAPTION 3"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "RESULT_3",
              icon: "Icon_Placeholder_45x45.svg",
              rawresult: "ITEM_3",
              rawdata: ["Selection 3"],
            },
            {
              captions: ["CAPTION 4"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "RESULT_4",
              icon: "Icon_Placeholder_45x45.svg",
              rawresult: "ITEM_4",
              rawdata: ["Selection 4"],
            },
            {
              captions: ["CAPTION 5"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "RESULT_5",
              icon: "Icon_Placeholder_45x45.svg",
              rawresult: "ITEM_5",
              rawdata: ["Selection 5"],
            },
            {
              captions: ["CAPTION 6"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "RESULT_6",
              icon: "Icon_Placeholder_45x45.svg",
              rawresult: "ITEM_6",
              rawdata: ["Selection 6"],
            },
            {
              captions: ["CAPTION 7"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "RESULT_7",
              icon: "Icon_Placeholder_45x45.svg",
              rawresult: "ITEM_7",
              rawdata: ["Selection 7"],
            },
            {
              captions: ["CAPTION 8"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "RESULT_8",
              icon: "Icon_Placeholder_45x45.svg",
              rawresult: "ITEM_8",
              rawdata: ["Selection 8"],
            },
          ],
        };

        this.genericPrioritiesSelectionListData = {
          priorities: {
            order: [
              "COUTFAST",
              "TWO",
              "THREE",
              "FOUR",
              "FIVE",
              "SIX",
              "SEVEN",
              "EIGHT",
              "NINE",
              "TEN",
              "ELEVEN",
              "TWELVE",
              "THIRTEEN",
              "FOURTEEN",
              "FIFTEEN",
              "SIXTEEN",
              "SEVENTEEN",
              "COUT",
              "CIN",
              "BAL",
              "TRA",
              "PREPAID",
              "CINMIXED",
              "COININ",
              "COUTMIXED",
              "COINOUT",
              "STP",
              "AIN",
              "STPM",
              "CHCCDM",
              "ORDPOST",
              "ORDCASH",
              "ORDCURR",
              "LANGCHG",
              "PINCHG",
              "RECCHG",
              "FCCHG",
              "MENUCHG",
              "CUSTOM",
            ],
            itemgaps: true,
            prominent: ["COUTFAST=prominentItem", "BAL=prominentItem"],
          },
          elements: [
            {
              captions: ["Statement Print"],
              adaText: "Statement Print",
              adaPost: "Statement Print",
              state: 0,
              result: "AIN",
              icon: "mini_statement.svg",
              rawresult: "ITEM_0",
              rawdata: ["AIN"],
              order: 999,
              staticpos: -1,
              prominent: "",
            },
            {
              captions: ["Balance Inquiry"],
              adaText: "Balance Inquiry",
              adaPost: "Balance Inquiry",
              state: 0,
              result: "BAL",
              icon: "balance.svg",
              rawresult: "ITEM_1",
              rawdata: ["BAL"],
              order: 999,
              staticpos: -1,
              prominent: "prominentItem",
            },
            {
              captions: ["Bill Payment"],
              adaText: "Bill Payment",
              adaPost: "Bill Payment",
              state: 0,
              result: "BILLPAY",
              icon: "payment.svg",
              rawresult: "ITEM_2",
              rawdata: ["BILLPAY"],
              order: 999,
              staticpos: -1,
              prominent: "",
            },
            {
              captions: ["Deposit Notes"],
              adaText: "Deposit Notes",
              adaPost: "Deposit Notes",
              state: 0,
              result: "CIN",
              icon: "deposit_cash.svg",
              rawresult: "ITEM_3",
              rawdata: ["CIN"],
              order: 999,
              staticpos: -1,
              prominent: "",
            },
            {
              captions: ["Mixed Deposit"],
              adaText: "Mixed Deposit",
              adaPost: "Mixed Deposit",
              state: 0,
              result: "CINMIXED",
              icon: "deposit_mixed.svg",
              rawresult: "ITEM_4",
              rawdata: ["CINMIXED"],
              order: 999,
              staticpos: -1,
              prominent: "",
            },
            {
              captions: ["Deposit Coins"],
              adaText: "Deposit Coins",
              adaPost: "Deposit Coins",
              state: 0,
              result: "COININ",
              icon: "deposit_coins.svg",
              rawresult: "ITEM_5",
              rawdata: ["COININ"],
              order: 999,
              staticpos: -1,
              prominent: "",
            },
            {
              captions: ["Withdraw Notes"],
              adaText: "Withdraw Notes",
              adaPost: "Withdraw Notes",
              state: 0,
              result: "COUT",
              icon: "withdrawal.svg",
              rawresult: "ITEM_6",
              rawdata: ["COUT"],
              order: 999,
              staticpos: -1,
              prominent: "",
            },
            {
              captions: "EUR 50",
              adaText: "50 Euro",
              adaPost: "Fast Cash",
              state: 0,
              result: "COUTFAST",
              icon: "fast_cash.svg",
              rawresult: "ITEM_7",
              rawdata: ["COUTFAST"],
              order: 999,
              staticpos: -1,
              prominent: "prominentItem",
            },
            {
              captions: ["Mixed Withdrawal"],
              adaText: "Mixed Withdrawal",
              adaPost: "Mixed Withdrawal",
              state: 0,
              result: "COUTMIXED",
              icon: "withdrawal_mixed.svg",
              rawresult: "ITEM_8",
              rawdata: ["COUTMIXED"],
              order: 999,
              staticpos: -1,
              prominent: "",
            },
            {
              captions: ["Withdraw Coins"],
              adaText: "Withdraw Coins",
              adaPost: "Withdraw Coins",
              state: 0,
              result: "COINOUT",
              icon: "withdrawal_coins.svg",
              rawresult: "ITEM_9",
              rawdata: ["COINOUT"],
              order: 999,
              staticpos: -1,
              prominent: "",
            },
            {
              captions: ["Cheque Deposit"],
              adaText: "Cheque Deposit",
              adaPost: "Cheque Deposit",
              state: 0,
              result: "CHCCDM",
              icon: "deposit_cheque.svg",
              rawresult: "ITEM_10",
              rawdata: ["CHCCDM"],
              order: 999,
              staticpos: -1,
              prominent: "",
            },
            {
              captions: ["Mixed Media"],
              adaText: "Mixed Media Deposit",
              adaPost: "Mixed Media Deposit",
              state: 0,
              result: "MIXEDMEDIA",
              icon: "deposit_cash_cheque.svg",
              rawresult: "ITEM_11",
              rawdata: ["MIXEDMEDIA"],
              order: 999,
              staticpos: -1,
              prominent: "",
            },
            {
              captions: ["Cheque Cashing"],
              adaText: "Cheque Cashing",
              adaPost: "Cheque Cashing",
              state: 0,
              result: "CHQCASH",
              icon: "cheque_cashing_notes.svg",
              rawresult: "ITEM_12",
              rawdata: ["CHQCASH"],
              order: 999,
              staticpos: -1,
              prominent: "",
            },
            {
              captions: ["Envelope Deposit"],
              adaText: "Envelope Deposit",
              adaPost: "Envelope Deposit",
              state: 0,
              result: "ENV",
              icon: "deposit_envelope.svg",
              rawresult: "ITEM_13",
              rawdata: ["ENV"],
              order: 999,
              staticpos: -1,
              prominent: "",
            },
            {
              captions: ["Fast cash preferences"],
              adaText: "Fast cash preferences",
              adaPost: "Fast cash preferences",
              state: 0,
              result: "FCCHG",
              icon: "preferences_fastcash.svg",
              rawresult: "ITEM_14",
              rawdata: ["FCCHG"],
              order: 999,
              staticpos: -1,
              prominent: "",
            },
            {
              captions: ["Language preferences"],
              adaText: "Language preferences",
              adaPost: "Language preferences",
              state: 0,
              result: "LANGCHG",
              icon: "preferences_language.svg",
              rawresult: "ITEM_15",
              rawdata: ["LANGCHG"],
              order: 999,
              staticpos: -1,
              prominent: "",
            },
            {
              captions: ["Menu preferences"],
              adaText: "Menu preferences",
              adaPost: "Menu preferences",
              state: 0,
              result: "MENUCHG",
              icon: "preferences_mainmenu.svg",
              rawresult: "ITEM_16",
              rawdata: ["MENUCHG"],
              order: 999,
              staticpos: -1,
              prominent: "",
            },
            {
              captions: ["Cash amount order"],
              adaText: "Cash amount order",
              adaPost: "Cash amount order",
              state: 0,
              result: "ORDCASH",
              icon: "cash.svg",
              rawresult: "ITEM_17",
              rawdata: ["ORDCASH"],
              order: 999,
              staticpos: -1,
              prominent: "",
            },
            {
              captions: ["Foreign currency order"],
              adaText: "Foreign currency order",
              adaPost: "Foreign currency order",
              state: 0,
              result: "ORDCURR",
              icon: "foreign_currency.svg",
              rawresult: "ITEM_18",
              rawdata: ["ORDCURR"],
              order: 999,
              staticpos: -1,
              prominent: "",
            },
            {
              captions: ["Postal statements order"],
              adaText: "Postal statements order",
              adaPost: "Postal statements order",
              state: 0,
              result: "ORDPOST",
              icon: "mini_statement.svg",
              rawresult: "ITEM_19",
              rawdata: ["ORDPOST"],
              order: 999,
              staticpos: -1,
              prominent: "",
            },
            {
              captions: ["Cheques order"],
              adaText: "Cheques order",
              adaPost: "Cheques order",
              state: 0,
              result: "ORDCHQ",
              icon: "cheque.svg",
              rawresult: "ITEM_20",
              rawdata: ["ORDCHQ"],
              order: 999,
              staticpos: -1,
              prominent: "",
            },
            {
              captions: ["PIN change"],
              adaText: "PIN change",
              adaPost: "PIN change",
              state: 0,
              result: "PINCHG",
              icon: "pin_change.svg",
              rawresult: "ITEM_21",
              rawdata: ["PINCHG"],
              order: 999,
              staticpos: -1,
              prominent: "",
            },
            {
              captions: ["Receipt preferences"],
              adaText: "Receipt preferences",
              adaPost: "Receipt preferences",
              state: 0,
              result: "RECCHG",
              icon: "preferences_receipt.svg",
              rawresult: "ITEM_22",
              rawdata: ["RECCHG"],
              order: 999,
              staticpos: -1,
              prominent: "",
            },
            {
              captions: ["Prepaid Topup"],
              adaText: "Prepaid Topup",
              adaPost: "Prepaid Topup",
              state: 0,
              result: "PREPAID",
              icon: "prepaid.svg",
              rawresult: "ITEM_23",
              rawdata: ["PREPAID"],
              order: 999,
              staticpos: -1,
              prominent: "",
            },
            {
              captions: ["Statement Print"],
              adaText: "Statement Print",
              adaPost: "Statement Print",
              state: 0,
              result: "STP",
              icon: "mini_statement.svg",
              rawresult: "ITEM_24",
              rawdata: ["STP"],
              order: 999,
              staticpos: -1,
              prominent: "",
            },
            {
              captions: ["Mini Statement"],
              adaText: "Mini Statement",
              adaPost: "Mini Statement",
              state: 0,
              result: "STPM",
              icon: "mini_statement.svg",
              rawresult: "ITEM_25",
              rawdata: ["STPM"],
              order: 999,
              staticpos: -1,
              prominent: "",
            },
            {
              captions: ["Transfer"],
              adaText: "Transfer",
              adaPost: "Transfer",
              state: 0,
              result: "TRA",
              icon: "transfer.svg",
              rawresult: "ITEM_26",
              rawdata: ["TRA"],
              order: 999,
              staticpos: -1,
              prominent: "",
            },
            {
              captions: ["Voucher withdrawal"],
              adaText: "Voucher withdrawal",
              adaPost: "Voucher withdrawal",
              state: 0,
              result: "VOUCHER",
              icon: "voucher.svg",
              rawresult: "ITEM_27",
              rawdata: ["VOUCHER"],
              order: 999,
              staticpos: -1,
              prominent: "",
            },
            {
              captions: ["Account preferences"],
              adaText: "Account preferences",
              adaPost: "Account preferences",
              state: 0,
              result: "ACCOUNTCHG",
              icon: "preferences.svg",
              rawresult: "ITEM_28",
              rawdata: ["ACCOUNTCHG"],
              order: 999,
              staticpos: -1,
              prominent: "",
            },
            {
              captions: ["PIN Unlock"],
              adaText: "PIN Unlock",
              adaPost: "PIN Unlock",
              state: 0,
              result: "PINUNLOCK",
              icon: "pin_unlock.svg",
              rawresult: "ITEM_29",
              rawdata: ["PINUNLOCK"],
              order: 999,
              staticpos: -1,
              prominent: "",
            },
            {
              captions: ["Clear preferences"],
              adaText: "Clear preferences",
              adaPost: "Clear preferences",
              state: 0,
              result: "CLEARPREFCHG",
              icon: "preferences_receipt.svg",
              rawresult: "ITEM_30",
              rawdata: ["CLEARPREFCHG"],
              order: 999,
              staticpos: -1,
              prominent: "",
            },
          ],
        };

        this.genericPrioritiesAmountSelectionListData = {
          priorities: {
            prominent: ["AMOUNT_OTHER=prominentItem"],
            staticpos: ["AMOUNT_OTHER=8"],
            order: ["AMOUNT_OTHER"],
            itemgaps: true,
          },
          elements: [
            {
              captions: ["20", "€"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "BUTTON_0",
              icon: "currency_symbol.svg",
              rawresult: "",
              rawdata: [],
            },
            {
              captions: ["50", "€"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "BUTTON_1",
              icon: "currency_symbol.svg",
              rawresult: "",
              rawdata: [],
            },
            {
              captions: ["100", "€"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "BUTTON_2",
              icon: "currency_symbol.svg",
              rawresult: "",
              rawdata: [],
            },
            {
              captions: ["150", "€"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "BUTTON_3",
              icon: "currency_symbol.svg",
              rawresult: "",
              rawdata: [],
            },
            {
              captions: ["200", "€"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "BUTTON_4",
              icon: "currency_symbol.svg",
              rawresult: "",
              rawdata: [],
            },
            {
              captions: ["300", "€"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "BUTTON_5",
              icon: "currency_symbol.svg",
              rawresult: "",
              rawdata: [],
            },
            {
              captions: ["350", "€"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "BUTTON_6",
              icon: "currency_symbol.svg",
              rawresult: "",
              rawdata: [],
            },
            {
              captions: ["400", "€"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "BUTTON_7",
              icon: "currency_symbol.svg",
              rawresult: "",
              rawdata: [],
            },
            {
              captions: ["Other amount", ""],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "AMOUNT_OTHER",
              icon: "other_amount.svg",
              rawresult: "",
              rawdata: [],
              staticpos: 8,
            },
          ],
        };

        this.genericPrioritiesAmountSelectionListData_2 = {
          priorities: {
            prominent: ["AMOUNT_OTHER=prominentItem"],
            staticpos: ["AMOUNT_OTHER=8"],
            order: [
              "AMOUNT_OTHER",
              "FUNC1",
              "FUNC2",
              "FUNC3",
              "FUNC4",
              "BUTTON_0",
            ],
            itemgaps: true,
          },
          elements: [
            {
              captions: ["20", "€"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "BUTTON_0",
              icon: "currency_symbol.svg",
              rawresult: "",
              rawdata: [],
            },
            {
              captions: ["50", "€"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "BUTTON_1",
              icon: "currency_symbol.svg",
              rawresult: "",
              rawdata: [],
            },
            {
              captions: ["150", "€"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "BUTTON_3",
              icon: "currency_symbol.svg",
              rawresult: "",
              rawdata: [],
            },
            {
              captions: ["200", "€"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "BUTTON_4",
              icon: "currency_symbol.svg",
              rawresult: "",
              rawdata: [],
            },
            {
              captions: ["300", "€"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "BUTTON_5",
              icon: "currency_symbol.svg",
              rawresult: "",
              rawdata: [],
            },
            {
              captions: ["350", "€"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "BUTTON_6",
              icon: "currency_symbol.svg",
              rawresult: "",
              rawdata: [],
            },
            {
              captions: ["400", "€"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "BUTTON_7",
              icon: "currency_symbol.svg",
              rawresult: "",
              rawdata: [],
            },
            {
              captions: ["Other amount", ""],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "AMOUNT_OTHER",
              icon: "other_amount.svg",
              rawresult: "",
              rawdata: [],
              staticpos: 8,
            },
          ],
        };

        this.genericSelectionListData_8 = {
          elements: [
            {
              captions: ["CAPTION 0000123"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "RESULT_0",
              icon: "Icon_Placeholder_45x45.svg",
              rawresult: "ITEM_0",
              rawdata: ["Selection 0"],
            },
            {
              captions: ["CAPTION 1"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "RESULT_1",
              icon: "Icon_Placeholder_45x45.svg",
              rawresult: "ITEM_1",
              rawdata: ["Selection 1"],
            },
            {
              captions: ["CAPTION 2"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "RESULT_2",
              icon: "Icon_Placeholder_45x45.svg",
              rawresult: "ITEM_2",
              rawdata: ["Selection 2"],
            },
            {
              captions: ["CAPTION 3"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "RESULT_3",
              icon: "Icon_Placeholder_45x45.svg",
              rawresult: "ITEM_3",
              rawdata: ["Selection 3"],
            },
            {
              captions: ["CAPTION 4"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "RESULT_4",
              icon: "Icon_Placeholder_45x45.svg",
              rawresult: "ITEM_4",
              rawdata: ["Selection 4"],
            },
            {
              captions: ["CAPTION 5"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "RESULT_5",
              icon: "Icon_Placeholder_45x45.svg",
              rawresult: "ITEM_5",
              rawdata: ["Selection 5"],
            },
            {
              captions: ["CAPTION 6"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "RESULT_6",
              icon: "Icon_Placeholder_45x45.svg",
              rawresult: "ITEM_6",
              rawdata: ["Selection 6"],
            },
            {
              captions: ["CAPTION 7"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "RESULT_7",
              icon: "Icon_Placeholder_45x45.svg",
              rawresult: "ITEM_7",
              rawdata: ["Selection 7"],
            },
          ],
        };

        this.genericSelectionListData_3 = {
          elements: [
            {
              captions: ["CAPTION 0000123"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "RESULT_0",
              icon: "Icon_Placeholder_45x45.svg",
              rawresult: "ITEM_0",
              rawdata: ["Selection 0"],
            },
            {
              captions: ["CAPTION 1"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "RESULT_1",
              icon: "Icon_Placeholder_45x45.svg",
              rawresult: "ITEM_1",
              rawdata: ["Selection 1"],
            },
            {
              captions: ["CAPTION 2"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "RESULT_2",
              icon: "Icon_Placeholder_45x45.svg",
              rawresult: "ITEM_2",
              rawdata: ["Selection 2"],
            },
          ],
        };

        this.genericSelectionListData_2 = {
          elements: [
            {
              captions: ["CAPTION 0000123"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "RESULT_0",
              icon: "Icon_Placeholder_45x45.svg",
              rawresult: "ITEM_0",
              rawdata: ["Selection 0"],
            },
            {
              captions: ["CAPTION 1"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "RESULT_1",
              icon: "Icon_Placeholder_45x45.svg",
              rawresult: "ITEM_1",
              rawdata: ["Selection 1"],
            },
          ],
        };

        this.genericSelectionListData_1 = {
          elements: [
            {
              captions: ["CAPTION 0000123"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "RESULT_0",
              icon: "Icon_Placeholder_45x45.svg",
              rawresult: "ITEM_0",
              rawdata: ["Selection 0"],
            },
          ],
        };

        this.accountSelectionListData_5 = {
          elements: [
            {
              captions: ["10000", "01 Savings", "1.000.000,00€"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "BUTTON_0",
              icon: "",
              rawresult: "ITEM_0",
              rawdata: [
                "11111111111111111",
                "Primary checking account",
                "USD",
                "10.11",
                "+",
                "10000",
                "EUR",
                "1000",
                "010",
              ],
            },
            {
              captions: ["20000", "02 Savings", "2.000.000,00€"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "BUTTON_2",
              icon: "",
              rawresult: "ITEM_1",
              rawdata: [
                "2111111111111212",
                "Secondary checking account",
                "USD",
                "10000.11",
                "+",
                "10000",
                "EUR",
                "1000",
                "010",
              ],
            },
            {
              captions: ["30000", "03 Savings", "3.000.000,00€"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "BUTTON_2",
              icon: "",
              rawresult: "ITEM_1",
              rawdata: [
                "3111111111111212",
                "Secondary checking account",
                "USD",
                "10000.11",
                "+",
                "10000",
                "EUR",
                "1000",
                "010",
              ],
            },
            {
              captions: ["40000", "03 Savings", "4,00€"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "BUTTON_3",
              icon: "",
              rawresult: "ITEM_2",
              rawdata: [
                "3111111111111313",
                "Primary saving account",
                "USD",
                "3000000.11",
                "+",
                "10000",
                "EUR",
                "1000",
                "010",
              ],
            },
            {
              captions: ["50000", "04 Savings", "5,00€"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "BUTTON_4",
              icon: "",
              rawresult: "ITEM_3",
              rawdata: [
                "4111111111111414",
                "Secondary saving account",
                "USD",
                "40000.11",
                "+",
                "10000",
                "EUR",
                "1000",
                "010",
              ],
            },
          ],
        };

        this.accountSelectionListData_4 = {
          elements: [
            {
              captions: ["10000", "01 Savings", "1.000.000,00€"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "BUTTON_0",
              icon: "",
              rawresult: "ITEM_0",
              rawdata: [
                "11111111111111111",
                "Primary checking account",
                "USD",
                "10.11",
                "+",
                "10000",
                "EUR",
                "1000",
                "010",
              ],
            },
            {
              captions: ["30000", "02 Savings", "3.000.000,00€"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "BUTTON_2",
              icon: "",
              rawresult: "ITEM_1",
              rawdata: [
                "2111111111111212",
                "Secondary checking account",
                "USD",
                "10000.11",
                "+",
                "10000",
                "EUR",
                "1000",
                "010",
              ],
            },
            {
              captions: ["40000", "03 Savings", "4,00€"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "BUTTON_3",
              icon: "",
              rawresult: "ITEM_2",
              rawdata: [
                "3111111111111313",
                "Primary saving account",
                "USD",
                "3000000.11",
                "+",
                "10000",
                "EUR",
                "1000",
                "010",
              ],
            },
            {
              captions: ["50000", "04 Savings", "5,00€"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "BUTTON_4",
              icon: "",
              rawresult: "ITEM_3",
              rawdata: [
                "4111111111111414",
                "Secondary saving account",
                "USD",
                "40000.11",
                "+",
                "10000",
                "EUR",
                "1000",
                "010",
              ],
            },
          ],
        };

        this.accountSelectionListData_3 = {
          elements: [
            {
              captions: ["10000", "01 Savings", "1.000.000,00€"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "BUTTON_0",
              icon: "",
              rawresult: "ITEM_0",
              rawdata: [
                "11111111111111111",
                "Primary checking account",
                "USD",
                "10.11",
                "+",
                "10000",
                "EUR",
                "1000",
                "010",
              ],
            },
            {
              captions: ["30000", "02 Savings", "3.000.000,00€"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "BUTTON_2",
              icon: "",
              rawresult: "ITEM_1",
              rawdata: [
                "2111111111111212",
                "Secondary checking account",
                "USD",
                "10000.11",
                "+",
                "10000",
                "EUR",
                "1000",
                "010",
              ],
            },
            {
              captions: ["40000", "03 Savings", "4,00€"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "BUTTON_3",
              icon: "",
              rawresult: "ITEM_2",
              rawdata: [
                "3111111111111313",
                "Primary saving account",
                "USD",
                "3000000.11",
                "+",
                "10000",
                "EUR",
                "1000",
                "010",
              ],
            },
          ],
        };

        this.accountSelectionListData_2 = {
          elements: [
            {
              captions: ["10000", "01 Savings", "1.000.000,00€"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "BUTTON_0",
              icon: "",
              rawresult: "ITEM_0",
              rawdata: [
                "11111111111111111",
                "Primary checking account",
                "USD",
                "10.11",
                "+",
                "10000",
                "EUR",
                "1000",
                "010",
              ],
            },
            {
              captions: ["30000", "02 Savings", "3.000.000,00€"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "BUTTON_2",
              icon: "",
              rawresult: "ITEM_1",
              rawdata: [
                "2111111111111212",
                "Secondary checking account",
                "USD",
                "10000.11",
                "+",
                "10000",
                "EUR",
                "1000",
                "010",
              ],
            },
          ],
        };

        this.accountSelectionListData_1 = {
          elements: [
            {
              captions: ["10000", "01 Savings", "1.000.000,00€"],
              adaText: "",
              adaPost: "",
              state: 0,
              result: "BUTTON_0",
              icon: "",
              rawresult: "ITEM_0",
              rawdata: [
                "11111111111111111",
                "Primary checking account",
                "USD",
                "10.11",
                "+",
                "10000",
                "EUR",
                "1000",
                "010",
              ],
            },
          ],
        };

        this.config = { viewType: "softkey" };

        Wincor.UI.Content.BaseViewModel = class BaseViewModel extends (
          Wincor.UI.Content.BaseViewModel
        ) {
          constructor() {
            super();
            this.viewHelper.initScrollbarButtons = jasmine.createSpy(
              "initScrollbarButtons"
            );
          }
          onInitTextAndData() {}
          onDeactivated() {}
        };

        injector
          //.mock("content/viewmodels/base/ViewModelContainer", container)
          .mock("flexuimapping", {
            buildGuiKey: () => {
              //dummy
            },
            getGenericListData: () => {
              return Promise.resolve(this.listData);
            },
            isSubmenus: () => {
              return false;
            },
          })
          .mock("ui-content", {
            designMode: Wincor.UI.Content.designMode,
          })
          .mock("vm-container", Wincor.UI.Content.ViewModelContainer)
          .mock("vm-util/UICommanding", Wincor.UI.Content.Commanding)
          .mock("basevm", Wincor.UI.Content.BaseViewModel)
          .mock("config/Config", this.config)
          .mock("jquery", jQuery)
          .mock("knockout", ko);

        done();
      });
    });

    afterEach(() => {
      injector.remove();
    });

    describe("basic checks", () => {
      it("member check after initialize", (done) => {
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);

            expect(typeof vm.dataList).toBe("object");
            expect(typeof vm.dataList.items).toBe("function");
            expect(typeof vm.dataList.itemsLeft).toBe("function");
            expect(typeof vm.dataList.itemsRight).toBe("function");
            expect(typeof vm.visibleLimits).toBe("object");
            expect(typeof vm.listSelectionModule).toBe("object");
            expect(typeof vm.breadCrumbsObservable).toBe("function");
            expect(typeof vm.priorities).toBe("object");
            expect(Array.isArray(vm.sourceDataList)).toBe(true);
            expect(Array.isArray(vm.freeDataList)).toBe(true);
            expect(Array.isArray(vm.staticsDataList)).toBe(true);
            expect(Array.isArray(vm.pagesArray)).toBe(true);

            done();
          },
          done.fail
        );
      });

      it("check visibleLimits after observe", (done) => {
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);
            const limits = {
              visibleLimits: {
                max: 8,
                leftOnly: false,
                orientation: "BOTTOM_UP",
              },
            };
            vm.observe("flexMain", limits);
            expect(vm.visibleLimits.max).toBe(8);
            expect(vm.visibleLimits.leftOnly).toBe(false);
            expect(vm.visibleLimits.orientation).toBe("BOTTOM_UP");

            // set visibleLimits via view context:
            vm.viewConfig.config = {
              softkeys: {
                max: 6,
                leftOnly: false,
                orientation: "TOP_DOWN",
              },
            };
            vm.observe("flexMain", limits);
            expect(vm.visibleLimits.max).toBe(6);
            expect(vm.visibleLimits.leftOnly).toBe(false);
            expect(vm.visibleLimits.orientation).toBe("TOP_DOWN");

            done();
          },
          done.fail
        );
      });

      it("check setupVisualLists", (done) => {
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);
            spyOn(vm, "buildVisualLists");
            vm.setupVisualLists();
            expect(vm.isGenericListMode).toBe(true);
            expect(vm.buildVisualLists).toHaveBeenCalled();

            done();
          },
          done.fail
        );
      });

      it("check setListLen", (done) => {
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);
            vm.setListLen(3);
            expect(vm.isGenericListMode).toBe(false);
            expect(vm.srcLen).toBe(3);
            expect(vm.maxLen).toBe(3);
            expect(vm.sourceDataList).toEqual([]);
            expect(vm.freeDataList).toEqual([]);
            done();
          },
          done.fail
        );
      });

      it("check setListSource", (done) => {
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);
            vm.setListSource([1, 2, 3]);
            expect(vm.isGenericListMode).toBe(false);
            expect(vm.srcLen).toBe(3);
            expect(vm.maxLen).toBe(3);
            expect(vm.freeLen).toBe(3);
            expect(vm.sourceDataList).toEqual([1, 2, 3]);
            expect(vm.freeDataList).toEqual([1, 2, 3]);
            done();
          },
          done.fail
        );
      });

      it("check buildVisualLists softkey", (done) => {
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);
            const limits = {
              visibleLimits: {
                max: 8,
                leftOnly: false,
                orientation: "BOTTOM_UP",
              },
            };
            vm.observe("flexMain", limits);
            vm.buildVisualLists();
            expect(vm.isGenericListMode).toBe(true); // default is always true
            vm.setListSource([1, 2, 3]); // now flag must be different
            expect(vm.isGenericListMode).toBe(false);

            // Generic list mode=true
            vm.setGenericListGathering(true);
            expect(vm.isGenericListMode).toBe(true);
            vm.initCurrentVisibleLimits();
            vm.buildVisualLists();

            expect(vm.dataList.items().length).toBe(8);
            expect(vm.dataList.itemsLeft().length).toBe(4);
            expect(vm.dataList.itemsLeft()[0]).toBe(1);
            expect(vm.dataList.itemsLeft()[1]).toBe(2);
            expect(vm.dataList.itemsLeft()[2]).toBe(3);
            expect(vm.dataList.itemsLeft()[3].result).toBe("gap_3");
            expect(vm.dataList.itemsRight().length).toBe(4);
            expect(vm.dataList.itemsRight()[0].result).toBe("gap_4");
            expect(vm.dataList.itemsRight()[1].result).toBe("gap_5");
            expect(vm.dataList.itemsRight()[2].result).toBe("gap_6");
            expect(vm.dataList.itemsRight()[3].result).toBe("gap_7");

            // Generic list mode=false
            vm.setGenericListGathering(false);
            expect(vm.isGenericListMode).toBe(false);
            vm.buildVisualLists();
            expect(vm.dataList.items().length).toBe(3);
            expect(vm.dataList.itemsLeft().length).toBe(0);
            expect(vm.dataList.itemsRight().length).toBe(0);
            expect(vm.dataList.items()[0]).toBe(1);
            expect(vm.dataList.items()[1]).toBe(2);
            expect(vm.dataList.items()[2]).toBe(3);

            done();
          },
          done.fail
        );
      });

      it("check buildVisualLists touch", (done) => {
        this.config.viewType = "touch";
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);
            const limits = {
              visibleLimits: {
                max: 8,
                leftOnly: false,
                orientation: "BOTTOM_UP",
              },
            };
            vm.observe("flexMain", limits);
            vm.buildVisualLists();
            expect(vm.isGenericListMode).toBe(true); // default is always true
            vm.setListSource([1, 2, 3]); // now flag must be different
            expect(vm.isGenericListMode).toBe(false);

            // Generic list mode=true
            vm.setGenericListGathering(true);
            expect(vm.isGenericListMode).toBe(true);
            vm.initCurrentVisibleLimits();
            vm.buildVisualLists();

            expect(vm.dataList.items().length).toBe(3);
            expect(vm.dataList.itemsLeft().length).toBe(0);
            expect(vm.dataList.itemsRight().length).toBe(0);

            // Generic list mode=false
            vm.setGenericListGathering(false);
            expect(vm.isGenericListMode).toBe(false);
            vm.buildVisualLists();
            expect(vm.dataList.items().length).toBe(3);
            expect(vm.dataList.itemsLeft().length).toBe(0);
            expect(vm.dataList.itemsRight().length).toBe(0);
            expect(vm.dataList.items()[0]).toBe(1);
            expect(vm.dataList.items()[1]).toBe(2);
            expect(vm.dataList.items()[2]).toBe(3);

            done();
          },
          done.fail
        );
      });

      it("check initCurrentVisibleLimits for touch", (done) => {
        this.config.viewType = "touch";
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);

            vm.currentLen = 0;
            vm.srcLen = 10;
            vm.freeDataList.length = 0;
            vm.staticsDataList.length = 0;
            vm.initCurrentVisibleLimits();
            expect(vm.maxLen).toBe(10);
            expect(vm.currentLen).toBe(10);

            vm.currentLen = 0;
            vm.srcLen = 10;
            vm.freeDataList.length = 10;
            vm.staticsDataList.length = 0;
            vm.initCurrentVisibleLimits();
            expect(vm.maxLen).toBe(10);
            expect(vm.currentLen).toBe(10);

            vm.currentLen = 0;
            vm.srcLen = 0;
            vm.freeDataList.length = 10;
            vm.staticsDataList.length = 0;
            vm.initCurrentVisibleLimits();
            expect(vm.maxLen).toBe(10);
            expect(vm.currentLen).toBe(10);

            vm.currentLen = 0;
            vm.srcLen = 0;
            vm.freeDataList.length = 5;
            vm.staticsDataList.length = 0;
            vm.initCurrentVisibleLimits();
            expect(vm.maxLen).toBe(5);
            expect(vm.currentLen).toBe(5);

            done();
          },
          done.fail
        );
      });

      it("check initCurrentVisibleLimits for softkey", (done) => {
        this.config.viewType = "softkey";
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);

            const limits = { visibleLimits: { max: 8 } };
            vm.observe("flexMain", limits);

            vm.currentLen = 0;
            vm.srcLen = 10;
            vm.freeDataList.length = 0;
            vm.staticsDataList.length = 0;
            vm.initCurrentVisibleLimits();
            expect(vm.maxLen).toBe(10);
            expect(vm.pagesArray.length).toBe(2);
            expect(vm.currentLen).toBe(6);

            vm.currentLen = 0;
            vm.srcLen = 10;
            vm.freeDataList.length = 10;
            vm.staticsDataList.length = 0;
            vm.initCurrentVisibleLimits();
            expect(vm.maxLen).toBe(10);
            expect(vm.pagesArray.length).toBe(2);
            expect(vm.currentLen).toBe(6);

            vm.currentLen = 0;
            vm.srcLen = 0;
            vm.freeDataList.length = 10;
            vm.staticsDataList.length = 0;
            vm.initCurrentVisibleLimits();
            expect(vm.maxLen).toBe(10);
            expect(vm.pagesArray.length).toBe(2);
            expect(vm.currentLen).toBe(6);

            vm.currentLen = 0;
            vm.srcLen = 0;
            vm.freeDataList.length = 5;
            vm.staticsDataList.length = 0;
            vm.initCurrentVisibleLimits();
            expect(vm.maxLen).toBe(5);
            expect(vm.pagesArray.length).toBe(1);
            expect(vm.currentLen).toBe(8);

            vm.currentLen = 0;
            vm.srcLen = 10;
            vm.freeDataList.length = 5;
            vm.staticsDataList.length = 5;
            vm.initCurrentVisibleLimits();
            expect(vm.maxLen).toBe(10);
            expect(vm.pagesArray.length).toBe(5);
            expect(vm.currentLen).toBe(6);

            vm.currentLen = 0;
            vm.srcLen = 10;
            vm.freeDataList.length = 4;
            vm.staticsDataList.length = 6;
            vm.initCurrentVisibleLimits();
            expect(vm.maxLen).toBe(10);
            expect(vm.pagesArray.length).toBe(5);
            expect(vm.currentLen).toBe(6);

            vm.currentLen = 0;
            vm.srcLen = 10;
            vm.freeDataList.length = 0;
            vm.staticsDataList.length = 10;
            vm.initCurrentVisibleLimits();
            expect(vm.maxLen).toBe(10);
            expect(vm.pagesArray.length).toBe(5);
            expect(vm.currentLen).toBe(6);

            done();
          },
          done.fail
        );
      });
    });

    // ---- Selection (generic) ----
    describe("Generic selection tests", () => {
      it("check (generic list selection no items) counter member after onInitTextAndData", (done) => {
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);
            const limits = {
              visibleLimits: {
                max: 8,
                leftOnly: false,
                orientation: "BOTTOM_UP",
              },
            };
            vm.isGenericListMode = true;
            vm.observe("flexMain", limits);
            expect(vm.visibleLimits.max).toBe(8);
            expect(vm.visibleLimits.leftOnly).toBe(false);
            expect(vm.visibleLimits.orientation).toBe("BOTTOM_UP");

            // onInitTextAndData
            const dataKeys = [];
            this.listData = this.genericSelectionListData_Empty;
            vm.onInitTextAndData({ dataKeys: dataKeys, textKeys: [] });
            expect(dataKeys.length).toBe(1);
            expect(typeof dataKeys[0]).toBe("object"); // promise
            dataKeys[0]
              .then((data) => {
                done.fail(); // if we come here ProFlex4Op has failed
              })
              .catch(() => {
                // to not pass error into done function! This will break the test
                done();
              }); // we have to come here for a reject
          },
          done.fail
        );
      });

      it("check (generic list selection max=8, orientation=BOTTOM_UP) counter member after onInitTextAndData", (done) => {
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);
            vm.viewHelper = {
              initScrollbarButtons: jasmine.createSpy("initScrollbarButtons"),
            };
            const limits = {
              visibleLimits: {
                max: 8,
                leftOnly: false,
                orientation: "BOTTOM_UP",
              },
            };
            vm.isGenericListMode = true;
            vm.observe("flexMain", limits);
            expect(vm.visibleLimits.max).toBe(8);
            expect(vm.visibleLimits.leftOnly).toBe(false);
            expect(vm.visibleLimits.orientation).toBe("BOTTOM_UP");

            // onInitTextAndData
            const dataKeys = [];
            this.listData = this.genericSelectionListData;
            vm.onInitTextAndData({ dataKeys: dataKeys, textKeys: [] });
            expect(dataKeys.length).toBe(1);
            expect(typeof dataKeys[0]).toBe("object"); // promise
            dataKeys[0].then((data) => {
              expect(vm.srcLen).toBe(9);
              expect(vm.sourceDataList.length).toBe(9);
              expect(vm.maxLen).toBe(9);
              expect(vm.freeLen).toBe(9);
              expect(vm.staticsLen).toBe(0);
              expect(vm.listCursor).toBe(0);
              expect(vm.currentLen).toBe(6);
              expect(vm.pagesArray.length).toBe(2);
              expect(vm.dataList.items().length).toBe(6);
              expect(vm.dataList.itemsLeft().length).toBe(3);
              expect(vm.dataList.itemsRight().length).toBe(3);
              // check previous/next buttons
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledTimes(
                1
              );
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledWith(
                false,
                true,
                false,
                jasmine.any(Object)
              );
              done();
            });
          },
          done.fail
        );
      });

      it("check (generic list selection max=8, orientation=TOP_DOWN) counter member after onInitTextAndData", (done) => {
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);
            const limits = {
              visibleLimits: {
                max: 8,
                leftOnly: false,
                orientation: "TOP_DOWN",
              },
            };
            vm.isGenericListMode = true;
            vm.observe("flexMain", limits);
            expect(vm.visibleLimits.max).toBe(8);
            expect(vm.visibleLimits.leftOnly).toBe(false);
            expect(vm.visibleLimits.orientation).toBe("TOP_DOWN");

            // onInitTextAndData
            const dataKeys = [];
            this.listData = this.genericSelectionListData;
            vm.onInitTextAndData({ dataKeys: dataKeys, textKeys: [] });
            expect(dataKeys.length).toBe(1);
            expect(typeof dataKeys[0]).toBe("object"); // promise
            dataKeys[0].then((data) => {
              expect(vm.srcLen).toBe(9);
              expect(vm.sourceDataList.length).toBe(9);
              expect(vm.maxLen).toBe(9);
              expect(vm.freeLen).toBe(9);
              expect(vm.staticsLen).toBe(0);
              expect(vm.listCursor).toBe(0);
              expect(vm.currentLen).toBe(6);
              expect(vm.pagesArray.length).toBe(2);
              expect(vm.dataList.items().length).toBe(6);
              expect(vm.dataList.itemsLeft().length).toBe(3);
              expect(vm.dataList.itemsRight().length).toBe(3);
              // check previous/next buttons
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledTimes(
                1
              );
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledWith(
                false,
                true,
                false,
                jasmine.any(Object)
              );
              done();
            });
          },
          done.fail
        );
      });

      it("check (generic list selection max=6, orientation=BOTTOM_UP) counter member after onInitTextAndData", (done) => {
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);
            // check with max=6
            const limits = {
              visibleLimits: {
                max: 6,
                leftOnly: false,
                orientation: "BOTTOM_UP",
              },
            };
            vm.isGenericListMode = true;
            vm.observe("flexMain", limits);
            expect(vm.visibleLimits.max).toBe(6);
            expect(vm.visibleLimits.leftOnly).toBe(false);
            expect(vm.visibleLimits.orientation).toBe("BOTTOM_UP");

            // onInitTextAndData
            const dataKeys = [];
            this.listData = this.genericSelectionListData;
            vm.onInitTextAndData({ dataKeys: dataKeys, textKeys: [] });
            expect(dataKeys.length).toBe(1);
            expect(typeof dataKeys[0]).toBe("object"); // promise
            dataKeys[0].then((data) => {
              expect(vm.srcLen).toBe(9);
              expect(vm.sourceDataList.length).toBe(9);
              expect(vm.maxLen).toBe(9);
              expect(vm.freeLen).toBe(9);
              expect(vm.staticsLen).toBe(0);
              expect(vm.listCursor).toBe(0);
              expect(vm.currentLen).toBe(4);
              expect(vm.pagesArray.length).toBe(3);
              expect(vm.dataList.items().length).toBe(4);
              expect(vm.dataList.itemsLeft().length).toBe(3);
              expect(vm.dataList.itemsRight().length).toBe(3);
              // check previous/next buttons
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledTimes(
                1
              );
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledWith(
                false,
                true,
                false,
                jasmine.any(Object)
              );
              done();
            });
          },
          done.fail
        );
      });

      it("check (generic list selection max=6, orientation=TOP_DOWN) counter member after onInitTextAndData", (done) => {
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);
            // check with max=6
            const limits = {
              visibleLimits: {
                max: 6,
                leftOnly: false,
                orientation: "TOP_DOWN",
              },
            };
            vm.isGenericListMode = true;
            vm.observe("flexMain", limits);
            expect(vm.visibleLimits.max).toBe(6);
            expect(vm.visibleLimits.leftOnly).toBe(false);
            expect(vm.visibleLimits.orientation).toBe("TOP_DOWN");

            // onInitTextAndData
            this.listData = this.genericSelectionListData;
            const dataKeys = [];
            vm.onInitTextAndData({ dataKeys: dataKeys, textKeys: [] });
            expect(dataKeys.length).toBe(1);
            expect(typeof dataKeys[0]).toBe("object"); // promise
            dataKeys[0].then((data) => {
              expect(vm.srcLen).toBe(9);
              expect(vm.sourceDataList.length).toBe(9);
              expect(vm.maxLen).toBe(9);
              expect(vm.freeLen).toBe(9);
              expect(vm.staticsLen).toBe(0);
              expect(vm.listCursor).toBe(0);
              expect(vm.currentLen).toBe(4);
              expect(vm.pagesArray.length).toBe(3);
              expect(vm.dataList.items().length).toBe(4);
              expect(vm.dataList.itemsLeft().length).toBe(2);
              expect(vm.dataList.itemsRight().length).toBe(2);
              // check previous/next buttons
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledTimes(
                1
              );
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledWith(
                false,
                true,
                false,
                jasmine.any(Object)
              );
              done();
            });
          },
          done.fail
        );
      });

      it("check (generic list selection max=4, orientation=BOTTOM_UP) counter member after onInitTextAndData", (done) => {
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);
            // check with max=4
            const limits = {
              visibleLimits: {
                max: 4,
                leftOnly: false,
                orientation: "BOTTOM_UP",
              },
            };
            vm.isGenericListMode = true;
            vm.observe("flexMain", limits);
            expect(vm.visibleLimits.max).toBe(4);
            expect(vm.visibleLimits.leftOnly).toBe(false);
            expect(vm.visibleLimits.orientation).toBe("BOTTOM_UP");

            // onInitTextAndData
            this.listData = this.genericSelectionListData;
            const dataKeys = [];
            vm.onInitTextAndData({ dataKeys: dataKeys, textKeys: [] });
            expect(dataKeys.length).toBe(1);
            expect(typeof dataKeys[0]).toBe("object"); // promise
            dataKeys[0].then((data) => {
              expect(vm.srcLen).toBe(9);
              expect(vm.sourceDataList.length).toBe(9);
              expect(vm.maxLen).toBe(9);
              expect(vm.freeLen).toBe(9);
              expect(vm.staticsLen).toBe(0);
              expect(vm.listCursor).toBe(0);
              expect(vm.currentLen).toBe(2);
              expect(vm.pagesArray.length).toBe(5);
              expect(vm.dataList.items().length).toBe(2);
              expect(vm.dataList.itemsLeft().length).toBe(3);
              expect(vm.dataList.itemsRight().length).toBe(3);
              // check previous/next buttons
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledTimes(
                1
              );
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledWith(
                false,
                true,
                false,
                jasmine.any(Object)
              );
              done();
            });
          },
          done.fail
        );
      });

      it("check (generic list selection max=4, orientation=TOP_DOWN) counter member after onInitTextAndData", (done) => {
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);
            // check with max=4
            const limits = {
              visibleLimits: {
                max: 4,
                leftOnly: false,
                orientation: "TOP_DOWN",
              },
            };
            vm.isGenericListMode = true;
            vm.observe("flexMain", limits);
            expect(vm.visibleLimits.max).toBe(4);
            expect(vm.visibleLimits.leftOnly).toBe(false);
            expect(vm.visibleLimits.orientation).toBe("TOP_DOWN");

            // onInitTextAndData
            this.listData = this.genericSelectionListData;
            const dataKeys = [];
            vm.onInitTextAndData({ dataKeys: dataKeys, textKeys: [] });
            expect(dataKeys.length).toBe(1);
            expect(typeof dataKeys[0]).toBe("object"); // promise
            dataKeys[0].then((data) => {
              expect(vm.srcLen).toBe(9);
              expect(vm.sourceDataList.length).toBe(9);
              expect(vm.maxLen).toBe(9);
              expect(vm.freeLen).toBe(9);
              expect(vm.staticsLen).toBe(0);
              expect(vm.listCursor).toBe(0);
              expect(vm.currentLen).toBe(2);
              expect(vm.pagesArray.length).toBe(5);
              expect(vm.dataList.items().length).toBe(2);
              expect(vm.dataList.itemsLeft().length).toBe(1);
              expect(vm.dataList.itemsRight().length).toBe(1);
              // check previous/next buttons
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledTimes(
                1
              );
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledWith(
                false,
                true,
                false,
                jasmine.any(Object)
              );
              done();
            });
          },
          done.fail
        );
      });
    });

    // ---- Selection 2 (generic) with small elements count ----
    describe("Generic selection checks with small elements count", () => {
      it("check (generic list(8) selection max=8, orientation=BOTTOM_UP) counter member after onInitTextAndData", (done) => {
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);
            // check with max=8
            const limits = {
              visibleLimits: {
                max: 8,
                leftOnly: false,
                orientation: "BOTTOM_UP",
              },
            };
            vm.isGenericListMode = true;
            vm.observe("flexMain", limits);
            expect(vm.visibleLimits.max).toBe(8);
            expect(vm.visibleLimits.leftOnly).toBe(false);
            expect(vm.visibleLimits.orientation).toBe("BOTTOM_UP");

            // onInitTextAndData
            this.listData = this.genericSelectionListData_8;
            const dataKeys = [];
            vm.onInitTextAndData({ dataKeys: dataKeys, textKeys: [] });
            expect(dataKeys.length).toBe(1);
            expect(typeof dataKeys[0]).toBe("object"); // promise
            dataKeys[0].then((data) => {
              expect(vm.srcLen).toBe(8);
              expect(vm.sourceDataList.length).toBe(8);
              expect(vm.maxLen).toBe(8);
              expect(vm.freeLen).toBe(8);
              expect(vm.staticsLen).toBe(0);
              expect(vm.listCursor).toBe(0);
              expect(vm.currentLen).toBe(8);
              expect(vm.pagesArray.length).toBe(1);
              expect(vm.dataList.items().length).toBe(8);
              expect(vm.dataList.itemsLeft().length).toBe(4);
              expect(vm.dataList.itemsRight().length).toBe(4);
              // count real items list
              let count = 0;
              for (let i = 0; i < vm.dataList.items().length; i++) {
                if (vm.dataList.items()[i].result.indexOf("gap_") === -1) {
                  count++;
                }
              }
              expect(count).toBe(8);
              // count real items in left list
              count = 0;
              for (let i = 0; i < vm.dataList.itemsLeft().length; i++) {
                if (vm.dataList.itemsLeft()[i].result.indexOf("gap_") === -1) {
                  count++;
                }
              }
              expect(count).toBe(4);
              // count real items in right list
              count = 0;
              for (let i = 0; i < vm.dataList.itemsRight().length; i++) {
                if (vm.dataList.itemsRight()[i].result.indexOf("gap_") === -1) {
                  count++;
                }
              }
              expect(count).toBe(4);
              // check previous/next buttons
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledTimes(
                1
              );
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledWith(
                false,
                false,
                false,
                jasmine.any(Object)
              );
              done();
            });
          },
          done.fail
        );
      });

      it("check (generic list(3) selection max=8, orientation=BOTTOM_UP) counter member after onInitTextAndData", (done) => {
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);
            // check with max=8
            const limits = {
              visibleLimits: {
                max: 8,
                leftOnly: false,
                orientation: "BOTTOM_UP",
              },
            };
            vm.isGenericListMode = true;
            vm.observe("flexMain", limits);
            expect(vm.visibleLimits.max).toBe(8);
            expect(vm.visibleLimits.leftOnly).toBe(false);
            expect(vm.visibleLimits.orientation).toBe("BOTTOM_UP");

            // onInitTextAndData
            this.listData = this.genericSelectionListData_3;
            const dataKeys = [];
            vm.onInitTextAndData({ dataKeys: dataKeys, textKeys: [] });
            expect(dataKeys.length).toBe(1);
            expect(typeof dataKeys[0]).toBe("object"); // promise
            dataKeys[0].then((data) => {
              expect(vm.srcLen).toBe(3);
              expect(vm.sourceDataList.length).toBe(3);
              expect(vm.maxLen).toBe(3);
              expect(vm.freeLen).toBe(3);
              expect(vm.staticsLen).toBe(0);
              expect(vm.listCursor).toBe(0);
              expect(vm.currentLen).toBe(8);
              expect(vm.pagesArray.length).toBe(1);
              expect(vm.dataList.items().length).toBe(8);
              expect(vm.dataList.itemsLeft().length).toBe(4);
              expect(vm.dataList.itemsRight().length).toBe(4);
              // count real items list
              let count = 0;
              for (let i = 0; i < vm.dataList.items().length; i++) {
                if (vm.dataList.items()[i].result.indexOf("gap_") === -1) {
                  count++;
                }
              }
              expect(count).toBe(3);
              // count real items in left list
              count = 0;
              for (let i = 0; i < vm.dataList.itemsLeft().length; i++) {
                if (vm.dataList.itemsLeft()[i].result.indexOf("gap_") === -1) {
                  count++;
                }
              }
              expect(count).toBe(3);
              // count real items in right list
              count = 0;
              for (let i = 0; i < vm.dataList.itemsRight().length; i++) {
                if (vm.dataList.itemsRight()[i].result.indexOf("gap_") === -1) {
                  count++;
                }
              }
              expect(count).toBe(0);
              // check previous/next buttons
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledTimes(
                1
              );
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledWith(
                false,
                false,
                false,
                jasmine.any(Object)
              );
              done();
            });
          },
          done.fail
        );
      });

      it("check (generic list(2) selection max=8, orientation=BOTTOM_UP) counter member after onInitTextAndData", (done) => {
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);
            // check with max=8
            const limits = {
              visibleLimits: {
                max: 8,
                leftOnly: false,
                orientation: "BOTTOM_UP",
              },
            };
            vm.isGenericListMode = true;
            vm.observe("flexMain", limits);
            expect(vm.visibleLimits.max).toBe(8);
            expect(vm.visibleLimits.leftOnly).toBe(false);
            expect(vm.visibleLimits.orientation).toBe("BOTTOM_UP");

            // onInitTextAndData
            this.listData = this.genericSelectionListData_2;
            const dataKeys = [];
            vm.onInitTextAndData({ dataKeys: dataKeys, textKeys: [] });
            expect(dataKeys.length).toBe(1);
            expect(typeof dataKeys[0]).toBe("object"); // promise
            dataKeys[0].then((data) => {
              expect(vm.srcLen).toBe(2);
              expect(vm.sourceDataList.length).toBe(2);
              expect(vm.maxLen).toBe(2);
              expect(vm.freeLen).toBe(2);
              expect(vm.staticsLen).toBe(0);
              expect(vm.listCursor).toBe(0);
              expect(vm.currentLen).toBe(8);
              expect(vm.pagesArray.length).toBe(1);
              expect(vm.dataList.items().length).toBe(8);
              expect(vm.dataList.itemsLeft().length).toBe(4);
              expect(vm.dataList.itemsRight().length).toBe(4);
              // count real items list
              let count = 0;
              for (let i = 0; i < vm.dataList.items().length; i++) {
                if (vm.dataList.items()[i].result.indexOf("gap_") === -1) {
                  count++;
                }
              }
              expect(count).toBe(2);
              // count real items in left list
              count = 0;
              for (let i = 0; i < vm.dataList.itemsLeft().length; i++) {
                if (vm.dataList.itemsLeft()[i].result.indexOf("gap_") === -1) {
                  count++;
                }
              }
              expect(count).toBe(2);
              // count real items in right list
              count = 0;
              for (let i = 0; i < vm.dataList.itemsRight().length; i++) {
                if (vm.dataList.itemsRight()[i].result.indexOf("gap_") === -1) {
                  count++;
                }
              }
              expect(count).toBe(0);
              // check previous/next buttons
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledTimes(
                1
              );
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledWith(
                false,
                false,
                false,
                jasmine.any(Object)
              );
              done();
            });
          },
          done.fail
        );
      });

      it("check (generic list(2) selection max=6, orientation=BOTTOM_UP) counter member after onInitTextAndData", (done) => {
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);
            // check with max=6
            const limits = {
              visibleLimits: {
                max: 6,
                leftOnly: false,
                orientation: "BOTTOM_UP",
              },
            };
            vm.isGenericListMode = true;
            vm.observe("flexMain", limits);
            expect(vm.visibleLimits.max).toBe(6);
            expect(vm.visibleLimits.leftOnly).toBe(false);
            expect(vm.visibleLimits.orientation).toBe("BOTTOM_UP");

            // onInitTextAndData
            this.listData = this.genericSelectionListData_2;
            const dataKeys = [];
            vm.onInitTextAndData({ dataKeys: dataKeys, textKeys: [] });
            expect(dataKeys.length).toBe(1);
            expect(typeof dataKeys[0]).toBe("object"); // promise
            dataKeys[0].then((data) => {
              expect(vm.srcLen).toBe(2);
              expect(vm.sourceDataList.length).toBe(2);
              expect(vm.maxLen).toBe(2);
              expect(vm.freeLen).toBe(2);
              expect(vm.staticsLen).toBe(0);
              expect(vm.listCursor).toBe(0);
              expect(vm.currentLen).toBe(6);
              expect(vm.pagesArray.length).toBe(1);
              expect(vm.dataList.items().length).toBe(6);
              expect(vm.dataList.itemsLeft().length).toBe(4);
              expect(vm.dataList.itemsRight().length).toBe(4);
              // count real items list
              let count = 0;
              for (let i = 0; i < vm.dataList.items().length; i++) {
                if (vm.dataList.items()[i].result.indexOf("gap_") === -1) {
                  count++;
                }
              }
              expect(count).toBe(2);
              // count real items in left list
              count = 0;
              for (let i = 0; i < vm.dataList.itemsLeft().length; i++) {
                if (vm.dataList.itemsLeft()[i].result.indexOf("gap_") === -1) {
                  count++;
                }
              }
              expect(count).toBe(2);
              // count real items in right list
              count = 0;
              for (let i = 0; i < vm.dataList.itemsRight().length; i++) {
                if (vm.dataList.itemsRight()[i].result.indexOf("gap_") === -1) {
                  count++;
                }
              }
              expect(count).toBe(0);
              // check previous/next buttons
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledTimes(
                1
              );
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledWith(
                false,
                false,
                false,
                jasmine.any(Object)
              );
              done();
            });
          },
          done.fail
        );
      });

      it("check (generic list(1) selection max=8, orientation=BOTTOM_UP) counter member after onInitTextAndData", (done) => {
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);
            // check with max=8
            const limits = {
              visibleLimits: {
                max: 8,
                leftOnly: false,
                orientation: "BOTTOM_UP",
              },
            };
            vm.isGenericListMode = true;
            vm.observe("flexMain", limits);
            expect(vm.visibleLimits.max).toBe(8);
            expect(vm.visibleLimits.leftOnly).toBe(false);
            expect(vm.visibleLimits.orientation).toBe("BOTTOM_UP");

            // onInitTextAndData
            this.listData = this.genericSelectionListData_1;
            const dataKeys = [];
            vm.onInitTextAndData({ dataKeys: dataKeys, textKeys: [] });
            expect(dataKeys.length).toBe(1);
            expect(typeof dataKeys[0]).toBe("object"); // promise
            dataKeys[0].then((data) => {
              expect(vm.srcLen).toBe(1);
              expect(vm.sourceDataList.length).toBe(1);
              expect(vm.maxLen).toBe(1);
              expect(vm.freeLen).toBe(1);
              expect(vm.staticsLen).toBe(0);
              expect(vm.listCursor).toBe(0);
              expect(vm.currentLen).toBe(8);
              expect(vm.pagesArray.length).toBe(1);
              expect(vm.dataList.items().length).toBe(8);
              expect(vm.dataList.itemsLeft().length).toBe(4);
              expect(vm.dataList.itemsRight().length).toBe(4);
              // count real items list
              let count = 0;
              for (let i = 0; i < vm.dataList.items().length; i++) {
                if (vm.dataList.items()[i].result.indexOf("gap_") === -1) {
                  count++;
                }
              }
              expect(count).toBe(1);
              // count real items in left list
              count = 0;
              for (let i = 0; i < vm.dataList.itemsLeft().length; i++) {
                if (vm.dataList.itemsLeft()[i].result.indexOf("gap_") === -1) {
                  count++;
                }
              }
              expect(count).toBe(1);
              // count real items in right list
              count = 0;
              for (let i = 0; i < vm.dataList.itemsRight().length; i++) {
                if (vm.dataList.itemsRight()[i].result.indexOf("gap_") === -1) {
                  count++;
                }
              }
              expect(count).toBe(0);
              // check previous/next buttons
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledTimes(
                1
              );
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledWith(
                false,
                false,
                false,
                jasmine.any(Object)
              );
              done();
            });
          },
          done.fail
        );
      });

      it("check (generic list(1) selection max=6, orientation=BOTTOM_UP) counter member after onInitTextAndData", (done) => {
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);
            // check with max=6
            const limits = {
              visibleLimits: {
                max: 6,
                leftOnly: false,
                orientation: "BOTTOM_UP",
              },
            };
            vm.isGenericListMode = true;
            vm.observe("flexMain", limits);
            expect(vm.visibleLimits.max).toBe(6);
            expect(vm.visibleLimits.leftOnly).toBe(false);
            expect(vm.visibleLimits.orientation).toBe("BOTTOM_UP");

            // onInitTextAndData
            this.listData = this.genericSelectionListData_1;
            const dataKeys = [];
            vm.onInitTextAndData({ dataKeys: dataKeys, textKeys: [] });
            expect(dataKeys.length).toBe(1);
            expect(typeof dataKeys[0]).toBe("object"); // promise
            dataKeys[0].then((data) => {
              expect(vm.srcLen).toBe(1);
              expect(vm.sourceDataList.length).toBe(1);
              expect(vm.maxLen).toBe(1);
              expect(vm.freeLen).toBe(1);
              expect(vm.staticsLen).toBe(0);
              expect(vm.listCursor).toBe(0);
              expect(vm.currentLen).toBe(6);
              expect(vm.pagesArray.length).toBe(1);
              expect(vm.dataList.items().length).toBe(6);
              expect(vm.dataList.itemsLeft().length).toBe(4);
              expect(vm.dataList.itemsRight().length).toBe(4);
              // count real items list
              let count = 0;
              for (let i = 0; i < vm.dataList.items().length; i++) {
                if (vm.dataList.items()[i].result.indexOf("gap_") === -1) {
                  count++;
                }
              }
              expect(count).toBe(1);
              // count real items in left list
              count = 0;
              for (let i = 0; i < vm.dataList.itemsLeft().length; i++) {
                if (vm.dataList.itemsLeft()[i].result.indexOf("gap_") === -1) {
                  count++;
                }
              }
              expect(count).toBe(1);
              // count real items in right list
              count = 0;
              for (let i = 0; i < vm.dataList.itemsRight().length; i++) {
                if (vm.dataList.itemsRight()[i].result.indexOf("gap_") === -1) {
                  count++;
                }
              }
              expect(count).toBe(0);
              // check previous/next buttons
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledTimes(
                1
              );
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledWith(
                false,
                false,
                false,
                jasmine.any(Object)
              );
              done();
            });
          },
          done.fail
        );
      });
    });

    describe("Generic checks: Filter empty pages checks ", () => {
      it("filterEmptyPages with order gaps - pattern check", (done) => {
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);
            vm.initCurrentVisibleLimits = jasmine.createSpy(
              "initCurrentVisibleLimits"
            );
            vm.visibleLimits.max = 6; // this means that the last page could have 6 items left, even if the last 3 items are disabled or hidden

            // One page remaining with 6 items
            //expected:  removed (gap) | gap, gap, gap, a, b, c
            vm.freeDataList = [
              { result: "ordergap_", state: 0 },
              { result: "ordergap_", state: 0 },
              { result: "ordergap_", state: 0 },
              {
                result: "ordergap_",
                state: 0,
              },
              { result: "a", state: 0 },
              { result: "b", state: 0 },
              { result: "c", state: 0 },
            ];
            vm.currentLen = 4;
            vm.filterEmptyPages();
            expect(vm.freeDataList.length).toBe(6);
            expect(vm.initCurrentVisibleLimits).toHaveBeenCalledTimes(2);
            expect(vm.freeDataList[0].result).toBe("ordergap_");
            expect(vm.freeDataList[1].result).toBe("ordergap_");
            expect(vm.freeDataList[2].result).toBe("ordergap_");
            expect(vm.freeDataList[3].result).toBe("a");
            expect(vm.freeDataList[4].result).toBe("b");
            expect(vm.freeDataList[5].result).toBe("c");

            // One page remaining with 6 items
            //expected:  removed | gap, a, b, c
            vm.freeDataList = [
              { result: "ordergap_", state: 0 },
              { result: "ordergap_", state: 0 },
              { result: "ordergap_", state: 0 },
              { result: "ordergap_", state: 0 },
              {
                result: "ordergap_",
                state: 0,
              },
              { result: "a", state: 0 },
              { result: "b", state: 0 },
              { result: "c", state: 0 },
            ];
            vm.currentLen = 4;
            vm.filterEmptyPages();
            expect(vm.freeDataList.length).toBe(6);
            expect(vm.initCurrentVisibleLimits).toHaveBeenCalledTimes(4);
            expect(vm.freeDataList[0].result).toBe("ordergap_");
            expect(vm.freeDataList[1].result).toBe("ordergap_");
            expect(vm.freeDataList[2].result).toBe("ordergap_");
            expect(vm.freeDataList[3].result).toBe("a");
            expect(vm.freeDataList[4].result).toBe("b");
            expect(vm.freeDataList[5].result).toBe("c");

            //expected:  removed | gap, a, gap, gap| gap, gap, b, c
            vm.freeDataList = [
              { result: "ordergap_", state: 0 },
              { result: "ordergap_", state: 0 },
              { result: "ordergap_", state: 0 },
              { result: "ordergap_", state: 0 },
              {
                result: "ordergap_",
                state: 0,
              },
              { result: "a", state: 0 },
              { result: "ordergap_", state: 0 },
              { result: "ordergap_", state: 0 },
              { result: "ordergap_", state: 0 },
              {
                result: "ordergap_",
                state: 0,
              },
              { result: "b", state: 0 },
              { result: "c", state: 0 },
            ];
            vm.currentLen = 4;
            vm.filterEmptyPages();
            expect(vm.freeDataList.length).toBe(8);
            expect(vm.initCurrentVisibleLimits).toHaveBeenCalledTimes(6);
            expect(vm.freeDataList[1].result).toBe("a");
            expect(vm.freeDataList[7].result).toBe("c");

            //expected:  removed | gap, a, gap, gap| removed | b, c
            vm.freeDataList = [
              { result: "ordergap_", state: 0 },
              { result: "ordergap_", state: 0 },
              { result: "ordergap_", state: 0 },
              { result: "ordergap_", state: 0 },
              {
                result: "ordergap_",
                state: 0,
              },
              { result: "a", state: 0 },
              { result: "ordergap_", state: 0 },
              { result: "ordergap_", state: 0 },
              { result: "ordergap_", state: 0 },
              {
                result: "ordergap_",
                state: 0,
              },
              { result: "ordergap_", state: 0 },
              {
                result: "ordergap_",
                state: 0,
              },
              { result: "b", state: 0 },
              { result: "c", state: 0 },
            ];
            vm.currentLen = 4;
            vm.filterEmptyPages();
            expect(vm.freeDataList.length).toBe(6);
            expect(vm.initCurrentVisibleLimits).toHaveBeenCalledTimes(9);
            expect(vm.freeDataList[1].result).toBe("a");
            expect(vm.freeDataList[5].result).toBe("c");

            //expected:  removed | gap, a, gap, gap| removed | b, c, gap, gap | gap, gap, d
            vm.freeDataList = [
              { result: "ordergap_", state: 0 },
              { result: "ordergap_", state: 0 },
              { result: "ordergap_", state: 0 },
              { result: "ordergap_", state: 0 },
              {
                result: "ordergap_",
                state: 0,
              },
              { result: "a", state: 0 },
              { result: "ordergap_", state: 0 },
              { result: "ordergap_", state: 0 },
              { result: "ordergap_", state: 0 },
              {
                result: "ordergap_",
                state: 0,
              },
              { result: "ordergap_", state: 0 },
              {
                result: "ordergap_",
                state: 0,
              },
              { result: "b", state: 0 },
              { result: "c", state: 0 },
              { result: "ordergap_", state: 0 },
              { result: "ordergap_", state: 0 },
              { result: "ordergap_", state: 0 },
              {
                result: "ordergap_",
                state: 0,
              },
              { result: "d", state: 0 },
            ];
            vm.currentLen = 4;
            vm.filterEmptyPages();
            expect(vm.freeDataList.length).toBe(11);
            expect(vm.initCurrentVisibleLimits).toHaveBeenCalledTimes(12);
            expect(vm.freeDataList[1].result).toBe("a");
            expect(vm.freeDataList[5].result).toBe("c");
            expect(vm.freeDataList[10].result).toBe("d");

            //expected:  removed | gap, a, gap, gap| removed | b, c, gap, gap | gap, gap, gap, d
            vm.freeDataList = [
              { result: "ordergap_", state: 0 },
              { result: "ordergap_", state: 0 },
              { result: "ordergap_", state: 0 },
              { result: "ordergap_", state: 0 },
              {
                result: "ordergap_",
                state: 0,
              },
              { result: "a", state: 0 },
              { result: "ordergap_", state: 0 },
              { result: "ordergap_", state: 0 },
              { result: "ordergap_", state: 0 },
              {
                result: "ordergap_",
                state: 0,
              },
              { result: "ordergap_", state: 0 },
              {
                result: "ordergap_",
                state: 0,
              },
              { result: "b", state: 0 },
              { result: "c", state: 0 },
              { result: "ordergap_", state: 0 },
              { result: "ordergap_", state: 0 },
              { result: "ordergap_", state: 0 },
              {
                result: "ordergap_",
                state: 0,
              },
              { result: "ordergap_", state: 0 },
              { result: "d", state: 0 },
            ];
            vm.currentLen = 4;
            vm.filterEmptyPages();
            expect(vm.freeDataList.length).toBe(12);
            expect(vm.initCurrentVisibleLimits).toHaveBeenCalledTimes(15);
            expect(vm.freeDataList[1].result).toBe("a");
            expect(vm.freeDataList[5].result).toBe("c");
            expect(vm.freeDataList[11].result).toBe("d");

            //expected:  removed | gap, a, gap, gap| removed | b, c, gap, gap | removed | d
            vm.freeDataList = [
              { result: "ordergap_", state: 0 },
              { result: "ordergap_", state: 0 },
              { result: "ordergap_", state: 0 },
              { result: "ordergap_", state: 0 },
              {
                result: "ordergap_",
                state: 0,
              },
              { result: "a", state: 0 },
              { result: "ordergap_", state: 0 },
              { result: "ordergap_", state: 0 },
              { result: "ordergap_", state: 0 },
              {
                result: "ordergap_",
                state: 0,
              },
              { result: "ordergap_", state: 0 },
              {
                result: "ordergap_",
                state: 0,
              },
              { result: "b", state: 0 },
              { result: "c", state: 0 },
              { result: "ordergap_", state: 0 },
              { result: "ordergap_", state: 0 },
              { result: "ordergap_", state: 0 },
              {
                result: "ordergap_",
                state: 0,
              },
              { result: "ordergap_", state: 0 },
              { result: "ordergap_", state: 0 },
              { result: "d", state: 0 },
            ];
            vm.currentLen = 4;
            vm.filterEmptyPages();
            expect(vm.freeDataList.length).toBe(9);
            expect(vm.initCurrentVisibleLimits).toHaveBeenCalledTimes(19);
            expect(vm.freeDataList[1].result).toBe("a");
            expect(vm.freeDataList[5].result).toBe("c");
            expect(vm.freeDataList[8].result).toBe("d");

            done();
          },
          done.fail
        );
      });

      it("filterEmptyPages with state=hidden - pattern check", (done) => {
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);
            vm.initCurrentVisibleLimits = jasmine.createSpy(
              "initCurrentVisibleLimits"
            );
            vm.visibleLimits.max = 6; // this means that the last page could have 6 items left, even if the last 3 items are disabled or hidden

            //expected:  a, b, c
            vm.freeDataList = [
              { result: "a", state: 0 },
              { result: "b", state: 0 },
              { result: "c", state: 0 },
            ];
            vm.currentLen = 4;
            vm.filterEmptyPages();
            expect(vm.freeDataList.length).toBe(3);
            expect(vm.initCurrentVisibleLimits).toHaveBeenCalledTimes(1);
            expect(vm.freeDataList[0].result).toBe("a");
            expect(vm.freeDataList[2].result).toBe("c");

            //expected:  a, b, c, d
            vm.freeDataList = [
              { result: "a", state: 0 },
              { result: "b", state: 0 },
              { result: "c", state: 0 },
              { result: "d", state: 0 },
            ];
            vm.currentLen = 4;
            vm.filterEmptyPages();
            expect(vm.freeDataList.length).toBe(4);
            expect(vm.initCurrentVisibleLimits).toHaveBeenCalledTimes(2);
            expect(vm.freeDataList[0].result).toBe("a");
            expect(vm.freeDataList[3].result).toBe("d");

            //expected:  a, hidden, hidden, d
            vm.freeDataList = [
              { result: "a", state: 0 },
              { result: "b", state: 3 },
              { result: "c", state: 3 },
              { result: "d", state: 0 },
            ];
            vm.currentLen = 4;
            vm.filterEmptyPages();
            expect(vm.freeDataList.length).toBe(4);
            expect(vm.initCurrentVisibleLimits).toHaveBeenCalledTimes(3);
            expect(vm.freeDataList[0].result).toBe("a");
            expect(vm.freeDataList[3].result).toBe("d");

            //expected:  removed | hidden, f
            vm.freeDataList = [
              { result: "a", state: 3 },
              { result: "b", state: 3 },
              { result: "c", state: 3 },
              { result: "d", state: 3 },
              { result: "e", state: 3 },
              {
                result: "f",
                state: 0,
              },
            ];
            vm.currentLen = 4;
            vm.filterEmptyPages();
            expect(vm.freeDataList.length).toBe(2);
            expect(vm.initCurrentVisibleLimits).toHaveBeenCalledTimes(5);
            expect(vm.freeDataList[0].result).toBe("e");
            expect(vm.freeDataList[1].result).toBe("f");

            //expected: a, hidden, hidden, hidden, hidden, i | removed
            vm.freeDataList = [
              { result: "a", state: 0 },
              { result: "b", state: 3 },
              { result: "c", state: 3 },
              { result: "d", state: 3 },
              { result: "e", state: 3 },
              {
                result: "f",
                state: 3,
              },
              {
                result: "g",
                state: 3,
              },
              {
                result: "h",
                state: 3,
              },
              {
                result: "i",
                state: 0,
              },
            ];
            vm.currentLen = 4;
            vm.filterEmptyPages();
            expect(vm.freeDataList.length).toBe(6);
            expect(vm.initCurrentVisibleLimits).toHaveBeenCalledTimes(7);
            expect(vm.freeDataList[0].result).toBe("a");
            expect(vm.freeDataList[5].result).toBe("i");

            done();
          },
          done.fail
        );
      });

      it("filterEmptyPages with state=disabled/hidden - pattern check", (done) => {
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);
            vm.initCurrentVisibleLimits = jasmine.createSpy(
              "initCurrentVisibleLimits"
            );
            vm.visibleLimits.max = 6; // this means that the last page could have 6 items left, even if the last 3 items are disabled or hidden
            // NOTE: stateToCheck=2 means that state=3 also is a candidate to remove in case of part of a whole page

            //expected:  a, b, c
            vm.freeDataList = [
              { result: "a", state: 0 },
              { result: "b", state: 0 },
              { result: "c", state: 0 },
            ];
            vm.currentLen = 4;
            vm.filterEmptyPages(2);
            expect(vm.freeDataList.length).toBe(3);
            expect(vm.initCurrentVisibleLimits).toHaveBeenCalledTimes(1);
            expect(vm.freeDataList[0].result).toBe("a");
            expect(vm.freeDataList[2].result).toBe("c");

            //expected:  a, b, c, d
            vm.freeDataList = [
              { result: "a", state: 0 },
              { result: "b", state: 0 },
              { result: "c", state: 0 },
              { result: "d", state: 0 },
            ];
            vm.currentLen = 4;
            vm.filterEmptyPages(2);
            expect(vm.freeDataList.length).toBe(4);
            expect(vm.initCurrentVisibleLimits).toHaveBeenCalledTimes(2);
            expect(vm.freeDataList[0].result).toBe("a");
            expect(vm.freeDataList[3].result).toBe("d");

            //expected:  a, disabled, hidden, d
            vm.freeDataList = [
              { result: "a", state: 0 },
              { result: "b", state: 2 },
              { result: "c", state: 3 },
              { result: "d", state: 0 },
            ];
            vm.currentLen = 4;
            vm.filterEmptyPages(2);
            expect(vm.freeDataList.length).toBe(4);
            expect(vm.initCurrentVisibleLimits).toHaveBeenCalledTimes(3);
            expect(vm.freeDataList[0].result).toBe("a");
            expect(vm.freeDataList[3].result).toBe("d");

            //expected:  removed | hidden, f
            vm.freeDataList = [
              { result: "a", state: 3 },
              { result: "b", state: 3 },
              { result: "c", state: 3 },
              { result: "d", state: 3 },
              { result: "e", state: 3 },
              {
                result: "f",
                state: 0,
              },
            ];
            vm.currentLen = 4;
            vm.filterEmptyPages(2);
            expect(vm.freeDataList.length).toBe(2);
            expect(vm.initCurrentVisibleLimits).toHaveBeenCalledTimes(5);
            expect(vm.freeDataList[0].result).toBe("e");
            expect(vm.freeDataList[1].result).toBe("f");

            // One page remaining with 6 items
            //expected:  a, b, c, d | removed
            vm.freeDataList = [
              { result: "a", state: 0 },
              { result: "b", state: 0 },
              { result: "c", state: 0 },
              { result: "d", state: 0 },
              { result: "e", state: 2 },
              {
                result: "f",
                state: 2,
              },
              {
                result: "g",
                state: 2,
              },
            ];
            vm.currentLen = 4;
            vm.filterEmptyPages(2);
            expect(vm.freeDataList.length).toBe(6);
            expect(vm.initCurrentVisibleLimits).toHaveBeenCalledTimes(7);
            expect(vm.freeDataList[0].result).toBe("a");
            expect(vm.freeDataList[1].result).toBe("b");
            expect(vm.freeDataList[2].result).toBe("c");
            expect(vm.freeDataList[3].result).toBe("d");

            // One page remaining with 6 items
            //expected:  a, b, c, disabled | removed
            vm.freeDataList = [
              { result: "a", state: 0 },
              { result: "b", state: 0 },
              { result: "c", state: 0 },
              { result: "d", state: 2 },
              { result: "e", state: 2 },
              {
                result: "f",
                state: 2,
              },
              {
                result: "g",
                state: 2,
              },
            ];
            vm.currentLen = 4;
            vm.filterEmptyPages(2);
            expect(vm.freeDataList.length).toBe(6);
            expect(vm.initCurrentVisibleLimits).toHaveBeenCalledTimes(9);
            expect(vm.freeDataList[0].result).toBe("a");
            expect(vm.freeDataList[1].result).toBe("b");
            expect(vm.freeDataList[2].result).toBe("c");
            expect(vm.freeDataList[3].result).toBe("d");

            // One page remaining with 6 items
            //expected:  a, b, c, disabled | removed
            vm.freeDataList = [
              { result: "a", state: 0 },
              { result: "b", state: 0 },
              { result: "c", state: 0 },
              { result: "d", state: 2 },
              { result: "e", state: 2 },
              {
                result: "f",
                state: 2,
              },
              {
                result: "g",
                state: 2,
              },
              {
                result: "h",
                state: 2,
              },
            ];
            vm.currentLen = 4;
            vm.filterEmptyPages(2);
            expect(vm.freeDataList.length).toBe(6);
            expect(vm.initCurrentVisibleLimits).toHaveBeenCalledTimes(11);
            expect(vm.freeDataList[0].result).toBe("a");
            expect(vm.freeDataList[1].result).toBe("b");
            expect(vm.freeDataList[2].result).toBe("c");
            expect(vm.freeDataList[3].result).toBe("d");

            // One page remaining with 6 items
            //expected: a, disabled, disabled, disabled, hidden, i | removed
            vm.freeDataList = [
              { result: "a", state: 0 },
              { result: "b", state: 2 },
              { result: "c", state: 2 },
              { result: "d", state: 2 },
              { result: "e", state: 3 },
              {
                result: "f",
                state: 3,
              },
              {
                result: "g",
                state: 3,
              },
              {
                result: "h",
                state: 3,
              },
              {
                result: "i",
                state: 0,
              },
            ];
            vm.currentLen = 4;
            vm.filterEmptyPages(2);
            expect(vm.freeDataList.length).toBe(6);
            expect(vm.initCurrentVisibleLimits).toHaveBeenCalledTimes(13);
            expect(vm.freeDataList[0].result).toBe("a");
            expect(vm.freeDataList[5].result).toBe("i");

            done();
          },
          done.fail
        );
      });

      it("filterEmptyPages with state=disabled/hidden - pattern check, 1 page remaining (1), max=6", (done) => {
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);
            vm.initCurrentVisibleLimits = jasmine.createSpy(
              "initCurrentVisibleLimits"
            );
            vm.visibleLimits.max = 6; // this means that the last page could have 6 items left, even if the last 3 items are disabled or hidden

            // NOTE: stateToCheck=2 means that state=3 also is a candidate to remove in case of part of a whole page

            //expected:  removed | disabled, f
            vm.freeDataList = [
              { result: "a", state: 3 },
              { result: "b", state: 3 },
              { result: "c", state: 3 },
              { result: "d", state: 3 },
              { result: "e", state: 2 },
              {
                result: "f",
                state: 0,
              },
            ];
            vm.currentLen = 4;
            vm.filterEmptyPages(2);
            expect(vm.freeDataList.length).toBe(2);
            expect(vm.initCurrentVisibleLimits).toHaveBeenCalledTimes(2);
            expect(vm.freeDataList[0].result).toBe("e");
            expect(vm.freeDataList[1].result).toBe("f");

            //expected:  a, b, c, disabled (d), disabled (e), disabled (f) | removed
            vm.freeDataList = [
              { result: "a", state: 0 },
              { result: "b", state: 0 },
              { result: "c", state: 0 },
              { result: "d", state: 2 },
              { result: "e", state: 2 },
              {
                result: "f",
                state: 2,
              },
              {
                result: "g",
                state: 2,
              },
              {
                result: "h",
                state: 2,
              },
            ];
            vm.currentLen = 4;
            vm.filterEmptyPages(2);
            expect(vm.freeDataList.length).toBe(6);
            expect(vm.initCurrentVisibleLimits).toHaveBeenCalledTimes(4);
            expect(vm.freeDataList[0].result).toBe("a");
            expect(vm.freeDataList[1].result).toBe("b");
            expect(vm.freeDataList[2].result).toBe("c");
            expect(vm.freeDataList[3].result).toBe("d");
            expect(vm.freeDataList[4].result).toBe("e");
            expect(vm.freeDataList[5].result).toBe("f");

            //expected: removed | removed | h, i
            vm.freeDataList = [
              { result: "a", state: 2 },
              { result: "b", state: 2 },
              { result: "c", state: 2 },
              { result: "d", state: 2 },
              { result: "e", state: 3 },
              {
                result: "f",
                state: 3,
              },
              {
                result: "g",
                state: 3,
              },
              {
                result: "h",
                state: 3,
              },
              {
                result: "i",
                state: 0,
              },
            ];
            vm.currentLen = 4;
            vm.filterEmptyPages(2);
            expect(vm.freeDataList.length).toBe(2);
            expect(vm.initCurrentVisibleLimits).toHaveBeenCalledTimes(7);
            expect(vm.freeDataList[0].result).toBe("h");
            expect(vm.freeDataList[1].result).toBe("i");

            done();
          },
          done.fail
        );
      });

      it("filterEmptyPages with state=disabled/hidden - pattern check, 1 page remaining (2), max=6", (done) => {
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);
            vm.initCurrentVisibleLimits = jasmine.createSpy(
              "initCurrentVisibleLimits"
            );
            vm.visibleLimits.max = 6; // this means that the last page could have 6 items left, even if the last 3 items are disabled or hidden

            // NOTE: stateToCheck=2 means that state=3 also is a candidate to remove in case of part of a whole page

            //expected:  removed | disabled, f
            vm.freeDataList = [
              { result: "a", state: 0 },
              { result: "b", state: 3 },
              { result: "c", state: 0 },
              { result: "d", state: 3 },
              { result: "e", state: 2 },
              {
                result: "f",
                state: 0,
              },
            ];
            vm.currentLen = 4;
            vm.filterEmptyPages(2);
            expect(vm.freeDataList.length).toBe(6);
            expect(vm.initCurrentVisibleLimits).toHaveBeenCalledTimes(1);
            expect(vm.freeDataList[0].result).toBe("a");
            expect(vm.freeDataList[1].result).toBe("b");
            expect(vm.freeDataList[2].result).toBe("c");
            expect(vm.freeDataList[3].result).toBe("d");
            expect(vm.freeDataList[4].result).toBe("e");
            expect(vm.freeDataList[5].result).toBe("f");

            //expected:  a, b, c, disabled (d), disabled (e), disabled (f) | removed
            vm.freeDataList = [
              { result: "a", state: 0 },
              { result: "b", state: 0 },
              { result: "c", state: 0 },
              { result: "d", state: 2 },
              { result: "e", state: 2 },
              {
                result: "f",
                state: 2,
              },
              {
                result: "g",
                state: 2,
              },
              {
                result: "h",
                state: 2,
              },
            ];
            vm.currentLen = 4;
            vm.filterEmptyPages(2);
            expect(vm.freeDataList.length).toBe(6);
            expect(vm.initCurrentVisibleLimits).toHaveBeenCalledTimes(3);
            expect(vm.freeDataList[0].result).toBe("a");
            expect(vm.freeDataList[1].result).toBe("b");
            expect(vm.freeDataList[2].result).toBe("c");
            expect(vm.freeDataList[3].result).toBe("d");
            expect(vm.freeDataList[4].result).toBe("e");
            expect(vm.freeDataList[5].result).toBe("f");

            //expected:  a, b, c, disabled (d), disabled (e) | removed |, disabled (i)
            vm.freeDataList = [
              { result: "a", state: 0 },
              { result: "b", state: 0 },
              { result: "c", state: 0 },
              { result: "d", state: 2 },
              { result: "e", state: 2 },
              {
                result: "f",
                state: 2,
              },
              {
                result: "g",
                state: 2,
              },
              {
                result: "h",
                state: 2,
              },
              {
                result: "i",
                state: 2,
              },
            ];
            vm.currentLen = 4;
            vm.filterEmptyPages(2);
            expect(vm.freeDataList.length).toBe(6);
            expect(vm.initCurrentVisibleLimits).toHaveBeenCalledTimes(5);
            expect(vm.freeDataList[0].result).toBe("a");
            expect(vm.freeDataList[1].result).toBe("b");
            expect(vm.freeDataList[2].result).toBe("c");
            expect(vm.freeDataList[3].result).toBe("d");
            expect(vm.freeDataList[4].result).toBe("e");
            expect(vm.freeDataList[5].result).toBe("i");

            //expected:  a, b, c, disabled(d), | removed |, disabled(i), j
            vm.freeDataList = [
              { result: "a", state: 0 },
              { result: "b", state: 0 },
              { result: "c", state: 0 },
              { result: "d", state: 2 },
              { result: "e", state: 2 },
              {
                result: "f",
                state: 2,
              },
              {
                result: "g",
                state: 2,
              },
              {
                result: "h",
                state: 2,
              },
              {
                result: "i",
                state: 2,
              },
              {
                result: "j",
                state: 0,
              },
            ];
            vm.currentLen = 4;
            vm.filterEmptyPages(2);
            expect(vm.freeDataList.length).toBe(6);
            expect(vm.initCurrentVisibleLimits).toHaveBeenCalledTimes(7);
            expect(vm.freeDataList[0].result).toBe("a");
            expect(vm.freeDataList[1].result).toBe("b");
            expect(vm.freeDataList[2].result).toBe("c");
            expect(vm.freeDataList[3].result).toBe("d");
            expect(vm.freeDataList[4].result).toBe("i");
            expect(vm.freeDataList[5].result).toBe("j");

            //expected: a, b, c, d | removed | e, i
            vm.freeDataList = [
              { result: "a", state: 2 },
              { result: "b", state: 0 },
              { result: "c", state: 2 },
              { result: "d", state: 2 },
              { result: "e", state: 3 },
              {
                result: "f",
                state: 3,
              },
              {
                result: "g",
                state: 3,
              },
              {
                result: "h",
                state: 3,
              },
              {
                result: "i",
                state: 0,
              },
            ];
            vm.currentLen = 4;
            vm.filterEmptyPages(2);
            expect(vm.freeDataList.length).toBe(6);
            expect(vm.initCurrentVisibleLimits).toHaveBeenCalledTimes(9);
            expect(vm.freeDataList[0].result).toBe("a");
            expect(vm.freeDataList[1].result).toBe("b");
            expect(vm.freeDataList[2].result).toBe("c");
            expect(vm.freeDataList[3].result).toBe("d");
            expect(vm.freeDataList[4].result).toBe("e");
            expect(vm.freeDataList[5].result).toBe("i");

            done();
          },
          done.fail
        );
      });

      it("filterEmptyPages with state=disabled/hidden - pattern check, 1 page remaining (3), max=6", (done) => {
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);
            vm.initCurrentVisibleLimits = jasmine.createSpy(
              "initCurrentVisibleLimits"
            );
            vm.visibleLimits.max = 6; // this means that the last page could have 6 items left, even if the last 3 items are disabled or hidden

            // NOTE: stateToCheck=2 means that state=3 also is a candidate to remove in case of part of a whole page

            //expected:  a, b, c, disabled(d), | removed |, disabled(i), disabled(j)
            vm.freeDataList = [
              { result: "a", state: 0 },
              { result: "b", state: 0 },
              { result: "c", state: 0 },
              { result: "d", state: 2 },
              { result: "e", state: 2 },
              {
                result: "f",
                state: 2,
              },
              {
                result: "g",
                state: 2,
              },
              {
                result: "h",
                state: 2,
              },
              {
                result: "i",
                state: 2,
              },
              {
                result: "j",
                state: 2,
              },
            ];
            vm.currentLen = 4;
            vm.filterEmptyPages(2);
            expect(vm.freeDataList.length).toBe(6);
            expect(vm.initCurrentVisibleLimits).toHaveBeenCalledTimes(2);
            expect(vm.freeDataList[0].result).toBe("a");
            expect(vm.freeDataList[1].result).toBe("b");
            expect(vm.freeDataList[2].result).toBe("c");
            expect(vm.freeDataList[3].result).toBe("d");
            expect(vm.freeDataList[4].result).toBe("i");
            expect(vm.freeDataList[5].result).toBe("j");

            //expected:  a, b, c, disabled(d), | removed | removed |, disabled(i), disabled(j)
            vm.freeDataList = [
              { result: "a", state: 0 },
              { result: "b", state: 0 },
              { result: "c", state: 0 },
              { result: "d", state: 2 },
              { result: "e", state: 2 },
              {
                result: "f",
                state: 2,
              },
              {
                result: "g",
                state: 2,
              },
              {
                result: "h",
                state: 2,
              },
              {
                result: "i",
                state: 2,
              },
              {
                result: "j",
                state: 2,
              },
              {
                result: "k",
                state: 2,
              },
            ];
            vm.currentLen = 4;
            vm.filterEmptyPages(2);
            expect(vm.freeDataList.length).toBe(6);
            expect(vm.initCurrentVisibleLimits).toHaveBeenCalledTimes(5);
            expect(vm.freeDataList[0].result).toBe("a");
            expect(vm.freeDataList[1].result).toBe("b");
            expect(vm.freeDataList[2].result).toBe("c");
            expect(vm.freeDataList[3].result).toBe("d");
            expect(vm.freeDataList[4].result).toBe("i");
            expect(vm.freeDataList[5].result).toBe("j");

            done();
          },
          done.fail
        );
      });

      it("filterEmptyPages with state=disabled/hidden - pattern check, 1 page remaining (4), max=6", (done) => {
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);
            vm.initCurrentVisibleLimits = jasmine.createSpy(
              "initCurrentVisibleLimits"
            );
            vm.visibleLimits.max = 6; // this means that the last page could have 6 items left, even if the last 3 items are disabled or hidden

            // NOTE: stateToCheck=2 means that state=3 also is a candidate to remove in case of part of a whole page

            //expected:  a, b, c, disabled(d), | removed | removed |, disabled(i), disabled(j)
            vm.freeDataList = [
              { result: "a", state: 0 },
              { result: "b", state: 0 },
              { result: "c", state: 0 },
              { result: "d", state: 2 },
              { result: "e", state: 2 },
              {
                result: "f",
                state: 2,
              },
              {
                result: "g",
                state: 2,
              },
              {
                result: "h",
                state: 2,
              },
              {
                result: "i",
                state: 2,
              },
              {
                result: "j",
                state: 2,
              },
              {
                result: "k",
                state: 2,
              },
              {
                result: "l",
                state: 2,
              },
            ];
            vm.currentLen = 4;
            vm.filterEmptyPages(2);
            expect(vm.freeDataList.length).toBe(6);
            expect(vm.initCurrentVisibleLimits).toHaveBeenCalledTimes(3);
            expect(vm.freeDataList[0].result).toBe("a");
            expect(vm.freeDataList[1].result).toBe("b");
            expect(vm.freeDataList[2].result).toBe("c");
            expect(vm.freeDataList[3].result).toBe("d");
            expect(vm.freeDataList[4].result).toBe("i");
            expect(vm.freeDataList[5].result).toBe("j");

            //expected:  a, b, c, disabled(d), | removed | removed |, disabled(i), disabled(j)
            vm.freeDataList = [
              { result: "a", state: 0 },
              { result: "b", state: 0 },
              { result: "c", state: 0 },
              { result: "d", state: 0 },
              {
                result: "e",
                state: 2,
              },
              {
                result: "f",
                state: 2,
              },
              {
                result: "g",
                state: 2,
              },
              {
                result: "h",
                state: 2,
              },
              {
                result: "i",
                state: 2,
              },
              {
                result: "j",
                state: 2,
              },
              {
                result: "k",
                state: 2,
              },
              {
                result: "l",
                state: 2,
              },
            ];
            vm.currentLen = 4;
            vm.filterEmptyPages(2);
            expect(vm.freeDataList.length).toBe(6);
            expect(vm.initCurrentVisibleLimits).toHaveBeenCalledTimes(6);
            expect(vm.freeDataList[0].result).toBe("a");
            expect(vm.freeDataList[1].result).toBe("b");
            expect(vm.freeDataList[2].result).toBe("c");
            expect(vm.freeDataList[3].result).toBe("d");
            expect(vm.freeDataList[4].result).toBe("i");
            expect(vm.freeDataList[5].result).toBe("j");

            done();
          },
          done.fail
        );
      });

      it("filterEmptyPages with state=disabled - pattern check, 1 page remaining with 6 & 8 items max", (done) => {
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);
            vm.initCurrentVisibleLimits = jasmine.createSpy(
              "initCurrentVisibleLimits"
            );
            vm.visibleLimits.max = 6; // this means that the last page could have 6 items left, even if the last 3 items are disabled or hidden

            // NOTE: stateToCheck=2 means that state=3 also is a candidate to remove in case of part of a whole page

            //expected:  a, b, c, disabled(d), disabled(e), disabled(f) | removed(g)
            vm.freeDataList = [
              { result: "a", state: 0 },
              { result: "b", state: 0 },
              { result: "c", state: 0 },
              { result: "d", state: 2 },
              { result: "e", state: 2 },
              {
                result: "f",
                state: 2,
              },
              { result: "g", state: 2 },
            ];
            vm.currentLen = 4;
            vm.filterEmptyPages(2);
            expect(vm.freeDataList.length).toBe(6);
            expect(vm.initCurrentVisibleLimits).toHaveBeenCalledTimes(2);
            expect(vm.freeDataList[0].result).toBe("a");
            expect(vm.freeDataList[1].result).toBe("b");
            expect(vm.freeDataList[2].result).toBe("c");
            expect(vm.freeDataList[3].result).toBe("d");
            expect(vm.freeDataList[4].result).toBe("e");
            expect(vm.freeDataList[5].result).toBe("f");

            //expected:  a, b, c, disabled (d), disabled (e), disabled (f) | removed
            vm.freeDataList = [
              { result: "a", state: 0 },
              { result: "b", state: 0 },
              { result: "c", state: 0 },
              { result: "d", state: 2 },
              { result: "e", state: 2 },
              {
                result: "f",
                state: 2,
              },
              {
                result: "g",
                state: 2,
              },
              {
                result: "h",
                state: 2,
              },
            ];

            // Max=8 !!!
            vm.visibleLimits.max = 8; // this means that the last page could have 8 items left, even if the last 3 items are disabled or hidden
            vm.currentLen = 6;
            vm.filterEmptyPages(2);
            expect(vm.freeDataList.length).toBe(6);
            expect(vm.initCurrentVisibleLimits).toHaveBeenCalledTimes(4);
            expect(vm.freeDataList[0].result).toBe("a");
            expect(vm.freeDataList[1].result).toBe("b");
            expect(vm.freeDataList[2].result).toBe("c");
            expect(vm.freeDataList[3].result).toBe("d");
            expect(vm.freeDataList[4].result).toBe("e");
            expect(vm.freeDataList[5].result).toBe("f");

            //expected: | a, b, c, d, e, h, i
            vm.freeDataList = [
              { result: "a", state: 0 },
              { result: "b", state: 2 },
              { result: "c", state: 2 },
              { result: "d", state: 2 },
              { result: "e", state: 2 },
              {
                result: "f",
                state: 2,
              },
              {
                result: "g",
                state: 2,
              },
              {
                result: "h",
                state: 2,
              },
              {
                result: "i",
                state: 2,
              },
            ];
            vm.filterEmptyPages(2);
            expect(vm.freeDataList.length).toBe(8);
            expect(vm.initCurrentVisibleLimits).toHaveBeenCalledTimes(6);
            expect(vm.freeDataList[0].result).toBe("a");
            expect(vm.freeDataList[1].result).toBe("b");
            expect(vm.freeDataList[2].result).toBe("c");
            expect(vm.freeDataList[3].result).toBe("d");
            expect(vm.freeDataList[4].result).toBe("e");
            expect(vm.freeDataList[5].result).toBe("f");
            expect(vm.freeDataList[6].result).toBe("g");
            expect(vm.freeDataList[7].result).toBe("h");

            done();
          },
          done.fail
        );
      });

      it("filterEmptyPages with state=disabled - pattern check, 1 page remaining with 4 & 8 items max", (done) => {
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);
            vm.initCurrentVisibleLimits = jasmine.createSpy(
              "initCurrentVisibleLimits"
            );
            vm.visibleLimits.max = 4; // this means that the last page could have 4 items left, even if the last 3 items are disabled or hidden

            // NOTE: stateToCheck=2 means that state=3 also is a candidate to remove in case of part of a whole page

            //expected:  a, b, c, disabled(d), disabled(e), disabled(f) | removed(g)
            vm.freeDataList = [
              { result: "a", state: 0 },
              { result: "b", state: 0 },
              { result: "c", state: 0 },
              { result: "d", state: 2 },
              { result: "e", state: 2 },
              {
                result: "f",
                state: 2,
              },
              { result: "g", state: 2 },
            ];
            vm.currentLen = 2;
            vm.filterEmptyPages(2);
            expect(vm.freeDataList.length).toBe(4);
            expect(vm.initCurrentVisibleLimits).toHaveBeenCalledTimes(3);
            expect(vm.freeDataList[0].result).toBe("a");
            expect(vm.freeDataList[1].result).toBe("b");
            expect(vm.freeDataList[2].result).toBe("c");
            expect(vm.freeDataList[3].result).toBe("d");

            //expected:  a, b, c, disabled (d), disabled (e), disabled (f) | removed
            vm.freeDataList = [
              { result: "a", state: 0 },
              { result: "b", state: 0 },
              { result: "c", state: 0 },
              { result: "d", state: 2 },
              { result: "e", state: 2 },
              {
                result: "f",
                state: 2,
              },
              {
                result: "g",
                state: 2,
              },
              {
                result: "h",
                state: 2,
              },
            ];

            // Max=8 !!!
            vm.visibleLimits.max = 8; // this means that the last page could have 8 items left, even if the last 3 items are disabled or hidden
            vm.currentLen = 6;
            vm.filterEmptyPages(2);
            expect(vm.freeDataList.length).toBe(6);
            expect(vm.initCurrentVisibleLimits).toHaveBeenCalledTimes(5);
            expect(vm.freeDataList[0].result).toBe("a");
            expect(vm.freeDataList[1].result).toBe("b");
            expect(vm.freeDataList[2].result).toBe("c");
            expect(vm.freeDataList[3].result).toBe("d");
            expect(vm.freeDataList[4].result).toBe("e");
            expect(vm.freeDataList[5].result).toBe("f");

            //expected: | a, b, c, d, e, h, i
            vm.freeDataList = [
              { result: "a", state: 2 },
              { result: "b", state: 2 },
              { result: "c", state: 2 },
              { result: "d", state: 2 },
              { result: "e", state: 2 },
              {
                result: "f",
                state: 2,
              },
              {
                result: "g",
                state: 2,
              },
              {
                result: "h",
                state: 2,
              },
              {
                result: "i",
                state: 0,
              },
            ];
            vm.filterEmptyPages(2);
            expect(vm.freeDataList.length).toBe(2);
            expect(vm.initCurrentVisibleLimits).toHaveBeenCalledTimes(8);
            expect(vm.freeDataList[0].result).toBe("h"); // disabled item
            expect(vm.freeDataList[1].result).toBe("i");

            done();
          },
          done.fail
        );
      });
    });

    describe("Priorities - Generic checks: Gap handling checks", () => {
      it("check gap distribution (generic list() selection max=8, orientation=BOTTOM_UP) gaps after onInitTextAndData", (done) => {
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);
            // check with max=6
            const limits = {
              visibleLimits: {
                max: 8,
                leftOnly: false,
                orientation: "BOTTOM_UP",
              },
            };
            vm.isGenericListMode = true;
            vm.observe("flexMain", limits);
            expect(vm.visibleLimits.max).toBe(8);
            expect(vm.visibleLimits.leftOnly).toBe(false);
            expect(vm.visibleLimits.orientation).toBe("BOTTOM_UP");

            // onInitTextAndData
            this.listData = this.genericPrioritiesSelectionListData;
            const dataKeys = [];
            vm.onInitTextAndData({ dataKeys: dataKeys, textKeys: [] });
            expect(dataKeys.length).toBe(1);
            expect(typeof dataKeys[0]).toBe("object"); // promise
            dataKeys[0].then((data) => {
              expect(vm.srcLen).toBe(31);
              expect(vm.sourceDataList.length).toBe(31);
              expect(vm.maxLen).toBe(42);
              expect(vm.freeLen).toBe(42);
              expect(vm.staticsLen).toBe(0);
              expect(vm.listCursor).toBe(0);
              expect(vm.currentLen).toBe(6);
              expect(vm.pagesArray.length).toBe(7);
              expect(vm.pages().length).toBe(7);
              expect(vm.slides().length).toBe(7);
              expect(vm.dataList.items().length).toBe(6);
              expect(vm.dataList.itemsLeft().length).toBe(3);
              expect(vm.dataList.itemsRight().length).toBe(3);

              // check previous/next buttons
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledTimes(
                1
              );
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledWith(
                false,
                true,
                false,
                jasmine.any(Object)
              );

              // count real items list

              // 1. page
              expect(vm.dataList.itemsLeft()[0].result).toBe("COUTFAST");
              // Gaps on the left
              let count = 0;
              for (let i = 0; i < vm.dataList.itemsLeft().length; i++) {
                if (
                  vm.dataList.itemsLeft()[i].result.indexOf("ordergap_") !== -1
                ) {
                  count++;
                }
              }
              expect(count).toBe(2);
              // Gaps on the right
              count = 0;
              for (let i = 0; i < vm.dataList.itemsRight().length; i++) {
                if (
                  vm.dataList.itemsRight()[i].result.indexOf("ordergap_") !== -1
                ) {
                  count++;
                }
              }
              expect(count).toBe(3);

              vm.onButtonPressed("BTN_SCROLL_DOWN");
              expect(vm.pageCounter()).toBe(1);

              // 2. page
              expect(vm.dataList.itemsRight()[2].result).toBe("COUT");
              // Gaps on the left
              count = 0;
              for (let i = 0; i < vm.dataList.itemsLeft().length; i++) {
                if (
                  vm.dataList.itemsLeft()[i].result.indexOf("ordergap_") !== -1
                ) {
                  count++;
                }
              }
              expect(count).toBe(3);
              // Gaps on the right
              count = 0;
              for (let i = 0; i < vm.dataList.itemsRight().length; i++) {
                if (
                  vm.dataList.itemsRight()[i].result.indexOf("ordergap_") !== -1
                ) {
                  count++;
                }
              }
              expect(count).toBe(2);

              vm.onButtonPressed("BTN_SCROLL_DOWN");
              expect(vm.pageCounter()).toBe(2);

              // 3. page
              expect(vm.dataList.itemsLeft()[0].result).toBe("CIN");
              // No Gaps on the left
              count = 0;
              for (let i = 0; i < vm.dataList.itemsLeft().length; i++) {
                if (
                  vm.dataList.itemsLeft()[i].result.indexOf("ordergap_") !== -1
                ) {
                  count++;
                }
              }
              expect(count).toBe(0);
              // No Gaps on the right
              count = 0;
              for (let i = 0; i < vm.dataList.itemsRight().length; i++) {
                if (
                  vm.dataList.itemsRight()[i].result.indexOf("ordergap_") !== -1
                ) {
                  count++;
                }
              }
              expect(count).toBe(0);
              expect(vm.dataList.itemsRight()[2].result).toBe("COININ");

              vm.onButtonPressed("BTN_SCROLL_DOWN");
              expect(vm.pageCounter()).toBe(3);
              vm.onButtonPressed("BTN_SCROLL_DOWN");
              expect(vm.pageCounter()).toBe(4);
              vm.onButtonPressed("BTN_SCROLL_DOWN");
              expect(vm.pageCounter()).toBe(5);

              // 6. page
              expect(vm.dataList.itemsLeft()[0].result).toBe("FCCHG");
              // 1 Gap on the left
              count = 0;
              for (let i = 0; i < vm.dataList.itemsLeft().length; i++) {
                if (
                  vm.dataList.itemsLeft()[i].result.indexOf("ordergap_") !== -1
                ) {
                  count++;
                }
              }
              expect(count).toBe(1);
              // No Gaps on the right
              count = 0;
              for (let i = 0; i < vm.dataList.itemsRight().length; i++) {
                if (
                  vm.dataList.itemsRight()[i].result.indexOf("ordergap_") !== -1
                ) {
                  count++;
                }
              }
              expect(count).toBe(0);
              expect(vm.dataList.itemsRight()[2].result).toBe("CHQCASH");

              vm.onButtonPressed("BTN_SCROLL_DOWN");
              expect(vm.pageCounter()).toBe(6);

              // 7. page
              expect(vm.dataList.itemsLeft()[0].result).toBe("ENV");
              // No Gaps on the left
              count = 0;
              for (let i = 0; i < vm.dataList.itemsLeft().length; i++) {
                if (
                  vm.dataList.itemsLeft()[i].result.indexOf("ordergap_") !== -1
                ) {
                  count++;
                }
              }
              expect(count).toBe(0);
              // No Gaps on the right
              count = 0;
              for (let i = 0; i < vm.dataList.itemsRight().length; i++) {
                if (
                  vm.dataList.itemsRight()[i].result.indexOf("ordergap_") !== -1
                ) {
                  count++;
                }
              }
              expect(count).toBe(0);
              expect(vm.dataList.itemsRight()[2].result).toBe("CLEARPREFCHG");

              done();
            });
          },
          done.fail
        );
      });

      it("check gap distribution (generic list() selection max=6, orientation=BOTTOM_UP) gaps after onInitTextAndData", (done) => {
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);
            // check with max=6
            const limits = {
              visibleLimits: {
                max: 6,
                leftOnly: false,
                orientation: "BOTTOM_UP",
              },
            };
            vm.isGenericListMode = true;
            vm.observe("flexMain", limits);
            expect(vm.visibleLimits.max).toBe(6);
            expect(vm.visibleLimits.leftOnly).toBe(false);
            expect(vm.visibleLimits.orientation).toBe("BOTTOM_UP");

            // onInitTextAndData
            this.listData = this.genericPrioritiesSelectionListData;
            const dataKeys = [];
            vm.onInitTextAndData({ dataKeys: dataKeys, textKeys: [] });
            expect(dataKeys.length).toBe(1);
            expect(typeof dataKeys[0]).toBe("object"); // promise
            dataKeys[0].then((data) => {
              expect(vm.srcLen).toBe(31);
              expect(vm.sourceDataList.length).toBe(31);
              expect(vm.maxLen).toBe(36);
              expect(vm.freeLen).toBe(36);
              expect(vm.staticsLen).toBe(0);
              expect(vm.listCursor).toBe(0);
              expect(vm.currentLen).toBe(4);
              expect(vm.pagesArray.length).toBe(9);
              expect(vm.pages().length).toBe(9);
              expect(vm.slides().length).toBe(9);
              expect(vm.dataList.items().length).toBe(4);
              expect(vm.dataList.itemsLeft().length).toBe(3); // 1 gap + 2 functions
              expect(vm.dataList.itemsRight().length).toBe(3); // 1 gap + 2 functions

              // check previous/next buttons
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledTimes(
                1
              );
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledWith(
                false,
                true,
                false,
                jasmine.any(Object)
              );

              // count real items list

              // 1. page
              expect(vm.dataList.itemsLeft()[1].result).toBe("COUTFAST");
              // Gaps on the left
              let count = 0;
              for (let i = 0; i < vm.dataList.itemsLeft().length; i++) {
                if (
                  vm.dataList.itemsLeft()[i].result.indexOf("ordergap_") !== -1
                ) {
                  count++;
                }
              }
              expect(count).toBe(1);
              // Gaps on the right
              count = 0;
              for (let i = 0; i < vm.dataList.itemsRight().length; i++) {
                if (
                  vm.dataList.itemsRight()[i].result.indexOf("ordergap_") !== -1
                ) {
                  count++;
                }
              }
              expect(count).toBe(2);

              vm.onButtonPressed("BTN_SCROLL_DOWN");
              expect(vm.pageCounter()).toBe(1);

              // 2. page
              expect(vm.dataList.itemsLeft()[2].result).toBe("COUT");
              // Gaps on the left
              count = 0;
              for (let i = 0; i < vm.dataList.itemsLeft().length; i++) {
                if (
                  vm.dataList.itemsLeft()[i].result.indexOf("ordergap_") !== -1
                ) {
                  count++;
                }
              }
              expect(count).toBe(1);
              expect(vm.dataList.itemsRight()[1].result).toBe("CIN");
              // Gaps on the right
              count = 0;
              for (let i = 0; i < vm.dataList.itemsRight().length; i++) {
                if (
                  vm.dataList.itemsRight()[i].result.indexOf("ordergap_") !== -1
                ) {
                  count++;
                }
              }
              expect(count).toBe(0);

              vm.onButtonPressed("BTN_SCROLL_DOWN");
              expect(vm.pageCounter()).toBe(2);

              // 3. page
              expect(vm.dataList.itemsLeft()[1].result).toBe("TRA");
              // No Gaps on the left
              count = 0;
              for (let i = 0; i < vm.dataList.itemsLeft().length; i++) {
                if (
                  vm.dataList.itemsLeft()[i].result.indexOf("ordergap_") !== -1
                ) {
                  count++;
                }
              }
              expect(count).toBe(0);
              // No Gaps on the right
              count = 0;
              for (let i = 0; i < vm.dataList.itemsRight().length; i++) {
                if (
                  vm.dataList.itemsRight()[i].result.indexOf("ordergap_") !== -1
                ) {
                  count++;
                }
              }
              expect(count).toBe(0);
              expect(vm.dataList.itemsRight()[2].result).toBe("COININ");

              vm.onButtonPressed("BTN_SCROLL_DOWN");
              expect(vm.pageCounter()).toBe(3);
              vm.onButtonPressed("BTN_SCROLL_DOWN");
              expect(vm.pageCounter()).toBe(4);
              vm.onButtonPressed("BTN_SCROLL_DOWN");
              expect(vm.pageCounter()).toBe(5);

              // 6. page
              expect(vm.dataList.itemsLeft()[1].result).toBe("ORDCURR");
              // 1 Gap on the left
              count = 0;
              for (let i = 0; i < vm.dataList.itemsLeft().length; i++) {
                if (
                  vm.dataList.itemsLeft()[i].result.indexOf("ordergap_") !== -1
                ) {
                  count++;
                }
              }
              expect(count).toBe(0);
              // No Gaps on the right
              count = 0;
              for (let i = 0; i < vm.dataList.itemsRight().length; i++) {
                if (
                  vm.dataList.itemsRight()[i].result.indexOf("ordergap_") !== -1
                ) {
                  count++;
                }
              }
              expect(count).toBe(0);
              expect(vm.dataList.itemsRight()[2].result).toBe("RECCHG");

              vm.onButtonPressed("BTN_SCROLL_DOWN");
              expect(vm.pageCounter()).toBe(6);

              // 7. page
              expect(vm.dataList.itemsLeft()[1].result).toBe("FCCHG");
              // No Gaps on the left
              count = 0;
              for (let i = 0; i < vm.dataList.itemsLeft().length; i++) {
                if (
                  vm.dataList.itemsLeft()[i].result.indexOf("ordergap_") !== -1
                ) {
                  count++;
                }
              }
              expect(count).toBe(0);
              // No Gaps on the right
              count = 0;
              for (let i = 0; i < vm.dataList.itemsRight().length; i++) {
                if (
                  vm.dataList.itemsRight()[i].result.indexOf("ordergap_") !== -1
                ) {
                  count++;
                }
              }
              expect(count).toBe(1);
              expect(vm.dataList.itemsRight()[2].result).toBe("BILLPAY");

              vm.onButtonPressed("BTN_SCROLL_DOWN");
              expect(vm.pageCounter()).toBe(7);
              vm.onButtonPressed("BTN_SCROLL_DOWN");
              expect(vm.pageCounter()).toBe(8);

              // 9. page
              expect(vm.dataList.itemsLeft()[1].result).toBe("VOUCHER");
              // No Gaps on the left
              count = 0;
              for (let i = 0; i < vm.dataList.itemsLeft().length; i++) {
                if (
                  vm.dataList.itemsLeft()[i].result.indexOf("ordergap_") !== -1
                ) {
                  count++;
                }
              }
              expect(count).toBe(0);
              // No Gaps on the right
              count = 0;
              for (let i = 0; i < vm.dataList.itemsRight().length; i++) {
                if (
                  vm.dataList.itemsRight()[i].result.indexOf("ordergap_") !== -1
                ) {
                  count++;
                }
              }
              expect(count).toBe(0);
              expect(vm.dataList.itemsRight()[2].result).toBe("CLEARPREFCHG");

              done();
            });
          },
          done.fail
        );
      });
    });

    describe("Priorities - Generic checks: Static handling checks", () => {
      it("check static distribution (generic list() selection max=8, orientation=BOTTOM_UP) gaps and static after onInitTextAndData", (done) => {
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);
            // check with max=6
            const limits = {
              visibleLimits: {
                max: 8,
                leftOnly: false,
                orientation: "BOTTOM_UP",
              },
            };
            vm.isGenericListMode = true;
            vm.observe("flexMain", limits);
            expect(vm.visibleLimits.max).toBe(8);
            expect(vm.visibleLimits.leftOnly).toBe(false);
            expect(vm.visibleLimits.orientation).toBe("BOTTOM_UP");

            // onInitTextAndData
            this.listData = this.genericPrioritiesAmountSelectionListData;
            const dataKeys = [];
            vm.onInitTextAndData({ dataKeys: dataKeys, textKeys: [] });
            expect(dataKeys.length).toBe(1);
            expect(typeof dataKeys[0]).toBe("object"); // promise
            dataKeys[0].then((data) => {
              expect(vm.srcLen).toBe(9);
              expect(vm.sourceDataList.length).toBe(9);
              expect(vm.maxLen).toBe(9);
              expect(vm.freeLen).toBe(8);
              expect(vm.staticsLen).toBe(1); // one static item
              expect(vm.listCursor).toBe(0);
              expect(vm.currentLen).toBe(6);
              expect(vm.pagesArray.length).toBe(2);
              expect(vm.pages().length).toBe(2);
              expect(vm.slides().length).toBe(2);
              expect(vm.dataList.items().length).toBe(6);
              expect(vm.dataList.itemsLeft().length).toBe(3);
              expect(vm.dataList.itemsRight().length).toBe(3);

              // check previous/next buttons
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledTimes(
                1
              );
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledWith(
                false,
                true,
                false,
                jasmine.any(Object)
              );

              // count real items list

              // 1. page
              expect(vm.dataList.itemsLeft()[0].result).toBe("BUTTON_0");
              // Gaps on the left
              let count = 0;
              for (let i = 0; i < vm.dataList.itemsLeft().length; i++) {
                if (
                  vm.dataList.itemsLeft()[i].result.indexOf("ordergap_") !== -1
                ) {
                  count++;
                }
              }
              expect(count).toBe(0);
              // Gaps on the right
              count = 0;
              for (let i = 0; i < vm.dataList.itemsRight().length; i++) {
                if (
                  vm.dataList.itemsRight()[i].result.indexOf("ordergap_") !== -1
                ) {
                  count++;
                }
              }
              expect(count).toBe(0);
              expect(vm.dataList.itemsRight()[2].result).toBe("AMOUNT_OTHER");

              vm.onButtonPressed("BTN_SCROLL_DOWN");
              expect(vm.pageCounter()).toBe(1);

              // 2. page
              expect(vm.dataList.itemsLeft()[0].result).toBe("BUTTON_5");
              // Gaps on the left
              count = 0;
              for (let i = 0; i < vm.dataList.itemsLeft().length; i++) {
                if (vm.dataList.itemsLeft()[i].result.indexOf("gap_") !== -1) {
                  count++;
                }
              }
              expect(count).toBe(0);
              // Gaps on the right
              count = 0;
              for (let i = 0; i < vm.dataList.itemsRight().length; i++) {
                if (vm.dataList.itemsRight()[i].result.indexOf("gap_") !== -1) {
                  count++;
                }
              }
              expect(count).toBe(2);
              expect(vm.dataList.itemsRight()[2].result).toBe("AMOUNT_OTHER");
              done();
            });
          },
          done.fail
        );
      });

      it("check static distribution (generic list() selection max=8, orientation=BOTTOM_UP) gaps with 4 pseudofuncs and static after onInitTextAndData", (done) => {
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);
            // check with max=6
            const limits = {
              visibleLimits: {
                max: 8,
                leftOnly: false,
                orientation: "BOTTOM_UP",
              },
            };
            vm.isGenericListMode = true;
            vm.observe("flexMain", limits);
            expect(vm.visibleLimits.max).toBe(8);
            expect(vm.visibleLimits.leftOnly).toBe(false);
            expect(vm.visibleLimits.orientation).toBe("BOTTOM_UP");

            // onInitTextAndData
            this.listData = this.genericPrioritiesAmountSelectionListData_2;
            const dataKeys = [];
            vm.onInitTextAndData({ dataKeys: dataKeys, textKeys: [] });
            expect(dataKeys.length).toBe(1);
            expect(typeof dataKeys[0]).toBe("object"); // promise
            dataKeys[0].then((data) => {
              expect(vm.srcLen).toBe(8);
              expect(vm.sourceDataList.length).toBe(8);
              expect(vm.maxLen).toBe(12);
              expect(vm.freeLen).toBe(11);
              expect(vm.staticsLen).toBe(1); // one static item
              expect(vm.listCursor).toBe(0);
              expect(vm.currentLen).toBe(6);
              expect(vm.pagesArray.length).toBe(3);
              expect(vm.pages().length).toBe(3);
              expect(vm.slides().length).toBe(3);
              expect(vm.dataList.items().length).toBe(6);
              expect(vm.dataList.itemsLeft().length).toBe(3);
              expect(vm.dataList.itemsRight().length).toBe(3);

              // check previous/next buttons
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledTimes(
                1
              );
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledWith(
                false,
                true,
                false,
                jasmine.any(Object)
              );

              // count real items list

              // 1. page
              // Gaps on the left
              let count = 0;
              for (let i = 0; i < vm.dataList.itemsLeft().length; i++) {
                if (
                  vm.dataList.itemsLeft()[i].result.indexOf("ordergap_") !== -1
                ) {
                  count++;
                }
              }
              expect(count).toBe(3);
              // Gaps on the right
              count = 0;
              for (let i = 0; i < vm.dataList.itemsRight().length; i++) {
                if (
                  vm.dataList.itemsRight()[i].result.indexOf("ordergap_") !== -1
                ) {
                  count++;
                }
              }
              expect(count).toBe(1);
              expect(vm.dataList.itemsRight()[1].result).toBe("BUTTON_0");
              expect(vm.dataList.itemsRight()[2].result).toBe("AMOUNT_OTHER");

              vm.onButtonPressed("BTN_SCROLL_DOWN");
              expect(vm.pageCounter()).toBe(1);

              // 2. page
              expect(vm.dataList.itemsLeft()[0].result).toBe("BUTTON_1");
              // Gaps on the left
              count = 0;
              for (let i = 0; i < vm.dataList.itemsLeft().length; i++) {
                if (vm.dataList.itemsLeft()[i].result.indexOf("gap_") !== -1) {
                  count++;
                }
              }
              expect(count).toBe(0);
              // Gaps on the right
              count = 0;
              for (let i = 0; i < vm.dataList.itemsRight().length; i++) {
                if (vm.dataList.itemsRight()[i].result.indexOf("gap_") !== -1) {
                  count++;
                }
              }
              expect(count).toBe(0);
              expect(vm.dataList.itemsRight()[1].result).toBe("BUTTON_6");
              expect(vm.dataList.itemsRight()[2].result).toBe("AMOUNT_OTHER");

              vm.onButtonPressed("BTN_SCROLL_DOWN");
              expect(vm.pageCounter()).toBe(2);

              // 3. page
              expect(vm.dataList.itemsLeft()[0].result).toBe("BUTTON_7");
              // Gaps on the left
              count = 0;
              for (let i = 0; i < vm.dataList.itemsLeft().length; i++) {
                if (vm.dataList.itemsLeft()[i].result.indexOf("gap_") !== -1) {
                  count++;
                }
              }
              expect(count).toBe(2);
              // Gaps on the right
              count = 0;
              for (let i = 0; i < vm.dataList.itemsRight().length; i++) {
                if (vm.dataList.itemsRight()[i].result.indexOf("gap_") !== -1) {
                  count++;
                }
              }
              expect(count).toBe(2);
              expect(vm.dataList.itemsRight()[2].result).toBe("AMOUNT_OTHER");

              done();
            });
          },
          done.fail
        );
      });

      it("check static distribution (generic list() selection max=6, orientation=BOTTOM_UP) gaps and static after onInitTextAndData", (done) => {
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);
            // check with max=6
            const limits = {
              visibleLimits: {
                max: 6,
                leftOnly: false,
                orientation: "BOTTOM_UP",
              },
            };
            vm.isGenericListMode = true;
            vm.observe("flexMain", limits);
            expect(vm.visibleLimits.max).toBe(6);
            expect(vm.visibleLimits.leftOnly).toBe(false);
            expect(vm.visibleLimits.orientation).toBe("BOTTOM_UP");

            // onInitTextAndData
            this.listData = this.genericPrioritiesAmountSelectionListData;
            const dataKeys = [];
            vm.onInitTextAndData({ dataKeys: dataKeys, textKeys: [] });
            expect(dataKeys.length).toBe(1);
            expect(typeof dataKeys[0]).toBe("object"); // promise
            dataKeys[0].then((data) => {
              expect(vm.srcLen).toBe(9);
              expect(vm.sourceDataList.length).toBe(9);
              expect(vm.maxLen).toBe(9);
              expect(vm.freeLen).toBe(8);
              expect(vm.staticsLen).toBe(1); // one static item
              expect(vm.listCursor).toBe(0);
              expect(vm.currentLen).toBe(4);
              expect(vm.pagesArray.length).toBe(3);
              expect(vm.pages().length).toBe(3);
              expect(vm.slides().length).toBe(3);
              expect(vm.dataList.items().length).toBe(4);
              expect(vm.dataList.itemsLeft().length).toBe(3); // 1 gap + 2 items, because of BOTTOM_UP
              expect(vm.dataList.itemsRight().length).toBe(3); // 1 gap + 2 items, because of BOTTOM_UP

              // check previous/next buttons
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledTimes(
                1
              );
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledWith(
                false,
                true,
                false,
                jasmine.any(Object)
              );

              // count real items list

              // 1. page
              expect(vm.dataList.itemsLeft()[1].result).toBe("BUTTON_0");
              // Gaps on the left
              let count = 0;
              for (let i = 0; i < vm.dataList.itemsLeft().length; i++) {
                if (vm.dataList.itemsLeft()[i].result.indexOf("gap_") !== -1) {
                  count++;
                }
              }
              expect(count).toBe(1);
              // Gaps on the right
              count = 0;
              for (let i = 0; i < vm.dataList.itemsRight().length; i++) {
                if (vm.dataList.itemsRight()[i].result.indexOf("gap_") !== -1) {
                  count++;
                }
              }
              expect(count).toBe(1);
              expect(vm.dataList.itemsRight()[2].result).toBe("AMOUNT_OTHER"); // static pos

              vm.onButtonPressed("BTN_SCROLL_DOWN");
              expect(vm.pageCounter()).toBe(1);

              // 2. page
              expect(vm.dataList.itemsLeft()[1].result).toBe("BUTTON_3");
              // Gaps on the left
              count = 0;
              for (let i = 0; i < vm.dataList.itemsLeft().length; i++) {
                if (vm.dataList.itemsLeft()[i].result.indexOf("gap_") !== -1) {
                  count++;
                }
              }
              expect(count).toBe(1);
              // Gaps on the right
              count = 0;
              for (let i = 0; i < vm.dataList.itemsRight().length; i++) {
                if (vm.dataList.itemsRight()[i].result.indexOf("gap_") !== -1) {
                  count++;
                }
              }
              expect(count).toBe(1);
              expect(vm.dataList.itemsRight()[2].result).toBe("AMOUNT_OTHER"); // static pos

              vm.onButtonPressed("BTN_SCROLL_DOWN");
              expect(vm.pageCounter()).toBe(2);

              // 3. page
              expect(vm.dataList.itemsLeft()[1].result).toBe("BUTTON_6");
              // Gaps on the left
              count = 0;
              for (let i = 0; i < vm.dataList.itemsLeft().length; i++) {
                if (vm.dataList.itemsLeft()[i].result.indexOf("gap_") !== -1) {
                  count++;
                }
              }
              expect(count).toBe(1);
              // Gaps on the right
              count = 0;
              for (let i = 0; i < vm.dataList.itemsRight().length; i++) {
                if (vm.dataList.itemsRight()[i].result.indexOf("gap_") !== -1) {
                  count++;
                }
              }
              expect(count).toBe(2);
              expect(vm.dataList.itemsRight()[2].result).toBe("AMOUNT_OTHER"); // static pos

              done();
            });
          },
          done.fail
        );
      });

      it("check static distribution (generic list() selection max=6, orientation=BOTTOM_UP) gaps and static after onInitTextAndData", (done) => {
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);
            // check with max=6
            const limits = {
              visibleLimits: {
                max: 6,
                leftOnly: false,
                orientation: "BOTTOM_UP",
              },
            };
            vm.isGenericListMode = true;
            vm.observe("flexMain", limits);
            expect(vm.visibleLimits.max).toBe(6);
            expect(vm.visibleLimits.leftOnly).toBe(false);
            expect(vm.visibleLimits.orientation).toBe("BOTTOM_UP");

            // onInitTextAndData
            this.listData = this.genericPrioritiesAmountSelectionListData;
            const dataKeys = [];
            vm.onInitTextAndData({ dataKeys: dataKeys, textKeys: [] });
            expect(dataKeys.length).toBe(1);
            expect(typeof dataKeys[0]).toBe("object"); // promise
            dataKeys[0].then((data) => {
              expect(vm.srcLen).toBe(9);
              expect(vm.sourceDataList.length).toBe(9);
              expect(vm.maxLen).toBe(9);
              expect(vm.freeLen).toBe(8);
              expect(vm.staticsLen).toBe(1); // one static item
              expect(vm.listCursor).toBe(0);
              expect(vm.currentLen).toBe(4);
              expect(vm.pagesArray.length).toBe(3);
              expect(vm.pages().length).toBe(3);
              expect(vm.slides().length).toBe(3);
              expect(vm.dataList.items().length).toBe(4);
              expect(vm.dataList.itemsLeft().length).toBe(3); // 1 gap + 2 items, because of BOTTOM_UP
              expect(vm.dataList.itemsRight().length).toBe(3); // 1 gap + 2 items, because of BOTTOM_UP

              // check previous/next buttons
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledTimes(
                1
              );
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledWith(
                false,
                true,
                false,
                jasmine.any(Object)
              );

              // count real items list

              // 1. page
              expect(vm.dataList.itemsLeft()[1].result).toBe("BUTTON_0");
              // Gaps on the left
              let count = 0;
              for (let i = 0; i < vm.dataList.itemsLeft().length; i++) {
                if (vm.dataList.itemsLeft()[i].result.indexOf("gap_") !== -1) {
                  count++;
                }
              }
              expect(count).toBe(1);
              // Gaps on the right
              count = 0;
              for (let i = 0; i < vm.dataList.itemsRight().length; i++) {
                if (vm.dataList.itemsRight()[i].result.indexOf("gap_") !== -1) {
                  count++;
                }
              }
              expect(count).toBe(1);
              expect(vm.dataList.itemsRight()[2].result).toBe("AMOUNT_OTHER"); // static pos

              vm.onButtonPressed("BTN_SCROLL_DOWN");
              expect(vm.pageCounter()).toBe(1);

              // 2. page
              expect(vm.dataList.itemsLeft()[1].result).toBe("BUTTON_3");
              // Gaps on the left
              count = 0;
              for (let i = 0; i < vm.dataList.itemsLeft().length; i++) {
                if (vm.dataList.itemsLeft()[i].result.indexOf("gap_") !== -1) {
                  count++;
                }
              }
              expect(count).toBe(1);
              // Gaps on the right
              count = 0;
              for (let i = 0; i < vm.dataList.itemsRight().length; i++) {
                if (vm.dataList.itemsRight()[i].result.indexOf("gap_") !== -1) {
                  count++;
                }
              }
              expect(count).toBe(1);
              expect(vm.dataList.itemsRight()[2].result).toBe("AMOUNT_OTHER"); // static pos

              vm.onButtonPressed("BTN_SCROLL_DOWN");
              expect(vm.pageCounter()).toBe(2);

              // 3. page
              expect(vm.dataList.itemsLeft()[1].result).toBe("BUTTON_6");
              // Gaps on the left
              count = 0;
              for (let i = 0; i < vm.dataList.itemsLeft().length; i++) {
                if (vm.dataList.itemsLeft()[i].result.indexOf("gap_") !== -1) {
                  count++;
                }
              }
              expect(count).toBe(1);
              // Gaps on the right
              count = 0;
              for (let i = 0; i < vm.dataList.itemsRight().length; i++) {
                if (vm.dataList.itemsRight()[i].result.indexOf("gap_") !== -1) {
                  count++;
                }
              }
              expect(count).toBe(2);
              expect(vm.dataList.itemsRight()[2].result).toBe("AMOUNT_OTHER"); // static pos

              done();
            });
          },
          done.fail
        );
      });
    });

    // ---- AccountSelection ----
    describe("More specific checks: Account selection checks", () => {
      it("check (AccountSelection list(5)  max=4, leftOnly=true, orientation=BOTTOM_UP) counter member after onInitTextAndData", (done) => {
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);
            // check with max=4
            const limits = {
              visibleLimits: {
                max: 4,
                leftOnly: true,
                orientation: "BOTTOM_UP",
              },
            };
            vm.isGenericListMode = true;
            vm.observe("flexMain", limits);
            expect(vm.visibleLimits.max).toBe(4);
            expect(vm.visibleLimits.leftOnly).toBe(true);
            expect(vm.visibleLimits.orientation).toBe("BOTTOM_UP");

            // onInitTextAndData
            this.listData = this.accountSelectionListData_5;
            const dataKeys = [];
            vm.onInitTextAndData({ dataKeys: dataKeys, textKeys: [] });
            expect(dataKeys.length).toBe(1);
            expect(typeof dataKeys[0]).toBe("object"); // promise
            dataKeys[0].then((data) => {
              expect(vm.srcLen).toBe(5);
              expect(vm.sourceDataList.length).toBe(5);
              expect(vm.maxLen).toBe(5);
              expect(vm.freeLen).toBe(5);
              expect(vm.staticsLen).toBe(0);
              expect(vm.listCursor).toBe(0);
              expect(vm.currentLen).toBe(3);
              expect(vm.pagesArray.length).toBe(2);
              expect(vm.dataList.items().length).toBe(3);
              expect(vm.dataList.itemsLeft().length).toBe(3);
              expect(vm.dataList.itemsRight().length).toBe(3);
              // check previous/next buttons
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledTimes(
                1
              );
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledWith(
                false,
                true,
                false,
                jasmine.any(Object)
              );
              done();
            });
          },
          done.fail
        );
      });

      it("check (AccountSelection list(4)  max=4, leftOnly=true, orientation=BOTTOM_UP) counter member after onInitTextAndData", (done) => {
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);
            // check with max=4
            const limits = {
              visibleLimits: {
                max: 4,
                leftOnly: true,
                orientation: "BOTTOM_UP",
              },
            };
            vm.isGenericListMode = true;
            vm.observe("flexMain", limits);
            expect(vm.visibleLimits.max).toBe(4);
            expect(vm.visibleLimits.leftOnly).toBe(true);
            expect(vm.visibleLimits.orientation).toBe("BOTTOM_UP");

            // onInitTextAndData
            this.listData = this.accountSelectionListData_4;
            const dataKeys = [];
            vm.onInitTextAndData({ dataKeys: dataKeys, textKeys: [] });
            expect(dataKeys.length).toBe(1);
            expect(typeof dataKeys[0]).toBe("object"); // promise
            dataKeys[0].then((data) => {
              expect(vm.srcLen).toBe(4);
              expect(vm.sourceDataList.length).toBe(4);
              expect(vm.maxLen).toBe(4);
              expect(vm.freeLen).toBe(4);
              expect(vm.staticsLen).toBe(0);
              expect(vm.listCursor).toBe(0);
              expect(vm.currentLen).toBe(4);
              expect(vm.pagesArray.length).toBe(1);
              expect(vm.dataList.items().length).toBe(4);
              expect(vm.dataList.itemsLeft().length).toBe(4);
              expect(vm.dataList.itemsRight().length).toBe(4);
              // check previous/next buttons
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledTimes(
                1
              );
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledWith(
                false,
                false,
                false,
                jasmine.any(Object)
              );
              done();
            });
          },
          done.fail
        );
      });

      it("check (AccountSelection list(4)  max=3, leftOnly=true, orientation=TOP_DOWN) counter member after onInitTextAndData", (done) => {
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);
            // check with max=3
            const limits = {
              visibleLimits: {
                max: 3,
                leftOnly: true,
                orientation: "TOP_DOWN",
              },
            };
            vm.isGenericListMode = true;
            vm.observe("flexMain", limits);
            expect(vm.visibleLimits.max).toBe(3);
            expect(vm.visibleLimits.leftOnly).toBe(true);
            expect(vm.visibleLimits.orientation).toBe("TOP_DOWN");

            // onInitTextAndData
            this.listData = this.accountSelectionListData_4;
            const dataKeys = [];
            vm.onInitTextAndData({ dataKeys: dataKeys, textKeys: [] });
            expect(dataKeys.length).toBe(1);
            expect(typeof dataKeys[0]).toBe("object"); // promise
            dataKeys[0].then((data) => {
              expect(vm.srcLen).toBe(4);
              expect(vm.sourceDataList.length).toBe(4);
              expect(vm.maxLen).toBe(4);
              expect(vm.freeLen).toBe(4);
              expect(vm.staticsLen).toBe(0);
              expect(vm.listCursor).toBe(0);
              expect(vm.currentLen).toBe(2);
              expect(vm.pagesArray.length).toBe(2);
              expect(vm.dataList.items().length).toBe(2);
              expect(vm.dataList.itemsLeft().length).toBe(2);
              expect(vm.dataList.itemsRight().length).toBe(2);
              // check previous/next buttons
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledTimes(
                1
              );
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledWith(
                false,
                true,
                false,
                jasmine.any(Object)
              );
              done();
            });
          },
          done.fail
        );
      });

      it("check (AccountSelection list(3)  max=4, leftOnly=true, orientation=BOTTOM_UP) counter member after onInitTextAndData", (done) => {
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);
            // check with max=4
            const limits = {
              visibleLimits: {
                max: 4,
                leftOnly: true,
                orientation: "BOTTOM_UP",
              },
            };
            vm.isGenericListMode = true;
            vm.observe("flexMain", limits);
            expect(vm.visibleLimits.max).toBe(4);
            expect(vm.visibleLimits.leftOnly).toBe(true);
            expect(vm.visibleLimits.orientation).toBe("BOTTOM_UP");

            // onInitTextAndData
            this.listData = this.accountSelectionListData_3;
            const dataKeys = [];
            vm.onInitTextAndData({ dataKeys: dataKeys, textKeys: [] });
            expect(dataKeys.length).toBe(1);
            expect(typeof dataKeys[0]).toBe("object"); // promise
            dataKeys[0].then((data) => {
              expect(vm.srcLen).toBe(3);
              expect(vm.sourceDataList.length).toBe(3);
              expect(vm.maxLen).toBe(3);
              expect(vm.freeLen).toBe(3);
              expect(vm.staticsLen).toBe(0);
              expect(vm.listCursor).toBe(0);
              expect(vm.currentLen).toBe(3);
              expect(vm.pagesArray.length).toBe(1);
              expect(vm.dataList.items().length).toBe(3);
              expect(vm.dataList.itemsLeft().length).toBe(3);
              expect(vm.dataList.itemsRight().length).toBe(3);
              // check previous/next buttons
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledTimes(
                1
              );
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledWith(
                false,
                false,
                false,
                jasmine.any(Object)
              );
              done();
            });
          },
          done.fail
        );
      });

      it("check (AccountSelection list(3)  max=4, leftOnly=true, orientation=TOP_DOWN) counter member after onInitTextAndData", (done) => {
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);
            // check with max=4
            const limits = {
              visibleLimits: {
                max: 4,
                leftOnly: true,
                orientation: "TOP_DOWN",
              },
            };
            vm.isGenericListMode = true;
            vm.observe("flexMain", limits);
            expect(vm.visibleLimits.max).toBe(4);
            expect(vm.visibleLimits.leftOnly).toBe(true);
            expect(vm.visibleLimits.orientation).toBe("TOP_DOWN");

            // onInitTextAndData
            this.listData = this.accountSelectionListData_3;
            const dataKeys = [];
            vm.onInitTextAndData({ dataKeys: dataKeys, textKeys: [] });
            expect(dataKeys.length).toBe(1);
            expect(typeof dataKeys[0]).toBe("object"); // promise
            dataKeys[0].then((data) => {
              expect(vm.srcLen).toBe(3);
              expect(vm.sourceDataList.length).toBe(3);
              expect(vm.maxLen).toBe(3);
              expect(vm.freeLen).toBe(3);
              expect(vm.staticsLen).toBe(0);
              expect(vm.listCursor).toBe(0);
              expect(vm.currentLen).toBe(3);
              expect(vm.pagesArray.length).toBe(1);
              expect(vm.dataList.items().length).toBe(3);
              expect(vm.dataList.itemsLeft().length).toBe(3);
              expect(vm.dataList.itemsRight().length).toBe(3);
              // check previous/next buttons
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledTimes(
                1
              );
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledWith(
                false,
                false,
                false,
                jasmine.any(Object)
              );
              done();
            });
          },
          done.fail
        );
      });

      it("check (AccountSelection list(2)  max=4, leftOnly=true, orientation=BOTTOM_UP) counter member after onInitTextAndData", (done) => {
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);
            // check with max=4
            const limits = {
              visibleLimits: {
                max: 4,
                leftOnly: true,
                orientation: "BOTTOM_UP",
              },
            };
            vm.isGenericListMode = true;
            vm.observe("flexMain", limits);
            expect(vm.visibleLimits.max).toBe(4);
            expect(vm.visibleLimits.leftOnly).toBe(true);
            expect(vm.visibleLimits.orientation).toBe("BOTTOM_UP");

            // onInitTextAndData
            this.listData = this.accountSelectionListData_2;
            const dataKeys = [];
            vm.onInitTextAndData({ dataKeys: dataKeys, textKeys: [] });
            expect(dataKeys.length).toBe(1);
            expect(typeof dataKeys[0]).toBe("object"); // promise
            dataKeys[0].then((data) => {
              expect(vm.srcLen).toBe(2);
              expect(vm.sourceDataList.length).toBe(2);
              expect(vm.maxLen).toBe(2);
              expect(vm.freeLen).toBe(2);
              expect(vm.staticsLen).toBe(0);
              expect(vm.listCursor).toBe(0);
              expect(vm.currentLen).toBe(2);
              expect(vm.pagesArray.length).toBe(1);
              expect(vm.dataList.items().length).toBe(2);
              expect(vm.dataList.itemsLeft().length).toBe(2);
              expect(vm.dataList.itemsRight().length).toBe(2);
              // check previous/next buttons
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledTimes(
                1
              );
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledWith(
                false,
                false,
                false,
                jasmine.any(Object)
              );
              done();
            });
          },
          done.fail
        );
      });

      it("check (AccountSelection list(2)  max=4, leftOnly=true, orientation=TOP_DOWN) counter member after onInitTextAndData", (done) => {
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);
            // check with max=4
            const limits = {
              visibleLimits: {
                max: 4,
                leftOnly: true,
                orientation: "TOP_DOWN",
              },
            };
            vm.isGenericListMode = true;
            vm.observe("flexMain", limits);
            expect(vm.visibleLimits.max).toBe(4);
            expect(vm.visibleLimits.leftOnly).toBe(true);
            expect(vm.visibleLimits.orientation).toBe("TOP_DOWN");

            // onInitTextAndData
            this.listData = this.accountSelectionListData_2;
            const dataKeys = [];
            vm.onInitTextAndData({ dataKeys: dataKeys, textKeys: [] });
            expect(dataKeys.length).toBe(1);
            expect(typeof dataKeys[0]).toBe("object"); // promise
            dataKeys[0].then((data) => {
              expect(vm.srcLen).toBe(2);
              expect(vm.sourceDataList.length).toBe(2);
              expect(vm.maxLen).toBe(2);
              expect(vm.freeLen).toBe(2);
              expect(vm.staticsLen).toBe(0);
              expect(vm.listCursor).toBe(0);
              expect(vm.currentLen).toBe(2);
              expect(vm.pagesArray.length).toBe(1);
              expect(vm.dataList.items().length).toBe(2);
              expect(vm.dataList.itemsLeft().length).toBe(2);
              expect(vm.dataList.itemsRight().length).toBe(2);
              // check previous/next buttons
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledTimes(
                1
              );
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledWith(
                false,
                false,
                false,
                jasmine.any(Object)
              );
              done();
            });
          },
          done.fail
        );
      });

      it("check (AccountSelection list(1)  max=4, leftOnly=true, orientation=BOTTOM_UP) counter member after onInitTextAndData", (done) => {
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);
            // check with max=4
            const limits = {
              visibleLimits: {
                max: 4,
                leftOnly: true,
                orientation: "BOTTOM_UP",
              },
            };
            vm.isGenericListMode = true;
            vm.observe("flexMain", limits);
            expect(vm.visibleLimits.max).toBe(4);
            expect(vm.visibleLimits.leftOnly).toBe(true);
            expect(vm.visibleLimits.orientation).toBe("BOTTOM_UP");

            // onInitTextAndData
            this.listData = this.accountSelectionListData_1;
            const dataKeys = [];
            vm.onInitTextAndData({ dataKeys: dataKeys, textKeys: [] });
            expect(dataKeys.length).toBe(1);
            expect(typeof dataKeys[0]).toBe("object"); // promise
            dataKeys[0].then((data) => {
              expect(vm.srcLen).toBe(1);
              expect(vm.sourceDataList.length).toBe(1);
              expect(vm.maxLen).toBe(1);
              expect(vm.freeLen).toBe(1);
              expect(vm.staticsLen).toBe(0);
              expect(vm.listCursor).toBe(0);
              expect(vm.currentLen).toBe(1);
              expect(vm.pagesArray.length).toBe(1);
              expect(vm.dataList.items().length).toBe(1);
              expect(vm.dataList.itemsLeft().length).toBe(1);
              expect(vm.dataList.itemsRight().length).toBe(1);
              // check previous/next buttons
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledTimes(
                1
              );
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledWith(
                false,
                false,
                false,
                jasmine.any(Object)
              );
              done();
            });
          },
          done.fail
        );
      });

      it("check (AccountSelection list(1)  max=4, leftOnly=true, orientation=TOP_DOWN) counter member after onInitTextAndData", (done) => {
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);
            // check with max=4
            const limits = {
              visibleLimits: {
                max: 4,
                leftOnly: true,
                orientation: "TOP_DOWN",
              },
            };
            vm.isGenericListMode = true;
            vm.observe("flexMain", limits);
            expect(vm.visibleLimits.max).toBe(4);
            expect(vm.visibleLimits.leftOnly).toBe(true);
            expect(vm.visibleLimits.orientation).toBe("TOP_DOWN");

            // onInitTextAndData
            this.listData = this.accountSelectionListData_1;
            const dataKeys = [];
            vm.onInitTextAndData({ dataKeys: dataKeys, textKeys: [] });
            expect(dataKeys.length).toBe(1);
            expect(typeof dataKeys[0]).toBe("object"); // promise
            dataKeys[0].then((data) => {
              expect(vm.srcLen).toBe(1);
              expect(vm.sourceDataList.length).toBe(1);
              expect(vm.maxLen).toBe(1);
              expect(vm.freeLen).toBe(1);
              expect(vm.staticsLen).toBe(0);
              expect(vm.listCursor).toBe(0);
              expect(vm.currentLen).toBe(1);
              expect(vm.pagesArray.length).toBe(1);
              expect(vm.dataList.items().length).toBe(1);
              expect(vm.dataList.itemsLeft().length).toBe(1);
              expect(vm.dataList.itemsRight().length).toBe(1);
              // check previous/next buttons
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledTimes(
                1
              );
              expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledWith(
                false,
                false,
                false,
                jasmine.any(Object)
              );
              done();
            });
          },
          done.fail
        );
      });
    });

    // ---- DepositChequesResult max=1, isGenericListMode=false ----
    describe("More specific checks: DepositChequesResult checks", () => {
      it("check touch (Source list len=0) counter member after onInitTextAndData", (done) => {
        this.config.viewType = "touch";
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);
            // check with max=1
            const limits = {
              visibleLimits: {
                max: 4,
                leftOnly: false,
                orientation: "BOTTOM_UP",
              },
            };
            const data = [];
            vm.setGenericListGathering(false);
            vm.setListLen(data.length);
            vm.setListSource(data);
            vm.dataList.items(data);
            vm.observe("flexMain", limits);
            vm.initCurrentVisibleLimits();
            expect(vm.isGenericListMode).toBe(false);
            expect(vm.visibleLimits.max).toBe(4);
            expect(vm.visibleLimits.leftOnly).toBe(false);
            expect(vm.visibleLimits.orientation).toBe("BOTTOM_UP");

            // onInitTextAndData
            vm.onInitTextAndData({ dataKeys: [], textKeys: [] });
            expect(vm.isGenericListMode).toBe(false); // second check
            vm.initScrollbar();

            expect(vm.srcLen).toBe(0);
            expect(vm.sourceDataList.length).toBe(0);
            expect(vm.maxLen).toBe(0);
            expect(vm.freeLen).toBe(0);
            expect(vm.staticsLen).toBe(0);
            expect(vm.listCursor).toBe(0);
            expect(vm.currentLen).toBe(0); // on touch it's 0
            expect(vm.pagesArray.length).toBe(0);
            expect(vm.dataList.items().length).toBe(0);
            expect(vm.dataList.itemsLeft().length).toBe(0);
            expect(vm.dataList.itemsRight().length).toBe(0);

            // check previous/next buttons
            expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledTimes(1);
            expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledWith(
              false,
              false,
              false,
              jasmine.any(Object)
            );
            done();
          },
          done.fail
        );
      });

      it("check softkey (Source list len=0) counter member after onInitTextAndData", (done) => {
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);
            // check with max=1
            const limits = {
              visibleLimits: {
                max: 4,
                leftOnly: false,
                orientation: "BOTTOM_UP",
              },
            };
            const data = [];
            vm.setGenericListGathering(false);
            vm.setListLen(data.length);
            vm.setListSource(data);
            vm.dataList.items(data);
            vm.observe("flexMain", limits);
            vm.initCurrentVisibleLimits();
            expect(vm.isGenericListMode).toBe(false);
            expect(vm.visibleLimits.max).toBe(4);
            expect(vm.visibleLimits.leftOnly).toBe(false);
            expect(vm.visibleLimits.orientation).toBe("BOTTOM_UP");

            // onInitTextAndData
            vm.onInitTextAndData({ dataKeys: [], textKeys: [] });
            expect(vm.isGenericListMode).toBe(false); // second check
            vm.initScrollbar();

            expect(vm.srcLen).toBe(0);
            expect(vm.sourceDataList.length).toBe(0);
            expect(vm.maxLen).toBe(0);
            expect(vm.freeLen).toBe(0);
            expect(vm.staticsLen).toBe(0);
            expect(vm.listCursor).toBe(0);
            expect(vm.currentLen).toBe(4); // on softkey it's 4
            expect(vm.pagesArray.length).toBe(0);
            expect(vm.dataList.items().length).toBe(0);
            expect(vm.dataList.itemsLeft().length).toBe(0);
            expect(vm.dataList.itemsRight().length).toBe(0);

            // check previous/next buttons
            expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledTimes(1);
            expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledWith(
              false,
              false,
              false,
              jasmine.any(Object)
            );
            done();
          },
          done.fail
        );
      });

      it("check (DepositChequesResult list(1)  max=1, leftOnly=true, orientation=BOTTOM_UP) counter member after onInitTextAndData", (done) => {
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);
            // check with max=1
            const limits = {
              visibleLimits: {
                max: 1,
                leftOnly: true,
                orientation: "BOTTOM_UP",
              },
            };
            const data = [{}];
            vm.setGenericListGathering(false);
            vm.setListLen(data.length);
            vm.setListSource(data);
            vm.dataList.items(data);
            vm.observe("flexMain", limits);
            vm.initCurrentVisibleLimits();
            expect(vm.isGenericListMode).toBe(false);
            expect(vm.visibleLimits.max).toBe(1);
            expect(vm.visibleLimits.leftOnly).toBe(true);
            expect(vm.visibleLimits.orientation).toBe("BOTTOM_UP");

            // onInitTextAndData
            vm.onInitTextAndData({ dataKeys: [], textKeys: [] });
            expect(vm.isGenericListMode).toBe(false); // second check
            vm.initScrollbar();

            expect(vm.srcLen).toBe(1);
            expect(vm.sourceDataList.length).toBe(1);
            expect(vm.maxLen).toBe(1);
            expect(vm.freeLen).toBe(1);
            expect(vm.staticsLen).toBe(0);
            expect(vm.listCursor).toBe(0);
            expect(vm.currentLen).toBe(1);
            expect(vm.pagesArray.length).toBe(1);
            expect(vm.dataList.items().length).toBe(1);
            expect(vm.dataList.itemsLeft().length).toBe(0);
            expect(vm.dataList.itemsRight().length).toBe(0);

            // check previous/next buttons
            expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledTimes(1);
            expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledWith(
              false,
              false,
              false,
              jasmine.any(Object)
            );
            done();
          },
          done.fail
        );
      });

      it("check (DepositChequesResult list(2)  max=1, leftOnly=true, orientation=BOTTOM_UP) counter member after onInitTextAndData", (done) => {
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);
            // check with max=1
            const limits = {
              visibleLimits: {
                max: 1,
                leftOnly: true,
                orientation: "BOTTOM_UP",
              },
            };
            const data = [{}, {}];
            vm.setGenericListGathering(false);
            vm.setListLen(data.length);
            vm.setListSource(data);
            vm.dataList.items(data);
            vm.observe("flexMain", limits);
            vm.initCurrentVisibleLimits();
            expect(vm.isGenericListMode).toBe(false);
            expect(vm.visibleLimits.max).toBe(1);
            expect(vm.visibleLimits.leftOnly).toBe(true);
            expect(vm.visibleLimits.orientation).toBe("BOTTOM_UP");

            // onInitTextAndData
            vm.onInitTextAndData({ dataKeys: [], textKeys: [] });
            expect(vm.isGenericListMode).toBe(false); // second check
            vm.initScrollbar();

            expect(vm.srcLen).toBe(2);
            expect(vm.sourceDataList.length).toBe(2);
            expect(vm.maxLen).toBe(2);
            expect(vm.freeLen).toBe(2);
            expect(vm.staticsLen).toBe(0);
            expect(vm.listCursor).toBe(0);
            expect(vm.currentLen).toBe(1);
            expect(vm.pagesArray.length).toBe(2);
            expect(vm.dataList.items().length).toBe(2);
            expect(vm.dataList.itemsLeft().length).toBe(0);
            expect(vm.dataList.itemsRight().length).toBe(0);

            // check previous/next buttons
            expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledTimes(1);
            expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledWith(
              false,
              true,
              false,
              jasmine.any(Object)
            );
            done();
          },
          done.fail
        );
      });

      it("check (DepositChequesResult list(3)  max=1, leftOnly=true, orientation=BOTTOM_UP) counter member after onInitTextAndData", (done) => {
        injector.require(
          ["GUIAPP/content/viewmodels/ListViewModel"],
          () => {
            const vm = new Wincor.UI.Content.ListViewModel(_module);
            // check with max=1
            const limits = {
              visibleLimits: {
                max: 1,
                leftOnly: true,
                orientation: "BOTTOM_UP",
              },
            };
            const data = [{}, {}, {}];
            vm.setGenericListGathering(false);
            vm.setListLen(data.length);
            vm.setListSource(data);
            vm.dataList.items(data);
            vm.observe("flexMain", limits);
            vm.initCurrentVisibleLimits();
            expect(vm.isGenericListMode).toBe(false);
            expect(vm.visibleLimits.max).toBe(1);
            expect(vm.visibleLimits.leftOnly).toBe(true);
            expect(vm.visibleLimits.orientation).toBe("BOTTOM_UP");

            // onInitTextAndData
            vm.onInitTextAndData({ dataKeys: [], textKeys: [] });
            expect(vm.isGenericListMode).toBe(false); // second check
            vm.initScrollbar();

            expect(vm.srcLen).toBe(3);
            expect(vm.sourceDataList.length).toBe(3);
            expect(vm.maxLen).toBe(3);
            expect(vm.freeLen).toBe(3);
            expect(vm.staticsLen).toBe(0);
            expect(vm.listCursor).toBe(0);
            expect(vm.currentLen).toBe(1);
            expect(vm.pagesArray.length).toBe(3);
            expect(vm.dataList.items().length).toBe(3);
            expect(vm.dataList.itemsLeft().length).toBe(0);
            expect(vm.dataList.itemsRight().length).toBe(0);

            // check previous/next buttons
            expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledTimes(1);
            expect(vm.viewHelper.initScrollbarButtons).toHaveBeenCalledWith(
              false,
              true,
              false,
              jasmine.any(Object)
            );
            done();
          },
          done.fail
        );
      });
    });
  });
});
