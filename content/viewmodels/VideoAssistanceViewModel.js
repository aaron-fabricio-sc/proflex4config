/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ VideoAssistanceViewModel.js 4.3.1-210127-21-34ae33df-1a04bc7d
 */


define(["knockout", "vm/AnimationsViewModel"], function(ko) {
    "use strict";
    
    const _logger = Wincor.UI.Service.Provider.LogProvider;
    const PROP_VIDEO_REQUEST_TELLERNAME = "PROP_VIDEO_REQUEST_TELLERNAME";

    /**
     * This is the VideoAssistanceViewModel class.
     * Deriving from {@link Wincor.UI.Content.AnimationsViewModel} class.
     * @class
     */
    Wincor.UI.Content.VideoAssistanceViewModel = class VideoAssistanceViewModel extends Wincor.UI.Content.AnimationsViewModel {

        /**
         * Overrides {@link Wincor.UI.Content.AnimationsViewModel#constructor}
         * Initializes the members to become observables.
         * @lifecycle viewmodel
         */
        constructor() {
            super();
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> VideoAssistanceViewModel");

            this.connectionText = ko.observable("");
            this.muteSwitch = ko.observable(false);
            this.tellerName = ko.observable("");

            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< VideoAssistanceViewModel");
        }

        /**
         * Handles the actions if the MUTE_SWITCH button has been pressed: <BR>
         * - calls the service provider functions of the video service: mute() or unmute() <BR>
         * - enables the the volume buttons VOL_PLUS and VOL_MINUS if the MUTE_SWITCH button is enabled <BR>
         */
        onMuteSwitchPressed() {
            _logger.LOG_INFO && _logger.log(_logger.LOG_INFO, `* VideoAssistanceViewModel::onMuteSwitchPressed(): muteSwitch= ${this.muteSwitch()}` );

            if ( this.muteSwitch() ) {
                // enable VOLUME buttons
                this.cmdRepos.whenAvailable("VOL_PLUS")
                    .then(() => {
                        this.cmdRepos.setActive("VOL_PLUS", true);
                    });
                this.cmdRepos.whenAvailable("VOL_MINUS")
                    .then(() => {
                        this.cmdRepos.setActive("VOL_MINUS", true);
                    });

                if ( !this.designMode ) {
                    this.serviceProvider.VideoService.unmute( null );
                }

            } else {
                // disable VOLUME buttons
                this.cmdRepos.whenAvailable("VOL_PLUS")
                    .then(() => {
                        this.cmdRepos.setActive("VOL_PLUS", false);
                    });
                this.cmdRepos.whenAvailable("VOL_MINUS")
                    .then(() => {
                        this.cmdRepos.setActive("VOL_MINUS", false);
                    });

                if ( !this.designMode ) {
                    this.serviceProvider.VideoService.mute( null );
                }
            }

            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, "< VideoAssistanceViewModel::onMuteSwitchPressed()" );
        }

        /**
         * Initializes the DOM-associated objects.
         * Overrides {@link Wincor.UI.Content.AnimationsViewModel#observe}
         * @param {String} observableAreaId     The area id to observe via knockout
         * @lifecycle viewmodel
         */
        observe(observableAreaId) {
            try {
                this.logger.log(this.logger.LOG_ANALYSE, `> VideoAssistanceViewModel::observe(${observableAreaId})`);
                super.observe(observableAreaId);
                this.logger.log(this.logger.LOG_INOUT, "< VideoAssistanceViewModel::observe");
            } catch (e) {
                this.logger.error(e);
            }
        }

        /**
         * Overrides {@link Wincor.UI.Content.BaseViewModel#onButtonPressed}
         * in order to handle certain commands for the video assistance view.
         * <p>
         * Handles the following on button pressed actions:<br>
         * <ul>
         *     <li>VOL_MINUS</li>
         *     <li>VOL_PLUS</li>
         *     <li>MUTE_SWITCH</li>
         * </ul>
         * </p>
         * @param {String} id the id of the command that was triggered
         * @eventhandler
         */
        onButtonPressed(id) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> VideoAssistanceViewModel::onButtonPressed()");

            if (!this.designMode) {
                //alert(id);

                if( id === "VOL_MINUS" ) {
                    // this.serviceProvider.AdaService.decreaseVolume( null );
                    this.serviceProvider.VideoService.decreaseVolume( null );

                } else if( id === "VOL_PLUS" ) {
                    // this.serviceProvider.AdaService.increaseVolume( null );
                    this.serviceProvider.VideoService.increaseVolume( null );
                } else if( id === "MUTE_SWITCH" ) {
                    this.onMuteSwitchPressed();
                } else {
                    super.onButtonPressed(id);
                }
            } else { // design mode
                if(id !== "VOL_MINUS" && id !== "VOL_PLUS" && id !== "MUTE_SWITCH") {
                    super.onButtonPressed(id);
                } else if (id ==="MUTE_SWITCH") {
                    this.onMuteSwitchPressed();
                }
            }

            _logger.log(_logger.LOG_INOUT, "< VideoAssistanceViewModel::onButtonPressed");
        }

        /**
         * Overrides {@link Wincor.UI.Content.AnimationsViewModel#onInitTextAndData}
         * @param {Object} args Contains the attributes 'textKeys' {array.<string|promise>} and 'dataKeys' {array.<string|promise>}, which should be filled up by the viewmodel.
         * @lifecycle viewmodel
         */
        onInitTextAndData(args) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> VideoAssistanceViewModel::onInitTextAndData()");

            if (this.designMode) { // design mode
                // get Connection text
                this.connectionText("You are connected to: Mrs Smith.");
                setTimeout(() => {
                    this.vmContainer.sendViewModelEvent(this.vmContainer.EVENT_ON_MESSAGE_AVAILABLE, {
                        messageText: this.connectionText(),
                        messageLevel: "InfoBox"
                    });
                }, 1000); // wait a time until the message will be shown
            } else {
                args.dataKeys.push(PROP_VIDEO_REQUEST_TELLERNAME);
            }

            _logger.log(_logger.LOG_INOUT, "< VideoAssistanceViewModel::onInitTextAndData");
            return super.onInitTextAndData(args);
        }

        /**
         * Overrides {@link Wincor.UI.Content.AnimationsViewModel#onDeactivated}
         * Is called when this viewmodel gets deactivated during the life-cycle.
         * @lifecycle viewmodel
         */
        onDeactivated() {
            super.onDeactivated();
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> VideoAssistanceViewModel::onDeactivated()");

            this.muteSwitch(false);
            this.connectionText("");
            this.tellerName("");

            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< VideoAssistanceViewModel::onDeactivated");
        }

        /**
         * Is called when the data promise of the {@link Wincor.UI.Content.VideoAssistanceViewModel#initTextAndData} call is resolved.
         * @param {Object} result Contains the key:value pairs of data previously retrieved by this view model subclass
         * @lifecycle viewmodel
         */
        onDataValuesReady(result) {
            _logger.log(_logger.LOG_INOUT, "> VideoAssistanceViewModel::onDataValuesReady(...)");

            this.updatePropData(result);

            _logger.log(_logger.LOG_INOUT, "< VideoAssistanceViewModel::onDataValuesReady");
        }

        /**
         * Is called after the {@link Wincor.UI.Content.VideoAssistanceViewModel#onDataValuesReady} provided that the <code>PROP_VIDEO_REQUEST_TELLERNAME</code>
         * data has been changed.
         * @param {Object} result Contains the key:value pairs of data previously retrieved by this view model subclass
         * @lifecycle viewmodel
         */
        onDataValuesChanged(result) {
            _logger.log(_logger.LOG_INOUT, "> VideoAssistanceViewModel::onDataValuesChanged(...)");

            this.updatePropData(result);

            _logger.log(_logger.LOG_INOUT, "< VideoAssistanceViewModel::onDataValuesChanged");
        }

        /**
         * Updates the {@link Wincor.UI.Content.VideoAssistanceViewModel#tellerName} by the <code>PROP_VIDEO_REQUEST_TELLERNAME</code>.
         * @param {Object} result Contains the key:value pairs of data previously retrieved by this view model subclass
         * @private
         */
        updatePropData(result) {
            _logger.log(_logger.LOG_INOUT, "> VideoAssistanceViewModel::updatePropData ");

            if(result[PROP_VIDEO_REQUEST_TELLERNAME] !== undefined) {
                this.tellerName(result[PROP_VIDEO_REQUEST_TELLERNAME]);
            }
            
            _logger.log(_logger.LOG_INOUT, "< VideoAssistanceViewModel::updatePropData ");
        }
    }
});
