import { useEffect, useState } from 'react';
import { AudioEngine } from '../../audio/engine';
import { MidiClip, MidiEvent, PadConfig } from '../../types';

const defaultPads: PadConfig[] = Array.from({ length: 8 }).map((_, idx) => ({
  id: `pad-${idx + 1}`,
  note: 36 + idx,
  gain: 0.8,
}));

type PadState = PadConfig & { buffer?: AudioBuffer };

type RecorderState = {
  isRecording: boolean;
  events: MidiEvent[];
  startTime: number;
};

export function LoopBuilderView({
  engine,
  onAddClip,
}: {
  engine: AudioEngine;
  onAddClip: (clip: MidiClip) => void;
}) {
  const [pads, setPads] = useState<PadState[]>(defaultPads);
  const [clipLength, setClipLength] = useState(1);
  const [quantize, setQuantize] = useState(true);
  const [recorder, setRecorder] = useState<RecorderState>({ isRecording: false, events: [], startTime: 0 });
  const [clips, setClips] = useState<MidiClip[]>([]);

  const handlePadTrigger = (pad: PadState) => {
    engine.triggerPad(pad, pad.buffer);
    if (recorder.isRecording) {
      const now = engine.context.currentTime;
      const time = now - recorder.startTime;
      const quantizeStep = quantize ? engine.transport.secondsPerBeat() / 4 : 0;
      const quantizedTime = quantize ? Math.round(time / quantizeStep) * quantizeStep : time;
      const evt: MidiEvent = { note: pad.note, velocity: 100, time: quantizedTime };
      setRecorder((r) => ({ ...r, events: [...r.events, evt] }));
    }
  };

  const loadSample = async (padId: string, file: File) => {
    const arrayBuf = await file.arrayBuffer();
    const audioBuf = await engine.context.decodeAudioData(arrayBuf);
    setPads((prev) => prev.map((p) => (p.id === padId ? { ...p, buffer: audioBuf, sampleName: file.name } : p)));
  };

  const toggleRecording = () => {
    if (!recorder.isRecording) {
      engine.transport.start();
      setRecorder({ isRecording: true, events: [], startTime: engine.context.currentTime });
    } else {
      engine.transport.stop();
      const clip: MidiClip = {
        id: `clip-${clips.length + 1}`,
        name: `Clip ${clips.length + 1}`,
        lengthBars: clipLength,
        events: recorder.events,
      };
      setRecorder({ isRecording: false, events: [], startTime: 0 });
      setClips((prev) => [...prev, clip]);
      onAddClip(clip);
    }
  };

  useEffect(() => {
    engine.context.resume();
  }, [engine]);

  return (
    <div className="grid">
      <section className="panel">
        <h2>Drum Rack</h2>
        <div className="pad-grid">
          {pads.map((pad) => (
            <div key={pad.id} className="pad-card">
              <div className="flex-row" style={{ justifyContent: 'space-between' }}>
                <strong>{pad.id.toUpperCase()}</strong>
                <span className="badge">Note {pad.note}</span>
              </div>
              <p>{pad.sampleName ?? 'Sine fallback'}</p>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => e.target.files && loadSample(pad.id, e.target.files[0])}
              />
              <label>
                Gain
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={pad.gain}
                  onChange={(e) =>
                    setPads((prev) => prev.map((p) => (p.id === pad.id ? { ...p, gain: parseFloat(e.target.value) } : p)))
                  }
                />
              </label>
              <button onClick={() => handlePadTrigger(pad)}>Trigger</button>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h3>Loop Recorder</h3>
        <div className="flex-row">
          <label>
            Length (bars)
            <input type="number" min={1} max={8} value={clipLength} onChange={(e) => setClipLength(parseInt(e.target.value, 10))} />
          </label>
          <label className="flex-row" style={{ gap: '0.25rem' }}>
            <input type="checkbox" checked={quantize} onChange={(e) => setQuantize(e.target.checked)} /> Quantize 1/16
          </label>
          <button onClick={toggleRecording}>{recorder.isRecording ? 'Stop' : 'Record'}</button>
        </div>
        <p>Record pad hits into a MIDI loop synced to the transport BPM.</p>
      </section>

      <section className="panel">
        <h3>Saved Clips</h3>
        <div className="grid">
          {clips.length === 0 && <p>No clips yet.</p>}
          {clips.map((clip) => (
            <div key={clip.id} className="clip-block">
              {clip.name} · {clip.events.length} notes · {clip.lengthBars} bars
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
