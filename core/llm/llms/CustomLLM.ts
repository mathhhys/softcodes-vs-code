import { BaseLLM } from "../index.js";
import {
  ChatMessage,
  CompletionOptions,
  CustomLLM,
  ModelProvider,
} from "../../index.js";

class CustomLLMClass extends BaseLLM {
  get providerName(): ModelProvider {
    return "custom";
  }

  private customStreamCompletion?: (
    prompt: string,
    options: CompletionOptions,
    fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
  ) => AsyncGenerator<string>;

  private customStreamChat?: (
    messages: ChatMessage[],
    options: CompletionOptions,
    fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
  ) => AsyncGenerator<string>;

  constructor(custom: CustomLLM) {
    const options = custom.options || {};

    // Validate model property
    if (!options.model || typeof options.model !== 'string') {
      throw new Error(
        `Invalid or missing 'model' in CustomLLMClass constructor. ` +
        `Please provide a valid model name in the options. Received: ${JSON.stringify(options)}`
      );
    }

    console.log("Options in CustomLLMClass constructor:", options);
    super(options);
    this.customStreamCompletion = custom.streamCompletion;
    this.customStreamChat = custom.streamChat;
  }

  protected async *_streamChat(
    messages: ChatMessage[],
    options: CompletionOptions,
  ): AsyncGenerator<ChatMessage> {
    if (this.customStreamChat) {
      for await (const content of this.customStreamChat(
        messages,
        options,
        (...args) => this.fetch(...args),
      )) { // Added missing closing parenthesis here
        yield { role: "assistant", content };
      }
    } else {
      for await (const update of super._streamChat(messages, options)) { // Added missing closing parenthesis here
        yield update;
      }
    }
  }

  protected async *_streamComplete(
    prompt: string,
    options: CompletionOptions,
  ): AsyncGenerator<string> {
    if (this.customStreamCompletion) {
      for await (const content of this.customStreamCompletion(
        prompt,
        options,
        (...args) => this.fetch(...args),
      )) { // Added missing closing parenthesis here
        yield content;
      }
    } else if (this.customStreamChat) {
      for await (const content of this.customStreamChat(
        [{ role: "user", content: prompt }],
        options,
        (...args) => this.fetch(...args),
      )) { // Added missing closing parenthesis here
        yield content;
      }
    } else {
      throw new Error(
        "Either streamCompletion or streamChat must be defined in a custom LLM in config.ts",
      );
    }
  }
}

export default CustomLLMClass;