/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ pinentryets.js 4.3.1-201021-21-23fb68fb-1a04bc7d

*/

/**
 * The pinentryets code-behind provides the life-cycle for the <i>pinentryets</i> view (touch only).
 * @module pinentryets
 * @since 2.0/00
 */
define(['jquery', 'code-behind/baseaggregate', "extensions", 'vm-util/UICommanding', 'vm/PinEntryViewModel'], function($, base, ext, commanding) {
    console.log("AMD:pinentryets");

    const _logger = Wincor.UI.Service.Provider.LogProvider;

    const HEADER = "#flexHeader";
    const HEADER_TOP = "#flexHeaderTop";
    const HEADER_TIME = "#flexTime";
    const FOOTER = "#flexFooter";
    const ETS_CONTAINER = "#flexEtsContainerArea";
    const PIN_DIGITS_AREA = "#pinDigitsArea";
    const DISABLED_ELEMENT = "disabledElement";

    let _readyToMoveContainer;
    let _orgOffset = null;

    return /** @alias module:pinentryets */ base.extend({
        name: "pinentryets",

        /**
         * Moves the ETS container element to the desired offset position.
         * @param {Number} moveX offset to move x direction
         * @param {Number} moveY offset to move y direction
         */
        moveEtsContainer: function(moveX, moveY) {
            _readyToMoveContainer.promise.then(() => {
                _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `* VIEW_AGGREGATE pinentryets::moveEtsContainer moveX=${moveX}, moveY=${moveY}`);
                const $ets = $(ETS_CONTAINER);
                if($ets.length) {
                    _orgOffset = $ets.offset();
                    $ets.offset({top: _orgOffset.top + moveY, left: _orgOffset.left + moveX});
                    base.container.viewHelper.removeWaitSpinner();
                    base.container.getById("flexMain").eppEtsReady(true); // let present the container
                    // check header collision
                    let headerTimeRect = $(HEADER).find(HEADER_TIME)[0].getBoundingClientRect();
                    if($ets[0].getBoundingClientRect().top < (headerTimeRect.bottom + 20)) {
                        $(HEADER_TOP).css("filter", "blur(7px)");
                    }
                    setTimeout(() =>
                        base.container.viewHelper.showPopupHint(commanding.getCmdLabel("INSTRUCTION"),
                            base.container.viewHelper.POPUP_INFO_TYPE, "pinPadButtons", null), 150);
                }
            });
        },

        /**
         * Resets the ETS container element to the original offset position.
         */
        resetEtsContainer: function() {
            const $ets = $(ETS_CONTAINER);
            if($ets.length && _orgOffset) {
                $ets.css("opacity", "0"); // hide the container before move
                $ets.offset(_orgOffset);
                $(PIN_DIGITS_AREA).removeClass(DISABLED_ELEMENT);
            }
        },

        /**
         * Animates the button with the given id.
         * @param {String} id a certain id or "*" for a pin digit. In the latter case a particular digit key can't be recognized due to
         * security restrictions.
         */
        animateButtons: function(id) {
            base.container.viewHelper.removePopup();
            switch(id) {
                case "*":
                    let $ets = $("#pinPadButtons");
                    $ets.css("filter", "brightness(150%)");
                    setTimeout(() => $ets.css("filter", "none"), 75);
                    break;
                case "CLEAR":
                    base.container.viewHelper.commandAutomation("#buttonCorrect", null);
                    break;
                case "CONFIRM":
                    base.container.viewHelper.commandAutomation("#buttonConfirm", null);
                    $(PIN_DIGITS_AREA).addClass(DISABLED_ELEMENT);
                    break;
                case "CANCEL":
                    base.container.viewHelper.commandAutomation("#buttonCancel", null);
                    $(PIN_DIGITS_AREA).addClass(DISABLED_ELEMENT);
                    break;
                default:
                    // pass
            }
        },

        /**
         * Instantiates the {@link Wincor.UI.Content.PinEntryViewModel} viewmodel.
         * @see {@link module:baseaggregate.activate}.
         * @lifecycle view
         * @return {Promise} resolved when activation is ready.
         */
        activate: function() {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE pinentryets:activate");
            _readyToMoveContainer = ext.Promises.deferred();
            base.container.add(new Wincor.UI.Content.PinEntryViewModel(this), ["flexMain"]);
            return base.activate();
        },

        /**
         * Overridden in order to delete the internal variable for the view model reference, which was set in 'activate'.
         * @see {@link module:baseaggregate.deactivate}.
         * @lifecycle view
         */
        deactivate: function () {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE pinentryets:deactivate");
            _readyToMoveContainer.resolve();
            _orgOffset = null;
            $(FOOTER).css("display", "");
            $(HEADER_TOP).css("filter", "none");
            base.container.viewHelper.removePopup(); // hint
            base.deactivate();
        },

        /**
         * Overridden to show the wait spinner.
         * @see {@link module:baseaggregate.compositionComplete}.
         * @lifecycle view
         */
        compositionComplete: function(view, parent) {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE pinentryets:compositionComplete");
            _readyToMoveContainer.resolve();
            $(FOOTER).hide();
            base.compositionComplete(view, parent);
            base.container.whenActivated().then(() => {
                if(!base.content.designMode) {
                    base.container.viewHelper.showWaitSpinner();
                }
            });
        }
    });
});

