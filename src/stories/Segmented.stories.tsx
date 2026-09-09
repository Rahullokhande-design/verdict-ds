import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { Segmented } from "@/components/compounds";
import { Stack, State } from "./_harness";
import { fn } from "storybook/test";

/**
 * A single-choice control for two or three short options, built on a Radix
 * toggle group so arrow keys move between options and only one tab stop enters
 * the whole control.
 */
const meta = {
  title: "Verdict/Compounds/Segmented",
  component: Segmented,
  args: {
    value: "compact",
    onValueChange: fn(),
    label: "Row density",
    options: [
      { value: "compact", label: "Compact" },
      { value: "comfortable", label: "Comfortable" },
    ],
  },
} satisfies Meta<typeof Segmented>;

export default meta;
type Story = StoryObj<typeof meta>;

export const States: Story = {
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
