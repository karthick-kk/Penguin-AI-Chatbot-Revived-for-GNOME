// Made by @martijara
// Edited by @neonpegasu5

import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';

import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class PenguinPreferences extends ExtensionPreferences {
    fillPreferencesWindow (window) {
        window._settings = this.getSettings();
        const settingsUI = new Settings(window._settings);
        const page = new Adw.PreferencesPage();
        page.add(settingsUI.ui);
        window.add(page);
    }
}

class Settings {
    constructor (schema) {
        this.schema = schema;
        this.ui =  new Adw.PreferencesGroup({ title: _('Settings:') });
        this.main = new Gtk.Grid({
            margin_top: 10,
            margin_bottom: 10,
            margin_start: 10,
            margin_end: 10,
            row_spacing: 10,
            column_spacing: 14,
            column_homogeneous: false,
            row_homogeneous: false
        });

        // Getting necessary schema values
        const defaultProvider = this.schema.get_string("llm-provider");
        const defaultAnthropicKey = this.schema.get_string("anthropic-api-key");
        const defaultOpenAIKey = this.schema.get_string("openai-api-key");
        const defaultGeminiKey = this.schema.get_string("gemini-api-key");
        const defaultModel = this.schema.get_string("llm-model");
        const defaultOpenAIModel = this.schema.get_string("openai-model");
        const defaultGeminiModel = this.schema.get_string("gemini-model");
        const defaultHumanColor = this.schema.get_string("human-message-color");
        const defaultLLMColor = this.schema.get_string("llm-message-color");
        const defaultHumanTextColor = this.schema.get_string("human-message-text-color");
        const defaultLLMTextColor = this.schema.get_string("llm-message-text-color");


        // LLM Provider Section
        const labelProvider = new Gtk.Label({
            label: _("Choose LLM Provider:"),
            halign: Gtk.Align.START,
            tooltip_text: _("Select the Large Language Model (LLM) provider you want to use.") // Added tooltip
        });
        const providerList = new Gtk.StringList();
        providerList.append(_("Anthropic"));
        providerList.append(_("OpenAI"));
        providerList.append(_("Gemini"));
        const provider = new Gtk.DropDown({
            model: providerList,
            expression: new Gtk.ConstantExpression(0)
        });

        // Set the default provider
        let defaultProviderIndex = 0; // Default to Anthropic
        for (let i = 0; i < providerList.get_n_items(); i++) {
            if (providerList.get_string(i).toLowerCase() === defaultProvider) {
                defaultProviderIndex = i;
                break;
            }
        }
        provider.set_selected(defaultProviderIndex);


        // API Key Section - Anthropic
        const labelAnthropicAPI = new Gtk.Label({
            label: _("Anthropic API Key:"),
            halign: Gtk.Align.START,
            tooltip_text: _("Enter your Anthropic API key here.") // Added tooltip
        });
        const anthropicApiKey = new Gtk.Entry({
            buffer: new Gtk.EntryBuffer(),
            visibility: false // hide the key
        });
        anthropicApiKey.set_placeholder_text(_("Paste your Anthropic API key"));
        const howToAnthropicAPI = new Gtk.LinkButton({
            label: _("Get Anthropic API Key"),
            uri: 'https://console.anthropic.com/account/keys'
        });

        // API Key Section - OpenAI
        const labelOpenAIAPI = new Gtk.Label({
            label: _("OpenAI API Key:"),
            halign: Gtk.Align.START,
            tooltip_text: _("Enter your OpenAI API key here.") // Added tooltip
        });
        const openaiApiKey = new Gtk.Entry({
            buffer: new Gtk.EntryBuffer(),
            visibility: false // hide the key
        });
        openaiApiKey.set_placeholder_text(_("Paste your OpenAI API key"));
        const howToOpenAIAPI = new Gtk.LinkButton({
            label: _("Get OpenAI API Key"),
            uri: 'https://platform.openai.com/api-keys'
        });

        // API Key Section - Gemini
        const labelGeminiAPI = new Gtk.Label({
            label: _("Gemini API Key:"),
            halign: Gtk.Align.START,
            tooltip_text: _("Enter your Gemini API key here.") // Added tooltip
        });
        const geminiApiKey = new Gtk.Entry({
            buffer: new Gtk.EntryBuffer(),
            visibility: false // hide the key
        });
        geminiApiKey.set_placeholder_text(_("Paste your Gemini API key"));
        const howToGeminiAPI = new Gtk.LinkButton({
            label: _("Get Gemini API Key"),
            uri: 'https://makersuite.google.com/app/apikey'
        });


        // LLM Model Section - Anthropic
        const labelModel = new Gtk.Label({
            label: _("Anthropic Model:"),
            halign: Gtk.Align.START,
            tooltip_text: _("Specify the Anthropic model you want to use.  Example: claude-v1.3") // Added tooltip
        });
        const model = new Gtk.Entry({
            buffer: new Gtk.EntryBuffer()
        });
        model.set_placeholder_text(_("e.g., claude-v1.3"));
        const howToModel = new Gtk.LinkButton({
            label: _("Available Anthropic Models"),
            uri: 'https://docs.anthropic.com/claude/docs/models-overview' // TODO: Update this to be more generic or provider-specific
        });

        // LLM Model Section - OpenAI
        const labelOpenAIModel = new Gtk.Label({
            label: _("OpenAI Model:"),
            halign: Gtk.Align.START,
            tooltip_text: _("Specify the OpenAI model you want to use.  Example: gpt-3.5-turbo") // Added tooltip
        });
        const openaiModel = new Gtk.Entry({
            buffer: new Gtk.EntryBuffer()
        });
        openaiModel.set_placeholder_text(_("e.g., gpt-3.5-turbo"));
        const howToOpenAIModel = new Gtk.LinkButton({
            label: _("Available OpenAI Models"),
            uri: 'https://platform.openai.com/docs/models' // TODO: Update this to be more generic or provider-specific
        });

        // LLM Model Section - Gemini
        const labelGeminiModel = new Gtk.Label({
            label: _("Gemini Model:"),
            halign: Gtk.Align.START,
            tooltip_text: _("Specify the Gemini model you want to use.  Example: gemini-1.0-pro") // Added tooltip
        });
        const geminiModel = new Gtk.Entry({
            buffer: new Gtk.EntryBuffer()
        });
        geminiModel.set_placeholder_text(_("e.g., gemini-1.0-pro"));
        const howToGeminiModel = new Gtk.LinkButton({
            label: _("Available Gemini Models"),
            uri: 'https://ai.google.dev/models/gemini' // TODO: Update this to be more generic or provider-specific
        });


        // Color Dialog
        let colorDialog = new Gtk.ColorDialog({
            with_alpha: false,
        });

        // Human Color Section
        const labelHumanColor = new Gtk.Label({
            label: _("Your Message Background Color:"),
            halign: Gtk.Align.START,
            tooltip_text: _("Select the background color for your messages.") // Added tooltip
        });


        let humanColor = new Gtk.ColorDialogButton({
            valign: Gtk.Align.CENTER,
            dialog: colorDialog,
        });

        const humanColorGTK = humanColor.rgba;
        humanColorGTK.parse(defaultHumanColor);
        humanColor.set_rgba(humanColorGTK);




        // LLM Color Section
        const labelLLMColor = new Gtk.Label({
            label: _("Chatbot Message Background Color:"),
            halign: Gtk.Align.START,
            tooltip_text: _("Select the background color for the chatbot's messages.") // Added tooltip
        });



        let llmColor = new Gtk.ColorDialogButton({
            valign: Gtk.Align.CENTER,
            dialog: colorDialog,
        });

        const llmColorGTK = llmColor.rgba;
        llmColorGTK.parse(defaultLLMColor);
        llmColor.set_rgba(llmColorGTK);



        // Human Text Color Section
        const labelHumanTextColor = new Gtk.Label({
            label: _("Your Message Text Color:"),
            halign: Gtk.Align.START,
            tooltip_text: _("Select the text color for your messages.") // Added tooltip
        });

        let humanTextColor = new Gtk.ColorDialogButton({
            valign: Gtk.Align.CENTER,
            dialog: colorDialog,
        });

        const humanTextColorGTK = humanTextColor.rgba;
        humanTextColorGTK.parse(defaultHumanTextColor);
        humanTextColor.set_rgba(humanTextColorGTK);




        // LLM Text Color Section
        const labelLLMTextColor = new Gtk.Label({
            label: _("Chatbot Message Text Color:"),
            halign: Gtk.Align.START,
            tooltip_text: _("Select the text color for the chatbot's messages.") // Added tooltip
        });


        let llmTextColor = new Gtk.ColorDialogButton({
            valign: Gtk.Align.CENTER,
            dialog: colorDialog,
        });

        const llmTextColorGTK = llmTextColor.rgba;
        llmTextColorGTK.parse(defaultLLMTextColor);
        llmTextColor.set_rgba(llmTextColorGTK);



        const save = new Gtk.Button({
            label: _('Save Preferences') // More specific label
        });
        const statusLabel = new Gtk.Label({
            label: _("Click 'Save Preferences' to apply your changes."), // Updated
            useMarkup: true,
            halign: Gtk.Align.CENTER
        });

        // Initial display of set values
        anthropicApiKey.set_text(defaultAnthropicKey);
        openaiApiKey.set_text(defaultOpenAIKey);
        geminiApiKey.set_text(defaultGeminiKey);
        model.set_text(defaultModel);
        openaiModel.set_text(defaultOpenAIModel);
        geminiModel.set_text(defaultGeminiModel);


        save.connect('clicked', () => {
            let selectedProvider = providerList.get_string(provider.get_selected()).toLowerCase();
            this.schema.set_string("llm-provider", selectedProvider);
            this.schema.set_string("anthropic-api-key", anthropicApiKey.get_buffer().get_text());
            this.schema.set_string("openai-api-key", openaiApiKey.get_buffer().get_text());
            this.schema.set_string("gemini-api-key", geminiApiKey.get_buffer().get_text());
            this.schema.set_string("llm-model", model.get_buffer().get_text());
            this.schema.set_string("openai-model", openaiModel.get_buffer().get_text());
            this.schema.set_string("gemini-model", geminiModel.get_buffer().get_text());
            this.schema.set_string("human-message-color", `${humanColor.get_rgba().to_string()}`);
            this.schema.set_string("llm-message-color", `${llmColor.get_rgba().to_string()}`);
            this.schema.set_string("human-message-text-color", `${humanTextColor.get_rgba().to_string()}`);
            this.schema.set_string("llm-message-text-color", `${llmTextColor.get_rgba().to_string()}`);
            statusLabel.set_markup(_("Preferences Saved")); // Updated
        });

        // Displaying everything
        // col, row, 1, 1
        this.main.attach(labelProvider, 0, 0, 1, 1);
        this.main.attach(provider, 2, 0, 2, 1);

        this.main.attach(labelAnthropicAPI, 0, 1, 1, 1);
        this.main.attach(anthropicApiKey, 2, 1, 2, 1);
        this.main.attach(howToAnthropicAPI, 4, 1, 2, 1);

        this.main.attach(labelOpenAIAPI, 0, 2, 1, 1);
        this.main.attach(openaiApiKey, 2, 2, 2, 1);
        this.main.attach(howToOpenAIAPI, 4, 2, 1, 1);

        this.main.attach(labelGeminiAPI, 0, 3, 1, 1);
        this.main.attach(geminiApiKey, 2, 3, 2, 1);
        this.main.attach(howToGeminiAPI, 4, 3, 1, 1);

        this.main.attach(labelModel, 0, 4, 1, 1);
        this.main.attach(model, 2, 4, 2, 1);
        this.main.attach(howToModel, 4, 4, 1, 1);

        this.main.attach(labelOpenAIModel, 0, 5, 1, 1);
        this.main.attach(openaiModel, 2, 5, 2, 1);
        this.main.attach(howToOpenAIModel, 4, 5, 1, 1);

        this.main.attach(labelGeminiModel, 0, 6, 1, 1);
        this.main.attach(geminiModel, 2, 6, 2, 1);
        this.main.attach(howToGeminiModel, 4, 6, 1, 1);


        this.main.attach(labelHumanColor, 0, 7, 1, 1);
        this.main.attach(humanColor, 2, 7, 2, 1);

        this.main.attach(labelHumanTextColor, 0, 8, 1, 1);
        this.main.attach(humanTextColor, 2, 8, 2, 1);

        this.main.attach(labelLLMColor, 0, 9, 1, 1);
        this.main.attach(llmColor, 2, 9, 2, 1);

        this.main.attach(labelLLMTextColor, 0, 10, 1, 1);
        this.main.attach(llmTextColor, 2, 10, 2, 1);

        this.main.attach(save, 2, 13, 1, 1);
        this.main.attach(statusLabel, 0, 14, 4, 1);

        this.ui.add(this.main);
    }
}
