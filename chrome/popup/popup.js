const fromModule = {
  fromModule: "popup",
};
const alertMessage = {
  action: "showAlert",
  ...fromModule,
  toModule: "global",
  data: "Could not get data store",
};

document.addEventListener("DOMContentLoaded", async () => {
  const store = await handleLocalStorage("get");
  const ids = ["showModal", "showRowContent", "verboseLogs", "requestLogs"];
  ids.forEach((id) => {
    const element = document.getElementById(id);
    element.checked = store?.[id] === true;
  });
});

const eventListeners = {
  click: [
    {
      id: "saveApiKey",
      func: async () => {
        try {
          const apiKey = document.getElementById("apiKey");
          await handleLocalStorage("set", { apiKey: apiKey.value });
          await sendMessage({
            action: "saveAPIKey",
            ...fromModule,
            toModule: "initialize",
            data: apiKey.value,
          });
          apiKey.value = "";
        } catch (error) {
          sendAlert(`saveApiKey: ${error.message}`);
        }
      },
    },
  ],
  change: [
    {
      id: "showModal",
      func: async (event) => {
        const isChecked = event.target.checked;
        await setToggleStateToLocalStorage(isChecked, "showModal");
      },
    },
    {
      id: "showRowContent",
      func: async (event) => {
        const isChecked = event.target.checked;
        await setToggleStateToLocalStorage(isChecked, "showRowContent");
      },
    },
    {
      id: "verboseLogs",
      func: async (event) => {
        const isChecked = event.target.checked;
        await setToggleStateToLocalStorage(isChecked, "verboseLogs");
      },
    },
    {
      id: "requestLogs",
      func: async (event) => {
        const isChecked = event.target.checked;
        await setToggleStateToLocalStorage(isChecked, "requestLogs");
      },
    },
  ],
};

for (const key in eventListeners) {
  if (Object.hasOwnProperty.call(eventListeners, key)) {
    const configs = eventListeners[key];
    configs.forEach((fig) => {
      document.getElementById(fig.id).addEventListener(key, fig.func);
    });
  }
}

async function handleLocalStorage(action, data, msg) {
  let store;
  if (action == "get") {
    store = await getLocalStorage(data);
  } else {
    store = await setLocalStorage(data);
  }
  if (store.error) {
    sendAlert(msg);
  }
  return store;
}

async function setToggleStateToLocalStorage(value, key) {
  const store = await getLocalStorage();
  store[key] = value;
  await setLocalStorage(store);
}

function sendAlert(msg) {
  if (msg) {
    alertMessage.data = msg;
  }
  sendMessage(alertMessage);
}

async function getLocalStorage(storageKeys) {
  return await sendMessage({
    action: "getLocalStorage",
    ...fromModule,
    toModule: "global",
    data: storageKeys,
  });
}
async function setLocalStorage(data) {
  return await sendMessage({
    action: "setLocalStorage",
    ...fromModule,
    toModule: "global",
    data,
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
function sendMessage(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (r) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError.message);
      }
      resolve(r);
    });
  });
}
