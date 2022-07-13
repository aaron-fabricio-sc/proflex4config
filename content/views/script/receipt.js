/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ receipt.js 4.3.1-201021-21-23fb68fb-1a04bc7d
 */

/**
 * The receipt code-behind provides the life-cycle for the <i>receipt</i> view (touch only).
 * @module receipt
 * @since 2.0/00
 */
define(['code-behind/baseaggregate', 'vm-util/UICommanding', 'vm/MessageViewModel'], function(base, commanding) {
    console.log("AMD:receipt");

    const _logger = Wincor.UI.Service.Provider.LogProvider;
    const _movements = Wincor.UI.Content.ObjectManager;

    const CMD_SCROLL_DOWN = "BTN_SCROLL_DOWN";
    const CMD_SCROLL_UP = "BTN_SCROLL_UP";

    function showScrollButtons() {
        _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE receipt:showScrollButtons");
        let movElem = _movements.getElementById("MESSAGE");
        if(movElem && base.config.viewType === "softkey" && movElem.canMove() && commanding.hasCommand(CMD_SCROLL_DOWN) && commanding.hasCommand(CMD_SCROLL_UP)) {
            commanding.setVisible(CMD_SCROLL_UP, true);
            commanding.setActive(CMD_SCROLL_DOWN, true);
        }
    }



    return /** @alias module:receipt */ base.extend({
        name: "receipt",

        /**
         * Sets the viewstate of the SCROLL buttons
         * @returns {boolean }
         */
        onSwipe: function(ev, g, m) {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE receipt:onSwipe");
            commanding.setActive(CMD_SCROLL_DOWN, _movements.mobs[0].canMoveUp());
            commanding.setActive(CMD_SCROLL_UP, _movements.mobs[0].canMoveDown());
            return true;
        },

        /**
         * Sets again the <i>flexMessageContainerHeader</i> visible, which was set hidden in {@link module:receipt.activate}.
         * @see {@link module:baseaggregate.canDeactivate}.
         * @lifecycle view
         * @returns {boolean | Promise}
         */
        canDeactivate: function() {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE receipt:canDeactivate");
            base.jQuery("#flexMessageContainerHeader").css("visibility", "visible");  // allow receipt via header
            return base.canDeactivate();
        },

        /**
         * Instantiates the {@link Wincor.UI.Content.MessageViewModel} viewmodel.
         * @see {@link module:baseaggregate.activate}.
         * @lifecycle view
         * @return {Promise} resolved when activation is ready.
         */
        activate: function() {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE receipt:activate");
            base.jQuery("#flexMessageContainerHeader").css("visibility", "hidden");  // suppress receipt via header
            base.container.add(new Wincor.UI.Content.MessageViewModel(), ["flexMain"]);
            return base.activate();
        },

        /**
         * Overridden to show scroll buttons on a softkey based layout when the text is more then fit into the message box.
         * @see {@link module:baseaggregate.compositionComplete}.
         * @lifecycle view
         */
        compositionComplete: function(view, parent) {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE receipt:compositionComplete");
            base.compositionComplete(view, parent);
            base.container.whenActivated().then(() => {
                showScrollButtons();
            });
        },

        /**
         * Overridden to show scroll buttons on a softkey based layout when the text is more then fit into the message box.
         * @see {@link module:baseaggregate.compositionUpdated}.
         * @lifecycle view
         */
        compositionUpdated: function() {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE billsplitting:compositionUpdated - base call won't done.");
            base.container.whenActivated().then(() => {
                _movements.reCalculateObjects(); // update the grid
                showScrollButtons();
            });
        }
    });
});
