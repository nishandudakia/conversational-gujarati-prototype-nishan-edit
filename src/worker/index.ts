import { Hono } from "hono";
import { OpenAIEphemeralApiKeyResponseData } from '../types';
import OpenAI from 'openai';

const app = new Hono<{ Bindings: Env }>();

function extractJSON(text: string): string {
  // Remove markdown code blocks if present
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    return jsonMatch[1].trim();
  }
  // If no markdown, assume it's raw JSON
  return text.trim();
}


app.get("/api/heartbeat", (context) => {
  return context.json({ message: 'API available' });
});

/**
 * GET /api/ephemeral-key
 *
 * Mint a short-lived "ephemeral" API key for OpenAI’s Realtime API.
 *
 * @remarks
 * - This endpoint must run server-side because it uses your long-lived
 *   `OPENAI_API_KEY` secret (bound in the Worker/Pages Function environment).
 * - The ephemeral key returned is valid for only a short time: 10 minutes by default.
 *
 * @param context - Hono context object. Exposes:
 *   - `context.env.OPENAI_API_KEY`: The server-side secret (required).
 *   - Request/response helpers like `context.json()`.
 *
 * @returns JSON response with either:
 * ```json
 * { "ephemeralKey": "<short-lived token>" }
 * ```
 * or an error payload like:
 * ```json
 * { "error": "Failed to fetch ephemeral key from OpenAI." }
 * ```
 *
 * @see https://platform.openai.com/docs/api-reference/realtime-sessions/create-realtime-client-secret
 */
app.get("/api/ephemeral-key", async (context) => {
  // The 'context' parameter provides request and response helpers from Hono, such as context.json().
  // http://hono.dev/docs/api/context
  const OPENAI_API_KEY = context.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    return context.json({ error: "OPENAI_API_KEY is not set in environment." }, 500);
  }

  const endpoint = "https://api.openai.com/v1/realtime/client_secrets";
  const headers = {
    "Authorization": `Bearer ${OPENAI_API_KEY}`,
    "Content-Type": "application/json"
  };
  const body = JSON.stringify({
    session: {
      type: "realtime",
      model: "gpt-realtime"
    }
  });

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body
    });

    if (!response.ok) {
      const errorMsg = "Failed to fetch ephemeral key from OpenAI.";
      return context.json({ error: errorMsg }, 502);
    }

    const data: OpenAIEphemeralApiKeyResponseData = await response.json();
    if (!data.value) {
      return context.json({ error: "No ephemeral key returned from OpenAI." }, 502);
    }

    return context.json({ data }); // Success case 

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred.";
    return context.json({ error: errorMessage }, 502);
  }
});


app.post("/api/search", async (context) => {
  const OPENAI_API_KEY = context.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    return context.json({ error: "OPENAI_API_KEY is not set in environment." }, 500);
  }

  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
  const { query } = await context.req.json();

  if (!query) {
    return context.json({ error: "Query is required." }, 400);
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a Gujarati language assistant. Provide Gujarati phrases or words in phonetic English spelling, English translation, and a detailed phonetic breakdown for pronunciation (e.g., syllable breakdown with stress). Respond ONLY with a valid JSON array like: [{"phonetic": "phonetic text", "english": "translation", "breakdown": "syl-la-ble break-down"}]. Do not include any markdown or extra text.'
        },
        {
          role: 'user',
          content: `Provide Gujarati equivalents for: ${query}`
        }
      ],
    });

    const response = completion.choices[0].message.content;
    if (response) {
      const cleanedResponse = extractJSON(response);
      const parsed = JSON.parse(cleanedResponse);
      return context.json({ results: parsed });
    } else {
      return context.json({ error: "No response from OpenAI." }, 502);
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred.";
    return context.json({ error: errorMessage }, 502);
  }
});


export default app;
