# Codex GPT-5.6 Primary Build and Final Review Prompt

Run this from the root of the `unwritten` repository in a primary Codex session using GPT-5.6. This must be a genuine engineering session, not a cosmetic `/feedback` run.

```text
You are taking ownership of the final implementation and security review for Unwritten, an OpenAI Build Week developer tool.

First read and understand the majority of the repository before editing:
- AGENTS.md
- README.md
- docs/JUDGE_START_HERE.md
- docs/hackathon-build/spec.md
- src/contracts.mjs
- src/mining.mjs
- src/policy.mjs
- src/workflow.mjs
- src/repair.mjs
- src/run.mjs
- server.mjs
- tests/core.test.mjs

Product constraints:
- Preserve the product scope, public UI, evidence model, closed policy DSL, deterministic judge story, and current demo behavior.
- Do not add dependencies unless strictly necessary.
- Do not replace deterministic verdicts with LLM-as-judge behavior.
- Do not make universal security or truth claims.
- Make substantive, reviewable correctness/security improvements to the core implementation and prove them with regression tests.

Review targets to verify rather than blindly assume:

A. Candidate-rule and policy validation
- Check whether nested `when` clauses are validated against the closed field/operator vocabulary.
- Check whether condition IDs must be unique.
- Check whether `requiresHumanApproval` is enforced as true before approval/compilation.
- Check whether empty or malformed citation quotes can pass validation.
- Check whether the compiled DSL preserves only validated data.

B. Static-file serving boundary
- `server.mjs` currently uses a string-prefix containment check after resolving paths.
- Verify whether a sibling directory with a shared prefix can bypass this check.
- Verify how malformed percent-encoded URLs are handled.

Tasks:
1. Inspect the implementation and document which suspected issues are real and which are not.
2. Harden candidate-rule and compiled-policy validation where needed while keeping the closed DSL compatible with the current fixture.
3. Harden static-file containment using a boundary-safe method such as `path.relative`; do not rely on a raw string prefix.
4. Return a controlled 400 response for malformed URL encoding without terminating the server.
5. Add regression tests for every verified issue, including:
   - nested `when` validation;
   - duplicate condition IDs;
   - human-approval requirement;
   - malformed/empty citations where applicable;
   - normal static-file loading;
   - traversal and prefix-collision rejection;
   - malformed URI handling without server termination.
6. Refactor only where it makes the trust boundary clearer. Keep the runtime dependency-free.
7. Run `npm test` and `npm run check`; fix all failures.
8. Update `docs/CODEX_BUILD_LOG.md` with:
   - files inspected;
   - verified findings;
   - design decisions;
   - changes implemented;
   - tests added;
   - exact final check results;
   - residual limitations.
9. Review the README claims against the resulting code and correct any inaccurate claim.
10. Commit the completed changes with a clear message. Push to `main` only if GitHub authentication is already configured; otherwise stop after the commit and show the exact push command.

At the end, provide a concise summary of the architecture and why the final verdict remains deterministic.

Only after the implementation, tests, documentation, and commit are complete, run `/feedback` in this same Codex session and copy the Session ID exactly for the Devpost form.
```

## Required result

- Material review of the core evidence, policy, workflow, server, and tests.
- Verified hardening changes rather than cosmetic edits.
- Regression tests covering every accepted finding.
- Passing `npm test` and `npm run check`.
- Updated build log and truthful README.
- A commit containing the Codex changes.
- One confirmed `/feedback` Session ID from this same primary session.
