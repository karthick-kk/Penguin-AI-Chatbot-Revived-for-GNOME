import Soup from "gi://Soup";
import GLib from "gi://GLib";
import { LLMProviders, MessageRoles } from "./constants.js";

/**
 * Base class for LLM providers
 */
class LLMProvider {
    /**
     * Create a base LLM provider
     * @param {string} apiKey - API key for the provider
     * @param {string} model - Model name to use
     */
    constructor(apiKey, model) {
        this._apiKey = apiKey;
        this._model = model;
        this._httpSession = new Soup.Session();
        // Default timeout for reasoning models
        this._httpSession.timeout = 300; // 5 minutes timeout for reasoning models
    }

    /**
     * Set the request timeout
     * @param {number} timeoutSeconds - Timeout in seconds
     */
    setTimeout(timeoutSeconds) {
        this._httpSession.timeout = timeoutSeconds;
    }

    /**
     * Prepare HTTP message for the API request
     * @param {string} url - API endpoint URL
     * @param {object} requestBody - Request body object
     * @returns {Soup.Message} - Configured message object
     */
    _prepareRequest(url, requestBody) {
        const message = Soup.Message.new("POST", url);
        message.request_headers.append("content-type", "application/json");

        // Add provider-specific headers in subclasses
        this._addRequestHeaders(message);

        const body = JSON.stringify(requestBody);
        const bytes = GLib.Bytes.new(body);
        message.set_request_body_from_bytes("application/json", bytes);

        return message;
    }

    /**
     * Add provider-specific headers to the request
     * @param {Soup.Message} message - Message to modify
     */
    _addRequestHeaders(message) {
        // Implemented by subclasses
    }

    /**
     * Extract the response text from API response
     * @param {object} response - Parsed API response
     * @returns {string} - Extracted text
     */
    _extractResponseText(response) {
        // Implemented by subclasses
        return "";
    }

    /**
     * Format the chat history for the provider's API
     * @param {Array} history - Chat history array
     * @returns {object} - Formatted messages for the API
     */
    _formatMessages(history) {
        // Implemented by subclasses
        return [];
    }

    /**
     * Generate the request body for the API call
     * @param {Array} history - Chat history
     * @returns {object} - Request body object
     */
    _generateRequestBody(history) {
        // Implemented by subclasses
        return {};
    }

    /**
     * Send a request to the LLM API
     * @param {Array} history - Chat history
     * @param {Function} callback - Callback function for the response
     */
    sendRequest(history, callback) {
        const requestBody = this._generateRequestBody(history);
        const url = this._getEndpointUrl();
        const message = this._prepareRequest(url, requestBody);

        // Debug logging
        console.log(`[LLMProvider] Sending request to: ${url}`);

        this._httpSession.send_and_read_async(
            message,
            GLib.PRIORITY_DEFAULT,
            null,
            (session, result) => {
                try {
                    const status = message.get_status();
                    console.log(`[LLMProvider] Response status: ${status}`);
                    
                    let bytes;
                    try {
                        bytes = session.send_and_read_finish(result);
                    } catch (networkError) {
                        const errMsg = `Network error: ${networkError.message}\nURL: ${url}`;
                        console.error(`[LLMProvider] Network error: ${errMsg}`);
                        callback(new Error(errMsg), null);
                        return;
                    }
                    
                    if (!bytes) {
                        const errMsg = `No response data received\nURL: ${url}`;
                        console.error(`[LLMProvider] No data: ${errMsg}`);
                        callback(new Error(errMsg), null);
                        return;
                    }
                    
                    const decoder = new TextDecoder("utf-8");
                    const raw = decoder.decode(bytes.get_data());
                    console.log(`[LLMProvider] Response length: ${raw.length} chars`);
                    
                    if (status === Soup.Status.OK) {
                        let json;
                        try {
                            json = JSON.parse(raw);
                        } catch (parseError) {
                            const errMsg = `Failed to parse JSON: ${parseError.message}\nURL: ${url}\nRequest: ${JSON.stringify(requestBody)}\nRaw: ${raw}`;
                            console.error(`[LLMProvider] Parse error: ${errMsg}`);
                            callback(new Error(errMsg), null);
                            return;
                        }
                        
                        const text = this._extractResponseText(json);
                        console.log(`[LLMProvider] Extracted text length: ${text ? text.length : 0} chars`);
                        if (!text) {
                            const errMsg = `Response was empty.\nURL: ${url}\nRequest: ${JSON.stringify(requestBody)}\nRaw: ${raw}`;
                            console.error(`[LLMProvider] Empty response: ${errMsg}`);
                            callback(new Error(errMsg), null);
                        } else {
                            console.log(`[LLMProvider] Calling callback with success, text length: ${text.length}`);
                            console.log(`[LLMProvider] Callback function: ${callback.toString().substring(0, 200)}...`);
                            try {
                                const result = callback(null, text);
                                console.log(`[LLMProvider] Callback returned: ${result}`);
                                console.log(`[LLMProvider] Callback completed successfully`);
                            } catch (callbackError) {
                                console.error(`[LLMProvider] Error in callback: ${callbackError.message}`);
                                console.error(`[LLMProvider] Callback stack: ${callbackError.stack}`);
                            }
                        }
                    } else {
                        const errMsg = `HTTP error ${status}\nURL: ${url}\nRequest: ${JSON.stringify(requestBody)}\nResponse: ${raw}`;
                        console.error(`[LLMProvider] HTTP error: ${errMsg}`);
                        callback(new Error(errMsg), null);
                    }
                } catch (error) {
                    const errMsg = `Exception in response handler: ${error.message}\nURL: ${url}\nRequest: ${JSON.stringify(requestBody)}`;
                    console.error(`[LLMProvider] Exception: ${errMsg}`);
                    callback(new Error(errMsg), null);
                }
            }
        );
    }

