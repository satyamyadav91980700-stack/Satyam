import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { THEME, EASING, clampInterp, springAt } from '../theme.ts';
import { CinematicSvgDefs } from './CinematicSvgDefs.jsx';
import { KeywordText } from './AnimatedText.jsx';

const RIBBON_CARDS = [
  {
    id: 'visuals',
    label: 'Visuals',
    startFrame: 18,
    cardX: -245,
    cardY: -335,
    pathD: 'M 0 0 C -110 -80, -280 -160, -245 -335',
    gradId: 'url(#ribbonGrad1)',
  },
  {
    id: 'anim3d',
    label: '3D Animation',
    startFrame: 34,
    cardX: 255,
    cardY: -85,
    pathD: 'M 0 0 C 130 -25, 290 -140, 255 -85',
    gradId: 'url(#ribbonGrad2)',
  },
  {
    id: 'motion',
    label: 'Motion Graphics',
    startFrame: 50,
    cardX: -195,
    cardY: 310,
    pathD: 'M 0 0 C -120 95, -265 180, -195 310',
    gradId: 'url(#ribbonGrad1)',
  },
];

/**
 * S2 (4-9s, Frames 120-270, duration 150f) — DARK (#05060B)
 * Glowing glass AI core orb, 3 gradient ribbons carry glossy cards:
 * "Visuals", "3D Animation", "Motion Graphics". Top label: "AI-GENERATED".
 * Slow 15° orbit; exit pushes camera inside the orb.
 */
