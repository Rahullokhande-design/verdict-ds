import { clsx, type ClassValue } from "clsx";

/**
 * Class name joiner for the Verdict prototype.
 *
 * Note what is missing: `tailwind-merge`. Verdict is not styled with utility
 * classes. Its components emit semantic class names (`vd-btn vd-btn--accent`)
 * that resolve against the generated token cascade, so there are no conflicting
 * utilities to de-duplicate and pulling in a merge pass would be cargo.
 *
 * The reason for that choice, since it is a departure from stock shadcn: the
 * depth in this interface comes from inset shadows, edge highlights and
 * graduated fills that are painful to express as utilities and trivial to
 * express as CSS reading from custom properties. Radix still supplies behaviour
 * and CVA still supplies variants. Only the styling layer differs.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
