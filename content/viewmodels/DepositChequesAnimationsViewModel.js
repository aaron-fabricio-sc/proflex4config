/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ DepositChequesAnimationsViewModel.js 4.3.1-210127-21-34ae33df-1a04bc7d
 */
define(["knockout", "vm/AnimationsViewModel"], function (ko) {
  "use strict";

  const _logger = Wincor.UI.Service.Provider.LogProvider;
  const _dataService = Wincor.UI.Service.Provider.DataService;
  const _eventService = Wincor.UI.Service.Provider.EventService;

  const EVENT_INFO = _eventService.getEventInfo("TRANSACTION_MODULE");

  /**
   * Property key for access to the maximum number of cheques
   * @const
   * @type {string}
   */
  const PROP_REMAINING_MEDIA_ON_STACKER = "PROP_REMAINING_MEDIA_ON_STACKER";

  /**
   * DepositChequesAnimationsViewModel is meant to automatically display viewkey-dependent / event-triggered animated content for deposit cheque transactions.
   * Deriving from {@link Wincor.UI.Content.AnimationsViewModel} class.
   * @class
   * @since 1.0/10
   */
  Wincor.UI.Content.DepositChequesAnimationsViewModel = class DepositChequesAnimationsViewModel extends (
    Wincor.UI.Content.AnimationsViewModel
  ) {
    /**
     * Animation content flag for cheque insertion.
     * @type {function | ko.observable}
     * @bindable
     */
    viewFlexChequesInsert = null;

    /**
     * Animation content flag for cheque ejection.
     * @type {function | ko.observable}
     * @bindable
     */
    viewFlexChequesEject = null;

    /**
     * Animation content flag for cheque insertion with MICR code left aligned.
     * @type {function | ko.observable}
     * @bindable
     */
    viewFlexChequesInsertCodeLeft = null;

    /**
     * Animation content flag for cheque ejection with MICR code left aligned.
     * @type {function | ko.observable}
     * @bindable
     */
    viewFlexChequesEjectCodeLeft = null;

    /**
     * Animation content flag for both cheque and notes insertion.
     * @type {function | ko.observable}
     * @bindable
     */
    viewFlexChequesAndNotesInsert = null;

    /**
     * Animation content flag for both cheque insertion with MICR code left aligned and notes insertion.
     * @type {function | ko.observable}
     * @bindable
     */
    viewFlexChequesCodeLeftAndNotesInsert = null;

    /**
     * Animation content flag for both cheque and notes ejection.
     * @type {function | ko.observable}
     * @bindable
     */
    viewFlexChequesAndNotesEject = null;

    /**
     * Animation content flag for both cheque ejection with MICR code left aligned and notes ejection.
     * @type {function | ko.observable}
     * @bindable
     */
    viewFlexChequesCodeLeftAndNotesEject = null;

    /**
     * Animation content flag for scanning cheques.
     * @type {function | ko.observable}
     * @bindable
     */
    viewFlexScanCheques = null;

    /**
     * Animation content flag for scanning notes.
     * @type {function | ko.observable}
     * @bindable
     */
    viewFlexScanNotes = null;

    /**
     * Animation content flag for a taking metal requirement.
     * @type {function | ko.observable}
     * @bindable
     */
    viewFlexTakeMetal = null;

    /**
     * Animation content flag for turning cheques.
     * @type {function | ko.observable}
     * @bindable
     */
    viewFlexTurnCheques = null;

    /**
     * Animation content flag for turning cheques with short side first.
     * @type {function | ko.observable}
     * @bindable
     */
    viewFlexTurnChequesShortSideFirst = null;

    /**
     * Animation content flag for turning cheques with short side first and MICR code left aligned.
     * @type {function | ko.observable}
     * @bindable
     */
    viewFlexTurnChequesShortSideFirstCodeLeft = null;

    /**
     * Animation content flag for showing general deposit hints.
     * @type {function | ko.observable}
     * @bindable
     */
    viewFlexDepositHints = null;

    /**
     * Takes the max items which are currently allowed to deposit.
     * @type {function | ko.observable}
     * @bindable
     */
    maxItems = null;

    /**
     * Guiding animation content text for the scan cheques animation.
     * @type {function | ko.observable}
     * @bindable
     */
    animationTextScanCheques = null;

    /**
     * Guiding animation content text for the scan notes animation.
     * @type {function | ko.observable}
     * @bindable
     */
    animationTextScanNotes = null;

    /**
     * The current cheque number.
     * @type {function | ko.observable}
     * @bindable
     */
    chequeNo = null;

    /**
     * The current cheque amount.
     * @type {function | ko.observable}
     * @bindable
     */
    chequeAmount = null;

    /**
     * The current overall cheques sum.
     * @type {function | ko.observable}
     * @bindable
     */
    chequesSum = null;

    /**
     * The current maximum cheque number.
     * @type {function | ko.observable}
     * @bindable
     */
    maxChequeNumber = null;

    /**
     * The current note number.
     * @type {function | ko.observable}
     * @bindable
     */
    noteNo = null;

    /**
     * The current note amount.
     * @type {function | ko.observable}
     * @bindable
     */
    noteAmount = null;

    /**
     * The current overall notes sum.
     * @type {function | ko.observable}
     * @bindable
     */
    notesSum = null;

    /**
     * The currency ISO code, e.g. 'USD'
     * @type {string}
     * @bindable
     */
    currency = "";

    /**
     * The currency symbol e.g. '$'
     * @type {string}
     * @bindable
     */
    symbol = "";

    /**
     * Initializes the member of this class to become an observable.
     * Registers for the deposit event <code>TRANSACTION_MODULE</code>.
     * @lifecycle viewmodel
     */
    constructor() {
      super();
      this.eventRegistrations.push({
        eventNumber: EVENT_INFO.ID_DEPOSIT,
        eventOwner: EVENT_INFO.NAME,
      });
      this.viewFlexChequesInsert = ko.observable(false);
      this.viewFlexChequesAndNotesInsert = ko.observable(false);
      this.viewFlexChequesCodeLeftAndNotesInsert = ko.observable(false);
      this.viewFlexChequesEject = ko.observable(false);
      this.viewFlexChequesInsertCodeLeft = ko.observable(false);
      this.viewFlexChequesEjectCodeLeft = ko.observable(false);
      this.viewFlexChequesAndNotesEject = ko.observable(false);
      this.viewFlexChequesCodeLeftAndNotesEject = ko.observable(false);
      this.viewFlexScanCheques = ko.observable(false);
      this.viewFlexScanNotes = ko.observable(false);
      this.viewFlexTakeMetal = ko.observable(false);
      this.viewFlexTurnCheques = ko.observable(false);
      this.viewFlexTurnChequesShortSideFirst = ko.observable(false);
      this.viewFlexTurnChequesShortSideFirstCodeLeft = ko.observable(false);
      this.viewFlexDepositHints = ko.observable(false);
      this.maxItems = ko.observable("");
      this.animationTextScanCheques = ko.observable("");
      this.animationTextScanNotes = ko.observable("");
      this.chequeNo = ko.observable("");
      this.chequeAmount = ko.observable("");
      this.chequesSum = ko.observable("");
      this.maxChequeNumber = ko.observable("");
      this.noteNo = ko.observable("");
      this.noteAmount = ko.observable("");
      this.notesSum = ko.observable("");
      this.currency = "";
      this.symbol = "";
    }

    /**
     * Is called when this viewmodel gets deactivated during life-cycle.
     * @lifecycle viewmodel
     */
    onDeactivated() {
      _logger.LOG_INOUT &&
        _logger.log(
          _logger.LOG_INOUT,
          "> DepositChequesAnimationsViewModel::onDeactivated()"
        );
      super.onDeactivated();
      this.eventRegistrations.push({
        eventNumber: EVENT_INFO.ID_DEPOSIT,
        eventOwner: EVENT_INFO.NAME,
      });
      this.viewFlexChequesInsert(false);
      this.viewFlexChequesEject(false);
      this.viewFlexChequesInsertCodeLeft(false);
      this.viewFlexChequesEjectCodeLeft(false);
      this.viewFlexChequesAndNotesInsert(false);
      this.viewFlexChequesCodeLeftAndNotesInsert(false);
      this.viewFlexChequesAndNotesEject(false);
      this.viewFlexChequesCodeLeftAndNotesEject(false);
      this.viewFlexScanCheques(false);
      this.viewFlexScanNotes(false);
      this.viewFlexTakeMetal(false);
      this.viewFlexTurnCheques(false);
      this.viewFlexTurnChequesShortSideFirst(false);
      this.viewFlexTurnChequesShortSideFirstCodeLeft(false);
      this.viewFlexDepositHints(false);
      this.maxItems("");
      this.animationTextScanCheques("");
      this.animationTextScanNotes("");
      this.chequeNo("");
      this.chequeAmount("");
      this.chequesSum("");
      this.maxChequeNumber("");
      this.noteNo("");
      this.noteAmount("");
      this.notesSum("");
      this.currency = "";
      this.symbol = "";
      _logger.LOG_INOUT &&
        _logger.log(
          _logger.LOG_INOUT,
          "< DepositChequesAnimationsViewModel::onDeactivated()"
        );
    }

    /**
     * This method usually initializes data before text and/or business data are retrieved, such as e.g. viewkey configuration.
     * Overrides {@link Wincor.UI.Content.BaseViewModel#observe}
     * @param {String} observableAreaId the area to observe via knockout
     * @lifecycle viewmodel
     */
    observe(observableAreaId) {
      _logger.LOG_ANALYSE &&
        _logger.log(
          _logger.LOG_ANALYSE,
          `> DepositChequesAnimationsViewModel::observe(${observableAreaId})`
        );
      // first switch off default message handling. This means that in DesignMode we use
      // the default message handling of the MessageViewModel. In 'real mode' we override
      // the default message handling, because we dynamically have to change the visibility.
      // no need for initTextAndData() ... done by AnimationsViewModel
      this.isDefaultMessageHandling = this.designMode;
      super.observe(observableAreaId);
      _logger.LOG_INOUT &&
        _logger.log(
          _logger.LOG_INOUT,
          "< DepositChequesAnimationsViewModel::observe"
        );
    }

    /**
     * Sets the proper animation content depending on the given result array.
     * @param {Array<String>} resultArray the result content keys
     */
    setAnimations(resultArray) {
      _logger.LOG_INOUT &&
        _logger.log(
          _logger.LOG_INOUT,
          `> DepositChequesAnimationsViewModel::setAnimations(${resultArray})`
        );
      // Insert cheques
      this.viewFlexChequesInsert(
        this.isAvailable(resultArray, "InsertCheques")
      );
      this.viewFlexChequesInsertCodeLeft(
        this.isAvailable(resultArray, "InsertChequesCodeLeft")
      );
      // Insert cheques/notes
      this.viewFlexChequesAndNotesInsert(
        this.isAvailable(resultArray, "InsertChequesAndNotes")
      );
      this.viewFlexChequesCodeLeftAndNotesInsert(
        this.isAvailable(resultArray, "InsertChequesCodeLeftAndNotes")
      );
      // Eject cheques
      this.viewFlexChequesEject(
        this.isAvailable(resultArray, "EjectChequesInputTray") ||
          this.isAvailable(resultArray, "EjectChequesOutputTray") ||
          this.isAvailable(resultArray, "EjectCheques")
      );

      this.viewFlexChequesEjectCodeLeft(
        this.isAvailable(resultArray, "EjectChequesCodeLeftInputTray") ||
          this.isAvailable(resultArray, "EjectChequesCodeLeftOutputTray") ||
          this.isAvailable(resultArray, "EjectChequesCodeLeft")
      );

      // Eject cheques/notes
      this.viewFlexChequesAndNotesEject(
        this.isAvailable(resultArray, "EjectChequesAndNotesInputTray") ||
          this.isAvailable(resultArray, "EjectChequesAndNotesOutputTray") ||
          this.isAvailable(resultArray, "EjectChequesAndNotes")
      );

      this.viewFlexChequesCodeLeftAndNotesEject(
        this.isAvailable(
          resultArray,
          "EjectChequesCodeLeftAndNotesInputTray"
        ) ||
          this.isAvailable(
            resultArray,
            "EjectChequesCodeLeftAndNotesOutputTray"
          ) ||
          this.isAvailable(resultArray, "EjectChequesCodeLeftAndNotes")
      );
      // Scan cheques
      this.viewFlexScanCheques(this.isAvailable(resultArray, "ScanCheques"));
      // Scan notes
      this.viewFlexScanNotes(this.isAvailable(resultArray, "ScanNotes"));
      // Take metal
      this.viewFlexTakeMetal(
        this.isAvailable(resultArray, "TakeMetal") ||
          this.isAvailable(resultArray, "TakeMetalShortSideFirst")
      );
      // Turn Cheques
      this.viewFlexTurnCheques(this.isAvailable(resultArray, "TurnCheques"));
      // Turn Cheques short side first
      this.viewFlexTurnChequesShortSideFirst(
        this.isAvailable(resultArray, "TurnChequesShortSideFirst")
      );
      // Turn Cheques short side first
      this.viewFlexTurnChequesShortSideFirstCodeLeft(
        this.isAvailable(resultArray, "TurnChequesShortSideFirstCodeLeft")
      );
      // Cheques hints
      this.viewFlexDepositHints(this.isAvailable(resultArray, "ChequesHints"));
      _logger.LOG_INOUT &&
        _logger.log(
          _logger.LOG_INOUT,
          "< DepositChequesAnimationsViewModel::setAnimations"
        );
      super.setAnimations(resultArray);
    }

    /**
     * Initializes some data.
     * The method reads the property for <code>PROP_REMAINING_MEDIA_ON_STACKER</code>.
     * @param {object} args contains attributes textKeys {array<string|promise>} / dataKeys {array<string|promise>}
     * @lifecycle viewmodel
     */
    onInitTextAndData(args) {
      _logger.LOG_ANALYSE &&
        _logger.log(
          _logger.LOG_ANALYSE,
          `> DepositChequesAnimationsViewModel::onInitTextAndData(${JSON.stringify(
            args
          )})`
        );
      this.currency = this.bankingContext.currencyData.iso;
      this.symbol = this.bankingContext.currencyData.symbol;
      if (!this.designMode) {
        args.dataKeys.push(
          _dataService
            .getValues(PROP_REMAINING_MEDIA_ON_STACKER)
            .then((result) => {
              let value = result[PROP_REMAINING_MEDIA_ON_STACKER];
              if (value) {
                this.maxItems(value);
              } else {
                _logger.error(
                  `Property not set: ${PROP_REMAINING_MEDIA_ON_STACKER}`
                );
              }
            })
        );
      } else {
        this.maxItems("50");
        args.dataKeys.push(
          this.designTimeRunner
            .retrieveJSONData("DepositChequeItemsData")
            .then((data) => {
              this.viewFlexDepositHints(data.depositHints);
              this.viewFlexChequesInsert(data.insertCheques);
              this.viewFlexChequesEject(data.ejectCheques);
              this.viewFlexChequesInsertCodeLeft(data.insertChequesCodeLeft);
              this.viewFlexChequesEjectCodeLeft(data.ejectChequesCodeLeft);
              this.viewFlexChequesAndNotesInsert(data.insertChequesAndNotes);
              this.viewFlexChequesCodeLeftAndNotesInsert(
                data.insertChequesCodeLeftAndNotes
              );
              this.viewFlexChequesAndNotesEject(data.ejectChequesAndNotes);
              this.viewFlexChequesCodeLeftAndNotesEject(
                data.ejectChequesCodeLeftAndNotes
              );
              this.viewFlexScanCheques(data.scanCheques);
              this.viewFlexScanNotes(data.scanNotes);
              this.viewFlexTakeMetal(data.takeMetal);
              this.viewFlexTurnCheques(data.turnChequesLongSideFirst);
              this.viewFlexTurnChequesShortSideFirst(
                data.turnChequesShortSideFirst
              );
              this.viewFlexTurnChequesShortSideFirstCodeLeft(
                data.turnChequesShortSideFirstCodeLeft
              );
              this.animationTextScanCheques(data.animationTextScanCheques);
              this.animationTextScanNotes(data.animationTextScanNotes);
              this.chequeNo("1");
              this.chequesSum("10€");
              this.noteNo("1");
              this.notesSum("200€");
            })
        );
      }
      _logger.LOG_ANALYSE &&
        _logger.log(
          _logger.LOG_ANALYSE,
          "< DepositChequesAnimationsViewModel::onInitTextAndData"
        );
      return super.onInitTextAndData(args);
    }

    /**
     * Is called when text retrieving for {@link Wincor.UI.Content.DepositChequesAnimationsViewModel#animationTextScanCheques} and
     * {@link Wincor.UI.Content.DepositChequesAnimationsViewModel#animationTextScanNotes} is ready.
     * @param {Object} result the result object with the text keys/value pairs
     * @lifecycle viewmodel
     */
    onTextReady(result) {
      _logger.LOG_INOUT &&
        _logger.log(
          _logger.LOG_INOUT,
          "> DepositChequesAnimationsViewModel::onTextReady(...)"
        );
      // ContentKeys for cheques/notes: AnimationText_ScanCheques, AnimationText_ScanNotes
      for (let key in result) {
        if (result.hasOwnProperty(key)) {
          if (key.indexOf("AnimationText_ScanCheques") !== -1) {
            this.animationTextScanCheques(result[key]);
          } else if (key.indexOf("AnimationText_ScanNotes") !== -1) {
            this.animationTextScanNotes(result[key]);
          }
        }
      }
      super.onTextReady(result);
      _logger.LOG_INOUT &&
        _logger.log(
          _logger.LOG_INOUT,
          "< DepositChequesAnimationsViewModel::onTextReady"
        );
    }

    /**
     * Called if any of the events of this.eventRegistrations is raised.
     * This function will build the text keys (according to the eventID and eventData) and
     * retrieve the the updated texts and ContentKeys.
     * @param {String} eventData The contents of the event (ASCII expected)
     * @param {Number} eventID The ID of the event
     * @param {String} eventOwner The owner of the event, currently not used by this function to build the text keys
     * @eventhandler
     */
    onContentChangeEvent(eventData, eventID, eventOwner) {
      _logger.LOG_INOUT &&
        _logger.log(
          _logger.LOG_INOUT,
          `> DepositChequesAnimationsViewModel::onContentChangeEvent(${eventData}, ${eventID}, ${eventOwner})`
        );
      // any event refreshes timer and reset escalation
      this.serviceProvider.ViewService.refreshTimeout();
      eventID = eventID || "";
      if (
        typeof eventData === "string" &&
        eventData.charAt(0) === "{" &&
        eventData.charAt(eventData.length - 1) === "}"
      ) {
        // probably JSON notated data?
        try {
          let scanData = JSON.parse(eventData);
          _logger.LOG_DETAIL &&
            _logger.log(
              _logger.LOG_DETAIL,
              `. DepositChequesAnimationsViewModel::onContentChangeEvent scanData=${JSON.stringify(
                scanData
              )}`
            );
          /*
                     {
                     "content_key": "ScanCheques,ScanNotes", or empty string!
                     "type":      "cheque/note",
                     "number":  "1/2/3/4/…",
                     "maxNumber": "25",
                     "amount": "10",
                     "sum":     "1000",
                     "image":  "C:\\PROFLEX4\\BASE\\WORK\\FRONT01.JPG"
                     }
                     */
          if (scanData.content_key) {
            super.onContentChangeEvent(
              scanData.content_key,
              eventID,
              eventOwner
            );
          }
          if (scanData.type === "cheque") {
            this.chequeNo(scanData.number);
            this.chequeAmount(scanData.amount);
            this.chequesSum(scanData.sum);
            this.maxChequeNumber(scanData.maxNumber);
          } else {
            this.noteNo(scanData.number);
            this.noteAmount(scanData.amount);
            this.notesSum(scanData.sum);
          }
        } catch (e) {
          _logger.error(
            `Parse error, JSON notated data expected for event id ${eventID} and ${eventOwner}: ${e}`
          );
        }
      } else {
        super.onContentChangeEvent(eventData, eventID, eventOwner);
      }
      _logger.LOG_INOUT &&
        _logger.log(
          _logger.LOG_INOUT,
          "< DepositChequesAnimationsViewModel::onContentChangeEvent"
        );
    }
  };
});
