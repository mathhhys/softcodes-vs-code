import { workspace } from "vscode";

export const SOFTCODES_WORKSPACE_KEY = "softcodes";

export function getSoftcodesWorkspaceConfig() {
  return workspace.getConfiguration(SOFTCODES_WORKSPACE_KEY);
}
