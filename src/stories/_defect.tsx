import * as React from "react";
import contrast from "@/lib/contrast.json";
import verify from "@/lib/verify.json";

/**
 * The frame for "What the checks caught".
 *
 * ── Why these pages exist ─────────────────────────────────────────────────
 *
 * The seven defects were one paragraph each at the bottom of a long
 * documentation story, in the fourth folder of a mis-sorted sidebar. They are
 * the most persuasive thing in this system and were almost never scrolled to.
 * Every one of them is a defect you can see, and not one of them was shown.
 *
 * So each gets its own page, with the failure beside the fix.
 *
 * ── Why the failures are drawn rather than rendered ───────────────────────
 *
 * Five of the seven are contrast failures. Rendering one live would put a real
 * WCAG violation on the page, and axe runs against every story in this
 * Storybook and fails the build on any violation. The honest options were to
 * exempt these stories from the gate, or to depict the failure instead.
 *
 * Exempting them would have meant the page arguing that every story is checked
 * carried the only stories that are not. So the failing states are drawn as SVG,
 * labelled for a screen reader, and the numbers under them are computed here
 * from the same token file the build measures, rather than typed from memory.
 * Two of the seven are markup rather than colour, and those are shown as code.
 */

type Measurement = (typeof contrast.measurements)[number];

/* ── Colour, read out of the generated report ─────────────────────────────── */

/**
 * The hex a role resolves to, taken from the contrast report rather than typed.
 *
 * A role appears in the report as a foreground, a background, or both, so both
 * sides are searched. A role that has never been measured has no entry, and that is
 * an error rather than a fallback: a page about unmeasured colours should
 * not quietly invent one.
 */
export function hex(theme: "dark" | "light", role: string): string {
  for (const m of contrast.measurements as Measurement[]) {
    if (m.theme !== theme) continue;
    if (m.fg === role) return m.fgHex;
    if (m.bg === role) return m.bgHex;
  }
  throw new Error(
    `No measurement in contrast.json involves "${role}" in the ${theme} theme, ` +
      `so its value cannot be shown here without being typed by hand.`
  );
}

const channels = (h: string) =>
  [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

function luminance(h: string): number {
  const [r, g, b] = channels(h)
    .map((v) => v / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.2 contrast, to two places, the way the token builder reports it. */
export function ratio(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)];
  const value = (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  return Math.round(value * 100) / 100;
}

/**
 * What a colour becomes once something fades it.
 *
 * This is the arithmetic the contrast gate cannot do for you, because opacity
 * is applied by the browser long after a pair has been declared and measured.
 */
export function composite(fg: string, bg: string, alpha: number): string {
  const [f, b] = [channels(fg), channels(bg)];
  return (
    "#" +
    f
      .map((v, i) => Math.round(v * alpha + b[i] * (1 - alpha)).toString(16).padStart(2, "0"))
      .join("")
  );
}

/** The declared pair, if the system ever declared it. Null is the finding. */
export function declared(
  theme: "dark" | "light",
  fg: string,
  bg: string
): Measurement | null {
  return (
    (contrast.measurements as Measurement[]).find(
      (m) => m.theme === theme && m.fg === fg && m.bg === bg
    ) ?? null
  );
}

/* ── Layout ───────────────────────────────────────────────────────────────── */

const mono = "var(--vd-fontFamily-mono)";

/**
 * A link to another story, checked rather than hoped for.
 *
 * `exportName` is the exported const, not the name a story displays. That
 * distinction is the whole reason this function validates: Storybook builds the
 * id from the export, splitting it into words first, so
 * `storyPath("…/QueueRail", "Partly worked")` produces an id that does not exist
 * and renders a link that looks perfectly fine and goes nowhere. Passing a
 * display name with an apostrophe in it produced exactly that here.
 *
 * verify.json carries every real story id, generated from the same source
 * Storybook indexes, so an unresolvable link throws while the page renders. Axe
 * renders every page in CI, which makes a broken cross-link a failed build
 * rather than a dead end found later.
 */
export function storyPath(title: string, exportName: string): string {
  const slug = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const id =
    slug(title.split("/").join("-")) +
    "--" +
    slug(
      exportName
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    );

  if (!(verify.stories.ids as string[]).includes(id)) {
    throw new Error(
      `No story "${id}". storyPath takes the export name, not the displayed name: ` +
        `storyPath("${title}", "PartlyWorked") rather than "Partly worked".`
    );
  }
  return `./?path=/story/${id}`;
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: mono,
        fontSize: 11,
        letterSpacing: "0.09em",
        textTransform: "uppercase",
        color: "var(--vd-text-tertiary)",
        margin: "0 0 8px",
      }}
    >
      {children}
    </p>
  );
}

/**
 * One colour pair, drawn.
 *
 * SVG rather than styled HTML, deliberately. The failing halves of these pairs
 * are real WCAG failures, and axe checks the contrast of HTML text on every
 * story in this Storybook. Drawing the failure means the page can show it
 * without shipping it, which is the same distinction as a photograph of a fire.
 */
