import { SoftcodesProxyReranker } from "../../context/rerankers/SoftcodesProxyReranker.js";
import { ControlPlaneClient } from "../../control-plane/client.js";
import { TeamAnalytics } from "../../control-plane/TeamAnalytics.js";
import {
  SoftcodesRcJson,
  IDE,
  IdeSettings,
  SerializedSoftcodesConfig,
} from "../../index.js";
import SoftcodesProxyEmbeddingsProvider from "../../indexing/embeddings/SoftcodesProxyEmbeddingsProvider.js";
import SoftcodesProxy from "../../llm/llms/stubs/SoftcodesProxy.js";
import { Telemetry } from "../../util/posthog.js";
import { loadFullConfigNode } from "../load.js";

export default async function doLoadConfig(
  ide: IDE,
  ideSettingsPromise: Promise<IdeSettings>,
  controlPlaneClient: ControlPlaneClient,
  writeLog: (message: string) => Promise<void>,
  overrideConfigJson: SerializedSoftcodesConfig | undefined,
) {
  let workspaceConfigs: SoftcodesRcJson[] = [];
  try {
    workspaceConfigs = await ide.getWorkspaceConfigs();
  } catch (e) {
    console.warn("Failed to load workspace configs");
  }

  const ideInfo = await ide.getIdeInfo();
  const uniqueId = await ide.getUniqueId();
  const ideSettings = await ideSettingsPromise;
  const workOsAccessToken = await controlPlaneClient.getAccessToken();

  const newConfig = await loadFullConfigNode(
    ide,
    workspaceConfigs,
    ideSettings,
    ideInfo.ideType,
    uniqueId,
    writeLog,
    workOsAccessToken,
    overrideConfigJson,
  );
  newConfig.allowAnonymousTelemetry =
    newConfig.allowAnonymousTelemetry && (await ide.isTelemetryEnabled());

  // Setup telemetry only after (and if) we know it is enabled
  await Telemetry.setup(
    newConfig.allowAnonymousTelemetry ?? true,
    await ide.getUniqueId(),
    ideInfo.extensionVersion,
  );

  if (newConfig.analytics) {
    await TeamAnalytics.setup(
      newConfig.analytics as any, // TODO: Need to get rid of index.d.ts once and for all
      uniqueId,
      ideInfo.extensionVersion,
    );
  }

  [...newConfig.models, ...(newConfig.tabAutocompleteModels ?? [])].forEach(
    async (model) => {
      if (model.providerName === "softcodes-proxy") {
        (model as SoftcodesProxy).workOsAccessToken = workOsAccessToken;
      }
    },
  );

  if (newConfig.embeddingsProvider?.providerName === "softcodes-proxy") {
    (
      newConfig.embeddingsProvider as SoftcodesProxyEmbeddingsProvider
    ).workOsAccessToken = workOsAccessToken;
  }

  if (newConfig.reranker?.name === "softcodes-proxy") {
    (newConfig.reranker as SoftcodesProxyReranker).workOsAccessToken =
      workOsAccessToken;
  }

  return newConfig;
}
