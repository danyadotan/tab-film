import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import endpoint, { handleVoice } from '../api/tab-voice.ts';
const realFetch = globalThis.fetch;
const envs = ['TAB_LIVE_TOKEN','ELEVENLABS_API_KEY','ELEVENLABS_VOICE_ID'];
const saved = Object.fromEntries(envs.map(k => [k, process.env[k]]));
after(() => { globalThis.fetch = realFetch; for (const k of envs) if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k]; });
let calls;
function setup() {
  process.env.TAB_LIVE_TOKEN = 'voice-test-token';
  process.env.ELEVENLABS_API_KEY = 'voice-test-provider-key';
  process.env.ELEVENLABS_VOICE_ID = 'testVoice123';
  calls = 0;
  globalThis.fetch = async () => { calls++; return new Response(new Uint8Array([73,68,51]), { headers: { 'content-type': 'audio/mpeg' } }); };
}
const req = (body = { text: 'שלום, אני טאב.' }, headers = {}) => new Request('https://desk.example/api/tab-voice', { method: 'POST', headers: { 'content-type': 'application/json', 'x-tab-live': 'voice-test-token', ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) });

test('standalone voice endpoint fails closed before provider use', async () => {
  setup(); assert.equal(endpoint.fetch, handleVoice);
  assert.equal((await handleVoice(new Request('https://desk.example/api/tab-voice'))).status, 405);
  for (const token of ['', 'wrong']) assert.equal((await handleVoice(req(undefined, { 'x-tab-live': token }))).status, 401);
  delete process.env.TAB_LIVE_TOKEN;
  assert.equal((await handleVoice(req())).status, 401);
  assert.equal(calls, 0);
});

test('missing config, foreign origin, invalid JSON and excessive text spend nothing', async () => {
  setup();
  for (const k of ['ELEVENLABS_API_KEY','ELEVENLABS_VOICE_ID']) {
    const old = process.env[k]; delete process.env[k]; assert.equal((await handleVoice(req())).status, 503); process.env[k] = old;
  }
  assert.equal((await handleVoice(req(undefined, { origin: 'https://foreign.example' }))).status, 403);
  assert.equal((await handleVoice(req(undefined, { 'content-type': 'text/plain' }))).status, 415);
  for (const text of ['', 4, {}, 'x'.repeat(2001)]) assert.equal((await handleVoice(req({ text }))).status, 400);
  assert.equal((await handleVoice(req('{'))).status, 400);
  assert.equal((await handleVoice(req('x'.repeat(12001)))).status, 413);
  assert.equal(calls, 0);
});

test('Hebrew text uses configured voice and server key; returns uncached MP3 only', async () => {
  setup();
  globalThis.fetch = async (url, options) => {
    calls++;
    assert.equal(url, 'https://api.elevenlabs.io/v1/text-to-speech/testVoice123?output_format=mp3_44100_128');
    assert.equal(options.headers['xi-api-key'], 'voice-test-provider-key');
    assert.deepEqual(JSON.parse(options.body), { text: 'שלום, אני טאב.', model_id: 'eleven_v3', language_code: 'he' });
    return new Response(new Uint8Array([73,68,51]), { headers: { 'content-type': 'audio/mpeg' } });
  };
  const r = await handleVoice(req());
  assert.equal(r.status, 200); assert.equal(r.headers.get('cache-control'), 'no-store');
  assert.equal(r.headers.get('content-type'), 'audio/mpeg');
  assert.deepEqual([...new Uint8Array(await r.arrayBuffer())], [73,68,51]); assert.equal(calls, 1);
});

test('provider errors, wrong/empty/oversized audio and connection errors are bounded and sanitized', async () => {
  for (const [response, expected] of [
    [() => new Response('secret detail', { status: 401 }), 502],
    [() => new Response('secret detail', { status: 429 }), 429],
    [() => Response.json({ error: 'secret detail' }), 502],
    [() => new Response(new Uint8Array(0), { headers: { 'content-type': 'audio/mpeg' } }), 502],
    [() => new Response(new Uint8Array(2000001), { headers: { 'content-type': 'audio/mpeg' } }), 502],
    [() => { throw new Error('secret detail'); }, 502],
  ]) {
    setup(); globalThis.fetch = async () => { calls++; return response(); };
    const r = await handleVoice(req()); assert.equal(r.status, expected);
    assert.doesNotMatch(await r.text(), /secret detail|voice-test-provider-key/); assert.equal(calls, 1);
  }
});

test('voice deadline aborts once without retries', async t => {
  setup(); t.mock.timers.enable({ apis: ['setTimeout'] });
  let started; const ready = new Promise(resolve => { started = resolve; });
  globalThis.fetch = (_url, { signal }) => { calls++; started(); return new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new Error('Aborted')))); };
  const pending = handleVoice(req()); await ready; t.mock.timers.tick(15001);
  assert.equal((await pending).status, 504); assert.equal(calls, 1);
});
