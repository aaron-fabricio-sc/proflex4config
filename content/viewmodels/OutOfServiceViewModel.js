/**
 @preserve
 Copyright (c) 2001-2021 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ OutOfServiceViewModel.js 4.3.1-210701-21-172c70a5-1a04bc7d

*/
define(["knockout", "extensions", "vm/ListViewModel"], function(ko, ext) {
    "use strict";
    console.log("AMD:OutOfServiceViewModel");

    const _logger = Wincor.UI.Service.Provider.LogProvider;
    const _dataService = Wincor.UI.Service.Provider.DataService;
    const _localizeService = Wincor.UI.Service.Provider.LocalizeService;
    
    const PROP_ATM_LOCATION_STATE_INFOS = "PROP_ATM_LOCATION_STATE_INFOS";
    const PROP_OUT_OF_SERVICE_ADA_TEXT = "PROP_OUT_OF_SERVICE_ADA_TEXT";
    
    const CLOSED_CONSUMER = "CLOSEDCONSUMER";
    const OPEN_CONSUMER = "OPENCONSUMER";
    
    /**
     * The ATM info data.
     * @param {String | Object} data the ATM data must be in the right order!
     * @class
     */
    class AtmData {
        constructor(...data) {
            this.name = data[0] || "";
            this.primanota = data[1] || "";
            this.timeZone = data[2] || "";
            this.remark = data[3] || "";
            this.distanceKm = data[4] || "";
            this.wkstState = data[5] || "";
            this.addressData = data[6];
        }
    }

    /**
     * The ATM info address data.
     * @param {String} data the address data must be in the right order!
     * @class
     */
    class AddressData {
        constructor(...data) {
            this.street = data[0] || "";
            this.streetNo = data[1] || "";
            this.zipCode = data[2] || "";
            this.city = data[3] || "";
            this.lon = data[4];
            this.lat = data[5];
        }
    }

    let _module;

    /**
     * This viewmodel is used to display data for ATM infos.
     * Since 2.0/20 it also provides map geo location.
     * OutOfServiceViewModel deriving from {@link Wincor.UI.Content.ListViewModel} class.
     * @class
     * @since 2.0/10
     */
    Wincor.UI.Content.OutOfServiceViewModel = class OutOfServiceViewModel extends Wincor.UI.Content.ListViewModel {

        /**
         * Flag whether to allow ATM locations on a map or not.
         * @type {ko.observable | function}
         * @bindable
         */
        allowMapLocations = void 0;
    
        /**
         * Takes the currently listed ATM number.
         * @type {ko.observable | function}
         * @bindable
         */
        atmNumber = void 0;
    
        /**
         * Initializes this view model.
         * @param {Object} codeBehindModule the outofservice code-behind module
         * @lifecycle viewmodel
         */
        constructor(codeBehindModule) {
            super();
            _module = codeBehindModule;
            this.allowMapLocations = ko.observable(false);
            this.atmNumber = ko.observable(0);
        }
        
        /**
         * Handler function to remove/clear members.
         * Overridden to clear data list items, flags and counter.
         */
        onDeactivated() {
            super.onDeactivated();
            if(this.allowMapLocations() && _module) {
                _module.closeMapLocation(null, null, true);
            }
            this.atmNumber(0);
        }

        /**
         * Cleaning up members which can't be cleared in onDeactivate.
         * @lifecycle viewmodel
         */
        clean() {
            _logger.log(_logger.LOG_INOUT, "> OutOfServiceViewModel::clean()");
            if(this.allowMapLocations() && _module) {
                _module.closeMapLocation(null, null, true);
            }
            _module = null;
            super.clean();
            _logger.log(_logger.LOG_INOUT, "< OutOfServiceViewModel::clean");
        }
        
        /**
         * Creates a new ATM data object.
         * @param {String | Object} data the ATM data must be in the right order:<br>
         * name,
         * primanota,
         * timeZone,
         * remark,
         * distanceKm,
         * wkstState,
         * addressData,
         * @return {*} a new address data object
         */
        createAtmData(...data) {
            return new AtmData(...data);
        }

        /**
         * Creates a new address data object.
         * @param {String} data the address data must be in the right order:<br>
         * street,
         * streetNo,
         * zipCode,
         * city,
         * @return {*} a new address data object
         */
        createAddressData(...data) {
            return new AddressData(...data);
        }

        /**
         * This method initializes the DOM-associated objects.
         * Overrides {@link BaseViewModel#observe}
         * @param {String} observableAreaId the area id to observe via knockout
         * @param {Object=} visibleLimitsObject the visible limits object for the view. Usually necessary for softkey based view.<br>
         *                                      A typical visible limits object looks like: { visibleLimits: { max: 8 }}
         */
        observe(observableAreaId, visibleLimitsObject) {
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `> OutOfServiceViewModel::observe(${observableAreaId})`);
            if(!this.designMode) {
                this.allowMapLocations(this.viewConfig.config && this.viewConfig.config.allowMapLocations ? this.viewConfig.config.allowMapLocations : false);
                if(_module && this.viewConfig.config && this.viewConfig.config.zoomToExtent) {
                    _module.setZoomToExtend(this.viewConfig.config.zoomToExtent);
                }
                _localizeService.registerForServiceEvent(_localizeService.SERVICE_EVENTS.LANGUAGE_CHANGED, this.updateAdaText.bind(this),  _localizeService.DISPOSAL_TRIGGER_UNLOAD);
            }
            _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, `. OutOfServiceViewModel::observe allowMapLocations=${this.allowMapLocations()}`);
            super.observe(observableAreaId, visibleLimitsObject);
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< OutOfServiceViewModel::observe");
        }
    
        /**
         * Updates the ADA text for the TTS engine.
         * The method constructs the whole ADA text to be spoken using static text values and dynamic business data values of ATM location data.
         * The resulting text will be set into a certain business property, which may be part of a localized text to be retrieved by a component
         * which is active while this viewmodel is running.
         * @async
         */
        async updateAdaText() {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> OutOfServiceViewModel::updateAdaText()");
            try {
                const adaTextMap = {
                    OOS_INSTRUCTION: this.buildGuiKey("Instruction", "ADA"), // a more unique name, because we put it into the LabelContainer
                    ROW_DETAILS: this.buildGuiKey("Label", "ATMInfosDetailsRow", "ADA"),
                    ATM_ADDRESS: this.buildGuiKey("Label", "ATMInfosAddress", "ADA"),
                    DISTANCE: this.buildGuiKey("Label", "ATMInfosDistance", "ADA"),
                    DISTANCE_KM: this.buildGuiKey("Label", "DistanceKM", "ADA"),
                    STATUS: this.buildGuiKey("Label", "ATMInfosStatus", "ADA"),
                    ONLINE: this.buildGuiKey("Label", "ATMInfosStatusOnline", "ADA"),
                    OFFLINE: this.buildGuiKey("Label", "ATMInfosStatusOffline", "ADA"),
                    QR_CODES_INFO: this.buildGuiKey("Label", "ATMQRCodesInfo", "ADA"),
                };
                const txtResVal = await _localizeService.getText(Object.values(adaTextMap));
                // A very rare case, but ensure that we're not closed in the meantime due to a ViewModelContainer::clean
                if(this.labels) {
                    // construct the ADA text
                    let adaText = `${txtResVal[adaTextMap.OOS_INSTRUCTION]}`;
                    adaText = this.labels.set(Object.keys(adaTextMap)[0], adaText)(); // resolve variables in text and get the resulting text back from the resulting observable
                    this.dataList.items().forEach((item, i) => {
                        const key = Object.keys(adaTextMap)[1];
                        const ctxMap = {
                            number: i + 1,
                            name: item.name,
                            street: item.addressData.street,
                            streetNo: item.addressData.streetNo,
                            city: item.addressData.city,
                            zipCode: item.addressData.zipCode,
                            distanceKm: item.distanceKm ? parseFloat(item.distanceKm).toFixed(2) : item.distanceKm,
                            status: `${item.wkstState === OPEN_CONSUMER ? txtResVal[adaTextMap.ONLINE] : txtResVal[adaTextMap.OFFLINE]}`
                        };
                        adaText += ` ${txtResVal[adaTextMap.ROW_DETAILS]} `;
                        this.labels.getLabel(key, "", ctxMap);
                        this.labels.set(key, adaText);
                        adaText = this.labels.resolveVars(this.labels.labelItems.get(key.toLowerCase()), ctxMap);
                        
                        // A more raw alternative:
                        // adaText += ` ${txtResVal[adaTextMap.ATM_ADDRESS]} ${i + 1}: `;
                        // adaText += `${item.addressData.street} ${item.addressData.streetNo} ${item.addressData.city} ${item.addressData.zipCode} `;
                        // adaText += `${txtResVal[adaTextMap.DISTANCE]} ${item.distanceKm}${txtResVal[adaTextMap.DISTANCE_KM]} `;
                        // adaText += `${txtResVal[adaTextMap.STATUS]} ${item.wkstState === OPEN_CONSUMER ? txtResVal[adaTextMap.ONLINE] : txtResVal[adaTextMap.OFFLINE]}. `;
                    });
                    adaText += ` ${txtResVal[adaTextMap.QR_CODES_INFO]}`;
                    // set certain ADA text for the TTS engine in order to spoke ours instead of the standard WAV files or similar while the ATM isn't in service
                    await _dataService.setValues(PROP_OUT_OF_SERVICE_ADA_TEXT, adaText);
                    if(this.designModeExtended) {
                        const adaService = Wincor.UI.Service.Provider.AdaService;
                        if(adaService.state === adaService.STATE_VALUES.SPEAK || adaService.state === adaService.STATE_VALUES.BEREADY) {
                            adaService.speak(adaText, 2, 10, null);
                        }
                    }
                } else {
                    _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE,
                        `* OutOfServiceViewModel::updateAdaText This VM has been cleaned in the meantime, no further action necessary.`);
                }
            } catch(e) { // don't reject here because broken ADA isn't a crucial point to broke up the whole view
                _logger.error(`Not able to create ADA text to be spoken to TTS: ${e}`);
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< OutOfServiceViewModel::updateAdaText");
        }

        /**
         * Initializes the item list for a view to present.
         * @param {Array<Object>} data the denomination array
         */
        initItemData(data) {
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `> OutOfServiceViewModel::initItemData data=${JSON.stringify(data)}`);
            // Sorting a) the data array in an ascending manner by the denomination value
            data = this.vmHelper.sortByKey(data, "distanceKm");
            // Sorting b) separate the data array for "OPENCONSUMER" / "CLOSEDCONSUMER" and join it again if necessary
            const offline = data.filter(item => {
                return CLOSED_CONSUMER === item.wkstState || !item.wkstState;
            });
            if (offline.length) { // first check whether we have "CLOSEDCONSUMER" ATMs
                const online = data.filter(item => {
                    return OPEN_CONSUMER === item.wkstState;
                });
                data = online.concat(offline);
            }
            const len = data.length;
            const srcDataList = [];
            // build the item list
            for(let i = 0; i < len; i++) {
                const atm = data[i].atm;
                const adrData = atm.addressData;
                const srcData = new AtmData(atm.name, atm.primanota, atm.timeZone, atm.remark, data[i].distanceKm, data[i].wkstState,
                    new AddressData(adrData.street, adrData.streetNo, adrData.zipCode, adrData.city, adrData.longitude, adrData.latitude));
                srcDataList.push(srcData);
            }
            this.setListLen(len); // set the current length of the list before the current visible entries gets evaluated
            this.setListSource(srcDataList);
            this.atmNumber(len);
            this.initCurrentVisibleLimits();
            this.dataList.items(srcDataList);
            this.initScrollbar();
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< OutOfServiceViewModel::initItemData");
        }

        /**
         * Override to synchronize during further data gathering after applyBindings of knockout.js has been done for this view model
         * @param {Object} args
         * @see {Wincor.UI.Content.BaseViewModel#onInitTextAndData}
         * @eventhandler
         */
        onInitTextAndData(args) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> OutOfServiceViewModel::onInitTextAndData()");
            if(!this.designMode) {
                args.dataKeys.push(ext.Promises.promise((resolve, reject) => {
                    _dataService.getValues(PROP_ATM_LOCATION_STATE_INFOS, async result => {
                        let value = result[PROP_ATM_LOCATION_STATE_INFOS] || [];
                        _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, `* OutOfServiceViewModel::onInitTextAndData --> atmInfos=${value}`);
                        try {
                            value = typeof value === "string" ? JSON.parse(value) : value;
                            this.initItemData(value); // Empty data list means an empty ATM table - this is a normal use case
                            await this.updateAdaText();
                            resolve();
                        } catch (exception) {
                            reject(`OutOfServiceViewModel::onInitTextAndData data service callback --> ATM infos invalid ! ${exception}`);
                        }
                    }, async newData => { // on update ATM infos
                        newData = newData[PROP_ATM_LOCATION_STATE_INFOS] || [];
                        _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, `* OutOfServiceViewModel::onInitTextAndData --> atmInfos=${newData}`);
                        try {
                            newData = typeof newData === "string" ? JSON.parse(newData) : newData;
                            // Please note: Even we have no new data we do not remove the current ATM list.
                            // Maybe the server is offline, the business app sets its property to empty - but this usually doesn't mean that all listed ATM's are now blown away.
                            // If the list is empty during initialization - then this is as it is.
                            if(newData.length) {
                                this.initItemData(newData);
                                _module && _module.tableUpdate();
                                await this.updateAdaText();
                            }
                        } catch (e) {
                            this.handleError(e, "OutOfServiceViewModel::onInitTextAndData data service update callback --> new ATM infos seems to be invalid !");
                        }
                    });
                }));
            } else { // design mode
                args.dataKeys.push(this.designTimeRunner.retrieveJSONData("OutOfServiceInfoData")
                    .then(data => {
                        this.allowMapLocations(data.allowMapLocations);
                        _module && _module.setZoomToExtend(data.zoomToExtent);
                        this.initItemData(data.atmStateInfos);
                    }));
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< OutOfServiceViewModel::onInitTextAndData");
            return super.onInitTextAndData(args);
        }

        /**
         * Overridden to handle certain commands for map location.
         * <p>
         * Handles on button pressed actions:<br>
         * <ul>
         *     <li>MAP_LOCATION_0..n</li>
         * </ul>
         * </p>
         * @param {String} id the command id such as 'BTN_SCROLL_DOWN', etc.
         * @eventhandler
         */
        onButtonPressed(id) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `> OutOfServiceViewModel::onButtonPressed(${id}) viewKey=${this.viewKey}`);
            if(this.allowMapLocations()) {
                const idx = id ? parseInt(id.substr(id.lastIndexOf("_") + 1)) : -1;
                _module && _module.showMapLocation(idx);
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< OutOfServiceViewModel::onButtonPressed");
            return true; // we handle the delegated onButtonPressed events!
        }
    }
});

