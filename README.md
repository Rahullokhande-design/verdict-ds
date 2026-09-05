# Verdict Design System

[![CI](https://github.com/REPO_OWNER/verdict-ds/actions/workflows/ci.yml/badge.svg)](https://github.com/REPO_OWNER/verdict-ds/actions/workflows/ci.yml)

A three-tier design token architecture and 20-component library for **Verdict**, a
concept card-fraud review console. A model scores flagged transactions and a
human decides.

The point of publishing it is not the components. It is that every constraint
this system claims is checked by something, so you can disbelieve the README and
run the checks instead.

```bash
npm ci
npm run verify     # tokens, types, lint, rule fixtures, Storybook, axe
npm run storybook  # look at it
```

---

## What is actually enforced

| Claim | What checks it |
| --- | --- |
| Colour is declared in exactly one file | `verdict/no-raw-hex`, an ESLint rule |
| A component never reads a tier-1 colour primitive | `verdict/no-primitive-token-in-component` |
| No interaction handler on an element the keyboard cannot reach | `verdict/no-handler-on-non-interactive` |
| Tier 3 resolves through tier 2, tier 2 through tier 1, never past | the token generator, which exits non-zero |
| Every semantic role exists in both themes | the token generator |
| Every declared colour pair meets its WCAG minimum | the contrast gate, from measured ratios |
| Every component state is reachable and legible | axe over all 28 stories, in a real browser |

`npm run verify` runs all seven. CI runs the same command on every push.

## The three tiers

```
TIER 1  PRIMITIVE   --vd-color-graphite-900       raw scales, no opinion about use
TIER 2  SEMANTIC    --vd-surface-raised           roles; the only tier that differs by theme
TIER 3  COMPONENT   --vd-btn-accent-fg            per-component contracts
```

A component reads tier 3 and tier 2. Never tier 1. That single constraint is
what makes theming a diff instead of an audit, and it is the one that degrades
quietest, because `var(--vd-color-graphite-800)` renders identically to
`var(--vd-surface-raised)` on the day it is written and differently in the light
theme nobody has opened yet.

One stated exception: spacing, radius and type primitives are used directly.
Inventing a semantic role for every gap produces a dictionary nobody reads, and
a gap does not change between themes, so there is nothing for the indirection to
protect. Colour is the tier that flips, so colour is the tier that is policed.

Current build: **124 primitives, 73 semantic roles across 2 themes, 92 component
tokens, 72 contrast pairs measured, 0 below gate.** Those numbers are printed by
the generator, not typed here by hand.

## Risk is ordinal, so it is not a traffic light

The industry-standard red/amber/green is a category encoding applied to a
quantity. Verdict uses a single ember hue climbing in lightness and chroma
across four steps, which survives greyscale and colour vision deficiency intact,
and colour is never the only carrier: every risk value ships a rank (R1 to R4)
and a printed numeric band as well.

The `Bands, hue removed` story is the proof rather than an illustration of it. It
applies a greyscale filter to the real components.

## What the checks have actually caught

Not a hypothetical list. These were live defects, found in this order:

1. **Every button variant's colour was inert.** A form reset written as
   `[data-verdict] button { color: inherit }` scores (0,1,1) and beat every
   single-class variant in the file. All six variants rendered in the inherited
   body colour. The token generator could not see it, because it measures the
   pairs the tokens *declare*, and those were correct. Axe measured the rendered
   pixels and put the accent button at 4.42:1 against a 4.5 bar. Fixed with
   `:where()`, which keeps the reset doing its job and stops it winning
   arguments.

2. **`opacity` defeating the contrast gate, twice.** A decided queue row faded
   with `opacity: 0.55` composited a passing colour down to 2.66:1. Opacity is
   applied long after a pair is declared, so nothing in the token file could
   know. Replaced with an explicit, gated token.

3. **A light-theme colour that had never been measured on the surface it sat
   on.** `text-tertiary` was chosen against white panels (5.20:1) and the app
   background (4.80:1). On the sunken surface the queue rail uses it was 4.38:1,
   and that pair had simply never been declared. Fixed by adding one step to the
   grey scale and declaring the pair.

4. **`role="img"` wrapped around a focusable control.** The score track carried
   a full text alternative, which reads well and is invalid: an image is a leaf
   node. The alternative moved to a visually hidden paragraph and the control
   inside stayed reachable.

5. **`aria-activedescendant` pointing at nothing.** Only visible with an empty
   queue, which is a real state that happens at the end of every shift and which
   no screen in the prototype renders. The story renders it.

Five defects, and the tool that found each one was different from the tool that
would have been expected to. That is the argument for having all of them rather
than trusting any one.

## Layout

```
src/lib/tokens.ts        the source of truth for every colour in the system
src/lib/contrast.json    generated: every declared pair with its measured ratio
src/styles/tokens.css    generated: the cascade, scoped to [data-verdict]
src/components/          20 components, Radix behaviour, CVA variants
src/stories/             28 stories, organised by state rather than by prop
eslint-rules/            three custom rules, with fixtures
scripts/build-tokens.mjs the generator and the contrast gate
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

## Scope

A concept product, built as a portfolio case study. There is no data layer, no
auth, no error semantics, no i18n and no release process, and the mock data is
mock data.

Treat it as a specification that happens to compile. If your stack differs,
throw the code away and keep the contract.

## Licence

MIT.
