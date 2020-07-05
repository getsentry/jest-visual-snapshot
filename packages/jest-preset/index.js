/* global expect */
const { toSnapshot } = require("./toSnapshot");

expect.extend({
  toSnapshot,
});
