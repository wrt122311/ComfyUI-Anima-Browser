import assert from "node:assert/strict";
import { calculateVisiblePageSize } from "./layout.js";

assert.equal(
  calculateVisiblePageSize(848, 560),
  3,
  "large node should show complete cards with 2x sizing"
);

assert.equal(
  calculateVisiblePageSize(350, 260),
  1,
  "small node should still request a valid single card"
);

assert.equal(
  calculateVisiblePageSize(2000, 2000),
  42,
  "very large view should show multiple cards with 2x sizing"
);

assert.equal(
  calculateVisiblePageSize(0, 0),
  1,
  "collapsed or unmeasured grids should still request a valid page"
);
