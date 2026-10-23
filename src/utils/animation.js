import { interpolate, spring } from 'remotion';

/**
 * Deterministic Spring Configurations for Remotion
 */
export const SPRING_CONFIGS = {
  smooth: { damping: 22, stiffness: 120, mass: 0.9 },
  snappy: { damping: 18, stiffness: 190, mass: 0.75 },
  heavy: { damping: 26, stiffness: 95, mass: 1.25 },
  impact: { damping: 14, stiffness: 220, mass: 0.7 },
  gentle: { damping: 30, stiffness: 80, mass: 1.1 },
};

/**
 * Clamped interpolation helper
 */
export function clampInterp(frame, inputRange, outputRange, easingFn) {
  const options = {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  };
  if (easingFn) {
    options.easing = easingFn;
  }
  return interpolate(frame, inputRange, outputRange, options);
}

/**
 * Smooth mathematical easing functions
 */
export const EASING = {
  easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
  easeInCubic: (t) => t * t * t,
  easeInOutCubic: (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  easeOutQuart: (t) => 1 - Math.pow(1 - t, 4),
  easeInOutQuart: (t) =>
    t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2,
  easeOutBack: (t) => {
    const c1 = 1.45;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
};

/**
 * Spring progress helper with start frame offset
 */
export function springAt(frame, fps, startFrame = 0, config = SPRING_CONFIGS.smooth, durationInFrames) {
  const opts = {
    frame: Math.max(0, frame - startFrame),
    fps,
    config,
  };
  if (durationInFrames) {
    opts.durationInFrames = durationInFrames;
  }
  return frame < startFrame ? 0 : spring(opts);
}

/**
 * Deterministic seeded PRNG (Mulberry32)
 * Guarantees identical particle & geometry layouts on every render.
 */
export function seededRandom(seed) {
  let a = (seed + 0x6d2b79f5) | 0;
  return function () {
    a = Math.imul(a ^ (a >>> 15), 1 | a);
    a = (a + Math.imul(a ^ (a >>> 7), 61 | a)) ^ a;
    return ((a ^ (a >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 3D Vector & Matrix Math Utilities
 */
export function vecAdd(a, b) {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

export function vecSub(a, b) {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

export function vecScale(v, s) {
  return { x: v.x * s, y: v.y * s, z: v.z * s };
}

export function vecDot(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function vecCross(a, b) {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

export function vecNormalize(v) {
  const len = Math.hypot(v.x, v.y, v.z) || 1;
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

/**
 * Rotate a 3D point by Euler angles (rx, ry, rz in radians)
 */
export function rotate3D(pt, rx = 0, ry = 0, rz = 0) {
  let { x, y, z } = pt;

  // Rotate around X
  if (rx !== 0) {
    const cosX = Math.cos(rx);
    const sinX = Math.sin(rx);
    const y1 = y * cosX - z * sinX;
    const z1 = y * sinX + z * cosX;
    y = y1;
    z = z1;
  }

  // Rotate around Y
  if (ry !== 0) {
    const cosY = Math.cos(ry);
    const sinY = Math.sin(ry);
    const x1 = x * cosY + z * sinY;
    const z1 = -x * sinY + z * cosY;
    x = x1;
    z = z1;
  }

  // Rotate around Z
  if (rz !== 0) {
    const cosZ = Math.cos(rz);
    const sinZ = Math.sin(rz);
    const x1 = x * cosZ - y * sinZ;
    const y1 = x * sinZ + y * cosZ;
    x = x1;
    y = y1;
  }

  return { x, y, z };
}

/**
 * Perspective projection of a 3D point onto the 1080x1920 viewport
 */
export function project3D(pt, options = {}) {
  const {
    cx = 540,
    cy = 840,
    fov = 950,
    cameraZ = 900,
    cameraX = 0,
    cameraY = 0,
  } = options;

  const relX = pt.x - cameraX;
  const relY = pt.y - cameraY;
  const depth = cameraZ - pt.z;
  const safeDepth = Math.max(80, depth);
  const scale = fov / safeDepth;

  return {
    x: cx + relX * scale,
    y: cy + relY * scale,
    z: pt.z,
    depth: safeDepth,
    scale,
    visible: depth > 90,
  };
}

/**
 * Hex color helper for physically inspired 3-point lighting (Key + Electric Blue Rim + Neon Purple Fill)
 */
export function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function rgbToHex({ r, g, b }) {
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
  return (
    '#' +
    [clamp(r), clamp(g), clamp(b)]
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('')
  );
}

export function computeLitColor(
  normal,
  baseHex = '#101B3B',
  rimHex = '#397BFF',
  fillHex = '#9B5CFF',
  specStrength = 0.55
) {
  const n = vecNormalize(normal);
  // Key light from top-left-front
  const keyDir = vecNormalize({ x: -0.45, y: -0.65, z: 0.75 });
  // Rim light from right-back
  const rimDir = vecNormalize({ x: 0.78, y: -0.25, z: 0.4 });
  // Fill light from bottom-left
  const fillDir = vecNormalize({ x: -0.6, y: 0.7, z: 0.35 });
  // View vector (toward camera +Z)
  const viewDir = { x: 0, y: 0, z: 1 };

  const keyDiff = Math.max(0, vecDot(n, keyDir));
  const rimDiff = Math.pow(Math.max(0, vecDot(n, rimDir)), 1.6);
  const fillDiff = Math.max(0, vecDot(n, fillDir));

  // Blinn-Phong half vector for specular
  const halfVec = vecNormalize(vecAdd(keyDir, viewDir));
  const spec = Math.pow(Math.max(0, vecDot(n, halfVec)), 22) * specStrength;

  const base = hexToRgb(baseHex);
  const rim = hexToRgb(rimHex);
  const fill = hexToRgb(fillHex);

  const ambient = 0.28;
  const r =
    base.r * (ambient + keyDiff * 0.75) +
    rim.r * rimDiff * 0.65 +
    fill.r * fillDiff * 0.35 +
    245 * spec;
  const g =
    base.g * (ambient + keyDiff * 0.75) +
    rim.g * rimDiff * 0.65 +
    fill.g * fillDiff * 0.35 +
    247 * spec;
  const b =
    base.b * (ambient + keyDiff * 0.75) +
    rim.b * rimDiff * 0.65 +
    fill.b * fillDiff * 0.35 +
    255 * spec;

  return {
    fillColor: rgbToHex({ r, g, b }),
    specular: spec,
    rimIntensity: rimDiff,
    keyIntensity: keyDiff,
  };
}

/**
 * Generates a true 3D Icosahedron mesh (12 vertices, 20 triangular faces)
 */
export function createIcosahedronMesh(radius = 180) {
  const phi = (1 + Math.sqrt(5)) / 2;
  const rawVerts = [
    [-1, phi, 0],
    [1, phi, 0],
    [-1, -phi, 0],
    [1, -phi, 0],
    [0, -1, phi],
    [0, 1, phi],
    [0, -1, -phi],
    [0, 1, -phi],
    [phi, 0, -1],
    [phi, 0, 1],
    [-phi, 0, -1],
    [-phi, 0, 1],
  ];

  const normScale = radius / Math.hypot(1, phi);
  const vertices = rawVerts.map(([x, y, z]) => ({
    x: x * normScale,
    y: y * normScale,
    z: z * normScale,
  }));

  const faces = [
    [0, 11, 5],
    [0, 5, 1],
    [0, 1, 7],
    [0, 7, 10],
    [0, 10, 11],
    [1, 5, 9],
    [5, 11, 4],
    [11, 10, 2],
    [10, 7, 6],
    [7, 1, 8],
    [3, 9, 4],
    [3, 4, 2],
    [3, 2, 6],
    [3, 6, 8],
    [3, 8, 9],
    [4, 9, 5],
    [2, 4, 11],
    [6, 2, 10],
    [8, 6, 7],
    [9, 8, 1],
  ];

  // Extract unique edges for wireframe overlay
  const edgeSet = new Set();
  const edges = [];
  for (const [a, b, c] of faces) {
    for (const [u, v] of [
      [a, b],
      [b, c],
      [c, a],
    ]) {
      const key = u < v ? `${u}-${v}` : `${v}-${u}`;
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        edges.push([u, v]);
      }
    }
  }

  return { vertices, faces, edges };
}

/**
 * Generates a 3D Octahedron mesh (6 vertices, 8 triangular faces)
 */
export function createOctahedronMesh(radius = 120) {
  const vertices = [
    { x: 0, y: -radius, z: 0 },
    { x: 0, y: radius, z: 0 },
    { x: -radius, y: 0, z: 0 },
    { x: radius, y: 0, z: 0 },
    { x: 0, y: 0, z: radius },
    { x: 0, y: 0, z: -radius },
  ];
  const faces = [
    [0, 4, 3],
    [0, 3, 5],
    [0, 5, 2],
    [0, 2, 4],
    [1, 3, 4],
    [1, 5, 3],
    [1, 2, 5],
    [1, 4, 2],
  ];
  return { vertices, faces };
}

/**
 * Generates a 3D rectangular prism (6 quad faces, 8 vertices)
 */
export function createBox3DMesh(width, height, depth) {
  const hw = width / 2;
  const hh = height / 2;
  const hd = depth / 2;
  const vertices = [
    { x: -hw, y: -hh, z: hd }, // 0: front-top-left
    { x: hw, y: -hh, z: hd }, // 1: front-top-right
    { x: hw, y: hh, z: hd }, // 2: front-bottom-right
    { x: -hw, y: hh, z: hd }, // 3: front-bottom-left
    { x: -hw, y: -hh, z: -hd }, // 4: back-top-left
    { x: hw, y: -hh, z: -hd }, // 5: back-top-right
    { x: hw, y: hh, z: -hd }, // 6: back-bottom-right
    { x: -hw, y: hh, z: -hd }, // 7: back-bottom-left
  ];

  const faces = [
    { indices: [0, 1, 2, 3], tag: 'front' },
    { indices: [5, 4, 7, 6], tag: 'back' },
    { indices: [4, 5, 1, 0], tag: 'top' },
    { indices: [3, 2, 6, 7], tag: 'bottom' },
    { indices: [4, 0, 3, 7], tag: 'left' },
    { indices: [1, 5, 6, 2], tag: 'right' },
  ];

  return { vertices, faces };
}
