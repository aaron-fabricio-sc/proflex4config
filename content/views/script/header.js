/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ header.js 4.3.1-210108-21-173923a2-1a04bc7d
 */

/**
 * The header code-behind provides the life-cycle for the <i>header</i> view.
 * <p>
 * Please note that the header layout part is a static part which means that it's not gonna removed but updated when a new view come in.
 * </p>
 * @module header
 * @since 1.0/00
 */
define([
  "jquery",
  "code-behind/baseaggregate",
  "vm-util/UICommanding",
  "vm/HeaderViewModel",
], function ($, base, commanding) {
  console.log("AMD:header");

  const _logger = Wincor.UI.Service.Provider.LogProvider;
  const _configService = Wincor.UI.Service.Provider.ConfigService;

  let _messageDisappearDeffered = null;
  let _cameraStreamConf = "";
  let _headerVM;
  let _advertisingSpaceMode = 0;
  let _currentSplitScreenMode = "off"; // off, down, up
  let _styleEventListenerId = -1;

  const SPLIT_MODE_NOT_SUPPORTED_VIEWKEYS = ["MenuPreferenceSelection"];
  const STYLE_TYPES_FOR_ENHANCEMENTS = ["DNSeries/"];
  const IS_SUPPORTED_STYLE_TYPE = () => {
    return STYLE_TYPES_FOR_ENHANCEMENTS.includes(
      base.viewHelper.styleResolver.type()
    );
  };
  const ORG_SPLIT_MODE_CONFIG = base.config.SPLIT_SCREEN_MODE;

  const CMD_MAGNIFY_GLASS = "MAGNIFY_GLASS";

  const SPLIT_SCREEN_MODES = ["disabled", "off", "down", "up"];
  const SPLIT_SCREEN_ACTIVE = () => {
    return (
      _currentSplitScreenMode === SPLIT_SCREEN_MODES[2] ||
      _currentSplitScreenMode === SPLIT_SCREEN_MODES[3]
    );
  };

  let _isVideoCameraStreamAllowed =
    window.innerHeight === 1280 &&
    base.config.viewType === "touch" &&
    STYLE_TYPES_FOR_ENHANCEMENTS.includes(
      base.viewHelper.styleResolver.type()
    ) &&
    _configService.configuration.instanceName === "GUIAPP";

  let _self = base.extend({
    name: "header",

    /**
     * Toggles the split screen mode.
     * Toggles between 'off', 'down' and 'up'.
     */
    toggleSplitMode: async () => {
      if (
        base.config.ALLOW_SPLIT_SCREEN_MOVING &&
        base.config.SPLIT_SCREEN_MODE !== SPLIT_SCREEN_MODES[0] &&
        !base.config.isDirectMarketingAvailable
      ) {
        switch (_currentSplitScreenMode) {
          case SPLIT_SCREEN_MODES[1]:
            _currentSplitScreenMode = SPLIT_SCREEN_MODES[2];
            await _self.handleSplitMode(true);
            break;
          case SPLIT_SCREEN_MODES[2]:
            _currentSplitScreenMode = SPLIT_SCREEN_MODES[3];
            await _self.moveSplitScreenPosition();
            break;
          case SPLIT_SCREEN_MODES[3]:
            _currentSplitScreenMode = SPLIT_SCREEN_MODES[1];
            await _self.handleSplitMode(false);
            break;
        }
      }
    },

    /**
     * Handles the split screen mode.
     * @param {boolean} mode the mode to handle: true, false'
     */
    handleSplitMode: async (mode) => {
      if (
        base.content.viewType === "touch" &&
        base.config.SPLIT_SCREEN_MODE !== SPLIT_SCREEN_MODES[0] &&
        !SPLIT_MODE_NOT_SUPPORTED_VIEWKEYS.includes(
          base.container.currentViewKey
        )
      ) {
        _logger.LOG_ANALYSE &&
          _logger.log(
            _logger.LOG_ANALYSE,
            `* | VIEW_AGGREGATE header:handleSplitMode mode=${mode} current splitScreenMode=${_headerVM.splitScreenMode}`
          );
        const $header = $("#flexHeader");
        $header.attr({
          "data-split-mode": mode,
          "data-split-mode-position": _currentSplitScreenMode,
        });
        $("body").attr({
          "data-split-mode": mode,
          "data-split-mode-position": _currentSplitScreenMode,
        });
        $("#flexFooter").attr({
          "data-split-mode": mode,
          "data-split-mode-position": _currentSplitScreenMode,
        });
        $("[data-view-key]").attr("data-split-mode", mode);
        const objMgr = Wincor.UI.Content.ObjectManager;
        if (mode === true) {
          await base.viewHelper.styleResolver.setResolution(
            base.config.RVT_DEFAULT_NAME
          );
          _headerVM.splitScreenMode = _currentSplitScreenMode;
          if (IS_SUPPORTED_STYLE_TYPE()) {
            base.config.ALLOW_SPLIT_SCREEN_MOVING &&
              $header.find("#moveSplitScreenPosition").show();
            if (
              base.config.showAdvertisingSpace &&
              !base.config.isDirectMarketingAvailable
            ) {
              $header.find("#showAdvertisingSpace").show();
              _self.toggleAdvertisingSpace(2);
            }
          }
        } else {
          await base.viewHelper.styleResolver.setResolution(
            base.config.RES_1024X1280
          );
          _headerVM.splitScreenMode = SPLIT_SCREEN_MODES[1];
          $header.find("#showAdvertisingSpace").hide();
          base.config.showAdvertisingSpace && _self.toggleAdvertisingSpace(1);
        }
        _logger.LOG_ANALYSE &&
          _logger.log(
            _logger.LOG_ANALYSE,
            `* | VIEW_AGGREGATE header:handleSplitMode new splitScreenMode=${_headerVM.splitScreenMode}`
          );
        setTimeout(objMgr.reCalculateObjects.bind(objMgr), 750);
        /*Disable Video on resolution change*/
        let $video = $("#adVideo");
        if ($video.length) {
          $video.css({ display: "none" });
          $video[0].pause();
          $video[0].currentTime = 0;
        }
      }
    },

    /**
     * Moves the current split screen position from 'up' to 'down' or vice versa.
     */
    moveSplitScreenPosition: () => {
      if (
        base.config.SPLIT_SCREEN_MODE !== SPLIT_SCREEN_MODES[0] &&
        base.content.viewType === "touch" &&
        !base.config.isDirectMarketingAvailable &&
        !SPLIT_MODE_NOT_SUPPORTED_VIEWKEYS.includes(
          base.container.currentViewKey
        )
      ) {
        const $header = $("#flexHeader");
        const $footer = $("#flexFooter");
        const pos = $header.attr("data-split-mode-position");
        const newPos =
          pos === SPLIT_SCREEN_MODES[2]
            ? SPLIT_SCREEN_MODES[3]
            : SPLIT_SCREEN_MODES[2];
        $header.attr("data-split-mode-position", newPos);
        $footer.attr("data-split-mode-position", newPos);
        $("body").attr({ "data-split-mode-position": newPos });
        _headerVM.splitScreenMode = newPos;
        const objMgr = Wincor.UI.Content.ObjectManager;
        setTimeout(objMgr.reCalculateObjects.bind(objMgr), 750);
        _logger.LOG_ANALYSE &&
          _logger.log(
            _logger.LOG_ANALYSE,
            `* | VIEW_AGGREGATE header:moveSplitScreenPosition current splitScreenMode=${_headerVM.splitScreenMode}`
          );
      }
    },

    /**
     * Toggles between the content in the advertising space.
     * @param {Number} mode 0: advertising space without video, 1: no advertising space, no video and 2: advertising space with video
     */
    toggleAdvertisingSpace: (mode) => {
      if (
        base.config.showAdvertisingSpace &&
        base.config.SPLIT_SCREEN_MODE !== SPLIT_SCREEN_MODES[0] &&
        base.content.viewType === "touch" &&
        !base.config.isDirectMarketingAvailable &&
        !SPLIT_MODE_NOT_SUPPORTED_VIEWKEYS.includes(
          base.container.currentViewKey
        )
      ) {
        const $header = $("#flexHeader");
        const $adSpace = $header.find("#advertisingSpace");
        const $video = $adSpace.find("video");
        /*
                  0: advertising space without video
                  1: no advertising space, no video
                  2: advertising space with video
                */
        if (mode) {
          _advertisingSpaceMode = mode;
        }
        if (_advertisingSpaceMode === 0) {
          _advertisingSpaceMode = 1;
          $adSpace.length && $adSpace.show();
          if ($video.length) {
            $video[0].pause();
            $video[0].currentTime = 0;
            $video.hide();
          }
        } else if (_advertisingSpaceMode === 1) {
          _advertisingSpaceMode = 2;
          if ($video.length) {
            $video[0].pause();
            $video[0].currentTime = 0;
            $video.hide();
          }
          $adSpace.length && $adSpace.hide();
        } else if (_advertisingSpaceMode === 2) {
          _advertisingSpaceMode = 0;
          if ($video.length) {
            $adSpace.length && $adSpace.show();
            $video.show();
            $video[0].play();
          }
        }
        _logger.LOG_ANALYSE &&
          _logger.log(
            _logger.LOG_ANALYSE,
            `* | VIEW_AGGREGATE header:toggleAdvertisingSpace advertisingSpaceMode=${_advertisingSpaceMode}, current splitScreenMode=${_headerVM.splitScreenMode}`
          );
      }
    },

    /**
     * Checks for the current split screen conditions.
     * This function may called when the style type changes in order to reevaluate the split screen conditions.
     * @param {boolean=} [update=false] true, if the call is whilst a style type update
     */
    handleStyleTypeSpecific: async function (update = false) {
      _logger.LOG_ANALYSE &&
        _logger.log(
          _logger.LOG_ANALYSE,
          `* | VIEW_AGGREGATE header:handleStyleTypeSpecific update=${update}, current splitScreenMode=${_headerVM.splitScreenMode}`
        );
      // determine starting split screen
      const $header = $("#flexHeader");

      if (base.config.SPLIT_SCREEN_MODE !== SPLIT_SCREEN_MODES[0]) {
        _currentSplitScreenMode = !update
          ? base.config.SPLIT_SCREEN_MODE
          : _currentSplitScreenMode;
        $header.attr({ "data-split-mode": SPLIT_SCREEN_ACTIVE() });
        if (SPLIT_SCREEN_ACTIVE()) {
          await _self.handleSplitMode(!update || IS_SUPPORTED_STYLE_TYPE());
        } else {
          const objMgr = Wincor.UI.Content.ObjectManager;
          setTimeout(objMgr.reCalculateObjects.bind(objMgr), 750);
          _headerVM.splitScreenMode = SPLIT_SCREEN_MODES[1];
        }
        if (
          !base.config.isDirectMarketingAvailable &&
          IS_SUPPORTED_STYLE_TYPE()
        ) {
          base.config.ALLOW_SPLIT_SCREEN_MOVING &&
            $header.find("#moveSplitScreenPosition").show();
        } else {
          $header.find("#moveSplitScreenPosition").hide();
        }
      } else {
        $header.find("#moveSplitScreenPosition").hide();
      }
      _logger.LOG_ANALYSE &&
        _logger.log(
          _logger.LOG_ANALYSE,
          `* | VIEW_AGGREGATE header:handleStyleTypeSpecific new splitScreenMode=${_headerVM.splitScreenMode}`
        );
    },

    /**
     * Should invoked in the case that an escalation message is available.
     * This is usually the case when the {@link MessageViewModel#onEscalationEvent} is invoked and a message text is available.
     */
    escalationMessageAvailable: function () {
      const $body = $("body");
      $body.length && $body.attr("data-message-escalation", "true");
    },

    /**
     * Moves the header message out of the view.
     * @returns {Promise} gets resolved the movement is ready.
     */
    moveHeaderMessageOut: function () {
      const $body = $("body");
      $body.length && $body.attr("data-message-escalation", "false");
      if (base.config.VIEW_ANIMATIONS_ON) {
        if (
          _messageDisappearDeffered &&
          _messageDisappearDeffered.promise.isPending()
        ) {
          _messageDisappearDeffered.reject();
        }
        _messageDisappearDeffered = Wincor.UI.deferred();
        const msgContainer = $("#flexMessageContainerHeader");
        const messageArea = msgContainer.find(".messageArea");
        if (
          msgContainer.length &&
          msgContainer.css("display") !== "none" &&
          messageArea.length
        ) {
          messageArea.on("animationend", () => {
            messageArea.css({ animation: "" });
            messageArea.off();
            _messageDisappearDeffered.resolve();
          });
          messageArea.css({ animation: "escalationMoveOut 0.45s ease-out" });
        } else {
          _messageDisappearDeffered.resolve();
        }
        let localProm = _messageDisappearDeffered.promise.timeout(550);
        // install rejection handler
        localProm.catch(() => {
          _logger.LOG_ANALYSE &&
            _logger.log(
              _logger.LOG_ANALYSE,
              "header:moveHeaderMessageOut promise timeout before animation 'escalationMoveOut' ends."
            );
        });
        return localProm; // in the case the animationend event does not come we timing out
      } else {
        return base.Promises.Promise.resolve();
      }
    },

    /**
     * Switches the magnify glass off.
     */
    magnifyGlassOff: function () {
      commanding.whenAvailable(CMD_MAGNIFY_GLASS).then(() => {
        // switch off 'eye' of magnify glass
        const $magnifyGlassIcon = $("#magnifyGlassObject");
        if ($magnifyGlassIcon.length) {
          $magnifyGlassIcon[0].getSVGDocument
            ? $magnifyGlassIcon[0].getSVGDocument().magnifyGlassOff()
            : $magnifyGlassIcon[0].ownerDocument.magnifyGlassOff();
        }
        commanding.setVisible(CMD_MAGNIFY_GLASS, false);
      });
    },

    /**
     * Instantiates the {@link Wincor.UI.Content.HeaderViewModel} viewmodel.
     * This function is only triggered once, at the very first composition of <i>shell.html</i>.
     * @see {@link module:baseaggregate.activate}.
     * @lifecycle view
     * @return {Promise} resolved when activation is ready.
     */
    activate: function () {
      _logger.LOG_DETAIL &&
        _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE header:activate");
      _headerVM = new Wincor.UI.Content.HeaderViewModel(this);
      _headerVM.lifeCycleMode = base.container.LIFE_CYCLE_MODE.STATIC;
      base.container.add(_headerVM, ["flexHeader"]);
      return base.activate();
    },

    /**
     * Allows the previous object to execute custom deactivation logic.
     * If the previous value can deactivate and the new value can activate, then we call the
     * previous value's deactivate() function, if present.
     * Durandal life-cycle function.
     * Order number 3.
     * @see {@link http://durandaljs.com/documentation/Hooking-Lifecycle-Callbacks.html}
     * @lifecycle view
     */
    deactivate: function () {
      _logger.LOG_DETAIL &&
        _logger.log(_logger.LOG_DETAIL, `* | VIEW_AGGREGATE header:deactivate`);
      if (base.content.designModeExtended) {
        base.viewHelper.styleResolver.removeEventListener(
          _styleEventListenerId
        );
      }
      base.deactivate();
    },

    /**
     * Overridden to set the <i>header</i> view fragment.
     * This function is only triggered once, at the very first composition of <i>shell.html</i>.
     * @param {HTMLElement} view the <i>header</i> view fragment
     * @returns {boolean | Promise}
     * @lifecycle view
     * @return {Promise} resolved when binding is ready.
     */
    binding: async function (view) {
      _logger.LOG_DETAIL &&
        _logger.log(
          _logger.LOG_DETAIL,
          `* | VIEW_AGGREGATE header:binding viewId=${
            view.id
          }, moduleId=${base.system.getModuleId(this)}`
        );
      base.system.setHeader(view);

      /*DNSeries: Video camera stream*/
      if (_isVideoCameraStreamAllowed) {
        _cameraStreamConf = await base.config.retrieveJSONData(
          "VideoCameraStream",
          "../../content/config/"
        );
      }
      return base.binding(view);
    },

    /**
     * Overridden to find the <code>data-dm-available</code> custom attribute and set it true
     * when marketing is available and a softkey based layout is active.
     * @see {@link module:baseaggregate.bindingComplete}.
     * @lifecycle view
     */
    bindingComplete: function (view, parent) {
      _logger.LOG_DETAIL &&
        _logger.log(
          _logger.LOG_DETAIL,
          `* | VIEW_AGGREGATE header:bindingComplete`
        );
      _logger.LOG_INFO &&
        _logger.log(
          _logger.LOG_INFO,
          `* VIEW_AGGREGATE header:bindingComplete - isDirectMarketingAvailable = ${base.config.isDirectMarketingAvailable} SOFTKEY_LIMITATION_ON_ACTIVE_DM = ${base.config.SOFTKEY_LIMITATION_ON_ACTIVE_DM}`
        );
      if (
        base.config.isDirectMarketingAvailable &&
        base.config.SOFTKEY_LIMITATION_ON_ACTIVE_DM
      ) {
        $("[data-view-key]").first().attr({ "data-dm-available": true });
      }
      base.bindingComplete(view, parent);
    },

    /**
     * Overridden to set an effect at the instruction text in order when the view stays on next viewkey and the instruction text changes.
     * @see {@link module:baseaggregate.compositionComplete}.
     * @lifecycle view
     */
    compositionComplete: function (view) {
      _logger.LOG_DETAIL &&
        _logger.log(
          _logger.LOG_DETAIL,
          "* | VIEW_AGGREGATE header:compositionComplete"
        );
      // DNSeries:
      const $header = $("#flexHeader");
      console.log($header);
      const $splitButton = $header.find("#moveSplitScreenPosition");
      let isMoveSplitScreenButtonEnabled = false;
      base.container.whenDeactivated().then(async () => {
        _logger.LOG_INFO &&
          _logger.log(
            _logger.LOG_INFO,
            `* | VIEW_AGGREGATE header:compositionComplete params SPLIT_SCREEN_MODE=${base.config.SPLIT_SCREEN_MODE}, ALLOW_SPLIT_SCREEN_MOVING=${base.config.ALLOW_SPLIT_SCREEN_MOVING}`
          );
        // deactivate split screen in case that some requirements are not fulfilled
        if (
          (base.config.SPLIT_SCREEN_MODE !== SPLIT_SCREEN_MODES[0] &&
            base.config.viewType !== "touch") ||
          window.innerHeight < 1280
        ) {
          base.config.SPLIT_SCREEN_MODE = SPLIT_SCREEN_MODES[0];
          _logger.LOG_INFO &&
            _logger.log(
              _logger.LOG_INFO,
              `* | VIEW_AGGREGATE header:compositionComplete split screen mode has bee set to ${base.config.SPLIT_SCREEN_MODE} due to missing requirements!`
            );
        }
        // EDM: for demo purpose only when the browser window has been resized
        if (base.content.designModeExtended) {
          _styleEventListenerId =
            base.viewHelper.styleResolver.addEventListener(
              async (evtId, data) => {
                if (
                  evtId === base.viewHelper.styleResolver.EVENTS.RESIZE_WINDOW
                ) {
                  if (data.winY === 1280) {
                    base.config.SPLIT_SCREEN_MODE = ORG_SPLIT_MODE_CONFIG;
                  } else {
                    base.config.SPLIT_SCREEN_MODE = SPLIT_SCREEN_MODES[0];
                  }
                  await _self.handleStyleTypeSpecific(true);
                  isMoveSplitScreenButtonEnabled =
                    $splitButton.length &&
                    $splitButton.css("display") !== "none";
                }
              }
            );
        }
        _headerVM.subscribeToObservable(
          base.viewHelper.styleResolver.type,
          async () => {
            await _self.handleStyleTypeSpecific(true);
            isMoveSplitScreenButtonEnabled =
              $splitButton.length && $splitButton.css("display") !== "none";
          }
        );
        await _self.handleStyleTypeSpecific(); // call at start
        isMoveSplitScreenButtonEnabled =
          $splitButton.length && $splitButton.css("display") !== "none";
      });

      /*  const dato = document.getElementById("dato");
      dato.className += "color02";

      let interavalo = setInterval(() => {
        hora = new Date().toLocaleTimeString();
        dato.innerHTML = hora;
      }, 1000);
       */
      // on navigation to same or other view, handle headline & instruction
      const $headlineInstruction = $("#headline, #instruction");
      const $instr = $(view).find("#instruction");
      base.router.on("router:navigation:composition-update").then(() => {
        _logger.LOG_DETAIL &&
          _logger.log(
            _logger.LOG_DETAIL,
            "* | VIEW_AGGREGATE header:compositionComplete->composition update"
          );
        if (base.config.VIEW_ANIMATIONS_ON) {
          // react on view update and add animations to the instruction text line:
          $instr.length && $instr.fadeOut(100).fadeIn(100);
        }
        base.container
          .whenDeactivated()
          .then(() => $headlineInstruction.addClass("disabledElement"));
        base.container
          .whenActivationStarted()
          .then(() => $headlineInstruction.removeClass("disabledElement"));
      });
      base.router.on("router:navigation:complete").then(() => {
        const $video = $("#liveVideo");
        base.container.whenDeactivated().then(() => {
          $headlineInstruction.addClass("disabledElement");
          /*DNSeries: Video camera stream*/
          if (_isVideoCameraStreamAllowed && $video.length) {
            $video.hide("slow");
          }
        });
        base.container.whenActivationStarted().then(() => {
          $headlineInstruction.removeClass("disabledElement");

          /*DNSeries: Video camera stream*/
          if (_isVideoCameraStreamAllowed) {
            let isLive = false;
            if ($video.length) {
              _cameraStreamConf.forEach((cam) => {
                if (
                  cam.stream &&
                  cam.viewKeys.includes(base.container.currentViewKey)
                ) {
                  isLive = true;
                  if (
                    !base.content.designMode &&
                    !base.content.designModeExtended
                  ) {
                    $video.attr("src", cam.stream);
                  } else {
                    $video.attr(
                      "src",
                      "style/default/images/DNSeries/camera_placeholder.svg"
                    );
                  }
                  $video.show();
                }
              });
              if (!isLive) {
                $video.hide();
              }
            }
          }
        });
        //DNSeries: hide/show the move split button for not supported viewkeys
        if (
          isMoveSplitScreenButtonEnabled &&
          SPLIT_MODE_NOT_SUPPORTED_VIEWKEYS.includes(
            base.container.currentViewKey
          )
        ) {
          $splitButton.length && $splitButton.hide();
        } else if (isMoveSplitScreenButtonEnabled) {
          $splitButton.length && $splitButton.show();
        }
      });
    },
  });

  return /** @alias module:header */ _self;
});
