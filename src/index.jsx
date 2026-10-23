import React from 'react';
import {Composition, registerRoot} from 'remotion';
import demo from '../examples/demo.json';
import {FORMATS, normalizeScript} from './config.js';
import {Video} from './Video.jsx';
function Root() {
  return <>{Object.keys(FORMATS).map(format => {
    const script = normalizeScript({...demo, format});
    return <Composition key={format} id={format === 'landscape' ? 'Landscape' : 'Portrait'} component={Video} {...FORMATS[format]} fps={script.fps} durationInFrames={script.durationInFrames} defaultProps={{script}} calculateMetadata={({props}) => ({durationInFrames: props.script.durationInFrames, fps: props.script.fps})} />;
  })}</>;
}
registerRoot(Root);
