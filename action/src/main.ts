import { promises as fs } from "fs";
import path from "path";

import * as glob from "@actions/glob";
import * as core from "@actions/core";

import puppeteer from "puppeteer";

const DEFAULT_CONFIG_CI = {
  launch: {
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage"
    ]
  },
  exitOnPageError: true
};

async function run(): Promise<void> {
  try {
    const basePath = core.getInput("basePath");
    const cssPath = core.getInput("cssPath");

    const globber = await glob.create(`${basePath}/**/*.html`);
    const files = await globber.glob();

    const browser = await puppeteer.launch(DEFAULT_CONFIG_CI.launch);
    const page = await browser.newPage();

    if (cssPath) {
      let css = await fs.readFile(cssPath, "utf8");
      css = css.replace(/[\r\n]+/g, "");

      await page.addStyleTag({
        content: `${css}
        #__vs_canvas {
          position: relative;
        }
        `
      });
    }

    for (const file of files) {
      const slug = path.basename(file, ".html");
      const imagePath = path.resolve(basePath, `${slug}.png`);
      const html = await fs.readFile(file, "utf8");
      await page.setContent(html);
      const el = await page.$("#__vs_canvas");
      try {
        await (el ? el : page).screenshot({
          path: imagePath
        });
      } catch (err) {
        console.error(new Error(`${slug}: ${err}`));
        if (err.message === "Node has 0 height.") {
          console.warn("...snapshotting full page instead");
          await page.screenshot({
            path: imagePath
          });
          return;
        }
      }
    }

    await browser.close();
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
