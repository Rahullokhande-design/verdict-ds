import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { FilterPill } from "@/components/compounds";
import { Row, Stack, State } from "./_harness";

/**
 * A toggle that carries its own count. The pressed state is on
 * `aria-pressed`, not on the fill, so a screen reader is told what a sighted
 * user is shown.
 */
const meta = {
  title: "Verdict/Compounds/FilterPill",
  component: FilterPill,
  args: { active: true, onClick: () => {}, count: 9, children: "Open" },
} satisfies Meta<typeof FilterPill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const States: Story = {
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
