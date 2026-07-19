import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_EVIDENCE_SOURCES,
  approveCandidateRule,
  buildUnwrittenRun,
  compileRuleToDsl,
  executeCounterexample,
  findMinimalCounterexample,
  generateGuardPatch,
  mineMissingRuleLocally,
  mineMissingRuleWithGPT56,
  replayGuardVerification,
  sha256,
  validateCandidateRule,
  validatePolicyDsl
} from "../src/core.mjs";
import { bundleStaticHtml } from "../src/static-build.mjs";

test("mines one evidence-grounded candidate rule", () => {
  const rule = mineMissingRuleLocally();
  assert.equal(rule.id, "RULE-REFUND-CLOSE-001");
  assert.equal(rule.conditions.length, 3);
  assert.equal(rule.requiresHumanApproval, true);
  assert.ok(rule.conditions.every((condition) => condition.citations.length >= 1));
  assert.equal(validateCandidateRule(rule, DEFAULT_EVIDENCE_SOURCES), true);
});

test("surfaces the ambiguous completion language and conflict", () => {
  const rule = mineMissingRuleLocally();
  assert.equal(rule.ambiguities[0].term, "processed");
  assert.equal(rule.conflicts.length, 1);
  assert.ok(rule.conflicts[0].sourceIds.includes("support-runbook"));
  assert.ok(rule.conflicts[0].sourceIds.includes("operations-note"));
});

test("rejects a citation that is not present in its source", () => {
  const rule = mineMissingRuleLocally();
  rule.conditions[0].citations[0].quote = "Invented quote";
  assert.throws(() => validateCandidateRule(rule, DEFAULT_EVIDENCE_SOURCES), /not present verbatim/);
});

test("requires explicit human approval before compiling policy", () => {
  const candidate = mineMissingRuleLocally();
  assert.throws(() => compileRuleToDsl(candidate), /explicit human approval/);
  const policy = compileRuleToDsl(approveCandidateRule(candidate));
  assert.equal(policy.version, "unwritten.policy/v1");
  assert.equal(validatePolicyDsl(policy), true);
});

test("uses the deterministic compiler when no API key is configured", async () => {
  const result = await mineMissingRuleWithGPT56(DEFAULT_EVIDENCE_SOURCES, { apiKey: "" });
  assert.equal(result.mode, "demo");
  assert.equal(result.rule.id, "RULE-REFUND-CLOSE-001");
});

test("parses a schema-conformant GPT-5.6 Responses API result", async () => {
  const rule = mineMissingRuleLocally();
  let capturedBody;
  const result = await mineMissingRuleWithGPT56(DEFAULT_EVIDENCE_SOURCES, {
    apiKey: "test-key",
    model: "gpt-5.6",
    fetchImpl: async (_url, options) => {
      capturedBody = JSON.parse(options.body);
      return {
        ok: true,
        async json() {
          return { id: "resp_unwritten_123", output_text: JSON.stringify(rule) };
        }
      };
    }
  });
  assert.equal(result.mode, "live");
  assert.equal(result.responseId, "resp_unwritten_123");
  assert.equal(capturedBody.text.format.type, "json_schema");
  assert.equal(capturedBody.text.format.strict, true);
  assert.equal(capturedBody.store, false);
});

test("finds the shortest executable policy violation", () => {
  const policy = compileRuleToDsl(approveCandidateRule(mineMissingRuleLocally()));
  const witness = findMinimalCounterexample(policy);
  assert.equal(witness.found, true);
  assert.equal(witness.steps.length, 3);
  assert.deepEqual(witness.steps.map((step) => step.action), [
    "receive_request",
    "submit_refund",
    "close_ticket"
  ]);
});

test("replays the witness and observes a synthetic side effect", () => {
  const policy = compileRuleToDsl(approveCandidateRule(mineMissingRuleLocally()));
  const witness = findMinimalCounterexample(policy);
  const execution = executeCounterexample(witness, policy);
  assert.equal(execution.violationObserved, true);
  assert.equal(execution.finalState.ticketStatus, "closed");
  assert.equal(execution.finalState.refundStatus, "pending");
  assert.equal(execution.sideEffectReceipt.synthetic, true);
});

test("generates a bounded reviewable guard", () => {
  const policy = compileRuleToDsl(approveCandidateRule(mineMissingRuleLocally()));
  const patch = generateGuardPatch(policy);
  assert.match(patch.code, /settlementConfirmed/);
  assert.match(patch.code, /amountMatches/);
  assert.match(patch.code, /approvalSatisfied/);
  assert.equal(patch.sourceAgentsModified, 0);
});

test("blocks unsafe cases and preserves legitimate cases", () => {
  const policy = compileRuleToDsl(approveCandidateRule(mineMissingRuleLocally()));
  const replay = replayGuardVerification(policy);
  assert.equal(replay.allPass, true);
  assert.equal(replay.unsafeCasesBlocked, 3);
  assert.equal(replay.legitimateCasesPreserved, 2);
  assert.equal(replay.passed, 5);
});

test("builds a complete verified run and attestation", async () => {
  const run = await buildUnwrittenRun();
  assert.equal(run.status, "verified");
  assert.equal(run.metrics.evidenceSources, 4);
  assert.equal(run.metrics.witnessSteps, 3);
  assert.equal(run.replay.passed, 5);
  assert.equal(run.attestation.claims.executableViolationReproduced, true);
  assert.equal(run.attestation.digest.length, 64);
});

test("attestation hashing is deterministic", () => {
  const left = sha256({ b: 2, a: 1 });
  const right = sha256({ a: 1, b: 2 });
  assert.equal(left, right);
  assert.equal(left.length, 64);
});


test("static bundling preserves JavaScript dollar identifiers", () => {
  const bundled = bundleStaticHtml({
    html: '<link rel="stylesheet" href="/styles.css" /><script src="/demo-data.js" defer></script>\n    <script src="/app.js" defer></script>',
    css: 'body{}',
    demoSource: 'window.DEMO = true;',
    app: 'const $$ = () => []; $$();'
  });
  assert.match(bundled, /const \$\$/);
  assert.doesNotMatch(bundled, /const \$ = \(\) => \[\];/);
});
