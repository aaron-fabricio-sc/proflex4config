/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ MenuPreferencesViewModel.js 4.3.1-210127-21-34ae33df-1a04bc7d
*/

define(['knockout', 'extensions', 'vm-util/UIMovements', 'vm/ListViewModel'], function(ko, ext, objectManager) {
    "use strict";
    console.log("AMD:MenuPreferencesViewModel");

    const _logger = Wincor.UI.Service.Provider.LogProvider;

    const KEY_SESSION_STORAGE_PRIORITIES = "menuPriorities";

    /**
     * Property key for access to the current menu preference of the customer.
     * @const
     * @type {string}
     */
    const PROP_MENU_PREFERENCE = "PROP_MENU_PREFERENCE";

    /**
     * This class is used for configuring the customers menu preferences.
     * @class
     */
    Wincor.UI.Content.MenuPreferencesViewModel = class MenuPreferencesViewModel extends Wincor.UI.Content.ListViewModel {

        /**
         * Checks if command CONFIRM is available, if so it delegates execution to {@link Wincor.UI.Content.MenuPreferencesViewModel#onButtonPressed}
         * @param observableAreaId {String} The HTML element id to bind this viewmodel against.
         * @param viewName {String} The current views name for passing to ListViewModel instance
         */
        observe(observableAreaId, viewName) {
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `> MenuPreferencesViewModel::observe(${observableAreaId})`);
            super.observe(observableAreaId, viewName);
            this.cmdRepos.whenAvailable([this.STANDARD_BUTTONS.CONFIRM]).then(() => this.cmdRepos.addDelegate({id: this.STANDARD_BUTTONS.CONFIRM, delegate: this.onButtonPressed, context: this}));
            _logger.log(_logger.LOG_INOUT, "< MenuPreferencesViewModel::observe");
        }

        /**
         * If CONFIRM is pressed, the current order of items is written to the <a href="./BusinessPropertyKeyMap.json">PROP_MENU_PREFERENCE</a> property of the business logic.
         * @param id {String} ID of the command that triggered this action
         * @return {boolean} As a delegate returning true to avoid standard action
         */
        onButtonPressed(id) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `> MenuPreferencesViewModel::onButtonPressed(${id})`);
            let priorities;
            if(!this.designMode) {
                if(id === this.STANDARD_BUTTONS.CONFIRM) {
                    priorities = JSON.stringify(objectManager.getElementOrder("flexArticle"));
                    _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, `. MenuPreferencesViewModel::onButtonPressed priorities=${priorities}`);
                    if(!this.designMode) {
                        this.serviceProvider.DataService.setValues(PROP_MENU_PREFERENCE, priorities, () => super.onButtonPressed(id));
                    }
                    else { // design mode
                        window.sessionStorage.setItem(KEY_SESSION_STORAGE_PRIORITIES, priorities);
                        super.onButtonPressed(id);
                    }
                }
                else {
                    super.onButtonPressed(id);
                }
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< MenuPreferencesViewModel::onButtonPressed");
            return true;
        }
    }
});

