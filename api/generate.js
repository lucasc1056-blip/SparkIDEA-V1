import { generateIdea } from "../src/openai.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = typeof request.body === "string" ? JSON.parse(request.body || "{}") : (request.body || {});
    const { idea, secondIdea, materials, projectType, projectTime } = body;
    if (!idea?.trim() && !secondIdea?.trim() && !materials?.trim()) {
      return response.status(400).json({ error: "Please enter an interest, some materials, or both." });
    }

    const combinedIdea = [idea?.trim(), secondIdea?.trim()].filter(Boolean).join("\n\nPlease combine this with the second idea above into one new project.");
    const result = await generateIdea(combinedIdea, projectType, materials?.trim(), projectTime);
    return response.status(200).json({ result });
  } catch (error) {
    console.error("Request failed:", error.message);
    return response.status(500).json({ error: "I couldn’t make an idea right now. Please check the OpenAI key and your internet connection." });
  }
}
