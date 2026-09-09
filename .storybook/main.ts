import type { StorybookConfig } from "@storybook/react-vite";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { verdictFaviconHref } from "../src/lib/manager-theme.ts";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

/**
 * Storybook exists here for one reason: a component's states are the part of a
 * design system that nobody documents and everybody needs.
 *
 * A screen shows a component in the two or three states the happy path happens
 * to produce. The states that break a system in production are the ones a
 * screen never renders: the empty list, the four-digit number, the label that
 * wraps, the disabled control, the row that has already been decided. A story
 * per state is how those get built deliberately rather than found by a user.
 */
const config: StorybookConfig = {
  stories: ["../src/stories/**/*.stories.@(ts|tsx)"],
  addons: [
    // Runs axe on every story: in the panel while authoring, and in CI through
    // the test runner. An accessibility check that only happens when someone
    // remembers to open a tab is not a check.
    "@storybook/addon-a11y",
    // Autodocs. Without it, `tags: ["autodocs"]` in preview.tsx is inert: the
    // build succeeds, the sidebar shows no documentation pages, and nine story
    // files go on declaring `component:` for nobody. That was the state this
    // Storybook shipped in.
    "@storybook/addon-docs",
  ],
  framework: { name: "@storybook/react-vite", options: {} },
  /**
   * Storybook's own onboarding checklist, off.
   *
   * It renders a "Get started · 39%" progress widget at the top of the sidebar
   * and an onboarding entry in the menu. Both are addressed to somebody setting
   * up their first Storybook, which is not who opens a published one, and a
   * progress bar reading 39% is a strange first impression for a work sample.
   */
  features: {
    sidebarOnboardingChecklist: false,
    menuOnboardingChecklist: false,
  },

  /**
   * react-docgen-typescript rather than the default.
   *
   * The default parser gives up on a `forwardRef` wrapped around a
   * class-variance-authority variant type, which is the shape of every
   * primitive here, and produces a documentation page with an empty prop table.
   * An empty prop table is worse than none: it reads as a component with no API.
   */
  typescript: { reactDocgen: "react-docgen-typescript" },
  /**
   * Storybook only leaves its own favicon alone when the manager head already
   * declares one. The mark is drawn from the token file. See manager-theme.
   */
  managerHead: `<link rel="icon" href="${verdictFaviconHref}" />`,
  viteFinal: async (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "@": join(root, "src"),
    };
    return config;
  },
};

/**
 * `title` is a real Storybook preset and is not in the public config type, so it
 * is attached here rather than inside the typed object.
 *
 * Without it the browser tab reads "storybook - Storybook", because the fallback
 * is the basename of the config directory. A tab is the first label a visitor
 * reads and the one they look for when they come back to it.
 */
export default { ...config, title: "Verdict Design System" } as StorybookConfig & {
  title: string;
};
