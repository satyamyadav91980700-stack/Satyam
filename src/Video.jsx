import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};
function Scene({scene, index, script}) {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const portrait = height > width;
  const intro = spring({frame, fps, config: {damping: 22, stiffness: 110}});
  const fadeIn = script.overlap ? interpolate(frame, [0, script.overlap], [0, 1], clamp) : 1;
  // Incoming scene covers the outgoing scene, avoiding a dark dip in crossfades.
  const opacity = index === 0 ? 1 : fadeIn;
  const fontSize = Math.min(portrait ? 112 : 150, (portrait ? 1600 : 2200) / Math.sqrt(scene.text.length));
  const characters = Array.from(scene.text);
  const count = Math.floor(interpolate(frame, [4, Math.max(5, scene.frames * 0.62)], [0, characters.length], clamp));
  const textStyle = {
    fontSize, lineHeight: 1.08, fontWeight: 850, letterSpacing: '-0.055em',
    whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', margin: '30px 0',
    color: scene.color ?? '#f6f7fb',
    opacity: scene.animation === 'fade' ? interpolate(frame, [0, 18], [0, 1], clamp) : 1,
    transform: scene.animation === 'slide' ? `translateY(${(1 - intro) * 90}px)` : 'none',
  };
  return <AbsoluteFill style={{opacity, background: scene.background ?? script.background, overflow: 'hidden'}}>
    {script.gradient && <AbsoluteFill style={{background: `radial-gradient(ellipse at ${70 + Math.sin(frame / 100) * 12}% 20%, ${script.accent}24, transparent 65%), linear-gradient(145deg, transparent 25%, #665dff22)`}} />}
    <div style={{position: 'absolute', width: 650, height: 650, border: `1px solid ${script.accent}25`, borderRadius: '50%', right: -220, bottom: -210, transform: `scale(${1 + frame / 1800})`}} />
    <AbsoluteFill style={{padding: portrait ? '160px 85px 200px' : '90px 120px', justifyContent: 'space-between'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ffffff9c', fontSize: 20, letterSpacing: 4}}>
        <span>{script.title}</span><span style={{color: script.accent}}>●</span>
      </div>
      <div>
        <div style={{color: script.accent, fontSize: 20, letterSpacing: 5, marginBottom: 35}}>{scene.label ?? `${String(index + 1).padStart(2, '0')} / IN MOTION`}</div>
        <h1 style={textStyle}>{scene.animation === 'typewriter' ? <>{characters.slice(0, count).join('')}<span style={{color: script.accent, opacity: frame % 24 < 12 ? 1 : 0}}>▏</span></> : scene.text}</h1>
        <div style={{height: 6, width: 110 * intro, background: script.accent, marginTop: 42}} />
      </div>
      <div style={{display: 'flex', justifyContent: 'space-between', color: '#ffffff70', fontSize: 18, letterSpacing: 3}}><span>STORY IN MOTION</span><span>{String(index + 1).padStart(2, '0')} / {String(script.scenes.length).padStart(2, '0')}</span></div>
    </AbsoluteFill>
  </AbsoluteFill>;
}
export function Video({script}) {
  const frame = useCurrentFrame();
  const fadeFrames = Math.min(script.fps, Math.floor(script.durationInFrames / 2));
  return <AbsoluteFill style={{background: script.background, fontFamily: 'Arial, "Noto Sans", sans-serif'}}>
    {script.scenes.map((scene, i) => <Sequence key={i} from={scene.start} durationInFrames={scene.frames}><Scene scene={scene} index={i} script={script} /></Sequence>)}
    <div style={{position: 'absolute', bottom: 0, left: 0, height: 5, width: `${(frame + 1) / script.durationInFrames * 100}%`, background: script.accent}} />
    {script.music && <Audio src={staticFile(script.music.src)} loop volume={f => (script.music.volume ?? 0.18) * Math.min(interpolate(f, [0, fadeFrames], [0, 1], clamp), interpolate(f, [script.durationInFrames - fadeFrames, script.durationInFrames - 1], [1, 0], clamp))} />}
  </AbsoluteFill>;
}
