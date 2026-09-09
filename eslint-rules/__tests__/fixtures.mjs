/**
 * The fixtures for the three custom rules, as data.
 *
 * These were inline in rules.test.mjs, and the count of them was typed into the
 * README and into the Storybook page that argues every number here is generated
 * from something. It said twenty-one. There were twenty-three. A hand-typed
 * count on a page about not hand-typing counts is the exact failure the page
 * exists to talk about, so the fixtures moved out here where two consumers can
 * read the same array:
 *
 *   rules.test.mjs                      runs them
 *   scripts/build-verify-report.mjs   counts them
 *
 * Adding a fixture now changes the published number without anyone editing it.
 */
import noRawHex from "../no-raw-hex.mjs";
import noPrimitiveTokenInComponent from "../no-primitive-token-in-component.mjs";
import noHandlerOnNonInteractive from "../no-handler-on-non-interactive.mjs";

/* ── no-raw-hex ───────────────────────────────────────────────────────────── */

const rawHex = {
  name: "verdict/no-raw-hex",
  rule: noRawHex,
  cases: {
    valid: [
      {
        code: `const bg = "var(--vd-surface-raised)";`,
        filename: "components/verdict/primitives.tsx",
      },
      {
        // The token source is where colour is allowed to be born.
        code: `export const primitives = { color: { graphite: { 900: "#141A21" } } };`,
        filename: "src/lib/tokens.ts",
      },
      {
        // Hexadecimal that is not a colour.
        code: `const mask = 0x1f; const id = "abc123";`,
        filename: "components/verdict/domain.tsx",
      },
    ],
    invalid: [
      {
        code: `const bg = "#141A21";`,
        filename: "components/verdict/domain.tsx",
        errors: [{ messageId: "rawHex" }],
      },
      {
        // Shorthand counts. So does a hex buried inside a longer declaration.
        code: `const s = { boxShadow: "0 0 0 1px #fff inset" };`,
        filename: "components/verdict/compounds.tsx",
        errors: [{ messageId: "rawHex" }],
      },
      {
        code: "const c = `linear-gradient(#0B0F14, transparent)`;",
        filename: "components/verdict/ScoreInstrument.tsx",
        errors: [{ messageId: "rawHex" }],
      },
    ],
  },
};

/* ── no-primitive-token-in-component ──────────────────────────────────────── */

const primitiveToken = {
  name: "verdict/no-primitive-token-in-component",
  rule: noPrimitiveTokenInComponent,
  cases: {
    valid: [
      {
        code: `const a = "var(--vd-surface-raised)";`,
        filename: "components/verdict/primitives.tsx",
      },
      {
        code: `const a = "var(--vd-instrument-marker)";`,
        filename: "components/verdict/ScoreInstrument.tsx",
      },
      {
        // The stated exception: non-colour primitives are fine, because a gap
        // does not change between themes.
        code: `const a = "var(--vd-space-5)"; const b = "var(--vd-fontSize-xs)";`,
        filename: "components/verdict/QueueRail.tsx",
      },
      {
        code: `export const primitives = { color: { violet: { 500: "#7C5CFF" } } };`,
        filename: "src/lib/tokens.ts",
      },
    ],
    invalid: [
      {
        code: `const a = "var(--vd-color-graphite-800)";`,
        filename: "components/verdict/primitives.tsx",
        errors: [{ messageId: "primitive" }],
      },
      {
        code: "const a = `var(--vd-color-ember-400)`;",
        filename: "components/verdict/domain.tsx",
        errors: [{ messageId: "primitive" }],
      },
    ],
  },
};

/* ── no-handler-on-non-interactive ────────────────────────────────────────── */

const handlerOnNonInteractive = {
  name: "verdict/no-handler-on-non-interactive",
  rule: noHandlerOnNonInteractive,
  cases: {
    valid: [
      { code: `<button onClick={f}>go</button>;` },
      { code: `<a href="/x" onClick={f}>go</a>;` },
      // A component owns its own host element.
      { code: `<Button onClick={f}>go</Button>;` },
      // The queue rail's actual shape: a composite widget that owns focus.
      {
        code: `<ul role="listbox" tabIndex={0} onKeyDown={f}><li /></ul>;`,
      },
      // A managed child inside that widget.
      {
        code: `<button role="option" tabIndex={-1} onClick={f} />;`,
      },
      { code: `<div className="plain" />;` },
    ],
    invalid: [
      {
        code: `<div onClick={f} />;`,
        errors: [{ messageId: "nonInteractive" }],
      },
      {
        code: `<span onClick={f}>{score}</span>;`,
        errors: [{ messageId: "nonInteractive" }],
      },
      {
        // Announced as a control, unreachable by keyboard. The promise is worse
        // than the silence.
        code: `<div role="button" onClick={f} />;`,
        errors: [{ messageId: "notFocusable" }],
      },
      {
        // Focusable and correctly named, but pointer-only.
        code: `<div role="button" tabIndex={0} onClick={f} />;`,
        errors: [{ messageId: "noKeyboardPath" }],
      },
      {
        // A role that is not something you operate.
        code: `<li role="presentation" tabIndex={0} onClick={f} />;`,
        errors: [{ messageId: "nonInteractive" }],
      },
    ],
  },
};

/** Order matters only for the printed summary. */
export const suites = [rawHex, primitiveToken, handlerOnNonInteractive];

/** `{ "verdict/no-raw-hex": 6, … }`, and the total. */
export function countFixtures() {
  const byRule = {};
  for (const s of suites) {
    byRule[s.name] = s.cases.valid.length + s.cases.invalid.length;
  }
  return {
    total: Object.values(byRule).reduce((a, b) => a + b, 0),
    byRule,
  };
}
