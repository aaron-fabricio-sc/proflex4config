/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ SignaturePadViewModel.js 4.3.1-210127-21-34ae33df-1a04bc7d
 */

define(["knockout", "extensions", "config/Config", "vm/ScanCodeAnimationsViewModel"], function(ko, ext, config) {
    "use strict";
    console.log("AMD:SignaturePadViewModel");

    const _logger = Wincor.UI.Service.Provider.LogProvider;
    const _dataService = Wincor.UI.Service.Provider.DataService;
    const _localizeService = Wincor.UI.Service.Provider.LocalizeService;
    const _utilityService = Wincor.UI.Service.Provider.UtilityService;


    const PROP_DOCUMENT_DATA = "PROP_DOCUMENT_DATA";
    const PROP_DOCUMENT_TYPE = "PROP_DOCUMENT_TYPE";

    const BASE64_MARKER = "base64,";
    const SOURCE_IMAGE_TYPE = "jpg";
    const TARGET_IMAGE_TYPE = "jpg";

    const VIEW_MODE_DRAWING = "drawing";
    const VIEW_MODE_IMAGE_VIEWER = "result";


    let _module;
    
    /**
     * The SignaturePadViewModel provides previously recorded signature data or a just drawn signature which can be presented in a view or coming from a view.
     * <p>
     * These signature data usually will be set in the <code>PROP_DOCUMENT_DATA</code>.
     * Usually before the customer draws his signature a default signature animation may be shown.
     * This data coming from the <i>../views/style/default/images/signature.json</i> file.
     * </p>
     * <br>
     * SignaturePadViewModel deriving from {@link Wincor.UI.Content.ScanCodeAnimationsViewModel} class.
     * @class
     * @since 2.0/10
     */
    Wincor.UI.Content.SignaturePadViewModel = class SignaturePadViewModel extends Wincor.UI.Content.ScanCodeAnimationsViewModel {

        /**
         * Contains the signature data
         * @type {string}
         */
        signatureData = "";

        /**
         * The mode for the viewmodel (comes from viewkey configuration):
         * <br>
         * <ul>
         *     <li>prepare - preparing mode</li>
         *     <li>scanning - scanning mode</li>
         *     <li>result - result after scanning mode</li>
         * </ul>
         * @default result
         * @type {function | ko.observable}
         * @bindable
         */
        mode = null;

        /**
         * The document type.
         * Retrieved by the business property <i>PROP_DOCUMENT_TYPE</i>
         * <br>
         * The known document types are:
         * <ul>
         *     <li>IDCard</li>
         *     <li>DrivingLicense</li>
         *     <li>Passport</li>
         *     <li>Document</li>
         *     <li>Signature</li>
         * </ul>
         * @type {string}
         */
        docType = "";

        /**
         * Initializes this view model.
         * @param {*} module the signature pad image code-behind module.
         * @lifecycle viewmodel
         */
        constructor(module) {
            super();
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> SignaturePadViewModel");
            _module = module;
            this.signatureData = "";
            this.mode = ko.observable("");
            this.docType = "";
            if(!_module) {
                _logger.error("This view model needs the corresponding code-behind module. Please deliver with '... new SignaturePadViewModel(this);'");
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< SignaturePadViewModel");
        }
        
        /**
         * Handler function to remove/clear members.
         * Overridden to clear data list items, flags and counter.
         * @lifecycle viewmodel
         */
        onDeactivated() {
            super.onDeactivated();
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> SignaturePadViewModel::onDeactivated()");
            if(_module) {
                _module.clearSignature();
                _module.setSignature(this.signatureData);
            }
            this.docType = "";
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< SignaturePadViewModel::onDeactivated");
        }

        /**
         * Cleaning up members which can't be cleared in onDeactivate.
         * @lifecycle viewmodel
         */
        clean() {
            _logger.log(_logger.LOG_INOUT, "> SignaturePadViewModel::clean()");
            _module = this.signatureData = null;
            this.mode("");
            super.clean();
            _logger.log(_logger.LOG_INOUT, "< SignaturePadViewModel::clean");
        }
        
        /**
         * This method usually initializes data before text and/or business data are retrieved, such as e.g. viewkey configuration.
         * Overrides {@link Wincor.UI.Content.BaseViewModel#observe}
         * @param {String} observableAreaId the area to observe via knockout
         * @lifecycle viewmodel
         */
        observe(observableAreaId) {
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `> SignaturePadViewModel::observe(${observableAreaId})`);
            super.observe(observableAreaId);
            let mode = this.viewConfig.config && this.viewConfig.config.mode ? this.viewConfig.config.mode : VIEW_MODE_IMAGE_VIEWER;
            this.mode(mode);
            _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, `. SignaturePadViewModel::observe mode=${mode}`);
            if(_module) {
                // In ext design mode the customer must press correct to begin. This is because the DTR side panel menu (when choosing a certain viewkey to draw signature)
                // disturbs the begin of drawing while the animation is drawing as well.
                _module.setInputMode((!this.designModeExtended && mode === VIEW_MODE_DRAWING) || this.designMode);
                _module.setImageType(this.designMode || this.designModeExtended ? "png" : SOURCE_IMAGE_TYPE);
            }
            this.cmdRepos.whenAvailable([this.STANDARD_BUTTONS.CONFIRM]).then(() => {
                this.cmdRepos.addDelegate({ id: this.STANDARD_BUTTONS.CONFIRM, delegate: this.onButtonPressed, context: this });
            });
            this.cmdRepos.whenAvailable([this.STANDARD_BUTTONS.CORRECT]).then(() => {
                this.cmdRepos.addDelegate({ id: this.STANDARD_BUTTONS.CORRECT, delegate: this.onButtonPressed, context: this });
            });
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< SignaturePadViewModel::observe");
        }

        /**
         * Initializes the text and data.
         * This method reads the JSON file of '<i>../views/style/default/images/signature.json</i>' and the business property <i>PROP_DOCUMENT_TYPE</i>.
         * @param {object} args will contain the promise which getting resolved when everything is prepared
         * @see {Wincor.UI.Content.BaseViewModel#onInitTextAndData}
         * @lifecycle viewmodel
         */
        onInitTextAndData(args) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> SignaturePadViewModel::onInitTextAndData()");
            args.dataKeys.push(config.retrieveJSONData("signature", "../views/style/default/images/")
                .then(data => {
                    if(_module) {
                        let isoLang = !this.designMode ? _localizeService.currentLanguage : "en-US";
                        let resolution = Wincor.UI.Content.StyleResourceResolver.resolution();
                        resolution = resolution.endsWith("/") ? resolution.substring(0, resolution.lastIndexOf("/")) : resolution; // eliminate slash
                        this.signatureData = data.signatures[isoLang] && data.signatures[isoLang][resolution] ? data.signatures[isoLang][resolution].signature : [];
                        if(!this.signatureData.length) {
                            _logger.error("SignaturePadViewModel::onInitTextAndData No signature data available to present an animation.");
                        }
                        _module.setSignature(this.signatureData);
                        if(this.designMode) { // basic design mode
                            this.viewFlexSignatureStylus(true);
                        }
                    }
                })
            );

            if(!this.designMode) {
                args.dataKeys.push(_dataService.getValues(PROP_DOCUMENT_TYPE)
                   .then(result => {
                        this.docType = result[PROP_DOCUMENT_TYPE];
                   })
                );
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< SignaturePadViewModel::onInitTextAndData");
            return super.onInitTextAndData(args);
        }

        /**
         * Handles on button pressed actions:<br>
         * <ul>
         *     <li>CONFIRM</li>
         *     <li>CORRECT</li>
         * </ul>
         * @param {string} id the command id such as 'CONFIRM', etc
         * @eventhandler
         */
        onButtonPressed(id) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `> SignaturePadViewModel::onButtonPressed(${id})`);
            if(id === this.STANDARD_BUTTONS.CORRECT) {
                if(this.designModeExtended) {
                    _module.setInputMode(this.mode() === VIEW_MODE_DRAWING);
                }
                _module.clearSignature();
            } else if(id === this.STANDARD_BUTTONS.CONFIRM) {
                if(!this.designMode && _module.isSignatureAvailable() && this.mode() === VIEW_MODE_DRAWING) {
                    this.cmdRepos.setActive(this.STANDARD_BUTTONS.CONFIRM, false);
                    _dataService.getValues(PROP_DOCUMENT_DATA).then(res => {
                        try {
                            let base64 = _module.getSignatureAsBase64();
                            let imgData = base64.substr(base64.indexOf(BASE64_MARKER) + BASE64_MARKER.length);
                            _module.setInputMode(false);
                            _utilityService.saveImageToFile(`${_utilityService.WORKING_DIRS.SESSION}${this.docType}`, imgData, SOURCE_IMAGE_TYPE, this.docType, TARGET_IMAGE_TYPE, true)
                                .then(() => {
                                    try {
                                        // for ext design mode we set the Base64 image data instead of the image path, the ScannedImageViewModel is able to process both ways
                                        let path = _utilityService.PATHS[this.docType];
                                        _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, `. SignaturePadViewModel::onButtonPressed image path=${path}`);
                                        let imageData = res[PROP_DOCUMENT_DATA] || { images: [{}]};
                                        imageData = typeof imageData !== "object" ? JSON.parse(imageData) : imageData;
                                        imageData.images[0].imagePath = !this.designModeExtended ? path : base64;
                                        imageData.images[0].documentType = this.docType; // set document type which usually is "Signature"
                                        _dataService.setValues(PROP_DOCUMENT_DATA, JSON.stringify(imageData))
                                                    .then(() => {
                                                        if(this.designModeExtended && _module.isAllowCopyForReplay()) {
                                                            setTimeout(() => super.onButtonPressed(id), 3000); // give time to copy/paste data
                                                        } else {
                                                            super.onButtonPressed(id);
                                                        }
                                                    });
                                    } catch(e) {
                                        this.handleError(e, "SignaturePadViewModel::onButtonPressed failed to parse data or safe image to file");
                                    }
                                })
                                .catch(cause => {
                                    this.handleError(cause, "SignaturePadViewModel::onButtonPressed failed to safe image to file");
                                });
                        } catch(e) {
                            this.handleError(e, `SignaturePadViewModel::onButtonPressed failed with error=${e}`);
                        }
                    });
                }
            } else {
                super.onButtonPressed(id);
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< SignaturePadViewModel::onButtonPressed");
            return true;
        }
    }
});

