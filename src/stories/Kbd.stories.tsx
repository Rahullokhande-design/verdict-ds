import type { Meta, StoryObj } from "@storybook/react-vite";
import { Kbd } from "@/components/primitives";
import { Row, State, Stack } from "./_harness";

const meta = {
  title: "Verdict/1 Primitives/Kbd",
  component: Kbd,
  args: { children: "D" },
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Two weights, because a shortcut hint printed on a coloured button needs to
 * recede and the same hint on a neutral surface needs to be legible. One
 * component, one prop, rather than two components that drift.
 */
export const Both: Story = {
  render: () => (
    <Stack gap={20}>
      <State name="default" note="on a neutral surface">
        <Row>
          <Kbd>A</Kbd>
          <Kbd>D</Kbd>
          <Kbd>E</Kbd>
          <Kbd>Esc</Kbd>
          <Kbd>⌘K</Kbd>
        </Row>
      </State>
      <State name="quiet" note="sitting on a filled button">
        <Row>
          <Kbd quiet>A</Kbd>
          <Kbd quiet>D</Kbd>
          <Kbd quiet>Esc</Kbd>
        </Row>
      </State>
    </Stack>
  ),
};
