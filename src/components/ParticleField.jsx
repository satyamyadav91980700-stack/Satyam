import React, { useMemo } from 'react';
import { PALETTE } from '../assets/palette.js';
import { seededRandom, rotate3D, project3D, clampInterp } from '../utils/animation.js';

/**
 * Deterministic 3D Layered Particle Field (Background / Midground / Foreground)
 * Supports ambient parallax, neural convergence, and safe-zone exclusion (e.g. for CTA).
 */
export const ParticleField = ({
  frame = 0,
  count = 52,
  seed = 101,
  mode = 'ambient', // 'ambient' | 'converge' | 'stream'
  convergeProgress = 0,
  center = { x: 540, y: 820 },
  exclusionZone = null, // { x, y, r } -> prevents particles from covering critical text/CTA
  primaryColor = PALETTE.electricBlue,
  secondaryColor = PALETTE.neonPurple,
  opacity = 1,
}) => {
  const particles = useMemo(() => {
    const rng = seededRandom(seed);
    const items = [];
    for (let i = 0; i < count; i++) {
      const layerRoll = rng();
      const layer = layerRoll < 0.45 ? 'bg' : layerRoll < 0.82 ? 'mid' : 'fg';
      const spreadX = (rng() - 0.5) * 1150;
      const spreadY = (rng() - 0.5) * 1850;
      const spreadZ =
        layer === 'bg'
          ? -380 - rng() * 280
          : layer === 'mid'
          ? -120 + rng() * 240
          : 150 + rng() * 220;

      items.push({
        id: i,
        layer,
        baseX: spreadX,
        baseY: spreadY,
        baseZ: spreadZ,
        radius: layer === 'bg' ? 2.2 + rng() * 2.2 : layer === 'mid' ? 3.5 + rng() * 3.5 : 6.0 + rng() * 5.0,
        speedX: (rng() - 0.5) * 1.4,
        speedY: -0.6 - rng() * 1.6,
        phase: rng() * Math.PI * 2,
        color:
          i % 3 === 0
            ? PALETTE.coolWhite
            : i % 2 === 0
            ? primaryColor
            : secondaryColor,
      });
    }
    return items;
  }, [count, seed, primaryColor, secondaryColor]);

  const cameraYaw = Math.sin(frame * 0.012) * 0.08;
  const cameraPitch = Math.cos(frame * 0.01) * 0.05;

  return (
    <g opacity={opacity}>
      {particles.map((p) => {
        let px = p.baseX + Math.sin(frame * 0.025 + p.phase) * 36 + frame * p.speedX;
        let py = p.baseY + Math.cos(frame * 0.02 + p.phase) * 28 + frame * p.speedY;
        let pz = p.baseZ + Math.sin(frame * 0.018 + p.phase) * 45;

        // Wrap vertical drift smoothly within [-960, 960]
        py = ((((py + 960) % 1920) + 1920) % 1920) - 960;

        if (mode === 'converge' && convergeProgress > 0) {
          const pull = clampInterp(convergeProgress, [0, 1], [0, 0.82]);
          const swirlAngle = pull * 2.4 + p.phase;
          const dist = Math.hypot(px, py) * (1 - pull * 0.72);
          px = Math.cos(swirlAngle) * dist;
          py = Math.sin(swirlAngle) * dist * 0.85;
          pz = pz * (1 - pull * 0.65);
        } else if (mode === 'stream') {
          px = p.baseX + ((frame * 6 + p.id * 37) % 1100) - 550;
          py = p.baseY * 0.65 + Math.sin(px * 0.008 + p.phase) * 65;
        }

        const rotated = rotate3D({ x: px, y: py, z: pz }, cameraPitch, cameraYaw, 0);
        const proj = project3D(rotated, {
          cx: center.x,
          cy: center.y,
          fov: 920,
          cameraZ: 920,
        });

        if (
          !proj.visible ||
          proj.x < 15 ||
          proj.x > 1065 ||
          proj.y < 15 ||
          proj.y > 1905
        ) {
          return null;
        }

        let alpha =
          p.layer === 'bg'
            ? 0.26
            : p.layer === 'mid'
            ? 0.52
            : 0.38;
        alpha *= 0.65 + 0.35 * Math.sin(frame * 0.07 + p.phase);

        // Enforce exclusion zone so particles never obstruct critical keywords (e.g. "AI" in Scene 5)
        if (exclusionZone) {
          const d = Math.hypot(proj.x - exclusionZone.x, proj.y - exclusionZone.y);
          if (d < exclusionZone.r) {
            const fade = clampInterp(d, [exclusionZone.r * 0.55, exclusionZone.r], [0, 1]);
            alpha *= fade;
          }
        }

        if (alpha <= 0.02) return null;

        const r = Math.max(1.2, p.radius * proj.scale);

        return (
          <g key={p.id}>
            {p.layer !== 'bg' && (
              <circle
                cx={proj.x}
                cy={proj.y}
                r={r * 2.4}
                fill={p.color}
                fillOpacity={0.22 * alpha * opacity}
              />
            )}
            <circle
              cx={proj.x}
              cy={proj.y}
              r={r}
              fill={p.color}
              fillOpacity={alpha * opacity}
            />
          </g>
        );
      })}
    </g>
  );
};