    /**
     * Get the API endpoint URL
     * @returns {string} - Endpoint URL
     */
    _getEndpointUrl() {
        // Implemented by subclasses
        return "";
    }

    /**
     * Abort any ongoing requests
     */
    abort() {
        if (this._httpSession) {
            this._httpSession.abort();
        }
    }
}

/**
 * Anthropic Claude API provider
 */
class AnthropicProvider extends LLMProvider {
    /**
     * @inheritdoc
     */
    _addRequestHeaders(message) {
        message.request_headers.append("x-api-key", this._apiKey);
        message.request_headers.append("anthropic-version", "2023-06-01");
    }

    /**
     * @inheritdoc
     */
    _getEndpointUrl() {
        return "https://api.anthropic.com/v1/messages";
    }

    /**
     * @inheritdoc
     */
    _generateRequestBody(history) {
        return {
            model:    this._model,
            messages: history.map((msg) => ({
                role:    msg.role === MessageRoles.USER ? MessageRoles.USER : MessageRoles.ASSISTANT,
                content: msg.content,
            })),
            max_tokens: 1024,
        };
    }

    /**
     * @inheritdoc
     */
    _extractResponseText(response) {
        return response.content[0].text;
    }
}

/**
 * OpenAI API provider
 */
class OpenAIProvider extends LLMProvider {
    /**
     * @inheritdoc
     */
    _addRequestHeaders(message) {
        message.request_headers.append("Authorization", `Bearer ${this._apiKey}`);
    }

    /**
     * @inheritdoc
     */
    _getEndpointUrl() {
        return "https://api.openai.com/v1/chat/completions";
    }

    /**
     * @inheritdoc
     */
    _generateRequestBody(history) {
        return {
            model:    this._model,
            messages: history.map((msg) => ({
                role:    msg.role === MessageRoles.USER ? MessageRoles.USER : MessageRoles.ASSISTANT,
                content: msg.content,
            })),
            response_format: {
                type: "text",
            },
            temperature:           1,
            max_completion_tokens: 4096,
            top_p:                 1,
            frequency_penalty:     0,
            presence_penalty:      0,
        };
    }

    /**
     * @inheritdoc
     */
    _extractResponseText(response) {
        return response.choices[0].message.content;
    }
}

/**
 * Google Gemini API provider
 */
class GeminiProvider extends LLMProvider {
    /**
     * @inheritdoc
     */
    _getEndpointUrl() {
        return `https://generativelanguage.googleapis.com/v1beta/models/${this._model}:generateContent?key=${this._apiKey}`;
    }

