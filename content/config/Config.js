/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ Config.js 4.3.1-201130-21-086c3328-1a04bc7d

*/

/**
 * The Config module provides all UI content specific parameters.
 * <p>
 * They are divided into 2 groups: The first is available in basic design mode only. The second is available
 * during application mode and extended design mode and _also_ during basic design mode.
 * <p>
 * @module Config
 * @since 1.0/00
 */
define(["jquery", "plugins/router", "ui-content", "extensions"], function (
  jQuery,
  router,
  content,
  ext
) {
  console.log("AMD:Config");

  const _logger = Wincor.UI.Service.Provider.LogProvider;

  const CONFIG_PATH = "../../content/config/";
  const CONFIG_PATH_DESIGN_TIME_DATA = CONFIG_PATH + "designtimedata/";
  const CONFIG_PATH_DESIGN_TIME_DATA_BASIC =
    CONFIG_PATH_DESIGN_TIME_DATA + "basic/";
  const ROUTE_CONFIG_FILE = "RouteConfig.json";
  const ROUTE_CONFIG_CUSTOM_FILE = "RouteConfigCustom.json";
  const CONFIG_CUSTOM_FILE = "Config.json";
  const FLOW_CONFIG_FILE = "FlowConfig.json";
  const FLOW_CONFIG_CUSTOM_FILE = "FlowConfigCustom.json";
  const GUIDM = "GUIDM";

  /**
   * Merges the configured routes.
   * Fulfill the empty attributes.
   * @param {Object} config the config object
   * @param {Object} spaRoutes the JSON object including the 'routes' attribute.
   * @returns {Array} the merged routes
   */
  function updateRoutingTable(config, spaRoutes) {
    let routes = spaRoutes.routes,
      cr,
      routesToDel = [];
    for (let i = 0; i < routes.length; i++) {
      cr = routes[i];
      if (!cr.route || cr.name === spaRoutes.initialRoute) {
        if (cr.name !== spaRoutes.initialRoute) {
          // skip 'welcome'
          cr.route = `${spaRoutes.viewsPath}${cr.name}`;
        } else {
          // 'welcome' route, must be set to empty
          cr.route = "";
        }
      }
      if (!cr.moduleId) {
        cr.moduleId = spaRoutes.modulesPath + cr.name;
      }
      for (let j = routes.length - 1; j > i; j--) {
        if (cr.name === routes[j].name) {
          routesToDel.push(j);
          _logger.error(`Route configuration is wrong. Each route must be unique and be corresponding to a physical existing view.
                        Route '${cr.name}' is at least twice a time. Route will be removed. Please check 'SpaRoutes.json'`);
        }
      }
    }
    // remove doubles
    for (let i = 0; i < routesToDel.length; i++) {
      routes.splice(routesToDel[i], 1);
    }
    return routes;
  }

  /**
   * Merges the route 1 table with route 2.
   * @param {Array<Object>} routes_1 the resulting array
   * @param {Array<Object>} routes_2
   * @returns {Array<Object>} the merged routes 1 table
   */
  function mergeRoutes(routes_1, routes_2) {
    let routes = routes_1,
      found;
    if (routes_2) {
      for (let i = 0; i < routes_2.length; i++) {
        found = false;
        for (let k = routes.length - 1; k >= 0; k--) {
          if (routes[k].name === routes_2[i].name) {
            routes[k] = routes_2[i];
            found = true;
            break;
          }
        }
        if (!found) {
          routes.push(routes_2[i]);
        }
      }
    }
    return routes;
  }

  /**
   * Encapsulates several things to not payload the application mode.
   * Things in this functions should be used for design mode purposes only.
   * @param {Object} sharedConfig the common shared configuration
   * @returns {Object} the design mode config
   * @constructor
   */
  function DesignModeConfig(sharedConfig) {
    const LEVEL_INFO = "InfoBox";
    const LEVEL_WARNING = "WarningBox";
    const LEVEL_ERROR = "ErrorBox";

    function installCloseMessage() {
      let $msgContainerHeader = jQuery(".messageArea");
      if ($msgContainerHeader.length) {
        $msgContainerHeader.removeAttr("onclick");
      }
      if (!$msgContainerHeader.parent().find("button").length) {
        $msgContainerHeader.before(`<button id='closeMessageId' style='animation: lightSpeedIn 1s ease-in; align-self: flex-start;' 
                                             onclick="Wincor.UI.Content.ViewModelContainer.sendViewModelEvent(Wincor.UI.Content.ViewModelContainer.EVENT_ON_BEFORE_CLEAN);
                                             jQuery(this).remove();">
                                             Close message
                                            </button>`);
      }
    }

    return /** @alias module:Config */ {
      /**
       * CSS styles for the dynamic routing menu activator icon.
       */
      DSM_MENU_ICON: {
        name: "dtr_menu_icon.svg",
        src: "../views/style/default/images/dtr_menu_icon.svg",
      },

      /**
       * The hot key for toggle the design time runner menu.
       * The combination of the first key and the second key down toggles the menu.
       * @default ALT-M
       * @type {Array<Number>}
       */
      HOTKEY_TOGGLE_MENU: [18, 77],

      OPTIONS_MENU_ITEMS: [
        {
          name: "<span class=color06-dtr>Type:</span>&nbsp&nbsp Default",
          param: {
            target: "STYLE_TYPE",
            value: "default/",
            action: (container, styleResResolver, item) =>
              styleResResolver.setType(item.param.value),
          },
        },
        {
          name: "<span class=color06-dtr>Type:</span>&nbsp&nbsp Mercury dark",
          param: {
            target: "STYLE_TYPE",
            value: "MercuryDark/",
            action: (container, styleResResolver, item) =>
              styleResResolver.setType(item.param.value),
          },
        },
        {
          name: "<span class=color06-dtr>Type:</span>&nbsp&nbsp Mercury light",
          param: {
            target: "STYLE_TYPE",
            value: "MercuryLight/",
            action: (container, styleResResolver, item) =>
              styleResResolver.setType(item.param.value),
          },
        },
        {
          name: "<span class=color06-dtr>Type:</span>&nbsp&nbsp DNSeries",
          param: {
            target: "STYLE_TYPE",
            value: "DNSeries/",
            action: (container, styleResResolver, item) =>
              styleResResolver.setType(item.param.value),
          },
        },
        {
          name: "<span class=color06-dtr>Type:</span>&nbsp&nbsp ADA hide screen",
          param: {
            target: "STYLE_TYPE",
            value: "ADAHideScreen/",
            viewType: "softkey",
            action: (container, styleResResolver, item) =>
              styleResResolver.setType(item.param.value),
          },
        },
        {
          name: "<span class=color06-dtr>Type:</span>&nbsp&nbsp ADA high contrast",
          param: {
            target: "STYLE_TYPE",
            value: "ADAHighContrast/",
            viewType: "softkey",
            action: (container, styleResResolver, item) =>
              styleResResolver.setType(item.param.value),
          },
        },
        {
          name: "<span class=color06-dtr>Vendor:</span>&nbsp&nbsp NCR",
          param: {
            target: "STYLE_VENDOR",
            value: "NCR/",
            viewType: "softkey",
            action: (container, styleResResolver, item) => {
              container.viewHelper.moveSlideIndicator(-1);
              styleResResolver.setVendor(item.param.value);
              setTimeout(() => container.viewHelper.moveSlideIndicator(0), 150);
            },
          },
        },
        {
          name: "<span class=color06-dtr>Vendor:</span>&nbsp&nbsp Diebold",
          param: {
            target: "STYLE_VENDOR",
            value: "DIEBOLD/",
            viewType: "softkey",
            action: async (container, styleResResolver, item) => {
              container.viewHelper.moveSlideIndicator(-1);
              await styleResResolver.setVendor(item.param.value);
              setTimeout(() => container.viewHelper.moveSlideIndicator(0), 150);
            },
          },
        },
        {
          name: "<span class=color06-dtr>Vendor:</span>&nbsp&nbsp Wincor Nixdorf",
          param: {
            target: "STYLE_VENDOR",
            value: "default/",
            viewType: "softkey",
            action: async (container, styleResResolver, item) => {
              container.viewHelper.moveSlideIndicator(-1);
              await styleResResolver.setVendor(item.param.value);
              setTimeout(() => container.viewHelper.moveSlideIndicator(0), 150);
            },
          },
        },
        {
          name: "<span class=color06-dtr>Vendor:</span>&nbsp&nbsp WN-NCR",
          param: {
            target: "STYLE_VENDOR",
            value: "WN-NCR/",
            viewType: "softkey",
            action: async (container, styleResResolver, item) => {
              container.viewHelper.moveSlideIndicator(-1);
              await styleResResolver.setVendor(item.param.value);
              setTimeout(() => container.viewHelper.moveSlideIndicator(0), 150);
            },
          },
        },
        {
          name: "show default message",
          param: {
            action: (container) => {
              sharedConfig.retrieveJSONData("MessageData").then((data) => {
                container.sendViewModelEvent(container.EVENT_ON_BEFORE_CLEAN); // clear message
                container.sendViewModelEvent(
                  container.EVENT_ON_MESSAGE_AVAILABLE,
                  { messageText: data.message, messageLevel: LEVEL_INFO }
                );
                installCloseMessage();
              });
            },
          },
        },
        {
          name: "show warning message",
          param: {
            action: (container) => {
              sharedConfig.retrieveJSONData("MessageData").then((data) => {
                container.sendViewModelEvent(container.EVENT_ON_BEFORE_CLEAN); // clear message
                container.sendViewModelEvent(
                  container.EVENT_ON_MESSAGE_AVAILABLE,
                  { messageText: data.message, messageLevel: LEVEL_WARNING }
                );
                installCloseMessage();
              });
            },
          },
        },
        {
          name: "show escalation message",
          param: {
            action: (container) => {
              sharedConfig.retrieveJSONData("MessageData").then((data) => {
                container.sendViewModelEvent(container.EVENT_ON_BEFORE_CLEAN); // clear message
                container.sendViewModelEvent(
                  container.EVENT_ON_MESSAGE_AVAILABLE,
                  { messageText: data.message, messageLevel: LEVEL_ERROR }
                );
                installCloseMessage();
              });
            },
          },
        },
        {
          name: "hide message",
          param: {
            action: (container) => {
              jQuery("#flexMessageContainerHeader").find("button").remove();
              container.sendViewModelEvent(container.EVENT_ON_BEFORE_CLEAN);
            },
          },
        },
        {
          name: "show popup message",
          param: {
            action: (container) => {
              container
                .getById("flexMain")
                .showPopupMessage("messagepopup.component.html", {
                  type: "HELP_POPUP",
                  message:
                    "Hello!<br>You are currently in ProFlex4 UI design-mode.<br>This message is provided to you by the <span class=color06-dtr <b>DesignTimeRunner</b></span>.",
                });
            },
          },
        },
        {
          name: "show popup amountentry",
          param: {
            action: (container) => {
              container
                .getById("flexMain")
                .showPopupMessage("amountentrypopup.component.html", {
                  type: "AMOUNT_ENTRY_POPUP",
                  config: {
                    preValue: "",
                    placeHolder: "45600",
                    decimal: false,
                    minAmount: 2000,
                    maxAmount: 27800,
                    multiplier: 100,
                    formatOption: "#M",
                    clearByCorrect: true,
                    fromConfig: true,
                  },
                });
            },
          },
        },
        {
          name: "hide popup",
          param: {
            action: (container) =>
              container.getById("flexMain").hidePopupMessage(),
          },
        },
        {
          name: "show wait spinner",
          param: {
            action: (container) => {
              // if the wait spinner has been triggered manually we update the onclick event in order to simply add a close button
              container.viewHelper.showWaitSpinner().then(() => {
                let $waitSpinner = jQuery("#waitSpinnerModalOverlay"); // element "waitSpinnerModalOverlay" is part of the body, not the view fragment
                if ($waitSpinner.length) {
                  $waitSpinner.removeAttr("onclick");
                }
                if (!$waitSpinner.find("button").length) {
                  $waitSpinner.append(`<button id='closeSpinnerId' style='animation: lightSpeedIn 1s ease-in; margin: 2% 0 0 46%;' 
                                                         onclick="Wincor.UI.Content.ViewModelContainer.viewHelper.removeWaitSpinner(); jQuery(this).remove();">
                                                         Close spinner
                                                     </button>`);
                }
              });
            },
          },
        },
        {
          name: "remove wait spinner",
          param: {
            action: (container) => {
              // remove the close spinner button first to prevent from seeing it in a view with wait spinner
              jQuery("#waitSpinnerModalOverlay").find("button").remove();
              container.viewHelper.removeWaitSpinner();
            },
          },
        },
        {
          name: "stop animations",
          param: {
            target: "VIEW_ANIMATIONS_ON",
            value: false,
            action: (container) => container.viewHelper.stopAnimations(),
          },
        },
      ],

      VIEWS: null,
      FLOW: null,

      /**
       * Gets a view key form the configuration.
       * Note: The view key for a view is optional.
       *
       * @param {string} viewName the name of the view to get the view key for.
       * You should keep in mind that the view key is an optional information.
       * @returns {string} the view key - if configured, '*' string otherwise
       */
      getViewKey: function (viewName) {
        let keys = Object.keys(this.VIEWS);
        for (let i = keys.length - 1; i >= 0; i--) {
          if (
            this.VIEWS[keys[i]].name === viewName &&
            this.VIEWS[keys[i]].viewkey
          ) {
            return this.VIEWS[keys[i]].viewkey;
          }
        }
        return "*";
      },
    };
  }

  function getToolingEDMConfig() {
    const noAnimations = {
      VIEW_ANIMATIONS_ON: false,
      TRANSITION_DURATION: 0,
      BUTTON_FADE_IN_TIME: 0,
      BORDER_DRAWING_ON: false,
    };

    if (content.toolingEDM && localStorage.getItem("animations") === "false") {
      return noAnimations;
    } else {
      return {};
    }
  }

  /**
   * Does a configuration setup.
   * The configuration comprises additional properties if design mode is active.
   * @returns {{findRouteByName: function, ROUTES: Array}}
   */
  const config = function () {
    /**
     * The general parameter group available in all modes: application mode, basic design mode, extended design mode or tooling mode.
     * @type {Object}
     * @alias module:Config
     */
    let config_0 = {
      /**
       * Finds a route by the given name.
       * @param {string} name the name for the route to find
       * @return {object} the route or null if the route couldn't be found by the given name
       */
      findRouteByName: function (name) {
        for (let i = this.ROUTES.length - 1; i >= 0; i--) {
          if (this.ROUTES[i].name === name) {
            return this.ROUTES[i];
          }
        }
        return null;
      },

      /**
       * Finds a module id by the given name.
       * @param {string} name the name for the module id to find
       * @return {string} the module id or an empty string if the module id couldn't be found by the given name
       */
      findModuleIdByName: function (name) {
        for (let i = this.ROUTES.length - 1; i >= 0; i--) {
          if (this.ROUTES[i].name === name) {
            return this.ROUTES[i].moduleId;
          }
        }
        return "";
      },

      /**
       * Adds dynamically a new route to the routing table.
       * The new route is only added if not existing so far.
       * @param {string} viewName the unique name of the view for the new route.
       */
      addRoute: function (viewName) {
        let found = false,
          routes = this.ROUTES;
        for (let i = routes.length - 1; i > -1; i--) {
          if (routes[i].name === viewName) {
            found = true;
            break;
          }
        }
        if (!found) {
          routes.push({
            name: viewName,
            route: this.viewsPath + viewName,
            moduleId: this.modulesPath + viewName,
            nav: true,
          });
          router.map([routes[routes.length - 1]]).buildNavigationModel(100);
          // the last handler is not a route, just swap our new route
          const handlers = router.handlers;
          const last = handlers.pop();
          handlers.splice(handlers.length - 1, 0, last);
          _logger.log(
            _logger.LOG_ANALYSE,
            `Config::addRoute dynamically added route '${this.viewsPath}${viewName}' to route table.`
          );
        }
      },

      /**
       * Retrieves JSON data from a JSON notated file.
       * The data must be JSON formatted and the file must have the json file extension.
       * The file must be located within '../content/config/designtimedata/basic' if the 'path' parameter isn't used
       * @param {string} jsonFileName the JSON notated file name which without '.json' or any slashes.
       * @param {string=} path optional parameter to a certain path other then the default path, the path must end with a slash
       * @returns {Promise} a promise object which can be used to resolve the data then.
       */
      retrieveJSONData: function (jsonFileName, path) {
        return ext.Promises.promise((resolve, reject) => {
          jsonFileName =
            jsonFileName.lastIndexOf(".json") === -1
              ? `${jsonFileName}.json`
              : jsonFileName;
          jQuery
            .getJSON(
              !path
                ? `${CONFIG_PATH_DESIGN_TIME_DATA_BASIC}${jsonFileName}`
                : `${path}${jsonFileName}`,
              resolve
            )
            .fail((e) =>
              reject(`Couldn't load JSON file '${jsonFileName}' cause: ${e}`)
            );
        });
      },

      /**
       * The view type either 'softkey' or 'touch'.
       * Take this information for determine specific things to be done based on the view type.
       * @default softkey
       * @type {string}
       */
      viewType: "softkey",

      /**
       * The path to the views.
       * @type {string}
       */
      viewsPath: "",

      /**
       * The path to the components.
       * @type {string}
       */
      componentsPath: "",

      /**
       * The path to the modules.
       * @type {string}
       */
      modulesPath: "",

      /**
       * The module to start with, usually 'shell'.
       * @type {string}
       */
      startModule: "",

      /**
       * The initial route to start with, usually 'welcome'.
       * @type {string}
       */
      initialRoute: "",

      /**
       * The offline SPA route if a SPA fragment could not loaded, usually 'offlinespa'.
       * @type {string}
       */
      offlineSpaRoute: "",

      /**
       * Flag tells whether DM is available (true) or (false).
       * This flag is also true in the case a DM is installed, but has been disabled.
       * @default false
       * @type {boolean}
       */
      isDirectMarketingAvailable: false,

      /**
       * The routes to all views.
       */
      ROUTES: null,

      // Transition animation parameter
      /**
       * Transition on or off.
       * @default true
       * @type {boolean}
       */
      TRANSITION_ON: true,

      /**
       * The name of the transition JS file.
       * A transition contains both in animation and out animation.
       * @default rollIn
       * @type {string}
       */
      TRANSITION_NAME: "rollIn",

      /**
       * The duration time (seconds) between transition.
       * @default 0.25
       * @type {number}
       */
      TRANSITION_DURATION: 0.25,

      /**
       * Name of the animation for a view comes in during a transition.
       * @default zoomIn
       * @type {string}
       */
      ANIMATION_IN: "zoomIn",

      /**
       * Name of the animation for a view gets out during a transition.
       * @type {string}
       */
      ANIMATION_OUT: "fadeOut",

      /**
       * The duration time in milli seconds for a command, usually a button, pressed effect.
       * @default 150
       * @type {number}
       */
      COMMAND_AUTOMATION_DURATION: 150,

      /**
       * View animations on or off.
       * @default true
       * @type {boolean}
       */
      VIEW_ANIMATIONS_ON: true,

      /**
       * Footer animations on or off.
       * @default true
       * @type {boolean}
       */
      FOOTER_ANIMATIONS_ON: true,

      /**
       * Border drawing animations on or off.
       * Usually all element rectangles gets drawn when such an element contains a CANVAS element
       * above it with class 'rectangleDrawingCanvas'.
       * @default true
       * @type {boolean}
       */
      BORDER_DRAWING_ON: true,

      /**
       * After the button border is drawn, the buttons will fade in. This value is the fade in time.
       * @default 200
       * @type {number}
       */
      BUTTON_FADE_IN_TIME: 200,

      /**
       * The style resource files for softkey related views.
       * @important This parameter is ignored in case the current resolution is available in the parameter {@link module:Config.STYLE_RESOURCE_MAPPING}
       * @default ["layouts-custom.css", "sizes-positions-custom.css", "animations-custom.css", "softkey-custom.css"]
       * @type {Array}
       */
      CUSTOM_STYLE_RESOURCES_SOFTKEY: [
        "layouts-custom.css",
        "sizes-positions-custom.css",
        "animations-custom.css",
        "softkey-custom.css",
      ],

      /**
       * The style resource files for touch related views.
       * @important This parameter is ignored in case the current resolution is available in the parameter {@link module:Config.STYLE_RESOURCE_MAPPING}
       * @default ["layouts-custom.css", "sizes-positions-custom.css", "animations-custom.css"]
       * @type {Array}
       */
      CUSTOM_STYLE_RESOURCES_TOUCH: [
        "layouts-custom.css",
        "sizes-positions-custom.css",
        "animations-custom.css",
      ],

      /**
       * The custom style resolutions folder for touch/softkey related views.
       * The array can be set with custom specific resolution folder names in the form of "widthxheight" e.g.: <i>"1050x1680"</i>.
       * <p>
       * Each resolution configured is checked up during start time to match the view port resolution.
       * Once a match succeeded the resolution folder is taken instead of a standard folder.
       * </p>
       * The custom specific folder may contain all style sheets which then override all standard ones or only a part of it e.g.
       * <i>sizes-positions.css</i> for replacing standard stylesheet or <i>sizes-position-custom.css</i> for overriding only some values of it.<br>
       * @default []
       * @type {Array<String>}
       */
      CUSTOM_STYLE_RESOLUTIONS: [],

      /**
             * Contains the explicit style resource mappings for each supported style type (softkey, touch) and resolution.
             * <p>
             * This configuration is for explicit stylesheet configuration purpose as a second approach to the implicit configuration done
             * by the RVT (<b>R</b>esolution, <b>V</b>endor, <b>T</b>ype) folder concept.
             * <br>
             * Using this parameter for a certain resolution replaces the (legacy) approach for that current resolution - in any other case the legacy approach is
             * used.
             * </p>
             * Starting from resolution the vendor and type follows, so that the RVT folder approach is the recommended default.
             * Although it's possible now to configure each stylesheet in a different folder.
             * <p>
             * The attribute <i>additional</i> allows to set further stylesheets after of any other stylesheet configured before.
             * This parameter replaces the {@link module:Config.CUSTOM_STYLE_RESOURCES_SOFTKEY} and {@link module:Config.CUSTOM_STYLE_RESOURCES_TOUCH}.
             * </p>
             * @example
             * STYLE_RESOURCE_MAPPING: {
                touch: {
                    resolution: {
                        "1024x1280/": {
                            base: [
                                "default/default/default/transitions.css",
                                "default/default/default/layouts.css",
                                "default/default/default/animations.css",
                                "default/default/default/animations-custom.css",
                                "1280x1024/default/default/sizes-positions.css",
                                "1024x1280/default/default/sizes-positions-portrait.css",
                                "1024x1280/default/default/sizes-positions-custom.css",
                                "default/default/default/layouts-custom.css"
                            ],
                            vendor: {
                                "default/": [],
                                type: {
                                    "MercuryLight/": ["default/default/MercuryLight/layouts-custom.css"]
                                },
                            },
                            additional: []
                        }
                    }
                }
             }
             * @property {Object} STYLE_RESOURCE_MAPPING Contains the style resource mappings for each supported style type (softkey, touch) and resolution.
             * @property {Object} STYLE_RESOURCE_MAPPING.touch viewset for <i>touch</i>
             * @property {Object} STYLE_RESOURCE_MAPPING.softkey viewset for <i>softkey</i>
             * @property {Object} STYLE_RESOURCE_MAPPING.touch.resolution.1024x1280/ default portrait resolution of 1024x1280 pixel
             * @property {Array<String>} STYLE_RESOURCE_MAPPING.touch.resolution.1024x1280/.base base stylesheets in ascending order
             * @property {Object} STYLE_RESOURCE_MAPPING.touch.resolution.1024x1280/.vendor stylesheets for one or more vendors in ascending order
             * @property {Object} STYLE_RESOURCE_MAPPING.touch.resolution.1024x1280/.vendor.type stylesheets for one or more types for a vendor in ascending order
             * @property {Array<String>} STYLE_RESOURCE_MAPPING.touch.resolution.1024x1280/.additional additional stylesheets in ascending order will be added after all other
             * @property {Object} STYLE_RESOURCE_MAPPING.softkey.resolution.1024x1280/ default portrait resolution of 1024x1280 pixel (softkey) Then the same properties possible
             * as for <i>touch</i>
             */
      STYLE_RESOURCE_MAPPING: {
        touch: {
          resolution: {
            "default/": {
              base: [
                "default/default/default/transitions.css",
                "default/default/default/layouts.css",
                "default/default/default/sizes-positions.css",
                "default/default/default/sizes-positions-custom.css",
                "default/default/default/animations.css",
                "default/default/default/animations-custom.css",
                "default/default/default/layouts-custom.css",
                "default/default/default/svg.css",
              ],
              vendor: {
                "default/": [],
                type: {
                  "MercuryDark/": [
                    "default/default/default/mercury-base.css",
                    "default/default/MercuryDark/layouts-custom.css",
                    "default/default/MercuryDark/svg.css",
                  ],
                  "MercuryLight/": [
                    "default/default/default/mercury-base.css",
                    "default/default/MercuryLight/layouts-custom.css",
                    "default/default/MercuryLight/svg.css",
                  ],
                  "DNSeries/": [
                    "default/default/DNSeries/common.css",
                    "default/default/DNSeries/dnseries.css",
                    "default/default/DNSeries/sizes-positions-custom.css",
                    "default/default/DNSeries/svg.css",
                  ],
                },
              },
              additional: [],
            },
            "1280x1024/": {
              base: [
                "default/default/default/transitions.css",
                "default/default/default/layouts.css",
                "default/default/default/animations.css",
                "default/default/default/animations-custom.css",
                "1280x1024/default/default/sizes-positions.css",
                "default/default/default/layouts-custom.css",
                "default/default/default/svg.css",
              ],
              vendor: {
                "default/": [],
                type: {
                  "MercuryDark/": [
                    "default/default/default/mercury-base.css",
                    "default/default/MercuryDark/layouts-custom.css",
                    "default/default/MercuryDark/svg.css",
                  ],
                  "MercuryLight/": [
                    "default/default/default/mercury-base.css",
                    "default/default/MercuryLight/layouts-custom.css",
                    "default/default/MercuryLight/svg.css",
                  ],
                  "DNSeries/": [
                    "default/default/DNSeries/common.css",
                    "default/default/DNSeries/dnseries.css",
                    "default/default/DNSeries/sizes-positions-custom.css",
                    "default/default/DNSeries/svg.css",
                  ],
                },
              },
              additional: [],
            },
            "1024x1280/": {
              base: [
                "default/default/default/transitions.css",
                "default/default/default/layouts.css",
                "default/default/default/animations.css",
                "default/default/default/animations-custom.css",
                "1280x1024/default/default/sizes-positions.css",
                "1024x1280/default/default/sizes-positions-portrait.css",
                "1024x1280/default/default/sizes-positions-custom.css",
                "default/default/default/layouts-custom.css",
                "default/default/default/svg.css",
              ],
              vendor: {
                "default/": [],
                type: {
                  "MercuryDark/": [
                    "default/default/default/mercury-base.css",
                    "default/default/MercuryDark/layouts-custom.css",
                    "default/default/MercuryDark/svg.css",
                  ],
                  "MercuryLight/": [
                    "default/default/default/mercury-base.css",
                    "default/default/MercuryLight/layouts-custom.css",
                    "default/default/MercuryLight/svg.css",
                  ],
                  "DNSeries/": [
                    "default/default/DNSeries/common.css",
                    "default/default/DNSeries/dnseries.css",
                    "default/default/DNSeries/sizes-positions-custom.css",
                    "default/default/DNSeries/svg.css",
                  ],
                },
              },
              additional: [],
            },
            "1050x1680/": {
              base: [
                "default/default/default/transitions.css",
                "default/default/default/layouts.css",
                "default/default/default/animations.css",
                "default/default/default/animations-custom.css",
                "1050x1680/default/default/sizes-positions-custom.css",
                "1050x1680/default/default/animations-custom.css",
                "default/default/default/layouts-custom.css",
                "default/default/default/svg.css",
              ],
              vendor: {
                "default/": [],
                type: {
                  "MercuryDark/": [
                    "default/default/default/mercury-base.css",
                    "default/default/MercuryDark/layouts-custom.css",
                    "default/default/MercuryDark/svg.css",
                  ],
                  "MercuryLight/": [
                    "default/default/default/mercury-base.css",
                    "default/default/MercuryLight/layouts-custom.css",
                    "default/default/MercuryLight/svg.css",
                  ],
                },
              },
              additional: [],
            },
          },
        },
        softkey: {
          resolution: {
            "default/": {
              base: [
                "default/default/default/transitions.css",
                "default/default/default/layouts.css",
                "default/default/default/animations.css",
                "default/default/default/animations-custom.css",
                "default/default/default/sizes-positions.css",
                "default/default/default/sizes-positions-custom.css",
                "default/default/default/layouts-custom.css",
                "default/default/default/svg.css",
              ],
              vendor: {
                "default/": ["default/default/default/softkey-custom.css"],
                "NCR/": ["default/NCR/default/softkey-custom.css"],
                "DIEBOLD/": ["default/DIEBOLD/default/softkey-custom.css"],
                "WN-NCR/": ["default/WN-NCR/default/softkey-custom.css"],
                type: {
                  "MercuryDark/": [
                    "default/default/default/mercury-base.css",
                    "default/default/MercuryDark/layouts-custom.css",
                    "default/default/MercuryDark/svg.css",
                    "[ADAHideScreen/]",
                    "[ADAHighContrast/]",
                  ],
                  "MercuryLight/": [
                    "default/default/default/mercury-base.css",
                    "default/default/MercuryLight/layouts-custom.css",
                    "default/default/MercuryLight/svg.css",
                    "[ADAHideScreen/]",
                    "[ADAHighContrast/]",
                  ],
                  "DNSeries/": [
                    "default/default/DNSeries/dnseries.css",
                    "default/default/DNSeries/svg.css",
                    "[ADAHideScreen/]",
                    "[ADAHighContrast/]",
                  ],
                  "ADAHideScreen/": [
                    "default/default/ADAHideScreen/layouts-custom.css",
                  ],
                  "ADAHighContrast/": [
                    "default/default/ADAHighContrast/layouts-custom.css",
                  ],
                },
              },
              additional: [],
            },
            "1280x1024/": {
              base: [
                "default/default/default/transitions.css",
                "default/default/default/layouts.css",
                "default/default/default/animations.css",
                "default/default/default/animations-custom.css",
                "1280x1024/default/default/sizes-positions.css",
                "default/default/default/layouts-custom.css",
                "default/default/default/svg.css",
              ],
              vendor: {
                "default/": ["default/default/default/softkey-custom.css"],
                "NCR/": ["1280x1024/NCR/default/softkey-custom.css"],
                "DIEBOLD/": ["1280x1024/DIEBOLD/default/softkey-custom.css"],
                "WN-NCR/": ["1280x1024/WN-NCR/default/softkey-custom.css"],
                type: {
                  "MercuryDark/": [
                    "default/default/default/mercury-base.css",
                    "default/default/MercuryDark/layouts-custom.css",
                    "default/default/MercuryDark/svg.css",
                    "[ADAHideScreen/]",
                    "[ADAHighContrast/]",
                  ],
                  "MercuryLight/": [
                    "default/default/default/mercury-base.css",
                    "default/default/MercuryLight/layouts-custom.css",
                    "default/default/MercuryLight/svg.css",
                    "[ADAHideScreen/]",
                    "[ADAHighContrast/]",
                  ],
                  "DNSeries/": [
                    "default/default/DNSeries/dnseries.css",
                    "default/default/DNSeries/svg.css",
                    "[ADAHideScreen/]",
                    "[ADAHighContrast/]",
                  ],
                  "ADAHideScreen/": [
                    "default/default/ADAHideScreen/layouts-custom.css",
                  ],
                  "ADAHighContrast/": [
                    "default/default/ADAHighContrast/layouts-custom.css",
                  ],
                },
              },
              additional: [],
            },
            "1024x1280/": {
              base: [
                "default/default/default/transitions.css",
                "default/default/default/layouts.css",
                "default/default/default/animations.css",
                "default/default/default/animations-custom.css",
                "1280x1024/default/default/sizes-positions.css",
                "1024x1280/default/default/sizes-positions-portrait.css",
                "1024x1280/default/default/sizes-positions-custom.css",
                "default/default/default/layouts-custom.css",
                "default/default/default/svg.css",
              ],
              vendor: {
                "default/": ["default/default/default/softkey-custom.css"],
                type: {
                  "MercuryDark/": [
                    "default/default/default/mercury-base.css",
                    "default/default/MercuryDark/layouts-custom.css",
                    "default/default/MercuryDark/svg.css",
                    "[ADAHideScreen/]",
                    "[ADAHighContrast/]",
                  ],
                  "MercuryLight/": [
                    "default/default/default/mercury-base.css",
                    "default/default/MercuryLight/layouts-custom.css",
                    "default/default/MercuryLight/svg.css",
                    "[ADAHideScreen/]",
                    "[ADAHighContrast/]",
                  ],
                  "DNSeries/": [
                    "default/default/DNSeries/dnseries.css",
                    "default/default/DNSeries/svg.css",
                    "[ADAHideScreen/]",
                    "[ADAHighContrast/]",
                  ],
                  "ADAHideScreen/": [
                    "default/default/ADAHideScreen/layouts-custom.css",
                  ],
                  "ADAHighContrast/": [
                    "default/default/ADAHighContrast/layouts-custom.css",
                  ],
                },
              },
              additional: [],
            },
          },
        },
      },

      /**
       * The name of the default folder name respectively for the resolution, vendor and type.
       * RVT = (R)resolution: 1024x768, (V)vendor:, (T)type: default
       * @default default/
       * @type {string}
       */
      RVT_DEFAULT_NAME: "default/", //(R)resolution: 1024x768, (V)vendor:, (T)type: default

      /**
       * Name of the folder for the full HD resolution.
       * @default 1920x1080/
       * @type {string}
       */
      RES_1920X1080: "1920x1080/",

      /**
       * Name of the folder for the 19" resolution.
       * @default 1280x1024/
       * @type {string}
       */
      RES_1280X1024: "1280x1024/",

      /**
       * Name of the folder for the 19" portrait resolution.
       * @default 1024x1280/
       * @type {string}
       */
      RES_1024X1280: "1024x1280/",

      /**
       * Name of the folder for the portrait resolution.
       * @default 1050x1680/
       * @type {string}
       */
      RES_1050X1680: "1050x1680/",

      /**
       * Name of the style root folder.
       * @default style/
       * @type {string}
       */
      ROOT_DEFAULT: "style/",

      /**
       * The default style folder for the vendor.
       * @default  default/
       * @type {string}
       */
      STYLE_VENDOR: "default/",

      /**
       * The default style folder for the type.
       * Possible values are <i>default/</i>, <i>MercuryDark/</i>, <i>MercuryLight/</i> and <i>DNSeries/</i>
       * @default MercuryDark/
       * @type {string}
       */
      STYLE_TYPE: "MercuryDark/", //"MercuryLight/", "DNSeries/"

      /**
       * Name of the image folder.
       * @default images/
       * @type {string}
       */
      IMAGE_FOLDER_NAME: "images/",

      /**
       * The start value for the split screen mode, if it's not disabled.
       * Split screen is currently only available on a portrait orientated touch screens like the DNSeries DN200.
       * This parameter may overridden by the ViewHelper depending on the current viewset and resolution.
       * Possible values are:
       * <ul>
       *     <li>disabled - split screen is not available</li>
       *     <li>off - split screen is currently off</li>
       *     <li>down - split screen is in bottom part of screen</li>
       *     <li>up - split screen is in top part of screen</li>
       * </ul>
       * @default 'off'
       * @type {string}
       */
      SPLIT_SCREEN_MODE: "off",

      /**
       * Allows to dynamically move the split screen position.
       * Possible positions are off (full screen), down (app content is in the bottom screen) and up (app content is in the upper screen)
       * according to the {@link module:Config.SPLIT_SCREEN_MODE}.
       * The position change is supported via a gesture in the header or a dedicated button in the header as well.
       * @default true
       * @type {boolean}
       */
      ALLOW_SPLIT_SCREEN_MOVING: true,

      /**
       * Use this parameter in order to allow {@link module:Config.ENHANCED_STYLE_TYPE_CONFIG}
       * to override one or more style specific parameters.
       * @default true
       * @type {boolean}
       */
      ALLOW_STYLE_TYPE_ENHANCING: true,

      /**
       * Overwrites some config parameters depending on a certain type(s).
       * Modify this function to set one or more parameters when the default behaviour
       * should be different for one or more style types.
       * <br>
       * Set the {@link module:Config.ALLOW_STYLE_TYPE_ENHANCING} to false if overriding isn't desired.
       * Usually this function is invoked at the end of the configuration promise chain in this file.
       *
       * @default In case of 'DNSeries/' style type, the BORDER_DRAWING_ON = false, ANIMATION_IN = "fadeInRight" and ANIMATION_OUT = "fadeOutLeft"
       * @type {Function}
       */
      ENHANCED_STYLE_TYPE_CONFIG: () => {
        if (
          config_0.ALLOW_STYLE_TYPE_ENHANCING &&
          config_0.STYLE_TYPE === "DNSeries/"
        ) {
          config_0.BORDER_DRAWING_ON = false;
          config_0.ANIMATION_IN = "fadeInRight";
          config_0.ANIMATION_OUT = "fadeOutLeft";
        }
      },

      /**
       * The Tap gesture used in command binding can be configured to your needs.
       * This values will act as a default, that can be overridden via binding options within html -> command:{tap: {time: 1000, threshold: 25}}
       * If there are other recognizers active on such an element (which is not in standard implementation), it must be assured not to break them with these settings.
       * E.g.: If "Press" recognizer is used, the maximum time of "Tap" should not exceed the minimum time of "Press" (default is 251ms, because hammer.js default (max) time for Tap is 250)
       * Please see {@link http://hammerjs.github.io/recognizer-tap/} and {@link http://hammerjs.github.io/recognizer-press/} for more information.
       * @type {Object}
       */
      GESTURE_CONFIG: {
        Tap: {
          time: 500,
          threshold: 10,
        },
        Press: {
          time: 600,
          threshold: 10,
        },
      },

      /*
       * This is the default configuration for the VirtualKeyboardViewModel. It may be overridden by options given in the concrete code-behind files,
       * when adding the VK to the ViewModelContainer.
       * @enum {Object} VIRTUAL_KEYBOARD_CONFIG
       */
      /**
       * @property {Object} VIRTUAL_KEYBOARD_CONFIG The default values of the attributes are taken from the configuration itself.
       * @property {boolean} [VIRTUAL_KEYBOARD_CONFIG.validateInput=false] If set to true, standard HTML validation is checked for inputs
       * @property {boolean} [VIRTUAL_KEYBOARD_CONFIG.useAppOverlay=true] If set to true, covers up the original view with an overlay while the virtual keyboard is shown.
       * @property {boolean} [VIRTUAL_KEYBOARD_CONFIG.styleAppContentClass=""] This class will get applied to the flexHeader and flexMain elements when the virtual keyboard is visible.
       * You can use css styling for the class name to get specific styles applied to the content in that case.
       * @property {Object} [VIRTUAL_KEYBOARD_CONFIG.moveContainer] Configuring the moveContainer attributes changes the general behavior of the VK.
       * @property {number} [VIRTUAL_KEYBOARD_CONFIG.moveContainer.distance=-1] If a distance <> -1 is configured, the VK will not move in covering up contents anymore, but the content defined by 'targetSelector' will move up with the VK.
       * @property {string} [VIRTUAL_KEYBOARD_CONFIG.moveContainer.targetSelector="#flexMain, #flexHeader"]
       * @property {boolean} [VIRTUAL_KEYBOARD_CONFIG.nextFieldOnEnter=false] If set to true, tapping ENTER will move to the next input field
       * @property {boolean} [VIRTUAL_KEYBOARD_CONFIG.useStandardShowHide=true] If set to true, the standard show/hide animation will be used.
       * @property {string} [VIRTUAL_KEYBOARD_CONFIG.inputFieldFocusEffect="pulsate"] The jQueryUI effect name to be used when input fields are changed with e.g. the cursor keys in "cover-up" mode of VK.
       * @property {Object} [VIRTUAL_KEYBOARD_CONFIG.originOut={transformOrigin: '50% 100%'}] origin transformation options for jQuery.transit. Applied directly before it comes to the out transition
       * @property {Object} [VIRTUAL_KEYBOARD_CONFIG.transitionOut={perspective: '1000px', rotateX: '75deg', y: '100%'}] The out transition
       * @property {Object} [VIRTUAL_KEYBOARD_CONFIG.originIn={transformOrigin: '50% 100%'}] origin transformation options for jQuery.transit. Applied directly before it comes to the out transition
       * @property {Object} [VIRTUAL_KEYBOARD_CONFIG.transitionIn={perspective: '1000px', rotateX: '0deg', y: '0%'}] The in transition
       * @property {number} [VIRTUAL_KEYBOARD_CONFIG.transitionTime=350] Transition time in milliseconds
       * @property {number} [VIRTUAL_KEYBOARD_CONFIG.moveTime=350] Move time in milliseconds
       * @property {boolean} [VIRTUAL_KEYBOARD_CONFIG.autoLayout=true] Layouts will change accordingly to the current input fields type
       * @property {boolean} [VIRTUAL_KEYBOARD_CONFIG.autoDirection=false] Not fully supported at the moment
       * @property {string} [VIRTUAL_KEYBOARD_CONFIG.inputContainer=#applicationHost] jQuery selector for element containing the inputs.
       * @property {function} [VIRTUAL_KEYBOARD_CONFIG.enterCallback] function reference to be called when user taps ENTER
       * The function receives the current input field's value as argument.
       * If the callback returns 'true', the standard action for ENTER will not be processed.
       * @property {function} [VIRTUAL_KEYBOARD_CONFIG.keyPressCallback] function reference to be called when user taps any VK button.
       * For signature see {@link Wincor.UI.Content.VirtualKeyboardViewModel#keyPressCallback|keyPressCallback}
       * @property {Array.<string>} [VIRTUAL_KEYBOARD_CONFIG.disabledInputIds=["generalVKInput", "generalInputMenu"]] Array of strings with ids of the inputs that should be ignored.
       * @property {string} [VIRTUAL_KEYBOARD_CONFIG.defaultLanguage="en-us"] Default language given as language code in lowercase letters
       * @property {Array.<string>} [VIRTUAL_KEYBOARD_CONFIG.validNodeNames=["INPUT", "TEXTAREA"]] Valid node names for targets of the VK
       * @property {string} [VIRTUAL_KEYBOARD_CONFIG.shiftKeyId="shiftKey"] The id of the shift key HTMLElement
       * @property {string} [VIRTUAL_KEYBOARD_CONFIG.capsLockKeyId=""] The id of the caps-lock key HTMLElement
       * @property {string} [VIRTUAL_KEYBOARD_CONFIG.keyboardType="KEYBOARD"] The initial keyboard type.
       * @property {string} [VIRTUAL_KEYBOARD_CONFIG.keyboardElementId="virtualKeyboardContainer"] The HTMLElement id of the VK within the HTML component.
       * @property {function} [VIRTUAL_KEYBOARD_CONFIG.onStateChangedHandler=null] Not supported, do not set
       * @property {function} [VIRTUAL_KEYBOARD_CONFIG.onFocusInHandler=null] Function reference that will be called with focusIn event whenever focus changes.
       * The function may return 'true' to indicate it has handled the event. In this case the default processing will be skipped.
       * @property {function} [VIRTUAL_KEYBOARD_CONFIG.getSourceObservable=null] Function that will be called for input manipulation. It has to return the source observable of type string.
       * @property {function} [VIRTUAL_KEYBOARD_CONFIG.getTargetObservable=null] Function that will be called for input manipulation. It has to return the target observable of type string.
       * @property {function} [VIRTUAL_KEYBOARD_CONFIG.getDataValidObservable=null] Function that will be called for input manipulation. It has to return the data-valid observable of type boolean.
       * @property {Array.<number>} [VIRTUAL_KEYBOARD_CONFIG.forbiddenCharCodes=[]] Array containing the key codes that should not be processed when received via keyDown event.
       * @property {Object} [VIRTUAL_KEYBOARD_CONFIG.skipTypes={"checkbox": true, "radio": true, "range": true, "date": true, "time": true, "color": true, "datetime-local": true, "datetime": true}] input field types that should be skipped for processing
       * @property {boolean} [VIRTUAL_KEYBOARD_CONFIG.beep=false] Tells if VK should beep when tapped. Parameter read from registry!
       * @property {boolean} [VIRTUAL_KEYBOARD_CONFIG.beepEpp=false] Tells if VK should beep when used with EPP. Parameter read from registry!
       * @property {Object} [VIRTUAL_KEYBOARD_CONFIG.inputType2Layout] Configures the mapping from an input field's type to the logical layout name to be switched to if 'autoLayout' is configured
       * @property {Object.<string, string | Array.<string>>} [VIRTUAL_KEYBOARD_CONFIG.inputType2Layout={"number": "NUMPAD", "tel": "NUMPAD", "address": ["KEYBOARD", "KEYBOARD_ALPHA"]}] Configures the mapping from an input field's type to the logical layout name to be switched to if 'autoLayout' is configured.
       * If a string array is given as value for a specific type, the first string value defines the active layout, the second one defines the active key-mapping.
       * @property {Object.<string, string>} [VIRTUAL_KEYBOARD_CONFIG.eppKeyMap={"CONFIRM": "ENTER", "CLEAR": "BACKSPACE", "BACKSPACE": "BACKSPACE"}] Maps eppkey event id to logical VK button id.
       */
      VIRTUAL_KEYBOARD_CONFIG: {
        validateInput: false,
        useAppOverlay: true,
        styleAppContentClass: "", // a style class name for hiding the flexMain content
        moveContainer: {
          distance: -1,
          targetSelector: "#flexMain, #flexHeader",
        },
        nextFieldOnEnter: false,
        useStandardShowHide: true,
        inputFieldFocusEffect: "pulsate",
        originOut: { transformOrigin: "50% 100%" },
        transitionOut: { perspective: "1000px", rotateX: "75deg", y: "100%" },
        originIn: { transformOrigin: "50% 100%" },
        transitionIn: { perspective: "1000px", rotateX: "0deg", y: "0%" },
        transitionTime: 350,
        moveTime: 350,
        autoLayout: true,
        autoDirection: false, // rtl has strange behaviour regarding selectionStart and selectionEnd... like:
        inputContainer: "#applicationHost",
        inputTarget: void 0,
        enterCallback: void 0, // enterCallback can decide whether to process default handling by returning true/false
        keyPressCallback: void 0, // keyPressCallback can decide whether to process default handling by returning true/false
        disabledInputIds: ["generalVKInput", "generalInputMenu"],
        defaultLanguage: "en-us",
        validNodeNames: ["INPUT", "TEXTAREA"],
        shiftKeyId: "shiftKey",
        capsLockKeyId: "",
        keyboardType: "KEYBOARD",
        keyboardElementId: "virtualKeyboardContainer",
        onStateChangedHandler: null, //function that will receive the focusIn event for any input. The function can return true to avoid the default onFocusIn function of VirtualKeyboardViewModel to run.
        onFocusInHandler: null, //function that will receive the focusIn event for any input. The function can return true to avoid the default onFocusIn function of VirtualKeyboardViewModel to run.
        getSourceObservable: null, // function that will be called for input manipulation. It has to return the source observable.
        getDataValidObservable: null, // function that will be called for input manipulation. It has to return the source observable.
        getTargetObservable: null, // function that will be called for input manipulation. It has to return the target observable.
        forbiddenCharCodes: [], // leftcursor, right cursor and del
        skipTypes: {
          checkbox: true,
          radio: true,
          range: true,
          date: true,
          time: true,
          color: true,
          "datetime-local": true,
          datetime: true,
        },
        beep: false, // read from registry
        beepEpp: false, // read from registry
        inputType2Layout: {
          // maps type atrribs of input elements to VK LAYOUT/KEY_MAPPING
          number: "NUMPAD",
          tel: "NUMPAD",
          address: ["KEYBOARD", "KEYBOARD_ALPHA"],
        },
        eppKeyMap: {
          // maps eppkey event id to logical VK button id
          CONFIRM: "ENTER",
          CLEAR: "BACKSPACE",
          BACKSPACE: "BACKSPACE",
        },
      },

      /**
       * Reduce the used FDK's in generic views (selection.html, accountselection.html, ...)
       * when direct marketing (DM) is active. The max used softkeys are reduced to the next
       * lower valid value which is either 6 (when 8 is the default) or 3 (when 4, leftOnly=true is the default).
       * Views which have been already configured with less than 8 or 4 FDK's won't get affected by this parameter.
       * <p>
       * When softkey 'BOTTOM_UP' is configured (which is the default) the header may get more height space and as a
       * result the headline&instruction text will aligned deeper (done via corresponding sizes-positions.css).
       * </p>
       * <p>
       * This is done to obtain more direct marketing space, but please bear in mind that the click-rate of the
       * affected GUIAPP view may increase.
       * </p>
       * @default false
       * @type {boolean}
       */
      SOFTKEY_LIMITATION_ON_ACTIVE_DM: false,
    };

    const configService = Wincor.UI.Service.Provider.ConfigService;
    // get and set view type
    let $body = jQuery("body");
    config_0.viewType = $body.attr("data-view-type");
    content.viewType = config_0.viewType;
    // set browser notation
    for (let notation of ["Chrome", "Firefox", "Edge"]) {
      if (window.navigator.userAgent.indexOf(notation) !== -1) {
        $body.attr("data-browser-notation", notation);
        break;
      }
    }

    function prepareDesignModeConfig() {
      // expand the config object
      Object.assign(config_0, new DesignModeConfig(config_0));
      Object.assign(config_0, getToolingEDMConfig());
      // Note: We use the "currentStyleType" from local storage in design mode in order to be F5 and restart save regarding the current style type rather than the
      // ViewService.currentStyleTypeByStylesheetKey which doesn't survive a refresh or even restart of course.
      // Latter is used for application mode.
      const styleTypeFromStorage =
        window.localStorage.getItem("currentStyleType");
      if (
        window.localStorage.getItem("keepStyleTypeOn") === "true" &&
        styleTypeFromStorage !== null &&
        styleTypeFromStorage !== ""
      ) {
        config_0.STYLE_TYPE = styleTypeFromStorage;
      }
      $body.attr(
        "data-style-type",
        config_0.STYLE_TYPE.endsWith("/")
          ? config_0.STYLE_TYPE.substring(
              0,
              config_0.STYLE_TYPE.lastIndexOf("/")
            )
          : config_0.STYLE_TYPE
      );
      config_0.ready = ext.Promises.promise(async (resolve, reject) => {
        // load flow config
        let dataArray = await ext.Promises.Promise.all([
          config_0.retrieveJSONData(
            FLOW_CONFIG_FILE,
            CONFIG_PATH_DESIGN_TIME_DATA
          ),
          config_0.retrieveJSONData(
            FLOW_CONFIG_CUSTOM_FILE,
            CONFIG_PATH_DESIGN_TIME_DATA
          ),
        ]);
        try {
          delete dataArray[1]["//"]; // remove possible comment before merge
          const flowConfig = dataArray[0];
          const flowConfigCustom = dataArray[1]; // contains flow attribute sections directly ({"WITHDRAWAL_ANIMATIONS":{...}}) rather than: {FLOW: {"WITHDRAWAL_ANIMATIONS":{...}}}
          Object.keys(flowConfigCustom).forEach((key) => {
            flowConfig.FLOW[key] = flowConfig.FLOW[key]
              ? Object.assign(flowConfig.FLOW[key], flowConfigCustom[key])
              : flowConfigCustom[key];
          });
          config_0.VIEWS = {};
          Object.keys(flowConfig.FLOW).forEach((key) => {
            config_0.VIEWS[key] = flowConfig.FLOW[key].view || { name: key };
            flowConfig.FLOW[key].name = key;
          });
          // look for flow a action that will use all actions from other flow:
          Object.keys(flowConfig.FLOW).forEach((key) => {
            let flowActions = flowConfig.FLOW[key].flow;
            if (
              !Array.isArray(flowActions) &&
              typeof flowActions === "string" &&
              flowConfig.FLOW[flowActions]
            ) {
              flowConfig.FLOW[key].flow = flowConfig.FLOW[flowActions].flow;
            }
          });

          config_0.FLOW = flowConfig.FLOW;
          resolve(config_0); // resolve the config object for merging purpose to the main config
        } catch (e) {
          _logger.error(
            `Failed to load or parse '${FLOW_CONFIG_FILE}' file. Error: ${e}`
          );
          reject(e);
        }
      });
      return config_0.ready;
    }

    const viewService = Wincor.UI.Service.Provider.ViewService;
    // should be used for design mode purposes only, to not affect the application payload
    if (content.designMode || content.designModeExtended) {
      config_0.ready = prepareDesignModeConfig();
    } else {
      // application mode
      config_0.ready = configService
        .getConfiguration(
          `${configService.configuration.instanceName}\\Services\\Style\\${viewService.viewSetName}`,
          null
        )
        .then((result) => {
          _logger.LOG_ANALYSE &&
            _logger.log(
              _logger.LOG_ANALYSE,
              `Config::config result=${JSON.stringify(result)}`
            );
          config_0.ROOT_DEFAULT =
            result.Root !== void 0 ? result.Root : config_0.ROOT_DEFAULT;
          config_0.STYLE_VENDOR =
            result.Vendor !== void 0 ? result.Vendor : config_0.STYLE_VENDOR;
          config_0.STYLE_TYPE =
            result.DefaultType !== void 0
              ? result.DefaultType
              : config_0.STYLE_TYPE;
          localStorage.setItem("currentStyleType", config_0.STYLE_TYPE);
          if (config_0.STYLE_TYPE !== null) {
            config_0.STYLE_TYPE = config_0.STYLE_TYPE.endsWith("/")
              ? config_0.STYLE_TYPE.substring(
                  0,
                  config_0.STYLE_TYPE.lastIndexOf("/")
                )
              : config_0.STYLE_TYPE;
            jQuery("body", parent.document).attr(
              "data-style-type",
              config_0.STYLE_TYPE
            );
            jQuery("body").attr("data-style-type", config_0.STYLE_TYPE);
          }
          // add '/' if missing
          config_0.ROOT_DEFAULT =
            config_0.ROOT_DEFAULT.substring(
              config_0.ROOT_DEFAULT.length - 1
            ) === "/"
              ? config_0.ROOT_DEFAULT
              : `${config_0.ROOT_DEFAULT}/`;
          config_0.STYLE_VENDOR =
            config_0.STYLE_VENDOR.lastIndexOf("/") !== -1
              ? config_0.STYLE_VENDOR
              : `${config_0.STYLE_VENDOR}/`;
          // ask view service in order to get a possible switched style type
          if (!viewService.currentStyleTypeByStylesheetKey) {
            config_0.STYLE_TYPE =
              config_0.STYLE_TYPE.lastIndexOf("/") !== -1
                ? config_0.STYLE_TYPE
                : `${config_0.STYLE_TYPE}/`;
          } else {
            _logger.LOG_ANALYSE &&
              _logger.log(
                _logger.LOG_ANALYSE,
                `Config::config found a value of currentStyleTypeByStylesheetKey=${viewService.currentStyleTypeByStylesheetKey}`
              );
            config_0.STYLE_TYPE =
              viewService.currentStyleTypeByStylesheetKey.lastIndexOf("/") !==
              -1
                ? viewService.currentStyleTypeByStylesheetKey
                : `${config_0.STYLE_TYPE}/`;
          }
          //
          config_0.TRANSITION_ON =
            result.TransitionAnimationOn !== void 0
              ? result.TransitionAnimationOn
              : config_0.TRANSITION_ON;
          config_0.TRANSITION_DURATION =
            (result.TransitionAnimationDuration !== void 0
              ? result.TransitionAnimationDuration
              : 500) / 1000;
          config_0.ANIMATION_IN =
            result.TransitionAnimationIn !== void 0
              ? result.TransitionAnimationIn
              : config_0.ANIMATION_IN;
          config_0.ANIMATION_OUT =
            result.TransitionAnimationOut !== void 0
              ? result.TransitionAnimationOut
              : config_0.ANIMATION_OUT;
          config_0.COMMAND_AUTOMATION_DURATION =
            result.CommandAutomationDuration !== void 0
              ? result.CommandAutomationDuration
              : config_0.COMMAND_AUTOMATION_DURATION;
          config_0.VIEW_ANIMATIONS_ON =
            result.ViewAnimationsOn !== void 0
              ? result.ViewAnimationsOn
              : config_0.VIEW_ANIMATIONS_ON;
          config_0.FOOTER_ANIMATIONS_ON =
            result.FooterAnimationsOn !== void 0
              ? result.FooterAnimationsOn
              : config_0.FOOTER_ANIMATIONS_ON;
          // config for border drawings
          config_0.BORDER_DRAWING_ON =
            result.BorderDrawingOn !== void 0
              ? result.BorderDrawingOn
              : config_0.BORDER_DRAWING_ON;
          config_0.BUTTON_FADE_IN_TIME =
            result.ButtonFadeInTime !== void 0
              ? result.ButtonFadeInTime
              : config_0.BUTTON_FADE_IN_TIME;
          // other
          config_0.SOFTKEY_LIMITATION_ON_ACTIVE_DM =
            result.SoftkeyLimitationOnActiveDM !== void 0
              ? result.SoftkeyLimitationOnActiveDM
              : config_0.SOFTKEY_LIMITATION_ON_ACTIVE_DM;
          // get aware of DM
          return viewService
            .hasRemoteInstance(GUIDM)
            .then(() => {
              config_0.isDirectMarketingAvailable = true;
              _logger.LOG_ANALYSE &&
                _logger.log(
                  _logger.LOG_ANALYSE,
                  `Config::config config_0=${JSON.stringify(config_0)}`
                );
              return config_0;
            })
            .catch((reason) => {
              _logger.LOG_INFO &&
                _logger.log(_logger.LOG_INFO, `* Config::config-> ${reason}`);
              config_0.isDirectMarketingAvailable = false;
              _logger.LOG_ANALYSE &&
                _logger.log(
                  _logger.LOG_ANALYSE,
                  `Config::config config_0=${JSON.stringify(config_0)}`
                );
              //recover, since we just wanted to know about DM availability
              return config_0;
            });
        })
        .catch((e) => {
          _logger.error(`Error loading standard configuration. Error: ${e}`);
        });
    }
    config_0.ready = config_0.ready
      .then(() => {
        return ext.Promises.Promise.all([
          config_0.retrieveJSONData(ROUTE_CONFIG_FILE, CONFIG_PATH),
          config_0.retrieveJSONData(ROUTE_CONFIG_CUSTOM_FILE, CONFIG_PATH),
          config_0.retrieveJSONData(CONFIG_CUSTOM_FILE, CONFIG_PATH),
        ]);
      })
      .then((dataArray) => {
        // delete all comments
        dataArray.forEach((d) => delete d["//"]);
        let routes = mergeRoutes(dataArray[0].routes, dataArray[1].routes); // merge
        let routeConfig = Object.assign(dataArray[1], dataArray[0]); // route array is not merged right
        routeConfig.routes = routes;
        delete routeConfig["//"]; // remove comment
        config_0.viewsPath = routeConfig.viewsPath;
        config_0.componentsPath = routeConfig.componentsPath;
        config_0.modulesPath = routeConfig.modulesPath;
        config_0.startModule = routeConfig.startModule;
        config_0.initialRoute = routeConfig.initialRoute;
        config_0.offlineSpaRoute = routeConfig.offlineSpaRoute;
        config_0.ROUTES = updateRoutingTable(config_0, routeConfig);
        config_0 = Object.assign(config_0, dataArray[2]); // merge Config.js with Config.json
        config_0.ENHANCED_STYLE_TYPE_CONFIG();
      })
      .catch((cause) =>
        _logger.error(`Failed to process configuration data. Error: ${cause}`)
      );
    return config_0;
  };

  // exposing public members
  return config();
});
