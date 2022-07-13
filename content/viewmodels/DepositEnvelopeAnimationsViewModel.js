/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ DepositEnvelopeAnimationsViewModel.js 4.3.1-210127-21-34ae33df-1a04bc7d
 */

define(["knockout", "vm/AnimationsViewModel"], function(ko) {
    "use strict";

    const _logger = Wincor.UI.Service.Provider.LogProvider;

    /**
     * Deriving from {@link Wincor.UI.Content.AnimationsViewModel} class. <BR>
     * This viewmodel handles the envelope animations.
     * @class
     */
    Wincor.UI.Content.DepositEnvelopeAnimationsViewModel = class DepositEnvelopeAnimationsViewModel extends Wincor.UI.Content.AnimationsViewModel {


        /**
         * This observable stores the label text for the envelope eject animation.
         * @type {function | ko.observable}
         * @bindable
         */
        animationTextTakeEnvelope = null;

        /**
         * This observable stores the label text for the envelope insert animation.
         * @type {function | ko.observable}
         * @bindable
         */
        animationTextInsertEnvelope = null;

        /**
         * This observable will be true, if the envelope eject animation is to be displayed.
         * @type {function | ko.observable}
         * @bindable
         */
        viewFlexEnvelopeEject = null;

        /**
         * This observable will be true, if the envelope insert animation is to be displayed.
         * @type {function | ko.observable}
         * @bindable
         */
        viewFlexEnvelopeInsert = null;

        /**
         * This observable will be true, if the envelope insert money animation is to be displayed.
         * @type {function | ko.observable}
         * @bindable
         */
        viewFlexEnvelopeInsertMoney = null;

        /**
         * This observable will be true, if the envelope insert cheques animation is to be displayed.
         * @type {function | ko.observable}
         * @bindable
         */
        viewFlexEnvelopeInsertCheques = null;

        /**
         * This observable will be true, if the envelope insert money and cheques animation is to be displayed.
         * @type {function | ko.observable}
         * @bindable
         */
        viewFlexEnvelopeInsertMoneyCheques = null;

        /**
         * Overrides {@link Wincor.UI.Content.AnimationsViewModel#constructor}
         * Initializes the members to become  observables.
         * @lifecycle viewmodel
         */
        constructor() {
            super();
            this.viewFlexEnvelopeEject = ko.observable(false);
            this.viewFlexEnvelopeInsert = ko.observable(false);
            this.viewFlexEnvelopeInsertMoney = ko.observable(false);
            this.viewFlexEnvelopeInsertCheques = ko.observable(false);
            this.viewFlexEnvelopeInsertMoneyCheques = ko.observable(false);
            this.animationTextTakeEnvelope = ko.observable("");
            this.animationTextInsertEnvelope = ko.observable("");
        }
        
        /**
         * Overrides {@link Wincor.UI.Content.AnimationsViewModel#onDeactivated}
         * Is called when this viewmodel gets deactivated during the life-cycle.
         * @lifecycle viewmodel
         */
        onDeactivated() {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> DepositEnvelopeAnimationsViewModel::onDeactivated()");
            super.onDeactivated();
            this.viewFlexEnvelopeEject(false);
            this.viewFlexEnvelopeInsert(false);
            this.viewFlexEnvelopeInsertMoney(false);
            this.viewFlexEnvelopeInsertCheques(false);
            this.viewFlexEnvelopeInsertMoneyCheques(false);
            this.animationTextTakeEnvelope("");
            this.animationTextInsertEnvelope("");
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< DepositEnvelopeAnimationsViewModel::onDeactivated()");
        }

        /**
         * Initializes the DOM-associated objects.
         * Overrides {@link Wincor.UI.Content.AnimationsViewModel#observe}
         * @param {String} observableAreaId The area id to observe via knockout
         * @lifecycle viewmodel
         */
        observe(observableAreaId) {
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `> DepositEnvelopeAnimationsViewModel::observe(${observableAreaId})`);
            super.observe(observableAreaId);
            if(this.designMode) {
                this.viewFlexEnvelopeEject(true);
                this.viewFlexEnvelopeInsert(true);
                this.animationTextTakeEnvelope("Envelope");
                this.animationTextInsertEnvelope("Envelope");
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< DepositEnvelopeAnimationsViewModel::observe");
        }

        /**
         * Sets the proper animation content depending on the given result array:
         * <ul>
         *     <li>TakeEnvelope</li>
         *     <li>InsertEnvelope</li>
         *     <li>InsertEnvelopeMoney</li>
         *     <li>InsertEnvelopeCheques</li>
         *     <li>InsertEnvelopeMoneyCheques</li>*
         * </ul>
         * @param {Array<String>} resultArray The result content keys
         */
        setAnimations(resultArray) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> DepositEnvelopeAnimationsViewModel::setAnimations(" + resultArray + ")");

            this.viewFlexEnvelopeEject(this.isAvailable(resultArray, "TakeEnvelope"));
            this.viewFlexEnvelopeInsert(this.isAvailable(resultArray, "InsertEnvelope"));
            this.viewFlexEnvelopeInsertMoney(this.isAvailable(resultArray, "InsertEnvelopeMoney"));
            this.viewFlexEnvelopeInsertCheques(this.isAvailable(resultArray, "InsertEnvelopeCheques"));
            this.viewFlexEnvelopeInsertMoneyCheques(this.isAvailable(resultArray, "InsertEnvelopeMoneyCheques"));

            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< DepositEnvelopeAnimationsViewModel::setAnimations");
            super.setAnimations(resultArray);
        }

        /**
         * Overrides {@link Wincor.UI.Content.AnimationsViewModel#onInitTextAndData}
         * @param {Object} args Contains the attributes 'textKeys' {array.<string|promise>} and 'dataKeys' {array.<string|promise>}, which should be filled up by the viewmodel.
         * @lifecycle viewmodel
         */
        onInitTextAndData(args) {
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, "> MobileAnimationsViewModel::onInitTextAndData(" + JSON.stringify(args) + ")");
            if(this.designMode) {
                args.dataKeys.push(this.designTimeRunner.retrieveJSONData("DepositEnvelopeData")
                    .then(data => {
                        this.viewFlexEnvelopeEject(data.takeEnvelope);
                        this.viewFlexEnvelopeInsert(data.insertEnvelope);
                        this.viewFlexEnvelopeInsertMoney(data.insertEnvelopeMoney);
                        this.viewFlexEnvelopeInsertCheques(data.insertEnvelopeCheques);
                        this.viewFlexEnvelopeInsertMoneyCheques(data.insertEnvelopeMoneyCheques);
                        this.animationTextTakeEnvelope(data.animationTextTakeEnvelope);
                        this.animationTextInsertEnvelope(data.animationTextInsertEnvelope);
                    }));
            }
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, "< MobileAnimationsViewModel::onInitTextAndData");
            return super.onInitTextAndData(args);
        }

        /**
         * Overrides {@link Wincor.UI.Content.AnimationsViewModel#onTextReady}
         * Depending on the value of each 'AnimationText_xyz' textkey, the animation observables are set.
         *
         * @param {Object} result Contains the key:value pairs of text previously retrieved by this view-model subclass.
         * @lifecycle viewmodel
         */
        onTextReady(result) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> DepositEnvelopeAnimationsViewModel::onTextReady(...)");
            for(var key in result) {
                if(result.hasOwnProperty(key)) {
                    if(key.indexOf("AnimationText_TakeEnvelope") !== -1) {
                        this.animationTextTakeEnvelope(result[key]);
                    }
                    else if(key.indexOf("AnimationText_InsertEnvelope") !== -1) {
                        this.animationTextInsertEnvelope(result[key]);
                    }
                }
            }
            super.onTextReady(result);
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< DepositEnvelopeAnimationsViewModel::onTextReady");
        }
    }
});
