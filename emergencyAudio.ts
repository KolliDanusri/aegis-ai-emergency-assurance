/**
 * AEGIS Emergency Alert Audio & Siren System
 * Implements high-urgency multi-tone audible siren using the Web Audio API.
 * Adheres strictly to browser autoplay policies and audio lifecycle constraints.
 */

class EmergencyAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private isMuted: boolean = false;
  private masterVolume: number = 0.9;
  private patternInterval: number | null = null;
  private activeOscillators: OscillatorNode[] = [];
  private activeGainNodes: GainNode[] = [];
  private listeners: Set<(isPlaying: boolean, autoplayBlocked: boolean) => void> = new Set();
  private autoplayBlocked: boolean = false;

  constructor() {
    // Lazy AudioContext initialization on first user gesture or explicit start
  }

  public subscribe(cb: (isPlaying: boolean, autoplayBlocked: boolean) => void): () => void {
    this.listeners.add(cb);
    cb(this.isPlaying, this.autoplayBlocked);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this.isPlaying, this.autoplayBlocked));
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    return this.ctx;
  }

  /**
   * Unlocks audio context on user gesture
   */
  public async unlockAudio(): Promise<boolean> {
    const ctx = this.initContext();
    if (!ctx) return false;
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
        this.autoplayBlocked = false;
        this.notify();
        return true;
      } catch (err) {
        console.warn('[AEGIS Audio] Failed to resume suspended audio context:', err);
        this.autoplayBlocked = true;
        this.notify();
        return false;
      }
    }
    this.autoplayBlocked = false;
    this.notify();
    return true;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getAutoplayBlocked(): boolean {
    return this.autoplayBlocked;
  }

  public setVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
  }

  /**
   * Plays a single high-priority emergency beep burst:
   * Dual frequency (960Hz & 850Hz) for cutting through environmental noise
   */
  private playBeepBurst(ctx: AudioContext, startTime: number, duration: number = 0.18) {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(960, startTime);
    osc1.frequency.exponentialRampToValueAtTime(800, startTime + duration);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(850, startTime);

    const targetGain = this.isMuted ? 0 : this.masterVolume * 0.85;
    gainNode.gain.setValueAtTime(0.001, startTime);
    gainNode.gain.linearRampToValueAtTime(targetGain, startTime + 0.02);
    gainNode.gain.setValueAtTime(targetGain, startTime + duration - 0.03);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);

    this.activeOscillators.push(osc1, osc2);
    this.activeGainNodes.push(gainNode);

    // Clean up references when done
    setTimeout(() => {
      this.activeOscillators = this.activeOscillators.filter((o) => o !== osc1 && o !== osc2);
      this.activeGainNodes = this.activeGainNodes.filter((g) => g !== gainNode);
    }, duration * 1000 + 100);
  }

  /**
   * Executes the standardized emergency pattern:
   * BEEP — BEEP — BEEP [short pause] BEEP — BEEP — BEEP [long pause]
   */
  private executeEmergencyCycle(ctx: AudioContext) {
    const now = ctx.currentTime + 0.05;
    const beepLen = 0.22;
    const gap = 0.12;

    // Cluster 1 (3 beeps)
    this.playBeepBurst(ctx, now, beepLen);
    this.playBeepBurst(ctx, now + beepLen + gap, beepLen);
    this.playBeepBurst(ctx, now + (beepLen + gap) * 2, beepLen);

    // Inter-cluster pause: 0.4s
    const cluster2Start = now + (beepLen + gap) * 3 + 0.35;

    // Cluster 2 (3 beeps)
    this.playBeepBurst(ctx, cluster2Start, beepLen);
    this.playBeepBurst(ctx, cluster2Start + beepLen + gap, beepLen);
    this.playBeepBurst(ctx, cluster2Start + (beepLen + gap) * 2, beepLen);

    // Trigger physical vibration where supported
    this.triggerVibration();
  }

  /**
   * Starts playing the emergency alarm loop.
   */
  public async playEmergencyAlert(): Promise<boolean> {
    if (this.isPlaying) return true;

    const ctx = this.initContext();
    if (!ctx) {
      console.warn('[AEGIS Audio] AudioContext unsupported');
      return false;
    }

    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (e) {
        this.autoplayBlocked = true;
        this.notify();
        return false;
      }
    }

    this.isPlaying = true;
    this.autoplayBlocked = false;
    this.notify();

    // Run first emergency cycle immediately
    this.executeEmergencyCycle(ctx);

    // Repeat every 2.4 seconds
    this.patternInterval = window.setInterval(() => {
      if (!this.isPlaying || !this.ctx) return;
      this.executeEmergencyCycle(this.ctx);
    }, 2400);

    return true;
  }

  /**
   * Stops the emergency siren immediately.
   */
  public stopEmergencyAlert() {
    this.isPlaying = false;
    if (this.patternInterval !== null) {
      clearInterval(this.patternInterval);
      this.patternInterval = null;
    }

    // Stop active oscillators
    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // ignore already stopped
      }
    });
    this.activeOscillators = [];

    this.activeGainNodes.forEach((gain) => {
      try {
        gain.disconnect();
      } catch {
        // ignore
      }
    });
    this.activeGainNodes = [];

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(0); // Stop vibration
    }

    this.notify();
  }

  /**
   * Replays the emergency alert
   */
  public async replayEmergencyAlert(): Promise<boolean> {
    this.stopEmergencyAlert();
    return this.playEmergencyAlert();
  }

  /**
   * Emergency Alert Test: Plays one single emergency cycle (2 clusters of 3 beeps) and stops
   */
  public async testEmergencyAlert(): Promise<boolean> {
    this.stopEmergencyAlert();
    const ctx = this.initContext();
    if (!ctx) return false;
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        this.autoplayBlocked = true;
        this.notify();
        return false;
      }
    }

    this.isPlaying = true;
    this.notify();
    this.executeEmergencyCycle(ctx);

    // Stop automatically after one full test cycle (2.2s)
    setTimeout(() => {
      this.stopEmergencyAlert();
    }, 2200);

    return true;
  }

  /**
   * Trigger device vibration in an urgent cadence
   */
  public triggerVibration(): boolean {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        // [vibrate, pause, vibrate, pause, long vibrate]
        return navigator.vibrate([250, 100, 250, 100, 500, 200, 250, 100, 250]);
      } catch {
        return false;
      }
    }
    return false;
  }

  /**
   * Speech synthesizer for text-to-speech reading of emergency alerts
   */
  public speakText(
    text: string,
    lang: string = 'en-US',
    rate: number = 0.95
  ): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = rate; // Slightly slower for crisp urgency
      utterance.pitch = 1.05;
      utterance.volume = this.masterVolume;

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      window.speechSynthesis.speak(utterance);
    });
  }

  public stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const emergencyAudio = new EmergencyAudioEngine();
