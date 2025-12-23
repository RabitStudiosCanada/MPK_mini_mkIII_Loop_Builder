import { MidiClip, PadConfig } from '../types';
import { Transport } from './transport';
import { SamplerInstrument } from './instruments/sampler';

export type TrackState = {
  id: string;
  gain: GainNode;
};

export class AudioEngine {
  public context: AudioContext;
  public transport: Transport;
  private masterGain: GainNode;
  private tracks: Map<string, TrackState> = new Map();
  private sampler: SamplerInstrument;

  constructor(bpm = 100) {
    this.context = new AudioContext();
    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = 0.8;
    this.masterGain.connect(this.context.destination);
    this.transport = new Transport(this.context, bpm);
    this.sampler = new SamplerInstrument(this.context);
  }

  ensureTrack(id: string) {
    if (this.tracks.has(id)) return this.tracks.get(id)!;
    const gain = this.context.createGain();
    gain.gain.value = 0.8;
    gain.connect(this.masterGain);
    const track = { id, gain };
    this.tracks.set(id, track);
    return track;
  }

  setTrackVolume(id: string, volume: number) {
    const track = this.ensureTrack(id);
    track.gain.gain.value = volume;
  }

  setMasterVolume(volume: number) {
    this.masterGain.gain.value = volume;
  }

  triggerPad(pad: PadConfig, buffer?: AudioBuffer) {
    if (buffer) {
      const source = this.context.createBufferSource();
      source.buffer = buffer;
      const gain = this.context.createGain();
      gain.gain.value = pad.gain;
      source.connect(gain).connect(this.masterGain);
      source.start();
    } else {
      this.sampler.playNote(pad.note, pad.gain);
    }
  }

  playClipOnTrack(clip: MidiClip, trackId: string, startAtBar: number) {
    const track = this.ensureTrack(trackId);
    const barStartTime = this.transport.currentTime() + startAtBar * this.transport.getBarDuration();
    clip.events.forEach((evt) => {
      const startTime = barStartTime + evt.time;
      this.sampler.playNote(evt.note, evt.velocity / 127, startTime, track.gain);
    });
  }
}
