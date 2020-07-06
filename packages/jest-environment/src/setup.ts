import { promises as fs } from "fs";

import { getBrowser } from "./browser";
import type { VisualSnapshotConfig } from "./Environment";

export default async function visualSnapshotGlobalSetup(
  config?: VisualSnapshotConfig
) {
  getBrowser();

  if (config?.output) {
    await fs.mkdir(config.output);
  }
}
