/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ AmountEntryViewModel.js 4.3.1-210127-21-34ae33df-1a04bc7d

*/
define([
  "knockout",
  "jquery",
  "vm-container",
  "ui-content",
  "basevm",
], function (ko, jQuery, container, content) {
  "use strict";

  const _logger = Wincor.UI.Service.Provider.LogProvider;
  const _dataService = Wincor.UI.Service.Provider.DataService;
  const _viewService = Wincor.UI.Service.Provider.ViewService;
  const _validateService = Wincor.UI.Service.Provider.ValidateService;

  /**
   * The formatted number property.
   * @type {string}
   * @const
   * @private
   */
  const PROP_FORMATTED_VALUE = "PROP_FORMATTED_VALUE";

  /**
   * The unformatted number property.
   * @type {string}
   * @const
   * @private
   */
  const PROP_UNFORMATTED_VALUE = "PROP_UNFORMATTED_VALUE";

  /**
   * The default object, which contains the default values for {@link Wincor.UI.Content.AmountEntryViewModel#config}.
   * @type {string}
   * @const
   * @private
   */
  const _configDefault = {
    preValue: "",
    placeHolder: "",
    decimal: false,
    minAmount: 0,
    maxAmount: 0,
    multiplier: 1,
    formatOption: "#M",
    clearByCorrect: true,
  };

  /**
   * The default object, which contains the default values for {@link Wincor.UI.Content.AmountEntryViewModel#configHelper}.
   * @type {string}
   * @const
   * @private
   */
  const _configHelperDefault = {
    checkMax: false, //flag is true if configured min/max values are okay (for convenience reasons)
    maxLen: 0, //calculated number of digits of maxAmount is given
    cmdMixtureState: 3, // remember state of the "MIXTURE" command (usually billsplitting)
  };

  /**
   * This id is used for the timeout of the check routines.
   * @type {int}
   * @private
   */
  let _timerId = -1;

  /**
   * A view model provides the data for the view.
   * In particular this view model provides several check-functions to validate the input and to show messages/hints to the customer in case he entered something wrong.
   * The {@link Wincor.UI.Content.AmountEntryViewModel#amount} variable holds the raw, uncalculated/unvalidated input.
   * This input could be rejected by the check functions, before it is permitted to be displayed in the input field.
   * Therefore there is a special observable variable {@link Wincor.UI.Content.AmountEntryViewModel#amountField}, which gets filled with the {@link Wincor.UI.Content.AmountEntryViewModel#amount}
   * variable in case the first check was successful.
   *
   * @class
   */
  Wincor.UI.Content.AmountEntryViewModel = class AmountEntryViewModel extends (
    Wincor.UI.Content.BaseViewModel
  ) {
    /**
     * The amount in the lowest unit (e.g. cents).
     * @type {Number}
     */
    amount = 0;

    /**
     * The observable for the unformatted contents of the amount.
     * This oberservable is needed and bound inside the view, because 'amount' can not used directly, because 'amount' may be changed more frequently inside some calculations.
     * Only at the end of such calculations, 'amount' will be written into 'amountField'
     * @type {function | ko.observable}
     * @bindable
     */
    amountField = null;

    /**
     * The observable for the formatted contents of the amount.
     * @type {function | ko.observable}
     * @bindable
     */
    amountFieldFormatted = null;

    /**
     * The format option used by the view. Must be an observable, because the format option can be different between two view keys.
     * @type {function | ko.observable}
     * @bindable
     */
    formatOption = null;

    /**
     * The text of the hint, which can drop in dynamically.
     * @type {function | ko.observable}
     * @bindable
     */
    messageText = null;

    /**
     * The level (severity) of the hint, which can drop in dynamically.
     * @type {function | ko.observable}
     * @bindable
     */
    messageLevel = null;

    /**
         * Object, which contains the texts and levels for different kinds of hints.
         * @type {Object}
         * @example
         * this.messageHints = {
                all: {messageText: "", messageLevel: ""},
                minMax: {messageText: "", messageLevel: ""},
                multiplier: {messageText: "", messageLevel: ""}
            };
         */
    messageHints = null;

    /**
     * This observable stores the flag whether the number keys have to be deactivated, <BR>
     * because the maximum input length has been reached.
     *  false: do not suspend the number keys <BR>
     *  true: suspend the number keys <BR>
     * @type {function | ko.observable}
     * @bindable
     */
    numberKeysSuspended = null;

    /**
     * See {@link Wincor.UI.Content.BaseViewModel#constructor}.
     * @lifecycle viewmodel
     */
    constructor() {
      super();
      _logger.LOG_INOUT &&
        _logger.log(_logger.LOG_INOUT, "> AmountEntryViewModel");
      this.messageHints = {
        all: { messageText: "", messageLevel: "" },
        minMax: { messageText: "", messageLevel: "" },
        multiplier: { messageText: "", messageLevel: "" },
      };
      this.currencySymbol = ko.observable("€");
      // format option is used by the format custom binding to initialize the pattern.
      this.amountField = ko.observable(0); //init with null, for the same reason we initialize amount with null
      this.amountFieldFormatted = ko.observable("");
      this.formatOption = ko.observable("NONE");
      this.placeHolder = ko.observable("");
      this.placeHolderFormatted = ko.observable("");
      this.isAmountInsideLimits = ko.observable(true);
      this.isAmountDispensable = ko.observable(true); // true, if value is e.g. a mutliple of 5, if 5 is the lowest denomination
      this.messageText = ko.observable("");
      this.messageLevel = ko.observable("");
      this.amount = 0;
      this.numberKeysSuspended = ko.observable(false);
      _logger.LOG_INOUT &&
        _logger.log(_logger.LOG_INOUT, "< AmountEntryViewModel");
    }

    /**
     * See {@link Wincor.UI.Content.BaseViewModel#onDeactivated}.
     * @lifecycle viewmodel
     */
    onDeactivated() {
      _logger.LOG_INOUT &&
        _logger.log(
          _logger.LOG_INOUT,
          "> AmountEntryViewModel::onDeactivated()"
        );
      super.onDeactivated();
      clearTimeout(_timerId);
      _timerId = -1;
      this.currencySymbol("€");
      if (this.subscription) {
        this.subscription.dispose();
      }
      this.amountField(0); //init with null, for the same reason we initialize amount with null
      this.amountFieldFormatted("");
      this.formatOption("NONE");
      this.placeHolder("");
      this.placeHolderFormatted("");
      this.isAmountInsideLimits(true);
      this.isAmountDispensable(true);
      this.messageText("");
      this.messageLevel("");
      this.messageHints = {
        all: { messageText: "", messageLevel: "" },
        minMax: { messageText: "", messageLevel: "" },
        multiplier: { messageText: "", messageLevel: "" },
      };
      this.amount = 0;
      this.numberKeysSuspended(false);
      _logger.LOG_INOUT &&
        _logger.log(_logger.LOG_INOUT, "< AmountEntryViewModel::onDeactivated");
    }

    /**
     * Depending on the configured parameters in the {@link Wincor.UI.Content.AmountEntryViewModel#config} object, this function sets the configHelper object, which is used later for the maximum checks.
     */
    setMaxHelperValues() {
      this.configHelper.checkMax =
        this.config.maxAmount > 0 &&
        this.config.maxAmount >= this.config.minAmount;

      if (this.configHelper.checkMax) {
        this.configHelper.maxLen = this.config.maxAmount.toString().length;
      }
    }

    /**
     * This method reads the configuration and initializes the DOM-associated objects.
     * Overrides {@link Wincor.UI.Content.BaseViewModel#observe}
     * @param {String} observableAreaId The area id to observe via knockout
     * @lifecycle viewmodel
     */
    observe(observableAreaId) {
      _logger.LOG_INOUT &&
        _logger.log(
          _logger.LOG_INOUT,
          `> AmountEntryViewModel::observe(${observableAreaId})`
        );

      /**
       * Stores the actual viewkey configuration.
       * @type {object}
       */
      this.config = Object.assign({}, _configDefault);
      /**
       * For convenience, this object stores some parameters for later checks, which are easier to use than the parameters in the {@link Wincor.UI.Content.AmountEntryViewModel#config} object.
       * @type {object}
       */
      this.configHelper = Object.assign({}, _configHelperDefault);

      if (this.viewConfig.config) {
        _logger.LOG_DETAIL &&
          _logger.log(
            _logger.LOG_DETAIL,
            `. AmountEntryViewModel::observe viewConf=${JSON.stringify(
              this.viewConfig
            )}`
          );
        this.config = Object.assign(this.config, this.viewConfig.config);
        this.formatOption(this.config.formatOption);
        _logger.LOG_DETAIL &&
          _logger.log(
            _logger.LOG_DETAIL,
            `. AmountEntryViewModel::observe config after copying=${JSON.stringify(
              this.config
            )}`
          );
        // remember cmd MIXTURE state
        if (
          this.viewConfig.commandconfig &&
          parseInt(this.viewConfig.commandconfig["MIXTURE"]) ===
            this.CMDSTATE.ENABLED
        ) {
          this.configHelper.cmdMixtureState = this.CMDSTATE.ENABLED;
        }
      }

      this.setMaxHelperValues();

      if (this.config.multiplier <= 0) {
        _logger.error(
          ".AmountEntryViewModel::observe: config parameter 'multiplier' is not greater than 0"
        );
        this.config.multiplier = 1; //let all values be valid if config.multiplier was not configured correctly.
      }

      _logger.LOG_DATA &&
        _logger.log(
          _logger.LOG_DATA,
          ".AmountEntryViewModel::observe _checkMax=" +
            this.configHelper.checkMax
        );
      super.observe(observableAreaId);
      this.subscription = this.subscribeToObservable(
        this.amountField,
        this.onAmountChanged.bind(this)
      );
      this.amountField.extend({ notify: "always" });

      // delegate us to the onButtonPressed
      this.cmdRepos.whenAvailable([this.STANDARD_BUTTONS.CONFIRM]).then(() =>
        this.cmdRepos.addDelegate({
          id: this.STANDARD_BUTTONS.CONFIRM,
          delegate: this.onButtonPressed,
          context: this,
        })
      );
      this.cmdRepos.whenAvailable([this.STANDARD_BUTTONS.CORRECT]).then(() =>
        this.cmdRepos.addDelegate({
          id: this.STANDARD_BUTTONS.CORRECT,
          delegate: this.onButtonPressed,
          context: this,
        })
      );
      _logger.LOG_INOUT &&
        _logger.log(_logger.LOG_INOUT, "< AmountEntryViewModel::observe");
    }

    /**
     * Calculates if the given amount is a multiple of the the configured 'multiplier'.
     *
     * @param {Number} amount       The amount to be checked.
     * @return {Boolean}
     */
    isMultipleOf(amount) {
      const multiplier = this.config.multiplier;
      const amountStr = amount.toString();
      let isMultiple =
        !this.designMode && _validateService.isStepLen(amountStr, multiplier);

      if (this.designMode) {
        isMultiple = amount % multiplier === 0;
      }

      _logger.LOG_DATA &&
        _logger.log(
          _logger.LOG_DATA,
          `* AmountEntryViewModel::isMultipleOf (amount=${amount}, multiplier=${multiplier}, isMultiple=${isMultiple})`
        );
      return isMultiple;
    }

    /**
     * Calculates if the given amount is within the configured 'minAmount' and 'maxAmount'.
     *
     * @param {Number} amount       The amount to be checked.
     * @return {Boolean}
     */
    isWithinMinMax(amount) {
      const min = this.config.minAmount,
        max = this.config.maxAmount;
      const amountStr = amount.toString();
      let isWithin =
        !this.designMode && _validateService.isInRange(amountStr, min, max, 1);

      if (this.designMode) {
        isWithin = amount >= min && amount <= max;
      }

      _logger.LOG_DATA &&
        _logger.log(
          _logger.LOG_DATA,
          `* AmountEntryViewModel::isWithinMinMax (amount=${amount}, min=${min}, max=${max}, isWithin=${isWithin})`
        );
      return isWithin;
    }

    /**
     * Calculates if the given amount is valid at all, regarding the configured parameters.
     *
     * @param {Number} amount       The amount to be checked.
     * @return {Boolean}
     */
    isAmountValid(amount) {
      const isValid =
        this.isMultipleOf(amount) && this.isWithinMinMax(amount) && amount > 0;
      _logger.LOG_DATA &&
        _logger.log(
          _logger.LOG_DATA,
          `* AmountEntryViewModel::isAmountValid (amount=${amount}, isValid=${isValid})`
        );
      return isValid;
    }

    /**
     * Shows or clears a message hint by evaluating {@link Wincor.UI.Content.AmountEntryViewModel#amount}.
     */
    checkMessages() {
      _logger.LOG_INOUT &&
        _logger.log(
          _logger.LOG_INOUT,
          "> AmountEntryViewModel::checkMessages()"
        );

      if (this.isAmountValid(this.amount) || this.amount === 0) {
        this.showMessageHint(null); // clear possible hint
      } else {
        //Check for Warning/Error (no matter what, we can't leave the page)
        let hint = null;
        if (
          !this.isMultipleOf(this.amount) &&
          !this.isWithinMinMax(this.amount)
        ) {
          hint = this.messageHints.all;
        } else if (!this.isMultipleOf(this.amount)) {
          hint = this.messageHints.multiplier;
        } else if (!this.isWithinMinMax(this.amount)) {
          hint = this.messageHints.minMax;
        }
        //ADA: we do not call notifyViewUpdated() to read out the 'escalation' messages. This would interfere with reading out the
        //entry of the input field. However, the hint to respect the multiplier and min-max values is inside GUI_WithdrawalAlternativeAmountInput_Instruction_ADA!
        //This one is always read out if the ADA user presses Help
        this.showMessageHint(hint);
      }
      _logger.LOG_INOUT &&
        _logger.log(_logger.LOG_INOUT, "< AmountEntryViewModel::checkMessages");
    }

    /**
     * Shows/triggers the given message hint.
     * @param {object} hint     The message hint to show
     */
    showMessageHint(hint) {
      if (hint) {
        _logger.LOG_INFO &&
          _logger.log(
            _logger.LOG_INFO,
            `* AmountEntryViewModel::showMessageHint text=${ko.unwrap(
              hint.messageText
            )} => level=${ko.unwrap(hint.messageLevel)}`
          );
        this.messageText(ko.unwrap(hint.messageText));
        this.messageLevel(ko.unwrap(hint.messageLevel)); // level must be set after message because the message triggers the visibility of the hint box first
      } else {
        this.messageText("");
        this.messageLevel("");
      }
    }

    /**
     * Sets the button states, depending on the validity of the given amount.
     * @param {Number} amount The current amount
     */
    onAmountChangedSetButtons(amount) {
      _logger.LOG_INFO &&
        _logger.log(
          _logger.LOG_INFO,
          `* AmountEntryViewModel::onAmountChangedSetButtons(${amount})`
        );
      let isAmountValid = this.isAmountValid(amount);
      this.cmdRepos
        .whenAvailable([this.STANDARD_BUTTONS.CONFIRM])
        .then(() =>
          this.cmdRepos.setActive(
            [this.STANDARD_BUTTONS.CONFIRM],
            isAmountValid
          )
        );
      this.cmdRepos
        .whenAvailable([this.STANDARD_BUTTONS.CORRECT])
        .then(() =>
          this.cmdRepos.setActive(
            [this.STANDARD_BUTTONS.CORRECT],
            amount > 0 || amount < 0
          )
        );

      let amountLen = amount.toString().length;
      let smallestNewAmount = amount.toString() + "0";
      if (
        this.configHelper.checkMax &&
        (amountLen === this.configHelper.maxLen - 1 ||
          amountLen >= this.configHelper.maxLen) &&
        !this.isAmountValid(Number(smallestNewAmount))
      ) {
        // if ( this.configHelper.checkMax && amountLen >= this.configHelper.maxLen ) {
        if (!this.numberKeysSuspended()) {
          this.cmdRepos.setActive(
            ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
            false
          );
          this.numberKeysSuspended(true);
          _logger.LOG_ANALYSE &&
            _logger.log(
              _logger.LOG_ANALYSE,
              "AmountEntryViewModel::onAmountChangedSetButtons() number keys deactivated"
            );
        }
      } else {
        if (this.numberKeysSuspended()) {
          this.cmdRepos.setActive([
            "0",
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
          ]);
          this.numberKeysSuspended(false);
          _logger.LOG_ANALYSE &&
            _logger.log(
              _logger.LOG_ANALYSE,
              "AmountEntryViewModel::onAmountChangedSetButtons() number keys activated"
            );
        }
      }

      // separate "MIXTURE" because in project case "MIXTURE" maybe absent
      // "MIXTURE" maybe used for initiate mixture selection e.g.
      this.cmdRepos.whenAvailable(["MIXTURE"]).then(() => {
        // cmd "MIXTURE" handling
        if (
          this.configHelper.cmdMixtureState === this.CMDSTATE.ENABLED ||
          this.designMode
        ) {
          this.cmdRepos.setActive(["MIXTURE"], isAmountValid);
        }
      });
    }

    /**
     * Triggers the timer, after whose timeout potential message hints will be shown or cleared.
     */
    onAmountChangedCheckInput() {
      _logger.LOG_INFO &&
        _logger.log(
          _logger.LOG_INFO,
          "* AmountEntryViewModel::onAmountChangedCheckInput()"
        );
      clearTimeout(_timerId); // clear possible old timer
      _timerId = container.viewModelHelper
        .startTimer(1000)
        .onTimeout(this.checkMessages.bind(this));
    }

    /**
     * Shall be called every time the amount changes. Will call the subfunctions
     * {@link Wincor.UI.Content.AmountEntryViewModel#onAmountChangedSetButtons}
     * and
     * {@link Wincor.UI.Content.AmountEntryViewModel#onAmountChangedCheckInput}
     * @param {Number} amount     The changed amount.
     */
    onAmountChanged(amount) {
      _logger.LOG_INFO &&
        _logger.log(
          _logger.LOG_INFO,
          `* AmountEntryViewModel::onAmountChanged(${amount})`
        );
      this.onAmountChangedSetButtons(amount);
      this.onAmountChangedCheckInput();
    }

    /**
     * Initializes the amount field and place holder.
     * In case of a place holder is set and config.preValue is empty the place holder is shown.
     * In case of both config.placeHolder and config.preValue are set the preValue has a higher priority. In such
     * a case a correct command is processed the placeholder is shown, even a preValue is available.
     * Without a place holder value the amount field is set to 0 in case of correct.
     * In the case of only a preValue is given the preValue is shown at the beginning.
     */
    preValueIntoAmountField() {
      _logger.LOG_INFO &&
        _logger.log(
          _logger.LOG_INFO,
          `* AmountEntryViewModel::preValueIntoAmountField preValue=${this.config.preValue}, placeHolder=${this.config.placeHolder}`
        );
      this.amount = parseInt(
        !this.config.preValue ? "0" : this.config.preValue
      );
      // init place holder anyway
      this.placeHolder(
        this.config.placeHolder !== "" ? this.config.placeHolder : ""
      );
      // In case of preValue is given we ignore a possible placeHolder value initially
      if (this.config.preValue !== "" || this.config.placeHolder === "") {
        this.amountField(this.amount);
      } else if (this.config.placeHolder !== "") {
        // if we have a place holder the amount field must be empty, so the user can directly ty a new value
        this.amountField("");
        this.amount = 0;
      }
    }

    /**
     * See {@link Wincor.UI.Content.BaseViewModel#onInitTextAndData}.
     *
     * @param {object} args Contains the attributes 'textKeys' {array.<string|promise>} and 'dataKeys' {array.<string|promise>}, which should be filled up by the viewmodel.
     * @param {boolean} skipJSON Deprecated, not used anymore.
     * @lifecycle viewmodel
     */
    onInitTextAndData(args, skipJSON) {
      _logger.LOG_INOUT &&
        _logger.log(
          _logger.LOG_INOUT,
          "> AmountEntryViewModel::onInitTextAndData()"
        );
      this.currencySymbol(this.bankingContext.currencyData.symbol);
      this.exponent = this.bankingContext.currencyData.exponent;
      if (!this.designMode) {
        // set hint "all" observables
        this.messageHints.all.messageText = this.getLabel(
          this.buildGuiKey("InputHint", "All", "Message"),
          ""
        );
        this.messageHints.all.messageLevel = this.getLabel(
          this.buildGuiKey("InputHint", "All", "Message", "Level"),
          ""
        );
        // set hint "min/max" observables
        this.messageHints.minMax.messageText = this.getLabel(
          this.buildGuiKey("InputHint", "MinMax", "Message"),
          ""
        );
        this.messageHints.minMax.messageLevel = this.getLabel(
          this.buildGuiKey("InputHint", "MinMax", "Message", "Level"),
          ""
        );
        // set hint "multiplier" observables
        this.messageHints.multiplier.messageText = this.getLabel(
          this.buildGuiKey("InputHint", "Multiplier", "Message"),
          ""
        );
        this.messageHints.multiplier.messageLevel = this.getLabel(
          this.buildGuiKey("InputHint", "Multiplier", "Message", "Level"),
          ""
        );
      } else if (this.designMode && !skipJSON) {
        // design mode
        args.dataKeys.push(
          this.designTimeRunner
            .retrieveJSONData("AmountEntryData")
            .then((data) => {
              if (!this.config.fromChequeVM) {
                // certain marker to be able to distinguish between cheque change amount and more option popup
                this.config = Object.assign({}, data);
              }
              this.formatOption(data.formatOption);
              this.messageHints.all.messageText = data.messageAll;
              this.messageHints.minMax.messageText = data.messageMinMax;
              this.messageHints.multiplier.messageText = data.messageMultiplier;
              this.messageHints.all.messageLevel = data.messageLevel;
              this.messageHints.minMax.messageLevel = data.messageLevel;
              this.messageHints.multiplier.messageLevel = data.messageLevel;
              this.preValueIntoAmountField();
              this.setMaxHelperValues();
            })
        );
      }
      _logger.LOG_INOUT &&
        _logger.log(
          _logger.LOG_INOUT,
          "< AmountEntryViewModel::onInitTextAndData"
        );
      return super.onInitTextAndData(args);
    }

    /**
     * See {@link Wincor.UI.Content.BaseViewModel#onInitTextAndData}.
     * The AmountEntryViewModel does not use the results -- it just uses this function to trigger a call to {@link Wincor.UI.Content.AmountEntryViewModel#preValueIntoAmountField}.
     *
     * @param {Object} result   Contains the key:value pairs of text previously retrieved by this view-model subclass.
     * @lifecycle viewmodel
     */
    onTextReady(result) {
      _logger.LOG_INOUT &&
        _logger.log(
          _logger.LOG_INOUT,
          `> AmountEntryViewModel::onTextReady(${JSON.stringify(result)})`
        );
      // call this function initiate correct view states for confirm/correct, since onDataValuesReady won't be called because there not data to fetch.
      this.preValueIntoAmountField();
      _logger.LOG_INOUT &&
        _logger.log(_logger.LOG_INOUT, "< AmountEntryViewModel::onTextReady");
    }

    /**
     * Sets the business data when ending the view.
     * @param {string} id   The action id
     */
    setBusinessData(id) {
      // input within the limits
      if (!content.designMode) {
        const amountAsString = this.amount.toString();
        // In fact this final format call may be redundant, but there could be a gap between the last number input and the asynchronous
        // format service call done by the format custom binding, which needs a bit time until its coming back and sets
        // the -amountFieldFormatted observable member. To ensure always setting the right property value we trigger an own
        // format service call, instead of using -amountFieldFormatted().
        this.serviceProvider.FormatService.format(
          amountAsString,
          this.config.formatOption,
          (value) => {
            _logger.LOG_ANALYSE &&
              _logger.log(
                _logger.LOG_ANALYSE,
                "* AmountEntryViewModel::formattedValue=" + value.result
              );
            _dataService.setValues(
              [PROP_UNFORMATTED_VALUE, PROP_FORMATTED_VALUE],
              [amountAsString, jQuery.trim(value.result)],
              () => _viewService.endView(_viewService.UIRESULT_OK, id)
            );
          }
        );
      }
    }

    /**
     * See {@link Wincor.UI.Content.BaseViewModel#onButtonPressed}.
     *
     * @param {String} id The id of the pressed button.
     * @eventhandler
     */
    onButtonPressed(id) {
      _logger.LOG_INOUT &&
        _logger.log(
          _logger.LOG_INOUT,
          `> AmountEntryViewModel::onButtonPressed(${id})`
        );
      if (!id) {
        return true;
      }

      if (id.length === 1 && !isNaN(id)) {
        //we make length check only if _checkMax is true. No length check means that we ignore the length and no not check it
        if (
          !this.configHelper.checkMax ||
          this.amount.toString().length < this.configHelper.maxLen ||
          this.amount === 0
        ) {
          this.amount *= 10; //the amount goes to the left.

          let amountToAdd = parseInt(id, 10);
          if (!this.config.decimal) {
            //no decimal? Then it's not 3cents but 300cents to add.
            amountToAdd = this.vmHelper.convertByExponent(
              amountToAdd,
              -this.exponent
            );
          }

          this.amount += amountToAdd;
          this.amountField(this.amount);
          _logger.LOG_DATA &&
            _logger.log(
              _logger.LOG_DATA,
              `.AmountEntryViewModel::onButtonPressed amountField=${this.amountField()}, amountFieldFormatted=${this.amountFieldFormatted()}`
            );
        }
      } else if (id === "-") {
        this.amount -= this.config.multiplier;
        if (this.amount < 0) {
          this.amount = 0;
        }
        this.amountField(this.amount);
      } else if (id === "+") {
        this.amount += this.config.multiplier;
        if (this.configHelper.checkMax && this.amount > this.config.maxAmount) {
          this.amount = this.config.maxAmount;
        }
        this.amountField(this.amount);
      } else if (id === this.STANDARD_BUTTONS.CONFIRM || id === "MIXTURE") {
        this.setBusinessData(id);
        if (this.designMode) {
          super.onButtonPressed(id);
        }
      } else if (id === this.STANDARD_BUTTONS.CORRECT) {
        if (this.config.clearByCorrect) {
          this.amount = 0;
          if (this.config.placeHolder === "") {
            this.amountField(this.amount);
          } else {
            this.amountField(""); // let place holder be show its value
          }
        } else {
          if (this.config.decimal) {
            //clear the last decimal, example for 123.45
            //divide 12345 by 10 = 1234.5
            //floor(1234.5) = 1234 ---> 123.40
            //(exponent is not relevant here)
            this.amount /= 10;
            this.amount = Math.floor(this.amount);
          } else {
            //clear the last non-decimal, example for 123.00
            //divide 12300 by 1000 = 12.300
            //floor(12.300) = 12
            //multiply 12 and 100 = 1200 ----> 12.00
            // (exponent is relevant here for division and multiply:
            //   divide by 1000 ---> divide by (10*10^2)
            //   multiply with 100 ---> multiply with (10^2)
            this.amount /= this.vmHelper.convertByExponent(10, -this.exponent);
            this.amount = Math.floor(this.amount);
            this.amount *= this.vmHelper.convertByExponent(1, -this.exponent);
          }

          this.amountField(this.amount);
        }
      } else if (id !== "AMOUNT_INPUT") {
        // ignore AMOUNT_INPUT command !
        super.onButtonPressed(id);
      }
      _logger.LOG_INOUT &&
        _logger.log(
          _logger.LOG_INOUT,
          "< AmountEntryViewModel::onButtonPressed"
        );
      return true;
    }
  };
});
