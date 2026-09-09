import type { Meta, StoryObj } from "@storybook/react-vite";
import { Code, Defect, Proof, Swatch, declared, hex, ratio } from "./_defect";

const meta = {
  title: "Verdict/What the checks caught/This page's own mistake",
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
const solid = hex("dark", "decision-decline-solid");
const foreground = hex("dark", "decision-decline-fg");

/** The fix is a declared, gated pair. If it is ever removed, this throws. */
const fixed = declared("dark", "decision-decline-fg", "surface-sunken");

export const ThisPagesOwnMistake: Story = {
  name: "This page's own mistake",
  render: () => (
    <Defect
      headline="The page documenting the rule broke the rule, on its first run"
      sawIt='The examples on the Enforcement page are labelled "fails" in red and "passes" in green. The red was written with --vd-decision-decline-solid. That is a fill colour, and it was used as text on a dark surface.'
      caughtBy="Axe, the first time the page rendered. Nothing about it looked wrong: it is a red word, on a dark background, in a system whose red is that red."
      missedBy="The person writing the page, who was at that moment explaining why the tier split exists. The system already had the right token. The wrong one was simply the more obvious name."
      lives={{ label: "Enforcement, what is checked", title: "Verdict/Enforcement/What is checked", story: "What is checked" }}
    >
      <Proof>
        <Swatch
          caption="What was written"
          bg={sunken}
          fg={solid}
          sample="fails"
          value={ratio(solid, sunken)}
          floor={4.5}
          note="decision-decline-solid. A background colour, borrowed for text."
        />
        <Swatch
          caption="The token that already existed"
          bg={sunken}
          fg={foreground}
          sample="fails"
          value={ratio(foreground, sunken)}
          floor={4.5}
          note="decision-decline-fg. Same role, same red, declared for foregrounds."
        />
      </Proof>

      <div style={{ marginTop: 28 }}>
        <Code>{`color: var(--vd-decision-decline-solid)`}</Code>
        <Code ok>{`color: var(--vd-decision-decline-fg)`}</Code>
      </div>

      <p style={{ margin: "24px 0 0", maxWidth: "68ch" }}>
        Every decision colour in this system ships as five roles, and two of them
        are one letter apart in the way that matters:{" "}
        <span style={{ fontFamily: "var(--vd-fontFamily-mono)" }}>-solid</span>{" "}
        is a fill you put something on,{" "}
        <span style={{ fontFamily: "var(--vd-fontFamily-mono)" }}>-fg</span> is a
        colour you write with. Both are red. Only one is measured against the
        surface a word sits on.
        {fixed ? (
          <>
            {" "}
            The pair now runs at{" "}
            <span style={{ fontFamily: "var(--vd-fontFamily-mono)" }}>
              {fixed.ratio.toFixed(2)}:1
            </span>
            , which is not a near miss in either direction.
          </>
        ) : null}
      </p>

      <p style={{ margin: "16px 0 0", maxWidth: "68ch", color: "var(--vd-text-secondary)" }}>
        This one is on the list because of who made it and when. The split
        between a fill and a foreground is the constraint the three-tier
        architecture exists to make catchable, and it was tripped by the person
        documenting that constraint, in the act of documenting it. A rule you
        have to remember is a rule you will break on a Tuesday. That is the
        argument for checking, made against its own author.
      </p>
    </Defect>
  ),
};
