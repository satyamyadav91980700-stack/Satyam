import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  VIDEO_CONFIG,
  SCENE_LIST,
  validateTimelineIntegrity,
} from '../src/utils/timing.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

function assert(cond, msg) {
  if (!cond) {
    throw new Error(`VERIFICATION FAILED: ${msg}`);
  }
}

function main() {
  console.log('=== Remotion 28s SaaS Motion Graphics Verification Suite ===');

  const requiredFiles = [
    'src/theme.ts',
    'src/index.js',
    'src/Root.jsx',
    'src/MainVideo.jsx',
    'src/components/SceneHook.jsx',
    'src/components/SceneAI.jsx',
    'src/components/Scene3D.jsx',
    'src/components/SceneWorkflow.jsx',
    'src/components/SceneCTA.jsx',
    'src/components/SceneDM.jsx',
    'src/components/AnimatedText.jsx',
    'src/components/CinematicSvgDefs.jsx',
    'src/components/Transition.jsx',
    'src/utils/timing.js',
    'src/assets/palette.js',
  ];

  for (const rel of requiredFiles) {
    const full = path.join(ROOT_DIR, rel);
    assert(fs.existsSync(full), `Missing required file: ${rel}`);
  }
  console.log(`✓ All ${requiredFiles.length} architecture files present.`);

  validateTimelineIntegrity();
  const sumFrames = SCENE_LIST.reduce((acc, s) => acc + s.durationInFrames, 0);
  assert(sumFrames === 840, `Scene duration sum (${sumFrames}) !== 840`);
  assert(VIDEO_CONFIG.width === 1080, 'Composition width must be 1080');
  assert(VIDEO_CONFIG.height === 1920, 'Composition height must be 1920');
  assert(VIDEO_CONFIG.fps === 30, 'Composition FPS must be 30');

  // Verify alternating LIGHT / DARK modes
  const expectedModes = ['LIGHT', 'DARK', 'LIGHT', 'DARK', 'LIGHT', 'DARK'];
  SCENE_LIST.forEach((sc, idx) => {
    assert(
      sc.mode === expectedModes[idx],
      `Scene ${sc.id} mode (${sc.mode}) !== ${expectedModes[idx]}`
    );
  });
  console.log(
    `✓ Timeline integrity verified: 6 alternating LIGHT/DARK scenes sum to 840 frames (28.0s @ 30 FPS).`
  );

  const mp4Path = path.join(ROOT_DIR, 'ai-motion-graphics-reel.mp4');
  assert(fs.existsSync(mp4Path), 'Missing rendered MP4: ai-motion-graphics-reel.mp4');

  const ffmpegPath = execFileSync(
    'python3',
    ['-c', 'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())'],
    { encoding: 'utf8' }
  ).trim();

  let probeOut = '';
  try {
    execFileSync(ffmpegPath, ['-i', mp4Path], { encoding: 'utf8', stdio: 'pipe' });
  } catch (err) {
    probeOut = err.stderr || '';
  }

  assert(probeOut.includes('1080x1920'), 'MP4 resolution is not 1080x1920');
  assert(probeOut.includes('30 fps'), 'MP4 frame rate is not 30 fps');
  assert(probeOut.includes('h264'), 'MP4 video codec is not H.264');
  assert(probeOut.includes('aac'), 'MP4 audio codec is not AAC');
  assert(probeOut.includes('00:00:28'), 'MP4 duration is not 28.0s');
  console.log('✓ Rendered MP4 verified: 1080x1920, 30 FPS, 28.00s, H.264 video + AAC audio.');
  console.log('=== ALL CHECKS PASSED ===');
}

main();
