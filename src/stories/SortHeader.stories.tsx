import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { SortHeader } from "@/components/compounds";
import { fn } from "storybook/test";

/**
 * The arrow is `aria-hidden`; `aria-sort` on the `th` is what actually carries
 * the state. A sorted table whose sort is only a glyph is a table that is
 * sorted for some of its users.
 */
const meta = {
  title: "Verdict/Compounds/SortHeader",
  component: SortHeader,
  args: { label: "Score", active: true, direction: "desc", onClick: fn() },
} satisfies Meta<typeof SortHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const States: Story = {
  render: function Render() {
    const [sort, setSort] = React.useState<{ key: string; dir: "asc" | "desc" }>({
      key: "score",
      dir: "desc",
    });
    const click = (key: string) =>
      setSort((s) =>
        s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }
      );
    return (
      <table className="vd-table" style={{ width: "100%" }}>
        <thead>
          <tr>
            <SortHeader label="Case" active={sort.key === "case"} direction={sort.dir} onClick={() => click("case")} />
            <SortHeader label="Merchant" active={sort.key === "merchant"} direction={sort.dir} onClick={() => click("merchant")} />
            <SortHeader label="Score" align="right" active={sort.key === "score"} direction={sort.dir} onClick={() => click("score")} />
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="vd-mono">VRD-4824</td>
            <td>Northgate Supply</td>
            <td className="vd-mono vd-table__num">28</td>
          </tr>
        </tbody>
      </table>
    );
  },
};
