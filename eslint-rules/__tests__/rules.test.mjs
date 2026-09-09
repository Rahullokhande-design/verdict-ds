/**
 * Tests for the three custom rules.
 *
 * A lint rule that has never fired is indistinguishable from a lint rule that
 * does not work. Verdict's source passes all three cleanly, which is the point
 * of having them, and also means a green `npm run lint` proves nothing about
 * whether the rules function. The fixtures are what proves it: each rule is
 * shown catching the thing it claims to catch, and letting through the thing it
 * is explicitly allowed to let through.
 *
 * The fixtures themselves live in fixtures.mjs, so that the count published on
 * the Enforcement page is read from the same array this file runs.
 *
 * Run with:  npm run test:rules
 */
import { RuleTester } from "eslint";
import tsParser from "@typescript-eslint/parser";
import { suites, countFixtures } from "./fixtures.mjs";

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    ecmaVersion: "latest",
    sourceType: "module",
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

for (const suite of suites) {
  ruleTester.run(suite.name, suite.rule, suite.cases);
}

const { total, byRule } = countFixtures();
console.log(
  `verdict eslint rules: ${total} fixtures pass\n` +
    Object.entries(byRule)
      .map(([name, n]) => `  ${String(n).padStart(2)}  ${name}`)
      .join("\n")
);
