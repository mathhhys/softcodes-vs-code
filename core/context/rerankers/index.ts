import { RerankerName } from "../../index.js";
import { CohereReranker } from "./cohere.js";
import { SoftcodesProxyReranker } from "./SoftcodesProxyReranker.js";
import { FreeTrialReranker } from "./freeTrial.js";
import { LLMReranker } from "./llm.js";
import { HuggingFaceTEIReranker } from "./tei.js";
import { VoyageReranker } from "./voyage.js";

export const AllRerankers: { [key in RerankerName]: any } = {
  cohere: CohereReranker,
  llm: LLMReranker,
  voyage: VoyageReranker,
  "free-trial": FreeTrialReranker,
  "huggingface-tei": HuggingFaceTEIReranker,
  "softcodes-proxy": SoftcodesProxyReranker,
};
