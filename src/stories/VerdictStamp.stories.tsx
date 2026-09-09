import type { Meta, StoryObj } from "@storybook/react-vite";
import { VerdictStamp } from "@/components/domain";
import { Row } from "./_harness";

/** What a case looks like once it has been decided. */
const meta = {
  title: "Verdict/Domain/VerdictStamp",
  component: VerdictStamp,
  args: { decision: "approve" },
} satisfies Meta<typeof VerdictStamp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const States: Story = {
  name: "All three decisions",
  render: () => (
    <Row>
      <VerdictStamp decision="approve" />
      <VerdictStamp decision="decline" />
      <VerdictStamp decision="escalate" />
    </Row>
  ),
};
