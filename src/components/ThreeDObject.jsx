import React, { useMemo } from 'react';
import { PALETTE, TYPOGRAPHY } from '../assets/palette.js';
import {
  createIcosahedronMesh,
  createOctahedronMesh,
  rotate3D,
  project3D,
  vecSub,
  vecCross,
  vecNormalize,
  vecScale,
  vecAdd,
  computeLitColor,
} from '../utils/animation.js';

/**
 * True 3D Polyhedral Mesh Renderer with Blinn-Phong Lighting & Exploded Assembly
 * Used for the AI Core (Scene 2) and 3D Mechanical/Crystalline Assembly (Scene 3 Moment B).
 */
export const Polyhedron3D = ({
  center = { x: 540, y: 820 },
  radius = 195,
  rx = 0,
  ry = 0,
  rz = 0,
  explodeFactor = 0, // 0 = locked solid, > 0 = separated rotating 3D components
  baseColor = '#101D42',
  rimColor = PALETTE.electricBlue,
  fillColor = PALETTE.neonPurple,
  wireframeColor = PALETTE.electricBlueBright,
  showInnerCore = true,
  showGuideVectors = false,
  opacity = 1,
}) => {
  const icoMesh = useMemo(() => createIcosahedronMesh(radius), [radius]);
  const innerMesh = useMemo(() => createOctahedronMesh(radius * 0.56), [radius]);

  const rxOff = rx + 0.37;
  const ryOff = ry + 0.53;
  const rzOff = rz + 0.19;

  // Compute transformed & projected faces for the outer icosahedron
  const renderedFaces = useMemo(() => {
    return icoMesh.faces
      .map((faceIndices, fIdx) => {
        const v0 = icoMesh.vertices[faceIndices[0]];
        const v1 = icoMesh.vertices[faceIndices[1]];
        const v2 = icoMesh.vertices[faceIndices[2]];

        // Face centroid in local object space
        const centroid = {
          x: (v0.x + v1.x + v2.x) / 3,
          y: (v0.y + v1.y + v2.y) / 3,
          z: (v0.z + v1.z + v2.z) / 3,
        };
        const outwardDir = vecNormalize(centroid);

        // If exploded, each 3D component rotates around its own local centroid and translates outward
        const localSpin = explodeFactor * (1.6 + (fIdx % 5) * 0.35);
        const explodeDist = explodeFactor * (150 + (fIdx % 4) * 45);
        const offsetVec = vecScale(outwardDir, explodeDist);

        const transformVert = (v) => {
          let local = v;
          if (explodeFactor > 0.001) {
            const rel = vecSub(v, centroid);
            const spun = rotate3D(
              rel,
              localSpin * (fIdx % 2 === 0 ? 1 : -1),
              localSpin * 0.8,
              localSpin * 0.5
            );
            local = vecAdd(vecAdd(centroid, spun), offsetVec);
          }
          return rotate3D(local, rxOff, ryOff, rzOff);
        };

        const tv0 = transformVert(v0);
        const tv1 = transformVert(v1);
        const tv2 = transformVert(v2);

        // Compute world-space normal
        const edge1 = vecSub(tv1, tv0);
        const edge2 = vecSub(tv2, tv0);
        const normal = vecNormalize(vecCross(edge1, edge2));

        // Average Z for Painter's algorithm depth sorting
        const avgZ = (tv0.z + tv1.z + tv2.z) / 3;

        const pv0 = project3D(tv0, { cx: center.x, cy: center.y, fov: 950, cameraZ: 920 });
        const pv1 = project3D(tv1, { cx: center.x, cy: center.y, fov: 950, cameraZ: 920 });
        const pv2 = project3D(tv2, { cx: center.x, cy: center.y, fov: 950, cameraZ: 920 });

        const area2D = Math.abs(
          (pv1.x - pv0.x) * (pv2.y - pv0.y) - (pv2.x - pv0.x) * (pv1.y - pv0.y)
        );

        const lockedCentroid = project3D(rotate3D(centroid, rxOff, ryOff, rzOff), {
          cx: center.x,
          cy: center.y,
          fov: 950,
          cameraZ: 920,
        });
        const explodedCentroid = project3D(
          rotate3D(vecAdd(centroid, offsetVec), rxOff, ryOff, rzOff),
          {
            cx: center.x,
            cy: center.y,
            fov: 950,
            cameraZ: 920,
          }
        );

        const lighting = computeLitColor(normal, baseColor, rimColor, fillColor, 0.72);

        return {
          fIdx,
          avgZ,
          area2D,
          normal,
          pv0,
          pv1,
          pv2,
          lockedCentroid,
          explodedCentroid,
          lighting,
          isFrontFacing: normal.z > -0.15,
        };
      })
      .filter((f) => f.area2D > 4.0)
      .sort((a, b) => a.avgZ - b.avgZ);
  }, [icoMesh, rxOff, ryOff, rzOff, explodeFactor, center.x, center.y, baseColor, rimColor, fillColor]);

  // Counter-rotating inner octahedron
  const innerFaces = useMemo(() => {
    return innerMesh.faces
      .map((indices, idx) => {
        const tv0 = rotate3D(innerMesh.vertices[indices[0]], -rxOff * 1.3, -ryOff * 1.4, rzOff);
        const tv1 = rotate3D(innerMesh.vertices[indices[1]], -rxOff * 1.3, -ryOff * 1.4, rzOff);
        const tv2 = rotate3D(innerMesh.vertices[indices[2]], -rxOff * 1.3, -ryOff * 1.4, rzOff);
        const avgZ = (tv0.z + tv1.z + tv2.z) / 3;
        const pv0 = project3D(tv0, { cx: center.x, cy: center.y, fov: 950, cameraZ: 920 });
        const pv1 = project3D(tv1, { cx: center.x, cy: center.y, fov: 950, cameraZ: 920 });
        const pv2 = project3D(tv2, { cx: center.x, cy: center.y, fov: 950, cameraZ: 920 });
        const area2D = Math.abs(
          (pv1.x - pv0.x) * (pv2.y - pv0.y) - (pv2.x - pv0.x) * (pv1.y - pv0.y)
        );
        return { idx, avgZ, area2D, pv0, pv1, pv2 };
      })
      .filter((f) => f.area2D > 4.0)
      .sort((a, b) => a.avgZ - b.avgZ);
  }, [innerMesh, rxOff, ryOff, rzOff, center.x, center.y]);

  return (
    <g opacity={opacity}>
      {/* Ambient Core Halo */}
      <circle
        cx={center.x}
        cy={center.y}
        r={radius * 1.38}
        fill="url(#coreRadialGlow)"
        opacity={0.75}
      />

      {/* Back-facing outer faces */}
      {renderedFaces
        .filter((f) => !f.isFrontFacing)
        .map((f) => (
          <polygon
            key={`back-${f.fIdx}`}
            points={`${f.pv0.x},${f.pv0.y} ${f.pv1.x},${f.pv1.y} ${f.pv2.x},${f.pv2.y}`}
            fill={f.lighting.fillColor}
            fillOpacity={0.38}
            stroke={wireframeColor}
            strokeWidth={1}
            strokeOpacity={0.28}
          />
        ))}

      {/* Inner Luminous Crystalline Core */}
      {showInnerCore && (
        <g>
          <circle
            cx={center.x}
            cy={center.y}
            r={radius * 0.48}
            fill={PALETTE.electricBlue}
            opacity={0.28}
          />
          {innerFaces.map((inf) => (
            <polygon
              key={`inner-${inf.idx}`}
              points={`${inf.pv0.x},${inf.pv0.y} ${inf.pv1.x},${inf.pv1.y} ${inf.pv2.x},${inf.pv2.y}`}
              fill={PALETTE.neonPurple}
              fillOpacity={0.55}
              stroke={PALETTE.coolWhite}
              strokeWidth={1.6}
              strokeOpacity={0.8}
            />
          ))}
        </g>
      )}

      {/* Axial alignment vectors during 3D assembly */}
      {showGuideVectors &&
        explodeFactor > 0.02 &&
        renderedFaces
          .filter((f) => f.isFrontFacing)
          .map((f) => (
            <line
              key={`guide-${f.fIdx}`}
              x1={f.lockedCentroid.x}
              y1={f.lockedCentroid.y}
              x2={f.explodedCentroid.x}
              y2={f.explodedCentroid.y}
              stroke={PALETTE.cyanGlow}
              strokeWidth={1.5}
              strokeDasharray="5 5"
              opacity={Math.min(0.85, explodeFactor * 1.2)}
            />
          ))}

      {/* Front-facing lit 3D polygon shards */}
      {renderedFaces
        .filter((f) => f.isFrontFacing)
        .map((f) => (
          <g key={`front-${f.fIdx}`}>
            <polygon
              points={`${f.pv0.x},${f.pv0.y} ${f.pv1.x},${f.pv1.y} ${f.pv2.x},${f.pv2.y}`}
              fill={f.lighting.fillColor}
              fillOpacity={0.88}
              stroke={
                f.lighting.specular > 0.25 ? PALETTE.coolWhite : wireframeColor
              }
              strokeWidth={f.lighting.specular > 0.25 ? 2.2 : 1.5}
              strokeLinejoin="round"
            />
            {/* Vertex energy nodes */}
            <circle
              cx={f.pv0.x}
              cy={f.pv0.y}
              r={2.8}
              fill={PALETTE.coolWhite}
              opacity={0.75}
            />
          </g>
        ))}
    </g>
  );
};

