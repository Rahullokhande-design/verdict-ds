"use client";

import * as React from "react";
import { Check, ChevronsUp, X } from "lucide-react";
import { Button, Kbd } from "./primitives";
import type { Decision } from "@/lib/types";

/**
 * Verdict — the decision bar and its undo. Tier: PATTERN.
 *
 * ── The one decision this whole prototype is built around ──────────────────
 *
 * There is no confirmation dialog. A decision commits immediately and can be
 * taken back for six seconds.
 *
 * The obvious design is a modal asking "Decline this transaction?" on every
 * destructive action. It fails for a reason that is well established and easy
 * to observe on any ops floor: a confirmation a person sees three hundred times
 * a shift stops being read. It trains dismissal. The dialog then provides no
 * protection at all while costing a keystroke and a context switch on every
 * single case, which is precisely the friction that makes reviewers hesitate
 * and slows the queue down.
 *
 * Undo is strictly better here because the action is genuinely reversible
 * inside the window: the authorisation has not been released to the issuer yet.
 * Where an action is NOT reversible, this pattern would be the wrong one, and
 * the policy screen deliberately uses staged confirmation instead. Two
 * different answers because they are two different questions.
 *
 * ── Keyboard ──────────────────────────────────────────────────────────────
 *
 * A, D and E are bound globally while a case is open, because the reviewer's
 * hands should never need the mouse. The shortcut is printed on the control
 * rather than hidden in a help panel, so it is learnable by use.
 */

export const UNDO_WINDOW_MS = 6000;

export function DecisionBar({
  onDecide,
  disabled,
}: {
  onDecide: (d: Decision) => void;
  disabled?: boolean;
}) {
  return (
    <div className="vd-decision-bar">
      <p className="vd-decision-bar__hint">
        Decisions commit straight away. You get six seconds to take one back.
      </p>

      <Button variant="escalate" size="lg" onClick={() => onDecide("escalate")} disabled={disabled}>
        <ChevronsUp size={15} aria-hidden="true" />
        Escalate
        <Kbd quiet>E</Kbd>
      </Button>

      <Button variant="decline" size="lg" onClick={() => onDecide("decline")} disabled={disabled}>
        <X size={15} aria-hidden="true" />
        Decline
        <Kbd>D</Kbd>
      </Button>

      <Button variant="approve" size="lg" onClick={() => onDecide("approve")} disabled={disabled}>
        <Check size={15} aria-hidden="true" />
        Approve
        <Kbd>A</Kbd>
      </Button>
    </div>
  );
}

/* ── Undo toast ───────────────────────────────────────────────────────────── */

const DECISION_PAST: Record<Decision, string> = {
  approve: "Approved",
  decline: "Declined",
  escalate: "Escalated",
};

export function UndoToast({
  decision,
  caseId,
  amount,
  onUndo,
  onExpire,
}: {
  decision: Decision;
  caseId: string;
  amount: string;
  onUndo: () => void;
  onExpire: () => void;
}) {
  const [remaining, setRemaining] = React.useState(UNDO_WINDOW_MS);
  const expireRef = React.useRef(onExpire);
  expireRef.current = onExpire;

  React.useEffect(() => {
    const started = Date.now();
    const tick = window.setInterval(() => {
      const left = Math.max(0, UNDO_WINDOW_MS - (Date.now() - started));
      setRemaining(left);
      if (left === 0) {
        window.clearInterval(tick);
        expireRef.current();
      }
    }, 100);
    return () => window.clearInterval(tick);
  }, [caseId, decision]);

  const r = 9;
  const circumference = 2 * Math.PI * r;
  const progress = remaining / UNDO_WINDOW_MS;

  return (
    <div
      className="vd-toast"
      // "status" rather than "alert": this is the confirmation of something the
      // reviewer just did on purpose, and an assertive live region would
      // interrupt the screen reader mid-sentence three hundred times a shift.
      role="status"
      aria-live="polite"
    >
      <div
        className="vd-toast__timer"
        aria-hidden="true"
        title={`${Math.ceil(remaining / 1000)} seconds left to undo`}
      >
        <svg width="22" height="22" viewBox="0 0 22 22">
          <circle className="vd-toast__timer-track" cx="11" cy="11" r={r} />
          <circle
            className="vd-toast__timer-fill"
            cx="11"
            cy="11"
            r={r}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
          />
        </svg>
      </div>

      <div className="vd-toast__text">
        <p>
          {DECISION_PAST[decision]} {caseId}
        </p>
        <p className="vd-toast__meta">
          {amount} · {Math.ceil(remaining / 1000)}s to undo
        </p>
      </div>

      <Button variant="outline" size="sm" onClick={onUndo}>
        Undo
        <Kbd quiet>Z</Kbd>
      </Button>
    </div>
  );
}
