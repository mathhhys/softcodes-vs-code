import {
  ChatMessage,
  CompletionOptions,
  LLMOptions,
  ModelProvider,
} from "../../index.js";
import { stripImages } from "../images.js";
import { BaseLLM } from "../index.js";
import { streamSse } from "../stream.js";
import { Storage } from '@google-cloud/storage';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs/promises';
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

const NON_CHAT_MODELS = [
  "text-davinci-002",
  "text-davinci-003",
  "code-davinci-002",
  "text-ada-001",
  "text-babbage-001",
  "text-curie-001",
  "davinci",
  "curie",
  "babbage",
  "ada",
];

const CHAT_ONLY_MODELS = [
  "gpt-3.5-turbo",
  "gpt-3.5-turbo-0613",
  "gpt-3.5-turbo-16k",
  "gpt-4",
  "gpt-4.1-2025-04-14",
  "gpt-4.1-mini-2025-04-14",
  "gpt-4.1-nano-2025-04-14",
  "gpt-4-turbo",
  "gpt-4o",
  "gpt-35-turbo-16k",
  "gpt-35-turbo-0613",
  "gpt-35-turbo",
  "gpt-4-32k",
  "gpt-4-turbo-preview",
  "gpt-4-vision",
  "gpt-4-0125-preview",
  "gpt-4-1106-preview",
  "gpt-4o-mini",
];

// Models we want to display when using AUTODETECT
const PREFERRED_MODEL_PATTERNS = [
  "gpt-3.5-turbo",
  "gpt-4",
  "gpt-4o",
  "gpt-4-32k",
  "gpt-4-turbo",
  "gpt-4-vision",
];

class OpenAI extends BaseLLM {
  protected _apiKey: string | null = null;
  public useLegacyCompletionsEndpoint: boolean | undefined = undefined;
  protected maxStopWords: number | undefined = undefined;
  
  // Reference to the singleton auth state
  private authState = AuthState.getInstance();

  constructor(options: LLMOptions) {
    super(options);
    this.useLegacyCompletionsEndpoint = options.useLegacyCompletionsEndpoint;
    this.apiVersion = options.apiVersion ?? "2023-07-01-preview";
    this._initializeApiKey();
  }

  static providerName: ModelProvider = "openai";
  static defaultOptions: Partial<LLMOptions> = {
    apiBase: "https://api.openai.com/v1/",
  };

