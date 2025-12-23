export type TransportListener = (time: number, bar: number) => void;

export class Transport {
  private audioContext: AudioContext;
  private lookahead = 0.1;
  private interval?: number;
  private startTime = 0;
  private barDuration = 0;
  private listeners: Set<TransportListener> = new Set();
  public bpm: number;
  public isPlaying = false;

  constructor(audioContext: AudioContext, bpm = 100) {
    this.audioContext = audioContext;
    this.bpm = bpm;
    this.updateBarDuration();
  }

  private updateBarDuration() {
    // Assume 4/4
    this.barDuration = (60 / this.bpm) * 4;
  }

  setBpm(next: number) {
    this.bpm = Math.max(40, Math.min(200, next));
    this.updateBarDuration();
  }

  on(listener: TransportListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  start() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.startTime = this.audioContext.currentTime;
    let lastBar = -1;
    this.interval = window.setInterval(() => {
      const now = this.audioContext.currentTime;
      const elapsed = now - this.startTime;
      const bar = Math.floor(elapsed / this.barDuration);
      if (bar !== lastBar) {
        lastBar = bar;
        this.listeners.forEach((cb) => cb(now, bar));
      }
    }, this.lookahead * 1000);
  }

  stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    if (this.interval) window.clearInterval(this.interval);
  }

  currentTime() {
    if (!this.isPlaying) return 0;
    return this.audioContext.currentTime - this.startTime;
  }

  currentBar() {
    return this.currentTime() / this.barDuration;
  }

  secondsPerBeat() {
    return 60 / this.bpm;
  }

  getBarDuration() {
    return this.barDuration;
  }
}
