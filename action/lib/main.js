"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function(o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, {
          enumerable: true,
          get: function() {
            return m[k];
          }
        });
      }
    : function(o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function(o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function(o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== "default" && Object.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
var __awaiter =
  (this && this.__awaiter) ||
  function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function(resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const glob = __importStar(require("@actions/glob"));
const core = __importStar(require("@actions/core"));
const puppeteer_1 = __importDefault(require("puppeteer"));
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
function run() {
  return __awaiter(this, void 0, void 0, function*() {
    try {
      const basePath = core.getInput("base-path");
      const cssPath = core.getInput("css-path");
      const globber = yield glob.create(`${basePath}/**/*.html`);
      const files = yield globber.glob();
      const browser = yield puppeteer_1.default.launch(
        DEFAULT_CONFIG_CI.launch
      );
      const page = yield browser.newPage();
      if (cssPath) {
        let css = yield fs_1.promises.readFile(cssPath, "utf8");
        css = css.replace(/[\r\n]+/g, "");
        yield page.addStyleTag({
          content: `${css}
        #__vs_canvas {
          position: relative;
        }
        `
        });
      }
      for (const file of files) {
        const slug = path_1.default.basename(file, ".html");
        const imagePath = path_1.default.resolve(basePath, `${slug}.png`);
        const html = yield fs_1.promises.readFile(file, "utf8");
        yield page.setContent(html);
        const el = yield page.$("#__vs_canvas");
        try {
          yield (el ? el : page).screenshot({
            path: imagePath
          });
        } catch (err) {
          console.error(new Error(`${slug}: ${err}`));
          if (err.message === "Node has 0 height.") {
            console.warn("...snapshotting full page instead");
            yield page.screenshot({
              path: imagePath
            });
            return;
          }
        }
      }
      yield browser.close();
    } catch (error) {
      core.setFailed(error.message);
    }
  });
}
run();
