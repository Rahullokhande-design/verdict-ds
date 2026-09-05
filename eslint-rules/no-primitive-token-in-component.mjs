/**
 * verdict/no-primitive-token-in-component
 *
 * A component may read semantic (tier 2) and component (tier 3) tokens. It may
 * never reach past them to a colour primitive (tier 1).
 *
 * This is the boundary the whole architecture rests on, and it is the one that
 * degrades quietest. `var(--vd-color-graphite-800)` renders identically to
 * `var(--vd-surface-raised)` on the day it is written. The difference only
 * appears later, in the light theme, where the semantic role flips and the
 * primitive does not. One primitive reference is how a themeable system becomes
 * a dark-only system with a broken light mode nobody has opened yet.
 *
 * The generator already enforces this inside tokens.ts, where it can see the
 * reference graph. It cannot see component source, so component source is where
 * this rule works.
 *
 * ── The stated exception ───────────────────────────────────────────────────
 *
 * Spacing, radius, type and duration primitives ARE allowed directly. Inventing
 * a semantic role for every gap produces a dictionary nobody reads, and a gap
 * does not change between themes, so there is nothing for the indirection to
 * protect. Colour is the tier that flips, so colour is the tier that is policed.
 * The exception is narrow and deliberate rather than an oversight, which is why
 * it is written here rather than left to be rediscovered.
 */

/** Tier-1 colour scales, from `primitives.color` in src/lib/tokens.ts. */
const COLOUR_SCALES = ["graphite", "violet", "ember", "jade", "ruby"];

const PRIMITIVE_VAR = new RegExp(
  String.raw`var\(\s*--vd-color-(?:${COLOUR_SCALES.join("|")})-\d+`,
  "g"
);

/** @type {import("eslint").Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow tier-1 colour primitives in component source; components read semantic or component tokens only.",
    },
    schema: [
      {
        type: "object",
        properties: {
          allow: { type: "array", items: { type: "string" } },
          scales: { type: "array", items: { type: "string" } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      primitive:
        "{{token}} is a tier-1 colour primitive. Components read tier-2 semantic roles (--vd-surface-raised) or tier-3 component tokens (--vd-instrument-marker). A primitive does not flip between themes, so this renders correctly in dark and wrongly in light.",
    },
  },

  create(context) {
    const options = context.options[0] ?? {};
    const allow = options.allow ?? ["src/lib/tokens.ts"];
    const filename = (context.filename ?? context.getFilename())
      .split("\\")
      .join("/");

    if (allow.some((frag) => filename.includes(frag))) return {};

    const pattern = options.scales
      ? new RegExp(
          String.raw`var\(\s*--vd-color-(?:${options.scales.join("|")})-\d+`,
          "g"
        )
      : PRIMITIVE_VAR;

    function check(node, value) {
      if (typeof value !== "string") return;
      pattern.lastIndex = 0;
      let m;
      while ((m = pattern.exec(value)) !== null) {
        const token = m[0].replace(/^var\(\s*/, "");
        context.report({ node, messageId: "primitive", data: { token } });
      }
    }

    return {
      Literal(node) {
        check(node, node.value);
      },
      TemplateElement(node) {
        check(node, node.value.cooked ?? node.value.raw);
      },
    };
  },
};
