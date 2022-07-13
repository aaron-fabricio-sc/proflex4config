/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ scannedimageviewer.js 4.3.1-201021-21-23fb68fb-1a04bc7d
 */

/**
 * The scannedimageviewer code-behind provides the life-cycle for the <i>scannedimageviewer</i> view.
 * @module scannedimageviewer
 * @since 2.0/10
 */
define(["jquery", "code-behind/baseaggregate", "extensions", "lib/jquery-okzoom-ext", "vm/ScannedImageViewerViewModel"], function ($, base, ext) {
    console.log("AMD:scannedimageviewer");

    const _logger = Wincor.UI.Service.Provider.LogProvider;

    const TOUCH = base.content.viewType === "touch";

    const DOCUMENT_AREA = TOUCH ? "#chqControl" : "#chqInfoArea";
    const DOCUMENT_IMAGE_AREA = "#imgViewer";
    const DOCUMENT_SCAN_IMAGE = "#idScanImage";


    const VIEW_MODE_SCANNING_PREPARE = "prepare";
    const VIEW_MODE_SCANNING = "scanning";
    const VIEW_MODE_IMAGE_VIEWER = "result";

    const CMD_MAGNIFY_GLASS = "MAGNIFY_GLASS";

    const TRANSITION_TIME = "0.5";
    let TRANSITION_OUT_ANIM = "zoomOutLeft";
    let TRANSITION_IN_ANIM = "zoomInRight";

    const OK_IMG = "[data-okimage]";

    let _$container1;
    let _$container2;
    let _$viewer;
    let _$view;

    let _imgViewerVM;
    let _itemSubscription;
    let _isMagnifyGlassOn = false;

    /**
     * State 0 = zoomed out, 1 = zoomed in.
     * @type {number}
     * @private
     */
    let _zoomState = 0;

    /**
     * Updates the view.
     */
    function updateView() {
        _$view.find(DOCUMENT_AREA).attr("data-document-type", _imgViewerVM.docType);
    }

    /**
     * Manages the view parts whether to show the right image animation or the document result.
     */
    function manageViewParts() {
        _$viewer.removeClass("scanningPrepareAnimation");
        let mode = _imgViewerVM.mode();
        _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `scannedimageviewer:manageViewParts mode=${mode}`);
        if (mode === VIEW_MODE_SCANNING_PREPARE || mode === VIEW_MODE_SCANNING) {
            let img = "style/default/images/Icon_Placeholder_44x44.svg";
            if (_imgViewerVM.viewFlexDocumentScanningIdCardFront()) {
                img = "style/default/images/identity_card_silhouette.svg";
            } else if (_imgViewerVM.viewFlexDocumentScanningIdCardBack()) {
                img = "style/default/images/identity_card_silhouette_back.svg";
            } else if (_imgViewerVM.viewFlexDocumentScanningDrivingLicenseFront()) {
                img = "style/default/images/driving_license_front.svg";
            } else if (_imgViewerVM.viewFlexDocumentScanningDrivingLicenseBack()) {
                img = "style/default/images/driving_license_back.svg";
            } else if (_imgViewerVM.viewFlexDocumentScanning()) {
                img = "style/default/images/document.svg";
            }

            if (_isMagnifyGlassOn) {
                base.viewHelper.getActiveModule().offMagnifyGlass(); // destroy
            }

            _imgViewerVM.imagePath(img);

            if (mode === VIEW_MODE_SCANNING_PREPARE) {
                $(DOCUMENT_SCAN_IMAGE).hide();
                _$viewer.addClass("scanningPrepareAnimation");
            } else {
                $(DOCUMENT_SCAN_IMAGE).show();
            }
        } else if (mode === VIEW_MODE_IMAGE_VIEWER) {
            $(DOCUMENT_SCAN_IMAGE).hide();
            _imgViewerVM.retrieveData().then(() => {
                _imgViewerVM.cmdRepos.whenAvailable(CMD_MAGNIFY_GLASS).then(() => {
                    _imgViewerVM.cmdRepos.setActive(CMD_MAGNIFY_GLASS, TOUCH && _$viewer.find(OK_IMG).length);
                });
            });
        }
    }

    /**
     * The image presenter.
     * @param {string} imagePath the path to an image
     * @param {number=} scale a scale factor
     * @returns {Promise}
     */
    function presentImage(imagePath, scale) {
        return ext.Promises.promise(resolve => {
            if (imagePath) {
                let $active = _$container1.attr("data-active") === "true" ? _$container1 : _$container2;
                let $inActive = _$container1.attr("data-active") === "true" ? _$container2 : _$container1;

                base.viewHelper.animate($active, TRANSITION_OUT_ANIM, `${TRANSITION_TIME}s`, "ease-out").then(() => {
                    $active.hide();
                    $active.attr("data-active", false);
                    $active.removeAttr("data-okimage");
                    base.viewHelper.resetAfterAnimate($active);
                });
                $inActive.css({
                    "background-size": "100% 100%",
                    "transform": !scale ? "scale(1)" : `scale(${scale})`,
                    "background-image": `url(${imagePath})`
                });
                $inActive.show();
                $inActive.attr("data-active", true);
                $inActive.attr("data-okimage", imagePath);
                base.viewHelper.animate($inActive, TRANSITION_IN_ANIM, `${TRANSITION_TIME}s`, "ease-in").then(() => {
                    base.viewHelper.resetAfterAnimate($inActive);
                    if (_isMagnifyGlassOn) {
                        base.viewHelper.getActiveModule().onMagnifyGlass(true);
                    }
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    /**
     * Generator function to trigger the image presenter.
     */
    function* genImgPresentor() {
        let img = yield;
        yield presentImage(img);
    }


    return /** @alias module:scannedimageviewer */ base.extend({
        name: "scannedimageviewer",

        /**
         * Switch the magnify glass on or off.
         * @param {boolean} reset true, if the magnify glass should destroy first. The magnify glass will reconstructed then.
         */
        onMagnifyGlass: function (reset) {
            if (!TOUCH) {
                return;
            }
            _isMagnifyGlassOn = !_isMagnifyGlassOn || reset;
            const $chkImg = _$viewer.find(OK_IMG);
            if ($chkImg.length) {
                if (_isMagnifyGlassOn) {
                    if (reset) {
                        $chkImg.okzoom.destroy();
                    }
                    _logger.LOG_INFO && _logger.log(_logger.LOG_INFO, "scannedimageviewer:onMagnifyGlass is ON");
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
                    let $chkImgCurr = $chkImg;
                    let data = $chkImgCurr.data()["okzoom"];
                    let offset = $chkImgCurr.offset();
                    let event = $.Event("mousemove", {
                        which: 1,
                        pageX: offset.left + parseInt($chkImgCurr.css("width")) / 2,
                        pageY: offset.top + parseInt($chkImgCurr.css("height")) / 2
                    });
                    $chkImg.okzoom.build(data, event);
                } else {
                    _logger.LOG_INFO && _logger.log(_logger.LOG_INFO, "scannedimageviewer:onMagnifyGlass is OFF");
                    $chkImg.okzoom.destroy();
                }
            } else {
                _imgViewerVM.cmdRepos.whenAvailable(CMD_MAGNIFY_GLASS).then(() => {
                    _imgViewerVM.cmdRepos.setVisible(CMD_MAGNIFY_GLASS, false);
                });
            }
        },

        /**
         * Switch the magnify glass and the magnify glass icon off.
         */
        offMagnifyGlass: function () {
            const $chkImg = _$viewer.find(OK_IMG);
            if ($chkImg.length) {
                $chkImg.okzoom.destroy();
            }
            _isMagnifyGlassOn = false;
            base.container.sendViewModelEvent("MAGNIFY_GLASS_OFF", {});
        },

        /**
         * Checks whether the magnify glass is active.
         * @returns {boolean} true, if magnify glass is active, false otherwise
         */
        isMagnifyGlassOn: function () {
            return _isMagnifyGlassOn;
        },

        /**
         * Handler for toggling the zoom effect when the view comes to the resulting image.
         * The handler reacts on the double-tap gesture done on the image viewer container.
         * Handler is installed within the view for this code-behind module.
         * @param {object} ev the gesture event
         */
        zoomToggle: function (ev) {
            if (_imgViewerVM.mode() === VIEW_MODE_IMAGE_VIEWER && ev.type === "tap") {
                let $control = _$view.find(DOCUMENT_AREA);
                if (_zoomState === 0) {
                    _zoomState = 1;
                    $control.attr("data-document-zoom", "in");
                } else {
                    _zoomState = 0;
                    $control.attr("data-document-zoom", "out");
                }
            }
        },

        /**
         * Gets the current zoom state.
         * @returns {number} 0=zoomed out, 1=zoomed in
         */
        getZoomState: function () {
            return _zoomState;
        },

        /**
         * Is called when the next image is presented.
         * @eventhandler
         */
        onNextImage: function () {
            TRANSITION_OUT_ANIM = "flipOutX";
            TRANSITION_IN_ANIM = "flipInX";
        },
    
        /**
         * Instantiates the {@link Wincor.UI.Content.ScannedImageViewerViewModel} and stores its reference for later usage inside this module.
         * @see {@link module:baseaggregate.activate}.
         * @lifecycle view
         * @return {Promise} resolved when activation is ready.
         */
        activate: function () {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE scannedimageviewer:activate");
            // Viewing - ScannedImageViewerViewModel
            _imgViewerVM = new Wincor.UI.Content.ScannedImageViewerViewModel(this);
            let imgPresentor = genImgPresentor();
            // subscribe to image path
            _itemSubscription = _imgViewerVM.imagePath.subscribe(newImg => {
                base.container.whenActivated().then(() => {
                    if (!imgPresentor.next().done) {
                        imgPresentor.next(newImg).value.then(() => {
                            imgPresentor = genImgPresentor();
                        });
                    }
                });
            });

            base.container.add(_imgViewerVM, ["flexMain"]);
            return base.activate();
        },

        /**
         * Overridden to set all references to null.
         * @see {@link module:baseaggregate.deactivate}.
         * @lifecycle view
         */
        deactivate: function () {
            if (_itemSubscription) {
                _itemSubscription.dispose();
                _itemSubscription = void 0;
            }
            if (TOUCH) {
                this.offMagnifyGlass();
            }
            _isMagnifyGlassOn = false;
            _zoomState = 0;
            _imgViewerVM = _$view = _$viewer = _$container1 = _$container2 = null;
            base.deactivate();
        },

        /**
         * Overridden to set view
         * @param {HTMLElement} view the <i>scannedimageviewer</i> view fragment
         * @returns {boolean | Promise}
         * @lifecycle view
         */
        binding: function (view) {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE scannedimageviewer:binding");
            _$view = $(view);
            _$viewer = _$view.find(DOCUMENT_IMAGE_AREA);
            _$container1 = _$view.find("#chqImgCarrier1");
            _$container2 = _$view.find("#chqImgCarrier2");
            updateView();
            return base.binding(view);
        },
    
        /**
         * Manages the view parts depending on mode {@link Wincor.UI.Content.ScannedImageViewerViewModel#mode}.
         * @param {HTMLElement} view the <i>scannedimageviewer</i> view fragment
         * @param {HTMLElement} parent the <i>scannedimageviewer</i> view fragment
         * @see {@link module:baseaggregate.compositionComplete}.
         * @lifecycle view
         */
        compositionComplete: function (view, parent) {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE scannedimageviewer:compositionComplete");
            base.compositionComplete(view, parent);
            base.container.whenActivated().then(() => {
                manageViewParts();
            });
        },
    
        /**
         *
         * (specialties: TODO)
         * @see {@link module:baseaggregate.compositionUpdated}.
         * @lifecycle view
         */
        compositionUpdated: function (redrawAllCanvas) {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE scannedimageviewer:compositionUpdated");
            updateView();
            manageViewParts();
            base.compositionUpdated(redrawAllCanvas);
        }

    });
});
