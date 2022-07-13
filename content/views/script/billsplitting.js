/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ billsplitting.js 4.3.1-201021-21-23fb68fb-1a04bc7d
 */

/**
 * The billsplitting code-behind provides the life-cycle for the <i>billsplitting</i> view.
 * @module billsplitting
 * @since 1.0/10
 */
define(['code-behind/baseaggregate', 'code-behind/ViewHelper', 'vm-util/UIMovements', 'lib/jquery.throttle-debounce', 'vm/BillSplittingViewModel'], function(base, viewHelper, objectManager) {
    console.log("AMD:billsplitting");

    const _logger = Wincor.UI.Service.Provider.LogProvider;

    const TOUCH = viewHelper.viewType === "touch";
    const STACK_LIMIT = 20;
    const ANIMATE_EVENTS = "animationend";

    let _gestureBindingElement = null;

    return /** @alias module:billsplitting */ base.extend({
        name: "billsplitting",

        /**
         * Applies an add note effect, when a note is pushed to stack.
         * @param {Object} note the DOM element of the note
         * @param {Number=} index an possible index of the note
         */
        addNote: function(note, index) {
            const $target = base.$(note);
            $target.addClass("addNote");
            if($target.parent().children().length > STACK_LIMIT) {
                if(base.config.VIEW_ANIMATIONS_ON) {
                    $target.on(ANIMATE_EVENTS, () => {
                        $target.off(ANIMATE_EVENTS);
                        $target.remove();
                    });
                } else {
                    $target.remove();
                }
            }
        },

        /**
         * Applies an remove note effect, when a note is popped from stack.
         * @param {Object} note the DOM element of the note
         * @param {Number=} index an possible index of the note
         */
        removeNote: function(note, index) {
            if(TOUCH && index === 0 && _gestureBindingElement) {
                // in the case the user has swiped the list to the up and a new item row get's visible by pressing "+" we move to the base position so that the change is visible
                _gestureBindingElement.moveToLogicalPosition(0, 0, void 0, void 0, /*lateResolve=*/true);
            }
            const $target = base.$(note);
            if(base.config.VIEW_ANIMATIONS_ON) {
                $target.on(ANIMATE_EVENTS, () => {
                    $target.off(ANIMATE_EVENTS);
                    $target.remove();
                });
            } else {
                $target.remove();
            }
            $target.addClass("removeNote");
        },

        /**
         * Confirms the current user selection.
         * Please note: If the view has been changed in a way that below classes or id's doesn't match the aim anymore then remove jQuery containing
         * code and simply return the promise directly (as done when animations are set false) in order that the BillSplittingViewModel is able to going on.
         * @returns {Promise} A promise which getting resolved when the animation effect (only in set on) is ready, else gets resolved immediately
         */
        confirmSelection: function() {
            let promise = base.Promises.Promise.resolve();
            if(base.config.VIEW_ANIMATIONS_ON) {
                if(TOUCH) {
                    if(_gestureBindingElement) {
                        promise = _gestureBindingElement.moveToLogicalPosition(0, 0, void 0, void 0, /*lateResolve=*/true);
                    } else {
                        return promise;
                    }
                }
                return promise.then(() => {
                    return base.Promises.promise(resolve => {
                        let $rows = base.$("#flexDistributions");
                        let $target = $rows.find(".itemStack .note:not(:first-child)");
                        if($target.length) {
                            let marginLeft = (parseInt($target.first().css("margin-left")) * 64) / 100;
                            if(marginLeft < 0) {
                                $target.transition({"margin-left": marginLeft}, 750, "in", () => $rows.find(".itemStack").transition({x: "-200%"}, 1500, "out", () => resolve()));
                            } else {
                                $rows.find(".itemStack").transition({x: "-200%"}, 1500, "out", () => resolve());
                            }
                        } else {
                            $rows.find(".itemStack").transition({x: "-200%"}, 1500, "out", () => resolve());
                        }
                    });
                }).catch(cause => {
                    _logger.error(`billsplitting::confirmSelection: ${cause}`);
                    return base.Promises.Promise.resolve();
                });
            } else {
                return promise;
            }
        },
    
        /**
         * Instantiates the {@link Wincor.UI.Content.BillSplittingViewModel} and stores its reference for later usage inside this module.
         * @see {@link module:baseaggregate.activate}.
         * @lifecycle view
         * @return {Promise} resolved when activation is ready.
         */
        activate: function() {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE billsplitting:activate");
            base.container.add(new Wincor.UI.Content.BillSplittingViewModel(this), ["flexMain"]);
            return base.activate();
        },

        /**
         * Overridden to set all references to null.
         * @see {@link module:baseaggregate.deactivate}.
         * @lifecycle view
         */
        deactivate: function() {
            base.deactivate();
            // clean up
            _gestureBindingElement = null;
        },
    
        /**
         * Overridden to store the gesture element from the <i>flexDistributions</i> view part.
         * @see {@link module:baseaggregate.compositionComplete}.
         * @lifecycle view
         */
        compositionComplete: function(view, parent) {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE billsplitting:compositionComplete");
            base.compositionComplete(view, parent);
            base.container.whenActivated().then(() => {
                if(TOUCH) {
                    _gestureBindingElement = objectManager.getElementById('flexDistributions');
                }
            });
        },

        /**
         * Overridden to prevent from redrawing all buttons during notifyViewUpdate,
         * which is initiated by the BillSplittingViewModel and necessary for ADA.
         * @see {@link module:baseaggregate.compositionUpdated}.
         * @lifecycle view
         */
        compositionUpdated: function() {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE billsplitting:compositionUpdated - base call won't done.");
            if(TOUCH) {
                _gestureBindingElement = objectManager.getElementById('flexDistributions');
            }
        }
    });
});

