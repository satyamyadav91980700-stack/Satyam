import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { THEME } from './theme.ts';
import { SCENES } from './utils/timing.js';
import { SceneHook } from './components/SceneHook.jsx';
import { SceneAI } from './components/SceneAI.jsx';
import { Scene3D } from './components/Scene3D.jsx';
import { SceneWorkflow } from './components/SceneWorkflow.jsx';
import { SceneCTA } from './components/SceneCTA.jsx';
import { SceneDM } from './components/SceneDM.jsx';
import { TransitionOverlay } from './components/Transition.jsx';

export const MainVideo = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.colors.black,
        overflow: 'hidden',
      }}
    >
      {/* Background Music Bed */}
      <Audio src={staticFile('audio/bgm-bed.wav')} volume={0.35} />

      {/* S1 (0-4s, 0-120f) — LIGHT (#F7F4EE): Timeline shatters into blue dot */}
      <Sequence from={SCENES.S1.start} durationInFrames={SCENES.S1.duration}>
        <SceneHook />
      </Sequence>

      {/* S2 (4-9s, 120-270f) — DARK (#05060B): AI core orb + 3 ribbons & cards */}
      <Sequence from={SCENES.S2.start} durationInFrames={SCENES.S2.duration}>
        <SceneAI />
      </Sequence>

      {/* S3 (9-15s, 270-450f) — LIGHT (#F7F4EE): Fast clock -> Prompt card -> "= 0" */}
      <Sequence from={SCENES.S3.start} durationInFrames={SCENES.S3.duration}>
        <Scene3D />
      </Sequence>

      {/* S4 (15-20s, 450-600f) — DARK (#05060B): Node graph Prompt -> AI -> Video phone */}
      <Sequence from={SCENES.S4.start} durationInFrames={SCENES.S4.duration}>
        <SceneWorkflow />
      </Sequence>

      {/* S5 (20-24s, 600-720f) — LIGHT (#F7F4EE): Profile Follow -> Following + "AI" comment */}
      <Sequence from={SCENES.S5.start} durationInFrames={SCENES.S5.duration}>
        <SceneCTA />
      </Sequence>

      {/* S6 (24-28s, 720-840f) — DARK (#05060B): DM paper-plane + "Process + Link" + "Link → DM" */}
      <Sequence from={SCENES.S6.start} durationInFrames={SCENES.S6.duration}>
        <SceneDM />
      </Sequence>

      {/* Top Glow Overlay Layer */}
      <TransitionOverlay />
    </AbsoluteFill>
  );
};
