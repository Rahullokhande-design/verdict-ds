import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThresholdChart } from "@/components/ThresholdChart";
import { Stack, State } from "./_harness";

/**
 * Where the review threshold sits, and what moving it costs. The chart exists
 * so that a policy argument is had against a shape rather than against two
 * people's intuitions about the same number.
 */
const meta = {
  title: "Verdict/Workspace/ThresholdChart",
  component: ThresholdChart,
  args: { threshold: 68 },
  parameters: { layout: "padded" },
} satisfies Meta<typeof ThresholdChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const States: Story = {
  render: () => (
    <Stack gap={36}>
      <State name="at the current policy" note="68">
        <ThresholdChart threshold={68} />
      </State>
      <State name="lowered" note="more review, more caught, more cost">
        <ThresholdChart threshold={40} />
      </State>
      <State name="raised">
        <ThresholdChart threshold={90} />
      </State>
      <State name="floor" note="every transaction reviewed">
        <ThresholdChart threshold={0} />
      </State>
      <State name="ceiling" note="nothing reviewed">
        <ThresholdChart threshold={100} />
      </State>
    </Stack>
  ),
};
