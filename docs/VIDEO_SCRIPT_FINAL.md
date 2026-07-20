# Final Demo Video Script

Target duration: 2 minutes 35 seconds to 2 minutes 50 seconds.

## Recording setup

- Record the public demo at https://unwritten-xi.vercel.app.
- Use 1080p or 1440p screen capture.
- Keep browser zoom near 90–100%.
- Record clear voiceover; music is unnecessary.
- Show the GitHub repository briefly near the end.
- The finished YouTube video must be under three minutes and viewable without signing in.

## 0:00–0:14 — Hook

**On screen:** Unwritten hero and four evidence sources.

**Voiceover:**

“An AI agent can follow every written instruction and still fail, because the rule that matters may never have been written as a specification. Unwritten finds that missing rule, proves how the workflow breaks it, and verifies the repair.”

## 0:14–0:38 — Evidence and GPT-5.6

**Action:** Point to the refund policy, runbook, operations note, and historical decision. Click **Find the missing rule**.

**Voiceover:**

“These four sources contain only fragments of the real refund process. GPT-5.6 connects their meaning through strict Structured Outputs and proposes a candidate rule with exact quotations. Its output is never trusted automatically: unsupported quotes and unknown workflow vocabulary are rejected.”

## 0:38–0:59 — Candidate rule and human boundary

**On screen:** Candidate conditions, ambiguity, and conflict.

**Voiceover:**

“The candidate says a ticket cannot close until settlement is confirmed, the refund amount matches the approval, and manager approval exists above five hundred dollars. Unwritten also exposes the ambiguous word ‘processed’ and the conflict between the runbook and actual operations practice.”

**Action:** Check the approval box.

“Because model inference is not organizational truth, a human must review and approve the bounded specification before it can execute.”

## 0:59–1:28 — Minimal counterexample

**Action:** Click **Approve and find counterexample**.

**Voiceover:**

“A deterministic breadth-first state explorer now searches the workflow. It finds the shortest violating path in three transitions: receive a twelve-hundred-dollar request, submit the refund and receive a pending status, then close the ticket because ‘processed’ was treated as complete.”

**On screen:** Final state.

“The sandbox records the actual synthetic side effect: refund pending, ticket closed, and manager approval missing. An LLM did not grade this result.”

## 1:28–1:58 — Verified repair

**On screen:** Verified repair panel and replay counts.

**Voiceover:**

“Codex helped generate and review a narrow guard compiled from the approved policy. Unwritten accepts it only after replay: all three unsafe cases are blocked, both legitimate refund paths still pass, and no source agent is modified.”

## 1:58–2:22 — Engineering and Codex story

**On screen:** Switch briefly to GitHub README, architecture, tests, or CI file.

**Voiceover:**

“Codex was the primary engineering collaborator across product research, scope reduction, policy design, the state explorer, replay harness, user interface, automated tests, and final security review. The repository includes thirteen deterministic tests, GitHub CI, a no-key judge path, and a SHA-256 evidence attestation.”

## 2:22–2:42 — Impact and close

**On screen:** Return to Unwritten result panel.

**Voiceover:**

“Teams cannot test a rule they never realized was missing. Unwritten turns scattered operational memory into a reviewable candidate specification, then into executable evidence before an agent reaches production.”

**End card:**

“Unwritten. Find the rule nobody wrote. Prove the workflow cannot break it.”

## Required spoken checklist

Before uploading, confirm the voiceover explicitly says:

- what Unwritten does;
- how GPT-5.6 is used;
- how Codex was used;
- that the verdict is deterministic;
- that the product has a working public demo.
