import type { Meta, StoryObj } from "@storybook/react-vite";
import { UndoToast } from "@/components/DecisionBar";
import { Stack, State } from "./_harness";
import { fn } from "storybook/test";

/**
 * The six seconds after a decision.
 *
 * A confirmation dialog before every decision would cost a reviewer four
 * hundred extra clicks a shift to prevent a mistake that happens twice. The
 * toast inverts that: commit immediately, and make the reversal cheap for as
 * long as anyone is likely to notice.
 */
const meta = {
  title: "Verdict/Workspace/UndoToast",
  component: UndoToast,
  args: {
    decision: "approve",
    caseId: "VRD-4824",
    amount: "£3,240.00",
    onUndo: fn(),
    onExpire: fn(),
  },
} satisfies Meta<typeof UndoToast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const States: Story = {
  name: "All three decisions",
  render: () => (
    <Stack gap={36}>
      <State name="the countdown runs live" note="six seconds, then it expires">
        <Stack gap={12}>
          <UndoToast decision="approve" caseId="VRD-4824" amount="£3,240.00" onUndo={() => {}} onExpire={() => {}} />
          <UndoToast decision="decline" caseId="VRD-4907" amount="£118.50" onUndo={() => {}} onExpire={() => {}} />
          <UndoToast decision="escalate" caseId="VRD-5011" amount="£12,904.00" onUndo={() => {}} onExpire={() => {}} />
        </Stack>
      </State>
    </Stack>
  ),
};
