import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import contrast from "@/lib/contrast.json";
import verify from "@/lib/verify.json";
import { storyPath } from "./_defect";

/**
 * The argument, in the one place a stranger will actually look.
 *
 * A design system's constraints normally live in a README nobody opens and a CI
 * config nobody has access to. Someone evaluating this in ten minutes will open
 * a Storybook URL and click around. So the rules are documented here, beside the
 * components they govern.
 *
 * Every number on this page is now read from a generated file. That was not
 * true when the page was written. It said six gates while verify ran seven, and
 * twenty-one rule fixtures while the test file held twenty-three, both typed by
 * hand on the page whose whole argument is that an unchecked claim decays. See
 * scripts/build-verify-report.mjs.
 */
const meta = {
  title: "Verdict/Enforcement/What is checked",
  tags: ["!autodocs"],
  parameters: {
    layout: "fullscreen",
    /**
     * No addon panel on a documentation page. It has no args and no
     * interactions, so the panel renders Storybook telling the reader "This
     * story has no controls", which was the first sentence of prose this
     * Storybook offered about itself.
     */
    options: { showPanel: false },
    a11y: { test: "error" },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const belowGate = contrast.measurements.filter((m) => !m.passes && !m.advisory).length;

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
           3.77:1. Axe caught exactly that here, and it is the seventh defect
           on the list at the bottom of this page. */
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

/**
 * The seven, as links.
 *
 * They used to be seven paragraphs at the bottom of this page, which is where
 * the most persuasive evidence in the system went to be skipped. Each is now its
 * own page with the failure drawn beside the fix. The order is the order they
 * were found in, ending on the one nothing caught.
 */
const CAUGHT: { name: string; story: string; line: string }[] = [
  {
    name: "Inert button colour",
    story: "InertButtonColour",
    line: "A form reset outscored every variant, so all six rendered in the inherited body colour. 4.42:1 against a 4.5 bar.",
  },
  {
    name: "Opacity beat the gate",
    story: "OpacityBeatTheGate",
    line: "A decided row faded to 0.55, compositing a passing token down to 2.66:1. Opacity happens long after a pair is declared.",
  },
  {
    name: "A pair nobody declared",
    story: "APairNobodyDeclared",
    line: "Tertiary text was measured on two surfaces and rendered on a third. A gate is silent about the pairing nobody wrote down.",
  },
  {
    name: "An image around a button",
    story: "AnImageAroundAButton",
    line: 'role="img" wrapped around a focusable control. Reads well, and an image is a leaf node.',
  },
  {
    name: "A pointer to nothing",
    story: "APointerToNothing",
    line: "aria-activedescendant naming a row that no longer existed. Visible only with an empty queue, which no screen renders.",
  },
  {
    name: "The one no gate caught",
    story: "TheOneNoGateCaught",
    line: "A disabled button that dimmed its label and kept its fill. WCAG exempts disabled controls, so axe passed it. It needed an eye.",
  },
  {
    name: "This page's own mistake",
    story: "ThisPagesOwnMistake",
    line: "The red label on a failing example above, written with a fill token instead of a foreground one. 3.77:1, on this page, on its first run.",
  },
];

export const WhatIsChecked: Story = {
  name: "What is checked",
  render: () => (
    <div style={{ maxWidth: 860, lineHeight: 1.65 }}>
      <h1 style={{ fontSize: 26, margin: 0, letterSpacing: "-0.01em" }}>
        Every claim here is checked by something
      </h1>
      <p style={{ margin: "12px 0 0", maxWidth: "64ch", color: "var(--vd-text-secondary)" }}>
        A design system is a set of promises about what will not happen. Written
        in a README those promises decay, because nothing is watching. These ones
        fail a build. You do not have to take any of it on trust: clone the repo
        and run <code style={{ fontFamily: mono }}>npm run verify</code>.
      </p>

      <H>
        {verify.gates.length} gates, cheapest failure first
      </H>
      <ol style={{ margin: 0, paddingLeft: 20, maxWidth: "66ch" }}>
        {verify.gates.map((gate) => (
          <li key={gate.script} style={{ marginBottom: 10 }}>
            <strong>{gate.label}.</strong>{" "}
            <code style={{ fontFamily: mono, fontSize: 12.5, color: "var(--vd-text-tertiary)" }}>
              {gate.script}
            </code>
            <br />
            <span style={{ color: "var(--vd-text-secondary)" }}>{gate.proves}</span>
            {gate.script === "tokens:check" ? (
              <span style={{ color: "var(--vd-text-secondary)" }}>
                {" "}
                All {contrast.counts.pairsMeasured} declared pairs, currently{" "}
                {belowGate === 0 ? "none" : belowGate} below gate.
              </span>
            ) : null}
            {gate.script === "test:rules" ? (
              <span style={{ color: "var(--vd-text-secondary)" }}>
                {" "}
                {verify.fixtures.total} fixtures across the three rules.
              </span>
            ) : null}
            {gate.script === "test:a11y:ci" ? (
              <span style={{ color: "var(--vd-text-secondary)" }}>
                {" "}
                All {verify.stories.total} stories, none exempted.
              </span>
            ) : null}
          </li>
        ))}
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
      <p style={{ margin: "0 0 4px", maxWidth: "66ch", color: "var(--vd-text-secondary)" }}>
        Seven live defects, not a hypothetical list. In every case the check that
        found one was not the check you would have expected, and the sixth was
        not found by a check at all. Each has its own page, with the failure
        beside the fix.
      </p>
      <ol style={{ margin: "16px 0 0", padding: 0, listStyle: "none" }}>
        {CAUGHT.map((c, i) => (
          <li
            key={c.name}
            style={{
              padding: "14px 0",
              borderTop: "1px solid var(--vd-border-subtle)",
              display: "grid",
              gridTemplateColumns: "28px 1fr",
              gap: 14,
            }}
          >
            <span style={{ fontFamily: mono, fontSize: 12, color: "var(--vd-text-tertiary)" }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <a
                href={storyPath(`Verdict/What the checks caught/${c.name}`, c.story)}
                target="_top"
                style={{ color: "var(--vd-text-accent)", fontSize: 15 }}
              >
                {c.name}
              </a>
              <p style={{ margin: "4px 0 0", color: "var(--vd-text-secondary)", maxWidth: "64ch" }}>
                {c.line}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <p
        style={{
          margin: "36px 0 0",
          paddingTop: 16,
          borderTop: "1px solid var(--vd-border-subtle)",
          fontSize: 13,
          color: "var(--vd-text-tertiary)",
          maxWidth: "66ch",
        }}
      >
        Every number on this page, including the count of checks and the count of
        stories they run against, is read from a file the build generates. If any
        of them is wrong here, the build is wrong too. That sentence used to be
        two thirds true, which is how this page came to claim six gates while
        seven were running.
      </p>
    </div>
  ),
};
