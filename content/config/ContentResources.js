/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ ContentResources.js 4.3.1-201130-21-086c3328-1a04bc7d
*/

const _config = {
  requireConfig: {
    //By default load any module IDs from GUI
    skipDataMain: true,
    baseUrl: "../../",
    priority: "ContentResources",
    paths: {
      jquery: "lib/jquery-min",
      "jquery-ui": "lib/jquery-ui-min",
      knockout: "lib/knockout",
      //-- durandal
      text: "lib/text",
      durandal: "lib/durandal/js",
      plugins: "lib/durandal/js/plugins",
      transitions: "lib/durandal/js/transitions",
      //--
      lib: "lib",
      extensions: "lib/internal/wn.UI.extensionsWrapper",
      "code-behind": "content/views/script",
      vm: "content/viewmodels",
      "vm-util": "content/viewmodels/base",
      "class-system": "lib/class.system",
      "ko-mapping": "lib/knockout.mapping",
      "ko-custom": "content/viewmodels/base/ko.CustomUtils",
      "ui-content": "content/viewmodels/base/wn.UI.Content",
      basevm: "content/viewmodels/base/BaseViewModel",
      "vm-container": "content/viewmodels/base/ViewModelContainer",
      flexuimapping: "content/viewmodels/base/ProFlex4Op",
      config: "content/config",
      "core-resources": "core/CoreBundle.amd",
    },

    shim: {
      jquery: {
        exports: "jQuery",
      },
      "jquery-ui": ["jquery"],
      knockout: {
        //These script dependencies should be loaded before loading
        //knockout.js
        deps: ["jquery"],
      },
    },
  },
};

// eslint-disable-next-line no-undef
requirejs.config(_config.requireConfig);

/**
 * The module ContentResources is the overall starting point for the UI front-end (content part).
 * <p>
 * It starts the SPA application, requires, among other, some DurandalJS specific modules.
 * Furthermore the AMD configuration for the content is done here as well as the definition for the module aliases.
 * </p>
 * @module ContentResources
 * @since 1.0/00
 */
// eslint-disable-next-line no-undef
define(["ui-content", "class-system", "jquery"], function (content) {
  "use strict";

  function startUp() {
    // ensure config is ready before we start up
    require(["config/Config"], function (config) {
      config.ready.then(() => {
        require([
          "durandal/system",
          "durandal/app",
          "durandal/viewLocator",
          "plugins/router",
          "lib/internal/wn.UI.DurandalExtensions",
          "vm-container",
          "vm-util/ViewModelHelper",
          "basevm",
        ], function (system, app, viewLocator, router, durandalExtensions) {
          content.Config = config;
          //>>excludeStart("build", true);
          system.debug(false);
          //>>excludeEnd("build");

          app.title = "ProFlex4 UI";

          app.configurePlugins({
            router: true,
          });

          durandalExtensions.initialize();

          app.start().then(() => {
            viewLocator.useConvention(config.modulesPath, config.viewsPath);
            //Replace 'viewmodels' in the moduleId with 'views' to locate the view.
            //Look for partial views in a 'views' folder in the root.
            //Show the app by setting the root view model for our application with a transition.
            app.setRoot(config.modulesPath + config.startModule);
          });
        });
      });
    });
  }

  // check for basic design mode, were we need the AMD core resources bundle created by rollup
  if (!content?.designMode) {
    startUp();
  } else {
    require(["core-resources"], function () {
      startUp();
    });
  }
});
