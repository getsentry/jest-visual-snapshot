import { promises as fs } from "fs";
import path from "path";

import { getBrowser } from "./browser";

const queue: Promise<string | Buffer>[] = [];

type SnapshotParams = {
  fileName: string;
  html: string;
  testName: string;
  output: string;
  css?: string;
};

const createSnapshot = async ({
  html,
  fileName,
  css,
  output,
}: SnapshotParams) => {
  const browser = await getBrowser();
  const page = await browser.newPage();
  const outputPath = path.resolve(output);

  try {
    await fs.mkdir(outputPath, { recursive: true });
  } catch {
    // eslint-disable-line
  }

  const imagePath = path.resolve(outputPath, `${fileName}.png`);

  await page.setContent(html);

  if (css) {
    page.addStyleTag({
      content: css,
    });
  }

  return await page.screenshot({
    path: imagePath,
    fullPage: true,
  });
};

export const addSnapshot = (options: SnapshotParams) => {
  const promise = createSnapshot(options);
  queue.push(promise);
  return promise;
};

export default async function visualSnapshotGlobalTeardown() {
  const browser = await getBrowser();
  try {
    await Promise.all(queue);
  } catch (err) {
    console.error(err);
  }

  await browser.close();
}
