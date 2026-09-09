import { addons } from "storybook/manager-api";
import { create } from "storybook/theming/create";

import { verdictManagerColors } from "../src/lib/manager-theme.ts";

/**
 * The Storybook chrome.
 *
 * This file did not exist. The published system therefore introduced itself as
 * "Storybook", under Storybook's logo, with Storybook's favicon in the tab, and
 * with no link anywhere back to the case study, the repository or the person who
 * built it. Someone arriving from a link had no way to find out whose work they
 * were looking at.
 *
 * The colours are resolved out of tokens.json rather than typed here, so the
 * frame around the system is themed by the system. See lib/verdict/manager-theme.
 */
addons.setConfig({
  theme: create({
    base: "dark",
    brandTitle: "Verdict Design System",
    /** The case study, which is the context this Storybook is evidence for. */
    brandUrl: "https://bindustudio.dev/work/verdict",
    brandTarget: "_self",
    ...verdictManagerColors,
    fontBase: '"Instrument Sans", ui-sans-serif, system-ui, sans-serif',
    fontCode: '"Geist Mono", ui-monospace, SFMono-Regular, monospace',
  }),
  sidebar: {
    /**
     * Expanded. Nine sections and twenty-six leaves fit on one screen, and a
     * collapsed tree hides the thing worth finding behind a click nobody makes.
     */
    showRoots: true,
  },
});
