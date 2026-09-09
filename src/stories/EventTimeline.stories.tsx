import type { Meta, StoryObj } from "@storybook/react-vite";
import { EventTimeline } from "@/components/domain";
import { Matrix, State } from "./_harness";

/**
 * What the account did, in order. Tone is advisory rather than a verdict: the
 * timeline marks an event as reassuring or concerning, and the reviewer decides
 * what that adds up to.
 */
const meta = {
  title: "Verdict/Domain/EventTimeline",
  component: EventTimeline,
  args: { events: [{ at: "09:41", label: "Order placed" }] },
} satisfies Meta<typeof EventTimeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const States: Story = {
  render: () => (
    <Matrix>
      <State name="mixed tones">
        <EventTimeline
          events={[
            { at: "11:02", label: "Account opened", detail: "Email verified", tone: "reassuring" },
            { at: "11:14", label: "Card added", detail: "First card on file" },
            { at: "11:16", label: "Shipping address changed", tone: "concerning" },
            { at: "11:17", label: "Order placed", detail: "£3,240" },
          ]}
        />
      </State>
      <State name="single event" note="the connector must not draw from nowhere">
        <EventTimeline events={[{ at: "09:41", label: "Order placed" }]} />
      </State>
      <State name="empty" note="a case with no history">
        <EventTimeline events={[]} />
      </State>
    </Matrix>
  ),
};
