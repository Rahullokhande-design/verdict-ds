import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { expect, userEvent, within } from "storybook/test";
import { DecisionBar } from "@/components/DecisionBar";
import type { Decision } from "@/lib/types";
import { Stack, State } from "./_harness";

/**
 * A decision commits straight away and can be taken back for six seconds.
 *
 * The disabled state is not decoration: the bar disables while the undo window
 * is open, so a reviewer cannot decide the next case on top of one they might
 * still be reversing. It is a state the happy path passes through in a blink
 * and a screenshot never catches.
 */
const meta = {
  title: "Verdict/Workspace/DecisionBar",
  component: DecisionBar,
  args: { onDecide: () => {} },
} satisfies Meta<typeof DecisionBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const States: Story = {
  render: function Render() {
    const [pending, setPending] = React.useState<Decision | null>(null);
    return (
      <Stack gap={36}>
        <State name="live" note={pending ? `last decision: ${pending}` : "click or press Tab"}>
          <DecisionBar onDecide={setPending} />
        </State>
        <State name="disabled" note="while an undo window is open">
          <DecisionBar onDecide={() => {}} disabled />
        </State>
      </Stack>
    );
  },
};

/**
 * The shortcut is printed on the control, so it should be reachable the way it
 * is printed.
 *
 * This walks the bar with Tab and commits with Enter, which is the path a
 * reviewer's hands actually take, and asserts the decision that came back. A
 * disabled bar is then checked for the thing that matters about it: not that it
 * looks dimmed, but that Tab skips it entirely, so an accidental Enter during
 * an undo window cannot decide the next case.
 */
export const KeyboardPath: Story = {
  name: "Reachable and committable by keyboard",
  render: function Render() {
    const [decided, setDecided] = React.useState<Decision | null>(null);
    return (
      <Stack gap={16}>
        <DecisionBar onDecide={setDecided} />
        <p data-testid="outcome" style={{ margin: 0, color: "var(--vd-text-secondary)" }}>
          {decided ? `Decision: ${decided}` : "No decision yet"}
        </p>
      </Stack>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const approve = canvas.getByRole("button", { name: /approve/i });

    approve.focus();
    await expect(approve).toHaveFocus();

    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByTestId("outcome")).toHaveTextContent("Decision: approve");
  },
};

export const DisabledIsUnreachable: Story = {
  name: "Disabled, and skipped by Tab",
  render: () => <DecisionBar onDecide={() => {}} disabled />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const name of [/approve/i, /decline/i, /escalate/i]) {
      await expect(canvas.getByRole("button", { name })).toBeDisabled();
    }
  },
};
