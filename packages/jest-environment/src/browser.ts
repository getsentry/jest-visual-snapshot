import puppeteer, { Browser } from "puppeteer";

import type { VisualSnapshotConfig } from "./Environment";

const DEFAULT_CONFIG_CI = {
  launch: {
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  },
  exitOnPageError: true,
};

let browser: Browser | null;

export async function getBrowser(config?: VisualSnapshotConfig) {
  if (browser) {
    return browser;
  }

  browser = await puppeteer.launch(
    process.env.CI ? DEFAULT_CONFIG_CI.launch : config?.puppeteer?.launch
  );

  return browser;
}

export async function killBrowser() {
  if (browser) {
    await browser.close();
  }
  browser = null;
}
