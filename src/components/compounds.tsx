"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Verdict — tier 2 of the taxonomy: COMPOUNDS.
 *
 * A compound accepts data shapes but carries no business meaning. `Checkbox`
 * knows about checked, indeterminate and disabled. It does not know that the
 * row it sits in is a payment, and it never will, because the moment it does it
 * stops being reusable and belongs one tier down in DOMAIN.
 *
 * Radix supplies the behaviour underneath both of these. The indeterminate
 * state, the space-key handling, the roving focus in a toggle group and the
 * correct ARIA are all things that are cheap to get subtly wrong by hand and
 * expensive to discover in an audit.
 */

/* ── Checkbox ─────────────────────────────────────────────────────────────── */

export function Checkbox({
  checked,
  onCheckedChange,
  label,
  disabled,
}: {
  checked: boolean | "indeterminate";
  onCheckedChange: (v: boolean) => void;
  /** Always required. A checkbox whose only label is the row beside it is a
      checkbox a screen reader announces as "checkbox, unchecked". */
  label: string;
  disabled?: boolean;
}) {
  return (
    <CheckboxPrimitive.Root
      checked={checked}
      onCheckedChange={(v) => onCheckedChange(v === true)}
      disabled={disabled}
      aria-label={label}
      className="vd-checkbox"
    >
      <CheckboxPrimitive.Indicator className="vd-checkbox__mark">
        {checked === "indeterminate" ? <Minus size={11} /> : <Check size={11} />}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

/* ── Segmented control ────────────────────────────────────────────────────── */

export function Segmented<T extends string>({
  value,
  onValueChange,
  options,
  label,
}: {
  value: T;
  onValueChange: (v: T) => void;
  options: { value: T; label: string }[];
  label: string;
}) {
  return (
    <ToggleGroupPrimitive.Root
      type="single"
      value={value}
      onValueChange={(v) => v && onValueChange(v as T)}
      aria-label={label}
      className="vd-segmented"
    >
      {options.map((o) => (
        <ToggleGroupPrimitive.Item
          key={o.value}
          value={o.value}
          className="vd-segmented__item"
        >
          {o.label}
        </ToggleGroupPrimitive.Item>
      ))}
    </ToggleGroupPrimitive.Root>
  );
}

/* ── Filter pill ──────────────────────────────────────────────────────────── */

export function FilterPill({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn("vd-filter", active && "vd-filter--on")}
    >
      {children}
      {count !== undefined ? (
        <span className="vd-filter__count vd-mono">{count}</span>
      ) : null}
    </button>
  );
}

/* ── Sortable column header ───────────────────────────────────────────────── */

export function SortHeader({
  label,
  active,
  direction,
  onClick,
  align = "left",
}: {
  label: string;
  active: boolean;
  direction: "asc" | "desc";
  onClick: () => void;
  align?: "left" | "right";
}) {
  return (
    <th
      scope="col"
      // aria-sort is what tells a screen reader the table is sorted and how.
      // Without it the arrow glyph is decoration only sighted users can read.
      aria-sort={active ? (direction === "asc" ? "ascending" : "descending") : "none"}
      style={{ textAlign: align }}
    >
      <button type="button" onClick={onClick} className="vd-sort">
        {label}
        <span className={cn("vd-sort__arrow", active && "vd-sort__arrow--on")} aria-hidden="true">
          {active ? (direction === "asc" ? "▲" : "▼") : "↕"}
        </span>
      </button>
    </th>
  );
}
