/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ messagepopup.component.js 4.3.1-201021-21-23fb68fb-1a04bc7d
 */

/**
 * The messagepopup.component code-behind provides the life-cycle for the <i>messagepopup.component</i> view.
 * @module components/messagepopup
 * @since 2.0/00
 */
define(['code-behind/baseaggregate', "vm/PopupMessageViewModel"], function(base) {
    console.log("AMD:messagepopup.component");

    const _logger = Wincor.UI.Service.Provider.LogProvider;

    const CMD_CONFIRM = "CONFIRM_MESSAGE_POPUP";
    const CMD_CANCEL = "CANCEL_MESSAGE_POPUP";

    let _vm;

    return /** @alias module:components/messagepopup*/ base.extend({
        name: "messagepopup.component",
    
        /**
         * Instantiates the {@link Wincor.UI.Content.PopupMessageViewModel} viewmodel.
         * @see {@link module:baseaggregate.activate}.
         * @lifecycle view
         * @return {Promise} resolved when activation is ready.
         */
        activate: function() {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE messagepopup.component:activate");
            _vm = new Wincor.UI.Content.PopupMessageViewModel(CMD_CONFIRM, CMD_CANCEL);
            base.container.add(_vm, ["popupMainContent"]);
            return base.activate();
        },

        /**
         * Overridden in order to delete the internal variable for the view model reference, which was set in 'activate'.
         * @see {@link module:baseaggregate.deactivate}.
         * @lifecycle view
         */
        deactivate: function() {
            _vm = null;
            base.deactivate();
        },

        /**
         * Overridden to run a {@link Wincor.UI.Content.ViewHelper#runTimeoutProgressBar}.
         * @see {@link module:baseaggregate.compositionComplete}.
         * @lifecycle view
         */
        compositionComplete: function(view, parent) {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE messagepopup.component:compositionComplete");
            base.container.whenActivated().then(() => {
                // only if a timeout is set and customer can either press CMD_CONFIRM or CMD_CANCEL we show a timeout progress bar
                if(_vm.timeoutValue !== -1) {
                    _vm.cmdRepos.whenAvailable([CMD_CONFIRM]).then(() => {
                        if(_vm.cmdRepos.isActive(CMD_CONFIRM) || _vm.cmdRepos.isActive(CMD_CANCEL)) {
                            base.viewHelper.runTimeoutProgressBar(_vm.timeoutValue);
                        }
                    });
                }
            });
            base.compositionComplete(view, parent);
        }
    });
});
