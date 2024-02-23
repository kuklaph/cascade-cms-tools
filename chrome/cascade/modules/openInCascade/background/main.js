import { utils, cascadeAPI } from "../../../../exports.js";
import { extractDecodedUrl } from "./utils.js";

// Opens the Cascade page in a new tab
export default async function run(info, where) {
  const inputUrl = info.selectionText ?? info.linkUrl ?? info.pageUrl ?? "";
  const tab = await utils.getCurrentTab();

  try {
    const data = await readCascade(inputUrl, where);
    if (data) {
      chrome.tabs.create({
        url: `https://${utils.domainName}.cascadecms.com/entity/open.act?id=${data.id}&type=${data.type}`,
      });
    } else {
      throw new Error("Could not find in Cascade");
    }
  } catch (error) {
    utils.log("warn", "verbose", error);
    utils.handleAlert("openInCascade", error.message, tab);
  }
}

function formatPath(url, where) {
  let siteId =
    where == "archived" ? utils.siteIDs.archived : utils.siteIDs.current;

  // Make sure you have updated utils.SiteIDs to match your current site(s) structure.
  const escapedSiteUrl = utils.fullDomain.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  ); // escapes special characters
  /*
  Accounts for asset paths coppied from Cascade.
  Our site starts with an underscore: _site so this looks for a path that reflects this
  ( _site: | _site ) - If your production folder doesn't have an underscore, remove them in the regex below.
 */
  const domainRegex = new RegExp(
    `(_${escapedSiteUrl}: |_${escapedSiteUrl})`,
    "g"
  );

  // Is it a safelink? If so, parse it
  if (url.includes("safelinks.")) {
    url = extractDecodedUrl(url);
  }

  let path = url
    // Remove Wayback prefix and various forms of the base domain
    .replace(/^https?:\/\/wayback\.archive-it\.org\/\d+\/\d+\//, "")
    .replace(/\.html$/, "")
    .replace(domainRegex, `https://${utils.fullDomain}`);

  utils.log("info", "verbose", path);
  const formedUrl = new URL(path);
  path = formedUrl.pathname;

  // Is it a news article? Or events?
  if (url.includes(`${utils.fullDomain}/news/`)) {
    // news
    siteId = utils.siteIDs.news;
    path = path.replace("news/", "");
  } else if (url.includes(`${utils.fullDomain}/events/`)) {
    // events
    siteId = utils.siteIDs.events;
    path = path.replace("events/", "");
  }

  if (path.startsWith("/")) {
    path = path.slice(1, undefined);
  }

  return { path, siteId };
}

// Fetch Read
async function readCascade(url, where) {
  let { path, siteId } = formatPath(url, where);

  const checks = [
    {
      searchType: ["page"],
      mod: () => {
        if (where !== "archived") {
          if (!path) {
            path = "index";
          } else {
            path = path.endsWith("/") ? path + "index" : path + "/index";
          }
        }
      },
    },
    {
      searchType: ["folder"],
      mod: () => {
        path = path.replace("/index", "");
      },
    },
    {
      searchType: ["block"],
      mod: () => {},
    },
    {
      searchType: ["file"],
      mod: () => {},
    },
    {
      searchType: [],
      mod: () => {},
    },
  ];

  const checkAssetType = async (baseSearch) => {
    utils.log("info", "verbose", baseSearch);
    const search = await cascadeAPI.search(baseSearch);
    utils.log("info", "verbose", search);
    return search.matches;
  };

  let data = null;
  for (const check of checks) {
    if (data) {
      break;
    }
    check.mod();
    utils.log("info", "verbose", path, check.searchType);
    const baseSearch = {
      searchInformation: {
        searchTypes: check.searchType,
        searchTerms: `"${path}"`,
        searchFields: ["path"],
        siteId,
      },
    };
    const [exists] = await checkAssetType(baseSearch);
    if (exists) {
      data = exists;
    }
  }

  return data;
}
