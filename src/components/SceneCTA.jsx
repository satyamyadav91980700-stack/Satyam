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
import { CursorPointer } from './AnimatedText.jsx';

/**
 * S5 (20-24s, Frames 600-720, duration 120f) — LIGHT (#F7F4EE)
 * Generic Instagram-style profile card (no fake username, only geometric placeholders),
 * cursor clicks blue "Follow" button -> flips to "Following",
 * comment box types "AI" (bold blue) with a blue ripple wipe exit.
 */
export const SceneCTA = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardEnter = springAt(frame, fps, 0, THEME.springs.smooth);
  const isFollowed = frame >= 42;
  const followFlipSpring = springAt(frame, fps, 42, THEME.springs.impact);

  // Typing "AI" in comment box (frames 72..86)
  const typedText = frame < 72 ? '' : frame < 79 ? 'A' : 'AI';
  const aiPopSpring = springAt(frame, fps, 79, THEME.springs.snappy);

  // Cursor path on eased cubic Bezier curve:
  // Segment 1 (0..42): (880, 1280) -> Follow button (690, 745)
  // Segment 2 (48..74): Follow button (690, 745) -> Comment field (540, 1145)
  const seg1T = clampInterp(frame, [6, 40], [0, 1], EASING.easeInOutCubic);
  const seg2T = clampInterp(frame, [48, 72], [0, 1], EASING.easeInOutCubic);

  const cursorPos =
    frame < 48
      ? cubicBezierPoint(
          seg1T,
          { x: 880, y: 1280 },
          { x: 830, y: 960 },
          { x: 760, y: 810 },
          { x: 690, y: 745 }
        )
      : cubicBezierPoint(
          seg2T,
          { x: 675, y: 768 },
          { x: 665, y: 940 },
          { x: 645, y: 1080 },
          { x: 625, y: 1195 }
        );

  const clickRipple =
    frame >= 40 && frame <= 52
      ? clampInterp(frame, [40, 52], [0.05, 1])
      : frame >= 71 && frame <= 83
      ? clampInterp(frame, [71, 83], [0.05, 1])
      : 0;

  // Exit: Blue ripple wipe from comment field (540, 1145) into Dark (#05060B)
  const rippleWipe = clampInterp(
    frame,
    [94, 120],
    [0, 1],
    EASING.easeInOutQuart
  );
  const blueRippleR = clampInterp(rippleWipe, [0, 0.85], [0, 1450]);
  const darkCoreR = clampInterp(rippleWipe, [0.22, 1], [0, 1450]);

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

        {/* Generic Minimalist Instagram-Style Profile Card (No fake username) */}
        <g
          transform={`translate(540, 820) scale(${clampInterp(
            cardEnter,
            [0, 1],
            [0.92, 1]
          )})`}
        >
          {/* Real Drop Shadow */}
          <rect
            x={-390}
            y={-280 + 22}
            width={780}
            height={560}
            rx={44}
            fill="#111111"
            fillOpacity={0.07}
          />
          {/* Card Surface */}
          <rect
            x={-390}
            y={-280}
            width={780}
            height={560}
            rx={44}
            fill="#FFFFFF"
            stroke={THEME.colors.creamBorder}
            strokeWidth={2.5}
          />

          {/* Generic Avatar Circle with Geometric User Silhouette */}
          <g transform="translate(-210, -75)">
            <circle
              cx={0}
              cy={0}
              r={84}
              fill={THEME.colors.softBlueBg}
              stroke={THEME.colors.accentBlue}
              strokeWidth={4}
            />
            <circle cx={0} cy={-16} r={26} fill={THEME.colors.accentBlue} />
            <path
              d="M -44 48 C -44 16, 44 16, 44 48"
              fill={THEME.colors.accentBlue}
            />
          </g>

          {/* Clean Skeleton Placeholder Bars instead of any fake username */}
          <rect
            x={-70}
            y={-172}
            width={240}
            height={22}
            rx={11}
            fill={THEME.colors.creamCard}
          />
          <rect
            x={-70}
            y={-136}
            width={160}
            height={16}
            rx={8}
            fill={THEME.colors.creamBorder}
          />

          {/* Follow / Following Button at (+135, -52) -> Global (675, 768) */}
          <g
            transform={`translate(135, -52) scale(${
              isFollowed
                ? 1 + Math.sin(followFlipSpring * Math.PI) * 0.1
                : 1
            })`}
          >
            <rect
              x={-165}
              y={-42}
              width={330}
              height={84}
              rx={24}
              fill={
                isFollowed ? THEME.colors.softBlueBg : THEME.colors.accentBlue
              }
              stroke={THEME.colors.accentBlue}
              strokeWidth={isFollowed ? 3 : 0}
            />
            <text
              x={0}
              y={1}
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily={THEME.fonts.sans}
              fontWeight={
                isFollowed ? THEME.weights.bold : THEME.weights.medium
              }
              fontSize={36}
              fill={
                isFollowed ? THEME.colors.accentBlue : THEME.colors.textLight
              }
            >
              {isFollowed ? 'Following' : 'Follow'}
            </text>
          </g>

          {/* Minimalist Grid Preview Tiles (Pure Visual Geometry, Zero Extra Text) */}
          {[-230, 0, 230].map((gx, idx) => (
            <rect
              key={`grid-${idx}`}
              x={gx - 95}
              y={55}
              width={190}
              height={170}
              rx={22}
              fill={idx === 1 ? THEME.colors.softBlueBg : THEME.colors.cream}
              stroke={
                idx === 1 ? THEME.colors.glowBlue : THEME.colors.creamBorder
              }
              strokeWidth={2}
            />
          ))}
        </g>

        {/* Comment Input Box at (540, 1185) where "AI" (Bold Blue) is typed */}
        <g transform="translate(540, 1185)">
          <rect
            x={-390}
            y={-58 + 14}
            width={780}
            height={116}
            rx={34}
            fill="#111111"
            fillOpacity={0.06}
          />
          <rect
            x={-390}
            y={-58}
            width={780}
            height={116}
            rx={34}
            fill="#FFFFFF"
            stroke={
              frame >= 70 ? THEME.colors.accentBlue : THEME.colors.creamBorder
            }
            strokeWidth={frame >= 70 ? 3.5 : 2.5}
          />

          {/* Comment Bubble Icon on Left */}
          <circle
            cx={-315}
            cy={0}
            r={26}
            fill={THEME.colors.softBlueBg}
          />
          <path
            d="M -327 -8 H -303 V 8 H -317 L -325 15 V 8 H -327 Z"
            fill={THEME.colors.accentBlue}
          />

          {/* Typed "AI" Keyword in Bold Blue (#2F6BFF) */}
          {typedText.length > 0 && (
            <g
              transform={`scale(${
                typedText === 'AI'
                  ? clampInterp(aiPopSpring, [0, 1], [0.85, 1])
                  : 1
              })`}
            >
              <text
                x={0}
                y={2}
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily={THEME.fonts.sans}
                fontWeight={THEME.weights.bold}
                fontSize={58}
                fill={THEME.colors.accentBlue}
              >
                {typedText}
              </text>
            </g>
          )}

          {/* Blinking Blue Typing Caret */}
          {frame >= 68 && frame < 96 && Math.floor(frame / 4) % 2 === 0 && (
            <line
              x1={typedText.length * 32 + 12}
              y1={-28}
              x2={typedText.length * 32 + 12}
              y2={28}
              stroke={THEME.colors.accentBlue}
              strokeWidth={4}
              strokeLinecap="round"
            />
          )}

          {/* Send Arrow Pill on Right */}
          <circle
            cx={315}
            cy={0}
            r={30}
            fill={
              typedText === 'AI'
                ? THEME.colors.accentBlue
                : THEME.colors.creamCard
            }
          />
          <polyline
            points="305,0 323,0 315,-9 323,0 315,9"
            fill="none"
            stroke={typedText === 'AI' ? '#FFFFFF' : THEME.colors.mutedLight}
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Cursor Layer (Above UI Cards, Below Exit Ripple) */}
        {frame < 94 && (
          <CursorPointer
            x={cursorPos.x}
            y={cursorPos.y}
            clicking={
              (frame >= 40 && frame <= 46) || (frame >= 70 && frame <= 76)
            }
            rippleProgress={clickRipple}
            scale={1.2}
          />
        )}

        {/* Exit Transition: Blue Ripple Wipe into Dark (#05060B) */}
        {rippleWipe > 0.01 && (
          <g>
            <circle
              cx={540}
              cy={1185}
              r={blueRippleR}
              fill={THEME.colors.accentBlue}
            />
            <circle
              cx={540}
              cy={1185}
              r={blueRippleR * 0.9}
              fill={THEME.colors.glowBlue}
              fillOpacity={0.35}
            />
            {darkCoreR > 1 && (
              <circle
                cx={540}
                cy={1185}
                r={darkCoreR}
                fill={THEME.colors.black}
              />
            )}
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};
