import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {normalizeScript, parseText} from '../src/config.js';
const root = fileURLToPath(new URL('../', import.meta.url));
async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    console.log('npm run render -- [input.json|input.txt] [output.mp4] [--format landscape|portrait] [--browser /path/to/chrome]');
    return;
  }
  const positional = []; const options = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      if (!['--format', '--browser'].includes(args[i]) || !args[i + 1] || args[i + 1].startsWith('--')) throw new Error(`Invalid option: ${args[i]}`);
      options[args[i].slice(2)] = args[++i];
    } else positional.push(args[i]);
  }
  if (positional.length > 2) throw new Error('Expected input file and output file only.');
  const input = path.resolve(positional[0] ?? path.join(root, 'examples/demo.json'));
  const outputLocation = path.resolve(positional[1] ?? path.join(root, 'out/demo.mp4'));
  if (!outputLocation.endsWith('.mp4')) throw new Error('Output must end in .mp4.');
  if (input === outputLocation) throw new Error('Input and output must differ.');
  const text = await fs.readFile(input, 'utf8');
  const data = input.endsWith('.txt') ? parseText(text) : JSON.parse(text);
  const script = normalizeScript({...data, ...(options.format ? {format: options.format} : {})});
  if (script.music) await fs.access(path.join(root, 'public', script.music.src));
  await fs.mkdir(path.dirname(outputLocation), {recursive: true});
  console.log(`Rendering ${script.format}: ${script.scenes.length} scenes, ${(script.durationInFrames / script.fps).toFixed(2)} seconds`);
  const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.jsx'), publicDir: path.join(root, 'public')});
  const browserExecutable = options.browser ?? process.env.REMOTION_BROWSER_EXECUTABLE;
  const inputProps = {script};
  const composition = await selectComposition({serveUrl, id: script.format === 'portrait' ? 'Portrait' : 'Landscape', inputProps, browserExecutable});
  let last = -1;
  await renderMedia({composition, serveUrl, inputProps, outputLocation, codec: 'h264', pixelFormat: 'yuv420p', crf: 18, browserExecutable, concurrency: 2, onProgress: ({progress}) => {
    const pct = Math.floor(progress * 10) * 10;
    if (pct !== last) {console.log(`${pct}%`); last = pct;}
  }});
  console.log(`Saved: ${outputLocation}`);
}
main().catch(error => {console.error(`Render failed: ${error.message}`); process.exit(1);});
