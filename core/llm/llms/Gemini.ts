import {
  ChatMessage,
  CompletionOptions,
  LLMOptions,
  MessagePart,
  ModelProvider,
} from "../../index.js";
import { stripImages } from "../images.js";
import { BaseLLM } from "../index.js";
import { streamResponse } from "../stream.js";
import * as dotenv from 'dotenv';
import { AuthState } from '../../../extensions/vscode/src/clerk-auth';
dotenv.config();

// Authentication error class
class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

class Gemini extends BaseLLM {
  static providerName: ModelProvider = "gemini";

  static defaultOptions: Partial<LLMOptions> = {
    model: "gemini-pro",
    apiBase: "https://generativelanguage.googleapis.com/v1beta/",
  };

  private _apiKey: string | null = null;
  
  // Reference to the singleton auth state
  private authState = AuthState.getInstance();

  constructor(options: Partial<LLMOptions> = {}) {
    super({
      ...Gemini.defaultOptions,
      ...options,
      model: options.model || Gemini.defaultOptions.model || 'gemini-pro'
    } as LLMOptions);
    this._initializeApiKey();
  }

  private async _initializeApiKey() {
    if (!this._apiKey) {
      try {
        this._apiKey = await this._getApiKey();
      } catch (error) {
        if (error instanceof AuthError) {
          console.error('Authentication error:', error.message);
          // We'll re-throw this error when making actual API calls
        } else {
          throw error; // Re-throw other errors immediately
        }
      }
    }
  }

  private async _getApiKey(): Promise<string> {
    // First check authentication state
    if (!this.authState.isAuthenticated) {
      throw new AuthError('User is not authenticated. Please log in to use the Gemini API.');
    }
    
    // If authenticated, proceed with API key retrieval
    const apiKey = process.env.API_KEY_GEMINI;
  
    if (!apiKey) {
      throw new Error('API_KEY_GEMINI is not set in environment variables');
    }
  
    return apiKey;
  }
  
  // Check authentication before making any API requests
  private async _checkAuth() {
    if (!this.authState.isAuthenticated) {
      throw new AuthError('User is not authenticated. Please log in to use the Gemini API.');
    }
  }

  // Function to convert completion options to Gemini format
  private _convertArgs(options: CompletionOptions) {
    const finalOptions: any = {}; // Initialize an empty object

    // Map known options
    if (options.topK) {
      finalOptions.topK = options.topK;
    }
    if (options.topP) {
      finalOptions.topP = options.topP;
    }
    if (options.temperature !== undefined && options.temperature !== null) {
      finalOptions.temperature = options.temperature;
    }
    if (options.maxTokens) {
      finalOptions.maxOutputTokens = options.maxTokens;
    }
    if (options.stop) {
      finalOptions.stopSequences = options.stop.filter((x) => x.trim() !== "");
    }

    return { generationConfig: finalOptions }; // Wrap options under 'generationConfig'
  }

  protected async *_streamComplete(
    prompt: string,
    options: CompletionOptions,
  ): AsyncGenerator<string> {
    // Check authentication first
    await this._checkAuth();
    
    // Make sure API key is initialized
    await this._initializeApiKey();
    
    if (!this._apiKey) {
      throw new AuthError('Unable to initialize API key. Please check your authentication.');
    }
    
    try {
      for await (const message of this._streamChat(
        [{ content: prompt, role: "user" }],
        options,
      )) {
        yield stripImages(message.content);
      }
    } catch (error) {
      console.error('Error during API call:', error);
      throw error;
    }
  }

  private removeSystemMessage(messages: ChatMessage[]) {
    const msgs = [...messages];

    if (msgs[0]?.role === "system") {
      const sysMsg = msgs.shift()?.content;
      // @ts-ignore
      if (msgs[0]?.role === "user") {
        msgs[0].content = `System message - follow these instructions in every response: ${sysMsg}\n\n---\n\n${msgs[0].content}`;
      }
    }

    return msgs;
  }

  protected async *_streamChat(
    messages: ChatMessage[],
    options: CompletionOptions,
  ): AsyncGenerator<ChatMessage> {
    // Check authentication first
    await this._checkAuth();
    
    // Make sure API key is initialized
    await this._initializeApiKey();
    
    if (!this._apiKey) {
      throw new AuthError('Unable to initialize API key. Please check your authentication.');
    }
    
    try {
      // Ensure this.apiBase is used if available, otherwise use default
      const apiBase =
        this.apiBase ||
        Gemini.defaultOptions?.apiBase ||
        "https://generativelanguage.googleapis.com/v1beta/";
      // Determine if it's a v1 API call based on apiBase
      const isV1API = apiBase.includes("/v1/");

      // Conditionally apply removeSystemMessage
      const convertedMsgs = isV1API
        ? this.removeSystemMessage(messages)
        : messages;

      if (options.model.includes("gemini")) {
        for await (const message of this.streamChatGemini(
          convertedMsgs,
          options,
        )) {
          yield message;
        }
      } else {
        for await (const message of this.streamChatBison(
          convertedMsgs,
          options,
        )) {
          yield message;
        }
      }
    } catch (error) {
      console.error('Error during API call:', error);
      throw error;
    }
  }

