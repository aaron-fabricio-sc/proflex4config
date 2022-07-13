/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ VirtualKeyboardKeyCodes.js 4.3.1-201021-21-23fb68fb-1a04bc7d
 */

/**
 * The VirtualKeyboardKeyCodes module loads a language depended <i>../../content/config/vk_....json</i> json file with key codes for the virtual keyboard.
 * @module VirtualKeyboardKeyCodes
 * @since 1.0/00
 */
define(["jquery", "extensions"], function(jQuery, ext) {
    //"use strict";

    // contains the keyboard-code and layouts

    // Special configuration options for keycodes
    // SINGLE KEYCODE
    // -1 -> disabled, otherwise a single character, a string, an array of chars or an array of keycodes can be configured
    // -2 -> hidden
    // KEY WITH POPUP OPTIONS
    // object containing one key (used as main caption for the button) and value(s) for the popup
    const KEYMAPPINGS = {
    };

    return /** @alias module:VirtualKeyboardKeyCodes */ {
        /**
         * Loads a language specific keycode table.
         * @param {string} language The ISO language code of the key-code table to be loaded. Default is 'en-US'
         * @async
         * @return {Promise.<Object.<KEYMAPPINGS, Object>>}
         */
        loadLayout: function(language) {
            return ext.Promises.promise(function(resolve, reject) {
                if(language === void 0) {
                    language = "en-us";
                }
                else {
                    language = language.toLowerCase();
                }

                let fileName = "../../content/config/vk_" + language + ".json";
                jQuery.getJSON(fileName, function(layout) {
                    KEYMAPPINGS[language] = layout;
                    resolve({KEYMAPPINGS: KEYMAPPINGS});
                }).fail((jqxhr, textStatus, error) => {
                    if (KEYMAPPINGS["en-us"]) {
                        KEYMAPPINGS[language] = KEYMAPPINGS["en-us"];
                        resolve({KEYMAPPINGS: KEYMAPPINGS});
                    } else {
                        reject(`Could not load ${fileName} ${textStatus}, ${error}`);
                    }
                });
            });
        },

        /**
         * The key mappings for the virtual keyboard.
         * This mapping is used by the {@link Wincor.UI.Content.VirtualKeyboardViewModel}
         * @type {Object}
         * @see Contents of e.g. file GUIAPP\content\config\vk_en-us.json
         *
         */
        KEYMAPPINGS: KEYMAPPINGS
    };
});