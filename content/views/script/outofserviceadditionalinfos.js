/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany
 
 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.
 
 

$MOD$ outofserviceadditionalinfos.js 4.3.1-201021-21-23fb68fb-1a04bc7d
 */

/**
 * The outofserviceadditionalinfos code-behind provides the life-cycle for the <i>outofserviceadditionalinfos</i> view.
 * Additionally it provides functions to present ATMs on a map.
 * @module outofserviceadditionalinfos
 * @since 2.0/10
 */
define(['jquery', 'code-behind/baseaggregate', 'extensions', 'lib/ol/ol', 'vm/OutOfServiceViewModel'], function($, base, ext, ol) {
    console.log("AMD:outofserviceadditionalinfos");
    
    const _logger = Wincor.UI.Service.Provider.LogProvider;
    
    const ZOOM_MAX = 18;
    const ZOOM_DEFAULT = 17;
    const POST_RENDER_WAIT_TO_RESOLVE = 2500;
    const ANIMATION_TIME = 250;
    
    let _mainVM;
    let _map;
    let _mapOnShow = false;
    let _zoomToExtendCoordinates = null;
    let _labels = []; // some label observables used for the marker popups
    
    /**
     * Creates a style for the map marker layer.
     * @param {String} markerType the type of the marker is either 'other' or 'current'
     * @return {ol.style.Style}
     */
    function createStyle(markerType) {
        const sign = base.container.currentBankingContext.currencyData.symbol.length === 1 ? base.container.currentBankingContext.currencyData.symbol : "";
        const color = markerType === "other" ? "%233333FF" : "%23E50A1A";
        // Important please note:
        // Because we are using this -marker with 'data:image/svg+xml;utf8' we MUST convert any '#' char with '%23' since Chrome 72 !
        // See: https://stackoverflow.com/questions/30733607/svg-data-image-not-working-on-firefox-or-chrome-72/30733736#30733736
        const marker = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="46px" height="62px" xml:space="preserve">' +
            '<style type="text/css">' +
            `.st0{opacity:0.77;}.st1{stroke:%23000000;stroke-miterlimit:10;}.st2{fill:${color};stroke:%23FFFFFF;stroke-miterlimit:10;}` +
            '.st3{opacity:0.95;}.st4{fill:none;}.st5{font-family:\'ArialMT\';}.st6{font-size:36px;}.st7{fill:none;stroke:%23000000;stroke-miterlimit:10;}' +
            `.st8{fill:${color};}.st9{fill:none;stroke:${color};stroke-miterlimit:10;}</style><g><g class="st0">` +
            '<path class="st1" d="M24.8,1.5c-12.7,0-23,10.4-23,23.1c0,4.9,1.5,9.5,4.3,13.4l0.6,0.8l16.4,23.4c0.3,0.5,0.9,0.7,1.5,0.7' +
            's1.2-0.3,1.5-0.7l16.3-23.1l0.8-1.1c2.8-4,4.3-8.6,4.3-13.4C47.7,11.8,37.5,1.5,24.8,1.5z M25,42.3c-10.4,0-19-8.2-19-18.5' +
            'S14.3,5.3,25,5.3c10.4,0,19,8.2,19,18.5S35.3,42.3,25,42.3z"/>' +
            '</g><path class="st2" d="M23.8,0.5c-12.7,0-23,10.4-23,23.1c0,4.9,1.5,9.5,4.3,13.4l0.6,0.8l16.4,23.4c0.3,0.5,0.9,0.7,1.5,0.7' +
            's1.2-0.3,1.5-0.7l16.3-23.1l0.8-1.1c2.8-4,4.3-8.6,4.3-13.4C46.7,10.8,36.5,0.5,23.8,0.5z M24,41.3c-10.4,0-19-8.2-19-18.5' +
            'S13.3,4.3,24,4.3c10.4,0,19,8.2,19,18.5S34.3,41.3,24,41.3z"/></g><g><g class="st3">' +
            '<rect x="13.3" y="9.9" class="st4" width="23.8" height="28.3"/>' +
            `<text transform="matrix(1 0 0 1 13.325 35.5096)" class="st5 st6">${sign}</text>` +
            `<text transform="matrix(1 0 0 1 13.325 35.5096)" class="st7 st5 st6">${sign}</text></g>` +
            '<rect x="12.3" y="8.9" class="st4" width="23.8" height="28.3"/>' +
            `<text transform="matrix(1 0 0 1 12.325 34.5096)" class="st8 st5 st6">${sign}</text>` +
            `<text transform="matrix(1 0 0 1 12.325 34.5096)" class="st9 st5 st6">${sign}</text></g></svg>`;
        
        return new ol.style.Style({
            image: new ol.style.Icon(({
                anchor: [0.1, 0.1],
                // anchorXUnits: 'fraction',
                // anchorYUnits: 'fraction',
                opacity: 1,
                scale: 1.25,
                size: [100, 120],
                // offset: [95, 96],
                src: `data:image/svg+xml;utf8,${marker}`
                // src: 'style/default/images/marker_atm_blue.svg'
            }))
        });
    }
    
    /**
     * Creates the map marker.
     * @param {number} idx the index of the selected ATM location
     */
    function createMarker(idx) {
        let vectorSourceOther = new ol.source.Vector({});
        let vectorSourceCurrent = new ol.source.Vector({});
        let items = _mainVM.dataList.items();
        for(let i = 0; i < items.length; i++) {
            let item = items[i];
            if(item.addressData.lon && item.addressData.lat) {
                let lon = parseFloat(item.addressData.lon);
                let lat = parseFloat(item.addressData.lat);
                const STATUS = _labels[0];
                const OFFLINE = _labels[1];
                const ONLINE = _labels[2];
                let iconFeature = new ol.Feature({
                    geometry: new ol.geom.Point(ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857')),
                    name: `${item.name}<br>${item.addressData.street} ${item.addressData.streetNo}<br>${STATUS()}:
                           ${item.wkstState === 'OPENCONSUMER' ? ONLINE() : OFFLINE()}`
                });
                if(i !== idx) {
                    vectorSourceOther.addFeature(iconFeature);
                } else {
                    _map.getView().setCenter(ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857'));
                    _map.getView().setZoom(ZOOM_DEFAULT);
                    vectorSourceCurrent.addFeature(iconFeature);
                }
            }
        }
        let vectorLayerOther = new ol.layer.Vector({
            source: vectorSourceOther,
            style: createStyle("other")
        });
        let vectorLayerCurrent = new ol.layer.Vector({
            source: vectorSourceCurrent,
            style: createStyle("current")
        });
        _map.addLayer(vectorLayerOther);
        _map.addLayer(vectorLayerCurrent);
    }
    
    /**
     * Removes all layers of the given type.
     * @param {Object=} type the layer type to remove, if not given then removing all layers
     */
    function removeLayers(type) {
        if(_map) {
            let layers = [];
            _map.getLayers().forEach(layer => {
                if(!type || (layer instanceof type)) {
                    layers.push(layer);
                }
            });
            for(let i = 0; i < layers.length; i++) {
                _map.removeLayer(layers[i]);
            }
        }
    }
    
    /**
     * Creates and builds the map location.
     * @param {number} idx the index of the selected ATM location
     * @param {Object} $mapContainer jQuery object of the target container
     * @return {Promise} gets resolved when map container is ready to show
     */
    function createMapLocation(idx, $mapContainer) {
        return ext.Promises.promise((resolve, reject) => {
            // Popup
            // Create an overlay to anchor the popup to the map.
            $mapContainer.append(`<div id="popup" class="ol-popup">
                <a id="popup-closer" class="ol-popup-closer" onclick="jQuery(this).parent().css('visibility', 'hidden')"></a>
                <div id="popup-content"></div></div>`
            );
            let $popupElement = $("#popup");
            let popup = new ol.Overlay({
                element: $popupElement[0],
                autoPan: true,
                autoPanAnimation: {
                    duration: 250
                }
            });
            let layerMapnik = new ol.layer.Tile({
                source: new ol.source.OSM({
                    cacheSize: 4096,
                    maxZoom: ZOOM_MAX,
                    crossOrigin: "anonymous"
                }),
                preload: 1
            });
            layerMapnik.getSource().once("tileloaderror", event => {
                reject("map tiles could not be loaded, reason possible offline");
                base.viewHelper.getActiveModule().closeMapLocation(null, null, true);
            });
    
            // MAP
            _map = new ol.Map({
                layers: [
                    layerMapnik
                ],
                target: "mapLocationContainer",
                renderer: "canvas",
                loadTilesWhileInteracting: true,
                controls: ol.control.defaults({
                    attribution: false,
                    zoom: true,
                    attributionOptions: {
                        collapsible: false
                    }
                }),
                view: new ol.View({
                    maxZoom: ZOOM_MAX,
                    // center: ol.proj.fromLonLat([clon, clat]),
                    zoom: ZOOM_DEFAULT
                }),
                loadTilesWhileAnimating: true
            });
            _map.addOverlay(popup);
            createMarker(idx);
            // let zoomSlider = new ol.control.ZoomSlider();
            // _map.addControl(zoomSlider);
            
            if(_zoomToExtendCoordinates) {
                let zoomToExtentControl = new ol.control.ZoomToExtent({
                    extent: _zoomToExtendCoordinates
                });
                _map.addControl(zoomToExtentControl);
            }
            
            let scaleLine = new ol.control.ScaleLine();
            _map.addControl(scaleLine);
            
            // Events
            _map.on("click", event => {
                let feature = _map.forEachFeatureAtPixel(event.pixel, feature => {
                    return feature;
                });
                if(feature) {
                    let coordinates = feature.getGeometry().getCoordinates();
                    popup.setPosition(coordinates);
                    $popupElement.find("#popup-content").html(feature.get("name"));
                    $popupElement.css("visibility", "visible");
                } else {
                    $popupElement.css("visibility", "hidden");
                }
            });
    
            // Uncomment to write current mouse (single) click positions to the console in order to get new coordinates
            // _map.on("singleclick", event => {
            //     let coord3857 = event.coordinate;
            //     let coord4326 = ol.proj.transform(coord3857, 'EPSG:3857', 'EPSG:4326');
            //     console.log(coord3857, coord4326);
            // });
            
            //-----------------------------------------------------------------------------------------
            // Uncomment to resolving promise by a certain tile loading count.
            // Please uncomment this block and comment or remove the "postrender" event handler below instead
            /*
            // Max count of already loaded tiles before resolving promise
            // 1 means resolving immediately
            const TILE_COUNT_MAX = 1;
            if(TILE_COUNT_MAX > 1) {
                let tileCounter = 0;
                layerMap.getSource().on("tileloadend", event => {
                    // tile end loaded, typically 12 or more times, but depends on zoom level
                    tileCounter++;
                    if(tileCounter === TILE_COUNT_MAX) {
                        resolve();
                    }
                });
            } else {
                resolve();
            }*/
            //------------------------------------------------------------------------------------------
            
            // postrender
            _map.once("postrender", event => {
                setTimeout(() => { // postrender comes earlier than a possible async tile load error
                    resolve();
                }, POST_RENDER_WAIT_TO_RESOLVE);
            });
        });
    }
    
    return /** @alias module:outofserviceadditionalinfos */ base.extend({
        name: "outofserviceadditionalinfos",
    
        /**
         * Shows a map with the ATM locations.
         * @param {number} idx the index of the ATM to be the current selected
         * @return {Promise<void>}
         */
        showMapLocation: async function(idx) {
            if(_mainVM.allowMapLocations()) {
                let $mapContainer = $("#mapLocationContainer");
                if($mapContainer.length) {
                    // container size
                    let $atmInfos = $("#atmInfos");
                    $mapContainer.css({
                        width: $atmInfos.css("width"),
                        height: $atmInfos.css("height"),
                        top: $atmInfos.position().top,
                        "margin-top": innerHeight + 1,
                        left: $("#flexArticle").css("padding-left")
                    });
                    $mapContainer.show();
                    if(!_map && !_mapOnShow) {
                        _mapOnShow = true;
                        try {
                            base.viewHelper.showWaitSpinner();
                            await createMapLocation(idx, $mapContainer);
                            base.viewHelper.removeWaitSpinner();
                            $mapContainer.transition({y: "0%", "margin-top": 0}, ANIMATION_TIME, "in");
                        } catch(e) {
                            _logger.error(e);
                        }
                    } else {
                        _map.updateSize();
                        let items = _mainVM.dataList.items();
                        if(idx !== void 0 && idx !== -1 && items[idx].addressData.lon && items[idx].addressData.lat) {
                            removeLayers(ol.layer.Vector);
                            createMarker(idx);
                        }
                        $mapContainer.transition({y: "0%", "margin-top": 0}, ANIMATION_TIME, "in");
                    }
                } else {
                    _logger.log(_logger.LOG_INFO, "* | VIEW_AGGREGATE outofserviceadditionalinfos:showMapLocation but no map container found in DOM!");
                }
            }
        },
    
        /**
         * Closes the just presented map.
         * @param {Object} viewmodel the current view model
         * @param {Object} event the event
         * @param {boolean} destroy destroy the map or not
         * @return {Promise} resolved when map container has been destroyed and disappeared
         */
        closeMapLocation: function(viewmodel, event, destroy) {
            return ext.Promises.promise(resolve => {
                let $mapContainer = $("#mapLocationContainer");
                if($mapContainer.length) {
                    $mapContainer.transition({y: innerHeight - $mapContainer.position().top + 1}, ANIMATION_TIME, "ease", () => {
                        if(_map && destroy) {
                            try {
                                removeLayers();
                                _map.disposeInternal();
                                _map.setTarget(null);
                                _map = null;
                            } catch(e) {
                                _logger.error(`outofserviceadditionalinfos::closeMapLocation error destroying map: ${e}`);
                            }
                        }
                        $mapContainer.hide();
                        _mapOnShow = false;
                        resolve();
                    });
                } else {
                    _logger.log(_logger.LOG_INFO, "* | VIEW_AGGREGATE outofserviceadditionalinfos:closeMapLocation but no map container found in DOM!");
                    resolve();
                }
            });
        },
    
        /**
         * To be called when main table updates.
         */
        tableUpdate: function() {
            setTimeout(() => {
                Wincor.UI.Content.ObjectManager.reCalculateObjects();
            }, 150); // give renderer time and then update the grid
        },
        
        /**
         * Sets the zoom to extend coordinates.
         * @param {Array<number>} zoomToExtendCoordinates
         */
        setZoomToExtend: function(zoomToExtendCoordinates) {
            _zoomToExtendCoordinates = zoomToExtendCoordinates;
        },
        
        /**
         * Instantiates the {@link Wincor.UI.Content.OutOfServiceViewModel} viewmodel.
         * @see {@link module:baseaggregate.activate}.
         * @lifecycle view
         * @return {Promise} resolved when activation is ready.
         */
        activate: function() {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE outofserviceadditionalinfos:activate");
            _mainVM = new Wincor.UI.Content.OutOfServiceViewModel(this);
            base.container.add(_mainVM, ["flexMain", base.config.viewType === "softkey" ? {visibleLimits: {min: 0, max: 8}} : void 0]);
            // retrieve some observables for label keys for the popups:
            _labels[0] = _mainVM.getLabel("GUI_[#VIEW_KEY#]_Label_ATMInfosStatus", "Status");
            _labels[1] = _mainVM.getLabel("GUI_[#VIEW_KEY#]_Label_ATMInfosStatusOffline", "Offline");
            _labels[2] = _mainVM.getLabel("GUI_[#VIEW_KEY#]_Label_ATMInfosStatusOnline", "Online");
            return base.activate();
        },
        
        /**
         * Overridden in order to delete the internal variables.
         * @see {@link module:baseaggregate.deactivate}.
         * @lifecycle view
         */
        deactivate: async function() {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE outofserviceadditionalinfos:deactivate");
            if(_mainVM.allowMapLocations()) {
                await this.closeMapLocation(null, null, true);
                base.viewHelper.styleResolver.removeStyleSheet("ol.css");
            }
            _mainVM = _map = _zoomToExtendCoordinates = null;
            _mapOnShow = false;
            _labels.length = 0;
            base.deactivate();
        },
        
        /**
         * Overridden to hide a possible <code>txnBackground</code> style.
         * @see {@link module:baseaggregate.compositionComplete}.
         * @lifecycle view
         */
        compositionComplete: async function(view, parent) {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE outofserviceadditionalinfos:compositionComplete");
            base.compositionComplete(view, parent);
            await base.container.whenActivated();
            base.jQuery('#txnBackground').css("display", "none");
            base.jQuery('div[data-view-id]').attr("data-txn-background", "false");
            if(_mainVM.allowMapLocations()) {
                // prepare
                base.viewHelper.styleResolver.addStyleSheet("ol.css", "../../lib/ol/");
            }
        }
    });
});

