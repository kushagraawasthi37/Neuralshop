import { logger } from "./logger.js";

const PING_INTERVAL_MS = 2.5 * 60 * 1000;
const HEALTH_PATH = "/api/healthCheck";

let timer = null;

export function startKeepAlive() {
  if (timer) return;

  const base = process.env.RENDER_EXTERNAL_URL || process.env.PUBLIC_BASE_URL;
  if (!base) {
    logger.info(
      "keep-alive disabled — set RENDER_EXTERNAL_URL or PUBLIC_BASE_URL to enable",
    );
    return;
  }

  const url = base.replace(/\/+$/, "") + HEALTH_PATH;

  const ping = async () => {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 10_000);
      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(t);
      logger.info(`keep-alive ping ${res.status} ${url}`);
    } catch (err) {
      logger.warn(`keep-alive ping failed: ${err.message}`);
    }
  };

  timer = setInterval(ping, PING_INTERVAL_MS);
  if (timer.unref) timer.unref();
  logger.info(`keep-alive started — pinging ${url} every 2.5min`);
}

export function stopKeepAlive() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}
