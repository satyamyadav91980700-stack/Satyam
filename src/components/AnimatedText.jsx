import React from 'react';
import { THEME, clampInterp, springAt } from '../theme.ts';

/**
 * Per-Word Spring-In Typography with Light Weight + Bold Blue (#2F6BFF) Keyword
 * Follows Section 1 & Section 4:
 * "Type: Tight sans (Inter), light weight ke saath ek bold blue keyword."
 */
export const KeywordText = ({
  words = [], // Array of { text: string, boldBlue?: boolean, width?: number, gapAfter?: number }
  x = 540,
  y = 320,
  fontSize = 64,
  isDark = false,
  frame = 0,
  fps = 30,
  startFrame = 0,
  stagger = 4,
}) => {
  const baseColor = isDark ? THEME.colors.textLight : THEME.colors.textDark;

  const charUnit = fontSize * 0.54;
  const defaultGap = fontSize * 0.3;
  const metrics = words.map((w, idx) => ({
    ...w,
    width: w.width || w.text.length * charUnit * (w.boldBlue ? 1.06 : 0.96),
    gapAfter:
      idx === words.length - 1
        ? 0
        : w.gapAfter !== undefined
        ? w.gapAfter
        : defaultGap,
  }));
  const totalWidth = metrics.reduce(
    (acc, m) => acc + m.width + m.gapAfter,
    0
  );

  let cursorX = -totalWidth / 2;

  return (
    <g transform={`translate(${x}, ${y})`}>
      {metrics.map((w, idx) => {
        const wStart = startFrame + idx * stagger;
        const prog = springAt(frame, fps, wStart, THEME.springs.snappy);
        const wx = cursorX + w.width / 2;
        cursorX += w.width + w.gapAfter;

        if (prog <= 0.01) return null;
        const liftY = clampInterp(prog, [0, 1], [28, 0]);
        const scale = clampInterp(prog, [0, 1], [0.9, 1]);
        const alpha = clampInterp(prog, [0, 0.5], [0, 1]);
        const strokeColor = w.boldBlue ? THEME.colors.accentBlue : baseColor;

        return (
          <g
            key={`${w.text}-${idx}`}
            transform={`translate(${wx}, ${liftY}) scale(${scale})`}
          >
            {w.text === '→' ? (
              <g>
                <line
                  x1={-fontSize * 0.36}
                  y1={2}
                  x2={fontSize * 0.36}
                  y2={2}
                  stroke={strokeColor}
                  strokeWidth={fontSize * 0.065}
                  strokeLinecap="round"
                  strokeOpacity={alpha}
                />
                <polyline
                  points={`${fontSize * 0.14},${2 - fontSize * 0.22} ${
                    fontSize * 0.38
                  },2 ${fontSize * 0.14},${2 + fontSize * 0.22}`}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={fontSize * 0.065}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeOpacity={alpha}
                />
              </g>
            ) : (
              <text
                x={0}
                y={0}
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily={THEME.fonts.sans}
                fontWeight={
                  w.boldBlue ? THEME.weights.bold : THEME.weights.light
                }
                fontSize={fontSize}
                fill={strokeColor}
                fillOpacity={alpha}
              >
                {w.text}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
};

/**
 * Clean SaaS SVG Cursor with Eased Bezier Motion & Tap Ripple
 * Follows Section 4: "Cursor: SVG hand, eased Bezier path."
 */
export const CursorPointer = ({
  x = 540,
  y = 960,
  clicking = false,
  rippleProgress = 0,
  scale = 1,
}) => {
  const pressScale = clicking ? 0.86 : 1.0;
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale * pressScale})`}>
      {/* Click Ripple Ring */}
      {rippleProgress > 0.01 && rippleProgress < 0.99 && (
        <circle
          cx={0}
          cy={0}
          r={14 + rippleProgress * 46}
          fill="none"
          stroke={THEME.colors.accentBlue}
          strokeWidth={3.5 * (1 - rippleProgress)}
          strokeOpacity={1 - rippleProgress}
        />
      )}
      {/* Soft Cursor Drop Shadow */}
      <path
        d="M 2 6 L 2 42 L 13 33 L 21 50 L 29 46 L 21 29 L 35 29 Z"
        fill="#000000"
        fillOpacity={0.22}
      />
      {/* Crisp SaaS Arrow/Hand Cursor */}
      <path
        d="M 0 0 L 0 38 L 11 29 L 19 46 L 27 42 L 19 25 L 33 25 Z"
        fill="#111111"
        stroke="#FFFFFF"
        strokeWidth={2.8}
        strokeLinejoin="round"
      />
    </g>
  );
};
