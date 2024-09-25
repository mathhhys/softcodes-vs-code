import { CONTROL_PLANE_URL } from "../../control-plane/client.js";
import {
  ContextItem,
  ContextProviderDescription,
  ContextProviderExtras,
  ContextSubmenuItem,
  LoadSubmenuItemsArgs,
} from "../../index.js";
import { BaseContextProvider } from "../index.js";

class SoftcodesProxyContextProvider extends BaseContextProvider {
  static description: ContextProviderDescription = {
    title: "softcodes-proxy",
    displayTitle: "Softcodes Proxy",
    description: "Retrieve a context item from a Softcodes for Teams add-on",
    type: "submenu",
  };

  workOsAccessToken: string | undefined = undefined;

  override get description(): ContextProviderDescription {
    return {
      title:
        this.options.title || SoftcodesProxyContextProvider.description.title,
      displayTitle:
        this.options.displayTitle ||
        SoftcodesProxyContextProvider.description.displayTitle,
      description:
        this.options.description ||
        SoftcodesProxyContextProvider.description.description,
      type: this.options.type || SoftcodesProxyContextProvider.description.type,
    };
  }

  async loadSubmenuItems(
    args: LoadSubmenuItemsArgs,
  ): Promise<ContextSubmenuItem[]> {
    const response = await args.fetch(
      new URL(`/proxy/context/${this.options.id}/list`, CONTROL_PLANE_URL),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.workOsAccessToken}`,
        },
      },
    );
    const data = await response.json();
    return data.items;
  }

  async getContextItems(
    query: string,
    extras: ContextProviderExtras,
  ): Promise<ContextItem[]> {
    const response = await extras.fetch(
      new URL(`/proxy/context/${this.options.id}/retrieve`, CONTROL_PLANE_URL),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.workOsAccessToken}`,
        },
        body: JSON.stringify({
          query: query || "",
          fullInput: extras.fullInput,
        }),
      },
    );

    const items: any = await response.json();
    return items;
  }
}

export default SoftcodesProxyContextProvider;
