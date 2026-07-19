import { canonicalize } from "./hash.mjs";
import { validatePolicyDsl } from "./policy.mjs";

function getField(state, field) {
  const table = {
    "refund.amount": state.refundAmount,
    "refund.approvedAmount": state.approvedAmount,
    "refund.status": state.refundStatus,
    "manager.approval": state.managerApproval,
    "ticket.status": state.ticketStatus
  };
  return table[field];
}

function baseConditionSatisfied(state, condition) {
  const actual = getField(state, condition.field);
  if (condition.operator === "eq") return actual === condition.value;
  if (condition.operator === "eqField") return actual === getField(state, condition.value);
  if (condition.operator === "gt") return Number(actual) > Number(condition.value);
  if (condition.operator === "requiredWhen") {
    const applies = condition.when?.operator === "gt"
      ? Number(getField(state, condition.when.field)) > Number(condition.when.value)
      : getField(state, condition.when?.field) === condition.when?.value;
    return !applies || actual === condition.value;
  }
  return false;
}

export function evaluatePolicy(state, dsl) {
  validatePolicyDsl(dsl);
  const checks = dsl.forbid.unlessAll.map((condition) => ({
    id: condition.id,
    pass: baseConditionSatisfied(state, condition),
    actual: getField(state, condition.field),
    expected: condition.operator === "eqField" ? getField(state, condition.value) : condition.value
  }));
  return {
    allowed: checks.every((check) => check.pass),
    checks,
    failed: checks.filter((check) => !check.pass)
  };
}

export function initialState(scenario) {
  return {
    scenarioId: scenario.id,
    requestedAmount: scenario.refundAmount,
    requestedApprovedAmount: scenario.approvedAmount,
    phase: "empty",
    refundAmount: null,
    approvedAmount: null,
    refundStatus: "not_started",
    managerApproval: false,
    ticketStatus: "not_created",
    closeBlocked: false
  };
}

function stateKey(state) {
  return canonicalize(state);
}

export function applyTransition(state, name, mode, dsl) {
  const next = structuredClone(state);
  if (name === "receive_request") {
    if (state.phase !== "empty") return null;
    next.phase = "active";
    next.refundAmount = state.requestedAmount;
    next.approvedAmount = state.requestedApprovedAmount;
    next.ticketStatus = "open";
    return next;
  }
  if (name === "manager_approve") {
    if (state.phase !== "active" || state.managerApproval || Number(state.refundAmount) <= 500) return null;
    next.managerApproval = true;
    return next;
  }
  if (name === "submit_refund") {
    if (state.phase !== "active" || state.refundStatus !== "not_started") return null;
    next.refundStatus = "pending";
    return next;
  }
  if (name === "settle_refund") {
    if (state.refundStatus !== "pending") return null;
    next.refundStatus = "settled";
    return next;
  }
  if (name === "close_ticket") {
    if (state.ticketStatus !== "open" || state.refundStatus === "not_started") return null;
    if (mode === "guarded" && !evaluatePolicy(state, dsl).allowed) {
      next.closeBlocked = true;
      return next;
    }
    next.ticketStatus = "closed";
    return next;
  }
  return null;
}

export function transitionReceipt(before, after, action, mode, dsl) {
  const policy = action === "close_ticket" ? evaluatePolicy(before, dsl) : null;
  return {
    action,
    mode,
    before: {
      refundStatus: before.refundStatus,
      ticketStatus: before.ticketStatus,
      managerApproval: before.managerApproval
    },
    after: {
      refundStatus: after.refundStatus,
      ticketStatus: after.ticketStatus,
      managerApproval: after.managerApproval,
      closeBlocked: after.closeBlocked
    },
    policy: policy ? { allowed: policy.allowed, failed: policy.failed.map((item) => item.id) } : null
  };
}

export function ruleViolation(state, dsl) {
  if (state.ticketStatus !== "closed") return { violated: false, failed: [] };
  const policy = evaluatePolicy(state, dsl);
  return { violated: !policy.allowed, failed: policy.failed };
}

const SEARCH_SCENARIOS = [
  { id: "high-value-pending-no-approval", refundAmount: 1200, approvedAmount: 1200 },
  { id: "low-value-pending", refundAmount: 120, approvedAmount: 120 },
  { id: "amount-mismatch", refundAmount: 300, approvedAmount: 250 }
];

const SEARCH_ACTIONS = ["receive_request", "submit_refund", "close_ticket", "settle_refund", "manager_approve"];

export function findMinimalCounterexample(dsl, {
  mode = "vulnerable",
  maxDepth = 6,
  scenarios = SEARCH_SCENARIOS
} = {}) {
  validatePolicyDsl(dsl);
  const queue = scenarios.map((scenario) => ({ scenario, state: initialState(scenario), steps: [] }));
  const visited = new Set(queue.map((node) => `${node.scenario.id}:${stateKey(node.state)}`));
  let exploredStates = 0;

  while (queue.length) {
    const node = queue.shift();
    exploredStates += 1;
    const violation = ruleViolation(node.state, dsl);
    if (violation.violated) {
      return {
        found: true,
        scenario: node.scenario,
        steps: node.steps,
        finalState: node.state,
        failedConditions: violation.failed,
        exploredStates,
        minimal: true
      };
    }
    if (node.steps.length >= maxDepth) continue;

    for (const action of SEARCH_ACTIONS) {
      const next = applyTransition(node.state, action, mode, dsl);
      if (!next || stateKey(next) === stateKey(node.state)) continue;
      const key = `${node.scenario.id}:${stateKey(next)}`;
      if (visited.has(key)) continue;
      visited.add(key);
      queue.push({
        scenario: node.scenario,
        state: next,
        steps: [...node.steps, { action, state: next }]
      });
    }
  }

  return { found: false, exploredStates, minimal: true, steps: [] };
}

export function executeCounterexample(witness, dsl, { mode = "vulnerable" } = {}) {
  if (!witness?.found) throw new Error("No counterexample witness is available.");
  let state = initialState(witness.scenario);
  const receipts = [];
  for (const step of witness.steps) {
    const next = applyTransition(state, step.action, mode, dsl);
    if (!next) throw new Error(`Witness action ${step.action} could not be replayed.`);
    receipts.push(transitionReceipt(state, next, step.action, mode, dsl));
    state = next;
  }
  const violation = ruleViolation(state, dsl);
  return {
    mode,
    scenario: witness.scenario,
    receipts,
    finalState: state,
    violationObserved: violation.violated,
    failedConditions: violation.failed,
    sideEffectReceipt: state.ticketStatus === "closed"
      ? {
          effect: "ticket.close",
          ticketId: "TICKET-SYNTHETIC-4821",
          refundStatus: state.refundStatus,
          amount: state.refundAmount,
          managerApproval: state.managerApproval,
          synthetic: true
        }
      : null
  };
}
