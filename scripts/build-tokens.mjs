#!/usr/bin/env node
/**
 * Verdict token build.
 *
 * Reads src/lib/tokens.ts and emits:
 *
 *   src/styles/tokens.css   the cascade, scoped to [data-verdict]
 *   src/lib/contrast.json           every declared pair, with its measured ratio
 *
 * It does three jobs, and the last two are the ones that matter:
 *
 *   1. Flatten the three tiers into CSS custom properties, resolving every
 *      `{reference}` into a `var(--vd-…)` so the cascade survives into the
 *      browser rather than being flattened away at build time. Retheming stays
 *      possible at runtime.
 *
 *   2. Enforce the architecture. A tier-3 token that names a colour primitive
 *      directly, a reference that points at nothing, or a semantic role defined
 *      in one theme but not the other, exits non-zero. The rule in the header of
 *      tokens.ts is therefore checkable, not a promise.
 *
 *   3. Measure contrast. Every pair in `contrastPairs` is resolved down to real
 *      hex in both themes and scored against WCAG 2.2. Failures exit non-zero.
 *      The same JSON feeds the contrast ladder in the case study, so the graphic
 *      is a readout of the build rather than an illustration of it.
 *
 * Usage:  node scripts/build-tokens.mjs [--check]
 *         --check verifies the committed artifacts are current without writing.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src/lib/tokens.ts");
const OUT_CSS = join(ROOT, "src/styles/tokens.css");
const OUT_JSON = join(ROOT, "src/lib/contrast.json");

/* ── Read the token source ────────────────────────────────────────────────
 * tokens.ts is TypeScript and this script runs under bare node, so rather than
 * pull in a transpiler for four objects it evaluates the literals directly.
 * They are plain data with no imports, which is exactly why the file is kept
 * that way.
 */
const source = readFileSync(SRC, "utf8");

function extractLiteral(name, openChar) {
  const closeChar = openChar === "{" ? "}" : "]";
  const start = source.indexOf(`export const ${name}`);
  if (start === -1) throw new Error(`Could not find "export const ${name}" in tokens.ts`);

  /**
   * Find the assignment, not the first bracket. `contrastPairs` carries an
   * inline type annotation that itself contains `{…}[]`, so scanning for the
   * first `[` after the declaration lands inside the type and extracts an empty
   * array. Walk `=` signs instead and take the first one whose next
   * non-whitespace character opens the literal.
   */
  let eq = source.indexOf("=", start);
  while (eq !== -1) {
    const after = source.slice(eq + 1);
    const gap = /^\s*/.exec(after)[0].length;
    if (after[gap] === openChar) break;
    eq = source.indexOf("=", eq + 1);
  }
  if (eq === -1) throw new Error(`Could not find the "${openChar}" literal assigned to ${name}`);
  const open = eq + 1 + /^\s*/.exec(source.slice(eq + 1))[0].length;

  let depth = 0;
  let end = open;
  let inStr = null;
  for (let i = open; i < source.length; i++) {
    const c = source[i];
    if (inStr) {
      if (c === inStr && source[i - 1] !== "\\") inStr = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") { inStr = c; continue; }
    if (c === "/" && source[i + 1] === "/") { i = source.indexOf("\n", i); continue; }
    if (c === "/" && source[i + 1] === "*") { i = source.indexOf("*/", i) + 1; continue; }
    if (c === openChar) depth++;
    if (c === closeChar) { depth--; if (depth === 0) { end = i; break; } }
  }
  const literal = source.slice(open, end + 1);
  // eslint-disable-next-line no-new-func
  return new Function(`return (${literal});`)();
}

const primitives = extractLiteral("primitives", "{");
const semanticLight = extractLiteral("semanticLight", "{");
const semanticDark = extractLiteral("semanticDark", "{");
const componentTokens = extractLiteral("componentTokens", "{");
const contrastPairs = extractLiteral("contrastPairs", "[");

/* ── Flatten tier 1 ───────────────────────────────────────────────────────── */

const primitiveVars = new Map(); // "color.violet.500" -> { name: "--vd-color-violet-500", value }

function walk(node, path) {
  for (const [k, v] of Object.entries(node)) {
    const next = [...path, k];
    if (v && typeof v === "object") walk(v, next);
    else primitiveVars.set(next.join("."), { name: `--vd-${next.join("-")}`, value: String(v) });
  }
}
walk(primitives, []);

/* ── Resolve references ───────────────────────────────────────────────────── */

const semanticNames = new Set(Object.keys(semanticLight));
const errors = [];

// Every semantic role must exist in both themes, or one theme has a hole in it.
for (const k of Object.keys(semanticLight)) {
  if (!(k in semanticDark)) errors.push(`semantic "${k}" is defined in light but missing from dark`);
}
for (const k of Object.keys(semanticDark)) {
  if (!(k in semanticLight)) errors.push(`semantic "${k}" is defined in dark but missing from light`);
}

/** Tier 2: may reference tier 1 only. */
function resolveSemantic(key, raw, theme) {
  const m = /^\{([^}]+)\}$/.exec(String(raw).trim());
  if (!m) { errors.push(`semantic "${key}" (${theme}) must be a single {reference}, got "${raw}"`); return raw; }
  const ref = m[1];
  if (!primitiveVars.has(ref)) {
    errors.push(`semantic "${key}" (${theme}) references "{${ref}}", which is not a primitive`);
    return raw;
  }
  return `var(${primitiveVars.get(ref).name})`;
}

