import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';
import { Resvg } from '@resvg/resvg-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

function getFfmpegPath() {
  return execFileSync(
    'python3',
    ['-c', 'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())'],
    { encoding: 'utf8' }
  ).trim();
}

function getFontFiles() {
  return [
    path.join(ROOT_DIR, 'public/fonts/Inter-Light.ttf'),
    path.join(ROOT_DIR, 'public/fonts/Inter-Regular.ttf'),
    path.join(ROOT_DIR, 'public/fonts/Inter-Medium.ttf'),
    path.join(ROOT_DIR, 'public/fonts/Inter-Bold.ttf'),
    path.join(ROOT_DIR, 'public/fonts/SpaceGrotesk-Bold.ttf'),
    path.join(ROOT_DIR, 'public/fonts/SpaceGrotesk-Medium.ttf'),
    path.join(ROOT_DIR, 'public/fonts/NotoSansDevanagari-Bold.ttf'),
    path.join(ROOT_DIR, 'public/fonts/NotoSansDevanagari-Medium.ttf'),
  ];
}

async function prepareSSRBundle() {
  const shimPath = path.join(__dirname, '_remotion-ssr-shim.jsx');
  const entryPath = path.join(__dirname, '_ssr-entry.jsx');
  const bundleOut = path.join(__dirname, '_ssr-bundle.mjs');

  fs.writeFileSync(
    shimPath,
    `
import React from 'react';

let __currentFrame = 0;
let __videoConfig = { width: 1080, height: 1920, fps: 30, durationInFrames: 840 };
let __remotionFns = {};

export function __initRemotionFns(fns) {
  __remotionFns = fns;
}

export function __setRenderState(frame, config) {
  __currentFrame = frame;
  if (config) __videoConfig = { ...__videoConfig, ...config };
}

export function useCurrentFrame() {
  return __currentFrame;
}

export function useVideoConfig() {
  return __videoConfig;
}

export function interpolate(...args) {
  return __remotionFns.interpolate(...args);
}

export function spring(...args) {
  return __remotionFns.spring(...args);
}

export const AbsoluteFill = ({ children }) => <>{children}</>;
export const Sequence = ({ children }) => <>{children}</>;
export const Audio = () => null;
export const staticFile = (p) => p;
`
  );

  fs.writeFileSync(
    entryPath,
    `
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { __setRenderState, __initRemotionFns } from './_remotion-ssr-shim.jsx';
import { SCENES, SCENE_LIST, VIDEO_CONFIG, validateTimelineIntegrity } from '../src/utils/timing.js';
import { SceneHook } from '../src/components/SceneHook.jsx';
import { SceneAI } from '../src/components/SceneAI.jsx';
import { Scene3D } from '../src/components/Scene3D.jsx';
import { SceneWorkflow } from '../src/components/SceneWorkflow.jsx';
import { SceneCTA } from '../src/components/SceneCTA.jsx';
import { SceneDM } from '../src/components/SceneDM.jsx';

const SCENE_COMP_MAP = {
  S1: SceneHook,
  S2: SceneAI,
  S3: Scene3D,
  S4: SceneWorkflow,
  S5: SceneCTA,
  S6: SceneDM,
};

export function initRenderer(remotionModule) {
  __initRemotionFns(remotionModule);
  validateTimelineIntegrity();
}

export function renderFrameSvg(globalFrame) {
  const scene =
    SCENE_LIST.find(
      (s) => globalFrame >= s.startFrame && globalFrame < s.endFrame
    ) || SCENE_LIST[SCENE_LIST.length - 1];

  const localFrame = Math.max(0, globalFrame - scene.startFrame);
  __setRenderState(localFrame, {
    width: VIDEO_CONFIG.width,
    height: VIDEO_CONFIG.height,
    fps: VIDEO_CONFIG.fps,
    durationInFrames: scene.durationInFrames,
  });

  const Comp = SCENE_COMP_MAP[scene.id];
  const markup = ReactDOMServer.renderToStaticMarkup(<Comp />);
  return markup
    .replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')
    .replace('width="100%" height="100%"', 'width="1080" height="1920"')
    .replace(/<g([^>]*?)\\sopacity="([^"]+)"([^>]*)>/g, (match, p1, opStr, p2) => {
      const op = parseFloat(opStr);
      if (isNaN(op) || op <= 0.02) {
        return \`<g\${p1} display="none"\${p2}>\`;
      }
      return \`<g\${p1}\${p2}>\`;
    });
}

export { VIDEO_CONFIG, SCENE_LIST, SCENES };
`
  );

  await esbuild.build({
    entryPoints: [entryPath],
    outfile: bundleOut,
    bundle: true,
    platform: 'node',
    format: 'esm',
    external: ['react', 'react-dom'],
    alias: {
      remotion: shimPath,
    },
    loader: {
      '.js': 'jsx',
      '.jsx': 'jsx',
      '.ts': 'ts',
      '.css': 'empty',
    },
  });

  return { shimPath, entryPath, bundleOut };
}

