GNOME Linux user 👣? Download the extension [here](https://extensions.gnome.org/extension/7338/penguin-ai-chatbot/)

---
# Penguin: AI Chatbot 🐧

An assistant interface for GNOME powered by LLM APIs. Supports OpenRouter, Anthropic, OpenAI, and Gemini.

# Revived Enhancements

- Ollama support for self-hosted models
- Fixes blank chat responses

# Download & Installation

**The easiest way to install would be directly from GNOME's extensions website** -> [just click here](https://extensions.gnome.org/extension/7338/penguin-ai-chatbot/)

Alternatively, You can download the latest version of the extension from the [GitHub Releases](https://github.com/martijara/Penguin-AI-Chatbot-for-GNOME/releases/tag/v14) page.  Download the `.zip` file from the latest release, and then install it using the following command:

```bash
gnome-extensions install penguin-ai-chatbot@coffeecionado.gitlab.io.shell-extension.zip --force
```

You may need to restart GNOME Shell after installation (log out and log back in, or press Alt+F2, type `r`, and press Enter).

## Manual Installation (from Source)

If you prefer to build the extension from source, follow these steps:

1.  Clone the repository:

    ```bash
    git clone https://github.com/martijara/Penguin-AI-Chatbot-for-GNOME.git
    cd Penguin-AI-Chatbot-for-GNOME
    ```

2.  Build, install and enable the extension:

    ```bash
    make
    ```

# Getting Started

This extension now supports multiple LLM providers.  You will need to obtain an API key from your chosen provider(s):

*   **Anthropic:** Sign up and get your API key from [here](https://console.anthropic.com/account/keys).
*   **OpenAI:** Sign up and get your API key from [here](https://platform.openai.com/api-keys).
*   **Gemini:** Sign up and get your API key from [here](https://makersuite.google.com/app/apikey).
*   **OpenRouter** Sign up and get your API key from [here](https://openrouter.ai/settings/keys)

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

*   **Multiple LLM Providers:** Choose between Anthropic, OpenAI, Gemini, and OpenRouter.
*   **Customizable Models:** Select different models for each provider.
*   **Chat History:** Remembers your conversation history.
*   **Customizable Appearance:** Change the background and text colors for messages.
*   **Keyboard Shortcut:** Quickly open the chat window with a customizable shortcut.
*   **Copy to Clipboard:** Click on any message to copy it to your clipboard.

# Showcase 📺

![image](https://github.com/user-attachments/assets/a062ef18-c8ae-4188-908f-24bf8b12315e)

---

[See 👀, Star ✨, or Fork 🍴, on Github](https://github.com/martijara/Penguin-AI-Chatbot-for-GNOME) 🐙

