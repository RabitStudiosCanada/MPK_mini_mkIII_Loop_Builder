export type MidiMessage = {
  type: 'noteon' | 'noteoff' | 'cc';
  note?: number;
  velocity?: number;
  control?: number;
  value?: number;
  channel?: number;
  receivedAt: number;
};

export type PadConfig = {
  id: string;
  note: number;
  sampleName?: string;
  gain: number;
  chokeGroup?: number;
};

export type MidiEvent = {
  note: number;
  velocity: number;
  time: number; // seconds relative to clip start
};

export type MidiClip = {
  id: string;
  name: string;
  lengthBars: number;
  events: MidiEvent[];
};

export type ClipPlacement = {
  id: string;
  clipId: string;
  trackId: string;
  startBar: number;
  lengthBars: number;
};

export type Track = {
  id: string;
  name: string;
  volume: number;
  mute?: boolean;
};

export type Project = {
  bpm: number;
  tracks: Track[];
  clips: MidiClip[];
  placements: ClipPlacement[];
};

export type ControllerProfile = {
  id: string;
  name: string;
  deviceName?: string;
  padNotes: Record<string, number>;
  knobCCs: Record<string, number>;
  knobPage: 'mixer' | 'macros';
};
