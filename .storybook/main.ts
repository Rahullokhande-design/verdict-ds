import type { StorybookConfig } from "@storybook/react-vite";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

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
  ],
  framework: { name: "@storybook/react-vite", options: {} },
  viteFinal: async (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "@": join(root, "src"),
    };
    return config;
  },
};

export default config;
