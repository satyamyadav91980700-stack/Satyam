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
import { KeywordText } from './AnimatedText.jsx';

/**
 * S6 (24-28s, Frames 720-840, duration 120f) — DARK (#05060B)
 * DM paper-plane icon lifts off, chat bubble sends "Process + Link",
 * notification card stack, on-screen text: "Link → DM" (blue keyword).
 * Last 1s (frames 90-120): clean hold, hard end (no fade).
 */
export const SceneDM = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Notification card stack spring-ins (frames 6..45)
  const stackBackSpring = springAt(frame, fps, 6, THEME.springs.smooth);
  const stackMidSpring = springAt(frame, fps, 14, THEME.springs.smooth);
  const stackTopSpring = springAt(frame, fps, 22, THEME.springs.snappy);

  // DM Paper-Plane lift-off trajectory (frames 4..54), then gentle hover until frame 90,
  // and clean static hold for the last 1s (frames 90..120)
  const planeLiftT = clampInterp(
    frame,
    [4, 52],
    [0, 1],
    EASING.easeOutCubic
  );
  const planePos = cubicBezierPoint(
    planeLiftT,
    { x: 260, y: 1020 },
    { x: 380, y: 840 },
    { x: 460, y: 720 },
    { x: 540, y: 640 }
  );
  // Last 1s (frames 90..120) is a clean hold (zero motion)
  const hoverOffset =
    frame < 90 ? Math.sin(frame * 0.12) * 8 * planeLiftT : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.colors.black }}>
      <svg
        viewBox="0 0 1080 1920"
        width="1080"
        height="1920"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <CinematicSvgDefs />

        {/* Black Background (#05060B) — Hard End (No Fade) */}
        <rect x={0} y={0} width={1080} height={1920} fill={THEME.colors.black} />

        {/* Ambient Blue Halo behind Paper Plane & Notification Stack */}
        <circle cx={540} cy={820} r={460} fill="url(#aiOrbHalo)" />

        {/* Paper-Plane Lift-Off Trail */}
        {planeLiftT > 0.05 && (
          <path
            d="M 260 1020 C 380 840, 460 720, 540 640"
            fill="none"
            stroke="url(#ribbonGrad1)"
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={520}
            strokeDashoffset={520 * (1 - planeLiftT)}
            strokeOpacity={0.75}
          />
        )}

        {/* 3D DM Paper-Plane Icon Lifting Off */}
        <g
          transform={`translate(${planePos.x}, ${
            planePos.y + hoverOffset
          }) rotate(${clampInterp(planeLiftT, [0, 1], [-18, -6])}) scale(${clampInterp(
            planeLiftT,
            [0, 1],
            [0.75, 1.15]
          )})`}
        >
          {/* Glow Aura around Plane */}
          <circle
            cx={0}
            cy={0}
            r={95}
            fill={THEME.colors.accentBlue}
            fillOpacity={0.22}
          />
          {/* Left Wing */}
          <polygon
            points="-68,14 68,-54 -12,28"
            fill={THEME.colors.glowBlue}
          />
          {/* Center Fold (Darker Blue Depth) */}
          <polygon
            points="-12,28 68,-54 6,58"
            fill={THEME.colors.accentBlue}
          />
          {/* Right Wing */}
          <polygon
            points="6,58 68,-54 34,36"
            fill="#FFFFFF"
            fillOpacity={0.92}
          />
        </g>

        {/* Notification Card Stack + Chat Bubble Sending "Process + Link" */}
        <g transform="translate(540, 1020)">
          {/* Back Card (#3 in Stack) */}
          {stackBackSpring > 0.01 && (
            <g
              transform={`translate(0, ${
                92 + (1 - stackBackSpring) * 50
              }) scale(${0.86 * clampInterp(stackBackSpring, [0, 1], [0.85, 1])})`}
            >
              <rect
                x={-360}
                y={-75}
                width={720}
                height={150}
                rx={34}
                fill="#0B0F1C"
                stroke={THEME.colors.darkBorder}
                strokeWidth={2}
                fillOpacity={0.55}
              />
            </g>
          )}

          {/* Middle Card (#2 in Stack) */}
          {stackMidSpring > 0.01 && (
            <g
              transform={`translate(0, ${
                46 + (1 - stackMidSpring) * 45
              }) scale(${0.93 * clampInterp(stackMidSpring, [0, 1], [0.85, 1])})`}
            >
              <rect
                x={-360}
                y={-75}
                width={720}
                height={150}
                rx={34}
                fill="#0E1426"
                stroke={THEME.colors.glowBlue}
                strokeWidth={2}
                fillOpacity={0.78}
                strokeOpacity={0.35}
              />
            </g>
          )}

          {/* Top Notification Card (#1) with Sent Chat Bubble "Process + Link" */}
          {stackTopSpring > 0.01 && (
            <g
              transform={`translate(0, ${
                (1 - stackTopSpring) * 40
              }) scale(${clampInterp(stackTopSpring, [0, 1], [0.85, 1])})`}
            >
              {/* Glossy Dark Notification Card */}
              <rect
                x={-360}
                y={-82}
                width={720}
                height={164}
                rx={36}
                fill="url(#darkGlossCard)"
                stroke={THEME.colors.accentBlue}
                strokeWidth={3}
              />
              {/* Top Specular Edge */}
              <line
                x1={-280}
                y1={-81}
                x2={280}
                y2={-81}
                stroke="#FFFFFF"
                strokeWidth={2}
                strokeOpacity={0.45}
              />

              {/* Avatar Dot + Mini Paper Plane Badge on Left */}
              <circle
                cx={-265}
                cy={0}
                r={42}
                fill={THEME.colors.accentBlue}
                fillOpacity={0.2}
                stroke={THEME.colors.accentBlue}
                strokeWidth={2.5}
              />
              <polygon
                points="-282,4 -246,-14 -264,12 -254,20"
                fill={THEME.colors.glowBlue}
              />

              {/* Sent Chat Bubble inside Card: "Process + Link" */}
              <rect
                x={-190}
                y={-46}
                width={505}
                height={92}
                rx={28}
                fill={THEME.colors.accentBlue}
              />
              <text
                x={62}
                y={2}
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily={THEME.fonts.sans}
                fontWeight={THEME.weights.medium}
                fontSize={42}
                fill={THEME.colors.textLight}
              >
                Process + Link
              </text>
            </g>
          )}
        </g>

        {/* Bottom On-Screen Text: "Link → DM" (with "DM" in bold blue) */}
        <KeywordText
          words={[
            { text: 'Link', boldBlue: false, width: 155 },
            { text: '→', boldBlue: false, width: 80 },
            { text: 'DM', boldBlue: true, width: 145 },
          ]}
          x={540}
          y={1365}
          fontSize={76}
          isDark={true}
          frame={frame}
          fps={fps}
          startFrame={26}
        />
      </svg>
    </AbsoluteFill>
  );
};