export const SceneAI = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Dot-to-Orb morph entrance (frames 0..24)
  const orbSpring = springAt(frame, fps, 0, THEME.springs.smooth);
  const orbRadius = clampInterp(orbSpring, [0, 1], [36, 138]);

  // Slow 15° orbital camera parallax across frames 0..128
  const orbitAngle = clampInterp(frame, [0, 128], [-7.5, 7.5]);
  const parallaxX = Math.sin((orbitAngle * Math.PI) / 180) * 34;
  const parallaxY = Math.cos((orbitAngle * Math.PI) / 180) * 16 - 16;

  // Exit: Camera pushes inside the orb (frames 126..150)
  const pushIntoOrb = clampInterp(frame, [126, 150], [0, 1], EASING.easeInCubic);
  const cameraScale = 1 + pushIntoOrb * 7.8;

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

        {/* Top On-Screen Text: "AI-GENERATED" ("AI" bold blue, "-GENERATED" light white) */}
        <g transform={`translate(${parallaxX * 0.3}, 0)`}>
          <KeywordText
            words={[
              { text: 'AI', boldBlue: true, width: 78, gapAfter: 4 },
              { text: '-GENERATED', boldBlue: false, width: 425 },
            ]}
            x={540}
            y={290}
            fontSize={64}
            isDark={true}
            frame={frame}
            fps={fps}
            startFrame={6}
          />
        </g>

        {/* Camera Orbit + Push-Through Group Centered on the Orb (540, 960) */}
        <g
          transform={`translate(${540 + parallaxX}, ${
            960 + parallaxY
          }) scale(${cameraScale})`}
        >
          {/* Ambient Glow Halo behind AI Core Orb */}
          <circle cx={0} cy={0} r={orbRadius * 2.9} fill="url(#aiOrbHalo)" />

          {/* 3 Flowing Gradient Ribbons & Glossy 3D Cards */}
          {RIBBON_CARDS.map((rc, idx) => {
            const rProg = springAt(frame, fps, rc.startFrame, THEME.springs.smooth);
            if (rProg <= 0.01) return null;

            const dashLen = 650;
            const dashOffset = dashLen * (1 - clampInterp(rProg, [0, 1], [0, 1]));
            const cardScale = clampInterp(rProg, [0.2, 1], [0.65, 1]);
            const cardAlpha = clampInterp(rProg, [0.15, 0.7], [0, 1]) * (1 - pushIntoOrb);
            const floatY = Math.sin(frame * 0.05 + idx * 1.8) * 10;
            const cx = rc.cardX + parallaxX * (0.4 + idx * 0.15);
            const cy = rc.cardY + floatY;

            return (
              <g key={rc.id}>
                {/* Outer Soft Ribbon Glow */}
                <path
                  d={rc.pathD}
                  fill="none"
                  stroke={THEME.colors.glowBlue}
                  strokeWidth={28}
                  strokeLinecap="round"
                  strokeDasharray={dashLen}
                  strokeDashoffset={dashOffset}
                  strokeOpacity={0.2 * (1 - pushIntoOrb)}
                />
                {/* Main Gradient Ribbon */}
                <path
                  d={rc.pathD}
                  fill="none"
                  stroke={rc.gradId}
                  strokeWidth={14}
                  strokeLinecap="round"
                  strokeDasharray={dashLen}
                  strokeDashoffset={dashOffset}
                  strokeOpacity={0.92 * (1 - pushIntoOrb)}
                />

                {/* Matte-Glossy 3D Card carried by the Ribbon */}
                {cardAlpha > 0.02 && (
                  <g
                    transform={`translate(${cx}, ${cy}) rotate(${
                      orbitAngle * 0.35
                    }) scale(${cardScale})`}
                  >
                    {/* Soft Rim Light Backplate */}
                    <rect
                      x={-168}
                      y={-58}
                      width={336}
                      height={116}
                      rx={26}
                      fill={THEME.colors.accentBlue}
                      fillOpacity={0.24 * cardAlpha}
                    />
                    {/* Glossy Dark Card Body */}
                    <rect
                      x={-165}
                      y={-55}
                      width={330}
                      height={110}
                      rx={24}
                      fill="url(#darkGlossCard)"
                      stroke={THEME.colors.glowBlue}
                      strokeWidth={2}
                      fillOpacity={cardAlpha}
                      strokeOpacity={0.75 * cardAlpha}
                    />
                    {/* Top Gloss Specular Sheen */}
                    <line
                      x1={-125}
                      y1={-54}
                      x2={125}
                      y2={-54}
                      stroke="#FFFFFF"
                      strokeWidth={2}
                      strokeOpacity={0.45 * cardAlpha}
                    />
                    {/*Glowing Status Dot */}
                    <circle
                      cx={-126}
                      cy={0}
                      r={7}
                      fill={THEME.colors.accentBlue}
                      fillOpacity={cardAlpha}
                    />
                    {/* Card Label ("Visuals", "3D Animation", "Motion Graphics") */}
                    <text
                      x={12}
                      y={1}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontFamily={THEME.fonts.sans}
                      fontWeight={THEME.weights.medium}
                      fontSize={31}
                      fill={THEME.colors.textLight}
                      fillOpacity={cardAlpha}
                    >
                      {rc.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Central 3D Glass AI Core Orb */}
          <g>
            {/* Outer Glass Sphere */}
            <circle
              cx={0}
              cy={0}
              r={orbRadius}
              fill="url(#aiOrbGrad)"
              stroke={THEME.colors.glowBlue}
              strokeWidth={2.5}
            />
            {/* Internal Glass Refraction Ring */}
            <ellipse
              cx={0}
              cy={0}
              rx={orbRadius * 0.78}
              ry={orbRadius * 0.36}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth={1.8}
              strokeOpacity={0.42}
              transform={`rotate(${-28 + frame * 0.6})`}
            />
            {/* Top-Left Specular Glass Highlight */}
            <ellipse
              cx={-orbRadius * 0.32}
              cy={-orbRadius * 0.34}
              rx={orbRadius * 0.28}
              ry={orbRadius * 0.14}
              fill="#FFFFFF"
              fillOpacity={0.55}
              transform="rotate(-35)"
            />
          </g>
        </g>

        {/* Camera-Through-Orb White/Cream Portal Flash at Exit (frames 138..150) */}
        {pushIntoOrb > 0.45 && (
          <rect
            x={0}
            y={0}
            width={1080}
            height={1920}
            fill={THEME.colors.cream}
            fillOpacity={clampInterp(pushIntoOrb, [0.45, 1], [0, 1])}
          />
        )}
      </svg>
    </AbsoluteFill>
  );
};
