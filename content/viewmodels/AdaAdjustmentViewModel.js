/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany
 
 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.
 
 

$MOD$ AdaAdjustmentViewModel.js 4.3.1-210127-21-34ae33df-1a04bc7d
 */
define(["vm/MessageViewModel"], function() {
    "use strict";
    
    const _logger = Wincor.UI.Service.Provider.LogProvider;
    const _adaService = Wincor.UI.Service.Provider.AdaService;
    
    const CMD_VOL_MINUS = "VOL_MINUS";
    const CMD_VOL_PLUS = "VOL_PLUS";
    const CMD_RATE_MINUS = "RATE_MINUS";
    const CMD_RATE_PLUS = "RATE_PLUS";

    /**
     * Deriving from {@link Wincor.UI.Content.MessageViewModel} class. <BR>
     * This viewmodel provides specific functionality for the 'adaadjustment.html' view to increase/decrease the volume and rate.
     * @class
     */
    Wincor.UI.Content.AdaAdjustmentViewModel = class AdaAdjustmentViewModel extends Wincor.UI.Content.MessageViewModel {
        /**
         * @property {Object} speechEngineConfig
         * The speech engine API configuration for the volume and rate.
         * @property {Object} speechEngineConfig.volume
         * The speech engine API configuration for the volume.
         * @property {number}speechEngineConfig.volume.max [speechEngineConfig.volume.max=7]
         * Max volume limitation.
         * @property {number} speechEngineConfig.volume.min [speechEngineConfig.volume.min=0]
         * Min volume limitation.
         * @property {number} speechEngineConfig.volume.stepSize [speechEngineConfig.volume.stepSize=1]
         * Volume step size for increasing/decreasing the speech volume.
         * @property {number} speechEngineConfig.volume.val [speechEngineConfig.volume.val=4]
         * Current speech volume value for last dec/increment.
         * @property {Object} speechEngineConfig.rate
         * The speech engine API configuration for the rate.
         * @property {number}speechEngineConfig.rate.max [speechEngineConfig.rate.max=5]
         * Max rate limitation.
         * @property {number} speechEngineConfig.rate.min [speechEngineConfig.rate.min=-5]
         * Min rate limitation.
         * @property {number} speechEngineConfig.rate.stepSize [speechEngineConfig.rate.stepSize=1]
         * Rate step size for increasing/decreasing the speech rate.
         * @property {number} speechEngineConfig.rate.val [speechEngineConfig.rate.val=0]
         * Current speech rate value for last inc/decrement.
         */
        speechEngineConfig = {
            volume: {
                max: 7,
                min: 0,
                stepSize: 1,
                val: 4
            },
            rate: {
                max: 5,
                min: -5,
                stepSize: 1,
                val: 0
            }
        };
    
        /**
         * Initializes the DOM-associated objects.
         * Overrides {@link Wincor.UI.Content.MessageViewModel#observe}
         * @param {string} observableAreaId The area id to observe via knockout
         * @lifecycle viewmodel
         */
        observe(observableAreaId) {
            try {
                _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `> AdaAdjustmentViewModel::observe(${observableAreaId})`);
                super.observe(observableAreaId);
                // read view config for speech engine config
                if(this.viewConfig.config) {
                    _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, `. AdaAdjustmentViewModel::observe viewConf=${JSON.stringify(this.viewConfig)}`);
                    const config = this.viewConfig.config;
                    const vol = this.speechEngineConfig.volume;
                    const rate = this.speechEngineConfig.rate;
                    if(config.volumeMax !== void 0) {
                        vol.max = parseInt(config.volumeMax);
                    }
                    if(config.volumeMin !== void 0) {
                        vol.min = parseInt(config.volumeMin);
                    }
                    if(config.volumeStepSize !== void 0) {
                        vol.stepSize = parseInt(config.volumeStepSize);
                    }
                    if(config.rateMax !== void 0) {
                        rate.max = parseInt(config.rateMax);
                    }
                    if(config.rateMin !== void 0) {
                        rate.min = parseInt(config.rateMin);
                    }
                    if(config.rateStepSize !== void 0) {
                        rate.stepSize = parseInt(config.rateStepSize);
                    }
                }
                _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< AdaAdjustmentViewModel::observe");
            } catch(e) {
                _logger.error(e);
            }
        }
    
        /**
         * Reads the ADA configuration regarding volume and rate.
         * @param {object} args  Contains the attributes 'textKeys' {array.<string|promise>} and 'dataKeys' {array.<string|promise>}, which should be filled up by the viewmodel.
         * @lifecycle viewmodel
         * @see {@link Wincor.UI.Content.BaseViewModel#onInitTextAndData}
         * @async
         */
        async onInitTextAndData(args) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> AdaAdjustmentViewModel::onInitTextAndData()");
            const vol = this.speechEngineConfig.volume;
            const rate = this.speechEngineConfig.rate;
            if(!this.designMode) {
                let conf = await this.serviceProvider.ConfigService.getConfiguration(`ADA\\CCADAFW\\DEFAULTS`, null);
                if(conf) {
                    _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, `. AdaAdjustmentViewModel::onInitTextAndData conf=${JSON.stringify(conf)}`);
                    vol.val = conf.VOLUME !== void 0 ? parseInt(conf.VOLUME) : vol.val;
                    rate.val = conf.RATE !== void 0 ? parseInt(conf.RATE) : rate.val;
                }
            }
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `. AdaAdjustmentViewModel::onInitTextAndData speechEngineConfig=${JSON.stringify(this.speechEngineConfig)}`);
            this.cmdRepos.whenAvailable(CMD_VOL_PLUS).then(() => {
                this.cmdRepos.setActive(CMD_VOL_PLUS, (vol.val + vol.stepSize) <= vol.max);
            });
            this.cmdRepos.whenAvailable(CMD_VOL_MINUS).then(() => {
                this.cmdRepos.setActive(CMD_VOL_MINUS, (vol.val - vol.stepSize) >= vol.min);
            });
            this.cmdRepos.whenAvailable(CMD_RATE_PLUS).then(() => {
                this.cmdRepos.setActive(CMD_RATE_PLUS, (rate.val + rate.stepSize) <= rate.max);
            });
            this.cmdRepos.whenAvailable(CMD_RATE_MINUS).then(() => {
                this.cmdRepos.setActive(CMD_RATE_MINUS, (rate.val - rate.stepSize) >= rate.min);
            });
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< AdaAdjustmentViewModel::onInitTextAndData");
            return super.onInitTextAndData(args);
        }
    
        /**
         * @lifecycle viewmodel
         * @see {@link Wincor.UI.Content.BaseViewModel#onDeactivated}
         */
        onDeactivated() {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> AdaAdjustmentViewModel::onDeactivated()");
            this.speechEngineConfig.volume.val = 4;
            this.speechEngineConfig.rate.val = 0;
            super.onDeactivated();
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< AdaAdjustmentViewModel::onDeactivated");
        }
    
        /**
         * Handles a speech command for either the volume or the rate.
         * @param {boolean} isVol true, if the volume needs to inc/decreased, false means the rate
         * @param {boolean} isInc true, if the volume or rate needs to increased, false means decreased
         */
        handleSpeechCommand(isVol, isInc) {
            const conf = isVol ? this.speechEngineConfig.volume : this.speechEngineConfig.rate;
            if(isInc) {
                if(conf.val < conf.max) {
                    conf.val += conf.stepSize;
                    if((conf.val + conf.stepSize) >= conf.min) {
                        this.cmdRepos.setActive(isVol ? CMD_VOL_MINUS : CMD_RATE_MINUS, true);
                    }
                    isVol ? _adaService.increaseVolume(null) : _adaService.increaseRate(null);
                }
                if((conf.val + conf.stepSize) > conf.max) {
                    conf.val = conf.max;
                    this.cmdRepos.setActive(isVol ? CMD_VOL_PLUS : CMD_RATE_PLUS, false);
                }
            } else {
                if(conf.val > conf.min) {
                    conf.val -= conf.stepSize;
                    if((conf.val + conf.stepSize) > conf.min) {
                        this.cmdRepos.setActive(isVol ? CMD_VOL_PLUS : CMD_RATE_PLUS, true);
                    }
                    isVol ? _adaService.decreaseVolume(null) : _adaService.decreaseRate(null);
                }
                if((conf.val - conf.stepSize) < conf.min) {
                    conf.val = conf.min;
                    this.cmdRepos.setActive(isVol ? CMD_VOL_MINUS : CMD_RATE_MINUS, false);
                }
            }
            _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, `. AdaAdjustmentViewModel::handleSpeechCommand speechEngineConfig=${JSON.stringify(this.speechEngineConfig)}`);
        }
        
        /**
         * Overrides {@link Wincor.UI.Content.BaseViewModel#onButtonPressed}
         * in order to handle certain commands for the 'adaadjustment.html' view.
         * <p>
         * Handles the following on button pressed actions:<br>
         * <ul>
         *     <li>VOL_MINUS</li>
         *     <li>VOL_PLUS</li>
         *     <li>RATE_MINUS</li>
         *     <li>RATE_PLUS</li>
         * </ul>
         * </p>
         * @param {String} id the id of the command that was triggered
         * @eventhandler
         */
        onButtonPressed(id) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `> AdaAdjustmentViewModel::onButtonPressed id=${id}`);
            if(!this.designMode) {
                switch(id) {
                    case CMD_VOL_MINUS:
                        this.handleSpeechCommand(true, false);
                        break;
                    case CMD_VOL_PLUS:
                        this.handleSpeechCommand(true, true);
                        break;
                    case CMD_RATE_MINUS:
                        this.handleSpeechCommand(false, false);
                        break;
                    case CMD_RATE_PLUS:
                        this.handleSpeechCommand(false, true);
                        break;
                    default:
                        super.onButtonPressed(id);
                }
            } else { // design mode
                if(id !== CMD_VOL_MINUS && id !== CMD_VOL_PLUS && id !== CMD_RATE_MINUS && id !== CMD_RATE_PLUS) {
                    super.onButtonPressed(id);
                }
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< AdaAdjustmentViewModel::onButtonPressed");
        }
    }
});