async function runChunkWorker(bundleOut, startFrame, endFrame, outMp4Path) {
  const realRemotion = await import('remotion');
  const ssrBundle = await import(bundleOut);
  ssrBundle.initRenderer(realRemotion);

  const resvgOpts = {
    fitTo: { mode: 'width', value: 1080 },
    font: {
      fontFiles: getFontFiles(),
      loadSystemFonts: false,
      defaultFontFamily: 'Inter',
    },
  };

  const ffmpegPath = getFfmpegPath();
  const ffProc = spawn(
    ffmpegPath,
    [
      '-y',
      '-f',
      'rawvideo',
      '-pix_fmt',
      'rgba',
      '-s',
      '1080x1920',
      '-r',
      '30',
      '-i',
      'pipe:0',
      '-c:v',
      'libx264',
      '-preset',
      'fast',
      '-crf',
      '20',
      '-pix_fmt',
      'yuv420p',
      outMp4Path,
    ],
    { stdio: ['pipe', 'ignore', 'pipe'] }
  );

  for (let f = startFrame; f < endFrame; f++) {
    const svg = ssrBundle.renderFrameSvg(f);
    const resvg = new Resvg(svg, resvgOpts);
    const pixels = resvg.render().pixels;
    const ok = ffProc.stdin.write(pixels);
    if (!ok) {
      await new Promise((r) => ffProc.stdin.once('drain', r));
    }
    if ((f - startFrame + 1) % 140 === 0) {
      console.log(`  [Worker ${startFrame}..${endFrame}] frame ${f + 1}`);
    }
  }

  ffProc.stdin.end();
  const code = await new Promise((r) => ffProc.on('close', r));
  if (code !== 0) {
    throw new Error(`Worker ffmpeg exited with code ${code}`);
  }
}

