import { utils, cascadeAPI } from "../../../exports.js";

export async function getFolderInfo() {
  const tab = await utils.getCurrentTab();
  const urlObj = new URL(tab.url);
  const assetId = urlObj.searchParams.get("id");
  try {
    const res = await cascadeAPI.read({
      identifier: { id: assetId, type: "folder" },
    });
    return res;
  } catch (error) {
    utils.handleAlert("showRelationships", error.message);
  }
}

export async function getRelationships(asset) {
  try {
    const res = await cascadeAPI.listSubscribers({
      identifier: { id: asset.id, type: asset.type },
    });
    return res;
  } catch (error) {
    utils.handleAlert("showRelationships", error.message);
  }
}
