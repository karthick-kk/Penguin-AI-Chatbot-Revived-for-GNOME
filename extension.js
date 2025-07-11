/**
 * Penguin AI Chatbot for GNOME
 *
 * A GNOME Shell extension that integrates AI chatbot capabilities
 * with support for multiple LLM providers.
 *
 * Based on work by contributors to:
 * https://github.com/martijara/Penguin-AI-Chatbot-for-GNOME
 */

/// <reference path="./global.d.ts" />
import GObject from "gi://GObject";
import St from "gi://St";
import GLib from "gi://GLib";


import { Extension, gettext as _ } from "resource:///org/gnome/shell/extensions/extension.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";

import { SettingsManager } from "./lib/settings.js";
import { LLMProviderFactory } from "./lib/llmProviders.js";
import { ChatMessageDisplay } from "./lib/chatUI.js";
import { setupShortcut, removeShortcut, formatString, focusInput } from "./lib/utils.js";
import { MessageRoles, CSS, UI } from "./lib/constants.js";
import {hideTooltip, showTooltip } from "./lib/tooltip.js";

/**
 * Main extension class that handles the chat interface
 */
const Penguin = GObject.registerClass(
    class Penguin extends PanelMenu.Button {
        /**
        * Initialize the Penguin chat interface
        * @param {object} params - Initialization parameters
        */
        _init(extension) {
            super._init(0.0, _("Penguin: AI Chatbot"));

            this._extension = extension;
            this._settingsManager = new SettingsManager(this._extension.settings);
            this._clipboard = this._extension.clipboard;

            // Load settings
            this._loadSettings();

            // Initialize UI elements
            this._initializeUI();

            // Set up keyboard shortcut
            this._bindShortcut();

            // Set up timeout handles
            this._timeoutResponse = null;
            this._timeoutFocusInputBox = null;

            // Initialize history
            this._history = [];
            this._loadHistory();
        }

        /**
        * Initialize the UI elements
        * @private
        */
        _initializeUI() {
        // Add icon to the top bar
            this.add_child(new St.Icon({
                icon_name:   "Penguin: AI Chatbot",
                style_class: "icon",
            }));

            // Create chat container
            this._chatBox = new St.BoxLayout({
                vertical:    true,
                style_class: CSS.POPUP_MENU_BOX,
                style:       "text-wrap: wrap",
            });

            // Create chat message display
            const styleSettings = this._settingsManager.getStyleSettings();
            this._chatDisplay = new ChatMessageDisplay(
                this._chatBox,
                styleSettings,
                () => this._openSettings()
            );
            this._chatDisplay.setClipboard(this._clipboard);

            // Create chat input
            this._chatInput = new St.Entry({
                hint_text:   UI.CHAT_INPUT_PLACEHOLDER,
                can_focus:   true,
                track_hover: true,
                style_class: CSS.MESSAGE_INPUT,
            });
            this._chatDisplay.setChatInput(this._chatInput);

            // Set up input event handler
            this._chatInput.clutter_text.connect("activate", () => this._handleUserInput());

            // Create new conversation button
            this._newConversationButton = new St.Button({
                style: "width: 16px; height:16px; margin-right: 15px; margin-left: 10px'",
                child: new St.Icon({
                    icon_name: "tab-new-symbolic",
                    style:     "width: 30px; height:30px",
                }),
            });

            // Set up new conversation button event handlers
            this._newConversationButton.connect("clicked", () => this._handleNewConversation());
            this._newConversationButton.connect("enter-event", () => this._handleNewConversationEnter());
            this._newConversationButton.connect("leave-event", () => this._handleNewConversationLeave());

            // Create bottom input area
            const entryBox = new St.BoxLayout({
                vertical:    false,
                style_class: CSS.POPUP_MENU_BOX,
            });
            entryBox.add_child(this._chatInput);
            entryBox.add_child(this._newConversationButton);

            // Create scrollable chat view
            this._chatView = new St.ScrollView({
                enable_mouse_scrolling: true,
                style_class:            CSS.CHAT_SCROLLING,
                reactive:               true,
            });
            this._chatView.set_child(this._chatBox);

            // Create main layout
            const layout = new St.BoxLayout({
                vertical:    true,
                style_class: CSS.POPUP_MENU_BOX,
            });
            layout.add_child(this._chatView);
            layout.add_child(entryBox);

            // Add to popup menu
            const popUp = new PopupMenu.PopupMenuSection();
            popUp.actor.add_child(layout);
            this.menu.addMenuItem(popUp);

            // Setup menu open/close handler
            this.menu.connect("open-state-changed", (self, open) => {
                if (open) {
                    this._focusInputBox();
                }
            });
        }

        /**
        * Load settings and connect to changes
        * @private
        */
        _loadSettings() {
            this._settingsManager.connectToChanges(() => {
                this._chatDisplay.updateStyleSettings(this._settingsManager.getStyleSettings());
            });
        }

        /**
        * Handle user message input
        * @private
        */
        _handleUserInput() {
            if (this._timeoutResponse) {
                GLib.Source.remove(this._timeoutResponse);
                this._timeoutResponse = null;
            }

            const input = this._chatInput.get_text();
            if (!input || input === UI.THINKING_TEXT) {
                return;
            }

            // Display user message
            this._chatDisplay.displayMessage(MessageRoles.USER, input);

            // Add to history
            this._history.push({
                role:    MessageRoles.USER,
                content: input,
            });

            // Send to LLM
            this._sendToLLM();

            // Disable input during processing
            this._chatInput.set_reactive(false);
            this._chatInput.set_text(UI.THINKING_TEXT);
        }

        /**
        * Handle new conversation button click
        * @private
        */
        _handleNewConversation() {
            if (this._chatInput.get_text() === UI.NEW_CONVERSATION_TEXT ||
            this._chatInput.get_text() !== UI.THINKING_TEXT) {
            // Clear history
                this._history = [];
                this._settingsManager.setHistory([]);
                this._chatDisplay.clear();
            } else {
                this._chatDisplay.displayMessage(
                    MessageRoles.ASSISTANT,
                    "You can't create a new conversation while I am thinking"
                );
            }
        }

        /**
        * Handle mouse enter on new conversation button
        * @private
        */
        _handleNewConversationEnter() {
            showTooltip("New conversation (Deletes current)");
        }

        /**
        * Handle mouse leave on new conversation button
        * @private
        */
        _handleNewConversationLeave() {
            hideTooltip();
        }

        /**
        * Load chat history
        * @private
        */
        _loadHistory() {
            this._chatInput.set_reactive(false);
            this._chatInput.set_text(UI.LOADING_HISTORY);

            this._history = this._settingsManager.getHistory();
            this._chatDisplay.loadHistory(this._history);

            this._chatInput.set_reactive(true);
            this._chatInput.set_text("");
            this._focusInputBox();
        }

        /**
        * Send the current conversation to the LLM
        * @private
        */
        _sendToLLM() {
            console.log(`[Extension] _sendToLLM method called`);
            const provider = this._settingsManager.getLLMProvider();
            const apiKey = this._settingsManager.getApiKey(provider);
            const model = this._settingsManager.getModel(provider);
            const timeout = this._settingsManager.getRequestTimeout();
            console.log(`[Extension] Using provider: ${provider}, model: ${model}, timeout: ${timeout}s`);

            const llmProvider = LLMProviderFactory.createProvider(provider, apiKey, model);
            // Set the configured timeout
            llmProvider.setTimeout(timeout);
            console.log(`[Extension] Created LLM provider: ${llmProvider.constructor.name}`);

            // Create a global test function to see if the issue is with callback context
            global.testCallbackFunction = (error, response) => {
                console.log("GLOBAL TEST CALLBACK REACHED!!!");
                log("GLOBAL TEST CALLBACK REACHED!!!");
                console.log(`Global callback - error: ${error}, response: ${response ? response.substring(0, 50) : 'NULL'}`);
            };

            // Store references for the callback
            const chatDisplay = this._chatDisplay;
            const chatInput = this._chatInput;
            const history = this._history;
            const settingsManager = this._settingsManager;
            const focusInputBox = this._focusInputBox.bind(this);

            // Test if simple callbacks work at all
            const testCallback = function(error, response) {
                console.log("=== TEST CALLBACK EXECUTED ===");
                log("=== TEST CALLBACK EXECUTED ===");
            };
            
            // Test the callback directly
            try {
                console.log("Testing callback directly...");
                testCallback(null, "test");
                console.log("Direct callback test successful");
            } catch (e) {
                console.log(`Direct callback test failed: ${e}`);
            }

            // Store result globally for polling-based approach
            global.llmResult = null;
            global.llmError = null;
            global.llmPending = true;

            // Extremely simple callback that just stores the result
            const simpleCallback = function(error, response) {
                console.log("=== SIMPLE CALLBACK START ===");
                log("=== SIMPLE CALLBACK START ===");
                try {
                    global.llmError = error;
                    global.llmResult = response;
                    global.llmPending = false;
                    console.log(`Stored result: error=${!!error}, response length=${response ? response.length : 0}`);
                } catch (e) {
                    console.log(`Error in simple callback: ${e.message}`);
                }
                console.log("=== SIMPLE CALLBACK END ===");
            };

            // Robust callback with logging and blank response fallback
            const callback = function(error, response) {
                console.log("[Extension] Callback entered");
                log(`[Extension] Callback entered`);
                if (error) {
                    log(`[Extension] Callback error: ${error}`);
                    chatDisplay.displayError(error.toString(), true);
                } else {
                    log(`[Extension] Callback response length: ${response ? response.length : 'NULL'}`);
                    log(`[Extension] Callback response preview: ${response ? response.substring(0, 200) : 'NULL'}`);
                    if (!response || !response.trim()) {
                        log(`[Extension] Response is blank or whitespace. Displaying placeholder.`);
                        chatDisplay.displayMessage('assistant', '[No response or blank output from LLM]');
                    } else {
                        chatDisplay.displayMessage('assistant', response);
                    }
                    // Add to history
                    history.push({ role: 'assistant', content: response });
                    settingsManager.setHistory(history);
                }
                chatInput.set_reactive(true);
                chatInput.set_text("");
                focusInputBox();
            };
            llmProvider.sendRequest(this._history, callback);
            console.log(`[Extension] sendRequest method called, waiting for callback`);

            // Poll for result using GLib timeout
            const checkResult = () => {
                console.log("Checking for LLM result...");
                if (!global.llmPending) {
                    console.log("Result received! Processing...");
                    if (global.llmError) {
                        console.log(`Processing error: ${global.llmError}`);
                        this._chatDisplay.displayError(global.llmError.toString(), true);
                    } else {
                        console.log(`Processing response: ${global.llmResult ? global.llmResult.length : 0} chars`);
                        this._chatDisplay.displayMessage(MessageRoles.ASSISTANT, global.llmResult);
                        
                        // Add to history
                        this._history.push({
                            role: MessageRoles.ASSISTANT,
                            content: global.llmResult,
                        });
                        this._settingsManager.setHistory(this._history);
                    }

                    // Re-enable input
                    this._chatInput.set_reactive(true);
                    this._chatInput.set_text("");
                    this._focusInputBox();
                    
                    return GLib.SOURCE_REMOVE;
                } else {
                    return GLib.SOURCE_CONTINUE;
                }
            };

            // Start polling every 500ms
            GLib.timeout_add(GLib.PRIORITY_DEFAULT, 500, checkResult);
        }

        /**
        * Set up keyboard shortcut
        * @private
        */
        _bindShortcut() {
            const shortcut = this._settingsManager.getOpenChatShortcut();
            setupShortcut(shortcut, this._extension.settings, this._toggleChatWindow.bind(this));
        }

        /**
        * Remove keyboard shortcut
        * @private
        */
        _unbindShortcut() {
            removeShortcut();
        }

        /**
        * Focus the input box after a short delay
        * @private
        */
        _focusInputBox() {
            if (this._timeoutFocusInputBox) {
                GLib.Source.remove(this._timeoutFocusInputBox);
            }

            this._timeoutFocusInputBox = focusInput(this._chatInput);
        }

        /**
        * Toggle the chat window open/closed
        * @private
        */
        _toggleChatWindow() {
            if (this.menu.isOpen) {
                this.menu.close();
            } else {
                this.menu.open();
                this._focusInputBox();
            }
        }

        /**
        * Open extension settings
        * @private
        */
        _openSettings() {
            this._extension.openPreferences();
        }

        /**
        * Clean up resources
        */
        destroy() {
            if (this._timeoutResponse) {
                GLib.Source.remove(this._timeoutResponse);
                this._timeoutResponse = null;
            }

            if (this._timeoutFocusInputBox) {
                GLib.Source.remove(this._timeoutFocusInputBox);
                this._timeoutFocusInputBox = null;
            }

            this._unbindShortcut();
            this._settingsManager.disconnectAll();
            this._chatDisplay.destroy();
            hideTooltip();

            super.destroy();
        }
    });

/**
 * Extension entry point class
 */
export default class PenguinExtension extends Extension {
    enable() {
        this._penguin = new Penguin({
            settings:     this.getSettings(),
            openSettings: this.openPreferences,
            clipboard:    St.Clipboard.get_default(),
            uuid:         this.uuid,
        });

        Main.panel.addToStatusArea(this.uuid, this._penguin);
    }

    disable() {
        this._penguin.destroy();
        this._penguin = null;
    }
}
