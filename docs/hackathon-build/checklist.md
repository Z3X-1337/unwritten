# Unwritten — Build Checklist

Mode: autonomous execution with verification at each major proof boundary. Git commits are revert points. The final item is the Devpost handoff.

- [x] **1. Restore the prior engineering baseline**
  Spec ref: `spec.md > Runtime`
  What to build: Recreate a complete Git repository from the retained SkillLinker bundle.
  Acceptance: History is available and working files are restored.
  Verify: `git log --oneline`.

- [x] **2. Define bounded evidence and workflow contracts**
  Spec ref: `spec.md > Contracts`
  What to build: Evidence normalization, closed fields/effects/operators, and bundled fixtures.
  Acceptance: Invalid source bundles fail clearly.
  Verify: `npm test`.

- [x] **3. Implement candidate rule mining and provenance validation**
  Spec ref: `spec.md > Candidate rule`
  What to build: Deterministic judge compiler, optional GPT-5.6 Structured Outputs, exact citation validation, ambiguity and conflict output.
  Acceptance: Invented quote fails closed.
  Verify: candidate and citation tests.

- [x] **4. Implement explicit approval and policy compilation**
  Spec ref: `spec.md > Trust boundaries`
  What to build: Approval record and `unwritten.policy/v1` compiler.
  Acceptance: Unapproved candidate cannot compile.
  Verify: approval tests.

- [x] **5. Implement minimal counterexample search**
  Spec ref: `spec.md > Counterexample algorithm`
  What to build: Bounded BFS over the refund state machine.
  Acceptance: Finds the three-transition pending/unapproved closure witness.
  Verify: counterexample tests.

- [x] **6. Implement synthetic execution and receipts**
  Spec ref: `spec.md > Trust boundaries`
  What to build: Replay witness and emit an in-memory `ticket.close` receipt.
  Acceptance: Final state proves the violation independently of model judgment.
  Verify: execution tests.

- [x] **7. Implement guard generation and dual replay**
  Spec ref: `spec.md > Repair verification`
  What to build: Reviewable patch plus three unsafe and two legitimate cases.
  Acceptance: 5/5 expected outcomes pass.
  Verify: replay tests.

- [x] **8. Build the judge interface**
  Spec ref: `prd.md > Epics 1–6`
  What to build: Evidence editor, rule court, approval gate, witness, repair, DSL and attestation views.
  Acceptance: Entire story is understandable without reading repository code.
  Verify: local browser and static artifact.

- [x] **9. Build the static no-key artifact**
  Spec ref: `spec.md > Determinism`
  What to build: Inline CSS, JS and demo data into `dist/index.html`.
  Acceptance: Opens directly through `file://` and performs both staged actions.
  Verify: `npm run build:static`.

- [ ] **10. Execute primary Codex GPT-5.6 review**
  Spec ref: `README.md > Codex integration`
  What to build: Run the final review prompt, make one bounded improvement and record `/feedback` Session ID.
  Acceptance: Complete verification passes after the reviewed change.
  Verify: `node scripts/codex-primary-workflow.mjs`, Codex session and `npm run check`.

- [ ] **11. Publish and record demo**
  Spec ref: `prd.md > Epic 6`
  What to build: Public GitHub repository, public deployment and under-three-minute YouTube demo.
  Acceptance: All links work in an incognito window.
  Verify: external link checks.

- [ ] **12. Devpost handoff**
  Spec ref: `README.md > Judge path`
  What to build: Final description, repo, demo, video, category, feedback ID and testing instructions.
  Acceptance: Submission validator reports no missing required field.
  Verify: Devpost plugin preflight before explicit final submission confirmation.
