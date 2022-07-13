/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ amountentrypopup.component.js 4.3.1-201021-21-23fb68fb-1a04bc7d
 */
/**
 * The amountentrypopup.component code-behind provides the life-cycle for the <i>amountentrypopup.component</i> view.
 * @module components/amountentrypopup
 * @since 2.0/00
 */
define(['code-behind/baseaggregate', 'vm/PopupAmountEntryViewModel'], function(base) {
    console.log("AMD:amountentrypopup.component");

    const _logger = Wincor.UI.Service.Provider.LogProvider;
    let _vm = null;

    return /** @alias module:components/amountentrypopup */ base.extend({
        name: "amountentrypopup",

        /**
         * Instantiates the {@link Wincor.UI.Content.PopupAmountEntryViewModel} viewmodel.
         * @see {@link module:baseaggregate.activate}.
         * @lifecycle view
         * @return {Promise} resolved when activation is ready.
         */
        activate: function() {
            _vm = new Wincor.UI.Content.PopupAmountEntryViewModel();
            base.container.add(_vm, ["popupMainContent"]);
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE amountentrypopup.component:activate");
            return base.activate();
        },

        /**
         * Overridden to set all references to null.
         * @see {@link module:baseaggregate.deactivate}.
         * @lifecycle view
         */
        deactivate: function() {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE amountentrypopup.component:deactivate");
            _vm = null;
            return base.deactivate();
        },
    
        /**
         * If we are in 'softkey' layout in the Basic Design Mode, we have no input possibility,
         * because there is no EPP simulation (like in Extended Desing Mode) and there are no buttons in the view (like in 'touch' layout').
         * Therefore we register a 'click' event listener, which simulates a random number from the EPP.
         * @see {@link module:baseaggregate.compositionComplete}
         * @lifecycle view
         */
        compositionComplete: function(view, parent) {
            if(_vm.designMode && _vm.viewHelper.viewType === "softkey") {
                base.jQuery("#flexArticlePopupAmountEntry")[0].addEventListener("click", () => {
                    let number = Math.floor(Math.random() * 10); //number between 0 and 9
                    let cmd = Wincor.UI.Content.Commanding.get("AMOUNT_INPUT");
                    if(cmd) {
                        cmd.delegates._execute({eppKey: number.toString()});
                    }
                }, false);
            }
            base.compositionComplete(view, parent);
        }
    });
});
