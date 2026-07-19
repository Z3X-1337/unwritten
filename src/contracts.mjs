export const DEFAULT_EVIDENCE_SOURCES = [
  {
    id: "refund-policy",
    title: "Refund Policy",
    kind: "policy",
    text: "Refunds above $500 require manager approval. The approved amount must match the amount returned to the customer."
  },
  {
    id: "support-runbook",
    title: "Support Runbook",
    kind: "runbook",
    text: "Create the refund with the payment provider, then close the support ticket after processing the refund."
  },
  {
    id: "operations-note",
    title: "Payments Operations Note",
    kind: "operations-note",
    text: "A refund is not complete until the provider reports settlement. Pending is not settled and must remain open for follow-up."
  },
  {
    id: "historical-case",
    title: "Approved Historical Case",
    kind: "decision-example",
    text: "For case RF-1842, the provider returned pending. The senior operator kept the ticket open, escalated the case, and closed it only after settlement was confirmed."
  }
];

export const DEFAULT_WORKFLOW = {
  id: "refund-support-workflow",
  name: "Customer-support refund workflow",
  actors: ["support-agent", "payment-provider", "ticket-system", "manager"],
  stateFields: [
    "refund.amount",
    "refund.approvedAmount",
    "refund.status",
    "manager.approval",
    "ticket.status"
  ],
  effects: ["refund.submit", "refund.settle", "ticket.close"]
};

export const ALLOWED_FIELDS = new Set(DEFAULT_WORKFLOW.stateFields);
export const ALLOWED_EFFECTS = new Set(DEFAULT_WORKFLOW.effects);
export const ALLOWED_OPERATORS = new Set(["eq", "eqField", "gt", "requiredWhen"]);

export const ruleCandidateSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "title",
    "statement",
    "confidence",
    "requiresHumanApproval",
    "forbidEffect",
    "conditions",
    "ambiguities",
    "conflicts"
  ],
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    statement: { type: "string" },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    requiresHumanApproval: { type: "boolean" },
    forbidEffect: { type: "string", enum: ["ticket.close"] },
    conditions: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "description", "field", "operator", "value", "when", "citations"],
        properties: {
          id: { type: "string" },
          description: { type: "string" },
          field: { type: "string", enum: [...ALLOWED_FIELDS] },
          operator: { type: "string", enum: [...ALLOWED_OPERATORS] },
          value: {},
          when: {
            anyOf: [
              { type: "null" },
              {
                type: "object",
                additionalProperties: false,
                required: ["field", "operator", "value"],
                properties: {
                  field: { type: "string", enum: [...ALLOWED_FIELDS] },
                  operator: { type: "string", enum: ["gt", "eq"] },
                  value: {}
                }
              }
            ]
          },
          citations: {
            type: "array",
            minItems: 1,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["sourceId", "quote"],
              properties: {
                sourceId: { type: "string" },
                quote: { type: "string" }
              }
            }
          }
        }
      }
    },
    ambiguities: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["term", "issue", "citations"],
        properties: {
          term: { type: "string" },
          issue: { type: "string" },
          citations: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["sourceId", "quote"],
              properties: {
                sourceId: { type: "string" },
                quote: { type: "string" }
              }
            }
          }
        }
      }
    },
    conflicts: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["summary", "sourceIds"],
        properties: {
          summary: { type: "string" },
          sourceIds: { type: "array", items: { type: "string" } }
        }
      }
    }
  }
};

export function normalizeEvidenceSources(input = DEFAULT_EVIDENCE_SOURCES) {
  if (!Array.isArray(input) || input.length < 2 || input.length > 8) {
    throw new Error("Evidence must contain between 2 and 8 sources.");
  }
  const seen = new Set();
  return input.map((source, index) => {
    const id = String(source?.id || `source-${index + 1}`).trim().slice(0, 80);
    if (!id || seen.has(id)) throw new Error("Evidence source IDs must be unique and non-empty.");
    seen.add(id);
    const title = String(source?.title || id).trim().slice(0, 120);
    const kind = String(source?.kind || "document").trim().slice(0, 60);
    const text = String(source?.text || "").trim().slice(0, 8000);
    if (!text) throw new Error(`Evidence source ${id} is empty.`);
    return { id, title, kind, text };
  });
}
