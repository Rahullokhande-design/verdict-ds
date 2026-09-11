import type { Meta, StoryObj } from "@storybook/react-vite";
import { Code, Defect, Proof, Swatch, hex, ratio } from "./_defect";

const meta = {
  title: "Verdict/What the checks caught/Inert button colour",
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

const accent = hex("dark", "surface-accent");
const inherited = hex("dark", "text-primary");
const intended = hex("dark", "text-on-accent");

export const InertButtonColour: Story = {
  name: "Inert button colour",
  render: () => (
    <Defect
      headline="Every button variant's colour was inert for months"
      sawIt="A form reset in the base stylesheet was written as [data-verdict] button. That selector scores (0,1,1) and beats every single-class variant below it, so all six button variants rendered in the inherited body colour instead of their own. The buttons looked plausible, which is why they were never queried."
      caughtBy="Axe, in a real browser. It is the only check in this build that measures the pixels a cascade actually produced rather than reasoning about source."
      missedBy="The token gate. Every colour pair the tokens declared was correct and every one of them passed. Nothing was wrong with the declaration. The cascade never reached it."
      lives={{ label: "Button, every variant at every size", title: "Verdict/Primitives/Button", story: "Variants" }}
    >
      <Proof>
        <Swatch
          caption="What shipped"
          bg={accent}
          fg={inherited}
          sample="Approve"
          value={ratio(inherited, accent)}
          floor={4.5}
          note="The body text colour, inherited, sitting on the accent fill."
        />
        <Swatch
          caption="What the tokens intended"
          bg={accent}
          fg={intended}
          sample="Approve"
          value={ratio(intended, accent)}
          floor={4.5}
          note="text-on-accent, the role that exists for exactly this pairing."
        />
      </Proof>

      <div style={{ marginTop: 28 }}>
        <Code>{`[data-verdict] button { color: inherit }   /* (0,1,1) */`}</Code>
        <Code ok>{`[data-verdict] .vd-btn { color: inherit }  /* (0,1,0), and scoped */`}</Code>
      </div>

      <p style={{ margin: "24px 0 0", maxWidth: "68ch", color: "var(--vd-text-secondary)" }}>
        The gap is 0.08 against a 4.5 bar. Small enough that no one would have
        argued with a screenshot, and large enough to fail. A number is a better
        reviewer than an opinion here, which is the whole reason the check runs
        against rendered output rather than against the token file.
      </p>
    </Defect>
  ),
};