export function Swatch({
  fg,
  bg,
  sample,
  caption,
  value,
  floor,
  note,
}: {
  fg: string;
  bg: string;
  sample: string;
  caption: string;
  value: number;
  floor?: number;
  note?: string;
}) {
  const fails = floor !== undefined && value < floor;
  return (
    <div style={{ minWidth: 240, flex: "1 1 240px" }}>
      <Label>{caption}</Label>
      <svg
        viewBox="0 0 240 74"
        width="100%"
        height={74}
        role="img"
        aria-label={`${caption}. The text reads "${sample}" and measures ${value} to 1 against its background.`}
        style={{ display: "block", borderRadius: 6 }}
      >
        <rect width="240" height="74" rx="6" fill={bg} />
        <text
          x="16"
          y="43"
          fill={fg}
          fontFamily="Instrument Sans, system-ui, sans-serif"
          fontSize="16"
        >
          {sample}
        </text>
      </svg>
      <p
        style={{
          fontFamily: mono,
          fontSize: 12.5,
          margin: "8px 0 0",
          color: fails
            ? "var(--vd-decision-decline-fg)"
            : "var(--vd-decision-approve-fg)",
        }}
      >
        {value.toFixed(2)}:1
        {floor !== undefined ? (
          <span style={{ color: "var(--vd-text-tertiary)" }}>
            {"  "}
            against a {floor.toFixed(1)} bar
          </span>
        ) : null}
      </p>
      {note ? (
        <p style={{ fontSize: 13, margin: "6px 0 0", color: "var(--vd-text-secondary)" }}>
          {note}
        </p>
      ) : null}
    </div>
  );
}

/** A line of source, marked as the thing that failed or the thing that replaced it. */
export function Code({ ok, children }: { ok?: boolean; children: React.ReactNode }) {
  return (
    <pre
      style={{
        fontFamily: mono,
        fontSize: 12.5,
        lineHeight: 1.6,
        margin: "8px 0 0",
        padding: "10px 12px",
        borderRadius: 6,
        overflowX: "auto",
        background: "var(--vd-surface-sunken)",
        color: "var(--vd-text-secondary)",
        borderLeft: `2px solid ${
          ok ? "var(--vd-decision-approve-solid)" : "var(--vd-decision-decline-solid)"
        }`,
      }}
    >
      {/* The label uses -fg, a foreground role, not the -solid fill used for the
          border. Reaching for -solid here because it is the more obvious name is
          defect seven on this very list. */}
      <span
        style={{
          color: ok
            ? "var(--vd-decision-approve-fg)"
            : "var(--vd-decision-decline-fg)",
        }}
      >
        {ok ? "after   " : "before  "}
      </span>
      {children}
    </pre>
  );
}

export function Proof({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap", margin: "20px 0 0" }}>
      {children}
    </div>
  );
}

/**
 * The frame every defect page shares.
 *
 * Three questions in the same order each time, because the interesting part of
 * this list is not that seven bugs existed. It is that in every case the check
 * that found one was not the check you would have expected.
 */
export function Defect({
  headline,
  sawIt,
  caughtBy,
  missedBy,
  lives,
  children,
}: {
  headline: string;
  sawIt: string;
  caughtBy: string;
  missedBy: string;
  lives?: { label: string; title: string; story: string };
  children: React.ReactNode;
}) {
  return (
    <div style={{ maxWidth: 860, lineHeight: 1.65 }}>
      <h1 style={{ fontSize: 22, margin: 0, letterSpacing: "-0.01em", maxWidth: "24ch" }}>
        {headline}
      </h1>
      <p style={{ margin: "12px 0 0", maxWidth: "68ch", color: "var(--vd-text-secondary)" }}>
        {sawIt}
      </p>

      {children}

      <dl
        style={{
          margin: "32px 0 0",
          paddingTop: 18,
          borderTop: "1px solid var(--vd-border-subtle)",
          display: "grid",
          gridTemplateColumns: "minmax(150px, auto) 1fr",
          gap: "10px 24px",
          maxWidth: "78ch",
        }}
      >
        <dt style={{ fontFamily: mono, fontSize: 12, color: "var(--vd-text-tertiary)" }}>
          Caught by
        </dt>
        <dd style={{ margin: 0 }}>{caughtBy}</dd>
        <dt style={{ fontFamily: mono, fontSize: 12, color: "var(--vd-text-tertiary)" }}>
          Missed by
        </dt>
        <dd style={{ margin: 0, color: "var(--vd-text-secondary)" }}>{missedBy}</dd>
      </dl>

      {lives ? (
        <p style={{ margin: "22px 0 0", fontSize: 13.5 }}>
          <a
            href={storyPath(lives.title, lives.story)}
            target="_top"
            style={{ color: "var(--vd-text-accent)" }}
          >
            See the state it lives in: {lives.label}
          </a>
        </p>
      ) : null}
    </div>
  );
}
