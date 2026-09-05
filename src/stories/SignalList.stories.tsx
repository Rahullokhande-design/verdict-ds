import type { Meta, StoryObj } from "@storybook/react-vite";
import { SignalList } from "@/components/SignalList";
import type { Signal } from "@/lib/types";
import { cases } from "@/lib/data";
import { Stack, State } from "./_harness";

/**
 * Signed weights, on purpose.
 *
 * A reviewer needs to see what argued *for* the customer, not only what argued
 * against. A list that only shows the case for declining is not evidence, it is
 * a prosecution, and the reviewer's job is the decision the model would not make.
 */
const real = cases[0].signals;

const meta = {
  title: "Verdict/3 Instrument/SignalList",
  component: SignalList,
  args: { signals: real },
  parameters: { layout: "padded" },
} satisfies Meta<typeof SignalList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FromRealCase: Story = {
  name: "A real case",
  args: { signals: real },
};

const oneSided: Signal[] = [
  { id: "a", label: "Device seen on four other accounts", detail: "d41f, since March", weight: 22, category: "device" },
  { id: "b", label: "Card added minutes before the order", detail: "11 minutes", weight: 18, category: "payment" },
  { id: "c", label: "Shipping and billing countries differ", detail: "IE vs GB", weight: 9, category: "geography" },
];

const balanced: Signal[] = [
  ...oneSided,
  { id: "d", label: "Long account history, no disputes", detail: "34 orders since 2021", weight: -26, category: "history" },
  { id: "e", label: "Same device as every previous order", detail: "18 of 18", weight: -14, category: "device" },
];

/**
 * The states that decide whether this component is honest.
 *
 * "Nothing argued for the customer" has to look different from "we did not
 * look", and a single signal must not render as though the model found one
 * thing and stopped.
 */
export const States: Story = {
  render: () => (
    <Stack gap={36}>
      <State name="balanced" note="both directions, which is the normal case">
        <SignalList signals={balanced} />
      </State>
      <State name="all against" note="nothing argued for the customer">
        <SignalList signals={oneSided} />
      </State>
      <State name="all for" note="the model flagged something boring">
        <SignalList signals={balanced.filter((s) => s.weight < 0)} />
      </State>
      <State name="single signal">
        <SignalList signals={[oneSided[0]]} />
      </State>
      <State name="empty" note="a rule pulled this in, the model had nothing to say">
        <SignalList signals={[]} />
      </State>
      <State name="long labels" note="does a two-line label break the gauge alignment">
        <SignalList
          signals={[
            {
              id: "x",
              label:
                "Shipping address was changed to a freight forwarder in a different country within an hour of the account being opened",
              detail: "Unit 4, Bramley Rd, changed 11:16",
              weight: 31,
              category: "geography",
            },
            ...oneSided,
          ]}
        />
      </State>
    </Stack>
  ),
};
