import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import contrast from "@/lib/contrast.json";
import { Chip, PageTitle, mono, resolve, semantic, component } from "./_tokens";

/**
 * The architecture, followed rather than described.
 *
 * Three tiers is a claim every design system makes and most of them are two
 * tiers with a naming convention. The difference is only visible if you trace a
 * single value all the way down, in both themes, which is what this page does
 * live from tokens.json.
 */
const meta = {
  title: "Verdict/Foundations/Three tiers",
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

/**
 * One real chain, picked because it is the most boring value in the system.
 *
 * The panel background is not an interesting colour. That is the point: if the
 * tiers only pay off on the dramatic tokens, they are decoration.
 */
const CHAIN = "shell.topbar.bg";

function chainFor(theme: "dark" | "light") {
  const entry = component(theme).find(([name]) => name === CHAIN);
  if (!entry) {
    throw new Error(
      `Foundations/Three tiers follows the component token "${CHAIN}", which no longer exists. ` +
        `Point it at one that does rather than deleting the page.`
    );
  }
  const [, raw] = entry;
  const { hops, final } = resolve(raw);
  return { raw, hops, final };
}

const dark = chainFor("dark");
const light = chainFor("light");

const counts = {
  primitives: contrast.counts.primitives,
  semantic: semantic("dark").length,
  component: component("dark").length,
};

function Tier({
  n,
  name,
  rule,
  example,
  value,
  swatch,
}: {
  n: string;
  name: string;
  rule: string;
  example: string;
  value: string;
  swatch?: string;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "34px 1fr",
        gap: 16,
        padding: "18px 0",
        borderTop: "1px solid var(--vd-border-subtle)",
      }}
    >
      <span style={{ fontFamily: mono, fontSize: 12, color: "var(--vd-text-tertiary)" }}>
        {n}
      </span>
      <div>
        <p style={{ margin: 0, fontSize: 15 }}>
          <strong>{name}</strong>
        </p>
        <p style={{ margin: "4px 0 0", color: "var(--vd-text-secondary)", maxWidth: "62ch" }}>
          {rule}
        </p>
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            margin: "12px 0 0",
            padding: "10px 12px",
            borderRadius: 6,
            background: "var(--vd-surface-sunken)",
            flexWrap: "wrap",
          }}
        >
          {swatch ? <Chip value={swatch} size={22} /> : null}
          <code style={{ fontFamily: mono, fontSize: 12.5 }}>{example}</code>
          <span style={{ color: "var(--vd-text-tertiary)" }}>resolves to</span>
          <code style={{ fontFamily: mono, fontSize: 12.5, color: "var(--vd-text-accent)" }}>
            {value}
          </code>
        </div>
      </div>
    </div>
  );
}

function ThemeChain({
  theme,
  data,
}: {
  theme: string;
  data: { hops: string[]; final: string };
}) {
  const steps = [CHAIN, ...data.hops];
  return (
    <div style={{ flex: "1 1 320px", minWidth: 320 }}>
      <p
        style={{
          fontFamily: mono,
          fontSize: 11,
          letterSpacing: "0.09em",
          textTransform: "uppercase",
          color: "var(--vd-text-tertiary)",
          margin: "0 0 10px",
        }}
      >
        {theme} theme
      </p>
      <ol style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {steps.map((step, i) => (
          <li
            key={step}
            style={{
              display: "flex",
              gap: 10,
              alignItems: "baseline",
              padding: "6px 0",
              paddingLeft: i * 14,
            }}
          >
            <span style={{ color: "var(--vd-text-tertiary)", fontFamily: mono, fontSize: 11 }}>
              {i === 0 ? "3" : i === 1 ? "2" : "1"}
            </span>
            <code style={{ fontFamily: mono, fontSize: 12.5 }}>
              {step.replace(/^theme\.(dark|light)\./, "")}
            </code>
          </li>
        ))}
      </ol>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10, paddingLeft: steps.length * 14 - 14 }}>
        <Chip value={data.final} size={22} />
        <code style={{ fontFamily: mono, fontSize: 12.5, color: "var(--vd-text-accent)" }}>
          {data.final}
        </code>
      </div>
    </div>
  );
}

