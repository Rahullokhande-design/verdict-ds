/**
 * Verdict — three-tier design token architecture.
 *
 * This file is the source of truth. `scripts/build-tokens.mjs` reads it
 * and emits two artifacts:
 *
 *     src/styles/tokens.css   the cascade, scoped to [data-verdict]
 *     src/lib/contrast.json           every declared pair, with its measured ratio
 *
 * Rebuild both with:  node scripts/build-tokens.mjs
 *
 * ── The three tiers ────────────────────────────────────────────────────────
 *
 *   TIER 1  PRIMITIVE   Raw scales with no opinion about usage. `--vd-violet-600`.
 *                       Never referenced by a component. Changing one repaints
 *                       everything downstream.
 *
 *   TIER 2  SEMANTIC    Roles. `--vd-surface-raised`, `--vd-risk-3-bg`. This is
 *                       the ONLY tier that differs between light and dark. That
 *                       single constraint is what makes theming a diff instead
 *                       of an audit.
 *
 *   TIER 3  COMPONENT   Per-component contracts. `--vd-instrument-marker`. A
 *                       component reads only its own tier-3 names, so it can be
 *                       restyled without touching semantics, and semantics can
 *                       be re-themed without opening a component.
 *
 * The rule that makes it hold: tier 3 resolves through tier 2, tier 2 resolves
 * through tier 1, and tier 3 may never reach past the semantic layer to grab a
 * primitive. The generator exits non-zero when that is broken, so the rule is
 * checkable rather than aspirational. A lint rule enforces the same boundary in
 * component source.
 *
 * One deliberate exception, stated rather than hidden: stylesheets use spacing
 * and type primitives directly (`var(--vd-space-5)`), because inventing a
 * semantic role for every gap produces a dictionary that goes unread. Colour has no
 * such exception. No component ever names a colour primitive.
 *
 * ── Why the palette looks like this ────────────────────────────────────────
 *
 * Dark-first, because analysts sit in front of this for a full shift and ops
 * floors are dim. The neutral is a cool anodized charcoal rather than pure
 * black, so layered surfaces have somewhere to go.
 *
 * Violet is the interactive accent and carries NO semantic meaning. In a product
 * where green means approve and red means decline, an accent that collides with
 * a decision colour is a defect, not a preference.
 *
 * Risk is ordinal, not categorical, so it is not a traffic light. It is a single
 * ember hue climbing in lightness and chroma across four steps, which means it
 * survives greyscale and colour blindness intact. Colour is never the only
 * carrier: every risk value also ships a rank (R1–R4) and a numeric band.
 */

/* ─────────────────────────── TIER 1 · PRIMITIVES ─────────────────────────── */

