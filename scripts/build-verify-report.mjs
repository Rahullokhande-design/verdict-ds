#!/usr/bin/env node
/**
 * Verdict verify report.
 *
 * Emits src/lib/verify.json: what `npm run verify` actually runs, how many
 * rule fixtures actually exist, and how many stories the Storybook actually
 * carries.
 *
 * ── Why this file exists ──────────────────────────────────────────────────
 *
 * The Enforcement page in the Storybook ends with a promise: "Numbers on this
 * page are read from the generated contrast report, the same file the build gate
 * reads. If they are wrong here, the build is wrong too."
 *
 * That was true of the two contrast numbers and false of everything else. The
 * page said six gates while verify ran seven, because contract:check was added
 * later and the prose was not. It said twenty-one rule fixtures while the test
 * file held twenty-three. Both numbers had been typed by a person, on the page
 * whose entire argument is that a claim nothing checks will decay.
 *
 * So they are generated now, from the three places that cannot lie about it:
 *
 *   gates      parsed out of the `verify` script in package.json
 *   fixtures   counted from the array rules.test.mjs runs
 *   stories    counted from the story files Storybook globs
 *
 * A gate with no entry in GATES below is a hard error rather than an unlabelled
 * row, so adding a check to `verify` without saying what it proves fails the
 * build. That is the same bargain the token builder makes about a colour pair.
 *
 * Usage:  node scripts/build-verify-report.mjs [--check]
 *         --check verifies the committed report is current without writing.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { countFixtures } from "../eslint-rules/__tests__/fixtures.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "src/lib/verify.json");
const STORY_DIR = join(ROOT, "src/stories");
const COMPONENT_DIR = join(ROOT, "src/components");
const PREVIEW = join(ROOT, ".storybook/preview.tsx");
/** Only present in the repository the public one is generated from. */
const SCAFFOLD_PREVIEW = join(ROOT, "scripts/verdict-ds-scaffold/dot-storybook/preview.tsx");

/**
 * What each gate proves, in the words the Storybook page uses.
 *
 * Keyed by npm script name. The order of the gates comes from `verify` itself,
 * not from this object, so the published list can never be in a different order
 * from the one that runs.
 */
const GATES = {
  "report:check": {
    label: "The published numbers are current",
    proves:
      "The gate list, the fixture count and the story count shown in the Storybook match what this repository actually contains.",
  },
  "tokens:check": {
    label: "Tokens are current",
    proves:
      "The committed cascade matches what the source generates, the three tiers resolve without a component ever reaching a primitive, every semantic role exists in both themes, and every declared colour pair meets its WCAG minimum.",
  },
  "contract:check": {
    label: "The data contract is current",
    proves:
      "The published JSON Schema matches the types the components are written against, and every fixture the interface renders validates against it. A contract nothing is checked against is a document.",
  },
  typecheck: {
    label: "Types",
    proves: "tsc --noEmit.",
  },
  lint: {
    label: "Lint",
    proves:
      "typescript-eslint and jsx-a11y, plus three custom rules that encode this system's architecture, all as errors. A rule that warns is a rule that is off.",
  },
  "test:rules": {
    label: "Rule fixtures",
    proves:
      "Each custom rule is shown catching what it claims and permitting what it is allowed to. This system's own source passes all three cleanly, so a green lint would otherwise prove nothing about whether the rules work.",
  },
  "build-storybook": {
    label: "Storybook builds",
    proves: "It builds.",
  },
  "test:a11y:ci": {
    label: "Axe, every story, in a real browser",
    proves:
      "Not the panel, which is a suggestion. The run exits non-zero on any violation.",
  },
};

/* ── Gates, read out of the verify script ─────────────────────────────────── */

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const verifyScript = pkg.scripts?.verify;
if (!verifyScript) throw new Error("package.json has no `verify` script to read.");

const gateNames = [...verifyScript.matchAll(/npm run ([\w:-]+)/g)].map((m) => m[1]);
if (!gateNames.length) {
  throw new Error(`Could not parse any gates out of: ${verifyScript}`);
}

