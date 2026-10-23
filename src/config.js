export const FORMATS = {landscape: {width: 1920, height: 1080}, portrait: {width: 1080, height: 1920}};
const finite = (n, min, max) => typeof n === 'number' && Number.isFinite(n) && n >= min && n <= max;
export function normalizeScript(input) {
  if (!input || !Array.isArray(input.scenes) || input.scenes.length === 0) throw new Error('scenes must be a non-empty array.');
  const fps = input.fps ?? 30;
  if (!Number.isInteger(fps) || !finite(fps, 15, 60)) throw new Error('fps must be an integer from 15 to 60.');
  const format = input.format ?? 'landscape';
  if (!Object.hasOwn(FORMATS, format)) throw new Error('format must be landscape or portrait.');
  const transition = input.transition ?? 0.45;
  if (!finite(transition, 0, 2)) throw new Error('transition must be 0–2 seconds.');
  const scenes = input.scenes.map((s, i) => {
    if (!s || typeof s.text !== 'string' || !s.text.trim()) throw new Error(`Scene ${i + 1}: text is required.`);
    if (s.text.length > 240) throw new Error(`Scene ${i + 1}: use at most 240 characters; split long content into scenes.`);
    const duration = s.duration ?? 3;
    if (!finite(duration, 1, 60)) throw new Error(`Scene ${i + 1}: duration must be 1–60 seconds.`);
    const animation = s.animation ?? ['slide', 'fade', 'typewriter'][i % 3];
    if (!['slide', 'fade', 'typewriter'].includes(animation)) throw new Error(`Scene ${i + 1}: invalid animation.`);
    for (const key of ['background', 'color', 'label']) if (s[key] !== undefined && typeof s[key] !== 'string') throw new Error(`Scene ${i + 1}: ${key} must be a string.`);
    return {...s, text: s.text.trim(), duration, animation, frames: Math.round(duration * fps)};
  });
  // A capped overlap leaves every scene a readable solo interval.
  const overlap = Math.min(Math.round(transition * fps), Math.floor(Math.min(...scenes.map(s => s.frames)) / 3));
  let cursor = 0;
  const timeline = scenes.map((scene, i) => {
    const result = {...scene, start: cursor};
    cursor += scene.frames - (i < scenes.length - 1 ? overlap : 0);
    return result;
  });
  for (const key of ['title', 'background', 'accent']) if (input[key] !== undefined && typeof input[key] !== 'string') throw new Error(`${key} must be a string.`);
  if (input.gradient !== undefined && typeof input.gradient !== 'boolean') throw new Error('gradient must be boolean.');
  const music = input.music ?? null;
  if (music !== null && (typeof music !== 'object' || typeof music.src !== 'string' || !music.src.trim() || /^(https?:|\/|.*\.\.)/.test(music.src))) throw new Error('music.src must be a relative file path inside public/, such as music/track.mp3.');
  if (music && music.volume !== undefined && !finite(music.volume, 0, 1)) throw new Error('music.volume must be 0–1.');
  return {title: 'WORDS IN MOTION', background: '#090c18', accent: '#c5fc60', gradient: true, ...input, music, format, fps, scenes: timeline, overlap, durationInFrames: cursor};
}
export function parseText(text) {
  return {scenes: text.split(/\r?\n/).map(t => t.trim()).filter(Boolean).map(text => ({text, duration: 3}))};
}
