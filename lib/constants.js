/**
 * Constants for the Penguin AI Chatbot extension
 */

// LLM Provider identifiers
export const LLMProviders = {
    ANTHROPIC:  "anthropic",
    OPENAI:     "openai",
    GEMINI:     "gemini",
    OPENROUTER: "openrouter",
    OLLAMA:     "ollama",
};

// Settings keys
export const SettingsKeys = {
    LLM_PROVIDER:             "llm-provider",
    ANTHROPIC_API_KEY:        "anthropic-api-key",
    OPENAI_API_KEY:           "openai-api-key",
    GEMINI_API_KEY:           "gemini-api-key",
    OPENROUTER_API_KEY:       "openrouter-api-key",
    ANTHROPIC_MODEL:          "anthropic-model",
    OPENAI_MODEL:             "openai-model",
    GEMINI_MODEL:             "gemini-model",
    OPENROUTER_MODEL:         "openrouter-model",
    OLLAMA_MODEL:             "ollama-model",
    REQUEST_TIMEOUT:          "request-timeout",
    HUMAN_MESSAGE_COLOR:      "human-message-color",
    LLM_MESSAGE_COLOR:        "llm-message-color",
    HUMAN_MESSAGE_TEXT_COLOR: "human-message-text-color",
    LLM_MESSAGE_TEXT_COLOR:   "llm-message-text-color",
    HISTORY:                  "history",
    OPEN_CHAT_SHORTCUT:       "open-chat-shortcut",
};

// Message role identifiers
export const MessageRoles = {
    USER:      "user",
    ASSISTANT: "assistant",
    MODEL:     "model", // Used for Gemini
};

// UI text constants
export const UI = {
    CHAT_INPUT_PLACEHOLDER: "Chat with me",
    THINKING_TEXT:          "I am thinking...",
    NEW_CONVERSATION_TEXT:  "Create a new conversation (Deletes current)",
    COPY_TEXT_HINT:         "Click on text to copy",
    LOADING_HISTORY:        "Loading history...",
    ERROR_API_KEY:          "Hmm, an error occurred when trying to reach out to the assistant.\nCheck your API key and model settings for {0} and try again. It could also be your internet connection!",
    ERROR_GENERIC:          "We are having trouble getting a response from the assistant. \nHere is the error - if it helps at all: \n\n{0} \n\nSome tips:\n\n- Check your internet connection\n- If you recently changed your provider, try deleting your history.",
    SETTINGS_BUTTON_TEXT:   "Click here to go to settings",
    PREFERENCES_SAVED:      "Preferences Saved",
    SAVE_PREFERENCES:       "Save Preferences",
    SAVE_PREFERENCES_HINT:  "Click 'Save Preferences' to apply your changes.",
};

// CSS class names
export const CSS = {
    HUMAN_MESSAGE:     "humanMessage",
    LLM_MESSAGE:       "llmMessage",
    HUMAN_MESSAGE_BOX: "humanMessage-box",
    LLM_MESSAGE_BOX:   "llmMessage-box",
    MESSAGE_INPUT:     "messageInput",
    POPUP_MENU_BOX:    "popup-menu-box",
    CHAT_SCROLLING:    "chat-scrolling",
};
