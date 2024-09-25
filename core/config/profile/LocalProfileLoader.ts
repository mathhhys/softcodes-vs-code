import { ControlPlaneClient } from "../../control-plane/client.js";
import { SoftcodesConfig, IDE, IdeSettings } from "../../index.js";
import doLoadConfig from "./doLoadConfig.js";
import { IProfileLoader } from "./IProfileLoader.js";

export default class LocalProfileLoader implements IProfileLoader {
  static ID = "local";
  profileId = LocalProfileLoader.ID;
  profileTitle = "Local Config";

  constructor(
    private ide: IDE,
    private ideSettingsPromise: Promise<IdeSettings>,
    private controlPlaneClient: ControlPlaneClient,
    private writeLog: (message: string) => Promise<void>,
  ) {}

  async doLoadConfig(): Promise<SoftcodesConfig> {
    return doLoadConfig(
      this.ide,
      this.ideSettingsPromise,
      this.controlPlaneClient,
      this.writeLog,
      undefined,
    );
  }

  setIsActive(isActive: boolean): void {}
}
