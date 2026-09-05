import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { CaseFacts } from "@/components/CaseFacts";
import { QueueRail } from "@/components/QueueRail";
import { DecisionBar, UndoToast } from "@/components/DecisionBar";
import { ThresholdChart } from "@/components/ThresholdChart";
import { cases } from "@/lib/data";
import type { CaseRecord, Decision } from "@/lib/types";
import { Stack, State } from "./_harness";

const base = cases[0];

const meta = {
  title: "Verdict/5 Workspace/CaseFacts",
  component: CaseFacts,
  args: { record: base },
  parameters: { layout: "padded" },
} satisfies Meta<typeof CaseFacts>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A case with nothing suspicious in it, to check the tone flags stay quiet. */
const calm: CaseRecord = {
  ...base,
  customer: { ...base.customer, orders: 34, disputes: 0, since: "March 2021" },
  device: { ...base.device, sharedWith: 0, ipCountry: base.card.country },
  linked: [],
};

/** A case where every flag fires at once, to check they do not shout over each other. */
const loud: CaseRecord = {
  ...base,
  customer: { ...base.customer, orders: 1, disputes: 3, since: "today" },
  device: { ...base.device, sharedWith: 7, ipCountry: "RO" },
};

export const States: Story = {
  render: () => (
    <Stack gap={36}>
      <State name="the real case">
        <CaseFacts record={base} />
      </State>
      <State name="nothing flagged" note="a long history and a familiar device">
        <CaseFacts record={calm} />
      </State>
      <State name="everything flagged" note="do the tones still rank">
        <CaseFacts record={loud} />
      </State>
      <State name="no linked entities" note="the section must not render an empty shell">
        <CaseFacts record={{ ...base, linked: [] }} />
      </State>
    </Stack>
  ),
};

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

export const QueueOpen: StoryObj = {
  name: "QueueRail, open",
  render: () => <Rail cases={cases} activeId={cases[0].id} />,
};

export const QueuePartlyWorked: StoryObj = {
  name: "QueueRail, partly worked",
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

export const QueueLastCase: StoryObj = {
  name: "QueueRail, one case left",
  render: () => <Rail cases={[cases[0]]} activeId={cases[0].id} height={220} />,
};

/**
 * The end of a shift. This state is what caught `aria-activedescendant` still
 * pointing at a row id that no longer resolves to anything.
 */
export const QueueEmpty: StoryObj = {
  name: "QueueRail, empty",
  render: () => <Rail cases={[]} activeId="" height={220} />,
};

/**
 * A decision commits straight away and can be taken back for six seconds.
 *
 * The disabled state is not decoration: the bar disables while the undo window
 * is open, so a reviewer cannot decide the next case on top of one they might
 * still be reversing. It is a state the happy path passes through in a blink
 * and a screenshot never catches.
 */
export const Decisions: StoryObj = {
  name: "DecisionBar and UndoToast",
  render: function Render() {
    const [pending, setPending] = React.useState<Decision | null>(null);
    return (
      <Stack gap={36}>
        <State name="live" note="press A, D or E">
          <DecisionBar onDecide={setPending} />
        </State>
        <State name="disabled" note="while an undo window is open">
          <DecisionBar onDecide={() => {}} disabled />
        </State>
        <State name="the toast, all three decisions">
          <Stack gap={12}>
            <UndoToast decision="approve" caseId="VRD-4824" amount="£3,240.00" onUndo={() => {}} onExpire={() => {}} />
            <UndoToast decision="decline" caseId="VRD-4907" amount="£118.50" onUndo={() => {}} onExpire={() => {}} />
            <UndoToast decision="escalate" caseId="VRD-5011" amount="£12,904.00" onUndo={() => {}} onExpire={() => {}} />
          </Stack>
        </State>
        {pending ? (
          <State name="from the live bar above">
            <UndoToast
              decision={pending}
              caseId={cases[0].id}
              amount="£3,240.00"
              onUndo={() => setPending(null)}
              onExpire={() => setPending(null)}
            />
          </State>
        ) : null}
      </Stack>
    );
  },
};

export const Threshold: StoryObj = {
  name: "ThresholdChart",
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
