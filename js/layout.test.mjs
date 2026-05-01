import assert from "node:assert/strict";
import { calculateVisiblePageSize } from "./layout.js";

assert.equal(
  calculateVisiblePageSize(848, 560),
  1,
  "large node should show one very large card with 4x sizing"
);

assert.equal(
  calculateVisiblePageSize(350, 260),
  1,
  "small node should still request a valid single large card"
);

assert.equal(
  calculateVisiblePageSize(2000, 2000),
  6,
  "very large view should show multiple enlarged cards"
);

assert.equal(
  calculateVisiblePageSize(0, 0),
  1,
  "collapsed or unmeasured grids should still request a valid page"
);
