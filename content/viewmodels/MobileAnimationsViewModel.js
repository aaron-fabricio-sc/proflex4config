/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ MobileAnimationsViewModel.js 4.3.1-210127-21-34ae33df-1a04bc7d
 */
define(["knockout", "vm/AnimationsViewModel"], function (ko) {
    "use strict";

    const _logger = Wincor.UI.Service.Provider.LogProvider;

    /**
     * Deriving from {@link Wincor.UI.Content.AnimationsViewModel} class. <BR>
     * This viewmodel handles several card animations.
     * @class
     */
    Wincor.UI.Content.MobileAnimationsViewModel = class MobileAnimationsViewModel extends Wincor.UI.Content.AnimationsViewModel {


        /**
         * This observable will be true, if the contactless insert animation is to be displayed.
         * @type {ko.observable}
         * @bindable
         */
        viewFlexMobileNfc = null;

        /**
         * This observable will be true, if the not operational Nfc reader image is to be displayed.
         * @type {ko.observable}
         * @bindable
         */
        viewFlexMobileNfcNotOperational = null;


        /**
         * This observable stores the label text for the mobile animation.
         * @type {ko.observable}
         * @bindable
         */
        animationTextMobileNfc = null;

        /**
         * Overrides {@link Wincor.UI.Content.AnimationsViewModel#constructor}
         * Initializes the members to become  observables.
         * Registers for the card event <code>TRANSACTION_MODULE</code>
         * @lifecycle viewmodel
         */
        constructor() {
            super();
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> MobileAnimationsViewModel");
            this.viewFlexMobileNfc = ko.observable(false);
            this.viewFlexMobileNfcNotOperational = ko.observable(false);
            this.animationTextMobileNfc = ko.observable("");
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< MobileAnimationsViewModel");
        }
        
        /**
         * Overrides {@link Wincor.UI.Content.AnimationsViewModel#onDeactivated}
         * Is called when this viewmodel gets deactivated during the life-cycle.
         * @lifecycle viewmodel
         */
        onDeactivated() {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> MobileAnimationsViewModel::onDeactivated()");
            super.onDeactivated();
            this.viewFlexMobileNfc(false);
            this.viewFlexMobileNfcNotOperational(false);
            this.animationTextMobileNfc("");
            this.viewHelper.removeWaitSpinner();
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< MobileAnimationsViewModel::onDeactivated()");
        }

        /**
         * Initializes the DOM-associated objects.
         * Overrides {@link Wincor.UI.Content.AnimationsViewModel#observe}
         * @param {String} observableAreaId     The area id to observe via knockout
         * @lifecycle viewmodel
         */
        observe(observableAreaId) {
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `> MobileAnimationsViewModel::observe(${observableAreaId})`);
            // first switch off default message handling. This means that in DesignMode we use
            // the default message handling of the MessageViewModel. In 'real mode' we override
            // the default message handling, because we dynamically have to change the visibility.
            // no need for initTextAndData() ... done by AnimationsViewModel
            this.isDefaultMessageHandling = this.designMode;
            super.observe(observableAreaId);
            if(this.designMode) {
                this.viewFlexMobileNfc(true);
                this.viewFlexMobileNfcNotOperational(false);
                this.animationTextMobileNfc("Mobile Nfc");
            }

            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< MobileAnimationsViewModel::observe");
        }

        /**
         * Sets the proper animation content depending on the given result array:
         * <ul>
         *     <li>MobileNfC</li>
         *     <li>MobileNfcNotOperational</li>
         * </ul>
         * @param {Array<String>} resultArray   The result content keys
         */
        setAnimations(resultArray) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> MobileAnimationsViewModel::setAnimations(" + resultArray + ")");
            // Mobile Animations:
            this.viewFlexMobileNfc(this.isAvailable(resultArray, "MobileNfc"));
            this.viewFlexMobileNfcNotOperational(this.isAvailable(resultArray, "MobileNfcNotOperational"));
            super.setAnimations(resultArray);
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< MobileAnimationsViewModel::setAnimations");
        }

        /**
         * Overrides {@link Wincor.UI.Content.AnimationsViewModel#onInitTextAndData}
         * @param {Object} args Contains the attributes 'textKeys' {array.<string|promise>} and 'dataKeys' {array.<string|promise>}, which should be filled up by the viewmodel.
         * @lifecycle viewmodel
         */
        onInitTextAndData(args) {
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, "> MobileAnimationsViewModel::onInitTextAndData(" + JSON.stringify(args) + ")");
            if(this.designMode) {
                args.dataKeys.push(this.designTimeRunner.retrieveJSONData("MobileNfcData")
                    .then(data => {
                        this.viewFlexMobileNfc(data.mobileNfc);
                        this.viewFlexMobileNfcNotOperational(data.mobileNfcNotOperational);
                        this.animationTextMobileNfc(data.animationTextMobileNfc);
                }));
            }
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, "< MobileAnimationsViewModel::onInitTextAndData");
            return super.onInitTextAndData(args);
        }

        /**
         * Overrides {@link Wincor.UI.Content.AnimationsViewModel#onTextReady}
         * Depending on the value of each 'AnimationText_xyz' textkey, the animation observables are set.
         *
         * @param {Object} result       Contains the key:value pairs of text previously retrieved by this view-model subclass.
         * @lifecycle viewmodel
         */
        onTextReady(result) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> MobileAnimationsViewModel::onTextReady()");
            for(let key in result) {
                if(result.hasOwnProperty(key)) {
                    if (key.indexOf("AnimationText_MobileNfc") !== -1) {
                        this.animationTextMobileNfc(result[key]);
                    }
                }
            }
            super.onTextReady(result);
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< MobileAnimationsViewModel::onTextReady");
        }
    }
});
