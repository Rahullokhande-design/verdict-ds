import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { useArgs } from "storybook/preview-api";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Checkbox } from "@/components/compounds";
import { Matrix, State } from "./_harness";

/**
 * Tier 2: a compound. Radix behaviour plus this system's styling, with no
 * knowledge of what a case or a score is.
 *
 * The component is fully controlled, which is the right shape for it and the
 * reason the playground below needs a little wiring: `checked` comes from
 * outside, so a story that passes a fixed `false` and an empty handler renders a
 * checkbox that can be clicked and will never change. It did exactly that here.
 */
const meta = {
  title: "Verdict/Compounds/Checkbox",
  component: Checkbox,
  args: {
    checked: false,
    onCheckedChange: fn(),
    label: "Select case VRD-4824",
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A real checkbox with real state, one per cell of the matrix.
 *
 * Each takes its own case id, which is both how a bulk-select column actually
 * works and what makes the matrix testable: five controls sharing one accessible
 * name can only be told apart by their position in the DOM, and a test that
 * depends on render order is a test that breaks the first time somebody reorders
 * the states.
 */
function Controlled({
  initial,
  disabled,
  caseId,
}: {
  initial: boolean | "indeterminate";
  disabled?: boolean;
  caseId: string;
}) {
  const [checked, setChecked] = React.useState(initial);
  return (
    <Checkbox
      checked={checked}
      onCheckedChange={setChecked}
      disabled={disabled}
      label={`Select case ${caseId}`}
    />
  );
}

/**
 * The playground, wired to the args it displays.
 *
 * A controlled component in a playground needs somewhere for its state to live,
 * and the honest place is the args themselves: clicking the checkbox writes back
 * to `checked`, so the control panel and the canvas cannot disagree about what
 * is checked. Holding the state in a local `useState` instead would make the
 * checkbox work and quietly desync the Controls panel, which is the same bug
 * wearing a better disguise.
 */
export const Playground: Story = {
  render: function Render(args) {
    const [{ checked }, updateArgs] = useArgs<typeof args>();
    return (
      <Checkbox
        {...args}
        checked={checked}
        onCheckedChange={(value) => {
          args.onCheckedChange(value);
          updateArgs({ checked: value });
        }}
      />
    );
  },
  /**
   * The regression test for the defect this story shipped with.
   *
   * It rendered a checkbox that could be clicked and would never fill, because
   * `checked` was a fixed `false` and the handler was `() => {}`. Nothing caught
   * it: types were satisfied, axe was satisfied, and a screenshot of an unchecked
   * checkbox looks exactly like a checkbox that cannot be checked.
   *
   * It took someone clicking it. This assertion is what that person's attention
   * turns into, so the next one does not have to.
   */
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole("checkbox", {
      name: /select case vrd-4824/i,
    });

    /**
     * Every assertion after a click waits, and that is not defensive padding.
     *
     * `updateArgs` does not set React state directly. It sends the new args
     * through Storybook's channel to the manager and back, so the re-render
     * lands a tick or two after the click returns. Asserting immediately passed
     * inside a full 54-story run, where everything is slower, and failed every
     * time this one story was run on its own. A test that depends on how busy
     * the machine is will eventually fail on someone else's, and be dismissed
     * as flaky rather than read.
     */
    const isChecked = (value: "true" | "false") =>
      waitFor(() => expect(box).toHaveAttribute("aria-checked", value));

    await isChecked("false");

    await userEvent.click(box);
    await isChecked("true");

    await userEvent.click(box);
    await isChecked("false");

    /** Space is the platform binding, and a checkbox that only takes a mouse is half a checkbox. */
    box.focus();
    await userEvent.keyboard(" ");
    await isChecked("true");
  },
};

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
        <Controlled caseId="VRD-4824" initial={false} />
      </State>
      <State name="checked">
        <Controlled caseId="VRD-4907" initial={true} />
      </State>
      <State name="indeterminate" note="bulk header, some rows selected">
        <Controlled caseId="VRD-5011" initial="indeterminate" />
      </State>
      <State name="disabled">
        <Controlled caseId="VRD-5140" initial={false} disabled />
      </State>
      <State name="disabled + checked">
        <Controlled caseId="VRD-5199" initial={true} disabled />
      </State>
    </Matrix>
  ),
  /**
   * Assertions only, and nothing here changes what is on screen.
   *
   * A play function runs when the story loads in the browser, not just in CI, so
   * anything it clicks is what a visitor sees afterwards. An earlier version of
   * this one clicked the first checkbox to prove that clicking works, and the
   * result was a matrix whose cell labelled "unchecked" rendered checked. A state
   * matrix that contradicts its own labels is worse than no matrix, and it is the
   * same defect as the one that started this: a control whose appearance and its
   * caption disagree.
   *
   * Proving that a click registers belongs in the playground, which is built to
   * be poked. What belongs here is what a matrix is for: the states themselves,
   * including the one a manual click-through always skips, because a disabled
   * checkbox looks identical whether or not it is actually inert.
   */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const box = (caseId: string) =>
      canvas.getByRole("checkbox", { name: `Select case ${caseId}` });

    await expect(box("VRD-4824")).toHaveAttribute("aria-checked", "false");
    await expect(box("VRD-4907")).toHaveAttribute("aria-checked", "true");
    await expect(box("VRD-5011")).toHaveAttribute("aria-checked", "mixed");

    await expect(box("VRD-5140")).toBeDisabled();
    await expect(box("VRD-5199")).toBeDisabled();
    await expect(box("VRD-5199")).toHaveAttribute("aria-checked", "true");

    /** Inert, not merely dimmed. The click has to be forced past the pointer-events guard to test it at all. */
    await userEvent.click(box("VRD-5140"), { pointerEventsCheck: 0 });
    await expect(box("VRD-5140")).toHaveAttribute("aria-checked", "false");
  },
};
