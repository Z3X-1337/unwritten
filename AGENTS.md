# Unwritten — Codex operating contract

## Mission

Build a submission-grade Developer Tools project that discovers a missing operational rule from mixed evidence, exposes its provenance and contradictions, compiles it only after explicit human approval, reproduces a violating workflow, and proves a minimal guard without breaking legitimate cases.

## Non-negotiable proof path

1. Normalize a bounded evidence bundle.
2. Propose one candidate rule with exact source-bound quotations.
3. Surface ambiguous language and conflicting evidence.
4. Require explicit human approval before compiling the rule.
5. Compile only into the closed `unwritten.policy/v1` DSL.
6. Search a bounded state graph for the shortest counterexample.
7. Reproduce the violation through synthetic in-memory tool receipts.
8. Generate a reviewable guard without modifying source agents.
9. Replay unsafe and legitimate cases.
10. Emit a tamper-evident attestation.

## Constraints

- The judge path must work without an API key.
- GPT-5.6 may infer candidate semantics but never silently activates a rule or owns the pass/fail verdict.
- Every citation must be present verbatim in the supplied evidence.
- No arbitrary repository, command, shell, browser account, secret, payment provider, or network side effect.
- All effects are synthetic and in memory.
- Every behavior change requires a Node test.
- Keep the MVP to the customer-support refund workflow until the complete proof path passes.

## Verification

```bash
npm test
npm run check
npm start
```

Expected evidence:

- one evidence-grounded candidate rule;
- one surfaced ambiguity and conflict;
- a minimal three-transition violating witness;
- a synthetic ticket-close side effect while the refund is pending and unapproved;
- three unsafe cases blocked after the guard;
- two legitimate cases preserved;
- static `dist/index.html` generated.
