"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import type { Signal } from "@/lib/types";

/**
 * Verdict — tier 3 of the taxonomy: PATTERN.
 *
 * The evidence that produced the score, as signed contributions on a shared
 * centre line.
 *
 * Three decisions worth stating, because each one is a rejection of the
 * obvious version:
 *
 *  1. Signals that argue FOR the customer are shown, at the same size and in
 *     the same list as the ones that argue against. The obvious version shows
 *     only the reasons a case was flagged, which quietly turns a decision aid
 *     into a prosecution.
 *
 *  2. Direction is carried by position on the centre line, not by colour. A
 *     bar to the left is exculpatory, a bar to the right is incriminating, and
 *     that reads with no colour perception at all.
 *
 *  3. The list is ordered by absolute weight rather than by sign, so a reviewer
 *     working top-down meets the strongest argument first regardless of which
 *     way it points. Sorting the incriminating ones to the top would put a
 *     thumb on the scale.
 */

const MAX_WEIGHT = 30;

export function SignalList({ signals }: { signals: Signal[] }) {
  const ordered = React.useMemo(
    () => [...signals].sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight)),
    [signals]
  );

  const up = signals.filter((s) => s.weight > 0);
  const down = signals.filter((s) => s.weight < 0);
  const upTotal = up.reduce((n, s) => n + s.weight, 0);
  const downTotal = down.reduce((n, s) => n + s.weight, 0);

  return (
    <>
      <ul className="vd-signals">
        {ordered.map((s) => {
          const positive = s.weight > 0;
          const pct = Math.min(Math.abs(s.weight) / MAX_WEIGHT, 1) * 50;
          return (
            <li key={s.id} className="vd-signal">
              <div
                className="vd-signal__gauge"
                role="img"
                aria-label={
                  positive
                    ? `Adds ${s.weight} points toward decline`
                    : `Removes ${Math.abs(s.weight)} points, arguing for the customer`
                }
              >
                <span
                  className={cn(
                    "vd-signal__fill",
                    positive ? "vd-signal__fill--up" : "vd-signal__fill--down"
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div>
                <p className="vd-signal__label">{s.label}</p>
                <p className="vd-signal__detail">
                  <span className="vd-signal__cat">{s.category}</span>
                  {"  "}
                  {s.detail}
                </p>
              </div>

              <span
                className={cn(
                  "vd-signal__weight",
                  positive ? "vd-signal__weight--up" : "vd-signal__weight--down"
                )}
                aria-hidden="true"
              >
                {positive ? "+" : "−"}
                {Math.abs(s.weight)}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="vd-signals__foot">
        <span>
          {up.length} signal{up.length === 1 ? "" : "s"} argued for declining,{" "}
          {down.length} argued for the customer.
        </span>
        <span className="vd-mono" aria-hidden="true">
          +{upTotal} / {downTotal}
        </span>
      </div>
    </>
  );
}
