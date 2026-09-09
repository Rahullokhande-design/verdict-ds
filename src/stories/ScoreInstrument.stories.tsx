import type { Meta, StoryObj } from "@storybook/react-vite";
import { ScoreInstrument } from "@/components/ScoreInstrument";
import { bandFor } from "@/lib/types";
import { Matrix, Stack, State } from "./_harness";

/**
 * The instrument the whole product is named after.
 *
 * A bare point estimate gets either obeyed or ignored, and both of those are
 * failures. So the score ships with the model's uncertainty as a visible span,
 * the threshold as a marked position, and the band ranges printed underneath,
 * which is the row that makes the ramp readable with no colour perception at
 * all.
 */
const meta = {
  title: "Verdict/Instrument/ScoreInstrument",
  component: ScoreInstrument,
  args: { score: 78, confidence: [71, 84], band: 3, threshold: 68, thresholdSetBy: "R. Mehta" },
  argTypes: {
    score: { control: { type: "range", min: 0, max: 100 } },
    threshold: { control: { type: "range", min: 0, max: 100 } },
  },
  parameters: { layout: "padded" },
} satisfies Meta<typeof ScoreInstrument>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** One per band, so the ramp can be checked as a sequence rather than a swatch. */
export const EveryBand: Story = {
  render: () => (
    <Stack gap={36}>
      {[28, 52, 78, 94].map((score) => (
        <State key={score} name={`score ${score}`} note={`band ${bandFor(score)}`}>
          <ScoreInstrument
            score={score}
            confidence={[Math.max(0, score - 7), Math.min(100, score + 6)]}
            band={bandFor(score)}
            threshold={68}
            thresholdSetBy="R. Mehta"
          />
        </State>
      ))}
    </Stack>
  ),
};

/**
 * The edges. Every one of these is a real position a live score can occupy and
 * none of them appear on the prototype's happy path.
 */
export const Edges: Story = {
  render: () => (
    <Stack gap={36}>
      <State name="score sits exactly on the threshold">
        <ScoreInstrument score={68} confidence={[62, 74]} band={3} threshold={68} />
      </State>
      <State name="confidence straddles the threshold" note="the case for showing a span at all">
        <ScoreInstrument score={70} confidence={[54, 86]} band={3} threshold={68} />
      </State>
      <State name="near-total certainty" note="a span two points wide">
        <ScoreInstrument score={96} confidence={[95, 97]} band={4} threshold={68} />
      </State>
      <State name="floor" note="score 0, span clamped at the left wall">
        <ScoreInstrument score={0} confidence={[0, 9]} band={1} threshold={68} />
      </State>
      <State name="ceiling" note="score 100, span clamped at the right wall">
        <ScoreInstrument score={100} confidence={[92, 100]} band={4} threshold={68} />
      </State>
      <State name="threshold at zero" note="everything is reviewed">
        <ScoreInstrument score={41} confidence={[33, 49]} band={2} threshold={0} />
      </State>
      <State name="no attribution" note="thresholdSetBy omitted">
        <ScoreInstrument score={78} confidence={[71, 84]} band={3} threshold={68} />
      </State>
    </Stack>
  ),
};

/**
 * The screen-reader sentence and the printed sentence are deliberately the same
 * words. An interface that says one thing visually and another in its alt text
 * is two interfaces, and only one of them gets maintained.
 */
export const Greyscale: Story = {
  name: "Hue removed",
  render: () => (
    <div style={{ filter: "grayscale(1)" }}>
      <Matrix>
        {[28, 78, 94].map((score) => (
          <State key={score} name={`score ${score}`}>
            <ScoreInstrument
              score={score}
              confidence={[score - 6, score + 5]}
              band={bandFor(score)}
              threshold={68}
            />
          </State>
        ))}
      </Matrix>
    </div>
  ),
};
