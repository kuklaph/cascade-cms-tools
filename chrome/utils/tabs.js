export async function getCurrentTab({
  active = true,
  lastFocusedWindow = true,
  ...others
} = {}) {
  const [tab] = await chrome.tabs.query({
    active,
    lastFocusedWindow,
    ...others,
  });
  return tab;
}
