import React from 'react';
import { THEME } from '../theme.ts';

/**
 * Shared SVG Shaders, Gradients & Glossy 3D Lighting Definitions
 * Built for alternating Cream (#F7F4EE) and Black (#05060B) SaaS scenes.
 */
export const CinematicSvgDefs = () => (
  <defs>
    {/* Glowing Blue AI Core Orb Gradient (#7FA8FF -> #2F6BFF -> #0A1845) */}
    <radialGradient id="aiOrbGrad" cx="36%" cy="32%" r="68%">
      <stop offset="0%" stopColor="#FFFFFF" />
      <stop offset="24%" stopColor={THEME.colors.glowBlue} />
      <stop offset="62%" stopColor={THEME.colors.accentBlue} />
      <stop offset="100%" stopColor="#08153F" />
    </radialGradient>

    {/* Outer Soft Orb Ambient Glow */}
    <radialGradient id="aiOrbHalo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor={THEME.colors.accentBlue} stopOpacity="0.58" />
      <stop offset="48%" stopColor={THEME.colors.glowBlue} stopOpacity="0.22" />
      <stop offset="100%" stopColor={THEME.colors.black} stopOpacity="0" />
    </radialGradient>

    {/* Gradient Ribbon Shader (#2F6BFF -> #7FA8FF) */}
    <linearGradient id="ribbonGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor={THEME.colors.accentBlue} stopOpacity="0.95" />
      <stop offset="55%" stopColor={THEME.colors.glowBlue} stopOpacity="0.85" />
      <stop offset="100%" stopColor={THEME.colors.accentBlue} stopOpacity="0.25" />
    </linearGradient>

    <linearGradient id="ribbonGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor={THEME.colors.glowBlue} stopOpacity="0.95" />
      <stop offset="50%" stopColor={THEME.colors.accentBlue} stopOpacity="0.85" />
      <stop offset="100%" stopColor="#122B7A" stopOpacity="0.2" />
    </linearGradient>

    {/* Matte-Glossy Dark Card Surface */}
    <linearGradient id="darkGlossCard" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#182038" />
      <stop offset="100%" stopColor="#0C101D" />
    </linearGradient>

    {/* Soft Real Shadow Gradient for Light Mode Cards */}
    <radialGradient id="lightSoftShadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#111111" stopOpacity="0.12" />
      <stop offset="70%" stopColor="#111111" stopOpacity="0.04" />
      <stop offset="100%" stopColor="#111111" stopOpacity="0" />
    </radialGradient>
  </defs>
);
