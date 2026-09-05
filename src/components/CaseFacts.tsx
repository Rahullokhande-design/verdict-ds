"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { EntityChip } from "./domain";
import type { CaseRecord } from "@/lib/types";
import { formatMoney } from "@/lib/data";

/**
 * Verdict — who is buying, on what, from where. Tier: PATTERN.
 *
 * This panel exists to kill the reviewer's most expensive habit, which is not
 * deciding but re-assembling. In the tool this replaces, the same facts live
 * across four tabs, and the analyst pays that cost on every single case.
 * Everything here is pre-joined and visible without a click.
 *
 * `tone` on a value is used sparingly and never as the only cue: each flagged
 * value also states the fact that makes it notable, so "RO" reads as
 * "RO, card issued in BR" rather than as a red string a reviewer has to
 * remember the meaning of.
 */

function Fact({
  k,
  children,
  tone,
}: {
  k: string;
  children: React.ReactNode;
  tone?: "flag" | "good";
}) {
  return (
    <div className="vd-fact">
      <dt className="vd-fact__key">{k}</dt>
      <dd className={cn("vd-fact__value", tone && `vd-fact__value--${tone}`)}>
        {children}
      </dd>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="vd-facts__group">
      <p className="vd-eyebrow vd-facts__title">{title}</p>
      <dl style={{ margin: 0 }}>{children}</dl>
    </div>
  );
}

export function CaseFacts({ record }: { record: CaseRecord }) {
  const { customer, card, device, linked } = record;
  const ipMismatch = device.ipCountry !== card.country && card.country !== "—";
  const newCustomer = customer.orders <= 1;

  return (
    <div className="vd-facts">
      <Group title="Customer">
        <Fact k="Name">{customer.name}</Fact>
        <Fact k="Account" tone={newCustomer ? "flag" : undefined}>
          {newCustomer ? `New, opened ${customer.since}` : `Open ${customer.since}`}
        </Fact>
        <Fact k="History" tone={customer.orders > 20 && customer.disputes === 0 ? "good" : undefined}>
          {customer.orders} order{customer.orders === 1 ? "" : "s"}, {customer.disputes}{" "}
          dispute{customer.disputes === 1 ? "" : "s"}
        </Fact>
        <Fact k="Spend to date">
          <span className="vd-mono">{formatMoney(customer.lifetimeValue, record.currency)}</span>
        </Fact>
      </Group>

      <Group title="Card">
        <Fact k="Number">
          <span className="vd-mono">
            {card.brand} ···· {card.last4}
          </span>
        </Fact>
        <Fact k="Issuer" tone={card.issuer === "Unknown" ? "flag" : undefined}>
          {card.issuer === "Unknown" ? "Not identified from the BIN" : card.issuer}
          {card.country !== "—" ? `, ${card.country}` : ""}
        </Fact>
        <Fact k="On file" tone={card.addedAgo ? "flag" : "good"}>
          {card.addedAgo ? `Added ${card.addedAgo}` : "Used before on this account"}
        </Fact>
      </Group>

      <Group title="Device">
        <Fact k="Fingerprint">
          <span className="vd-mono">{device.fingerprint}</span>
        </Fact>
        <Fact k="Platform">{device.platform}</Fact>
        <Fact k="Address" tone={ipMismatch ? "flag" : undefined}>
          <span className="vd-mono">{device.ip}</span>
          {"  "}
          {ipMismatch
            ? `${device.ipCountry}, card issued in ${card.country}`
            : device.ipCountry}
        </Fact>
        <Fact
          k="Shared"
          tone={device.sharedWith > 0 ? "flag" : "good"}
        >
          {device.sharedWith > 0
            ? `${device.sharedWith} other account${device.sharedWith === 1 ? "" : "s"}`
            : "No other accounts"}
        </Fact>
      </Group>

      {linked.length > 0 ? (
        <div className="vd-facts__group">
          <p className="vd-eyebrow vd-facts__title">Also in this queue</p>
          <div className="vd-chips">
            {linked.map((e) => (
              <EntityChip key={`${e.kind}-${e.label}`} entity={e} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
