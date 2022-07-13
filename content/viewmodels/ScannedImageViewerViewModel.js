/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ ScannedImageViewerViewModel.js 4.3.1-210127-21-34ae33df-1a04bc7d
 */
define(["knockout", "extensions", "vm/ScanCodeAnimationsViewModel"], function(ko, ext) {
    "use strict";
    console.log("AMD:ScannedImageViewerViewModel");


    const _logger = Wincor.UI.Service.Provider.LogProvider;
    const _dataService = Wincor.UI.Service.Provider.DataService;

    const PROP_DOCUMENT_DATA = "PROP_DOCUMENT_DATA";
    const PROP_DOCUMENT_TYPE = "PROP_DOCUMENT_TYPE";
    //const PROP_DOCUMENT_SIDE = "PROP_DOCUMENT_SIDE";

    const VIEW_MODE_IMAGE_VIEWER = "result";
    const BASE_64_IMAGE_PREFIX = "base64,";

    const CMD_SCAN_AGAIN = "SCAN_AGAIN";
    const CMD_ACCEPT = "ACCEPT";
    const CMD_NEXT_IMAGE = "NEXT_IMAGE";
    const CMD_ZOOM = "ZOOM_IN_OUT";

    const INPUT_HINT = "InputHint";
    const NO_IMAGE = "NoImage";
    const MESSAGE = "Message";
    const LEVEL = "Level";


    let _idx = 0;
    let _module;
    let _isNextAllowed = false;
    let _isAcceptAllowed = false;
    let _isScanAgainAllowed = false;


    /**
     * The ScannedImageViewerViewModel is primary used for presenting image data after a scan process.
     * <p>
     * The viewmodel is used with more than one viewkey. Each viewkey usually owns the mode attribute configuration in order
     * to give a mode of:
     * <ul>
     *     <li>prepare - preparing mode</li>
     *     <li>scanning - scanning mode</li>
     *     <li>result - result after scanning mode</li>
     * </ul>
     * </p>
     * <br>
     * ScannedImageViewerViewModel deriving from {@link Wincor.UI.Content.ScanCodeAnimationsViewModel} class.
     * @class
     * @since 2.0/10
     */
    Wincor.UI.Content.ScannedImageViewerViewModel = class ScannedImageViewerViewModel extends Wincor.UI.Content.ScanCodeAnimationsViewModel {

        /**
         * The current image path.
         * @type {function | ko.observable}
         * @bindable
         */
        imagePath = null;

        /**
         * Flag that is true, when the image has been accepted.
         * @type {function | ko.observable}
         * @bindable
         * @private
         * @ignore
         */
        isAccepted = null;

        /**
         * The number of images.
         * @type {Number}
         */
        len = 0;

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
         * The current document side.
         * <br>
         * The known sides are:
         * <ul>
         *     <li>Front</li>
         *     <li>Back</li>
         * </ul>
         * @type {function | ko.observable}
         * @bindable
         */
        docSide = null;

        /**
         * Contains the retrieved <i>PROP_DOCUMENT_DATA</i> image data after {@link  Wincor.UI.Content.ScannedImageViewerViewModel#retrieveData}
         * @type {Object}
         */
        imageData = null;

        /**
         * Initializes this view model.
         * @param {Object} module the scanned image code-behind module.
         * @lifecycle viewmodel
         */
        constructor(module) {
            super();
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> ScannedImageViewerViewModel");
            _module = module;
            if (!_module) {
                _logger.error("This view model needs the corresponding code-behind module. Please deliver with '... new ScannedImageViewerViewModel(this);'");
            }
            this.imagePath = ko.observable("");
            this.imageData = null;
            this.isAccepted = ko.observable(false);
            this.len = 0;
            this.docType = "";
            this.docSide = ko.observable("");
            this.mode = ko.observable("");
            this.messageHints = {
                noImage: {messageText: "", messageLevel: ""}
            };
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< ScannedImageViewerViewModel");
        }

        /**
         * Handler function to remove/clear members.
         * Overridden to clear data list items, flags and counter.
         * @lifecycle viewmodel
         */
        onDeactivated() {
            _logger.log(_logger.LOG_INOUT, "> ScannedImageViewerViewModel::onDeactivated()");
            super.onDeactivated();
            _isAcceptAllowed = _isNextAllowed = _isScanAgainAllowed = false;
            this.docSide("");
            this.cmdRepos.whenAvailable(CMD_NEXT_IMAGE).then(() => {
                this.cmdRepos.setVisible(CMD_NEXT_IMAGE, false);
            });
            _logger.log(_logger.LOG_INOUT, "< ScannedImageViewerViewModel::onDeactivated");
        }

        /**
         * Cleans several member of this class.
         * @lifecycle viewmodel
         */
        clean() {
            _logger.log(_logger.LOG_INOUT, "> ScannedImageViewerViewModel::clean()");
            super.clean();
            this.len = 0;
            this.imagePath("");
            this.isAccepted(false);
            this.mode("");
            this.docType = "";
            _idx = 0;
            this.imageData = _module = null;
            this.messageHints = {
                noImage: {messageText: "", messageLevel: ""}
            };
            _logger.log(_logger.LOG_INOUT, "< ScannedImageViewerViewModel::clean");
        }
        
        /**
         * This method usually initializes data before text and/or business data are retrieved, such as e.g. viewkey configuration.
         * Overrides {@link Wincor.UI.Content.BaseViewModel#observe}
         * @param {String} observableAreaId the area to observe via knockout
         * @lifecycle viewmodel
         */
        observe(observableAreaId) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `> ScannedImageViewerViewModel::observe(observableAreaId=${observableAreaId})`);
            let mode = this.viewConfig.config && this.viewConfig.config.mode ? this.viewConfig.config.mode : "result";
            this.mode(mode);
            _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, `. ScannedImageViewerViewModel::observe mode=${mode}`);

            if (this.viewConfig.commandconfig) {
                if (parseInt(this.viewConfig.commandconfig[CMD_NEXT_IMAGE]) !== this.CMDSTATE.HIDDEN) {
                    _isNextAllowed = true;
                }
                if (parseInt(this.viewConfig.commandconfig[CMD_ACCEPT]) !== this.CMDSTATE.HIDDEN) {
                    _isAcceptAllowed = true;
                }
                if (parseInt(this.viewConfig.commandconfig[CMD_SCAN_AGAIN]) !== this.CMDSTATE.HIDDEN) {
                    _isScanAgainAllowed = true;
                }
            }
            this.cmdRepos.whenAvailable(CMD_ZOOM).then(() => {
                if (mode === VIEW_MODE_IMAGE_VIEWER) {
                    this.cmdRepos.setActive(CMD_ZOOM, true);
                } else {
                    this.cmdRepos.setVisible(CMD_ZOOM, false);
                }
            });
            super.observe(observableAreaId);
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< ScannedImageViewerViewModel::observe");
            return this;
        }

        /**
         * Retrieves the image data.
         * The data containing a path or Base64.
         * @return {Promise} resolved when PROP_DOCUMENT_DATA is retrieved and evaluated.
         */
        retrieveData() {
            return ext.Promises.promise((resolve, reject) => {
                if (!this.designMode) {
                    _dataService.getValues([PROP_DOCUMENT_DATA], result => {
                        try {
                            this.imageData = result[PROP_DOCUMENT_DATA];
                            this.imageData = result[PROP_DOCUMENT_DATA] || {images: [{}]};
                            this.imageData = typeof this.imageData !== "object" ? JSON.parse(this.imageData) : this.imageData;
                            _logger.LOG_DATA && _logger.log(_logger.LOG_DATA, `. ScannedImageViewerViewModel::retrieveData imageData=${this.imageData}`);
                            let images = this.imageData.images;
                            this.len = images.length;
                            _idx = this.len - 1; // default is the last image
                            // update the path backslashes + add file protocol
                            let img, path;
                            for (let i = _idx; i >= 0; i--) {
                                path = images[i].imagePath;
                                if (path && path.indexOf(BASE_64_IMAGE_PREFIX) === -1) {
                                    img = path.replace(/\\/g, "/"); // replace each backslash with one forward slash
                                    if (img.indexOf(":") !== -1 && img.indexOf("file:") === -1) { // add 'file:///' when we work with an absolute path
                                        img = `file:///${img}`;
                                    }
                                    images[i].imagePath = `${img}?__cachebuster=${Date.now() + i}`; // prevent from caching
                                } else {
                                    this.showMessageHint(this.messageHints.noImage);
                                }
                            }
                            if (_isNextAllowed && this.len > 1) {
                                _idx = 0; // default is the first image, usually front side
                                this.cmdRepos.whenAvailable(CMD_NEXT_IMAGE).then(() => {
                                    if (this.len > 1) {
                                        this.cmdRepos.setActive(CMD_NEXT_IMAGE, true);
                                    }
                                });
                            }
                            let currImg = images[_idx];
                            if (currImg.aspect) {
                                this.docSide(currImg.aspect);
                            }
                            if (_isAcceptAllowed) {
                                this.cmdRepos.whenAvailable(CMD_ACCEPT).then(() => {
                                    this.cmdRepos.setActive(CMD_ACCEPT, currImg.imagePath !== null && currImg.imagePath !== "");
                                });
                            }
                            this.cmdRepos.whenAvailable(CMD_ZOOM).then(() => {
                                this.cmdRepos.setActive(CMD_ZOOM, currImg.imagePath !== null && currImg.imagePath !== "");
                            });
                            this.imagePath(currImg.imagePath);
                            resolve(this.imageData);
                        } catch (e) {
                            reject(`ScannedImageViewerViewModel::retrieveData failed with error=${e}`);
                        }
                    }, null);
                } else {
                    resolve();
                }
            });
        }

        /**
         * Sets the index for of the image array.
         * @param {Number} idx the index for the image array
         */
        setIndex(idx) {
            _idx = idx;
        }

        /**
         * Gets the index of the image array.
         * @returns {number} the current index
         */
        getIndex() {
            return _idx;
        }

        /**
         * Initializes the text and data.
         * This method reads the property <i>PROP_DOCUMENT_TYPE</i> and prepares the possible message when no image could be retrieved.
         * @param {object} args will contain the promise which getting resolved when everything is prepared
         * @see {Wincor.UI.Content.BaseViewModel#onInitTextAndData}
         * @lifecycle viewmodel
         */
        onInitTextAndData(args) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> ScannedImageViewerViewModel::onInitTextAndData()");
            if (!this.designMode) {
                this.messageHints.noImage.messageText = this.getLabel(this.buildGuiKey(INPUT_HINT, NO_IMAGE, MESSAGE), ""); // retrieve an observable
                this.messageHints.noImage.messageLevel = this.getLabel(this.buildGuiKey(INPUT_HINT, NO_IMAGE, MESSAGE, LEVEL), ""); // retrieve an observable
                args.dataKeys.push(_dataService.getValues(PROP_DOCUMENT_TYPE)
                    .then(result => {
                        this.docType = result[PROP_DOCUMENT_TYPE];
                    })
                );
            } else { // basic design mode
                args.dataKeys.push(this.designTimeRunner.retrieveJSONData("ScannedImageData").then(data => {
                    if (data) {
                        this.imageData = data;
                        this.len = this.imageData.images.length;
                        this.imagePath(this.imageData.images[0].imagePath);
                    }
                }));
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< ScannedImageViewerViewModel::onInitTextAndData");
            return super.onInitTextAndData(args);
        }

        /**
         * Overridden to get informed when an arbitrary view model send an event.
         * We want to get informed when the command "MAGNIFY_GLASS" has been pressed.
         * @param {string} id the event id
         * @param {object=} data the event data, usually a JSON notated object, the VM which overrides this method
         * has to know which type of event data are expected dependent by the id of the event.
         * @eventhandler
         */
        onViewModelEvent(id, data) {
            if (id === "MAGNIFY_GLASS_PRESSED") {
                _module.onMagnifyGlass();
            }
        }

        /**
         * Handles on button pressed actions:<br>
         * <ul>
         *     <li>ACCEPT</li>
         *     <li>SCAN_AGAIN</li>
         *     <li>NEXT_IMAGE</li>
         *     <li>BTN_SCROLL_DOWN</li>
         *     <li>ZOOM_IN_OUT</li>
         * </ul>
         * @param {string} id the command id such as 'ACCEPT', etc
         * @eventhandler
         */
        onButtonPressed(id) {
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `> ScannedImageViewerViewModel::onButtonPressed id=${id}`);
            switch (id) {
                case CMD_ACCEPT:
                    super.onButtonPressed(id);
                    break;

                case CMD_ZOOM:
                    if (_module) {
                        let zState = _module.getZoomState();
                        if (zState === 0) {
                            if (_isAcceptAllowed) {
                                this.cmdRepos.setVisible(CMD_ACCEPT, false);
                            }
                            if (_isScanAgainAllowed && this.cmdRepos.hasCommand(CMD_SCAN_AGAIN)) {
                                this.cmdRepos.setVisible(CMD_SCAN_AGAIN, false);
                            }
                        } else {
                            if (_isAcceptAllowed) {
                                this.cmdRepos.setActive(CMD_ACCEPT, true);
                            }
                            if (_isScanAgainAllowed && this.cmdRepos.hasCommand(CMD_SCAN_AGAIN)) {
                                this.cmdRepos.setActive(CMD_SCAN_AGAIN, true);
                            }
                        }
                        _module.zoomToggle({type: "tap"});
                    }
                    break;

                case CMD_NEXT_IMAGE:
                    _module.onNextImage();
                    _idx = _idx < this.len - 1 ? ++_idx : 0;
                    const data = this.imageData.images[_idx];
                    if (data.aspect) {
                        this.docSide(data.aspect);
                    }
                    this.imagePath(data.imagePath);
                    break;

                case CMD_SCAN_AGAIN:
                    super.onButtonPressed(id);
                    break;

                default:
                    super.onButtonPressed(id);
                    break;
            }

            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< ScannedImageViewerViewModel::onButtonPressed");
        }
    }
});


