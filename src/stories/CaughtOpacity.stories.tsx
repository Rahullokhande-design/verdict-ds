import type { Meta, StoryObj } from "@storybook/react-vite";
import { Code, Defect, Proof, Swatch, composite, hex, ratio } from "./_defect";

const meta = {
  title: "Verdict/What the checks caught/Opacity beat the gate",
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

const sunken = hex("dark", "surface-sunken");
const decided = hex("dark", "row-decided-fg");
const faded = composite(decided, sunken, 0.55);

export const OpacityBeatTheGate: Story = {
  name: "Opacity beat the gate",
  render: () => (
    <Defect
      headline="A row that had been decided faded itself below the floor"
      sawIt="Rows in the queue rail dim once they have been decided, and dimming was done the obvious way, with opacity: 0.55 on the row. The colour underneath was a declared token that passes comfortably. The colour on screen was not that colour."
      caughtBy="Axe. It measures what a pixel ended up being, and a composited colour is what the pixel ended up being."
      missedBy="The contrast gate, and it could not have done anything else. A pair is declared and measured at build time. Opacity is applied by the browser, on the composite, long afterwards."
      lives={{ label: "QueueRail, partly worked", title: "Verdict/Workspace/QueueRail", story: "Partly worked" }}
    >
      <Proof>
        <Swatch
          caption="What the token declares"
          bg={sunken}
          fg={decided}
          sample="VRD-4907 · decided"
          value={ratio(decided, sunken)}
          floor={4.5}
        />
        <Swatch
          caption="What opacity: 0.55 made of it"
          bg={sunken}
          fg={faded}
          sample="VRD-4907 · decided"
          value={ratio(faded, sunken)}
          floor={4.5}
          note={`The same token, composited against the surface behind it: ${faded}.`}
        />
      </Proof>

      <div style={{ marginTop: 28 }}>
        <Code>{`.vd-case-row--decided { opacity: 0.55 }`}</Code>
        <Code ok>{`.vd-case-row--decided { color: var(--vd-row-decided-fg) }`}</Code>
      </div>

      <p style={{ margin: "24px 0 0", maxWidth: "68ch", color: "var(--vd-text-secondary)" }}>
        The fix is not a darker value. It is refusing to express a state as a
        filter over an unknown colour. A dedicated role can be declared,
        measured and gated. An opacity cannot, because until it renders, nobody
        knows what colour it is.
      </p>
      <p style={{ margin: "12px 0 0", maxWidth: "68ch", color: "var(--vd-text-secondary)" }}>
        The story harness in this Storybook had the same bug in its own state
        labels, at 0.75, and learned it the same way.
      </p>
    </Defect>
  ),
};
