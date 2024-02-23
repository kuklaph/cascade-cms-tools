import { components, utils, initializeCascadeAPI } from "./exports.js";

// Create Menu
chrome.runtime.onInstalled.addListener(async (details) => {
  utils.log("info", "basic", "ITS Cascade Assistant Started ✅");

  chrome.contextMenus.create({
    id: "open-cascade-current",
    title: "Open in Cascade (New)",
    contexts: ["all"],
  });
  chrome.contextMenus.create({
    id: "open-cascade-archived",
    title: "Open in Cascade (Old)",
    contexts: ["all"],
  });

  if (details.reason === "install") {
    await utils.storage.setLocalStorage({
      showModal: true,
      verboseLogs: false,
      requestLogs: false,
    });
  }
});

// Context menu on right click
chrome.contextMenus.onClicked.addListener((info) => {
  switch (info.menuItemId) {
    case "open-cascade-archived":
      components.cascade.modules.openInCascade.run(info, "archived");
      break;
    case "open-cascade-current":
      components.cascade.modules.openInCascade.run(info, "current");
      break;

    default:
      break;
  }
});

// This listens for all runtime messages
chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  const { action, fromModule, toModule, data } = message;
  utils.log("info", "verbose", action, fromModule, toModule, data);

  /*
    Modules are top level folders ie only 1 case per module
    Any actions within the module go within a sub switch
  */
  switch (toModule) {
    // Init
    case "initialize":
      utils.log(
        "info",
        "verbose",
        `${fromModule} => Background => initialize => Listener =`,
        message
      );
      switch (action) {
        case "saveAPIKey":
          initializeCascadeAPI(data).then((d) => {
            utils.handleAlert(fromModule, "API key saved");
            sendResponse(d);
          });
          break;

        default:
          break;
      }
      break;
    // Cascade
    case "showRelationships":
      utils.log(
        "info",
        "verbose",
        `${fromModule} => Background => showRelationships => Listener =`,
        message
      );
      switch (action) {
        case "generateRelationships":
          components.cascade.modules.getRelationships.getRelationships
            .run(data)
            .then(sendResponse);
          break;
        case "generateFolderInfo":
          components.cascade.modules.getRelationships.getFolderInfo
            .run(data)
            .then(sendResponse);
          break;

        default:
          break;
      }
      break;

    // Utility
    case "global":
      switch (action) {
        case "showAlert":
          utils.log(
            "info",
            "verbose",
            `${fromModule} => Background => alertModule => Listener =`,
            message
          );
          utils.handleAlert(fromModule, data);
          sendResponse(true);
          break;
        case "sendLogs":
          utils.log(data.consoleType, data.logType, ...data.logs);
          sendResponse(true);
          break;
        case "getCurrentTab":
          utils.log(
            "info",
            "verbose",
            `${fromModule} => Background => getCurrentTab => Listener =`,
            message
          );
          utils.getCurrentTab(data).then(sendResponse);
          break;
        case "getLocalStorage":
          utils.log(
            "info",
            "verbose",
            `${fromModule} => Background => getLocalStorage => Listener =`,
            message
          );
          utils.storage.getLocalStorage(data).then(sendResponse);
          break;
        case "setLocalStorage":
          utils.log(
            "info",
            "verbose",
            `${fromModule} => Background => setLocalStorage => Listener =`,
            message
          );
          utils.storage.setLocalStorage(data).then(sendResponse);
          break;
      }
      break;

    default:
      utils.log(
        "info",
        "basic",
        "No module found in ./background.js message listener"
      );
      break;
  }

  // Async behavior
  return true;
});
