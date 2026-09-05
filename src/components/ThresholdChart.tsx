"use client";

import * as React from "react";
import {
  BUCKET_WIDTH,
  distribution,
  formatCount,
  peakBucket,
} from "@/lib/policy-data";

/**
 * Verdict — the score distribution, with the threshold on it. Tier: PATTERN.
 *
 * The point of the chart is the overlap. Legitimate transactions pile up on the
 * left and fraud piles up on the right, and in the middle they sit on top of
 * each other. That region is the entire job: there is no threshold that catches
 * all the fraud and troubles none of the customers, so the manager is choosing
 * a trade rather than finding an answer.
 *
 * Encoding decisions:
 *
 *  · A log scale on the vertical, stated on the axis, because legitimate
 *    volume is roughly two hundred times fraud volume and a linear scale draws
 *    fraud as an invisible smear along the baseline. Log scales are a liability
 *    when a reader does not expect one, so the axis says so in words rather
 *    than assuming the shape is self-explanatory.
 *
 *  · Fraud is drawn in front and legitimate behind, both at partial opacity,
 *    rather than stacked. Stacking would make the fraud bar's height depend on
 *    the legitimate bar under it, which is exactly the comparison being made.
 *
 *  · The area to the right of the threshold is tinted as one region, because
 *    "everything above this line goes to a human" is the sentence the chart
 *    exists to make visible.
 */

const H = 168;
const LOG_MAX = Math.log10(peakBucket + 1);

function scale(v: number): number {
  if (v <= 0) return 0;
  return (Math.log10(v + 1) / LOG_MAX) * H;
}

export function ThresholdChart({ threshold }: { threshold: number }) {
  const barW = 100 / distribution.length;

  return (
    <figure className="vd-chart">
      <div className="vd-chart__plot" aria-hidden="true">
        {/* Reviewed region: everything at or above the threshold. */}
        <div className="vd-chart__region" style={{ left: `${threshold}%` }} />

        <svg
          className="vd-chart__svg"
          viewBox={`0 0 100 ${H}`}
          preserveAspectRatio="none"
          role="presentation"
        >
          {distribution.map((b, i) => {
            const x = i * barW;
            const legitH = scale(b.legit);
            const fraudH = scale(b.fraud);
            return (
              <g key={b.from}>
                <rect
                  x={x + barW * 0.12}
                  y={H - legitH}
                  width={barW * 0.76}
                  height={legitH}
                  className="vd-chart__legit"
                />
                <rect
                  x={x + barW * 0.28}
                  y={H - fraudH}
                  width={barW * 0.44}
                  height={fraudH}
                  className="vd-chart__fraud"
                />
              </g>
            );
          })}
        </svg>

        <div className="vd-chart__threshold" style={{ left: `${threshold}%` }} />
      </div>

      <div className="vd-chart__axis" aria-hidden="true">
        {[0, 20, 40, 60, 80, 100].map((t) => (
          <span key={t} className="vd-chart__tick" style={{ left: `${t}%` }}>
            {t}
          </span>
        ))}
      </div>

      <figcaption className="vd-chart__caption">
        <span className="vd-chart__legend">
          <span className="vd-chart__key vd-chart__key--legit" /> Legitimate
        </span>
        <span className="vd-chart__legend">
          <span className="vd-chart__key vd-chart__key--fraud" /> Confirmed fraud
        </span>
        <span className="vd-chart__legend">
          <span className="vd-chart__key vd-chart__key--region" /> Sent to review
        </span>
        <span className="vd-chart__note">
          Bars are {BUCKET_WIDTH}-point buckets on a logarithmic count scale, so{" "}
          {formatCount(peakBucket)} and 100 both fit.
        </span>
      </figcaption>
    </figure>
  );
}
