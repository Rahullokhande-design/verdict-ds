/**
 * verdict/no-raw-hex
 *
 * Bans hex colour literals anywhere except the token source.
 *
 * The three-tier architecture is only worth having if there is exactly one
 * place a colour can be born. A single `#1A2028` typed into a component at
 * midnight does not look wrong on the day it is written, which is precisely the
 * problem: it survives, it drifts from the scale it was copied out of, it never
 * appears in `contrast.json`, and it silently exempts itself from the contrast
 * gate that every other colour in the system has to pass.
 *
 * So the rule is not about tidiness. A raw hex is a colour that has opted out
 * of being measured.
 *
 * Non-colour hex is left alone: `0x1F`, an id like `#4A5563` inside a URL
 * fragment, or a six-character string that happens to be hexadecimal but is not
 * used as a colour. The heuristic is a string or template literal whose entire
 * value is a `#rgb`/`#rrggbb`/`#rrggbbaa` colour, which is how a colour is
 * actually written and how an accidental one gets pasted.
 */

const HEX = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
/** A hex sitting inside a longer string, e.g. a gradient or a box-shadow. */
const HEX_INSIDE = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/;

/** @type {import("eslint").Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow hex colour literals outside the design token source of truth.",
    },
    schema: [
      {
        type: "object",
        properties: {
          // Files permitted to declare colour. Matched as path substrings.
          allow: { type: "array", items: { type: "string" } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      rawHex:
        'Raw hex colour "{{value}}". Colour is declared once, in {{source}}, and reaches components as a semantic or component token. A hex written here never enters contrast.json, so it is never gated.',
    },
  },

  create(context) {
    const options = context.options[0] ?? {};
    const allow = options.allow ?? ["src/lib/tokens.ts"];
    const source = allow[0] ?? "the token source";
    const filename = context.filename ?? context.getFilename();
    const normalised = filename.split("\\").join("/");

    if (allow.some((frag) => normalised.includes(frag))) return {};

    function check(node, value) {
      if (typeof value !== "string") return;
      const trimmed = value.trim();
      const hit = HEX.test(trimmed)
        ? trimmed
        : (HEX_INSIDE.exec(value)?.[0] ?? null);
      if (!hit) return;
      context.report({
        node,
        messageId: "rawHex",
        data: { value: hit, source },
      });
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
