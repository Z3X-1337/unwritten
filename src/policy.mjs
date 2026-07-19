import {
  ALLOWED_EFFECTS,
  ALLOWED_FIELDS,
  ALLOWED_OPERATORS,
  DEFAULT_EVIDENCE_SOURCES,
  normalizeEvidenceSources
} from "./contracts.mjs";
import { sha256 } from "./hash.mjs";

export function validateCandidateRule(rule, evidenceSources = DEFAULT_EVIDENCE_SOURCES) {
  if (!rule || typeof rule !== "object") throw new Error("Candidate rule is missing.");
  if (!ALLOWED_EFFECTS.has(rule.forbidEffect)) throw new Error("Candidate rule uses an unknown effect.");
  if (!Array.isArray(rule.conditions) || rule.conditions.length !== 3) {
    throw new Error("Candidate rule must contain exactly three bounded conditions.");
  }
  const sourceMap = new Map(normalizeEvidenceSources(evidenceSources).map((source) => [source.id, source]));
  for (const condition of rule.conditions) {
    if (!ALLOWED_FIELDS.has(condition.field)) throw new Error(`Unknown rule field: ${condition.field}`);
    if (!ALLOWED_OPERATORS.has(condition.operator)) throw new Error(`Unknown operator: ${condition.operator}`);
    if (condition.operator === "eqField" && !ALLOWED_FIELDS.has(condition.value)) {
      throw new Error(`Unknown comparison field: ${condition.value}`);
    }
    if (!Array.isArray(condition.citations) || !condition.citations.length) {
      throw new Error(`Condition ${condition.id} has no evidence citations.`);
    }
    for (const citation of condition.citations) {
      const source = sourceMap.get(citation.sourceId);
      if (!source) throw new Error(`Citation references an unknown source: ${citation.sourceId}`);
      if (!source.text.includes(citation.quote)) {
        throw new Error(`Citation quote is not present verbatim in source ${citation.sourceId}.`);
      }
    }
  }
  return true;
}

export function approveCandidateRule(candidateRule, {
  approvedBy = "human-review-demo",
  approvedAt = "2026-07-20T00:00:00.000Z"
} = {}) {
  return {
    ...structuredClone(candidateRule),
    status: "approved",
    approval: {
      approvedBy,
      approvedAt,
      explicit: true,
      candidateDigest: sha256(candidateRule)
    }
  };
}

export function compileRuleToDsl(approvedRule) {
  if (approvedRule?.status !== "approved" || !approvedRule?.approval?.explicit) {
    throw new Error("A candidate rule must receive explicit human approval before compilation.");
  }
  const dsl = {
    version: "unwritten.policy/v1",
    id: approvedRule.id,
    title: approvedRule.title,
    forbid: {
      effect: approvedRule.forbidEffect,
      unlessAll: approvedRule.conditions.map((condition) => ({
        id: condition.id,
        field: condition.field,
        operator: condition.operator,
        value: condition.value,
        when: condition.when
      }))
    },
    provenance: {
      candidateDigest: approvedRule.approval.candidateDigest,
      approval: approvedRule.approval,
      sourceIds: [...new Set(approvedRule.conditions.flatMap((condition) => condition.citations.map((citation) => citation.sourceId)))].sort()
    }
  };
  validatePolicyDsl(dsl);
  return dsl;
}

export function validatePolicyDsl(dsl) {
  if (dsl?.version !== "unwritten.policy/v1") throw new Error("Unsupported policy version.");
  if (!ALLOWED_EFFECTS.has(dsl?.forbid?.effect)) throw new Error("Policy uses an unknown effect.");
  if (!Array.isArray(dsl?.forbid?.unlessAll) || !dsl.forbid.unlessAll.length) {
    throw new Error("Policy has no conditions.");
  }
  for (const condition of dsl.forbid.unlessAll) {
    if (!ALLOWED_FIELDS.has(condition.field)) throw new Error(`Policy uses unknown field ${condition.field}.`);
    if (!ALLOWED_OPERATORS.has(condition.operator)) throw new Error(`Policy uses unknown operator ${condition.operator}.`);
    if (condition.operator === "eqField" && !ALLOWED_FIELDS.has(condition.value)) {
      throw new Error(`Policy compares against unknown field ${condition.value}.`);
    }
  }
  return true;
}
