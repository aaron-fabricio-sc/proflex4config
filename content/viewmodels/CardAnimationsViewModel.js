/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ CardAnimationsViewModel.js 4.3.1-210127-21-34ae33df-1a04bc7d
 */
define(["knockout", "config/Config", "vm/AnimationsViewModel"], function (ko, config) {
    "use strict";

    const _logger = Wincor.UI.Service.Provider.LogProvider;
    const _eventService = Wincor.UI.Service.Provider.EventService;
    // const _utiService = Wincor.UI.Service.Provider.UtilityService;

    const EVENT_INFO = _eventService.getEventInfo("TRANSACTION_MODULE");

    /**
     * Deriving from {@link Wincor.UI.Content.AnimationsViewModel} class. <BR>
     * This viewmodel handles several card animations.
     * @class
     */
    Wincor.UI.Content.CardAnimationsViewModel = class CardAnimationsViewModel extends Wincor.UI.Content.AnimationsViewModel {

        /**
         * This observable will be true, if the card insert animation is to be displayed.
         * @type {function | ko.observable}
         * @bindable
         */
        viewFlexCardInsert = null;

        /**
         * This observable will be true, if the not operational card reader image is to be displayed.
         * @type {function | ko.observable}
         * @bindable
         */
        viewFlexCardNotOperational = null;

        /**
         * This observable will be true, if the contactless insert animation is to be displayed.
         * @type {function | ko.observable}
         * @bindable
         */
        viewFlexContactlessInsert = null;

        /**
         * This observable will be true, if the not operational contactless reader image is to be displayed.
         * @type {function | ko.observable}
         * @bindable
         */
        viewFlexContactlessNotOperational = null;

        /**
         * This observable will be true, if the card eject animation is to be displayed.
         * @type {function | ko.observable}
         * @bindable
         */
        viewFlexCardEject = null;

        /**
         * This observable stores the label text for the card animation.
         * @type {function | ko.observable}
         * @bindable
         */
        animationTextCard = null;


        /**
         * This observable will be true, if the card insert animation with stripe up is to be displayed.
         * @type {function | ko.observable}
         * @bindable
         */
        viewFlexCardInsertStripeUp = null;

        /**
         * This observable will be true, if the card eject animation with stripe up is to be displayed.
         * @type {function | ko.observable}
         * @bindable
         */
        viewFlexCardEjectStripeUp = null;

        /**
         * This observable will be true, if the card insert animation with long side first is to be displayed.
         * @type {function | ko.observable}
         * @bindable
         */
        viewFlexCardInsertLSF = null;

        /**
         * This observable will be true, if the card eject animation with long side first is to be displayed.
         * @type {function | ko.observable}
         * @bindable
         */
        viewFlexCardEjectLSF = null;

        /**
         * This observable will be true, if the image / animation for the not operational long side first card reader is to be displayed.
         * @type {function | ko.observable}
         * @bindable
         */
        viewFlexCardLSFNotOperational = null;

        /**
         * Observable stores the value of the property CCTAFW_PROP_IDCU_TYPE:
         * <ul>
         *      <li> -1 = Push a softkey to start a transaction / reach the menu </li>
         *      <li> 0 = Motorized card reader. </li>
         *      <li> 1 = DIP card reader. </li>
         *      <li> 2 = Swipe card reader. </li>
         *      <li> 3 = Contactless card reader. </li>
         *      <li> 4 = DIP card reader. </li>
         *      <li> all others = Normal animation like the one for the motorized card reader. </li>
         *      <li> The default value is null. </li>
         * </ul>
         * @type {ko.observable | function}
         * @bindable
         */
        cardDeviceType = ko.observable(0);

        stopDMOnDipEvent = null;

        /**
         * Overrides {@link Wincor.UI.Content.AnimationsViewModel#constructor}
         * Initializes the members to become  observables.
         * Registers for the card event <code>TRANSACTION_MODULE</code>
         * @lifecycle viewmodel
         */
        constructor() {
            super();
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> CardAnimationsViewModel");
            this.viewFlexCardInsert = ko.observable(false);
            this.viewFlexCardInsertStripeUp = ko.observable(false);
            this.viewFlexCardInsertLSF = ko.observable(false);
            this.viewFlexCardNotOperational = ko.observable(false);
            this.viewFlexCardLSFNotOperational = ko.observable(false);
            this.viewFlexContactlessInsert = ko.observable(false);
            this.viewFlexContactlessNotOperational = ko.observable(false);
            this.viewFlexCardEject = ko.observable(false);
            this.viewFlexCardEjectStripeUp = ko.observable(false);
            this.viewFlexCardEjectLSF = ko.observable(false);
            this.animationTextCard = ko.observable("");
            this.cardDeviceType(0);
            this.eventRegistrations.push( {
                eventNumber: EVENT_INFO.ID_CARD,
                eventOwner: EVENT_INFO.NAME
            });
            this.stopDMOnDipEvent = ko.observable(true);

            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< CardAnimationsViewModel");
        }
        
        /**
         * Overrides {@link Wincor.UI.Content.AnimationsViewModel#onDeactivated}
         * Is called when this viewmodel gets deactivated during the life-cycle.
         * @lifecycle viewmodel
         */
        onDeactivated() {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> CardAnimationsViewModel::onDeactivated()");
            super.onDeactivated();
            this.viewFlexCardInsert(false);
            this.viewFlexCardInsertStripeUp(false);
            this.viewFlexCardInsertLSF(false);
            this.viewFlexCardNotOperational(false);
            this.viewFlexCardLSFNotOperational(false);
            this.viewFlexContactlessInsert(false);
            this.viewFlexContactlessNotOperational(false);
            this.viewFlexCardEject(false);
            this.viewFlexCardEjectLSF(false);
            this.viewFlexCardEjectStripeUp(false);
            this.animationTextCard("");
            // event
            this.eventRegistrations.push( {
                eventNumber: EVENT_INFO.ID_CARD,
                eventOwner: EVENT_INFO.NAME
            });
            this.viewHelper.removeWaitSpinner();
            this.stopDMOnDipEvent(false);
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< CardAnimationsViewModel::onDeactivated()");
        }
        
        /**
         * Initializes the DOM-associated objects.
         * Overrides {@link Wincor.UI.Content.AnimationsViewModel#observe}
         * @param {string} observableAreaId     The area id to observe via knockout
         * @lifecycle viewmodel
         */
        observe(observableAreaId) {
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `> CardAnimationsViewModel::observe(${observableAreaId})`);
            // first switch off default message handling. This means that in DesignMode we use
            // the default message handling of the MessageViewModel. In 'real mode' we override
            // the default message handling, because we dynamically have to change the visibility.
            // no need for initTextAndData() ... done by AnimationsViewModel
            this.isDefaultMessageHandling = this.designMode;
            super.observe(observableAreaId);

            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< CardAnimationsViewModel::observe");
        }

        /**
         * Sets the proper animation content depending on the given result array:
         * <ul>
         *     <li>TakeCard</li>
         *     <li>TakeCardStripeUp</li>
         *     <li>TakeCardLongSideFirst</li>
         *     <li>InsertCard</li>
         *     <li>InsertCardStripeUp</li>
         *     <li>InsertCardLongSideFirst</li>
         *     <li>CardNotOperational</li>
         *     <li>CardLongSideFirstNotOperational</li>
         *     <li>InsertContactless</li>
         *     <li>ContactlessNotOperational</li>
         *     <li>InsertCard</li>
         * </ul>
         * @param {Array<String>} resultArray   The result content keys
         */
        setAnimations(resultArray) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `> CardAnimationsViewModel::setAnimations(${resultArray})`);
            //Card Animations:
            this.viewFlexCardEject(this.isAvailable(resultArray, "TakeCard"));
            this.viewFlexCardEjectStripeUp(this.isAvailable(resultArray, "TakeCardStripeUp"));
            this.viewFlexCardEjectLSF(this.isAvailable(resultArray, "TakeCardLongSideFirst"));
            this.viewFlexCardInsert(this.isAvailable(resultArray, "InsertCard"));
            this.viewFlexCardInsertStripeUp(this.isAvailable(resultArray, "InsertCardStripeUp"));
            this.viewFlexCardInsertLSF(this.isAvailable(resultArray, "InsertCardLongSideFirst"));
            this.viewFlexCardNotOperational(this.isAvailable(resultArray, "CardNotOperational"));
            this.viewFlexCardLSFNotOperational(this.isAvailable(resultArray, "CardLongSideFirstNotOperational"));
            this.viewFlexContactlessInsert(this.isAvailable(resultArray, "InsertContactless"));
            this.viewFlexContactlessNotOperational(this.isAvailable(resultArray, "ContactlessNotOperational"));
            super.setAnimations(resultArray);
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< CardAnimationsViewModel::setAnimations");
        }

        /**
         * Overrides {@link Wincor.UI.Content.AnimationsViewModel#onInitTextAndData}
         * @param {Object} args Contains the attributes 'textKeys' {array.<string|promise>} and 'dataKeys' {array.<string|promise>}, which should be filled up by the viewmodel.
         * @lifecycle viewmodel
         */
        onInitTextAndData(args) {
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `> CardAnimationsViewModel::onInitTextAndData(${JSON.stringify(args)})`);

            if(!this.designMode) {
                let conf = this.viewConfig.config;
                if (conf && conf.stopDMOnDipEvent !== void 0 && conf.stopDMOnDipEvent !== null) {
                    _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `. CardAnimationsViewModel::onInitTextAndData viewConf=${JSON.stringify(conf)}`);
                    this.stopDMOnDipEvent(this.vmHelper.convertToBoolean(conf.stopDMOnDipEvent));
                }
                _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `. CardAnimationsViewModel::onInitTextAndData this.stopDMOnDipEvent ${this.stopDMOnDipEvent()}`);
            } else {
                  args.dataKeys.push(this.designTimeRunner.retrieveJSONData("CardItemsData")
                       .then(data => {
                             this.viewFlexCardInsert(data.insertCard);
                             this.viewFlexCardInsertStripeUp(data.insertCardStripeUp);
                             this.viewFlexCardInsertLSF(data.insertCardLSF);
                             this.viewFlexContactlessInsert(data.insertContactless);
                             this.viewFlexCardEject(data.ejectCard);
                             this.viewFlexCardEjectStripeUp(data.ejectCardStripeUp);
                             this.viewFlexCardEjectLSF(data.ejectCardLSF);
                             this.viewFlexCardNotOperational(data.cardNotOperational);
                             this.viewFlexCardLSFNotOperational(data.cardLSFNotOperational);
                             this.viewFlexContactlessNotOperational(data.contactlessNotOperational);
                             this.animationTextCard(data.animationTextCard);
                             if (this.viewKey === "CardPresentation") {
                                 this.viewFlexCardEject(true);
                                 this.viewFlexCardInsert(false);
                                 this.viewFlexContactlessInsert(false);
                             }
                       }));
            }

            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, "< CardAnimationsViewModel::onInitTextAndData");
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
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> CardAnimationsViewModel::onTextReady()");
            for(let key in result) {
                if(result.hasOwnProperty(key) && result[key] !== undefined && result[key] !== null) {
                    if(key.indexOf("AnimationText_TakeCard") !== -1 || key.indexOf("AnimationText_InsertCard") !== -1) {
                        this.animationTextCard(result[key]);
                    }
                }
            }
            super.onTextReady(result);
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< CardAnimationsViewModel::onTextReady");
        }

        /**
         * Called if any of the events of this.eventRegistrations is raised.
         * Disables the enabled buttons when the card is inserted or DIP inserted.
         * Calls dmStop() function in case of DIP Insert event
         * @param {String} eventData     The contents of the event (ASCII expected)
         * @param {number} eventID       The ID of the event
         * @param {String} eventOwner    The owner of the event, currently not used by this function to build the text keys
         * @eventhandler
         */
        onContentChangeEvent(eventData, eventID, eventOwner) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `> CardAnimationsViewModel::onContentChangeEvent(${eventData}, ${eventID}, ${eventOwner})`);
            if(eventData === "INSERT" || eventData === "INSERT_DIP") {
                // must deactivate all currently available commands when card has been inserted or dipped.
                // This is because the insert event is faster then the suspend of the view key change
                // it is important to set only commands of our own observable area!
                this.cmdRepos.setActive(this.cmdRepos.getCommandsByViewModel(this)
                    .map((cmd) => {
                        return cmd.id;
                    })
                    .filter(id => {
                        return this.cmdRepos.getViewState(id) === this.CMDSTATE.ENABLED;
                    }), false);

                // in case of DIP card reader stop DM animation
                _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `config.isDirectMarketingAvailable: ${config.isDirectMarketingAvailable}, this.stopDMOnDipEvent: ${this.stopDMOnDipEvent()}`);
                if(config.isDirectMarketingAvailable && this.stopDMOnDipEvent() && eventData === "INSERT_DIP") {
                    this.serviceProvider.UtilityService.dmStop();
                }
            }
            super.onContentChangeEvent(eventData, eventID, eventOwner);
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< CardAnimationsViewModel::onContentChangeEvent");
        }
    }
});
