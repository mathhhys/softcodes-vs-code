import { ModelProvider } from "core";
import { HTMLInputTypeAttribute } from "react";
import { ModelProviderTags } from "../../../components/modelSelection/ModelProviderTag";
import { FREE_TRIAL_LIMIT_REQUESTS } from "../../../util/freeTrial";
import { completionParamsInputs } from "./completionParamsInputs";
import type { ModelPackage } from "./models";
import { models } from "./models";

export interface InputDescriptor {
  inputType: HTMLInputTypeAttribute;
  key: string;
  label: string;
  placeholder?: string;
  defaultValue?: string | number;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  required?: boolean;
  description?: string;
  [key: string]: any;
  // the following are used only for Watsonx provider
  // these attributes are used to determine whether the input is used in Api Authentication or Credentials section
  isWatsonxAuthenticatedByApiKey?: boolean;
  isWatsonxAuthenticatedByCredentials?: boolean;
  isWatsonxAttribute?: boolean;
}

export interface ProviderInfo {
  title: string;
  icon?: string;
  provider: ModelProvider;
  description: string;
  longDescription?: string;
  tags?: ModelProviderTags[];
  packages: ModelPackage[];
  params?: any;
  collectInputFor?: InputDescriptor[];
  refPage?: string;
  apiKeyUrl?: string;
  downloadUrl?: string;
}

const completionParamsInputsConfigs = Object.values(completionParamsInputs);

const openSourceModels = Object.values(models).filter(
  ({ isOpenSource }) => isOpenSource,
);

export const apiBaseInput: InputDescriptor = {
  inputType: "text",
  key: "apiBase",
  label: "API Base",
  placeholder: "e.g. http://localhost:8080",
  required: false,
};

export const providers: Partial<Record<ModelProvider, ProviderInfo>> = {
  openai: {
    title: "OpenAI",
    provider: "openai",
    description: "Supercharge your coding experience with the power of OpenAI's advanced language models.",
    longDescription:
      "Supercharge your coding experience with the power of OpenAI's advanced language models.",
    icon: "openai.png",
    packages: [
      models.gpt4o,
      models.gpt4omini,
      models.gpt4turbo,
      models.gpt35turbo,
      {
        ...models.AUTODETECT,
        params: {
          ...models.AUTODETECT.params,
        },
      },
    ],
    apiKeyUrl: "https://platform.openai.com/account/api-keys",
  },
  anthropic: {
    title: "Anthropic",
    provider: "anthropic",
    refPage: "anthropicllm",
    description:
      "Anthropic develops advanced models characterized by extensive context lengths and exceptional recall capabilities.",
    icon: "anthropic.png",
    longDescription:
      "Anthropic develops advanced models characterized by extensive context lengths and exceptional recall capabilities.",
    packages: [
      models.claude35Sonnet,
      models.claude3Opus,
      models.claude3Sonnet,
      models.claude3Haiku,
    ],
    apiKeyUrl: "https://console.anthropic.com/account/keys",
  },
  mistral: {
    title: "Mistral API",
    provider: "mistral",
    description:
      "The Mistral API provides seamless access to their models, including Codestral, Mistral 8x22B, Mistral Large, and more.",
    icon: "mistral.png",
    longDescription: `To get access to the Mistral API, obtain your API key from [here](https://console.mistral.ai/codestral) for Codestral or the [Mistral platform](https://docs.mistral.ai/) for all other models.`,
    tags: [ModelProviderTags.OpenSource],
    params: {
      apiKey: "",
    },
    packages: [
      models.codestral,
      models.codestralMamba,
      models.mistralLarge,
      models.mistralSmall,
      models.mistral8x22b,
      models.mistral8x7b,
      models.mistral7b,
    ],
    apiKeyUrl: "https://console.mistral.ai/codestral",
  },
  groq: {
    title: "Groq",
    provider: "groq",
    icon: "groq.png",
    description:
      "Groq is the fastest LLM provider by a wide margin, using 'LPUs' to serve open-source models at blazing speed.",
    longDescription:
      "To get started with Groq, obtain an API key from their website [here](https://wow.groq.com/).",
    tags: [ModelProviderTags.OpenSource],
    packages: [
      models.llama31405bChat,
      models.llama3170bChat,
      models.llama318bChat,
      { ...models.mixtralTrial, title: "Mixtral" },
      models.llama270bChat,
      {
        ...models.AUTODETECT,
        params: {
          ...models.AUTODETECT.params,
          title: "Groq",
        },
      },
    ],
    apiKeyUrl: "https://console.groq.com/keys",
  },
  deepseek: {
    title: "DeepSeek",
    provider: "deepseek",
    icon: "deepseek.png",
    description:
      "DeepSeek provides cheap inference of its DeepSeek Coder v2 and other impressive open-source models.",
    longDescription:
      "To get started with DeepSeek, obtain an API key from their website [here](https://platform.deepseek.com/api_keys).",
    tags: [ModelProviderTags.OpenSource],
    packages: [models.deepseekCoderApi, models.deepseekChatApi],
    apiKeyUrl: "https://platform.deepseek.com/api_keys",
  },
  gemini: {
    title: "Google Gemini API",
    provider: "gemini",
    refPage: "geminiapi",
    description:
      "Try out Google's state-of-the-art Gemini model from their API.",
    longDescription: `To get started with Google Gemini API, obtain your API key from [here](https://ai.google.dev/tutorials/workspace_auth_quickstart) and paste it below.`,
    icon: "gemini.png",
    packages: [models.gemini15Pro, models.geminiPro, models.gemini15Flash],
    apiKeyUrl: "https://aistudio.google.com/app/apikey",
  },
};
