import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Button, SrOnly } from "@/components/primitives";
import { RiskBadge } from "@/components/domain";
import { Stack, State } from "./_harness";

/**
 * Text that exists for a screen reader and not for the screen.
 *
 * The least visual component in the system and the one it would be easiest to
 * leave undocumented, which is why it has a story. A dense operations interface
 * is full of things a sighted reviewer reads from position, weight and colour,
 * and this is where the same information is written down for everyone else: the
 * queue row that shows `£3,240 · Northgate` and announces the amount, the
 * merchant and the time left before the authorisation expires.
 *
 * The failure mode is silent in both directions. Style it wrong with
 * `display: none` and it disappears from the accessibility tree too, which is
 * the whole point gone. Style it wrong the other way and a stray line of text
 * lands in the layout. Neither shows up in a design review.
 */
const meta = {
  title: "Verdict/Primitives/SrOnly",
  component: SrOnly,
  args: { children: "Announced, not drawn" },
} satisfies Meta<typeof SrOnly>;

export default meta;
type Story = StoryObj<typeof meta>;

export const States: Story = {
  render: () => (
    <Stack gap={28}>
      <State name="in a control" note="the button reads as more than its glyph">
        <Button variant="outline" size="sm">
          R3
          <SrOnly>, risk band 3, elevated</SrOnly>
        </Button>
      </State>
      <State name="beside a badge" note="colour and rank on screen, the word for everyone">
        <RiskBadge band={4} compact />
      </State>
      <State name="on its own" note="there is a sentence here, and it takes no space">
        <div
          style={{
            border: "1px dashed var(--vd-border-default)",
            borderRadius: 6,
            padding: 12,
            color: "var(--vd-text-tertiary)",
          }}
        >
          <SrOnly>
            Six cases remain in the queue. The oldest expires in eleven minutes.
          </SrOnly>
          The dashed box holds one sentence of screen-reader text and nothing
          else. It should not grow to fit it.
        </div>
      </State>
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    /**
     * The two assertions that matter, and they pull in opposite directions.
     *
     * Present in the accessibility tree, so the text is findable by its
     * accessible name. And clipped to a single pixel rather than hidden, because
     * `display: none` and `visibility: hidden` both remove an element from that
     * tree, which is the way this component is usually broken.
     */
    const announced = canvas.getByText(/six cases remain in the queue/i);
    await expect(announced).toBeInTheDocument();

    const style = getComputedStyle(announced);
    await expect(style.display).not.toBe("none");
    await expect(style.visibility).not.toBe("hidden");
    await expect(parseFloat(style.width)).toBeLessThanOrEqual(1);
  },
};
