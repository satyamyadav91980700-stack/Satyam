/**
 * Central Timing & Composition Configuration (28s / 840 frames @ 30 FPS)
 * Alternating LIGHT (#F7F4EE) and DARK (#05060B) scenes.
 */

export const VIDEO_CONFIG = {
  width: 1080,
  height: 1920,
  fps: 30,
  totalFrames: 840,
  durationSeconds: 28.0,
  aspectRatio: '9:16',
};

export const SAFE_MARGINS = {
  top: 180,
  bottom: 360,
  left: 84,
  right: 120,
  safeBottomY: 1560,
  centerX: 540,
  visualCenterY: 880,
};

const s1 = {
  id: 'S1',
  index: 1,
  mode: 'LIGHT',
  name: 'S1 (0-4s) — Timeline & Selection Strike',
  start: 0,
  duration: 120,
  startFrame: 0,
  durationInFrames: 120,
  endFrame: 120,
};

const s2 = {
  id: 'S2',
  index: 2,
  mode: 'DARK',
  name: 'S2 (4-9s) — AI Orb & Gradient Ribbons',
  start: 120,
  duration: 150,
  startFrame: 120,
  durationInFrames: 150,
  endFrame: 270,
};

const s3 = {
  id: 'S3',
  index: 3,
  mode: 'LIGHT',
  name: 'S3 (9-15s) — Analog Clock to = 0',
  start: 270,
  duration: 180,
  startFrame: 270,
  durationInFrames: 180,
  endFrame: 450,
};

const s4 = {
  id: 'S4',
  index: 4,
  mode: 'DARK',
  name: 'S4 (15-20s) — Node Graph to Phone Mockup',
  start: 450,
  duration: 150,
  startFrame: 450,
  durationInFrames: 150,
  endFrame: 600,
};

const s5 = {
  id: 'S5',
  index: 5,
  mode: 'LIGHT',
  name: 'S5 (20-24s) — Follow & Comment AI',
  start: 600,
  duration: 120,
  startFrame: 600,
  durationInFrames: 120,
  endFrame: 720,
};

const s6 = {
  id: 'S6',
  index: 6,
  mode: 'DARK',
  name: 'S6 (24-28s) — Paper-Plane DM & Link',
  start: 720,
  duration: 120,
  startFrame: 720,
  durationInFrames: 120,
  endFrame: 840,
};

export const SCENES = {
  S1: s1,
  S2: s2,
  S3: s3,
  S4: s4,
  S5: s5,
  S6: s6,
  hook: s1,
  aiCore: s2,
  threeMoments: s3,
  workflow: s4,
  cta: s5,
  dmPayoff: s6,
};

export const SCENE_LIST = [s1, s2, s3, s4, s5, s6];

export function validateTimelineIntegrity() {
  let cursor = 0;
  for (const scene of SCENE_LIST) {
    if (scene.startFrame !== cursor) {
      throw new Error(
        `Scene ${scene.id} startFrame (${scene.startFrame}) !== cursor (${cursor})`
      );
    }
    if (scene.startFrame + scene.durationInFrames !== scene.endFrame) {
      throw new Error(`Scene ${scene.id} duration mismatch.`);
    }
    cursor += scene.durationInFrames;
  }
  if (cursor !== VIDEO_CONFIG.totalFrames) {
    throw new Error(
      `Total frames (${cursor}) !== VIDEO_CONFIG.totalFrames (${VIDEO_CONFIG.totalFrames})`
    );
  }
  return true;
}

export const calculateReelMetadata = ({ props }) => {
  validateTimelineIntegrity();
  return {
    durationInFrames: VIDEO_CONFIG.totalFrames,
    fps: VIDEO_CONFIG.fps,
    width: VIDEO_CONFIG.width,
    height: VIDEO_CONFIG.height,
    props,
  };
};
