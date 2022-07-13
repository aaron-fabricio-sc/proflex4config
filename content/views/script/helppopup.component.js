/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ helppopup.component.js 4.3.1-201021-21-23fb68fb-1a04bc7d
 */

/**
 * The helppopup.component code-behind provides the life-cycle for the <i>helppopup.component</i> view.
 * @module components/helppopup
 * @since 2.0/00
 */
define(['code-behind/baseaggregate', 'vm/PopupMessageViewModel'], function(base) {
    console.log("AMD:helppopup.component");

    const _logger = Wincor.UI.Service.Provider.LogProvider;

    const CMD_CONFIRM = "CONFIRM_MESSAGE_POPUP";
    const CMD_CANCEL = "CANCEL_MESSAGE_POPUP";

    let _vm = null;

    /**
     * Starts a video if available.
     * Call this function after the view model has been initialized and its onInitTextAndData has been finished. This is granted
     * in hooking functions after the 'activate' view life-cycle function.
     * @param {*} vm the view model instance e.g. 'PopupMessageViewModel'
     */
    function controlMedia(vm) {
        let $video = base.$("#helpVideo");
        let $image = base.$("#helpImage");
        let $text = base.$("#MESSAGE_POPUP_LABEL");
        if(vm) {
            if($video.length && vm.video && vm.video() !== "") {
                $image.hide(); // display none
                $text.hide();  // display none
                $video.transition({ opacity: 1 }, 150, "easeInQuint", () => {
                    $video[0].load();
                    $video[0].play();
                });
            } else if($video.length) {
                $video.hide(); // no video resource available, so display none 4 the video tag
                if(vm.image && vm.image() !== "") {
                    $text.hide();
                    $image.show();
                } else {
                    $image.hide(); // display none
                    $text.show();
                }
            }
        }
    }

    return /** @alias module:components/helppopup */ base.extend({
        name: "helppopup.component",
    
        /**
         * Instantiates the {@link Wincor.UI.Content.PopupMessageViewModel} viewmodel.
         * @see {@link module:baseaggregate.activate}.
         * @lifecycle view
         * @return {Promise} resolved when activation is ready.
         */
        activate: function() {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE helppopup.component:activate");
            _vm = new Wincor.UI.Content.PopupMessageViewModel(CMD_CONFIRM, CMD_CANCEL);
            base.container.add(_vm, ["popupMainContent"]);
            return base.activate();
        },
    
        /**
         * Overridden in order to delete the internal variable for the view model reference, which was set in 'activate'.
         * @see {@link module:baseaggregate.deactivate}.
         * @lifecycle view
         */
        deactivate: function() {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE helppopup.component:deactivate");
            _vm = null;
            return base.deactivate();
        },

        /**
         * Overridden to control the media types suc as image, video or plain text.
         * @see {@link module:baseaggregate.compositionComplete}.
         * @lifecycle view
         */
        compositionComplete: function(view, parent) {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE helppopup.component:compositionComplete");
            base.container.whenActivated().then(() => {
                controlMedia(_vm);
            });
            base.compositionComplete(view, parent);
        }
    });
});
