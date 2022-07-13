/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ submenu-helper.js 4.3.1-201021-21-23fb68fb-1a04bc7d
 */

/**
 * The submenu helper module helps the {@link module:selection} module to create and handle the main menu to act as a sub menu tree.
 * <p>
 * Therefore the helper provides functions to open, hide or show a sub menu or creates a bread crumb navigation.
 * After sub menu handling has been finished the {@link module:submenu-helper.clean} function must be called.
 * </p>
 * @module submenu-helper
 * @since 2.0/00
 */
define(["jquery", "knockout", "extensions", "code-behind/ViewHelper", "vm-util/UICommanding", "flexuimapping"], function($, ko, ext, viewHelper, commanding, uiMapping) {
    console.log("AMD:submenu-helper");

    const _logger = Wincor.UI.Service.Provider.LogProvider;

    const SOFT_KEY = viewHelper.viewType === "softkey";
    const BREAD_CRUMB_TEMPLATE = `<span class='breadCrumb font01' data-number='#number#'>#name#</span>`;
    const SUB_MENU_ANIMATION_NONE = "NONE";
    const SUB_MENU_ANIMATION_DEFAULT_NAME = "zoomOutLeft"; // FOR DNSeries"fadeInRight";
    const SUB_MENU_ANIMATION_DEFAULT_TIME = 0.5;

    let subMenuHideAnimation = SUB_MENU_ANIMATION_DEFAULT_NAME; // FOR DNSeries "fadeOutLeft";
    let subMenuHideAnimationTime = SUB_MENU_ANIMATION_DEFAULT_TIME;

    function prepareBreadCrumb(label, index) {
        return `${BREAD_CRUMB_TEMPLATE.replace("#name#", `${label}`).replace("#number#", index.toString())}`;
    }

    /**
     * Installs the bread crumb navigation to the just created bread crumb(s)
     * @param {*} viewModel the view model reference, usually a ListViewModel instance
     * @param {*} module the module reference which owns the sub menus view
     */
    function installBreadCrumbNavigation(viewModel, module) {
        setTimeout(() => {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "* submenu-helper::installBreadCrumbNavigation");
            $.each($("#headline").find(".breadCrumb"), (i, e) => {
                if(i < viewModel.breadCrumbs.length - 1) { // the last bread crumb doesn't get a handler
                    let $e = $(e);
                    $e.off("click"); // prevent from installing more than one
                    $e.on("click", () => {
                        let id = i > 0 ? viewModel.breadCrumbs[i] : void 0;
                        module.openSubMenu(id);
                    });
                }
            });
        }, 150); // give renderer time before install click handler
    }

    return /** @alias module:submenu-helper */ {

        /**
         * Setup the animation data for name and time, when hiding a sub menu.
         * @param {String} animationName the name of the animation or 'NONE', if no animation is desired
         * @param {number | string} time the time in seconds, for e.g. 500ms set 0.5
         */
        setSubMenuHideAnimation: function(animationName, time) {
            subMenuHideAnimation = animationName;
            subMenuHideAnimationTime = time;
        },

        /**
         * Creates the bread crumbs for the binding where the breadCrumbsObservable is used.
         * @param {*} viewModel the view model reference, usually a ListViewModel instance
         * @param {*} module the module reference which owns the sub menus view
         * @param {function=} label the headline label observable
         * @param {boolean=} langChanged
         */
        createBreadCrumbs: function(viewModel, module, label, langChanged) {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `* submenu-helper::createBreadCrumbs label=${ko.isObservable(label) ? label() : label} langChanged=${langChanged}`);
            // Main Menu is the first item (0):
            if(langChanged) {
                viewModel.breadCrumbsObservable(""); // clear the headline, if cleared the corresponding text key "GUI_*_Headline_MAIN" delivers the language specific default text
                viewModel.breadCrumbs[0] = viewModel.cmdRepos.get("HEADLINE").label();
            }
            viewModel.breadCrumbs[0] = label && ko.isObservable(label) ? label() : viewModel.breadCrumbs[0];
            viewModel.currentBreadCrumbTextObservable(""); // set empty here and let default (fallback) text to be spoken via ADA
            let newBC = prepareBreadCrumb(viewModel.breadCrumbs[0], 1);
            // sub menus starting from 1:
            for(let i = 1; i < viewModel.breadCrumbs.length; i++) {
                let item = uiMapping.getItem(null, viewModel.breadCrumbs[i]);
                if(item) {
                    newBC += prepareBreadCrumb(item.captions[0](), i + 1);
                    viewModel.currentBreadCrumbTextObservable(item.adaText || item.captions[0]());
                }
            }
            viewModel.breadCrumbsObservable(newBC);
            installBreadCrumbNavigation(viewModel, module);
        },

        /**
         * Shows a sub menu with a smooth fade in effect.
         * @param {string} id the sub menu id, if undefined the original element with the ID_ARTICLE is shown again
         * @param {string} subMenuContainerId the container id for the area where the sub menus resides
         * @param {string} cmdBackId the id of the command to navigate backward
         */
        showSubMenu: function(id, subMenuContainerId, cmdBackId) {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `* submenu-helper::showSubMenu id=${id}`);
            let $container = $("#" + subMenuContainerId);
            viewHelper.resetAfterAnimate($container); // reset the animation state
            if(commanding.hasCommand(cmdBackId)) {
                if(id) {
                    commanding.setActive(cmdBackId, true);
                }
            }
            if(SOFT_KEY) {
                // initialize slide indicator for a slide indicator group (optional)
                viewHelper.moveSlideIndicator(0);
            }
        },

        /**
         * Hides a sub menu with a smooth fade out effect.
         * @param {string} id the sub menu id, if undefined the original element with the ID_ARTICLE is shown again
         * @param {string} subMenuContainerId the container id for the area where the sub menus resides
         * @param {string} cmdBackId the id of the command to navigate backward
         * @returns {*} a promise when animations are ready
         */
        hideSubMenu: function(id, subMenuContainerId, cmdBackId) {
            return ext.Promises.promise(resolve => {
                _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `* submenu-helper::hideSubMenu id=${id}`);
                let $container = $(`#${subMenuContainerId}`);
                if(commanding.hasCommand(cmdBackId)) {
                    commanding.setActive(cmdBackId, false);
                }
                if(SOFT_KEY) {
                    viewHelper.moveSlideIndicator(-1); // remove the slide indicator (optional)
                }
                if(subMenuHideAnimation && subMenuHideAnimation !== SUB_MENU_ANIMATION_NONE) {
                    viewHelper.animate($container, "fadeOutLeft", subMenuHideAnimationTime + "s", "ease-out").then(() => {
                        resolve();
                        if(!id && !SOFT_KEY && commanding.hasCommand(cmdBackId)) {
                            commanding.setVisible(cmdBackId, false);
                        }
                    });
                } else { // no animation desired
                    resolve();
                    if(!id && !SOFT_KEY && commanding.hasCommand(cmdBackId)) {
                        commanding.setVisible(cmdBackId, false);
                    }
                }
            });
        },


        /**
         * Opens a sub menu with the given id.
         * @param {*} viewModel the view model reference, usually a ListViewModel instance
         * @param {*} module the module reference which owns the sub menus view
         * @param {String=} id the id of a sub menu or undefined if the main menu should be represented.
         * @param {string} subMenuContainerId the container id for the area where the sub menus resides
         * @param {string} cmdBackId the id of the command to navigate backward
         * @return {Promise} promise resolved when sub menu has been opened
         */
        openSubMenu: function(viewModel, module, id, subMenuContainerId, cmdBackId) {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `* submenu-helper::openSubMenu id=${id}, subMenuContainerId=${subMenuContainerId}, cmdBackId=${cmdBackId}`);
            return ext.Promises.promise((resolve, reject) => {
                try {
                    let len = viewModel.breadCrumbs.length;
                    // manage the list of the current sub menu chain, necessary when we want to step back to a previous sub menu
                    if(id && !viewModel.breadCrumbs.includes(id)) {
                        viewModel.breadCrumbs.push(id);
                    } else {
                        if(id) {
                            viewModel.breadCrumbs.splice(viewModel.breadCrumbs.indexOf(id) + 1, len); // splice from desired to end
                        } else if(!id) {
                            viewModel.breadCrumbs.splice(1, len); // splice all except the first
                        }
                    }
                    // reusing the instance for sub menus, id is undefined when no sub menu is open
                    if(len !== viewModel.breadCrumbs.length) {
                        viewModel.vmContainer.suspend();
                        this.hideSubMenu(id, subMenuContainerId, cmdBackId).then(() => {
                            viewModel.onDeactivated();
                            viewModel.currentBreadCrumb = id;
                            viewModel.onInitTextAndData({dataKeys: [], textKeys: []}).then(() => {
                                try {
                                    this.createBreadCrumbs(viewModel, module);
                                    viewModel.vmContainer.resume();
                                    this.showSubMenu(id, subMenuContainerId, cmdBackId);
                                    viewModel.notifyViewUpdated(); // that triggers compositionUpdated()
                                    if(!SOFT_KEY) {
                                        Wincor.UI.Content.ObjectManager.reCalculateObjects(); // update the touch grid
                                    }
                                    resolve();
                                } catch(e) {
                                    reject(`submenu-helper::openSubMenu failed (bread crumb creation or show a sub menu): ${e}`);
                                }
                            });
                        });
                    }
                } catch(e) {
                    reject(`submenu-helper::openSubMenu failed: ${e}`);
                }
            });
        },

        /**
         * Step back to a possible previous sub menu or close all.
         * @param {*} viewModel the view model reference, usually a ListViewModel instance
         * @param {*} module the module reference which owns the sub menus view
         * @param {boolean=} closeAll true, to close all sub menus,
         *                            undefined if the previous sub menu or the main menu (if all sub menus were closed) should presented
         * @param {string} subMenuContainerId the container id for the area where the sub menus resides
         * @param {string} cmdBackId the id of the command to navigate backward
         * @return {Promise} promise resolved when previous sub menu has been opened
         */
        previousSubMenu: function(viewModel, module, closeAll, subMenuContainerId, cmdBackId) {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "* submenu-helper::previousSubMenu");
            // Note: The first element in the array is usually the main menu bread crumb.
            // In order to handle the following sub menus we finish when the last sub menu has been stepped back index=1.
            // The openSubMenu expects an undefined to know that main menu is desired at next.
            // The first element is not removed.
            let len = viewModel.breadCrumbs.length;
            if(len) {
                let bc = len - 2 > 0 ? viewModel.breadCrumbs[len - 2] : void 0;
                return this.openSubMenu(viewModel, module, !closeAll ? bc : void 0, subMenuContainerId, cmdBackId); // the previous id or undefined (no previous sub menu available)
            } else {
                return Promise.resolve();
            }
        },

        /**
         * Clean up.
         * Please invoke after the sub menu handling is finished.
         */
        clean: function() {
            subMenuHideAnimation = SUB_MENU_ANIMATION_DEFAULT_NAME;
            subMenuHideAnimationTime = SUB_MENU_ANIMATION_DEFAULT_TIME;
        }
    };

});
