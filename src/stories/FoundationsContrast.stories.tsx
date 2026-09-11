import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import contrast from "@/lib/contrast.json";
import { Chip, PageTitle, mono } from "./_tokens";

/**
 * The contrast gate, as a readout rather than a claim.
 *
 * This file already existed and was already generated. It was imported into the
 * Storybook to produce exactly two numbers, and the argument it supports was
 * made in prose beside them. Every pair the build measures is here now, with the
 * context string the token source records for each one, which is the part that
 * turns a table of ratios into an account of where each colour is actually used.
 */
const meta = {
  title: "Verdict/Foundations/Measured contrast",
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

type Row = (typeof contrast.measurements)[number];

const gated = contrast.measurements.filter((m) => !m.advisory);
const advisory = contrast.measurements.filter((m) => m.advisory);
const failing = gated.filter((m) => !m.passes);

/** Tightest first: the interesting end of a contrast report is the bottom of it. */
const byMargin = (a: Row, b: Row) => a.ratio - a.min - (b.ratio - b.min);

function Status({ row }: { row: Row }) {
  if (row.advisory) {
    return (
      <span style={{ color: "var(--vd-text-tertiary)" }}>
        advisory{row.passes ? "" : ", under"}
      </span>
    );
  }
  return row.passes ? (
    <span style={{ color: "var(--vd-decision-approve-fg)" }}>passes</span>
  ) : (
    <span style={{ color: "var(--vd-decision-decline-fg)" }}>below gate</span>
  );
}

function Table({ rows, caption }: { rows: Row[]; caption: string }) {
  return (
    <section style={{ marginTop: 32 }}>
      <h2
        style={{
          fontSize: 13,
          letterSpacing: "0.09em",
          textTransform: "uppercase",
          fontFamily: mono,
          color: "var(--vd-text-tertiary)",
          margin: "0 0 10px",
          fontWeight: 500,
        }}
      >
        {caption} · {rows.length}
      </h2>
      <div style={{ overflowX: "auto" }}>
        <table className="vd-table" style={{ width: "100%", fontSize: 13, minWidth: 720 }}>
          <thead>
            <tr>
              <th scope="col" style={{ textAlign: "left" }} colSpan={2}>Pair</th>
              <th scope="col" style={{ textAlign: "left" }}>Foreground</th>
              <th scope="col" style={{ textAlign: "left" }}>On</th>
              <th scope="col" style={{ textAlign: "left" }}>Theme</th>
              <th scope="col" style={{ textAlign: "right" }}>Ratio</th>
              <th scope="col" style={{ textAlign: "right" }}>Floor</th>
              <th scope="col" style={{ textAlign: "left" }}>Status</th>
              <th scope="col" style={{ textAlign: "left" }}>Where it is used</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.theme}-${row.fg}-${row.bg}`}>
                <td style={{ width: 26 }}>
                  <Chip value={row.bgHex} size={20} title={row.bgHex} />
                </td>
                <td style={{ width: 26 }}>
                  <Chip value={row.fgHex} size={20} title={row.fgHex} />
                </td>
                <td className="vd-mono">{row.fg}</td>
                <td className="vd-mono">{row.bg}</td>
                <td>{row.theme}</td>
                <td className="vd-mono vd-table__num">{row.ratio.toFixed(2)}</td>
                <td className="vd-mono vd-table__num" style={{ color: "var(--vd-text-tertiary)" }}>
                  {row.min.toFixed(1)}
                </td>
                <td>
                  <Status row={row} />
                </td>
                <td style={{ color: "var(--vd-text-secondary)" }}>{row.context}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export const MeasuredContrast: Story = {
  name: "Measured contrast",
  render: () => (
    <div style={{ maxWidth: 1080, lineHeight: 1.6 }}>
      <PageTitle
        kicker="Foundations"
        title="Every pair the build measures"
        lede={
          <>
            Read from <code style={{ fontFamily: mono }}>contrast.json</code>,
            which is generated from the token source and is the same file the
            build gate reads. If a row here is wrong, the build is wrong.
            Tightest margin first, because the bottom of a contrast report is the
            only part of it that tells you anything.
          </>
        }
      />

      <div style={{ display: "flex", gap: 36, flexWrap: "wrap", margin: "26px 0 0" }}>
        <div>
          <p style={{ margin: 0, fontFamily: mono, fontSize: 22 }}>
            {contrast.counts.pairsMeasured}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "var(--vd-text-tertiary)" }}>
            pairs measured
          </p>
        </div>
        <div>
          <p style={{ margin: 0, fontFamily: mono, fontSize: 22 }}>{failing.length}</p>
          <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "var(--vd-text-tertiary)" }}>
            below their floor
          </p>
        </div>
        <div>
          <p style={{ margin: 0, fontFamily: mono, fontSize: 22 }}>
            {contrast.floors.dark.toFixed(2)}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "var(--vd-text-tertiary)" }}>
            tightest gated pair, dark
          </p>
        </div>
        <div>
          <p style={{ margin: 0, fontFamily: mono, fontSize: 22 }}>
            {contrast.floors.light.toFixed(2)}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "var(--vd-text-tertiary)" }}>
            tightest gated pair, light
          </p>
        </div>
      </div>

      <Table rows={[...gated].sort(byMargin)} caption="Gated" />
      <Table rows={[...advisory].sort(byMargin)} caption="Advisory" />

      <p style={{ margin: "28px 0 0", maxWidth: "70ch", color: "var(--vd-text-secondary)" }}>
        The advisory rows are the disabled-control pairs. WCAG exempts inactive
        components from contrast, so nothing requires them to pass and they are
        not gated. They are measured anyway, because the number is worth knowing
        and because a standard that exempts something is not the same as that
        thing being usable. A disabled button that kept its saturated fill is the
        sixth defect on the list this system publishes, and no gate found it.
      </p>

      <p style={{ margin: "16px 0 0", maxWidth: "70ch", color: "var(--vd-text-secondary)" }}>
        Worth stating the limit of this table plainly: it proves the pairs in it
        are safe, and proves nothing at all about a pairing that was never declared. That
        is a real defect this system shipped, and the reason axe runs against
        rendered pixels afterwards rather than trusting the report.
      </p>
    </div>
  ),
};
