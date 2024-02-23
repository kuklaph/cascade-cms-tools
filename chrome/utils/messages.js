import { getCurrentTab } from "./tabs.js";

/**
 *
 * @param {Object} message - Message
 * @param {String} message.action - The action to take
 * @param {String} message.fromModule - The module the message is coming from
 * @param {String} message.toModule - The module the message is going to
 * @param {Any} message.data - The data to send
 * @param {"tab"} [type] - tab or null
 * @returns
 */
export async function sendMessage(message, type) {
  const tab = await getCurrentTab();
  return new Promise((resolve, reject) => {
    if (type === "tab") {
      chrome.tabs.sendMessage(tab.id, { ...message, ...tab }, (r) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError.message);
        }
        resolve(r);
      });
    } else {
      chrome.runtime.sendMessage(message, (r) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError.message);
        }
        resolve(r);
      });
    }
  });
}
