function serializeMultipleNodes(nodes) {
  return nodes.map((node) => node.html()).join("\n");
}

function toSnapshot(received, args) {
  if (typeof received.html !== "function") {
    return {
      message: () =>
        "Unable to snapshot object, must be able to be rendered in jsdom",
      pass: false,
    };
  }

  return global.addSnapshot({
    html:
      received.length > 1
        ? `<div>${serializeMultipleNodes(received)}</div>`
        : received.html(),
    testName: this.currentTestName,
    args,
  });
}

module.exports = toSnapshot;
