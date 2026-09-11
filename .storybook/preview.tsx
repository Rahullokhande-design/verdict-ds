import type { Decorator, Preview } from "@storybook/react-vite";

import "../src/styles/tokens.css";
import "../src/styles/verdict.css";

import { VerdictCanvas, globalTypes, parameters } from "../src/lib/storybook";

/**
 * The Vite half of the preview.
 *
 * Everything that is not framework-specific lives in src/lib/storybook.tsx,
 * which is copied byte for byte from the repository this system is used in.
 * What is left here is the part that is genuinely different between the two: the
 * type import, where the stylesheets sit, and how the fonts arrive, which for
 * this build is the link tag in preview-head.html rather than next/font.
 */
const withVerdict: Decorator = (Story, context) => (
  <VerdictCanvas theme={context.globals.theme ?? "dark"}>
    <Story />
  </VerdictCanvas>
);

const preview: Preview = {
  decorators: [withVerdict],
  /**
   * Autodocs on everything.
   *
   * Nine story files set `component:` and nothing consumed it, so the Storybook
   * had no documentation page, no prop table and no import line anywhere in it.
   * Tagging globally means a component cannot be added without one.
   */
  tags: ["autodocs"],
  globalTypes,
  parameters: {
    ...parameters,
    /**
     * The sidebar order, spelled out inline because it has to be.
     *
     * Storybook does not evaluate this file to find the order. It parses it,
     * statically, with Babel, looking for a literal
     * `parameters.options.storySort` in the source of preview.tsx. An imported
     * value throws "Unexpected identifier", a member expression throws "Unknown
     * node type", and an order it cannot find at all is ignored in silence,
     * leaving the sidebar in file order with no error anywhere. Which is how
     * this Storybook came to be numbered "0 Enforcement", "1 Primitives" and to
     * render them 1, 2, 4, 0, 3, 5.
     *
     * So it is written out here, and again in the other preview.tsx, and
     * `report:check` compares the two and fails when they drift. A duplication
     * that has to exist is fine. A duplication nothing is watching is not.
     */
    options: {
      storySort: {
        order: [
          "Verdict",
          [
            "Start here",
            ["Overview"],
            "Enforcement",
            ["What is checked"],
            "What the checks caught",
            [
              // Found in this order, ending on the one nothing automatic caught,
              // then on the one committed by the person documenting the rule it
              // broke.
              "Inert button colour",
              "Opacity beat the gate",
              "An undeclared pair",
              "An image around a button",
              "A pointer to nothing",
              "The one no gate caught",
              "This page's own mistake",
            ],
            "Foundations",
            ["Three tiers", "Colour roles", "Measured contrast"],
            // The component tiers, in the order the architecture builds them up.
            "Primitives",
            ["Button", "Kbd", "Panel", "Tooltip", "SrOnly"],
            "Compounds",
            ["Checkbox", "Segmented", "FilterPill", "SortHeader"],
            "Domain",
            ["RiskBadge", "VerdictStamp", "EntityChip", "EventTimeline"],
            "Instrument",
            ["ScoreInstrument", "SignalList"],
            "Workspace",
            ["CaseFacts", "QueueRail", "DecisionBar", "UndoToast", "ThresholdChart"],
          ],
        ],
      },
    },
  },
};

export default preview;