const undescribed = gateNames.filter((n) => !GATES[n]);
if (undescribed.length) {
  throw new Error(
    `These gates run in \`verify\` but have no description in GATES: ${undescribed.join(", ")}. ` +
      `Add one in scripts/build-verify-report.mjs. A gate nobody can name is a gate nobody trusts.`
  );
}

const gates = gateNames.map((script) => ({ script, ...GATES[script] }));

/* ── Stories, counted from the files Storybook globs ──────────────────────── */

/**
 * Sections that document the system rather than demonstrate a component state.
 *
 * The case study quotes a count of component-state stories, because that is the
 * number that means something: a story per state is the claim. A landing page
 * and a contrast table are stories in Storybook's sense and are not states, so
 * they are counted separately rather than quietly inflating the figure.
 */
const DOC_SECTIONS = new Set([
  "Start here",
  "Foundations",
  "What the checks caught",
  "Enforcement",
]);

const storyFiles = readdirSync(STORY_DIR)
  .filter((n) => n.endsWith(".stories.tsx"))
  .sort();

const byFile = {};
let componentStates = 0;
let docs = 0;

for (const name of storyFiles) {
  const src = readFileSync(join(STORY_DIR, name), "utf8");

  const title = src.match(/^\s*title:\s*"([^"]+)"/m)?.[1];
  if (!title) throw new Error(`${name} has no meta title.`);

  /**
   * Every story in this repository is annotated `: Story` or `: StoryObj`, and
   * an unannotated `export const` in a story file is therefore either a helper
   * that belongs in _harness.tsx or a story that is about to be miscounted.
   * Both are worth stopping for.
   */
  const exported = [...src.matchAll(/^export const (\w+)([^=]*)=/gm)];
  const stories = [];
  for (const [, exportName, annotation] of exported) {
    if (/:\s*Story(Obj)?\b/.test(annotation)) {
      stories.push(exportName);
      continue;
    }
    throw new Error(
      `${name} exports \`${exportName}\` without a Story or StoryObj annotation, ` +
        `so it cannot be counted. Annotate it, or move it to _harness.tsx.`
    );
  }

  const section = title.split("/")[1];
  const isDoc = DOC_SECTIONS.has(section);
  if (isDoc) docs += stories.length;
  else componentStates += stories.length;

  byFile[name] = { title, section, kind: isDoc ? "documentation" : "state", stories: stories.length };
}

/* ── The sidebar order, checked against the sections that exist ───────────── */

/**
 * Storybook reads `parameters.options.storySort` by parsing preview.tsx with
 * Babel rather than by evaluating it. Three things follow, and all three are
 * silent failures:
 *
 *   an imported value is rejected
 *   a section name that no longer exists is skipped
 *   an order it cannot find at all is ignored, leaving the sidebar in file order
 *
 * The last one is how this Storybook shipped with sections numbered "0
 * Enforcement" and "1 Primitives" rendering as 1, 2, 4, 0, 3, 5: the numbers
 * were there to force an order that no configuration was delivering. Nothing
 * errored, because nothing was wrong, exactly.
 *
 * So the order is read back out of the file here, checked against the sections
 * and components the stories actually declare, and compared with the copy in the
 * other preview.tsx. It has to be duplicated. It does not have to be unwatched.
 */
function readOrder(file) {
  const src = readFileSync(file, "utf8");
  const at = src.indexOf("storySort:");
  if (at === -1) {
    throw new Error(
      `${file.replace(ROOT + "/", "")} has no literal storySort. Storybook will ignore the ` +
        `sidebar order silently and fall back to file order.`
    );
  }
  const open = src.indexOf("[", at);
  let depth = 0;
  let close = open;
  for (; close < src.length; close++) {
    if (src[close] === "[") depth++;
    else if (src[close] === "]" && --depth === 0) break;
  }
  const literal = src
    .slice(open, close + 1)
    .replace(/\/\/[^\n]*/g, "")
    .replace(/,(\s*[\]])/g, "$1");
  /**
   * The strings in that literal are double-quoted TypeScript, which is JSON, so
   * this parses rather than evaluates. It naively normalised single quotes to
   * double once, which turned "This page's own mistake" into a syntax error and
   * was a small demonstration of why parsing a language with a regex is a choice
   * you have to keep paying for.
   */
  return JSON.parse(literal);
}

