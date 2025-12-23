import { useMemo, useState } from 'react';
import { AudioEngine } from './audio/engine';
import { ControllerMapperView } from './ui/views/ControllerMapperView';
import { LoopBuilderView } from './ui/views/LoopBuilderView';
import { ArrangementView } from './ui/views/ArrangementView';
import { TransportBar } from './ui/components/TransportBar';
import { MidiClip, Project, Track } from './types';

const defaultProject: Project = {
  bpm: 100,
  tracks: [
    { id: 'track-1', name: 'Drums', volume: 0.8 },
    { id: 'track-2', name: 'Instrument', volume: 0.8 },
  ],
  clips: [],
  placements: [],
};

type ViewKey = 'mapper' | 'loop' | 'arrangement';

function App() {
  const [view, setView] = useState<ViewKey>('mapper');
  const [project, setProject] = useState<Project>(defaultProject);
  const engine = useMemo(() => new AudioEngine(project.bpm), []);

  const addClip = (clip: MidiClip) => {
    setProject((p) => ({ ...p, clips: [...p.clips, clip] }));
  };

  const addPlacement = (placement: Project['placements'][number]) => {
    setProject((p) => ({ ...p, placements: [...p.placements, placement] }));
  };

  const updateTrackVolume = (trackId: string, volume: number) => {
    setProject((p) => ({
      ...p,
      tracks: p.tracks.map((t) => (t.id === trackId ? { ...t, volume } : t)),
    }));
    engine.setTrackVolume(trackId, volume);
  };

  const addTrack = () => {
    const id = `track-${project.tracks.length + 1}`;
    const track: Track = { id, name: `Track ${project.tracks.length + 1}`, volume: 0.8 };
    setProject((p) => ({ ...p, tracks: [...p.tracks, track] }));
  };

  const updateBpm = (next: number) => {
    engine.transport.setBpm(next);
    setProject((p) => ({ ...p, bpm: next }));
  };

  return (
    <div className="app-shell">
      <header>
        <div className="flex-row">
          <strong>MPK mini mk3 Loop Builder</strong>
        </div>
        <nav>
          <button onClick={() => setView('mapper')} disabled={view === 'mapper'}>
            Controller Mapper
          </button>
          <button onClick={() => setView('loop')} disabled={view === 'loop'}>
            Loop Builder
          </button>
          <button onClick={() => setView('arrangement')} disabled={view === 'arrangement'}>
            Arrangement
          </button>
        </nav>
      </header>
      <TransportBar engine={engine} bpm={project.bpm} onBpmChange={updateBpm} />
      <main className="main-content">
        {view === 'mapper' && <ControllerMapperView engine={engine} />}
        {view === 'loop' && <LoopBuilderView engine={engine} onAddClip={addClip} />}
        {view === 'arrangement' && (
          <ArrangementView
            engine={engine}
            project={project}
            onAddTrack={addTrack}
            onPlaceClip={addPlacement}
            onVolumeChange={updateTrackVolume}
          />
        )}
      </main>
    </div>
  );
}

export default App;