  private async _getApiKey(): Promise<string> {
    // First check authentication state
    if (!this.authState.isAuthenticated) {
      throw new AuthError('User is not authenticated. Please log in to use the OpenAI API.');
    }
    
    // If authenticated, proceed with API key retrieval
    const apiKey = process.env.API_KEY_OPENAI;
  
    if (!apiKey) {
      throw new Error('API_KEY_OPENAI is not set in environment variables');
    }
  
    return apiKey;
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

  // Check authentication before making any API requests
  private async _checkAuth() {
    if (!this.authState.isAuthenticated) {
      throw new AuthError('User is not authenticated. Please log in to use the OpenAI API.');
    }
  }

  protected _convertMessage(message: ChatMessage) {
    if (typeof message.content === "string") {
      return message;
    } else if (!message.content.some((item) => item.type !== "text")) {
      return {
        ...message,
        content: message.content.map((item) => item.text).join(""),
      };
    }

    const parts = message.content.map((part) => {
      const msg: any = {
        type: part.type,
        text: part.text,
      };
      if (part.type === "imageUrl") {
        msg.image_url = { ...part.imageUrl, detail: "low" };
        msg.type = "image_url";
      }
      return msg;
    });
    return {
      ...message,
      content: parts,
    };
  }

  protected _convertModelName(model: string): string {
    return model;
  }

  protected _convertArgs(options: any, messages: ChatMessage[]) {
    const url = new URL(this.apiBase!);
    const finalOptions = {
      messages: messages.map(this._convertMessage),
      model: this._convertModelName(options.model),
      max_tokens: options.maxTokens,
      temperature: options.temperature,
      top_p: options.topP,
      frequency_penalty: options.frequencyPenalty,
      presence_penalty: options.presencePenalty,
      stop:
        this.maxStopWords !== undefined
          ? options.stop?.slice(0, this.maxStopWords)
          : url.host === "api.studio.nebius.com"
          ? options.stop?.slice(0, 16)
          : url.port === "1337" ||
            url.host === "api.openai.com" ||
            url.host === "api.groq.com" ||
            this.apiType === "azure"
          ? options.stop?.slice(0, 4)
          : options.stop,
    };

    return finalOptions;
  }

  protected _getHeaders() {
    if (!this._apiKey) {
      console.error("API key is not initialized. Current state:", this._apiKey);
      throw new Error('API key not initialized');
    }
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this._apiKey}`,
      "api-key": this._apiKey,
    };
  }

  protected async _complete(
    prompt: string,
    options: CompletionOptions,
  ): Promise<string> {
    // Check authentication first
    await this._checkAuth();
    
    // Initialize API key if needed
    await this._initializeApiKey();
    
    if (!this._apiKey) {
      throw new AuthError('Unable to initialize API key. Please check your authentication.');
    }
    
    let completion = "";
    try {
      for await (const chunk of this._streamChat(
        [{ role: "user", content: prompt }],
        options,
      )) {
        completion += chunk.content;
      }
    } catch (error) {
      console.error('Error during API call:', error);
      throw error;
    }
    
    return completion;
  }

  protected _getEndpoint(
    endpoint: "chat/completions" | "completions" | "models",
  ) {
    if (this.apiType === "azure") {
      return new URL(
        `openai/deployments/${this.engine}/${endpoint}?api-version=${this.apiVersion}`,
        this.apiBase,
      );
    }
    if (!this.apiBase) {
      throw new Error(
        "No API base URL provided. Please set the 'apiBase' option in config.json",
      );
    }

    return new URL(endpoint, this.apiBase);
  }

  protected async *_streamComplete(
    prompt: string,
    options: CompletionOptions,
  ): AsyncGenerator<string> {
    // Check authentication first
    await this._checkAuth();
    
    // Initialize API key if needed
    await this._initializeApiKey();
    
    if (!this._apiKey) {
      throw new AuthError('Unable to initialize API key. Please check your authentication.');
    }
    
    try {
      for await (const chunk of this._streamChat(
        [{ role: "user", content: prompt }],
        options,
      )) {
        yield stripImages(chunk.content);
      }
    } catch (error) {
      console.error('Error during API call:', error);
      throw error;
    }
  }
  
  protected async *_legacystreamComplete(
    prompt: string,
    options: CompletionOptions,
  ): AsyncGenerator<string> {
    // Check authentication first
    await this._checkAuth();
    
    // Initialize API key if needed
    await this._initializeApiKey();
    
    if (!this._apiKey) {
      throw new AuthError('Unable to initialize API key. Please check your authentication.');
    }
    
    try {
      const args: any = this._convertArgs(options, []);
      args.prompt = prompt;
      args.messages = undefined;
  
      const response = await this.fetch(this._getEndpoint("completions"), {
        method: "POST",
        headers: this._getHeaders(),
        body: JSON.stringify({
          ...args,
          stream: true,
        }),
      });
  
      for await (const value of streamSse(response)) {
        if (value.choices?.[0]?.text && value.finish_reason !== "eos") {
          yield value.choices[0].text;
        }
      }
    } catch (error) {
      console.error('Error during API call:', error);
      throw error;
    }
  }

  protected async *_streamChat(
    messages: ChatMessage[],
    options: CompletionOptions,
  ): AsyncGenerator<ChatMessage> {
    // Check authentication first
    await this._checkAuth();
    
    // Initialize API key if needed
    await this._initializeApiKey();
    
    if (!this._apiKey) {
      throw new AuthError('Unable to initialize API key. Please check your authentication.');
    }
    
    try {
      if (
        !CHAT_ONLY_MODELS.includes(options.model) &&
        this.supportsCompletions() &&
        (NON_CHAT_MODELS.includes(options.model) ||
          this.useLegacyCompletionsEndpoint ||
          options.raw)
      ) {
        for await (const content of this._legacystreamComplete(
          stripImages(messages[messages.length - 1]?.content || ""),
          options,
        )) {
          yield {
            role: "assistant",
            content,
          };
        }
        return;
      }
  
      const body = {
        ...this._convertArgs(options, messages),
        stream: true,
      };
      body.messages = body.messages.map((m) => ({
        ...m,
        content: m.content === "" ? " " : m.content,
      })) as any;
      const response = await this.fetch(this._getEndpoint("chat/completions"), {
        method: "POST",
        headers: this._getHeaders(),
        body: JSON.stringify(body),
      });
  
      for await (const value of streamSse(response)) {
        if (value.choices?.[0]?.delta?.content) {
          yield value.choices[0].delta;
        }
      }
    } catch (error) {
      console.error('Error during API call:', error);
      throw error;
    }
  }

  async *_streamFim(
    prefix: string,
    suffix: string,
    options: CompletionOptions,
  ): AsyncGenerator<string> {
    // Check authentication first
    await this._checkAuth();
    
    // Initialize API key if needed
    await this._initializeApiKey();
    
    if (!this._apiKey) {
      throw new AuthError('Unable to initialize API key. Please check your authentication.');
    }
    
    try {
      const endpoint = new URL("fim/completions", this.apiBase);
      const resp = await this.fetch(endpoint, {
        method: "POST",
        body: JSON.stringify({
          model: options.model,
          prompt: prefix,
          suffix,
          max_tokens: options.maxTokens,
          temperature: options.temperature,
          top_p: options.topP,
          frequency_penalty: options.frequencyPenalty,
          presence_penalty: options.presencePenalty,
          stop: options.stop,
          stream: true,
        }),
        headers: this._getHeaders(),
      });
    
      for await (const chunk of streamSse(resp)) {
        yield chunk.choices[0].delta.content;
      }
    } catch (error) {
      console.error('Error during API call:', error);
      throw error;
    }
  }

  async listModels(): Promise<string[]> {
    // Check authentication first
    await this._checkAuth();
    
    // Initialize API key if needed
    await this._initializeApiKey();
    
    if (!this._apiKey) {
      throw new AuthError('Unable to initialize API key. Please check your authentication.');
    }
    
    try {
      const response = await this.fetch(this._getEndpoint("models"), {
        method: "GET",
        headers: this._getHeaders(),
      });
  
      const data = await response.json();
      
      // Filter models to only include preferred ones
      const filteredModels = data.data
        .map((m: any) => m.id)
        .filter((id: string) => {
          // Only include models that match one of our preferred patterns
          return PREFERRED_MODEL_PATTERNS.some(pattern => id.includes(pattern));
        });
      
      console.log("Filtered OpenAI models:", filteredModels);
      return filteredModels;
    } catch (error) {
      console.error('Error during API call:', error);
      throw error;
    }
  }
}

export default OpenAI;