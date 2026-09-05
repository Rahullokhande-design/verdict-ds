import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import {
  Checkbox,
  FilterPill,
  Segmented,
  SortHeader,
} from "@/components/compounds";
import { Matrix, Row, Stack, State } from "./_harness";

/**
 * Tier 2: compounds. Radix behaviour plus this system's styling, still with no
 * knowledge of what a case or a score is.
 */
const meta = {
  title: "Verdict/2 Compounds/Checkbox",
  component: Checkbox,
  args: {
    checked: false,
    onCheckedChange: () => {},
    label: "Select case VRD-4824",
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

function Controlled({
  initial,
  disabled,
}: {
  initial: boolean | "indeterminate";
  disabled?: boolean;
}) {
  const [checked, setChecked] = React.useState(initial);
  return (
    <Checkbox
      checked={checked}
      onCheckedChange={setChecked}
      disabled={disabled}
      label="Select case VRD-4824"
    />
  );
}

/**
 * Indeterminate is the state that matters and the state that gets skipped.
 *
 * A bulk-select header checkbox spends most of its life partially checked, and
 * a system that only ever drew on and off produces a header that lies about
 * what is selected.
 */
export const CheckboxStates: Story = {
  name: "Checkbox states",
  render: () => (
    <Matrix>
      <State name="unchecked">
        <Controlled initial={false} />
      </State>
      <State name="checked">
        <Controlled initial={true} />
      </State>
      <State name="indeterminate" note="bulk header, some rows selected">
        <Controlled initial="indeterminate" />
      </State>
      <State name="disabled">
        <Controlled initial={false} disabled />
      </State>
      <State name="disabled + checked">
        <Controlled initial={true} disabled />
      </State>
    </Matrix>
  ),
};

export const SegmentedStates: StoryObj = {
  name: "Segmented",
  render: function Render() {
    const [density, setDensity] = React.useState<"compact" | "comfortable">(
      "compact"
    );
    const [band, setBand] = React.useState<"all" | "r3" | "r4">("all");
    return (
      <Stack gap={24}>
        <State name="two options" note="density">
          <Segmented
            value={density}
            onValueChange={setDensity}
            label="Row density"
            options={[
              { value: "compact", label: "Compact" },
              { value: "comfortable", label: "Comfortable" },
            ]}
          />
        </State>
        <State name="three options">
          <Segmented
            value={band}
            onValueChange={setBand}
            label="Risk band"
            options={[
              { value: "all", label: "All" },
              { value: "r3", label: "R3" },
              { value: "r4", label: "R4" },
            ]}
          />
        </State>
      </Stack>
    );
  },
};

export const FilterPills: StoryObj = {
  name: "Filter pill",
  render: function Render() {
    const [on, setOn] = React.useState<string[]>(["open"]);
    const toggle = (k: string) =>
      setOn((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));
    return (
      <Stack gap={24}>
        <State name="with counts" note="aria-pressed carries the state">
          <Row>
            <FilterPill active={on.includes("open")} onClick={() => toggle("open")} count={9}>
              Open
            </FilterPill>
            <FilterPill active={on.includes("r4")} onClick={() => toggle("r4")} count={2}>
              Severe
            </FilterPill>
            <FilterPill active={on.includes("rule")} onClick={() => toggle("rule")} count={3}>
              Held by rule
            </FilterPill>
          </Row>
        </State>
        <State name="no count" note="the zero state must not render an empty badge">
          <Row>
            <FilterPill active={false} onClick={() => {}}>
              Decided
            </FilterPill>
            <FilterPill active onClick={() => {}} count={0}>
              Expired
            </FilterPill>
          </Row>
        </State>
      </Stack>
    );
  },
};

/**
 * The arrow is `aria-hidden`; `aria-sort` on the `th` is what actually carries
 * the state. A sorted table whose sort is only a glyph is a table that is
 * sorted for some of its users.
 */
export const SortHeaders: StoryObj = {
  name: "Sort header",
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
