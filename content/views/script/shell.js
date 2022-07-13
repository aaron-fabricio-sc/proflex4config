/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ shell.js 4.3.1-201021-21-23fb68fb-1a04bc7d
 */
/**
 * The shell module is composes the <i>shell.html</i>.
 * <p>
 * Basically it's used to initiate the any SPA fragment life-cycle round trip.
 * For this it register itself to the ViewService's SERVICE_EVENTS.NAVIGATE_SPA event in order to get a starting
 * point when it comes to the next view or even a view update only.
 * </p>
 * @module shell
 * @since 1.0/10
 */
define(['jquery', 'durandal/system', 'durandal/viewEngine', 'durandal/activator', 'plugins/router', 'durandal/app', 'durandal/composition', 'vm-container', 'config/Config', 'vm-util/UIMovements',
        'vm-util/StyleResourceResolver', 'extensions', 'vm-util/ViewModelHelper', 'plugins/dialog', 'vm-util/UICommanding', 'durandal/viewLocator'],
    function(jQuery, system, viewEngine, activator, router, app, composition, container, config, uiMovements, styleResResolver, ext, viewModelHelper, dialog, commanding, viewLocator) {

    "use strict";
    console.log("AMD:shell");

    const _logger = Wincor.UI.Service.Provider.LogProvider;
    const _viewService = Wincor.UI.Service.Provider.ViewService;
    const _isDesignMode = Wincor.UI.Content.designMode;

    let _isWaitSpinnerActive = false;
    // To avoid erroneous navigation type on startup sequence with same view (mywelcome -> mywelcome),
    // we need the first comparison to check against our initial starting route which will not come here via SPA event!
    let _currentNavigatedRoute = config.initialRoute;
    let _lastComponent = null;

    if (_isDesignMode) {
        // for testing
        window.router = router;
    }

    styleResResolver.process();

    if(!_isDesignMode || Wincor.UI.Content.designModeExtended) {
        awaitSPA();
    }

    /**
     * Removes the wait spinner if its active.
     * @private
     */
    function removeWaitSpinner() {
        if(_isWaitSpinnerActive) {
            _isWaitSpinnerActive = false;
        }
        if(container.viewHelper) {
            container.viewHelper.removeWaitSpinner();
        }
        // because Durandal set the waitspinner.component.html component display block when the component has been composed into the DOM.
        // Happens only when starting the SPA.
        jQuery(".modalOverlay").css("display", "none");
    }

    /**
     * SPA navigation handler.
     * Registers for SPA event and handle the corresponding event.
     */
    function awaitSPA() {
        _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "* shell:registerForServiceEvent NAVIGATE_SPA");
        // register for NAVIGATE_SPA event...
        _viewService.registerForServiceEvent(_viewService.SERVICE_EVENTS.NAVIGATE_SPA, function onNavigateSpa(destination) {
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `* | VIEW LifeCycle: 01 ################ ${destination.viewKey} <> ${destination.url}  >previous: ${destination.lastViewUrl}  queryStr: ${destination.queryString} ###################`);
            _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, `> shell:onNavigateSpa(${JSON.stringify(destination)})`);
            let result = true;  // we assume everything is going well
            let isWaitSpinner;
            let doNavigation;
            let showComponent = destination.routeName.toLowerCase().includes(".component");
            let routeHash;
            // lookup for right route in routing table
            let routeObj = config.findRouteByName(destination.routeName);
            if(!routeObj) { // if route doesn't exists add try to add it
                config.addRoute(destination.routeName);
                routeObj = config.findRouteByName(destination.routeName); // redo
            }
            let routeConfig = routeObj !== null ? routeObj.route : "errorNoRouteFound"; // force unknown route if no route got
            // dependent from query string we expect something like views/idlepresentation or views/idlepresentation?key=20140707161815
            routeHash = routeConfig + (destination.queryString === "" ? "" : ("?" + destination.queryString));
            // read configuration whether we should display the wait spinner instead of navigating...
            let viewConfig = _viewService.viewContext.viewConfig;
            // determine what to do at next...
            isWaitSpinner = viewConfig && viewConfig.popup.waitspinner !== undefined && viewConfig.popup.waitspinner === true;
            doNavigation = !isWaitSpinner && _currentNavigatedRoute !== destination.routeName;
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, `. shell:onNavigateSpa currentNavigatedUrl=${_currentNavigatedRoute}, newRouteHash=${routeHash}, isWaitSpinner=${isWaitSpinner}, doNavigation=${doNavigation}, isWaitSpinnerActive=${_isWaitSpinnerActive}`);

            // setting the current view key & view id
            container.setViewKey(destination.viewKey);
            container.setViewId(destination.routeName);

            let preparation = ext.Promises.Promise.resolve();
            if (container.activatedDfd.promise.isPending()) {
                preparation = container.reset();
            }

            if (container.viewHelper.isPopupMessageActive()) {
                // restore path's to make sure fragment is loaded from correct path
                // if this is also a popup, the popups path will be set again below
                viewLocator.useConvention(config.modulesPath, config.viewsPath);
            }

            preparation.then(() => {
                // first check whether we have to display wait spinner.
                if(isWaitSpinner) {
                    let promise = ext.Promises.Promise.resolve();
                    if(!_isWaitSpinnerActive) { // check whether spinner is already active - in this case the following is already done.
                        container.suspend();
                        if(config.viewType === "softkey") {
                            container.viewHelper.moveSlideIndicator(-1); // remove a possible slide indicator - gets renewed afterwards, if view stays
                        }
                        // do not clean, deactivate or other stuff, since this would affect
                        // the visual data during waiting or causes side effects if next view
                        // will be the same as the current view !
                        promise = container.viewHelper.showWaitSpinner();
                        _isWaitSpinnerActive = true;
                        _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, ". shell:onNavigateSpa waitspinner activated");
                    }
                    promise
                        .then(() => {
                            _viewService.registerForServiceEvent(_viewService.SERVICE_EVENTS.TURN_ACTIVE, () => {
                                _viewService.fireActivated();
                            }, _viewService.DISPOSAL_TRIGGER_ONETIME);
                            Wincor.UI.Content.Ada.initialize()
                                .then(_viewService.firePrepared.bind(_viewService))
                                .catch(reason => {
                                    _logger.error(`shell:onNavigateSpa during preparation (Ada.initialize) failed: reason=${reason}`);
                                });
                        })
                        .catch(reason => {
                            _logger.error(`shell:onNavigateSpa during preparation failed: reason=${reason}`);
                        });
                } else if(showComponent) { // display component
                    let ctx = dialog.getContext();
                    ctx.blockoutOpacity = 1.0;
                    ctx.removeDelay = 0;
                    // we don't support another popup while displaying a component, so we the flags false!
                    _viewService.viewContext.viewConfig.popup.oncancel = false;
                    _viewService.viewContext.viewConfig.popup.ontimeout = false;
                    // Do not set _currentNavigatedRoute! We do not use the router here!
                    let closeFinished = ext.Promises.promise(resolve => {
                        // Preserve VMs in case of the same view being displayed after dialog as before!
                        // Preserve is done before deactivate to avoid the concrete VMs receiving "onDeactivated" callback!
                        container.preserve();
                        container.deactivate(/*shutdown=*/false, /*viewRelatedAlso=*/true)
                            .then(() => {
                                resolve();
                            });
                    });
                    closeFinished
                        .then(() => {
                            let suspendId = commanding.suspend([], "shell:component");
                            let moduleName = config.modulesPath + destination.url.replace(".html", "");
                            require([moduleName], module => { // require the component module manually
                                _lastComponent = module;
                                viewLocator.useConvention(config.modulesPath, config.componentsPath); // switch the views module path convention
                                dialog.show(module, {doInit: true})
                                    .then(() => {
                                        commanding.resume(suspendId);
                                        _lastComponent = null;
                                    })
                                    .catch(reason => {
                                        _logger.error(`shell:onNavigateSpa display component (dialog show) failed: reason=${reason}`);
                                    });
                                container.whenActivated()
                                    .then(() => {
                                        _viewService.registerForServiceEvent(_viewService.SERVICE_EVENTS.VIEW_CLOSING, () => {
                                            viewLocator.useConvention(config.modulesPath, config.viewsPath); // restore path's
                                            dialog.close(module);
                                            container.cleanNodes(/*shutdown=*/false, /*isViewChange=*/false); // clean ko nodes first
                                            container.deactivateViewModels();
                                            container.clean(/*shutdown=*/false, /*isViewChange=*/false);
                                            container.restore(); // let container restore all other viewmodels, ours will be removed
                                        }, _viewService.DISPOSAL_TRIGGER_ONETIME);
                                    })
                                    .catch(reason => {
                                        _logger.error(`shell:onNavigateSpa display component (whenActivated) failed: reason=${reason}`);
                                    });
                            }, error => {
                                viewLocator.useConvention(config.modulesPath, config.viewsPath); // restore path's
                                _logger.error(`shell:onNavigateSpa failed loading component module ${moduleName} error: ${error}`);
                            });
                        })
                        .catch(reason => {
                            _logger.error(`shell:onNavigateSpa display component (close finished) failed: reason=${reason}`);
                        });
                } else if(doNavigation) { // normal routing... (view unequals to current)
                    _lastComponent ? dialog.close(_lastComponent) : null;
                    container.cleanNodes(/*shutdown=*/false); // cleans the DOM nodes that (main) viewmodels bound
                    container.deactivate(/*shutdown=*/false, /*viewRelatedAlso=*/true)
                        .then(() => {
                            container.clean(); // clean up the rest of each (main) viewmodel
                            container.remove();
                            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, ". shell:onNavigateSpa navigation to new view");
                            // if wait spinner is currently active then it will be deactivated when the navigation is complete or on any error.
                            // clean BEFORE deactivation to avoid observables reflect deactivated states within visible content, remove must follow up.
                            result = router.navigate(routeHash);
                            removeWaitSpinner(); // remove the wait spinner here, because it collides always with the please wait animation
                            // remember this navigation for next determination of what to do
                            _currentNavigatedRoute = destination.routeName;
                        }) // deactivate also VIEW_RELATED view models
                        .catch(reason => {
                            _logger.error(`shell:onNavigateSpa container.deactivate failed: reason=${reason}`);
                        });
                } else { // view URL equals (we stay on the same physical view)
                    _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, ". shell:onNavigateSpa remain on current view");
                    let isWaitSpinnerRequired = true;
                    // check whether wait spinner isn't currently active
                    if(!_isWaitSpinnerActive) {
                        setTimeout(() => {
                            if(isWaitSpinnerRequired) {
                                _isWaitSpinnerActive = true;
                                container.viewHelper.showWaitSpinner();
                            }
                        }, 500);
                    }
                    isWaitSpinnerRequired = false;
                    // do not clean, otherwise we fall into trouble.
                    // Clean will be done if we navigate to a new view and after clean always a remove must follow !
                    _lastComponent ? dialog.close(_lastComponent) : null;
                    commanding.removeListeners();
                    router.trigger('router:navigation:composition-update-begin');
                    container.refresh()
                        .then(() => {
                            removeWaitSpinner()
                        })
                        .catch(reason => {
                            _logger.error(`shell:onNavigateSpa container.refresh failed: reason=${reason}`);
                        });
                }

                // TODO: check... resutl is only set by 'result = router.navigate(routeHash);' above... and also removed there... no need for this code below (it's synchronous btw.)
                //if(!result) {
                //    removeWaitSpinner();
                //    Wincor.UI.Service.Provider.propagateError("shell:onNavigateSpa router.navigate(" + destination.routeName + ") failed!", "ROUTING");
                //}
                _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< shell:onNavigateSpa " + destination.routeName + " returns " + result);
            })
            .catch(reason => {
                _logger.error(`shell:onNavigateSpa preparation failed: reason=${reason}`);
            });
        }, _viewService.DISPOSAL_TRIGGER_SHUTDOWN);

        _viewService.registerForServiceEvent(_viewService.SERVICE_EVENTS.SHUTDOWN, ()=>{
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, "* | VIEW shell event SHUTDOWN received... resetting router");
            router.off();// off all (not sure if this would also be done by reset)
            router.reset();
        }, _viewService.DISPOSAL_TRIGGER_SHUTDOWN);
    }


    // register to router composition complete event
    router.on("router:navigation:composition-complete")
        .then((instance, instruction, router) => {
            _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, "* | VIEW LifeCycle: 10 shell event=router:navigation:composition-complete viewId=" + instruction.config.name + ", moduleId=" + system.getModuleId(instance));
            system.updateViewId();
            if(instruction.config.name && !system.isErrorState) {
                container.initialize()
                    .then(() => {
                        _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "* | VIEW shell.js VIEWMODELCONTAINER PROMISE RESOLVED");
                        removeWaitSpinner();
                    })
                    .catch(reason => {
                        _logger.error("view life-cycle (initialize): VIEWMODELCONTAINER PROMISE REJECTED!!!! reason: " + reason);
                        if (_isDesignMode) {
                            _logger.error("router:navigation:composition-complete route exception during container.initialize ! " + reason);
                        } else {
                            Wincor.UI.Service.Provider.propagateError("shell.js", "COMPOSITION", reason ? reason : void 0);
                        }
                    });
            } else if(system.isErrorState) {
                _logger.LOG_ANALYSE && _logger.log(_logger.LOG_ANALYSE, "* System error state set, skip container actions.");
                removeWaitSpinner();
                // this error happens before the container is initialized, so at least remove the vm not needed...
                container.remove();
                // reset system error state
                system.isErrorState = false;
                // try navigate to offline SPA
                _currentNavigatedRoute = config.findRouteByName(config.offlineSpaRoute);
                if(_currentNavigatedRoute) {
                    _currentNavigatedRoute = _currentNavigatedRoute.route;
                    container.clean();
                    container.deactivate(/*shutdown=*/false, /*viewRelatedAlso=*/true).then(() => { // deactivate also VIEW_RELATED view models
                        container.remove();
                        router.navigate(_currentNavigatedRoute);
                        system.setViewId(config.offlineSpaRoute);
                        system.updateViewId();
                    });
                } else {
                    _logger.error("router:navigation:composition-complete route 'offlinespa' not configured, navigation to 'offlinespa' not possible !");
                }
            }
        });
        // .catch(reason => {
        //     _logger.error(`shell:router:navigation:composition-complete failed: reason=${reason}`);
        // });


    router.on("router:navigation:cancelled")
        .then((instance, instruction, router) => {
            _logger.error(`router:navigation:cancelled module: ${instance ? instance.name : ""} - instruction: ${JSON.stringify(instruction, null, " ")}`);
            Wincor.UI.Service.Provider.propagateError(`router:navigation:cancelled module: ${instance ? instance.name : ""} - instruction: ${JSON.stringify(instruction, null, " ")}`, "ROUTING");
            // reset the container to make it available for a new try...
            container.reset();
            _currentNavigatedRoute = "";
        });
        // .catch(reason => {
        //     _logger.error(`shell:router:navigation:cancelled failed: reason=${reason}`);
        // });

    // set the name of the transition to use if transition animation is desired
    if(config.TRANSITION_ON) {
        composition.defaultTransitionName = config.TRANSITION_NAME;
    }

    return /** @alias module:shell*/ {
        /**
         * The reference to the DurandalJS router.
         * @type {*}
         */
        router: router,

        /**
         * Activates the view model.
         * Durandal life-cycle function.
         * Order number 4.
         * See Durandal documentation.
         */
        activate: function () {
            return ext.Promises.promise(function(resolve, reject) {
                container.initDesignTimeRunner()
                    .then(() => {
                        router.map(config.ROUTES)
                            .buildNavigationModel()
                            .mapUnknownRoutes(instruction=>{
                                _logger.error("shell:mapUnknownRoutes router.navigate(" + instruction.fragment + ") failed!");
                                if(_isDesignMode) {
                                    alert("Unknown route " + instruction.fragment + " ! Will go to offlinespa next...");
                                    instruction.config.moduleId = config.findModuleIdByName(config.offlineSpaRoute);
                                    system.setViewId(config.offlineSpaRoute);
                                    system.updateViewId();
                                    return instruction;
                                }
                                else {
                                    Wincor.UI.Service.Provider.propagateError("shell:mapUnknownRoutes router.navigate(" + instruction.fragment + ") failed!", "ROUTING");
                                    instruction.config.moduleId = config.findModuleIdByName(config.offlineSpaRoute);
                                    system.setViewId(config.offlineSpaRoute);
                                    system.updateViewId();
                                    return instruction;
                                }
                            });

                        resolve(router.activate());
                    })
                    .fail(reason => {
                        _logger.error(`shell:activate initDesignTimeRunner failed: reason=${reason}`);
                        reject(reason);
                    });
            });
        },

        /**
         * Durandal life-cycle function.
         * Order number 5.
         * @return {*}
         */
        getView: function() {
            // preload offlinespa, if content comes from a web server and it would get offline,
            // we already loaded "offlinespa" to present it in the unknown routes case.
            const routeConfig = config.findRouteByName(config.offlineSpaRoute);
            const route = viewEngine.convertViewIdToRequirePath(routeConfig.route);
            system.acquire([route, routeConfig.moduleId]);
            const ret = config.findRouteByName(config.startModule);
            return ret ? ret.route : "";
        },

        /**
         * Notifies the new object immediately before data binding occurs.
         * Durandal life-cycle function.
         * Order number 6.
         * @param {HTMLElement} view the new view html fragment
         * @see {@link http://durandaljs.com/documentation/Hooking-Lifecycle-Callbacks.html}
         */
        binding: function(view) {
            system.setShell(view);
            container.setViewId(config.startModule);
            system.updateViewId();
        }
    };
    }
);
