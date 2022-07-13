/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ ViewHelper.js 4.3.1-210630-21-14cd17d3-1a04bc7d
 */
define(["jquery", "extensions", "config/Config", "vm-util/UICommanding", "knockout", "plugins/router", 'durandal/viewLocator', "plugins/dialog", "ui-content", "jquery-ui"], ($, ext, config, commanding, ko, router, viewLocator, dialog, content) => {
    "use strict";
    console.log("AMD:ViewHelper");

    const _logger = Wincor.UI.Service.Provider.LogProvider;

    const ID_WAIT_SPINNER = "#waitSpinner";
    const ID_WAIT_SPINNER_MODAL_OVERLAY = "#waitSpinnerModalOverlay";

    const CLASS_ELEMENT_PRESSED = "pressed";
    const CLASS_ELEMENT_MODAL_OVERLAY_UNDARKEN = "modalOverlayUndarken";

    const CMD_SCROLL_DOWN = "BTN_SCROLL_DOWN";
    const CMD_SCROLL_UP = "BTN_SCROLL_UP";

    const _event = {};

    let _isPopupMessageActive = false;
    let _isPopupHintActive = false;
    let _isWaitSpinnerActive = false;
    let $_modalWindowElement = window.document.createElement("div");
    let _width = $(window).innerWidth();
    let _height = $(window).innerHeight();
    let _progressBarId = -1;
    let _toggleCommandLabelId = -1;
    let _popupMap = Object.create(null);
    let _mediaCarouselId = "";
    let _mediaCarouselTimerId = -1;

    let _popupProcessing = false;
    let _lastEppkey = "";
    let _lastConfArray = [];
    let _lastCharIdx = 0;
    let _timerId = -1;
    let _popupModule = null;
    let _showPopupMessagePromise = ext.Promises.Promise.resolve();


    /**
     * The ViewHelper class is a singleton and usually meant to help views doing its typical work.
     * Usually the helper is used by the view's code-behind modules, but maybe directly used by the view fragment itself by e.g. access the ViewHelper
     * with $root.viewHelper.getActiveModule().anyFunction() whereas 'anyFunction()' stands for any public function of the ViewHelper class.
     * <br>
     * The typical functions provided by this class are higher leveled for doing animations, showing or hiding a popup or even handle a whole media carousel.
     * At any time if there are repetitive DOM work to do for code-behind module or even a viewmodel than its a good idea to provide a standard function here.
     * @class
     * @since 1.0/00
     */
    Wincor.UI.Content.ViewHelper = class ViewHelper {

        /**
         * A jQuery trigger event.
         * @type {object}
         */
        event = _event;

        /**
         * Define used in {@link Wincor.UI.Content.ViewHelper#showPopupHint}
         * @const
         */
        POPUP_DEFAULT_TYPE = 0;

        /**
         * Define used in {@link Wincor.UI.Content.ViewHelper#showPopupHint}
         * @const
         */
        POPUP_INFO_TYPE = 1;

        /**
         * Define used in {@link Wincor.UI.Content.ViewHelper#showPopupHint}
         * @const
         */
        POPUP_WARN_TYPE = 2;

        /**
         * Define used in {@link Wincor.UI.Content.ViewHelper#showPopupHint}
         * @const
         */
        POPUP_ERROR_TYPE = 3;
        /**
         * Used for 'options' parameter in {@link Wincor.UI.Content.BaseViewModel#showPopupMessage} and as retCode for callback if pressed.
         * - the POPUP_BTN_xxx values can be bitwise 'or'-ed.
         * @type Number
         * @const
         */
        POPUP_BTN_OK = 1;

        /**
         * Used for 'options' parameter in {@link Wincor.UI.Content.BaseViewModel#showPopupMessage} and as retCode for callback if pressed.
         * - the POPUP_BTN_xxx values can be bitwise 'or'-ed.
         * @type Number
         * @const
         */
        POPUP_BTN_CANCEL = 2;

        /**
         * Used as retCode for callback of popup if an error occurred.
         * @type Number
         * @const
         */
        POPUP_ERROR = -1;

        FILTER_NONE = 0;
        FILTER_DARK = 1;
        FILTER_HIGH_CONTRAST = 2;
        FILTER_BLUR = 3;

        /**
         * The view type either 'softkey' or 'touch'.
         * Get this information for determine specific things to be done based on the view type.
         * @type {string}
         */
        viewType = "";

        /**
         * Reference to the {@link Wincor.UI.Content.StyleResourceResolver}.
         */
        styleResolver = null; // is set by the StyleResourceResolver itself

        constructor() {
            // bind an internal event handling function to it
            this.event = _event;
            this.viewType = config.viewType;
            $("body").attr("data-border-drawing", config.BORDER_DRAWING_ON);
            _logger.LOG_INFO && _logger.log(_logger.LOG_INFO, `ViewHelper::viewType=${this.viewType}`);
        }

        /**
         * Cleans up some private data.
         */
        clean() {
            _isPopupMessageActive = false;
            _popupModule = null;
        }

        /**
         * Cleans up the member.
         */
        shutdown() {
            this.clean();
            this.event = null;
            this.styleResolver.shutdown();
            this.styleResolver = null;
        }
        
        setStyleResolver(styleResolver) {
            this.styleResolver = styleResolver;
        }

        setEvent(newEvent) {
            this.event = newEvent;
            let $evt = $(newEvent);
            $evt.on("uicommandautomation", (event, data) => this.commandAutomation(data.object, void 0, data.eppKey));
            $evt.on("uipopuphint", (event, data) =>
                //{ object: { msg: msg, type: type, id: id}, viewModel: this}
                this.showPopupHint(data.msg, data.type, data.id, data.callback)
            );
            $evt.on("uipopupmessage", (event, data) => this.showPopupMessage(data.component, data.callback)
            );
            $evt.on("uiremovepopup", (event, data) =>
                //{ object: null, viewModel: this}
                this.removePopup(data)
            );
            $evt.on("uiremovepopupmessage", (event, data) =>
                //{ object: null, viewModel: this}
                this.hidePopupMessage(data)
            );
        }

        /**
         * Triggers the command with the given id by emulating several mouse events.
         * If the element (usually a button) is associated with a UICommand then the triggering
         * is only done if the command isn't suspended at the moment.
         * @param {String} id the element id of the command to trigger
         * @param {Object} ev hammer recognized tap event or eppkey
         * @param {String=} [eppKey=""] the eppKey for which the command automation is done. Default is empty string
         */
        commandAutomation(id, ev, eppKey = "") {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `> ViewHelper::commandAutomation id=${id}`);
            let cmd = commanding.getCommandByElementId(id);
            const container = Wincor.UI.Content.ViewModelContainer;
            if(container.viewActivated && cmd && !cmd.suspended && cmd.isActive.value() === true) {
                let $elem = $(cmd.element);
                if($elem.length) {
                    ev = ev || {
                        target: {},
                        center: {
                            x: 0,
                            y: 0
                        }
                    };
                    ev.eppKey = eppKey;
                    // trigger a visual effect
                    if(config.viewType === "touch") {
                        // this will occur on touch layout with claimed EPP keys
                        const PERCENTAGE = 15;
                        const offset = $elem.offset();
                        const w = $elem.width();
                        const h = $elem.height();
                        let tilting = "activeCenter";
                        let horizontalMiddle = offset.left + (w / 2);
                        let horizontalOffset = w / 100 * PERCENTAGE;
                        let verticalMiddle = offset.top + (h / 2);
                        let verticalOffset = h / 100 * PERCENTAGE;
                        if(ev.center) {
                            let x = ev.center.x;
                            let y = ev.center.y;
                            if(x >= horizontalMiddle + horizontalOffset) {
                                if(y <= verticalMiddle - verticalOffset) {
                                    tilting = "activeUpperRight";
                                } else if(y > verticalMiddle + verticalOffset) {
                                    tilting = "activeLowerRight";
                                } else {
                                    // actually could be tilted to the right
                                    tilting = "activeRight";
                                }
                            } else if(x <= horizontalMiddle - horizontalOffset) {
                                if(y <= verticalMiddle - verticalOffset) {
                                    tilting = "activeUpperLeft";
                                } else if(y > verticalMiddle + verticalOffset) {
                                    tilting = "activeLowerLeft";
                                } else {
                                    // actually could be tilted to the left
                                    tilting = "activeLeft";
                                }
                            } else {
                                if(y <= verticalMiddle - verticalOffset) {
                                    tilting = "activeUpper";
                                } else if(y > verticalMiddle + verticalOffset) {
                                    tilting = "activeLower";
                                }
                            }
                        }
                        $elem.addClass(tilting);
                        setTimeout(() => {
                            // check whether the former got element and command still exists after this timeout
                            if (commanding.hasCommand(cmd.id) && $(`#${$elem[0].id}`).length) {
                                $elem.removeClass(tilting); // set back to normal
                            }
                        }, config.COMMAND_AUTOMATION_DURATION);
                    } else {
                        // support checkbox/radio is triggered even the click event was outside (surrounded div with command binding)
                        // ensure we trigger a single checkbox/radio item only
                        // we don't want to trigger manually when the input or label 'for' input has been touched
                        let $item = $elem.find(":checkbox");
                        if($item.length === 1 && (!ev || ev.target.type !== "checkbox" && ev.target.htmlFor !== $item[0].id)) {
                           $item.click();
                        } else { // radio type?
                            $item = $elem.find(":radio");
                            if($item.length === 1 && (!ev || ev.target.type !== "radio")) {
                                // Ensure radio item is checked, then trigger a click event, otherwise ko would not trigger the bindings
                                $item.prop("checked", true);
                                $item.click();
                            }
                        }
                        $elem.addClass(CLASS_ELEMENT_PRESSED);
                        setTimeout(() => {
                            // check whether the former got element and command still exists after this timeout
                            if(commanding.hasCommand(cmd.id) && $(`#${$elem[0].id}`).length) {
                                $elem.removeClass(CLASS_ELEMENT_PRESSED); // set back to normal
                            }
                        }, config.COMMAND_AUTOMATION_DURATION);
                        // decouple tap from optical states, otherwise experience is not fluent
                    }
                    if(cmd.delegates.handlers && cmd.delegates.handlers["tap"]) {
                        cmd.delegates.handlers["tap"](ev);
                    }
                } else {
                    _logger.log(_logger.LOG_ERROR, `Can't get element for id=${id}`);
                }
            } else {
                if(!cmd) {
                    _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `. No command available for id=${id}`);
                } else  {
                    if(cmd.suspended) {
                        _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `. Command of id=${id} is suspended`);
                    } else if (!cmd.isActive.value()) {
                        _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `. Command of id=${id} is not active`);
                    }
                }
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< ViewHelper::commandAutomation");
        }

        /**
         * Shows up a popup-hint (similar to a tooltip-balloon, depending on the used styling)
         * @param {String} msg The message to be displayed (can contain HTML-code and styling information)
         * @param {Number} type The type of the hint<br>{@link Wincor.UI.Content.ViewHelper#POPUP_DEFAULT_TYPE}
         * <br>{@link Wincor.UI.Content.ViewHelper#POPUP_ERROR_TYPE}<br>{@link Wincor.UI.Content.ViewHelper#POPUP_INFO_TYPE}
         * <br>{@link Wincor.UI.Content.ViewHelper#POPUP_WARN_TYPE}
         * @param {string} id The id of the element associated with this popup-hint
         * @param {Function=} callback the callback function to call and to deliver the pop up hint element
         * @return {HTMLElement} The dynamically created element.
         */
        showPopupHint(msg, type, id, callback) {
            //_logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> ViewHelper::showPopupHint(msg=" + msg + ", type=" + type + ", id=" + id + ")");
            const self = this;
            if(_isPopupHintActive) {
                // ATTENTION: in async remove case -_modalWindowElement will be undefined returned !
                this.removePopup(() => createPopup());
            } else {
                createPopup();
            }
            function createPopup() {
                let styleClass = "popupHint", level;
                switch(type) {
                    case self.POPUP_WARN_TYPE:
                        level = "WarningBox";
                        break;
                    case self.POPUP_ERROR_TYPE:
                        level = "ErrorBox";
                        break;
                    default:
                        level = "InfoBox";
                }
                $_modalWindowElement = $("<div>");
                $_modalWindowElement.addClass(styleClass);
                $_modalWindowElement.attr("data-content-style", level);
                let $element = $("#" + id);
                if ($element.length) {
                    let position = $element.offset();
                    $_modalWindowElement.html(msg);
                    // stopping animations
                    if(!config.VIEW_ANIMATIONS_ON) {
                        $_modalWindowElement.css({"animation": "none"});
                        $_modalWindowElement.find("*").css({"animation": "none"});
                    }

                    // The window element has to be attached to the document before calculating the position (to receive actual sizes).
                    $("body").append($_modalWindowElement);
                    if((position.left + $_modalWindowElement[0].offsetWidth) < $(window).width()) {
                        $_modalWindowElement.css("left", `${position.left + $element[0].offsetWidth}px`);
                    }
                    else {
                        $_modalWindowElement.css("left", `${position.left - $_modalWindowElement[0].offsetWidth}px`);
                    }
                    $_modalWindowElement.css("top", position.top + "px");
                    _isPopupHintActive = true;
                    // trigger the callback function if its defined
                    if(callback) {
                        callback($_modalWindowElement);
                    }
                }
                else {
                    _logger.LOG_INFO && _logger.log(_logger.LOG_INFO, `ViewHelper::showPopupHint.createPopup: element with id=${id} not found`);
                }
            }
            _logger.LOG_INFO && _logger.log(_logger.LOG_INFO, "ViewHelper::showPopupHint done.");
            return $_modalWindowElement;
        }

        /**
         * Removes the current pop up hint.
         * @param {{}|function=} [dataArgs={}] function to call back if the current pop up has been removed.
         */
        removePopup(dataArgs = {}) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> ViewHelper::removePopup()");
            let data = dataArgs;
            if (dataArgs && typeof dataArgs === "function") {
                data = {
                    callback: dataArgs
                }
            }

            if(_isPopupHintActive && $_modalWindowElement !== null) {
                if(config.VIEW_ANIMATIONS_ON && data.immediate !== true) {
                    $_modalWindowElement.transition({opacity: 0}, 600, () => {
                        if($_modalWindowElement) { // check again (may be pop has been already removed now)
                            //using knockout assures removal of bindings
                            ko.cleanNode($_modalWindowElement[0]);
                            $_modalWindowElement.remove();
                            $_modalWindowElement = null;
                            _isPopupHintActive = false;
                        }
                        if(data && typeof data.callback === "function") {
                            data.callback();
                        }
                    });
                }
                else { // remove without animation
                    //window.document.body.removeChild(_modalWindowElement);
                    ko.cleanNode($_modalWindowElement[0]);
                    $_modalWindowElement.remove();
                    $_modalWindowElement = null;
                    _isPopupHintActive = false;
                    if(data && typeof data.callback === "function") {
                        data.callback();
                    }
                }
            }
            else {
                _isPopupHintActive = false;
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< ViewHelper::removePopup");
        }

        /**
         * Displays a pop up window and an overlay.
         * @param {String} component path to the template to inject
         * @param {function=} callback is called when the popup has been opened
         * @return {Promise} a promise which gets resolved when the opened popup is closed again afterwards
         */
        showPopupMessage(component, callback) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `> ViewHelper::showPopupMessage component=${component}`);
            component = config.modulesPath + component.replace(".html", "");
            _popupMap.lastPopup = component;
            return ext.Promises.promise((resolve, reject) => {
                require([component], module => {
                    _popupMap[_popupMap.lastPopup] = module;
                    _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "* ViewHelper::showPopupMessage loaded module");
                    if(callback) {
                        _isPopupMessageActive = true;
                        _popupModule = module;
                        callback(true, module);
                    }
                    viewLocator.useConvention(config.modulesPath, config.componentsPath); // switch the views module path convention
                    _showPopupMessagePromise = dialog.show(module, {isPopup: true}) // activationData isPopup = true will be evaluated by baseaggregate::compositionComplete for firePopupNotification
                        .then(() => {
                            viewLocator.useConvention(config.modulesPath, config.viewsPath); // restore path's
                            $("[data-view-id]").attr("data-popup-active", "false");
                            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `< ViewHelper::showPopupMessage closed ${component}`);
                            resolve();
                        })
                        .catch(reason => {
                            viewLocator.useConvention(config.modulesPath, config.viewsPath); // restore path's
                            _logger.error(`ViewHelper::showPopupMessage error calling dialog.show -> ${reason}`);
                            _popupMap.lastPopup = null;
                            if(callback) {
                                callback(false);
                            }
                            _isPopupMessageActive = false;
                            reject(reason);
                        });
                    return _showPopupMessagePromise;
                }, reason => {
                    viewLocator.useConvention(config.modulesPath, config.viewsPath); // restore path's
                    _logger.error(`ViewHelper::showPopupMessage error calling dialog.show -> ${reason}`);
                    _popupMap.lastPopup = null;
                    if(callback) {
                        callback(false);
                    }
                    reject(reason);
                });
            });
        }
    
        /**
         * Removes a popup which has been opened by {@link Wincor.UI.Content.ViewHelper#showPopupMessage}
         * @param {Object=} data the data argument object which at least containing a <code>result</code> object and a <code>promise</code> attribute:
         * <br>
         * {
         *     result: { promise: null}
         * }
         * @return {Promise} gets resolved when the popup has been closed or rejected when a closing popup has been failed
         */
        hidePopupMessage(data) {
            dialog.close(_popupMap[_popupMap.lastPopup]);
            if(data && data.result) {
                data.result.promise = _showPopupMessagePromise;
            }
            _showPopupMessagePromise
                .then(() => {
                    _isPopupMessageActive = false;
                    _popupModule = null;
                });
            return _showPopupMessagePromise;
        }

        /**
         * Checks whether a popup message is active.
         * The flag is true while a popup is open via {@link Wincor.UI.Content.ViewHelper#showPopupMessage}.
         * @returns {boolean} true, if popup message is open via {@link Wincor.UI.Content.ViewHelper#showPopupMessage} and false if it has been closed via {@link Wincor.UI.Content.ViewHelper#hidePopupMessage}
         */
        isPopupMessageActive() {
            return _isPopupMessageActive;
        }

        /**
         * Checks whether a popup hint is active.
         * The flag is true while a popup hint is open via {@link Wincor.UI.Content.ViewHelper#showPopupHint}.
         * @returns {boolean} true, if popup hint is open via {@link Wincor.UI.Content.ViewHelper#showPopupHint} and false if it has been closed via {@link Wincor.UI.Content.ViewHelper#removePopup}
         */
        isPopupHintActive() {
            return _isPopupMessageActive;
        }

        /**
         * Hides the view by fading out opacity.
         */
        fadeOut() {
            let time = 500; // millis
            let $body = $("body");
            $body.css({ "animation": `fadeOut ${time / 1000}s`, "visibility": "visible"});
            setTimeout(() => $body.css({ "opacity": "0" }), time - 10);
        }

        /**
         * Shows a the wait spinner of the waitspinner.component.
         * A possible open pop up is closed before the spinner appears.
         * @param {boolean=} darken true, if the view background should be darken during spinning. False is the default.
         * @param {boolean=} hideModalOverlay false, if the view background should <b>not</b> be overlapped during spinning. False is the default.
         * Please note: If set true, then underlying elements are touchable when spinning is active.
         * @return Promise
         */
        showWaitSpinner(darken, hideModalOverlay) {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `. ViewHelper::showWaitSpinner darken=${darken}`);
            return this.hidePopupMessage().then(() => {  // remove a possible presented popup first, because we can't overlay it otherwise
                function show() {
                    let $spinContainer = $(ID_WAIT_SPINNER);
                    if($spinContainer.length) {
                        _isWaitSpinnerActive = true;
                        // let me control the central point, because we know exactly the windows size and
                        // we can consider the figure width within the calculation.
                        let $win = $(window);
                        _width = $win.width();
                        _height = $win.height();
                        let left = Math.round(_width / 2 - ($spinContainer.outerWidth() / 2));
                        let top = Math.round(_height / 2 - ($spinContainer.outerHeight() / 2));
                        let $overlay = $(ID_WAIT_SPINNER_MODAL_OVERLAY);
                        if($overlay.length) {
                            if(!hideModalOverlay) {
                                $overlay.css({display: "block", visibility: "visible"});
                            } else {
                                $overlay.css({display: "block", visibility: "hidden"}); // underlying elements are touchable when spinning
                            }
                            if(darken === false) {
                                $overlay.addClass(CLASS_ELEMENT_MODAL_OVERLAY_UNDARKEN);
                            }
                        }
                        $spinContainer.css({display: "block", visibility: "visible", position: "absolute", top: `${top}px`, left: `${left}px`});
                    }
                }
                
                // check for a running wait line (pleasewait.html)
                let $waitLine = $("#waitLine");
                if($waitLine.length) {
                    if(config.VIEW_ANIMATIONS_ON) {
                        $waitLine.fadeOut({
                            duration: 150, complete: () => {
                                show();
                            }
                        });
                    } else {
                        $waitLine.hide();
                        show();
                    }
                } else {
                    show();
                }
            });
        }

        /**
         * Removes the wait spinner of the waitspinner.component.
         */
        removeWaitSpinner() {
            if(_isWaitSpinnerActive) {
                _isWaitSpinnerActive = false;
                // check for a hidden wait line (pleasewait.html)
                let $waitPane = $(ID_WAIT_SPINNER);
                if($waitPane.length) {
                    _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, ". ViewHelper::removeWaitSpinner");
                    $waitPane.css({display: "none", visibility: "hidden"});
                    let $overlay = $(ID_WAIT_SPINNER_MODAL_OVERLAY);
                    if($overlay.length) {
                        $overlay.css({display: "none"});
                        $overlay.removeClass(CLASS_ELEMENT_MODAL_OVERLAY_UNDARKEN);
                    }
                }
                let $waitLine = $("#waitLine");
                if($waitLine.length) {
                    if(config.VIEW_ANIMATIONS_ON) {
                        $waitLine.fadeIn({duration: 150});
                    } else {
                        $waitLine.show();
                    }
                }
            }
        }

        /**
         * Checks whether the wait spinner is currently active.
         * @returns {boolean} true if active, false otherwise
         */
        isWaitSpinnerActive() {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `. ViewHelper::isWaitSpinnerActive ${_isWaitSpinnerActive}`);
            return _isWaitSpinnerActive;
        }

        /**
         * Stops all animations encapsulated in figures, canvas.
         * @param {*=} view the view for stop for. If undefined the body is used instead
         * @see {@link Wincor.UI.Content.ViewHelper#startAnimations}
         */
        stopAnimations(view) {
            let $target = view ? $(view) : $("body");
            let $figures = $target.find("figure");
            document.querySelector("html").setAttribute("data-animations-off", "true");
            $figures.css({"animation": "none", "transition": "none"}); // figures self
            $figures.find("*").css({"animation": "none", "transition": "none"}); // children of figures
            $target.find("*").css({"animation": "none", "transition": "none"});
            $target.find("#flexHeader").find("* :not(.button)").css({"animation": "none", "transition": "none"});
            $target.find("#flexArticle").find("* :not(.button)").css({"animation": "none", "transition": "none"});
            $target.find("#flexNav").find("* :not(.button)").css({"animation": "none", "transition": "none"});
            $target.find("#flexAside").find("* :not(.button)").css({"animation": "none", "transition": "none"});
            $target.find("#flexFooter").find("* :not(.button)").css({"animation": "none", "transition": "none"});
            // specials
            $target.find(".messageArea, #flexMessageContainerArticle").css({"animation": "none", "transition": "none"});
        }
    
        /**
         * Starts all animations encapsulated in figures, canvas that are stopped with {@link Wincor.UI.Content.ViewHelper#stopAnimations}
         * @param {*=} view the view for stop for. If undefined the body is used instead
         * @see {@link Wincor.UI.Content.ViewHelper#stopAnimations}
         */
        startAnimations(view) {
            let $target = view ? $(view) : $("body");
            let $figures = $target.find("figure");
            document.querySelector("html").setAttribute("data-animations-off", "false");
            $figures.css({"animation": "", "transition": ""}); // figures self
            $figures.find("*").css({"animation": "", "transition": ""}); // children of figures
            $target.find("*").css({"animation": "", "transition": ""});
            $target.find("#flexHeader").find("* :not(.button)").css({"animation": "", "transition": ""});
            $target.find("#flexArticle").find("* :not(.button)").css({"animation": "", "transition": ""});
            $target.find("#flexNav").find("* :not(.button)").css({"animation": "", "transition": ""});
            $target.find("#flexAside").find("* :not(.button)").css({"animation": "", "transition": ""});
            $target.find("#flexFooter").find("* :not(.button)").css({"animation": "", "transition": ""});
            // specials
            $target.find(".messageArea, #flexMessageContainerArticle").css({"animation": "", "transition": ""});
        }
    
        applyFilter(filterType) {
            let value = "";
            switch(filterType) {
                case this.FILTER_NONE:
                    break;
                case this.FILTER_DARK:
                    value = "grayscale(100%)";
                    break;
                case this.FILTER_HIGH_CONTRAST:
                    value = "grayscale(70%) contrast(350%) invert(100%)";
                    break;
                case this.FILTER_BLUR:
                    value = "blur(15px)";
                    break;
                default:
                    break;
            }
            $("body").css({"filter": value});
        }

        /**
         * Updates the view key for the current view.
         * The method scans for '<code>data-view-key</code>' custom attributes and updates each value.
         * @param viewKey {string} contains the current view key or an empty string if no valid view key is available.
         */
        updateViewKey(viewKey) {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `. ViewHelper::updateViewKey viewKey=${viewKey}`);
            if(viewKey !== undefined && viewKey !== null) {
                // ---
                // Hint: The following commented code is able to find the first child (usually a div) after the body
                // let firstChild = $("body").children(":first");
                // let id = firstChild.attr("id");
                // ---
                //Now we select all elements with the attribute 'data-view-key' and set the actual genuine view key
                $("[data-view-key]").each((i, elm) => $(elm).attr("data-view-key", viewKey));
            }
        }

        /**
         * Initializes the scroll up/down buttons.
         * The command states of a scroll bar with command UP/DOWN depends on the given arguments.
         * @param {boolean} isScrollUp true, if the command scroll up is active
         * @param {boolean} isScrollDown true, if the command scroll down is active
         * @param {boolean} isSubMenuActive true, if a sub menu is active
         * @param {object} viewModel the view model instance which usually inherits from ListViewModel or is a ListViewModel instance
         */
        initScrollbarButtons(isScrollUp, isScrollDown, isSubMenuActive, viewModel) {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `. ViewHelper::initScrollbar isScrollUp=${isScrollUp}, isScrollDown=${isScrollDown}, isSubMenuActive=${isSubMenuActive}`);
            // handle scrollable command states
            commanding.whenAvailable([CMD_SCROLL_DOWN, CMD_SCROLL_UP]).then(() => {
                // hide or show the DOM elements in order to not disturb the function buttons which uses the 'flexNavSK03' & 'flexAsideSK03' ids as well.
                const $up = $(`#${commanding.getBoundElement(CMD_SCROLL_UP).id}`).parent(); // we show/hide the 'flexNavSK03' container
                const $down = $(`#${commanding.getBoundElement(CMD_SCROLL_DOWN).id}`).parent(); // we show/hide the 'flexAsideSK03' container
                if(!isScrollUp && !isScrollDown) {
                    if(!isSubMenuActive) {
                        // only if the initial view state is other than disabled we hide the scroll buttons, otherwise we assume the buttons are desired to be shown
                        if(commanding.get(CMD_SCROLL_DOWN).initialViewState !== commanding.CMDSTATES.DISABLED &&
                            commanding.get(CMD_SCROLL_UP).initialViewState !== commanding.CMDSTATES.DISABLED) {

                            commanding.setVisible([CMD_SCROLL_DOWN, CMD_SCROLL_UP], false);
                        }
                        if(viewModel.isGenericListMode) {
                            $down.hide();
                            $up.hide();
                        }
                    } else { // a sub menu is active
                        commanding.setActive(CMD_SCROLL_UP, true);
                        $up.show();
                        commanding.setVisible(CMD_SCROLL_DOWN, isScrollDown);
                        if(isScrollDown) {
                            $down.show();
                        }
                    }
                } else { // switch on scrollable
                    // maybe 'flexNavSK03' or 'flexAsideSK03' was set display=none we have to reset this, because the button will be shown either disabled or enabled at next
                    $up.show();
                    $down.show();
                    commanding.setActive(CMD_SCROLL_UP, isSubMenuActive);
                    commanding.setActive(CMD_SCROLL_DOWN, isScrollDown);
                }
            });
        }

        /**
         * Move the current slide indicator (formerly known as 'active bread crumb') to the given pos.
         * @param {number} pos the position to move to. Starts at 0 and should not exceed the number of indicators (slides or pages).
         * -1 lets the active slide indicator remove from DOM. Useful when move to a new view.
         */
        moveSlideIndicator(pos) {
            let $bcGroup = $("#slideIndicatorGroup");
            let $bcs = $bcGroup.find(".slideIndicator");
            if($bcs.length > 1 && pos > -1 && pos < $bcs.length) {
                let $target = $($bcs[pos]);
                let $jumper = $bcGroup.find("#slideIndicatorJumper");
                if(!$jumper.length) {
                    $jumper = $target.clone();
                    $jumper.attr("id", "slideIndicatorJumper");
                    $jumper.addClass("slideIndicatorActive");
                    $jumper.css({position: "absolute", opacity: 1});
                    $jumper.offset($target.offset());
                    $bcGroup.append($jumper);
                    $target.attr("class", "slideIndicator");
                    $target.removeClass("slideIndicatorActive");
                }
                $jumper.transition({x: $bcs.first().outerWidth(true) * pos}, config.VIEW_ANIMATIONS_ON ? 250 : 0, "in", () => $jumper.attr("data-jumper-active-pos", pos));
            }
            else if(pos === -1) {
                $bcGroup.find("#slideIndicatorJumper").remove();
            }
        }

        /**
         * Forces the elements with the given name/id to redraw.
         * Redrawing is only done on currently displayed elements.
         * @param {string} elementNameOrId the plane element name or an id, on id a hash # character must be prefixed.
         */
        forceElementsRedraw(elementNameOrId) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `> ViewHelper::forceElementsRedraw elementNameOrId=${elementNameOrId}`);
            let $objs = $(elementNameOrId);
            $.each($objs, (i, e) => {
                let $target = $(e);
                if($target.css("display") !== "none" && $target.parent().css("display") !== "none") {
                    if($target.prop("tagName") === "OBJECT") {
                        let orgData = $target.attr("data");
                        // replace icon shortly
                        $target.attr("data", `${config.ROOT_DEFAULT + config.RVT_DEFAULT_NAME + config.IMAGE_FOLDER_NAME}icon_empty.svg`);
                        $target.attr("data", orgData);
                    } else {
                        $target.hide();
                        // SVG: wait a bit to prevent from browser issue: Renderer uses old stop color, even the new svg.css brought a different
                        setTimeout(() => {$target.show()}, 50);
                    }
                }
            });
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< ViewHelper::forceElementsRedraw");
        }

        /**
         * Returns the current active module of Durandal SPA Framework (code-behind reference).
         * In the case a popup is open then it's code-behind module is returned instead of the one of
         * the underling view.
         * @returns {*} the code-behind of the active view or the active popup
         */
        getActiveModule() {
            return !_popupModule ? router.activeItem() : _popupModule;
        }
    
        /**
         * Runs a progress bar with the given timeout time.
         * The function detects
         * @param {Number} timeout in ms
         */
        runTimeoutProgressBar(timeout) {
            if(config.VIEW_ANIMATIONS_ON) {
                let $progressBar = $(".timeoutProgressBar");
                if($progressBar.length) {
                    _progressBarId = setTimeout(() => {
                        _progressBarId = -1;
                        $progressBar.css("animation", "blink 5 1s");
                    }, timeout - ((timeout / 100) * 10));
                    $progressBar.show();
                    $progressBar.transition({width: "100%"}, timeout, "linear", () => {
                        $progressBar.css({"width": "", "opacity": "", "display": ""}); // restore to default CSS;
                    });
                }
            }
        }

        /**
         * Stops a timeout progressbar immediately.
         */
        stopTimeoutProgressBar() {
            if(_progressBarId !== -1) {
                clearTimeout(_progressBarId);
                _progressBarId = -1;
            }
            let $progressBar = $(".timeoutProgressBar");
            if($progressBar.length) {
                $progressBar.clearQueue();
                $progressBar.stop();
                $progressBar.stopTransition();
                $progressBar.css({"width": "", "opacity": "", "display": ""}); // restore to default CSS
            }
        }

        /**
         * Toggles the text-value of a commands associated label-observable
         * @param {String} commandId The command-id to toggle labels for
         * @param  {Array<String>} textArray array of texts to toggle
         * @param {Number} interval in millis seconds
         */
        toggleCommandLabel(commandId, textArray, interval) {
            const len = textArray.length;
            if(_toggleCommandLabelId !== -1) {
                _toggleCommandLabelId = -1;
                return;
            }
            commanding.whenAvailable(commandId).then(() => {
                let $element = $("#" + commanding.get(commandId).element.id);
                let index = textArray.indexOf(commanding.getCmdLabel(commandId));
                index++;
                if(index < 0 || index >= len) {
                    index = 0;
                }
                $element.fadeOut({
                    duration: config.VIEW_ANIMATIONS_ON ? 500 : 0,
                    complete: () => {
                        commanding.setCmdLabel(commandId, textArray[index]);
                        index += 1;
                        if(index >= len) {
                            index = 0;
                        }
                        $element.fadeIn({duration: config.VIEW_ANIMATIONS_ON ? 500 : 0, complete: () =>
                            window.setTimeout(() => this.toggleCommandLabel.apply(this, [commandId, textArray, interval]), interval)});
                    }
                });
            });
        }

        /**
         * Stops the command label toggling.
         */
        stopToggleCommandLabel() {
            _toggleCommandLabelId = -1;
        }

        /**
         * Animates the given jQuery container element and returns a promise resolved when ready.
         * @param {object} $container a valid (length must be > 0) jQuery object
         * @param {String} name the animation name
         * @param {String} time e.g. 0.15s for 150ms
         * @param {String} easing name of easing function
         * @returns {Promise} a promise which gets resolved when animation is ready or off
         */
        animate($container, name, time, easing) {
            return ext.Promises.promise(resolve => {
                let timerId = -1;
                if(config.VIEW_ANIMATIONS_ON && $container && $container.length) {
                    $container.css("animation", ""); // reset the animation state before
                    $container.on("animationend", () => {
                        if(timerId !== -1) {
                            clearTimeout(timerId);
                        }
                        $container.off("animationend");
                        resolve();
                    });
                    $container.css({animation: `${name} ${time} ${easing}`, "animation-fill-mode": "forwards"});
                    // prepare watchdog timer
                    let timeMillis;
                    try {
                        timeMillis = time.substr(0, time.lastIndexOf("s"));
                        if(time.indexOf(".") !== -1) {
                            timeMillis = parseFloat(timeMillis) * 1000;
                        } else {
                            timeMillis = parseInt(timeMillis) * 1000;
                        }
                    } catch(e) {
                        timeMillis = 2500; // fallback
                        _logger.LOG_INOUT && _logger.log(_logger.LOG_INFO, `ViewHelper::animate Error preparing watchdog timer for container=${$container[0].id} Error=${e}`);
                    }
                    timerId = setTimeout(() => {
                        timerId = -1;
                        $container.off("animationend");
                        _logger.LOG_INOUT && _logger.log(_logger.LOG_INFO, `Warning: ViewHelper::animate animation for container=${$container[0].id} not returned within time(ms) ${timeMillis * 2}`);
                        resolve();
                    }, timeMillis * 2);
                }
                else {
                    resolve();
                }
            });
        }

        /**
         * Resets the animation state of the given jQuery container element.
         * Please call this function after animate call is done.
         * @param {object} $container a valid (length must be > 0) jQuery object
         */
        resetAfterAnimate($container) {
            if(config.VIEW_ANIMATIONS_ON && $container && $container.length) {
                $container.css("animation", ""); // highly necessary if $container is same element as the view transition element (see transitionHelper), usually 'flexMain'
            }
        }

        /**
         * @typedef {Object} MediaCarouselElement
         * @property {String} MediaCarouselElement.containerId the id of the child container which presents the media (this container element must be the child of the media carousel container)
         * @property {String} [MediaCarouselElement.type='image'] the type of the media either 'image' or 'video'. 'image' is the default
         * @property {Object} MediaCarouselElement.css style configuration for the media to be apply
         * @property {String} MediaCarouselElement.src the source path of the specific media
         * @property {number} [MediaCarouselElement.delay] the delay (in ms) of how long the media should be present
         * @property {number} [MediaCarouselElement.pause] the pause (in ms) of how long to wait before the next media is coming in
         */

        /**
         * Initializes and start running a media carousel.
         * @param {*} container the ViewModelContainer reference
         * @param {Object} settings the settings for the media to display in a loop e.g. <br>
         *     {
         *          "mediaCarouselId": "mediaCarousel",
         *          "animationNameIn": "fadeIn",
         *          "animationNameOut": "fadeOut",
         *          "animationDelay": "1s",
         *          "animationCrossFade": true,
         *          "cacheMedia": true,
         *          "media": [
         *              {
         *                  "containerId": "elementId",
         *                  "type": "image", // or "video"
         *                  "src": "../images/dm/foobar.jpg",
         *                  "css": {
         *                      ...
         *                  },
         *                  "handler": myFunctionHandler, // or just:  (currentMedia, idx) => {...},
         *                  "delay": 3000,
         *                  "pause": 10000
         *              },
         *              ...
         *          ]
         *     }
         *
         * @Example
         * Markup:
         *   <div id="mediaCarousel" style="width: 200px; height: 117px;">
         *       <div id="ad"></div>
         *       <video id="adVideo" loop>
         *           <source src="" type="video/webm"/>
         *       </video>
         *   </div>
         *
         * Code-behind:
         * Wincor.UI.Content.ViewHelper.runMediaCarousel(Wincor.UI.Content.ViewModelContainer, {
         *        mediaCarouselId: "mediaCarousel",
         *        animationNameIn: "fadeIn",
         *        animationNameOut: "fadeOut",
         *        animationDelay: "1.8s",
         *        animationCrossFade: true,
         *        cacheMedia: true,
         *        media: [
         *        {
         *            containerId: "adVideo",
         *            type: "video",
         *            css: { width: "100%", height: "100%", "object-fit": "fill" },
         *            src: "style/default/images/dm/Cineo 4060.webm",
         *            delay: 7000
         *        },
         *        {
         *            containerId: "ad",
         *            css: { width: "100%", height: "100%", "background-size": "cover", "background-image": "url(style/default/images/dm/insertcard1.jpg)" },
         *            src: "style/default/images/dm/insertcard1.jpg",
         *            delay: 2000
         *        }
         *    ]})
         *
         * @property {Object} settings the settings for the media carousel - contains also an array for each media to animate
         * @property {String} settings.mediaCarouselId the container id of the (usually div) element which is the parent of the media element itself.
         * Please make sure in the case this container is full screen to apply style with <code>position: absolute; top: 0; left: 0; width: 100%; height: 100%;</code> to it, even
         * it is a directly child of <i>flexMain</i>.
         * In the case it is a child container of an inner flexbox (e.g. <i>flexAside</i>) the absolute positioning is not necessary.
         * @property {String} settings.animationNameIn the name of the IN animation (see transitions.css or create your own animation frames)
         * @property {String} settings.animationNameOut the name of the OUT animation (see transitions.css or create your own animation frames)
         * @property {String} settings.animationDelay the animation transition delay in seconds, time for the animationNameIn/animationNameOut
         * @property {boolean} settings.animationCrossFade flag whether a media cross fading is desired or not
         * @property {boolean} [settings.cacheMedia=true] flag whether media browser cache is used or not - settings this flag false allows to replace the physical media
         * within the target folder with new ones, under the same name of course, while the media carousel is running
         * @property {MediaCarouselElement[]} settings.media the media array. Each element configures a containerId, a type, the css, the src (source), a delay and a pause (optional)
         */
        runMediaCarousel(container, settings) {
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `> ViewHelper::runMediaCarousel settings=${settings ? JSON.stringify(settings) : 'undefined'}`);
            const self = this;
            const PROP_BACKGROUND_IMAGE = "background-image";
            const PROP_BACKGROUND = "background";
            let idx = 0, len, $mediaContainer, $clone, isCrossing = true, isCaching = true;

            function start(medias, $targetContainer, $current) {
                const media = medias[idx];
                _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `. ViewHelper::runMediaCarousel current media=${JSON.stringify(media)}`);
                const $target = $targetContainer.find(`#${media.containerId}`);
                if(media.pause) {
                    $mediaContainer.css("visibility", "hidden");
                }
                _mediaCarouselTimerId = setTimeout(() => { // pause first?
                    if($target.length) {
                        const bkdAttr = media.css[PROP_BACKGROUND_IMAGE] ? PROP_BACKGROUND_IMAGE : PROP_BACKGROUND;
                        let bkgImg = media.css[bkdAttr]; // "url(style/default/images/dm/insertcard1.jpg)"
                        // Resolve caching if necessary
                        let urlTail = `?__cachebuster=${Date.now()}`;
                        if(!isCaching && bkgImg) {
                            if(bkgImg.indexOf("?") !== -1) {
                                bkgImg = bkgImg.substr(0, bkgImg.indexOf("?"));
                                bkgImg += ")";
                            }
                            bkgImg = bkgImg.replace(")", `${urlTail})`);
                            media.css[bkdAttr] = bkgImg;
                        }
                        $target.css(media.css || {});
                        let src = isCaching ? media.src : `${media.src}${urlTail}`;
                        if (media.type !== "video") { // images
                            $target.attr("src", src);
                            $target.show();
                        } else {
                            $target.find("source").attr("src", src);
                            if($target[0]) {
                                $target[0].load();
                                $target[0].play();
                            }
                            $target.show();
                        }
                        self.resetAfterAnimate($targetContainer);
                        if(isCrossing) {
                            $targetContainer.css("visibility", "visible");
                        }
                        self.animate($target, settings.animationNameIn || "fadeIn", settings.animationDelay || "1s", "ease-in").then(() => {
                            if(isCrossing && $current) {
                                $current.css("visibility", "hidden");
                            }
                            self.resetAfterAnimate($target);
                            if(media.handler) {
                                try {
                                    media.handler(media, idx);
                                } catch(e) {
                                    _logger.error(`ViewHelper::runMediaCarousel start error while calling media.handler of media index=${idx} cause: ${e}`);
                                    self.stopMediaCarousel();
                                }
                            }
                            if(_mediaCarouselTimerId !== -1) {
                                _mediaCarouselTimerId = setTimeout(() => next(medias, $current, $targetContainer), media.delay);
                            }
                        });
                    } else {
                        _logger.error(`ViewHelper::runMediaCarousel no DOM element found with id=${media.containerId} of media index=${idx}`);
                        next(media, $current, $targetContainer, true);
                    }
                }, media.pause ? media.pause : 0);
            }

            function next(medias, $targetContainer, $current, skipTransition) {
                if(_mediaCarouselTimerId !== -1) {
                    try {
                        const oldMedia = medias[idx];
                        if(!skipTransition) {
                            if(isCrossing) {
                                idx = idx < len - 1 ? (idx += 1) : 0;
                                start(medias, $targetContainer, $current);
                                $targetContainer.show();
                            }
                            self.animate($current, settings.animationNameOut || "fadeOut", settings.animationDelay || "1s", "ease-out").then(() => {
                                $current.css("visibility", "hidden");
                                if(oldMedia.type !== "video") { // images
                                    $current.find(`#${oldMedia.containerId}`).hide();
                                } else {
                                    let $vid = $current.find("video");
                                    if ($vid[0]) {
                                        $vid[0].pause();
                                    }
                                    $vid.hide();
                                }
                                self.resetAfterAnimate($current);
                                if(!isCrossing) {
                                    idx = idx < len - 1 ? (idx += 1) : 0;
                                    start(medias, $targetContainer, $current);
                                }
                            });
                        } else {
                            start(medias);
                        }
                    } catch(e) {
                        _logger.error(`ViewHelper::runMediaCarousel next failed cause: ${e}`);
                        self.stopMediaCarousel();
                    }
                }
            }

            if(container && settings && settings.media) {
                try {
                    if(_mediaCarouselTimerId !== -1) { // an already running carousel should be stopped before we start a new
                        _logger.LOG_INFO && _logger.log(_logger.LOG_INFO, `. ViewHelper::runMediaCarousel already running media carousel found - stop it first...`);
                        this.stopMediaCarousel();
                    }
                    const medias = Array.isArray(settings.media) ? settings.media : [];
                    len = medias.length;
                    if(len) {
                        isCrossing = settings.animationCrossFade === true || settings.animationCrossFade === void 0;
                        isCaching = settings.cacheMedia === void 0 || settings.cacheMedia === true;
                        $mediaContainer = $(`#${settings.mediaCarouselId || "mediaCarousel"}`);
                        _mediaCarouselId = $mediaContainer.attr("id");
                        let $parent = $mediaContainer.parent();
                        $mediaContainer.css({ "max-width": $parent.width, display: "" });
                        if(isCrossing && $mediaContainer.length) {
                            $clone = $(`#${settings.mediaCarouselId}Clone`);
                            if(!$clone.length) { // check clone exists already
                                $clone = $mediaContainer.clone();
                                $clone.attr("id", `${settings.mediaCarouselId}Clone` || "mediaCarouselClone");
                                if($parent.css("display") === "flex") {
                                    if($parent.css("flex-direction") === "row") {
                                        $clone.css({
                                            "visibility": "hidden",
                                            "max-width": $parent.width(),
                                            "margin-left": `-${$mediaContainer.width()}px`
                                        });
                                    } else {
                                        $clone.css({
                                            "visibility": "hidden",
                                            "max-width": $parent.width(),
                                            "margin-top": `-${$mediaContainer.height()}px`
                                        });
                                    }
                                } else {
                                    $clone.css({
                                        "visibility": "hidden",
                                        "max-width": $parent.width(),
                                        "margin-top": `-${$mediaContainer.height()}px`
                                    });
                                }
                                $clone.insertAfter(`#${_mediaCarouselId}`);
                                $clone.offset($mediaContainer.offset());
                                // Note: Chrome/Chromium seems to have a problem when the clone is positioned relative.
                                // Then it may come to massive memory consumption growing while running.
                                // The cause is that in the case there is no style given (regarding the position) by the -$mediaContainer jQuery might set the clone with
                                // position relative.
                                if($clone.css("position") === "relative") {
                                    $clone.css("position", "inherit");
                                }
                            }
                        }
                        if($mediaContainer.length) {
                            start(medias, $mediaContainer, $clone);
                            container.whenDeactivated().then(() => this.stopMediaCarousel());
                        } else {
                            _logger.error(`ViewHelper::runMediaCarousel failed cause: Settings error, please provide a div container with an id for the settings attribute 'mediaCarouselId'`);
                        }
                    }
                } catch(e) {
                    _logger.error(`ViewHelper::runMediaCarousel failed cause: ${e}`);
                    this.stopMediaCarousel();
                }
            }
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `< ViewHelper::runMediaCarousel`);
            /*
            Wincor.UI.Content.ViewHelper.runMediaCarousel(Wincor.UI.Content.ViewModelContainer, {
                mediaCarouselId: "mediaCarousel",
                animationNameIn: "fadeIn",
                animationNameOut: "fadeOut",
                animationDelay: "1.8s",
                animationCrossFade: true,
                cacheMedia: true,
                media: [
                {
                    containerId: "ad",
                    css: { width: "100%", height: "100%", "background-size": "cover", "background-image": "url(style/default/images/dm/insertcard1.jpg)" },
                    src: "style/default/images/dm/insertcard1.jpg",
                    delay: 2000
                },
                {
                     containerId: "adVideo",
                     type: "video",
                     css: { width: "100%", height: "100%", "background-size": "cover" },
                     src: "style/default/images/dm/Cineo 4060.webm",
                     delay: 7000
                 },
                 {
                    containerId: "ad",
                    css: { width: "100%", height: "100%", "background-size": "cover", "background-image": "url(style/default/images/dm/insertcard2.jpg)" },
                    src: "style/default/images/dm/insertcard3.jpg",
                    delay: 3000,
                    pause: 3000
                }, {
                     containerId: "ad",
                     css: { width: "100%", height: "100%", "background-size": "cover", "background-image": "url(style/default/images/dm/insertcard5.jpg)" },
                     src: "style/default/images/dm/insertcard5.jpg",
                     delay: 3000
                }]
            })

             Wincor.UI.Content.ViewHelper.runMediaCarousel(Wincor.UI.Content.ViewModelContainer, {
                 mediaCarouselId: "mediaCarousel",
                 animationNameIn: "fadeIn",
                 animationNameOut: "fadeOut",
                 animationDelay: "1.8s",
                 animationCrossFade: true,
                 cacheMedia: true,
                 media: [
                 {
                     containerId: "adVideo",
                     type: "video",
                     css: { width: "100%", height: "100%", "object-fit": "fill" },
                     src: "style/default/images/dm/Cineo 4060.webm",
                     delay: 7000
                 },
                 {
                     containerId: "ad",
                     css: { width: "100%", height: "100%", "background-size": "cover", "background-image": "url(style/default/images/dm/insertcard1.jpg)" },
                     src: "style/default/images/dm/insertcard1.jpg",
                     delay: 2000
                 },
             ]})

             */

            /*
             <div id="mediaCarousel" style="width: 200px; height: 117px;">
                 <div id="ad"></div>
                 <video id="adVideo" loop>
                     <source src="" type="video/webm"/>
                 </video>
             </div>
             */
        }

        /**
         * Stops the running media carousel if it runs.
         */
        stopMediaCarousel() {
            if(_mediaCarouselTimerId !== -1) {
                clearTimeout(_mediaCarouselTimerId);
                _logger.LOG_INFO && _logger.log(_logger.LOG_INFO, `. ViewHelper::stopMediaCarousel media carousel stopped with id=${_mediaCarouselTimerId}`);
                _mediaCarouselTimerId = -1;
            }
            if(_mediaCarouselId) {
                const $mediaCarousel = $(`#${_mediaCarouselId}`);
                const $clone = $(`#${_mediaCarouselId}Clone`);
                // stop/hide possible video sequence
                let $video = $mediaCarousel.find("video");
                let $videoClone = $clone.find("video");
                if($video.length) {
                    $video[0].pause();
                    $video.hide();
                    $video.find("source").attr("src", "");
                }
                if($videoClone.length) {
                    $videoClone[0].pause();
                    $videoClone.hide();
                    $videoClone.remove();
                }
                if($mediaCarousel.length) {
                    $mediaCarousel.hide();
                    $mediaCarousel.find("div").attr({"style": "", "src": ""});
                }
                if($clone.length) {
                    $clone.hide();
                    $clone.remove();
                }
            }
        }

        alphanumericInputHandler(data) {
            let charIdx;
            let confArray;
            const self = this;
            let args = data.eppkey.slice(0); //in fact is arguments array for original action
            const timeout = data.timeout && data.timeout > 0 ? data.timeout : 1000;

            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `> ViewHelper::alphanumericInputHandler data: ${JSON.stringify(data, null, " ")}`);

            function removePopup(observable, char="") {
                _popupProcessing = true;
                if (char) {
                    args[0] = char;
                    observable(args);
                }
                _lastEppkey = "";
                self.removePopup({callback: () => _popupProcessing = false, immediate: true});
                _isPopupHintActive = false;
            }

            function createPopup(confArray) {
                let dynamicButtonCode = "<div id=\"popupKeysArea\">", myId;
                for(let count = 0; count < confArray.length; count += 1) {
                    myId = "vkPopupSmallSquareButton" + count;
                    dynamicButtonCode +=
                        "<button id=\"" + myId + "\" class=\"button keyboardButton " + (count === 0 ? "highlighted" : "") + "\" >" + //this.convertToString(key.selection[count]) +
                        "<var class=\"color03\">" + confArray[count] + "</var>" +
                        "</button>";
                }
                dynamicButtonCode += "</div>";

                return dynamicButtonCode;
            }

            if(data.type === "keypress") {
                if(_popupProcessing) {
                    return;
                }

                charIdx = data.charIdx;
                confArray = data.confArray;
                if (_timerId !== -1) {
                    clearTimeout(_timerId);
                }
                const $popup = $("#popupKeysArea");
                if(!_isPopupHintActive || (data.eppkey[0] !== _lastEppkey)) {
                    if (_isPopupHintActive && (data.eppkey[0] !== _lastEppkey)) {
                        args[0] = _lastConfArray[_lastCharIdx];
                        data.observable(args);
                        charIdx = 0;
                        _lastCharIdx = 0;
                        if (_timerId !== -1) {
                            clearTimeout(_timerId);
                        }
                        this.removePopup({immediate: true});
                    }

                    let target = "";
                    const popupCode = createPopup(confArray);
                    if(data.target) {

                        if(ko.isObservable(data.target) || typeof data.target === "string") {
                            target = data.target;
                        } else if(typeof data.target === "function") {
                            target = data.target();
                        }
                    }
                    this.showPopupHint(popupCode, 0, ko.unwrap(target), $popup => {
                        $popup.attr("data-virtualkeyboard-hint", true); // add marker to be able to identify this hint as a VK hint
                    });
                    _isPopupHintActive = true;
                    _popupProcessing = false;
                } else {
                    $popup.find('[id^="vkPopupSmallSquareButton"]').removeClass("highlighted");
                    $popup.find('#vkPopupSmallSquareButton' + charIdx).addClass("highlighted");
                    _lastCharIdx = charIdx;
                }
                _timerId = setTimeout(removePopup.bind(this, data.observable, confArray[charIdx]), timeout);
                _lastEppkey = data.eppkey[0];
                _lastConfArray = data.confArray;
            }
            return true;
        }
        
        /*== SVG inline handling ==*/
        
        /**
         * Removes all SVG definitions from the document body.
         * Use this method in order to force a new AJAX request (maybe useful in web server based scenarios)
         * for the next time any SVG is necessary again.
         * @important This also removes all currently presented svg->use tag icons and images.
         */
        clearSvgDev() {
            $("body [id*=svgDef_]").remove();
            $("body [id*=svgDefCon_]").remove();
        }
        
        /**
         * Sets the content and/or style for the <i>currency_symbol.svg</i> or <i>currency_symbol_dyn.svg</i>.
         * @param {HTMLElement} item the svg element
         * @param {Object} rootCtx the root context from the binding, usually the bound view model
         */
        currencySymbol(item, rootCtx) {
            if(item.getElementById('symbolGroup')) { // currency_symbol.svg?
                let cData = rootCtx.bankingContext.currencyData;
                let symbol = cData.symbol.length === 1 ? cData.symbol : cData.iso;
                let prefix = symbol.length === 1 ? 'symbol' : 'iso';
                item.getElementById(`${prefix}Group`).style.display = 'block';
                item.getElementById(`${prefix}currencySymbol`).textContent = symbol;
                item.getElementById(`${prefix}currencySymbol_2`).textContent = symbol;
                item.getElementById(`${prefix}currencySymbol_3`).textContent = symbol;
                item.getElementById(`${prefix}currencySymbol_4`).textContent = symbol;
            }
        }
    
        /**
         * Sets the content and/or style for the <i>deposit_warning_x.svg's</i>.
         * @param {HTMLElement} item the svg element
         * @param {Object} rootCtx the root context from the binding, usually the bound view model
         */
        depositWarningSymbol(item, rootCtx) {
            const elm = item.getElementById('warningCircle');
            if(elm) {
                elm.style.display = item.getAttribute('data-warning-circle') === 'true' ? 'block' : 'none';
                const countVal = item.getElementById('countValue');
                if(countVal) {
                    let max = rootCtx.maxItems && rootCtx.maxItems();
                    max && max.length > 2 ? item.getElementById('countValueSmall').textContent = `${max}+` : countVal.textContent = `${max}+`;
                }
            }
        }
    
        /**
         * Sets the content and/or style for the <i>single_bill_euro.svg</i> or <i>single_bill_generic.svg</i>.
         * @param {HTMLElement} item the svg element
         * @param {Object} rootCtx the root context from the binding, usually the bound view model
         */
        singleBillSymbol(item, rootCtx) {
            let val = item.getAttribute('data-item-value');
            val = parseInt(val) / 100;
            let topVal = item.getElementById('noteValueLeftTop');
            let currSym = item.getElementById('currencySymbol');
            let currText = item.getElementById('currencyText');
            if(topVal) {
                topVal.textContent = val;
            }
            if(currSym) {
                currSym.textContent = rootCtx.bankingContext.currencyData.symbol;
            }
            if(currText) {
                currText.textContent = rootCtx.bankingContext.currencyData.text;
            }
            item.getElementById('noteValueLeft').textContent = val;
            item.getElementById('noteValueRight').textContent = val;
        }
    
        /**
         * Sets the content and/or style for the <i>single_coin_generic.svg</i>.
         * @param {HTMLElement} item the svg element
         * @param {Object} rootCtx the root context from the binding, usually the bound view model
         */
        singleCoinSymbol(item, rootCtx) {
            let val = parseInt(item.getAttribute('data-item-value'));
            let iso = item.getAttribute('data-currency-iso');
            iso = iso === 'EUR' ? (val < 100 ? 'CENT' : 'EURO') : '';
            item.getElementById('coinValue').textContent = val >= 100 ? val / 100 : val;
            item.getElementById('coinCurrencyName').textContent = iso;
        }
        
        /*SVG handling helpers ends*/
    
        /**
         * Draws a border around an element.
         * The element must own the class 'borderDrawing'.
         * @enum {Object}
         */
        borderDrawing = {
            /**
             * Does the drawing work.
             * @param {HTMLElement | jQuery | String} viewOrElm the view element, a jQuery object or an id for an element
             * @param {boolean} prepare true, if the draw targets must be prepared
             * @param {boolean} forceDraw true, if the draw should be forced
             */
            work: (viewOrElm, prepare = false, forceDraw = false) => {
                if(config.VIEW_ANIMATIONS_ON && config.BORDER_DRAWING_ON) {
                    const RECT_CLASS = "borderDrawing";
                    const RECT_SHIELD_CLASS = "borderDrawingShield";
                    let obtainFooter = true;
                    let $content = viewOrElm || "#flexMain";
                    if(!($content instanceof $)) {
                        $content = $($content);
                    } else {
                        obtainFooter = false
                    }
                    let $targets = obtainFooter ? $content.add("#flexFooter").find(`.${RECT_CLASS}`) : $content;
                    for(let i = 0; i < $targets.length; i++) {
                        let $target = $($targets[i]);
                        if(($target.css("display") !== "none" && $target.css("visibility") !== "hidden" && !$target.attr("disabled")) || forceDraw) {
                            if(prepare) {
                                $target.css("opacity", 0);
                            } else {
                                let $shield = $(`<div class=${RECT_SHIELD_CLASS}></div>`);
                                $shield.css({position: "absolute", width: $target.css("width"), height: $target.css("height"), "border-color": $target.css("border-color")});
                                $target.after($shield[0]);
                                $shield.offset($target.offset());
                                $shield.on("animationend", () => {
                                    $shield.off("animationend");
                                    $shield.remove();
                                    $target.transition({opacity: 1}, config.BUTTON_FADE_IN_TIME, "ease", () => {
                                        $target.css({opacity: ""});
                                        $target.removeClass(RECT_CLASS);
                                    })
                                });
                            }
                        }
                    }
                }
            },

            /**
             * Does the drawing prepare.
             * @param {HTMLElement | jQuery | String=} viewOrElm the view element, a jQuery object or an id for an element
             * @param {boolean=} forceDraw true, if the draw should be forced
             */
            prepare: (viewOrElm, forceDraw) => {
                Wincor.UI.Content.ViewHelper.borderDrawing.work(viewOrElm, true, forceDraw);
            },

            /**
             * Does the drawing.
             * @param {HTMLElement | jQuery | String=} viewOrElm the view element, a jQuery object or an id for an element
             * @param {boolean=} forceDraw true, if the draw should be forced
             */
            draw: (viewOrElm, forceDraw) => {
                Wincor.UI.Content.ViewHelper.borderDrawing.work(viewOrElm, false, forceDraw);
            }
        };
    }

    Wincor.UI.Content.ViewHelper = new Wincor.UI.Content.ViewHelper(); // singleton
    return Wincor.UI.Content.ViewHelper;
});
