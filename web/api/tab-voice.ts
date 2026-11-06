// Presenter-only Hebrew speech. The provider key and voice configuration never
// reach the browser; the existing model endpoint remains independent.
import { createHash, timingSafeEqual } from 'node:crypto';

const noStore = { 'Cache-Control': 'no-store' };
const failure = (status: number, error: string) => Response.json({ error }, { status, headers: noStore });

export async function handleVoice(request: Request): Promise<Response> {
  if (request.method !== 'POST') return new Response(null, { status: 405, headers: { ...noStore, Allow: 'POST' } });
  const token = process.env.TAB_LIVE_TOKEN;
  const supplied = request.headers.get('x-tab-live') ?? '';
  const digest = (s: string) => createHash('sha256').update(s).digest();
  if (!token || !supplied || !timingSafeEqual(digest(token), digest(supplied))) return failure(401, 'Not allowed');
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return failure(403, 'Not allowed');
  const key = process.env.ELEVENLABS_API_KEY;
  const voice = process.env.ELEVENLABS_VOICE_ID;
  if (!key || !voice || !/^[a-zA-Z0-9_-]{1,100}$/.test(voice)) return failure(503, 'Voice unavailable');
  if (!request.headers.get('content-type')?.startsWith('application/json')) return failure(415, 'JSON required');

  let text: string;
  try {
    const reader = request.body?.getReader();
    if (!reader) return failure(400, 'Bad request');
    const parts: Uint8Array[] = []; let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 12_000) { await reader.cancel(); return failure(413, 'Too large'); }
      parts.push(value);
    }
    const body: unknown = JSON.parse(Buffer.concat(parts).toString('utf8'));
    const value = (body as { text?: unknown } | null)?.text;
    if (typeof value !== 'string' || !value.trim() || value.trim().length > 2000) return failure(400, 'Bad request');
    text = value.trim();
  } catch { return failure(400, 'Bad request'); }

  const deadline = new AbortController();
  const timeout = setTimeout(() => deadline.abort(), 15_000);
  try {
    // Only the answer text is sent to the voice provider, never conversation
    // history, presenter credentials or the system prompt. No automatic retry.
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`, {
      method: 'POST',
      headers: { 'xi-api-key': key, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      signal: AbortSignal.any([deadline.signal, request.signal]),
      body: JSON.stringify({ text, model_id: 'eleven_v3', language_code: 'he' }),
    });
    if (!response.ok) {
      await response.body?.cancel();
      return failure(response.status === 429 ? 429 : 502, 'Voice unavailable');
    }
    if (!response.headers.get('content-type')?.startsWith('audio/')) {
      await response.body?.cancel(); return failure(502, 'Invalid audio');
    }
    const reader = response.body?.getReader();
    if (!reader) return failure(502, 'Invalid audio');
    const parts: Uint8Array[] = []; let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 2_000_000) { await reader.cancel(); return failure(502, 'Invalid audio'); }
      parts.push(value);
    }
    if (!size) return failure(502, 'Invalid audio');
    return new Response(Buffer.concat(parts), { headers: { ...noStore, 'Content-Type': 'audio/mpeg', 'X-Content-Type-Options': 'nosniff' } });
  } catch {
    return failure(deadline.signal.aborted ? 504 : 502, 'Voice unavailable');
  } finally { clearTimeout(timeout); }
}

export default { fetch: handleVoice };
