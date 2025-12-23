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
    <div className="arrangement-panel">
      <div className="arrange-toolbar">
        <div className="flex-row" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={startPlayback}>Play</button>
          <button onClick={stopPlayback}>Stop</button>
          <button onClick={onAddTrack}>Add Track</button>
        </div>
        <div className="flex-row" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
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
      </div>

      <div className="bar-labels">
        <div className="bar-label-track">Track</div>
        <div className="bar-label-grid">
          {trackGrid.map((bar) => (
            <span key={`bar-${bar}`}>{bar}</span>
          ))}
        </div>
      </div>

      <div className="timeline-grid">
        {project.tracks.map((track) => (
          <div key={track.id} className="track-lane">
            <div className="track-label">
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
            <div className="track-grid" style={{ gridTemplateColumns: `repeat(${trackGrid.length}, minmax(20px, 1fr))` }}>
              {trackGrid.map((bar) => (
                <div key={`${track.id}-bar-${bar}`} className="bar-cell" />
              ))}
              {project.placements
                .filter((p) => p.trackId === track.id)
                .map((placement) => {
                  const clip = project.clips.find((c) => c.id === placement.clipId);
                  return (
                    <div
                      key={placement.id}
                      className="clip-block"
                      style={{ gridColumn: `${placement.startBar} / span ${placement.lengthBars || 1}`, margin: '4px' }}
                    >
                      <div className="wave-lines">
                        {Array.from({ length: 14 }).map((_, idx) => (
                          <span key={idx} style={{ height: `${6 + ((idx * 23) % 20)}px` }} />
                        ))}
                      </div>
                      {clip?.name ?? 'Clip'}
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
