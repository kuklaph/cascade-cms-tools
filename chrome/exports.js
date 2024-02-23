// Cascade
import * as openInCascade from "./cascade/modules/openInCascade/background/main.js";
import * as getRelationships from "./cascade/modules/showRelationships/background.js";

// Utils exports
import { sendFetch } from "./utils/fetch.js";
import { log } from "./utils/log.js";
import * as storage from "./utils/storage.js";
import { handleAlert } from "./utils/alerts/background.js";
import { getCurrentTab } from "./utils/tabs.js";
import { sendMessage } from "./utils/messages.js";
import * as general from "./utils/general.js";

/*NOTE - cascadeAPI
  This needs to stay as direct export so it creates a "live link" to the reference of cascadeAPI.
  Otherwise when using import, it imports a static "reference" of the initial variable (which has the null values).
  This means that when the initializeCascade function runs and updates the variable with a user API key, the import static reference is not updated.
*/
export { cascadeAPI, initializeCascadeAPI } from "./utils/cascadeAPI.js";

export const components = {
  cascade: {
    modules: {
      openInCascade: {
        run: openInCascade.default,
      },
      getRelationships: {
        getFolderInfo: { run: getRelationships.getFolderInfo },
        getRelationships: { run: getRelationships.getRelationships },
      },
    },
  },
};

export const utils = {
  sendFetch,
  log,
  domainName: "uncw", // Change this
  fullDomain: "uncw.edu", // Change this; no http or https
  siteIDs: {
    current: "", // prod
    archived: "", // maybe if you want reference to an older archived site
    news: "", // left over from our environment; delete if you want
    events: "", // left over from our environment; delete if you want
    staging: "", // left over from our environment; delete if you want
  },
  handleAlert,
  storage,
  general,
  getCurrentTab,
  sendMessage,
};
