# Codex GPT-5.6 Final Review Prompt

Run this from the root of the `unwritten` repository in a primary Codex session using GPT-5.6.

```text
You are performing the final OpenAI Build Week engineering and security review for Unwritten.

Constraints:
- Preserve the product scope, public UI, evidence model, policy DSL, demo behavior, and deterministic judge story.
- Do not add dependencies unless strictly necessary.
- Make one meaningful, narrowly scoped correctness/security improvement and prove it with regression tests.
- Read AGENTS.md, README.md, docs/JUDGE_START_HERE.md, and the existing tests before editing.

Known review target to verify before changing code:
- server.mjs currently resolves requested static paths and checks them with `resolved.startsWith(publicDir)`.
- Prefix-based path containment can be unsafe when a sibling path shares the same string prefix (for example a directory whose name starts with `public`).
- `decodeURIComponent` can also throw on malformed URL encoding before the server returns a controlled response.

Task:
1. Verify whether these issues are real in the current implementation; do not assume the diagnosis is correct without inspecting the code.
2. Harden static-file path containment using a boundary-safe method such as `path.relative`, ensuring the resolved target is either inside `publicDir` or rejected. Do not rely on a raw string-prefix check.
3. Handle malformed percent-encoded paths without crashing the request handler. Return a controlled 400 response.
4. Add regression tests that demonstrate:
   - normal static files still load;
   - traversal attempts are rejected;
   - prefix-collision paths are rejected;
   - malformed URI encoding receives a controlled client error and does not terminate the server.
5. Keep the server dependency-free and maintain the existing security headers.
6. Run `npm test` and `npm run check`.
7. Update `docs/CODEX_BUILD_LOG.md` with the verified issue, the exact fix, tests added, and final command results.
8. Summarize the diff and any residual risk. Do not claim universal security.

After the work is complete and all checks pass, run `/feedback` in this same Codex session. Copy the Session ID exactly so it can be entered into the Devpost form.
```

## Expected result

The session should produce:

- a real security hardening change in `server.mjs`;
- regression tests for the static path boundary and malformed encoding;
- updated build documentation;
- passing `npm test` and `npm run check` output;
- one confirmed `/feedback` Session ID.
