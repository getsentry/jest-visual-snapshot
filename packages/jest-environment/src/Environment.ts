import { promises as fs } from "fs";
import path from "path";

import type { Config } from "@jest/types";
import type { EnvironmentContext } from "@jest/environment";
import type { LaunchOptions } from "puppeteer";

import JsDomEnvironment from "jest-environment-jsdom";
import slugify from "@sindresorhus/slugify";

import { addSnapshot } from "./teardown";

const defaultConfiguration = {
  output: path.resolve(process.cwd(), ".artifacts"),
} as const;

export type VisualSnapshotConfig = {
  includeCss?: string;
  puppeteer?: {
    launch?: Partial<LaunchOptions>;
  };
} & typeof defaultConfiguration;

type AddSnapshot = {
  html: string;
  testName: string;
  args: any;
};

class VisualSnapshotEnvironment extends JsDomEnvironment {
  config: Config.ProjectConfig;
  environmentConfig: VisualSnapshotConfig;
  css?: string;

  constructor(config: Config.ProjectConfig, context: EnvironmentContext = {}) {
    super(config, context);
    this.config = config;
    this.environmentConfig = {
      ...defaultConfiguration,
      ...config.testEnvironmentOptions,
    };
  }

  async getCss() {
    if (!this.environmentConfig.includeCss) {
      return Promise.resolve("");
    }

    if (this.css) {
      return Promise.resolve(this.css);
    }

    const css = await fs.readFile(this.environmentConfig.includeCss, "utf8");
    this.css = css.replace(/[\r\n]+/g, "");
    return this.css;
  }

  async setup() {
    this.global.addSnapshot = async ({
      html,
      testName /*, args */,
    }: AddSnapshot) => {
      let pass = true;

      if (
        !process.env.VISUAL_SNAPSHOT_ENABLE &&
        !process.env.VISUAL_HTML_ENABLE
      ) {
        return {
          message: () =>
            "Environment variable `VISUAL_SNAPSHOT_ENABLE` not set, skipping snapshot'",
          pass: true,
        };
      }

      try {
        const cloned = this.dom.window.document.documentElement.cloneNode(true);
        const body = cloned.getElementsByTagName("body").item(0);
        // Wrap with a div so that we don't screenshot entire viewport
        body.innerHTML = `<div id="__vs_canvas">${html}</div>`;
        const slug = slugify(testName);
        const css = await this.getCss();

        addSnapshot({
          output: this.environmentConfig.output,
          css,
          testName,
          html: cloned.outerHTML,
          fileName: slug,
          saveImage: !!process.env.VISUAL_SNAPSHOT_ENABLE,
          saveHtml: !!process.env.VISUAL_HTML_ENABLE,
        });
      } catch (err) {
        console.error(err);
        pass = false;
      }
      return {
        message: () => "expected to save snapshot",
        pass,
      };
    };

    await super.setup();
  }

  async teardown() {
    super.teardown();
  }
}

export default VisualSnapshotEnvironment;