export const primitives = {
  color: {
    /**
     * Cool anodized charcoal. Fifteen steps rather than the usual eleven, and
     * the extra ones are all at the dark end (750, 850, 925) because layered
     * dark surfaces need fine control. Four surfaces stacked 100 units apart
     * read as one flat plane; stacked 50 apart they read as depth.
     */
    graphite: {
      25: "#FAFBFC",
      50: "#F4F6F8",
      100: "#E8ECF0",
      200: "#D5DBE2",
      300: "#B3BCC7",
      400: "#8794A3",
      500: "#616E7D",
      /**
       * Added after the fact, which is worth saying out loud.
       *
       * Light-theme `text-tertiary` was graphite-500, chosen against the two
       * surfaces it was first used on: white panels (5.20:1) and the app
       * background (4.80:1). Both pass. On the sunken surface the queue rail
       * uses, the same colour is 4.38:1, and the pair had never been declared
       * so nothing measured it.
       *
       * 550 is one step darker and clears 4.5 on all three light surfaces with
       * room left over, without collapsing into 600, which is text-secondary
       * and needs to stay visibly heavier than tertiary.
       */
      550: "#57616F",
      600: "#4A5563",
      700: "#363F4B",
      750: "#2B333D",
      800: "#212831",
      850: "#1A2028",
      900: "#141A21",
      925: "#10151B",
      950: "#0B0F14",
    },
    /** Interactive accent and focus. Never a status, never a decision. */
    violet: {
      50: "#F1EFFE",
      100: "#E3DFFD",
      200: "#C8C0FB",
      300: "#A99CF7",
      400: "#8B7BF2",
      500: "#6E5DE7",
      600: "#5A47D4",
      700: "#4737AB",
      800: "#332781",
      900: "#211A54",
    },
    /**
     * The risk ramp. One hue (~30°), climbing. Deliberately orange rather than
     * red so it never reads as the decline action, which lives at ~352°.
     */
    ember: {
      50: "#FDF2E9",
      100: "#FBE1C9",
      200: "#F6C193",
      300: "#EF9D57",
      400: "#E67E2B",
      500: "#C4661F",
      600: "#9E5018",
      700: "#783C12",
      800: "#52290C",
      900: "#2E1706",
    },
    /** Approve. */
    jade: {
      50: "#E8F7F1",
      100: "#C6EDE0",
      200: "#8FDBC2",
      300: "#52C4A1",
      400: "#22A67F",
      500: "#158967",
      600: "#106E52",
      700: "#0C523D",
      800: "#083729",
      900: "#041F17",
    },
    /** Decline. Pushed toward crimson so it separates from the ember ramp. */
    ruby: {
      50: "#FDEEF1",
      100: "#FAD7DE",
      200: "#F4AEBC",
      300: "#EC7E94",
      400: "#E14E6D",
      500: "#C93553",
      600: "#A62742",
      700: "#801C32",
      800: "#591323",
      900: "#350A15",
    },
    white: "#FFFFFF",
    black: "#000000",
  },

  /** 4px base. Every gap in the prototype is one of these. */
  space: {
    0: "0px",
    1: "2px",
    2: "4px",
    3: "8px",
    4: "12px",
    5: "16px",
    6: "20px",
    7: "24px",
    8: "32px",
    9: "40px",
    10: "48px",
    11: "64px",
    12: "80px",
  },

  radius: {
    none: "0px",
    xs: "3px",
    sm: "5px",
    md: "7px",
    lg: "10px",
    xl: "14px",
    full: "999px",
  },

  /**
   * Data-dense. The scale tops out low on purpose: a queue that shows forty
   * rows is worth more here than a 48px headline. Everything below 13px is
   * reserved for labels and metadata, never for a value someone must read fast.
   */
  fontSize: {
    "2xs": "10.5px",
    xs: "11.5px",
    sm: "12.5px",
    md: "13.5px",
    lg: "15px",
    xl: "17px",
    "2xl": "21px",
    "3xl": "27px",
    "4xl": "34px",
  },

  fontWeight: { regular: "400", medium: "500", semibold: "600", bold: "700" },

  lineHeight: { flat: "1", tight: "1.15", snug: "1.3", normal: "1.5", relaxed: "1.65" },

  letterSpacing: {
    tight: "-0.014em",
    normal: "0em",
    wide: "0.02em",
    /** Uppercase micro-labels only. Caps without tracking is a legibility bug. */
    caps: "0.07em",
  },

  fontFamily: {
    /**
     * Instrument Sans for the interface: high x-height, open apertures, and an
     * unambiguous 1/l/I, which matters when a mis-read digit is someone's money.
     * Geist Mono for every number, ID, timestamp and score. Tabular figures are
     * not a nicety here: values that shift horizontally while a queue refreshes
     * cannot be scanned.
     */
    sans: 'var(--font-instrument-sans), ui-sans-serif, system-ui, -apple-system, sans-serif',
    mono: 'var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace',
  },

  /**
   * Two-layer shadows throughout: a tight contact shadow that anchors an element
   * to the surface below it, plus a diffuse ambient one. A single blurred layer
   * is what makes an interface look printed on rather than sitting above.
   */
  shadow: {
    none: "none",
    sm: "0 1px 2px rgba(4, 7, 10, 0.28)",
    md: "0 2px 4px rgba(4, 7, 10, 0.24), 0 4px 12px rgba(4, 7, 10, 0.22)",
    lg: "0 4px 8px rgba(4, 7, 10, 0.3), 0 12px 32px rgba(4, 7, 10, 0.32)",
    xl: "0 8px 16px rgba(4, 7, 10, 0.34), 0 24px 56px rgba(4, 7, 10, 0.4)",
    smLight: "0 1px 2px rgba(16, 21, 27, 0.06)",
    mdLight: "0 1px 2px rgba(16, 21, 27, 0.06), 0 4px 12px rgba(16, 21, 27, 0.07)",
    lgLight: "0 2px 6px rgba(16, 21, 27, 0.08), 0 12px 32px rgba(16, 21, 27, 0.1)",
    xlLight: "0 4px 12px rgba(16, 21, 27, 0.1), 0 24px 56px rgba(16, 21, 27, 0.14)",
    /**
     * The single most effective depth cue in a dark interface: a one-pixel
     * highlight on the top edge, as though the panel is catching light from
     * above. On a light theme the same trick is invisible, so light gets a
     * border instead. That asymmetry is why elevation is a semantic role.
     */
    edgeDark: "inset 0 1px 0 rgba(255, 255, 255, 0.06)",
    edgeLight: "inset 0 1px 0 rgba(255, 255, 255, 0.9)",
    /** Recessed wells. The score track is cut into the panel, not drawn on it. */
    wellDark: "inset 0 1px 3px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(0, 0, 0, 0.25)",
    wellLight: "inset 0 1px 3px rgba(16, 21, 27, 0.1), inset 0 0 0 1px rgba(16, 21, 27, 0.05)",
  },

  /**
   * Four durations, and the names say what they are for. Anything above
   * `deliberate` is the interface wasting a reviewer's shift.
   */
  duration: {
    instant: "0ms",
    fast: "90ms",
    base: "140ms",
    slow: "220ms",
    deliberate: "320ms",
  },

  easing: {
    standard: "cubic-bezier(0.2, 0, 0.2, 1)",
    decelerate: "cubic-bezier(0, 0, 0.2, 1)",
    accelerate: "cubic-bezier(0.4, 0, 1, 1)",
    /** Reserved for one thing: the undo affordance arriving. */
    spring: "cubic-bezier(0.34, 1.4, 0.64, 1)",
  },
} as const;

