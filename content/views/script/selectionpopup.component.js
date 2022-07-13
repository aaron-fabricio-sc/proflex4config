/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.

$MOD$ selectionpopup.component.js 4.3.1-201021-21-23fb68fb-1a04bc7d
 */

/**
 * The selectionpopup.component code-behind provides the life-cycle for the <i>selectionpopup.component</i> view.
 * @module components/selectionpopup
 * @since 2.0/00
 */
define(['code-behind/baseaggregate', 'code-behind/submenu-helper', 'flexuimapping', 'extensions', 'vm/PopupSelectionViewModel'], function(base, smHelper, uiMapping, ext) {
    console.log("AMD:selectionpopup.component");

    const _logger = Wincor.UI.Service.Provider.LogProvider;
    
    const SOFT_KEY = base.config.viewType === "softkey";
    const ID_MAIN = "flexMainPopup";
    const CMD_BACK = "BACK_SELECTION_POPUP";
    
    let _mainVM; // is set in activate function and usually becomes a ListViewModel instance
    
    
    return /** @alias module:components/selectionpopup */ base.extend({
        name: "selectionpopup.component",

        /**
         * Opens a sub menu with the given id.
         * @param {String=} id the id of a sub menu or undefined if the main menu should be represented.
         */
        openSubMenu: function(id) {
            if(_mainVM.options.type === "") {
                smHelper.openSubMenu(_mainVM, this, id, ID_MAIN, CMD_BACK)
                        .then(() => {
                        })
                        .catch(e => _logger.error(e));
            }
        },

        /**
         * Step back to a possible previous sub menu or close all.
         * @param {boolean=} closeAll true, to close all sub menus,
         *                            undefined if the previous sub menu or the main menu (if all sub menus were closed) should presented
         */
        previousSubMenu: function(closeAll) {
            if(_mainVM.options.type === "") {
                smHelper.previousSubMenu(_mainVM, this, closeAll, ID_MAIN, CMD_BACK);
            }
        },
    
        /**
         * Adds a scroll down animation.
         * @param {number} idx the current item index
         * @return {Promise} resolved when the animation is ready done
         */
        down: function(idx) {
            return ext.Promises.promise(async resolve => {
                let $items = base.jQuery("#popupSelectionItemContainer .button");
                let $item = base.jQuery($items[idx]);
                let $itemAfter = base.jQuery($items[(idx + 1) < $items.length ? idx + 1 : idx]);
                if($item.length && $itemAfter.length) {
                    await ext.Promises.Promise.all([base.viewHelper.animate($item, "waveUpEnd", "0.3s", "ease-out"),
                        base.viewHelper.animate($itemAfter, "waveUpStart", "0.3s", "ease-out")]);
                    base.viewHelper.resetAfterAnimate($item);
                    base.viewHelper.resetAfterAnimate($itemAfter);
                }
                resolve();
            });
        },
    
        /**
         * Adds a scroll up animation.
         * @param {number} idx the current item index
         * @return {Promise} resolved when the animation is ready done
         */
        up: function(idx) {
            return ext.Promises.promise(async resolve => {
                let $items = base.jQuery("#popupSelectionItemContainer .button");
                let $item = base.jQuery($items[idx]);
                let $itemBefore = base.jQuery($items[idx > 0 ? idx - 1 : idx]);
                if($item.length && $itemBefore.length) {
                    await ext.Promises.Promise.all([base.viewHelper.animate($itemBefore, "waveDownStart", "0.3s", "ease-out"),
                        base.viewHelper.animate($item, "waveDownEnd", "0.3s", "ease-out")]);
                    base.viewHelper.resetAfterAnimate($item);
                    base.viewHelper.resetAfterAnimate($itemBefore);
                }
                resolve();
            });
        },
    
        /**
         * Instantiates the {@link Wincor.UI.Content.PopupMessageViewModel} and stores its reference for later usage inside this module.
         * @see {@link module:baseaggregate.activate}.
         * @lifecycle view
         * @return {Promise} resolved when activation is ready.
         */
        activate: function() {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE selectionpopup.component:activate");
            _mainVM = new Wincor.UI.Content.PopupSelectionViewModel(this);
            base.container.add(_mainVM, [ID_MAIN, SOFT_KEY ? {visibleLimits: {max: 4, leftOnly: true}} : void 0]);
            return base.activate();
        },

        /**
         * Overridden to set all references to null and clean up the {@link module:submenu-helper} module.
         * @see {@link module:baseaggregate.deactivate}.
         * @lifecycle view
         */
        deactivate: function() {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE selectionpopup.component:deactivate");
            base.deactivate();
            // clean up
            if(_mainVM && _mainVM.options.type === "") {
                smHelper.clean();
            }
            _mainVM = null;
        },

        /**
         * Called when the selection view has been attached to the DOM.
         * Adds a pseudo bread crumb (usually the HEADLINE label 'Main menu') to the very first bread crumb.
         * @see {@link module:baseaggregate.attached}.
         * @lifecycle view
         */
        attached: function(view, parent) {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE selectionpopup:attached");
            if(uiMapping.isSubmenus() && _mainVM.options.type === "") {
                _mainVM.breadCrumbs[0] = "MAIN_MENU"; // set a pseudo crumb (usually the HEADLINE label 'Main menu') because we doesn't support a HEADLINE bread crumb navigation in this popup so far
            }
            base.attached(view, parent);
        }
    });
});
