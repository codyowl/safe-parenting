// Run from the project folder:
// node --env-file=.env.local scripts/check-gemini.mjs
// Uses Node's built-in fetch; no packages need to be installed.

const apiKey = process.env.GEMINI_API_KEY?.trim();
const model = process.env.GEMINI_MODEL?.trim() || "gemini-3.5-flash-lite";

if (!apiKey || /^(your|paste|replace)/i.test(apiKey)) {
  console.error("Add your Gemini API key to GEMINI_API_KEY in .env.local, save it, then run this command again.");
  process.exit(1);
}

const troubleshooting = {
  400: "Check the key and model name in .env.local. The request may be invalid or the free tier unavailable for this account.",
  401: "Google could not authenticate the key. Check or replace it in .env.local.",
  403: "Check project verification and API-key permissions in Google AI Studio.",
  404: "This model or endpoint is unavailable. Check GEMINI_MODEL against the models available to your project.",
  429: "The project's quota or rate limit was reached. Check the limits in Google AI Studio before retrying.",
};

try {
  console.log(`Testing Gemini with ${model}...`);

  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
      "Api-Revision": "2026-05-20",
    },
    body: JSON.stringify({
      model,
      input: "Reply with exactly: Gemini connection successful.",
      store: false,
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    // Avoid logging provider error bodies, headers, or credentials.
    console.error(`Gemini returned HTTP ${response.status}.`);
    console.error(troubleshooting[response.status] || "Google could not complete the request. Try again later.");
    process.exitCode = 1;
  } else {
    const result = await response.json();
    const reply = (Array.isArray(result.steps) ? result.steps : [])
      .filter((step) => step.type === "model_output")
      .flatMap((step) => Array.isArray(step.content) ? step.content : [])
      .filter((part) => part.type === "text" && typeof part.text === "string")
      .map((part) => part.text)
      .join("\n")
      .trim();

    if (result.status !== "completed" || !reply) {
      console.error("Gemini responded, but did not return a completed text reply. Connection test not passed.");
      process.exitCode = 1;
    } else {
      console.log(`Reply: ${reply.replaceAll(apiKey, "[REDACTED]")}`);
      console.log("Connection test passed. This verifies API access, not the coach's safety behavior.");
    }
  }
} catch (error) {
  console.error(error?.name === "TimeoutError"
    ? "The request timed out after 30 seconds. Check your connection and try again."
    : "The request failed before a usable response arrived. Check network access and try again.");
  process.exitCode = 1;
}
