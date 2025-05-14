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
      models.gpt41,
      models.gpt41mini,
      models.gpt41nano,
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
      models.claude37Sonnet,
      models.claude35Sonnet,
      models.claude3Opus,
      models.claude3Sonnet,
      models.claude3Haiku
    ],
    apiKeyUrl: "https://console.anthropic.com/account/keys",
  },
  gemini: {
    title: "Google Gemini API",
    provider: "gemini",
    refPage: "geminiapi",
    description:
      "Try out Google's state-of-the-art Gemini model from their API.",
    longDescription: `To get started with Google Gemini API, obtain your API key from [here](https://ai.google.dev/tutorials/workspace_auth_quickstart) and paste it below.`,
    icon: "gemini.png",
    packages: [
      models.gemini25Pro,
      models.gemini25Flash,
      models.gemini20Flash,
      models.gemini15Pro,
      models.gemini15Flash,
      models.geminiPro
    ],
    apiKeyUrl: "https://aistudio.google.com/app/apikey",
  },
};
