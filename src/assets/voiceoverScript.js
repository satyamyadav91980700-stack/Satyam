/**
 * Source-of-Truth Hindi/Hinglish Script & Audio Manifest
 * Preserves the exact script, meaning, and CTA without adding or removing claims.
 */

export const FULL_HINDI_SCRIPT = `ये जो आप वीडियो देख रहे हो, ये किसी Alight Motion या After Effects में नहीं बनी है!

इस पूरी वीडियो को AI की मदद से बनाया गया है। Visuals से लेकर 3D Animation और Motion Graphics तक, सब कुछ AI से generate किया गया है।

और सबसे खास बात, इसे बनाने के लिए आपको घंटों बैठकर manual editing करने की जरूरत नहीं है।

अगर आप भी ऐसी शानदार वीडियो AI से बनाना चाहते हो और इसका पूरा process जानना चाहते हो, तो मुझे Follow करके Comment करो 'AI'।

मैं आपको इसका पूरा process बताऊंगा और लिंक सीधा आपके DM में भेज दूंगा!`;

export const SCENE_SCRIPTS = {
  scene1: {
    id: 'scene1',
    title: 'SCENE 1 — POWERFUL HOOK',
    voiceoverFile: 'audio/vo-scene-1.mp3',
    voiceoverDurationSec: 5.33,
    voiceoverOffsetFrames: 8,
    hindiText:
      'ये जो आप वीडियो देख रहे हो, ये किसी Alight Motion या After Effects में नहीं बनी है!',
    onScreenLabels: ['ALIGHT MOTION', 'AFTER EFFECTS'],
    captions: [
      { startFrame: 6, endFrame: 58, text: 'ये जो आप वीडियो देख रहे हो,', highlight: 'वीडियो' },
      { startFrame: 58, endFrame: 104, text: 'ये किसी Alight Motion', highlight: 'Alight Motion' },
      { startFrame: 104, endFrame: 140, text: 'या After Effects में', highlight: 'After Effects' },
      { startFrame: 140, endFrame: 178, text: 'नहीं बनी है!', highlight: 'नहीं बनी है!' },
    ],
  },
  scene2: {
    id: 'scene2',
    title: 'SCENE 2 — AI CREATES EVERYTHING',
    voiceoverFile: 'audio/vo-scene-2.mp3',
    voiceoverDurationSec: 3.37,
    voiceoverOffsetFrames: 8,
    hindiText: 'इस पूरी वीडियो को AI की मदद से बनाया गया है।',
    onScreenLabels: ['CREATED WITH AI'],
    captions: [
      { startFrame: 6, endFrame: 52, text: 'इस पूरी वीडियो को', highlight: 'पूरी वीडियो' },
      { startFrame: 52, endFrame: 120, text: 'AI की मदद से बनाया गया है।', highlight: 'AI की मदद से' },
    ],
  },
  scene3: {
    id: 'scene3',
    title: 'SCENE 3 — VISUALS, 3D ANIMATION AND MOTION GRAPHICS',
    voiceoverFile: 'audio/vo-scene-3.mp3',
    voiceoverDurationSec: 6.61,
    voiceoverOffsetFrames: 6,
    hindiText:
      'Visuals से लेकर 3D Animation और Motion Graphics तक, सब कुछ AI से generate किया गया है।',
    onScreenLabels: ['AI VISUALS', '3D ANIMATION', 'MOTION GRAPHICS'],
    captions: [
      { startFrame: 4, endFrame: 74, text: 'Visuals से लेकर', highlight: 'Visuals' },
      { startFrame: 74, endFrame: 149, text: '3D Animation और Motion Graphics तक,', highlight: '3D Animation' },
      { startFrame: 149, endFrame: 218, text: 'सब कुछ AI से generate किया गया है।', highlight: 'Motion Graphics' },
    ],
  },
  scene4: {
    id: 'scene4',
    title: 'SCENE 4 — NO HOURS OF MANUAL EDITING',
    voiceoverFile: 'audio/vo-scene-4.mp3',
    voiceoverDurationSec: 7.16,
    voiceoverOffsetFrames: 8,
    hindiText:
      'और सबसे खास बात, इसे बनाने के लिए आपको घंटों बैठकर manual editing करने की जरूरत नहीं है।',
    onScreenLabels: ['LESS MANUAL WORK', 'MORE CREATION'],
    captions: [
      { startFrame: 6, endFrame: 58, text: 'और सबसे खास बात,', highlight: 'खास बात' },
      { startFrame: 58, endFrame: 138, text: 'इसे बनाने के लिए आपको घंटों बैठकर', highlight: 'घंटों बैठकर' },
      { startFrame: 138, endFrame: 234, text: 'manual editing करने की जरूरत नहीं है।', highlight: 'manual editing' },
    ],
  },
  scene5: {
    id: 'scene5',
    title: 'SCENE 5 — FOLLOW AND COMMENT CTA',
    voiceoverFile: 'audio/vo-scene-5.mp3',
    voiceoverDurationSec: 9.8,
    voiceoverOffsetFrames: 8,
    hindiText:
      "अगर आप भी ऐसी शानदार वीडियो AI से बनाना चाहते हो और इसका पूरा process जानना चाहते हो, तो मुझे Follow करके Comment करो 'AI' ।",
    onScreenLabels: ['FOLLOW', 'COMMENT', 'AI'],
    captions: [
      { startFrame: 6, endFrame: 124, text: 'अगर आप भी ऐसी शानदार वीडियो AI से बनाना चाहते हो', highlight: 'शानदार वीडियो AI से' },
      { startFrame: 124, endFrame: 206, text: 'और इसका पूरा process जानना चाहते हो,', highlight: 'पूरा process' },
      { startFrame: 206, endFrame: 266, text: 'तो मुझे Follow करके', highlight: 'Follow' },
      { startFrame: 266, endFrame: 316, text: "Comment करो 'AI'", highlight: "'AI'" },
    ],
  },
  scene6: {
    id: 'scene6',
    title: 'SCENE 6 — DM LINK PAYOFF',
    voiceoverFile: 'audio/vo-scene-6.mp3',
    voiceoverDurationSec: 5.41,
    voiceoverOffsetFrames: 8,
    hindiText:
      'मैं आपको इसका पूरा process बताऊंगा और लिंक सीधा आपके DM में भेज दूंगा!',
    onScreenLabels: ['FULL PROCESS', 'LINK IN YOUR DM'],
    captions: [
      { startFrame: 6, endFrame: 80, text: 'मैं आपको इसका पूरा process बताऊंगा', highlight: 'पूरा process' },
      { startFrame: 80, endFrame: 192, text: 'और लिंक सीधा आपके DM में भेज दूंगा!', highlight: 'आपके DM में' },
    ],
  },
};

export const AUDIO_ASSETS = {
  masterSoundtrack: 'audio/master-soundtrack.mp3',
  voiceoverFull: 'audio/voiceover-full.mp3',
  bgmAmbience: 'audio/bgm-futuristic-ambience.mp3',
  sfxImpactDeep: 'audio/sfx-impact-deep.mp3',
  sfxSlashSweep: 'audio/sfx-slash-sweep.mp3',
  sfxWhooshSoft: 'audio/sfx-whoosh-soft.mp3',
  sfxDigitalPulse: 'audio/sfx-digital-pulse.mp3',
  sfxMechLock: 'audio/sfx-mech-lock.mp3',
  sfxCtaPop: 'audio/sfx-cta-pop.mp3',
  sfxDmRipple: 'audio/sfx-dm-ripple.mp3',
};
