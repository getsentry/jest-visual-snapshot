import puppeteer, { Browser } from "puppeteer";

import type { VisualSnapshotConfig } from "./Environment";

const DEFAULT_CONFIG_CI = {
  launch: {
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
  exitOnPageError: true,
};

let browser: Browser;

export async function getBrowser(config?: VisualSnapshotConfig) {
  if (browser) {
    return browser;
  }

  browser = await puppeteer.launch(
    process.env.CI ? DEFAULT_CONFIG_CI.launch : config?.puppeteer?.launch
  );

  return browser;
}