/* ─────────────────────────── TIER 2 · SEMANTIC ───────────────────────────
 * Roles, expressed only as references into tier 1. Light and dark are the same
 * set of names pointing at different primitive steps. Nothing else in the
 * system is allowed to differ between themes.
 */

type TokenMap = Record<string, string>;

export const semanticDark: TokenMap = {
  // Surfaces, back to front. Four real steps, used as four real steps.
  "surface-sunken": "{color.graphite.950}",
  "surface-base": "{color.graphite.925}",
  "surface-raised": "{color.graphite.850}",
  "surface-overlay": "{color.graphite.800}",
  "surface-inset": "{color.graphite.950}",
  "surface-hover": "{color.graphite.800}",
  "surface-active": "{color.graphite.750}",
  "surface-selected": "{color.violet.900}",
  "surface-inverse": "{color.graphite.100}",
  "surface-accent": "{color.violet.500}",
  "surface-accent-subtle": "{color.violet.900}",

  // Text
  "text-primary": "{color.graphite.50}",
  "text-secondary": "{color.graphite.300}",
  "text-tertiary": "{color.graphite.400}",
  "text-disabled": "{color.graphite.600}",
  "text-accent": "{color.violet.300}",
  "text-on-accent": "{color.white}",
  "text-inverse": "{color.graphite.900}",

  /**
   * Borders. `subtle` and `default` are structural: dividers, panel edges, the
   * lines that organise a page. `control` is different in kind, and that is why
   * it is a separate role rather than a reuse: it is the boundary that
   * identifies an interactive component, so it is gated at 3:1 under WCAG
   * 1.4.11 while the structural ones are not. Collapsing the two into one token
   * forces a choice between heavy dividers and inaccessible inputs.
   */
  "border-subtle": "{color.graphite.800}",
  "border-default": "{color.graphite.750}",
  "border-control": "{color.graphite.400}",
  "border-strong": "{color.graphite.500}",
  "border-accent": "{color.violet.400}",
  "border-inverse": "{color.graphite.300}",

  // Focus. One ring, everywhere, never removed.
  "focus-ring": "{color.violet.300}",
  "focus-ring-offset": "{color.graphite.925}",

  /**
   * Decisions. Three, and they are actions rather than statuses: approve,
   * decline, escalate. Escalate is deliberately neutral, because deferring a
   * case is neither a good nor a bad outcome and colouring it amber implies
   * a judgement the reviewer has not made.
   */
  "decision-approve-fg": "{color.jade.200}",
  "decision-approve-bg": "{color.jade.900}",
  "decision-approve-border": "{color.jade.700}",
  "decision-approve-solid": "{color.jade.600}",
  "decision-decline-fg": "{color.ruby.200}",
  "decision-decline-bg": "{color.ruby.900}",
  "decision-decline-border": "{color.ruby.700}",
  "decision-decline-solid": "{color.ruby.500}",
  "decision-escalate-fg": "{color.graphite.200}",
  "decision-escalate-bg": "{color.graphite.800}",
  "decision-escalate-border": "{color.graphite.500}",
  "decision-escalate-solid": "{color.graphite.600}",

  /**
   * `solid` fills a button and sits under a text label, so it is gated at 4.5:1
   * against that label. `vivid` fills a mark in a chart, where nothing sits on
   * top and the requirement is instead to be seen against the panel. Using one
   * token for both is how design systems end up with either unreadable buttons
   * or invisible chart bars.
   */
  "decision-approve-vivid": "{color.jade.300}",
  "decision-decline-vivid": "{color.ruby.400}",

  /**
   * The risk ramp, climbing R1 to R4. In dark the ramp brightens; in light it
   * deepens. Both directions are the same rule, which is that risk increases
   * *away* from the background, so the ordering reads without any colour
   * perception at all.
   *
   * `solid` is the graduated fill inside the instrument. It is deliberately not
   * gated step-against-step: a sequential ramp with 3:1 between adjacent steps
   * is not a sequential ramp, it is four categories wearing one hue. The
   * boundaries between bands are carried by tick marks and printed ranges
   * instead, which is where the contrast requirement actually belongs.
   */
  "risk-1-fg": "{color.graphite.300}",
  "risk-1-bg": "{color.graphite.800}",
  "risk-1-border": "{color.graphite.700}",
  "risk-1-solid": "{color.graphite.700}",
  "risk-2-fg": "{color.ember.200}",
  "risk-2-bg": "{color.ember.900}",
  "risk-2-border": "{color.ember.800}",
  "risk-2-solid": "{color.ember.700}",
  "risk-3-fg": "{color.ember.100}",
  "risk-3-bg": "{color.ember.800}",
  "risk-3-border": "{color.ember.600}",
  "risk-3-solid": "{color.ember.500}",
  "risk-4-fg": "{color.ember.50}",
  "risk-4-bg": "{color.ember.600}",
  "risk-4-border": "{color.ember.400}",
  "risk-4-solid": "{color.ember.300}",

  // Informational and cautionary states, for toasts and system messages only.
  "status-info-fg": "{color.violet.200}",
  "status-info-bg": "{color.violet.900}",
  "status-info-border": "{color.violet.700}",
  "status-warn-fg": "{color.ember.100}",
  "status-warn-bg": "{color.ember.800}",
  "status-warn-border": "{color.ember.600}",

  // Shape does not change with theme.
  "radius-control": "{radius.md}",
  "radius-panel": "{radius.lg}",
  "radius-inset": "{radius.sm}",
  "radius-pill": "{radius.full}",

  // Elevation does change with theme, and this is where the depth lives.
  "elevation-flat": "{shadow.none}",
  "elevation-resting": "{shadow.sm}",
  "elevation-raised": "{shadow.md}",
  "elevation-overlay": "{shadow.lg}",
  "elevation-modal": "{shadow.xl}",
  "edge-highlight": "{shadow.edgeDark}",
  "inset-well": "{shadow.wellDark}",
};

