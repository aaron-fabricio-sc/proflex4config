/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ ProFlex4Op_test.js 4.3.1-210203-21-1b8704b6-1a04bc7d

*/

define(['lib/Squire'], function(Squire) {

    let injector;
    let Wincor;

    describe("ProFlex4Op test suite", () => {

        const JASMINE_ORG_TIMEOUT = jasmine.DEFAULT_TIMEOUT_INTERVAL;

        beforeEach(done => {
            injector = new Squire();
            injector.require(["NamespaceMock"], bundle => {
                // jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000;
                Wincor = window.Wincor = bundle.createWincor();
                Wincor.ko = window.ko = bundle.ko;

                this.listData = {};

                this.businessData_LISE_Test_0 = {
                    "CCTAFW_PROP_PREPAID_LISE_LIST[A,1,1]": ["1100", "1200", "1300", "1400", "1500", "1600", "1700"],
                    "PROP_LISE_CONFIGURATION": "CCTAFW_PROP_PREPAID_LISE_LIST,1,1",
                };

                this.businessData_LISE_Test_1 = {
                    "CCTAFW_PROP_PREPAID_LISE_LIST[A,1,1]": ["1100", "1200", "1300", "1400", "1500", "1600", "1700"],
                    "PROP_LISE_CONFIGURATION": "CCTAFW_PROP_PREPAID_LISE_LIST,1,1,",
                };

                this.businessData_LISE_Test_2 = {
                    "CCTAFW_PROP_PREPAID_LISE_LIST[A,1,1]": ["1100", "1200", "1300", "1400", "1500", "1600", "1700"],
                    "PROP_LISE_CONFIGURATION": "CCTAFW_PROP_PREPAID_LISE_LIST,1,1,,",
                };

                this.businessData_LISE_Test_3 = {
                    "CCTAFW_PROP_PREPAID_LISE_LIST[A,1,1]": ["1100", "1200", "1300", "1400", "1500", "1600", "1700"],
                    "PROP_LISE_CONFIGURATION": "CCTAFW_PROP_PREPAID_LISE_LIST,1,1,,2",
                };

                this.businessData_LISE_Test_4 = {
                    "CCTAFW_PROP_PREPAID_LISE_LIST[A,1,1]": ["1100", "1200", "1300", "1400", "1500", "1600", "1700"],
                    "PROP_LISE_CONFIGURATION": "CCTAFW_PROP_PREPAID_LISE_LIST,1,1,,1",
                };

                this.businessData_LISE_Test_4a = {
                    "CCTAFW_PROP_PREPAID_LISE_LIST[A,8,1]": ["1100", "1200", "1300", "1400", "1500", "1600", "1700", "1800", "1900", "2000", "2100", "2200", "2300", "2400", "2500", "2600", "2700", "2800", "2900", "3000"],
                    "PROP_LISE_CONFIGURATION": "CCTAFW_PROP_PREPAID_LISE_LIST,8,1,,14",
                };

                this.businessData_LISE_Test_4b = {
                    "CCTAFW_PROP_PREPAID_LISE_LIST[A,8,1]": ["1100", "1200", "1300", "1400", "1500", "1600", "1700", "1800", "1900", "2000", "2100", "2200"],
                    "PROP_LISE_CONFIGURATION": "CCTAFW_PROP_PREPAID_LISE_LIST,8,1,,14",
                };

                this.businessData_LISE_Test_4c = {
                    "CCTAFW_PROP_PREPAID_LISE_LIST[A,8,1]": ["1100", "1200", "1300", "1400", "1500", "1600", "1700", "1800", "1900", "2000", "2100", "2200"],
                    "PROP_LISE_CONFIGURATION": "CCTAFW_PROP_PREPAID_LISE_LIST,8,1,,7",
                };

                this.businessData_LISE_Test_5 = {
                    "CCTAFW_PROP_EMV_APPLICATION_SELECTION_LISE_DATA[A,0,2]": ["Master Card", "Item1", "Visa", "Item2", "AMEX", "Item3"],
                    "PROP_LISE_CONFIGURATION": "CCTAFW_PROP_EMV_APPLICATION_SELECTION_LISE_DATA,0,2",
                };

                this.businessData_LISE_Test_6 = {
                    "CCTAFW_PROP_EMV_APPLICATION_SELECTION_LISE_DATA[A,0,2]": ["Master Card", "Item1", "Visa", "Item2", "AMEX", "Item3", "EMV1", "Item4", "EMV2", "Item5", "EMV3", "Item6", "EMV4", "Item7"],
                    "PROP_LISE_CONFIGURATION": "CCTAFW_PROP_EMV_APPLICATION_SELECTION_LISE_DATA,0,2,,1",
                };

                this.businessData_LISE_Test_7 = {
                    "CCTAFW_PROP_EMV_APPLICATION_SELECTION_LISE_DATA[A,0,2]": ["Master Card", "Item1", "Visa", "Item2", "AMEX", "Item3", "EMV1", "Item4", "EMV2", "Item5", "EMV3", "Item6", "EMV4", "Item7"],
                    "PROP_LISE_CONFIGURATION": "CCTAFW_PROP_EMV_APPLICATION_SELECTION_LISE_DATA,0,2,,3",
                };

                this.businessData_LISE_Test_8 = {
                    "CCTAFW_PROP_EMV_APPLICATION_SELECTION_LISE_DATA[A,0,2]": ["Master Card", "Item1", "Visa", "Item2", "AMEX", "Item3", "EMV1", "Item4", "EMV2", "Item5", "EMV3", "Item6", "EMV4", "Item7"],
                    "PROP_LISE_CONFIGURATION": "CCTAFW_PROP_EMV_APPLICATION_SELECTION_LISE_DATA,0,2,,5",
                };

                this.businessData_LISE_Test_9 = {
                    "CCTAFW_PROP_LISE_ACCOUNT_ITEM[A,0,9]": ["11111111111111112", "~Primary checking account", "USD", "10330.11", "+", "10000", "EUR", "1000", "010", "222222222222222223", "~Secondary checking account", "USD", "20000.11", "+", "10000", "EUR", "1000", "010", "333333333333333", "~Third checking account", "USD", "32000.11", "+", "10000", "EUR", "1000", "010", "44444444444444442", "~Primary checking account", "USD", "10330.11", "+", "10000", "EUR", "1000", "010", "555555555555555523", "~Secondary checking account", "USD", "20000.11", "+", "10000", "EUR", "1000", "010", "666666666666666", "~Third checking account", "USD", "32000.11", "+", "10000", "EUR", "1000", "010"],
                    "PROP_LISE_CONFIGURATION": "CCTAFW_PROP_LISE_ACCOUNT_ITEM,0,9",
                };

                this.businessData_LISE_Test_10 = {
                    "CCTAFW_PROP_LISE_ACCOUNT_ITEM[A,0,9]": ["11111111111111112", "~Primary checking account", "USD", "10330.11", "+", "10000", "EUR", "1000", "010", "222222222222222223", "~Secondary checking account", "USD", "20000.11", "+", "10000", "EUR", "1000", "010", "333333333333333", "~Third checking account", "USD", "32000.11", "+", "10000", "EUR", "1000", "010", "44444444444444442", "~Primary checking account", "USD", "10330.11", "+", "10000", "EUR", "1000", "010", "555555555555555523", "~Secondary checking account", "USD", "20000.11", "+", "10000", "EUR", "1000", "010", "666666666666666", "~Third checking account", "USD", "32000.11", "+", "10000", "EUR", "1000", "010"],
                    "PROP_LISE_CONFIGURATION": "CCTAFW_PROP_LISE_ACCOUNT_ITEM,0,9,,8",
                };

                this.businessData_LISE_Test_10a = {
                    "CCTAFW_PROP_LISE_ACCOUNT_ITEM[A,0,9]": ["11111111111111112", "~Primary checking account", "USD", "10330.11", "+", "10000", "EUR", "1000", "222222222222222223", "~Secondary checking account", "USD", "20000.11", "+", "10000", "EUR", "1000", "010", "333333333333333", "~Third checking account", "USD", "32000.11", "+", "10000", "EUR", "1000", "010", "44444444444444442", "~Primary checking account", "USD", "10330.11", "+", "10000", "EUR", "1000", "010", "555555555555555523", "~Secondary checking account", "USD", "20000.11", "+", "10000", "EUR", "1000", "010", "666666666666666", "~Third checking account", "USD", "32000.11", "+", "10000", "EUR", "1000", "010"],
                    "PROP_LISE_CONFIGURATION": "CCTAFW_PROP_LISE_ACCOUNT_ITEM,0,9",
                };

                this.businessData_LISE_Test_11 = {
                    "CCTAFW_PROP_LISE_ACCOUNT_ITEM[A,9,9]": ["11111111111111112", "~Primary checking account", "USD", "10330.11", "+", "10000", "EUR", "1000", "010", "222222222222222223", "~Secondary checking account", "USD", "20000.11", "+", "10000", "EUR", "1000", "010", "333333333333333", "~Third checking account", "USD", "32000.11", "+", "10000", "EUR", "1000", "010", "44444444444444442", "~Primary checking account", "USD", "10330.11", "+", "10000", "EUR", "1000", "010", "555555555555555523", "~Secondary checking account", "USD", "20000.11", "+", "10000", "EUR", "1000", "010", "666666666666666", "~Third checking account", "USD", "32000.11", "+", "10000", "EUR", "1000", "010"],
                    "PROP_LISE_CONFIGURATION": "CCTAFW_PROP_LISE_ACCOUNT_ITEM,9,9,,17",
                };

                this.viewConfigStaticAndProminentItemsTest_1 = {
                    "priorities": {
                        "extendedpriorities": "CCTAFW_PROP_MENU_PREFERENCE",
                        "itemgaps": "true",
                        "staticpos": ["CIN=2", "COUTFAST=1"],
                        "order": [
                            "COUTFAST"
                        ],
                        "prominent": [
                            "COUTFAST=prominentItem",
                            "BAL=prominentItem",
                            "WITHDRAW_OPTIONS=subMenuItem",
                            "DEPOSIT_OPTIONS=subMenuItem",
                            "ACCOUNT_OVERVIEWS=subMenuItem",
                            "TRANSFER_OPTIONS=subMenuItem",
                            "ACCOUNT_SERVICES=subMenuItem",
                            "CUSTOMIZE_OPTIONS=subMenuItem"
                        ]
                    },
                    "config": {
                        "autoUpdateOnLanguageChange": false
                    }
                };

                this.viewConfigSubMenuTest_1 = {
                    "priorities": {
                        "extendedpriorities": "CCTAFW_PROP_MENU_PREFERENCE",
                        "itemgaps": "false",
                        "order": [
                            "COUTFAST"
                        ],
                        "prominent": [
                            "COUTFAST=prominentItem",
                            "BAL=prominentItem",
                            "WITHDRAW_OPTIONS=subMenuItem",
                            "DEPOSIT_OPTIONS=subMenuItem",
                            "ACCOUNT_OVERVIEWS=subMenuItem",
                            "TRANSFER_OPTIONS=subMenuItem",
                            "ACCOUNT_SERVICES=subMenuItem",
                            "CUSTOMIZE_OPTIONS=subMenuItem"
                        ]
                    },
                    "config": {
                        "autoUpdateOnLanguageChange": false
                    }
                };

                this.businessDataSubMenuTest_1 = {
                    "CCTAFW_PROP_MENU_PREFERENCE": "{\"order\":[\"COUTFAST\",\"COUT\",\"BAL\",\"STP\",\"AIN\",\"STPM\",\"LANGCHG\",\"PINCHG\",\"RECCHG\",\"FCCHG\",\"MENUCHG\",\"CUSTOM\"], \"prominent\":[\"COUTFAST=prominentItem\",\"MENUCHG=prominentItem\"]}",

                    "CCTAFW_PROP_MENU_ITEMS[A,0,1]": ["AIN","BAL","CIN","COININ","COUT","COUTFAST","COUTMIXED","COINOUT","ACCOUNTCHG"],
                    "PROP_LISE_CONFIGURATION": "CCTAFW_PROP_MENU_ITEMS,0,1",
                    "VAR_AIN_VIEWSTATE_S": 3,
                    "VAR_BAL_VIEWSTATE_S": 0,
                    "VAR_STPM_VIEWSTATE_S": 3,
                    "VAR_STP_VIEWSTATE_S": 3,
                    "VAR_CINMIXED_VIEWSTATE_S": 0,
                    "VAR_COININ_VIEWSTATE_S": 0,
                    "VAR_CIN_PRESTAGED_VIEWSTATE_S": 3,
                    "VAR_CIN_VIEWSTATE_S": 3,
                    "VAR_COUT_VIEWSTATE_S": 0,
                    "VAR_COUTFAST_VIEWSTATE_S": 0,
                    "VAR_CHCCDM_VIEWSTATE_S": 0,
                    "VAR_MIXEDMEDIA_VIEWSTATE_S": 0,
                    "VAR_CHQCASH_VIEWSTATE_S": 2,
                    "VAR_ENV_VIEWSTATE_S": 0
                };

                this.viewConfigSubMenuTest_2 = {
                    "priorities": {
                        "itemgaps": "false",
                        "order": [
                            "COUTFAST"
                        ],
                        "prominent": [
                            "COUTFAST=prominentItem",
                            "BAL=prominentItem",
                            "WITHDRAW_OPTIONS=subMenuItem",
                            "DEPOSIT_OPTIONS=subMenuItem",
                            "ACCOUNT_OVERVIEWS=subMenuItem",
                            "TRANSFER_OPTIONS=subMenuItem",
                            "ACCOUNT_SERVICES=subMenuItem",
                            "CUSTOMIZE_OPTIONS=subMenuItem"
                        ],
                        "letSingleSubMenuFunctionBubbleUp": true,
                        "submenus": [
                            {
                                "DEPOSIT_OPTIONS": [
                                    "CIN",
                                    "COININ",
                                    {
                                        "ACCOUNT_OVERVIEWS": [
                                            "AIN",
                                            "BAL"
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    "config": {
                        "autoUpdateOnLanguageChange": false
                    }
                };

                this.viewConfigSubMenuTest_3 = {
                    "priorities": {
                        "itemgaps": "false",
                        "order": [
                            "COUTFAST"
                        ],
                        "prominent": [
                            "COUTFAST=prominentItem",
                            "BAL=prominentItem",
                            "WITHDRAW_OPTIONS=subMenuItem",
                            "DEPOSIT_OPTIONS=subMenuItem",
                            "ACCOUNT_OVERVIEWS=subMenuItem",
                            "TRANSFER_OPTIONS=subMenuItem",
                            "ACCOUNT_SERVICES=subMenuItem",
                            "CUSTOMIZE_OPTIONS=subMenuItem"
                        ],
                        "letSingleSubMenuFunctionBubbleUp": true,
                        "submenus": [
                            {
                                "DEPOSIT_OPTIONS": [
                                    "CIN",
                                    "COININ",
                                    {
                                        "ACCOUNT_OVERVIEWS": [
                                            "AIN",
                                            "BAL"
                                        ]
                                    },
                                    {
                                        "WITHDRAW_OPTIONS": [
                                            "COUT",
                                            "COINOUT"
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    "config": {
                        "autoUpdateOnLanguageChange": false
                    }
                };

                this.businessDataSubMenuTest_0 = {
                    "CCTAFW_PROP_MENU_PREFERENCE": "{\"order\":[\"COUTFAST\",\"COUT\",\"BAL\",\"STP\",\"AIN\",\"STPM\",\"LANGCHG\",\"PINCHG\",\"RECCHG\",\"FCCHG\",\"MENUCHG\",\"CUSTOM\"], \"prominent\":[\"COUTFAST=prominentItem\",\"MENUCHG=prominentItem\"]}",

                    "CCTAFW_PROP_MENU_ITEMS[A,0,1]": ["AIN", "BAL", "CIN", "COININ", "COUT", "COUTFAST", "COUTMIXED", "COINOUT", "ACCOUNTCHG"],
                    "PROP_LISE_CONFIGURATION": "CCTAFW_PROP_MENU_ITEMS,0,1",
                    "VAR_AIN_VIEWSTATE_S": 0,
                    "VAR_BAL_VIEWSTATE_S": 0,
                    "VAR_STPM_VIEWSTATE_S": 3,
                    "VAR_STP_VIEWSTATE_S": 3,
                    "VAR_CINMIXED_VIEWSTATE_S": 0,
                    "VAR_COININ_VIEWSTATE_S": 0,
                    "VAR_CIN_PRESTAGED_VIEWSTATE_S": 3,
                    "VAR_CIN_VIEWSTATE_S": 3,
                    "VAR_COUT_VIEWSTATE_S": 0,
                    "VAR_COUTFAST_VIEWSTATE_S": 0,
                    "VAR_CHCCDM_VIEWSTATE_S": 0,
                    "VAR_MIXEDMEDIA_VIEWSTATE_S": 0,
                    "VAR_CHQCASH_VIEWSTATE_S": 2,
                    "VAR_ENV_VIEWSTATE_S": 0
                };

                this.businessDataSubMenuTest_2 = {
                    "CCTAFW_PROP_MENU_PREFERENCE": "{\"order\":[\"COUTFAST\",\"COUT\",\"BAL\",\"STP\",\"AIN\",\"STPM\",\"LANGCHG\",\"PINCHG\",\"RECCHG\",\"FCCHG\",\"MENUCHG\",\"CUSTOM\"], \"prominent\":[\"COUTFAST=prominentItem\",\"MENUCHG=prominentItem\"]}",

                    "CCTAFW_PROP_MENU_ITEMS[A,0,1]": ["AIN", "BAL", "CIN", "COININ", "COUT", "COUTFAST", "COUTMIXED", "COINOUT", "ACCOUNTCHG"],
                    "PROP_LISE_CONFIGURATION": "CCTAFW_PROP_MENU_ITEMS,0,1",
                    "VAR_AIN_VIEWSTATE_S": 3,
                    "VAR_BAL_VIEWSTATE_S": 0,
                    "VAR_STPM_VIEWSTATE_S": 3,
                    "VAR_STP_VIEWSTATE_S": 3,
                    "VAR_CINMIXED_VIEWSTATE_S": 0,
                    "VAR_COININ_VIEWSTATE_S": 0,
                    "VAR_CIN_PRESTAGED_VIEWSTATE_S": 3,
                    "VAR_CIN_VIEWSTATE_S": 3,
                    "VAR_COUT_VIEWSTATE_S": 0,
                    "VAR_COUTFAST_VIEWSTATE_S": 0,
                    "VAR_CHCCDM_VIEWSTATE_S": 0,
                    "VAR_MIXEDMEDIA_VIEWSTATE_S": 0,
                    "VAR_CHQCASH_VIEWSTATE_S": 2,
                    "VAR_ENV_VIEWSTATE_S": 0
                };

                this.businessDataSubMenuTest_3 = {
                    "CCTAFW_PROP_MENU_PREFERENCE": "{\"order\":[\"COUTFAST\",\"COUT\",\"BAL\",\"STP\",\"AIN\",\"STPM\",\"LANGCHG\",\"PINCHG\",\"RECCHG\",\"FCCHG\",\"MENUCHG\",\"CUSTOM\"], \"prominent\":[\"COUTFAST=prominentItem\",\"MENUCHG=prominentItem\"]}",

                    "CCTAFW_PROP_MENU_ITEMS[A,0,1]": ["AIN", "BAL", "CIN", "COININ", "COUT", "COUTFAST", "COUTMIXED", "COINOUT", "ACCOUNTCHG"],
                    "PROP_LISE_CONFIGURATION": "CCTAFW_PROP_MENU_ITEMS,0,1",
                    "VAR_AIN_VIEWSTATE_S": 3,
                    "VAR_BAL_VIEWSTATE_S": 3,
                    "VAR_STPM_VIEWSTATE_S": 3,
                    "VAR_STP_VIEWSTATE_S": 3,
                    "VAR_CINMIXED_VIEWSTATE_S": 0,
                    "VAR_COININ_VIEWSTATE_S": 0,
                    "VAR_CIN_PRESTAGED_VIEWSTATE_S": 3,
                    "VAR_CIN_VIEWSTATE_S": 3,
                    "VAR_COUT_VIEWSTATE_S": 0,
                    "VAR_COUTFAST_VIEWSTATE_S": 0,
                    "VAR_CHCCDM_VIEWSTATE_S": 0,
                    "VAR_MIXEDMEDIA_VIEWSTATE_S": 0,
                    "VAR_CHQCASH_VIEWSTATE_S": 2,
                    "VAR_ENV_VIEWSTATE_S": 0
                };

                this.businessDataSubMenuTest_4 = {
                    "CCTAFW_PROP_MENU_PREFERENCE": "{\"order\":[\"COUTFAST\",\"COUT\",\"BAL\",\"STP\",\"AIN\",\"STPM\",\"LANGCHG\",\"PINCHG\",\"RECCHG\",\"FCCHG\",\"MENUCHG\",\"CUSTOM\"], \"prominent\":[\"COUTFAST=prominentItem\",\"MENUCHG=prominentItem\"]}",

                    "CCTAFW_PROP_MENU_ITEMS[A,0,1]": ["AIN", "BAL", "CIN", "COININ", "COUT", "COUTFAST", "COUTMIXED", "COINOUT", "ACCOUNTCHG"],
                    "PROP_LISE_CONFIGURATION": "CCTAFW_PROP_MENU_ITEMS,0,1",
                    "VAR_AIN_VIEWSTATE_S": 3,
                    "VAR_BAL_VIEWSTATE_S": 3,
                    "VAR_STPM_VIEWSTATE_S": 3,
                    "VAR_STP_VIEWSTATE_S": 3,
                    "VAR_CINMIXED_VIEWSTATE_S": 0,
                    "VAR_COININ_VIEWSTATE_S": 3,
                    "VAR_CIN_PRESTAGED_VIEWSTATE_S": 3,
                    "VAR_CIN_VIEWSTATE_S": 3,
                    "VAR_COUT_VIEWSTATE_S": 0,
                    "VAR_COINOUT_VIEWSTATE_S": 0,
                    "VAR_COUTFAST_VIEWSTATE_S": 0,
                    "VAR_CHCCDM_VIEWSTATE_S": 0,
                    "VAR_MIXEDMEDIA_VIEWSTATE_S": 0,
                    "VAR_CHQCASH_VIEWSTATE_S": 2,
                    "VAR_ENV_VIEWSTATE_S": 0
                };

                this.businessDataSubMenuTest_5 = {
                    "CCTAFW_PROP_MENU_PREFERENCE": "{\"order\":[\"COUTFAST\",\"COUT\",\"BAL\",\"STP\",\"AIN\",\"STPM\",\"LANGCHG\",\"PINCHG\",\"RECCHG\",\"FCCHG\",\"MENUCHG\",\"CUSTOM\"], \"prominent\":[\"COUTFAST=prominentItem\",\"MENUCHG=prominentItem\"]}",

                    "CCTAFW_PROP_MENU_ITEMS[A,0,1]": ["AIN", "BAL", "CIN", "COININ", "COUT", "COUTFAST", "COUTMIXED", "COINOUT", "ACCOUNTCHG"],
                    "PROP_LISE_CONFIGURATION": "CCTAFW_PROP_MENU_ITEMS,0,1",
                    "VAR_AIN_VIEWSTATE_S": 3,
                    "VAR_BAL_VIEWSTATE_S": 3,
                    "VAR_STPM_VIEWSTATE_S": 3,
                    "VAR_STP_VIEWSTATE_S": 3,
                    "VAR_CINMIXED_VIEWSTATE_S": 0,
                    "VAR_COININ_VIEWSTATE_S": 3,
                    "VAR_CIN_PRESTAGED_VIEWSTATE_S": 3,
                    "VAR_CIN_VIEWSTATE_S": 3,
                    "VAR_COUT_VIEWSTATE_S": 0,
                    "VAR_COINOUT_VIEWSTATE_S": 3,
                    "VAR_COUTFAST_VIEWSTATE_S": 0,
                    "VAR_CHCCDM_VIEWSTATE_S": 0,
                    "VAR_MIXEDMEDIA_VIEWSTATE_S": 0,
                    "VAR_CHQCASH_VIEWSTATE_S": 2,
                    "VAR_ENV_VIEWSTATE_S": 0
                };

                injector
                    .mock("ui-content", {
                        designMode: Wincor.UI.Content.designMode
                    })
                    .mock("config/Config", {viewType: "softkey"})
                    .mock("knockout", Wincor.ko);
                done();
            });
        });

        afterEach(() => {
            injector.remove();
            jasmine.DEFAULT_TIMEOUT_INTERVAL = JASMINE_ORG_TIMEOUT;
        });

        // ---- ProFlex4Op ----
        describe("basic checks", () => {
            it("checks buildGuiKey", done => {
                injector.require(["GUIAPP/content/viewmodels/base/ProFlex4Op"], module => {
                    expect(module.buildGuiKey("IdleLoopPresentation", "Message"))
                        .toEqual(jasmine.stringMatching("GUI_IdleLoopPresentation_Message"));
                    expect(module.buildGuiKey("IdleLoopPresentation", "Message", "ADA"))
                        .toEqual(jasmine.stringMatching("GUI_IdleLoopPresentation_Message_ADA"));
                    done();
                }, done.fail);
            });

            it("checks getGuiKeySuffixPart", done => {
                injector.require(["GUIAPP/content/viewmodels/base/ProFlex4Op"], module => {
                    expect(module.getGuiKeySuffixPart("GUI_IdleLoopPresentation_Message", "IdleLoopPresentation"))
                        .toEqual(jasmine.stringMatching("Message"));
                    expect(module.getGuiKeySuffixPart("GUI_IdleLoopPresentation_Message_ADA", "IdleLoopPresentation"))
                        .toEqual(jasmine.stringMatching("Message_ADA"));
                    done();
                }, done.fail);
            });

            it("checks buildViewStateKey", done => {
                injector.require(["GUIAPP/content/viewmodels/base/ProFlex4Op"], module => {
                    expect(module.buildViewStateKey("CONFIRM")).toEqual(jasmine.stringMatching("VAR_CONFIRM_VIEWSTATE_S"));
                    done();
                }, done.fail);
            });

            it("checks getItem", done => {
                injector.require(["GUIAPP/content/viewmodels/base/ProFlex4Op"], module => {
                    expect(module.getItem([{result: "COUT"}, {result: "CIN"}], "CIN")).toEqual(jasmine.objectContaining({
                        result: "CIN"
                    }));
                    expect(module.getItem([{result: "COUT"}, {result: "CIN"}], "COUT")).toEqual(jasmine.objectContaining({
                        result: "COUT"
                    }));
                    expect(module.getItem([{result: "COUT"}, {result: "CIN"}], "BAR")).toBe(null);
                    done();
                }, done.fail);
            });

            it("checks getItemStaticPosFromPriorities", done => {
                injector.require(["GUIAPP/content/viewmodels/base/ProFlex4Op"], module => {
                    let itemList = ["COUT", "CIN", "COUTFAST"];
                    expect(module.getItemStaticPosFromPriorities(itemList, "CIN", this.viewConfigStaticAndProminentItemsTest_1.priorities)).toBe(2);
                    expect(module.getItemStaticPosFromPriorities(itemList, "COUTFAST", this.viewConfigStaticAndProminentItemsTest_1.priorities)).toBe(1);
                    expect(module.getItemStaticPosFromPriorities(itemList, "COUT", this.viewConfigStaticAndProminentItemsTest_1.priorities)).toBe(-1);
                    done();
                }, done.fail);
            });

            it("checks getItemProminentFromPriorities", done => {
                injector.require(["GUIAPP/content/viewmodels/base/ProFlex4Op"], module => {
                    let itemList = ["COUT", "CIN", "COUTFAST"];
                    expect(module.getItemProminentFromPriorities(itemList, "CIN", this.viewConfigStaticAndProminentItemsTest_1.priorities)).toBe("");
                    expect(module.getItemProminentFromPriorities(itemList, "COUTFAST", this.viewConfigStaticAndProminentItemsTest_1.priorities)).toBe("prominentItem");
                    done();
                }, done.fail);
            });

            it("checks getBankingContextData", done => {
                injector.require(["GUIAPP/content/viewmodels/base/ProFlex4Op"], module => {
                    let container = {
                        getById: id => {
                            return {
                                time: () => {
                                    return {
                                        time: "4:20",
                                        meridiem: "PM"
                                    }
                                },
                                date: () => {
                                    return "Tuesday, 4/3/2018"
                                }
                            }
                        }
                    };

                    module.getBankingContextData("DepositResult", container).then(context => {
                        expect(context.currencyData.ada).toBe("PROP_CURRENCY_ADA_TEXT");
                        expect(context.currencyData.exponent).toBe(-2);
                        expect(context.currencyData.iso).toBe("PROP_CURRENCY_ISO");
                        expect(context.currencyData.symbol).toBe("GUI_DepositResult_Label_CurrencySymbol");
                        expect(context.currencyData.text).toBe("GUI_DepositResult_Label_Currency");
                        expect(context.dateTime.date).toBe("Tuesday, 4/3/2018");
                        expect(context.dateTime.time).toBe("4:20");
                        expect(context.dateTime.meridiem).toBe("PM");
                        done();
                    }).catch(done.fail);
                }, done.fail);
            });
        });


        /*==== LISE ===================================================================================*/
        describe("LISE handling checks", () => {
            it("checks getLiseIndex", done => {
                injector.require(["GUIAPP/content/viewmodels/base/ProFlex4Op"], module => {
                    expect(module.getLiseIndex("COUT", [{result: "COUT"}])).toBe(0);
                    expect(module.getLiseIndex("CIN", [{result: "COUT"}, {result: "CIN"}])).toBe(1);
                    expect(module.getLiseIndex("CIN", [{result: "COUT"}, {rawresult: "CIN"}])).toBe(1);
                    done();
                }, done.fail);
            });

            it("getGenericListData LISE check 'CCTAFW_PROP_PREPAID_LISE_LIST,1,1'", done => {
                injector.require(["GUIAPP/content/viewmodels/base/ProFlex4Op"], module => {
                    Wincor.UI.Service.Provider.DataService.businessData = this.businessData_LISE_Test_0;
                    module.getGenericListData("PrepaidAmountSelection").then(data => {
                        // general checks
                        expect(typeof data === "object").toBe(true);
                        expect(Array.isArray(data.elements)).toBe(true);
                        expect(typeof data.priorities === "object").toBe(true);
                        // item structure check
                        expect(data.elements.length).toBe(6);
                        expect(data.elements[0].result).toBe("1200");
                        expect(data.elements[0].state).toBe(0);
                        expect(data.elements[1].result).toBe("1300");
                        expect(data.elements[1].state).toBe(0);
                        expect(data.elements[2].result).toBe("1400");
                        expect(data.elements[2].state).toBe(0);
                        expect(data.elements[3].result).toBe("1500");
                        expect(data.elements[3].state).toBe(0);
                        expect(data.elements[4].result).toBe("1600");
                        expect(data.elements[4].state).toBe(0);
                        expect(data.elements[5].result).toBe("1700");
                        expect(data.elements[5].state).toBe(0);
                        done();
                    }).catch(done.fail);
                }, done.fail);
            });

            it("getGenericListData LISE check 'CCTAFW_PROP_PREPAID_LISE_LIST,1,1,'", done => {
                injector.require(["GUIAPP/content/viewmodels/base/ProFlex4Op"], module => {
                    Wincor.UI.Service.Provider.DataService.businessData = this.businessData_LISE_Test_1;
                    module.getGenericListData("PrepaidAmountSelection").then(data => {
                        // general checks
                        expect(typeof data === "object").toBe(true);
                        expect(Array.isArray(data.elements)).toBe(true);
                        expect(typeof data.priorities === "object").toBe(true);
                        // item structure check
                        expect(data.elements.length).toBe(6);
                        expect(data.elements[0].result).toBe("1200");
                        expect(data.elements[1].result).toBe("1300");
                        expect(data.elements[2].result).toBe("1400");
                        expect(data.elements[3].result).toBe("1500");
                        expect(data.elements[4].result).toBe("1600");
                        expect(data.elements[5].result).toBe("1700");
                        done();
                    }).catch(done.fail);
                }, done.fail);
            });

            it("getGenericListData LISE check 'CCTAFW_PROP_PREPAID_LISE_LIST,1,1,,'", done => {
                injector.require(["GUIAPP/content/viewmodels/base/ProFlex4Op"], module => {
                    Wincor.UI.Service.Provider.DataService.businessData = this.businessData_LISE_Test_2;
                    module.getGenericListData("PrepaidAmountSelection").then(data => {
                        // general checks
                        expect(typeof data === "object").toBe(true);
                        expect(Array.isArray(data.elements)).toBe(true);
                        expect(typeof data.priorities === "object").toBe(true);
                        // item structure check
                        expect(data.elements.length).toBe(6);
                        expect(data.elements[0].result).toBe("1200");
                        expect(data.elements[1].result).toBe("1300");
                        expect(data.elements[2].result).toBe("1400");
                        expect(data.elements[3].result).toBe("1500");
                        expect(data.elements[4].result).toBe("1600");
                        expect(data.elements[5].result).toBe("1700");
                        done();
                    }).catch(done.fail);
                }, done.fail);
            });

            it("getGenericListData LISE check 'CCTAFW_PROP_PREPAID_LISE_LIST,1,1,,2'", done => {
                injector.require(["GUIAPP/content/viewmodels/base/ProFlex4Op"], module => {
                    Wincor.UI.Service.Provider.DataService.businessData = this.businessData_LISE_Test_3;
                    module.getGenericListData("PrepaidAmountSelection").then(data => {
                        // general checks
                        expect(typeof data === "object").toBe(true);
                        expect(Array.isArray(data.elements)).toBe(true);
                        expect(typeof data.priorities === "object").toBe(true);
                        // item structure check
                        expect(data.elements.length).toBe(2);
                        expect(data.elements[0].result).toBe("1200");
                        expect(data.elements[1].result).toBe("1300");
                        expect(data.elements[2]).toBe(void 0);
                        done();
                    }).catch(done.fail);
                }, done.fail);
            });

            it("getGenericListData LISE check 'CCTAFW_PROP_PREPAID_LISE_LIST,1,1,,1'", done => {
                injector.require(["GUIAPP/content/viewmodels/base/ProFlex4Op"], module => {
                    Wincor.UI.Service.Provider.DataService.businessData = this.businessData_LISE_Test_4;
                    module.getGenericListData("PrepaidAmountSelection").then(data => {
                        // general checks
                        expect(typeof data === "object").toBe(true);
                        expect(Array.isArray(data.elements)).toBe(true);
                        expect(typeof data.priorities === "object").toBe(true);
                        // item structure check
                        expect(data.elements.length).toBe(1);
                        expect(data.elements[0].result).toBe("1200");
                        expect(data.elements[1]).toBe(void 0);
                        done();
                    }).catch(done.fail);
                }, done.fail);
            });

            it("getGenericListData LISE check 'CCTAFW_PROP_PREPAID_LISE_LIST,8,1,,14'", done => {
                injector.require(["GUIAPP/content/viewmodels/base/ProFlex4Op"], module => {
                    Wincor.UI.Service.Provider.DataService.businessData = this.businessData_LISE_Test_4a;
                    module.getGenericListData("PrepaidAmountSelection").then(data => {
                        // general checks
                        expect(typeof data === "object").toBe(true);
                        expect(Array.isArray(data.elements)).toBe(true);
                        expect(typeof data.priorities === "object").toBe(true);
                        // item structure check
                        expect(data.elements.length).toBe(7);
                        expect(data.elements[0].result).toBe("1900");
                        expect(data.elements[1].result).toBe("2000");
                        expect(data.elements[2].result).toBe("2100");
                        expect(data.elements[3].result).toBe("2200");
                        expect(data.elements[4].result).toBe("2300");
                        expect(data.elements[5].result).toBe("2400");
                        expect(data.elements[6].result).toBe("2500");
                        expect(data.elements[7]).toBe(void 0);
                        done();
                    }).catch(done.fail);
                }, done.fail);
            });

            it("getGenericListData LISE check 'CCTAFW_PROP_PREPAID_LISE_LIST,8,1,,14' (host sent less data than expected)", done => {
                injector.require(["GUIAPP/content/viewmodels/base/ProFlex4Op"], module => {
                    Wincor.UI.Service.Provider.DataService.businessData = this.businessData_LISE_Test_4b;
                    module.getGenericListData("PrepaidAmountSelection").then(data => {
                        // general checks
                        expect(typeof data === "object").toBe(true);
                        expect(Array.isArray(data.elements)).toBe(true);
                        expect(typeof data.priorities === "object").toBe(true);
                        // item structure check
                        expect(data.elements.length).toBe(4);
                        expect(data.elements[0].result).toBe("1900");
                        expect(data.elements[1].result).toBe("2000");
                        expect(data.elements[2].result).toBe("2100");
                        expect(data.elements[3].result).toBe("2200");
                        expect(data.elements[4]).toBe(void 0);
                        done();
                    }).catch(done.fail);
                }, done.fail);
            });

            it("getGenericListData LISE check 'CCTAFW_PROP_PREPAID_LISE_LIST,8,1,,7' (invalid LISE config)", done => {
                injector.require(["GUIAPP/content/viewmodels/base/ProFlex4Op"], module => {
                    Wincor.UI.Service.Provider.DataService.businessData = this.businessData_LISE_Test_4c;
                    module.getGenericListData("PrepaidAmountSelection").then(data => {
                        done.fail(); // if we come here ProFlex4Op has failed
                    }).catch(() => {  // we have to come here for a reject
                        // to not pass error into done function! This will break the test
                        done();
                    });
                }, done.fail);
            });

            it("getGenericListData LISE check 'CCTAFW_PROP_EMV_APPLICATION_SELECTION_LISE_DATA,0,2'", done => {
                injector.require(["GUIAPP/content/viewmodels/base/ProFlex4Op"], module => {
                    Wincor.UI.Service.Provider.DataService.businessData = this.businessData_LISE_Test_5;
                    module.getGenericListData("EmvApplicationSelection").then(data => {
                        // general checks
                        expect(typeof data === "object").toBe(true);
                        expect(Array.isArray(data.elements)).toBe(true);
                        expect(typeof data.priorities === "object").toBe(true);
                        // item structure check
                        expect(data.elements.length).toBe(3);
                        expect(data.elements[0].result).toBe("Master Card");
                        expect(data.elements[0].icon()).toBe("GUI_EmvApplicationSelection_Button_Master Card_Icon1");
                        expect(data.elements[0].rawdata[1]()).toBe("Item1");
                        expect(data.elements[1].result).toBe("Visa");
                        expect(data.elements[1].icon()).toBe("GUI_EmvApplicationSelection_Button_Visa_Icon1");
                        expect(data.elements[1].rawdata[1]()).toBe("Item2");
                        expect(data.elements[2].result).toBe("AMEX");
                        expect(data.elements[2].icon()).toBe("GUI_EmvApplicationSelection_Button_AMEX_Icon1");
                        expect(data.elements[2].rawdata[1]()).toBe("Item3");
                        done();
                    }).catch(done.fail);
                }, done.fail);
            });

            it("getGenericListData LISE check 'CCTAFW_PROP_EMV_APPLICATION_SELECTION_LISE_DATA,0,2,1'", done => {
                injector.require(["GUIAPP/content/viewmodels/base/ProFlex4Op"], module => {
                    Wincor.UI.Service.Provider.DataService.businessData = this.businessData_LISE_Test_6;
                    module.getGenericListData("EmvApplicationSelection").then(data => {
                        // general checks
                        expect(typeof data === "object").toBe(true);
                        expect(Array.isArray(data.elements)).toBe(true);
                        expect(typeof data.priorities === "object").toBe(true);
                        // item structure check
                        expect(data.elements.length).toBe(1);
                        expect(data.elements[0].result).toBe("Master Card");
                        expect(data.elements[0].icon()).toBe("GUI_EmvApplicationSelection_Button_Master Card_Icon1");
                        expect(data.elements[0].rawdata[1]()).toBe("Item1");
                        expect(data.elements[1]).toBe(void 0);
                        done();
                    }).catch(done.fail);
                }, done.fail);
            });

            it("getGenericListData LISE check 'CCTAFW_PROP_EMV_APPLICATION_SELECTION_LISE_DATA,0,2,3'", done => {
                injector.require(["GUIAPP/content/viewmodels/base/ProFlex4Op"], module => {
                    Wincor.UI.Service.Provider.DataService.businessData = this.businessData_LISE_Test_7;
                    module.getGenericListData("EmvApplicationSelection").then(data => {
                        // general checks
                        expect(typeof data === "object").toBe(true);
                        expect(Array.isArray(data.elements)).toBe(true);
                        expect(typeof data.priorities === "object").toBe(true);
                        // item structure check
                        expect(data.elements.length).toBe(2);
                        expect(data.elements[0].result).toBe("Master Card");
                        expect(data.elements[0].icon()).toBe("GUI_EmvApplicationSelection_Button_Master Card_Icon1");
                        expect(data.elements[0].rawdata[1]()).toBe("Item1");
                        expect(data.elements[1].result).toBe("Visa");
                        expect(data.elements[1].icon()).toBe("GUI_EmvApplicationSelection_Button_Visa_Icon1");
                        expect(data.elements[1].rawdata[1]()).toBe("Item2");
                        expect(data.elements[2]).toBe(void 0);
                        done();
                    }).catch(done.fail);
                }, done.fail);
            });

            it("getGenericListData LISE check 'CCTAFW_PROP_EMV_APPLICATION_SELECTION_LISE_DATA,0,2,5'", done => {
                injector.require(["GUIAPP/content/viewmodels/base/ProFlex4Op"], module => {
                    Wincor.UI.Service.Provider.DataService.businessData = this.businessData_LISE_Test_8;
                    module.getGenericListData("EmvApplicationSelection").then(data => {
                        // general checks
                        expect(typeof data === "object").toBe(true);
                        expect(Array.isArray(data.elements)).toBe(true);
                        expect(typeof data.priorities === "object").toBe(true);
                        // item structure check
                        expect(data.elements.length).toBe(3);
                        expect(data.elements[0].result).toBe("Master Card");
                        expect(data.elements[0].icon()).toBe("GUI_EmvApplicationSelection_Button_Master Card_Icon1");
                        expect(data.elements[0].rawdata[1]()).toBe("Item1");
                        expect(data.elements[1].result).toBe("Visa");
                        expect(data.elements[1].icon()).toBe("GUI_EmvApplicationSelection_Button_Visa_Icon1");
                        expect(data.elements[1].rawdata[1]()).toBe("Item2");
                        expect(data.elements[2].result).toBe("AMEX");
                        expect(data.elements[2].icon()).toBe("GUI_EmvApplicationSelection_Button_AMEX_Icon1");
                        expect(data.elements[2].rawdata[1]()).toBe("Item3");

                        done();
                    }).catch(done.fail);
                }, done.fail);
            });

            // expecting all 6 data chunks
            it("getGenericListData LISE check 'CCTAFW_PROP_LISE_ACCOUNT_ITEM,0,9'", done => {
                injector.require(["GUIAPP/content/viewmodels/base/ProFlex4Op"], module => {
                    Wincor.UI.Service.Provider.DataService.businessData = this.businessData_LISE_Test_9;
                    module.getGenericListData("AccountSelection").then(data => {
                        // general checks
                        expect(typeof data === "object").toBe(true);
                        expect(Array.isArray(data.elements)).toBe(true);
                        expect(typeof data.priorities === "object").toBe(true);
                        // item structure check
                        expect(data.elements.length).toBe(6);
                        expect(data.elements[0].result).toBe("11111111111111112");
                        expect(data.elements[0].rawdata[0]()).toBe("11111111111111112");
                        expect(data.elements[0].rawdata[1]()).toBe("~Primary checking account");
                        expect(data.elements[0].rawdata[2]()).toBe("USD");
                        expect(data.elements[0].rawdata[3]()).toBe("10330.11");
                        expect(data.elements[0].rawdata[4]()).toBe("+");
                        expect(data.elements[0].rawdata[5]()).toBe("10000");
                        expect(data.elements[0].rawdata[6]()).toBe("EUR");
                        expect(data.elements[0].rawdata[7]()).toBe("1000");
                        expect(data.elements[0].rawdata[8]()).toBe("010");

                        expect(data.elements[1].result).toBe("222222222222222223");
                        expect(data.elements[1].rawdata[0]()).toBe("222222222222222223");
                        expect(data.elements[1].rawdata[1]()).toBe("~Secondary checking account");
                        expect(data.elements[1].rawdata[2]()).toBe("USD");
                        expect(data.elements[1].rawdata[3]()).toBe("20000.11");
                        expect(data.elements[1].rawdata[4]()).toBe("+");
                        expect(data.elements[1].rawdata[5]()).toBe("10000");
                        expect(data.elements[1].rawdata[6]()).toBe("EUR");
                        expect(data.elements[1].rawdata[7]()).toBe("1000");
                        expect(data.elements[1].rawdata[8]()).toBe("010");

                        expect(data.elements[2].result).toBe("333333333333333");
                        expect(data.elements[2].rawdata[0]()).toBe("333333333333333");
                        expect(data.elements[2].rawdata[1]()).toBe("~Third checking account");
                        expect(data.elements[2].rawdata[2]()).toBe("USD");
                        expect(data.elements[2].rawdata[3]()).toBe("32000.11");
                        expect(data.elements[2].rawdata[4]()).toBe("+");
                        expect(data.elements[2].rawdata[5]()).toBe("10000");
                        expect(data.elements[2].rawdata[6]()).toBe("EUR");
                        expect(data.elements[2].rawdata[7]()).toBe("1000");
                        expect(data.elements[2].rawdata[8]()).toBe("010");

                        expect(data.elements[3].result).toBe("44444444444444442");
                        expect(data.elements[3].rawdata[0]()).toBe("44444444444444442");
                        expect(data.elements[3].rawdata[1]()).toBe("~Primary checking account");
                        expect(data.elements[3].rawdata[2]()).toBe("USD");
                        expect(data.elements[3].rawdata[3]()).toBe("10330.11");
                        expect(data.elements[3].rawdata[4]()).toBe("+");
                        expect(data.elements[3].rawdata[5]()).toBe("10000");
                        expect(data.elements[3].rawdata[6]()).toBe("EUR");
                        expect(data.elements[3].rawdata[7]()).toBe("1000");
                        expect(data.elements[3].rawdata[8]()).toBe("010");

                        expect(data.elements[4].result).toBe("555555555555555523");
                        expect(data.elements[4].rawdata[0]()).toBe("555555555555555523");
                        expect(data.elements[4].rawdata[1]()).toBe("~Secondary checking account");
                        expect(data.elements[4].rawdata[2]()).toBe("USD");
                        expect(data.elements[4].rawdata[3]()).toBe("20000.11");
                        expect(data.elements[4].rawdata[4]()).toBe("+");
                        expect(data.elements[4].rawdata[5]()).toBe("10000");
                        expect(data.elements[4].rawdata[6]()).toBe("EUR");
                        expect(data.elements[4].rawdata[7]()).toBe("1000");
                        expect(data.elements[4].rawdata[8]()).toBe("010");

                        expect(data.elements[5].result).toBe("666666666666666");
                        expect(data.elements[5].rawdata[0]()).toBe("666666666666666");
                        expect(data.elements[5].rawdata[1]()).toBe("~Third checking account");
                        expect(data.elements[5].rawdata[2]()).toBe("USD");
                        expect(data.elements[5].rawdata[3]()).toBe("32000.11");
                        expect(data.elements[5].rawdata[4]()).toBe("+");
                        expect(data.elements[5].rawdata[5]()).toBe("10000");
                        expect(data.elements[5].rawdata[6]()).toBe("EUR");
                        expect(data.elements[5].rawdata[7]()).toBe("1000");
                        expect(data.elements[5].rawdata[8]()).toBe("010");

                        done();
                    }).catch(done.fail);
                }, done.fail);
            });

            // expecting exactly the 1. data chunk only
            it("getGenericListData LISE check 'CCTAFW_PROP_LISE_ACCOUNT_ITEM,0,9,,8'", done => {
                injector.require(["GUIAPP/content/viewmodels/base/ProFlex4Op"], module => {
                    Wincor.UI.Service.Provider.DataService.businessData = this.businessData_LISE_Test_10;
                    module.getGenericListData("AccountSelection").then(data => {
                        // general checks
                        expect(typeof data === "object").toBe(true);
                        expect(Array.isArray(data.elements)).toBe(true);
                        expect(typeof data.priorities === "object").toBe(true);
                        // item structure check
                        expect(data.elements.length).toBe(1);
                        expect(data.elements[0].result).toBe("11111111111111112");
                        expect(data.elements[0].rawdata[0]()).toBe("11111111111111112");
                        expect(data.elements[0].rawdata[1]()).toBe("~Primary checking account");
                        expect(data.elements[0].rawdata[2]()).toBe("USD");
                        expect(data.elements[0].rawdata[3]()).toBe("10330.11");
                        expect(data.elements[0].rawdata[4]()).toBe("+");
                        expect(data.elements[0].rawdata[5]()).toBe("10000");
                        expect(data.elements[0].rawdata[6]()).toBe("EUR");
                        expect(data.elements[0].rawdata[7]()).toBe("1000");
                        expect(data.elements[0].rawdata[8]()).toBe("010");
                        expect(data.elements[1]).toBe(void 0);
                        done();
                    }).catch(done.fail);
                }, done.fail);
            });

            // invalid host data
            it("getGenericListData LISE check 'CCTAFW_PROP_LISE_ACCOUNT_ITEM,0,9' (invalid host data - modulo check will fail)", done => {
                injector.require(["GUIAPP/content/viewmodels/base/ProFlex4Op"], module => {
                    Wincor.UI.Service.Provider.DataService.businessData = this.businessData_LISE_Test_10a;
                    module.getGenericListData("AccountSelection").then(data => {
                        done.fail(); // we don't expect to come here, if so ProFlex4Op has logically failed
                    }).catch(() => {
                        // to not pass error into done function! This will break the test
                        done();
                    });
                }, done.fail);
            });

            // expecting exactly the 2. data chunk only
            it("getGenericListData LISE check 'CCTAFW_PROP_LISE_ACCOUNT_ITEM,9,9,,17'", done => {
                injector.require(["GUIAPP/content/viewmodels/base/ProFlex4Op"], module => {
                    Wincor.UI.Service.Provider.DataService.businessData = this.businessData_LISE_Test_11;
                    module.getGenericListData("AccountSelection").then(data => {
                        // general checks
                        expect(typeof data === "object").toBe(true);
                        expect(Array.isArray(data.elements)).toBe(true);
                        expect(typeof data.priorities === "object").toBe(true);
                        // item structure check
                        expect(data.elements.length).toBe(1);
                        expect(data.elements[0].result).toBe("222222222222222223");
                        expect(data.elements[0].rawdata[0]()).toBe("222222222222222223");
                        expect(data.elements[0].rawdata[1]()).toBe("~Secondary checking account");
                        expect(data.elements[0].rawdata[2]()).toBe("USD");
                        expect(data.elements[0].rawdata[3]()).toBe("20000.11");
                        expect(data.elements[0].rawdata[4]()).toBe("+");
                        expect(data.elements[0].rawdata[5]()).toBe("10000");
                        expect(data.elements[0].rawdata[6]()).toBe("EUR");
                        expect(data.elements[0].rawdata[7]()).toBe("1000");
                        expect(data.elements[0].rawdata[8]()).toBe("010");
                        expect(data.elements[1]).toBe(void 0);
                        done();
                    }).catch(done.fail);
                }, done.fail);
            });
        });

        /*==== MenuSelection ===================================================================================*/
        describe("MenuSelection items", () => {
            it("itemgaps=false + static command config for a func sel code item, without a VIEWSTATE_S prop", done => {
                injector.require(["GUIAPP/content/viewmodels/base/ProFlex4Op"], module => {
                    // const flex4Op = new Wincor.UI.Content.ProFlex4Op(_module);
                    // var buildElementTree = spyOn(this, "buildElementTree").and.callThrough();
                    // buildElementTree.call();
                    // let elements = flex4Op.build
                    Wincor.UI.Service.Provider.DataService.businessData = {
                        "CCTAFW_PROP_MENU_PREFERENCE": "{}",
                        "CCTAFW_PROP_MENU_ITEMS[A,0,1]": ["AIN","BAL", "COUTFAST"],
                        "PROP_LISE_CONFIGURATION": "CCTAFW_PROP_MENU_ITEMS,0,1",
                        "VAR_AIN_VIEWSTATE_S": 0,
                        "VAR_BAL_VIEWSTATE_S": 0
                    };
                    Wincor.UI.Service.Provider.ViewService.viewContext.viewConfig = this.viewConfigSubMenuTest_1;
                    Wincor.UI.Service.Provider.ViewService.viewContext.viewConfig.commandconfig = {
                        "COUTFAST": "2", // expect that this item get disabled and we have no VAR_COUTFAST_VIEWSTATE_S property for it
                        "AIN": "2", // expect that this item get disabled even we have a VAR_AIN_VIEWSTATE_S property for it which is 0 (enabled)
                        "BAL": "HELLO;0" // expect that this item get enabled by the given default value, even we have a VAR_BAL_VIEWSTATE_S property for it which is 0 (enabled)
                    };
                    module.setViewModelContainer({
                        "viewModelHelper": {
                            "getPropertyValue": name => {
                                return name;
                            }
                        }
                    });
                    module.getGenericListData("MenuSelection").then(data => {
                        // general checks
                        expect(typeof data === "object").toBe(true);
                        expect(Array.isArray(data.elements)).toBe(true);
                        expect(typeof data.priorities === "object").toBe(true);
                        // menu structure check
                        expect(data.elements.length).toBe(3);
                        expect(data.elements[0].result).toBe("AIN");
                        expect(data.elements[0].state).toBe(2);
                        expect(data.elements[0].viewStateKey).toBe(void 0);
                        expect(data.elements[1].result).toBe("BAL");
                        expect(data.elements[1].state).toBe(0);
                        expect(data.elements[1].viewStateKey).toBe(void 0); // viewStateKey "HELLO" should be removed
                        expect(data.elements[2].result).toBe("COUTFAST");
                        expect(data.elements[2].state).toBe(2);
                        expect(data.elements[2].viewStateKey).toBe(void 0);
                        done();
                    }).catch(done.fail);
                }, done.fail);
                
            });
            
            it("remove hidden items + itemgaps=false + not valid viewstate property in command config", done => {
                injector.require(["GUIAPP/content/viewmodels/base/ProFlex4Op"], module => {
                    // const flex4Op = new Wincor.UI.Content.ProFlex4Op(_module);
                    // var buildElementTree = spyOn(this, "buildElementTree").and.callThrough();
                    // buildElementTree.call();
                    // let elements = flex4Op.build
                    Wincor.UI.Service.Provider.DataService.businessData = this.businessDataSubMenuTest_1;
                    Wincor.UI.Service.Provider.ViewService.viewContext.viewConfig = this.viewConfigSubMenuTest_1;
                    Wincor.UI.Service.Provider.ViewService.viewContext.viewConfig.commandconfig = {
                        "COUTFAST": "3", // expect that this item get removed
                        "BAL": "BAL;3" // expect that this item get removed, because 'BAL' won't be find and thus the default is relevant
                    };
                    module.setViewModelContainer({
                        "viewModelHelper": {
                            "getPropertyValue": name => {
                                return name;
                            }
                        }
                    });
                    module.getGenericListData("MenuSelection").then(data => {
                        // general checks
                        expect(typeof data === "object").toBe(true);
                        expect(Array.isArray(data.elements)).toBe(true);
                        expect(typeof data.priorities === "object").toBe(true);
                        // menu structure check
                        expect(data.elements.length).toBe(5);
                        expect(data.elements[0].result).toBe("COININ");
                        expect(data.elements[0].state).toBe(0);
                        expect(data.elements[1].result).toBe("COUT");
                        expect(data.elements[1].state).toBe(0);
                        expect(data.elements[2].result).toBe("COUTMIXED");
                        expect(data.elements[2].state).toBe(0);
                        expect(data.elements[3].result).toBe("COINOUT");
                        expect(data.elements[3].state).toBe(0);
                        expect(data.elements[4].result).toBe("ACCOUNTCHG");
                        expect(data.elements[4].state).toBe(0);
                        done();
                    }).catch(done.fail);
                }, done.fail);
                
            });
            
            it("remove hidden items + itemgaps=false + valid/invalid viewstate prop in command config", done => {
                injector.require(["GUIAPP/content/viewmodels/base/ProFlex4Op"], module => {
                    // const flex4Op = new Wincor.UI.Content.ProFlex4Op(_module);
                    // var buildElementTree = spyOn(this, "buildElementTree").and.callThrough();
                    // buildElementTree.call();
                    // let elements = flex4Op.build
                    Wincor.UI.Service.Provider.DataService.businessData = this.businessDataSubMenuTest_1;
                    Wincor.UI.Service.Provider.ViewService.viewContext.viewConfig = this.viewConfigSubMenuTest_1;
                    Wincor.UI.Service.Provider.ViewService.viewContext.viewConfig.commandconfig = {
                        "COUTFAST": "3", // expect that this item get removed
                        "BAL": "VAR_BAL_VIEWSTATE_S;3", // expect that this item it kept, because 'VAR_BAL_VIEWSTATE_S' will be find and thus the prop value is relevant, which is 0
                        "COUT": "0", // expect that this item stays
                        "COININ": "2", // expect that this item stays
                        "COINOUT": "HELLO;2", // expect that this item stays, because 'HELLO' won't be find and thus the default is relevant
                    };
                    module.setViewModelContainer({
                        "viewModelHelper": {
                            "getPropertyValue": name => {
                                return name;
                            }
                        }
                    });
                    module.getGenericListData("MenuSelection").then(data => {
                        // general checks
                        expect(typeof data === "object").toBe(true);
                        expect(Array.isArray(data.elements)).toBe(true);
                        expect(typeof data.priorities === "object").toBe(true);
                        // menu structure check
                        expect(data.elements.length).toBe(6);
                        expect(data.elements[0].result).toBe("BAL");
                        expect(typeof data.elements[0].captions[0] === "function").toBe(true);
                        expect(data.elements[0].state).toBe(0);
                        expect(data.elements[0].viewStateKey).toBe(void 0);
                        expect(data.elements[1].result).toBe("COININ");
                        expect(typeof data.elements[1].captions[0] === "function").toBe(true);
                        expect(data.elements[1].state).toBe(2);
                        expect(data.elements[1].viewStateKey).toBe(void 0);
                        expect(data.elements[2].result).toBe("COUT");
                        expect(typeof data.elements[2].captions[0] === "function").toBe(true);
                        expect(data.elements[2].state).toBe(0);
                        expect(data.elements[3].result).toBe("COUTMIXED");
                        expect(typeof data.elements[3].captions[0] === "function").toBe(true);
                        expect(data.elements[3].state).toBe(0);
                        expect(data.elements[4].result).toBe("COINOUT");
                        expect(typeof data.elements[4].captions[0] === "function").toBe(true);
                        expect(data.elements[4].state).toBe(2);
                        expect(data.elements[4].viewStateKey).toBe(void 0);
                        expect(data.elements[5].result).toBe("ACCOUNTCHG");
                        expect(typeof data.elements[5].captions[0] === "function").toBe(true);
                        expect(data.elements[5].state).toBe(0);
                        done();
                    }).catch(done.fail);
                }, done.fail);
            });

            it("various commandconfig checks itemgaps=true", done => {
                injector.require(["GUIAPP/content/viewmodels/base/ProFlex4Op"], module => {
                    // const flex4Op = new Wincor.UI.Content.ProFlex4Op(_module);
                    // var buildElementTree = spyOn(this, "buildElementTree").and.callThrough();
                    // buildElementTree.call();
                    // let elements = flex4Op.build
                    Wincor.UI.Service.Provider.DataService.businessData = this.businessDataSubMenuTest_1;
                    Wincor.UI.Service.Provider.ViewService.viewContext.viewConfig = this.viewConfigSubMenuTest_3;
                    Wincor.UI.Service.Provider.ViewService.viewContext.viewConfig.priorities.itemgaps = true;
                    Wincor.UI.Service.Provider.ViewService.viewContext.viewConfig.commandconfig = {
                        "COUTFAST": "3", // expect that is hidden
                        "BAL": "VAR_BAL_VIEWSTATE_S;3", // expect that this item it kept, because 'VAR_BAL_VIEWSTATE_S' will be find and thus the prop value is relevant, which is 0
                        "COUT": "VAR_COUT_VIEWSTATE_S", // expect that this item stays
                        "CIN": "VAR_X_VIEWSTATE_S;2", // expect that this item stays disabled via the default value
                        "COININ": "VAR_MY_VIEWSTATE_S;2", // expect that this item stays as disabled
                        "COINOUT": "HELLO;2" // expect that this item stays, because 'HELLO' won't be find and thus the default is relevant
                    };
                    module.setViewModelContainer({
                        "viewModelHelper": {
                            "getPropertyValue": name => {
                                return name;
                            }
                        }
                    });
                    module.getGenericListData("MenuSelection").then(data => {
                        // general checks
                        expect(typeof data === "object").toBe(true);
                        expect(Array.isArray(data.elements)).toBe(true);
                        expect(typeof data.priorities === "object").toBe(true);
                        // menu structure check
                        expect(data.elements.length).toBe(4);
                        const DEPOSIT_OPTIONS = data.elements[0].DEPOSIT_OPTIONS;
                        expect(data.elements[0].result).toBe("DEPOSIT_OPTIONS");
                        expect(data.elements[0].state).toBe(0);
                        expect(data.elements[0].viewStateKey).toBe(void 0);
                        expect(typeof data.elements[0].captions[0] === "function").toBe(true);
                        expect(DEPOSIT_OPTIONS[0].result).toBe("CIN");
                        expect(DEPOSIT_OPTIONS[0].state).toBe(2);
                        expect(DEPOSIT_OPTIONS[0].viewStateKey).toBe(void 0);
                        expect(DEPOSIT_OPTIONS[1].result).toBe("COININ");
                        expect(DEPOSIT_OPTIONS[1].state).toBe(2);
                        expect(DEPOSIT_OPTIONS[1].viewStateKey).toBe(void 0);

                        const WITHDRAWAL_OPTIONS = data.elements[0].DEPOSIT_OPTIONS[3].WITHDRAW_OPTIONS;
                        expect(WITHDRAWAL_OPTIONS[0].result).toBe("COUT");
                        expect(WITHDRAWAL_OPTIONS[0].state).toBe(0);
                        expect(WITHDRAWAL_OPTIONS[0].viewStateKey).toBe(void 0);
                        expect(WITHDRAWAL_OPTIONS[1].result).toBe("COINOUT");
                        expect(WITHDRAWAL_OPTIONS[1].state).toBe(2);
                        expect(WITHDRAWAL_OPTIONS[1].viewStateKey).toBe(void 0);
                        
                        expect(data.elements[1].result).toBe("COUTFAST");
                        expect(typeof data.elements[1].captions[0] === "function").toBe(true);
                        expect(data.elements[1].state).toBe(3);
                        expect(data.elements[1].viewStateKey).toBe(void 0);
                        expect(data.elements[2].result).toBe("COUTMIXED");
                        expect(typeof data.elements[2].captions[0] === "function").toBe(true);
                        expect(data.elements[2].state).toBe(0);
                        expect(data.elements[3].result).toBe("ACCOUNTCHG");
                        expect(typeof data.elements[3].captions[0] === "function").toBe(true);
                        expect(data.elements[3].state).toBe(0);
                        done();
                    }).catch(done.fail);
                }, done.fail);
            });

            it("various commandconfig checks itemgaps=false", done => {
                injector.require(["GUIAPP/content/viewmodels/base/ProFlex4Op"], module => {
                    // const flex4Op = new Wincor.UI.Content.ProFlex4Op(_module);
                    // var buildElementTree = spyOn(this, "buildElementTree").and.callThrough();
                    // buildElementTree.call();
                    // let elements = flex4Op.build
                    Wincor.UI.Service.Provider.DataService.businessData = this.businessDataSubMenuTest_1;
                    Wincor.UI.Service.Provider.ViewService.viewContext.viewConfig = this.viewConfigSubMenuTest_3;
                    Wincor.UI.Service.Provider.ViewService.viewContext.viewConfig.priorities.itemgaps = false;
                    Wincor.UI.Service.Provider.ViewService.viewContext.viewConfig.commandconfig = {
                        "COUTFAST": "3", // expect that is removed
                        "BAL": "VAR_BAL_VIEWSTATE_S;3", // expect that this item it kept, because 'VAR_BAL_VIEWSTATE_S' will be find and thus the prop value is relevant, which is 0
                        "COUT": "VAR_COUT_VIEWSTATE_S", // expect that this item stays
                        "CIN": "VAR_X_VIEWSTATE_S;2", // expect that this item stays disabled via the default value
                        "COININ": "VAR_MY_VIEWSTATE_S;3", // expect that this item gets removed
                        "COINOUT": "HELLO;2" // expect that this item stays, because 'HELLO' won't be find and thus the default is relevant
                    };
                    module.setViewModelContainer({
                        "viewModelHelper": {
                            "getPropertyValue": name => {
                                return name;
                            }
                        }
                    });
                    module.getGenericListData("MenuSelection").then(data => {
                        // general checks
                        expect(typeof data === "object").toBe(true);
                        expect(Array.isArray(data.elements)).toBe(true);
                        expect(typeof data.priorities === "object").toBe(true);
                        // menu structure check
                        expect(data.elements.length).toBe(3);
                        const DEPOSIT_OPTIONS = data.elements[0].DEPOSIT_OPTIONS;
                        expect(data.elements[0].result).toBe("DEPOSIT_OPTIONS");
                        expect(data.elements[0].state).toBe(0);
                        expect(data.elements[0].viewStateKey).toBe(void 0);
                        expect(typeof data.elements[0].captions[0] === "function").toBe(true);
                        expect(DEPOSIT_OPTIONS[0].result).toBe("CIN");
                        expect(DEPOSIT_OPTIONS[0].state).toBe(2);
                        expect(DEPOSIT_OPTIONS[0].viewStateKey).toBe(void 0);
                        expect(DEPOSIT_OPTIONS[1].result).toBe("BAL");
                        expect(DEPOSIT_OPTIONS[1].state).toBe(0);
                        expect(DEPOSIT_OPTIONS[1].viewStateKey).toBe(void 0);

                        const WITHDRAWAL_OPTIONS = data.elements[0].DEPOSIT_OPTIONS[2].WITHDRAW_OPTIONS;
                        expect(WITHDRAWAL_OPTIONS[0].result).toBe("COUT");
                        expect(WITHDRAWAL_OPTIONS[0].state).toBe(0);
                        expect(WITHDRAWAL_OPTIONS[0].viewStateKey).toBe(void 0);
                        expect(WITHDRAWAL_OPTIONS[1].result).toBe("COINOUT");
                        expect(WITHDRAWAL_OPTIONS[1].state).toBe(2);
                        expect(WITHDRAWAL_OPTIONS[1].viewStateKey).toBe(void 0);
                        
                        expect(data.elements[1].result).toBe("COUTMIXED");
                        expect(typeof data.elements[1].captions[0] === "function").toBe(true);
                        expect(data.elements[1].state).toBe(0);
                        expect(data.elements[2].result).toBe("ACCOUNTCHG");
                        expect(typeof data.elements[2].captions[0] === "function").toBe(true);
                        expect(data.elements[2].state).toBe(0);
                        done();
                    }).catch(done.fail);
                }, done.fail);
            });
            
            it("check menu item captions are functions", done => {
                injector.require(["GUIAPP/content/viewmodels/base/ProFlex4Op"], module => {
                    Wincor.UI.Service.Provider.DataService.businessData = this.businessDataSubMenuTest_1;
                    Wincor.UI.Service.Provider.ViewService.viewContext.viewConfig = this.viewConfigSubMenuTest_1;
                    module.setViewModelContainer({
                        "viewModelHelper": {
                            "getPropertyValue": name => {
                                return name;
                            }
                        }
                    });
                    module.getGenericListData("MenuSelection").then(data => {
                        // general checks
                        expect(typeof data === "object").toBe(true);
                        expect(Array.isArray(data.elements)).toBe(true);
                        expect(typeof data.priorities === "object").toBe(true);
                        // menu structure check
                        expect(data.elements.length).toBe(7);
                        expect(typeof data.elements[0].captions[0] === "function").toBe(true);
                        expect(typeof data.elements[1].captions[0] === "function").toBe(true);
                        expect(typeof data.elements[2].captions[0] === "function").toBe(true);
                        expect(typeof data.elements[3].captions[0] === "function").toBe(true);
                        expect(typeof data.elements[4].captions[0] === "function").toBe(true);
                        expect(typeof data.elements[5].captions[0] === "function").toBe(true);
                        expect(typeof data.elements[6].captions[0] === "function").toBe(true);
                        done();
                    }).catch(done.fail);
                }, done.fail);
            });
        });
        
        describe("MenuSelection + submenu checks", () => {
            it("getGenericListData elements check 1", done => {
                injector.require(["GUIAPP/content/viewmodels/base/ProFlex4Op"], module => {
                    // const flex4Op = new Wincor.UI.Content.ProFlex4Op(_module);
                    // var buildElementTree = spyOn(this, "buildElementTree").and.callThrough();
                    // buildElementTree.call();
                    // let elements = flex4Op.build
                    Wincor.UI.Service.Provider.DataService.businessData = this.businessDataSubMenuTest_1;
                    Wincor.UI.Service.Provider.ViewService.viewContext.viewConfig = this.viewConfigSubMenuTest_1;
                    module.setViewModelContainer({
                        "viewModelHelper": {
                            "getPropertyValue": name => {
                                return name;
                            }
                        }
                    });
                    module.getGenericListData("MenuSelection").then(data => {
                        // general checks
                        expect(typeof data === "object").toBe(true);
                        expect(Array.isArray(data.elements)).toBe(true);
                        expect(typeof data.priorities === "object").toBe(true);
                        // menu structure check
                        expect(data.elements.length).toBe(7);
                        expect(data.elements[0].result).toBe("BAL");
                        expect(data.elements[0].state).toBe(0);
                        expect(data.elements[1].result).toBe("COININ");
                        expect(data.elements[1].state).toBe(0);
                        expect(data.elements[2].result).toBe("COUT");
                        expect(data.elements[2].state).toBe(0);
                        expect(data.elements[3].result).toBe("COUTFAST");
                        expect(data.elements[3].state).toBe(0);
                        expect(data.elements[4].result).toBe("COUTMIXED");
                        expect(data.elements[4].state).toBe(0);
                        expect(data.elements[5].result).toBe("COINOUT");
                        expect(data.elements[5].state).toBe(0);
                        expect(data.elements[6].result).toBe("ACCOUNTCHG");
                        expect(data.elements[6].state).toBe(0);
                        done();
                    }).catch(done.fail);
                }, done.fail);
            });

            it("checks isSubmenus", done => {
                injector.require(["GUIAPP/content/viewmodels/base/ProFlex4Op"], module => {
                    expect(module.isSubmenus(this.viewConfigSubMenuTest_2.priorities)).toBe(true);
                    expect(module.isSubmenus(this.viewConfigSubMenuTest_1.priorities)).toBe(false);
                    done();
                }, done.fail);
            });

            it("submenus (no dissolving): optimizeElementTree->Level 0 - 2", done => {
                injector.require(["GUIAPP/content/viewmodels/base/ProFlex4Op"], module => {
                    Wincor.UI.Service.Provider.DataService.businessData = this.businessDataSubMenuTest_0;
                    Wincor.UI.Service.Provider.ViewService.viewContext.viewConfig = this.viewConfigSubMenuTest_2;

                    module.getGenericListData("MenuSelection").then(data => {
                        // general checks
                        expect(typeof data === "object").toBe(true);
                        expect(Array.isArray(data.elements)).toBe(true);
                        expect(typeof data.priorities === "object").toBe(true);
                        // menu structure check
                        // Level 0
                        expect(data.elements.length).toBe(6);
                        expect(data.elements[0].result).toBe("DEPOSIT_OPTIONS");
                        expect(data.elements[0].state).toBe(0);
                        expect(data.elements[1].result).toBe("COUT");
                        expect(data.elements[1].state).toBe(0);
                        expect(data.elements[2].result).toBe("COUTFAST");
                        expect(data.elements[2].state).toBe(0);
                        expect(data.elements[3].result).toBe("COUTMIXED");
                        expect(data.elements[3].state).toBe(0);
                        expect(data.elements[4].result).toBe("COINOUT");
                        expect(data.elements[4].state).toBe(0);
                        expect(data.elements[5].result).toBe("ACCOUNTCHG");
                        expect(data.elements[5].state).toBe(0);

                        // Level 1
                        module.setViewModelContainer({
                            "viewModelHelper": {
                                "getPropertyValue": (elements, subMenuFuncName) => {
                                    return elements[0][subMenuFuncName];
                                }
                            }
                        });

                        module.getGenericListData("MenuSelection", "DEPOSIT_OPTIONS")
                            .then(data => {
                                // general checks
                                expect(typeof data === "object").toBe(true);
                                expect(Array.isArray(data.elements)).toBe(true);
                                expect(typeof data.priorities === "object").toBe(true);
                                // menu structure check
                                // Level 1
                                expect(data.elements.length).toBe(2);
                                expect(data.elements[0].result).toBe("COININ");
                                expect(data.elements[0].state).toBe(0);
                                expect(data.elements[1].result).toBe("ACCOUNT_OVERVIEWS");
                                expect(data.elements[1].state).toBe(0);
                                // Level 2
                                module.setViewModelContainer({
                                    "viewModelHelper": {
                                        "getPropertyValue": (elements, subMenuFuncName) => {
                                            return elements[0]["DEPOSIT_OPTIONS"][1];
                                        }
                                    }
                                });
                                return module.getGenericListData("MenuSelection", "ACCOUNT_OVERVIEWS");
                            })
                            .then(data => {
                                // general checks
                                expect(typeof data === "object").toBe(true);
                                expect(typeof data.elements === "object").toBe(true);
                                expect(typeof data.priorities === "object").toBe(true);
                                // menu structure check
                                // Level 2
                                expect(data.elements["ACCOUNT_OVERVIEWS"].length).toBe(2);
                                expect(data.elements["ACCOUNT_OVERVIEWS"][0].result).toBe("AIN");
                                expect(data.elements["ACCOUNT_OVERVIEWS"][0].state).toBe(0);
                                expect(data.elements["ACCOUNT_OVERVIEWS"][1].result).toBe("BAL");
                                expect(data.elements["ACCOUNT_OVERVIEWS"][1].state).toBe(0);
                                done();
                            })
                            .catch(done.fail);
                    }, done.fail);
                });
            });

            it("submenus (dissolved ACCOUNT_OVERVIEWS): optimizeElementTree->Level 0 - 2", done => {
                injector.require(["GUIAPP/content/viewmodels/base/ProFlex4Op"], module => {
                    Wincor.UI.Service.Provider.DataService.businessData = this.businessDataSubMenuTest_2;
                    Wincor.UI.Service.Provider.ViewService.viewContext.viewConfig = this.viewConfigSubMenuTest_2;

                    module.getGenericListData("MenuSelection").then(data => {
                        // general checks
                        expect(typeof data === "object").toBe(true);
                        expect(Array.isArray(data.elements)).toBe(true);
                        expect(typeof data.priorities === "object").toBe(true);
                        // menu structure check
                        // Level 0
                        expect(data.elements.length).toBe(6);
                        expect(data.elements[0].result).toBe("DEPOSIT_OPTIONS");
                        expect(data.elements[0].state).toBe(0);
                        expect(data.elements[1].result).toBe("COUT");
                        expect(data.elements[1].state).toBe(0);
                        expect(data.elements[2].result).toBe("COUTFAST");
                        expect(data.elements[2].state).toBe(0);
                        expect(data.elements[3].result).toBe("COUTMIXED");
                        expect(data.elements[3].state).toBe(0);
                        expect(data.elements[4].result).toBe("COINOUT");
                        expect(data.elements[4].state).toBe(0);
                        expect(data.elements[5].result).toBe("ACCOUNTCHG");
                        expect(data.elements[5].state).toBe(0);

                        // Level 1
                        module.setViewModelContainer({
                            "viewModelHelper": {
                                "getPropertyValue": (elements, subMenuFuncName) => {
                                    return elements[0][subMenuFuncName];
                                }
                            }
                        });

                        module.getGenericListData("MenuSelection", "DEPOSIT_OPTIONS").then(data => {
                            // general checks
                            expect(typeof data === "object").toBe(true);
                            expect(Array.isArray(data.elements)).toBe(true);
                            expect(typeof data.priorities === "object").toBe(true);
                            // menu structure check
                            // Level 1
                            expect(data.elements.length).toBe(2);
                            expect(data.elements[0].result).toBe("COININ");
                            expect(data.elements[0].state).toBe(0);
                            expect(data.elements[1].result).toBe("BAL");
                            expect(data.elements[1].state).toBe(0);
                            done();
                        }).catch(done.fail);
                    }).catch(done.fail);
                }, done.fail);
            });

            it("submenus (dissolved ACCOUNT_OVERVIEWS & DEPOSIT_OPTIONS): optimizeElementTree->Level 0 - 2", done => {
                injector.require(["GUIAPP/content/viewmodels/base/ProFlex4Op"], module => {
                    Wincor.UI.Service.Provider.DataService.businessData = this.businessDataSubMenuTest_3;
                    Wincor.UI.Service.Provider.ViewService.viewContext.viewConfig = this.viewConfigSubMenuTest_2;

                    module.getGenericListData("MenuSelection").then(data => {
                        // general checks
                        expect(typeof data === "object").toBe(true);
                        expect(Array.isArray(data.elements)).toBe(true);
                        expect(typeof data.priorities === "object").toBe(true);
                        // menu structure check
                        // Level 0
                        expect(data.elements.length).toBe(6);
                        expect(data.elements[0].result).toBe("COININ");
                        expect(data.elements[0].state).toBe(0);
                        expect(data.elements[1].result).toBe("COUT");
                        expect(data.elements[1].state).toBe(0);
                        expect(data.elements[2].result).toBe("COUTFAST");
                        expect(data.elements[2].state).toBe(0);
                        expect(data.elements[3].result).toBe("COUTMIXED");
                        expect(data.elements[3].state).toBe(0);
                        expect(data.elements[4].result).toBe("COINOUT");
                        expect(data.elements[4].state).toBe(0);
                        expect(data.elements[5].result).toBe("ACCOUNTCHG");
                        expect(data.elements[5].state).toBe(0);

                        done();
                    }).catch(done.fail);
                }, done.fail);
            });

            it("submenus (dissolved DEPOSIT_OPTIONS & ACCOUNT_OVERVIEWS): optimizeElementTree->Level 0 - 3", done => {
                injector.require(["GUIAPP/content/viewmodels/base/ProFlex4Op"], module => {
                    Wincor.UI.Service.Provider.DataService.businessData = this.businessDataSubMenuTest_4;
                    Wincor.UI.Service.Provider.ViewService.viewContext.viewConfig = this.viewConfigSubMenuTest_3;

                    module.getGenericListData("MenuSelection").then(data => {
                        // general checks
                        expect(typeof data === "object").toBe(true);
                        expect(Array.isArray(data.elements)).toBe(true);
                        expect(typeof data.priorities === "object").toBe(true);
                        // menu structure check
                        // Level 0
                        expect(data.elements.length).toBe(4);
                        expect(data.elements[0].result).toBe("WITHDRAW_OPTIONS");
                        expect(data.elements[0].state).toBe(0);
                        expect(data.elements[1].result).toBe("COUTFAST");
                        expect(data.elements[1].state).toBe(0);
                        expect(data.elements[2].result).toBe("COUTMIXED");
                        expect(data.elements[2].state).toBe(0);
                        expect(data.elements[3].result).toBe("ACCOUNTCHG");
                        expect(data.elements[3].state).toBe(0);

                        // Level 1
                        module.setViewModelContainer({
                            "viewModelHelper": {
                                "getPropertyValue": (elements, subMenuFuncName) => {
                                    return elements[0][subMenuFuncName];
                                }
                            }
                        });

                        module.getGenericListData("MenuSelection", "WITHDRAW_OPTIONS").then(data => {
                            // general checks
                            expect(typeof data === "object").toBe(true);
                            expect(Array.isArray(data.elements)).toBe(true);
                            expect(typeof data.priorities === "object").toBe(true);
                            // menu structure check
                            // Level 1
                            expect(data.elements.length).toBe(2);
                            expect(data.elements[0].result).toBe("COUT");
                            expect(data.elements[0].state).toBe(0);
                            expect(data.elements[1].result).toBe("COINOUT");
                            expect(data.elements[1].state).toBe(0);
                            done();
                        }).catch(done.fail);
                    }).catch(done.fail);
                }, done.fail);
            });

            it("submenus (dissolved DEPOSIT_OPTIONS, ACCOUNT_OVERVIEWS & WITHDRAW_OPTIONS): optimizeElementTree->Level 0 - 3", done => {
                injector.require(["GUIAPP/content/viewmodels/base/ProFlex4Op"], module => {
                    Wincor.UI.Service.Provider.DataService.businessData = this.businessDataSubMenuTest_5;
                    Wincor.UI.Service.Provider.ViewService.viewContext.viewConfig = this.viewConfigSubMenuTest_3;

                    module.getGenericListData("MenuSelection").then(data => {
                        // general checks
                        expect(typeof data === "object").toBe(true);
                        expect(Array.isArray(data.elements)).toBe(true);
                        expect(typeof data.priorities === "object").toBe(true);
                        // menu structure check
                        // Level 0
                        expect(data.elements.length).toBe(4);
                        expect(data.elements[0].result).toBe("COUT");
                        expect(data.elements[0].state).toBe(0);
                        expect(data.elements[1].result).toBe("COUTFAST");
                        expect(data.elements[1].state).toBe(0);
                        expect(data.elements[2].result).toBe("COUTMIXED");
                        expect(data.elements[2].state).toBe(0);
                        expect(data.elements[3].result).toBe("ACCOUNTCHG");
                        expect(data.elements[3].state).toBe(0);

                        done();
                    }).catch(done.fail);
                }, done.fail);
            });
        });

    });

});