async function main() {
  const mode = process.argv[2] || 'full';

  if (mode === 'worker') {
    const bundleOut = process.argv[3];
    const startFrame = parseInt(process.argv[4], 10);
    const endFrame = parseInt(process.argv[5], 10);
    const outMp4 = process.argv[6];
    await runChunkWorker(bundleOut, startFrame, endFrame, outMp4);
    return;
  }

  console.log('Building Remotion SSR frame renderer (840 frames / 28.0s)...');
  const { shimPath, entryPath, bundleOut } = await prepareSSRBundle();

  const cleanup = () => {
    for (const f of [shimPath, entryPath, bundleOut]) {
      if (fs.existsSync(f)) fs.unlinkSync(f);
    }
  };

  const realRemotion = await import('remotion');
  const ssrBundle = await import(bundleOut + `?t=${Date.now()}`);
  ssrBundle.initRenderer(realRemotion);

  const resvgOpts = {
    fitTo: { mode: 'width', value: 1080 },
    font: {
      fontFiles: getFontFiles(),
      loadSystemFonts: false,
      defaultFontFamily: 'Inter',
    },
  };

  const stillsDir = path.join(ROOT_DIR, 'public/rendered/stills');
  fs.mkdirSync(stillsDir, { recursive: true });

  const keyFrames = [
    { frame: 68, name: 's1-light-timeline-not-made-here.png' },
    { frame: 112, name: 's1-light-dot-collapse.png' },
    { frame: 195, name: 's2-dark-ai-orb-ribbons.png' },
    { frame: 320, name: 's3-light-clock-spinning.png' },
    { frame: 385, name: 's3-light-clock-zero.png' },
    { frame: 545, name: 's4-dark-node-graph-phone.png' },
    { frame: 685, name: 's5-light-profile-following-ai.png' },
    { frame: 800, name: 's6-dark-dm-paper-plane-hold.png' },
  ];

  const t0 = Date.now();
  for (const kf of keyFrames) {
    const svg = ssrBundle.renderFrameSvg(kf.frame);
    const resvg = new Resvg(svg, resvgOpts);
    const pngData = resvg.render().asPng();
    fs.writeFileSync(path.join(stillsDir, kf.name), pngData);
  }
  console.log(
    `Rendered ${keyFrames.length} verification stills in ${Date.now() - t0}ms`
  );

  if (mode === 'stills') {
    cleanup();
    return;
  }

  const outDir = path.join(ROOT_DIR, 'public/rendered');
  fs.mkdirSync(outDir, { recursive: true });
  const totalFrames = ssrBundle.VIDEO_CONFIG.totalFrames;
  const midFrame = Math.floor(totalFrames / 2);

  const part1 = path.join(outDir, '_part1.mp4');
  const part2 = path.join(outDir, '_part2.mp4');
  const concatList = path.join(outDir, '_concat.txt');
  const finalMp4 = path.join(outDir, 'ai-motion-graphics-reel.mp4');
  const audioPath = path.join(ROOT_DIR, 'public/audio/master-soundtrack.mp3');

  console.log(
    `Rendering ${totalFrames} frames (1080x1920 @ 30fps = 28.0s) across 2 parallel workers...`
  );
  const tStart = Date.now();

  const spawnWorker = (s, e, out) =>
    new Promise((resolve, reject) => {
      const p = spawn(
        process.execPath,
        [
          fileURLToPath(import.meta.url),
          'worker',
          bundleOut,
          String(s),
          String(e),
          out,
        ],
        { stdio: 'inherit' }
      );
      p.on('close', (code) =>
        code === 0 ? resolve() : reject(new Error(`Worker failed (${code})`))
      );
    });

  await Promise.all([
    spawnWorker(0, midFrame, part1),
    spawnWorker(midFrame, totalFrames, part2),
  ]);

  fs.writeFileSync(concatList, `file '${part1}'\nfile '${part2}'\n`);

  const ffmpegPath = getFfmpegPath();
  execFileSync(ffmpegPath, [
    '-y',
    '-f',
    'concat',
    '-safe',
    '0',
    '-i',
    concatList,
    '-i',
    audioPath,
    '-c:v',
    'copy',
    '-c:a',
    'aac',
    '-b:a',
    '192k',
    '-shortest',
    '-movflags',
    '+faststart',
    finalMp4,
  ]);

  for (const tmp of [part1, part2, concatList]) {
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
  }
  cleanup();

  const rootMp4 = path.join(ROOT_DIR, 'ai-motion-graphics-reel.mp4');
  fs.copyFileSync(finalMp4, rootMp4);

  const sizeMb = (fs.statSync(finalMp4).size / (1024 * 1024)).toFixed(2);
  console.log(
    `Completed 1080x1920 @ 30fps MP4 render in ${(
      (Date.now() - tStart) /
      1000
    ).toFixed(1)}s -> ${finalMp4} (${sizeMb} MB)`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
