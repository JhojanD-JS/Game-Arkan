

import { safeLocalStorage } from "./utils.js";

class AudioManager {
  constructor() {
    this.muted = safeLocalStorage("get", "arkanoid_muted") === "true";
    this.ctx = null;
  }

  _ensureCtx() {
    if (!this.ctx)
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === "suspended") this.ctx.resume();
  }

  playOsc(type, freq, dur, vol) {
    if (this.muted) return;
    this._ensureCtx();
    let osc = this.ctx.createOscillator();
    let gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + dur);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + dur);
  }

  playBounceWall() {
    this.playOsc("square", 220, 0.08, 0.12);
  }
  playBouncePaddle() {
    this.playOsc("square", 330, 0.1, 0.18);
  }

  playBrickDestroyed() {
    if (this.muted) return;
    this._ensureCtx();
    let osc = this.ctx.createOscillator();
    let gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      220,
      this.ctx.currentTime + 0.15,
    );
    gain.gain.setValueAtTime(0.22, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  playBrickHit() {
    if (this.muted) return;
    this._ensureCtx();
    let dur = 0.05;
    let bufferSize = this.ctx.sampleRate * dur;
    let buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    let data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    let noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    let gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.07, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + dur);
    noise.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
  }

  playPowerUp() {
    if (this.muted) return;
    this._ensureCtx();
    const freqs = [523, 659, 784];
    freqs.forEach((f, i) => {
      let t = this.ctx.currentTime + i * 0.06;
      let osc = this.ctx.createOscillator();
      let gain = this.ctx.createGain();
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.1);
    });
  }

  playExtraLife() {
    if (this.muted) return;
    this._ensureCtx();
    const freqs = [523, 659, 784, 1047];
    freqs.forEach((f, i) => {
      let t = this.ctx.currentTime + i * 0.05;
      let osc = this.ctx.createOscillator();
      let gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.12);
    });
  }

  playLifeLost() {
    if (this.muted) return;
    this._ensureCtx();
    let osc = this.ctx.createOscillator();
    let gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      110,
      this.ctx.currentTime + 0.4,
    );
    gain.gain.setValueAtTime(0.28, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }

  playLevelComplete() {
    if (this.muted) return;
    this._ensureCtx();
    const freqs = [523, 587, 659, 784, 1047];
    freqs.forEach((f, i) => {
      let t = this.ctx.currentTime + i * 0.07;
      let osc = this.ctx.createOscillator();
      let gain = this.ctx.createGain();
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.09);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.09);
    });
  }

  toggle() {
    this.muted = !this.muted;
    safeLocalStorage("set", "arkanoid_muted", this.muted ? "true" : "false");
  }
}

export const audioManager = new AudioManager();

export function initAudioEvents() {
  window.addEventListener("click", () => audioManager._ensureCtx(), {
    once: true,
  });
  window.addEventListener("keydown", () => audioManager._ensureCtx(), {
    once: true,
  });
  window.addEventListener("touchstart", () => audioManager._ensureCtx(), {
    once: true,
  });
}
