import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import endpoint, { handleRequest } from '../api/tab.ts';

const originalFetch = globalThis.fetch;
const previous = { key: process.env.ANTHROPIC_API_KEY, token: process.env.TAB_LIVE_TOKEN };
after(() => {
  globalThis.fetch = originalFetch;
  for (const [key, value] of [['ANTHROPIC_API_KEY', previous.key], ['TAB_LIVE_TOKEN', previous.token]]) {
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
});
let calls = 0;
const request = (body = { q: 'איך מתחילים?' }, options = {}) => new Request('https://desk.example/api/tab', {
  method: 'POST', headers: { 'content-type': 'application/json', 'x-tab-live': 'test-only-token', ...options.headers },
  body: typeof body === 'string' ? body : JSON.stringify(body),
});
const configure = () => {
  process.env.TAB_LIVE_TOKEN = 'test-only-token';
  process.env.ANTHROPIC_API_KEY = 'test-only-key';
  calls = 0;
  globalThis.fetch = async () => { calls++; throw new Error('provider-secret-must-not-leak'); };
};

test('Vercel entrypoint, method guard and fail-closed auth do not need a model key', async () => {
  configure(); delete process.env.ANTHROPIC_API_KEY;
  assert.equal(endpoint.fetch, handleRequest);
  const get = await endpoint.fetch(new Request('https://desk.example/api/tab'));
  assert.equal(get.status, 405); assert.equal(get.headers.get('allow'), 'POST');
  for (const token of ['', 'wrong']) assert.equal((await endpoint.fetch(request(undefined, { headers: { 'x-tab-live': token } }))).status, 401);
  delete process.env.TAB_LIVE_TOKEN;
  assert.equal((await endpoint.fetch(request())).status, 401);
  assert.equal(calls, 0);
});

test('valid token with missing key returns no-store 503 without SDK call', async () => {
  configure(); delete process.env.ANTHROPIC_API_KEY;
  const r = await endpoint.fetch(request());
  assert.equal(r.status, 503); assert.equal(r.headers.get('cache-control'), 'no-store'); assert.equal(calls, 0);
});

test('cross-origin, non-JSON, malformed, oversized and invalid questions never call model', async () => {
  configure();
  assert.equal((await endpoint.fetch(request(undefined, { headers: { origin: 'https://other.example' } }))).status, 403);
  assert.equal((await endpoint.fetch(request(undefined, { headers: { 'content-type': 'text/plain' } }))).status, 415);
  for (const q of ['', ' ', 42, {}, 'x'.repeat(601)]) assert.equal((await endpoint.fetch(request({ q }))).status, 400);
  for (const body of ['{', 'null', '{}']) assert.equal((await endpoint.fetch(request(body))).status, 400);
  assert.equal((await endpoint.fetch(request('x'.repeat(4097)))).status, 413);
  assert.equal(calls, 0);
});

function providerResponse(content = [{ type: 'text', text: 'מתחילים בצעד קטן.' }], stop_reason = 'end_turn') {
  return new Response(JSON.stringify({ id: 'msg_test', type: 'message', role: 'assistant', model: 'test', content, stop_reason, usage: { input_tokens: 1, output_tokens: 1 } }), { headers: { 'content-type': 'application/json' } });
}

test('authorised Hebrew question reaches model and returns text only', async () => {
  configure();
  globalThis.fetch = async (url, init) => {
    calls++;
    assert.equal(new URL(url).hostname, 'api.anthropic.com');
    assert.match(new Headers(init.headers).get('authorization') ?? new Headers(init.headers).get('x-api-key'), /test-only-key/);
    const body = JSON.parse(init.body);
    assert.equal(body.max_tokens, 700);
    assert.match(body.messages[0].content, /איך מתחילים/);
    return providerResponse();
  };
  const r = await endpoint.fetch(request());
  assert.equal(r.status, 200); assert.deepEqual(await r.json(), { answer: 'מתחילים בצעד קטן.' }); assert.equal(calls, 1);
});

test('rate limit, upstream error, invalid JSON, network failure and refusal are safe failures without retries', async () => {
  for (const [response, status] of [
    [() => new Response('{"error":{"type":"rate_limit_error","message":"provider-secret"}}', { status: 429 }), 429],
    [() => new Response('provider-secret', { status: 503 }), 502],
    [() => new Response('invalid JSON', { headers: { 'content-type': 'application/json' } }), 502],
    [() => { throw new Error('provider-secret'); }, 502],
    [() => providerResponse([], 'refusal'), 502],
    [() => providerResponse([], 'end_turn'), 502],
    [() => providerResponse(undefined, 'max_tokens'), 502],
  ]) {
    configure(); globalThis.fetch = async () => { calls++; return response(); };
    const r = await endpoint.fetch(request());
    assert.equal(r.status, status); assert.doesNotMatch(await r.text(), /provider-secret|test-only/); assert.equal(calls, 1);
  }
});

test('provider timeout returns 504 once instead of retrying through the broadcast', async t => {
  configure();
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let started;
  const ready = new Promise(resolve => { started = resolve; });
  globalThis.fetch = (_url, { signal }) => {
    calls++; started();
    return new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))));
  };
  const pending = endpoint.fetch(request());
  await ready; t.mock.timers.tick(18_001);
  const r = await pending;
  assert.equal(r.status, 504); assert.equal(calls, 1);
});

test('routing preserves page mappings and resolves deployed filesystem functions', () => {
  const { routes } = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url)));
  assert.deepEqual(routes.at(-1), { handle: 'filesystem' });
  for (const path of ['/api/tab', '/voice/tab-1.mp3', '/assets/desk.js']) {
    assert.equal(routes.slice(0, -1).some(r => new RegExp(r.src).test(path)), false);
  }
  assert.equal(routes.find(r => r.src === '^/desk$').dest, '/desk.html');
});

test('production JS excludes model SDK and server credential references', () => {
  const folder = new URL('../dist/assets/', import.meta.url);
  for (const name of readdirSync(folder).filter(n => n.endsWith('.js'))) {
    assert.doesNotMatch(readFileSync(new URL(name, folder), 'utf8'), /ELEVENLABS_API_KEY|ELEVENLABS_VOICE_ID|ANTHROPIC_API_KEY|TAB_LIVE_TOKEN|api\.anthropic\.com|test-only-key/);
  }
  for (let i = 1; i <= 5; i++) assert.ok(readFileSync(new URL(`../public/voice/tab-${i}.mp3`, import.meta.url)).length > 1000);
});
