import assert from "node:assert/strict";
import test from "node:test";
import { blocks, roadmapFence } from "./markdown.js";

test("pulls the proposed-order fence out of an issue body", () => {
  const body = ["# Title", "", "## Proposed implementation order", "", "```", "Phase 0", "        ↓", "measure", "```", "", "## Next"].join("\n");
  assert.equal(roadmapFence(body), "Phase 0\n        ↓\nmeasure");
});

test("does not treat a later fence as the roadmap", () => {
  const body = ["## Summary", "", "```", "not the order", "```"].join("\n");
  assert.equal(roadmapFence(body), "");
});

test("parses headings, lists, and tables without dropping the separator row into cells", () => {
  const body = ["## Summary", "", "- one", "- two", "", "| A | B |", "| --- | --- |", "| 1 | 2 |"].join("\n");
  const parsed = blocks(body);
  assert.deepEqual(parsed.map((block) => block.type), ["h", "ul", "table"]);
  assert.equal(parsed[0].id, "summary");
  assert.deepEqual(parsed[2].header, ["A", "B"]);
  assert.deepEqual(parsed[2].rows, [["1", "2"]]);
});
