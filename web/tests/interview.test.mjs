import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import ts from 'typescript';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

// Exercise the real component and React lifecycle without a remote speech/model
// service. These are component tests, not real-browser/audio acceptance tests.
const source = readFileSync(new URL('../src/desk/Interview.tsx', import.meta.url), 'utf8');
const generated = new URL(`./.interview-${process.pid}.mjs`, import.meta.url);
writeFileSync(generated, ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText);
const { Interview, SCRIPT } = await import(generated.href);
unlinkSync(generated);
const original = {};
for (const name of ['window', 'location', 'history', 'SpeechSynthesisUtterance', 'Audio', 'fetch']) original[name] = globalThis[name];
after(() => { for (const [name, value] of Object.entries(original)) if (value === undefined) delete globalThis[name]; else globalThis[name] = value; });

async function setup(t, { voice = true, recognition = 'success', url = 'https://desk.example/desk' } = {}) {
  t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });
  const w = new EventTarget();
  w.setTimeout = (...args) => setTimeout(...args); w.clearTimeout = id => clearTimeout(id);
  w.setInterval = (...args) => setInterval(...args); w.clearInterval = id => clearInterval(id);
  const spoken = [], recordings = [], calls = [], active = [];
  w.speechSynthesis = { getVoices: () => voice ? [{ lang: 'he-IL' }] : [], cancel() {}, speak: u => spoken.push(u) };
  globalThis.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
  class Recognition {
    start() {
      w.recognition = this;
      if (recognition === 'throws') throw new Error('denied');
    }
    abort() { this.onend?.(); }
  }
  if (recognition !== 'absent') w.SpeechRecognition = Recognition;
  globalThis.Audio = class {
    duration = 1;
    constructor(url) { this.url = url; recordings.push(this); }
    pause() {}
    play() { this.onloadedmetadata?.(); return Promise.resolve(); }
  };
  globalThis.window = w;
  globalThis.location = new URL(url);
  globalThis.history = { replaceState: (_state, _title, url) => { globalThis.location = new URL(url); } };
  globalThis.fetch = async (url, options) => { calls.push({ url, options }); return url === '/api/tab-voice' ? new Response(null, { status: 503 }) : Response.json({ answer: 'מתחילים בצעד קטן.' }); };
  let renderer;
  await act(async () => { renderer = TestRenderer.create(React.createElement(Interview, { onActive: value => active.push(value) })); });
  t.after(async () => { await act(async () => renderer.unmount()); });
  const key = async key => act(async () => { const e = new Event('keydown'); Object.assign(e, { key }); w.dispatchEvent(e); });
  const input = async (label, value) => act(async () => renderer.root.findByProps({ 'aria-label': label }).props.onChange({ target: { value } }));
  const button = async label => act(async () => renderer.root.findAllByType('button').find(b => b.children.includes(label)).props.onClick());
  const submit = async () => act(async () => renderer.root.findByType('form').props.onSubmit({ preventDefault() {} }));
  const text = () => JSON.stringify(renderer.toJSON());
  return { w, renderer, key, input, button, submit, text, spoken, recordings, calls, active };
}

test('no token makes no network call; presenter token is masked and never read from URL', async t => {
  const c = await setup(t, { url: 'https://desk.example/desk?live=legacy-secret' });
  assert.equal(location.search, '');
  await c.key('l'); await c.input('שאלה מהקהל', 'איך מתחילים?'); await c.submit();
  assert.equal(c.calls.length, 0); assert.match(c.text(), /אסימון גישה/);
  assert.equal(c.renderer.root.findByProps({ 'aria-label': 'אסימון גישה למגישה' }).props.type, 'password');
});

test('Hebrew speech question flows to API, answer text and Hebrew speech; typing does not advance recordings', async t => {
  const c = await setup(t);
  await c.key('l'); await c.input('אסימון גישה למגישה', 'test-only-token'); await c.button('הקראת שאלה');
  assert.equal(c.w.recognition.lang, 'he-IL'); assert.equal(c.w.recognition.interimResults, false); assert.equal(c.w.recognition.continuous, false);
  await act(async () => c.w.recognition.onresult({ results: [[{ transcript: 'איך מתחילים?' }]] }));
  assert.equal(c.calls[0].url, '/api/tab'); assert.equal(c.calls[0].options.headers['x-tab-live'], 'test-only-token');
  assert.deepEqual(JSON.parse(c.calls[0].options.body), { q: 'איך מתחילים?' });
  assert.match(c.text(), /מתחילים בצעד קטן/); assert.equal(c.spoken.at(-1).lang, 'he-IL');
  await act(async () => { const e = new Event('keydown'); Object.assign(e, { key: 'ArrowRight' }); Object.defineProperty(e, 'target', { value: { closest: () => true } }); c.w.dispatchEvent(e); });
  assert.equal(c.recordings.length, 0);
});

for (const mode of ['absent', 'throws', 'denied', 'no-speech']) test(`recognition ${mode} falls back to typing; missing Hebrew voice retains full answer`, async t => {
  const c = await setup(t, { recognition: mode, voice: false });
  await c.key('l'); await c.input('אסימון גישה למגישה', 'test-only-token'); await c.button('הקראת שאלה');
  if (mode === 'denied') await act(async () => c.w.recognition.onerror({ error: 'not-allowed' }));
  if (mode === 'no-speech') await act(async () => t.mock.timers.tick(12_001));
  assert.match(c.text(), /להקליד/);
  await c.input('שאלה מהקהל', 'איך מתחילים?'); await c.submit();
  assert.match(c.text(), /מתחילים בצעד קטן/); assert.match(c.text(), /קול TAB אינו זמין/); assert.equal(c.spoken.length, 0);
});