    /**
     * @inheritdoc
     */
    _generateRequestBody(history) {
        return {
            contents: history.map((msg) => ({
                role:  msg.role === MessageRoles.USER ? MessageRoles.USER : "model",
                parts: [{ text: msg.content }],
            })),
            generationConfig: {
                temperature:      1,
                topK:             40,
                topP:             0.95,
                maxOutputTokens:  8192,
                responseMimeType: "text/plain",
            },
        };
    }

    /**
     * @inheritdoc
     */
    _extractResponseText(response) {
        return response.candidates[0].content.parts[0].text;
    }
}

/**
 * OpenRouter API provider
 */
class OpenRouterProvider extends LLMProvider {
    /**
     * @inheritdoc
     */
    _addRequestHeaders(message) {
        message.request_headers.append("Authorization", `Bearer ${this._apiKey}`);
    }

    /**
     * @inheritdoc
     */
    _getEndpointUrl() {
        return "https://openrouter.ai/api/v1/chat/completions";
    }

    /**
     * @inheritdoc
     */
    _generateRequestBody(history) {
        return {
            messages: history,
            model:    this._model,
        };
    }

    /**
     * @inheritdoc
     */
    _extractResponseText(response) {
        return response.choices[0].message.content;
    }
}

/**
 * Ollama local API provider
 */
class OllamaProvider extends LLMProvider {
    _getEndpointUrl() {
        // Use /api/chat for chat-based Ollama API
        return 'http://127.0.0.1:11434/api/chat';
    }

    _addRequestHeaders(message) {
        // No auth required for local Ollama Serve
    }

    _generateRequestBody(history) {
        // Only include messages with valid roles and non-empty content
        const messages = history
            .filter(msg => msg.role === MessageRoles.USER || msg.role === MessageRoles.ASSISTANT)
            .map(msg => ({
                role: msg.role === MessageRoles.USER ? 'user' : 'assistant',
                content: msg.content || ''
            }));
        // Ensure at least one user message exists
        if (messages.length === 0 || messages[0].role !== 'user') {
            // Fallback: send a dummy user message to avoid 400 error
            messages.unshift({ role: 'user', content: '' });
        }
        
        // Debug the model name
        console.log(`[OllamaProvider] Using model: "${this._model}"`);
        if (!this._model || this._model.trim() === '') {
            console.error('[OllamaProvider] Model name is empty! Check extension settings.');
        }
        
        return { 
            model: this._model, 
            messages,
            stream: false  // Disable streaming for better compatibility with GNOME extension
        };
    }

    _extractResponseText(response) {
        // With stream: false, Ollama /api/chat returns a single JSON object with message.content
        if (response.message && typeof response.message.content === 'string') {
            let content = response.message.content;
            // For deepseek-r1 and similar reasoning models, the content might contain 
            // <think>...</think> tags followed by the actual answer
            // Try to extract content after </think> tag if it exists
            const thinkEndIndex = content.indexOf('</think>');
            if (thinkEndIndex !== -1) {
                const afterThink = content.substring(thinkEndIndex + 8).trim(); // 8 = '</think>'.length
                if (afterThink) {
                    return afterThink;
                } else {
                }
            }
            return content;
        }
        if (typeof response.response === 'string') {
            return response.response;
        }
        if (response.choices?.[0]?.message?.content) {
            return response.choices[0].message.content;
        }
        if (response.completions?.[0]?.text) {
            return response.completions[0].text;
        }
        return '';
    }

}

/**
 * Factory for creating LLM provider instances
 */
export class LLMProviderFactory {
    /**
     * @param {string} providerType - Provider type identifier
     * @param {string} apiKey - API key for the provider
     * @param {string} model - Model to use
     * @returns {LLMProvider} - Provider instance
     */
    static createProvider(providerType, apiKey, model) {
        switch (providerType) {
            case LLMProviders.ANTHROPIC:
                return new AnthropicProvider(apiKey, model);
            case LLMProviders.OPENAI:
                return new OpenAIProvider(apiKey, model);
            case LLMProviders.GEMINI:
                return new GeminiProvider(apiKey, model);
            case LLMProviders.OPENROUTER:
                return new OpenRouterProvider(apiKey, model);
            case LLMProviders.OLLAMA:
                return new OllamaProvider(apiKey, model);
            default:
                return new AnthropicProvider(apiKey, model);
        }
    }
}

export {
    LLMProvider,
    AnthropicProvider,
    OpenAIProvider,
    GeminiProvider,
    OpenRouterProvider,
    OllamaProvider,
};
