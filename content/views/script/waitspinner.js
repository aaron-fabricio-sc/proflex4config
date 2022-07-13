/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ waitspinner.js 4.3.1-201021-21-23fb68fb-1a04bc7d
 */

/**
 * The waitspinner code-behind provides the life-cycle for the <i>waitspinner.component</i> view.
 * @module waitspinner
 * @since 2.0/00
 */
define(['code-behind/baseaggregate'], function(base) {
    console.log("AMD:waitspinner");

    const _logger = Wincor.UI.Service.Provider.LogProvider;

    return /** @alias module:waitspinner */ base.extend({
        name: "waitspinner",
    
        /**
         * Does not instantiate any view model, because there is no need for any data binding.
         * @see {@link module:baseaggregate.activate}.
         * @lifecycle view
         * @return {Promise} resolved when activation is ready.
         */
        activate: function() {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE waitspinner:activate");
            return base.activate();
        },

        /**
         * Overridden to handle a use-case for design mode only.
         * @see {@link module:baseaggregate.compositionComplete}.
         * @lifecycle view
         */
        compositionComplete: function(view, parent) {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE waitspinner:compositionComplete");
            base.container.whenActivated().then(() => {
                if(base.content.designMode || base.content.designModeExtended) {
                    // add click interaction to wait spinner
                    let $waitSpinner = jQuery("#waitSpinnerModalOverlay"); // element "waitSpinnerModalOverlay" is part of the body, not the view fragment
                    if($waitSpinner.length && !$waitSpinner.attr("onclick")) {
                        $waitSpinner.attr("onclick", "Wincor.UI.Content.ViewModelContainer.getMainViewModels()[0].designTimeRunner.onHardwareTriggerAction('undefined', 'pleasewait');")
                    }
                }

                // code your specific stuff here
            });
        }
    });
});

