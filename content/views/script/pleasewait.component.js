/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ pleasewait.component.js 4.3.1-201021-21-23fb68fb-1a04bc7d
 */

/**
 * The pleasewait.component code-behind provides the life-cycle for the <i>pleasewait.component</i> view.
 * @module components/pleasewait
 */
define(['code-behind/baseaggregate', 'vm/MessageViewModel'], function(base) {
    console.log("AMD:pleasewait.component");

    const _logger = Wincor.UI.Service.Provider.LogProvider;

    let _vm = null;

    return /** @alias module:components/pleasewait */ base.extend({
        name: "pleasewait.component",

        /**
         * Instantiates the {@link Wincor.UI.Content.MessageViewModel} viewmodel.
         * @see {@link module:baseaggregate.activate}.
         * @lifecycle view
         * @return {Promise} resolved when activation is ready.
         */
        activate: function() {
            _vm = new Wincor.UI.Content.MessageViewModel();
            let originalFunction = _vm.onAfterApplyBindings;
            let popupInfo = _vm.getPopupOptions();
            if (popupInfo.hasOwnProperty("isDefaultMessageHandling")) {
                _vm.isDefaultMessageHandling = popupInfo.isDefaultMessageHandling;
            }
            _vm.onAfterApplyBindings = () => {
                try {
                    if (popupInfo.callback) {
                        popupInfo.callback(_vm);
                    }
                } catch (e) {
                    _logger.error("pleasewait.component error triggering callback...\n" + e.message);
                } finally {
                    originalFunction();
                }
            };
            base.container.add(_vm, ["popupMainContent"]);

            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE pleasewait.component:activate");
            return base.activate();
        },

        /**
         * Overridden in order to delete the internal variable for the view model reference, which was set in 'activate'.
         * @see {@link module:baseaggregate.deactivate}.
         * @lifecycle view
         */
        deactivate: function() {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE pleasewait.component:deactivate");
            if(_vm) {
                _vm.onAfterApplyBindings = null; // cut ref!?
                _vm = null;
            }
            return base.deactivate();
        }
    });
});