  private _softcodesPartToGeminiPart(part: MessagePart) {
    return part.type === "text"
      ? {
          text: part.text,
        }
      : {
          inlineData: {
            mimeType: "image/jpeg",
            data: part.imageUrl?.url.split(",")[1],
          },
        };
  }
  

  private async *streamChatGemini(
    messages: ChatMessage[],
    options: CompletionOptions,
  ): AsyncGenerator<ChatMessage> {
    await this._initializeApiKey(); // Ensure API key is initialized
    
    if (!this._apiKey) {
      throw new AuthError('Unable to initialize API key. Please check your authentication.');
    }
    
    try {
      const apiURL = new URL(
        `models/${options.model}:streamGenerateContent?key=${this._apiKey}`,
        this.apiBase,
      );
      // This feels hacky to repeat code from above function but was the quickest
      // way to ensure system message re-formatting isn't done if user has specified v1
      const apiBase =
        this.apiBase ||
        Gemini.defaultOptions?.apiBase ||
        "https://generativelanguage.googleapis.com/v1beta/";
      // Determine if it's a v1 API call based on apiBase
      const isV1API = apiBase.includes("/v1/");

      const contents = messages
        .map((msg) => {
          if (msg.role === "system" && !isV1API) {
            return null; // Don't include system message in contents
          }
          return {
            role: msg.role === "assistant" ? "model" : "user",
            parts:
              typeof msg.content === "string"
                ? [{ text: msg.content }]
                : msg.content.map(this._softcodesPartToGeminiPart),
          };
        })
        .filter((c) => c !== null);
      const body = {
        ...this._convertArgs(options),
        contents,
        // if this.systemMessage is defined, reformat it for Gemini API
        ...(this.systemMessage &&
          !isV1API && {
            systemInstruction: { parts: [{ text: this.systemMessage }] },
          }),
      };
      const response = await this.fetch(apiURL, {
        method: "POST",
        body: JSON.stringify(body),
      });

      let buffer = "";
      for await (const chunk of streamResponse(response)) {
        buffer += chunk;
        if (buffer.startsWith("[")) {
          buffer = buffer.slice(1);
        }
        if (buffer.endsWith("]")) {
          buffer = buffer.slice(0, -1);
        }
        if (buffer.startsWith(",")) {
          buffer = buffer.slice(1);
        }

        const parts = buffer.split("\n,");

        let foundIncomplete = false;
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          let data;
          try {
            data = JSON.parse(part);
          } catch (e) {
            foundIncomplete = true;
            continue; // yo!
          }
          if (data.error) {
            throw new Error(data.error.message);
          }
          // Check for existence of each level before accessing the final 'text' property
          if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            // Incrementally stream the content to make it smoother
            const content = data.candidates[0].content.parts[0].text;
            const words = content.split(/(\s+)/);
            const delaySeconds = Math.min(4.0 / (words.length + 1), 0.1);
            while (words.length > 0) {
              const wordsToYield = Math.min(3, words.length);
              yield {
                role: "assistant",
                content: words.splice(0, wordsToYield).join(""),
              };
              await delay(delaySeconds);
            }
          } else {
            // Handle the case where the expected data structure is not found
            console.warn("Unexpected response format:", data);
          }
        }
        if (foundIncomplete) {
          buffer = parts[parts.length - 1];
        } else {
          buffer = "";
        }
      }
    } catch (error) {
      console.error('Error during API call:', error);
      throw error;
    }
  }

  private async *streamChatBison(
    messages: ChatMessage[],
    options: CompletionOptions,
  ): AsyncGenerator<ChatMessage> {
    await this._initializeApiKey(); // Ensure API key is initialized
    
    if (!this._apiKey) {
      throw new AuthError('Unable to initialize API key. Please check your authentication.');
    }
    
    try {
      const msgList = [];
      for (const message of messages) {
        msgList.push({ content: message.content });
      }

      const apiURL = new URL(
        `models/${options.model}:generateMessage?key=${this._apiKey}`,
        this.apiBase,
      );
      const body = { prompt: { messages: msgList } };
      const response = await this.fetch(apiURL, {
        method: "POST",
        body: JSON.stringify(body),
      });
      const data = await response.json();
      yield { role: "assistant", content: data.candidates[0].content };
    } catch (error) {
      console.error('Error during API call:', error);
      throw error;
    }
  }
}

async function delay(seconds: number) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

export default Gemini;
