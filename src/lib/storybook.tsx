import * as React from "react";
import { TooltipProvider } from "@/components/primitives";

/**
 * Everything the two Storybooks share.
 *
 * ── Why this file exists ──────────────────────────────────────────────────
 *
 * Verdict runs in two Storybooks: this repository's, on the Next framework, and
 * the published standalone one, on Vite. Both used to carry a full hand-written
 * `preview.tsx`, and the extractor that generates the public repo opens with the
 * line "a hand-maintained public mirror of a design system is a design system
 * with two source files, and within a month it is a design system with two
 * different source files."
 *
 * Within a month they were two different source files. The wording of the
 * comments had diverged, one of them documented an opt-out the other did not
 * mention, and only one configured the docgen that produces prop tables.
 *
 * So the decorator, the theme toolbar, the parameters and the sidebar order all
 * live here, in a file the extractor copies like any other. What is left in each
 * `preview.tsx` is the part that is genuinely different: which framework's types
 * to import, where the stylesheets sit, and how that framework loads a font.
 */

/**
 * Every token in the system hangs off `[data-verdict]`, and every role that
 * differs between themes hangs off `[data-vd-theme]`. Stories therefore render
 * inside both attributes rather than on a bare canvas.
 *
 * The theme is a toolbar global, not a story arg, which is deliberate: the
 * point of the semantic tier is that a component does not know which theme it
 * is in. Making theme a prop on a story would let a component start caring.
 */
export function VerdictCanvas({
  theme,
  className,
  children,
}: {
  theme: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      data-verdict
      data-vd-theme={theme}
      className={className}
      style={{
        background: "var(--vd-surface-base)",
        color: "var(--vd-text-primary)",
        padding: "var(--vd-space-6)",
        minHeight: "100%",
        fontFamily: "var(--vd-fontFamily-sans)",
      }}
    >
      <TooltipProvider delayDuration={250}>{children}</TooltipProvider>
    </div>
  );
}

export const globalTypes = {
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
};

export const parameters = {
  layout: "fullscreen" as const,
  controls: { expanded: true },
  /**
   * The sidebar order is deliberately not here.
   *
   * It is the one parameter Storybook reads by parsing preview.tsx as source
   * rather than by evaluating it, so an imported value is rejected outright. It
   * lives inline in both preview.tsx files, and `report:check` compares them.
   */
  a11y: {
    /**
     * Fail the story, do not annotate it.
     *
     * The addon draws its findings in a panel while you author, and a panel is
     * a suggestion. "error" is what makes `npm run test:a11y` run axe over every
     * story in a real browser and exit non-zero on any violation, which is the
     * only version of an accessibility standard that survives a deadline.
     *
     * Nothing opts out. The "What the checks caught" pages reproduce five real
     * contrast failures and not one of them is exempted, because those failing
     * states are drawn as SVG with a text alternative rather than rendered as
     * HTML text. A page arguing that every story is gated should not be the one
     * place carrying stories that are not. See stories/verdict/_defect.tsx.
     */
    test: "error" as const,
  },
  backgrounds: { disable: true },
  docs: {
    /**
     * Prop tables are generated from the component source. They were not
     * generated at all until recently: nine story files declared `component:`
     * and no story carried the autodocs tag, so the Storybook contained no
     * documentation page, no prop table and no import line, and the first
     * sentence of prose a visitor read was "This story has no controls."
     */
    codePanel: true,
  },
};
