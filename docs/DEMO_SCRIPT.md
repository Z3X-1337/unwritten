# Demo Script — under three minutes

## 0:00–0:15 — Hook

“Your AI agent can follow every written rule and still fail—because the rule that matters was never written.”

Show the four sources and explain that no single one contains the complete refund rule.

## 0:15–0:45 — Mine the missing rule

Click **Find the missing rule**.

Show:

- settlement must be confirmed;
- actual and approved amounts must match;
- manager approval is required above $500;
- exact citations;
- ambiguity around `processed`;
- conflict between runbook wording and operations practice.

State that GPT-5.6 proposes semantics through strict Structured Outputs, but the result remains a candidate.

## 0:45–1:05 — Approval boundary

Check the human-review box and approve the rule.

Explain that Unwritten refuses to turn model inference into organizational policy silently.

## 1:05–1:35 — Counterexample

Run the search. Show the three steps and final state:

```text
Refund: pending
Ticket: closed
Approval: missing
```

Explain that the verifier observed a synthetic ticket-close side effect. An LLM did not grade the result.

## 1:35–2:10 — Repair

Open **Verified repair**. Show the generated guard and the five cases:

- three unsafe cases blocked;
- two legitimate cases preserved;
- zero source agents modified.

Explain that Codex generates and reviews the bounded patch, and deterministic replay decides acceptance.

## 2:10–2:35 — Proof

Open the policy and evidence packet. Show:

- closed DSL;
- approval record;
- witness;
- SHA-256 attestation.

## 2:35–2:55 — Impact and Codex story

“Teams cannot test a rule they never realized was missing. Unwritten turns scattered operational memory into reviewable, executable safeguards before an agent reaches production.”

Mention the primary Codex GPT-5.6 session, implementation, tests, final review and `/feedback` ID.

## 2:55–3:00 — End

```text
UNWRITTEN
Find the rule nobody wrote.
Prove the workflow cannot break it.
```
