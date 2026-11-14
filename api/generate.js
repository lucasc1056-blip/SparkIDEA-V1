import { generateIdea } from "../src/openai.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = typeof request.body === "string" ? JSON.parse(request.body || "{}") : (request.body || {});
    const { idea, projectType } = body;
    if (!idea?.trim()) {
      return response.status(400).json({ error: "Please describe an idea or interest first." });
    }

    const result = await generateIdea(idea.trim(), projectType);
    return response.status(200).json({ result });
  } catch (error) {
    console.error("Request failed:", error.message);
    return response.status(500).json({ error: "I couldn’t make an idea right now. Please check the OpenAI key and your internet connection." });
  }
}
