/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ amountentry.js 4.3.1-201021-21-23fb68fb-1a04bc7d

*/
/**
 * The amountentry code-behind provides the life-cycle for the <i>amountentry</i> view.
 * @module amountentry
 * @since 1.0/00
 */
define([
  "jquery",
  "code-behind/baseaggregate",
  "vm/AmountEntryViewModel",
], function (jQuery, base) {
  console.log("AMD:amountentry");

  const _logger = Wincor.UI.Service.Provider.LogProvider;
  let listener1;
  let listener2;

  return /** @alias module:amountentry */ base.extend({
    name: "amountentry",

    /**
     * Instantiates the {@link Wincor.UI.Content.AmountEntryViewModel} viewmodel.
     * @see {@link module:baseaggregate.activate}.
     * @lifecycle view
     * @return {Promise} resolved when activation is ready.
     */
    activate: function () {
      _logger.log(
        _logger.LOG_DETAIL,
        "* | VIEW_AGGREGATE amountentry:activate"
      );
      base.container.add(new Wincor.UI.Content.AmountEntryViewModel(), [
        "flexMain",
      ]);
      return base.activate();
    },

    /**
     * Overridden in order to delete the event listeners, which were registered in compositionComplete.
     * @see {@link module:baseaggregate.deactivate}.
     * @lifecycle view
     */
    deactivate: function () {
      base.deactivate();
      listener1 = null;
      listener2 = null;
    },

    /**
     * If we are in 'softkey' layout in the Basic Design Mode, we have no input possibility,
     * because there is no EPP simulation (like in Extended Desing Mode) and there are no buttons in the view (like in 'touch' layout').
     * <br>
     * Therefore we define some input areas, which react on mouse clicks.
     * Depending on the clicked area, a certain number is simulated.
     * The area, which can be clicked, is not visible!
     * @see {@link module:baseaggregate.compositionComplete}.
     * @lifecycle view
     */
    compositionComplete: function (view, parent) {
      _logger.log(
        _logger.LOG_DETAIL,
        "* | VIEW_AGGREGATE amountentry:compositionComplete"
      );

      // modificaremos el elemento h1 con este bloque de código
      const newElement = document.getElementById("newElement");
      newElement.innerHTML = "VALOR CAMBIADO CON JAVASCRIPT";

      function createNumerFromPos(x, y) {
        let nr = 0;

        /*
                 -----------------
                 | 1 | 2 | 3 | 4 |
                 |----------------
                 | 5 | 6 | 7 | 8 |
                 |----------------
                 | 9 | 0 |
                 |----------------

                 In cell (0, 0) we get number 1.
                 In cell (1, 2) we get number 7.
                 */

        let origin = { x: 63, y: 333 }; //top left (pixels)
        let distance = { x: 100, y: 60 }; //size of cell (pixels)
        let cell = { x: 0, y: 0 }; //chosen cell
        for (let i = 0; i < 4; i++) {
          if (x <= (i + 1) * distance.x + origin.x) {
            cell.x = i;
            break;
          }
        }
        for (let i = 0; i < 3; i++) {
          if (y <= (i + 1) * distance.y + origin.y) {
            cell.y = i;
            break;
          }
        }

        //now match the chosen cell to the number:
        if (cell.x === 0 && cell.y === 0) {
          nr = 1;
        } else if (cell.x === 1 && cell.y === 0) {
          nr = 2;
        } else if (cell.x === 2 && cell.y === 0) {
          nr = 3;
        } else if (cell.x === 3 && cell.y === 0) {
          nr = 4;
        } else if (cell.x === 0 && cell.y === 1) {
          nr = 5;
        } else if (cell.x === 1 && cell.y === 1) {
          nr = 6;
        } else if (cell.x === 2 && cell.y === 1) {
          nr = 7;
        } else if (cell.x === 3 && cell.y === 1) {
          nr = 8;
        } else if (cell.x === 0 && cell.y === 2) {
          nr = 9;
        } // default of nr is 0

        return nr;
      }

      function listenerMain(e) {
        //var number = Math.floor((Math.random() * 10)); //number between 0 and 9
        let number = createNumerFromPos(e.x, e.y);
        console.log(`executing command ${number} event: ${e}`);
        Wincor.UI.Content.Commanding.execute(number.toString());
      }

      function listenerHeader(e) {
        console.log(`executing BACKSPACE event: ${e}`);
        Wincor.UI.Content.Commanding.execute("CORRECT");
      }

      base.container.whenActivated().then(() => {
        // blur focus, TODO why do we do this? Describe this in the 'compositionComplete' JSDoc.
        const $genInput = jQuery("#generalInput");
        $genInput.focus(() => $genInput.blur());
        // input for basic design mode
        if (
          base.content.designMode &&
          base.container.viewHelper.viewType === "softkey"
        ) {
          //We have to work with variables for the listener functions, because we still have to know the context in whenDeactivated.
          //listener1.bind(this) will work in addEventListener(), but then removeEventListener() will not work
          //even if we use '.bind(this)' there. Therefore we have to use variables.
          listener1 = listenerMain.bind(this);
          listener2 = listenerHeader.bind(this);
          //"keypress" does not work, because the input field has no focus and then no key events are triggered
          //Different solution: send random number into the input field:
          jQuery("#flexArticle")[0].addEventListener("click", listener1, false);
          //when clicking on the header, let CORRECT be pressed
          jQuery("#flexHeader")[0].addEventListener("click", listener2, false);
        }
      });

      base.container.whenDeactivated().then(() => {
        if (
          base.content.designMode &&
          base.container.viewHelper.viewType === "softkey"
        ) {
          jQuery("#flexArticle")[0].removeEventListener("click", listener1);
          jQuery("#flexHeader")[0].removeEventListener("click", listener2);
        }
      });

      base.compositionComplete(view, parent);
    },
  });
});
