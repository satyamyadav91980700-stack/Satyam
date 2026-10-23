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

/**
 * S4 (15-20s, Frames 450-600, duration 150f) — DARK (#05060B)
 * Node-graph canvas: "Prompt" node -> "AI" node -> "Video" node.
 * Curved connectors draw; "Video" node opens in a phone mockup playing mini frames of this reel.
 * Camera: Lateral tracking. Exit: Phone mockup match-cuts into light profile card.
 */
export const SceneWorkflow = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Lateral camera tracking from left node toward right phone mockup
  const trackProgress = clampInterp(
    frame,
    [8, 118],
    [0, 1],
    EASING.easeInOutCubic
  );
  const cameraPanX = clampInterp(trackProgress, [0, 1], [85, -35]);

  // Node springs
  const promptSpring = springAt(frame, fps, 4, THEME.springs.smooth);
  const aiSpring = springAt(frame, fps, 28, THEME.springs.smooth);
  const videoSpring = springAt(frame, fps, 56, THEME.springs.smooth);

  // Curved connector draw progress
  const conn1Prog = clampInterp(frame, [14, 42], [0, 1], EASING.easeInOutCubic);
  const conn2Prog = clampInterp(frame, [44, 72], [0, 1], EASING.easeInOutCubic);

  // Phone mockup expansion from "Video" node (frames 68..115)
  const phoneOpen = springAt(frame, fps, 68, THEME.springs.smooth);

  // Exit Match-Cut: Phone mockup expands into S5's Cream Profile Card (frames 126..150)
  const matchCut = clampInterp(
    frame,
    [126, 150],
    [0, 1],
    EASING.easeInOutQuart
  );

  // Node coordinates in world space (clean vertical + lateral spacing with zero overlap)
  const p1 = { x: 245, y: 460 };
  const p2 = { x: 650, y: 685 };
  const p3 = { x: 575, y: 1230 };

  // Traveling signal dot on connectors
  const pulse1 = cubicBezierPoint(
    conn1Prog,
    p1,
    { x: 450, y: 460 },
    { x: 445, y: 685 },
    p2
  );
  const pulse2 = cubicBezierPoint(
    conn2Prog,
    p2,
    { x: 650, y: 880 },
    { x: 575, y: 940 },
    p3
  );

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.colors.black }}>
      <svg
        viewBox="0 0 1080 1920"
        width="1080"
        height="1920"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <CinematicSvgDefs />

        {/* Black Background (#05060B) */}
        <rect x={0} y={0} width={1080} height={1920} fill={THEME.colors.black} />

        {/* Subtle Node-Graph Dot Matrix */}
        <g fill="#FFFFFF" fillOpacity={0.07 * (1 - matchCut)}>
          {Array.from({ length: 7 }).map((_, r) =>
            Array.from({ length: 5 }).map((__, c) => (
              <circle
                key={`dot-${r}-${c}`}
                cx={160 + c * 190 + cameraPanX * 0.25}
                cy={360 + r * 200}
                r={3}
              />
            ))
          )}
        </g>

        {/* Lateral Tracking Camera Group */}
        <g transform={`translate(${cameraPanX * (1 - matchCut)}, 0)`}>
          {/* Connector 1: Prompt -> AI */}
          {conn1Prog > 0.01 && (
            <g>
              <path
                d={`M ${p1.x} ${p1.y} C 450 ${p1.y}, 445 ${p2.y}, ${p2.x} ${p2.y}`}
                fill="none"
                stroke={THEME.colors.glowBlue}
                strokeWidth={14}
                strokeLinecap="round"
                strokeDasharray={520}
                strokeDashoffset={520 * (1 - conn1Prog)}
                strokeOpacity={0.18 * (1 - matchCut)}
              />
              <path
                d={`M ${p1.x} ${p1.y} C 450 ${p1.y}, 445 ${p2.y}, ${p2.x} ${p2.y}`}
                fill="none"
                stroke={THEME.colors.accentBlue}
                strokeWidth={5}
                strokeLinecap="round"
                strokeDasharray={520}
                strokeDashoffset={520 * (1 - conn1Prog)}
                strokeOpacity={0.95 * (1 - matchCut)}
              />
              {conn1Prog < 0.99 && (
                <circle
                  cx={pulse1.x}
                  cy={pulse1.y}
                  r={10}
                  fill={THEME.colors.glowBlue}
                />
              )}
            </g>
          )}

          {/* Connector 2: AI -> Video */}
          {conn2Prog > 0.01 && (
            <g>
              <path
                d={`M ${p2.x} ${p2.y} C 650 880, 575 940, ${p3.x} ${p3.y}`}
                fill="none"
                stroke={THEME.colors.glowBlue}
                strokeWidth={14}
                strokeLinecap="round"
                strokeDasharray={580}
                strokeDashoffset={580 * (1 - conn2Prog)}
                strokeOpacity={0.18 * (1 - matchCut)}
              />
              <path
                d={`M ${p2.x} ${p2.y} C 650 880, 575 940, ${p3.x} ${p3.y}`}
                fill="none"
                stroke={THEME.colors.accentBlue}
                strokeWidth={5}
                strokeLinecap="round"
                strokeDasharray={580}
                strokeDashoffset={580 * (1 - conn2Prog)}
                strokeOpacity={0.95 * (1 - matchCut)}
              />
              {conn2Prog < 0.99 && (
                <circle
                  cx={pulse2.x}
                  cy={pulse2.y}
                  r={10}
                  fill={THEME.colors.glowBlue}
                />
              )}
            </g>
          )}

          {/* Node 1: "Prompt" */}
          {promptSpring > 0.01 && (
            <g
              transform={`translate(${p1.x}, ${p1.y}) scale(${
                clampInterp(promptSpring, [0, 1], [0.6, 1]) * (1 - matchCut * 0.4)
              })`}
            >
              <rect
                x={-135}
                y={-56}
                width={270}
                height={112}
                rx={26}
                fill="url(#darkGlossCard)"
                stroke={THEME.colors.glowBlue}
                strokeWidth={2}
                fillOpacity={1 - matchCut}
                strokeOpacity={0.75 * (1 - matchCut)}
              />
              <circle
                cx={-92}
                cy={0}
                r={8}
                fill={THEME.colors.accentBlue}
                fillOpacity={1 - matchCut}
              />
              <text
                x={12}
                y={1}
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily={THEME.fonts.sans}
                fontWeight={THEME.weights.light}
                fontSize={36}
                fill={THEME.colors.textLight}
                fillOpacity={1 - matchCut}
              >
                Prompt
              </text>
            </g>
          )}

          {/* Node 2: "AI" (Bold Blue Keyword Node) */}
          {aiSpring > 0.01 && (
            <g
              transform={`translate(${p2.x}, ${p2.y}) scale(${
                clampInterp(aiSpring, [0, 1], [0.6, 1]) * (1 - matchCut * 0.4)
              })`}
            >
              <circle
                cx={0}
                cy={0}
                r={125}
                fill="url(#aiOrbHalo)"
                fillOpacity={1 - matchCut}
              />
              <rect
                x={-125}
                y={-58}
                width={250}
                height={116}
                rx={28}
                fill="url(#darkGlossCard)"
                stroke={THEME.colors.accentBlue}
                strokeWidth={3}
                fillOpacity={1 - matchCut}
                strokeOpacity={1 - matchCut}
              />
              <text
                x={0}
                y={1}
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily={THEME.fonts.sans}
                fontWeight={THEME.weights.bold}
                fontSize={44}
                fill={THEME.colors.accentBlue}
                fillOpacity={1 - matchCut}
              >
                AI
              </text>
            </g>
          )}

          {/* Node 3: "Video" -> Expands into 9:16 Phone Mockup playing mini frames */}
          {videoSpring > 0.01 && (
            <g
              transform={`translate(${
                clampInterp(matchCut, [0, 1], [p3.x, 540])
              }, ${
                clampInterp(matchCut, [0, 1], [p3.y, 960])
              })`}
            >
              {(() => {
                // Morph dimensions from Node (260x112) -> Phone Mockup (340x600) -> Match-Cut Profile Card (780x580)
                const boxW = clampInterp(
                  matchCut,
                  [0, 1],
                  [clampInterp(phoneOpen, [0, 1], [260, 340]), 780]
                );
                const boxH = clampInterp(
                  matchCut,
                  [0, 1],
                  [clampInterp(phoneOpen, [0, 1], [112, 600]), 580]
                );
                const boxRx = clampInterp(phoneOpen, [0, 1], [26, 44]);

                return (
                  <g>
                    {/* Full-Screen Cream Backdrop Fade during Final Match-Cut */}
                    {matchCut > 0.02 && (
                      <rect
                        x={-1080}
                        y={-1400}
                        width={2160}
                        height={2800}
                        fill={THEME.colors.cream}
                        fillOpacity={matchCut}
                      />
                    )}

                    {/* Outer Phone / Card Frame */}
                    <rect
                      x={-boxW / 2}
                      y={-boxH / 2}
                      width={boxW}
                      height={boxH}
                      rx={boxRx}
                      fill={matchCut > 0.5 ? '#FFFFFF' : '#0B0F1D'}
                      stroke={
                        matchCut > 0.5
                          ? THEME.colors.creamBorder
                          : THEME.colors.accentBlue
                      }
                      strokeWidth={3}
                    />

                    {/* Mini Reel Preview inside the Phone Mockup */}
                    {phoneOpen > 0.25 && matchCut < 0.85 && (
                      <g>
                        {/* Phone Dynamic Island Notch */}
                        <rect
                          x={-48}
                          y={-boxH / 2 + 18}
                          width={96}
                          height={16}
                          rx={8}
                          fill="#05060B"
                          fillOpacity={1 - matchCut}
                        />

                        {/* Mini Animated Frame of this Reel (Orb + Flowing Ribbon + Pulse) */}
                        <circle
                          cx={0}
                          cy={20}
                          r={58 + Math.sin(frame * 0.18) * 6}
                          fill="url(#aiOrbGrad)"
                          fillOpacity={(phoneOpen - 0.2) * (1 - matchCut)}
                        />
                        <path
                          d="M -110 80 C -40 -20, 40 90, 115 -35"
                          fill="none"
                          stroke={THEME.colors.glowBlue}
                          strokeWidth={6}
                          strokeLinecap="round"
                          strokeOpacity={0.85 * (1 - matchCut)}
                        />
                        {/* Mini Playhead Scrubber */}
                        <rect
                          x={-110}
                          y={boxH / 2 - 54}
                          width={220}
                          height={6}
                          rx={3}
                          fill="#FFFFFF"
                          fillOpacity={0.2 * (1 - matchCut)}
                        />
                        <rect
                          x={-110}
                          y={boxH / 2 - 54}
                          width={80 + ((frame * 3) % 140)}
                          height={6}
                          rx={3}
                          fill={THEME.colors.accentBlue}
                          fillOpacity={1 - matchCut}
                        />
                      </g>
                    )}

                    {/* "Video" Node Label */}
                    <text
                      x={0}
                      y={clampInterp(phoneOpen, [0, 1], [1, -boxH / 2 + 78])}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontFamily={THEME.fonts.sans}
                      fontWeight={THEME.weights.light}
                      fontSize={36}
                      fill={THEME.colors.textLight}
                      fillOpacity={1 - matchCut}
                    >
                      Video
                    </text>
                  </g>
                );
              })()}
            </g>
          )}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
