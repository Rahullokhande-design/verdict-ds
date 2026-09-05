import type { CaseRecord, Policy, Signal } from "./types";
import { bandFor } from "./types";

/**
 * Verdict — mock queue.
 *
 * The shapes here include the ugly cases on purpose, because those are the ones
 * a handoff usually forgets: a case with almost no signal either way, one where
 * the evidence points both directions, one about to expire, one where the
 * customer is obviously legitimate and the model is obviously wrong. A dataset
 * of clean examples produces a design that only works on clean examples.
 *
 * Names, cards, devices and IPs are invented. No real cardholder data exists in
 * this repository and none is needed to design the interface.
 */

const sig = (
  id: string,
  category: Signal["category"],
  label: string,
  detail: string,
  weight: number
): Signal => ({ id, category, label, detail, weight });

export const policy: Policy = {
  threshold: 68,
  setBy: "R. Ferreira",
  setAt: "9 days ago",
};

export const cases: CaseRecord[] = [
  {
    id: "VRD-4832",
    amount: 1249.0,
    currency: "USD",
    merchant: "Northwind Audio",
    merchantCategory: "Consumer electronics",
    flaggedMinsAgo: 4,
    expiresInMins: 47,
    score: 87,
    confidence: [79, 92],
    band: 4,
    flagReason: { kind: "score" },
    customer: {
      name: "D. Ramanathan",
      id: "CUS-88213",
      since: "6 days ago",
      orders: 1,
      disputes: 0,
      lifetimeValue: 0,
    },
    card: {
      brand: "Visa",
      last4: "4417",
      bin: "414720",
      issuer: "Banco Itaú",
      country: "BR",
      addedAgo: "11 minutes ago",
    },
    device: {
      fingerprint: "d7f2·a19c·4b08",
      platform: "Windows 11 · Chrome 129",
      ip: "185.220.101.42",
      ipCountry: "RO",
      firstSeen: "11 minutes ago",
      sharedWith: 3,
    },
    signals: [
      sig("s1", "payment", "Card added 11 minutes before checkout", "First use on this account", 24),
      sig("s2", "device", "Device shared with 3 other accounts", "Two were declined in the last 48 hours", 21),
      sig("s3", "geography", "IP country does not match billing country", "Romania vs Brazil", 17),
      sig("s4", "velocity", "Fourth attempt on this merchant in 20 minutes", "Three prior attempts declined", 15),
      sig("s5", "identity", "Email domain registered this month", "mailbox created 9 days ago", 8),
      sig("s6", "history", "Shipping address matches a prior clean order", "Different customer, same building", -6),
    ],
    timeline: [
      { at: "20 min ago", label: "First attempt", detail: "Declined by issuer, code 05", tone: "concerning" },
      { at: "16 min ago", label: "Second attempt", detail: "Different card, same device", tone: "concerning" },
      { at: "11 min ago", label: "Card 4417 added", detail: "New to this account", tone: "concerning" },
      { at: "4 min ago", label: "Order placed", detail: "$1,249.00 · expedited shipping" },
      { at: "4 min ago", label: "Flagged for review", detail: "Score 87, above the 68 threshold" },
    ],
    linked: [
      { kind: "device", label: "d7f2·a19c·4b08", cases: 3, band: 4 },
      { kind: "email", label: "d.raman…@mailbox.co", cases: 2, band: 3 },
      { kind: "address", label: "Rua Aurora 118, apt 4", cases: 2, band: 2 },
    ],
  },
  {
    id: "VRD-4831",
    amount: 84.5,
    currency: "USD",
    merchant: "Fernbrook Coffee",
    merchantCategory: "Food and drink",
    flaggedMinsAgo: 9,
    expiresInMins: 92,
    score: 71,
    confidence: [52, 88],
    band: 3,
    flagReason: { kind: "score" },
    customer: {
      name: "A. Whitcombe",
      id: "CUS-10402",
      since: "2 years 4 months",
      orders: 63,
      disputes: 0,
      lifetimeValue: 4180,
    },
    card: {
      brand: "Mastercard",
      last4: "9902",
      bin: "552214",
      issuer: "Chase",
      country: "US",
    },
    device: {
      fingerprint: "b31e·77aa·0c95",
      platform: "iOS 18 · Safari",
      ip: "24.61.180.7",
      ipCountry: "US",
      firstSeen: "2 years ago",
      sharedWith: 0,
    },
    signals: [
      sig("s1", "geography", "Order placed 2,100 km from usual location", "Denver, usually Boston", 22),
      sig("s2", "velocity", "Third order today", "Usual rate is two per week", 14),
      sig("s3", "payment", "Amount is 4× this customer's average", "$84.50 vs $21.30", 11),
      sig("s4", "history", "63 orders over 2 years, no disputes", "Longest-standing 8% of customers", -19),
      sig("s5", "device", "Known device, no sharing", "Same phone for 2 years", -14),
    ],
    timeline: [
      { at: "3 days ago", label: "Travel notice not filed", detail: "Merchant does not collect these" },
      { at: "6 hrs ago", label: "Order placed", detail: "$12.40 · Boston" },
      { at: "9 min ago", label: "Order placed", detail: "$84.50 · Denver" },
      { at: "9 min ago", label: "Flagged for review", detail: "Score 71, above the 68 threshold" },
    ],
    linked: [{ kind: "card", label: "Mastercard ···· 9902", cases: 1, band: 1 }],
  },
  {
    id: "VRD-4830",
    amount: 2480.0,
    currency: "USD",
    merchant: "Halden Outfitters",
    merchantCategory: "Apparel",
    flaggedMinsAgo: 22,
    expiresInMins: 8,
    score: 79,
    confidence: [71, 85],
    band: 3,
    flagReason: { kind: "score" },
    customer: {
      name: "M. Sorensen",
      id: "CUS-77310",
      since: "3 months",
      orders: 4,
      disputes: 1,
      lifetimeValue: 610,
    },
    card: {
      brand: "Visa",
      last4: "0071",
      bin: "445612",
      issuer: "Nordea",
      country: "NO",
    },
    device: {
      fingerprint: "9c40·12de·ff31",
      platform: "macOS 15 · Chrome 129",
      ip: "51.175.22.98",
      ipCountry: "NO",
      firstSeen: "3 months ago",
      sharedWith: 1,
    },
    signals: [
      sig("s1", "history", "One chargeback in the last 90 days", "Item not received, $210", 26),
      sig("s2", "payment", "Highest order value on this account", "$2,480 vs $180 average", 19),
      sig("s3", "velocity", "Two high-value orders in 30 minutes", "Both expedited shipping", 13),
      sig("s4", "identity", "Billing and shipping names differ", "Gift order, per checkout note", 9),
      sig("s5", "geography", "IP, card and billing all agree", "All Norway", -12),
    ],
    timeline: [
      { at: "34 days ago", label: "Chargeback filed", detail: "Item not received, $210", tone: "concerning" },
      { at: "51 min ago", label: "Order placed", detail: "$1,890 · expedited" },
      { at: "22 min ago", label: "Order placed", detail: "$2,480 · expedited" },
      { at: "22 min ago", label: "Flagged for review", detail: "Score 79, above the 68 threshold" },
    ],
    linked: [
      { kind: "address", label: "Storgata 44, Oslo", cases: 2, band: 2 },
      { kind: "card", label: "Visa ···· 0071", cases: 2, band: 3 },
    ],
  },
  {
    id: "VRD-4829",
    amount: 39.99,
    currency: "USD",
    merchant: "Palegrove Books",
    merchantCategory: "Media",
    flaggedMinsAgo: 31,
    expiresInMins: 140,
    score: 69,
    confidence: [44, 91],
    band: 3,
    flagReason: { kind: "score" },
    customer: {
      name: "T. Okonkwo",
      id: "CUS-91884",
      since: "1 day",
      orders: 1,
      disputes: 0,
      lifetimeValue: 0,
    },
    card: {
      brand: "Visa",
      last4: "3318",
      bin: "402360",
      issuer: "Unknown",
      country: "—",
    },
    device: {
      fingerprint: "0a88·55b1·9e2c",
      platform: "Android 15 · Chrome",
      ip: "102.89.40.11",
      ipCountry: "NG",
      firstSeen: "1 day ago",
      sharedWith: 0,
    },
    signals: [
      sig("s1", "identity", "New account, first order", "Created yesterday", 16),
      sig("s2", "payment", "Issuer could not be identified", "BIN not in the reference table", 14),
      sig("s3", "device", "No prior history for this device", "Nothing known either way", 9),
    ],
    timeline: [
      { at: "1 day ago", label: "Account created" },
      { at: "31 min ago", label: "Order placed", detail: "$39.99 · standard shipping" },
      { at: "31 min ago", label: "Flagged for review", detail: "Score 69, just above the 68 threshold" },
    ],
    linked: [],
  },
  {
    id: "VRD-4828",
    amount: 615.0,
    currency: "USD",
    merchant: "Aldercroft Supply",
    merchantCategory: "Industrial",
    flaggedMinsAgo: 44,
    expiresInMins: 61,
    score: 92,
    confidence: [88, 96],
    band: 4,
    flagReason: { kind: "score" },
    customer: {
      name: "K. Devries",
      id: "CUS-40219",
      since: "2 hours",
      orders: 1,
      disputes: 0,
      lifetimeValue: 0,
    },
    card: {
      brand: "Visa",
      last4: "7781",
      bin: "483412",
      issuer: "Bank of Georgia",
      country: "GE",
      addedAgo: "3 minutes ago",
    },
    device: {
      fingerprint: "d7f2·a19c·4b08",
      platform: "Windows 11 · Chrome 129",
      ip: "185.220.101.42",
      ipCountry: "RO",
      firstSeen: "11 minutes ago",
      sharedWith: 3,
    },
    signals: [
      sig("s1", "device", "Same device as VRD-4832 and VRD-4826", "All flagged in the last hour", 29),
      sig("s2", "velocity", "Seventh card tried on this device today", "Six declined", 25),
      sig("s3", "identity", "Account created 2 hours ago", "No prior activity", 18),
      sig("s4", "geography", "IP country does not match card country", "Romania vs Georgia", 14),
      sig("s5", "payment", "Card added 3 minutes before checkout", "First use", 12),
    ],
    timeline: [
      { at: "2 hrs ago", label: "Account created" },
      { at: "58 min ago", label: "Six cards declined", detail: "Same device, consecutive", tone: "concerning" },
      { at: "44 min ago", label: "Order placed", detail: "$615.00" },
      { at: "44 min ago", label: "Flagged for review", detail: "Score 92, above the 68 threshold" },
    ],
    linked: [
      { kind: "device", label: "d7f2·a19c·4b08", cases: 3, band: 4 },
      { kind: "email", label: "k.devries…@mailbox.co", cases: 2, band: 4 },
    ],
  },
  {
    id: "VRD-4827",
    amount: 156.2,
    currency: "USD",
    merchant: "Verrill Garden",
    merchantCategory: "Home and garden",
    flaggedMinsAgo: 58,
    expiresInMins: 175,
    score: 66,
    confidence: [58, 74],
    band: 3,
    flagReason: {
      kind: "rule",
      rule: "New shipping address over $100",
      detail: "Merchant rule, applies to every account regardless of score",
    },
    customer: {
      name: "S. Ellery",
      id: "CUS-22087",
      since: "11 months",
      orders: 19,
      disputes: 0,
      lifetimeValue: 1840,
    },
    card: {
      brand: "Amex",
      last4: "1002",
      bin: "372890",
      issuer: "American Express",
      country: "US",
      addedAgo: "2 days ago",
    },
    device: {
      fingerprint: "4e19·b0c7·73aa",
      platform: "macOS 15 · Safari",
      ip: "72.14.201.55",
      ipCountry: "US",
      firstSeen: "11 months ago",
      sharedWith: 0,
    },
    signals: [
      sig("s1", "payment", "New card on an established account", "Added 2 days ago", 15),
      sig("s2", "identity", "Shipping address added at checkout", "First use", 12),
      sig("s3", "history", "19 orders, no disputes", "Consistent monthly pattern", -16),
      sig("s4", "device", "Known device, no sharing", "Same laptop for 11 months", -11),
    ],
    timeline: [
      { at: "2 days ago", label: "Card ···· 1002 added" },
      { at: "58 min ago", label: "Order placed", detail: "$156.20 · new shipping address" },
      { at: "58 min ago", label: "Flagged for review", detail: "Score 66, below the 68 threshold" },
    ],
    linked: [],
  },
  {
    id: "VRD-4826",
    amount: 999.0,
    currency: "USD",
    merchant: "Northwind Audio",
    merchantCategory: "Consumer electronics",
    flaggedMinsAgo: 66,
    expiresInMins: 24,
    score: 90,
    confidence: [84, 94],
    band: 4,
    flagReason: { kind: "score" },
    customer: {
      name: "J. Almeida",
      id: "CUS-88104",
      since: "1 day",
      orders: 2,
      disputes: 0,
      lifetimeValue: 0,
    },
    card: {
      brand: "Mastercard",
      last4: "6640",
      bin: "518745",
      issuer: "Itaú Unibanco",
      country: "BR",
      addedAgo: "22 minutes ago",
    },
    device: {
      fingerprint: "d7f2·a19c·4b08",
      platform: "Windows 11 · Chrome 129",
      ip: "185.220.101.42",
      ipCountry: "RO",
      firstSeen: "11 minutes ago",
      sharedWith: 3,
    },
    signals: [
      sig("s1", "device", "Same device as VRD-4832 and VRD-4828", "All flagged in the last hour", 28),
      sig("s2", "payment", "Card added 22 minutes before checkout", "First use", 20),
      sig("s3", "geography", "IP country does not match card country", "Romania vs Brazil", 17),
      sig("s4", "velocity", "Second order on this merchant in 40 minutes", "Same product category", 13),
    ],
    timeline: [
      { at: "1 day ago", label: "Account created" },
      { at: "88 min ago", label: "Card ···· 6640 added", tone: "concerning" },
      { at: "66 min ago", label: "Order placed", detail: "$999.00 · expedited shipping" },
      { at: "66 min ago", label: "Flagged for review", detail: "Score 90, above the 68 threshold" },
    ],
    linked: [
      { kind: "device", label: "d7f2·a19c·4b08", cases: 3, band: 4 },
      { kind: "address", label: "Rua Aurora 118, apt 4", cases: 2, band: 2 },
    ],
  },
  {
    id: "VRD-4825",
    amount: 22.0,
    currency: "USD",
    merchant: "Fernbrook Coffee",
    merchantCategory: "Food and drink",
    flaggedMinsAgo: 74,
    expiresInMins: 210,
    score: 41,
    confidence: [33, 49],
    band: 2,
    flagReason: {
      kind: "rule",
      rule: "Fifth order in seven days",
      detail: "Velocity rule, set by the merchant after a refund-abuse pattern",
    },
    customer: {
      name: "R. Considine",
      id: "CUS-63118",
      since: "4 years 1 month",
      orders: 212,
      disputes: 1,
      lifetimeValue: 5320,
    },
    card: {
      brand: "Visa",
      last4: "5540",
      bin: "424631",
      issuer: "Wells Fargo",
      country: "US",
    },
    device: {
      fingerprint: "aa02·6d31·118f",
      platform: "iOS 18 · Safari",
      ip: "68.32.19.204",
      ipCountry: "US",
      firstSeen: "4 years ago",
      sharedWith: 0,
    },
    signals: [
      sig("s1", "velocity", "Fifth order this week", "Usual rate is four", 8),
      sig("s2", "history", "212 orders over 4 years", "One dispute, resolved in customer's favour", -21),
      sig("s3", "device", "Known device, no sharing", "Same phone for 4 years", -15),
      sig("s4", "geography", "Everything matches the usual pattern", "Same city, same card, same device", -13),
    ],
    timeline: [
      { at: "74 min ago", label: "Order placed", detail: "$22.00 · standard" },
      { at: "74 min ago", label: "Flagged for review", detail: "Score 41, below the 68 threshold" },
    ],
    linked: [],
  },
  /**
   * The boring case, and the most instructive one in the set.
   *
   * It scores 28. The model has nothing to say and the customer is obviously
   * legitimate. It is in the queue because the merchant buys a rule that puts
   * every order over $3,000 in front of a human, which is a business decision
   * the model does not get a vote on.
   *
   * A queue design that assumes the score is the reason cannot explain this
   * screen, and a reviewer who cannot see why they are looking at something
   * learns to clear that whole class of case without reading it. The interface
   * has to be able to say "nothing here, and here is who decided you should
   * look anyway" in about five seconds.
   */
  {
    id: "VRD-4824",
    amount: 3150.0,
    currency: "USD",
    merchant: "Halden Outfitters",
    merchantCategory: "Apparel",
    flaggedMinsAgo: 12,
    expiresInMins: 118,
    score: 28,
    confidence: [21, 34],
    band: 1,
    flagReason: {
      kind: "rule",
      rule: "Order over $3,000",
      detail: "Merchant rule, every high-value order gets human eyes",
    },
    customer: {
      name: "H. Lindqvist",
      id: "CUS-01922",
      since: "5 years 8 months",
      orders: 88,
      disputes: 0,
      lifetimeValue: 21400,
    },
    card: {
      brand: "Visa",
      last4: "2214",
      bin: "445610",
      issuer: "Nordea",
      country: "NO",
    },
    device: {
      fingerprint: "5f77·3c02·8ad4",
      platform: "macOS 15 · Safari",
      ip: "51.174.88.12",
      ipCountry: "NO",
      firstSeen: "5 years ago",
      sharedWith: 0,
    },
    signals: [
      sig("s1", "payment", "Largest order this customer has placed", "$3,150 vs $340 average", 12),
      sig("s2", "history", "88 orders over 5 years, no disputes", "Top 1% of customers by tenure", -24),
      sig("s3", "device", "Same device for 5 years, no sharing", "Never seen on another account", -18),
      sig("s4", "geography", "IP, card and billing all agree", "All Norway, usual city", -15),
      sig("s5", "identity", "Shipping address used 40 times before", "Home address on file since 2021", -14),
    ],
    timeline: [
      { at: "3 weeks ago", label: "Order placed", detail: "$410.00 · same address", tone: "reassuring" },
      { at: "12 min ago", label: "Order placed", detail: "$3,150.00 · standard shipping" },
      {
        at: "12 min ago",
        label: "Held by merchant rule",
        detail: "Order over $3,000. Score was 28, well below the 68 threshold.",
      },
    ],
    linked: [],
  },
];

/** Sanity check that the hand-written bands agree with the boundaries. */
export const bandMismatches = cases.filter((c) => c.band !== bandFor(c.score));

export const openCaseId = cases[0].id;

export function findCase(id: string): CaseRecord | undefined {
  return cases.find((c) => c.id === id);
}

export function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/** "47 min" / "2 hr 20" — short enough for a table cell, exact enough to act on. */
export function formatMins(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h} hr` : `${h} hr ${m}`;
}
