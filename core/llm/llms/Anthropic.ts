import {
  ChatMessage,
  CompletionOptions,
  LLMOptions,
  ModelProvider,
} from "../../index.js";
import { stripImages } from "../images.js";
import { BaseLLM } from "../index.js";
import { streamSse } from "../stream.js";
import * as dotenv from 'dotenv';
import { AuthState } from '../../../extensions/vscode/src/clerk-auth';
dotenv.config(); // Load environment variables from .env file

class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

class Anthropic extends BaseLLM {
  static providerName: ModelProvider = "anthropic";
  static defaultOptions: Partial<LLMOptions> = {
    model: "claude-3-5-sonnet-20240620",
    contextLength: 200_000,
    completionOptions: {
      model: "claude-3-5-sonnet-20240620",
      maxTokens: 4096,
    },
    apiBase: "https://api.anthropic.com/v1/",
  };

  // Reference to the singleton auth state
  private authState = AuthState.getInstance();

  constructor(options: LLMOptions) {
    super(options);
    this._initializeApiKey();
  }

  private async _getApiKey(): Promise<string> {
    // First check authentication state
    if (!this.authState.isAuthenticated) {
      throw new AuthError('User is not authenticated. Please log in to use the Anthropic API.');
    }
    
    // If authenticated, proceed with API key retrieval
    const apiKey = process.env.API_KEY_ANTHROPIC;
  
    if (!apiKey) {
      throw new Error('API_KEY_ANTHROPIC is not set in environment variables');
    }
  
    return apiKey;
  }

  private async _initializeApiKey() {
    if (!this.apiKey) {
      try {
        this.apiKey = await this._getApiKey();
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

  private _convertArgs(options: CompletionOptions) {
    const finalOptions = {
      top_k: options.topK,
      top_p: options.topP,
      temperature: options.temperature,
      max_tokens: options.maxTokens ?? 2048,
      model: options.model === "claude-2" ? "claude-2.1" : options.model,
      stop_sequences: options.stop?.filter((x) => x.trim() !== ""),
      stream: options.stream ?? true,
    };

    return finalOptions;
  }

  private _convertMessages(msgs: ChatMessage[]): any[] {
    const messages = msgs
      .filter((m) => m.role !== "system")
      .map((message) => {
        if (typeof message.content === "string") {
          return message;
        }
        return {
          ...message,
          content: message.content.map((part) => {
            if (part.type === "text") {
              return part;
            }
            return {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: part.imageUrl?.url.split(",")[1],
              },
            };
          }),
        };
      });
    return messages;
  }

  // Check authentication before making any API requests
  private async _checkAuth() {
    if (!this.authState.isAuthenticated) {
      throw new AuthError('User is not authenticated. Please log in to use the Anthropic API.');
    }
  }

  protected async *_streamComplete(
    prompt: string,
    options: CompletionOptions,
  ): AsyncGenerator<string> {
    // Check authentication first
    await this._checkAuth();
    
    const messages = [{ role: "user" as const, content: prompt }];
    for await (const update of this._streamChat(messages, options)) {
      yield stripImages(update.content);
    }
  }

  protected async *_streamChat(
    messages: ChatMessage[],
    options: CompletionOptions,
  ): AsyncGenerator<ChatMessage> {
    // Check authentication first
    await this._checkAuth();
    
    // Try to initialize API key
    await this._initializeApiKey();
    
    if (!this.apiKey) {
      throw new AuthError('Unable to initialize API key. Please check your authentication.');
    }
    
    try {
      const response = await this.fetch(new URL("messages", this.apiBase), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "anthropic-version": "2023-06-01",
          "x-api-key": this.apiKey as string,
        },
        body: JSON.stringify({
          ...this._convertArgs(options),
          messages: this._convertMessages(messages),
          system: this.systemMessage,
        }),
      });
  
      if (options.stream === false) {
        const data = await response.json();
        yield { role: "assistant", content: data.content[0].text };
        return;
      }
  
      for await (const value of streamSse(response)) {
        if (value.delta?.text) {
          yield { role: "assistant", content: value.delta.text };
        }
      }
    } catch (error) {
      // Handle network errors or API errors
      console.error('Error during API call:', error);
      throw error;
    }
  }
}

export default Anthropic;