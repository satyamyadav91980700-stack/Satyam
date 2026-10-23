import React from 'react';
import { Composition, Folder } from 'remotion';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/500.css';
import '@fontsource/noto-sans-devanagari/700.css';
import '@fontsource/noto-sans-devanagari/500.css';

import { MainVideo } from './MainVideo.jsx';
import { SceneHook } from './components/SceneHook.jsx';
import { SceneAI } from './components/SceneAI.jsx';
import { Scene3D } from './components/Scene3D.jsx';
import { SceneWorkflow } from './components/SceneWorkflow.jsx';
import { SceneCTA } from './components/SceneCTA.jsx';
import { SceneDM } from './components/SceneDM.jsx';
import {
  VIDEO_CONFIG,
  SCENES,
  calculateReelMetadata,
} from './utils/timing.js';

export const RemotionRoot = () => {
  return (
    <>
      {/* Master 9:16 Instagram Reel Composition */}
      <Composition
        id="AIMotionReel"
        component={MainVideo}
        durationInFrames={VIDEO_CONFIG.totalFrames}
        fps={VIDEO_CONFIG.fps}
        width={VIDEO_CONFIG.width}
        height={VIDEO_CONFIG.height}
        defaultProps={{
          enableAudio: true,
          showSafeMargins: false,
        }}
        calculateMetadata={calculateReelMetadata}
      />

      {/* Individual Storyboard Scene Compositions for Granular Inspection */}
      <Folder name="Storyboard-Scenes">
        <Composition
          id="Scene1-Hook"
          component={SceneHook}
          durationInFrames={SCENES.hook.durationInFrames}
          fps={VIDEO_CONFIG.fps}
          width={VIDEO_CONFIG.width}
          height={VIDEO_CONFIG.height}
        />
        <Composition
          id="Scene2-AICore"
          component={SceneAI}
          durationInFrames={SCENES.aiCore.durationInFrames}
          fps={VIDEO_CONFIG.fps}
          width={VIDEO_CONFIG.width}
          height={VIDEO_CONFIG.height}
        />
        <Composition
          id="Scene3-ThreeMoments"
          component={Scene3D}
          durationInFrames={SCENES.threeMoments.durationInFrames}
          fps={VIDEO_CONFIG.fps}
          width={VIDEO_CONFIG.width}
          height={VIDEO_CONFIG.height}
        />
        <Composition
          id="Scene4-Workflow"
          component={SceneWorkflow}
          durationInFrames={SCENES.workflow.durationInFrames}
          fps={VIDEO_CONFIG.fps}
          width={VIDEO_CONFIG.width}
          height={VIDEO_CONFIG.height}
        />
        <Composition
          id="Scene5-CTA"
          component={SceneCTA}
          durationInFrames={SCENES.cta.durationInFrames}
          fps={VIDEO_CONFIG.fps}
          width={VIDEO_CONFIG.width}
          height={VIDEO_CONFIG.height}
        />
        <Composition
          id="Scene6-DMPayoff"
          component={SceneDM}
          durationInFrames={SCENES.dmPayoff.durationInFrames}
          fps={VIDEO_CONFIG.fps}
          width={VIDEO_CONFIG.width}
          height={VIDEO_CONFIG.height}
        />
      </Folder>
    </>
  );
};
