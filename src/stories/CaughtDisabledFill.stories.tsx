import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@/components/primitives";
import { Defect, Proof, Swatch, declared, hex, ratio } from "./_defect";
import { Row } from "./_harness";

const meta = {
  title: "Verdict/What the checks caught/The one no gate caught",
  tags: ["!autodocs"],
  parameters: {
    layout: "fullscreen",
    /**
     * No addon panel on a documentation page. It has no args and no
     * interactions, so the panel renders Storybook telling the reader "This
     * story has no controls", which was the first sentence of prose this
     * Storybook offered about itself.
     */
    options: { showPanel: false },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const declineSolid = hex("dark", "decision-decline-solid");
const dimmed = hex("dark", "text-disabled");

/** The advisory row: measured deliberately even though WCAG does not require it. */
const advisory = declared("dark", "text-disabled", "surface-raised");

export const TheOneNoGateCaught: Story = {
  name: "The one no gate caught",
  render: () => (
    <Defect
      headline="A disabled button that dimmed its label and kept its fill"
      sawIt="Exposed by fixing the first defect on this list. Once variants rendered their own colour, the disabled state dimmed the label and left the saturated background underneath it. An unreadable word on a confident red rectangle does not read as unavailable. It reads as broken."
      caughtBy="No check. A review of the disabled row in the button story flagged that it looked wrong."
      missedBy="Every gate here, correctly. WCAG exempts inactive controls from contrast, so axe passed it cleanly and had no business doing anything else. The tokens were right, the types were right, the lint was right."
      lives={{ label: "Button, disabled on every variant", title: "Verdict/Primitives/Button", story: "States" }}
    >
      <Proof>
        <Swatch
          caption="What shipped"
          bg={declineSolid}
          fg={dimmed}
          sample="Decline"
          value={ratio(dimmed, declineSolid)}
          note="No bar to fail. This is the state WCAG exempts, and it is unusable."
        />
      </Proof>

      <div style={{ margin: "28px 0 0" }}>
        <p
          style={{
            fontFamily: "var(--vd-fontFamily-mono)",
            fontSize: 11,
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            color: "var(--vd-text-tertiary)",
            margin: "0 0 10px",
          }}
        >
          What replaced it, rendered live
        </p>
        <Row>
          <Button variant="quiet" disabled>Quiet</Button>
          <Button variant="outline" disabled>Outline</Button>
          <Button variant="accent" disabled>Accent</Button>
          <Button variant="approve" disabled>Approve</Button>
          <Button variant="decline" disabled>Decline</Button>
          <Button variant="escalate" disabled>Escalate</Button>
        </Row>
        <p style={{ margin: "12px 0 0", maxWidth: "68ch", color: "var(--vd-text-secondary)" }}>
          One disabled treatment for all six variants. The fill goes with the
          label, so an unavailable control looks unavailable rather than
          decorative.
        </p>
      </div>

      <p style={{ margin: "28px 0 0", maxWidth: "68ch" }}>
        The system now measures the disabled pair anyway, and marks it advisory
        rather than gated, so the number is visible without pretending a standard
        requires it.{" "}
        {advisory ? (
          <span style={{ fontFamily: "var(--vd-fontFamily-mono)", fontSize: 13 }}>
            text-disabled on surface-raised: {advisory.ratio.toFixed(2)}:1,
            advisory floor {advisory.min.toFixed(1)}.
          </span>
        ) : null}
      </p>

      <p style={{ margin: "16px 0 0", maxWidth: "68ch", color: "var(--vd-text-secondary)" }}>
        This is the honest end of the argument, and the reason the other six on
        this list are worth believing. Checks find what they are shaped to find.
        Six of these were caught by something automatic and this one was not, and
        a system that could not tell you which was which would be selling you
        something.
      </p>
    </Defect>
  ),
};
