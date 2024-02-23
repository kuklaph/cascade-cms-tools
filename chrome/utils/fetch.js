import { log } from "./log.js";

export async function sendFetch(url, params = {}, opts = { isJSON: true }) {
  log("info", "request", url, params);
  const request = await fetch(url, params);
  let data;
  if (opts.isJSON) {
    data = await request.json();
  }
  return data;
}
