import { useMemo, useState } from 'react';
import { AudioEngine } from '../../audio/engine';
import { Project } from '../../types';

export function ArrangementView({
  engine,
  project,
  onAddTrack,
  onPlaceClip,
  onVolumeChange,
}: {
  engine: AudioEngine;
  project: Project;
  onAddTrack: () => void;
  onPlaceClip: (placement: Project['placements'][number]) => void;
  onVolumeChange: (trackId: string, volume: number) => void;
}) {
  const [selectedClip, setSelectedClip] = useState<string>('');
  const [startBar, setStartBar] = useState(1);

  const trackGrid = useMemo(() => Array.from({ length: 16 }).map((_, i) => i + 1), []);

  const place = () => {
    if (!selectedClip) return;
    onPlaceClip({
      id: `placement-${project.placements.length + 1}`,
      clipId: selectedClip,
      trackId: project.tracks[0]?.id ?? 'track-1',
      startBar,
      lengthBars: (project.clips.find((c) => c.id === selectedClip) ?? { lengthBars: 1 }).lengthBars,
    });
  };

  const startPlayback = () => {
    engine.transport.start();
    project.placements.forEach((placement) => {
      const clip = project.clips.find((c) => c.id === placement.clipId);
      if (clip) {
        engine.playClipOnTrack(clip, placement.trackId, placement.startBar - 1);
      }
    });
  };

  const stopPlayback = () => {
    engine.transport.stop();
  };

  return (
    <div className="grid">
      <section className="panel flex-row" style={{ justifyContent: 'space-between' }}>
        <div className="flex-row" style={{ gap: '0.5rem' }}>
          <button onClick={startPlayback}>Play Arrangement</button>
          <button onClick={stopPlayback}>Stop</button>
          <button onClick={onAddTrack}>Add Track</button>
        </div>
        <div className="flex-row" style={{ gap: '0.5rem' }}>
          <select value={selectedClip} onChange={(e) => setSelectedClip(e.target.value)}>
            <option value="">Select clip</option>
            {project.clips.map((clip) => (
              <option key={clip.id} value={clip.id}>
                {clip.name}
              </option>
            ))}
          </select>
          <label>
            Start bar
            <input type="number" min={1} max={64} value={startBar} onChange={(e) => setStartBar(parseInt(e.target.value, 10))} />
          </label>
          <button onClick={place}>Place Clip</button>
        </div>
      </section>

      <section className="panel">
        <h3>Timeline</h3>
        <div className="grid" style={{ gap: '0.75rem' }}>
          {project.tracks.map((track) => (
            <div key={track.id} className="track-lane">
              <div className="flex-col">
                <strong>{track.name}</strong>
                <label>
                  Volume
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={track.volume}
                    onChange={(e) => onVolumeChange(track.id, parseFloat(e.target.value))}
                  />
                </label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${trackGrid.length}, minmax(20px, 1fr))`, gap: '4px' }}>
                {trackGrid.map((bar) => (
                  <div key={bar} style={{ border: '1px solid #1f2633', minHeight: '36px', position: 'relative' }}>
                    {project.placements
                      .filter((p) => p.trackId === track.id && p.startBar === bar)
                      .map((placement) => {
                        const clip = project.clips.find((c) => c.id === placement.clipId);
                        return (
                          <div key={placement.id} className="clip-block" style={{ position: 'absolute', inset: '2px' }}>
                            {clip?.name ?? 'Clip'}
                          </div>
                        );
                      })}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
