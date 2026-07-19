const prompt = `Read AGENTS.md and docs/JUDGE_START_HERE.md.

Act as the final security, product, and evidence-integrity reviewer for Unwritten.

1. Run npm run check.
2. Verify every candidate-rule citation exists verbatim in its evidence source.
3. Verify a rule cannot compile before explicit human approval.
4. Reproduce the minimal vulnerable refund workflow.
5. Confirm the side effect is observed from state, not an LLM verdict.
6. Review the generated guard for overbreadth and utility regressions.
7. Run every unsafe and legitimate replay case.
8. Make one meaningful bounded improvement to technical correctness or the judge experience.
9. Run the complete verification again.
10. Report changed files, exact test results, remaining limitations, and final commit recommendation.

Do not broaden the MVP, add arbitrary code execution, silently activate model-inferred rules, replace deterministic verdicts with model judgment, or weaken the no-key judge path.`;

console.log(prompt);
console.log("\nRun this prompt in the primary Codex session using GPT-5.6, then use /feedback and retain the Session ID for Devpost.");
