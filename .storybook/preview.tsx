import * as React from "react";
import type { Decorator, Preview } from "@storybook/react-vite";

import "../src/styles/tokens.css";
import "../src/styles/verdict.css";

import { TooltipProvider } from "../src/components/primitives";

/**
 * Every token in the system hangs off `[data-verdict]`, and every role that
 * differs between themes hangs off `[data-vd-theme]`. Stories therefore render
 * inside both attributes rather than on a bare canvas.
 *
 * The theme is a toolbar global, not a story arg, which is deliberate: the
 * point of the semantic tier is that a component does not know which theme it
 * is in. Making theme a prop on a story would let a component start caring.
 */
const withVerdict: Decorator = (Story, context) => {
  const theme = context.globals.theme ?? "dark";
  return (
    <div
      data-verdict
      data-vd-theme={theme}
      style={{
        background: "var(--vd-surface-base)",
        color: "var(--vd-text-primary)",
        padding: "var(--vd-space-6)",
        minHeight: "100%",
        fontFamily: "var(--vd-fontFamily-sans)",
      }}
    >
      <TooltipProvider delayDuration={250}>
        <Story />
      </TooltipProvider>
    </div>
  );
};

const preview: Preview = {
  decorators: [withVerdict],
  globalTypes: {
    theme: {
      description: "Verdict theme",
      defaultValue: "dark",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "dark", title: "Dark" },
          { value: "light", title: "Light" },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    layout: "fullscreen",
    controls: { expanded: true },
    a11y: {
      /**
       * Fail the story, do not annotate it.
       *
       * The addon draws its findings in a panel while you author, and a panel
       * is a suggestion. "error" is what makes `npm run test:a11y` run axe over
       * every story in a real browser and exit non-zero on any violation, which
       * is the only version of an accessibility standard that survives a
       * deadline.
       */
      test: "error",
    },
    backgrounds: { disable: true },
  },
};

export default preview;
