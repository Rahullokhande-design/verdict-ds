import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { Checkbox } from "@/components/compounds";
import { Matrix, State } from "./_harness";

/**
 * Tier 2: a compound. Radix behaviour plus this system's styling, with no
 * knowledge of what a case or a score is.
 */
const meta = {
  title: "Verdict/Compounds/Checkbox",
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

export const Playground: Story = {};

/**
 * Indeterminate is the state that matters and the state that gets skipped.
 *
 * A bulk-select header checkbox spends most of its life partially checked, and
 * a system that only ever drew on and off produces a header that lies about
 * what is selected.
 */
export const States: Story = {
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
