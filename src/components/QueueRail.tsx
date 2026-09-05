"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { RiskBadge } from "./domain";
import { formatMins, formatMoney } from "@/lib/data";
import type { CaseRecord } from "@/lib/types";

/**
 * Verdict — the queue rail. Tier: COMPOUND.
 *
 * Ordering is by expiry, not by score. That is the single most consequential
 * decision in this component and it goes against the obvious one.
 *
 * Sorting the riskiest cases to the top optimises for the model. Sorting by the
 * time left before the authorisation lapses optimises for the only outcome that
 * cannot be recovered: a case nobody decided. A high-risk case with two hours
 * left can wait. A moderate case with eight minutes cannot.
 *
 * Rendered as a listbox rather than a list of links, because a reviewer moves
 * through it with the arrow keys hundreds of times a shift and browser
 * find-in-page is not the interaction being optimised.
 */

export function QueueRail({
  cases,
  activeId,
  onSelect,
}: {
  cases: CaseRecord[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const listRef = React.useRef<HTMLUListElement>(null);
  const open = cases.filter((c) => !c.decision);

  /** Roving arrow-key movement, the way any real worklist behaves. */
  function onKeyDown(e: React.KeyboardEvent<HTMLUListElement>) {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const i = cases.findIndex((c) => c.id === activeId);
    const next = e.key === "ArrowDown" ? i + 1 : i - 1;
    if (next < 0 || next >= cases.length) return;
    onSelect(cases[next].id);
    const el = listRef.current?.querySelectorAll<HTMLElement>("[data-case-row]")[next];
    el?.scrollIntoView({ block: "nearest" });
  }

  return (
    <aside className="vd-rail" aria-label="Review queue">
      <div className="vd-rail__head">
        <p className="vd-eyebrow">Queue · by time left</p>
        <span className="vd-mono" style={{ fontSize: "var(--vd-fontSize-xs)" }}>
          {open.length}
        </span>
      </div>

      <ul
        ref={listRef}
        className="vd-rail__list"
        role="listbox"
        aria-label="Cases awaiting a decision"
        /* Only point at a row that exists. An empty queue is a real state, it
           happens at the end of every shift, and it used to render
           aria-activedescendant="vd-case-", which names nothing. A screen
           reader follows that pointer into an element that is not there. */
        aria-activedescendant={
          cases.some((c) => c.id === activeId) ? `vd-case-${activeId}` : undefined
        }
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        {cases.map((c) => {
          const urgent = c.expiresInMins <= 15;
          const isActive = c.id === activeId;
          return (
            /* role="presentation" removes the wrapper from the accessibility
               tree, so the listbox's children are the option buttons rather
               than the list items. A listbox containing li elements is a
               listbox with no options as far as a screen reader is concerned. */
            <li key={c.id} role="presentation">
              <button
                data-case-row
                id={`vd-case-${c.id}`}
                role="option"
                aria-selected={isActive}
                aria-current={isActive}
                tabIndex={-1}
                onClick={() => onSelect(c.id)}
                className={cn("vd-case-row", c.decision && "vd-case-row--decided")}
              >
                <span className="vd-case-row__id vd-mono">{c.id}</span>
                <span className="vd-case-row__amount vd-mono">
                  {formatMoney(c.amount, c.currency)}
                </span>

                <span className="vd-case-row__meta">
                  <span className="vd-case-row__merchant">{c.merchant}</span>
                </span>

                <span className="vd-case-row__right">
                  <span
                    className="vd-case-row__meta vd-mono"
                    style={urgent ? { color: "var(--vd-decision-decline-fg)" } : undefined}
                  >
                    {c.decision ? "decided" : formatMins(c.expiresInMins)}
                  </span>
                  <RiskBadge band={c.band} compact />
                </span>

                <span className="vd-sr-only">
                  {formatMoney(c.amount, c.currency)} at {c.merchant}.{" "}
                  {c.decision
                    ? `Already ${c.decision}d.`
                    : `${formatMins(c.expiresInMins)} before the authorisation expires.`}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
