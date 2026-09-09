import type { Meta, StoryObj } from "@storybook/react-vite";
import { Code, Defect } from "./_defect";

const meta = {
  title: "Verdict/What the checks caught/A pointer to nothing",
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

export const APointerToNothing: Story = {
  name: "A pointer to nothing",
  render: () => (
    <Defect
      headline="aria-activedescendant pointing at a row that no longer exists"
      sawIt='The queue rail tells a screen reader which row is current by id. With no cases left it rendered aria-activedescendant="vd-case-", which names nothing, and a screen reader follows that pointer into an element that is not there.'
      caughtBy="Axe, on the empty story. There is now also an assertion for it that runs in CI: the empty rail is checked for the absence of the attribute, not for a different value of it."
      missedBy="Every screen in the prototype, and every screenshot in the case study. An empty queue happens at the end of every shift and is a state no screen renders, because a screen is built from the data somebody had on the day."
      lives={{ label: "QueueRail, empty", title: "Verdict/Workspace/QueueRail", story: "Empty" }}
    >
      <div style={{ marginTop: 24, maxWidth: 760 }}>
        <Code>{`aria-activedescendant={\`vd-case-\${activeId}\`}`}</Code>
        <Code ok>{`aria-activedescendant={
  cases.some((c) => c.id === activeId) ? \`vd-case-\${activeId}\` : undefined
}`}</Code>
      </div>

      <p style={{ margin: "24px 0 0", maxWidth: "68ch", color: "var(--vd-text-secondary)" }}>
        This is the argument for a story per state in one defect. The empty list,
        the four-digit number, the label that wraps, the row already decided:
        none of them appear on a happy path, all of them appear in production,
        and the only way they get built deliberately is if somebody writes them
        down as states rather than waiting to find them.
      </p>
    </Defect>
  ),
};
