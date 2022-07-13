/**
 @preserve
 Copyright (c) 2001-2020 by Wincor Nixdorf International GmbH,
 Heinz-Nixdorf-Ring 1, 33106 Paderborn, Germany

 This software is the confidential and proprietary information
 of Diebold Nixdorf.
 You shall not disclose such Confidential Information and shall
 use it only in accordance with the terms of the license agreement
 you entered into with Diebold Nixdorf.



$MOD$ checkboxes.js 4.3.1-201021-21-23fb68fb-1a04bc7d
 */

/**
 * The checkboxes code-behind provides the life-cycle for the <i>checkboxes</i> view.
 * @module checkboxes
 * @since 1.1/01
 */
define(['knockout', 'code-behind/baseaggregate', 'vm/CheckBoxesViewModel', 'vm-util/VirtualKeyboardViewModel'], function(ko, base) {
    console.log("AMD:checkboxes");

    const _logger = Wincor.UI.Service.Provider.LogProvider;
    const _localizeService = Wincor.UI.Service.Provider.LocalizeService;
    
    let vk;
    let checkboxesViewModel;

    // we return those to the VK... switching items will also change these references
    let _src;
    let _valid;
    let _tgt;
    let lastMessageText = "";

    return /** @alias module:checkboxes */ base.extend({
        name: "checkboxes",

        /**
         * Shows a confirm message.
         * @param {string} text the message text to show
         */
        showConfirmMessage: function(text) {
            // this is a general message
            if (text === lastMessageText) {
                return;
            }
            lastMessageText = text;
            base.container.sendViewModelEvent(base.container.EVENT_ON_MESSAGE_AVAILABLE, {
                messageText: text,
                messageLevel: "InfoBox"
            });
        },

        /**
         * Shows an error message.
         * @param {object} item the error message item
         */
        showErrorMessage: function(item) {
            // this is an item specific message
            let text = "", level = "";
            if (item) {
                if (item.validationState() === "invalid" && item.checked() === true) {
                    text =  item.errorTextAll();
                    if (lastMessageText === text) {
                        // skip same message
                        return;
                    }
                } else {
                    let invalidItems = checkboxesViewModel.getItems({validationState: "invalid", checked: true});
                    // if there are no checked items, we will reset the messages

                    if(checkboxesViewModel.getItems({"selected": true}).length > 0) {
                        if(lastMessageText && invalidItems.length !== 0) {
                            this.showErrorMessage(invalidItems[0]);
                            return;
                        } else {
                            if (!vk.isVisible()) {
                                // if vk is visible and the currently entered data is valid, we want to directly remove the error message!
                                return;
                            }
                            // if vk is not visible and all data is valid, the CONFIRM message will be dropped in, we don't want to remove that one!
                            // pass with empty text to hide message
                        }
                    }
                }
                lastMessageText = text;
                level = item.validationState() === "invalid" ? "WarningBox" : "";
            } else {
                lastMessageText = "";
            }
            setTimeout(() => {
                base.container.sendViewModelEvent(base.container.EVENT_ON_MESSAGE_AVAILABLE, {
                    messageText: text,
                    messageLevel: level
                });
                //messageItemId = item.result;
            }, 100); // wait a time until the message will be shown
        },

        /**
         * Handles editing of items.
         * Called from page fragment when an edit-command is clicked
         * @param {Object} item
         * @eventhandler
         */
        onEditItemData: function(item) {
            if (!item) {
                // auto-select first editable
                item = checkboxesViewModel.getItems(
                    {
                        "selected": true,
                        "editable": true,
                        "validationState": ["invalid", "empty"]}
                )[0];
            }

            if (!item) {
                return;
            }

            //const self = this;
            _src = item.value;
            _valid = ko.pureComputed(()=>{
                this.showErrorMessage(item);
                return item.validationState();
            });
            _tgt = item.formattedValue;
            if(typeof item.label === "string"||
                ko.isObservable(item.label)) {
                vk.setLabel(item.label);
            }
            if(typeof item.formattedPlaceholder === "string"||
                ko.isObservable(item.formattedPlaceholder)) {
                vk.setPlaceholder(item.formattedPlaceholder);
            }
            if (item.type === "number" ||
                item.type === "amount") {
                vk.activateLayout("NUMPAD");
            } else {
                vk.activateLayout("KEYBOARD");
                vk.reset();
            }
            vk.show(document.getElementById(item.id));
                //.then(self.showErrorMessage.bind(self, item));
        },

        /**
         * Called from fragment whenever a check-state changes on an item
         * @param item
         */
        onItemSelectionStateChanged: function(item) {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE checkboxes:onItemSelectionStateChanged Item: " + item.result + " -> "+ item.selected());
            if (checkboxesViewModel.getItems({"selected": false}).length === 0) {
                this.showErrorMessage();
            } else {
                this.showErrorMessage(item);
            }
        },

        /**
         * Checks items for invalid data, shows message for the first found
         */
        onInitialItemCheck: function() {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE checkboxes:onInitialItemCheck");
            if (checkboxesViewModel.getItems({"selected": true}).length > 0) {
                // we have selected items, check if there are some invalid ones and show the message oof the first invalid
                let invalidItems = checkboxesViewModel.getItems({validationState: "invalid", checked: true});
                if (invalidItems.length > 0) {
                    this.showErrorMessage(invalidItems[0]);
                } else {
                    this.showConfirmMessage(checkboxesViewModel.confirmText());
                }
            }
        },

        /**
         * @ignore
         */
        onVKStateChanged: function({visibility = ''}) {

        },

        /**
         * Is called when the confirm state is handled.
         * @param {function} checkboxesViewModel_handleConfirmState callback function
         */
        confirmStateHandled: function(checkboxesViewModel_handleConfirmState) {
            checkboxesViewModel_handleConfirmState();
            // decouple trigger from checks
            setTimeout(()=>{this.onInitialItemCheck()}, 0)
        },

        /**
         * Instantiates the {@link Wincor.UI.Content.CheckBoxesViewModel} and {@link Wincor.UI.Content.VirtualKeyboardViewModel}.
         * @see {@link module:baseaggregate.activate}.
         * @lifecycle view
         * @return {Promise} resolved when activation is ready.
         */
        activate: function() {
            vk = new Wincor.UI.Content.VirtualKeyboardViewModel();
            checkboxesViewModel = new Wincor.UI.Content.CheckBoxesViewModel();
            // we hook the original function reference to be able to do post-processing
            checkboxesViewModel.handleConfirmState = this.confirmStateHandled.bind(this, checkboxesViewModel.handleConfirmState.bind(checkboxesViewModel));
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE checkboxes:activate");

            base.container.add(checkboxesViewModel, ["flexMain", base.config.viewType === "softkey" ? {visibleLimits: {max: 8}} : void 0]);
            base.container.add(vk, {
                //skipTypes: {
                //    checkbox: false
                //},
                keyboardType: "NUMPAD",
                useAppOverlay: false,
                styleAppContentClass: "hideFlexMainOnActiveVK",
                stateChangedHandler: this.onVKStateChanged,
                getSourceObservable: elemId => {
                    let d = ko.dataFor(elemId);
                    // unknown id
                    if (!d || d.id !== elemId.id) {
                        return;
                    }
                    return _src;
                },
                getDataValidObservable: elemId => {
                    let d = ko.dataFor(elemId);
                    // unknown id
                    if (!d || d.id !== elemId.id) {
                        return;
                    }
                    return _valid;
                },
                getTargetObservable: elemId => {
                    let d = ko.dataFor(elemId);
                    // unknown id
                    if (!d || d.id !== elemId.id) {
                        return;
                    }
                    return _tgt;
                },
                enterCallback: () => {
                    checkboxesViewModel.handleConfirmState();
                },
                onFocusInHandler: (e)=>{
                    console.log(e);
                }
            });
            return base.activate();
        },


        /**
         * Overridden to set all references to null.
         * @see {@link module:baseaggregate.deactivate}.
         * @lifecycle view
         */
        deactivate: function() {
            vk = null;
            checkboxesViewModel.handleConfirmState = null; // assure cutting ref
            checkboxesViewModel = null;
            _src = null;
            _valid = null;
            _tgt = null;
        },

        /**
         * Overridden to zero the slide indicator on a softkey based layout.
         * @see {@link module:baseaggregate.compositionComplete}.
         * @lifecycle view
         */
        compositionComplete: function(view, parent) {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE checkboxes:compositionComplete");
            base.compositionComplete(view, parent);
            base.container.whenActivated().then(() => {
                // no onInitialItemCheck at this point - so the customer can read the original instruction
                if(base.container.viewHelper.viewType === "softkey") {
                    // initialize slide indicator for a the slide indicator group (optional)
                    base.container.viewHelper.moveSlideIndicator(0);
                }
            });
            if(!base.content.designMode) {
                _localizeService.registerForServiceEvent(_localizeService.SERVICE_EVENTS.LANGUAGE_CHANGED,
                    // async call, because the observables needs a bit to get updated
                    () => setTimeout(() => {
                        Wincor.UI.Content.ObjectManager.reCalculateObjects();
                    }, 100),
                    _localizeService.DISPOSAL_TRIGGER_UNLOAD);
            }
        },

        /**
         * Overridden to prevent from redrawing all checkboxes during notifyViewUpdate,
         * which is initiated by the CheckBoxesViewModel and necessary for ADA.
         * @see {@link module:baseaggregate.compositionUpdated}.
         * @lifecycle view
         */
        compositionUpdated: function(redrawAllCanvas) {
            _logger.log(_logger.LOG_DETAIL, "* | VIEW_AGGREGATE checkboxes:compositionUpdated");
            base.compositionUpdated(redrawAllCanvas);
            // we don't need it on updates, otherwise would have to handle popups also...
            // base.container.whenActivated().then(() => {
            //     this.onInitialItemCheck();
            // });
        }

    });
});

