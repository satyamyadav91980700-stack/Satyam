# AI Motion Graphics Reel — Remotion 3D Production (`1080×1920`, `30 FPS`)

A complete, art-directed 3D motion graphics Instagram Reel (`9:16`, `1080×1920`, `30 FPS`, `1,314 frames / 43.80s`) built in **Remotion** (`4.0.242`) from the Hindi/Hinglish source script.

---

## 1. Video Specifications

| Property | Value |
| --- | --- |
| **Composition ID** | `AIMotionReel` |
| **Aspect Ratio** | `9:16` (Vertical Mobile / Instagram Reels) |
| **Resolution** | `1080 × 1920` |
| **Frame Rate** | `30 FPS` |
| **Total Duration** | `1,314 frames` (`43.80 seconds`) |
| **Rendered Output** | `ai-motion-graphics-reel.mp4` & `public/rendered/ai-motion-graphics-reel.mp4` (`H.264 High@L4.0 + AAC 192kbps`) |

---

## 2. Color Palette & Visual Art Direction

- **Primary Background**: Deep cinematic black `#05060B`
- **Secondary Background**: Dark navy `#0A1020`
- **Primary Accent**: Electric blue `#397BFF`
- **Secondary Accent**: Neon purple `#9B5CFF`
- **Highlight**: Cool white `#F5F7FF`
- **Selective Accents**: Cyan `#22D3EE`, violet `#7C3AED`, and crimson `#F43F5E` (for the diagonal separation slash in Scene 1)

---

## 3. Scene-by-Scene Storyboard & Frame Timing

| Scene | Frame Range | Duration | Spoken Hindi/Hinglish Script | On-Screen Labels & Visual Direction |
| --- | --- | --- | --- | --- |
| **Scene 1 — Powerful Hook** (`SceneHook.jsx`) | `0 – 186` | `6.20s` (`186f`) | *"ये जो आप वीडियो देख रहे हो, ये किसी Alight Motion या After Effects में नहीं बनी है!"* | `ALIGHT MOTION`, `AFTER EFFECTS` — 3D vertical smartphone & floating 3D timeline emerge from `#05060B` darkness; opposing 3D software reference monuments enter; dramatic diagonal energy sweep separates them as the camera pushes in. |
| **Scene 2 — AI Creates Everything** (`SceneAI.jsx`) | `186 – 315` | `4.30s` (`129f`) | *"इस पूरी वीडियो को AI की मदद से बनाया गया है।"* | `CREATED WITH AI` — Smartphone morphs into a 3D icosahedral AI core; 3-layer depth field (foreground bokeh particles converging, midground polyhedral AI core, background 3D neural network); 14-slice 3D extruded title reveal. |
| **Scene 3 — Visuals, 3D Animation & Motion Graphics** (`Scene3D.jsx`) | `315 – 540` | `7.50s` (`225f`) | *"Visuals से लेकर 3D Animation और Motion Graphics तक, सब कुछ AI से generate किया गया है।"* | Three connected moments linked by spatial camera travel (`0 → 1080 → 2160`): **Moment A** (`AI VISUALS`, `f:0–75`) procedural 3D terrain canvas; **Moment B** (`3D ANIMATION`, `f:75–150`) 20-shard 3D polyhedron rotating, aligning along guide vectors & locking together; **Moment C** (`MOTION GRAPHICS`, `f:150–225`) synchronized orbital rings, Bezier motion paths & kinetic 3D type. |
| **Scene 4 — No Hours of Manual Editing** (`SceneWorkflow.jsx`) | `540 – 783` | `8.10s` (`243f`) | *"और सबसे खास बात, इसे बनाने के लिए आपको घंटों बैठकर manual editing करने की जरूरत नहीं है।"* | `LESS MANUAL WORK` → `MORE CREATION` — 3D multi-track timeline with scattered clips & keyframes that automatically align and snap into a master composition as an AI energy pulse sweeps across the tracks. |
| **Scene 5 — Follow & Comment CTA** (`SceneCTA.jsx`) | `783 – 1107` | `10.80s` (`324f`) | *"अगर आप भी ऐसी शानदार वीडियो AI से बनाना चाहते हो और इसका पूरा process जानना चाहते हो, तो मुझे Follow करके Comment करो 'AI'।"* | `FOLLOW`, `COMMENT`, `AI` — Staggered 4-step sequence: (1) 3D Follow button appears & responds to click interaction, (2) 3D Comment bubble enters, (3) large extruded `AI` pops into center, (4) controlled radial light pulses emphasize `AI` with strict particle exclusion zone. |
| **Scene 6 — DM Link Payoff** (`SceneDM.jsx`) | `1107 – 1314` | `6.90s` (`207f`) | *"मैं आपको इसका पूरा process बताऊंगा और लिंक सीधा आपके DM में भेज दूंगा!"* | `FULL PROCESS`, `LINK IN YOUR DM` — 3D direct-message envelope/capsule with glowing 3D chain-link emblem glides toward camera, triggering concentric arrival ripples, held comfortably before a controlled glow fade to `#05060B` black. |

---

## 4. Project Architecture

```text
src/
  index.js                   # Remotion root entry point
  Root.jsx                   # Remotion <Composition> definitions (AIMotionReel + 6 scene compositions)
  MainVideo.jsx              # Master sequence & synchronized audio orchestrator
  preview-main.jsx           # Interactive @remotion/player studio web preview
  components/
    SceneHook.jsx            # Scene 1: Powerful Hook (0..186)
    SceneAI.jsx              # Scene 2: AI Creates Everything (186..315)
    Scene3D.jsx              # Scene 3: Visuals, 3D Animation & Motion Graphics (315..540)
    SceneWorkflow.jsx        # Scene 4: No Hours of Manual Editing (540..783)
    SceneCTA.jsx             # Scene 5: Follow and Comment 'AI' CTA (783..1107)
    SceneDM.jsx              # Scene 6: DM Link Payoff (1107..1314)
    AnimatedText.jsx         # 3D extruded titles, HUD badges & HarfBuzz Hindi caption bar
    ThreeDObject.jsx         # Mathematical 3D polyhedral meshes, Blinn-Phong lighting, 3D phone & monuments
    ParticleField.jsx        # Deterministic 3-layer 3D depth-sorted particle field
    Transition.jsx           # Diagonal energy sweep & scene boundary transitions
    CinematicSvgDefs.jsx     # Shared radial/linear lighting gradients
  utils/
    timing.js                # Central frame timing, safe margins & timeline validation
    animation.js             # Deterministic spring(), interpolate() & 3D projection math
  assets/
    palette.js               # Color palette & typography tokens
    voiceoverScript.js       # Source Hindi script, scene caption cues & audio manifest
    hindiCaptionPaths.js     # HarfBuzz-shaped SVG glyph paths for Hindi/Hinglish captions
public/
  audio/                     # Generated Hindi voiceovers (vo-scene-1..6.mp3), SFX stems & master-soundtrack.mp3
  fonts/                     # Bundled Space Grotesk, Inter & Noto Sans Devanagari / Hind TTF fonts
  rendered/                  # Rendered MP4 (ai-motion-graphics-reel.mp4) & verification PNG stills
```

---

## 5. Running & Rendering Instructions

```bash
# 1. Start the live interactive Remotion Player studio preview (port 3000)
npm run dev

# 2. Verify timeline integrity, assets, and rendered MP4 specifications
npm run verify

# 3. Rebuild procedural sound design & master soundtrack
npm run audio:build

# 4. Render the full 1080x1920 @ 30fps MP4 video and verification stills
npm run render
```
