# visual snapshot

Note: This is a work in progress and APIs may (will) change.

This library is meant as a replacement for `jest`'s `toMatchSnapshot()` feature (currently, only supports React). Our snapshots tended to be large, hard to read, and frustrating to use when making changes. An example of this is when making a change to a styled component that was snapshotted - the snapshot diffs would only show that a class name has changed, which has limited value for the developer making the change, as well as code reviewers. For us, the main use-cases for snapshots where 1) to make sure that it renders ok and 2) we do not introduce regressions when making changes. Given this, we wanted to have snapshots produce an image of the component when rendered in the browser.

## Getting Started

```shell
yarn add -D @visual-snapshot/jest
```

In your `jest.config.js` you must:

- set the `preset` to `@visual-snapshot/jest`
- add `@visual-snapshot/jest` to `setupFilesAfterEnv` - this will add a custom `toSnapshot()` matcher
- set `testEnvironmentOptions.output` to the path where the images will be written

```javascript
module.exports = {
  preset: "@visual-snapshot/jest",
  setupFilesAfterEnv: ["@visual-snapshot/jest"],
  testEnvironmentOptions: {
    output: path.resolve(__dirname, ".artifacts", "visual-snapshots", "jest"),
    includeCss: path.resolve(__dirname, "static", "global.css"),
  },
};
```

Finally, you _must_ run `jest` with the environment variable `VISUAL_SNAPSHOT_ENABLE` (or `VISUAL_HTML_ENABLE` for `html` output) set. e.g.

```shell
VISUAL_SNAPSHOT_ENABLE=1 yarn jest
```

## Checking for Regressions

You'll notice that these snapshots do not get compared during `jest` runs - it only produces an output, and will not fail your builds. We moved that process into CI pipeline to avoid checking in snapshots into the repo, but also to streamline the process of checking for visual regressions. Check out the [Visual Snapshot GitHub Action](https://github.com/getsentry/action-visual-snapshot) for more information.

## Development

```
yarn install && yarn lerna bootstrap

yarn dev
```
