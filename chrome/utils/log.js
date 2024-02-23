import { utils } from "../exports.js";

/**
 * @param {"info" | "warn" | "log" | "error" | "assert"} type
 * @param {"basic" | "verbose" | "request"} messageType
 * @param {(string | any[])[]} message
 */
export async function log(type, messageType, ...message) {
  try {
    const stored = await utils.storage.getLocalStorage();
    if (messageType === "basic") {
      console[type](...message);
    }

    if (stored.verboseLogs && messageType === "verbose") {
      console[type](...message);
    }

    if (stored.requestLogs && messageType === "request") {
      console[type](...message);
    }
  } catch (error) {
    console.error(error);
  }
}