const order = readOrder(PREVIEW);

if (existsSync(SCAFFOLD_PREVIEW)) {
  const scaffoldOrder = readOrder(SCAFFOLD_PREVIEW);
  if (JSON.stringify(order) !== JSON.stringify(scaffoldOrder)) {
    throw new Error(
      "The two preview.tsx files declare different sidebar orders. Storybook parses this " +
        "value out of each file separately, so it cannot be shared, which means it has to be " +
        "kept in step by hand and checked here."
    );
  }
}

/** Every name the order mentions, flattened. */
const ordered = new Set();
(function walk(list) {
  for (const item of list) {
    if (Array.isArray(item)) walk(item);
    else ordered.add(item);
  }
})(order);

/** Every name the story titles actually produce, minus the root. */
const declared = new Set();
for (const { title } of Object.values(byFile)) {
  for (const part of title.split("/").slice(1)) declared.add(part);
}

const phantom = [...ordered].filter((n) => n !== "Verdict" && !declared.has(n));
if (phantom.length) {
  throw new Error(
    `The sidebar order names sections or components that no story declares: ${phantom.join(", ")}. ` +
      `Storybook skips a name it cannot find rather than reporting it, so this would have been invisible.`
  );
}

const unordered = [...declared].filter((n) => !ordered.has(n));
if (unordered.length) {
  throw new Error(
    `These appear in story titles and are missing from the sidebar order: ${unordered.join(", ")}. ` +
      `They would sort by filename, below everything that is ordered.`
  );
}

/* ── Components, counted from the source ──────────────────────────────────── */

/**
 * Two exports in components/verdict are not components, and both are there for
 * a reason rather than by accident: a duration constant the decision bar and the
 * toast both read, and a Radix provider re-exported so consumers do not have to
 * learn that a tooltip needs one. Naming them here means a third non-component
 * export changes the published count and gets noticed, instead of being caught
 * by a regex that quietly guesses.
 *
 * The case study said sixteen for months, then twenty, and both were typed.
 */
const NOT_COMPONENTS = new Set(["UNDO_WINDOW_MS", "TooltipProvider"]);

const components = [];
for (const name of readdirSync(COMPONENT_DIR).filter((n) => n.endsWith(".tsx")).sort()) {
  const src = readFileSync(join(COMPONENT_DIR, name), "utf8");
  for (const [, exported] of src.matchAll(/^export (?:function|const) (\w+)/gm)) {
    if (NOT_COMPONENTS.has(exported)) continue;
    components.push({ name: exported, file: name });
  }
}
components.sort((a, b) => a.name.localeCompare(b.name));

/* ── Write ────────────────────────────────────────────────────────────────── */

const fixtures = countFixtures();

const json =
  JSON.stringify(
    {
      generated: "by scripts/build-verify-report.mjs. Do not edit.",
      gates,
      fixtures,
      sidebar: { order },
      components: {
        total: components.length,
        names: components.map((c) => c.name),
      },
      stories: {
        total: componentStates + docs,
        componentStates,
        documentation: docs,
        byFile,
      },
    },
    null,
    2
  ) + "\n";

if (process.argv.includes("--check")) {
  let current = "";
  try {
    current = readFileSync(OUT, "utf8");
  } catch {
    current = "";
  }
  if (current !== json) {
    console.error(
      `✗ src/lib/verify.json is stale. Run: node scripts/build-verify-report.mjs`
    );
    process.exit(1);
  }
  console.log(
    `✓ Verdict verify report is current: ${gates.length} gates, ${fixtures.total} fixtures, ` +
      `${componentStates + docs} stories.`
  );
} else {
  writeFileSync(OUT, json);
  console.log(
    `✓ Verdict verify report built\n` +
      `  → src/lib/verify.json\n\n` +
      `  ${gates.length} gates · ${fixtures.total} rule fixtures · ${components.length} components\n` +
      `  ${componentStates} component-state stories + ${docs} documentation = ${componentStates + docs}`
  );
}
