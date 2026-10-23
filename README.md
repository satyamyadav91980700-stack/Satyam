# Kinetic — Automated Motion Graphics Generator

Script likho → React/Remotion animations → H.264 MP4. JSON aur plain TXT dono supported hain. Modern bold typography, animated gradient, slide/fade/typewriter, scene crossfades, progress indicator aur optional music included.

## 1. Setup (apne computer par)

**Requirements:** Node.js 22 LTS + npm, internet on first install/browser download, and a Chrome-compatible OS. Windows, macOS ya Linux par terminal kholein.

```bash
git clone https://github.com/satyamyadav91980700-stack/Satyam.git
cd Satyam
git checkout arena/cd10630f-satyam
npm ci
```

`npm ci` lockfile se exact versions install karta hai. Is project mein Remotion/CLI/renderer/bundler **4.0.538** pinned hain. Naye blank project mein equivalent installation commands:

```bash
npm install remotion@4.0.538 @remotion/cli@4.0.538 @remotion/renderer@4.0.538 @remotion/bundler@4.0.538 react@19.1.0 react-dom@19.1.0
npm install -D typescript @types/react @types/react-dom
```

> First render ke time Remotion Chrome Headless Shell download kar sakta hai. Corporate firewall ho to download allow karein ya installed Chrome ka path `--browser` se dein. Linux par missing system libraries ho sakti hain; neeche troubleshooting dekhein. Remotion ki current licensing terms apne personal/commercial usage ke liye check karein.

## 2. Live preview / animation editing

```bash
npm run studio
```

Terminal mein diya URL kholein (normally `http://localhost:3000`). **Landscape** ya **Portrait** composition choose karein, play/seek karke preview dekhein. Studio dono compositions mein `examples/demo.json` load karta hai; file save karne par preview update hota hai. Kisi alag JSON ka CLI render us input file ko use karega, Studio default ko nahi badlega.

## 3. Demo render

```bash
npm run render
# equivalent:
npm run render -- examples/demo.json out/demo.mp4
```

Output: `out/demo.mp4`, **1920×1080**, 30 FPS, ~8.07 seconds. MP4 H.264/yuv420p hai, YouTube/Instagram-compatible. Rendering CPU aur script length par depend karegi.

```bash
# Reels / Shorts: 1080×1920
npm run render -- examples/demo.json out/reel.mp4 --format portrait
```

`out/` generated files Git mein track nahi hote.

## 4. Apni script se naya video

`examples/my-script.json` banayein:

```json
{
  "scenes": [
    {"text": "Welcome to our channel", "duration": 3},
    {"text": "Today we talk about...", "duration": 4}
  ]
}
```

```bash
npm run render -- examples/my-script.json out/my-video.mp4
npm run render -- examples/my-script.json out/my-reel.mp4 --format portrait
```

Full control ke liye:

```json
{
  "title": "MY CHANNEL",
  "format": "portrait",
  "fps": 30,
  "transition": 0.45,
  "background": "#090c18",
  "gradient": true,
  "accent": "#c5fc60",
  "scenes": [
    {
      "text": "Your story.\nIn motion.",
      "duration": 3,
      "animation": "slide",
      "label": "01 / START HERE",
      "color": "#ffffff"
    },
    {"text": "Make every word count.", "duration": 4, "animation": "typewriter"},
    {"text": "Subscribe for more!", "duration": 3, "animation": "fade", "background": "#15102a"}
  ]
}
```

| Field | Meaning / default |
|---|---|
| `text` | Required non-empty string; maximum 240 characters per scene |
| `duration` | Scene length in seconds, 1–60; default 3 |
| `animation` | `slide`, `fade`, `typewriter`; omitted → cycles between effects |
| `format` | `landscape` (1920×1080) / `portrait` (1080×1920) |
| `fps` | Integer 15–60; default 30 |
| `transition` | Crossfade overlap seconds, 0–2; default 0.45; 0 = hard cut |
| `gradient` | `true` = gradient overlay, `false` = solid background |
| `background` / `accent` | CSS color; use hex values for predictable results |
| `music` | Optional object; see below |

