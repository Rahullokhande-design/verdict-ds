/**
 * Verdict — domain types.
 *
 * Deliberately written the way a risk analyst talks, not the way a payments
 * API serialises. `signals` rather than `features`, `band` rather than
 * `bucket_id`, `weight` rather than `shap_value`. The interface vocabulary and
 * the type vocabulary being the same thing is what stops a component from
 * quietly inventing a second name for something the user already has a word for.
 */

/** Ordinal risk, 1 (lowest) to 4 (highest). Never rendered by colour alone. */
export type RiskBand = 1 | 2 | 3 | 4;

export type Decision = "approve" | "decline" | "escalate";

export type SignalCategory =
  | "device"
  | "velocity"
  | "identity"
  | "history"
  | "geography"
  | "payment";

export interface Signal {
  id: string;
  /** Plain sentence, present tense, no jargon. This is read in about 2 seconds. */
  label: string;
  /** The specific number or fact behind the label, shown on the same row. */
  detail: string;
  /**
   * Points this signal contributed to the score. Positive pushes toward
   * decline, negative pushes toward approve. Signed on purpose: a reviewer
   * needs to see what argued *for* the customer, not only what argued against.
   */
  weight: number;
  category: SignalCategory;
}

export interface CustomerRecord {
  name: string;
  id: string;
  since: string;
  orders: number;
  disputes: number;
  lifetimeValue: number;
}

export interface CardRecord {
  brand: string;
  last4: string;
  bin: string;
  issuer: string;
  country: string;
  /** Present only when the card is new to this customer. */
  addedAgo?: string;
}

export interface DeviceRecord {
  fingerprint: string;
  platform: string;
  ip: string;
  ipCountry: string;
  firstSeen: string;
  /** Number of other customer accounts seen on this device. */
  sharedWith: number;
}

export interface TimelineEvent {
  at: string;
  label: string;
  detail?: string;
  tone?: "neutral" | "concerning" | "reassuring";
}

export interface LinkedEntity {
  kind: "device" | "card" | "email" | "address";
  label: string;
  /** How many other cases in the queue touch this same entity. */
  cases: number;
  band: RiskBand;
}

/**
 * Why this case is in front of a human.
 *
 * The score is not the only way into the queue, and pretending it is produces a
 * screen that cannot explain itself. Merchants buy rules ("look at everything
 * over three thousand"), compliance imposes them, and a watchlist hit forces
 * review no matter how calm the model is. A reviewer opening a case that scored
 * 28 needs to be told immediately that a rule pulled it in, or they will assume
 * the tool is wasting their time, and on the fourth occurrence they will start
 * clearing that whole class of case without reading it.
 */
export type FlagReason =
  | { kind: "score" }
  | { kind: "rule"; rule: string; detail: string };

export interface CaseRecord {
  id: string;
  amount: number;
  currency: string;
  merchant: string;
  merchantCategory: string;
  /** Minutes since the model flagged it. Drives queue ageing. */
  flaggedMinsAgo: number;
  /** Minutes until the authorisation expires and the decision is made for you. */
  expiresInMins: number;
  score: number;
  /**
   * The model's uncertainty, as a [low, high] span around the score. Shown
   * because a bare point estimate gets either obeyed or ignored, and both of
   * those are failures.
   */
  confidence: [number, number];
  band: RiskBand;
  flagReason: FlagReason;
  customer: CustomerRecord;
  card: CardRecord;
  device: DeviceRecord;
  signals: Signal[];
  timeline: TimelineEvent[];
  linked: LinkedEntity[];
  decision?: Decision;
}

/** Where the score threshold currently sits, and who moved it last. */
export interface Policy {
  threshold: number;
  setBy: string;
  setAt: string;
}

/** Band boundaries. Printed next to the instrument so the ramp never has to be read by colour. */
export const BAND_RANGES: Record<RiskBand, [number, number]> = {
  1: [0, 39],
  2: [40, 64],
  3: [65, 84],
  4: [85, 100],
};

export const BAND_LABELS: Record<RiskBand, string> = {
  1: "Low",
  2: "Moderate",
  3: "Elevated",
  4: "Severe",
};

export function bandFor(score: number): RiskBand {
  if (score >= 85) return 4;
  if (score >= 65) return 3;
  if (score >= 40) return 2;
  return 1;
}
