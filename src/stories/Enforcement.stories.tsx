import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import contrast from "@/lib/contrast.json";

/**
 * The argument, in the one place a stranger will actually look.
 *
 * A design system's constraints normally live in a README nobody opens and a CI
 * config nobody has access to. Someone evaluating this in ten minutes will open
 * a Storybook URL and click around. So the rules are documented here, beside the
 * components they govern, with the numbers read from the same generated report
 * the build gate reads.
 */
const meta = {
  title: "Verdict/0 Enforcement/What is checked",
  parameters: {
    layout: "fullscreen",
    a11y: { test: "error" },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const belowGate = contrast.measurements.filter(
  (m) => !m.passes && !m.advisory
).length;

const mono = "var(--vd-fontFamily-mono)";

function H({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: 13,
        letterSpacing: "0.09em",
        textTransform: "uppercase",
        fontFamily: mono,
        color: "var(--vd-text-tertiary)",
        margin: "40px 0 14px",
        fontWeight: 500,
      }}
    >
      {children}
    </h2>
  );
}

function Code({ ok, children }: { ok?: boolean; children: React.ReactNode }) {
  return (
    <pre
      style={{
        fontFamily: mono,
        fontSize: 12.5,
        lineHeight: 1.6,
        margin: "8px 0 0",
        padding: "10px 12px",
        borderRadius: 6,
        overflowX: "auto",
        background: "var(--vd-surface-sunken)",
        color: "var(--vd-text-secondary)",
        borderLeft: `2px solid ${
          ok ? "var(--vd-decision-approve-solid)" : "var(--vd-decision-decline-solid)"
        }`,
        /* The rule border may use the solid fill. The label below may not, and
           that distinction is the whole point of having both tokens: -solid is
           a background, -fg is a foreground, and reaching for the solid because
           it is the more obvious name puts a fill colour on a dark surface at
           3.76:1. Axe caught exactly that here. */
      }}
    >
      <span
        style={{
          color: ok
            ? "var(--vd-decision-approve-fg)"
            : "var(--vd-decision-decline-fg)",
        }}
      >
        {ok ? "passes  " : "fails   "}
      </span>
      {children}
    </pre>
  );
}

function Rule({
  name,
  what,
  why,
  bad,
  good,
}: {
  name: string;
  what: string;
  why: string;
  bad: string;
  good: string;
}) {
  return (
    <div
      style={{
        padding: "18px 0",
        borderTop: "1px solid var(--vd-border-subtle)",
      }}
    >
      <p style={{ fontFamily: mono, fontSize: 13, margin: 0, color: "var(--vd-text-accent)" }}>
        {name}
      </p>
      <p style={{ margin: "8px 0 0", maxWidth: "62ch", lineHeight: 1.6 }}>{what}</p>
      <p
        style={{
          margin: "8px 0 0",
          maxWidth: "62ch",
          lineHeight: 1.6,
          color: "var(--vd-text-secondary)",
        }}
      >
        {why}
      </p>
      <Code>{bad}</Code>
      <Code ok>{good}</Code>
    </div>
  );
}

