/**
 * The Verdict design system's own lint rules.
 *
 * Three rules, each one a constraint the case study claims out loud. They exist
 * so the claim is checkable by someone who does not believe it: run `npm run
 * lint` and the system either holds its own line or it does not.
 *
 * A design system is a set of promises about what will not happen. Written in a
 * README those promises decay, because nothing is watching. Written here they
 * fail a build.
 */
import noRawHex from "./no-raw-hex.mjs";
import noPrimitiveTokenInComponent from "./no-primitive-token-in-component.mjs";
import noHandlerOnNonInteractive from "./no-handler-on-non-interactive.mjs";

export default {
  meta: { name: "verdict", version: "1.0.0" },
  rules: {
    "no-raw-hex": noRawHex,
    "no-primitive-token-in-component": noPrimitiveTokenInComponent,
    "no-handler-on-non-interactive": noHandlerOnNonInteractive,
  },
};
