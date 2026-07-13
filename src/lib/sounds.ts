class SoundManager {
  private ctx: AudioContext | null = null;
  private emergencyOsc: OscillatorNode | null = null;
  private emergencyGain: GainNode | null = null;
  private emergencyInterval: any = null;
  private muted: boolean = false;

  private initCtx() {
    try {
      if (this.muted) return null;
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
        }
      }
      // Resume context if suspended (common browser security policy)
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch (e) {
      console.warn("AudioContext failed to initialize:", e);
      return null;
    }
  }

  toggleMute() {
    try {
      this.muted = !this.muted;
      if (this.muted) {
        this.stopEmergencySiren();
      }
      return this.muted;
    } catch (e) {
      return this.muted;
    }
  }

  isMuted() {
    return this.muted;
  }

  // 1. Digital click tick
  playClick() {
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.03);

      gainNode.gain.setValueAtTime(0.04, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch (e) {
      console.warn("playClick failed:", e);
    }
  }

  // 2. Rising Success Chime (Arpeggio)
  playSuccess() {
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
      const duration = 0.08;

      notes.forEach((freq, index) => {
        const timeOffset = index * 0.07;
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + timeOffset);

        gainNode.gain.setValueAtTime(0.08, ctx.currentTime + timeOffset);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + timeOffset + duration);

        osc.start(ctx.currentTime + timeOffset);
        osc.stop(ctx.currentTime + timeOffset + duration);
      });
    } catch (e) {
      console.warn("playSuccess failed:", e);
    }
  }

  // 3. Warning Chirps & Specialized Alarms
  playAlert() {
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const t = ctx.currentTime;
      [t, t + 0.12].forEach((time, index) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(index === 0 ? 880 : 1046.5, time);

        gainNode.gain.setValueAtTime(0.06, time);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

        osc.start(time);
        osc.stop(time + 0.1);
      });
    } catch (e) {
      console.warn("playAlert failed:", e);
    }
  }

  playSecurityAlarm() {
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const t = ctx.currentTime;
      for (let i = 0; i < 3; i++) {
        const time = t + i * 0.15;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(1200, time);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1500, time);

        gainNode.gain.setValueAtTime(0.025, time);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

        osc1.start(time);
        osc1.stop(time + 0.1);
        osc2.start(time);
        osc2.stop(time + 0.1);
      }
    } catch (e) {
      console.warn("playSecurityAlarm failed:", e);
    }
  }

  playMedicalAlarm() {
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const t = ctx.currentTime;
      const duration = 0.22;
      [660, 440, 660, 440].forEach((freq, index) => {
        const timeOffset = index * duration;
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + timeOffset);

        gainNode.gain.setValueAtTime(0.05, t + timeOffset);
        gainNode.gain.exponentialRampToValueAtTime(0.001, t + timeOffset + duration);

        osc.start(t + timeOffset);
        osc.stop(t + timeOffset + duration);
      });
    } catch (e) {
      console.warn("playMedicalAlarm failed:", e);
    }
  }

  playFacilityWarning() {
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const t = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(440, t);
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(443, t);

      gainNode.gain.setValueAtTime(0.07, t);
      gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

      osc1.start(t);
      osc1.stop(t + 0.45);
      osc2.start(t);
      osc2.stop(t + 0.45);
    } catch (e) {
      console.warn("playFacilityWarning failed:", e);
    }
  }

  playAlertByType(type: 'security' | 'medical' | 'crowd' | 'facility') {
    try {
      if (type === 'security') this.playSecurityAlarm();
      else if (type === 'medical') this.playMedicalAlarm();
      else if (type === 'facility') this.playFacilityWarning();
      else this.playAlert();
    } catch (e) {}
  }

  // 4. Low distress beacon pulse (SOS trigger)
  playSOS() {
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const t = ctx.currentTime;

      // Repeating pulse pattern
      for (let i = 0; i < 3; i++) {
        const timeOffset = i * 0.3;
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(330, t + timeOffset); // E4 tone

        gainNode.gain.setValueAtTime(0.12, t + timeOffset);
        gainNode.gain.exponentialRampToValueAtTime(0.001, t + timeOffset + 0.22);

        osc.start(t + timeOffset);
        osc.stop(t + timeOffset + 0.22);
      }
    } catch (e) {
      console.warn("playSOS failed:", e);
    }
  }

  // 5. Looping Evacuation Siren (Emergency State)
  startEmergencySiren() {
    try {
      const ctx = this.initCtx();
      if (!ctx || this.emergencyOsc) return;

      this.emergencyOsc = ctx.createOscillator();
      this.emergencyGain = ctx.createGain();

      this.emergencyOsc.connect(this.emergencyGain);
      this.emergencyGain.connect(ctx.destination);

      this.emergencyOsc.type = 'sawtooth';
      
      // Sweeping siren frequency
      this.emergencyOsc.frequency.setValueAtTime(450, ctx.currentTime);
      
      // Reduce volume for continuous alarm
      this.emergencyGain.gain.setValueAtTime(0.015, ctx.currentTime);

      this.emergencyOsc.start();

      // Modulator loop for the sweep
      let rising = true;
      this.emergencyInterval = setInterval(() => {
        try {
          if (!ctx || !this.emergencyOsc) return;
          
          const t = ctx.currentTime;
          if (rising) {
            this.emergencyOsc.frequency.linearRampToValueAtTime(850, t + 0.8);
          } else {
            this.emergencyOsc.frequency.linearRampToValueAtTime(450, t + 0.8);
          }
          rising = !rising;
        } catch (e) {}
      }, 850);
    } catch (e) {
      console.warn("startEmergencySiren failed:", e);
    }
  }

  stopEmergencySiren() {
    try {
      if (this.emergencyInterval) {
        clearInterval(this.emergencyInterval);
        this.emergencyInterval = null;
      }
      if (this.emergencyOsc) {
        try {
          this.emergencyOsc.stop();
        } catch (e) {}
        this.emergencyOsc.disconnect();
        this.emergencyOsc = null;
      }
      if (this.emergencyGain) {
        this.emergencyGain.disconnect();
        this.emergencyGain = null;
      }
    } catch (e) {
      console.warn("stopEmergencySiren failed:", e);
    }
  }

  // 6. Mode Switch Tones
  playFanModeSound() {
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const t = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, t); // C5
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, t + 0.08); // E5

      gainNode.gain.setValueAtTime(0.04, t);
      gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

      osc1.start(t);
      osc1.stop(t + 0.2);
      osc2.start(t + 0.08);
      osc2.stop(t + 0.2);
    } catch (e) {
      console.warn("playFanModeSound failed:", e);
    }
  }

  playStaffModeSound() {
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, t); // A3
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.1);

      gainNode.gain.setValueAtTime(0.08, t);
      gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

      osc.start(t);
      osc.stop(t + 0.1);
    } catch (e) {
      console.warn("playStaffModeSound failed:", e);
    }
  }

  playSecurityModeSound() {
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.exponentialRampToValueAtTime(1600, t + 0.15);

      gainNode.gain.setValueAtTime(0.02, t);
      gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      osc.start(t);
      osc.stop(t + 0.15);
    } catch (e) {
      console.warn("playSecurityModeSound failed:", e);
    }
  }

  playOrganizerModeSound() {
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const t = ctx.currentTime;
      const freqs = [130.81, 196.00, 261.63]; // C3, G3, C4
      freqs.forEach((f) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t);

        gainNode.gain.setValueAtTime(0.05, t);
        gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

        osc.start(t);
        osc.stop(t + 0.4);
      });
    } catch (e) {
      console.warn("playOrganizerModeSound failed:", e);
    }
  }

  playModeSound(role: string) {
    try {
      if (role === 'fan') this.playFanModeSound();
      else if (role === 'staff') this.playStaffModeSound();
      else if (role === 'security') this.playSecurityModeSound();
      else if (role === 'organizer') this.playOrganizerModeSound();
    } catch (e) {
      console.warn("playModeSound failed:", e);
    }
  }
}

// Export single instance for global app usage
export const soundManager = new SoundManager();
