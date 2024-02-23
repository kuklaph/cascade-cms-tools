/**
 * @param {Object} param
 * @param {Number} [param.s] - The amount of seconds to sleep
 * @param {Number} [param.ms] - The amount of milliseconds to sleep
 * @returns {Promise}
 */
export function sleep({ s, ms } = {}) {
  s = s * 1000;
  return new Promise((resolve) => setTimeout(resolve, ms ? ms : s));
}
