//NOTE - chrome\global\content.js

// Global Tabs Listener
chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  const { action, fromModule, toModule, data } = message;
  switch (toModule) {
    case "global":
      log(
        "info",
        "verbose",
        `${fromModule} => Content => global => Listener =`,
        fromModule,
        message
      );
      switch (action) {
        case "showAlert":
          createToast(data);
          sendResponse(true);
          break;
        case "getWindowUrl":
          sendResponse(global_ITS_getWindowUrl());
          break;
      }
      break;

    default:
      log(
        "info",
        "basic",
        "No module found in ./global/content.js message listener",
        message
      );
      sendResponse(true);
      break;
  }
  return true;
});

function global_ITS_getWindowUrl() {
  return window.location.href;
}

/**
 *
 * @param {Function} callback - The callback function to continuously retry
 * @param {Number} ms - The delay between each run in milliseconds; default = 200
 * @param {Number} triesLeft - Number of retry attempts; default = 300
 * @returns {Promise}
 */
async function global_ITS_asyncInterval(callback, ms = 200, triesLeft = 300) {
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      const runCallBack = await callback();
      if (runCallBack) {
        resolve(runCallBack);
        clearInterval(interval);
      } else if (triesLeft <= 1) {
        reject();
        clearInterval(interval);
      }
      triesLeft--;
    }, ms);
  });
}

/**
 * Used to check if Cascade is loading a page etc
 * @returns {Boolean}
 * - Defaults to is loading; Returns true if not loading
 * - Another way to think about it is "Can we continue?" Default is false until finished loading which = true
 */
function global_ITS_isCascadeLoading() {
  const busy = document.querySelector(".nprogress-busy");
  log("info", "basic", "Loading...");
  if (!busy) {
    return true;
  }
  return false;
}

/**
 * @param {Object} param
 * @param {Number} [param.s] - The amount of seconds to sleep
 * @param {Number} [param.ms] - The amount of milliseconds to sleep
 * @returns {Promise}
 */
function global_ITS_sleep({ s, ms } = {}) {
  s = s * 1000;
  return new Promise((resolve) => setTimeout(resolve, ms ? ms : s));
}

//SECTION - UTIL
/**
 *
 * @param {String[] | String} storageKeys - An array of storage keys or singular key
 * @returns {Promise}
 */
async function global_ITS_getLocalStorage(storageKeys) {
  return await global_ITS_sendMessage({
    action: "getLocalStorage",
    fromModule: "global",
    toModule: "global",
    data: storageKeys,
  });
}
/**
 *
 * @param {Object} data - Needs to be in object key/value format when setting. If the key exists, it will overwrite the value.
 * @returns {Promise}
 */
async function global_ITS_setLocalStorage(data) {
  return await global_ITS_sendMessage({
    action: "setLocalStorage",
    fromModule: "global",
    toModule: "global",
    data,
  });
}
/**
 * @param {"info" | "warn" | "log" | "error" | "assert"} type
 * @param {"basic" | "verbose" | "request"} messageType
 * @param {(string | any[])[]} message
 */
async function log(type, messageType, ...message) {
  try {
    const stored = await global_ITS_getLocalStorage();
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

/**
 *
 * @param {Object} obj - The starting object container
 * @param {Boolean} [obj.active] - Optional: The active tab. True by default
 * @param {Boolean} [obj.lastFocusedWindow] - Optional: The last focused window. True by default
 * @returns {Promise}
 * @param {...*} [obj.others]
 */
async function global_ITS_getCurrentTab({
  active = true,
  lastFocusedWindow = true,
  ...others
} = {}) {
  return await global_ITS_sendMessage({
    action: "getCurrentTab",
    fromModule: "global",
    toModule: "global",
    data: { active, lastFocusedWindow, ...others },
  });
}

/**
 *
 * @param {Object} message - Message
 * @param {"showAlert" | String} message.action - The action to take
 * @param {String} message.fromModule - The module the message is coming from
 * @param {String} message.toModule - The module the message is going to
 * @param {Any} message.data - The data to send
 * @returns {Promise}
 */
function global_ITS_sendMessage(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (r) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError.message);
      }
      resolve(r);
    });
  });
}

/**
 *
 * @param {Object} obj - The starting object container
 * @param {String} obj.fromModule - The parent module you are working in
 * @param {String} obj.data - The data in this case would be a message string that will show in the alert
 * @returns {Promise}
 */
async function global_ITS_showAlert({ fromModule, data }) {
  const alertMessage = {
    action: "showAlert",
    fromModule,
    toModule: "global",
    data,
  };
  return await global_ITS_sendMessage(alertMessage);
}

/**
 *
 * @param {Object} htmlNode - Pass in the htmlNode to add the loader class to
 * @param {Object} [size] - An object containing html style attritbutes or a string with "small" or "medium" for presets. If left empty default size will take over
 * @param {String} [size.width] - Only if passing in custom object
 * @param {String} [size.height] - Only if passing in custom object
 */
function global_ITS_addLoaderClass(htmlNode, size) {
  htmlNode.classList.add("global_ITS_loader");
  const setSize = () => {
    switch (size) {
      case "small":
        htmlNode.style.width = "15px";
        htmlNode.style.height = "15px";
        break;
      case "medium":
        htmlNode.style.width = "30px";
        htmlNode.style.height = "30px";
        break;

      default:
        htmlNode.style.width = "60px";
        htmlNode.style.height = "60px";
        break;
    }
  };

  if (typeof size == "object") {
    const keys = Object.keys(size);
    if (!keys.includes("width") || !keys.includes("height")) {
      setSize();
    }
    for (const key in size) {
      if (Object.hasOwnProperty.call(size, key)) {
        const element = size[key];
        htmlNode.style[key] = element;
      }
    }
  } else {
    setSize();
  }
}

/**
 *
 * @param {Object} htmlNode - Pass in the htmlNode that has the loader class to toggle
 */
function global_ITS_toggleLoader(htmlNode) {
  htmlNode.classList.toggle("global_ITS_toggle");
}
