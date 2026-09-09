import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import contrast from "@/lib/contrast.json";
import verify from "@/lib/verify.json";
import { storyPath } from "./_defect";

/**
 * The first screen.
 *
 * There was not one. Storybook opened on a bare Button with an empty controls
 * panel, and the first sentence of prose a visitor read was Storybook's own
 * "This story has no controls." Nothing on screen said what the system was, who
 * had built it, or where to click next. The README said to start at the
 * enforcement page, which helps the fraction of visitors who arrive via the
 * README rather than via a link.
 *
 * One screen, no scroll, three claims and four ways out.
 */
const meta = {
  title: "Verdict/Start here/Overview",
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
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const mono = "var(--vd-fontFamily-mono)";

const CASE_STUDY = "https://bindustudio.dev/work/verdict";
const REPO = "https://github.com/Rahullokhande-design/verdict-ds";
const STUDIO = "https://bindustudio.dev";

const belowGate = contrast.measurements.filter((m) => !m.passes && !m.advisory).length;

function Claim({
  n,
  claim,
  proof,
  href,
  cta,
}: {
  n: string;
  claim: string;
  proof: string;
  href: string;
  cta: string;
}) {
  return (
    <li
      style={{
        padding: "18px 0",
        borderTop: "1px solid var(--vd-border-subtle)",
        display: "grid",
        gridTemplateColumns: "28px 1fr",
        gap: 16,
      }}
    >
      <span style={{ fontFamily: mono, fontSize: 12, color: "var(--vd-text-tertiary)" }}>
        {n}
      </span>
      <div>
        <p style={{ margin: 0, fontSize: 16 }}>{claim}</p>
        <p style={{ margin: "6px 0 0", color: "var(--vd-text-secondary)", maxWidth: "62ch" }}>
          {proof}
        </p>
        <p style={{ margin: "8px 0 0" }}>
          <a href={href} target="_top" style={{ color: "var(--vd-text-accent)", fontSize: 13.5 }}>
            {cta}
          </a>
        </p>
      </div>
    </li>
  );
}

function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div>
      <p style={{ margin: 0, fontFamily: mono, fontSize: 22, letterSpacing: "-0.01em" }}>
        {value}
      </p>
      <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "var(--vd-text-tertiary)" }}>
        {label}
      </p>
    </div>
  );
}

export const Overview: Story = {
  name: "Overview",
  render: () => (
    <div style={{ maxWidth: 840, lineHeight: 1.6 }}>
      <p style={{ fontFamily: mono, fontSize: 12, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--vd-text-tertiary)", margin: 0 }}>
        A design system you can disbelieve
      </p>
      <h1 style={{ fontSize: 30, margin: "10px 0 0", letterSpacing: "-0.02em", maxWidth: "20ch" }}>
        Verdict Design System
      </h1>
      <p style={{ margin: "14px 0 0", maxWidth: "66ch", fontSize: 16, color: "var(--vd-text-secondary)" }}>
        The token architecture and component library for Verdict, a concept
        card-fraud review console. A model scores flagged transactions and a
        human decides. It is not a shipped product, and nothing here pretends
        otherwise.
      </p>
      <p style={{ margin: "12px 0 0", maxWidth: "66ch", color: "var(--vd-text-secondary)" }}>
        The interesting part is not the components. It is that every constraint
        this system claims is checked by something that fails a build, including
        the numbers on this page.
      </p>

      <div
        style={{
          display: "flex",
          gap: 36,
          flexWrap: "wrap",
          margin: "28px 0 0",
          padding: "18px 20px",
          borderRadius: 8,
          background: "var(--vd-surface-sunken)",
        }}
      >
        <Stat value={verify.components.total} label="components" />
        <Stat value={verify.stories.componentStates} label="component states" />
        <Stat value={verify.gates.length} label="build gates" />
        <Stat value={verify.fixtures.total} label="lint rule fixtures" />
        <Stat value={contrast.counts.pairsMeasured} label="colour pairs measured" />
        <Stat value={belowGate} label="below their floor" />
      </div>

      <h2 style={{ fontSize: 13, letterSpacing: "0.09em", textTransform: "uppercase", fontFamily: mono, color: "var(--vd-text-tertiary)", margin: "40px 0 4px", fontWeight: 500 }}>
        Three claims, and where each one is proved
      </h2>
      <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
        <Claim
          n="01"
          claim="Every constraint is enforced, not written down."
          proof={`${verify.gates.length} gates run on every commit, including three custom lint rules that encode this system's own architecture and ${verify.fixtures.total} fixtures proving those rules actually fire.`}
          href={storyPath("Verdict/Enforcement/What is checked", "What is checked")}
          cta="What is checked"
        />
        <Claim
          n="02"
          claim="The checks caught seven real defects. One of them they missed."
          proof="Every case here is a defect that shipped, with the failure beside the fix. In every one, the check that found it was not the check you would have expected, and the seventh was committed by the person documenting the rule it broke."
          href={storyPath("Verdict/What the checks caught/Inert button colour", "Inert button colour")}
          cta="What the checks caught"
        />
        <Claim
          n="03"
          claim="Colour is measured, not asserted."
          proof={`Three tiers, ${contrast.counts.semanticRoles} semantic roles in both themes, and every declared pair scored against WCAG 2.2 on every build. Currently ${belowGate === 0 ? "none" : belowGate} below its floor.`}
          href={storyPath("Verdict/Foundations/Measured contrast", "Measured contrast")}
          cta="The measured contrast table"
        />
      </ol>

      <h2 style={{ fontSize: 13, letterSpacing: "0.09em", textTransform: "uppercase", fontFamily: mono, color: "var(--vd-text-tertiary)", margin: "40px 0 12px", fontWeight: 500 }}>
        How to use this in ten minutes
      </h2>
      <ul style={{ margin: 0, paddingLeft: 20, maxWidth: "66ch", color: "var(--vd-text-secondary)" }}>
        <li>
          Flip the theme in the toolbar. Nothing in the library knows which theme
          it is in, which is the entire job of the middle tier.
        </li>
        <li style={{ marginTop: 6 }}>
          Open the <strong>Accessibility</strong> panel on any story. It runs axe
          live against what is on screen, and it is the same engine CI runs, so a
          green panel is the claim demonstrating itself.
        </li>
        <li style={{ marginTop: 6 }}>
          Distrust all of it and run{" "}
          <code style={{ fontFamily: mono }}>npm run verify</code> from the repo.
          That is the command CI runs, in that order, cheapest failure first.
        </li>
      </ul>

      <div
        style={{
          margin: "40px 0 0",
          paddingTop: 20,
          borderTop: "1px solid var(--vd-border-subtle)",
          display: "flex",
          gap: 28,
          flexWrap: "wrap",
          fontSize: 13.5,
        }}
      >
        <a href={CASE_STUDY} style={{ color: "var(--vd-text-accent)" }}>
          The case study
        </a>
        <a href={REPO} style={{ color: "var(--vd-text-accent)" }}>
          Source on GitHub
        </a>
        <a href={`${REPO}/blob/main/src/lib/tokens.json`} style={{ color: "var(--vd-text-accent)" }}>
          tokens.json, W3C DTCG format
        </a>
        <a href={STUDIO} style={{ color: "var(--vd-text-accent)" }}>
          Bindu Studio
        </a>
      </div>

      <p style={{ margin: "20px 0 0", fontSize: 13, color: "var(--vd-text-tertiary)", maxWidth: "66ch" }}>
        Designed and built by Rahul Lokhande at Bindu Studio. Design and
        front-end for software people use at work.
      </p>
    </div>
  ),
};
