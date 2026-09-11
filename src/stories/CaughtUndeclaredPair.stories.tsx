import type { Meta, StoryObj } from "@storybook/react-vite";
import contrast from "@/lib/contrast.json";
import { Defect } from "./_defect";

const meta = {
  title: "Verdict/What the checks caught/An undeclared pair",
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

/**
 * The finding, read out of the report rather than described.
 *
 * There is no swatch on this page, and that is the point. The defect was not a
 * colour that looked wrong, it was a row that did not exist, so the proof is the
 * list of rows that do. Both tables below are computed from contrast.json as the
 * page renders. If the fix is removed, the second table empties out and
 * this page says so.
 */
function surfacesFor(role: string) {
  const rows = contrast.measurements.filter((m) => m.fg === role);
  const surfaces = [...new Set(rows.map((m) => m.bg))];
  return { rows, surfaces };
}

const tertiary = surfacesFor("text-tertiary");
const rowMeta = surfacesFor("row-meta-fg");
const tertiaryCoversSunken = tertiary.surfaces.includes("surface-sunken");

function Table({
  caption,
  rows,
}: {
  caption: string;
  rows: typeof contrast.measurements;
}) {
  return (
    <div style={{ flex: "1 1 300px", minWidth: 300 }}>
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
        {caption}
      </p>
      <table className="vd-table" style={{ width: "100%", fontSize: 13 }}>
        <thead>
          <tr>
            <th scope="col" style={{ textAlign: "left" }}>On</th>
            <th scope="col" style={{ textAlign: "left" }}>Theme</th>
            <th scope="col" style={{ textAlign: "right" }}>Measured</th>
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((m) => (
              <tr key={`${m.theme}-${m.bg}`}>
                <td className="vd-mono">{m.bg}</td>
                <td>{m.theme}</td>
                <td className="vd-mono vd-table__num">{m.ratio.toFixed(2)}:1</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} style={{ color: "var(--vd-decision-decline-fg)" }}>
                No rows. The fix is gone.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export const AnUndeclaredPair: Story = {
  name: "An undeclared pair",
  render: () => (
    <Defect
      headline="A colour that was never measured on the surface it sat on"
      sawIt="Light-theme tertiary text was declared against panels and against the app background, and it passed against both. The queue rail is neither. It sits on the sunken surface, a third background, and that pairing had simply never been written down. It measured 4.38:1 there, under a 4.5 bar."
      caughtBy="Axe, on the queue rail. It has no list to work from: it measures whatever two colours ended up on top of each other."
      missedBy="The contrast gate, and not through a bug in it. A contrast report is a list of the pairings someone remembered, and the interesting failures live in the pairings they did not. Silence from a gate reads exactly like a pass."
      lives={{ label: "QueueRail, open", title: "Verdict/Workspace/QueueRail", story: "Open" }}
    >
      <p style={{ margin: "24px 0 0", maxWidth: "68ch" }}>
        There is no before-and-after swatch on this page. The defect was not a
        colour that looked wrong, it was a row that did not exist, so the proof
        is the list of rows that do. Both tables are read from{" "}
        <span style={{ fontFamily: mono }}>contrast.json</span> as this page
        renders.
      </p>

      <div style={{ display: "flex", gap: 28, flexWrap: "wrap", margin: "24px 0 0" }}>
        <Table
          caption="Where text-tertiary is declared"
          rows={tertiary.rows}
        />
        <Table
          caption="The fix: a role for the surface it actually sits on"
          rows={rowMeta.rows}
        />
      </div>

      <p style={{ margin: "22px 0 0", maxWidth: "68ch", color: "var(--vd-text-secondary)" }}>
        {tertiaryCoversSunken
          ? "text-tertiary is now declared against the sunken surface as well."
          : "surface-sunken is still absent from the left-hand table, because nothing renders text-tertiary there any more."}{" "}
        The fix was not a darker grey. It was giving the thing being coloured its
        own component token, so the pairing has a name, and therefore a row, and
        therefore a floor it has to clear on every build.
      </p>

      <p style={{ margin: "16px 0 0", maxWidth: "68ch", color: "var(--vd-text-secondary)" }}>
        Worth saying plainly, because it limits the gate this system is built
        around: a contrast report proves the colours in it are safe and proves
        nothing whatsoever about the colours that are not. That is why axe runs
        against rendered pixels afterwards, and why the two checks are not
        redundant.
      </p>
    </Defect>
  ),
};
