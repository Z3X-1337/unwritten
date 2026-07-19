# Unwritten — Product Requirements

## Epic 1: Review the evidence bundle

As an agent workflow developer, I want to see and edit the bounded evidence sources so I understand what information the candidate rule is derived from.

Acceptance criteria:

- The first screen shows four labeled sources: policy, runbook, operations note and human decision.
- Each source is editable text.
- Empty sources or duplicate IDs fail clearly.
- The judge path contains no private or live customer information.

## Epic 2: Mine a candidate missing rule

As a developer, I want one candidate operational rule with exact evidence so I can judge whether it reflects the organization’s intended behavior.

Acceptance criteria:

- The candidate contains exactly three conditions.
- Every condition has at least one verbatim quotation and source ID.
- A quotation that does not exist in its source is rejected.
- The candidate shows confidence but is not activated automatically.
- The ambiguous word `processed` is surfaced.
- The runbook/operations conflict is visible.

## Epic 3: Human approval

As a responsible operator, I want explicit control over whether a candidate becomes executable.

Acceptance criteria:

- The rule cannot compile before approval.
- The UI requires a deliberate checkbox and action.
- The approval record includes a digest of the reviewed candidate.

## Epic 4: Discover and reproduce a violation

As a developer, I want Unwritten to find a workflow I did not manually write as a test.

Acceptance criteria:

- Search is bounded and deterministic.
- The result is the shortest found violating path.
- The bundled witness contains three transitions.
- The final observable state has `refund.status = pending`, `ticket.status = closed`, and no manager approval for a $1,200 refund.
- The result includes a synthetic `ticket.close` receipt.
- The verdict comes from state assertions, not an LLM judge.

## Epic 5: Generate and verify enforcement

As a developer, I want a minimal guard and evidence that it blocks the violation without breaking legitimate workflows.

Acceptance criteria:

- The generated patch checks settlement, amount equality and conditional manager approval.
- Three unsafe cases are blocked.
- A valid low-value refund closes.
- A valid approved high-value refund closes.
- Source agents are not modified.
- Any failing replay makes the run inconclusive.

## Epic 6: Export proof

As a reviewer, I want portable artifacts showing what was proposed, approved, violated and repaired.

Acceptance criteria:

- The UI displays the approved policy DSL.
- The UI displays candidate provenance and approval.
- The UI displays an attestation with claims and a SHA-256 digest.
- The static judge demo works without an API key.

## Edge cases

- Missing evidence source.
- Duplicate source ID.
- Invented citation quote.
- Unknown policy field, operator or effect.
- Rule compilation without approval.
- No counterexample within the search bound.
- Guard blocks legitimate cases.
- Live GPT-5.6 call fails and the judge fixture falls back deterministically.

## Non-goals

- Universal policy extraction.
- Legal or compliance determination.
- Autonomous production patching.
- A complete process-mining platform.
- Real enterprise data integration.
