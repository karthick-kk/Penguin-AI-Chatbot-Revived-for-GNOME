import St from "gi://St";
import Pango from "gi://Pango";
import GLib from "gi://GLib";
import { MessageRoles, CSS, UI } from "./constants.js";
import { convertMD } from "../md2pango.js";
import { hideTooltip, showTooltip } from "./tooltip.js";

/**
 * Manages the chat message display
 */
export class ChatMessageDisplay {
    /**
     * Create a chat message display
     * @param {St.BoxLayout} container - Container for the chat messages
     * @param {object} styleSettings - Styling settings
     * @param {Function} onSettingsRequested - Callback when settings button is clicked
     */



    constructor(container, styleSettings, onSettingsRequested) {
        this._container = container;
        this._styleSettings = styleSettings;
        this._onSettingsRequested = onSettingsRequested;
        this._timeoutCopy = null;
        this._scroll = null;
    }

    /**
     * Update the style settings
     * @param {object} styleSettings - New style settings
     */
    updateStyleSettings(styleSettings) {
        this._styleSettings = styleSettings;
    }


    

    /**
     * Display a message
     * @param {string} role - Role of the message sender (user or assistant)
     * @param {string} text - Message content
     */
    displayMessage(role, text) {
        const isUserMessage = role === MessageRoles.USER;
        const messageType = isUserMessage ? CSS.HUMAN_MESSAGE : CSS.LLM_MESSAGE;
        const messageBoxType = isUserMessage ? CSS.HUMAN_MESSAGE_BOX : CSS.LLM_MESSAGE_BOX;
        const backgroundColor = isUserMessage ?
            this._styleSettings.humanMessageColor :
            this._styleSettings.llmMessageColor;
        const textColor = isUserMessage ?
            this._styleSettings.humanMessageTextColor :
            this._styleSettings.llmMessageTextColor;

        // Pre-process LLM output before converting to Pango
        const cleanedText = this._preprocessLLMOutput(text);
        const formattedText = isUserMessage ? convertMD(cleanedText) : convertMD(cleanedText);

        this._createMessageBox(messageType, messageBoxType, formattedText, backgroundColor, textColor, text);

        // Automatically scroll to the bottom when a new message is added
        this._scrollToBottom();
    }

    /**
     * Display an error message
     * @param {string} errorMessage - Error message to display
     * @param {boolean} showSettingsButton - Whether to show settings button
     */
    displayError(errorMessage, showSettingsButton = true) {
        this.displayMessage(MessageRoles.ASSISTANT, errorMessage);

        if (showSettingsButton) {
            const settingsButton = new St.Button({
                label: UI.SETTINGS_BUTTON_TEXT,
                can_focus: true,
                toggle_mode: true,
            });

            settingsButton.connect("clicked", () => {
                if (this._onSettingsRequested) {
                    this._onSettingsRequested();
                }
            });

            this._container.add_child(settingsButton);
        }

        this._scrollToBottom();
    }

    /**
     * Create a message box with the given content
     * @param {string} messageType - CSS class for message type
     * @param {string} messageBoxType - CSS class for message box type
     * @param {string} text - Message content
     * @param {string} backgroundColor - Background color
     * @param {string} textColor - Text color
     * @private
     */
    _createMessageBox(messageType, messageBoxType, text, backgroundColor, textColor, rawText) {
        const box = new St.BoxLayout({
            vertical: true,
            style_class: messageBoxType,
        });

        const label = new St.Label({
            style_class: messageType,
            style: `background-color: ${backgroundColor}; color: ${textColor}`,
            y_expand: true,
            reactive: true,      
        });

        label.clutter_text.single_line_mode = false;
        label.clutter_text.line_wrap = true;
        label.clutter_text.line_wrap_mode = Pango.WrapMode.WORD_CHAR;
        label.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;

        box.add_child(label);

        // For non-human messages, add copy capability
        if (messageType !== CSS.HUMAN_MESSAGE) {
            this._addCopyBehavior(label);
        }

        label.connect("leave-event", async () => {
            if (this._timeoutCopy) {
                GLib.Source.remove(this._timeoutCopy);
                this._timeoutCopy = null;
            }
            hideTooltip();
        });
        
        try {
            label.clutter_text.set_markup(text);
            let labelText = label.clutter_text.get_text();
            if ((!labelText || !labelText.trim()) && rawText && rawText.trim()) {
                label.clutter_text.set_text(rawText);
                label.set_style(`background-color: orange; color: black; font-weight: bold`);
            } else if (!labelText || !labelText.trim()) {
                label.clutter_text.set_text("[[EMPTY RESPONSE]]");
                label.set_style(`background-color: yellow; color: red; font-weight: bold`);
            }
        } catch (e) {
            label.clutter_text.set_text(rawText || text);
            label.set_style(`background-color: ${backgroundColor}; color: red`);
        }
        this._container.add_child(box);
    }

