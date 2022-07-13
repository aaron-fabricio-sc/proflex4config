/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ ScanCodeAnimationsViewModel.js 4.3.1-210127-21-34ae33df-1a04bc7d
 */

define(["knockout", "vm/AnimationsViewModel"], function(ko) {
    "use strict";

    /**
     * Deriving from {@link Wincor.UI.Content.AnimationsViewModel} class. <BR>
     * This viewmodel handles the scanning animations.
     * @class
     */
    Wincor.UI.Content.ScanCodeAnimationsViewModel = class ScanCodeAnimationsViewModel extends Wincor.UI.Content.AnimationsViewModel {

        /**
         * This observable stores the label text for the barcode scanning animation.
         * @type {function | ko.observable}
         * @bindable
         */
        animationTextBarcode = null;

        /**
         * This observable will be true, if the barcode scanning animation is to be displayed.
         * @type {function | ko.observable}
         * @bindable
         */
        viewFlexBarcodeScan = null;


        /**
         * This observable stores the label text for the qrcode scanning animation.
         * @type {function | ko.observable}
         * @bindable
         */
        animationTextQrcode = null;

        /**
         * This observable will be true, if the barcode scanning animation is to be displayed.
         * @type {function | ko.observable}
         * @bindable
         */
        viewFlexQrcodeScan = null;

        // DocumentScanning:

        /**
         * This observable stores the label text for the document scanning animation.
         * @type {function | ko.observable}
         * @bindable
         */
        animationTextDocumentScanning = null;

        /**
         * This observable will be true, if the document scanning animation is to be displayed.
         * @type {function | ko.observable}
         * @bindable
         */
        viewFlexDocumentScanning = null;

        /**
         * This observable will be true, if the document scanning with ID card front animation is to be displayed.
         * @type {function | ko.observable}
         * @bindable
         */
        viewFlexDocumentScanningIdCardFront = null;

        /**
         * This observable will be true, if the document scanning with ID card back animation is to be displayed.
         * @type {function | ko.observable}
         * @bindable
         */
        viewFlexDocumentScanningIdCardBack = null;

        /**
         * This observable will be true, if the document scanning with Driving license front animation is to be displayed.
         * @type {function | ko.observable}
         * @bindable
         */
        viewFlexDocumentScanningDrivingLicenseFront = null;

        /**
         * This observable will be true, if the document scanning with Driving license back animation is to be displayed.
         * @type {function | ko.observable}
         * @bindable
         */
        viewFlexDocumentScanningDrivingLicenseBack = null;

        // Signature
        /**
         * This observable stores the label text for the signature animation.
         * @type {function | ko.observable}
         * @bindable
         */
        animationTextSignature = null;

        /**
         * This observable will be true, if the signature animation with finger is to be displayed.
         * @type {function | ko.observable}
         * @bindable
         */
        viewFlexSignatureHand = null;

        /**
         * This observable will be true, if the signature animation with stylus is to be displayed.
         * @type {function | ko.observable}
         * @bindable
         */
        viewFlexSignatureStylus = null;

        /**
         * Overrides {@link Wincor.UI.Content.AnimationsViewModel#constructor}
         * Initializes the members to become observables.
         * @lifecycle viewmodel
         */
        constructor() {
            super();
            // Bar/QR - code:
            this.viewFlexBarcodeScan = ko.observable(false);
            this.animationTextBarcode = ko.observable("");
            this.viewFlexQrcodeScan = ko.observable(false);
            this.animationTextQrcode = ko.observable("");
            // DocumentScanning:
            this.animationTextDocumentScanning = ko.observable("");
            this.viewFlexDocumentScanning = ko.observable(false);
            this.viewFlexDocumentScanningIdCardFront = ko.observable(false);
            this.viewFlexDocumentScanningIdCardBack = ko.observable(false);
            this.viewFlexDocumentScanningDrivingLicenseFront = ko.observable(false);
            this.viewFlexDocumentScanningDrivingLicenseBack = ko.observable(false);
            // Signature
            this.viewFlexSignatureHand = ko.observable(false);
            this.viewFlexSignatureStylus = ko.observable(false);
        }

        /**
         * Overrides {@link Wincor.UI.Content.AnimationsViewModel#onDeactivated}
         * Is called when this viewmodel gets deactivated during the life-cycle.
         * @lifecycle viewmodel
         */
        onDeactivated() {
            this.logger.LOG_INOUT && this.logger.log(this.logger.LOG_INOUT, "> ScanCodeAnimationsViewModel::onDeactivated()");
            super.onDeactivated();
            // Bar/QR - code:
            this.viewFlexBarcodeScan(false);
            this.animationTextBarcode("");
            this.viewFlexQrcodeScan(false);
            this.animationTextQrcode("");
            // DocumentScanning:
            this.animationTextDocumentScanning("");
            this.viewFlexDocumentScanning(false);
            this.viewFlexDocumentScanningIdCardFront(false);
            this.viewFlexDocumentScanningIdCardBack(false);
            this.viewFlexDocumentScanningDrivingLicenseFront(false);
            this.viewFlexDocumentScanningDrivingLicenseBack(false);
            // Signature
            this.viewFlexSignatureHand(false);
            this.viewFlexSignatureStylus(false);
            this.logger.LOG_INOUT && this.logger.log(this.logger.LOG_INOUT, "< ScanCodeAnimationsViewModel::onDeactivated()");
        }
        
        /**
         * Initializes the DOM-associated objects.
         * Overrides {@link Wincor.UI.Content.AnimationsViewModel#observe}
         * @param {String} observableAreaId The area id to observe via knockout
         * @lifecycle viewmodel
         */
        observe(observableAreaId) {
            this.logger.LOG_ANALYSE && this.logger.log(this.logger.LOG_ANALYSE, `> ScanCodeAnimationsViewModel::observe(${observableAreaId})`);
            super.observe(observableAreaId);
            if(this.designMode) {
                this.viewFlexBarcodeScan(true);
                this.animationTextBarcode("Barcode");
                this.viewFlexQrcodeScan(true);
                this.animationTextQrcode("QR-Code");
            }
            this.logger.LOG_INOUT && this.logger.log(this.logger.LOG_INOUT, "< ScanCodeAnimationsViewModel::observe");
        }

        /**
         * Sets the proper animation content depending on the given result array:
         * <ul>
         *     <li>ScanBarcode</li>
         *     <li>ScanQrcode</li>
         *     <li>Document</li>
         *     <li>IdCardFront</li>
         *     <li>IdCardBack</li>
         *     <li>DrivingLicenseFront</li>
         *     <li>DrivingLicenseBack</li>
         *     <li>SignatureHand</li>
         *     <li>SignatureStylus</li>
         * </ul>
         * @param {Array<String>} resultArray The result content keys
         */
        setAnimations(resultArray) {
            this.logger.LOG_INOUT && this.logger.log(this.logger.LOG_INOUT, "> ScanCodeAnimationsViewModel::setAnimations(" + resultArray + ")");

            // Bar/QR - code:
            this.viewFlexBarcodeScan(this.isAvailable(resultArray, "ScanBarcode"));
            this.viewFlexQrcodeScan(this.isAvailable(resultArray, "ScanQrcode"));
            // DocumentScanning:
            this.viewFlexDocumentScanning(this.isAvailable(resultArray, "Document"));
            this.viewFlexDocumentScanningIdCardFront(this.isAvailable(resultArray, "IdCardFront"));
            this.viewFlexDocumentScanningIdCardBack(this.isAvailable(resultArray, "IdCardBack"));
            this.viewFlexDocumentScanningDrivingLicenseFront(this.isAvailable(resultArray, "DrivingLicenseFront"));
            this.viewFlexDocumentScanningDrivingLicenseBack(this.isAvailable(resultArray, "DrivingLicenseBack"));
            // Signature
            this.viewFlexSignatureHand(this.isAvailable(resultArray, "SignatureHand"));
            if(!this.viewFlexSignatureHand()) { // preventing from setting both observables true, if someone configured both content keys together
                this.viewFlexSignatureStylus(this.isAvailable(resultArray, "SignatureStylus"));
            }

            this.logger.LOG_INOUT && this.logger.log(this.logger.LOG_INOUT, "< ScanCodeAnimationsViewModel::setAnimations");
            super.setAnimations(resultArray);
        }

        /**
         * Overrides {@link Wincor.UI.Content.AnimationsViewModel#onTextReady}
         * Depending on the value of each 'AnimationText_xyz' textkey, the animation observables are set.
         *
         * @param {Object} result Contains the key:value pairs of text previously retrieved by this view-model subclass.
         * @lifecycle viewmodel
         * @See {@link Wincor.UI.Content.AnimationsViewModel#onTextReady}.
         */
        onTextReady(result) {
            this.logger.LOG_INOUT && this.logger.log(this.logger.LOG_INOUT, "> ScanCodeAnimationsViewModel::onTextReady(...)");
            for(let key in result) {
                if(result.hasOwnProperty(key)) {
                    if(key.indexOf("AnimationText_ScanBarcode") !== -1) {
                        this.logger.LOG_DETAIL && this.logger.log(this.logger.LOG_DETAIL, `. setting animationTextBarcode to ${result[key]}`);
                        this.animationTextBarcode(result[key]);
                    } else if(key.indexOf("AnimationText_ScanQrcode") !== -1) {
                        this.logger.LOG_DETAIL && this.logger.log(this.logger.LOG_DETAIL, `. setting animationTextQrcode to ${result[key]}`);
                        this.animationTextQrcode(result[key]);
                    } else if(key.indexOf("AnimationText_DocumentScanning") !== -1) {
                        this.logger.LOG_DETAIL && this.logger.log(this.logger.LOG_DETAIL, `. setting animationTextDocumentScanning to ${result[key]}`);
                        this.animationTextDocumentScanning(result[key]);
                    }
                }
            }
            super.onTextReady(result);
            this.logger.LOG_INOUT && this.logger.log(this.logger.LOG_INOUT, "< ScanCodeAnimationsViewModel::onTextReady");
        }
    }
});
