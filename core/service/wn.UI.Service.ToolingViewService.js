/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ wn.UI.Service.ToolingViewService.js 4.3.1-210203-21-1b8704b6-1a04bc7d
 */
/**
 * @deprecated Not necessary anymore since ProFlex4 4.2/30
 */
define(["service/wn.UI.Service.ViewService"], function() {
    "use strict";

    /**
     *
     * @type {Wincor.UI.Diagnostics.LogProvider|*|Wincor.UI.Diagnostics.LogProvider|*}
     * @private
     */
    const _logger = Wincor.UI.Diagnostics.LogProvider;

    /**
     * The ToolingViewService class provides methods for view handling and events of the view's lifecycle.
     * @class
     */
    Wincor.UI.Service.ToolingViewService = class ToolingViewService extends Wincor.UI.Service.ViewService {

        /**
         * Flag determine whether the tooling mode is active or not.
         * The default is true.
         * @const
         * @type {boolean}
         */
        TOOLING_MODE = true;

        /**
         * Contains the list of the elements ids that are managed by the screen tool.
         * @type {array}
         */
        managedIds = null;

        /**
         * Contains the list of the elements ids that are managed by the screen tool but have a warning.
         */
        warningIds = null;

        /**
         * The color of the registered elements for selection (registered elements).
         */
        registeredColor = null;

        /**
         * The color of the registered elements for selection (warning elements).
         */
        warningColor = null;

        /**
         * The color of the selected elements.
         */
        selectionColor = null;

        /**
         * The size of the highlighted elements border in pixels.
         */
        elementsBorderWidth = null;

        /**
         * Name of the event being sent to the tooling if an element is selected.
         * @const
         * @type {String}
         * */
        EVENT_NAME_ELEMENT_SELECTED = "ElementSelected";
        
        /**
         * Name of the event being sent to the tooling for command repository.
         * @const
         * @type {String}
         * */
        EVENT_NAME_COMMAND_REPOSITORY = "CommandRepository";

        /**
         * This event is sent to the tooling if an element is selected.
         * The EVENT_ELEMENT_SELECTED object extends {@link Wincor.UI.Service.BaseService#EVENT} with the following elements:<br>
         * <code>EVENT_ELEMENT_SELECTED.elementSelected: {string}</code></b>
         * @type {object}
         */
        EVENT_ELEMENT_SELECTED = null;
        
        /**
         * This event is sent to the tooling for command repository.
         * @private
         * @type {object}
         */
        EVENT_COMMAND_REPOSITORY = null;

        /**
         * The name of the content frame.
         * Overrides ViewService.CONTENT_FRAME_NAME in order to use the tooling specific.
         * @default '#toolingModeContent'
         * @type {String}
         * @const
         */
        CONTENT_FRAME_NAME = "#toolingModeContent";

        /**
         * See {@link Wincor.UI.Service.PTService#constructor}.
         * @lifecycle service
         */
        constructor() {
            super();

            _logger.log(_logger.LOG_SRVC_INOUT, "> ToolingViewService::ToolingViewService");

            this.EVENT_ELEMENT_SELECTED = Object.assign(Object.assign({}, this.EVENT), {
                service: "ToolingViewService",
                eventName: this.EVENT_NAME_ELEMENT_SELECTED,
                elementId: null
            });
            
            this.EVENT_COMMAND_REPOSITORY = Object.assign(Object.assign({}, this.EVENT), {
                service: "ToolingViewService",
                eventName: this.EVENT_NAME_COMMAND_REPOSITORY,
                viewKey: null,
                commands: null
            });

            this.requestMap.set("register", this.register.bind(this));
            this.requestMap.set("reload", this.reload.bind(this));
            this.requestMap.set("select", this.select.bind(this));
            this.requestMap.set("resizeTo", this.resizeTo.bind(this));
            this.requestMap.set("setViewSet", this.setViewSet.bind(this));
            this.requestMap.set("getElementType", this.getElementType.bind(this));

            this.CONTENT_FRAME_NAME = `#${window.localStorage.getItem("activeFrameName")}`;

            _logger.log(_logger.LOG_SRVC_INOUT, "< ToolingViewService::ToolingViewService");
        }
        
        /**
         * Provides the html element node name.
         * @param {object} message
         */
        getElementType(message) {
            _logger.log(_logger.LOG_SRVC_INOUT, `> ToolingViewService::getElementType('${JSON.stringify(message)}')`);
            message.service = "ToolingViewService";
            try {
                if (this.contentWindow && this.contentWindow.document) {
                    var elementId = message.elementId;
                    var element = this.contentWindow.document.getElementById(elementId);
                    if (element) {
                        message.nodeName = element.nodeName;
                        this.sendResponse(message, this.REQUEST_RESPONSE_OK);
                    } else
                        this.sendResponse(message, this.REQUEST_RESPONSE_ERROR);
                } else
                    this.sendResponse(message, this.REQUEST_RESPONSE_ERROR);
            } catch (e) {
                _logger.error(e.message);
            } finally {
                _logger.log(_logger.LOG_SRVC_INOUT, "< ToolingViewService::getElementType");
            }
        }
        
        display(message) {
            _logger.log(_logger.LOG_SRVC_INOUT, `> ToolingViewService::display( ${JSON.stringify(message)} )`);
            if (!this.urlMapping) {
                this.urlMapping = {};
            }
            
            _logger.log(_logger.LOG_SRVC_DATA, `* ToolingViewService::display() viewSet = ${message.viewSet}`);

            this.loadViewSet(message.viewSet, false).then(function() {
                _logger.log(_logger.LOG_SRVC_DATA, "* ToolingViewService::display()-loadStuff");
                // Override values for tooling mode
                message.viewConfig.timeout = -1;
                message.viewConfig.popup = message.viewConfig.popup || {};
                message.viewConfig.popup.oncancel = false;
                message.viewConfig.popup.ontimeout = false;

                this.urlMapping[message.viewKey] = message.viewConfig;

                try {
                    // correctJSONobject is also called by the normal ViewService. It must also be done here, because the standard call of the ViewService
                    // is not used on tooling: The viewConfig is sent as parameter here, but in application mode the config is explicitly requested via the ConfigService
                    // and corrected afterwards.

                    this.urlMapping[message.viewKey] = this.correctJSONObject(this.urlMapping[message.viewKey], message.viewKey);
                }
                catch (e) {
                    _logger.error("* ToolingViewService::display()-loadStuff(): something wrong with priorities?");
                }

                //this.urlMapping[message.viewKey] = message.viewConfig;
                _logger.log(_logger.LOG_SRVC_DATA, `* ToolingViewService::display()-loadStuff( ${JSON.stringify(this.urlMapping)} )`);

                //this.serviceProvider.ViewService.display(message);
                super.display(message);

            }.bind(this));

            _logger.log(_logger.LOG_SRVC_INOUT, "< ToolingViewService::display");
        }
		
        reload(message) {
            this.noReloadForViews = [message.viewURL];
            this.display(message);
        }

        /**
         * Fired each time en element is selected. Sends an ElementSelected message.
         * @param selectedElement - The selected element.
         */
        elementSelected(selectedElement) {
            if (this.contentWindow && this.contentWindow.document) {
                if (this.elementsBorderWidth) {
                    var i;
                    for (i = 0; i < this.managedIds.length; i++) {
                        let element = this.contentWindow.document.getElementById(this.managedIds[i]);
                        if (element) {
                            this.highlightElement(element, this.registeredColor);
                        }
                        else {
                            _logger.error(`Element with id ${this.managedIds[i]} does not exist`);
                        }
                    }
        
                    for (i = 0; i < this.warningIds.length; i++) {
                        let element = this.contentWindow.document.getElementById(this.warningIds[i]);
                        if (element) {
                            this.highlightElement(element, this.warningColor);
                        }
                        else {
                            _logger.error(`Element with id ${this.warningIds[i]} does not exist`);
                        }
                    }
        
                    this.highlightElement(selectedElement, this.selectionColor);   
                }
                this.EVENT_ELEMENT_SELECTED.elementId = selectedElement.getAttribute("id");
                this.sendEvent(this.EVENT_ELEMENT_SELECTED);
            }
        }

        /**
         * Registers the element for selection.
         * @param element - The element to be registered.
         */
        registerElementForSelection(element) {
            var self = this;
            element.onmousedown = function() {self.elementSelected(this);};
        }
        
        /**
         * Highlight the elements by changing its border color.
         * @param element - The element to be highlighted.
         * @param color - The border color for the element.
         */
        highlightElement(element, color) {
            element.style.border = `solid ${this.elementsBorderWidth}px ${color}`;
        }
        
        /**
         * Set the ViewSet.
         * @param {object} message
         * @param {string} message.viewSet - The viewSet name.
         */
        setViewSet(message) {
            _logger.log(_logger.LOG_SRVC_INOUT, `> ToolingViewService::setViewSet('${JSON.stringify(message)}')`);
            _logger.log(_logger.LOG_SRVC_DATA, `* ToolingViewService::setViewSet() viewKey = ${this.viewContext.viewKey}`);
            _logger.log(_logger.LOG_SRVC_DATA, `* ToolingViewService::setViewSet() viewSet = ${message.viewSet}`);
            try {
                this.loadViewSet(message.viewSet, false);

            } catch(e) {
                _logger.error(e.message);
            } finally {
                _logger.log(_logger.LOG_SRVC_INOUT, "< ToolingViewService::setViewSet");
            }
        }
        /**
         * This method is called by the tooling to register elements for selection.
         * @param {object} message
         * @param {string} message.managedIds - The ids of the html elements currently managed by the screen tool.
         * @param {string} message.warningIds - The ids of the html elements currently managed by the screen tool but have a warning
         * @param {string} message.cssRegisteredColor - The color used to highlight the managed elements (css property, ex: red, #00ff00; rgb(0,0,255)).
         * @param {string} message.cssWarningColor - The color used to highlight elements with warning (css property, ex: red, #00ff00; rgb(0,0,255)).
         * @param {string} message.cssSelectionColor - The color used to highlight the selected element (css property, ex: red, #00ff00; rgb(0,0,255)).
         * @param {string} message.elementsBorderWidth - The size of the highlighted elements border in pixels.
         */
        register(message) {
            _logger.log(_logger.LOG_SRVC_INOUT, `> ToolingViewService::register('${JSON.stringify(message)}')`);
            _logger.log(_logger.LOG_SRVC_DATA, `* ToolingViewService::register() viewKey = ${this.viewContext.viewKey}`);
            try {
            	
                if (this.contentWindow && this.contentWindow.document) {
                    this.managedIds = message.managedIds;
                    this.warningIds = message.warningIds;
                    if (message.elementsBorderWidth) {
                        this.registeredColor = message.cssRegisteredColor;
                        this.warningColor = message.cssWarningColor;
                        this.selectionColor = message.cssSelectionColor;
                        this.elementsBorderWidth = message.elementsBorderWidth;
                    } else {
                        this.registeredColor = "";
                        this.warningColor = "";
                        this.selectionColor = "";
                        this.elementsBorderWidth = 0;
                    }
                    var i;
                    for (i = 0; i < this.managedIds.length; i++) {
                        let element = this.contentWindow.document.getElementById(this.managedIds[i]);
                        if (element) {
                            this.registerElementForSelection(element);
                            if (this.elementsBorderWidth)
                                this.highlightElement(element, message.cssRegisteredColor);
                        } else {
                            _logger.error(`Element with id ${this.managedIds[i]} does not exist`);
                        }
                    }
                    for (i = 0; i < this.warningIds.length; i++) {
                        let element = this.contentWindow.document.getElementById(this.warningIds[i]);
                        if (element) {
                            this.registerElementForSelection(element);
                            if (this.elementsBorderWidth)
                                this.highlightElement(element, message.cssWarningColor);
                        } else {
                            _logger.error(`Element with id ${this.warningIds[i]} does not exist`);
                        }
                    }
                }
            } catch(e) {
                _logger.error(e.message);
            } finally {
                _logger.log(_logger.LOG_SRVC_INOUT, "< ToolingViewService::register");
            }
        }

        /**
         * Asks the browser to select an HTML element.
         * @param {object} message
         * @param {string} message.elementId - The elementId to be selected.
         */
        select(message) {
            _logger.log(_logger.LOG_SRVC_INOUT, `> ToolingViewService::select('${JSON.stringify(message)}')`);
            try {
                if (this.contentWindow && this.contentWindow.document) {
                    var elementId = message.elementId;
                    var element = this.contentWindow.document.getElementById(elementId);
                    if (element) {
                        this.elementSelected(element);                       
                    } else
                        _logger.error("Element with id " + elementId + " does not exist");
                }
            } catch(e) {
                _logger.error(e.message);
            } finally {
                _logger.log(_logger.LOG_SRVC_INOUT, "< ToolingViewService::select");
            }
        }

        /**
         * This method is called by the service-provider if an error occurred in any service
         * @eventhandler
         * @param {String} serviceName
         * @param {String} errorType
         */
        onError(serviceName, errorType) {
            _logger.log(_logger.LOG_SRVC_INOUT, `> ToolingViewService::onError(${serviceName}, ${errorType})`);
            _logger.log(_logger.LOG_SRVC_DATA, `* ToolingViewService::onError() viewKey = ${this.viewContext.viewKey}`);
            
            this.setCommandRepository(this.viewContext.viewKey, {});
            
            // super.onError(serviceName, errorType);
            _logger.log(_logger.LOG_SRVC_INOUT, "< ToolingViewService::onError");
        }

        /**
         * This function is called by the business-logic to resize the content window
         * @param {object} message
         * @param {number} message.width - The width in pixels.
         * @param {number} message.height - The height in pixels.
         * @protected
         */
        resizeTo(message) {
            _logger.log(_logger.LOG_SRVC_INOUT, `> ToolingViewService::resizeTo('${JSON.stringify(message)}')`);

            try {
            	var difWidth = this.contentWindow.outerWidth - this.contentWindow.innerWidth;
            	var difHeight = this.contentWindow.outerHeight - this.contentWindow.innerHeight;
            	_logger.log(_logger.LOG_SRVC_DATA, `width  ( ${this.contentWindow.innerWidth} + ${difWidth} = ${this.contentWindow.outerWidth})`);
            	_logger.log(_logger.LOG_SRVC_DATA, `height ( ${this.contentWindow.innerHeight} + ${difHeight} = ${this.contentWindow.outerHeight})`);

                this.width = message.width;
                this.height = message.height;
                if(this.contentWindow) {
                    this.contentWindow.resizeTo(this.width + difWidth, this.height + difHeight); // numbers has to contain window border size
                }
            } catch(e) {
                _logger.error(e.message);
            } finally {
                _logger.log(_logger.LOG_SRVC_INOUT, "< ToolingViewService::resizeTo");
            }
        }
        
        /**
         * Sends to the browser, information about the commands of the page.
         */
        setCommandRepository(viewKey, commandRepository) {
            _logger.log(_logger.LOG_SRVC_INOUT, `> ToolingViewService::setCommandRepository('${JSON.stringify(commandRepository)}')`);
            this.EVENT_COMMAND_REPOSITORY.viewKey = viewKey;
            this.EVENT_COMMAND_REPOSITORY.commands = commandRepository.commands;   
            this.sendEvent(this.EVENT_COMMAND_REPOSITORY);
            _logger.log(_logger.LOG_SRVC_INOUT, "< ToolingViewService::setCommandRepository");
        }

        /**
         * This function is for debugging reasons. It is a workaround in order to step in this file when js debugging.
         */
        debug() {
            super.debug();
        }
    }
    return Wincor.UI.Service.ToolingViewService;
});