const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const elements = {
  runtimeChip: $("#runtime-chip"),
  modelBadge: $("#model-badge"),
  mineButton: $("#mine-button"),
  mineButtonLabel: $("#mine-button-label"),
  approveButton: $("#approve-button"),
  approveButtonLabel: $("#approve-button-label"),
  approvalCheckbox: $("#approval-checkbox"),
  emptyState: $("#empty-state"),
  candidateView: $("#candidate-view"),
  runContent: $("#run-content"),
  proofTitle: $("#proof-title"),
  runId: $("#run-id"),
  candidateTitle: $("#candidate-title"),
  candidateStatement: $("#candidate-statement"),
  candidateConfidence: $("#candidate-confidence"),
  evidenceCount: $("#evidence-count"),
  conflictCount: $("#conflict-count"),
  conditionList: $("#condition-list"),
  ambiguityList: $("#ambiguity-list"),
  metricEvidence: $("#metric-evidence"),
  metricConflicts: $("#metric-conflicts"),
  metricWitness: $("#metric-witness"),
  metricReplay: $("#metric-replay"),
  violationSummary: $("#violation-summary"),
  witnessSteps: $("#witness-steps"),
  stateRefund: $("#state-refund"),
  stateTicket: $("#state-ticket"),
  stateApproval: $("#state-approval"),
  stateEffect: $("#state-effect"),
  timeline: $("#timeline"),
  guardCode: $("#guard-code"),
  replayList: $("#replay-list"),
  unsafeBlocked: $("#unsafe-blocked"),
  legitimatePreserved: $("#legitimate-preserved"),
  sourceModified: $("#source-modified"),
  policyCode: $("#policy-code"),
  candidateCode: $("#candidate-code"),
  attestationCode: $("#attestation-code"),
  attestationDigest: $("#attestation-digest"),
  toast: $("#toast")
};

let activeCandidate = null;
let toastTimer;

function showToast(message) {
  clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("visible");
  toastTimer = setTimeout(() => elements.toast.classList.remove("visible"), 3200);
}

function collectEvidence() {
  return $$("textarea[data-source-id]").map((textarea) => ({
    id: textarea.dataset.sourceId,
    title: textarea.dataset.title,
    kind: textarea.dataset.kind,
    text: textarea.value.trim()
  }));
}

