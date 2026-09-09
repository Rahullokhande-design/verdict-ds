import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Panel } from "@/components/primitives";
import { Matrix, State } from "./_harness";

const meta = {
  title: "Verdict/Primitives/Panel",
  component: Panel,
  args: { title: "Card", children: null },
} satisfies Meta<typeof Panel>;

export default meta;
type Story = StoryObj<typeof meta>;

const body = (
  <p style={{ margin: 0, color: "var(--vd-text-secondary)" }}>
    Card ending 4417, issued in Ireland, first seen on this account eleven
    minutes ago.
  </p>
);

/**
 * A panel's header is optional, and that is the interesting axis. A titled
 * panel emits an h2; an untitled one emits nothing, so a page of untitled
 * panels does not produce a heading outline full of blanks.
 */
export const States: Story = {
  render: () => (
    <Matrix>
      <State name="titled">
        <Panel title="Card">{body}</Panel>
      </State>
      <State name="with action">
        <Panel
          title="Card"
          action={<Button variant="quiet" size="sm">View history</Button>}
        >
          {body}
        </Panel>
      </State>
      <State name="untitled" note="no header, no empty heading">
        <Panel>{body}</Panel>
      </State>
      <State name="flush" note="for a table that draws its own edges">
        <Panel title="Linked cases" flush>
          <div style={{ padding: "12px 16px", color: "var(--vd-text-secondary)" }}>
            Content sits against the panel wall.
          </div>
        </Panel>
      </State>
    </Matrix>
  ),
};
