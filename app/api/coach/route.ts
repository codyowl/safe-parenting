import { conversationSchema } from "../../../lib/coach";
import { CoachServiceError, getCoachReply } from "../../../lib/gemini";

export const runtime = "nodejs";
export const maxDuration = 40;
const MAX_BODY_BYTES = 32 * 1024;

function json(value: unknown, status = 200) {
  return Response.json(value, { status, headers: { "Cache-Control": "no-store" } });
}

// Bound the actual bytes read, even if Content-Length is missing or inaccurate.
async function readBody(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new CoachServiceError("Please send a concern to the coach.", 400);
  const decoder = new TextDecoder();
  let bytes = 0;
  let text = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new CoachServiceError("This conversation is too long. Please start a new conversation.", 413);
      }
      text += decoder.decode(value, { stream: true });
    }
    return JSON.parse(text + decoder.decode());
  } catch (error) {
    if (error instanceof CoachServiceError) throw error;
    throw new CoachServiceError("The request could not be read. Please try again.", 400);
  } finally {
    reader.releaseLock();
  }
}

export async function POST(request: Request) {
  try {
    if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
      return json({ error: "Please send the concern as JSON." }, 415);
    }
    const parsed = conversationSchema.safeParse(await readBody(request));
    if (!parsed.success) {
      return json({ error: "Please send a nonempty concern of up to 3,000 characters in a valid conversation of at most 20 messages." }, 400);
    }
    const reply = await getCoachReply(parsed.data.messages);
    return json({ reply });
  } catch (error) {
    if (error instanceof CoachServiceError) return json({ error: error.message }, error.status);
    return json({ error: "The coach is temporarily unavailable. Please try again." }, 500);
  }
}
