import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Player } from '@remotion/player';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/500.css';
import '@fontsource/noto-sans-devanagari/700.css';
import '@fontsource/noto-sans-devanagari/500.css';

import { MainVideo } from './MainVideo.jsx';
import { VIDEO_CONFIG, SCENE_LIST } from './utils/timing.js';
import { SCENE_SCRIPTS } from './assets/voiceoverScript.js';
import { PALETTE } from './assets/palette.js';

const StudioPreviewApp = () => {
  const playerRef = useRef(null);
  const videoRef = useRef(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [showSafeMargins, setShowSafeMargins] = useState(false);
  const [viewMode, setViewMode] = useState('mp4-output'); // 'mp4-output' | 'remotion-player'

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const onFrameUpdate = (e) => {
      if (e && typeof e.detail?.frame === 'number') {
        setCurrentFrame(e.detail.frame);
      }
    };
    player.addEventListener('frameupdate', onFrameUpdate);
    return () => {
      player.removeEventListener('frameupdate', onFrameUpdate);
    };
  }, [viewMode]);

  const activeScene =
    SCENE_LIST.find(
      (s) => currentFrame >= s.startFrame && currentFrame < s.endFrame
    ) || SCENE_LIST[SCENE_LIST.length - 1];

  const jumpToFrame = (f) => {
    setCurrentFrame(f);
    if (viewMode === 'mp4-output' && videoRef.current) {
      videoRef.current.currentTime = f / VIDEO_CONFIG.fps;
      videoRef.current.play().catch(() => {});
    } else if (playerRef.current) {
      playerRef.current.seekTo(f);
    }
  };

  const scriptMap = {
    hook: SCENE_SCRIPTS.scene1,
    aiCore: SCENE_SCRIPTS.scene2,
    threeMoments: SCENE_SCRIPTS.scene3,
    workflow: SCENE_SCRIPTS.scene4,
    cta: SCENE_SCRIPTS.scene5,
    dmPayoff: SCENE_SCRIPTS.scene6,
  };
  const activeScript = scriptMap[activeScene.id];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% 0%, #0F1A38 0%, #05060B 70%)',
        color: PALETTE.coolWhite,
        paddingBottom: 40,
      }}
    >
      {/* Mobile-First Top Bar with Direct MP4 Download & Mode Switcher */}
      <header
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          padding: '14px 16px',
          borderBottom: '1px solid rgba(57, 123, 255, 0.3)',
          background: 'rgba(10, 16, 32, 0.95)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backdropFilter: 'blur(12px)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#10B981',
                boxShadow: '0 0 10px #10B981',
              }}
            />
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: 16,
                letterSpacing: '1px',
              }}
            >
              AI MOTION REEL (1080×1920 MP4)
            </span>
          </div>

          <a
            href="/rendered/ai-motion-graphics-reel.mp4?download=1"
            download="ai-motion-graphics-reel.mp4"
            style={{
              padding: '9px 16px',
              borderRadius: 10,
              border: '1px solid #22D3EE',
              background: 'linear-gradient(135deg, #397BFF, #9B5CFF)',
              color: '#F5F7FF',
              fontWeight: 700,
              fontSize: 13,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 16px rgba(57, 123, 255, 0.45)',
            }}
          >
            ⬇ Download MP4 (8.4 MB)
          </a>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setViewMode('mp4-output')}
            style={{
              flex: 1,
              minWidth: 130,
              padding: '9px 12px',
              borderRadius: 8,
              border:
                viewMode === 'mp4-output'
                  ? `1.5px solid ${PALETTE.cyanGlow}`
                  : '1px solid #243256',
              background:
                viewMode === 'mp4-output' ? PALETTE.electricBlue : '#0C142B',
              color: PALETTE.coolWhite,
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            ▶ MP4 Video Player
          </button>
          <button
            onClick={() => setViewMode('remotion-player')}
            style={{
              flex: 1,
              minWidth: 130,
              padding: '9px 12px',
              borderRadius: 8,
              border:
                viewMode === 'remotion-player'
                  ? `1.5px solid ${PALETTE.neonPurpleBright}`
                  : '1px solid #243256',
              background:
                viewMode === 'remotion-player' ? PALETTE.neonPurple : '#0C142B',
              color: PALETTE.coolWhite,
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Remotion Live Studio
          </button>
        </div>
      </header>

      {/* Main Content Area — Responsive for Mobile & Desktop */}
      <main
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: 960,
          margin: '0 auto',
          padding: '16px',
          gap: '20px',
        }}
      >
        {/* 9:16 Vertical Video Player Box */}
        <div
          style={{
            width: '100%',
            maxWidth: 380,
            aspectRatio: '9 / 16',
            borderRadius: 20,
            overflow: 'hidden',
            border: '2px solid rgba(57, 123, 255, 0.55)',
            boxShadow:
              '0 18px 50px rgba(0, 0, 0, 0.8), 0 0 35px rgba(57, 123, 255, 0.25)',
            background: PALETTE.bgDeepBlack,
            position: 'relative',
          }}
        >
          {viewMode === 'mp4-output' ? (
            <video
              ref={videoRef}
              src="/rendered/ai-motion-graphics-reel.mp4"
              poster="/rendered/stills/scene2-created-with-ai.png"
              controls
              playsInline
              preload="metadata"
              onTimeUpdate={(e) => {
                const f = Math.round(
                  e.currentTarget.currentTime * VIDEO_CONFIG.fps
                );
                setCurrentFrame(Math.min(VIDEO_CONFIG.totalFrames - 1, f));
              }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                background: '#05060B',
              }}
            />
          ) : (
            <Player
              ref={playerRef}
              component={MainVideo}
              inputProps={{
                enableAudio: true,
                showSafeMargins,
              }}
              durationInFrames={VIDEO_CONFIG.totalFrames}
              fps={VIDEO_CONFIG.fps}
              compositionWidth={VIDEO_CONFIG.width}
              compositionHeight={VIDEO_CONFIG.height}
              style={{
                width: '100%',
                height: '100%',
              }}
              controls
              loop
            />
          )}
        </div>

        {/* Scene Jump & Telemetry Section */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div
            style={{
              padding: '14px 16px',
              borderRadius: 14,
              background: 'rgba(10, 16, 32, 0.9)',
              border: '1px solid rgba(57, 123, 255, 0.35)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 12,
                color: PALETTE.cyanGlow,
                fontWeight: 700,
                marginBottom: 6,
              }}
            >
              <span>{activeScene.name.toUpperCase()}</span>
              <span>
                {(currentFrame / VIDEO_CONFIG.fps).toFixed(1)}s / 43.8s
              </span>
            </div>
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.5,
                color: '#F5F7FF',
              }}
            >
              “{activeScript?.hindiText}”
            </p>
          </div>

          <div
            style={{
              padding: '14px 16px',
              borderRadius: 14,
              background: 'rgba(10, 16, 32, 0.9)',
              border: '1px solid rgba(155, 92, 255, 0.3)',
            }}
          >
            <div
              style={{
                fontSize: 12,
                letterSpacing: 1.5,
                color: PALETTE.neonPurpleBright,
                fontWeight: 700,
                marginBottom: 10,
              }}
            >
              JUMP TO SCENE (TAP ANY SCENE)
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))',
                gap: '8px',
              }}
            >
              {SCENE_LIST.map((scene) => {
                const isActive = scene.id === activeScene.id;
                return (
                  <button
                    key={scene.id}
                    onClick={() => jumpToFrame(scene.startFrame + 10)}
                    style={{
                      textAlign: 'left',
                      padding: '10px 12px',
                      borderRadius: 10,
                      cursor: 'pointer',
                      background: isActive
                        ? 'rgba(57, 123, 255, 0.28)'
                        : '#080D1C',
                      border: isActive
                        ? `1.5px solid ${PALETTE.electricBlueBright}`
                        : '1px solid #1C294A',
                      color: PALETTE.coolWhite,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: isActive ? PALETTE.cyanGlow : '#7F91B8',
                        fontWeight: 700,
                      }}
                    >
                      Scene {scene.index} ({(scene.startFrame / 30).toFixed(1)}s)
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 13, marginTop: 2 }}>
                      {scene.name.replace(/^Scene \d+ — /, '')}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const root = createRoot(document.getElementById('root'));
root.render(<StudioPreviewApp />);
