import { utils } from "../exports.js";
import { CascadeAPI } from "./api/main.js";
import { getLocalStorage } from "./storage.js";

export var cascadeAPI = CascadeAPI({ apiKey: null, url: null });

export async function getAPI() {
  const stored = await getLocalStorage("apiKey");
  return stored;
}

export const initializeCascadeAPI = async (apiKey) => {
  if (!apiKey) {
    apiKey = await getAPI();
  }
  cascadeAPI = CascadeAPI({
    apiKey,
    url: `https://${utils.domainName}.cascadecms.com/api/v1/`,
  });
};

initializeCascadeAPI();