export const WhatIsChecked: Story = {
  name: "What is checked",
  render: () => (
    <div style={{ maxWidth: 820, lineHeight: 1.65 }}>
      <h1 style={{ fontSize: 26, margin: 0, letterSpacing: "-0.01em" }}>
        Every claim here is checked by something
      </h1>
      <p style={{ margin: "12px 0 0", maxWidth: "62ch", color: "var(--vd-text-secondary)" }}>
        A design system is a set of promises about what will not happen. Written
        in a README those promises decay, because nothing is watching. These ones
        fail a build. You do not have to take any of it on trust: clone the repo
        and run <code style={{ fontFamily: mono }}>npm run verify</code>.
      </p>

      <H>Six gates</H>
      <ol style={{ margin: 0, paddingLeft: 20, maxWidth: "64ch" }}>
        <li>
          <strong>Tokens are current.</strong> The committed cascade matches what
          the source generates, the three tiers resolve without a component ever
          reaching a primitive, every semantic role exists in both themes, and
          all {contrast.counts.pairsMeasured} declared colour pairs meet their
          WCAG minimum. Currently {belowGate === 0 ? "none" : belowGate} below
          gate.
        </li>
        <li>
          <strong>Types.</strong> <code style={{ fontFamily: mono }}>tsc --noEmit</code>.
        </li>
        <li>
          <strong>Lint.</strong> typescript-eslint and jsx-a11y, plus the three
          custom rules below, all as errors. A rule that warns is a rule that is
          off.
        </li>
        <li>
          <strong>Rule fixtures.</strong> Twenty-one cases showing each custom
          rule catching what it claims and permitting what it is allowed to. This
          system&rsquo;s own source passes all three cleanly, so a green lint would
          otherwise prove nothing about whether the rules work.
        </li>
        <li>
          <strong>Storybook builds.</strong>
        </li>
        <li>
          <strong>Axe, every story, in a real browser.</strong> Not the panel,
          which is a suggestion. The run exits non-zero on any violation.
        </li>
      </ol>

      <H>Three rules this system wrote for itself</H>
      <Rule
        name="verdict/no-raw-hex"
        what="A colour may only be born in the token source."
        why="A raw hex never enters the generated contrast report, so it is never measured and never gated. It is not untidy, it is a colour that has opted out of being checked."
        bad={`const bg = "#141A21";`}
        good={`const bg = "var(--vd-surface-raised)";`}
      />
      <Rule
        name="verdict/no-primitive-token-in-component"
        what="A component reads semantic and component tokens. Never a tier-1 colour primitive."
        why="This is the constraint that degrades quietest. Both lines below render identically in the dark theme on the day they are written. Only one of them still works when the light theme is opened, because a primitive does not flip and a role does."
        bad={`color: var(--vd-color-graphite-800)`}
        good={`color: var(--vd-surface-raised)`}
      />
      <Rule
        name="verdict/no-handler-on-non-interactive"
        what="No interaction handler on an element the keyboard cannot reach."
        why="The failure is invisible to whoever writes it, because they are holding a mouse. The rule allows the legitimate composite pattern, a roled and focusable widget the platform has no tag for, which is what the queue rail is."
        bad={`<div onClick={decide} />`}
        good={`<ul role="listbox" tabIndex={0} onKeyDown={move}>`}
      />

      <H>What the checks actually caught</H>
      <p style={{ margin: "0 0 10px", maxWidth: "64ch", color: "var(--vd-text-secondary)" }}>
        Not a hypothetical list. Seven live defects, and in every case the check
        that found one was not the check you would have expected.
      </p>
      <ol style={{ margin: 0, paddingLeft: 20, maxWidth: "64ch" }}>
        <li>
          <strong>Every button variant&rsquo;s colour was inert.</strong> A form reset
          written <code style={{ fontFamily: mono }}>[data-verdict] button</code>{" "}
          scores (0,1,1) and beat every single-class variant, so all six rendered
          in the inherited body colour. The token gate could not see it: the
          pairs the tokens declared were correct. Axe measured the rendered
          pixels and put the accent button at 4.42:1 against a 4.5 bar.
        </li>
        <li>
          <strong>Opacity defeating the contrast gate.</strong> A decided row
          faded to 0.55 composited a passing colour down to 2.66:1. Opacity is
          applied long after a pair is declared.
        </li>
        <li>
          <strong>A colour never measured on the surface it sat on.</strong>{" "}
          Light-theme tertiary text passed on panels and on the app background,
          and sat at 4.38:1 on the sunken surface the queue rail uses. That pair
          had simply never been declared.
        </li>
        <li>
          <strong>role=&quot;img&quot; wrapped around a focusable control.</strong>{" "}
          Reads well, and is invalid: an image is a leaf node.
        </li>
        <li>
          <strong>aria-activedescendant pointing at nothing.</strong> Visible
          only with an empty queue, which happens at the end of every shift and
          which no screen renders.
        </li>
        <li>
          <strong>A disabled button that dimmed its label but kept a saturated
          fill.</strong>{" "}
          Exposed by fixing the first one.{" "}
          <em>
            No gate caught this. WCAG exempts disabled controls from contrast, so
            axe passed it cleanly. It needed an eye.
          </em>{" "}
          Which is the honest end of the argument: the checks find what they are
          shaped to find, and somebody still has to look.
        </li>
        <li>
          <strong>This page, on its first run.</strong> The red label on a failing
          example above was written with{" "}
          <code style={{ fontFamily: mono }}>--vd-decision-decline-solid</code>,
          a fill colour, used as text: 3.76:1 on a dark surface. The system
          already had the right token,{" "}
          <code style={{ fontFamily: mono }}>-fg</code> rather than{" "}
          <code style={{ fontFamily: mono }}>-solid</code>, and the wrong one was
          simply the more obvious name. Which is the mistake that split exists to
          make catchable, committed by the person documenting the split.
        </li>
      </ol>

      <p
        style={{
          margin: "36px 0 0",
          paddingTop: 16,
          borderTop: "1px solid var(--vd-border-subtle)",
          fontSize: 13,
          color: "var(--vd-text-tertiary)",
          maxWidth: "64ch",
        }}
      >
        Numbers on this page are read from the generated contrast report, the
        same file the build gate reads. If they are wrong here, the build is
        wrong too.
      </p>
    </div>
  ),
};
