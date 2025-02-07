## [Website](https://martijara.gitlab.io/Penguin-AI-Chatbot-for-GNOME/)

# Penguin: AI Chatbot


An assistant interface for GNOME powered by LLM APIs. Supports Anthropic, OpenAI, and Gemini.

> ### **Disclaimer:**
>
> This is a fork by @esauvisky of a project originally created by @martijara and further developed by @neonpegasu5.
> This introduces multi-LLM provider support, keyboard shortcuts, and ongoing enhancements. More features are planned for the future.
>
> ### **TODO:**
>
> *   Automatically focus the input field on window open
> *   Enable partial message selection (remove left-click copy)
> *   Implement streaming responses
> *   Allow chat window resizing
> *   Add a provider selector in the chat window
> *   Show a chat history selector
> *   Add quick copy buttons for code blocks

# Getting Started

This extension now supports multiple LLM providers.  You will need to obtain an API key from your chosen provider(s):

*   **Anthropic:** Sign up and get your API key from [here](https://console.anthropic.com/account/keys).
*   **OpenAI:** Sign up and get your API key from [here](https://platform.openai.com/api-keys).
*   **Gemini:** Sign up and get your API key from [here](https://makersuite.google.com/app/apikey).

Once you have your API key(s):

1.  Install the extension.
2.  Open the extension settings.
3.  Select your preferred LLM provider.
4.  Paste your API key into the corresponding field.
5.  Choose your desired model (refer to the provider's documentation for available models).
6.  (Optional) Customize the colors for your messages and the chatbot's messages.
7.  (Optional) Set a keyboard shortcut to quickly open the chat window.
8. Click Save.

You can now use the extension! Open the chat window by clicking the Penguin icon in the top panel or by using the keyboard shortcut (default: Super+L).

# Features

*   **Multiple LLM Providers:** Choose between Anthropic, OpenAI, and Gemini.
*   **Customizable Models:** Select different models for each provider.
*   **Chat History:** Remembers your conversation history.
*   **Customizable Appearance:** Change the background and text colors for messages.
*   **Keyboard Shortcut:** Quickly open the chat window with a customizable shortcut.
*   **Copy to Clipboard:** Click on any message to copy it to your clipboard.

# Showcase

![Screenshot of Penguin as a GNOME Shell Extension](public/screenshot.png)
![Screenshot of Penguin as a GNOME Shell Extension](public/fullscreen.png)
