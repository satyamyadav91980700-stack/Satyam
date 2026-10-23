import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeScript, parseText} from '../src/config.js';
test('requested minimal JSON works with defaults', () => {
  const s = normalizeScript({scenes: [{text: 'Welcome', duration: 3}, {text: 'Today', duration: 4}]});
  assert.equal(s.fps, 30); assert.equal(s.durationInFrames, 196);
  assert.equal(s.scenes[1].start, 76);
});
test('TXT: ignores blank lines and supports CRLF', () => {
  assert.deepEqual(parseText(' Hello\r\n\r\n World ').scenes, [{text: 'Hello', duration: 3}, {text: 'World', duration: 3}]);
});
test('single scene has no overlap subtraction', () => {
  assert.equal(normalizeScript({scenes: [{text: 'Hello', duration: 3}]}).durationInFrames, 90);
});
test('zero transition and portrait', () => {
  const s = normalizeScript({format: 'portrait', transition: 0, scenes: [{text: 'A'}, {text: 'B'}]});
  assert.equal(s.durationInFrames, 180); assert.equal(s.format, 'portrait');
});
test('overlap is capped for short scenes', () => {
  const s = normalizeScript({transition: 2, scenes: [{text: 'A', duration: 1}, {text: 'B', duration: 1}]});
  assert.equal(s.overlap, 10); assert.equal(s.durationInFrames, 50);
});
test('rejects malformed scripts', () => {
  for (const input of [{}, {scenes: []}, {scenes: [{text: ''}]}, {scenes: [{text: 'A', duration: -1}]}, {scenes: [{text: 'A', animation: 'bad'}]}, {fps: 29.5, scenes: [{text: 'A'}]}, {format: 'bad', scenes: [{text: 'A'}]}, {transition: -1, scenes: [{text: 'A'}]}]) assert.throws(() => normalizeScript(input));
});
test('validates optional music', () => {
  const base = {scenes: [{text: 'A'}]};
  assert.equal(normalizeScript({...base, music: {src: 'music/track.mp3', volume: 0.2}}).music.volume, 0.2);
  for (const music of [{src: '../secret.mp3'}, {src: 'https://example.com/a.mp3'}, {src: 'music/a.mp3', volume: 2}]) assert.throws(() => normalizeScript({...base, music}));
});
