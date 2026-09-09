import type { Meta, StoryObj } from "@storybook/react-vite";
import { CaseFacts } from "@/components/CaseFacts";
import { cases } from "@/lib/data";
import type { CaseRecord } from "@/lib/types";
import { Stack, State } from "./_harness";

/**
 * Tier 5: the workspace. Composed screens rather than parts, and the level at
 * which a decision actually gets made.
 */
const meta = {
  title: "Verdict/Workspace/CaseFacts",
  component: CaseFacts,
  args: { record: cases[0] },
  parameters: { layout: "padded" },
} satisfies Meta<typeof CaseFacts>;

export default meta;
type Story = StoryObj<typeof meta>;

const base = cases[0];

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

export const Playground: Story = {};

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
