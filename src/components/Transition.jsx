import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { THEME, clampInterp } from '../theme.ts';

/**
 * Top-level Glow Overlay layer (Compositing order #6: bg -> 3D object -> cards/UI -> cursor -> text -> glow overlay)
 * Adds subtle blue specular polish across the 5 unique scene boundary transitions without repeating any transition.
 */
export const TransitionOverlay = () => {
  const frame = useCurrentFrame();

  // S1 -> S2 (120): Dot-to-Orb Morph pulse
  const t1 =
    frame >= 114 && frame <= 128
      ? 1 - Math.abs(frame - 120) / 8
      : 0;

  // S2 -> S3 (270): Camera-Through-Orb Cream Flash
  const t2 =
    frame >= 264 && frame <= 278
      ? 1 - Math.abs(frame - 270) / 8
      : 0;

  // S3 -> S4 (450): Circle Shape-Reveal Ring
  const t3 =
    frame >= 444 && frame <= 456
      ? 1 - Math.abs(frame - 450) / 6
      : 0;

  // S4 -> S5 (600): Phone-to-Profile Match-Cut Rim
  const t4 =
    frame >= 594 && frame <= 606
      ? 1 - Math.abs(frame - 600) / 6
      : 0;

  // S5 -> S6 (720): Blue Ripple Wipe Glow
  const t5 =
    frame >= 714 && frame <= 726
      ? 1 - Math.abs(frame - 720) / 6
      : 0;

  if (t1 <= 0 && t2 <= 0 && t3 <= 0 && t4 <= 0 && t5 <= 0) {
    return null;
  }

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg
        viewBox="0 0 1080 1920"
        width="1080"
        height="1920"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        {/* 1. S1->S2 Dot-to-Orb Morph Ring */}
        {t1 > 0 && (
          <circle
            cx={540}
            cy={960}
            r={clampInterp(frame, [114, 128], [32, 165])}
            fill="none"
            stroke={THEME.colors.glowBlue}
            strokeWidth={6 * t1}
            strokeOpacity={0.75 * t1}
          />
        )}

        {/* 2. S2->S3 Camera-Through-Orb Portal Veil */}
        {t2 > 0 && (
          <rect
            x={0}
            y={0}
            width={1080}
            height={1920}
            fill={THEME.colors.cream}
            fillOpacity={0.6 * t2}
          />
        )}

        {/* 3. S3->S4 Circle Shape-Reveal Blue Edge */}
        {t3 > 0 && (
          <circle
            cx={540}
            cy={820}
            r={clampInterp(frame, [444, 456], [850, 1280])}
            fill="none"
            stroke={THEME.colors.accentBlue}
            strokeWidth={8 * t3}
            strokeOpacity={0.65 * t3}
          />
        )}

        {/* 4. S4->S5 Match-Cut Specular Frame */}
        {t4 > 0 && (
          <rect
            x={150}
            y={540}
            width={780}
            height={560}
            rx={44}
            fill="none"
            stroke={THEME.colors.accentBlue}
            strokeWidth={4 * t4}
            strokeOpacity={0.55 * t4}
          />
        )}

        {/* 5. S5->S6 Ripple Wipe Specular Ring */}
        {t5 > 0 && (
          <circle
            cx={540}
            cy={1185}
            r={clampInterp(frame, [714, 726], [900, 1400])}
            fill="none"
            stroke={THEME.colors.glowBlue}
            strokeWidth={10 * t5}
            strokeOpacity={0.65 * t5}
          />
        )}
      </svg>
    </AbsoluteFill>
  );
};
