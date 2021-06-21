function getHtml(node) {
  if (typeof node.html === "function") {
    return node.html();
  }

  if (typeof node.innerHTML !== "undefined") {
    return node.innerHTML;
  }

  throw new Error(
    "Unable to snapshot object, must be able to be rendered in jsdom"
  );
}

function serializeMultipleNodes(nodes) {
  return nodes.map(getHtml).join("\n");
}

function toSnapshot(received, args) {
  try {
    return global.addSnapshot({
      html:
        received.length > 1
          ? `<div>${serializeMultipleNodes(received)}</div>`
          : getHtml(received),
      testName: this.currentTestName,
      args,
    });
  } catch {
    return {
      message: () =>
        "Unable to snapshot object, must be able to be rendered in jsdom",
      pass: false,
    };
  }
}

module.exports = toSnapshot;