/**
 * Dimensional 3D Smartphone / Vertical Video Frame with Extruded Bevel Chassis
 * Emerges from darkness in Scene 1 with floating 3D timeline tracks.
 */
export const SmartphoneFrame3D = ({
  center = { x: 540, y: 770 },
  width = 330,
  height = 590,
  depth = 34,
  rx = 0.14,
  ry = -0.28,
  rz = -0.04,
  scale = 1,
  frame = 0,
  sliceOffset = 0, // Separates slightly during diagonal slash
  opacity = 1,
}) => {
  const hw = (width * scale) / 2;
  const hh = (height * scale) / 2;
  const hd = (depth * scale) / 2;

  const cornersFront = [
    { x: -hw, y: -hh, z: hd },
    { x: hw, y: -hh, z: hd },
    { x: hw, y: hh, z: hd },
    { x: -hw, y: hh, z: hd },
  ];
  const cornersBack = [
    { x: -hw, y: -hh, z: -hd },
    { x: hw, y: -hh, z: -hd },
    { x: hw, y: hh, z: -hd },
    { x: -hw, y: hh, z: -hd },
  ];

  const projPt = (pt) =>
    project3D(rotate3D(pt, rx, ry, rz), {
      cx: center.x,
      cy: center.y,
      fov: 980,
      cameraZ: 920,
    });

  const pf = cornersFront.map(projPt);
  const pb = cornersBack.map(projPt);

  // Floating 3D timeline bars hovering in front of the smartphone screen (z = hd + 48)
  const timelineTracks = [
    { yOffset: -85, w: 230, h: 24, z: hd + 52, color: PALETTE.electricBlue },
    { yOffset: -42, w: 190, h: 24, z: hd + 74, color: PALETTE.neonPurple },
    { yOffset: 2, w: 250, h: 24, z: hd + 60, color: PALETTE.cyanGlow },
    { yOffset: 46, w: 175, h: 24, z: hd + 82, color: PALETTE.electricBlueBright },
  ];

  const polyStr = (pts) => pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  return (
    <g opacity={opacity} transform={`translate(${sliceOffset * 8}, 0)`}>
      {/* Volumetric rear rim glow */}
      <ellipse
        cx={center.x}
        cy={center.y}
        rx={width * 0.72 * scale}
        ry={height * 0.58 * scale}
        fill="url(#coreRadialGlow)"
        opacity={0.55}
      />

      {/* Right / Left / Bottom 3D Chassis Extrusion Walls */}
      <polygon
        points={polyStr([pf[1], pb[1], pb[2], pf[2]])}
        fill="#162856"
        stroke={PALETTE.electricBlue}
        strokeWidth={1.5}
      />
      <polygon
        points={polyStr([pf[0], pb[0], pb[3], pf[3]])}
        fill="#0E1938"
        stroke={PALETTE.electricBlue}
        strokeWidth={1.5}
      />
      <polygon
        points={polyStr([pf[3], pb[3], pb[2], pf[2]])}
        fill="#091024"
        stroke={PALETTE.neonPurple}
        strokeWidth={1.5}
      />
      <polygon
        points={polyStr([pf[0], pb[0], pb[1], pf[1]])}
        fill="#1F387A"
        stroke={PALETTE.coolWhite}
        strokeWidth={1.5}
      />

      {/* Primary Front Glass Screen */}
      <polygon
        points={polyStr(pf)}
        fill="url(#phoneScreenGrad)"
        stroke={PALETTE.electricBlueBright}
        strokeWidth={3}
      />

      {/* Inner Viewport Grid Lines on Screen */}
      {[-0.5, 0, 0.5].map((ratio, idx) => {
        const leftPt = projPt({ x: -hw * 0.86, y: hh * ratio, z: hd + 2 });
        const rightPt = projPt({ x: hw * 0.86, y: hh * ratio, z: hd + 2 });
        return (
          <line
            key={`grid-h-${idx}`}
            x1={leftPt.x}
            y1={leftPt.y}
            x2={rightPt.x}
            y2={rightPt.y}
            stroke={PALETTE.electricBlue}
            strokeWidth={1}
            strokeOpacity={0.32}
            strokeDasharray="6 6"
          />
        );
      })}

      {/* Floating 3D Timeline Object in Front of the Screen */}
      {timelineTracks.map((trk, i) => {
        const tw = (trk.w * scale) / 2;
        const th = (trk.h * scale) / 2;
        const ty = trk.yOffset * scale;
        const shiftX = Math.sin(frame * 0.05 + i * 1.1) * 14;
        const barPts = [
          { x: -tw + shiftX, y: ty - th, z: trk.z },
          { x: tw + shiftX, y: ty - th, z: trk.z },
          { x: tw + shiftX, y: ty + th, z: trk.z },
          { x: -tw + shiftX, y: ty + th, z: trk.z },
        ].map(projPt);

        return (
          <g key={`trk-${i}`}>
            <polygon
              points={polyStr(barPts)}
              fill={trk.color}
              fillOpacity={0.28}
              stroke={trk.color}
              strokeWidth={2}
            />
            {/* Keyframe diamond on the 3D track */}
            <circle
              cx={(barPts[0].x + barPts[1].x) / 2}
              cy={(barPts[0].y + barPts[2].y) / 2}
              r={5 * scale}
              fill={PALETTE.coolWhite}
            />
          </g>
        );
      })}

      {/* Playhead Laser Line floating in 3D space */}
      {(() => {
        const playX = Math.sin(frame * 0.04) * (hw * 0.55);
        const topP = projPt({ x: playX, y: -hh * 0.48, z: hd + 92 });
        const botP = projPt({ x: playX, y: hh * 0.42, z: hd + 92 });
        return (
          <g>
            <line
              x1={topP.x}
              y1={topP.y}
              x2={botP.x}
              y2={botP.y}
              stroke={PALETTE.coolWhite}
              strokeWidth={3}
            />
            <circle cx={topP.x} cy={topP.y} r={6} fill={PALETTE.electricBlueBright} />
          </g>
        );
      })()}
    </g>
  );
};

