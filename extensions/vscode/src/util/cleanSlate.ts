import { getSoftcodesGlobalPath } from "core/util/paths";
import { ExtensionContext } from "vscode";
import fs from "fs";

/**
 * Clear all Softcodes-related artifacts to simulate a brand new user
 */
export function cleanSlate(context: ExtensionContext) {
  // Commented just to be safe
  // // Remove ~/.softcodes
  // const softcodesPath = getSoftcodesGlobalPath();
  // if (fs.existsSync(softcodesPath)) {
  //   fs.rmSync(softcodesPath, { recursive: true, force: true });
  // }
  // // Clear extension's globalState
  // context.globalState.keys().forEach((key) => {
  //   context.globalState.update(key, undefined);
  // });
}
