/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ accountinformation.js 4.3.1-201021-21-23fb68fb-1a04bc7d
 */
/**
 * The accountinformation code-behind provides the life-cycle for the <i>accountinformation</i> view.
 * @module accountinformation
 * @since 1.0/00
 */
define([
  "code-behind/baseaggregate",
  "lib/jquery.throttle-debounce",
  "vm/AccountInformationViewModel",
], function (base) {
  console.log("AMD:accountinformation");

  const _logger = Wincor.UI.Service.Provider.LogProvider;
  console.log(_logger);
  return /** @alias module:accountinformation */ base.extend({
    name: "accountinformation",

    /**
     * Instantiates the {@link Wincor.UI.Content.AccountInformationViewModel} viewmodel.
     * @see {@link module:baseaggregate.activate}.
     * @lifecycle view
     * @return {Promise} resolved when activation is ready.
     */
    activate: function () {
      _logger.log(
        _logger.LOG_DETAIL,
        "* | VIEW_AGGREGATE accountinformation:activate"
      );
      base.container.add(new Wincor.UI.Content.AccountInformationViewModel(), [
        "flexMain",
        base.config.viewType === "softkey"
          ? { visibleLimits: { min: 0, max: 4, leftOnly: true } }
          : void 0,
      ]);
      return base.activate();
    },

    /**
     * Overridden.
     * @see {@link module:baseaggregate.compositionComplete}.
     * @lifecycle view
     */
    compositionComplete: function (view, parent) {
      _logger.log(
        _logger.LOG_DETAIL,
        "* | VIEW_AGGREGATE accountinformation:compositionComplete"
      );
      base.compositionComplete(view, parent);
      base.container.whenActivated().then(() => {
        // code your DOM specific stuff here
      });
    },
  });
});
