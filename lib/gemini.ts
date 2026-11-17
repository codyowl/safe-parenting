import { COACH_SYSTEM_PROMPT, coachJsonSchema, validateCoachReply, type ConversationMessage } from "./coach";

export class CoachServiceError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "CoachServiceError";
  }
}

type GeminiOptions = {
  apiKey?: string;
  model?: string;
  fetchImpl?: typeof fetch;
};

// Imported only by the server route. The browser never receives the API key.
export async function getCoachReply(messages: ConversationMessage[], options: GeminiOptions = {}) {
  const apiKey = options.apiKey ?? process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new CoachServiceError("The coach is not available yet. Please try again later.", 503);
  }

  let response: Response;
  try {
    response = await (options.fetchImpl ?? fetch)("https://generativelanguage.googleapis.com/v1beta/interactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
        "Api-Revision": "2026-05-20",
      },
      body: JSON.stringify({
        model: options.model ?? (process.env.GEMINI_MODEL?.trim() || "gemini-3.5-flash-lite"),
        system_instruction: COACH_SYSTEM_PROMPT,
        input: JSON.stringify({ conversation: messages }),
        store: false,
        generation_config: { max_output_tokens: 1600 },
        response_format: { type: "text", mime_type: "application/json", schema: coachJsonSchema },
      }),
      signal: AbortSignal.timeout(30_000),
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
      throw new CoachServiceError("The coach took too long to respond. Please try again.", 504);
    }
    throw new CoachServiceError("The coach could not connect. Please try again shortly.", 502);
  }

  // Return our messages, never provider error bodies or request headers.
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);

console.error("Gemini diagnostic", {
  httpStatus: response.status,
  status: errorBody?.error?.status,
  message: String(errorBody?.error?.message ?? "")
    .replaceAll(apiKey, "[REDACTED]"),
});
    if (response.status === 429) {
      throw new CoachServiceError("The coach has reached its usage limit. Please try again later.", 429);
    }
    if (response.status === 401 || response.status === 403) {
      throw new CoachServiceError("The coach is temporarily unavailable. Please try again later.", 503);
    }
    throw new CoachServiceError("The coach is temporarily unavailable. Please try again shortly.", 502);
  }

  try {
    const result = await response.json();
    if (result.status !== "completed" || !Array.isArray(result.steps)) throw new Error("Incomplete response");
    const text = result.steps
      .filter((step: { type?: unknown }) => step?.type === "model_output")
      .flatMap((step: { content?: unknown }) => Array.isArray(step.content) ? step.content : [])
      .filter((part: { type?: unknown; text?: unknown }) => part?.type === "text" && typeof part.text === "string")
      .map((part: { text: string }) => part.text)
      .join("\n");
    return validateCoachReply(JSON.parse(text));
  } catch {
    // Invalid or incomplete model output is never rendered as a plan.
    throw new CoachServiceError("The coach couldn't produce a valid response. Please try again.", 502);
  }
}
