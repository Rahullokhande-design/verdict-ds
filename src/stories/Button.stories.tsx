import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Kbd } from "@/components/primitives";
import { Matrix, Row, State, Stack } from "./_harness";

/**
 * Button is tier 1: it takes visual props only.
 *
 * Note what the variants are named. `approve` and `decline` are colour
 * contracts, not behaviours. There is no `onApprove`. The moment a Button knows
 * what a decline is, every future consumer of Button inherits fraud vocabulary
 * it never asked for, and the primitive has quietly become a domain component.
 */
const meta = {
  title: "Verdict/1 Primitives/Button",
  component: Button,
  args: { children: "Escalate" },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["quiet", "outline", "accent", "approve", "decline", "escalate"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { variant: "accent", size: "md" },
};

/** Every variant at every size, which is the only way a size bug is visible. */
export const Variants: Story = {
  render: () => (
    <Stack gap={28}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <State key={size} name={size}>
          <Row>
            <Button variant="quiet" size={size}>Quiet</Button>
            <Button variant="outline" size={size}>Outline</Button>
            <Button variant="accent" size={size}>Accent</Button>
            <Button variant="approve" size={size}>Approve</Button>
            <Button variant="decline" size={size}>Decline</Button>
            <Button variant="escalate" size={size}>Escalate</Button>
          </Row>
        </State>
      ))}
    </Stack>
  ),
};

/**
 * The states a screen rarely renders and a system always needs.
 *
 * Disabled is here because the decision bar disables during the six-second undo
 * window, which is a state the happy path passes through in a blink and a
 * screenshot never catches.
 */
export const States: Story = {
  render: () => (
    <Matrix>
      <State name="default">
        <Button variant="accent">Commit change</Button>
      </State>
      <State name="disabled" note="the undo window">
        <Button variant="accent" disabled>Commit change</Button>
      </State>
      {/* Disabled has to be checked on every variant, not just one. A filled
          button that dims only its label keeps a saturated background under an
          unreadable word, which reads as broken rather than as unavailable.
          Axe will never flag it: WCAG exempts disabled controls from contrast,
          so this state needs an eye rather than a gate. */}
      <State name="disabled, every variant" note="the fill goes too">
        <Row>
          <Button variant="quiet" disabled>Quiet</Button>
          <Button variant="outline" disabled>Outline</Button>
          <Button variant="accent" disabled>Accent</Button>
          <Button variant="approve" disabled>Approve</Button>
          <Button variant="decline" disabled>Decline</Button>
          <Button variant="escalate" disabled>Escalate</Button>
        </Row>
      </State>
      <State name="with shortcut" note="paired Kbd">
        <Button variant="decline">
          Decline <Kbd>D</Kbd>
        </Button>
      </State>
      <State name="long label" note="does it wrap or truncate">
        <div style={{ width: 180 }}>
          <Button variant="outline">
            Escalate to the fraud operations queue
          </Button>
        </div>
      </State>
      <State name="asChild" note="renders an anchor, keeps the contract">
        <Button asChild variant="outline">
          <a href="#top">A link that looks like a button</a>
        </Button>
      </State>
    </Matrix>
  ),
};
