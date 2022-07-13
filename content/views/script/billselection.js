/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ billselection.js 4.3.1-201021-21-23fb68fb-1a04bc7d
 */
/**
 * The billselection code-behind provides the life-cycle for the <i>billselection</i> view.
 * Beyond this it provides some functions to an effect when notes are inc- or decremented or the distribution has been confirmed.
 * @module billselection
 * @since 2.0/10
 */
define(['jquery', 'code-behind/baseaggregate', 'code-behind/ViewHelper', 'vm-util/UIMovements', 'vm-util/Calculations', 'lib/jquery.throttle-debounce', 'vm/BillSelectionViewModel'], function($, base, viewHelper, objectManager, calculations) {
    console.log("AMD:billselection");

    const _logger = Wincor.UI.Service.Provider.LogProvider;

    const TOUCH = viewHelper.viewType === "touch";
    const GESTURE_EVT_TYPE_PRESS = "press";
    const STACK_LIMIT = TOUCH ? 10 : 12;
    const DEC_INC_PRESS_INTERVAL = 150;
    const ANIMATE_EVENTS = "animationend";

    /**
     * Default algo evaluator type when doing auto complete.
     * <ul>
     *   <li>BIG_ITEMS: Prefer biggest items</li>
     *   <li>BALANCED_ITEMS: Prefer balanced items</li>
     *   <li>BALANCED_CASSETTES: Prefer balanced cassette count (balanced cassette clearance)</li>
     *   <li>MANY_CASSETTES: Most like BALANCED_ITEMS</li
     *   <li>MANY_CASSETTES_66: Like MANY_CASSETTES, but each denomination is not greater than 66%</li>
     *   <li>SIXTY_SIX_PERCENT: No count is greater than 66%</li>
     *   <li>DEFAULT: No criteria, pure last retrieved result</li>
     * </ul>
     * @type {number}
     */
    const DEFAULT_ALGO_AUTO_COMPLETE = calculations.ALGO_EVALUATORS.BALANCED_ITEMS;

    let _gestureBindingElement = null;
    let _mainVM = null;
    let _pressIntervalId = -1;

    return /** @alias module:billselection */ base.extend({
        name: "billselection",

        /**
         * Applies an add note effect, when a note is pushed to stack.
         * @param {Object} note the DOM element of the note
         * @param {Number=} index an possible index of the note
         */
        addNote: function(note, index) {
            const $target = $(note);
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
            if(note && note.nodeType === 3) {
                return;
            }
            let $target = $(note), doRemove = true;
            if(!$target.length) {
                // The ko.foreach does not invoke "beforeRemove" to render anything which is not part of the DOM, so the view model may trigger us
                // manually when the corresponding ko.observableArray 'item.notes' is popped by 1 and we simulate a 'removeNote' without removing
                // the last note child from the DOM physically.
                doRemove = false;
                let $stack = $($("#flexDistributions").children()[index]).find(".itemStack");
                $target = $stack.children().last();
            }
            if($target.parent().children().length > 1) {
                if(base.config.VIEW_ANIMATIONS_ON) {
                    $target.on(ANIMATE_EVENTS, () => {
                        $target.off(ANIMATE_EVENTS);
                        if(doRemove) {
                            $target.remove();
                        } else {
                            $target.removeClass("removeNote addNote");
                        }
                    });
                } else {
                    if(doRemove) {
                        $target.remove();
                    } else {
                        $target.removeClass("removeNote addNote");
                    }
                }
                $target.addClass("removeNote");
            }
        },

        /**
         * Handler function for gesture recognition of "Press" (holding) of an element
         * @param {number} index the denomination index
         * @param {object} ev the gesture event
         * @returns {boolean} true, we handled the case
         * @eventhandler
         */
        onIncPress: function(index, ev) {
            if(_pressIntervalId !== -1) {
                if(_mainVM.items[index].incState() !== 2) {
                    _mainVM.items[index].incState(0);
                }
                clearInterval(_pressIntervalId);
                _pressIntervalId = -1;
            }
            if(ev.type === GESTURE_EVT_TYPE_PRESS && _mainVM.items[index].incState() !== 2) {
                if(TOUCH) { // for touch we set the pressed state for the "+" button.
                    _mainVM.items[index].incState(1);
                }
                _pressIntervalId = setInterval(() => {
                    if(_mainVM.items[index].incState() !== 2) {
                        _mainVM.onButtonPressed(`INC_${index}`, ev, this);
                    } else {
                        clearInterval(_pressIntervalId);
                        _pressIntervalId = -1;
                    }
                }, DEC_INC_PRESS_INTERVAL);
            }
            return true;
        },

        /**
         * Handler function for gesture recognition of "Press" (holding) of an element.
         * @param {number} index the denomination index
         * @param {object} ev the gesture event
         * @returns {boolean} true, we handled the case
         * @eventhandler
         */
        onDecPress: function(index, ev) {
            if(_pressIntervalId !== -1) {
                _mainVM.items[index].setDecState(0);
                clearInterval(_pressIntervalId);
                _pressIntervalId = -1;
            }
            if(ev.type === GESTURE_EVT_TYPE_PRESS) {
                if(TOUCH) { // for touch we set the pressed state for the "+" button.
                    _mainVM.items[index].setDecState(1);
                }
                _pressIntervalId = setInterval(() => {
                    if(_mainVM.items[index].count() > 0) {
                        _mainVM.onButtonPressed(`DEC_${index}`, ev, this);
                    } else {
                        clearInterval(_pressIntervalId);
                        _pressIntervalId = -1;
                        _mainVM.items[index].setDecState(2);
                    }
                }, DEC_INC_PRESS_INTERVAL);
            }
            return true;
        },

        /**
         * Confirms the current user selection.
         * Please note: If the view has been changed in a way that below classes or id's doesn't match the aim anymore then remove jQuery containing
         * code and simply return the promise directly (as done when animations are set false) in order that the BillSelectionViewModel is able to going on.
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
                        let $rows = $("#flexDistributions");
                        let $target = $rows.find(".itemStack .note:not(:first-child)");
                        // hide the non used items first
                        let len = _mainVM.items.length;
                        for(let i = 0; i < len; i++) {
                            if(_mainVM.items[i].count() === 0) {
                                $($rows.find(".itemStack")[i]).css("opacity", 0);
                            }
                        }
                        // move the visible items out
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
                    _logger.error(`billselection::confirmSelection: ${cause}`);
                    return base.Promises.Promise.resolve();
                });
            } else {
                return promise;
            }
        },
    
        /**
         * Instantiates the {@link Wincor.UI.Content.BillSelectionViewModel} and stores its reference for later usage inside this module.
         * @see {@link module:baseaggregate.activate}.
         * @lifecycle view
         * @return {Promise} resolved when activation is ready.
         */
        activate: function() {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE billselection:activate");
            _mainVM = new Wincor.UI.Content.BillSelectionViewModel(this, STACK_LIMIT, DEFAULT_ALGO_AUTO_COMPLETE);
            base.container.add(_mainVM, ["flexMain"]);
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
            _mainVM = null;
            _gestureBindingElement = null;
            _pressIntervalId = -1;
        },

        /**
         * Overridden to store the gesture element from the <i>flexDistributions</i> view part.
         * @see {@link module:baseaggregate.compositionComplete}.
         * @lifecycle view
         */
        compositionComplete: function(view, parent) {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE billselection:compositionComplete");
            base.compositionComplete(view, parent);
            base.container.whenActivated().then(() => {
                if(TOUCH) {
                    _gestureBindingElement = objectManager.getElementById('flexDistributions');
                }
            });
        },

        /**
         * See {@link module:baseaggregate.compositionUpdated}.
         *
         * Overridden to prevent from redrawing all buttons during notifyViewUpdate,
         * which is initiated by the BillSelectionViewModel and necessary for ADA.
         *
         * @lifecycle view
         */
        compositionUpdated: function() {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE billselection:compositionUpdated");
            if(TOUCH) {
                _gestureBindingElement = objectManager.getElementById('flexDistributions');
            }
        }
    });
});