/** Tier 3: may reference tier 2 only. Naming a primitive here is the violation. */
function resolveComponent(key, raw) {
  const m = /^\{([^}]+)\}$/.exec(String(raw).trim());
  if (!m) { errors.push(`component "${key}" must be a single {reference}, got "${raw}"`); return raw; }
  const ref = m[1];
  if (semanticNames.has(ref)) return `var(--vd-${ref})`;
  if (primitiveVars.has(ref)) {
    errors.push(
      `TIER VIOLATION: component "${key}" reaches past the semantic layer to primitive "{${ref}}". ` +
      `Add a semantic role for it and point "${key}" at that instead.`
    );
    return raw;
  }
  errors.push(`component "${key}" references "{${ref}}", which resolves to nothing`);
  return raw;
}

const light = Object.fromEntries(
  Object.entries(semanticLight).map(([k, v]) => [k, resolveSemantic(k, v, "light")])
);
const dark = Object.fromEntries(
  Object.entries(semanticDark).map(([k, v]) => [k, resolveSemantic(k, v, "dark")])
);
const comp = Object.fromEntries(
  Object.entries(componentTokens).map(([k, v]) => [k, resolveComponent(k, v)])
);

/* ── Measure contrast ─────────────────────────────────────────────────────── */

/**
 * Resolve a token name, in a given theme, all the way down to a hex value.
 *
 * Accepts a tier-3 component token as well as a tier-2 role, because the pairs
 * that matter most are stated in the vocabulary a component actually uses. An
 * instrument is checked as `instrument-marker on instrument-well-bg`, not as
 * `text-primary on surface-inset`, so the assertion survives someone repointing
 * the component contract at a different role.
 */
function flatten(name, theme) {
  const semantic = theme === "dark" ? semanticDark : semanticLight;
  let role = name;

  if (!(role in semantic)) {
    const compRaw = componentTokens[role];
    if (!compRaw) return null;
    const cm = /^\{([^}]+)\}$/.exec(String(compRaw).trim());
    if (!cm) return null;
    role = cm[1];
  }

  const raw = semantic[role];
  if (!raw) return null;
  const m = /^\{([^}]+)\}$/.exec(String(raw).trim());
  if (!m) return null;
  const prim = primitiveVars.get(m[1]);
  return prim ? prim.value : null;
}

function srgbToLinear(c) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

/** WCAG 2.x relative luminance. */
function luminance(hex) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

