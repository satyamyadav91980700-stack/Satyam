import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  THEME,
  EASING,
  clampInterp,
  springAt,
  cubicBezierPoint,
} from '../theme.ts';
import { CinematicSvgDefs } from './CinematicSvgDefs.jsx';
import { KeywordText, CursorPointer } from './AnimatedText.jsx';

const SHATTER_TILES = [
  { id: 0, x: -250, y: -90, w: 190, h: 44, dx: -160, dy: -130, rot: -22, color: '#2F6BFF' },
  { id: 1, x: -30, y: -90, w: 220, h: 44, dx: 40, dy: -175, rot: 16, color: '#7FA8FF' },
  { id: 2, x: 220, y: -90, w: 170, h: 44, dx: 185, dy: -115, rot: 25, color: '#111111' },
  { id: 3, x: -210, y: -20, w: 260, h: 44, dx: -210, dy: -20, rot: -15, color: '#7FA8FF' },
  { id: 4, x: 110, y: -20, w: 290, h: 44, dx: 215, dy: 25, rot: 19, color: '#2F6BFF' },
  { id: 5, x: -240, y: 50, w: 180, h: 44, dx: -175, dy: 145, rot: 24, color: '#111111' },
  { id: 6, x: 10, y: 50, w: 250, h: 44, dx: 15, dy: 180, rot: -18, color: '#2F6BFF' },
  { id: 7, x: 245, y: 50, w: 150, h: 44, dx: 195, dy: 140, rot: -26, color: '#7FA8FF' },
  { id: 8, x: -160, y: 120, w: 280, h: 44, dx: -130, dy: 210, rot: 14, color: '#7FA8FF' },
  { id: 9, x: 175, y: 120, w: 210, h: 44, dx: 155, dy: 205, rot: -20, color: '#2F6BFF' },
];

/**
 * S1 (0-4s, Frames 0-120) — LIGHT (#F7F4EE)
 * Timeline UI on cream bg, cursor selects "Alight Motion" / "After Effects" with blue handles,
 * red-less blue ✕ strikes both pills, "NOT made here" appears, timeline tiles scatter & collapse into a blue dot.
 */
