## [Website](https://martijara.gitlab.io/Penguin-AI-Chatbot-for-GNOME/)

# Penguin: AI Chatbot

An assistant interface for GNOME that works with Anthropic's Claude AI models. For more information about Anthropic and Claude, visit [Anthropic's website](https://www.anthropic.com/).

[🐧 Linux User? Download this extension for GNOME Shell 👣 ](https://extensions.gnome.org/extension/7338/penguin-ai-chatbot/)

# Getting Started with Anthropic API

1. Sign up for an [Anthropic account](https://console.anthropic.com/)

2. Go to [API Keys](https://console.anthropic.com/account/keys) in your Anthropic Console

3. Click on "Create Key" to generate a new API key

4. Copy your new API key

5. Open the extension settings window and paste your key (make sure to first delete the default 'Input your key here' text)

That's it! The extension is now ready to use with Claude. By default, it uses the `claude-3-sonnet-20240229` model, which offers an excellent balance of capabilities and performance. If you want to use a different Claude model, you can find the complete list of available models in the [Anthropic documentation](https://docs.anthropic.com/claude/docs/models-overview).

# Features

- Chat with Claude AI directly from your GNOME desktop
- Markdown support for rich text responses
- Customizable chat colors and appearance
- Conversation history
- Easy copy-paste functionality for responses
- Simple and intuitive interface

# Showcase

![Screenshot from 2024-09-18 12-59-32](https://github.com/user-attachments/assets/26af0878-cc34-4f73-85e1-9a42aa1bde7b)

# Development

To build and install the extension locally:

```bash
make build     # Build the extension
make install   # Install the extension
make enable    # Enable the extension
make run       # Run a nested GNOME Shell session for testing
make clean     # Clean up build files
```