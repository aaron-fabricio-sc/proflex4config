/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ signaturepad.js 4.3.1-201021-21-23fb68fb-1a04bc7d
 */

/**
 * The signaturepad code-behind provides the life-cycle for the <i>signaturepad</i> view.
 * @module signaturepad
 * @since 2.0/10
 */
define(["jquery", "code-behind/baseaggregate", "vm-util/UICommanding", "lib/jquery.throttle-debounce", "lib/jquery.transit.min", "vm/SignaturePadViewModel"], function($, base, commanding) {
    console.log("AMD:signaturepad");

    const _logger = Wincor.UI.Service.Provider.LogProvider;


    const TOUCH = base.content.viewType === "touch";
    const DESIGN_MODE = base.content.designMode || base.content.designModeExtended;

    const SUPPORTED_GESTURES = {PANSTART: "panstart", PANMOVE: "panmove", PANEND: "panend", TAP: "tap", PRESS: "press"};

    const MAIN = "#flexMain";
    const ARTICLE = "#flexArticle";
    const SIGNATURE_AREA = "#signatureArea";
    const SIGNATURE_RECORDING = "#signatureRecording";
    const SIGNATURE_RECORDING_HINT = "#recordingHint";
    const HAND_POINTER = "#handPointer";

    const REPLAY_WAITING_TIME = 2000;

    const SIGNATURE_AS_BASE_64 = "signatureAsBase64";

    /**
     * Blurs the signature while drawing depending on the speed.
     * @type {boolean}
     */
    const BLURRING = false;
    const BLUR_BASE = 0;

    /**
     * Gives opportunity for copy/paste the signature recording data from the corresponding input field.
     * This flag is only relevant when flag DESIGN_MODE true is.
     * @type {boolean}
     */
    const ALLOW_COPY_FOR_REPLAY = true;

    let _mainVM;
    let _self;
    let _lastX = 0;
    let _lastY = 0;
    let _maxLW;
    let _$pad;
    let _$handPointer;
    let _ctx;
    let _recording = [];
    let _isStylus = false;
    let _isInputMode = false;
    let _isReplayInProgress = false;
    let _imageType = "png";
    let _panStartCounter = 0;

    /**
     * Clears the signature pad and stops a currently paying sig animation.
     */
    function clearSig() {
        _ctx.clearRect(0, 0, _ctx.canvas.width, _ctx.canvas.height);
        _isReplayInProgress = false;
        _recording.length = 0;
        _$handPointer.hide();
        if(_isInputMode && commanding.hasCommand(_mainVM.STANDARD_BUTTONS.CONFIRM)) {
            commanding.setActive(_mainVM.STANDARD_BUTTONS.CONFIRM, false);
        }
        if(DESIGN_MODE) {
            let $hint = $(SIGNATURE_RECORDING_HINT);
            let $rec = $(SIGNATURE_RECORDING);
            if($rec.length) {
                $rec.val("");
                $rec.hide();
            }
            if($hint.length) {
                $hint.hide();
            }
            // remove the popup hint which tells to press CORRECT button
            base.viewHelper.removePopup();
        }
    }

    /**
     * Initializes the hand pointer which is either a stylus or a hand gesture.
     */
    function initHandPointer() {
        // add a hand pointer to the DOM
        let $article = $(ARTICLE);
        _isStylus = _mainVM.viewFlexSignatureStylus();
        _$handPointer = $(HAND_POINTER);
        if(!_$handPointer.length) {
            if(_isStylus) {
                $article.append('<object id="handPointer" type="image/svg+xml" data="style/default/images/edit.svg"></object>');
            } else {
                $article.append('<object id="handPointer" type="image/svg+xml" data="style/default/images/finger_pointing_gesture.svg"></object>');
            }
            _$handPointer = $(HAND_POINTER);
        } else { // update
            _$handPointer.attr("data", _isStylus ? "style/default/images/edit.svg" : "style/default/images/finger_pointing_gesture.svg");
        }
        // move hand pointer to middle
        _$handPointer.css({
            position: "absolute",
            display: "block",
            width: _isStylus ? "50px" : "100px",
            height: _isStylus ? "50px" : "100px",
            "z-index": 1
        });
        _$handPointer.offset({
            top: _$pad.offset().top + (_$pad.height() / 2) - (_$handPointer.height() / 2),
            left: _$pad.offset().left + (_$pad.width() / 2) - (_$handPointer.width() / 2)
        });
    }

    return /** @alias module:signaturepad */ base.extend({
        name: "signaturepad",

        /**
         * Gesture handler to draw a signature on the screen.
         * In design mode the recording of the data is supported.
         * @param {object} ev the gesture event
         * @returns {boolean} true - we have handled all, won't call the default
         */
        drawSignature: function(ev) {
            if(_isInputMode && !_isReplayInProgress && ev && ev.pointers.length && ev.type.toUpperCase() in SUPPORTED_GESTURES) {
                let x = ev.pointers[0].clientX - _ctx.canvas.offsetLeft;
                let y = ev.pointers[0].clientY - _ctx.canvas.offsetTop;

                if(_panStartCounter < 2 && ev.type !== SUPPORTED_GESTURES.PANSTART) {
                    return true; // prevent from starting drawing direct after stopped animation, but without doing a "panstart" first.
                }

                switch(ev.type) {
                    case SUPPORTED_GESTURES.PANSTART:
                        _lastX = x;
                        _lastY = y;
                        _panStartCounter++;
                        if(_isInputMode && commanding.hasCommand(_mainVM.STANDARD_BUTTONS.CONFIRM) && !commanding.isActive(_mainVM.STANDARD_BUTTONS.CONFIRM)) {
                            commanding.setActive(_mainVM.STANDARD_BUTTONS.CONFIRM, true);
                        }
                        break;

                    case SUPPORTED_GESTURES.TAP:
                        _lastX = x - 1;
                        _lastY = y - 1;
                        break;

                    case SUPPORTED_GESTURES.PRESS:
                        // if you like to clear signature while press gesture - uncomment following line:
                        // clearSig();
                        return true;
                        break;

                    default:
                }

                let thickness, blur, alpha;

                if(BLURRING) {
                    let v = Math.abs(ev.velocity) + 1;
                    v = Math.round(v * 10) / 10;
                    thickness = _maxLW - v;
                    thickness = thickness < 1 ? 1 : thickness;
                    alpha = 1.0 - (v / 10);
                    alpha = alpha >= 0.9 ? 1.0 : alpha;
                    blur = Math.abs(BLUR_BASE + v - alpha);
                    // console.debug("v=" + v +  "  t" + thickness + " opacity=" + (alpha) + "  blur=" + blur);
                }

                _ctx.beginPath();
                if(BLURRING) {
                    _ctx.lineWidth = thickness;
                    _ctx.globalAlpha = alpha;
                    _ctx.shadowBlur = blur;
                }
                _ctx.moveTo(_lastX, _lastY);
                _ctx.lineTo(x, y);
                if(DESIGN_MODE) {
                    // record it
                    _recording.push(_lastX);
                    _recording.push(_lastY);
                    _recording.push(x);
                    _recording.push(y);
                }
                _lastX = x;
                _lastY = y;
                _ctx.stroke();
                _ctx.closePath();
            } else if(_isInputMode && _isReplayInProgress || (_isInputMode && _panStartCounter >= 1 && _isReplayInProgress)) {
                _panStartCounter++;
                clearSig();
            }
            return true;
        },

        /**
         * Sets the signature for the replay purpose.
         * @param recording
         */
        setSignature: function(recording = []) {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "VIEW_AGGREGATE signaturepad:setSignature");
            _recording = recording;
        },

        /**
         * Clears the current signature.
         */
        clearSignature: function() {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "VIEW_AGGREGATE signaturepad:clearSignature");
            _panStartCounter++;
            clearSig();
        },

        /**
         * Gets the current drawn signature as base64 coded data.
         * Design mode only:
         * The method presents an opportunity to copy the current data in to the mem for storing in the signature.json file purpose.
         * Please note that the drawn signature is depending on the resolution.
         * @returns {string} the base64 coded signature data
         */
        getSignatureAsBase64: function() {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "VIEW_AGGREGATE signaturepad:getSignatureAsBase64");
            if(DESIGN_MODE && ALLOW_COPY_FOR_REPLAY && _isInputMode && _recording.length) {
                let $rec = $(SIGNATURE_RECORDING);
                if(!$rec.length) {
                    let $article = $(ARTICLE);
                    $article.append(
                        '<var id="recordingHint">' +
                            'For a new signature anim hit Ctrl+C to copy/paste this data into ".../views/style/default/images/signature.json" for your desired language:' +
                        '<var/>');
                    $article.append('<input id="signatureRecording" type="text" name="signature" value=""/>');
                    $rec = $(SIGNATURE_RECORDING);
                    if(!TOUCH) { // for softkey we have to consider the smaller article surrounded by the flexNav and flexAside
                        $(SIGNATURE_RECORDING_HINT).css("margin-left", "-100%"); // correct the position the hint
                        $rec.css("margin-left", "-100%"); // correct the position the input
                    }
                } else {
                    let $hint = $(SIGNATURE_RECORDING_HINT);
                    $hint.show();
                    $rec.show();
                }
                $rec.css({
                    width: _$pad.css("width"),
                    height: "15px"
                });
                $rec.val(_recording.toString());
                $rec.focus();
                $rec.select();
            }

            const w = _$pad[0].width;
            const h = _$pad[0].height;
            const data = _ctx.getImageData(0, 0, w, h);
            // store the current globalCompositeOperation
            const compositeOperation = _ctx.globalCompositeOperation;
            // set to draw behind current content
            _ctx.globalCompositeOperation = "destination-over";
            // draw background / rect on entire canvas
            _ctx.fillRect(0, 0, w, h);
            // get the image data from the canvas
            let imageData = _$pad[0].toDataURL(`image/${_imageType}`, 1.0);
            // clear the canvas
            _ctx.clearRect(0, 0, w, h);
            // restore it with original / cached ImageData
            _ctx.putImageData(data, 0, 0);
            // reset the globalCompositeOperation to what it was
            _ctx.globalCompositeOperation = compositeOperation;
            return imageData;
        },

        /**
         * Replays the signature which must be set with 'setSignature()' and is stored in _recording.
         * The method also moves the hand pointer (or stylus) to the current drawing point.
         */
        replaySignature: function() {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "VIEW_AGGREGATE signaturepad:replaySignature");
            const CORRECTURE_TOP = _isStylus ? 40 : 10;
            const CORRECTURE_LEFT = _isStylus ? 20 : 10;
            const top = _$pad.offset().top - CORRECTURE_TOP; // correction 4 pointer
            const left = _$pad.offset().left - CORRECTURE_LEFT; // correction 4 pointer
            let i = 0;

            _ctx.clearRect(0, 0, _ctx.canvas.width, _ctx.canvas.height);

            const replay = () => {
                if(_ctx && i < _recording.length) {
                    _isReplayInProgress = true;
                    // data array is in chunks of 4 coordinates organized: 0=lastX,1=lastY,2=x,3=y,4=lastX,5=lastY, ...
                    _ctx.moveTo(_recording[i], _recording[i + 1]);
                    _ctx.lineTo(_recording[i + 2], _recording[i + 3]);
                    _ctx.stroke();
                    _$handPointer.css({
                        left: left + _recording[i],
                        top: top + _recording[i + 1]
                    });
                    i += 4;
                    requestAnimationFrame(replay);
                } else if(_ctx) {
                    _ctx.closePath();
                    if(!_isInputMode) {
                        if(_mainVM.designModeExtended && !sessionStorage.getItem(SIGNATURE_AS_BASE_64)) {
                            sessionStorage.setItem(SIGNATURE_AS_BASE_64, _self.getSignatureAsBase64());
                        }
                        setTimeout(() => {
                            if(_self && !_isInputMode) { // check again, because flag may changed when view has been updated
                                _self.replaySignature();
                            }
                        }, REPLAY_WAITING_TIME);
                    } else {
                        _recording.length = 0;
                    }
                    // move hand pointer to the correct button to activate it
                    if(TOUCH && _isInputMode && _isReplayInProgress) {
                        let $main = $(MAIN);
                        let $correct = $("#buttonCorrect");
                        $main.css("z-index", 10); // usually the footer has a higher index, to prevent from pointer gets behind we set a higher one temporally
                        _$handPointer.animate({
                            top: $correct.offset().top + 5,
                            left: $correct.offset().left + 30
                        }, 700, () => {
                            if(_isInputMode) { // check again, because flag may changed when view has been updated
                                base.viewHelper.commandAutomation("buttonCorrect");
                            }
                            $main.css("z-index", ""); // ...and reset it afterwards
                            _isReplayInProgress = false;
                        });
                    }
                }
            };
            // move hand pointer to start
            _$handPointer.animate({
                top: top + _recording[i + 1],
                left: left + _recording[i],
                rotate: "-20deg"
            }, 700, () => {
                if(_ctx) {
                    _ctx.beginPath();
                    if(_recording.length) {
                        replay();
                    } else {
                        _$handPointer.hide();
                    }
                }
            });
        },

        /**
         * Checks whether a signature is given or not.
         * @returns {boolean} true, if a signature is given, false otherwise
         */
        isSignatureAvailable: function() {
            return _lastX > 0 || _lastY > 0;
        },

        /**
         * Checks whether a copy for signature replay is allowed or not.
         * @returns {boolean} true, allowed, false otherwise
         */
        isAllowCopyForReplay: function() {
            return ALLOW_COPY_FOR_REPLAY;
        },

        /**
         * Set the input mode.
         * @param {boolean} inputMode true, if the customer is able to draw the signature via his finger.
         */
        setInputMode: function(inputMode) {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "VIEW_AGGREGATE signaturepad:setInputMode=" + inputMode);
            _isInputMode = inputMode;
        },

        /**
         * Set the type of the Base64 image.
         * @param {String} type e.g. png, jpg
         */
        setImageType: function(type) {
            // if the type is jpg we need to use 'jpeg' instead for the base64 retrieving
            _imageType = type === "jpg" ? "jpeg" : type;
        },

        /**
         * Instantiates the {@link Wincor.UI.Content.SignaturePadViewModel} viewmodel.
         * @see {@link module:baseaggregate.activate}.
         * @lifecycle view
         * @return {Promise} resolved when activation is ready.
         */
        activate: function() {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE signaturepad:activate");
            _self = this;
            _mainVM = new Wincor.UI.Content.SignaturePadViewModel(this);
            base.container.add(_mainVM, MAIN.substring(1));
            return base.activate();
        },

        /**
         * Overridden in order to delete the internal variables.
         * @see {@link module:baseaggregate.deactivate}.
         * @lifecycle view
         */
        deactivate: function() {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE signaturepad:deactivate");
            _recording.length = _lastX = _lastY = _panStartCounter = 0;
            _isStylus = _isInputMode = _isReplayInProgress = false;
            _mainVM = _$pad = _$handPointer = _ctx = _self = null;
            _imageType = "png";
            base.deactivate();
        },


        /**
         * Overridden to initialize the hand pointer and several private member, replaying the signature animation.
         * @see {@link module:baseaggregate.compositionComplete}.
         * @lifecycle view
         */
        compositionComplete: function(view, parent) {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE signaturepad:compositionComplete");
            _$pad = $(view).find(SIGNATURE_AREA);
            _$pad.attr("width", parseInt(_$pad.css("width")));
            _$pad.attr("height", parseInt(_$pad.css("height")));
            _maxLW = parseInt(_$pad.attr("data-line-thickness"));
            // set and configure context
            _ctx = _$pad[0].getContext('2d');
            _ctx.lineWidth = _maxLW;
            _ctx.strokeStyle = _$pad.css("color");
            _ctx.fillStyle = getComputedStyle(document.body).getPropertyValue("--colorSignatureBackground"); // set the style for the base64 image background
            _ctx.shadowColor = _ctx.strokeStyle;
            _ctx.shadowBlur = BLUR_BASE;
            _ctx.lineJoin = "round";
            _ctx.lineCap = "round";
            initHandPointer();
            //
            base.compositionComplete(view, parent);
            this.replaySignature();
            // In design mode we allow finger drawing only when pressing CORRECT first - this is because we may get in conflict regarding mouse events when
            // the design menu is open and where the view key has chosen from.
            // To state this circumstance we show a popup hint to press the CORRECT button first.
            if(DESIGN_MODE) {
                base.container.whenActivated().then(() => {
                    base.viewHelper.showPopupHint(`Please press 'CORRECT button to begin drawing'`, base.viewHelper.POPUP_INFO_TYPE, "buttonCorrect", null);
                });
            }
        },

        /**
         * Overridden to initialize the hand pointer and replaying the signature animation.
         * @see {@link module:baseaggregate.compositionUpdated}.
         * @lifecycle view
         */
        compositionUpdated: function() {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE signaturepad:compositionUpdated");
            initHandPointer();
            this.replaySignature();
        }

    });
});