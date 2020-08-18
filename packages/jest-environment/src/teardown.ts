import { promises as fs } from "fs";
import path from "path";

import { getBrowser, killBrowser } from "./browser";

const queue: Promise<any>[] = [];

type SnapshotParams = {
  fileName: string;
  html: string;
  testName: string;
  output: string;
  saveImage: boolean;
  saveHtml: boolean;
  css?: string;
};

const createSnapshot = async ({
  html,
  fileName,
  testName,
  css,
  output,
  saveImage,
  saveHtml,
}: SnapshotParams) => {
  const outputPath = path.resolve(output);

  try {
    await fs.mkdir(outputPath, { recursive: true });
  } catch {
    // eslint-disable-line
  }

  if (saveImage) {
    const browser = await getBrowser();
    const page = await browser.newPage();
    const imagePath = path.resolve(outputPath, `${fileName}.png`);

    await page.setContent(html);

    if (css) {
      await page.addStyleTag({
        content: `${css}
        #__vs_canvas {
          position: relative;
        }
        `,
      });
    }

    const el = await page.$("#__vs_canvas");
    try {
      await (el ? el : page).screenshot({
        path: imagePath,
      });
    } catch (err) {
      if (err.message === "Node has 0 height.") {
        console.error(new Error(`${testName}: ${err}`));
        console.warn("...snapshotting full page instead");
        return await page.screenshot({
          path: imagePath,
        });
      }

      throw err;
    }

    await page.close();
  }

  if (saveHtml) {
    const filePath = path.resolve(outputPath, `${fileName}.html`);

    await fs.writeFile(filePath, html);
  }

  return true;
};

export const addSnapshot = (options: SnapshotParams) => {
  const promise = createSnapshot(options);
  queue.push(promise);
  return promise;
};

export default async function visualSnapshotGlobalTeardown() {
  try {
    await Promise.all(queue);
    console.log("going to killing browser");
    await killBrowser();
    return true;
  } catch (err) {
    console.error(err);
  }
}
