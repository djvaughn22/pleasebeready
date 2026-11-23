import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

// Search Console verifies https://pleasebeready.com/ by this meta tag on the home page.
// Removing it un-verifies the property and stops search reports.
test("the root layout carries the Search Console verification tag", () => {
  const layout = readFileSync(join(__dirname, "layout.tsx"), "utf8");
  expect(layout).toContain('verification: { google: "OUktughxmxBDGMuhx5Dz6N1_FkB07ri1IqxVhIqmGJw" }');
});
