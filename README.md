# Verdict Design System

[![CI](https://github.com/Rahullokhande-design/verdict-ds/actions/workflows/ci.yml/badge.svg)](https://github.com/Rahullokhande-design/verdict-ds/actions/workflows/ci.yml)

A three-tier design token architecture and 20-component library for **Verdict**,
a concept card-fraud review console. A model scores flagged transactions and a
human decides.

The point of publishing it is not the components. It is that every constraint
this system claims is checked by something, so you can disbelieve the README and
run the checks instead.

---

## If you have two minutes

**[Open the Storybook](https://verdict-ds.vercel.app)** — every component, every
state, no install. Flip the theme in the toolbar. Open the **Accessibility**
panel: it runs axe live against whatever is on screen, and it is the same engine
CI runs, so a green panel is the claim demonstrating itself.

It opens on **Start here**. After that, **Enforcement → What is checked** is the
argument in one page, and **What the checks caught** is seven pages of the
defects this system shipped, each with the failure drawn beside the fix.

## If you have ten

```bash
npm ci
npx playwright install --with-deps chromium
npm run verify
```

Eight gates, cheapest failure first. This is the same command CI runs.

| Gate | What it proves |
| --- | --- |
| `report:check` | The gate list, the fixture count, the component count and the story count published in the Storybook match what this repository actually contains |
| `tokens:check` | The committed cascade matches what the source generates, the tiers resolve, every semantic role exists in both themes, and all 76 declared colour pairs meet their WCAG minimum |
| `contract:check` | The published JSON Schema matches the types the components are written against, and all 9 fixtures validate against it |
| `typecheck` | `tsc --noEmit` |
| `lint` | typescript-eslint and jsx-a11y, plus three custom rules that encode this system's architecture |
| `test:rules` | 23 fixtures showing each custom rule catching what it claims and permitting what it is allowed to |
| `build-storybook` | It builds |
| `test:a11y` | Axe over all 54 stories, in a real browser, exiting non-zero on any violation. Nothing is exempted |

The first gate is the newest and it exists because of a failure worth admitting.
This README said seven gates while eight ran, and twenty-one rule fixtures while
twenty-three existed, on a page arguing that an unchecked claim decays. Those
numbers are generated now, into `src/lib/verify.json`, and `report:check` fails
the build when the committed copy no longer matches the source it counts.

---

## What you can take from here

Three artifacts are generated, and are meant to be consumed rather than read.

### `src/lib/tokens.json` — the tokens, in a format your pipeline already reads

W3C Design Tokens Community Group format. Style Dictionary, Tokens Studio, Figma
variable importers and most in-house pipelines read it directly, so this becomes
a Tailwind config, iOS constants or Figma variables without anyone retyping a hex
code.

Two things about it matter more than the format:

**Aliases are preserved.** A semantic role exports as
`{primitive.color.graphite.850}`, not as `#1A2028`. Flattening is what naive
exports do, and it destroys the thing worth exporting: it turns a three-tier
system into a list of colours, and every relationship the tiers encode is gone at
the moment of export. You would receive values and no system.

**Each theme is complete.** `theme.dark` carries its own semantic and component
sets and can be imported alone. A cross-theme alias resolves for whoever wrote it
and dangles for whoever imports one theme.

436 tokens, every alias resolving, every one carrying a `$type`.

### `src/lib/contract.schema.json` — what the interface needs from an API

**This is not an API design.** Nobody here designed the scoring service, its
auth, pagination, error semantics or consistency guarantees, and a hand-written
OpenAPI document would be an invention dressed as a deliverable.

It is the shape the components already consume, generated from the TypeScript
they are typed against. It says exactly what the screens need in order to render:
which fields are required, which are enumerated, where a tuple is a `[low, high]`
span, and why, because the reasoning in the type comments comes through into the
schema descriptions. Design whatever you like on the other side of it and check
your response against this file.

It is generated, not written, so it cannot drift from what the components read,
and the fixtures are validated against it on every build.

### `src/styles/tokens.css` — the cascade, if you just want to use it

Scoped to `[data-verdict]`, themed by `[data-vd-theme]`. Generated. Do not edit.

---

## The three tiers

```
TIER 1  PRIMITIVE   --vd-color-graphite-900       raw scales, no opinion about use
TIER 2  SEMANTIC    --vd-surface-raised           roles; the only tier that differs by theme
TIER 3  COMPONENT   --vd-btn-accent-fg            per-component contracts
```

A component reads tier 3 and tier 2. Never tier 1. That single constraint is what
makes theming a diff instead of an audit, and it is the one that degrades
quietest, because `var(--vd-color-graphite-800)` renders identically to
`var(--vd-surface-raised)` on the day it is written and differently in the light
theme nobody has opened yet.

One stated exception: spacing, radius and type primitives are used directly.
Inventing a semantic role for every gap produces a dictionary nobody reads, and a
gap does not change between themes. Colour is the tier that flips, so colour is
the tier that is policed.

## Risk is ordinal, so it is not a traffic light

The industry-standard red/amber/green is a category encoding applied to a
quantity. Verdict uses a single ember hue climbing in lightness and chroma across
four steps, which survives greyscale and colour vision deficiency intact, and
colour is never the only carrier: every risk value ships a rank (R1 to R4) and a
printed numeric band.

The `Bands, hue removed` story is the proof rather than an illustration of it. It
applies a greyscale filter to the real components.

## What the checks have actually caught

Not a hypothetical list. Seven live defects, and in every case the tool that
found one was not the tool you would have expected. Each has a page in the
Storybook under **What the checks caught**, with the failure beside the fix and
the ratios computed from the token file rather than quoted from memory.

1. **Every button variant's colour was inert.** A form reset written
   `[data-verdict] button { color: inherit }` scores (0,1,1) and beat every
   single-class variant in the file. All six variants rendered in the inherited
   body colour. The token generator could not see it, because it measures the
   pairs the tokens *declare* and those were correct. Axe measured the rendered
   pixels and put the accent button at 4.42:1 against a 4.5 bar. Fixed with
   `:where()`, which keeps the reset doing its job and stops it winning
   arguments.
2. **`opacity` defeating the contrast gate.** A decided queue row faded with
   `opacity: 0.55` composited a passing colour down to 2.66:1. Opacity is applied
   long after a pair is declared, so nothing in the token file could know.
3. **A light-theme colour never measured on the surface it sat on.**
   `text-tertiary` was chosen against white panels (5.20:1) and the app
   background (4.80:1). On the sunken surface the queue rail uses it was 4.38:1,
   and that pair had never been declared.
4. **`role="img"` wrapped around a focusable control.** Reads well, and is
   invalid: an image is a leaf node.
5. **`aria-activedescendant` pointing at nothing.** Visible only with an empty
   queue, a real state that happens at the end of every shift and that no screen
   renders. The story renders it.
6. **A disabled button that dimmed its label but kept a saturated fill.** Exposed
   by fixing the first one. **No gate caught this**: WCAG exempts disabled
   controls from contrast, so axe passed it cleanly. It needed an eye.
7. **A fill colour used as text, on the enforcement page itself.** The red
   "fails" label used `-solid` rather than `-fg`: 3.77:1. The system already had
   the correct token and the wrong one was simply the more obvious name, which is
   the mistake that split exists to catch, committed while documenting the split.

Six found by tooling, one that needed a person. Which is the honest end of the
argument: the checks find what they are shaped to find, and somebody still has to
look.

## Layout

```
src/lib/tokens.ts             the source of truth for every colour in the system
src/lib/types.ts              the domain types the components are written against
src/lib/tokens.json           generated: W3C DTCG export, aliases preserved
src/lib/contract.schema.json  generated: the data contract, from the types
src/lib/contrast.json         generated: every declared pair with its measured ratio
src/lib/verify.json           generated: the gates, fixture, component and story counts
src/styles/tokens.css         generated: the cascade, scoped to [data-verdict]
src/components/               20 components, Radix behaviour, CVA variants
src/stories/                  54 stories, organised by state rather than by prop
eslint-rules/                 three custom rules, with fixtures
scripts/                      the generators and the gates
```

## This repository is generated

The source of truth is the site this system was built for, because that is where
it is used and where a moved token would be noticed first. A hand-maintained
public mirror of a design system becomes a second source file, and then two
different source files.

So this repo is extracted, by a script, with a small set of deterministic path
rewrites and nothing else. Every line of component source, every token and every
story here is byte-identical to the line that ships. That is the only reason
publishing it proves anything.

## Scope, stated plainly

A concept product, built as a portfolio case study. There is no data layer, no
auth, no error semantics, no i18n and no release process, and the mock data is
mock data.

What is here is the layer a design engineer should own: the token architecture,
the component contracts, the states, the keyboard behaviour, the accessibility,
and the shape of the data the interface needs. Treat it as a specification that
happens to compile. If your stack differs, throw the code away and keep the
contract.

## Licence

MIT.