export const ThreeTiers: Story = {
  name: "Three tiers",
  render: () => (
    <div style={{ maxWidth: 860, lineHeight: 1.65 }}>
      <PageTitle
        kicker="Foundations"
        title="Three tiers, followed all the way down"
        lede={
          <>
            Every value on this page is read from{" "}
            <code style={{ fontFamily: mono }}>tokens.json</code> as the page
            renders, and the chain below is resolved one hop at a time the way a
            browser resolves it. Nothing here is a diagram of how it used to work.
          </>
        }
      />

      <div style={{ display: "flex", gap: 32, flexWrap: "wrap", margin: "28px 0 0" }}>
        <div>
          <p style={{ margin: 0, fontFamily: mono, fontSize: 22 }}>{counts.primitives}</p>
          <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "var(--vd-text-tertiary)" }}>
            primitives
          </p>
        </div>
        <div>
          <p style={{ margin: 0, fontFamily: mono, fontSize: 22 }}>{counts.semantic}</p>
          <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "var(--vd-text-tertiary)" }}>
            semantic roles, per theme
          </p>
        </div>
        <div>
          <p style={{ margin: 0, fontFamily: mono, fontSize: 22 }}>{counts.component}</p>
          <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "var(--vd-text-tertiary)" }}>
            component tokens, per theme
          </p>
        </div>
      </div>

      <Tier
        n="01"
        name="Primitives"
        rule="The scale. A colour is allowed to be born here and nowhere else, which is what the no-raw-hex lint rule enforces. A primitive has no opinion about what it is for."
        example="primitive.color.graphite.850"
        value={resolve("{primitive.color.graphite.850}").final}
        swatch={resolve("{primitive.color.graphite.850}").final}
      />
      <Tier
        n="02"
        name="Semantic roles"
        rule="What a colour is for, defined once per theme. This is the tier that makes a theme switch possible, and the tier a component is banned from skipping."
        example="surface.raised"
        value={resolve("{theme.dark.semantic.surface.raised}").final}
        swatch={resolve("{theme.dark.semantic.surface.raised}").final}
      />
      <Tier
        n="03"
        name="Component tokens"
        rule="What one part of one component uses. A component reads this tier and the one above it. Never the first."
        example={CHAIN}
        value={dark.final}
        swatch={dark.final}
      />

      <h2
        style={{
          fontSize: 13,
          letterSpacing: "0.09em",
          textTransform: "uppercase",
          fontFamily: mono,
          color: "var(--vd-text-tertiary)",
          margin: "44px 0 14px",
          fontWeight: 500,
        }}
      >
        The same token, both themes
      </h2>
      <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
        <ThemeChain theme="Dark" data={dark} />
        <ThemeChain theme="Light" data={light} />
      </div>

      <h2
        style={{
          fontSize: 13,
          letterSpacing: "0.09em",
          textTransform: "uppercase",
          fontFamily: mono,
          color: "var(--vd-text-tertiary)",
          margin: "44px 0 14px",
          fontWeight: 500,
        }}
      >
        Why the middle tier is not optional
      </h2>
      <p style={{ margin: 0, maxWidth: "66ch" }}>
        A component that reaches past the semantic tier straight to a primitive
        gets the right colour, once. It renders identically in the dark theme on
        the day it is written, which is why this is the constraint that degrades
        quietest and the reason it needed a lint rule rather than a convention.
      </p>
      <p style={{ margin: "12px 0 0", maxWidth: "66ch", color: "var(--vd-text-secondary)" }}>
        The chains above are the proof. Tier three points at tier two, and tier
        two lands on a different primitive in each theme. Cut out the middle and
        the light column resolves to the dark value, in an interface nobody looked
        at in the light theme that week.
      </p>
      <p style={{ margin: "12px 0 0", maxWidth: "66ch", color: "var(--vd-text-secondary)" }}>
        Aliases survive the export too. In{" "}
        <code style={{ fontFamily: mono }}>tokens.json</code> a role exports as{" "}
        <code style={{ fontFamily: mono }}>
          {"{primitive.color.graphite.850}"}
        </code>
        , not as a flattened hex, so a pipeline that reads it inherits the graph
        rather than a list of colours that used to have a structure.
      </p>
    </div>
  ),
};