export const semanticLight: TokenMap = {
  "surface-sunken": "{color.graphite.100}",
  "surface-base": "{color.graphite.50}",
  "surface-raised": "{color.white}",
  "surface-overlay": "{color.white}",
  "surface-inset": "{color.graphite.100}",
  "surface-hover": "{color.graphite.100}",
  "surface-active": "{color.graphite.200}",
  "surface-selected": "{color.violet.50}",
  "surface-inverse": "{color.graphite.900}",
  "surface-accent": "{color.violet.600}",
  "surface-accent-subtle": "{color.violet.50}",

  "text-primary": "{color.graphite.900}",
  "text-secondary": "{color.graphite.600}",
  "text-tertiary": "{color.graphite.550}",
  "text-disabled": "{color.graphite.400}",
  "text-accent": "{color.violet.600}",
  "text-on-accent": "{color.white}",
  "text-inverse": "{color.graphite.25}",

  "border-subtle": "{color.graphite.200}",
  "border-default": "{color.graphite.300}",
  /**
   * A full step darker than its dark-theme counterpart. Graphite 400 clears 3:1
   * against white but lands at 2.85 against the near-white app background, and
   * a control that is compliant in a panel and non-compliant two pixels outside
   * it is not compliant. The step that works on the worst surface wins.
   */
  "border-control": "{color.graphite.500}",
  "border-strong": "{color.graphite.500}",
  "border-accent": "{color.violet.500}",
  "border-inverse": "{color.graphite.700}",

  "focus-ring": "{color.violet.600}",
  "focus-ring-offset": "{color.white}",

  "decision-approve-fg": "{color.jade.700}",
  "decision-approve-bg": "{color.jade.50}",
  "decision-approve-border": "{color.jade.200}",
  "decision-approve-solid": "{color.jade.600}",
  "decision-decline-fg": "{color.ruby.700}",
  "decision-decline-bg": "{color.ruby.50}",
  "decision-decline-border": "{color.ruby.200}",
  "decision-decline-solid": "{color.ruby.600}",
  "decision-escalate-fg": "{color.graphite.700}",
  "decision-escalate-bg": "{color.graphite.100}",
  "decision-escalate-border": "{color.graphite.400}",
  "decision-escalate-solid": "{color.graphite.600}",

  "decision-approve-vivid": "{color.jade.500}",
  "decision-decline-vivid": "{color.ruby.500}",

  "risk-1-fg": "{color.graphite.600}",
  "risk-1-bg": "{color.graphite.100}",
  "risk-1-border": "{color.graphite.200}",
  "risk-1-solid": "{color.graphite.200}",
  "risk-2-fg": "{color.ember.700}",
  "risk-2-bg": "{color.ember.50}",
  "risk-2-border": "{color.ember.100}",
  "risk-2-solid": "{color.ember.200}",
  "risk-3-fg": "{color.ember.800}",
  "risk-3-bg": "{color.ember.100}",
  "risk-3-border": "{color.ember.200}",
  "risk-3-solid": "{color.ember.400}",
  "risk-4-fg": "{color.ember.900}",
  "risk-4-bg": "{color.ember.200}",
  "risk-4-border": "{color.ember.400}",
  "risk-4-solid": "{color.ember.600}",

  "status-info-fg": "{color.violet.700}",
  "status-info-bg": "{color.violet.50}",
  "status-info-border": "{color.violet.200}",
  "status-warn-fg": "{color.ember.800}",
  "status-warn-bg": "{color.ember.50}",
  "status-warn-border": "{color.ember.200}",

  "radius-control": "{radius.md}",
  "radius-panel": "{radius.lg}",
  "radius-inset": "{radius.sm}",
  "radius-pill": "{radius.full}",

  "elevation-flat": "{shadow.none}",
  "elevation-resting": "{shadow.smLight}",
  "elevation-raised": "{shadow.mdLight}",
  "elevation-overlay": "{shadow.lgLight}",
  "elevation-modal": "{shadow.xlLight}",
  "edge-highlight": "{shadow.edgeLight}",
  "inset-well": "{shadow.wellLight}",
};

