#!/usr/bin/env python3
"""
Minimal SaaS Motion Graphics Sound Design & Master Soundtrack Generator
 Duration: 28.00s (840 frames @ 30 FPS)
Synchronized to S1 (0-120), S2 (120-270), S3 (270-450), S4 (450-600), S5 (600-720), S6 (720-840).
"""

import os
import subprocess
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, lfilter
import imageio_ffmpeg

SR = 44100
FPS = 30
TOTAL_FRAMES = 840
TOTAL_SECONDS = TOTAL_FRAMES / FPS  # 28.00s

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
AUDIO_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "audio"
)
os.makedirs(AUDIO_DIR, exist_ok=True)


def butter_filter(data, cutoff, btype="low", order=4):
    nyq = 0.5 * SR
    norm_cutoff = np.clip(cutoff / nyq, 0.001, 0.999)
    b, a = butter(order, norm_cutoff, btype=btype, analog=False)
    return lfilter(b, a, data, axis=0)


def save_audio(filename, stereo_float):
    peak = np.max(np.abs(stereo_float))
    if peak > 0.92:
        stereo_float = stereo_float * (0.92 / peak)
    pcm16 = (np.clip(stereo_float, -1.0, 1.0) * 32767.0).astype(np.int16)
    out_path = os.path.join(AUDIO_DIR, filename)
    if filename.endswith(".wav"):
        wavfile.write(out_path, SR, pcm16)
    else:
        tmp_wav = os.path.join(AUDIO_DIR, "_tmp.wav")
        wavfile.write(tmp_wav, SR, pcm16)
        subprocess.run(
            [FFMPEG, "-y", "-i", tmp_wav, "-codec:a", "libmp3lame", "-b:a", "192k", out_path],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        if os.path.exists(tmp_wav):
            os.remove(tmp_wav)
    print(f"Generated {out_path} ({len(stereo_float)/SR:.2f}s)")


def make_ui_click(freq=1450.0, dur=0.09):
    t = np.linspace(0, dur, int(SR * dur), endpoint=False)
    env = np.exp(-t * 65.0)
    sig = (np.sin(2 * np.pi * freq * t) + 0.45 * np.sin(2 * np.pi * freq * 1.9 * t)) * env
    return np.column_stack([sig, sig]) * 0.55


def make_strike_x():
    dur = 0.45
    t = np.linspace(0, dur, int(SR * dur), endpoint=False)
    f_sweep = 950.0 - 620.0 * (t / dur)
    phase = 2 * np.pi * np.cumsum(f_sweep) / SR
    env = np.exp(-t * 7.5) * np.minimum(1.0, t / 0.006)
    sig = np.sin(phase) * env * 0.55
    return np.column_stack([sig, sig * 0.95])


def make_orb_bloom():
    dur = 1.4
    t = np.linspace(0, dur, int(SR * dur), endpoint=False)
    env = np.exp(-t * 2.4) * np.minimum(1.0, t / 0.03)
    # Warm F-major9 glassy chord (#2F6BFF / #7FA8FF vibe)
    freqs = [174.61, 261.63, 349.23, 440.0, 523.25, 659.25]
    l = np.zeros_like(t)
    r = np.zeros_like(t)
    for i, f in enumerate(freqs):
        l += np.sin(2 * np.pi * f * t) * (0.22 / (1 + i * 0.25))
        r += np.sin(2 * np.pi * (f * 1.0015) * t + 0.25) * (0.22 / (1 + i * 0.25))
    sub = np.sin(2 * np.pi * 87.31 * t) * np.exp(-t * 3.2) * 0.4
    return np.column_stack([(l + sub) * env, (r + sub) * env]) * 0.75


def make_whoosh(dur=0.6):
    t = np.linspace(0, dur, int(SR * dur), endpoint=False)
    env = np.sin(np.pi * (t / dur)) ** 1.8
    rng = np.random.default_rng(77)
    noise = rng.normal(0, 1, (len(t), 2))
    filtered = butter_filter(noise, 1800, "low")
    filtered = butter_filter(filtered, 220, "high")
    f_glide = 140.0 + 220.0 * np.sin(np.pi * (t / dur))
    glide = np.sin(2 * np.pi * np.cumsum(f_glide) / SR) * env * 0.25
    return np.column_stack([filtered[:, 0] * env * 0.35 + glide, filtered[:, 1] * env * 0.35 + glide]) * 0.65


def make_clock_ticks():
    """Fast accelerating analog clock ticks across 2.8 seconds (frames 0..84 of S3)."""
    dur = 2.8
    n = int(SR * dur)
    out = np.zeros((n, 2), dtype=np.float32)
    # 18 accelerating ticks
    for i in range(18):
        prog = i / 18.0
        onset_s = dur * (1.0 - (1.0 - prog) ** 1.7)
        idx = int(onset_s * SR)
        tick = make_ui_click(freq=1100.0 + i * 45.0, dur=0.05)
        end = min(n, idx + len(tick))
        out[idx:end] += tick[: end - idx] * (0.35 + 0.35 * prog)
    return out


def make_zero_snap():
    """Crisp impact + chime when clock snaps to = 0."""
    dur = 0.9
    t = np.linspace(0, dur, int(SR * dur), endpoint=False)
    sub_f = 48.0 + 140.0 * np.exp(-t * 22.0)
    sub = np.sin(2 * np.pi * np.cumsum(sub_f) / SR) * np.exp(-t * 5.0) * 0.55
    chime = (
        0.3 * np.sin(2 * np.pi * 523.25 * t)
        + 0.22 * np.sin(2 * np.pi * 783.99 * t)
        + 0.15 * np.sin(2 * np.pi * 1046.50 * t)
    ) * np.exp(-t * 4.5)
    return np.column_stack([sub + chime, sub + chime]) * 0.8


def make_saas_bgm():
    """28.00s Minimal SaaS ambient & rhythmic pulse bed ( hard end at 28s, no fade )."""
    n = int(SR * TOTAL_SECONDS)
    t = np.linspace(0, TOTAL_SECONDS, n, endpoint=False)

    # Warm minimal SaaS pad (F2, C3, G3, A3, E4)
    lfo = 0.5 + 0.5 * np.sin(2 * np.pi * 0.12 * t)
    pad_l = (
        0.22 * np.sin(2 * np.pi * 87.31 * t)
        + 0.18 * np.sin(2 * np.pi * 130.81 * t)
        + 0.12 * np.sin(2 * np.pi * 196.00 * t) * lfo
        + 0.09 * np.sin(2 * np.pi * 220.00 * t)
        + 0.06 * np.sin(2 * np.pi * 329.63 * t) * (1.0 - lfo)
    )
    pad_r = (
        0.22 * np.sin(2 * np.pi * 87.31 * t)
        + 0.18 * np.sin(2 * np.pi * 130.85 * t + 0.2)
        + 0.12 * np.sin(2 * np.pi * 196.05 * t + 0.4) * (1.0 - lfo)
        + 0.09 * np.sin(2 * np.pi * 220.04 * t - 0.2)
        + 0.06 * np.sin(2 * np.pi * 329.70 * t + 0.5) * lfo
    )

    # Soft 120 BPM SaaS pluck pulse
    beat_env = (0.5 + 0.5 * np.sin(2 * np.pi * 2.0 * t)) ** 6
    pluck = np.sin(2 * np.pi * 261.63 * t) * beat_env * 0.08

    fade_in = np.minimum(1.0, t / 0.4)
    stereo = np.column_stack([(pad_l + pluck) * fade_in, (pad_r + pluck) * fade_in])
    return stereo * 0.22


def mix_at_frame(master, clip, frame_idx, gain=1.0):
    start_sample = int((frame_idx / FPS) * SR)
    if start_sample >= len(master):
        return
    end_sample = min(len(master), start_sample + len(clip))
    seg_len = end_sample - start_sample
    master[start_sample:end_sample] += clip[:seg_len] * gain


def main():
    bgm = make_saas_bgm()
    save_audio("bgm-bed.wav", bgm)

    master = bgm.copy()
    click = make_ui_click()
    strike = make_strike_x()
    orb = make_orb_bloom()
    whoosh = make_whoosh()
    ticks = make_clock_ticks()
    zero_snap = make_zero_snap()

    cues = [
        # S1 (0..120): Cursor selects pills (18, 34), blue X strike (48, 56), shatter + collapse (84, 105)
        (click, 18, 0.7),
        (click, 34, 0.7),
        (strike, 48, 0.65),
        (strike, 56, 0.65),
        (whoosh, 84, 0.6),
        (orb, 114, 0.7),
        # S2 (120..270): Orb bloom (120), 3 ribbon cards (138, 154, 170), camera push-through (246)
        (orb, 122, 0.8),
        (whoosh, 138, 0.5),
        (whoosh, 154, 0.5),
        (whoosh, 170, 0.5),
        (whoosh, 248, 0.75),
        # S3 (270..450): Fast clock ticks (272..354), prompt card + "= 0" snap (358), circle reveal (422)
        (ticks, 272, 0.85),
        (zero_snap, 358, 0.9),
        (whoosh, 424, 0.65),
        # S4 (450..600): Node graph Prompt (456) -> AI (480) -> Video phone open (518), match cut (576)
        (click, 456, 0.65),
        (orb, 480, 0.6),
        (whoosh, 518, 0.65),
        (whoosh, 578, 0.65),
        # S5 (600..720): Follow button click (642), comment click (671), type "A" (673), "I" (679), ripple wipe (694)
        (zero_snap, 642, 0.7),
        (click, 671, 0.65),
        (click, 674, 0.7),
        (click, 679, 0.8),
        (whoosh, 694, 0.75),
        # S6 (720..840): Paper-plane lift-off (724), notification stack + "Process + Link" (742)
        (whoosh, 724, 0.7),
        (orb, 742, 0.85),
    ]

    for clip, f_idx, gain in cues:
        mix_at_frame(master, clip, f_idx, gain=gain)

    master = np.tanh(master * 1.05) * 0.90
    save_audio("master-soundtrack.mp3", master)


if __name__ == "__main__":
    main()
