/**
 * General Alert Handler
 * @param {String} fromModule - The module where the message is being sent from
 * @param {String} data - The data or message being sent
 * @param {Object} tabs - If within a chrome.tabs.query context, include the tabs
 */
export function handleAlert(fromModule, data, tabs = false) {
  const alert = {
    action: "showAlert",
    fromModule,
    toModule: "global",
    data,
  };
  if (!tabs) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, alert);
    });
  } else {
    chrome.tabs.sendMessage(tabs[0].id, alert);
  }
}