/* ─────────────────────────── TIER 3 · COMPONENT ───────────────────────────
 * Per-component contracts, expressed only as references into tier 2. These are
 * theme-agnostic by construction: written once, inheriting whatever the
 * semantic layer currently resolves to.
 */

export const componentTokens: TokenMap = {
  // App shell
  "shell-bg": "{surface-base}",
  "shell-rail-bg": "{surface-sunken}",
  "shell-rail-border": "{border-subtle}",
  "shell-topbar-bg": "{surface-raised}",
  "shell-topbar-border": "{border-subtle}",

  // Panel
  "panel-bg": "{surface-raised}",
  "panel-border": "{border-subtle}",
  "panel-radius": "{radius-panel}",
  "panel-shadow": "{elevation-resting}",
  "panel-edge": "{edge-highlight}",
  "panel-header-fg": "{text-secondary}",

  // Button
  "btn-radius": "{radius-control}",
  "btn-accent-bg": "{surface-accent}",
  "btn-accent-fg": "{text-on-accent}",
  "btn-quiet-fg": "{text-secondary}",
  "btn-quiet-bg-hover": "{surface-hover}",
  "btn-outline-border": "{border-control}",
  "btn-outline-fg": "{text-primary}",
  "btn-disabled-fg": "{text-disabled}",
  /**
   * A disabled button loses its fill, it does not merely dim its label.
   *
   * This was missing, and for a long time nothing showed it: a specificity bug
   * in the element reset was overriding every variant's colour, so a disabled
   * accent button rendered in the ordinary body colour and looked plausible.
   * Fixing the reset let `.vd-btn:disabled` win properly and put a disabled
   * foreground on a full-strength violet fill, which reads as broken rather
   * than as unavailable.
   *
   * WCAG exempts disabled controls from contrast, so no gate was ever going to
   * catch this. It is a design defect, not a compliance one, which is worth
   * saying: the checks find what they are shaped to find and a person still has
   * to look.
   */
  "btn-disabled-bg": "{surface-hover}",
  "btn-disabled-border": "{border-subtle}",

  // Field
  "field-bg": "{surface-inset}",
  "field-border": "{border-control}",
  "field-border-focus": "{border-accent}",
  "field-fg": "{text-primary}",
  "field-placeholder": "{text-tertiary}",
  "field-radius": "{radius-control}",
  "field-well": "{inset-well}",

  // Queue table. The reason tier 3 exists: a row has six states and none of
  // them should be spelled out at a call site.
  "row-bg": "{surface-raised}",
  "row-bg-hover": "{surface-hover}",
  "row-bg-selected": "{surface-selected}",
  "row-border": "{border-subtle}",
  "row-fg": "{text-primary}",
  "row-meta-fg": "{text-tertiary}",
  "row-marker-active": "{border-accent}",
  /**
   * A decided row recedes but stays readable, because a reviewer scrolls back
   * to check what they decided. This used to be `opacity: 0.55` on the whole
   * row, which is cheap, looks right, and quietly composited every text colour
   * in the row down with it: the merchant name landed at 2.66:1.
   *
   * Nothing in this file could catch that. The generator measures the pairs
   * declared below, and opacity is applied long after a pair is declared. Axe
   * running over the rendered DOM in Storybook is what found it, which is the
   * argument for having both checks rather than trusting either alone.
   */
  "row-decided-fg": "{text-tertiary}",
  "header-fg": "{text-tertiary}",
  "header-bg": "{surface-base}",

  /**
   * The score instrument. A recessed track with four ordinal bands, a
   * confidence span, the model's point estimate and the live policy threshold.
   * Every part is named here so the instrument can be restyled without anyone
   * reasoning about the risk ramp.
   */
  "instrument-well-bg": "{surface-inset}",
  "instrument-well-shadow": "{inset-well}",
  "instrument-band-1": "{risk-1-solid}",
  "instrument-band-2": "{risk-2-solid}",
  "instrument-band-3": "{risk-3-solid}",
  "instrument-band-4": "{risk-4-solid}",
  "instrument-marker": "{text-primary}",
  "instrument-marker-ring": "{surface-raised}",
  "instrument-confidence": "{border-strong}",
  "instrument-threshold": "{text-accent}",
  "instrument-threshold-halo": "{surface-inset}",
  "instrument-tick": "{border-strong}",
  "instrument-label-fg": "{text-tertiary}",

  // Signal rows: the evidence that produced the score.
  "signal-bg": "{surface-base}",
  "signal-border": "{border-subtle}",
  "signal-fg": "{text-primary}",
  "signal-meta-fg": "{text-secondary}",
  "signal-weight-up": "{risk-4-solid}",
  "signal-weight-down": "{decision-approve-vivid}",
  "signal-track": "{border-subtle}",

  // Decision bar
  "decision-bar-bg": "{surface-overlay}",
  "decision-bar-border": "{border-default}",
  "decision-bar-shadow": "{elevation-overlay}",
  "approve-bg": "{decision-approve-solid}",
  "approve-fg": "{text-on-accent}",
  "decline-bg": "{decision-decline-solid}",
  "decline-fg": "{text-on-accent}",
  "escalate-border": "{decision-escalate-border}",
  "escalate-fg": "{decision-escalate-fg}",

  // Undo toast
  "toast-bg": "{surface-overlay}",
  "toast-border": "{border-strong}",
  "toast-fg": "{text-primary}",
  "toast-meta-fg": "{text-secondary}",
  "toast-shadow": "{elevation-modal}",
  "toast-timer": "{text-accent}",
  /* On an overlay surface a subtle border is invisible, and a countdown track
     that cannot be seen only exists for the person who built it. */
  "toast-timer-track": "{border-strong}",

  // Shift progress. A recessed track, so it reads as cut into the top bar.
  "progress-track": "{surface-inset}",
  "progress-fill": "{surface-accent}",

  // Chips and entity links
  "chip-bg": "{surface-base}",
  "chip-border": "{border-subtle}",
  "chip-fg": "{text-secondary}",
  "chip-radius": "{radius-pill}",
  "entity-fg": "{text-accent}",
  "entity-underline": "{border-accent}",

  // Timeline
  "timeline-track": "{border-subtle}",
  "timeline-node": "{border-strong}",
  "timeline-node-active": "{surface-accent}",
  "timeline-fg": "{text-secondary}",

  // Tooltip / popover
  "tip-bg": "{surface-inverse}",
  "tip-fg": "{text-inverse}",
  "tip-shadow": "{elevation-overlay}",

  // Distribution chart on the policy screen
  "dist-bar": "{border-strong}",
  "dist-bar-caught": "{decision-decline-vivid}",
  "dist-bar-missed": "{decision-approve-vivid}",
  "dist-axis": "{border-subtle}",
  "dist-threshold": "{text-accent}",
};

