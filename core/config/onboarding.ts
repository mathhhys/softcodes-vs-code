import { SerializedSoftcodesConfig } from "../index.js";
import { FREE_TRIAL_MODELS } from "./default.js";

export const TRIAL_FIM_MODEL = "codestral-latest";
export const ONBOARDING_LOCAL_MODEL_TITLE = "Ollama";

export function setupApiKeysMode(
  config: SerializedSoftcodesConfig,
): SerializedSoftcodesConfig {
  return {
    ...config,
    models: config.models.filter((model) => model.provider !== "free-trial"),
    embeddingsProvider: {
      provider: "free-trial",
    },
    reranker: {
      name: "free-trial",
    },
  };
}

export function setupLocalMode(
  config: SerializedSoftcodesConfig,
): SerializedSoftcodesConfig {
  return {
    ...config,
    models: [
      {
        title: "Llama 3",
        provider: "ollama",
        model: "llama3",
      },
      {
        title: ONBOARDING_LOCAL_MODEL_TITLE,
        provider: "ollama",
        model: "AUTODETECT",
      },
      ...config.models.filter((model) => model.provider !== "free-trial"),
    ],
    tabAutocompleteModel: {
      title: "Starcoder 3b",
      provider: "ollama",
      model: "starcoder2:3b",
    },
    embeddingsProvider: {
      provider: "ollama",
      model: "nomic-embed-text",
    },
    reranker: undefined,
  };
}

export function setupFreeTrialMode(
  config: SerializedSoftcodesConfig,
): SerializedSoftcodesConfig {
  return {
    ...config,
    models: [
      ...FREE_TRIAL_MODELS,
      ...config.models.filter((model) => model.provider !== "free-trial"),
    ],
    tabAutocompleteModel: {
      title: "Tab Autocomplete",
      provider: "free-trial",
      model: TRIAL_FIM_MODEL,
    },
    embeddingsProvider: {
      provider: "free-trial",
    },
    reranker: {
      name: "free-trial",
    },
  };
}

export function setupLocalAfterFreeTrial(
  config: SerializedSoftcodesConfig,
): SerializedSoftcodesConfig {
  return {
    ...config,
    models: [
      {
        title: "Llama 3",
        provider: "ollama",
        model: "llama3",
      },
      {
        title: ONBOARDING_LOCAL_MODEL_TITLE,
        provider: "ollama",
        model: "AUTODETECT",
      },
      ...config.models.filter((model) => model.provider !== "free-trial"),
    ],
  };
}