function ratio(fgHex, bgHex) {
  const a = luminance(fgHex);
  const b = luminance(bgHex);
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

const measurements = [];
const contrastFailures = [];

for (const pair of contrastPairs) {
  for (const theme of ["dark", "light"]) {
    const fgHex = flatten(pair.fg, theme);
    const bgHex = flatten(pair.bg, theme);
    if (!fgHex || !bgHex) {
      errors.push(`contrast pair "${pair.fg} on ${pair.bg}" could not be resolved in ${theme}`);
      continue;
    }
    const r = Math.round(ratio(fgHex, bgHex) * 100) / 100;
    const passes = r >= pair.min;
    measurements.push({
      theme,
      fg: pair.fg,
      bg: pair.bg,
      fgHex,
      bgHex,
      context: pair.context,
      ratio: r,
      min: pair.min,
      passes,
      advisory: Boolean(pair.advisory),
    });
    // Advisory pairs are published in contrast.json but never fail the build.
    if (!passes && !pair.advisory) {
      contrastFailures.push(
        `${theme}: ${pair.fg} on ${pair.bg} is ${r}:1, needs ${pair.min}:1 — ${pair.context}`
      );
    }
  }
}

if (errors.length) {
  console.error(`\n✗ Verdict token build failed with ${errors.length} structural problem(s):\n`);
  for (const e of errors) console.error(`  · ${e}`);
  console.error("");
  process.exit(1);
}

if (contrastFailures.length) {
  console.error(`\n✗ Verdict contrast gate failed: ${contrastFailures.length} pair(s) below their WCAG minimum:\n`);
  for (const f of contrastFailures) console.error(`  · ${f}`);
  console.error("");
  process.exit(1);
}

/**
 * The floor is the worst gated pair, per theme. Advisory pairs are excluded:
 * quoting a floor that includes a control WCAG exempts would understate the
 * system for no reason, and including it silently would overstate the gate.
 */
const gated = measurements.filter((m) => !m.advisory);
const floors = {
  dark: Math.min(...gated.filter((m) => m.theme === "dark").map((m) => m.ratio)),
  light: Math.min(...gated.filter((m) => m.theme === "light").map((m) => m.ratio)),
};

/* ── Emit ─────────────────────────────────────────────────────────────────── */

const block = (entries, indent = "  ") =>
  entries.map(([k, v]) => `${indent}--vd-${k}: ${v};`).join("\n");

const primitiveBlock = [...primitiveVars.values()]
  .map(({ name, value }) => `  ${name}: ${value};`)
  .join("\n");

const css = `/*
 * GENERATED FILE — do not edit by hand.
 * Source: src/lib/tokens.ts
 * Rebuild: node scripts/build-tokens.mjs
 *
 * Everything is scoped to [data-verdict] so the prototype's design system and
 * the portfolio's own can sit in one document without colliding. That scoping
 * is the reason a concept product can be embedded in a case study at all.
 *
 * ${primitiveVars.size} primitives · ${Object.keys(dark).length} semantic roles × 2 themes · ${Object.keys(comp).length} component tokens
 * ${measurements.length} contrast pairs measured, 0 below their gate.
 */

/* ── TIER 1 · PRIMITIVES ─────────────────────────────────────────────────── */
[data-verdict] {
${primitiveBlock}
}

/* ── TIER 2 · SEMANTIC (dark, the default) ───────────────────────────────── */
/* Dark is the default rather than the alternate: a reviewer sits in front of
   this for a full shift, and ops floors are dim. */
[data-verdict],
[data-verdict][data-vd-theme="dark"] {
${block(Object.entries(dark))}
}

/* ── TIER 2 · SEMANTIC (light) ───────────────────────────────────────────── */
[data-verdict][data-vd-theme="light"] {
${block(Object.entries(light))}
}

/* ── TIER 3 · COMPONENT ──────────────────────────────────────────────────── */
/* Theme-agnostic by construction: every value below resolves through tier 2,
   so these are written once and inherit whichever theme is active. */
[data-verdict] {
${block(Object.entries(comp))}
}
`;

const json = JSON.stringify(
  {
    generated: "by scripts/build-tokens.mjs from src/lib/tokens.ts",
    counts: {
      primitives: primitiveVars.size,
      semanticRoles: Object.keys(dark).length,
      componentTokens: Object.keys(comp).length,
      pairsMeasured: measurements.length,
      pairsGated: gated.length,
      pairsAdvisory: measurements.length - gated.length,
    },
    floors,
    measurements,
  },
  null,
  2
) + "\n";

if (process.argv.includes("--check")) {
  let stale = false;
  for (const [path, next] of [[OUT_CSS, css], [OUT_JSON, json]]) {
    let current = "";
    try { current = readFileSync(path, "utf8"); } catch { current = ""; }
    if (current !== next) {
      console.error(`✗ ${path.replace(ROOT + "/", "")} is stale. Run: node scripts/build-tokens.mjs`);
      stale = true;
    }
  }
  if (stale) process.exit(1);
  console.log("✓ Verdict tokens.css and contrast.json are current.");
} else {
  mkdirSync(dirname(OUT_CSS), { recursive: true });
  writeFileSync(OUT_CSS, css);
  writeFileSync(OUT_JSON, json);
  console.log(
    `✓ Verdict tokens built\n` +
    `  → src/styles/tokens.css\n` +
    `  → src/lib/contrast.json\n\n` +
    `  ${primitiveVars.size} primitives · ${Object.keys(dark).length} semantic roles (× 2 themes) · ${Object.keys(comp).length} component tokens\n` +
    `  Cascade verified: 0 tier violations.\n` +
    `  Contrast: ${measurements.length} pairs measured, 0 below gate. ` +
    `Floor ${floors.dark.toFixed(2)}:1 dark, ${floors.light.toFixed(2)}:1 light.`
  );
}
