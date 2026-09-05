"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { BAND_LABELS, BAND_RANGES, type RiskBand } from "@/lib/types";
import { Tooltip } from "./primitives";

/**
 * Verdict — the score instrument. Tier: PATTERN.
 *
 * The one element this product is remembered by, and the place where the
 * central design argument is made physical.
 *
 * ── What it shows, and why each part is there ──────────────────────────────
 *
 *   The ramp        Risk is ordinal and continuous, so it is a graduated fill
 *                   rather than four blocks. Four blocks would be four
 *                   categories wearing one hue.
 *
 *   The ticks       Band boundaries are carried by ticks and by the printed
 *                   ranges underneath, never by the colour transition. This is
 *                   the part held to a contrast gate, because it is the part
 *                   that carries information.
 *
 *   The marker      The model's point estimate. A blade with a diamond cap, so
 *                   it is identifiable by shape and not only by colour.
 *
 *   The span        The model's confidence interval, hatched rather than
 *                   filled so it never reads as another band. Present because a
 *                   bare point estimate is either obeyed or ignored, and both
 *                   of those are failures. Showing uncertainty is what lets a
 *                   reviewer calibrate how much to lean on the number, which is
 *                   the difference between a decision aid and an oracle.
 *
 *   The threshold   Where policy currently sits. Drawn with a halo in the well
 *                   colour so it separates from whatever part of the ramp it
 *                   lands on, which no single colour choice could guarantee.
 *
 * The whole thing is exposed to assistive technology as a single labelled
 * figure with a text summary, because a screen reader user needs the reading,
 * not the drawing.
 */

const BANDS: RiskBand[] = [1, 2, 3, 4];

/** Band boundaries as percentages, derived from the ranges so they cannot drift. */
const TICKS = BANDS.slice(1).map((b) => BAND_RANGES[b][0]);

export function ScoreInstrument({
  score,
  confidence,
  band,
  threshold,
  thresholdSetBy,
}: {
  score: number;
  confidence: [number, number];
  band: RiskBand;
  threshold: number;
  thresholdSetBy?: string;
}) {
  const [low, high] = confidence;
  const spread = high - low;
  const overThreshold = score >= threshold;

  /**
   * The sentence a screen reader gets, and the sentence a sighted reviewer
   * gets underneath the scale. Deliberately the same words: an interface that
   * says one thing visually and another in its alt text is two interfaces.
   */
  const summary =
    `Score ${score} of 100, band ${band}, ${BAND_LABELS[band].toLowerCase()}. ` +
    `The model puts the true value between ${low} and ${high}. ` +
    `The review threshold is ${threshold}, so this case is ${overThreshold ? "above" : "below"} it.`;

  return (
    <div className="vd-instrument">
      <div className="vd-instrument__readout">
        <div>
          {/* A heading rather than a label, so the instrument is a named region
              in the document outline instead of an anonymous block of graphics
              between two titled panels. */}
          <h2 className="vd-eyebrow">Model score</h2>
          <div className="vd-instrument__score">
            <span className="vd-instrument__value" aria-hidden="true">
              {score}
            </span>
            <span className="vd-instrument__of" aria-hidden="true">
              of 100
            </span>
          </div>
        </div>

        <p className="vd-instrument__confidence-note">
          {spread >= 20 ? (
            <>
              The model is <strong>not confident</strong> here. It puts the true value
              anywhere between {low} and {high}, which spans {spread} points and two
              bands. Weigh the evidence below more heavily than the number.
            </>
          ) : (
            <>
              The model is confident, placing the true value between {low} and {high}.
              That is a {spread}-point spread.
            </>
          )}
        </p>
      </div>

      {/* The scale.
       *
       * It used to carry role="img" with the summary as its aria-label, which
       * reads well and is invalid: an img is a leaf node, and this one contains
       * the focusable threshold marker. A screen reader that meets a focusable
       * control inside a graphic has no way to describe where the user is.
       *
       * So the text alternative moved out to a visually hidden paragraph, which
       * is announced in the same reading order and says the same words, and the
       * track went back to being a plain container with its decorative parts
       * hidden. The control inside it stays reachable. */}
      <p className="vd-sr-only">{summary}</p>
      <div className="vd-track">
        <div className="vd-track__ramp" aria-hidden="true" />
        <div className="vd-track__graduations" aria-hidden="true" />

        {TICKS.map((t) => (
          <div
            key={t}
            className="vd-track__tick"
            style={{ left: `${t}%` }}
            aria-hidden="true"
          />
        ))}

        <div
          className="vd-track__confidence"
          style={{ left: `${low}%`, width: `${spread}%` }}
          aria-hidden="true"
        />

        <Tooltip
          content={
            <>
              Review threshold {threshold}
              {thresholdSetBy ? <> · set by {thresholdSetBy}</> : null}
            </>
          }
        >
          <div
            className="vd-track__threshold"
            style={{ left: `${threshold}%` }}
            tabIndex={0}
            role="button"
            aria-label={`Review threshold, ${threshold}`}
          />
        </Tooltip>

        <div
          className="vd-track__marker"
          style={{ left: `calc(${score}% - 1.5px)` }}
          aria-hidden="true"
        />
      </div>

      {/* The ranges, printed. This is the row that makes the ramp readable with
          no colour perception at all. */}
      <div className="vd-scale">
        {BANDS.map((b) => {
          const [from, to] = BAND_RANGES[b];
          return (
            <div key={b} className="vd-scale__band" data-active={b === band}>
              <span className="vd-scale__rank">
                R{b}
                {b === band ? <span className="vd-sr-only"> (this case)</span> : null}
              </span>
              <span className="vd-scale__label">{BAND_LABELS[b]}</span>
              <span className="vd-scale__range">
                {from}–{to}
              </span>
            </div>
          );
        })}
      </div>

      <div className="vd-instrument__legend">
        <LegendKey kind="marker">Score, {score}</LegendKey>
        <LegendKey kind="confidence">
          Confidence, {low}–{high}
        </LegendKey>
        <LegendKey kind="threshold">Threshold, {threshold}</LegendKey>
      </div>
    </div>
  );
}

function LegendKey({
  kind,
  children,
}: {
  kind: "marker" | "confidence" | "threshold";
  children: React.ReactNode;
}) {
  return (
    <span className="vd-legend-key">
      <span
        className={cn("vd-legend-key__swatch", `vd-legend-key__swatch--${kind}`)}
        aria-hidden="true"
      />
      {children}
    </span>
  );
}
