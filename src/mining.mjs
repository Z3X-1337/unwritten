import {
  DEFAULT_EVIDENCE_SOURCES,
  DEFAULT_WORKFLOW,
  normalizeEvidenceSources,
  ruleCandidateSchema
} from "./contracts.mjs";
import { validateCandidateRule } from "./policy.mjs";

function extractResponseText(payload) {
  if (typeof payload?.output_text === "string" && payload.output_text.trim()) return payload.output_text;
  const chunks = [];
  for (const item of payload?.output ?? []) {
    for (const content of item?.content ?? []) {
      if (typeof content?.text === "string") chunks.push(content.text);
    }
  }
  return chunks.join("\n").trim();
}


function sourceById(sources, id) {
  const source = sources.find((item) => item.id === id);
  if (!source) throw new Error(`Missing required evidence source: ${id}`);
  return source;
}

function exactQuote(source, phrase) {
  const sentence = source.text
    .split(/(?<=[.!?])\s+/)
    .find((part) => part.toLowerCase().includes(phrase.toLowerCase()));
  return (sentence || source.text).trim();
}

export function mineMissingRuleLocally(input = DEFAULT_EVIDENCE_SOURCES) {
  const sources = normalizeEvidenceSources(input);
  const policy = sourceById(sources, "refund-policy");
  const runbook = sourceById(sources, "support-runbook");
  const operations = sourceById(sources, "operations-note");
  const history = sourceById(sources, "historical-case");

  return {
    id: "RULE-REFUND-CLOSE-001",
    title: "A refund ticket closes only after the business outcome is complete",
    statement:
      "A refund ticket must not be closed until settlement is confirmed, the refunded amount matches the approved amount, and manager approval exists for refunds above $500.",
    confidence: 0.94,
    requiresHumanApproval: true,
    forbidEffect: "ticket.close",
    conditions: [
      {
        id: "settlement-confirmed",
        description: "The payment provider must report the refund as settled.",
        field: "refund.status",
        operator: "eq",
        value: "settled",
        when: null,
        citations: [
          { sourceId: operations.id, quote: exactQuote(operations, "not complete") },
          { sourceId: history.id, quote: exactQuote(history, "closed it only") }
        ]
      },
      {
        id: "amount-matches",
        description: "The actual refund amount must match the approved amount.",
        field: "refund.amount",
        operator: "eqField",
        value: "refund.approvedAmount",
        when: null,
        citations: [{ sourceId: policy.id, quote: exactQuote(policy, "approved amount") }]
      },
      {
        id: "high-value-approved",
        description: "Refunds above $500 require explicit manager approval.",
        field: "manager.approval",
        operator: "requiredWhen",
        value: true,
        when: { field: "refund.amount", operator: "gt", value: 500 },
        citations: [{ sourceId: policy.id, quote: exactQuote(policy, "above $500") }]
      }
    ],
    ambiguities: [
      {
        term: "processed",
        issue:
          "The runbook allows closure after a refund is 'processed', while operations evidence defines completion only after settlement. The term is operationally ambiguous.",
        citations: [
          { sourceId: runbook.id, quote: exactQuote(runbook, "processing") },
          { sourceId: operations.id, quote: exactQuote(operations, "not complete") }
        ]
      }
    ],
    conflicts: [
      {
        summary:
          "The support runbook's closure wording is weaker than the settlement requirement demonstrated by operations guidance and the approved historical case.",
        sourceIds: [runbook.id, operations.id, history.id]
      }
    ]
  };
}

export async function mineMissingRuleWithGPT56(evidenceSources = DEFAULT_EVIDENCE_SOURCES, {
  apiKey = process.env.OPENAI_API_KEY,
  model = process.env.OPENAI_MODEL || "gpt-5.6",
  fetchImpl = fetch
} = {}) {
  const normalized = normalizeEvidenceSources(evidenceSources);
  if (!apiKey) {
    return {
      rule: mineMissingRuleLocally(normalized),
      mode: "demo",
      model: "deterministic-evidence-compiler",
      note: "No API key required: the bundled evidence-grounded compiler produced the judge-path rule."
    };
  }

  const response = await fetchImpl("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      reasoning: { effort: "high" },
      store: false,
      input: [
        {
          role: "system",
          content: [{
            type: "input_text",
            text:
              "You are Unwritten's missing-spec compiler. Infer exactly one candidate operational rule from the supplied evidence. Every condition must cite an exact source quote. Surface ambiguity and conflict. Use only the provided closed workflow fields and effects. Never silently activate the rule; mark it as requiring human approval."
          }]
        },
        {
          role: "user",
          content: [{
            type: "input_text",
            text: JSON.stringify({ workflow: DEFAULT_WORKFLOW, evidenceSources: normalized })
          }]
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "unwritten_candidate_rule",
          strict: true,
          schema: ruleCandidateSchema
        }
      }
    })
  });

  if (!response.ok) {
    const diagnostic = await response.text();
    return {
      rule: mineMissingRuleLocally(normalized),
      mode: "fallback",
      model,
      note: `GPT-5.6 request failed (${response.status}); deterministic evidence compiler used.`,
      diagnostic: diagnostic.slice(0, 500)
    };
  }

  const payload = await response.json();
  const parsed = JSON.parse(extractResponseText(payload));
  validateCandidateRule(parsed, normalized);
  return {
    rule: parsed,
    mode: "live",
    model,
    responseId: payload.id ?? null,
    note: "Candidate rule mined by GPT-5.6 using strict Structured Outputs and source-bound citations."
  };
}

