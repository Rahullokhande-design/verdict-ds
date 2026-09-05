/**
 * Verdict — the distribution behind the threshold screen.
 *
 * A week of scored transactions, split by what they turned out to be. This is
 * the data a risk manager has never been shown: they set a threshold, and the
 * consequences arrive a month later as a chargeback report and a queue backlog
 * that nobody connects back to the number they moved.
 *
 * The shape is deliberately the realistic one, which is the whole problem.
 * Legitimate transactions pile up at the low end and fraud piles up at the high
 * end, but the two distributions OVERLAP in the middle. There is no threshold
 * that catches all the fraud and troubles none of the customers. Every position
 * is a trade, and the screen exists to make the reviewer look at it.
 */

export interface Bucket {
  /** Lower bound of a 5-point score bucket. */
  from: number;
  /** Transactions that turned out to be legitimate. */
  legit: number;
  /** Transactions confirmed as fraud. */
  fraud: number;
}

export const distribution: Bucket[] = [
  { from: 0, legit: 18200, fraud: 1 },
  { from: 5, legit: 21400, fraud: 2 },
  { from: 10, legit: 19800, fraud: 3 },
  { from: 15, legit: 16100, fraud: 5 },
  { from: 20, legit: 12400, fraud: 8 },
  { from: 25, legit: 9300, fraud: 12 },
  { from: 30, legit: 6900, fraud: 18 },
  { from: 35, legit: 4800, fraud: 26 },
  { from: 40, legit: 3400, fraud: 34 },
  { from: 45, legit: 2350, fraud: 42 },
  { from: 50, legit: 1620, fraud: 51 },
  { from: 55, legit: 1100, fraud: 60 },
  { from: 60, legit: 760, fraud: 68 },
  { from: 65, legit: 510, fraud: 74 },
  { from: 70, legit: 340, fraud: 79 },
  { from: 75, legit: 225, fraud: 82 },
  { from: 80, legit: 148, fraud: 84 },
  { from: 85, legit: 96, fraud: 88 },
  { from: 90, legit: 61, fraud: 94 },
  { from: 95, legit: 38, fraud: 109 },
];

export const BUCKET_WIDTH = 5;

/** Seconds a reviewer spends on a median case. Used to price a threshold in hours. */
export const SECONDS_PER_CASE = 45;

/** Average value of a fraudulent transaction that gets through, in USD. */
export const AVG_FRAUD_VALUE = 214;

export interface Projection {
  threshold: number;
  /** Sent to a human. */
  reviewed: number;
  /** Fraud that lands in the queue, so a reviewer gets the chance to stop it. */
  fraudCaught: number;
  /** Fraud that sails through without anyone looking. */
  fraudMissed: number;
  /** Good customers pulled into review for nothing. */
  falsePositives: number;
  /** Share of the queue that is not fraud. */
  falsePositiveRate: number;
  /** Share of all fraud that reaches a reviewer. */
  catchRate: number;
  reviewHours: number;
  /** Value of the fraud that gets through, at the average fraudulent amount. */
  lossesLetThrough: number;
}

/**
 * Project the week at a given threshold.
 *
 * Buckets are five points wide and the threshold is a single integer, so the
 * bucket the threshold falls inside is split proportionally rather than counted
 * whole. Rounding a partial bucket up or down would move the projection by
 * hundreds of cases and make the slider feel like it was lying.
 */
export function project(threshold: number): Projection {
  let reviewed = 0;
  let fraudCaught = 0;
  let falsePositives = 0;
  let fraudTotal = 0;

  for (const b of distribution) {
    fraudTotal += b.fraud;
    const top = b.from + BUCKET_WIDTH;

    let share: number;
    if (threshold <= b.from) share = 1;
    else if (threshold >= top) share = 0;
    else share = (top - threshold) / BUCKET_WIDTH;

    reviewed += (b.legit + b.fraud) * share;
    fraudCaught += b.fraud * share;
    falsePositives += b.legit * share;
  }

  const fraudMissed = fraudTotal - fraudCaught;

  return {
    threshold,
    reviewed: Math.round(reviewed),
    fraudCaught: Math.round(fraudCaught),
    fraudMissed: Math.round(fraudMissed),
    falsePositives: Math.round(falsePositives),
    falsePositiveRate: reviewed > 0 ? falsePositives / reviewed : 0,
    catchRate: fraudTotal > 0 ? fraudCaught / fraudTotal : 0,
    reviewHours: Math.round((reviewed * SECONDS_PER_CASE) / 3600),
    lossesLetThrough: Math.round(fraudMissed * AVG_FRAUD_VALUE),
  };
}

export const totals = {
  transactions: distribution.reduce((n, b) => n + b.legit + b.fraud, 0),
  fraud: distribution.reduce((n, b) => n + b.fraud, 0),
};

/** Tallest single bar in the chart, used to scale it. */
export const peakBucket = Math.max(...distribution.map((b) => b.legit + b.fraud));

export function formatCount(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}