test('model HTTP failures, malformed response and network failure have visible recovery', async t => {
  const c = await setup(t); await c.key('l'); await c.input('אסימון גישה למגישה', 'test-only-token'); await c.input('שאלה מהקהל', 'איך מתחילים?');
  for (const status of [401, 429, 502, 503, 504]) {
    globalThis.fetch = async () => new Response('unavailable', { status }); await c.submit(); assert.match(c.text(), /ראיון המוקלט/);
  }
  globalThis.fetch = async () => Response.json({ answer: {} }); await c.submit(); assert.match(c.text(), /לא התקבלה תשובה/);
  globalThis.fetch = async () => { throw new TypeError('Failed to fetch'); }; await c.submit(); assert.match(c.text(), /החיבור לשירות נכשל/);
});

test('request timeout and stale response cannot speak over recorded interview', async t => {
  const c = await setup(t); await c.key('l'); await c.input('אסימון גישה למגישה', 'test-only-token'); await c.input('שאלה מהקהל', 'איך מתחילים?');
  globalThis.fetch = (_url, { signal }) => new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))));
  await c.submit(); await act(async () => t.mock.timers.tick(22_001)); assert.match(c.text(), /זמן ההמתנה הסתיים/);
  let deliver;
  globalThis.fetch = () => new Promise(resolve => { deliver = resolve; });
  await c.submit(); await c.key('ArrowRight');
  await act(async () => { deliver(Response.json({ answer: 'late response' })); t.mock.timers.tick(10_000); });
  assert.equal(c.recordings.at(-1).url, '/voice/tab-1.mp3'); assert.match(c.text(), /אצלך/);
  assert.equal(c.spoken.some(u => u.text === 'late response'), false);
  await c.key('ArrowRight'); assert.equal(c.recordings.at(-1).url, '/voice/tab-2.mp3');
  await c.key('ArrowLeft'); assert.equal(c.recordings.at(-1).url, '/voice/tab-2.mp3');
});

test('speech synthesis failure and recorded-file failure keep the complete text visible', async t => {
  const c = await setup(t); await c.key('l'); await c.input('אסימון גישה למגישה', 'test-only-token'); await c.input('שאלה מהקהל', 'איך מתחילים?'); await c.submit();
  await act(async () => c.spoken.at(-1).onerror()); assert.match(c.text(), /ההשמעה אינה זמינה/); assert.match(c.text(), /מתחילים בצעד קטן/);
  await c.key('ArrowRight');
  await act(async () => c.recordings.at(-1).onerror());
  const index = Number(c.recordings.at(-1).url.match(/tab-(\d+)/)[1]) - 1;
  assert.equal(c.spoken.at(-1).text, SCRIPT[index]); assert.ok(c.text().includes(SCRIPT[index]));
  await c.button('סיום Q&A'); await c.key('l'); assert.equal(c.renderer.root.findByProps({ 'aria-label': 'אסימון גישה למגישה' }).props.value, '');
});


test('ElevenLabs audio plays with no browser Hebrew voice; replay uses cached audio', async t => {
  const c = await setup(t, { voice: false });
  const requests = [];
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options });
    return url === '/api/tab' ? Response.json({ answer: 'שלום דניה.' }) : new Response(new Uint8Array([73,68,51,1]), { headers: { 'content-type': 'audio/mpeg' } });
  };
  await c.key('l'); await c.input('אסימון גישה למגישה', 'test-only-token'); await c.input('שאלה מהקהל', 'שלום'); await c.submit();
  assert.match(c.text(), /שלום דניה/);
  assert.equal(requests[1].url, '/api/tab-voice');
  assert.equal(requests[1].options.headers['x-tab-live'], 'test-only-token');
  assert.deepEqual(JSON.parse(requests[1].options.body), { text: 'שלום דניה.' });
  assert.ok(c.recordings.at(-1).url.startsWith('blob:'));
  assert.equal(c.spoken.length, 0);
  await c.button('השמעת התשובה'); assert.equal(requests.length, 2);
  await c.button('עצירה'); assert.equal(c.renderer.root.findAllByType('button').some(b => b.children.includes('השמעת התשובה')), false);
});

test('late voice generation is discarded after stop without interrupting recorded playback', async t => {
  const c = await setup(t, { voice: false }); let deliver;
  globalThis.fetch = async url => url === '/api/tab' ? Response.json({ answer: 'תשובה חיה' }) : new Promise(resolve => { deliver = resolve; });
  await c.key('l'); await c.input('אסימון גישה למגישה', 'test-only-token'); await c.input('שאלה מהקהל', 'שלום'); await c.submit();
  assert.match(c.text(), /מכין קול/);
  await c.key('ArrowRight'); const recorded = c.recordings.at(-1);
  await act(async () => deliver(new Response(new Uint8Array([73,68,51]), { headers: { 'content-type': 'audio/mpeg' } })));
  assert.equal(c.recordings.at(-1), recorded);
  assert.equal(c.recordings.some(a => a.url.startsWith('blob:')), false);
});