export const SceneHook = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardEnter = springAt(frame, fps, 0, THEME.springs.smooth);

  // Selection box drag progress (frames 14..48)
  const selectProg = clampInterp(frame, [14, 48], [0, 1], EASING.easeInOutCubic);

  // Red-less blue ✕ strike at frame 54
  const strikeProg = springAt(frame, fps, 54, THEME.springs.impact);

  // Shatter into tiles (frames 74..98) then collapse into single blue dot (frames 96..118)
  const scatterProg = clampInterp(frame, [74, 96], [0, 1], EASING.easeOutCubic);
  const collapseToDot = clampInterp(frame, [94, 117], [0, 1], EASING.easeInOutQuart);

  // Camera static for 0..102, push-in during last 0.5s (102..120)
  const camPush = clampInterp(frame, [102, 120], [1, 1.24], EASING.easeInCubic);

  // Smooth Bezier Cursor Trajectory across the two pills
  const cursorT = clampInterp(frame, [8, 52], [0, 1], EASING.easeInOutCubic);
  const cursorPos = cubicBezierPoint(
    { x: 200, y: 740 },
    { x: 340, y: 580 },
    { x: 660, y: 690 },
    { x: 865, y: 665 },
    cursorT
  );
  const cursorFadeOut = clampInterp(frame, [72, 86], [1, 0]);

  // Selection marquee bounds
  const selX = 185;
  const selY = 555;
  const selW = clampInterp(selectProg, [0, 1], [12, 710]);
  const selH = clampInterp(selectProg, [0, 1], [24, 130]);

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.colors.cream }}>
      <svg
        viewBox="0 0 1080 1920"
        width="1080"
        height="1920"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <CinematicSvgDefs />

        {/* Cream Background (#F7F4EE) */}
        <rect x={0} y={0} width={1080} height={1920} fill={THEME.colors.cream} />

        {/* Camera Group (Static -> Last 0.5s Push-In) */}
        <g
          transform={`translate(540, 960) scale(${camPush}) translate(-540, -960)`}
        >
          {/* On-Screen Text: "NOT made here" (Bold Blue Keyword "NOT" + Light "#111" "made here") */}
          {frame >= 54 && (
            <KeywordText
              words={[
                { text: 'NOT', boldBlue: true, width: 170 },
                { text: 'made', boldBlue: false, width: 195 },
                { text: 'here', boldBlue: false, width: 165 },
              ]}
              x={540}
              y={370}
              fontSize={74}
              isDark={false}
              frame={frame}
              fps={fps}
              startFrame={54}
            />
          )}

          {/* Software Reference Pills ("Alight Motion" & "After Effects") */}
          {collapseToDot < 0.96 && (
            <g
              transform={`translate(0, ${scatterProg * -28}) scale(${
                1 - collapseToDot * 0.85
              })`}
            >
              {[
                { label: 'Alight Motion', cx: 360, cy: 620, w: 320 },
                { label: 'After Effects', cx: 720, cy: 620, w: 320 },
              ].map((pill, idx) => {
                const hw = pill.w / 2;
                const tilt = scatterProg * (idx === 0 ? -8 : 8);
                return (
                  <g
                    key={pill.label}
                    transform={`translate(${pill.cx}, ${pill.cy}) rotate(${tilt})`}
                  >
                    {/* Soft Elevation Shadow */}
                    <rect
                      x={-hw}
                      y={-36 + 8}
                      width={pill.w}
                      height={76}
                      rx={38}
                      fill="#111111"
                      fillOpacity={0.07 * (1 - collapseToDot)}
                    />
                    {/* White Pill Card */}
                    <rect
                      x={-hw}
                      y={-38}
                      width={pill.w}
                      height={76}
                      rx={38}
                      fill="#FFFFFF"
                      stroke={
                        strikeProg > 0.1
                          ? THEME.colors.accentBlue
                          : THEME.colors.creamBorder
                      }
                      strokeWidth={strikeProg > 0.1 ? 2.5 : 1.5}
                      fillOpacity={1 - collapseToDot}
                    />
                    {/* Pill Label */}
                    <text
                      x={0}
                      y={1}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontFamily={THEME.fonts.sans}
                      fontWeight={THEME.weights.medium}
                      fontSize={32}
                      fill={THEME.colors.textDark}
                      fillOpacity={1 - collapseToDot}
                    >
                      {pill.label}
                    </text>
                    {/* Blue Strikethrough Line */}
                    {strikeProg > 0.05 && (
                      <line
                        x1={-hw + 28}
                        y1={1}
                        x2={-hw + 28 + (pill.w - 56) * Math.min(1, strikeProg)}
                        y2={1}
                        stroke={THEME.colors.accentBlue}
                        strokeWidth={4.5}
                        strokeLinecap="round"
                      />
                    )}
                  </g>
                );
              })}

              {/* Blue Selection Box with Blue Selection Handles */}
              {selectProg > 0.02 && collapseToDot < 0.4 && (
                <g>
                  <rect
                    x={selX}
                    y={selY}
                    width={selW}
                    height={selH}
                    rx={16}
                    fill={THEME.colors.glowBlue}
                    fillOpacity={0.14 * (1 - scatterProg)}
                    stroke={THEME.colors.accentBlue}
                    strokeWidth={2.5}
                    strokeDasharray="8 6"
                    strokeOpacity={1 - scatterProg}
                  />
                  {/* Left Selection Handle */}
                  <line
                    x1={selX}
                    y1={selY - 14}
                    x2={selX}
                    y2={selY + selH}
                    stroke={THEME.colors.accentBlue}
                    strokeWidth={3}
                    strokeOpacity={1 - scatterProg}
                  />
                  <circle
                    cx={selX}
                    cy={selY - 16}
                    r={9}
                    fill={THEME.colors.accentBlue}
                    fillOpacity={1 - scatterProg}
                  />
                  {/* Right Selection Handle */}
                  <line
                    x1={selX + selW}
                    y1={selY}
                    x2={selX + selW}
                    y2={selY + selH + 14}
                    stroke={THEME.colors.accentBlue}
                    strokeWidth={3}
                    strokeOpacity={1 - scatterProg}
                  />
                  <circle
                    cx={selX + selW}
                    cy={selY + selH + 16}
                    r={9}
                    fill={THEME.colors.accentBlue}
                    fillOpacity={1 - scatterProg}
                  />
                </g>
              )}

              {/* Red-less Blue ✕ Strike Badge in Center between Pills */}
              {strikeProg > 0.02 && (
                <g
                  transform={`translate(540, 620) scale(${clampInterp(
                    strikeProg,
                    [0, 1],
                    [0.3, 1]
                  )})`}
                >
                  <circle
                    cx={0}
                    cy={0}
                    r={40}
                    fill={THEME.colors.accentBlue}
                  />
                  <line
                    x1={-15}
                    y1={-15}
                    x2={15}
                    y2={15}
                    stroke="#FFFFFF"
                    strokeWidth={5.5}
                    strokeLinecap="round"
                  />
                  <line
                    x1={15}
                    y1={-15}
                    x2={-15}
                    y2={15}
                    stroke="#FFFFFF"
                    strokeWidth={5.5}
                    strokeLinecap="round"
                  />
                </g>
              )}
            </g>
          )}

          {/* Timeline UI Card & Shattering Tiles */}
          <g
            transform={`translate(540, 1020) scale(${clampInterp(
              cardEnter,
              [0, 1],
              [0.9, 1]
            )})`}
          >
            {/* Base Timeline Container (fades out as tiles scatter) */}
            {scatterProg < 0.65 && (
              <g>
                <rect
                  x={-420}
                  y={-210 + 18}
                  width={840}
                  height={420}
                  rx={32}
                  fill="#111111"
                  fillOpacity={0.07 * (1 - scatterProg * 1.5)}
                />
                <rect
                  x={-420}
                  y={-210}
                  width={840}
                  height={420}
                  rx={32}
                  fill="#FFFFFF"
                  stroke={THEME.colors.creamBorder}
                  strokeWidth={2}
                  fillOpacity={1 - scatterProg * 1.5}
                  strokeOpacity={1 - scatterProg * 1.5}
                />
                {/* Track Ruler Ticks */}
                {[-320, -160, 0, 160, 320].map((tx, i) => (
                  <line
                    key={`tick-${i}`}
                    x1={tx}
                    y1={-175}
                    x2={tx}
                    y2={-155}
                    stroke={THEME.colors.creamBorder}
                    strokeWidth={2}
                    strokeOpacity={1 - scatterProg * 1.5}
                  />
                ))}
                {/* Playhead Line */}
                <line
                  x1={-120 + frame * 2.4}
                  y1={-180}
                  x2={-120 + frame * 2.4}
                  y2={175}
                  stroke={THEME.colors.accentBlue}
                  strokeWidth={3}
                  strokeOpacity={1 - scatterProg * 1.5}
                />
                <circle
                  cx={-120 + frame * 2.4}
                  cy={-180}
                  r={8}
                  fill={THEME.colors.accentBlue}
                  fillOpacity={1 - scatterProg * 1.5}
                />
              </g>
            )}

            {/* Timeline Clip Tiles -> Scatter outward then Collapse into Center Blue Dot */}
            {SHATTER_TILES.map((t) => {
              const sx = t.x + t.dx * scatterProg;
              const sy = t.y + t.dy * scatterProg;
              // Collapse toward (0, -60) which corresponds to (540, 960)
              const cx = sx * (1 - collapseToDot);
              const cy = sy * (1 - collapseToDot) + -60 * collapseToDot;
              const rot = t.rot * scatterProg * (1 - collapseToDot);
              const scale = 1 - collapseToDot * 0.88;
              const hw = t.w / 2;
              const hh = t.h / 2;

              return (
                <g
                  key={`tile-${t.id}`}
                  transform={`translate(${cx}, ${cy}) rotate(${rot}) scale(${scale})`}
                >
                  <rect
                    x={-hw}
                    y={-hh}
                    width={t.w}
                    height={t.h}
                    rx={12}
                    fill={collapseToDot > 0.5 ? THEME.colors.accentBlue : t.color}
                    fillOpacity={t.color === '#111111' ? 0.12 : 0.85}
                    stroke={THEME.colors.accentBlue}
                    strokeWidth={1.5}
                  />
                </g>
              );
            })}
          </g>

          {/* Collapsing Blue Dot at (540, 960) that Morphs into S2's Orb */}
          {collapseToDot > 0.15 && (
            <g transform="translate(540, 960)">
              <circle
                cx={0}
                cy={0}
                r={clampInterp(collapseToDot, [0.15, 1], [12, 86])}
                fill="url(#aiOrbHalo)"
              />
              <circle
                cx={0}
                cy={0}
                r={clampInterp(collapseToDot, [0.15, 1], [6, 36])}
                fill={THEME.colors.accentBlue}
              />
            </g>
          )}

          {/* SVG Cursor on Eased Bezier Path */}
          {cursorFadeOut > 0.02 && (
            <CursorPointer
              x={cursorPos.x}
              y={cursorPos.y}
              clicking={frame >= 14 && frame <= 52}
              rippleProgress={clampInterp(frame, [52, 72], [0, 1])}
              scale={cursorFadeOut}
            />
          )}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
