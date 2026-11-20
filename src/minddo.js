import { readFile } from "node:fs/promises";

let cachedKey = null;
let cachedExpiresAt = 0;

async function readEnv(name) {
  if (process.env[name]) return process.env[name].trim();
  try {
    const env = await readFile(new URL("../.env", import.meta.url), "utf8");
    return env.match(new RegExp(`^${name}=(.*)$`, "m"))?.[1]?.trim().replace(/^['"]|['"]$/g, "");
  } catch { return ""; }
}

export async function getKey({ forceRefresh = false } = {}) {
  if (!forceRefresh && cachedKey && Date.now() < cachedExpiresAt) return cachedKey;
  const url = await readEnv("KEYGEN_URL");
  const token = await readEnv("KEYGEN_TOKEN");
  if (!url || !token || url === "paste-here" || token === "paste-here") {
    throw { message: "The AI key service is not configured.", fix: "Set KEYGEN_URL and KEYGEN_TOKEN in .env." };
  }
  let response;
  try {
    response = await fetch(`${url.replace(/\/$/, "")}/api/lookup-key`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
  } catch {
    throw { message: "The AI key service could not be reached.", fix: "Check KEYGEN_URL and the server's internet connection." };
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.apiKey || !payload.expiresAt) {
    throw payload.error?.message && payload.error?.fix ? payload.error : { message: "The AI key service did not return a usable key.", fix: "Check the MindDo key service response and configuration." };
  }
  cachedKey = payload.apiKey;
  cachedExpiresAt = new Date(payload.expiresAt).getTime();
  if (!Number.isFinite(cachedExpiresAt) || cachedExpiresAt <= Date.now()) {
    clearCachedKey();
    throw { message: "The AI key service returned an expired key.", fix: "Check the expiresAt value returned by MindDo." };
  }
  return cachedKey;
}

export function clearCachedKey() { cachedKey = null; cachedExpiresAt = 0; }
