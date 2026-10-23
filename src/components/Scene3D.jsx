import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { THEME, EASING, clampInterp, springAt } from '../theme.ts';
import { CinematicSvgDefs } from './CinematicSvgDefs.jsx';
import { KeywordText } from './AnimatedText.jsx';

/**
 * S3 (9-15s, Frames 270-450, duration 180f) — LIGHT (#F7F4EE)
 * Cream bg, large analog clock spins fast (hours tick fast), then a prompt-card
 * replaces/snaps the clock to "= 0".
 * On-screen text: "Ghanton ki editing" (light) -> "= 0" (bold blue).
 * Exit: clock face circle shape-reveal into dark (#05060B).
 */
export const Scene3D = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const clockEnter = springAt(frame, fps, 0, THEME.springs.smooth);

  // Fast spinning phase (frames 0..86), then snap to 0 at frame 88
  const isSnapped = frame >= 88;
  const spinProgress = clampInterp(frame, [0, 86], [0, 1], EASING.easeInCubic);
  const snapSpring = springAt(frame, fps, 88, THEME.springs.impact);

  // Minute hand spins 6 full turns (2160 deg) then snaps to 0 deg (12 o'clock)
  const minuteAngle = isSnapped
    ? (1 - snapSpring) * -45
    : spinProgress * 2160;
  // Hour hand spins 180 deg then snaps to 0 deg
  const hourAngle = isSnapped
    ? (1 - snapSpring) * -28
    : spinProgress * 540;

  // Exit: Clock face circle shape-reveal into dark (#05060B) (frames 152..180)
  const circleReveal = clampInterp(
    frame,
    [152, 180],
    [0, 1],
    EASING.easeInOutQuart
  );
  const darkCircleRadius = clampInterp(circleReveal, [0, 1], [16, 1250]);

  const clockR = 250;

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

        {/* Large Minimalist Analog Clock at (540, 820) */}
        <g
          transform={`translate(540, 820) scale(${clampInterp(
            clockEnter,
            [0, 1],
            [0.82, 1]
          )})`}
        >
          {/* Soft Real Elevation Shadow */}
          <circle
            cx={0}
            cy={24}
            r={clockR + 12}
            fill="#111111"
            fillOpacity={0.08}
          />

          {/* Main Clock Face */}
          <circle
            cx={0}
            cy={0}
            r={clockR}
            fill="#FFFFFF"
            stroke={
              isSnapped ? THEME.colors.accentBlue : THEME.colors.creamBorder
            }
            strokeWidth={isSnapped ? 5 : 3}
          />

          {/* Speed Blur Arc while Spinning Fast */}
          {!isSnapped && spinProgress > 0.15 && (
            <circle
              cx={0}
              cy={0}
              r={clockR * 0.68}
              fill="none"
              stroke={THEME.colors.glowBlue}
              strokeWidth={24}
              strokeDasharray="160 190"
              strokeOpacity={0.22 * spinProgress}
              transform={`rotate(${minuteAngle * 0.7})`}
            />
          )}

          {/* 12 Hour Tick Marks */}
          {Array.from({ length: 12 }).map((_, idx) => {
            const ang = idx * 30;
            const isMajor = idx % 3 === 0;
            return (
              <line
                key={`htick-${idx}`}
                x1={0}
                y1={-clockR + 22}
                x2={0}
                y2={-clockR + (isMajor ? 48 : 34)}
                stroke={
                  isSnapped && idx === 0
                    ? THEME.colors.accentBlue
                    : THEME.colors.textDark
                }
                strokeWidth={isMajor ? 4.5 : 2.5}
                strokeLinecap="round"
                strokeOpacity={isMajor ? 0.85 : 0.35}
                transform={`rotate(${ang})`}
              />
            );
          })}

          {/* Hour Hand */}
          <line
            x1={0}
            y1={18}
            x2={0}
            y2={-clockR * 0.5}
            stroke={THEME.colors.textDark}
            strokeWidth={10}
            strokeLinecap="round"
            transform={`rotate(${hourAngle})`}
          />

          {/* Minute Hand */}
          <line
            x1={0}
            y1={24}
            x2={0}
            y2={-clockR * 0.74}
            stroke={isSnapped ? THEME.colors.accentBlue : THEME.colors.textDark}
            strokeWidth={7}
            strokeLinecap="round"
            transform={`rotate(${minuteAngle})`}
          />

          {/* Snap Shockwave Ring when Clock Snaps to = 0 */}
          {isSnapped && snapSpring < 0.98 && (
            <circle
              cx={0}
              cy={0}
              r={clockR + snapSpring * 75}
              fill="none"
              stroke={THEME.colors.accentBlue}
              strokeWidth={4 * (1 - snapSpring)}
              strokeOpacity={1 - snapSpring}
            />
          )}

          {/* Sleek Prompt-Card replacing lower clock area at frame 86 */}
          {frame >= 84 && (
            <g
              transform={`translate(0, ${
                115 + (1 - snapSpring) * 45
              }) scale(${clampInterp(snapSpring, [0, 1], [0.75, 1])})`}
            >
              <rect
                x={-165}
                y={-34 + 8}
                width={330}
                height={68}
                rx={34}
                fill="#111111"
                fillOpacity={0.1}
              />
              <rect
                x={-165}
                y={-34}
                width={330}
                height={68}
                rx={34}
                fill={THEME.colors.softBlueBg}
                stroke={THEME.colors.accentBlue}
                strokeWidth={2.5}
              />
              {/* Sparkle Prompt Icon (No extra text beyond listed) */}
              <circle
                cx={-115}
                cy={0}
                r={14}
                fill={THEME.colors.accentBlue}
              />
              <rect
                x={-80}
                y={-6}
                width={155}
                height={12}
                rx={6}
                fill={THEME.colors.accentBlue}
                fillOpacity={0.45}
              />
              <circle
                cx={118}
                cy={0}
                r={18}
                fill={THEME.colors.accentBlue}
              />
              <polyline
                points="111,0 117,6 127,-5"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          )}

          {/* Center Pivot Pin */}
          <circle
            cx={0}
            cy={0}
            r={14}
            fill={isSnapped ? THEME.colors.accentBlue : THEME.colors.textDark}
          />
        </g>

        {/* On-Screen Text: "Ghanton ki editing" (light) + "= 0" (bold blue) */}
        <KeywordText
          words={[
            { text: 'Ghanton', boldBlue: false, width: 255 },
            { text: 'ki', boldBlue: false, width: 65 },
            { text: 'editing', boldBlue: false, width: 215 },
          ]}
          x={540}
          y={1245}
          fontSize={62}
          isDark={false}
          frame={frame}
          fps={fps}
          startFrame={8}
        />

        {isSnapped && (
          <g
            transform={`translate(540, 1385) scale(${clampInterp(
              snapSpring,
              [0, 1],
              [0.5, 1]
            )})`}
          >
            <text
              x={0}
              y={0}
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily={THEME.fonts.sans}
              fontWeight={THEME.weights.bold}
              fontSize={128}
              fill={THEME.colors.accentBlue}
            >
              = 0
            </text>
          </g>
        )}

        {/* Exit Transition: Clock Face Circle Shape-Reveal to Dark (#05060B) */}
        {circleReveal > 0.01 && (
          <circle
            cx={540}
            cy={820}
            r={darkCircleRadius}
            fill={THEME.colors.black}
          />
        )}
      </svg>
    </AbsoluteFill>
  );
};
