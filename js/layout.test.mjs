import assert from "node:assert/strict";
import { calculateVisiblePageSize } from "./layout.js";

assert.equal(
  calculateVisiblePageSize(848, 560),
  18,
  "large node should load only complete visible cards"
);

assert.equal(
  calculateVisiblePageSize(350, 260),
  2,
  "small node should reduce page size so cards are complete"
);

assert.equal(
  calculateVisiblePageSize(2000, 2000),
  100,
  "page size should stay within backend limit"
);

assert.equal(
  calculateVisiblePageSize(0, 0),
  1,
  "collapsed or unmeasured grids should still request a valid page"
);
