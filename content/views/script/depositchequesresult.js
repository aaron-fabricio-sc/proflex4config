/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.

$MOD$ depositchequesresult.js 4.3.1-201021-21-23fb68fb-1a04bc7d
 */

/**
 * The depositchequesresult code-behind provides the life-cycle for the <i>depositchequesresult</i> view.
 * @module depositchequesresult
 * @since 1.0/10
 */
define(['jquery', 'knockout', 'code-behind/baseaggregate', 'vm/DepositChequesResultViewModel', 'extensions', 'vm-util/UIMovements', 'vm-util/ViewModelHelper', 'lib/jquery-okzoom-ext', 'lib/jquery.transit.min', 'lib/jquery.throttle-debounce'], function($, ko, base, vm, ext, objectManager, vmHelper) {
    console.log("AMD:depositchequesresult");

    const _logger = Wincor.UI.Service.Provider.LogProvider;
    const TOUCH = base.content.viewType === "touch";
    const CHEQUE_IMAGE = TOUCH ? ".chqImg" : "#chqArea";
    const CHEQUE_AREA = TOUCH ? ".chqControl" : "#chqInfoArea";
    const CMD_MAGNIFY_GLASS = "MAGNIFY_GLASS";
    const SUPPORTED_PAN_GESTURES = {PANSTART: "panstart", PANMOVE: "panmove", PANEND: "panend"};
    const CHEQUE_CONTAINER = ".chequeImageContainer";
    const ANIMATE_EVENTS = "animationend";

    let _depositChequeResultVM;
    let _windowWidth;
    let _singleCheckMoving = false;
    let _isMagnifyGlassOn = false;
    let _$view;
    let _$clone;
    let _suspendedCmds;
    let _currentChequeDegrees = 0;
    let _gestureIconsProcessing = -1;


    /**
     * State 0 = zoomed out, 1 = zoomed in.
     * @type {number}
     * @private
     */
    let _zoomState = 0;

    function showGestureIcons() {
        _gestureIconsProcessing = setTimeout(() => {
            if(_depositChequeResultVM && _depositChequeResultVM.currentItem) {
                _depositChequeResultVM.currentItem.isGestureSwipeVerticalTurnVisible(_depositChequeResultVM.currentItem.isBackImageEnabled() === 0);
                _depositChequeResultVM.currentItem.isGestureDoubleTapVisible(true);
            }
            setTimeout(() => {
                if(_depositChequeResultVM && _depositChequeResultVM.currentItem) {
                    _depositChequeResultVM.currentItem.isGestureSwipeVerticalTurnVisible(false);
                    _depositChequeResultVM.currentItem.isGestureDoubleTapVisible(false);
                }
                _gestureIconsProcessing = -1;
            }, 1500);
        }, 2000);
    }
    
    /**
     * Show all cheques depending from given level.
     * Touch related only.
     * @param {Number} level 0-2: 0 show only first cheque, 1: Show all cheques > 0, 2: show all cheques
     */
    function showCheques(level) {
        // TOUCH: Use lazy-loading to improve starting performance - especially when dealing with many cheques
        let $chqAreas = _$view.find(CHEQUE_AREA);
        if(TOUCH && $chqAreas.length) {
            if(level === 0 || level === 2) {
                $($chqAreas["0"]).find(".buttonsZone").removeAttr("style");
                $($chqAreas["0"]).find("#chqInfoArea").removeAttr("style");
            }
            if(level === 1 || level === 2) {
                Object.keys($chqAreas).forEach((area, i) => {
                    if(i > 0) {
                        setTimeout(() => {
                            $($chqAreas[area]).find(".buttonsZone").removeAttr("style");
                            $($chqAreas[area]).find("#chqInfoArea").removeAttr("style");
                        }, i < 25 ? (10 + (i * 2)) : (100 * i)); // the first 25 will load much faster than the rest
                    }
                });
            }
        }
    }

    return /** @alias module:depositchequesresult */ base.extend({
        name: "depositchequeresult",

        /**
         * Instantiates the {@link Wincor.UI.Content.DepositChequesResultViewModel} viewmodel.
         * @see {@link module:baseaggregate.activate}.
         * @lifecycle view
         * @return {Promise} resolved when activation is ready.
         */
        activate: function() {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE depositchequesresult:activate");
            _windowWidth = $(window).width();
            // remember instance for access via "moveSingleCheques"
            _depositChequeResultVM = new Wincor.UI.Content.DepositChequesResultViewModel(this);
            base.container.add(_depositChequeResultVM, ["flexMain", base.config.viewType === "softkey" ? {visibleLimits: {min: 0, max: 1, leftOnly: true}} : void 0]);
            return base.activate();
        },

        /**
         * Overridden to set all references to null.
         * @see {@link module:baseaggregate.deactivate}.
         * @lifecycle view
         */
        deactivate: function() {
            _depositChequeResultVM = _suspendedCmds = _$view = _$clone = null;
            _singleCheckMoving = _isMagnifyGlassOn = false;
            _zoomState = _currentChequeDegrees = 0;
            _gestureIconsProcessing = -1;
            if(TOUCH) {
                const $chkImg = $(CHEQUE_IMAGE);
                if($chkImg.length) {
                    $chkImg.okzoom.destroy();
                }
                base.container.sendViewModelEvent("MAGNIFY_GLASS_OFF", {});
            }
            base.deactivate();
        },

        /**
         * Overridden to set the <i>depositchequesresult</i> view fragment.
         * @param {HTMLElement} view the <i>depositchequesresult</i> view fragment
         * @returns {boolean | Promise}
         * @lifecycle view
         * @return {Promise} resolved when binding is ready.
         */
        binding: function(view) {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE depositchequesresult:binding");
            _$view = $(view);
            return base.binding(view);
        },

        /**
         * Performs the cheque image with the given index to get above the popup window in order the customer is able
         * to watch the amount of the image.
         * @param {number} index the current cheque index of the (front)image
         */
        chequeChangeAmount: function(index) {
            const $popup = $("#popupWindowAmountEntry");
            const $img = TOUCH ? $($(CHEQUE_IMAGE)[index]).find(".frontImage img").clone() : $(CHEQUE_IMAGE).find(".frontImage img").clone();
            const top = parseInt($popup.css("margin-top"));
            const margin = 10;
            if($img.length) {
                const TRANSITION_TIME = base.config.VIEW_ANIMATIONS_ON ? 500 : 0;
                $img.css({
                    position: "absolute",
                    "max-height": `${top - margin}px`,
                    "margin-top": `${top}px`,
                    "z-index": -1
                });
                $popup.before($img);
                $img.css({
                    "margin-left": `${(window.innerWidth - $img.width()) / 2}px`,
                });
                $img.transition({"margin-top": margin / 2, "delay": TRANSITION_TIME, "ease": "snap"});
            }
        },

        /**
         * Switch the magnify glass on or off.
         * @param {number} idx the current index of the cheque which is in focus.
         * @eventhandler
         */
        onMagnifyGlass: function(idx) {
            _isMagnifyGlassOn = !_isMagnifyGlassOn;
            const $chkImg = $(CHEQUE_IMAGE);
            if(_isMagnifyGlassOn) {
                _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "depositchequesresult:onMagnifyGlass is ON");
                $chkImg.okzoom({
                    width: 210,
                    height: 210,
                    scaleWidth: 1150,
                    offsetLeft: 0,
                    offsetTop: 50,
                    round: false,
                    background: $chkImg.css("background-color"),
                    backgroundRepeat: "no-repeat"
                });
                // set magnify glass to the right position
                let $chkImgCurr = $($chkImg[idx]);
                //
                // Un comment following if block in the case you want only magnify the front side of the image:
                // if(_depositChequeResultVM.currentItem.isBackImageEnabled()) {
                //      $chkImgCurr.find(CHEQUE_CONTAINER).css({transform: `rotate3d(1, 0, 0, 0deg)`});
                //      _depositChequeResultVM.currentItem.imagePath(_depositChequeResultVM.currentItem.frontImagePath);
                // }
                //
                let data = $chkImgCurr.data()["okzoom"];
                let offset = $chkImgCurr.offset();
                let event = $.Event("mousemove", {
                    which: 1,
                    pageX: offset.left + parseInt($chkImgCurr.css("width")) - 70,
                    pageY: offset.top + parseInt($chkImgCurr.css("height")) / 2
                });
                $chkImg.okzoom.build(data, event);
            } else {
                _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "depositchequesresult:onMagnifyGlass is OFF");
                $chkImg.okzoom.destroy($chkImg.data()["okzoom"]);
            }
        },

        /**
         * Handler for toggling the zoom effect when the view comes to the resulting image.
         * The handler reacts on the double-tap gesture done on the image viewer container.
         * Handler is installed within the view for this code-behind module.
         * @param {object} ev the gesture event
         * @param {number} index the current presented cheque index
         */
        zoomToggle: function(ev, index) {
            if(ev && ev.type === "tap") {
                _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "depositchequesresult:zoomToggle ON");
                const CHQ_IMG_CLONE = "chqImageClone";
                let $overlay = $("#waitSpinnerModalOverlay");
                let $img;
                const TRANSITION_TIME = base.config.VIEW_ANIMATIONS_ON ? 250 : 0;
                if(TOUCH) {
                    $img = ev.target.nodeName === "IMG" ? $(ev.target) : (_currentChequeDegrees === 0 ? $(ev.target).parent().find(".frontImage img") : $(ev.target).parent().find(".backImage img"));
                    if(!$img.attr("src")) {
                        return;
                    }
                }
                let onClickValue;
                if(_zoomState === 0) {
                    _zoomState = 1;
                    _depositChequeResultVM.documentZoomState("in");
                    if(TOUCH) {
                        $img = $img.find("img").length ? $img.find("img") : $img;
                        _$clone = $img.clone();
                        _$clone.attr({
                            id: CHQ_IMG_CLONE, "data-bind": `gesture: {
                                                                    gestures: {
                                                                        Tap: {
                                                                            events:['tap'],
                                                                            taps: 2,
                                                                            interval: 500,
                                                                            threshold: 20,
                                                                            posThreshold: 100,
                                                                            disableDefaultHandler: true,
                                                                            handler: $root.viewHelper.getActiveModule().zoomToggle
                                                                        },
                                                                        Swipe: {
                                                                            events:['swipe'],
                                                                            direction: 'DIRECTION_VERTICAL',
                                                                            disableDefaultHandler: true,
                                                                            handler: $root.onButtonPressed.bind($root, 'FLIP_IMAGE', $root.currentPresentIdx)
                                                                        }
                                                                    }
                                                              }`
                        });
                        _$clone.css({
                            position: "absolute",
                            width: "100%",
                            "align-self": "center",
                            "margin-top": `${$img.offset().top / 2}px`,
                            "transform": "scale(0)",
                            "pointer-events": "auto" // overwrite due to global CSS rule for img/object elements, otherwise we wouldn't receive any events
                        });
                        if (base.content.designMode || base.content.designModeExtended) {
                            // store overlay onclick
                            onClickValue = $overlay.attr("onclick");
                            $overlay.attr("onclick", "");
                        }
                        $overlay.append(_$clone);
                        $overlay.css({
                            display: "block",
                            visibility: "visible",
                            "background-color": "var(--color04-alpha-80)"
                        });
                        _$clone.transition({"scale": 1, "margin-top": 0}, TRANSITION_TIME, "in", () => {
                            // bind our gesture configuration against the image clone
                            ko.applyBindings(_depositChequeResultVM, _$clone[0]);
                        });
                    } else { // softkey
                        _$view.find("#chqInfoArea").attr("data-document-zoom", "in");
                        $("#flexNavSK00, #flexNavSK01, #flexAsideSK00, #flexAsideSK01").css("opacity", "0");
                        _suspendedCmds = _depositChequeResultVM.cmdRepos.suspend(["CHANGE_AMOUNT", "DECLINE", "CONFIRM", "ACCEPT"]);
                    }
                } else {
                    _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "depositchequesresult:zoomToggle OFF");
                    _zoomState = 0;
                    _depositChequeResultVM.documentZoomState("out");
                    if(TOUCH) {
                        _$clone = $overlay.find(`#${CHQ_IMG_CLONE}`);
                        // cleanup
                        objectManager.remove(_$clone[0]); // remove the gesture object
                        ko.cleanNode(_$clone[0]); // cleanup the gesture bindings
                        _$clone.transition({"scale": 0, "margin-top": $img.offset().top / 2}, TRANSITION_TIME, "out", () => {
                            _$clone.remove();
                            _$clone = null;
                            $overlay.css({display: "none", visibility: "hidden", "background-color": ""});
                            if (onClickValue && (base.content.designMode || base.content.designModeExtended)) {
                                // restore overlay onclick
                                $overlay.attr("onclick", onClickValue);
                            }
                        });
                    } else { // softkey
                        _$view.find(CHEQUE_AREA).attr("data-document-zoom", "out");
                        $("#flexNavSK00, #flexNavSK01, #flexAsideSK00, #flexAsideSK01").css("opacity", "");
                        _depositChequeResultVM.cmdRepos.resume(_suspendedCmds);
                    }
                }
            }
        },

        /**
         * Gets the current zoom state.
         * @returns {number} 0=zoomed out, 1=zoomed in
         */
        getZoomState: function() {
            return _zoomState;
        },

        /**
         * Checks whether the magnify glass is active.
         * @returns {boolean} true, if magnify glass is active, false otherwise
         */
        isMagnifyGlassOn: function () {
            return _isMagnifyGlassOn;
        },

        /**
         * Adds (softkey only) an scroll effect for the next cheque.
         * @eventhandler
         */
        onNextCheque: function() {
            _currentChequeDegrees = 0;
            if(!TOUCH && base.config.VIEW_ANIMATIONS_ON) {
                const $target = $(CHEQUE_IMAGE).find(CHEQUE_CONTAINER);
                $target.on(ANIMATE_EVENTS, () => {
                    $target.off(ANIMATE_EVENTS);
                    $(CHEQUE_IMAGE).find(".backImage").css({"visibility": "visible"});
                });
                $target.find(".backImage").css({"visibility": "hidden"});
                $target.css({"animation": "fadeInLeft 0.3s ease-out"});
            }
        },

        /**
         * Adds (softkey only) an scroll effect for the previous cheque.
         * @eventhandler
         */
        onPreviousCheque: function() {
            _currentChequeDegrees = 0;
            if (!TOUCH && base.config.VIEW_ANIMATIONS_ON) {
                const $target = $(CHEQUE_IMAGE).find(CHEQUE_CONTAINER);
                $target.on(ANIMATE_EVENTS, () => {
                    $target.off(ANIMATE_EVENTS);
                    $(CHEQUE_IMAGE).find(".backImage").css({"visibility": "visible"});
                });
                $target.find(".backImage").css({"visibility": "hidden"});
                $target.css("animation", "fadeInRight 0.3s ease-out");
            }
        },

        /**
         * Set an effect when image is flipped.
         * The function subscribes to the current items image path observable in order to aware when the image is
         * changing.
         * The caller must invoke before the observable is updated!
         * @param {number} index the current present cheque index
         */
        onFlipImage: function(index) {
            if(_$clone) {
                const path = _depositChequeResultVM.currentItem && _$clone.attr("src") === _depositChequeResultVM.currentItem.frontImagePath ?
                                                        _depositChequeResultVM.currentItem.backImagePath : _depositChequeResultVM.currentItem.frontImagePath;
                _$clone.attr("src", path);
                base.viewHelper.animate(_$clone, "flipInX", "0.5s", "ease-out").then(() => {
                    base.viewHelper.resetAfterAnimate(_$clone);
                });
            }
            // because we work with a clone on touch
            if(TOUCH) {
                this.onTurnCheque({type: SUPPORTED_PAN_GESTURES.PANEND}, index);
            }
        },

        /**
         * Turns the current presented cheque using a 3D effect.
         * @param {Object} ev the gesture event
         * @param {number} index the current present cheque index
         */
        onTurnCheque: function(ev, index) {
            if(ev && ev.type.toUpperCase() in SUPPORTED_PAN_GESTURES && _depositChequeResultVM.currentItem && _depositChequeResultVM.currentItem.isBackImageEnabled() === 0) {
                let value = ev.deltaY;
                let $container = TOUCH ? $($(CHEQUE_IMAGE)[index]).find(CHEQUE_CONTAINER) : $(CHEQUE_IMAGE).find(CHEQUE_CONTAINER);
                if(ev.type === SUPPORTED_PAN_GESTURES.PANEND) {
                    _currentChequeDegrees = _currentChequeDegrees === 0 ? 180 : 0;
                    value = _currentChequeDegrees;
                }
                value = value > 180 ? 180 : value < 0 ? 0 : value;
                $container.css({rotateX: `${value}deg`}); // css() has been overwritten by jQuery transit so that we're able to use -rotateX
                if(value === 180) {
                    _depositChequeResultVM.currentItem.imagePath(_depositChequeResultVM.currentItem.backImagePath);
                } else if(value === 0) {
                    _depositChequeResultVM.currentItem.imagePath(_depositChequeResultVM.currentItem.frontImagePath);
                }
            }
        },

        /**
         * Shows the gesture icons after a period of time when the whole cheque container is moved.
         * @param {Object} ev the gesture event
         */
        onMoveChequesContainer: function(ev) {
            _depositChequeResultVM.setAllChequesShown(ev);
            if(_depositChequeResultVM.currentItem) {
                if(_gestureIconsProcessing === -1) {
                    showGestureIcons();
                } else {
                    clearTimeout(_gestureIconsProcessing);
                    _depositChequeResultVM.currentItem.isGestureSwipeVerticalTurnVisible(false);
                    _depositChequeResultVM.currentItem.isGestureDoubleTapVisible(false);
                    _gestureIconsProcessing = -1;
                    showGestureIcons();
                }
            }
        },

        /**
         * Overridden to initialize the magnifying glass on touch layout.
         * @see {@link module:baseaggregate.compositionComplete}.
         * @lifecycle view
         */
        compositionComplete: function(view, parent) {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE depositchequesresult:compositionComplete");

            base.compositionComplete(view, parent);
            if(TOUCH) {
                // TOUCH: Use lazy-loading to improve starting performance - especially when dealing with many cheques
                showCheques(0);
            }
        
            base.container.whenActivated().then(() => {
                if(TOUCH) {
                    // TOUCH: Use lazy-loading to improve starting performance - especially when dealing with many cheques
                    showCheques(1);
                }
                _depositChequeResultVM.cmdRepos.whenAvailable(CMD_MAGNIFY_GLASS).then(() => {
                    _depositChequeResultVM.cmdRepos.setActive(CMD_MAGNIFY_GLASS, TOUCH);
                });
            });
        },
    
        /**
         * In the case the view gets updated we need to show cheques again in case of TOUCH.
         * @see {@link module:baseaggregate.compositionUpdated}.
         * @lifecycle view
         */
        compositionUpdated: function() {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE billselection:compositionUpdated");
            if(TOUCH) {
                showCheques(2);
            }
        }
    
    });
});
