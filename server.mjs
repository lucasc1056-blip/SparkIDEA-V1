import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { generateIdea } from "./src/openai.js";

const root = fileURLToPath(new URL(".", import.meta.url));
const publicDir = join(root, "public");
const port = 3000;
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };

const server = http.createServer(async (request, response) => {
  try {
    if (request.method === "POST" && request.url === "/api/generate") {
      let body = "";
      for await (const chunk of request) body += chunk;
      const { idea, projectType } = JSON.parse(body || "{}");
      if (!idea?.trim()) return sendJson(response, 400, { error: "Please describe an idea or interest first." });
      const result = await generateIdea(idea.trim(), projectType);
      return sendJson(response, 200, { result });
    }

    const pathname = new URL(request.url, "http://localhost").pathname;
    const requested = pathname === "/" ? "/index.html" : pathname;
    const filePath = normalize(join(publicDir, requested));
    if (!filePath.startsWith(publicDir)) return sendText(response, 404, "Not found");
    const file = await readFile(filePath);
    response.writeHead(200, { "Content-Type": types[extname(filePath)] || "text/plain" });
    response.end(file);
  } catch (error) {
    console.error("Request failed:", error.message);
    if (request.url === "/api/generate") return sendJson(response, 500, { error: "I couldn’t make an idea right now. Please check the OpenAI key and your internet connection." });
    sendText(response, 404, "Not found");
  }
});

function sendJson(response, status, data) {
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(JSON.stringify(data));
}

function sendText(response, status, text) {
  response.writeHead(status, { "Content-Type": "text/plain" });
  response.end(text);
}

server.listen(port, () => console.log(`SparkIDEA is running at http://localhost:${port}`));
