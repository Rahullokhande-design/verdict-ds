"use client";

import * as React from "react";
import { Cpu, CreditCard, Mail, MapPin } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  BAND_LABELS,
  type Decision,
  type LinkedEntity,
  type RiskBand,
  type TimelineEvent,
} from "@/lib/types";

/**
 * Verdict — tier 4 of the taxonomy: DOMAIN.
 *
 * These speak the vocabulary of risk review and are deliberately not reusable.
 * That is the point of the category rather than a shortcoming of it. A
 * `RiskBadge` that has been generalised into a `StatusChip` so a future product
 * can borrow it is a component that has forgotten it must never render a rank
 * without its number.
 */

/* ── RiskBadge ────────────────────────────────────────────────────────────── */

/**
 * Colour, rank and word, always all three.
 *
 * The rank and the label are not decoration and not redundancy for its own
 * sake. They are what makes the ramp survive a colour-blind reviewer, a
 * greyscale print and the projector in a shared ops room, which is the whole
 * argument for encoding risk ordinally in the first place.
 */
export function RiskBadge({
  band,
  compact,
  className,
}: {
  band: RiskBand;
  compact?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn("vd-risk", `vd-risk--${band}`, compact && "vd-risk--compact", className)}
    >
      <span className="vd-risk__rank">R{band}</span>
      {compact ? (
        <span className="vd-sr-only">{BAND_LABELS[band]} risk</span>
      ) : (
        <span>{BAND_LABELS[band]}</span>
      )}
    </span>
  );
}

/* ── VerdictStamp ─────────────────────────────────────────────────────────── */

const DECISION_WORD: Record<Decision, string> = {
  approve: "Approved",
  decline: "Declined",
  escalate: "Escalated",
};

/**
 * The past tense of the button that produced it. "Approve" becomes "Approved",
 * never "Success" and never "Completed". An action that changes its name
 * between the control and the confirmation makes a reviewer wonder whether
 * something else happened.
 */
export function VerdictStamp({ decision }: { decision: Decision }) {
  return (
    <span className={cn("vd-verdict-stamp", `vd-verdict-stamp--${decision}`)}>
      {DECISION_WORD[decision]}
    </span>
  );
}

export { DECISION_WORD };

/* ── EntityChip ───────────────────────────────────────────────────────────── */

const ENTITY_ICON = {
  device: Cpu,
  card: CreditCard,
  email: Mail,
  address: MapPin,
} as const;

const ENTITY_NOUN = {
  device: "device",
  card: "card",
  email: "email address",
  address: "shipping address",
} as const;

export function EntityChip({ entity }: { entity: LinkedEntity }) {
  const Icon = ENTITY_ICON[entity.kind];
  const others = entity.cases - 1;

  return (
    <button
      className="vd-chip"
      aria-label={
        `${ENTITY_NOUN[entity.kind]} ${entity.label}, ` +
        (others > 0
          ? `also on ${others} other case${others === 1 ? "" : "s"} in this queue`
          : "not seen on any other case in this queue")
      }
    >
      <Icon size={12} aria-hidden="true" />
      <span className="vd-mono">{entity.label}</span>
      {others > 0 ? (
        <span className="vd-chip__count" aria-hidden="true">
          +{others}
        </span>
      ) : null}
    </button>
  );
}

/* ── EventTimeline ────────────────────────────────────────────────────────── */

export function EventTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="vd-timeline">
      {events.map((e, i) => (
        <li
          key={`${e.at}-${i}`}
          className={cn("vd-tl", e.tone && e.tone !== "neutral" && `vd-tl--${e.tone}`)}
        >
          <span className="vd-tl__at">{e.at}</span>
          <div className="vd-tl__body">
            <p className="vd-tl__label">{e.label}</p>
            {e.detail ? <p className="vd-tl__detail">{e.detail}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
