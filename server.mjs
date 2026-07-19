import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_EVIDENCE_SOURCES,
  buildUnwrittenRun,
  mineMissingRuleWithGPT56,
  normalizeEvidenceSources
} from "./src/core.mjs";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(rootDir, "public");
const port = Number(process.env.PORT || 3000);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

function applySecurityHeaders(response) {
  response.setHeader("x-content-type-options", "nosniff");
  response.setHeader("x-frame-options", "DENY");
  response.setHeader("referrer-policy", "no-referrer");
  response.setHeader(
    "content-security-policy",
    "default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'"
  );
  response.setHeader("permissions-policy", "camera=(), microphone=(), geolocation=()");
}

function sendJson(response, statusCode, payload) {
  applySecurityHeaders(response);
  response.writeHead(statusCode, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

async function readJsonBody(request) {
  const chunks = [];
  let bytes = 0;
  for await (const chunk of request) {
    bytes += chunk.length;
    if (bytes > 96 * 1024) throw new Error("Request body exceeds 96 KiB.");
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function normalizePublicPath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const requested = decoded === "/" ? "/index.html" : decoded;
  const resolved = path.resolve(publicDir, `.${requested}`);
  if (!resolved.startsWith(publicDir)) return null;
  return resolved;
}

async function serveStatic(request, response) {
  const filePath = normalizePublicPath(request.url || "/");
  if (!filePath) return sendJson(response, 400, { error: "Invalid path." });
  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) throw new Error("Not a file");
    const content = await readFile(filePath);
    applySecurityHeaders(response);
    response.writeHead(200, {
      "content-type": mimeTypes[path.extname(filePath)] || "application/octet-stream",
      "cache-control": "no-store"
    });
    response.end(content);
  } catch {
    sendJson(response, 404, { error: "Not found." });
  }
}

async function handleApi(request, response) {
  if (request.method === "GET" && request.url === "/api/health") {
    return sendJson(response, 200, {
      status: "ok",
      service: "unwritten",
      gpt56Configured: Boolean(process.env.OPENAI_API_KEY),
      model: process.env.OPENAI_MODEL || "gpt-5.6"
    });
  }

  if (request.method === "GET" && request.url === "/api/example") {
    return sendJson(response, 200, { evidenceSources: DEFAULT_EVIDENCE_SOURCES });
  }

  if (request.method === "POST" && request.url === "/api/compile") {
    try {
      const body = await readJsonBody(request);
      const evidenceSources = normalizeEvidenceSources(body.evidenceSources || DEFAULT_EVIDENCE_SOURCES);
      return sendJson(response, 200, await mineMissingRuleWithGPT56(evidenceSources));
    } catch (error) {
      return sendJson(response, 400, { error: error.message || "Unable to mine the missing rule." });
    }
  }

  if (request.method === "POST" && request.url === "/api/run") {
    try {
      const body = await readJsonBody(request);
      const evidenceSources = normalizeEvidenceSources(body.evidenceSources || DEFAULT_EVIDENCE_SOURCES);
      const compilerResult = await mineMissingRuleWithGPT56(evidenceSources);
      return sendJson(response, 200, await buildUnwrittenRun({ evidenceSources, compilerResult }));
    } catch (error) {
      console.error(error);
      return sendJson(response, 500, {
        error: "Missing-spec verification failed.",
        detail: process.env.NODE_ENV === "production" ? undefined : error.message
      });
    }
  }

  return sendJson(response, 404, { error: "API route not found." });
}

const server = http.createServer(async (request, response) => {
  if (request.url?.startsWith("/api/")) return handleApi(request, response);
  if (request.method !== "GET" && request.method !== "HEAD") {
    return sendJson(response, 405, { error: "Method not allowed." });
  }
  return serveStatic(request, response);
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Unwritten is running at http://localhost:${port}`);
  console.log(
    process.env.OPENAI_API_KEY
      ? `Live evidence compiler enabled with ${process.env.OPENAI_MODEL || "gpt-5.6"}.`
      : "Deterministic judge path enabled. Set OPENAI_API_KEY for live GPT-5.6 Structured Outputs."
  );
});
