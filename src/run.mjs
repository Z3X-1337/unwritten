import { DEFAULT_EVIDENCE_SOURCES, normalizeEvidenceSources } from "./contracts.mjs";
import { sha256 } from "./hash.mjs";
import { mineMissingRuleWithGPT56 } from "./mining.mjs";
import { approveCandidateRule, compileRuleToDsl, validateCandidateRule } from "./policy.mjs";
import { executeCounterexample, findMinimalCounterexample } from "./workflow.mjs";
import { generateGuardPatch, replayGuardVerification } from "./repair.mjs";

export function buildEvidenceGraph(evidenceSources, candidateRule) {
  const sources = normalizeEvidenceSources(evidenceSources);
  return {
    nodes: [
      ...sources.map((source) => ({ id: source.id, label: source.title, type: "evidence", kind: source.kind })),
      { id: candidateRule.id, label: "Candidate missing rule", type: "rule" },
      { id: "approved-policy", label: "Approved executable policy", type: "policy" },
      { id: "counterexample", label: "Minimal violation witness", type: "witness" },
      { id: "verified-guard", label: "Verified runtime guard", type: "guard" }
    ],
    edges: [
      ...sources.map((source) => ({ from: source.id, to: candidateRule.id, label: "supports / conflicts" })),
      { from: candidateRule.id, to: "approved-policy", label: "human approval" },
      { from: "approved-policy", to: "counterexample", label: "search" },
      { from: "counterexample", to: "verified-guard", label: "repair + replay" }
    ]
  };
}

export async function buildUnwrittenRun({
  evidenceSources = DEFAULT_EVIDENCE_SOURCES,
  compilerResult = null
} = {}) {
  const sources = normalizeEvidenceSources(evidenceSources);
  const compiler = compilerResult || await mineMissingRuleWithGPT56(sources);
  validateCandidateRule(compiler.rule, sources);
  const approvedRule = approveCandidateRule(compiler.rule);
  const policy = compileRuleToDsl(approvedRule);
  const witness = findMinimalCounterexample(policy, { mode: "vulnerable" });
  const vulnerable = executeCounterexample(witness, policy, { mode: "vulnerable" });
  const guard = generateGuardPatch(policy);
  const replay = replayGuardVerification(policy);
  const graph = buildEvidenceGraph(sources, compiler.rule);

  const coreEvidence = {
    sources: sources.map((source) => ({ id: source.id, digest: sha256(source.text) })),
    candidateRule: compiler.rule,
    approval: approvedRule.approval,
    policy,
    witness: {
      scenario: witness.scenario,
      steps: witness.steps.map((step) => step.action),
      finalState: witness.finalState
    },
    vulnerableReceipt: vulnerable.sideEffectReceipt,
    guardDigest: sha256(guard.code),
    replay: replay.cases.map((item) => ({ id: item.id, expected: item.expected, outcome: item.outcome, pass: item.pass }))
  };
  const attestation = {
    version: "unwritten.attestation/v1",
    status: vulnerable.violationObserved && replay.allPass ? "verified" : "inconclusive",
    claims: {
      candidateRuleEvidenceBound: true,
      explicitHumanApprovalRecorded: true,
      executableViolationReproduced: vulnerable.violationObserved,
      unsafeCasesBlocked: replay.unsafeCasesBlocked,
      legitimateCasesPreserved: replay.legitimateCasesPreserved,
      sourceAgentsModified: guard.sourceAgentsModified
    },
    digest: sha256(coreEvidence)
  };

  return {
    product: "Unwritten",
    runId: `UW-${attestation.digest.slice(0, 10).toUpperCase()}`,
    status: attestation.status,
    generatedAt: "2026-07-20T00:00:00.000Z",
    compiler: {
      mode: compiler.mode,
      model: compiler.model,
      responseId: compiler.responseId ?? null,
      note: compiler.note
    },
    evidenceSources: sources,
    candidateRule: compiler.rule,
    approvedRule,
    policy,
    graph,
    witness: {
      ...witness,
      steps: witness.steps.map((step, index) => ({
        index: index + 1,
        action: step.action,
        state: step.state
      }))
    },
    vulnerable,
    guard,
    replay,
    attestation,
    metrics: {
      evidenceSources: sources.length,
      candidateRules: 1,
      conflicts: compiler.rule.conflicts.length,
      ambiguities: compiler.rule.ambiguities.length,
      witnessSteps: witness.steps.length,
      exploredStates: witness.exploredStates,
      replayPassed: replay.passed,
      replayTotal: replay.total
    },
    timeline: [
      { id: "evidence", label: "Evidence normalized", detail: `${sources.length} bounded sources`, status: "pass" },
      { id: "rule", label: "Missing rule proposed", detail: `${compiler.rule.conditions.length} evidence-backed conditions`, status: "pass" },
      { id: "review", label: "Human approval recorded", detail: approvedRule.approval.approvedBy, status: "pass" },
      { id: "search", label: "Counterexample discovered", detail: `${witness.steps.length} transitions · ${witness.exploredStates} states explored`, status: witness.found ? "danger" : "fail" },
      { id: "execute", label: "Violation reproduced", detail: vulnerable.sideEffectReceipt?.effect || "No side effect", status: vulnerable.violationObserved ? "danger" : "fail" },
      { id: "repair", label: "Guard generated", detail: guard.target, status: "pass" },
      { id: "replay", label: "Dual replay verified", detail: `${replay.passed}/${replay.total} cases passed`, status: replay.allPass ? "pass" : "fail" }
    ]
  };
}
