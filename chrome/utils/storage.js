/**
 *
 * @param {String[] | String} storageKeys - An array of strings to get or single string
 * @returns {Promise}
 */
export function getLocalStorage(storageKeys = []) {
  if (storageKeys && !Array.isArray(storageKeys)) {
    storageKeys = [storageKeys];
  }
  return new Promise((resolve) => {
    chrome.storage.local.get(
      !storageKeys.length ? null : storageKeys,
      (data) => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError.message);
        }

        if (storageKeys.length == 1) {
          resolve(data?.[storageKeys]);
        } else if (storageKeys.length > 1) {
          resolve(data);
        } else {
          resolve(data || {});
        }
      }
    );
  });
}
/**
 *
 * @param {Object} incomingData - Object of keys/values to store. Existing properties will be updated based on key.
 * @returns {Promise}
 */
export function setLocalStorage(incomingData) {
  return new Promise((resolve) => {
    chrome.storage.local.set(incomingData, () => {
      if (chrome.runtime.lastError) {
        return reject({
          error: true,
          data: chrome.runtime.lastError.message,
        });
      }
      resolve({ error: false, data: true });
    });
  });
}