**Timing:** duration seconds ko frames mein round karte hain. Adjacent scenes overlap karte hain, isliye total duration = sum of scene frames − overlap × (scene count − 1). Overlap shortest scene ke one-third tak capped hai. 3+4 second sample → 196 frames / 30 ≈ 6.53 sec. First/last scene black mein fade nahi hote; inter-scene transitions crossfade hote hain.

**Readable layouts:** short phrases (roughly 5–15 words) best lagti hain. `\n` se intentional line breaks dein. Long paragraphs ko multiple scenes mein split karein. Font size text length se adjust hota hai, lekin extreme long words/240-character scenes ko Studio mein visually verify karein. Unicode Hindi text accepted hai; correct Devanagari glyph rendering ke liye system par Noto Sans Devanagari install karein aur `src/Video.jsx` ki font stack mein use add karein. Default demo English hai, external web-font download par depend nahi karta.

### Plain text file

`examples/script.txt`: har non-empty line ek scene, default 3 seconds. Blank lines ignored; animation automatically cycles.

```bash
npm run render -- examples/script.txt out/text-video.mp4
npm run render -- examples/script.txt out/text-reel.mp4 --format portrait
```

Custom duration, style ya music chahiye to JSON use karein. Yeh typography generator hai, AI script writer ya text-to-speech system nahi; voiceover generate nahi hota.

## 5. Background music (optional)

Apna licensed/royalty-free `track.mp3` (ya WAV) `public/music/` mein copy karein. JSON ke top level par add karein:

```json
"music": {"src": "music/track.mp3", "volume": 0.18}
```

`src` **public folder ke relative** hai; `public/` prefix, absolute path ya remote URL na dein. Volume 0–1 hai. Music video length tak loop/trim hota hai aur start/end par ~1-second fade hota hai. Music field remove karne par silent video banta hai. Music file bundled nahi hai; copyright/usage rights aap verify karein.

## 6. Folder structure / code guide

```text
src/
  index.jsx          # Landscape/Portrait compositions + dynamic metadata
  Video.jsx          # Scene graphics, animations, crossfade, progress + audio
  config.js          # Validation, defaults, seconds → frames, timeline
scripts/
  render.mjs         # JSON/TXT reader → bundle → selectComposition → renderMedia
examples/
  demo.json          # Styled 3-scene sample
  script.txt         # Plain text sample
public/music/        # Your optional audio files
tests/config.test.js # Timeline + validation tests
out/                 # Generated MP4s (ignored)
```

- Animation tuning: `src/Video.jsx` mein spring damping/stiffness, `interpolate` ranges aur typewriter timing badlein.
- Colors/labels/content: JSON se control karein.
- Resolution presets: `src/config.js` mein `FORMATS`; typography ke portrait/landscape paddings `Video.jsx` mein hain.
- Rendering: CLI validates input, builds React bundle, selects composition, then uses Remotion `renderMedia()` with H.264/CRF 18.

## 7. Checks & troubleshooting

```bash
npm test
npm run check
npm run render -- --help
```

- **Browser download blocked:** local installed Chrome executable use karein:
  ```bash
  npm run render -- examples/demo.json out/demo.mp4 --browser "/path/to/chrome"
  ```
  Or set environment variable `REMOTION_BROWSER_EXECUTABLE`. Windows example path: `C:\Program Files\Google\Chrome\Application\chrome.exe`; macOS: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`.
- **Debian/Ubuntu missing libraries:** `sudo apt-get update && sudo apt-get install -y libnss3 libnspr4 libgbm1 libasound2 libatk1.0-0 libatk-bridge2.0-0 libcups2 libxcomposite1 libxdamage1 libxrandr2` (package names can differ by distro). Then rerun.
- **Slow render / RAM:** `scripts/render.mjs` mein `concurrency: 2` ko `1` karein. First run mein bundling/browser setup extra time leta hai.
- **Music not found:** path `public/` ke relative check karein. Files `public/music/track.mp3` → `music/track.mp3`.
- **Invalid input:** terminal scene-specific validation error dikhayega; durations numeric honi chahiye, quoted strings nahi.
- Local Node rendering trusted scripts/media ke liye hai; is CLI ko directly untrusted public uploads ke saath expose na karein.
