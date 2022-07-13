/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ videoassistance.js 4.3.1-201021-21-23fb68fb-1a04bc7d
 */

/**
 * The videoassistance code-behind provides the life-cycle for the <i>videoassistance</i> view.
 * @module videoassistance
 * @since 2.0/10
 */
define(['code-behind/baseaggregate', 'vm/VideoAssistanceViewModel'], function(base) {
    console.log("AMD:videoassistance");

    const _logger = Wincor.UI.Service.Provider.LogProvider;

    return /** @alias module:videoassistance */ base.extend({
        name: "videoassistance",

        /**
         * Instantiates the {@link Wincor.UI.Content.VideoAssistanceViewModel} viewmodel.
         * @see {@link module:baseaggregate.activate}.
         * @lifecycle view
         * @return {Promise} resolved when activation is ready.
         */
        activate: function() {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE videoassistance:activate");
            base.container.add(new Wincor.UI.Content.VideoAssistanceViewModel(), ["flexMain"]);
            return base.activate();
        }
    });
});

