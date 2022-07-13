/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ ViewHelper_test.js 4.3.1-210624-21-ae6e96c6-1a04bc7d

*/

define(["lib/Squire"], function (Squire) {
  let injector;
  let ko;
  let Wincor;
  let jQuery;

  describe("ViewHelper", () => {
    beforeEach((done) => {
      injector = new Squire();
      injector.require(["NamespaceMock"], (bundle) => {
        Wincor = window.Wincor = bundle.createWincor();
        ko = Wincor.ko = window.ko = bundle.ko;
        jQuery = window.jQuery = bundle.jQuery;
        injector.mock("vm-util/UICommanding", Wincor.UI.Content.Commanding);
        [
          "plugins/router",
          "durandal/viewLocator",
          "plugins/dialog",
          "ui-content",
          "config/Config",
        ].forEach((dependency) => {
          injector.store(dependency).mock(dependency, {});
        });

        injector
          .mock("jquery", jQuery)
          .mock("extensions", bundle.ext)
          .mock("knockout", ko)
          .mock("durandal/viewLocator", {
            useConvention: jasmine.createSpy("useConvention"),
          })
          .mock("plugins/dialog", {
            close: jasmine.createSpy("close"),
          });
        done();
      });
    });

    afterEach(() => {
      injector.remove();
    });

    describe("commandAutomation", () => {
      ["touch", "softkey"].forEach((viewSet) => {
        it(`adds eppkey to event with viewset ${viewSet}`, (done) => {
          const SAMPLE_EVENT = {
            target: {},
          };
          const EPP_KEY = "F1";
          const $FAKE_BODY = jQuery("<body>");
          $FAKE_BODY.append("<div>");
          const $FAKE_ELEM = $FAKE_BODY.find("div");
          $FAKE_ELEM[0].id = "BUTTON_FAKE";
          spyOn(jQuery.fn, "find").and.callFake((arg) => {
            if (arg === "body") {
              return $FAKE_BODY;
            }
            return {};
          });
          Wincor.UI.Content.Commanding.getCommandByElementId = jasmine
            .createSpy("")
            .and.returnValue({
              isActive: {
                value: () => true,
              },
              element: $FAKE_ELEM[0],
              delegates: {
                handlers: {
                  tap: (evt) => {
                    expect(evt.eppKey).toBe(EPP_KEY);
                    done();
                  },
                },
              },
            });
          injector.require(
            ["GUIAPP/content/views/script/ViewHelper", "mocks"],
            (viewHelper, mocks) => {
              let config = mocks.store["config/Config"];
              config.viewType = viewSet;
              config.COMMAND_AUTOMATION_DURATION = 1;
              spyOn(window, "setTimeout").and.callFake((cb, time) => {
                expect(time === config.COMMAND_AUTOMATION_DURATION).toBe(true);
                cb();
                // NOTE: $(`#${$elem[0].id}`) currently not delivers our fake element and thus removeClass is not reached
              });
              viewHelper.commandAutomation("TEST_ID", SAMPLE_EVENT, EPP_KEY);
              expect(SAMPLE_EVENT.eppKey).toBeDefined();
              expect(SAMPLE_EVENT.eppKey).toEqual(EPP_KEY);
            }
          );
        });

        it(`generates event on softkey press with viewset ${viewSet}`, (done) => {
          const EPP_KEY = "F1";
          const $FAKE_BODY = jQuery("<body>");
          $FAKE_BODY.append("<div>");
          const $FAKE_ELEM = $FAKE_BODY.find("div");
          $FAKE_ELEM[0].id = "BUTTON_FAKE";
          spyOn(jQuery.fn, "find").and.callFake((arg) => {
            if (arg === "body") {
              return $FAKE_BODY;
            }
            return {};
          });
          Wincor.UI.Content.Commanding.getCommandByElementId = jasmine
            .createSpy("")
            .and.returnValue({
              isActive: {
                value: () => true,
              },
              element: $FAKE_ELEM[0],
              delegates: {
                handlers: {
                  tap: (evt) => {
                    expect(evt.eppKey).toBeDefined();
                    expect(evt.target).toBeDefined();
                    expect(evt.center).toBeDefined();
                    expect(evt.center.x).toBeDefined();
                    expect(evt.center.y).toBeDefined();
                    expect(evt.eppKey).toEqual(EPP_KEY);
                    done();
                  },
                },
              },
            });
          injector.require(
            ["GUIAPP/content/views/script/ViewHelper", "mocks"],
            (viewHelper, mocks) => {
              mocks.store["config/Config"].viewType = viewSet;
              viewHelper.commandAutomation("TEST_ID", void 0, EPP_KEY);
            }
          );
        });
      });
    });

    describe("general", () => {
      it("supports functions by jquery event triggers", (done) => {
        injector.require(
          ["GUIAPP/content/views/script/ViewHelper"],
          (viewHelper) => {
            const eventObject = {};
            viewHelper.setEvent(eventObject);

            [
              "commandAutomation",
              "showPopupHint",
              "showPopupMessage",
              "removePopup",
              "hidePopupMessage",
            ].forEach((fx) => {
              spyOn(viewHelper, fx);
            });

            const DATA = {
              object: "data",
              msg: "myMessage",
              type: "type",
              id: "MY_ID",
              callback: () => {
                //nop
              },
              component: "myComponent",
            };
            jQuery(eventObject).trigger("uicommandautomation", DATA);
            expect(viewHelper.commandAutomation).toHaveBeenCalledWith(
              DATA.object,
              void 0,
              void 0
            );
            jQuery(eventObject).trigger("uipopuphint", DATA);
            expect(viewHelper.showPopupHint).toHaveBeenCalledWith(
              DATA.msg,
              DATA.type,
              DATA.id,
              DATA.callback
            );
            jQuery(eventObject).trigger("uipopupmessage", DATA);
            expect(viewHelper.showPopupMessage).toHaveBeenCalledWith(
              DATA.component,
              DATA.callback
            );
            jQuery(eventObject).trigger("uiremovepopup", DATA);
            expect(viewHelper.removePopup).toHaveBeenCalledWith(DATA);
            jQuery(eventObject).trigger("uiremovepopupmessage", DATA);
            expect(viewHelper.hidePopupMessage).toHaveBeenCalledWith(DATA);

            done();
          },
          done.fail
        );
      });

      it("implements a default alphanumericInputHandler", (done) => {
        injector.require(
          ["knockout", "GUIAPP/content/views/script/ViewHelper"],
          (ko, viewHelper) => {
            expect(typeof viewHelper.alphanumericInputHandler).toBe("function");
            // install fake timer
            jasmine.clock().install();

            spyOn(viewHelper, "showPopupHint");
            spyOn(viewHelper, "removePopup").and.callFake((data) => {
              if (data.callback) {
                expect(data.callback).not.toThrow();
              }
            });

            const event = {
              type: "keypress",
              eppkey: ["1"],
              charIdx: 0,
              confArray: ["1", "A", "B"],
              observable: ko.observable(""),
              timeout: 0, // will be reset to 1000
            };

            // the handler will pass the entered character to the observable after 1 sec
            expect(
              viewHelper.alphanumericInputHandler.bind(viewHelper, event)
            ).not.toThrow();
            expect(viewHelper.showPopupHint).toHaveBeenCalled();
            jasmine.clock().tick(500);
            expect(event.observable()).toEqual("");
            expect(viewHelper.removePopup).not.toHaveBeenCalled();
            jasmine.clock().tick(501);
            expect(event.observable()).toEqual(["1"]); // because of charIdx 0 of confArray
            expect(viewHelper.removePopup).toHaveBeenCalled();

            // move on to B
            expect(
              viewHelper.alphanumericInputHandler.bind(viewHelper, event)
            ).not.toThrow();
            jasmine.clock().tick(100);
            event.charIdx = 2; // charIdx of confArray
            expect(viewHelper.alphanumericInputHandler(event)).toBe(true);
            jasmine.clock().tick(1000);
            expect(event.observable()).toEqual(["B"]); // because of charIdx 0 of confArray
            expect(viewHelper.removePopup).toHaveBeenCalledTimes(2);

            jasmine.clock().uninstall();
            done();
          },
          done.fail
        );
      });

      it("checks initScrollbarButtons(false, true, false)", (done) => {
        const element = { id: "test" };

        injector.require(
          ["GUIAPP/content/views/script/ViewHelper"],
          (viewHelper) => {
            Wincor.UI.Content.Commanding.getBoundElement = (id) => {
              return element;
            };

            Wincor.UI.Content.Commanding.get = (id) => {
              return {
                initialViewState: 3,
              };
            };

            spyOn(jQuery.fn, "show");
            spyOn(jQuery.fn, "hide");
            spyOn(Wincor.UI.Content.Commanding, "setVisible");
            spyOn(Wincor.UI.Content.Commanding, "setActive");
            spyOn(Wincor.UI.Content.Commanding, "whenAvailable").and.callFake(
              () => {
                return {
                  then: (fx) => {
                    fx(); // this calls the original anonymous function of the initScrollbarButtons-> commanding.whenAvailable([CMD_SCROLL_DOWN, CMD_SCROLL_UP]).then(() => {}
                    expect(jQuery.fn.show).toHaveBeenCalledTimes(2);
                    expect(
                      Wincor.UI.Content.Commanding.setActive
                    ).toHaveBeenCalledWith("BTN_SCROLL_UP", false);
                    expect(
                      Wincor.UI.Content.Commanding.setActive
                    ).toHaveBeenCalledWith("BTN_SCROLL_DOWN", true);
                    done();
                  },
                };
              }
            );

            viewHelper.initScrollbarButtons(false, true, false, {
              isGenericListMode: true,
            });
          },
          done.fail
        );
      });

      it("checks initScrollbarButtons(true, true, false)", (done) => {
        const element = { id: "test" };

        injector.require(
          ["GUIAPP/content/views/script/ViewHelper"],
          (viewHelper) => {
            Wincor.UI.Content.Commanding.getBoundElement = (id) => {
              return element;
            };
            Wincor.UI.Content.Commanding.get = (id) => {
              return {
                initialViewState: 3,
              };
            };

            spyOn(jQuery.fn, "show");
            spyOn(jQuery.fn, "hide");
            spyOn(Wincor.UI.Content.Commanding, "setVisible");
            spyOn(Wincor.UI.Content.Commanding, "setActive");
            spyOn(Wincor.UI.Content.Commanding, "whenAvailable").and.callFake(
              () => {
                return {
                  then: (fx) => {
                    fx(); // this calls the original anonymous function of the initScrollbarButtons-> commanding.whenAvailable([CMD_SCROLL_DOWN, CMD_SCROLL_UP]).then(() => {}
                    expect(jQuery.fn.show).toHaveBeenCalledTimes(2);
                    expect(
                      Wincor.UI.Content.Commanding.setActive
                    ).toHaveBeenCalledWith("BTN_SCROLL_UP", false);
                    expect(
                      Wincor.UI.Content.Commanding.setActive
                    ).toHaveBeenCalledWith("BTN_SCROLL_DOWN", true);
                    done();
                  },
                };
              }
            );

            viewHelper.initScrollbarButtons(true, true, false, {
              isGenericListMode: true,
            });
          },
          done.fail
        );
      });

      it("checks initScrollbarButtons(false, false, false)", (done) => {
        const element = { id: "test" };

        injector.require(
          ["GUIAPP/content/views/script/ViewHelper"],
          (viewHelper) => {
            Wincor.UI.Content.Commanding.getBoundElement = (id) => {
              return element;
            };
            Wincor.UI.Content.Commanding.get = (id) => {
              return {
                initialViewState: 3,
              };
            };
            Wincor.UI.Content.Commanding.CMDSTATES = {
              DISABLED: 2,
            };

            spyOn(jQuery.fn, "show");
            spyOn(jQuery.fn, "hide");
            spyOn(Wincor.UI.Content.Commanding, "setVisible");
            spyOn(Wincor.UI.Content.Commanding, "setActive");
            spyOn(Wincor.UI.Content.Commanding, "whenAvailable").and.callFake(
              () => {
                return {
                  then: (fx) => {
                    fx(); // this calls the original anonymous function of the initScrollbarButtons-> commanding.whenAvailable([CMD_SCROLL_DOWN, CMD_SCROLL_UP]).then(() => {}
                    expect(
                      Wincor.UI.Content.Commanding.setVisible
                    ).toHaveBeenCalledWith(
                      ["BTN_SCROLL_DOWN", "BTN_SCROLL_UP"],
                      false
                    );
                    expect(jQuery.fn.hide).toHaveBeenCalledTimes(2);
                    done();
                  },
                };
              }
            );

            viewHelper.initScrollbarButtons(false, false, false, {
              isGenericListMode: true,
            });
          },
          done.fail
        );
      });

      it("checks initScrollbarButtons(false, false, true)", (done) => {
        const element = { id: "test" };

        injector.require(
          ["GUIAPP/content/views/script/ViewHelper"],
          (viewHelper) => {
            Wincor.UI.Content.Commanding.getBoundElement = (id) => {
              return element;
            };
            Wincor.UI.Content.Commanding.get = (id) => {
              return {
                initialViewState: 3,
              };
            };
            Wincor.UI.Content.Commanding.CMDSTATES = {
              DISABLED: 2,
            };

            spyOn(jQuery.fn, "show");
            spyOn(jQuery.fn, "hide");
            spyOn(Wincor.UI.Content.Commanding, "setVisible");
            spyOn(Wincor.UI.Content.Commanding, "setActive");
            spyOn(Wincor.UI.Content.Commanding, "whenAvailable").and.callFake(
              () => {
                return {
                  then: (fx) => {
                    fx(); // this calls the original anonymous function of the initScrollbarButtons-> commanding.whenAvailable([CMD_SCROLL_DOWN, CMD_SCROLL_UP]).then(() => {}
                    expect(
                      Wincor.UI.Content.Commanding.setActive
                    ).toHaveBeenCalledWith("BTN_SCROLL_UP", true);
                    expect(jQuery.fn.show).toHaveBeenCalledTimes(1);

                    expect(
                      Wincor.UI.Content.Commanding.setVisible
                    ).toHaveBeenCalledWith("BTN_SCROLL_DOWN", false);
                    done();
                  },
                };
              }
            );

            viewHelper.initScrollbarButtons(false, false, true, {
              isGenericListMode: true,
            });
          },
          done.fail
        );
      });
    });

    describe("popup functions", () => {
      it("checks hidePopupMessage using showPopupMessage", async () => {
        Wincor.UI.Content.ViewHelper.setEvent = jasmine.createSpy("setEvent");
        let result = await injector.require([
          "GUIAPP/content/views/script/ViewHelper",
          "mocks",
        ]);
        let viewHelper = result[0];
        let mocks = result[1];
        spyOn(window, "require").and.callFake((module, cb) => {
          cb({});
        });
        mocks.mocks["config/Config"].modulesPath = "myPath/";
        mocks.mocks["plugins/dialog"].show = jasmine
          .createSpy("show")
          .and.returnValue(Promise.resolve());
        viewHelper.showPopupMessage("popup.component.html");
        const data = { result: {} };
        let hidePromise = viewHelper.hidePopupMessage(data);
        expect(data.result.promise === hidePromise).toBe(true);
        expect(mocks.mocks["plugins/dialog"].show).toHaveBeenCalledTimes(1);
        expect(mocks.mocks["plugins/dialog"].close).toHaveBeenCalledTimes(1);
        await hidePromise;
        expect(
          mocks.mocks["durandal/viewLocator"].useConvention
        ).toHaveBeenCalledTimes(2);
      });
    });

    describe("SVG inline handling", () => {
      it("checks singleBillSymbol", async () => {
        let result = await injector.require([
          "GUIAPP/content/views/script/ViewHelper",
          "mocks",
        ]);
        let viewHelper = result[0];
        const rootCtx = {
          bankingContext: {
            currencyData: {
              iso: "EUR",
              text: "Euro",
              adaText: "Euro",
              symbol: "€",
              exponent: "-2",
            },
          },
        };
        const elm = jQuery(
          `<svg data-item-value="10000"><text id="noteValueLeft"></text><text id="noteValueRight"></text><text id="currencySymbol"></text></svg>`
        )[0];
        viewHelper.singleBillSymbol(elm, rootCtx);
        expect(elm.getElementById("noteValueLeft").textContent).toBe("100");
        expect(elm.getElementById("noteValueRight").textContent).toBe("100");
        expect(elm.getElementById("currencySymbol").textContent).toBe("€");
      });
    });

    describe("Border drawing", () => {
      it("checks .prepare", async () => {
        let result = await injector.require([
          "GUIAPP/content/views/script/ViewHelper",
          "mocks",
        ]);
        let viewHelper = result[0];
        let mocks = result[1];
        mocks.mocks["config/Config"].VIEW_ANIMATIONS_ON = true;
        mocks.mocks["config/Config"].BORDER_DRAWING_ON = true;
        const elm = jQuery(`<main><div class="borderDrawing"></div></main>`)[0];
        const button = elm.getElementsByClassName("borderDrawing")[0];
        viewHelper.borderDrawing.prepare(elm);
        expect(button.style.opacity).toBe("0");
      });

      it("checks .prepare not disabled", async () => {
        let result = await injector.require([
          "GUIAPP/content/views/script/ViewHelper",
          "mocks",
        ]);
        let viewHelper = result[0];
        let mocks = result[1];
        mocks.mocks["config/Config"].VIEW_ANIMATIONS_ON = true;
        mocks.mocks["config/Config"].BORDER_DRAWING_ON = true;
        const elm = jQuery(
          `<main><div class="borderDrawing" disabled="disabled"></div></main>`
        )[0];
        const button = elm.getElementsByClassName("borderDrawing")[0];
        viewHelper.borderDrawing.prepare(elm);
        expect(button.style.opacity).toBe("");
      });

      it("checks .prepare not hidden", async () => {
        let result = await injector.require([
          "GUIAPP/content/views/script/ViewHelper",
          "mocks",
        ]);
        let viewHelper = result[0];
        let mocks = result[1];
        mocks.mocks["config/Config"].VIEW_ANIMATIONS_ON = true;
        mocks.mocks["config/Config"].BORDER_DRAWING_ON = true;
        const elm = jQuery(`<main><div class="borderDrawing"></div></main>`)[0];
        const button = elm.getElementsByClassName("borderDrawing")[0];
        button.style.visibility = "hidden";
        viewHelper.borderDrawing.prepare(elm);
        expect(button.style.opacity).toBe("");
      });

      it("checks .prepare not display=none", async () => {
        let result = await injector.require([
          "GUIAPP/content/views/script/ViewHelper",
          "mocks",
        ]);
        let viewHelper = result[0];
        let mocks = result[1];
        mocks.mocks["config/Config"].VIEW_ANIMATIONS_ON = true;
        mocks.mocks["config/Config"].BORDER_DRAWING_ON = true;
        const elm = jQuery(`<main><div class="borderDrawing"></div></main>`)[0];
        const button = elm.getElementsByClassName("borderDrawing")[0];
        button.style.display = "none";
        viewHelper.borderDrawing.prepare(elm);
        expect(button.style.opacity).toBe("");
      });

      it("checks .draw", async () => {
        let result = await injector.require([
          "GUIAPP/content/views/script/ViewHelper",
          "mocks",
        ]);
        let viewHelper = result[0];
        let mocks = result[1];
        mocks.mocks["config/Config"].VIEW_ANIMATIONS_ON = true;
        mocks.mocks["config/Config"].BORDER_DRAWING_ON = true;
        mocks.mocks["config/Config"].BUTTON_FADE_IN_TIME = 150;
        const $elm = jQuery(
          `<main><div class="borderDrawing"></div><footer id="flexFooter"></footer></main>`
        );
        viewHelper.borderDrawing.draw($elm[0]);
        expect($elm.find(".borderDrawingShield").length).toBe(1);
      });

      it("checks .draw not disabled", async () => {
        let result = await injector.require([
          "GUIAPP/content/views/script/ViewHelper",
          "mocks",
        ]);
        let viewHelper = result[0];
        let mocks = result[1];
        mocks.mocks["config/Config"].VIEW_ANIMATIONS_ON = true;
        mocks.mocks["config/Config"].BORDER_DRAWING_ON = true;
        mocks.mocks["config/Config"].BUTTON_FADE_IN_TIME = 150;
        const $elm = jQuery(
          `<main><div class="borderDrawing" disabled="disabled"></div><footer id="flexFooter"></footer></main>`
        );
        viewHelper.borderDrawing.draw($elm[0]);
        expect($elm.find(".borderDrawingShield").length).toBe(0);
      });

      it("checks .draw not hidden", async () => {
        let result = await injector.require([
          "GUIAPP/content/views/script/ViewHelper",
          "mocks",
        ]);
        let viewHelper = result[0];
        let mocks = result[1];
        mocks.mocks["config/Config"].VIEW_ANIMATIONS_ON = true;
        mocks.mocks["config/Config"].BORDER_DRAWING_ON = true;
        mocks.mocks["config/Config"].BUTTON_FADE_IN_TIME = 150;
        const $elm = jQuery(
          `<main><div class="borderDrawing"></div><footer id="flexFooter"></footer></main>`
        );
        $elm.find(".borderDrawing")[0].style.visibility = "hidden";
        viewHelper.borderDrawing.draw($elm[0]);
        expect($elm.find(".borderDrawingShield").length).toBe(0);
      });

      it("checks .draw not display=none", async () => {
        let result = await injector.require([
          "GUIAPP/content/views/script/ViewHelper",
          "mocks",
        ]);
        let viewHelper = result[0];
        let mocks = result[1];
        mocks.mocks["config/Config"].VIEW_ANIMATIONS_ON = true;
        mocks.mocks["config/Config"].BORDER_DRAWING_ON = true;
        mocks.mocks["config/Config"].BUTTON_FADE_IN_TIME = 150;
        const $elm = jQuery(
          `<main><div class="borderDrawing"></div><footer id="flexFooter"></footer></main>`
        );
        $elm.find(".borderDrawing")[0].style.display = "none";
        viewHelper.borderDrawing.draw($elm[0]);
        expect($elm.find(".borderDrawingShield").length).toBe(0);
      });
    });
  });
});
