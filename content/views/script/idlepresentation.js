/**
 @preserve
 Copyright (c) 2001-2021 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ idlepresentation.js 4.3.1-210422-21-8faf2d6b-1a04bc7d
 */

/**
 * The idlepresentation code-behind provides the life-cycle for the <i>idlepresentation</i> view.
 * @module idlepresentation
 * @since 1.0/00
 */
define(["code-behind/baseaggregate", "lib/qrcode", "vm/IdlePresentationViewModel"], function (base, QRCode) {
    console.log("AMD:idlepresentation");

    const _logger = Wincor.UI.Service.Provider.LogProvider;
    
    // takes the resolve function which will be called when composition has been completed
    let _compositionCompletePromiseResolve = null;
    let _$dateTime = null;
    let _$qrCode = null;
    let _qrCodeGenerator = null;
    
    return /** @alias module:idlepresentation */ base.extend({
        name: "idlepresentation",
    
        /**
         * Shows the QR code image when the QR code token is available or has been updated.
         * A possible 'flexTime' container is set to hidden then.
         * @param {String} qrCodeToken the token for the QR code or an empty string
         * @async
         */
        updateQRCode: async function (qrCodeToken) {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `* | VIEW_AGGREGATE idlepresentation:updateQRCode qrCodeToken=${qrCodeToken}`);
            let compositionCompletePromise = Promise.resolve();
            if(!_compositionCompletePromiseResolve) {
                compositionCompletePromise = new Promise(resolve => {
                    _compositionCompletePromiseResolve = resolve;
                });
            }
            compositionCompletePromise?.then(() => {
                if (_$qrCode?.length && _$dateTime?.length) {
                    try {
                        if (qrCodeToken && _$qrCode?.find("#qrCodeToken").length) {
                            const $qrCodeToken = _$qrCode.find("#qrCodeToken");
                            _$qrCode.css("display") === "none" && _$qrCode.show();
                            _$qrCode.css("opacity") === "1" && _$qrCode.css("opacity", 0);
                            _qrCodeGenerator = _qrCodeGenerator || new QRCode($qrCodeToken[0], {
                                colorDark: "#000000",
                                colorLight: "#ffffff",
                                typeNumber: 4,
                                useSVG: true
                            });
                            _qrCodeGenerator.makeCode(qrCodeToken);
                            $qrCodeToken.attr("title", ""); //  clear the tile attr set by generator with the token string
                            _$qrCode.transition({ opacity: 1 }, 350, () => {
                                _$dateTime?.css("visibility") === "visible" && _$dateTime?.css("visibility", "hidden");
                            });
                        } else {
                            _qrCodeGenerator?.clear();
                            if(_$qrCode.css("display") !== "none") {
                                _$qrCode?.transition({ opacity: 0 }, 250, () => {
                                    _$dateTime?.css("visibility", "visible");
                                });
                            }
                        }
                    } catch(e) {
                        _$qrCode?.hide();
                        _$dateTime?.css("visibility", "visible");
                        _qrCodeGenerator = null;
                        _logger.error(`module idlepresentation:updateQRCode error while processing qrCodeToken=${qrCodeToken}: ${e}`);
                    }
                } else {
                    _logger.LOG_INFO && _logger.log(_logger.LOG_INFO, `* | VIEW_AGGREGATE idlepresentation:updateQRCode no QR code container available.`);
                }
            });
            return compositionCompletePromise;
        },
        
        /**
         * Instantiates the {@link Wincor.UI.Content.IdlePresentationViewModel} viewmodel.
         * @see {@link module:baseaggregate.activate}.
         * @lifecycle view
         * @return {Promise} resolved when activation is ready.
         */
        activate: function () {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE idlepresentation:activate");
            base.container.add(new Wincor.UI.Content.IdlePresentationViewModel(this), "flexMain");
            return base.activate();
        },

        /**
         * Overridden in order to delete the internal variables.
         * @see {@link module:baseaggregate.deactivate}.
         * @lifecycle view
         */
        deactivate: async function () {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE idlepresentation:deactivate");
            _$qrCode?.hide();
            _$dateTime?.css("visibility") === "hidden" && _$dateTime?.css("visibility", "visible");
            _compositionCompletePromiseResolve = _$qrCode = _$dateTime = null;
            base.deactivate();
        },
        
        /**
         * Overridden to disable a possible <i>txnBackground</i> style.
         * @see {@link module:baseaggregate.compositionComplete}.
         * @lifecycle view
         */
        compositionComplete: function (view, parent) {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE idlepresentation:compositionComplete");
            base.compositionComplete(view, parent);
            base.container.whenActivationStarted().then(() => {
                base.$('#txnBackground').css("display", "none");
                base.$('div[data-view-id]').attr("data-txn-background", "false");
                // let updateQRCode do it's work
                _$dateTime = base.$("#flexHeader #flexTime #date, #flexHeader #flexTime #time");
                _$qrCode = base.$("#flexHeader #flexTime #qrCode");
                _compositionCompletePromiseResolve && _compositionCompletePromiseResolve();
                // code your specific stuff here
            });
        }
    });
});

