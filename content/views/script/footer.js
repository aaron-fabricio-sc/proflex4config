/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ footer.js 4.3.1-201021-21-23fb68fb-1a04bc7d
 */
/**
 * The footer code-behind provides the life-cycle for the <i>footer</i> view.
 * <p>
 * Please note that the footer layout part is a static part which means that it's not gonna removed, but updated when a new view come in.
 * </p>
 * @module footer
 * @since 1.0/00
 */
define(['code-behind/baseaggregate', 'vm/FooterViewModel'], function(base) {
    console.log("AMD:footer");

    const _logger = Wincor.UI.Service.Provider.LogProvider;

    return /** @alias module:footer */ base.extend({
        name: "footer",

        /**
         * Instantiates the {@link Wincor.UI.Content.FooterViewModel} viewmodel.
         * This function is only triggered once, at the very first composition of <i>shell.html</i>.
         * @see {@link module:baseaggregate.activate}.
         * @lifecycle view
         * @return {Promise} resolved when activation is ready.
         */
        activate: function() {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE footer:activate");
            var footerVM = new Wincor.UI.Content.FooterViewModel();
            footerVM.lifeCycleMode = base.container.LIFE_CYCLE_MODE.STATIC;
            base.container.add(footerVM, "flexFooter");
            return base.activate();
        },

        /**
         * Overridden to set the <i>footer</i> view fragment.
         * This function is only triggered once, at the very first composition of <i>shell.html</i>.
         * @param {HTMLElement} view the <i>header</i> view fragment
         * @returns {boolean | Promise}
         * @lifecycle view
         * @return {Promise} resolved when binding is ready.
         */
        binding: function(view) {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE footer:binding viewId=" + view.id + ", moduleId=" + base.system.getModuleId(this));
            base.system.setFooter(view);
            base.system.updateCurrentFooter();
            return base.binding(view);
        }
    });
});
