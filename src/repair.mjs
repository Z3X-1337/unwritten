import { sha256 } from "./hash.mjs";
import { validatePolicyDsl } from "./policy.mjs";
import { applyTransition, initialState, transitionReceipt } from "./workflow.mjs";

export function generateGuardPatch(dsl) {
  validatePolicyDsl(dsl);
  const code = `export function canCloseRefundTicket(input) {\n  const settlementConfirmed = input.refundStatus === "settled";\n  const amountMatches = input.refundAmount === input.approvedAmount;\n  const approvalSatisfied = input.refundAmount <= 500 || input.managerApproval === true;\n\n  return settlementConfirmed && amountMatches && approvalSatisfied;\n}`;
  const diff = `--- a/workflow/close-ticket.mjs\n+++ b/workflow/close-ticket.mjs\n@@\n-export function canCloseRefundTicket() {\n-  return true;\n+export function canCloseRefundTicket(input) {\n+  const settlementConfirmed = input.refundStatus === "settled";\n+  const amountMatches = input.refundAmount === input.approvedAmount;\n+  const approvalSatisfied = input.refundAmount <= 500 || input.managerApproval === true;\n+  return settlementConfirmed && amountMatches && approvalSatisfied;\n }`;
  return {
    language: "javascript",
    target: "workflow/close-ticket.mjs",
    code,
    diff,
    policyDigest: sha256(dsl),
    sourceAgentsModified: 0
  };
}

function replayCase({ id, title, refundAmount, approvedAmount, actions, expected }, dsl) {
  const scenario = { id, refundAmount, approvedAmount };
  let state = initialState(scenario);
  const receipts = [];
  for (const action of actions) {
    const next = applyTransition(state, action, "guarded", dsl);
    if (!next) {
      return {
        id,
        title,
        expected,
        pass: false,
        outcome: "invalid-sequence",
        receipts,
        finalState: state
      };
    }
    receipts.push(transitionReceipt(state, next, action, "guarded", dsl));
    state = next;
  }
  const closed = state.ticketStatus === "closed";
  const blocked = state.closeBlocked && !closed;
  const actual = closed ? "closed" : blocked ? "blocked" : "open";
  return {
    id,
    title,
    expected,
    pass: actual === expected,
    outcome: actual,
    receipts,
    finalState: state
  };
}

export function replayGuardVerification(dsl) {
  const cases = [
    replayCase({
      id: "pending-low-value",
      title: "Pending $120 refund",
      refundAmount: 120,
      approvedAmount: 120,
      actions: ["receive_request", "submit_refund", "close_ticket"],
      expected: "blocked"
    }, dsl),
    replayCase({
      id: "unapproved-high-value",
      title: "Settled $1,200 refund without manager approval",
      refundAmount: 1200,
      approvedAmount: 1200,
      actions: ["receive_request", "submit_refund", "settle_refund", "close_ticket"],
      expected: "blocked"
    }, dsl),
    replayCase({
      id: "amount-mismatch",
      title: "Settled refund with amount mismatch",
      refundAmount: 300,
      approvedAmount: 250,
      actions: ["receive_request", "submit_refund", "settle_refund", "close_ticket"],
      expected: "blocked"
    }, dsl),
    replayCase({
      id: "valid-low-value",
      title: "Settled $120 refund",
      refundAmount: 120,
      approvedAmount: 120,
      actions: ["receive_request", "submit_refund", "settle_refund", "close_ticket"],
      expected: "closed"
    }, dsl),
    replayCase({
      id: "valid-high-value",
      title: "Approved and settled $1,200 refund",
      refundAmount: 1200,
      approvedAmount: 1200,
      actions: ["receive_request", "manager_approve", "submit_refund", "settle_refund", "close_ticket"],
      expected: "closed"
    }, dsl)
  ];
  return {
    cases,
    passed: cases.filter((item) => item.pass).length,
    total: cases.length,
    unsafeCasesBlocked: cases.filter((item) => item.expected === "blocked" && item.pass).length,
    legitimateCasesPreserved: cases.filter((item) => item.expected === "closed" && item.pass).length,
    allPass: cases.every((item) => item.pass)
  };
}
