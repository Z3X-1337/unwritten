import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_EVIDENCE_SOURCES,
  buildUnwrittenRun,
  mineMissingRuleLocally
} from "../src/core.mjs";
import { bundleStaticHtml } from "../src/static-build.mjs";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const candidate = {
  rule: mineMissingRuleLocally(DEFAULT_EVIDENCE_SOURCES),
  mode: "demo",
  model: "deterministic-evidence-compiler",
  note: "Static judge demo: evidence-grounded deterministic fixture, no API key required."
};
const completeRun = await buildUnwrittenRun({ evidenceSources: DEFAULT_EVIDENCE_SOURCES, compilerResult: candidate });
const run = {
  product: completeRun.product,
  runId: completeRun.runId,
  status: completeRun.status,
  compiler: completeRun.compiler,
  candidateRule: completeRun.candidateRule,
  approvedRule: { approval: completeRun.approvedRule.approval },
  policy: completeRun.policy,
  witness: {
    steps: completeRun.witness.steps,
    exploredStates: completeRun.witness.exploredStates
  },
  vulnerable: {
    finalState: completeRun.vulnerable.finalState,
    sideEffectReceipt: completeRun.vulnerable.sideEffectReceipt
  },
  guard: {
    diff: completeRun.guard.diff,
    sourceAgentsModified: completeRun.guard.sourceAgentsModified
  },
  replay: {
    cases: completeRun.replay.cases.map(({ id, title, expected, pass, outcome }) => ({ id, title, expected, pass, outcome })),
    passed: completeRun.replay.passed,
    total: completeRun.replay.total,
    unsafeCasesBlocked: completeRun.replay.unsafeCasesBlocked,
    legitimateCasesPreserved: completeRun.replay.legitimateCasesPreserved,
    allPass: completeRun.replay.allPass
  },
  attestation: completeRun.attestation,
  metrics: completeRun.metrics,
  timeline: completeRun.timeline
};

const demoSource = `window.UNWRITTEN_CANDIDATE=${JSON.stringify(candidate)};\nwindow.UNWRITTEN_DEMO=${JSON.stringify(run)};\n`;
await writeFile(path.join(rootDir, "public", "demo-data.js"), demoSource, "utf8");

const [html, css, app] = await Promise.all([
  readFile(path.join(rootDir, "public", "index.html"), "utf8"),
  readFile(path.join(rootDir, "public", "styles.css"), "utf8"),
  readFile(path.join(rootDir, "public", "app.js"), "utf8")
]);

const bundled = bundleStaticHtml({ html, css, app, demoSource });
await mkdir(path.join(rootDir, "dist"), { recursive: true });
await writeFile(path.join(rootDir, "dist", "index.html"), bundled, "utf8");
console.log(`Built dist/index.html (${Buffer.byteLength(bundled)} bytes)`);
