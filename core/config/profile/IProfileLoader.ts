// ProfileHandlers manage the loading of a config, allowing us to abstract over different ways of getting to a SoftcodesConfig

import { SoftcodesConfig } from "../../index.js";

// After we have the SoftcodesConfig, the ConfigHandler takes care of everything else (loading models, lifecycle, etc.)
export interface IProfileLoader {
  profileTitle: string;
  profileId: string;
  doLoadConfig(): Promise<SoftcodesConfig>;
  setIsActive(isActive: boolean): void;
}
