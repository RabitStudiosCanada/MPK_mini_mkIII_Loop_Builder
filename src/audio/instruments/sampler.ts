export class SamplerInstrument {
  private context: AudioContext;

  constructor(context: AudioContext) {
    this.context = context;
  }

  playNote(note: number, velocity = 1, when?: number, destination?: AudioNode) {
    const freq = 440 * Math.pow(2, (note - 69) / 12);
    const osc = this.context.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;

    const amp = this.context.createGain();
    amp.gain.value = Math.max(0.05, velocity * 0.3);

    const dest = destination ?? this.context.destination;
    osc.connect(amp).connect(dest);
    const startTime = when ?? this.context.currentTime;
    osc.start(startTime);
    amp.gain.setValueAtTime(amp.gain.value, startTime);
    amp.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2);
    osc.stop(startTime + 1.2);
  }
}
