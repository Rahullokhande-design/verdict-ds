import * as React from "react";

/**
 * Layout helpers shared by the stories.
 *
 * Deliberately plain and deliberately unstyled by Verdict's own classes. A
 * harness that borrows the system it is displaying makes it impossible to tell
 * which part you are looking at.
 */

export function Row({
  children,
  align = "center",
}: {
  children: React.ReactNode;
  align?: "center" | "start" | "stretch";
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: align,
        flexWrap: "wrap",
      }}
    >
      {children}
    </div>
  );
}

export function Stack({
  children,
  gap = 16,
  width,
}: {
  children: React.ReactNode;
  gap?: number;
  width?: number | string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap, width }}>
      {children}
    </div>
  );
}

/** A labelled state. The label is what turns a page of components into a matrix. */
export function State({
  name,
  note,
  children,
}: {
  name: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div
        style={{
          fontSize: 11,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--vd-text-tertiary)",
          fontFamily: "var(--vd-fontFamily-mono)",
        }}
      >
        {name}
        {note ? (
          /* No opacity here. It was 0.75, which composited a token that passes
             at 5.93:1 down to 3.85:1 against the same background, and axe
             measured the composite rather than the declaration. A colour that
             passes only until someone fades it is a colour that has not really
             passed, which is a fair thing for a harness to have learned the
             hard way about its own labels. */
          <span style={{ textTransform: "none", letterSpacing: 0 }}>
            {"  "}
            {note}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

/** A grid of labelled states, which is the shape most of these stories take. */
export function Matrix({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: 28,
        alignItems: "start",
      }}
    >
      {children}
    </div>
  );
}
