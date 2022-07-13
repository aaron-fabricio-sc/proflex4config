/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.

$MOD$ baseaggregate.js 4.3.1-210108-21-173923a2-1a04bc7d

*/
/**
 * This module is the base module for all concrete code-behind view specific modules.
 * <br>
 * <p>
 * A code-behind module is a plain java script module which belongs to its own view fragment usually with the same name except the file extension which
 * is <i>.html</i> of course.
 * <br>
 * Furthermore it prevents it's view from having a java script source tag in it, so views basically are separated from the DOM manipulating code.
 * </p>
 * <p>
 * Basically this base module provides the views life-cycle functions and some useful references to several ProFlex4 UI standard modules which are
 * typically used by the derived code-behind modules.
 * It is also used to make any allowed DOM operation while the corresponding view of the code-behind module is present.
 * Because of the life-cycle some functions allows to manipulate the view fragment before it's getting visible and even before it's has been bound to
 * possible observable data done via knockoutJS library.
 * </p>
 * <p>
 * Beside the viewmodel life-cycle (see {@link Wincor.UI.Content.BaseViewModel}) the view life-cycle is the most important life-cycle of ProFlex4 UI.
 * The most important life-cycle function is the {@link module:baseaggregate.activate} function which typically instantiates one or more viewmodel(s).
 * </p>
 * It comprises of 11 functions which are all abel to be hooked up, except getView() function:
 * <br><br>
 * <span style="font-size: 1.3em;color: brown;">[current view]</span><span style="margin-left:290px;"><span style="font-size: 2em;">&rarr;</span>
 * <span style="margin-left:110px;font-size: 1.3em;color:green;">[new view]</span>
 * <br>
 * <span style="border: 1px solid black;font-size: 1.3em;">1. {@link module:baseaggregate.canDeactivate}</span><span style="margin-left:80px;"><span style="font-size: 2em;">&rarr;</span>
 * <span style="margin-left:75px;border: 1px solid black;font-size: 1.3em;">2. {@link module:baseaggregate.canActivate}</span>
 * <br>
 * <span style="border: 1px solid black;font-size: 1.3em;">3. {@link module:baseaggregate.deactivate}</span><span style="margin-left:110px;font-size: 2em;">&larr;</span>
 * <br>
 * <span style="margin-left:420px;font-size: 2em;">&rarr;</span>
 * <span style="margin-left:100px;border: 1px solid black;font-size: 1.3em;">4. {@linkplain module:baseaggregate.activate}</span><br>
 * <span style="margin-left:600px;font-size: 2em;">&darr;</span> <br>
 * <span style="margin-left:550px;border: 1px solid black;font-size: 1.3em;">5. {@link module:baseaggregate.getView}</span> <br>
 * <span style="margin-left:600px;font-size: 2em;">&darr;</span> <br>
 * <span style="margin-left:550px;border: 1px solid black;font-size: 1.3em;">6. {@link module:baseaggregate.binding}</span> <br>
 * <span style="margin-left:600px;font-size: 2em;">&darr;</span> <br>
 * <span style="margin-left:550px;border: 1px solid black;font-size: 1.3em;">7. {@link module:baseaggregate.bindingComplete}</span><br>
 * <span style="margin-left:600px;font-size: 2em;">&darr;</span> <br>
 * <span style="margin-left:550px;border: 1px solid black;font-size: 1.3em;">8. {@link module:baseaggregate.attached}</span><br>
 * <span style="border: 1px solid black;font-size: 1.3em;">9. {@link module:baseaggregate.detached}</span><span style="margin-left:110px;font-size: 2em;">&larr;</span>
 * <br>
 * <span style="margin-left:420px;font-size: 2em;">&rarr;</span>
 * <span style="margin-left:100px;border: 1px solid black;font-size: 1.3em;">10. {@link module:baseaggregate.compositionComplete}</span><br>
 * <span style="margin-left:600px;font-size: 2em;">&darr;</span> <br>
 * <span style="margin-left:550px;border: 1px solid black;font-size: 1.3em;">10a.{@link module:baseaggregate.compositionUpdated}</span><br>
 *
 * @module baseaggregate
 * @since 1.0/10
 */
