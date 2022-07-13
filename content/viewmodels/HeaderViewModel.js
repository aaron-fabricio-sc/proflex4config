/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ HeaderViewModel.js 4.3.1-210127-21-34ae33df-1a04bc7d
 */
define(["knockout", "extensions", "vm-container", "basevm"], function (
  ko,
  ext,
  container
) {
  "use strict";
  console.log("AMD:HeaderViewModel");

  const _logger = Wincor.UI.Service.Provider.LogProvider;
  const _localizeService = Wincor.UI.Service.Provider.LocalizeService;
  const _viewService = Wincor.UI.Service.Provider.ViewService;

  const CMD_HEADLINE = "HEADLINE";
  const CMD_INSTRUCTION = "INSTRUCTION";
  const CMD_LANGUAGE = "LANGUAGE";
  const CMD_LANGUAGE_POPUP = "LANGUAGE_POPUP";
  const CMD_HELP = "HELP";
  const CMD_MAGNIFY_GLASS = "MAGNIFY_GLASS";

  const LABEL_SUFFIX_HEADLINE = "Headline";
  const LABEL_SUFFIX_INSTRUCTION = "Instruction";
  const LABEL_SUFFIX_MESSAGE = "Message";
  const LABEL_SUFFIX_VIDEO = "Video";
  const LABEL_SUFFIX_IMAGE = "Image";
  const LABEL_SUFFIX_HELP_POPUP = "HELP_POPUP";

  const GUIDM = "GUIDM";

  const _days = {
    "de-DE": [
      "Sonntag",
      "Montag",
      "Dienstag",
      "Mittwoch",
      "Donnerstag",
      "Freitag",
      "Samstag",
    ],
    "en-US": [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
  };

  const _months = {
    "de-DE": [
      "Januar",
      "Februar",
      "März",
      "April",
      "Mai",
      "Juni",
      "Juli",
      "August",
      "September",
      "Oktober",
      "November",
      "Dezember",
    ],
    "en-US": [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
  };

  const _langSelectionPopupOptions = {
    type: "LANGUAGE_POPUP",
    sourceList: [],
    result: {},
    onContinue: function () {
      // switch the language after popup end
      _logger.LOG_ANALYSE &&
        _logger.log(
          _logger.LOG_ANALYSE,
          `* HeaderViewModel.onContinue() selected id=${this.result.id}`
        );
      if (
        this.result.id &&
        this.result.id !== "CANCEL" &&
        !Wincor.UI.Content.designMode
      ) {
        // must map result.id to ISO
        container.sendViewModelEvent("LANGUAGE_CHANGE_REQUESTED", {});
        _localizeService.setLanguage(
          _localizeService.getLanguageMapping().nameToIso[this.result.id]
        );
      }
    },
  };

  let _intervalId = -1;
  let _interval = 1000;

  let _headerModule = null;
  let _messageDisappearPromise = ext.Promises.Promise.resolve();

  let _isLanguageTextRetrievingDone = false; // flag to avoid redundant processing of language stuff during -onInitTextAndData()
  let _escalationMessageAvailable = false; // flag signals when an escalation message is available, which is the case when MessageViewModel#onEscalationEvent is invoked

  function analyzeDayTime(self, dateNow, timeVal) {
    const secs = dateNow.getSeconds();
    // time synchronizer to save system payload after a minute
    if (_interval === 1000) {
      if (secs >= 20 && secs <= 40) {
        _interval = 60000;
        window.clearInterval(_intervalId);
        _intervalId = window.setInterval(self.updateTime.bind(self), _interval);
      }
    }
  }

  /**
   * Triggers the selection popup in order to present a language selection.
   * @param {*} self the view model reference
   */
  function callSelectionPopup(self) {
    self.showPopupMessage(
      "selectionpopup.component.html",
      _langSelectionPopupOptions,
      (success) => {
        if (success) {
          _logger.LOG_DATA &&
            _logger.log(
              _logger.LOG_DATA,
              "* HeaderViewModel  - successfully loaded popup, result = "
            );
        } else {
          _logger.error("* HeaderViewModel - error loading popup");
        }
      }
    );
  }

  /**
   * Handles the language selection popup.
   * It prepares the data and triggers the popup.
   * @param {*} self the view model reference
   */
  function handleLanguagePopup(self) {
    if (!self.designMode && !_isLanguageTextRetrievingDone) {
      let textKeys = [];
      let langNames = Object.keys(
        _localizeService.getLanguageMapping().nameToIso
      );
      // build text keys
      for (let i = 0; i < langNames.length; i++) {
        textKeys.push(self.buildGuiKey("Button", langNames[i]));
        textKeys.push(self.buildGuiKey("Button", langNames[i], "Icon1"));
      }
      _localizeService.getText(textKeys, (textResult) => {
        // please note that this callback function is called on language updates too!
        // We don't need to react and building everything new.
        if (!_isLanguageTextRetrievingDone) {
          _logger.LOG_DATA &&
            _logger.log(
              _logger.LOG_DATA,
              `. HeaderViewModel::onInitTextAndData textResult=${JSON.stringify(
                textResult
              )}`
            );
          // building items for language selection popup config:
          /*
                     -textResult should contain following order if installed ISOs e.g.: de-DE, en-US:
                     GUI_*_Button_de-DE: "Deutsch"
                     GUI_*_Button_de-DE_Icon1: "flag_german.svg"
                     GUI_*_Button_en-US: "English"
                     GUI_*_Button_en-US_Icon1: "flag_english.svg"
                     */
          for (let i = 0, j = 0; i < langNames.length; i++, j += 2) {
            _langSelectionPopupOptions.sourceList.push({
              captions: [ko.observable(textResult[textKeys[j]])],
              state: self.CMDSTATE.ENABLED,
              result: langNames[i],
              icon: textResult[textKeys[j + 1]],
              prominent: "",
            });
          }
          _isLanguageTextRetrievingDone = true;
          callSelectionPopup(self);
        }
      });
    } else if (!self.designMode && _isLanguageTextRetrievingDone) {
      callSelectionPopup(self);
    } else if (!_isLanguageTextRetrievingDone) {
      self.designTimeRunner.retrieveJSONData("ListViewData").then((data) => {
        for (let i = 0; i < data.examples.length; i++) {
          if (data.examples[i].viewKey === "LanguageSelection") {
            let elems = data.examples[i].elements,
              item;
            for (let k = 0; k < elems.length; k++) {
              item = elems[k];
              _langSelectionPopupOptions.sourceList.push({
                captions: [ko.observable(item.captions[0])],
                state: item.state,
                result: item.result,
                icon: item.icon,
                prominent: item.prominent,
              });
            }
            break;
          }
        }
        _isLanguageTextRetrievingDone = true;
        callSelectionPopup(self);
      });
    } else {
      callSelectionPopup(self);
    }
  }

  /**
   * The header viewmodel provides functionality for the <i>flexHeader'</i> view part.
   * Such things are date/time handling, headline and instruction texts and the header message text handling.
   * Furthermore for all commands which are part of the header, such as language change, help or swap screen there
   * are the proper functionality available to handle these.
   * <p>
   * Usually this viewmodel is set as viewmodel life-cycle static, see {@link module:ViewModelContainer.LIFE_CYCLE_MODE}
   * </p>
   * HeaderViewModel deriving from {@link Wincor.UI.Content.BaseViewModel} class.
   * @class
   * @since 1.0/00
   */
  Wincor.UI.Content.HeaderViewModel = class HeaderViewModel extends (
    Wincor.UI.Content.BaseViewModel
  ) {
    /**
     * Contains the time object including the language specific time and meridiem.
     * @example
     * {
     *     "time": "4:20",
     *     "meridiem": "PM"
     * }
     * @type {function | ko.observable}
     * @bindable
     */
    time = null;

    /**
     * Contains the language specific date string.
     * @example
     * "Tuesday, 4/3/2018"
     * @type {ko.observable}
     * @bindable
     */
    date = null;

    /**
     * Takes the language ISO code of ISO 639x.
     * @example
     * en-US, de-DE, fr-FR, es-ES, ...
     * @type {string}
     */
    language = "";

    /**
     * Takes a message text which shall be shown in the header message.
     * @type {function | ko.observable}
     * @bindable
     */
    messageText = null;

    /**
     * Takes a message text level which shall be shown in the header message.
     * @see {@link Wincor.UI.Content.BaseViewModel#MESSAGE_LEVEL}
     * @type {function | ko.observable}
     * @bindable
     */
    messageLevel = null;

    /**
     * Flag which gets true when a message text is available to show.
     * @type {function | ko.computed}
     * @bindable
     */
    messageVisible = null;

    /**
     * Gives the current split screen mode the UI content currently is.
     * Possible values are:
     * <ul>
     *     <li>disabled - split screen is not available</li>
     *     <li>off - split screen is currently off</li>
     *     <li>down - split screen is in bottom part of screen</li>
     *     <li>up - split screen is in top part of screen</li>
     * </ul>
     * @important the split screen feature is only available on certain screen hardware with portrait orientation such as the DNSeries DN200.
     * @default 'disabled'
     * @type {String}
     */
    splitScreenMode = "disabled";

    /**
     * Initializes this view model.
     * @param {*} codeBehindModule the header code-behind module
     * @lifecycle viewmodel
     */
    constructor(codeBehindModule) {
      super();
      _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "> HeaderViewModel");
      // Attention: This viewmodel is static, so that this function is only called once a time.
      // In the case the viewmodel would be removed (was already running) we clear the interval, since the module
      // is loaded only once a time, regardless how often the viewmodel would be initialized.
      // Please do not overload clean method and reset timer, since this viewmodel should stay the whole life time and it makes no
      // sense to restart the timer stuff on every navigation. This is quite the same for the observables, for it makes no sense to remove them
      // and reinitialize them all the time again and again !
      window.clearInterval(_intervalId);
      _interval = 1000;
      _intervalId = -1;
      _isLanguageTextRetrievingDone = false;
      _langSelectionPopupOptions.sourceList = [];
      _headerModule = codeBehindModule;
      // Messages can be triggered via 2 ways:
      // a) via viewmodel event, see onViewModelEvent() with id=EVENT_ON_MESSAGE_AVAILABLE
      // b) via getLabel() to an observable which belongs to another viewmodel
      //
      // In both cases the messageText() observable of this viewmodel is set.
      // If any of the 2 ways is going to get active it let disappear the current shown message and vice versa.
      // Regardless whether the below subscription's to the observables belonging to another viewmodel, because of we stay static, the observables
      // retrieved with the getLabel() call won't get removed, so that the subscriptions are persistent here, whereas the observables of the flexMain viewmodel
      // is removed from the container if the view changes according to the viewmodel's life-cycle.
      //
      // For way b there is no need for a viewmodel to send a viewmodel event, but must set the observables which are configured as a text key value in the following way:
      // "General": "{#flexMain.messageText;;#}" and for the level: "General": "{#flexMain.messageLevel;;WarningBox#}"
      // In this case the viewmodel of "flexMain" must comprise of observables which is messageText and messageLevel here, both observables have nothing to do with the
      // name equivalents of this viewmodel - they are belonging to different instances of viewmodels !
      // The MessageViewModel, AmountEntryViewModel, NumericEntryViewModel are examples for way b.
      this.getLabel(
        "GUI_[#VIEW_KEY#]_Hint_Message",
        "{#flexMain.messageText;;#}"
      ).subscribe(async (newText) => {
        if (newText !== "") {
          try {
            await this.onViewModelEvent(container.EVENT_ON_BEFORE_CLEAN); // force message to disappear (level is set to default)
          } catch (e) {
            _logger.LOG_INFO &&
              _logger.log(
                _logger.LOG_INFO,
                ". HeaderViewModel::onViewModelEvent getLabel(Hint_Message).subscribe await for EVENT_ON_BEFORE_CLEAN (messageDisappearPromise rejected)"
              );
          }
          try {
            await _messageDisappearPromise;
          } catch (e) {
            _logger.LOG_INFO &&
              _logger.log(
                _logger.LOG_INFO,
                `. HeaderViewModel::onViewModelEvent getLabel(Hint_Message).subscribe (messageDisappearPromise rejected) due to: ${e}`
              );
          } finally {
            _logger.LOG_DATA &&
              _logger.log(
                _logger.LOG_DETAIL,
                `. HeaderViewModel::GUI_*_Hint_Message newText=${newText}`
              );
            this.messageText(newText);
            if (newText && _escalationMessageAvailable) {
              _headerModule.escalationMessageAvailable();
            }
          }
        } else {
          // clean message
          try {
            _messageDisappearPromise = _headerModule.moveHeaderMessageOut();
          } finally {
            this.messageText("");
            this.messageLevel(this.MESSAGE_LEVEL.INFO);
          }
        }
      });
      this.getLabel(
        "GUI_[#VIEW_KEY#]_Hint_Message_Level",
        "{#flexMain.messageLevel;WarningBox;#}"
      ).subscribe(async (newLevel) => {
        try {
          await _messageDisappearPromise;
        } catch (e) {
          _logger.LOG_DETAIL &&
            _logger.log(
              _logger.LOG_DETAIL,
              `. HeaderViewModel::onViewModelEvent getLabel(messageLevel).subscribe (messageDisappearPromise rejected) due to: ${e}`
            );
        } finally {
          this.messageLevel(newLevel);
        }
      });
      //this.swapScreenViewState = ko.observable(3);
      this.messageText = ko.observable("");
      this.messageTextAda = ko.observable("");
      this.messageLevel = ko.observable(this.MESSAGE_LEVEL.INFO);
      this.messageVisible = ko.pureComputed(() => {
        return this.messageText() !== "";
      }, this);
      this.language = !this.designMode
        ? _localizeService.currentLanguage
        : "en-US";
      // if swapping should be a button in main, the command can be data-bound against this observable!
      this.swapScreenViewState = ko.observable(this.CMDSTATE.HIDDEN);
      this.days = _days;
      this.month = _months;
      this.time = ko.observable("");
      this.date = ko.observable("");
      this.dmViewService = null;
      if (!this.designMode) {
        this.installSwapScreenCapability();
        _localizeService.registerForServiceEvent(
          _localizeService.SERVICE_EVENTS.LANGUAGE_CHANGED,
          this.onLanguageChanged.bind(this),
          _localizeService.DISPOSAL_TRIGGER_SHUTDOWN
        );
      }
      _logger.LOG_INOUT && _logger.log(_logger.LOG_INOUT, "< HeaderViewModel");
    }

    /**
     * This method usually initializes data before text and/or business data are retrieved, such as e.g. viewkey configuration.
     * Overrides {@link Wincor.UI.Content.BaseViewModel#observe}
     * @param {string} observableAreaId the area id to observe via knockout
     * @return {object}
     * @lifecycle viewmodel
     */
    observe(observableAreaId) {
      // Attention: This VM is static, see comment in initialize method!
      _logger.LOG_INOUT &&
        _logger.log(
          _logger.LOG_INOUT,
          `> HeaderViewModel::observe(observableAreaId=${observableAreaId})`
        );
      // Delegate us to the onButtonPressed here.
      // This has to be done each time a new view comes in, because CMD_LANGUAGE_POPUP maybe exist of more than one view.
      // Furthermore, the promise will always rejected in the case the command wasn't available, so we have to request for a new
      // availability promise anyway.
      this.cmdRepos.whenAvailable([CMD_LANGUAGE_POPUP]).then(() => {
        this.cmdRepos.addDelegate({
          id: CMD_LANGUAGE_POPUP,
          delegate: this.onButtonPressed,
          context: this,
        });
      });
      // This command usually belongs to the header.html (TOUCH, globe icon), so the promise will allays be resolved then.
      this.cmdRepos.whenAvailable([CMD_LANGUAGE]).then(() => {
        this.cmdRepos.setActive(
          CMD_LANGUAGE,
          this.viewKey !== "LanguageSelection"
        ); // if the viewkey is 'LanguageSelection' we disable us
      });
      super.observe(observableAreaId);
      _logger.LOG_INOUT &&
        _logger.log(_logger.LOG_INOUT, "< HeaderViewModel::observe");
    }

    /**
     * Initializes the text and data.
     * This method builds several text keys for headline, instruction and help popup.
     * @param {object} args will contain the promise which getting resolved when everything is prepared
     * @see {Wincor.UI.Content.BaseViewModel#onInitTextAndData}
     * @lifecycle viewmodel
     */
    onInitTextAndData(args) {
      _logger.LOG_INOUT &&
        _logger.log(_logger.LOG_INOUT, "> HeaderViewModel::onInitTextAndData");
      // set interval time
      if (_intervalId === -1) {
        _intervalId = window.setInterval(this.updateTime.bind(this), _interval);
      }
      // help maybe individual, so we must build the gui key always
      args.textKeys.push(
        this.buildGuiKey(LABEL_SUFFIX_HELP_POPUP, LABEL_SUFFIX_MESSAGE)
      );
      args.textKeys.push(
        this.buildGuiKey(LABEL_SUFFIX_HELP_POPUP, LABEL_SUFFIX_VIDEO)
      );
      args.textKeys.push(
        this.buildGuiKey(LABEL_SUFFIX_HELP_POPUP, LABEL_SUFFIX_IMAGE)
      );
      args.textKeys.push(this.buildGuiKey(LABEL_SUFFIX_INSTRUCTION));
      args.textKeys.push(this.buildGuiKey(LABEL_SUFFIX_HEADLINE));
      // design mode only ?
      if (this.designMode) {
        this.cmdRepos
          .whenAvailable([CMD_HEADLINE, CMD_INSTRUCTION])
          .then(() => {
            // update header texts
            this.cmdRepos.setCmdLabel(
              CMD_HEADLINE,
              this.designTimeRunner.getDefaultText(LABEL_SUFFIX_HEADLINE, "en")
            );
            this.cmdRepos.setCmdLabel(
              CMD_INSTRUCTION,
              this.designTimeRunner.getDefaultText(
                LABEL_SUFFIX_INSTRUCTION,
                "en"
              )
            );
          });
      }
      _logger.LOG_INOUT &&
        _logger.log(_logger.LOG_INOUT, "< HeaderViewModel::onInitTextAndData");
      return super.onInitTextAndData(args);
    }

    /**
     * Is called when text retrieving is ready.
     * The method retrieves the several text keys prepared by {@link Wincor.UI.Content.HeaderViewModel#onInitTextAndData}.
     * @param {Object} result Contains the key:value pairs of data previously retrieved by this view-model subclass
     * @lifecycle viewmodel
     */
    onTextReady(result) {
      _logger.LOG_INOUT &&
        _logger.log(
          _logger.LOG_INOUT,
          "> HeaderViewModel::onTextReady(result)"
        );
      this.cmdRepos.whenAvailable([CMD_HELP]).then(() => {
        let msgKey = this.buildGuiKey(
          LABEL_SUFFIX_HELP_POPUP,
          LABEL_SUFFIX_MESSAGE
        );
        let vidKey = this.buildGuiKey(
          LABEL_SUFFIX_HELP_POPUP,
          LABEL_SUFFIX_VIDEO
        );
        let imgKey = this.buildGuiKey(
          LABEL_SUFFIX_HELP_POPUP,
          LABEL_SUFFIX_IMAGE
        );
        let adaState = this.serviceProvider.AdaService.state;
        // if ADA is active, the help command has to be set invisible to release keys for proper ada HELP key handling
        if (adaState === this.serviceProvider.AdaService.STATE_VALUES.SPEAK) {
          this.cmdRepos.setVisible(CMD_HELP, false);
        } else if (result[msgKey] || result[vidKey] || result[imgKey]) {
          _logger.LOG_DATA &&
            _logger.log(
              _logger.LOG_DATA,
              "* HeaderViewModel::onTextReady( adaState: " + adaState + ")"
            );
          this.cmdRepos.setActive(CMD_HELP);
        } else {
          // disable for non configured viewkeys
          this.cmdRepos.setActive(CMD_HELP, false);
        }
      });
      _logger.LOG_INOUT &&
        _logger.log(_logger.LOG_INOUT, "< HeaderViewModel::onTextReady");
    }

    /**
     * Overridden to get informed when an arbitrary view model send an event.
     * @param {String} id the event id
     * @param {Object=} data the event data, usually a JSON notated object, the viewmodel which overrides this method
     * has to know which type of event data are expected dependent by the id of the event.
     * @eventhandler
     */
    async onViewModelEvent(id, data) {
      _logger.LOG_ANALYSE &&
        _logger.log(
          _logger.LOG_ANALYSE,
          `. HeaderViewModel::onViewModelEvent(${id}, ${JSON.stringify(data)})`
        );
      if (id === container.EVENT_ON_MESSAGE_AVAILABLE) {
        const messageText = (data && data.messageText) || "";
        const messageTextAda = (data && data.messageTextAda) || "";
        const level = messageText ? data && data.messageLevel : false;

        if (
          messageText === this.messageText() &&
          level === this.messageLevel()
        ) {
          // no change, just return
          _logger.LOG_DEBUG &&
            _logger.log(
              _logger.LOG_DEBUG,
              ". HeaderViewModel::onViewModelEvent MESSAGE_AVAILABLE with same data... skipping"
            );
          return;
        }
        // do not await whenAvailable, can be done async
        this.cmdRepos.whenAvailable([CMD_LANGUAGE]).then(() => {
          this.cmdRepos.setActive(CMD_LANGUAGE, !messageText);
        });

        if (
          _messageDisappearPromise.isFulfilled() &&
          this.messageText() !== ""
        ) {
          _messageDisappearPromise = _headerModule.moveHeaderMessageOut();
        }
        if (messageText) {
          await container.whenActivated();
        }
        try {
          await _messageDisappearPromise;
        } catch (e) {
          _logger.LOG_ANALYSE &&
            _logger.log(
              _logger.LOG_ANALYSE,
              `. HeaderViewModel::onViewModelEvent newText(messageDisappearPromise rejected) due to:${e}`
            );
        } finally {
          this.messageText(messageText);
          // the data may also contain a message level, this is independent from a EVENT_ON_MESSAGE_LEVEL_AVAILABLE event
          if (level) {
            this.messageLevel(level);
          } else {
            this.messageLevel(this.MESSAGE_LEVEL.INFO);
          }
          this.messageTextAda(messageTextAda);
          if (data.messageText && _escalationMessageAvailable) {
            _headerModule.escalationMessageAvailable();
          }
        }
      } else if (id === container.EVENT_ON_MESSAGE_LEVEL_AVAILABLE) {
        if (data && data.messageLevel) {
          this.messageLevel(data.messageLevel);
        }
      } else if (id === container.EVENT_ON_BEFORE_CLEAN) {
        _messageDisappearPromise = _headerModule.moveHeaderMessageOut();
        try {
          await _messageDisappearPromise;
        } catch (e) {
          _logger.LOG_INFO &&
            _logger.log(
              _logger.LOG_INFO,
              `. HeaderViewModel::onViewModelEvent EVENT_ON_BEFORE_CLEAN(messageDisappearPromise rejected) due to: ${e}`
            );
        } finally {
          this.messageText("");
          this.messageLevel(this.MESSAGE_LEVEL.INFO);
        }

        // do not await whenAvailable, can be done async
        this.cmdRepos.whenAvailable([CMD_LANGUAGE]).then(() => {
          if (this.cmdRepos.hasCommand(CMD_LANGUAGE)) {
            this.cmdRepos.setActive(
              CMD_LANGUAGE,
              this.viewKey !== "LanguageSelection"
            );
          }
        });
      } else if (id === "MAGNIFY_GLASS_OFF") {
        _headerModule.magnifyGlassOff();
      } else if (id === "ESCALATION_MESSAGE_AVAILABLE") {
        _escalationMessageAvailable = true;
      }
    }

    /**
     * Handler function to remove/clear members.
     * Overridden to clear data list items, flags and counter.
     * @lifecycle viewmodel
     */
    onDeactivated() {
      _logger.LOG_INOUT &&
        _logger.log(_logger.LOG_INOUT, "> HeaderViewModel::onDeactivated");
      _isLanguageTextRetrievingDone = false;
      _langSelectionPopupOptions.sourceList = [];
      _langSelectionPopupOptions.result = {};
      _escalationMessageAvailable = false;
      this.messageText("");
      this.messageLevel(this.MESSAGE_LEVEL.INFO);
      // do not reset popup options.
      super.onDeactivated();
      _logger.LOG_INOUT &&
        _logger.log(_logger.LOG_INOUT, "< HeaderViewModel::onDeactivated");
    }

    /**
     * Overridden to handle certain commands for the header part.
     * <p>
     * Handles on button pressed actions:<br>
     * <ul>
     *     <li>HELP</li>
     *     <li>LANGUAGE</li>
     *     <li>MAGNIFY_GLASS</li>
     * </ul>
     * </p>
     * @param {String} id the command id such as 'LANGUAGE', etc.
     * @eventhandler
     */
    onButtonPressed(id) {
      _logger.LOG_INOUT &&
        _logger.log(
          _logger.LOG_INOUT,
          `> HeaderViewModel::onButtonPressed(${id})`
        );
      if (id === CMD_HELP) {
        this.showPopupMessage(
          "helppopup.component.html",
          { type: LABEL_SUFFIX_HELP_POPUP },
          (success) => {
            if (!success) {
              _logger.error(
                "* HeaderViewModel::help popup - error loading popup: helppopup.component.html"
              );
            }
          }
        );
      } else if (id === CMD_LANGUAGE || id === CMD_LANGUAGE_POPUP) {
        handleLanguagePopup(this);
      } else if (id === CMD_MAGNIFY_GLASS) {
        container.sendViewModelEvent("MAGNIFY_GLASS_PRESSED", {});
      } else if (this.designMode) {
        super.onButtonPressed(id);
      }
      _logger.LOG_INOUT &&
        _logger.log(_logger.LOG_INOUT, "< HeaderViewModel::onButtonPressed");
      return true;
    }

    /**
     * Overridden to handle certain commands for cheque verifying.
     * @param {string} lang the language ISO code of ISO 639x.
     * @see {@link Wincor.UI.Content.HeaderViewModel#language}
     * @eventhandler
     */
    onLanguageChanged(lang) {
      _logger.LOG_INOUT &&
        _logger.log(
          _logger.LOG_INOUT,
          `> HeaderViewModel::onLanguageChanged(${lang})`
        );
      this.language = lang;
      this.updateTime();
      _logger.LOG_INOUT &&
        _logger.log(_logger.LOG_INOUT, "< HeaderViewModel::onLanguageChanged");
    }

    /**
     * Updates the observables for date and time.
     * The method uses the browser's date/time formatting features and is invoked in a time interval.
     */
    updateTime() {
      let dateNow = new Date();
      let timeString = dateNow.toLocaleTimeString(this.language, {
        hour: "2-digit",
        minute: "2-digit",
      }); //can be "12:26" or "12:26 pm"

      this.time({
        time: timeString.split(" ")[0],
        meridiem: timeString.split(" ")[1],
      });
      this.date(
        dateNow.toLocaleDateString(this.language, {
          weekday: "long",
          year: "numeric",
          month: "numeric",
          day: "numeric",
        })
      );

      analyzeDayTime(this, dateNow, this.time());
    }

    /**
     * This function swaps screens with the given UIInstance. It is called via SWAP_SCREENS command
     * @param {string} uiInstance the UI instance name e.g. <i>GUIAPP, GUIDM, GUIVIDEO</i>
     */
    swapScreens(uiInstance) {
      _logger.LOG_INOUT &&
        _logger.log(_logger.LOG_INOUT, `> HeaderViewModel::swapScreens`);
      let ret = ext.Promises.Promise.resolve();
      if (!this.designMode) {
        ret = _viewService.swapLocation(uiInstance);
      }
      _logger.LOG_INOUT &&
        _logger.log(
          _logger.LOG_INOUT,
          `< HeaderViewModel::swapScreens returns ${ret}`
        );
      return ret;
    }

    /**
     * Handler method for inherited viewmodels.
     * This method is invoked when a view model instance is used the next time after the initialization, observe and onInitTextAndData.<br>
     * Will be called before observe is called again.
     * Usually when the view key changes, but the current view will be still active, in this case (all) the appropriated
     * view model instance(s) will not be removed, but deactivated for the life cycle mode DEFAULT & STATIC.<br>
     * Will always be called when the life-cycle mode is DEFAULT, STATIC or VIEW_RELATED.<br>
     * Do not forget to call <code>super.onReactivated()</code>.
     * @lifecycle viewmodel
     */
    onReactivated() {
      super.onReactivated();
      if (this.dmViewService) {
        this.swapScreenViewState(
          this.dmViewService.contentRunning
            ? this.CMDSTATE.ENABLED
            : this.CMDSTATE.DISABLED
        );
      }
    }

    /**
     * Checks for availability and necessary configuration of DM. Installs handlers to reflect state of SWAP_SCREENS command
     * @returns {boolean}
     */
    installSwapScreenCapability() {
      _logger.LOG_INOUT &&
        _logger.log(
          _logger.LOG_INOUT,
          `> HeaderViewModel::installSwapScreenCapability`
        );
      let ret = true;

      _viewService
        .getRemoteInstance(GUIDM)
        .then((dmViewService) => {
          // check if initial locations are the same. If so we deactivate swapping
          const loc = _viewService.initialLocation;
          const locDM = dmViewService.initialLocation;

          _logger.LOG_INOUT &&
            _logger.log(
              _logger.LOG_INOUT,
              `* HeaderViewModel::installSwapScreenCapability \ninitialLocationApp:${JSON.stringify(
                loc,
                null,
                " "
              )}\ninitialLocationDM :${JSON.stringify(locDM, null, " ")}`
            );
          if (loc.top === locDM.top && loc.left === locDM.left) {
            throw "Initial locations match... rejecting installSwapScreenCapability";
          }
          // assign only if functionality is available
          this.dmViewService = dmViewService;
          // install dynamic handlers
          let evtIdActivated = dmViewService.registerForServiceEvent(
            dmViewService.SERVICE_EVENTS.VIEW_ACTIVATED,
            (data) => {
              _logger.LOG_DETAIL &&
                _logger.log(
                  _logger.LOG_DETAIL,
                  `. HeaderViewModel::installSwapScreenCapability received VIEW_ACTIVATED from GUIDM with ${data}`
                );
              let href = typeof data === "string" ? data : data.href;
              if (!href.endsWith("index.html")) {
                // this is startup only
                this.swapScreenViewState(
                  dmViewService.contentRunning
                    ? this.CMDSTATE.ENABLED
                    : this.CMDSTATE.DISABLED
                );
              }
            },
            true
          );
          let evtIdClosing = dmViewService.registerForServiceEvent(
            dmViewService.SERVICE_EVENTS.VIEW_CLOSING,
            (data) => {
              _logger.LOG_DETAIL &&
                _logger.log(
                  _logger.LOG_DETAIL,
                  `. HeaderViewModel::installSwapScreenCapability received VIEW_CLOSING from GUIDM with ${data}`
                );
              this.swapScreenViewState(this.CMDSTATE.DISABLED);
            },
            true
          );
          // de register from persistent service events while shutdown
          _viewService.registerForServiceEvent(
            _viewService.SERVICE_EVENTS.SHUTDOWN,
            () => {
              dmViewService.deregisterFromServiceEvent(evtIdActivated);
              dmViewService.deregisterFromServiceEvent(evtIdClosing);
            },
            _viewService.DISPOSAL_TRIGGER_SHUTDOWN
          );
          // set state in case we missed the first activation
          this.swapScreenViewState(
            dmViewService.contentRunning
              ? this.CMDSTATE.ENABLED
              : this.CMDSTATE.DISABLED
          );
        })
        .catch((reason) => {
          _logger.LOG_INOUT &&
            _logger.log(
              _logger.LOG_INOUT,
              `* HeaderViewModel::installSwapScreenCapability -> ${reason}`
            );
        });

      _logger.LOG_INOUT &&
        _logger.log(
          _logger.LOG_INOUT,
          `< HeaderViewModel::installSwapScreenCapability`
        );
      return ret;
    }

    getModule() {
      return _headerModule;
    }
  };
});
