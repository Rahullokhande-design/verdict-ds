import { primitives, semanticDark } from "./tokens.ts";

/**
 * The Storybook chrome, themed from Verdict's own token source.
 *
 * The manager runs outside the preview iframe, so it never sees `[data-verdict]`
 * and cannot read a CSS custom property from the cascade. It needs literal
 * colour, which is exactly the situation that produces a hand-typed hex sitting
 * next to a design system that bans hand-typed hex.
 *
 * So it resolves them out of tokens.ts instead, following the same alias chain
 * the browser follows: a semantic role points at a primitive, and the primitive
 * holds the value. Restyle the scale and the sidebar restyles with it. Nothing
 * here can drift from the system it is framing, which is the only interesting
 * way to theme a Storybook.
 *
 * tokens.ts rather than the generated tokens.json, because `main.ts` imports
 * this file and Node loads `main.ts` as an ES module, where a JSON import needs
 * an import attribute. The TypeScript source is plain data with no imports of
 * its own, which is the reason it is kept that way.
 */

/** `{color.graphite.925}` to `#10151B`, following as many hops as it takes. */
function resolve(reference: string): string {
  let value = reference;
  for (let hop = 0; hop < 8; hop++) {
    const alias = value.match(/^\{([^}]+)\}$/);
    if (!alias) return value;
    const found = alias[1]
      .split(".")
      .reduce<unknown>(
        (node, key) => (node as Record<string, unknown>)?.[key],
        primitives as unknown
      );
    if (typeof found !== "string") {
      throw new Error(`Verdict manager theme: ${reference} does not resolve to a value.`);
    }
    value = found;
  }
  throw new Error(`Verdict manager theme: ${reference} loops.`);
}

/** A semantic role in the dark theme, which is the one the chrome uses. */
function role(name: string): string {
  const value = semanticDark[name];
  if (!value) {
    throw new Error(`Verdict manager theme: no dark semantic role "${name}".`);
  }
  return resolve(value);
}

/** A primitive, for the one mark that is drawn once rather than themed. */
const primitive = (path: string) => resolve(`{${path}}`);

export const verdictManagerColors = {
  appBg: role("surface-sunken"),
  appContentBg: role("surface-base"),
  appBorder: role("border-subtle"),
  barBg: role("surface-base"),
  textColor: role("text-primary"),
  textMutedColor: role("text-tertiary"),
  accent: role("text-accent"),
  accentSolid: role("surface-accent"),
  onAccent: role("text-on-accent"),
  inputBg: role("surface-raised"),
  inputBorder: role("border-default"),
};

/**
 * The tab icon: the score instrument's arc, which is the component this whole
 * system is built around, reduced to the two marks that survive at 16 pixels.
 *
 * Storybook ships its own favicon and only steps aside when the manager head
 * already declares one, so this goes in as a data URI rather than as a file
 * that has to be remembered and copied. Its colours come out of the token source
 * like every other colour here.
 */
const mark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="7" fill="${primitive("color.graphite.925")}"/>
  <path d="M6.5 22a11 11 0 1 1 19 0" fill="none" stroke="${primitive(
    "color.graphite.750"
  )}" stroke-width="3.2" stroke-linecap="round"/>
  <path d="M6.5 22A11 11 0 0 1 11 8.2" fill="none" stroke="${primitive(
    "color.violet.400"
  )}" stroke-width="3.2" stroke-linecap="round"/>
  <circle cx="16" cy="22" r="2.4" fill="${primitive("color.violet.300")}"/>
</svg>`;

export const verdictFaviconHref =
  "data:image/svg+xml," + encodeURIComponent(mark.replace(/\n\s*/g, " "));
