import type { Meta, StoryObj } from "@storybook/react-vite";
import { Code, Defect } from "./_defect";

const meta = {
  title: "Verdict/What the checks caught/An image around a button",
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

export const AnImageAroundAButton: Story = {
  name: "An image around a button",
  render: () => (
    <Defect
      headline={'role="img" wrapped around a focusable control'}
      sawIt="The score instrument is a drawing, so it was given role=img and a label describing the score it shows. Inside it sits the threshold marker, which is a real control a reviewer can move. The markup read well and said something impossible."
      caughtBy="Axe. An image is a leaf node: everything inside it is a picture of a thing rather than the thing, so the control it contained was announced as nothing at all."
      missedBy="Review, three times. It reads as thoughtful accessibility work, which is exactly why it survived. The label was good. The role was wrong."
      lives={{ label: "ScoreInstrument, every band", title: "Verdict/Instrument/ScoreInstrument", story: "EveryBand" }}
    >
      <div style={{ marginTop: 24, maxWidth: 720 }}>
        <Code>{`<div role="img" aria-label="Risk 82, band 4">
  <svg … />
  <button aria-label="Move the review threshold" />
</div>`}</Code>
        <Code ok>{`<div>
  <svg role="img" aria-label="Risk 82, band 4" />
  <button aria-label="Move the review threshold" />
</div>`}</Code>
      </div>

      <p style={{ margin: "24px 0 0", maxWidth: "68ch", color: "var(--vd-text-secondary)" }}>
        The role belongs on the drawing, not on the container that holds the
        drawing and a control. One nesting level, and the difference between a
        threshold a keyboard user can move and one they cannot find.
      </p>
    </Defect>
  ),
};
