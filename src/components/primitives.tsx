"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

/**
 * Verdict — tier 1 of the component taxonomy: PRIMITIVES.
 *
 * The category rule, which is the whole point of having categories: a primitive
 * takes visual props only. It knows nothing about a case, a score or a
 * decision. The moment a Button understands what a decline is, every future
 * consumer of Button inherits fraud vocabulary it did not ask for.
 *
 * That is why `Button` below has an `approve` variant and not an `onApprove`
 * prop. The variant is a colour contract. The meaning lives one tier up.
 */

/* ── Button ───────────────────────────────────────────────────────────────── */

const button = cva("vd-btn", {
  variants: {
    variant: {
      accent: "vd-btn--accent",
      outline: "vd-btn--outline",
      quiet: "vd-btn--quiet",
      approve: "vd-btn--approve",
      decline: "vd-btn--decline",
      escalate: "vd-btn--escalate",
    },
    size: {
      sm: "vd-btn--sm",
      md: "vd-btn--md",
      lg: "vd-btn--lg",
    },
  },
  defaultVariants: { variant: "quiet", size: "md" },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ className, variant, size, asChild, type, ...props }, ref) {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        // A <button> inside a form defaults to submit. Defaulting it here rather
        // than at every call site is the kind of thing a design system exists for.
        type={asChild ? undefined : type ?? "button"}
        className={cn(button({ variant, size }), className)}
        {...props}
      />
    );
  }
);

/* ── Kbd ──────────────────────────────────────────────────────────────────── */

export function Kbd({
  children,
  quiet,
}: {
  children: React.ReactNode;
  quiet?: boolean;
}) {
  return <kbd className={cn("vd-kbd", quiet && "vd-kbd--quiet")}>{children}</kbd>;
}

/* ── Panel ────────────────────────────────────────────────────────────────── */

export function Panel({
  title,
  action,
  flush,
  className,
  children,
}: {
  title?: React.ReactNode;
  action?: React.ReactNode;
  flush?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("vd-panel", className)}>
      {title ? (
        <header className="vd-panel__head">
          <h2 className="vd-eyebrow">{title}</h2>
          {action}
        </header>
      ) : null}
      <div className={cn("vd-panel__body", flush && "vd-panel__body--flush")}>
        {children}
      </div>
    </section>
  );
}

/* ── Tooltip ──────────────────────────────────────────────────────────────── */

export const TooltipProvider = TooltipPrimitive.Provider;

/**
 * Radix supplies the behaviour that is tedious and easy to get wrong: the
 * hover-intent delay, dismissal on Escape, and the fact that a tooltip must be
 * reachable by keyboard focus rather than pointer alone.
 */
export function Tooltip({
  content,
  children,
  side = "top",
}: {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
}) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={6}
          collisionPadding={12}
          className="vd-tip"
        >
          {content}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}

/* ── Visually hidden ──────────────────────────────────────────────────────── */

export function SrOnly({ children }: { children: React.ReactNode }) {
  return <span className="vd-sr-only">{children}</span>;
}
