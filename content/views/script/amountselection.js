/**
 @preserve
 Copyright (c) 2001-2021 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ amountselection.js 4.3.1-210511-21-5ea44998-1a04bc7d
 */
/**
 * The amountselection code-behind provides the life-cycle for the <i>amountselection</i> view.
 * @module amountselection
 * @since 1.0/00
 */
define(["code-behind/baseaggregate", "vm/ListViewModel"], function (base) {
  console.log("AMD:amountselection");

  const _logger = Wincor.UI.Service.Provider.LogProvider;

  return /** @alias module:amountselection */ base.extend({
    name: "amountselection",

    /**
     * Instantiates the {@link Wincor.UI.Content.ListViewModel} viewmodel.
     * @see {@link module:baseaggregate.activate}.
     * @lifecycle view
     * @return {Promise} resolved when activation is ready.
     */
    activate: function () {
      _logger.log(
        _logger.LOG_DETAIL,
        "* | VIEW_AGGREGATE amountselection:activate"
      );
      base.container.add(new Wincor.UI.Content.ListViewModel(), [
        "flexMain",
        base.config.viewType === "softkey"
          ? { visibleLimits: { max: 8 } }
          : void 0,
      ]);
      return base.activate();
    },

    /**
     * Initialize slide indicator for a slide indicator group (optional).
     * @see {@link module:baseaggregate.compositionComplete}.
     * @lifecycle view
     */
    compositionComplete: function (view, parent) {
      _logger.log(
        _logger.LOG_DETAIL,
        "* | VIEW_AGGREGATE amountselection:compositionComplete"
      );
      base.compositionComplete(view, parent);
      base.container.whenActivated().then(function () {
        if (base.container.viewHelper.viewType === "softkey") {
          base.container.viewHelper.moveSlideIndicator(0);

          const $data = document.getElementById("data");
          alert("sda");
        }
      });
    },

    /**
     * Overridden to call {@link module:ObjectManager.reCalculateObjects}.
     * @see {@link module:baseaggregate.compositionUpdated}.
     * @lifecycle view
     */
    compositionUpdated: function () {
      _logger.log(
        _logger.LOG_DETAIL,
        "* | VIEW_AGGREGATE amountselection:compositionUpdated"
      );
      if (base.config.viewType === "touch") {
        Wincor.UI.Content.ObjectManager.reCalculateObjects(); // update the touch grid and scrollbars
      }
      base.compositionUpdated();
    },
  });
});
