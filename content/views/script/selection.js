/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ selection.js 4.3.1-201021-21-23fb68fb-1a04bc7d
 */

/**
 * The selection code-behind provides the life-cycle for the <i>selection</i> view.
 * <p>
 * Used for generic list purpose.
 * This code-behind module is also required by the selectionpopup.component module.
 * So that the sub menu handling maybe part of that popup possible.
 * </p>
 * @module selection
 * @since 1.0/00
 */
define(['knockout', 'code-behind/baseaggregate', "extensions", "vm-util/UICommanding", 'flexuimapping', "code-behind/submenu-helper", 'vm/ListViewModel'],
    function(ko, base, ext, commanding, uiMapping, smHelper) {

    console.log("AMD:selection");

    const _logger = Wincor.UI.Service.Provider.LogProvider;
    const _localizeService = Wincor.UI.Service.Provider.LocalizeService;

    const SOFT_KEY = base.config.viewType === "softkey";
    const ID_MAIN = "flexMain";
    const CMD_BACK = SOFT_KEY ? "BTN_SCROLL_UP" : "BACK";
    const TXN_BACKGROUND = "#txnBackground";

    const SUB_MENU_ANIMATION_DEFAULT_NAME = "zoomOutLeft"; // FOR DNSeries "fadeInRight";
    const SUB_MENU_ANIMATION_DEFAULT_TIME = 0.5;

    let _mainVM; // is set in activate function and usually becomes a ListViewModel instance
    let _registrationLangChangeId = -1;

    /**
     * Removes a visible transaction background, which has been applied in the touch variant when a business function
     * has been triggered from the main menu or a sub menu.
     * Note: This is touch only relevant.
     */
    function removeTxnBackground() {
        if(!SOFT_KEY) {
            base.jQuery(TXN_BACKGROUND).css("display", "none");
            base.jQuery("div[data-view-id]").attr("data-txn-background", "false");
        }
    }

    /**
     * Installs the transaction background effect handler to the current menu items of the main menu
     * for the touch layout when a main menu business function item has been touched.
     * Softkey or other view keys than "MenuSelection" is skipped.
     */
    function installTxnBackgroundHandler() {
        _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "* installTxnBackgroundHandler");
        let $txnBackgrd = base.jQuery(TXN_BACKGROUND);
        if(!SOFT_KEY && base.container.currentViewKey === "MenuSelection" && $txnBackgrd.css("display") === "none") {
            commanding.addDelegate({
                id: _mainVM, // all command ids belonging to this vm instance
                delegate: function(id) {
                    // hide scrollbar if exists
                    base.jQuery(".scrollbar-horizontal").css("display", "none");
                    return ext.Promises.Promise.delay(base.config.COMMAND_AUTOMATION_DURATION + 50).then(() => {
                        return ext.Promises.promise(resolve => {
                            // first check whether its not a sub function...
                            if(!uiMapping.isSubmenus() || !_mainVM.vmHelper.isPropertyAvailable(_mainVM.priorities.submenus, id)) {
                                // hide all others while zooming selected
                                let elemId = commanding.get(id).element.id;
                                let $allOther = base.jQuery(`.button.menuButton:not("#${elemId}")`); // select all other, than selected
                                if(base.config.VIEW_ANIMATIONS_ON) {
                                    if($allOther.length) {
                                        $allOther.transition({opacity: 0}, 400); // fade out all other
                                    }
                                    // move and zoom selected function
                                    let $src = base.jQuery(`#${elemId}`);
                                    let $win = base.jQuery(window);
                                    let $target = base.jQuery("#flexHeaderBottom");
                                    let scaleX = $win.width() / $src.width();
                                    let scaleY = ($win.height() - $target.offset().top) / $src.height();
                                    let top = $src.offset().top;
                                    let toY = -(top - $target.offset().top);
                                    $src.children().transition({opacity: 0}, 250);
                                    $src.css({transformOrigin: "50% 0%"})
                                        .transition({y: `${toY}px`, x: (($win.width() / 2) - ($src.offset().left + ($src.width() / 2)))}, 250)
                                        .transition({scale: [scaleX, scaleY], opacity: 0.2}, 500, () => {
                                            $txnBackgrd.css("display", "block");
                                            $src.css({visibility: "hidden"});
                                            base.jQuery('div[data-view-id]').attr("data-txn-background", "true");
                                            resolve(false); // we did not handle this delegation by our self
                                        });
                                } else { // animations off
                                    $allOther.css({opacity: 0});
                                    $txnBackgrd.css("display", "block");
                                    resolve(false);
                                }
                            } else { // it is a sub menu trigger function
                                resolve(false);
                            }
                        });
                    })
                },
                context: SELECTION
            });
        }
    }

    /**
     *
     * @type {*}
     */
    const SELECTION = base.extend({
        name: "selection",

        /**
         * Opens a sub menu with the given id.
         * @param {String=} id the id of a sub menu or undefined if the main menu should be represented.
         */
        openSubMenu: function(id) {
            smHelper.setSubMenuHideAnimation(SUB_MENU_ANIMATION_DEFAULT_NAME, SUB_MENU_ANIMATION_DEFAULT_TIME);
            smHelper.openSubMenu(_mainVM, this, id, ID_MAIN, CMD_BACK)
                .then(() => {
                    installTxnBackgroundHandler();
                })
                .catch(e => _logger.error(e));
        },

        /**
         * Step back to a possible previous sub menu or close all.
         * @param {boolean=} closeAll true, to close all sub menus,
         *                            undefined if the previous sub menu or the main menu (if all sub menus were closed) should presented
         */
        previousSubMenu: function(closeAll) {
            smHelper.previousSubMenu(_mainVM, this, closeAll, ID_MAIN, CMD_BACK)
                .then(() => {
                    installTxnBackgroundHandler();
                })
                .catch(e => _logger.error(e));
        },

        /**
         * Instantiates the {@link Wincor.UI.Content.ListViewModel} viewmodel.
         * @see {@link module:baseaggregate.activate}.
         * @lifecycle view
         * @return {Promise} resolved when activation is ready.
         */
        activate: function() {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE selection:activate");
            _mainVM = new Wincor.UI.Content.ListViewModel(this);
            base.container.add(_mainVM, [ID_MAIN, SOFT_KEY ? {visibleLimits: {max: 8}} : void 0]);
            return base.activate();
        },

        /**
         * Overridden to set all references to null and clean up the {@link module:submenu-helper} module.
         * @see {@link module:baseaggregate.deactivate}.
         * @lifecycle view
         */
        deactivate: function() {
            base.deactivate();
            // clean up
            smHelper.clean();
            _mainVM = null;
            base.router.off("router:navigation:composition-update", null, this); // de-register from router
            if(commanding.hasCommand(CMD_BACK)) {
                commanding.setVisible(CMD_BACK, false);
            }
        },
    
        /**
         * Called when the selection view has been attached to the DOM.
         * Registers for the {@link Wincor.UI.Service.LocalizeService#SERVICE_EVENTS} LANGUAGE_CHANGED event in
         * order to update the bread crumbs on a submenu.
         * @see {@link module:baseaggregate.attached}.
         * @lifecycle view
         */
        attached: function(view, parent) {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE selection:attached");
            if(uiMapping.isSubmenus()) {
                removeTxnBackground(); // remove txn background, because we may come back from a just started transaction
                _mainVM.cmdRepos.whenAvailable("HEADLINE").then(() => smHelper.createBreadCrumbs(_mainVM, this, _mainVM.cmdRepos.get("HEADLINE").label));
                if(!base.content.designMode) {
                    _registrationLangChangeId = _localizeService.registerForServiceEvent(_localizeService.SERVICE_EVENTS.LANGUAGE_CHANGED,
                                                            // async call, because the observables needs a bit to get updated
                                                            () => setTimeout(() => smHelper.createBreadCrumbs(_mainVM, this, null, true), 100),
                                                            _localizeService.DISPOSAL_TRIGGER_UNLOAD);
                }
            }
            base.attached(view, parent);
        },

        /**
         * Overridden due to force an menu function zooming effect for the touch related main menu.
         * @see {@link module:baseaggregate.compositionComplete}.
         * @lifecycle view
         */
        compositionComplete: function(view, parent) {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE selection:compositionComplete");
            if(!SOFT_KEY) {
                base.container.whenActivated().then(() => {
                    installTxnBackgroundHandler();
                    // code your specific stuff here
                });
            } else { // softkey
                // initialize slide indicator for a slide indicator group (optional)
                setTimeout(() => base.container.viewHelper.moveSlideIndicator(0), 100);
            }

            // if view stays for next view key we may have to reinitialize the slide indicator and breadcrumbs, if sub menus are enabled
            base.router.on("router:navigation:composition-update").then(() => {
                base.container.whenActivated().then(() => {
                    if(uiMapping.isSubmenus()) {
                        removeTxnBackground(); // remove txn background, because we doesn't left the view - could be LanguageSelection followed on MenuSelection for instance
                        _mainVM.breadCrumbs = [];
                        _mainVM.breadCrumbsObservable("");
                        _mainVM.cmdRepos.whenAvailable("HEADLINE").then(() => smHelper.createBreadCrumbs(_mainVM, this, _mainVM.cmdRepos.get("HEADLINE").label));
                        if(!base.content.designMode) {
                            if(_registrationLangChangeId !== -1) { // must de register first
                                _localizeService.deregisterFromServiceEvent(_registrationLangChangeId);
                            }
                            _registrationLangChangeId = _localizeService.registerForServiceEvent(_localizeService.SERVICE_EVENTS.LANGUAGE_CHANGED,
                                                                     // async call, because the observables needs a bit to get updated
                                                                     () => setTimeout(() => smHelper.createBreadCrumbs(_mainVM, this, null, true), 100),
                                                                     _localizeService.DISPOSAL_TRIGGER_UNLOAD);
                        }
                    } else if(_mainVM.breadCrumbsObservable()) { // no sub menu handling, but view seems to be still active with another view key - so we clear the bread crumbs
                        _mainVM.breadCrumbs = [];
                        _mainVM.breadCrumbsObservable("");
                    }
                    if(SOFT_KEY) {
                        setTimeout(() => base.container.viewHelper.moveSlideIndicator(0), 50);
                    }
                });
            }, this);
            base.compositionComplete(view, parent);
        },

        /**
         * Overridden to call {@link module:ObjectManager.reCalculateObjects}.
         * @see {@link module:baseaggregate.compositionUpdated}.
         * @lifecycle view
         */
        compositionUpdated: function(redrawAllCanvases) {
            Wincor.UI.Content.ObjectManager.reCalculateObjects();
            base.compositionUpdated(redrawAllCanvases)
        }
    });

    return SELECTION;
});
