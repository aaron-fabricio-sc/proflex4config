/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ PrinterAnimationsViewModel.js 4.3.1-210127-21-34ae33df-1a04bc7d
 */

define(["knockout", "vm/AnimationsViewModel"], function(ko) {
    "use strict";

    const _logger = Wincor.UI.Service.Provider.LogProvider;

    /**
     * Deriving from {@link Wincor.UI.Content.AnimationsViewModel} class. <BR>
     * This viewmodel treats different printer types like receipt and document printer.
     * @class
     */
    Wincor.UI.Content.PrinterAnimationsViewModel = class PrinterAnimationsViewModel extends Wincor.UI.Content.AnimationsViewModel {

        /**
         * This observable stores the label text for the document printer animation.
         * @type {function | ko.observable}
         * @bindable
         */
        animationTextDocument = null;

        /**
         * This observable stores the label text for the receipt printer animation.
         * @type {function | ko.observable}
         * @bindable
         */
        animationTextReceipt = null;

        /**
         * This observable stores the label text for the electronic receipt animation.
         * @type {function | ko.observable}
         * @bindable
         */
        animationTextElectronicReceipt = null;

        /**
         * This observable will be true, if the document printer animation is to be displayed.
         * @type {function | ko.observable}
         * @bindable
         */
        viewFlexDocument = null;

        /**
         * This observable will be true, if the receipt printer animation is to be displayed.
         * @type {function | ko.observable}
         * @bindable
         */
        viewFlexReceipt = null;

        /**
         * This observable will be true, if the electronic receipt animation is to be displayed.
         * @type {function | ko.observable}
         * @bindable
         */
        viewFlexElectronicReceipt = null;

        /**
         * Overrides {@link Wincor.UI.Content.AnimationsViewModel#constructor}
         * Initializes the members to become observables.
         * @lifecycle viewmodel
         */
        constructor() {
            super();
            this.viewFlexDocument = ko.observable(false);
            this.viewFlexReceipt = ko.observable(false);
            this.viewFlexElectronicReceipt = ko.observable(false);
            this.animationTextDocument = ko.observable("");
            this.animationTextReceipt = ko.observable("");
            this.animationTextElectronicReceipt = ko.observable("");
        }
        
        /**
         * Overrides {@link Wincor.UI.Content.AnimationsViewModel#onDeactivated}
         * Is called when this viewmodel gets deactivated during the life-cycle.
         * Overridden to clear data list items, flags and counter.
         * @lifecycle viewmodel
         */
        onDeactivated() {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> PrinterAnimationsViewModel::onDeactivated()");
            super.onDeactivated();
            this.viewFlexDocument(false);
            this.viewFlexReceipt(false);
            this.viewFlexElectronicReceipt(false);
            this.animationTextDocument("");
            this.animationTextReceipt("");
            this.animationTextElectronicReceipt("");
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< PrinterAnimationsViewModel::onDeactivated()");
        }

        /**
         * Initializes the DOM-associated objects.
         * Overrides {@link Wincor.UI.Content.AnimationsViewModel#observe}
         * @param {String} observableAreaId The area id to observe via knockout
         * @lifecycle viewmodel
         */
        observe(observableAreaId) {
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `> PrinterAnimationsViewModel::observe(${observableAreaId})`);
            super.observe(observableAreaId);
            if(this.designMode) {
                this.viewFlexDocument(true);
                this.viewFlexReceipt(true);
                this.viewFlexElectronicReceipt(true);
                this.animationTextDocument("Statement");
                this.animationTextReceipt("Receipt");
                this.animationTextElectronicReceipt("Electronic Receipt");
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< PrinterAnimationsViewModel::observe");
        }

        /**
         * Sets the proper animation content depending on the given result array:
         * <ul>
         *     <li>TakeStatement</li>
         *     <li>TakeReceipt</li>
         *     <li>SendReceipt</li>
         * </ul>
         * @param {Array<String>} resultArray   The result content keys
         */
        setAnimations(resultArray) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `> PrinterAnimationsViewModel::setAnimations(${resultArray})`);
            // document
            this.viewFlexDocument(this.isAvailable(resultArray, "TakeStatement"));
            // receipt
            this.viewFlexReceipt(this.isAvailable(resultArray, "TakeReceipt"));
            // electronic receipt
            this.viewFlexElectronicReceipt(this.isAvailable(resultArray, "SendReceipt"));

            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< PrinterAnimationsViewModel::setAnimations");
            super.setAnimations(resultArray);
        }

        /**
         * Overrides {@link Wincor.UI.Content.AnimationsViewModel#onTextReady}
         * Depending on the value of each 'AnimationText_xyz' textkey, the animation observables are set.
         *
         * @param {Object} result Contains the key:value pairs of text previously retrieved by this view-model subclass.
         * @lifecycle viewmodel
         */
        onTextReady(result) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> PrinterAnimationsViewModel::onTextReady(...)");
            for(let key in result) {
                if(result.hasOwnProperty(key)) {
                    if(key.indexOf("AnimationText_TakeReceipt") !== -1) {
                        // map all Coins derivations to corresponding text observable
                        _logger.log(_logger.LOG_DETAIL, ". setting animationTextReceipt to " + result[key]);
                        this.animationTextReceipt(result[key]);
                    }
                    else if(key.indexOf("AnimationText_TakeStatement") !== -1) {
                        // map all Coins derivations to corresponding text observable
                        _logger.log(_logger.LOG_DETAIL, ". setting animationTextDocument to " + result[key]);
                        this.animationTextDocument(result[key]);
                    }
                    else if(key.indexOf("AnimationText_SendReceipt") !== -1) {
                        // map all Coins derivations to corresponding text observable
                        _logger.log(_logger.LOG_DETAIL, ". setting animationTextElectronicReceipt to " + result[key]);
                        this.animationTextElectronicReceipt(result[key]);
                    }
                }
            }
            super.onTextReady(result);
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< PrinterAnimationsViewModel::onTextReady");
        }
    }
});
