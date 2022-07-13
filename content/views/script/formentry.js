/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.


$MOD$ formentry.js 4.3.1-201021-21-23fb68fb-1a04bc7d

*/

/**
 * The formentry code-behind provides the life-cycle for the <i>formentry</i> view.
 * @module formentry
 * @since 2.0/00
 */
define(['jquery', 'code-behind/baseaggregate', 'knockout', 'vm/FormEntryViewModel', 'vm-util/VirtualKeyboardViewModel'], function(jQuery, base, ko) {
    console.log("AMD:formentry");

    const _logger = Wincor.UI.Service.Provider.LogProvider;
    let vk, formEntryVM;
    let lastMessageItemId; // contains the item.id of an invalid input field, if an error message is currently shown

    return /** @alias module:formentry */ base.extend({
        name: "formentry",


        /**
         * Is called by compositionComplete() whenever a key is pressed on the hardware keyboard. <BR>
         * The pressed key is appended to the value of the active item.
         * @param {Object} e pressed key
         */
        dispatchKeyDownToInputTarget: function(e) {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `* | VIEW_AGGREGATE formentry:dispatchKeyDownToInputTarget`);

            if ( formEntryVM.activeItem ) {
                let current = formEntryVM.activeItem.value();

                switch (e.key) {
                    case 'Enter':
                        if (formEntryVM.numberOfFields > 1 ) {
                            if (formEntryVM.activeItem) {
                                formEntryVM.activeItem.visualState(0); // set activeItem from pressed to enabled
                                formEntryVM.activeItem = null;
                            }
                            formEntryVM.editMode(false);
                            formEntryVM.onEditModeChanged();
                            formEntryVM.onInputChangedSetButtons();

                            formEntryVM.activeItemId("");

                        } else {
                            if ( formEntryVM.numberOfFields === 1 && formEntryVM.activeItem.successfullyChecked() ) {
                                // 1 input field correctly entered or empty but not mandatory --> leave view
                                Wincor.UI.Content.Commanding.execute("CONFIRM");
                            } else {
                                // stay in Edit Mode --> do nothing
                            }
                        }
                        break;
                    case 'Backspace':
                        if (formEntryVM.activeItem.clearByCorrect) {
                            formEntryVM.activeItem.value("");
                        } else {
                            let actValue = formEntryVM.activeItem.value();
                            let actLen = actValue.length;
                            let correctValue = actValue.substr(0, actLen - 1);
                            formEntryVM.activeItem.value(correctValue);
                        }

                        let newActValue = formEntryVM.activeItem.value();
                        let newActLen = newActValue.length;
                        if (newActLen === 0 && formEntryVM.correctActivated) {
                            formEntryVM.handleCorrectState(false);
                        }

                        break;
                    default:
                        formEntryVM.activeItem.value(current + e.key);
                        if ( formEntryVM.correctActivated === false) {
                            formEntryVM.handleCorrectState(true);
                        }
                        break;
                }
            } else {
                _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `* | VIEW_AGGREGATE formentry:dispatchKeyDownToInputTarget - formEntryVM.activeItem empty`);
            }

        },


        /**
         * Will be called if an input field is selected by pressing the appropriate softkey (onButtonPressed()) or <BR>
         * by touching the input field (compositionComplete()) .<BR>
         * Select mode is left and edit mode is entered.
         * @param {Object} item the actual item
         */
        onEditItemData: function(item) {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `* | VIEW_AGGREGATE formentry:onEditItemData`);

            if (item) {
                formEntryVM.editMode(true);
                formEntryVM.activeItemId(item.id);
                formEntryVM.activeItem = item;
                formEntryVM.cmdRepos.setCmdLabel("INSTRUCTION", item.helpText() === '' ? item.helpTextGeneric() : item.helpText());
                if (item.validationState() === formEntryVM.VALIDATION_STATE.INVALID) {
                    _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `item.id: (${item.id}) messageItemId: (${lastMessageItemId})`);
                    formEntryVM._timerId = base.container.viewModelHelper.startTimer(formEntryVM.messageDelayTimeout).onTimeout(() => {
                        base.container.sendViewModelEvent(base.container.EVENT_ON_MESSAGE_AVAILABLE, {
                            messageText: item.errorText() === '' ? item.errorTextGeneric() : item.errorText(),
                            messageLevel: "WarningBox"
                        });
                        lastMessageItemId = item.id;
                    });


                } else {
                    // remove
                    if (!(lastMessageItemId === "")) {
                        formEntryVM._timerId = base.container.viewModelHelper.startTimer(formEntryVM.messageRemoveTimeout).onTimeout(() => {
                            base.container.sendViewModelEvent(base.container.EVENT_ON_MESSAGE_AVAILABLE, {
                                messageText: "",
                                messageLevel: ""
                            });
                            lastMessageItemId = "";
                        });
                    }
                }
            } else {
                formEntryVM.editMode(false);
                _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `* | VIEW_AGGREGATE formentry:onEditItemData - item empty`);
            }
        },


        /**
         * Will be called if the item's validation state has changed. <BR>
         * @param {Object} item the actual item
         * @param {ko.observable<String>} [validationState=null] possible values: "invalid", "valid" or "empty"
         */
        onValidationStateChanged: function(item, validationState=null) {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `* | VIEW_AGGREGATE formentry:onValidationStateChanged`);
            let valState = validationState || (item && item.validationState);
            if (item) {
                if (valState() === formEntryVM.VALIDATION_STATE.INVALID) {
                    this.onInvalidItemData(item);
                } else if (valState() === formEntryVM.VALIDATION_STATE.VALID) {
                    this.onValidItemData(item);
                } else if (valState() === formEntryVM.VALIDATION_STATE.EMPTY) {
                    this.onEmptyItemData(item);
                } else {
                    _logger.error(`* | VIEW_AGGREGATE formentry:onValidationStateChanged - unexpected value for validationState(): ${validationState()}`);
                }
            } else {
                _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `* | VIEW_AGGREGATE formentry:onValidationStateChanged - item empty`);
            }

        },

        resetLastMessageItemId: function() {
            lastMessageItemId = "";
        },

        /**
         * Will be called by onValidationStateChanged() in case of an invalid value. <BR>
         * in order to display an error message and to deactivate the Confirm button.
         * @param {Object} item the actual item
         */
        onInvalidItemData: function(item) {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `* | VIEW_AGGREGATE formentry:onInvalidItemData`);

            if ( item ) {
                if (vk.isVisible() ||
                    ( base.container.viewHelper.viewType === "softkey" && item === formEntryVM.activeItem )) {
                    _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `* | VIEW_AGGREGATE formentry:onInvalidItemData: vk is visible`);
                    if (!(item.id === lastMessageItemId)) {
                        _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `item.id: (${item.id}) messageItemId: (${lastMessageItemId})` );
                        formEntryVM._timerId = base.container.viewModelHelper.startTimer(formEntryVM.messageDelayTimeout).onTimeout(() => {
                            base.container.sendViewModelEvent(base.container.EVENT_ON_MESSAGE_AVAILABLE, {
                                messageText: (item.errorText() === '') ? item.errorTextGeneric() : item.errorText() ,
                                messageLevel: "WarningBox"
                            });
                            lastMessageItemId = item.id;
                        });
                        formEntryVM.activateConfirm (false);
                        formEntryVM.speakErrorText(true);
                    }
                }
            } else {
                _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `* | VIEW_AGGREGATE formentry:onInvalidItemData - item empty`);
            }
        },

        /**
         * Will be called by onValidationStateChanged() in case of a valid value <BR>
         * in order to remove an error message (which may be displayed).
         * @param {Object} item the actual item
         */
        onValidItemData: function(item) {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `* | VIEW_AGGREGATE formentry:onValidItemData`);

            if ( item ) {
                if (!(lastMessageItemId === "")) {
                    formEntryVM._timerId = base.container.viewModelHelper.startTimer(formEntryVM.messageRemoveTimeout).onTimeout(() => {
                        base.container.sendViewModelEvent(base.container.EVENT_ON_MESSAGE_AVAILABLE, {
                            messageText: "",
                            messageLevel: ""
                        });
                        lastMessageItemId = "";
                    });
                    formEntryVM.speakErrorText(false);
                }
            } else {
                _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `* | VIEW_AGGREGATE formentry:onValidItemData - item empty`);
            }

        },

        /**
         * Will be called by onValidationStateChanged() in case of an empty value <BR>
         * in order to display an error message.
         * @param {Object} item the actual item
         */
        onEmptyItemData: function(item) {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `* | VIEW_AGGREGATE formentry:onEmptyItemData`);

            if ( item ) {
                if (( vk.isVisible() ||
                    ( base.container.viewHelper.viewType === "softkey" && item === formEntryVM.activeItem ) ) && !(item.id === lastMessageItemId ) && item.mandatory && item.value() === "") {
                    _logger.log(_logger.LOG_DETAIL, `item.id: (${item.id}) messageItemId: (${lastMessageItemId})` );
                    formEntryVM._timerId = base.container.viewModelHelper.startTimer(formEntryVM.messageDelayTimeout).onTimeout(() => {
                        base.container.sendViewModelEvent(base.container.EVENT_ON_MESSAGE_AVAILABLE, {
                            messageText: (item.errorText() === '') ? item.errorTextGeneric() : item.errorText() ,
                            messageLevel: "WarningBox"
                        });
                        lastMessageItemId = item.id;
                    });
                    formEntryVM.speakErrorText(false);
                }
            } else {
                _logger.LOG_DETAIL &&  _logger.log(_logger.LOG_DETAIL, `* | VIEW_AGGREGATE formentry:onEmptyItemData - item empty`);
            }
        },

        /**
         * Will be called by activate() if the VK is called <BR>
         * in order to delete the confirm message.
         * @param {Object} args provided by the vk to indicate its visibility: "hidden" or "visible"
         */
        vkStateChangedHandler: function  (args){
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `* | VIEW_AGGREGATE formentry:vkStateChangeHandler: ${args.visibility}`);

            if (formEntryVM) {
                // delete ConfirmText in EditMode
                if (args.visibility !== "hidden" && formEntryVM.activateConfirm()) {

                    base.container.sendViewModelEvent(base.container.EVENT_ON_MESSAGE_AVAILABLE, {
                        messageText: "",
                        messageLevel: ""
                    });
                }

                // clear timeout of error text messages, whenever the keyboard is hidden
                // but not if the Confirm message is to be shown
                if (args.visibility === "hidden" && !(formEntryVM.activateConfirm)) {
                    clearTimeout(formEntryVM._timerId); // clear possible old timer
                }
            }
        },

        /**
         * Instantiates the {@link Wincor.UI.Content.FormEntryViewModel} viewmodel.
         * @see {@link module:baseaggregate.activate}.
         * @lifecycle view
         * @return {Promise} resolved when activation is ready.
         */
        activate: function() {
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `* | VIEW_AGGREGATE formentry:activate`);

            lastMessageItemId = "";
            formEntryVM = new Wincor.UI.Content.FormEntryViewModel();
            base.container.add(formEntryVM, ["flexMain", base.config.viewType === "softkey" ? {visibleLimits: {max: 8}} : void 0]);

            vk = new Wincor.UI.Content.VirtualKeyboardViewModel();

            base.container.add(vk, {
                inputType2Layout: {
                    "amount": "NUMPAD",
                    "number": "NUMPAD",
                    "numeric": "NUMPAD"
                },
                useAppOverlay: false,
                styleAppContentClass: "hideFlexMainOnActiveVK",
                stateChangedHandler: this.vkStateChangedHandler,

                getSourceObservable: elemId => {
                    return ko.contextFor(jQuery(elemId)[0]).item.value;
                },
                getTargetObservable: elemId => {
                    return ko.contextFor(jQuery(elemId)[0]).item.formattedValue;
                },
                getDataValidObservable: elemId => {
                    return ko.contextFor(jQuery(elemId)[0]).item.validationState;
                },
                onFocusInHandler: event => {
                    if (event.target.id === "generalVKInput") {
                        // user selected/touched the mirror input element... just blur it, formatted values can't get edited properly if cursor is not at the end...
                        event.target.blur();
                        return true; // return handled, so default focus stuff is not done
                    }
                },
                enterCallback: value => {

                    if (formEntryVM.numberOfFields > 1) {
                        clearTimeout(formEntryVM._timerId); // clear possible old timer
                        formEntryVM.activeItemId("");
                        if (formEntryVM.activeItem) {
                            formEntryVM.activeItem.visualState(0); // set activeItem from pressed to enabled
                            formEntryVM.activeItem = null;
                        }
                        formEntryVM.editMode(false);
                        formEntryVM.onEditModeChanged();
                        formEntryVM.onInputChangedSetButtons();
                    } else {

                        if (formEntryVM.numberOfFields === 1 && formEntryVM.activeItem.validationState() !== formEntryVM.VALIDATION_STATE.VALID) {
                            // vk is not to be hidden in case of 1 input field
                            Wincor.UI.Content.Commanding.execute("CONFIRM");
                            return true;

                        } else { // 1 input field and valdiationState() === valid
                            clearTimeout(formEntryVM._timerId); // clear possible old timer
                            formEntryVM.activeItemId("");
                            Wincor.UI.Content.Commanding.execute("CONFIRM");
                        }
                    }
                }
            });

            return base.activate();
        },

        /**
         * Shows the VK dependent on the type of the active item. <BR>
         * In case of type "number, "numeric" or "amount" the numeric layout will be displayed instead of the alphanumeric layout. <BR>
         */
        showVK: function () {

            if (formEntryVM.activeItem.type === formEntryVM.ITEM_TYPE.NUMBER ||
                formEntryVM.activeItem.type === formEntryVM.ITEM_TYPE.NUMERIC ||
                formEntryVM.activeItem.type === formEntryVM.ITEM_TYPE.AMOUNT) {

                vk.activateLayout('NUMPAD');
            }
            vk.show();
        },
    
        /**
         * Overridden to set all references to null and to deregister the keypress event listener.
         * @see {@link module:baseaggregate.deactivate}.
         * @lifecycle view
         */
        deactivate: function() {
            vk = null;

            // clear timeout of error text messages, whenever the keyboard is hidden
            // but not if the Confirm message is to be shown
            if (!(formEntryVM.activateConfirm)) {
                clearTimeout(formEntryVM._timerId); // clear possible old timer
            }

            formEntryVM = null;
            lastMessageItemId = "";

            jQuery("body").off ('keypress');

        },

        /**
         * Overridden to call onEditItemData() if an input field is touched and <br>
         * to call dispatchKeyDownToInputTarget() in case of a key entry via the hardware keyboard.
         * @see {@link module:baseaggregate.compositionComplete}.
         * @lifecycle view
         */
        compositionComplete: function(view, parent) {
            const self = this;
            _logger.LOG_DETAIL && _logger.log(_logger.LOG_DETAIL, `* | VIEW_AGGREGATE formentry:compositionComplete`);

            let editItem = function() {
                let item = ko.contextFor(jQuery(this)[0]).item;
                self.onEditItemData(item);
            };

            let checkSpecialCharCodes = function (e) {
                const SPECIAL_CHAR_CODES = [8, 37, 38, 39, 40]; // cursor and backspace have to be dispatched manually

                if (SPECIAL_CHAR_CODES.includes(e.keyCode)) {
                    self.dispatchKeyDownToInputTarget(e);
                }
            };

            base.container.whenActivated().then(function() {

                 base.container.whenDeactivated().then(() => {
                    jQuery(".generalInput")
                        .off('focus', editItem);
                    jQuery("body")
                        .off('keydown', checkSpecialCharCodes);

                });

                jQuery(".generalInput")
                    .on('focus', editItem);


                jQuery("body")
                    .on('keypress', self.dispatchKeyDownToInputTarget)
                    .on('keydown', checkSpecialCharCodes);


                if(base.container.viewHelper.viewType === "softkey") {
                    // initialize slide indicator for a the slide indicator group (optional)
                    base.container.viewHelper.moveSlideIndicator(0);
                }

            });

            base.compositionComplete(view, parent);
        }

    });
});

