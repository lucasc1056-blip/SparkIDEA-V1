import { readFile } from "node:fs/promises";
import OpenAI from "openai";

const brief = await readFile(new URL("../BRIEF.md", import.meta.url), "utf8");
const env = await readFile(new URL("../.env", import.meta.url), "utf8");
const apiKey = env.match(/^OPENAI_API_KEY=(.*)$/m)?.[1]?.trim();
const model = "gpt-5.6-luna";

export async function generateIdea(userIdea) {
  if (!apiKey || apiKey === "paste-your-key-here") throw new Error("Missing OpenAI key");
  const client = new OpenAI({ apiKey });
  const response = await client.responses.create({
    model,
    instructions: `${brief}\n\nSafety requirement: Never suggest dangerous, illegal, or unsafe activities. If an idea could cause harm, replace it with a safe alternative and include: “AI may make mistakes. DO NOT TRUST DANGEROUS ACTIVITIES.” Be kind and encouraging.`,
    input: `The student’s starting idea or interest is: ${userIdea}`
  });
  return response.output_text;
}
