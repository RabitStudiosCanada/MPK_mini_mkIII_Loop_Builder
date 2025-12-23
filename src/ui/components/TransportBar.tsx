import { AudioEngine } from '../../audio/engine';

export function TransportBar({
  engine,
  bpm,
  onBpmChange,
}: {
  engine: AudioEngine;
  bpm: number;
  onBpmChange: (bpm: number) => void;
}) {
  return (
    <div className="panel flex-row" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
      <div className="flex-row">
        <button onClick={() => engine.transport.start()}>Play</button>
        <button onClick={() => engine.transport.stop()}>Stop</button>
        <label style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
          BPM
          <input
            type="number"
            min={60}
            max={180}
            value={bpm}
            onChange={(e) => onBpmChange(parseInt(e.target.value, 10) || bpm)}
            style={{ width: '80px' }}
          />
        </label>
        <button onClick={() => engine.context.resume()}>Enable Audio</button>
      </div>
      <div className="flex-row">
        <label>
          Master Vol
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            defaultValue={0.8}
            onChange={(e) => engine.setMasterVolume(parseFloat(e.target.value))}
          />
        </label>
      </div>
    </div>
  );
}
