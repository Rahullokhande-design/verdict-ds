import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { QueueRail } from "@/components/QueueRail";
import { cases } from "@/lib/data";
import type { CaseRecord, Decision } from "@/lib/types";

/**
 * The rail owns focus and the rows are managed children, which is the correct
 * listbox pattern and also why the lint rule that bans handlers on
 * non-interactive elements makes an explicit allowance for a roled, focusable
 * composite. Arrow keys move the selection.
 *
 * One state per story rather than four stacked on a page. The rail is an
 * `aside` landmark, and four of them in one document are four landmarks with
 * the same accessible name, which is a finding about the harness rather than
 * about the component. Separate stories also mean axe runs against each state
 * on its own, which is what the states are for.
 */
const meta = {
  title: "Verdict/Workspace/QueueRail",
  component: QueueRail,
  args: { cases, activeId: cases[0].id, onSelect: fn() },
} satisfies Meta<typeof QueueRail>;

export default meta;
type Story = StoryObj<typeof meta>;

function Rail({
  cases: list,
  activeId,
  height = 380,
}: {
  cases: CaseRecord[];
  activeId: string;
  height?: number;
}) {
  const [active, setActive] = React.useState(activeId);
  return (
    <div style={{ height, display: "flex" }}>
      <QueueRail cases={list} activeId={active} onSelect={setActive} />
    </div>
  );
}

export const Open: Story = {
  name: "Open",
  render: () => <Rail cases={cases} activeId={cases[0].id} />,
};

/**
 * The keyboard path, run rather than described.
 *
 * "All keyboard operable" is the kind of claim a case study makes and a
 * Storybook never demonstrates. This story arrows down the queue and asserts
 * what a screen reader would be told afterwards: that the second row is the
 * selected option, and that `aria-activedescendant` on the listbox points at
 * that row's id rather than at the one focus left behind.
 *
 * It runs in CI with the rest of the test runner, so the claim now fails a
 * build if it stops being true.
 */
export const KeyboardWalk: Story = {
  name: "Arrow keys move the selection",
  render: () => <Rail cases={cases} activeId={cases[0].id} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole("listbox", { name: /cases awaiting a decision/i });

    list.focus();
    await expect(list).toHaveFocus();

    const options = canvas.getAllByRole("option");
    await expect(options[0]).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{ArrowDown}");
    await expect(options[1]).toHaveAttribute("aria-selected", "true");
    await expect(list).toHaveAttribute("aria-activedescendant", options[1].id);

    await userEvent.keyboard("{ArrowUp}");
    await expect(options[0]).toHaveAttribute("aria-selected", "true");
    await expect(list).toHaveAttribute("aria-activedescendant", options[0].id);

    /**
     * The end of the list is a stop, not a wrap. A worklist that loops back to
     * the top on the last arrow press quietly re-serves a case the reviewer has
     * already read.
     */
    await userEvent.keyboard("{ArrowUp}");
    await expect(options[0]).toHaveAttribute("aria-selected", "true");
  },
};

export const PartlyWorked: Story = {
  name: "Partly worked",
  render: () => (
    <Rail
      cases={cases.map((c, i) =>
        i < 3
          ? { ...c, decision: (["approve", "decline", "escalate"] as Decision[])[i] }
          : c
      )}
      activeId={cases[3].id}
    />
  ),
};

export const LastCase: Story = {
  name: "One case left",
  render: () => <Rail cases={[cases[0]]} activeId={cases[0].id} height={220} />,
};

/**
 * The end of a shift. This state is what caught `aria-activedescendant` still
 * pointing at a row id that no longer resolves to anything.
 */
export const Empty: Story = {
  name: "Empty",
  render: () => <Rail cases={[]} activeId="" height={220} />,
  play: async ({ canvasElement }) => {
    const list = within(canvasElement).getByRole("listbox");
    /**
     * The defect, as an assertion. It rendered `aria-activedescendant="vd-case-"`,
     * which names nothing, and a screen reader follows that pointer into an
     * element that is not there. Absent is the only correct value here.
     */
    await expect(list).not.toHaveAttribute("aria-activedescendant");
  },
};
