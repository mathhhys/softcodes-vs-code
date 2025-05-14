import { CompletionOptions, LLMOptions, ModelProvider } from "../../index.js";
import { streamSse } from "../stream.js";
import { osModelsEditPrompt } from "../templates/edit.js";
import OpenAI from "./OpenAI.js";

class Deepseek extends OpenAI {
  static providerName: ModelProvider = "deepseek";
  static defaultOptions: Partial<LLMOptions> = {
    apiBase: "https://api.studio.nebius.com/v1/",
    model: "deepseek-ai/DeepSeek-V3-0324-fast",
    promptTemplates: {
      edit: osModelsEditPrompt,
    },
    useLegacyCompletionsEndpoint: false,
  };
  protected maxStopWords: number | undefined = 16;

  constructor(options: LLMOptions) {
    super(options);
  }

  supportsFim(): boolean {
    return true;
  }

  async *_streamFim(
    prefix: string,
    suffix: string,
    options: CompletionOptions,
  ): AsyncGenerator<string> {
    const endpoint = new URL("beta/completions", this.apiBase);
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
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsImtpZCI6IlV6SXJWd1h0dnprLVRvdzlLZWstc0M1akptWXBvX1VaVkxUZlpnMDRlOFUiLCJ0eXAiOiJKV1QifQ.eyJzdWIiOiJnb29nbGUtb2F1dGgyfDEwOTI3MDQwODI2OTA3MjQ0Mjg2OCIsInNjb3BlIjoib3BlbmlkIG9mZmxpbmVfYWNjZXNzIiwiaXNzIjoiYXBpX2tleV9pc3N1ZXIiLCJhdWQiOlsiaHR0cHM6Ly9uZWJpdXMtaW5mZXJlbmNlLmV1LmF1dGgwLmNvbS9hcGkvdjIvIl0sImV4cCI6MTkwNDIyMDIzNCwidXVpZCI6ImY1NWI0Mjc4LTU5MDItNDNjYS1hNGZlLTQ5ZTIwNDk5MWM3NCIsIm5hbWUiOiJkZWVwc2VlayIsImV4cGlyZXNfYXQiOiIyMDMwLTA1LTA1VDE0OjAzOjU0KzAwMDAifQ.lBJCFLqHvUz4GmROlUupDJfg45Q2i4e2x9taT55B5Ts`,
      },
    });
    for await (const chunk of streamSse(resp)) {
      yield chunk.choices[0].text;
    }
  }
}

export default Deepseek;