/**
 * Dimensional 3D Reference Monument for "ALIGHT MOTION" and "AFTER EFFECTS"
 * Uses typographical 3D blocks only (no fabricated official software logos).
 */
export const SoftwareReferenceBlock3D = ({
  title,
  subtitle = 'MANUAL WORKFLOW',
  x = 300,
  y = 1050,
  width = 430,
  height = 128,
  tiltDir = 1, // 1 or -1 for coordinated opposing 3D angles
  enterProgress = 1,
  slashSplit = 0, // 0..1 separation when diagonal energy sweep cuts through
  accentColor = PALETTE.electricBlue,
}) => {
  if (enterProgress <= 0.01) return null;

  const slideX = (1 - enterProgress) * (-180 * tiltDir) + slashSplit * (34 * tiltDir);
  const slideY = (1 - enterProgress) * 65 + slashSplit * (26 * tiltDir);
  const rotDeg = (1 - enterProgress) * (12 * tiltDir) + slashSplit * (5 * tiltDir);
  const scale = 0.85 + 0.15 * enterProgress;
  const hw = width / 2;
  const hh = height / 2;
  const extX = 14 * tiltDir;
  const extY = 14;

  // Dim and strike-through slightly as the AI diagonal sweep separates it
  const strikeAlpha = Math.max(0.32, 1 - slashSplit * 0.55);

  return (
    <g
      transform={`translate(${x + slideX}, ${y + slideY}) rotate(${rotDeg}) scale(${scale})`}
      opacity={enterProgress * strikeAlpha}
    >
      {/* 3D Extruded Side & Bottom Walls */}
      <polygon
        points={`${-hw},${hh} ${hw},${hh} ${hw + extX},${hh + extY} ${-hw + extX},${hh + extY}`}
        fill="#080E20"
        stroke={accentColor}
        strokeWidth={1.5}
      />
      <polygon
        points={
          tiltDir > 0
            ? `${hw},${-hh} ${hw + extX},${-hh + extY} ${hw + extX},${hh + extY} ${hw},${hh}`
            : `${-hw},${-hh} ${-hw + extX},${-hh + extY} ${-hw + extX},${hh + extY} ${-hw},${hh}`
        }
        fill="#111D3F"
        stroke={accentColor}
        strokeWidth={1.5}
      />

      {/* Front Architectural Slab */}
      <rect
        x={-hw}
        y={-hh}
        width={width}
        height={height}
        rx={18}
        fill="#0B1328"
        stroke={slashSplit > 0.1 ? PALETTE.crimsonSlash : accentColor}
        strokeWidth={2.5}
      />

      {/* Top Keyframe Track Bar */}
      <line
        x1={-hw + 26}
        y1={-hh + 26}
        x2={hw - 26}
        y2={-hh + 26}
        stroke={accentColor}
        strokeWidth={1.5}
        strokeOpacity={0.45}
      />
      <rect
        x={-hw + 28}
        y={-hh + 20}
        width={11}
        height={11}
        fill={accentColor}
        transform={`rotate(45, ${-hw + 33.5}, ${-hh + 25.5})`}
      />
      <text
        x={-hw + 54}
        y={-hh + 26}
        dominantBaseline="central"
        fontFamily={TYPOGRAPHY.sansFont}
        fontWeight={600}
        fontSize={14}
        letterSpacing={2.5}
        fill={PALETTE.silverMist}
      >
        {subtitle}
      </text>

      {/* Dimensional Software Reference Name */}
      <text
        x={4}
        y={18}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily={TYPOGRAPHY.displayFont}
        fontWeight={700}
        fontSize={36}
        letterSpacing={2.5}
        fill="#1A2C5B"
      >
        {title}
      </text>
      <text
        x={0}
        y={14}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily={TYPOGRAPHY.displayFont}
        fontWeight={700}
        fontSize={36}
        letterSpacing={2.5}
        fill={PALETTE.coolWhite}
      >
        {title}
      </text>

      {/* Diagonal energy slice scar when swept */}
      {slashSplit > 0.05 && (
        <line
          x1={-hw + 18}
          y1={14}
          x2={hw - 18}
          y2={14}
          stroke={PALETTE.crimsonSlash}
          strokeWidth={4}
          opacity={Math.min(1, slashSplit * 1.5)}
        />
      )}
    </g>
  );
};
