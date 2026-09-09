import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Tooltip } from "@/components/primitives";
import { Row, State, Stack } from "./_harness";

const meta = {
  title: "Verdict/Primitives/Tooltip",
  component: Tooltip,
  args: { content: "Opens on focus, not only on hover", children: null },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Radix supplies the parts that are tedious and easy to get wrong: hover
 * intent, dismissal on Escape, and the fact that a tooltip must be reachable by
 * keyboard focus rather than pointer alone.
 *
 * That last one is why the trigger here is always a real control. Tab to these
 * rather than hovering them: if a tooltip only opens under a mouse, half its
 * audience never sees the information in it.
 */
export const Sides: Story = {
  render: () => (
    <Stack gap={24}>
      <State name="all four sides" note="tab to them, do not hover">
        <Row>
          {(["top", "right", "bottom", "left"] as const).map((side) => (
            <Tooltip key={side} side={side} content={`Opens on the ${side}`}>
              <Button variant="outline">{side}</Button>
            </Tooltip>
          ))}
        </Row>
      </State>

      <State name="on a value" note="the queue's score cell">
        <Tooltip content="Model puts the true value between 71 and 84">
          <button type="button" className="vd-tip-target vd-mono">
            78
          </button>
        </Tooltip>
      </State>
    </Stack>
  ),
};
