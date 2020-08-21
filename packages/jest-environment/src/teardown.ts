import { promises as fs } from "fs";
import path from "path";

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
  output,
  saveHtml,
}: SnapshotParams) => {
  const outputPath = path.resolve(output);

  try {
    await fs.mkdir(outputPath, { recursive: true });
  } catch {
    // eslint-disable-line
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
    return true;
  } catch (err) {
    console.error(err);
  }
}