    /**
     * Add copy behavior to a message label
     * @param {St.Label} label - Label to add behavior to
     * @private
     */
    _addCopyBehavior(label, clipboard, chatInput) {
        label.connect("button-press-event", () => {
            if (this._clipboard) {
                this._clipboard.set_text(St.ClipboardType.CLIPBOARD, label.clutter_text.get_text());
            }
        });

        label.connect("enter-event", async () => {
            showTooltip("Click to copy");


        //     if (this._chatInput && this._chatInput.get_text() === "") {
        //         this._timeoutCopy = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 0.4, () => {
        //             this._chatInput.set_reactive(false);
        //             this._chatInput.set_text(UI.COPY_TEXT_HINT);
        //             return GLib.SOURCE_REMOVE;
        //         });
        //     }
        });

        label.connect("leave-event", async () => {
            if (this._timeoutCopy) {
                GLib.Source.remove(this._timeoutCopy);
                this._timeoutCopy = null;
            }

            hideTooltip();

        //     if (this._chatInput && this._chatInput.get_text() === UI.COPY_TEXT_HINT) {
        //         this._chatInput.set_reactive(true);
        //         this._chatInput.set_text("");
        //     }
        });
    }
    

    /**
     * Set the clipboard for copy operations
     * @param {St.Clipboard} clipboard - Clipboard object
     */
    setClipboard(clipboard) {
        this._clipboard = clipboard;
    }

    /**
     * Set the chat input for copy hint operations
     * @param {St.Entry} chatInput - Chat input element
     */
    setChatInput(chatInput) {
        this._chatInput = chatInput;
    }

    /**
     * Clear all messages
     */
    clear() {
        this._container.destroy_all_children();
    }

    /**
     * Load a chat history
     * @param {Array} history - Chat history to display
     */
    loadHistory(history) {
        this.clear();

        if (Array.isArray(history)) {
            history.forEach((message) => {
                this.displayMessage(message.role, message.content);
            });
        }

        this._scrollToBottom();
    }

    /**
     * Scroll to the bottom of the chat
     * @private
     */
    _scrollToBottom() {
        if (this._scroll) {
            GLib.Source.remove(this._scroll);
        }
        this._scroll = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 50, () => {
            const scrollView = this._container.get_parent();

            if (scrollView instanceof St.ScrollView) {
                const vscroll = scrollView.vscroll;
                if (vscroll) {
                    vscroll.adjustment.value = vscroll.adjustment.upper - vscroll.adjustment.page_size;
                }
            } else {
                logError("Parent is not an instance of St.ScrollView");
            }

            return GLib.SOURCE_REMOVE;
        });
    }

    /**
     * Clean up resources
     */
    destroy() {
        if (this._timeoutCopy) {
            GLib.Source.remove(this._timeoutCopy);
            this._timeoutCopy = null;
        }

        if (this._scroll) {
            GLib.Source.remove(this._scroll);
            this._scroll = null;
        }
    }

    /**
     * Pre-process LLM output to remove problematic Markdown/HTML before Pango conversion
     * @param {string} text - Raw LLM output
     * @returns {string} - Cleaned text
     */
    _preprocessLLMOutput(text) {
        if (!text) return '';
        let cleaned = text;
        // Remove HTML tags
        cleaned = cleaned.replace(/<[^>]+>/g, '');
        // Remove Markdown tables
        cleaned = cleaned.replace(/\|.*\|/g, '');
        // Remove code blocks (```...```)
        cleaned = cleaned.replace(/```[\s\S]*?```/g, '[code block removed]');
        // Remove inline code (`...`)
        cleaned = cleaned.replace(/`[^`]+`/g, '[code]');
        // Escape ampersands and angle brackets
        cleaned = cleaned.replace(/&/g, '&amp;');
        cleaned = cleaned.replace(/</g, '&lt;');
        cleaned = cleaned.replace(/>/g, '&gt;');
        // Collapse excessive whitespace
        cleaned = cleaned.replace(/\s{3,}/g, '  ');
        return cleaned.trim();
    }
}
