/**
 * Validate the fixtures against the published contract.
 *
 * A schema nothing is checked against is a document, not a contract. This runs
 * every case and the policy object the prototype actually renders through the
 * generated schema, so the file handed to a backend team is known to describe
 * data that really drives the interface rather than data assumed to drive it.
 *
 * It also closes the loop the other way. If a component starts reading a field
 * the types do not declare, or the fixtures drift from the types, this fails
 * before anyone builds against a contract that was never true.
 */
import Ajv2020 from "ajv/dist/2020.js";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const schema = JSON.parse(
  readFileSync(join(ROOT, "src/lib/contract.schema.json"), "utf8")
);

/**
 * The fixtures are TypeScript, so this script runs under tsx and imports them.
 *
 * The token generator gets away with reading its source as text, because that
 * file is deliberately four plain literals with no imports. The fixtures are
 * not: they use helper functions to build signals, and a text-and-eval approach
 * silently produced an empty array here, which the validator then reported as a
 * pass. Importing the real module is both simpler and the only version that
 * validates what the components actually receive.
 *
 * Run with:  npx tsx scripts/check-contract.mjs
 */
const { cases, policy } = await import(
  pathToFileURL(join(ROOT, "src/lib/data.ts")).href
);

// A validator that runs against nothing reports success. Guard the guard.
if (!Array.isArray(cases) || cases.length === 0) {
  console.error("✗ No cases were read from src/lib/data.ts. Refusing to pass on an empty set.");
  process.exit(1);
}
if (!policy || typeof policy !== "object") {
  console.error("✗ No policy object was read from src/lib/data.ts.");
  process.exit(1);
}

// Register the contract once under its own $id, then validate against each root
// by reference. Compiling two copies of a schema that carries an $id is what
// Ajv is objecting to, and it is right to.
const ajv = new Ajv2020({ allErrors: true, strict: false });
ajv.addSchema(schema);

const ref = (name) =>
  ajv.compile({ $ref: `${schema.$id}#/definitions/${name}` });

const validateCase = ref("CaseRecord");
const validatePolicy = ref("Policy");

let failures = 0;

for (const c of cases) {
  if (!validateCase(c)) {
    failures++;
    console.error(`✗ case ${c.id ?? "(no id)"} does not satisfy the contract:`);
    for (const e of validateCase.errors ?? []) {
      console.error(`    ${e.instancePath || "/"} ${e.message}`);
    }
  }
}

if (!validatePolicy(policy)) {
  failures++;
  console.error("✗ policy does not satisfy the contract:");
  for (const e of validatePolicy.errors ?? []) {
    console.error(`    ${e.instancePath || "/"} ${e.message}`);
  }
}

if (failures) {
  console.error(`\n${failures} fixture(s) failed the contract.`);
  process.exit(1);
}

console.log(
  `✓ Contract holds: ${cases.length} cases and the policy object all validate ` +
  `against src/lib/contract.schema.json.`
);