function citationHtml(citation) {
  return `<span class="citation">“${escapeHtml(citation.quote)}”<em>${escapeHtml(citation.sourceId)}</em></span>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderCandidate(result) {
  activeCandidate = result;
  const rule = result.rule;
  elements.emptyState.classList.add("hidden");
  elements.runContent.classList.add("hidden");
  elements.candidateView.classList.remove("hidden");
  elements.proofTitle.textContent = "Candidate rule requires human review";
  elements.runId.textContent = "CANDIDATE";
  elements.candidateTitle.textContent = rule.title;
  elements.candidateStatement.textContent = rule.statement;
  elements.candidateConfidence.textContent = `${Math.round(rule.confidence * 100)}%`;
  elements.evidenceCount.textContent = String(rule.conditions.reduce((sum, condition) => sum + condition.citations.length, 0));
  elements.conflictCount.textContent = String(rule.conflicts.length + rule.ambiguities.length);
  elements.conditionList.innerHTML = rule.conditions.map((condition) => `
    <article class="condition-item">
      <strong>${escapeHtml(condition.description)}</strong>
      <p>${escapeHtml(condition.field)} · ${escapeHtml(condition.operator)} · ${escapeHtml(String(condition.value))}</p>
      ${condition.citations.map(citationHtml).join("")}
    </article>
  `).join("");
  elements.ambiguityList.innerHTML = [
    ...rule.ambiguities.map((item) => `
      <article class="ambiguity-item">
        <strong>AMBIGUOUS: “${escapeHtml(item.term)}”</strong>
        <p>${escapeHtml(item.issue)}</p>
        ${item.citations.map(citationHtml).join("")}
      </article>`),
    ...rule.conflicts.map((item) => `
      <article class="ambiguity-item">
        <strong>CONFLICTING OPERATIONAL MEANING</strong>
        <p>${escapeHtml(item.summary)}</p>
        <span class="citation">${escapeHtml(item.sourceIds.join(" ↔ "))}</span>
      </article>`)
  ].join("");
  elements.approvalCheckbox.checked = false;
  elements.approveButton.disabled = true;
  elements.modelBadge.textContent = result.mode === "live" ? result.model.toUpperCase() : "DETERMINISTIC DEMO";
  showToast(result.note);
}

function actionLabel(action) {
  const labels = {
    receive_request: "Receive refund request",
    submit_refund: "Submit refund to provider",
    close_ticket: "Close support ticket",
    settle_refund: "Confirm settlement",
    manager_approve: "Record manager approval"
  };
  return labels[action] || action;
}

function renderRun(run) {
  elements.emptyState.classList.add("hidden");
  elements.candidateView.classList.add("hidden");
  elements.runContent.classList.remove("hidden");
  elements.proofTitle.textContent = run.status === "verified" ? "Missing rule compiled and verified" : "Verification inconclusive";
  elements.runId.textContent = run.runId;
  elements.metricEvidence.textContent = String(run.metrics.evidenceSources);
  elements.metricConflicts.textContent = String(run.metrics.conflicts + run.metrics.ambiguities);
  elements.metricWitness.textContent = `${run.metrics.witnessSteps} STEPS`;
  elements.metricReplay.textContent = `${run.metrics.replayPassed}/${run.metrics.replayTotal}`;

  elements.violationSummary.textContent = "The ticket closed while the refund was pending and manager approval was missing.";
  elements.witnessSteps.innerHTML = run.witness.steps.map((step) => `
    <article class="witness-step">
      <b>${step.index}</b>
      <strong>${escapeHtml(actionLabel(step.action))}</strong>
      <span>${escapeHtml(step.state.refundStatus)} · ${escapeHtml(step.state.ticketStatus)}</span>
    </article>
  `).join("");
  elements.stateRefund.textContent = run.vulnerable.finalState.refundStatus;
  elements.stateTicket.textContent = run.vulnerable.finalState.ticketStatus;
  elements.stateApproval.textContent = run.vulnerable.finalState.managerApproval ? "present" : "missing";
  elements.stateEffect.textContent = run.vulnerable.sideEffectReceipt?.effect || "none";

  elements.timeline.innerHTML = run.timeline.map((item) => `
    <article class="timeline-item ${item.status}">
      <span>${escapeHtml(item.id.toUpperCase())}</span>
      <strong>${escapeHtml(item.label)}</strong>
      <small>${escapeHtml(item.detail)}</small>
    </article>
  `).join("");

  elements.guardCode.textContent = run.guard.diff;
  elements.replayList.innerHTML = run.replay.cases.map((item) => `
    <article class="replay-item ${item.pass ? "pass" : "fail"}">
      <strong>${escapeHtml(item.title)}</strong>
      <span>${escapeHtml(item.outcome.toUpperCase())}</span>
    </article>
  `).join("");
  elements.unsafeBlocked.textContent = `${run.replay.unsafeCasesBlocked}/3`;
  elements.legitimatePreserved.textContent = `${run.replay.legitimateCasesPreserved}/2`;
  elements.sourceModified.textContent = String(run.guard.sourceAgentsModified);
  elements.policyCode.textContent = JSON.stringify(run.policy, null, 2);
  elements.candidateCode.textContent = JSON.stringify({
    rule: run.candidateRule,
    approval: run.approvedRule.approval
  }, null, 2);
  elements.attestationCode.textContent = JSON.stringify(run.attestation, null, 2);
  elements.attestationDigest.textContent = run.attestation.digest;
  elements.modelBadge.textContent = run.compiler.mode === "live" ? run.compiler.model.toUpperCase() : "DETERMINISTIC DEMO";
  showToast(run.compiler.note);
}

async function mineRule() {
  elements.mineButton.disabled = true;
  elements.mineButtonLabel.textContent = "Connecting evidence…";
  try {
    let result;
    if (location.protocol === "file:") {
      await new Promise((resolve) => setTimeout(resolve, 550));
      result = window.UNWRITTEN_CANDIDATE;
    } else {
      const response = await fetch("/api/compile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ evidenceSources: collectEvidence() })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to mine the rule.");
      result = payload;
    }
    renderCandidate(result);
  } catch (error) {
    if (window.UNWRITTEN_CANDIDATE) renderCandidate(window.UNWRITTEN_CANDIDATE);
    showToast(error.message || "Unable to mine the missing rule.");
  } finally {
    elements.mineButton.disabled = false;
    elements.mineButtonLabel.textContent = "Find the missing rule";
  }
}

async function approveAndRun() {
  if (!elements.approvalCheckbox.checked || !activeCandidate) return;
  elements.approveButton.disabled = true;
  elements.approveButtonLabel.textContent = "Searching state space…";
  try {
    let run;
    if (location.protocol === "file:") {
      await new Promise((resolve) => setTimeout(resolve, 700));
      run = window.UNWRITTEN_DEMO;
    } else {
      const response = await fetch("/api/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ evidenceSources: collectEvidence(), approvedRuleId: activeCandidate.rule.id })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Verification failed.");
      run = payload;
    }
    renderRun(run);
  } catch (error) {
    if (window.UNWRITTEN_DEMO) renderRun(window.UNWRITTEN_DEMO);
    showToast(error.message || "Verification failed.");
  } finally {
    elements.approveButtonLabel.textContent = "Approve rule & find counterexample";
    elements.approveButton.disabled = !elements.approvalCheckbox.checked;
  }
}

async function checkRuntime() {
  if (location.protocol === "file:") {
    elements.runtimeChip.innerHTML = '<span class="runtime-dot"></span>Static judge demo';
    elements.modelBadge.textContent = "DETERMINISTIC DEMO";
    return;
  }
  try {
    const health = await fetch("/api/health").then((response) => response.json());
    elements.runtimeChip.innerHTML = `<span class="runtime-dot"></span>${health.gpt56Configured ? "GPT-5.6 live" : "Judge demo ready"}`;
    elements.modelBadge.textContent = health.gpt56Configured ? health.model.toUpperCase() : "DETERMINISTIC DEMO";
  } catch {
    elements.runtimeChip.innerHTML = '<span class="runtime-dot"></span>Static fallback ready';
  }
}

elements.mineButton.addEventListener("click", mineRule);
elements.approvalCheckbox.addEventListener("change", () => {
  elements.approveButton.disabled = !elements.approvalCheckbox.checked;
});
elements.approveButton.addEventListener("click", approveAndRun);

$$('.tab').forEach((button) => {
  button.addEventListener("click", () => {
    $$(".tab").forEach((tab) => tab.classList.remove("active"));
    $$(".tab-panel").forEach((panel) => panel.classList.remove("active"));
    button.classList.add("active");
    $(`#tab-${button.dataset.tab}`).classList.add("active");
  });
});

checkRuntime();
