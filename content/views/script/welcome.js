/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ welcome.js 4.3.1-201021-21-23fb68fb-1a04bc7d
 */

/**
 * The welcome code-behind provides the life-cycle for the <i>welcome</i> view.
 * <p>
 * The overall first view which is loaded when ProFlex4 UI is starting.
 * </p>
 * @module welcome
 * @since 1.0/00
 */
define(['code-behind/baseaggregate','vm-util/UICommanding'], function(base, commanding) {
    console.log("AMD:welcome");

    const _logger = Wincor.UI.Service.Provider.LogProvider;

    return /** @alias module:welcome */ base.extend({
        name: "welcome",

        /**
         * Instantiates the {@link Wincor.UI.Content.BaseViewModel} viewmodel.
         * @see {@link module:baseaggregate.activate}.
         * @lifecycle view
         * @return {Promise} resolved when activation is ready.
         */
        activate: function() {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE welcome:activate");
            base.container.add(new Wincor.UI.Content.BaseViewModel(), "flexMain");
            return base.activate();
        },

        /**
         * Overridden to set the <i>welcome</i> view fragment.
         * This function is triggered only once, at the very first beginning, after the composition of <i>shell.html</i>.
         * @param {HTMLElement} view the <i>header</i> view fragment
         * @returns {boolean | Promise}
         * @lifecycle view
         * @return {Promise} resolved when binding is ready.
         */
        binding: function(view) {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE welcome:binding viewId=" + view.id + ", moduleId=" + base.system.getModuleId(this));
            base.container.setViewId("welcome");
            return base.binding(view);
        },

        /**
         * Overridden to suppress headline and instruction text from header and present a welcome message in design mode.
         * @see {@link module:baseaggregate.compositionComplete}.
         * @lifecycle view
         */
        compositionComplete: function(view, parent) {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE welcome:compositionComplete");
            let isRestartSPA = window.localStorage.getItem("restartSPA") === "true";
            // when application mode is loading a new view-set, the flag 'restartSPA' will be set...
            // only in designMode or during startup  we show the welcome message...
            let mainVM = Wincor.UI.Content.ViewModelContainer.getById("flexMain");
            if(mainVM.designMode || !isRestartSPA) {
                base.jQuery("#welcomeMessage1").text("Welcome");
                base.jQuery("#welcomeMessage2").text("Welcome to ProFlex4 UI");
            }
            if(isRestartSPA) {
                base.jQuery("#flexMain").css("background", "none");
            }

            /*
            Overwrite headline and instruction, because by default we will try to get a text for
            GUI_{ViewKey}_Headline in header.html, but at this point in time we do not have a viewkey.
             */
            if (commanding.hasCommand('HEADLINE')) {
                commanding.setCmdLabel('HEADLINE', '');
            }

            if (commanding.hasCommand('INSTRUCTION')) {
                commanding.setCmdLabel('INSTRUCTION', '');
            }

            base.compositionComplete(view, parent);
        }
    });
});