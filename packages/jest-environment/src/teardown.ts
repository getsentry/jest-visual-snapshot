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

  const promises: Promise<any>[] = [];

  if (saveImage) {
    const browser = await getBrowser();
    const page = await browser.newPage();
    const imagePath = path.resolve(outputPath, `${fileName}.png`);

    await page.setContent(html);

    if (css) {
      await page.addStyleTag({
        content: css,
      });
    }

    const el = await page.$("#__vs_canvas");

    promises.push(
      (el || page).screenshot({
        path: imagePath,
      })
    );
  }

  if (saveHtml) {
    const filePath = path.resolve(outputPath, `${fileName}.html`);

    promises.push(fs.writeFile(filePath, html));
  }

  return await Promise.all(promises);
};

export const addSnapshot = (options: SnapshotParams) => {
  const promise = createSnapshot(options);
  queue.push(promise);
  return promise;
};

export default async function visualSnapshotGlobalTeardown() {
  try {
    await Promise.all(queue);
    await killBrowser();
    return true;
  } catch (err) {
    console.error(err);
  }
}
