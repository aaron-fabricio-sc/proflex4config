/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ offlinespa.js 4.3.1-201021-21-23fb68fb-1a04bc7d
 */

/**
 * The offlinespa code-behind provides the life-cycle for the <i>offlinespa</i> view.
 * @module offlinespa
 * @since 1.0/10
 */
define(['code-behind/baseaggregate', 'basevm'], function(base) {
    console.log("AMD:offlinespa");

    const _logger = Wincor.UI.Service.Provider.LogProvider;

    return /** @alias module:offlinespa */ base.extend({
        name: "offlinespa",

        /**
         * Instantiates the {@link Wincor.UI.Content.BaseViewModel} viewmodel.
         * @see {@link module:baseaggregate.activate}.
         * @lifecycle view
         * @return {Promise} resolved when activation is ready.
         */
        activate: function() {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE offlinespa:activate");
            base.container.add(new Wincor.UI.Content.BaseViewModel(), "flexMain");
            return base.activate();
        },
    
        /**
         * Overridden to handle ADA.
         * @see {@link module:baseaggregate.canActivate}.
         * @lifecycle view
         */
        canActivate: function() {
            //return true when ada message text is read
            let adaSvc = Wincor.UI.Service.Provider.AdaService;
            let localizeSvc = Wincor.UI.Service.Provider.LocalizeService;
            if (!base.content.designMode && adaSvc.state === adaSvc.STATE_VALUES.SPEAK) {
                return base.Promises.promise(
                    function(resolve, reject){
                        let key = "GUI_OfflineSPA_Message_ADA";
                        localizeSvc.getText([key], function(result) {
                            let messageText = result[key];
                            if (messageText) {
                                base.container.whenActivated().then(
                                    function() {
                                        base.content.Ada.deactivatedForAda = true; // prevent standard speak
                                        adaSvc.speak(messageText, 2, 10, null);
                                    }
                                );
                            }
                            resolve(true);
                        });
                    }
                );
            }
            return true;
        },

        /**
         * Gets the view ID for offline SPA.
         * @return {string} the view id for offline SPA.
         */
        getView: function() {
            let viewId = base.system.getCurrentViewId(this);
            _logger.log(_logger.LOG_DETAIL, `* | VIEW_AGGREGATE offlinespa:getView viewId=${viewId}, moduleId=${base.system.getModuleId(this)}`);
            return viewId;
        },

        /**
         * Overridden to handle the offline SPA case.
         * @see {@link module:baseaggregate.compositionComplete}.
         * @lifecycle view
         */
        compositionComplete: function(view, parent) {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE depositresult:compositionComplete");

            base.compositionComplete(view, parent);
            let viewSvc = Wincor.UI.Service.Provider.ViewService;
            if (!base.content.designMode) {
                base.container.whenActivated().delay(parseInt(viewSvc.messageTimeout * 2)).then(() => {
                    Wincor.UI.Service.Provider.ViewService.offlineHandling("_SPA");
                });
            }
        }

    });
});