define(['jquery', 'durandal/system', 'durandal/composition', 'plugins/router', 'vm-container', 'ui-content', 'config/Config', 'extensions', 'knockout', 'vm-util/UICommanding'], function(
    jQuery, system, composition, router, container, content, config, ext, ko, commanding) {
    
    console.log("AMD:baseaggregate");

    const _logger = Wincor.UI.Service.Provider.LogProvider;
    const _viewService = Wincor.UI.Service.Provider.ViewService;
    const SOFTKEY = config.viewType === "softkey";

    /**
     * If set to true by config, animations will be started, otherwise elements will directly be shown
     * @type {boolean}
     */
    let _animationsEnabled = config.VIEW_ANIMATIONS_ON;
    let _borderAnimationsOn = config.BORDER_DRAWING_ON;
    let _footerAnimationOn = config.FOOTER_ANIMATIONS_ON;

    let _isUpdate = false;
    let _hasFooter = true;
    let _doInit = false;
    let _isPopup = false; // This flag is only relevant for compositionComplete and not set while a popup is open!

    /**
     * Applies some classes to the command with the given id.
     * @param {string} cmdArgument
     * @param {string} cmdId
     */
    function applicator(cmdArgument, cmdId) {
        _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "> | BASE_AGGREGATE tagElements::applicator");
        let cmd = commanding.get(cmdId);
        if(cmd && cmd.element) {
            let cmdIds = commanding.cmdIds; // usually we handle the view commands, unless a popup is open...
            cmd.element.classList.add("viewStateSelected", "viewStatePressed");
            if(container.viewHelper.isPopupMessageActive()) {
                // ...then we handle only the popup commands to prevent from affecting commands
                // within the view while the popup is open
                cmdIds = commanding.getCommandsByViewModel("popupMainContent").map(cmd => {
                    return cmd.id;
                });
            }
            cmdIds.filter(id => {
                return id !== cmdId;
            }).map(id => {
                let elm = commanding.get(id).element;
                if(elm) {
                    elm.classList.remove("viewStatePressed");
                }
            });
            cmdIds.filter(id => {
                return commanding.get(id).initialViewState !== 5 && commanding.isActive(id);
            }).map(id => {
                let elm = commanding.get(id).element;
                if(elm) {
                    elm.classList.add("viewStateActive");
                }
            });
        }
        _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "< | BASE_AGGREGATE tagElements::applicator");
    }

    /**
     * Tags all commands of the current view.
     * @param {object} context
     */
    function tagElements(context) {
        _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "> | BASE_AGGREGATE tagElements");
        commanding.cmdIds.map(id => {
            let elm = commanding.get(id).element;
            if(elm) {
                elm.classList.remove("viewStateActive", "viewStateSelected");
            }
        });
        commanding.addDelegate({delegate: applicator, context: context});
        _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "< | BASE_AGGREGATE tagElements");
    }

    /**
     * Resets the observables of the footer for the cancel and extra areas.
     */
    function resetFooterObservables() {
        let vm = container.getById("flexFooter");
        if(vm && (container.getRestorationState() !== container.RESTORATION_STATE.RESTORED)) {
            // reset to force observable update even the new html has the same value
            vm.activeCancel("");
            vm.activeExtra("");
        }
    }

    return /** @alias module:baseaggregate */ {
        /**
         * The name of the module.
         * @type {string}
         */
        name: "baseaggregate",

        /**
         * Reference to jQuery.
         * @type {*}
         * @see {@link $}
         */
        jQuery: jQuery,

        /**
         * Reference to jQuery.
         * @type {*}
         * @see {@link jQuery}
         */
        $: jQuery,

        /**
         * Reference to the DurandalJS system module.
         * @type {*}
         */
        system: system,

        /**
         * Reference to the DurandalJS router module.
         * @type {*}
         */
        router: router,

        /**
         * Reference of the {@link module:ViewModelContainer} module.
         * @type {*}
         */
        container: container,

        /**
         * Reference of the {@link Content} module.
         * @type {*}
         */
        content: content,

        /**
         * Reference of the {@link Config} module.
         * @type {*}
         */
        config: config,

        /**
         * Reference of the logger module.
         * @type {*}
         */
        logger: _logger,

        /**
         * Reference to Promise system.
         * @type {*}
         */
        Promises: ext.Promises,

        /**
         * Reference of the {@link Wincor.UI.Content.ViewHelper} module.
         * @type {*}
         */
        viewHelper: container.viewHelper,

        /**
         * jQuery extend utility function.
         * @param {Object} obj any JSON notated object
         */
        extend: function(...obj) {
            let args = [{}, this].concat(obj);
            let ret = jQuery.extend.apply(null, args);
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `* | BASE_AGGREGATE baseaggregate::extend for ${ret.name}`);
            return ret;
        },

        /**
         * Flag whether view has been updated after a {@link module:baseaggregate.compositionComplete} hook.
         * @returns {boolean} true, if a view update has been forced.
         */
        isUpdate: function() {
            return _isUpdate;
        },

        /**
         * Allows the previous object to cancel deactivation.
         * Before a new screen (or component) is activated, the activator checks its current value. If this value has a canDeactivate() hook,
         * then it is called.
         * If this returns false, activation stops.
         * Order number 1.
         * @returns {boolean | Promise}
         * @see {@link http://durandaljs.com/documentation/Hooking-Lifecycle-Callbacks.html}
         * @lifecycle view
         */
        canDeactivate: function() {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `* | BASE_AGGREGATE ${this.name}:canDeactivate`);
            if(SOFTKEY) {
                // bread crumb group - active crumb
                jQuery(".breadCrumbActive").removeClass("breadCrumbActive");
                if(!_isPopup) {
                    // remove the slide indicator (optional)
                    container.viewHelper.moveSlideIndicator(-1);
                }
            }

            if (!_footerAnimationOn || !_animationsEnabled || !_hasFooter) {
                // __dialog__ of a module is a durandal specific member which is only available on "dialog.show" cases... (popups / component views)
                if (!this.__dialog__) {
                    resetFooterObservables();
                }
                return true;
            }

            return ext.Promises.promise(resolve => {
                let visibleCmds = commanding.getCommandsByViewModel("flexFooter").filter(cmd => {return commanding.isVisible(cmd.id)});
                let time = 0;
                if (visibleCmds.length > 0) {
                    time = 150;
                }
                if (container.getRestorationState() === container.RESTORATION_STATE.NONE && !container.viewModelHelper.isPopupActive()) {
                    if(_animationsEnabled && _footerAnimationOn) {
                        jQuery("#flexFooter").transition({y: "100%"}, time, () => {
                            // __dialog__ of a module is a durandal specific member which is only available on "dialog.show" cases... (popups / component views)
                            if(!this.__dialog__) {
                                resetFooterObservables();
                            }
                            resolve(true);
                        });
                    } else {
                        jQuery("#flexFooter").css("transform", "none");
                        // __dialog__ of a module is a durandal specific member which is only available on "dialog.show" cases... (popups / component views)
                        if(!this.__dialog__) {
                            resetFooterObservables();
                        }
                        resolve(true);
                    }
                } else {
                    resolve(true);
                }
            });
        },

        /**
         * Allows the new object to cancel activation.
         * Assuming {@link module:baseaggregate.canDeactivate} returned true (or promised resolved with true) (or isn't present), the new value will be checked for a canActivate() hook.
         * If present, it will be called.
         * If it returns false, activation stops here.
         * Order number 2.
         * @param {object} activationData data for activation
         * @returns {boolean | Promise}
         * @see {@link http://durandaljs.com/documentation/Hooking-Lifecycle-Callbacks.html}
         * @lifecycle view
         */
        canActivate: function(activationData) {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `* | BASE_AGGREGATE ${this.name}:canActivate`);
            // Remember to call container.init!
            // A component view will add activation data to the cycle! So if activationData.doInit is true, we know it is a component-view that will activate!
            // Since the router is not involved in this process, we have to call container.initialize ourselves when it comes to composition-complete (see below)
            _doInit = activationData && activationData.doInit;
            _isPopup = activationData && activationData.isPopup;
            return true;
        },

        /**
         * Allows the previous object to execute custom deactivation logic.
         * If the previous value can deactivate and the new value can activate, then we call the
         * previous value's deactivate() function, if present.
         * Durandal life-cycle function.
         * Order number 3.
         * @see {@link http://durandaljs.com/documentation/Hooking-Lifecycle-Callbacks.html}
         * @lifecycle view
         */
        deactivate: function() {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `* | BASE_AGGREGATE ${this.name}:deactivate`);
            commanding.removeDelegate(this);
            if(_isPopup) {
                _isPopup = false;
            }
            _isUpdate = false;
        },

        /**
         * Assuming everything has gone well up to this point: if the new value has an activate() function,
         * we call that and the process finishes until a new activation begins.
         * Order number 4.
         * @see {@link http://durandaljs.com/documentation/Hooking-Lifecycle-Callbacks.html}
         * @lifecycle viewmodel
         */
        activate: function() {
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `* | BASE_AGGREGATE LifeCycle: 03 ${this.name}:activate`);
            return container.doInit(this.name);
        },

        // Durandal life-cycle function.
        // Order number 5.
        // Isn't overridden due to Durandal restriction.
        // getView: function() {...}

        /**
         * Notifies the new object immediately before data binding occurs.
         * Order number 6.
         * @param {HTMLElement} view the new view html fragment
         * @returns {boolean | Promise}
         * @see {@link http://durandaljs.com/documentation/Hooking-Lifecycle-Callbacks.html}
         * @lifecycle view
         */
        binding: function(view) {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `* | BASE_AGGREGATE ${this.name}:binding viewId=${view.id}, moduleId=${system.getModuleId(this)}`);
            if(content.designModeExtended && _animationsEnabled !== config.VIEW_ANIMATIONS_ON)  { // refresh animation flags in EDM?
                _animationsEnabled = config.VIEW_ANIMATIONS_ON;
                _borderAnimationsOn = config.BORDER_DRAWING_ON;
                _footerAnimationOn = config.FOOTER_ANIMATIONS_ON;
            }
            // set all drawing targets to opacity 0 at this point in time ensures invisibility
            let $view = jQuery(view);
            // set the view id into the <main> fragment in order that CSS is able to select view fragments like: #flexMain[data-view-id="myviewname"]
            // This is the earliest time point where to set the view id before the new fragment appears in the DOM.
            $view.attr("data-view-id", container.currentViewId);
            // set the visible limits max value in the case of 'softkey' viewset
            if(SOFTKEY) {
                let vm = container.getById("flexMain");
                if(vm && vm.visibleLimits) {
                    jQuery("[data-view-key]").first().attr({"data-max-softkeys": vm.visibleLimits.max, "data-softkeys-orientation": vm.visibleLimits.orientation});
                } else {
                    jQuery("[data-view-key]").first().attr({"data-max-softkeys": "", "data-softkeys-orientation": ""});
                }
            }
            if(!_animationsEnabled) {
                container.viewHelper.stopAnimations(view);
            }
            if(container.designTimeRunner) {
                // let the designTimeRunner setup interactions, we need to ensure to add/enhance the binding declaration before th commands gets created
                container.designTimeRunner.setDesignModeInteractions(view);
            }
            return container.doBind(view);
        },

        /**
         * Notifies the new object immediately after data binding occurs.
         * Order number 7.
         * @param {HTMLElement} view the new view html fragment
         * @param {Object} parent
         * @see {@link http://durandaljs.com/documentation/Hooking-Lifecycle-Callbacks.html}
         * @lifecycle view
         */
        bindingComplete: function(view, parent) {
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `* | BASE_AGGREGATE LifeCycle: 08 ${this.name}:bindingComplete`);
            if(_borderAnimationsOn) {
                container.viewHelper.borderDrawing.prepare(view);
            }
            if(container.designTimeRunner) {
                // let the designTimeRunner setup interactions, we need to ensure that the commands are created and check whether to deactivate a hardware trigger since there
                // already is a command inside the interaction container
                container.designTimeRunner.setDesignModeInteractions(view, true);
            }
        },

        /**
         * Notifies the new object when its view is attached to its parent DOM node.
         * Order number 8.
         * @see {@link http://durandaljs.com/documentation/Hooking-Lifecycle-Callbacks.html}
         * @param {HTMLElement} view the new view html fragment
         * @param {Object} parent
         * @lifecycle view
         */
        attached: function(view, parent) {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `* | BASE_AGGREGATE ${this.name}:attached`);
            // update the custom attribute 'data-view-key' and give viewkey specific styling to get in place
            container.viewHelper.updateViewKey(container.currentViewKey);
        },

        /**
         * Notifies a composed object when its view is removed from the DOM.
         * Order number 9.
         * @see {@link http://durandaljs.com/documentation/Hooking-Lifecycle-Callbacks.html}
         * @lifecycle view
         */
        detached: function() {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `* | BASE_AGGREGATE ${this.name}:detached`);
        },

        /**
         * Notifies the new object when the composition it participates in is complete.
         * Order number 10.
         * @param {HTMLElement} view    The new view html fragment
         * @param {Object} parent       TODO
         * @see {@link http://durandaljs.com/documentation/Hooking-Lifecycle-Callbacks.html}
         * @lifecycle view
         */
        compositionComplete: function(view, parent) {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `* | BASE_AGGREGATE ${this.name}:compositionComplete`);
            const $footer = jQuery("#flexFooter");
            if (_animationsEnabled && _footerAnimationOn && (_hasFooter = $footer.height() > 10)) {
                $footer.transition({y: "0"}, 150);
            } else {
                $footer.css("transform", "none");
            }

            // during canActivate we remembered whether to call container.initialize for a component-view
            if (_doInit) {
                container.initialize();
                _doInit = false;
            }

            if (_isPopup) {
                jQuery("[data-view-id]").attr("data-popup-active", "true");
                let mainVM = container.getMainViewModels()[0];
                let opts = mainVM ? mainVM.getPopupOptions() : null;
                let type = "UNKNOWN_TYPE";
                if (opts && opts.type) {
                    type = opts.type;
                    if(opts.onCompositionComplete && typeof opts.onCompositionComplete === "function") {
                        opts.onCompositionComplete();
                    }
                }
                commanding.whenEppProcessingDone()
                    .then(function(t) {
                        if(!content.designMode) {
                            _viewService.firePopupNotification(true, t);
                        }
                        mainVM.notifyViewUpdated(mainVM.buildGuiKey(t));
                    }.bind(null, type), 1);
            }

            // it seems we are part of a modal dialog, so we have to initialize the container manually
            container.compositionComplete();
            // Generally views which containing one or more input fields should be always brought to window front (physically the browser window)
            // in order to make specialities like input cursor etc. work.
            if(content.applicationMode || content.designModeExtended) {
                let $inputs = jQuery(view).find("input");
                if($inputs.length) {
                    // in extended design mode this method does nothing interested
                    _viewService.bringToFront(msg => _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `. BASE_AGGREGATE::compositionComplete bringToFront callback=${msg.RC}`));
                }
            }
            if(_animationsEnabled && _borderAnimationsOn) {
                container.viewHelper.borderDrawing.draw(view);
            }
            tagElements(this);
            if(content.applicationMode) {
                // clear console regarding mime type warnings since this is memory relevant.
                window.setTimeout(() => console.clear(), 500);
            }
        },

        /**
         * Called when content has been updated.
         * This is not a native durandal entry point, but is invoked after {@link module:baseaggregate.compositionComplete} when a view has been updated.
         * Order number 10a.
         * @lifecycle view
         */
        compositionUpdated: function() {
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `* | BASE_AGGREGATE LifeCycle: 05a ${this.name}:compositionUpdated`);
            _isUpdate = true;
            if(_animationsEnabled && _borderAnimationsOn) {
                container.viewHelper.borderDrawing.prepare();
                container.viewHelper.borderDrawing.draw();
            }
            tagElements(this);
            if(content.applicationMode) {
                // clear console regarding mime type warnings since this is memory relevant.
                window.setTimeout(() => console.clear(), 500);
            }
        },

    };
});

