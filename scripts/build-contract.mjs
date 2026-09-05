/**
 * Emit the data contract this interface requires, as JSON Schema.
 *
 * ── What this is, and deliberately is not ─────────────────────────────────
 *
 * It is NOT an API design. Nobody here has designed the fraud-scoring service,
 * its auth, its pagination, its error semantics or its consistency guarantees,
 * and a hand-written OpenAPI document would be an invention dressed as a
 * deliverable.
 *
 * It IS the shape the components already consume, extracted from the
 * TypeScript they are typed against. That is a narrow, honest and genuinely
 * useful thing to hand an engineer: it says exactly what the screens need in
 * order to render, which fields are optional, which are enumerated, and where
 * a value has a meaning the UI depends on. A backend team can design whatever
 * they like on the other side of it and check their response against this.
 *
 * It is generated from src/lib/types.ts rather than written, so it cannot
 * drift from what the components actually read. If a component starts needing
 * a new field, the schema says so on the next build or the check fails.
 *
 * Usage:  node scripts/build-contract.mjs [--check]
 */
import { createGenerator } from "ts-json-schema-generator";
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src/lib/types.ts");
const OUT = join(ROOT, "src/lib/contract.schema.json");

/**
 * The root types a screen is handed. Everything else, Signal, CardRecord and
 * the rest, is pulled in as a definition because these reference it.
 */
const ROOTS = ["CaseRecord", "Policy"];

const generator = createGenerator({
  path: SRC,
  tsconfig: join(ROOT, "tsconfig.json"),
  type: "*",
  expose: "all",
  topRef: true,
  jsDoc: "extended",
  skipTypeCheck: true,
});

const schema = generator.createSchema("*");

/**
 * `type: "*"` also picks up the helper functions that live beside the types,
 * which arrive as odd `namedArgs` objects. A data contract describes data, so
 * anything the generator annotated with a function signature is dropped rather
 * than shipped as a definition somebody has to wonder about.
 */
const definitions = Object.fromEntries(
  Object.entries(schema.definitions ?? {}).filter(
    ([, def]) => !(def && typeof def === "object" && "$comment" in def && /=>/.test(def.$comment))
  )
);

/**
 * The generator emits every exported type. Narrow the top level to the two a
 * consumer actually receives, and keep the rest as definitions, so the file
 * reads as "here is a case, here is a policy" rather than as a type dump.
 */
const contract = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://bindustudio.dev/verdict/contract.schema.json",
  title: "Verdict, data contract",
  description:
    "GENERATED from src/lib/types.ts by scripts/build-contract.mjs. " +
    "The shape the Verdict interface requires in order to render, extracted from the types the " +
    "components are written against. This is not an API design: there is no auth, pagination, " +
    "error model or transport here, and none of that was designed. It states what the screens " +
    "need, so a service can be built to satisfy it and checked against it.",
  type: "object",
  properties: {
    case: { $ref: "#/definitions/CaseRecord" },
    policy: { $ref: "#/definitions/Policy" },
  },
  required: ROOTS.map((r) => (r === "CaseRecord" ? "case" : "policy")),
  definitions,
};

const json = JSON.stringify(contract, null, 2) + "\n";

if (process.argv.includes("--check")) {
  let current = "";
  try { current = readFileSync(OUT, "utf8"); } catch { current = ""; }
  if (current !== json) {
    console.error(
      "✗ src/lib/contract.schema.json is stale. Run: node scripts/build-contract.mjs"
    );
    process.exit(1);
  }
  console.log("✓ Verdict data contract is current.");
} else {
  writeFileSync(OUT, json);
  const count = Object.keys(definitions).length;
  console.log(
    `✓ Verdict data contract built\n` +
    `  → src/lib/contract.schema.json\n\n` +
    `  ${count} definitions, generated from src/lib/types.ts.`
  );
}
