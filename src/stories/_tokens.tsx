import * as React from "react";
import tokens from "@/lib/tokens.json";

/**
 * Reading the token file the way a consumer would.
 *
 * The Foundations pages are generated from tokens.json and contrast.json rather
 * than written, for the same reason the case study's numbers are: a page that
 * describes a token architecture in prose is a page that will describe the
 * architecture it had on the day it was written.
 *
 * This resolves aliases the way a browser resolves the cascade, one hop at a
 * time, so what a page shows is what a component would actually get.
 */

type Leaf = { $value: string; $type?: string };
type Node = Leaf | { [k: string]: Node };

export type Theme = "dark" | "light";

const isLeaf = (n: Node): n is Leaf =>
  typeof (n as Leaf)?.$value === "string";

function at(path: string): Node | undefined {
  return path
    .split(".")
    .reduce<Node | undefined>(
      (n, k) => (n ? (n as Record<string, Node>)[k] : undefined),
      tokens as unknown as Node
    );
}

/** Flatten a subtree to `[dotted.name, rawValue]`, aliases left intact. */
export function flatten(node: Node, prefix = ""): [string, string][] {
  if (isLeaf(node)) return [[prefix.replace(/\.$/, ""), node.$value]];
  return Object.entries(node).flatMap(([k, v]) => flatten(v, `${prefix}${k}.`));
}

/** How many hops a value takes before it becomes a literal, and where it lands. */
export function resolve(value: string): { hops: string[]; final: string } {
  const hops: string[] = [];
  let current = value;
  for (let i = 0; i < 8; i++) {
    const alias = current.match(/^\{([^}]+)\}$/);
    if (!alias) return { hops, final: current };
    hops.push(alias[1]);
    const node = at(alias[1]);
    if (!node || !isLeaf(node)) {
      throw new Error(`Token reference {${alias[1]}} does not resolve to a value.`);
    }
    current = node.$value;
  }
  throw new Error(`Token reference ${value} loops.`);
}

export const semantic = (theme: Theme) =>
  flatten(at(`theme.${theme}.semantic`)!);

export const component = (theme: Theme) =>
  flatten(at(`theme.${theme}.component`)!);

export const isColour = (value: string) =>
  /^#/.test(value) || /^\{primitive\.color\./.test(value);

/**
 * A colour, and nothing else.
 *
 * No text inside, deliberately. Every other way of drawing a swatch puts a
 * label on top of the colour it is demonstrating, which means a page of swatches
 * is a page of contrast pairs nobody intended to create, and half of them fail.
 * The label sits beside it, in a colour the system has already measured.
 *
 * Marked aria-hidden because the hex is written next to it as text: a screen
 * reader gets the value rather than the word "swatch" seventy-one times.
 */
export function Chip({
  value,
  size = 26,
  title,
}: {
  value: string;
  size?: number;
  title?: string;
}) {
  return (
    <span
      aria-hidden="true"
      title={title}
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: 5,
        background: value,
        border: "1px solid var(--vd-border-default)",
        flex: "none",
      }}
    />
  );
}

export const mono = "var(--vd-fontFamily-mono)";

export function PageTitle({
  kicker,
  title,
  lede,
}: {
  kicker: string;
  title: string;
  lede: React.ReactNode;
}) {
  return (
    <>
      <p
        style={{
          fontFamily: mono,
          fontSize: 12,
          letterSpacing: "0.09em",
          textTransform: "uppercase",
          color: "var(--vd-text-tertiary)",
          margin: 0,
        }}
      >
        {kicker}
      </p>
      <h1 style={{ fontSize: 26, margin: "10px 0 0", letterSpacing: "-0.01em" }}>
        {title}
      </h1>
      <p style={{ margin: "12px 0 0", maxWidth: "66ch", color: "var(--vd-text-secondary)", lineHeight: 1.6 }}>
        {lede}
      </p>
    </>
  );
}
