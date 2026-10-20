import Ajv2020 from "ajv/dist/2020.js";
import { readFileSync } from "node:fs";
const read = (p) =>
  JSON.parse(
    readFileSync(new URL(`../docs/spec/vn63/${p}`, import.meta.url), "utf8"),
  );
const pack = read("base_v1/examples/events.sample.json"),
  schema = read("base_v1/schemas/events.sample.schema.json");
const validate = new Ajv2020({ strict: false }).compile(schema);
if (!validate(pack)) throw new Error(JSON.stringify(validate.errors));
const provinces = read("base_v1/data/province_63_2024.json").provinces;
if (provinces.length !== 63 || new Set(provinces.map((p) => p.id)).size !== 63)
  throw new Error("Province IDs");
for (const event of pack.events)
  for (const choice of event.choices) {
    const groups = {};
    for (const o of choice.outcomes) {
      const key = o.whenHidden?.identity ?? "ANY";
      groups[key] = (groups[key] ?? 0) + o.weight;
    }
    if (Object.values(groups).some((v) => Math.abs(v - 1) > 1e-8))
      throw new Error("Outcome weights");
  }
const cfg = read("data/monthly_config.example.json");
if (
  cfg.simulationStep !== "calendar_month" ||
  !cfg.autoAdvance.simulateEverySkippedMonth ||
  !cfg.autoAdvance.stopOnCriticalDecision
)
  throw new Error("Monthly config");
console.log(
  `PASS Draft 2020-12 schema, ${pack.events.length} source demo events, 63 unique provinces, outcome weights, monthly config. Runtime checks run separately with npm test.`,
);
