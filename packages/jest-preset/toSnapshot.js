/* global expect */

export async function toSnapshot(received, args) {
  if (typeof received.html !== "function") {
    return {
      message: () =>
        "Unable to snapshot object, must be able to be rendered in jsdom",
      pass: false,
    };
  }

  return global.addSnapshot({
    html: received.html(),
    testName: this.currentTestName,
    args,
  });
}