/**
 * Contrast pairs the build measures and the CI gate enforces.
 *
 * This list is the reason the contrast ladder in the case study cannot lie: the
 * graphic is drawn from the generated `contrast.json`, which is computed from
 * the same source the interface renders from. If a token moves, the ratio moves,
 * and if the ratio drops below its gate the build fails before anyone sees it.
 *
 * `min` follows WCAG 2.2: 4.5 for body text, 3 for large text (18.66px bold or
 * 24px regular) and for the boundary of an interactive component.
 */
export const contrastPairs: {
  fg: string;
  bg: string;
  context: string;
  min: 3 | 4.5;
  /**
   * Measured and published, but not allowed to fail the build. Used only where
   * WCAG itself grants an exemption, and the exemption is named in `context`.
   * Recording these is deliberate: a number that cannot be hidden is more
   * honest than a pair quietly deleted from the list.
   */
  advisory?: boolean;
}[] = [
  // Text
  { fg: "text-primary", bg: "surface-base", context: "Body text on the app background", min: 4.5 },
  { fg: "text-primary", bg: "surface-raised", context: "Body text in a panel", min: 4.5 },
  { fg: "text-secondary", bg: "surface-raised", context: "Supporting text in a panel", min: 4.5 },
  { fg: "text-tertiary", bg: "surface-raised", context: "Metadata and column headers", min: 4.5 },
  { fg: "text-tertiary", bg: "surface-base", context: "Metadata on the app background", min: 4.5 },
  { fg: "text-accent", bg: "surface-raised", context: "Links and the threshold readout", min: 4.5 },
  { fg: "text-on-accent", bg: "surface-accent", context: "Label on the primary button", min: 4.5 },
  { fg: "text-inverse", bg: "surface-inverse", context: "Tooltip text", min: 4.5 },
  { fg: "text-secondary", bg: "surface-hover", context: "Row metadata under the cursor", min: 4.5 },
  { fg: "text-primary", bg: "surface-selected", context: "Selected row text", min: 4.5 },
  { fg: "row-decided-fg", bg: "surface-sunken", context: "An already-decided row in the queue rail", min: 4.5 },
  { fg: "row-meta-fg", bg: "surface-sunken", context: "Row metadata in the queue rail", min: 4.5 },
  // The decision foregrounds, used as text on a sunken surface rather than on
  // their own tinted background. Declared after axe found a `-solid` fill being
  // used as a label, which is the mistake the fg/solid split exists to prevent
  // and which no declared pair covered until now.
  { fg: "decision-approve-fg", bg: "surface-sunken", context: "Approve wording on a sunken surface", min: 4.5 },
  { fg: "decision-decline-fg", bg: "surface-sunken", context: "Decline wording on a sunken surface", min: 4.5 },

  // Interactive boundaries and focus, WCAG 1.4.11
  { fg: "border-control", bg: "surface-raised", context: "Input and outline-button boundary in a panel", min: 3 },
  { fg: "border-control", bg: "surface-base", context: "Input boundary on the app background", min: 3 },
  { fg: "decision-escalate-border", bg: "surface-raised", context: "Escalate button boundary", min: 3 },
  { fg: "focus-ring", bg: "surface-base", context: "Focus ring against the shell", min: 3 },
  { fg: "focus-ring", bg: "surface-raised", context: "Focus ring inside a panel", min: 3 },

  // Risk band labels. Colour is never the only carrier, but where a rank sits
  // on a band fill it is still text and still gated.
  { fg: "risk-1-fg", bg: "risk-1-bg", context: "Risk band R1 label", min: 4.5 },
  { fg: "risk-2-fg", bg: "risk-2-bg", context: "Risk band R2 label", min: 4.5 },
  { fg: "risk-3-fg", bg: "risk-3-bg", context: "Risk band R3 label", min: 4.5 },
  { fg: "risk-4-fg", bg: "risk-4-bg", context: "Risk band R4 label", min: 4.5 },

  /**
   * The instrument. Note what is gated and what is not.
   *
   * Gated: the marker, the threshold line and the tick marks, because those are
   * the meaningful graphical objects a reviewer has to locate, and each one is
   * measured against the well it sits in rather than against the ramp, since
   * each is drawn with a halo in the well colour for exactly that reason.
   *
   * Not gated: adjacent bands against each other. A sequential ramp cannot
   * carry 3:1 between neighbouring steps and still be sequential. The end-to-end
   * range is gated instead, which is the claim that actually matters: R1 and R4
   * are unmistakably different. Band boundaries are read from the ticks and the
   * printed ranges, not from the colour.
   */
  { fg: "instrument-marker", bg: "instrument-well-bg", context: "Score marker against the well", min: 3 },
  { fg: "instrument-threshold", bg: "instrument-well-bg", context: "Threshold line against the well", min: 3 },
  { fg: "instrument-tick", bg: "instrument-well-bg", context: "Band boundary ticks", min: 3 },
  { fg: "instrument-confidence", bg: "instrument-well-bg", context: "Confidence span against the well", min: 3 },
  { fg: "instrument-band-1", bg: "instrument-band-4", context: "Ramp range, lowest band against highest", min: 3 },

  // Decisions
  { fg: "decision-approve-fg", bg: "decision-approve-bg", context: "Approved chip", min: 4.5 },
  { fg: "decision-decline-fg", bg: "decision-decline-bg", context: "Declined chip", min: 4.5 },
  { fg: "decision-escalate-fg", bg: "decision-escalate-bg", context: "Escalated chip", min: 4.5 },
  { fg: "text-on-accent", bg: "decision-approve-solid", context: "Approve button label", min: 4.5 },
  { fg: "text-on-accent", bg: "decision-decline-solid", context: "Decline button label", min: 4.5 },
  { fg: "decision-approve-vivid", bg: "surface-raised", context: "Approve-weighted mark in a chart", min: 3 },
  { fg: "decision-decline-vivid", bg: "surface-raised", context: "Decline-weighted mark in a chart", min: 3 },

  // System messages
  { fg: "status-info-fg", bg: "status-info-bg", context: "Informational toast", min: 4.5 },
  { fg: "status-warn-fg", bg: "status-warn-bg", context: "Cautionary toast", min: 4.5 },

  // Advisory: WCAG 1.4.3 and 1.4.11 both exempt inactive controls.
  {
    fg: "text-disabled",
    bg: "surface-raised",
    context: "Disabled control label (WCAG exempts inactive components; measured anyway)",
    min: 3,
    advisory: true,
  },
];

/** Tier names, in resolution order. Used by the generator to enforce the cascade. */
export const TIERS = ["primitive", "semantic", "component"] as const;
