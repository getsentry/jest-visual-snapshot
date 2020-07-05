import { getBrowser } from "./browser";
import type { VisualSnapshotConfig } from "./Environment";

export default function visualSnapshotGlobalSetup(
  config?: VisualSnapshotConfig
) {
  getBrowser();
}
